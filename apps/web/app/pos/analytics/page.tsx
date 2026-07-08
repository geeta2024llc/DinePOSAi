'use client';

import React, { useState, useEffect } from 'react';
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

export default function AnalyticsPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

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

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'dinepos_active_operator' && e.newValue) {
          try {
            setActiveOperator(JSON.parse(e.newValue));
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

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleExportCSV = () => {
    const header = ['Transaction ID', 'Date', 'Time', 'Payment Method', 'Amount ($)', 'Status'];
    const rows = filteredAudit.map(tx => [
      tx.id,
      tx.date,
      tx.time,
      tx.method === 'DIGITAL WALLET' ? 'Digital Wallet' : tx.method,
      tx.amount.toFixed(2),
      tx.status
    ]);
    const csvContent = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dineposai_analytics_transactions_${dateFilterType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Analytics transactions exported successfully as CSV.');
  };

  // Audit Trail & Payments mock data with YYYY-MM-DD dates:
  const auditTransactions = [
    { id: '#ORD-9021', date: '2026-06-11', time: 'Jun 11, 2026 21:45 PM', method: 'CARD', amount: 342.50, status: 'Success' },
    { id: '#ORD-9020', date: '2026-06-11', time: 'Jun 11, 2026 21:12 PM', method: 'CASH', amount: 85.00, status: 'Success' },
    { id: '#ORD-9019', date: '2026-06-11', time: 'Jun 11, 2026 20:45 PM', method: 'DIGITAL WALLET', amount: 510.25, status: 'Success' },
    { id: '#ORD-9018', date: '2026-06-11', time: 'Jun 11, 2026 20:15 PM', method: 'SPLIT', amount: 124.00, status: 'Success' },
    { id: '#ORD-9017', date: '2026-06-10', time: 'Jun 10, 2026 19:30 PM', method: 'CARD', amount: 215.40, status: 'Success' },
    { id: '#ORD-9016', date: '2026-06-10', time: 'Jun 10, 2026 18:50 PM', method: 'CASH', amount: 45.00, status: 'Success' },
    { id: '#ORD-9015', date: '2026-06-10', time: 'Jun 10, 2026 18:10 PM', method: 'CARD', amount: 189.50, status: 'Success' },
    { id: '#ORD-9014', date: '2026-06-09', time: 'Jun 09, 2026 17:40 PM', method: 'SPLIT', amount: 295.00, status: 'Success' },
    { id: '#ORD-9013', date: '2026-06-09', time: 'Jun 09, 2026 16:15 PM', method: 'DIGITAL WALLET', amount: 68.20, status: 'Success' },
    { id: '#ORD-9012', date: '2026-06-08', time: 'Jun 08, 2026 15:30 PM', method: 'CARD', amount: 155.00, status: 'Success' },
    { id: '#ORD-9011', date: '2026-06-07', time: 'Jun 07, 2026 14:45 PM', method: 'CASH', amount: 112.50, status: 'Success' },
    { id: '#ORD-9010', date: '2026-06-06', time: 'Jun 06, 2026 13:20 PM', method: 'CARD', amount: 94.00, status: 'Success' },
  ];

  const [dateFilterType, setDateFilterType] = useState<'today' | 'yesterday' | '7days' | 'custom'>('today');
  const [customStart, setCustomStart] = useState('2026-06-05');
  const [customEnd, setCustomEnd] = useState('2026-06-11');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempStart, setTempStart] = useState('2026-06-05');
  const [tempEnd, setTempEnd] = useState('2026-06-11');

  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const itemsPerPage = 5;

  const filterByDate = (txDate: string) => {
    if (dateFilterType === 'today') return txDate === '2026-06-11';
    if (dateFilterType === 'yesterday') return txDate === '2026-06-10';
    if (dateFilterType === '7days') return txDate >= '2026-06-05' && txDate <= '2026-06-11';
    if (dateFilterType === 'custom') return txDate >= customStart && txDate <= customEnd;
    return true;
  };

  const filteredAudit = auditTransactions.filter(tx => 
    filterByDate(tx.date) && (
      tx.id.toLowerCase().includes(auditSearch.toLowerCase()) ||
      tx.method.toLowerCase().includes(auditSearch.toLowerCase())
    )
  );

  const totalAuditPages = Math.ceil(filteredAudit.length / itemsPerPage);
  const currentAuditPage = Math.min(auditPage, totalAuditPages || 1);
  const paginatedAudit = filteredAudit.slice((currentAuditPage - 1) * itemsPerPage, currentAuditPage * itemsPerPage);

  const cashCount = filteredAudit.filter(t => t.method === 'CASH').length;
  const cardCount = filteredAudit.filter(t => t.method === 'CARD').length;
  const walletCount = filteredAudit.filter(t => t.method === 'DIGITAL WALLET').length;
  const splitCount = filteredAudit.filter(t => t.method === 'SPLIT').length;
  const totalOrdersCount = filteredAudit.length;

  const totalPeriodRevenue = filteredAudit.reduce((acc, tx) => acc + tx.amount, 0);

  // Dynamically compute covers, avg turn time based on selection:
  const totalCovers = Math.round(totalOrdersCount * 2.3);
  const avgTurnTime = totalOrdersCount > 0 ? '54m' : '0m';

  // Dynamic Top Movers matching selections:
  const baseTopMovers = [
    { name: 'Wagyu Tomahawk', ratio: 0.40, price: 150 },
    { name: 'Truffle Risotto', ratio: 0.25, price: 35 },
    { name: 'Oysters Half Shell', ratio: 0.20, price: 24 },
    { name: 'Signature Old Fashioned', ratio: 0.15, price: 15 }
  ];

  const topMovers = baseTopMovers.map((item, idx) => {
    const orders = Math.round(totalOrdersCount * item.ratio);
    return {
      rank: idx + 1,
      name: item.name,
      orders: orders,
      revenue: orders * item.price
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Dynamic Revenue Trend based on selections:
  const baseRevenueTrend = [
    { time: '10am', ratio: 0.12 },
    { time: '12pm', ratio: 0.18 },
    { time: '2pm', ratio: 0.10 },
    { time: '4pm', ratio: 0.22 },
    { time: '6pm', ratio: 0.28 },
    { time: '8pm', ratio: 0.15 },
    { time: '10pm', ratio: 0.05 }
  ];

  const revenueTrend = baseRevenueTrend.map((t, idx) => {
    const val = totalPeriodRevenue * t.ratio;
    const heightPct = totalPeriodRevenue > 0 ? Math.max(5, Math.round(t.ratio * 250)) : 5;
    return {
      time: t.time,
      height: `${heightPct}%`,
      value: `$${Math.round(val).toLocaleString()}`,
      active: idx === 4 && totalPeriodRevenue > 0
    };
  });

  return (
    <div className="flex w-full min-h-screen bg-[#0a0a09] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none">
      
      {/* SIDEBAR */}
      <aside className={`bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-0 p-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] p-8 opacity-100'
      }`}>
        <div>
          {/* Brand */}
          <div className="mb-10 flex items-center">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 mr-3">
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

          {/* Nav */}
          <nav className="space-y-1.5 font-sans">
            <Link href="/pos" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">layers</span>
              Floor Map
            </Link>
            <Link href="/pos/history" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">receipt_long</span>
              Orders
            </Link>


            {/* Analytics — active */}
            <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab]">trending_up</span>
                Analytics
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
            <Link href="/pos/discounts" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">sell</span>
              Discounts
            </Link>
          </nav>
        </div>

        {/* Settings & Operator avatar block */}
        <div className="border-t border-white/5 pt-6 font-sans space-y-4">
          <Link href="/pos/settings" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>
          <Link href="/login?logout=true" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>

        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-h-screen relative bg-[#0e0e0e] px-12 pb-12">
        
        {/* Top Header Bar */}
        <header className="h-[90px] flex items-center justify-between flex-shrink-0 bg-transparent sticky top-0 z-10 select-none">
          <div className="relative select-none">
            <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-sm">search</span>
            <input
              type="text"
              placeholder="Search analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121211] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-[240px] transition-all font-medium"
            />
          </div>
          
          {/* Quick config search and user actions */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#ffe2ab]/20 bg-[#ffe2ab]/5 text-[#ffe2ab] font-sans font-bold text-[9px] uppercase tracking-wider rounded-lg shadow-[0_0_10px_rgba(255,226,171,0.02)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              System Active
            </div>
          </div>
        </header>

        {/* Dashboard Title & Actions Row */}
        <div className="flex justify-between items-end mb-8 select-none">
          <div>
            <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
              Analytics
            </h1>
            <p className="font-sans text-[13px] text-[#A69984]/60 mt-2 font-medium">
              Executive overview of today's performance.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowDatePickerModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 hover:border-white/20 rounded-xl text-xs text-white font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95 select-none"
            >
              <span className="material-symbols-outlined text-sm text-[#ffe2ab]">calendar_today</span>
              <span>
                {dateFilterType === 'today' ? 'Today' : 
                 dateFilterType === 'yesterday' ? 'Yesterday' :
                 dateFilterType === '7days' ? 'Last 7 Days' :
                 `${customStart} to ${customEnd}`}
              </span>
              <span className="material-symbols-outlined text-xs text-[#A69984]/50">keyboard_arrow_down</span>
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 hover:border-white/20 rounded-lg text-xs text-white font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>

        {/* Performance KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
          
          {/* Card 1: Gross Revenue */}
          <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[150px] relative overflow-hidden group hover:border-[#ffe2ab]/20 transition-all duration-300">
            {/* Watermark SVG */}
            <svg className="absolute right-2 bottom-2 w-28 h-28 text-white/[0.015] group-hover:text-white/[0.025] transition-all duration-300 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            
            <div>
              <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest">Gross Revenue</span>
              <h3 className="font-serif text-[34px] font-bold text-[#ffe2ab] mt-4 flex items-baseline">
                <span className="text-xl mr-0.5">$</span>{totalPeriodRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-bold mt-2">
              <span className="material-symbols-outlined text-xs font-black">trending_up</span>
              +12.5% vs yesterday
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[150px] relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            {/* Watermark SVG */}
            <svg className="absolute right-2 bottom-2 w-28 h-28 text-white/[0.015] group-hover:text-white/[0.025] transition-all duration-300 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
            </svg>
            
            <div>
              <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest">Total Orders</span>
              <h3 className="font-serif text-[34px] font-bold text-white mt-4">{totalOrdersCount}</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-bold mt-2">
              <span className="material-symbols-outlined text-xs font-black">trending_up</span>
              +4.2% vs yesterday
            </div>
          </div>

          {/* Card 3: Covers */}
          <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[150px] relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            {/* Watermark SVG */}
            <svg className="absolute right-2 bottom-2 w-28 h-28 text-white/[0.015] group-hover:text-white/[0.025] transition-all duration-300 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            
            <div>
              <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest">Covers</span>
              <h3 className="font-serif text-[34px] font-bold text-white mt-4">{totalCovers}</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-rose-400 font-sans font-bold mt-2">
              <span className="material-symbols-outlined text-xs font-black">trending_down</span>
              -2.1% vs yesterday
            </div>
          </div>

          {/* Card 4: Avg Turn Time */}
          <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[150px] relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            {/* Watermark SVG */}
            <svg className="absolute right-2 bottom-2 w-28 h-28 text-white/[0.015] group-hover:text-white/[0.025] transition-all duration-300 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            
            <div>
              <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest">Avg Turn Time</span>
              <h3 className="font-serif text-[34px] font-bold text-white mt-4">{avgTurnTime}</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-bold mt-2">
              <span className="material-symbols-outlined text-xs font-black">trending_down</span>
              -5m vs yesterday (Improved)
            </div>
          </div>

        </div>

        {/* Charts & Top Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Revenue Trend Chart (Span 8) */}
          <div className="lg:col-span-8 bg-[#121211] border border-white/5 rounded-2xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden select-none">
            
            {/* Chart Header */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-serif text-xl text-white font-medium tracking-wide">Revenue Trend</h3>
              <button 
                onClick={() => triggerToast('Chart options...')}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">more_horiz</span>
              </button>
            </div>

            {/* Custom Bar Graph Layout */}
            <div className="flex flex-col justify-end flex-grow h-[260px] relative">
              
              {/* Horizontal Reference dashed lines */}
              <div className="absolute inset-x-0 top-0 h-[80%] flex flex-col justify-between pointer-events-none select-none z-0">
                <div className="w-full border-t border-white/[0.03]"></div>
                <div className="w-full border-t border-white/[0.03]"></div>
                <div className="w-full border-t border-white/[0.03]"></div>
                <div className="w-full border-t border-white/[0.03]"></div>
              </div>

              {/* Bars Container */}
              <div className="flex items-end justify-between px-6 z-10 h-[220px]">
                {revenueTrend.map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-12 group h-full justify-end relative">
                    
                    {/* Hover Value Popover */}
                    <div className="absolute bottom-[calc(100%+8px)] bg-[#1c1b1a] border border-white/10 text-white font-sans font-bold text-[9px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none uppercase tracking-wider z-20">
                      {bar.value}
                    </div>

                    {/* Bar */}
                    <div 
                      style={{ height: bar.height }}
                      className={`w-9 rounded-md transition-all duration-500 cursor-pointer ${
                        bar.active 
                          ? 'bg-[#ffe2ab] shadow-[0_0_20px_rgba(255,226,171,0.25)]' 
                          : 'bg-white/[0.04] hover:bg-white/[0.08]'
                      }`}
                    ></div>

                    {/* X Axis Label */}
                    <span className={`text-[10px] uppercase font-sans tracking-wide mt-1 transition-colors ${
                      bar.active 
                        ? 'text-[#ffe2ab] font-bold' 
                        : 'text-[#A69984]/40 font-semibold'
                    }`}>
                      {bar.time}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Top Movers (Span 4) */}
          <div className="lg:col-span-4 bg-[#121211] border border-white/5 rounded-2xl p-8 shadow-xl flex flex-col justify-between select-none">
            
            {/* Top Movers Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl text-white font-medium tracking-wide">Top Movers</h3>
              <button 
                onClick={() => triggerToast('Filter movers list...')}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">tune</span>
              </button>
            </div>

            {/* Top Movers List */}
            <div className="flex-grow flex flex-col justify-center space-y-5">
              {topMovers.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs font-bold text-white/70">
                      {item.rank}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs">{item.name}</h4>
                      <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right font-sans font-bold text-[#ffe2ab] text-sm">
                    ${item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Audit Trail & Payments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-stretch select-none">
          
          {/* Payments Widget (Span 4) */}
          <div className="lg:col-span-4 bg-[#121211] border border-white/5 rounded-2xl p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-6">
                Payments
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-[56px] font-bold text-white leading-none font-sans">{totalOrdersCount}</span>
                <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest mt-1">Orders</span>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="uppercase tracking-wider text-[11px] text-[#A69984]">Cash</span>
                </div>
                <span className="font-mono text-sm text-white">{cashCount}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="uppercase tracking-wider text-[11px] text-[#A69984]">Card</span>
                </div>
                <span className="font-mono text-sm text-white">{cardCount}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="uppercase tracking-wider text-[11px] text-[#A69984]">Digital Wallet</span>
                </div>
                <span className="font-mono text-sm text-white">{walletCount}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="uppercase tracking-wider text-[11px] text-[#A69984]">Split</span>
                </div>
                <span className="font-mono text-sm text-white">{splitCount}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Widget (Span 8) */}
          <div className="lg:col-span-8 bg-[#121211] border border-white/5 rounded-2xl p-7 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-4 gap-4">
                <div>
                  <h3 className="text-white font-serif text-sm font-bold tracking-wide uppercase">Audit Trail</h3>
                  <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mt-1.5">
                    {filteredAudit.length} Total Transactions Found
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative w-full sm:w-[240px]">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#A69984]/40 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Search ID or method..."
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value);
                      setAuditPage(1);
                    }}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Records / Table */}
              <div className="mt-4 overflow-x-auto min-h-[220px]">
                {paginatedAudit.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                    <span className="material-symbols-outlined text-4xl text-[#A69984]/20 mb-3">inventory_2</span>
                    <p className="text-[10px] text-[#A69984]/40 font-bold uppercase tracking-widest">No records in range</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9.5px] font-bold text-[#A69984]/40 uppercase tracking-widest border-b border-white/5">
                        <th className="pb-3 pr-4">Transaction ID</th>
                        <th className="pb-3 px-4">Date & Time</th>
                        <th className="pb-3 px-4">Method</th>
                        <th className="pb-3 px-4 text-right">Amount</th>
                        <th className="pb-3 pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-xs font-sans">
                      {paginatedAudit.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 pr-4 font-bold text-white tracking-wider">{tx.id}</td>
                          <td className="py-3 px-4 text-[#A69984]/70 font-semibold">{tx.time}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold border uppercase tracking-wider ${
                              tx.method === 'CASH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              tx.method === 'CARD' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              tx.method === 'DIGITAL WALLET' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                              'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                            }`}>
                              {tx.method === 'DIGITAL WALLET' ? 'DIGITAL WALLET' : tx.method}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#ffe2ab]">${tx.amount.toFixed(2)}</td>
                          <td className="py-3 pl-4">
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {filteredAudit.length > 0 && (
              <div className="flex justify-between items-center text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider pt-4 border-t border-white/5 select-none">
                <span>
                  Showing {((currentAuditPage - 1) * itemsPerPage) + 1}-{Math.min(currentAuditPage * itemsPerPage, filteredAudit.length)} of {filteredAudit.length} entries
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentAuditPage === 1}
                    onClick={() => setAuditPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 rounded-lg border border-white/5 flex items-center justify-center text-white transition-colors cursor-pointer ${
                      currentAuditPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  
                  {Array.from({ length: totalAuditPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => setAuditPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                          currentAuditPage === pageNum
                            ? 'bg-[#ffe2ab] text-[#402d00]'
                            : 'bg-white/5 hover:bg-white/10 text-[#A69984] hover:text-white border border-white/5'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    disabled={currentAuditPage === totalAuditPages}
                    onClick={() => setAuditPage(prev => Math.min(prev + 1, totalAuditPages))}
                    className={`w-7 h-7 rounded-lg border border-white/5 flex items-center justify-center text-white transition-colors cursor-pointer ${
                      currentAuditPage === totalAuditPages ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* TOAST ALERT */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#121211] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-[#ffe2ab]">info</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">System Alert</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">
                {toast.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DATE RANGE PICKER MODAL */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[420px] rounded-2xl shadow-2xl relative font-sans p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="font-serif text-lg text-white font-bold tracking-wide">Select Date Range</h3>
                <p className="text-[11px] text-[#A69984]/50 font-medium mt-0.5 font-sans">Filter analytics by presets or custom range</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-[#A69984]/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <div className="text-[9px] text-[#ffe2ab]/50 font-bold uppercase tracking-widest mb-1.5">Presets</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'today', label: 'Today' },
                  { key: 'yesterday', label: 'Yesterday' },
                  { key: '7days', label: '7 Days' }
                ].map(preset => (
                  <button
                    type="button"
                    key={preset.key}
                    onClick={() => {
                      setDateFilterType(preset.key as any);
                      setShowDatePickerModal(false);
                      triggerToast(`Filter applied: ${preset.label}`);
                    }}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      dateFilterType === preset.key
                        ? 'bg-[#ffe2ab] text-[#402d00] border-[#ffe2ab]'
                        : 'bg-white/5 hover:bg-white/10 text-[#A69984] border-white/5'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Inputs */}
            <div className="space-y-3 pt-2">
              <div className="text-[9px] text-[#ffe2ab]/50 font-bold uppercase tracking-widest">Custom Range</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[9.5px] text-[#A69984]/65 font-bold uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    max={tempEnd}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9.5px] text-[#A69984]/65 font-bold uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    min={tempStart}
                    max="2026-12-31"
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/40"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomStart(tempStart);
                  setCustomEnd(tempEnd);
                  setDateFilterType('custom');
                  setShowDatePickerModal(false);
                  triggerToast(`Filter applied: ${tempStart} to ${tempEnd}`);
                }}
                className="flex-grow py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md text-center cursor-pointer"
              >
                Apply Range
              </button>
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
