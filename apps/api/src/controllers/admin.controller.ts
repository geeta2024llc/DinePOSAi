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

    const formattedTenants = (dbTenants || []).map((t: any) => {
      const tenantUser = (dbUsers || []).find((u: any) => u.tenant_id === t.id && (u.role === 'TENANT_ADMIN' || u.role === 'OWNER'))
        || (dbUsers || []).find((u: any) => u.tenant_id === t.id);

      return {
        id: t.id,
        name: t.name,
        email: t.email || tenantUser?.email || '',
        ownerName: tenantUser?.name || 'Restaurant Owner',
        location: t.country || 'Global',
        terminals: 1,
        plan: (t.plan || 'TRIAL').toUpperCase(),
        revenue: t.currency === 'NPR' ? 'Rs. 0' : '$0.00',
        status: t.status ? t.status.toUpperCase() : 'ACTIVE',
        joined: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        tier: 'Business',
        region: mapCountryToRegion(t.country),
        expiryDate: t.trial_ends_at ? t.trial_ends_at.split('T')[0] : (t.subscription_expires_at ? t.subscription_expires_at.split('T')[0] : ''),
      };
    });

    const formattedUsers = (dbUsers || []).map((u: any) => {
      const matchedTenant = (dbTenants || []).find((t: any) => t.id === u.tenant_id);
      const role = u.role ? u.role.toUpperCase() : 'STAFF';
      const assignedTo = matchedTenant 
        ? matchedTenant.name 
        : (role === 'SUPER_ADMIN' ? 'System Platform' : 'Not Assigned');

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        tenant: matchedTenant ? matchedTenant.name : 'System Platform',
        assignedTo,
        tenantId: u.tenant_id || '',
        role,
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

    // Calculate live aggregated tenant metrics
    const totalTenants = formattedTenants.length;
    const activeTenants = formattedTenants.filter((t: any) => t.status === 'ACTIVE').length;
    const suspendedTenants = formattedTenants.filter((t: any) => t.status === 'SUSPENDED').length;

    const uniqueRegionsSet = new Set(formattedTenants.map((t: any) => t.region || 'North America - East'));
    const uniqueRegionsList = Array.from(uniqueRegionsSet);
    const uniqueRegionsCount = uniqueRegionsList.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringSoonCount = formattedTenants.filter((t: any) => {
      if (!t.expiryDate) return false;
      const exp = new Date(t.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    const attentionRequiredCount = formattedTenants.filter((t: any) => {
      if (t.status === 'SUSPENDED') return true;
      if (!t.expiryDate) return false;
      const exp = new Date(t.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    const stats = {
      totalTenants,
      activeTenants,
      suspendedTenants,
      uniqueRegionsCount,
      uniqueRegionsList,
      expiringSoonCount,
      attentionRequiredCount
    };

    res.json({
      success: true,
      data: {
        tenants: formattedTenants,
        users: formattedUsers,
        auditLogs: formattedAudit,
        stats
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error loading Super Admin data.' });
  }
};

export const getTenantDetails = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  const { id } = req.params;

  try {
    // 1. Fetch root tenant record
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (tenantErr || !tenant) {
      return res.status(404).json({ success: false, error: tenantErr?.message || 'Tenant not found.' });
    }

    // 2. Fetch users for this tenant
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at, last_login')
      .eq('tenant_id', id);

    // 3. Count categories, menu items, orders, tables, devices, branches
    const [
      { count: categoryCount },
      { count: menuItemCount },
      { count: orderCount },
      { count: tableCount },
      { count: deviceCount },
      { count: branchCount }
    ] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
      supabase.from('tables').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
      supabase.from('devices').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
      supabase.from('branches').select('id', { count: 'exact', head: true }).eq('tenant_id', id)
    ]);

    const owner = (users || []).find((u: any) => u.role === 'TENANT_ADMIN' || u.role === 'OWNER') || users?.[0];

    const details = {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email || owner?.email || '',
      ownerName: owner?.name || 'Restaurant Owner',
      ownerRole: owner?.role || 'TENANT_ADMIN',
      status: tenant.status ? tenant.status.toUpperCase() : 'ACTIVE',
      plan: (tenant.plan || 'TRIAL').toUpperCase(),
      country: tenant.country || 'United States',
      currency: tenant.currency || 'USD',
      timezone: tenant.timezone || 'UTC',
      createdAt: tenant.created_at ? new Date(tenant.created_at).toLocaleString() : 'N/A',
      trialEndsAt: tenant.trial_ends_at ? tenant.trial_ends_at.split('T')[0] : '',
      subscriptionExpiresAt: tenant.subscription_expires_at ? tenant.subscription_expires_at.split('T')[0] : '',
      metrics: {
        totalUsers: users?.length || 0,
        totalCategories: categoryCount || 0,
        totalMenuItems: menuItemCount || 0,
        totalOrders: orderCount || 0,
        totalTables: tableCount || 0,
        totalDevices: deviceCount || 0,
        totalBranches: branchCount || 0
      },
      users: (users || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
        lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'
      }))
    };

    res.json({ success: true, data: details });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch tenant details.' });
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
