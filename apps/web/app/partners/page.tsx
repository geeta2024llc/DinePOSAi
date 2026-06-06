'use client';

import React, { useState, useEffect } from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

// Theme mirroring the admin and registration layouts
const theme = {
  bg: 'bg-[#0e0e0d]',
  bgSecondary: 'bg-[#161513]',
  cardBg: 'bg-[#161513]/95 border-white/5',
  cardBgOpaque: 'bg-[#161513] border-white/5',
  border: 'border-white/5',
  borderStrong: 'border-white/10',
  text: 'text-[#e5e2e1]',
  textMuted: 'text-[#A69984]/65',
  textMutedLight: 'text-[#A69984]/50',
  accent: 'text-[#ffc53d]',
  accentBg: 'bg-[#ffc53d]',
  accentHoverBg: 'hover:bg-[#ffb014]',
  accentText: 'text-[#2c1a00]',
  accentLight: 'text-[#ffe2ab]',
  accentLightBg: 'bg-[#ffe2ab]/10',
  inputBg: 'bg-[#12110f]/90',
  inputBorder: 'border-white/10 focus:border-[#ffe2ab]/40',
};

interface InvitedBusiness {
  id: string;
  name: string;
  contact: string;
  joinedDate: string;
  status: 'Demo Use' | 'Trial' | 'Active Subscribed';
  services: string[];
  reward: number;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  phone: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingCode: string;
  code: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joined: string;
  paidRewards: number;
  pendingRewards: number;
  invitedBusinesses: InvitedBusiness[];
}

const DEFAULT_CONFIG = {
  programActive: true,
  commissionRate: 10,
  rewardPerSignup: 150,
  minPayoutThreshold: 100,
  referralBaseUrl: 'https://dineposai.com/signup?ref=',
  cookieDuration: 30,
};

