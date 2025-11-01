-- Fix insurance_partners table schema to match application code expectations
DROP TABLE IF EXISTS public.insurance_partners CASCADE;

CREATE TABLE public.insurance_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  agent_name text NOT NULL,
  email text,
  phone_number text,
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  city text,
  state text,
  license_number text,
  insurance_types text[] DEFAULT '{}',
  coverage_details jsonb,
  ratings numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_partners ENABLE ROW LEVEL SECURITY;

-- Public can view insurance partners
CREATE POLICY "Public can view insurance partners"
ON public.insurance_partners
FOR SELECT
TO authenticated
USING (true);

-- Partners can insert their insurance profile with inline ownership check
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

-- Partners can update their insurance profile
CREATE POLICY "Partners can update their insurance profile"
ON public.insurance_partners
FOR UPDATE
TO authenticated
USING (is_partner_owner(partner_id))
WITH CHECK (is_partner_owner(partner_id));

-- Partners can delete their insurance profile
CREATE POLICY "Partners can delete their insurance profile"
ON public.insurance_partners
FOR DELETE
TO authenticated
USING (is_partner_owner(partner_id));

-- Admins can manage all insurance partners
CREATE POLICY "Admins can manage insurance partners"
ON public.insurance_partners
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));