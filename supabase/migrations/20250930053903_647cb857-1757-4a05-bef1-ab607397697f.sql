-- Create medicine_reminders table
CREATE TABLE public.medicine_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  reminder_times TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_reminder TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own reminders
CREATE POLICY "Users can manage their own medicine reminders" 
ON public.medicine_reminders 
FOR ALL 
USING (user_id IN (SELECT user_info.id FROM user_info));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medicine_reminders_updated_at
BEFORE UPDATE ON public.medicine_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();