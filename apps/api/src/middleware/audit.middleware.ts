// ============================================================
// DinePosAI - Automated Audit Logging Middleware
// ============================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Express middleware to automatically log successful operations to the audit log.
 * Runs post-response using the response 'finish' event.
 */
export function auditLogger(action: string, entityType: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      // Only audit log successful operations (2xx statuses)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const ip = req.ip || req.socket.remoteAddress || null;
          const userAgent = req.headers['user-agent'] || null;

          // Attempt to extract target entity ID from request
          const entityId =
            req.params.id ||
            req.params.tableId ||
            req.params.itemId ||
            req.params.categoryId ||
            req.params.orderId ||
            req.body.id ||
            null;

          // Clean request body to avoid logging passwords or sensitive tokens
          const cleanBody = { ...req.body };
          const sensitiveFields = ['password', 'confirmPassword', 'token', 'refreshToken', 'newPassword', 'currentPassword'];
          for (const field of sensitiveFields) {
            if (field in cleanBody) {
              cleanBody[field] = '[REDACTED]';
            }
          }

          const metadata = {
            method: req.method,
            path: req.originalUrl,
            query: req.query,
            body: cleanBody,
            userAgent,
          };

          const { error } = await supabase.from('audit_logs').insert({
            tenant_id: req.user.tenantId,
            user_id: req.user.id,
            branch_id: req.user.branchId,
            action,
            entity_type: entityType,
            entity_id: entityId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityId) ? entityId : null,
            metadata,
            ip_address: ip,
            device: userAgent ? userAgent.substring(0, 255) : null,
          });

          if (error) {
            logger.error(`Failed to insert audit log in middleware: ${error.message}`);
          }
        } catch (err: any) {
          logger.error(`Error in audit logging middleware: ${err.message || err}`);
        }
      }
    });

    next();
  };
}
