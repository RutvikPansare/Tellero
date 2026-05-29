'use client'

import type { RecipientStatus } from '@/types/analytics'

interface Props {
  recipients: RecipientStatus[]
  filter: string
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const STATUS_DOTS: Record<string, string> = {
  pending:   '#94A3B8',
  queued:    '#94A3B8',
  sent:      '#94A3B8',
  delivered: '#3B82F6',
  read:      '#22C55E',
  replied:   '#25D366',
  failed:    '#EF4444',
}

export function RecipientStatusTable({ recipients, filter }: Props) {
  const filtered = filter === 'all'
    ? recipients
    : filter === 'read' ? recipients.filter(r => r.read_at)
    : filter === 'delivered' ? recipients.filter(r => r.delivered_at && !r.read_at)
    : filter === 'replied' ? recipients.filter(r => r.replied_at)
    : filter === 'failed' ? recipients.filter(r => r.failed_at)
    : recipients

  if (filtered.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
        No recipients in this filter.
      </p>
    )
  }

  return (
    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Contact', 'Status', 'Sent', 'Delivered', 'Read', 'Replied'].map(col => (
              <th key={col} style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase' as const, color: 'var(--text-muted)',
                padding: '8px 10px', textAlign: 'left', background: 'white',
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px', fontSize: 13 }}>
                {r.contact_name || r.phone}
              </td>
              <td style={{ padding: '8px 10px' }}>
                <span className="flex items-center gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOTS[r.status] ?? '#94A3B8', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{r.status}</span>
                </span>
              </td>
              <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{relativeTime(r.sent_at)}</td>
              <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{relativeTime(r.delivered_at)}</td>
              <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{relativeTime(r.read_at)}</td>
              <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{relativeTime(r.replied_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
