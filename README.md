# SkanMed Platform

Plataforma médica completa con Landing Pages públicas y Sistema Privado de gestión.

---

## Inicio Rápido

### Sistema Privado (Dashboard para Médicos)

```bash
cd SkanMed
npm install
npm run dev
```

**Abre:** http://localhost:3000
**Propósito:** Login, gestión de pacientes, operaciones, perfil profesional.

---

### Landing Pages Públicas

```bash
cd LandingPages
npm install
npm run dev
```

**Abre:** http://localhost:4321
**Propósito:** Páginas públicas de cada médico (ej: `http://localhost:4321/dr-padre`)

---

## Configuración Inicial (Primera vez)

### 1. Base de Datos (Neon PostgreSQL)

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Crea un proyecto
3. En el **SQL Editor**, ejecuta **en orden**:
   - `LandingPages/SkanMed_DB.sql` (crea las tablas)
   - `SkanMed/db_auth_migration.sql` (agrega columnas de autenticación)

### 2. Variables de Entorno

Cada proyecto necesita su `.env`:

**SkanMed/.env:**
```properties
DATABASE_URL=tu_connection_string_de_neon
JWT_SECRET=tu_secret_super_seguro_2026

# Redis (opcional, para rate limiting)
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# Resend (opcional, para envío de correos)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@skanmed.com

FRONTEND_URL=http://localhost:3000
```

**LandingPages/.env:**
```properties
DATABASE_URL=tu_connection_string_de_neon
```

> **Nota:** Ambos proyectos usan la **misma base de datos** en Neon.

---

## Estructura del Proyecto

```
trabajo_final_bases/
│
├── SkanMed/              # Sistema Privado (puerto 3000)
│   ├── src/
│   │   ├── pages/        # Login, Dashboard, Operaciones
│   │   ├── layouts/      # DashboardLayout
│   │   └── lib/
│   │       ├── auth/     # Sistema de autenticación
│   │       ├── db.ts     # Conexión a Neon
│   │       └── schema.ts # Tablas de la BD
│   ├── .env              # Configuración privada
│   └── package.json      # Puerto 3000 por defecto
│
└── LandingPages/         # Páginas Públicas (puerto 4321)
    ├── src/
    │   ├── pages/
    │   │   └── [slug]/   # Landing page de cada médico
    │   ├── components/   # Hero, Operations, Contact
    │   └── lib/
    │       ├── db.ts
    │       └── schema.ts
    ├── .env
    └── package.json      # Puerto 4321 por defecto
```

---

## Flujo de Trabajo

1. **Médico se registra** en http://localhost:3000
2. **Verifica su correo** (link en la terminal si no tienes Resend configurado)
3. **Inicia sesión** en el Dashboard
4. **Publica operaciones** desde el panel privado
5. **Las operaciones aparecen automáticamente** en su landing page pública (http://localhost:4321/su-slug)

---

## Servicios Externos (Opcional)

Para funcionalidad completa en producción:

- **Redis:** [Upstash Redis](https://console.upstash.com) - Rate limiting
- **Resend:** [Resend API](https://resend.com) - Envío de correos

Ver `SkanMed/SETUP_SERVICES.md` para detalles.

---

## Comandos Útiles

| Acción                     | Comando                           |
|----------------------------|-----------------------------------|
| Correr sistema privado     | `cd SkanMed && npm run dev`       |
| Correr landing pages       | `cd LandingPages && npm run dev`  |
| Compilar para producción   | `npm run build` (en cada carpeta) |

---

**¡Listo!** Ahora solo necesitas `npm run dev` en la carpeta correcta.
