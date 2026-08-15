
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'doctor', 'pharmacy');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table (common fields)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create doctor_profiles table
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    specialty TEXT,
    license_number TEXT,
    hospital_affiliation TEXT,
    years_of_experience INTEGER,
    consultation_fee DECIMAL(10,2),
    available_days TEXT[],
    available_hours TEXT,
    bio TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Create pharmacy_profiles table
CREATE TABLE public.pharmacy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    pharmacy_name TEXT,
    license_number TEXT,
    operating_hours TEXT,
    delivery_available BOOLEAN DEFAULT false,
    delivery_radius_km INTEGER,
    specialties TEXT[],
    rating DECIMAL(2,1) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacy_profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for doctor_profiles
CREATE POLICY "Anyone can view doctor profiles"
ON public.doctor_profiles FOR SELECT
USING (true);

CREATE POLICY "Doctors can update their own profile"
ON public.doctor_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own profile"
ON public.doctor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pharmacy_profiles
CREATE POLICY "Anyone can view pharmacy profiles"
ON public.pharmacy_profiles FOR SELECT
USING (true);

CREATE POLICY "Pharmacies can update their own profile"
ON public.pharmacy_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Pharmacies can insert their own profile"
ON public.pharmacy_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
BEFORE UPDATE ON public.doctor_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacy_profiles_updated_at
BEFORE UPDATE ON public.pharmacy_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
