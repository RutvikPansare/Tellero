import { formatDistanceToNow, format } from 'date-fns'
import type { ReorderLogItem } from '@/types/reorder'

interface Props {
  item: ReorderLogItem
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Scheduled',  bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  sent:      { label: 'Sent',       bg: 'rgba(99,102,241,0.08)', color: '#6366f1' },
  cancelled: { label: 'Cancelled',  bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  failed:    { label: 'Failed',     bg: 'rgba(239,68,68,0.08)',  color: '#ef4444' },
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return raw
}

function scheduledTooltip(iso: string): string {
  return `Sends on ${format(new Date(iso), "MMM d 'at' h:mm a")} IST`
}

export function ReorderLogRow({ item }: Props) {
  // Reordered rows get a green tint; failed get red; cancelled get muted
  const rowBg =
    item.reordered      ? 'rgba(22,163,74,0.04)' :
    item.status === 'failed'    ? 'rgba(239,68,68,0.03)' :
    item.status === 'cancelled' ? undefined : undefined

  const rowOpacity = item.status === 'cancelled' ? 0.55 : 1

  const statusStyle = item.reordered
    ? { label: 'Reordered ✅', bg: 'rgba(22,163,74,0.10)', color: '#16a34a' }
    : (STATUS_STYLES[item.status] ?? STATUS_STYLES['pending'])

  const customerDisplay = item.contact_name ?? formatPhone(item.recipient_phone)

  return (
    <tr style={{ borderBottom: '1px solid var(--border)', background: rowBg, opacity: rowOpacity }}>
      {/* Customer */}
      <td className="py-3 pr-4" style={{ paddingLeft: 24 }}>
        <p className="font-medium" style={{ fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{customerDisplay}</p>
        {item.contact_name && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{formatPhone(item.recipient_phone)}</p>
        )}
      </td>

      {/* Product */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-dark)', maxWidth: 160 }}>
        <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
          {item.product_name}
        </span>
      </td>

      {/* Order */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {item.original_order_number}
      </td>

      {/* Scheduled */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {item.status === 'pending' ? (
          <span title={scheduledTooltip(item.scheduled_for)}>
            {formatDistanceToNow(new Date(item.scheduled_for), { addSuffix: true })}
          </span>
        ) : (
          formatDistanceToNow(new Date(item.scheduled_for), { addSuffix: true })
        )}
      </td>

      {/* Sent at */}
      <td className="py-3 pr-4" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {item.sent_at
          ? formatDistanceToNow(new Date(item.sent_at), { addSuffix: true })
          : <span style={{ color: 'var(--border)' }}>Not yet</span>}
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 99,
          fontSize: 12, fontWeight: 600,
          background: statusStyle.bg, color: statusStyle.color,
        }}>
          {statusStyle.label}
        </span>
      </td>

      {/* Value */}
      <td className="py-3 pr-6" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
        {item.reorder_value != null
          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>₹{Number(item.reorder_value).toLocaleString('en-IN')}</span>
          : <span style={{ color: 'var(--border)' }}>—</span>}
      </td>
    </tr>
  )
}
