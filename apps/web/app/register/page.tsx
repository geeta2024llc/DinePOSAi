'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';

function RegisterForm() {
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);

  useEffect(() => {
    setCmsConfig(getCmsConfig());
    const handleUpdate = () => setCmsConfig(getCmsConfig());
    window.addEventListener('dinepos_cms_update', handleUpdate);
    return () => window.removeEventListener('dinepos_cms_update', handleUpdate);
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTier = searchParams.get('tier') || 'Growth';

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

    const joinedDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14); // 14 days trial duration
    const expiryStr = expiryDate.toISOString().split('T')[0];

    const userAccount = {
      fullName,
      email: email.toLowerCase(),
      restaurantName,
      tier: selectedTier,
      plan: 'TRIAL',
      joinedDate,
      expiryDate: expiryStr,
    };
    
    try {
      localStorage.setItem('dinepos_user_account', JSON.stringify(userAccount));
      localStorage.setItem('dinepos_logged_in_email', email.toLowerCase());
    } catch (err) {
      console.error('Failed to write user account to localStorage:', err);
    }

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
    <div className="flex min-h-screen bg-[#0a0a0a] font-sans overflow-hidden">

      {/* ─── LEFT PANEL ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[55%] relative flex-col justify-between p-16 xl:p-20 overflow-hidden flex-shrink-0 border-r border-white/[0.03]">

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi"
            alt=""
            className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {/* Deep gradient overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Ambient gold glow */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,226,171,0.06)_0%,transparent_70%)] rounded-full blur-[100px] pointer-events-none" />

        {/* Top: Brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
              <span className="material-symbols-outlined text-[#ffe2ab] text-[20px] leading-none">restaurant</span>
            </div>
            <span className="font-display-lg text-[#ffe2ab] text-2xl font-bold tracking-wide group-hover:drop-shadow-[0_0_10px_rgba(255,226,171,0.5)] transition-all">
              DinePOS AI
            </span>
          </Link>
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 space-y-12 max-w-[560px]">
          {/* Eyebrow */}
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-[#ffe2ab]/50 to-transparent" />
            <span className="text-[#ffe2ab]/80 text-xs font-bold uppercase tracking-[0.25em]">
              Enterprise Hospitality Suite
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h1 className="font-display-lg text-[3.5rem] xl:text-[4rem] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-semibold leading-[1.1] tracking-tight drop-shadow-sm">
              The Art of Modern
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe2ab] via-[#ffd380] to-[#cc9d31] italic pr-2 drop-shadow-[0_0_20px_rgba(255,226,171,0.2)]">Hospitality.</span>
            </h1>
            <p className="font-body-md text-[#d4c5ab]/80 text-lg leading-relaxed max-w-[480px] font-light">
              Precision tools built for high-end culinary environments. Reduce operational friction and let your team focus on what matters — the guest.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-6">
            {[
              { icon: 'point_of_sale', title: 'Intelligent POS', desc: 'Fluid table management, split billing and real-time order routing.' },
              { icon: 'kitchen', title: 'Live Kitchen Display', desc: 'High-contrast KDS with course-based firing and allergy flags.' },
              { icon: 'bar_chart', title: 'Revenue Analytics', desc: 'Per-server, per-table and shift-level performance dashboards.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 group-hover:-translate-y-1 group-hover:bg-white/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-[#ffe2ab] text-[22px] leading-none">{f.icon}</span>
                </div>
                <div className="pt-1">
                  <div className="font-title-md text-white font-semibold text-base leading-none mb-2">{f.title}</div>
                  <div className="font-body-md text-[#d4c5ab]/70 text-sm leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial + trust badges */}
        <div className="relative z-10 space-y-8">
          {/* Testimonial */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
            <span className="material-symbols-outlined absolute -top-4 -right-4 text-7xl text-white/[0.02] font-light">format_quote</span>
            <p className="font-serif text-[#d4c5ab]/90 text-sm leading-relaxed italic relative z-10">
              "DinePOS AI is the absolute cornerstone of our business operations at GEETA LLC. The seamless KDS integration, combined with real-time multi-branch telemetry and AI upselling, has allowed us to scale our culinary concepts with absolute consistency and efficiency."
            </p>
            <div className="mt-5 flex items-center gap-4 relative z-10 border-t border-white/5 pt-4">
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEid7UQR_nMKW3G3jPlC08Wk9mr2l-nkxjh3ar_eR_u9b85HgBO8SzA6H5bwjTt3UtafFlb3IxXTeY2JxUN3xFkEIx1HL3I_42PiDzRFxy_AKQ6Yi81BKjiTfP-2Luko51rLj525315xEG14mUuK_NLKmWRXD5gl3ga11R2wAwtSdO6Wn23PcT8o6-dWbcg/s320/9aa544e2-ec4d-476a-8bbf-c589d0ee2464.jpg" 
                alt="シリス　テクラル" 
                className="w-10 h-10 rounded-full object-cover border border-[#ffe2ab]/30"
                style={{ objectPosition: 'center 15%' }}
              />
              <div>
                <div className="font-title-md text-white text-sm font-semibold leading-none">シリス　テクラル (SHREES TEKLAL)</div>
                <div className="font-label-sm text-[#ffe2ab]/80 text-[10px] uppercase tracking-widest mt-1">OWNER OF GEETA合同会社</div>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-8">
            {[
              { icon: 'lock', label: '256-bit SSL' },
              { icon: 'shield_check', label: 'GDPR Compliant' },
              { icon: 'cloud_done', label: '99.9% Uptime' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-[#d4c5ab]/40">
                <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                <span className="text-xs font-semibold tracking-wide uppercase">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#0e0e0d] relative overflow-y-auto">

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_top_right,rgba(255,226,171,0.03)_0%,transparent_65%)] pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 xl:px-24 py-16 relative z-10 min-h-screen">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ffe2ab] text-xl leading-none">restaurant</span>
            </div>
            <span className="font-display-lg text-[#ffe2ab] text-2xl font-bold tracking-wide">DinePOS AI</span>
          </div>

          {/* Form header */}
          <div className="mb-10 max-w-[440px]">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#ffe2ab]/20 bg-[#ffe2ab]/5 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,226,171,0.05)]">
              <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-pulse shadow-[0_0_8px_#ffe2ab]"></span>
              <span className="font-label-sm text-[#ffe2ab] text-xs font-bold uppercase tracking-[0.2em]">{selectedTier} Free Trial — 14 Days</span>
            </div>
            <h2 className="font-display-lg text-white text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-3">
              {cmsConfig.auth.signupTitle}
            </h2>
            <p className="font-body-md text-[#d4c5ab]/80 text-base leading-relaxed font-light">
              {cmsConfig.auth.signupSubtitle}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-[440px] mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl leading-relaxed backdrop-blur-md">
              <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error_outline</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 max-w-[440px]">

            {/* Name + Restaurant side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[#d4c5ab]/80 text-xs font-bold uppercase tracking-widest font-label-sm">
                  Full Name <span className="text-[#ffe2ab]/70">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-white/20 leading-none pointer-events-none group-focus-within:text-[#ffe2ab]/60 transition-colors">person</span>
                  <input type="text" required placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass()} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[#d4c5ab]/80 text-xs font-bold uppercase tracking-widest font-label-sm">
                  Restaurant <span className="text-[#ffe2ab]/70">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-white/20 leading-none pointer-events-none group-focus-within:text-[#ffe2ab]/60 transition-colors">storefront</span>
                  <input type="text" required placeholder="Establishment name" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className={inputClass()} />
                </div>
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-2">
              <label className="block text-[#d4c5ab]/80 text-xs font-bold uppercase tracking-widest font-label-sm">
                Work Email <span className="text-[#ffe2ab]/70">*</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-white/20 leading-none pointer-events-none group-focus-within:text-[#ffe2ab]/60 transition-colors">mail</span>
                <input type="email" required placeholder="name@restaurant.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass()} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[#d4c5ab]/80 text-xs font-bold uppercase tracking-widest font-label-sm">
                Password <span className="text-[#ffe2ab]/70">*</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-white/20 leading-none pointer-events-none group-focus-within:text-[#ffe2ab]/60 transition-colors">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass()} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#ffe2ab] transition-colors">
                  <span className="material-symbols-outlined text-xl leading-none">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <label className="block text-[#d4c5ab]/80 text-xs font-bold uppercase tracking-widest font-label-sm flex items-center gap-2">
                Referral Code
                <span className="text-[#d4c5ab]/40 text-[10px] normal-case font-medium tracking-normal">(optional)</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-white/20 leading-none pointer-events-none group-focus-within:text-[#ffe2ab]/60 transition-colors">redeem</span>
                <input
                  type="text"
                  placeholder="REF-ERIC-77"
                  value={referralCode}
                  onChange={e => { setReferralCode(e.target.value.toUpperCase()); }}
                  className={`${inputClass(!!referralCode)} pr-10 font-mono tracking-widest uppercase`}
                />
                {referralCode && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg ${referralAmbassadorName ? 'text-[#ffe2ab]' : 'text-white/20'}`}>
                    {referralAmbassadorName ? 'verified' : 'help_outline'}
                  </span>
                )}
              </div>

              {referralCode && referralAmbassadorName && (
                <div className="flex items-center gap-3 mt-3 bg-[#ffe2ab]/5 border border-[#ffe2ab]/20 rounded-xl p-4 backdrop-blur-md">
                  <span className="material-symbols-outlined text-[#ffe2ab] text-xl flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,226,171,0.5)]">verified_user</span>
                  <div>
                    <p className="text-xs text-white font-semibold leading-none mb-1">Referred by {referralAmbassadorName}</p>
                    <p className="text-[11px] text-[#d4c5ab]/70 font-medium">They'll earn <span className="text-[#ffe2ab]">${rewardPerSignup}</span> when you activate.</p>
                  </div>
                </div>
              )}
              {referralCode && !referralAmbassadorName && (
                <p className="text-[11px] text-[#d4c5ab]/50 font-medium mt-2 flex items-center gap-1.5 pl-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Code will be validated on submission.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] pt-2" />

            {/* Terms */}
            <label className="flex items-start gap-4 cursor-pointer group select-none">
              <input type="checkbox" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="sr-only peer" />
              <div className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-md border border-white/20 bg-white/[0.02] flex items-center justify-center transition-all duration-200 peer-checked:bg-[#ffe2ab] peer-checked:border-[#ffe2ab] group-hover:border-white/40">
                <span className="material-symbols-outlined text-sm text-[#261a00] font-black leading-none scale-0 peer-checked:scale-100 transition-transform">check</span>
              </div>
              <span className="text-[#d4c5ab]/80 text-sm leading-relaxed font-light">
                I agree to the{' '}
                <Link href="/terms" className="text-[#ffe2ab] hover:drop-shadow-[0_0_8px_rgba(255,226,171,0.5)] font-semibold transition-all">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#ffe2ab] hover:drop-shadow-[0_0_8px_rgba(255,226,171,0.5)] font-semibold transition-all">Privacy Policy</Link>.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] disabled:from-[#ffe2ab]/50 disabled:to-[#cc9d31]/50 text-[#261a00] font-title-md font-bold text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden shadow-[0_10px_30px_rgba(255,226,171,0.25)] hover:shadow-[0_15px_40px_rgba(255,226,171,0.4)] disabled:hover:translate-y-0 disabled:hover:shadow-none mt-4"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#261a00]/30 border-t-[#261a00] rounded-full animate-spin flex-shrink-0" />
                    Creating your account…
                  </>
                ) : (
                  <>
                    Get Started — It's Free
                    <span className="material-symbols-outlined text-base transform group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                  </>
                )}
              </span>
              {!isLoading && <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>}
            </button>

            {/* Login link */}
            <p className="text-center text-[#d4c5ab]/70 text-sm font-medium pt-2">
              Already have an account?{' '}
              <Link href="/login" className="text-[#ffe2ab] hover:drop-shadow-[0_0_8px_rgba(255,226,171,0.5)] font-bold transition-all">
                Sign in
              </Link>
            </p>
          </form>

        </div>

        {/* Footer */}
        <footer className="relative z-10 px-8 sm:px-12 xl:px-24 py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#d4c5ab]/40 tracking-wide select-none">
          <span>© 2026 DinePOS AI Hospitality Systems</span>
          <div className="flex items-center gap-6 font-semibold">
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
