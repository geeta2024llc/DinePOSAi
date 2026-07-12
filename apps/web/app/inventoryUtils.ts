// ============================================================
// DinePosAI - Inventory API Client (Real Backend)
// ============================================================

import {
  InventoryItem,
  MenuItemRecipe,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  WasteLog,
  InventoryTransaction,
  WasteReason,
  InventoryTransactionType
} from '@dineposai/shared-types';
import { apiRequest, isDemoTenant } from '@/utils/api';

// ==========================================
// CORE ACCESSORS (Real API Calls)
// ==========================================

export const getIngredients = async (): Promise<InventoryItem[]> => {
  const res = await apiRequest<InventoryItem[]>('/api/inventory/items');
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  // Fallback for offline/demo: return empty for real tenants
  if (!isDemoTenant()) return [];
  return [];
};

export const saveIngredients = async (data: InventoryItem[]): Promise<void> => {
  // No bulk save — individual CRUD operations handled by specific handlers
};

export const getRecipes = async (): Promise<MenuItemRecipe[]> => {
  const res = await apiRequest<MenuItemRecipe[]>('/api/inventory/recipes');
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  if (!isDemoTenant()) return [];
  return [];
};

export const saveRecipes = async (data: MenuItemRecipe[]): Promise<void> => {
  // Recipes are saved via saveMenuItemRecipe API
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await apiRequest<Supplier[]>('/api/inventory/suppliers');
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  if (!isDemoTenant()) return [];
  return [];
};

export const saveSuppliers = async (data: Supplier[]): Promise<void> => {
  // No bulk save — individual CRUD operations handled by specific handlers
};

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const res = await apiRequest<PurchaseOrder[]>('/api/inventory/purchase-orders');
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  if (!isDemoTenant()) return [];
  return [];
};

export const savePurchaseOrders = async (data: PurchaseOrder[]): Promise<void> => {
  // No bulk save — individual CRUD operations handled by specific handlers
};

export const getPurchaseOrderItems = async (): Promise<PurchaseOrderItem[]> => {
  // PO items are fetched inline with purchase orders from the API
  // This is kept for backward compatibility but returns empty
  return [];
};

export const savePurchaseOrderItems = async (data: PurchaseOrderItem[]): Promise<void> => {
  // PO items are created via the create purchase order API
};

export const getWasteLogs = async (): Promise<WasteLog[]> => {
  const res = await apiRequest<WasteLog[]>('/api/inventory/waste');
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  if (!isDemoTenant()) return [];
  return [];
};

export const saveWasteLogs = async (data: WasteLog[]): Promise<void> => {
  // Waste logs are created via the record waste API
};

export const getTransactions = async (): Promise<InventoryTransaction[]> => {
  const res = await apiRequest<InventoryTransaction[]>('/api/inventory/transactions');
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  if (!isDemoTenant()) return [];
  return [];
};

export const saveTransactions = async (data: InventoryTransaction[]): Promise<void> => {
  // Transactions are created automatically by the backend
};

// ==========================================
// CRUD OPERATIONS (Individual API Calls)
// ==========================================

export const createIngredient = async (item: Omit<InventoryItem, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> => {
  const res = await apiRequest<InventoryItem>('/api/inventory/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return res.success ? res.data! : null;
};

export const updateIngredient = async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem | null> => {
  const res = await apiRequest<InventoryItem>(`/api/inventory/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
  return res.success ? res.data! : null;
};

export const deleteIngredient = async (id: string): Promise<boolean> => {
  const res = await apiRequest(`/api/inventory/items/${id}`, { method: 'DELETE' });
  return res.success;
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Supplier | null> => {
  const res = await apiRequest<Supplier>('/api/inventory/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  });
  return res.success ? res.data! : null;
};

export const updateSupplierApi = async (id: string, supplier: Partial<Supplier>): Promise<Supplier | null> => {
  const res = await apiRequest<Supplier>(`/api/inventory/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplier),
  });
  return res.success ? res.data! : null;
};

export const deleteSupplierApi = async (id: string): Promise<boolean> => {
  const res = await apiRequest(`/api/inventory/suppliers/${id}`, { method: 'DELETE' });
  return res.success;
};

export const createPurchaseOrderApi = async (supplierId: string | null, items: { ingredientId: string; quantity: number; unitCost: number }[]): Promise<PurchaseOrder | null> => {
  const res = await apiRequest<PurchaseOrder>('/api/inventory/purchase-orders', {
    method: 'POST',
    body: JSON.stringify({ supplierId, items }),
  });
  return res.success ? res.data! : null;
};

export const receivePurchaseOrderApi = async (poId: string): Promise<boolean> => {
  const res = await apiRequest(`/api/inventory/purchase-orders/${poId}/receive`, { method: 'PUT' });
  return res.success;
};

export const cancelPurchaseOrderApi = async (poId: string): Promise<boolean> => {
  const res = await apiRequest(`/api/inventory/purchase-orders/${poId}/cancel`, { method: 'PUT' });
  return res.success;
};

export const recordWasteApi = async (ingredientId: string, quantity: number, reason: WasteReason, notes: string | null): Promise<WasteLog | null> => {
  const res = await apiRequest<WasteLog>('/api/inventory/waste', {
    method: 'POST',
    body: JSON.stringify({ ingredientId, quantity, reason, notes }),
  });
  return res.success ? res.data! : null;
};

export const saveMenuItemRecipeApi = async (menuItemId: string, itemVariantId: string | null, ingredients: { ingredientId: string; quantity: number }[]): Promise<boolean> => {
  const res = await apiRequest('/api/inventory/recipes', {
    method: 'POST',
    body: JSON.stringify({ menuItemId, itemVariantId, ingredients }),
  });
  return res.success;
};

// ==========================================
// BUSINESS OPERATIONS (via API)
// ==========================================

/**
 * Deducts ingredient stock when a POS/Menu order is completed.
 * Currently operates on local state — will be moved to backend order flow.
 */
export const deductStockForOrder = async (orderItems: { name: string; qty: number }[]) => {
  // This operation is handled by the order completion flow on the backend
  // For now, trigger a reload event so the UI refreshes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dinepos_inventory_update'));
  }
};

/**
 * Marks a purchase order as RECEIVED via API.
 */
export const receivePurchaseOrder = async (poId: string, operatorName: string): Promise<boolean> => {
  return receivePurchaseOrderApi(poId);
};

/**
 * Logs a food waste event via API.
 */
export const recordWaste = async (ingredientId: string, qty: number, reason: WasteReason, notes: string, reporter: string): Promise<boolean> => {
  const log = await recordWasteApi(ingredientId, qty, reason, notes);
  return log !== null;
};

/**
 * Manually adjusts stock levels via API (update inventory item).
 */
export const manuallyAdjustStock = async (ingredientId: string, newQty: number, notes: string, operator: string): Promise<boolean> => {
  const res = await apiRequest(`/api/inventory/items/${ingredientId}`, {
    method: 'PUT',
    body: JSON.stringify({ stockLevel: newQty }),
  });
  if (res.success) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dinepos_inventory_update'));
    }
  }
  return res.success;
};
