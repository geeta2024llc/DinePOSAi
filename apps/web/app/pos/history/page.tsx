'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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

const mockTransactions: TransactionRecord[] = [
  {
    id: 'tx-1',
    orderId: '#ORD-9021',
    date: 'Oct 24, 2023',
    time: '21:45 PM',
    tableType: 'table',
    tableLabel: 'Tbl 14',
    server: 'S. Reynolds',
    amount: 342.50,
    paymentMethod: 'Visa',
    paymentType: 'card',
    paymentDetails: '•••• 4242',
    paymentIcon: 'credit_card'
  },
  {
    id: 'tx-2',
    orderId: '#ORD-9020',
    date: 'Oct 24, 2023',
    time: '21:12 PM',
    tableType: 'takeout',
    tableLabel: 'Takeout',
    server: 'M. Chen',
    amount: 85.00,
    paymentMethod: 'Cash',
    paymentType: 'cash',
    paymentDetails: '',
    paymentIcon: 'payments'
  },
  {
    id: 'tx-3',
    orderId: '#ORD-9019',
    date: 'Oct 24, 2023',
    time: '20:45 PM',
    tableType: 'table',
    tableLabel: 'Tbl 02',
    server: 'L. Gomez',
    amount: 510.25,
    paymentMethod: 'Amex',
    paymentType: 'card',
    paymentDetails: '•••• 1005',
    paymentIcon: 'credit_card'
  },
  {
    id: 'tx-4',
    orderId: '#ORD-9018',
    date: 'Oct 24, 2023',
    time: '20:15 PM',
    tableType: 'table',
    tableLabel: 'Tbl 08',
    server: 'S. Reynolds',
    amount: 124.00,
    paymentMethod: 'MC',
    paymentType: 'card',
    paymentDetails: '•••• 8891',
    paymentIcon: 'credit_card'
  }
];

export default function TransactionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [methodFilter, setMethodFilter] = useState('all');
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Filter transactions based on inputs
  const filteredTransactions = mockTransactions.filter(tx => {
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

  return (
    <div className="flex w-full min-h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none">
      
      {/* LEFT SIDEBAR PANEL */}
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
            onClick={() => triggerToast('Initializing New Order placement...', 'info')}
            className="w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer mb-8"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            New Order
          </button>

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
                Showing 1-{filteredTransactions.length} of {searchQuery || methodFilter !== 'all' ? filteredTransactions.length : '245'} transactions
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

    </div>
  );
}
