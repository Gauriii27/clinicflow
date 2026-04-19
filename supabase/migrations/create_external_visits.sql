-- Create the external_visits table
CREATE TABLE IF NOT EXISTS external_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on RLS for security
ALTER TABLE external_visits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage ONLY their own external visits
CREATE POLICY "Users can manage their own external visits"
ON external_visits FOR ALL TO authenticated
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);
