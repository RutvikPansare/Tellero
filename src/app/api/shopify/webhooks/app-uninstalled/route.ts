// POST — brand uninstalled Tellero from their Shopify store
// Deactivates the connection and cancels pending automations — preserves all data

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyShopifyWebhook } from '@/lib/shopify/shopifyWebhooks'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''
  const shopDomain = request.headers.get('x-shopify-shop-domain') ?? ''

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Look up user before deactivating
  const { data: connection } = await supabase
    .from('shopify_connections')
    .select('user_id')
    .eq('shop_domain', shopDomain)
    .single()

  // Mark connection inactive — do NOT delete orders or contacts
  await supabase
    .from('shopify_connections')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('shop_domain', shopDomain)

  if (connection) {
    // Cancel all pending automations for this user
    await supabase
      .from('automation_queue')
      .update({ status: 'cancelled' })
      .eq('user_id', connection.user_id)
      .eq('status', 'pending')
  }

  return NextResponse.json({ ok: true })
}
