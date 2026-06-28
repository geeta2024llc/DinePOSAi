import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase.js';
import { ApiResponse, OrderStatus } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Validation schema for creating an order
export const createOrderSchema = z.object({
  tableId: z.string().uuid().nullable().optional(),
  tableName: z.string().nullable().optional(),
  customerType: z.enum(['DINE_IN', 'TAKE_OUT', 'DELIVERY']),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().min(0),
  items: z.array(
    z.object({
      menuItemId: z.string().uuid().nullable().optional(),
      name: z.string().min(1),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
      notes: z.string().nullable().optional(),
    })
  ).min(1, 'Order must contain at least one item'),
});

// Validation schema for updating order status
export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'COOKING', 'READY', 'SERVED', 'CANCELLED']),
});

// 1. CREATE AN ORDER
export const createOrder = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;
  
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  let { tableId, tableName, customerType, subtotal, tax, discount, total, items } = req.body;

  try {
    // If tableId is missing but tableName is provided, resolve it
    if (!tableId && tableName) {
      const { data: existingTable } = await supabase
        .from('tables')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('name', tableName)
        .maybeSingle();

      if (existingTable) {
        tableId = existingTable.id;
      } else {
        const { data: newTable } = await supabase
          .from('tables')
          .insert({
            tenant_id: tenantId,
            name: tableName,
            status: 'OCCUPIED'
          })
          .select()
          .single();

        if (newTable) {
          tableId = newTable.id;
        }
      }
    }

    // A. Insert Order Record
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId,
        table_id: tableId || null,
        customer_type: customerType,
        status: 'PENDING',
        subtotal,
        tax,
        discount,
        total,
        created_by: userId || null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      return res.status(500).json({ success: false, error: `Failed to create order record: ${orderErr?.message}` });
    }

    // B. Insert Order Items
    const orderItemsPayload = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId || null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      status: 'PENDING',
      notes: item.notes || null,
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsErr) {
      // Clean up order record on failure (simulate transaction rollback)
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ success: false, error: `Failed to create order items: ${itemsErr.message}` });
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Order created successfully.',
        orderId: order.id,
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error processing order.' });
  }
};

// 2. GET ACTIVE ORDERS (For KDS and POS)
export const getActiveOrders = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    // Retrieve all active orders that are not fully served or cancelled
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, tables(name), order_items(*)')
      .eq('tenant_id', tenantId)
      .in('status', ['PENDING', 'ACCEPTED', 'COOKING', 'READY'])
      .order('created_at', { ascending: true });

    if (ordersErr) {
      return res.status(500).json({ success: false, error: ordersErr.message });
    }

    res.json({
      success: true,
      data: orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.id.substring(0, 8).toUpperCase(), // Short representation
        tableId: o.table_id,
        tableName: o.tables?.name || null,
        customerType: o.customer_type,
        status: o.status as OrderStatus,
        subtotal: parseFloat(o.subtotal),
        tax: parseFloat(o.tax),
        discount: parseFloat(o.discount),
        total: parseFloat(o.total),
        createdAt: o.created_at,
        items: o.order_items.map((i: any) => ({
          id: i.id,
          menuItemId: i.menu_item_id,
          name: i.name,
          quantity: i.quantity,
          price: parseFloat(i.price),
          status: i.status,
          notes: i.notes,
        })),
      })),
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching active orders.' });
  }
};

// 3. UPDATE ORDER STATUS (KDS cooking / ready / cashier complete status transitions)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  const { status } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !order) {
      return res.status(500).json({ success: false, error: `Failed to update order status: ${error?.message}` });
    }

    // Also update all items status to match the ready/cooking/served state if needed
    let itemStatus = 'PENDING';
    if (status === 'COOKING') itemStatus = 'COOKING';
    else if (status === 'READY') itemStatus = 'READY';
    else if (status === 'SERVED') itemStatus = 'SERVED';

    await supabase
      .from('order_items')
      .update({ status: itemStatus })
      .eq('order_id', id);

    res.json({
      success: true,
      data: {
        message: 'Order status updated successfully.',
        order: {
          id: order.id,
          status: order.status,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating order status.' });
  }
};
