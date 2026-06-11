'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const VALID_PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  'DINE10': { type: 'percent', value: 10, label: '10% Off' },
  'DINE20': { type: 'percent', value: 20, label: '20% Off' },
  'VIP50':  { type: 'fixed',   value: 50, label: '$50 Off (VIP)' },
  'HAPPY15':{ type: 'percent', value: 15, label: '15% Happy Hour' },
  'CHEF25': { type: 'percent', value: 25, label: "25% Chef's Special" },
};

interface Operator {
  name: string;
  role: string;
  avatar: string;
}

const AVAILABLE_OPERATORS: Operator[] = [
  {
    name: 'Michael T.',
    role: 'Head Waiter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop'
  },
  {
    name: 'Sarah J.',
    role: 'Waitress',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop'
  },
  {
    name: 'Alex D.',
    role: 'Bartender',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop'
  },
  {
    name: 'J. Smith',
    role: 'General Manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
  }
];

interface OrderItem {
  qty: number;
  name: string;
  note?: string;
  price: number;
}

interface PosTicket {
  id: string;
  tableNumber: string;
  serverName: string;
  duration: string;
  isVip?: boolean;
  isSplit?: boolean;
  needsPayment?: boolean;
  cardAmount: number; // Mapped mockup card amount
  guests: number;
  orderNumber: string;
  items: OrderItem[];
  taxRate: number;
  gratuityRate: number;
  splitMethod?: 'evenly' | 'by-item';
  splitGuestCount?: number;
  splitPaidGuests?: number[];
  splitItemAssignments?: Record<number, number>;
}

const initialTickets: PosTicket[] = [
  {
    id: 'ticket-1',
    tableNumber: 'Table 12',
    serverName: 'Michael T.',
    duration: '45m',
    isVip: true,
    needsPayment: true,
    cardAmount: 342.50,
    guests: 4,
    orderNumber: '#8492',
    taxRate: 0.085,
    gratuityRate: 0.20,
    items: [
      { qty: 2, name: 'Truffle Risotto', note: '+ Extra Truffle Shavings', price: 76.00 },
      { qty: 1, name: 'Wagyu Ribeye 12oz', note: 'Medium Rare', price: 145.00 },
      { qty: 1, name: 'Seared Scallops', price: 42.00 },
      { qty: 1, name: 'Bottle: Dom Pérignon 2012', price: 310.00 }
    ]
  },
  {
    id: 'ticket-2',
    tableNumber: 'Table 04',
    serverName: 'Sarah J.',
    duration: '92m',
    cardAmount: 128.00,
    guests: 2,
    orderNumber: '#8450',
    taxRate: 0.085,
    gratuityRate: 0.20,
    items: [
      { qty: 1, name: 'Wagyu Burger', note: 'Medium • Add Truffle Fries', price: 38.00 },
      { qty: 1, name: 'Pan-Seared Jumbo Scallops', price: 42.00 },
      { qty: 2, name: 'Royal Gold Old Fashioned', price: 48.00 }
    ]
  },
  {
    id: 'ticket-3',
    tableNumber: 'Bar 02',
    serverName: 'Alex D.',
    duration: '15m',
    isSplit: true,
    needsPayment: true,
    cardAmount: 45.00,
    guests: 1,
    orderNumber: '#8495',
    taxRate: 0.085,
    gratuityRate: 0.20,
    items: [
      { qty: 1, name: 'Truffle Burrata Salad', price: 26.00 },
      { qty: 1, name: 'Signature Emerald Gimlet', price: 19.00 }
    ]
  }
];

