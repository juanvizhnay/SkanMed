-- Migration: Replace Redis with PostgreSQL tables
-- Run this in Neon SQL Editor

-- Temporary registration data (until email is verified)
CREATE TABLE IF NOT EXISTS pending_registrations (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  license_number VARCHAR(50),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rate limiting / cooldown tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_reg_token ON pending_registrations(token);
CREATE INDEX IF NOT EXISTS idx_pending_reg_expires ON pending_registrations(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);
