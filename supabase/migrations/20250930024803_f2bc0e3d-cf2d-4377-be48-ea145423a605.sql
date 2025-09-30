-- Remove existing authentication-dependent tables and recreate as standalone
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.doctors;
DROP TABLE IF EXISTS public.elder_experts;
DROP TABLE IF EXISTS public.medicine_reminders;
DROP TABLE IF EXISTS public.symptom_assessments;
DROP TABLE IF EXISTS public.profiles;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_by_user_id(uuid);
DROP FUNCTION IF EXISTS public.set_user_role(uuid, text);

-- Create simple user_info table without authentication
CREATE TABLE public.user_info (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  country_code text,
  password_hash text NOT NULL,
  role text DEFAULT 'user',
  age integer,
  gender text,
  medical_history text,
  allergies text,
  chronic_conditions text,
  preferred_medicine text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS but allow all operations for simplicity
ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all operations on user_info" 
ON public.user_info 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_user_info_updated_at
BEFORE UPDATE ON public.user_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();