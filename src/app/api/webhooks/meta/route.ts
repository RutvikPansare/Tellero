// Meta WhatsApp webhook — inbound messages + delivery status updates
// GET: Meta verification challenge (must be registered in Meta App Dashboard)
// POST: actual message payloads — verify signature then process

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getShopifyClientForUser } from '@/lib/shopify/shopifyClient'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetaMessage {
  from:      string
  id:        string        // wamid
  timestamp: string
  type:      string
  text?:     { body: string }
}

interface MetaStatus {
  id:           string    // wamid
  status:       'sent' | 'delivered' | 'read' | 'failed'
  timestamp:    string
  recipient_id: string
  errors?:      Array<{ code: number; title: string }>
}

interface MetaContact {
  profile: { name: string }
  wa_id:   string
}

interface MetaChangeValue {
  messaging_product: string
  metadata: { display_phone_number: string; phone_number_id: string }
  contacts?: MetaContact[]
  messages?: MetaMessage[]
  statuses?: MetaStatus[]
}

interface MetaPayload {
  object: string
  entry: Array<{
    id: string   // WABA ID
    changes: Array<{ field: string; value: MetaChangeValue }>
  }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function verifyMetaSignature(rawBody: string, sigHeader: string): boolean {
  const secret = process.env.META_WEBHOOK_SECRET
  if (!secret || !sigHeader) return false
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader))
  } catch {
    return false
  }
}

// Normalize to E.164 (+91...) — Meta sends numbers without + (e.g. 919876543210)
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return `+${digits}`
}

// ─── COD reply detection ──────────────────────────────────────────────────────

// Exact-match keyword detection (not substring) to avoid false positives like
// "No I don't want to cancel" triggering a cancellation.
const YES_KEYWORDS = ['yes', 'y', '1', 'confirm', 'ok', 'okay', 'haan', 'ha', 'हाँ', 'हां', 'ji']
const NO_KEYWORDS  = ['no', 'n', '2', 'cancel', 'nahi', 'nope', 'nahin', 'नहीं', 'mat']

function detectCODReply(messageBody: string): 'yes' | 'no' | null {
  const text = messageBody.trim().toLowerCase()
  if (YES_KEYWORDS.some(k => k.toLowerCase() === text)) return 'yes'
  if (NO_KEYWORDS.some(k => k.toLowerCase() === text)) return 'no'
  return null
}

// ─── Marketing opt-out detection ─────────────────────────────────────────────

// Case-insensitive exact-match or prefix-match on these keywords.
// Covers English and common Hindi/Hinglish phrasing.
const OPT_OUT_KEYWORDS = [
  'stop', 'unsubscribe', 'optout', 'opt out',
  'band karo', 'mat bhejo', 'nahi chahiye',
]
const RESUBSCRIBE_KEYWORDS = ['start', 'subscribe', 'opt in', 'optin']

function detectOptOut(text: string): 'opt_out' | 'resubscribe' | null {
  const normalized = text.trim().toLowerCase()
  if (OPT_OUT_KEYWORDS.some(k => normalized === k)) return 'opt_out'
  if (RESUBSCRIBE_KEYWORDS.some(k => normalized === k)) return 'resubscribe'
  return null
}

