'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { migrateCart, generateCartKey } from './cartUtils';

type SpicyLevel = 'Mild' | 'Normal' | 'Hot' | 'Super Hot';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  allergens?: string[];
  spicyLevel?: SpicyLevel;
}

interface CartItem {
  itemId: string;
  quantity: number;
  modifiers: string[];
  course: 'starter' | 'main' | 'dessert' | 'drinks';
  notes?: string;
}

const menuItems: MenuItem[] = [
  // Specials
  {
    id: 'spec-1',
    name: 'Gold Leaf A5 Wagyu Ribeye',
    category: 'special',
    price: 185,
    description: '300g Japanese A5 Miyazaki Wagyu, seared over binchotan charcoal, brushed with truffle glaze, adorned with 24k gold leaf.',
    image: '/images/wagyu_ribeye.png',
    tags: ['GF', 'Non-Veg'],
    allergens: []
  },
  {
    id: 'spec-2',
    name: 'Beluga Caviar & Oysters',
    category: 'special',
    price: 95,
    description: 'Six freshly shucked Kumamoto oysters topped with Beluga caviar, champagne mignonette, and gold flakes.',
    image: '/images/caviar_oysters.png',
    tags: ['Seafood', 'Non-Veg'],
    allergens: ['Shellfish']
  },
  // Combos
  {
    id: 'combo-1',
    name: 'Imperial Signature Combo',
    category: 'combos',
    price: 120,
    description: 'A luxurious set featuring our Wagyu Beef Tartare starter, Truffle Glazed Filet Mignon main course, and Chocolate Soufflé dessert.',
    image: '/images/wagyu_ribeye.png',
    tags: ['Non-Veg'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'combo-2',
    name: 'Royal Vegetarian Tasting Set',
    category: 'combos',
    price: 75,
    description: 'A curated vegetarian experience: Truffle Burrata Salad starter, Acquerello Mushroom Risotto main, and Saffron Crème Brûlée.',
    image: '/images/mushroom_risotto.png',
    tags: ['Veg', 'GF'],
    allergens: ['Dairy']
  },
  // Starters
  {
    id: 'start-1',
    name: 'Wagyu Beef Tartare',
    category: 'starters',
    price: 38,
    description: 'Hand-cut A5 Wagyu, quail egg yolk, cornichons, shallots, Dijon emulsion, served with toasted brioche points.',
    image: '/images/wagyu_beef_tartare.png',
    tags: ['Non-Veg'],
    allergens: [],
    spicyLevel: 'Mild' as SpicyLevel
  },
  {
    id: 'start-2',
    name: 'Truffle Burrata Salad',
    category: 'starters',
    price: 26,
    description: 'Creamy Italian burrata, heirloom cherry tomatoes, fresh basil, aged balsamic, shaved black winter truffle.',
    image: '/images/truffle_burrata_salad.png',
    tags: ['Veg', 'GF'],
    allergens: ['Dairy']
  },
  {
    id: 'start-3',
    name: 'Pan-Seared Jumbo Scallops',
    category: 'starters',
    price: 42,
    description: 'Pan-seared jumbo scallops, sweet pea purée, crispy pancetta, meyer lemon beurre blanc.',
    image: '/images/pan_seared_scallops.png',
    tags: ['Seafood', 'Non-Veg'],
    allergens: ['Shellfish'],
    spicyLevel: 'Normal' as SpicyLevel
  },
  // Mains
  {
    id: 'main-1',
    name: 'Acquerello Mushroom Risotto',
    category: 'mains',
    price: 32,
    description: 'Acquerello carnaroli rice, foraged forest mushrooms, Parmigiano-Reggiano, fresh black truffle shavings.',
    image: '/images/mushroom_risotto.png',
    tags: ['Veg', 'GF'],
    allergens: ['Dairy']
  },
  {
    id: 'main-2',
    name: 'Crispy Skin Sea Bass',
    category: 'mains',
    price: 45,
    description: 'Crispy skin Chilean sea bass served over creamy saffron risotto, topped with microgreens and citrus beurre blanc.',
    image: '/images/sea_bass.png',
    tags: ['Seafood', 'Non-Veg'],
    allergens: ['Fish']
  },
  {
    id: 'main-3',
    name: 'Truffle Glazed Filet Mignon',
    category: 'mains',
    price: 58,
    description: '8oz USDA Prime tenderloin, truffle potato purée, glazed organic heirloom carrots, rich bone marrow reduction.',
    image: '/images/filet_mignon.png',
    tags: ['GF', 'Non-Veg'],
    allergens: [],
    spicyLevel: 'Hot' as SpicyLevel
  },
  // Desserts
  {
    id: 'dess-1',
    name: 'Chocolate Soufflé',
    category: 'desserts',
    price: 18,
    description: '70% Valrhona dark chocolate soufflé, Tahitian vanilla bean gelato, warm salted caramel drizzle poured tableside.',
    image: '/images/chocolate_souffle.png',
    tags: ['Veg'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'dess-2',
    name: 'Saffron Crème Brûlée',
    category: 'desserts',
    price: 16,
    description: 'Silky saffron-infused custard with a perfectly caramelized sugar crust, macerated wild berries.',
    image: '/images/saffron_creme_brulee.png',
    tags: ['Veg', 'GF'],
    allergens: ['Dairy']
  },
  // Drinks
  {
    id: 'drink-1',
    name: 'Royal Gold Old Fashioned',
    category: 'drinks',
    price: 28,
    description: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips, served with a gold-leaf ice sphere.',
    image: '/images/old_fashioned.png',
    tags: ['GF'],
    allergens: []
  },
  {
    id: 'drink-2',
    name: 'Signature Emerald Gimlet',
    category: 'drinks',
    price: 22,
    description: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence, served in a chilled crystal coupette.',
    image: '/images/emerald_gimlet.png',
    tags: ['GF', 'Veg'],
    allergens: []
  }
];

const spicyMeta: Record<SpicyLevel, { 
  textColor: string; 
  bg: string; 
  border: string; 
  glow: string;
  flames: number; 
  label: string; 
  subtitle: string; 
}> = {
  'Mild': { 
    textColor: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20', 
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    flames: 1, 
    label: 'Mild', 
    subtitle: 'A subtle, fragrant warmth' 
  },
  'Normal': { 
    textColor: 'text-orange-400', 
    bg: 'bg-orange-500/10', 
    border: 'border-orange-500/20', 
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]',
    flames: 2, 
    label: 'Balanced', 
    subtitle: 'Chef recommended standard' 
  },
  'Hot': { 
    textColor: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20', 
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    flames: 3, 
    label: 'Assertive', 
    subtitle: 'A bold, mouth-coating heat' 
  },
  'Super Hot': { 
    textColor: 'text-red-500', 
    bg: 'bg-red-600/10', 
    border: 'border-red-600/20', 
    glow: 'shadow-[0_0_20px_rgba(220,38,38,0.25)]',
    flames: 4, 
    label: 'Fiery Imperial', 
    subtitle: 'Intense heat for connoisseurs' 
  }
};

const itemModifiersConfig: { [itemId: string]: { title: string; options: { name: string; price?: number }[]; type: 'single' | 'multiple' }[] } = {
  'spec-1': [
    { title: 'Steak Doneness', type: 'single', options: [{ name: 'Rare' }, { name: 'Medium Rare' }, { name: 'Medium' }, { name: 'Well Done' }] },
    { title: 'Premium Add-ons', type: 'multiple', options: [{ name: 'Shaved Black Truffle', price: 15 }, { name: 'Extra 24k Gold Leaf', price: 20 }] }
  ],
  'main-3': [
    { title: 'Steak Doneness', type: 'single', options: [{ name: 'Rare' }, { name: 'Medium Rare' }, { name: 'Medium' }, { name: 'Well Done' }] },
    { title: 'Premium Add-ons', type: 'multiple', options: [{ name: 'Extra Truffle Butter', price: 5 }, { name: 'Lobster Tail', price: 25 }] }
  ],
  'main-2': [
    { title: 'Preparation Style', type: 'single', options: [{ name: 'Crispy Skin (Standard)' }, { name: 'Steamed Ginger Style' }] },
    { title: 'Add-ons', type: 'multiple', options: [{ name: 'Extra Citrus Beurre Blanc', price: 3 }] }
  ],
  'drink-1': [
    { title: 'Ice Preference', type: 'single', options: [{ name: 'Spherical Gold Ice Sphere' }, { name: 'Large Clear Cube' }, { name: 'No Ice' }] }
  ],
  'drink-2': [
    { title: 'Preparation', type: 'single', options: [{ name: 'Chilled Crystal Coupette' }, { name: 'On the Rocks' }] }
  ],
  'dess-1': [
    { title: 'Gelato Flavor', type: 'single', options: [{ name: 'Tahitian Vanilla Bean' }, { name: 'Dark Chocolate Gelato' }] }
  ]
};

const drinkPairings: { [itemId: string]: { id: string; name: string; price: number; image: string; desc: string } } = {
  'spec-1': { id: 'drink-1', name: 'Royal Gold Old Fashioned', price: 28, image: '/images/old_fashioned.png', desc: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips.' },
  'spec-2': { id: 'drink-2', name: 'Signature Emerald Gimlet', price: 22, image: '/images/emerald_gimlet.png', desc: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence.' },
  'start-1': { id: 'drink-1', name: 'Royal Gold Old Fashioned', price: 28, image: '/images/old_fashioned.png', desc: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips.' },
  'start-2': { id: 'drink-2', name: 'Signature Emerald Gimlet', price: 22, image: '/images/emerald_gimlet.png', desc: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence.' },
  'start-3': { id: 'drink-2', name: 'Signature Emerald Gimlet', price: 22, image: '/images/emerald_gimlet.png', desc: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence.' },
  'main-1': { id: 'drink-1', name: 'Royal Gold Old Fashioned', price: 28, image: '/images/old_fashioned.png', desc: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips.' },
  'main-2': { id: 'drink-2', name: 'Signature Emerald Gimlet', price: 22, image: '/images/emerald_gimlet.png', desc: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence.' },
  'main-3': { id: 'drink-1', name: 'Royal Gold Old Fashioned', price: 28, image: '/images/old_fashioned.png', desc: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips.' },
  'dess-1': { id: 'drink-1', name: 'Royal Gold Old Fashioned', price: 28, image: '/images/old_fashioned.png', desc: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips.' },
  'dess-2': { id: 'drink-2', name: 'Signature Emerald Gimlet', price: 22, image: '/images/emerald_gimlet.png', desc: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence.' }
};

export default function DigitalMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon?: string }>>([]);
  const [activeCategory, setActiveCategory] = useState<string>('starters');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState<SpicyLevel>('Normal');



  const [diningOption, setDiningOption] = useState<'all' | 'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_dining_option', diningOption);
      window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_dining_option', newValue: diningOption }));
    }
  }, [diningOption]);
  const [dietaryOption, setDietaryOption] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [tableNumber, setTableNumber] = useState(12);
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Exclusions Config State
  const [exclusionsConfig, setExclusionsConfig] = useState<{
    maxPrice: number;
    excludedTags: string[];
    showAIConcierge: boolean;
    enableSelfCheckout: boolean;
    customerTableNumber?: number;
  }>({
    maxPrice: 40,
    excludedTags: ['Seafood'],
    showAIConcierge: true,
    enableSelfCheckout: true,
    customerTableNumber: 12
  });

  const [userRole, setUserRole] = useState<'customer' | 'waiter'>('customer');
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isTableTemporarilyUnlocked, setIsTableTemporarilyUnlocked] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<{ [cartKey: string]: CartItem }>({
    'start-1--starter': { itemId: 'start-1', quantity: 1, modifiers: [], course: 'starter' },
    'main-1--main': { itemId: 'main-1', quantity: 1, modifiers: [], course: 'main' },
    'start-3--starter': { itemId: 'start-3', quantity: 1, modifiers: [], course: 'starter' }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeCategoryRef = useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // Special Instructions (Notes) States
  const [dishNotes, setDishNotes] = useState<string>('');
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);
  const [customizerNotes, setCustomizerNotes] = useState<string>('');
  const [showCustomizerNotesInput, setShowCustomizerNotesInput] = useState<boolean>(false);

  // Spicy level filter
  const [spicyFilter, setSpicyFilter] = useState<'all' | SpicyLevel>('all');

  // Item customization states
  const [selectedCustomizingItem, setSelectedCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [selectedCustomCourse, setSelectedCustomCourse] = useState<'starter' | 'main' | 'dessert' | 'drinks'>('main');

  useEffect(() => {
    if (selectedItem) {
      setSelectedSpicyLevel(selectedItem.spicyLevel || 'Normal');
      setDishNotes('');
      setShowNotesInput(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedCustomizingItem) {
      setCustomizerNotes('');
      setShowCustomizerNotesInput(false);
    }
  }, [selectedCustomizingItem]);

  // Handle ESC key to close active modals in stack order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCustomizingItem) {
          setSelectedCustomizingItem(null);
        } else if (selectedItem) {
          setSelectedItem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, selectedCustomizingItem]);



  // Reset selectedModifiers and customizerNotes when customizing item is closed
  useEffect(() => {
    if (!selectedCustomizingItem) {
      setSelectedModifiers([]);
      setCustomizerNotes('');
      setShowCustomizerNotesInput(false);
    }
  }, [selectedCustomizingItem]);

  // Language / currency state (synced with admin dashboard via localStorage)
  const [language, setLanguage] = useState<'en' | 'ja'>('en');
  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');

  const [pairingToast, setPairingToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const triggerPairingToast = (message: string) => {
    setPairingToast({ show: true, message });
    setTimeout(() => setPairingToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Format currency based on current language
  const formatCurrency = (val: number) => {
    if (language === 'ja') {
      return `¥${Math.round(val * 150).toLocaleString()}`;
    }
    return `$${val.toFixed(2)}`;
  };

  const cartPairings = useMemo(() => {
    const pairings: Array<{ parentItemName: string; id: string; name: string; price: number; image: string; desc: string }> = [];
    const cartItemIds = Object.values(cart).map(ci => ci.itemId);
    
    Object.values(cart).forEach(cartItem => {
      const pairing = drinkPairings[cartItem.itemId];
      if (pairing && !cartItemIds.includes(pairing.id)) {
        if (!pairings.some(p => p.id === pairing.id)) {
          const parentItem = items.find(m => m.id === cartItem.itemId);
          pairings.push({
            parentItemName: parentItem ? parentItem.name : 'your dish',
            ...pairing
          });
        }
      }
    });
    return pairings;
  }, [cart, items]);

  // migrateCart helper is imported from cartUtils

  // Load cart, table number, menu items, and categories from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dinepos_cart');
    if (savedCart) {
      setCart(migrateCart(savedCart));
    }
    const savedDiningOption = localStorage.getItem('dinepos_dining_option');
    if (savedDiningOption === 'all' || savedDiningOption === 'dine-in' || savedDiningOption === 'takeaway' || savedDiningOption === 'delivery') {
      setDiningOption(savedDiningOption as any);
    }
    const savedTable = localStorage.getItem('dinepos_table_number');
    if (savedTable) {
      setTableNumber(parseInt(savedTable, 10) || 12);
    }
    const savedExclusions = localStorage.getItem('dinepos_exclusions_config');
    if (savedExclusions) {
      try {
        const parsed = JSON.parse(savedExclusions);
        setExclusionsConfig(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (e) {
        console.error('Failed to parse exclusions config:', e);
      }
    }
    
    const savedMenu = localStorage.getItem('dinepos_menu_items');
    if (savedMenu) {
      try {
        let loadedItems = JSON.parse(savedMenu);
        if (!loadedItems.some((item: any) => item.category === 'combos')) {
          const defaultCombos = [
            {
              id: 'combo-1',
              name: 'Imperial Signature Combo',
              category: 'combos',
              price: 120,
              description: 'A luxurious set featuring our Wagyu Beef Tartare starter, Truffle Glazed Filet Mignon main course, and Chocolate Soufflé dessert.',
              image: '/images/wagyu_ribeye.png',
              tags: ['Non-Veg'],
              allergens: ['Dairy', 'Gluten']
            },
            {
              id: 'combo-2',
              name: 'Royal Vegetarian Tasting Set',
              category: 'combos',
              price: 75,
              description: 'A curated vegetarian experience: Truffle Burrata Salad starter, Acquerello Mushroom Risotto main, and Saffron Crème Brûlée.',
              image: '/images/mushroom_risotto.png',
              tags: ['Veg', 'GF'],
              allergens: ['Dairy']
            }
          ];
          loadedItems = [...loadedItems, ...defaultCombos];
          localStorage.setItem('dinepos_menu_items', JSON.stringify(loadedItems));
        }
        setItems(loadedItems);
      } catch (e) {
        console.error('Failed to parse saved menu:', e);
      }
    } else {
      localStorage.setItem('dinepos_menu_items', JSON.stringify(menuItems));
    }

    const defaultCategories = [
      { id: 'special', name: 'Our Special', icon: 'auto_awesome' },
      { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' },
      { id: 'starters', name: 'Starters', icon: 'restaurant' },
      { id: 'mains', name: 'Main Course', icon: 'restaurant_menu' },
      { id: 'desserts', name: 'Desserts', icon: 'icecream' },
      { id: 'drinks', name: 'Drinks', icon: 'local_bar' }
    ];
    const savedCategories = localStorage.getItem('dinepos_menu_categories');
    let loadedCategories = defaultCategories;
    if (savedCategories) {
      try {
        loadedCategories = JSON.parse(savedCategories);
        // Clean up or migrate old name if present in localStorage
        loadedCategories = loadedCategories.map((c: any) => 
          c.id === 'combos' ? { ...c, name: 'Combo Set' } : c
        );
        if (!loadedCategories.some((c: any) => c.id === 'combos')) {
          const specIdx = loadedCategories.findIndex((c: any) => c.id === 'special');
          if (specIdx !== -1) {
            loadedCategories.splice(specIdx + 1, 0, { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' });
          } else {
            loadedCategories.unshift({ id: 'combos', name: 'Combo Set', icon: 'lunch_dining' });
          }
        }
        localStorage.setItem('dinepos_menu_categories', JSON.stringify(loadedCategories));
      } catch (e) {
        console.error('Failed to parse saved categories:', e);
      }
    } else {
      localStorage.setItem('dinepos_menu_categories', JSON.stringify(defaultCategories));
    }
    setCategories(loadedCategories);
    if (loadedCategories.length > 0) {
      setActiveCategory(loadedCategories[0].id);
    }
    
    // Determine active role from logged in email
    const loggedInEmail = localStorage.getItem('dinepos_logged_in_email');
    if (loggedInEmail === 'waiter@dinepos.ai') {
      setUserRole('waiter');
    } else {
      setUserRole('customer');
    }

    setIsLoaded(true);

    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('dinepos_language') as 'en' | 'ja' | null;
    if (savedLanguage === 'en' || savedLanguage === 'ja') {
      setLanguage(savedLanguage);
    }
    const savedTaxType = localStorage.getItem('dinepos_tax_type');
    if (savedTaxType === 'pre-tax' || savedTaxType === 'post-tax') {
      setTaxType(savedTaxType as 'pre-tax' | 'post-tax');
    }
    const savedOrderSubmitted = localStorage.getItem('dinepos_order_submitted');
    if (savedOrderSubmitted === 'true') {
      setOrderSubmitted(true);
    }
  }, []);

  // Sync Customer Role Table Number dynamically when config loads or updates
  useEffect(() => {
    if (userRole === 'customer' && exclusionsConfig.customerTableNumber !== undefined) {
      setTableNumber(exclusionsConfig.customerTableNumber);
    }
  }, [userRole, exclusionsConfig.customerTableNumber]);

  // Sync menu items and categories in real-time across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_cart' && e.newValue) {
        setCart(migrateCart(e.newValue));
      }
      if (e.key === 'dinepos_menu_items' && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse storage menu updates:', err);
        }
      }
      if (e.key === 'dinepos_menu_categories' && e.newValue) {
        try {
          const newCats = JSON.parse(e.newValue);
          setCategories(newCats);
          if (newCats.length > 0 && !newCats.some((c: any) => c.id === activeCategoryRef.current)) {
            setActiveCategory(newCats[0].id);
          }
        } catch (err) {
          console.error('Failed to parse storage categories updates:', err);
        }
      }
      if (e.key === 'dinepos_language' && e.newValue) {
        if (e.newValue === 'en' || e.newValue === 'ja') {
          setLanguage(e.newValue);
        }
      }
      if (e.key === 'dinepos_tax_type' && e.newValue) {
        if (e.newValue === 'pre-tax' || e.newValue === 'post-tax') {
          setTaxType(e.newValue as 'pre-tax' | 'post-tax');
        }
      }
      if (e.key === 'dinepos_exclusions_config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setExclusionsConfig(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (err) {
          console.error('Failed to parse storage exclusions updates:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dinepos_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);
  
  // Search bar
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dialog overlays
  const [showWaiterToast, setShowWaiterToast] = useState(false);
  
  // AI Concierge state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Welcome to DinePOS AI. I am your culinary concierge. How can I assist you with the menu today? (e.g. asking for pairings or dietary info)' }
  ]);
  const [isAILoading, setIsAILoading] = useState(false);

  // Lock body scroll when modal/drawer is open
  useEffect(() => {
    if (selectedItem || selectedCustomizingItem || isAIChatOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem, selectedCustomizingItem, isAIChatOpen, isCartOpen]);

  // Dietary and category labels mapping
  const categoryHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    categories.forEach(cat => {
      headers[cat.id] = cat.name;
    });
    return headers;
  }, [categories]);

  // Default course mapping based on item categories
  const getDefaultCourse = (itemId: string): 'starter' | 'main' | 'dessert' | 'drinks' => {
    if (itemId.startsWith('start-')) return 'starter';
    if (itemId.startsWith('dess-')) return 'dessert';
    if (itemId.startsWith('drink-')) return 'drinks';
    return 'main';
  };

  // Structured cart operations
  const addItemToCartStructured = (itemId: string, quantity: number, modifiers: string[], course: 'starter' | 'main' | 'dessert' | 'drinks', notes?: string) => {
    const key = generateCartKey(itemId, modifiers, course, notes);
    const existing = cart[key];
    if (existing && existing.quantity + quantity > 10) {
      triggerPairingToast(`Maximum limit of 10 reached for this item.`);
      return;
    }
    setCart(prev => {
      const currentVal = prev[key];
      if (currentVal) {
        return {
          ...prev,
          [key]: { ...currentVal, quantity: currentVal.quantity + quantity }
        };
      } else {
        return {
          ...prev,
          [key]: { itemId, quantity, modifiers, course, notes }
        };
      }
    });
  };

  const addToCart = (id: string, notesParam?: string) => {
    const hasMods = !!itemModifiersConfig[id];
    const itemObj = items.find(m => m.id === id);
    
    if (hasMods && itemObj) {
      // Close the dish detail modal first so the customizer doesn't render on top of it
      // (both are fixed-position; stacking them causes the customizer to appear as a sliver)
      setSelectedItem(null);

      const initialMods: string[] = [];
      const configs = itemModifiersConfig[id] || [];
      configs.forEach(conf => {
        if (conf.type === 'single' && conf.options.length > 0) {
          initialMods.push(conf.options[0].name);
        }
      });
      if (itemObj.category !== 'drinks' && itemObj.category !== 'desserts') {
        initialMods.push(`Spice: ${selectedSpicyLevel}`);
      }
      setSelectedModifiers(initialMods);
      setSelectedCustomCourse(getDefaultCourse(id));
      setCustomizerNotes(notesParam || dishNotes || '');
      setShowCustomizerNotesInput(!!(notesParam || dishNotes));
      // Open customizer after clearing the detail modal
      setSelectedCustomizingItem(itemObj);
    } else if (itemObj) {
      const modifiers = itemObj.category !== 'drinks' && itemObj.category !== 'desserts' 
        ? [`Spice: ${selectedSpicyLevel}`] 
        : [];
      addItemToCartStructured(id, 1, modifiers, getDefaultCourse(id), notesParam || dishNotes);
      // Also close the detail modal after a direct add so the user sees the cart update
      setSelectedItem(null);
      triggerPairingToast(`${itemObj.name} added to cart!`);
    } else {
      triggerPairingToast(`Error: Selection not found in menu.`);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const matchingKey = Object.keys(prev).find(key => prev[key].itemId === id);
      if (!matchingKey) return prev;
      
      const updated = { ...prev };
      const item = updated[matchingKey];
      if (item.quantity <= 1) {
        delete updated[matchingKey];
      } else {
        updated[matchingKey] = { ...item, quantity: item.quantity - 1 };
      }
      return updated;
    });
  };

  // Calculations
  const cartTotalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, ci) => sum + ci.quantity, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return Object.values(cart).reduce((total, ci) => {
      const item = items.find(m => m.id === ci.itemId);
      if (!item) return total;
      
      let modifiersExtra = 0;
      ci.modifiers.forEach(modName => {
        const configs = itemModifiersConfig[ci.itemId] || [];
        for (const config of configs) {
          const opt = config.options.find(o => o.name === modName);
          if (opt?.price) {
            modifiersExtra += opt.price;
          }
        }
      });
      
      return total + (item.price + modifiersExtra) * ci.quantity;
    }, 0);
  }, [cart, items]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (item.category !== activeCategory) return false;
      
      // Dining filter check
      if (diningOption !== 'all') {
        if (diningOption === 'takeaway' || diningOption === 'delivery') {
          // Dynamic price exclusion
          if (item.price > exclusionsConfig.maxPrice) return false;
          // Dynamic tag exclusion
          if (exclusionsConfig.excludedTags.some(tag => item.tags.includes(tag))) return false;
        }
      }

      // Dietary filter check
      if (dietaryOption !== 'all') {
        if (dietaryOption === 'veg' && !item.tags.includes('Veg')) return false;
        if (dietaryOption === 'non-veg' && !item.tags.includes('Non-Veg')) return false;
      }



      // Spicy filter check
      if (spicyFilter !== 'all' && item.spicyLevel !== spicyFilter) {
        return false;
      }

      // Search match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      }

      return true;
    });
  }, [activeCategory, diningOption, dietaryOption, spicyFilter, searchQuery, items]);

  // AI response engine
  const handleAISubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery;
    setAiMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiQuery('');
    setIsAILoading(true);

    setTimeout(() => {
      let response = "I'd be glad to help! DinePOS AI offers exquisite local and international pairings. Please let me know what flavor notes you prefer.";
      
      const queryLower = userText.toLowerCase();
      if (queryLower.includes('gluten') || queryLower.includes('gf')) {
        response = "For our gluten-free guests, we highly recommend our Truffle Burrata Salad, Saffron Crème Brûlée, or the Gold Leaf A5 Wagyu Ribeye which has GF options. All are carefully prepared to avoid cross-contamination.";
      } else if (queryLower.includes('veg') || queryLower.includes('vegetarian')) {
        response = "We have outstanding vegetarian options! Our favorites are the Truffle Burrata Salad, Saffron Crème Brûlée, and the signature Acquerello Mushroom Risotto, prepared with Carnaroli rice and fresh forest mushrooms.";
      } else if (queryLower.includes('wagyu') || queryLower.includes('beef') || queryLower.includes('steak')) {
        response = "The Gold Leaf A5 Wagyu Ribeye is a true masterwork. We recommend pairing it with our Royal Gold Old Fashioned or a full-bodied Cabernet Sauvignon. For starters, the Wagyu Beef Tartare makes a flawless introduction.";
      } else if (queryLower.includes('pairing') || queryLower.includes('drink') || queryLower.includes('wine')) {
        response = "To elevate your meal, pair our Crispy Chilean Sea Bass with our Emerald Gimlet. For the Wagyu Steaks, the Royal Gold Old Fashioned, smoked with cherrywood chips, adds a beautiful deep aroma.";
      } else if (queryLower.includes('risotto')) {
        response = "Our Acquerello Mushroom Risotto is a decadent vegetarian dish featuring aged Acquerello Carnaroli rice, rich forest mushrooms, and aromatic black winter truffle shavings.";
      }

      setAiMessages(prev => [...prev, { sender: 'ai', text: response }]);
      setIsAILoading(false);
    }, 1000);
  };

  const incrementQuantity = (cartKey: string) => {
    setCart(prev => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      return {
        ...prev,
        [cartKey]: { ...existing, quantity: existing.quantity + 1 }
      };
    });
  };

  const decrementQuantity = (cartKey: string) => {
    setCart(prev => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      const updated = { ...prev };
      if (existing.quantity <= 1) {
        delete updated[cartKey];
      } else {
        updated[cartKey] = { ...existing, quantity: existing.quantity - 1 };
      }
      return updated;
    });
  };

  const updateItemCourse = (cartKey: string, newCourse: 'starter' | 'main' | 'dessert' | 'drinks') => {
    setCart(prev => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      
      const updated = { ...prev };
      delete updated[cartKey];
      
      const newKey = generateCartKey(existing.itemId, existing.modifiers, newCourse, existing.notes);
      if (updated[newKey]) {
        updated[newKey] = { ...updated[newKey], quantity: updated[newKey].quantity + existing.quantity };
      } else {
        updated[newKey] = { ...existing, course: newCourse };
      }
      return updated;
    });
  };

  const handleTableChange = (num: number) => {
    setTableNumber(num);
    localStorage.setItem('dinepos_table_number', num.toString());
    setIsTableDropdownOpen(false);
    if (userRole === 'customer') {
      setIsTableTemporarilyUnlocked(false);
    }
  };

  const handlePlaceOrder = () => {
    // Validate cart integrity: check if all items in cart exist in menuItems list
    const invalidItems = Object.values(cart).filter(ci => !items.some(m => m.id === ci.itemId));
    if (invalidItems.length > 0) {
      triggerPairingToast("Cart contains unavailable items. Please review your selections.");
      return;
    }
    setIsCartOpen(false);
    setOrderSubmitted(true);
    localStorage.setItem('dinepos_order_submitted', 'true');
    // Save order selections in localStorage
    localStorage.setItem('dinepos_placed_order', JSON.stringify(cart));
    // Clear cart on successful order
    setTimeout(() => {
      setCart({});
    }, 500);
  };

  const handleDismissOrderSubmitted = () => {
    setOrderSubmitted(false);
    localStorage.removeItem('dinepos_order_submitted');
  };

  const handleCallWaiter = () => {
    setShowWaiterToast(true);
    setTimeout(() => {
      setShowWaiterToast(false);
    }, 4000);
  };

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-on-surface font-body-md overflow-hidden antialiased select-none relative">
      
      {/* Sidebar navigation panel */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      <aside className={`fixed lg:relative top-0 left-0 w-[280px] h-full flex flex-col justify-between border-r border-white/5 bg-[#0a0a09] flex-shrink-0 z-50 transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Brand header */}
          <div className="p-8 pb-4 flex items-start justify-between">
            <div>
              <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-2xl tracking-wide select-none block hover:opacity-85 transition-opacity mb-4">
                DinePOS AI
              </Link>
              <div className="font-sans font-bold text-xs text-white/90 mb-1 select-none">DinePOS Executive Suite</div>
              <div className="font-sans text-[11px] text-[#A69984]/60 select-none">Main Dining Room</div>
            </div>
            <button 
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#A69984] hover:text-white"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          
          {/* Category tabs */}
          <nav className="px-5 space-y-2.5 mt-6 max-h-[40vh] overflow-y-auto scrollbar-hide">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setDiningOption('dine-in'); setDietaryOption('all'); setSpicyFilter('all'); setIsMobileSidebarOpen(false); }}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 ${activeCategory === cat.id ? 'bg-[#ffe2ab] text-[#402d00] shadow-[0_4px_12px_rgba(255,226,171,0.15)]' : 'text-[#A69984]/80 hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-lg leading-none">{cat.icon || 'restaurant_menu'}</span>
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom utility triggers */}
        <div className="px-5 pb-8 space-y-2">
          <Link 
            href="/menu/order-status"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#ffe2ab]/90 hover:text-white hover:bg-white/5 transition-all font-sans font-bold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">hourglass_empty</span>
            Order Status
          </Link>
          {exclusionsConfig.enableSelfCheckout && (
            <Link 
              href="/menu/checkout"
              className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#ffe2ab]/90 hover:text-white hover:bg-white/5 transition-all font-sans font-bold text-xs w-full text-left uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-lg leading-none">credit_card</span>
              Self Checkout
            </Link>
          )}
          <button 
            onClick={() => { handleCallWaiter(); setIsMobileSidebarOpen(false); }}
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-sans font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">notifications</span>
            Call Waiter
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#11100e] relative overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-10 py-4 sm:py-6 flex-shrink-0 bg-[#0e0e0d] border-b border-white/5 sticky top-0 z-40 select-none">
          {/* Hamburger + Title on the Left */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-transparent border border-white/10 rounded-xl text-white hover:bg-white/5 cursor-pointer mr-3"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <h1 className="font-serif text-2xl sm:text-[30px] font-medium text-white tracking-wide leading-none select-none">
              {categoryHeaders[activeCategory]}
            </h1>
          </div>
          
          {/* Center Segmented Filter Controls (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-4 select-none">
            {/* Dining Options Capsule */}
            <div className="flex bg-[#12110f] border border-white/5 rounded-full p-1 shadow-inner gap-1">
              <button
                type="button"
                onClick={() => setDiningOption(diningOption === 'dine-in' ? 'all' : 'dine-in')}
                className={`px-3 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  diningOption === 'dine-in'
                    ? 'bg-[#ffe2ab] text-[#402d00] shadow-[0_4px_14px_rgba(255,226,171,0.35)] px-4 gap-1.5'
                    : 'text-[#A69984]/80 hover:text-[#ffe2ab] hover:bg-[#ffe2ab]/10'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] leading-none">restaurant</span>
                {diningOption === 'dine-in' && <span className="animate-fade-in whitespace-nowrap">Dine-in</span>}
              </button>
              <button
                type="button"
                onClick={() => setDiningOption(diningOption === 'takeaway' ? 'all' : 'takeaway')}
                className={`px-3 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  diningOption === 'takeaway'
                    ? 'bg-[#38bdf8] text-[#0c4a6e] shadow-[0_4px_14px_rgba(56,189,248,0.35)] px-4 gap-1.5'
                    : 'text-[#A69984]/80 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] leading-none">takeout_dining</span>
                {diningOption === 'takeaway' && <span className="animate-fade-in whitespace-nowrap">Takeaway</span>}
              </button>
              <button
                type="button"
                onClick={() => setDiningOption(diningOption === 'delivery' ? 'all' : 'delivery')}
                className={`px-3 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  diningOption === 'delivery'
                    ? 'bg-[#fb923c] text-[#7c2d12] shadow-[0_4px_14px_rgba(251,146,60,0.35)] px-4 gap-1.5'
                    : 'text-[#A69984]/80 hover:text-[#fb923c] hover:bg-[#fb923c]/10'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] leading-none">moped</span>
                {diningOption === 'delivery' && <span className="animate-fade-in whitespace-nowrap">Delivery</span>}
              </button>
            </div>

            {/* Elegant Spacing Divider */}
            <span className="text-white/10 font-light select-none">|</span>

            {/* Dietary Preference Capsule */}
            <div className="flex bg-[#12110f] border border-white/5 rounded-full p-1 shadow-inner gap-0.5">
              <button 
                onClick={() => setDietaryOption(dietaryOption === 'veg' ? 'all' : 'veg')}
                className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${dietaryOption === 'veg' ? 'bg-[#10b981] text-[#022c22] shadow-[0_4px_14px_rgba(16,185,129,0.35)]' : 'text-[#A69984]/80 hover:text-[#10b981] hover:bg-[#10b981]/10'}`}
              >
                <span className="material-symbols-outlined text-[15px] leading-none">eco</span>
                Veg
              </button>
              <button 
                onClick={() => setDietaryOption(dietaryOption === 'non-veg' ? 'all' : 'non-veg')}
                className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${dietaryOption === 'non-veg' ? 'bg-[#e11d48] text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)]' : 'text-[#A69984]/80 hover:text-[#e11d48] hover:bg-[#e11d48]/10'}`}
              >
                <span className="material-symbols-outlined text-[15px] leading-none">flatware</span>
                Non-Veg
              </button>
            </div>


          </div>

          {/* Right Side Buttons (Table Dropdown and Search Button) */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button 
              onClick={() => {
                if (userRole === 'waiter' || isTableTemporarilyUnlocked) {
                  setIsTableDropdownOpen(!isTableDropdownOpen);
                } else {
                  setAdminEmailInput('');
                  setAdminPasswordInput('');
                  setAdminAuthError('');
                  setShowAdminAuthModal(true);
                }
              }}
              className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-5 py-2.5 bg-transparent border border-[#A69984]/25 rounded-xl text-white text-[11px] sm:text-xs font-sans font-semibold tracking-wider hover:border-[#ffe2ab]/30 transition-all select-none cursor-pointer`}
              title={userRole === 'customer' && !isTableTemporarilyUnlocked ? "Table number is fixed. Click to authenticate." : "Change table number"}
            >
              <span className="material-symbols-outlined text-base sm:text-lg leading-none text-[#ffe2ab]">table_restaurant</span>
              <span className="hidden xs:inline">Table</span> {tableNumber}
              {(userRole === 'waiter' || isTableTemporarilyUnlocked) && (
                <span className="material-symbols-outlined text-[14px] sm:text-[16px] leading-none text-[#A69984]/50">expand_more</span>
              )}
            </button>

            {/* Table Dropdown Menu */}
            {isTableDropdownOpen && (userRole === 'waiter' || isTableTemporarilyUnlocked) && (
              <div className="absolute top-[52px] left-0 bg-[#161513] border border-white/10 rounded-xl p-3 shadow-2xl z-50 grid grid-cols-3 sm:grid-cols-4 gap-2 w-[180px] sm:w-[220px]">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => handleTableChange(num)}
                    className={`py-2.5 px-1 font-sans font-bold text-xs rounded transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${tableNumber === num ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white hover:bg-white/5'}`}
                  >
                    T{num}
                  </button>
                ))}
              </div>
            )}

            {/* Search Bar Toggler */}
            <div className="flex items-center relative">
              {isSearchOpen && (
                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#161513] border border-[#A69984]/25 rounded-lg px-3 sm:px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ffe2ab]/40 mr-2 w-[120px] sm:w-[180px] transition-all"
                />
              )}
              <button 
                onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery(''); }}
                className={`w-10 h-10 sm:w-[42px] sm:h-[42px] flex items-center justify-center bg-transparent border border-[#A69984]/25 rounded-xl text-[#ffe2ab] hover:border-[#ffe2ab]/40 transition-all cursor-pointer ${isSearchOpen ? 'bg-white/5 border-[#ffe2ab]/30' : ''}`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl leading-none">
                  {isSearchOpen ? 'close' : 'search'}
                </span>
              </button>
            </div>

            {/* Tune Toggler (Mobile/Tablet Only) */}
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center bg-transparent border rounded-xl transition-all cursor-pointer ${isFilterPanelOpen ? 'bg-white/5 border-[#ffe2ab] text-[#ffe2ab]' : 'border-[#A69984]/25 text-[#ffe2ab] hover:border-[#ffe2ab]/40'}`}
            >
              <span className="material-symbols-outlined text-lg leading-none">tune</span>
            </button>
          </div>
        </header>

        {/* Collapsible Mobile/Tablet Filter Panel */}
        {isFilterPanelOpen && (
          <div className="lg:hidden bg-[#0e0e0d] border-b border-white/5 p-4 space-y-4 animate-fade-in z-30 select-none">
            {/* Dining Options Segment */}
            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase font-bold text-[#A69984]/50 tracking-wider">Dining Option</label>
              <div className="flex bg-[#12110f] border border-white/5 rounded-xl p-1 gap-1">
                <button 
                  onClick={() => setDiningOption(diningOption === 'dine-in' ? 'all' : 'dine-in')}
                  className={`flex-1 py-2 rounded-lg font-sans text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center cursor-pointer ${
                    diningOption === 'dine-in' 
                      ? 'bg-[#ffe2ab] text-[#402d00] gap-1.5 px-3' 
                      : 'text-[#A69984]/80 px-2'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">restaurant</span>
                  {diningOption === 'dine-in' && <span className="animate-fade-in whitespace-nowrap">Dine-in</span>}
                </button>
                <button 
                  onClick={() => setDiningOption(diningOption === 'takeaway' ? 'all' : 'takeaway')}
                  className={`flex-1 py-2 rounded-lg font-sans text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center cursor-pointer ${
                    diningOption === 'takeaway' 
                      ? 'bg-[#38bdf8] text-[#0c4a6e] gap-1.5 px-3' 
                      : 'text-[#A69984]/80 px-2'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">takeout_dining</span>
                  {diningOption === 'takeaway' && <span className="animate-fade-in whitespace-nowrap">Takeaway</span>}
                </button>
                <button 
                  onClick={() => setDiningOption(diningOption === 'delivery' ? 'all' : 'delivery')}
                  className={`flex-1 py-2 rounded-lg font-sans text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center cursor-pointer ${
                    diningOption === 'delivery' 
                      ? 'bg-[#fb923c] text-[#7c2d12] gap-1.5 px-3' 
                      : 'text-[#A69984]/80 px-2'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">moped</span>
                  {diningOption === 'delivery' && <span className="animate-fade-in whitespace-nowrap">Delivery</span>}
                </button>
              </div>
            </div>

            {/* Dietary Preference Segment */}
            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase font-bold text-[#A69984]/50 tracking-wider">Dietary</label>
              <div className="flex bg-[#12110f] border border-white/5 rounded-xl p-1 gap-1">
                <button 
                  onClick={() => setDietaryOption(dietaryOption === 'veg' ? 'all' : 'veg')}
                  className={`flex-1 py-2 rounded-lg font-sans text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${dietaryOption === 'veg' ? 'bg-[#10b981] text-[#022c22]' : 'text-[#A69984]/80'}`}
                >
                  <span className="material-symbols-outlined text-[13px]">eco</span>
                  Veg
                </button>
                <button 
                  onClick={() => setDietaryOption(dietaryOption === 'non-veg' ? 'all' : 'non-veg')}
                  className={`flex-1 py-2 rounded-lg font-sans text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${dietaryOption === 'non-veg' ? 'bg-[#e11d48] text-white' : 'text-[#A69984]/80'}`}
                >
                  <span className="material-symbols-outlined text-[13px]">flatware</span>
                  Non-Veg
                </button>
              </div>
            </div>



            {/* Spicy Level Filter */}
            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase font-bold text-[#A69984]/50 tracking-wider">Spicy Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Mild', 'Normal', 'Hot', 'Super Hot'] as SpicyLevel[]).map(level => {
                  const m = spicyMeta[level];
                  const isActive = spicyFilter === level;
                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setSpicyFilter(isActive ? 'all' : level)}
                      className={`py-2 px-3 rounded-xl font-sans text-[10px] uppercase tracking-wider font-bold transition-all flex items-center justify-between border cursor-pointer ${isActive ? `${m.bg} ${m.textColor} ${m.border}` : 'bg-[#12110f] border-white/5 text-[#A69984]/80'}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[12px] leading-none ${isActive ? m.textColor : ''}`}>local_fire_department</span>
                        {level}
                      </span>
                      {isActive && <span className={`material-symbols-outlined text-[12px] ${m.textColor}`}>check_circle</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-10 pb-44 sm:pb-40 pt-6 scrollbar-hide">
          

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-8">
              {filteredItems.map(item => {
                const qty = Object.values(cart).filter(ci => ci.itemId === item.id).reduce((sum, ci) => sum + ci.quantity, 0);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="relative flex flex-col bg-gradient-to-b from-[#181715] to-[#121110] border border-white/5 rounded-2xl overflow-hidden hover:border-[#ffe2ab]/30 hover:shadow-[0_12px_30px_rgba(255,226,171,0.06)] transition-all duration-500 group cursor-pointer"
                  >
                    {/* Floating Price Tag on Image */}
                    <div className="relative w-full h-[220px] overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out select-none"
                      />
                      <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-[#ffe2ab] font-serif text-sm font-bold tracking-wider">
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-base text-white group-hover:text-[#ffe2ab] transition-colors duration-300 tracking-wide font-medium leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="font-sans text-[#A69984]/70 text-[11.5px] leading-relaxed mt-2.5 line-clamp-2 min-h-[34px]">
                          {item.description}
                        </p>
                      </div>

                      {/* Badges + Adjuster Row */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 select-none">
                          {item.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/70 font-sans tracking-wide font-medium"
                            >
                              <span className="material-symbols-outlined text-[10px] leading-none text-[#ffe2ab]">
                                {tag === 'GF' ? 'info' : tag === 'Veg' ? 'eco' : tag === 'Seafood' ? 'water_drop' : 'restaurant'}
                              </span>
                              {tag}
                            </span>
                          ))}
                          {item.spicyLevel && (() => {
                            const m = spicyMeta[item.spicyLevel];
                            return (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${m.bg} ${m.border} border rounded-full text-[9px] font-sans tracking-wide font-bold ${m.textColor}`}>
                                <span className={`material-symbols-outlined text-[10px] leading-none ${m.textColor}`}>local_fire_department</span>
                                {item.spicyLevel}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Cart Buttons */}
                        <div className="select-none">
                          {qty === 0 ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                              className="w-10 h-10 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-md"
                            >
                              <span className="material-symbols-outlined font-black text-lg">add</span>
                            </button>
                          ) : (
                            <div 
                              onClick={(e) => e.stopPropagation()} 
                              className="flex items-center gap-2 border border-white/10 rounded-full p-1 bg-[#0a0a09]/80 shadow-md"
                            >
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">remove</span>
                              </button>
                              <span className="font-sans font-bold text-white text-xs select-none w-4 text-center">{qty}</span>
                              <button 
                                onClick={() => addToCart(item.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">add</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 text-[#A69984]/40 font-sans text-sm select-none border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              No active items found in this section matching your filters.
            </div>
          )}
        </div>

        {/* Floating Ask AI Button */}
        {exclusionsConfig.showAIConcierge && (
          <button 
            onClick={() => setIsAIChatOpen(true)}
            className="absolute bottom-[120px] sm:bottom-[110px] right-4 sm:right-10 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] px-6 py-3.5 rounded-2xl flex items-center gap-3 font-sans font-bold text-xs uppercase tracking-widest shadow-[0_8px_30px_rgba(255,226,171,0.2)] hover:-translate-y-0.5 transition-all duration-300 z-20 cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-lg leading-none">auto_awesome</span>
            Ask AI Concierge
          </button>
        )}

        {/* Bottom Sticky Order Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-[#161513] border-t border-white/5 px-4 sm:px-10 py-4 sm:py-5 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between z-30 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] select-none xl:hidden">
          <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-16">
            <div>
              <div className="font-sans text-[9px] text-[#A69984]/40 font-bold uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Current Table</div>
              <div className="font-sans font-bold text-white text-sm sm:text-base">Table {tableNumber}</div>
            </div>
            <div>
              <div className="font-sans text-[9px] text-[#A69984]/40 font-bold uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Order Status</div>
              <div className="font-sans font-bold text-[#ffe2ab] text-sm sm:text-base">
                {cartTotalItems > 0 ? `${cartTotalItems} Item${cartTotalItems > 1 ? 's' : ''} Selected` : 'No Selection'}
              </div>
            </div>
          </div>
          
          <button 
            disabled={cartTotalItems === 0}
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 disabled:cursor-not-allowed text-[#402d00] px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:scale-[1.01] cursor-pointer"
          >
            View Order ({formatCurrency(cartTotalPrice)}) 
            <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
          </button>
        </div>

      </main>

      {/* Right Side: Selections Sidebar (Desktop Only) */}
      <aside className="hidden xl:flex w-[380px] border-l border-white/5 bg-[#0a0a09] h-full flex-col justify-between flex-shrink-0 z-30 p-6 sm:p-8">
        <div className="flex flex-col h-[calc(100vh-280px)] overflow-hidden">
          <div className="mb-8 shrink-0">
            <h3 className="font-serif text-2xl text-white font-medium tracking-wide">Your Selections</h3>
            <p className="text-[#A69984]/60 font-sans text-xs mt-1">Review items for Table {tableNumber}</p>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-hide">
            {Object.keys(cart).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-[#A69984]/20">receipt_long</span>
                <p className="text-[#A69984]/40 font-sans text-xs max-w-[200px] leading-relaxed select-none">
                  Your order list is empty. Add culinary selections from the menu.
                </p>
              </div>
            ) : (
              <>
                {Object.entries(cart).map(([cartKey, cartItem]) => {
                  const item = items.find(m => m.id === cartItem.itemId);
                  if (!item) return null;

                  let modifierExtra = 0;
                  cartItem.modifiers.forEach(modName => {
                    const configs = itemModifiersConfig[cartItem.itemId] || [];
                    for (const config of configs) {
                      const opt = config.options.find(o => o.name === modName);
                      if (opt?.price) {
                        modifierExtra += opt.price;
                      }
                    }
                  });
                  const singlePrice = item.price + modifierExtra;

                  return (
                    <div key={cartKey} className="flex flex-col gap-3 p-4 bg-[#12110f]/90 border border-white/5 rounded-xl animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div className="max-w-[65%]">
                          <div className="font-serif text-sm text-white font-medium tracking-wide leading-tight">{item.name}</div>
                          {cartItem.modifiers.length > 0 && (
                            <div className="text-[10px] text-[#ffe2ab]/75 font-sans mt-1 italic leading-tight">
                              {cartItem.modifiers.join(', ')}
                            </div>
                          )}
                          {cartItem.notes && (
                            <div className="text-[10px] text-[#A69984]/80 font-sans mt-1 flex items-start gap-1 leading-tight">
                              <span className="material-symbols-outlined text-[12px] text-[#ffe2ab]/80 shrink-0 select-none">edit_note</span>
                              <span className="italic">"{cartItem.notes}"</span>
                            </div>
                          )}
                          <div className="text-[#A69984]/50 text-[10.5px] font-bold font-sans mt-1.5">
                            {formatCurrency(singlePrice)} each
                          </div>
                        </div>
                        {/* Quantity Adjuster & Total Price */}
                        <div className="flex flex-col items-end gap-2.5 shrink-0 select-none">
                          <div className="flex items-center gap-2 border border-white/10 rounded-full p-1 bg-[#161513]">
                            <button 
                              onClick={() => decrementQuantity(cartKey)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[10px] leading-none">remove</span>
                            </button>
                            <span className="font-sans font-bold text-white text-[11px] select-none w-3.5 text-center leading-none">{cartItem.quantity}</span>
                            <button 
                              onClick={() => incrementQuantity(cartKey)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[10px] leading-none">add</span>
                            </button>
                          </div>
                          <span className="text-white font-serif text-xs font-bold leading-none">
                            {formatCurrency(singlePrice * cartItem.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Recommended Beverage Pairings */}
                {cartPairings.length > 0 && (
                  <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                    <div className="flex items-center gap-2 text-[#ffe2ab]">
                      <span className="material-symbols-outlined text-[16px] text-[#ffe2ab] select-none">local_bar</span>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] font-sans select-none">
                        Sommelier Recommended Pairings
                      </span>
                    </div>
                    <div className="space-y-3">
                      {cartPairings.map(pairing => (
                        <div 
                          key={pairing.id} 
                          className="p-3 bg-gradient-to-r from-[#1a1917] to-[#121110] border border-[#ffe2ab]/15 rounded-xl flex gap-3 items-center justify-between shadow-md"
                        >
                          <div className="flex gap-3 items-center min-w-0">
                            <img 
                              src={pairing.image} 
                              alt={pairing.name} 
                              className="w-11 h-11 object-cover rounded-lg shrink-0 border border-white/10 select-none" 
                            />
                            <div className="min-w-0">
                              <div className="font-serif text-xs text-white font-semibold truncate leading-snug">{pairing.name}</div>
                              <div className="text-[9.5px] text-[#ffe2ab]/75 font-sans mt-0.5 truncate font-medium">
                                Pairs beautifully with {pairing.parentItemName}
                              </div>
                              <div className="text-[#ffe2ab] text-[10px] font-serif font-bold mt-1">
                                {formatCurrency(pairing.price)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(pairing.id)}
                            className="w-8 h-8 rounded-full bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] flex items-center justify-center transition-all duration-300 shadow-[0_2px_10px_rgba(255,226,171,0.15)] hover:scale-[1.05] cursor-pointer shrink-0"
                            title="Add recommended pairing"
                            aria-label={`Add pairing ${pairing.name}`}
                          >
                            <span className="material-symbols-outlined text-[14px] font-black leading-none">add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom summary and place order */}
        <div className="border-t border-white/5 pt-6 space-y-4 font-sans select-none shrink-0">
          <div className="flex justify-between text-xs text-[#A69984]/60 font-semibold uppercase tracking-wider">
            <span>{taxType === 'post-tax' ? 'Subtotal (Tax Incl.)' : 'Subtotal'}</span>
            <span>{formatCurrency(cartTotalPrice)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#A69984]/60 font-semibold uppercase tracking-wider border-b border-white/5 pb-4">
            <span>{taxType === 'post-tax' ? 'Included Taxes & Service (10%)' : 'Taxes & Service (10%)'}</span>
            <span>{formatCurrency(taxType === 'post-tax' ? (cartTotalPrice - (cartTotalPrice / 1.1)) : (cartTotalPrice * 0.1))}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white">
            <span className="font-serif">Total Charge</span>
            <span className="text-[#ffe2ab]">{formatCurrency(taxType === 'post-tax' ? cartTotalPrice : (cartTotalPrice * 1.1))}</span>
          </div>
          
          <button 
            disabled={cartTotalItems === 0}
            onClick={handlePlaceOrder}
            className="w-full py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 disabled:cursor-not-allowed text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_24px_rgba(255,226,171,0.15)] flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            Transmit Order to Kitchen
            <span className="material-symbols-outlined text-sm font-black">restaurant_menu</span>
          </button>
        </div>
      </aside>

      {/* CALL WAITER FLOATING TOAST */}
      {showWaiterToast && (
        <div className="fixed top-8 right-8 z-[100] bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in duration-300">
          <span className="material-symbols-outlined text-2xl animate-bounce">notifications_active</span>
          <div>
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Waiter Dispatched</div>
            <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">Assistance requested for Table {tableNumber}.</div>
          </div>
        </div>
      )}

      {/* PAIRING ADDED TOAST */}
      {pairingToast.show && (
        <div className="fixed top-8 right-8 z-[100] bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in duration-300">
          <span className="material-symbols-outlined text-2xl text-[#ffe2ab] animate-bounce">check_circle</span>
          <div>
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Pairing Added</div>
            <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{pairingToast.message}</div>
          </div>
        </div>
      )}



      {/* VIEW ORDER CART DRAWER OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md flex justify-end z-50 flex-none">
          <div className="bg-[#161513] border-l border-white/5 w-full sm:max-w-[460px] h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-serif text-2xl text-white font-medium tracking-wide">Your Selections</h3>
                  <p className="text-[#A69984]/60 font-sans text-xs mt-1">Review items for Table {tableNumber}</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close cart"
                >
                  <span className="material-symbols-outlined text-lg leading-none">close</span>
                </button>
              </div>

              {/* Cart List */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(cart).map(([cartKey, cartItem]) => {
                  const item = items.find(m => m.id === cartItem.itemId);
                  if (!item) return null;

                  let modifierExtra = 0;
                  cartItem.modifiers.forEach(modName => {
                    const configs = itemModifiersConfig[cartItem.itemId] || [];
                    for (const config of configs) {
                      const opt = config.options.find(o => o.name === modName);
                      if (opt?.price) {
                        modifierExtra += opt.price;
                      }
                    }
                  });
                  const singlePrice = item.price + modifierExtra;

                  return (
                    <div key={cartKey} className="flex flex-col gap-3 p-4 bg-[#12110f]/90 border border-white/5 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div className="max-w-[70%]">
                          <div className="font-serif text-sm text-white font-medium tracking-wide leading-tight">{item.name}</div>
                          {cartItem.modifiers.length > 0 && (
                            <div className="text-[10px] text-[#ffe2ab]/75 font-sans mt-1 italic leading-tight">
                              {cartItem.modifiers.join(', ')}
                            </div>
                          )}
                          {cartItem.notes && (
                            <div className="text-[10px] text-[#A69984]/80 font-sans mt-1 flex items-start gap-1 leading-tight">
                              <span className="material-symbols-outlined text-[12px] text-[#ffe2ab]/80 shrink-0 select-none">edit_note</span>
                              <span className="italic">"{cartItem.notes}"</span>
                            </div>
                          )}
                          <div className="text-[#A69984]/50 text-[10.5px] font-bold font-sans mt-1.5">
                            {formatCurrency(singlePrice)} each
                          </div>
                        </div>
                        
                        {/* Quantity adjuster & Total price inside drawer */}
                        <div className="flex flex-col items-end gap-2.5 shrink-0 select-none">
                          <div className="flex items-center gap-2.5 border border-white/10 rounded-full p-1 bg-[#161513]">
                            <button 
                              onClick={() => decrementQuantity(cartKey)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs leading-none">remove</span>
                            </button>
                            <span className="font-sans font-bold text-white text-xs select-none w-4 text-center leading-none">{cartItem.quantity}</span>
                            <button 
                              onClick={() => incrementQuantity(cartKey)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs leading-none">add</span>
                            </button>
                          </div>
                          <span className="text-white font-serif text-xs font-bold leading-none">
                            {formatCurrency(singlePrice * cartItem.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Recommended Beverage Pairings */}
                {Object.keys(cart).length > 0 && cartPairings.length > 0 && (
                  <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                    <div className="flex items-center gap-2 text-[#ffe2ab]">
                      <span className="material-symbols-outlined text-[16px] text-[#ffe2ab] select-none">local_bar</span>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] font-sans select-none">
                        Sommelier Recommended Pairings
                      </span>
                    </div>
                    <div className="space-y-3">
                      {cartPairings.map(pairing => (
                        <div 
                          key={pairing.id} 
                          className="p-3 bg-gradient-to-r from-[#1a1917] to-[#121110] border border-[#ffe2ab]/15 rounded-xl flex gap-3 items-center justify-between shadow-md"
                        >
                          <div className="flex gap-3 items-center min-w-0">
                            <img 
                              src={pairing.image} 
                              alt={pairing.name} 
                              className="w-11 h-11 object-cover rounded-lg shrink-0 border border-white/10 select-none" 
                            />
                            <div className="min-w-0">
                              <div className="font-serif text-xs text-white font-semibold truncate leading-snug">{pairing.name}</div>
                              <div className="text-[9.5px] text-[#ffe2ab]/75 font-sans mt-0.5 truncate font-medium">
                                Pairs beautifully with {pairing.parentItemName}
                              </div>
                              <div className="text-[#ffe2ab] text-[10px] font-serif font-bold mt-1">
                                {formatCurrency(pairing.price)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(pairing.id)}
                            className="w-8 h-8 rounded-full bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] flex items-center justify-center transition-all duration-300 shadow-[0_2px_10px_rgba(255,226,171,0.15)] hover:scale-[1.05] cursor-pointer shrink-0"
                            title="Add recommended pairing"
                            aria-label={`Add pairing ${pairing.name}`}
                          >
                            <span className="material-symbols-outlined text-[14px] font-black leading-none">add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom summary and place order */}
            <div className="border-t border-white/5 pt-6 space-y-4 font-sans select-none">
              <div className="flex justify-between text-xs text-[#A69984]/60 font-semibold uppercase tracking-wider">
                <span>{taxType === 'post-tax' ? 'Subtotal (Tax Incl.)' : 'Subtotal'}</span>
                <span>{formatCurrency(cartTotalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#A69984]/60 font-semibold uppercase tracking-wider border-b border-white/5 pb-4">
                <span>{taxType === 'post-tax' ? 'Included Taxes & Service (10%)' : 'Taxes & Service (10%)'}</span>
                <span>{formatCurrency(taxType === 'post-tax' ? (cartTotalPrice - (cartTotalPrice / 1.1)) : (cartTotalPrice * 0.1))}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white">
                <span className="font-serif">Total Charge</span>
                <span className="text-[#ffe2ab]">{formatCurrency(taxType === 'post-tax' ? cartTotalPrice : (cartTotalPrice * 1.1))}</span>
              </div>
              
              <button 
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_24px_rgba(255,226,171,0.15)] flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                Transmit Order to Kitchen
                <span className="material-symbols-outlined text-sm font-black">restaurant_menu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHEF'S TABLE DETAIL & PAIRING MODAL */}
      {selectedItem && (() => {
        const detailQty = Object.values(cart).filter(ci => ci.itemId === selectedItem.id).reduce((sum, ci) => sum + ci.quantity, 0);
        return (
          <div className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-10 select-none animate-fade-in">
            <div className="bg-[#161513] border border-[#ffe2ab]/20 rounded-2xl max-w-4xl w-full shadow-[0_0_50px_rgba(255,226,171,0.15)] overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-fade-in">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50"
                aria-label="Close details modal"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>

              {/* Left Column: Image */}
              <div className="md:w-2/5 h-[240px] md:h-auto relative overflow-hidden bg-[#0c0c0b]">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161513] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#161513]/30"></div>
              </div>

              {/* Right Column: Gastronomy Details & Pairing */}
              <div className="md:w-3/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[600px] scrollbar-hide">
                <div className="space-y-6">
                  {/* Headers */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {selectedItem.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-[#ffe2ab] font-sans tracking-wide font-semibold"
                        >
                          <span className="material-symbols-outlined text-[9px] leading-none text-[#ffe2ab]">
                            {tag === 'GF' ? 'info' : tag === 'Veg' ? 'eco' : tag === 'Seafood' ? 'water_drop' : 'restaurant'}
                          </span>
                          {tag}
                        </span>
                      ))}
                      {selectedItem.spicyLevel && (() => {
                        const m = spicyMeta[selectedItem.spicyLevel];
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${m.bg} ${m.border} border rounded-full text-[9px] font-sans tracking-wide font-bold ${m.textColor}`}>
                            <span className={`material-symbols-outlined text-[9px] leading-none ${m.textColor}`}>local_fire_department</span>
                            {selectedItem.spicyLevel}
                          </span>
                        );
                      })()}
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-wide font-medium leading-tight">
                      {selectedItem.name}
                    </h2>
                    <div className="text-xl text-[#ffe2ab] font-serif font-bold mt-2">
                      {formatCurrency(selectedItem.price)}
                    </div>
                  </div>

                  {/* Tasting Notes */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#A69984]/50 tracking-[0.2em] block font-sans">
                      Chef's Tasting Notes & Profile
                    </span>
                    <p className="font-sans text-xs text-[#A69984]/80 leading-relaxed font-medium">
                      {selectedItem.description}
                    </p>
                  </div>

                  {/* Spice Level Selector */}
                  {selectedItem.category !== 'drinks' && selectedItem.category !== 'desserts' && (
                    <div className="border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#ffe2ab] select-none">local_fire_department</span>
                          <span className="text-[10px] uppercase font-bold text-[#A69984]/50 tracking-[0.15em] font-sans select-none">Spice Level</span>
                        </div>
                        {/* Live flame indicator badge */}
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-extrabold font-sans uppercase tracking-wider ${spicyMeta[selectedSpicyLevel].bg} ${spicyMeta[selectedSpicyLevel].border} ${spicyMeta[selectedSpicyLevel].textColor}`}>
                          {Array.from({ length: spicyMeta[selectedSpicyLevel].flames }).map((_, i) => (
                            <span key={i} className={`material-symbols-outlined text-[9px] leading-none ${spicyMeta[selectedSpicyLevel].textColor}`}>local_fire_department</span>
                          ))}
                          <span>{selectedSpicyLevel === 'Normal' ? 'Balanced' : spicyMeta[selectedSpicyLevel].label}</span>
                        </div>
                      </div>

                      {/* 4-segment pill controller */}
                      <div className="grid grid-cols-4 bg-[#0a0a09] border border-white/5 rounded-xl p-1 gap-1 font-sans select-none">
                        {(['Mild', 'Normal', 'Hot', 'Super Hot'] as SpicyLevel[]).map(level => {
                          const m = spicyMeta[level];
                          const isActive = selectedSpicyLevel === level;
                          return (
                            <button
                              type="button"
                              key={level}
                              onClick={() => setSelectedSpicyLevel(level)}
                              className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                                isActive
                                  ? `${m.bg} border ${m.border} ${m.textColor} shadow-sm`
                                  : 'text-[#A69984]/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              {level === 'Super Hot' ? 'Fiery' : level === 'Normal' ? 'Blnd' : m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Chef Notes Customization */}
                  <div className="border-t border-white/5 pt-4">
                    {!showNotesInput ? (
                      <button
                        type="button"
                        onClick={() => setShowNotesInput(true)}
                        className="flex items-center justify-between w-full text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-[#ffe2ab] select-none group-hover:scale-105 transition-transform">edit_note</span>
                          <span className="text-[10px] uppercase font-bold text-[#A69984]/50 group-hover:text-white/85 transition-colors tracking-[0.2em] font-sans select-none">
                            Special Instructions
                          </span>
                        </div>
                        <span className="text-[#ffe2ab]/80 group-hover:text-[#ffe2ab] text-[10px] font-sans font-bold uppercase tracking-wider">
                          + Add Notes
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-[#ffe2ab] select-none">edit_note</span>
                            <span className="text-[10px] uppercase font-bold text-[#A69984]/50 tracking-[0.2em] font-sans select-none">
                              Special Instructions
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotesInput(false);
                              setDishNotes('');
                            }}
                            className="text-rose-400/70 hover:text-rose-400 text-[9px] font-sans font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Cancel & Clear
                          </button>
                        </div>
                        
                        <textarea
                          value={dishNotes}
                          onChange={(e) => setDishNotes(e.target.value)}
                          placeholder="E.g., No onions, sauce on the side, extra garlic..."
                          rows={2}
                          className="w-full bg-[#12110f]/90 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-all font-sans resize-none font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Controls */}
                <div className="border-t border-white/5 pt-6 mt-8 flex items-center justify-between gap-4 select-none">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#A69984]/40 tracking-wider block font-sans">
                      Order Selection
                    </span>
                    <div className="font-sans font-bold text-white text-xs mt-0.5">
                      {detailQty > 0 ? `${detailQty} in cart` : 'Not added yet'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {detailQty === 0 ? (
                      <button 
                        onClick={() => addToCart(selectedItem.id, dishNotes)}
                        className="px-6 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Add to Order
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 border border-white/10 rounded-full p-1 bg-[#0a0a09]/80 shadow-md">
                        <button 
                          onClick={() => removeFromCart(selectedItem.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">remove</span>
                        </button>
                        <span className="font-sans font-bold text-white text-xs select-none w-5 text-center">
                          {detailQty}
                        </span>
                        <button 
                          onClick={() => addToCart(selectedItem.id, dishNotes)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ORDER SUBMITTED CONFIRMATION MODAL */}
      {orderSubmitted && (
        <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 p-6 sm:p-10 rounded-2xl max-w-md w-full shadow-2xl text-center relative select-none">
            <span className="material-symbols-outlined text-6xl text-[#ffe2ab] mb-4 font-light motion-safe:animate-pulse">check_circle</span>
            <h3 className="font-serif text-2xl text-white mb-2 font-medium tracking-wide">Order Handed to Kitchen</h3>
            <p className="text-[#ffe2ab] text-xs font-bold uppercase tracking-wider mb-4 font-sans">
              Table {tableNumber} • Transmitted Successfully
            </p>
            <p className="text-[#A69984]/70 text-xs leading-relaxed mb-8 font-sans">
              Your gourmet selections have been successfully locked in and sent to the culinary deck. Our chefs are handcrafting your dishes right now.
            </p>
            
            <div className="bg-[#12110f]/90 border border-white/5 p-4 rounded-xl mb-8 flex justify-around text-center font-sans">
              <div>
                <div className="text-[10px] text-[#A69984]/40 font-bold uppercase tracking-wider mb-1">Kitchen Prep</div>
                <div className="text-white text-sm font-bold">12 - 15 Mins</div>
              </div>
              <div className="w-[1px] bg-white/5"></div>
              <div>
                <div className="text-[10px] text-[#A69984]/40 font-bold uppercase tracking-wider mb-1">Status</div>
                <div className="text-[#ffe2ab] text-sm font-bold flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffe2ab] motion-safe:animate-ping"></span> Active
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link 
                href="/menu/order-status"
                onClick={handleDismissOrderSubmitted}
                className="w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
              >
                Track Cooking Status
                <span className="material-symbols-outlined text-sm font-black">hourglass_empty</span>
              </Link>
              <button 
                onClick={handleDismissOrderSubmitted}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Back to Digital Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI CULINARY CONCIERGE DRAWER OVERLAY */}
      {isAIChatOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md flex justify-end z-50 select-none">
          <div className="bg-[#161513]/98 backdrop-blur-xl border-l border-[#ffe2ab]/20 w-full sm:max-w-[460px] h-full p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(255,226,171,0.15)] animate-slide-in">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#181715] to-[#121110] border border-[#ffe2ab]/20 flex items-center justify-center text-[#ffe2ab]">
                    <span className="material-symbols-outlined text-lg leading-none motion-safe:animate-pulse">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-white font-medium tracking-wide">Aura Concierge</h3>
                    <p className="text-[#ffe2ab]/60 font-sans text-[8.5px] uppercase tracking-[0.15em] font-semibold">Intelligent Gastronomy Suite</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAIChatOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg leading-none">close</span>
                </button>
              </div>

              {/* Chat messages */}
              <div className="relative">
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0c0b0a] to-transparent z-10"></div>
              </div>
              <div className="space-y-4 h-[60vh] overflow-y-auto pr-1 flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {aiMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`max-w-[85%] rounded-2xl p-4 font-sans text-xs leading-relaxed shadow-lg ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#ffe2ab]/15 to-[#ffe2ab]/5 border border-[#ffe2ab]/25 text-[#ffe2ab] rounded-tr-none self-end ml-8' : 'bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 text-white/90 rounded-tl-none self-start mr-8'}`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isAILoading && (
                  <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 text-[#A69984]/60 rounded-2xl rounded-tl-none p-4 text-xs font-sans self-start flex items-center gap-2 shadow-lg mr-8">
                    <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    Analyzing flavor profile...
                  </div>
                )}
              </div>
            </div>

            {/* AI Prompts and Input bar */}
            <div>
              {/* Quick Suggestion Prompts */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide select-none">
                <button 
                  onClick={() => { setAiQuery('Recommend wine pairings for Wagyu'); }}
                  className="px-3.5 py-2.5 bg-gradient-to-b from-[#181715] to-[#121110] border border-white/10 hover:border-[#ffe2ab]/40 rounded-xl text-white hover:text-[#ffe2ab] text-[10px] font-bold tracking-wider shrink-0 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  🍷 Wine Pairings
                </button>
                <button 
                  onClick={() => { setAiQuery('Which items are gluten-free?'); }}
                  className="px-3.5 py-2.5 bg-gradient-to-b from-[#181715] to-[#121110] border border-white/10 hover:border-[#ffe2ab]/40 rounded-xl text-white hover:text-[#ffe2ab] text-[10px] font-bold tracking-wider shrink-0 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  🌾 Gluten Free
                </button>
                <button 
                  onClick={() => { setAiQuery('Tell me about the Risotto'); }}
                  className="px-3.5 py-2.5 bg-gradient-to-b from-[#181715] to-[#121110] border border-white/10 hover:border-[#ffe2ab]/40 rounded-xl text-white hover:text-[#ffe2ab] text-[10px] font-bold tracking-wider shrink-0 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  🍄 Acquerello Risotto
                </button>
              </div>

              <form onSubmit={handleAISubmit} className="flex gap-3 border-t border-white/5 pt-4">
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about ingredients, wine pairings..."
                  className="flex-1 bg-[#12110f] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors"
                />
                <button 
                  type="submit"
                  className="w-12 h-12 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl flex items-center justify-center transition-colors shadow-lg cursor-pointer flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg leading-none font-bold">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ITEM CUSTOMIZATION MODAL */}
      {selectedCustomizingItem && (
        <div className="fixed inset-0 w-screen h-screen bg-black/92 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-8 select-none animate-fade-in">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(255,226,171,0.12)] overflow-hidden flex flex-col max-h-[92vh]">

            {/* Hero image strip */}
            <div className="relative w-full h-[160px] overflow-hidden shrink-0 bg-[#0c0c0b]">
              <img
                src={selectedCustomizingItem.image}
                alt={selectedCustomizingItem.name}
                className="w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161513] via-[#161513]/60 to-transparent" />
              {/* Close button over image */}
              <button
                onClick={() => setSelectedCustomizingItem(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-all cursor-pointer z-10"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 p-5">
                <span className="text-[9px] uppercase font-bold text-[#ffe2ab] tracking-widest font-sans block mb-0.5">Customize Your Order</span>
                <h3 className="font-serif text-xl text-white font-medium leading-tight">{selectedCustomizingItem.name}</h3>
                <p className="text-[10px] text-[#A69984]/70 font-sans mt-0.5">Base: {formatCurrency(selectedCustomizingItem.price)}</p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2 space-y-6 scrollbar-hide">

              {/* Modifier Config Groups */}
              {itemModifiersConfig[selectedCustomizingItem.id]?.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-extrabold text-[#A69984]/60 tracking-[0.15em] font-sans">{group.title}</span>
                    <span className="text-[9px] text-[#ffe2ab]/50 font-sans font-bold">{group.type === 'single' ? '· Pick one' : '· Pick any'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt, oIdx) => {
                      const isSelected = selectedModifiers.includes(opt.name);
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            if (group.type === 'single') {
                              const otherOptNames = group.options.map(o => o.name);
                              setSelectedModifiers(prev => [
                                ...prev.filter(name => !otherOptNames.includes(name)),
                                opt.name
                              ]);
                            } else {
                              setSelectedModifiers(prev =>
                                isSelected ? prev.filter(name => name !== opt.name) : [...prev, opt.name]
                              );
                            }
                          }}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer font-sans ${
                            isSelected
                              ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/60 shadow-[0_0_12px_rgba(255,226,171,0.08)]'
                              : 'bg-[#0e0e0d] border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? 'bg-[#ffe2ab] border-[#ffe2ab]' : 'border-white/20'
                            }`}>
                              {isSelected && <span className="material-symbols-outlined text-[10px] text-[#402d00] leading-none font-black">check</span>}
                            </div>
                            <span className={`text-xs font-semibold leading-snug truncate ${isSelected ? 'text-[#ffe2ab]' : 'text-[#A69984]/80'}`}>{opt.name}</span>
                          </div>
                          {opt.price && (
                            <span className={`text-[10px] font-bold shrink-0 ${isSelected ? 'text-[#ffe2ab]' : 'text-[#A69984]/50'}`}>+{formatCurrency(opt.price)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Course Routing Selector */}
              <div className="space-y-2.5 border-t border-white/5 pt-5">
                <span className="text-[9px] uppercase font-extrabold text-[#A69984]/60 tracking-[0.15em] font-sans block">Course Timing</span>
                <div className="grid grid-cols-4 bg-[#0e0e0d] border border-white/5 rounded-xl p-1 gap-1 font-sans">
                  {(['starter', 'main', 'dessert', 'drinks'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCustomCourse(c)}
                      className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                        selectedCustomCourse === c
                          ? 'bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 text-[#ffe2ab]'
                          : 'text-[#A69984]/40 hover:text-white border border-transparent'
                      }`}
                    >
                      {c === 'main' ? 'Main' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="border-t border-white/5 pt-4 pb-1">
                {!showCustomizerNotesInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomizerNotesInput(true)}
                    className="flex items-center justify-between w-full text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#ffe2ab] select-none group-hover:scale-105 transition-transform">edit_note</span>
                      <span className="text-[10px] uppercase font-bold text-[#A69984]/50 group-hover:text-white/85 transition-colors tracking-[0.15em] font-sans select-none">
                        Special Instructions
                      </span>
                    </div>
                    <span className="text-[#ffe2ab]/70 group-hover:text-[#ffe2ab] text-[10px] font-sans font-bold uppercase tracking-wider">
                      + Add Notes
                    </span>
                  </button>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#ffe2ab] select-none">edit_note</span>
                        <span className="text-[10px] uppercase font-bold text-[#A69984]/50 tracking-[0.15em] font-sans select-none">Special Instructions</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowCustomizerNotesInput(false); setCustomizerNotes(''); }}
                        className="text-rose-400/60 hover:text-rose-400 text-[9px] font-sans font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <textarea
                      value={customizerNotes}
                      onChange={(e) => setCustomizerNotes(e.target.value)}
                      placeholder="E.g., No onions, sauce on the side, extra garlic..."
                      rows={2}
                      className="w-full bg-[#12110f]/90 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-all font-sans resize-none font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-6 pt-4 border-t border-white/5 flex gap-3 shrink-0 font-sans">
              <button
                onClick={() => setSelectedCustomizingItem(null)}
                className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-[#A69984] hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer shrink-0"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addItemToCartStructured(selectedCustomizingItem.id, 1, selectedModifiers, selectedCustomCourse, customizerNotes);
                  setSelectedCustomizingItem(null);
                  triggerPairingToast(`${selectedCustomizingItem.name} customized and added!`);
                }}
                className="flex-1 py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,226,171,0.15)] hover:scale-[1.01]"
              >
                <span className="material-symbols-outlined text-sm font-black leading-none">add_shopping_cart</span>
                Add to Order
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Administrative Table Unlock Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 select-none font-sans animate-fade-in">
          <div className="bg-[#161513] border border-white/10 rounded-2xl p-8 w-full max-w-[380px] shadow-2xl relative">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3">
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <h3 className="text-white font-bold text-base tracking-wide">Admin Access Required</h3>
              <p className="text-[#A69984]/60 text-xs mt-1 leading-relaxed">Enter Owner Admin credentials to temporarily unlock the table assignment.</p>
            </div>

            {adminAuthError && (
              <div className="mb-4 p-2.5 bg-rose-950/45 border border-rose-500/20 text-rose-300 text-[11px] rounded-lg text-center animate-shake">
                {adminAuthError}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const emailLower = adminEmailInput.toLowerCase().trim();
              if (emailLower === 'admin@dinepos.ai' && adminPasswordInput === 'admin123') {
                setIsTableTemporarilyUnlocked(true);
                setShowAdminAuthModal(false);
                setIsTableDropdownOpen(true);
              } else {
                setAdminAuthError('Invalid administrator credentials.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Admin Email</label>
                <input 
                  type="email" 
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full bg-[#12110f]/90 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-all font-medium"
                  placeholder="admin@dinepos.ai"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Admin Password</label>
                <input 
                  type="password" 
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-[#12110f]/90 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-[#A69984] hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center font-sans"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center shadow-[0_4px_16px_rgba(255,226,171,0.15)] hover:scale-[1.01] font-sans"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
