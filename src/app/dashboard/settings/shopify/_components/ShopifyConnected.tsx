"use client"

import { useState } from 'react'
import { ShoppingBag, CheckCircle2, Calendar, Clock, AlertCircle } from 'lucide-react'
import { ShopifyWebhookStatus } from './ShopifyWebhookStatus'
import { ShopifyOrderStats } from './ShopifyOrderStats'
import { ShopifyDisconnectModal } from './ShopifyDisconnectModal'
import type { Database } from '@/types/database'

type ShopifyConnection = Database['public']['Tables']['shopify_connections']['Row']

interface ShopifyConnectedProps {
  connection: ShopifyConnection
  onDisconnect: () => Promise<void>
}

export function ShopifyConnected({ connection, onDisconnect }: ShopifyConnectedProps) {
  const [showModal, setShowModal] = useState(false)

  async function handleDisconnect() {
    await onDisconnect()
    setShowModal(false)
  }

  return (
    <>
      <div style={{
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        maxWidth: 600,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(149,191,71,0.1)', border: '1.5px solid rgba(149,191,71,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShoppingBag size={20} style={{ color: '#95BF47' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>
                  {connection.shop_domain}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E' }}>Connected</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Connected {relativeTime(connection.installed_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Last webhook: {connection.last_webhook_at ? relativeTime(connection.last_webhook_at) : 'No webhooks yet'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Stats + webhook status */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ShopifyOrderStats connection={connection} />
          <ShopifyWebhookStatus connection={connection} />
        </div>

        {/* Danger zone */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'rgba(239,68,68,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Disconnecting will pause all automations. Your data will be preserved.
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '7px 14px', border: '1.5px solid rgba(239,68,68,0.3)',
                borderRadius: 8, background: 'transparent',
                fontSize: 13, fontWeight: 500, color: '#EF4444',
                cursor: 'pointer', flexShrink: 0, marginLeft: 16,
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
              onMouseOut={e  => { e.currentTarget.style.background = 'transparent' }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ShopifyDisconnectModal
          shopDomain={connection.shop_domain}
          onConfirm={handleDisconnect}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
