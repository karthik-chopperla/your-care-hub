-- Enhanced Healthcare Platform Database Schema (Fixed)

-- Update existing user_info table to match requirements
ALTER TABLE public.user_info 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS medical_history text,
ADD COLUMN IF NOT EXISTS chronic_conditions text,
ADD COLUMN IF NOT EXISTS allergies text,
ADD COLUMN IF NOT EXISTS preferred_medicine text,
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;

-- Doctors table (if not exists)
CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  specialty text NOT NULL,
  qualifications text,
  experience_years integer,
  charges numeric,
  availability jsonb DEFAULT '{}',
  ratings numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  verification_status text DEFAULT 'pending',
  verification_docs text,
  phone_number text,
  email text,
  address text,
  is_online_available boolean DEFAULT true,
  is_offline_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Hospitals table (if not exists)
CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text,
  phone_number text,
  email text,
  facilities text[],
  ratings numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  cost_index text DEFAULT 'MEDIUM',
  success_rate numeric,
  emergency_services boolean DEFAULT false,
  icu_beds integer DEFAULT 0,
  general_beds integer DEFAULT 0,
  ambulance_available boolean DEFAULT false,
  coordinates jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Appointments table (if not exists)
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_info(id) NOT NULL,
  doctor_id uuid REFERENCES public.doctors(id),
  hospital_id uuid REFERENCES public.hospitals(id),
  appointment_type text NOT NULL CHECK (appointment_type IN ('online', 'offline')),
  scheduled_at timestamp with time zone NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  consultation_notes text,
  prescription_id uuid,
  payment_amount numeric,
  payment_status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Elder Experts table (if not exists)
CREATE TABLE IF NOT EXISTS public.elder_experts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  specialty text NOT NULL,
  traditional_medicine_type text,
  experience_years integer,
  charges numeric,
  availability jsonb DEFAULT '{}',
  ratings numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  verification_status text DEFAULT 'pending',
  phone_number text,
  email text,
  languages text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Notifications table (if not exists)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_info(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('appointment', 'medicine', 'sos', 'subscription', 'general')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- SOS Events table (if not exists)
CREATE TABLE IF NOT EXISTS public.sos_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_info(id) NOT NULL,
  location jsonb NOT NULL,
  hospital_id uuid REFERENCES public.hospitals(id),
  ambulance_tracking_id text,
  status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'dispatched', 'en_route', 'arrived', 'completed', 'cancelled')),
  estimated_arrival timestamp with time zone,
  actual_arrival timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'doctors' AND policyname = 'Everyone can view verified doctors') THEN
    ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Everyone can view verified doctors" ON public.doctors FOR SELECT USING (verification_status = 'verified');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hospitals' AND policyname = 'Everyone can view hospitals') THEN
    ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Everyone can view hospitals" ON public.hospitals FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can manage their own appointments') THEN
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their own appointments" ON public.appointments FOR ALL USING (user_id IN (SELECT id FROM public.user_info));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elder_experts' AND policyname = 'Everyone can view verified elder experts') THEN
    ALTER TABLE public.elder_experts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Everyone can view verified elder experts" ON public.elder_experts FOR SELECT USING (verification_status = 'verified');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id IN (SELECT id FROM public.user_info));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sos_events' AND policyname = 'Users can manage their own SOS events') THEN
    ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their own SOS events" ON public.sos_events FOR ALL USING (user_id IN (SELECT id FROM public.user_info));
  END IF;
END $$;