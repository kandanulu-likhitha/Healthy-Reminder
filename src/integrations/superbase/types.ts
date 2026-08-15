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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          quantity: number
          saved_for_later: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          quantity?: number
          saved_for_later?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          quantity?: number
          saved_for_later?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          consultation_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          created_at: string
          disease_name: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          scheduled_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          disease_name?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          scheduled_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          disease_name?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          scheduled_at?: string | null
          status?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          activities: string | null
          ai_suggestion: string | null
          created_at: string
          energy_level: number | null
          exercise_minutes: number | null
          id: string
          log_date: string
          mood: string | null
          patient_id: string
          problems: string | null
          sleep_hours: number | null
          symptoms: string[] | null
          updated_at: string
          water_intake: number | null
        }
        Insert: {
          activities?: string | null
          ai_suggestion?: string | null
          created_at?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          patient_id: string
          problems?: string | null
          sleep_hours?: number | null
          symptoms?: string[] | null
          updated_at?: string
          water_intake?: number | null
        }
        Update: {
          activities?: string | null
          ai_suggestion?: string | null
          created_at?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          patient_id?: string
          problems?: string | null
          sleep_hours?: number | null
          symptoms?: string[] | null
          updated_at?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          available_days: string[] | null
          available_hours: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string
          hospital_affiliation: string | null
          id: string
          is_verified: boolean | null
          license_number: string | null
          rating: number | null
          specialty: string | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          available_days?: string[] | null
          available_hours?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          hospital_affiliation?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          rating?: number | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          available_days?: string[] | null
          available_hours?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          hospital_affiliation?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          rating?: number | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          is_primary: boolean
          patient_id: string
          relationship: string | null
        }
        Insert: {
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          is_primary?: boolean
          patient_id: string
          relationship?: string | null
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          patient_id?: string
          relationship?: string | null
        }
        Relationships: []
      }
      emergency_requests: {
        Row: {
          assigned_doctor_id: string | null
          created_at: string
          description: string | null
          disease_name: string
          id: string
          patient_age: number | null
          patient_id: string
          patient_name: string
          priority: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          assigned_doctor_id?: string | null
          created_at?: string
          description?: string | null
          disease_name: string
          id?: string
          patient_age?: number | null
          patient_id: string
          patient_name: string
          priority?: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          assigned_doctor_id?: string | null
          created_at?: string
          description?: string | null
          disease_name?: string
          id?: string
          patient_age?: number | null
          patient_id?: string
          patient_name?: string
          priority?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: []
      }
      health_readings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reading_type: string
          recorded_at: string
          secondary_value: number | null
          unit: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reading_type: string
          recorded_at?: string
          secondary_value?: number | null
          unit: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reading_type?: string
          recorded_at?: string
          secondary_value?: number | null
          unit?: string
          value?: number
        }
        Relationships: []
      }
      medicine_inventory: {
        Row: {
          category: string | null
          created_at: string
          id: string
          low_stock_threshold: number | null
          medicine_name: string
          pharmacy_id: string
          price: number | null
          quantity: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          medicine_name: string
          pharmacy_id: string
          price?: number | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          medicine_name?: string
          pharmacy_id?: string
          price?: number | null
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      medicine_orders: {
        Row: {
          created_at: string
          delivery_address: Json | null
          delivery_charge: number
          discount: number
          disease_name: string
          estimated_delivery: string | null
          gst: number
          id: string
          items: Json
          medicine_name: string
          order_number: string | null
          patient_id: string
          patient_name: string
          payment_method: string
          payment_status: string
          pharmacy_id: string | null
          quantity: number
          status: string
          subtotal: number
          timeline: Json
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_address?: Json | null
          delivery_charge?: number
          discount?: number
          disease_name: string
          estimated_delivery?: string | null
          gst?: number
          id?: string
          items?: Json
          medicine_name: string
          order_number?: string | null
          patient_id: string
          patient_name: string
          payment_method?: string
          payment_status?: string
          pharmacy_id?: string | null
          quantity?: number
          status?: string
          subtotal?: number
          timeline?: Json
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_address?: Json | null
          delivery_charge?: number
          discount?: number
          disease_name?: string
          estimated_delivery?: string | null
          gst?: number
          id?: string
          items?: Json
          medicine_name?: string
          order_number?: string | null
          patient_id?: string
          patient_name?: string
          payment_method?: string
          payment_status?: string
          pharmacy_id?: string | null
          quantity?: number
          status?: string
          subtotal?: number
          timeline?: Json
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          brand: string | null
          category: string | null
          composition: string | null
          created_at: string
          delivery_days: number
          discount_pct: number
          disease_ids: string[]
          dosage: string | null
          generic_name: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          name: string
          prescription_required: boolean
          price: number
          rating: number
          side_effects: string[]
          stock: number
          storage: string | null
          strength: string | null
          updated_at: string
          uses: string | null
          warnings: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          composition?: string | null
          created_at?: string
          delivery_days?: number
          discount_pct?: number
          disease_ids?: string[]
          dosage?: string | null
          generic_name?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name: string
          prescription_required?: boolean
          price?: number
          rating?: number
          side_effects?: string[]
          stock?: number
          storage?: string | null
          strength?: string | null
          updated_at?: string
          uses?: string | null
          warnings?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          composition?: string | null
          created_at?: string
          delivery_days?: number
          discount_pct?: number
          disease_ids?: string[]
          dosage?: string | null
          generic_name?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name?: string
          prescription_required?: boolean
          price?: number
          rating?: number
          side_effects?: string[]
          stock?: number
          storage?: string | null
          strength?: string | null
          updated_at?: string
          uses?: string | null
          warnings?: string | null
        }
        Relationships: []
      }
      patient_medicine_inventory: {
        Row: {
          created_at: string
          current_quantity: number
          doses_per_day: number
          id: string
          last_refill_date: string | null
          low_stock_threshold: number
          medicine_name: string
          patient_id: string
          reminder_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_quantity?: number
          doses_per_day?: number
          id?: string
          last_refill_date?: string | null
          low_stock_threshold?: number
          medicine_name: string
          patient_id: string
          reminder_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_quantity?: number
          doses_per_day?: number
          id?: string
          last_refill_date?: string | null
          low_stock_threshold?: number
          medicine_name?: string
          patient_id?: string
          reminder_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medicine_inventory_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "patient_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_reminders: {
        Row: {
          created_at: string
          disease_id: string
          disease_name: string
          frequency: string
          id: string
          is_active: boolean
          medication_name: string
          patient_id: string
          reminder_time: string
          ringtone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          disease_id: string
          disease_name: string
          frequency?: string
          id?: string
          is_active?: boolean
          medication_name: string
          patient_id: string
          reminder_time: string
          ringtone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          disease_id?: string
          disease_name?: string
          frequency?: string
          id?: string
          is_active?: boolean
          medication_name?: string
          patient_id?: string
          reminder_time?: string
          ringtone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_profiles: {
        Row: {
          created_at: string
          delivery_available: boolean | null
          delivery_radius_km: number | null
          id: string
          is_verified: boolean | null
          license_number: string | null
          operating_hours: string | null
          pharmacy_name: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_available?: boolean | null
          delivery_radius_km?: number | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          operating_hours?: string | null
          pharmacy_name?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_available?: boolean | null
          delivery_radius_km?: number | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          operating_hours?: string | null
          pharmacy_name?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          consultation_id: string | null
          created_at: string
          doctor_id: string | null
          file_url: string | null
          id: string
          medicines: Json | null
          notes: string | null
          patient_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          doctor_id?: string | null
          file_url?: string | null
          id?: string
          medicines?: Json | null
          notes?: string | null
          patient_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          doctor_id?: string | null
          file_url?: string | null
          id?: string
          medicines?: Json | null
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          action_time: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reminder_id: string
          scheduled_time: string
          status: string
        }
        Insert: {
          action_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reminder_id: string
          scheduled_time: string
          status?: string
        }
        Update: {
          action_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reminder_id?: string
          scheduled_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "patient_reminders"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "user" | "doctor" | "pharmacy"
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
      app_role: ["user", "doctor", "pharmacy"],
    },
  },
} as const
