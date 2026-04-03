# SkanMed Private Suite

Sistema de gestión privado para profesionales médicos. Permite administrar perfil, pacientes, operaciones y publicar casos en la Landing Page pública.

## Inicio Rápido

```bash
npm install
npm run dev
```

**Abre:** http://localhost:3000

Eso es todo. El puerto 3000 ya está configurado por defecto.

---

## Configuración (Primera vez)

### 1. Base de Datos (Neon PostgreSQL)

Ejecuta en el SQL Editor de Neon **en orden**:

1. **`../LandingPages/SkanMed_DB.sql`** - Crea las tablas base
2. **`db_auth_migration.sql`** - Agrega columnas de autenticación

### 2. Variables de Entorno (.env)

Crea un archivo `.env` (copia `.env.example` como base):

```properties
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secret_super_seguro

# Opcional - Para rate limiting
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# Opcional - Para envío de correos
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@skanmed.com

FRONTEND_URL=http://localhost:3000
```

---

## Sistema de Autenticación

- **Registro**: Los médicos se registran y reciben un correo de verificación.
- **Verificación**: Al hacer clic en el link del correo, la cuenta se activa.
- **Login**: Sesión mediante JWT almacenado en cookies (HttpOnly).
- **Recuperación**: Sistema completo de reset de contraseña por correo.

## Protección Contra Abusos

SkanMed incluye un sistema completo de protección implementado:

### Protección de Registro
- **Límite por IP:** 3 cuentas/día (ventana deslizante 24h)
- **Límite por Dispositivo:** 3 cuentas/día (fingerprint único)
- **Límite por Email:** 1 intento/minuto
- **Bloqueo de emails desechables:** Rechaza dominios temporales (30+ dominios)
- **Verificación MX:** Valida que el dominio del email exista
- **Cooldown:** 15 minutos después de exceder límites

### Protección de Login
- **Límite por IP:** 50 intentos/hora
- **Límite por Email:** 15 intentos/hora
- **Limpieza automática:** Contadores se resetean en login exitoso

### Protección de Recuperación de Contraseña
- **Forgot Password:** 10 intentos/hora por IP, 3/hora por email
- **Reset Password:** 20 intentos/hora por IP, 5 intentos/10min por token
- **Cooldown:** 5 minutos entre solicitudes del mismo email
- **Invalidación:** Token se invalida después de muchos intentos fallidos

**Documentación completa:** Ver [`SECURITY.md`](./SECURITY.md)

## Modo Demo (Sin Redis/Resend)

Si no configuras Redis o Resend, el sistema funcionará en "Modo Demo":
- Los correos se imprimirán en la consola del servidor.
- Rate limiting estará deshabilitado (fail-open).

## Subida de Imágenes

SkanMed usa **Cloudflare R2** para almacenar imágenes:
- Sin costos de descarga (perfecto para landing pages)
- ~$0.015/GB/mes de almacenamiento (100GB = $1.50/mes)
- Límite: 3MB por imagen

## Conexión con Landing Pages

Las Landing Pages (puerto 4321) y SkanMed (puerto 3000) comparten la **misma base de datos en Neon**. Cuando un médico publica una operación desde el Dashboard, automáticamente aparece en su web pública.
