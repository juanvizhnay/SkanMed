import type { APIRoute } from 'astro';
import { uploadToR2, isR2Available, validateImageFile } from '../../lib/storage/r2';
import { getCurrentDoctor } from '../../lib/auth/session';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación
    const doctor = await getCurrentDoctor(cookies);
    if (!doctor) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que R2 esté configurado
    if (!isR2Available()) {
      return new Response(
        JSON.stringify({
          error: 'El almacenamiento de imágenes no está configurado. Por favor contacta al administrador.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el archivo del request
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No se recibió ningún archivo' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar el archivo (max 3MB - más estricto para optimización)
    const validation = validateImageFile(file, 3);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Por defecto subimos como privada (más seguro)
    // El doctor puede marcarla como pública después
    const imageUrl = await uploadToR2(arrayBuffer, file.name, file.type, false);

    return new Response(
      JSON.stringify({
        success: true,
        url: imageUrl,
        message: 'Imagen subida exitosamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    if (import.meta.env.DEV) console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Error al subir la imagen'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
