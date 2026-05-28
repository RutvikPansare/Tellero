"use client"

import { MessageSquare } from 'lucide-react'
import { ConversationList } from './ConversationList'
import { ConversationThread } from './ConversationThread'
import { useConversations } from '../_hooks/useConversations'
import type { Conversation } from '../_hooks/useConversations'

interface InboxLayoutProps {
  userId:            string
  activeId:          string | null
  onSelect:          (id: string) => void
  onConversationUpdated: (c: Conversation) => void
}

export function InboxLayout({ userId, activeId, onSelect, onConversationUpdated }: InboxLayoutProps) {
  const { filtered, loading, error, filter, setFilter, counts } = useConversations(userId)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
      {/* Left panel — conversation list, fixed 360px */}
      <div style={{
        width:       360,
        flexShrink:  0,
        borderRight: '1px solid var(--border)',
        background:  'white',
        display:     'flex',
        flexDirection: 'column',
        overflow:    'hidden',
      }}>
        {error && (
          <p style={{ margin: '8px 12px', fontSize: 12, color: '#DC2626', background: 'rgba(239,68,68,0.07)', padding: '6px 10px', borderRadius: 6 }}>
            {error}
          </p>
        )}
        <ConversationList
          conversations={filtered}
          loading={loading}
          filter={filter}
          counts={counts}
          onFilterChange={setFilter}
          activeId={activeId}
          onSelect={onSelect}
        />
      </div>

      {/* Right panel — thread or empty state */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--cream)' }}>
        {activeId
          ? (
            <ConversationThread
              key={activeId}
              conversationId={activeId}
              userId={userId}
              onConversationUpdated={onConversationUpdated}
            />
          )
          : (
            <div style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            12,
              color:          'var(--text-muted)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(56,0,8,0.06)',
              }}>
                <MessageSquare size={24} style={{ color: 'var(--burgundy)', opacity: 0.5 }} />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                Select a conversation to start replying
              </p>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
                New messages appear instantly — no refresh needed
              </p>
            </div>
          )
        }
      </div>
    </div>
  )
}
