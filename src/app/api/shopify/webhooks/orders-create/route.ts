// POST — inbound from Shopify when any order is placed
// HMAC verified before any processing — never skip this

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyShopifyWebhook } from '@/lib/shopify/shopifyWebhooks'
import type { ShopifyOrder, ShopifyLineItem } from '@/lib/shopify/shopifyTypes'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''
  const shopDomain = request.headers.get('x-shopify-shop-domain') ?? ''

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const order: ShopifyOrder = JSON.parse(rawBody)
  const supabase = createAdminClient()

  const { data: connection } = await supabase
    .from('shopify_connections')
    .select('user_id')
    .eq('shop_domain', shopDomain)
    .eq('is_active', true)
    .single()

  if (!connection) {
    return NextResponse.json({ ok: true })
  }

  const userId = connection.user_id
  const customerPhone = order.customer?.phone ?? order.shipping_address?.phone ?? null
  let contactId: string | null = null

  if (customerPhone) {
    const normalizedPhone = normalizeIndianPhone(customerPhone)
    const customerName = [order.customer?.first_name, order.customer?.last_name]
      .filter(Boolean).join(' ')

    // Upsert contact — ignoreDuplicates: true so we don't overwrite existing data
    await supabase
      .from('contacts')
      .upsert({
        user_id: userId,
        phone: normalizedPhone,
        name: customerName || null,
        email: order.customer?.email ?? null,
        last_order_at: order.created_at,
      }, { onConflict: 'user_id,phone', ignoreDuplicates: true })

    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('phone', normalizedPhone)
      .single()

    if (contact) {
      contactId = contact.id
      // Increment order stats
      await supabase.rpc('increment_contact_orders', {
        p_contact_id: contactId,
        p_order_value: parseFloat(order.total_price),
        p_order_date: order.created_at,
      })
    }
  }

  // Save order
  await supabase
    .from('orders')
    .upsert({
      user_id: userId,
      shopify_order_id: String(order.id),
      shopify_order_number: order.name,
      contact_id: contactId,
      customer_phone: customerPhone ? normalizeIndianPhone(customerPhone) : null,
      customer_name: [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ') || null,
      customer_email: order.customer?.email ?? null,
      total_price: parseFloat(order.total_price),
      currency: order.currency,
      payment_gateway: order.gateway,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status ?? 'unfulfilled',
      line_items: order.line_items.map((item: ShopifyLineItem) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        variant_title: item.variant_title,
      })),
      shipping_address: order.shipping_address,
      shopify_created_at: order.created_at,
      shopify_updated_at: order.updated_at,
    }, { onConflict: 'user_id,shopify_order_id' })

  // Queue automations
  const automations: Record<string, unknown>[] = []

  if (contactId && customerPhone) {
    const normalizedPhone = normalizeIndianPhone(customerPhone)
    const firstName = order.customer?.first_name ?? 'there'

    automations.push({
      user_id: userId,
      event_type: 'order_confirmed',
      contact_id: contactId,
      recipient_phone: normalizedPhone,
      scheduled_for: new Date().toISOString(),
      template_variables: {
        customer_name: firstName,
        order_number: order.name,
        order_total: `₹${parseFloat(order.total_price).toLocaleString('en-IN')}`,
      },
    })

    const isCOD = [order.gateway, order.financial_status]
      .some(v => v?.toLowerCase().includes('cash') || v?.toLowerCase().includes('cod'))

    if (isCOD) {
      automations.push({
        user_id: userId,
        event_type: 'cod_confirmation',
        contact_id: contactId,
        recipient_phone: normalizedPhone,
        scheduled_for: new Date().toISOString(),
        template_variables: {
          customer_name: firstName,
          order_amount: `₹${parseFloat(order.total_price).toLocaleString('en-IN')}`,
          order_number: order.name,
        },
      })
    }
  }

  if (automations.length > 0) {
    await supabase.from('automation_queue').insert(automations)
  }

  // Mark abandoned checkouts as recovered if this customer had one
  if (customerPhone) {
    await supabase.rpc('mark_checkout_recovered', {
      p_user_id: userId,
      p_customer_phone: normalizeIndianPhone(customerPhone),
    })
  }

  await supabase
    .from('shopify_connections')
    .update({ last_webhook_at: new Date().toISOString() })
    .eq('user_id', userId)

  return NextResponse.json({ ok: true })
}

function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return digits
  if (digits.length === 10) return `91${digits}`
  if (digits.startsWith('0') && digits.length === 11) return `91${digits.slice(1)}`
  return digits
}
