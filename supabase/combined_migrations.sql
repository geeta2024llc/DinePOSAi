-- ============================================================
-- DinePosAI - Combined Database Migrations
-- Copy and paste this entire script into your Supabase SQL Editor
-- to provision your database.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Tenants table
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT,
  timezone TEXT,
  currency TEXT NOT NULL DEFAULT 'JPY',
  tax_type TEXT NOT NULL DEFAULT 'NONE', -- VAT / GST / NONE
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  plan TEXT NOT NULL DEFAULT 'TRIAL', -- TRIAL, ACTIVE, PAST_DUE, EXPIRED, SUSPENDED
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, EXPIRED
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_country ON tenants(country);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================================
-- 2. Users table
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- SUPER_ADMIN, MANAGER, CASHIER, KITCHEN
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 3. Sessions table
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);

-- ============================================================
-- 4. Audit Logs table
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- 5. Categories table
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);

-- ============================================================
-- 6. Menu Items table
-- ============================================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_tenant_category ON menu_items(tenant_id, category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

-- ============================================================
-- 7. Item Variants table
-- ============================================================
CREATE TABLE item_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. Small, Medium, Large
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_item_variants_menu_item ON item_variants(menu_item_id);

-- ============================================================
-- 8. Item Add-ons table
-- ============================================================
CREATE TABLE item_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_item_addons_menu_item ON item_addons(menu_item_id);

-- ============================================================
-- 9. Tables table
-- ============================================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, RESERVED
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tables_tenant_id ON tables(tenant_id);
CREATE INDEX idx_tables_status ON tables(status);

-- ============================================================
-- 10. Orders table
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  customer_type TEXT NOT NULL DEFAULT 'DINE_IN', -- DINE_IN, TAKE_OUT, DELIVERY
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, COOKING, READY, SERVED, CANCELLED
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================================
-- 11. Order Items table
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COOKING, READY, SERVED
  notes TEXT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_status ON order_items(status);

-- ============================================================
-- 12. Order Item Add-ons table
-- ============================================================
CREATE TABLE order_item_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  addon_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_order_item_addons_item ON order_item_addons(order_item_id);

-- ============================================================
-- 13. Payments table
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL, -- CASH, CARD, QR, MIXED
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  change_returned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL, -- SUCCESS, FAILED, PENDING, REFUNDED
  transaction_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- 14. Payment Splits table
-- ============================================================
CREATE TABLE payment_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  method TEXT NOT NULL, -- CASH, CARD, QR
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_payment_splits_payment ON payment_splits(payment_id);

-- ============================================================
-- 15. Refunds table
-- ============================================================
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_tenant_id ON refunds(tenant_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);

-- ============================================================
-- 16. Invoices table
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  qr_code TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);

-- ============================================================
-- 17. Daily Sales table
-- ============================================================
CREATE TABLE daily_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  gross_sales NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  refunds NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  voids NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  net_sales NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT unique_tenant_date UNIQUE(tenant_id, date)
);

CREATE INDEX idx_daily_sales_tenant_date ON daily_sales(tenant_id, date);

-- ============================================================
-- 18. Devices table
-- ============================================================
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- POS, KDS, TABLET
  name TEXT NOT NULL,
  device_uuid TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_tenant_id ON devices(tenant_id);
CREATE INDEX idx_devices_uuid ON devices(device_uuid);

-- ============================================================
-- 19. Settings table
-- ============================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT unique_tenant_key UNIQUE(tenant_id, key)
);

CREATE INDEX idx_settings_tenant_key ON settings(tenant_id, key);

-- ============================================================
-- 20. Super Admins table
-- ============================================================
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_super_admins_email ON super_admins(email);

-- ============================================================
-- 21. Tenant Billing table
-- ============================================================
CREATE TABLE tenant_billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_billing_tenant ON tenant_billing(tenant_id);

-- ============================================================
-- 22. Inventory Items table
-- ============================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock_level NUMERIC(10,3) NOT NULL DEFAULT 0.00,
  min_stock_level NUMERIC(10,3) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_tenant ON inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_name ON inventory_items(name);

-- ============================================================
-- 23. Menu Item Recipes table
-- ============================================================
CREATE TABLE menu_item_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  item_variant_id UUID REFERENCES item_variants(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL, -- required amount
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_item_recipes_tenant ON menu_item_recipes(tenant_id);
CREATE INDEX idx_menu_item_recipes_menu_item ON menu_item_recipes(menu_item_id);
CREATE INDEX idx_menu_item_recipes_ingredient ON menu_item_recipes(ingredient_id);

-- ============================================================
-- 24. Suppliers table
-- ============================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);

-- ============================================================
-- 25. Purchase Orders table
-- ============================================================
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ORDERED, RECEIVED, CANCELLED
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  ordered_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_tenant ON purchase_orders(tenant_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);

-- ============================================================
-- 26. Purchase Order Items table
-- ============================================================
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_purchase_order_items_tenant ON purchase_order_items(tenant_id);
CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);

-- ============================================================
-- 27. Waste Logs table
-- ============================================================
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL,
  reason TEXT NOT NULL, -- SPOILAGE, ACCIDENT, EXPIRED, QUALITY_CONTROL
  notes TEXT,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waste_logs_tenant ON waste_logs(tenant_id);
CREATE INDEX idx_waste_logs_ingredient ON waste_logs(ingredient_id);

-- ============================================================
-- 28. Inventory Transactions table
-- ============================================================
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- PURCHASE, SALE_DEDUCTION, WASTE, MANUAL_ADJUSTMENT, REFUND_RESTOCK
  quantity NUMERIC(10,3) NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_tenant ON inventory_transactions(tenant_id);
