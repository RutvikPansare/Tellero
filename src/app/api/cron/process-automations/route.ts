// Process pending items in automation_queue → sends WhatsApp messages
// Triggered every minute via Supabase pg_cron (pg_net http_post) or GET for manual testing.
// This is the engine for Features 6 (COD), 7 (abandoned cart), 8 (order tracking), 9 (reorder).

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getShopifyClientForUser } from '@/lib/shopify/shopifyClient'

// ── Auth check shared by GET and POST ───────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  // Supabase pg_net sends x-cron-secret header
  const cronSecret = request.headers.get('x-cron-secret')
  return cronSecret === process.env.CRON_SECRET
}

// ── COD settings defaults (duplicated from client hook to avoid import) ──────

const DEFAULT_COD_SETTINGS = {
  enabled: true,
  confirmation_window_hours: 2,
  on_no_reply: 'cancel' as const,
  on_no: 'cancel' as const,
  template_name: 'cod_confirmation',
}

// ── Main processor ───────────────────────────────────────────────────────────

async function processQueue(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: dueAutomations } = await (supabase as any)
    .from('automation_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50) // max 50/minute to respect Meta rate limits

  if (!dueAutomations?.length) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0
  let failed = 0

  for (const automation of dueAutomations) {
    try {
      // Mark as processing immediately to prevent double-processing
      await (supabase as any)
        .from('automation_queue')
        .update({ status: 'processing' })
        .eq('id', automation.id)

      // ── COD timeout: check if still pending → cancel/flag ──────────────────
      if (automation.event_type === 'cod_timeout') {
        await handleCODTimeout(supabase, automation)
        await (supabase as any)
          .from('automation_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', automation.id)
        processed++
        continue
      }

      // ── Abandoned cart: verify customer hasn't purchased before sending ────
      if (
        (automation.event_type === 'abandoned_cart' || automation.event_type === 'abandoned_cart_reminder_2') &&
        automation.checkout_id
      ) {
        const { data: checkout } = await (supabase as any)
          .from('abandoned_checkouts')
          .select('recovered, customer_phone, shopify_created_at, total_price')
          .eq('id', automation.checkout_id)
          .single()

        if (checkout?.recovered) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', automation.id)
          continue
        }

        // Belt-and-suspenders: check orders table directly for a matching order
        // created after the checkout was created (catches race conditions)
        if (checkout?.customer_phone && checkout?.shopify_created_at) {
          const { data: matchingOrder } = await (supabase as any)
            .from('orders')
            .select('id')
            .eq('user_id', automation.user_id)
            .eq('customer_phone', checkout.customer_phone)
            .gt('shopify_created_at', checkout.shopify_created_at)
            .limit(1)
            .maybeSingle()

          if (matchingOrder) {
            // Customer purchased — mark checkout recovered and cancel automation
            await (supabase as any)
              .from('abandoned_checkouts')
              .update({ recovered: true, recovered_at: new Date().toISOString(), recovery_revenue: checkout.total_price })
              .eq('id', automation.checkout_id)
            await (supabase as any)
              .from('automation_queue')
              .update({ status: 'cancelled' })
              .eq('id', automation.id)
            continue
          }
        }
      }

      // ── Get brand's WhatsApp credentials ───────────────────────────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('waba_id, meta_access_token, whatsapp_number, cod_settings, abandoned_cart_settings, order_notification_settings, reorder_settings')
        .eq('id', automation.user_id)
        .single()

      if (!profile?.meta_access_token || !profile?.waba_id) {
        throw new Error('User has no WhatsApp connection configured')
      }

      // ── Order confirmation: check enabled + not cancelled ──────────────────
      if (automation.event_type === 'order_confirmed') {
        const orderSettings = (profile as any).order_notification_settings ?? {}
        if (!orderSettings.order_confirmation_enabled) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', automation.id)
          continue
        }
        // Skip if order was cancelled/voided before we could send
        if (automation.order_id) {
          const { data: ord } = await (supabase as any)
            .from('orders')
            .select('cancel_reason, financial_status')
            .eq('id', automation.order_id)
            .maybeSingle()
          if (ord?.cancel_reason || ord?.financial_status === 'voided') {
            await (supabase as any)
              .from('automation_queue')
              .update({ status: 'cancelled' })
              .eq('id', automation.id)
            continue
          }
        }
      }

      // ── Shipping update: check enabled ─────────────────────────────────────
      if (automation.event_type === 'order_shipped') {
        const orderSettings = (profile as any).order_notification_settings ?? {}
        if (!orderSettings.shipping_update_enabled) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', automation.id)
          continue
        }
      }

      // ── Reorder reminder: pre-send checks ─────────────────────────────────
      if (automation.event_type === 'reorder_reminder') {
        const cancelled = await checkReorderReminder(supabase, automation, profile)
        if (cancelled) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', automation.id)
          continue
        }
      }

      // ── Send WhatsApp template ─────────────────────────────────────────────
      const messageId = await sendWhatsAppTemplate({
        wabaId:       profile.waba_id,
        accessToken:  profile.meta_access_token,
        to:           automation.recipient_phone,
        templateName: getTemplateName(automation.event_type),
        variables:    automation.template_variables ?? {},
      })

      await (supabase as any)
        .from('automation_queue')
        .update({
          status:               'sent',
          whatsapp_message_id:  messageId,
          sent_at:              new Date().toISOString(),
        })
        .eq('id', automation.id)

      // ── After COD confirmation sent: create record + schedule timeout ───────
      if (automation.event_type === 'cod_confirmation') {
        const codSettings = {
          ...DEFAULT_COD_SETTINGS,
          ...((profile as any).cod_settings ?? {}),
        }
        await createCODConfirmationAndScheduleTimeout(supabase, automation, codSettings)
      }

      // ── After abandoned cart sent: stamp message_sent_at on the checkout ───
      if (
        (automation.event_type === 'abandoned_cart' || automation.event_type === 'abandoned_cart_reminder_2') &&
        automation.checkout_id
      ) {
        await (supabase as any)
          .from('abandoned_checkouts')
          .update({ message_sent_at: new Date().toISOString() })
          .eq('id', automation.checkout_id)
      }

      processed++

    } catch (error) {
      console.error(`[cron] Automation ${automation.id} failed:`, error)

      const newRetryCount = (automation.retry_count ?? 0) + 1
      await (supabase as any)
        .from('automation_queue')
        .update({
          status:        newRetryCount >= 3 ? 'failed' : 'pending',
          retry_count:   newRetryCount,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        })
        .eq('id', automation.id)

      failed++
    }
  }

  return NextResponse.json({ processed, failed })
}

