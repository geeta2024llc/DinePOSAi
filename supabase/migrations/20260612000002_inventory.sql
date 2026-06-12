-- ============================================================
-- DinePosAI - Inventory Management Schema Migration
-- ============================================================

-- 1. Inventory Items table
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

-- Indices for inventory_items
CREATE INDEX idx_inventory_items_tenant ON inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_name ON inventory_items(name);

-- 2. Menu Item Recipes table
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

-- Indices for menu_item_recipes
CREATE INDEX idx_menu_item_recipes_tenant ON menu_item_recipes(tenant_id);
CREATE INDEX idx_menu_item_recipes_menu_item ON menu_item_recipes(menu_item_id);
CREATE INDEX idx_menu_item_recipes_ingredient ON menu_item_recipes(ingredient_id);

-- 3. Suppliers table
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

-- Indices for suppliers
CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);

-- 4. Purchase Orders table
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

-- Indices for purchase_orders
CREATE INDEX idx_purchase_orders_tenant ON purchase_orders(tenant_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);

-- 5. Purchase Order Items table
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL
);

-- Indices for purchase_order_items
CREATE INDEX idx_purchase_order_items_tenant ON purchase_order_items(tenant_id);
CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);

-- 6. Waste Logs table
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

-- Indices for waste_logs
CREATE INDEX idx_waste_logs_tenant ON waste_logs(tenant_id);
CREATE INDEX idx_waste_logs_ingredient ON waste_logs(ingredient_id);

-- 7. Inventory Transactions table
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

-- Indices for inventory_transactions
CREATE INDEX idx_inventory_transactions_tenant ON inventory_transactions(tenant_id);
CREATE INDEX idx_inventory_transactions_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Deny direct access policies for non-service roles
CREATE POLICY "deny_direct_access" ON inventory_items FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON menu_item_recipes FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON suppliers FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON purchase_orders FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON purchase_order_items FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON waste_logs FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "deny_direct_access" ON inventory_transactions FOR ALL USING (false) WITH CHECK (false);
