
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT DEFAULT 'okay',
  energy_level INTEGER DEFAULT 5,
  sleep_hours NUMERIC DEFAULT 7,
  water_intake INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  symptoms TEXT[] DEFAULT '{}',
  problems TEXT,
  activities TEXT,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, log_date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their daily logs"
ON public.daily_logs
FOR ALL
TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);
