-- CRITICAL SECURITY FIX: Replace overly permissive user_info policy

-- Drop the dangerous "Allow all operations on user_info" policy
DROP POLICY IF EXISTS "Allow all operations on user_info" ON public.user_info;

-- Create secure user-specific policies that only allow users to access their own data
-- Users can view their own profile data
CREATE POLICY "Users can view their own profile" 
ON public.user_info 
FOR SELECT 
USING (auth.uid()::text = id::text);

-- Users can update their own profile data
CREATE POLICY "Users can update their own profile" 
ON public.user_info 
FOR UPDATE 
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can create their own profile" 
ON public.user_info 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.user_info 
FOR DELETE 
USING (auth.uid()::text = id::text);

COMMENT ON POLICY "Users can view their own profile" ON public.user_info IS 
'Restricts access to user personal data - users can only view their own information';

COMMENT ON POLICY "Users can update their own profile" ON public.user_info IS 
'Users can only update their own profile data';

COMMENT ON POLICY "Users can create their own profile" ON public.user_info IS 
'Users can only create their own profile during registration';

COMMENT ON POLICY "Users can delete their own profile" ON public.user_info IS 
'Users can only delete their own profile data';