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
  createCategorySchema, 
  createMenuItemSchema,
  updateMenuItemSchema
} from '../controllers/menu.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

// Categories
router.get('/categories', requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER']), getCategories);
router.post('/categories', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createCategorySchema), createCategory);
router.put('/categories/:id', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createCategorySchema), updateCategory);
router.delete('/categories/:id', requireRole(['SUPER_ADMIN', 'MANAGER']), deleteCategory);

// Menu Items
router.get('/items', requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER']), getMenuItems);
router.post('/items', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createMenuItemSchema), createMenuItem);
router.put('/items/:id', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(updateMenuItemSchema), updateMenuItem);
router.delete('/items/:id', requireRole(['SUPER_ADMIN', 'MANAGER']), deleteMenuItem);

export default router;
