"use client"

import { useState, useCallback } from 'react'
import type { Message } from './useConversation'

interface UseReplyReturn {
  sendReply: (text: string) => Promise<void>
  sending:   boolean
  error:     string | null
  clearError: () => void
}

export function useReply(
  conversationId: string,
  userId: string,
  addOptimistic:    (msg: Message) => void,
  removeOptimistic: (id: string) => void
): UseReplyReturn {
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const sendReply = useCallback(async (text: string) => {
    if (!text.trim() || sending) return

    // Optimistic placeholder — temporary ID to identify and remove on failure
    const tempId = `optimistic_${Date.now()}`
    const optimistic: Message = {
      id:              tempId,
      conversation_id: conversationId,
      direction:       'outbound',
      body:            text.trim(),
      meta_message_id: null,
      status:          'sent',
      created_at:      new Date().toISOString(),
    }

    addOptimistic(optimistic)
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/inbox/reply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ conversationId, message: text.trim() }),
      })

      if (!res.ok) {
        const data: { error?: string } = await res.json()
        throw new Error(data.error ?? 'Failed to send')
      }
      // Real record will arrive via Realtime subscription in useConversation
      // and replace the optimistic one via deduplication logic there.
      // Remove the placeholder so it doesn't duplicate.
      removeOptimistic(tempId)
    } catch (err) {
      removeOptimistic(tempId)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [conversationId, sending, addOptimistic, removeOptimistic])

  return { sendReply, sending, error, clearError }
}
