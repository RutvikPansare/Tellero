'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReorderLogItem, ReorderStats } from '@/types/reorder'

type LogFilter = 'all' | 'pending' | 'sent' | 'reordered' | 'cancelled'

interface UseReorderLogReturn {
  logItems: ReorderLogItem[]
  stats:    ReorderStats
  filter:   LogFilter
  setFilter: (f: LogFilter) => void
  loading:  boolean
  error:    string | null
}

const EMPTY_STATS: ReorderStats = {
  sentThisMonth:       0,
  sentLastMonth:       0,
  reorderedThisMonth:  0,
  reorderedLastMonth:  0,
  conversionRate:      0,
  revenueFromReorders: 0,
  eligibleCustomers:   0,
}

export function useReorderLog(userId: string): UseReorderLogReturn {
  const [allItems, setAllItems] = useState<ReorderLogItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [filter, setFilter]     = useState<LogFilter>('all')

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let cancelled = false

    const fetch = async () => {
      const { data, error: dbErr } = await (supabase as any)
        .from('automation_queue')
        .select(`
          id, recipient_phone, status, scheduled_for, sent_at,
          source_product_id, template_variables,
          contacts ( name ),
          orders!source_order_id ( shopify_order_number )
        `)
        .eq('user_id', userId)
        .eq('event_type', 'reorder_reminder')
        .order('created_at', { ascending: false })
        .limit(100)

      if (cancelled) return
      if (dbErr) { setError(dbErr.message); setLoading(false); return }

      // For sent items in last 30 days, check if customer reordered
      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const recentlySent = (data ?? []).filter(
        (row: Record<string, unknown>) => row.status === 'sent' && row.sent_at && (row.sent_at as string) > since30d
      )

      // Batch: fetch newer orders for phones that received reminders
      const phonesWithReminders = Array.from(new Set(recentlySent.map((r: Record<string, unknown>) => r.recipient_phone as string)))
      const reorderedPhoneProducts = new Set<string>()
      const reorderValues: Record<string, number> = {}

      if (phonesWithReminders.length > 0) {
        const { data: reorders } = await (supabase as any)
          .from('orders')
          .select('customer_phone, total_price, shopify_created_at, line_items')
          .eq('user_id', userId)
          .in('customer_phone', phonesWithReminders)
          .gte('shopify_created_at', since30d)

        for (const item of recentlySent) {
          const sentAt = item.sent_at as string
          const phone  = item.recipient_phone as string
          const productId = item.source_product_id as string
          const key    = `${phone}:${productId}`

          const match = (reorders ?? []).find((o: Record<string, unknown>) => {
            if (o.customer_phone !== phone) return false
            if ((o.shopify_created_at as string) <= sentAt) return false
            // Check JSONB line_items for this product
            const items = Array.isArray(o.line_items) ? o.line_items : []
            return items.some(
              (li: { product_id?: string | number }) => String(li.product_id) === productId
            )
          })

          if (match) {
            reorderedPhoneProducts.add(key)
            reorderValues[key] = Number(match.total_price ?? 0)
          }
        }
      }

      const mapped: ReorderLogItem[] = (data ?? []).map((row: Record<string, unknown>) => {
        const vars = (row.template_variables as Record<string, string>) ?? {}
        const productId = row.source_product_id as string ?? ''
        const phone     = row.recipient_phone as string ?? ''
        const key       = `${phone}:${productId}`
        const reordered = reorderedPhoneProducts.has(key)

        return {
          id:                    row.id as string,
          recipient_phone:       phone,
          contact_name:          (row.contacts as { name?: string } | null)?.name ?? null,
          source_product_id:     productId,
          product_name:          vars.product_name ?? productId,
          original_order_number: (row.orders as { shopify_order_number?: string } | null)?.shopify_order_number ?? '—',
          scheduled_for:         row.scheduled_for as string,
          sent_at:               row.sent_at as string | null,
          status:                row.status as ReorderLogItem['status'],
          reordered,
          reorder_value:         reordered ? (reorderValues[key] ?? null) : null,
        }
      })

      setAllItems(mapped)
      setLoading(false)
    }

    fetch()

    const channel = supabase
      .channel('reorder:queue')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'automation_queue',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const updated = payload.new as Record<string, unknown>
        if (updated.event_type !== 'reorder_reminder') return
        setAllItems(prev =>
          prev.map(e => e.id === updated.id
            ? { ...e, status: updated.status as ReorderLogItem['status'], sent_at: updated.sent_at as string | null }
            : e
          )
        )
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Compute stats
  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const sentThisMonth  = allItems.filter(i => i.sent_at && new Date(i.sent_at) >= startThisMonth)
  const sentLastMonth  = allItems.filter(i => i.sent_at && new Date(i.sent_at) >= startLastMonth && new Date(i.sent_at) < startThisMonth)
  const reorderedThisMonth = sentThisMonth.filter(i => i.reordered)
  const reorderedLastMonth = sentLastMonth.filter(i => i.reordered)
  const revenue = reorderedThisMonth.reduce((s, i) => s + (i.reorder_value ?? 0), 0)

  const stats: ReorderStats = {
    sentThisMonth:       sentThisMonth.length,
    sentLastMonth:       sentLastMonth.length,
    reorderedThisMonth:  reorderedThisMonth.length,
    reorderedLastMonth:  reorderedLastMonth.length,
    conversionRate:      sentThisMonth.length > 0
      ? Math.round((reorderedThisMonth.length / sentThisMonth.length) * 100)
      : 0,
    revenueFromReorders: revenue,
    eligibleCustomers:   allItems.filter(i => i.status === 'pending').length,
  }

  const filtered: ReorderLogItem[] =
    filter === 'all'       ? allItems :
    filter === 'reordered' ? allItems.filter(i => i.reordered) :
    allItems.filter(i => i.status === filter)

  return { logItems: filtered, stats, filter, setFilter, loading, error }
}
