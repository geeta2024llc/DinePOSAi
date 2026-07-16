'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/utils/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'custom' | 'supabase'>('custom');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password complexity helper checks
  const isLengthValid = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const isMatching = newPassword !== '' && newPassword === confirmPassword;

  const isFormValid = isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSymbol && isMatching;

  useEffect(() => {
    const qToken = searchParams.get('token');
    if (qToken) {
      setToken(qToken);
      setAuthType('custom');
      setError('');
    } else {
      // Check for Supabase hash token
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = params.get('access_token');
        if (accessToken) {
          setToken(accessToken);
          setAuthType('supabase');
          setError('');
          return;
        }
      }
      setError('Invalid reset link. Token parameter is missing from the URL.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !token) return;

    setIsLoading(true);
    setError('');

    try {
      const endpoint = authType === 'supabase' ? '/api/auth/reset-password-supabase' : '/api/auth/reset-password';
      const res = await apiRequest(endpoint, {
        method: 'POST',
        useAuth: false,
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(res.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] px-10 pt-12 pb-10 bg-[#161513]/85 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 my-12 transition-all duration-300 hover:border-white/10 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
      {isSuccess ? (
        <div className="space-y-6 py-4">
          <div className="flex justify-center mb-2">
            <span className="material-symbols-outlined text-[#ffe2ab] text-6xl font-extralight animate-pulse">check_circle</span>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-white tracking-wide mb-3">Password Reset</h1>
            <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed max-w-xs mx-auto px-2">
              Your password has been updated successfully. Redirecting you to the login page...
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login" className="inline-flex items-center gap-2 text-[#ffe2ab] text-xs font-semibold tracking-wide hover:text-[#ffdca0] transition-colors duration-200">
              <span className="material-symbols-outlined text-xs">arrow_back</span> Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 flex items-center justify-center text-[#ffe2ab]">
              <span className="material-symbols-outlined text-xl leading-none">lock</span>
            </div>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-white tracking-wide mb-2.5">Reset Password</h1>
            <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed max-w-xs mx-auto">
              Please choose a new, secure password to protect your restaurant merchant account.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-400 text-xs rounded-lg font-sans">
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-[0.12em] select-none">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                  <span className="material-symbols-outlined text-lg leading-none">lock</span>
                </div>
                <input 
                  type="password" 
                  required
                  disabled={isLoading || !token}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15 disabled:opacity-50"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-[0.12em] select-none">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                  <span className="material-symbols-outlined text-lg leading-none">lock</span>
                </div>
                <input 
                  type="password" 
                  required
                  disabled={isLoading || !token}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15 disabled:opacity-50"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {/* Real-time Zod validations checklist */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 select-none text-[11px] font-sans text-[#A69984]/70 leading-normal">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${isLengthValid ? 'text-emerald-400' : 'text-white/20'}`}>
                  {isLengthValid ? 'check_circle' : 'circle'}
                </span>
                At least 8 characters long
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${hasUppercase ? 'text-emerald-400' : 'text-white/20'}`}>
                  {hasUppercase ? 'check_circle' : 'circle'}
                </span>
                Contains an uppercase letter (A-Z)
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${hasLowercase ? 'text-emerald-400' : 'text-white/20'}`}>
                  {hasLowercase ? 'check_circle' : 'circle'}
                </span>
                Contains a lowercase letter (a-z)
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${hasNumber ? 'text-emerald-400' : 'text-white/20'}`}>
                  {hasNumber ? 'check_circle' : 'circle'}
                </span>
                Contains a number (0-9)
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${hasSymbol ? 'text-emerald-400' : 'text-white/20'}`}>
                  {hasSymbol ? 'check_circle' : 'circle'}
                </span>
                Contains a special character (!@#$ etc.)
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${isMatching ? 'text-emerald-400' : 'text-white/20'}`}>
                  {isMatching ? 'check_circle' : 'circle'}
                </span>
                Passwords match exactly
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !isFormValid}
              className="w-full bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:shadow-[0_4px_24px_rgba(255,226,171,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#402d00]/30 border-t-[#402d00] rounded-full animate-spin" />
              ) : (
                <>
                  Reset Password <span className="material-symbols-outlined text-sm font-black">lock_open</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-white/5 pt-5">
            <Link href="/login" className="inline-flex items-center gap-2 text-[#ffe2ab] text-xs font-semibold tracking-wide hover:text-[#ffdca0] transition-colors duration-200">
              <span className="material-symbols-outlined text-xs">arrow_back</span> Return to Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0e0d0c] items-center justify-center relative p-4">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#ffe2ab]/5 blur-[120px] pointer-events-none z-0"></div>
      
      <Suspense fallback={
        <div className="w-full max-w-[420px] px-10 pt-12 pb-10 bg-[#161513]/85 backdrop-blur-2xl rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#ffe2ab] rounded-full animate-spin mb-4" />
          <span className="text-white/40 text-xs font-sans">Loading Secure Reset Form...</span>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
      
      <div className="absolute bottom-8 text-center w-full font-sans text-[#A69984]/50 text-xs select-none">
        Need help? <Link href="/support" className="text-[#ffe2ab] hover:underline font-bold transition-colors">Contact Support</Link>
      </div>
    </div>
  );
}
