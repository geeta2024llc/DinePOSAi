'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { migrateCart } from '../cartUtils';
import { usePrinter } from '../../printerContext';

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

export default function ReceiptPreviewPage() {
  const [activeTab, setActiveTab] = useState<'invoice' | 'receipt'>('receipt');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');
  const [diningOption, setDiningOption] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [taxRateDineIn, setTaxRateDineIn] = useState(0.10);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(0.08);
  const [taxRateDelivery, setTaxRateDelivery] = useState(0.08);

  // Dynamic receipt states
  const [cart, setCart] = useState<{ [cartKey: string]: CartItem }>({});
  const [tableNumber, setTableNumber] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restaurant branding (from admin settings)
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('DinePosAi');
  const [restaurantAddress, setRestaurantAddress] = useState('1200 Gastronomy Way, Suite 400\nNew York, NY 10001');
  const [showLogoOnReceipt, setShowLogoOnReceipt] = useState(true);

  const { config: printerConfig, status: printerStatus, logs: printerLogs, printReceipt: dispatchPrintReceipt, setConfig: setPrinterConfig, scanAndPair } = usePrinter();

  // Bluetooth print console logs states
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);

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

      // Restaurant branding
      const savedLogo = localStorage.getItem('dinepos_restaurant_logo');
      if (savedLogo) setRestaurantLogo(savedLogo);
      const savedName = localStorage.getItem('dinepos_establishment_name');
      if (savedName) setRestaurantName(savedName);
      const savedAddr = localStorage.getItem('dinepos_business_address');
      if (savedAddr) setRestaurantAddress(savedAddr);
      const savedShowLogo = localStorage.getItem('dinepos_receipt_show_logo');
      if (savedShowLogo === 'false') setShowLogoOnReceipt(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_restaurant_logo') {
        setRestaurantLogo(e.newValue || null);
      }
      if (e.key === 'dinepos_establishment_name' && e.newValue) {
        setRestaurantName(e.newValue);
      }
      if (e.key === 'dinepos_business_address' && e.newValue) {
        setRestaurantAddress(e.newValue);
      }
      if (e.key === 'dinepos_receipt_show_logo') {
        setShowLogoOnReceipt(e.newValue !== 'false');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // migrateCart helper is imported from cartUtils

  useEffect(() => {
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

    // Load placed order or cart contents
    const savedOrder = localStorage.getItem('dinepos_placed_order') || localStorage.getItem('dinepos_cart');
    if (savedOrder) {
      setCart(migrateCart(savedOrder));
    }
    const savedTable = localStorage.getItem('dinepos_table_number');
    if (savedTable) {
      setTableNumber(parseInt(savedTable, 10) || 12);
    }
    setIsLoaded(true);
  }, []);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const isCartEmpty = !isLoaded || Object.keys(cart).length === 0;

  // Dynamic calculations
  const subtotal = isCartEmpty
    ? 740.00
    : Object.values(cart).reduce((acc, ci) => {
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
        return acc + singlePrice * ci.quantity;
      }, 0);

  const taxRate = diningOption === 'takeaway'
    ? taxRateTakeaway
    : diningOption === 'delivery'
      ? taxRateDelivery
      : taxRateDineIn;
  const tax = taxType === 'pre-tax' ? subtotal * taxRate : subtotal - (subtotal / (1 + taxRate));
  const serviceCharge = isCartEmpty ? 148.00 : subtotal * 0.20; // 20% Auto-Gratuity aligned with checkout
  const total = taxType === 'pre-tax' ? subtotal + tax + serviceCharge : subtotal + serviceCharge;

  const formatPrintData = () => {
    const items = isCartEmpty
      ? [
          { name: "Tasting Menu - Chef's Reserve", quantity: 2, price: 295.00, course: 'main' },
          { name: "Vintage Champagne Upgrade", quantity: 1, price: 150.00, course: 'drinks' }
        ]
      : Object.entries(cart).map(([key, ci]) => {
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
          return {
            name: item ? item.name : 'Unknown Item',
            quantity: ci.quantity,
            price: (item ? item.price : 0) + modifierExtra,
            modifiers: ci.modifiers,
            notes: ci.notes,
            course: ci.course
          };
        });

    return {
      tableNumber,
      orderId: 'DP-88392',
      items,
      subtotal,
      taxRate,
      tax,
      taxType,
      serviceCharge,
      total,
      isPaid: activeTab === 'receipt',
      paymentMethod: 'Credit Card',
      authCode: '4242'
    };
  };

  const handleDirectPrint = async () => {
    try {
      await dispatchPrintReceipt({
        ...formatPrintData(),
        // Force browser print for direct print button
      });
      triggerToast('Direct Print completed.');
    } catch (e: any) {
      triggerToast(`Print failed: ${e.message || e}`);
    }
  };

  const handleSavePdf = async () => {
    triggerToast('Generating PDF document... Download started.');
    
    // Dynamically load html2pdf.js from CDN
    const loadLibrary = () => {
      return new Promise<any>((resolve) => {
        if ((window as any).html2pdf) {
          resolve((window as any).html2pdf);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve((window as any).html2pdf);
        document.body.appendChild(script);
      });
    };

    try {
      const html2pdf = await loadLibrary();
      const element = document.getElementById('printable-receipt');
      if (!element) return;
      
      const opt = {
        margin:       15,
        filename:     `DinePOS_Receipt_Table_${tableNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (e: any) {
      console.error(e);
      triggerToast(`PDF generation error: ${e.message || e}`);
    }
  };

  const handleBluetoothPrint = async () => {
    setIsBluetoothModalOpen(true);
    const originalConfig = { ...printerConfig };
    try {
      // Switch to bluetooth if not already configured
      if (printerConfig.type !== 'bluetooth') {
        triggerToast('Scanning for Bluetooth printer...');
        await scanAndPair('bluetooth');
      }
      await dispatchPrintReceipt(formatPrintData());
      triggerToast('Print job dispatched via Bluetooth.');
    } catch (e: any) {
      triggerToast(`Bluetooth print error: ${e.message || e}`);
    } finally {
      // Restore original printer config
      setPrinterConfig(originalConfig);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between items-center py-12 px-6 overflow-x-hidden select-none font-sans antialiased text-[#e5e2e1]">
      
      {/* Media print style overrides so only the white receipt card prints */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Blurred laptop backdrop background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1496181130204-755241544e35?q=80&w=1200&auto=format&fit=crop"
          alt="Blurred workspace laptop" 
          className="w-full h-full object-cover filter blur-[6px] brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Top Header */}
      <header className="w-full max-w-lg flex justify-between items-center z-10 select-none flex-shrink-0 mb-6">
        {/* Brand logo at top left */}
        <Link href="/menu" className="font-serif font-bold text-[#ffe2ab] text-xl tracking-wide block hover:opacity-85 transition-opacity leading-none">
          DinePosAi
        </Link>

        {/* Tab Switcher */}
        <div className="flex bg-[#161513]/90 border border-white/5 rounded-full p-1 shadow-inner gap-0.5 select-none">
          <button 
            onClick={() => setActiveTab('invoice')}
            className={`px-4 py-2 rounded-full font-sans text-[10.5px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${activeTab === 'invoice' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 hover:text-white'}`}
          >
            Preview Invoice
          </button>
          <button 
            onClick={() => setActiveTab('receipt')}
            className={`px-4 py-2 rounded-full font-sans text-[10.5px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${activeTab === 'receipt' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 hover:text-white'}`}
          >
            Preview Receipt
          </button>
        </div>
      </header>

      {/* Center White Receipt Document Container */}
      <main id="printable-receipt" className="w-full max-w-[340px] bg-white text-[#1c1c1c] rounded-2xl p-6 sm:p-7 shadow-2xl z-10 flex flex-col justify-between flex-grow-0 mb-10 transform scale-[1.01]">
        
        {/* Header details */}
        <div className="text-center mb-4 select-none">
          {isCartEmpty && (
            <div className="mb-4 bg-amber-50 border-2 border-amber-400 text-amber-950 text-[10px] font-sans font-black uppercase tracking-wider py-2 px-3 rounded-lg shadow-sm">
              ⚠️ Showing Sample Receipt
            </div>
          )}
          {/* Restaurant Logo */}
          {showLogoOnReceipt && restaurantLogo && (
            <div className="flex justify-center mb-3">
              <img
                src={restaurantLogo}
                alt="Restaurant logo"
                className="max-h-16 max-w-[120px] object-contain"
                style={{ printColorAdjust: 'exact' } as React.CSSProperties}
              />
            </div>
          )}
          <h2 className="font-sans font-black text-2xl tracking-tight text-black mb-1 uppercase">{restaurantName}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[2px] w-8 bg-black"></div>
            <span className="font-sans font-black text-[9px] text-black tracking-[0.2em] uppercase">Aura Hospitality Group</span>
            <div className="h-[2px] w-8 bg-black"></div>
          </div>
          <div className="font-sans text-[11px] text-black font-extrabold leading-tight">
            {restaurantAddress.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>

        {/* Ticket Metadata bordered by solid black box */}
        <div className="border-2 border-black p-3 my-3 font-sans text-[11px] font-black text-black select-none rounded-lg bg-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-black font-black uppercase text-xs">TABLE {tableNumber}</div>
              <div className="text-[10px] text-black font-extrabold mt-0.5">TERMINAL 01</div>
              <div className="text-[10px] text-black font-extrabold">SERVER: JULIAN B.</div>
            </div>
            
            <div className="text-right">
              <div className="font-black text-xs">MAY 24, 2024</div>
              <div className="text-[10px] text-black font-extrabold mt-0.5">20:42 PM</div>
              <div className="text-[10px] text-black font-black mt-0.5 uppercase">ORDER #DP-88392</div>
            </div>
          </div>
        </div>

        {/* Item listing */}
        <div className="space-y-3 font-sans py-2 border-t-2 border-black">
          {isCartEmpty ? (
            <>
              {/* Row 1 */}
              <div className="flex justify-between items-start py-1 border-b border-black/20">
                <div className="max-w-[70%]">
                  <div className="text-xs text-black font-black">Tasting Menu - Chef's Reserve</div>
                  <div className="text-[10px] text-black font-extrabold mt-0.5">x2 @ $295.00 each</div>
                </div>
                <div className="text-right text-xs text-black font-black">$590.00</div>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between items-start py-1 border-b border-black/20">
                <div className="max-w-[70%]">
                  <div className="text-xs text-black font-black">Vintage Champagne Upgrade</div>
                  <div className="text-[10px] text-black font-extrabold mt-0.5">x1 @ $150.00 each</div>
                </div>
                <div className="text-right text-xs text-black font-black">$150.00</div>
              </div>
            </>
          ) : (
            Object.entries(cart).map(([cartKey, ci]) => {
              const item = menuItemsRegistry[ci.itemId];
              if (!item) return null;

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
              const singlePrice = item.price + modifierExtra;
              const rowTotal = singlePrice * ci.quantity;

              return (
                <div key={cartKey} className="flex flex-col gap-1 py-1.5 border-b border-black/15 last:border-0 select-none">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[75%]">
                      <div className="text-xs text-black font-black leading-tight">{item.name} <span className="text-[10px] font-black">[x{ci.quantity}]</span></div>
                      {ci.modifiers.length > 0 && (
                        <div className="text-[9px] text-white bg-black px-1.5 py-0.5 rounded inline-block mt-1 font-black font-sans uppercase">
                          + {ci.modifiers.join(', ')}
                        </div>
                      )}
                      {ci.notes && (
                        <div className="text-[9.5px] text-black font-extrabold font-sans mt-1 flex items-start gap-1">
                          <span className="material-symbols-outlined text-[11px] shrink-0 select-none font-bold">edit_note</span>
                          <span>NOTE: "{ci.notes}"</span>
                        </div>
                      )}
                      <div className="text-[9.5px] text-black font-bold mt-1 flex gap-2 items-center">
                        <span>@ ${singlePrice.toFixed(2)} each</span>
                        <span className="uppercase text-[8px] bg-black text-white px-1 rounded font-black font-sans">[{ci.course}]</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-black font-black shrink-0">${rowTotal.toFixed(2)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Calculations summary */}
        <div className="border-t-2 border-black pt-3 mt-2 space-y-2 font-sans select-none text-[11.5px] font-extrabold text-black">
          <div className="flex justify-between">
            <span>{taxType === 'post-tax' ? 'SUBTOTAL (TAX INCL.)' : 'SUBTOTAL'}</span>
            <span className="text-black font-black">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{taxType === 'post-tax' ? 'INCLUDED TAX' : 'SALES TAX'} ({(taxRate * 100).toFixed(1)}%)</span>
            <span className="text-black font-black">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>AUTO-GRATUITY (20%)</span>
            <span className="text-black font-black">${serviceCharge.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Paid / Balance Due High-Contrast Block */}
        <div className="border-3 border-black bg-black text-white p-3 my-3 flex justify-between items-center font-sans select-none rounded-lg shadow-sm" style={{ printColorAdjust: 'exact' } as React.CSSProperties}>
          <span className="text-xs font-black uppercase tracking-wider text-white">
            {activeTab === 'receipt' ? 'TOTAL PAID' : 'BALANCE DUE'}
          </span>
          <span className="font-sans text-2xl font-black text-white tracking-tight leading-none">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Payment Confirmation / Status Box */}
        <div className="border-2 border-black p-3 rounded-lg font-sans select-none text-center bg-white">
          {activeTab === 'receipt' ? (
            <>
              <div className="text-[11px] text-black font-black uppercase tracking-wider mb-1">*** PAYMENT CONFIRMED ***</div>
              <div className="flex justify-center gap-4 text-[10px] text-black font-extrabold uppercase">
                <span>METHOD: CREDIT CARD</span>
                <span className="font-mono font-black">AUTH: OK-200 / **** 4242</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[11px] text-black font-black uppercase tracking-wider mb-1">*** INVOICE PROFORMA ***</div>
              <div className="flex justify-center gap-4 text-[10px] text-black font-extrabold uppercase">
                <span>STATUS: UNPAID</span>
                <span>TERMS: IMMEDIATE</span>
              </div>
            </>
          )}
        </div>

        {/* Footer scan for feedback block */}
        <div className="text-center mt-8 select-none">
          <div className="font-serif text-xs italic text-[#555] mb-6">"Thank you for dining with us"</div>
          
          {/* Custom QR code image dynamically generated based on table number */}
          <div className="flex justify-center mb-2">
            <div className="p-1 border border-black/10 rounded-lg bg-white">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://dineposai.com/feedback?table=${tableNumber}&order=DP-88392`)}`}
                alt="Scan for Feedback"
                className="w-[70px] h-[70px] object-contain select-none"
              />
            </div>
          </div>
          <div className="font-sans text-[9px] font-bold text-[#A69984] uppercase tracking-widest">Scan for Feedback</div>
        </div>

      </main>

      {/* Bottom Action buttons */}
      <footer className="w-full max-w-lg z-10 select-none flex-shrink-0 flex flex-col gap-6 items-center">
        <div className="flex gap-4 w-full justify-center">
          <button 
            onClick={handleDirectPrint}
            className="flex-1 max-w-[150px] flex items-center justify-center gap-2 py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg cursor-pointer hover:scale-[1.01]"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Direct Print
          </button>
          
          <button 
            onClick={handleSavePdf}
            className="flex-1 max-w-[150px] flex items-center justify-center gap-2 py-3.5 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 rounded-xl font-sans font-bold text-xs uppercase tracking-widest text-[#ffe2ab] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Save PDF
          </button>

          <button 
            onClick={handleBluetoothPrint}
            className="flex-1 max-w-[150px] flex items-center justify-center gap-2 py-3.5 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 rounded-xl font-sans font-bold text-xs uppercase tracking-widest text-[#ffe2ab] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">bluetooth</span>
            Bluetooth Print
          </button>
        </div>

        <div className="text-[10px] text-white/30 font-semibold font-sans tracking-wide">
          Ticket ID: DP-88392-2024 • DinePosAi v1
        </div>
      </footer>

      {/* INTERACTIVE TOAST FEEDBACK NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">info</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Printer Station</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTER DIAGNOSTICS CONSOLE OVERLAY */}
      {isBluetoothModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#161513] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xl text-[#ffe2ab] ${printerStatus === 'connecting' ? 'animate-spin' : ''}`}>print</span>
                <h3 className="font-serif text-lg text-white font-medium">Printer Connection Terminal</h3>
              </div>
              <button 
                onClick={() => setIsBluetoothModalOpen(false)}
                disabled={printerStatus === 'connecting'}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
            </div>

            {/* Diagnostic Logs console */}
            <div className="bg-black/90 border border-white/5 rounded-xl p-5 h-[200px] overflow-y-auto font-mono text-[10.5px] text-[#ffe2ab]/85 space-y-2 select-text">
              {printerLogs.map((logLine, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-[#A69984]/50 mr-2">&gt;</span>
                  {logLine}
                </div>
              ))}
            </div>

            {/* Footer Summary / Actions */}
            <div className="flex justify-end gap-3 font-sans pt-2">
              <button 
                onClick={() => setIsBluetoothModalOpen(false)}
                disabled={printerStatus === 'connecting'}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close Terminal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