// Supabase pg_cron uses net.http_post → POST handler
export async function POST(request: NextRequest) {
  return processQueue(request)
}

// GET for manual triggering / Vercel Cron compatibility
export async function GET(request: NextRequest) {
  return processQueue(request)
}

// ── COD helpers ──────────────────────────────────────────────────────────────

type AdminClient = ReturnType<typeof createAdminClient>

// After a cod_confirmation message is sent: insert cod_confirmations row + schedule timeout.
async function createCODConfirmationAndScheduleTimeout(
  supabase: AdminClient,
  // eslint-disable-line
  automation: any,
  codSettings: typeof DEFAULT_COD_SETTINGS
) {
  await (supabase as any)
    .from('cod_confirmations')
    .insert({
      user_id:             automation.user_id,
      order_id:            automation.order_id ?? null,
      automation_queue_id: automation.id,
      customer_phone:      automation.recipient_phone,
      status:              'pending',
      sent_at:             new Date().toISOString(),
    })

  // Schedule the no-reply timeout check
  const timeoutAt = new Date()
  timeoutAt.setHours(timeoutAt.getHours() + codSettings.confirmation_window_hours)

  await (supabase as any)
    .from('automation_queue')
    .insert({
      user_id:            automation.user_id,
      event_type:         'cod_timeout',
      order_id:           automation.order_id ?? null,
      contact_id:         automation.contact_id ?? null,
      scheduled_for:      timeoutAt.toISOString(),
      status:             'pending',
      recipient_phone:    automation.recipient_phone,
      template_variables: {},
    })
}

