-- Refine RLS policies for practical partner onboarding
-- Drop and recreate INSERT policies with inline ownership checks for better performance and clarity

-- Gynecologists
DROP POLICY IF EXISTS "Partners can insert their gynecologist profile" ON public.gynecologists;
CREATE POLICY "Partners can insert their gynecologist profile"
ON public.gynecologists
FOR INSERT
TO authenticated
WITH CHECK (
  -- Inline check: partner_id must belong to the authenticated user
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = gynecologists.partner_id AND user_id = auth.uid()
  )
);

-- Mental Health Partners
DROP POLICY IF EXISTS "Partners can insert their mental health profile" ON public.mental_health_partners;
CREATE POLICY "Partners can insert their mental health profile"
ON public.mental_health_partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = mental_health_partners.partner_id AND user_id = auth.uid()
  )
);

-- Fitness Partners
DROP POLICY IF EXISTS "Partners can insert their fitness profile" ON public.fitness_partners;
CREATE POLICY "Partners can insert their fitness profile"
ON public.fitness_partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = fitness_partners.partner_id AND user_id = auth.uid()
  )
);

-- Home Nursing Partners
DROP POLICY IF EXISTS "Partners can insert their home nursing profile" ON public.home_nursing_partners;
CREATE POLICY "Partners can insert their home nursing profile"
ON public.home_nursing_partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = home_nursing_partners.partner_id AND user_id = auth.uid()
  )
);

-- Restaurant Partners
DROP POLICY IF EXISTS "Partners can insert their restaurant profile" ON public.restaurant_partners;
CREATE POLICY "Partners can insert their restaurant profile"
ON public.restaurant_partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = restaurant_partners.partner_id AND user_id = auth.uid()
  )
);

-- Insurance Partners (need to create the table first if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.insurance_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone_number text,
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  city text,
  state text,
  license_number text,
  company_types text[],
  coverage_types text[],
  ratings numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view insurance partners" ON public.insurance_partners;
CREATE POLICY "Public can view insurance partners"
ON public.insurance_partners
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Partners can insert their insurance profile" ON public.insurance_partners;
CREATE POLICY "Partners can insert their insurance profile"
ON public.insurance_partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = insurance_partners.partner_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Partners can update their insurance profile" ON public.insurance_partners;
CREATE POLICY "Partners can update their insurance profile"
ON public.insurance_partners
FOR UPDATE
TO authenticated
USING (is_partner_owner(partner_id))
WITH CHECK (is_partner_owner(partner_id));

DROP POLICY IF EXISTS "Partners can delete their insurance profile" ON public.insurance_partners;
CREATE POLICY "Partners can delete their insurance profile"
ON public.insurance_partners
FOR DELETE
TO authenticated
USING (is_partner_owner(partner_id));

DROP POLICY IF EXISTS "Admins can manage insurance partners" ON public.insurance_partners;
CREATE POLICY "Admins can manage insurance partners"
ON public.insurance_partners
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ambulance Partners
DROP POLICY IF EXISTS "Partners can insert their ambulance profile" ON public.ambulance_partners;
CREATE POLICY "Partners can insert their ambulance profile"
ON public.ambulance_partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = ambulance_partners.partner_id AND user_id = auth.uid()
  )
);

-- Medical Shops
DROP POLICY IF EXISTS "Partners can insert their medical shop profile" ON public.medical_shops;
CREATE POLICY "Partners can insert their medical shop profile"
ON public.medical_shops
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = medical_shops.partner_id AND user_id = auth.uid()
  )
);

-- Elder Experts
DROP POLICY IF EXISTS "Partners can insert their elder expert profile" ON public.elder_experts;
CREATE POLICY "Partners can insert their elder expert profile"
ON public.elder_experts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = elder_experts.partner_id AND user_id = auth.uid()
  )
);