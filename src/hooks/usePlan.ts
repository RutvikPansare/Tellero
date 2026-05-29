'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLAN_LIMITS, canUseFeature, type PlanName, type PlanLimits } from '@/lib/planLimits'

interface PlanState {
  plan: PlanName
  planStatus: 'active' | 'past_due' | 'cancelled' | 'trialing'
  currentPeriodEnd: string | null
  limits: PlanLimits
  isLoading: boolean
  isPaid: boolean
  isActive: boolean
  can: (feature: keyof PlanLimits) => boolean
  refetch: () => Promise<void>
}

export function usePlan(): PlanState {
  const [plan, setPlan] = useState<PlanName>('free')
  const [planStatus, setPlanStatus] = useState<'active' | 'past_due' | 'cancelled' | 'trialing'>('active')
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data } = await (supabase as any)
        .from('profiles')
        .select('plan, plan_status, current_period_end')
        .eq('id', user.id)
        .single() as { data: { plan: string; plan_status: string; current_period_end: string | null } | null }

      if (data) {
        setPlan((data.plan as PlanName) ?? 'free')
        setPlanStatus((data.plan_status as typeof planStatus) ?? 'active')
        setCurrentPeriodEnd(data.current_period_end ?? null)
      }
    } catch {
      // Default to free on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchPlan() }, []) // eslint-disable-line

  return {
    plan,
    planStatus,
    currentPeriodEnd,
    limits: PLAN_LIMITS[plan],
    isLoading,
    isPaid: plan !== 'free',
    isActive: planStatus === 'active',
    can: (feature) => canUseFeature(plan, feature),
    refetch: fetchPlan,
  }
}
