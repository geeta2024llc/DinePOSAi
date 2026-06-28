-- Add onboarded column to tenants table to track onboarding status
ALTER TABLE tenants ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT FALSE;
