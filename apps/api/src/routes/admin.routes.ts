import { Router } from 'express';
import { getSuperAdminOverview, updateTenantStatus, deleteTenant } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/overview', getSuperAdminOverview);
router.patch('/tenants/:id', updateTenantStatus);
router.delete('/tenants/:id', deleteTenant);

export default router;
