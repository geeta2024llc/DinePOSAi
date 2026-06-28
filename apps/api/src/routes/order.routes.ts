import { Router } from 'express';
import { 
  createOrder, 
  getActiveOrders, 
  updateOrderStatus, 
  createOrderSchema, 
  updateStatusSchema 
} from '../controllers/order.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

// Placing orders: Custom Digital Menu / Waiters / Staff Cashier can place orders
router.post(
  '/', 
  requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']), 
  validateSchema(createOrderSchema), 
  createOrder
);

// Fetch active orders (FOH cashier and BOH kitchen screens)
router.get(
  '/', 
  requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']), 
  getActiveOrders
);

// Update status (e.g. BOH marking cooking -> ready -> served)
router.patch(
  '/:id/status', 
  requireRole(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']), 
  validateSchema(updateStatusSchema), 
  updateOrderStatus
);

export default router;
