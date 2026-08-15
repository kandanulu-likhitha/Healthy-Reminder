-- Add HIV/AIDS disease support (for data consistency)

-- Create emergency_requests table
CREATE TABLE public.emergency_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  disease_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'high',
  assigned_doctor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can create emergency requests" 
ON public.emergency_requests 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own emergency requests" 
ON public.emergency_requests 
FOR SELECT 
USING (auth.uid() = patient_id OR public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update emergency requests" 
ON public.emergency_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'doctor'));

-- Create medicine_orders table
CREATE TABLE public.medicine_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  pharmacy_id UUID,
  disease_name TEXT NOT NULL,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can create medicine orders" 
ON public.medicine_orders 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own orders" 
ON public.medicine_orders 
FOR SELECT 
USING (auth.uid() = patient_id OR public.has_role(auth.uid(), 'pharmacy'));

CREATE POLICY "Pharmacies can update orders" 
ON public.medicine_orders 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'pharmacy'));

-- Create medicine_inventory table
CREATE TABLE public.medicine_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL,
  medicine_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2),
  low_stock_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inventory" 
ON public.medicine_inventory 
FOR SELECT 
USING (true);

CREATE POLICY "Pharmacies can manage their inventory" 
ON public.medicine_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = pharmacy_id);

CREATE POLICY "Pharmacies can update their inventory" 
ON public.medicine_inventory 
FOR UPDATE 
USING (auth.uid() = pharmacy_id);

CREATE POLICY "Pharmacies can delete their inventory" 
ON public.medicine_inventory 
FOR DELETE 
USING (auth.uid() = pharmacy_id);

-- Create patient_reminders table for persistent reminders
CREATE TABLE public.patient_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  disease_id TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  reminder_time TIME NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  ringtone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their reminders" 
ON public.patient_reminders 
FOR ALL 
USING (auth.uid() = patient_id);

-- Create consultations table for doctor-patient interaction
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  disease_name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors and patients can view their consultations" 
ON public.consultations 
FOR SELECT 
USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Doctors can create consultations" 
ON public.consultations 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update their consultations" 
ON public.consultations 
FOR UPDATE 
USING (auth.uid() = doctor_id);

-- Update triggers for updated_at columns
CREATE TRIGGER update_medicine_orders_updated_at
BEFORE UPDATE ON public.medicine_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_inventory_updated_at
BEFORE UPDATE ON public.medicine_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_reminders_updated_at
BEFORE UPDATE ON public.patient_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();