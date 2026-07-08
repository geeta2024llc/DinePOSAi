import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  sku: z.string().nullable().optional(),
  unit: z.string().min(1, 'Unit is required'),
  costPerUnit: z.number().min(0, 'Cost cannot be negative'),
  stockLevel: z.number().min(0, 'Initial stock cannot be negative').default(0),
  minStockLevel: z.number().min(0, 'Reorder level cannot be negative').default(0),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().nullable().optional(),
  unit: z.string().min(1).optional(),
  costPerUnit: z.number().min(0).optional(),
  stockLevel: z.number().min(0).optional(),
  minStockLevel: z.number().min(0).optional(),
});

export const recipeItemInputSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z.number().positive('Quantity must be greater than zero'),
});

export const saveRecipeSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  itemVariantId: z.string().uuid('Invalid variant ID').nullable().optional(),
  ingredients: z.array(recipeItemInputSchema),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactName: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').nullable().or(z.literal('')).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').optional(),
  contactName: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').nullable().or(z.literal('')).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export const createPoItemSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z.number().positive('Quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID').nullable().optional(),
  items: z.array(createPoItemSchema).min(1, 'Purchase order must have at least one item'),
});

export const recordWasteSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z.number().positive('Quantity must be positive'),
  reason: z.enum(['SPOILAGE', 'ACCIDENT', 'EXPIRED', 'QUALITY_CONTROL']),
  notes: z.string().nullable().optional(),
});

// ==========================================
// 1. INVENTORY ITEMS (INGREDIENTS) CRUD
// ==========================================

export const getInventoryItems = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  const { limit, offset } = req.query;

  try {
    let query = supabase
      .from('inventory_items')
      .select('*')
      .eq('tenant_id', tenantId);

    if (limit !== undefined && offset !== undefined) {
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    }

    const { data: items, error } = await query.order('name', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: items.map(item => ({
        id: item.id,
        tenantId: item.tenant_id,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        costPerUnit: parseFloat(item.cost_per_unit),
        stockLevel: parseFloat(item.stock_level),
        minStockLevel: parseFloat(item.min_stock_level),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching inventory items.' });
  }
};

export const createInventoryItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { name, sku, unit, costPerUnit, stockLevel, minStockLevel } = req.body;

    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert({
        tenant_id: tenantId,
        name,
        sku: sku || null,
        unit,
        cost_per_unit: costPerUnit,
        stock_level: stockLevel,
        min_stock_level: minStockLevel
      })
      .select()
      .single();

    if (error || !item) {
      return res.status(500).json({ success: false, error: `Failed to create item: ${error?.message}` });
    }

    // Also write a transaction log if initial stock is > 0
    if (stockLevel > 0) {
      await supabase.from('inventory_transactions').insert({
        tenant_id: tenantId,
        ingredient_id: item.id,
        type: 'MANUAL_ADJUSTMENT',
        quantity: stockLevel,
        notes: 'Initial stock setup',
        created_by: req.user?.id || null
      });
    }

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error creating inventory item.' });
  }
};

export const updateInventoryItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const body = req.body;

    // Retrieve old item first to calculate manual adjustment if stockLevel changed directly
    const { data: oldItem } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!oldItem) {
      return res.status(404).json({ success: false, error: 'Inventory item not found.' });
    }

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({
        name: body.name,
        sku: body.sku,
        unit: body.unit,
        cost_per_unit: body.costPerUnit,
        stock_level: body.stockLevel,
        min_stock_level: body.minStockLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !item) {
      return res.status(500).json({ success: false, error: `Failed to update item: ${error?.message}` });
    }

    // Log transaction if stock level changed manually
    if (body.stockLevel !== undefined && parseFloat(oldItem.stock_level) !== body.stockLevel) {
      const diff = body.stockLevel - parseFloat(oldItem.stock_level);
      await supabase.from('inventory_transactions').insert({
        tenant_id: tenantId,
        ingredient_id: item.id,
        type: 'MANUAL_ADJUSTMENT',
        quantity: diff,
        notes: 'Manual adjustment via inventory editor',
        created_by: req.user?.id || null
      });
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating inventory item.' });
  }
};

export const deleteInventoryItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data: { message: 'Item deleted successfully.' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error deleting inventory item.' });
  }
};

// ==========================================
// 2. RECIPES CONFIGURATION
// ==========================================

