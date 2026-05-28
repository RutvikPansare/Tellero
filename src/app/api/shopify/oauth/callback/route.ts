// GET /api/shopify/oauth/callback?code=xxx&shop=xxx&hmac=xxx&state=xxx
// Exchanges OAuth code for access token, registers webhooks, saves connection

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exchangeCodeForToken, verifyShopifyOAuthCallback } from '@/lib/shopify/shopifyAuth'
import { registerAllWebhooks } from '@/lib/shopify/shopifyWebhooks'

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const userId = request.cookies.get('shopify_user_id')?.value
  const storedState = request.cookies.get('shopify_oauth_state')?.value

  if (!userId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/shopify?error=session_expired`
    )
  }

  // Verify state to prevent CSRF
  if (!storedState || params.state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/shopify?error=invalid_state`
    )
  }

  // Verify HMAC signature from Shopify
  if (!verifyShopifyOAuthCallback(params)) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/shopify?error=invalid_hmac`
    )
  }

  const { shop, code } = params

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(shop, code)

    // Register webhooks on the brand's Shopify store
    const webhookIds = await registerAllWebhooks(shop, accessToken)

    // Save connection using service role (bypasses RLS)
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('shopify_connections')
      .upsert({
        user_id: userId,
        shop_domain: shop,
        access_token: accessToken,
        webhook_ids: webhookIds,
        is_active: true,
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('[shopify/callback] DB error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/shopify?error=db_error`
      )
    }

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/shopify?connected=true`
    )
    response.cookies.delete('shopify_user_id')
    response.cookies.delete('shopify_oauth_state')
    return response

  } catch (err) {
    console.error('[shopify/callback] Error:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/shopify?error=oauth_failed`
    )
  }
}
