'use client';

import React from 'react';
import Link from 'next/link';

// --------------------------------------------------------------------------
// Feature modules — static marketing showcase (no session injection)
// --------------------------------------------------------------------------
const MODULES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'A unified command centre giving managers real-time visibility into revenue, active orders, staff on-floor, and menu performance — all in one screen.',
    icon: 'dashboard',
    gradient: 'from-[#ffe2ab]/15 to-[#cc9d31]/5',
    accent: '#ffe2ab',
    badge: 'Admin',
    highlights: ['Live Revenue Stats', 'Menu Management', 'Staff Control', 'Settings & Config'],
  },
  {
    id: 'pos',
    label: 'Point of Sale',
    description: 'High-speed cashier terminal built for busy dining rooms. Supports Dine-In, Takeaway and Delivery with smart split-bill, tips, and instant receipts.',
    icon: 'point_of_sale',
    gradient: 'from-emerald-500/15 to-emerald-900/5',
    accent: '#34d399',
    badge: 'Cashier',
    highlights: ['Live Order Entry', 'Split Bill', 'Tips & Gratuity', 'Receipts & Invoices'],
  },
  {
    id: 'menu',
    label: 'Digital Menu',
    description: 'Guest-facing QR menu with cart, AI concierge assistant, real-time order tracking, and self-checkout. Zero app install required for customers.',
    icon: 'menu_book',
    gradient: 'from-violet-500/15 to-violet-900/5',
    accent: '#a78bfa',
    badge: 'Guest',
    highlights: ['QR Table Ordering', 'AI Concierge', 'Live Cart', 'Order Status'],
  },
  {
    id: 'kds',
    label: 'Kitchen Display',
    description: 'Real-time ticket board for kitchen teams — colour-coded by urgency, with course-based routing, bump-to-complete controls, and allergy alerts.',
    icon: 'kitchen',
    gradient: 'from-orange-500/15 to-orange-900/5',
    accent: '#fb923c',
    badge: 'Kitchen',
    highlights: ['Live Ticket Board', 'Course Routing', 'Urgency Alerts', 'Bump Controls'],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Track stock levels across every ingredient and supply item. Set low-stock thresholds, log waste, and manage supplier purchase orders without spreadsheets.',
    icon: 'inventory_2',
    gradient: 'from-sky-500/15 to-sky-900/5',
    accent: '#38bdf8',
    badge: 'Manager',
    highlights: ['Stock Tracking', 'Low-Stock Alerts', 'Waste Logging', 'Purchase Orders'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Deep-dive sales reports revealing your best sellers, peak service hours, staff efficiency, profit margins, and customer trends over time.',
    icon: 'bar_chart',
    gradient: 'from-pink-500/15 to-pink-900/5',
    accent: '#f472b6',
    badge: 'Manager',
    highlights: ['Sales Trends', 'Best Sellers', 'Peak Hours', 'Profit Margins'],
  },
];

export default function DemoPage() {
  React.useEffect(() => {
    document.title = 'Platform Overview — DinePosAi';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a09] text-white font-sans antialiased overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#ffe2ab]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a09]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-[#ffe2ab] text-xl font-semibold tracking-wide select-none">
            DinePosAi
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[#A69984] hover:text-white text-xs font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffe2ab] text-[#402d00] font-bold text-xs tracking-wide hover:bg-[#ffdca0] transition-colors"
            >
              Start Free Trial
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ffe2ab]/30 bg-[#ffe2ab]/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#ffe2ab] animate-pulse shadow-[0_0_6px_#ffe2ab]" />
          <span className="text-[#ffe2ab] text-[10px] font-bold uppercase tracking-[0.2em]">Platform Overview</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffe2ab] to-[#cc9d31]">
          Everything Your Restaurant<br />Needs in One Platform
        </h1>
        <p className="text-[#A69984] text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          DinePosAi brings together POS, Digital Menu, Kitchen Display, Inventory, and Analytics into a single seamless system. Explore each module below.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ffe2ab] text-[#402d00] font-bold text-sm tracking-wide hover:bg-[#ffdca0] transition-all hover:scale-[1.02] shadow-[0_4px_24px_rgba(255,226,171,0.2)]"
          >
            Start 7-Day Free Trial
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm tracking-wide transition-all"
          >
            View Pricing
          </Link>
        </div>
      </header>

      {/* Module Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <div
              key={mod.id}
              className="relative rounded-2xl border border-white/8 bg-[#111110] overflow-hidden transition-all duration-300 hover:border-white/18 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:scale-[1.01]"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-7">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${mod.accent}18`, border: `1px solid ${mod.accent}30` }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ color: mod.accent }}>{mod.icon}</span>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
                    style={{ background: `${mod.accent}15`, color: mod.accent, border: `1px solid ${mod.accent}25` }}
                  >
                    {mod.badge}
                  </span>
                </div>

                <h2 className="text-white font-bold text-lg mb-2">{mod.label}</h2>
                <p className="text-[#A69984] text-xs leading-relaxed mb-5">{mod.description}</p>

                <div className="grid grid-cols-2 gap-1.5">
                  {mod.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: mod.accent }} />
                      <span className="text-[#A69984] text-[10px] font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 max-w-2xl">
            <span className="material-symbols-outlined text-[#ffe2ab] text-3xl mb-4 block">rocket_launch</span>
            <h3 className="text-white font-bold text-2xl mb-3 font-serif">Ready to get started?</h3>
            <p className="text-[#A69984] text-sm leading-relaxed mb-7">
              Sign up today and get full access to every module for <strong className="text-white">7 days — completely free</strong>. No credit card required. After your trial, choose the plan that fits your restaurant.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ffe2ab] text-[#402d00] font-bold text-sm hover:bg-[#ffdca0] transition-all hover:scale-[1.02] shadow-[0_4px_24px_rgba(255,226,171,0.2)]"
              >
                Start Free Trial
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
              >
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
