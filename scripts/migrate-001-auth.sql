-- Migration 001 — federated auth
-- Apply after db-init.sql:
--   psql "$DATABASE_URL" -f scripts/migrate-001-auth.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email       text,
  ADD COLUMN IF NOT EXISTS provider    text,
  ADD COLUMN IF NOT EXISTS provider_id text;

ALTER TABLE users
  ALTER COLUMN display_name SET DEFAULT 'User';

-- Unique constraint for upsert on (provider, provider_id).
-- Partial index: only rows where provider IS NOT NULL (local dev seed rows are excluded).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id
  ON users (provider, provider_id)
  WHERE provider IS NOT NULL;
