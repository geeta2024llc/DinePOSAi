import { Router } from 'express';
import { 
  createCheckoutSession, 
  stripeWebhook, 
  createCheckoutSchema,
  getStripeConfig,
  updateStripeConfig,
  unlinkStripeConfig,
  getTenantBilling,
  getSubscriptionInvoices
} from '../controllers/billing.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

// Checkout Session (requires Manager access)
router.post('/checkout', requireAuth, requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createCheckoutSchema), createCheckoutSession);

// Webhook (public)
router.post('/webhook', stripeWebhook);

// Stripe config management (SUPER_ADMIN only)
router.get('/config', requireAuth, requireRole(['SUPER_ADMIN']), getStripeConfig);
router.post('/config', requireAuth, requireRole(['SUPER_ADMIN']), updateStripeConfig);
router.post('/config/unlink', requireAuth, requireRole(['SUPER_ADMIN']), unlinkStripeConfig);

// Tenant billing info (Manager+ access)
router.get('/tenant', requireAuth, requireRole(['SUPER_ADMIN', 'MANAGER']), getTenantBilling);

// Subscription invoices (Manager+ access)
router.get('/invoices', requireAuth, requireRole(['SUPER_ADMIN', 'MANAGER']), getSubscriptionInvoices);

export default router;

