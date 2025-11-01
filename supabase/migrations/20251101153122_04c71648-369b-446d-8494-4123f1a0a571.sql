-- ============================================================================
-- COMPREHENSIVE RLS POLICY FIX FOR ALL PARTNER SERVICE TABLES
-- ============================================================================
-- This migration ensures consistent, secure RLS policies across all service tables
-- enforcing strict partner ownership and preventing FK/RLS violations
-- ============================================================================

-- 1. DROP ALL EXISTING INCONSISTENT POLICIES
-- ============================================================================

-- Gynecologists
DROP POLICY IF EXISTS "Everyone can view gynecologists" ON public.gynecologists;
DROP POLICY IF EXISTS "Partners can delete their gynecologist data" ON public.gynecologists;
DROP POLICY IF EXISTS "Partners can insert their gynecologist data" ON public.gynecologists;
DROP POLICY IF EXISTS "Partners can update their gynecologist data" ON public.gynecologists;

-- Mental Health Partners
DROP POLICY IF EXISTS "Everyone can view mental health partners" ON public.mental_health_partners;
DROP POLICY IF EXISTS "Partners can delete their mental health data" ON public.mental_health_partners;
DROP POLICY IF EXISTS "Partners can insert their mental health data" ON public.mental_health_partners;
DROP POLICY IF EXISTS "Partners can update their mental health data" ON public.mental_health_partners;

-- Fitness Partners
DROP POLICY IF EXISTS "Everyone can view fitness partners" ON public.fitness_partners;
DROP POLICY IF EXISTS "Partners can delete their fitness data" ON public.fitness_partners;
DROP POLICY IF EXISTS "Partners can insert their fitness data" ON public.fitness_partners;
DROP POLICY IF EXISTS "Partners can update their fitness data" ON public.fitness_partners;

-- Home Nursing Partners
DROP POLICY IF EXISTS "Everyone can view home nursing partners" ON public.home_nursing_partners;
DROP POLICY IF EXISTS "Partners can delete their home nursing data" ON public.home_nursing_partners;
DROP POLICY IF EXISTS "Partners can insert their home nursing data" ON public.home_nursing_partners;
DROP POLICY IF EXISTS "Partners can update their home nursing data" ON public.home_nursing_partners;

-- Restaurant Partners (Diet/Food)
DROP POLICY IF EXISTS "Everyone can view restaurants" ON public.restaurant_partners;
DROP POLICY IF EXISTS "Partners can delete their restaurant data" ON public.restaurant_partners;
DROP POLICY IF EXISTS "Partners can insert their restaurant data" ON public.restaurant_partners;
DROP POLICY IF EXISTS "Partners can update their restaurant data" ON public.restaurant_partners;

-- Insurance Partners
DROP POLICY IF EXISTS "Everyone can view insurance partners" ON public.insurance_partners;
DROP POLICY IF EXISTS "Partners can delete their insurance data" ON public.insurance_partners;
DROP POLICY IF EXISTS "Partners can insert their insurance data" ON public.insurance_partners;
DROP POLICY IF EXISTS "Partners can update their insurance data" ON public.insurance_partners;

-- Ambulance Partners
DROP POLICY IF EXISTS "Everyone can view ambulance partners" ON public.ambulance_partners;
DROP POLICY IF EXISTS "Partners can delete their ambulance data" ON public.ambulance_partners;
DROP POLICY IF EXISTS "Partners can insert their ambulance data" ON public.ambulance_partners;
DROP POLICY IF EXISTS "Partners can update their ambulance data" ON public.ambulance_partners;

-- Medical Shops (inconsistent structure - needs fixing)
DROP POLICY IF EXISTS "Everyone can view medical shops" ON public.medical_shops;
DROP POLICY IF EXISTS "Partners can delete their medical shop data" ON public.medical_shops;
DROP POLICY IF EXISTS "Partners can insert their medical shop data" ON public.medical_shops;
DROP POLICY IF EXISTS "Partners can update their medical shop data" ON public.medical_shops;

-- Elder Experts (missing partner policies)
DROP POLICY IF EXISTS "Everyone can view verified elder experts" ON public.elder_experts;

-- 2. ENSURE FOREIGN KEY CONSTRAINTS ARE IN PLACE
-- ============================================================================

-- Add FK constraints if they don't exist (idempotent)
DO $$ 
BEGIN
  -- Gynecologists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gynecologists_partner_id_fkey' 
    AND table_name = 'gynecologists'
  ) THEN
    ALTER TABLE public.gynecologists 
    ADD CONSTRAINT gynecologists_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Mental Health Partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mental_health_partners_partner_id_fkey' 
    AND table_name = 'mental_health_partners'
  ) THEN
    ALTER TABLE public.mental_health_partners 
    ADD CONSTRAINT mental_health_partners_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Fitness Partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fitness_partners_partner_id_fkey' 
    AND table_name = 'fitness_partners'
  ) THEN
    ALTER TABLE public.fitness_partners 
    ADD CONSTRAINT fitness_partners_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Home Nursing Partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'home_nursing_partners_partner_id_fkey' 
    AND table_name = 'home_nursing_partners'
  ) THEN
    ALTER TABLE public.home_nursing_partners 
    ADD CONSTRAINT home_nursing_partners_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Restaurant Partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'restaurant_partners_partner_id_fkey' 
    AND table_name = 'restaurant_partners'
  ) THEN
    ALTER TABLE public.restaurant_partners 
    ADD CONSTRAINT restaurant_partners_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Insurance Partners  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'insurance_partners_partner_id_fkey' 
    AND table_name = 'insurance_partners'
  ) THEN
    ALTER TABLE public.insurance_partners 
    ADD CONSTRAINT insurance_partners_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Ambulance Partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ambulance_partners_partner_id_fkey' 
    AND table_name = 'ambulance_partners'
  ) THEN
    ALTER TABLE public.ambulance_partners 
    ADD CONSTRAINT ambulance_partners_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Medical Shops
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'medical_shops_partner_id_fkey' 
    AND table_name = 'medical_shops'
  ) THEN
    ALTER TABLE public.medical_shops 
    ADD CONSTRAINT medical_shops_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;

  -- Elder Experts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'elder_experts_partner_id_fkey' 
    AND table_name = 'elder_experts'
  ) THEN
    ALTER TABLE public.elder_experts 
    ADD CONSTRAINT elder_experts_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. CREATE CONSISTENT RLS POLICIES FOR ALL SERVICE TABLES
