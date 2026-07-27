'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiRequest } from '@/utils/api';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  allergens?: string[];
  spicyLevel?: string;
  active?: boolean;
}

interface PublicBrandingConfig {
  restaurantName: string;
  welcomeSubtitle: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: 'gold' | 'emerald' | 'sapphire' | 'rose' | 'amber';
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  phone?: string;
  address?: string;
}

const defaultBranding: PublicBrandingConfig = {
  restaurantName: 'DinePOS AI Fine Dining',
  welcomeSubtitle: 'Exquisite Culinary Offerings & Signature Dishes',
  logoUrl: '/images/restaurant_logo.png',
  bannerUrl: '/images/wagyu_ribeye.png',
  themeColor: 'gold',
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  websiteUrl: 'https://dineposai.com',
  phone: '+1 (555) 234-5678',
  address: '100 Culinary Boulevard, Suite 400'
};

const samplePublicItems: MenuItem[] = [
  {
    id: 'pub-1',
    name: 'Gold Leaf A5 Wagyu Ribeye',
    category: 'special',
    price: 185,
    description: '300g Japanese A5 Miyazaki Wagyu, seared over binchotan charcoal, brushed with truffle glaze, adorned with 24k gold leaf.',
    image: '/images/wagyu_ribeye.png',
    tags: ['GF', 'Chef Special'],
    allergens: []
  },
  {
    id: 'pub-2',
    name: 'Beluga Caviar & Kumamoto Oysters',
    category: 'special',
    price: 95,
    description: 'Six freshly shucked Kumamoto oysters topped with Beluga caviar, champagne mignonette, and gold flakes.',
    image: '/images/caviar_oysters.png',
    tags: ['Seafood', 'Fresh'],
    allergens: ['Shellfish']
  },
  {
    id: 'pub-3',
    name: 'Pan-Seared Duck Breast',
    category: 'mains',
    price: 48,
    description: 'Crispy skin duck breast, spiced cherry reduction, parsnip purée, glazed heirloom carrots.',
    image: '/images/duck_breast.png',
    tags: ['GF', 'Non-Veg'],
    allergens: []
  },
  {
    id: 'pub-4',
    name: 'Truffle Glazed Filet Mignon',
    category: 'mains',
    price: 58,
    description: '8oz USDA Prime tenderloin, truffle potato purée, glazed organic heirloom carrots, rich bone marrow reduction.',
    image: '/images/filet_mignon.png',
    tags: ['GF', 'Non-Veg'],
    allergens: []
  },
  {
    id: 'pub-5',
    name: 'Chocolate Soufflé',
    category: 'desserts',
    price: 18,
    description: '70% Valrhona dark chocolate soufflé, Tahitian vanilla bean gelato, warm salted caramel drizzle.',
    image: '/images/chocolate_souffle.png',
    tags: ['Veg'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'pub-6',
    name: 'Royal Gold Old Fashioned',
    category: 'drinks',
    price: 28,
    description: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips, served with a gold-leaf ice sphere.',
    image: '/images/old_fashioned.png',
    tags: ['Signature'],
    allergens: []
  }
];

export default function PublicDigitalMenuPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [branding, setBranding] = useState<PublicBrandingConfig>(defaultBranding);
  const [items, setItems] = useState<MenuItem[]>(samplePublicItems);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Parse tenant query param in browser context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tid = params.get('tenant') || params.get('slug');
      if (tid) setTenantId(tid);

      // Load saved tenant public branding if available
      const savedBranding = localStorage.getItem(`dinepos_public_branding_${tid || 'default'}`);
      if (savedBranding) {
        try {
          const parsed = JSON.parse(savedBranding);
          setBranding(prev => ({ ...prev, ...parsed }));
        } catch { /* ignore */ }
      }
    }
  }, []);

  // Fetch tenant menu items from API if tenantId exists
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const res = await apiRequest<MenuItem[]>(`/api/menu/public?tenant=${tenantId}`, { useAuth: false });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        }
      } catch {
        /* Fall back to sample items */
      }
    })();
  }, [tenantId]);

  const categories = useMemo(() => [
    { id: 'all', name: 'ALL DISHES', icon: 'menu_book' },
    { id: 'special', name: 'SPECIALS', icon: 'auto_awesome' },
    { id: 'mains', name: 'MAINS', icon: 'restaurant_menu' },
    { id: 'desserts', name: 'DESSERTS', icon: 'icecream' },
    { id: 'drinks', name: 'BEVERAGES', icon: 'local_bar' }
  ], []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const isVeg = item.tags.some(t => t.toLowerCase().includes('veg') && !t.toLowerCase().includes('non-veg'));
      const matchesDietary = dietaryFilter === 'all' || (dietaryFilter === 'veg' && isVeg) || (dietaryFilter === 'non-veg' && !isVeg);
      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [items, activeCategory, searchQuery, dietaryFilter]);

  return (
    <div className="min-h-screen bg-[#0e0e0d] text-[#e5e2e1] font-sans pb-16 selection:bg-[#ffc53d]/30 selection:text-[#ffc53d]">
      {/* ── Top Public Header Banner ────────────────────────────────────── */}
      <header className="relative w-full h-64 md:h-80 overflow-hidden flex items-end justify-between p-6 bg-cover bg-center border-b border-white/10"
        style={{ backgroundImage: `linear-gradient(to top, rgba(14,14,13,0.95), rgba(14,14,13,0.4)), url(${branding.bannerUrl})` }}>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-[#ffc53d]/15 border border-[#ffc53d]/30 text-[#ffc53d] text-[10px] font-extrabold uppercase tracking-widest rounded-lg">
              Official Digital Menu
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white tracking-wide leading-tight">
            {branding.restaurantName}
          </h1>
          <p className="text-xs md:text-sm text-[#A69984]/80 font-medium mt-1">
            {branding.welcomeSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInfoModal(true)}
          className="relative z-10 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-[#ffc53d]">info</span>
          Info & Contact
        </button>
      </header>

      {/* ── Navigation & Search Toolbar ───────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0e0e0d]/90 backdrop-blur-xl border-b border-white/5 py-4 px-4 md:px-8 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#ffc53d] text-[#1a1200] shadow-md shadow-[#ffc53d]/10'
                    : 'bg-white/5 text-[#A69984] hover:text-white border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#A69984]/50 text-sm">search</span>
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#ffc53d]/40 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Menu Grid Showcase ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-white/10 block mb-3">restaurant_menu</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">No dishes found</h3>
            <p className="text-xs text-[#A69984]/50 mt-1">Try adjusting your search query or category selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-[#161513] border border-white/5 hover:border-[#ffc53d]/30 rounded-2xl overflow-hidden shadow-lg transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full h-48 bg-black/40 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl text-[#ffc53d] font-serif font-bold text-sm">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] text-[#A69984] font-bold uppercase tracking-wider rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#ffc53d] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#A69984]/70 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between">
                  <span className="text-[11px] text-[#ffc53d] font-bold uppercase tracking-wider flex items-center gap-1">
                    View Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Dish Detail Modal ─────────────────────────────────────────── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161513] border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in font-sans">
            <div className="relative h-64 bg-black">
              <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" />
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">{selectedItem.name}</h2>
                  <span className="text-xs text-[#A69984] font-semibold uppercase tracking-wider mt-1 block">Category: {selectedItem.category}</span>
                </div>
                <span className="font-serif text-2xl font-bold text-[#ffc53d]">${selectedItem.price.toFixed(2)}</span>
              </div>

              <p className="text-xs text-[#A69984]/80 leading-relaxed">{selectedItem.description}</p>

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Contains Allergens:</span>
                  <div className="flex gap-2">
                    {selectedItem.allergens.map((alg, i) => (
                      <span key={i} className="text-xs text-amber-200 font-medium">• {alg}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#1a1200] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer mt-2"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restaurant Info & Contact Modal ──────────────────────────── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161513] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 font-sans">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-serif text-xl font-bold text-white">Restaurant Information</h3>
              <button type="button" onClick={() => setShowInfoModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#A69984]/50 font-bold uppercase tracking-wider text-[10px]">Establishment</span>
                <p className="text-white font-bold text-sm mt-0.5">{branding.restaurantName}</p>
              </div>
              {branding.address && (
                <div>
                  <span className="text-[#A69984]/50 font-bold uppercase tracking-wider text-[10px]">Address</span>
                  <p className="text-[#A69984] mt-0.5">{branding.address}</p>
                </div>
              )}
              {branding.phone && (
                <div>
                  <span className="text-[#A69984]/50 font-bold uppercase tracking-wider text-[10px]">Phone</span>
                  <p className="text-[#ffc53d] font-bold mt-0.5">{branding.phone}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
