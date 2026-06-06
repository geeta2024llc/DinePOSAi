import React from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-surface-container-lowest text-on-surface flex flex-col antialiased min-h-screen pt-24 pb-8">
      <TopNavBar />
      
      <main className="flex-grow max-w-4xl mx-auto px-margin-desktop w-full pb-24">
        
        {/* Header */}
        <div className="mb-12 mt-8 border-b border-outline/10 pb-8">
          <h1 className="font-display-lg text-5xl text-primary mb-4">Privacy Policy</h1>
          <p className="font-title-md text-on-surface-variant text-lg mb-2">
            Intelligent Hospitality Systems Data Governance
          </p>
          <p className="font-label-sm text-on-surface-variant text-sm opacity-70">
            Last Updated: October 24, 2024
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          
          {/* Data Sovereignty Card */}
          <div className="glass-panel rounded-xl p-8 border-outline/10 hover-glow transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">security</span>
              <h2 className="font-display-lg text-3xl text-on-surface">Data Sovereignty & Encryption</h2>
            </div>
            <div className="space-y-4 font-body-md text-on-surface-variant leading-relaxed">
              <p>
                At DinePOS AI, we treat the data of your establishment and your patrons with the highest level of security protocols available in the hospitality sector. We employ AES-256 encryption at rest and TLS 1.3 for all data in transit. Your operational data remains entirely sovereign; we act solely as processors.
              </p>
              <p>
                Our AI models are trained on anonymized, aggregated datasets. Specific patron identifiers, payment details, and proprietary recipes are never ingested into global training environments without explicit, opt-in enterprise agreements.
              </p>
            </div>
          </div>

          {/* Two Columns: Collection and Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Data Collection Card */}
            <div className="glass-panel rounded-xl p-8 border-outline/10 hover-glow transition-all">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">database</span>
                <h2 className="font-title-md text-2xl text-on-surface font-semibold">Data Collection</h2>
              </div>
              <ul className="space-y-4 font-body-md text-on-surface-variant text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Transactional Point-of-Sale records
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Patron reservation & preference metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Staff interaction and terminal logs
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  AI-driven predictive inventory telemetry
                </li>
              </ul>
            </div>

            {/* Compliance Card */}
            <div className="glass-panel rounded-xl p-8 border-outline/10 hover-glow transition-all">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                <h2 className="font-title-md text-2xl text-on-surface font-semibold">GDPR & CCPA Compliance</h2>
              </div>
              <ul className="space-y-4 font-body-md text-on-surface-variant text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Right to access and erasure (Right to be forgotten)
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Strict data processing agreements (DPAs)
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Automated compliance reporting for franchisees
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">circle</span>
                  Zero-knowledge proof architecture for sensitive fields
                </li>
              </ul>
            </div>

          </div>

          {/* Third-Party Integrations Card */}
          <div className="glass-panel rounded-xl p-8 border-outline/10 hover-glow transition-all">
            <h2 className="font-title-md text-2xl text-primary font-semibold mb-4">Third-Party Integrations</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              DinePOS AI integrates seamlessly with leading delivery aggregators, CRM platforms, and payment gateways. Data shared with these entities is strictly limited to the necessary operational scope. We require all third-party vendors to adhere to our stringent 'Aura Protocol' data standards before integration is authorized.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/30 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-lg gap-gutter max-w-7xl mx-auto">
          <div className="font-body-md text-on-surface-variant text-xs opacity-80 max-w-[250px] leading-relaxed">
            © 2026 DinePOS AI. Intelligent Hospitality Systems.
          </div>
          <div className="flex flex-wrap justify-center gap-md font-label-sm text-on-surface-variant text-xs font-medium">
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/terms">Terms of Service</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100 text-primary opacity-100 font-bold" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/support">Contact Support</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/experience">Experience</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/solutions">Solutions</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
