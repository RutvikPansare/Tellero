"use client"

import type { InboxFilter } from '../_hooks/useConversations'

interface InboxFiltersProps {
  active: InboxFilter
  counts: Record<InboxFilter, number>
  onChange: (f: InboxFilter) => void
}

const TABS: Array<{ key: InboxFilter; label: string }> = [
  { key: 'all',        label: 'All'        },
  { key: 'open',       label: 'Open'       },
  { key: 'mine',       label: 'Mine'       },
  { key: 'unassigned', label: 'Unassigned' },
]

export function InboxFilters({ active, counts, onChange }: InboxFiltersProps) {
  return (
    <div style={{
      display:    'flex',
      gap:        4,
      padding:    '8px 8px',
      borderBottom: '1px solid var(--border)',
      overflowX:  'auto',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
      flexShrink: 0,
    }}>
      {TABS.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            4,
              padding:        '4px 8px',
              borderRadius:   99,
              border:         '1.5px solid',
              borderColor:    isActive ? 'var(--burgundy)' : 'var(--border)',
              background:     isActive ? 'rgba(56,0,8,0.07)' : 'transparent',
              color:          isActive ? 'var(--burgundy)' : 'var(--text-muted)',
              fontSize:       12,
              fontWeight:     isActive ? 700 : 500,
              cursor:         'pointer',
              whiteSpace:     'nowrap',
              flexShrink:     0,
              transition:     'all 0.15s',
            }}
          >
            {label}
            <span style={{
              fontSize:    10,
              fontWeight:  700,
              background:  isActive ? 'var(--burgundy)' : 'var(--border)',
              color:       isActive ? 'white' : 'var(--text-muted)',
              borderRadius: 99,
              padding:     '1px 5px',
              minWidth:    16,
              textAlign:   'center',
            }}>
              {counts[key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
