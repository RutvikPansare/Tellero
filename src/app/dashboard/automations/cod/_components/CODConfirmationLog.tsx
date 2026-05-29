import { CODLogRow } from './CODLogRow'
import type { CODConfirmation } from '../_hooks/useCODLog'

interface Props {
  confirmations: CODConfirmation[]
  loading: boolean
  error: string | null
}

export function CODConfirmationLog({ confirmations, loading, error }: Props) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--cream-1)' }}
    >
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>
          Confirmation log
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '2px 0 0' }}>
          Last 50 records · updates live
        </p>
      </div>

      {error && (
        <div className="px-6 py-4" style={{ color: '#dc2626', fontSize: 13 }}>
          Failed to load: {error}
        </div>
      )}

      {loading && (
        <div className="px-6 py-8 flex justify-center">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--burgundy)' }}
          />
        </div>
      )}

      {!loading && !error && confirmations.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No confirmations yet. Enable COD confirmation to start sending messages.
          </p>
        </div>
      )}

      {!loading && confirmations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 680 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Customer', 'Order', 'Sent', 'Reply', 'Status', 'Action'].map(h => (
                  <th
                    key={h}
                    className="px-0 py-3 text-left"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-muted)',
                      paddingLeft: h === 'Customer' ? 24 : 0,
                      paddingRight: 16,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="px-6">
              {confirmations.map(c => (
                <CODLogRow key={c.id} confirmation={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
