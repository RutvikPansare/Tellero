"use client"

import type { Conversation } from '../_hooks/useConversations'

interface ConversationItemProps {
  conversation: Conversation
  isActive:     boolean
  onClick:      () => void
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const diff    = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1)  return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h ago`
  const days  = Math.floor(hours / 24)
  if (days === 1)   return 'Yesterday'
  if (days < 7)     return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const STATUS_COLORS: Record<string, string> = {
  open:     '#22C55E',
  assigned: '#3B82F6',
  resolved: 'var(--text-muted)',
}

export function ConversationItem({ conversation: c, isActive, onClick }: ConversationItemProps) {
  const name    = c.customer_name ?? c.customer_phone
  const preview = c.last_message_preview ?? 'No messages yet'
  const hasUnread = c.unread_count > 0

  return (
    <button
      onClick={onClick}
      style={{
        display:     'flex',
        width:       '100%',
        padding:     '12px 14px',
        gap:         10,
        border:      'none',
        borderBottom: '1px solid var(--border)',
        background:  isActive ? 'rgba(56,0,8,0.06)' : 'transparent',
        cursor:      'pointer',
        textAlign:   'left',
        transition:  'background 0.12s',
      }}
      onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--cream-3)' }}
      onMouseOut={e  => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Avatar */}
      <div style={{
        width:        40,
        height:       40,
        borderRadius: '50%',
        background:   'rgba(56,0,8,0.1)',
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        fontSize:     15,
        fontWeight:   700,
        color:        'var(--burgundy)',
      }}>
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{
            fontSize:     13,
            fontWeight:   hasUnread ? 700 : 500,
            color:        'var(--text-dark)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            maxWidth:     140,
          }}>
            {name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* Status dot */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: STATUS_COLORS[c.status] ?? 'var(--text-muted)',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {relativeTime(c.last_message_at)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize:     12,
            color:        hasUnread ? 'var(--text-dark)' : 'var(--text-muted)',
            fontWeight:   hasUnread ? 500 : 400,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            flex:         1,
          }}>
            {preview.length > 50 ? preview.slice(0, 47) + '…' : preview}
          </span>
          {hasUnread && (
            <span style={{
              background: '#22C55E',
              color:      'white',
              borderRadius: 99,
              fontSize:   10,
              fontWeight: 700,
              padding:    '1px 7px',
              marginLeft: 8,
              flexShrink: 0,
            }}>
              {c.unread_count > 99 ? '99+' : c.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