-- ============================================================================
-- Pattern: 
--   SELECT: Public (users need to browse services)
--   INSERT/UPDATE/DELETE: Only owner via is_partner_owner(partner_id)
-- ============================================================================

-- GYNECOLOGISTS (Doctors / Pregnancy Care)
CREATE POLICY "Public can view gynecologists"
  ON public.gynecologists
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their gynecologist profile"
  ON public.gynecologists
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their gynecologist profile"
  ON public.gynecologists
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their gynecologist profile"
  ON public.gynecologists
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- MENTAL HEALTH PARTNERS
CREATE POLICY "Public can view mental health partners"
  ON public.mental_health_partners
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their mental health profile"
  ON public.mental_health_partners
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their mental health profile"
  ON public.mental_health_partners
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their mental health profile"
  ON public.mental_health_partners
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- FITNESS PARTNERS
CREATE POLICY "Public can view fitness partners"
  ON public.fitness_partners
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their fitness profile"
  ON public.fitness_partners
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their fitness profile"
  ON public.fitness_partners
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their fitness profile"
  ON public.fitness_partners
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- HOME NURSING PARTNERS
CREATE POLICY "Public can view home nursing partners"
  ON public.home_nursing_partners
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their home nursing profile"
  ON public.home_nursing_partners
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their home nursing profile"
  ON public.home_nursing_partners
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their home nursing profile"
  ON public.home_nursing_partners
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- RESTAURANT PARTNERS (Diet / Food Providers)
CREATE POLICY "Public can view restaurant partners"
  ON public.restaurant_partners
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their restaurant profile"
  ON public.restaurant_partners
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their restaurant profile"
  ON public.restaurant_partners
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their restaurant profile"
  ON public.restaurant_partners
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- INSURANCE PARTNERS
CREATE POLICY "Public can view insurance partners"
  ON public.insurance_partners
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their insurance profile"
  ON public.insurance_partners
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their insurance profile"
  ON public.insurance_partners
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their insurance profile"
  ON public.insurance_partners
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- AMBULANCE PARTNERS
CREATE POLICY "Public can view ambulance partners"
  ON public.ambulance_partners
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their ambulance profile"
  ON public.ambulance_partners
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their ambulance profile"
  ON public.ambulance_partners
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their ambulance profile"
  ON public.ambulance_partners
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- MEDICAL SHOPS
CREATE POLICY "Public can view medical shops"
  ON public.medical_shops
  FOR SELECT
  USING (true);

CREATE POLICY "Partners can insert their medical shop profile"
  ON public.medical_shops
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their medical shop profile"
  ON public.medical_shops
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their medical shop profile"
  ON public.medical_shops
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- ELDER EXPERTS
CREATE POLICY "Public can view verified elder experts"
  ON public.elder_experts
  FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Partners can insert their elder expert profile"
  ON public.elder_experts
  FOR INSERT
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can update their elder expert profile"
  ON public.elder_experts
  FOR UPDATE
  USING (public.is_partner_owner(partner_id))
  WITH CHECK (public.is_partner_owner(partner_id));

CREATE POLICY "Partners can delete their elder expert profile"
  ON public.elder_experts
  FOR DELETE
  USING (public.is_partner_owner(partner_id));

-- 4. ADD ADMIN OVERRIDE POLICIES (for maintenance/support)
-- ============================================================================

CREATE POLICY "Admins can manage gynecologists"
  ON public.gynecologists
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage mental health partners"
  ON public.mental_health_partners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage fitness partners"
  ON public.fitness_partners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage home nursing partners"
  ON public.home_nursing_partners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage restaurant partners"
  ON public.restaurant_partners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage insurance partners"
  ON public.insurance_partners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage ambulance partners"
  ON public.ambulance_partners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage medical shops"
  ON public.medical_shops
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage elder experts"
  ON public.elder_experts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- Summary:
-- - Dropped all inconsistent RLS policies
-- - Ensured all FK constraints are in place with ON DELETE CASCADE
-- - Created uniform RLS policies across all service tables:
--   * Public SELECT (users can browse services)
--   * Owner-only INSERT/UPDATE/DELETE via is_partner_owner()
--   * Admin override policies for support/maintenance
-- - All policies use security definer functions to prevent RLS recursion
-- ============================================================================