import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Menu item name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// 1. GET CATEGORIES
export const getCategories = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      data: categories.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active,
        createdAt: c.created_at,
      }))
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching categories.' });
  }
};

// 2. CREATE A CATEGORY
export const createCategory = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { name } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        tenant_id: tenantId,
        name,
        is_active: true,
      })
      .select()
      .single();

    if (error || !category) {
      return res.status(500).json({ success: false, error: `Failed to create category: ${error?.message}` });
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Category created successfully.',
        category: {
          id: category.id,
          name: category.name,
          isActive: category.is_active,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error creating category.' });
  }
};

// 3. GET MENU ITEMS
export const getMenuItems = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { categoryId, limit, offset } = req.query;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    let query = supabase
      .from('menu_items')
      .select('*, categories(*)')
      .eq('tenant_id', tenantId)
      .eq('is_available', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (limit !== undefined && offset !== undefined) {
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    }

    const { data: items, error } = await query.order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      data: items.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        categoryName: item.categories?.name,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        imageUrl: item.image_url,
        isAvailable: item.is_available,
        createdAt: item.created_at,
      }))
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching menu items.' });
  }
};

// 4. CREATE A MENU ITEM
export const createMenuItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { categoryId, name, description, price, imageUrl } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    // Verify category belongs to tenant
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('tenant_id', tenantId)
      .single();

    if (!category) {
      return res.status(404).json({ success: false, error: 'Target category not found in your restaurant.' });
    }

    const { data: item, error } = await supabase
      .from('menu_items')
      .insert({
        tenant_id: tenantId,
        category_id: categoryId,
        name,
        description: description || null,
        price,
        image_url: imageUrl || null,
        is_available: true,
      })
      .select()
      .single();

    if (error || !item) {
      return res.status(500).json({ success: false, error: `Failed to create menu item: ${error?.message}` });
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Menu item created successfully.',
        item: {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          description: item.description,
          isAvailable: item.is_available,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error creating menu item.' });
  }
};

// 5. UPDATE A CATEGORY
export const updateCategory = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  const { name } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { data: category, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !category) {
      return res.status(500).json({ success: false, error: `Failed to update category: ${error?.message}` });
    }

    res.json({
      success: true,
      data: {
        message: 'Category updated successfully.',
        category: {
          id: category.id,
          name: category.name,
          isActive: category.is_active,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating category.' });
  }
};

// 6. DELETE A CATEGORY
export const deleteCategory = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      return res.status(500).json({ success: false, error: `Failed to delete category: ${error.message}` });
    }

    res.json({
      success: true,
      data: {
        message: 'Category deleted successfully.'
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error deleting category.' });
  }
};

// 7. UPDATE A MENU ITEM
export const updateMenuItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  name: z.string().min(1, 'Menu item name is required').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isAvailable: z.boolean().optional(),
});

export const updateMenuItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;
  const body = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const updateData: any = {};
    if (body.categoryId) updateData.category_id = body.categoryId;
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable;

    const { data: item, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !item) {
      return res.status(500).json({ success: false, error: `Failed to update menu item: ${error?.message}` });
    }

    res.json({
      success: true,
      data: {
        message: 'Menu item updated successfully.',
        item: {
          id: item.id,
          categoryId: item.category_id,
          name: item.name,
          price: parseFloat(item.price),
          description: item.description,
          isAvailable: item.is_available,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error updating menu item.' });
  }
};

// 8. DELETE A MENU ITEM
export const deleteMenuItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      return res.status(500).json({ success: false, error: `Failed to delete menu item: ${error.message}` });
    }

    res.json({
      success: true,
      data: {
        message: 'Menu item deleted successfully.'
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error deleting menu item.' });
  }
};

