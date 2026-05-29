import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planName } = await request.json()
  if (!planName || !['starter', 'growth', 'scale'].includes(planName)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const admin = createAdminClient()
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 })
  }

  const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')

  try {
    // Get profile
    const { data: profile } = await admin
      .from('profiles')
      .select('id, email, full_name, brand_name, razorpay_customer_id, razorpay_subscription_id, plan_status')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Block if already has active subscription
    if (profile.razorpay_subscription_id && profile.plan_status === 'active') {
      return NextResponse.json({ error: 'Already has active subscription' }, { status: 409 })
    }

    // Get Razorpay plan ID
    const { data: rpPlan } = await (admin as any)
      .from('razorpay_plans')
      .select('razorpay_plan_id')
      .eq('plan_name', planName)
      .single()

    if (!rpPlan) {
      return NextResponse.json({ error: 'Plan not configured in Razorpay' }, { status: 500 })
    }

    // Get or create Razorpay customer
    let customerId = profile.razorpay_customer_id
    if (!customerId) {
      const customerRes = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.full_name ?? profile.brand_name ?? 'Brand',
          email: profile.email,
        }),
      })
      if (!customerRes.ok) {
        const err = await customerRes.json()
        console.error('[billing] Razorpay customer creation failed:', err)
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 503 })
      }
      const customerData = await customerRes.json()
      customerId = customerData.id

      await admin
        .from('profiles')
        .update({ razorpay_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create subscription
    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: rpPlan.razorpay_plan_id,
        customer_notify: 1,
        quantity: 1,
        total_count: 120,
        customer_id: customerId,
        notes: {
          user_id: user.id,
          plan_name: planName,
        },
      }),
    })

    if (!subRes.ok) {
      const err = await subRes.json()
      console.error('[billing] Razorpay subscription creation failed:', err)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 503 })
    }

    const subData = await subRes.json()

    // Store subscription ID
    await admin
      .from('profiles')
      .update({ razorpay_subscription_id: subData.id })
      .eq('id', user.id)

    return NextResponse.json({
      subscriptionId: subData.id,
      shortUrl: subData.short_url,
    })
  } catch (err) {
    console.error('[billing] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
