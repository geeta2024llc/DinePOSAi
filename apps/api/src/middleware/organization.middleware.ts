// ============================================================
// DinePosAI - Multi-Tenant Isolation Middleware
// ============================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { ApiResponse } from '@dineposai/shared-types';
import { supabase } from '../utils/supabase.js';

/**
 * Middleware to verify that the tenant_id in the request matches the user's tenantId.
 * Ensures strict database isolation across tenants.
 */
export function requireOrganizationMatch(
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication context missing.',
    });
  }

  // Super Admin bypass
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const userTenantId = req.user.tenantId;

  // Extract any tenant identifiers from request parameters, query, or body
  const targetTenantId =
    req.params.tenantId ||
    req.params.tenant_id ||
    req.query.tenantId ||
    req.query.tenant_id ||
    req.body.tenantId ||
    req.body.tenant_id;

  if (targetTenantId && targetTenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: You cannot access or modify resources belonging to another organization.',
    });
  }

  next();
}

/**
 * Loads and validates organization status, ensuring it is ACTIVE.
 */
export async function validateOrganizationActive(
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication context missing.',
    });
  }

  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('status')
      .eq('id', req.user.tenantId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({
        success: false,
        error: 'Organization workspace not found.',
      });
    }

    if (tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Your organization account is currently inactive or suspended.',
      });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Error validating organization status.',
    });
  }
}
