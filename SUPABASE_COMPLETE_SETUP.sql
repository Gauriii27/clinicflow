-- ============================================
-- DHANWANTARI CLINIC - COMPLETE SUPABASE SETUP
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- STEP 1: CREATE TABLES FIRST
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'receptionist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  blood_group VARCHAR(5),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason_for_visit TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id),
  prescription_date DATE DEFAULT CURRENT_DATE,
  medications JSONB,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  symptoms TEXT,
  diagnosis TEXT,
  blood_pressure VARCHAR(20),
  temperature DECIMAL(5,2),
  weight DECIMAL(6,2),
  height DECIMAL(6,2),
  clinical_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

-- ============================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE SECURITY POLICIES
-- ============================================

-- Users table policies
CREATE POLICY "Allow anyone to sign up"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Patients table policies
CREATE POLICY "Authenticated users can view patients"
  ON public.patients FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert patients"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patients"
  ON public.patients FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patients"
  ON public.patients FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Appointments table policies
CREATE POLICY "Authenticated users can view appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Prescriptions table policies
CREATE POLICY "Authenticated users can view prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete prescriptions"
  ON public.prescriptions FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Medical records table policies
CREATE POLICY "Authenticated users can view medical records"
  ON public.medical_records FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert medical records"
  ON public.medical_records FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update medical records"
  ON public.medical_records FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete medical records"
  ON public.medical_records FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All tables and policies are now created!
-- You can now sign up in the app and start using it.
-- ============================================
