'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md transition-all duration-300" 
      id="main-nav"
      style={{
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
        backgroundColor: scrolled ? 'rgba(19, 19, 19, 0.95)' : 'rgba(19, 19, 19, 0.8)'
      }}
    >
      <div className="flex justify-between items-center px-margin-desktop py-sm max-w-7xl mx-auto">
        <Link href="/" className="font-display-lg text-3xl md:text-4xl text-primary font-bold">
          DinePOS AI
        </Link>
        
        <div className="hidden md:flex items-center gap-lg font-title-md text-on-surface-variant font-medium">
          <Link 
            href="/experience" 
            className="transition-all duration-300 hover:text-primary"
          >
            Experience
          </Link>
          <Link 
            href="/solutions" 
            className="transition-all duration-300 hover:text-primary"
          >
            Solutions
          </Link>
          <Link 
            href="/partners" 
            className="transition-all duration-300 hover:text-primary"
          >
            Partners
          </Link>
          <Link 
            href="/#pricing" 
            className="hover:text-primary transition-all duration-300"
          >
            Pricing
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-md">
          <Link href="/login" className="font-title-md text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 active:opacity-80">
            Login
          </Link>
          <Link href="/register" className="bg-primary-container text-on-primary-container font-title-md px-md py-xs rounded hover:bg-primary transition-colors duration-300 scale-95 active:opacity-80">
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
