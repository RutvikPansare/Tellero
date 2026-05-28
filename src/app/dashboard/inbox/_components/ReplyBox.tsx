"use client"

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'

const MAX_CHARS = 4096
const WARN_AT   = 3800

interface ReplyBoxProps {
  onSend:  (text: string) => Promise<void>
  sending: boolean
  error:   string | null
  onClearError: () => void
}

export function ReplyBox({ onSend, sending, error, onClearError }: ReplyBoxProps) {
  const [text, setText]   = useState('')
  const textareaRef       = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  async function handleSend() {
    if (!text.trim() || sending) return
    const draft = text
    setText('')
    await onSend(draft)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const remaining = MAX_CHARS - text.length
  const nearLimit = text.length >= WARN_AT

  return (
    <div style={{ borderTop: '1px solid var(--border)', background: 'white', padding: '10px 14px' }}>
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 8, padding: '6px 10px', borderRadius: 8,
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
        }}>
          <AlertCircle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#DC2626', flex: 1 }}>{error}</span>
          <button onClick={onClearError} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => { setText(e.target.value); onClearError() }}
          onKeyDown={handleKeyDown}
          maxLength={MAX_CHARS}
          placeholder="Type a message…"
          disabled={sending}
          rows={1}
          style={{
            flex:       1,
            resize:     'none',
            border:     '1.5px solid var(--border)',
            borderRadius: 12,
            padding:    '9px 13px',
            fontSize:   14,
            fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
            lineHeight: 1.5,
            outline:    'none',
            background: 'var(--cream)',
            color:      'var(--text-dark)',
            minHeight:  40,
            overflow:   'hidden',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width:        40,
            height:       40,
            borderRadius: 12,
            border:       'none',
            background:   !text.trim() || sending ? 'var(--border)' : 'var(--burgundy)',
            color:        'white',
            cursor:       !text.trim() || sending ? 'not-allowed' : 'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            flexShrink:   0,
            transition:   'background 0.15s',
          }}
        >
          {sending
            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={16} />
          }
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          Replies are sent within the 24-hour service window — free of charge.
          <span style={{ marginLeft: 6, opacity: 0.7 }}>Cmd+Enter to send</span>
        </p>
        {nearLimit && (
          <span style={{ fontSize: 11, color: remaining < 100 ? '#EF4444' : 'var(--text-muted)' }}>
            {remaining} left
          </span>
        )}
      </div>
    </div>
  )
}
