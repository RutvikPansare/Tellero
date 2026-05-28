'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AbandonedCartSettings {
  enabled: boolean
  delay_minutes: number
  send_second_reminder: boolean
  second_reminder_hours: number
  template_name: string
}

export const DEFAULT_ABANDONED_CART_SETTINGS: AbandonedCartSettings = {
  enabled: false,
  delay_minutes: 60,
  send_second_reminder: false,
  second_reminder_hours: 24,
  template_name: 'abandoned_cart_recovery',
}

interface UseAbandonedCartSettingsReturn {
  settings: AbandonedCartSettings
  loading: boolean
  saving: boolean
  error: string | null
  monthlyAbandonedCount: number
  monthlyAbandonedValue: number
  estimatedRecovery: number
  updateSettings: (updates: Partial<AbandonedCartSettings>) => Promise<void>
}

export function useAbandonedCartSettings(userId: string): UseAbandonedCartSettingsReturn {
  const [settings, setSettings] = useState<AbandonedCartSettings>(DEFAULT_ABANDONED_CART_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [monthlyAbandonedCount, setMonthlyAbandonedCount] = useState(0)
  const [monthlyAbandonedValue, setMonthlyAbandonedValue] = useState(0)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    Promise.all([
      (supabase as any).from('profiles').select('abandoned_cart_settings').eq('id', userId).single(),
      (supabase as any)
        .from('abandoned_checkouts')
        .select('total_price')
        .eq('user_id', userId)
        .gte('created_at', since30d),
    ])
      .then(([profileRes, checkoutsRes]) => {
        if (profileRes.data?.abandoned_cart_settings) {
          setSettings({
            ...DEFAULT_ABANDONED_CART_SETTINGS,
            ...(profileRes.data.abandoned_cart_settings as Partial<AbandonedCartSettings>),
          })
        }
        const checkouts = (checkoutsRes.data ?? []) as { total_price: number }[]
        setMonthlyAbandonedCount(checkouts.length)
        setMonthlyAbandonedValue(checkouts.reduce((sum, c) => sum + Number(c.total_price), 0))
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const updateSettings = useCallback(
    async (updates: Partial<AbandonedCartSettings>) => {
      setSaving(true)
      setError(null)
      const newSettings = { ...settings, ...updates }
      const supabase = createClient()

      try {
        const { error: dbErr } = await (supabase as any)
          .from('profiles')
          .update({ abandoned_cart_settings: newSettings })
          .eq('id', userId)
        if (dbErr) throw new Error(dbErr.message)

        // When disabling, cancel all pending abandoned_cart queue items for this brand
        if (settings.enabled && !newSettings.enabled) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('user_id', userId)
            .in('event_type', ['abandoned_cart', 'abandoned_cart_reminder_2'])
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

  // Recovering 35% of abandoned carts at full value is a realistic estimate
  const estimatedRecovery = Math.round(monthlyAbandonedValue * 0.35)

  return {
    settings,
    loading,
    saving,
    error,
    monthlyAbandonedCount,
    monthlyAbandonedValue,
    estimatedRecovery,
    updateSettings,
  }
}
