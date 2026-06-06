import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function SolutionsPage() {
  return (
    <div className="flex-1 flex flex-col pt-24 bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden">
      <TopNavBar />

      <header className="relative py-xl overflow-hidden">
        <div className="relative z-10 w-full max-w-5xl mx-auto px-margin-desktop flex flex-col items-center text-center">
          <span className="font-label-sm text-xs text-primary uppercase tracking-[0.2em] mb-sm block opacity-80">
            Platform Capabilities
          </span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-surface mb-md">
            Holistic <span className="text-primary italic">Solutions</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-lg text-lg">
            An ecosystem of interconnected tools designed for high-volume, high-touch environments.
          </p>
        </div>
      </header>

      <section className="py-xl bg-surface relative z-10 border-t border-outline/10">
        <div className="max-w-7xl mx-auto px-margin-desktop space-y-xl pb-24">
          
          <div className="glass-panel rounded-xl p-lg flex flex-col md:flex-row gap-lg items-center border border-outline/20">
            <div className="md:w-1/2">
              <span className="material-symbols-outlined text-primary text-5xl mb-sm">point_of_sale</span>
              <h2 className="font-headline-lg text-3xl text-on-surface mb-sm">Point of Sale</h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed mb-sm">
                Streamline order entry with predictive search, intuitive modifier groups, and offline-first reliability. Our POS handles complex splits, transfers, and comps with a single tap.
              </p>
              <Link href="/pos" className="font-label-sm text-primary uppercase tracking-widest inline-flex items-center gap-xs hover:text-primary-fixed transition-colors text-sm font-bold">
                Launch POS Console <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
            <div className="md:w-1/2 w-full aspect-video bg-surface-container-highest rounded flex items-center justify-center">
               <span className="material-symbols-outlined text-surface-variant text-7xl">desktop_windows</span>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-lg flex flex-col md:flex-row-reverse gap-lg items-center border border-outline/20">
            <div className="md:w-1/2">
              <span className="material-symbols-outlined text-primary text-5xl mb-sm">kitchen</span>
              <h2 className="font-headline-lg text-3xl text-on-surface mb-sm">Kitchen Display System</h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed mb-sm">
                Pace courses flawlessly. Our KDS routes items to specific prep stations, tracks ticket times across the line, and ensures synchronized firing.
              </p>
              <Link href="/kds" className="font-label-sm text-primary uppercase tracking-widest inline-flex items-center gap-xs hover:text-primary-fixed transition-colors text-sm font-bold">
                Launch KDS Display <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
            <div className="md:w-1/2 w-full aspect-video bg-surface-container-highest rounded flex items-center justify-center">
               <span className="material-symbols-outlined text-surface-variant text-7xl">soup_kitchen</span>
            </div>
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
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100 text-primary opacity-100 font-bold" href="/solutions">Solutions</Link>
          </div>
          <div className="text-on-surface-variant font-label-sm text-xs opacity-60">
            © 2026 DinePOS AI Hospitality Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
