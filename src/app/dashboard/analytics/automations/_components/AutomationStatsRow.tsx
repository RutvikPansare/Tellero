'use client'

import { Send, CheckCircle, Eye, MessageCircle } from 'lucide-react'
import type { AutomationTypeStats } from '@/types/analytics'

interface Props {
  typeStats: AutomationTypeStats[]
  loading: boolean
}

function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

function StatTile({ label, value, icon, color }: {
  label: string; value: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="font-bold" style={{ fontSize: 24, color: 'var(--text-dark)', lineHeight: 1 }}>{value}</span>
    </div>
  )
}

export function AutomationStatsRow({ typeStats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 h-20 animate-pulse" style={{ background: 'var(--cream-3)', border: '1px solid var(--border)' }} />
        ))}
      </div>
    )
  }

  const totalSent = typeStats.reduce((s, t) => s + t.sent_count, 0)
  const totalDelivered = typeStats.reduce((s, t) => s + t.delivered_count, 0)
  const totalRead = typeStats.reduce((s, t) => s + t.read_count, 0)
  const totalReplied = typeStats.reduce((s, t) => s + t.replied_count, 0)

  const avgDelivery = totalSent > 0 ? totalDelivered / totalSent : null
  const avgRead = totalDelivered > 0 ? totalRead / totalDelivered : null
  const avgReply = totalSent > 0 ? totalReplied / totalSent : null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile
        label="Automations sent"
        value={totalSent.toLocaleString('en-IN')}
        icon={<Send size={16} />}
        color="var(--text-muted)"
      />
      <StatTile
        label="Avg delivery rate"
        value={formatRate(avgDelivery)}
        icon={<CheckCircle size={16} />}
        color="#16A34A"
      />
      <StatTile
        label="Avg read rate"
        value={formatRate(avgRead)}
        icon={<Eye size={16} />}
        color="#D97706"
      />
      <StatTile
        label="Avg reply rate"
        value={formatRate(avgReply)}
        icon={<MessageCircle size={16} />}
        color="#8B5CF6"
      />
    </div>
  )
}
