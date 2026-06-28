'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';

const COUNTRIES = [
  { name: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo' },
  { name: 'United States', currency: 'USD', timezone: 'America/New_York' },
  { name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London' },
  { name: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin' },
  { name: 'South Korea', currency: 'KRW', timezone: 'Asia/Seoul' },
  { name: 'China', currency: 'CNY', timezone: 'Asia/Shanghai' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Profile State
  const [country, setCountry] = useState('Japan');
  const [currency, setCurrency] = useState('JPY');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Taxes State
  const [taxType, setTaxType] = useState<'VAT' | 'GST' | 'NONE'>('VAT');
  const [taxRate, setTaxRate] = useState(10); // default 10% JPY VAT

  // Step 3: Menu Initializer State
  const [categoriesList, setCategoriesList] = useState<string[]>(['Starters', 'Mains', 'Drinks']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemCategory, setItemCategory] = useState('Mains');
  const [itemDescription, setItemDescription] = useState('');

  // Sync Currency & Timezone defaults when country changes
  useEffect(() => {
    const match = COUNTRIES.find(c => c.name === country);
    if (match) {
      setCurrency(match.currency);
      setTimezone(match.timezone);
      if (match.currency === 'JPY') {
        setTaxRate(10);
      } else {
        setTaxRate(8);
      }
    }
  }, [country]);

  // Load existing account info if any on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dinepos_user_account');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.onboarded === true) {
            router.push('/dashboard');
          }
          if (parsed.currency) setCurrency(parsed.currency);
        } catch (e) {}
      }
    }
  }, [router]);

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categoriesList.includes(trimmed)) {
      setCategoriesList([...categoriesList, trimmed]);
      setItemCategory(trimmed);
      setNewCategoryName('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (categoriesList.length <= 1) return; // Must have at least one category
    const filtered = categoriesList.filter(c => c !== catToRemove);
    setCategoriesList(filtered);
    if (itemCategory === catToRemove) {
      setItemCategory(filtered[0]);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!phone.trim()) { setError('Please enter a business phone number.'); return; }
      if (!address.trim()) { setError('Please enter your restaurant address.'); return; }
    }
    if (currentStep === 3) {
      if (!itemName.trim()) { setError('Please enter a name for your first menu item.'); return; }
      if (itemPrice <= 0) { setError('Please enter a price greater than 0.'); return; }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setError('');

    const payload = {
      country,
      timezone,
      currency,
      taxType,
      taxRate,
      categories: categoriesList,
      menuItems: [
        {
          categoryName: itemCategory,
          name: itemName,
          price: itemPrice,
          description: itemDescription,
        }
      ]
    };

    try {
      const response = await apiRequest('/api/tenant/onboard', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setIsLoading(false);

      if (response.success || response.isOfflineFallback) {
        if (response.isOfflineFallback) {
          console.warn('[Onboarding] API is offline. Performing offline fallback local storage mapping.');
        }

        // Update local user account details
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('dinepos_user_account');
          let accountInfo = {};
          if (stored) {
            try { accountInfo = JSON.parse(stored); } catch (e) {}
          }

          const updatedAccount = {
            ...accountInfo,
            currency,
            onboarded: true
          };

          localStorage.setItem('dinepos_user_account', JSON.stringify(updatedAccount));
          localStorage.setItem('dinepos_currency', currency);
          localStorage.setItem('dinepos_tax_type', taxType === 'NONE' ? 'pre-tax' : 'post-tax');
          localStorage.setItem('dinepos_tax_rate_dine_in', taxRate.toString());
          localStorage.setItem('dinepos_tax_rate_takeaway', (taxRate * 0.8).toString());
          localStorage.setItem('dinepos_tax_rate_delivery', (taxRate * 0.8).toString());
        }

        router.push('/dashboard');
      } else {
        setError(response.error || 'Failed to complete onboarding. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during onboarding submission.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,226,171,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,226,171,0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between backdrop-blur-md bg-black/20 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#ffe2ab] text-xl leading-none">restaurant</span>
          </div>
          <span className="font-serif font-bold text-[#ffe2ab] text-xl tracking-wide">DinePosAi</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-white/40 font-mono tracking-widest uppercase">Onboarding Assistant</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-12 px-6 z-10">
        <div className="w-full max-w-[620px] bg-[#121211] border border-white/[0.05] rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl relative">
          
          {/* Steps Indicator Progress Caps */}
          <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Taxes' },
              { num: 3, label: 'Menu Setup' },
              { num: 4, label: 'Activation' }
            ].map(step => (
              <div key={step.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step.num 
                    ? 'bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] shadow-[0_0_15px_rgba(255,226,171,0.3)]'
                    : currentStep > step.num
                      ? 'bg-white/10 text-white'
                      : 'bg-white/[0.03] text-white/30 border border-white/5'
                }`}>
                  {currentStep > step.num ? (
                    <span className="material-symbols-outlined text-sm leading-none font-bold">check</span>
                  ) : step.num}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${
                  currentStep === step.num ? 'text-white' : 'text-white/40'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="min-h-[280px]">
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl">
                <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error_outline</span>
                {error}
              </div>
            )}

            {/* STEP 1: RESTAURANT PROFILE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#ffe2ab] mb-2 font-serif">Establish Your Business Identity</h2>
                  <p className="text-sm text-white/60 leading-relaxed font-light">Set up your locale configurations. This establishes regional timezone parameters and pricing currency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Country</label>
                    <select 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffc53d]/50"
                    >
                      {COUNTRIES.map(c => <option key={c.name} value={c.name} className="bg-[#121211]">{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Preferred Currency</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={currency} 
                      className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-white/60 text-sm font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Timezone</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={timezone} 
                    className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-white/60 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Phone Number <span className="text-[#ffe2ab]">*</span></label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+81-3-1234-5678" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffc53d]/50 placeholder-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Restaurant Address <span className="text-[#ffe2ab]">*</span></label>
                  <input 
                    type="text" 
                    required 
                    placeholder="1-2-3 Ginza, Chuo-ku, Tokyo" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffc53d]/50 placeholder-white/20"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: TAXES & CHARGES */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#ffe2ab] mb-2 font-serif">Taxes & Service Configuration</h2>
                  <p className="text-sm text-white/60 leading-relaxed font-light">Choose how local taxes should apply to orders. Tax rates automatically adapt to Dine-In, Takeaway, and Delivery orders.</p>
                </div>

                <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Tax System Type</label>
                    <div className="flex gap-4">
                      {['VAT', 'GST', 'NONE'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTaxType(type as any)}
                          className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                            taxType === type 
                              ? 'bg-[#ffe2ab]/10 border-[#ffe2ab] text-[#ffe2ab]'
                              : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white'
                          }`}
                        >
                          {type === 'NONE' ? 'No Tax' : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {taxType !== 'NONE' && (
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Default Tax Rate</label>
                        <span className="text-[#ffe2ab] font-mono font-bold text-sm">{taxRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="25" 
                        value={taxRate} 
                        onChange={e => setTaxRate(parseInt(e.target.value, 10))} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ffe2ab]"
                      />
                      <p className="text-[10px] text-white/40">Takeaway and Delivery operations will be configured automatically at 80% of this standard rate (e.g. {(taxRate * 0.8).toFixed(1)}%).</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: INITIAL MENU SETUP */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#ffe2ab] mb-2 font-serif">Setup Your Initial Menu</h2>
                  <p className="text-sm text-white/60 leading-relaxed font-light">Create category tags and your first dish. This ensures the digital catalog has content ready to test immediately.</p>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Menu Categories</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl min-h-[50px]">
                    {categoriesList.map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white text-xs font-semibold">
                        {cat}
                        <button type="button" onClick={() => handleRemoveCategory(cat)} className="material-symbols-outlined text-xs hover:text-rose-400 transition-colors">close</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add custom category... (e.g. Desserts)" 
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)} 
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
                    />
                    <button type="button" onClick={handleAddCategory} className="px-4 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab]/20 text-[#ffe2ab] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors">Add</button>
                  </div>
                </div>

                {/* First Menu Item */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Your First Menu Item</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[10px] uppercase text-white/40">Item Name <span className="text-[#ffe2ab]">*</span></label>
                      <input 
                        type="text" 
                        placeholder="A5 Miyazaki Wagyu Ribeye" 
                        value={itemName} 
                        onChange={e => setItemName(e.target.value)} 
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase text-white/40">Price ({currency}) <span className="text-[#ffe2ab]">*</span></label>
                      <input 
                        type="number" 
                        min="0"
                        placeholder="185" 
                        value={itemPrice || ''} 
                        onChange={e => setItemPrice(parseFloat(e.target.value) || 0)} 
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase text-white/40">Category</label>
                      <select 
                        value={itemCategory} 
                        onChange={e => setItemCategory(e.target.value)} 
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                      >
                        {categoriesList.map(c => <option key={c} value={c} className="bg-[#121211]">{c}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[10px] uppercase text-white/40">Description</label>
                      <input 
                        type="text" 
                        placeholder="Premium seared steak with truffle glaze..." 
                        value={itemDescription} 
                        onChange={e => setItemDescription(e.target.value)} 
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & ACTIVATE */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#ffe2ab] mb-2 font-serif">Activate Your Workspace</h2>
                  <p className="text-sm text-white/60 leading-relaxed font-light">Confirm your configurations below. Once activated, your DinePOS AI dashboard and terminals will spin up fully.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile Summary Card */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-white/40 border-b border-white/5 pb-2">
                      <span className="material-symbols-outlined text-sm leading-none text-[#ffe2ab]">storefront</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Workspace Profile</span>
                    </div>
                    <div className="text-xs space-y-1.5 font-light">
                      <p className="flex justify-between"><span className="text-white/40">Region:</span> <span className="font-semibold">{country}</span></p>
                      <p className="flex justify-between"><span className="text-white/40">Currency:</span> <span className="font-semibold font-mono">{currency}</span></p>
                      <p className="flex justify-between"><span className="text-white/40">Timezone:</span> <span className="font-semibold">{timezone}</span></p>
                      <p className="flex justify-between"><span className="text-white/40">Phone:</span> <span className="font-semibold">{phone}</span></p>
                    </div>
                  </div>

                  {/* Taxes Summary Card */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-white/40 border-b border-white/5 pb-2">
                      <span className="material-symbols-outlined text-sm leading-none text-[#ffe2ab]">payments</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Taxes & Settlement</span>
                    </div>
                    <div className="text-xs space-y-1.5 font-light">
                      <p className="flex justify-between"><span className="text-white/40">System:</span> <span className="font-semibold">{taxType === 'NONE' ? 'Tax Free' : taxType}</span></p>
                      {taxType !== 'NONE' && (
                        <>
                          <p className="flex justify-between"><span className="text-white/40">Dine-In Tax:</span> <span className="font-semibold">{taxRate}%</span></p>
                          <p className="flex justify-between"><span className="text-white/40">Takeaway Tax:</span> <span className="font-semibold">{(taxRate * 0.8).toFixed(1)}%</span></p>
                          <p className="flex justify-between"><span className="text-white/40">Delivery Tax:</span> <span className="font-semibold">{(taxRate * 0.8).toFixed(1)}%</span></p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Catalog Summary Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-white/40 border-b border-white/5 pb-2">
                    <span className="material-symbols-outlined text-sm leading-none text-[#ffe2ab]">menu_book</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Initial Menu Catalog</span>
                  </div>
                  <div className="text-xs space-y-1.5 font-light">
                    <p className="flex justify-between"><span className="text-white/40">Categories to Create:</span> <span className="font-semibold">{categoriesList.join(', ')}</span></p>
                    <p className="flex justify-between"><span className="text-white/40">First Menu Item:</span> <span className="font-semibold">{itemName} ({itemCategory} — {currency} {itemPrice})</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isLoading}
                className="px-6 py-3 border border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm leading-none">arrow_back</span>
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-white text-[#261a00] hover:bg-white/90 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                Continue
                <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={isLoading}
                className="px-8 py-3.5 bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] disabled:from-[#ffe2ab]/50 disabled:to-[#cc9d31]/50 text-[#261a00] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_25px_rgba(255,226,171,0.2)] hover:shadow-[0_15px_30px_rgba(255,226,171,0.35)] flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#261a00]/30 border-t-[#261a00] rounded-full animate-spin flex-shrink-0" />
                    Activating...
                  </>
                ) : (
                  <>
                    Activate Restaurant
                    <span className="material-symbols-outlined text-sm leading-none">done</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-white/[0.05] text-center text-xs text-white/30 tracking-wide select-none">
        &copy; {new Date().getFullYear()} DinePOS AI. Secure merchant onboarding suite.
      </footer>

    </div>
  );
}
