// POST /api/inbox/new
// Initiates a new outbound WhatsApp conversation using an approved template.
// Creates the conversation row if one doesn't exist yet for this phone number.
// Body: { phone, templateId, variableValues: Record<string,string> }

import { NextRequest, NextResponse } from 'next/server'
import { createClient }       from '@/lib/supabase/server'
import { createAdminClient }  from '@/lib/supabase/admin'

interface NewBody {
  phone:          string
  templateId:     string
  variableValues: Record<string, string>  // key = variable number "1","2"...
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: NewBody = await request.json()
  const { phone, templateId, variableValues = {} } = body

  if (!phone?.trim())      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  if (!templateId?.trim()) return NextResponse.json({ error: 'templateId is required' }, { status: 400 })

  const admin = createAdminClient()

  /* Fetch template */
  const { data: tmpl, error: tmplErr } = await admin
    .from('templates')
    .select('id, name, language, components, variable_labels')
    .eq('id', templateId)
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .single() as {
      data: {
        id: string; name: string; language: string;
        components: Array<{ type: string; text?: string; format?: string }> | null;
        variable_labels: Record<string, string> | null;
      } | null;
      error: unknown;
    }

  if (tmplErr || !tmpl) {
    return NextResponse.json({ error: 'Template not found or not approved' }, { status: 404 })
  }

  /* Fetch WhatsApp credentials */
  const { data: profile } = await admin
    .from('profiles')
    .select('waba_id, meta_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.waba_id || !profile?.meta_access_token) {
    return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 422 })
  }

  /* Get phone_number_id */
  const phonesRes = await fetch(
    `https://graph.facebook.com/v18.0/${profile.waba_id}/phone_numbers`,
    { headers: { Authorization: `Bearer ${profile.meta_access_token}` } }
  )
  if (!phonesRes.ok) {
    const phonesErr = await phonesRes.json().catch(() => ({}))
    console.error('[inbox/new] Meta phone_numbers error:', phonesErr)
    return NextResponse.json(
      { error: (phonesErr as any)?.error?.message ?? 'Failed to fetch phone number from Meta' },
      { status: 502 }
    )
  }
  const phonesData: { data: Array<{ id: string; display_phone_number: string }> } = await phonesRes.json()
  const phoneNumberId = phonesData.data?.[0]?.id
  if (!phoneNumberId) {
    return NextResponse.json({ error: 'No phone number configured on WABA' }, { status: 422 })
  }

  /* Normalise recipient phone: strip leading + */
  const recipientPhone = phone.trim().replace(/^\+/, '')

  /* Build template body parameters — order by variable number */
  const labels       = tmpl.variable_labels ?? {}
  const varNumbers   = Object.keys(labels).map(Number).sort((a, b) => a - b)
  const bodyParams   = varNumbers.map(n => ({
    type: 'text',
    text: variableValues[String(n)] ?? '',
  }))

  /* Build Meta components payload */
  const metaComponents: Array<{ type: string; parameters?: Array<{ type: string; text: string }> }> = []
  if (bodyParams.length > 0) {
    metaComponents.push({ type: 'body', parameters: bodyParams })
  }

  /* Map language to Meta locale format (e.g. "en" → "en_US", "hi" → "hi") */
  const langMap: Record<string, string> = {
    en: 'en_US', en_GB: 'en_GB', hi: 'hi', mr: 'mr', gu: 'gu',
    ta: 'ta', te: 'te', kn: 'kn', ml: 'ml', pa: 'pa',
  }
  const langCode = langMap[tmpl.language] ?? tmpl.language

  /* Send template message via Meta */
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
        type:              'template',
        template: {
          name:       tmpl.name,
          language:   { code: langCode },
          ...(metaComponents.length > 0 ? { components: metaComponents } : {}),
        },
      }),
    }
  )

  const metaData: { messages?: Array<{ id: string }>; error?: { message: string } } = await metaRes.json()
  if (!metaRes.ok) {
    console.error('[inbox/new] Meta error:', metaData)
    return NextResponse.json(
      { error: metaData.error?.message ?? 'Meta API error' },
      { status: 502 }
    )
  }

  const metaMessageId = metaData.messages?.[0]?.id ?? null
  const now           = new Date().toISOString()

  /* Resolve the body text preview (replace variables) */
  const bodyComp    = (tmpl.components ?? []).find(c => c.type === 'BODY')
  let preview       = bodyComp?.text ?? tmpl.name
  varNumbers.forEach(n => {
    preview = preview.replace(new RegExp(`\\{\\{${n}\\}\\}`, 'g'), variableValues[String(n)] ?? `{{${n}}}`)
  })
  if (preview.length > 80) preview = preview.slice(0, 77) + '…'

  /* Upsert conversation — use existing if one already exists for this phone */
  const normalPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`

  // Try to find existing conversation
  const { data: existing } = await admin
    .from('conversations')
    .select('id')
    .eq('user_id', user.id)
    .eq('customer_phone', normalPhone)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let conversationId: string

  if (existing?.id) {
    conversationId = existing.id
    await admin
      .from('conversations')
      .update({ last_message_at: now, last_message_preview: preview, status: 'open', updated_at: now })
      .eq('id', conversationId)
  } else {
    const { data: created, error: createErr } = await admin
      .from('conversations')
      .insert({
        user_id:              user.id,
        customer_phone:       normalPhone,
        customer_name:        null,
        status:               'open',
        last_message_at:      now,
        last_message_preview: preview,
        unread_count:         0,
        created_at:           now,
        updated_at:           now,
      })
      .select('id')
      .single()

    if (createErr || !created) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }
    conversationId = created.id
  }

  /* Insert outbound message */
  await admin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      direction:       'outbound',
      body:            bodyComp?.text ?? tmpl.name,
      meta_message_id: metaMessageId,
      status:          'sent',
      created_at:      now,
    })

  return NextResponse.json({ ok: true, conversationId })
}
