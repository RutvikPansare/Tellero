import { CheckCircle2, XCircle, Clock, TrendingDown } from 'lucide-react'
import type { CODStats } from '../_hooks/useCODLog'

interface Props {
  stats: CODStats
  loading: boolean
}

interface StatTileProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function StatTile({ label, value, icon, color }: StatTileProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="font-bold" style={{ fontSize: 26, color: 'var(--text-dark)', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  )
}

export function CODStatsCard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 h-24 animate-pulse"
            style={{ background: 'var(--cream-3)', border: '1px solid var(--border)' }}
          />
        ))}
      </div>
    )
  }

  const returnRate =
    stats.total > 0
      ? Math.round(((stats.cancelled) / stats.total) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile
        label="Total sent"
        value={stats.total}
        icon={<Clock size={16} />}
        color="var(--text-muted)"
      />
      <StatTile
        label="Confirmed ✓"
        value={stats.confirmed}
        icon={<CheckCircle2 size={16} />}
        color="#16a34a"
      />
      <StatTile
        label="Cancelled"
        value={stats.cancelled}
        icon={<XCircle size={16} />}
        color="#dc2626"
      />
      <StatTile
        label="Return rate"
        value={`${returnRate}%`}
        icon={<TrendingDown size={16} />}
        color={returnRate < 15 ? '#16a34a' : '#dc2626'}
      />
    </div>
  )
}
