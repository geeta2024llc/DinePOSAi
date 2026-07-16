-- ============================================================
-- DinePosAI Migration: Add Branches, Sessions, History, and Permissions
-- YYYYMMDDHHMMSS: 20260714000000_add_branches_and_permissions.sql
-- ============================================================

-- 1. Create Branches Table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  timezone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branches_tenant_id ON branches(tenant_id);

-- 2. Alter Users Table
ALTER TABLE users ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
CREATE INDEX idx_users_branch_id ON users(branch_id);

-- 3. Drop existing sessions table (we will replace it with user_sessions)
DROP TABLE IF EXISTS sessions CASCADE;

-- 4. Create User Sessions Table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  device TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_tenant_id ON user_sessions(tenant_id);

-- 5. Create Login History Table
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  ip_address TEXT,
  browser TEXT,
  device TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  status TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'BLOCKED'
  failure_reason TEXT,  -- 'INVALID_PASSWORD', 'ACCOUNT_SUSPENDED', 'RATE_LIMITED', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_tenant_id ON login_history(tenant_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at);

-- 6. Create User Permissions Table
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  CONSTRAINT unique_role_permission UNIQUE(role, permission)
);

CREATE INDEX idx_user_permissions_role ON user_permissions(role);

-- 7. Alter Audit Logs Table
ALTER TABLE audit_logs 
  ADD COLUMN ip_address TEXT,
  ADD COLUMN device TEXT,
  ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX idx_audit_logs_branch_id ON audit_logs(branch_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- 9. Deny Direct Access RLS Policies
CREATE POLICY "deny_direct_access" ON branches FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON user_sessions FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON login_history FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON user_permissions FOR ALL USING (false) WITH CHECK (false);

-- 10. Triggers for updated_at on branches
CREATE TRIGGER trigger_update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 11. Pre-seed Default Permissions
-- Super Admin permissions (Everything)
INSERT INTO user_permissions (role, permission) VALUES
('SUPER_ADMIN', 'orders.create'),
('SUPER_ADMIN', 'orders.edit'),
('SUPER_ADMIN', 'orders.refund'),
('SUPER_ADMIN', 'orders.cancel'),
('SUPER_ADMIN', 'invoice.print'),
('SUPER_ADMIN', 'tables.view'),
('SUPER_ADMIN', 'tables.manage'),
('SUPER_ADMIN', 'menu.view'),
('SUPER_ADMIN', 'menu.manage'),
('SUPER_ADMIN', 'kds.view'),
('SUPER_ADMIN', 'kds.update'),
('SUPER_ADMIN', 'inventory.view'),
('SUPER_ADMIN', 'inventory.manage'),
('SUPER_ADMIN', 'staff.view'),
('SUPER_ADMIN', 'staff.invite'),
('SUPER_ADMIN', 'staff.manage'),
('SUPER_ADMIN', 'billing.view'),
('SUPER_ADMIN', 'billing.manage'),
('SUPER_ADMIN', 'reports.view'),
('SUPER_ADMIN', 'settings.manage'),
('SUPER_ADMIN', 'audit.view'),
('SUPER_ADMIN', 'system.manage');

-- Owner permissions (Everything except system.manage)
INSERT INTO user_permissions (role, permission) VALUES
('OWNER', 'orders.create'),
('OWNER', 'orders.edit'),
('OWNER', 'orders.refund'),
('OWNER', 'orders.cancel'),
('OWNER', 'invoice.print'),
('OWNER', 'tables.view'),
('OWNER', 'tables.manage'),
('OWNER', 'menu.view'),
('OWNER', 'menu.manage'),
('OWNER', 'kds.view'),
('OWNER', 'kds.update'),
('OWNER', 'inventory.view'),
('OWNER', 'inventory.manage'),
('OWNER', 'staff.view'),
('OWNER', 'staff.invite'),
('OWNER', 'staff.manage'),
('OWNER', 'billing.view'),
('OWNER', 'billing.manage'),
('OWNER', 'reports.view'),
('OWNER', 'settings.manage'),
('OWNER', 'audit.view');

-- Manager permissions (Cannot do billing.manage, settings.manage, staff.invite, staff.manage)
INSERT INTO user_permissions (role, permission) VALUES
('MANAGER', 'orders.create'),
('MANAGER', 'orders.edit'),
('MANAGER', 'orders.refund'),
('MANAGER', 'orders.cancel'),
('MANAGER', 'invoice.print'),
('MANAGER', 'tables.view'),
('MANAGER', 'tables.manage'),
('MANAGER', 'menu.view'),
('MANAGER', 'menu.manage'),
('MANAGER', 'kds.view'),
('MANAGER', 'kds.update'),
('MANAGER', 'inventory.view'),
('MANAGER', 'inventory.manage'),
('MANAGER', 'staff.view'),
('MANAGER', 'billing.view'),
('MANAGER', 'reports.view'),
('MANAGER', 'audit.view');

-- Cashier permissions
INSERT INTO user_permissions (role, permission) VALUES
('CASHIER', 'orders.create'),
('CASHIER', 'orders.edit'),
('CASHIER', 'orders.refund'),
('CASHIER', 'orders.cancel'),
('CASHIER', 'invoice.print'),
('CASHIER', 'tables.view'),
('CASHIER', 'menu.view');

-- Waiter permissions
INSERT INTO user_permissions (role, permission) VALUES
('WAITER', 'orders.create'),
('WAITER', 'orders.edit'),
('WAITER', 'tables.view'),
('WAITER', 'menu.view');

-- Kitchen permissions
INSERT INTO user_permissions (role, permission) VALUES
('KITCHEN', 'menu.view'),
('KITCHEN', 'kds.view'),
('KITCHEN', 'kds.update');
