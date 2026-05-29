'use client'

import { Send, CheckCircle, Eye, MessageCircle, AlertCircle } from 'lucide-react'
import type { OverallStats } from '@/types/analytics'

interface Props {
  stats: OverallStats
  loading: boolean
}

function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

function rateColor(rate: number | null, goodThreshold: number, warnThreshold: number): string {
  if (rate === null) return 'var(--text-muted)'
  if (rate >= goodThreshold) return '#16A34A'
  if (rate >= warnThreshold) return '#D97706'
  return '#EF4444'
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
      <span className="font-bold" style={{ fontSize: 24, color: color !== 'var(--text-muted)' ? color : 'var(--text-dark)', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  )
}

export function OverallStatsRow({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 h-20 animate-pulse" style={{ background: 'var(--cream-3)', border: '1px solid var(--border)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatTile
        label="Total campaigns"
        value={stats.total_campaigns.toString()}
        icon={<Send size={16} />}
        color="var(--text-muted)"
      />
      <StatTile
        label="Messages sent"
        value={stats.total_messages_sent.toLocaleString('en-IN')}
        icon={<MessageCircle size={16} />}
        color="var(--text-muted)"
      />
      <StatTile
        label="Avg delivery rate"
        value={formatRate(stats.avg_delivery_rate)}
        icon={<CheckCircle size={16} />}
        color={rateColor(stats.avg_delivery_rate, 0.85, 0.70)}
      />
      <StatTile
        label="Avg read rate"
        value={formatRate(stats.avg_read_rate)}
        icon={<Eye size={16} />}
        color={rateColor(stats.avg_read_rate, 0.50, 0.30)}
      />
      <StatTile
        label="Avg reply rate"
        value={formatRate(stats.avg_reply_rate)}
        icon={<MessageCircle size={16} />}
        color={rateColor(stats.avg_reply_rate, 0.08, 0.03)}
      />
    </div>
  )
}
