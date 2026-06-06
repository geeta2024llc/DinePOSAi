'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Mock data for Top Movers matching the mockup exactly:
  const topMovers = [
    { rank: 1, name: 'Wagyu Tomahawk', orders: 42, revenue: 6300 },
    { rank: 2, name: 'Truffle Risotto', orders: 89, revenue: 3115 },
    { rank: 3, name: 'Oysters Half Shell', orders: 112, revenue: 2688 },
    { rank: 4, name: 'Signature Old Fashioned', orders: 145, revenue: 2175 }
  ];

  // Mock data for Revenue Trend bars matching mockup heights and times:
  const revenueTrend = [
    { time: '10am', height: '30%', value: '$1,200', active: false },
    { time: '12pm', height: '38%', value: '$1,900', active: false },
    { time: '2pm', height: '28%', value: '$1,400', active: false },
    { time: '4pm', height: '52%', value: '$4,100', active: false },
    { time: '6pm', height: '88%', value: '$8,450', active: true },
    { time: '8pm', height: '42%', value: '$3,200', active: false },
    { time: '10pm', height: '32%', value: '$2,100', active: false }
  ];

  return (
    <div className="flex w-full min-h-screen bg-[#0a0a09] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none">
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between p-8 flex-shrink-0 z-20">
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

          {/* New Order */}
          <button
            onClick={() => triggerToast('Initializing New Order placement...')}
            className="w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer mb-8"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            New Order
          </button>

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
            <Link href="/pos/inventory" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">inventory_2</span>
              Inventory
            </Link>
            <Link href="/pos/staff" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">groups</span>
              Staff
            </Link>
            {/* Analytics — active */}
            <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab]">trending_up</span>
                Analytics
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 font-sans space-y-4">
          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>
          <Link href="/support" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">help</span>
            Support
          </Link>
          <Link href="/login" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="J. Smith avatar"
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

            <button 
              onClick={() => triggerToast('No new notifications.')}
              className="w-[42px] h-[42px] flex items-center justify-center bg-transparent border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-xl text-white transition-all cursor-pointer select-none relative"
            >
              <span className="material-symbols-outlined text-lg text-[#A69984]/60">notifications</span>
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>

            <Link 
              href="/dashboard"
              className="w-[42px] h-[42px] flex items-center justify-center bg-transparent border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-xl text-white transition-all cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-lg text-[#A69984]/60">settings</span>
            </Link>

            <button 
              onClick={() => triggerToast('Loading support page...')}
              className="w-[42px] h-[42px] flex items-center justify-center bg-transparent border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-xl text-white transition-all cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-lg text-[#A69984]/60">help</span>
            </button>

            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="Admin avatar"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
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
              onClick={() => triggerToast('Filter: Today selected')}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 hover:border-white/20 rounded-lg text-xs text-white font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Today
            </button>

            <button 
              onClick={() => triggerToast('Exporting analytics data...')}
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
                <span className="text-xl mr-0.5">$</span>24,590
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
              <h3 className="font-serif text-[34px] font-bold text-white mt-4">342</h3>
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
              <h3 className="font-serif text-[34px] font-bold text-white mt-4">845</h3>
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
              <h3 className="font-serif text-[34px] font-bold text-white mt-4">54<span className="text-xl font-sans ml-0.5">m</span></h3>
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

    </div>
  );
}
