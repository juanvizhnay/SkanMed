# SkanMed Landing Pages

Landing pages públicas para profesionales médicos registrados en SkanMed.

## Inicio Rápido

```bash
npm install
npm run dev
```

**Abre:** http://localhost:4321
**Ejemplo:** http://localhost:4321/dr-padre

Eso es todo. El puerto 4321 ya está configurado por defecto.

---

## Configuración (Primera vez)

### 1. Base de Datos (Neon PostgreSQL)

Ejecuta `SkanMed_DB.sql` en el SQL Editor de Neon para crear las tablas.

### 2. Variables de Entorno (.env)

```properties
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

> **Nota:** Esta es la **misma base de datos** que usa el sistema privado (SkanMed).

---

## Cómo funciona

Cuando un médico publica operaciones desde el Dashboard privado (http://localhost:3000), automáticamente aparecen en su landing page pública.

**Estructura de URL:** `http://localhost:4321/{slug-del-doctor}`

El slug se genera automáticamente al registrarse.
