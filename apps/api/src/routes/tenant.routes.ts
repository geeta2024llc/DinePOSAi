import { Router } from 'express';
import { 
  getTenantSettings, 
  updateTenantSettings, 
  updateSettingsSchema, 
  onboardTenant, 
  onboardTenantSchema,
  getTenantUsers,
  createTenantUser,
  updateTenantUser,
  deleteTenantUser,
  createStaffSchema,
  updateStaffSchema
} from '../controllers/tenant.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/settings', requireRole(['SUPER_ADMIN', 'MANAGER']), getTenantSettings);
router.patch('/settings', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(updateSettingsSchema), updateTenantSettings);
router.post('/onboard', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(onboardTenantSchema), onboardTenant);

// Staff management
router.get('/users', requireRole(['SUPER_ADMIN', 'MANAGER']), getTenantUsers);
router.post('/users', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(createStaffSchema), createTenantUser);
router.put('/users/:id', requireRole(['SUPER_ADMIN', 'MANAGER']), validateSchema(updateStaffSchema), updateTenantUser);
router.delete('/users/:id', requireRole(['SUPER_ADMIN', 'MANAGER']), deleteTenantUser);

export default router;
