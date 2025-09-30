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
          created_at: string
          doctor_id: string | null
          elder_expert_id: string | null
          id: string
          notes: string | null
          prescription_id: string | null
          scheduled_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_type: string
          created_at?: string
          doctor_id?: string | null
          elder_expert_id?: string | null
          id?: string
          notes?: string | null
          prescription_id?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_type?: string
          created_at?: string
          doctor_id?: string | null
          elder_expert_id?: string | null
          id?: string
          notes?: string | null
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
            foreignKeyName: "appointments_elder_expert_id_fkey"
            columns: ["elder_expert_id"]
            isOneToOne: false
            referencedRelation: "elder_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability: Json | null
          charges: number | null
          created_at: string
          experience_years: number | null
          id: string
          name: string
          qualifications: string | null
          ratings: number | null
          specialty: string
          updated_at: string
          user_id: string | null
          verification_docs: string | null
          verification_status: string | null
        }
        Insert: {
          availability?: Json | null
          charges?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          name: string
          qualifications?: string | null
          ratings?: number | null
          specialty: string
          updated_at?: string
          user_id?: string | null
          verification_docs?: string | null
          verification_status?: string | null
        }
        Update: {
          availability?: Json | null
          charges?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          name?: string
          qualifications?: string | null
          ratings?: number | null
          specialty?: string
          updated_at?: string
          user_id?: string | null
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
          experience_years: number | null
          id: string
          name: string
          ratings: number | null
          specialty: string
          traditional_medicine_type: string | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          availability?: Json | null
          charges?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          name: string
          ratings?: number | null
          specialty: string
          traditional_medicine_type?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          availability?: Json | null
          charges?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          name?: string
          ratings?: number | null
          specialty?: string
          traditional_medicine_type?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
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
          is_active: boolean | null
          medicine_id: string | null
          medicine_name: string
          notes: string | null
          reminder_times: string[] | null
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
          is_active?: boolean | null
          medicine_id?: string | null
          medicine_name: string
          notes?: string | null
          reminder_times?: string[] | null
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
          is_active?: boolean | null
          medicine_id?: string | null
          medicine_name?: string
          notes?: string | null
          reminder_times?: string[] | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_reminders_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          age: number | null
          allergies: string | null
          avatar_url: string | null
          chronic_conditions: string | null
          country_code: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          medical_history: string | null
          password_hash: string | null
          phone_number: string | null
          preferred_medicine: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          password_hash?: string | null
          phone_number?: string | null
          preferred_medicine?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          password_hash?: string | null
          phone_number?: string | null
          preferred_medicine?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptom_assessments: {
        Row: {
          ai_response: Json
          created_at: string
          home_remedies: string | null
          id: string
          recommended_action: string
          suggested_specialties: string[] | null
          symptoms: string
          triage_level: string
          user_id: string
        }
        Insert: {
          ai_response: Json
          created_at?: string
          home_remedies?: string | null
          id?: string
          recommended_action: string
          suggested_specialties?: string[] | null
          symptoms: string
          triage_level: string
          user_id: string
        }
        Update: {
          ai_response?: Json
          created_at?: string
          home_remedies?: string | null
          id?: string
          recommended_action?: string
          suggested_specialties?: string[] | null
          symptoms?: string
          triage_level?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_by_user_id: {
        Args: { user_uuid: string }
        Returns: {
          avatar_url: string
          country_code: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string
          role: string
          user_id: string
        }[]
      }
      set_user_role: {
        Args: { new_role: string; user_uuid: string }
        Returns: undefined
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
