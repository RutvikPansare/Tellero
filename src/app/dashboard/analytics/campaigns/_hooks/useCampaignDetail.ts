'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CampaignSummary, RecipientStatus } from '@/types/analytics'

function safeRate(num: number, denom: number): number | null {
  return denom === 0 ? null : num / denom
}

export function useCampaignDetail(campaignId: string | null) {
  const [campaign, setCampaign] = useState<CampaignSummary | null>(null)
  const [recipients, setRecipients] = useState<RecipientStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!campaignId) { setCampaign(null); setRecipients([]); return }
    let cancelled = false

    async function fetchDetail() {
      setLoading(true)
      setError(null)
      try {
        // Fetch broadcast
        const { data: b, error: bErr } = await (supabase as any)
          .from('broadcasts')
          .select('id, name, message, segment, status, scheduled_at, sent_at, total_recipients, delivered, opened, replied, opted_out, created_at')
          .eq('id', campaignId)
          .single()

        if (bErr || !b) { setError(bErr?.message ?? 'Not found'); setLoading(false); return }
        if (cancelled) return

        const sent = b.total_recipients ?? 0
        const delivered = b.delivered ?? 0
        const read = b.opened ?? 0
        const replied = b.replied ?? 0
        const failed = b.opted_out ?? 0

        setCampaign({
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
        })

        // Fetch recipients
        const { data: recs, error: rErr } = await (supabase as any)
          .from('broadcast_recipients')
          .select('id, phone, status, sent_at, delivered_at, read_at, replied_at, failed_at, error_code, error_message, contact_id, contacts(name)')
          .eq('broadcast_id', campaignId)
          .order('failed_at', { ascending: false, nullsFirst: false })
          .order('read_at', { ascending: false, nullsFirst: false })
          .limit(500)

        if (rErr) { setError(rErr.message); setLoading(false); return }
        if (cancelled) return

        // eslint-disable-line
        setRecipients((recs ?? []).map((r: any) => ({
          id: r.id,
          phone: r.phone ?? '',
          contact_name: r.contacts?.name ?? null,
          status: r.status,
          sent_at: r.sent_at,
          delivered_at: r.delivered_at,
          read_at: r.read_at,
          replied_at: r.replied_at,
          failed_at: r.failed_at,
          error_code: r.error_code,
          error_message: r.error_message,
        })))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDetail()

    return () => { cancelled = true }
  }, [campaignId]) // eslint-disable-line

  // Poll if campaign is actively sending
  useEffect(() => {
    if (campaign?.status === 'sending') {
      pollRef.current = setInterval(() => {
        if (campaignId) {
          (supabase as any)
            .from('broadcasts')
            .select('total_recipients, delivered, opened, replied, opted_out, status')
            .eq('id', campaignId)
            .single()
            // eslint-disable-line
            .then(({ data }: any) => {
              if (data) {
                setCampaign(prev => prev ? {
                  ...prev,
                  sent_count: data.total_recipients ?? prev.sent_count,
                  delivered_count: data.delivered ?? prev.delivered_count,
                  read_count: data.opened ?? prev.read_count,
                  replied_count: data.replied ?? prev.replied_count,
                  failed_count: data.opted_out ?? prev.failed_count,
                  status: data.status,
                  delivery_rate: safeRate(data.delivered ?? 0, data.total_recipients ?? 1),
                  read_rate: safeRate(data.opened ?? 0, Math.max(data.delivered ?? 1, 1)),
                  reply_rate: safeRate(data.replied ?? 0, data.total_recipients ?? 1),
                  failure_rate: safeRate(data.opted_out ?? 0, data.total_recipients ?? 1),
                } : prev)
              }
            })
        }
      }, 30000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [campaign?.status, campaignId]) // eslint-disable-line

  return { campaign, recipients, loading, error }
}
