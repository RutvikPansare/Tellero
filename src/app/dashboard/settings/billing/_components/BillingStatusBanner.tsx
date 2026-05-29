'use client'

import { AlertCircle } from 'lucide-react'

interface Props {
  planStatus: 'past_due' | 'cancelled'
  currentPeriodEnd: string | null
}

export function BillingStatusBanner({ planStatus, currentPeriodEnd }: Props) {
  if (planStatus === 'past_due') {
    return (
      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#FEF3CD', border: '1px solid #F6D860' }}>
        <AlertCircle size={18} style={{ color: '#D97706' }} />
        <p style={{ fontSize: 13, color: '#92400E', flex: 1 }}>
          Your payment is overdue. Please update your payment method to keep all features active.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
      <AlertCircle size={18} style={{ color: '#EF4444' }} />
      <p style={{ fontSize: 13, color: '#991B1B', flex: 1 }}>
        Your subscription has been cancelled.
        {currentPeriodEnd && (
          <> Features remain active until {new Date(currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.</>
        )}
      </p>
    </div>
  )
}
