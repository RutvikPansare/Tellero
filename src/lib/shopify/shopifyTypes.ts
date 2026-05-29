// Typed Shopify webhook payloads
// Only includes fields Tellero actually uses

export interface ShopifyOrder {
  id: number
  order_number: number
  name: string                          // "#1001"
  email: string
  phone: string | null
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided'
  fulfillment_status: 'fulfilled' | 'partial' | 'restocked' | null
  gateway: string                       // "Cash on Delivery", "Razorpay", etc.
  total_price: string                   // "1299.00"
  currency: string
  cancel_reason: string | null
  cancelled_at: string | null
  line_items: ShopifyLineItem[]
  customer: ShopifyCustomer | null
  shipping_address: ShopifyAddress | null
  fulfillments: ShopifyFulfillment[]
  created_at: string
  updated_at: string
}

export interface ShopifyLineItem {
  id: number
  title: string
  quantity: number
  price: string
  variant_title: string | null
  sku: string | null
  product_id: number
}

export interface ShopifyCustomer {
  id: number
  email: string
  phone: string | null
  first_name: string
  last_name: string
}

export interface ShopifyAddress {
  first_name: string
  last_name: string
  address1: string
  city: string
  province: string
  country: string
  zip: string
  phone: string | null
}

export interface ShopifyFulfillment {
  id: number
  status: string
  tracking_number: string | null
  tracking_url: string | null
  tracking_company: string | null
  created_at: string
}

export interface ShopifyCheckout {
  id: number
  token: string
  email: string | null
  phone: string | null
  total_price: string
  line_items: ShopifyLineItem[]
  customer: ShopifyCustomer | null
  abandoned_checkout_url: string
  created_at: string
  updated_at: string
}

export interface ShopifyWebhook {
  id: number
  address: string
  topic: ShopifyWebhookTopic
  format: 'json'
  created_at: string
}

export type ShopifyWebhookTopic =
  | 'orders/create'
  | 'orders/fulfilled'
  | 'orders/cancelled'
  | 'checkouts/create'
  | 'app/uninstalled'

export interface ShopifyProductVariant {
  id: number
  title: string
  inventory_quantity: number
  price: string
  sku: string | null
}

export interface ShopifyProduct {
  id: number
  title: string
  status: 'active' | 'archived' | 'draft'
  variants: ShopifyProductVariant[]
}
