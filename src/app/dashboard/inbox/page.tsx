"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { InboxLayout } from './_components/InboxLayout'
import type { Conversation } from './_hooks/useConversations'

export default function InboxPage() {
  const [userId,   setUserId]   = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  // Called when ConversationHeader resolves/reopens a conversation
  function handleConversationUpdated(c: Conversation) {
    // If the conversation is now resolved, deselect it from the active view
    if (c.status === 'resolved') setActiveId(null)
  }

  if (!userId) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    )
  }

  return (
    <InboxLayout
      userId={userId}
      activeId={activeId}
      onSelect={setActiveId}
      onConversationUpdated={handleConversationUpdated}
    />
  )
}
