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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cafe_visits: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_email: string | null
          customer_id: string | null
          donation_amount: number | null
          donation_given: boolean
          guest_email: string | null
          guest_name: string
          id: string
          items: Json
          notes: string | null
          payment_method: "cash" | "card" | null
          visited_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          customer_id?: string | null
          donation_amount?: number | null
          donation_given?: boolean
          guest_email?: string | null
          guest_name?: string
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: "cash" | "card" | null
          visited_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          customer_id?: string | null
          donation_amount?: number | null
          donation_given?: boolean
          guest_email?: string | null
          guest_name?: string
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: "cash" | "card" | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          first_visited_at: string
          id: string
          last_visited_at: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          visit_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_visited_at?: string
          id?: string
          last_visited_at?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          visit_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_visited_at?: string
          id?: string
          last_visited_at?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          visit_count?: number
        }
        Relationships: []
      }
      cafe_sessions: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closed_by_email: string | null
          cold_drinks_served: number
          created_at: string
          hot_drinks_served: number
          id: string
          note: string | null
          opened_at: string
          opened_by: string | null
          opened_by_email: string | null
          people_served: number
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closed_by_email?: string | null
          cold_drinks_served?: number
          created_at?: string
          hot_drinks_served?: number
          id?: string
          note?: string | null
          opened_at?: string
          opened_by?: string | null
          opened_by_email?: string | null
          people_served?: number
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closed_by_email?: string | null
          cold_drinks_served?: number
          created_at?: string
          hot_drinks_served?: number
          id?: string
          note?: string | null
          opened_at?: string
          opened_by?: string | null
          opened_by_email?: string | null
          people_served?: number
          updated_at?: string
        }
        Relationships: []
      }
      cafe_status: {
        Row: {
          id: boolean
          is_open: boolean
          mode: "auto" | "manual_open" | "manual_closed"
          schedule: Json
          override_until: string | null
          note_en: string | null
          note_sl: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          is_open?: boolean
          mode?: "auto" | "manual_open" | "manual_closed"
          schedule?: Json
          override_until?: string | null
          note_en?: string | null
          note_sl?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          is_open?: boolean
          mode?: "auto" | "manual_open" | "manual_closed"
          schedule?: Json
          override_until?: string | null
          note_en?: string | null
          note_sl?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cafe_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_email: string | null
          id: string
          is_open: boolean
          note_en: string | null
          note_sl: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          id?: string
          is_open: boolean
          note_en?: string | null
          note_sl?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          id?: string
          is_open?: boolean
          note_en?: string | null
          note_sl?: string | null
        }
        Relationships: []
      }
      event_categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_sl: string | null
          id: string
          name_en: string
          name_sl: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          id?: string
          name_en: string
          name_sl: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          id?: string
          name_en?: string
          name_sl?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category_id: string | null
          created_at: string
          description_en: string | null
          description_sl: string | null
          event_date: string
          event_time: string | null
          featured: boolean
          id: string
          image_alignment: string
          image_path: string | null
          location_or_note_en: string | null
          location_or_note_sl: string | null
          published: boolean
          sort_order: number
          title_en: string
          title_sl: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          event_date: string
          event_time?: string | null
          featured?: boolean
          id?: string
          image_alignment?: string
          image_path?: string | null
          location_or_note_en?: string | null
          location_or_note_sl?: string | null
          published?: boolean
          sort_order?: number
          title_en: string
          title_sl: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          event_date?: string
          event_time?: string | null
          featured?: boolean
          id?: string
          image_alignment?: string
          image_path?: string | null
          location_or_note_en?: string | null
          location_or_note_sl?: string | null
          published?: boolean
          sort_order?: number
          title_en?: string
          title_sl?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          body_en: string | null
          body_sl: string | null
          button_link: string | null
          button_text_en: string | null
          button_text_sl: string | null
          created_at: string
          default_image_key: string | null
          eyebrow_en: string | null
          eyebrow_sl: string | null
          featured_event_ids: string[]
          featured_menu_item_ids: string[]
          id: string
          image_alignment: string
          image_path: string | null
          internal_label: string
          published: boolean
          secondary_button_link: string | null
          secondary_button_text_en: string | null
          secondary_button_text_sl: string | null
          section_type: string
          sort_order: number
          subtitle_en: string | null
          subtitle_sl: string | null
          title_en: string | null
          title_sl: string | null
          updated_at: string
          value_cards: Json
        }
        Insert: {
          body_en?: string | null
          body_sl?: string | null
          button_link?: string | null
          button_text_en?: string | null
          button_text_sl?: string | null
          created_at?: string
          default_image_key?: string | null
          eyebrow_en?: string | null
          eyebrow_sl?: string | null
          featured_event_ids?: string[]
          featured_menu_item_ids?: string[]
          id?: string
          image_alignment?: string
          image_path?: string | null
          internal_label: string
          published?: boolean
          secondary_button_link?: string | null
          secondary_button_text_en?: string | null
          secondary_button_text_sl?: string | null
          section_type: string
          sort_order?: number
          subtitle_en?: string | null
          subtitle_sl?: string | null
          title_en?: string | null
          title_sl?: string | null
          updated_at?: string
          value_cards?: Json
        }
        Update: {
          body_en?: string | null
          body_sl?: string | null
          button_link?: string | null
          button_text_en?: string | null
          button_text_sl?: string | null
          created_at?: string
          default_image_key?: string | null
          eyebrow_en?: string | null
          eyebrow_sl?: string | null
          featured_event_ids?: string[]
          featured_menu_item_ids?: string[]
          id?: string
          image_alignment?: string
          image_path?: string | null
          internal_label?: string
          published?: boolean
          secondary_button_link?: string | null
          secondary_button_text_en?: string | null
          secondary_button_text_sl?: string | null
          section_type?: string
          sort_order?: number
          subtitle_en?: string | null
          subtitle_sl?: string | null
          title_en?: string | null
          title_sl?: string | null
          updated_at?: string
          value_cards?: Json
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_sl: string | null
          id: string
          name_en: string
          name_sl: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          id?: string
          name_en: string
          name_sl: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          id?: string
          name_en?: string
          name_sl?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean
          category_id: string | null
          created_at: string
          description_en: string | null
          description_sl: string | null
          featured: boolean
          id: string
          image_path: string | null
          name_en: string
          name_sl: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          featured?: boolean
          id?: string
          image_path?: string | null
          name_en: string
          name_sl: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_sl?: string | null
          featured?: boolean
          id?: string
          image_path?: string | null
          name_en?: string
          name_sl?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          message: string
          moderator_note: string | null
          name: string | null
          public_response: string | null
          public_response_at: string | null
          request_type: string
          status: string
          submitter_ip_hash: string | null
          updated_at: string
          visibility_choice: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          message: string
          moderator_note?: string | null
          name?: string | null
          public_response?: string | null
          public_response_at?: string | null
          request_type?: string
          status?: string
          submitter_ip_hash?: string | null
          updated_at?: string
          visibility_choice?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          moderator_note?: string | null
          name?: string | null
          public_response?: string | null
          public_response_at?: string | null
          request_type?: string
          status?: string
          submitter_ip_hash?: string | null
          updated_at?: string
          visibility_choice?: string
        }
        Relationships: []
      }
      static_page_sections: {
        Row: {
          body_en: string | null
          body_sl: string | null
          bullets: Json
          button_link: string | null
          button_text_en: string | null
          button_text_sl: string | null
          created_at: string
          eyebrow_en: string | null
          eyebrow_sl: string | null
          id: string
          image_path: string | null
          internal_label: string
          items: Json
          layout_variant: string
          page_id: string
          published: boolean
          section_type: string
          sort_order: number
          subtitle_en: string | null
          subtitle_sl: string | null
          title_en: string | null
          title_sl: string | null
          updated_at: string
        }
        Insert: {
          body_en?: string | null
          body_sl?: string | null
          bullets?: Json
          button_link?: string | null
          button_text_en?: string | null
          button_text_sl?: string | null
          created_at?: string
          eyebrow_en?: string | null
          eyebrow_sl?: string | null
          id?: string
          image_path?: string | null
          internal_label: string
          items?: Json
          layout_variant?: string
          page_id: string
          published?: boolean
          section_type: string
          sort_order?: number
          subtitle_en?: string | null
          subtitle_sl?: string | null
          title_en?: string | null
          title_sl?: string | null
          updated_at?: string
        }
        Update: {
          body_en?: string | null
          body_sl?: string | null
          bullets?: Json
          button_link?: string | null
          button_text_en?: string | null
          button_text_sl?: string | null
          created_at?: string
          eyebrow_en?: string | null
          eyebrow_sl?: string | null
          id?: string
          image_path?: string | null
          internal_label?: string
          items?: Json
          layout_variant?: string
          page_id?: string
          published?: boolean
          section_type?: string
          sort_order?: number
          subtitle_en?: string | null
          subtitle_sl?: string | null
          title_en?: string | null
          title_sl?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "static_page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "static_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      static_pages: {
        Row: {
          created_at: string
          id: string
          internal_label: string
          nav_order: number
          page_key: string
          published: boolean
          show_in_navigation: boolean
          title_en: string
          title_sl: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_label: string
          nav_order?: number
          page_key: string
          published?: boolean
          show_in_navigation?: boolean
          title_en: string
          title_sl: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_label?: string
          nav_order?: number
          page_key?: string
          published?: boolean
          show_in_navigation?: boolean
          title_en?: string
          title_sl?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_prayer_wall: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          id: string
          message: string
          public_response: string
          public_response_at: string
          request_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
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
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
