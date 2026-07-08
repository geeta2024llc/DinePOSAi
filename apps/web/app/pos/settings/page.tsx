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

export default function CashierSettingsPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Operator states
  const [activeOperator, setActiveOperator] = useState<Operator>(AVAILABLE_OPERATORS[0]);
  const [operatorModalOpen, setOperatorModalOpen] = useState(false);

  // Terminal Settings States
  const [terminalName, setTerminalName] = useState('Terminal 01');
  const [drawerAutoOpen, setDrawerAutoOpen] = useState(true);
  const [defaultCategory, setDefaultCategory] = useState('all');
  const [defaultServiceMode, setDefaultServiceMode] = useState('dine-in');

  // Receipt & Printing States
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [printerConnection, setPrinterConnection] = useState('browser');
  const [defaultPrinter, setDefaultPrinter] = useState('Star Micronics MCP31');

  // Checkout Defaults States
  const [tipPresets, setTipPresets] = useState('15,18,20');
  const [autoGratuityMinCovers, setAutoGratuityMinCovers] = useState(6);
  const [autoGratuityPct, setAutoGratuityPct] = useState(20);

  // Appearance & Interface States
  const [uiScaling, setUiScaling] = useState('standard');
  const [theme, setTheme] = useState('gold-obsidian');
  const [language, setLanguage] = useState('en');

  // Load preferences from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTerminalName(localStorage.getItem('dinepos_cashier_terminal_name') || 'Terminal 01');
      setDrawerAutoOpen(localStorage.getItem('dinepos_cashier_drawer_autoopen') !== 'false');
      setDefaultCategory(localStorage.getItem('dinepos_cashier_default_category') || 'all');
      setDefaultServiceMode(localStorage.getItem('dinepos_cashier_default_service_mode') || 'dine-in');

      setAutoPrintReceipt(localStorage.getItem('dinepos_cashier_auto_print_receipt') !== 'false');
      setPrinterConnection(localStorage.getItem('dinepos_cashier_printer_connection') || 'browser');
      setDefaultPrinter(localStorage.getItem('dinepos_cashier_default_printer') || 'Star Micronics MCP31');

      setTipPresets(localStorage.getItem('dinepos_cashier_tip_presets') || '15,18,20');
      setAutoGratuityMinCovers(parseInt(localStorage.getItem('dinepos_cashier_auto_gratuity_min_covers') || '6', 10));
      setAutoGratuityPct(parseInt(localStorage.getItem('dinepos_cashier_auto_gratuity_pct') || '20', 10));

      setUiScaling(localStorage.getItem('dinepos_cashier_ui_scaling') || 'standard');
      setTheme(localStorage.getItem('dinepos_cashier_theme') || 'gold-obsidian');
      setLanguage(localStorage.getItem('dinepos_cashier_language') || 'en');
    }
  }, []);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dinepos_cashier_terminal_name', terminalName);
        localStorage.setItem('dinepos_cashier_drawer_autoopen', String(drawerAutoOpen));
        localStorage.setItem('dinepos_cashier_default_category', defaultCategory);
        localStorage.setItem('dinepos_cashier_default_service_mode', defaultServiceMode);

        localStorage.setItem('dinepos_cashier_auto_print_receipt', String(autoPrintReceipt));
        localStorage.setItem('dinepos_cashier_printer_connection', printerConnection);
        localStorage.setItem('dinepos_cashier_default_printer', defaultPrinter);

        localStorage.setItem('dinepos_cashier_tip_presets', tipPresets);
        localStorage.setItem('dinepos_cashier_auto_gratuity_min_covers', String(autoGratuityMinCovers));
        localStorage.setItem('dinepos_cashier_auto_gratuity_pct', String(autoGratuityPct));

        localStorage.setItem('dinepos_cashier_ui_scaling', uiScaling);
        localStorage.setItem('dinepos_cashier_theme', theme);
        localStorage.setItem('dinepos_cashier_language', language);
        
        window.dispatchEvent(new CustomEvent('dinepos_settings_updated'));
      }

      setIsSaving(false);
      triggerToast('Cashier terminal preferences saved successfully!');
    }, 800);
  };

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

  return (
    <div className="flex w-full min-h-screen bg-[#0a0a09] text-[#e5e2e1] font-sans antialiased overflow-x-hidden select-none">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-0 p-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] p-8 opacity-100'
      }`}>
        <div>
          {/* Brand/Console Title */}
          <div className="mb-10 select-none flex items-center">
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

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-sans">
            <Link
              href="/pos"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">layers</span>
              Floor Map
            </Link>
            
            <Link
              href="/pos/history"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">receipt_long</span>
              Orders
            </Link>



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
          {/* Settings — active */}
          <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab]">settings</span>
              Settings
            </div>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
          </div>

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
      <div className="flex-grow flex flex-col min-h-screen relative bg-[#0e0e0e] px-12 pb-12">
        
        {/* Top Header Bar */}
        <header className="h-[90px] flex items-center justify-between flex-shrink-0 bg-transparent sticky top-0 z-10 select-none border-b border-white/5 mb-8">
          <div>
            <h1 className="font-serif text-[32px] font-bold text-white tracking-wide leading-none">
              POS Settings
            </h1>
            <p className="font-sans text-[11px] text-[#A69984]/50 mt-2 font-medium uppercase tracking-wider">
              Terminal Preferences & Checkout Configuration
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#ffe2ab]/20 bg-[#ffe2ab]/5 text-[#ffe2ab] font-sans font-bold text-[9px] uppercase tracking-wider rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Terminal Active
            </div>
          </div>
        </header>

        {/* Settings Grid Panel */}
        <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Panel 1: Terminal & General Settings */}
            <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="material-symbols-outlined text-lg text-[#ffe2ab]">terminal</span>
                <h3 className="font-serif text-lg font-bold text-white">Terminal Setup</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Terminal ID / Name</label>
                  <input
                    type="text"
                    value={terminalName}
                    onChange={(e) => setTerminalName(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                    placeholder="e.g. Terminal 01"
                  />
                </div>

                <div className="flex justify-between items-center py-2">
                  <div>
                    <h4 className="text-white font-bold">Auto-Open Cash Drawer</h4>
                    <p className="text-[10px] text-[#A69984]/50 mt-0.5">Kick drawer trigger automatically on Cash pay</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerAutoOpen(!drawerAutoOpen)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${drawerAutoOpen ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${drawerAutoOpen ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Default Catalog Category</label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  >
                    <option value="all">All Items</option>
                    <option value="special">Specials</option>
                    <option value="combos">Combo Sets</option>
                    <option value="starters">Starters</option>
                    <option value="mains">Main Courses</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Default Service Mode</label>
                  <select
                    value={defaultServiceMode}
                    onChange={(e) => setDefaultServiceMode(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  >
                    <option value="dine-in">Dine-in</option>
                    <option value="takeaway">Takeaway (Walk-in)</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Panel 2: Printing Preferences */}
            <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="material-symbols-outlined text-lg text-[#ffe2ab]">print</span>
                <h3 className="font-serif text-lg font-bold text-white">Receipt Printer</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h4 className="text-white font-bold">Auto-Print on Checkout</h4>
                    <p className="text-[10px] text-[#A69984]/50 mt-0.5">Send receipt to printer immediately when closed</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPrintReceipt(!autoPrintReceipt)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${autoPrintReceipt ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${autoPrintReceipt ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Printer Interface Mode</label>
                  <select
                    value={printerConnection}
                    onChange={(e) => setPrinterConnection(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  >
                    <option value="browser">Browser Print (AirPrint / System Dialog)</option>
                    <option value="bluetooth">Bluetooth ESC/POS</option>
                    <option value="usb">Direct USB Connection</option>
                    <option value="network">Network IP / Ethernet</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Default Thermal Printer</label>
                  <select
                    value={defaultPrinter}
                    onChange={(e) => setDefaultPrinter(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  >
                    <option value="Star Micronics MCP31">Star Micronics mC-Print3 (80mm)</option>
                    <option value="Epson TM-m30II">Epson TM-m30II Thermal (80mm)</option>
                    <option value="Boca Ticket Printer">Boca Ticket (58mm)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => triggerToast('Sending test ticket print job via service...')}
                  className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">print_connect</span>
                  Print Test Receipt
                </button>
              </div>
            </div>

            {/* Panel 3: Checkout Defaults */}
            <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="material-symbols-outlined text-lg text-[#ffe2ab]">payments</span>
                <h3 className="font-serif text-lg font-bold text-white">Checkout & Tips</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Suggested Tip Options (%)</label>
                  <input
                    type="text"
                    value={tipPresets}
                    onChange={(e) => setTipPresets(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                    placeholder="e.g. 15,18,20"
                  />
                  <p className="text-[10px] text-[#A69984]/40 mt-1">Comma-separated percentage values to present on receipt</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Auto-Gratuity Threshold</label>
                    <input
                      type="number"
                      value={autoGratuityMinCovers}
                      onChange={(e) => setAutoGratuityMinCovers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                    />
                    <p className="text-[10px] text-[#A69984]/40">Covers or guests count</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Auto-Gratuity Rate (%)</label>
                    <input
                      type="number"
                      value={autoGratuityPct}
                      onChange={(e) => setAutoGratuityPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                    />
                    <p className="text-[10px] text-[#A69984]/40">Applied auto percentage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 4: Interface & Language */}
            <div className="bg-[#121211] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="material-symbols-outlined text-lg text-[#ffe2ab]">palette</span>
                <h3 className="font-serif text-lg font-bold text-white">Appearance & UI</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Touchscreen Layout Scaling</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['compact', 'standard', 'large'].map(scale => (
                      <button
                        type="button"
                        key={scale}
                        onClick={() => setUiScaling(scale)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                          uiScaling === scale
                            ? 'bg-[#ffe2ab] text-[#402d00] border-[#ffe2ab]'
                            : 'bg-[#0a0a09] hover:bg-white/5 text-[#A69984] border-white/5'
                        }`}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Terminal Color Palette</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  >
                    <option value="gold-obsidian">Obsidian Gold (Premium)</option>
                    <option value="midnight">Midnight Onyx (Dark Theme)</option>
                    <option value="emerald">Emerald Luxe (Classic)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#A69984]/70 font-bold uppercase tracking-wider">Terminal Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  >
                    <option value="en">English (US)</option>
                    <option value="ja">日本語 (Japanese)</option>
                    <option value="zh">简体中文 (Chinese)</option>
                    <option value="ko">한국어 (Korean)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4 border-t border-white/5 max-w-4xl justify-end">
            <Link
              href="/pos"
              className="py-3 px-6 rounded-xl border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-8 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#402d00]/30 border-t-[#402d00] rounded-full animate-spin"></span>
                  Saving Settings...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">save</span>
                  Save Terminal Preferences
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* TOAST ALERT */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#121211] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-[#ffe2ab]">info</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Terminal Alert</div>
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
