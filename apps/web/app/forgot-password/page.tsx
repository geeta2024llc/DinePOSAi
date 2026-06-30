'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        useAuth: false,
        body: JSON.stringify({ email })
      });

      if (res.success) {
        setIsSubmitted(true);
      } else {
        setError(res.error || 'Failed to send reset instructions. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0e0d0c] items-center justify-center relative p-4">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#ffe2ab]/5 blur-[120px] pointer-events-none z-0"></div>
      
      <div className="w-full max-w-[420px] px-10 pt-12 pb-10 bg-[#161513]/85 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 my-12 transition-all duration-300 hover:border-white/10 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
        {isSubmitted ? (
          <div className="space-y-6 py-4">
            <div className="flex justify-center mb-2">
              <span className="material-symbols-outlined text-[#ffe2ab] text-6xl font-extralight animate-pulse">check_circle</span>
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-white tracking-wide mb-3">Instructions Sent</h1>
              <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed max-w-xs mx-auto px-2">
                We have sent secure reset instructions to <strong className="text-white select-text font-bold">{email}</strong>. Please check your inbox and spam folder.
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
                <span className="material-symbols-outlined text-xl leading-none">lock_reset</span>
              </div>
            </div>
            
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl font-bold text-white tracking-wide mb-2.5">Forgot Password</h1>
              <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed max-w-xs mx-auto">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-400 text-xs rounded-lg font-sans">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[#A69984] text-[10px] font-bold uppercase tracking-[0.12em] select-none">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                    <span className="material-symbols-outlined text-lg leading-none">mail</span>
                  </div>
                  <input 
                    type="email" 
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15 disabled:opacity-50"
                    placeholder="manager@restaurant.com" 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:shadow-[0_4px_24px_rgba(255,226,171,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#402d00]/30 border-t-[#402d00] rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Instructions <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center border-t border-white/5 pt-5">
              <Link href="/login" className="inline-flex items-center gap-2 text-[#ffe2ab] text-xs font-semibold tracking-wide hover:text-[#ffdca0] transition-colors duration-200">
                <span className="material-symbols-outlined text-xs">arrow_back</span> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
      
      <div className="absolute bottom-8 text-center w-full font-sans text-[#A69984]/50 text-xs select-none">
        Need help? <Link href="/support" className="text-[#ffe2ab] hover:underline font-bold transition-colors">Contact Support</Link>
      </div>
    </div>
  );
}
