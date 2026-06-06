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
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching restaurant settings.' });
  }
};

// 2. UPDATE TENANT SETTINGS
export const updateTenantSettings = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { country, timezone, currency, taxType, taxRate } = req.body;

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
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating restaurant settings.' });
  }
};
