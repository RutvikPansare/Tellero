'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlanCard } from './PlanCard'
import type { PlanName } from '@/lib/planLimits'

interface Props {
  currentPlan: PlanName
}

const PLANS: PlanName[] = ['free', 'starter', 'growth', 'scale']

export function PlanSelector({ currentPlan }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSelect(planName: PlanName) {
    if (planName === 'free' || planName === currentPlan) return
    setLoading(true)

    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Failed to create subscription')
        setLoading(false)
        return
      }

      const { shortUrl } = await res.json()
      if (shortUrl) {
        window.location.href = shortUrl
      } else {
        router.refresh()
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-bold" style={{ fontSize: 18, color: 'var(--text-dark)', marginBottom: 16 }}>Choose a plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(p => (
          <PlanCard
            key={p}
            planName={p}
            currentPlan={currentPlan}
            onSelect={handleSelect}
            loading={loading}
            recommended={p === 'starter'}
          />
        ))}
      </div>
    </div>
  )
}
