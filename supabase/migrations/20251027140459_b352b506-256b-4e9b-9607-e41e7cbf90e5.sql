-- Fix critical security issues: Implement proper authentication and RLS policies

-- 1. Create app_role enum for proper role management
CREATE TYPE app_role AS ENUM ('user', 'partner', 'admin');

-- 2. Create user_roles table (separate from user data to prevent privilege escalation)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create SECURITY DEFINER function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Create profiles table linked to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  country_code TEXT,
  email TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'FREE',
  service_type TEXT,
  age INTEGER,
  gender TEXT,
  medical_history TEXT,
  allergies TEXT,
  chronic_conditions TEXT,
  preferred_medicine TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
ON user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 7. RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- 8. Fix user_info RLS policies (keep table for backward compatibility but restrict access)
DROP POLICY IF EXISTS "Users can view their own data" ON user_info;
DROP POLICY IF EXISTS "Users can update their own data" ON user_info;
DROP POLICY IF EXISTS "Users can delete their own data" ON user_info;
DROP POLICY IF EXISTS "Anyone can create a profile" ON user_info;

-- Make user_info read-only for backward compatibility
CREATE POLICY "System only access"
ON user_info FOR ALL
USING (false)
WITH CHECK (false);

-- 9. Fix appointments RLS policies
DROP POLICY IF EXISTS "Users can manage their own appointments" ON appointments;

CREATE POLICY "Users view own appointments"
ON appointments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own appointments"
ON appointments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own appointments"
ON appointments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users delete own appointments"
ON appointments FOR DELETE
USING (user_id = auth.uid());

-- 10. Fix sos_events RLS policies
DROP POLICY IF EXISTS "Users can manage their own SOS events" ON sos_events;

CREATE POLICY "Users view own SOS events"
ON sos_events FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own SOS events"
ON sos_events FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own SOS events"
ON sos_events FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Ambulance partners view active SOS"
ON sos_events FOR SELECT
USING (has_role(auth.uid(), 'partner'));

-- 11. Fix medicine_reminders RLS policies
DROP POLICY IF EXISTS "Users can manage their own medicine reminders" ON medicine_reminders;

CREATE POLICY "Users view own reminders"
ON medicine_reminders FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own reminders"
ON medicine_reminders FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own reminders"
ON medicine_reminders FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users delete own reminders"
ON medicine_reminders FOR DELETE
USING (user_id = auth.uid());

-- 12. Fix doctor_messages RLS policies
DROP POLICY IF EXISTS "Users can view their own messages" ON doctor_messages;
DROP POLICY IF EXISTS "Users can send messages" ON doctor_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON doctor_messages;

CREATE POLICY "Users view messages they sent or received"
ON doctor_messages FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users send messages as themselves"
ON doctor_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Receivers can mark messages as read"
ON doctor_messages FOR UPDATE
USING (receiver_id = auth.uid());

-- 13. Fix partner_bookings RLS policies
DROP POLICY IF EXISTS "Users can create bookings" ON partner_bookings;
DROP POLICY IF EXISTS "Users can view their bookings" ON partner_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON partner_bookings;
DROP POLICY IF EXISTS "Partners can view bookings for their services" ON partner_bookings;
DROP POLICY IF EXISTS "Partners can update their bookings" ON partner_bookings;

CREATE POLICY "Users view own bookings"
ON partner_bookings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own bookings"
ON partner_bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Partners view their bookings"
ON partner_bookings FOR SELECT
USING (has_role(auth.uid(), 'partner') AND partner_id = auth.uid());

CREATE POLICY "Partners update their bookings"
ON partner_bookings FOR UPDATE
USING (has_role(auth.uid(), 'partner') AND partner_id = auth.uid());

-- 14. Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();