// When a cod_timeout fires: check if still pending → apply on_no_reply action.
async function handleCODTimeout(
  supabase: AdminClient,
  // eslint-disable-line
  automation: any
) {
  if (!automation.order_id) return

  // Find a pending confirmation for this order
  const { data: confirmation } = await (supabase as any)
    .from('cod_confirmations')
    .select('id, status')
    .eq('order_id', automation.order_id)
    .eq('user_id', automation.user_id)
    .eq('status', 'pending')
    .maybeSingle()

  if (!confirmation) return // already resolved by a reply

  // Get brand's COD settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('cod_settings, waba_id, meta_access_token')
    .eq('id', automation.user_id)
    .single()

  const codSettings = {
    ...DEFAULT_COD_SETTINGS,
    ...((profile as any)?.cod_settings ?? {}),
  }

  // Mark as no_reply
  await (supabase as any)
    .from('cod_confirmations')
    .update({ status: 'no_reply', resolved_at: new Date().toISOString() })
    .eq('id', confirmation.id)

  if (codSettings.on_no_reply === 'cancel') {
    // Fetch the order's Shopify ID and fulfillment status
    const { data: order } = await (supabase as any)
      .from('orders')
      .select('shopify_order_id, fulfillment_status')
      .eq('id', automation.order_id)
      .single()

    // Don't cancel if already fulfilled (edge case)
    if (order && order.fulfillment_status !== 'fulfilled' && order.shopify_order_id) {
      try {
        const shopifyClient = await getShopifyClientForUser(supabase, automation.user_id)
        if (shopifyClient) {
          await shopifyClient.cancelOrder(order.shopify_order_id)
          await (supabase as any)
            .from('cod_confirmations')
            .update({ shopify_order_cancelled: true })
            .eq('id', confirmation.id)
        }
      } catch (err) {
        console.error('[cron] Shopify cancel failed:', err)
      }
    }
  }
}

// ── Reorder reminder pre-send checks ─────────────────────────────────────────
// Returns true if the reminder should be cancelled (customer already reordered,
// product out of stock, or customer opted out). Never throws — optional checks
// fail open so a Shopify API timeout doesn't block the automation.

