# SkanMed Platform

Plataforma SaaS para médicos que combina una landing page pública personalizada con un sistema privado de gestión clínica. Todo en un único proyecto Astro desplegado en Cloudflare Pages bajo `skanmed.net`.

---

## Arquitectura

Un solo proyecto Astro (SSR) con todas las rutas bajo el mismo dominio:

| Ruta | Descripción |
|---|---|
| `skanmed.net/` | Landing general de la plataforma |
| `skanmed.net/login` | Inicio de sesión |
| `skanmed.net/register` | Registro de nuevos médicos |
| `skanmed.net/dashboard` | Panel privado del médico |
| `skanmed.net/[slug]` | Landing pública del médico |
| `skanmed.net/[slug]/perfil` | Trayectoria profesional del médico |
| `skanmed.net/[slug]/casos` | Casos clínicos públicos del médico |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Astro (SSR) + React Islands |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL en [Neon](https://neon.tech) |
| ORM | Drizzle ORM |
| Autenticación | JWT (`jose`) + bcryptjs |
| Rate limiting / caché | PostgreSQL (tablas dedicadas) |
| Correos | [Resend](https://resend.com) |
| Almacenamiento de imágenes | Cloudflare R2 |
| Despliegue | Cloudflare Pages |

---

## Inicio Rápido (Desarrollo Local)

```bash
cd SkanMed
npm install
npm run dev
```

Abre `http://localhost:4321`

---

## Configuración Inicial

### 1. Base de Datos (Neon PostgreSQL)

1. Crea un proyecto en [console.neon.tech](https://console.neon.tech)
2. En el SQL Editor, ejecuta en orden:
   - `SkanMed/SkanMed_DB.sql` — crea todas las tablas
   - `SkanMed/db_auth_migration.sql` — agrega columnas de autenticación

### 2. Variables de Entorno

Crea `SkanMed/.env` basándote en `SkanMed/.env.example`:

```properties
# Base de datos
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Autenticación
JWT_SECRET=una_cadena_aleatoria_de_64_caracteres

# Resend (correos de verificación y recuperación)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# URL base (para links en correos)
FRONTEND_URL=http://localhost:4321

# Cloudflare R2 (subida de imágenes)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
```

---

## Estructura del Proyecto

```
SkanMed/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Landing general
│   │   ├── login.astro              # Inicio de sesión
│   │   ├── register.astro           # Registro
│   │   ├── verify-email.astro       # Verificación de correo
│   │   ├── forgot-password.astro    # Recuperación de contraseña
│   │   ├── reset-password.astro
│   │   ├── logout.astro
│   │   ├── [slug]/                  # Landing pública del médico
│   │   │   ├── index.astro
│   │   │   ├── perfil.astro
│   │   │   └── casos.astro
│   │   ├── dashboard/               # Panel privado
│   │   │   ├── index.astro          # Vista general
│   │   │   ├── configuracion.astro  # Perfil y configuración
│   │   │   ├── pacientes/           # CRUD pacientes, consultas, recetas
│   │   │   └── operaciones/         # CRUD operaciones quirúrgicas
│   │   └── api/
│   │       └── image/               # Proxy seguro de imágenes R2
│   ├── layouts/
│   │   ├── DashboardLayout.astro    # Layout del panel (sidebar responsivo)
│   │   ├── DoctorLayout.astro       # Layout de landing del médico
│   │   └── MainLayout.astro         # Layout de landing general
│   ├── components/
│   │   ├── landing/                 # Hero, Contact, PublicOperations
│   │   ├── PasswordInput.tsx        # Input con toggle de visibilidad
│   │   ├── ProfileImageUploader.tsx # Subida de foto de perfil a R2
│   │   ├── ImageUploader.tsx        # Subida de imágenes para operaciones
│   │   └── CopyButton.tsx           # Copiar URL al portapapeles
│   ├── lib/
│   │   ├── db.ts                    # Conexión a Neon (connection pool)
│   │   ├── schema.ts                # Esquema completo de la BD (Drizzle)
│   │   ├── doctors.ts               # Queries públicas de médicos
│   │   ├── auth/                    # JWT, sesiones, correos
│   │   ├── security/                # Protección registro/login (rate limit)
│   │   └── storage/                 # Cliente Cloudflare R2
│   └── styles/
│       └── global.css
├── .env                             # Variables locales (no subir a git)
├── .env.example                     # Plantilla de variables
├── astro.config.mjs
├── tailwind.config.mjs
└── wrangler.toml                    # Config Cloudflare Workers
```

---

## Flujo de Registro

1. Médico se registra en `/register`
2. Los datos se guardan temporalmente en PostgreSQL
3. Resend envía un correo con link de verificación
4. Al hacer clic en el link, la cuenta se crea en PostgreSQL y se inicia sesión automáticamente
5. El médico es redirigido directo al `/dashboard`

---

## Servicios Externos Necesarios

| Servicio | Uso | Link |
|---|---|---|
| [Neon](https://neon.tech) | Base de datos PostgreSQL | Gratis hasta 0.5 GB |

| [Resend](https://resend.com) | Envío de correos | Gratis hasta 3k correos/mes |
| [Cloudflare R2](https://cloudflare.com) | Almacenamiento de imágenes | ~$0.015/GB/mes, egress gratis |
| [Cloudflare Pages](https://pages.cloudflare.com) | Hosting y despliegue | Gratis |

---

## Despliegue en Cloudflare Pages

**Build settings:**
- Build command: `cd SkanMed && npm install && npm run build`
- Build output: `SkanMed/dist`

**Compatibility flags** (en Settings > Runtime):
- `nodejs_compat`
- `nodejs_compat_populate_process_env`
- Compatibility date: `2025-04-01`

**Variables de entorno:** configurar las mismas del `.env` en el panel de Cloudflare Pages.
