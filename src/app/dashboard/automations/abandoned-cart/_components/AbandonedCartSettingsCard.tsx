'use client'

import { useState } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import type { AbandonedCartSettings } from '../_hooks/useAbandonedCartSettings'

interface Props {
  settings: AbandonedCartSettings
  loading: boolean
  saving: boolean
  error: string | null
  monthlyAbandonedCount: number
  monthlyAbandonedValue: number
  estimatedRecovery: number
  onUpdate: (updates: Partial<AbandonedCartSettings>) => Promise<void>
}

export function AbandonedCartSettingsCard({
  settings,
  loading,
  saving,
  error,
  monthlyAbandonedCount,
  monthlyAbandonedValue,
  estimatedRecovery,
  onUpdate,
}: Props) {
  const [draft, setDraft] = useState<AbandonedCartSettings | null>(null)
  const current = draft ?? settings
  const isDirty = draft !== null

  const update = (patch: Partial<AbandonedCartSettings>) =>
    setDraft(prev => ({ ...(prev ?? settings), ...patch }))

  const handleSave = async () => {
    if (!draft) return
    await onUpdate(draft)
    setDraft(null)
  }

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
            Abandoned Cart Recovery
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '3px 0 0' }}>
            Send a WhatsApp message when customers leave items in their cart
          </p>
        </div>
        <button
          role="switch"
          aria-checked={current.enabled}
          onClick={() => update({ enabled: !current.enabled })}
          style={{
            width: 44, height: 24, borderRadius: 99, border: 'none',
            cursor: 'pointer', flexShrink: 0,
            background: current.enabled ? 'var(--burgundy)' : 'var(--border)',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <span
            style={{
              position: 'absolute', top: 3,
              left: current.enabled ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>

      {/* Revenue opportunity banner */}
      {current.enabled && monthlyAbandonedCount > 0 && (
        <div
          className="rounded-xl p-4 mb-5 flex gap-3 items-start"
          style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.18)' }}
        >
          <TrendingUp size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#15803d', margin: 0, lineHeight: 1.5 }}>
            You had <strong>{monthlyAbandonedCount}</strong> abandoned carts last month worth{' '}
            <strong>₹{Math.round(monthlyAbandonedValue).toLocaleString('en-IN')}</strong>.
            Recovering 35% would generate{' '}
            <strong>₹{estimatedRecovery.toLocaleString('en-IN')}</strong> in additional revenue.
          </p>
        </div>
      )}

      {/* Settings body */}
      {current.enabled && (
        <div className="flex flex-col gap-5" style={{ opacity: saving ? 0.6 : 1 }}>
          {/* Delay */}
          <div>
            <label className="block mb-1" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
              Send message after
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={30}
                max={1440}
                value={current.delay_minutes}
                onChange={e => update({ delay_minutes: Math.min(1440, Math.max(30, Number(e.target.value))) })}
                style={{
                  width: 80, padding: '8px 12px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--cream-1)',
                  fontSize: 13, color: 'var(--text-dark)', outline: 'none',
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>minutes</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
              Most brands see best results at 60 minutes — long enough for the customer to decide, short enough to catch them while interested.
            </p>
          </div>

          {/* Second reminder toggle */}
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', margin: 0 }}>
                Send second reminder
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                A gentler follow-up if the first message isn&apos;t opened
              </p>
            </div>
            <button
              role="switch"
              aria-checked={current.send_second_reminder}
              onClick={() => update({ send_second_reminder: !current.send_second_reminder })}
              style={{
                width: 44, height: 24, borderRadius: 99, border: 'none',
                cursor: 'pointer', flexShrink: 0,
                background: current.send_second_reminder ? 'var(--burgundy)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute', top: 3,
                  left: current.send_second_reminder ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>

          {current.send_second_reminder && (
            <div style={{ paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
              <label className="block mb-1" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                Second reminder after
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={current.second_reminder_hours}
                  onChange={e => update({ second_reminder_hours: Math.min(72, Math.max(1, Number(e.target.value))) })}
                  style={{
                    width: 70, padding: '8px 12px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--cream-1)',
                    fontSize: 13, color: 'var(--text-dark)', outline: 'none',
                  }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>hours</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4" style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
      )}

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
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', cursor: 'pointer',
            }}
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}
