"use client"

import { CheckCircle2, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AssignAgentPopover } from './AssignAgentPopover'
import type { Database } from '@/types/database'
import type { Conversation } from '../_hooks/useConversations'

type ConvoUpdate = Database['public']['Tables']['conversations']['Update']

interface ConversationHeaderProps {
  conversation: Conversation
  userId:       string
  onUpdated:    (c: Conversation) => void
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:     { label: 'Open',     color: '#16A34A', bg: 'rgba(34,197,94,0.1)'  },
  assigned: { label: 'Assigned', color: '#1D4ED8', bg: 'rgba(59,130,246,0.1)' },
  resolved: { label: 'Resolved', color: 'var(--text-muted)', bg: 'var(--cream-3)' },
}

export function ConversationHeader({ conversation, userId, onUpdated }: ConversationHeaderProps) {
  const isResolved = conversation.status === 'resolved'
  const meta       = STATUS_LABELS[conversation.status] ?? STATUS_LABELS.open

  async function toggleResolved() {
    const supabase = createClient() as any // eslint-disable-line
    const payload: ConvoUpdate = {
      status:     isResolved ? 'open' : 'resolved',
      updated_at: new Date().toISOString(),
    }
    const { data } = await supabase
      .from('conversations')
      .update(payload)
      .eq('id', conversation.id)
      .select()
      .single()
    if (data) onUpdated(data as Conversation)
  }

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '12px 18px',
      borderBottom:   '1px solid var(--border)',
      background:     'white',
      flexShrink:     0,
    }}>
      {/* Left: name + phone + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(56,0,8,0.1)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--burgundy)',
        }}>
          {(conversation.customer_name ?? conversation.customer_phone).charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>
            {conversation.customer_name ?? conversation.customer_phone}
          </p>
          {conversation.customer_name && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              {conversation.customer_phone}
            </p>
          )}
        </div>
        <span style={{
          padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600,
          color: meta.color, background: meta.bg,
        }}>
          {meta.label}
        </span>
      </div>

      {/* Right: assign + resolve */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isResolved && (
          <AssignAgentPopover
            conversation={conversation}
            userId={userId}
            onAssigned={() => {}}
          />
        )}
        <button
          onClick={toggleResolved}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          5,
            padding:      '5px 12px',
            borderRadius: 8,
            border:       '1.5px solid',
            borderColor:  isResolved ? 'var(--border)' : 'rgba(34,197,94,0.35)',
            background:   isResolved ? 'transparent' : 'rgba(34,197,94,0.08)',
            color:        isResolved ? 'var(--text-muted)' : '#16A34A',
            fontSize:     12,
            fontWeight:   600,
            cursor:       'pointer',
          }}
        >
          {isResolved
            ? <><RotateCcw size={12} />Reopen</>
            : <><CheckCircle2 size={12} />Resolve</>
          }
        </button>
      </div>
    </div>
  )
}
