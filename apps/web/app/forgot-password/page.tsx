import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#131210] items-center justify-center relative">
      <div className="w-full max-w-md p-xl bg-[#1C1A17] rounded-xl border border-outline/10 shadow-2xl relative z-10 my-12 text-center">
        <div className="mb-md flex justify-center">
          <span className="material-symbols-outlined text-primary text-5xl font-light">lock_reset</span>
        </div>
        
        <div className="mb-xl">
          <h1 className="font-display-lg text-4xl text-on-surface font-semibold mb-sm">Forgot Password</h1>
          <p className="font-body-md text-on-surface-variant text-sm px-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        <form className="space-y-lg text-left">
          <div>
            <label className="block font-label-sm text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-xs">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">mail</span>
              </div>
              <input 
                type="email" 
                className="w-full bg-[#131210] border border-outline/20 rounded-md pl-10 pr-md py-sm text-on-surface font-body-md focus:border-primary focus:outline-none transition-colors"
                placeholder="manager@restaurant.com" 
              />
            </div>
          </div>
          
          <button type="button" className="w-full bg-primary text-on-primary font-title-md py-sm rounded-md hover:opacity-90 transition-all shadow-[0_4px_14px_0_rgba(255,191,0,0.15)] mt-xl flex items-center justify-center gap-2">
            Send Reset Instructions <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>
        
        <div className="mt-lg pt-sm text-center">
          <Link href="/login" className="inline-flex items-center gap-2 font-title-md text-primary text-sm hover:underline font-bold">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Login
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-center w-full font-body-md text-on-surface-variant text-sm">
        Need help? <Link href="/support" className="text-primary hover:underline">Contact Support</Link>
      </div>
    </div>
  );
}
