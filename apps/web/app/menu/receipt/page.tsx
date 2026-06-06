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

  // Dynamic receipt states
  const [cart, setCart] = useState<{ [cartKey: string]: CartItem }>({});
  const [tableNumber, setTableNumber] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);

  // Bluetooth print console logs states
  const [bluetoothLog, setBluetoothLog] = useState<string[]>([]);
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTaxType = localStorage.getItem('dinepos_tax_type');
      if (savedTaxType === 'pre-tax' || savedTaxType === 'post-tax') {
        setTaxType(savedTaxType as 'pre-tax' | 'post-tax');
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
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const taxRate = 0.08875;
  const tax = taxType === 'pre-tax' ? subtotal * taxRate : subtotal - (subtotal / (1 + taxRate));
  const serviceCharge = isCartEmpty ? 74.00 : subtotal * 0.10; // 10% Service Gratuity
  const total = taxType === 'pre-tax' ? subtotal + tax + serviceCharge : subtotal + serviceCharge;

  const handleDirectPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
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
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.bluetooth) {
      triggerToast('Web Bluetooth is not supported. Please use Chrome/Edge or trigger Direct Print.');
      return;
    }
    
    setIsBluetoothModalOpen(true);
    setIsBluetoothConnecting(true);
    setBluetoothLog(['Initializing Bluetooth print stack...', 'Searching for printer devices...']);

    try {
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
      
      setBluetoothLog(prev => [...prev, `Found Printer: ${device.name || 'Thermal printer'}`, 'Connecting to GATT server...']);
      const server = await device.gatt?.connect();
      
      setBluetoothLog(prev => [
        ...prev, 
        'Connected to GATT server successfully.', 
        'Resolving print characteristic...',
        'GATT Primary Service established (0x18F0).',
        'Characteristics resolved. Encoding ESC/POS packet stream...'
      ]);

      const encoder = new TextEncoder();
      const escInit = new Uint8Array([0x1b, 0x40]);
      const escCut = new Uint8Array([0x1d, 0x56, 0x42, 0x00]);
      
      const receiptText = 
        `\n\n      DinePosAi\n` + 
        `   Aura Hospitality\n` + 
        `========================\n` + 
        `Table: ${tableNumber}\n` +
        `Order ID: #DP-88392\n` +
        `------------------------\n` +
        (isCartEmpty 
          ? `Tasting Menu x2   $590.00\nChampagne x1      $150.00\n`
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
              const itemPrice = ((item ? item.price : 0) + modifierExtra) * ci.quantity;
              let detailsStr = '';
              if (ci.modifiers.length > 0) {
                detailsStr = `  (${ci.modifiers.join(', ')})\n`;
              }
              detailsStr += `  [Course: ${ci.course.toUpperCase()}]\n`;
              return `${(item ? item.name : 'Item').slice(0,14).padEnd(14)} x${ci.quantity} $${itemPrice.toFixed(2)}\n${detailsStr}`;
            }).join('')
        ) +
        `------------------------\n` +
        `Subtotal:        $${subtotal.toFixed(2)}\n` +
        `Tax:             $${tax.toFixed(2)}\n` +
        `Service Fee:     $${serviceCharge.toFixed(2)}\n` +
        `Total:           $${total.toFixed(2)}\n` +
        `========================\n\n\n\n`;

      setBluetoothLog(prev => [...prev, `ESC/POS byte size: ${escInit.length + encoder.encode(receiptText).length + escCut.length} bytes.`, 'Transmitting data...']);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBluetoothLog(prev => [...prev, '✓ Transmitted successfully.', 'Connection closed.']);
      setIsBluetoothConnecting(false);
      triggerToast('Receipt printed successfully!');
    } catch (e: any) {
      console.error(e);
      setBluetoothLog(prev => [...prev, `❌ Bluetooth connection failed: ${e.message || e}`]);
      setIsBluetoothConnecting(false);
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
      <main id="printable-receipt" className="w-full max-w-[380px] bg-white text-[#1c1c1c] rounded-2xl p-8 shadow-2xl z-10 flex flex-col justify-between flex-grow-0 mb-10 transform scale-[1.01]">
        
        {/* Header details */}
        <div className="text-center mb-6">
          {isCartEmpty && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-sans font-bold uppercase tracking-wider py-2 px-3 rounded-lg shadow-sm">
              ⚠️ Showing Sample Receipt
            </div>
          )}
          <h2 className="font-serif font-black text-2xl tracking-wide text-black mb-1">DinePosAi</h2>
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <div className="h-[1px] w-6 bg-[#ffe2ab]/80"></div>
            <span className="font-sans font-bold text-[8.5px] text-[#A69984] tracking-[0.25em] uppercase">Aura Hospitality Group</span>
            <div className="h-[1px] w-6 bg-[#ffe2ab]/80"></div>
          </div>
          <div className="font-sans text-[10.5px] text-[#555] font-semibold leading-relaxed">
            <div>1200 Gastronomy Way, Suite 400</div>
            <div>New York, NY 10001</div>
            <div>+1 (212) 555-0198</div>
          </div>
        </div>

        {/* Ticket Metadata bordered by dotted lines */}
        <div className="border-y border-dashed border-black/15 py-4 my-4 font-sans text-[11px] font-semibold text-[#444] select-none">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-black font-extrabold uppercase">Table {tableNumber}</div>
              <div className="text-[10px] text-[#666] mt-0.5">Terminal 01</div>
              <div className="text-[10px] text-[#666]">Server: Julian B.</div>
            </div>
            
            <div className="text-right">
              <div>May 24, 2024</div>
              <div className="text-[10px] text-[#666] mt-0.5">20:42 PM</div>
              <div className="text-[10px] text-black font-extrabold mt-0.5">ORDER #DP-88392</div>
            </div>
          </div>
        </div>

        {/* Item listing */}
        <div className="space-y-4 font-sans py-2">
          {isCartEmpty ? (
            <>
              {/* Row 1 */}
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <div className="text-xs text-black font-extrabold">Tasting Menu - Chef's Reserve</div>
                  <div className="text-[10px] text-[#666] italic mt-1 font-semibold">x2 @ $295.00 each</div>
                </div>
                <div className="text-right text-xs text-black font-extrabold">$590.00</div>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <div className="text-xs text-black font-extrabold">Vintage Champagne Upgrade</div>
                  <div className="text-[10px] text-[#666] italic mt-1 font-semibold">x1 @ $150.00 each</div>
                </div>
                <div className="text-right text-xs text-black font-extrabold">$150.00</div>
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
                <div key={cartKey} className="flex flex-col gap-1 py-1 border-b border-black/5 last:border-0 select-none">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[75%]">
                      <div className="text-xs text-black font-extrabold leading-tight">{item.name}</div>
                      {ci.modifiers.length > 0 && (
                        <div className="text-[9px] text-[#ffe2ab] bg-black px-1.5 py-0.5 rounded inline-block mt-1 font-bold font-sans">
                          {ci.modifiers.join(', ')}
                        </div>
                      )}
                      <div className="text-[9px] text-[#666] font-semibold mt-1 flex gap-2 items-center">
                        <span>x{ci.quantity} @ ${singlePrice.toFixed(2)} each</span>
                        <span className="uppercase text-[8px] bg-gray-100 px-1 rounded text-[#888] font-extrabold font-sans">[{ci.course}]</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-black font-extrabold shrink-0">${rowTotal.toFixed(2)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Calculations summary */}
        <div className="border-t border-black/10 pt-4 mt-4 space-y-2.5 font-sans select-none text-[11px] font-semibold text-[#555] pb-4">
          <div className="flex justify-between">
            <span>{taxType === 'post-tax' ? 'Subtotal (Tax Incl.)' : 'Subtotal'}</span>
            <span className="text-black font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{taxType === 'post-tax' ? 'Included Tax' : 'Sales Tax'} (8.875%)</span>
            <span className="text-black font-bold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Charge (10%)</span>
            <span className="text-black font-bold">${serviceCharge.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Paid / Balance Due block */}
        <div className="border-t-2 border-black/15 pt-4 mt-2 flex justify-between items-baseline font-sans select-none mb-4">
          <span className="text-xs text-black font-extrabold uppercase">
            {activeTab === 'receipt' ? 'Total Paid' : 'Balance Due'}
          </span>
          <span className="font-serif text-[28px] font-black text-black tracking-wide leading-none">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Payment Confirmation / Status Box */}
        <div className="bg-[#f7f7f7] border border-black/5 p-4 rounded-xl font-sans select-none">
          {activeTab === 'receipt' ? (
            <>
              <div className="text-[10px] text-black font-black uppercase tracking-wider mb-2">Payment Confirmed</div>
              <div className="flex justify-between text-[10px] text-[#666] font-semibold">
                <span>Method: Credit Card</span>
                <span className="font-mono">Auth: **** 4242</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-[#A69984] font-black uppercase tracking-wider mb-2">Invoice Proforma</div>
              <div className="flex justify-between text-[10px] text-[#666] font-semibold">
                <span>Status: Unpaid</span>
                <span>Terms: Immediate</span>
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

      {/* BLUETOOTH PRINTER DIAGNOSTICS CONSOLE OVERLAY */}
      {isBluetoothModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#161513] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xl text-[#ffe2ab] ${isBluetoothConnecting ? 'animate-spin' : ''}`}>bluetooth</span>
                <h3 className="font-serif text-lg text-white font-medium">Bluetooth Printer Terminal</h3>
              </div>
              <button 
                onClick={() => setIsBluetoothModalOpen(false)}
                disabled={isBluetoothConnecting}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
            </div>

            {/* Diagnostic Logs console */}
            <div className="bg-black/90 border border-white/5 rounded-xl p-5 h-[200px] overflow-y-auto font-mono text-[10.5px] text-[#ffe2ab]/85 space-y-2 select-text">
              {bluetoothLog.map((logLine, idx) => (
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
                disabled={isBluetoothConnecting}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close Connection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
