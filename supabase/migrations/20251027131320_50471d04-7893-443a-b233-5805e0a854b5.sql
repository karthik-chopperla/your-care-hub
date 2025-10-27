-- Fix the security definer view issue by recreating without security definer
DROP VIEW IF EXISTS doctors_public_view;

-- Create a standard view (without security definer) with masked sensitive information
CREATE VIEW doctors_public_view AS
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