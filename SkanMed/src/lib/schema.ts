import { pgTable, serial, varchar, text, boolean, date, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  full_name: varchar('full_name', { length: 100 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  license_number: varchar('license_number', { length: 50 }),
  password_reset_token: varchar('password_reset_token', { length: 255 }),
  password_reset_expires: timestamp('password_reset_expires'),
  failed_login_attempts: integer('failed_login_attempts').default(0),
  locked_until: timestamp('locked_until'),
  created_at: timestamp('created_at').defaultNow(),
});

export const doctorProfiles = pgTable('doctor_profiles', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  hero_title: varchar('hero_title', { length: 200 }),
  hero_description: text('hero_description'),
  about_bio: text('about_bio'),
  profile_picture_url: varchar('profile_picture_url', { length: 500 }),
  primary_color: varchar('primary_color', { length: 20 }).default('#0ea5e9'),
  stat_years_exp: varchar('stat_years_exp', { length: 20 }),
  stat_patients: varchar('stat_patients', { length: 20 }),
  stat_success: varchar('stat_success', { length: 20 }),
});

export const contactInfo = pgTable('contact_info', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  whatsapp_number: varchar('whatsapp_number', { length: 20 }),
  address: text('address'),
  google_maps_url: text('google_maps_url'),
  email_contact: varchar('email_contact', { length: 255 }),
  instagram_url: varchar('instagram_url', { length: 255 }),
  linkedin_url: varchar('linkedin_url', { length: 255 }),
});

export const operations = pgTable('operations', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  patient_id: integer('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  procedure_date: date('procedure_date'),
  image_url_before: varchar('image_url_before', { length: 500 }),
  image_url_after: varchar('image_url_after', { length: 500 }),
  is_public: boolean('is_public').default(false),
  category: varchar('category', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
});

export const academicHistory = pgTable('academic_history', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  institution: varchar('institution', { length: 200 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  start_date: varchar('start_date', { length: 7 }),
  end_date: varchar('end_date', { length: 7 }),
  type: varchar('type', { length: 20 }).notNull(),
});

// ── Pacientes ────────────────────────────────────────────────────────────

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  full_name: varchar('full_name', { length: 150 }).notNull(),
  document_id: varchar('document_id', { length: 50 }),
  birth_date: date('birth_date'),
  gender: varchar('gender', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  blood_type: varchar('blood_type', { length: 5 }),
  occupation: varchar('occupation', { length: 100 }),
  emergency_contact_name: varchar('emergency_contact_name', { length: 150 }),
  emergency_contact_phone: varchar('emergency_contact_phone', { length: 20 }),
  allergies: text('allergies'),
  chronic_conditions: text('chronic_conditions'),
  current_medications: text('current_medications'),
  medical_history: text('medical_history'),
  surgical_history: text('surgical_history'),
  first_consultation_date: date('first_consultation_date'),
  status: varchar('status', { length: 20 }).default('activo'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ── Consultas ────────────────────────────────────────────────────────────

export const consultations = pgTable('consultations', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  consultation_date: date('consultation_date').notNull(),
  consultation_type: varchar('consultation_type', { length: 30 }).notNull(),
  reason: text('reason'),
  symptoms: text('symptoms'),
  examination: text('examination'),
  diagnosis: text('diagnosis'),
  treatment_plan: text('treatment_plan'),
  observations: text('observations'),
  next_appointment: date('next_appointment'),
  status: varchar('status', { length: 20 }).default('completada'),
  created_at: timestamp('created_at').defaultNow(),
});

// ── Recetas ──────────────────────────────────────────────────────────────

export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  consultation_id: integer('consultation_id').notNull().references(() => consultations.id, { onDelete: 'cascade' }),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  medication_name: varchar('medication_name', { length: 200 }).notNull(),
  dosage: varchar('dosage', { length: 100 }),
  frequency: varchar('frequency', { length: 100 }),
  duration: varchar('duration', { length: 100 }),
  instructions: text('instructions'),
  created_at: timestamp('created_at').defaultNow(),
});

// ── Notas del paciente ───────────────────────────────────────────────────

export const patientNotes = pgTable('patient_notes', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content'),
  note_type: varchar('note_type', { length: 20 }).default('general'),
  is_pinned: boolean('is_pinned').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

// ── Archivos del paciente ────────────────────────────────────────────────

export const patientFiles = pgTable('patient_files', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  file_url: varchar('file_url', { length: 500 }).notNull(),
  file_type: varchar('file_type', { length: 50 }),
  description: text('description'),
  uploaded_at: timestamp('uploaded_at').defaultNow(),
});

// ── Archivos de consulta ─────────────────────────────────────────────────

export const consultationFiles = pgTable('consultation_files', {
  id: serial('id').primaryKey(),
  consultation_id: integer('consultation_id').notNull().references(() => consultations.id, { onDelete: 'cascade' }),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  file_url: varchar('file_url', { length: 500 }).notNull(),
  file_type: varchar('file_type', { length: 50 }),
  uploaded_at: timestamp('uploaded_at').defaultNow(),
});

// ── Registros pendientes (reemplaza Redis para verificación de email) ────

export const pendingRegistrations = pgTable('pending_registrations', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  hashed_password: varchar('hashed_password', { length: 255 }).notNull(),
  full_name: varchar('full_name', { length: 100 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  license_number: varchar('license_number', { length: 50 }),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// ── Rate limiting (reemplaza Redis para protección de login/registro) ────

export const rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull(),
  hits: integer('hits').notNull().default(1),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// ── RELACIONES ───────────────────────────────────────────────────────────

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  profile: one(doctorProfiles, { fields: [doctors.id], references: [doctorProfiles.doctor_id] }),
  contact: one(contactInfo, { fields: [doctors.id], references: [contactInfo.doctor_id] }),
  operations: many(operations),
  academicHistory: many(academicHistory),
  patients: many(patients),
  consultations: many(consultations),
  prescriptions: many(prescriptions),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  doctor: one(doctors, { fields: [patients.doctor_id], references: [doctors.id] }),
  consultations: many(consultations),
  notes: many(patientNotes),
  files: many(patientFiles),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, { fields: [consultations.patient_id], references: [patients.id] }),
  doctor: one(doctors, { fields: [consultations.doctor_id], references: [doctors.id] }),
  prescriptions: many(prescriptions),
  files: many(consultationFiles),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  consultation: one(consultations, { fields: [prescriptions.consultation_id], references: [consultations.id] }),
  doctor: one(doctors, { fields: [prescriptions.doctor_id], references: [doctors.id] }),
}));

export const patientNotesRelations = relations(patientNotes, ({ one }) => ({
  patient: one(patients, { fields: [patientNotes.patient_id], references: [patients.id] }),
  doctor: one(doctors, { fields: [patientNotes.doctor_id], references: [doctors.id] }),
}));

export const patientFilesRelations = relations(patientFiles, ({ one }) => ({
  patient: one(patients, { fields: [patientFiles.patient_id], references: [patients.id] }),
  doctor: one(doctors, { fields: [patientFiles.doctor_id], references: [doctors.id] }),
}));

export const consultationFilesRelations = relations(consultationFiles, ({ one }) => ({
  consultation: one(consultations, { fields: [consultationFiles.consultation_id], references: [consultations.id] }),
}));
