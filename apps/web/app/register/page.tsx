'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fullName || !email || !restaurantName || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms and Conditions and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    
    // Simulate high-end onboarding process delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0e0e0d] relative overflow-hidden font-sans justify-between">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep warm gold glow emanating from top-right to create asymmetric lighting */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,226,171,0.06)_0%,transparent_70%)] rounded-full blur-[80px]"></div>
        {/* Ambient bottom-left vignette */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,226,171,0.02)_0%,transparent_75%)] rounded-full blur-[100px]"></div>
      </div>
      
      {/* Main Grid Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Side Content - Branding & Ethos */}
        <div className="w-full md:w-1/2 flex flex-col justify-center max-w-lg select-none">
          <div className="mb-4">
            <span className="inline-block border border-[#ffe2ab]/20 rounded-full px-4 py-1.5 text-[#ffe2ab] text-[10px] uppercase font-bold tracking-[0.2em] mb-8 bg-[#ffe2ab]/5">
              CULINARY SYSTEMS
            </span>
          </div>
          <h1 className="font-serif text-[#ffe2ab] text-[48px] md:text-[56px] font-semibold leading-tight tracking-wide mb-6">
            DinePOS AI
          </h1>
          <p className="text-[#A69984] text-sm md:text-base leading-relaxed mb-10 max-w-[430px]">
            Elevate your dining experience with precision tools designed for high-end culinary environments. Join the vanguard of modern hospitality.
          </p>
          
          {/* Aesthetic ethos marker matching mockup */}
          <div className="flex items-center gap-4 mt-8 text-[#A69984]/50">
            <div className="h-[1px] w-8 bg-[#A69984]/30"></div>
            <span className="font-sans text-[10.5px] tracking-[0.15em] uppercase font-medium">
              Sophisticated. Authoritative. Calm.
            </span>
          </div>
        </div>

        {/* Right Side - Onboarding Glass Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end xl:justify-center relative">
          <div className="w-full max-w-[440px] p-8 md:p-10 bg-[#161513]/90 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-white/10 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
            
            {/* Title Block */}
            <div className="mb-8">
              <h2 className="font-serif text-white/95 text-[28px] font-semibold tracking-wide mb-1 leading-tight">
                Create Account
              </h2>
              <p className="text-[#A69984]/80 font-sans text-xs tracking-wide">
                Enter your details to request access.
              </p>
            </div>
            
            {error && (
              <div className="mb-5 p-3 bg-red-950/45 border border-red-500/20 text-red-300 text-xs rounded-md text-center">
                {error}
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name field */}
              <div className="space-y-1.5">
                <label className="block text-[#A69984]/95 font-sans text-xs font-semibold select-none">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                    <span className="material-symbols-outlined text-[19px] leading-none">person</span>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15"
                    placeholder="Chef de Cuisine" 
                  />
                </div>
              </div>
              
              {/* Work Email field */}
              <div className="space-y-1.5">
                <label className="block text-[#A69984]/95 font-sans text-xs font-semibold select-none">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                    <span className="material-symbols-outlined text-[19px] leading-none">mail</span>
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15"
                    placeholder="name@restaurant.com" 
                  />
                </div>
              </div>

              {/* Restaurant Name field */}
              <div className="space-y-1.5">
                <label className="block text-[#A69984]/95 font-sans text-xs font-semibold select-none">
                  Restaurant Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                    <span className="material-symbols-outlined text-[19px] leading-none">storefront</span>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15"
                    placeholder="L'Étoile" 
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-[#A69984]/95 font-sans text-xs font-semibold select-none">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A69984]/40">
                    <span className="material-symbols-outlined text-[19px] leading-none">lock</span>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-[#12110f]/90 border border-white/10 rounded-lg pl-11 pr-11 py-2.5 text-white placeholder-[#A69984]/35 font-sans text-sm focus:border-[#ffe2ab]/40 focus:outline-none transition-all duration-300 hover:border-white/15 ${!showPassword && password ? 'tracking-[0.25em]' : ''}`}
                    placeholder={showPassword ? 'password' : '••••••••'} 
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
              
              {/* Terms Checkbox */}
              <div className="flex items-start pt-2 select-none">
                <label className="relative flex items-start cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="mt-0.5 w-[18px] h-[18px] bg-[#12110f]/90 border border-white/10 rounded flex items-center justify-center transition-all duration-200 peer-checked:bg-[#ffe2ab] peer-checked:border-[#ffe2ab] peer-hover:border-white/20 shrink-0">
                    <span className="material-symbols-outlined text-[10px] text-[#402d00] font-black scale-0 peer-checked:scale-100 transition-transform duration-200 select-none">check</span>
                  </div>
                  <span className="ml-3 text-[#A69984]/85 font-sans text-[11px] leading-relaxed font-medium">
                    I agree to the <Link href="/terms" className="font-bold text-[#ffe2ab] hover:text-[#ffdca0]">Terms and Conditions</Link> and <Link href="/privacy" className="font-bold text-[#ffe2ab] hover:text-[#ffdca0]">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
              
              {/* Submit button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/50 disabled:cursor-not-allowed text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:shadow-[0_4px_24px_rgba(255,226,171,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-[#402d00]/30 border-t-[#402d00] rounded-full animate-spin"></span>
                ) : (
                  <span className="flex items-center gap-2">
                    Request Access <span className="material-symbols-outlined text-sm font-black transition-transform duration-300 group-hover:translate-x-0.5">arrow_forward</span>
                  </span>
                )}
              </button>
            </form>
            
            {/* Redirect to Log In */}
            <div className="mt-8 text-center font-sans text-[12px] text-[#A69984]/80">
              Already have an account? <Link href="/login" className="font-bold text-[#ffe2ab] hover:text-[#ffdca0] ml-1">Log in</Link>
            </div>
          </div>
        </div>

      </div>

      {/* Luxury Minimalist Footer */}
      <footer className="w-full py-6 px-[48px] bg-[#0c0c0b] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#A69984]/45 tracking-wider select-none gap-4">
        <div>© 2024 DinePOS AI. All rights reserved.</div>
        <div className="flex gap-6 font-semibold">
          <Link href="/support" className="hover:text-[#ffe2ab] transition-colors">Help</Link>
          <Link href="/support#contact" className="hover:text-[#ffe2ab] transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
