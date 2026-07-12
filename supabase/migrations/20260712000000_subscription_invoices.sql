-- ============================================================
-- SUBSCRIPTION INVOICES TABLE
-- Stores billing/subscription invoices for the admin dashboard.
-- ============================================================

CREATE TABLE subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PAID', 'UPCOMING', 'OVERDUE', 'VOID')),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Index for fast tenant lookups
CREATE INDEX idx_subscription_invoices_tenant ON subscription_invoices(tenant_id, created_at DESC);

-- Enable RLS
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Deny direct access (API uses service_role)
CREATE POLICY "deny_direct_access" ON subscription_invoices FOR ALL USING (false) WITH CHECK (false);

-- Seed demo data for the demo tenant
INSERT INTO subscription_invoices (tenant_id, invoice_number, description, amount, status, period_start, period_end, paid_at, created_at)
SELECT
  t.id,
  inv.invoice_number,
  inv.description,
  inv.amount,
  inv.status,
  inv.period_start,
  inv.period_end,
  inv.paid_at,
  inv.created_at
FROM tenants t
CROSS JOIN (VALUES
  ('INV-2024-003', 'Enterprise Growth - Annual Renewal', 2499.00, 'UPCOMING', '2024-11-15'::timestamp, '2025-11-15'::timestamp, NULL, '2024-11-15'::timestamp),
  ('INV-2024-002', 'Hardware Add-on: Kitchen Display x2', 450.00, 'PAID', '2024-10-01'::timestamp, '2024-10-01'::timestamp, '2024-10-01'::timestamp, '2024-10-01'::timestamp),
  ('INV-2023-001', 'Enterprise Growth - Annual', 2499.00, 'PAID', '2023-11-15'::timestamp, '2024-11-15'::timestamp, '2023-11-15'::timestamp, '2023-11-15'::timestamp)
) AS inv(invoice_number, description, amount, status, period_start, period_end, paid_at, created_at)
WHERE t.name = 'Demo Restaurant'
LIMIT 1;
