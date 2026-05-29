'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { PLAN_DISPLAY, PLAN_FEATURES, type PlanName } from '@/lib/planLimits'

const PLANS: PlanName[] = ['free', 'starter', 'growth', 'scale']

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', color: '#111', marginBottom: 8 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 48 }}>
          Start free. Upgrade when you need more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {PLANS.map(p => (
            <PricingCard key={p} planName={p} recommended={p === 'starter'} />
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, textAlign: 'center', marginBottom: 32, color: '#111' }}>
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-5">
            <FAQ q="Can I try paid features before subscribing?" a="Yes! Sign up for free and explore the dashboard. When you're ready to unlock automations and broadcasts, upgrade in one click." />
            <FAQ q="How does billing work?" a="All plans are billed monthly via Razorpay. You can cancel anytime — your features stay active until the end of the billing cycle." />
            <FAQ q="What happens if my payment fails?" a="We'll retry automatically. Your features remain active for a grace period. You'll be notified to update your payment method." />
            <FAQ q="Can I downgrade my plan?" a="Yes. Contact us and we'll adjust your plan at the end of your current billing cycle." />
            <FAQ q="Is there a setup fee?" a="No. All plans have zero setup fees. Pay only the monthly subscription." />
          </div>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ planName, recommended }: { planName: PlanName; recommended?: boolean }) {
  const display = PLAN_DISPLAY[planName]
  const features = PLAN_FEATURES[planName]

  return (
    <div
      className="rounded-2xl p-6 flex flex-col relative"
      style={{
        border: recommended ? '2px solid #25D366' : '1px solid #E5E7EB',
        boxShadow: recommended ? '0 0 24px rgba(37,211,102,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {recommended && (
        <span style={{
          position: 'absolute', top: -10, right: 16, fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: 99, background: '#25D366', color: 'white',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          Most popular
        </span>
      )}

      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 4 }}>
        {display.label.replace(' Plan', '')}
      </h3>
      <p style={{ fontSize: 24, fontWeight: 700, color: display.color, marginBottom: 20 }}>
        {display.price}
      </p>

      <ul style={{ flex: 1, listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 py-1" style={{ fontSize: 13, color: '#555' }}>
            <Check size={14} style={{ color: '#16A34A', marginTop: 2, flexShrink: 0 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={planName === 'free' ? '/login' : '/login'}
        className="block w-full text-center rounded-lg py-2.5 font-medium"
        style={{
          fontSize: 14,
          background: planName === 'free' ? '#F3F4F6' : '#16A34A',
          color: planName === 'free' ? '#111' : 'white',
          textDecoration: 'none',
        }}
      >
        {planName === 'free' ? 'Start for free →' : 'Start free trial →'}
      </Link>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>{q}</h4>
      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{a}</p>
    </div>
  )
}
