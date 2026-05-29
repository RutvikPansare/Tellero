'use client'

import { useState } from 'react'
import { Loader2, Package } from 'lucide-react'
import type { OrderNotificationSettings } from '../_hooks/useOrderNotificationSettings'

interface Props {
  settings: OrderNotificationSettings
  loading: boolean
  saving: boolean
  error: string | null
  monthlyOrderCount: number
  onUpdate: (updates: Partial<OrderNotificationSettings>) => Promise<void>
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      disabled={disabled}
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

export function OrderNotificationSettingsCard({
  settings, loading, saving, error, monthlyOrderCount, onUpdate,
}: Props) {
  const [draft, setDraft] = useState<OrderNotificationSettings | null>(null)
  const current = draft ?? settings
  const isDirty = draft !== null

  const update = (patch: Partial<OrderNotificationSettings>) =>
    setDraft(prev => ({ ...(prev ?? settings), ...patch }))

  const handleSave = async () => {
    if (!draft) return
    await onUpdate(draft)
    setDraft(null)
  }

  const anyEnabled = current.order_confirmation_enabled || current.shipping_update_enabled

  if (loading) {
    return (
      <div className="rounded-2xl p-6 animate-pulse" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)', height: 200 }} />
    )
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      {/* Info box */}
      <div className="rounded-xl p-4 mb-6 flex gap-3 items-start" style={{ background: 'rgba(56,0,8,0.04)', border: '1px solid rgba(56,0,8,0.1)' }}>
        <Package size={16} style={{ color: 'var(--brand-dark)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'var(--text-mid)', margin: 0, lineHeight: 1.5 }}>
          Customers who receive order confirmation messages have{' '}
          <strong>40% lower support volume</strong> around order status queries.
          {monthlyOrderCount > 0 && (
            <> You processed <strong>{monthlyOrderCount}</strong> orders last month.</>
          )}
        </p>
      </div>

      {/* Automation 1 — Order Confirmation */}
      <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold" style={{ fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>
              Order Confirmation
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Sent immediately when any order is placed
            </p>
          </div>
          <Toggle
            on={current.order_confirmation_enabled}
            onToggle={() => update({ order_confirmation_enabled: !current.order_confirmation_enabled })}
            disabled={saving}
          />
        </div>

        {current.order_confirmation_enabled && (
          <div className="mt-4">
            <label className="block mb-1" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Template name
            </label>
            <input
              type="text"
              value={current.order_confirmation_template}
              onChange={e => update({ order_confirmation_template: e.target.value })}
              placeholder="order_confirmation"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--cream-1)',
                fontSize: 13, color: 'var(--text-dark)', outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Automation 2 — Shipping Update */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold" style={{ fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>
              Shipping Update
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Sent when Shopify marks the order as fulfilled
            </p>
          </div>
          <Toggle
            on={current.shipping_update_enabled}
            onToggle={() => update({ shipping_update_enabled: !current.shipping_update_enabled })}
            disabled={saving}
          />
        </div>

        {current.shipping_update_enabled && (
          <div className="mt-4">
            <label className="block mb-1" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Template name
            </label>
            <input
              type="text"
              value={current.shipping_update_template}
              onChange={e => update({ shipping_update_template: e.target.value })}
              placeholder="shipping_update"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--cream-1)',
                fontSize: 13, color: 'var(--text-dark)', outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Shared settings — when any automation on */}
      {anyEnabled && (
        <div className="pt-4 flex flex-col gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Include items */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>
                Include items list
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Show line items in confirmation message
              </p>
            </div>
            <Toggle
              on={current.include_items_in_confirmation}
              onToggle={() => update({ include_items_in_confirmation: !current.include_items_in_confirmation })}
              disabled={saving}
            />
          </div>

          {/* Estimated delivery days */}
          <div>
            <label className="block mb-1" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Estimated delivery days
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={current.estimated_delivery_days}
              onChange={e => update({ estimated_delivery_days: Math.max(1, Number(e.target.value)) })}
              style={{
                width: 80, padding: '8px 12px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--cream-1)',
                fontSize: 13, color: 'var(--text-dark)', outline: 'none',
              }}
            />
            <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-4" style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>}

      {/* Save */}
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
