// ============================================================
// DinePosAI - Order Routes Configuration
// ============================================================

import { Router } from 'express';
import { 
  createOrder, 
  getActiveOrders, 
  updateOrderStatus, 
  createOrderSchema, 
  updateStatusSchema 
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';
import { validateSchema } from '../middleware/validation.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(validateOrganizationActive);
router.use(requireOrganizationMatch);

// Placing orders
router.post(
  '/', 
  requirePermission('orders.create'), 
  validateSchema(createOrderSchema), 
  auditLogger('Place Order', 'order'),
  createOrder
);

// Fetch active orders (FOH cashier, Waiter, and BOH kitchen screens)
router.get(
  '/', 
  requirePermission(['tables.view', 'kds.view'], { match: 'any' }), 
  getActiveOrders
);

// Update status (e.g. BOH marking cooking -> ready -> served)
router.patch(
  '/:id/status', 
  requirePermission(['orders.edit', 'kds.update'], { match: 'any' }), 
  validateSchema(updateStatusSchema), 
  auditLogger('Update Order Status', 'order'),
  updateOrderStatus
);

export default router;