export const getMenuItemRecipes = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { menuItemId } = req.query;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    let query = supabase
      .from('menu_item_recipes')
      .select('*, inventory_items(name, unit)')
      .eq('tenant_id', tenantId);

    if (menuItemId) {
      query = query.eq('menu_item_id', menuItemId);
    }

    const { data: recipes, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: recipes.map(r => ({
        id: r.id,
        menuItemId: r.menu_item_id,
        itemVariantId: r.item_variant_id,
        ingredientId: r.ingredient_id,
        ingredientName: r.inventory_items?.name,
        ingredientUnit: r.inventory_items?.unit,
        quantity: parseFloat(r.quantity),
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching recipes.' });
  }
};

export const saveMenuItemRecipe = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { menuItemId, itemVariantId, ingredients } = req.body;

    // Verify menu item belongs to tenant
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', menuItemId)
      .eq('tenant_id', tenantId)
      .single();

    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found.' });
    }

    // Delete old recipe elements
    let deleteQuery = supabase
      .from('menu_item_recipes')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('menu_item_id', menuItemId);

    if (itemVariantId) {
      deleteQuery = deleteQuery.eq('item_variant_id', itemVariantId);
    } else {
      deleteQuery = deleteQuery.is('item_variant_id', null);
    }
    
    await deleteQuery;

    // Insert new recipe elements
    if (ingredients.length > 0) {
      const recipeRows = ingredients.map((ing: any) => ({
        tenant_id: tenantId,
        menu_item_id: menuItemId,
        item_variant_id: itemVariantId || null,
        ingredient_id: ing.ingredientId,
        quantity: ing.quantity
      }));

      const { error: insertErr } = await supabase
        .from('menu_item_recipes')
        .insert(recipeRows);

      if (insertErr) {
        return res.status(500).json({ success: false, error: `Failed to insert recipe: ${insertErr.message}` });
      }
    }

    res.json({ success: true, data: { message: 'Recipe saved successfully.' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error saving recipe.' });
  }
};

// ==========================================
// 3. SUPPLIERS CRUD
// ==========================================

export const getSuppliers = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  const { limit, offset } = req.query;

  try {
    let query = supabase
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tenantId);

    if (limit !== undefined && offset !== undefined) {
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    }

    const { data: suppliers, error } = await query.order('name', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching suppliers.' });
  }
};

export const createSupplier = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { name, contactName, email, phone, address } = req.body;
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert({
        tenant_id: tenantId,
        name,
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        address: address || null
      })
      .select()
      .single();

    if (error || !supplier) {
      return res.status(500).json({ success: false, error: `Failed to create supplier: ${error?.message}` });
    }
    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error creating supplier.' });
  }
};

export const updateSupplier = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { name, contactName, email, phone, address } = req.body;
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({
        name,
        contact_name: contactName,
        email: email || null,
        phone,
        address,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !supplier) {
      return res.status(500).json({ success: false, error: `Failed to update supplier: ${error?.message}` });
    }
    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating supplier.' });
  }
};

export const deleteSupplier = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data: { message: 'Supplier deleted.' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error deleting supplier.' });
  }
};

// ==========================================
// 4. PURCHASE ORDERS
// ==========================================

export const getPurchaseOrders = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  const { limit, offset } = req.query;

  try {
    let query = supabase
      .from('purchase_orders')
      .select('*, suppliers(name)')
      .eq('tenant_id', tenantId);

    if (limit !== undefined && offset !== undefined) {
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: orders.map(o => ({
        id: o.id,
        supplierId: o.supplier_id,
        supplierName: o.suppliers?.name || 'Unknown',
        status: o.status,
        totalCost: parseFloat(o.total_cost),
        orderedAt: o.ordered_at,
        receivedAt: o.received_at,
        createdAt: o.created_at
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching purchase orders.' });
  }
};

export const createPurchaseOrder = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { supplierId, items } = req.body;

    // Calculate total cost
    const totalCost = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitCost), 0);

    // Call DB RPC Transaction
    const { data: poId, error: poErr } = await supabase
      .rpc('create_purchase_order_transaction', {
        p_tenant_id: tenantId,
        p_supplier_id: supplierId || null,
        p_total_cost: totalCost,
        p_created_by: req.user?.id || null,
        p_items: items
      });

    if (poErr || !poId) {
      return res.status(500).json({ success: false, error: `Failed to create purchase order transaction: ${poErr?.message}` });
    }

    // Fetch the inserted PO details to return to the client
    const { data: po, error: fetchErr } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', poId)
      .single();

    if (fetchErr) {
      return res.status(500).json({ success: false, error: `Failed to retrieve created purchase order: ${fetchErr.message}` });
    }

    res.status(201).json({ success: true, data: po });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error creating purchase order.' });
  }
};

