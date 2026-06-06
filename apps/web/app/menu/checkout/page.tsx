'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

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
}

interface DisplayCartItem {
  name: string;
  quantity: number;
  price: number;
  modifiers: string[];
  course: 'starter' | 'main' | 'dessert' | 'drinks';
  details?: string[];
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

export default function CheckoutPage() {
  // Guest Information state
  const [firstName, setFirstName] = useState('Alexander');
  const [lastName, setLastName] = useState('Sterling');
  const [email, setEmail] = useState('alexander.s@example.com');
  const [specialRequests, setSpecialRequests] = useState('Celebrating anniversary.');

  // Payment Selection state: 'cash' | 'card' | 'digital'
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('ALEXANDER STERLING');

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

  // Toast notifications feedback
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');
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
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
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

  const migrateCart = (savedCartData: any): { [cartKey: string]: CartItem } => {
    if (!savedCartData) return {};
    try {
      const parsed = typeof savedCartData === 'string' ? JSON.parse(savedCartData) : savedCartData;
      const migrated: { [cartKey: string]: CartItem } = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const course = key.startsWith('start-') ? 'starter' : key.startsWith('dess-') ? 'dessert' : key.startsWith('drink-') ? 'drinks' : 'main';
          const newKey = `${key}--${course}`;
          migrated[newKey] = {
            itemId: key,
            quantity: value,
            modifiers: [],
            course: course
          };
        } else if (value && typeof value === 'object' && 'itemId' in (value as any)) {
          migrated[key] = value as CartItem;
        }
      });
      return migrated;
    } catch (e) {
      console.error('Cart migration failed:', e);
      return {};
    }
  };

  useEffect(() => {
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
    if (savedTable) {
      setTableNumber(parseInt(savedTable, 10) || 12);
    }
    setIsLoaded(true);
  }, []);

  const isCartEmpty = !isLoaded || Object.keys(cart).length === 0;

  // Render items based on cart
  const getDisplayItems = (): DisplayCartItem[] => {
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
        details: item ? [
          ...(cartItem.modifiers.length > 0 ? [cartItem.modifiers.join(', ')] : []),
          `Course: ${cartItem.course.toUpperCase()}`
        ] : []
      };
    });
  };

  // Calculations
  const subtotal = getDisplayItems().reduce((acc, item) => acc + item.price, 0);
  const taxRate = 0.08875; // 8.875% tax matching mockup
  const tax = taxType === 'pre-tax' 
    ? subtotal * taxRate 
    : subtotal - (subtotal / (1 + taxRate));
  const autoGratuityRate = 0.20; // 20% auto gratuity matching mockup
  const autoGratuity = subtotal * autoGratuityRate;
  const total = taxType === 'pre-tax' 
    ? subtotal + tax + autoGratuity 
    : subtotal + autoGratuity;

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
    if (paymentMethod === 'cash' && parsedTendered < total) {
      triggerToast('Tendered amount is less than total due!', 'info');
      return;
    }
    setIsProcessing(true);
    setProcessingStep(1);
    
    // Simulate high-end financial transaction pipeline
    setTimeout(() => {
      setProcessingStep(2);
      setTimeout(() => {
        setProcessingStep(3);
        // Clean up cart and placed order upon successful payment validation
        localStorage.removeItem('dinepos_cart');
        localStorage.removeItem('dinepos_placed_order');
      }, 1200);
    }, 1000);
  };

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
    <div className="min-h-screen bg-[#0e0e0d] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none flex flex-col justify-between">
      
      <div className="flex-grow flex flex-col md:flex-row w-full min-h-screen">
        
        {/* LEFT COLUMN: ORDER DETAIL SIDEBAR (Span 4) */}
        <aside className="w-full md:w-[380px] bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between p-8 flex-shrink-0 z-10">
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
                      Order #1042
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#ffe2ab]/80 font-bold uppercase tracking-wider mt-2 select-none">
                      <span className="material-symbols-outlined text-[15px] font-bold">restaurant</span>
                      Table {displayTableNumber} • 2 Guests
                    </div>
                  </div>

                  {/* Profile icon */}
                  <button 
                    onClick={() => triggerToast('Viewing customer profile details...', 'info')}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">person_outline</span>
                  </button>
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
                              </div>
                              <div className="text-white/90 text-xs font-bold font-mono tracking-wider shrink-0">
                                ${item.price.toFixed(2)}
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
                    <span className="text-white/80 font-bold font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{taxType === 'post-tax' ? 'Included Tax' : 'Tax'} (8.875%)</span>
                    <span className="text-white/80 font-bold font-mono">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auto-Gratuity (20%)</span>
                    <span className="text-white/80 font-bold font-mono">${autoGratuity.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dotted split */}
                <div className="border-t border-dashed border-white/5 pt-4"></div>

                {/* Total Due */}
                <div className="flex justify-between items-baseline select-none">
                  <span className="text-xs text-[#A69984] font-bold uppercase tracking-wider">TOTAL DUE</span>
                  <span className="text-[34px] font-bold text-[#ffe2ab] font-serif tracking-wider">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* RIGHT COLUMN: PAYMENT INTERFACE (Span 8) */}
        <main className="flex-grow flex flex-col justify-between p-8 md:p-12 relative bg-[#0e0e0d]">
          <div>
            {/* Top Toolbar Navigation */}
            <div className="flex justify-between items-center select-none mb-8">
              <Link 
                href="/menu" 
                className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#ffe2ab] hover:text-[#ffdca0] transition-colors"
              >
                <span className="material-symbols-outlined text-[13px] font-black leading-none">arrow_back</span>
                Return to Table
              </Link>
              
              {/* Action utilities */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSplitOpen(true)}
                  disabled={isCartEmpty}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-[#A69984]/25 flex items-center justify-center text-white/70 hover:text-white hover:border-[#ffe2ab]/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg leading-none">split_screen</span>
                </button>
                <button 
                  onClick={() => triggerToast('Loading payment menu options...', 'info')}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg leading-none">more_vert</span>
                </button>
              </div>
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
                {/* Payment Method Switcher Tabs */}
                <div className="grid grid-cols-3 bg-[#161513] border border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner select-none max-w-xl mx-auto mb-10 font-sans">
                  {(['cash', 'card', 'digital'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10.5px] font-bold uppercase tracking-widest transition-all cursor-pointer ${paymentMethod === method ? 'bg-white/5 border border-white/10 text-white shadow-md' : 'text-[#A69984]/50 hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {method === 'cash' ? 'payments' : method === 'card' ? 'credit_card' : 'tap_and_play'}
                      </span>
                      {method}
                    </button>
                  ))}
                </div>

            {/* Dynamic Payment Tab content panes */}
            <div className="max-w-xl mx-auto">
              
              {/* TAB 1: CASH PAYMENT MODE */}
              {paymentMethod === 'cash' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in duration-300">
                  
                  {/* Cash display & Change due (Left span 5) */}
                  <div className="md:col-span-5 space-y-6 font-sans">
                    
                    {/* Amount Tendered field */}
                    <div className="space-y-2.5">
                      <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider">Amount Tendered</label>
                      <div className="w-full bg-black border border-[#ffe2ab]/40 rounded-xl px-4 py-4.5 flex items-center justify-center text-[#ffe2ab] shadow-inner select-none font-serif text-[28px] font-bold tracking-widest">
                        <span className="mr-2 opacity-50">$</span>
                        {parseFloat(tenderedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Change Due field */}
                    <div className="flex justify-between items-baseline select-none border-t border-white/5 pt-5 px-1 font-serif text-sm">
                      <span className="text-[#A69984]/70">Change Due</span>
                      <span className="text-white text-lg font-bold tracking-wide">
                        ${changeDue.toFixed(2)}
                      </span>
                    </div>

                    {/* Quick tender buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {quickCashOptions.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setTenderedAmount(opt.value.toFixed(2))}
                          className="py-3 bg-transparent border border-white/5 hover:border-white/15 text-white/95 hover:bg-white/[0.01] rounded-xl font-sans font-bold text-[10.5px] tracking-wide transition-all cursor-pointer select-none"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Numeric Keypad Panel (Right span 7) */}
                  <div className="md:col-span-7 bg-[#161513] border border-white/5 rounded-2xl p-4.5 shadow-xl select-none">
                    <div className="grid grid-cols-3 gap-2">
                      
                      {/* Rows 1-3 */}
                      {(['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const).map(num => (
                        <button
                          key={num}
                          onClick={() => handleKeypress(num)}
                          className="aspect-square bg-transparent hover:bg-white/[0.02] border border-white/5 active:bg-[#ffe2ab]/10 rounded-xl flex items-center justify-center text-white font-serif text-lg font-bold cursor-pointer transition-colors"
                        >
                          {num}
                        </button>
                      ))}

                      {/* Row 4: Clear, 0, Backspace */}
                      <button
                        onClick={() => handleKeypress('CLEAR')}
                        className="aspect-square bg-white/5 hover:bg-white/10 active:bg-white/25 rounded-xl flex items-center justify-center text-[#A69984] font-sans font-bold text-[9.5px] uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => handleKeypress('0')}
                        className="aspect-square bg-transparent hover:bg-white/[0.02] border border-white/5 active:bg-[#ffe2ab]/10 rounded-xl flex items-center justify-center text-white font-serif text-lg font-bold cursor-pointer transition-colors"
                      >
                        0
                      </button>
                      <button
                        onClick={() => handleKeypress('backspace')}
                        className="aspect-square bg-white/5 hover:bg-white/10 active:bg-white/25 rounded-xl flex items-center justify-center text-[#A69984] cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">backspace</span>
                      </button>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: CREDIT CARD PAYMENT MODE */}
              {paymentMethod === 'card' && (
                <div className="bg-[#161513] border border-white/5 rounded-2xl p-7 shadow-xl space-y-5 animate-fade-in duration-300">
                  <div className="space-y-4 font-sans select-none">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Card Number</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-[#A69984]/40 text-base">credit_card</span>
                        <input 
                          type="text" 
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono tracking-widest"
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
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Cvc</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="123"
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-2">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium uppercase font-sans tracking-wide"
                        placeholder="ALEXANDER STERLING"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIGITAL WALLET PAYMENT MODE */}
              {paymentMethod === 'digital' && (
                <div className="bg-[#161513] border border-white/5 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6 select-none animate-fade-in duration-300 min-h-[250px]">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#ffe2ab] animate-pulse">
                    <span className="material-symbols-outlined text-3xl font-light">tap_and_play</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-base text-white font-medium tracking-wide">Aura Pay & Digital Wallets</h4>
                    <p className="text-[#A69984]/50 font-sans text-xs mt-2 leading-relaxed max-w-xs mx-auto">
                      Scan the digital ticket with Apple Pay, Google Pay, or tap device against reader.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md border border-white/10 animate-fade-in">
                    {/* Simulated QR Code SVG */}
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" className="text-black">
                      <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="2.5" y="2.5" width="3" height="3" fill="currentColor"/>
                      <rect x="17" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="18.5" y="2.5" width="3" height="3" fill="currentColor"/>
                      <rect x="1" y="17" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="2.5" y="18.5" width="3" height="3" fill="currentColor"/>
                      <rect x="9" y="1" width="2" height="2" fill="currentColor"/>
                      <rect x="13" y="2" width="2" height="1" fill="currentColor"/>
                      <rect x="9" y="9" width="3" height="3" fill="currentColor"/>
                      <rect x="17" y="9" width="2" height="2" fill="currentColor"/>
                      <rect x="9" y="17" width="2" height="2" fill="currentColor"/>
                      <rect x="13" y="18" width="2" height="2" fill="currentColor"/>
                      <rect x="18" y="17" width="4" height="4" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
          </div>

          {/* Footer Action buttons row */}
          {!isCartEmpty && (
            <div className="max-w-xl mx-auto w-full flex justify-end items-center gap-6 mt-12 border-t border-white/5 pt-8 select-none font-sans">
              <Link 
                href="/menu"
                className="text-[#A69984] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </Link>

              <button 
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="px-8 py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 disabled:cursor-not-allowed text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all duration-300 shadow-[0_4px_24px_rgba(255,226,171,0.15)] hover:scale-[1.01] cursor-pointer"
              >
                Confirm & Pay
                <span className="material-symbols-outlined text-base font-black">check</span>
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
                <p className="text-[10px] text-[#A69984]/50 font-sans font-bold uppercase tracking-wider mt-1">Table {displayTableNumber} • Total Due: ${total.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setIsSplitOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
            </div>

            {/* Split Method switcher tabs */}
            <div className="grid grid-cols-2 bg-[#0e0e0d] border border-white/5 rounded-xl p-1 gap-1 mb-6 font-sans shrink-0">
              <button
                onClick={() => setSplitMethod('evenly')}
                className={`py-2 px-4 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${splitMethod === 'evenly' ? 'bg-white/5 text-white' : 'text-[#A69984]/50 hover:text-white'}`}
              >
                Split Evenly
              </button>
              <button
                onClick={() => setSplitMethod('by-item')}
                className={`py-2 px-4 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${splitMethod === 'by-item' ? 'bg-white/5 text-white' : 'text-[#A69984]/50 hover:text-white'}`}
              >
                Split By Item
              </button>
            </div>

            {/* Content area based on method */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {splitMethod === 'evenly' ? (
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
                              <div className="font-serif text-lg font-bold mt-1">${shareTotal.toFixed(2)}</div>
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
              ) : (
                <div className="space-y-6 font-sans">
                  {/* Guest count selector */}
                  <div className="flex justify-between items-center bg-[#0e0e0d] border border-white/5 p-4 rounded-xl">
                    <span className="text-xs text-[#A69984] font-bold uppercase tracking-wider">Split Parties</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setGuestCount(prev => Math.max(2, prev - 1));
                          setItemAssignments({});
                          setPaidGuests([]);
                        }}
                        disabled={guestCount <= 2}
                        className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">remove</span>
                      </button>
                      <span className="text-white font-serif font-bold w-12 text-center">{guestCount}</span>
                      <button 
                        onClick={() => {
                          setGuestCount(prev => Math.min(6, prev + 1));
                          setItemAssignments({});
                          setPaidGuests([]);
                        }}
                        disabled={guestCount >= 6}
                        className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Itemized assignment list */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block">Assign Items to Guests</span>
                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                      {getDisplayItems().map((item, idx) => {
                        const assignedGuest = itemAssignments[idx] ?? -1;
                        return (
                          <div key={idx} className="p-4 bg-[#0e0e0d] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="max-w-[50%]">
                              <div className="text-xs text-white font-bold">{item.quantity}x {item.name}</div>
                              <div className="text-[10px] text-[#A69984]/50 font-medium font-mono mt-1">${item.price.toFixed(2)}</div>
                            </div>
                            
                            {/* Guest selector circles */}
                            <div className="flex items-center gap-1.5">
                              {/* Shared circle */}
                              <button
                                onClick={() => setItemAssignments(prev => ({ ...prev, [idx]: -1 }))}
                                className={`w-8 h-8 rounded-full font-bold text-[9px] uppercase transition-all cursor-pointer ${assignedGuest === -1 ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'bg-white/5 border border-white/5 text-[#A69984]'}`}
                                title="Split evenly among all guests"
                              >
                                Shr
                              </button>
                              {/* Guest circles */}
                              {Array.from({ length: guestCount }).map((_, gIdx) => {
                                const guestLetter = String.fromCharCode(65 + gIdx);
                                return (
                                  <button
                                    key={gIdx}
                                    onClick={() => setItemAssignments(prev => ({ ...prev, [idx]: gIdx }))}
                                    className={`w-8 h-8 rounded-full font-bold text-[10px] transition-all cursor-pointer ${assignedGuest === gIdx ? 'bg-white/10 border border-white/35 text-white' : 'bg-transparent border border-white/5 text-[#A69984]/40 hover:text-white'}`}
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
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block">Calculated Totals</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {guestTotals.map((gTotal, gIdx) => {
                        const guestLetter = String.fromCharCode(65 + gIdx);
                        const isPaid = paidGuests.includes(gIdx);
                        return (
                          <div key={gIdx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-white'}`}>
                            <div>
                              <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">Guest {guestLetter}</div>
                              <div className="font-serif text-lg font-bold mt-1">${gTotal.total.toFixed(2)}</div>
                              <div className="text-[9px] text-[#A69984]/50 mt-0.5 leading-none">Sub: ${gTotal.subtotal.toFixed(2)} • Tax: ${gTotal.tax.toFixed(2)}</div>
                            </div>
                            <button
                              onClick={() => {
                                if (isPaid) {
                                  setPaidGuests(prev => prev.filter(g => g !== gIdx));
                                } else {
                                  setPaidGuests(prev => [...prev, gIdx]);
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
              )}
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
                Table {displayTableNumber} • Invoice #DINE-88A92 • ${total.toFixed(2)}
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
