'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFeaturesOpen, setIsMobileFeaturesOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [hash, setHash] = useState('');
  const pathname = usePathname();

  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setScrolled(false);
    setIsMobileMenuOpen(false);
    setIsMobileFeaturesOpen(false);
    setIsFeaturesOpen(false);
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

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    handleHashChange(); // Check initially
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsMobileFeaturesOpen(false);
    setIsFeaturesOpen(false);
  };

  const getLinkClass = (path: string) => {
    const isActive = path === '/#pricing'
      ? (pathname === '/' && hash === '#pricing')
      : (pathname === path);

    return `transition-all duration-300 relative py-1 ${
      isActive 
        ? 'text-[#ffe2ab] font-bold drop-shadow-[0_0_8px_rgba(255,226,171,0.4)]' 
        : 'text-on-surface-variant/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
    }`;
  };

  const openDropdown = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsFeaturesOpen(true);
  };

  const closeDropdown = () => {
    leaveTimer.current = setTimeout(() => {
      setIsFeaturesOpen(false);
    }, 150);
  };

  const features = [
    {
      title: 'Intelligent POS',
      description: 'Fluid table management, dynamic coursing, and split-second transaction processing.',
      icon: 'point_of_sale',
      link: '/pos',
    },
    {
      title: 'Kitchen Display',
      description: 'High-contrast, color-coded ticketing. Prioritize firing times for perfect plating.',
      icon: 'kitchen',
      link: '/kds',
    },
    {
      title: 'Guest Profiles',
      description: 'Anticipate needs. Track preferences, allergies, and milestones for custom hospitality.',
      icon: 'diamond',
      link: '/login',
    },
    {
      title: 'Global Concierge',
      description: '24/7 white-glove technical support. We handle the system so you can run the service.',
      icon: 'support_agent',
      link: '/support',
    },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled || isMobileMenuOpen || isFeaturesOpen
          ? 'bg-[#0e0e0e]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl' 
          : 'bg-transparent backdrop-blur-sm'
      }`}
      id="main-nav"
    >
      <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-7xl mx-auto w-full relative">
        {/* Left Side: Brand Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="font-display-lg text-xl md:text-2xl text-primary font-bold tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap">
            DinePOS AI
          </Link>
        </div>
        
        {/* Center: Navigation Links */}
        <div className="hidden md:flex justify-center items-center gap-8 font-title-md text-sm font-medium">
          <div className="relative" onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
            <Link 
              href="/#solutions" 
              className={`${getLinkClass('/#solutions')} ${
                isFeaturesOpen ? 'text-[#ffe2ab] font-bold drop-shadow-[0_0_8px_rgba(255,226,171,0.4)]' : ''
              } flex items-center gap-0.5 py-2`}
            >
              <span>Features</span>
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isFeaturesOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant/60'}`}>
                keyboard_arrow_down
              </span>
            </Link>
          </div>
          <Link 
            href="/partners" 
            className={getLinkClass('/partners')}
            onMouseEnter={() => setIsFeaturesOpen(false)}
          >
            Partners
          </Link>
          <Link 
            href="/#pricing" 
            className={getLinkClass('/#pricing')}
            onMouseEnter={() => setIsFeaturesOpen(false)}
          >
            Pricing
          </Link>
          <Link 
            href="/support" 
            className={getLinkClass('/support')}
            onMouseEnter={() => setIsFeaturesOpen(false)}
          >
            Support
          </Link>
        </div>
        
        {/* Right Side: Desktop Actions / Mobile Toggle Button */}
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/login" 
              className={`font-title-md text-sm transition-colors duration-300 ${getLinkClass('/login')}`}
              onMouseEnter={() => setIsFeaturesOpen(false)}
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] font-title-md font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(255,226,171,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
              onMouseEnter={() => setIsFeaturesOpen(false)}
            >
              Get Started
            </Link>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary p-2 focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="material-symbols-outlined text-2xl transition-transform duration-300 select-none">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mega Menu Dropdown */}
        {isFeaturesOpen && (
          <div 
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
            className="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 w-[880px] max-w-[calc(100vw-2rem)] bg-[#0e0e0e]/95 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_50px_rgba(255,226,171,0.02)] transition-all duration-300 ease-out animate-slide-in z-50"
          >
            <div className="grid grid-cols-12 gap-6">
              {/* 2x2 Features Grid */}
              <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((item) => (
                  <Link
                    key={item.title}
                    href={item.link}
                    onClick={handleLinkClick}
                    className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-300 group/item"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-colors group-hover/item:border-primary/30 group-hover/item:bg-primary/5">
                      <span className="material-symbols-outlined text-primary text-xl transition-transform group-hover/item:scale-110">
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm tracking-wide flex items-center gap-1 group-hover/item:text-primary transition-colors">
                        {item.title}
                        <span className="material-symbols-outlined text-xs opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all">
                          arrow_forward
                        </span>
                      </h4>
                      <p className="text-on-surface-variant/80 text-xs mt-1 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Highlights / Promo Card */}
              <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#1c1b1b]/80 to-[#0e0e0e]/95 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group/promo">
                {/* Glow effect */}
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover/promo:bg-primary/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <span className="bg-primary/10 text-primary text-[10px] tracking-widest font-bold uppercase px-2 py-0.5 rounded">
                    Featured
                  </span>
                  <h4 className="text-white font-semibold text-base mt-3">DinePOS OS v2.0</h4>
                  <p className="text-on-surface-variant/70 text-xs mt-1 leading-relaxed font-light font-sans">
                    Experience the new standard in hospitality with smart table allocation and predictive inventory forecasting.
                  </p>
                </div>

                <Link
                  href="/register"
                  onClick={handleLinkClick}
                  className="relative z-10 mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] text-xs font-bold py-2.5 px-4 rounded-xl hover:shadow-[0_0_15px_rgba(255,226,171,0.3)] transition-all duration-300"
                >
                  Book a Live Demo
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 top-20 z-40 bg-[#0e0e0e]/98 backdrop-blur-3xl flex flex-col px-6 py-8 border-t border-white/5 animate-fade-in overflow-y-auto">
          <div className="flex flex-col gap-5 font-title-md text-base text-on-surface-variant font-medium">
            {/* Features accordion on mobile */}
            <div className="border-b border-white/5 pb-4">
              <button 
                onClick={() => setIsMobileFeaturesOpen(!isMobileFeaturesOpen)}
                className="w-full flex items-center justify-between transition-colors duration-300 hover:text-white text-on-surface-variant font-medium py-1"
              >
                <span>Features</span>
                <span className={`material-symbols-outlined text-base transition-transform duration-300 ${isMobileFeaturesOpen ? 'rotate-180 text-primary' : 'opacity-50'}`}>
                  keyboard_arrow_down
                </span>
              </button>
              {isMobileFeaturesOpen && (
                <div className="mt-4 pl-3 flex flex-col gap-5 animate-slide-in">
                  <Link 
                    href="/pos" 
                    onClick={handleLinkClick}
                    className="flex items-center gap-3.5 text-sm text-on-surface-variant/80 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-primary text-xl">point_of_sale</span>
                    <div>
                      <div className="font-semibold text-white">Intelligent POS</div>
                      <div className="text-[11px] text-on-surface-variant/60 font-light mt-0.5">Fluid table management & payments</div>
                    </div>
                  </Link>
                  <Link 
                    href="/kds" 
                    onClick={handleLinkClick}
                    className="flex items-center gap-3.5 text-sm text-on-surface-variant/80 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-primary text-xl">kitchen</span>
                    <div>
                      <div className="font-semibold text-white">Kitchen Display</div>
                      <div className="text-[11px] text-on-surface-variant/60 font-light mt-0.5">Prioritized ticket firing times</div>
                    </div>
                  </Link>
                  <Link 
                    href="/login" 
                    onClick={handleLinkClick}
                    className="flex items-center gap-3.5 text-sm text-on-surface-variant/80 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-primary text-xl">diamond</span>
                    <div>
                      <div className="font-semibold text-white">Guest Profiles</div>
                      <div className="text-[11px] text-on-surface-variant/60 font-light mt-0.5">VIP preferences & allergies</div>
                    </div>
                  </Link>
                  <Link 
                    href="/support" 
                    onClick={handleLinkClick}
                    className="flex items-center gap-3.5 text-sm text-on-surface-variant/80 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
                    <div>
                      <div className="font-semibold text-white">Global Concierge</div>
                      <div className="text-[11px] text-on-surface-variant/60 font-light mt-0.5">24/7 white-glove technical support</div>
                    </div>
                  </Link>
                  <Link 
                    href="/#solutions" 
                    onClick={handleLinkClick}
                    className="text-xs text-primary font-bold tracking-wider uppercase flex items-center gap-1 mt-1 pl-1"
                  >
                    View All Solutions
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/partners" 
              onClick={handleLinkClick}
              className={`pb-4 border-b border-white/5 flex items-center justify-between transition-colors duration-300 hover:text-white ${
                pathname === '/partners' ? 'text-[#ffe2ab] font-bold drop-shadow-[0_0_8px_rgba(255,226,171,0.3)]' : ''
              }`}
            >
              <span>Partners</span>
              <span className="material-symbols-outlined text-sm opacity-50">arrow_forward_ios</span>
            </Link>
            <Link 
              href="/#pricing" 
              onClick={handleLinkClick}
              className={`pb-4 border-b border-white/5 flex items-center justify-between transition-colors duration-300 hover:text-white ${
                pathname === '/' && hash === '#pricing' ? 'text-[#ffe2ab] font-bold drop-shadow-[0_0_8px_rgba(255,226,171,0.3)]' : ''
              }`}
            >
              <span>Pricing</span>
              <span className="material-symbols-outlined text-sm opacity-50">arrow_forward_ios</span>
            </Link>
            <Link 
              href="/support" 
              onClick={handleLinkClick}
              className={`pb-4 border-b border-white/5 flex items-center justify-between transition-colors duration-300 hover:text-white ${
                pathname === '/support' ? 'text-[#ffe2ab] font-bold drop-shadow-[0_0_8px_rgba(255,226,171,0.3)]' : ''
              }`}
            >
              <span>Contact Support</span>
              <span className="material-symbols-outlined text-sm opacity-50">arrow_forward_ios</span>
            </Link>
          </div>
          
          <div className="mt-auto pt-8 flex flex-col gap-4">
            <Link 
              href="/login" 
              onClick={handleLinkClick}
              className="w-full text-center py-3.5 rounded-xl border border-white/10 text-white font-title-md font-semibold text-sm hover:bg-white/5 transition-all duration-300"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              onClick={handleLinkClick}
              className="w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] font-title-md font-bold text-sm shadow-lg hover:opacity-90 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
