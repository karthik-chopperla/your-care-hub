-- Create symptom checker history table
CREATE TABLE IF NOT EXISTS public.symptom_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  assessment JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own symptom history
CREATE POLICY "Users view own symptom history"
ON public.symptom_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own symptom history
CREATE POLICY "Users create own symptom history"
ON public.symptom_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own symptom history
CREATE POLICY "Users delete own symptom history"
ON public.symptom_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_symptom_history_user_id ON public.symptom_history(user_id);
CREATE INDEX idx_symptom_history_created_at ON public.symptom_history(created_at DESC);