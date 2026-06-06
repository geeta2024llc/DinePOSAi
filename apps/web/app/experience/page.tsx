import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function ExperiencePage() {
  return (
    <div className="flex-1 flex flex-col pt-24 bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden">
      <TopNavBar />
      
      <header className="relative min-h-[60vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface-container-lowest to-surface-container-lowest"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-margin-desktop flex flex-col items-center text-center">
          <span className="font-label-sm text-xs text-primary uppercase tracking-[0.2em] mb-sm block opacity-80">
            The DinePOS Experience
          </span>
          <h1 className="font-display-lg text-5xl md:text-7xl text-on-surface mb-md max-w-4xl leading-tight">
            Designed for the <br />
            <span className="text-primary italic">Senses</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-lg text-lg leading-relaxed">
            We believe that technology should fade into the background. The DinePOS experience is about returning the focus to what matters most: the culinary artistry and the guest.
          </p>
        </div>
      </header>

      <section className="py-xl bg-surface relative z-10">
        <div className="max-w-7xl mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-xl items-center pb-24">
          <div>
            <h2 className="font-headline-lg text-4xl text-on-surface mb-md">Silent Operation</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-sm">
              Our interfaces use deep blacks and muted typography to ensure the glow of a screen never interrupts the ambiance of a dimly lit dining room. Haptic feedback replaces jarring notifications.
            </p>
            <ul className="space-y-sm mt-lg">
              <li className="flex items-center gap-xs text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined text-primary text-base">dark_mode</span> Dark Mode Native
              </li>
              <li className="flex items-center gap-xs text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined text-primary text-base">vibration</span> Haptic Cues
              </li>
            </ul>
          </div>
          <div className="glass-panel rounded-xl p-lg aspect-square flex items-center justify-center border border-outline/20">
            <span className="material-symbols-outlined text-9xl text-primary/20">restaurant</span>
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
