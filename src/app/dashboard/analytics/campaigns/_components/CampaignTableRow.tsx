'use client'

import type { CampaignSummary } from '@/types/analytics'

interface Props {
  campaign: CampaignSummary
  onClick: () => void
}

function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  sent:      { bg: 'rgba(34,197,94,0.08)', color: '#16A34A', label: 'Sent' },
  sending:   { bg: 'rgba(59,130,246,0.08)', color: '#2563EB', label: 'Sending' },
  scheduled: { bg: 'rgba(107,114,128,0.08)', color: '#6B7280', label: 'Scheduled' },
  failed:    { bg: 'rgba(239,68,68,0.08)', color: '#DC2626', label: 'Failed' },
  draft:     { bg: 'rgba(107,114,128,0.08)', color: '#6B7280', label: 'Draft' },
}

export function CampaignTableRow({ campaign: c, onClick }: Props) {
  const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft
  const hasHighFailure = (c.failure_rate ?? 0) > 0.05

  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: hasHighFailure ? 'rgba(239,68,68,0.03)' : 'transparent',
      }}
      onMouseOver={e => { e.currentTarget.style.background = 'var(--cream-2)' }}
      onMouseOut={e => { e.currentTarget.style.background = hasHighFailure ? 'rgba(239,68,68,0.03)' : 'transparent' }}
    >
      <td style={{ padding: '12px 14px' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)' }}>{c.name}</span>
        <br />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.template_name}</span>
      </td>
      <td style={{ padding: '12px 10px', fontSize: 13, color: 'var(--text-muted)' }}>{c.sent_count.toLocaleString('en-IN')}</td>
      <td style={{ padding: '12px 10px' }}>
        <span style={{ fontSize: 13 }}>{c.delivered_count.toLocaleString('en-IN')}</span>
        <br />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRate(c.delivery_rate)}</span>
      </td>
      <td style={{ padding: '12px 10px' }}>
        <span style={{ fontSize: 13 }}>{c.read_count.toLocaleString('en-IN')}</span>
        <br />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRate(c.read_rate)}</span>
      </td>
      <td style={{ padding: '12px 10px' }}>
        <span style={{ fontSize: 13 }}>{c.replied_count.toLocaleString('en-IN')}</span>
        <br />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRate(c.reply_rate)}</span>
      </td>
      <td style={{ padding: '12px 10px', fontSize: 13, color: hasHighFailure ? '#DC2626' : 'var(--text-muted)' }}>
        {c.failed_count}
      </td>
      <td style={{ padding: '12px 10px' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
          background: badge.bg, color: badge.color,
        }}>
          {badge.label}
        </span>
      </td>
      <td style={{ padding: '12px 10px', fontSize: 12, color: 'var(--text-muted)' }}>
        {relativeDate(c.completed_at ?? c.scheduled_at)}
      </td>
    </tr>
  )
}
