import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const updateSettingsSchema = z.object({
  country: z.string().min(2, 'Country must be at least 2 characters').optional(),
  timezone: z.string().min(2, 'Timezone must be at least 2 characters').optional(),
  currency: z.string().min(3, 'Currency must be a 3-character ISO code').max(3).optional(),
  taxType: z.enum(['VAT', 'GST', 'NONE']).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  onboarded: z.boolean().optional(),
});

export const onboardTenantSchema = z.object({
  country: z.string().min(2, 'Country is required'),
  timezone: z.string().min(2, 'Timezone is required'),
  currency: z.string().min(3, 'Currency must be a 3-character ISO code').max(3),
  taxType: z.enum(['VAT', 'GST', 'NONE']),
  taxRate: z.number().min(0).max(100),
  categories: z.array(z.string().min(1, 'Category name is required')).min(1, 'At least one category is required'),
  menuItems: z.array(z.object({
    categoryName: z.string().min(1),
    name: z.string().min(1),
    price: z.number().min(0),
    description: z.string().optional(),
  })).optional()
});

// 1. GET TENANT SETTINGS
export const getTenantSettings = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({ success: false, error: 'Restaurant workspace not found.' });
    }

    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        country: tenant.country,
        timezone: tenant.timezone,
        currency: tenant.currency,
        taxType: tenant.tax_type,
        taxRate: parseFloat(tenant.tax_rate),
        plan: tenant.plan,
        status: tenant.status,
        trialEndsAt: tenant.trial_ends_at,
        onboarded: tenant.onboarded,
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching restaurant settings.' });
  }
};

// 2. UPDATE TENANT SETTINGS
export const updateTenantSettings = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { country, timezone, currency, taxType, taxRate, onboarded } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const updates: any = {};
    if (country !== undefined) updates.country = country;
    if (timezone !== undefined) updates.timezone = timezone;
    if (currency !== undefined) updates.currency = currency;
    if (taxType !== undefined) updates.tax_type = taxType;
    if (taxRate !== undefined) updates.tax_rate = taxRate;
    if (onboarded !== undefined) updates.onboarded = onboarded;
    updates.updated_at = new Date().toISOString();

    const { data: tenant, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single();

    if (error || !tenant) {
      return res.status(500).json({ success: false, error: `Failed to update settings: ${error?.message}` });
    }

    res.json({
      success: true,
      data: {
        message: 'Restaurant settings updated successfully.',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          country: tenant.country,
          timezone: tenant.timezone,
          currency: tenant.currency,
          taxType: tenant.tax_type,
          taxRate: parseFloat(tenant.tax_rate),
          onboarded: tenant.onboarded,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating restaurant settings.' });
  }
};

// 3. ONBOARD TENANT (Atomic Wizard Setup)
export const onboardTenant = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  const { country, timezone, currency, taxType, taxRate, categories, menuItems } = req.body;

  try {
    // A. Update tenant profile and set onboarded = true
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .update({
        country,
        timezone,
        currency,
        tax_type: taxType,
        tax_rate: taxRate,
        onboarded: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (tenantErr || !tenant) {
      return res.status(500).json({ success: false, error: `Failed to update tenant profile: ${tenantErr?.message}` });
    }

    // B. Create initial menu categories
    const categoryIds: Record<string, string> = {};

    for (const catName of categories) {
      const { data: newCat, error: catErr } = await supabase
        .from('categories')
        .insert({
          tenant_id: tenantId,
          name: catName,
          is_active: true
        })
        .select()
        .single();

      if (catErr || !newCat) {
        return res.status(500).json({ success: false, error: `Failed to initialize category "${catName}": ${catErr?.message}` });
      }

      categoryIds[catName] = newCat.id;
    }

    // C. Create initial menu items if provided
    if (menuItems && menuItems.length > 0) {
      const itemsPayload = menuItems.map((item: any) => {
        const categoryId = categoryIds[item.categoryName];
        if (!categoryId) return null;
        return {
          tenant_id: tenantId,
          category_id: categoryId,
          name: item.name,
          price: item.price,
          description: item.description || null,
          is_available: true
        };
      }).filter((item: any) => item !== null);

      if (itemsPayload.length > 0) {
        const { error: itemsErr } = await supabase
          .from('menu_items')
          .insert(itemsPayload);

        if (itemsErr) {
          return res.status(500).json({ success: false, error: `Failed to initialize menu items: ${itemsErr.message}` });
        }
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Onboarding completed successfully.',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          country: tenant.country,
          timezone: tenant.timezone,
          currency: tenant.currency,
          taxType: tenant.tax_type,
          taxRate: parseFloat(tenant.tax_rate),
          onboarded: tenant.onboarded
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error during onboarding.' });
  }
};

// Staff validation schemas
export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']).optional(),
  isActive: z.boolean().optional(),
});

// 4. GET ALL STAFF/USERS
export const getTenantUsers = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at, last_login')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching users.' });
  }
};

