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
      ambulance_partners: {
        Row: {
          city: string | null
          created_at: string | null
          driver_name: string
          equipment_available: string[] | null
          id: string
          is_available: boolean | null
          license_number: string | null
          location: Json
          partner_id: string | null
          phone_number: string | null
          ratings: number | null
          service_radius: number | null
          state: string | null
          total_ratings: number | null
          updated_at: string | null
          vehicle_number: string
          vehicle_type: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          driver_name: string
          equipment_available?: string[] | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          location: Json
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          service_radius?: number | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          vehicle_number: string
          vehicle_type?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          driver_name?: string
          equipment_available?: string[] | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          location?: Json
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          service_radius?: number | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          vehicle_number?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambulance_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
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
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_public_view"
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
      doctor_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      elder_advice_requests: {
        Row: {
          created_at: string | null
          elder_id: string
          id: string
          question: string
          replied_at: string | null
          reply: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          elder_id: string
          id?: string
          question: string
          replied_at?: string | null
          reply?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          elder_id?: string
          id?: string
          question?: string
          replied_at?: string | null
          reply?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elder_advice_requests_elder_id_fkey"
            columns: ["elder_id"]
            isOneToOne: false
            referencedRelation: "elder_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      elder_experts: {
        Row: {
          availability: Json | null
          charges: number | null
          city: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          location: Json | null
          name: string
          partner_id: string | null
          phone_number: string | null
          ratings: number | null
          specialty: string
          state: string | null
          total_ratings: number | null
          traditional_medicine_type: string | null
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          availability?: Json | null
          charges?: number | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          location?: Json | null
          name: string
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          specialty: string
          state?: string | null
          total_ratings?: number | null
          traditional_medicine_type?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          availability?: Json | null
          charges?: number | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          location?: Json | null
          name?: string
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          specialty?: string
          state?: string | null
          total_ratings?: number | null
          traditional_medicine_type?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elder_experts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      elder_remedies: {
        Row: {
          condition: string
          created_at: string | null
          duration: string
          elder_id: string
          id: string
          ingredients: string[]
          is_verified: boolean | null
          preparation_steps: string
          remedy_name: string
          safety_notes: string | null
          updated_at: string | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          duration: string
          elder_id: string
          id?: string
          ingredients: string[]
          is_verified?: boolean | null
          preparation_steps: string
          remedy_name: string
          safety_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          duration?: string
          elder_id?: string
          id?: string
          ingredients?: string[]
          is_verified?: boolean | null
          preparation_steps?: string
          remedy_name?: string
          safety_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elder_remedies_elder_id_fkey"
            columns: ["elder_id"]
            isOneToOne: false
            referencedRelation: "elder_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      elder_saved_remedies: {
        Row: {
          advice_id: string | null
          created_at: string | null
          id: string
          remedy_id: string | null
          user_id: string
        }
        Insert: {
          advice_id?: string | null
          created_at?: string | null
          id?: string
          remedy_id?: string | null
          user_id: string
        }
        Update: {
          advice_id?: string | null
          created_at?: string | null
          id?: string
          remedy_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elder_saved_remedies_advice_id_fkey"
            columns: ["advice_id"]
            isOneToOne: false
            referencedRelation: "elder_advice_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elder_saved_remedies_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "elder_remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_partners: {
        Row: {
          address: string | null
          available_slots: Json | null
          certifications: string[] | null
          city: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          gym_name: string | null
          id: string
          is_available: boolean | null
          location: Json
          name: string
          partner_id: string | null
          phone_number: string | null
          pricing: Json | null
          ratings: number | null
          session_types: string[] | null
          specializations: string[] | null
          state: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          available_slots?: Json | null
          certifications?: string[] | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          gym_name?: string | null
          id?: string
          is_available?: boolean | null
          location: Json
          name: string
          partner_id?: string | null
          phone_number?: string | null
          pricing?: Json | null
          ratings?: number | null
          session_types?: string[] | null
          specializations?: string[] | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          available_slots?: Json | null
          certifications?: string[] | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          gym_name?: string | null
          id?: string
          is_available?: boolean | null
          location?: Json
          name?: string
          partner_id?: string | null
          phone_number?: string | null
          pricing?: Json | null
          ratings?: number | null
          session_types?: string[] | null
          specializations?: string[] | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitness_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      gynecologists: {
        Row: {
          available_slots: Json | null
          city: string | null
          consultation_fee: number | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          location: Json
          maternity_packages: Json | null
          name: string
          partner_id: string | null
          phone_number: string | null
          ratings: number | null
          specialization: string[] | null
          state: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          available_slots?: Json | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          location: Json
          maternity_packages?: Json | null
          name: string
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          specialization?: string[] | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          available_slots?: Json | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          location?: Json
          maternity_packages?: Json | null
          name?: string
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          specialization?: string[] | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gynecologists_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      home_nursing_partners: {
        Row: {
          agency_name: string
          available_nurses: number | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          is_available: boolean | null
          location: Json
          partner_id: string | null
          phone_number: string | null
          pricing: Json | null
          ratings: number | null
          service_radius: number | null
          services_offered: string[] | null
          state: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          agency_name: string
          available_nurses?: number | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          location: Json
          partner_id?: string | null
          phone_number?: string | null
          pricing?: Json | null
          ratings?: number | null
          service_radius?: number | null
          services_offered?: string[] | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          agency_name?: string
          available_nurses?: number | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          location?: Json
          partner_id?: string | null
          phone_number?: string | null
          pricing?: Json | null
          ratings?: number | null
          service_radius?: number | null
          services_offered?: string[] | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_nursing_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
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
      insurance_partners: {
        Row: {
          agent_name: string
          city: string | null
          company_name: string
          coverage_details: Json | null
          created_at: string | null
          email: string | null
          id: string
          insurance_types: string[] | null
          is_available: boolean | null
          license_number: string | null
          location: Json
          partner_id: string
          phone_number: string | null
          ratings: number | null
          state: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          city?: string | null
          company_name: string
          coverage_details?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          insurance_types?: string[] | null
          is_available?: boolean | null
          license_number?: string | null
          location?: Json
          partner_id: string
          phone_number?: string | null
          ratings?: number | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          city?: string | null
          company_name?: string
          coverage_details?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          insurance_types?: string[] | null
          is_available?: boolean | null
          license_number?: string | null
          location?: Json
          partner_id?: string
          phone_number?: string | null
          ratings?: number | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_plans: {
        Row: {
          coverage_amount: number | null
          coverage_details: Json | null
          created_at: string | null
          eligibility_criteria: string | null
          id: string
          is_active: boolean | null
          partner_id: string | null
          plan_name: string
          premium_monthly: number | null
          updated_at: string | null
        }
        Insert: {
          coverage_amount?: number | null
          coverage_details?: Json | null
          created_at?: string | null
          eligibility_criteria?: string | null
          id?: string
          is_active?: boolean | null
          partner_id?: string | null
          plan_name: string
          premium_monthly?: number | null
          updated_at?: string | null
        }
        Update: {
          coverage_amount?: number | null
          coverage_details?: Json | null
          created_at?: string | null
          eligibility_criteria?: string | null
          id?: string
          is_active?: boolean | null
          partner_id?: string | null
          plan_name?: string
          premium_monthly?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_shops: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          delivery_available: boolean | null
          delivery_radius: number | null
          email: string | null
          id: string
          is_open: boolean | null
          license_number: string | null
          location: Json
          operating_hours: Json | null
          partner_id: string | null
          phone_number: string | null
          ratings: number | null
          shop_name: string
          state: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_radius?: number | null
          email?: string | null
          id?: string
          is_open?: boolean | null
          license_number?: string | null
          location: Json
          operating_hours?: Json | null
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          shop_name: string
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_radius?: number | null
          email?: string | null
          id?: string
          is_open?: boolean | null
          license_number?: string | null
          location?: Json
          operating_hours?: Json | null
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          shop_name?: string
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_shops_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_inventory: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          generic_name: string | null
          id: string
          manufacturer: string | null
          medicine_name: string
          price: number
          shop_id: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          medicine_name: string
          price: number
          shop_id?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          medicine_name?: string
          price?: number
          shop_id?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_inventory_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "medical_shops"
            referencedColumns: ["id"]
          },
        ]
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
      mental_health_partners: {
        Row: {
          available_slots: Json | null
          city: string | null
          consultation_fee: number | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          location: Json
          name: string
          partner_id: string | null
          phone_number: string | null
          ratings: number | null
          session_duration: number | null
          specialization: string[] | null
          state: string | null
          therapy_types: string[] | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          available_slots?: Json | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          location: Json
          name: string
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          session_duration?: number | null
          specialization?: string[] | null
          state?: string | null
          therapy_types?: string[] | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          available_slots?: Json | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          location?: Json
          name?: string
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          session_duration?: number | null
          specialization?: string[] | null
          state?: string | null
          therapy_types?: string[] | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mental_health_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          calories: number | null
          category: string | null
          created_at: string | null
          description: string | null
          diet_type: string[] | null
          id: string
          is_available: boolean | null
          item_name: string
          price: number
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          diet_type?: string[] | null
          id?: string
          is_available?: boolean | null
          item_name: string
          price: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          diet_type?: string[] | null
          id?: string
          is_available?: boolean | null
          item_name?: string
          price?: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_partners"
            referencedColumns: ["id"]
          },
        ]
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
      partner_bookings: {
        Row: {
          booking_type: string
          created_at: string | null
          details: Json | null
          id: string
          notes: string | null
          partner_id: string
          partner_type: Database["public"]["Enums"]["partner_service_type"]
          payment_amount: number | null
          payment_status: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          notes?: string | null
          partner_id: string
          partner_type: Database["public"]["Enums"]["partner_service_type"]
          payment_amount?: number | null
          payment_status?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          notes?: string | null
          partner_id?: string
          partner_type?: Database["public"]["Enums"]["partner_service_type"]
          payment_amount?: number | null
          payment_status?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          partner_id: string | null
          title: string
          type: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          partner_id?: string | null
          title: string
          type: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          partner_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "partner_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_notifications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone_number: string | null
          service_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone_number?: string | null
          service_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone_number?: string | null
          service_type?: string
          updated_at?: string | null
          user_id?: string
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
          created_at: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          medical_history: string | null
          phone_number: string | null
          preferred_medicine: string | null
          service_type: string | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          medical_history?: string | null
          phone_number?: string | null
          preferred_medicine?: string | null
          service_type?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          phone_number?: string | null
          preferred_medicine?: string | null
          service_type?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_partners: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          cuisine_types: string[] | null
          delivery_available: boolean | null
          delivery_radius: number | null
          diet_plans: Json | null
          email: string | null
          id: string
          is_open: boolean | null
          location: Json
          name: string
          operating_hours: Json | null
          partner_id: string | null
          phone_number: string | null
          ratings: number | null
          state: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          cuisine_types?: string[] | null
          delivery_available?: boolean | null
          delivery_radius?: number | null
          diet_plans?: Json | null
          email?: string | null
          id?: string
          is_open?: boolean | null
          location: Json
          name: string
          operating_hours?: Json | null
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          cuisine_types?: string[] | null
          delivery_available?: boolean | null
          delivery_radius?: number | null
          diet_plans?: Json | null
          email?: string | null
          id?: string
          is_open?: boolean | null
          location?: Json
          name?: string
          operating_hours?: Json | null
          partner_id?: string | null
          phone_number?: string | null
          ratings?: number | null
          state?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_partners_partner_id_fkey"
            columns: ["partner_id"]
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
      symptom_history: {
        Row: {
          assessment: Json
          created_at: string
          id: string
          symptoms: string
          user_id: string
        }
        Insert: {
          assessment: Json
          created_at?: string
          id?: string
          symptoms: string
          user_id: string
        }
        Update: {
          assessment?: Json
          created_at?: string
          id?: string
          symptoms?: string
          user_id?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      doctors_public_view: {
        Row: {
          availability: Json | null
          charges: number | null
          created_at: string | null
          experience_years: number | null
          id: string | null
          is_offline_available: boolean | null
          is_online_available: boolean | null
          masked_address: string | null
          masked_email: string | null
          masked_phone: string | null
          name: string | null
          qualifications: string | null
          ratings: number | null
          specialty: string | null
          total_ratings: number | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          availability?: Json | null
          charges?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string | null
          is_offline_available?: boolean | null
          is_online_available?: boolean | null
          masked_address?: never
          masked_email?: never
          masked_phone?: never
          name?: string | null
          qualifications?: string | null
          ratings?: number | null
          specialty?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          availability?: Json | null
          charges?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string | null
          is_offline_available?: boolean | null
          is_online_available?: boolean | null
          masked_address?: never
          masked_email?: never
          masked_phone?: never
          name?: string | null
          qualifications?: string | null
          ratings?: number | null
          specialty?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_insert_service_record: {
        Args: { _partner_id: string }
        Returns: boolean
      }
      get_user_partner_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_partner_owner: { Args: { _partner_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "partner" | "admin"
      partner_service_type:
        | "hospital"
        | "gynecologist"
        | "mental_health"
        | "home_nursing"
        | "ambulance"
        | "medical_shop"
        | "restaurant"
        | "fitness"
        | "insurance"
        | "elder_advice"
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
      app_role: ["user", "partner", "admin"],
      partner_service_type: [
        "hospital",
        "gynecologist",
        "mental_health",
        "home_nursing",
        "ambulance",
        "medical_shop",
        "restaurant",
        "fitness",
        "insurance",
        "elder_advice",
      ],
    },
  },
} as const
