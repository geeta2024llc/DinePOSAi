import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';
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

// Enforce auth and admin-only roles (SUPER_ADMIN and MANAGER)
router.use(requireAuth);
router.use(requireRole(['SUPER_ADMIN', 'MANAGER']));

// 1. Inventory Items CRUD
router.get('/items', getInventoryItems);
router.post('/items', validateSchema(createInventoryItemSchema), createInventoryItem);
router.put('/items/:id', validateSchema(updateInventoryItemSchema), updateInventoryItem);
router.delete('/items/:id', deleteInventoryItem);

// 2. Menu Item Recipes
router.get('/recipes', getMenuItemRecipes);
router.post('/recipes', validateSchema(saveRecipeSchema), saveMenuItemRecipe);

// 3. Suppliers CRUD
router.get('/suppliers', getSuppliers);
router.post('/suppliers', validateSchema(createSupplierSchema), createSupplier);
router.put('/suppliers/:id', validateSchema(updateSupplierSchema), updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// 4. Purchase Orders
router.get('/purchase-orders', getPurchaseOrders);
router.post('/purchase-orders', validateSchema(createPurchaseOrderSchema), createPurchaseOrder);
router.put('/purchase-orders/:id/receive', receivePurchaseOrder);
router.put('/purchase-orders/:id/cancel', cancelPurchaseOrder);

// 5. Waste Logging
router.get('/waste', getWasteLogs);
router.post('/waste', validateSchema(recordWasteSchema), recordWaste);

// 6. Stock Ledger / History Transactions
router.get('/transactions', getInventoryTransactions);

export default router;
