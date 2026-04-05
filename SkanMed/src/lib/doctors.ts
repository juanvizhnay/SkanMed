import { db } from './db';
import { doctors, doctorProfiles, contactInfo, operations, academicHistory } from './schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get doctor by slug with optional related data
 */
export async function getDoctorBySlug(slug: string) {
  const result = await db.select().from(doctors).where(eq(doctors.slug, slug)).limit(1);
  return result[0] || null;
}

/**
 * Get doctor with profile and contact info (parallelized)
 */
export async function getDoctorWithDetails(doctorId: number) {
  const [profileResult, contactResult] = await Promise.all([
    db.select().from(doctorProfiles).where(eq(doctorProfiles.doctor_id, doctorId)).limit(1),
    db.select().from(contactInfo).where(eq(contactInfo.doctor_id, doctorId)).limit(1),
  ]);

  return {
    profile: profileResult[0] || null,
    contact: contactResult[0] || null,
  };
}

/**
 * Get public operations for a doctor
 */
export async function getPublicOperations(doctorId: number) {
  return db.select().from(operations).where(
    and(eq(operations.doctor_id, doctorId), eq(operations.is_public, true))
  );
}

/**
 * Get academic history for a doctor
 */
export async function getAcademicHistory(doctorId: number) {
  return db.select().from(academicHistory).where(eq(academicHistory.doctor_id, doctorId));
}
