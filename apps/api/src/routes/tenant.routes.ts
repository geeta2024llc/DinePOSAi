// ============================================================
// DinePosAI - Tenant & Staff Routes Configuration
// ============================================================

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
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';
import { validateSchema } from '../middleware/validation.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Apply core auth and tenant isolation checks to all routes
router.use(requireAuth);
router.use(validateOrganizationActive);
router.use(requireOrganizationMatch);

// Settings
router.get('/settings', requirePermission('settings.manage'), getTenantSettings);
router.patch(
  '/settings', 
  requirePermission('settings.manage'), 
  validateSchema(updateSettingsSchema), 
  auditLogger('Update Settings', 'organization'),
  updateTenantSettings
);
router.post(
  '/onboard', 
  requirePermission('settings.manage'), 
  validateSchema(onboardTenantSchema), 
  auditLogger('Onboard Organization', 'organization'),
  onboardTenant
);

// Staff management
router.get('/users', requirePermission('staff.view'), getTenantUsers);
router.post(
  '/users', 
  requirePermission('staff.invite'), 
  validateSchema(createStaffSchema), 
  auditLogger('Create Staff User', 'user'),
  createTenantUser
);
router.put(
  '/users/:id', 
  requirePermission('staff.manage'), 
  validateSchema(updateStaffSchema), 
  auditLogger('Update Staff User', 'user'),
  updateTenantUser
);
router.delete(
  '/users/:id', 
  requirePermission('staff.manage'), 
  auditLogger('Delete Staff User', 'user'),
  deleteTenantUser
);

export default router;
