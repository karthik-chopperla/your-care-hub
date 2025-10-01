-- Fix RLS policies to allow system data insertion for doctors and hospitals
-- These tables need INSERT policies for initial data setup

-- Add INSERT policy for doctors (for system/admin data setup)
CREATE POLICY "System can insert doctors"
ON public.doctors
FOR INSERT
WITH CHECK (true);

-- Add INSERT policy for hospitals (for system/admin data setup)
CREATE POLICY "System can insert hospitals"
ON public.hospitals
FOR INSERT
WITH CHECK (true);

-- Update doctors to allow updates
CREATE POLICY "System can update doctors"
ON public.doctors
FOR UPDATE
USING (true);

-- Update hospitals to allow updates
CREATE POLICY "System can update hospitals"
ON public.hospitals
FOR UPDATE
USING (true);