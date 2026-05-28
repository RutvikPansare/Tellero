'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CODSettings {
  enabled: boolean
  confirmation_window_hours: number
  on_no_reply: 'cancel' | 'flag'
  on_no: 'cancel' | 'flag'
  template_name: string
}

export const DEFAULT_COD_SETTINGS: CODSettings = {
  enabled: false,
  confirmation_window_hours: 2,
  on_no_reply: 'cancel',
  on_no: 'cancel',
  template_name: 'cod_confirmation',
}

interface UseCODSettingsReturn {
  settings: CODSettings
  loading: boolean
  saving: boolean
  error: string | null
  monthlyCODOrders: number
  estimatedSavings: number
  updateSettings: (updates: Partial<CODSettings>) => Promise<void>
}

export function useCODSettings(userId: string): UseCODSettingsReturn {
  const [settings, setSettings] = useState<CODSettings>(DEFAULT_COD_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [monthlyCODOrders, setMonthlyCODOrders] = useState(0)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    Promise.all([
      // Fetch current COD settings from profile
      (supabase as any).from('profiles').select('cod_settings').eq('id', userId).single(),
      // Count COD orders in last 30 days (for savings estimate)
      (supabase as any)
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .or('payment_gateway.ilike.%cash%,payment_gateway.ilike.%cod%')
        .gte('shopify_created_at', since30d),
    ])
      .then(([profileRes, ordersRes]) => {
        if (profileRes.data?.cod_settings) {
          setSettings({ ...DEFAULT_COD_SETTINGS, ...(profileRes.data.cod_settings as Partial<CODSettings>) })
        }
        setMonthlyCODOrders(ordersRes.count ?? 0)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const updateSettings = useCallback(
    async (updates: Partial<CODSettings>) => {
      setSaving(true)
      setError(null)
      const newSettings = { ...settings, ...updates }
      const supabase = createClient()

      try {
        const { error: dbErr } = await (supabase as any)
          .from('profiles')
          .update({ cod_settings: newSettings })
          .eq('id', userId)
        if (dbErr) throw new Error(dbErr.message)

        // When disabling, cancel all pending COD queue items for this brand
        if (settings.enabled && !newSettings.enabled) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('user_id', userId)
            .eq('event_type', 'cod_confirmation')
            .eq('status', 'pending')
        }

        setSettings(newSettings)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
        throw e
      } finally {
        setSaving(false)
      }
    },
    [settings, userId]
  )

  // savings = returns prevented × reverse logistics cost per return
  // assumes 25% return rate reduction × ₹150 per return prevented
  const estimatedSavings = Math.round(monthlyCODOrders * 0.25 * 150)

  return { settings, loading, saving, error, monthlyCODOrders, estimatedSavings, updateSettings }
}
