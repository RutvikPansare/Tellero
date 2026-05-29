export interface ProductRule {
  product_id:    string
  product_title: string
  reminder_days: number
  enabled:       boolean
}

export interface ReorderSettings {
  enabled:               boolean
  default_reminder_days: number
  product_rules:         ProductRule[]
  template_name:         string
  send_time:             string  // "HH:MM" in IST
}

export interface ReorderLogItem {
  id:                    string
  recipient_phone:       string
  contact_name:          string | null
  source_product_id:     string
  product_name:          string
  original_order_number: string
  scheduled_for:         string
  sent_at:               string | null
  status:                'pending' | 'sent' | 'cancelled' | 'failed'
  reordered:             boolean
  reorder_value:         number | null
}

export interface ReorderStats {
  sentThisMonth:          number
  sentLastMonth:          number
  reorderedThisMonth:     number
  reorderedLastMonth:     number
  conversionRate:         number
  revenueFromReorders:    number
  eligibleCustomers:      number
}

export interface ShopifyProductOption {
  id:     string
  title:  string
  status: 'active' | 'archived' | 'draft'
}
