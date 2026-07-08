-- Create kitchen_logs table
CREATE TABLE kitchen_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for performance
CREATE INDEX idx_kitchen_logs_tenant_id ON kitchen_logs(tenant_id);
CREATE INDEX idx_kitchen_logs_order_item_id ON kitchen_logs(order_item_id);

-- Enable Row Level Security (RLS)
ALTER TABLE kitchen_logs ENABLE ROW LEVEL SECURITY;

-- Deny all direct client-side/anon key access
CREATE POLICY "deny_direct_access" ON kitchen_logs FOR ALL USING (false) WITH CHECK (false);
