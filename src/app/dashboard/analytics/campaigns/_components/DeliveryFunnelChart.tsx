'use client'

interface Props {
  sent: number
  delivered: number
  read: number
  replied: number
}

const BARS: { key: keyof Omit<Props, never>; label: string; color: string }[] = [
  { key: 'sent',      label: 'Sent',      color: '#94A3B8' },
  { key: 'delivered', label: 'Delivered',  color: '#86EFAC' },
  { key: 'read',      label: 'Read',       color: '#22C55E' },
  { key: 'replied',   label: 'Replied',    color: '#25D366' },
]

export function DeliveryFunnelChart({ sent, delivered, read, replied }: Props) {
  const values = { sent, delivered, read, replied }
  const max = Math.max(sent, 1)

  return (
    <div className="flex flex-col gap-2">
      {BARS.map(({ key, label, color }) => {
        const val = values[key]
        const pct = sent > 0 ? (val / max) * 100 : 0
        const pctLabel = sent > 0 ? `${((val / sent) * 100).toFixed(1)}%` : '—'
        return (
          <div key={key} className="flex items-center gap-3">
            <span style={{ width: 70, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{label}</span>
            <div className="flex-1 relative" style={{ height: 28, background: 'var(--cream-2)', borderRadius: 6 }}>
              <div
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 6,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <span style={{ width: 80, fontSize: 12, color: 'var(--text-dark)', fontWeight: 600, textAlign: 'right' }}>
              {val.toLocaleString('en-IN')}
            </span>
            <span style={{ width: 50, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
              {pctLabel}
            </span>
          </div>
        )
      })}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>
        Read rate measured from delivered. Reply rate measured from sent.
      </p>
    </div>
  )
}
