-- Create security definer function for service record insertion validation
-- This bypasses RLS to check partner ownership during INSERT operations
CREATE OR REPLACE FUNCTION public.can_insert_service_record(_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.partners
    WHERE id = _partner_id
      AND user_id = auth.uid()
  )
$$;

-- Update INSERT policies for all partner service tables to use security definer function
-- This ensures partners can create their own service records without RLS blocking

-- Gynecologists
DROP POLICY IF EXISTS "Partners can insert their gynecologist profile" ON public.gynecologists;
CREATE POLICY "Partners can insert their gynecologist profile"
ON public.gynecologists
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Mental Health Partners
DROP POLICY IF EXISTS "Partners can insert their mental health profile" ON public.mental_health_partners;
CREATE POLICY "Partners can insert their mental health profile"
ON public.mental_health_partners
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Fitness Partners
DROP POLICY IF EXISTS "Partners can insert their fitness profile" ON public.fitness_partners;
CREATE POLICY "Partners can insert their fitness profile"
ON public.fitness_partners
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Home Nursing Partners
DROP POLICY IF EXISTS "Partners can insert their home nursing profile" ON public.home_nursing_partners;
CREATE POLICY "Partners can insert their home nursing profile"
ON public.home_nursing_partners
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Restaurant Partners
DROP POLICY IF EXISTS "Partners can insert their restaurant profile" ON public.restaurant_partners;
CREATE POLICY "Partners can insert their restaurant profile"
ON public.restaurant_partners
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Insurance Partners
DROP POLICY IF EXISTS "Partners can insert their insurance profile" ON public.insurance_partners;
CREATE POLICY "Partners can insert their insurance profile"
ON public.insurance_partners
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Ambulance Partners
DROP POLICY IF EXISTS "Partners can insert their ambulance profile" ON public.ambulance_partners;
CREATE POLICY "Partners can insert their ambulance profile"
ON public.ambulance_partners
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Medical Shops
DROP POLICY IF EXISTS "Partners can insert their medical shop profile" ON public.medical_shops;
CREATE POLICY "Partners can insert their medical shop profile"
ON public.medical_shops
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));

-- Elder Experts
DROP POLICY IF EXISTS "Partners can insert their elder expert profile" ON public.elder_experts;
CREATE POLICY "Partners can insert their elder expert profile"
ON public.elder_experts
FOR INSERT
WITH CHECK (public.can_insert_service_record(partner_id));