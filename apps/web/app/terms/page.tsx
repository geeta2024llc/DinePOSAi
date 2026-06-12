import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function TermsPage() {
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
            <h1 className="font-display-lg text-5xl text-primary mb-2">Terms and Conditions</h1>
            <p className="font-label-sm text-on-surface-variant text-sm">Last Updated: October 24, 2024</p>
          </div>

          <section id="introduction" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">1. Introduction</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Welcome to DinePOS AI Hospitality Systems. These Terms and Conditions govern your access to and use of our point-of-sale, kitchen display systems, and broader hospitality management platforms. By accessing or using our services, you agree to be bound by these terms. If you do not agree to all the terms and conditions, then you may not access the services.
            </p>
          </section>

          <section id="service-usage" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-6">2. Service Usage</h2>
            
            <div className="space-y-6">
              <div className="glass-panel rounded-xl p-6 border-outline/10">
                <h3 className="font-title-md font-semibold text-primary mb-2">Authorized Access</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  You agree to use the DinePOS AI platforms solely for your internal business operations within the hospitality sector. You shall not license, sublicense, sell, resell, transfer, assign, distribute, or otherwise commercially exploit or make available to any third party the Service in any way.
                </p>
              </div>

              <div className="glass-panel rounded-xl p-6 border-outline/10">
                <h3 className="font-title-md font-semibold text-primary mb-2">System Integrity</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  Users are strictly prohibited from attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service. Operational screens (KDS/POS) must be maintained in environments consistent with hardware specifications to ensure optimal high-contrast legibility and functional uptime.
                </p>
              </div>
            </div>
          </section>

          <section id="data-privacy" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">3. Data Privacy</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-4">
              DinePOS AI Hospitality Systems operates as a data processor for the guest data entered into our systems by your establishment. We adhere to stringent data protection protocols, leveraging deep tonal layering and secure infrastructure to isolate tenant data.
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
              Access to the DinePOS AI suite is provided on a subscription basis. Fees are billed in advance on a recurring schedule as determined by your selected service tier.
            </p>
            
            <div className="border-l-2 border-primary pl-6 py-2 bg-gradient-to-r from-primary/10 to-transparent rounded-r-xl">
              <h4 className="font-label-sm text-primary uppercase text-xs font-bold tracking-widest mb-2">Important Notice</h4>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                Failure to maintain active payment methods may result in immediate suspension of POS and KDS operational screens to protect system resources. Reinstatement requires clearing all outstanding balances.
              </p>
            </div>
          </section>

          <section id="liability" className="mb-12">
            <h2 className="font-headline-lg text-3xl text-primary mb-4">5. Liability & Indemnification</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-4">
              DinePOS AI Hospitality Systems shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Our total liability for all claims related to the Service shall not exceed the total amount paid by you to us for the Service during the twelve (12) months preceding the claim.
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
