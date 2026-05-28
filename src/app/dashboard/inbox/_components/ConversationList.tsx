"use client"

import { InboxFilters } from './InboxFilters'
import { ConversationItem } from './ConversationItem'
import type { Conversation, InboxFilter } from '../_hooks/useConversations'

interface ConversationListProps {
  conversations:   Conversation[]
  loading:         boolean
  filter:          InboxFilter
  counts:          Record<InboxFilter, number>
  onFilterChange:  (f: InboxFilter) => void
  activeId:        string | null
  onSelect:        (id: string) => void
}

const EMPTY_MESSAGES: Record<InboxFilter, string> = {
  all:        "No conversations yet. They'll appear here when customers message you.",
  open:       'No open conversations.',
  mine:       'No conversations assigned to you.',
  unassigned: 'All conversations are assigned.',
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
  conversations, loading, filter, counts, onFilterChange, activeId, onSelect,
}: ConversationListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 0', flexShrink: 0 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>
          Inbox
        </h2>
      </div>

      <InboxFilters active={filter} counts={counts} onChange={onFilterChange} />

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : conversations.length === 0
            ? (
              <p style={{ margin: '32px 16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                {EMPTY_MESSAGES[filter]}
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
    </div>
  )
}
