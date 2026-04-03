# Sistema de Protección y Restricciones de SkanMed

Este documento describe el sistema completo de protección contra abusos implementado en SkanMed.

## Tabla de Contenidos

1. [Protección de Registro](#protección-de-registro)
2. [Protección de Login](#protección-de-login)
3. [Protección de Recuperación de Contraseña](#protección-de-recuperación-de-contraseña)
4. [Arquitectura Técnica](#arquitectura-técnica)
5. [Configuración](#configuración)

---

## 1. Protección de Registro

### ¿Qué protege?
Previene que usuarios malintencionados creen múltiples cuentas falsas desde la misma IP o dispositivo.

### Límites Implementados

#### Por Dirección IP
- **Límite:** 3 cuentas por día
- **Ventana:** Sliding window de 24 horas
- **Acción:** Cooldown de 15 minutos después de exceder el límite

#### Por Dispositivo
- **Límite:** 3 cuentas por día
- **Ventana:** Sliding window de 24 horas
- **Identificación:** Fingerprint basado en User-Agent, Accept-Language y Timezone
- **Acción:** Cooldown de 15 minutos después de exceder el límite

#### 📧 Por Email
- **Límite:** 1 intento por minuto
- **Ventana:** Fixed window de 60 segundos
- **Nota:** Solo aplica si el email NO existe en la base de datos

### Validaciones Adicionales

#### Bloqueo de Emails Desechables
- **Activo por defecto:** Sí
- **Acción:** Rechaza dominios de correo temporal (mailinator.com, temp-mail.org, etc.)
- **Lista:** 30+ dominios desechables bloqueados

#### Verificación MX
- **Activo por defecto:** Sí
- **Acción:** Verifica que el dominio del email tenga registros MX válidos
- **Beneficio:** Previene typos y dominios inexistentes

### Código de Ejemplo

```typescript
// En register.astro
const protection = await protectSignup(Astro.request, formEmail);
if (!protection.allowed) {
  error = protection.reason;
  throw new Error(error);
}
```

---

## 2. Protección de Login

### ¿Qué protege?
Previene ataques de fuerza bruta para adivinar contraseñas.

### Límites Implementados

#### Por Dirección IP
- **Límite:** 50 intentos por hora
- **Ventana:** Fixed window de 3600 segundos
- **Mensaje:** "Demasiados intentos de inicio de sesión desde esta IP. Intenta de nuevo en 1 hora."

#### Por Email (Cuenta Específica)
- **Límite:** 15 intentos por hora
- **Ventana:** Fixed window de 3600 segundos
- **Mensaje:** "Demasiados intentos de inicio de sesión para esta cuenta. Intenta de nuevo en 1 hora o recupera tu contraseña."

### Comportamiento

- **Login exitoso:** Limpia automáticamente los contadores de intentos
- **Login fallido:** Incrementa contadores pero no bloquea inmediatamente
- **Bloqueo:** Solo ocurre al alcanzar el límite

### Código de Ejemplo

```typescript
// En index.astro (login)
const protection = await protectLogin(Astro.request, email);
if (!protection.allowed) {
  error = protection.reason;
  throw new Error(error);
}

const result = await loginUser(email, password);

// Limpiar intentos en login exitoso
await clearLoginAttempts(Astro.request, email);
```

---

## 3. Protección de Recuperación de Contraseña

### ¿Qué protege?
Previene spam de emails de recuperación y ataques de enumeración de usuarios.

### Límites Implementados

#### Forgot Password (Solicitar Reset)

**Por IP:**
- **Límite:** 10 solicitudes por hora
- **Ventana:** Fixed window de 3600 segundos

**Por Email:**
- **Límite:** 3 solicitudes por hora
- **Ventana:** Fixed window de 3600 segundos

**Cooldown:**
- **Duración:** 5 minutos entre solicitudes del mismo email
- **Propósito:** Evitar spam inmediato

#### Reset Password (Cambiar Contraseña)

**Por IP:**
- **Límite:** 20 intentos por hora
- **Ventana:** Fixed window de 3600 segundos

**Por Token:**
- **Límite:** 5 intentos por 10 minutos
- **Acción:** Invalida el token después de exceder el límite
- **Propósito:** Prevenir fuerza bruta sobre tokens

### Código de Ejemplo

```typescript
// En forgot-password.astro
const protection = await protectForgotPassword(Astro.request, email);
if (!protection.allowed) {
  error = protection.reason;
  throw new Error(error);
}

// En reset-password.astro
const protection = await protectResetPassword(Astro.request, token);
if (!protection.allowed) {
  error = protection.reason;
  throw new Error(error);
}
```

---

## 4. Arquitectura Técnica

### Stack Tecnológico

- **Redis:** Almacenamiento de contadores y cooldowns
- **Astro SSR:** Ejecución del lado del servidor
- **TypeScript:** Tipado fuerte para seguridad

### Estructura de Archivos

```
SkanMed/src/lib/security/
├── rateLimit.ts                    # Funciones base de rate limiting
├── emailValidation.ts              # Validación de emails y dominios
├── signupProtection.ts             # Protección específica de registro
├── loginProtection.ts              # Protección específica de login
└── forgotPasswordProtection.ts     # Protección de recuperación
```

### Tipos de Rate Limiting

#### Sliding Window (Ventana Deslizante)
- **Uso:** Límites por IP y dispositivo en registro
- **Ventaja:** Más justo, no permite bursts al inicio de ventana
- **Implementación:** Redis Sorted Sets (ZSET)

#### Fixed Window (Ventana Fija)
- **Uso:** Login, forgot-password, límites por email
- **Ventaja:** Más eficiente en recursos
- **Implementación:** Redis INCR + EXPIRE

#### Cooldown
- **Uso:** Penalización temporal después de violar límites
- **Ventaja:** Desalienta comportamiento abusivo
- **Implementación:** Redis SETEX

### Estrategias de Fail-Safe

Todas las funciones de protección implementan **"Fail Open"**:

```typescript
} catch (error) {
  console.error('Protection error:', error);
  // Fail open - no bloquear si Redis está caído
  return { allowed: true };
}
```

**Razón:** Es mejor permitir un registro legítimo que bloquear a todos los usuarios si Redis falla.

---

## 5. Configuración

### Variables de Entorno Requeridas

```bash
# Redis (obligatorio para protecciones)
REDIS_URL=rediss://default:password@host:port

# O formato alternativo
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Resend (para emails de verificación)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@skanea.net
```

### Personalización de Límites

#### Registro

```typescript
const protection = await protectSignup(Astro.request, email, {
  perIpPerDayLimit: 5,           // Default: 3
  perDevicePerDayLimit: 5,       // Default: 3
  perEmailPerMinuteLimit: 2,     // Default: 1
  cooldownSeconds: 30 * 60,      // Default: 15 min
  enableMxCheck: true,            // Default: true
  enableDisposableBlock: true,    // Default: true
});
```

#### Login

```typescript
const protection = await protectLogin(Astro.request, email, {
  perIpPerHourLimit: 100,        // Default: 50
  perEmailPerHourLimit: 20,      // Default: 15
});
```

#### Forgot Password

```typescript
const protection = await protectForgotPassword(Astro.request, email, {
  perIpPerHourLimit: 20,         // Default: 10
  perEmailPerHourLimit: 5,       // Default: 3
  cooldownMinutes: 10,            // Default: 5
});
```

---

## Monitoreo

### Redis Keys por Tipo

```bash
# Sliding window (registro)
sw:signup:ip:{ip}
sw:signup:dev:{deviceId}

# Fixed window
fw:signup:emailMin:{email}
fw:login_attempts_ip:{ip}
fw:login_attempts:{email}
fw:forgot:ip:{ip}
fw:forgot:email:{email}
fw:reset:ip:{ip}
fw:reset:token:{token}

# Cooldowns
cd:signup:{ip}
cd:signupDevice:{deviceId}
cd:forgot:cooldown:{email}

# Failures
signup:fail:{ip}
```

### Comandos Útiles de Redis

```bash
# Ver todas las keys de protección
redis-cli KEYS "sw:*"
redis-cli KEYS "fw:*"
redis-cli KEYS "cd:*"

# Ver intentos de login de una IP
redis-cli GET "fw:login_attempts_ip:123.45.67.89"

# Eliminar cooldown manualmente (admin)
redis-cli DEL "cd:signup:123.45.67.89"

# Ver TTL de una key
redis-cli TTL "cd:forgot:cooldown:user@example.com"
```

---

## Resolución de Problemas

### Usuario Bloqueado Legítimo

**Solución rápida:**
```bash
redis-cli DEL "cd:signup:USER_IP"
redis-cli DEL "fw:login_attempts_ip:USER_IP"
redis-cli DEL "fw:login_attempts:user@email.com"
```

### Redis No Disponible

- Las protecciones fallarán "open" (permitirán acceso)
- Se registrará un error en la consola
- Los usuarios legítimos no serán bloqueados
- **Recomendación:** Configurar monitoreo de Redis

### Falsos Positivos en MX Check

- Algunos dominios legítimos pueden no tener registros MX configurados correctamente
- **Solución:** Deshabilitar `enableMxCheck` temporalmente o para esos casos

```typescript
const protection = await protectSignup(Astro.request, email, {
  enableMxCheck: false
});
```

---

## Mejores Prácticas

1. **Logs:** Revisa regularmente los logs de "High-risk signup attempts"
2. **Whitelist:** Considera crear una whitelist para IPs corporativas conocidas
3. **Alertas:** Configura alertas si Redis se cae o hay picos anormales de rate limiting
4. **Actualizar Lista:** Mantén actualizada la lista de dominios desechables
5. **CAPTCHA:** Para ambientes de alto tráfico, considera agregar CAPTCHA después de cierto score de riesgo

---

## Referencias

- **Estrategia adaptada de:** Proyecto Skanea (Express.js)
- **Redis Rate Limiting:** [Redis.io - Rate Limiting](https://redis.io/docs/manual/patterns/rate-limiter/)
- **OWASP:** [Brute Force Prevention](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
