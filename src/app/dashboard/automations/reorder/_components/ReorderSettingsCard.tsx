'use client'

import { useState, useCallback } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import type { ReorderSettings, ProductRule, ShopifyProductOption } from '@/types/reorder'
import type { ValidationErrors } from '../_hooks/useReorderSettings'
import type { ReorderStats } from '@/types/reorder'
import { ReorderProductRules } from './ReorderProductRules'

const SEND_TIMES = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7
  return { value: `${String(h).padStart(2, '0')}:00`, label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'} IST` }
})

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <button
      role="switch" aria-checked={on} onClick={onToggle} disabled={disabled}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? 'var(--burgundy)' : 'var(--border)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

interface Props {
  settings:         ReorderSettings
  shopifyProducts:  ShopifyProductOption[]
  productsLoading:  boolean
  loading:          boolean
  saving:           boolean
  error:            string | null
  validationErrors: ValidationErrors
  stats:            ReorderStats
  statsLoading:     boolean
  onUpdate:         (updates: Partial<ReorderSettings>) => Promise<void>
  onAddRule:        (rule: ProductRule) => Promise<void>
  onUpdateRule:     (productId: string, updates: Partial<ProductRule>) => Promise<void>
  onRemoveRule:     (productId: string) => Promise<void>
}

export function ReorderSettingsCard({
  settings, shopifyProducts, productsLoading, loading, saving, error,
  validationErrors, stats, statsLoading, onUpdate, onAddRule, onUpdateRule, onRemoveRule,
}: Props) {
  const [draft, setDraft] = useState<ReorderSettings | null>(null)
  const current = draft ?? settings
  const isDirty = draft !== null

  const update = (patch: Partial<ReorderSettings>) =>
    setDraft(prev => ({ ...(prev ?? settings), ...patch }))

  const handleSave = async () => {
    if (!draft) return
    await onUpdate(draft)
    setDraft(null)
  }

  const handleAddRule = useCallback(() => {
    // Find the first product not already in rules; fall back to a blank entry
    const firstAvailable = shopifyProducts.find(
      p => !current.product_rules.some(r => r.product_id === p.id)
    )
    const newRule: ProductRule = firstAvailable
      ? { product_id: firstAvailable.id, product_title: firstAvailable.title, reminder_days: current.default_reminder_days, enabled: true }
      : { product_id: `custom_${Date.now()}`, product_title: 'Select product', reminder_days: current.default_reminder_days, enabled: true }

    setDraft(prev => {
      const base = prev ?? settings
      return { ...base, product_rules: [...base.product_rules, newRule] }
    })
  }, [shopifyProducts, current, settings])

  const handleUpdateRule = useCallback((productId: string, updates: Partial<ProductRule>) => {
    setDraft(prev => {
      const base = prev ?? settings
      return {
        ...base,
        product_rules: base.product_rules.map(r =>
          r.product_id === productId ? { ...r, ...updates } : r
        ),
      }
    })
  }, [settings])

  const handleRemoveRule = useCallback((productId: string) => {
    setDraft(prev => {
      const base = prev ?? settings
      return { ...base, product_rules: base.product_rules.filter(r => r.product_id !== productId) }
    })
  }, [settings])

  if (loading) {
    return (
      <div className="rounded-2xl p-6 animate-pulse" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)', height: 220 }} />
    )
  }

  // Estimated impact — only show if data available and meaningful
  const showImpact = !statsLoading && stats.eligibleCustomers > 0
  const estimatedRevenue = showImpact
    ? Math.round(stats.eligibleCustomers * 0.25 * (stats.revenueFromReorders / Math.max(stats.reorderedThisMonth, 1) || 500))
    : 0

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      {/* Header toggle */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-dark)', fontSize: 16, margin: 0 }}>
            Reorder Reminders
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '3px 0 0' }}>
            Automatically remind customers to reorder when their product is likely running low
          </p>
        </div>
        <Toggle on={current.enabled} onToggle={() => update({ enabled: !current.enabled })} disabled={saving} />
      </div>

      {/* Estimated impact banner */}
      {current.enabled && showImpact && estimatedRevenue > 0 && (
        <div className="rounded-xl p-4 mb-5 flex gap-3 items-start" style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.18)' }}>
          <TrendingUp size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#15803d', margin: 0, lineHeight: 1.5 }}>
            <strong>{stats.eligibleCustomers}</strong> customers have pending reminders this month.
            At 25% conversion: ~<strong>₹{estimatedRevenue.toLocaleString('en-IN')}</strong> in additional revenue.
          </p>
        </div>
      )}

      {current.enabled && (
        <div className="flex flex-col gap-6" style={{ opacity: saving ? 0.6 : 1 }}>
          {/* Default reminder timing */}
          <div>
            <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
              Default reminder timing
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Send reminder after</span>
              <input
                type="number"
                min={7}
                max={365}
                value={current.default_reminder_days}
                onChange={e => update({ default_reminder_days: Number(e.target.value) })}
                style={{
                  width: 70, padding: '7px 10px', borderRadius: 10,
                  border: `1px solid ${validationErrors['default_reminder_days'] ? '#ef4444' : 'var(--border)'}`,
                  background: 'var(--cream-1)', fontSize: 13, color: 'var(--text-dark)',
                  outline: 'none', textAlign: 'center',
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>days from shipment</span>
            </div>
            {validationErrors['default_reminder_days'] && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>
                {validationErrors['default_reminder_days']}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
              Skincare: 25–35 days · Supplements: 28–35 days · Hair care: 40–60 days · Fashion: not recommended
            </p>
          </div>

          {/* Send time */}
          <div>
            <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
              Preferred send time
            </label>
            <select
              value={current.send_time}
              onChange={e => update({ send_time: e.target.value })}
              style={{
                padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--cream-1)', fontSize: 13, color: 'var(--text-dark)',
                outline: 'none', cursor: 'pointer',
              }}
            >
              {SEND_TIMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
              Morning (9–11 AM) and evening (7–9 PM) IST work best for Indian customers.
            </p>
          </div>

          {/* Product rules */}
          <div>
            <label className="block mb-1" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
              Product-specific rules <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px' }}>
              Override the default timing for specific products
            </p>
            <ReorderProductRules
              rules={current.product_rules}
              shopifyProducts={shopifyProducts}
              productsLoading={productsLoading}
              validationErrors={validationErrors}
              onAdd={handleAddRule}
              onUpdate={handleUpdateRule}
              onRemove={handleRemoveRule}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-4" style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>}

      {isDirty && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{
              background: 'var(--burgundy)', color: 'white', border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          <button
            onClick={() => setDraft(null)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}
