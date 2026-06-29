'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';
import { deductStockForOrder } from '../inventoryUtils';
import { apiRequest } from '@/utils/api';
import ReceiptPrintModal, { ReceiptData } from '@/components/ui/ReceiptPrintModal';

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
  options?: { text: string; type?: 'default' | 'allergy' | 'highlight' }[];
}

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
  appliedDiscount?: {
    type: string;
    amount: number;
    label: string;
    percentValue?: number;
    fixedValue?: number;
    promoCode?: string;
  } | null;
}

const recalculateDiscountAmount = (subtotal: number, discount: any): number => {
  if (!discount) return 0;
  if (discount.type === 'percent') {
    return subtotal * ((discount.percentValue || 0) / 100);
  } else if (discount.type === 'fixed') {
    return Math.min(discount.fixedValue || 0, subtotal);
  } else if (discount.type === 'promo') {
    if (discount.percentValue !== undefined) {
      return subtotal * (discount.percentValue / 100);
    }
    if (discount.fixedValue !== undefined) {
      return Math.min(discount.fixedValue, subtotal);
    }
  }
  return discount.amount || 0;
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
  'Truffle Risotto': 76.00,
  'Wagyu Ribeye 12oz': 145.00,
  'Seared Scallops': 42.00,
  'Bottle: Dom Pérignon 2012': 310.00,
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

const getTicketTaxRate = (t: any, defaultDineIn = 0.085, defaultTakeaway = 0.085, defaultDelivery = 0.085): number => {
  if (t && typeof t.taxRate === 'number' && !isNaN(t.taxRate)) {
    return t.taxRate;
  }
  if (t && t.tableNumber) {
    const tbl = t.tableNumber.toLowerCase();
    if (tbl.includes('takeaway') || tbl.includes('takeout')) return defaultTakeaway;
    if (tbl.includes('delivery')) return defaultDelivery;
  }
  if (t && t.type) {
    if (t.type === 'takeaway') return defaultTakeaway;
    if (t.type === 'delivery') return defaultDelivery;
  }
  return defaultDineIn;
};

const getTicketGratuityRate = (t: any): number => {
  if (t && typeof t.gratuityRate === 'number' && !isNaN(t.gratuityRate)) {
    return t.gratuityRate;
  }
  if (t && t.tableNumber) {
    const tbl = t.tableNumber.toLowerCase();
    if (tbl.includes('takeaway') || tbl.includes('takeout') || tbl.includes('delivery')) return 0.00;
  }
  if (t && t.type) {
    if (t.type === 'takeaway' || t.type === 'delivery') return 0.00;
  }
  
  if (typeof window !== 'undefined') {
    const savedCurrency = localStorage.getItem('dinepos_currency');
    if (savedCurrency === 'JPY') {
      return 0.00;
    }
    const minCovers = parseInt(localStorage.getItem('dinepos_cashier_auto_gratuity_min_covers') || '6', 10);
    const gratuityPct = parseInt(localStorage.getItem('dinepos_cashier_auto_gratuity_pct') || '20', 10);
    const covers = t && typeof t.covers === 'number' ? t.covers : (t && typeof t.guests === 'number' ? t.guests : 1);
    if (covers >= minCovers) {
      return gratuityPct / 100;
    }
    return 0.00;
  }
  return 0.20; // Default 20%
};

const getTicketCardAmount = (t: any, taxType: 'pre-tax' | 'post-tax' = 'pre-tax'): number => {
  if (t.cardAmount !== undefined && t.cardAmount !== null) {
    return t.cardAmount;
  }
  const sub = t.items ? t.items.reduce((acc: number, it: any) => acc + (getItemPrice(it) * it.qty), 0) : 0;
  const discAmt = t.appliedDiscount ? recalculateDiscountAmount(sub, t.appliedDiscount) : 0;
  const tTaxRate = getTicketTaxRate(t);
  const tGratuityRate = getTicketGratuityRate(t);
  const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
  const itemGrat = sub * tGratuityRate;
  const totalAmount = taxType === 'pre-tax' ? Math.max(0, sub + itemTax + itemGrat - discAmt) : Math.max(0, sub + itemGrat - discAmt);
  return totalAmount;
};

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

const mapDbOrderToPosTicket = (o: any, taxDineIn = 0.085, taxTakeaway = 0.085, taxDelivery = 0.085): PosTicket => {
  let resolvedDiningType: 'dine-in' | 'takeaway' | 'delivery' = 'dine-in';
  let tTaxRate = taxDineIn;
  if (o.customerType === 'TAKE_OUT') {
    resolvedDiningType = 'takeaway';
    tTaxRate = taxTakeaway;
  } else if (o.customerType === 'DELIVERY') {
    resolvedDiningType = 'delivery';
    tTaxRate = taxDelivery;
  }

  const createdTime = new Date(o.createdAt).getTime();
  const nowTime = new Date().getTime();
  const diffMins = Math.max(1, Math.floor((nowTime - createdTime) / 60000));
  const duration = `${diffMins}m`;

  const mappedItems = o.items.map((i: any) => ({
    name: i.name,
    qty: i.quantity,
    price: i.price,
    note: i.notes || undefined,
    options: []
  }));

  const needsPayment = o.status !== 'SERVED' && o.status !== 'CANCELLED';

  return {
    id: o.id,
    tableNumber: o.tableName || (o.customerType === 'TAKE_OUT' ? 'Walk-in Takeaway' : o.customerType === 'DELIVERY' ? 'Delivery' : `Table ${o.orderNumber}`),
    serverName: o.customerType === 'DINE_IN' ? 'Self Service' : 'POS Cashier',
    duration,
    isVip: o.total >= 80,
    needsPayment,
    cardAmount: o.total,
    guests: o.customerType === 'DINE_IN' ? 2 : 1,
    orderNumber: `#${o.orderNumber}`,
    items: mappedItems,
    taxRate: tTaxRate,
    gratuityRate: resolvedDiningType === 'dine-in' ? 0.20 : 0.00,
    appliedDiscount: o.discount > 0 ? {
      type: 'fixed',
      amount: o.discount,
      label: `$${o.discount.toFixed(2)} Off`
    } : null
  };
};

export default function PosPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [tickets, setTickets] = useState<PosTicket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('ticket-1');
  const [quickFilter, setQuickFilter] = useState<'open' | 'payment' | 'vip'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transaction processing loader state
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [pendingCloseMsg, setPendingCloseMsg] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');
  const [taxRateDineIn, setTaxRateDineIn] = useState(0.085);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(0.085);
  const [taxRateDelivery, setTaxRateDelivery] = useState(0.085);
  const [dineInEnabled, setDineInEnabled] = useState(true);
  const [takeawayEnabled, setTakeawayEnabled] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);

  // Cashier Settings Preferences
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW'>('USD');
  const [cashierTheme, setCashierTheme] = useState('gold-obsidian');
  const [cashierScaling, setCashierScaling] = useState('standard');
  const [cashierTipPresets, setCashierTipPresets] = useState<string[]>(['15', '18', '20']);
  const [cashierAutoGratuityPct, setCashierAutoGratuityPct] = useState(20);
  const [cashierAutoGratuityMinCovers, setCashierAutoGratuityMinCovers] = useState(6);
  const [cashierLanguage, setCashierLanguage] = useState('en');

  const t = (enText: string, jaText: string) => {
    return cashierLanguage === 'ja' ? jaText : enText;
  };

  const formatMoney = (val: number) => {
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

  const getThemeStyles = () => {
    if (cashierTheme === 'midnight') {
      return `
        /* Midnight Onyx overrides */
        .text-\\[\\#ffe2ab\\] { color: #38bdf8 !important; }
        .text-\\[\\#ffe2ab\\]\\/90 { color: rgba(56, 189, 248, 0.9) !important; }
        .text-\\[\\#ffe2ab\\]\\/75 { color: rgba(56, 189, 248, 0.75) !important; }
        .text-\\[\\#ffe2ab\\]\\/70 { color: rgba(56, 189, 248, 0.7) !important; }
        .text-\\[\\#ffe2ab\\]\\/10 { color: rgba(56, 189, 248, 0.1) !important; }
        .bg-\\[\\#ffe2ab\\] { background-color: #38bdf8 !important; }
        .bg-\\[\\#ffe2ab\\]\\/10 { background-color: rgba(56, 189, 248, 0.1) !important; }
        .bg-\\[\\#ffe2ab\\]\\/5 { background-color: rgba(56, 189, 248, 0.05) !important; }
        .border-\\[\\#ffe2ab\\] { border-color: #38bdf8 !important; }
        .border-\\[\\#ffe2ab\\]\\/20 { border-color: rgba(56, 189, 248, 0.2) !important; }
        .border-\\[\\#ffe2ab\\]\\/30 { border-color: rgba(56, 189, 248, 0.3) !important; }
        .hover\\:bg-\\[\\#ffdca0\\]:hover { background-color: #0ea5e9 !important; }
        .text-\\[\\#402d00\\] { color: #0f172a !important; }
        .text-\\[\\#402d00\\]\\/45 { color: rgba(15, 23, 42, 0.45) !important; }
        .bg-\\[\\#11100e\\] { background-color: #0b0f19 !important; }
        .bg-\\[\\#0e0e0d\\] { background-color: #070a12 !important; }
        .bg-\\[\\#0e0e0e\\] { background-color: #070a12 !important; }
        .bg-\\[\\#0a0a09\\] { background-color: #04060c !important; }
        .bg-\\[\\#161513\\]\\/40 { background-color: rgba(15, 23, 42, 0.4) !important; }
      `;
    }
    if (cashierTheme === 'emerald') {
      return `
        /* Emerald Luxe overrides */
        .text-\\[\\#ffe2ab\\] { color: #10b981 !important; }
        .text-\\[\\#ffe2ab\\]\\/90 { color: rgba(16, 185, 129, 0.9) !important; }
        .text-\\[\\#ffe2ab\\]\\/75 { color: rgba(16, 185, 129, 0.75) !important; }
        .text-\\[\\#ffe2ab\\]\\/70 { color: rgba(16, 185, 129, 0.7) !important; }
        .text-\\[\\#ffe2ab\\]\\/10 { color: rgba(16, 185, 129, 0.1) !important; }
        .bg-\\[\\#ffe2ab\\] { background-color: #10b981 !important; }
        .bg-\\[\\#ffe2ab\\]\\/10 { background-color: rgba(16, 185, 129, 0.1) !important; }
        .bg-\\[\\#ffe2ab\\]\\/5 { background-color: rgba(16, 185, 129, 0.05) !important; }
        .border-\\[\\#ffe2ab\\] { border-color: #10b981 !important; }
        .border-\\[\\#ffe2ab\\]\\/20 { border-color: rgba(16, 185, 129, 0.2) !important; }
        .border-\\[\\#ffe2ab\\]\\/30 { border-color: rgba(16, 185, 129, 0.3) !important; }
        .hover\\:bg-\\[\\#ffdca0\\]:hover { background-color: #059669 !important; }
        .text-\\[\\#402d00\\] { color: #064e3b !important; }
        .text-\\[\\#402d00\\]\\/45 { color: rgba(6, 78, 59, 0.45) !important; }
        .bg-\\[\\#11100e\\] { background-color: #022c22 !important; }
        .bg-\\[\\#0e0e0d\\] { background-color: #02251d !important; }
        .bg-\\[\\#0e0e0e\\] { background-color: #02251d !important; }
        .bg-\\[\\#0a0a09\\] { background-color: #011c16 !important; }
        .bg-\\[\\#161513\\]\\/40 { background-color: rgba(2, 44, 34, 0.4) !important; }
      `;
    }
    return '';
  };

  const scalingStyle = useMemo(() => {
    if (cashierScaling === 'compact') {
      return {
        transform: 'scale(0.95)',
        transformOrigin: 'top left',
        width: '105.26%',
        height: '105.26%',
      };
    }
    if (cashierScaling === 'large') {
      return {
        transform: 'scale(1.05)',
        transformOrigin: 'top left',
        width: '95.24%',
        height: '95.24%',
      };
    }
    return {};
  }, [cashierScaling]);

  // Digital Menu catalog states
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [catalogModifiers, setCatalogModifiers] = useState<Record<string, string[]>>({});

  const handleToggleCatalogModifier = (itemId: string, modifierName: string, type: 'single' | 'multiple', groupTitle: string) => {
    setCatalogModifiers(prev => {
      const current = prev[itemId] || [];
      if (type === 'single') {
        const group = itemModifiersConfig[itemId]?.find(g => g.title === groupTitle);
        const groupOptionNames = group ? group.options.map(o => o.name) : [];
        const filtered = current.filter(name => !groupOptionNames.includes(name));
        return {
          ...prev,
          [itemId]: [...filtered, modifierName]
        };
      } else {
        const exists = current.includes(modifierName);
        const updated = exists
          ? current.filter(name => name !== modifierName)
          : [...current, modifierName];
        return {
          ...prev,
          [itemId]: updated
        };
      }
    });
  };

  // Checkout Customer Details, Tips, and Notes states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tipMode, setTipMode] = useState<string>('none');
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
  const [appliedDiscount, setAppliedDiscount] = useState<{
    type: string;
    amount: number;
    label: string;
    percentValue?: number;
    fixedValue?: number;
    promoCode?: string;
  } | null>(null);

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

      const dineInOk = localStorage.getItem('dinepos_dine_in_enabled') !== 'false';
      const takeawayOk = localStorage.getItem('dinepos_takeaway_enabled') !== 'false';
      const deliveryOk = localStorage.getItem('dinepos_delivery_enabled') !== 'false';
      setDineInEnabled(dineInOk);
      setTakeawayEnabled(takeawayOk);
      setDeliveryEnabled(deliveryOk);

      const savedCurrency = localStorage.getItem('dinepos_currency');
      if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW'].includes(savedCurrency || '')) {
        setCurrency(savedCurrency as any);
      }

      // Load cashier settings
      const savedTheme = localStorage.getItem('dinepos_cashier_theme');
      if (savedTheme) setCashierTheme(savedTheme);

      const savedScaling = localStorage.getItem('dinepos_cashier_ui_scaling');
      if (savedScaling) setCashierScaling(savedScaling);

      const savedPresets = localStorage.getItem('dinepos_cashier_tip_presets');
      if (savedPresets) {
        setCashierTipPresets(savedPresets.split(',').map(s => s.trim()));
      }

      const savedAutoGratPct = localStorage.getItem('dinepos_cashier_auto_gratuity_pct');
      if (savedAutoGratPct) setCashierAutoGratuityPct(parseInt(savedAutoGratPct, 10));

      const savedAutoGratMinCovers = localStorage.getItem('dinepos_cashier_auto_gratuity_min_covers');
      if (savedAutoGratMinCovers) setCashierAutoGratuityMinCovers(parseInt(savedAutoGratMinCovers, 10));

      const savedLang = localStorage.getItem('dinepos_cashier_language');
      if (savedLang) setCashierLanguage(savedLang);

      // Load tickets from dinepos_shared_tickets
      const sharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
      if (sharedTicketsStr) {
        try {
          setTickets(JSON.parse(sharedTicketsStr));
        } catch (e) {
          console.error(e);
          setTickets(initialTickets);
        }
      } else {
        const initialTicketsWithRates = initialTickets.map(t => {
          if (t.tableNumber.toLowerCase().includes('takeaway')) {
            return { ...t, taxRate: savedTaxRateTakeaway ? parseFloat(savedTaxRateTakeaway) / 100 : t.taxRate };
          } else if (t.tableNumber.toLowerCase().includes('delivery')) {
            return { ...t, taxRate: savedTaxRateDelivery ? parseFloat(savedTaxRateDelivery) / 100 : t.taxRate };
          } else {
            return { ...t, taxRate: savedTaxRateDineIn ? parseFloat(savedTaxRateDineIn) / 100 : t.taxRate };
          }
        });
        setTickets(initialTicketsWithRates);
        localStorage.setItem('dinepos_shared_tickets', JSON.stringify(initialTicketsWithRates));
      }

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

      // Load digital menu categories
      const defaultCategories = [
        { id: 'special', name: 'Our Special', icon: 'auto_awesome' },
        { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' },
        { id: 'starters', name: 'Starters', icon: 'restaurant' },
        { id: 'mains', name: 'Main Course', icon: 'restaurant_menu' },
        { id: 'desserts', name: 'Desserts', icon: 'icecream' },
        { id: 'drinks', name: 'Drinks', icon: 'local_bar' }
      ];

      const loadMenuAndCategories = async () => {
        const catRes = await apiRequest<any[]>('/api/menu/categories');
        const itemRes = await apiRequest<any[]>('/api/menu/items');

        if (catRes.success && itemRes.success && catRes.data && itemRes.data) {
          const mappedCategories = catRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || 'restaurant'
          }));
          
          const mappedItems = itemRes.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.categoryId,
            price: item.price,
            description: item.description || '',
            image: item.imageUrl || '/images/wagyu_ribeye.png',
            tags: item.tags || []
          }));

          setCategories(mappedCategories);
          setMenuItems(mappedItems);
          
          localStorage.setItem('dinepos_menu_categories', JSON.stringify(mappedCategories));
          localStorage.setItem('dinepos_menu_items', JSON.stringify(mappedItems));
          setIsLoaded(true);
          return;
        }

        // Offline Fallback
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
        setIsLoaded(true);
      };

      loadMenuAndCategories();
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dinepos_shared_tickets', JSON.stringify(tickets));
    }
  }, [tickets, isLoaded]);

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
        if (e.key === 'dinepos_shared_tickets' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setTickets(parsed);
          } catch (err) {
            console.error(err);
          }
        }
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
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isLoaded]);

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
            cardAmount: 0,
            guests: 2,
            orderNumber: `#${orderNum}`,
            taxRate: taxRateDineIn,
            gratuityRate: 0.20,
            items: []
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
            cardAmount: 0,
            guests: 1,
            orderNumber: `#${orderNum}`,
            taxRate: taxRateTakeaway,
            gratuityRate: 0.00,
            items: []
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
      if (e.key === 'dinepos_dine_in_enabled' && e.newValue) {
        setDineInEnabled(e.newValue !== 'false');
      }
      if (e.key === 'dinepos_takeaway_enabled' && e.newValue) {
        setTakeawayEnabled(e.newValue !== 'false');
      }
      if (e.key === 'dinepos_delivery_enabled' && e.newValue) {
        setDeliveryEnabled(e.newValue !== 'false');
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
      if (e.key === 'dinepos_currency' && e.newValue) {
        setCurrency(e.newValue as any);
      }
      if (e.key === 'dinepos_cashier_theme' && e.newValue) {
        setCashierTheme(e.newValue);
      }
      if (e.key === 'dinepos_cashier_ui_scaling' && e.newValue) {
        setCashierScaling(e.newValue);
      }
      if (e.key === 'dinepos_cashier_tip_presets' && e.newValue) {
        setCashierTipPresets(e.newValue.split(',').map(s => s.trim()));
      }
      if (e.key === 'dinepos_cashier_auto_gratuity_pct' && e.newValue) {
        setCashierAutoGratuityPct(parseInt(e.newValue, 10));
      }
      if (e.key === 'dinepos_cashier_auto_gratuity_min_covers' && e.newValue) {
        setCashierAutoGratuityMinCovers(parseInt(e.newValue, 10));
      }
      if (e.key === 'dinepos_cashier_language' && e.newValue) {
        setCashierLanguage(e.newValue);
      }
    };
    
    const handleSettingsUpdated = () => {
      const savedTheme = localStorage.getItem('dinepos_cashier_theme');
      if (savedTheme) setCashierTheme(savedTheme);
      const savedScaling = localStorage.getItem('dinepos_cashier_ui_scaling');
      if (savedScaling) setCashierScaling(savedScaling);
      const savedPresets = localStorage.getItem('dinepos_cashier_tip_presets');
      if (savedPresets) setCashierTipPresets(savedPresets.split(',').map(s => s.trim()));
      const savedAutoGratPct = localStorage.getItem('dinepos_cashier_auto_gratuity_pct');
      if (savedAutoGratPct) setCashierAutoGratuityPct(parseInt(savedAutoGratPct, 10));
      const savedAutoGratMinCovers = localStorage.getItem('dinepos_cashier_auto_gratuity_min_covers');
      if (savedAutoGratMinCovers) setCashierAutoGratuityMinCovers(parseInt(savedAutoGratMinCovers, 10));
      const savedLang = localStorage.getItem('dinepos_cashier_language');
      if (savedLang) setCashierLanguage(savedLang);
      const savedCurrency = localStorage.getItem('dinepos_currency');
      if (savedCurrency) setCurrency(savedCurrency as any);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dinepos_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dinepos_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Poll active tickets from the database
  useEffect(() => {
    if (!isLoaded) return;

    const syncActiveTickets = async () => {
      try {
        const res = await apiRequest<any[]>('/api/orders');
        if (!res.success) {
          if (res.error?.includes('Authentication required') || res.error?.includes('token') || res.error?.includes('Unauthorized')) {
            console.warn('[POS] Authentication failed. Redirecting to login.');
            window.location.href = '/login';
            return;
          }
        }
        if (res.success && res.data) {
          const dbTickets = res.data.map((o: any) => 
            mapDbOrderToPosTicket(o, taxRateDineIn, taxRateTakeaway, taxRateDelivery)
          );
          
          if (dbTickets.length > 0) {
            setTickets(dbTickets);
            setSelectedTicketId(prev => {
              if (!prev || !dbTickets.some(t => t.id === prev)) {
                return dbTickets[0].id;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('[POS] Failed syncing active tickets:', err);
      }
    };

    syncActiveTickets();
    const interval = setInterval(syncActiveTickets, 5000);
    return () => clearInterval(interval);
  }, [isLoaded, taxRateDineIn, taxRateTakeaway, taxRateDelivery]);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Add item to active ticket
  const handleAddItemToTicket = (
    ticketId: string,
    item: any,
    note?: string,
    selectedOptions?: { text: string; type?: 'default' | 'allergy' | 'highlight' }[]
  ) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      
      const existingItemIdx = t.items.findIndex(
        i => i.name === item.name &&
             (i.note || '') === (note || '') &&
             JSON.stringify(i.options || []) === JSON.stringify(selectedOptions || [])
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
          note: note ? note.trim() : undefined,
          options: selectedOptions || []
        });
      }
      
      const sub = updatedItems.reduce((acc, it) => acc + (getItemPrice(it) * it.qty), 0);
      let newAppliedDiscount = t.appliedDiscount ? { ...t.appliedDiscount } : null;
      if (newAppliedDiscount) {
        newAppliedDiscount.amount = recalculateDiscountAmount(sub, newAppliedDiscount);
      }
      const discAmt = newAppliedDiscount ? newAppliedDiscount.amount : 0;
      const tTaxRate = getTicketTaxRate(t);
      const tGratuityRate = getTicketGratuityRate(t);
      const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
      const itemGrat = sub * tGratuityRate;
      const totalAmount = taxType === 'pre-tax' ? Math.max(0, sub + itemTax + itemGrat - discAmt) : Math.max(0, sub + itemGrat - discAmt);
      
      return {
        ...t,
        items: updatedItems,
        appliedDiscount: newAppliedDiscount,
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
          const newQty = i.qty + change;
          return { ...i, qty: newQty };
        }
        return i;
      }).filter(i => i.qty > 0);
      
      const sub = updatedItems.reduce((acc, it) => acc + (getItemPrice(it) * it.qty), 0);
      let newAppliedDiscount = t.appliedDiscount ? { ...t.appliedDiscount } : null;
      if (newAppliedDiscount) {
        newAppliedDiscount.amount = recalculateDiscountAmount(sub, newAppliedDiscount);
      }
      const discAmt = newAppliedDiscount ? newAppliedDiscount.amount : 0;
      const tTaxRate = getTicketTaxRate(t);
      const tGratuityRate = getTicketGratuityRate(t);
      const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
      const itemGrat = sub * tGratuityRate;
      const totalAmount = taxType === 'pre-tax' ? Math.max(0, sub + itemTax + itemGrat - discAmt) : Math.max(0, sub + itemGrat - discAmt);
      
      return {
        ...t,
        items: updatedItems,
        appliedDiscount: newAppliedDiscount,
        cardAmount: totalAmount
      };
    }));
  };

  // Remove item from ticket
  const handleRemoveItem = (ticketId: string, itemName: string, note?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      
      const updatedItems = t.items.filter(i => !(i.name === itemName && (note === undefined || i.note === note)));
      
      const sub = updatedItems.reduce((acc, it) => acc + (getItemPrice(it) * it.qty), 0);
      let newAppliedDiscount = t.appliedDiscount ? { ...t.appliedDiscount } : null;
      if (newAppliedDiscount) {
        newAppliedDiscount.amount = recalculateDiscountAmount(sub, newAppliedDiscount);
      }
      const discAmt = newAppliedDiscount ? newAppliedDiscount.amount : 0;
      const tTaxRate = getTicketTaxRate(t);
      const tGratuityRate = getTicketGratuityRate(t);
      const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
      const itemGrat = sub * tGratuityRate;
      const totalAmount = taxType === 'pre-tax' ? Math.max(0, sub + itemTax + itemGrat - discAmt) : Math.max(0, sub + itemGrat - discAmt);
      
      return {
        ...t,
        items: updatedItems,
        appliedDiscount: newAppliedDiscount,
        cardAmount: totalAmount
      };
    }));
    triggerToast(`Removed ${itemName} from ticket.`);
  };

  // Find active selected ticket — may be undefined when all tickets are paid
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) ?? tickets[0];

  // Synchronize appliedDiscount state with selected ticket
  useEffect(() => {
    if (selectedTicket) {
      setAppliedDiscount(selectedTicket.appliedDiscount || null);
    } else {
      setAppliedDiscount(null);
    }
  }, [selectedTicketId, selectedTicket?.appliedDiscount]);

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
  const subtotal       = selectedTicket ? selectedTicket.items.reduce((acc, item) => acc + (getItemPrice(item) * item.qty), 0) : 0;
  const tax            = selectedTicket ? (taxType === 'pre-tax' ? subtotal * getTicketTaxRate(selectedTicket) : subtotal - (subtotal / (1 + getTicketTaxRate(selectedTicket)))) : 0;
  const gratuity       = selectedTicket ? subtotal * getTicketGratuityRate(selectedTicket) : 0;
  const discountAmount = (selectedTicket && appliedDiscount) ? appliedDiscount.amount : 0;
  const grandTotal     = selectedTicket ? Math.max(0, taxType === 'pre-tax' ? subtotal + tax + gratuity - discountAmount : subtotal + gratuity - discountAmount) : 0;

  // Tip calculation
  const tipAmount = selectedTicket ? (
    tipMode === 'none' ? 0 :
    tipMode === 'custom' ? customTipAmount :
    subtotal * (parseFloat(tipMode) / 100)
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
    let paymentDetail = t(
      `Authorizing ${checkoutPaymentMethod.toUpperCase()} payment of ${formatMoney(finalAmount)} for Table ${selectedTicket.tableNumber}...`,
      `テーブル ${selectedTicket.tableNumber} の ${formatMoney(finalAmount)} の ${checkoutPaymentMethod.toUpperCase()} 決済を承認中...`
    );
    if (customerName.trim()) {
      paymentDetail = `[${t('Customer', '顧客')}: ${customerName.trim()}] ` + paymentDetail;
    }
    triggerToast(paymentDetail);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      // Create transaction record
      const transactionId = `tx-${Math.floor(100000 + Math.random() * 900000)}`;
      const dateObj = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      
      const isWalkin = selectedTicket.tableNumber.toLowerCase().includes('walk');
      const tableType = isWalkin ? ('takeout' as const) : ('table' as const);
      
      const newTx = {
        id: transactionId,
        orderId: `#ORD-${selectedTicket.id.replace('ticket-', '').slice(0, 4).toUpperCase()}`,
        date: dateObj.toLocaleDateString('en-US', dateOptions),
        time: dateObj.toLocaleTimeString('en-US', timeOptions),
        tableType: tableType,
        tableLabel: isWalkin ? 'Takeaway' : `Tbl ${selectedTicket.tableNumber.replace('Table ', '')}`,
        server: activeOperator.name,
        amount: grandTotal + tipAmount,
        paymentMethod: checkoutPaymentMethod.toUpperCase() === 'CASH' ? 'Cash' : 'Card',
        paymentType: checkoutPaymentMethod.toUpperCase() === 'CASH' ? ('cash' as const) : ('card' as const),
        paymentDetails: checkoutPaymentMethod.toUpperCase() === 'CASH' ? '' : '•••• 4242',
        paymentIcon: checkoutPaymentMethod.toUpperCase() === 'CASH' ? 'payments' : 'credit_card'
      };

      const existingTxStr = localStorage.getItem('dinepos_pos_transactions');
      let txList = [];
      if (existingTxStr) {
        try {
          txList = JSON.parse(existingTxStr);
        } catch (e) {}
      }
      txList.unshift(newTx);
      localStorage.setItem('dinepos_pos_transactions', JSON.stringify(txList));

      // Deduct ingredient stock based on the items in the paid ticket
      deductStockForOrder(selectedTicket.items);

      // Update order status on the backend database
      const orderId = selectedTicket.id;
      const isUuid = orderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      if (isUuid) {
        apiRequest(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'SERVED' })
        }).catch(err => {
          console.error('[POS] Failed to update order status on server:', err);
        });
      }

      let successMsg = `Payment validated! ${selectedTicket.tableNumber} ticket closed.`;
      if (checkoutNotes.trim()) {
        successMsg += ` Note saved: "${checkoutNotes.trim()}"`;
      }
      
      // Build receipt data and show receipt modal
      const dateObj2 = new Date();
      const dateOptions2: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
      const timeOptions2: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      const receiptItems = selectedTicket.items.map((item: any) => ({
        name: item.name,
        qty: item.qty,
        price: getItemPrice(item),
        modifiers: item.options ? item.options.map((o: any) => o.text) : []
      }));
      setReceiptData({
        restaurantName: 'DinePOS Restaurant',
        orderId: `#ORD-${selectedTicket.id.replace('ticket-', '').slice(0, 4).toUpperCase()}`,
        tableLabel: selectedTicket.tableNumber,
        serverName: activeOperator.name,
        dateTime: `${dateObj2.toLocaleDateString('en-US', dateOptions2)} ${dateObj2.toLocaleTimeString('en-US', timeOptions2)}`,
        items: receiptItems,
        subtotal,
        tax,
        taxLabel: taxType === 'pre-tax' ? `Tax (${(getTicketTaxRate(selectedTicket) * 100).toFixed(1)}%)` : `Tax (incl.)`,
        discount: discountAmount,
        discountLabel: appliedDiscount ? appliedDiscount.label : 'Discount',
        gratuity: gratuity + tipAmount,
        total: grandTotal + tipAmount,
        paymentMethod: checkoutPaymentMethod.toUpperCase() === 'CASH' ? 'Cash' : 'Card',
        paymentDetails: checkoutPaymentMethod.toUpperCase() === 'CASH' ? '' : '•••• 4242',
        currency,
      });
      setPendingCloseMsg(successMsg);
      setReceiptModalOpen(true);
    }, 300);
  };

  const handleReceiptClose = () => {
    setReceiptModalOpen(false);
    if (pendingCloseMsg) {
      closeActiveTicket(pendingCloseMsg);
      setPendingCloseMsg('');
    }
    setReceiptData(null);
  };

  const handleSplitBill = () => {
    if (!selectedTicket) return;
    setCheckoutModalOpen(false);
    setSplitModalOpen(true);
  };

  const computeApplyDiscount = () => {
    if (!selectedTicket) return;
    let newDiscount = null;
    if (discountMode === 'promo') {
      const code = promoCodeInput.toUpperCase().trim();
      const promo = VALID_PROMO_CODES[code];
      if (!promo) { triggerToast('Invalid promo code. Please try again.'); return; }
      const amount = promo.type === 'percent' ? subtotal * (promo.value / 100) : Math.min(promo.value, subtotal);
      newDiscount = {
        type: 'promo',
        amount,
        label: `${code} — ${promo.label}`,
        promoCode: code,
        percentValue: promo.type === 'percent' ? promo.value : undefined,
        fixedValue: promo.type === 'fixed' ? promo.value : undefined
      };
      setAppliedDiscount(newDiscount);
      triggerToast(`Promo code "${code}" applied!`);
    } else if (discountMode === 'percent') {
      if (discountPercent <= 0 || discountPercent > 100) { triggerToast('Enter a valid percentage (1–100).'); return; }
      const amount = subtotal * (discountPercent / 100);
      newDiscount = {
        type: 'percent',
        amount,
        label: `${discountPercent}% Discount`,
        percentValue: discountPercent
      };
      setAppliedDiscount(newDiscount);
      triggerToast(t(`${discountPercent}% discount applied.`, `${discountPercent}% の割引が適用されました。`));
    } else {
      if (discountFixed <= 0) { triggerToast(t('Enter a valid discount amount.', '有効な割引額を入力してください。')); return; }
      const amount = Math.min(discountFixed, subtotal);
      newDiscount = {
        type: 'fixed',
        amount,
        label: t(`${formatMoney(discountFixed)} Off`, `${formatMoney(discountFixed)} 割引`),
        fixedValue: discountFixed
      };
      setAppliedDiscount(newDiscount);
      triggerToast(t(`${formatMoney(discountFixed)} discount applied.`, `${formatMoney(discountFixed)} の割引が適用されました。`));
    }

    // Update tickets array with applied discount and recalculated cardAmount
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        const sub = t.items.reduce((acc, it) => acc + (getItemPrice(it) * it.qty), 0);
        const discAmt = newDiscount ? newDiscount.amount : 0;
        const tTaxRate = getTicketTaxRate(t);
        const tGratuityRate = getTicketGratuityRate(t);
        const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
        const itemGrat = sub * tGratuityRate;
        const totalAmount = taxType === 'pre-tax' ? Math.max(0, sub + itemTax + itemGrat - discAmt) : Math.max(0, sub + itemGrat - discAmt);
        return {
          ...t,
          appliedDiscount: newDiscount,
          cardAmount: totalAmount
        };
      }
      return t;
    }));

    setDiscountVisible(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountPercent(0);
    setDiscountFixed(0);
    setPromoCodeInput('');

    // Update tickets array to clear applied discount and recalculate cardAmount
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        const sub = t.items.reduce((acc, it) => acc + (getItemPrice(it) * it.qty), 0);
        const tTaxRate = getTicketTaxRate(t);
        const tGratuityRate = getTicketGratuityRate(t);
        const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
        const itemGrat = sub * tGratuityRate;
        const totalAmount = taxType === 'pre-tax' ? sub + itemTax + itemGrat : sub + itemGrat;
        return {
          ...t,
          appliedDiscount: null,
          cardAmount: totalAmount
        };
      }
      return t;
    }));

    triggerToast('Discount removed.');
  };

  const handleUpdateGratuityRate = (ticketId: string, rate: number) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      
      const sub = t.items.reduce((acc, it) => acc + (getItemPrice(it) * it.qty), 0);
      let newAppliedDiscount = t.appliedDiscount ? { ...t.appliedDiscount } : null;
      if (newAppliedDiscount) {
        newAppliedDiscount.amount = recalculateDiscountAmount(sub, newAppliedDiscount);
      }
      const discAmt = newAppliedDiscount ? newAppliedDiscount.amount : 0;
      const tTaxRate = getTicketTaxRate(t);
      const itemTax = taxType === 'pre-tax' ? sub * tTaxRate : sub - (sub / (1 + tTaxRate));
      const itemGrat = sub * rate;
      const totalAmount = taxType === 'pre-tax' ? Math.max(0, sub + itemTax + itemGrat - discAmt) : Math.max(0, sub + itemGrat - discAmt);
      
      return {
        ...t,
        gratuityRate: rate,
        cardAmount: totalAmount
      };
    }));
    triggerToast(rate === 0 ? 'Gratuity waived for this ticket.' : 'Gratuity applied to this ticket.');
  };

  // Filter listings
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.serverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        quickFilter === 'open' ? true :
        quickFilter === 'payment' ? t.needsPayment : // Needs payment flag
        quickFilter === 'vip' ? t.isVip : false;

      return matchesSearch && matchesFilter;
    });
  }, [tickets, searchQuery, quickFilter]);

  return (
    <div 
      className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative"
      style={scalingStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: getThemeStyles() }} />

      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-30 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 overflow-y-auto ${
        sidebarCollapsed 
          ? 'w-0 lg:w-0 p-0 lg:p-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] p-8 opacity-100'
      }`}>
        <div>
          {/* Brand/Console Title */}
          <div className="mb-10 select-none flex items-center">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 select-none mr-3">
              <span className="material-symbols-outlined notranslate text-[19px] font-black leading-none text-[#ffe2ab]" translate="no">flatware</span>
            </div>
            <div>
              <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-[22px] tracking-wide block hover:opacity-85 transition-opacity leading-none">
                DinePosAi
              </Link>
              <span className="font-sans text-[8.5px] text-[#ffe2ab]/70 uppercase tracking-[0.2em] font-semibold mt-1 block">
                {t("Premium Suite", "プレミアムスイート")}
              </span>
            </div>
          </div>

          {/* Order Action Buttons */}
          <div className="grid grid-cols-1 gap-2 mb-8 select-none">
            {dineInEnabled && (
              <button 
                onClick={() => {
                  const tableNum = Math.floor(1 + Math.random() * 30);
                  const newId = `ticket-${Date.now()}`;
                  const orderNum = Math.floor(1000 + Math.random() * 9000);
                  const newTicket: PosTicket = {
                    id: newId,
                    tableNumber: tableNum.toString(),
                    serverName: 'J. Smith',
                    duration: '1m',
                    needsPayment: false,
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
                {t("New Table Order", "新規テーブル注文")}
              </button>
            )}
            {takeawayEnabled && (
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
                {t("Walk-in Customer", "お持ち帰り注文")}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-sans">
            <div
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow select-none"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none">layers</span>
                {t("Floor Map", "フロアマップ")}
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
            
            <Link
              href="/pos/history"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">receipt_long</span>
              {t("Orders", "注文履歴")}
            </Link>

            <Link
              href="/pos/analytics"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
              {t("Analytics", "分析")}
            </Link>

            <Link
              href="/pos/discounts"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">sell</span>
              {t("Discounts", "割引")}
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
            {t("Settings", "設定")}
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            {t("Sign Out", "サインアウト")}
          </Link>


        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

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
              {t("Active Orders", "処理中の注文")}
            </h2>
          </div>

          {/* Header search & profile indicators */}
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative select-none hidden sm:block">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-base">search</span>
              <input
                type="text"
                placeholder={t("Search tables or guests...", "テーブルまたは顧客を検索...")}
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
                {t("All Open", "すべての未決済")}
              </button>
              <button
                onClick={() => setQuickFilter('payment')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'payment' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                {t("Needs Payment", "要支払い")}
              </button>
              <button
                onClick={() => setQuickFilter('vip')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'vip' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                {t("VIP", "VIP")}
              </button>
            </div>

            {/* List of active order cards */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => {
                  const isActive = ticket.id === selectedTicketId;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => { setSelectedTicketId(ticket.id); setMobileView('detail'); }}
                      className={`border rounded-2xl p-6 transition-all duration-300 cursor-pointer relative shadow-md ${isActive ? 'border-[#ffe2ab] bg-white/[0.01]' : 'border-white/5 hover:border-white/10 bg-[#161513]/40'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-white text-base">{ticket.tableNumber}</h4>
                          {ticket.isVip && (
                            <span className="bg-[#ffe2ab] text-[#402d00] font-sans font-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded select-none">
                              {t("VIP", "VIP")}
                            </span>
                          )}
                          {ticket.isSplit && (
                            <span className="bg-white/5 text-[#A69984]/60 font-sans font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 select-none">
                              {t("Split Check", "個別会計")}
                            </span>
                          )}
                        </div>
                        <div className="font-sans font-bold text-base text-[#ffe2ab]">{formatMoney(getTicketCardAmount(ticket, taxType))}</div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[#A69984]/65 font-medium mt-4">
                        <span>{t("Server", "接客係")}: {ticket.serverName}</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span>{ticket.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-[#A69984]/40 font-sans text-xs select-none">
                  {t("No open orders matching selection filters.", "選択条件に一致する未決済注文はありません。")}
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
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#ffe2ab]">{t("All Orders", "すべての注文")}</span>
              </button>

              {/* Ticket details header */}
              <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-start flex-shrink-0 select-none">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1.5 block">{t("Current Ticket", "現在の伝票")}</span>
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
                    {t("Add Menu Item", "メニュー追加")}
                  </button>
                </div>
                
                <div className="text-right text-xs text-[#A69984]/70 font-semibold font-sans space-y-1">
                  <div>{t("Guests: ", "人数: ")}{selectedTicket.guests}</div>
                  <div className="select-text">{t("Order ", "注文 ")}{selectedTicket.orderNumber}</div>
                </div>
              </div>

              {/* Order items lists with headers */}
              <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-12 text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest pb-3 border-b border-white/5 select-none">
                  <div className="col-span-2 text-left">{t("Qty", "数量")}</div>
                  <div className="col-span-6 text-left">{t("Item", "品名")}</div>
                  <div className="col-span-3 text-right">{t("Price", "単価")}</div>
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
                        {item.options && item.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 font-sans">
                            {item.options.map((opt: any, oIdx: number) => (
                              <span
                                key={oIdx}
                                className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                                  opt.type === 'allergy'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : opt.type === 'highlight'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-white/5 text-[#A69984] border-white/5'
                                }`}
                              >
                                {opt.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-3 text-right font-sans text-sm pr-2">
                        <div className="font-bold text-white/95">{formatMoney(getItemPrice(item))}</div>
                        {item.qty > 1 && (
                          <div className="text-[10px] text-[#A69984]/60 font-semibold mt-0.5">
                            {t("Total: ", "小計: ")}{formatMoney(getItemPrice(item) * item.qty)}
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
                    <span>{taxType === 'post-tax' ? t('Subtotal (Tax Incl.)', '小計 (税込)') : t('Subtotal', '小計')}</span>
                    <span className="text-white">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{taxType === 'post-tax' ? t('Included Tax', '内消費税') : t('Tax', '消費税')} ({(getTicketTaxRate(selectedTicket) * 100).toFixed(1)}%)</span>
                    <span className="text-white">{formatMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{t('Gratuity', 'サービス料')} (Suggested {selectedTicket ? (getTicketGratuityRate(selectedTicket) * 100).toFixed(0) : cashierAutoGratuityPct}%)</span>
                      {selectedTicket && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentRate = getTicketGratuityRate(selectedTicket);
                            const nextRate = currentRate > 0 ? 0.00 : (cashierAutoGratuityPct / 100);
                            handleUpdateGratuityRate(selectedTicket.id, nextRate);
                          }}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[#ffe2ab] border border-white/10 rounded font-sans text-[9px] uppercase tracking-wider transition-colors cursor-pointer select-none"
                        >
                          {getTicketGratuityRate(selectedTicket) > 0 ? t('Waive', '免除') : t('Apply', '適用')}
                        </button>
                      )}
                    </span>
                    <span className="text-white">{formatMoney(gratuity)}</span>
                  </div>
                  {discountAmount > 0 && appliedDiscount && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[11px]">sell</span>
                        {appliedDiscount.label}
                      </span>
                      <span>−{formatMoney(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Grand total */}
                <div className="flex justify-between items-baseline select-none">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]">{t('Grand Total', '総合計')}</span>
                  <span className="font-serif text-[38px] lg:text-[42px] font-bold text-[#ffe2ab] tracking-wide leading-none select-none">
                    {formatMoney(grandTotal)}
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
                    {isProcessing ? t('Processing...', '処理中...') : t('Process Payment', '会計処理へ進む')}
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center bg-[#11100e] text-[#A69984]/30 select-none">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl mb-4 font-light">receipt</span>
                <p className="font-serif text-lg text-white mb-1">{t('No Active Ticket Selected', '選択された伝票はありません')}</p>
                <p className="font-sans text-xs">{t('Select an open table check from the orders registry.', '注文登録から未決済の伝票を選択してください。')}</p>
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
            
            <h3 className="font-serif text-lg font-bold text-white mb-2">{t('Switch Operator', 'オペレーター切替')}</h3>
            <p className="text-[11px] text-[#A69984]/60 mb-5 font-medium uppercase tracking-wider">{t('Select the active POS cashier', 'アクティブなPOS担当者を選択してください')}</p>
            
            <div className="space-y-2">
              {AVAILABLE_OPERATORS.map((op) => (
                <button
                  key={op.name}
                  onClick={() => {
                    setActiveOperator(op);
                    localStorage.setItem('dinepos_active_operator', JSON.stringify(op));
                    setOperatorModalOpen(false);
                    triggerToast(t(`Operator switched to ${op.name}`, `オペレーターが ${op.name} に切り替わりました`));
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
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider select-none">{t("Payment Method", "支払い方法")}</label>
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
                        {method === 'card' ? t('Credit / Stripe', 'クレジットカード') : method === 'cash' ? t('Cash', '現金') : t('Digital Wallet', 'モバイル決済')}
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
                    <span className="font-sans font-bold text-xs text-white">{t("Customer Details", "顧客情報")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{customerName ? customerName : t('Not Set', '未設定')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {customerDetailsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {customerDetailsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider select-none">{t("Customer Name", "お名前")}</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider select-none">{t("Phone Number", "電話番号")}</label>
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
                    <span className="font-sans font-bold text-xs text-white">{t("Discount Settings", "割引設定")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{appliedDiscount ? appliedDiscount.label : t('No Discount', '割引なし')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {discountSettingsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {discountSettingsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="flex justify-between items-center select-none font-sans">
                      <span className="font-sans font-bold text-[9.5px] uppercase tracking-wider text-[#A69984]">{t("Discount Settings", "割引設定")}</span>
                      {appliedDiscount && (
                        <button
                          type="button"
                          onClick={handleRemoveDiscount}
                          className="text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span> {t("Remove Discount", "割引解除")}
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
                          {mode === 'percent' ? t('% Rate', '％率') : mode === 'fixed' ? t('Fixed $', '定額') : t('Promo Code', 'プロモコード')}
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
                          placeholder={t("Enter Percentage (e.g. 15)", "割合を入力 (例: 15)")}
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      )}
                      {discountMode === 'fixed' && (
                        <input
                          type="number"
                          min="0"
                          value={discountFixed || ''}
                          onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)}
                          placeholder={t("Enter Amount (e.g. 10.00)", "金額を入力 (例: 1000)")}
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      )}
                      {discountMode === 'promo' && (
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder={t("ENTER PROMO CODE", "プロモコードを入力")}
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors tracking-widest font-mono"
                        />
                      )}
                      <button
                        type="button"
                        onClick={computeApplyDiscount}
                        className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all shrink-0"
                      >
                        {t("Apply", "適用")}
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
                          −{formatMoney(appliedDiscount.amount)}
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
                    <span className="font-sans font-bold text-xs text-white">{t("Add Tip / Gratuity", "チップ／サービス料追加")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{tipAmount > 0 ? formatMoney(tipAmount) : t('No Tip', 'チップなし')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {tipsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {tipsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="grid grid-cols-5 gap-2 select-none">
                      {['none', ...cashierTipPresets, 'custom'].map(mode => {
                        const label = mode === 'none' ? t('No Tip', 'チップなし') : mode === 'custom' ? t('Custom', 'カスタム') : `${mode}%`;
                        return (
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
                            {label}
                          </button>
                        );
                      })}
                    </div>
 
                    {tipMode === 'custom' && (
                      <div className="space-y-1.5 animate-fade-in font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider block select-none">
                          {t("Custom Tip Amount", "カスタムチップ額")} ({currency === 'JPY' ? '¥' : '$'})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={currency === 'JPY' ? '1' : '0.01'}
                          placeholder={currency === 'JPY' ? 'e.g. 500' : 'e.g. 5.00'}
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
                    <span className="font-sans font-bold text-xs text-white">{t("Checkout Notes / Instructions", "会計メモ・指示")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{checkoutNotes ? t('Note Added', 'メモあり') : t('No Notes', 'メモなし')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {notesVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {notesVisible && (
                  <div className="p-5 space-y-3 animate-fade-in bg-[#12110f]/20">
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider select-none font-sans">{t("Checkout Notes / Special Requests", "会計メモ・特別リクエスト")}</label>
                    <textarea
                      rows={2}
                      placeholder={t("Add notes for the receipt, billing split details, or payment exceptions...", "領収書メモ、請求書分割の詳細、または支払いの例外を追加します...")}
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
                  <span>{t("Subtotal", "小計")}</span>
                  <span className="text-white font-mono">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#A69984]/70">
                  <span>{t("Tax", "消費税")} ({(getTicketTaxRate(selectedTicket) * 100).toFixed(1)}%)</span>
                  <span className="text-white font-mono">{formatMoney(tax)}</span>
                </div>
                {gratuity > 0 && (
                  <div className="flex justify-between text-xs text-[#A69984]/70">
                    <span>{t("Gratuity", "サービス料")}</span>
                    <span className="text-white font-mono">{formatMoney(gratuity)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#ffe2ab]/90">
                    <span>{t("Tip", "チップ")}</span>
                    <span className="text-[#ffe2ab] font-mono">{formatMoney(tipAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>{t("Discount", "割引")}</span>
                    <span className="font-mono">−{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#A69984] uppercase tracking-wider">{t("Grand Total Due", "お支払い総計")}</span>
                  <span className="text-2xl font-bold text-[#ffe2ab] font-serif tracking-wider">
                    {formatMoney(grandTotal + tipAmount)}
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
                {t("Cancel", "キャンセル")}
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
                <span>{t("Split Check", "個別会計")}</span>
              </button>
 
              <button
                type="button"
                onClick={handleCompleteCheckout}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>{t("Processing...", "処理中...")}</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>{t("Complete Payment", "支払い完了")}</span>
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
                <h3 className="font-serif font-bold text-lg text-white">{t('Split Check Calculator', '分割会計計算ツール')}</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  {t('Table', 'テーブル')} {selectedTicket.tableNumber} • {t('Invoice', '伝票')} #DINE-{selectedTicket.orderNumber?.replace('#', '') || ''}
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
                    {mode === 'evenly' ? t('Split Evenly', '均等分割') : t('Split By Item', '品目別分割')}
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
                      <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">{t('Number of Split Parties', '分割人数')}</span>
                      <span className="text-[#ffe2ab] text-sm font-bold font-serif">{splitGuestCount} {t('Portions', '等分')}</span>
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
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">{t('Portions Breakdown', '分割内訳')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: splitGuestCount }).map((_, idx) => {
                        const guestLetter = String.fromCharCode(65 + idx); // A, B, C...
                        const isPaid = splitPaidGuests.includes(idx);
                        const shareTotal = (grandTotal + tipAmount) / splitGuestCount;
                        return (
                          <div key={idx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#161513]/20 border-white/5 text-white'}`}>
                            <div className="font-sans">
                              <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">{t('Guest', 'ゲスト')} {guestLetter}</div>
                              <div className="font-serif text-lg font-bold mt-1 text-[#ffe2ab]">{formatMoney(shareTotal)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                let newPaid = [];
                                if (isPaid) {
                                  newPaid = splitPaidGuests.filter(g => g !== idx);
                                  setSplitPaidGuests(newPaid);
                                  triggerToast(t(`Guest ${guestLetter}'s payment refunded.`, `ゲスト ${guestLetter} の支払いが払い戻されました。`));
                                } else {
                                  newPaid = [...splitPaidGuests, idx];
                                  setSplitPaidGuests(newPaid);
                                  triggerToast(t(`Guest ${guestLetter}'s portion of ${formatMoney(shareTotal)} paid via ${checkoutPaymentMethod.toUpperCase()}!`, `ゲスト ${guestLetter} の ${formatMoney(shareTotal)} の支払いが ${checkoutPaymentMethod.toUpperCase()} で完了しました！`));
                                }
                                updateTicketSplits({ splitPaidGuests: newPaid });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${isPaid ? 'bg-emerald-500 text-[#022c22] border-emerald-500 hover:bg-emerald-600' : 'bg-transparent text-[#ffe2ab] border-[#ffe2ab]/20 hover:border-[#ffe2ab]/50 hover:bg-white/5'}`}
                            >
                              {isPaid ? `✓ ${t('Paid', '支払済')}` : t('Pay Portion', '一部支払')}
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
                    <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">{t('Split Parties', '分割数')}</span>
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
                      <span className="text-white font-serif font-bold w-12 text-center text-sm">{splitGuestCount} {t('Guests', '名')}</span>
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
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">{t('Assign Items to Guests', '品目をゲストに割り当て')}</span>
                    <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 flex-grow divide-y divide-white/5">
                      {selectedTicket.items.map((item, idx) => {
                        const assignedGuest = splitItemAssignments[idx] ?? -1;
                        return (
                          <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="max-w-[45%] font-sans">
                              <div className="text-xs text-white font-bold">{item.qty}x {item.name}</div>
                              <div className="text-[10px] text-[#A69984]/50 font-medium font-mono mt-0.5">{formatMoney(getItemPrice(item) * item.qty)}</div>
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
                                title={t('Split evenly among all guests', 'すべてのゲストで均等分割')}
                              >
                                {t('Shr', '共有')}
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
                                    title={t(`Assign to Guest ${guestLetter}`, `ゲスト ${guestLetter} に割り当て`)}
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
                      const itemCost = getItemPrice(item) * item.qty;
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
                      const tTaxRate = getTicketTaxRate(selectedTicket);
                      const tGratuityRate = getTicketGratuityRate(selectedTicket);
                      t.tax = taxType === 'pre-tax' 
                        ? t.subtotal * tTaxRate 
                        : t.subtotal - (t.subtotal / (1 + tTaxRate));
                      t.gratuity = t.subtotal * tGratuityRate;
                      t.discount = subtotal > 0 ? (t.subtotal / subtotal) * discountAmount : 0;
                      t.tip = subtotal > 0 ? (t.subtotal / subtotal) * tipAmount : 0;
                      t.total = Math.max(0, taxType === 'pre-tax' 
                        ? t.subtotal + t.tax + t.gratuity - t.discount + t.tip
                        : t.subtotal + t.gratuity - t.discount + t.tip
                      );
                    });

                    return (
                      <div className="space-y-3 pt-2 shrink-0">
                        <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">{t('Calculated Portions', '計算された分割分')}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                          {totals.map((gTotal, gIdx) => {
                            const guestLetter = String.fromCharCode(65 + gIdx);
                            const isPaid = splitPaidGuests.includes(gIdx);
                            return (
                              <div key={gIdx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#161513]/20 border-white/5 text-white'}`}>
                                <div className="font-sans">
                                  <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">{t('Guest', 'ゲスト')} {guestLetter}</div>
                                  <div className="font-serif text-lg font-bold mt-1 text-[#ffe2ab]">{formatMoney(gTotal.total)}</div>
                                  <div className="text-[9px] text-[#A69984]/45 mt-0.5 leading-none">
                                    {t('Sub', '小計')}: {formatMoney(gTotal.subtotal)} • {t('Tax', '税')}: {formatMoney(gTotal.tax)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    let newPaid = [];
                                    if (isPaid) {
                                      newPaid = splitPaidGuests.filter(g => g !== gIdx);
                                      setSplitPaidGuests(newPaid);
                                      triggerToast(t(`Guest ${guestLetter}'s payment refunded.`, `ゲスト ${guestLetter} の支払いが払い戻されました。`));
                                    } else {
                                      newPaid = [...splitPaidGuests, gIdx];
                                      setSplitPaidGuests(newPaid);
                                      triggerToast(t(`Guest ${guestLetter}'s portion of ${formatMoney(gTotal.total)} paid via ${checkoutPaymentMethod.toUpperCase()}!`, `ゲスト ${guestLetter} の ${formatMoney(gTotal.total)} の支払いが ${checkoutPaymentMethod.toUpperCase()} で完了しました！`));
                                    }
                                    updateTicketSplits({ splitPaidGuests: newPaid });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${isPaid ? 'bg-emerald-500 text-[#022c22] border-emerald-500 hover:bg-emerald-600' : 'bg-transparent text-[#ffe2ab] border-[#ffe2ab]/20 hover:border-[#ffe2ab]/50 hover:bg-white/5'}`}
                                >
                                  {isPaid ? `✓ ${t('Paid', '支払済')}` : t('Pay Portion', '一部支払')}
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
                <div className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">{t('Portions Progress', '支払い状況')}</div>
                <div className="text-white text-xs font-bold mt-1">
                  {splitPaidGuests.length} / {splitGuestCount} {t('Paid', '支払済')}
                  {splitPaidGuests.length === splitGuestCount && <span className="text-emerald-400 ml-1.5">✓ {t('Settled', '精算済')}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSplitPaidGuests([]);
                    setSplitItemAssignments({});
                    updateTicketSplits({ splitPaidGuests: [], splitItemAssignments: {} });
                    triggerToast(t('Splits reset.', '分割設定をリセットしました。'));
                  }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  {t('Reset', 'リセット')}
                </button>
                
                {splitPaidGuests.length === splitGuestCount ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProcessing(true);
                      setTimeout(() => {
                        setIsProcessing(false);
                        closeActiveTicket(t(`Checkout completed! Ticket for Table ${selectedTicket.tableNumber} fully paid via split billing.`, `会計が完了しました！テーブル ${selectedTicket.tableNumber} の伝票は分割払いで全額支払われました。`));
                      }, 2000);
                    }}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>{isProcessing ? t('Processing...', '処理中...') : t('Finalize Paid Ticket', '支払いを確定する')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateTicketSplits({ isSplit: true });
                      setSplitModalOpen(false);
                      triggerToast(t(`Saved split billing configurations for Table ${selectedTicket.tableNumber}.`, `テーブル ${selectedTicket.tableNumber} の分割支払い設定を保存しました。`));
                    }}
                    className="px-5 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    {t('Save & Apply Splits', '分割設定を保存して適用')}
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
                <h3 className="font-serif font-bold text-lg text-white">{t('Digital Menu Catalog', 'デジタルメニューカタログ')}</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  {t('Add products to ', '商品を追加: ')}{selectedTicket.tableNumber}
                </p>
              </div>
              
              {/* Search Box */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#A69984]/40 text-sm">search</span>
                  <input
                    type="text"
                    placeholder={t('Search menu...', 'メニューを検索...')}
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
                {t('All Items', '全商品')}
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
                  {t(cat.name, cat.name === 'Our Special' ? 'おすすめ' : cat.name === 'Combo Set' ? 'コンボセット' : cat.name === 'Starters' ? '前菜' : cat.name === 'Main Course' ? 'メインコース' : cat.name === 'Desserts' ? 'デザート' : cat.name === 'Drinks' ? 'ドリンク' : cat.name)}
                </button>
              ))}
            </div>

            {/* Modal Body: Products Grid */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#12110f]">
              {(() => {
                const filtered = menuItems.filter(item => {
                  if (item.active === false) return false;
                  const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
                  const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                                       (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-[#A69984]/40 py-20 select-none">
                      <span className="material-symbols-outlined text-4xl mb-2 font-light">restaurant_menu</span>
                      <p className="text-xs">{t('No matching menu items found.', '該当するメニューが見つかりません。')}</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item) => {
                      const imageSrc = item.image && item.image.startsWith('/images/')
                        ? `/images/${item.image.split('/').pop()}`
                        : item.image || '/images/placeholder.png';

                      const getTicketItemQty = (ticket: any, itemName: string): number => {
                        if (!ticket || !ticket.items) return 0;
                        return ticket.items
                          .filter((i: any) => i.name === itemName)
                          .reduce((sum: number, i: any) => sum + i.qty, 0);
                      };
                      const itemQtyInTicket = getTicketItemQty(selectedTicket, item.name);

                      return (
                        <div
                          key={item.id}
                          className={`border rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all group ${
                            itemQtyInTicket > 0
                              ? 'border-[#ffe2ab]/30 bg-[#ffe2ab]/5 shadow-[0_0_15px_rgba(254,226,171,0.03)]'
                              : 'border-white/5 bg-[#161513]/40'
                          }`}
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
                              <span className="font-sans font-bold text-sm text-[#ffe2ab] shrink-0">{formatMoney(item.price)}</span>
                            </div>
                            
                            <p className="text-[11px] text-[#A69984]/70 line-clamp-2 mb-3 h-[32px] overflow-hidden leading-relaxed select-text">
                              {item.description || 'No description available.'}
                            </p>

                            {/* Modifiers / Options selection in card */}
                            {itemModifiersConfig[item.id] && (
                              <div className="space-y-3 mt-1.5 mb-3 border-t border-white/5 pt-2">
                                {itemModifiersConfig[item.id].map((group) => {
                                  const selectedList = catalogModifiers[item.id] || [];
                                  return (
                                    <div key={group.title} className="space-y-1">
                                      <span className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider block">{group.title}</span>
                                      <div className="flex flex-wrap gap-1">
                                        {group.options.map((opt) => {
                                          const isSelected = selectedList.includes(opt.name);
                                          return (
                                            <button
                                              key={opt.name}
                                              type="button"
                                              onClick={() => handleToggleCatalogModifier(item.id, opt.name, group.type, group.title)}
                                              className={`text-[8.5px] font-bold px-2 py-1 rounded transition-all cursor-pointer border ${
                                                isSelected
                                                  ? 'bg-[#ffe2ab]/15 border-[#ffe2ab]/40 text-[#ffe2ab]'
                                                  : 'bg-black/20 border-white/5 text-[#A69984]/70 hover:text-white hover:border-white/10'
                                              }`}
                                            >
                                              {opt.name}
                                              {opt.price ? ` (+${formatMoney(opt.price)})` : ''}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Notes input & add action */}
                          <div className="space-y-2.5 pt-2 border-t border-white/5">
                            <input
                              type="text"
                              placeholder={t('Add kitchen note (e.g. Rare, No onions)', '厨房へのメモを追加 (例: レア、玉ねぎ抜き)')}
                              value={itemNotes[item.id] || ''}
                              onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-white/25 focus:outline-none focus:border-[#ffe2ab]/25 transition-colors"
                            />
                            
                            {itemQtyInTicket > 0 ? (
                              <div className="flex items-center justify-between gap-2 w-full pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQty(selectedTicket.id, item.name, -1)}
                                  className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-0.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[10px]">remove</span>
                                  {t('Remove 1', '1つ減らす')}
                                </button>
                                <span className="px-2.5 py-1 bg-[#ffe2ab]/5 border border-[#ffe2ab]/25 text-[#ffe2ab] rounded-lg font-mono font-bold text-xs select-none">
                                  x{itemQtyInTicket}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const selectedModsNames = catalogModifiers[item.id] || [];
                                    const selectedModsObjects = selectedModsNames.map(name => {
                                      const isAllergy = name.toUpperCase().includes('ALLERGY') || name.toUpperCase().includes('NO GARLIC') || name.toUpperCase().includes('NO NUTS');
                                      const isHighlight = name.toUpperCase().startsWith('NO ') || name.toUpperCase().includes('EXTRA');
                                      return {
                                        text: name,
                                        type: isAllergy ? 'allergy' as const : isHighlight ? 'highlight' as const : 'default' as const
                                      };
                                    });
                                    handleAddItemToTicket(selectedTicket.id, item, itemNotes[item.id], selectedModsObjects);
                                    setItemNotes(prev => ({ ...prev, [item.id]: '' }));
                                  }}
                                  className="flex-1 py-1.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-0.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[10px]">add</span>
                                  {t('Add More', 'さらに追加')}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const selectedModsNames = catalogModifiers[item.id] || [];
                                  const selectedModsObjects = selectedModsNames.map(name => {
                                    const isAllergy = name.toUpperCase().includes('ALLERGY') || name.toUpperCase().includes('NO GARLIC') || name.toUpperCase().includes('NO NUTS');
                                    const isHighlight = name.toUpperCase().startsWith('NO ') || name.toUpperCase().includes('EXTRA');
                                    return {
                                      text: name,
                                      type: isAllergy ? 'allergy' as const : isHighlight ? 'highlight' as const : 'default' as const
                                    };
                                  });
                                  handleAddItemToTicket(selectedTicket.id, item, itemNotes[item.id], selectedModsObjects);
                                  setItemNotes(prev => ({ ...prev, [item.id]: '' }));
                                }}
                                className="w-full py-2 bg-white/5 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] border border-white/10 hover:border-transparent rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">add_circle</span>
                                {t('Add to Order', '注文に追加')}
                              </button>
                            )}
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

      {/* PRINT RECEIPT MODAL */}
      {receiptData && (
        <ReceiptPrintModal
          isOpen={receiptModalOpen}
          onClose={handleReceiptClose}
          receiptData={receiptData}
          formatCurrency={formatMoney}
        />
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
