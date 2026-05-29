'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReorderSettings, ProductRule, ShopifyProductOption } from '@/types/reorder'

export const DEFAULT_REORDER_SETTINGS: ReorderSettings = {
  enabled:               false,
  default_reminder_days: 30,
  product_rules:         [],
  template_name:         'reorder_reminder',
  send_time:             '09:00',
}

export type ValidationErrors = Record<string, string>

interface UseReorderSettingsReturn {
  settings:          ReorderSettings
  shopifyProducts:   ShopifyProductOption[]
  productsLoading:   boolean
  loading:           boolean
  saving:            boolean
  error:             string | null
  validationErrors:  ValidationErrors
  updateSettings:    (updates: Partial<ReorderSettings>) => Promise<void>
  addProductRule:    (rule: ProductRule) => Promise<void>
  updateProductRule: (productId: string, updates: Partial<ProductRule>) => Promise<void>
  removeProductRule: (productId: string) => Promise<void>
}

function validate(settings: ReorderSettings): ValidationErrors {
  const errors: ValidationErrors = {}
  const d = settings.default_reminder_days
  if (!Number.isInteger(d) || d < 7 || d > 365) {
    errors['default_reminder_days'] = 'Must be between 7 and 365 days'
  }
  settings.product_rules.forEach((rule, i) => {
    if (!Number.isInteger(rule.reminder_days) || rule.reminder_days < 7 || rule.reminder_days > 365) {
      errors[`rule_${i}_reminder_days`] = 'Must be between 7 and 365 days'
    }
  })
  if (!/^\d{2}:\d{2}$/.test(settings.send_time)) {
    errors['send_time'] = 'Invalid time format'
  }
  return errors
}

export function useReorderSettings(userId: string): UseReorderSettingsReturn {
  const [settings, setSettings]             = useState<ReorderSettings>(DEFAULT_REORDER_SETTINGS)
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProductOption[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    ;(supabase as any)
      .from('profiles')
      .select('reorder_settings')
      .eq('id', userId)
      .single()
      .then(({ data }: { data: { reorder_settings: unknown } | null }) => {
        if (data?.reorder_settings) {
          setSettings({ ...DEFAULT_REORDER_SETTINGS, ...(data.reorder_settings as Partial<ReorderSettings>) })
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  // Fetch Shopify products for product rules dropdown
  useEffect(() => {
    if (!userId) return
    setProductsLoading(true)
    fetch('/api/shopify/products')
      .then(r => {
        if (!r.ok) return { products: [] }
        return r.json()
      })
      .then((data: { products?: ShopifyProductOption[] }) => {
        setShopifyProducts(data.products ?? [])
      })
      .catch(() => setShopifyProducts([]))
      .finally(() => setProductsLoading(false))
  }, [userId])

  const updateSettings = useCallback(async (updates: Partial<ReorderSettings>) => {
    const newSettings = { ...settings, ...updates }
    const errors = validate(newSettings)
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setError(null)
    const supabase = createClient()
    try {
      const { error: dbErr } = await (supabase as any)
        .from('profiles')
        .update({ reorder_settings: newSettings })
        .eq('id', userId)
      if (dbErr) throw new Error(dbErr.message)

      // Cancel pending reminders if globally disabled
      if (settings.enabled && !newSettings.enabled) {
        await (supabase as any)
          .from('automation_queue')
          .update({ status: 'cancelled' })
          .eq('user_id', userId)
          .eq('event_type', 'reorder_reminder')
          .eq('status', 'pending')
      }

      setSettings(newSettings)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      throw e
    } finally {
      setSaving(false)
    }
  }, [settings, userId])

  const addProductRule = useCallback(async (rule: ProductRule) => {
    const newRules = [...settings.product_rules, rule]
    await updateSettings({ product_rules: newRules })
  }, [settings.product_rules, updateSettings])

  const updateProductRule = useCallback(async (productId: string, updates: Partial<ProductRule>) => {
    const newRules = settings.product_rules.map(r =>
      r.product_id === productId ? { ...r, ...updates } : r
    )
    await updateSettings({ product_rules: newRules })
  }, [settings.product_rules, updateSettings])

  const removeProductRule = useCallback(async (productId: string) => {
    const newRules = settings.product_rules.filter(r => r.product_id !== productId)
    await updateSettings({ product_rules: newRules })
  }, [settings.product_rules, updateSettings])

  return {
    settings, shopifyProducts, productsLoading, loading, saving,
    error, validationErrors, updateSettings, addProductRule,
    updateProductRule, removeProductRule,
  }
}
