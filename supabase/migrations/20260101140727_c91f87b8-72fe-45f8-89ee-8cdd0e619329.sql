-- Add partner_id column to hospitals table to link hospitals to their owners
ALTER TABLE public.hospitals 
ADD COLUMN partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_hospitals_partner_id ON public.hospitals(partner_id);

-- Drop existing policies that allow all access
DROP POLICY IF EXISTS "System can insert hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "System can update hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Everyone can view hospitals" ON public.hospitals;

-- Create new RLS policies for partner-owned hospitals

-- Public can view all hospitals (for users searching)
CREATE POLICY "Public can view hospitals" 
ON public.hospitals 
FOR SELECT 
USING (true);

-- Partners can insert their own hospitals
CREATE POLICY "Partners can insert their hospitals" 
ON public.hospitals 
FOR INSERT 
WITH CHECK (
  partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
);

-- Partners can update their own hospitals
CREATE POLICY "Partners can update their hospitals" 
ON public.hospitals 
FOR UPDATE 
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Partners can delete their own hospitals
CREATE POLICY "Partners can delete their hospitals" 
ON public.hospitals 
FOR DELETE 
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Admins can manage all hospitals
CREATE POLICY "Admins can manage all hospitals" 
ON public.hospitals 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));