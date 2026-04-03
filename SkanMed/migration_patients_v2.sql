-- ============================================================
-- Migration: Patient Clinical Data Model v2
-- Run this in your Neon SQL Editor
-- ============================================================

-- 1. Add new columns to existing patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_medications TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgical_history TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS first_consultation_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'activo';

-- 2. Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  consultation_date DATE NOT NULL,
  consultation_type VARCHAR(30) NOT NULL,
  reason TEXT,
  symptoms TEXT,
  examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  observations TEXT,
  next_appointment DATE,
  status VARCHAR(20) DEFAULT 'completada',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  medication_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Patient notes table
CREATE TABLE IF NOT EXISTS patient_notes (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  note_type VARCHAR(20) DEFAULT 'general',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Patient files table
CREATE TABLE IF NOT EXISTS patient_files (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 6. Consultation files table
CREATE TABLE IF NOT EXISTS consultation_files (
  id SERIAL PRIMARY KEY,
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON patient_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_files_consultation_id ON consultation_files(consultation_id);
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
