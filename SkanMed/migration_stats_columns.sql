-- Add Hero stats columns to doctor_profiles
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS stat_years_exp VARCHAR(20);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS stat_patients VARCHAR(20);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS stat_success VARCHAR(20);

-- Add optional patient link to operations
ALTER TABLE operations ADD COLUMN IF NOT EXISTS patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_operations_patient_id ON operations(patient_id);
