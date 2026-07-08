-- ============================================================
-- DinePosAI - Database Triggers and Functions Migration
-- ============================================================

-- 1. Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply set_updated_at trigger to tables
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
  -- Only run if table_id is associated
  IF NEW.table_id IS NOT NULL THEN
    -- Check if the order status is active
    IF NEW.status IN ('PENDING', 'ACCEPTED', 'COOKING', 'READY') THEN
      -- Immediately set table to OCCUPIED
      UPDATE tables
      SET status = 'OCCUPIED'
      WHERE id = NEW.table_id;
    ELSIF NEW.status IN ('SERVED', 'CANCELLED') THEN
      -- Check if there are any OTHER active orders on this table
      SELECT COUNT(*) INTO active_orders_count
      FROM orders
      WHERE table_id = NEW.table_id
        AND status IN ('PENDING', 'ACCEPTED', 'COOKING', 'READY')
        AND id <> NEW.id;
      
      IF active_orders_count = 0 THEN
        UPDATE tables
        SET status = 'AVAILABLE'
        WHERE id = NEW.table_id;
      END IF;
    END IF;
  END IF;
  
  -- Handle table assignment changes (if an order is moved from table A to table B)
  IF TG_OP = 'UPDATE' AND OLD.table_id IS DISTINCT FROM NEW.table_id THEN
    -- Check OLD table: if no active orders left, make it AVAILABLE
    IF OLD.table_id IS NOT NULL THEN
      SELECT COUNT(*) INTO active_orders_count
      FROM orders
      WHERE table_id = OLD.table_id
        AND status IN ('PENDING', 'ACCEPTED', 'COOKING', 'READY')
        AND id <> NEW.id;
        
      IF active_orders_count = 0 THEN
        UPDATE tables
        SET status = 'AVAILABLE'
        WHERE id = OLD.table_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply sync_table_status trigger to orders
CREATE TRIGGER trigger_sync_table_status
AFTER INSERT OR UPDATE OF status, table_id ON orders
FOR EACH ROW
EXECUTE FUNCTION sync_table_status();

-- 3. Inventory Stock Deduction Trigger Function
CREATE OR REPLACE FUNCTION deduct_inventory_stock()
RETURNS TRIGGER AS $$
DECLARE
  item_rec RECORD;
  recipe_rec RECORD;
BEGIN
  -- Deduct stock when order transitions from PENDING to ACCEPTED/COOKING
  IF (OLD.status = 'PENDING' AND NEW.status IN ('ACCEPTED', 'COOKING')) THEN
    -- Check if we already deducted stock for this order to prevent double deduction
    IF NOT EXISTS (
      SELECT 1 
      FROM inventory_transactions 
      WHERE reference_id = NEW.id AND type = 'SALE_DEDUCTION'
    ) THEN
      FOR item_rec IN 
        SELECT menu_item_id, quantity 
        FROM order_items 
        WHERE order_id = NEW.id AND menu_item_id IS NOT NULL
      LOOP
        FOR recipe_rec IN 
          SELECT ingredient_id, quantity AS ingredient_qty
          FROM menu_item_recipes
          WHERE menu_item_id = item_rec.menu_item_id
        LOOP
          -- Deduct stock
          UPDATE inventory_items
          SET stock_level = stock_level - (recipe_rec.ingredient_qty * item_rec.quantity)
          WHERE id = recipe_rec.ingredient_id;
          
          -- Insert inventory transaction log
          INSERT INTO inventory_transactions (
            tenant_id,
            ingredient_id,
            type,
            quantity,
            reference_id,
            notes,
            created_at
          ) VALUES (
            NEW.tenant_id,
            recipe_rec.ingredient_id,
            'SALE_DEDUCTION',
            -(recipe_rec.ingredient_qty * item_rec.quantity),
            NEW.id,
            'Automatic stock deduction for order ' || NEW.id,
            NOW()
          );
        END LOOP;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply deduct_inventory_stock trigger to orders
CREATE TRIGGER trigger_deduct_inventory_stock
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory_stock();

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
  
  -- Insert tenant
  INSERT INTO tenants (
    name,
    country,
    timezone,
    currency,
    tax_type,
    tax_rate,
    plan,
    status,
    trial_ends_at
  ) VALUES (
    p_business_name,
    p_country,
    p_timezone,
    p_currency,
    'NONE',
    0.00,
    'TRIAL',
    'ACTIVE',
    v_trial_ends
  ) RETURNING id INTO v_tenant_id;
  
  -- Insert manager user
  INSERT INTO users (
    tenant_id,
    name,
    email,
    password_hash,
    role,
    is_active
  ) VALUES (
    v_tenant_id,
    p_name,
    p_email,
    p_password_hash,
    'MANAGER',
    TRUE
  ) RETURNING id INTO v_user_id;
  
  -- Construct result
  v_result := jsonb_build_object(
    'tenant', jsonb_build_object(
      'id', v_tenant_id,
      'name', p_business_name,
      'trialEndsAt', v_trial_ends,
      'plan', 'TRIAL',
      'onboarded', FALSE
    ),
    'user', jsonb_build_object(
      'id', v_user_id,
      'name', p_name,
      'email', p_email,
      'role', 'MANAGER'
    )
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 5. Add password reset fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT, ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;
