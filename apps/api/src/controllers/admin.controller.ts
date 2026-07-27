import { Response } from 'express';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getSuperAdminOverview = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  try {
    // 1. Fetch real registered tenants
    const { data: dbTenants, error: tenantErr } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (tenantErr) {
      console.error('[SuperAdmin API] Error fetching tenants:', tenantErr.message);
    }

    // 2. Fetch real registered users
    const { data: dbUsers, error: userErr } = await supabase
      .from('users')
      .select('id, tenant_id, name, email, role, is_active, last_login, created_at')
      .order('created_at', { ascending: false });

    if (userErr) {
      console.error('[SuperAdmin API] Error fetching users:', userErr.message);
    }

    // 3. Fetch audit logs if table exists
    const { data: dbAudit, error: auditErr } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const mapCountryToRegion = (country?: string) => {
      if (!country) return 'North America - East';
      const c = country.toLowerCase();
      if (c.includes('japan') || c.includes('nepal') || c.includes('asia') || c.includes('china') || c.includes('india') || c.includes('singapore')) {
        return 'Asia Pacific';
      }
      if (c.includes('europe') || c.includes('uk') || c.includes('france') || c.includes('germany') || c.includes('spain') || c.includes('italy')) {
        return 'Europe - West';
      }
      return 'North America - East';
    };

    const formattedTenants = (dbTenants || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      location: t.country || 'Global',
      terminals: 1,
      plan: (t.plan || 'TRIAL').toUpperCase(),
      revenue: t.currency === 'NPR' ? 'Rs. 0' : '$0.00',
      status: t.status ? t.status.toUpperCase() : 'ACTIVE',
      joined: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      tier: 'Business',
      region: mapCountryToRegion(t.country),
      expiryDate: t.trial_ends_at ? t.trial_ends_at.split('T')[0] : (t.subscription_expires_at ? t.subscription_expires_at.split('T')[0] : ''),
    }));

    const formattedUsers = (dbUsers || []).map((u: any) => {
      const matchedTenant = (dbTenants || []).find((t: any) => t.id === u.tenant_id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        tenant: matchedTenant ? matchedTenant.name : 'System Platform',
        status: u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
        lastActive: u.last_login ? new Date(u.last_login).toLocaleTimeString() : 'Recently'
      };
    });

    const formattedAudit = (dbAudit || []).map((a: any) => ({
      id: a.id,
      time: a.created_at ? new Date(a.created_at).toLocaleTimeString() : 'Just now',
      actor: a.user_email || 'System Daemon',
      action: a.action || a.message || 'Operation executed',
      tenant: a.tenant_id || 'System Platform',
      type: a.status === 'ERROR' ? 'warning' : 'info'
    }));

    res.json({
      success: true,
      data: {
        tenants: formattedTenants,
        users: formattedUsers,
        auditLogs: formattedAudit
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error loading Super Admin data.' });
  }
};

export const updateTenantStatus = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  const { id } = req.params;
  const { status, plan, trial_ends_at } = req.body;

  try {
    const updateData: any = {};
    if (status) updateData.status = status.toLowerCase();
    if (plan) updateData.plan = plan.toLowerCase();
    if (trial_ends_at) updateData.trial_ends_at = trial_ends_at;

    const { data, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTenant = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Tenant deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
