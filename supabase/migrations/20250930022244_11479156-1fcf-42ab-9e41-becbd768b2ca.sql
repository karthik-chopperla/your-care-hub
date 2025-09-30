-- Update profiles table to match HealthMate specifications
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS phone,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role DROP NOT NULL;

-- Add unique constraints
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS unique_phone_per_country,
  DROP CONSTRAINT IF EXISTS unique_email,
  ADD CONSTRAINT unique_phone_per_country UNIQUE (country_code, phone_number),
  ADD CONSTRAINT unique_email UNIQUE (email);

-- Update the handle_new_user function for the new schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    phone_number, 
    country_code,
    full_name, 
    avatar_url,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.phone IS NOT NULL THEN 
        REGEXP_REPLACE(NEW.phone, '^\+\d{1,4}', '')
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.phone IS NOT NULL THEN 
        REGEXP_REPLACE(NEW.phone, '^(\+\d{1,4}).*', '\1')
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.phone),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL -- role starts as null for role selection
  );
  RETURN NEW;
END;
$$;

-- Create RPC functions for authentication
CREATE OR REPLACE FUNCTION public.get_profile_by_user_id(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  country_code TEXT,
  phone_number TEXT,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.country_code,
    p.phone_number,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.set_user_role(user_uuid UUID, new_role TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE user_id = user_uuid;
$$;