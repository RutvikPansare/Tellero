"use client"

import { useState } from 'react'
import { CheckCircle2, ShoppingBag, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ShopifyDisconnectedProps {
  userId: string
}

export function ShopifyDisconnected({ userId }: ShopifyDisconnectedProps) {
  const [shopInput, setShopInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()

  function handleConnect() {
    setValidationError(null)
    const shop = shopInput.trim().toLowerCase()

    if (!shop) {
      setValidationError('Please enter your Shopify store URL')
      return
    }

    const normalized = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`
    if (!normalized.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      setValidationError('Please enter a valid Shopify store URL (e.g. mybrand.myshopify.com)')
      return
    }

    router.push(`/api/shopify/oauth/install?shop=${encodeURIComponent(normalized)}`)
  }

  const benefits = [
    { label: 'COD confirmation', detail: 'reduce returns by 40%' },
    { label: 'Abandoned cart recovery', detail: 'recover ₹30,000/month' },
    { label: 'Order tracking', detail: 'automatic shipping updates' },
    { label: 'Reorder reminders', detail: 'increase repeat purchases 30%' },
  ]

  return (
    <div style={{
      background: 'white',
      border: '1.5px solid var(--border)',
      borderRadius: 16,
      padding: 32,
      maxWidth: 560,
    }}>
      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(149,191,71,0.1)', border: '1.5px solid rgba(149,191,71,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ShoppingBag size={22} style={{ color: '#95BF47' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-dark)' }}>
            Connect your Shopify store
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Enable COD confirmation, abandoned cart recovery, order tracking, and reorder reminders automatically.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {benefits.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={15} style={{ color: '#22C55E', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-dark)' }}>
              <strong>{b.label}</strong>
              <span style={{ color: 'var(--text-muted)' }}> — {b.detail}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Shopify store URL
        </label>
        <input
          type="text"
          value={shopInput}
          onChange={e => { setShopInput(e.target.value); setValidationError(null) }}
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
          placeholder="mybrand.myshopify.com"
          style={{
            width: '100%', padding: '10px 14px',
            border: `1.5px solid ${validationError ? '#EF4444' : 'var(--border)'}`,
            borderRadius: 'var(--radius-btn, 10px)',
            fontSize: 14, color: 'var(--text-dark)',
            background: 'white', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => { if (!validationError) e.currentTarget.style.borderColor = 'var(--text-dark)' }}
          onBlur={e  => { if (!validationError) e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        {validationError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <AlertCircle size={13} style={{ color: '#EF4444' }} />
            <p style={{ margin: 0, fontSize: 12, color: '#EF4444' }}>{validationError}</p>
          </div>
        )}
      </div>

      {/* Connect button */}
      <button
        onClick={handleConnect}
        style={{
          width: '100%', padding: '11px 0',
          background: '#22C55E', border: 'none', borderRadius: 'var(--radius-btn, 10px)',
          color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          marginBottom: 12,
        }}
        onMouseOver={e => { e.currentTarget.style.background = '#16A34A' }}
        onMouseOut={e  => { e.currentTarget.style.background = '#22C55E' }}
      >
        Connect Shopify store
      </button>

      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
        You&apos;ll be redirected to Shopify to authorize Tellero.
        We only request read access to your orders and customers.
      </p>
    </div>
  )
}
