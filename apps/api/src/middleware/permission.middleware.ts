// ============================================================
// DinePosAI - Granular Permission Guard Middleware
// ============================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { ApiResponse } from '@dineposai/shared-types';

/**
 * Middleware to enforce specific permissions for an endpoint.
 * Supports checking for ALL specified permissions or ANY of them.
 */
export function requirePermission(
  requiredPermissions: string | string[],
  options: { match?: 'all' | 'any' } = { match: 'all' }
) {
  return (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication context missing. Please ensure requireAuth is called first.',
      });
    }

    // Super Admin overrides all permission checks
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    let hasPermission = false;

    if (options.match === 'any') {
      // User must have at least one of the required permissions
      hasPermission = required.some((p) => userPermissions.includes(p));
    } else {
      // User must have all of the required permissions (default)
      hasPermission = required.every((p) => userPermissions.includes(p));
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Insufficient permissions. Required: ${required.join(', ')}`,
      });
    }

    next();
  };
}
