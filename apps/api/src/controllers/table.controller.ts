import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createTableSchema = z.object({
  name: z.string().min(1, 'Table name/number is required'),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']),
});

// 1. GET ALL TABLES
export const getTables = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      data: tables.map(t => ({
        id: t.id,
        name: t.name,
        status: t.status,
        createdAt: t.created_at,
      }))
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching tables.' });
  }
};

// 2. CREATE A TABLE
export const createTable = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { name } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: table, error } = await supabase
      .from('tables')
      .insert({
        tenant_id: tenantId,
        name,
        status: 'AVAILABLE',
      })
      .select()
      .single();

    if (error || !table) {
      return res.status(500).json({ success: false, error: `Failed to create table: ${error?.message}` });
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Table created successfully.',
        table: {
          id: table.id,
          name: table.name,
          status: table.status,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error creating table.' });
  }
};

// 3. UPDATE TABLE STATUS (AVAILABLE, OCCUPIED, RESERVED)
export const updateTableStatus = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { tableId } = req.params;
  const { status } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    // Verify table belongs to tenant
    const { data: existingTable } = await supabase
      .from('tables')
      .select('id')
      .eq('id', tableId)
      .eq('tenant_id', tenantId)
      .single();

    if (!existingTable) {
      return res.status(404).json({ success: false, error: 'Table not found in your restaurant.' });
    }

    const { data: table, error } = await supabase
      .from('tables')
      .update({ status })
      .eq('id', tableId)
      .select()
      .single();

    if (error || !table) {
      return res.status(500).json({ success: false, error: `Failed to update table status: ${error?.message}` });
    }

    res.json({
      success: true,
      data: {
        message: 'Table status updated successfully.',
        table: {
          id: table.id,
          name: table.name,
          status: table.status,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating table status.' });
  }
};
