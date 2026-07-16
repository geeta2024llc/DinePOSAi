-- DinePosAI - Cash Drawer Database Schema Migration (Phase 1)

-- 1. Cash Drawers configuration table (single active drawer per terminal)
CREATE TABLE IF NOT EXISTS cash_drawers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Drawer',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  opening_balance NUMERIC(10,2) NOT NULL DEFAULT 200.00,
  auto_open_on_cash BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_drawers_tenant ON cash_drawers(tenant_id);

-- 2. Cash Movements ledger table
CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  drawer_id UUID NOT NULL REFERENCES cash_drawers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- CASH_IN, CASH_OUT, NO_SALE, CASH_SALE, REFUND
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  reason TEXT NOT NULL,
  note TEXT,
  user_id UUID NOT NULL, -- references users/staff
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_movements_tenant ON cash_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_drawer ON cash_movements(drawer_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_type ON cash_movements(type);