export default function PartnersPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [currentUser, setCurrentUser] = useState<Referral | null>(null);
  const [programConfig, setProgramConfig] = useState(DEFAULT_CONFIG);

  // Navigation states — login is now a separate page at /partners/login
  const [viewMode, setViewMode] = useState<'landing' | 'register' | 'dashboard'>('landing');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBankName, setRegBankName] = useState('');
  const [regAccountHolder, setRegAccountHolder] = useState('');
  const [regAccountNumber, setRegAccountNumber] = useState('');
  const [regRoutingCode, setRegRoutingCode] = useState('');
  
  // Update Bank Details Form States
  const [editBankName, setEditBankName] = useState('');
  const [editAccountHolder, setEditAccountHolder] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editRoutingCode, setEditRoutingCode] = useState('');
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Status message alerts
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({
    message: '',
    type: null
  });

  const triggerAlert = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: '', type: null });
    }, 4000);
  };

  // Load program config from localStorage (set by super-admin)
  useEffect(() => {
    const saved = localStorage.getItem('dinepos_referral_config');
    if (saved) { try { setProgramConfig(prev => ({ ...prev, ...JSON.parse(saved) })); } catch { /* */ } }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dinepos_referral_config' && e.newValue) {
        try { setProgramConfig(prev => ({ ...prev, ...JSON.parse(e.newValue!) })); } catch { /* */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync and initialize localStorage database
  useEffect(() => {
    const stored = localStorage.getItem('dinepos_referrals');
    if (stored) {
      const parsed = JSON.parse(stored);
      setReferrals(parsed);
      
      // Auto login check if email saved in session/local state
      const savedEmail = localStorage.getItem('dinepos_active_referral_email');
      if (savedEmail) {
        const found = parsed.find((r: Referral) => r.email === savedEmail);
        if (found) {
          setCurrentUser(found);
          setViewMode('dashboard');
        }
      }
    } else {
      const initial: Referral[] = [
        {
          id: 'REF-001',
          name: 'Eric Ripert',
          email: 'chef@lebernardin.com',
          phone: '+1 (212) 555-8821',
          bankName: 'JPMorgan Chase',
          accountHolder: 'Le Bernardin LLC',
          accountNumber: '••••••••8291',
          routingCode: '021000021',
          code: 'REF-ERIC-77',
          status: 'ACTIVE',
          joined: '2024-03-12',
          paidRewards: 300,
          pendingRewards: 150,
          invitedBusinesses: [
            { id: 'TEN-4581', name: 'Bouchon Bakery', contact: 'Thomas Keller', joinedDate: '2026-05-20', status: 'Trial', services: ['POS Terminal', 'KDS Screen'], reward: 150 },
            { id: 'TEN-2195', name: 'Gaggan Anand', contact: 'Gaggan Anand', joinedDate: '2025-02-15', status: 'Active Subscribed', services: ['POS Terminal', 'KDS Screen', 'AI Concierge'], reward: 300 }
          ]
        },
        {
          id: 'REF-002',
          name: 'Ana Ros',
          email: 'ana@hisafranko.com',
          phone: '+386 41 555 120',
          bankName: 'Nova Ljubljanska Banka',
          accountHolder: 'Hisa Franko d.o.o.',
          accountNumber: '••••••••9012',
          routingCode: 'LJUBSI2X',
          code: 'REF-ANA-88',
          status: 'ACTIVE',
          joined: '2025-09-02',
          paidRewards: 0,
          pendingRewards: 100,
          invitedBusinesses: [
            { id: 'TEN-5512', name: 'Cafe Zenith', contact: 'Jane Doe', joinedDate: '2025-09-02', status: 'Demo Use', services: ['POS Terminal'], reward: 100 }
          ]
        },
        {
          id: 'REF-003',
          name: 'Pierre Gagnaire',
          email: 'pierre@lumiere.com',
          phone: '+33 1 44 39 54 54',
          bankName: 'Société Générale',
          accountHolder: 'Gagnaire SA',
          accountNumber: '••••••••4567',
          routingCode: 'SOGEFRPPXXX',
          code: 'REF-PIERRE-99',
          status: 'ACTIVE',
          joined: '2023-11-05',
          paidRewards: 400,
          pendingRewards: 0,
          invitedBusinesses: [
            { id: 'TEN-8821', name: 'The Obsidian Room', contact: 'Sergei Obosian', joinedDate: '2024-03-12', status: 'Active Subscribed', services: ['POS Terminal', 'KDS Screen', 'AI Concierge', 'Self-Checkout'], reward: 400 }
          ]
        }
      ];
      localStorage.setItem('dinepos_referrals', JSON.stringify(initial));
      setReferrals(initial);
    }
  }, []);

  // Sync session and active tenant changes
  useEffect(() => {
    if (currentUser) {
      // Find latest status of referred businesses from the global referrals database
      const latest = referrals.find(r => r.id === currentUser.id);
      if (latest && JSON.stringify(latest) !== JSON.stringify(currentUser)) {
        setCurrentUser(latest);
      }
    }
  }, [referrals, currentUser]);

  // Listener for storage updates (syncing referred merchants from register)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_referrals' && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setReferrals(parsed);
        if (currentUser) {
          const updated = parsed.find((r: Referral) => r.id === currentUser.id);
          if (updated) {
            setCurrentUser(updated);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  // Join program submission handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regBankName || !regAccountHolder || !regAccountNumber || !regRoutingCode) {
      triggerAlert('Please complete all form fields.', 'error');
      return;
    }

    // Check duplicate email
    const emailExists = referrals.some(r => r.email.toLowerCase() === regEmail.toLowerCase());
    if (emailExists) {
      triggerAlert('This email is already registered in our partner network.', 'error');
      return;
    }

    const referralCode = `REF-${regName.replace(/\s+/g, '').toUpperCase().slice(0, 8)}-${Math.floor(10 + Math.random() * 90)}`;
    const newPartner: Referral = {
      id: `REF-${Math.floor(100 + Math.random() * 900)}`,
      name: regName,
      email: regEmail,
      phone: regPhone,
      bankName: regBankName,
      accountHolder: regAccountHolder,
      accountNumber: regAccountNumber.replace(/.(?=.{4})/g, '•'), // mask for security
      routingCode: regRoutingCode,
      code: referralCode,
      status: 'ACTIVE',
      joined: new Date().toISOString().split('T')[0],
      paidRewards: 0,
      pendingRewards: 0,
      invitedBusinesses: []
    };

    const updatedList = [...referrals, newPartner];
    setReferrals(updatedList);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updatedList));
    
    // Auto Login
    setCurrentUser(newPartner);
    localStorage.setItem('dinepos_active_referral_email', newPartner.email);
    setViewMode('dashboard');
    triggerAlert('Welcome to the DinePOS Partner Program! Your account is active.', 'success');
  };

  // Login handler
  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dinepos_active_referral_email');
    setViewMode('landing');
  };

  // Open Edit Bank details
  const handleStartEditBank = () => {
    if (!currentUser) return;
    setEditBankName(currentUser.bankName);
    setEditAccountHolder(currentUser.accountHolder);
    setEditAccountNumber(currentUser.accountNumber);
    setEditRoutingCode(currentUser.routingCode);
    setIsEditingBank(true);
  };

  // Update bank details submission
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Mask new account number if changed
    const newNumber = editAccountNumber.includes('•') 
      ? editAccountNumber 
      : editAccountNumber.replace(/.(?=.{4})/g, '•');

    const updated = {
      ...currentUser,
      bankName: editBankName,
      accountHolder: editAccountHolder,
      accountNumber: newNumber,
      routingCode: editRoutingCode
    };

    const updatedList = referrals.map(r => r.id === currentUser.id ? updated : r);
    setReferrals(updatedList);
    setCurrentUser(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updatedList));
    setIsEditingBank(false);
    triggerAlert('Payout bank details updated successfully.', 'success');
  };

  // Helper to copy referral link — uses admin-configured base URL, falls back to current origin
  const copyReferralLink = (code: string) => {
    const base = programConfig.referralBaseUrl || `${window.location.origin}/register?ref=`;
    const link = base.endsWith('=') || base.endsWith('/') ? `${base}${code}` : `${base}${code}`;
    navigator.clipboard.writeText(link);
    triggerAlert('Referral link copied to clipboard!', 'success');
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme.bg} ${theme.text} font-sans antialiased overflow-x-hidden`}>
      <TopNavBar />

      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Glow Effects */}
        <div className="absolute top-10 right-10 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,226,171,0.03)_0%,transparent_70%)] rounded-full blur-[80px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,226,171,0.02)_0%,transparent_70%)] rounded-full blur-[90px] pointer-events-none -z-10"></div>

        {/* ========================================================================= */}
        {/* VIEW 1: LANDING PAGE                                                      */}
        {/* ========================================================================= */}
        {viewMode === 'landing' && (
          <div className="space-y-14 py-8 animate-fade-in duration-300">

            {/* Program status banner — only shows if paused */}
            {!programConfig.programActive && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-5 py-3 text-rose-400 font-sans text-xs font-bold">
                <span className="material-symbols-outlined text-base">pause_circle</span>
                The Ambassador Program is currently paused. New registrations are temporarily suspended. Existing ambassadors may continue to refer and track rewards.
              </div>
            )}

            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <span className="inline-block border border-[#ffe2ab]/20 rounded-full px-4 py-1.5 text-[#ffe2ab] text-[10px] uppercase font-bold tracking-[0.25em] bg-[#ffe2ab]/5">
                DinePOS Ambassador Network
              </span>
              <h1 className="font-serif text-white text-5xl md:text-6xl font-medium leading-tight tracking-wide">
                Introduce DinePOS.<br />
                <span className="text-[#ffc53d] italic">Earn Premium Rewards.</span>
              </h1>
              <p className="text-[#A69984] text-lg leading-relaxed font-normal max-w-2xl mx-auto">
                Promote our premium restaurant POS operating system to your culinary network. Earn <strong className="text-[#ffc53d]">${programConfig.rewardPerSignup}</strong> per signup plus <strong className="text-[#ffc53d]">{programConfig.commissionRate}% commission</strong> on every onboarded location.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  disabled={!programConfig.programActive}
                  className={`px-8 py-3.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 ${
                    programConfig.programActive
                      ? 'bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] cursor-pointer'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {programConfig.programActive ? 'Join Ambassador Program' : 'Program Paused'}
                </button>
                <Link
                  href="/partners/login"
                  className="px-8 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer inline-block text-center"
                >
                  Ambassador Login
                </Link>
              </div>
            </div>

            {/* Live program stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 font-sans">
              {[
                {
                  label: 'Active Ambassadors',
                  value: referrals.filter(r => r.status === 'ACTIVE').length,
                  icon: 'group',
                  color: 'text-white',
                },
                {
                  label: 'Businesses Referred',
                  value: referrals.reduce((s, r) => s + r.invitedBusinesses.length, 0),
                  icon: 'storefront',
                  color: 'text-violet-400',
                },
                {
                  label: 'Reward per Signup',
                  value: `$${programConfig.rewardPerSignup}`,
                  icon: 'payments',
                  color: 'text-[#ffc53d]',
                },
                {
                  label: 'Commission Rate',
                  value: `${programConfig.commissionRate}%`,
                  icon: 'percent',
                  color: 'text-emerald-400',
                },
              ].map(stat => (
                <div key={stat.label} className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between`}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[9.5px] text-[#A69984]/60 uppercase tracking-widest">{stat.label}</span>
                    <span className="material-symbols-outlined text-[#A69984]/30 text-lg">{stat.icon}</span>
                  </div>
                  <div className={`font-serif text-3xl font-bold ${stat.color} mt-4`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* How it Works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-8 rounded-2xl border ${theme.cardBg} space-y-4`}>
                <div className="w-12 h-12 rounded-xl bg-[#ffe2ab]/10 border border-[#ffe2ab]/25 flex items-center justify-center text-[#ffc53d]">
                  <span className="material-symbols-outlined text-2xl font-bold">share</span>
                </div>
                <h3 className="font-serif text-lg text-white font-semibold tracking-wide">1. Share Your Code</h3>
                <p className="text-xs text-[#A69984] leading-relaxed">
                  Register as a partner, add your bank details for payouts, and copy your custom invite link. No upfront commitments, no fees.
                </p>
              </div>

              <div className={`p-8 rounded-2xl border ${theme.cardBg} space-y-4`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-2xl">storefront</span>
                </div>
                <h3 className="font-serif text-lg text-white font-semibold tracking-wide">2. Venues Register</h3>
                <p className="text-xs text-[#A69984] leading-relaxed">
                  When a restaurant signs up using your code, you instantly see who joined, when, and what services they activated on your live dashboard.
                </p>
              </div>

              <div className={`p-8 rounded-2xl border ${theme.cardBg} space-y-4`}>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <span className="material-symbols-outlined text-2xl">payments</span>
                </div>
                <h3 className="font-serif text-lg text-white font-semibold tracking-wide">3. Get Paid</h3>
                <p className="text-xs text-[#A69984] leading-relaxed">
                  Earn <span className="text-[#ffc53d] font-bold">${programConfig.rewardPerSignup}</span> per onboarded business plus <span className="text-[#ffc53d] font-bold">{programConfig.commissionRate}% commission</span>. Paid directly to your bank once you hit the <span className="text-[#ffc53d] font-bold">${programConfig.minPayoutThreshold}</span> threshold.
                </p>
              </div>
            </div>

            {/* Reward policy card */}
            <div className={`border ${theme.cardBg} rounded-2xl p-7 font-sans`}>
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[#ffc53d] text-lg">policy</span>
                <h3 className="text-white font-bold text-sm tracking-wide">Reward Policy</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Flat Reward per Signup', value: `$${programConfig.rewardPerSignup}`, desc: 'Credited when referred business activates their account', color: 'text-[#ffc53d]' },
                  { label: 'Commission on 1st Payment', value: `${programConfig.commissionRate}%`, desc: 'Percentage of their first subscription payment', color: 'text-emerald-400' },
                  { label: 'Minimum Payout Threshold', value: `$${programConfig.minPayoutThreshold}`, desc: 'Balance required before requesting a withdrawal', color: 'text-sky-400' },
                ].map(p => (
                  <div key={p.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                    <div className="text-[9.5px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-2">{p.label}</div>
                    <div className={`font-serif text-2xl font-bold ${p.color} mb-1.5`}>{p.value}</div>
                    <div className="text-[10px] text-[#A69984]/50 leading-relaxed">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className={`border ${theme.cardBg} rounded-2xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl`}>
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 shrink-0 bg-amber-500/10 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-3xl">restaurant</span>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-serif italic text-white/95 leading-relaxed font-normal">
                  "As a culinary consultant, I suggest DinePOS to every fine-dining restaurant I work with. The onboarding is incredibly smooth, and the payout system ensures I am rewarded transparently for helping businesses find the right tools."
                </p>
                <div className="text-[11px] text-[#A69984]/50 font-bold uppercase tracking-wider font-sans">
                  Eric Ripert • Chef & DinePOS Ambassador
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTER PROGRAM                                                  */}
        {/* ========================================================================= */}
        {viewMode === 'register' && (
          <div className="max-w-[640px] mx-auto py-6 animate-fade-in duration-300">
            <div className={`border ${theme.cardBg} rounded-2xl p-8 shadow-2xl space-y-6`}>
              <div className="text-center space-y-2 pb-4 border-b border-white/5">
                <h2 className="font-serif text-2xl text-white font-medium">Join the Ambassador Network</h2>
                <p className="text-xs text-[#A69984]">Fill in your details and payout bank accounts to start earning.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6 text-xs font-semibold">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-[10px] text-[#ffe2ab] uppercase tracking-widest border-l-2 border-[#ffc53d] pl-2.5">Personal details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[#A69984]">Full Name</label>
                      <input 
                        type="text" required placeholder="e.g. Eric Ripert"
                        value={regName} onChange={(e) => setRegName(e.target.value)}
                        className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[#A69984]">Contact Phone</label>
                      <input 
                        type="text" required placeholder="e.g. +1 (212) 555-0199"
                        value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                        className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#A69984]">Work Email Address</label>
                    <input 
                      type="email" required placeholder="e.g. chef@lebernardin.com"
                      value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Bank Payout Info */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] text-[#ffe2ab] uppercase tracking-widest border-l-2 border-[#ffc53d] pl-2.5">Payout Bank account (Required)</h3>
                  <p className="text-[10px] text-[#A69984]/50 leading-relaxed font-semibold">Rewards are paid out directly by the platform admin using these coordinates.</p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[#A69984]">Bank Name</label>
                        <input 
                          type="text" required placeholder="e.g. JPMorgan Chase"
                          value={regBankName} onChange={(e) => setRegBankName(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[#A69984]">Account Holder Name</label>
                        <input 
                          type="text" required placeholder="e.g. Le Bernardin LLC"
                          value={regAccountHolder} onChange={(e) => setRegAccountHolder(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[#A69984]">Account Number / IBAN</label>
                        <input 
                          type="text" required placeholder="Enter full account number"
                          value={regAccountNumber} onChange={(e) => setRegAccountNumber(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[#A69984]">Routing Code / BIC / IBAN SWIFT</label>
                        <input 
                          type="text" required placeholder="e.g. 021000021"
                          value={regRoutingCode} onChange={(e) => setRegRoutingCode(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border ${theme.inputBorder} rounded-lg p-3 text-white placeholder-white/20 focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submits */}
                <div className="pt-4 flex gap-4 select-none">
                  <button 
                    type="button" onClick={() => setViewMode('landing')}
                    className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: AMBASSADOR DASHBOARD                                              */}
        {/* ========================================================================= */}
        {viewMode === 'dashboard' && currentUser && (
          <div className="space-y-8 animate-fade-in duration-300">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
              <div>
                <h1 className="font-serif text-4xl font-medium text-white tracking-wide leading-none">
                  Partner Dashboard
                </h1>
                <p className="font-sans text-xs text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                  Ambassador Account: <span className="text-white">{currentUser.name}</span> • Joined {new Date(currentUser.joined).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white text-[#A69984] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>

            {/* Referral Code & Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
              
              {/* Copy Code Card (Span 5) */}
              <div className="lg:col-span-5">
                <div className={`${theme.cardBg} border rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full min-h-[200px]`}>
                  <div className="space-y-3">
                    <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                      Your Ambassador Code
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white tracking-wide">{currentUser.code}</h3>
                    <p className="text-[11.5px] text-[#A69984]/60 font-semibold leading-relaxed">
                      Share this code or copy your link to onboard new venues. Rewards accrue automatically when they complete registration.
                    </p>
                  </div>

                  <div className="pt-4 select-none">
                    <button
                      onClick={() => copyReferralLink(currentUser.code)}
                      className="w-full py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-black">content_copy</span>
                      Copy Referral Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Earnings Cards (Span 7) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Earned */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between shadow-lg`}>
                  <div className="flex justify-between items-start select-none">
                    <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">Total Earned</span>
                    <span className="material-symbols-outlined text-emerald-400 text-lg">trending_up</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-3xl font-serif font-bold text-[#ffc53d]">${currentUser.paidRewards + currentUser.pendingRewards}</h4>
                    <p className="text-[9px] text-[#A69984]/40 font-bold mt-1 uppercase tracking-wider">Historical accruals</p>
                  </div>
                </div>

                {/* Paid Rewards */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between shadow-lg`}>
                  <div className="flex justify-between items-start select-none">
                    <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">Paid Out</span>
                    <span className="material-symbols-outlined text-white/40 text-lg">check_circle</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-3xl font-serif font-bold text-white">${currentUser.paidRewards}</h4>
                    <p className="text-[9px] text-[#A69984]/40 font-bold mt-1 uppercase tracking-wider">Transferred to Bank</p>
                  </div>
                </div>

                {/* Pending Balance */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between shadow-lg border-amber-500/20`}>
                  <div className="flex justify-between items-start select-none">
                    <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider text-amber-400">Pending Balance</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1.5"></span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-3xl font-serif font-bold text-amber-400">${currentUser.pendingRewards}</h4>
                    <p className="text-[9px] text-[#A69984]/40 font-bold mt-1 uppercase tracking-wider">Awaiting Admin Payout</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Main Invited Businesses Table & Payout Bank Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Referred Venues Table (Span 8) */}
              <div className="lg:col-span-8">
                <div className={`${theme.cardBg} border rounded-2xl p-6 md:p-8 shadow-xl space-y-6`}>
                  <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-serif text-lg text-white font-bold tracking-wide">Invited Businesses</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Real-time status of restaurants referred by your ambassador link.</p>
                    </div>
                    <span className="text-xs text-white bg-white/5 border border-white/10 px-3 py-1 rounded-xl font-bold font-sans">
                      {currentUser.invitedBusinesses.length} Referrals
                    </span>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full font-sans border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3">Establishment</th>
                          <th className="py-3 px-3">Onboarded</th>
                          <th className="py-3 px-3">Active Services</th>
                          <th className="py-3 px-3 text-center">Status</th>
                          <th className="py-3 px-3 text-right">Earned Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                        {currentUser.invitedBusinesses.map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-3">
                              <div className="font-serif font-bold text-white text-[13.5px] tracking-wide">{b.name}</div>
                              <div className="text-[9px] text-[#A69984]/50 tracking-wider mt-1 uppercase font-bold">Contact: {b.contact}</div>
                            </td>
                            <td className="py-4 px-3 text-[#A69984]/80">{new Date(b.joinedDate).toLocaleDateString()}</td>
                            <td className="py-4 px-3">
                              <div className="flex flex-wrap gap-1">
                                {b.services.map((srv, idx) => (
                                  <span key={idx} className="bg-white/5 border border-white/5 text-[#A69984] px-2 py-0.5 rounded text-[8.5px] uppercase font-bold">
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                b.status === 'Active Subscribed' ? 'bg-emerald-500/10 text-emerald-400' :
                                b.status === 'Trial' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-[#A69984]/50'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-right text-white font-mono font-bold text-sm">
                              ${b.reward}
                            </td>
                          </tr>
                        ))}

                        {currentUser.invitedBusinesses.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-[#A69984]/35 font-serif text-sm border border-dashed border-white/5 rounded-2xl">
                              No businesses referred yet.<br />
                              <span className="font-sans text-[11px] mt-1 text-[#A69984]/50 font-normal block">Share your invite link above to get started.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bank Coordinates Pane (Span 4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Bank Details Display / Edit Form */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 shadow-xl space-y-6`}>
                  <div className="flex justify-between items-center select-none border-b border-white/5 pb-3">
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">Payout Bank Account</h3>
                    {!isEditingBank && (
                      <button
                        onClick={handleStartEditBank}
                        className="text-[9.5px] text-[#ffe2ab] font-bold tracking-widest hover:text-white uppercase transition-colors cursor-pointer select-none"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  {isEditingBank ? (
                    <form onSubmit={handleSaveBank} className="space-y-4 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-[#A69984]">Bank Name</label>
                        <input 
                          type="text" required value={editBankName}
                          onChange={(e) => setEditBankName(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#A69984]">Account Holder Name</label>
                        <input 
                          type="text" required value={editAccountHolder}
                          onChange={(e) => setEditAccountHolder(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#A69984]">Account Number / IBAN</label>
                        <input 
                          type="text" required value={editAccountNumber}
                          onChange={(e) => setEditAccountNumber(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#A69984]">Routing Code / BIC</label>
                        <input 
                          type="text" required value={editRoutingCode}
                          onChange={(e) => setEditRoutingCode(e.target.value)}
                          className={`w-full bg-[#0e0e0d] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none`}
                        />
                      </div>

                      <div className="pt-2 flex gap-3 select-none">
                        <button 
                          type="button" onClick={() => setIsEditingBank(false)}
                          className="flex-1 py-2 border border-white/10 text-[#A69984] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="flex-grow py-2 bg-[#ffc53d] text-[#2c1a00] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Save Account
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 font-sans text-xs">
                      <div className="p-4 bg-[#0e0e0d]/50 border border-white/5 rounded-xl space-y-3 font-semibold">
                        <div>
                          <span className="text-[9.5px] text-[#A69984]/50 block uppercase font-bold">Bank Name</span>
                          <span className="text-white text-sm mt-0.5 block">{currentUser.bankName}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-[#A69984]/50 block uppercase font-bold">Account Holder</span>
                          <span className="text-white text-sm mt-0.5 block">{currentUser.accountHolder}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9.5px] text-[#A69984]/50 block uppercase font-bold">Account Number</span>
                            <span className="text-white font-mono mt-0.5 block">{currentUser.accountNumber}</span>
                          </div>
                          <div>
                            <span className="text-[9.5px] text-[#A69984]/50 block uppercase font-bold">Routing Code</span>
                            <span className="text-white font-mono mt-0.5 block">{currentUser.routingCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#ffc53d]/5 border border-[#ffc53d]/10 rounded-xl flex gap-3 items-start font-semibold text-[10.5px]">
                        <span className="material-symbols-outlined text-[#ffc53d] text-base shrink-0 mt-0.5">verified_user</span>
                        <p className="text-[#A69984]/70 leading-normal">
                          Bank payout coordinates are verified and encrypted. Payout requests are initiated by the system administrator upon successful referral conversions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rewards Policies card */}
                <div className={`p-6 rounded-2xl border ${theme.cardBg} space-y-4 font-sans text-xs`}>
                  <h4 className="font-serif text-white font-semibold tracking-wide border-b border-white/5 pb-2">Referral Payout Policies</h4>
                  <ul className="space-y-2.5 text-[#A69984]/70 font-medium list-disc list-inside">
                    <li>Rewards accumulate when a referred merchant completes their registration using your code.</li>
                    <li>Flat reward per signup: <span className="text-[#ffc53d] font-bold">${programConfig.rewardPerSignup}</span> per establishment.</li>
                    <li>Commission on first payment: <span className="text-[#ffc53d] font-bold">{programConfig.commissionRate}%</span> of the referred tenant's first subscription charge.</li>
                    <li>Minimum payout threshold: <span className="text-[#ffc53d] font-bold">${programConfig.minPayoutThreshold}</span>. Admin processes transfers within 3 business days.</li>
                    <li>Cookie tracking window: <span className="text-[#ffc53d] font-bold">{programConfig.cookieDuration} days</span> — referral attribution is maintained for returning visitors.</li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full mt-auto border-t border-white/5 py-8 select-none">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4 max-w-7xl mx-auto font-sans text-xs text-[#A69984]/50">
          <div>© 2026 DinePOS AI. Enterprise Ambassador Network.</div>
          <div className="flex gap-6 font-semibold">
            <Link className="hover:text-[#ffe2ab] transition-colors" href="/terms">Terms</Link>
            <Link className="hover:text-[#ffe2ab] transition-colors" href="/privacy">Privacy</Link>
            <Link className="hover:text-[#ffe2ab] transition-colors text-[#ffc53d]" href="/support">Support Hub</Link>
          </div>
        </div>
      </footer>

      {/* Global Alert Toast */}
      {alert.message && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className={`bg-[#161513] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
            alert.type === 'error' ? 'border-rose-500/20 text-rose-400' : 'border-[#ffe2ab]/20 text-[#ffe2ab]'
          }`}>
            <span className="material-symbols-outlined text-xl shrink-0">
              {alert.type === 'error' ? 'error' : alert.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">System Alert</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{alert.message}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
