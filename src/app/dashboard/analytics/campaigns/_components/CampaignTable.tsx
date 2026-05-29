'use client'

import { useState } from 'react'
import type { CampaignSummary } from '@/types/analytics'
import { CampaignTableRow } from './CampaignTableRow'

interface Props {
  campaigns: CampaignSummary[]
  loading: boolean
  onSelectCampaign: (id: string) => void
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'sent', label: 'Sent' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'failed', label: 'Failed' },
]

const COLUMNS = ['Campaign', 'Sent', 'Delivered', 'Read', 'Replied', 'Failed', 'Status', 'Date']

export function CampaignTable({ campaigns, loading, onSelectCampaign }: Props) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === filter)

  if (loading) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--cream-1)' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-14" style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream-2)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'white' }}>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => {
          const count = tab.id === 'all' ? campaigns.length : campaigns.filter(c => c.status === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: filter === tab.id ? 'var(--burgundy)' : 'transparent',
                color: filter === tab.id ? 'white' : 'var(--text-muted)',
              }}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>
            {filter === 'all'
              ? "No campaigns in this period. Send your first broadcast to see analytics here."
              : `No ${filter} campaigns in this period.`}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {COLUMNS.map(col => (
                  <th key={col} style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const, color: 'var(--text-muted)',
                    padding: '10px 14px', textAlign: 'left', background: 'white',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <CampaignTableRow key={c.id} campaign={c} onClick={() => onSelectCampaign(c.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
