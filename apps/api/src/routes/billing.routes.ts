import { Router } from 'express';
import { createCheckoutSession, stripeWebhook, createCheckoutSchema } from '../controllers/billing.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

// Checkout Session (requires Manager access)
router.post('/checkout', requireAuth, requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createCheckoutSchema), createCheckoutSession);

// Webhook (public)
router.post('/webhook', stripeWebhook);

export default router;
