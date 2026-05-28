'use client'

import { useState } from 'react'
import { Loader2, TrendingDown } from 'lucide-react'
import type { CODSettings } from '../_hooks/useCODSettings'

interface Props {
  settings: CODSettings
  loading: boolean
  saving: boolean
  error: string | null
  monthlyCODOrders: number
  estimatedSavings: number
  onUpdate: (updates: Partial<CODSettings>) => Promise<void>
}

const WINDOW_OPTIONS = [
  { value: 1,  label: '1 hour'  },
  { value: 2,  label: '2 hours' },
  { value: 4,  label: '4 hours' },
  { value: 6,  label: '6 hours' },
  { value: 12, label: '12 hours' },
]

function RadioGroup({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: 'cancel' | 'flag'
  onChange: (v: 'cancel' | 'flag') => void
  disabled: boolean
}) {
  return (
    <div>
      <p className="mb-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
        {label}
      </p>
      <div className="flex gap-3">
        {([['cancel', 'Cancel order automatically'], ['flag', 'Flag for manual review']] as const).map(
          ([val, labelText]) => (
            <label
              key={val}
              className="flex items-center gap-2 cursor-pointer"
              style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
            >
              <input
                type="radio"
                name={label}
                value={val}
                checked={value === val}
                onChange={() => onChange(val)}
                style={{ accentColor: 'var(--burgundy)' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>{labelText}</span>
            </label>
          )
        )}
      </div>
    </div>
  )
}

export function CODSettingsCard({
  settings,
  loading,
  saving,
  error,
  monthlyCODOrders,
  estimatedSavings,
  onUpdate,
}: Props) {
  // Local draft state — user edits locally then saves
  const [draft, setDraft] = useState<CODSettings | null>(null)
  const current = draft ?? settings
  const isDirty = draft !== null

  const handleSave = async () => {
    if (!draft) return
    await onUpdate(draft)
    setDraft(null)
  }

  const update = (patch: Partial<CODSettings>) =>
    setDraft(prev => ({ ...(prev ?? settings), ...patch }))

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 animate-pulse"
        style={{ background: 'var(--cream-2)', border: '1px solid var(--border)', height: 180 }}
      />
    )
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}
    >
      {/* Header toggle */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-dark)', fontSize: 16, margin: 0 }}>
            COD Confirmation
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '3px 0 0' }}>
            Send a WhatsApp message asking customers to confirm their COD order
          </p>
        </div>
        {/* Toggle */}
        <button
          role="switch"
          aria-checked={current.enabled}
          onClick={() => update({ enabled: !current.enabled })}
          style={{
            width: 44,
            height: 24,
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            background: current.enabled ? 'var(--burgundy)' : 'var(--border)',
            position: 'relative',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: current.enabled ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>

      {/* Savings banner — shown when enabled */}
      {current.enabled && monthlyCODOrders > 0 && (
        <div
          className="rounded-xl p-4 mb-5 flex gap-3 items-start"
          style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.18)' }}
        >
          <TrendingDown size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#15803d', margin: 0, lineHeight: 1.5 }}>
            Brands using COD confirmation reduce return rates from ~35% to under 10%.
            Based on your <strong>{monthlyCODOrders}</strong> COD orders this month,
            this saves approximately{' '}
            <strong>₹{estimatedSavings.toLocaleString('en-IN')}/month</strong> in reverse logistics.
          </p>
        </div>
      )}

      {/* Settings body — only when enabled */}
      {current.enabled && (
        <div className="flex flex-col gap-5" style={{ opacity: saving ? 0.6 : 1 }}>
          {/* Confirmation window */}
          <div>
            <label
              className="block mb-2"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}
            >
              Confirmation window
            </label>
            <select
              value={current.confirmation_window_hours}
              onChange={e => update({ confirmation_window_hours: Number(e.target.value) })}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--cream-1)',
                fontSize: 13,
                color: 'var(--text-dark)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {WINDOW_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <RadioGroup
            label="If customer doesn't reply"
            value={current.on_no_reply}
            onChange={v => update({ on_no_reply: v })}
            disabled={saving}
          />

          <RadioGroup
            label="If customer replies NO"
            value={current.on_no}
            onChange={v => update({ on_no: v })}
            disabled={saving}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4" style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
      )}

      {/* Save button */}
      {isDirty && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{
              background: 'var(--burgundy)',
              color: 'white',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          <button
            onClick={() => setDraft(null)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}
