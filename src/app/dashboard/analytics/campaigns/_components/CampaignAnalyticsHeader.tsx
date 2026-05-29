'use client'

import { Download } from 'lucide-react'
import type { CampaignSummary, AnalyticsPeriod } from '@/types/analytics'

interface Props {
  period: AnalyticsPeriod
  setPeriod: (p: AnalyticsPeriod) => void
  campaigns: CampaignSummary[]
}

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'last_7_days',  label: '7 days' },
  { id: 'last_30_days', label: '30 days' },
  { id: 'last_90_days', label: '90 days' },
  { id: 'all_time',     label: 'All time' },
]

function exportCSV(campaigns: CampaignSummary[]) {
  const headers = ['Name', 'Segment', 'Date', 'Recipients', 'Sent', 'Delivered', 'Delivery%', 'Read', 'Read%', 'Replied', 'Reply%', 'Failed']
  const lines = campaigns.map(r => [
    `"${r.name.replace(/"/g, '""')}"`,
    r.template_name,
    r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-IN') : '',
    r.recipient_count,
    r.sent_count,
    r.delivered_count,
    r.delivery_rate !== null ? `${(r.delivery_rate * 100).toFixed(1)}%` : '',
    r.read_count,
    r.read_rate !== null ? `${(r.read_rate * 100).toFixed(1)}%` : '',
    r.replied_count,
    r.reply_rate !== null ? `${(r.reply_rate * 100).toFixed(1)}%` : '',
    r.failed_count,
  ].join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tellero-campaigns-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function CampaignAnalyticsHeader({ period, setPeriod, campaigns }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-bold" style={{ fontSize: 24, color: 'var(--text-dark)' }}>Analytics</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
          Track how your campaigns and automations are performing
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Period pills */}
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
        {/* Export */}
        <button
          onClick={() => exportCSV(campaigns)}
          disabled={campaigns.length === 0}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
          style={{
            fontSize: 12, fontWeight: 500, border: '1px solid var(--border)',
            background: 'white', color: 'var(--text-mid)', cursor: 'pointer',
            opacity: campaigns.length === 0 ? 0.4 : 1,
          }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>
    </div>
  )
}
