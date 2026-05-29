'use client'

import { useReorderLog } from '../_hooks/useReorderLog'
import { ReorderLogRow } from './ReorderLogRow'

type LogFilter = 'all' | 'pending' | 'sent' | 'reordered' | 'cancelled'

const TABS: { id: LogFilter; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'pending',   label: 'Pending' },
  { id: 'sent',      label: 'Sent' },
  { id: 'reordered', label: 'Reordered ✅' },
  { id: 'cancelled', label: 'Cancelled' },
]

const EMPTY_MESSAGES: Record<LogFilter, string> = {
  all:       "No reorder reminders yet. Enable reminders and they'll appear here after your first fulfilled order.",
  pending:   'No pending reminders.',
  sent:      'No sent reminders yet.',
  reordered: 'No reorders attributed yet. Check back after reminders start sending.',
  cancelled: 'No cancelled reminders.',
}

interface Props {
  log: ReturnType<typeof useReorderLog>
}

export function ReorderLog({ log }: Props) {
  const { logItems, filter, setFilter, loading, error } = log

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--cream-1)' }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Reminder Log</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Last 100 reminders</p>
        </div>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--cream-2)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '5px 12px', borderRadius: 10, fontSize: 12,
                fontWeight: filter === tab.id ? 600 : 400,
                background: filter === tab.id ? 'var(--cream-1)' : 'transparent',
                color: filter === tab.id ? 'var(--text-dark)' : 'var(--text-muted)',
                border: filter === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand-dark)' }} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p style={{ fontSize: 14, color: '#ef4444' }}>{error}</p>
        </div>
      ) : logItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="font-medium" style={{ fontSize: 15, color: 'var(--text-dark)' }}>No reminders here</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center' }}>
            {EMPTY_MESSAGES[filter]}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Customer', 'Product', 'Order', 'Scheduled', 'Sent', 'Status', 'Value'].map(col => (
                  <th key={col} style={{
                    paddingLeft: col === 'Customer' ? 24 : undefined,
                    paddingRight: col === 'Value' ? 24 : undefined,
                    paddingTop: 10, paddingBottom: 10,
                    textAlign: 'left', fontSize: 12, fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logItems.map(item => <ReorderLogRow key={item.id} item={item} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
