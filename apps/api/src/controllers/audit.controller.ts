import { Response } from 'express';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

// 1. GET AUDIT LOGS
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { category, action, startDate, endDate, tenantId, limit = 100, offset = 0 } = req.query;

  try {
    let query = supabase
      .from('audit_logs')
      .select('*, users(name, email, role)');

    // RBAC: Managers can only view their own tenant logs. Super Admins can view everything.
    if (user.role !== 'SUPER_ADMIN') {
      query = query.eq('tenant_id', user.tenantId);
    } else if (tenantId) {
      // Super Admin can filter by specific tenant
      query = query.eq('tenant_id', tenantId);
    }

    // Apply optional filters
    if (category) {
      // Categorization can be stored inside metadata.category
      query = query.eq('metadata->>category', category as string);
    }

    if (action) {
      query = query.eq('action', action as string);
    }

    if (startDate) {
      query = query.gte('created_at', startDate as string);
    }

    if (endDate) {
      query = query.lte('created_at', endDate as string);
    }

    // Sorting and Pagination
    query = query
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: logs, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: `Failed to fetch logs: ${error.message}` });
    }

    // Format logs for client-side use
    const formattedLogs = logs?.map(log => ({
      id: log.id,
      tenantId: log.tenant_id,
      userId: log.user_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      metadata: log.metadata || {},
      createdAt: log.created_at,
      user: log.users ? {
        name: log.users.name,
        email: log.users.email,
        role: log.users.role
      } : null
    }));

    res.json({
      success: true,
      data: formattedLogs
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error retrieving audit logs.' });
  }
};

// 2. CREATE AUDIT LOG
export const createAuditLog = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { action, entityType = 'system', entityId, metadata = {}, tenantId } = req.body;

  if (!action) {
    return res.status(400).json({ success: false, error: 'Action parameter is required.' });
  }

  try {
    // Determine the tenant_id to use. If a Super Admin logs an action, use the target tenantId or fallback.
    let resolvedTenantId = user.tenantId;

    if (user.role === 'SUPER_ADMIN') {
      if (tenantId) {
        resolvedTenantId = tenantId;
      } else {
        // Fallback: Use the first tenant in the system for global Super Admin actions
        const { data: firstTenant } = await supabase
          .from('tenants')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        resolvedTenantId = firstTenant?.id || '00000000-0000-0000-0000-000000000000';
      }
    }

    const { data: newLog, error } = await supabase
      .from('audit_logs')
      .insert({
        tenant_id: resolvedTenantId,
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        metadata
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: `Failed to insert log: ${error.message}` });
    }

    res.status(201).json({
      success: true,
      data: newLog
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error writing audit log.' });
  }
};

// 3. WIPE AUDIT LOGS (Clear recent logs)
export const clearAuditLogs = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { tenantId } = req.query;

  try {
    let query = supabase.from('audit_logs').delete();

    // Managers can only delete logs for their own tenant
    if (user.role !== 'SUPER_ADMIN') {
      query = query.eq('tenant_id', user.tenantId);
    } else if (tenantId) {
      query = query.eq('tenant_id', tenantId as string);
    } else {
      // PostgREST safety requirement: DELETE queries must specify a filter condition clause
      query = query.not('id', 'is', null);
    }

    const { error } = await query;

    if (error) {
      console.error('[clearAuditLogs] Supabase delete error:', error);
      return res.status(500).json({ success: false, error: `Failed to clear logs: ${error.message}` });
    }

    res.json({
      success: true,
      data: { message: 'Audit logs cleared successfully.' }
    });

  } catch (error: any) {
    console.error('[clearAuditLogs] Unexpected error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error clearing audit logs.' });
  }
};
