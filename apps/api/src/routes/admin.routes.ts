import { Router } from 'express';
import { getSuperAdminOverview, updateTenantStatus, deleteTenant, bulkDeleteTenants, getTenantDetails, auditHierarchy } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/overview', getSuperAdminOverview);
router.get('/audit-hierarchy', auditHierarchy);
router.get('/tenants/:id/details', getTenantDetails);
router.patch('/tenants/:id', updateTenantStatus);
router.post('/tenants/bulk-delete', bulkDeleteTenants);
router.delete('/tenants/:id', deleteTenant);

export default router;
