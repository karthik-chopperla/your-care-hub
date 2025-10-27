-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Partners can view their bookings" ON partner_bookings;

-- Create proper restricted policies
-- Users can only view their own bookings
CREATE POLICY "Users can view their own bookings"
ON partner_bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Partners can only view bookings for their own services
CREATE POLICY "Partners can view bookings for their services"
ON partner_bookings
FOR SELECT
TO authenticated
USING (
  partner_id IN (
    SELECT id FROM user_info WHERE id = auth.uid() AND role = 'partner'
  )
);