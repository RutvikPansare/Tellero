'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OrderNotifEventType = 'order_confirmed' | 'order_shipped'
export type OrderNotifFilter = 'all' | 'order_confirmed' | 'order_shipped'

export interface OrderNotifEntry {
  id: string
  user_id: string
  event_type: OrderNotifEventType
  order_id: string | null
  recipient_phone: string
  status: 'pending' | 'processing' | 'sent' | 'cancelled' | 'failed'
  template_variables: Record<string, string>
  sent_at: string | null
  error_message: string | null
  created_at: string
  // joined from orders
  order_number: string | null
  total_price: number | null
  customer_name: string | null
  tracking_number: string | null
}

export interface OrderNotifStats {
  confirmationsSentThisMonth: number
  shippingUpdatesSentThisMonth: number
  confirmationsSentLastMonth: number
  shippingUpdatesSentLastMonth: number
  avgDeliveryDays: number | null
}

interface UseOrderNotificationLogReturn {
  entries: OrderNotifEntry[]
  stats: OrderNotifStats
  filter: OrderNotifFilter
  setFilter: (f: OrderNotifFilter) => void
  loading: boolean
  error: string | null
}

export function useOrderNotificationLog(userId: string): UseOrderNotificationLogReturn {
  const [allEntries, setAllEntries] = useState<OrderNotifEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [filter, setFilter]         = useState<OrderNotifFilter>('all')

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let cancelled = false

    const fetchEntries = async () => {
      const { data, error: dbErr } = await (supabase as any)
        .from('automation_queue')
        .select(`
          id, user_id, event_type, order_id, recipient_phone,
          status, template_variables, sent_at, error_message, created_at,
          orders (
            shopify_order_number,
            total_price,
            customer_name,
            tracking_number
          )
        `)
        .eq('user_id', userId)
        .in('event_type', ['order_confirmed', 'order_shipped'])
        .order('created_at', { ascending: false })
        .limit(100)

      if (cancelled) return
      if (dbErr) { setError(dbErr.message); setLoading(false); return }

      const mapped: OrderNotifEntry[] = (data ?? []).map((row: any) => ({ // eslint-disable-line
        id:                  row.id,
        user_id:             row.user_id,
        event_type:          row.event_type as OrderNotifEventType,
        order_id:            row.order_id,
        recipient_phone:     row.recipient_phone,
        status:              row.status,
        template_variables:  row.template_variables ?? {},
        sent_at:             row.sent_at,
        error_message:       row.error_message,
        created_at:          row.created_at,
        order_number:        row.orders?.shopify_order_number ?? row.template_variables?.order_number ?? null,
        total_price:         row.orders?.total_price ?? null,
        customer_name:       row.orders?.customer_name ?? row.template_variables?.customer_name ?? null,
        tracking_number:     row.orders?.tracking_number ?? row.template_variables?.tracking_number ?? null,
      }))

      setAllEntries(mapped)
      setLoading(false)
    }

    fetchEntries()

    // Realtime: update status live as cron processes items
    const channel = supabase
      .channel('order-notif:queue')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'automation_queue',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as any // eslint-disable-line
          if (!['order_confirmed', 'order_shipped'].includes(updated.event_type)) return
          setAllEntries(prev =>
            prev.map(e => e.id === updated.id ? { ...e, status: updated.status, sent_at: updated.sent_at } : e)
          )
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const sentThisMonth  = allEntries.filter(e => e.sent_at && new Date(e.sent_at) >= startOfThisMonth)
  const sentLastMonth  = allEntries.filter(e => e.sent_at && new Date(e.sent_at) >= startOfLastMonth && new Date(e.sent_at) < startOfThisMonth)

  const stats: OrderNotifStats = {
    confirmationsSentThisMonth:  sentThisMonth.filter(e => e.event_type === 'order_confirmed').length,
    shippingUpdatesSentThisMonth: sentThisMonth.filter(e => e.event_type === 'order_shipped').length,
    confirmationsSentLastMonth:  sentLastMonth.filter(e => e.event_type === 'order_confirmed').length,
    shippingUpdatesSentLastMonth: sentLastMonth.filter(e => e.event_type === 'order_shipped').length,
    avgDeliveryDays: null, // computed from orders table in future
  }

  const filtered = filter === 'all' ? allEntries : allEntries.filter(e => e.event_type === filter)

  return { entries: filtered, stats, filter, setFilter, loading, error }
}