// 5. CREATE STAFF USER
export const createTenantUser = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  const { name, email, password, role } = req.body;
  const emailLower = email.toLowerCase().trim();
  let createdAuthUserId: string | null = null;

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email address is already in use.' });
    }

    // Generate a UUID to use as both the auth and db user id
    const { randomUUID } = await import('crypto');
    const userId = randomUUID();

    // Register in Supabase Auth first
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      id: userId,
      email: emailLower,
      password: password,
      email_confirm: true
    });

    if (authErr || !authData?.user) {
      return res.status(500).json({ success: false, error: `Supabase Auth registration failed: ${authErr?.message || 'Unknown error'}` });
    }

    createdAuthUserId = authData.user.id;

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: newUser, error: dbErr } = await supabase
      .from('users')
      .insert({
        id: userId,
        tenant_id: tenantId,
        name,
        email: emailLower,
        password_hash: passwordHash,
        role,
        is_active: true
      })
      .select('id, name, email, role, is_active, created_at')
      .single();

    if (dbErr || !newUser) {
      // Rollback: remove auth user if DB insert fails
      await supabase.auth.admin.deleteUser(createdAuthUserId).catch(() => {});
      return res.status(500).json({ success: false, error: `Failed to create user record: ${dbErr?.message}` });
    }

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error: any) {
    if (createdAuthUserId) {
      await supabase.auth.admin.deleteUser(createdAuthUserId).catch(() => {});
    }
    res.status(500).json({ success: false, error: error.message || 'Error creating user.' });
  }
};

// 6. UPDATE STAFF USER
export const updateTenantUser = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  const { name, email, password, role, isActive } = req.body;

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Sync email/password changes to Supabase Auth
    if (email !== undefined || password !== undefined) {
      const authUpdates: { email?: string; password?: string } = {};
      if (email !== undefined) authUpdates.email = email.toLowerCase().trim();
      if (password !== undefined) authUpdates.password = password;

      const { error: authUpdateErr } = await supabase.auth.admin.updateUserById(id, authUpdates);
      if (authUpdateErr) {
        console.error(`[Staff Update] Failed to update Supabase Auth for user ${id}:`, authUpdateErr.message);
        // Non-fatal — log but do not block DB update
      }
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase().trim();
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.is_active = isActive;
    if (password !== undefined) {
      updates.password_hash = await bcrypt.hash(password, 12);
    }
    updates.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, name, email, role, is_active, created_at, updated_at')
      .single();

    if (error || !updatedUser) {
      return res.status(500).json({ success: false, error: `Failed to update user: ${error?.message}` });
    }

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating user.' });
  }
};

// 7. DELETE STAFF USER
export const deleteTenantUser = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;

  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  if (req.user?.id === id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own user account.' });
  }

  try {
    // Delete from local DB first
    const { error: dbErr } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (dbErr) return res.status(500).json({ success: false, error: dbErr.message });

    // Delete from Supabase Auth (non-fatal if it fails — user already removed from DB)
    const { error: authErr } = await supabase.auth.admin.deleteUser(id);
    if (authErr) {
      console.error(`[Staff Delete] Failed to remove auth user ${id}:`, authErr.message);
    }

    res.json({
      success: true,
      data: { message: 'User deleted successfully.' }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error deleting user.' });
  }
};
