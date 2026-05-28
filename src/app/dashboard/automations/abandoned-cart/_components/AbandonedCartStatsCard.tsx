import { ShoppingCart, CheckCircle2, TrendingUp, IndianRupee } from 'lucide-react'
import type { AbandonedCartStats } from '../_hooks/useAbandonedCartLog'

interface Props {
  stats: AbandonedCartStats
  loading: boolean
}

interface StatTileProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconColor: string
  sub?: string
}

function StatTile({ label, value, icon, iconColor, sub }: StatTileProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ color: iconColor }}>{icon}</div>
      </div>
      <span className="font-bold" style={{ fontSize: 26, color: 'var(--text-dark)', lineHeight: 1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>
      )}
    </div>
  )
}

export function AbandonedCartStatsCard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 h-28 animate-pulse"
            style={{ background: 'var(--cream-3)', border: '1px solid var(--border)' }}
          />
        ))}
      </div>
    )
  }

  const rateChange = stats.recoveryRate - stats.recoveryRateLastMonth
  const rateColor  = rateChange >= 0 ? '#16a34a' : '#dc2626'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile
        label="Abandoned carts"
        value={stats.totalThisMonth}
        icon={<ShoppingCart size={16} />}
        iconColor="var(--text-muted)"
        sub={`vs ${stats.totalLastMonth} last month`}
      />
      <StatTile
        label="Recovered"
        value={stats.recoveredThisMonth}
        icon={<CheckCircle2 size={16} />}
        iconColor="#16a34a"
        sub={`vs ${stats.recoveredLastMonth} last month`}
      />
      <StatTile
        label="Recovery rate"
        value={`${stats.recoveryRate}%`}
        icon={<TrendingUp size={16} />}
        iconColor={rateColor}
        sub={rateChange !== 0 ? `${rateChange > 0 ? '+' : ''}${rateChange}% vs last month` : 'No change'}
      />
      <StatTile
        label="Revenue recovered"
        value={`₹${stats.revenueRecovered.toLocaleString('en-IN')}`}
        icon={<IndianRupee size={16} />}
        iconColor="#16a34a"
        sub={`₹${stats.revenueRecoveredLastMonth.toLocaleString('en-IN')} last month`}
      />
    </div>
  )
}
