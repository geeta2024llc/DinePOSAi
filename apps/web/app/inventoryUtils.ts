// ============================================================
// DinePosAI - Local Storage Inventory Utility (Offline-First)
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

// ==========================================
// DEFAULT SEED DATA
// ==========================================

export const defaultIngredients: InventoryItem[] = [
  { id: 'ing-1', tenantId: 'tenant-demo', name: 'Gold Leaf Sheets', sku: 'ING-GLD-01', unit: 'pcs', costPerUnit: 1.50, stockLevel: 120, minStockLevel: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-2', tenantId: 'tenant-demo', name: 'Japanese A5 Miyazaki Wagyu', sku: 'ING-WAG-02', unit: 'kg', costPerUnit: 140.00, stockLevel: 18.5, minStockLevel: 5.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-3', tenantId: 'tenant-demo', name: 'Kumamoto Oysters', sku: 'ING-OYS-03', unit: 'pcs', costPerUnit: 3.50, stockLevel: 72, minStockLevel: 24, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-4', tenantId: 'tenant-demo', name: 'Beluga Caviar', sku: 'ING-CAV-04', unit: 'g', costPerUnit: 8.50, stockLevel: 450, minStockLevel: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-5', tenantId: 'tenant-demo', name: 'Truffle Glaze', sku: 'ING-TRF-05', unit: 'liter', costPerUnit: 60.00, stockLevel: 3.2, minStockLevel: 1.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-6', tenantId: 'tenant-demo', name: 'Champagne Mignonette', sku: 'ING-MIG-06', unit: 'liter', costPerUnit: 14.00, stockLevel: 2.0, minStockLevel: 0.5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-7', tenantId: 'tenant-demo', name: 'USDA Prime Filet Mignon', sku: 'ING-FIL-07', unit: 'kg', costPerUnit: 45.00, stockLevel: 12.0, minStockLevel: 4.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-8', tenantId: 'tenant-demo', name: 'Valrhona Dark Chocolate', sku: 'ING-CHO-08', unit: 'kg', costPerUnit: 18.00, stockLevel: 6.5, minStockLevel: 2.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-9', tenantId: 'tenant-demo', name: 'Tahitian Vanilla Beans', sku: 'ING-VAN-09', unit: 'pcs', costPerUnit: 5.00, stockLevel: 45, minStockLevel: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ing-10', tenantId: 'tenant-demo', name: 'Rare 12-Year Bourbon', sku: 'ING-BRB-10', unit: 'liter', costPerUnit: 75.00, stockLevel: 4.0, minStockLevel: 2.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export const defaultRecipes: MenuItemRecipe[] = [
  // Gold Leaf A5 Wagyu Ribeye (spec-1)
  { id: 'rec-1', tenantId: 'tenant-demo', menuItemId: 'spec-1', itemVariantId: null, ingredientId: 'ing-2', quantity: 0.300, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-2', tenantId: 'tenant-demo', menuItemId: 'spec-1', itemVariantId: null, ingredientId: 'ing-5', quantity: 0.050, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-3', tenantId: 'tenant-demo', menuItemId: 'spec-1', itemVariantId: null, ingredientId: 'ing-1', quantity: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // Beluga Caviar & Oysters (spec-2)
  { id: 'rec-4', tenantId: 'tenant-demo', menuItemId: 'spec-2', itemVariantId: null, ingredientId: 'ing-3', quantity: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-5', tenantId: 'tenant-demo', menuItemId: 'spec-2', itemVariantId: null, ingredientId: 'ing-4', quantity: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-6', tenantId: 'tenant-demo', menuItemId: 'spec-2', itemVariantId: null, ingredientId: 'ing-6', quantity: 0.020, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Truffle Glazed Filet Mignon (main-3)
  { id: 'rec-7', tenantId: 'tenant-demo', menuItemId: 'main-3', itemVariantId: null, ingredientId: 'ing-7', quantity: 0.225, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-8', tenantId: 'tenant-demo', menuItemId: 'main-3', itemVariantId: null, ingredientId: 'ing-5', quantity: 0.040, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Chocolate Souffle (dess-1)
  { id: 'rec-9', tenantId: 'tenant-demo', menuItemId: 'dess-1', itemVariantId: null, ingredientId: 'ing-8', quantity: 0.120, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-10', tenantId: 'tenant-demo', menuItemId: 'dess-1', itemVariantId: null, ingredientId: 'ing-9', quantity: 0.5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Royal Gold Old Fashioned (drink-1)
  { id: 'rec-11', tenantId: 'tenant-demo', menuItemId: 'drink-1', itemVariantId: null, ingredientId: 'ing-10', quantity: 0.060, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-12', tenantId: 'tenant-demo', menuItemId: 'drink-1', itemVariantId: null, ingredientId: 'ing-1', quantity: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export const defaultSuppliers: Supplier[] = [
  { id: 'sup-1', tenantId: 'tenant-demo', name: 'Miyazaki Farms Prefectural', contactName: 'Kenji Sato', email: 'kenji@miyazakifarms.jp', phone: '+81-90-1111-2222', address: 'Miyazaki, Japan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sup-2', tenantId: 'tenant-demo', name: 'Tsukiji Toyosu Seafood LLC', contactName: 'Hiroshi Tanaka', email: 'tanaka@toyosuseafood.co.jp', phone: '+81-80-3333-4444', address: 'Koto-ku, Tokyo, Japan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sup-3', tenantId: 'tenant-demo', name: 'Tokyo Elite Gourmet Imports', contactName: 'Yuki Mori', email: 'mori@tokyogourmet.jp', phone: '+81-70-5555-6666', address: 'Minato-ku, Tokyo, Japan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

// Seed some sample closed purchase orders and one pending PO
export const defaultPurchaseOrders: PurchaseOrder[] = [
  { id: 'po-1', tenantId: 'tenant-demo', supplierId: 'sup-1', status: 'RECEIVED', totalCost: 1400.00, orderedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'admin', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'po-2', tenantId: 'tenant-demo', supplierId: 'sup-3', status: 'PENDING', totalCost: 170.00, orderedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), receivedAt: null, createdBy: 'admin', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

export const defaultPurchaseOrderItems: PurchaseOrderItem[] = [
  { id: 'poi-1', tenantId: 'tenant-demo', purchaseOrderId: 'po-1', ingredientId: 'ing-2', quantity: 10, unitCost: 140.00, totalCost: 1400.00 },
  { id: 'poi-2', tenantId: 'tenant-demo', purchaseOrderId: 'po-2', ingredientId: 'ing-5', quantity: 2, unitCost: 60.00, totalCost: 120.00 },
  { id: 'poi-3', tenantId: 'tenant-demo', purchaseOrderId: 'po-2', ingredientId: 'ing-9', quantity: 10, unitCost: 5.00, totalCost: 50.00 }
];

export const defaultWasteLogs: WasteLog[] = [
  { id: 'waste-1', tenantId: 'tenant-demo', ingredientId: 'ing-3', quantity: 6, reason: 'QUALITY_CONTROL', notes: 'Discarded due to shell cracks on inspection', reportedBy: 'Kitchen Staff', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'waste-2', tenantId: 'tenant-demo', ingredientId: 'ing-2', quantity: 0.4, reason: 'SPOILAGE', notes: 'Trimming spoilage during butchery prep', reportedBy: 'Kitchen Staff', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

export const defaultTransactions: InventoryTransaction[] = [
  // Setup transaction history
  ...defaultIngredients.map((ing, i) => ({
    id: `tx-init-${ing.id}`,
    tenantId: 'tenant-demo',
    ingredientId: ing.id,
    type: 'MANUAL_ADJUSTMENT' as const,
    quantity: ing.stockLevel,
    referenceId: null,
    notes: 'Initial seed stock',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  })),
  { id: 'tx-po-1', tenantId: 'tenant-demo', ingredientId: 'ing-2', type: 'PURCHASE', quantity: 10, referenceId: 'po-1', notes: 'Received PO-1 Miyazaki Farms restock', createdBy: 'admin', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tx-waste-1', tenantId: 'tenant-demo', ingredientId: 'ing-3', type: 'WASTE', quantity: -6, referenceId: 'waste-1', notes: 'Food waste logged: QUALITY_CONTROL', createdBy: 'kitchen', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tx-waste-2', tenantId: 'tenant-demo', ingredientId: 'ing-2', type: 'WASTE', quantity: -0.4, referenceId: 'waste-2', notes: 'Food waste logged: SPOILAGE', createdBy: 'kitchen', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

// ==========================================
// CORE ACCESSORS
// ==========================================

const getFromStorage = <T>(key: string, defaults: T[]): T[] => {
  if (typeof window === 'undefined') return defaults;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaults;
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const getIngredients = (): InventoryItem[] => getFromStorage('dinepos_inventory_ingredients', defaultIngredients);
export const saveIngredients = (data: InventoryItem[]): void => saveToStorage('dinepos_inventory_ingredients', data);

export const getRecipes = (): MenuItemRecipe[] => getFromStorage('dinepos_inventory_recipes', defaultRecipes);
export const saveRecipes = (data: MenuItemRecipe[]): void => saveToStorage('dinepos_inventory_recipes', data);

export const getSuppliers = (): Supplier[] => getFromStorage('dinepos_inventory_suppliers', defaultSuppliers);
export const saveSuppliers = (data: Supplier[]): void => saveToStorage('dinepos_inventory_suppliers', data);

export const getPurchaseOrders = (): PurchaseOrder[] => getFromStorage('dinepos_inventory_purchase_orders', defaultPurchaseOrders);
export const savePurchaseOrders = (data: PurchaseOrder[]): void => saveToStorage('dinepos_inventory_purchase_orders', data);

export const getPurchaseOrderItems = (): PurchaseOrderItem[] => getFromStorage('dinepos_inventory_purchase_order_items', defaultPurchaseOrderItems);
export const savePurchaseOrderItems = (data: PurchaseOrderItem[]): void => saveToStorage('dinepos_inventory_purchase_order_items', data);

export const getWasteLogs = (): WasteLog[] => getFromStorage('dinepos_inventory_waste', defaultWasteLogs);
export const saveWasteLogs = (data: WasteLog[]): void => saveToStorage('dinepos_inventory_waste', data);

export const getTransactions = (): InventoryTransaction[] => getFromStorage('dinepos_inventory_transactions', defaultTransactions);
export const saveTransactions = (data: InventoryTransaction[]): void => saveToStorage('dinepos_inventory_transactions', data);

// ==========================================
// BUSINESS OPERATIONS
// ==========================================

/**
 * Deducts ingredient stock when a POS/Menu order is completed.
 */
export const deductStockForOrder = (orderItems: { name: string; qty: number }[]) => {
  const ingredients = getIngredients();
  const recipes = getRecipes();
  const transactions = getTransactions();
  
  // Load menu items registry from localStorage to translate name -> id
  let menuItems: { id: string; name: string }[] = [];
  if (typeof window !== 'undefined') {
    const savedMenu = localStorage.getItem('dinepos_menu_items');
    if (savedMenu) {
      try { menuItems = JSON.parse(savedMenu); } catch (e) {}
    }
  }

  let deductionCount = 0;
  const newTransactions: InventoryTransaction[] = [];

  for (const oItem of orderItems) {
    // 1. Resolve MenuItem ID from its name
    const match = menuItems.find(m => m.name.toLowerCase() === oItem.name.toLowerCase());
    if (!match) continue;

    // 2. Fetch recipe ingredients
    const recipeElements = recipes.filter(r => r.menuItemId === match.id);
    if (recipeElements.length === 0) continue;

    // 3. For each recipe element, subtract from stock and create transaction ledger entry
    for (const rec of recipeElements) {
      const ing = ingredients.find(i => i.id === rec.ingredientId);
      if (ing) {
        const amountToDeduct = rec.quantity * oItem.qty;
        ing.stockLevel = Math.max(0, ing.stockLevel - amountToDeduct);
        ing.updatedAt = new Date().toISOString();
        deductionCount++;

        // Add to Transaction ledger
        newTransactions.push({
          id: `tx-sale-${Math.floor(100000 + Math.random() * 900000)}`,
          tenantId: 'tenant-demo',
          ingredientId: ing.id,
          type: 'SALE_DEDUCTION',
          quantity: -amountToDeduct, // negative
          referenceId: null,
          notes: `Sales Deduction: Order item "${oItem.name}" x${oItem.qty}`,
          createdBy: 'system',
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  if (deductionCount > 0) {
    saveIngredients(ingredients);
    saveTransactions([...newTransactions, ...transactions]);
    
    // Dispatch a custom window event so open pages refresh their stock display
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dinepos_inventory_update'));
    }
  }
};

/**
 * Marks a purchase order as RECEIVED, updating stock levels.
 */
export const receivePurchaseOrder = (poId: string, operatorName: string) => {
  const pos = getPurchaseOrders();
  const poItems = getPurchaseOrderItems();
  const ingredients = getIngredients();
  const transactions = getTransactions();

  const po = pos.find(p => p.id === poId);
  if (!po || po.status !== 'PENDING') return false;

  const items = poItems.filter(poi => poi.purchaseOrderId === poId);
  const newTransactions: InventoryTransaction[] = [];

  // 1. Mark PO as received
  po.status = 'RECEIVED';
  po.receivedAt = new Date().toISOString();
  po.updatedAt = new Date().toISOString();

  // 2. Add quantities to stock and create transaction entries
  for (const item of items) {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    if (ing) {
      ing.stockLevel += item.quantity;
      ing.updatedAt = new Date().toISOString();

      newTransactions.push({
        id: `tx-po-recv-${Math.floor(100000 + Math.random() * 900000)}`,
        tenantId: 'tenant-demo',
        ingredientId: ing.id,
        type: 'PURCHASE',
        quantity: item.quantity,
        referenceId: poId,
        notes: `PO Received: Supplier PO Ref ${poId}`,
        createdBy: operatorName,
        createdAt: new Date().toISOString()
      });
    }
  }

  savePurchaseOrders(pos);
  saveIngredients(ingredients);
  saveTransactions([...newTransactions, ...transactions]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dinepos_inventory_update'));
  }
  return true;
};

/**
 * Logs a food waste event, reducing stock levels.
 */
export const recordWaste = (ingredientId: string, qty: number, reason: WasteReason, notes: string, reporter: string) => {
  const ingredients = getIngredients();
  const wasteLogs = getWasteLogs();
  const transactions = getTransactions();

  const ing = ingredients.find(i => i.id === ingredientId);
  if (!ing || ing.stockLevel < 0) return false;

  // 1. Deduct stock quantity
  ing.stockLevel = Math.max(0, ing.stockLevel - qty);
  ing.updatedAt = new Date().toISOString();

  // 2. Write waste log
  const wasteId = `waste-${Math.floor(100000 + Math.random() * 900000)}`;
  const newLog: WasteLog = {
    id: wasteId,
    tenantId: 'tenant-demo',
    ingredientId,
    quantity: qty,
    reason,
    notes: notes || null,
    reportedBy: reporter || 'Staff',
    createdAt: new Date().toISOString()
  };

  // 3. Write transaction log
  const newTx: InventoryTransaction = {
    id: `tx-waste-${Math.floor(100000 + Math.random() * 900000)}`,
    tenantId: 'tenant-demo',
    ingredientId,
    type: 'WASTE',
    quantity: -qty, // negative
    referenceId: wasteId,
    notes: `Waste Logged: ${reason}. Notes: ${notes || 'none'}`,
    createdBy: reporter,
    createdAt: new Date().toISOString()
  };

  saveIngredients(ingredients);
  saveWasteLogs([newLog, ...wasteLogs]);
  saveTransactions([newTx, ...transactions]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dinepos_inventory_update'));
  }
  return true;
};

/**
 * Manually adjusts stock levels (Manual inventory audit).
 */
export const manuallyAdjustStock = (ingredientId: string, newQty: number, notes: string, operator: string) => {
  const ingredients = getIngredients();
  const transactions = getTransactions();

  const ing = ingredients.find(i => i.id === ingredientId);
  if (!ing) return false;

  const diff = newQty - ing.stockLevel;
  ing.stockLevel = newQty;
  ing.updatedAt = new Date().toISOString();

  const newTx: InventoryTransaction = {
    id: `tx-adj-${Math.floor(100000 + Math.random() * 900000)}`,
    tenantId: 'tenant-demo',
    ingredientId,
    type: 'MANUAL_ADJUSTMENT',
    quantity: diff,
    referenceId: null,
    notes: notes || 'Manual stock override',
    createdBy: operator,
    createdAt: new Date().toISOString()
  };

  saveIngredients(ingredients);
  saveTransactions([newTx, ...transactions]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dinepos_inventory_update'));
  }
  return true;
};
