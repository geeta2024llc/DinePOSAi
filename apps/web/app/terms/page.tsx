'use client';

import React, { useState, useEffect } from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';
import { getCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';

export default function TermsPage() {
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);

  useEffect(() => {
    setCmsConfig(getCmsConfig());
    const handleUpdate = () => setCmsConfig(getCmsConfig());
    window.addEventListener('dinepos_cms_update', handleUpdate);
    return () => window.removeEventListener('dinepos_cms_update', handleUpdate);
  }, []);

  return (
    <div className="bg-surface-container-lowest text-on-surface flex flex-col antialiased min-h-screen pt-24 pb-8">
      <TopNavBar />
      
      <main className="flex-grow max-w-7xl mx-auto px-margin-desktop w-full grid grid-cols-1 md:grid-cols-4 gap-xl">
        
        {/* Sidebar */}
        <aside className="md:col-span-1 hidden md:block">
          <div className="sticky top-32 glass-panel rounded-xl p-6 border-outline/20">
            <h3 className="font-title-md font-bold mb-4">Contents</h3>
            <ul className="space-y-4 font-label-sm text-on-surface-variant text-sm">
              <li>
                <a href="#introduction" className="hover:text-primary transition-colors block">1. Introduction</a>
              </li>
              <li>
                <a href="#service-usage" className="hover:text-primary transition-colors block">2. Service Usage</a>
              </li>
              <li>
                <a href="#data-privacy" className="hover:text-primary transition-colors block">3. Data Privacy</a>
              </li>
              <li>
                <a href="#subscription-terms" className="hover:text-primary transition-colors block">4. Subscription Terms</a>
              </li>
              <li>
                <a href="#liability" className="text-primary transition-colors block bg-surface-container-high -mx-4 px-4 py-2 rounded-md">5. Liability & Indemnification</a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-3 pb-24">
          <div className="mb-12">
            <h1 className="font-display-lg text-5xl text-primary mb-2">{cmsConfig.legal.termsTitle}</h1>
            <p className="font-label-sm text-on-surface-variant text-sm">{cmsConfig.legal.termsSubtitle}</p>
          </div>

          <section id="introduction" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">1. Introduction</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {cmsConfig.legal.termsIntro}
            </p>
          </section>

          <section id="service-usage" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-6">2. Service Usage</h2>
            
            <div className="space-y-6">
              <div className="glass-panel rounded-xl p-6 border-outline/10">
                <h3 className="font-title-md font-semibold text-primary mb-2">Authorized Access</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  {cmsConfig.legal.termsUsage1}
                </p>
              </div>

              <div className="glass-panel rounded-xl p-6 border-outline/10">
                <h3 className="font-title-md font-semibold text-primary mb-2">System Integrity</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  {cmsConfig.legal.termsUsage2}
                </p>
              </div>
            </div>
          </section>

          <section id="data-privacy" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">3. Data Privacy</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-4">
              {cmsConfig.legal.termsBody1}
            </p>
            <ul className="list-disc list-outside ml-6 space-y-2 font-body-md text-on-surface-variant text-sm">
              <li><strong className="text-on-surface">Data Sovereignty:</strong> Your data remains your property.</li>
              <li><strong className="text-on-surface">Encryption:</strong> All transactional and guest data is encrypted in transit and at rest.</li>
              <li><strong className="text-on-surface">Compliance:</strong> We support your compliance with GDPR, CCPA, and relevant local data protection regulations.</li>
            </ul>
          </section>

          <section id="subscription-terms" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">4. Subscription Terms</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-6">
              {cmsConfig.legal.termsSub1}
            </p>
            
            <div className="border-l-2 border-primary pl-6 py-2 bg-gradient-to-r from-primary/10 to-transparent rounded-r-xl">
              <h4 className="font-label-sm text-primary uppercase text-xs font-bold tracking-widest mb-2">Important Notice</h4>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                {cmsConfig.legal.termsSub2}
              </p>
            </div>
          </section>

          <section id="liability" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">5. Liability & Indemnification</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-4">
              {cmsConfig.legal.termsLiability1}
            </p>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {cmsConfig.legal.termsLiability2}
            </p>
          </section>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/30 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-lg gap-gutter max-w-7xl mx-auto">
          <div className="font-display-lg text-display-lg text-primary opacity-80 hover:opacity-100 transition-opacity font-bold">DinePOS AI</div>
          <div className="flex flex-wrap justify-center gap-md font-label-sm text-on-surface-variant text-xs font-medium">
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100 text-primary opacity-100 font-bold" href="/terms">Terms of Service</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/support">Contact Support</Link>
          </div>
          <div className="text-on-surface-variant font-label-sm text-xs opacity-60">
            © 2026 DinePOS AI Hospitality Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