CREATE INDEX idx_inventory_transactions_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);

-- ============================================================
-- 29. Add onboarding and password reset extensions
-- ============================================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT, ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;

-- ============================================================
-- 30. ROW LEVEL SECURITY (RLS) POLICIES Setup
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admins_service_only" ON super_admins FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON tenants FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON users FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON sessions FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON audit_logs FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON categories FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON menu_items FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON item_variants FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON item_addons FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON tables FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON orders FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON order_items FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON order_item_addons FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON payments FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON payment_splits FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON refunds FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON invoices FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON daily_sales FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON devices FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON settings FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON tenant_billing FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON inventory_items FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON menu_item_recipes FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON suppliers FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON purchase_orders FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON purchase_order_items FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON waste_logs FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON inventory_transactions FOR ALL USING (false) WITH CHECK (false);

-- ============================================================
-- 31. FUNCTIONS AND TRIGGERS
-- ============================================================

-- 1. Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_menu_item_recipes_updated_at BEFORE UPDATE ON menu_item_recipes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Sync Table Status Trigger Function
CREATE OR REPLACE FUNCTION sync_table_status()
RETURNS TRIGGER AS $$
DECLARE
  active_orders_count INTEGER;
BEGIN
  IF NEW.table_id IS NOT NULL THEN
    IF NEW.status IN ('PENDING', 'ACCEPTED', 'COOKING', 'READY') THEN
      UPDATE tables SET status = 'OCCUPIED' WHERE id = NEW.table_id;
    ELSIF NEW.status IN ('SERVED', 'CANCELLED') THEN
      SELECT COUNT(*) INTO active_orders_count FROM orders
      WHERE table_id = NEW.table_id AND status IN ('PENDING', 'ACCEPTED', 'COOKING', 'READY') AND id <> NEW.id;
      
      IF active_orders_count = 0 THEN
        UPDATE tables SET status = 'AVAILABLE' WHERE id = NEW.table_id;
      END IF;
    END IF;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.table_id IS DISTINCT FROM NEW.table_id THEN
    IF OLD.table_id IS NOT NULL THEN
      SELECT COUNT(*) INTO active_orders_count FROM orders
      WHERE table_id = OLD.table_id AND status IN ('PENDING', 'ACCEPTED', 'COOKING', 'READY') AND id <> NEW.id;
        
      IF active_orders_count = 0 THEN
        UPDATE tables SET status = 'AVAILABLE' WHERE id = OLD.table_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_table_status AFTER INSERT OR UPDATE OF status, table_id ON orders FOR EACH ROW EXECUTE FUNCTION sync_table_status();

-- 3. Inventory Stock Deduction Trigger Function
CREATE OR REPLACE FUNCTION deduct_inventory_stock()
RETURNS TRIGGER AS $$
DECLARE
  item_rec RECORD;
  recipe_rec RECORD;
BEGIN
  IF (OLD.status = 'PENDING' AND NEW.status IN ('ACCEPTED', 'COOKING')) THEN
    IF NOT EXISTS (
      SELECT 1 FROM inventory_transactions WHERE reference_id = NEW.id AND type = 'SALE_DEDUCTION'
    ) THEN
      FOR item_rec IN SELECT menu_item_id, quantity FROM order_items WHERE order_id = NEW.id AND menu_item_id IS NOT NULL LOOP
        FOR recipe_rec IN SELECT ingredient_id, quantity AS ingredient_qty FROM menu_item_recipes WHERE menu_item_id = item_rec.menu_item_id LOOP
          UPDATE inventory_items SET stock_level = stock_level - (recipe_rec.ingredient_qty * item_rec.quantity) WHERE id = recipe_rec.ingredient_id;
          INSERT INTO inventory_transactions (tenant_id, ingredient_id, type, quantity, reference_id, notes, created_at)
          VALUES (NEW.tenant_id, recipe_rec.ingredient_id, 'SALE_DEDUCTION', -(recipe_rec.ingredient_qty * item_rec.quantity), NEW.id, 'Automatic stock deduction for order ' || NEW.id, NOW());
        END LOOP;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_inventory_stock BEFORE UPDATE OF status ON orders FOR EACH ROW EXECUTE FUNCTION deduct_inventory_stock();

-- 4. Transactional signup function to wrap tenant and user creation
CREATE OR REPLACE FUNCTION signup_tenant_and_user(
  p_business_name TEXT,
  p_name TEXT,
  p_email TEXT,
  p_password_hash TEXT,
  p_country TEXT,
  p_timezone TEXT,
  p_currency TEXT
) RETURNS JSONB AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id UUID;
  v_trial_ends TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  v_trial_ends := NOW() + INTERVAL '7 days';
  
  INSERT INTO tenants (name, country, timezone, currency, tax_type, tax_rate, plan, status, trial_ends_at)
  VALUES (p_business_name, p_country, p_timezone, p_currency, 'NONE', 0.00, 'TRIAL', 'ACTIVE', v_trial_ends)
  RETURNING id INTO v_tenant_id;
  
  INSERT INTO users (tenant_id, name, email, password_hash, role, is_active)
  VALUES (v_tenant_id, p_name, p_email, p_password_hash, 'MANAGER', TRUE)
  RETURNING id INTO v_user_id;
  
  v_result := jsonb_build_object(
    'tenant', jsonb_build_object('id', v_tenant_id, 'name', p_business_name, 'trialEndsAt', v_trial_ends, 'plan', 'TRIAL', 'onboarded', FALSE),
    'user', jsonb_build_object('id', v_user_id, 'name', p_name, 'email', p_email, 'role', 'MANAGER')
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 32. Platform Settings table
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

