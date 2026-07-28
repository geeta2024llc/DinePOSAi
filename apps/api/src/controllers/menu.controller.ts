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

// 9. PUBLIC UNAUTHENTICATED MENU FETCH
export const getPublicMenu = async (req: any, res: Response<ApiResponse>) => {
  const tenantQuery = (req.query.tenant || req.query.tenantId || req.query.slug || '').toString();

  try {
    let tenantId = tenantQuery;
    let tenantInfo: any = null;

    if (tenantId) {
      // 1. Fetch tenant metadata by ID or name search
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, country, currency, timezone')
        .or(`id.eq.${tenantId},name.ilike.%${tenantId}%`)
        .maybeSingle();

      if (tenant) {
        tenantId = tenant.id;
        tenantInfo = tenant;
      }
    }

    // Fallback to first active tenant if not specified or not found
    if (!tenantInfo) {
      const { data: firstTenant } = await supabase
        .from('tenants')
        .select('id, name, country, currency, timezone')
        .limit(1)
        .maybeSingle();

      if (firstTenant) {
        tenantId = firstTenant.id;
        tenantInfo = firstTenant;
      }
    }

    // 2. Fetch public branding from settings table if present
    let brandingConfig: any = {
      restaurantName: tenantInfo?.name || 'DinePOS AI Fine Dining',
      welcomeSubtitle: 'Exquisite Culinary Offerings & Signature Dishes',
      bannerUrl: '/images/wagyu_ribeye.png',
      currency: tenantInfo?.currency || 'USD',
    };

    if (tenantId) {
      const { data: setting } = await supabase
        .from('settings')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('key', 'public_branding')
        .maybeSingle();

      if (setting?.value) {
        brandingConfig = { ...brandingConfig, ...setting.value };
      }
    }

    // 3. Fetch categories & menu items from DB if tenantId exists
    let categories: any[] = [];
    let menuItems: any[] = [];

    if (tenantId) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, is_active')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (catData) categories = catData;

      const { data: itemData } = await supabase
        .from('menu_items')
        .select('*, categories(name)')
        .eq('tenant_id', tenantId)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (itemData) {
        menuItems = itemData.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.categories?.name || 'Main Course',
          categoryId: item.category_id,
          price: parseFloat(item.price || '0'),
          description: item.description || '',
          image: item.image_url || '/images/wagyu_ribeye.png',
          tags: ['Available'],
          allergens: []
        }));
      }
    }

    // 4. Guaranteed Fallback if database has no items for this tenant yet
    if (menuItems.length === 0) {
      menuItems = [
        {
          id: 'spec-1',
          name: 'Gold Leaf A5 Wagyu Ribeye',
          category: 'Specials',
          price: 185,
          description: '300g Japanese A5 Miyazaki Wagyu, seared over binchotan charcoal, brushed with truffle glaze, adorned with 24k gold leaf.',
          image: '/images/wagyu_ribeye.png',
          tags: ['Chef Special', 'GF'],
          allergens: []
        },
        {
          id: 'spec-2',
          name: 'Beluga Caviar & Kumamoto Oysters',
          category: 'Specials',
          price: 95,
          description: 'Six freshly shucked Kumamoto oysters topped with Beluga caviar, champagne mignonette, and gold flakes.',
          image: '/images/caviar_oysters.png',
          tags: ['Seafood', 'Fresh'],
          allergens: ['Shellfish']
        },
        {
          id: 'main-1',
          name: 'Pan-Seared Duck Breast',
          category: 'Mains',
          price: 48,
          description: 'Crispy skin duck breast, spiced cherry reduction, parsnip purée, glazed heirloom carrots.',
          image: '/images/duck_breast.png',
          tags: ['Non-Veg', 'GF'],
          allergens: []
        },
        {
          id: 'main-2',
          name: 'Truffle Glazed Filet Mignon',
          category: 'Mains',
          price: 58,
          description: '8oz USDA Prime tenderloin, truffle potato purée, glazed organic heirloom carrots, rich bone marrow reduction.',
          image: '/images/filet_mignon.png',
          tags: ['Non-Veg', 'GF'],
          allergens: []
        },
        {
          id: 'des-1',
          name: 'Valrhona Dark Chocolate Soufflé',
          category: 'Desserts',
          price: 18,
          description: '70% Valrhona dark chocolate soufflé, Tahitian vanilla bean gelato, warm salted caramel drizzle.',
          image: '/images/chocolate_souffle.png',
          tags: ['Veg'],
          allergens: ['Dairy', 'Gluten']
        },
        {
          id: 'drk-1',
          name: 'Royal Gold Old Fashioned',
          category: 'Beverages',
          price: 28,
          description: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips, served with a gold-leaf ice sphere.',
          image: '/images/old_fashioned.png',
          tags: ['Signature'],
          allergens: []
        }
      ];
    }

    res.json({
      success: true,
      data: {
        tenantId: tenantId || 'tenant-primary',
        tenantInfo,
        branding: brandingConfig,
        categories,
        items: menuItems
      }
    });

  } catch (error: any) {
    console.error('[Public Menu API Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load public menu.' });
  }
};


