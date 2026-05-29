'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { AutomationTrendPoint } from '@/types/analytics'

interface Props {
  data: AutomationTrendPoint[]
}

const LINES: { key: keyof AutomationTrendPoint; color: string; label: string }[] = [
  { key: 'cod_confirmation', color: '#3B82F6', label: 'COD' },
  { key: 'abandoned_cart',   color: '#D97706', label: 'Cart' },
  { key: 'order_confirmed',  color: '#6B7280', label: 'Order Conf.' },
  { key: 'order_shipped',    color: '#9CA3AF', label: 'Shipping' },
  { key: 'reorder_reminder', color: '#22C55E', label: 'Reorder' },
  { key: 'win_back',         color: '#8B5CF6', label: 'Win-back' },
]

export function AutomationTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl p-8 flex items-center justify-center" style={{ background: 'white', border: '1px solid var(--border)', minHeight: 200 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not enough data for trend chart yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 16 }}>
        Monthly automation sends (last 6 months)
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {LINES.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
