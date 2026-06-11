'use client';

import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

const testimonials = [
  {
    quote: "The precision of DinePOS AI is unmatched. It operates quietly in the background, handling complex pacing and modifiers, allowing our sommeliers and servers to focus entirely on the choreography of the dining experience.",
    author: "Julian Rossi",
    role: "General Manager, L'Aura",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA_tr72qxwryiHrap9NizCYdmdT52uUIq0_1k1RU99eytvG8QoC_kdRpDVU1GwA6oxikSwZbJ82mfyykJdg9czijrb93Rz0_BE_8xHPbnqVPPYkP2vec8cEZhWes7_ZhtTOsMYq6yZnE4NYIc5567rAQ5nfaGyaQMZehPd2vMhepiMt4zDM4M0m3o2BdvH4LVPmvMAuMiU1Jw42sM2HTrIbh_EK1GZyLjQmhCuqOcdreyhu9jgpQdIZz9JA0xKgH9c0vL3xIVRRK7m"
  },
  {
    quote: "KDS integration completely transformed our kitchen flow. Course-based firing and automatic allergy alerts mean we execute flawless services every single night. It is an indispensable culinary tool.",
    author: "Chef Antoine Laurent",
    role: "Executive Chef, Le Céleste",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi"
  },
  {
    quote: "With unified analytics across our multi-unit portfolio, we optimized table turns by 18% and improved server tip averages. The platform paid for itself within the first month.",
    author: "Sophia Vance",
    role: "Director of Operations, The Gilded Group",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA_tr72qxwryiHrap9NizCYdmdT52uUIq0_1k1RU99eytvG8QoC_kdRpDVU1GwA6oxikSwZbJ82mfyykJdg9czijrb93Rz0_BE_8xHPbnqVPPYkP2vec8cEZhWes7_ZhtTOsMYq6yZnE4NYIc5567rAQ5nfaGyaQMZehPd2vMhepiMt4zDM4M0m3o2BdvH4LVPmvMAuMiU1Jw42sM2HTrIbh_EK1GZyLjQmhCuqOcdreyhu9jgpQdIZz9JA0xKgH9c0vL3xIVRRK7m"
  }
];

