import { Router } from 'express';
import { getAuditLogs, createAuditLog, clearAuditLogs } from '../controllers/audit.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/logs', requireRole(['SUPER_ADMIN', 'MANAGER']), getAuditLogs);
router.post('/logs', requireRole(['SUPER_ADMIN', 'MANAGER']), createAuditLog);
router.delete('/logs', requireRole(['SUPER_ADMIN', 'MANAGER']), clearAuditLogs);

export default router;
