-- Create security definer function to check partner ownership
CREATE OR REPLACE FUNCTION public.is_partner_owner(_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.partners
    WHERE id = _partner_id
      AND user_id = auth.uid()
  )
$$;

-- Create function to get partner_id for current user
CREATE OR REPLACE FUNCTION public.get_user_partner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.partners WHERE user_id = auth.uid() LIMIT 1
$$;

-- Update RLS policies for all service tables using security definer functions

-- Gynecologists (doctors/pregnancy care)
DROP POLICY IF EXISTS "Everyone can view gynecologists" ON public.gynecologists;
DROP POLICY IF EXISTS "Partners can manage their gynecologist data" ON public.gynecologists;

CREATE POLICY "Everyone can view gynecologists"
ON public.gynecologists
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their gynecologist data"
ON public.gynecologists
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their gynecologist data"
ON public.gynecologists
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their gynecologist data"
ON public.gynecologists
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Mental Health Partners
DROP POLICY IF EXISTS "Everyone can view mental health partners" ON public.mental_health_partners;
DROP POLICY IF EXISTS "Partners can manage their mental health data" ON public.mental_health_partners;

CREATE POLICY "Everyone can view mental health partners"
ON public.mental_health_partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their mental health data"
ON public.mental_health_partners
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their mental health data"
ON public.mental_health_partners
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their mental health data"
ON public.mental_health_partners
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Fitness Partners
DROP POLICY IF EXISTS "Everyone can view fitness partners" ON public.fitness_partners;
DROP POLICY IF EXISTS "Partners can manage their fitness data" ON public.fitness_partners;

CREATE POLICY "Everyone can view fitness partners"
ON public.fitness_partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their fitness data"
ON public.fitness_partners
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their fitness data"
ON public.fitness_partners
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their fitness data"
ON public.fitness_partners
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Home Nursing Partners
DROP POLICY IF EXISTS "Everyone can view home nursing partners" ON public.home_nursing_partners;
DROP POLICY IF EXISTS "Partners can manage their home nursing data" ON public.home_nursing_partners;

CREATE POLICY "Everyone can view home nursing partners"
ON public.home_nursing_partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their home nursing data"
ON public.home_nursing_partners
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their home nursing data"
ON public.home_nursing_partners
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their home nursing data"
ON public.home_nursing_partners
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Restaurant Partners (dietitian/food provider)
DROP POLICY IF EXISTS "Everyone can view restaurants" ON public.restaurant_partners;
DROP POLICY IF EXISTS "Partners can manage their restaurant data" ON public.restaurant_partners;

CREATE POLICY "Everyone can view restaurants"
ON public.restaurant_partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their restaurant data"
ON public.restaurant_partners
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their restaurant data"
ON public.restaurant_partners
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their restaurant data"
ON public.restaurant_partners
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Insurance Partners
DROP POLICY IF EXISTS "Everyone can view insurance partners" ON public.insurance_partners;
DROP POLICY IF EXISTS "Partners can manage their insurance data" ON public.insurance_partners;

CREATE POLICY "Everyone can view insurance partners"
ON public.insurance_partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their insurance data"
ON public.insurance_partners
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their insurance data"
ON public.insurance_partners
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their insurance data"
ON public.insurance_partners
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Ambulance Partners
DROP POLICY IF EXISTS "Everyone can view ambulance partners" ON public.ambulance_partners;
DROP POLICY IF EXISTS "Partners can manage their ambulance data" ON public.ambulance_partners;

CREATE POLICY "Everyone can view ambulance partners"
ON public.ambulance_partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their ambulance data"
ON public.ambulance_partners
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their ambulance data"
ON public.ambulance_partners
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their ambulance data"
ON public.ambulance_partners
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));

-- Medical Shops
DROP POLICY IF EXISTS "Everyone can view medical shops" ON public.medical_shops;
DROP POLICY IF EXISTS "Partners can manage their medical shop data" ON public.medical_shops;

CREATE POLICY "Everyone can view medical shops"
ON public.medical_shops
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Partners can insert their medical shop data"
ON public.medical_shops
FOR INSERT
TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their medical shop data"
ON public.medical_shops
FOR UPDATE
TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their medical shop data"
ON public.medical_shops
FOR DELETE
TO authenticated
USING (public.is_partner_owner(partner_id));