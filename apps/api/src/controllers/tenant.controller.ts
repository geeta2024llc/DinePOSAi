import { Response } from 'express';
import { z } from 'zod';
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
