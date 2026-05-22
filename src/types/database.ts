export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          brand_name: string | null
          whatsapp_number: string | null
          plan: 'free' | 'starter' | 'growth' | 'scale'
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          brand_name?: string | null
          whatsapp_number?: string | null
          plan?: 'free' | 'starter' | 'growth' | 'scale'
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          brand_name?: string | null
          whatsapp_number?: string | null
          plan?: 'free' | 'starter' | 'growth' | 'scale'
        }
      }
      broadcasts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          message: string
          segment: string
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          scheduled_at: string | null
          sent_at: string | null
          total_recipients: number
          delivered: number
          opened: number
          replied: number
          opted_out: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          message: string
          segment: string
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          total_recipients?: number
          delivered?: number
          opened?: number
          replied?: number
          opted_out?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          message?: string
          segment?: string
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          total_recipients?: number
          delivered?: number
          opened?: number
          replied?: number
          opted_out?: number
        }
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          phone: string
          name: string | null
          email: string | null
          tags: string[]
          last_order_at: string | null
          total_orders: number
          total_spent: number
          health_score: number
          opted_in: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          phone: string
          name?: string | null
          email?: string | null
          tags?: string[]
          last_order_at?: string | null
          total_orders?: number
          total_spent?: number
          health_score?: number
          opted_in?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          phone?: string
          name?: string | null
          email?: string | null
          tags?: string[]
          last_order_at?: string | null
          total_orders?: number
          total_spent?: number
          health_score?: number
          opted_in?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
