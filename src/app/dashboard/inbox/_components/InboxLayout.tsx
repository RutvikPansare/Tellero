"use client"

import { useState } from 'react'
import { MessageSquare, PenSquare } from 'lucide-react'
import { InboxFilters }          from './InboxFilters'
import { ConversationList }      from './ConversationList'
import { ConversationThread }    from './ConversationThread'
import { NewConversationModal }  from './NewConversationModal'
import { useConversations }      from '../_hooks/useConversations'
import type { Conversation }     from '../_hooks/useConversations'

interface InboxLayoutProps {
  userId:            string
  activeId:          string | null
  onSelect:          (id: string) => void
  onConversationUpdated: (c: Conversation) => void
}

export function InboxLayout({ userId, activeId, onSelect, onConversationUpdated }: InboxLayoutProps) {
  const { filtered, loading, error, filter, setFilter, counts, refetch } = useConversations(userId)
  const [composing, setComposing] = useState(false)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>

      {/* ── Left panel — header + filters + list ──────────── */}
      <div style={{
        width:         360,
        flexShrink:    0,
        borderRight:   '1px solid var(--border)',
        background:    'white',
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-0.01em' }}>
              Inbox
            </h2>
            <button
              onClick={() => setComposing(true)}
              title="New message"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'var(--text-dark)', color: 'white',
                border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
            >
              <PenSquare size={12} /> New
            </button>
          </div>
          <InboxFilters active={filter} counts={counts} onChange={setFilter} />
        </div>

        {error && (
          <p style={{ margin: '8px 12px', fontSize: 12, color: '#DC2626', background: 'rgba(239,68,68,0.07)', padding: '6px 10px', borderRadius: 6 }}>
            {error}
          </p>
        )}

        <ConversationList
          conversations={filtered}
          loading={loading}
          activeId={activeId}
          onSelect={onSelect}
          emptyMessage={
            filter === 'all'        ? "No conversations yet. They'll appear here when customers message you." :
            filter === 'open'       ? 'No open conversations.'          :
            filter === 'mine'       ? 'No conversations assigned to you.' :
                                      'All conversations are assigned.'
          }
        />
      </div>

      {/* ── Right panel ───────────────────────────────────── */}
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
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, color: 'var(--text-muted)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              <button
                onClick={() => setComposing(true)}
                style={{
                  marginTop: 4, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                  background: 'var(--text-dark)', color: 'white', border: 'none', cursor: 'pointer',
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
              >
                <PenSquare size={13} /> New message
              </button>
            </div>
          )
        }
      </div>

      {composing && (
        <NewConversationModal
          onClose={() => setComposing(false)}
          onConversationCreated={id => {
            refetch()
            onSelect(id)
          }}
        />
      )}
    </div>
  )
}
