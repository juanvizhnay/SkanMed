import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { db } from '../../../lib/db';
import { operations, doctorProfiles, patientFiles, consultationFiles } from '../../../lib/schema';
import { eq, or } from 'drizzle-orm';
import type { APIRoute } from 'astro';

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
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const filename = params.filename;

    if (!filename) {
      return new Response('Archivo no especificado', { status: 400 });
    }

    if (!r2Client || !R2_BUCKET_NAME) {
      return new Response('R2 no configurado', { status: 503 });
    }

    // The URL stored in DB is like /api/image/operations/private/xxx.png
    const imageUrl = `/api/image/${filename}`;

    // 1. Check if it's a profile picture (always publicly accessible)
    const profileCheck = await db
      .select()
      .from(doctorProfiles)
      .where(eq(doctorProfiles.profile_picture_url, imageUrl))
      .limit(1);

    if (profileCheck.length > 0) {
      // Profile pictures are always served (public for landing pages)
    } else {
      // 2. Check if it's an operation image (public only)
      const operationCheck = await db
        .select()
        .from(operations)
        .where(
          or(
            eq(operations.image_url_before, imageUrl),
            eq(operations.image_url_after, imageUrl)
          )
        )
        .limit(1);

      if (operationCheck.length > 0) {
        if (!operationCheck[0].is_public) {
          return new Response('No autorizado', { status: 404 });
        }
      } else {
        // 3. Check if it's a patient file (always accessible to authenticated doctor via session)
        const patientFileCheck = await db
          .select()
          .from(patientFiles)
          .where(eq(patientFiles.file_url, imageUrl))
          .limit(1);

        if (patientFileCheck.length === 0) {
          // 4. Check consultation files
          const consultFileCheck = await db
            .select()
            .from(consultationFiles)
            .where(eq(consultationFiles.file_url, imageUrl))
            .limit(1);

          if (consultFileCheck.length === 0) {
            return new Response('No autorizado', { status: 404 });
          }
        }
      }
    }

    // Fetch image from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename, // e.g. "operations/private/1770839467700-k93o14kzhyl.png"
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new Response('Imagen no encontrada', { status: 404 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const imageBuffer = Buffer.concat(chunks);

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    if (import.meta.env.DEV) console.error('Image proxy error:', error);
    return new Response('Error al cargar imagen', { status: 500 });
  }
};
