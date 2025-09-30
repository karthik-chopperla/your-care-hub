-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualifications TEXT,
  charges DECIMAL(10,2),
  availability JSONB DEFAULT '{}',
  ratings DECIMAL(3,2) DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_docs TEXT,
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create elder_experts table
CREATE TABLE public.elder_experts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience_years INTEGER,
  traditional_medicine_type TEXT CHECK (traditional_medicine_type IN ('ayurveda', 'homeopathy', 'traditional')),
  charges DECIMAL(10,2),
  availability JSONB DEFAULT '{}',
  ratings DECIMAL(3,2) DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create symptom_assessments table
CREATE TABLE public.symptom_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  ai_response JSONB NOT NULL,
  triage_level TEXT NOT NULL CHECK (triage_level IN ('LOW', 'MEDIUM', 'HIGH')),
  recommended_action TEXT NOT NULL,
  suggested_specialties TEXT[],
  home_remedies TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicine_reminders table
CREATE TABLE public.medicine_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  reminder_times TIME[],
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  elder_expert_id UUID REFERENCES public.elder_experts(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('online', 'offline', 'elder_consultation')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  prescription_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_doctor_or_elder CHECK (
    (doctor_id IS NOT NULL AND elder_expert_id IS NULL) OR 
    (doctor_id IS NULL AND elder_expert_id IS NOT NULL)
  )
);

-- Enable RLS on all tables
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elder_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctors
CREATE POLICY "Doctors can view their own profile" 
ON public.doctors FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" 
ON public.doctors FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view verified doctors" 
ON public.doctors FOR SELECT 
USING (verification_status = 'verified');

-- RLS policies for elder_experts
CREATE POLICY "Elder experts can view their own profile" 
ON public.elder_experts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Elder experts can update their own profile" 
ON public.elder_experts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view verified elder experts" 
ON public.elder_experts FOR SELECT 
USING (verification_status = 'verified');

-- RLS policies for symptom_assessments
CREATE POLICY "Users can view their own assessments" 
ON public.symptom_assessments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.symptom_assessments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for medicine_reminders
CREATE POLICY "Users can manage their own reminders" 
ON public.medicine_reminders FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for appointments
CREATE POLICY "Users can view their own appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for medicines (public read access)
CREATE POLICY "Everyone can view medicines" 
ON public.medicines FOR SELECT 
USING (true);

-- Add triggers for timestamp updates
CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_elder_experts_updated_at
BEFORE UPDATE ON public.elder_experts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_reminders_updated_at
BEFORE UPDATE ON public.medicine_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();