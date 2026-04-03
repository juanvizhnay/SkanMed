import { getRequestIp, hitFixedWindow } from './rateLimit';
import * as redis from '../auth/redis';

interface LoginProtectionOptions {
  perIpPerHourLimit?: number;
  perEmailPerHourLimit?: number;
}

interface LoginProtectionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Protect login endpoint from brute force attacks
 * Call this at the beginning of your login handler
 */
export async function protectLogin(
  request: Request,
  email: string,
  options: LoginProtectionOptions = {}
): Promise<LoginProtectionResult> {
  const {
    perIpPerHourLimit = 50,
    perEmailPerHourLimit = 15,
  } = options;

  try {
    const ip = getRequestIp(request);

    // 1. Rate limit by IP (50 attempts per hour)
    const loginIpKey = `login_attempts_ip:${ip}`;
    const ipAttempts = parseInt(await redis.get(loginIpKey) || '0', 10);

    if (ipAttempts >= perIpPerHourLimit) {
      return {
        allowed: false,
        reason: 'Demasiados intentos de inicio de sesión desde esta IP. Intenta de nuevo en 1 hora.',
      };
    }

    await redis.incr(loginIpKey);
    await redis.expire(loginIpKey, 3600); // 1 hour

    // 2. Rate limit by email (15 attempts per hour)
    const loginEmailKey = `login_attempts:${email}`;
    const emailAttempts = parseInt(await redis.get(loginEmailKey) || '0', 10);

    if (emailAttempts >= perEmailPerHourLimit) {
      return {
        allowed: false,
        reason: 'Demasiados intentos de inicio de sesión para esta cuenta. Intenta de nuevo en 1 hora o recupera tu contraseña.',
      };
    }

    await redis.incr(loginEmailKey);
    await redis.expire(loginEmailKey, 3600); // 1 hour

    return { allowed: true };
  } catch (error) {
    if (import.meta.env.DEV) console.error('Login protection error:', error);
    // Fail open
    return { allowed: true };
  }
}

/**
 * Clear login attempts for successful login
 * Call this after a successful authentication
 */
export async function clearLoginAttempts(request: Request, email: string): Promise<void> {
  try {
    const ip = getRequestIp(request);
    await redis.del(`login_attempts_ip:${ip}`);
    await redis.del(`login_attempts:${email}`);
  } catch (error) {
    if (import.meta.env.DEV) console.error('Clear attempts error:', error);
  }
}

/**
 * Record a failed login attempt
 * Already tracked by protectLogin, but useful for additional tracking
 */
export async function recordLoginFailure(request: Request, email: string): Promise<void> {
  // Currently handled by protectLogin itself
  // This function exists for future enhancements (e.g., logging to DB)
  if (import.meta.env.DEV) console.log(`Failed login: ${email}`);
}
