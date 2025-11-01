-- Create master partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on partners table
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- RLS policies for partners table
CREATE POLICY "Users can view their own partner record"
ON public.partners
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own partner record"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own partner record"
ON public.partners
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for all service-specific tables to reference partners table

-- Gynecologists (doctors/pregnancy care)
DROP POLICY IF EXISTS "Partners can manage their gynecologist data" ON public.gynecologists;
CREATE POLICY "Partners can manage their gynecologist data"
ON public.gynecologists
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Mental Health Partners
DROP POLICY IF EXISTS "Partners can manage their mental health data" ON public.mental_health_partners;
CREATE POLICY "Partners can manage their mental health data"
ON public.mental_health_partners
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Fitness Partners
DROP POLICY IF EXISTS "Partners can manage their fitness data" ON public.fitness_partners;
CREATE POLICY "Partners can manage their fitness data"
ON public.fitness_partners
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Home Nursing Partners
DROP POLICY IF EXISTS "Partners can manage their home nursing data" ON public.home_nursing_partners;
CREATE POLICY "Partners can manage their home nursing data"
ON public.home_nursing_partners
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Restaurant Partners (dietitian/food provider)
DROP POLICY IF EXISTS "Partners can manage their restaurant data" ON public.restaurant_partners;
CREATE POLICY "Partners can manage their restaurant data"
ON public.restaurant_partners
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Insurance Partners
DROP POLICY IF EXISTS "Partners can manage their insurance data" ON public.insurance_partners;
CREATE POLICY "Partners can manage their insurance data"
ON public.insurance_partners
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Ambulance Partners
DROP POLICY IF EXISTS "Partners can manage their ambulance data" ON public.ambulance_partners;
CREATE POLICY "Partners can manage their ambulance data"
ON public.ambulance_partners
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Medical Shops
DROP POLICY IF EXISTS "Partners can manage their medical shop data" ON public.medical_shops;
CREATE POLICY "Partners can manage their medical shop data"
ON public.medical_shops
FOR ALL
TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();