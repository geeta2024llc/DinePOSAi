'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';

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

interface TransactionRecord {
  id: string;
  orderId: string;
  date: string;
  time: string;
  tableType: 'table' | 'takeout';
  tableLabel: string;
  server: string;
  amount: number;
  paymentMethod: string;
  paymentType: 'card' | 'cash';
  paymentDetails: string;
  paymentIcon: string;
}



export default function TransactionHistoryPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Operator states
  const [activeOperator, setActiveOperator] = useState<Operator>(AVAILABLE_OPERATORS[0]);
  const [operatorModalOpen, setOperatorModalOpen] = useState(false);

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

      // Load completed records from localStorage
      const savedTransactions = localStorage.getItem('dinepos_pos_transactions');
      if (savedTransactions) {
        try {
          setTransactions(JSON.parse(savedTransactions));
        } catch (e) {
          console.error(e);
          setTransactions([]);
        }
      } else {
        setTransactions([]);
        localStorage.setItem('dinepos_pos_transactions', JSON.stringify([]));
      }
      setIsLoaded(true);

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'dinepos_active_operator' && e.newValue) {
          try {
            setActiveOperator(JSON.parse(e.newValue));
          } catch (err) {
            console.error(err);
          }
        }
        if (e.key === 'dinepos_pos_transactions' && e.newValue) {
          try {
            setTransactions(JSON.parse(e.newValue));
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

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Filter transactions based on inputs
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search filter
      const matchesSearch = 
        tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.tableLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.server.toLowerCase().includes(searchQuery.toLowerCase());

      // Method filter
      let matchesMethod = true;
      if (methodFilter === 'card') {
        matchesMethod = tx.paymentType === 'card';
      } else if (methodFilter === 'cash') {
        matchesMethod = tx.paymentType === 'cash';
      }

      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchQuery, methodFilter]);

  return (
    <div className="flex w-full min-h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none">
      
      {/* LEFT SIDEBAR PANEL */}
      <aside className={`bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-0 p-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] p-8 opacity-100'
      }`}>
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
            <Link
              href="/pos?newOrder=table"
              className="w-full py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-bold">add</span>
              New Table Order
            </Link>
            <Link
              href="/pos?newOrder=walkin"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#ffe2ab] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-bold">shopping_bag</span>
              Walk-in Customer
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-sans">
            <Link
              href="/pos"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">layers</span>
              Floor Map
            </Link>
            
            <div
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow select-none"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none">receipt_long</span>
                Orders
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>



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
            href="/login?logout=true"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>


        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-h-screen relative bg-[#0e0e0d]">
        
        {/* Top Header Row */}
        <header className="h-[90px] flex items-center justify-between px-12 flex-shrink-0 select-none">
          <div>
            <h2 className="font-serif text-[32px] font-bold text-white tracking-wide leading-none">
              Transaction History
            </h2>
            <p className="font-sans text-[12.5px] text-[#A69984]/65 mt-2.5 leading-relaxed font-semibold">
              Review and manage completed sales records.
            </p>
          </div>

          {/* Export CSV / Export PDF */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerToast('Exporting transaction records to CSV...', 'success')}
              className="bg-transparent hover:bg-white/5 text-[#A69984] border border-white/10 px-4 py-2.5 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none"
            >
              <span className="material-symbols-outlined text-xs">download</span>
              Export CSV
            </button>
            <button
              onClick={() => triggerToast('Generating PDF transaction records report...', 'success')}
              className="bg-transparent hover:bg-white/5 text-[#A69984] border border-white/10 px-4 py-2.5 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none"
            >
              <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-grow px-12 pb-32 pt-4">
          
          {/* Table Controls (Search, Date filter, Method filter) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 select-none">
            
            {/* Search inputs */}
            <div className="relative select-none w-full md:w-[480px]">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-sm">search</span>
              <input
                type="text"
                placeholder="Search Order ID, Table, or Server"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-full transition-colors font-medium"
              />
            </div>

            {/* Dropdown filters */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              
              {/* Date Filter */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/45 text-sm">calendar_month</span>
                <select 
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    triggerToast(`Date filter applied: ${e.target.value === 'today' ? 'Today' : e.target.value === 'yesterday' ? 'Yesterday' : 'Last 7 Days'}`, 'info');
                  }}
                  className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/20 appearance-none cursor-pointer font-medium min-w-[140px]"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
              </div>

              {/* Method Filter */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/45 text-sm">credit_card</span>
                <select 
                  value={methodFilter}
                  onChange={(e) => {
                    setMethodFilter(e.target.value);
                    triggerToast(`Payment method filtered.`, 'info');
                  }}
                  className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/20 appearance-none cursor-pointer font-medium min-w-[150px]"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Cards</option>
                  <option value="cash">Cash</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
              </div>

            </div>

          </div>

          {/* Records Table Card */}
          <div className="bg-[#161513]/90 border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0e0e0d]/50 text-[9.5px] font-bold text-[#A69984]/70 uppercase tracking-widest">
                    <th className="px-8 py-4">Date & Time</th>
                    <th className="px-8 py-4">Order ID</th>
                    <th className="px-8 py-4">Table / Type</th>
                    <th className="px-8 py-4">Server</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                    <th className="px-8 py-4">Payment</th>
                    <th className="px-8 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-xs">
                  
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                        {/* Date & Time */}
                        <td className="px-8 py-4">
                          <div className="font-bold text-white tracking-wide">{tx.date}</div>
                          <div className="text-[10px] text-[#A69984]/40 font-semibold mt-0.5">{tx.time}</div>
                        </td>
                        
                        {/* Order ID */}
                        <td className="px-8 py-4 font-bold text-[#ffe2ab] tracking-wider select-text">
                          {tx.orderId}
                        </td>
                        
                        {/* Table / Type */}
                        <td className="px-8 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white font-bold text-[9.5px] uppercase tracking-wider rounded-md">
                            <span className="material-symbols-outlined text-[13px]">
                              {tx.tableType === 'table' ? 'table_bar' : 'shopping_bag'}
                            </span>
                            {tx.tableLabel}
                          </span>
                        </td>
                        
                        {/* Server */}
                        <td className="px-8 py-4 text-white font-medium">
                          {tx.server}
                        </td>
                        
                        {/* Amount */}
                        <td className="px-8 py-4 text-right font-mono font-bold text-white text-sm">
                          ${tx.amount.toFixed(2)}
                        </td>
                        
                        {/* Payment */}
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-[#A69984]/80">
                            <span className="material-symbols-outlined text-sm text-[#A69984]/60">{tx.paymentIcon}</span>
                            <span>{tx.paymentMethod} {tx.paymentDetails}</span>
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-8 py-4 text-center">
                          <button 
                            onClick={() => triggerToast(`Viewing details for transaction ${tx.orderId}...`, 'info')}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9.5px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center text-[#A69984]/40 font-sans text-xs">
                        No transactions found matching your search.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-6 border-t border-white/5 bg-[#0e0e0d]/30 flex justify-between items-center text-[10.5px] text-[#A69984]/60 font-medium select-none">
              <span>
                Showing 1-{filteredTransactions.length} of {searchQuery || methodFilter !== 'all' ? filteredTransactions.length : transactions.length} transactions
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => triggerToast('Viewing previous records page...', 'info')}
                  className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button 
                  onClick={() => triggerToast('Viewing next records page...', 'info')}
                  className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* TOAST ALERT */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">
              {toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">
                {toast.type === 'success' ? 'Action Success' : 'POS Notification'}
              </div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">
                {toast.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPERATOR SWITCHER MODAL */}
      {operatorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-[#121211] border border-white/10 rounded-2xl p-6 w-[360px] shadow-2xl relative animate-fade-in animate-duration-200">
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

    </div>
  );
}
