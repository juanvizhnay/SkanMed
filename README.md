# SkanMed Platform

SaaS platform for doctors that combines a personalized public landing page with a private clinical management system. All in a single Astro project deployed on Cloudflare Pages under `skanmed.net`.

---

## Architecture

A single Astro project (SSR) with all routes under the same domain:

| Route | Description |
|---|---|
| `skanmed.net/` | Platform's general landing page |
| `skanmed.net/login` | Sign in |
| `skanmed.net/register` | New doctor registration |
| `skanmed.net/dashboard` | Doctor's private panel |
| `skanmed.net/[slug]` | Doctor's public landing page |
| `skanmed.net/[slug]/perfil` | Doctor's professional background |
| `skanmed.net/[slug]/casos` | Doctor's public clinical cases |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro (SSR) + React Islands |
| Styling | Tailwind CSS |
| Database | PostgreSQL on [Neon](https://neon.tech) |
| ORM | Drizzle ORM |
| Authentication | JWT (`jose`) + bcryptjs |
| Rate limiting / cache | PostgreSQL (dedicated tables) |
| Email | [Resend](https://resend.com) |
| Image storage | Cloudflare R2 |
| Deployment | Cloudflare Pages |

---

## Quick Start (Local Development)

```bash
cd SkanMed
npm install
npm run dev
```

Open `http://localhost:4321`

---

## Initial Setup

### 1. Database (Neon PostgreSQL)

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. In the SQL Editor, run in order:
   - `SkanMed/SkanMed_DB.sql` — creates all tables
   - `SkanMed/db_auth_migration.sql` — adds authentication columns

### 2. Environment Variables

Create `SkanMed/.env` based on `SkanMed/.env.example`:

```properties
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Authentication
JWT_SECRET=a_random_64_character_string

# Resend (verification and recovery emails)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Base URL (for links in emails)
FRONTEND_URL=http://localhost:4321

# Cloudflare R2 (image uploads)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
```

---

## Project Structure

```
SkanMed/
├── src/
│   ├── pages/
│   │   ├── index.astro              # General landing page
│   │   ├── login.astro              # Sign in
│   │   ├── register.astro           # Registration
│   │   ├── verify-email.astro       # Email verification
│   │   ├── forgot-password.astro    # Password recovery
│   │   ├── reset-password.astro
│   │   ├── logout.astro
│   │   ├── [slug]/                  # Doctor's public landing
│   │   │   ├── index.astro
│   │   │   ├── perfil.astro
│   │   │   └── casos.astro
│   │   ├── dashboard/               # Private panel
│   │   │   ├── index.astro          # Overview
│   │   │   ├── configuracion.astro  # Profile and settings
│   │   │   ├── pacientes/           # Patients, consultations, prescriptions CRUD
│   │   │   └── operaciones/         # Surgical operations CRUD
│   │   └── api/
│   │       └── image/               # Secure R2 image proxy
│   ├── layouts/
│   │   ├── DashboardLayout.astro    # Panel layout (responsive sidebar)
│   │   ├── DoctorLayout.astro       # Doctor's landing layout
│   │   └── MainLayout.astro         # General landing layout
│   ├── components/
│   │   ├── landing/                 # Hero, Contact, PublicOperations
│   │   ├── PasswordInput.tsx        # Input with visibility toggle
│   │   ├── ProfileImageUploader.tsx # Profile picture upload to R2
│   │   ├── ImageUploader.tsx        # Image upload for operations
│   │   └── CopyButton.tsx           # Copy URL to clipboard
│   ├── lib/
│   │   ├── db.ts                    # Neon connection (connection pool)
│   │   ├── schema.ts                # Full DB schema (Drizzle)
│   │   ├── doctors.ts               # Public doctor queries
│   │   ├── auth/                    # JWT, sessions, emails
│   │   ├── security/                # Register/login protection (rate limit)
│   │   └── storage/                 # Cloudflare R2 client
│   └── styles/
│       └── global.css
├── .env                             # Local variables (do not commit)
├── .env.example                     # Variables template
├── astro.config.mjs
├── tailwind.config.mjs
└── wrangler.toml                    # Cloudflare Workers config
```

---

## Registration Flow

1. Doctor signs up at `/register`
2. Data is temporarily stored in PostgreSQL
3. Resend sends an email with a verification link
4. When clicking the link, the account is created in PostgreSQL and the session starts automatically
5. The doctor is redirected straight to the `/dashboard`

---

## Required External Services

| Service | Use | Link |
|---|---|---|
| [Neon](https://neon.tech) | PostgreSQL database | Free up to 0.5 GB |
| [Resend](https://resend.com) | Email delivery | Free up to 3k emails/month |
| [Cloudflare R2](https://cloudflare.com) | Image storage | ~$0.015/GB/month, free egress |
| [Cloudflare Pages](https://pages.cloudflare.com) | Hosting and deployment | Free |

---

## Deployment on Cloudflare Pages

**Build settings:**
- Build command: `cd SkanMed && npm install && npm run build`
- Build output: `SkanMed/dist`

**Compatibility flags** (in Settings > Runtime):
- `nodejs_compat`
- `nodejs_compat_populate_process_env`
- Compatibility date: `2025-04-01`

**Environment variables:** configure the same ones from `.env` in the Cloudflare Pages panel.
