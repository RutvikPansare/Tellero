// POST — inbound from Shopify when order is fulfilled/shipped

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyShopifyWebhook } from '@/lib/shopify/shopifyWebhooks'
import type { ShopifyOrder } from '@/lib/shopify/shopifyTypes'

// Shape of one product rule inside reorder_settings.product_rules
interface ProductRule {
  product_id:    string
  product_name?: string
  reminder_days: number
  enabled:       boolean
}

interface ReorderSettings {
  enabled:               boolean
  default_reminder_days: number
  product_rules:         ProductRule[]
  template_name:         string
  send_time:             string  // "HH:MM" in IST
}

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
  const fulfillment = order.fulfillments?.[0]
  const trackingNumber = fulfillment?.tracking_number ?? null
  const trackingUrl    = fulfillment?.tracking_url   ?? null
  const fulfillmentCreatedAt = fulfillment?.created_at ?? order.updated_at

  // ── Update order record with fulfillment info ──────────────────────────────
  const { data: dbOrder } = await (supabase as any)
    .from('orders')
    .update({
      fulfillment_status: 'fulfilled',
      tracking_number:    trackingNumber,
      tracking_url:       trackingUrl,
      shopify_updated_at: order.updated_at,
    })
    .eq('user_id', userId)
    .eq('shopify_order_id', String(order.id))
    .select('id')
    .maybeSingle()

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
      // ── Shipping update — duplicate guard ────────────────────────────────
      const { data: existing } = await (supabase as any)
        .from('automation_queue')
        .select('id')
        .eq('user_id', userId)
        .eq('event_type', 'order_shipped')
        .eq('contact_id', contact.id)
        .not('status', 'eq', 'cancelled')
        .maybeSingle()

      if (!existing) {
        await supabase.from('automation_queue').insert({
          user_id:       userId,
          event_type:    'order_shipped',
          contact_id:    contact.id,
          recipient_phone: normalizedPhone,
          scheduled_for: new Date().toISOString(),
          template_variables: {
            customer_name:   order.customer?.first_name ?? 'there',
            order_number:    order.name,
            tracking_number: trackingNumber ?? 'Not available yet',
            tracking_url:    trackingUrl ?? '',
          },
        })
      }

      // ── Reorder reminders ────────────────────────────────────────────────
      await scheduleReorderReminders({
        supabase,
        userId,
        contact,
        order,
        dbOrderId:          dbOrder?.id ?? null,
        normalizedPhone,
        fulfillmentCreatedAt,
      })
    }
  }

  await supabase
    .from('shopify_connections')
    .update({ last_webhook_at: new Date().toISOString() })
    .eq('user_id', userId)

  return NextResponse.json({ ok: true })
}

// ── Reorder reminder scheduling ───────────────────────────────────────────────

async function scheduleReorderReminders(params: {
  supabase:             ReturnType<typeof createAdminClient>
  userId:               string
  contact:              { id: string }
  order:                ShopifyOrder
  dbOrderId:            string | null
  normalizedPhone:      string
  fulfillmentCreatedAt: string
}) {
  const { supabase, userId, contact, order, dbOrderId, normalizedPhone, fulfillmentCreatedAt } = params

  // Fetch reorder settings for this brand
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('reorder_settings')
    .eq('id', userId)
    .single()

  const reorderSettings: ReorderSettings = {
    enabled:               false,
    default_reminder_days: 30,
    product_rules:         [],
    template_name:         'reorder_reminder',
    send_time:             '09:00',
    ...(profile?.reorder_settings ?? {}),
  }

  if (!reorderSettings.enabled) return

  const customerName = order.customer?.first_name ?? 'there'

  for (const lineItem of order.line_items) {
    const productIdStr = String(lineItem.product_id)

    // Find product-specific rule, if any
    const rule = reorderSettings.product_rules.find(r => r.product_id === productIdStr)

    // Skip if product has an explicit rule that is disabled
    if (rule && !rule.enabled) continue

    const reminderDays = rule?.reminder_days ?? reorderSettings.default_reminder_days

    // Guard: reminder_days must be sane (1–365)
    if (reminderDays < 1 || reminderDays > 365) {
      console.warn(`[orders-fulfilled] Skipping product ${productIdStr}: reminder_days ${reminderDays} out of range`)
      continue
    }

    // ── Calculate scheduled_for in IST ──────────────────────────────────────
    // send_time is "HH:MM" in IST (UTC+5:30 = +330 min)
    // We want to fire at that local time on day (fulfillment + reminderDays).
    // Strategy: set the UTC time so that IST = send_time on that date.
    const [sendHour, sendMin] = reorderSettings.send_time.split(':').map(Number)
    const scheduledDate = new Date(fulfillmentCreatedAt)
    scheduledDate.setDate(scheduledDate.getDate() + reminderDays)
    // IST is UTC+5:30. To fire at 09:00 IST we store 03:30 UTC.
    // sendHour IST = (sendHour - 5) UTC hours; sendMin IST = (sendMin - 30) UTC minutes.
    // Handle underflow: if result is negative, subtract from previous day (handled by UTC setters).
    const utcHour = sendHour - 5
    const utcMin  = sendMin  - 30
    scheduledDate.setUTCHours(utcHour, utcMin, 0, 0)
    // setUTCHours handles negative values by rolling back the day automatically.

    // ── Duplicate guard: one pending reminder per brand+contact+product ──────
    const { data: dupCheck } = await (supabase as any)
      .from('automation_queue')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', 'reorder_reminder')
      .eq('contact_id', contact.id)
      .eq('source_product_id', productIdStr)
      .eq('status', 'pending')
      .maybeSingle()

    if (dupCheck) {
      console.log(`[orders-fulfilled] Reorder reminder already queued for contact ${contact.id} product ${productIdStr} — skipping`)
      continue
    }

    await (supabase as any).from('automation_queue').insert({
      user_id:            userId,
      event_type:         'reorder_reminder',
      contact_id:         contact.id,
      recipient_phone:    normalizedPhone,
      scheduled_for:      scheduledDate.toISOString(),
      status:             'pending',
      source_order_id:    dbOrderId,
      source_product_id:  productIdStr,
      template_variables: {
        customer_name:         customerName,
        product_name:          lineItem.title,
        days_since_purchase:   String(reminderDays),
        reorder_url:           `https://${order.customer?.email ? '' : ''}`,
      },
    })

    console.log(`[orders-fulfilled] Queued reorder reminder for contact ${contact.id} product "${lineItem.title}" in ${reminderDays}d at ${scheduledDate.toISOString()}`)
  }
}

// ── Phone normalization ───────────────────────────────────────────────────────

function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith('0') && digits.length === 11) return `+91${digits.slice(1)}`
  return `+${digits}`
}

