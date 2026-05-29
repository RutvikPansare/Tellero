'use client'

import { RefreshCw, TrendingUp, Users, DollarSign } from 'lucide-react'
import type { ReorderStats } from '@/types/reorder'

interface Props {
  stats:   ReorderStats
  loading: boolean
}

function StatTile({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; color: string
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="font-bold" style={{ fontSize: 26, color: 'var(--text-dark)', lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  )
}

export function ReorderStatsCard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 h-24 animate-pulse" style={{ background: 'var(--cream-3)', border: '1px solid var(--border)' }} />
        ))}
      </div>
    )
  }

  const conversionColor =
    stats.conversionRate > 20 ? '#16A34A' :
    stats.conversionRate > 10 ? '#D97706' : '#EF4444'

  const sentDelta = stats.sentThisMonth - stats.sentLastMonth
  const reorderedDelta = stats.reorderedThisMonth - stats.reorderedLastMonth

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile
        label="Reminders sent"
        value={stats.sentThisMonth}
        sub={sentDelta !== 0 ? `${sentDelta > 0 ? '+' : ''}${sentDelta} vs last month` : 'same as last month'}
        icon={<RefreshCw size={16} />}
        color="var(--text-muted)"
      />
      <StatTile
        label="Customers reordered"
        value={stats.reorderedThisMonth}
        sub={reorderedDelta !== 0 ? `${reorderedDelta > 0 ? '+' : ''}${reorderedDelta} vs last month` : 'same as last month'}
        icon={<Users size={16} />}
        color="#16A34A"
      />
      <StatTile
        label="Conversion rate"
        value={stats.sentThisMonth > 0 ? `${stats.conversionRate}%` : '—'}
        sub={stats.sentThisMonth === 0 ? 'No data yet' : stats.conversionRate > 20 ? 'Above average 🎉' : 'Industry avg: ~25%'}
        icon={<TrendingUp size={16} />}
        color={conversionColor}
      />
      <StatTile
        label="Revenue from reorders"
        value={stats.revenueFromReorders > 0 ? `₹${stats.revenueFromReorders.toLocaleString('en-IN')}` : '—'}
        sub="this month"
        icon={<DollarSign size={16} />}
        color="#8B5CF6"
      />
    </div>
  )
}
