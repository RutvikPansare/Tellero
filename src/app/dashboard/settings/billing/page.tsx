'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePlan } from '@/hooks/usePlan'
import { CurrentPlanCard } from './_components/CurrentPlanCard'
import { PlanSelector } from './_components/PlanSelector'
import { BillingStatusBanner } from './_components/BillingStatusBanner'

export default function BillingPage() {
  const { plan, planStatus, currentPeriodEnd, isLoading, refetch } = usePlan()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Handle payment=success redirect from Razorpay
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      // Refetch plan after short delay (webhook may still be processing)
      const t1 = setTimeout(() => refetch(), 2000)
      const t2 = setTimeout(() => refetch(), 5000)

      // Clean URL
      router.replace('/dashboard/settings/billing', { scroll: false })

      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [searchParams, refetch, router])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <p style={{ color: 'var(--text-muted)' }}>Loading billing...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ maxWidth: 1200 }}>
      <h1 className="font-bold" style={{ fontSize: 24, color: 'var(--text-dark)', marginBottom: 24 }}>Billing</h1>

      <div className="flex flex-col gap-6">
        {(planStatus === 'past_due' || planStatus === 'cancelled') && (
          <BillingStatusBanner planStatus={planStatus} currentPeriodEnd={currentPeriodEnd} />
        )}

        <CurrentPlanCard plan={plan} planStatus={planStatus} currentPeriodEnd={currentPeriodEnd} />

        <PlanSelector currentPlan={plan} />
      </div>
    </div>
  )
}
