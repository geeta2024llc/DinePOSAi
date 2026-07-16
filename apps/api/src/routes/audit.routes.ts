// ============================================================
// DinePosAI - Audit Routes Configuration
// ============================================================

import { Router } from 'express';
import { getAuditLogs, createAuditLog, clearAuditLogs } from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { requireOrganizationMatch, validateOrganizationActive } from '../middleware/organization.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(validateOrganizationActive);
router.use(requireOrganizationMatch);

router.get('/logs', requirePermission('audit.view'), getAuditLogs);
router.post('/logs', requirePermission('audit.view'), createAuditLog);
router.delete('/logs', requirePermission('settings.manage'), clearAuditLogs); // Restricted to OWNER/SUPER_ADMIN settings level

export default router;
