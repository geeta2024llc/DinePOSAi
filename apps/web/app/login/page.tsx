'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';
import { apiRequest } from '@/utils/api';

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

// NOTE: Plaintext credentials below are intentional for local demo environment and quick operational role switching/testing.
const credentialsMap = {
  'super-admin': { email: 'superadmin@dinepos.ai', password: 'superadmin123', target: '/super-admin', label: 'Super Admin' },
  'admin': { email: 'admin@dinepos.ai', password: 'admin123', target: '/dashboard', label: 'Admin Owner' },
  'cashier': { email: 'cashier@dinepos.ai', password: 'cashier123', target: '/pos', label: 'Cashier Staff' },
  'kds': { email: 'kds@dinepos.ai', password: 'kds123', target: '/kds', label: 'KDS Staff' },
  'waiter': { email: 'waiter@dinepos.ai', password: 'waiter123', target: '/menu', label: 'Waiter Menu' },
  'customer': { email: 'customer@dinepos.ai', password: 'customer123', target: '/menu', label: 'Customer Menu' },
};

export default function LoginPage() {
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);

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

  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('super-admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill super-admin credentials by default on mount
  useEffect(() => {
    setEmail('superadmin@dinepos.ai');
    setPassword('superadmin123');
  }, []);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role in credentialsMap) {
      const creds = credentialsMap[role as keyof typeof credentialsMap];
      setEmail(creds.email);
      setPassword(creds.password);
      setError('');
    }
  };

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

        // Map roles to routes
        let targetRoute = '/dashboard';
        if (user.role === 'SUPER_ADMIN') {
          targetRoute = '/super-admin';
        } else if (user.role === 'MANAGER') {
          targetRoute = tenant?.onboarded ? '/dashboard' : '/onboarding';
        } else if (user.role === 'CASHIER') {
          targetRoute = '/pos';
        } else if (user.role === 'KITCHEN') {
          targetRoute = '/kds';
        }

        router.push(targetRoute);
        return;
      }

      if (response.isOfflineFallback) {
        console.log('[Auth] API is offline. Performing offline fallback validation.');
        // Fallback to local storage credentials map verification
        let isValid = false;
        let targetRoute = '';

        if (emailLower === 'superadmin@dinepos.ai' && password === 'superadmin123') {
          isValid = true;
          targetRoute = '/super-admin';
        } else if (emailLower === 'admin@dinepos.ai' && password === 'admin123') {
          isValid = true;
          targetRoute = '/dashboard';
        } else if (emailLower === 'cashier@dinepos.ai' && password === 'cashier123') {
          isValid = true;
          targetRoute = '/pos';
        } else if (emailLower === 'kds@dinepos.ai' && password === 'kds123') {
          isValid = true;
          targetRoute = '/kds';
        } else if (emailLower === 'waiter@dinepos.ai' && password === 'waiter123') {
          isValid = true;
          targetRoute = '/menu';
        } else if (emailLower === 'customer@dinepos.ai' && password === 'customer123') {
          isValid = true;
          targetRoute = '/menu';
        }

        setTimeout(() => {
          setIsLoading(false);
          if (!isValid) {
            setError('Invalid email or password. Please use the relatable password for the selected role.');
            return;
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('dinepos_logged_in_email', emailLower);
            // Setup a mock account structure for offline mode
            localStorage.setItem('dinepos_user_account', JSON.stringify({
              fullName: emailLower.split('@')[0],
              email: emailLower,
              restaurantName: 'Offline Demo Restaurant',
              role: emailLower === 'superadmin@dinepos.ai' ? 'SUPER_ADMIN' : 'MANAGER',
              currency: 'JPY',
            }));
          }
          router.push(targetRoute);
        }, 800);
        return;
      }

      // If the API explicitly returned success: false with an error message
      setIsLoading(false);
      setError(response.error || 'Authentication failed. Please verify your credentials.');

    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const handleDemoLogin = async (role: 'super-admin' | 'admin' | 'cashier' | 'customer' | 'kds' | 'waiter') => {
    const creds = credentialsMap[role];
    setSelectedRole(role);
    setEmail(creds.email);
    setPassword(creds.password);
    setIsLoading(true);
    setError('');

    try {
      const deviceId = getOrCreateDeviceId();
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: creds.email, password: creds.password, deviceId }),
        useAuth: false,
      });

      if (response.success && response.data?.token) {
        setIsLoading(false);
        const { token, user, tenant } = response.data;
        handleAuthSuccess(token, user, tenant);
        router.push(creds.target);
        return;
      }

      // Offline or network error fallback
      setTimeout(() => {
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dinepos_logged_in_email', creds.email);
          localStorage.setItem('dinepos_user_account', JSON.stringify({
            fullName: role.toUpperCase(),
            email: creds.email,
            restaurantName: 'Offline Demo Restaurant',
            role: role === 'super-admin' ? 'SUPER_ADMIN' : 'MANAGER',
            currency: 'JPY',
          }));
        }
        router.push(creds.target);
      }, 800);

    } catch (err) {
      setIsLoading(false);
      // Fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('dinepos_logged_in_email', creds.email);
      }
      router.push(creds.target);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0e0e0e] items-center justify-center relative overflow-hidden font-sans">
      {/* Background Image with Deep Blur and Warm Tinted Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="Restaurant interior blurred background" 
          className="w-full h-full object-cover blur-[8px] opacity-35 scale-105 transform transition-all duration-700" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {/* Deep radial lighting centered behind the card, blending down to black */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,18,16,0.55)_0%,rgba(10,9,8,0.96)_100%)] z-1"></div>
      </div>

      {/* Floating glassmorphism card */}
      <div className="w-full max-w-[420px] px-10 pt-12 pb-10 bg-[#161513]/85 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 mx-4 my-12 transition-all duration-300 hover:border-white/10 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
        
        {/* Logo and Subtitle */}
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
        
        {error && (
          <div className="mb-6 p-3 bg-red-950/45 border border-red-500/20 text-red-300 text-xs rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role selector field */}
          <div className="space-y-2">
            <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-[0.12em] select-none">
              {cmsConfig.auth.loginRoleLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                <span className="material-symbols-outlined text-lg leading-none">supervised_user_circle</span>
              </div>
              <select 
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-10 py-3 text-white font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15 appearance-none cursor-pointer"
              >
                <option value="super-admin">Super Admin (Global System)</option>
                <option value="admin">Admin Owner (Restaurant/Business Console)</option>
                <option value="cashier">Cashier Staff (Point of Sale)</option>
                <option value="kds">KDS Staff (Kitchen Display)</option>
                <option value="waiter">Waiter Staff (Digital Menu)</option>
                <option value="customer">Customer Guest (Fixed Table)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                <span className="material-symbols-outlined text-lg leading-none">keyboard_arrow_down</span>
              </div>
            </div>
          </div>

          {/* Email field */}
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
                placeholder="director@dinepos.ai" 
              />
            </div>
          </div>

          {/* Password field */}
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

          {/* Remember this device check */}
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

          {/* Submit Sign In button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/50 disabled:cursor-not-allowed text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:shadow-[0_4px_24px_rgba(255,226,171,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#402d00]/30 border-t-[#402d00] rounded-full animate-spin flex-shrink-0"></span>
                {cmsConfig.auth.loginButtonText === 'Sign In' ? 'Signing In…' : `${cmsConfig.auth.loginButtonText}…`}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {cmsConfig.auth.loginButtonText} <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
              </span>
            )}
          </button>
        </form>

        {/* Quick Role Login Section */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <div className="text-center">
            <span className="text-[#A69984] text-[10px] font-bold uppercase tracking-[0.15em] select-none">
              {cmsConfig.auth.loginDemoTitle}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('super-admin')}
              className="bg-white/5 border border-white/10 hover:border-[#ffe2ab]/30 text-white hover:text-[#ffe2ab] rounded-lg py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
              Super Admin
            </button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('admin')}
              className="bg-white/5 border border-white/10 hover:border-[#ffe2ab]/30 text-white hover:text-[#ffe2ab] rounded-lg py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xs">storefront</span>
              Admin Owner
            </button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('cashier')}
              className="bg-white/5 border border-white/10 hover:border-[#ffe2ab]/30 text-white hover:text-[#ffe2ab] rounded-lg py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xs">point_of_sale</span>
              Cashier POS
            </button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('kds')}
              className="bg-white/5 border border-white/10 hover:border-[#ffe2ab]/30 text-white hover:text-[#ffe2ab] rounded-lg py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xs">chef_hat</span>
              Kitchen KDS
            </button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('waiter')}
              className="bg-white/5 border border-white/10 hover:border-[#ffe2ab]/30 text-white hover:text-[#ffe2ab] rounded-lg py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xs">restaurant_menu</span>
              Waiter Menu
            </button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('customer')}
              className="bg-white/5 border border-white/10 hover:border-[#ffe2ab]/30 text-white hover:text-[#ffe2ab] rounded-lg py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xs">menu_book</span>
              Customer Menu
            </button>
          </div>
        </div>

        {/* Muted bottom operational guideline text */}
        <div className="mt-6 text-center text-[#A69984]/40 font-sans text-[10px] leading-relaxed select-none uppercase tracking-[0.06em]">
          {cmsConfig.auth.loginFooter}
        </div>
      </div>
    </div>
  );
}
