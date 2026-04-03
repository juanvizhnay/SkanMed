import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Extract domain from email address
 */
export function getEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

/**
 * List of common disposable email domains
 * This is a small subset - in production, use a comprehensive service or API
 */
const DISPOSABLE_DOMAINS = new Set([
  // Temporary email services
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'tempmail.com',
  'maildrop.cc',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'fakeinbox.com',
  'dispostable.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.de',
  'spam4.me',
  'emailondeck.com',
  'tempinbox.com',
  'mohmal.com',
  'mytemp.email',
  'mintemail.com',
  'emailfake.com',
  'inboxbear.com',
  'tmail.ws',
  'anonbox.net',
  'discard.email',
  'crazymailing.com',
  'mailnesia.com',
  'mt2015.com',
  'mygone.ml',
  'owlymail.com',
  'spambox.us',
  'tempr.email',
  'tfwno.gf',
  'vomoto.com',
  'wegwerfmail.de',
  'zeroe.ml',
]);

/**
 * Check if an email domain is from a disposable email service
 * @param domain - Email domain to check
 * @returns true if the domain is disposable
 */
export function isDisposableDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(normalized);
}

/**
 * Verify that an email domain has valid MX records
 * @param domain - Email domain to verify
 * @returns Promise resolving to true if MX records exist
 */
export async function hasValidMx(domain: string): Promise<boolean> {
  try {
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    // DNS lookup failed - domain doesn't exist or no MX records
    if (import.meta.env.DEV) console.error(`MX lookup failed: ${domain}`);
    return false;
  }
}

/**
 * Validate email format using regex
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Comprehensive email validation
 * @param email - Email to validate
 * @param options - Validation options
 * @returns Object with validation result and reason
 */
export async function validateEmail(
  email: string,
  options: {
    checkDisposable?: boolean;
    checkMx?: boolean;
  } = {}
): Promise<{ valid: boolean; reason?: string }> {
  const { checkDisposable = true, checkMx = true } = options;

  // Basic format check
  if (!isValidEmailFormat(email)) {
    return { valid: false, reason: 'Formato de email inválido' };
  }

  const domain = getEmailDomain(email);
  if (!domain) {
    return { valid: false, reason: 'Dominio de email inválido' };
  }

  // Check disposable domains
  if (checkDisposable && isDisposableDomain(domain)) {
    return { valid: false, reason: 'No se permiten dominios de correo desechables' };
  }

  // Check MX records
  if (checkMx) {
    const hasMx = await hasValidMx(domain);
    if (!hasMx) {
      return { valid: false, reason: 'El dominio de correo no tiene registros MX válidos' };
    }
  }

  return { valid: true };
}
