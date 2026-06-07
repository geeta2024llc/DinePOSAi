'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  cardAmount: number; // Mapped mockup card amount
  guests: number;
  orderNumber: string;
  items: OrderItem[];
  taxRate: number;
  gratuityRate: number;
}

const initialTickets: PosTicket[] = [
  {
    id: 'ticket-1',
    tableNumber: 'Table 12',
    serverName: 'Michael T.',
    duration: '45m',
    isVip: true,
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

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Find active selected ticket — may be undefined when all tickets are paid
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) ?? tickets[0];

  // Bill calculations — only computed when a ticket is present
  const subtotal    = selectedTicket ? selectedTicket.items.reduce((acc, item) => acc + item.price, 0) : 0;
  const tax         = selectedTicket ? (taxType === 'pre-tax' ? subtotal * selectedTicket.taxRate : subtotal - (subtotal / (1 + selectedTicket.taxRate))) : 0;
  const gratuity    = selectedTicket ? subtotal * selectedTicket.gratuityRate : 0;
  const grandTotal  = selectedTicket ? (taxType === 'pre-tax' ? subtotal + tax + gratuity : subtotal + gratuity) : 0;

  // Process transaction logic
  const handleProcessPayment = () => {
    setIsProcessing(true);
    triggerToast(`Authorizing payment of $${grandTotal.toFixed(2)} for ${selectedTicket.tableNumber}...`);
    
    setTimeout(() => {
      setIsProcessing(false);
      triggerToast(`Payment validated! ${selectedTicket.tableNumber} ticket closed.`);
      // Remove paid ticket and auto-select next using latest state (avoids stale closure)
      setTickets(prev => {
        const remaining = prev.filter(t => t.id !== selectedTicket.id);
        if (remaining.length > 0) setSelectedTicketId(remaining[0].id);
        return remaining;
      });
    }, 2000);
  };

  const handleSplitBill = () => {
    triggerToast(`Splitting invoice #DINE-${selectedTicket.orderNumber.replace('#', '')} for ${selectedTicket.tableNumber}...`);
  };

  // Filter listings
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.serverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      quickFilter === 'open' ? true :
      quickFilter === 'payment' ? t.isSplit : // Needs payment / split check
      quickFilter === 'vip' ? t.isVip : false;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-[280px] bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between p-8 flex-shrink-0 z-20">
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

          {/* New Order Button */}
          <button 
            onClick={() => triggerToast('Initializing New Order placement...')}
            className="w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer mb-8"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            New Order
          </button>

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
              href="/pos/inventory"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">inventory_2</span>
              Inventory
            </Link>

            <Link
              href="/pos/staff"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">groups</span>
              Staff
            </Link>

            <Link
              href="/pos/analytics"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
              Analytics
            </Link>
          </nav>
        </div>

        {/* Support, Settings & Operator avatar block */}
        <div className="border-t border-white/5 pt-6 font-sans space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>
          
          <Link
            href="/support"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">help</span>
            Support
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="J. Smith GM avatar"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-bold text-xs tracking-wide truncate">J. Smith</div>
              <div className="text-[8px] text-[#ffe2ab]/70 font-bold tracking-wider uppercase mt-0.5">General Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-h-screen relative bg-[#11100e]">
        
        {/* Top Header */}
        <header className="h-[90px] border-b border-white/5 flex items-center justify-between px-10 flex-shrink-0 bg-[#0e0e0d] sticky top-0 z-40 select-none">
          <h2 className="font-serif text-[20px] font-bold text-white tracking-wide leading-none">
            Active Orders
          </h2>
          
          {/* Header search & profile indicators */}
          <div className="flex items-center gap-6">
            <div className="relative select-none">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-base">search</span>
              <input
                type="text"
                placeholder="Search tables, items, or guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-[240px] transition-colors"
              />
            </div>
            
            <button className="w-[42px] h-[42px] flex items-center justify-center bg-transparent border border-white/5 hover:border-white/10 rounded-xl text-white transition-colors relative cursor-pointer">
              <span className="material-symbols-outlined text-xl text-[#ffe2ab]">notifications</span>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-3 right-3 motion-safe:motion-safe:animate-pulse"></span>
            </button>

            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop"
                alt="Cashier user avatar"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>
        </header>

        {/* Split Screen Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Active Orders List */}
          <div className="w-[420px] border-r border-white/5 flex flex-col h-full bg-[#11100e]/50 flex-shrink-0 select-none">
            
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
                      onClick={() => setSelectedTicketId(t.id)}
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
            <div className="flex-grow flex flex-col h-full bg-[#11100e] overflow-hidden">
              
              {/* Ticket details header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-start flex-shrink-0 select-none">
                <div>
                  <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1.5 block">Current Ticket</span>
                  <h3 className="font-serif text-[32px] text-white font-bold leading-none">{selectedTicket.tableNumber}</h3>
                </div>
                
                <div className="text-right text-xs text-[#A69984]/70 font-semibold font-sans space-y-1">
                  <div>Guests: {selectedTicket.guests}</div>
                  <div>Order {selectedTicket.orderNumber}</div>
                </div>
              </div>

              {/* Order items lists with headers */}
              <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-12 text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest pb-3 border-b border-white/5 select-none">
                  <div className="col-span-1 text-left">Qty</div>
                  <div className="col-span-8 text-left">Item</div>
                  <div className="col-span-3 text-right">Price</div>
                </div>

                {/* Items rows */}
                <div className="divide-y divide-white/5 flex-grow">
                  {selectedTicket.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 py-5 items-start">
                      {/* Quantity */}
                      <div className="col-span-1 text-left font-sans text-sm font-bold text-[#ffe2ab]/90">
                        {item.qty}
                      </div>
                      
                      {/* Name & Note */}
                      <div className="col-span-8 text-left">
                        <div className="font-sans font-bold text-sm text-white truncate pr-2">{item.name}</div>
                        {item.note && (
                          <div className="font-sans text-[12px] text-[#A69984]/65 font-medium mt-1">
                            {item.note}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-3 text-right font-sans font-bold text-sm text-white/95">
                        ${item.price.toFixed(2)}
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
                </div>

                {/* Grand total header and action triggers */}
                <div className="flex justify-between items-baseline select-none">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]">Grand Total</span>
                  <span className="font-serif text-[42px] font-bold text-[#ffe2ab] tracking-wide leading-none select-none">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4">
                  <button 
                    onClick={handleSplitBill}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 rounded-xl font-sans font-bold text-xs uppercase tracking-widest text-[#ffe2ab] transition-all cursor-pointer min-w-[130px]"
                  >
                    <span className="material-symbols-outlined text-base">call_split</span>
                    Split Bill
                  </button>
                  
                  <button 
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.01]"
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
