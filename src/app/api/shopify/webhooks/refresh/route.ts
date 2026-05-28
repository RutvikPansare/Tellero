// POST — re-registers all Shopify webhooks for the current user's connection
// Called from the settings UI when webhooks show as missing

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registerAllWebhooks, deleteAllWebhooks } from '@/lib/shopify/shopifyWebhooks'

export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: connection } = await admin
    .from('shopify_connections')
    .select('shop_domain, access_token, webhook_ids')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!connection) {
    return NextResponse.json({ error: 'No active Shopify connection' }, { status: 404 })
  }

  try {
    // Delete existing webhooks first (best-effort, ignore errors)
    if (connection.webhook_ids && Object.keys(connection.webhook_ids).length > 0) {
      await deleteAllWebhooks(
        connection.shop_domain,
        connection.access_token,
        connection.webhook_ids as Record<string, number>
      ).catch(() => {})
    }

    // Re-register all webhooks
    const webhookIds = await registerAllWebhooks(
      connection.shop_domain,
      connection.access_token
    )

    // Persist the new webhook IDs
    await admin
      .from('shopify_connections')
      .update({ webhook_ids: webhookIds, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true, webhookIds })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
