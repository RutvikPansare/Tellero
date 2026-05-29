'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface OrderNotificationSettings {
  order_confirmation_enabled: boolean
  shipping_update_enabled: boolean
  order_confirmation_template: string
  shipping_update_template: string
  include_items_in_confirmation: boolean
  estimated_delivery_days: number
}

export const DEFAULT_ORDER_NOTIFICATION_SETTINGS: OrderNotificationSettings = {
  order_confirmation_enabled: true,
  shipping_update_enabled: true,
  order_confirmation_template: 'order_confirmation',
  shipping_update_template: 'shipping_update',
  include_items_in_confirmation: true,
  estimated_delivery_days: 5,
}

interface UseOrderNotificationSettingsReturn {
  settings: OrderNotificationSettings
  loading: boolean
  saving: boolean
  error: string | null
  monthlyOrderCount: number
  updateSettings: (updates: Partial<OrderNotificationSettings>) => Promise<void>
}

export function useOrderNotificationSettings(userId: string): UseOrderNotificationSettingsReturn {
  const [settings, setSettings] = useState<OrderNotificationSettings>(DEFAULT_ORDER_NOTIFICATION_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [monthlyOrderCount, setMonthlyOrderCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    Promise.all([
      (supabase as any).from('profiles').select('order_notification_settings').eq('id', userId).single(),
      (supabase as any)
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('shopify_created_at', since30d),
    ])
      .then(([profileRes, ordersRes]) => {
        if (profileRes.data?.order_notification_settings) {
          setSettings({
            ...DEFAULT_ORDER_NOTIFICATION_SETTINGS,
            ...(profileRes.data.order_notification_settings as Partial<OrderNotificationSettings>),
          })
        }
        setMonthlyOrderCount(ordersRes.count ?? 0)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const updateSettings = useCallback(
    async (updates: Partial<OrderNotificationSettings>) => {
      setSaving(true)
      setError(null)
      const newSettings = { ...settings, ...updates }
      const supabase = createClient()

      try {
        const { error: dbErr } = await (supabase as any)
          .from('profiles')
          .update({ order_notification_settings: newSettings })
          .eq('id', userId)
        if (dbErr) throw new Error(dbErr.message)

        // Cancel pending queue items when disabling
        const eventTypes: string[] = []
        if (settings.order_confirmation_enabled && !newSettings.order_confirmation_enabled) {
          eventTypes.push('order_confirmed')
        }
        if (settings.shipping_update_enabled && !newSettings.shipping_update_enabled) {
          eventTypes.push('order_shipped')
        }
        if (eventTypes.length > 0) {
          await (supabase as any)
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('user_id', userId)
            .in('event_type', eventTypes)
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

  return { settings, loading, saving, error, monthlyOrderCount, updateSettings }
}
