"use client"

import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { Database } from '@/types/database'

type ShopifyConnection = Database['public']['Tables']['shopify_connections']['Row']

interface ShopifyWebhookStatusProps {
  connection: ShopifyConnection
}

const WEBHOOK_DEFINITIONS = [
  { key: 'orders_create',     label: 'Order placed'     },
  { key: 'orders_fulfilled',  label: 'Order shipped'    },
  { key: 'orders_cancelled',  label: 'Order cancelled'  },
  { key: 'checkouts_create',  label: 'Cart abandoned'   },
  { key: 'app_uninstalled',   label: 'App uninstalled'  },
]

export function ShopifyWebhookStatus({ connection }: ShopifyWebhookStatusProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const webhookIds = (connection.webhook_ids ?? {}) as Record<string, number>

  async function handleRefresh() {
    setRefreshing(true)
    setMessage(null)
    try {
      const res = await fetch('/api/shopify/webhooks/refresh', { method: 'POST' })
      if (res.ok) {
        setMessage({ text: 'Webhooks refreshed successfully', ok: true })
      } else {
        setMessage({ text: 'Failed to refresh webhooks', ok: false })
      }
    } catch {
      setMessage({ text: 'Network error — please try again', ok: false })
    } finally {
      setRefreshing(false)
    }
  }

  const allRegistered = WEBHOOK_DEFINITIONS.every(w => webhookIds[w.key])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Webhook status
        </p>
        {!allRegistered && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', border: '1.5px solid var(--border)',
              borderRadius: 8, background: 'white', fontSize: 12,
              color: 'var(--text-mid)', cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        )}
      </div>

      <div style={{
        background: 'var(--cream)', border: '1.5px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {WEBHOOK_DEFINITIONS.map((w, i) => {
          const isActive = !!webhookIds[w.key]
          return (
            <div
              key={w.key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 16px',
                borderBottom: i < WEBHOOK_DEFINITIONS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-dark)' }}>{w.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isActive
                  ? <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                  : <XCircle size={14} style={{ color: '#EF4444' }} />
                }
                <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#22C55E' : '#EF4444' }}>
                  {isActive ? 'Active' : 'Not registered'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {message && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: message.ok ? '#22C55E' : '#EF4444' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
