'use client';

import React, { useState, useEffect } from 'react';
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

export default function OrderStatusPage() {
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // 1 = Received, 2 = Cooking, 3 = Plating, 4 = Ready
  
  const [placedOrder, setPlacedOrder] = useState<{ [itemId: string]: number }>({});
  const [tableNumber, setTableNumber] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);
  const [exclusionsConfig, setExclusionsConfig] = useState({
    maxPrice: 40,
    excludedTags: ['Seafood'],
    showAIConcierge: true,
    enableSelfCheckout: true
  });

  useEffect(() => {
    const savedOrder = localStorage.getItem('dinepos_placed_order');
    if (savedOrder) {
      try {
        setPlacedOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse placed order:', e);
      }
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
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
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

  const isOrderEmpty = !isLoaded || Object.keys(placedOrder).length === 0;

  // Calculations for receipt
  let subtotal = 740;
  if (!isOrderEmpty) {
    subtotal = Object.entries(placedOrder).reduce((acc, [id, qty]) => {
      const item = menuItemsRegistry[id];
      return acc + (item ? item.price * qty : 0);
    }, 0);
  }
  const taxRate = 0.18;
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

  const selectionItems = isOrderEmpty
    ? fallbackItems
    : Object.entries(placedOrder).map(([id, qty], idx) => {
        const registryItem = menuItemsRegistry[id];
        const statusInfo = getStatusInfo(idx, Object.keys(placedOrder).length);
        return {
          id: id,
          name: registryItem ? registryItem.name : 'Gourmet Selection',
          details: `Qty: x${qty} • Prepared fresh`,
          status: statusInfo.status,
          statusType: statusInfo.statusType,
          icon: getItemIcon(registryItem ? registryItem.category : 'mains')
        };
      });

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#f5f5f5] font-sans overflow-hidden antialiased select-none relative">
      
      {/* Sidebar navigation panel */}
      <aside className="w-[280px] h-full flex flex-col justify-between border-r border-white/5 bg-[#0a0a09] flex-shrink-0 z-20">
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
              Table {isLoaded ? tableNumber : 42} • Order #88A92
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
              <div className="h-[120px] w-full relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-8111142154ea?q=80&w=600&auto=format&fit=crop"
                  alt="Chef cooking steak"
                  className="w-full h-full object-cover grayscale brightness-75 select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161513] via-transparent to-transparent"></div>
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
              {selectionItems.map(item => (
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

                  {/* Status Badge */}
                  <div>
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
        <div className="absolute bottom-0 left-0 w-full bg-[#161513] border-t border-white/5 px-10 py-5 flex items-center justify-end gap-4 z-30 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] select-none">
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

      </main>

      {/* VIEW RECEIPT SIDE DRAWER OVERLAY */}
      {showReceipt && (
        <div className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md flex justify-end z-50 animate-fade-in duration-300 flex-none">
          <div className="bg-[#161513] border-l border-white/5 w-full sm:max-w-[460px] h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl animate-slide-in duration-300">
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 select-none">
                <div>
                  <h3 className="font-serif text-2xl text-white font-medium tracking-wide">Itemized Receipt</h3>
                  <p className="text-[#A69984]/50 font-sans text-xs mt-1">Table {isLoaded ? tableNumber : 42} • Invoice #DINE-88A92</p>
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
                {isOrderEmpty ? (
                  <>
                    <div className="flex justify-between items-start py-1">
                      <div className="max-w-[70%]">
                        <div className="font-serif text-sm text-white font-medium tracking-wide">Tasting Menu - Chef's Reserve</div>
                        <div className="text-[#A69984]/50 text-[11px] mt-1 font-semibold">Includes standard wine pairing. Dietary: None</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-bold font-sans">x2</div>
                        <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">$590.00</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start py-1 border-t border-white/5 pt-4">
                      <div className="max-w-[70%]">
                        <div className="font-serif text-sm text-white font-medium tracking-wide">Vintage Champagne Upgrade</div>
                        <div className="text-[#A69984]/50 text-[11px] mt-1 font-semibold">Dom Pérignon 2012</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-bold font-sans">x1</div>
                        <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">$150.00</div>
                      </div>
                    </div>
                  </>
                ) : (
                  Object.entries(placedOrder).map(([id, qty], idx) => {
                    const registryItem = menuItemsRegistry[id];
                    if (!registryItem) return null;
                    return (
                      <div key={id} className={`flex justify-between items-start py-1 ${idx > 0 ? 'border-t border-white/5 pt-4' : ''}`}>
                        <div className="max-w-[70%]">
                          <div className="font-serif text-sm text-white font-medium tracking-wide">{registryItem.name}</div>
                          <div className="text-[#A69984]/50 text-[11px] mt-1 font-semibold">{registryItem.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs font-bold font-sans">x{qty}</div>
                          <div className="text-[#ffe2ab] text-xs font-bold font-sans mt-0.5">${(registryItem.price * qty).toFixed(2)}</div>
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#A69984]/60 font-bold uppercase tracking-wider border-b border-white/5 pb-4">
                <span>Taxes & Fees (18%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2">
                <span className="font-serif text-lg">Total Due</span>
                <span className="text-[#ffe2ab] text-xl font-bold font-serif">${total.toFixed(2)}</span>
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

    </div>
  );
}