export const receivePurchaseOrder = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    // 1. Fetch PO to verify pending status
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!po) return res.status(404).json({ success: false, error: 'Purchase order not found.' });
    if (po.status === 'RECEIVED') return res.status(400).json({ success: false, error: 'Purchase order is already received.' });
    if (po.status === 'CANCELLED') return res.status(400).json({ success: false, error: 'Cannot receive a cancelled purchase order.' });

    // 2. Fetch PO items
    const { data: items, error: itemsErr } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', id);

    if (itemsErr || !items) {
      return res.status(500).json({ success: false, error: 'Failed to retrieve purchase order items.' });
    }

    // 3. Mark PO as received
    await supabase
      .from('purchase_orders')
      .update({
        status: 'RECEIVED',
        received_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // 4. Update ingredient stocks and record transactions
    for (const item of items) {
      // Fetch current stock
      const { data: ing } = await supabase
        .from('inventory_items')
        .select('stock_level')
        .eq('id', item.ingredient_id)
        .single();

      if (ing) {
        const newStock = parseFloat(ing.stock_level) + parseFloat(item.quantity);
        
        // Update stock level
        await supabase
          .from('inventory_items')
          .update({ stock_level: newStock })
          .eq('id', item.ingredient_id);

        // Insert Transaction Log
        await supabase
          .from('inventory_transactions')
          .insert({
            tenant_id: tenantId,
            ingredient_id: item.ingredient_id,
            type: 'PURCHASE',
            quantity: item.quantity,
            reference_id: id,
            notes: `Purchase Order Restock (PO Ref: ${id})`,
            created_by: req.user?.id || null
          });
      }
    }

    res.json({ success: true, data: { message: 'Purchase order marked as RECEIVED. Inventory stock updated.' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error receiving purchase order.' });
  }
};

export const cancelPurchaseOrder = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!po) return res.status(404).json({ success: false, error: 'Purchase order not found.' });
    if (po.status === 'RECEIVED') return res.status(400).json({ success: false, error: 'Cannot cancel a received purchase order.' });

    await supabase
      .from('purchase_orders')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    res.json({ success: true, data: { message: 'Purchase order status updated to CANCELLED.' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error cancelling purchase order.' });
  }
};

// ==========================================
// 5. WASTE LOGGING
// ==========================================

export const getWasteLogs = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  const { limit, offset } = req.query;

  try {
    let query = supabase
      .from('waste_logs')
      .select('*, inventory_items(name, unit)')
      .eq('tenant_id', tenantId);

    if (limit !== undefined && offset !== undefined) {
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    }

    const { data: logs, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: logs.map(l => ({
        id: l.id,
        ingredientId: l.ingredient_id,
        ingredientName: l.inventory_items?.name || 'Unknown',
        ingredientUnit: l.inventory_items?.unit || '',
        quantity: parseFloat(l.quantity),
        reason: l.reason,
        notes: l.notes,
        createdAt: l.created_at
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching waste logs.' });
  }
};

export const recordWaste = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { ingredientId, quantity, reason, notes } = req.body;

    // Verify ingredient exists
    const { data: ing } = await supabase
      .from('inventory_items')
      .select('stock_level')
      .eq('id', ingredientId)
      .eq('tenant_id', tenantId)
      .single();

    if (!ing) return res.status(404).json({ success: false, error: 'Inventory ingredient not found.' });

    // Record Waste Log
    const { data: log, error: logErr } = await supabase
      .from('waste_logs')
      .insert({
        tenant_id: tenantId,
        ingredient_id: ingredientId,
        quantity,
        reason,
        notes: notes || null,
        reported_by: req.user?.id || null
      })
      .select()
      .single();

    if (logErr || !log) {
      return res.status(500).json({ success: false, error: `Failed to create waste log: ${logErr?.message}` });
    }

    // Deduct stock quantity
    const newStock = Math.max(0, parseFloat(ing.stock_level) - quantity);
    await supabase
      .from('inventory_items')
      .update({ stock_level: newStock })
      .eq('id', ingredientId);

    // Record inventory transaction
    await supabase
      .from('inventory_transactions')
      .insert({
        tenant_id: tenantId,
        ingredient_id: ingredientId,
        type: 'WASTE',
        quantity: -quantity, // negative representing reduction
        reference_id: log.id,
        notes: `Food Waste recorded: ${reason}. Notes: ${notes || 'none'}`,
        created_by: req.user?.id || null
      });

    res.status(201).json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error recording food waste.' });
  }
};

// ==========================================
// 6. STOCK TRANSACTION HISTORIC LEDGER
// ==========================================

export const getInventoryTransactions = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  const { limit, offset } = req.query;

  try {
    let query = supabase
      .from('inventory_transactions')
      .select('*, inventory_items(name, unit)')
      .eq('tenant_id', tenantId);

    if (limit !== undefined && offset !== undefined) {
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    }

    const { data: txs, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: txs.map(t => ({
        id: t.id,
        ingredientId: t.ingredient_id,
        ingredientName: t.inventory_items?.name || 'Unknown',
        ingredientUnit: t.inventory_items?.unit || '',
        type: t.type,
        quantity: parseFloat(t.quantity),
        notes: t.notes,
        createdAt: t.created_at
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching stock ledger.' });
  }
};
