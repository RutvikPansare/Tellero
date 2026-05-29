import { formatDistanceToNow } from 'date-fns'
import type { OrderNotifEntry } from '../_hooks/useOrderNotificationLog'

interface Props {
  entry: OrderNotifEntry
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  sent:       { label: 'Sent',       bg: 'rgba(99,102,241,0.08)',  color: '#6366f1' },
  delivered:  { label: 'Delivered',  bg: 'rgba(22,163,74,0.08)',   color: '#16a34a' },
  read:       { label: 'Read ✓✓',    bg: 'rgba(22,163,74,0.15)',   color: '#16a34a' },
  failed:     { label: 'Failed',     bg: 'rgba(239,68,68,0.08)',   color: '#ef4444' },
  cancelled:  { label: 'Cancelled',  bg: 'rgba(100,116,139,0.1)',  color: '#64748b' },
  pending:    { label: 'Pending',    bg: 'rgba(234,179,8,0.1)',    color: '#ca8a04' },
  processing: { label: 'Processing', bg: 'rgba(99,102,241,0.08)',  color: '#6366f1' },
}

const TYPE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  order_confirmed: { label: 'Order Confirmed', bg: 'rgba(56,0,8,0.06)',   color: 'var(--brand-dark)' },
  order_shipped:   { label: 'Shipped',          bg: 'rgba(59,130,246,0.08)', color: '#3B82F6' },
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return raw
}

export function OrderNotificationLogRow({ entry }: Props) {
  const statusStyle = STATUS_STYLES[entry.status] ?? STATUS_STYLES['pending']
  const typeStyle   = TYPE_STYLES[entry.event_type] ?? TYPE_STYLES['order_confirmed']
  const customerDisplay = entry.customer_name ?? formatPhone(entry.recipient_phone)

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Customer */}
      <td className="py-3 pr-4" style={{ paddingLeft: 24 }}>
        <p className="font-medium" style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>
          {customerDisplay}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          {formatPhone(entry.recipient_phone)}
        </p>
      </td>

      {/* Order + amount */}
      <td className="py-3 pr-4">
        <p className="font-medium" style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>
          {entry.order_number ?? '—'}
        </p>
        {entry.total_price != null && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            ₹{Number(entry.total_price).toLocaleString('en-IN')}
          </p>
        )}
      </td>

      {/* Type badge */}
      <td className="py-3 pr-4">
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            background: typeStyle.bg,
            color: typeStyle.color,
          }}
        >
          {typeStyle.label}
        </span>
      </td>

      {/* Sent at */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {entry.sent_at
          ? formatDistanceToNow(new Date(entry.sent_at), { addSuffix: true })
          : <span style={{ color: 'var(--border)' }}>—</span>}
      </td>

      {/* Status */}
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

      {/* Tracking number */}
      <td className="py-3 pr-6" style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        {entry.tracking_number ?? <span style={{ color: 'var(--border)' }}>—</span>}
      </td>
    </tr>
  )
}
