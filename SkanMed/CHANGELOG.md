# Changelog

Todos los cambios notables del proyecto SkanMed serán documentados en este archivo.

## [Unreleased]

### Sistema de Subida de Imágenes con Cloudflare R2 (2026-01-28)

#### Agregado
- **Integración con Cloudflare R2:**
  - Cliente S3 compatible para subir imágenes a R2
  - Validación de archivos (tipo, tamaño máximo 5MB)
  - Nombres únicos con timestamp para evitar colisiones
  - Endpoint API `/api/upload-image` para manejar uploads

- **Componente ImageUploader (React):**
  - Preview en tiempo real de la imagen seleccionada
  - Indicador de progreso durante la subida
  - Validación client-side antes de subir
  - Opción de eliminar/cambiar imagen
  - Mensajes de error y éxito claros
  - Soporte para JPG, PNG, WebP

- **Integración en Operaciones:**
  - Reemplazado input manual de URL por uploader visual
  - Funciona en crear nueva operación y editar existente
  - Las imágenes se almacenan en R2 y se muestran públicamente

#### Archivos Nuevos
```
SkanMed/src/lib/storage/
└── r2.ts                          # Cliente R2 y utilidades

SkanMed/src/pages/api/
└── upload-image.ts                # API endpoint para subida

SkanMed/src/components/
└── ImageUploader.tsx              # Componente React de upload

SkanMed/
└── SETUP_R2.md                    # Guía completa de configuración
```

#### Modificado
- `src/pages/dashboard/operaciones/nueva.astro` - Usa ImageUploader
- `src/pages/dashboard/operaciones/[id]/editar.astro` - Usa ImageUploader
- `.env.example` - Agregadas variables R2
- `README.md` - Agregada sección de subida de imágenes
- `package.json` - Agregado @aws-sdk/client-s3

#### Técnico
- Compatible con S3 API (fácil migración a AWS/Backblaze)
- Validación robusta en cliente y servidor
- Cache control optimizado (1 año)
- Nombres únicos previenen sobrescritura
- Fail-safe: Si R2 no está configurado, informa al usuario sin romper la app

---

### Seguridad - Sistema Completo de Protección contra Abusos (2026-01-28)

#### Agregado
- **Sistema de Rate Limiting:**
  - Sliding window rate limiting usando Redis Sorted Sets
  - Fixed window rate limiting para límites simples
  - Sistema de cooldowns para penalizar comportamiento abusivo

- **Protección de Registro (`/register`):**
  - Límite de 3 cuentas por IP por día
  - Límite de 3 cuentas por dispositivo por día
  - Límite de 1 intento por email por minuto
  - Bloqueo de dominios de correo desechables (30+ dominios)
  - Verificación de registros MX del dominio de email
  - Cooldown de 15 minutos después de violar límites
  - Fingerprinting de dispositivos basado en headers

- **Protección de Login (`/`):**
  - Límite de 50 intentos por IP por hora
  - Límite de 15 intentos por email por hora
  - Limpieza automática de contadores en login exitoso
  - Mensajes informativos con sugerencia de recuperación de contraseña

- **Protección de Recuperación de Contraseña:**
  - `forgot-password`: Límite de 10 solicitudes por IP por hora
  - `forgot-password`: Límite de 3 solicitudes por email por hora
  - `forgot-password`: Cooldown de 5 minutos entre solicitudes del mismo email
  - `reset-password`: Límite de 20 intentos por IP por hora
  - `reset-password`: Límite de 5 intentos por token en 10 minutos
  - Invalidación automática de tokens después de muchos intentos fallidos

- **Validación de Emails:**
  - Lista de dominios desechables bloqueados
  - Verificación de registros MX via DNS
  - Extracción y normalización de dominios de email

- **Documentación:**
  - `SECURITY.md`: Guía completa del sistema de protección
  - Actualización de `README.md` con sección de seguridad
  - Archivo de configuración centralizado en `src/lib/security/config.ts`

#### Archivos Nuevos
```
SkanMed/src/lib/security/
├── rateLimit.ts                    # Utilidades base de rate limiting
├── emailValidation.ts              # Validación de emails y dominios
├── signupProtection.ts             # Protección de registro
├── loginProtection.ts              # Protección de login
├── forgotPasswordProtection.ts     # Protección de recuperación
└── config.ts                       # Configuración centralizada

SkanMed/
├── SECURITY.md                     # Documentación completa
└── CHANGELOG.md                    # Este archivo
```

#### Modificado
- `src/lib/auth/redis.ts`: Agregados métodos de sorted sets (zAdd, zCard, zRemRangeByScore, ttl)
- `src/pages/register.astro`: Integrada protección de registro
- `src/pages/index.astro`: Integrada protección de login
- `src/pages/forgot-password.astro`: Integrada protección de solicitud de reset
- `src/pages/reset-password.astro`: Integrada protección de cambio de contraseña
- `README.md`: Agregada sección de protección contra abusos

#### Técnico
- **Estrategia Fail-Safe:** Todas las protecciones implementan "fail-open" (permiten acceso si Redis falla)
- **Performance:** Uso eficiente de Redis con TTLs automáticos
- **Escalabilidad:** Arquitectura compatible con múltiples instancias (serverless-ready)
- **Observabilidad:** Logs estructurados de intentos de alto riesgo

---

### Validaciones Frontend en Formularios (2026-01-28)

#### Agregado
- Validaciones JavaScript client-side en todos los formularios:
  - **Operaciones:** Título mínimo 5 caracteres, URL de imagen válida, fecha no futura
  - **Pacientes:** Nombre 3+ caracteres, email válido, teléfono 7+ dígitos, fecha de nacimiento no futura
  - **Configuración:** Validaciones en perfil, contacto y seguridad
  - **Login:** Email válido, contraseña 6+ caracteres
  - **Registro:** Nombre, especialidad, email, contraseña segura
  - **Reset Password:** Contraseña segura, coincidencia de confirmación

#### Modificado
- Todos los formularios de operaciones (`nueva.astro`, `editar.astro`)
- Todos los formularios de pacientes (`nuevo.astro`, `editar.astro`)
- Formulario de configuración (`configuracion.astro`) - 3 tabs
- Formularios de autenticación (`index.astro`, `register.astro`, `forgot-password.astro`, `reset-password.astro`)

---

### Mejoras UI/UX (2026-01-28)

#### Agregado
- Favicon personalizado con tema médico para SkanMed y LandingPages
- Componente `CopyButton` con feedback visual (ícono de check y texto "Copiado")
- Componente `PasswordInput` con botón de mostrar/ocultar contraseña

#### Modificado
- Dashboard: Actividad reciente ahora muestra datos reales de la base de datos
- Dashboard: Botón "Copiar URL" con mejor feedback usando componente React
- Login/Registro: Estilo de botones con color primario `#41A4D2`
- Login/Registro: Inputs de contraseña con ícono de ojo para mostrar/ocultar

---

## Notas

- Versión adaptada de las restricciones del proyecto Skanea (Express.js → Astro SSR)
- Compatible con deployment en Vercel, Netlify, y otras plataformas serverless
- Requiere Redis para funcionalidad completa (Upstash recomendado para serverless)
