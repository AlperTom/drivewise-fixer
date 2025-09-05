export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          calendar_provider: string | null
          company_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          duration_minutes: number | null
          external_event_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          service_id: string | null
          service_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          calendar_provider?: string | null
          company_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_minutes?: number | null
          external_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          service_id?: string | null
          service_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          calendar_provider?: string | null
          company_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_minutes?: number | null
          external_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          service_id?: string | null
          service_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          booking_settings: Json | null
          calendar_id: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          last_sync: string | null
          provider: string
          refresh_token: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          booking_settings?: Json | null
          calendar_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          provider: string
          refresh_token?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          booking_settings?: Json | null
          calendar_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          provider?: string
          refresh_token?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_knowledge: {
        Row: {
          category: string | null
          company_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          priority_level: number | null
          topic: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          priority_level?: number | null
          topic: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          priority_level?: number | null
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_knowledge_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          brand_colors: Json | null
          business_hours: Json | null
          business_type: string
          company_name: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          brand_colors?: Json | null
          business_hours?: Json | null
          business_type?: string
          company_name: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          brand_colors?: Json | null
          business_hours?: Json | null
          business_type?: string
          company_name?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      crm_integrations: {
        Row: {
          api_credentials: Json
          company_id: string
          created_at: string
          crm_type: string
          id: string
          is_active: boolean | null
          last_sync: string | null
          sync_settings: Json | null
          updated_at: string
        }
        Insert: {
          api_credentials: Json
          company_id: string
          created_at?: string
          crm_type: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_settings?: Json | null
          updated_at?: string
        }
        Update: {
          api_credentials?: Json
          company_id?: string
          created_at?: string
          crm_type?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_data_audit: {
        Row: {
          accessed_at: string
          action: string
          company_id: string | null
          customer_email: string | null
          customer_phone: string | null
          id: string
          table_name: string
          user_id: string
        }
        Insert: {
          accessed_at?: string
          action: string
          company_id?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          table_name: string
          user_id: string
        }
        Update: {
          accessed_at?: string
          action?: string
          company_id?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          description: string
          id: string
          lead_id: string
          metadata: Json | null
          timestamp: string
        }
        Insert: {
          activity_type: string
          description: string
          id?: string
          lead_id: string
          metadata?: Json | null
          timestamp?: string
        }
        Update: {
          activity_type?: string
          description?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          company_id: string
          created_at: string
          email: string | null
          estimated_value: number | null
          id: string
          last_contact: string | null
          lead_score: number | null
          name: string | null
          notes: string | null
          phone: string | null
          service_needed: string | null
          session_id: string | null
          source: string | null
          status: string | null
          updated_at: string
          urgency_level: string | null
          vehicle_info: Json | null
        }
        Insert: {
          company?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          last_contact?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          service_needed?: string | null
          session_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          urgency_level?: string | null
          vehicle_info?: Json | null
        }
        Update: {
          company?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          last_contact?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          service_needed?: string | null
          session_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          urgency_level?: string | null
          vehicle_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          additional_notes: string | null
          base_price: number | null
          car_type: string
          created_at: string
          id: string
          max_price: number | null
          pricing_type: string
          service_id: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          base_price?: number | null
          car_type: string
          created_at?: string
          id?: string
          max_price?: number | null
          pricing_type?: string
          service_id: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          base_price?: number | null
          car_type?: string
          created_at?: string
          id?: string
          max_price?: number | null
          pricing_type?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_actions: {
        Row: {
          action_text: string
          action_type: string
          company_id: string
          created_at: string
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          message_template: string | null
        }
        Insert: {
          action_text: string
          action_type: string
          company_id: string
          created_at?: string
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string | null
        }
        Update: {
          action_text?: string
          action_type?: string
          company_id?: string
          created_at?: string
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          widget_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          widget_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          widget_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          company_id: string
          created_at: string
          description: string | null
          display_order: number | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          prerequisites: string | null
          requires_appointment: boolean | null
          service_details: string | null
          service_name: string
          updated_at: string
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          prerequisites?: string | null
          requires_appointment?: boolean | null
          service_details?: string | null
          service_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          prerequisites?: string | null
          requires_appointment?: boolean | null
          service_details?: string | null
          service_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_configs: {
        Row: {
          api_key: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          settings: Json
          theme: Json
          updated_at: string
          widget_name: string
        }
        Insert: {
          api_key: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          settings?: Json
          theme?: Json
          updated_at?: string
          widget_name?: string
        }
        Update: {
          api_key?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          settings?: Json
          theme?: Json
          updated_at?: string
          widget_name?: string
        }
        Relationships: []
      }
      widget_conversations: {
        Row: {
          conversation_data: Json | null
          created_at: string
          id: string
          lead_id: string | null
          session_id: string
          status: string
          updated_at: string
          visitor_data: Json | null
          widget_id: string
        }
        Insert: {
          conversation_data?: Json | null
          created_at?: string
          id?: string
          lead_id?: string | null
          session_id: string
          status?: string
          updated_at?: string
          visitor_data?: Json | null
          widget_id: string
        }
        Update: {
          conversation_data?: Json | null
          created_at?: string
          id?: string
          lead_id?: string | null
          session_id?: string
          status?: string
          updated_at?: string
          visitor_data?: Json | null
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_conversations_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widget_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_appointment_access: {
        Args: {
          p_action?: string
          p_appointment_id: string
          p_customer_email?: string
          p_customer_phone?: string
        }
        Returns: undefined
      }
      log_customer_access: {
        Args: {
          p_action?: string
          p_company_id: string
          p_customer_email?: string
          p_customer_phone?: string
          p_table_name: string
        }
        Returns: undefined
      }
      mask_appointment_data: {
        Args: {
          appointment_id: string
          check_user_id: string
          data_field: string
        }
        Returns: string
      }
      mask_customer_data: {
        Args: {
          check_company_id: string
          check_user_id: string
          data_field: string
        }
        Returns: string
      }
      validate_appointment_access: {
        Args: { appointment_id: string; user_id: string }
        Returns: boolean
      }
      validate_widget_api_key: {
        Args: { api_key_input: string }
        Returns: {
          company_id: string
          company_name: string
          settings: Json
          theme: Json
          widget_id: string
        }[]
      }
      validate_widget_api_key_secure: {
        Args: { api_key_input: string; client_ip?: string }
        Returns: {
          company_id: string
          company_name: string
          rate_limited: boolean
          settings: Json
          theme: Json
          widget_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
