export interface CampaignSummary {
  id: string
  name: string
  template_name: string
  status: string
  scheduled_at: string | null
  completed_at: string | null
  recipient_count: number
  sent_count: number
  delivered_count: number
  read_count: number
  replied_count: number
  failed_count: number
  delivery_rate: number | null
  read_rate: number | null
  reply_rate: number | null
  failure_rate: number | null
}

export interface OverallStats {
  total_campaigns: number
  total_messages_sent: number
  avg_delivery_rate: number | null
  avg_read_rate: number | null
  avg_reply_rate: number | null
  total_failed: number
}

export interface RecipientStatus {
  id: string
  phone: string
  contact_name: string | null
  status: string
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  replied_at: string | null
  failed_at: string | null
  error_code: string | null
  error_message: string | null
}

export interface AutomationTypeStats {
  event_type: string
  label: string
  sent_count: number
  delivered_count: number
  read_count: number
  replied_count: number
  delivery_rate: number | null
  read_rate: number | null
  reply_rate: number | null
}

export interface AutomationTrendPoint {
  month: string
  cod_confirmation: number
  abandoned_cart: number
  order_confirmed: number
  order_shipped: number
  reorder_reminder: number
  win_back: number
}

export type AnalyticsPeriod = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all_time'
