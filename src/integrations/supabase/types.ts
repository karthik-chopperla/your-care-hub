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
      appointments: {
        Row: {
          appointment_type: string
          consultation_notes: string | null
          created_at: string
          doctor_id: string | null
          hospital_id: string | null
          id: string
          payment_amount: number | null
          payment_status: string | null
          prescription_id: string | null
          scheduled_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_type: string
          consultation_notes?: string | null
          created_at?: string
          doctor_id?: string | null
          hospital_id?: string | null
          id?: string
          payment_amount?: number | null
          payment_status?: string | null
          prescription_id?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_type?: string
          consultation_notes?: string | null
          created_at?: string
          doctor_id?: string | null
          hospital_id?: string | null
          id?: string
          payment_amount?: number | null
          payment_status?: string | null
          prescription_id?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          address: string | null
          availability: Json | null
          charges: number | null
          created_at: string
          email: string | null
          experience_years: number | null
          id: string
          is_offline_available: boolean | null
          is_online_available: boolean | null
          name: string
          phone_number: string | null
          qualifications: string | null
          ratings: number | null
          specialty: string
          total_ratings: number | null
          updated_at: string
          verification_docs: string | null
          verification_status: string | null
        }
        Insert: {
          address?: string | null
          availability?: Json | null
          charges?: number | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          is_offline_available?: boolean | null
          is_online_available?: boolean | null
          name: string
          phone_number?: string | null
          qualifications?: string | null
          ratings?: number | null
          specialty: string
          total_ratings?: number | null
          updated_at?: string
          verification_docs?: string | null
          verification_status?: string | null
        }
        Update: {
          address?: string | null
          availability?: Json | null
          charges?: number | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          is_offline_available?: boolean | null
          is_online_available?: boolean | null
          name?: string
          phone_number?: string | null
          qualifications?: string | null
          ratings?: number | null
          specialty?: string
          total_ratings?: number | null
          updated_at?: string
          verification_docs?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      elder_experts: {
        Row: {
          availability: Json | null
          charges: number | null
          created_at: string
          email: string | null
          experience_years: number | null
          id: string
          languages: string[] | null
          name: string
          phone_number: string | null
          ratings: number | null
          specialty: string
          total_ratings: number | null
          traditional_medicine_type: string | null
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          availability?: Json | null
          charges?: number | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          languages?: string[] | null
          name: string
          phone_number?: string | null
          ratings?: number | null
          specialty: string
          total_ratings?: number | null
          traditional_medicine_type?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          availability?: Json | null
          charges?: number | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          languages?: string[] | null
          name?: string
          phone_number?: string | null
          ratings?: number | null
          specialty?: string
          total_ratings?: number | null
          traditional_medicine_type?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string
          ambulance_available: boolean | null
          city: string
          coordinates: Json | null
          cost_index: string | null
          created_at: string
          email: string | null
          emergency_services: boolean | null
          facilities: string[] | null
          general_beds: number | null
          icu_beds: number | null
          id: string
          name: string
          phone_number: string | null
          pincode: string | null
          ratings: number | null
          state: string
          success_rate: number | null
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          address: string
          ambulance_available?: boolean | null
          city: string
          coordinates?: Json | null
          cost_index?: string | null
          created_at?: string
          email?: string | null
          emergency_services?: boolean | null
          facilities?: string[] | null
          general_beds?: number | null
          icu_beds?: number | null
          id?: string
          name: string
          phone_number?: string | null
          pincode?: string | null
          ratings?: number | null
          state: string
          success_rate?: number | null
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          ambulance_available?: boolean | null
          city?: string
          coordinates?: Json | null
          cost_index?: string | null
          created_at?: string
          email?: string | null
          emergency_services?: boolean | null
          facilities?: string[] | null
          general_beds?: number | null
          icu_beds?: number | null
          id?: string
          name?: string
          phone_number?: string | null
          pincode?: string | null
          ratings?: number | null
          state?: string
          success_rate?: number | null
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      medicine_reminders: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          medicine_name: string
          next_reminder: string | null
          notes: string | null
          reminder_times: string[]
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          medicine_name: string
          next_reminder?: string | null
          notes?: string | null
          reminder_times?: string[]
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          medicine_name?: string
          next_reminder?: string | null
          notes?: string | null
          reminder_times?: string[]
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          created_at: string
          dosage_form: string | null
          generic_name: string | null
          id: string
          manufacturer: string | null
          name: string
          strength: string | null
        }
        Insert: {
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          strength?: string | null
        }
        Update: {
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          strength?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_events: {
        Row: {
          actual_arrival: string | null
          ambulance_tracking_id: string | null
          created_at: string
          estimated_arrival: string | null
          hospital_id: string | null
          id: string
          location: Json
          notes: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_arrival?: string | null
          ambulance_tracking_id?: string | null
          created_at?: string
          estimated_arrival?: string | null
          hospital_id?: string | null
          id?: string
          location: Json
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_arrival?: string | null
          ambulance_tracking_id?: string | null
          created_at?: string
          estimated_arrival?: string | null
          hospital_id?: string | null
          id?: string
          location?: Json
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_events_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      user_info: {
        Row: {
          age: number | null
          allergies: string | null
          avatar_url: string | null
          chronic_conditions: string | null
          country_code: string | null
          created_at: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          medical_history: string | null
          password_hash: string
          phone_number: string
          preferred_medicine: string | null
          role: string | null
          service_type: string | null
          subscription_end_date: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          password_hash: string
          phone_number: string
          preferred_medicine?: string | null
          role?: string | null
          service_type?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          password_hash?: string
          phone_number?: string
          preferred_medicine?: string | null
          role?: string | null
          service_type?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
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
