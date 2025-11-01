-- Elder Remedies (public remedies shared by experts)
CREATE TABLE public.elder_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID REFERENCES elder_experts(id) ON DELETE CASCADE NOT NULL,
  remedy_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  preparation_steps TEXT NOT NULL,
  duration TEXT NOT NULL,
  safety_notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.elder_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view verified remedies"
ON public.elder_remedies
FOR SELECT
USING (is_verified = true);

CREATE POLICY "Elders can manage their remedies"
ON public.elder_remedies
FOR ALL
USING (
  elder_id IN (
    SELECT id FROM elder_experts WHERE partner_id = auth.uid()
  )
);

-- Elder Advice Requests (private Q&A)
CREATE TABLE public.elder_advice_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  elder_id UUID REFERENCES elder_experts(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  reply TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.elder_advice_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own requests"
ON public.elder_advice_requests
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create their own requests"
ON public.elder_advice_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Elders view requests sent to them"
ON public.elder_advice_requests
FOR SELECT
USING (
  elder_id IN (
    SELECT id FROM elder_experts WHERE partner_id = auth.uid()
  )
);

CREATE POLICY "Elders update their requests"
ON public.elder_advice_requests
FOR UPDATE
USING (
  elder_id IN (
    SELECT id FROM elder_experts WHERE partner_id = auth.uid()
  )
);

-- Saved Remedies (user's saved remedies)
CREATE TABLE public.elder_saved_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  remedy_id UUID REFERENCES elder_remedies(id) ON DELETE CASCADE,
  advice_id UUID REFERENCES elder_advice_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, remedy_id),
  UNIQUE(user_id, advice_id)
);

ALTER TABLE public.elder_saved_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their saved remedies"
ON public.elder_saved_remedies
FOR ALL
USING (user_id = auth.uid());

-- Update trigger for elder_remedies
CREATE TRIGGER update_elder_remedies_updated_at
BEFORE UPDATE ON public.elder_remedies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();