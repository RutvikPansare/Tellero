'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AutomationTypeStats, AutomationTrendPoint, AnalyticsPeriod } from '@/types/analytics'

function safeRate(num: number, denom: number): number | null {
  return denom === 0 ? null : num / denom
}

const TYPE_LABELS: Record<string, string> = {
  cod_confirmation: 'COD Confirmation',
  cod_timeout: 'COD Timeout',
  abandoned_cart: 'Abandoned Cart',
  abandoned_cart_reminder_2: 'Cart Reminder #2',
  order_confirmed: 'Order Confirmation',
  order_shipped: 'Shipping Update',
  order_cancelled: 'Order Cancelled',
  reorder_reminder: 'Reorder Reminders',
  win_back: 'Win-back',
}

function periodToDate(period: AnalyticsPeriod): string | null {
  if (period === 'all_time') return null
  const days = period === 'last_7_days' ? 7 : period === 'last_30_days' ? 30 : 90
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
}

export function useAutomationAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('last_30_days')
  const [typeStats, setTypeStats] = useState<AutomationTypeStats[]>([])
  const [trendData, setTrendData] = useState<AutomationTrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }

      const startDate = periodToDate(period)

      // Fetch all automation_queue items in period
      let query = (supabase as any)
        .from('automation_queue')
        .select('event_type, status, delivered_at, read_at, replied_at, created_at')
        .eq('user_id', user.id)

      if (startDate) query = query.gte('created_at', startDate)
      const { data, error: fetchErr } = await query.limit(5000)
      if (fetchErr) { setError(fetchErr.message); setLoading(false); return }

      // Group by event_type
      // eslint-disable-line
      const groups: Record<string, any[]> = {}
      for (const row of (data ?? [])) {
        const et = row.event_type as string
        if (!groups[et]) groups[et] = []
        groups[et].push(row)
      }

      const stats: AutomationTypeStats[] = Object.entries(groups)
        .filter(([et]) => TYPE_LABELS[et])
        .map(([et, rows]) => {
          const sent = rows.filter(r => r.status === 'sent').length
          const delivered = rows.filter(r => r.delivered_at != null).length
          const read = rows.filter(r => r.read_at != null).length
          const replied = rows.filter(r => r.replied_at != null).length
          return {
            event_type: et,
            label: TYPE_LABELS[et] ?? et,
            sent_count: sent,
            delivered_count: delivered,
            read_count: read,
            replied_count: replied,
            delivery_rate: safeRate(delivered, sent),
            read_rate: safeRate(read, Math.max(delivered, 1)),
            reply_rate: safeRate(replied, sent),
          }
        })
        .sort((a, b) => b.sent_count - a.sent_count)

      setTypeStats(stats)

      // Build trend data — last 6 months regardless of period filter
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString()
      const { data: trendRaw } = await (supabase as any)
        .from('automation_queue')
        .select('event_type, status, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo)
        .eq('status', 'sent')
        .limit(10000)

      const monthBuckets: Record<string, Record<string, number>> = {}
      for (const row of (trendRaw ?? [])) {
        const month = (row.created_at as string).slice(0, 7) // YYYY-MM
        if (!monthBuckets[month]) monthBuckets[month] = {}
        const et = row.event_type as string
        monthBuckets[month][et] = (monthBuckets[month][et] ?? 0) + 1
      }

      const trend: AutomationTrendPoint[] = Object.entries(monthBuckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, counts]) => ({
          month,
          cod_confirmation: counts.cod_confirmation ?? 0,
          abandoned_cart: (counts.abandoned_cart ?? 0) + (counts.abandoned_cart_reminder_2 ?? 0),
          order_confirmed: counts.order_confirmed ?? 0,
          order_shipped: counts.order_shipped ?? 0,
          reorder_reminder: counts.reorder_reminder ?? 0,
          win_back: counts.win_back ?? 0,
        }))

      setTrendData(trend)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [period]) // eslint-disable-line

  useEffect(() => { fetchData() }, [fetchData])

  return { period, setPeriod, typeStats, trendData, loading, error }
}
