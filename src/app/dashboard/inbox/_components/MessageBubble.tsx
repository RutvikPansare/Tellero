"use client"

import { Check, CheckCheck } from 'lucide-react'
import type { Message } from '../_hooks/useConversation'

interface MessageBubbleProps {
  message: Message
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sent')      return <Check size={12} style={{ color: 'var(--text-muted)' }} />
  if (status === 'delivered') return <CheckCheck size={12} style={{ color: 'var(--text-muted)' }} />
  if (status === 'read')      return <CheckCheck size={12} style={{ color: '#3B82F6' }} />
  return null
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound'
  const isOptimistic = message.id.startsWith('optimistic_')

  return (
    <div style={{
      display:       'flex',
      justifyContent: isOutbound ? 'flex-end' : 'flex-start',
      marginBottom:   6,
    }}>
      <div style={{
        maxWidth:     '70%',
        padding:      '9px 13px',
        borderRadius: isOutbound ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background:   isOutbound ? '#22C55E' : 'var(--text-dark)',
        color:        isOutbound ? '#fff' : '#fff',
        opacity:      isOptimistic ? 0.6 : 1,
      }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>
          {message.body}
        </p>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'flex-end',
          gap:            4,
          marginTop:      4,
        }}>
          <span style={{ fontSize: 10, opacity: 0.7 }}>
            {isOptimistic ? 'Sending…' : formatTime(message.created_at)}
          </span>
          {isOutbound && !isOptimistic && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  )
}
