'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CODOrderInfo {
  shopify_order_number: string | null
  total_price: number
  currency: string
  financial_status: string | null
  fulfillment_status: string | null
  customer_name: string | null
}

export interface CODConfirmation {
  id: string
  user_id: string
  order_id: string | null
  automation_queue_id: string | null
  customer_phone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_reply' | 'failed'
  customer_reply: string | null
  shopify_order_cancelled: boolean
  sent_at: string
  replied_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  orders: CODOrderInfo | null
}

export interface CODStats {
  total: number
  confirmed: number
  cancelled: number
  noReply: number
  pending: number
}

interface UseCODLogReturn {
  confirmations: CODConfirmation[]
  stats: CODStats
  loading: boolean
  error: string | null
}

export function useCODLog(userId: string): UseCODLogReturn {
  const [confirmations, setConfirmations] = useState<CODConfirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let cancelled = false

    const fetchConfirmations = async () => {
      const { data, error: dbErr } = await (supabase as any)
        .from('cod_confirmations')
        .select(`
          *,
          orders (
            shopify_order_number,
            total_price,
            currency,
            financial_status,
            fulfillment_status,
            customer_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (cancelled) return
      if (dbErr) { setError(dbErr.message); setLoading(false); return }
      setConfirmations((data ?? []) as CODConfirmation[])
      setLoading(false)
    }

    fetchConfirmations()

    // Realtime subscription — cod_confirmations table needs Realtime enabled in Supabase dashboard
    const channel = supabase
      .channel('cod:confirmations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cod_confirmations', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConfirmations(prev => [payload.new as CODConfirmation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setConfirmations(prev =>
              prev.map(c =>
                c.id === (payload.new as CODConfirmation).id
                  ? { ...c, ...(payload.new as CODConfirmation) }
                  : c
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  const stats: CODStats = {
    total:     confirmations.length,
    confirmed: confirmations.filter(c => c.status === 'confirmed').length,
    cancelled: confirmations.filter(c => c.status === 'cancelled' || c.status === 'no_reply').length,
    noReply:   confirmations.filter(c => c.status === 'no_reply').length,
    pending:   confirmations.filter(c => c.status === 'pending').length,
  }

  return { confirmations, stats, loading, error }
}
