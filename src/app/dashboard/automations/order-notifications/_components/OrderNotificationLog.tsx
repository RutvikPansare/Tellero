'use client'

import type { OrderNotifFilter } from '../_hooks/useOrderNotificationLog'
import { useOrderNotificationLog } from '../_hooks/useOrderNotificationLog'
import { OrderNotificationLogRow } from './OrderNotificationLogRow'

interface Props {
  log: ReturnType<typeof useOrderNotificationLog>
}

const TABS: { id: OrderNotifFilter; label: string }[] = [
  { id: 'all',             label: 'All' },
  { id: 'order_confirmed', label: 'Confirmations' },
  { id: 'order_shipped',   label: 'Shipping Updates' },
]

export function OrderNotificationLog({ log }: Props) {
  const { entries, filter, setFilter, loading, error } = log

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--cream-1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>
            Message Log
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Last 100 messages
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--cream-2)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '5px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: filter === tab.id ? 600 : 400,
                background: filter === tab.id ? 'var(--cream-1)' : 'transparent',
                color: filter === tab.id ? 'var(--text-dark)' : 'var(--text-muted)',
                border: filter === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand-dark)' }} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p style={{ fontSize: 14, color: '#ef4444' }}>{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="font-medium" style={{ fontSize: 15, color: 'var(--text-dark)' }}>No messages yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filter === 'all'
              ? 'Messages will appear here when orders are placed or shipped.'
              : filter === 'order_confirmed'
              ? 'Confirmation messages will appear here.'
              : 'Shipping update messages will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Customer', 'Order', 'Type', 'Sent', 'Status', 'Tracking'].map(col => (
                  <th
                    key={col}
                    style={{
                      paddingLeft: col === 'Customer' ? 24 : undefined,
                      paddingRight: col === 'Tracking' ? 24 : undefined,
                      paddingTop: 10,
                      paddingBottom: 10,
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <OrderNotificationLogRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
