import { Router } from 'express';
import { getTables, createTable, updateTableStatus, createTableSchema, updateTableStatusSchema } from '../controllers/table.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER']), getTables);
router.post('/', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createTableSchema), createTable);
router.patch('/:tableId/status', requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER']), validateSchema(updateTableStatusSchema), updateTableStatus);

export default router;
