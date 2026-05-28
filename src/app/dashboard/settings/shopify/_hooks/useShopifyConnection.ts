"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ShopifyConnection = Database['public']['Tables']['shopify_connections']['Row']

interface UseShopifyConnectionReturn {
  connection: ShopifyConnection | null
  loading: boolean
  error: string | null
  disconnect: () => Promise<void>
  refetch: () => void
}

export function useShopifyConnection(): UseShopifyConnectionReturn {
  const [connection, setConnection] = useState<ShopifyConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(n => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data, error: dbErr } = await (supabase as any)
        .from('shopify_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return
      if (dbErr) { setError(dbErr.message); setLoading(false); return }

      setConnection(data)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [tick])

  async function disconnect() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: dbErr } = await (supabase as any)
      .from('shopify_connections')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (dbErr) throw new Error(dbErr.message)

    setConnection(null)
  }

  return { connection, loading, error, disconnect, refetch }
}
