-- ============================================================
-- RLS POLICIES + super_admins RLS
-- Fixes: (1) super_admins had no RLS, (2) all other tables had
--        RLS enabled but zero policies, making them deny-all for
--        non-owner roles.
--
-- Design: the Express API uses the Supabase service_role key,
-- which bypasses RLS automatically. These policies therefore
-- protect against direct anon/authenticated access to the DB
-- (e.g. someone using the anon key or the Supabase dashboard
-- with the authenticated role).
-- ============================================================

-- 1. Enable RLS on super_admins (was omitted in init migration)
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 2. super_admins: deny all direct access — only the service_role
--    (used by the Express API) may read/write this table.
CREATE POLICY "super_admins_service_only"
  ON super_admins
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 3. For every tenant-scoped table: deny access from the anon role.
--    The authenticated role is also denied direct access; all reads
--    and writes must go through the Express API (service_role).
--
--    Using a single USING(false) policy per table achieves deny-all
--    for non-service roles while leaving service_role unaffected.

CREATE POLICY "deny_direct_access" ON tenants         FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON users           FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON sessions        FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON audit_logs      FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON categories      FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON menu_items      FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON item_variants   FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON item_addons     FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON tables          FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON orders          FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON order_items     FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON order_item_addons FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON payments        FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON payment_splits  FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON refunds         FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON invoices        FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON daily_sales     FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON devices         FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON settings        FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON tenant_billing  FOR ALL USING (false) WITH CHECK (false);

-- 4. Missing index on sessions.tenant_id (FK without an index)
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);
