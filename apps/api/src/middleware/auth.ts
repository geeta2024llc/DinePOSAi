import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, ApiResponse } from '@dineposai/shared-types';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-jwt-secret-key-at-least-32-chars-long' : '');
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server will not start.');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: UserRole;
    email: string;
  };
}

// Verify JWT access token attached to authorization header
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      tenantId: string;
      role: UserRole;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError'
        ? 'Session expired. Please re-authenticate.'
        : 'Invalid token. Session terminated.'
    });
  }
};

// Role-Based Access Control (RBAC) middleware generator
export const requireRole = (allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication context missing.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};
