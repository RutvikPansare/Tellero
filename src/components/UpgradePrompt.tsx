'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import { PLAN_DISPLAY, PLAN_FEATURES, type PlanName } from '@/lib/planLimits'

interface Props {
  feature: string
  requiredPlan: PlanName
  currentPlan: PlanName
  compact?: boolean
}

export function UpgradePrompt({ feature, requiredPlan, currentPlan, compact }: Props) {
  const display = PLAN_DISPLAY[requiredPlan]
  const features = PLAN_FEATURES[requiredPlan]

  if (compact) {
    return (
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5"
        style={{ fontSize: 12, fontWeight: 500, background: 'rgba(34,197,94,0.08)', color: '#16A34A', textDecoration: 'none', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        ⬆ {display.label} required — Upgrade →
      </Link>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center" style={{ padding: '60px 32px' }}>
      <div className="flex flex-col items-center text-center" style={{ maxWidth: 420 }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <Lock size={22} style={{ color: '#16A34A' }} />
        </div>
        <h2 className="font-bold" style={{ fontSize: 20, color: 'var(--text-dark)', marginBottom: 8 }}>
          Upgrade to {display.label.replace(' Plan', '')} to unlock {feature}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          You&apos;re currently on the {PLAN_DISPLAY[currentPlan].label}. Upgrade to get access to:
        </p>
        <ul style={{ textAlign: 'left', margin: '0 0 24px', padding: 0, listStyle: 'none' }}>
          {features.slice(0, 5).map(f => (
            <li key={f} className="flex items-center gap-2 py-1" style={{ fontSize: 13, color: 'var(--text-mid)' }}>
              <span style={{ color: '#16A34A' }}>✓</span> {f}
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/settings/billing"
          className="rounded-lg px-6 py-2.5 font-medium"
          style={{ fontSize: 14, background: '#16A34A', color: 'white', textDecoration: 'none' }}
        >
          Upgrade now →
        </Link>
        <Link
          href="/dashboard/settings/billing"
          style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textDecoration: 'none' }}
        >
          See all plans →
        </Link>
      </div>
    </div>
  )
}
