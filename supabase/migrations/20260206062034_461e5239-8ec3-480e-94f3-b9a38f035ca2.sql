-- Health readings table for tracking sugar levels, BP, etc.
CREATE TABLE public.health_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  reading_type TEXT NOT NULL, -- 'blood_sugar', 'blood_pressure', 'weight', 'heart_rate'
  value NUMERIC NOT NULL,
  secondary_value NUMERIC, -- For BP: diastolic value
  unit TEXT NOT NULL, -- 'mg/dL', 'mmHg', 'kg', 'bpm'
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reminder logs for tracking taken/skipped doses
CREATE TABLE public.reminder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID NOT NULL REFERENCES public.patient_reminders(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'taken', 'skipped', 'missed', 'pending'
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  action_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medicine inventory for patients (to track their personal medicine stock)
CREATE TABLE public.patient_medicine_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  reminder_id UUID REFERENCES public.patient_reminders(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  doses_per_day INTEGER NOT NULL DEFAULT 1,
  low_stock_threshold INTEGER NOT NULL DEFAULT 7, -- days worth
  last_refill_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages between doctors and patients
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescriptions uploaded by patients or doctors
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  file_url TEXT,
  notes TEXT,
  medicines JSONB, -- Array of medicine objects
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency contacts for patients
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medicine_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Health readings policies
CREATE POLICY "Patients can manage their health readings"
ON public.health_readings FOR ALL
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient health readings"
ON public.health_readings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.consultations 
    WHERE consultations.patient_id = health_readings.patient_id 
    AND consultations.doctor_id = auth.uid()
  )
);

-- Reminder logs policies
CREATE POLICY "Patients can manage their reminder logs"
ON public.reminder_logs FOR ALL
USING (auth.uid() = patient_id);

-- Patient medicine inventory policies
CREATE POLICY "Patients can manage their medicine inventory"
ON public.patient_medicine_inventory FOR ALL
USING (auth.uid() = patient_id);

-- Chat messages policies
CREATE POLICY "Users can view their chat messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Prescriptions policies
CREATE POLICY "Patients can view their prescriptions"
ON public.prescriptions FOR SELECT
USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can upload prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can add prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role));

-- Emergency contacts policies
CREATE POLICY "Patients can manage their emergency contacts"
ON public.emergency_contacts FOR ALL
USING (auth.uid() = patient_id);

-- Triggers for updated_at
CREATE TRIGGER update_patient_medicine_inventory_updated_at
BEFORE UPDATE ON public.patient_medicine_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;