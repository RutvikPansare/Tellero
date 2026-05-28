// POST — inbound from Shopify when order is cancelled

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyShopifyWebhook } from '@/lib/shopify/shopifyWebhooks'
import type { ShopifyOrder } from '@/lib/shopify/shopifyTypes'

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

  await supabase
    .from('orders')
    .update({
      financial_status: 'refunded',
      cancel_reason: order.cancel_reason,
      shopify_updated_at: order.updated_at,
    })
    .eq('user_id', userId)
    .eq('shopify_order_id', String(order.id))

  // Cancel any pending automations for this order
  const { data: savedOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('shopify_order_id', String(order.id))
    .single()

  if (savedOrder) {
    await supabase
      .from('automation_queue')
      .update({ status: 'cancelled' })
      .eq('order_id', savedOrder.id)
      .eq('status', 'pending')

    const customerPhone = order.customer?.phone ?? order.shipping_address?.phone ?? null
    if (customerPhone) {
      const normalizedPhone = normalizeIndianPhone(customerPhone)
      const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', userId)
        .eq('phone', normalizedPhone)
        .single()

      if (contact) {
        await supabase.from('automation_queue').insert({
          user_id: userId,
          event_type: 'order_cancelled',
          order_id: savedOrder.id,
          contact_id: contact.id,
          recipient_phone: normalizedPhone,
          scheduled_for: new Date().toISOString(),
          template_variables: {
            customer_name: order.customer?.first_name ?? 'there',
            order_number: order.name,
            cancel_reason: order.cancel_reason ?? 'Not specified',
          },
        })
      }
    }
  }

  await supabase
    .from('shopify_connections')
    .update({ last_webhook_at: new Date().toISOString() })
    .eq('user_id', userId)

  return NextResponse.json({ ok: true })
}

function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith('0') && digits.length === 11) return `+91${digits.slice(1)}`
  return `+${digits}`
}
