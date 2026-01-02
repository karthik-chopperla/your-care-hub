-- Add driver info columns to sos_events for displaying ambulance details to user
ALTER TABLE public.sos_events 
ADD COLUMN IF NOT EXISTS driver_name TEXT,
ADD COLUMN IF NOT EXISTS driver_phone TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS symptoms TEXT;