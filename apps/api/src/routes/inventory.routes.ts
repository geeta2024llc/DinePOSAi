// ============================================================
// DinePosAI - Inventory Routes Configuration
// ============================================================

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';
import { validateSchema } from '../middleware/validation.js';
import { auditLogger } from '../middleware/audit.middleware.js';
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getMenuItemRecipes,
  saveMenuItemRecipe,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getWasteLogs,
  recordWaste,
  getInventoryTransactions,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  saveRecipeSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createPurchaseOrderSchema,
  recordWasteSchema
} from '../controllers/inventory.controller.js';

const router = Router();

// Enforce auth and tenant isolation checks
router.use(requireAuth);
router.use(validateOrganizationActive);
router.use(requireOrganizationMatch);

// 1. Inventory Items CRUD
router.get('/items', requirePermission('inventory.view'), getInventoryItems);
router.post(
  '/items', 
  requirePermission('inventory.manage'), 
  validateSchema(createInventoryItemSchema), 
  auditLogger('Create Inventory Item', 'inventory_item'),
  createInventoryItem
);
router.put(
  '/items/:id', 
  requirePermission('inventory.manage'), 
  validateSchema(updateInventoryItemSchema), 
  auditLogger('Update Inventory Item', 'inventory_item'),
  updateInventoryItem
);
router.delete(
  '/items/:id', 
  requirePermission('inventory.manage'), 
  auditLogger('Delete Inventory Item', 'inventory_item'),
  deleteInventoryItem
);

// 2. Menu Item Recipes
router.get('/recipes', requirePermission('inventory.view'), getMenuItemRecipes);
router.post(
  '/recipes', 
  requirePermission('inventory.manage'), 
  validateSchema(saveRecipeSchema), 
  auditLogger('Save Recipe', 'menu_item_recipe'),
  saveMenuItemRecipe
);

// 3. Suppliers CRUD
router.get('/suppliers', requirePermission('inventory.view'), getSuppliers);
router.post(
  '/suppliers', 
  requirePermission('inventory.manage'), 
  validateSchema(createSupplierSchema), 
  auditLogger('Create Supplier', 'supplier'),
  createSupplier
);
router.put(
  '/suppliers/:id', 
  requirePermission('inventory.manage'), 
  validateSchema(updateSupplierSchema), 
  auditLogger('Update Supplier', 'supplier'),
  updateSupplier
);
router.delete(
  '/suppliers/:id', 
  requirePermission('inventory.manage'), 
  auditLogger('Delete Supplier', 'supplier'),
  deleteSupplier
);

// 4. Purchase Orders
router.get('/purchase-orders', requirePermission('inventory.view'), getPurchaseOrders);
router.post(
  '/purchase-orders', 
  requirePermission('inventory.manage'), 
  validateSchema(createPurchaseOrderSchema), 
  auditLogger('Create Purchase Order', 'purchase_order'),
  createPurchaseOrder
);
router.put(
  '/purchase-orders/:id/receive', 
  requirePermission('inventory.manage'), 
  auditLogger('Receive Purchase Order', 'purchase_order'),
  receivePurchaseOrder
);
router.put(
  '/purchase-orders/:id/cancel', 
  requirePermission('inventory.manage'), 
  auditLogger('Cancel Purchase Order', 'purchase_order'),
  cancelPurchaseOrder
);

// 5. Waste Logging
router.get('/waste', requirePermission('inventory.view'), getWasteLogs);
router.post(
  '/waste', 
  requirePermission('inventory.manage'), 
  validateSchema(recordWasteSchema), 
  auditLogger('Record Waste', 'waste_log'),
  recordWaste
);

// 6. Stock Ledger / History Transactions
router.get('/transactions', requirePermission('inventory.view'), getInventoryTransactions);

export default router;