export default function PosPage() {
  const [tickets, setTickets] = useState<PosTicket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('ticket-1');
  const [quickFilter, setQuickFilter] = useState<'open' | 'payment' | 'vip'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transaction processing loader state
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');
  const [taxRateDineIn, setTaxRateDineIn] = useState(0.085);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(0.085);
  const [taxRateDelivery, setTaxRateDelivery] = useState(0.085);

  // Digital Menu catalog states
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  // Checkout Customer Details, Tips, and Notes states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tipMode, setTipMode] = useState<'none' | '15' | '18' | '20' | 'custom'>('none');
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Accordion visibility states
  const [customerDetailsVisible, setCustomerDetailsVisible] = useState(false);
  const [discountSettingsVisible, setDiscountSettingsVisible] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);

  // Responsive sidebar (mobile/tablet)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Mobile panel toggle — 'list' shows the orders list, 'detail' shows ticket
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'card' | 'cash' | 'digital'>('card');

  // Split bill states for POS
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitMethod, setSplitMethod] = useState<'evenly' | 'by-item'>('evenly');
  const [splitGuestCount, setSplitGuestCount] = useState(2);
  const [splitPaidGuests, setSplitPaidGuests] = useState<number[]>([]);
  const [splitItemAssignments, setSplitItemAssignments] = useState<Record<number, number>>({});

  // Discount system
  const [discountVisible, setDiscountVisible] = useState(false);
  const [discountMode, setDiscountMode] = useState<'percent' | 'fixed' | 'promo'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ type: string; amount: number; label: string } | null>(null);

  // Operator states
  const [activeOperator, setActiveOperator] = useState<Operator>(AVAILABLE_OPERATORS[0]);
  const [operatorModalOpen, setOperatorModalOpen] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTaxType = localStorage.getItem('dinepos_tax_type');
      if (savedTaxType === 'pre-tax' || savedTaxType === 'post-tax') {
        setTaxType(savedTaxType as 'pre-tax' | 'post-tax');
      }
      const savedTaxRateDineIn = localStorage.getItem('dinepos_tax_rate_dine_in');
      const savedTaxRateTakeaway = localStorage.getItem('dinepos_tax_rate_takeaway');
      const savedTaxRateDelivery = localStorage.getItem('dinepos_tax_rate_delivery');
      if (savedTaxRateDineIn) setTaxRateDineIn(parseFloat(savedTaxRateDineIn) / 100);
      if (savedTaxRateTakeaway) setTaxRateTakeaway(parseFloat(savedTaxRateTakeaway) / 100);
      if (savedTaxRateDelivery) setTaxRateDelivery(parseFloat(savedTaxRateDelivery) / 100);

      setTickets(prev => prev.map(t => {
        if (t.tableNumber.toLowerCase().includes('takeaway')) {
          return { ...t, taxRate: savedTaxRateTakeaway ? parseFloat(savedTaxRateTakeaway) / 100 : t.taxRate };
        } else if (t.tableNumber.toLowerCase().includes('delivery')) {
          return { ...t, taxRate: savedTaxRateDelivery ? parseFloat(savedTaxRateDelivery) / 100 : t.taxRate };
        } else {
          return { ...t, taxRate: savedTaxRateDineIn ? parseFloat(savedTaxRateDineIn) / 100 : t.taxRate };
        }
      }));

      // Load digital menu items
      const defaultMenuItems = [
        { id: 'spec-1', name: 'Gold Leaf A5 Wagyu Ribeye', category: 'special', price: 185, description: '300g Japanese A5 Miyazaki Wagyu, seared over binchotan charcoal, brushed with truffle glaze, adorned with 24k gold leaf.', image: '/images/wagyu_ribeye.png', tags: ['GF', 'Non-Veg'] },
        { id: 'spec-2', name: 'Beluga Caviar & Oysters', category: 'special', price: 95, description: 'Six freshly shucked Kumamoto oysters topped with Beluga caviar, champagne mignonette, and gold flakes.', image: '/images/caviar_oysters.png', tags: ['Seafood', 'Non-Veg'] },
        { id: 'combo-1', name: 'Imperial Signature Combo', category: 'combos', price: 120, description: 'A luxurious set featuring our Wagyu Beef Tartare starter, Truffle Glazed Filet Mignon main course, and Chocolate Soufflé dessert.', image: '/images/wagyu_ribeye.png', tags: ['Non-Veg'] },
        { id: 'combo-2', name: 'Royal Vegetarian Tasting Set', category: 'combos', price: 75, description: 'A curated vegetarian experience: Truffle Burrata Salad starter, Acquerello Mushroom Risotto main, and Saffron Crème Brûlée.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] },
        { id: 'start-1', name: 'Wagyu Beef Tartare', category: 'starters', price: 38, description: 'Hand-cut A5 Wagyu, quail egg yolk, cornichons, shallots, Dijon emulsion, served with toasted brioche points.', image: '/images/wagyu_beef_tartare.png', tags: ['Non-Veg'] },
        { id: 'start-2', name: 'Truffle Burrata Salad', category: 'starters', price: 26, description: 'Creamy Italian burrata, heirloom cherry tomatoes, fresh basil, aged balsamic, shaved black winter truffle.', image: '/images/truffle_burrata_salad.png', tags: ['Veg', 'GF'] },
        { id: 'start-3', name: 'Pan-Seared Jumbo Scallops', category: 'starters', price: 42, description: 'Pan-seared jumbo scallops, sweet pea purée, crispy pancetta, meyer lemon beurre blanc.', image: '/images/pan_seared_scallops.png', tags: ['Seafood', 'Non-Veg'] },
        { id: 'main-1', name: 'Acquerello Mushroom Risotto', category: 'mains', price: 32, description: 'Acquerello carnaroli rice, foraged forest mushrooms, Parmigiano-Reggiano, fresh black truffle shavings.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] },
        { id: 'main-2', name: 'Crispy Skin Sea Bass', category: 'mains', price: 45, description: 'Crispy skin Chilean sea bass served over creamy saffron risotto, topped with microgreens and citrus beurre blanc.', image: '/images/sea_bass.png', tags: ['Seafood', 'Non-Veg'] },
        { id: 'main-3', name: 'Truffle Glazed Filet Mignon', category: 'mains', price: 58, description: '8oz USDA Prime tenderloin, truffle potato purée, glazed organic heirloom carrots, rich bone marrow reduction.', image: '/images/filet_mignon.png', tags: ['GF', 'Non-Veg'] },
        { id: 'dess-1', name: 'Chocolate Soufflé', category: 'desserts', price: 18, description: '70% Valrhona dark chocolate soufflé, Tahitian vanilla bean gelato, warm salted caramel drizzle poured tableside.', image: '/images/chocolate_souffle.png', tags: ['Veg'] },
        { id: 'dess-2', name: 'Saffron Crème Brûlée', category: 'desserts', price: 16, description: 'Silky saffron-infused custard with a perfectly caramelized sugar crust, macerated wild berries.', image: '/images/saffron_creme_brulee.png', tags: ['Veg', 'GF'] },
        { id: 'drink-1', name: 'Royal Gold Old Fashioned', category: 'drinks', price: 28, description: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips, served with a gold-leaf ice sphere.', image: '/images/old_fashioned.png', tags: ['GF'] },
        { id: 'drink-2', name: 'Signature Emerald Gimlet', category: 'drinks', price: 22, description: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence, served in a chilled crystal coupette.', image: '/images/emerald_gimlet.png', tags: ['GF', 'Veg'] }
      ];

      const savedMenu = localStorage.getItem('dinepos_menu_items');
      if (savedMenu) {
        try {
          setMenuItems(JSON.parse(savedMenu));
        } catch (e) {
          console.error('Failed to parse menu items:', e);
          setMenuItems(defaultMenuItems);
        }
      } else {
        setMenuItems(defaultMenuItems);
        localStorage.setItem('dinepos_menu_items', JSON.stringify(defaultMenuItems));
      }

      // Load digital menu categories
      const defaultCategories = [
        { id: 'special', name: 'Our Special', icon: 'auto_awesome' },
        { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' },
        { id: 'starters', name: 'Starters', icon: 'restaurant' },
        { id: 'mains', name: 'Main Course', icon: 'restaurant_menu' },
        { id: 'desserts', name: 'Desserts', icon: 'icecream' },
        { id: 'drinks', name: 'Drinks', icon: 'local_bar' }
      ];
      const savedCategories = localStorage.getItem('dinepos_menu_categories');
      if (savedCategories) {
        try {
          setCategories(JSON.parse(savedCategories));
        } catch (e) {
          console.error('Failed to parse categories:', e);
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
        localStorage.setItem('dinepos_menu_categories', JSON.stringify(defaultCategories));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOperator = localStorage.getItem('dinepos_active_operator');
      if (savedOperator) {
        try {
          setActiveOperator(JSON.parse(savedOperator));
        } catch (e) {
          console.error(e);
        }
      }

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'dinepos_active_operator' && e.newValue) {
          try {
            setActiveOperator(JSON.parse(e.newValue));
          } catch (err) {
            console.error(err);
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newOrderType = params.get('newOrder');
      if (newOrderType) {
        // Clear parameter from URL immediately
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        if (newOrderType === 'table') {
          const newId = `ticket-${Date.now()}`;
          const tableNum = Math.floor(1 + Math.random() * 20);
          const orderNum = Math.floor(1000 + Math.random() * 9000);
          const newTicket: PosTicket = {
            id: newId,
            tableNumber: `Table ${tableNum < 10 ? '0' + tableNum : tableNum}`,
            serverName: 'J. Smith',
            duration: '1m',
            needsPayment: true,
            cardAmount: 76.00,
            guests: 2,
            orderNumber: `#${orderNum}`,
            taxRate: taxRateDineIn,
            gratuityRate: 0.20,
            items: [
              { qty: 2, name: 'Truffle Risotto', price: 76.00 }
            ]
          };
          setTickets(prev => [newTicket, ...prev]);
          setSelectedTicketId(newId);
          triggerToast(`New order initialized for Table ${tableNum}!`);
        } else if (newOrderType === 'walkin') {
          const newId = `ticket-${Date.now()}`;
          const orderNum = Math.floor(1000 + Math.random() * 9000);
          const newTicket: PosTicket = {
            id: newId,
            tableNumber: 'Walk-in Takeaway',
            serverName: 'J. Smith',
            duration: '1m',
            needsPayment: true,
            cardAmount: 45.00,
            guests: 1,
            orderNumber: `#${orderNum}`,
            taxRate: taxRateTakeaway,
            gratuityRate: 0.00,
            items: [
              { qty: 1, name: 'Truffle Burrata Salad', price: 26.00 },
              { qty: 1, name: 'Signature Emerald Gimlet', price: 19.00 }
            ]
          };
          setTickets(prev => [newTicket, ...prev]);
          setSelectedTicketId(newId);
          triggerToast('Walk-in takeaway order initialized!');
        }
      }
    }
  }, [taxRateDineIn, taxRateTakeaway]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_tax_type' && e.newValue) {
        if (e.newValue === 'pre-tax' || e.newValue === 'post-tax') {
          setTaxType(e.newValue as 'pre-tax' | 'post-tax');
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
      if (e.key === 'dinepos_menu_items' && e.newValue) {
        try {
          setMenuItems(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse storage menu items:', err);
        }
      }
      if (e.key === 'dinepos_menu_categories' && e.newValue) {
        try {
          setCategories(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse storage categories:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Add item to active ticket
  const handleAddItemToTicket = (ticketId: string, item: any, note?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      
      const existingItemIdx = t.items.findIndex(
        i => i.name === item.name && (i.note || '') === (note || '')
      );
      
      let updatedItems = [...t.items];
      if (existingItemIdx > -1) {
        const existing = updatedItems[existingItemIdx];
        updatedItems[existingItemIdx] = {
          ...existing,
          qty: existing.qty + 1
        };
      } else {
        updatedItems.push({
          qty: 1,
          name: item.name,
          price: item.price,
          note: note ? note.trim() : undefined
        });
      }
      
      const sub = updatedItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
      const itemTax = taxType === 'pre-tax' ? sub * t.taxRate : sub - (sub / (1 + t.taxRate));
      const itemGrat = sub * t.gratuityRate;
      const totalAmount = taxType === 'pre-tax' ? sub + itemTax + itemGrat : sub + itemGrat;
      
      return {
        ...t,
        items: updatedItems,
        cardAmount: totalAmount
      };
    }));
    triggerToast(`Added ${item.name} to ticket.`);
  };

  // Adjust quantity of item in ticket
  const handleUpdateItemQty = (ticketId: string, itemName: string, change: number, note?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      
      const updatedItems = t.items.map(i => {
        if (i.name === itemName && (note === undefined || i.note === note)) {
          const newQty = Math.max(1, i.qty + change);
          return { ...i, qty: newQty };
        }
        return i;
      });
      
      const sub = updatedItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
      const itemTax = taxType === 'pre-tax' ? sub * t.taxRate : sub - (sub / (1 + t.taxRate));
      const itemGrat = sub * t.gratuityRate;
      const totalAmount = taxType === 'pre-tax' ? sub + itemTax + itemGrat : sub + itemGrat;
      
      return {
        ...t,
        items: updatedItems,
        cardAmount: totalAmount
      };
    }));
  };

  // Remove item from ticket
  const handleRemoveItem = (ticketId: string, itemName: string, note?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      
      const updatedItems = t.items.filter(i => !(i.name === itemName && (note === undefined || i.note === note)));
      
      const sub = updatedItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
      const itemTax = taxType === 'pre-tax' ? sub * t.taxRate : sub - (sub / (1 + t.taxRate));
      const itemGrat = sub * t.gratuityRate;
      const totalAmount = taxType === 'pre-tax' ? sub + itemTax + itemGrat : sub + itemGrat;
      
      return {
        ...t,
        items: updatedItems,
        cardAmount: totalAmount
      };
    }));
    triggerToast(`Removed ${itemName} from ticket.`);
  };

  // Find active selected ticket — may be undefined when all tickets are paid
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) ?? tickets[0];

  // Sync split states from active ticket
  useEffect(() => {
    if (selectedTicket) {
      setSplitMethod(selectedTicket.splitMethod || 'evenly');
      setSplitGuestCount(selectedTicket.splitGuestCount || selectedTicket.guests || 2);
      setSplitPaidGuests(selectedTicket.splitPaidGuests || []);
      setSplitItemAssignments(selectedTicket.splitItemAssignments || {});
    }
  }, [selectedTicketId, selectedTicket]);

  // Bill calculations — only computed when a ticket is present
  const subtotal       = selectedTicket ? selectedTicket.items.reduce((acc, item) => acc + (item.price * item.qty), 0) : 0;
  const tax            = selectedTicket ? (taxType === 'pre-tax' ? subtotal * selectedTicket.taxRate : subtotal - (subtotal / (1 + selectedTicket.taxRate))) : 0;
  const gratuity       = selectedTicket ? subtotal * selectedTicket.gratuityRate : 0;
  const discountAmount = (selectedTicket && appliedDiscount) ? appliedDiscount.amount : 0;
  const grandTotal     = selectedTicket ? Math.max(0, taxType === 'pre-tax' ? subtotal + tax + gratuity - discountAmount : subtotal + gratuity - discountAmount) : 0;

  // Tip calculation
  const tipAmount = selectedTicket ? (
    tipMode === 'none' ? 0 :
    tipMode === '15' ? subtotal * 0.15 :
    tipMode === '18' ? subtotal * 0.18 :
    tipMode === '20' ? subtotal * 0.20 :
    customTipAmount
  ) : 0;

  // Process transaction logic
  const handleProcessPayment = () => {
    if (!selectedTicket) return;
    setCustomerName('');
    setCustomerPhone('');
    setTipMode('none');
    setCustomTipAmount(0);
    setCheckoutNotes('');
    setCustomerDetailsVisible(false);
    setDiscountSettingsVisible(false);
    setTipsVisible(false);
    setNotesVisible(false);
    setCheckoutModalOpen(true);
  };

  const updateTicketSplits = (updates: {
    isSplit?: boolean;
    splitMethod?: 'evenly' | 'by-item';
    splitGuestCount?: number;
    splitPaidGuests?: number[];
    splitItemAssignments?: Record<number, number>;
  }) => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          ...updates
        };
      }
      return t;
    }));
  };

  const closeActiveTicket = (successMsg: string) => {
    setCheckoutModalOpen(false);
    setSplitModalOpen(false);
    triggerToast(successMsg);

    // Remove paid ticket and auto-select next using latest state
    setTickets(prev => {
      const remaining = prev.filter(t => t.id !== selectedTicket.id);
      if (remaining.length > 0) {
        setSelectedTicketId(remaining[0].id);
      } else {
        setSelectedTicketId('');
      }
      return remaining;
    });

    // Reset discount and custom checkout states
    setAppliedDiscount(null);
    setDiscountPercent(0);
    setDiscountFixed(0);
    setPromoCodeInput('');
    setCustomerName('');
    setCustomerPhone('');
    setTipMode('none');
    setCustomTipAmount(0);
    setCheckoutNotes('');
    setCustomerDetailsVisible(false);
    setDiscountSettingsVisible(false);
    setTipsVisible(false);
    setNotesVisible(false);

    // Reset split states
    setSplitPaidGuests([]);
    setSplitItemAssignments({});
  };

  const handleCompleteCheckout = () => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    const finalAmount = grandTotal + tipAmount;
    let paymentDetail = `Authorizing ${checkoutPaymentMethod.toUpperCase()} payment of $${finalAmount.toFixed(2)} for ${selectedTicket.tableNumber}...`;
    if (customerName.trim()) {
      paymentDetail = `[Customer: ${customerName.trim()}] ` + paymentDetail;
    }
    triggerToast(paymentDetail);
    
    setTimeout(() => {
      setIsProcessing(false);
      let successMsg = `Payment validated! ${selectedTicket.tableNumber} ticket closed.`;
      if (checkoutNotes.trim()) {
        successMsg += ` Note saved: "${checkoutNotes.trim()}"`;
      }
      closeActiveTicket(successMsg);
    }, 2000);
  };

  const handleSplitBill = () => {
    if (!selectedTicket) return;
    setCheckoutModalOpen(false);
    setSplitModalOpen(true);
  };

  const computeApplyDiscount = () => {
    if (!selectedTicket) return;
    if (discountMode === 'promo') {
      const code = promoCodeInput.toUpperCase().trim();
      const promo = VALID_PROMO_CODES[code];
      if (!promo) { triggerToast('Invalid promo code. Please try again.'); return; }
      const amount = promo.type === 'percent' ? subtotal * (promo.value / 100) : Math.min(promo.value, subtotal);
      setAppliedDiscount({ type: 'promo', amount, label: `${code} — ${promo.label}` });
      triggerToast(`Promo code "${code}" applied!`);
    } else if (discountMode === 'percent') {
      if (discountPercent <= 0 || discountPercent > 100) { triggerToast('Enter a valid percentage (1–100).'); return; }
      setAppliedDiscount({ type: 'percent', amount: subtotal * (discountPercent / 100), label: `${discountPercent}% Discount` });
      triggerToast(`${discountPercent}% discount applied.`);
    } else {
      if (discountFixed <= 0) { triggerToast('Enter a valid discount amount.'); return; }
      setAppliedDiscount({ type: 'fixed', amount: Math.min(discountFixed, subtotal), label: `$${discountFixed.toFixed(2)} Off` });
      triggerToast(`$${discountFixed.toFixed(2)} discount applied.`);
    }
    setDiscountVisible(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountPercent(0);
    setDiscountFixed(0);
    setPromoCodeInput('');
    triggerToast('Discount removed.');
  };

  // Filter listings
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.serverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      quickFilter === 'open' ? true :
      quickFilter === 'payment' ? t.needsPayment : // Needs payment flag
      quickFilter === 'vip' ? t.isVip : false;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">

      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between p-8 flex-shrink-0 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 overflow-y-auto`}>
        <div>
          {/* Brand/Console Title */}
          <div className="mb-10 select-none flex items-center">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 select-none mr-3">
              <span className="material-symbols-outlined text-[19px] font-black leading-none text-[#ffe2ab]">flatware</span>
            </div>
            <div>
              <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-[22px] tracking-wide block hover:opacity-85 transition-opacity leading-none">
                DinePosAi
              </Link>
              <span className="font-sans text-[8.5px] text-[#ffe2ab]/70 uppercase tracking-[0.2em] font-semibold mt-1 block">
                Premium Suite
              </span>
            </div>
          </div>

          {/* Order Action Buttons */}
          <div className="grid grid-cols-1 gap-2 mb-8 select-none">
            <button 
              onClick={() => {
                const newId = `ticket-${Date.now()}`;
                const tableNum = Math.floor(1 + Math.random() * 20);
                const orderNum = Math.floor(1000 + Math.random() * 9000);
                const newTicket: PosTicket = {
                  id: newId,
                  tableNumber: `Table ${tableNum < 10 ? '0' + tableNum : tableNum}`,
                  serverName: 'J. Smith',
                  duration: '1m',
                  needsPayment: true,
                  cardAmount: 76.00,
                  guests: 2,
                  orderNumber: `#${orderNum}`,
                  taxRate: taxRateDineIn,
                  gratuityRate: 0.20,
                  items: [
                    { qty: 2, name: 'Truffle Risotto', price: 76.00 }
                  ]
                };
                setTickets(prev => [newTicket, ...prev]);
                setSelectedTicketId(newId);
                triggerToast(`New order initialized for Table ${tableNum}!`);
              }}
              className="w-full py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-bold">add</span>
              New Table Order
            </button>
            <button 
              onClick={() => {
                const newId = `ticket-${Date.now()}`;
                const orderNum = Math.floor(1000 + Math.random() * 9000);
                const newTicket: PosTicket = {
                  id: newId,
                  tableNumber: 'Walk-in Takeaway',
                  serverName: 'J. Smith',
                  duration: '1m',
                  needsPayment: true,
                  cardAmount: 45.00,
                  guests: 1,
                  orderNumber: `#${orderNum}`,
                  taxRate: taxRateTakeaway,
                  gratuityRate: 0.00, // No auto-gratuity for takeaway
                  items: [
                    { qty: 1, name: 'Truffle Burrata Salad', price: 26.00 },
                    { qty: 1, name: 'Signature Emerald Gimlet', price: 19.00 }
                  ]
                };
                setTickets(prev => [newTicket, ...prev]);
                setSelectedTicketId(newId);
                triggerToast('Walk-in takeaway order initialized!');
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#ffe2ab] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-bold">shopping_bag</span>
              Walk-in Customer
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-sans">
            <div
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow select-none"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none">layers</span>
                Floor Map
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
            
            <Link
              href="/pos/history"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">receipt_long</span>
              Orders
            </Link>




            <Link
              href="/pos/analytics"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
              Analytics
            </Link>

            <Link
              href="/pos/discounts"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">sell</span>
              Discounts
            </Link>
          </nav>
        </div>

        {/* Settings & Operator avatar block */}
        <div className="border-t border-white/5 pt-6 font-sans space-y-4">
          <Link
            href="/pos/settings"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>

          <div 
            onClick={() => setOperatorModalOpen(true)}
            className="flex items-center gap-3 pt-2 cursor-pointer group hover:bg-white/5 p-2 rounded-xl transition-all"
          >
            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 group-hover:border-[#ffe2ab]/30 transition-colors">
              <img 
                src={activeOperator.avatar} 
                alt={`${activeOperator.name} avatar`}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-bold text-xs tracking-wide truncate group-hover:text-[#ffe2ab] transition-colors">{activeOperator.name}</div>
              <div className="text-[8px] text-[#ffe2ab]/70 font-bold tracking-wider uppercase mt-0.5">{activeOperator.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#11100e]">
        
        {/* Top Header */}
        <header className="h-[65px] lg:h-[90px] border-b border-white/5 flex items-center justify-between px-4 lg:px-10 flex-shrink-0 bg-[#0e0e0d] sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            {/* Hamburger — visible only on mobile/tablet */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <h2 className="font-serif text-[17px] lg:text-[20px] font-bold text-white tracking-wide leading-none">
              Active Orders
            </h2>
          </div>

          {/* Header search & profile indicators */}
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative select-none hidden sm:block">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-base">search</span>
              <input
                type="text"
                placeholder="Search tables or guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-[140px] md:w-[200px] lg:w-[210px] xl:w-[260px] transition-colors"
              />
            </div>
          </div>
        </header>

        {/* Split Screen Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Active Orders List */}
          <div className={`w-full lg:w-[320px] xl:w-[420px] border-r border-white/5 flex-col h-full bg-[#11100e]/50 flex-shrink-0 select-none ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Quick Filters toolbar */}
            <div className="p-6 pb-4 border-b border-white/5 flex gap-2 flex-shrink-0">
              <button
                onClick={() => setQuickFilter('open')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'open' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                All Open
              </button>
              <button
                onClick={() => setQuickFilter('payment')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'payment' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                Needs Payment
              </button>
              <button
                onClick={() => setQuickFilter('vip')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'vip' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                VIP
              </button>
            </div>

            {/* List of active order cards */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map(t => {
                  const isActive = t.id === selectedTicketId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTicketId(t.id); setMobileView('detail'); setAppliedDiscount(null); }}
                      className={`border rounded-2xl p-6 transition-all duration-300 cursor-pointer relative shadow-md ${isActive ? 'border-[#ffe2ab] bg-white/[0.01]' : 'border-white/5 hover:border-white/10 bg-[#161513]/40'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-white text-base">{t.tableNumber}</h4>
                          {t.isVip && (
                            <span className="bg-[#ffe2ab] text-[#402d00] font-sans font-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded select-none">
                              VIP
                            </span>
                          )}
                          {t.isSplit && (
                            <span className="bg-white/5 text-[#A69984]/60 font-sans font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 select-none">
                              Split Check
                            </span>
                          )}
                        </div>
                        <div className="font-sans font-bold text-base text-[#ffe2ab]">${t.cardAmount.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[#A69984]/65 font-medium mt-4">
                        <span>Server: {t.serverName}</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span>{t.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-[#A69984]/40 font-sans text-xs select-none">
                  No open orders matching selection filters.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Selected Order Ticket Details */}
          {selectedTicket ? (
            <div className={`flex-1 flex-col h-full bg-[#11100e] overflow-hidden min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>

              {/* Mobile back-to-orders bar */}
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="lg:hidden flex items-center gap-2 px-5 py-3.5 border-b border-white/5 w-full text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-[#ffe2ab]">arrow_back_ios</span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#ffe2ab]">All Orders</span>
              </button>

              {/* Ticket details header */}
              <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-start flex-shrink-0 select-none">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1.5 block">Current Ticket</span>
                    <h3 className="font-serif text-[32px] text-white font-bold leading-none select-text">{selectedTicket.tableNumber}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveCategory('all');
                      setMenuSearchQuery('');
                      setItemNotes({});
                      setMenuModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ml-4 mt-1.5 select-none"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">restaurant_menu</span>
                    Add Menu Item
                  </button>
                </div>
                
                <div className="text-right text-xs text-[#A69984]/70 font-semibold font-sans space-y-1">
                  <div>Guests: {selectedTicket.guests}</div>
                  <div className="select-text">Order {selectedTicket.orderNumber}</div>
                </div>
              </div>

              {/* Order items lists with headers */}
              <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-12 text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest pb-3 border-b border-white/5 select-none">
                  <div className="col-span-2 text-left">Qty</div>
                  <div className="col-span-6 text-left">Item</div>
                  <div className="col-span-3 text-right">Price</div>
                  <div className="col-span-1 text-right"></div>
                </div>

                {/* Items rows */}
                <div className="divide-y divide-white/5 flex-grow">
                  {selectedTicket.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 py-5 items-center">
                      {/* Quantity & Adjusters */}
                      <div className="col-span-2 flex items-center gap-1.5 font-sans text-sm font-bold text-[#ffe2ab]/90 select-none">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(selectedTicket.id, item.name, -1, item.note)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-4 text-center select-all">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(selectedTicket.id, item.name, 1, item.note)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Name & Note */}
                      <div className="col-span-6 text-left min-w-0 pr-2">
                        <div className="font-sans font-bold text-sm text-white truncate">{item.name}</div>
                        {item.note && (
                          <div className="font-sans text-[11px] text-[#ffe2ab]/70 font-medium mt-0.5 break-words">
                            Note: {item.note}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-3 text-right font-sans text-sm pr-2">
                        <div className="font-bold text-white/95">${item.price.toFixed(2)}</div>
                        {item.qty > 1 && (
                          <div className="text-[10px] text-[#A69984]/60 font-semibold mt-0.5">
                            Total: ${(item.price * item.qty).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Remove item */}
                      <div className="col-span-1 text-right select-none">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(selectedTicket.id, item.name, item.note)}
                          className="text-[#A69984]/40 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Calculations Card Panel */}
              <div className="p-8 border-t border-white/5 bg-[#161513]/40 flex-shrink-0 space-y-6">
                
                {/* Summary breakdowns */}
                <div className="space-y-2.5 font-sans select-none text-xs font-semibold uppercase tracking-wider text-[#A69984]/75 border-b border-white/5 pb-4">
                  <div className="flex justify-between">
                    <span>{taxType === 'post-tax' ? 'Subtotal (Tax Incl.)' : 'Subtotal'}</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{taxType === 'post-tax' ? 'Included Tax' : 'Tax'} ({(selectedTicket.taxRate * 100).toFixed(1)}%)</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gratuity (Suggested 20%)</span>
                    <span className="text-white">${gratuity.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && appliedDiscount && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[11px]">sell</span>
                        {appliedDiscount.label}
                      </span>
                      <span>−${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Grand total */}
                <div className="flex justify-between items-baseline select-none">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]">Grand Total</span>
                  <span className="font-serif text-[38px] lg:text-[42px] font-bold text-[#ffe2ab] tracking-wide leading-none select-none">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    <span className="material-symbols-outlined text-base">credit_card</span>
                    {isProcessing ? 'Processing...' : 'Process Payment'}
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center bg-[#11100e] text-[#A69984]/30 select-none">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl mb-4 font-light">receipt</span>
                <p className="font-serif text-lg text-white mb-1">No Active Ticket Selected</p>
                <p className="font-sans text-xs">Select an open table check from the orders registry.</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* OPERATOR SWITCHER MODAL */}
      {operatorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-[#121211] border border-white/10 rounded-2xl p-6 w-[360px] shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setOperatorModalOpen(false)}
              className="absolute top-4 right-4 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            
            <h3 className="font-serif text-lg font-bold text-white mb-2">Switch Operator</h3>
            <p className="text-[11px] text-[#A69984]/60 mb-5 font-medium uppercase tracking-wider">Select the active POS cashier</p>
            
            <div className="space-y-2">
              {AVAILABLE_OPERATORS.map((op) => (
                <button
                  key={op.name}
                  onClick={() => {
                    setActiveOperator(op);
                    localStorage.setItem('dinepos_active_operator', JSON.stringify(op));
                    setOperatorModalOpen(false);
                    triggerToast(`Operator switched to ${op.name}`);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                    activeOperator.name === op.name
                      ? 'bg-[#ffe2ab]/10 border-[#ffe2ab] text-white'
                      : 'bg-white/5 border-transparent hover:border-white/10 text-[#A69984] hover:text-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={op.avatar} alt={op.name} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-xs tracking-wide truncate">{op.name}</div>
                    <div className="text-[9px] text-[#ffe2ab]/70 font-semibold tracking-wider uppercase mt-0.5">{op.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASHIER CHECKOUT / PAYMENT MODAL */}
      {checkoutModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12110f] border border-[#ffe2ab]/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between select-none bg-[#0a0a09]">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Process Checkout</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  Table {selectedTicket.tableNumber} • Order {selectedTicket.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-[#A69984] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Payment Methods */}
              <div className="space-y-2.5">
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider select-none">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['card', 'cash', 'digital'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setCheckoutPaymentMethod(method)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        checkoutPaymentMethod === method
                          ? 'border-[#ffe2ab] bg-[#ffe2ab]/5 text-[#ffe2ab]'
                          : 'border-white/5 bg-[#161513]/40 text-[#A69984]/60 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl mb-1.5">
                        {method === 'card' ? 'credit_card' : method === 'cash' ? 'payments' : 'devices'}
                      </span>
                      <span className="font-sans font-bold text-[9px] uppercase tracking-wider">
                        {method === 'card' ? 'Credit / Stripe' : method === 'cash' ? 'Cash' : 'Digital Wallet'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Details Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setCustomerDetailsVisible(prev => !prev)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    customerDetailsVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">person</span>
                    <span className="font-sans font-bold text-xs text-white">Customer Details</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{customerName ? customerName : 'Not Set'}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {customerDetailsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {customerDetailsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider select-none">Customer Name</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider select-none">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. (555) 000-0000"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Discount Settings Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setDiscountSettingsVisible(prev => !prev)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    discountSettingsVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">sell</span>
                    <span className="font-sans font-bold text-xs text-white">Discount Settings</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{appliedDiscount ? appliedDiscount.label : 'No Discount'}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {discountSettingsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {discountSettingsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="flex justify-between items-center select-none font-sans">
                      <span className="font-sans font-bold text-[9.5px] uppercase tracking-wider text-[#A69984]">Discount Settings</span>
                      {appliedDiscount && (
                        <button
                          type="button"
                          onClick={handleRemoveDiscount}
                          className="text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span> Remove Discount
                        </button>
                      )}
                    </div>

                    {/* Sub-tabs for Discount Types inside modal */}
                    <div className="flex gap-1 bg-black/40 rounded-lg p-1 select-none">
                      {(['percent', 'fixed', 'promo'] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDiscountMode(mode)}
                          className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            discountMode === mode ? 'bg-white/10 text-white' : 'text-[#A69984]/50 hover:text-white'
                          }`}
                        >
                          {mode === 'percent' ? '% Rate' : mode === 'fixed' ? 'Fixed $' : 'Promo Code'}
                        </button>
                      ))}
                    </div>

                    {/* Discount input fields inside checkout modal */}
                    <div className="flex gap-2">
                      {discountMode === 'percent' && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent || ''}
                          onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                          placeholder="Enter Percentage (e.g. 15)"
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      )}
                      {discountMode === 'fixed' && (
                        <input
                          type="number"
                          min="0"
                          value={discountFixed || ''}
                          onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)}
                          placeholder="Enter Amount (e.g. 10.00)"
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      )}
                      {discountMode === 'promo' && (
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder="ENTER PROMO CODE"
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors tracking-widest font-mono"
                        />
                      )}
                      <button
                        type="button"
                        onClick={computeApplyDiscount}
                        className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Helper Promo Quick Buttons inside modal */}
                    {discountMode === 'promo' && (
                      <div className="flex flex-wrap gap-1.5 select-none">
                        {Object.keys(VALID_PROMO_CODES).slice(0, 4).map(code => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setPromoCodeInput(code)}
                            className="px-2.5 py-1 bg-white/5 border border-white/5 hover:border-[#ffe2ab]/25 rounded-lg text-[9px] font-bold tracking-wider text-[#A69984] hover:text-[#ffe2ab] cursor-pointer transition-all font-mono"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Display currently applied discount in modal */}
                    {appliedDiscount && (
                      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 animate-fade-in select-none">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-emerald-400">sell</span>
                          <span className="text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            {appliedDiscount.label}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold text-xs">
                          −${appliedDiscount.amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tip Selection Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setTipsVisible(prev => !prev)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    tipsVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">payments</span>
                    <span className="font-sans font-bold text-xs text-white">Add Tip / Gratuity</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{tipAmount > 0 ? `$${tipAmount.toFixed(2)}` : 'No Tip'}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {tipsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {tipsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="grid grid-cols-5 gap-2 select-none">
                      {(['none', '15', '18', '20', 'custom'] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setTipMode(mode)}
                          className={`py-2 rounded-xl border font-sans font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            tipMode === mode
                              ? 'border-[#ffe2ab] bg-[#ffe2ab]/5 text-[#ffe2ab]'
                              : 'border-white/5 bg-[#0e0e0d] text-[#A69984]/60 hover:text-white'
                          }`}
                        >
                          {mode === 'none' ? 'No Tip' : mode === 'custom' ? 'Custom' : `${mode}%`}
                        </button>
                      ))}
                    </div>

                    {tipMode === 'custom' && (
                      <div className="space-y-1.5 animate-fade-in font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider block select-none">Custom Tip Amount ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter tip (e.g. 5.00)"
                          value={customTipAmount || ''}
                          onChange={(e) => setCustomTipAmount(parseFloat(e.target.value) || 0)}
                          className="w-full sm:w-1/2 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Receipt / Checkout Notes Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setNotesVisible(prev => !prev)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    notesVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">sticky_note_2</span>
                    <span className="font-sans font-bold text-xs text-white">Checkout Notes / Instructions</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{checkoutNotes ? 'Note Added' : 'No Notes'}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {notesVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {notesVisible && (
                  <div className="p-5 space-y-3 animate-fade-in bg-[#12110f]/20">
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider select-none font-sans">Checkout Notes / Special Requests</label>
                    <textarea
                      rows={2}
                      placeholder="Add notes for the receipt, billing split details, or payment exceptions..."
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Order Calculations Summary */}
              <div className="bg-[#0a0a09] border border-white/5 rounded-xl p-5 space-y-3 font-sans select-none">
                <div className="flex justify-between text-xs text-[#A69984]/70">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#A69984]/70">
                  <span>Tax ({(selectedTicket.taxRate * 100).toFixed(1)}%)</span>
                  <span className="text-white font-mono">${tax.toFixed(2)}</span>
                </div>
                {gratuity > 0 && (
                  <div className="flex justify-between text-xs text-[#A69984]/70">
                    <span>Gratuity</span>
                    <span className="text-white font-mono">${gratuity.toFixed(2)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#ffe2ab]/90">
                    <span>Tip</span>
                    <span className="text-[#ffe2ab] font-mono">${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">−${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#A69984] uppercase tracking-wider">Grand Total Due</span>
                  <span className="text-2xl font-bold text-[#ffe2ab] font-serif tracking-wider">
                    ${(grandTotal + tipAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-[#0a0a09] border-t border-white/5 flex flex-wrap sm:flex-nowrap gap-3 select-none">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleSplitBill();
                  setCheckoutModalOpen(false);
                }}
                className="flex-1 py-3 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm font-bold">call_split</span>
                <span>Split Check</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteCheckout}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASHIER SPLIT CHECK CALCULATOR MODAL */}
      {splitModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12110f] border border-[#ffe2ab]/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between select-none bg-[#0a0a09]">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Split Check Calculator</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  Table {selectedTicket.tableNumber} • Invoice #DINE-{selectedTicket.orderNumber.replace('#', '')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSplitModalOpen(false)}
                className="text-[#A69984] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Split Method switcher tabs */}
            <div className="px-6 pt-5 shrink-0 select-none">
              <div className="grid grid-cols-2 bg-black/40 rounded-lg p-1">
                {(['evenly', 'by-item'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setSplitMethod(mode);
                      updateTicketSplits({ splitMethod: mode });
                    }}
                    className={`py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      splitMethod === mode ? 'bg-white/10 text-white' : 'text-[#A69984]/50 hover:text-white'
                    }`}
                  >
                    {mode === 'evenly' ? 'Split Evenly' : 'Split By Item'}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow flex flex-col min-h-0">
              
              {splitMethod === 'evenly' ? (
                <div className="space-y-6 flex-grow flex flex-col">
                  {/* Guest count selector */}
                  <div className="bg-[#161513]/40 border border-white/5 p-5 rounded-xl space-y-4 font-sans select-none shrink-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">Number of Split Parties</span>
                      <span className="text-[#ffe2ab] text-sm font-bold font-serif">{splitGuestCount} Portions</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => {
                          const val = Math.max(2, splitGuestCount - 1);
                          setSplitGuestCount(val);
                          setSplitPaidGuests(prev => prev.filter(g => g < val));
                          updateTicketSplits({ 
                            splitGuestCount: val,
                            splitPaidGuests: splitPaidGuests.filter(g => g < val)
                          });
                        }}
                        disabled={splitGuestCount <= 2}
                        className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer font-bold"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={splitGuestCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setSplitGuestCount(val);
                          setSplitPaidGuests(prev => prev.filter(g => g < val));
                          updateTicketSplits({ 
                            splitGuestCount: val,
                            splitPaidGuests: splitPaidGuests.filter(g => g < val)
                          });
                        }}
                        aria-label="Split Parties"
                        className="flex-grow accent-[#ffe2ab]"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const val = Math.min(10, splitGuestCount + 1);
                          setSplitGuestCount(val);
                          updateTicketSplits({ splitGuestCount: val });
                        }}
                        disabled={splitGuestCount >= 10}
                        className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Even portions display list */}
                  <div className="space-y-3 flex-grow overflow-y-auto">
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">Portions Breakdown</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: splitGuestCount }).map((_, idx) => {
                        const guestLetter = String.fromCharCode(65 + idx); // A, B, C...
                        const isPaid = splitPaidGuests.includes(idx);
                        const shareTotal = (grandTotal + tipAmount) / splitGuestCount;
                        return (
                          <div key={idx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#161513]/20 border-white/5 text-white'}`}>
                            <div className="font-sans">
                              <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">Guest {guestLetter}</div>
                              <div className="font-serif text-lg font-bold mt-1 text-[#ffe2ab]">${shareTotal.toFixed(2)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                let newPaid = [];
                                if (isPaid) {
                                  newPaid = splitPaidGuests.filter(g => g !== idx);
                                  setSplitPaidGuests(newPaid);
                                  triggerToast(`Guest ${guestLetter}'s payment refunded.`);
                                } else {
                                  newPaid = [...splitPaidGuests, idx];
                                  setSplitPaidGuests(newPaid);
                                  triggerToast(`Guest ${guestLetter}'s portion of $${shareTotal.toFixed(2)} paid via ${checkoutPaymentMethod.toUpperCase()}!`);
                                }
                                updateTicketSplits({ splitPaidGuests: newPaid });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${isPaid ? 'bg-emerald-500 text-[#022c22] border-emerald-500 hover:bg-emerald-600' : 'bg-transparent text-[#ffe2ab] border-[#ffe2ab]/20 hover:border-[#ffe2ab]/50 hover:bg-white/5'}`}
                            >
                              {isPaid ? '✓ Paid' : 'Pay Portion'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-grow flex flex-col min-h-0">
                  {/* Guest count selector */}
                  <div className="flex justify-between items-center bg-[#161513]/40 border border-white/5 p-4 rounded-xl font-sans select-none shrink-0">
                    <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">Split Parties</span>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => {
                          const val = Math.max(2, splitGuestCount - 1);
                          setSplitGuestCount(val);
                          setSplitPaidGuests(prev => prev.filter(g => g < val));
                          // reset item assignments for removed guest
                          const newAssignments = { ...splitItemAssignments };
                          Object.keys(newAssignments).forEach(k => {
                            if (newAssignments[Number(k)] >= val) {
                              newAssignments[Number(k)] = -1;
                            }
                          });
                          setSplitItemAssignments(newAssignments);
                          updateTicketSplits({ 
                            splitGuestCount: val,
                            splitPaidGuests: splitPaidGuests.filter(g => g < val),
                            splitItemAssignments: newAssignments
                          });
                        }}
                        disabled={splitGuestCount <= 2}
                        className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer font-bold"
                      >
                        −
                      </button>
                      <span className="text-white font-serif font-bold w-12 text-center text-sm">{splitGuestCount} Guests</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const val = Math.min(8, splitGuestCount + 1);
                          setSplitGuestCount(val);
                          updateTicketSplits({ splitGuestCount: val });
                        }}
                        disabled={splitGuestCount >= 8}
                        className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Itemized assignment list */}
                  <div className="space-y-3.5 flex-grow flex flex-col min-h-0">
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">Assign Items to Guests</span>
                    <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 flex-grow divide-y divide-white/5">
                      {selectedTicket.items.map((item, idx) => {
                        const assignedGuest = splitItemAssignments[idx] ?? -1;
                        return (
                          <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="max-w-[45%] font-sans">
                              <div className="text-xs text-white font-bold">{item.qty}x {item.name}</div>
                              <div className="text-[10px] text-[#A69984]/50 font-medium font-mono mt-0.5">${(item.price * item.qty).toFixed(2)}</div>
                            </div>
                            
                            {/* Guest selector circles */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Shared circle */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newAssignments = { ...splitItemAssignments, [idx]: -1 };
                                  setSplitItemAssignments(newAssignments);
                                  updateTicketSplits({ splitItemAssignments: newAssignments });
                                }}
                                className={`w-8 h-8 rounded-full font-bold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer ${
                                  assignedGuest === -1 
                                    ? 'bg-[#ffe2ab] text-[#402d00] shadow' 
                                    : 'bg-white/5 border border-white/5 text-[#A69984]'
                                }`}
                                title="Split evenly among all guests"
                              >
                                Shr
                              </button>
                              {/* Guest circles */}
                              {Array.from({ length: splitGuestCount }).map((_, gIdx) => {
                                const guestLetter = String.fromCharCode(65 + gIdx);
                                return (
                                  <button
                                    key={gIdx}
                                    type="button"
                                    onClick={() => {
                                      const newAssignments = { ...splitItemAssignments, [idx]: gIdx };
                                      setSplitItemAssignments(newAssignments);
                                      updateTicketSplits({ splitItemAssignments: newAssignments });
                                    }}
                                    className={`w-8 h-8 rounded-full font-bold text-[10.5px] transition-all cursor-pointer ${
                                      assignedGuest === gIdx 
                                        ? 'bg-white/10 border border-[#ffe2ab]/50 text-white' 
                                        : 'bg-transparent border border-white/5 text-[#A69984]/40 hover:text-white hover:border-white/15'
                                    }`}
                                    title={`Assign to Guest ${guestLetter}`}
                                  >
                                    {guestLetter}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calculated totals breakdown */}
                  {(() => {
                    // Calculate totals per guest dynamically
                    const totals = Array.from({ length: splitGuestCount }, () => ({ subtotal: 0, tax: 0, gratuity: 0, discount: 0, tip: 0, total: 0 }));
                    let sharedSubtotal = 0;

                    selectedTicket.items.forEach((item, itemIdx) => {
                      const assignedGuest = splitItemAssignments[itemIdx] ?? -1;
                      const itemCost = item.price * item.qty;
                      if (assignedGuest !== -1 && assignedGuest < splitGuestCount) {
                        totals[assignedGuest].subtotal += itemCost;
                      } else {
                        sharedSubtotal += itemCost;
                      }
                    });

                    // Distribute shared subtotal
                    const sharedPerGuest = sharedSubtotal / splitGuestCount;
                    totals.forEach((t, gIdx) => {
                      t.subtotal += sharedPerGuest;
                      t.tax = taxType === 'pre-tax' 
                        ? t.subtotal * selectedTicket.taxRate 
                        : t.subtotal - (t.subtotal / (1 + selectedTicket.taxRate));
                      t.gratuity = t.subtotal * selectedTicket.gratuityRate;
                      t.discount = subtotal > 0 ? (t.subtotal / subtotal) * discountAmount : 0;
                      t.tip = subtotal > 0 ? (t.subtotal / subtotal) * tipAmount : 0;
                      t.total = Math.max(0, taxType === 'pre-tax' 
                        ? t.subtotal + t.tax + t.gratuity - t.discount + t.tip
                        : t.subtotal + t.gratuity - t.discount + t.tip
                      );
                    });

                    return (
                      <div className="space-y-3 pt-2 shrink-0">
                        <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">Calculated Portions</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                          {totals.map((gTotal, gIdx) => {
                            const guestLetter = String.fromCharCode(65 + gIdx);
                            const isPaid = splitPaidGuests.includes(gIdx);
                            return (
                              <div key={gIdx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#161513]/20 border-white/5 text-white'}`}>
                                <div className="font-sans">
                                  <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">Guest {guestLetter}</div>
                                  <div className="font-serif text-lg font-bold mt-1 text-[#ffe2ab]">${gTotal.total.toFixed(2)}</div>
                                  <div className="text-[9px] text-[#A69984]/45 mt-0.5 leading-none">
                                    Sub: ${gTotal.subtotal.toFixed(2)} • Tax: ${gTotal.tax.toFixed(2)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    let newPaid = [];
                                    if (isPaid) {
                                      newPaid = splitPaidGuests.filter(g => g !== gIdx);
                                      setSplitPaidGuests(newPaid);
                                      triggerToast(`Guest ${guestLetter}'s payment refunded.`);
                                    } else {
                                      newPaid = [...splitPaidGuests, gIdx];
                                      setSplitPaidGuests(newPaid);
                                      triggerToast(`Guest ${guestLetter}'s portion of $${gTotal.total.toFixed(2)} paid via ${checkoutPaymentMethod.toUpperCase()}!`);
                                    }
                                    updateTicketSplits({ splitPaidGuests: newPaid });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${isPaid ? 'bg-emerald-500 text-[#022c22] border-emerald-500 hover:bg-emerald-600' : 'bg-transparent text-[#ffe2ab] border-[#ffe2ab]/20 hover:border-[#ffe2ab]/50 hover:bg-white/5'}`}
                                >
                                  {isPaid ? '✓ Paid' : 'Pay Portion'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-[#0a0a09] border-t border-white/5 flex items-center justify-between select-none shrink-0 font-sans mt-4">
              <div className="text-left">
                <div className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Portions Progress</div>
                <div className="text-white text-xs font-bold mt-1">
                  {splitPaidGuests.length} of {splitGuestCount} Paid 
                  {splitPaidGuests.length === splitGuestCount && <span className="text-emerald-400 ml-1.5">✓ Settled</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSplitPaidGuests([]);
                    setSplitItemAssignments({});
                    updateTicketSplits({ splitPaidGuests: [], splitItemAssignments: {} });
                    triggerToast('Splits reset.');
                  }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Reset
                </button>
                
                {splitPaidGuests.length === splitGuestCount ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProcessing(true);
                      setTimeout(() => {
                        setIsProcessing(false);
                        closeActiveTicket(`Checkout completed! Ticket for ${selectedTicket.tableNumber} fully paid via split billing.`);
                      }, 2000);
                    }}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>{isProcessing ? 'Processing...' : 'Finalize Paid Ticket'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateTicketSplits({ isSplit: true });
                      setSplitModalOpen(false);
                      triggerToast(`Saved split billing configurations for ${selectedTicket.tableNumber}.`);
                    }}
                    className="px-5 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Save & Apply Splits
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DIGITAL MENU CATALOG MODAL */}
      {menuModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12110f] border border-[#ffe2ab]/20 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in flex flex-col h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none bg-[#0a0a09]">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Digital Menu Catalog</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  Add products to {selectedTicket.tableNumber}
                </p>
              </div>
              
              {/* Search Box */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#A69984]/40 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="bg-[#161513] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 w-[180px] sm:w-[220px] transition-colors"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-6 py-3 border-b border-white/5 bg-[#0e0e0d] flex gap-2 overflow-x-auto scrollbar-none select-none shrink-0 font-sans">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#ffe2ab] text-[#402d00]'
                    : 'text-[#A69984]/80 bg-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-[#ffe2ab] text-[#402d00]'
                      : 'text-[#A69984]/80 bg-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.icon && (
                    <span className="material-symbols-outlined text-xs leading-none">{cat.icon}</span>
                  )}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Modal Body: Products Grid */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#12110f]">
              {(() => {
                const filtered = menuItems.filter(item => {
                  const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
                  const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                                       (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-[#A69984]/40 py-20 select-none">
                      <span className="material-symbols-outlined text-4xl mb-2 font-light">restaurant_menu</span>
                      <p className="text-xs">No matching menu items found.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item) => {
                      const imageSrc = item.image && item.image.startsWith('/images/')
                        ? `/images/${item.image.split('/').pop()}`
                        : item.image || '/images/placeholder.png';

                      return (
                        <div
                          key={item.id}
                          className="border border-white/5 bg-[#161513]/40 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all group"
                        >
                          <div>
                            {/* Image Header */}
                            <div className="w-full h-32 rounded-lg overflow-hidden bg-black/40 border border-white/5 relative mb-3 select-none">
                              <img
                                src={imageSrc}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';
                                }}
                              />
                              <div className="absolute top-2 right-2 flex gap-1">
                                {item.tags && item.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded select-none ${
                                      tag === 'Veg' || tag === 'GF'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <h4 className="font-serif font-bold text-sm text-white group-hover:text-[#ffe2ab] transition-colors line-clamp-1">{item.name}</h4>
                              <span className="font-sans font-bold text-sm text-[#ffe2ab] shrink-0">${item.price.toFixed(2)}</span>
                            </div>
                            
                            <p className="text-[11px] text-[#A69984]/70 line-clamp-2 mb-4 h-[32px] overflow-hidden leading-relaxed select-text">
                              {item.description || 'No description available.'}
                            </p>
                          </div>

                          {/* Notes input & add action */}
                          <div className="space-y-2.5 pt-2 border-t border-white/5">
                            <input
                              type="text"
                              placeholder="Add kitchen note (e.g. Rare, No onions)"
                              value={itemNotes[item.id] || ''}
                              onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-white/25 focus:outline-none focus:border-[#ffe2ab]/25 transition-colors"
                            />
                            
                            <button
                              type="button"
                              onClick={() => {
                                handleAddItemToTicket(selectedTicket.id, item, itemNotes[item.id]);
                                setItemNotes(prev => ({ ...prev, [item.id]: '' }));
                              }}
                              className="w-full py-2 bg-white/5 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] border border-white/10 hover:border-transparent rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">add_circle</span>
                              Add to Order
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#0a0a09] border-t border-white/5 flex justify-end select-none shrink-0">
              <button
                type="button"
                onClick={() => setMenuModalOpen(false)}
                className="px-6 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Done Adding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE TOAST FEEDBACK NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">info</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">POS Action Alert</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
