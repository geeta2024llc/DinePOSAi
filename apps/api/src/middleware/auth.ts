// ============================================================
// DinePosAI - Authentication & RBAC Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, ApiResponse } from '@dineposai/shared-types';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-jwt-secret-key-at-least-32-chars-long' : '');
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server will not start.');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    branchId: string | null;
    role: UserRole;
    email: string;
    sessionId: string;
    permissions: string[];
  };
}

// Memory cache for user authentication sessions & permissions to prevent database hammering during POS polling
interface CachedAuth {
  expiresAt: Date;
  session: {
    id: string;
    expires_at: string;
    branch_id: string | null;
  };
  permissions: string[];
}

const authCache = new Map<string, CachedAuth>();
const CACHE_TTL_MS = 5000; // Cache TTL of 5 seconds

/**
 * Authentication Middleware: Validates JWT access token, verifies session existence in DB,
 * and loads user permissions.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      tenantId: string;
      role: UserRole;
      email: string;
      sessionId: string;
    };

    // Cache check to avoid redundant database calls on high-frequency polling requests
    const cacheKey = `${decoded.id}:${decoded.sessionId}:${decoded.role}`;
    const cached = authCache.get(cacheKey);
    let session;
    let permissions;

    if (cached && cached.expiresAt > new Date()) {
      session = cached.session;
      permissions = cached.permissions;
    } else {
      // 1. Fetch the user's specific session to verify it has not been revoked
      const { data: dbSession, error: sessionErr } = await supabase
        .from('user_sessions')
        .select('id, expires_at, branch_id')
        .eq('id', decoded.sessionId)
        .eq('user_id', decoded.id)
        .maybeSingle();

      if (sessionErr || !dbSession) {
        return res.status(401).json({
          success: false,
          error: 'Session terminated or invalidated. Please log in again.',
        });
      }
      session = dbSession;

      // Check expiry
      if (new Date(session.expires_at) < new Date()) {
        // Clean up in background
        supabase.from('user_sessions').delete().eq('id', session.id).then(({ error }) => { if (error) logger.error(error.message); });
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.',
        });
      }

      // 2. Fetch the user permissions from the DB
      const { data: permissionsData, error: permErr } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('role', decoded.role);

      if (permErr) {
        logger.error(`Failed to load permissions for role ${decoded.role}: ${permErr.message}`);
      }

      const rolePermissions = permissionsData?.map((p) => p.permission) || [];

      // Fetch custom permissions from users table
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('custom_permissions')
        .eq('id', decoded.id)
        .maybeSingle();

      if (userErr) {
        logger.error(`Failed to load custom permissions for user ${decoded.id}: ${userErr.message}`);
      }

      const userCustomPermissions = userData?.custom_permissions || [];
      permissions = userCustomPermissions.length > 0 ? userCustomPermissions : rolePermissions;

      // Save to active memory cache
      authCache.set(cacheKey, {
        expiresAt: new Date(Date.now() + CACHE_TTL_MS),
        session,
        permissions
      });
    }

    // 3. Attach full auth context to request
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      branchId: session.branch_id,
      role: decoded.role,
      email: decoded.email,
      sessionId: decoded.sessionId,
      permissions,
    };

    supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id)
      .then(({ error }) => { if (error) logger.error(error.message); });

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError'
        ? 'Session expired. Please re-authenticate.'
        : 'Invalid token. Session terminated.',
    });
  }
};

// Maintain compatibility with existing code using requireAuth
export const requireAuth = authenticateUser;

/**
 * Role-Based Access Control (RBAC) middleware generator (Legacy compatibility)
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication context missing.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};
