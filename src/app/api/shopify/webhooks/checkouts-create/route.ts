// POST — inbound from Shopify when checkout is created
// Shopify sends this for all checkouts; we store it and schedule an abandoned cart
// automation 1 hour later. The cron processor checks if the cart was recovered first.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyShopifyWebhook } from '@/lib/shopify/shopifyWebhooks'
import type { ShopifyCheckout, ShopifyLineItem } from '@/lib/shopify/shopifyTypes'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''
  const shopDomain = request.headers.get('x-shopify-shop-domain') ?? ''

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const checkout: ShopifyCheckout = JSON.parse(rawBody)
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
  const customerPhone = checkout.phone ?? checkout.customer?.phone ?? null

  // Only process checkouts with a phone number
  if (!customerPhone) {
    return NextResponse.json({ ok: true })
  }

  const normalizedPhone = normalizeIndianPhone(customerPhone)
  const customerName = [checkout.customer?.first_name, checkout.customer?.last_name]
    .filter(Boolean).join(' ')

  const { data: savedCheckout } = await supabase
    .from('abandoned_checkouts')
    .upsert({
      user_id: userId,
      shopify_checkout_id: String(checkout.id),
      customer_phone: normalizedPhone,
      customer_name: customerName || null,
      customer_email: checkout.email,
      total_price: parseFloat(checkout.total_price ?? '0'),
      line_items: checkout.line_items?.map((item: ShopifyLineItem) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })) ?? [],
      abandoned_checkout_url: checkout.abandoned_checkout_url,
      shopify_created_at: checkout.created_at,
    }, { onConflict: 'user_id,shopify_checkout_id' })
    .select()
    .single()

  if (!savedCheckout) {
    return NextResponse.json({ ok: true })
  }

  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('phone', normalizedPhone)
    .single()

  // Schedule abandoned cart automation 1 hour from now
  const scheduledFor = new Date()
  scheduledFor.setHours(scheduledFor.getHours() + 1)

  await supabase.from('automation_queue').insert({
    user_id: userId,
    event_type: 'abandoned_cart',
    checkout_id: savedCheckout.id,
    contact_id: contact?.id ?? null,
    recipient_phone: normalizedPhone,
    scheduled_for: scheduledFor.toISOString(),
    template_variables: {
      customer_name: checkout.customer?.first_name ?? 'there',
      product_name: checkout.line_items?.[0]?.title ?? 'your items',
      cart_url: checkout.abandoned_checkout_url,
      total_price: `₹${parseFloat(checkout.total_price ?? '0').toLocaleString('en-IN')}`,
    },
  })

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
