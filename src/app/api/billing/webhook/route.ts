import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

function verifyRazorpaySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

// Map Razorpay plan IDs back to our plan names via notes or DB lookup
async function resolvePlanName(
  supabase: ReturnType<typeof createAdminClient>,
  payload: Record<string, unknown>
): Promise<string | null> {
  // First try notes
  const notes = (payload as { notes?: { plan_name?: string } }).notes
  if (notes?.plan_name) return notes.plan_name

  // Fallback: lookup by razorpay_plan_id in our table
  const planId = (payload as { plan_id?: string }).plan_id
  if (planId) {
    const { data } = await (supabase as any)
      .from('razorpay_plans')
      .select('plan_name')
      .eq('razorpay_plan_id', planId)
      .maybeSingle()
    return data?.plan_name ?? null
  }
  return null
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyRazorpaySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const event = JSON.parse(rawBody)
  const eventType = event.event as string
  const subscriptionPayload = event.payload?.subscription?.entity ?? {}
  const subscriptionId = subscriptionPayload.id as string | undefined

  // Log all events for debugging
  let userId: string | null = null
  if (subscriptionId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('razorpay_subscription_id', subscriptionId)
      .maybeSingle()
    userId = profile?.id ?? (subscriptionPayload.notes?.user_id as string) ?? null
  }

  await (supabase as any)
    .from('billing_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      razorpay_payload: event,
      processed: false,
    })

  if (!subscriptionId || !userId) {
    // Can't process without subscription ID — but still return 200
    console.log(`[billing/webhook] Received ${eventType} but no subscription_id or user_id`)
    return NextResponse.json({ ok: true })
  }

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const planName = await resolvePlanName(supabase, subscriptionPayload)
        if (planName) {
          await supabase
            .from('profiles')
            .update({
              plan: planName,
              plan_status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
              plan_updated_at: new Date().toISOString(),
            } as Record<string, unknown>)
            .eq('id', userId)
        }
        break
      }

      case 'subscription.halted': {
        await supabase
          .from('profiles')
          .update({ plan_status: 'past_due', plan_updated_at: new Date().toISOString() } as Record<string, unknown>)
          .eq('id', userId)
        break
      }

      case 'subscription.cancelled': {
        await supabase
          .from('profiles')
          .update({ plan_status: 'cancelled', plan_updated_at: new Date().toISOString() } as Record<string, unknown>)
          .eq('id', userId)
        break
      }

      default:
        break
    }

    // Mark event as processed
    await (supabase as any)
      .from('billing_events')
      .update({ processed: true })
      .eq('event_type', eventType)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
  } catch (err) {
    console.error(`[billing/webhook] Error processing ${eventType}:`, err)
    // Still return 200 — don't make Razorpay retry
  }

  return NextResponse.json({ ok: true })
}
