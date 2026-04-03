import { pgTable, serial, varchar, text, boolean, date, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Usuarios / Médicos (El núcleo del sistema SaaS)
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(), // ej: 'dr-juan-perez'
  email: varchar('email', { length: 255 }).notNull().unique(),
  full_name: varchar('full_name', { length: 100 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(), // ej: 'Neurocirujano'
  license_number: varchar('license_number', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
});

// 2. Perfil Público (Datos para la Landing)
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

// 3. Contacto y Redes
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

// 4. Portafolio de Operaciones (Lo que gestionan desde SkanMed)
export const operations = pgTable('operations', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  patient_id: integer('patient_id'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  procedure_date: date('procedure_date'),
  image_url_before: varchar('image_url_before', { length: 500 }),
  image_url_after: varchar('image_url_after', { length: 500 }),
  is_public: boolean('is_public').default(false),
  category: varchar('category', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
});

// 5. Historial Académico y Laboral
export const academicHistory = pgTable('academic_history', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').notNull().references(() => doctors.id),
  institution: varchar('institution', { length: 200 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  start_year: varchar('start_year', { length: 4 }),
  end_year: varchar('end_year', { length: 4 }),
  type: varchar('type', { length: 20 }).notNull(), // 'EDUCATION', 'WORK', 'AWARD'
});

// RELACIONES
export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  profile: one(doctorProfiles, {
    fields: [doctors.id],
    references: [doctorProfiles.doctor_id],
  }),
  contact: one(contactInfo, {
    fields: [doctors.id],
    references: [contactInfo.doctor_id],
  }),
  operations: many(operations),
  academicHistory: many(academicHistory),
}));

export const operationsRelations = relations(operations, ({ one }) => ({
  doctor: one(doctors, {
    fields: [operations.doctor_id],
    references: [doctors.id],
  }),
}));
