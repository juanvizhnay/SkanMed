import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || import.meta.env.RESEND_FROM_EMAIL || 'noreply@skanmed.com';
const FRONTEND_URL = process.env.FRONTEND_URL || import.meta.env.FRONTEND_URL || 'http://localhost:3000';

let resend: Resend | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export async function sendVerificationEmail(email: string, token: string) {
  if (!resend) {
    if (import.meta.env.DEV) {
      console.log(`[DEV] Verification link: ${FRONTEND_URL}/verify-email?token=${token}`);
    }
    return;
  }

  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verifica tu cuenta en SkanMed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Bienvenido a SkanMed</h2>
          <p>Para activar tu cuenta profesional, haz clic en el siguiente enlace:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Verificar mi cuenta
          </a>
          <p style="color: #666; font-size: 14px;">Este enlace es valido por 24 horas.</p>
          <p style="color: #666; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
        </div>
      `
    });
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('Email send error:', error.message);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    if (import.meta.env.DEV) {
      console.log(`[DEV] Reset link: ${FRONTEND_URL}/reset-password?token=${token}`);
    }
    return;
  }

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Recupera tu contraseña - SkanMed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Recuperar Contraseña</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Cambiar mi contraseña
          </a>
          <p style="color: #666; font-size: 14px;">Este enlace es valido por 1 hora.</p>
          <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `
    });
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('Reset email error:', error.message);
  }
}
