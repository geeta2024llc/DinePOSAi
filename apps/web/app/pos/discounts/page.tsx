'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface DiscountCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  usageLimit: number;
  usageCount: number;
  expiry: string;
  active: boolean;
  description: string;
}

const initialDiscounts: DiscountCode[] = [
  { id: 'dc-1', code: 'DINE10',  type: 'percent', value: 10, minOrder: 0,   usageLimit: 200, usageCount: 84,  expiry: '2026-12-31', active: true,  description: '10% off any order' },
  { id: 'dc-2', code: 'DINE20',  type: 'percent', value: 20, minOrder: 100, usageLimit: 75,  usageCount: 31,  expiry: '2026-09-30', active: true,  description: '20% off orders over $100' },
  { id: 'dc-3', code: 'VIP50',   type: 'fixed',   value: 50, minOrder: 200, usageLimit: 20,  usageCount: 8,   expiry: '2026-08-31', active: true,  description: '$50 off for VIP guests (min $200)' },
  { id: 'dc-4', code: 'HAPPY15', type: 'percent', value: 15, minOrder: 0,   usageLimit: 300, usageCount: 201, expiry: '2026-07-31', active: true,  description: '15% Happy Hour discount' },
  { id: 'dc-5', code: 'CHEF25',  type: 'percent', value: 25, minOrder: 150, usageLimit: 30,  usageCount: 30,  expiry: '2026-06-30', active: false, description: "25% Chef's Special (expired)" },
  { id: 'dc-6', code: 'LUNCH30', type: 'fixed',   value: 30, minOrder: 80,  usageLimit: 100, usageCount: 44,  expiry: '2026-12-31', active: true,  description: '$30 off lunch specials' },
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDiscounts);
  const [searchQuery, setSearchQuery] = useState('');

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // New / edit form fields
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percent' | 'fixed'>('percent');
  const [formValue, setFormValue] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('0');
  const [formUsageLimit, setFormUsageLimit] = useState('100');
  const [formExpiry, setFormExpiry] = useState('2026-12-31');
  const [formDescription, setFormDescription] = useState('');

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormCode(''); setFormType('percent'); setFormValue('');
    setFormMinOrder('0'); setFormUsageLimit('100');
    setFormExpiry('2026-12-31'); setFormDescription('');
    setShowAddModal(true);
  };

  const openEditModal = (d: DiscountCode) => {
    setEditingId(d.id);
    setFormCode(d.code); setFormType(d.type); setFormValue(String(d.value));
    setFormMinOrder(String(d.minOrder)); setFormUsageLimit(String(d.usageLimit));
    setFormExpiry(d.expiry); setFormDescription(d.description);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formCode.trim() || !formValue) {
      triggerToast('Code and value are required.'); return;
    }
    const value = parseFloat(formValue) || 0;
    if (formType === 'percent' && (value <= 0 || value > 100)) {
      triggerToast('Percentage must be between 1 and 100.'); return;
    }
    if (editingId) {
      setDiscounts(prev => prev.map(d => d.id === editingId ? {
        ...d, code: formCode.toUpperCase().trim(), type: formType,
        value, minOrder: parseFloat(formMinOrder) || 0,
        usageLimit: parseInt(formUsageLimit) || 100,
        expiry: formExpiry, description: formDescription || d.description,
      } : d));
      triggerToast(`Code "${formCode.toUpperCase()}" updated.`);
    } else {
      const newDiscount: DiscountCode = {
        id: `dc-${Date.now()}`,
        code: formCode.toUpperCase().trim(),
        type: formType, value,
        minOrder: parseFloat(formMinOrder) || 0,
        usageLimit: parseInt(formUsageLimit) || 100,
        usageCount: 0, expiry: formExpiry, active: true,
        description: formDescription || `${formType === 'percent' ? value + '%' : '$' + value} off`,
      };
      setDiscounts(prev => [newDiscount, ...prev]);
      triggerToast(`Code "${newDiscount.code}" created!`);
    }
    setShowAddModal(false);
  };

  const handleToggleActive = (id: string) => {
    const disc = discounts.find(d => d.id === id);
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
    if (disc) triggerToast(`"${disc.code}" ${disc.active ? 'deactivated' : 'activated'}.`);
  };

  const handleDelete = (id: string) => {
    const disc = discounts.find(d => d.id === id);
    setDiscounts(prev => prev.filter(d => d.id !== id));
    if (disc) triggerToast(`Code "${disc.code}" deleted.`);
  };

  const filtered = discounts.filter(d => {
    const matchSearch = d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || (filterStatus === 'active' ? d.active : !d.active);
    return matchSearch && matchFilter;
  });

  const activeCount   = discounts.filter(d => d.active).length;
  const totalUsage    = discounts.reduce((s, d) => s + d.usageCount, 0);
  const estimatedSaved = discounts.reduce((s, d) => s + (d.type === 'fixed' ? d.value * d.usageCount : 0), 0);

  const inputCls = 'w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors';
  const labelCls = 'block text-[#A69984]/70 text-[9px] font-bold uppercase tracking-wider mb-1.5';

  return (
    <div className="flex w-full min-h-screen bg-[#0a0a09] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none">

      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between p-8 flex-shrink-0 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 overflow-y-auto`}>
        <div>
          {/* Brand */}
          <div className="mb-10 flex items-center">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 mr-3">
              <span className="material-symbols-outlined text-[19px] font-black leading-none">flatware</span>
            </div>
            <div>
              <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-[22px] tracking-wide block hover:opacity-85 transition-opacity leading-none">
                DinePosAi
              </Link>
              <span className="font-sans text-[8.5px] text-[#ffe2ab]/70 uppercase tracking-[0.2em] font-semibold mt-1 block">Premium Suite</span>
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


            <Link href="/pos/analytics" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
              Analytics
            </Link>
            <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow select-none">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none">sell</span>
                Discounts
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
          </nav>
        </div>

        <div className="border-t border-white/5 pt-6 font-sans space-y-4">
          <Link href="/pos/settings" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>
          <Link href="/login" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>
          <div 
            onClick={() => setOperatorModalOpen(true)}
            className="flex items-center gap-3 pt-2 cursor-pointer group hover:bg-white/5 p-2 rounded-xl transition-all"
          >
            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 group-hover:border-[#ffe2ab]/30 transition-colors">
              <img
                src={activeOperator.avatar}
                alt={`${activeOperator.name} avatar`}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-bold text-xs tracking-wide truncate group-hover:text-[#ffe2ab] transition-colors">{activeOperator.name}</div>
              <div className="text-[8px] text-[#ffe2ab]/70 font-bold tracking-wider uppercase mt-0.5">{activeOperator.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-grow flex flex-col min-h-screen bg-[#11100e]">

        {/* Header */}
        <header className="h-[65px] lg:h-[90px] border-b border-white/5 flex items-center justify-between px-4 lg:px-10 flex-shrink-0 bg-[#0e0e0d] sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center border border-white/10 rounded-xl text-white/70 hover:text-white cursor-pointer" aria-label="Open navigation">
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <h2 className="font-serif text-[17px] lg:text-[20px] font-bold text-white tracking-wide leading-none">
              Discount Management
            </h2>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span className="hidden sm:inline">New Code</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { label: 'Total Codes', value: discounts.length, icon: 'confirmation_number', color: 'text-[#ffe2ab]' },
              { label: 'Active Codes', value: activeCount, icon: 'check_circle', color: 'text-emerald-400' },
              { label: 'Total Uses', value: totalUsage, icon: 'analytics', color: 'text-sky-400' },
              { label: 'Fixed Savings', value: `$${estimatedSaved.toFixed(0)}`, icon: 'savings', color: 'text-violet-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#161513] border border-white/5 rounded-2xl p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] text-[#A69984]/60 font-bold uppercase tracking-wider">{stat.label}</span>
                  <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                </div>
                <div className={`font-serif text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filters + Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterStatus(f)}
                  className={`px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${filterStatus === f ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/70 border border-white/5 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#A69984]/40 text-base">search</span>
              <input
                type="text"
                placeholder="Search codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-[200px] lg:w-[240px] transition-colors"
              />
            </div>
          </div>

          {/* Discount Codes Table */}
          <div className="bg-[#161513] border border-white/5 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-12 px-6 py-3.5 border-b border-white/5 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest">
              <div className="col-span-2">Code</div>
              <div className="col-span-2">Type / Value</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1 text-center">Min Order</div>
              <div className="col-span-1 text-center">Usage</div>
              <div className="col-span-1 text-center">Expiry</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[#A69984]/30 font-sans text-xs">
                No discount codes match your search.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map(d => {
                  const usagePct = d.usageLimit > 0 ? (d.usageCount / d.usageLimit) * 100 : 0;
                  const isExpired = new Date(d.expiry) < new Date();
                  return (
                    <div key={d.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-0 px-5 lg:px-6 py-4 items-center hover:bg-white/[0.01] transition-colors ${!d.active ? 'opacity-50' : ''}`}>
                      {/* Code */}
                      <div className="lg:col-span-2 flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white tracking-widest">{d.code}</span>
                        {isExpired && <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase">Expired</span>}
                      </div>

                      {/* Type / Value */}
                      <div className="lg:col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${d.type === 'percent' ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/20 text-[#ffe2ab]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                          {d.type === 'percent' ? `${d.value}%` : `$${d.value}`} {d.type === 'percent' ? 'Off' : 'Fixed'}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="lg:col-span-3 text-[11px] text-[#A69984]/70 font-medium leading-snug truncate pr-2">
                        {d.description}
                      </div>

                      {/* Min order */}
                      <div className="lg:col-span-1 lg:text-center text-xs font-bold text-[#A69984]/60">
                        <span className="lg:hidden text-[9px] text-[#A69984]/40 uppercase mr-1">Min:</span>
                        {d.minOrder > 0 ? `$${d.minOrder}` : '—'}
                      </div>

                      {/* Usage */}
                      <div className="lg:col-span-1 lg:text-center space-y-1">
                        <div className="text-[10px] font-bold text-white/80">{d.usageCount} / {d.usageLimit}</div>
                        <div className="w-full bg-white/5 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full transition-all ${usagePct >= 100 ? 'bg-rose-400' : usagePct >= 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Expiry */}
                      <div className={`lg:col-span-1 lg:text-center text-[10px] font-bold ${isExpired ? 'text-rose-400' : 'text-[#A69984]/60'}`}>
                        <span className="lg:hidden text-[9px] text-[#A69984]/40 uppercase mr-1">Exp:</span>
                        {d.expiry}
                      </div>

                      {/* Status toggle */}
                      <div className="lg:col-span-1 lg:text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(d.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${d.active ? 'bg-emerald-500' : 'bg-white/10'}`}
                          aria-label={d.active ? 'Deactivate code' : 'Activate code'}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${d.active ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex items-center justify-start lg:justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(d)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A69984]/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A69984]/50 hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#161513] border border-white/10 rounded-2xl p-6 lg:p-8 w-full max-w-lg shadow-2xl animate-slide-in">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-5">
              <h3 className="font-serif text-xl text-white font-medium">
                {editingId ? 'Edit Discount Code' : 'Create Discount Code'}
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className={labelCls}>Promo Code *</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  className={`${inputCls} font-mono tracking-widest`}
                />
              </div>

              {/* Type */}
              <div>
                <label className={labelCls}>Discount Type *</label>
                <div className="grid grid-cols-2 bg-[#0e0e0d] border border-white/5 rounded-xl p-1 gap-1">
                  {(['percent', 'fixed'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${formType === t ? 'bg-white/8 text-white border border-white/10' : 'text-[#A69984]/50 hover:text-white'}`}
                    >
                      {t === 'percent' ? '% Percentage Off' : '$ Fixed Amount Off'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value + Min Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{formType === 'percent' ? 'Percentage (1–100) *' : 'Amount ($) *'}</label>
                  <input
                    type="number"
                    min="0"
                    max={formType === 'percent' ? 100 : undefined}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === 'percent' ? '10' : '25.00'}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Min Order ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Usage Limit + Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    placeholder="100"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this discount..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-7 pt-5 border-t border-white/5">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-transparent border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow cursor-pointer hover:scale-[1.01]">
                {editingId ? 'Save Changes' : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <span className="font-sans text-[11px] text-[#A69984]/80">{toast.message}</span>
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
