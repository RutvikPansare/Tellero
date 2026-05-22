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
          waba_id: string | null
          meta_access_token: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          brand_name?: string | null
          whatsapp_number?: string | null
          plan?: 'free' | 'starter' | 'growth' | 'scale'
          waba_id?: string | null
          meta_access_token?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          brand_name?: string | null
          whatsapp_number?: string | null
          plan?: 'free' | 'starter' | 'growth' | 'scale'
          waba_id?: string | null
          meta_access_token?: string | null
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
      templates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
          language: string
          components: Json[]
          variable_labels: Record<string, string>
          meta_template_id: string | null
          status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paused'
          rejection_reason: string | null
          submitted_at: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
          language?: string
          components?: Json[]
          variable_labels?: Record<string, string>
          meta_template_id?: string | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'paused'
          rejection_reason?: string | null
          submitted_at?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
          language?: string
          components?: Json[]
          variable_labels?: Record<string, string>
          meta_template_id?: string | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'paused'
          rejection_reason?: string | null
          submitted_at?: string | null
          approved_at?: string | null
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
      template_status:   'draft' | 'pending' | 'approved' | 'rejected' | 'paused'
      template_category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
    }
  }
}
