"use client"

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { ConversationHeader } from './ConversationHeader'
import { MessageBubble } from './MessageBubble'
import { ReplyBox } from './ReplyBox'
import { useConversation } from '../_hooks/useConversation'
import { useReply } from '../_hooks/useReply'
import type { Message } from '../_hooks/useConversation'
import type { Conversation } from '../_hooks/useConversations'

interface ConversationThreadProps {
  conversationId: string
  userId:         string
  onConversationUpdated: (c: Conversation) => void
}

function groupByDate(messages: Message[]): Array<{ date: string; msgs: Message[] }> {
  const groups: Record<string, Message[]> = {}
  for (const m of messages) {
    const d = new Date(m.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    if (!groups[d]) groups[d] = []
    groups[d].push(m)
  }
  return Object.entries(groups).map(([date, msgs]) => ({ date, msgs }))
}

export function ConversationThread({
  conversationId, userId, onConversationUpdated,
}: ConversationThreadProps) {
  const {
    messages, conversation, loading, bottomRef,
    addOptimisticMessage, removeOptimisticMessage,
  } = useConversation(conversationId, userId)

  const { sendReply, sending, error, clearError } = useReply(
    conversationId, userId, addOptimisticMessage, removeOptimisticMessage
  )

  // Scroll to bottom on mount
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loading) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }
  }, [loading])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    )
  }

  if (!conversation) return null

  const grouped = groupByDate(messages)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ConversationHeader
        conversation={conversation}
        userId={userId}
        onUpdated={onConversationUpdated}
      />

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: 'var(--cream)' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
            No messages yet. Send a reply below.
          </p>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {date}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            {msgs.map(m => <MessageBubble key={m.id} message={m} />)}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      <ReplyBox
        onSend={sendReply}
        sending={sending}
        error={error}
        onClearError={clearError}
      />
    </div>
  )
}
