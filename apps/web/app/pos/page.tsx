'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';
import { deductStockForOrder } from '../inventoryUtils';
import { apiRequest, isDemoTenant } from '@/utils/api';
import { usePrinter } from '../printerContext';
import ReceiptPrintModal, { ReceiptData } from '@/components/ui/ReceiptPrintModal';
import { useCashDrawer } from '@/hooks/useCashDrawer';
import CashDrawerPanel from '@/components/pos/CashDrawerPanel';

const ActiveOrdersList = dynamic(() => import('@/components/pos/ActiveOrdersList'), { ssr: false });
const OrderDetailsPanel = dynamic(() => import('@/components/pos/OrderDetailsPanel'), { ssr: false });
const CheckoutModal = dynamic(() => import('@/components/pos/CheckoutModal'), { ssr: false });
const SplitPaymentModal = dynamic(() => import('@/components/pos/SplitPaymentModal'), { ssr: false });
const MenuCatalogModal = dynamic(() => import('@/components/pos/MenuCatalogModal'), { ssr: false });

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
  const { kickCashDrawer } = usePrinter();
  const { expectedBalance, recordCashSale } = useCashDrawer();
  const [drawerPanelOpen, setDrawerPanelOpen] = useState(false);
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
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW' | 'NPR'>('USD');
  const [cashierTheme, setCashierTheme] = useState('gold-obsidian');
  const [cashierScaling, setCashierScaling] = useState('standard');
  const [cashierTipPresets, setCashierTipPresets] = useState<string[]>(['15', '18', '20']);
  const [cashierAutoGratuityPct, setCashierAutoGratuityPct] = useState(20);
  const [cashierAutoGratuityMinCovers, setCashierAutoGratuityMinCovers] = useState(6);
  const [cashierLanguage, setCashierLanguage] = useState('en');
  const [drawerAutoOpen, setDrawerAutoOpen] = useState(true);

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
      if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW', 'NPR'].includes(savedCurrency || '')) {
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

      const savedDrawerAutoOpen = localStorage.getItem('dinepos_cashier_drawer_autoopen');
      if (savedDrawerAutoOpen !== null) setDrawerAutoOpen(savedDrawerAutoOpen !== 'false');

      // Load tickets from dinepos_shared_tickets
      const sharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
      if (sharedTicketsStr) {
        try {
          setTickets(JSON.parse(sharedTicketsStr));
        } catch (e) {
          console.error(e);
          setTickets(isDemoTenant() ? initialTickets : []);
        }
      } else {
        // Real tenants start with an empty floor — no demo orders.
        if (!isDemoTenant()) {
          setTickets([]);
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
            setMenuItems(isDemoTenant() ? defaultMenuItems : []);
          }
        } else {
          // Real tenants start with no pre-built menu — they build their own.
          const menuToUse = isDemoTenant() ? defaultMenuItems : [];
          setMenuItems(menuToUse);
          if (menuToUse.length > 0) {
            localStorage.setItem('dinepos_menu_items', JSON.stringify(menuToUse));
          }
        }

        const savedCategories = localStorage.getItem('dinepos_menu_categories');
        if (savedCategories) {
          try {
            setCategories(JSON.parse(savedCategories));
          } catch (e) {
            console.error('Failed to parse categories:', e);
            setCategories(isDemoTenant() ? defaultCategories : []);
          }
        } else {
          // Real tenants start with no pre-built categories.
          const categoriesToUse = isDemoTenant() ? defaultCategories : [];
          setCategories(categoriesToUse);
          if (categoriesToUse.length > 0) {
            localStorage.setItem('dinepos_menu_categories', JSON.stringify(categoriesToUse));
          }
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

  // Poll active tickets from the database + BroadcastChannel real-time listener
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
    const interval = setInterval(syncActiveTickets, 3000);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('dinepos_kds_realtime');
        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_ORDER_DISPATCH') {
            syncActiveTickets();
          }
        };
      }
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
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

      // Auto-kick cash drawer on cash payments if enabled and log movement
      if (checkoutPaymentMethod.toUpperCase() === 'CASH') {
        recordCashSale(grandTotal + tipAmount, selectedTicket.id);
        if (drawerAutoOpen) {
          kickCashDrawer().catch(err => {
            console.error('[POS] Cash drawer kick failed:', err);
          });
        }
      }
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

    });
  }, [tickets, searchQuery, quickFilter]);

  const appliedPromo = appliedDiscount?.type === 'promo' && appliedDiscount.promoCode
    ? VALID_PROMO_CODES[appliedDiscount.promoCode]
    : null;

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCategory = (catA?: string, catB?: string): boolean => {
        if (!catA || !catB) return false;
        if (catB === 'all') return true;
        const a = catA.trim().toLowerCase();
        const b = catB.trim().toLowerCase();
        if (a === b) return true;
        if ((a === 'starters' || a === 'starter') && (b === 'starters' || b === 'starter')) return true;
        if ((a === 'mains' || a === 'main' || a === 'main course') && (b === 'mains' || b === 'main' || b === 'main course')) return true;
        if ((a === 'desserts' || a === 'dessert') && (b === 'desserts' || b === 'dessert')) return true;
        if ((a === 'drinks' || a === 'drink') && (b === 'drinks' || b === 'drink')) return true;
        if ((a === 'special' || a === 'our special') && (b === 'special' || b === 'our special')) return true;
        if ((a === 'combos' || a === 'combo set' || a === 'combo') && (b === 'combos' || b === 'combo set' || b === 'combo')) return true;
        return false;
      };
      const matchesCategory = activeCategory === 'all' || matchCategory(item.category, activeCategory);
      const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, menuSearchQuery]);

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
            href="/login?logout=true"
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
            <button
              type="button"
              onClick={() => setDrawerPanelOpen(true)}
              className="flex items-center gap-2 bg-[#161513] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#ffe2ab] hover:text-white hover:bg-white/5 hover:border-white/10 transition-all font-sans cursor-pointer font-bold uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm leading-none">point_of_sale</span>
              <span>Drawer ({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance)})</span>
            </button>
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
          <ActiveOrdersList
            t={t}
            mobileView={mobileView}
            setMobileView={setMobileView}
            quickFilter={quickFilter}
            setQuickFilter={setQuickFilter}
            filteredTickets={filteredTickets}
            selectedTicketId={selectedTicketId}
            setSelectedTicketId={setSelectedTicketId}
            taxType={taxType}
            getTicketCardAmount={getTicketCardAmount}
            formatMoney={formatMoney}
          />
          {/* RIGHT COLUMN: Selected Order Ticket Details */}
          {selectedTicket ? (
            <OrderDetailsPanel
              t={t}
              currency={currency}
              selectedTicket={selectedTicket}
              isProcessing={isProcessing}
              handleUpdateItemQty={handleUpdateItemQty}
              handleRemoveItem={handleRemoveItem}
              handleProcessPayment={handleProcessPayment}
              mobileView={mobileView}
              setMobileView={setMobileView}
              setActiveCategory={setActiveCategory}
              setMenuSearchQuery={setMenuSearchQuery}
              setItemNotes={setItemNotes}
              setMenuModalOpen={setMenuModalOpen}
              getItemPrice={getItemPrice}
              taxType={taxType}
              subtotal={subtotal}
              tax={tax}
              gratuity={gratuity}
              discountAmount={discountAmount}
              appliedDiscount={appliedDiscount}
              grandTotal={grandTotal}
              cashierAutoGratuityPct={cashierAutoGratuityPct}
              handleUpdateGratuityRate={handleUpdateGratuityRate}
            />          ) : (
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
        <CheckoutModal
          t={t}
          currency={currency}
          checkoutModalOpen={checkoutModalOpen}
          setCheckoutModalOpen={setCheckoutModalOpen}
          selectedTicket={selectedTicket}
          checkoutPaymentMethod={checkoutPaymentMethod}
          setCheckoutPaymentMethod={setCheckoutPaymentMethod}
          customerDetailsVisible={customerDetailsVisible}
          setCustomerDetailsVisible={setCustomerDetailsVisible}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          discountSettingsVisible={discountSettingsVisible}
          setDiscountSettingsVisible={setDiscountSettingsVisible}
          promoCodeInput={promoCodeInput}
          setPromoCodeInput={setPromoCodeInput}
          appliedPromo={appliedPromo}
          handleApplyPromoCode={computeApplyDiscount}
          handleRemovePromoCode={handleRemoveDiscount}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          discountFixed={discountFixed}
          setDiscountFixed={setDiscountFixed}
          tipsVisible={tipsVisible}
          setTipsVisible={setTipsVisible}
          tipMode={tipMode}
          setTipMode={setTipMode}
          cashierTipPresets={cashierTipPresets}
          customTipAmount={customTipAmount}
          setCustomTipAmount={setCustomTipAmount}
          notesVisible={notesVisible}
          setNotesVisible={setNotesVisible}
          checkoutNotes={checkoutNotes}
          setCheckoutNotes={setCheckoutNotes}
          isProcessing={isProcessing}
          handleProcessCheckoutSubmit={handleCompleteCheckout}
          handleSplitBill={handleSplitBill}
        />
      )}
      {/* CASHIER SPLIT CHECK CALCULATOR MODAL */}
      {splitModalOpen && selectedTicket && (
        <SplitPaymentModal
          t={t}
          currency={currency}
          splitModalOpen={splitModalOpen}
          setSplitModalOpen={setSplitModalOpen}
          selectedTicket={selectedTicket}
          splitMethod={splitMethod}
          setSplitMethod={setSplitMethod}
          splitGuestCount={splitGuestCount}
          setSplitGuestCount={setSplitGuestCount}
          splitPaidGuests={splitPaidGuests}
          setSplitPaidGuests={setSplitPaidGuests}
          splitItemAssignments={splitItemAssignments}
          setSplitItemAssignments={setSplitItemAssignments}
          updateTicketSplits={updateTicketSplits}
          triggerToast={triggerToast}
          checkoutPaymentMethod={checkoutPaymentMethod}
          tipAmount={tipAmount}
          getItemPrice={getItemPrice}
        />
      )}
      {/* DIGITAL MENU CATALOG MODAL */}
      {menuModalOpen && selectedTicket && (
        <MenuCatalogModal
          t={t}
          currency={currency}
          menuModalOpen={menuModalOpen}
          setMenuModalOpen={setMenuModalOpen}
          selectedTicket={selectedTicket}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          menuSearchQuery={menuSearchQuery}
          setMenuSearchQuery={setMenuSearchQuery}
          filteredMenuItems={filteredMenuItems}
          menuItems={menuItems}
          handleAddItemToTicket={handleAddItemToTicket}
          handleUpdateItemQty={handleUpdateItemQty}
          handleToggleCatalogModifier={handleToggleCatalogModifier}
          itemModifiersConfig={itemModifiersConfig}
          catalogModifiers={catalogModifiers}
          setCatalogModifiers={setCatalogModifiers}
          itemNotes={itemNotes}
          setItemNotes={setItemNotes}
        />
      )}
      {/* CASH DRAWER PANEL */}
      <CashDrawerPanel
        isOpen={drawerPanelOpen}
        onClose={() => setDrawerPanelOpen(false)}
      />

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
