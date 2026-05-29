// GET /api/shopify/products?user_id=<uuid>
// Returns the brand's Shopify product list for the reorder reminder settings UI.
// Server-side only — the Shopify access token must never leave the server.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShopifyClient } from '@/lib/shopify/shopifyClient'

export async function GET(request: NextRequest) {
  // ── Auth: verify the caller is a logged-in Supabase user ──────────────────
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Verify the requesting user owns this profile / is the brand ───────────
  // In this codebase there is no brands/brand_members table — user IS the brand.
  // user_id param is optional; if omitted we use the authenticated user's ID.
  const userId = request.nextUrl.searchParams.get('user_id') ?? user.id
  if (userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Fetch Shopify connection via service role (bypasses RLS on secret token) ──
  const adminSupabase = createAdminClient()
  const { data: connection } = await adminSupabase
    .from('shopify_connections')
    .select('shop_domain, access_token')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (!connection) {
    return NextResponse.json(
      { error: 'No active Shopify connection found. Connect your store in Settings → Shopify.' },
      { status: 404 }
    )
  }

  // ── Fetch products from Shopify ────────────────────────────────────────────
  try {
    const client = new ShopifyClient(connection.shop_domain, connection.access_token)
    const { products } = await client.getProducts(100)

    // Only surface active products to the UI
    const active = products.filter(p => p.status === 'active')
    return NextResponse.json({ products: active })
  } catch (err) {
    console.error('[api/shopify/products] Shopify API error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch products from Shopify. Please try again.' },
      { status: 503 }
    )
  }
}
