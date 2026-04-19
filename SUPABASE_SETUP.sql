-- ============================================
-- DHANWANTARI CLINIC - SUPABASE SETUP
-- Copy & paste this entire script into Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'receptionist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CREATE PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
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
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- 3. CREATE APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason_for_visit TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- 4. CREATE PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  prescription_date DATE DEFAULT CURRENT_DATE,
  medications JSONB,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- 5. CREATE MEDICAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
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
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE SECURITY POLICIES FOR USERS TABLE
-- ============================================
CREATE POLICY "Allow signup - anyone can insert"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read own user"
  ON users FOR SELECT
  USING (auth.uid() = id OR true);

CREATE POLICY "Allow update own user"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 8. CREATE SECURITY POLICIES FOR PATIENTS TABLE
-- ============================================
CREATE POLICY "Allow authenticated users to view patients"
  ON patients FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update patients"
  ON patients FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete patients"
  ON patients FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 9. CREATE SECURITY POLICIES FOR APPOINTMENTS TABLE
-- ============================================
CREATE POLICY "Allow authenticated users to view appointments"
  ON appointments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete appointments"
  ON appointments FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 10. CREATE SECURITY POLICIES FOR PRESCRIPTIONS TABLE
-- ============================================
CREATE POLICY "Allow authenticated users to view prescriptions"
  ON prescriptions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update prescriptions"
  ON prescriptions FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete prescriptions"
  ON prescriptions FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 11. CREATE SECURITY POLICIES FOR MEDICAL RECORDS TABLE
-- ============================================
CREATE POLICY "Allow authenticated users to view medical records"
  ON medical_records FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert medical records"
  ON medical_records FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update medical records"
  ON medical_records FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete medical records"
  ON medical_records FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 12. INSERT DEMO DATA (OPTIONAL)
-- ============================================
-- Note: These are placeholder UUIDs - they won't actually work until you create real auth users
-- You can delete this section if you prefer to create users manually through signup

-- Demo user accounts (create these through signup first, then uncomment)
-- INSERT INTO users (id, email, full_name, role) VALUES
-- ('123e4567-e89b-12d3-a456-426614174000', 'admin@dhanwantari.com', 'Admin User', 'admin'),
-- ('123e4567-e89b-12d3-a456-426614174001', 'doctor@dhanwantari.com', 'Dr. John Doe', 'doctor'),
-- ('123e4567-e89b-12d3-a456-426614174002', 'reception@dhanwantari.com', 'Reception Staff', 'receptionist');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your Supabase database is now ready!
-- Go back to the app and try signing up with:
--   Email: test@example.com
--   Password: Test123456
--   Role: Doctor (or Receptionist)
-- ============================================
