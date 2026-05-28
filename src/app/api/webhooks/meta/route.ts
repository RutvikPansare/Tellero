// Meta WhatsApp webhook — inbound messages + delivery status updates
// GET: Meta verification challenge (must be registered in Meta App Dashboard)
// POST: actual message payloads — verify signature then process

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

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

// ─── GET — Meta webhook verification ─────────────────────────────────────────

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

  // Look up existing contact to link
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
  // Only update if it's a progression (don't downgrade read→delivered)
  const priority: Record<string, number> = { sent: 1, delivered: 2, read: 3, failed: 0 }
  const newPriority = priority[status.status] ?? 0

  const { data: existing } = await supabase
    .from('messages')
    .select('id, status')
    .eq('meta_message_id', status.id)
    .maybeSingle()

  if (!existing) return
  const currentPriority = priority[existing.status as string] ?? 0
  if (newPriority <= currentPriority) return

  await supabase
    .from('messages')
    .update({ status: status.status })
    .eq('id', existing.id)
}
