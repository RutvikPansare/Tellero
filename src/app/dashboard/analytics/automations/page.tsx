'use client'

import { useAutomationAnalytics } from './_hooks/useAutomationAnalytics'
import { AutomationStatsRow } from './_components/AutomationStatsRow'
import { AutomationTypeCard } from './_components/AutomationTypeCard'
import { AutomationTrendChart } from './_components/AutomationTrendChart'
import type { AnalyticsPeriod } from '@/types/analytics'

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'last_7_days',  label: '7 days' },
  { id: 'last_30_days', label: '30 days' },
  { id: 'last_90_days', label: '90 days' },
  { id: 'all_time',     label: 'All time' },
]

export default function AutomationsAnalyticsPage() {
  const { period, setPeriod, typeStats, trendData, loading } = useAutomationAnalytics()

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ fontSize: 24, color: 'var(--text-dark)' }}>Automation Analytics</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
            Per-automation delivery and engagement metrics
          </p>
        </div>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--cream-2)' }}>
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: period === p.id ? 'var(--cream-1)' : 'transparent',
                color: period === p.id ? 'var(--text-dark)' : 'var(--text-muted)',
                boxShadow: period === p.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <AutomationStatsRow typeStats={typeStats} loading={loading} />

      {/* Type cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl h-32 animate-pulse" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }} />
          ))
        ) : typeStats.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No automation data yet. Enable automations to see performance here.
            </p>
          </div>
        ) : (
          typeStats.map(stat => <AutomationTypeCard key={stat.event_type} stat={stat} />)
        )}
      </div>

      <AutomationTrendChart data={trendData} />
    </div>
  )
}
