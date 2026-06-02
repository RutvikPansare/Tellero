"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader2, Search, User, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { STANDARD_VARIABLE_FIELDS } from '@/app/dashboard/templates/_components/steps/StepContent'

/* ─── Types ─────────────────────────────────────────────── */

interface ApprovedTemplate {
  id:              string
  name:            string
  language:        string
  body:            string | null
  components:      Array<{ type: string; text?: string }> | null
  variable_labels: Record<string, string> | null
}

interface ContactHit {
  id:    string
  name:  string | null
  phone: string
  email: string | null
  total_orders:  number
  total_spent:   number
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 9,
  border: '1.5px solid var(--border)', background: 'white',
  fontSize: 13, color: 'var(--text-dark)', outline: 'none',
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
  transition: 'border-color 0.15s', boxSizing: 'border-box',
}

const labelCss: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 6px',
}

/* ─── Resolve a variable from contact data ─────────────── */

function resolveVar(key: string, contact: ContactHit | null): string {
  if (!contact) return ''
  switch (key) {
    case 'name':         return contact.name ?? ''
    case 'first_name':   return contact.name?.split(' ')[0] ?? ''
    case 'phone':        return contact.phone
    case 'email':        return contact.email ?? ''
    case 'total_orders': return contact.total_orders.toString()
    case 'total_spent':  return `₹${contact.total_spent.toLocaleString('en-IN')}`
    default:             return ''
  }
}

/* ─── Contact search input ─────────────────────────────── */

