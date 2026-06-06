import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-surface-container-lowest text-on-surface flex flex-col antialiased overflow-x-hidden pt-24">
      <TopNavBar />
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Luxury restaurant dark mood lighting" 
            className="w-full h-full object-cover opacity-30" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-margin-desktop flex flex-col items-center text-center">
          <span className="font-label-sm text-xs text-primary uppercase tracking-[0.2em] mb-sm block opacity-80">
            Introducing DinePOS AI System
          </span>
          <h1 className="font-display-lg text-5xl md:text-7xl text-on-surface mb-md max-w-4xl leading-tight">
            The Art of Modern{' '}
            <br className="hidden sm:block" />
            <span className="text-primary italic">Hospitality</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-lg text-lg leading-relaxed">
            Precision tools crafted for high-end culinary environments. Blend the tactile elegance of fine dining with the raw power of modern fintech to reduce cognitive load and elevate the guest experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-md items-center justify-center">
            <Link href="/register" className="bg-primary-container text-on-primary-container font-title-md px-lg py-sm rounded hover:bg-primary transition-all duration-300 transform hover:-translate-y-1 glow-shadow flex items-center gap-xs">
              Request a Demo <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link href="/solutions" className="border border-outline font-title-md text-primary px-lg py-sm rounded hover:bg-surface-variant transition-all duration-300">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md auto-rows-[minmax(280px,_auto)]">
            
            {/* POS Card (Large) */}
            <div className="lg:col-span-8 glass-panel rounded-xl p-lg relative overflow-hidden group hover-glow transition-all duration-500 flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 transform translate-x-1/4 group-hover:translate-x-10 transition-transform duration-700 pointer-events-none">
                <img 
                  alt="Sleek point of sale tablet mock" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_9hW0-Bn5U_Gzfsc5vJk-zOi7qxniua5UktAA96RYKvjwM9qig_LtKHUoXbIY_NdBJ4U9IgjA0RVHzPrNnIYmAaC6q60uAHS_EfbpoxYAge_XxziJs8r8LTcCK24PNHyF3lSI_6WcA7un9-7lx7SueI-rmj7zlNv2UoFyaEwIkTNVBC_O_dFSQQLXsf6MVKKgU6Frp6huK88BJdQd0WU-N9OBozDLtkYvAbeKAGsA6wWv5Cm1oSt9Zk9dnUW-5oBfDgRaorImwhnd" 
                />
              </div>
              <div className="relative z-10 w-full md:w-2/3 flex flex-col h-full justify-between">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-sm">point_of_sale</span>
                  <h3 className="font-headline-lg text-3xl text-on-surface mb-sm font-semibold">Intelligent POS</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    Fluid table management, dynamic coursing, and split-second transaction processing designed for the pace of a busy dining room.
                  </p>
                </div>
                <Link className="font-label-sm text-primary uppercase tracking-widest mt-lg inline-flex items-center gap-xs hover:text-primary-fixed transition-colors" href="/pos">
                  Discover POS <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* KDS Card (Small) */}
            <div className="lg:col-span-4 glass-panel rounded-xl p-lg relative group hover-glow transition-all duration-500 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-sm">kitchen</span>
                <h3 className="font-title-md text-2xl text-on-surface mb-xs font-semibold">Kitchen Display</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  High-contrast, color-coded ticketing. Prioritize firing times to ensure perfect plating synchronicity.
                </p>
              </div>
              {/* Mock KDS Ticket */}
              <div className="mt-md bg-surface p-sm border-l-4 border-primary rounded shadow-inner">
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-label-sm text-on-surface font-semibold">Table 42</span>
                  <span className="font-kds-timer text-primary font-bold">12:45</span>
                </div>
                <div className="font-body-md text-on-surface-variant text-sm mb-sm">
                  2x Wagyu Ribeye <br />
                  1x Scallop Crudo
                </div>
                <Link className="font-label-sm text-primary uppercase tracking-widest inline-flex items-center gap-xs hover:text-primary-fixed transition-colors text-xs" href="/kds">
                  Discover KDS <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* Concierge Card (Medium) */}
            <div className="lg:col-span-4 glass-panel rounded-xl p-lg relative group hover-glow transition-all duration-500 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-sm">support_agent</span>
                <h3 className="font-title-md text-2xl text-on-surface mb-xs font-semibold">Global Concierge</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  24/7 white-glove technical support. We handle the system so you can focus on the service.
                </p>
              </div>
            </div>

            {/* Guest Management Card (Large) */}
            <div className="lg:col-span-8 glass-panel rounded-xl p-lg relative overflow-hidden group hover-glow transition-all duration-500 flex flex-col justify-between">
              <div className="relative z-10 w-full md:w-1/2 flex flex-col h-full justify-between">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-sm">book_online</span>
                  <h3 className="font-headline-lg text-3xl text-on-surface mb-sm font-semibold">Guest Profiles</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed mb-sm">
                    Anticipate needs before they arrive. Track preferences, allergies, and milestone dates to deliver a truly personalized concierge experience.
                  </p>
                  <Link className="font-label-sm text-primary uppercase tracking-widest inline-flex items-center gap-xs hover:text-primary-fixed transition-colors" href="/login">
                    Manage Guest Profiles <span className="material-symbols-outlined text-xs">chevron_right</span>
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-1/2 h-full hidden md:block opacity-40 pointer-events-none">
                {/* Abstract Pattern */}
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface-container-lowest to-surface-container-lowest"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-xl bg-surface-container-lowest relative z-10" id="pricing">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg text-4xl text-on-surface mb-xs font-semibold">Simple, Transparent Pricing</h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">Choose the plan that best fits your establishment's scale and ambition.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl lg:gap-md items-start pt-8">
            
            {/* Starter Card */}
            <div className="glass-panel rounded-xl p-lg flex flex-col h-full border border-outline/20 group hover-glow transition-all duration-500">
              <div className="mb-lg">
                <span className="font-label-sm text-primary uppercase tracking-widest mb-xs block text-xs">Starter Package</span>
                <h3 className="font-display-lg text-3xl text-on-surface mb-sm italic">Starter</h3>
                <p className="font-body-md text-on-surface-variant text-sm mb-lg">Perfect for independent bistros getting off the ground with reliable limits.</p>
                <div className="flex items-baseline gap-xs">
                  <span className="text-4xl font-display-lg text-on-surface font-bold">$149</span>
                  <span className="font-label-sm text-on-surface-variant uppercase text-xs">/ Month</span>
                </div>
              </div>
              <ul className="space-y-sm mb-xl flex-grow">
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> 500 order allowance included
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Standard Overage: $0.20/order
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Standard Webhook pipelines
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant/40 font-body-md text-sm">
                  <span className="material-symbols-outlined text-base">close</span> Dedicated Account Manager
                </li>
              </ul>
              <Link href="/register" className="w-full text-center border border-outline text-primary font-title-md py-sm rounded hover:bg-surface-variant transition-all block">Choose Starter</Link>
            </div>

            {/* Growth Card (Popular Choice) */}
            <div className="glass-panel rounded-xl p-lg flex flex-col h-full border-2 border-primary relative group hover-glow transition-all duration-500 lg:scale-105 z-20 shadow-2xl bg-surface-container-low">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm text-xs px-md py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                <span className="material-symbols-outlined text-sm">local_fire_department</span> Popular Choice
              </div>
              <div className="mb-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label-sm text-primary uppercase tracking-widest mb-xs block text-xs">Growth Package</span>
                    <h3 className="font-display-lg text-3xl text-on-surface mb-sm italic">Growth</h3>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
                </div>
                <p className="font-body-md text-on-surface-variant text-sm mb-lg">Designed for expanding merchants demanding dynamic scaling pipelines.</p>
                <div className="flex items-baseline gap-xs">
                  <span className="text-4xl font-display-lg text-on-surface font-bold">$399</span>
                  <span className="font-label-sm text-on-surface-variant uppercase text-xs">/ Month</span>
                </div>
              </div>
              <ul className="space-y-sm mb-xl flex-grow">
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> 2,500 order allowance included
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Optimized Overage: $0.15/order
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> High-performance endpoints
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Priority 24/7 Support
                </li>
              </ul>
              <Link href="/register" className="w-full text-center bg-primary-container text-on-primary-container font-title-md py-sm rounded hover:bg-primary transition-all glow-shadow block">Choose Growth</Link>
            </div>

            {/* Premium Card */}
            <div className="glass-panel rounded-xl p-lg flex flex-col h-full border border-outline/20 group hover-glow transition-all duration-500">
              <div className="mb-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label-sm text-primary uppercase tracking-widest mb-xs block text-xs">Premium Package</span>
                    <h3 className="font-display-lg text-3xl text-on-surface mb-sm italic">Premium</h3>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">diamond</span>
                </div>
                <p className="font-body-md text-on-surface-variant text-sm mb-lg">Ultimate package tailored for large operations seeking rock-bottom rates.</p>
                <div className="flex items-baseline gap-xs">
                  <span className="text-4xl font-display-lg text-on-surface font-bold">$899</span>
                  <span className="font-label-sm text-on-surface-variant uppercase text-xs">/ Month</span>
                </div>
              </div>
              <ul className="space-y-sm mb-xl flex-grow">
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> 10,000 order allowance included
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Lowest Overage: $0.10/order
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Enterprise API access keys
                </li>
                <li className="flex items-center gap-xs text-on-surface-variant font-body-md text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check</span> Dedicated Account Strategy
                </li>
              </ul>
              <Link href="/register" className="w-full text-center border border-outline text-primary font-title-md py-sm rounded hover:bg-surface-variant transition-all block">Choose Premium</Link>
            </div>

          </div>
        </div>
      </section>

      {/* Ambassador Program Section */}
      <section className="py-xl bg-surface relative z-10 border-t border-outline/10 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,197,61,0.04)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-margin-desktop relative z-10">

          {/* Section header */}
          <div className="text-center mb-xl">
            <span className="inline-block border border-primary/20 rounded-full px-4 py-1.5 font-label-sm text-primary text-[10px] uppercase tracking-[0.22em] bg-primary/5 mb-md">
              Ambassador Network
            </span>
            <h2 className="font-headline-lg text-4xl text-on-surface mb-xs font-semibold">
              Earn While You Introduce
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
              Refer restaurants to DinePOS AI and earn premium cash rewards for every onboarded location. Our ambassador network is growing globally.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-md mb-xl">
            {[
              { value: '$150', label: 'Reward per signup', icon: 'payments' },
              { value: '10%', label: 'Commission on first payment', icon: 'percent' },
              { value: '$0', label: 'Cost to join the program', icon: 'loyalty' },
            ].map(stat => (
              <div key={stat.label} className="glass-panel rounded-xl p-lg text-center border border-outline/20 group hover-glow transition-all duration-500">
                <span className="material-symbols-outlined text-primary text-3xl mb-sm block">{stat.icon}</span>
                <div className="font-display-lg text-3xl text-on-surface font-bold mb-xs">{stat.value}</div>
                <div className="font-label-sm text-on-surface-variant text-xs uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* How it works — 3 steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            {[
              {
                step: '01',
                icon: 'share',
                color: 'text-primary',
                bg: 'bg-primary/10 border-primary/20',
                title: 'Register & Get Your Code',
                body: 'Sign up as a DinePOS ambassador in under 2 minutes. You\'ll receive a unique referral code and link to share with your culinary network.',
              },
              {
                step: '02',
                icon: 'storefront',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Restaurants Sign Up',
                body: 'When a venue registers using your code, they\'re instantly tracked on your ambassador dashboard — showing status, services activated, and accrued rewards.',
              },
              {
                step: '03',
                icon: 'account_balance',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
                title: 'Collect Your Earnings',
                body: 'Earnings are credited per onboarded location and paid directly to your bank account by the platform admin once you reach the minimum threshold.',
              },
            ].map(step => (
              <div key={step.step} className="glass-panel rounded-xl p-lg flex flex-col gap-md border border-outline/20 group hover-glow transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 font-display-lg text-5xl text-on-surface-variant/5 font-bold leading-none select-none">{step.step}</div>
                <div className={`w-12 h-12 rounded-xl ${step.bg} border flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-2xl ${step.color}`}>{step.icon}</span>
                </div>
                <h3 className="font-title-md text-lg text-on-surface font-semibold">{step.title}</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-md items-center justify-center">
            <Link
              href="/partners"
              className="bg-primary-container text-on-primary-container font-title-md px-lg py-sm rounded hover:bg-primary transition-all duration-300 transform hover:-translate-y-1 glow-shadow flex items-center gap-xs"
            >
              Join the Ambassador Program <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              href="/partners"
              className="border border-outline font-title-md text-primary px-lg py-sm rounded hover:bg-surface-variant transition-all duration-300"
            >
              Ambassador Login
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-xl bg-surface-container-lowest relative z-10 border-t border-outline/10">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="flex flex-col md:flex-row gap-xl items-center">
            <div className="w-full md:w-1/3">
              <h2 className="font-headline-lg text-4xl text-on-surface mb-sm font-semibold">Trusted by the Elite</h2>
              <p className="font-body-md text-on-surface-variant mb-lg">See how top-tier establishments are redefining service with DinePOS AI.</p>
              <div className="flex gap-sm">
                <button type="button" aria-label="Previous testimonial" className="w-12 h-12 rounded-full border border-outline flex items-center justify-center text-on-surface hover:text-primary hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button type="button" aria-label="Next testimonial" className="w-12 h-12 rounded-full border border-outline flex items-center justify-center text-on-surface hover:text-primary hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="glass-panel rounded-xl p-lg md:p-xl border border-outline/20">
                <span className="material-symbols-outlined text-6xl text-surface-variant mb-sm block opacity-50">format_quote</span>
                <p className="font-headline-lg text-xl md:text-3xl text-on-surface mb-lg leading-relaxed">
                  "The precision of DinePOS AI is unmatched. It operates quietly in the background, handling complex pacing and modifiers, allowing our sommeliers and servers to focus entirely on the choreography of the dining experience."
                </p>
                <div className="flex items-center gap-md">
                  <img 
                    alt="Julian Rossi" 
                    className="w-12 h-12 rounded-full object-cover grayscale opacity-80 border border-outline/30" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA_tr72qxwryiHrap9NizCYdmdT52uUIq0_1k1RU99eytvG8QoC_kdRpDVU1GwA6oxikSwZbJ82mfyykJdg9czijrb93Rz0_BE_8xHPbnqVPPYkP2vec8cEZhWes7_ZhtTOsMYq6yZnE4NYIc5567rAQ5nfaGyaQMZehPd2vMhepiMt4zDM4M0m3o2BdvH4LVPmvMAuMiU1Jw42sM2HTrIbh_EK1GZyLjQmhCuqOcdreyhu9jgpQdIZz9JA0xKgH9c0vL3xIVRRK7m" 
                  />
                  <div>
                    <div className="font-title-md text-on-surface text-base font-semibold">Julian Rossi</div>
                    <div className="font-label-sm text-on-surface-variant text-xs">General Manager, L'Aura</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-xl bg-surface relative z-10 border-t border-outline/10">
        <div className="max-w-4xl mx-auto px-margin-desktop text-center">
          <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-sm font-semibold">The Future of Hospitality is Here.</h2>
          <p className="font-body-md text-on-surface-variant mb-lg text-lg">Join the world's most discerning culinary institutions.</p>
          <div className="flex flex-col sm:flex-row gap-md items-center justify-center">
            <Link href="/register" className="bg-primary-container text-on-primary-container font-title-md px-lg py-sm rounded hover:bg-primary transition-all duration-300 transform hover:-translate-y-1 glow-shadow flex items-center gap-xs">
              Request a Demo <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link href="/#pricing" className="border border-outline font-title-md text-primary px-lg py-sm rounded hover:bg-surface-variant transition-all duration-300">
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
