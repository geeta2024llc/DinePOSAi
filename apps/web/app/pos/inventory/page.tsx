'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Meat & Seafood' | 'Dry Goods' | 'Dairy' | 'Beverage';
  currentStock: number;
  parLevel: number;
  unit: string;
  status: 'in-stock' | 'low' | 'out';
  lastUpdated: string;
}

const inventoryData: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'A5 Wagyu Beef (Loin)',
    category: 'Meat & Seafood',
    currentStock: 8.5,
    parLevel: 5.0,
    unit: 'kg',
    status: 'in-stock',
    lastUpdated: '10 mins ago'
  },
  {
    id: 'inv-2',
    name: 'Beluga Caviar',
    category: 'Meat & Seafood',
    currentStock: 3,
    parLevel: 8,
    unit: 'jars',
    status: 'low',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'inv-3',
    name: 'Fresh Oysters (Miyagi)',
    category: 'Meat & Seafood',
    currentStock: 120,
    parLevel: 100,
    unit: 'pcs',
    status: 'in-stock',
    lastUpdated: '30 mins ago'
  },
  {
    id: 'inv-4',
    name: 'Black Truffles (Perigord)',
    category: 'Dry Goods',
    currentStock: 150,
    parLevel: 300,
    unit: 'g',
    status: 'low',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'inv-5',
    name: 'Diver Scallops',
    category: 'Meat & Seafood',
    currentStock: 0,
    parLevel: 4.0,
    unit: 'kg',
    status: 'out',
    lastUpdated: 'Just now'
  },
  {
    id: 'inv-6',
    name: 'USDA Prime Filet Mignon',
    category: 'Meat & Seafood',
    currentStock: 12.0,
    parLevel: 10.0,
    unit: 'kg',
    status: 'in-stock',
    lastUpdated: '15 mins ago'
  },
  {
    id: 'inv-7',
    name: 'Arborio Rice',
    category: 'Dry Goods',
    currentStock: 25.0,
    parLevel: 15.0,
    unit: 'kg',
    status: 'in-stock',
    lastUpdated: '1 day ago'
  },
  {
    id: 'inv-8',
    name: 'Burrata Cheese (Fresh)',
    category: 'Dairy',
    currentStock: 18,
    parLevel: 15,
    unit: 'pcs',
    status: 'in-stock',
    lastUpdated: '45 mins ago'
  },
  {
    id: 'inv-9',
    name: 'Saffron Threads',
    category: 'Dry Goods',
    currentStock: 45,
    parLevel: 30,
    unit: 'g',
    status: 'in-stock',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'inv-10',
    name: 'Valrhona Dark Chocolate 70%',
    category: 'Dry Goods',
    currentStock: 15.0,
    parLevel: 8.0,
    unit: 'kg',
    status: 'in-stock',
    lastUpdated: 'Yesterday'
  },
  {
    id: 'inv-11',
    name: 'Chilean Sea Bass Fillet',
    category: 'Meat & Seafood',
    currentStock: 0.8,
    parLevel: 6.0,
    unit: 'kg',
    status: 'low',
    lastUpdated: 'Just now'
  },
  {
    id: 'inv-12',
    name: 'Heavy Cream 36%',
    category: 'Dairy',
    currentStock: 4.0,
    parLevel: 10.0,
    unit: 'L',
    status: 'low',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'inv-13',
    name: 'Gold Leaf Sheets',
    category: 'Dry Goods',
    currentStock: 25,
    parLevel: 50,
    unit: 'sheets',
    status: 'low',
    lastUpdated: '3 days ago'
  },
  {
    id: 'inv-14',
    name: 'Bourbon Whiskey (Premium)',
    category: 'Beverage',
    currentStock: 14,
    parLevel: 10,
    unit: 'bottles',
    status: 'in-stock',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'inv-15',
    name: 'Dom Perignon Champagne',
    category: 'Beverage',
    currentStock: 8,
    parLevel: 6,
    unit: 'bottles',
    status: 'in-stock',
    lastUpdated: '30 mins ago'
  },
  {
    id: 'inv-16',
    name: 'Chartreuse Liqueur',
    category: 'Beverage',
    currentStock: 0,
    parLevel: 4,
    unit: 'bottles',
    status: 'out',
    lastUpdated: 'Just now'
  }
];

