-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Everyone can view verified doctors" ON doctors;

-- Create a view with masked sensitive information
CREATE OR REPLACE VIEW doctors_public_view AS
SELECT
  id,
  name,
  specialty,
  qualifications,
  experience_years,
  charges,
  availability,
  ratings,
  total_ratings,
  is_online_available,
  is_offline_available,
  verification_status,
  created_at,
  updated_at,
  -- Mask sensitive contact information
  CASE 
    WHEN email IS NOT NULL THEN CONCAT(LEFT(email, 2), '***@hidden.com')
    ELSE NULL
  END AS masked_email,
  CASE 
    WHEN phone_number IS NOT NULL THEN CONCAT('****', RIGHT(phone_number, 4))
    ELSE NULL
  END AS masked_phone,
  'Contact via secure messaging' AS masked_address
FROM doctors
WHERE verification_status = 'verified';

-- Grant access to the public view
GRANT SELECT ON doctors_public_view TO authenticated;
GRANT SELECT ON doctors_public_view TO anon;

-- Create secure messaging table for doctor-patient communication
CREATE TABLE IF NOT EXISTS doctor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE doctor_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
ON doctor_messages
FOR SELECT
TO authenticated
USING (
  sender_id IN (SELECT id FROM user_info WHERE id = auth.uid()) OR
  receiver_id IN (SELECT id FROM user_info WHERE id = auth.uid())
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON doctor_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id IN (SELECT id FROM user_info WHERE id = auth.uid())
);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update their messages"
ON doctor_messages
FOR UPDATE
TO authenticated
USING (
  receiver_id IN (SELECT id FROM user_info WHERE id = auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_doctor_messages_updated_at
BEFORE UPDATE ON doctor_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Authenticated users with appointments can view full doctor details
CREATE POLICY "Users with appointments can view doctor details"
ON doctors
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT doctor_id FROM appointments 
    WHERE user_id IN (SELECT id FROM user_info WHERE id = auth.uid())
  )
);