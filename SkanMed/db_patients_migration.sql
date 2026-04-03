-- Ejecutar en Neon SQL Editor para crear tabla de pacientes

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  document_id VARCHAR(50),
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  blood_type VARCHAR(5),
  allergies TEXT,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por doctor
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
