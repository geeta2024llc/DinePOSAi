import { Router } from 'express';
import { getCategories, createCategory, getMenuItems, createMenuItem, createCategorySchema, createMenuItemSchema } from '../controllers/menu.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

// Categories
router.get('/categories', requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER']), getCategories);
router.post('/categories', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createCategorySchema), createCategory);

// Menu Items
router.get('/items', requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER']), getMenuItems);
router.post('/items', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createMenuItemSchema), createMenuItem);

export default router;