async function checkReorderReminder(
  supabase: AdminClient,
  // eslint-disable-line
  automation: any,
  // eslint-disable-line
  profile: any
): Promise<boolean> {
  const { source_order_id, source_product_id, recipient_phone, user_id } = automation

  // ── Check 1: Has customer already reordered this product? ─────────────────
  if (source_order_id && source_product_id) {
    // Get the source order's created date as our baseline
    const { data: sourceOrder } = await (supabase as any)
      .from('orders')
      .select('shopify_created_at')
      .eq('id', source_order_id)
      .maybeSingle()

    if (sourceOrder?.shopify_created_at) {
      // Check orders table: same brand + customer + product ordered after source
      // Uses JSONB containment to check if any line_item has this product_id.
      // Syntax: line_items @> '[{"product_id": "12345"}]'::jsonb
      const { data: reorder } = await (supabase as any)
        .from('orders')
        .select('id')
        .eq('user_id', user_id)
        .eq('customer_phone', recipient_phone)
        .gt('shopify_created_at', sourceOrder.shopify_created_at)
        .filter('line_items', 'cs', JSON.stringify([{ product_id: source_product_id }]))
        .limit(1)
        .maybeSingle()

      if (reorder) {
        console.log(`[cron] reorder_reminder ${automation.id}: customer already reordered product ${source_product_id} — cancelling`)
        return true
      }
    }
  }

  // ── Check 2: Is the product still active and in stock? ────────────────────
  if (source_product_id) {
    try {
      const shopifyClient = await getShopifyClientForUser(supabase, user_id)
      if (shopifyClient) {
        const { product } = await shopifyClient.getProduct(source_product_id)
        const inStock = product.status === 'active' &&
          product.variants.some(v => v.inventory_quantity > 0)
        if (!inStock) {
          console.log(`[cron] reorder_reminder ${automation.id}: product ${source_product_id} out of stock or inactive — cancelling`)
          return true
        }
      }
    } catch (err) {
      // Don't block on Shopify API failure — log and proceed
      console.error(`[cron] reorder_reminder ${automation.id}: Shopify stock check failed (proceeding):`, err)
    }
  }

  // ── Check 3: Has customer opted out of marketing? ─────────────────────────
  const { data: contact } = await (supabase as any)
    .from('contacts')
    .select('marketing_opted_out')
    .eq('user_id', user_id)
    .eq('phone', recipient_phone)
    .maybeSingle()

  if (contact?.marketing_opted_out) {
    console.log(`[cron] reorder_reminder ${automation.id}: contact opted out — cancelling`)
    return true
  }

  // ── Check 4: Send time window (IST) ───────────────────────────────────────
  // Only send between 09:00 and 20:00 IST to respect customer hours.
  // IST = UTC + 330 minutes.
  const reorderSettings = profile?.reorder_settings ?? {}
  const sendTimeStr: string = reorderSettings.send_time ?? '09:00'
  const [sendHour] = sendTimeStr.split(':').map(Number)

  const nowUtcMs = Date.now()
  const nowISTMs = nowUtcMs + 330 * 60 * 1000 // shift to IST
  const nowISTHour = new Date(nowISTMs).getUTCHours()

  // If the send_time hour is outside 9–20 IST, re-queue for next send window.
  // We re-schedule to tomorrow at the configured send_time rather than cancelling.
  const sendWindowStart = sendHour
  const sendWindowEnd   = 20
  if (nowISTHour < sendWindowStart || nowISTHour >= sendWindowEnd) {
    // Re-schedule for tomorrow at send_time IST
    const tomorrowIST = new Date(nowISTMs)
    tomorrowIST.setUTCDate(tomorrowIST.getUTCDate() + 1)
    const [sh, sm] = sendTimeStr.split(':').map(Number)
    tomorrowIST.setUTCHours(sh - 5, sm - 30, 0, 0)
    await (supabase as any)
      .from('automation_queue')
      .update({ status: 'pending', scheduled_for: tomorrowIST.toISOString() })
      .eq('id', automation.id)
    console.log(`[cron] reorder_reminder ${automation.id}: outside send window (${nowISTHour}:xx IST) — rescheduled`)
    return true // mark as "cancelled" for this run (re-queued for tomorrow)
  }

  return false // all checks passed — proceed to send
}

// ── Template name map ────────────────────────────────────────────────────────

function getTemplateName(eventType: string): string {
  const map: Record<string, string> = {
    cod_confirmation:          'cod_confirmation',
    abandoned_cart:            'abandoned_cart_recovery',
    abandoned_cart_reminder_2: 'abandoned_cart_reminder_2',
    order_confirmed:           'order_confirmation',
    order_shipped:             'shipping_update',
    order_cancelled:           'order_cancelled',
    reorder_reminder:          'reorder_reminder',
    win_back:                  'win_back',
  }
  return map[eventType] ?? eventType
}

// ── WhatsApp send helper ──────────────────────────────────────────────────────

async function sendWhatsAppTemplate(params: {
  wabaId: string
  accessToken: string
  to: string
  templateName: string
  variables: Record<string, string>
}): Promise<string> {
  const { wabaId, accessToken, to, templateName, variables } = params

  // Fetch phone number ID from WABA
  const numbersRes = await fetch(
    `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!numbersRes.ok) throw new Error('Failed to fetch WhatsApp phone numbers')
  const numbersData = await numbersRes.json()
  const phoneNumberId = numbersData.data?.[0]?.id
  if (!phoneNumberId) throw new Error('No WhatsApp phone number found for this account')

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name:     templateName,
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: Object.values(variables).map(value => ({
              type: 'text',
              text: String(value),
            })),
          }],
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`WhatsApp send failed: ${JSON.stringify(err)}`)
  }

  const data = await response.json()
  return data.messages?.[0]?.id ?? ''
}
