"use client"

import { ShopifyConnected } from './ShopifyConnected'
import { ShopifyDisconnected } from './ShopifyDisconnected'
import type { Database } from '@/types/database'

type ShopifyConnection = Database['public']['Tables']['shopify_connections']['Row']

interface ShopifyConnectionCardProps {
  connection: ShopifyConnection | null
  userId: string
  onDisconnect: () => Promise<void>
}

export function ShopifyConnectionCard({ connection, userId, onDisconnect }: ShopifyConnectionCardProps) {
  if (!connection) {
    return <ShopifyDisconnected userId={userId} />
  }

  return <ShopifyConnected connection={connection} onDisconnect={onDisconnect} />
}
