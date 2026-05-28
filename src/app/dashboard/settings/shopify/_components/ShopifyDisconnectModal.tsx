"use client"

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ShopifyDisconnectModalProps {
  shopDomain: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function ShopifyDisconnectModal({ shopDomain, onConfirm, onCancel }: ShopifyDisconnectModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: 'white', borderRadius: 16,
        padding: 28, maxWidth: 440, width: '100%', margin: '0 16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>
              Disconnect Shopify
            </h3>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>
          You&apos;re about to disconnect <strong style={{ color: 'var(--text-dark)' }}>{shopDomain}</strong> from Tellero.
        </p>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          All automations will be paused. Your order history and contacts will be preserved. You can reconnect at any time.
        </p>

        {error && (
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#EF4444', background: 'rgba(239,68,68,0.06)', padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 0',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-btn, 10px)',
              background: 'white', fontSize: 14, fontWeight: 500,
              color: 'var(--text-mid)', cursor: 'pointer',
            }}
          >
            Keep connected
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 0',
              border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-btn, 10px)',
              background: 'rgba(239,68,68,0.06)', fontSize: 14, fontWeight: 600,
              color: '#EF4444', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Disconnecting…' : 'Yes, disconnect'}
          </button>
        </div>
      </div>
    </div>
  )
}
