// GET /api/shopify/oauth/install?shop=mybrand.myshopify.com
// Redirects brand to Shopify OAuth — needs server for API key secret

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildShopifyInstallUrl, generateNonce } from '@/lib/shopify/shopifyAuth'

export async function GET(request: NextRequest) {
  // Must be authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shop = request.nextUrl.searchParams.get('shop')
  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
  }

  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 })
  }

  const nonce = generateNonce()
  const installUrl = buildShopifyInstallUrl(shop, nonce)

  const response = NextResponse.redirect(installUrl)
  // Store user_id and nonce in cookies for the callback
  response.cookies.set('shopify_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    sameSite: 'lax',
  })
  response.cookies.set('shopify_oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    sameSite: 'lax',
  })

  return response
}
