import { Router } from 'express';
import { getTenantSettings, updateTenantSettings, updateSettingsSchema } from '../controllers/tenant.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/settings', requireRole(['SUPER_ADMIN', 'MANAGER']), getTenantSettings);
router.patch('/settings', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(updateSettingsSchema), updateTenantSettings);

export default router;
