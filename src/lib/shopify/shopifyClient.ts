// Typed Shopify Admin API wrapper
// All Shopify API calls go through here — never call Shopify API directly from components

import type { ShopifyOrder, ShopifyProduct } from './shopifyTypes'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ShopifyClient {
  private shop: string
  private accessToken: string
  private baseUrl: string

  constructor(shop: string, accessToken: string) {
    this.shop = shop
    this.accessToken = accessToken
    this.baseUrl = `https://${shop}/admin/api/2024-01`
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
  }

  async getShop(): Promise<{ shop: { name: string; email: string; domain: string } }> {
    return this.request('/shop.json')
  }

  async getOrder(orderId: string): Promise<{ order: ShopifyOrder }> {
    return this.request(`/orders/${orderId}.json`)
  }

  async getOrders(params?: {
    limit?: number
    since_id?: string
    status?: string
  }): Promise<{ orders: ShopifyOrder[] }> {
    const query = new URLSearchParams(params as Record<string, string>)
    return this.request(`/orders.json?${query}`)
  }

  // Cancels a Shopify order. Called when a customer replies NO or timeout fires with on_no_reply=cancel.
  async cancelOrder(shopifyOrderId: string): Promise<void> {
    await this.request(`/orders/${shopifyOrderId}/cancel.json`, {
      method: 'POST',
      body: JSON.stringify({
        reason: 'customer',
        email: false,
        refund: {},
      }),
    })
  }

  // Fetches product list for reorder settings — only fields needed for UI/checks.
  async getProducts(limit = 100): Promise<{ products: ShopifyProduct[] }> {
    return this.request<{ products: ShopifyProduct[] }>(
      `/products.json?limit=${limit}&fields=id,title,status,variants`
    )
  }

  // Fetches a single product — used by cron to check stock before sending reminder.
  async getProduct(productId: string): Promise<{ product: ShopifyProduct }> {
    return this.request<{ product: ShopifyProduct }>(`/products/${productId}.json`)
  }
}

export async function getShopifyClientForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ShopifyClient | null> {
  const { data } = await supabase
    .from('shopify_connections')
    .select('shop_domain, access_token')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!data) return null
  return new ShopifyClient(data.shop_domain, data.access_token)
}
