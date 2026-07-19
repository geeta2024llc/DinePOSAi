'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest, isDemoTenant } from '@/utils/api';

interface MenuTabProps {
  t: any;
  tr: any;
  currency: string;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function MenuTab({ t, tr, currency, triggerToast }: MenuTabProps) {
  const [menuItemsList, setMenuItemsList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('all');
  const [menuPage, setMenuPage] = useState(1);
  const [menuSortField, setMenuSortField] = useState<'name' | 'price' | 'cost' | 'margin' | 'category'>('name');
  const [menuSortOrder, setMenuSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Form states
  const [showMenuAddEditModal, setShowMenuAddEditModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null);
  
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  
  // Menu Item Form States
  const [menuFormName, setMenuFormName] = useState('');
  const [menuFormPrice, setMenuFormPrice] = useState(0);
  const [menuFormCost, setMenuFormCost] = useState(0);
  const [menuFormCategory, setMenuFormCategory] = useState('');
  const [menuFormDescription, setMenuFormDescription] = useState('');
  const [menuFormImage, setMenuFormImage] = useState('');
  const [menuFormTags, setMenuFormTags] = useState<string[]>([]);
  const [menuFormMealPeriod, setMenuFormMealPeriod] = useState('both');
  const [menuFormPairingId, setMenuFormPairingId] = useState('');
  const [pairingSearchQuery, setPairingSearchQuery] = useState('');

  // Category Form States
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormIcon, setCategoryFormIcon] = useState('restaurant');

  const currencySymbols: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' };
  const currencyRates: Record<string, number> = { USD: 1, JPY: 150, EUR: 0.92, GBP: 0.79, CNY: 7.24, KRW: 1340 };
  
  const formatCurrency = (val: number) => {
    const rate = currencyRates[currency] || 1;
    const sym = currencySymbols[currency] || '$';
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(converted).toLocaleString()}`;
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const defaultMenuItems = [
    { id: 'app-1', name: 'Truffle Burrata Salad', category: 'starters', price: 24, cost: 6, description: 'Creamy burrata imported from Puglia, fresh heirloom cherry tomatoes, shaved black summer truffles, aged balsamic glaze.', image: '/images/burrata_salad.png', tags: ['Veg', 'GF'] },
    { id: 'app-2', name: 'Seared Hokkaido Scallops', category: 'starters', price: 28, cost: 9, description: 'Pan-seared giant scallops, sweet parsnip purée, crispy jamón ibérico crumbs, micro-herbs, lemon-herb brown butter.', image: '/images/scallops.png', tags: ['GF', 'Seafood'] },
    { id: 'main-1', name: 'Miyazaki A5 Wagyu Ribeye', category: 'mains', price: 110, cost: 38, description: '150g authentic Japanese Miyazaki A5 wagyu steak, roasted garlic purée, seasonal baby vegetables, premium black sea salt.', image: '/images/wagyu_ribeye.png', tags: ['GF'] },
    { id: 'main-2', name: 'Acquerello Mushroom Risotto', category: 'mains', price: 38, cost: 8, description: '7-year aged Acquerello carnaroli rice, wild chanterelle and porcini mushrooms, parmigiano-reggiano, fresh herbs.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] },
    { id: 'dess-1', name: 'Decadent Chocolate Soufflé', category: 'desserts', price: 18, cost: 5, description: 'Baked-to-order Valrhona dark chocolate soufflé, served with house-made Madagascar vanilla bean gelato sauce.', image: '/images/chocolate_souffle.png', tags: ['Veg'] },
    { id: 'dess-2', name: 'Saffron Crème Brûlée', category: 'desserts', price: 16, cost: 4, description: 'Silky saffron-infused custard with a perfectly caramelized sugar crust, macerated wild berries.', image: '/images/saffron_creme_brulee.png', tags: ['Veg', 'GF'] },
    { id: 'drink-1', name: 'Royal Gold Old Fashioned', category: 'drinks', price: 28, cost: 8, description: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips, served with a gold-leaf ice sphere.', image: '/images/old_fashioned.png', tags: ['GF'] },
    { id: 'drink-2', name: 'Signature Emerald Gimlet', category: 'drinks', price: 22, cost: 6, description: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence, served in a chilled crystal coupette.', image: '/images/emerald_gimlet.png', tags: ['GF', 'Veg'] }
  ];

  const defaultCategories = [
    { id: 'special', name: 'Our Special', icon: 'auto_awesome' },
    { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' },
    { id: 'starters', name: 'Starters', icon: 'restaurant' },
    { id: 'mains', name: 'Main Course', icon: 'restaurant_menu' },
    { id: 'desserts', name: 'Desserts', icon: 'icecream' },
    { id: 'drinks', name: 'Drinks', icon: 'local_bar' }
  ];

  useEffect(() => {
    const loadMenuAndCategories = async () => {
      try {
        const catRes = await apiRequest<any[]>('/api/menu/categories');
        const itemRes = await apiRequest<any[]>('/api/menu/items');

        if (catRes.success && itemRes.success && catRes.data && itemRes.data) {
          let resolvedCategories = catRes.data;
          if (resolvedCategories.length === 0) {
            const defaultCats = ['Our Special', 'Combo Set', 'Starters', 'Main Course', 'Desserts', 'Drinks'];
            for (const catName of defaultCats) {
              await apiRequest('/api/menu/categories', { method: 'POST', body: JSON.stringify({ name: catName }), useAuth: true });
            }
            const refreshedCatRes = await apiRequest<any[]>('/api/menu/categories');
            if (refreshedCatRes.success && refreshedCatRes.data) {
              resolvedCategories = refreshedCatRes.data;
            }
          }

          const mappedCategories = resolvedCategories.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || 'restaurant'
          }));
          
          const mappedItems = (itemRes.data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.categoryId,
            price: item.price,
            cost: item.cost || Math.round(item.price * 0.3),
            description: item.description || '',
            image: item.imageUrl || '/images/wagyu_ribeye.png',
            tags: item.tags || [],
            mealPeriod: item.mealPeriod || 'both',
            pairingId: item.pairingId || '',
            active: item.isAvailable !== false
          }));

          setCategories(mappedCategories);
          setMenuItemsList(mappedItems);
          
          localStorage.setItem('dinepos_menu_categories', JSON.stringify(mappedCategories));
          localStorage.setItem('dinepos_menu_items', JSON.stringify(mappedItems));
          return;
        }

        // Offline Fallback
        const savedMenu = localStorage.getItem('dinepos_menu_items');
        if (savedMenu) {
          try {
            let loadedItems = JSON.parse(savedMenu);
            if (isDemoTenant() && !loadedItems.some((item: any) => item.category === 'combos')) {
              const defaultCombos = [
                { id: 'combo-1', name: 'Imperial Signature Combo', category: 'combos', price: 120, cost: 40, description: 'A luxurious set featuring our Wagyu Beef Tartare starter, Truffle Glazed Filet Mignon main course, and Chocolate Soufflé dessert.', image: '/images/wagyu_ribeye.png', tags: ['Non-Veg'] },
                { id: 'combo-2', name: 'Royal Vegetarian Tasting Set', category: 'combos', price: 75, cost: 20, description: 'A curated vegetarian experience: Truffle Burrata Salad starter, Acquerello Mushroom Risotto main, and Saffron Crème Brûlée.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] }
              ];
              loadedItems = [...loadedItems, ...defaultCombos];
              localStorage.setItem('dinepos_menu_items', JSON.stringify(loadedItems));
            }
            setMenuItemsList(loadedItems);
          } catch (e) {
            setMenuItemsList(isDemoTenant() ? defaultMenuItems : []);
          }
        } else {
          const fallbackItems = isDemoTenant() ? defaultMenuItems : [];
          setMenuItemsList(fallbackItems);
          if (fallbackItems.length > 0) {
            localStorage.setItem('dinepos_menu_items', JSON.stringify(fallbackItems));
          }
        }

        const savedCategories = localStorage.getItem('dinepos_menu_categories');
        if (savedCategories) {
          try {
            let loadedCategories = JSON.parse(savedCategories);
            loadedCategories = loadedCategories.map((c: any) => 
              c.id === 'combos' ? { ...c, name: 'Combo Set' } : c
            );
            if (isDemoTenant() && !loadedCategories.some((c: any) => c.id === 'combos')) {
              const specIdx = loadedCategories.findIndex((c: any) => c.id === 'special');
              if (specIdx !== -1) {
                loadedCategories.splice(specIdx + 1, 0, { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' });
              } else {
                loadedCategories.unshift({ id: 'combos', name: 'Combo Set', icon: 'lunch_dining' });
              }
            }
            localStorage.setItem('dinepos_menu_categories', JSON.stringify(loadedCategories));
            setCategories(loadedCategories);
          } catch (e) {
            setCategories(isDemoTenant() ? defaultCategories : []);
          }
        } else {
          const fallbackCategories = isDemoTenant() ? defaultCategories : [];
          setCategories(fallbackCategories);
          if (fallbackCategories.length > 0) {
            localStorage.setItem('dinepos_menu_categories', JSON.stringify(fallbackCategories));
          }
        }
      } catch (err) {
        console.error('Failed to load menu / categories:', err);
      }
    };

    loadMenuAndCategories();
  }, []);

  // Listen for cross-tab storage updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_menu_items' && e.newValue) {
        try { setMenuItemsList(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === 'dinepos_menu_categories' && e.newValue) {
        try { setCategories(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggleSpecial = async (item: any) => {
    const updatedCategory = item.category === 'special' ? 'mains' : 'special';
    let targetCatId = updatedCategory;
    if (updatedCategory === 'special') {
      const specCat = categories.find(c => c.name.toLowerCase().includes('special') || c.id === 'special');
      if (specCat) targetCatId = specCat.id;
    } else {
      const mainCat = categories.find(c => c.name.toLowerCase().includes('main') || c.id === 'mains');
      if (mainCat) targetCatId = mainCat.id;
    }

    await apiRequest(`/api/menu/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryId: targetCatId })
    });

    const updatedList = menuItemsList.map(m => 
      m.id === item.id ? { ...m, category: targetCatId } : m
    );
    setMenuItemsList(updatedList);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
    triggerToast(item.category === 'special' ? `Removed ${item.name} from Specials.` : `Marked ${item.name} as Special Dish!`, 'success');
  };

  const handleToggleActive = async (item: any) => {
    const isActive = item.active !== false;
    
    await apiRequest(`/api/menu/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isAvailable: !isActive })
    });

    const updatedList = menuItemsList.map(m => 
      m.id === item.id ? { ...m, active: !isActive } : m
    );
    setMenuItemsList(updatedList);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
    triggerToast(isActive ? `Hid ${item.name} from Digital Menu.` : `Showed ${item.name} on Digital Menu!`, 'success');
  };

  const handleDeleteMenuItem = async (id: string) => {
    await apiRequest(`/api/menu/items/${id}`, {
      method: 'DELETE'
    });

    const updatedList = menuItemsList.filter(m => m.id !== id);
    setMenuItemsList(updatedList);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
    triggerToast('Menu item deleted successfully.', 'success');
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormName.trim()) {
      triggerToast('Item name is required.', 'info');
      return;
    }
    if (menuFormPrice < 0 || menuFormCost < 0) {
      triggerToast('Price and Cost must be non-negative.', 'info');
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (editingMenuItem) {
        response = await apiRequest(`/api/menu/items/${editingMenuItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            categoryId: menuFormCategory,
            name: menuFormName,
            description: menuFormDescription,
            price: menuFormPrice,
            imageUrl: menuFormImage,
            isAvailable: true
          })
        });
      } else {
        response = await apiRequest('/api/menu/items', {
          method: 'POST',
          body: JSON.stringify({
            categoryId: menuFormCategory,
            name: menuFormName,
            description: menuFormDescription,
            price: menuFormPrice,
            imageUrl: menuFormImage
          })
        });
      }

      setIsLoading(false);

      if (response.success) {
        const dbItem = response.data?.item || response.data;
        const itemId = dbItem?.id || editingMenuItem?.id || `item-${Date.now()}`;
        
        let updatedList;
        if (editingMenuItem) {
          updatedList = menuItemsList.map(m => 
            m.id === editingMenuItem.id 
              ? { 
                  ...m, 
                  name: menuFormName, 
                  category: menuFormCategory, 
                  price: menuFormPrice, 
                  cost: menuFormCost, 
                  description: menuFormDescription, 
                  image: menuFormImage, 
                  tags: menuFormTags,
                  mealPeriod: menuFormMealPeriod,
                  pairingId: menuFormPairingId
                }
              : m
          );
          triggerToast(`Successfully updated menu item: ${menuFormName}`, 'success');
        } else {
          const newItem = {
            id: itemId,
            name: menuFormName,
            category: menuFormCategory,
            price: menuFormPrice,
            cost: menuFormCost,
            description: menuFormDescription,
            image: menuFormImage,
            tags: menuFormTags,
            mealPeriod: menuFormMealPeriod,
            pairingId: menuFormPairingId,
            active: true
          };
          updatedList = [...menuItemsList, newItem];
          triggerToast(`Successfully added menu item: ${menuFormName}`, 'success');
        }

        setMenuItemsList(updatedList);
        localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
        setShowMenuAddEditModal(false);
        setEditingMenuItem(null);
        return;
      }

      if (response.isOfflineFallback) {
        let updatedList;
        if (editingMenuItem) {
          updatedList = menuItemsList.map(m =>
            m.id === editingMenuItem.id
              ? {
                  ...m,
                  name: menuFormName,
                  category: menuFormCategory,
                  price: menuFormPrice,
                  cost: menuFormCost,
                  description: menuFormDescription,
                  image: menuFormImage,
                  tags: menuFormTags,
                  mealPeriod: menuFormMealPeriod,
                  pairingId: menuFormPairingId
                }
              : m
          );
          triggerToast(`Successfully updated menu item: ${menuFormName} (Offline)`, 'success');
        } else {
          const newId = `item-${Date.now()}`;
          const newItem = {
            id: newId,
            name: menuFormName,
            category: menuFormCategory,
            price: menuFormPrice,
            cost: menuFormCost,
            description: menuFormDescription,
            image: menuFormImage,
            tags: menuFormTags,
            mealPeriod: menuFormMealPeriod,
            pairingId: menuFormPairingId,
            active: true
          };
          updatedList = [...menuItemsList, newItem];
          triggerToast(`Successfully added menu item: ${menuFormName} (Offline)`, 'success');
        }

        setMenuItemsList(updatedList);
        localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
        setShowMenuAddEditModal(false);
        setEditingMenuItem(null);
        return;
      }

      triggerToast(response.error || 'Failed to save menu item.', 'info');
    } catch (err: any) {
      setIsLoading(false);
      triggerToast(err.message || 'Error saving menu item.', 'info');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormName.trim()) {
      triggerToast('Category name is required.', 'info');
      return;
    }

    try {
      let response;
      if (editingCategory) {
        response = await apiRequest(`/api/menu/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: categoryFormName })
        });
      } else {
        response = await apiRequest('/api/menu/categories', {
          method: 'POST',
          body: JSON.stringify({ name: categoryFormName })
        });
      }

      if (response.success) {
        const dbCategory = response.data?.category || response.data;
        const catId = dbCategory?.id || editingCategory?.id || categoryFormName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        let updatedList;
        if (editingCategory) {
          updatedList = categories.map(cat =>
            cat.id === editingCategory.id
              ? { ...cat, name: categoryFormName, icon: categoryFormIcon }
              : cat
          );
          triggerToast(`Category updated: ${categoryFormName}`, 'success');
        } else {
          const newCategory = {
            id: catId,
            name: categoryFormName,
            icon: categoryFormIcon
          };
          updatedList = [...categories, newCategory];
          triggerToast(`Category added: ${categoryFormName}`, 'success');
        }

        setCategories(updatedList);
        localStorage.setItem('dinepos_menu_categories', JSON.stringify(updatedList));
        setEditingCategory(null);
        setCategoryFormName('');
        setCategoryFormIcon('restaurant');
        return;
      }

      if (response.isOfflineFallback) {
        let updatedList;
        if (editingCategory) {
          updatedList = categories.map(cat =>
            cat.id === editingCategory.id
              ? { ...cat, name: categoryFormName, icon: categoryFormIcon }
              : cat
          );
          triggerToast(`Category updated: ${categoryFormName} (Offline)`, 'success');
        } else {
          const generatedId = categoryFormName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now()}`;
          if (categories.some(c => c.id === generatedId)) {
            triggerToast('A category with a similar name already exists.', 'info');
            return;
          }
          const newCategory = {
            id: generatedId,
            name: categoryFormName,
            icon: categoryFormIcon
          };
          updatedList = [...categories, newCategory];
          triggerToast(`Category added: ${categoryFormName} (Offline)`, 'success');
        }

        setCategories(updatedList);
        localStorage.setItem('dinepos_menu_categories', JSON.stringify(updatedList));
        setEditingCategory(null);
        setCategoryFormName('');
        setCategoryFormIcon('restaurant');
        return;
      }

      triggerToast(response.error || 'Failed to save category.', 'info');
    } catch (err: any) {
      triggerToast(err.message || 'Error saving category.', 'info');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (categories.length <= 1) {
      triggerToast('Cannot delete the last category. At least one category must exist.', 'info');
      return;
    }

    await apiRequest(`/api/menu/categories/${id}`, {
      method: 'DELETE'
    });

    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem('dinepos_menu_categories', JSON.stringify(updatedCategories));

    const fallbackCategory = updatedCategories[0].id;
    const updatedItems = menuItemsList.map(item =>
      item.category === id ? { ...item, category: fallbackCategory } : item
    );
    setMenuItemsList(updatedItems);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedItems));

    triggerToast(`Category deleted. Items moved to ${updatedCategories[0].name}.`, 'success');
    if (editingCategory && editingCategory.id === id) {
      setEditingCategory(null);
      setCategoryFormName('');
      setCategoryFormIcon('restaurant');
    }
  };

  const filteredItems = menuItemsList
    .filter(item => {
      const matchesCategory = menuFilterCategory === 'all' || item.category === menuFilterCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let fieldA: any = a[menuSortField];
      let fieldB: any = b[menuSortField];

      if (menuSortField === 'margin') {
        fieldA = ((a.price - (a.cost || 0)) / (a.price || 1)) * 100;
        fieldB = ((b.price - (b.cost || 0)) / (b.price || 1)) * 100;
      }

      if (typeof fieldA === 'string') {
        return menuSortOrder === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else {
        return menuSortOrder === 'asc'
          ? (fieldA || 0) - (fieldB || 0)
          : (fieldB || 0) - (fieldA || 0);
      }
    });

  const perPage = 10;
  const totalPages = Math.ceil(filteredItems.length / perPage) || 1;
  const startIdx = (menuPage - 1) * perPage;
  const paginatedItems = filteredItems.slice(startIdx, startIdx + perPage);

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Header section with Title and Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
        <div>
          <h2 className={`font-serif text-[38px] font-bold ${t.text} tracking-wide leading-none`}>
            {tr.menuWelcome}
          </h2>
          <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
            {tr.menuDesc}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 select-none">
          <button type="button"
            onClick={() => setShowCategoryManagerModal(true)}
            className={`px-4 py-2.5 bg-white/5 hover:bg-white/10 border ${t.borderStrong} ${t.text} rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5`}
          >
            <span className="material-symbols-outlined text-sm">category</span>
            {tr.manageCats}
          </button>
          <button type="button"
            onClick={() => {
              setEditingMenuItem(null);
              setMenuFormName('');
              setMenuFormCategory(categories[0]?.id || 'starters');
              setMenuFormPrice(15);
              setMenuFormCost(4);
              setMenuFormDescription('');
              setMenuFormImage('/images/wagyu_beef_tartare.png');
              setMenuFormTags([]);
              setMenuFormMealPeriod('both');
              setMenuFormPairingId('');
              setPairingSearchQuery('');
              setShowMenuAddEditModal(true);
            }}
            className={`px-4 py-2.5 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-md`}
          >
            <span className="material-symbols-outlined text-sm font-extrabold">add</span>
            {tr.addMenuItem}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-5 shadow-lg`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
              {tr.totalItems}
            </span>
            <span className={`material-symbols-outlined ${t.textMuted} text-lg`}>restaurant_menu</span>
          </div>
          <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>{menuItemsList.length}</h3>
        </div>
        <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-5 shadow-lg`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
              {tr.specDishes}
            </span>
            <span className={`material-symbols-outlined ${t.accent} text-lg`}>auto_awesome</span>
          </div>
          <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>
            {menuItemsList.filter(item => item.category === 'special').length}
          </h3>
        </div>
        <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-5 shadow-lg`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
              {tr.avgProfit}
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-lg">trending_up</span>
          </div>
          <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {menuItemsList.length > 0
              ? `${(menuItemsList.reduce((sum, item) => sum + ((item.price - (item.cost || 0)) / (item.price || 1) * 100), 0) / menuItemsList.length).toFixed(1)}%`
              : '0.0%'
            }
          </h3>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0e0e0d]/30 border border-white/5 p-4 rounded-2xl select-none">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button type="button"
            onClick={() => { setMenuFilterCategory('all'); setMenuPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${menuFilterCategory === 'all' ? `${t.accentBg} ${t.accentText}` : `bg-white/5 text-[#A69984] hover:bg-white/10`}`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button type="button"
              key={cat.id}
              onClick={() => { setMenuFilterCategory(cat.id); setMenuPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${menuFilterCategory === cat.id ? `${t.accentBg} ${t.accentText}` : `bg-white/5 text-[#A69984] hover:bg-white/10`}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <span className={`material-symbols-outlined absolute left-3.5 top-3 ${t.textMutedDark} text-sm`}>search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setMenuPage(1); }}
            placeholder="Search menu items..."
            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-10 pr-4 py-2.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
          />
        </div>
      </div>

      {/* Menu Items Table */}
      <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                <th className="py-4 px-4 sm:px-6 cursor-pointer" onClick={() => { setMenuSortField('name'); setMenuSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  {tr.itemCol}
                </th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell cursor-pointer" onClick={() => { setMenuSortField('category'); setMenuSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  {tr.categoryCol}
                </th>
                <th className="py-4 px-4 sm:px-6 text-right hidden lg:table-cell cursor-pointer" onClick={() => { setMenuSortField('cost'); setMenuSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  {tr.costCol}
                </th>
                <th className="py-4 px-4 sm:px-6 text-right cursor-pointer" onClick={() => { setMenuSortField('price'); setMenuSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  {tr.priceCol}
                </th>
                <th className="py-4 px-4 sm:px-6 text-right hidden md:table-cell cursor-pointer" onClick={() => { setMenuSortField('margin'); setMenuSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  {tr.marginCol}
                </th>
                <th className="py-4 px-4 sm:px-6 text-center">{tr.actionsCol}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divider}`}>
              {paginatedItems.map((item) => {
                const margin = ((item.price - (item.cost || 0)) / (item.price || 1)) * 100;
                const marginColor = margin >= 70 ? 'text-emerald-400' : margin >= 50 ? 'text-white/80' : 'text-rose-400';

                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 sm:px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/images/wagyu_beef_tartare.png'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-white/5 flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100'; }}
                        />
                        <div>
                          <div className={`text-xs font-bold ${t.text}`}>{item.name}</div>
                          <div className="flex flex-wrap gap-1 mt-1 items-center">
                            {item.tags?.map((tag: string) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] uppercase tracking-wide text-[#A69984]/60 font-extrabold">
                                {tag}
                              </span>
                            ))}
                            {item.active === false && (
                              <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/25 rounded text-[8px] uppercase tracking-wide text-rose-400 font-extrabold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[9px] leading-none">visibility_off</span>
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-middle capitalize text-xs text-[#A69984] hidden md:table-cell">
                      {categories.find(c => c.id === item.category)?.name || item.category}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right align-middle font-mono font-bold text-white/70 hidden lg:table-cell">
                      {formatCurrency(item.cost || 0)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right align-middle font-mono font-bold text-[#ffe2ab]">
                      {formatCurrency(item.price || 0)}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 text-right align-middle font-mono font-bold ${marginColor} hidden md:table-cell`}>
                      {margin.toFixed(1)}%
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-middle">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button type="button"
                          onClick={() => handleToggleSpecial(item)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${item.category === 'special' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : `${t.borderStrong} hover:border-amber-500/20 text-[#A69984] hover:text-amber-400`} cursor-pointer`}
                          title={item.category === 'special' ? "Remove from Specials" : "Make Special Dish"}
                        >
                          <span className={`material-symbols-outlined text-[15px] ${item.category === 'special' ? 'fill-amber-400' : ''}`}>auto_awesome</span>
                        </button>
                        <button type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${item.active !== false ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} cursor-pointer`}
                          title={item.active !== false ? "Hide from Digital Menu" : "Show on Digital Menu"}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {item.active !== false ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                        <button type="button"
                          onClick={() => {
                            setEditingMenuItem(item);
                            setMenuFormName(item.name);
                            setMenuFormCategory(item.category);
                            setMenuFormPrice(item.price);
                            setMenuFormCost(item.cost || 0);
                            setMenuFormDescription(item.description || '');
                            setMenuFormImage(item.image || '/images/wagyu_beef_tartare.png');
                            setMenuFormTags(item.tags || []);
                            setMenuFormMealPeriod(item.mealPeriod || 'both');
                            setMenuFormPairingId(item.pairingId || '');
                            setPairingSearchQuery('');
                            setShowMenuAddEditModal(true);
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-[#ffe2ab]/20 text-[#A69984] hover:text-[#ffe2ab] transition-colors cursor-pointer`}
                          title="Edit Item"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button type="button"
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-red-500/20 text-[#A69984] hover:text-red-400 transition-colors cursor-pointer`}
                          title="Delete Item"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#A69984]/40 font-sans text-sm select-none">
                    No menu items found. Click "Add Menu Item" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={`p-4 border-t ${t.borderStrong} flex justify-between items-center bg-[#0d0d0c] select-none text-[11px]`}>
          <span className={t.textMuted}>
            Showing page <strong className="text-white font-mono">{menuPage}</strong> of <strong className="text-white font-mono">{totalPages}</strong> ({filteredItems.length} items)
          </span>
          <div className="flex gap-2">
            <button type="button"
              disabled={menuPage === 1}
              onClick={() => setMenuPage(prev => Math.max(prev - 1, 1))}
              className={`px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 ${t.text} transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <button type="button"
              disabled={menuPage >= totalPages}
              onClick={() => setMenuPage(prev => Math.min(prev + 1, totalPages))}
              className={`px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 ${t.text} transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MENU ITEM MODAL */}
      {showMenuAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans p-4">
          <div className={`${t.cardBgOpaque} border w-full max-w-[460px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 animate-scale-up custom-scrollbar`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button type="button"
                onClick={() => {
                  setShowMenuAddEditModal(false);
                  setEditingMenuItem(null);
                }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Item Name</label>
                <input
                  type="text"
                  value={menuFormName}
                  onChange={(e) => setMenuFormName(e.target.value)}
                  placeholder="e.g. Imperial Beluga Caviar"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Category</label>
                <div className="relative">
                  <select
                    aria-label="Menu category"
                    value={menuFormCategory}
                    onChange={(e) => setMenuFormCategory(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none capitalize`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Cost & Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Cost Price ($)</label>
                  <input
                    type="number"
                    value={menuFormCost}
                    onChange={(e) => setMenuFormCost(parseFloat(e.target.value) || 0)}
                    placeholder="4"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Selling Price ($)</label>
                  <input
                    type="number"
                    value={menuFormPrice}
                    onChange={(e) => setMenuFormPrice(parseFloat(e.target.value) || 0)}
                    placeholder="15"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Description</label>
                <textarea
                  value={menuFormDescription}
                  onChange={(e) => setMenuFormDescription(e.target.value)}
                  placeholder="Describe your dish highlights..."
                  className={`w-full h-20 ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium resize-none`}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Image URL</label>
                <input
                  type="text"
                  value={menuFormImage}
                  onChange={(e) => setMenuFormImage(e.target.value)}
                  placeholder="/images/dish.png"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              {/* Meal Period */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Meal Period Availability</label>
                <div className="relative">
                  <select
                    aria-label="Meal period"
                    value={menuFormMealPeriod}
                    onChange={(e) => setMenuFormMealPeriod(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="both">All Day (Both)</option>
                    <option value="lunch">Lunch Only</option>
                    <option value="dinner">Dinner Only</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Food Tags */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>Food Tags</label>
                <div className="flex flex-wrap gap-2">
                  {['GF', 'Veg', 'Non-Veg', 'Seafood', 'Halal', 'Nuts-Free'].map(tag => {
                    const hasTag = menuFormTags.includes(tag);
                    return (
                      <button type="button"
                        key={tag}
                        onClick={() => {
                          if (hasTag) {
                            setMenuFormTags(menuFormTags.filter(t => t !== tag));
                          } else {
                            setMenuFormTags([...menuFormTags, tag]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${hasTag ? 'bg-[#ffe2ab]/15 border-[#ffe2ab]/40 text-[#ffe2ab]' : 'border-white/5 bg-white/5 text-[#A69984]/60 hover:text-white'}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button type="button"
                  onClick={() => {
                    setShowMenuAddEditModal(false);
                    setEditingMenuItem(null);
                  }}
                  className={`flex-1 py-3 bg-white/5 hover:bg-white/10 ${t.text} rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center`}
                >
                  Cancel
                </button>
                <button type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center shadow-md disabled:opacity-50`}
                >
                  {isLoading ? 'Saving...' : 'Save Dish'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGER MODAL */}
      {showCategoryManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans p-4">
          <div className={`${t.cardBgOpaque} border w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 animate-scale-up custom-scrollbar`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>
                {tr.categoryManager}
              </h3>
              <button type="button"
                onClick={() => {
                  setShowCategoryManagerModal(false);
                  setEditingCategory(null);
                  setCategoryFormName('');
                  setCategoryFormIcon('restaurant');
                }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
              <div className="space-y-4">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${t.textMuted}`}>
                  {editingCategory ? 'Edit Category Option' : 'Create New Category'}
                </h4>
                
                <div>
                  <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-1.5`}>Category Name</label>
                  <input
                    type="text"
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    placeholder="e.g. Soups & Broths"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3.5 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  {editingCategory && (
                    <button type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormName('');
                        setCategoryFormIcon('restaurant');
                      }}
                      className={`flex-1 py-2.5 bg-white/5 border ${t.borderStrong} hover:bg-white/10 ${t.text} text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer text-center`}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit"
                    className={`flex-1 py-2.5 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer text-center shadow-md`}
                  >
                    {editingCategory ? 'Save' : 'Add Category'}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Category Icon</label>
                <div className="grid grid-cols-4 gap-2 p-2 bg-[#0e0e0d] rounded-xl border border-white/5">
                  {[
                    'restaurant', 'local_bar', 'icecream', 'auto_awesome',
                    'ramen_dining', 'bakery_dining', 'soup_kitchen', 'dinner_dining'
                  ].map(iconName => {
                    const isSelected = categoryFormIcon === iconName;
                    return (
                      <button type="button"
                        key={iconName}
                        onClick={() => setCategoryFormIcon(iconName)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/30 text-[#ffe2ab]'
                            : 'border-transparent text-[#A69984]/50 hover:text-white hover:bg-white/5'
                        }`}
                        title={iconName.replace('_', ' ')}
                      >
                        <span className="material-symbols-outlined text-base">{iconName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${t.textMuted}`}>
                Active Categories ({categories.length})
              </h4>
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className={`flex justify-between items-center p-3 bg-[#12110f] border ${t.border} rounded-xl hover:border-white/10 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                        <span className="material-symbols-outlined text-sm">{cat.icon || 'restaurant_menu'}</span>
                      </span>
                      <div className="text-left font-sans">
                        <div className={`text-xs font-bold ${t.text}`}>{cat.name}</div>
                        <div className={`text-[8.5px] ${t.textMutedLight} font-mono mt-0.5`}>ID: {cat.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryFormName(cat.name);
                          setCategoryFormIcon(cat.icon || 'restaurant');
                        }}
                        className={`w-7 h-7 rounded-md flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-[#ffe2ab]/20 text-[#A69984] hover:text-[#ffe2ab] transition-colors cursor-pointer`}
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                      <button type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-red-500/20 text-[#A69984] hover:text-red-400 transition-colors cursor-pointer`}
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
