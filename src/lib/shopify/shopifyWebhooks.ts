// Webhook registration and HMAC verification — server-side only

import crypto from 'crypto'

const WEBHOOK_TOPICS = [
  'orders/create',
  'orders/fulfilled',
  'orders/cancelled',
  'checkouts/create',
  'app/uninstalled',
] as const

export async function registerAllWebhooks(
  shop: string,
  accessToken: string
): Promise<Record<string, number>> {
  const webhookIds: Record<string, number> = {}

  for (const topic of WEBHOOK_TOPICS) {
    const webhookId = await registerWebhook(shop, accessToken, topic)
    webhookIds[topic.replace('/', '_')] = webhookId
  }

  return webhookIds
}

async function registerWebhook(
  shop: string,
  accessToken: string,
  topic: string
): Promise<number> {
  // orders/create → orders-create, checkouts/create → checkouts-create, app/uninstalled → app-uninstalled
  const urlSlug = topic.replace(/\//g, '-')
  const address = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/webhooks/${urlSlug}`

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/webhooks.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webhook: { topic, address, format: 'json' } }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to register webhook ${topic}: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.webhook.id
}

export async function deleteAllWebhooks(
  shop: string,
  accessToken: string,
  webhookIds: Record<string, number>
): Promise<void> {
  for (const webhookId of Object.values(webhookIds)) {
    await fetch(
      `https://${shop}/admin/api/2024-01/webhooks/${webhookId}.json`,
      {
        method: 'DELETE',
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    )
  }
}

export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string
): boolean {
  if (!hmacHeader) return false

  const generatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(rawBody, 'utf8')
    .digest('base64')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac),
      Buffer.from(hmacHeader)
    )
  } catch {
    return false
  }
}
