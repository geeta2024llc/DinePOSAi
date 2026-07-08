-- ==========================================
-- DinePosAI - Platform Settings Database Migration
-- ==========================================

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Note: No public RLS policies are created, which means it remains completely private.
-- Only the backend server using the Supabase Service Role Key (admin privileges) can query/modify it.
