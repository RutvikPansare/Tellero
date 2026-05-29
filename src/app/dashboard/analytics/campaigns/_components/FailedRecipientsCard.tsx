'use client'

import { AlertTriangle } from 'lucide-react'
import type { RecipientStatus } from '@/types/analytics'

interface Props {
  recipients: RecipientStatus[]
  onViewFailed: () => void
}

export function FailedRecipientsCard({ recipients, onViewFailed }: Props) {
  const failed = recipients.filter(r => r.failed_at)
  if (failed.length === 0) return null

  // Most common error
  const errorCounts: Record<string, number> = {}
  for (const r of failed) {
    const msg = r.error_message ?? 'Unknown error'
    errorCounts[msg] = (errorCounts[msg] ?? 0) + 1
  }
  const topError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown error'

  const totalSent = recipients.length
  const failRate = totalSent > 0 ? (failed.length / totalSent) * 100 : 0

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1">
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>
            ⚠ {failed.length} message{failed.length > 1 ? 's' : ''} failed to deliver
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Most common error: <strong>{topError}</strong>
          </p>
          <ul style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 16, margin: '0 0 10px' }}>
            <li>Customer&apos;s number is not on WhatsApp</li>
            <li>Customer&apos;s phone is off or unreachable</li>
            <li>Number format issue (invalid Indian number)</li>
          </ul>
          {failRate > 10 && (
            <p style={{ fontSize: 12, color: '#D97706', marginBottom: 8 }}>
              Consider removing contacts with delivery failures to improve your sender reputation.
            </p>
          )}
          <button
            onClick={onViewFailed}
            style={{ fontSize: 12, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
          >
            View failed contacts →
          </button>
        </div>
      </div>
    </div>
  )
}
