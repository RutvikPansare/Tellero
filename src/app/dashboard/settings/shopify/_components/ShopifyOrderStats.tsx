"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ShopifyConnection = Database['public']['Tables']['shopify_connections']['Row']
interface ShopifyOrderStatsProps {
  connection: ShopifyConnection
}

interface Stats {
  totalOrders: number
  codOrders: number
  automationsThisMonth: number
  lastOrderAt: string | null
}

export function ShopifyOrderStats({ connection }: ShopifyOrderStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Cast to any since new tables aren't in the generated types yet
      const sb = supabase as any // eslint-disable-line

      const [ordersResult, automationsResult, lastOrderResult] = await Promise.all([
        sb.from('orders').select('payment_gateway', { count: 'exact' }).eq('user_id', user.id),
        sb.from('automation_queue').select('id', { count: 'exact' })
          .eq('user_id', user.id).eq('status', 'sent')
          .gte('sent_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        sb.from('orders').select('shopify_created_at').eq('user_id', user.id)
          .order('shopify_created_at', { ascending: false }).limit(1),
      ])

      const codOrders = ((ordersResult.data ?? []) as { payment_gateway: string | null }[]).filter(o =>
        o.payment_gateway?.toLowerCase().includes('cash') ||
        o.payment_gateway?.toLowerCase().includes('cod')
      ).length

      setStats({
        totalOrders: ordersResult.count ?? 0,
        codOrders,
        automationsThisMonth: automationsResult.count ?? 0,
        lastOrderAt: (lastOrderResult.data as { shopify_created_at: string | null }[] | null)?.[0]?.shopify_created_at ?? null,
      })
      setLoading(false)
    }

    load()
  }, [connection.user_id])

  const statCards = [
    {
      label: 'Orders synced',
      value: loading ? '—' : (stats?.totalOrders ?? 0).toLocaleString('en-IN'),
    },
    {
      label: 'COD orders',
      value: loading ? '—' : (stats?.codOrders ?? 0).toLocaleString('en-IN'),
    },
    {
      label: 'Automations this month',
      value: loading ? '—' : (stats?.automationsThisMonth ?? 0).toLocaleString('en-IN'),
    },
    {
      label: 'Last order received',
      value: loading ? '—' : stats?.lastOrderAt ? relativeTime(stats.lastOrderAt) : 'No orders yet',
    },
  ]

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Order stats
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: '14px 16px',
            background: 'var(--cream)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {card.label}
            </p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
