-- 1. Crear las tablas para SkanMed

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    hero_title VARCHAR(200),
    hero_description TEXT,
    about_bio TEXT,
    profile_picture_url VARCHAR(500),
    primary_color VARCHAR(20) DEFAULT '#0ea5e9'
);

CREATE TABLE IF NOT EXISTS contact_info (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    whatsapp_number VARCHAR(20),
    address TEXT,
    google_maps_url TEXT,
    email_contact VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS operations (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    procedure_date DATE,
    image_url_before VARCHAR(500),
    image_url_after VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_history (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    institution VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    start_year VARCHAR(4),
    end_year VARCHAR(4),
    type VARCHAR(20) NOT NULL
);

-- 2. Datos de Ejemplo (SEED) para el Dr. Padre (Neurocirujano)

-- Insertar Doctor
INSERT INTO doctors (slug, email, full_name, specialty, license_number)
VALUES ('dr-padre', 'padre@skanmed.com', 'Roberto Gómez', 'Neurocirujano', 'CMP-12345');

-- Insertar Perfil
INSERT INTO doctor_profiles (doctor_id, hero_title, hero_description, about_bio, profile_picture_url)
VALUES (
    (SELECT id FROM doctors WHERE slug = 'dr-padre'),
    'Experto en Neurocirugía Avanzada',
    'Especialista en cirugía de base de cráneo y columna vertebral mínimamente invasiva. Más de 20 años devolviendo calidad de vida.',
    'El Dr. Roberto Gómez es un referente en neurocirugía en la región. Graduado con honores y con especializaciones en Europa, dedica su práctica a resolver los casos más complejos con tecnología de punta.',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop' -- Foto de stock de doctor
);

-- Insertar Contacto
INSERT INTO contact_info (doctor_id, whatsapp_number, address, email_contact)
VALUES (
    (SELECT id FROM doctors WHERE slug = 'dr-padre'),
    '51999999999',
    'Av. Javier Prado Este 1010, Clínica San Felipe, Consultorio 505',
    'citas@drrobertogomez.com'
);

-- Insertar Operaciones (Casos de Éxito)
INSERT INTO operations (doctor_id, title, description, procedure_date, image_url_after, is_public, category)
VALUES 
(
    (SELECT id FROM doctors WHERE slug = 'dr-padre'),
    'Resección de Tumor Cerebral',
    'Extracción exitosa de meningioma frontal izquierdo sin secuelas neurológicas. Paciente de alta en 48 horas.',
    '2025-01-15',
    'https://images.unsplash.com/photo-1579684385180-1ea55f6196e0?q=80&w=2070&auto=format&fit=crop',
    TRUE,
    'Cerebro'
),
(
    (SELECT id FROM doctors WHERE slug = 'dr-padre'),
    'Microcirugía de Hernia Discal',
    'Liberación de raíz nerviosa L4-L5 mediante técnica mínimamente invasiva.',
    '2025-01-20',
    'https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?q=80&w=2070&auto=format&fit=crop',
    TRUE,
    'Columna'
);
