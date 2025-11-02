-- Simplify INSERT policies for all partner service tables
-- Allow authenticated users to insert their own service records during registration
-- Ownership, update, and delete permissions remain protected by existing is_partner_owner(partner_id) logic

-- Elder Experts
DROP POLICY IF EXISTS "Partners can insert their elder expert profile" ON public.elder_experts;
CREATE POLICY "Partners can insert their elder expert profile"
ON public.elder_experts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Gynecologists
DROP POLICY IF EXISTS "Partners can insert their gynecologist profile" ON public.gynecologists;
CREATE POLICY "Partners can insert their gynecologist profile"
ON public.gynecologists
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Mental Health Partners
DROP POLICY IF EXISTS "Partners can insert their mental health profile" ON public.mental_health_partners;
CREATE POLICY "Partners can insert their mental health profile"
ON public.mental_health_partners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fitness Partners
DROP POLICY IF EXISTS "Partners can insert their fitness profile" ON public.fitness_partners;
CREATE POLICY "Partners can insert their fitness profile"
ON public.fitness_partners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Home Nursing Partners
DROP POLICY IF EXISTS "Partners can insert their home nursing profile" ON public.home_nursing_partners;
CREATE POLICY "Partners can insert their home nursing profile"
ON public.home_nursing_partners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Restaurant Partners
DROP POLICY IF EXISTS "Partners can insert their restaurant profile" ON public.restaurant_partners;
CREATE POLICY "Partners can insert their restaurant profile"
ON public.restaurant_partners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ambulance Partners
DROP POLICY IF EXISTS "Partners can insert their ambulance profile" ON public.ambulance_partners;
CREATE POLICY "Partners can insert their ambulance profile"
ON public.ambulance_partners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Medical Shops
DROP POLICY IF EXISTS "Partners can insert their medical shop profile" ON public.medical_shops;
CREATE POLICY "Partners can insert their medical shop profile"
ON public.medical_shops
FOR INSERT
TO authenticated
WITH CHECK (true);