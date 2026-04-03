import { getRequestIp, hitFixedWindow, inCooldown, setCooldown } from './rateLimit';
import * as redis from '../auth/redis';

interface ForgotPasswordProtectionOptions {
  perIpPerHourLimit?: number;
  perEmailPerHourLimit?: number;
  cooldownMinutes?: number;
}

interface ForgotPasswordProtectionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Protect forgot-password endpoint from spam and abuse
 * Prevents attackers from flooding users with password reset emails
 */
export async function protectForgotPassword(
  request: Request,
  email: string,
  options: ForgotPasswordProtectionOptions = {}
): Promise<ForgotPasswordProtectionResult> {
  const {
    perIpPerHourLimit = 10,
    perEmailPerHourLimit = 3,
    cooldownMinutes = 5,
  } = options;

  try {
    const ip = getRequestIp(request);

    // 1. Check cooldown (prevents rapid successive requests)
    const cdKey = `forgot:cooldown:${email}`;
    const cooldown = await inCooldown(cdKey);
    if (cooldown.active) {
      return {
        allowed: false,
        reason: `Ya se envió un enlace de recuperación recientemente. Intenta en ${Math.ceil(cooldown.ttl / 60)} minutos.`,
      };
    }

    // 2. Rate limit by IP (10 requests per hour)
    const ipWindow = await hitFixedWindow(
      `forgot:ip:${ip}`,
      3600, // 1 hour
      perIpPerHourLimit
    );

    if (ipWindow.limited) {
      return {
        allowed: false,
        reason: 'Demasiadas solicitudes de recuperación desde esta IP. Intenta en 1 hora.',
      };
    }

    // 3. Rate limit by email (3 requests per hour)
    const emailWindow = await hitFixedWindow(
      `forgot:email:${email}`,
      3600,
      perEmailPerHourLimit
    );

    if (emailWindow.limited) {
      return {
        allowed: false,
        reason: 'Demasiadas solicitudes de recuperación para esta cuenta. Intenta en 1 hora.',
      };
    }

    // Set cooldown for this email to prevent rapid requests
    await setCooldown(cdKey, cooldownMinutes * 60);

    return { allowed: true };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Forgot password protection error:', error);
    // Fail open
    return { allowed: true };
  }
}

/**
 * Protect reset-password endpoint from brute force attacks
 */
export async function protectResetPassword(
  request: Request,
  token: string
): Promise<ForgotPasswordProtectionResult> {
  try {
    const ip = getRequestIp(request);

    // Limit reset attempts per IP (prevents token guessing)
    const ipWindow = await hitFixedWindow(
      `reset:ip:${ip}`,
      3600, // 1 hour
      20 // 20 attempts per hour
    );

    if (ipWindow.limited) {
      return {
        allowed: false,
        reason: 'Demasiados intentos de restablecimiento desde esta IP. Intenta en 1 hora.',
      };
    }

    // Limit reset attempts per token (prevents brute force on a specific token)
    const tokenWindow = await hitFixedWindow(
      `reset:token:${token}`,
      600, // 10 minutes
      5 // 5 attempts per 10 minutes
    );

    if (tokenWindow.limited) {
      // Optionally invalidate the token after too many failed attempts
      await redis.del(`reset:${token}`);
      return {
        allowed: false,
        reason: 'Demasiados intentos fallidos. Solicita un nuevo enlace de recuperación.',
      };
    }

    return { allowed: true };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Reset password protection error:', error);
    return { allowed: true };
  }
}
