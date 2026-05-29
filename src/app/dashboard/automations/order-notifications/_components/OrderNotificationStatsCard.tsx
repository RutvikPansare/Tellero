'use client'

import { Package, Truck, TrendingUp, Send } from 'lucide-react'
import type { OrderNotifStats } from '../_hooks/useOrderNotificationLog'

interface Props {
  stats: OrderNotifStats
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

export function OrderNotificationStatsCard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 h-24 animate-pulse" style={{ background: 'var(--cream-3)', border: '1px solid var(--border)' }} />
        ))}
      </div>
    )
  }

  const confirmDelta = stats.confirmationsSentThisMonth - stats.confirmationsSentLastMonth
  const shippingDelta = stats.shippingUpdatesSentThisMonth - stats.shippingUpdatesSentLastMonth
  const total = stats.confirmationsSentThisMonth + stats.shippingUpdatesSentThisMonth

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile
        label="Confirmations sent"
        value={stats.confirmationsSentThisMonth}
        sub={confirmDelta !== 0 ? `${confirmDelta > 0 ? '+' : ''}${confirmDelta} vs last month` : 'same as last month'}
        icon={<Package size={16} />}
        color="var(--text-muted)"
      />
      <StatTile
        label="Shipping updates sent"
        value={stats.shippingUpdatesSentThisMonth}
        sub={shippingDelta !== 0 ? `${shippingDelta > 0 ? '+' : ''}${shippingDelta} vs last month` : 'same as last month'}
        icon={<Truck size={16} />}
        color="#3B82F6"
      />
      <StatTile
        label="Total messages this month"
        value={total}
        icon={<Send size={16} />}
        color="#8B5CF6"
      />
      <StatTile
        label="Avg delivery days"
        value={stats.avgDeliveryDays != null ? `${stats.avgDeliveryDays}d` : '—'}
        sub="order placed → fulfilled"
        icon={<TrendingUp size={16} />}
        color="#16A34A"
      />
    </div>
  )
}
