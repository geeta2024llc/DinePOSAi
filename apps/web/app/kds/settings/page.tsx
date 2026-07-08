'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';

export default function KdsSettingsPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Settings State
  const [settings, setSettings] = useState({
    stationName: 'Grill & Sauté',
    highContrast: false,
    audioAlerts: true,
    autoBump: 0, // 0 means disabled
    ticketSize: 'normal',
    printerId: 'kitchen-1'
  });

  useEffect(() => {
    const saved = localStorage.getItem('dinepos_kds_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dinepos_kds_settings', JSON.stringify(settings));
  }, [settings]);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleUpdateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    triggerToast('Settings updated.');
  };

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-30 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0 h-full ${
        sidebarCollapsed 
          ? 'w-0 lg:w-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] opacity-100'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-8 pb-4">
            <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-2xl tracking-wide select-none block hover:opacity-85 transition-opacity mb-1.5">
              DinePosAi
            </Link>
            <div className="font-sans font-bold text-[9px] text-[#A69984]/50 uppercase tracking-[0.2em] select-none">
              Main Dining Room
            </div>
          </div>
          
          {/* Navigation Options */}
          <nav className="px-5 space-y-2.5 mt-8">
            <Link 
              href="/kds" 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/85 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">flatware</span>
              Kitchen KDS
            </Link>

            <Link 
              href="/menu" 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/85 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">menu_book</span>
              Digital Menu
            </Link>
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="px-5 pb-8 space-y-2">
          <button
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white transition-all duration-300 w-full text-left"
          >
            <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab]">settings</span>
            Settings
          </button>
          <Link
            href="/login?logout=true"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-sans font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>
        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* MAIN KITCHEN SETTINGS CONSOLE */}
      <main className="flex-1 flex flex-col h-full bg-[#11100e] relative overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-10 py-5 sm:py-7 flex-shrink-0 bg-[#0e0e0d] border-b border-white/5 sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <div>
              <h1 className="font-serif text-xl sm:text-[28px] font-bold text-[#ffe2ab] tracking-wide leading-none">
                Station Configuration
              </h1>
              <p className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.15em] mt-1.5 sm:mt-2.5">
                • {settings.stationName.toUpperCase()}
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Settings Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 sm:py-10">
          <div className="max-w-4xl space-y-8">
            
            {/* Section 1: Station Identification */}
            <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-6">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl">router</span>
                <h2 className="font-serif text-lg text-white font-bold tracking-wide">Station Identity & Routing</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-wider mb-2.5">
                    Assigned Station Line
                  </label>
                  <select
                    value={settings.stationName}
                    onChange={(e) => handleUpdateSetting('stationName', e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors cursor-pointer"
                  >
                    <option value="Grill & Sauté">Grill & Sauté</option>
                    <option value="Cold Prep & Salads">Cold Prep & Salads</option>
                    <option value="Fry Station">Fry Station</option>
                    <option value="Dessert & Pastry">Dessert & Pastry</option>
                    <option value="Expo / Pass">Expo / Pass (All Routes)</option>
                  </select>
                  <p className="text-[10px] text-[#A69984]/60 mt-2 font-medium">Determines which items are routed to this specific display.</p>
                </div>
                
                <div>
                  <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-wider mb-2.5">
                    Connected Prep Printer
                  </label>
                  <select
                    value={settings.printerId}
                    onChange={(e) => handleUpdateSetting('printerId', e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors cursor-pointer"
                  >
                    <option value="none">No Printer (Paperless)</option>
                    <option value="kitchen-1">Kitchen Printer 1 (Epson TM-T88)</option>
                    <option value="kitchen-2">Kitchen Printer 2 (Star Micronics)</option>
                    <option value="expo-1">Expo Packing Printer</option>
                  </select>
                  <p className="text-[10px] text-[#A69984]/60 mt-2 font-medium">Route automated paper tickets upon bump.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Display Preferences */}
            <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-6">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl">display_settings</span>
                <h2 className="font-serif text-lg text-white font-bold tracking-wide">Display & Visibility</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0e0e0d]/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">High Contrast Mode</h4>
                    <p className="text-[10px] text-[#A69984]/60 mt-1">Boosts text contrast and color saturation for brightly lit kitchens.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleUpdateSetting('highContrast', !settings.highContrast)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${settings.highContrast ? 'bg-emerald-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${settings.highContrast ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-wider mb-2.5">
                    Ticket Sizing Layout
                  </label>
                  <div className="flex bg-[#0e0e0d] border border-white/5 rounded-xl p-1 gap-1">
                    <button 
                      onClick={() => handleUpdateSetting('ticketSize', 'compact')}
                      className={`flex-1 py-2.5 rounded-lg font-sans text-xs font-bold transition-all duration-300 cursor-pointer ${
                        settings.ticketSize === 'compact' 
                          ? 'bg-[#ffe2ab]/10 text-[#ffe2ab] border border-[#ffe2ab]/20 shadow-inner' 
                          : 'text-[#A69984]/60 hover:text-white border border-transparent'
                      }`}
                    >
                      Compact (More Grid)
                    </button>
                    <button 
                      onClick={() => handleUpdateSetting('ticketSize', 'normal')}
                      className={`flex-1 py-2.5 rounded-lg font-sans text-xs font-bold transition-all duration-300 cursor-pointer ${
                        settings.ticketSize === 'normal' 
                          ? 'bg-[#ffe2ab]/10 text-[#ffe2ab] border border-[#ffe2ab]/20 shadow-inner' 
                          : 'text-[#A69984]/60 hover:text-white border border-transparent'
                      }`}
                    >
                      Normal Layout
                    </button>
                    <button 
                      onClick={() => handleUpdateSetting('ticketSize', 'large')}
                      className={`flex-1 py-2.5 rounded-lg font-sans text-xs font-bold transition-all duration-300 cursor-pointer ${
                        settings.ticketSize === 'large' 
                          ? 'bg-[#ffe2ab]/10 text-[#ffe2ab] border border-[#ffe2ab]/20 shadow-inner' 
                          : 'text-[#A69984]/60 hover:text-white border border-transparent'
                      }`}
                    >
                      Extra Large Text
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Alerts & Automation */}
            <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-6">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl">notifications_active</span>
                <h2 className="font-serif text-lg text-white font-bold tracking-wide">Alerts & Automation</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0e0e0d]/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">Audio Notifications</h4>
                    <p className="text-[10px] text-[#A69984]/60 mt-1">Play a chime sound when a new ticket is pushed to this station.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleUpdateSetting('audioAlerts', !settings.audioAlerts)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${settings.audioAlerts ? 'bg-emerald-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${settings.audioAlerts ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-wider mb-2.5">
                    Auto-Bump Completed Orders
                  </label>
                  <select
                    value={settings.autoBump}
                    onChange={(e) => handleUpdateSetting('autoBump', parseInt(e.target.value))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ffe2ab]/40 transition-colors cursor-pointer"
                  >
                    <option value={0}>Disabled (Manual Bump Only)</option>
                    <option value={1}>After 1 Minute</option>
                    <option value={3}>After 3 Minutes</option>
                    <option value={5}>After 5 Minutes</option>
                  </select>
                  <p className="text-[10px] text-[#A69984]/60 mt-2 font-medium">Automatically archive orders from the "Complete" tab after the specified time.</p>
                </div>
              </div>
            </div>

            {/* End Space */}
            <div className="h-10"></div>
          </div>
        </div>
      </main>

      {/* FEEDBACK TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#10b981]/30 text-[#34d399] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Success</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
