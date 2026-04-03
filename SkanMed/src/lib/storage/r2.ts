import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuración de R2 (compatible con S3)
const R2_ACCOUNT_ID = import.meta.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.R2_BUCKET_NAME;

let r2Client: S3Client | null = null;

if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  if (import.meta.env.DEV) console.log('R2 Storage configured');
}

/**
 * Sube un archivo a R2 y devuelve la URL pública
 * @param file - ArrayBuffer del archivo
 * @param fileName - Nombre del archivo
 * @param contentType - MIME type del archivo
 * @param isPublic - Si la imagen será pública (default: false)
 * @returns URL pública del archivo subido
 */
export async function uploadToR2(
  file: ArrayBuffer,
  fileName: string,
  contentType: string,
  isPublic: boolean = false
): Promise<string> {
  if (!r2Client || !R2_BUCKET_NAME) {
    throw new Error('R2 Storage no está configurado. Por favor configura las variables de entorno.');
  }

  // Generar nombre único para el archivo
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop();

  // Carpetas separadas según visibilidad
  const folder = isPublic ? 'operations/public' : 'operations/private';
  const uniqueFileName = `${folder}/${timestamp}-${randomString}.${extension}`;

  try {
    // Subir archivo a R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: Buffer.from(file),
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // Cache 1 año
    });

    await r2Client.send(command);

    // Construir URL del proxy (NO la URL directa de R2)
    // El proxy verificará is_public antes de servir la imagen
    const proxyUrl = `/api/image/${uniqueFileName}`;

    if (import.meta.env.DEV) console.log(`Uploaded: ${uniqueFileName}`);
    return proxyUrl;
  } catch (error) {
    if (import.meta.env.DEV) console.error('R2 upload error:', error);
    throw new Error('Error al subir la imagen. Por favor intenta de nuevo.');
  }
}

/**
 * Verifica si R2 está configurado y disponible
 */
export function isR2Available(): boolean {
  return r2Client !== null && !!R2_BUCKET_NAME;
}

/**
 * Valida que el archivo sea una imagen y su tamaño
 * @param file - Archivo a validar
 * @param maxSizeMB - Tamaño máximo en MB (default: 3MB - más estricto para optimización)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 3
): { valid: boolean; error?: string } {
  // Verificar que sea una imagen
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se permiten imágenes (JPG, PNG, WebP, AVIF)',
    };
  }

  // Verificar tamaño (más estricto para forzar optimización)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `La imagen no debe superar ${maxSizeMB}MB. Por favor, optimiza la imagen antes de subir.`,
    };
  }

  return { valid: true };
}

