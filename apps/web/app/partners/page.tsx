import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function PartnersPage() {
  return (
    <div className="flex-1 flex flex-col pt-24 bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden">
      <TopNavBar />

      <header className="relative py-xl overflow-hidden">
        <div className="relative z-10 w-full max-w-5xl mx-auto px-margin-desktop flex flex-col items-center text-center">
          <span className="font-label-sm text-xs text-primary uppercase tracking-[0.2em] mb-sm block opacity-80">
            Ecosystem
          </span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-surface mb-md">
            Integration <span className="text-primary italic">Partners</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-lg text-lg">
            DinePOS connects seamlessly with the tools you already rely on to run your business.
          </p>
        </div>
      </header>

      <section className="py-xl bg-surface relative z-10 border-t border-outline/10">
        <div className="max-w-7xl mx-auto px-margin-desktop text-center pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-panel rounded-xl p-lg flex flex-col items-center justify-center aspect-square border border-outline/20 hover-glow transition-all">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-sm">hub</span>
                <span className="font-title-md text-on-surface">Partner {i}</span>
              </div>
            ))}
          </div>
          <Link href="/support" className="mt-xl border border-outline text-primary font-title-md px-lg py-sm rounded hover:bg-surface-variant transition-all inline-block">
            Become a Partner
          </Link>
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
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100 text-primary opacity-100 font-bold" href="/experience">Experience</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/solutions">Solutions</Link>
          </div>
          <div className="text-on-surface-variant font-label-sm text-xs opacity-60">
            © 2026 DinePOS AI Hospitality Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