const statusConfig = {
  'in-stock': { label: 'In Stock', badge: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400', progress: 'bg-emerald-400' },
  'low': { label: 'Low Stock', badge: 'bg-amber-400/10 border-amber-400/20 text-amber-400', progress: 'bg-amber-400' },
  'out': { label: 'Out of Stock', badge: 'bg-rose-400/10 border-rose-400/20 text-rose-400', progress: 'bg-rose-500' }
};

export default function PosInventoryPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-stock' | 'low' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const filtered = inventoryData.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalSKUs = inventoryData.length;
  const lowCount = inventoryData.filter(i => i.status === 'low').length;
  const outCount = inventoryData.filter(i => i.status === 'out').length;

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">

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
          <Link
            href="/pos"
            className="w-full py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer mb-8"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            New Order
          </Link>

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
            {/* Inventory — active */}
            <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none">inventory_2</span>
                Inventory
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
            <Link href="/pos/staff" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">groups</span>
              Staff
            </Link>
            <Link href="/pos/analytics" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
              Analytics
            </Link>
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

      {/* MAIN CONTENT */}
      <div className="flex-grow flex flex-col min-h-screen bg-[#11100e] overflow-hidden">

        {/* Header */}
        <header className="h-[90px] border-b border-white/5 flex items-center justify-between px-10 flex-shrink-0 bg-[#0e0e0d] sticky top-0 z-40">
          <div>
            <h2 className="font-serif text-[20px] font-bold text-white tracking-wide leading-none">Inventory Control</h2>
            <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-1">Read-only view · Real-time stock levels</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-base">search</span>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-[200px] transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/45 text-sm">category</span>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/20 appearance-none cursor-pointer font-semibold min-w-[160px]"
              >
                <option value="all">All Categories</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Dry Goods">Dry Goods</option>
                <option value="Dairy">Dairy</option>
                <option value="Beverage">Beverage</option>
              </select>
              <span className="material-symbols-outlined absolute right-3.5 top-3 text-[#A69984]/40 text-sm pointer-events-none">keyboard_arrow_down</span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center bg-[#161513] border border-white/5 rounded-xl p-1 gap-1">
              {(['all', 'in-stock', 'low', 'out'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterStatus === f
                      ? 'bg-[#ffe2ab] text-[#402d00]'
                      : 'text-[#A69984]/70 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'in-stock' ? 'In Stock' : f === 'low' ? 'Low' : 'Out'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Stats row */}
        <div className="px-10 py-6 grid grid-cols-3 gap-6 flex-shrink-0">
          {[
            { label: 'Total SKUs', value: totalSKUs, icon: 'inventory', color: 'text-white/80', bg: 'bg-white/5', border: 'border-white/10' },
            { label: 'Low Stock Items', value: lowCount, icon: 'warning', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
            { label: 'Out of Stock', value: outCount, icon: 'error_outline', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
          ].map(card => (
            <div key={card.label} className={`bg-[#161513] border ${card.border} rounded-2xl p-5 flex items-center gap-5`}>
              <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center ${card.color}`}>
                <span className="material-symbols-outlined text-lg">{card.icon}</span>
              </div>
              <div>
                <p className="text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest">{card.label}</p>
                <h3 className={`text-3xl font-bold font-mono ${card.color} mt-0.5`}>{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory List */}
        <div className="flex-grow px-10 pb-10 overflow-y-auto">
          <div className="bg-[#161513] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0e0e0d]/50 text-[9.5px] font-bold text-[#A69984]/70 uppercase tracking-widest select-none">
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stock Level Gauge</th>
                    <th className="px-6 py-4">Current Qty</th>
                    <th className="px-6 py-4">Par Level</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-xs">
                  {filtered.length > 0 ? (
                    filtered.map((item) => {
                      const sc = statusConfig[item.status];
                      
                      // Calculate stock percentage for gauge
                      const ratio = item.parLevel > 0 ? item.currentStock / item.parLevel : 0;
                      const percentage = Math.min(Math.round(ratio * 100), 100);

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                          {/* Item Name */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-white tracking-wide">{item.name}</div>
                            <div className="text-[9px] text-[#A69984]/40 mt-0.5">Updated {item.lastUpdated}</div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-white/5 text-white/70 border border-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg">
                              {item.category}
                            </span>
                          </td>

                          {/* Stock Level Gauge */}
                          <td className="px-6 py-4 w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-[#12110f] border border-white/5 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${sc.progress} transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-mono text-[#A69984] font-bold w-8 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </td>

                          {/* Current Qty */}
                          <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                            {item.currentStock} <span className="text-[10px] text-[#A69984]/50 font-sans font-medium uppercase ml-0.5">{item.unit}</span>
                          </td>

                          {/* Par Level */}
                          <td className="px-6 py-4 font-mono text-[#A69984]/80 text-sm">
                            {item.parLevel} <span className="text-[10px] text-[#A69984]/50 font-sans font-medium uppercase ml-0.5">{item.unit}</span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${sc.badge}`}>
                              {sc.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => triggerToast(`Restock requested for ${item.name} (${item.parLevel * 2} ${item.unit})`)}
                                className="px-2.5 py-1.5 bg-[#ffe2ab]/5 hover:bg-[#ffe2ab]/10 border border-[#ffe2ab]/15 text-[#ffe2ab] hover:text-white text-[9.5px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-xs">local_shipping</span>
                                Reorder
                              </button>
                              <button
                                onClick={() => triggerToast(`Reported stock discrepancy for ${item.name}`)}
                                className="px-2.5 py-1.5 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 border border-white/5 text-[#A69984] text-[9.5px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-xs">report</span>
                                Flag
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-24 text-center text-[#A69984]/40 font-sans text-xs">
                        <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">inventory_2</span>
                        No inventory items found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e1c19] border border-[#ffe2ab]/20 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-fade-in">
          <span className="material-symbols-outlined text-[#ffe2ab] text-base">check_circle</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
