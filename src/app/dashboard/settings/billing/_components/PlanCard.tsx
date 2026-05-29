'use client'

import { Check } from 'lucide-react'
import { PLAN_DISPLAY, PLAN_FEATURES, type PlanName } from '@/lib/planLimits'

interface Props {
  planName: PlanName
  currentPlan: PlanName
  onSelect: (plan: PlanName) => void
  loading: boolean
  recommended?: boolean
}

export function PlanCard({ planName, currentPlan, onSelect, loading, recommended }: Props) {
  const display = PLAN_DISPLAY[planName]
  const features = PLAN_FEATURES[planName]
  const isCurrent = planName === currentPlan
  const isUpgrade = getOrder(planName) > getOrder(currentPlan)

  return (
    <div
      className="rounded-2xl p-5 flex flex-col relative"
      style={{
        border: recommended ? '2px solid #25D366' : '1px solid var(--border)',
        background: 'white',
        boxShadow: recommended ? '0 0 20px rgba(37,211,102,0.08)' : 'none',
      }}
    >
      {recommended && (
        <span style={{
          position: 'absolute', top: -10, right: 16, fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: 99, background: '#25D366', color: 'white',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          Most popular
        </span>
      )}

      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
        {display.label.replace(' Plan', '')}
      </h3>
      <p style={{ fontSize: 22, fontWeight: 700, color: display.color, marginBottom: 16 }}>
        {display.price}
      </p>

      <ul style={{ flex: 1, listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 py-1" style={{ fontSize: 13, color: 'var(--text-mid)' }}>
            <Check size={14} style={{ color: '#16A34A', marginTop: 2, flexShrink: 0 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(planName)}
        disabled={isCurrent || loading}
        className="w-full rounded-lg py-2.5 font-medium"
        style={{
          fontSize: 14,
          border: isCurrent ? '1px solid var(--border)' : 'none',
          background: isCurrent ? 'transparent' : isUpgrade ? '#16A34A' : 'var(--cream-2)',
          color: isCurrent ? 'var(--text-muted)' : isUpgrade ? 'white' : 'var(--text-dark)',
          cursor: isCurrent ? 'default' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {isCurrent ? 'Current plan' : isUpgrade ? `Upgrade to ${display.label.replace(' Plan', '')}` : 'Downgrade'}
      </button>
    </div>
  )
}

function getOrder(plan: PlanName): number {
  const order: Record<PlanName, number> = { free: 0, starter: 1, growth: 2, scale: 3 }
  return order[plan]
}
