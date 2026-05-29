'use client'

import { PLAN_DISPLAY, type PlanName } from '@/lib/planLimits'

interface Props {
  plan: PlanName
  planStatus: 'active' | 'past_due' | 'cancelled' | 'trialing'
  currentPeriodEnd: string | null
}

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  active:    { dot: '#16A34A', label: 'Active' },
  past_due:  { dot: '#D97706', label: 'Payment due' },
  cancelled: { dot: '#EF4444', label: 'Cancelled' },
  trialing:  { dot: '#3B82F6', label: 'Trial' },
}

export function CurrentPlanCard({ plan, planStatus, currentPeriodEnd }: Props) {
  const display = PLAN_DISPLAY[plan]
  const status = STATUS_CONFIG[planStatus] ?? STATUS_CONFIG.active

  return (
    <div className="rounded-2xl p-6 flex items-center justify-between" style={{ border: '1px solid var(--border)', background: 'white' }}>
      <div className="flex items-center gap-4">
        {/* Plan badge */}
        <div className="rounded-xl px-4 py-2" style={{ background: display.bg }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: display.color }}>{display.label}</span>
        </div>
        {/* Status */}
        <div className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.dot, display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{status.label}</span>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        {plan === 'free' ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upgrade to unlock all features</p>
        ) : (
          <>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>{display.price}</p>
            {currentPeriodEnd && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {planStatus === 'cancelled' ? 'Active until' : 'Next billing'}:{' '}
                {new Date(currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
