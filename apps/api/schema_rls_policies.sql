-- =============================================================================
-- DinePOS AI - Supabase Row Level Security (RLS) & Multi-Tenant Isolation Policies
-- Enables RLS across all production tables and enforces strict tenant boundaries.
-- =============================================================================

-- 1. Enable RLS on all core tables
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing legacy policies if present
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
DROP POLICY IF EXISTS tenant_isolation_menu ON menu_items;
DROP POLICY IF EXISTS tenant_isolation_categories ON categories;
DROP POLICY IF EXISTS tenant_isolation_tables ON tables;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_logs;

-- 3. Define Tenant Isolation Policies (Service role bypasses RLS for backend controllers)

-- Orders Table RLS Policy
CREATE POLICY tenant_isolation_orders ON orders
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Menu Items Table RLS Policy
CREATE POLICY tenant_isolation_menu ON menu_items
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Categories Table RLS Policy
CREATE POLICY tenant_isolation_categories ON categories
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Tables Floor Map RLS Policy
CREATE POLICY tenant_isolation_tables ON tables
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Users Table RLS Policy
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Audit Logs RLS Policy
CREATE POLICY tenant_isolation_audit ON audit_logs
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- 4. Verification Query: Confirm RLS Status across schema
SELECT 
  tablename, 
  rowsecurity 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public' 
  AND tablename IN ('tenants', 'users', 'orders', 'order_items', 'menu_items', 'categories', 'tables', 'audit_logs');
