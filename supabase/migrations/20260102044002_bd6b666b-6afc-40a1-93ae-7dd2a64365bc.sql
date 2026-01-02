-- Create emergency_contacts table for users to add family members
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  notify_on_sos BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own emergency contacts
CREATE POLICY "Users can view their own emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own emergency contacts"
ON public.emergency_contacts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own emergency contacts"
ON public.emergency_contacts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own emergency contacts"
ON public.emergency_contacts FOR DELETE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add ambulance_location column to sos_events for real-time tracking
ALTER TABLE public.sos_events 
ADD COLUMN ambulance_location JSONB DEFAULT NULL;

-- Enable realtime for sos_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_events;

-- Add RLS policy for partners to update SOS events they've accepted
CREATE POLICY "Partners can update accepted SOS events"
ON public.sos_events FOR UPDATE
USING (has_role(auth.uid(), 'partner'::app_role))
WITH CHECK (has_role(auth.uid(), 'partner'::app_role));