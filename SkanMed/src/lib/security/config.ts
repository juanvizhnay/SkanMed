/**
 * Configuración de límites de seguridad para SkanMed
 *
 * Puedes personalizar estos valores según las necesidades de tu aplicación.
 * Los valores por defecto están optimizados para prevenir abusos sin afectar usuarios legítimos.
 */

export const SECURITY_CONFIG = {
  /**
   * PROTECCIÓN DE REGISTRO
   */
  signup: {
    // Máximo de cuentas que se pueden crear desde la misma IP en 24 horas
    perIpPerDayLimit: 3,

    // Máximo de cuentas que se pueden crear desde el mismo dispositivo en 24 horas
    perDevicePerDayLimit: 3,

    // Máximo de intentos de registro con el mismo email por minuto
    perEmailPerMinuteLimit: 1,

    // Duración del cooldown (en segundos) después de exceder límites
    cooldownSeconds: 15 * 60, // 15 minutos

    // Número de fallos antes de aplicar cooldown
    failuresBeforeCooldown: 5,

    // Habilitar verificación de registros MX del dominio de email
    enableMxCheck: true,

    // Bloquear dominios de correo desechables (mailinator, temp-mail, etc.)
    enableDisposableBlock: true,
  },

  /**
   * PROTECCIÓN DE LOGIN
   */
  login: {
    // Máximo de intentos de login desde la misma IP por hora
    perIpPerHourLimit: 50,

    // Máximo de intentos de login para el mismo email por hora
    perEmailPerHourLimit: 15,
  },

  /**
   * PROTECCIÓN DE RECUPERACIÓN DE CONTRASEÑA
   */
  forgotPassword: {
    // Máximo de solicitudes de recuperación desde la misma IP por hora
    perIpPerHourLimit: 10,

    // Máximo de solicitudes de recuperación para el mismo email por hora
    perEmailPerHourLimit: 3,

    // Cooldown entre solicitudes del mismo email (en minutos)
    cooldownMinutes: 5,
  },

  /**
   * PROTECCIÓN DE RESET DE CONTRASEÑA
   */
  resetPassword: {
    // Máximo de intentos de reset desde la misma IP por hora
    perIpPerHourLimit: 20,

    // Máximo de intentos de reset por token en 10 minutos
    perTokenPer10MinLimit: 5,
  },
};

/**
 * Dominios de correo desechables adicionales
 * Puedes agregar más dominios aquí si detectas nuevos servicios de correo temporal
 */
export const ADDITIONAL_DISPOSABLE_DOMAINS = [
  // Agrega aquí dominios adicionales de tu región/país
  // Ejemplo: 'correo-temporal.cl'
];

/**
 * Whitelist de IPs (opcional)
 * IPs que nunca serán bloqueadas por rate limiting
 * Útil para IPs corporativas, oficinas, etc.
 */
export const IP_WHITELIST: string[] = [
  // Ejemplo: '192.168.1.100'
];

/**
 * Verificar si una IP está en la whitelist
 */
export function isWhitelisted(ip: string): boolean {
  return IP_WHITELIST.includes(ip);
}
