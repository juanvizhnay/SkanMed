-- Ejecutar esto en Neon SQL Editor para actualizar la tabla doctors

-- Agregar campos de recuperación de contraseña (si no existen)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Agregar campo para tracking de intentos de login fallidos (opcional, para seguridad extra)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Nota: email_verification la manejamos con Redis, no necesitamos columnas en DB
