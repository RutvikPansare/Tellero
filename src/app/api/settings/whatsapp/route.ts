import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET — return current waba_id (never the token) + webhook config */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('waba_id, meta_access_token')
    .eq('id', user.id)
    .single()

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://tellero.in'
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN ?? 'tellero_webhook_2026'

  return NextResponse.json({
    wabaId:      profile?.waba_id        ?? null,
    hasToken:    !!profile?.meta_access_token,
    webhookUrl:  `${appUrl}/api/webhooks/meta`,
    verifyToken,
  })
}

/** POST — save waba_id + access_token to profiles */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wabaId, accessToken } = await request.json() as { wabaId: string; accessToken: string }

  if (!wabaId?.trim()) {
    return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 })
  }
  if (!accessToken?.trim()) {
    return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
  }

  // Quick smoke-test: fetch phone numbers from Meta to validate credentials
  const testRes = await fetch(
    `https://graph.facebook.com/v18.0/${wabaId.trim()}/phone_numbers`,
    { headers: { Authorization: `Bearer ${accessToken.trim()}` } }
  )
  if (!testRes.ok) {
    const err = await testRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: err?.error?.message ?? 'Invalid credentials — could not reach Meta API' },
      { status: 400 }
    )
  }

  const phoneData = await testRes.json()
  const phoneNumbers: Array<{ id: string; display_phone_number: string; verified_name: string }> =
    phoneData?.data ?? []

  const { error: dbErr } = await (supabase as any)
    .from('profiles')
    .update({ waba_id: wabaId.trim(), meta_access_token: accessToken.trim() })
    .eq('id', user.id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, phoneNumbers })
}
