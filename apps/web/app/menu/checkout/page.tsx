'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { migrateCart } from '../cartUtils';
import { deductStockForOrder } from '../../inventoryUtils';

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

interface CartItem {
  itemId: string;
  quantity: number;
  modifiers: string[];
  course: 'starter' | 'main' | 'dessert' | 'drinks';
  notes?: string;
}

interface DisplayCartItem {
  name: string;
  quantity: number;
  price: number;
  modifiers: string[];
  course: 'starter' | 'main' | 'dessert' | 'drinks';
  notes?: string;
  details?: string[];
}

const CHECKOUT_PROMOS: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  'DINE10':  { type: 'percent', value: 10, label: '10% Off' },
  'DINE20':  { type: 'percent', value: 20, label: '20% Off' },
  'VIP50':   { type: 'fixed',   value: 50, label: '$50 Off (VIP)' },
  'HAPPY15': { type: 'percent', value: 15, label: '15% Happy Hour' },
  'CHEF25':  { type: 'percent', value: 25, label: "25% Chef's Special" },
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

export default function CheckoutPage() {
  // Guest Information state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  // Payment Selection state: 'stripe' (Self-checkout restricted to Stripe)
  const [paymentMethod, setPaymentMethod] = useState<'stripe'>('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Stripe connection states
  const [stripeLinked, setStripeLinked] = useState(false);
  const [linkedStripeAccountId, setLinkedStripeAccountId] = useState('');

  // Keypad cash amount states (starts at $1000.00 like the mockup)
  const [tenderedAmount, setTenderedAmount] = useState('1000.00');

  // Split bill states
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [splitMethod, setSplitMethod] = useState<'evenly' | 'by-item'>('evenly');
  const [splitWays, setSplitWays] = useState(2);
  const [guestCount, setGuestCount] = useState(2);
  const [itemAssignments, setItemAssignments] = useState<{ [itemIdx: number]: number }>({}); // item index to guest index (0 for Guest A, 1 for Guest B, -1 for Shared)
  const [paidGuests, setPaidGuests] = useState<number[]>([]); // which guests have paid their portion

  // Checkout flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0 = Idle, 1 = Encryption, 2 = Validation, 3 = Completed
  
  // Dynamic State
  const [cart, setCart] = useState<{ [cartKey: string]: CartItem }>({});
  const [tableNumber, setTableNumber] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);
  const [orderId, setOrderId] = useState('DP-88392');
  const [activeTicket, setActiveTicket] = useState<any>(null);

  // Toast notifications feedback
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');
  const [diningOption, setDiningOption] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [taxRateDineIn, setTaxRateDineIn] = useState(0.10);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(0.08);
  const [taxRateDelivery, setTaxRateDelivery] = useState(0.08);

  // Promo code / discount
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'percent' | 'fixed'; value: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW'>('USD');
  const [waiveGratuity, setWaiveGratuity] = useState(false);

  const formatCurrency = (val: number) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CNY: '¥',
      KRW: '₩',
      JPY: '¥'
    };
    const rateMap: Record<string, number> = {
      USD: 1,
      JPY: 150,
      EUR: 0.92,
      GBP: 0.79,
      CNY: 7.24,
      KRW: 1340
    };
    const symbol = symbolMap[currency] || '$';
    const rate = rateMap[currency] || 1;
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [exclusionsConfig, setExclusionsConfig] = useState({
    maxPrice: 40,
    excludedTags: ['Seafood'],
    showAIConcierge: true,
    enableSelfCheckout: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTaxType = localStorage.getItem('dinepos_tax_type');
      if (savedTaxType === 'pre-tax' || savedTaxType === 'post-tax') {
        setTaxType(savedTaxType as 'pre-tax' | 'post-tax');
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
      const savedCurrency = localStorage.getItem('dinepos_currency');
      if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW'].includes(savedCurrency || '')) {
        setCurrency(savedCurrency as any);
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

      // Check Stripe Account connection details
      const activeEmail = localStorage.getItem('dinepos_logged_in_email') || 'admin@dinepos.ai';
      const connectionsStr = localStorage.getItem('dinepos_stripe_connections');
      if (connectionsStr) {
        try {
          const connections = JSON.parse(connectionsStr);
          if (connections[activeEmail] && connections[activeEmail].stripeAccountId) {
            setStripeLinked(true);
            setLinkedStripeAccountId(connections[activeEmail].stripeAccountId);
          } else {
            setStripeLinked(false);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback for default demo config if nothing is stored in localStorage yet
        if (activeEmail === 'admin@dinepos.ai') {
          setStripeLinked(true);
          setLinkedStripeAccountId('acct_1x9u82HfdK72');
        }
      }
    }
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
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
      if (e.key === 'dinepos_tax_type' && e.newValue) {
        if (e.newValue === 'pre-tax' || e.newValue === 'post-tax') {
          setTaxType(e.newValue as 'pre-tax' | 'post-tax');
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
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // migrateCart helper is imported from cartUtils

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
          setOrderId(matched.id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    let loadedCart = {};
    const savedCart = localStorage.getItem('dinepos_cart');
    if (savedCart) {
      loadedCart = migrateCart(savedCart);
    }
    
    if (Object.keys(loadedCart).length === 0) {
      const savedPlacedOrder = localStorage.getItem('dinepos_placed_order');
      if (savedPlacedOrder) {
        loadedCart = migrateCart(savedPlacedOrder);
      }
    }
    
    setCart(loadedCart);

    const savedTable = localStorage.getItem('dinepos_table_number');
    if (savedTable && !activeTicketId) {
      setTableNumber(parseInt(savedTable, 10) || 12);
    }

    // Load dynamic menu items registry from localStorage
    const savedMenu = localStorage.getItem('dinepos_menu_items');
    if (savedMenu) {
      try {
        const parsed = JSON.parse(savedMenu);
        parsed.forEach((item: any) => {
          menuItemsRegistry[item.id] = {
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description
          };
        });
      } catch (e) {
        console.error('Failed to parse dynamic menu registry:', e);
      }
    }

    // Load persistent Split Bill states
    const savedAssignments = localStorage.getItem('dinepos_split_item_assignments');
    if (savedAssignments) {
      try {
        setItemAssignments(JSON.parse(savedAssignments));
      } catch (e) {}
    }
    const savedPaid = localStorage.getItem('dinepos_split_paid_guests');
    if (savedPaid) {
      try {
        setPaidGuests(JSON.parse(savedPaid));
      } catch (e) {}
    }
    const savedGuestCount = localStorage.getItem('dinepos_split_guest_count');
    if (savedGuestCount) {
      setGuestCount(parseInt(savedGuestCount, 10) || 2);
    }
    const savedMethod = localStorage.getItem('dinepos_split_method') as 'evenly' | 'by-item' | null;
    if (savedMethod) {
      setSplitMethod(savedMethod);
    }

    // Load dynamic order ID or generate one
    if (!activeTicketId) {
      let savedOrderId = localStorage.getItem('dinepos_order_id');
      if (!savedOrderId) {
        savedOrderId = `DP-${Math.floor(10000 + Math.random() * 90000)}`;
        localStorage.setItem('dinepos_order_id', savedOrderId);
      }
      setOrderId(savedOrderId);
    }

    setIsLoaded(true);
  }, []);

  // Save Split Bill states to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dinepos_split_item_assignments', JSON.stringify(itemAssignments));
    }
  }, [itemAssignments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dinepos_split_paid_guests', JSON.stringify(paidGuests));
    }
  }, [paidGuests, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dinepos_split_guest_count', guestCount.toString());
    }
  }, [guestCount, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dinepos_split_method', splitMethod);
    }
  }, [splitMethod, isLoaded]);

  const isCartEmpty = !isLoaded || (Object.keys(cart).length === 0 && !activeTicket);

  // Render items based on cart
  const getDisplayItems = (): DisplayCartItem[] => {
    if (activeTicket) {
      return activeTicket.items.map((item: any) => {
        let details = [`Course: ${(item.course || 'main').toUpperCase()}`];
        if (item.options && item.options.length > 0) {
          details.unshift(item.options.map((o: any) => o.text).join(', '));
        }
        return {
          name: item.name,
          quantity: item.qty,
          price: getItemPrice(item) * item.qty,
          modifiers: item.options ? item.options.map((o: any) => o.text) : [],
          course: item.course || 'main',
          notes: item.note,
          details: details
        };
      });
    }

    if (isCartEmpty) {
      return [];
    }
    
    return Object.entries(cart).map(([key, cartItem]) => {
      const item = menuItemsRegistry[cartItem.itemId];
      
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
      const singlePrice = (item ? item.price : 0) + modifierExtra;

      return {
        name: item ? item.name : 'Unknown Item',
        quantity: cartItem.quantity,
        price: singlePrice * cartItem.quantity,
        modifiers: cartItem.modifiers,
        course: cartItem.course,
        notes: cartItem.notes,
        details: item ? [
          ...(cartItem.modifiers.length > 0 ? [cartItem.modifiers.join(', ')] : []),
          `Course: ${cartItem.course.toUpperCase()}`
        ] : []
      };
    });
  };

  // Calculations
  const subtotal = getDisplayItems().reduce((acc, item) => acc + item.price, 0);
  const taxRate = (activeTicket && typeof activeTicket.taxRate === 'number' && !isNaN(activeTicket.taxRate))
    ? activeTicket.taxRate
    : (diningOption === 'takeaway'
      ? taxRateTakeaway
      : diningOption === 'delivery'
        ? taxRateDelivery
        : taxRateDineIn);
  const tax = taxType === 'pre-tax'
    ? subtotal * taxRate
    : subtotal - (subtotal / (1 + taxRate));
  const autoGratuityRate = waiveGratuity ? 0.00 : (currency === 'JPY' ? 0.00 : (activeTicket ? (activeTicket.gratuityRate !== undefined && activeTicket.gratuityRate !== null ? activeTicket.gratuityRate : 0.20) : 0.20));
  const autoGratuity = subtotal * autoGratuityRate;
  
  // Read cashier-applied discount from activeTicket if present
  const cashierDiscountAmount = (activeTicket && activeTicket.appliedDiscount) ? activeTicket.appliedDiscount.amount : 0;

  const promoDiscountAmount = cashierDiscountAmount > 0
    ? cashierDiscountAmount
    : (appliedPromo
      ? (appliedPromo.type === 'percent'
        ? subtotal * (appliedPromo.value / 100)
        : Math.min(appliedPromo.value, subtotal))
      : 0);
  const total = taxType === 'pre-tax'
    ? Math.max(0, subtotal + tax + autoGratuity - promoDiscountAmount)
    : Math.max(0, subtotal + autoGratuity - promoDiscountAmount);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const promo = CHECKOUT_PROMOS[code];
    if (!promo) {
      setPromoError('Invalid code. Try: DINE10, VIP50, HAPPY15');
      return;
    }
    setAppliedPromo({ code, ...promo });
    setPromoError('');
    triggerToast(`Promo "${code}" applied — ${promo.label}`, 'success');
  };

  // Dynamic guest totals calculation for Split By Item
  const guestTotals = useMemo(() => {
    const totals = Array.from({ length: guestCount }, () => ({ subtotal: 0, tax: 0, gratuity: 0, total: 0 }));
    let sharedSubtotal = 0;

    getDisplayItems().forEach((item, itemIdx) => {
      const assignedGuest = itemAssignments[itemIdx]; // 0 for Guest A, 1 for Guest B, -1 for Shared
      if (assignedGuest !== undefined && assignedGuest !== -1 && assignedGuest < guestCount) {
        totals[assignedGuest].subtotal += item.price;
      } else {
        sharedSubtotal += item.price;
      }
    });

    // Distribute shared subtotal
    const sharedPerGuest = sharedSubtotal / guestCount;
    totals.forEach(t => {
      t.subtotal += sharedPerGuest;
      t.tax = taxType === 'pre-tax' 
        ? t.subtotal * taxRate 
        : t.subtotal - (t.subtotal / (1 + taxRate));
      t.gratuity = t.subtotal * autoGratuityRate;
      t.total = taxType === 'pre-tax' 
        ? t.subtotal + t.tax + t.gratuity 
        : t.subtotal + t.gratuity;
    });

    return totals;
  }, [guestCount, itemAssignments, getDisplayItems, taxRate, autoGratuityRate, taxType]);

  const displayTableNumber = isLoaded ? tableNumber : 12;

  // Keypad numeric presses handler
  const handleKeypress = (key: string) => {
    if (key === 'CLEAR') {
      setTenderedAmount('0.00');
      return;
    }
    if (key === 'backspace') {
      const clean = tenderedAmount.replace('.', '');
      const removed = clean.slice(0, -1);
      if (removed.length === 0) {
        setTenderedAmount('0.00');
      } else {
        const val = parseInt(removed, 10);
        setTenderedAmount((val / 100).toFixed(2));
      }
      return;
    }
    // Numeric digit key
    const clean = tenderedAmount.replace('.', '');
    if (clean.length >= 8) return; // Limit total input size
    const newVal = clean === '000' ? key : clean + key;
    const val = parseInt(newVal, 10);
    setTenderedAmount((val / 100).toFixed(2));
  };

  // Dynamic quick cash options matching total range
  const baseOption = Math.ceil(total / 100) * 100;
  const quickCashOptions = [
    { label: 'Exact Due', value: total },
    { label: `$${baseOption.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, value: baseOption },
    { label: `$${(baseOption + 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`, value: baseOption + 100 },
    { label: `$${(baseOption + 200).toLocaleString(undefined, { minimumFractionDigits: 0 })}`, value: baseOption + 200 }
  ];

  // Change calculations
  const parsedTendered = parseFloat(tenderedAmount) || 0;
  const changeDue = Math.max(0, parsedTendered - total);

  const handleConfirmAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      triggerToast('Please enter your First Name.', 'info');
      return;
    }
    if (!lastName.trim()) {
      triggerToast('Please enter your Last Name.', 'info');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      triggerToast('Please enter a valid Email Address.', 'info');
      return;
    }
    if (diningOption === 'delivery') {
      if (!contactNumber.trim()) {
        triggerToast('Please enter your Contact Number.', 'info');
        return;
      }
      if (!deliveryLocation.trim()) {
        triggerToast('Please enter your Delivery Location.', 'info');
        return;
      }
    }
    if (!stripeLinked) {
      triggerToast('Stripe payment integration is not configured. Unable to pay.', 'info');
      return;
    }
    const rawNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(rawNumber)) {
      triggerToast('Enter a valid 16-digit card number.', 'info'); return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      triggerToast('Enter expiry in MM/YY format.', 'info'); return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      triggerToast('Enter a valid CVC (3–4 digits).', 'info'); return;
    }
    if (!cardName.trim()) {
      triggerToast('Enter the name on the card.', 'info'); return;
    }
    setIsProcessing(true);
    setProcessingStep(1);
    
    // Simulate high-end financial transaction pipeline
    setTimeout(() => {
      setProcessingStep(2);
      setTimeout(() => {
        setProcessingStep(3);
        
        // Update shared ticket payment status
        const existingSharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
        let sharedTickets = [];
        if (existingSharedTicketsStr) {
          try {
            sharedTickets = JSON.parse(existingSharedTicketsStr);
          } catch (err) {}
        }
        
        sharedTickets = sharedTickets.map((t: any) => {
          if (t.id === orderId) {
            return {
              ...t,
              status: 'complete',
              paymentStatus: 'paid'
            };
          }
          return t;
        });
        localStorage.setItem('dinepos_shared_tickets', JSON.stringify(sharedTickets));

        // Create transaction record and push to dinepos_pos_transactions
        const transactionId = `tx-${Math.floor(100000 + Math.random() * 900000)}`;
        const dateObj = new Date();
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
        const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        
        const newTx = {
          id: transactionId,
          orderId: `#ORD-${orderId.replace('DP-', '')}`,
          date: dateObj.toLocaleDateString('en-US', dateOptions),
          time: dateObj.toLocaleTimeString('en-US', timeOptions),
          tableType: 'table' as const,
          tableLabel: `Tbl ${tableNumber.toString().padStart(2, '0')}`,
          server: activeTicket ? activeTicket.serverName : 'Self Service',
          amount: total,
          paymentMethod: 'Stripe Card',
          paymentType: 'card' as const,
          paymentDetails: `•••• ${cardNumber.replace(/\s/g, '').slice(-4) || '4242'}`,
          paymentIcon: 'credit_card'
        };

        const existingTxStr = localStorage.getItem('dinepos_pos_transactions');
        let txList = [];
        if (existingTxStr) {
          try {
            txList = JSON.parse(existingTxStr);
          } catch (err) {}
        }
        txList.unshift(newTx);
        localStorage.setItem('dinepos_pos_transactions', JSON.stringify(txList));

        // Deduct ingredient stock from inventory based on cart items
        const itemsToDeduct = Object.values(cart).map(cartItem => {
          const item = menuItemsRegistry[cartItem.itemId];
          return { name: item ? item.name : '', qty: cartItem.quantity };
        }).filter(x => x.name !== '');
        deductStockForOrder(itemsToDeduct);

        // Clean up cart and placed order upon successful payment validation
        localStorage.removeItem('dinepos_cart');
        localStorage.removeItem('dinepos_placed_order');
        localStorage.removeItem('dinepos_split_item_assignments');
        localStorage.removeItem('dinepos_split_paid_guests');
        localStorage.removeItem('dinepos_active_ticket_id');
      }, 1200);
    }, 1000);
  };

  if (isLoaded && activeTicket && activeTicket.paymentStatus === 'paid') {
    return (
      <div className="min-h-screen bg-[#0e0e0d] text-[#e5e2e1] font-sans flex flex-col items-center justify-center p-8 select-none">
        <div className="bg-[#161513] border border-[#ffe2ab]/20 rounded-2xl max-w-md w-full p-8 text-center shadow-[0_0_50px_rgba(255,226,171,0.15)] space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <span className="material-symbols-outlined text-3xl font-black">check_circle</span>
          </div>
          <h2 className="font-serif text-2xl text-white font-medium">Order Already Settled</h2>
          <p className="text-xs text-[#A69984]/80 leading-relaxed">
            This bill has been paid and settled. Thank you for dining with us!
          </p>
          <Link
            href="/menu"
            className="inline-block px-8 py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(255,226,171,0.1)]"
          >
            Return to Table
          </Link>
        </div>
      </div>
    );
  }

  if (isLoaded && !exclusionsConfig.enableSelfCheckout) {
    return (
      <div className="min-h-screen bg-[#0e0e0d] text-[#e5e2e1] font-sans flex flex-col items-center justify-center p-8 select-none">
        <div className="bg-[#161513] border border-[#ffe2ab]/20 rounded-2xl max-w-md w-full p-8 text-center shadow-[0_0_50px_rgba(255,226,171,0.15)] space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <span className="material-symbols-outlined text-3xl font-black">lock</span>
          </div>
          <h2 className="font-serif text-2xl text-white font-medium">Self-Checkout Disabled</h2>
          <p className="text-xs text-[#A69984]/80 leading-relaxed">
            The administrator has disabled direct customer self-checkout. Please request assistance from your server to settle the bill.
          </p>
          <Link
            href="/menu"
            className="inline-block px-8 py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(255,226,171,0.1)]"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen lg:overflow-hidden overflow-y-auto bg-[#0e0e0d] text-[#e5e2e1] font-sans antialiased select-none flex flex-col justify-between">
      
      <div className="flex-grow flex flex-col lg:flex-row w-full lg:h-full min-h-0">
        
        {/* LEFT COLUMN: ORDER DETAIL SIDEBAR (Span 4) */}
        <aside className="w-full lg:w-[380px] bg-[#0a0a09] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between p-6 sm:p-8 flex-shrink-0 z-10 lg:h-screen lg:overflow-y-auto">
          {isCartEmpty ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-20 space-y-4">
              <span className="material-symbols-outlined text-5xl text-[#A69984]/30 animate-pulse">shopping_basket</span>
              <p className="font-serif text-white font-medium text-lg">No active selections</p>
              <p className="font-sans text-xs text-[#A69984]/60">Select items from the digital menu to checkout.</p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {/* Header: Order metadata */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-serif text-[28px] font-bold text-white tracking-wide leading-tight">
                      Order #{orderId.replace('DP-', '')}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#ffe2ab]/80 font-bold uppercase tracking-wider mt-2 select-none">
                      <span className="material-symbols-outlined text-[15px] font-bold">restaurant</span>
                      Table {displayTableNumber} • 2 Guests
                    </div>
                  </div>
                </div>

                {/* Dotted border line */}
                <div className="border-t border-dashed border-white/10 pt-4"></div>

                {/* Itemized Order list */}
                <div className="space-y-6 max-h-[360px] overflow-y-auto pr-2">
                  {(['starter', 'main', 'dessert', 'drinks'] as const).map(courseKey => {
                    const courseItems = getDisplayItems().filter(item => item.course === courseKey);
                    if (courseItems.length === 0) return null;
                    const courseName = courseKey === 'starter' ? 'Starters' : courseKey === 'main' ? 'Mains' : courseKey === 'dessert' ? 'Desserts' : 'Drinks';
                    
                    return (
                      <div key={courseKey} className="space-y-3">
                        <div className="text-[9px] text-[#ffe2ab]/75 font-extrabold uppercase tracking-[0.2em] border-b border-white/5 pb-1 select-none">
                          {courseName}
                        </div>
                        <div className="space-y-4 pl-1">
                          {courseItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start font-sans select-none animate-fade-in">
                              <div className="max-w-[75%] space-y-1">
                                <div className="text-white font-bold text-xs tracking-wide">
                                  <span className="text-[#ffe2ab] font-extrabold mr-2">{item.quantity}x</span>
                                  {item.name}
                                </div>
                                {item.modifiers.length > 0 && (
                                  <div className="text-[10px] text-[#A69984]/50 font-semibold tracking-wide leading-relaxed pl-4 italic">
                                    {item.modifiers.join(', ')}
                                  </div>
                                )}
                                {item.notes && (
                                  <div className="text-[10px] text-[#A69984]/70 font-sans tracking-wide leading-relaxed pl-4 flex items-start gap-1">
                                    <span className="material-symbols-outlined text-[12px] text-[#ffe2ab]/80 shrink-0 select-none">edit_note</span>
                                    <span className="italic">"{item.notes}"</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-white/90 text-xs font-bold font-mono tracking-wider shrink-0">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Calculations block */}
              <div className="border-t border-dashed border-white/10 pt-6 mt-8 space-y-5 font-sans">
                <div className="space-y-2.5 text-xs text-[#A69984]/70">
                  <div className="flex justify-between items-center">
                    <span>{taxType === 'post-tax' ? 'Subtotal (Tax Incl.)' : 'Subtotal'}</span>
                    <span className="text-white/80 font-bold font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{taxType === 'post-tax' ? 'Included Tax' : 'Tax'} ({(taxRate * 100).toFixed(1)}%)</span>
                    <span className="text-white/80 font-bold font-mono">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>Auto-Gratuity ({Math.round(autoGratuityRate * 100)}%)</span>
                      {autoGratuityRate > 0 ? (
                        <button
                          type="button"
                          onClick={() => setWaiveGratuity(true)}
                          className="text-[#ffe2ab]/55 hover:text-rose-400 font-sans text-[9px] font-bold uppercase tracking-wider underline cursor-pointer border-none bg-transparent p-0"
                        >
                          Waive
                        </button>
                      ) : (
                        (currency !== 'JPY' || (activeTicket && activeTicket.gratuityRate > 0)) && waiveGratuity && (
                          <button
                            type="button"
                            onClick={() => setWaiveGratuity(false)}
                            className="text-emerald-400 hover:text-emerald-355 font-sans text-[9px] font-bold uppercase tracking-wider underline cursor-pointer border-none bg-transparent p-0"
                          >
                            Add back
                          </button>
                        )
                      )}
                    </span>
                    <span className="text-white/80 font-bold font-mono">{formatCurrency(autoGratuity)}</span>
                  </div>
                  {promoDiscountAmount > 0 && appliedPromo && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">sell</span>
                        {appliedPromo.code} ({appliedPromo.label})
                      </span>
                      <span className="font-bold font-mono">−{formatCurrency(promoDiscountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Promo code input */}
                {!appliedPromo ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="PROMO CODE"
                        className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors font-mono tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ffe2ab]/30 text-[#ffe2ab] rounded-xl font-bold text-[9px] uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-rose-400 text-[9px] font-bold pl-1">{promoError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-400">sell</span>
                      <span className="text-emerald-400 font-bold text-[9.5px] uppercase tracking-wider">{appliedPromo.code} — {appliedPromo.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                      className="text-emerald-400/50 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                {/* Dotted split */}
                <div className="border-t border-dashed border-white/5 pt-2"></div>

                {/* Total Due */}
                <div className="flex justify-between items-baseline select-none">
                  <span className="text-xs text-[#A69984] font-bold uppercase tracking-wider">TOTAL DUE</span>
                  <span className="text-[30px] font-bold text-[#ffe2ab] font-serif tracking-wider">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* RIGHT COLUMN: PAYMENT INTERFACE (Span 8) */}
        <main className="flex-grow flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative bg-[#0e0e0d] min-w-0 lg:h-screen lg:overflow-y-auto">
          <div>
            {/* Top Toolbar Navigation */}
            <div className="max-w-4xl mx-auto w-full flex justify-between items-center select-none mb-8">
              <Link 
                href="/menu" 
                className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#ffe2ab] hover:text-[#ffdca0] transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Table
              </Link>
            </div>

            {isCartEmpty ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6 max-w-md mx-auto">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#ffe2ab]/70">
                  <span className="material-symbols-outlined text-4xl">shopping_cart_checkout</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-white font-medium">Your Table Basket is Empty</h3>
                  <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed">
                    We couldn't find any pending or placed items for Table {displayTableNumber}. Please return to the digital menu to add delicious delicacies.
                  </p>
                </div>
                <Link 
                  href="/menu"
                  className="px-8 py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.15)] inline-flex items-center gap-2 hover:scale-[1.01] cursor-pointer"
>
                  <span className="material-symbols-outlined text-sm font-bold">restaurant_menu</span>
                  Go to Digital Menu
                </Link>
              </div>
            ) : (
              <>
                {/* Guest Information Section */}
                <div className="max-w-2xl mx-auto w-full bg-[#161513] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4 font-sans select-none mb-8">
                  <h3 className="font-serif text-sm text-[#ffe2ab] uppercase font-bold tracking-wider">Guest Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-sans"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-sans"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-sans"
                        placeholder="e.g. name@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Special Requests</label>
                      <input 
                        type="text" 
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-sans"
                        placeholder="e.g. Allergy details"
                      />
                    </div>
                  </div>
                  {diningOption === 'delivery' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5 animate-fade-in">
                      <div>
                        <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Contact Number *</label>
                        <input 
                          type="tel" 
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-sans"
                          placeholder="e.g. +81 90 1234 5678"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Delivery Location *</label>
                        <input 
                          type="text" 
                          value={deliveryLocation}
                          onChange={(e) => setDeliveryLocation(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-sans"
                          placeholder="e.g. 1-chome Shibuya, Tokyo"
                        />
                      </div>
                    </div>
                  )}
                      {/* Secure Checkout Badge */}
                <div className="bg-[#12110f]/60 border border-white/5 rounded-2xl p-4 max-w-xl mx-auto mb-6 lg:mb-10 flex items-center justify-between font-sans select-none">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${stripeLinked ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    <div>
                      <span className="text-[10.5px] font-bold text-white uppercase tracking-widest block">Secure Payment Gateway</span>
                      <span className="text-[9.5px] text-[#A69984]/60 font-semibold block mt-0.5">
                        {stripeLinked ? 'Encrypted transactions routed via Stripe' : 'Stripe payment integration not configured'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#635bff]/10 border border-[#635bff]/25 rounded-lg text-[#ffe2ab] text-[10px] font-mono font-bold">
                    <svg className="w-3.5 h-3.5 fill-[#635bff]" viewBox="0 0 24 24">
                      <path d="M13.962 7.437c-1.3-.122-2.186.438-2.186 1.488 0 1.944 2.84 1.547 2.84 3.738 0 1.258-1.077 1.93-2.615 1.93a4.2 4.2 0 01-2.296-.642l.334-1.63a3.543 3.543 0 001.9.54c.767 0 1.15-.29 1.15-.756 0-1.928-2.844-1.489-2.844-3.69 0-1.282.969-1.948 2.502-1.948a3.914 3.914 0 011.966.495l-.337 1.63a3.023 3.023 0 00-1.665-.455zM4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
                    </svg>
                    {stripeLinked ? (linkedStripeAccountId ? linkedStripeAccountId.slice(0,12)+'...' : 'Stripe Active') : 'Stripe'}
                  </div>
                </div>

                {/* Dynamic Payment Tab content panes */}
                <div className="max-w-4xl mx-auto w-full">
                  {!stripeLinked ? (
                    <div className="max-w-xl mx-auto w-full">
                      <div className="bg-[#161513]/90 border border-rose-500/20 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6 select-none animate-fade-in duration-300 min-h-[280px]">
                        <div className="w-14 h-14 rounded-full bg-rose-500/5 border border-rose-500/20 flex items-center justify-center text-rose-400">
                          <span className="material-symbols-outlined text-3xl">error</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-serif text-lg text-white font-medium tracking-wide">Checkout Temporarily Unavailable</h4>
                          <p className="text-[#A69984]/70 font-sans text-xs mt-2 leading-relaxed max-w-md mx-auto">
                            Customer self-checkout is restricted to card payments via Stripe. Currently, this restaurant does not have a linked Stripe merchant account connected.
                          </p>
                        </div>
                        <div className="px-4 py-2.5 bg-rose-950/20 border border-rose-500/15 rounded-lg text-rose-300 text-[10.5px] font-sans font-semibold">
                          Please contact restaurant staff to configure Stripe in the admin console.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xl mx-auto w-full space-y-6">
                      {/* Premium Interactive Card Preview */}
                      <div className="relative w-full h-[180px] rounded-2xl bg-gradient-to-tr from-[#14120f] via-[#221f1a] to-[#14120f] border border-[#ffe2ab]/20 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden select-none">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ffe2ab]/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-[#ffe2ab] tracking-[0.2em] font-sans">Aura Signature (Stripe)</span>
                            <h4 className="font-serif text-xs text-white/50 tracking-wider uppercase">Table {displayTableNumber}</h4>
                          </div>
                          {/* Card Chip */}
                          <div className="w-9 h-7 rounded-md bg-gradient-to-r from-amber-400/80 to-[#ffe2ab] border border-amber-300/30 flex flex-col justify-around p-1 shadow-inner">
                            <div className="h-[1px] bg-black/20 w-full"></div>
                            <div className="h-[1px] bg-black/20 w-full"></div>
                            <div className="h-[1px] bg-black/20 w-full"></div>
                          </div>
                        </div>

                        {/* Card Number */}
                        <div className="font-mono text-white text-base tracking-[0.18em] my-4 drop-shadow-md select-text">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[7.5px] uppercase font-bold text-[#A69984]/40 tracking-wider block font-sans">Cardholder</span>
                            <div className="font-sans text-[10.5px] text-white/90 font-bold uppercase tracking-wider truncate max-w-[180px]">
                              {cardName || 'Alexander Sterling'}
                            </div>
                          </div>
                          <div>
                            <span className="text-[7.5px] uppercase font-bold text-[#A69984]/40 tracking-wider block font-sans">Expires</span>
                            <div className="font-mono text-[10.5px] text-white font-bold tracking-wider">
                              {expiry || 'MM/YY'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs Form */}
                      <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4 font-sans select-none">
                        <div>
                          <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Card Number</label>
                          <div className="relative">
                            <svg className="absolute left-4 top-3 w-4 h-4 text-[#A69984]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x={2} y={5} width={20} height={14} rx={2} />
                              <line x1={2} y1={10} x2={22} y2={10} />
                            </svg>
                            <input 
                              type="text" 
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                let matches = val.match(/\d{4,16}/g);
                                let match = matches && matches[0] || '';
                                let parts = [];
                                for (let i=0, len=match.length; i<len; i+=4) {
                                  parts.push(match.substring(i, i+4));
                                }
                                if (parts.length > 0) {
                                  setCardNumber(parts.join(' '));
                                } else {
                                  setCardNumber(val);
                                }
                              }}
                              placeholder="0000 0000 0000 0000"
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono tracking-widest"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Expiry</label>
                            <input 
                              type="text" 
                              maxLength={5}
                              value={expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) {
                                  setExpiry(val.slice(0, 2) + '/' + val.slice(2, 4));
                                } else {
                                  setExpiry(val);
                                }
                              }}
                              placeholder="MM/YY"
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono tracking-wider"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">CVC</label>
                            <input 
                              type="password" 
                              maxLength={4}
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                              placeholder="•••"
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono tracking-widest"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Cardholder Name</label>
                          <input 
                            type="text" 
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium uppercase font-sans tracking-wide"
                            placeholder="ALEXANDER STERLING"
                          />
                        </div>
                      </div>

                      {/* Promo Code Input Block inside Main Payment column */}
                      <div className="bg-[#161513]/80 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4 font-sans select-none">
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif text-[13px] text-[#ffe2ab] uppercase font-bold tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">sell</span>
                            Promo Code / Discount
                          </h4>
                          {appliedPromo && (
                            <button
                              type="button"
                              onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                              className="text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">close</span> Remove
                            </button>
                          )}
                        </div>

                        {!appliedPromo ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={promoInput}
                                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                placeholder="ENTER PROMO CODE (e.g. DINE10, VIP50)"
                                className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-mono tracking-widest"
                              />
                              <button
                                type="button"
                                onClick={handleApplyPromo}
                                className="px-5 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Apply
                              </button>
                            </div>
                            {promoError && (
                              <p className="text-rose-400 text-[10px] font-semibold pl-1">{promoError}</p>
                            )}
                            {/* Promo Code suggestions/tips */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {Object.keys(CHECKOUT_PROMOS).slice(0, 4).map(code => (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => { setPromoInput(code); setPromoError(''); }}
                                  className="px-2.5 py-1 bg-white/5 border border-white/5 hover:border-[#ffe2ab]/25 rounded-lg text-[9px] font-bold tracking-wider text-[#A69984] hover:text-[#ffe2ab] cursor-pointer transition-all font-mono"
                                >
                                  {code}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3.5 animate-fade-in">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                              <div>
                                <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider block">
                                  Promo applied: {appliedPromo.code}
                                </span>
                                <span className="text-[9.5px] text-[#A69984]/70 font-semibold block mt-0.5">
                                  {appliedPromo.label}
                                </span>
                              </div>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold text-sm">
                              −{formatCurrency(promoDiscountAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div></div>
              </>
            )}
          </div>

          {/* Footer Action buttons row */}
          {!isCartEmpty && (
            <div className="max-w-4xl mx-auto w-full flex justify-end items-center gap-6 mt-12 border-t border-white/5 pt-8 select-none font-sans">
              <Link 
                href="/menu"
                className="text-[#A69984] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </Link>

              <button 
                onClick={handleConfirmAndPay}
                disabled={isProcessing || !stripeLinked}
                className="px-8 py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 disabled:cursor-not-allowed text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all duration-300 shadow-[0_4px_24px_rgba(255,226,171,0.15)] hover:scale-[1.01] cursor-pointer"
              >
                Confirm & Pay
                <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          )}
        </main>

      </div>

      {/* SPLIT BILL CALCULATION MODAL */}
      {isSplitOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#161513] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-serif text-xl text-white font-medium">Split Bill Calculator</h3>
                <p className="text-[10px] text-[#A69984]/50 font-sans font-bold uppercase tracking-wider mt-1">Table {displayTableNumber} • Total Due: {formatCurrency(total)}</p>
              </div>
              <button 
                onClick={() => setIsSplitOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              <div className="space-y-6 font-sans">
                {/* Guest count selector */}
                <div className="bg-[#0e0e0d] border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#A69984] font-bold uppercase tracking-wider">Number of Guests</span>
                    <span className="text-white text-lg font-serif font-bold">{guestCount} Guests</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setGuestCount(prev => Math.max(2, prev - 1))}
                      disabled={guestCount <= 2}
                      className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">remove</span>
                    </button>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                      aria-label="Number of guests"
                      className="flex-grow accent-[#ffe2ab]"
                    />
                    <button 
                      onClick={() => setGuestCount(prev => Math.min(10, prev + 1))}
                      disabled={guestCount >= 10}
                      className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                  </div>
                </div>

                {/* Even portions display list */}
                <div className="space-y-3">
                  <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block">Portions Breakdown</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: guestCount }).map((_, idx) => {
                      const guestLetter = String.fromCharCode(65 + idx); // A, B, C...
                      const isPaid = paidGuests.includes(idx);
                      const shareTotal = total / guestCount;
                      return (
                        <div key={idx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-white'}`}>
                          <div>
                            <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">Guest {guestLetter}</div>
                            <div className="font-serif text-lg font-bold mt-1">{formatCurrency(shareTotal)}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (isPaid) {
                                  setPaidGuests(prev => prev.filter(g => g !== idx));
                              } else {
                                  setPaidGuests(prev => [...prev, idx]);
                                  triggerToast(`Guest ${guestLetter}'s portion paid!`);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${isPaid ? 'bg-emerald-500 text-[#022c22] border-emerald-500' : 'bg-transparent text-[#ffe2ab] border-[#ffe2ab]/20 hover:border-[#ffe2ab]/50'}`}
                          >
                            {isPaid ? '✓ Paid' : 'Pay Portion'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Summary / Actions */}
            <div className="border-t border-white/5 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 font-sans">
              <div className="text-center sm:text-left">
                <div className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Split Paid Progress</div>
                <div className="text-white text-xs font-bold mt-1">
                  {paidGuests.length} of {guestCount} Portions Settled 
                  {paidGuests.length === guestCount && <span className="text-emerald-400 ml-1.5">✓ Ready</span>}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setItemAssignments({});
                    setPaidGuests([]);
                    triggerToast('Splits reset.');
                  }}
                  className="px-4 py-2.5 bg-transparent border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  onClick={() => {
                    if (paidGuests.length === guestCount) {
                      setIsSplitOpen(false);
                      // Clear actual cart since it is fully paid!
                      localStorage.removeItem('dinepos_cart');
                      localStorage.removeItem('dinepos_placed_order');
                      localStorage.removeItem('dinepos_split_item_assignments');
                      localStorage.removeItem('dinepos_split_paid_guests');
                      triggerToast('Full ticket paid! Finalizing.');
                      setIsProcessing(true);
                      setProcessingStep(1);
                      setTimeout(() => {
                        setProcessingStep(2);
                        setTimeout(() => {
                          setProcessingStep(3);
                        }, 1200);
                      }, 1000);
                    } else {
                      // Just save state and close calculator
                      setIsSplitOpen(false);
                      triggerToast('Bill split configurations saved.');
                    }
                  }}
                  className="px-6 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow cursor-pointer hover:scale-[1.01]"
                >
                  {paidGuests.length === guestCount ? 'Finalize Paid Ticket' : 'Apply Splits'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CULINARY PAYMENT PROCESSING & SUCCESS OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 select-none flex-none">
          
          {processingStep < 3 ? (
            <div className="text-center space-y-6 max-w-sm">
              <div className="flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-[#ffe2ab] animate-spin font-light">progress_activity</span>
              </div>
              <div>
                <h4 className="font-serif text-xl text-white font-medium tracking-wide">
                  {processingStep === 1 ? 'Securing Transaction Connection' : 'Validating Table Vault Credentials'}
                </h4>
                <p className="text-[#A69984]/60 font-sans text-xs mt-2 leading-relaxed">
                  {processingStep === 1 
                    ? 'Deploying AES-256 luxury encryption keys. Please hold.' 
                    : 'Transmitting encrypted invoice packet to primary restaurant node.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#161513] border border-[#ffe2ab]/20 p-6 sm:p-10 rounded-2xl max-w-md w-full shadow-2xl text-center select-none animate-slide-in duration-300">
              <span className="material-symbols-outlined text-6xl text-[#ffe2ab] mb-4 font-light animate-pulse">check_circle</span>
              <h3 className="font-serif text-2xl text-white mb-2 font-medium tracking-wide">Payment Completed</h3>
              
              <div className="font-sans text-[10.5px] text-[#ffe2ab] font-bold uppercase tracking-widest mb-4">
                Table {displayTableNumber} • Invoice #DINE-88A92 • {formatCurrency(total)}
              </div>
              
              <p className="text-[#A69984]/70 text-xs leading-relaxed mb-8 font-sans">
                Thank you for dining with us. Your luxury billing transaction was successfully validated. Your digital receipt has been transmitted to your email, and table locking protocols have cleared.
              </p>
              
              <div className="space-y-3 font-sans">
                <Link 
                  href="/menu"
                  onClick={() => { setIsProcessing(false); setProcessingStep(0); }}
                  className="block w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-all text-center"
                >
                  Return to Menu
                </Link>
                <Link 
                  href="/"
                  className="block w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all text-center"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>
      )}

      {/* DYNAMIC TOAST ALERTS */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">
              {toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">
                {toast.type === 'success' ? 'Billing Success' : 'Notification'}
              </div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">
                {toast.message}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
