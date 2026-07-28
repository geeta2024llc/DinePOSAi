// ============================================================
// DinePosAI - Menu Routes Configuration
// ============================================================

import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory,
  deleteCategory,
  getMenuItems, 
  createMenuItem, 
  updateMenuItem,
  deleteMenuItem,
  getPublicMenu,
  createCategorySchema, 
  createMenuItemSchema,
  updateMenuItemSchema
} from '../controllers/menu.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';
import { validateSchema } from '../middleware/validation.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Public Unauthenticated Menu Endpoint for QR code scanning
router.get('/public', getPublicMenu);

// Authenticated tenant management routes
router.use(requireAuth);
router.use(validateOrganizationActive);
router.use(requireOrganizationMatch);

// Categories
router.get('/categories', requirePermission('menu.view'), getCategories);
router.post(
  '/categories', 
  requirePermission('menu.manage'), 
  validateSchema(createCategorySchema), 
  auditLogger('Create Category', 'category'),
  createCategory
);
router.put(
  '/categories/:id', 
  requirePermission('menu.manage'), 
  validateSchema(createCategorySchema), 
  auditLogger('Update Category', 'category'),
  updateCategory
);
router.delete(
  '/categories/:id', 
  requirePermission('menu.manage'), 
  auditLogger('Delete Category', 'category'),
  deleteCategory
);

// Menu Items
router.get('/items', requirePermission('menu.view'), getMenuItems);
router.post(
  '/items', 
  requirePermission('menu.manage'), 
  validateSchema(createMenuItemSchema), 
  auditLogger('Create Menu Item', 'menu_item'),
  createMenuItem
);
router.put(
  '/items/:id', 
  requirePermission('menu.manage'), 
  validateSchema(updateMenuItemSchema), 
  auditLogger('Update Menu Item', 'menu_item'),
  updateMenuItem
);
router.delete(
  '/items/:id', 
  requirePermission('menu.manage'), 
  auditLogger('Delete Menu Item', 'menu_item'),
  deleteMenuItem
);

export default router;
