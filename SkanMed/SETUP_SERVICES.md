# SkanMed - Guía de Configuración de Servicios Externos

## Redis (Upstash) - Para Rate Limiting

1. Ve a [https://console.upstash.com/](https://console.upstash.com/)
2. Regístrate gratis (con GitHub o Google)
3. Crea una nueva base de datos Redis:
   - **Name**: `skanmed-redis`
   - **Region**: Selecciona "US-East-1" (la misma que Neon)
   - **Type**: Selecciona "Free"
4. Una vez creada, copia el **"REDIS_URL"** (empieza con `redis://default:...`)
5. Pégalo en tu archivo `.env` en la variable `REDIS_URL`

## Resend - Para Envío de Correos

1. Ve a [https://resend.com/](https://resend.com/)
2. Regístrate gratis
3. Ve a "API Keys" y crea una nueva key
4. Copia el API Key (empieza con `re_...`)
5. Pégalo en tu archivo `.env` en la variable `RESEND_API_KEY`

**Nota:** En el plan gratuito de Resend puedes enviar 100 correos/día, que es más que suficiente para empezar.

## Cloudflare R2 - Para Subida de Imágenes

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) y crea cuenta gratis
2. Ve a **R2** en el menú lateral
3. Haz clic en **"Create Bucket"** → nombre: `skanmed-images`
4. **NO habilites Public Access** (lo dejamos privado por seguridad)
5. Ve a **"Manage R2 API Tokens"** (arriba a la derecha)
6. **"Create API Token"**:
   - Token Name: `SkanMed Upload`
   - Permissions: Object Read & Write
   - Bucket: `skanmed-images`
7. Copia los 3 valores que te muestra:
   - Access Key ID
   - Secret Access Key
   - Account ID (está en la URL del dashboard también)
8. Pégalos en tu `.env`:

```properties
# Cloudflare R2
R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=abc123_que_copiaste
R2_SECRET_ACCESS_KEY=xyz789_que_copiaste
R2_BUCKET_NAME=skanmed-images, ahora usamos proxy
```

**Seguridad implementada:**
- ✅ Bucket privado (solo tu backend accede)
- ✅ Carpetas separadas (public/ vs private/)
- ✅ Proxy verifica is_public antes de servir
- ✅ URLs imposibles de adivinar

## Archivo .env Final

Tu archivo `.env` debería verse así:

```properties
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=mi_secret_super_seguro_2026

# Redis
REDIS_URL=redis://default:AbcXyz123@us1-merry-phoenix-12345.upstash.io:6379

# Resend
RESEND_API_KEY=re_AbCdEf123456
RESEND_FROM_EMAIL=noreply@skanmed.com

# Cloudflare R2
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=f8a7d6c5b4a3
R2_SECRET_ACCESS_KEY=1234567890abcdef
R2_BUCKET_NAME=skanmed-images
R2_PUBLIC_URL=https://pub-1a2b3c4d.r2.dev

# URLs
FRONTEND_URL=http://localhost:3000
```

## Modo Demo (Sin configurar servicios)

Si NO configuras Redis, Resend o R2, el sistema seguirá funcionando:
- Los "correos" se imprimirán en la terminal del servidor (consola)
- El rate limiting quedará deshabilitado
- La subida de imágenes mostrará un mensaje informando que no está configurada
- Perfecto para desarrollo/pruebas
