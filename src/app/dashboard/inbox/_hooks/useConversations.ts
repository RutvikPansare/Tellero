"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type InboxFilter = 'all' | 'open' | 'mine' | 'unassigned'

interface UseConversationsReturn {
  conversations:  Conversation[]
  filtered:       Conversation[]
  loading:        boolean
  error:          string | null
  filter:         InboxFilter
  setFilter:      (f: InboxFilter) => void
  counts:         Record<InboxFilter, number>
  refetch:        () => void
}

export function useConversations(userId: string): UseConversationsReturn {
  const [all,     setAll]     = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [filter,  setFilter]  = useState<InboxFilter>('all')
  const [tick,    setTick]    = useState(0)

  const refetch = useCallback(() => setTick(n => n + 1), [])

  // ── Initial fetch ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const supabase = createClient()

    supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'resolved')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .then(({ data, error: dbErr }) => {
        if (cancelled) return
        if (dbErr) { setError(dbErr.message); setLoading(false); return }
        setAll((data as Conversation[]) ?? [])
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [userId, tick])

  // ── Realtime subscription ──────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    const channel = supabase
      .channel('inbox:conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAll(prev => {
              const c = payload.new as Conversation
              return [c, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setAll(prev => prev.map(c =>
              c.id === (payload.new as Conversation).id ? (payload.new as Conversation) : c
            ).sort((a, b) => {
              if (!a.last_message_at) return 1
              if (!b.last_message_at) return -1
              return b.last_message_at.localeCompare(a.last_message_at)
            }))
          } else if (payload.eventType === 'DELETE') {
            setAll(prev => prev.filter(c => c.id !== (payload.old as Conversation).id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // ── Client-side filtering (no extra queries) ───────────────────
  const filtered = all.filter(c => {
    if (filter === 'all')        return true
    if (filter === 'open')       return c.status === 'open'
    if (filter === 'mine')       return c.assigned_to === userId
    if (filter === 'unassigned') return c.assigned_to === null
    return true
  })

  const counts: Record<InboxFilter, number> = {
    all:        all.length,
    open:       all.filter(c => c.status === 'open').length,
    mine:       all.filter(c => c.assigned_to === userId).length,
    unassigned: all.filter(c => c.assigned_to === null).length,
  }

  return { conversations: all, filtered, loading, error, filter, setFilter, counts, refetch }
}
