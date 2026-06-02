"use client"

import { useEffect, useState } from 'react'
import {
  CheckCircle2, AlertCircle, Copy, Check,
  ExternalLink, MessageSquare, Loader2, Eye, EyeOff,
} from 'lucide-react'

interface Config {
  wabaId:      string | null
  hasToken:    boolean
  webhookUrl:  string
  verifyToken: string
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
        {label}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden',
        background: 'var(--cream)',
      }}>
        <code style={{
          flex: 1, padding: '10px 14px', fontSize: 13,
          color: 'var(--text-dark)', fontFamily: 'monospace',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {value}
        </code>
        <button
          onClick={copy}
          title="Copy"
          style={{
            padding: '0 14px', height: 42, display: 'flex', alignItems: 'center',
            background: 'transparent', border: 'none', borderLeft: '1px solid var(--border)',
            cursor: 'pointer', color: copied ? '#15803D' : 'var(--text-muted)', flexShrink: 0,
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--cream-2)')}
          onMouseOut={e  => (e.currentTarget.style.background = 'transparent')}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function WhatsAppSettingsPage() {
  const [config,      setConfig]      = useState<Config | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [wabaId,      setWabaId]      = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [showToken,   setShowToken]   = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [result,      setResult]      = useState<{ ok: boolean; message: string; phones?: string[] } | null>(null)

  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then(r => r.json())
      .then((d: Config) => {
        setConfig(d)
        setWabaId(d.wabaId ?? '')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!wabaId.trim() || !accessToken.trim()) return
    setSaving(true)
    setResult(null)
    try {
      const res  = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wabaId, accessToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? 'Failed to save' })
      } else {
        const phones = (data.phoneNumbers ?? []).map((p: { display_phone_number: string }) => p.display_phone_number)
        setResult({ ok: true, message: 'Connected successfully!', phones })
        setConfig(prev => prev ? { ...prev, wabaId, hasToken: true } : prev)
        setAccessToken('')
      }
    } catch {
      setResult({ ok: false, message: 'Network error — please try again' })
    } finally {
      setSaving(false)
    }
  }

  const isConnected = !!(config?.wabaId && config?.hasToken)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid var(--border)', background: 'white',
    fontSize: 14, color: 'var(--text-dark)', outline: 'none',
    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <Loader2 size={20} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)', padding: '28px 32px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={17} style={{ color: '#15803D' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.01em' }}>
              WhatsApp Business
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Connect your Meta WABA to send messages and receive replies
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>

        {/* Status card */}
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 14,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {isConnected
            ? <CheckCircle2 size={18} style={{ color: '#15803D', flexShrink: 0 }} />
            : <AlertCircle  size={18} style={{ color: '#D97706', flexShrink: 0 }} />
          }
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              {isConnected
                ? `WABA ID: ${config?.wabaId}`
                : 'Enter your credentials below to activate WhatsApp messaging'}
            </p>
          </div>
          {isConnected && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              background: 'rgba(37,211,102,0.1)', color: '#15803D',
              border: '1px solid rgba(37,211,102,0.2)',
            }}>
              Active
            </span>
          )}
        </div>

        {/* Credentials form */}
        <form onSubmit={handleSave} style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>
              API Credentials
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Found in Meta Business Manager → WhatsApp → API Setup
            </p>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* WABA ID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                WhatsApp Business Account (WABA) ID
              </label>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                A numeric ID found in Meta Business Manager → Settings → WhatsApp Accounts
              </p>
              <input
                style={inputStyle}
                placeholder="e.g. 123456789012345"
                value={wabaId}
                onChange={e => setWabaId(e.target.value)}
                onFocus={e  => (e.currentTarget.style.borderColor = 'var(--text-dark)')}
                onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Access token */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                Permanent Access Token
              </label>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                Generate a permanent (never-expiring) token from Meta Business Manager → System Users.
                {config?.hasToken && !accessToken && (
                  <span style={{ color: '#15803D', fontWeight: 600 }}> A token is already saved. Enter a new one to replace it.</span>
                )}
              </p>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inputStyle, paddingRight: 44 }}
                  type={showToken ? 'text' : 'password'}
                  placeholder={config?.hasToken ? '••••••••••••  (leave blank to keep existing)' : 'Paste your access token'}
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  onFocus={e  => (e.currentTarget.style.borderColor = 'var(--text-dark)')}
                  onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, display: 'flex',
                  }}
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Result banner */}
            {result && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: result.ok ? 'rgba(21,128,61,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${result.ok ? 'rgba(21,128,61,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: result.ok ? '#15803D' : '#DC2626' }}>
                  {result.message}
                </p>
                {result.ok && result.phones && result.phones.length > 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#15803D' }}>
                    Phone numbers found: {result.phones.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Save button */}
            <button
              type="submit"
              disabled={saving || !wabaId.trim() || (!accessToken.trim() && !config?.hasToken)}
              style={{
                alignSelf: 'flex-start',
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 22px', borderRadius: 10,
                background: 'var(--text-dark)', color: 'white',
                border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                opacity: (saving || !wabaId.trim() || (!accessToken.trim() && !config?.hasToken)) ? 0.45 : 1,
                transition: 'opacity 0.15s',
              }}
              onMouseOver={e => { if (!saving) e.currentTarget.style.opacity = '0.85' }}
              onMouseOut={e  => { if (!saving) e.currentTarget.style.opacity = '1' }}
            >
              {saving
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</>
                : isConnected ? 'Update credentials' : 'Connect WhatsApp'
              }
            </button>
          </div>
        </form>

        {/* Webhook setup */}
        {config && (
          <div style={{
            background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>
                Webhook Configuration
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Set these values in your Meta App → WhatsApp → Configuration → Webhooks
              </p>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CopyField label="Callback URL" value={config.webhookUrl} />
              <CopyField label="Verify Token"  value={config.verifyToken} />
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#6366F1' }}>
                  Webhook subscriptions to enable
                </p>
                {['messages', 'message_deliveries', 'message_reads'].map(sub => (
                  <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 size={12} style={{ color: '#6366F1', flexShrink: 0 }} />
                    <code style={{ fontSize: 12, color: 'var(--text-dark)' }}>{sub}</code>
                  </div>
                ))}
              </div>
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: '#6366F1', textDecoration: 'none',
                }}
              >
                Open Meta Developer Console <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}

        {/* Setup guide */}
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>
              Setup Guide
            </p>
          </div>
          <div style={{ padding: '20px' }}>
            {[
              { step: '1', title: 'Create a Meta Business App', body: 'Go to developers.facebook.com → My Apps → Create App → Business. Add the WhatsApp product.' },
              { step: '2', title: 'Get your WABA ID',           body: 'In your Meta App, go to WhatsApp → API Setup. Your WhatsApp Business Account ID is shown at the top.' },
              { step: '3', title: 'Generate a permanent token', body: 'Go to Business Settings → System Users → Add System User (Admin role). Generate a token with whatsapp_business_messaging + whatsapp_business_management permissions. Set it to never expire.' },
              { step: '4', title: 'Configure the webhook',      body: 'In your Meta App, go to WhatsApp → Configuration. Paste the Callback URL and Verify Token above. Subscribe to: messages, message_deliveries, message_reads.' },
              { step: '5', title: 'Paste credentials above',    body: 'Enter your WABA ID and permanent access token in the form above and click Connect WhatsApp. Tellero will validate them instantly.' },
            ].map(({ step, title, body }) => (
              <div key={step} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(56,0,8,0.07)', border: '1px solid rgba(56,0,8,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'var(--burgundy)',
                }}>
                  {step}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>{title}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