function ContactSearch({
  selected, onSelect,
  phone, onPhoneChange,
}: {
  selected: ContactHit | null
  onSelect: (c: ContactHit | null) => void
  phone: string
  onPhoneChange: (v: string) => void
}) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ContactHit[]>([])
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('contacts')
        .select('id, name, phone, email, total_orders, total_spent')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(6)
      setResults(data ?? [])
      setOpen(true)
      setLoading(false)
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  if (selected) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 9,
        border: '1.5px solid var(--burgundy)', background: 'rgba(56,0,8,0.04)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'rgba(56,0,8,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: 'var(--burgundy)',
        }}>
          {selected.name ? selected.name[0].toUpperCase() : '#'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>
            {selected.name ?? selected.phone}
          </p>
          {selected.name && (
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{selected.phone}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => { onSelect(null); setQuery(''); onPhoneChange('') }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex' }}
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          style={{ ...inputStyle, paddingLeft: 32 }}
          placeholder="Search contacts or enter phone…"
          value={query || phone}
          onChange={e => {
            const v = e.target.value
            setQuery(v)
            onPhoneChange(v)
          }}
          onFocus={() => query && setOpen(true)}
        />
        {loading && (
          <Loader2 size={12} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
          background: 'white', border: '1.5px solid var(--border)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 4, overflow: 'hidden',
        }}>
          {results.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={() => {
                onSelect(c)
                onPhoneChange(c.phone)
                setQuery('')
                setOpen(false)
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', background: 'white', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--cream)')}
              onMouseOut={e  => (e.currentTarget.style.background = 'white')}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                  {c.name ?? c.phone}
                </p>
                {c.name && (
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{c.phone}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Template picker (compact list) ───────────────────── */

function TemplatePicker({
  selectedId, onSelect,
}: { selectedId: string; onSelect: (t: ApprovedTemplate) => void }) {
  const [templates, setTemplates] = useState<ApprovedTemplate[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await (supabase as any)
          .from('templates')
          .select('id, name, language, body, components, variable_labels')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        if (error) console.error('[TemplatePicker] query error:', error)
        setTemplates(data ?? [])
      } catch (err) {
        console.error('[TemplatePicker] load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function bodyText(t: ApprovedTemplate) {
    return (t.components ?? []).find(c => c.type === 'BODY')?.text ?? t.body ?? ''
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[1,2].map(i => <div key={i} style={{ height: 56, borderRadius: 8, background: 'var(--cream-2)', border: '1px solid var(--border)' }} />)}
    </div>
  )

  if (!templates.length) return (
    <div style={{ padding: '16px', borderRadius: 10, background: 'var(--cream)', border: '1.5px dashed var(--border)', textAlign: 'center' }}>
      <FileText size={18} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-dark)' }}>No approved templates</p>
      <a href="/dashboard/templates" style={{ fontSize: 11, color: 'var(--burgundy)', textDecoration: 'none', fontWeight: 700 }}>
        Go to Templates →
      </a>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
      {templates.map(t => {
        const sel  = selectedId === t.id
        const body = bodyText(t)
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
              padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${sel ? 'var(--burgundy)' : 'var(--border)'}`,
              background: sel ? 'rgba(56,0,8,0.04)' : 'white',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseOver={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--text-mid)' }}
            onMouseOut={e  => { if (!sel) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: sel ? 'var(--burgundy)' : 'var(--text-dark)' }}>
              {t.name}
            </p>
            {body && (
              <p style={{
                margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              }}>
                {body}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Main modal ───────────────────────────────────────── */

interface Props {
  onClose:           () => void
  onConversationCreated: (conversationId: string) => void
}

export function NewConversationModal({ onClose, onConversationCreated }: Props) {
  const [selectedContact, setSelectedContact] = useState<ContactHit | null>(null)
  const [phone,           setPhone]           = useState('')
  const [template,        setTemplate]        = useState<ApprovedTemplate | null>(null)
  const [varValues,       setVarValues]       = useState<Record<string, string>>({})
  const [sending,         setSending]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  /* When template or contact changes, auto-fill known variable labels */
  useEffect(() => {
    if (!template) return
    const labels = template.variable_labels ?? {}
    const auto: Record<string, string> = {}
    Object.entries(labels).forEach(([n, key]) => {
      const resolved = resolveVar(key, selectedContact)
      if (resolved) auto[n] = resolved
    })
    setVarValues(prev => ({ ...auto, ...prev }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, selectedContact])

  const bodyComp   = (template?.components ?? []).find(c => c.type === 'BODY')
  const bodyText   = bodyComp?.text ?? template?.body ?? ''
  const labels     = template?.variable_labels ?? {}
  const varNumbers = Object.keys(labels).map(Number).sort((a, b) => a - b)

  /* Live preview with substituted variables */
  let preview = bodyText
  varNumbers.forEach(n => {
    preview = preview.replace(
      new RegExp(`\\{\\{${n}\\}\\}`, 'g'),
      varValues[String(n)] || `{{${n}}}`
    )
  })

  const recipientPhone = selectedContact?.phone || phone.trim()
  const canSend = !!recipientPhone && !!template && varNumbers.every(n => varValues[String(n)]?.trim())

  async function handleSend() {
    if (!canSend) return
    setSending(true)
    setError(null)
    try {
      const res  = await fetch('/api/inbox/new', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: recipientPhone, templateId: template!.id, variableValues: varValues }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send')
      onConversationCreated(data.conversationId)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(26,20,17,0.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', borderRadius: 18,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          width: '100%', maxWidth: 680,
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(56,0,8,0.07)', border: '1px solid rgba(56,0,8,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Send size={14} style={{ color: 'var(--burgundy)' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>New message</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Send a template message to start a conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--text-muted)', display: 'flex' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--cream-2)')}
            onMouseOut={e  => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 22px', display: 'flex', gap: 20 }}>

          {/* Left — recipient + template + variables */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>

            {/* To */}
            <div>
              <p style={labelCss}>To</p>
              <ContactSearch
                selected={selectedContact}
                onSelect={c => { setSelectedContact(c); if (c) setPhone(c.phone) }}
                phone={phone}
                onPhoneChange={setPhone}
              />
              {!selectedContact && phone && !/^\+?\d{7,15}$/.test(phone.replace(/[\s\-()]/g, '')) && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#D97706' }}>
                  Enter a valid international number (e.g. +919876543210)
                </p>
              )}
            </div>

            {/* Template */}
            <div>
              <p style={labelCss}>Template <span style={{ color: '#DC2626' }}>*</span></p>
              <TemplatePicker
                selectedId={template?.id ?? ''}
                onSelect={t => { setTemplate(t); setVarValues({}) }}
              />
            </div>

            {/* Variable inputs */}
            {template && varNumbers.length > 0 && (
              <div>
                <p style={labelCss}>Fill in variables</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {varNumbers.map(n => {
                    const key   = labels[String(n)]
                    const field = STANDARD_VARIABLE_FIELDS.find(f => f.key === key)
                    return (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          flexShrink: 0, background: 'rgba(56,0,8,0.08)', color: 'var(--burgundy)',
                          borderRadius: 4, padding: '3px 7px', fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                        }}>{`{{${n}}}`}</span>
                        <div style={{ flex: 1 }}>
                          <input
                            style={inputStyle}
                            placeholder={field ? `${field.label} (e.g. ${field.example})` : `Value for {{${n}}}`}
                            value={varValues[String(n)] ?? ''}
                            onChange={e => setVarValues(prev => ({ ...prev, [String(n)]: e.target.value }))}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dark)')}
                            onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
                          />
                          {field && (
                            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>
                              Auto-filled from {field.hint}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right — live preview */}
          <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={labelCss}>Preview</p>
            <div style={{ background: '#ECE5DD', borderRadius: 12, padding: 14, minHeight: 140 }}>
              {preview ? (
                <div style={{
                  background: 'white', borderRadius: '12px 12px 12px 0',
                  padding: '10px 12px', fontSize: 12, lineHeight: 1.55,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)', wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}>
                  {preview}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.35)' }}>
                      {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>
                  Select a template to see the preview
                </p>
              )}
            </div>
            {template && (
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--cream)', border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Template</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--text-dark)' }}>{template.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            {error && (
              <p style={{ margin: 0, fontSize: 12, color: '#DC2626' }}>{error}</p>
            )}
            {!error && !template && (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                Only approved templates can start a new conversation
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                border: '1.5px solid var(--border)', background: 'white',
                fontSize: 13, fontWeight: 600, color: 'var(--text-dark)',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--text-mid)')}
              onMouseOut={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || sending}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 20px', borderRadius: 8,
                border: 'none', background: 'var(--text-dark)', color: 'white',
                fontSize: 13, fontWeight: 700,
                opacity: (!canSend || sending) ? 0.45 : 1,
                cursor: (!canSend || sending) ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseOver={e => { if (canSend && !sending) e.currentTarget.style.opacity = '0.85' }}
              onMouseOut={e  => { if (canSend && !sending) e.currentTarget.style.opacity = '1' }}
            >
              {sending
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                : <><Send size={13} /> Send message</>
              }
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
