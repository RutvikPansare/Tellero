"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import type { Conversation } from './useConversations'

export type Message    = Database['public']['Tables']['messages']['Row']
type ConvoUpdate = Database['public']['Tables']['conversations']['Update']

interface UseConversationReturn {
  messages:               Message[]
  conversation:           Conversation | null
  loading:                boolean
  error:                  string | null
  bottomRef:              React.RefObject<HTMLDivElement>
  addOptimisticMessage:   (msg: Message) => void
  removeOptimisticMessage:(id: string) => void
}

export function useConversation(
  conversationId: string | null,
  userId: string
): UseConversationReturn {
  const [messages,      setMessages]      = useState<Message[]>([])
  const [conversation,  setConversation]  = useState<Conversation | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ── Fetch thread ───────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) {
      setMessages([]); setConversation(null); return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    const supabase = createClient()

    Promise.all([
      supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single(),
      supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true }),
    ]).then(([{ data: convo, error: ce }, { data: msgs, error: me }]) => {
      if (cancelled) return
      if (ce) { setError(ce.message); setLoading(false); return }
      if (me) { setError(me.message); setLoading(false); return }
      setConversation(convo as Conversation)
      setMessages((msgs as Message[]) ?? [])
      setLoading(false)
      setTimeout(scrollToBottom, 50)
    })

    // Mark as read — reset unread_count immediately
    ;(supabase as any) // eslint-disable-line
      .from('conversations')
      .update({ unread_count: 0 } as ConvoUpdate)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .then(() => {})  // fire-and-forget; Realtime will propagate the update

    return () => { cancelled = true }
  }, [conversationId, userId, scrollToBottom])

  // ── Realtime — new messages in this thread ─────────────────────
  useEffect(() => {
    if (!conversationId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`inbox:messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message
          setMessages(prev => {
            // Deduplicate — optimistic msg may already be in state (matched by meta_message_id)
            const alreadyPresent = prev.some(
              m => m.id === incoming.id ||
              (incoming.meta_message_id && m.meta_message_id === incoming.meta_message_id)
            )
            if (alreadyPresent) {
              // Replace optimistic placeholder with real record
              return prev.map(m =>
                m.meta_message_id === incoming.meta_message_id ? incoming : m
              )
            }
            return [...prev, incoming]
          })
          setTimeout(scrollToBottom, 50)
        }
      )
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => prev.map(m =>
            m.id === (payload.new as Message).id ? (payload.new as Message) : m
          ))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, scrollToBottom])

  const addOptimisticMessage   = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg])
    setTimeout(scrollToBottom, 50)
  }, [scrollToBottom])

  const removeOptimisticMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return {
    messages, conversation, loading, error, bottomRef,
    addOptimisticMessage, removeOptimisticMessage,
  }
}
