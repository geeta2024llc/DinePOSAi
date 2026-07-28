-- ============================================================
-- DinePosAI Migration: Add Phone / Contact Number to Users
-- YYYYMMDDHHMMSS: 20260728000000_add_user_phone.sql
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
