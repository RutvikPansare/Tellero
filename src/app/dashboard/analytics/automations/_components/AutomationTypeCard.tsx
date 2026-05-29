'use client'

import type { AutomationTypeStats } from '@/types/analytics'

interface Props {
  stat: AutomationTypeStats
}

function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

function rateColor(rate: number | null): string {
  if (rate === null) return 'var(--text-muted)'
  if (rate >= 0.7) return '#16A34A'
  if (rate >= 0.4) return '#D97706'
  return '#EF4444'
}

export function AutomationTypeCard({ stat }: Props) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12 }}>
        {stat.label}
      </h4>
      <div className="flex items-center gap-4 flex-wrap">
        <Metric label="Sent" value={stat.sent_count.toString()} color="var(--text-dark)" />
        <Metric label="Delivered" value={stat.delivered_count.toString()} color="var(--text-mid)" />
        <Metric label="Read" value={stat.read_count.toString()} color="var(--text-mid)" />
        <Metric label="Replied" value={stat.replied_count.toString()} color="#16A34A" />
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Delivery: <strong style={{ color: rateColor(stat.delivery_rate) }}>{formatRate(stat.delivery_rate)}</strong>
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Read: <strong style={{ color: rateColor(stat.read_rate) }}>{formatRate(stat.read_rate)}</strong>
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Reply: <strong style={{ color: rateColor(stat.reply_rate) }}>{formatRate(stat.reply_rate)}</strong>
        </span>
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}