// Handle a customer opting out of marketing messages.
// - Updates contacts table
// - Cancels all pending marketing automations for this phone
// - Sends acknowledgement message
// Does NOT route to inbox — fully automated, no agent needed.
async function handleOptOut(
  supabase: AdminClient,
  userId: string,
  phone: string,
  profile: { waba_id: string | null; meta_access_token: string | null }
): Promise<void> {
  // Update contacts: mark opted out
  await (supabase as any)
    .from('contacts')
    .update({ marketing_opted_out: true, opted_out_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('phone', phone)

  // Cancel all pending marketing automations for this contact's phone.
  // Deliberately excludes transactional types (order_confirmed, order_shipped, cod_*).
  await (supabase as any)
    .from('automation_queue')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('recipient_phone', phone)
    .eq('status', 'pending')
    .in('event_type', ['reorder_reminder', 'win_back', 'abandoned_cart', 'abandoned_cart_reminder_2'])

  // Acknowledge the opt-out
  if (profile.waba_id && profile.meta_access_token) {
    await sendWhatsAppText({
      wabaId:      profile.waba_id,
      accessToken: profile.meta_access_token,
      to:          phone,
      text:        "You've been unsubscribed from marketing messages. You'll still receive order updates. Reply START to resubscribe.",
    })
  }

  console.log(`[meta/webhook] Opt-out processed for user ${userId} phone ${phone}`)
}

// Handle a customer re-subscribing to marketing messages.
async function handleResubscribe(
  supabase: AdminClient,
  userId: string,
  phone: string,
  profile: { waba_id: string | null; meta_access_token: string | null }
): Promise<void> {
  await (supabase as any)
    .from('contacts')
    .update({ marketing_opted_out: false, opted_out_at: null })
    .eq('user_id', userId)
    .eq('phone', phone)

  if (profile.waba_id && profile.meta_access_token) {
    await sendWhatsAppText({
      wabaId:      profile.waba_id,
      accessToken: profile.meta_access_token,
      to:          phone,
      text:        "You're back! You'll receive product reminders and offers again. 🎉",
    })
  }

  console.log(`[meta/webhook] Resubscribe processed for user ${userId} phone ${phone}`)
}

// Send a free-text WhatsApp reply (within 24h of customer's inbound message — always safe here)
async function sendWhatsAppText(params: {
  wabaId: string
  accessToken: string
  to: string
  text: string
}): Promise<void> {
  const { wabaId, accessToken, to, text } = params

  const numbersRes = await fetch(
    `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!numbersRes.ok) return
  const numbersData = await numbersRes.json()
  const phoneNumberId = numbersData.data?.[0]?.id
  if (!phoneNumberId) return

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
}

// Handles a confirmed YES reply: update record, cancel timeout queue item.
async function handleCODYes(
  supabase: AdminClient,
  userId: string,
  // eslint-disable-line
  codConf: any,
  rawPhone: string,
  replyText: string,
  profile: { waba_id: string | null; meta_access_token: string | null }
): Promise<void> {
  // Edge case: order already fulfilled before confirmation — mark confirmed, don't touch Shopify
  const fulfillmentStatus = codConf.orders?.fulfillment_status ?? null

  await (supabase as any)
    .from('cod_confirmations')
    .update({
      status:        'confirmed',
      customer_reply: replyText,
      replied_at:    new Date().toISOString(),
      resolved_at:   new Date().toISOString(),
    })
    .eq('id', codConf.id)

  // Cancel the pending timeout queue item for this order
  if (codConf.order_id) {
    await (supabase as any)
      .from('automation_queue')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('event_type', 'cod_timeout')
      .eq('order_id', codConf.order_id)
      .eq('status', 'pending')
  }

  if (profile.waba_id && profile.meta_access_token) {
    const msg = fulfillmentStatus === 'fulfilled'
      ? 'Your order is already on its way! 🚀 Thank you.'
      : 'Great! Your order is confirmed 🎉 We\'ll ship it soon. Thank you!'
    await sendWhatsAppText({
      wabaId:      profile.waba_id,
      accessToken: profile.meta_access_token,
      to:          rawPhone,
      text:        msg,
    })
  }
}

// Handles a confirmed NO reply: update record, cancel timeout, cancel Shopify order if configured.
async function handleCODNo(
  supabase: AdminClient,
  userId: string,
  // eslint-disable-line
  codConf: any,
  rawPhone: string,
  replyText: string,
  profile: { waba_id: string | null; meta_access_token: string | null; cod_settings: unknown }
): Promise<void> {
  const codSettings = {
    on_no: 'cancel' as 'cancel' | 'flag',
    ...((profile.cod_settings ?? {}) as { on_no?: 'cancel' | 'flag' }),
  }

  let shopifyOrderCancelled = false

  // Cancel order in Shopify unless it's already fulfilled or brand setting says flag
  if (codSettings.on_no === 'cancel') {
    const fulfillmentStatus = codConf.orders?.fulfillment_status ?? null
    const shopifyOrderId    = codConf.orders?.shopify_order_id ?? null

    if (shopifyOrderId && fulfillmentStatus !== 'fulfilled') {
      try {
        const shopifyClient = await getShopifyClientForUser(supabase, userId)
        if (shopifyClient) {
          await shopifyClient.cancelOrder(shopifyOrderId)
          shopifyOrderCancelled = true
        }
      } catch (err) {
        console.error('[meta/webhook] Shopify cancel failed:', err)
      }
    }
  }

  await (supabase as any)
    .from('cod_confirmations')
    .update({
      status:                  'cancelled',
      customer_reply:          replyText,
      shopify_order_cancelled: shopifyOrderCancelled,
      replied_at:              new Date().toISOString(),
      resolved_at:             new Date().toISOString(),
    })
    .eq('id', codConf.id)

  // Cancel the pending timeout queue item
  if (codConf.order_id) {
    await (supabase as any)
      .from('automation_queue')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('event_type', 'cod_timeout')
      .eq('order_id', codConf.order_id)
      .eq('status', 'pending')
  }

  if (profile.waba_id && profile.meta_access_token) {
    await sendWhatsAppText({
      wabaId:      profile.waba_id,
      accessToken: profile.meta_access_token,
      to:          rawPhone,
      text:        'Your order has been cancelled. Let us know if you\'d like to place a new order! 😊',
    })
  }
}



export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const mode      = sp.get('hub.mode')
  const token     = sp.get('hub.verify_token')
  const challenge = sp.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ─── POST — inbound messages ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!verifyMetaSignature(rawBody, request.headers.get('x-hub-signature-256') ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return 200 immediately — Meta retries if we take > 5 s
  const supabase = createAdminClient()
  const payload: MetaPayload = JSON.parse(rawBody)

  for (const entry of payload.entry ?? []) {
    const wabaId = entry.id
    for (const change of entry.changes ?? []) {
      const value = change.value

      // Resolve which user (brand) owns this WABA
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('waba_id', wabaId)
        .single()

      if (!profile) continue
      const userId = profile.id as string

      // Build a phone→name map from the contacts array in the payload
      const nameMap: Record<string, string> = {}
      for (const c of value.contacts ?? []) {
        nameMap[normalizePhone(c.wa_id)] = c.profile.name
      }

      // Handle inbound messages
      for (const msg of value.messages ?? []) {
        if (msg.type !== 'text' || !msg.text?.body) continue
        await handleInboundMessage(supabase, userId, msg, nameMap)
      }

      // Handle delivery/read status updates
      for (const status of value.statuses ?? []) {
        await handleStatus(supabase, status)
      }
    }
  }

  return NextResponse.json({ ok: true })
}

// ─── Handlers ────────────────────────────────────────────────────────────────

type AdminClient = ReturnType<typeof createAdminClient>

async function handleInboundMessage(
  supabase: AdminClient,
  userId: string,
  msg: MetaMessage,
  nameMap: Record<string, string>
) {
  const phone   = normalizePhone(msg.from)
  const body    = msg.text!.body
  const preview = body.length > 80 ? body.slice(0, 77) + '…' : body
  const msgAt   = new Date(parseInt(msg.timestamp, 10) * 1000).toISOString()

  // ── COD reply interception ───────────────────────────────────────────────
  // Phone in cod_confirmations is stored without + (e.g. 919876543210)
  const codReply = detectCODReply(body)
  if (codReply) {
    const rawPhone = phone.replace('+', '') // strip + to match stored format

    // Look up a pending COD confirmation for this brand + phone
    const { data: codConf } = await (supabase as any)
      .from('cod_confirmations')
      .select(`
        id, status, order_id,
        orders (shopify_order_id, fulfillment_status)
      `)
      .eq('user_id', userId)
      .eq('customer_phone', rawPhone)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (codConf) {
      // Fetch profile for WhatsApp credentials + COD settings
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('waba_id, meta_access_token, cod_settings')
        .eq('id', userId)
        .single()

      if (codReply === 'yes') {
        await handleCODYes(supabase, userId, codConf, phone, body, profile)
      } else {
        await handleCODNo(supabase, userId, codConf, phone, body, profile)
      }
      // COD reply handled — do NOT let it fall through to inbox
      return
    }

    // Edge case: customer replied after timeout already resolved the confirmation
    // Check if there's a recently cancelled/no_reply confirmation for this phone
    const { data: resolvedConf } = await (supabase as any)
      .from('cod_confirmations')
      .select('id, status')
      .eq('user_id', userId)
      .eq('customer_phone', rawPhone)
      .in('status', ['cancelled', 'no_reply'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (resolvedConf && codReply === 'yes') {
      // Tell customer it's too late — their order was already cancelled
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('waba_id, meta_access_token')
        .eq('id', userId)
        .single()

      if (profile?.waba_id && profile?.meta_access_token) {
        await sendWhatsAppText({
          wabaId:      profile.waba_id,
          accessToken: profile.meta_access_token,
          to:          phone,
          text:        'Your order was cancelled as we didn\'t hear from you in time. Would you like to place a new order?',
        })
      }
      return // intercepted — don't create inbox thread
    }
  }
  // ── End COD interception — falls through to normal inbox handling ─────────

  // ── Marketing opt-out / resubscribe interception ──────────────────────────
  const optOutAction = detectOptOut(body)
  if (optOutAction) {
    const { data: profileForOptOut } = await (supabase as any)
      .from('profiles')
      .select('waba_id, meta_access_token')
      .eq('id', userId)
      .single()

    if (optOutAction === 'opt_out') {
      await handleOptOut(supabase, userId, phone, profileForOptOut ?? {})
    } else {
      // Only resubscribe if they were actually opted out — check first
      const { data: contactCheck } = await (supabase as any)
        .from('contacts')
        .select('marketing_opted_out')
        .eq('user_id', userId)
        .eq('phone', phone)
        .maybeSingle()
      if (contactCheck?.marketing_opted_out) {
        await handleResubscribe(supabase, userId, phone, profileForOptOut ?? {})
      }
      // If not opted out, fall through to inbox (START might be a legitimate message)
    }
    if (optOutAction === 'opt_out') return // don't create inbox thread for opt-outs
  }
  // ── End opt-out interception ───────────────────────────────────────────────

  // ── Reply tracking for automation analytics ───────────────────────────────
  // Mark the most recent automation_queue item for this phone as replied.
  // Covers abandoned cart, reorder reminders, order notifications, etc.
  // COD replies are handled above and excluded from this RPC.
  await (supabase as any).rpc('mark_automation_replied', {
    p_user_id:    userId,
    p_phone:      phone,
    p_replied_at: msgAt,
  })
  // ── End reply tracking ─────────────────────────────────────────────────────

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, name')
    .eq('user_id', userId)
    .eq('phone', phone)
    .maybeSingle()

  const customerName = nameMap[phone] ?? contact?.name ?? null

  // Upsert conversation — one thread per user+phone pair
  const { data: conversation, error: convErr } = await supabase
    .from('conversations')
    .upsert({
      user_id:              userId,
      customer_phone:       phone,
      customer_name:        customerName,
      contact_id:           contact?.id ?? null,
      last_message_at:      msgAt,
      last_message_preview: preview,
      updated_at:           new Date().toISOString(),
    }, { onConflict: 'user_id,customer_phone' })
    .select('id, unread_count')
    .single()

  if (convErr || !conversation) {
    console.error('[meta/webhook] upsert conversation error:', convErr)
    return
  }

  // Increment unread count
  await supabase
    .from('conversations')
    .update({ unread_count: (conversation.unread_count as number) + 1 })
    .eq('id', conversation.id)

  // Upsert with ignoreDuplicates: true — UNIQUE on meta_message_id deduplicates Meta double-sends
  await supabase
    .from('messages')
    .upsert({
      conversation_id: conversation.id as string,
      direction:       'inbound',
      body,
      meta_message_id: msg.id,
      status:          'delivered',   // inbound messages arrive already delivered
      created_at:      msgAt,
    }, { onConflict: 'meta_message_id', ignoreDuplicates: true })
}

async function handleStatus(supabase: AdminClient, status: MetaStatus) {
  const ts = new Date(parseInt(status.timestamp, 10) * 1000).toISOString()
  const errorCode    = status.errors?.[0]?.code?.toString() ?? null
  const errorMessage = status.errors?.[0]?.title ?? null

  const { data, error } = await (supabase as any).rpc('process_message_status', {
    p_meta_message_id: status.id,
    p_status:          status.status,
    p_timestamp:       ts,
    p_error_code:      errorCode,
    p_error_message:   errorMessage,
  })

  if (error) {
    console.error('[meta/webhook] process_message_status RPC error:', error)
    return
  }

  if (data === 'not_found') {
    // Meta occasionally delivers status updates before our send path
    // has stored the message ID — race condition. Log and ignore.
    console.log(`[meta/webhook] status ${status.status} for unknown wamid: ${status.id}`)
  }
}
