'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setScrolled(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll(); // Check initially on mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-[#0e0e0e]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl' 
          : 'bg-transparent backdrop-blur-sm'
      }`}
      id="main-nav"
    >
      <div className="flex justify-between items-center px-margin-desktop py-4 max-w-7xl mx-auto">
        <Link href="/" className="font-display-lg text-3xl md:text-4xl text-primary font-bold tracking-tight drop-shadow-md">
          DinePOS AI
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-title-md text-on-surface-variant/80 font-medium text-sm">
          <Link href="/experience" className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            Experience
          </Link>
          <Link href="/solutions" className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            Solutions
          </Link>
          <Link href="/partners" className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            Partners
          </Link>
          <Link href="/#pricing" className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            Pricing
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className="font-title-md text-sm text-on-surface-variant hover:text-white transition-colors duration-300">
            Login
          </Link>
          <Link href="/register" className="bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] font-title-md font-semibold text-sm px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(255,226,171,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </nav>
  );
}
