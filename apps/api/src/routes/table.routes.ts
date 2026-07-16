// ============================================================
// DinePosAI - Table Routes Configuration
// ============================================================

import { Router } from 'express';
import { getTables, createTable, updateTableStatus, createTableSchema, updateTableStatusSchema } from '../controllers/table.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';
import { validateSchema } from '../middleware/validation.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(validateOrganizationActive);
router.use(requireOrganizationMatch);

router.get('/', requirePermission('tables.view'), getTables);
router.post(
  '/', 
  requirePermission('tables.manage'), 
  validateSchema(createTableSchema), 
  auditLogger('Create Table', 'table'),
  createTable
);
router.patch(
  '/:tableId/status', 
  requirePermission('orders.edit'), 
  validateSchema(updateTableStatusSchema), 
  auditLogger('Update Table Status', 'table'),
  updateTableStatus
);

export default router;
