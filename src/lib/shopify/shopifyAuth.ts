// OAuth helpers — server-side only

import crypto from 'crypto'

export function buildShopifyInstallUrl(shop: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    scope: process.env.SHOPIFY_SCOPES!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/oauth/callback`,
    state,
  })
  return `https://${shop}/admin/oauth/authorize?${params}`
}

export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<string> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export function verifyShopifyOAuthCallback(
  query: Record<string, string>
): boolean {
  const { hmac, ...rest } = query
  if (!hmac) return false

  const message = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('&')

  const generatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(message)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac, 'hex'),
      Buffer.from(hmac, 'hex')
    )
  } catch {
    return false
  }
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}
