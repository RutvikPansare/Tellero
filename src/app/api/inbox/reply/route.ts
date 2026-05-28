// POST /api/inbox/reply
// Sends an outbound WhatsApp message via Meta Cloud API.
// Requires server-side execution because meta_access_token is secret.
// Body: { conversationId: string; message: string }
//
// NOTE: WhatsApp only allows free-form text replies within 24 hours of the
// customer's last inbound message. After that, only approved templates can
// be sent. Enforcement is left for Phase 2 — the server will receive a 400
// from Meta if the window has expired.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface ReplyBody {
  conversationId: string
  message:        string
}

export async function POST(request: NextRequest) {
  // Authenticate — only logged-in users can reply
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: ReplyBody = await request.json()
  const { conversationId, message } = body
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: 'conversationId and message are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch conversation — confirm it belongs to this user
  const { data: convo, error: convoErr } = await admin
    .from('conversations')
    .select('id, customer_phone, user_id')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (convoErr || !convo) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Fetch the brand's WhatsApp credentials
  const { data: profile } = await admin
    .from('profiles')
    .select('waba_id, meta_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.waba_id || !profile?.meta_access_token) {
    return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 422 })
  }

  // Get phone_number_id for this WABA
  const phonesRes = await fetch(
    `https://graph.facebook.com/v18.0/${profile.waba_id}/phone_numbers`,
    { headers: { Authorization: `Bearer ${profile.meta_access_token}` } }
  )
  if (!phonesRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch phone number ID from Meta' }, { status: 502 })
  }
  const phonesData: { data: Array<{ id: string }> } = await phonesRes.json()
  const phoneNumberId = phonesData.data?.[0]?.id
  if (!phoneNumberId) {
    return NextResponse.json({ error: 'No phone number found on WABA' }, { status: 422 })
  }

  // Strip + so Meta receives the number in its expected format (919876543210)
  const recipientPhone = (convo.customer_phone as string).replace(/^\+/, '')

  // Send via Meta Cloud API
  const metaRes = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${profile.meta_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to:                recipientPhone,
        type:              'text',
        text:              { body: message.trim() },
      }),
    }
  )

  const metaData: { messages?: Array<{ id: string }> } = await metaRes.json()
  if (!metaRes.ok) {
    console.error('[inbox/reply] Meta API error:', metaData)
    return NextResponse.json({ error: 'Meta API error' }, { status: 502 })
  }

  const metaMessageId = metaData.messages?.[0]?.id ?? null
  const now           = new Date().toISOString()
  const preview       = message.length > 80 ? message.slice(0, 77) + '…' : message

  // Persist outbound message
  const { data: saved, error: msgErr } = await admin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      direction:       'outbound',
      body:            message.trim(),
      meta_message_id: metaMessageId,
      status:          'sent',
      created_at:      now,
    })
    .select()
    .single()

  if (msgErr) {
    console.error('[inbox/reply] insert message error:', msgErr)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }

  // Update conversation preview
  await admin
    .from('conversations')
    .update({
      last_message_at:      now,
      last_message_preview: preview,
      updated_at:           now,
    })
    .eq('id', conversationId)

  return NextResponse.json({ ok: true, message: saved })
}
