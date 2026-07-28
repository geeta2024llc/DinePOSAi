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

export const performCascadingTenantDeletion = async (id: string): Promise<{ success: boolean; name?: string; error?: string }> => {
  try {
    // 1. Verify tenant exists first
    const { data: existingTenant, error: fetchErr } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    if (!existingTenant) {
      return { success: false, error: 'Tenant not found in system.' };
    }

    // 2. Cascading deletion of dependent table records
    const tablesToClean = [
      'user_sessions',
      'login_history',
      'audit_logs',
      'kitchen_logs',
      'cash_transactions',
      'cash_drawers',
      'purchase_order_items',
      'purchase_orders',
      'inventory_logs',
      'recipe_ingredients',
      'inventory_items',
      'suppliers',
      'payment_splits',
      'refunds',
      'invoices',
      'payments',
      'order_item_addons',
      'order_items',
      'orders',
      'item_addons',
      'item_variants',
      'menu_items',
      'categories',
      'tables',
      'devices',
      'settings',
      'tenant_billing',
      'subscription_invoices',
      'daily_sales',
      'users',
      'branches'
    ];

    for (const tableName of tablesToClean) {
      try {
        const { error: cleanErr } = await supabase
          .from(tableName)
          .delete()
          .eq('tenant_id', id);
        
        if (cleanErr && cleanErr.code !== '42P01') {
          console.warn(`[SuperAdmin API Cascading Cleanup] Notice on ${tableName}: ${cleanErr.message}`);
        }
      } catch (err: any) {
        console.warn(`[SuperAdmin API Cascading Cleanup] Exception on ${tableName}:`, err.message || err);
      }
    }

    // 3. Delete root tenant record
    const { error: deleteErr } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      return { success: false, error: deleteErr.message };
    }

    // 4. Verification Step
    const { data: verifyData } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (verifyData) {
      return { success: false, error: 'Database deletion verification failed.' };
    }

    return { success: true, name: existingTenant.name };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error during cascading deletion.' };
  }
};

export const deleteTenant = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    console.warn(`[SuperAdmin API Delete Tenant] Unauthorized attempt by user ${req.user?.id || 'anonymous'} with role ${req.user?.role}`);
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  const { id } = req.params;
  console.log(`[SuperAdmin API Delete Tenant] Initiating permanent deletion for tenant ID: ${id}`);
  
  const outcome = await performCascadingTenantDeletion(id);

  if (!outcome.success) {
    console.error(`[SuperAdmin API Delete Tenant] Deletion failed for ID ${id}: ${outcome.error}`);
    return res.status(400).json({ success: false, error: outcome.error || 'Failed to delete tenant.' });
  }

  console.log(`[SuperAdmin API Delete Tenant] VERIFICATION SUCCESSFUL: Tenant "${outcome.name}" (${id}) permanently deleted.`);
  res.json({ success: true, data: { message: `Tenant "${outcome.name}" deleted successfully.` } });
};

export const bulkDeleteTenants = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'Please provide an array of tenant IDs to delete.' });
  }

  console.log(`[SuperAdmin API Bulk Delete Tenants] Initiating batch deletion for ${ids.length} tenants:`, ids);

  const results: { id: string; success: boolean; name?: string; error?: string }[] = [];

  for (const tenantId of ids) {
    const outcome = await performCascadingTenantDeletion(tenantId);
    results.push({ id: tenantId, success: outcome.success, name: outcome.name, error: outcome.error });
  }

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  console.log(`[SuperAdmin API Bulk Delete Tenants] Batch completed. Successful: ${successCount}, Failed: ${failedCount}`);

  if (failedCount > 0 && successCount === 0) {
    return res.status(400).json({
      success: false,
      error: `Failed to delete selected tenants: ${results[0]?.error || 'Unknown error'}`,
      data: { results }
    });
  }

  res.json({
    success: true,
    data: {
      message: `Successfully deleted ${successCount} tenant(s).${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      deletedCount: successCount,
      failedCount,
      results
    }
  });
};
