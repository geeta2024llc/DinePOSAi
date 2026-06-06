'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  invitedBusinesses: unknown[];
}

export default function AmbassadorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const saved = localStorage.getItem('dinepos_active_referral_email');
    if (saved) {
      const stored = localStorage.getItem('dinepos_referrals');
      if (stored) {
        const referrals: Referral[] = JSON.parse(stored);
        const found = referrals.find(r => r.email === saved);
        if (found) {
          router.replace('/partners');
        }
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const stored = localStorage.getItem('dinepos_referrals');
    if (!stored) {
      setError('No partner accounts found. Please register first.');
      return;
    }

    const referrals: Referral[] = JSON.parse(stored);
    const found = referrals.find(
      r => r.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!found) {
      setError('Email address not registered in our partner portal.');
      return;
    }

    if (found.status === 'SUSPENDED') {
      setError('This ambassador account has been suspended. Contact support.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('dinepos_active_referral_email', found.email);
      router.push('/partners');
    }, 900);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setError('');
    setIsLoading(true);

    const stored = localStorage.getItem('dinepos_referrals');
    if (stored) {
      const referrals: Referral[] = JSON.parse(stored);
      const found = referrals.find(r => r.email.toLowerCase() === demoEmail.toLowerCase());
      if (found) {
        setTimeout(() => {
          localStorage.setItem('dinepos_active_referral_email', found.email);
          router.push('/partners');
        }, 700);
        return;
      }
    }
    setIsLoading(false);
    setError('Demo account not initialised yet — visit /partners first to seed data.');
  };

  return (
    <div className="min-h-screen bg-[#0e0e0d] flex flex-col items-center justify-center relative overflow-hidden font-sans">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Luxury restaurant interior"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi"
          className="w-full h-full object-cover opacity-20 scale-105 blur-[6px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,18,16,0.45)_0%,rgba(10,9,8,0.97)_100%)]"></div>
      </div>

      {/* Ambient gold glow */}
      <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(255,197,61,0.05)_0%,transparent_70%)] rounded-full blur-[80px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,226,171,0.03)_0%,transparent_75%)] rounded-full blur-[90px] pointer-events-none z-0"></div>

      {/* Back link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/partners"
          className="flex items-center gap-2 text-[#A69984]/60 hover:text-[#ffc53d] font-sans text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Partner Portal
        </Link>
      </div>

      {/* Glass card */}
      <div className="w-full max-w-[420px] mx-4 relative z-10">

        {/* Branding */}
        <div className="text-center mb-8 select-none">
          <Link href="/" className="font-serif text-[#ffc53d] text-3xl font-bold tracking-wide hover:opacity-80 transition-opacity">
            DinePOS AI
          </Link>
          <p className="text-[#A69984]/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">
            Ambassador Portal
          </p>
        </div>

        <div className="bg-[#161513]/90 backdrop-blur-2xl border border-white/[0.07] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.04)] p-8 space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <h1 className="font-serif text-2xl text-white font-medium tracking-wide">
              Ambassador Sign In
            </h1>
            <p className="text-[#A69984]/65 text-xs font-semibold">
              Access your partner dashboard to track referrals and earnings.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-semibold">
              <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[#A69984]/90 text-[9.5px] font-bold uppercase tracking-widest select-none">
                Partner Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                  <span className="material-symbols-outlined text-[19px] leading-none">mail</span>
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@restaurant.com"
                  className="w-full bg-[#12110f]/90 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-[#A69984]/30 focus:outline-none focus:border-[#ffc53d]/40 hover:border-white/15 transition-colors duration-200 font-sans"
                />
              </div>
              <p className="text-[9.5px] text-[#A69984]/40 font-medium pt-0.5">
                Use the email you registered with on the Partner Portal.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ffc53d] hover:bg-[#ffb014] disabled:bg-[#ffc53d]/40 disabled:cursor-not-allowed text-[#2c1a00] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(255,197,61,0.2)] hover:shadow-[0_4px_24px_rgba(255,197,61,0.3)] hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#2c1a00]/30 border-t-[#2c1a00] rounded-full animate-spin flex-shrink-0"></span>
                  Signing In…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Access Dashboard
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              )}
            </button>
          </form>

          {/* Demo quick-login */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <p className="text-[9.5px] text-[#A69984]/45 font-bold uppercase tracking-[0.15em] text-center select-none">
              Demo Accounts
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { email: 'chef@lebernardin.com', name: 'Eric Ripert' },
                { email: 'ana@hisafranko.com', name: 'Ana Ros' },
                { email: 'pierre@lumiere.com', name: 'Pierre Gagnaire' },
              ].map(demo => (
                <button
                  key={demo.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoLogin(demo.email)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border border-white/8 hover:border-[#ffc53d]/25 hover:bg-[#ffc53d]/5 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div>
                    <div className="text-white font-bold text-xs group-hover:text-[#ffc53d] transition-colors">{demo.name}</div>
                    <div className="text-[#A69984]/50 font-mono text-[9.5px] mt-0.5">{demo.email}</div>
                  </div>
                  <span className="material-symbols-outlined text-[#A69984]/30 group-hover:text-[#ffc53d]/60 text-sm transition-colors">login</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[10.5px] text-[#A69984]/50 font-semibold">
          <span>Not a partner yet?</span>
          <Link
            href="/partners"
            className="text-[#ffc53d] hover:text-[#ffb014] font-bold transition-colors flex items-center gap-1"
          >
            Join the Program
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
