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
      tags: {
        Row: {
          id:            string
          user_id:       string
          name:          string
          color:         string
          contact_count: number
          created_at:    string
        }
        Insert: {
          id?:            string
          user_id:        string
          name:           string
          color?:         string
          contact_count?: number
          created_at?:    string
        }
        Update: {
          id?:            string
          user_id?:       string
          name?:          string
          color?:         string
          contact_count?: number
          created_at?:    string
        }
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id:     string
          created_at: string
        }
        Insert: {
          contact_id: string
          tag_id:     string
          created_at?: string
        }
        Update: {
          contact_id?: string
          tag_id?:     string
          created_at?: string
        }
      }
      segments: {
        Row: {
          id:                 string
          user_id:            string
          name:               string
          description:        string | null
          filters:            Json
          conjunction:        'AND' | 'OR'
          contact_count:      number
          last_calculated_at: string | null
          created_at:         string
          updated_at:         string
        }
        Insert: {
          id?:                 string
          user_id:             string
          name:                string
          description?:        string | null
          filters?:            Json
          conjunction?:        'AND' | 'OR'
          contact_count?:      number
          last_calculated_at?: string | null
          created_at?:         string
          updated_at?:         string
        }
        Update: {
          id?:                 string
          user_id?:            string
          name?:               string
          description?:        string | null
          filters?:            Json
          conjunction?:        'AND' | 'OR'
          contact_count?:      number
          last_calculated_at?: string | null
          created_at?:         string
          updated_at?:         string
        }
      }
      shopify_connections: {
        Row: {
          id: string
          user_id: string
          shop_domain: string
          access_token: string
          scope: string | null
          webhook_ids: Record<string, number>
          is_active: boolean
          installed_at: string
          last_webhook_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shop_domain: string
          access_token: string
          scope?: string | null
          webhook_ids?: Record<string, number>
          is_active?: boolean
          installed_at?: string
          last_webhook_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shop_domain?: string
          access_token?: string
          scope?: string | null
          webhook_ids?: Record<string, number>
          is_active?: boolean
          installed_at?: string
          last_webhook_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          shopify_order_id: string
          shopify_order_number: string | null
          contact_id: string | null
          customer_phone: string | null
          customer_name: string | null
          customer_email: string | null
          total_price: number
          currency: string
          payment_gateway: string | null
          financial_status: string | null
          fulfillment_status: string | null
          line_items: Json[]
          shipping_address: Json | null
          tracking_number: string | null
          tracking_url: string | null
          cancel_reason: string | null
          shopify_created_at: string | null
          shopify_updated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shopify_order_id: string
          shopify_order_number?: string | null
          contact_id?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          customer_email?: string | null
          total_price?: number
          currency?: string
          payment_gateway?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          line_items?: Json[]
          shipping_address?: Json | null
          tracking_number?: string | null
          tracking_url?: string | null
          cancel_reason?: string | null
          shopify_created_at?: string | null
          shopify_updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shopify_order_id?: string
          shopify_order_number?: string | null
          contact_id?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          customer_email?: string | null
          total_price?: number
          currency?: string
          payment_gateway?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          line_items?: Json[]
          shipping_address?: Json | null
          tracking_number?: string | null
          tracking_url?: string | null
          cancel_reason?: string | null
          shopify_created_at?: string | null
          shopify_updated_at?: string | null
          created_at?: string
        }
      }
      abandoned_checkouts: {
        Row: {
          id: string
          user_id: string
          shopify_checkout_id: string
          contact_id: string | null
          customer_phone: string | null
          customer_name: string | null
          customer_email: string | null
          total_price: number
          line_items: Json[]
          abandoned_checkout_url: string | null
          recovered: boolean
          recovered_at: string | null
          shopify_created_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shopify_checkout_id: string
          contact_id?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          customer_email?: string | null
          total_price?: number
          line_items?: Json[]
          abandoned_checkout_url?: string | null
          recovered?: boolean
          recovered_at?: string | null
          shopify_created_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shopify_checkout_id?: string
          contact_id?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          customer_email?: string | null
          total_price?: number
          line_items?: Json[]
          abandoned_checkout_url?: string | null
          recovered?: boolean
          recovered_at?: string | null
          shopify_created_at?: string | null
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          customer_phone: string
          customer_name: string | null
          status: 'open' | 'assigned' | 'resolved'
          assigned_to: string | null
          last_message_at: string | null
          last_message_preview: string | null
          unread_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          customer_phone: string
          customer_name?: string | null
          status?: 'open' | 'assigned' | 'resolved'
          assigned_to?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          customer_phone?: string
          customer_name?: string | null
          status?: 'open' | 'assigned' | 'resolved'
          assigned_to?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          direction: 'inbound' | 'outbound'
          body: string
          meta_message_id: string | null
          status: 'sent' | 'delivered' | 'read' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          direction: 'inbound' | 'outbound'
          body: string
          meta_message_id?: string | null
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          direction?: 'inbound' | 'outbound'
          body?: string
          meta_message_id?: string | null
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          created_at?: string
        }
        Relationships: []
      }
      automation_queue: {
        Row: {
          id: string
          user_id: string
          event_type: 'cod_confirmation' | 'abandoned_cart' | 'order_confirmed' | 'order_shipped' | 'order_cancelled' | 'reorder_reminder' | 'win_back'
          order_id: string | null
          checkout_id: string | null
          contact_id: string | null
          scheduled_for: string
          status: 'pending' | 'processing' | 'sent' | 'cancelled' | 'failed'
          template_name: string | null
          template_variables: Record<string, string>
          recipient_phone: string
          whatsapp_message_id: string | null
          sent_at: string | null
          error_message: string | null
          retry_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: 'cod_confirmation' | 'abandoned_cart' | 'order_confirmed' | 'order_shipped' | 'order_cancelled' | 'reorder_reminder' | 'win_back'
          order_id?: string | null
          checkout_id?: string | null
          contact_id?: string | null
          scheduled_for: string
          status?: 'pending' | 'processing' | 'sent' | 'cancelled' | 'failed'
          template_name?: string | null
          template_variables?: Record<string, string>
          recipient_phone: string
          whatsapp_message_id?: string | null
          sent_at?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: 'cod_confirmation' | 'abandoned_cart' | 'order_confirmed' | 'order_shipped' | 'order_cancelled' | 'reorder_reminder' | 'win_back'
          order_id?: string | null
          checkout_id?: string | null
          contact_id?: string | null
          scheduled_for?: string
          status?: 'pending' | 'processing' | 'sent' | 'cancelled' | 'failed'
          template_name?: string | null
          template_variables?: Record<string, string>
          recipient_phone?: string
          whatsapp_message_id?: string | null
          sent_at?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_contact_orders: {
        Args: { p_contact_id: string; p_order_value: number; p_order_date: string }
        Returns: void
      }
      mark_checkout_recovered: {
        Args: { p_user_id: string; p_customer_phone: string }
        Returns: void
      }
    }
    Enums: {
      template_status:   'draft' | 'pending' | 'approved' | 'rejected' | 'paused'
      template_category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
    }
  }
}
