"use client"

// For Phase 1 (single-user accounts), this shows only the current user.
// In Phase 2, query a team_members table and list all agents here.

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import type { Conversation } from '../_hooks/useConversations'

type ConvoUpdate = Database['public']['Tables']['conversations']['Update']

interface AssignAgentPopoverProps {
  conversation: Conversation
  userId:       string
  onAssigned:   (assignedTo: string | null) => void
}

interface Profile { id: string; full_name: string | null; email: string }

export function AssignAgentPopover({ conversation, userId, onAssigned }: AssignAgentPopoverProps) {
  const [open,    setOpen]    = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving,  setSaving]  = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createClient()
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single()
      .then(({ data }) => setProfile(data as Profile | null))
  }, [userId])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function assign(assignTo: string | null) {
    setSaving(true)
    setOpen(false)
    const supabase = createClient() as any // eslint-disable-line
    const payload: ConvoUpdate = {
      assigned_to: assignTo,
      status:      assignTo ? 'assigned' : 'open',
      updated_at:  new Date().toISOString(),
    }
    await supabase.from('conversations').update(payload).eq('id', conversation.id)
    onAssigned(assignTo)
    setSaving(false)
  }

  const label = conversation.assigned_to
    ? (profile?.full_name ?? profile?.email ?? 'Assigned')
    : 'Assign'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          5,
          padding:      '5px 12px',
          borderRadius: 8,
          border:       '1.5px solid var(--border)',
          background:   'white',
          fontSize:     12,
          color:        'var(--text-mid)',
          cursor:       'pointer',
          fontWeight:   500,
        }}
      >
        {label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div style={{
          position:  'absolute',
          top:       '100%',
          right:     0,
          marginTop: 4,
          minWidth:  180,
          background: 'white',
          border:    '1.5px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex:    100,
          overflow:  'hidden',
        }}>
          {profile && (
            <button
              onClick={() => assign(profile.id)}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         8,
                width:       '100%',
                padding:     '9px 14px',
                border:      'none',
                background:  'transparent',
                cursor:      'pointer',
                fontSize:    13,
                color:       'var(--text-dark)',
                textAlign:   'left',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--cream-3)'}
              onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'rgba(56,0,8,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--burgundy)',
              }}>
                {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1 }}>{profile.full_name ?? profile.email}</span>
              {conversation.assigned_to === profile.id && <Check size={13} style={{ color: '#22C55E' }} />}
            </button>
          )}
          {conversation.assigned_to && (
            <>
              <div style={{ borderTop: '1px solid var(--border)' }} />
              <button
                onClick={() => assign(null)}
                style={{
                  width: '100%', padding: '8px 14px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text-muted)', textAlign: 'left',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--cream-3)'}
                onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
              >
                Unassign
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
