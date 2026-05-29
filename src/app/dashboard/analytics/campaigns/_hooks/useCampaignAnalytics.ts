'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CampaignSummary, OverallStats, AnalyticsPeriod } from '@/types/analytics'

function safeRate(num: number, denom: number): number | null {
  return denom === 0 ? null : num / denom
}

function periodToDate(period: AnalyticsPeriod): string | null {
  if (period === 'all_time') return null
  const days = period === 'last_7_days' ? 7 : period === 'last_30_days' ? 30 : 90
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
}

export function useCampaignAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('last_30_days')
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats>({
    total_campaigns: 0, total_messages_sent: 0,
    avg_delivery_rate: null, avg_read_rate: null, avg_reply_rate: null,
    total_failed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }

      let query = (supabase as any)
        .from('broadcasts')
        .select('id, name, message, segment, status, scheduled_at, sent_at, total_recipients, delivered, opened, replied, opted_out, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const startDate = periodToDate(period)
      if (startDate) query = query.gte('created_at', startDate)

      const { data, error: fetchErr } = await query.limit(200)
      if (fetchErr) { setError(fetchErr.message); setLoading(false); return }

      // eslint-disable-line
      const mapped: CampaignSummary[] = (data ?? []).map((b: any) => {
        const sent = b.total_recipients ?? 0
        const delivered = b.delivered ?? 0
        const read = b.opened ?? 0
        const replied = b.replied ?? 0
        const failed = (b.opted_out ?? 0)
        return {
          id: b.id,
          name: b.name,
          template_name: b.segment ?? '',
          status: b.status,
          scheduled_at: b.scheduled_at,
          completed_at: b.sent_at,
          recipient_count: sent,
          sent_count: sent,
          delivered_count: delivered,
          read_count: read,
          replied_count: replied,
          failed_count: failed,
          delivery_rate: safeRate(delivered, sent),
          read_rate: safeRate(read, Math.max(delivered, 1)),
          reply_rate: safeRate(replied, sent),
          failure_rate: safeRate(failed, sent),
        }
      })

      setCampaigns(mapped)

      // Calculate overall stats
      const totalSent = mapped.reduce((s, c) => s + c.sent_count, 0)
      const totalDelivered = mapped.reduce((s, c) => s + c.delivered_count, 0)
      const totalRead = mapped.reduce((s, c) => s + c.read_count, 0)
      const totalReplied = mapped.reduce((s, c) => s + c.replied_count, 0)
      const totalFailed = mapped.reduce((s, c) => s + c.failed_count, 0)

      setOverallStats({
        total_campaigns: mapped.length,
        total_messages_sent: totalSent,
        avg_delivery_rate: safeRate(totalDelivered, totalSent),
        avg_read_rate: safeRate(totalRead, Math.max(totalDelivered, 1)),
        avg_reply_rate: safeRate(totalReplied, totalSent),
        total_failed: totalFailed,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [period]) // eslint-disable-line

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  return { period, setPeriod, campaigns, overallStats, loading, error, refetch: fetchCampaigns }
}
