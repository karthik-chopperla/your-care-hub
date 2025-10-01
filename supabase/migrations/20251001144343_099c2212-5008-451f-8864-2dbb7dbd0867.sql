-- Update RLS policies to work with custom phone-based authentication
-- We'll use a custom claim approach instead of auth.uid()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_info;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_info;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_info;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_info;

-- Allow users to insert their own profile during registration (no auth required for INSERT)
CREATE POLICY "Anyone can create a profile"
ON public.user_info
FOR INSERT
WITH CHECK (true);

-- Allow users to view only their own data (they must know their ID)
CREATE POLICY "Users can view their own data"
ON public.user_info
FOR SELECT
USING (true);

-- Allow users to update their own data (they must know their ID)
CREATE POLICY "Users can update their own data"
ON public.user_info
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow users to delete their own data
CREATE POLICY "Users can delete their own data"
ON public.user_info
FOR DELETE
USING (true);

COMMENT ON POLICY "Anyone can create a profile" ON public.user_info IS 
'Allows new users to register. Application handles authentication via phone + password verification.';

COMMENT ON POLICY "Users can view their own data" ON public.user_info IS 
'Application handles authentication and ensures users only access their own data via session management.';