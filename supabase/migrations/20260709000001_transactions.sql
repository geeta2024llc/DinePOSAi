-- Create place_order_transaction DB function
CREATE OR REPLACE FUNCTION place_order_transaction(
  p_tenant_id UUID,
  p_table_id UUID,
  p_customer_type TEXT,
  p_subtotal NUMERIC,
  p_tax NUMERIC,
  p_discount NUMERIC,
  p_total NUMERIC,
  p_created_by UUID,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
BEGIN
  -- Insert order header
  INSERT INTO orders (
    tenant_id, table_id, customer_type, status, 
    subtotal, tax, discount, total, created_by
  )
  VALUES (
    p_tenant_id, p_table_id, p_customer_type, 'PENDING',
    p_subtotal, p_tax, p_discount, p_total, p_created_by
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    menuItemId UUID,
    name TEXT,
    quantity INTEGER,
    price NUMERIC,
    notes TEXT
  ) LOOP
    INSERT INTO order_items (
      order_id, menu_item_id, name, quantity, price, status, notes
    )
    VALUES (
      v_order_id, v_item.menuItemId, v_item.name, v_item.quantity, v_item.price, 'PENDING', v_item.notes
    );
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Create create_purchase_order_transaction DB function
CREATE OR REPLACE FUNCTION create_purchase_order_transaction(
  p_tenant_id UUID,
  p_supplier_id UUID,
  p_total_cost NUMERIC,
  p_created_by UUID,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_po_id UUID;
  v_item RECORD;
BEGIN
  -- Insert purchase order header
  INSERT INTO purchase_orders (
    tenant_id, supplier_id, status, total_cost, created_by
  )
  VALUES (
    p_tenant_id, p_supplier_id, 'PENDING', p_total_cost, p_created_by
  )
  RETURNING id INTO v_po_id;

  -- Insert purchase order items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    ingredientId UUID,
    quantity NUMERIC,
    unitCost NUMERIC
  ) LOOP
    INSERT INTO purchase_order_items (
      tenant_id, purchase_order_id, ingredient_id, quantity, unit_cost, total_cost
    )
    VALUES (
      p_tenant_id, v_po_id, v_item.ingredientId, v_item.quantity, v_item.unitCost, v_item.quantity * v_item.unitCost
    );
  END LOOP;

  RETURN v_po_id;
END;
$$ LANGUAGE plpgsql;
