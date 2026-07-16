import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createMenuItem } from '../controllers/menu.controller.js';
import { createOrder, getActiveOrders, updateOrderStatus } from '../controllers/order.controller.js';

// Define mutable mock results so we can change them per test
let mockCategoryResult = { data: { id: 'category-uuid-1234' } as any, error: null as any };
let mockMenuItemResult = { data: { id: 'menu-item-uuid-1234', name: 'Truffle Wagyu Ribeye', price: '185.00', description: 'Description', is_available: true } as any, error: null as any };
let mockTableResult = { data: { id: 'table-uuid-12' } as any, error: null as any };
let mockOrderResult = { data: { id: 'order-uuid-1234', status: 'PENDING' } as any, error: null as any };
let mockOrderItemsResult = { data: null as any, error: null as any };
let mockOrdersListResult = { data: [] as any[], error: null as any };

// Mock Supabase client using a fluent thenable builder
vi.mock('../utils/supabase.js', () => {
  const createMockBuilder = (table: string) => {
    const builder: any = {
      select: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      in: vi.fn(() => builder),
      order: vi.fn(() => builder),
      single: vi.fn(async () => {
        if (table === 'categories') return mockCategoryResult;
        if (table === 'menu_items') return mockMenuItemResult;
        if (table === 'tables') return mockTableResult;
        if (table === 'orders') return mockOrderResult;
        return { data: null, error: null };
      }),
      maybeSingle: vi.fn(async () => {
        if (table === 'tables') return mockTableResult;
        if (table === 'orders') return mockOrderResult;
        return { data: null, error: null };
      }),
      then: vi.fn((onfulfilled) => {
        let result: any = { data: null, error: null };
        if (table === 'order_items') result = mockOrderItemsResult;
        if (table === 'orders') result = mockOrdersListResult;
        return Promise.resolve(onfulfilled(result));
      })
    };
    return builder;
  };

  const client = {
    from: vi.fn((table) => createMockBuilder(table)),
    rpc: vi.fn(async (fn, args) => {
      if (fn === 'place_order_transaction') {
        return { data: mockOrderResult.data?.id || 'order-uuid-1234', error: null };
      }
      return { data: null, error: null };
    }),
  };

  return { supabase: client };
});

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Order Flow End-to-End Integration Verification', () => {
  const tenantId = 'tenant-uuid-1234';
  const categoryId = 'category-uuid-1234';
  const menuItemId = 'menu-item-uuid-1234';
  const orderId = 'order-uuid-1234';

  beforeEach(() => {
    // Reset mock results
    mockCategoryResult = { data: { id: categoryId }, error: null };
    mockMenuItemResult = { data: { id: menuItemId, name: 'Truffle Wagyu Ribeye', price: '185.00', description: 'Description', is_available: true }, error: null };
    mockTableResult = { data: { id: 'table-uuid-12' }, error: null };
    mockOrderResult = { data: { id: orderId, tenant_id: tenantId, table_id: 'table-uuid-12', customer_type: 'DINE_IN', status: 'PENDING', subtotal: '185.00', tax: '18.50', discount: '0.00', total: '203.50' }, error: null };
    mockOrderItemsResult = { data: null, error: null };
    mockOrdersListResult = { data: [], error: null };
  });

  describe('1. Admin Owner uploads a dish', () => {
    it('should successfully upload/create a new dish', async () => {
      const req = {
        user: { id: 'admin-uuid', tenantId, role: 'MANAGER', email: 'admin@dinepos.ai' },
        body: {
          categoryId,
          name: 'Truffle Wagyu Ribeye',
          description: 'A5 Miyazaki Wagyu ribeye seared over binchotan charcoal with fresh winter truffles.',
          price: 185,
          imageUrl: 'https://example.com/images/wagyu.png'
        }
      } as unknown as AuthenticatedRequest;

      const res = mockResponse();

      await createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            message: 'Menu item created successfully.',
            item: expect.objectContaining({
              id: menuItemId,
              name: 'Truffle Wagyu Ribeye',
              price: 185
            })
          })
        })
      );
    });
  });

  describe('2. Customer places a self-service order', () => {
    it('should successfully place a self-service order', async () => {
      const req = {
        user: { id: 'customer-uuid', tenantId, role: 'CASHIER', email: 'customer@dinepos.ai' },
        body: {
          tableId: null,
          tableName: 'Table 12',
          customerType: 'DINE_IN',
          subtotal: 185,
          tax: 18.5,
          discount: 0,
          total: 203.5,
          items: [
            {
              menuItemId,
              name: 'Truffle Wagyu Ribeye',
              quantity: 1,
              price: 185,
              notes: 'Medium Rare'
            }
          ]
        }
      } as unknown as AuthenticatedRequest;

      const res = mockResponse();

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            message: 'Order created successfully.',
            orderId: orderId
          })
        })
      );
    });
  });

  describe('3. Waiter places a guest order', () => {
    it('should successfully place an order on behalf of guests', async () => {
      const req = {
        user: { id: 'waiter-uuid', tenantId, role: 'CASHIER', email: 'waiter@dinepos.ai' },
        body: {
          tableId: null,
          tableName: 'Table 05',
          customerType: 'DINE_IN',
          subtotal: 185,
          tax: 18.5,
          discount: 0,
          total: 203.5,
          items: [
            {
              menuItemId,
              name: 'Truffle Wagyu Ribeye',
              quantity: 1,
              price: 185,
              notes: 'Medium'
            }
          ]
        }
      } as unknown as AuthenticatedRequest;

      const res = mockResponse();

      mockTableResult = { data: { id: 'table-uuid-05' }, error: null };
      mockOrderResult = { data: { id: 'order-uuid-5678', tenant_id: tenantId, table_id: 'table-uuid-05', customer_type: 'DINE_IN', status: 'PENDING', subtotal: '185.00', tax: '18.50', discount: '0.00', total: '203.50' }, error: null };

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            orderId: 'order-uuid-5678'
          })
        })
      );
    });
  });

  describe('4. KDS gets active orders', () => {
    it('should retrieve all pending and active KDS tickets', async () => {
      const req = {
        user: { id: 'kds-uuid', tenantId, role: 'KITCHEN', email: 'kds@dinepos.ai' }
      } as unknown as AuthenticatedRequest;

      const res = mockResponse();

      const dbOrdersMock = [
        {
          id: orderId,
          customer_type: 'DINE_IN',
          status: 'PENDING',
          subtotal: '185.00',
          tax: '18.50',
          discount: '0.00',
          total: '203.50',
          created_at: new Date().toISOString(),
          tables: { name: 'Table 12' },
          order_items: [
            {
              id: 'item-1',
              menu_item_id: menuItemId,
              name: 'Truffle Wagyu Ribeye',
              quantity: 1,
              price: '185.00',
              status: 'PENDING',
              notes: 'Medium Rare'
            }
          ]
        }
      ];

      mockOrdersListResult = { data: dbOrdersMock, error: null };

      await getActiveOrders(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: orderId,
              tableName: 'Table 12',
              status: 'PENDING',
              items: expect.arrayContaining([
                expect.objectContaining({
                  name: 'Truffle Wagyu Ribeye',
                  quantity: 1,
                  notes: 'Medium Rare'
                })
              ])
            })
          ])
        })
      );
    });
  });

  describe('5. KDS transitions order status', () => {
    it('should transition order from PENDING to COOKING', async () => {
      const req = {
        user: { id: 'kds-uuid', tenantId, role: 'KITCHEN', email: 'kds@dinepos.ai' },
        params: { id: orderId },
        body: { status: 'COOKING' }
      } as unknown as AuthenticatedRequest;

      const res = mockResponse();

      mockOrderResult = { data: { id: orderId, status: 'COOKING' }, error: null };

      await updateOrderStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            message: 'Order status updated successfully.',
            order: expect.objectContaining({
              id: orderId,
              status: 'COOKING'
            })
          })
        })
      );
    });
  });
});
