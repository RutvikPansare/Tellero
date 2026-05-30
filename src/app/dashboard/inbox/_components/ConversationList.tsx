"use client"

import { ConversationItem } from './ConversationItem'
import type { Conversation } from '../_hooks/useConversations'

interface ConversationListProps {
  conversations:  Conversation[]
  loading:        boolean
  activeId:       string | null
  onSelect:       (id: string) => void
  emptyMessage:   string
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', padding: '12px 14px', gap: 10, borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream-3)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, background: 'var(--cream-3)', borderRadius: 4, marginBottom: 8, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 11, background: 'var(--cream-3)', borderRadius: 4, width: '85%', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

export function ConversationList({
  conversations, loading, activeId, onSelect, emptyMessage,
}: ConversationListProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        : conversations.length === 0
          ? (
            <p style={{ margin: '40px 20px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              {emptyMessage}
            </p>
          )
          : conversations.map(c => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isActive={c.id === activeId}
              onClick={() => onSelect(c.id)}
            />
          ))
      }
    </div>
  )
}
