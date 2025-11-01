-- Fix RLS policies for all partner tables to use auth.uid() directly
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies and recreate with correct auth check
DROP POLICY IF EXISTS "Partners can manage their restaurant data" ON restaurant_partners;
DROP POLICY IF EXISTS "Partners can manage their ambulance data" ON ambulance_partners;
DROP POLICY IF EXISTS "Partners can manage their fitness data" ON fitness_partners;
DROP POLICY IF EXISTS "Partners can manage their gynecologist data" ON gynecologists;
DROP POLICY IF EXISTS "Partners can manage their home nursing data" ON home_nursing_partners;
DROP POLICY IF EXISTS "Partners can manage their insurance data" ON insurance_partners;
DROP POLICY IF EXISTS "Partners can manage their medical shop data" ON medical_shops;
DROP POLICY IF EXISTS "Partners can manage their mental health data" ON mental_health_partners;

-- Restaurant partners
CREATE POLICY "Partners can manage their restaurant data"
ON restaurant_partners
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Ambulance partners
CREATE POLICY "Partners can manage their ambulance data"
ON ambulance_partners
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Fitness partners
CREATE POLICY "Partners can manage their fitness data"
ON fitness_partners
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Gynecologists
CREATE POLICY "Partners can manage their gynecologist data"
ON gynecologists
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Home nursing partners
CREATE POLICY "Partners can manage their home nursing data"
ON home_nursing_partners
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Insurance partners
CREATE POLICY "Partners can manage their insurance data"
ON insurance_partners
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Medical shops
CREATE POLICY "Partners can manage their medical shop data"
ON medical_shops
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Mental health partners
CREATE POLICY "Partners can manage their mental health data"
ON mental_health_partners
FOR ALL
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Fix menu items and medicine inventory RLS to work properly with the new partner policies
DROP POLICY IF EXISTS "Restaurant owners can manage menu" ON menu_items;
CREATE POLICY "Restaurant owners can manage menu"
ON menu_items
FOR ALL
USING (
  restaurant_id IN (
    SELECT id FROM restaurant_partners 
    WHERE partner_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurant_partners 
    WHERE partner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Shop owners can manage inventory" ON medicine_inventory;
CREATE POLICY "Shop owners can manage inventory"
ON medicine_inventory
FOR ALL
USING (
  shop_id IN (
    SELECT id FROM medical_shops 
    WHERE partner_id = auth.uid()
  )
)
WITH CHECK (
  shop_id IN (
    SELECT id FROM medical_shops 
    WHERE partner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Insurance partners can manage plans" ON insurance_plans;
CREATE POLICY "Insurance partners can manage plans"
ON insurance_plans
FOR ALL
USING (
  partner_id IN (
    SELECT id FROM insurance_partners 
    WHERE insurance_partners.partner_id = auth.uid()
  )
)
WITH CHECK (
  partner_id IN (
    SELECT id FROM insurance_partners 
    WHERE insurance_partners.partner_id = auth.uid()
  )
);