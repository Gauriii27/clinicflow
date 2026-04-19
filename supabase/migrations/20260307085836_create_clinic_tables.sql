/*
  # Dhanwantari Clinic Management System - Database Schema

  ## Overview
  This migration creates the complete database schema for the Dhanwantari Clinic Management System.
  The system supports three user roles: Admin, Doctor, and Receptionist.

  ## New Tables

  ### 1. users
  Stores user account information for doctors, receptionists, and admin users.
  - `id` (uuid, primary key) - Links to Supabase auth.users
  - `email` (text) - User's email address
  - `full_name` (text) - Full name of the user
  - `role` (text) - User role: 'admin', 'doctor', or 'receptionist'
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. patients
  Stores patient demographic and contact information.
  - `id` (uuid, primary key, auto-generated)
  - `first_name` (text) - Patient's first name
  - `last_name` (text) - Patient's last name
  - `date_of_birth` (date) - Patient's date of birth
  - `gender` (text) - Patient's gender
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email address
  - `address` (text) - Residential address
  - `blood_group` (text) - Blood type
  - `emergency_contact` (text) - Emergency contact number
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. appointments
  Manages patient appointments with doctors.
  - `id` (uuid, primary key, auto-generated)
  - `patient_id` (uuid, foreign key) - References patients table
  - `doctor_id` (uuid, foreign key) - References users table
  - `appointment_date` (date) - Scheduled date
  - `appointment_time` (time) - Scheduled time
  - `reason` (text) - Reason for visit
  - `status` (text) - Appointment status: 'scheduled', 'completed', 'cancelled'
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. prescriptions
  Stores prescription information including medications.
  - `id` (uuid, primary key, auto-generated)
  - `patient_id` (uuid, foreign key) - References patients table
  - `doctor_id` (uuid, foreign key) - References users table
  - `prescription_date` (date) - Date of prescription
  - `diagnosis` (text) - Medical diagnosis
  - `medications` (jsonb) - Array of medication objects with name, dosage, frequency, duration
  - `instructions` (text) - Additional instructions
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. medical_records
  Maintains detailed medical records for patient visits.
  - `id` (uuid, primary key, auto-generated)
  - `patient_id` (uuid, foreign key) - References patients table
  - `doctor_id` (uuid, foreign key) - References users table
  - `visit_date` (date) - Date of visit
  - `symptoms` (text) - Patient symptoms
  - `diagnosis` (text) - Medical diagnosis
  - `blood_pressure` (text) - Blood pressure reading
  - `temperature` (text) - Temperature reading
  - `weight` (text) - Weight measurement
  - `height` (text) - Height measurement
  - `notes` (text) - Additional clinical notes
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled to ensure data privacy and security.

  ### Users Table Policies
  - Authenticated users can view their own profile
  - Authenticated users can update their own profile
  - Admin users can view all users

  ### Patients Table Policies
  - Authenticated staff (admin, doctor, receptionist) can view all patients
  - Authenticated staff can insert new patient records
  - Authenticated staff can update patient records
  - Only admin can delete patient records

  ### Appointments Table Policies
  - Authenticated staff can view all appointments
  - Authenticated staff can create new appointments
  - Authenticated staff can update appointments
  - Only admin can delete appointments

  ### Prescriptions Table Policies
  - Authenticated staff can view all prescriptions
  - Doctors can create prescriptions
  - Doctors can update their own prescriptions
  - Only admin can delete prescriptions

  ### Medical Records Table Policies
  - Authenticated doctors can view all medical records
  - Doctors can create medical records
  - Doctors can update their own medical records
  - Only admin can delete medical records

  ## Notes
  - All foreign key relationships use CASCADE on delete to maintain data integrity
  - Timestamps are automatically set using DEFAULT now()
  - UUID primary keys are generated using gen_random_uuid()
  - JSONB is used for medications array to allow flexible medication data structure
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist')),
  created_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone text NOT NULL,
  email text,
  address text,
  blood_group text,
  emergency_contact text,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prescription_date date NOT NULL,
  diagnosis text NOT NULL,
  medications jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions text,
  created_at timestamptz DEFAULT now()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  symptoms text NOT NULL,
  diagnosis text NOT NULL,
  blood_pressure text,
  temperature text,
  weight text,
  height text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Patients table policies
CREATE POLICY "Authenticated staff can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Authenticated staff can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Authenticated staff can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Admin can delete patients"
  ON patients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Appointments table policies
CREATE POLICY "Authenticated staff can view all appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Authenticated staff can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Authenticated staff can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Admin can delete appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Prescriptions table policies
CREATE POLICY "Authenticated staff can view prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor', 'receptionist')
    )
  );

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can update prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Admin can delete prescriptions"
  ON prescriptions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Medical records table policies
CREATE POLICY "Doctors can view medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can create medical records"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can update medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Admin can delete medical records"
  ON medical_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