export default function HomePage() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);

  return (
    <div className="bg-surface-container-lowest text-on-surface flex flex-col antialiased overflow-x-hidden pt-24">
      <TopNavBar />
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center pt-28 pb-12 overflow-hidden bg-[#0a0a0a]">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Luxury restaurant dark mood lighting" 
            className="w-full h-full object-cover opacity-20 filter blur-sm scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {/* Central Radial Gradient to focus the text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,226,171,0.08)_0%,_rgba(10,10,10,0.95)_60%)]"></div>
          {/* Subtle bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-margin-desktop flex flex-col items-center text-center">
          {/* Premium Launch Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center px-5 py-2 rounded-full border border-[#ffe2ab]/30 bg-[#ffe2ab]/5 font-label-sm text-xs text-[#ffe2ab] uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(255,226,171,0.1)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#ffe2ab] mr-3 animate-pulse shadow-[0_0_8px_#ffe2ab]"></span>
              Introducing DinePOS AI System
            </span>
          </div>
          
          <h1 className="font-display-lg text-6xl md:text-[5.5rem] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-6 max-w-5xl leading-[1.1] tracking-tight drop-shadow-sm">
            The Art of Modern{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe2ab] via-[#ffd380] to-[#cc9d31] italic pr-2 drop-shadow-[0_0_20px_rgba(255,226,171,0.2)]">Hospitality</span>
          </h1>
          
          <p className="font-body-md text-[#d4c5ab]/90 max-w-2xl mx-auto mb-12 text-xl md:text-2xl leading-relaxed font-light drop-shadow-sm">
            Precision tools crafted for high-end culinary environments. Blend the tactile elegance of fine dining with the raw power of modern fintech.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
            {/* Primary Glow Button */}
            <Link href="/register" className="group relative bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] font-title-md font-bold text-base px-9 py-4 rounded-full transition-all duration-500 transform hover:-translate-y-1 flex items-center gap-2 overflow-hidden shadow-[0_10px_30px_rgba(255,226,171,0.25)] hover:shadow-[0_15px_40px_rgba(255,226,171,0.4)]">
              <span className="relative z-10 flex items-center gap-2">Request a Demo <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span></span>
              {/* Shine effect */}
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
            </Link>
            
            {/* Secondary Glass Button */}
            <Link href="/solutions" className="group border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md font-title-md font-semibold text-white px-9 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Explore Solutions
            </Link>
          </div>
        </div>
      </header>

      {/* Integrated Solutions (Bento Grid) */}
      <section className="py-xl relative z-10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="mb-lg text-center md:text-left">
            <h2 className="font-headline-lg text-4xl text-on-surface mb-xs font-semibold">Integrated Solutions</h2>
            <p className="font-body-md text-on-surface-variant">Seamless synchronization from front-of-house to the pass.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg auto-rows-[minmax(320px,_auto)]">
            
            {/* POS Card (Large) */}
            <div className="lg:col-span-8 bg-gradient-to-br from-[#1c1b1b]/80 to-[#0e0e0e]/90 backdrop-blur-3xl rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/5 shadow-2xl transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 flex flex-col justify-between">
              {/* Decorative Glow */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-1000"></div>
              
              <div className="absolute right-[-5%] top-[10%] w-[60%] h-[90%] opacity-40 transform group-hover:scale-105 group-hover:-translate-x-4 transition-all duration-1000 pointer-events-none">
                <img 
                  alt="Sleek point of sale tablet mock" 
                  className="w-full h-full object-contain filter drop-shadow-2xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_9hW0-Bn5U_Gzfsc5vJk-zOi7qxniua5UktAA96RYKvjwM9qig_LtKHUoXbIY_NdBJ4U9IgjA0RVHzPrNnIYmAaC6q60uAHS_EfbpoxYAge_XxziJs8r8LTcCK24PNHyF3lSI_6WcA7un9-7lx7SueI-rmj7zlNv2UoFyaEwIkTNVBC_O_dFSQQLXsf6MVKKgU6Frp6huK88BJdQd0WU-N9OBozDLtkYvAbeKAGsA6wWv5Cm1oSt9Zk9dnUW-5oBfDgRaorImwhnd" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="relative z-10 w-full md:w-1/2 flex flex-col h-full justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-md backdrop-blur-md">
                    <span className="material-symbols-outlined text-primary text-2xl">point_of_sale</span>
                  </div>
                  <h3 className="font-display-lg text-4xl text-on-surface mb-sm font-semibold tracking-tight">Intelligent POS</h3>
                  <p className="font-body-md text-on-surface-variant/80 text-lg leading-relaxed font-light">
                    Fluid table management, dynamic coursing, and split-second transaction processing designed for the pace of a busy dining room.
                  </p>
                </div>
                <Link className="font-label-sm text-primary uppercase tracking-[0.15em] mt-12 inline-flex items-center gap-2 hover:text-primary-fixed transition-colors group/link w-fit" href="/pos">
                  Discover POS <span className="material-symbols-outlined text-sm transform group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* KDS Card (Small) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#1c1b1b]/80 to-[#0e0e0e]/90 backdrop-blur-3xl rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/5 shadow-2xl transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-md backdrop-blur-md">
                  <span className="material-symbols-outlined text-primary text-xl">kitchen</span>
                </div>
                <h3 className="font-display-lg text-3xl text-on-surface mb-xs font-semibold tracking-tight">Kitchen Display</h3>
                <p className="font-body-md text-on-surface-variant/80 text-base leading-relaxed font-light">
                  High-contrast, color-coded ticketing. Prioritize firing times to ensure perfect plating synchronicity.
                </p>
              </div>
              {/* Mock KDS Ticket */}
              <div className="mt-12 bg-[#1a1a1a] p-4 border-l-4 border-primary rounded-xl shadow-2xl transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-xl pointer-events-none"></div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-label-sm text-on-surface font-semibold tracking-wider uppercase text-xs">Table 42</span>
                  <span className="font-kds-timer text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-sm">12:45</span>
                </div>
                <div className="font-body-md text-on-surface-variant text-sm space-y-1.5">
                  <div className="flex items-start gap-2"><span className="text-on-surface font-medium">2x</span> Wagyu Ribeye</div>
                  <div className="flex items-start gap-2 text-on-surface-variant/70"><span className="text-on-surface font-medium">1x</span> Scallop Crudo</div>
                </div>
              </div>
            </div>

            {/* Concierge Card (Medium) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#1c1b1b]/80 to-[#0e0e0e]/90 backdrop-blur-3xl rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/5 shadow-2xl transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 flex flex-col justify-between">
              {/* Decorative Tech Rings */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-primary/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 flex items-center justify-center">
                <div className="w-48 h-48 border border-primary/10 rounded-full"></div>
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-md backdrop-blur-md">
                  <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
                </div>
                <h3 className="font-display-lg text-3xl text-on-surface mb-xs font-semibold tracking-tight">Global Concierge</h3>
                <p className="font-body-md text-on-surface-variant/80 text-base leading-relaxed font-light">
                  24/7 white-glove technical support. We handle the system so you can focus on the service.
                </p>
              </div>
              <Link className="font-label-sm text-primary uppercase tracking-[0.15em] mt-12 inline-flex items-center gap-2 hover:text-primary-fixed transition-colors group/link w-fit relative z-10" href="/support">
                Get Support <span className="material-symbols-outlined text-sm transform group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {/* Guest Management Card (Large) */}
            <div className="lg:col-span-8 bg-gradient-to-br from-[#1c1b1b]/80 to-[#0e0e0e]/90 backdrop-blur-3xl rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/5 shadow-2xl transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 flex flex-col justify-between">
              <div className="relative z-10 w-full md:w-3/5 flex flex-col h-full justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-md backdrop-blur-md">
                    <span className="material-symbols-outlined text-primary text-2xl">diamond</span>
                  </div>
                  <h3 className="font-display-lg text-4xl text-on-surface mb-sm font-semibold tracking-tight">Guest Profiles</h3>
                  <p className="font-body-md text-on-surface-variant/80 text-lg leading-relaxed font-light mb-sm">
                    Anticipate needs before they arrive. Track preferences, allergies, and milestone dates to deliver a truly personalized concierge experience.
                  </p>
                </div>
                <Link className="font-label-sm text-primary uppercase tracking-[0.15em] mt-12 inline-flex items-center gap-2 hover:text-primary-fixed transition-colors group/link w-fit" href="/login">
                  Manage Guests <span className="material-symbols-outlined text-sm transform group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full hidden md:flex items-end justify-end opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none overflow-hidden rounded-br-3xl">
                {/* Abstract Pattern / Mock UI Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent"></div>
                <div className="absolute right-8 bottom-8 bg-[#252525] border border-white/10 p-5 rounded-2xl shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-700 w-72 backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ffe2ab] to-[#cc9d31] shadow-[0_0_15px_rgba(255,226,171,0.5)]"></div>
                    <div>
                      <div className="text-base font-semibold text-white tracking-wide">VIP Guest</div>
                      <div className="text-xs text-[#ffe2ab] uppercase tracking-widest mt-1">Table 4 • Anniversary</div>
                    </div>
                  </div>
                  <div className="text-sm text-[#d4c5ab]/80 space-y-3">
                    <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                      <span className="uppercase tracking-wider text-[10px] font-bold">Prefers</span>
                      <span className="text-white font-medium">Window Seat</span>
                    </div>
                    <div className="flex justify-between items-center bg-error/10 px-3 py-2 rounded-lg">
                      <span className="uppercase tracking-wider text-[10px] font-bold text-error">Allergy</span>
                      <span className="text-error font-medium">Shellfish</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-xl bg-[#0a0a09] relative z-10 overflow-hidden" id="pricing">
        {/* Soft elegant glow backgrounds behind cards */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,226,171,0.02)_0%,transparent_70%)] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,197,61,0.015)_0%,transparent_70%)] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-margin-desktop relative z-20">
          {/* Header */}
          <div className="text-center mb-xl">
            <span className="inline-block border border-primary/20 rounded-full px-4 py-1.5 font-label-sm text-primary text-[10px] uppercase tracking-[0.22em] bg-primary/5 mb-md">
              Subscription Tiers
            </span>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-white mb-xs font-semibold">
              Simple, Transparent Pricing
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto text-sm leading-relaxed">
              Choose the plan that best fits your establishment's scale, transaction volume, and operational ambition.
            </p>
          </div>

          {/* Interactive Billing Cycle Toggle Switch */}
          <div className="flex justify-center mb-16 select-none relative z-20">
            <div className="inline-flex items-center bg-white/[0.02] border border-white/[0.08] p-1 rounded-full relative">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'text-[#2c1a00] bg-[#ffe2ab] shadow-lg'
                    : 'text-[#A69984]/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`relative px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'text-[#2c1a00] bg-[#ffe2ab] shadow-lg'
                    : 'text-[#A69984]/60 hover:text-white'
                }`}
              >
                Annually
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                  billingCycle === 'annual'
                    ? 'bg-[#2c1a00]/15 text-[#2c1a00]'
                    : 'bg-[#ffe2ab]/10 text-[#ffe2ab]'
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl lg:gap-md items-stretch pt-4">
            
            {/* Starter Card */}
            <div className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-2xl p-8 sm:p-9 flex flex-col justify-between h-full border border-white/[0.06] group hover:border-[#ffe2ab]/25 hover:shadow-[0_20px_50px_rgba(255,226,171,0.04)] hover:-translate-y-1 transition-all duration-500">
              <div>
                <div className="mb-8">
                  <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1.5 block">Starter Package</span>
                  <h3 className="font-serif text-3xl text-white font-medium italic mb-4">Starter</h3>
                  <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed mb-6 min-h-[40px]">Perfect for independent bistros getting off the ground with reliable limits.</p>
                  
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-sm font-sans font-bold text-[#A69984]/80 align-super -mt-2">$</span>
                    <span className="text-5xl font-serif text-white font-semibold tracking-tight transition-all duration-300">
                      {billingCycle === 'monthly' ? '149' : '119'}
                    </span>
                    <span className="text-xs font-sans text-[#A69984]/50 uppercase tracking-widest ml-1">/ Month</span>
                  </div>
                  <div className="text-[10px] text-[#A69984]/45 font-sans mt-2 font-medium">
                    {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually ($1,428/yr)'}
                  </div>
                </div>

                <div className="h-px bg-white/5 my-6"></div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>500 order allowance included</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Standard Overage: $0.20/order</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Standard Webhook pipelines</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/35 font-sans text-xs leading-relaxed line-through decoration-white/10 select-none">
                    <span className="material-symbols-outlined text-white/10 text-[18px] flex-shrink-0 mt-0.5">remove_circle_outline</span>
                    <span>Dedicated Account Manager</span>
                  </li>
                </ul>
              </div>
              
              <Link href="/register" className="w-full text-center border border-white/10 hover:border-[#ffe2ab]/50 text-[#ffe2ab] font-sans font-semibold tracking-wider text-xs uppercase py-3.5 rounded-xl hover:bg-white/[0.03] transition-all duration-300 block">Choose Starter</Link>
            </div>

            {/* Growth Card (Popular Choice) */}
            <div className="bg-gradient-to-b from-[#181613] to-[#0e0e0d] rounded-2xl p-8 sm:p-9 flex flex-col justify-between h-full border border-[#ffe2ab]/40 relative group hover:border-[#ffe2ab] hover:shadow-[0_25px_60px_rgba(255,226,171,0.08)] hover:-translate-y-1.5 transition-all duration-500 lg:scale-[1.03] z-10 shadow-2xl">
              {/* Popular choice badge with elegant gold gradient */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#cc9d31] to-[#ffe2ab] text-[#2c1a00] font-sans text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(255,226,171,0.25)] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">local_fire_department</span> Popular Choice
              </div>
              
              <div>
                <div className="mb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-sans text-[9px] text-[#ffe2ab] font-bold uppercase tracking-[0.2em] mb-1.5 block">Growth Package</span>
                      <h3 className="font-serif text-3xl text-white font-medium italic mb-4">Growth</h3>
                    </div>
                    <span className="material-symbols-outlined text-[#ffe2ab] text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">rocket_launch</span>
                  </div>
                  <p className="font-sans text-xs text-[#A69984]/80 leading-relaxed mb-6 min-h-[40px]">Designed for expanding merchants demanding dynamic scaling pipelines.</p>
                  
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-sm font-sans font-bold text-[#ffe2ab] align-super -mt-2">$</span>
                    <span className="text-5xl font-serif text-[#ffe2ab] font-bold tracking-tight transition-all duration-300">
                      {billingCycle === 'monthly' ? '399' : '319'}
                    </span>
                    <span className="text-xs font-sans text-[#ffe2ab]/75 uppercase tracking-widest ml-1">/ Month</span>
                  </div>
                  <div className="text-[10px] text-[#ffe2ab]/50 font-sans mt-2 font-medium">
                    {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually ($3,828/yr)'}
                  </div>
                </div>

                <div className="h-px bg-white/5 my-6"></div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-white font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab] text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span className="font-semibold">2,500 order allowance included</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab] text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Optimized Overage: $0.15/order</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab] text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>High-performance endpoints</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab] text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Priority 24/7 Support</span>
                  </li>
                </ul>
              </div>
              
              <Link href="/register" className="w-full text-center bg-[#ffe2ab] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold tracking-wider text-xs uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,191,0,0.15)] hover:shadow-[0_4px_25px_rgba(255,191,0,0.25)] hover:scale-[1.01] block">Choose Growth</Link>
            </div>

            {/* Premium Card */}
            <div className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-2xl p-8 sm:p-9 flex flex-col justify-between h-full border border-white/[0.06] group hover:border-[#ffe2ab]/25 hover:shadow-[0_20px_50px_rgba(255,226,171,0.04)] hover:-translate-y-1 transition-all duration-500">
              <div>
                <div className="mb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1.5 block">Premium Package</span>
                      <h3 className="font-serif text-3xl text-white font-medium italic mb-4">Premium</h3>
                    </div>
                    <span className="material-symbols-outlined text-[#ffe2ab] text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">diamond</span>
                  </div>
                  <p className="font-sans text-xs text-[#A69984]/70 leading-relaxed mb-6 min-h-[40px]">Ultimate package tailored for large operations seeking rock-bottom rates.</p>
                  
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-sm font-sans font-bold text-[#A69984]/80 align-super -mt-2">$</span>
                    <span className="text-5xl font-serif text-white font-semibold tracking-tight transition-all duration-300">
                      {billingCycle === 'monthly' ? '899' : '719'}
                    </span>
                    <span className="text-xs font-sans text-[#A69984]/50 uppercase tracking-widest ml-1">/ Month</span>
                  </div>
                  <div className="text-[10px] text-[#A69984]/45 font-sans mt-2 font-medium">
                    {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually ($8,628/yr)'}
                  </div>
                </div>

                <div className="h-px bg-white/5 my-6"></div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>10,000 order allowance included</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Lowest Overage: $0.10/order</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Enterprise API access keys</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#A69984]/90 font-sans text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffe2ab]/90 text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Dedicated Account Strategy</span>
                  </li>
                </ul>
              </div>
              
              <Link href="/register" className="w-full text-center border border-white/10 hover:border-[#ffe2ab]/50 text-[#ffe2ab] font-sans font-semibold tracking-wider text-xs uppercase py-3.5 rounded-xl hover:bg-white/[0.03] transition-all duration-300 block">Choose Premium</Link>
            </div>

          </div>
        </div>
      </section>

      {/* Ambassador Program Section */}
      <section className="py-24 md:py-32 bg-[#0a0a0a] relative z-10 border-t border-white/[0.03] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(255,226,171,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-margin-desktop relative z-10">

          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-flex items-center px-5 py-2 rounded-full border border-[#ffe2ab]/20 bg-[#ffe2ab]/5 font-label-sm text-xs text-[#ffe2ab] uppercase tracking-[0.25em] mb-8 backdrop-blur-md">
              Ambassador Network
            </span>
            <h2 className="font-display-lg text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-6 font-semibold tracking-tight">
              Earn While You Introduce
            </h2>
            <p className="font-body-md text-[#d4c5ab]/80 max-w-2xl mx-auto text-lg leading-relaxed font-light">
              Refer restaurants to DinePOS AI and earn premium cash rewards for every onboarded location. Our ambassador network is growing globally.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-20">
            {[
              { value: '$150', label: 'Reward per signup', icon: 'payments' },
              { value: '10%', label: 'Commission on first payment', icon: 'percent' },
              { value: '$0', label: 'Cost to join the program', icon: 'loyalty' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 text-center border border-white/[0.05] group hover:-translate-y-1 hover:bg-white/[0.04] transition-all duration-500 shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[#ffe2ab] text-3xl group-hover:drop-shadow-[0_0_10px_rgba(255,226,171,0.5)] transition-all duration-500">{stat.icon}</span>
                </div>
                <div className="font-display-lg text-4xl text-white font-bold mb-3 tracking-tight">{stat.value}</div>
                <div className="font-sans text-[#A69984]/70 text-xs uppercase tracking-[0.15em] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* How it works — 3 steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
            {[
              {
                step: '01',
                icon: 'share',
                color: 'text-[#ffe2ab]',
                bg: 'bg-[#ffe2ab]/10 border-[#ffe2ab]/20 shadow-[0_0_20px_rgba(255,226,171,0.1)]',
                title: 'Register & Get Your Code',
                body: 'Sign up as a DinePOS ambassador in under 2 minutes. You\'ll receive a unique referral code and link to share with your culinary network.',
              },
              {
                step: '02',
                icon: 'storefront',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]',
                title: 'Restaurants Sign Up',
                body: 'When a venue registers using your code, they\'re instantly tracked on your ambassador dashboard — showing status, services activated, and accrued rewards.',
              },
              {
                step: '03',
                icon: 'account_balance',
                color: 'text-[#cc9d31]',
                bg: 'bg-[#cc9d31]/10 border-[#cc9d31]/20 shadow-[0_0_20px_rgba(204,157,49,0.1)]',
                title: 'Collect Your Earnings',
                body: 'Earnings are credited per onboarded location and paid directly to your bank account by the platform admin once you reach the minimum threshold.',
              },
            ].map((step, idx) => (
              <div key={step.step} className="bg-gradient-to-br from-[#1c1b1b]/60 to-[#0e0e0e]/80 backdrop-blur-2xl rounded-3xl p-8 md:p-10 flex flex-col gap-6 border border-white/[0.04] group hover:-translate-y-1 hover:border-white/10 transition-all duration-500 relative overflow-hidden shadow-2xl">
                {/* Large Background Number */}
                <div className="absolute -top-6 -right-6 font-display-lg text-[10rem] text-white/[0.02] font-bold leading-none select-none group-hover:text-white/[0.04] transition-colors duration-500">{step.step}</div>
                
                <div className={`w-14 h-14 rounded-2xl ${step.bg} border flex items-center justify-center backdrop-blur-md relative z-10`}>
                  <span className={`material-symbols-outlined text-2xl ${step.color}`}>{step.icon}</span>
                </div>
                <div className="relative z-10">
                  <h3 className="font-display-lg text-2xl text-white font-semibold mb-4">{step.title}</h3>
                  <p className="font-body-md text-[#d4c5ab]/70 text-base leading-relaxed font-light">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
            <Link
              href="/partners"
              className="group relative bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] font-title-md font-bold text-base px-9 py-4 rounded-full transition-all duration-500 transform hover:-translate-y-1 flex items-center gap-2 overflow-hidden shadow-[0_10px_30px_rgba(255,226,171,0.25)] hover:shadow-[0_15px_40px_rgba(255,226,171,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">Join the Ambassador Program <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span></span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
            </Link>
            <Link
              href="/partners/login"
              className="group border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md font-title-md font-semibold text-white px-9 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              Ambassador Login
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-[#0e0e0d] relative z-10 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="flex flex-col lg:flex-row gap-xl items-center">
            
            {/* Title / Controls Column */}
            <div className="w-full lg:w-1/3 space-y-6">
              <span className="inline-block border border-primary/20 rounded-full px-4 py-1.5 font-label-sm text-primary text-[10px] uppercase tracking-[0.22em] bg-primary/5 select-none">
                Michelin-Grade Partners
              </span>
              <h2 className="font-headline-lg text-4xl text-white font-semibold leading-tight">
                Trusted by the Elite
              </h2>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed max-w-sm">
                See how top-tier establishments are redefining culinary service and front-of-house flow with DinePOS AI.
              </p>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  aria-label="Previous testimonial"
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-[#ffe2ab] hover:text-[#2c1a00] hover:border-[#ffe2ab] transition-all duration-300 cursor-pointer shadow-md focus:outline-none"
                >
                  <span className="material-symbols-outlined text-lg leading-none">arrow_back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  aria-label="Next testimonial"
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-[#ffe2ab] hover:text-[#2c1a00] hover:border-[#ffe2ab] transition-all duration-300 cursor-pointer shadow-md focus:outline-none"
                >
                  <span className="material-symbols-outlined text-lg leading-none">arrow_forward</span>
                </button>
              </div>
            </div>
            
            {/* Slider Card Column */}
            <div className="w-full lg:w-2/3">
              <div className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-3xl p-8 md:p-12 border border-white/[0.06] shadow-[0_12px_45px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden transition-all duration-500 min-h-[320px] flex flex-col justify-between group">
                {/* Background double quote icon watermark */}
                <span className="material-symbols-outlined absolute -top-6 -right-6 text-[10rem] text-white/[0.02] font-light leading-none pointer-events-none select-none">
                  format_quote
                </span>
                
                <p className="font-serif text-lg md:text-2xl text-[#d4c5ab]/90 leading-relaxed mb-8 italic select-text transition-all duration-300">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                
                <div className="flex items-center justify-between gap-4 mt-auto border-t border-white/5 pt-6">
                  <div className="flex items-center gap-4">
                    <img 
                      alt={testimonials[activeTestimonial].author} 
                      className="w-12 h-12 rounded-full object-cover grayscale opacity-90 border border-[#ffe2ab]/30" 
                      src={testimonials[activeTestimonial].image} 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <div className="font-title-md text-white text-base font-semibold">{testimonials[activeTestimonial].author}</div>
                      <div className="font-label-sm text-[#ffe2ab] text-[10px] uppercase font-bold tracking-widest mt-0.5">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                  
                  {/* Slider dots for current testimonial */}
                  <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestimonial(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === activeTestimonial ? 'bg-[#ffe2ab] w-6' : 'bg-white/10 hover:bg-white/30'
                        }`}
                        aria-label={`Go to testimonial ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-[#0a0a09] relative z-10 border-t border-white/[0.06] overflow-hidden">
        {/* Soft centered glow to focus layout */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(255,226,171,0.035)_0%,transparent_70%)] rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-margin-desktop text-center relative z-20">
          <h2 className="font-display-lg text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-4 font-semibold tracking-tight drop-shadow-sm">
            The Future of Hospitality is Here.
          </h2>
          <p className="font-body-md text-[#d4c5ab]/80 mb-10 text-lg md:text-xl font-light">
            Join the world's most discerning culinary institutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
            {/* Primary Gold CTA */}
            <Link 
              href="/register" 
              className="group relative bg-gradient-to-r from-[#ffe2ab] to-[#cc9d31] text-[#261a00] font-sans font-bold text-xs uppercase tracking-widest px-9 py-4 rounded-full transition-all duration-500 transform hover:-translate-y-1 flex items-center gap-2 overflow-hidden shadow-[0_10px_30px_rgba(255,226,171,0.25)] hover:shadow-[0_15px_40px_rgba(255,226,171,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Request a Demo 
                <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
            </Link>
            
            {/* Secondary Glass CTA */}
            <Link 
              href="/#pricing" 
              className="group border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md font-sans font-semibold text-white text-xs uppercase tracking-widest px-9 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-lg gap-gutter max-w-7xl mx-auto">
          <div className="font-display-lg text-display-lg text-primary opacity-80 hover:opacity-100 transition-opacity font-bold">DinePOS AI</div>
          <div className="flex flex-wrap justify-center gap-md font-label-sm text-on-surface-variant text-xs font-medium">
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/terms">Terms of Service</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/support">Contact Support</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/experience">Experience</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/solutions">Solutions</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/partners">Ambassador Program</Link>
          </div>
          <div className="text-on-surface-variant font-label-sm text-xs opacity-60">
            © 2026 DinePOS AI Hospitality Systems. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
