'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';
import { apiRequest } from '@/utils/api';
import { useAuth } from '../authContext';

// Helper to get or create device ID
const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server-side';
  let deviceId = localStorage.getItem('dinepos_device_id');
  if (!deviceId) {
    deviceId = 'dev-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dinepos_device_id', deviceId);
  }
  return deviceId;
};

// Offline credential map — email → { password, role, route }
const OFFLINE_CREDENTIALS: Record<string, { password: string; role: 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN'; route: string }> = {
  'superadmin@dinepos.ai': { password: 'superadmin123', role: 'SUPER_ADMIN', route: '/super-admin' },
  'admin@dinepos.ai':      { password: 'admin123',      role: 'MANAGER',     route: '/dashboard' },
  'cashier@dinepos.ai':    { password: 'cashier123',    role: 'CASHIER',     route: '/pos' },
  'kds@dinepos.ai':        { password: 'kds123',        role: 'KITCHEN',     route: '/kds' },
  'waiter@dinepos.ai':     { password: 'waiter123',     role: 'MANAGER',     route: '/menu' },
  'customer@dinepos.ai':   { password: 'customer123',   role: 'MANAGER',     route: '/menu' },
  'demo@dinepos.ai':       { password: 'demo123',       role: 'MANAGER',     route: '/demo' },
};

