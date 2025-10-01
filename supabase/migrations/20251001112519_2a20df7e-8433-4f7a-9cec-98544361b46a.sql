-- Add service_type column to user_info table for partner types
ALTER TABLE public.user_info 
ADD COLUMN service_type text;

-- Add check constraint for valid service types
ALTER TABLE public.user_info
ADD CONSTRAINT valid_service_type CHECK (
  service_type IS NULL OR 
  service_type IN (
    'hospital',
    'elder_expert',
    'doctor',
    'ambulance',
    'pharmacist',
    'price_comparison',
    'dietitian',
    'mental_health',
    'pregnancy_care',
    'fitness',
    'insurance'
  )
);