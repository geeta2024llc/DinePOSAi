'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralAmbassadorName, setReferralAmbassadorName] = useState('');
  const [rewardPerSignup, setRewardPerSignup] = useState(150);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) setReferralCode(refParam.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    const cfg = localStorage.getItem('dinepos_referral_config');
    if (cfg) { try { const p = JSON.parse(cfg); if (p.rewardPerSignup) setRewardPerSignup(p.rewardPerSignup); } catch { /* */ } }
  }, []);

  useEffect(() => {
    if (!referralCode.trim()) { setReferralAmbassadorName(''); return; }
    try {
      const stored = localStorage.getItem('dinepos_referrals');
      if (stored) {
        const refs = JSON.parse(stored);
        const match = refs.find((r: { code: string; name: string }) => r.code.toUpperCase() === referralCode.trim().toUpperCase());
        setReferralAmbassadorName(match ? match.name : '');
      }
    } catch { /* */ }
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !restaurantName || !password) { setError('Please fill in all required fields.'); return; }
    if (!agreeToTerms) { setError('Please agree to the Terms and Privacy Policy to continue.'); return; }
    setIsLoading(true);
    if (referralCode.trim()) {
      try {
        const stored = localStorage.getItem('dinepos_referrals');
        if (stored) {
          const referrals = JSON.parse(stored);
          const idx = referrals.findIndex((r: { code: string }) => r.code.toUpperCase() === referralCode.trim().toUpperCase());
          if (idx !== -1) {
            referrals[idx].invitedBusinesses.push({ id: `TEN-${Math.floor(1000 + Math.random() * 9000)}`, name: restaurantName, contact: fullName, joinedDate: new Date().toISOString().split('T')[0], status: 'Demo Use', services: ['POS Terminal', 'KDS Screen'], reward: rewardPerSignup });
            referrals[idx].pendingRewards += rewardPerSignup;
            localStorage.setItem('dinepos_referrals', JSON.stringify(referrals));
            window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_referrals', newValue: JSON.stringify(referrals) }));
          }
        }
      } catch { /* */ }
    }
    setTimeout(() => { setIsLoading(false); router.push('/dashboard'); }, 1500);
  };

  const inputClass = (active?: boolean) =>
    `w-full bg-white/[0.04] border ${active ? 'border-[#ffc53d]/50' : 'border-white/[0.08]'} rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/50 hover:border-white/15 transition-colors duration-200 font-sans`;

  return (
    <div className="flex min-h-screen bg-[#0a0908] font-sans overflow-hidden">

      {/* ─── LEFT PANEL ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[55%] relative flex-col justify-between p-14 overflow-hidden flex-shrink-0">

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi"
            alt=""
            className="w-full h-full object-cover opacity-30 scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {/* Deep gradient overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908] via-[#0a0908]/85 to-[#0a0908]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-[#0a0908]/60" />
        </div>

        {/* Ambient gold glow */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,197,61,0.07)_0%,transparent_70%)] rounded-full blur-[80px] pointer-events-none" />

        {/* Top: Brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#ffc53d]/15 border border-[#ffc53d]/25 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ffc53d] text-[18px] leading-none">restaurant</span>
            </div>
            <span className="font-serif text-[#ffc53d] text-xl font-bold tracking-wide group-hover:opacity-80 transition-opacity">
              DinePOS AI
            </span>
          </Link>
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 space-y-10 max-w-[520px]">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-[#ffc53d]/50" />
            <span className="text-[#ffc53d]/80 text-[10.5px] font-bold uppercase tracking-[0.22em]">
              Enterprise Hospitality Suite
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="font-serif text-white text-[48px] xl:text-[56px] font-medium leading-[1.08] tracking-tight">
              The Art of Modern
              <br />
              <span className="text-[#ffc53d] italic">Hospitality.</span>
            </h1>
            <p className="text-[#A69984] text-base leading-relaxed max-w-[420px]">
              Precision tools built for high-end culinary environments. Reduce operational friction and let your team focus on what matters — the guest.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: 'point_of_sale', title: 'Intelligent POS', desc: 'Fluid table management, split billing and real-time order routing.' },
              { icon: 'kitchen', title: 'Live Kitchen Display', desc: 'High-contrast KDS with course-based firing and allergy flags.' },
              { icon: 'bar_chart', title: 'Revenue Analytics', desc: 'Per-server, per-table and shift-level performance dashboards.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[#ffc53d] text-[18px] leading-none">{f.icon}</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm leading-none mb-1.5">{f.title}</div>
                  <div className="text-[#A69984]/70 text-[12.5px] leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial + trust badges */}
        <div className="relative z-10 space-y-6">
          {/* Testimonial */}
          <div className="border-l-2 border-[#ffc53d]/40 pl-5">
            <p className="text-white/75 text-[13.5px] leading-relaxed italic font-serif">
              "DinePOS AI operates quietly in the background, handling complex modifiers and pacing so our team can focus entirely on the choreography of the dining experience."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#ffc53d]/20 border border-[#ffc53d]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ffc53d] text-sm">person</span>
              </div>
              <div>
                <div className="text-white/90 text-xs font-bold leading-none">Julian Rossi</div>
                <div className="text-[#A69984]/55 text-[10px] mt-0.5">General Manager, L'Aura Restaurant</div>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-6">
            {[
              { icon: 'lock', label: '256-bit SSL' },
              { icon: 'shield_check', label: 'GDPR Compliant' },
              { icon: 'cloud_done', label: '99.9% Uptime' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-1.5 text-[#A69984]/40">
                <span className="material-symbols-outlined text-[13px]">{t.icon}</span>
                <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#0e0e0d] relative overflow-y-auto">

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_right,rgba(255,197,61,0.05)_0%,transparent_65%)] pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 relative z-10 min-h-screen">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-xl bg-[#ffc53d]/15 border border-[#ffc53d]/25 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ffc53d] text-base leading-none">restaurant</span>
            </div>
            <span className="font-serif text-[#ffc53d] text-lg font-bold tracking-wide">DinePOS AI</span>
          </div>

          {/* Form header */}
          <div className="mb-8 max-w-[400px]">
            <div className="inline-flex items-center gap-2 bg-[#ffc53d]/8 border border-[#ffc53d]/15 rounded-full px-3.5 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 bg-[#ffc53d] rounded-full"></span>
              <span className="text-[#ffc53d] text-[10px] font-bold uppercase tracking-[0.2em]">Free Trial — No Card Required</span>
            </div>
            <h2 className="font-serif text-white text-[32px] font-medium leading-tight tracking-wide mb-2">
              Create your account
            </h2>
            <p className="text-[#A69984]/70 text-sm leading-relaxed">
              Set up in under 2 minutes. Full access to all features during your trial.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-[400px] mb-5 flex items-start gap-2.5 p-3.5 bg-red-500/8 border border-red-500/20 text-red-300 text-[12px] font-medium rounded-xl leading-relaxed">
              <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error_outline</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-[400px]">

            {/* Name + Restaurant side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[#A69984]/80 text-[10.5px] font-bold uppercase tracking-widest">
                  Full Name <span className="text-[#ffc53d]/70">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69984]/35 leading-none pointer-events-none">person</span>
                  <input type="text" required placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass()} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[#A69984]/80 text-[10.5px] font-bold uppercase tracking-widest">
                  Restaurant <span className="text-[#ffc53d]/70">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69984]/35 leading-none pointer-events-none">storefront</span>
                  <input type="text" required placeholder="Establishment name" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className={inputClass()} />
                </div>
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label className="block text-[#A69984]/80 text-[10.5px] font-bold uppercase tracking-widest">
                Work Email <span className="text-[#ffc53d]/70">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69984]/35 leading-none pointer-events-none">mail</span>
                <input type="email" required placeholder="name@restaurant.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass()} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[#A69984]/80 text-[10.5px] font-bold uppercase tracking-widest">
                Password <span className="text-[#ffc53d]/70">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69984]/35 leading-none pointer-events-none">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass()} pr-11`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69984]/35 hover:text-[#ffc53d] transition-colors">
                  <span className="material-symbols-outlined text-lg leading-none">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-1.5">
              <label className="block text-[#A69984]/80 text-[10.5px] font-bold uppercase tracking-widest flex items-center gap-2">
                Referral Code
                <span className="text-[#A69984]/35 text-[9px] normal-case font-medium tracking-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69984]/35 leading-none pointer-events-none">redeem</span>
                <input
                  type="text"
                  placeholder="REF-ERIC-77"
                  value={referralCode}
                  onChange={e => { setReferralCode(e.target.value.toUpperCase()); }}
                  className={`${inputClass(!!referralCode)} pr-10 font-mono tracking-widest uppercase`}
                />
                {referralCode && (
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm ${referralAmbassadorName ? 'text-[#ffc53d]' : 'text-[#A69984]/30'}`}>
                    {referralAmbassadorName ? 'verified' : 'help_outline'}
                  </span>
                )}
              </div>

              {referralCode && referralAmbassadorName && (
                <div className="flex items-center gap-2.5 mt-2 bg-[#ffc53d]/8 border border-[#ffc53d]/20 rounded-xl px-3.5 py-2.5">
                  <span className="material-symbols-outlined text-[#ffc53d] text-base flex-shrink-0">verified_user</span>
                  <div>
                    <p className="text-[11px] text-[#ffc53d] font-bold leading-none">Referred by {referralAmbassadorName}</p>
                    <p className="text-[9.5px] text-[#A69984]/55 font-medium mt-0.5">They'll earn <span className="text-[#ffc53d]">${rewardPerSignup}</span> when you activate.</p>
                  </div>
                </div>
              )}
              {referralCode && !referralAmbassadorName && (
                <p className="text-[10px] text-[#A69984]/45 font-medium mt-1 flex items-center gap-1.5 pl-0.5">
                  <span className="material-symbols-outlined text-xs">info</span>
                  Code will be validated on submission.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] pt-1" />

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input type="checkbox" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="sr-only peer" />
              <div className="mt-0.5 w-[18px] h-[18px] flex-shrink-0 rounded-md border border-white/15 bg-white/[0.04] flex items-center justify-center transition-all duration-150 peer-checked:bg-[#ffc53d] peer-checked:border-[#ffc53d] group-hover:border-white/25">
                <span className="material-symbols-outlined text-[11px] text-[#2c1a00] font-black leading-none scale-0 peer-checked:scale-100 transition-transform">check</span>
              </div>
              <span className="text-[#A69984]/70 text-[11.5px] leading-relaxed font-medium">
                I agree to the{' '}
                <Link href="/terms" className="text-[#ffe2ab]/90 hover:text-[#ffc53d] font-semibold transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#ffe2ab]/90 hover:text-[#ffc53d] font-semibold transition-colors">Privacy Policy</Link>.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ffc53d] hover:bg-[#ffb014] disabled:opacity-50 disabled:cursor-not-allowed text-[#2c1a00] font-bold text-[11.5px] uppercase tracking-widest py-4 rounded-xl transition-all duration-200 shadow-[0_4px_24px_rgba(255,197,61,0.25)] hover:shadow-[0_6px_28px_rgba(255,197,61,0.35)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#2c1a00]/25 border-t-[#2c1a00] rounded-full animate-spin flex-shrink-0" />
                  Creating your account…
                </>
              ) : (
                <>
                  Get Started — It's Free
                  <span className="material-symbols-outlined text-base leading-none">arrow_forward</span>
                </>
              )}
            </button>

            {/* Login link */}
            <p className="text-center text-[#A69984]/55 text-[12px] font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-[#ffe2ab]/90 hover:text-[#ffc53d] font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </form>

        </div>

        {/* Footer */}
        <footer className="relative z-10 px-8 sm:px-12 lg:px-16 xl:px-20 py-5 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#A69984]/35 tracking-wide select-none">
          <span>© 2026 DinePOS AI Hospitality Systems</span>
          <div className="flex items-center gap-5 font-semibold">
            <Link href="/terms" className="hover:text-[#ffe2ab] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#ffe2ab] transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-[#ffe2ab] transition-colors">Support</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e0d]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ffc53d]/20 border-t-[#ffc53d] rounded-full animate-spin" />
          <span className="text-[#A69984]/50 text-xs font-medium uppercase tracking-widest">Loading</span>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
