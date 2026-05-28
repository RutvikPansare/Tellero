'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LineItem {
  title: string
  quantity: number
  price: string
}

export interface AbandonedCheckout {
  id: string
  user_id: string
  shopify_checkout_id: string
  contact_id: string | null
  customer_phone: string | null
  customer_name: string | null
  customer_email: string | null
  total_price: number
  line_items: LineItem[]
  abandoned_checkout_url: string | null
  recovered: boolean
  recovered_at: string | null
  recovery_revenue: number | null
  message_sent_at: string | null
  shopify_created_at: string | null
  created_at: string
}

export interface AbandonedCartStats {
  totalThisMonth: number
  recoveredThisMonth: number
  recoveryRate: number
  revenueRecovered: number
  totalLastMonth: number
  recoveredLastMonth: number
  recoveryRateLastMonth: number
  revenueRecoveredLastMonth: number
}

interface UseAbandonedCartLogReturn {
  checkouts: AbandonedCheckout[]
  stats: AbandonedCartStats
  loading: boolean
  error: string | null
}

function calcStats(
  checkouts: AbandonedCheckout[],
  since: Date,
  until: Date
): { total: number; recovered: number; revenue: number } {
  const inRange = checkouts.filter(c => {
    const d = new Date(c.created_at)
    return d >= since && d < until
  })
  const recovered = inRange.filter(c => c.recovered)
  return {
    total:     inRange.length,
    recovered: recovered.length,
    revenue:   recovered.reduce((sum, c) => sum + Number(c.recovery_revenue ?? 0), 0),
  }
}

export function useAbandonedCartLog(userId: string): UseAbandonedCartLogReturn {
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let cancelled = false

    const fetchCheckouts = async () => {
      const { data, error: dbErr } = await (supabase as any)
        .from('abandoned_checkouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (cancelled) return
      if (dbErr) { setError(dbErr.message); setLoading(false); return }
      setCheckouts((data ?? []) as AbandonedCheckout[])
      setLoading(false)
    }

    fetchCheckouts()

    // Realtime: update recovered status live when orders come in
    const channel = supabase
      .channel('abandoned-cart:checkouts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'abandoned_checkouts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setCheckouts(prev =>
            prev.map(c =>
              c.id === (payload.new as AbandonedCheckout).id
                ? { ...c, ...(payload.new as AbandonedCheckout) }
                : c
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'abandoned_checkouts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setCheckouts(prev => [payload.new as AbandonedCheckout, ...prev])
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  const now       = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonth = calcStats(checkouts, startOfMonth, now)
  const lastMonth = calcStats(checkouts, startOfLastMonth, startOfMonth)

  const stats: AbandonedCartStats = {
    totalThisMonth:          thisMonth.total,
    recoveredThisMonth:      thisMonth.recovered,
    recoveryRate:            thisMonth.total > 0 ? Math.round((thisMonth.recovered / thisMonth.total) * 100) : 0,
    revenueRecovered:        thisMonth.revenue,
    totalLastMonth:          lastMonth.total,
    recoveredLastMonth:      lastMonth.recovered,
    recoveryRateLastMonth:   lastMonth.total > 0 ? Math.round((lastMonth.recovered / lastMonth.total) * 100) : 0,
    revenueRecoveredLastMonth: lastMonth.revenue,
  }

  return { checkouts, stats, loading, error }
}
