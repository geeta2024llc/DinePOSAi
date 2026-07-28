import { Response } from 'express';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getSuperAdminOverview = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  try {
    // 1. Fetch real registered tenants (all columns that actually exist)
    const { data: dbTenants, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, name, country, timezone, currency, tax_type, tax_rate, plan, status, trial_ends_at, created_at, updated_at, onboarded')
      .order('created_at', { ascending: false });

    if (tenantErr) {
      console.error('[SuperAdmin API] Error fetching tenants:', tenantErr.message);
    }

    // 2. Fetch real registered users — include branch_id for accurate roster
    const { data: dbUsers, error: userErr } = await supabase
      .from('users')
      .select('id, tenant_id, branch_id, name, email, phone, role, is_active, last_login, created_at')
      .order('created_at', { ascending: false });

    if (userErr) {
      console.error('[SuperAdmin API] Error fetching users:', userErr.message);
    }

    // 3. Fetch branches for all tenants
    const { data: dbBranches, error: branchErr } = await supabase
      .from('branches')
      .select('id, tenant_id, name, city, is_active, created_at');

    if (branchErr) {
      console.error('[SuperAdmin API] Error fetching branches:', branchErr.message);
    }

    // 4. Fetch audit logs
    const { data: dbAudit } = await supabase
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

    // ── KEY FIX: plan normalization helper ─────────────────────────────────
    // The tenants table stores plan='ACTIVE' for GEETA KITCHEN & BAR which is
    // semantically a status value, not a plan name. Normalize at query layer.
    const normalizePlan = (rawPlan?: string): string => {
      const p = (rawPlan || 'TRIAL').toUpperCase();
      if (p === 'ACTIVE') return 'BUSINESS';
      return p;
    };

    const formattedTenants = (dbTenants || []).map((t: any) => {
      const allTenantUsers = (dbUsers || []).filter((u: any) => u.tenant_id === t.id);
      const tenantBranches = (dbBranches || []).filter((b: any) => b.tenant_id === t.id);

      // ── KEY FIX 1: Exclude SUPER_ADMIN from tenant staff rosters ───────
      const businessStaff = allTenantUsers.filter((u: any) => u.role !== 'SUPER_ADMIN');

      // Owner/primary contact: prefer OWNER/TENANT_ADMIN role, excluding SUPER_ADMIN
      const ownerUser = businessStaff.find((u: any) =>
        u.role === 'TENANT_ADMIN' || u.role === 'OWNER' || u.role === 'MANAGER'
      ) || businessStaff[0];

      const totalStaffCount = businessStaff.length;
      const activeStaffCount = businessStaff.filter((u: any) => u.is_active !== false).length;
      const inactiveStaffCount = businessStaff.filter((u: any) => u.is_active === false).length;

      // ── KEY FIX 2: Resolve branch name per staff member ─────────────────
      const staffRoster = businessStaff.map((u: any) => {
        const userBranch = u.branch_id
          ? (dbBranches || []).find((b: any) => b.id === u.branch_id)
          : (tenantBranches.length === 1 ? tenantBranches[0] : null);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          role: (u.role || 'STAFF').toUpperCase(),
          status: u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
          branchId: u.branch_id || (userBranch?.id ?? ''),
          branchName: userBranch ? userBranch.name : 'Main Outlet (Headquarters)'
        };
      });

      const branches = tenantBranches.map((b: any) => ({
        id: b.id,
        name: b.name,
        city: b.city || 'Main Hub',
        isActive: b.is_active !== false
      }));

      // ── KEY FIX 3: tenants table has no email/phone columns ─────────────
      const contactEmail = ownerUser?.email || '';

      return {
        id: t.id,
        name: t.name,
        email: contactEmail,
        phone: ownerUser?.phone || '',
        ownerName: ownerUser?.name || 'Restaurant Owner',
        location: t.country || 'Global',
        terminals: 1,
        plan: normalizePlan(t.plan),
        revenue: t.currency === 'NPR' ? 'Rs. 0' : '$0.00',
        status: t.status ? t.status.toUpperCase() : 'ACTIVE',
        joined: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        tier: 'Business',
        region: mapCountryToRegion(t.country),
        expiryDate: t.trial_ends_at ? t.trial_ends_at.split('T')[0] : '',
        branchesCount: tenantBranches.length,
        branches,
        totalStaffCount,
        activeStaffCount,
        inactiveStaffCount,
        staffRoster
      };
    });

    // ── KEY FIX 4: Admin & Access Control user list ──────────────────────
    const formattedUsers = (dbUsers || []).map((u: any) => {
      const role = u.role ? u.role.toUpperCase() : 'STAFF';
      const isSuperAdmin = role === 'SUPER_ADMIN';

      const matchedTenant = isSuperAdmin
        ? null
        : (dbTenants || []).find((t: any) => t.id === u.tenant_id);

      const matchedBranch = u.branch_id
        ? (dbBranches || []).find((b: any) => b.id === u.branch_id)
        : null;

      const assignedTo = isSuperAdmin
        ? 'System Platform'
        : (matchedTenant ? matchedTenant.name : 'Not Assigned');

      const branchName = matchedBranch
        ? matchedBranch.name
        : (isSuperAdmin ? 'All Locations' : 'Main Outlet (Headquarters)');

      const hierarchyBreadcrumb = isSuperAdmin
        ? 'System Platform > All Locations > SUPER_ADMIN'
        : `${matchedTenant ? matchedTenant.name : 'Unassigned'} > ${branchName} > ${role}`;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        tenant: isSuperAdmin ? 'System Platform' : (matchedTenant ? matchedTenant.name : 'System Platform'),
        assignedTo,
        tenantId: isSuperAdmin ? '' : (u.tenant_id || ''),
        branchId: u.branch_id || '',
        branchName,
        hierarchyBreadcrumb,
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

    // 2. Fetch users for this tenant — EXCLUDE SUPER_ADMIN (platform-level, not business staff)
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at, last_login, branch_id')
      .eq('tenant_id', id)
      .neq('role', 'SUPER_ADMIN');

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

    const owner = (users || []).find((u: any) => u.role === 'TENANT_ADMIN' || u.role === 'OWNER' || u.role === 'MANAGER') || users?.[0];
    // tenants table has no phone column — use owner user record only
    const phone = (owner as any)?.phone || (owner as any)?.contact_number || 'N/A';

    const details = {
      id: tenant.id,
      name: tenant.name,
      email: owner?.email || '',  // tenants table has no email column; use owner user's email
      phone,
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
  const { status, plan, trial_ends_at, expiryDate, subscription_expires_at, billingFailed } = req.body;

  try {
    const updateData: any = {};
    if (status) updateData.status = status.toUpperCase();
    if (plan) updateData.plan = plan.toUpperCase();

    const targetDate = expiryDate || trial_ends_at || subscription_expires_at;
    if (targetDate) {
      const parsedDate = targetDate.includes('T') ? targetDate : `${targetDate}T23:59:59.000Z`;
      updateData.trial_ends_at = parsedDate;
    }

    updateData.updated_at = new Date().toISOString();

    console.log(`[SuperAdmin API Update Tenant] Patching tenant ID ${id} with:`, updateData);

    const { data, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[SuperAdmin API Update Tenant] Supabase update failed for ${id}:`, error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`[SuperAdmin API Update Tenant] SUCCESS: Tenant ${id} updated in Supabase database:`, data);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error(`[SuperAdmin API Update Tenant] Server error updating tenant ${id}:`, error);
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

export const auditHierarchy = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Super Admin privileges required.' });
  }

  try {
    const [{ data: tenants }, { data: users }, { data: branches }] = await Promise.all([
      supabase.from('tenants').select('id, name, status, plan'),
      supabase.from('users').select('id, name, email, role, tenant_id, branch_id, is_active'),
      supabase.from('branches').select('id, tenant_id, name')
    ]);

    const tenantMap = new Map((tenants || []).map(t => [t.id, t]));

    let orphanedUsersCount = 0;
    let missingOwnerTenantsCount = 0;
    let superAdminWithTenantCount = 0;
    let invalidPlanCount = 0;
    let totalActiveUsers = 0;
    const auditDetails: any[] = [];

    const tenantOwnersCount = new Map<string, number>();

    (users || []).forEach(u => {
      if (u.is_active !== false) totalActiveUsers++;
      const hasTenant = u.tenant_id && tenantMap.has(u.tenant_id);
      const isSuperAdmin = u.role === 'SUPER_ADMIN';

      // ── KEY FIX: Flag SUPER_ADMIN users who have a tenant_id set ───────
      // Due to DB NOT NULL constraint, SUPER_ADMIN keeps a legacy tenant_id.
      // This is a schema design issue — flagged as HIGH for DBA awareness.
      if (isSuperAdmin && u.tenant_id) {
        superAdminWithTenantCount++;
        auditDetails.push({
          severity: 'HIGH',
          type: 'SUPER_ADMIN_TENANT_LEAK',
          message: `SUPER_ADMIN "${u.name}" (${u.email}) has tenant_id set to "${u.tenant_id}". ` +
            'This is caused by a NOT NULL constraint on users.tenant_id. ' +
            'Apply migration: ALTER TABLE users ALTER COLUMN tenant_id DROP NOT NULL; to fully resolve.',
          fixInstruction: 'ALTER TABLE users ALTER COLUMN tenant_id DROP NOT NULL;'
        });
      }

      // Non-SUPER_ADMIN user with no valid tenant_id = orphan
      if (!hasTenant && !isSuperAdmin) {
        orphanedUsersCount++;
        auditDetails.push({
          severity: 'HIGH',
          type: 'ORPHAN_USER',
          message: `User "${u.name}" (${u.email}) is not linked to any valid tenant business.`
        });
      }

      if (u.tenant_id && (u.role === 'OWNER' || u.role === 'TENANT_ADMIN') && !isSuperAdmin) {
        tenantOwnersCount.set(u.tenant_id, (tenantOwnersCount.get(u.tenant_id) || 0) + 1);
      }
    });

    (tenants || []).forEach(t => {
      const owners = tenantOwnersCount.get(t.id) || 0;
      if (owners === 0) {
        missingOwnerTenantsCount++;
        auditDetails.push({
          severity: 'MEDIUM',
          type: 'MISSING_OWNER',
          message: `Business "${t.name}" (${t.id}) has no designated Owner or Tenant Admin assigned.`
        });
      }
      // Flag invalid plan values
      const validPlans = ['TRIAL', 'STARTER', 'BUSINESS', 'ENTERPRISE', 'FREE'];
      if (t.plan && !validPlans.includes(t.plan.toUpperCase())) {
        invalidPlanCount++;
        auditDetails.push({
          severity: 'MEDIUM',
          type: 'INVALID_PLAN',
          message: `Business "${t.name}" (${t.id}) has invalid plan value: "${t.plan}". Normalized to 'BUSINESS' at query layer.`
        });
      }
    });

    // Check for duplicate tenant names
    const nameCount = new Map<string, number>();
    (tenants || []).forEach(t => nameCount.set(t.name, (nameCount.get(t.name) || 0) + 1));
    nameCount.forEach((count, name) => {
      if (count > 1) {
        auditDetails.push({
          severity: 'MEDIUM',
          type: 'DUPLICATE_TENANT_NAME',
          message: `Tenant name "${name}" appears ${count} times. Consider consolidating duplicate business records.`
        });
      }
    });

    const isHealthy = orphanedUsersCount === 0 && missingOwnerTenantsCount === 0 && invalidPlanCount === 0;

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        isHealthy,
        healthScore: isHealthy ? 100 : Math.max(50, 100 - (
          orphanedUsersCount * 10 +
          missingOwnerTenantsCount * 15 +
          superAdminWithTenantCount * 5 +
          invalidPlanCount * 8
        )),
        totalTenants: tenants?.length || 0,
        totalUsers: users?.length || 0,
        totalBranches: branches?.length || 0,
        totalActiveUsers,
        orphanedUsersCount,
        missingOwnerTenantsCount,
        superAdminWithTenantCount,
        invalidPlanCount,
        auditDetails
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