function LoginForm() {
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);
  const { login: ctxLogin, logout: ctxLogout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('logout') === 'true') {
      ctxLogout();
      router.replace('/login');
    }
  }, [searchParams, ctxLogout, router]);

  useEffect(() => {
    const config = getCmsConfig();
    setCmsConfig(config);
    if (typeof window !== 'undefined') {
      document.title = config.auth.loginPageTitle;
    }
    const handleUpdate = () => {
      const updated = getCmsConfig();
      setCmsConfig(updated);
      if (typeof window !== 'undefined') {
        document.title = updated.auth.loginPageTitle;
      }
    };
    window.addEventListener('dinepos_cms_update', handleUpdate);
    return () => window.removeEventListener('dinepos_cms_update', handleUpdate);
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSuccess = (token: string, user: any, tenant: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_jwt_token', token);
      localStorage.setItem('dinepos_logged_in_email', user.email);
      localStorage.setItem('dinepos_user_account', JSON.stringify({
        fullName: user.name,
        email: user.email,
        restaurantName: tenant?.name || 'My Restaurant',
        role: user.role,
        tenantId: tenant?.id,
        currency: tenant?.currency || 'JPY',
        onboarded: tenant?.onboarded || false,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const emailLower = email.toLowerCase().trim();
    setIsLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailLower, password, deviceId }),
        useAuth: false,
      });

      if (response.success && response.data?.token) {
        setIsLoading(false);
        const { token, user, tenant } = response.data;
        handleAuthSuccess(token, user, tenant);
        ctxLogin(token, user, tenant);
        return;
      }

      if (response.isOfflineFallback) {
        console.log('[Auth] API is offline. Performing offline fallback validation.');

        const cred = OFFLINE_CREDENTIALS[emailLower];
        const isValid = !!cred && cred.password === password;

        setTimeout(() => {
          setIsLoading(false);
          if (!isValid) {
            setError('Invalid email or password.');
            return;
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('dinepos_logged_in_email', emailLower);
          }

          const mockUser = {
            id: 'offline-user-id',
            name: emailLower.split('@')[0],
            email: emailLower,
            role: cred.role,
          };
          const mockTenant = {
            id: 'offline-tenant-id',
            name: 'Demo Restaurant',
            currency: 'JPY',
            taxType: 'NONE' as any,
            taxRate: 0,
            onboarded: true,
          };

          ctxLogin('offline-mock-jwt-token', mockUser, mockTenant);
        }, 800);
        return;
      }

      // API returned success: false
      setIsLoading(false);
      setError(response.error || 'Authentication failed. Please verify your credentials.');

    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0e0e0e] items-center justify-center relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Restaurant interior blurred background"
          className="w-full h-full object-cover blur-[8px] opacity-35 scale-105 transform transition-all duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,18,16,0.55)_0%,rgba(10,9,8,0.96)_100%)] z-1" />
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px] px-10 pt-12 pb-10 bg-[#161513]/85 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 mx-4 my-12 transition-all duration-300 hover:border-white/10">

        {/* Logo & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-[#ffe2ab] text-[36px] font-semibold tracking-wide leading-none select-none">
            {cmsConfig.auth.loginPageTitle}
          </h1>
          <h2 className="text-white font-bold text-xs tracking-wide mt-3 select-none">
            {cmsConfig.auth.loginTitle}
          </h2>
          <p className="text-[#A69984] font-sans text-[10px] leading-relaxed mt-1 select-none font-medium">
            {cmsConfig.auth.loginSubtitle}
          </p>
        </div>

        {/* Free Trial Banner */}
        <div className="mb-6">
          <Link
            href="/register"
            className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl border border-[#ffe2ab]/25 bg-[#ffe2ab]/5 hover:bg-[#ffe2ab]/10 hover:border-[#ffe2ab]/40 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399] shrink-0" />
              <div>
                <div className="text-[#ffe2ab] font-bold text-xs tracking-wide">New here? Sign up free</div>
                <div className="text-[#A69984] text-[10px] mt-0.5">Get 7 days free trial automatically upon signup</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#ffe2ab]/60 group-hover:text-[#ffe2ab] text-base transition-colors">arrow_forward</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/45 border border-red-500/20 text-red-300 text-xs rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-[0.12em] select-none">
              {cmsConfig.auth.loginEmailLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                <span className="material-symbols-outlined text-lg leading-none">mail</span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15"
                placeholder="you@yourrestaurant.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-[0.12em] select-none">
                {cmsConfig.auth.loginPasswordLabel}
              </label>
              <Link
                href="/forgot-password"
                className="text-[#ffe2ab] text-[11px] font-semibold tracking-wide hover:text-[#ffdca0] transition-colors"
              >
                {cmsConfig.auth.loginForgotPassword}
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                <span className="material-symbols-outlined text-lg leading-none">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-11 py-3 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-colors duration-200 hover:border-white/15"
                placeholder={showPassword ? 'password' : '••••••••••••'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A69984]/40 hover:text-[#ffe2ab] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-lg leading-none">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center pt-1">
            <label className="relative flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[18px] h-[18px] bg-[#12110f]/90 border border-white/10 rounded flex items-center justify-center transition-all duration-200 peer-checked:bg-[#ffe2ab] peer-checked:border-[#ffe2ab] peer-hover:border-white/20">
                <span className="material-symbols-outlined text-[10px] text-[#402d00] font-black scale-0 peer-checked:scale-100 transition-transform duration-200 select-none">check</span>
              </div>
              <span className="ml-2.5 text-[#A69984]/85 font-sans text-[11px] font-medium tracking-wide">
                {cmsConfig.auth.loginRememberMe}
              </span>
            </label>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/50 disabled:cursor-not-allowed text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:shadow-[0_4px_24px_rgba(255,226,171,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#402d00]/30 border-t-[#402d00] rounded-full animate-spin flex-shrink-0" />
                Signing In…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {cmsConfig.auth.loginButtonText}
                <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
              </span>
            )}
          </button>
        </form>

        {/* Sign up */}
        <div className="mt-5 text-center border-t border-white/5 pt-4 text-xs font-sans text-[#A69984]/70 select-none">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#ffe2ab] hover:text-[#ffdca0] font-semibold transition-colors duration-200 ml-1 hover:underline">
            Start Free Trial
          </Link>
        </div>

        <div className="mt-6 text-center text-[#A69984]/40 font-sans text-[10px] leading-relaxed select-none uppercase tracking-[0.06em]">
          {cmsConfig.auth.loginFooter}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e0d]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ffe2ab]/20 border-t-[#ffe2ab] rounded-full animate-spin" />
          <span className="text-[#A69984]/50 text-xs font-medium uppercase tracking-widest">Loading</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
