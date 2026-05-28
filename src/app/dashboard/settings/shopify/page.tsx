"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { ShopifyConnectionCard } from './_components/ShopifyConnectionCard'
import { useShopifyConnection } from './_hooks/useShopifyConnection'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

function ShopifySettingsSkeleton() {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ height: 240, background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

export default function ShopifySettingsPage() {
  const { connection, loading, error, disconnect, refetch } = useShopifyConnection()
  const [userId, setUserId] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ text: string; ok: boolean } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  useEffect(() => {
    const connected = searchParams.get('connected')
    const errorParam = searchParams.get('error')

    if (connected === 'true') {
      setBanner({ text: 'Shopify store connected successfully! Webhooks are now active.', ok: true })
      refetch()
    } else if (errorParam) {
      const messages: Record<string, string> = {
        session_expired: 'Session expired — please try connecting again.',
        invalid_state: 'Security check failed — please try connecting again.',
        invalid_hmac: 'Invalid Shopify signature — please try connecting again.',
        oauth_failed: 'OAuth failed — please check your Shopify store URL and try again.',
        db_error: 'Failed to save connection — please try again.',
      }
      setBanner({ text: messages[errorParam] ?? 'Something went wrong — please try again.', ok: false })
    }
  }, [searchParams, refetch])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--cream)' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-dark)' }}>
          Shopify Integration
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
          Connect your Shopify store to enable order automations on WhatsApp.
        </p>
      </div>

      {/* Status banner */}
      {banner && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: banner.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${banner.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: banner.ok ? '#16A34A' : '#DC2626' }}>
            {banner.text}
          </p>
          <button
            onClick={() => setBanner(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#DC2626' }}>{error}</p>
        </div>
      )}

      {loading || !userId
        ? <ShopifySettingsSkeleton />
        : (
          <ShopifyConnectionCard
            connection={connection}
            userId={userId}
            onDisconnect={disconnect}
          />
        )
      }
    </div>
  )
}
