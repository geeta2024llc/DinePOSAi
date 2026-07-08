'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';
import { migrateCart, CartItem } from '../cartUtils';

const menuItemsRegistry: { [id: string]: { name: string; price: number; category: string; description: string } } = {
  'spec-1': { name: 'Gold Leaf A5 Wagyu Ribeye', price: 185, category: 'special', description: '300g Japanese A5 Miyazaki Wagyu, seared over binchotan charcoal.' },
  'spec-2': { name: 'Beluga Caviar & Oysters', price: 95, category: 'special', description: 'Six freshly shucked Kumamoto oysters topped with Beluga caviar.' },
  'start-1': { name: 'Wagyu Beef Tartare', price: 38, category: 'starters', description: 'Hand-cut A5 Wagyu, quail egg yolk, Dijon emulsion.' },
  'start-2': { name: 'Truffle Burrata Salad', price: 26, category: 'starters', description: 'Creamy Italian burrata, heirloom cherry tomatoes, balsamic.' },
  'start-3': { name: 'Pan-Seared Jumbo Scallops', price: 42, category: 'starters', description: 'Pan-seared jumbo scallops, sweet pea purée.' },
  'main-1': { name: 'Acquerello Mushroom Risotto', price: 32, category: 'mains', description: 'Acquerello carnaroli rice, foraged forest mushrooms, black truffle.' },
  'main-2': { name: 'Crispy Skin Sea Bass', price: 45, category: 'mains', description: 'Crispy skin Chilean sea bass, creamy saffron risotto.' },
  'main-3': { name: 'Truffle Glazed Filet Mignon', price: 58, category: 'mains', description: '8oz USDA Prime tenderloin, truffle potato purée.' },
  'dess-1': { name: 'Chocolate Soufflé', price: 18, category: 'desserts', description: '70% Valrhona dark chocolate soufflé, vanilla bean gelato.' },
  'dess-2': { name: 'Saffron Crème Brûlée', price: 16, category: 'desserts', description: 'Silky saffron-infused custard, sugar crust.' },
  'drink-1': { name: 'Royal Gold Old Fashioned', price: 28, category: 'drinks', description: 'Rare 12-year bourbon, demerara syrup, gold bitters.' },
  'drink-2': { name: 'Signature Emerald Gimlet', price: 22, category: 'drinks', description: 'Empress gin, fresh lime, botanical cucumber elixir.' },
  'rec-1': { name: 'Château Margaux', price: 320, category: 'drinks', description: '2015 Bordeaux Blend. Rich, opulent, notes of dark plum.' },
  'rec-2': { name: 'Opus One', price: 450, category: 'drinks', description: '2018 Napa Valley. Elegant structure, cassis, refined tannins.' }
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

const DEFAULT_PRICES: Record<string, number> = {
  'Gold Leaf A5 Wagyu Ribeye': 185.00,
  'Beluga Caviar & Oysters': 95.00,
  'Imperial Signature Combo': 120.00,
  'Royal Vegetarian Tasting Set': 75.00,
  'Wagyu Beef Tartare': 38.00,
  'Truffle Burrata Salad': 26.00,
  'Pan-Seared Jumbo Scallops': 42.00,
  'Acquerello Mushroom Risotto': 32.00,
  'Crispy Skin Sea Bass': 45.00,
  'Truffle Glazed Filet Mignon': 58.00,
  'Chocolate Soufflé': 18.00,
  'Saffron Crème Brûlée': 16.00,
  'Royal Gold Old Fashioned': 28.00,
  'Signature Emerald Gimlet': 22.00,
  'Filet Mignon': 58.00,
  'Scallop Risotto': 42.00,
  'Wagyu Burger': 38.00,
  'Caesar Salad': 18.00,
  'Tasting Menu A': 120.00,
  'Duck Breast': 45.00,
  'Lobster Thermidor': 85.00,
  'Wagyu Burger (Well Done)': 38.00,
  'Chocolate Soufflé ': 18.00,
  'Beluga Caviar & Oysters ': 95.00,
};

const getItemPrice = (item: any): number => {
  if (item && typeof item.price === 'number') {
    return item.price;
  }
  if (item && item.name && DEFAULT_PRICES[item.name] !== undefined) {
    return DEFAULT_PRICES[item.name];
  }
  return 0;
};

export default function OrderStatusPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // 1 = Received, 2 = Cooking, 3 = Plating, 4 = Ready
  const [activeTicket, setActiveTicket] = useState<any>(null);
  
  const [placedOrder, setPlacedOrder] = useState<{ [cartKey: string]: CartItem }>({});
  const [tableNumber, setTableNumber] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);
  const [diningOption, setDiningOption] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [taxRateDineIn, setTaxRateDineIn] = useState(0.10);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(0.08);
  const [taxRateDelivery, setTaxRateDelivery] = useState(0.08);
  const [exclusionsConfig, setExclusionsConfig] = useState({
    maxPrice: 40,
    excludedTags: ['Seafood'],
    showAIConcierge: true,
    enableSelfCheckout: true
  });

  const [fallbackList, setFallbackList] = useState([
    {
      id: 'item-1',
      name: 'A5 Wagyu Striploin',
      details: 'Qty: x1 • Medium Rare • Truffle Butter',
      status: 'Cooking',
      statusType: 'active',
      icon: 'restaurant'
    },
    {
      id: 'item-2',
      name: 'Château Margaux 2015',
      details: 'Qty: x1 • Glass • Decanted',
      status: 'Prepared',
      statusType: 'completed',
      icon: 'wine_bar'
    },
    {
      id: 'item-3',
      name: 'Valrhona Chocolate Sphere',
      details: 'Qty: x1 • Hold for dessert',
      status: 'Pending',
      statusType: 'pending',
      icon: 'cookie'
    }
  ]);

  const [editingItemData, setEditingItemData] = useState<{ id: string; name: string; quantity: number; notes: string } | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW' | 'NPR'>('USD');

  const formatCurrency = (val: number) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CNY: '¥',
      KRW: '₩',
      JPY: '¥',
      NPR: 'Rs.'
    };
    const rateMap: Record<string, number> = {
      USD: 1,
      JPY: 150,
      EUR: 0.92,
      GBP: 0.79,
      CNY: 7.24,
      KRW: 1340,
      NPR: 133
    };
    const symbol = symbolMap[currency] || '$';
    const rate = rateMap[currency] || 1;
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW' || currency === 'NPR') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const activeTicketId = localStorage.getItem('dinepos_active_ticket_id');
    const sharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
    if (activeTicketId && sharedTicketsStr) {
      try {
        const tickets = JSON.parse(sharedTicketsStr);
        const matched = tickets.find((t: any) => t.id === activeTicketId);
        if (matched) {
          setActiveTicket(matched);
          setTableNumber(parseInt(matched.tableNumber.replace('Table ', ''), 10) || 12);
          const step = matched.status === 'pending' ? 1 : matched.status === 'cooking' ? 2 : matched.status === 'complete' ? 4 : 2;
          setActiveStep(step);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedOrder = localStorage.getItem('dinepos_placed_order');
    if (savedOrder) {
      try {
        setPlacedOrder(migrateCart(savedOrder));
      } catch (e) {
        console.error('Failed to parse placed order:', e);
      }
    }
    const savedDiningOption = localStorage.getItem('dinepos_dining_option');
    if (savedDiningOption === 'dine-in' || savedDiningOption === 'takeaway' || savedDiningOption === 'delivery') {
      setDiningOption(savedDiningOption);
    }
    const savedTaxRateDineIn = localStorage.getItem('dinepos_tax_rate_dine_in');
    const savedTaxRateTakeaway = localStorage.getItem('dinepos_tax_rate_takeaway');
    const savedTaxRateDelivery = localStorage.getItem('dinepos_tax_rate_delivery');

    if (savedTaxRateDineIn) setTaxRateDineIn(parseFloat(savedTaxRateDineIn) / 100);
    if (savedTaxRateTakeaway) setTaxRateTakeaway(parseFloat(savedTaxRateTakeaway) / 100);
    if (savedTaxRateDelivery) setTaxRateDelivery(parseFloat(savedTaxRateDelivery) / 100);

    const savedTable = localStorage.getItem('dinepos_table_number');
    if (savedTable && !activeTicketId) {
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
    const savedCurrency = localStorage.getItem('dinepos_currency');
    if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW', 'NPR'].includes(savedCurrency || '')) {
      setCurrency(savedCurrency as any);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_shared_tickets' && e.newValue) {
        const activeTicketId = localStorage.getItem('dinepos_active_ticket_id');
        if (activeTicketId) {
          try {
            const tickets = JSON.parse(e.newValue);
            const matched = tickets.find((t: any) => t.id === activeTicketId);
            if (matched) {
              setActiveTicket(matched);
              setTableNumber(parseInt(matched.tableNumber.replace('Table ', ''), 10) || 12);
              const step = matched.status === 'pending' ? 1 : matched.status === 'cooking' ? 2 : matched.status === 'complete' ? 4 : 2;
              setActiveStep(step);
            }
          } catch (err) {
            console.error(err);
          }
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
          console.error('Failed to parse storage exclusions config updates:', err);
        }
      }
      if (e.key === 'dinepos_dining_option' && e.newValue) {
        if (e.newValue === 'dine-in' || e.newValue === 'takeaway' || e.newValue === 'delivery') {
          setDiningOption(e.newValue);
        }
      }
      if (e.key === 'dinepos_tax_rate_dine_in' && e.newValue) {
        setTaxRateDineIn(parseFloat(e.newValue) / 100);
      }
      if (e.key === 'dinepos_tax_rate_takeaway' && e.newValue) {
        setTaxRateTakeaway(parseFloat(e.newValue) / 100);
      }
      if (e.key === 'dinepos_tax_rate_delivery' && e.newValue) {
        setTaxRateDelivery(parseFloat(e.newValue) / 100);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isOrderEmpty = !isLoaded || ((!placedOrder || Object.keys(placedOrder).length === 0) && !activeTicket);

  // Calculations for receipt
  let subtotal = 740;
  if (activeTicket) {
    subtotal = activeTicket.items.reduce((acc: number, item: any) => acc + (getItemPrice(item) * item.qty), 0);
  } else if (!isOrderEmpty) {
    subtotal = Object.values(placedOrder).reduce((acc, ci) => {
      const item = menuItemsRegistry[ci.itemId];
      let modifierExtra = 0;
      ci.modifiers.forEach(modName => {
        const configs = itemModifiersConfig[ci.itemId] || [];
        for (const config of configs) {
          const opt = config.options.find(o => o.name === modName);
          if (opt?.price) {
            modifierExtra += opt.price;
          }
        }
      });
      const singlePrice = (item ? item.price : 0) + modifierExtra;
      return acc + (singlePrice * ci.quantity);
    }, 0);
  }
  const taxRate = (activeTicket && typeof activeTicket.taxRate === 'number' && !isNaN(activeTicket.taxRate))
    ? activeTicket.taxRate
    : (diningOption === 'takeaway'
      ? taxRateTakeaway
      : diningOption === 'delivery'
        ? taxRateDelivery
        : taxRateDineIn);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Custom mock data for the order selections (matching screenshot)
  const fallbackItems = [
    {
      id: 'item-1',
      name: 'A5 Wagyu Striploin',
      details: 'Medium Rare • Truffle Butter',
      status: 'Cooking',
      statusType: 'active',
      icon: 'restaurant'
    },
    {
      id: 'item-2',
      name: 'Château Margaux 2015',
      details: 'Glass • Decanted',
      status: 'Prepared',
      statusType: 'completed',
      icon: 'wine_bar'
    },
    {
      id: 'item-3',
      name: 'Valrhona Chocolate Sphere',
      details: 'Hold for dessert',
      status: 'Pending',
      statusType: 'pending',
      icon: 'cookie'
    }
  ];

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'drinks': return 'wine_bar';
      case 'desserts': return 'cookie';
      case 'starters': return 'restaurant';
      case 'mains': return 'restaurant_menu';
      case 'special': return 'auto_awesome';
      default: return 'restaurant';
    }
  };

  const getStatusInfo = (idx: number, totalLen: number) => {
    if (totalLen === 1) {
      return { status: 'Cooking', statusType: 'active' };
    }
    if (idx === 0) {
      return { status: 'Prepared', statusType: 'completed' };
    } else if (idx === 1) {
      return { status: 'Cooking', statusType: 'active' };
    } else {
      return { status: 'Pending', statusType: 'pending' };
    }
  };
  const handleDeletePendingItem = (itemId: string) => {
    if (activeTicket) {
      const match = itemId.match(/-item-(\d+)$/);
      if (match) {
        const itemIdx = parseInt(match[1], 10);
        const updatedItems = activeTicket.items.filter((_: any, idx: number) => idx !== itemIdx);
        
        const existingSharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
        if (existingSharedTicketsStr) {
          try {
            let tickets = JSON.parse(existingSharedTicketsStr);
            tickets = tickets.map((t: any) => {
              if (t.id === activeTicket.id) {
                return { ...t, items: updatedItems };
              }
              return t;
            });
            localStorage.setItem('dinepos_shared_tickets', JSON.stringify(tickets));
            setActiveTicket({ ...activeTicket, items: updatedItems });
          } catch (e) {
            console.error(e);
          }
        }
      }
    } else if (isOrderEmpty) {
      setFallbackList(prev => prev.filter(item => item.id !== itemId));
    } else {
      setPlacedOrder(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        localStorage.setItem('dinepos_placed_order', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleEditPendingItem = (itemId: string) => {
    if (activeTicket) {
      const match = itemId.match(/-item-(\d+)$/);
      if (match) {
        const itemIdx = parseInt(match[1], 10);
        const item = activeTicket.items[itemIdx];
        if (item) {
          setEditingItemData({
            id: itemId,
            name: item.name,
            quantity: item.qty,
            notes: item.note || ''
          });
        }
      }
    } else if (isOrderEmpty) {
      const item = fallbackList.find(i => i.id === itemId);
      if (item) {
        const qtyMatch = item.details.match(/Qty:\s*x(\d+)/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const noteMatch = item.details.match(/Note:\s*"([^"]+)"/);
        const notes = noteMatch ? noteMatch[1] : '';
        setEditingItemData({ id: itemId, name: item.name, quantity: qty, notes });
      }
    } else {
      const ci = placedOrder[itemId];
      if (ci) {
        const item = menuItemsRegistry[ci.itemId];
        setEditingItemData({
          id: itemId,
          name: item ? item.name : 'Gourmet Selection',
          quantity: ci.quantity,
          notes: ci.notes || ''
        });
      }
    }
  };

  const handleSavePendingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemData) return;

    if (activeTicket) {
      const match = editingItemData.id.match(/-item-(\d+)$/);
      if (match) {
        const itemIdx = parseInt(match[1], 10);
        const updatedItems = activeTicket.items.map((item: any, idx: number) => {
          if (idx === itemIdx) {
            return {
              ...item,
              qty: editingItemData.quantity,
              note: editingItemData.notes || undefined
            };
          }
          return item;
        });

        const existingSharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
        if (existingSharedTicketsStr) {
          try {
            let tickets = JSON.parse(existingSharedTicketsStr);
            tickets = tickets.map((t: any) => {
              if (t.id === activeTicket.id) {
                return { ...t, items: updatedItems };
              }
              return t;
            });
            localStorage.setItem('dinepos_shared_tickets', JSON.stringify(tickets));
            setActiveTicket({ ...activeTicket, items: updatedItems });
          } catch (err) {
            console.error(err);
          }
        }
      }
    } else if (isOrderEmpty) {
      setFallbackList(prev => prev.map(item => {
        if (item.id === editingItemData.id) {
          let details = `Qty: x${editingItemData.quantity}`;
          if (editingItemData.notes) {
            details += ` • "${editingItemData.notes}"`;
          }
          return {
            ...item,
            details
          };
        }
        return item;
      }));
    } else {
      setPlacedOrder(prev => {
        const updated = { ...prev };
        if (updated[editingItemData.id]) {
          updated[editingItemData.id] = {
            ...updated[editingItemData.id],
            quantity: editingItemData.quantity,
            notes: editingItemData.notes
          };
          localStorage.setItem('dinepos_placed_order', JSON.stringify(updated));
        }
        return updated;
      });
    }
    setEditingItemData(null);
  };

  const selectionItems = activeTicket
    ? activeTicket.items.map((item: any, idx: number) => {
        const itemStatus = activeTicket.status === 'pending' ? 'Pending' : activeTicket.status === 'cooking' ? 'Cooking' : activeTicket.status === 'complete' ? 'Prepared' : 'Pending';
        const itemStatusType = activeTicket.status === 'pending' ? 'pending' : activeTicket.status === 'cooking' ? 'active' : activeTicket.status === 'complete' ? 'completed' : 'pending';
        
        let detailsStr = `Qty: x${item.qty}`;
        if (item.options && item.options.length > 0) {
          detailsStr += ` • ${item.options.map((o: any) => o.text).join(', ')}`;
        }
        if (item.note) {
          detailsStr += ` • "${item.note}"`;
        }

        return {
          id: `${activeTicket.id}-item-${idx}`,
          name: item.name,
          details: detailsStr,
          status: itemStatus,
          statusType: itemStatusType,
          icon: getItemIcon(item.course || 'mains')
        };
      })
    : isOrderEmpty
      ? fallbackList
      : Object.entries(placedOrder).map(([key, ci], idx) => {
          const registryItem = menuItemsRegistry[ci.itemId];
          const statusInfo = getStatusInfo(idx, Object.keys(placedOrder).length);
          let detailsStr = `Qty: x${ci.quantity}`;
          if (ci.modifiers && ci.modifiers.length > 0) {
            detailsStr += ` • ${ci.modifiers.join(', ')}`;
          }
          if (ci.notes) {
            detailsStr += ` • "${ci.notes}"`;
          }
          return {
            id: key,
            name: registryItem ? registryItem.name : 'Gourmet Selection',
            details: detailsStr,
            status: statusInfo.status,
            statusType: statusInfo.statusType,
            icon: getItemIcon(registryItem ? registryItem.category : 'mains')
          };
        });

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#f5f5f5] font-sans overflow-hidden antialiased select-none relative">
      
      {/* Sidebar navigation panel */}
      <aside className={`h-full flex flex-col justify-between border-r border-white/5 bg-[#0a0a09] flex-shrink-0 z-20 transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px]'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-8 pb-4">
            <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-2xl tracking-wide select-none block hover:opacity-85 transition-opacity mb-4">
              DinePOS AI
            </Link>
            <div className="font-sans font-bold text-xs text-white/90 mb-1 select-none">DinePOS Executive Suite</div>
            <div className="font-sans text-[11px] text-[#A69984]/60 select-none">Main Dining Room</div>
          </div>
          
          {/* Main options (matching screenshot layout) */}
          <nav className="px-5 space-y-2 mt-6">
            <Link 
              href="/menu" 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">menu_book</span>
              Menu
            </Link>
            {exclusionsConfig.showAIConcierge && (
              <Link 
                href="/menu/concierge"
                className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-lg leading-none">auto_awesome</span>
                Concierge
              </Link>
            )}
            <button 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider bg-[#ffe2ab] text-[#402d00] shadow-[0_4px_12px_rgba(255,226,171,0.15)] transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">hourglass_empty</span>
              Order Status
            </button>
          </nav>
        </div>

        {/* Bottom checkout action inside sidebar */}
        {exclusionsConfig.enableSelfCheckout && (
          <div className="px-5 pb-8">
            <Link
              href="/menu/checkout"
              className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)]"
            >
              <span className="material-symbols-outlined text-base">credit_card</span>
              Self Checkout
            </Link>
          </div>
        )}
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#11100e] relative overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 flex-shrink-0 bg-[#0e0e0d] border-b border-white/5 sticky top-0 z-40 select-none">
          <h1 className="font-serif text-[20px] font-bold text-[#ffe2ab] tracking-wide leading-none select-none">
            DinePosAi
          </h1>
          
          {/* Top-right helper controls (Concierge / Basket) */}
          <div className="flex items-center gap-4">
            <Link 
              href="/menu"
              className="w-[42px] h-[42px] flex items-center justify-center bg-transparent border border-[#A69984]/25 rounded-xl text-[#ffe2ab] hover:border-[#ffe2ab]/40 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl leading-none">account_circle</span>
            </Link>
            <Link 
              href="/menu"
              className="w-[42px] h-[42px] flex items-center justify-center bg-transparent border border-[#A69984]/25 rounded-xl text-[#ffe2ab] hover:border-[#ffe2ab]/40 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl leading-none">shopping_basket</span>
            </Link>
          </div>
        </header>

        {/* Inner Content Grid */}
        <div className="flex-1 overflow-y-auto px-10 pb-36 pt-8 space-y-8 scrollbar-hide">
          
          {/* Main Title Banner */}
          <div>
            <h2 className="font-serif text-[40px] font-medium text-white tracking-wide leading-tight select-none">
              Order Status
            </h2>
            <div className="font-sans text-xs text-[#A69984]/70 mt-1 select-none font-semibold">
              Table {isLoaded ? tableNumber : 42} • Order #{activeTicket ? activeTicket.orderNumber : '88A92'}
            </div>
          </div>

          {/* Stepper + Kitchen Feed Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* stepper progress timeline card (Span 7) */}
            <div className="lg:col-span-7 bg-[#161513]/90 border border-white/5 p-8 rounded-2xl flex flex-col justify-between shadow-xl relative min-h-[220px]">
              <div>
                <div className="flex justify-between items-start mb-6 select-none">
                  <div>
                    <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1 block">Current Phase</span>
                    <h3 className="font-serif text-2xl font-bold text-white tracking-wide">Artisan Preparation</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/95 font-sans font-bold select-none">
                    <span className="material-symbols-outlined text-xs text-[#ffe2ab] animate-spin">progress_activity</span>
                    Est. 12 Min
                  </span>
                </div>
              </div>
              
              {/* Stepper Timeline (matching progress bar in screenshot) */}
              <div className="relative w-full pt-4 pb-2 select-none">
                {/* Horizontal Connector Line */}
                <div className="absolute top-[28px] left-8 right-8 h-[2px] bg-white/5 z-0"></div>
                
                {/* Highlighted active gold line connector */}
                <div 
                  className="absolute top-[28px] left-8 h-[2px] bg-[#ffe2ab]/70 z-0 transition-all duration-700"
                  style={{ width: '33.33%' }} // Connected from first to second bullet (Cooking)
                ></div>

                <div className="flex justify-between relative z-10 w-full font-sans">
                  
                  {/* Step 1: Received */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#ffe2ab] text-[#402d00] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(255,226,171,0.3)] transition-all">
                      <span className="material-symbols-outlined text-sm font-black">check</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#A69984] mt-2">Received</span>
                  </div>

                  {/* Step 2: Cooking */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#11100e] border-2 border-[#ffe2ab] text-[#ffe2ab] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,226,171,0.2)] animate-pulse relative">
                      <span className="w-2 h-2 bg-[#ffe2ab] rounded-full"></span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#ffe2ab] mt-2">Cooking</span>
                  </div>

                  {/* Step 3: Plating */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#11100e] border border-white/10 text-[#A69984]/50 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-base">chef_hat</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#A69984]/40 mt-2">Plating</span>
                  </div>

                  {/* Step 4: Ready */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#11100e] border border-white/10 text-[#A69984]/50 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-base">check</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#A69984]/40 mt-2">Ready</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Kitchen Feed (Span 5) */}
            <div className="lg:col-span-5 bg-[#161513]/90 border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="p-6 pb-2 select-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-sans text-[9px] text-[#f5f5f5]/80 font-bold uppercase tracking-[0.2em]">Kitchen Feed</span>
              </div>
              
              {/* Steak Image (visual mockup placeholder mirroring fine dining atmosphere) */}
              <div className="h-[120px] w-full relative overflow-hidden bg-white/5 flex items-center justify-center text-white/10">
                <span className="material-symbols-outlined text-4xl absolute">restaurant</span>
                <img 
                  src="https://images.unsplash.com/photo-1544025162-8111142154ea?q=80&w=600&auto=format&fit=crop"
                  alt="Chef cooking steak"
                  className="w-full h-full object-cover grayscale brightness-75 select-none relative z-10"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161513] via-transparent to-transparent z-20"></div>
              </div>

              <div className="p-6 pt-1 font-serif text-[13.5px] italic text-[#A69984]/90 leading-relaxed select-none">
                "Executive Chef Laurent is currently searing the Wagyu to your exact medium-rare specification."
              </div>
            </div>

          </div>

          {/* Your Selection Item statuses */}
          <div className="space-y-4">
            <h3 className="font-serif text-[22px] font-medium text-white tracking-wide select-none">
              Your Selection
            </h3>
            
            <div className="bg-[#161513]/90 border border-white/5 rounded-2xl overflow-hidden shadow-lg divide-y divide-white/5">
              {selectionItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-6 hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-5">
                    
                    {/* Visual icon box on the left */}
                    <div className="w-[50px] h-[50px] bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-[#ffe2ab]/80">
                      <span className="material-symbols-outlined text-xl leading-none">
                        {item.icon}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-md text-white font-medium tracking-wide leading-none mb-2">
                        {item.name}
                      </h4>
                      <p className="font-sans text-[#A69984]/70 text-[11px] leading-none font-semibold">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-3">
                    {item.statusType === 'pending' && (
                      <div className="flex items-center gap-2 border-r border-white/5 pr-4 mr-1">
                        <button
                          type="button"
                          onClick={() => handleEditPendingItem(item.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#ffe2ab]/10 border border-white/10 hover:border-[#ffe2ab]/20 text-[#ffe2ab] flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Order Item"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePendingItem(item.id)}
                          className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Cancel & Delete Order Item"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    )}
                    {item.statusType === 'active' && (
                      <span className="inline-flex items-center px-3 py-1 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 rounded-lg text-[10.5px] text-[#ffe2ab] font-sans font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(255,226,171,0.05)] select-none">
                        Cooking
                      </span>
                    )}
                    {item.statusType === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10.5px] text-white/70 font-sans font-bold uppercase tracking-widest select-none">
                        <span className="material-symbols-outlined text-xs leading-none text-[#ffe2ab] font-black">check</span>
                        Prepared
                      </span>
                    )}
                    {item.statusType === 'pending' && (
                      <span className="inline-flex items-center px-3 py-1 bg-transparent border border-white/10 rounded-lg text-[10.5px] text-white/30 font-sans font-bold uppercase tracking-widest select-none">
                        Pending
                      </span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Actions Sticky Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-[#161513] border-t border-white/5 px-10 py-5 flex items-center justify-between gap-4 z-30 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] select-none">
          <Link 
            href="/menu"
            className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#ffe2ab] hover:text-[#ffdca0] transition-colors"
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            Return to Menu
          </Link>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowReceipt(true)}
              className="flex items-center gap-2.5 bg-transparent border border-[#A69984]/25 hover:border-[#ffe2ab]/40 px-6 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest text-white transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              View Receipt
            </button>
            
            {exclusionsConfig.enableSelfCheckout && (
              <Link 
                href="/menu/checkout"
                className="bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] px-8 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:scale-[1.01] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">credit_card</span>
                Self Checkout
              </Link>
            )}
          </div>
        </div>

      </main>

      {/* VIEW RECEIPT SIDE DRAWER OVERLAY */}
      {showReceipt && (
        <div className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md flex justify-end z-50 animate-fade-in duration-300 flex-none">
          <div className="bg-[#161513] border-l border-white/5 w-full sm:max-w-[460px] h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl animate-slide-in duration-300">
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 select-none">
                <div>
                  <h3 className="font-serif text-2xl text-white font-medium tracking-wide">Itemized Receipt</h3>
                  <p className="text-[#A69984]/50 font-sans text-xs mt-1">Table {isLoaded ? tableNumber : 42} • Invoice #{activeTicket ? activeTicket.orderNumber : '88A92'}</p>
                </div>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg leading-none">close</span>
                </button>
              </div>

              {/* Receipt Breakdowns */}
              <div className="space-y-4 font-sans select-none">
                {activeTicket ? (
                  activeTicket.items.map((item: any, idx: number) => {
                    const itemTotal = getItemPrice(item) * item.qty;
                    return (
                      <div key={idx} className={`flex justify-between items-start py-1 ${idx > 0 ? 'border-t border-white/5 pt-4' : ''}`}>
                        <div className="max-w-[70%]">
                          <div className="font-serif text-sm text-white font-medium tracking-wide">{item.name}</div>
                          {item.options && item.options.length > 0 && (
                            <div className="text-[#ffe2ab]/75 text-[10px] font-sans mt-0.5 italic">{item.options.map((o: any) => o.text).join(', ')}</div>
                          )}
                          {item.note && (
                            <div className="text-[#A69984]/50 text-[10px] font-sans mt-0.5 italic">Note: "{item.note}"</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs font-bold font-sans">x{item.qty}</div>
                          <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">{formatCurrency(itemTotal)}</div>
                        </div>
                      </div>
                    );
                  })
                ) : isOrderEmpty ? (
                  <>
                    <div className="flex justify-between items-start py-1">
                      <div className="max-w-[70%]">
                        <div className="font-serif text-sm text-white font-medium tracking-wide">Tasting Menu - Chef's Reserve</div>
                        <div className="text-[#A69984]/50 text-[11px] mt-1 font-semibold">Includes standard wine pairing. Dietary: None</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-bold font-sans">x2</div>
                        <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">{formatCurrency(590)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start py-1 border-t border-white/5 pt-4">
                      <div className="max-w-[70%]">
                        <div className="font-serif text-sm text-white font-medium tracking-wide">Vintage Champagne Upgrade</div>
                        <div className="text-[#A69984]/50 text-[11px] mt-1 font-semibold">Dom Pérignon 2012</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-bold font-sans">x1</div>
                        <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">{formatCurrency(150)}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  Object.entries(placedOrder).map(([key, ci], idx) => {
                    const registryItem = menuItemsRegistry[ci.itemId];
                    if (!registryItem) return null;
                    
                    let modifierExtra = 0;
                    ci.modifiers.forEach(modName => {
                      const configs = itemModifiersConfig[ci.itemId] || [];
                      for (const config of configs) {
                        const opt = config.options.find(o => o.name === modName);
                        if (opt?.price) {
                          modifierExtra += opt.price;
                        }
                      }
                    });
                    const singlePrice = registryItem.price + modifierExtra;
                    const itemTotal = singlePrice * ci.quantity;

                    return (
                      <div key={key} className={`flex justify-between items-start py-1 ${idx > 0 ? 'border-t border-white/5 pt-4' : ''}`}>
                        <div className="max-w-[70%]">
                          <div className="font-serif text-sm text-white font-medium tracking-wide">{registryItem.name}</div>
                          {ci.modifiers.length > 0 && (
                            <div className="text-[#ffe2ab]/75 text-[10px] font-sans mt-0.5 italic">{ci.modifiers.join(', ')}</div>
                          )}
                          {ci.notes && (
                            <div className="text-[#A69984]/50 text-[10px] font-sans mt-0.5 italic">Note: "{ci.notes}"</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs font-bold font-sans">x{ci.quantity}</div>
                          <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">{formatCurrency(itemTotal)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom summary matching checkout screenshot */}
            <div className="border-t border-white/5 pt-6 space-y-4 font-sans select-none">
              <div className="flex justify-between text-xs text-[#A69984]/60 font-bold uppercase tracking-wider">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#A69984]/60 font-bold uppercase tracking-wider border-b border-white/5 pb-4">
                <span>Taxes & Fees ({(taxRate * 100).toFixed(1)}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2">
                <span className="font-serif text-lg">Total Due</span>
                <span className="text-[#ffe2ab] text-xl font-bold font-serif">{formatCurrency(total)}</span>
              </div>
              
              {exclusionsConfig.enableSelfCheckout ? (
                <Link 
                  href="/menu/checkout"
                  className="w-full py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_24px_rgba(255,226,171,0.15)] flex items-center justify-center gap-2.5 cursor-pointer mt-4"
                >
                  Proceed to Checkout
                  <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                </Link>
              ) : (
                <div className="text-center text-[#A69984]/50 font-sans text-xs mt-4 leading-relaxed">
                  Self-Checkout is currently disabled. Please request assistance from your waiter to settle the bill.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Pending Item Modal */}
      {editingItemData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans select-none animate-fade-in">
          <div className="bg-[#161513] border border-white/10 rounded-2xl p-8 w-full max-w-[380px] shadow-2xl">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 flex items-center justify-center text-[#ffe2ab] mx-auto mb-3">
                <span className="material-symbols-outlined text-xl">edit_document</span>
              </div>
              <h3 className="text-white font-bold text-base tracking-wide">Edit Pending Item</h3>
              <p className="text-[#A69984]/60 text-xs mt-1 leading-relaxed">{editingItemData.name}</p>
            </div>

            <form onSubmit={handleSavePendingItem} className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingItemData(prev => prev ? { ...prev, quantity: Math.max(1, prev.quantity - 1) } : null)}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>
                  <span className="flex-1 text-center font-bold text-white text-sm font-mono">{editingItemData.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setEditingItemData(prev => prev ? { ...prev, quantity: Math.min(10, prev.quantity + 1) } : null)}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Special Instructions</label>
                <textarea 
                  value={editingItemData.notes}
                  onChange={(e) => setEditingItemData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  className="w-full bg-[#12110f]/90 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-all font-sans resize-none font-medium"
                  placeholder="E.g., Extra sauce, no ice, hold for dessert..."
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingItemData(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-[#A69984] hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center font-sans"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center shadow-[0_4px_16px_rgba(255,226,171,0.15)] hover:scale-[1.01] font-sans"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
