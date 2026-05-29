'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { CampaignSummary, RecipientStatus } from '@/types/analytics'
import { DeliveryFunnelChart } from './DeliveryFunnelChart'
import { RecipientStatusTable } from './RecipientStatusTable'
import { FailedRecipientsCard } from './FailedRecipientsCard'

interface Props {
  campaign: CampaignSummary | null
  recipients: RecipientStatus[]
  loading: boolean
  onClose: () => void
}

function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

function rateColor(rate: number | null, good: number, warn: number): string {
  if (rate === null) return 'var(--text-muted)'
  if (rate >= good) return '#16A34A'
  if (rate >= warn) return '#D97706'
  return '#EF4444'
}

const REC_TABS = [
  { id: 'all', label: 'All' },
  { id: 'read', label: 'Read' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'replied', label: 'Replied' },
  { id: 'failed', label: 'Failed' },
]

export function CampaignDetailDrawer({ campaign, recipients, loading, onClose }: Props) {
  const [recFilter, setRecFilter] = useState('all')

  if (!campaign) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(26,20,17,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg h-full overflow-y-auto"
        style={{ background: 'white', boxShadow: '-4px 0 16px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-dark)' }}>{campaign.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {campaign.template_name} · Sent {campaign.completed_at ? new Date(campaign.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Funnel */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12 }}>Delivery Funnel</h3>
            <DeliveryFunnelChart
              sent={campaign.sent_count}
              delivered={campaign.delivered_count}
              read={campaign.read_count}
              replied={campaign.replied_count}
            />
          </div>

          {/* 2×2 metric cards */}
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Delivery rate" value={formatRate(campaign.delivery_rate)} color={rateColor(campaign.delivery_rate, 0.85, 0.7)} />
            <MiniStat label="Read rate" value={formatRate(campaign.read_rate)} color={rateColor(campaign.read_rate, 0.5, 0.3)} />
            <MiniStat label="Reply rate" value={formatRate(campaign.reply_rate)} color={rateColor(campaign.reply_rate, 0.08, 0.03)} />
            <MiniStat label="Failure rate" value={formatRate(campaign.failure_rate)} color={rateColor(campaign.failure_rate !== null ? 1 - campaign.failure_rate : null, 0.95, 0.9)} />
          </div>

          {/* Failed card */}
          <FailedRecipientsCard recipients={recipients} onViewFailed={() => setRecFilter('failed')} />

          {/* Recipient table */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              {REC_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRecFilter(tab.id)}
                  style={{
                    fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                    border: 'none', cursor: 'pointer',
                    background: recFilter === tab.id ? 'var(--burgundy)' : 'var(--cream-2)',
                    color: recFilter === tab.id ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="animate-pulse h-40 rounded-lg" style={{ background: 'var(--cream-2)' }} />
            ) : (
              <RecipientStatusTable recipients={recipients} filter={recFilter} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  )
}
