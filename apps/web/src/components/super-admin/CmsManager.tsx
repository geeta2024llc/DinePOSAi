'use client';

import React from 'react';
import { CmsConfig, saveCmsConfig } from '@/components/cms/CmsHelper';
import { recordActivity } from '@/utils/activityLogger';

interface CmsManagerProps {
  t: any;
  theme: any;
  isLightTheme: boolean;
  activeTab: string;
  cmsConfig: CmsConfig;
  setCmsConfig: React.Dispatch<React.SetStateAction<CmsConfig>>;
  cmsSubTab: string;
  setCmsSubTab: any;
  triggerToast: any;
  hBg: string;
  hText: string;
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
  filteredLogs: any[];
}

export default function CmsManager(props: CmsManagerProps) {
  const {
    t, theme, isLightTheme, activeTab, cmsConfig, setCmsConfig,
    cmsSubTab, setCmsSubTab, triggerToast,
    hBg, hText, setAuditLogs, filteredLogs
  } = props;

  return (
    <>
          {activeTab === 'cms' && (
            <div className="space-y-8 animate-fade-in duration-300">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    CMS Content Manager
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Modify the live copy, images, pricing tiers, and legal policies displayed across DinePOS AI platform pages.
                  </p>
                </div>
                <div>
                  <button type="button"
                    onClick={async () => {
                      saveCmsConfig(cmsConfig);
                      await recordActivity(
                        'Settings',
                        `Published updates to CMS configuration (${cmsSubTab.toUpperCase()})`,
                        'Settings',
                        { subTab: cmsSubTab }
                      );
                      setAuditLogs((prev: any[]) => [
                        {
                          id: Date.now(),
                          time: 'Just now',
                          actor: 'Super Admin',
                          action: `Published updates to CMS configuration (${cmsSubTab.toUpperCase()})`,
                          tenant: 'System-wide',
                          type: 'security'
                        },
                        ...prev
                      ]);
                      triggerToast('CMS Configuration updated and published!', 'success');
                    }}
                    className={`px-6 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">publish</span>
                    Publish Changes
                  </button>
                </div>
              </div>

              {/* Sub-tabs Selection */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                {[
                  { id: 'homepage', label: 'Homepage', icon: 'home' },
                  { id: 'pricing', label: 'SaaS Pricing', icon: 'payments' },
                  { id: 'support', label: 'Support Desk', icon: 'support_agent' },
                  { id: 'partners', label: 'Partner Program', icon: 'group' },
                  { id: 'auth', label: 'Auth Screens', icon: 'login' },
                  { id: 'legal', label: 'Legal Policies', icon: 'policy' }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => setCmsSubTab(subTab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                      cmsSubTab === subTab.id
                        ? 'bg-[#ffc53d]/10 border-[#ffc53d]/30 text-[#ffc53d]'
                        : 'border-white/5 text-[#A69984]/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{subTab.icon}</span>
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
                <div className="lg:col-span-8 space-y-8">
                  {cmsSubTab === 'homepage' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">home</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Homepage Hero & Bento Feature Blocks</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Hero Image */}
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Hero Image URL</label>
                          <input
                            type="text"
                            value={cmsConfig.homepage.heroImage}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              homepage: { ...prev.homepage, heroImage: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        {/* Hero Title */}
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Hero Title</label>
                          <input
                            type="text"
                            value={cmsConfig.homepage.heroTitle}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              homepage: { ...prev.homepage, heroTitle: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        {/* Hero Subtitle */}
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Hero Subtitle</label>
                          <textarea
                            rows={3}
                            value={cmsConfig.homepage.heroSubtitle}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              homepage: { ...prev.homepage, heroSubtitle: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                          />
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Feature Blocks (Bento Grid)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* POS Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">POS Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.posTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, posTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">POS Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.posDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, posDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* KDS Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KDS Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.kdsTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, kdsTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KDS Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.kdsDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, kdsDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* Concierge Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.conciergeTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, conciergeTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.conciergeDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, conciergeDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* Guest Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Guest Profile Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.guestTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, guestTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Guest Profile Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.guestDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, guestDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'pricing' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">payments</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">SaaS Subscription Pricing & Tier Descriptions</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        {/* Starter Tier */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Starter Package</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Price (¥)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.starterMonthly}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, starterMonthly: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Annual Price (¥ / month)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.starterAnnual}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, starterAnnual: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Starter Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.pricing.starterDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                               ...prev,
                               pricing: { ...prev.pricing, starterDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Growth Tier */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Growth Package</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Price (¥)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.growthMonthly}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, growthMonthly: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Annual Price (¥ / month)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.growthAnnual}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, growthAnnual: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Growth Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.pricing.growthDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                               ...prev,
                               pricing: { ...prev.pricing, growthDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Business Tier */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Business Package</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Price (¥)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.premiumMonthly}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, premiumMonthly: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Annual Price (¥ / month)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.premiumAnnual}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, premiumAnnual: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Business Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.pricing.premiumDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                               ...prev,
                               pricing: { ...prev.pricing, premiumDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'support' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">support_agent</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Support Desk Copy & FAQs</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Support Title</label>
                            <input
                              type="text"
                              value={cmsConfig.support.title}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, title: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Support Subtitle</label>
                            <input
                              type="text"
                              value={cmsConfig.support.subtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, subtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Email</label>
                            <input
                              type="text"
                              value={cmsConfig.support.email}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, email: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Phone</label>
                            <input
                              type="text"
                              value={cmsConfig.support.phone}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, phone: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Available Hours</label>
                            <input
                              type="text"
                              value={cmsConfig.support.hours}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, hours: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Knowledge Base / FAQs</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 1: Question</label>
                            <input
                              type="text"
                              value={cmsConfig.support.faq1Title}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq1Title: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 1: Answer</label>
                            <textarea
                              rows={3}
                              value={cmsConfig.support.faq1Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq1Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 2: Question</label>
                            <input
                              type="text"
                              value={cmsConfig.support.faq2Title}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq2Title: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 2: Answer</label>
                            <textarea
                              rows={3}
                              value={cmsConfig.support.faq2Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq2Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Support Page Layout & Placeholders</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KB Title</label>
                            <input
                              type="text"
                              value={cmsConfig.support.kbTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kbTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KB Subtitle</label>
                            <input
                              type="text"
                              value={cmsConfig.support.kbSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kbSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KB Button Text</label>
                            <input
                              type="text"
                              value={cmsConfig.support.kbButtonText}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kbButtonText: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        {/* KB Article 1 */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Knowledge Base Card 1</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 1 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb1Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb1Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 1 Icon (Material Symbol)</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb1Icon}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb1Icon: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 1 Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.support.kb1Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kb1Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* KB Article 2 */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Knowledge Base Card 2</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 2 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb2Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb2Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 2 Icon (Material Symbol)</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb2Icon}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb2Icon: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 2 Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.support.kb2Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kb2Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* KB Article 3 */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Knowledge Base Card 3</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 3 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb3Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb3Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 3 Icon (Material Symbol)</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb3Icon}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb3Icon: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 3 Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.support.kb3Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kb3Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Inquiry form settings */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Direct Inquiry Form</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Header Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Submit Button Text</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formButtonText}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formButtonText: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Establishment Input Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formEstPlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formEstPlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Name Input Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formNamePlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formNamePlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Email Input Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formEmailPlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formEmailPlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Message Textarea Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formMsgPlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formMsgPlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ticket Portal settings */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Ticket Portal Card</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Portal Card Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.portalTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, portalTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Portal Card Description</label>
                              <input
                                type="text"
                                value={cmsConfig.support.portalDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, portalDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                        {/* FAQ titles */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">FAQ Section Titles</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ Main Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.faqTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, faqTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ Subtitle</label>
                              <input
                                type="text"
                                value={cmsConfig.support.faqSubtitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, faqSubtitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'partners' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">group</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Global Alliance & Featured Partners</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Partners Hero Title</label>
                          <input
                            type="text"
                            value={cmsConfig.partners.title}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              partners: { ...prev.partners, title: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Partners Hero Subtitle</label>
                          <input
                            type="text"
                            value={cmsConfig.partners.subtitle}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              partners: { ...prev.partners, subtitle: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Partners Introduction Copy</label>
                          <textarea
                            rows={3}
                            value={cmsConfig.partners.intro}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              partners: { ...prev.partners, intro: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                          />
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Alliance Directory (Featured Integrations)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Partner 1 Name & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 1: Name</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.partner1Name}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner1Name: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 1: Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.partners.partner1Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner1Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* Partner 2 Name & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 2: Name</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.partner2Name}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner2Name: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 2: Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.partners.partner2Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner2Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">How it Works (Steps)</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Step 1</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 1 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.step1Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step1Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 1 Description</label>
                              <textarea
                                rows={2}
                                value={cmsConfig.partners.step1Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step1Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Step 2</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 2 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.step2Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step2Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 2 Description</label>
                              <textarea
                                rows={2}
                                value={cmsConfig.partners.step2Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step2Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Step 3</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 3 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.step3Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step3Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 3 Description</label>
                              <textarea
                                rows={2}
                                value={cmsConfig.partners.step3Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step3Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Ambassador Testimonial & Policies</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Ambassador Testimonial Quote</label>
                            <textarea
                              rows={3}
                              value={cmsConfig.partners.testimonialQuote}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                partners: { ...prev.partners, testimonialQuote: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Ambassador Testimonial Author & Role</label>
                            <input
                              type="text"
                              value={cmsConfig.partners.testimonialAuthor}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                partners: { ...prev.partners, testimonialAuthor: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Alliances Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.allianceTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, allianceTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Alliances Subtitle</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.allianceSubtitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, allianceSubtitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Payout Policies (Comma-separated, supports placeholders like {'{rewardPerSignup}'}, {'{commissionRate}'}, {'{minPayoutThreshold}'}, {'{cookieDuration}'})</label>
                            <textarea
                              rows={4}
                              value={cmsConfig.partners.payoutPolicies}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                partners: { ...prev.partners, payoutPolicies: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Ambassador Registration Info</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Reg Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.regTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, regTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Reg Subtitle</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.regSubtitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, regSubtitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'auth' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">login</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Executive Auth Screens Copy</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {/* Login Screen */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Sign-In page (Login Console)</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Subtitle</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.auth.loginSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Register Screen */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Sign-Up page (Register Console)</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Register Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.signupTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Register Subtitle</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.auth.signupSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Auth Page Headers & Logos</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Brand Logo Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginPageTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginPageTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Register Brand Logo Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.signupPageTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupPageTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Login Page Input Labels & Buttons</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Select Role Label</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginRoleLabel}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginRoleLabel: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Email Input Label</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginEmailLabel}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginEmailLabel: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Password Input Label</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginPasswordLabel}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginPasswordLabel: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Remember Me Text</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginRememberMe}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginRememberMe: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Forgot Password Text</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginForgotPassword}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginForgotPassword: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Sign-In Button Text</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginButtonText}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginButtonText: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Demo Access Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginDemoTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginDemoTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Footer Notes</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginFooter}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginFooter: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Register Page Custom copy</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Left Side Brand Banner</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Banner Eyebrow</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupLeftEyebrow}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupLeftEyebrow: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Banner Headline</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupLeftTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupLeftTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Banner Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.auth.signupLeftDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupLeftDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Right Side Form Console</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Trial Eyebrow (e.g. {'{selectedTier}'} Free Trial)</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupRightEyebrow}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupRightEyebrow: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Submit Button Text</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupButtonText}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupButtonText: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Footer Copyright Notes</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupFooter}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupFooter: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'legal' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">policy</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Legal Agreements & Policies</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {/* Terms of Service */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Terms of Service (TOS)</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Terms Header Title</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.termsTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, termsTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Terms Subheading</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.termsSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, termsSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Terms Introductory Body Copy</label>
                            <textarea
                              rows={4}
                              value={cmsConfig.legal.termsBody1}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, termsBody1: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Privacy Policy */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Privacy Policy</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Privacy Header Title</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.privacyTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, privacyTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Privacy Subheading</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.privacySubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, privacySubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Privacy Introductory Body Copy</label>
                            <textarea
                              rows={4}
                              value={cmsConfig.legal.privacyBody1}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, privacyBody1: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Audit trail sidebar */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 min-h-[400px]`}>
                    <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Audit Trail</h3>
                      <button type="button" 
                        onClick={() => { setAuditLogs([]); triggerToast('Logs cleared.', 'info'); }}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-4 text-xs select-text overflow-y-auto max-h-[380px] pr-1">
                      {filteredLogs.map(log => (
                        <div key={log.id} className="border-b border-white/5 pb-3 last:border-none">
                          <div className="flex gap-2 items-start">
                            <span className={`material-symbols-outlined text-sm mt-0.5 ${
                              log.type === 'security' ? 'text-amber-400' :
                              log.type === 'warning' ? 'text-rose-400' :
                              log.type === 'success' ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                              {log.type === 'security' ? 'security' : log.type === 'warning' ? 'priority_high' : log.type === 'success' ? 'check_circle' : 'info'}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight">{log.action}</div>
                              <div className="text-[9.5px] text-[#A69984]/65 mt-1 font-semibold">
                                {log.actor} • <span className="italic">{log.tenant}</span>
                              </div>
                              <span className="text-[8px] text-[#A69984]/40 font-bold block mt-1 uppercase tracking-wider">{log.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredLogs.length === 0 && (
                        <div className="text-center py-20 text-[#A69984]/30">
                          Audit logs clear.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

    </>
  );
}
