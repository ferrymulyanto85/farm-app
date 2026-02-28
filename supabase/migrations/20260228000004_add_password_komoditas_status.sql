-- ============================================================
-- Migration: Add password_hash, komoditas, status fields
-- Description: Support credential-based auth and additional lahan fields
-- ============================================================

-- Allow credential-based auth (auth_id optional for direct login)
ALTER TABLE users ALTER COLUMN auth_id DROP NOT NULL;

-- Add password hash for credential-based authentication
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Add komoditas and status to lahan table
ALTER TABLE lahan ADD COLUMN komoditas VARCHAR(100);
ALTER TABLE lahan ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'aktif';
