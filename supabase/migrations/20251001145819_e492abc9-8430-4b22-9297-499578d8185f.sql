-- Create enum for partner service types
CREATE TYPE partner_service_type AS ENUM (
  'hospital',
  'gynecologist',
  'mental_health',
  'home_nursing',
  'ambulance',
  'medical_shop',
  'restaurant',
  'fitness',
  'insurance',
  'elder_advice'
);

-- Gynecologists table
CREATE TABLE public.gynecologists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  city TEXT,
  state TEXT,
  consultation_fee NUMERIC,
  specialization TEXT[],
  experience_years INTEGER,
  maternity_packages JSONB DEFAULT '[]'::jsonb,
  available_slots JSONB DEFAULT '[]'::jsonb,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mental Health Partners table
CREATE TABLE public.mental_health_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  city TEXT,
  state TEXT,
  consultation_fee NUMERIC,
  therapy_types TEXT[],
  specialization TEXT[],
  experience_years INTEGER,
  session_duration INTEGER DEFAULT 60,
  available_slots JSONB DEFAULT '[]'::jsonb,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Home Nursing Partners table
CREATE TABLE public.home_nursing_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  city TEXT,
  state TEXT,
  services_offered TEXT[],
  available_nurses INTEGER DEFAULT 0,
  pricing JSONB DEFAULT '{}'::jsonb,
  service_radius INTEGER DEFAULT 10,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ambulance Partners table
CREATE TABLE public.ambulance_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  license_number TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  city TEXT,
  state TEXT,
  vehicle_type TEXT,
  equipment_available TEXT[],
  service_radius INTEGER DEFAULT 50,
  is_available BOOLEAN DEFAULT true,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medical Shops table
CREATE TABLE public.medical_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  license_number TEXT,
  operating_hours JSONB,
  delivery_available BOOLEAN DEFAULT false,
  delivery_radius INTEGER DEFAULT 5,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medicine Inventory table
CREATE TABLE public.medicine_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES medical_shops(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Restaurant/Food Provider Partners table
CREATE TABLE public.restaurant_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  cuisine_types TEXT[],
  diet_plans JSONB DEFAULT '[]'::jsonb,
  operating_hours JSONB,
  delivery_available BOOLEAN DEFAULT true,
  delivery_radius INTEGER DEFAULT 10,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Menu Items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurant_partners(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  diet_type TEXT[],
  calories INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fitness Trainers/Gym Partners table
CREATE TABLE public.fitness_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gym_name TEXT,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  certifications TEXT[],
  specializations TEXT[],
  experience_years INTEGER,
  session_types TEXT[],
  pricing JSONB DEFAULT '{}'::jsonb,
  available_slots JSONB DEFAULT '[]'::jsonb,
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insurance Partners table
CREATE TABLE public.insurance_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  location JSONB NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  license_number TEXT,
  insurance_types TEXT[],
  ratings NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insurance Plans table
CREATE TABLE public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES insurance_partners(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  coverage_amount NUMERIC,
  premium_monthly NUMERIC,
  coverage_details JSONB,
  eligibility_criteria TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update elder_experts to match new structure if needed
ALTER TABLE public.elder_experts ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE;
ALTER TABLE public.elder_experts ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE public.elder_experts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.elder_experts ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.elder_experts ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Bookings table for all partner services
CREATE TABLE public.partner_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  partner_type partner_service_type NOT NULL,
  partner_id UUID NOT NULL,
  booking_type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  details JSONB DEFAULT '{}'::jsonb,
  payment_amount NUMERIC,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partner notifications table
CREATE TABLE public.partner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES user_info(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  booking_id UUID REFERENCES partner_bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gynecologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_nursing_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view partner services
CREATE POLICY "Everyone can view gynecologists" ON public.gynecologists FOR SELECT USING (true);
CREATE POLICY "Partners can manage their gynecologist data" ON public.gynecologists FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view mental health partners" ON public.mental_health_partners FOR SELECT USING (true);
CREATE POLICY "Partners can manage their mental health data" ON public.mental_health_partners FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view home nursing partners" ON public.home_nursing_partners FOR SELECT USING (true);
CREATE POLICY "Partners can manage their home nursing data" ON public.home_nursing_partners FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view ambulance partners" ON public.ambulance_partners FOR SELECT USING (true);
CREATE POLICY "Partners can manage their ambulance data" ON public.ambulance_partners FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view medical shops" ON public.medical_shops FOR SELECT USING (true);
CREATE POLICY "Partners can manage their medical shop data" ON public.medical_shops FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view medicine inventory" ON public.medicine_inventory FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage inventory" ON public.medicine_inventory FOR ALL USING (shop_id IN (SELECT id FROM medical_shops WHERE partner_id IN (SELECT id FROM user_info)));

CREATE POLICY "Everyone can view restaurants" ON public.restaurant_partners FOR SELECT USING (true);
CREATE POLICY "Partners can manage their restaurant data" ON public.restaurant_partners FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Restaurant owners can manage menu" ON public.menu_items FOR ALL USING (restaurant_id IN (SELECT id FROM restaurant_partners WHERE partner_id IN (SELECT id FROM user_info)));

CREATE POLICY "Everyone can view fitness partners" ON public.fitness_partners FOR SELECT USING (true);
CREATE POLICY "Partners can manage their fitness data" ON public.fitness_partners FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view insurance partners" ON public.insurance_partners FOR SELECT USING (true);
CREATE POLICY "Partners can manage their insurance data" ON public.insurance_partners FOR ALL USING (partner_id IN (SELECT id FROM user_info));

CREATE POLICY "Everyone can view insurance plans" ON public.insurance_plans FOR SELECT USING (true);
CREATE POLICY "Insurance partners can manage plans" ON public.insurance_plans FOR ALL USING (partner_id IN (SELECT id FROM insurance_partners WHERE partner_id IN (SELECT id FROM user_info)));

CREATE POLICY "Users can view their bookings" ON public.partner_bookings FOR SELECT USING (user_id IN (SELECT id FROM user_info));
CREATE POLICY "Users can create bookings" ON public.partner_bookings FOR INSERT WITH CHECK (user_id IN (SELECT id FROM user_info));
CREATE POLICY "Partners can view their bookings" ON public.partner_bookings FOR SELECT USING (true);
CREATE POLICY "Partners can update their bookings" ON public.partner_bookings FOR UPDATE USING (true);

CREATE POLICY "Partners can view their notifications" ON public.partner_notifications FOR SELECT USING (partner_id IN (SELECT id FROM user_info));
CREATE POLICY "Partners can update their notifications" ON public.partner_notifications FOR UPDATE USING (partner_id IN (SELECT id FROM user_info));

-- Create updated_at triggers
CREATE TRIGGER update_gynecologists_updated_at BEFORE UPDATE ON public.gynecologists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mental_health_partners_updated_at BEFORE UPDATE ON public.mental_health_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_home_nursing_partners_updated_at BEFORE UPDATE ON public.home_nursing_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambulance_partners_updated_at BEFORE UPDATE ON public.ambulance_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_shops_updated_at BEFORE UPDATE ON public.medical_shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_inventory_updated_at BEFORE UPDATE ON public.medicine_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_partners_updated_at BEFORE UPDATE ON public.restaurant_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fitness_partners_updated_at BEFORE UPDATE ON public.fitness_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_partners_updated_at BEFORE UPDATE ON public.insurance_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_plans_updated_at BEFORE UPDATE ON public.insurance_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_bookings_updated_at BEFORE UPDATE ON public.partner_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all partner tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.gynecologists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mental_health_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.home_nursing_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_shops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fitness_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_notifications;