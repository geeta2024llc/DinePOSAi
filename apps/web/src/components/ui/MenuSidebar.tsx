'use client';

import React from 'react';
import Link from 'next/link';

export interface SidebarCategory {
  id: string;
  name: string;
  icon?: string;
}

interface MenuSidebarProps {
  categories: SidebarCategory[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  sidebarCollapsed: boolean;
  onCallWaiter?: () => void;
  enableSelfCheckout?: boolean;
  tableNumber?: number;
  diningOption?: string;
  activeOrdersCount?: number;
  itemCounts?: Record<string, number>;
  activePath?: 'menu' | 'order-status' | 'checkout' | 'concierge';
}

export const MenuSidebar: React.FC<MenuSidebarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  isMobileOpen,
  onCloseMobile,
  sidebarCollapsed,
  onCallWaiter,
  enableSelfCheckout = true,
  tableNumber = 12,
  diningOption = 'dine-in',
  activeOrdersCount = 0,
  itemCounts = {},
  activePath = 'menu'
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full flex flex-col justify-between border-r border-white/10 bg-gradient-to-b from-[#12110f] via-[#0a0a09] to-[#080807] flex-shrink-0 z-50 transition-all duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarCollapsed
            ? 'w-0 lg:w-0 opacity-0 pointer-events-none border-r-0'
            : 'w-[280px] opacity-100'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 pb-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffe2ab]/25 via-[#ffe2ab]/10 to-[#ffe2ab]/5 border border-[#ffe2ab]/40 flex items-center justify-center text-[#ffe2ab] shadow-[0_0_20px_rgba(255,226,171,0.15)] group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-xl leading-none notranslate" translate="no">
                  restaurant_menu
                </span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-wide bg-gradient-to-r from-[#ffe2ab] via-[#fff5e0] to-[#ffd080] bg-clip-text text-transparent block group-hover:opacity-90 transition-opacity">
                  DinePOS AI
                </span>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#ffe2ab]/60 font-semibold block -mt-0.5">
                  Executive Suite
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A69984] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-sm notranslate" translate="no">close</span>
            </button>
          </div>

          {/* Table & Status Banner */}
          <div className="mt-4 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-sans text-xs font-semibold text-white/90">
                Main Dining Room
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#ffe2ab] bg-[#ffe2ab]/10 px-2 py-0.5 rounded border border-[#ffe2ab]/20 uppercase">
              T-{tableNumber}
            </span>
          </div>
        </div>

        {/* Scrollable Categories List - Flexible space, NO height limit, NO hidden items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-[#ffe2ab]/20 transition-colors">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#ffe2ab]/50 font-bold flex items-center justify-between">
            <span>Menu Categories</span>
            <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[#A69984] font-semibold">
              {categories.length}
            </span>
          </div>

          <nav className="space-y-1">
            {categories.map((cat) => {
              const isActive = activePath === 'menu' && activeCategory === cat.id;
              const count = itemCounts[cat.id];

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between w-full px-3.5 py-3 rounded-r-xl rounded-l-sm font-sans text-xs uppercase tracking-wider transition-all duration-200 group text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ffe2ab]/20 via-[#ffe2ab]/10 to-transparent text-[#ffe2ab] border-l-4 border-[#ffe2ab] shadow-[inset_0_1px_0_0_rgba(255,226,171,0.2)] font-bold'
                      : 'text-[#A69984]/85 hover:text-white hover:bg-white/[0.06] border-l-4 border-transparent hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-[#ffe2ab]/25 text-[#ffe2ab]'
                          : 'bg-white/5 text-[#A69984] group-hover:text-white group-hover:bg-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base leading-none notranslate" translate="no">
                        {cat.icon || 'restaurant_menu'}
                      </span>
                    </div>
                    <span className="truncate font-semibold">{cat.name}</span>
                  </div>

                  {typeof count === 'number' && count > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ml-2 transition-colors ${
                        isActive
                          ? 'bg-[#ffe2ab] text-[#3b2700] shadow-sm'
                          : 'bg-white/5 group-hover:bg-white/15 text-[#A69984] group-hover:text-white'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Services & Bottom Navigation Triggers */}
        <div className="p-3.5 border-t border-white/10 bg-[#080807]/90 backdrop-blur-md flex-shrink-0 space-y-1.5">
          <div className="px-3 pt-1 pb-1 text-[10px] font-mono uppercase tracking-widest text-[#ffe2ab]/50 font-bold">
            Services & Actions
          </div>

          <Link
            href="/menu/order-status"
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 font-sans font-semibold text-xs uppercase tracking-wider ${
              activePath === 'order-status'
                ? 'bg-[#ffe2ab]/20 text-[#ffe2ab] border border-[#ffe2ab]/30 shadow-sm'
                : 'text-[#ffe2ab]/90 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab] notranslate" translate="no">
                hourglass_empty
              </span>
              <span>Order Status</span>
            </div>
            {activeOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </Link>

          {enableSelfCheckout && (
            <Link
              href="/menu/checkout"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 font-sans font-semibold text-xs uppercase tracking-wider ${
                activePath === 'checkout'
                  ? 'bg-[#ffe2ab]/20 text-[#ffe2ab] border border-[#ffe2ab]/30 shadow-sm'
                  : 'text-[#ffe2ab]/90 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab] notranslate" translate="no">
                  credit_card
                </span>
                <span>Self Checkout</span>
              </div>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              if (onCallWaiter) onCallWaiter();
              onCloseMobile();
            }}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-[#ffe2ab] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all duration-200 font-sans font-semibold text-xs uppercase tracking-wider group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg leading-none text-amber-400 group-hover:animate-bounce notranslate" translate="no">
                notifications
              </span>
              <span>Call Waiter</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
              ALERT
            </span>
          </button>

          {/* Footer Mode Indicator */}
          <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-[#A69984]/70 font-sans">
            <span className="capitalize">Mode: {diningOption}</span>
            <span className="font-mono text-[10px] text-[#ffe2ab]/60">v1.0 Executive</span>
          </div>
        </div>
      </aside>
    </>
  );
};
