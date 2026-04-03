-- ============================================================
-- SEED: Datos de prueba para SkanMed
-- Ejecutar en Neon SQL Editor
-- ============================================================

-- Primero: eliminar el doctor fantasma "dr-padre" y todos sus datos
DELETE FROM prescriptions WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM consultation_files WHERE consultation_id IN (SELECT id FROM consultations WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre'));
DELETE FROM consultations WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM patient_notes WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM patient_files WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM operations WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM patients WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM academic_history WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM contact_info WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM doctor_profiles WHERE doctor_id = (SELECT id FROM doctors WHERE slug = 'dr-padre');
DELETE FROM doctors WHERE slug = 'dr-padre';

-- Limpiar datos previos de Dr. Pablo (para re-ejecutar sin duplicados)
DELETE FROM prescriptions WHERE doctor_id = 2;
DELETE FROM consultation_files WHERE consultation_id IN (SELECT id FROM consultations WHERE doctor_id = 2);
DELETE FROM consultations WHERE doctor_id = 2;
DELETE FROM patient_notes WHERE doctor_id = 2;
DELETE FROM patient_files WHERE doctor_id = 2;
DELETE FROM operations WHERE doctor_id = 2;
DELETE FROM patients WHERE doctor_id = 2;
DELETE FROM academic_history WHERE doctor_id = 2;

-- Perfil
UPDATE doctor_profiles SET
  hero_title = 'Neurocirujano Especialista en Columna Vertebral',
  hero_description = 'Mas de 20 anos de experiencia en neurocirugia de alta complejidad. Formado en las mejores instituciones de America Latina y Europa.',
  about_bio = 'Medico neurocirujano egresado de la Universidad Central con subespecialidad en cirugia de columna vertebral por la Universidad de Barcelona. He dedicado mi carrera al tratamiento quirurgico de patologias complejas del sistema nervioso central y periferico, con enfasis en tecnicas minimamente invasivas.',
  stat_years_exp = '+20',
  stat_patients = '3.2k+',
  stat_success = '97%'
WHERE doctor_id = 2;

INSERT INTO doctor_profiles (doctor_id, hero_title, hero_description, about_bio, stat_years_exp, stat_patients, stat_success)
SELECT 2, 'Neurocirujano Especialista en Columna Vertebral',
  'Mas de 20 anos de experiencia en neurocirugia de alta complejidad.',
  'Medico neurocirujano dedicado al tratamiento de patologias complejas del sistema nervioso.',
  '+20', '3.2k+', '97%'
WHERE NOT EXISTS (SELECT 1 FROM doctor_profiles WHERE doctor_id = 2);

-- Contacto
INSERT INTO contact_info (doctor_id, whatsapp_number, address, google_maps_url, email_contact)
SELECT 2, '+58 412-555-9999', 'Clinica Santa Sofia, Piso 5, Consultorio 502, Caracas', 'https://maps.google.com/?q=10.4880,-66.8792', 'consultas@skanmed.com'
WHERE NOT EXISTS (SELECT 1 FROM contact_info WHERE doctor_id = 2);

-- Historial academico
INSERT INTO academic_history (doctor_id, institution, title, start_year, end_year, type) VALUES
  (2, 'Universidad Central de Venezuela', 'Medico Cirujano', '1998', '2004', 'EDUCATION'),
  (2, 'Hospital Universitario de Caracas', 'Residencia en Neurocirugia', '2004', '2009', 'EDUCATION'),
  (2, 'Universidad de Barcelona', 'Fellowship en Cirugia de Columna', '2009', '2011', 'EDUCATION'),
  (2, 'Instituto Neurologico de Colombia', 'Curso Avanzado en Neuronavegacion', '2012', '2012', 'EDUCATION'),
  (2, 'Hospital Universitario de Caracas', 'Neurocirujano de Planta', '2011', '2018', 'WORK'),
  (2, 'Clinica Santa Sofia', 'Jefe del Servicio de Neurocirugia', '2018', '2025', 'WORK'),
  (2, 'Sociedad Latinoamericana de Neurocirugia', 'Premio al Mejor Trabajo de Investigacion', '2016', '2016', 'AWARD'),
  (2, 'Congreso Mundial de Cirugia de Columna', 'Ponente Internacional', '2019', '2019', 'AWARD');

-- Pacientes
INSERT INTO patients (id, doctor_id, full_name, document_id, birth_date, gender, phone, email, blood_type, occupation, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions, current_medications, medical_history, surgical_history, first_consultation_date, status) VALUES
  (101, 2, 'Maria Elena Rodriguez',  'V-18456789', '1975-03-15', 'Femenino',  '+58 412-555-0101', 'maria.rodriguez@email.com', 'O+',  'Contadora',             'Carlos Rodriguez', '+58 412-555-0102', 'Penicilina',       'Hipertension arterial controlada',      'Losartan 50mg, Aspirina 100mg',                       'Hipertension desde 2015.',                                                          'Colecistectomia laparoscopica 2018',    '2024-06-10', 'activo'),
  (102, 2, 'Jose Antonio Mendez',    'V-12345678', '1962-11-22', 'Masculino', '+58 414-555-0203', 'jose.mendez@email.com',     'A+',  'Ingeniero Civil',       'Ana Mendez',       '+58 414-555-0204', 'Ninguna conocida', 'Diabetes Tipo 2, Hernia discal L4-L5',  'Metformina 850mg c/12h, Pregabalina 75mg',            'Diabetes 2010. Dolor lumbar cronico desde 2020.',                                   'Ninguna previa',                        '2024-03-05', 'activo'),
  (103, 2, 'Carmen Lucia Herrera',   'V-20789012', '1988-07-04', 'Femenino',  '+58 416-555-0305', 'carmen.herrera@email.com',  'B+',  'Abogada',               'Pedro Herrera',    '+58 416-555-0306', 'Sulfonamidas',     'Migranas cronicas',                     'Topiramato 50mg diario',                              'Migranas desde los 16 anos. 3-4 episodios/mes.',                                   'Ninguna',                               '2025-01-15', 'activo'),
  (104, 2, 'Roberto Carlos Diaz',    'V-15678901', '1970-01-30', 'Masculino', '+58 424-555-0407', 'roberto.diaz@email.com',    'AB+', 'Comerciante',           'Luisa Diaz',       '+58 424-555-0408', 'Ninguna conocida', 'Estenosis espinal lumbar',              'Ibuprofeno PRN, Gabapentina 300mg c/8h',              'Estenosis espinal 2023. Claudicacion neurogenica.',                                 'Apendicectomia 1995, Artroscopia 2015', '2024-09-20', 'activo'),
  (105, 2, 'Ana Patricia Gomez',     'V-22111333', '1995-09-12', 'Femenino',  '+58 412-555-0509', 'ana.gomez@email.com',       'O-',  'Profesora',             'Miguel Gomez',     '+58 412-555-0510', 'AINES',            'Sindrome del tunel carpiano bilateral',  'Complejo B, Diclofenac gel',                          'Parestesias en manos desde hace 1 ano. EMG confirma STC bilateral.',                'Ninguna',                               '2025-05-10', 'activo'),
  (106, 2, 'Luis Fernando Paredes',  'V-10222444', '1958-04-18', 'Masculino', '+58 414-555-0611', 'luis.paredes@email.com',    'A-',  'Profesor universitario', 'Maria Paredes',   '+58 414-555-0612', 'Cefalosporinas',   'Tumor cerebral (meningioma frontal)',    'Dexametasona 4mg c/12h, Levetiracetam 500mg c/12h',  'Meningioma frontal izquierdo diagnosticado nov 2024 tras convulsion. 3.2cm.',        'Hernioplastia inguinal 2005',           '2024-11-28', 'activo'),
  (107, 2, 'Sofia Martinez Blanco',  'V-25333555', '2001-12-05', 'Femenino',  '+58 416-555-0713', 'sofia.martinez@email.com',  'B-',  'Estudiante',            'Elena Blanco',     '+58 416-555-0714', 'Ninguna conocida', 'Malformacion de Arnold-Chiari tipo I',   'Acetaminofen PRN',                                    'Cefalea occipital y mareos. RMN: descenso amigdalar 8mm. Siringomielia C3-C6.',     'Ninguna',                               '2025-08-02', 'activo'),
  (108, 2, 'Pedro Alejandro Rivas',  'V-16444666', '1978-06-25', 'Masculino', '+58 424-555-0815', 'pedro.rivas@email.com',     'O+',  'Mecanico industrial',   'Laura Rivas',      '+58 424-555-0816', 'Morfina',          'Hernia discal cervical C5-C6',           'Analgesicos PRN',                                     'Accidente laboral 2024. Cervicalgia con radiculopatia C6 derecha.',                 'Fractura de clavicula 2010',            '2024-07-15', 'alta');

-- Reiniciar secuencia de pacientes
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- Operaciones (usando IDs fijos de pacientes)
INSERT INTO operations (doctor_id, patient_id, title, description, procedure_date, is_public, category) VALUES
  (2, 102, 'Microdiscectomia L4-L5',            'Microdiscectomia lumbar minimamente invasiva. Hernia posterolateral derecha. Radiculopatia L5 refractaria 6 meses. Sin complicaciones. Alta 24h.',  '2025-01-20', true,  'Columna'),
  (2, 104, 'Laminectomia descompresiva L3-L5',  'Laminectomia multinivel. Estenosis espinal severa. Ampliacion del canal con preservacion de facetas. Mejoria inmediata.',                          '2025-03-10', true,  'Columna'),
  (2, 106, 'Reseccion de meningioma frontal',    'Craneotomia frontal izquierda. Reseccion Simpson grado I. Tumor 3.2cm. Sin deficit neurologico. AP: meningioma grado I OMS.',                     '2025-02-14', true,  'Cerebro'),
  (2, 108, 'Discectomia cervical C5-C6 + ACDF',  'Discectomia cervical anterior con artrodesis. Cage PEEK con injerto oseo. Placa anterior. Radiculopatia resuelta.',                               '2024-10-05', true,  'Columna'),
  (2, 105, 'Liberacion tunel carpiano derecho',  'Liberacion endoscopica. Nervio mediano con aplanamiento severo. Ambulatorio bajo anestesia local.',                                                '2025-07-15', true,  'Nervios Perifericos'),
  (2, NULL, 'Drenaje hematoma epidural agudo',   'Craneotomia temporal de emergencia. Hematoma epidural postraumatico. Evacuacion completa. Evolucion favorable.',                                   '2025-04-22', true,  'Trauma'),
  (2, 107, 'Descompresion fosa posterior Chiari','Descompresion suboccipital con laminectomia C1 y duroplastia. Chiari tipo I con siringomielia. Mejoria de cefalea.',                                '2025-09-18', false, 'Cerebro'),
  (2, 101, 'Bloqueo facetario lumbar L4-L5',     'Bloqueo L4-L5 y L5-S1 bilateral bajo fluoroscopia. Alivio significativo del dolor lumbar mecanico.',                                               '2024-08-12', false, 'Columna');

-- Consultas (usando IDs fijos)
INSERT INTO consultations (id, patient_id, doctor_id, consultation_date, consultation_type, reason, symptoms, examination, diagnosis, treatment_plan, observations, next_appointment, status) VALUES
  (201, 101, 2, '2024-06-10', 'primera_vez',
   'Dolor lumbar cronico con irradiacion a pierna izquierda',
   'Lumbalgia 3 meses con irradiacion a miembro inferior izquierdo. EVA 6/10.',
   'Lasegue positivo 45 grados izquierdo. Reflejos conservados. Fuerza 5/5.',
   'Lumbalgia mecanica. Descartar hernia discal.',
   'RMN lumbar. Fisioterapia 10 sesiones. Pregabalina 75mg noche.',
   'Paciente ansiosa. Se explica plan.', '2024-07-08', 'completada'),

  (202, 101, 2, '2024-07-08', 'seguimiento',
   'Control con RMN lumbar',
   'Mejoria parcial con fisioterapia. EVA 4/10.',
   'RMN: Protusion discal L5-S1 sin compromiso radicular. Lasegue negativo.',
   'Protusion discal L5-S1. Lumbalgia mecanica.',
   'Continuar fisioterapia. Ejercicios de Williams. Ergonomia laboral.',
   'Buena evolucion. No requiere cirugia.', '2024-09-02', 'completada'),

  (203, 102, 2, '2024-03-05', 'primera_vez',
   'Dolor lumbar severo con ciatica derecha',
   'Lumbalgia 6 meses con irradiacion a pierna derecha. EVA 8/10.',
   'Lasegue positivo 30 grados. Hiporreflexia aquilea. Debilidad dorsiflexion 4/5.',
   'Hernia discal L4-L5 con radiculopatia L5 derecha',
   'RMN urgente. Bloqueo epidural. Pregabalina 150mg c/12h.',
   'Deficit neurologico. Priorizar RMN.', '2024-04-02', 'completada'),

  (204, 102, 2, '2025-01-10', 'control',
   'Evaluacion prequirurgica',
   'Dolor persistente. EVA 7/10. Deficit estable.',
   'RMN confirma hernia extruida L4-L5. EMG con denervacion activa.',
   'Hernia discal L4-L5 extruida - indicacion quirurgica',
   'Programar microdiscectomia. Suspender Metformina 48h antes.',
   'Firma consentimiento. Acepta cirugia.', '2025-01-20', 'completada'),

  (205, 102, 2, '2025-02-20', 'seguimiento',
   'Control postquirurgico 1 mes',
   'Dolor ciatico resuelto. Lumbalgia leve en sitio quirurgico. EVA 2/10.',
   'Herida cicatrizada. Lasegue negativo. Fuerza 5/5 recuperada.',
   'Postoperatorio satisfactorio microdiscectomia L4-L5',
   'Rehabilitacion. Ejercicios core. Evitar >5kg por 2 meses.',
   'Excelente evolucion.', '2025-05-20', 'completada'),

  (206, 103, 2, '2025-01-15', 'primera_vez',
   'Migranas refractarias',
   'Migranas desde adolescencia, 3-4/mes, 24-72h. Aura visual 30%. No responde a triptanes.',
   'Examen neurologico normal. Fundoscopia normal.',
   'Migrana con aura refractaria',
   'Topiramato 100mg/dia. Venlafaxina 75mg. Diario de cefaleas.',
   'Considerar bloqueo nervio occipital si no mejora.', '2025-03-15', 'completada'),

  (207, 104, 2, '2024-09-20', 'primera_vez',
   'Dificultad para caminar distancias largas',
   'Dolor en ambas piernas al caminar >200m. Mejora al sentarse. 2 anos evolucion.',
   'Claudicacion neurogenica. Sintomas a 180m. Extension lumbar reproduce dolor.',
   'Estenosis espinal lumbar L3-L4-L5',
   'RMN lumbar. EMG. Fisioterapia acuatica. Gabapentina 300mg c/8h.',
   'Probable candidato quirurgico.', '2024-10-20', 'completada'),

  (208, 106, 2, '2024-11-28', 'urgencia',
   'Convulsion de novo en adulto mayor',
   'Convulsion tonico-clonica 2 min. Sin antecedentes. Cefalea frontal 2 meses.',
   'Glasgow 15/15. Sin deficit focal. Edema papila izquierdo. TAC: masa frontal.',
   'Tumor cerebral frontal - probable meningioma',
   'RMN con gadolinio urgente. Dexametasona 4mg c/12h. Levetiracetam 500mg c/12h.',
   'Paciente y familia informados.', '2024-12-10', 'completada'),

  (209, 106, 2, '2025-03-14', 'seguimiento',
   'Control postquirurgico 1 mes - meningioma',
   'Sin cefalea. Sin convulsiones. Buen animo.',
   'Herida cicatrizada. Sin deficit. TAC: cavidad sin complicaciones.',
   'Postoperatorio satisfactorio reseccion meningioma Simpson I',
   'Mantener Levetiracetam 6 meses. Reducir Dexametasona. RMN en 3 meses.',
   'Biopsia: meningioma grado I. Excelente pronostico.', '2025-06-14', 'completada'),

  (210, 107, 2, '2025-08-02', 'primera_vez',
   'Cefalea occipital y mareos',
   'Cefalea occipital que empeora con Valsalva. Mareos. Parestesias en manos.',
   'Nistagmo downbeat. Hiperreflexia MMSS. Romberg positivo. RMN: Chiari + siringomielia.',
   'Malformacion de Arnold-Chiari tipo I con siringomielia cervical',
   'Programar descompresion fosa posterior. Evitar esfuerzos.',
   'Indicacion quirurgica clara por siringomielia.', '2025-09-10', 'completada');

SELECT setval('consultations_id_seq', (SELECT MAX(id) FROM consultations));

-- Recetas (usando IDs fijos de consultas)
INSERT INTO prescriptions (consultation_id, doctor_id, medication_name, dosage, frequency, duration, instructions) VALUES
  (201, 2, 'Pregabalina',      '75mg',  'Una vez al dia (noche)',     '4 semanas',              'Tomar con la cena. Puede causar somnolencia.'),
  (201, 2, 'Diclofenac',       '50mg',  'Cada 8 horas si dolor',     '10 dias',                'Tomar despues de las comidas.'),
  (203, 2, 'Pregabalina',      '150mg', 'Cada 12 horas',             '6 semanas',              'Iniciar con 75mg primera semana, luego subir.'),
  (203, 2, 'Tramadol',         '50mg',  'Cada 8 horas si dolor',     '2 semanas',              'Solo si EVA >7. No combinar con alcohol.'),
  (203, 2, 'Omeprazol',        '20mg',  'En ayunas',                 '6 semanas',              'Protector gastrico.'),
  (205, 2, 'Celecoxib',        '200mg', 'Cada 12 horas',             '2 semanas',              'Antiinflamatorio postquirurgico.'),
  (205, 2, 'Acetaminofen',     '500mg', 'Cada 6 horas si dolor',     '4 semanas',              'No exceder 4g/dia.'),
  (206, 2, 'Topiramato',       '100mg', 'Una vez al dia (noche)',     'Uso continuo',           'Aumentar 25mg/semana hasta 100mg.'),
  (206, 2, 'Venlafaxina XR',   '75mg',  'Una vez al dia (manana)',   'Uso continuo',           'No suspender abruptamente.'),
  (206, 2, 'Sumatriptan',      '50mg',  'Al inicio del episodio',    'Rescate',                'Max 2 dosis en 24h.'),
  (207, 2, 'Gabapentina',      '300mg', 'Cada 8 horas',             'Uso continuo',           'Iniciar con 300mg noche, aumentar cada 3 dias.'),
  (208, 2, 'Dexametasona',     '4mg',   'Cada 12 horas',            'Hasta cirugia',          'Tomar con alimentos. Controlar glucemia.'),
  (208, 2, 'Levetiracetam',    '500mg', 'Cada 12 horas',            'Minimo 6 meses',         'Anticonvulsivante. No suspender.'),
  (208, 2, 'Omeprazol',        '20mg',  'En ayunas',                'Mientras dure Dexametasona', 'Protector gastrico.');

-- Notas de pacientes
INSERT INTO patient_notes (patient_id, doctor_id, title, content, note_type, is_pinned) VALUES
  (102, 2, 'Riesgo quirurgico por diabetes',       'Coordinar con endocrinologia. Suspender Metformina 48h antes. Glucemia capilar cada 6h.',              'urgente',      true),
  (102, 2, 'Resultado de electromiografia',         'EMG 15/12/2024: Radiculopatia L5 derecha con denervacion activa. Confirma indicacion quirurgica.',     'seguimiento',  false),
  (106, 2, 'Resultado anatomia patologica',          'Biopsia: Meningioma meningotelial grado I OMS. Indice mitotico bajo. Pronostico favorable.',          'seguimiento',  true),
  (106, 2, 'Comite de tumores 05/12/2024',           'Consenso: cirugia primera linea. No requiere radioterapia dado grado I y reseccion completa.',        'general',      false),
  (103, 2, 'Diario de cefaleas - Febrero 2025',     'Solo 2 episodios (antes 4). Duracion promedio 18h. Mejoria con ajuste de Topiramato.',                'seguimiento',  false),
  (107, 2, 'Estudios prequirurgicos completos',     'Laboratorio, Rx torax, ECG, evaluacion cardiologica: todo normal. Apta para cirugia.',                 'urgente',      true),
  (101, 2, 'Evolucion con fisioterapia',             '10 sesiones completadas. Mejoria 60%. Puede sentarse 2h sin dolor.',                                  'seguimiento',  false),
  (104, 2, 'RMN lumbar resultado 10/10/2024',       'Estenosis central severa L3-L4 y L4-L5. Hipertrofia facetaria. Canal <10mm. Indicacion quirurgica.',  'urgente',      true);
