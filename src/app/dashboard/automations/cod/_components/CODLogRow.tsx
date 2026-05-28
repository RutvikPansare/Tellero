import { formatDistanceToNow } from 'date-fns'
import type { CODConfirmation } from '../_hooks/useCODLog'

interface Props {
  confirmation: CODConfirmation
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  confirmed: { label: 'Confirmed',  bg: 'rgba(22,163,74,0.08)',  color: '#16a34a' },
  cancelled: { label: 'Cancelled',  bg: 'rgba(220,38,38,0.08)',  color: '#dc2626' },
  no_reply:  { label: 'No reply',   bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  pending:   { label: 'Pending',    bg: 'rgba(234,179,8,0.1)',   color: '#ca8a04' },
  failed:    { label: 'Failed',     bg: 'rgba(220,38,38,0.08)',  color: '#dc2626' },
}

function ActionTaken({ confirmation }: { confirmation: CODConfirmation }) {
  if (confirmation.status === 'confirmed') return <>Order proceeding</>
  if (confirmation.status === 'cancelled' || confirmation.status === 'no_reply') {
    return confirmation.shopify_order_cancelled ? <>Order cancelled</> : <>Flagged for review</>
  }
  if (confirmation.status === 'pending') return <>Awaiting reply</>
  return <>—</>
}

// Format phone as +91 XXXXX XXXXX for display
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return raw
}

export function CODLogRow({ confirmation }: Props) {
  const statusStyle = STATUS_STYLES[confirmation.status] ?? STATUS_STYLES.pending
  const orderNum    = confirmation.orders?.shopify_order_number ?? '—'
  const amount      = confirmation.orders?.total_price
    ? `₹${Number(confirmation.orders.total_price).toLocaleString('en-IN')}`
    : '—'
  const customerName = confirmation.orders?.customer_name ?? formatPhone(confirmation.customer_phone)

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Customer */}
      <td className="py-3 pr-4">
        <p className="font-medium" style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>
          {customerName}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          {formatPhone(confirmation.customer_phone)}
        </p>
      </td>

      {/* Order */}
      <td className="py-3 pr-4">
        <p style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{orderNum}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{amount}</p>
      </td>

      {/* Sent */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {formatDistanceToNow(new Date(confirmation.sent_at), { addSuffix: true })}
      </td>

      {/* Reply */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-dark)', maxWidth: 140 }}>
        {confirmation.customer_reply
          ? <span style={{ fontStyle: 'italic' }}>&ldquo;{confirmation.customer_reply}&rdquo;</span>
          : <span style={{ color: 'var(--text-muted)' }}>No reply</span>
        }
      </td>

      {/* Status badge */}
      <td className="py-3 pr-4">
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            background: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {statusStyle.label}
        </span>
      </td>

      {/* Action */}
      <td className="py-3" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        <ActionTaken confirmation={confirmation} />
      </td>
    </tr>
  )
}
