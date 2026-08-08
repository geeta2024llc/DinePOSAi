// ============================================================
// DinePosAI - Billing Routes Configuration
// ============================================================

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
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';
import { validateSchema } from '../middleware/validation.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Webhook (MUST remain public, bypasses auth)
router.post('/webhook', stripeWebhook);

// Authenticated billing endpoints helper middleware
const billingAuthStack = [
  requireAuth,
  validateOrganizationActive,
  requireOrganizationMatch
];

// Checkout Session (requires OWNER or SUPER_ADMIN access)
router.post(
  '/checkout', 
  ...billingAuthStack, 
  requirePermission('billing.manage'), 
  validateSchema(createCheckoutSchema), 
  auditLogger('Start Stripe Checkout', 'billing'),
  createCheckoutSession
);

// Stripe config status (accessible to authenticated users to check payment availability)
router.get(
  '/config', 
  requireAuth, 
  getStripeConfig
);
router.post(
  '/config', 
  requireAuth, 
  requirePermission('system.manage'), 
  auditLogger('Update Stripe Config', 'system'),
  updateStripeConfig
);
router.post(
  '/config/unlink', 
  requireAuth, 
  requirePermission('system.manage'), 
  auditLogger('Unlink Stripe Config', 'system'),
  unlinkStripeConfig
);

// Tenant billing info (OWNER or SUPER_ADMIN access)
router.get(
  '/tenant', 
  ...billingAuthStack, 
  requirePermission('billing.view'), 
  getTenantBilling
);

// Subscription invoices
router.get(
  '/invoices', 
  ...billingAuthStack, 
  requirePermission('billing.view'), 
  getSubscriptionInvoices
);

export default router;
