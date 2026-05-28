import { formatDistanceToNow } from 'date-fns'
import type { AbandonedCheckout, LineItem } from '../_hooks/useAbandonedCartLog'

interface Props {
  checkout: AbandonedCheckout
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  recovered: { label: 'Recovered ✓', bg: 'rgba(22,163,74,0.08)',  color: '#16a34a' },
  sent:      { label: 'Sent',        bg: 'rgba(99,102,241,0.08)', color: '#6366f1' },
  pending:   { label: 'Pending',     bg: 'rgba(234,179,8,0.1)',   color: '#ca8a04' },
  cancelled: { label: 'Cancelled',   bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
}

function deriveStatus(checkout: AbandonedCheckout): keyof typeof STATUS_STYLES {
  if (checkout.recovered) return 'recovered'
  if (checkout.message_sent_at) return 'sent'
  return 'pending'
}

function formatProducts(items: LineItem[]): string {
  if (!items.length) return '—'
  const first = `${items[0].title} × ${items[0].quantity}`
  if (items.length === 1) return first
  return `${first} +${items.length - 1} more`
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return raw
}

export function AbandonedCartLogRow({ checkout }: Props) {
  const status      = deriveStatus(checkout)
  const statusStyle = STATUS_STYLES[status]
  const customerDisplay = checkout.customer_name ?? (checkout.customer_phone ? formatPhone(checkout.customer_phone) : '—')

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Customer */}
      <td className="py-3 pr-4" style={{ paddingLeft: 24 }}>
        <p className="font-medium" style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>
          {customerDisplay}
        </p>
        {checkout.customer_phone && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            {formatPhone(checkout.customer_phone)}
          </p>
        )}
      </td>

      {/* Cart value */}
      <td className="py-3 pr-4" style={{ fontSize: 14, color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>
        ₹{Number(checkout.total_price).toLocaleString('en-IN')}
      </td>

      {/* Products */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-mid)', maxWidth: 180 }}>
        {formatProducts(checkout.line_items)}
      </td>

      {/* Abandoned at */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {checkout.shopify_created_at
          ? formatDistanceToNow(new Date(checkout.shopify_created_at), { addSuffix: true })
          : '—'}
      </td>

      {/* Message sent at */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {checkout.message_sent_at
          ? formatDistanceToNow(new Date(checkout.message_sent_at), { addSuffix: true })
          : <span style={{ color: 'var(--border)' }}>Pending</span>}
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

      {/* Revenue recovered */}
      <td className="py-3 pr-6" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
        {checkout.recovery_revenue
          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>₹{Number(checkout.recovery_revenue).toLocaleString('en-IN')}</span>
          : <span style={{ color: 'var(--border)' }}>—</span>}
      </td>
    </tr>
  )
}
