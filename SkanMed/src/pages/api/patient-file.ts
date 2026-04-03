import type { APIRoute } from 'astro';
import { getCurrentDoctor } from '../../lib/auth/session';
import { db } from '../../lib/db';
import { patientFiles, patients } from '../../lib/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const doctor = await getCurrentDoctor(cookies);
    if (!doctor) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const { patient_id, file_name, file_url, file_type, description } = body;

    if (!patient_id || !file_name || !file_url) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify the patient belongs to this doctor
    const patientCheck = await db.select().from(patients)
      .where(and(eq(patients.id, patient_id), eq(patients.doctor_id, doctor.id)))
      .limit(1);

    if (!patientCheck.length) {
      return new Response(JSON.stringify({ error: 'Paciente no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    await db.insert(patientFiles).values({
      patient_id,
      doctor_id: doctor.id,
      file_name,
      file_url,
      file_type: file_type || null,
      description: description || null,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('Patient file save error:', error);
    return new Response(JSON.stringify({ error: 'Error al guardar archivo' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
