import { getRequestIp, buildDeviceId, isRateLimited, hitFixedWindow, inCooldown, setCooldown } from './rateLimit';
import { getEmailDomain, isDisposableDomain, hasValidMx } from './emailValidation';
import { db } from '../db';
import { doctors } from '../schema';
import { eq } from 'drizzle-orm';
import * as redis from '../auth/redis';

interface SignupProtectionOptions {
  perIpPerDayLimit?: number;
  perDevicePerDayLimit?: number;
  perEmailPerMinuteLimit?: number;
  cooldownSeconds?: number;
  failuresBeforeCooldown?: number;
  enableMxCheck?: boolean;
  enableDisposableBlock?: boolean;
}

interface ProtectionResult {
  allowed: boolean;
  reason?: string;
  deviceId?: string;
  ip?: string;
}

/**
 * Compute risk score based on various signals
 */
async function computeRiskSignals(params: {
  ip: string;
  emailDomain: string;
  deviceId: string;
}): Promise<number> {
  const { ip, emailDomain, deviceId } = params;
  let score = 0;

  // Disposable domain heavy penalty
  if (isDisposableDomain(emailDomain)) {
    score += 3;
  }

  // Check if IP is in cooldown (past violations)
  const coolIp = await inCooldown(`signup:${ip}`);
  if (coolIp.active) {
    score += 2;
  }

  // Check if device is in cooldown
  const coolDev = await inCooldown(`signupDevice:${deviceId}`);
  if (coolDev.active) {
    score += 2;
  }

  // Check for private IP ranges (suspicious in cloud environment)
  if (/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) {
    score += 1;
  }

  return score;
}

/**
 * Protect signup endpoint from abuse
 * Call this function at the beginning of your registration handler
 */
export async function protectSignup(
  request: Request,
  email: string,
  options: SignupProtectionOptions = {}
): Promise<ProtectionResult> {
  const {
    perIpPerDayLimit = 3,
    perDevicePerDayLimit = 3,
    perEmailPerMinuteLimit = 1,
    cooldownSeconds = 15 * 60, // 15 minutes
    failuresBeforeCooldown = 5,
    enableMxCheck = true,
    enableDisposableBlock = true,
  } = options;

  try {
    const nowMs = Date.now();
    const ip = getRequestIp(request);
    const explicitDeviceId = request.headers.get('x-device-id') || undefined;
    const deviceId = buildDeviceId(request, explicitDeviceId);
    const emailDomain = getEmailDomain(email);

    // 1. Cooldown checks first (most efficient)
    const cdIp = await inCooldown(`signup:${ip}`);
    if (cdIp.active) {
      return {
        allowed: false,
        reason: `Demasiadas solicitudes desde esta IP. Intenta en ${Math.ceil(cdIp.ttl / 60)} minutos.`,
        ip,
        deviceId,
      };
    }

    const cdDev = await inCooldown(`signupDevice:${deviceId}`);
    if (cdDev.active) {
      return {
        allowed: false,
        reason: `Demasiadas solicitudes desde este dispositivo. Intenta en ${Math.ceil(cdDev.ttl / 60)} minutos.`,
        ip,
        deviceId,
      };
    }

    // 2. Sliding window: per IP per 24h
    const ipWindow = await isRateLimited(
      `signup:ip:${ip}`,
      nowMs,
      24 * 60 * 60 * 1000, // 24 hours
      perIpPerDayLimit
    );

    if (ipWindow.limited) {
      await setCooldown(`signup:${ip}`, cooldownSeconds);
      return {
        allowed: false,
        reason: `Se ha excedido el límite de creación de cuentas por IP (${perIpPerDayLimit}/día). Intenta mañana.`,
        ip,
        deviceId,
      };
    }

    // 3. Sliding window: per device per 24h
    const devWindow = await isRateLimited(
      `signup:dev:${deviceId}`,
      nowMs,
      24 * 60 * 60 * 1000,
      perDevicePerDayLimit
    );

    if (devWindow.limited) {
      await setCooldown(`signupDevice:${deviceId}`, cooldownSeconds);
      return {
        allowed: false,
        reason: `Se ha excedido el límite de creación de cuentas por dispositivo (${perDevicePerDayLimit}/día).`,
        ip,
        deviceId,
      };
    }

    // 4. Fixed window: per email per minute (only if email doesn't exist in DB)
    try {
      const existing = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1);
      if (existing.length === 0) {
        const emailMinute = await hitFixedWindow(`signup:emailMin:${email}`, 60, perEmailPerMinuteLimit);
        if (emailMinute.limited) {
          return {
            allowed: false,
            reason: 'Demasiados intentos para este email. Intenta en 1 minuto.',
            ip,
            deviceId,
          };
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Email check error:', error);
      // Continue anyway - don't fail the whole protection
    }

    // 5. Disposable domain block
    if (enableDisposableBlock && isDisposableDomain(emailDomain)) {
      return {
        allowed: false,
        reason: 'No se permiten dominios de correo desechables. Utiliza un email válido.',
        ip,
        deviceId,
      };
    }

    // 6. MX validation
    if (enableMxCheck) {
      const mxOk = await hasValidMx(emailDomain);
      if (!mxOk) {
        return {
          allowed: false,
          reason: 'El dominio de correo no tiene registros MX válidos. Verifica tu email.',
          ip,
          deviceId,
        };
      }
    }

    // 7. Risk scoring (for future CAPTCHA integration)
    const risk = await computeRiskSignals({ ip, emailDomain, deviceId });

    // Log high-risk attempts
    if (risk >= 4) {
      if (import.meta.env.DEV) console.warn(`High-risk signup: IP ${ip}, risk ${risk}`);
    }

    // All checks passed
    return {
      allowed: true,
      ip,
      deviceId,
    };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Signup protection error:', error);
    // Fail open - allow the request but log the error
    return {
      allowed: true,
      reason: 'Protection check failed (allowing)',
    };
  }
}

/**
 * Record a failed signup attempt (for cooldown tracking)
 */
export async function recordSignupFailure(ip: string, deviceId: string): Promise<void> {
  try {
    const failCount = await redis.incr(`signup:fail:${ip}`);
    await redis.expire(`signup:fail:${ip}`, 60 * 60); // 1 hour

    // Set cooldown if too many failures
    if (failCount >= 5) {
      await setCooldown(`signup:${ip}`, 15 * 60); // 15 min cooldown
      await setCooldown(`signupDevice:${deviceId}`, 15 * 60);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('Record failure error:', error);
  }
}
