'use client';

import React, { useRef } from 'react';
import { recordActivity } from '@/utils/activityLogger';

interface GeneralTabProps {
  t: any;
  tr: any;
  currency: string;
  language: string;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  establishmentName: string;
  setEstablishmentName: (val: string) => void;
  businessAddress: string;
  setBusinessAddress: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  taxId: string;
  setTaxId: (val: string) => void;
  restaurantLogo: string;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoRemove: () => void;
  handleSaveChanges: () => void;
  
  // Theme settings
  globalAesthetic: string;
  handleGlobalAestheticChange: (aesthetic: string) => void;
  
  // Language & Currency
  handleLanguageChange: (lang: 'en' | 'ja' | 'zh' | 'ko') => void;
  handleCurrencyChange: (currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW') => void;
  
  // Receipts toggles
  showLogo: boolean;
  setShowLogo: (val: boolean) => void;
  showTableNumber: boolean;
  setShowTableNumber: (val: boolean) => void;
  showServerName: boolean;
  setShowServerName: (val: boolean) => void;
  showOrderTimestamp: boolean;
  setShowOrderTimestamp: (val: boolean) => void;
  showTaxId: boolean;
  setShowTaxId: (val: boolean) => void;
  showQrCode: boolean;
  setShowQrCode: (val: boolean) => void;
  showSocialMedia: boolean;
  setShowSocialMedia: (val: boolean) => void;
  showServiceCharge: boolean;
  setShowServiceCharge: (val: boolean) => void;
  showCustomFooter: boolean;
  setShowCustomFooter: (val: boolean) => void;
  thankYouMessage: string;
  setThankYouMessage: (val: string) => void;
  
  // Tax Rates & Settings
  taxType: 'pre-tax' | 'post-tax';
  handleTaxTypeChange: (taxType: 'pre-tax' | 'post-tax') => void;
  taxRateDineIn: number;
  handleTaxRateDineInChange: (val: number) => void;
  taxRateTakeaway: number;
  handleTaxRateTakeawayChange: (val: number) => void;
  taxRateDelivery: number;
  handleTaxRateDeliveryChange: (val: number) => void;
  
  digitalMenuConfig: {
    dineInEnabled: boolean;
    takeawayEnabled: boolean;
    deliveryEnabled: boolean;
    excludeAlcoholic: boolean;
    excludeDesserts: boolean;
    requirePhone: boolean;
    requireTable: boolean;
    maxPrice: number;
    excludedTags: string[];
    showAIConcierge: boolean;
    enableSelfCheckout: boolean;
    enableTimeBasedMenu: boolean;
    lunchStart?: string;
    lunchEnd?: string;
    dinnerStart?: string;
    dinnerEnd?: string;
  };
  updateDigitalMenuConfig: (newConfig: any) => void;

  // Custom Theme Colors
  customBg: string;
  customCardBg: string;
  customAccent: string;
  customText: string;
  customTextMuted: string;
  updateCustomBg: (val: string) => void;
  updateCustomCardBg: (val: string) => void;
  updateCustomAccent: (val: string) => void;
  updateCustomText: (val: string) => void;
  updateCustomTextMuted: (val: string) => void;
}

export default function GeneralTab({
  t,
  tr,
  currency,
  language,
  triggerToast,
  establishmentName,
  setEstablishmentName,
  businessAddress,
  setBusinessAddress,
  contactEmail,
  setContactEmail,
  taxId,
  setTaxId,
  restaurantLogo,
  handleLogoUpload,
  handleLogoRemove,
  handleSaveChanges,
  globalAesthetic,
  handleGlobalAestheticChange,
  handleLanguageChange,
  handleCurrencyChange,
  showLogo,
  setShowLogo,
  showTableNumber,
  setShowTableNumber,
  showServerName,
  setShowServerName,
  showOrderTimestamp,
  setShowOrderTimestamp,
  showTaxId,
  setShowTaxId,
  showQrCode,
  setShowQrCode,
  showSocialMedia,
  setShowSocialMedia,
  showServiceCharge,
  setShowServiceCharge,
  showCustomFooter,
  setShowCustomFooter,
  thankYouMessage,
  setThankYouMessage,
  taxType,
  handleTaxTypeChange,
  taxRateDineIn,
  handleTaxRateDineInChange,
  taxRateTakeaway,
  handleTaxRateTakeawayChange,
  taxRateDelivery,
  handleTaxRateDeliveryChange,
  digitalMenuConfig,
  updateDigitalMenuConfig,
  customBg,
  customCardBg,
  customAccent,
  customText,
  customTextMuted,
  updateCustomBg,
  updateCustomCardBg,
  updateCustomAccent,
  updateCustomText,
  updateCustomTextMuted
}: GeneralTabProps) {
  const { dineInEnabled, takeawayEnabled, deliveryEnabled } = digitalMenuConfig;
  const currencyRates: Record<string, number> = { USD: 1, JPY: 150, EUR: 0.92, GBP: 0.79, CNY: 7.24, KRW: 1340 };
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language || 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(val);
  };

  const subtotalVal = 100.00;
  const taxVal = taxType === 'pre-tax' ? subtotalVal * 0.08 : subtotalVal - (subtotalVal / 1.08);
  const serviceChargeVal = showServiceCharge ? 10.00 : 0.00;
  const totalVal = taxType === 'pre-tax' ? subtotalVal + taxVal + serviceChargeVal : subtotalVal + serviceChargeVal;

  const logoFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* GENERAL TAB JSX */}
                  <div className="space-y-8 animate-fade-in duration-300">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6 select-none">
                <div>
                  <h2 className={`font-serif text-[38px] font-bold ${t.accent} tracking-wide leading-none`}>
                    {tr.generalTitle}
                  </h2>
                  <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
                    {tr.generalDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Configurations) - Span 7 */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Restaurant Information */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                     <h3 className={`${t.text} font-bold text-sm tracking-wide mb-6 select-none`}>{tr.restaurantInfo}</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                       {/* Left Column: Brand Logo Upload Box */}
                       <div className="md:col-span-4 flex flex-col items-center p-6 bg-white/[0.01] border border-white/5 rounded-2xl text-center select-none">
                         <label className={`block ${t.textMuted} text-[9.5px] font-extrabold uppercase tracking-widest mb-4 w-full text-left`}>Brand Logo</label>
                         <input
                           ref={logoFileInputRef}
                           type="file"
                           accept="image/png, image/jpeg, image/svg+xml, image/webp"
                           className="hidden"
                           onChange={handleLogoUpload}
                         />
                         
                         <div className="relative group cursor-pointer mb-5" onClick={() => logoFileInputRef.current?.click()}>
                           {restaurantLogo ? (
                             <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-2 transition-all duration-300 group-hover:border-[#ffc53d]/50 group-hover:scale-[1.02] shadow-inner">
                               <img
                                 src={restaurantLogo}
                                 alt="Restaurant logo"
                                 className="w-full h-full object-contain"
                               />
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5">
                                 <span className="material-symbols-outlined text-white text-base">edit</span>
                                 <span className="text-[8px] text-white font-bold uppercase tracking-wider">Change Logo</span>
                               </div>
                             </div>
                           ) : (
                             <div className={`w-28 h-28 rounded-2xl bg-black/30 border-2 border-dashed ${t.borderStrong} group-hover:border-[#ffc53d]/50 flex flex-col items-center justify-center text-[#A69984] group-hover:text-[#ffc53d] transition-all duration-300`}>
                               <span className="material-symbols-outlined text-3xl mb-1.5">upload_file</span>
                               <span className="text-[8.5px] font-bold uppercase tracking-wider">Upload Logo</span>
                             </div>
                           )}
                         </div>

                         {restaurantLogo && (
                           <button
                             type="button"
                             onClick={handleLogoRemove}
                             className="text-[9.5px] font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-lg px-3 py-1.5 transition-all cursor-pointer mb-4"
                           >
                             Remove Logo
                           </button>
                         )}

                         <p className={`text-[9px] ${t.textMutedLight} leading-relaxed max-w-[150px] font-medium`}>
                           Recommended format:<br/>
                           <span className="font-semibold text-white/70">512×512px SVG / PNG</span>
                         </p>
                       </div>

                       {/* Right Column: Information Fields */}
                       <div className="md:col-span-8 space-y-5">
                         <div>
                           <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.restaurantName}</label>
                           <input 
                             type="text" 
                             aria-label="Establishment name"
                             value={establishmentName}
                             onChange={(e) => setEstablishmentName(e.target.value)}
                             className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                           />
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                             <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.contactEmail}</label>
                             <input 
                               type="email" 
                               value={contactEmail}
                               onChange={(e) => setContactEmail(e.target.value)}
                               className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                             />
                           </div>
                           <div>
                             <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.taxIdLabel}</label>
                             <input 
                               type="text" 
                               value={taxId}
                               onChange={(e) => setTaxId(e.target.value)}
                               className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                             />
                           </div>
                         </div>

                         <div>
                           <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.businessAddress}</label>
                           <textarea 
                             rows={3}
                             aria-label="Business address"
                             value={businessAddress}
                             onChange={(e) => setBusinessAddress(e.target.value)}
                             className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium resize-none leading-relaxed`}
                           />
                         </div>

                         <div className="flex justify-end pt-2">
                           <button type="button"
                             onClick={() => {
                               localStorage.setItem('dinepos_establishment_name', establishmentName);
                               localStorage.setItem('dinepos_business_address', businessAddress);
                               localStorage.setItem('dinepos_contact_email', contactEmail);
                               localStorage.setItem('dinepos_tax_id', taxId);
                               triggerToast(tr.saveProfile + '!', 'success');
                             }}
                             className={`px-5 py-2.5 ${t.accentBg} ${t.accentText} rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:opacity-90 active:scale-95`}
                           >
                             {tr.saveProfile}
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>

                  {/* Global Aesthetic */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>{tr.globalThemeTitle}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      
                      {/* Theme: Midnight Black */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Midnight Black')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Midnight Black' ? `${t.accentLightBorder} bg-[#ffe2ab]/5` : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#0a0a09] border border-white/10 flex items-center justify-center">
                           <span className="w-2.5 h-2.5 rounded-full bg-[#ffc53d]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${globalAesthetic === 'Midnight Black' ? t.text : t.textMuted} tracking-wide transition-colors`}>Midnight Black</span>
                      </button>

                      {/* Theme: Pristine White */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Pristine White')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Pristine White' ? 'border-[#cfa426] bg-[#cfa426]/5' : 'border-transparent hover:bg-black/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-white border border-black/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#cfa426]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${globalAesthetic === 'Pristine White' ? t.text : t.textMuted} tracking-wide transition-colors`}>Pristine White</span>
                      </button>

                      {/* Theme: Delicious Red */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Delicious Red')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Delicious Red' ? 'border-[#c8102e] bg-[#c8102e]/5' : 'border-transparent hover:bg-black/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#faf9f6] border border-black/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c8102e]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${globalAesthetic === 'Delicious Red' ? t.text : t.textMuted} tracking-wide transition-colors`}>Delicious Red</span>
                      </button>

                      {/* Theme: Bordeaux Reserve */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Bordeaux Reserve')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Bordeaux Reserve' ? 'border-[#e5a09b] bg-[#e5a09b]/5' : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#180a0c] border border-white/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f5aca4]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${globalAesthetic === 'Bordeaux Reserve' ? t.text : t.textMuted} tracking-wide transition-colors`}>Bordeaux Reserve</span>
                      </button>

                      {/* Theme: Deep Teal */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Deep Teal')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Deep Teal' ? 'border-[#48e5ec] bg-[#48e5ec]/5' : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#051112] border border-white/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#48e5ec]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${globalAesthetic === 'Deep Teal' ? t.text : t.textMuted} tracking-wide transition-colors`}>Deep Teal</span>
                      </button>

                      {/* Theme: Custom Palette */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Custom Palette')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Custom Palette' ? 'border-[var(--custom-accent)] bg-[var(--custom-accent)]/5' : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[var(--custom-bg)] border border-[var(--custom-accent)]/20 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--custom-accent)]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${globalAesthetic === 'Custom Palette' ? t.text : t.textMuted} tracking-wide transition-colors`}>Custom Palette</span>
                      </button>

                    </div>

                    {/* Custom Color Configuration Panel */}
                    {globalAesthetic === 'Custom Palette' && (
                      <div className="mt-6 pt-6 border-t border-white/5 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className={`text-xs font-bold ${t.text} uppercase tracking-wider`}>{tr.customThemeConfig}</h4>
                            <p className={`text-[10px] ${t.textMutedDark} mt-1`}>{tr.customThemeDesc}</p>
                          </div>
                          
                          {/* Curated Presets */}
                          <div className="flex flex-wrap gap-2">
                            <button type="button" 
                              onClick={() => {
                                updateCustomBg('#061417');
                                updateCustomCardBg('#0b2024');
                                updateCustomAccent('#4ade80');
                                updateCustomText('#e2f8eb');
                                updateCustomTextMuted('#85ada4');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
                            >
                              Forest Emerald
                            </button>
                            <button type="button" 
                              onClick={() => {
                                updateCustomBg('#0f0d1a');
                                updateCustomCardBg('#161326');
                                updateCustomAccent('#a855f7');
                                updateCustomText('#f3e8ff');
                                updateCustomTextMuted('#9a8fa8');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
                            >
                              Royal Orchid
                            </button>
                            <button type="button" 
                              onClick={() => {
                                updateCustomBg('#1a0f0f');
                                updateCustomCardBg('#261313');
                                updateCustomAccent('#f43f5e');
                                updateCustomText('#ffe4e6');
                                updateCustomTextMuted('#a88f8f');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
                            >
                              Sunset Crimson
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                          {/* Background Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Background</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customBg}
                                onChange={(e) => updateCustomBg(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customBg}
                                onChange={(e) => updateCustomBg(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Card Background Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Card Bg</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customCardBg}
                                onChange={(e) => updateCustomCardBg(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customCardBg}
                                onChange={(e) => updateCustomCardBg(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Accent Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Accent</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customAccent}
                                onChange={(e) => updateCustomAccent(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customAccent}
                                onChange={(e) => updateCustomAccent(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Text Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Text</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customText}
                                onChange={(e) => updateCustomText(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customText}
                                onChange={(e) => updateCustomText(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Muted Text Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Muted Text</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customTextMuted}
                                onChange={(e) => updateCustomTextMuted(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customTextMuted}
                                onChange={(e) => updateCustomTextMuted(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invoice & Receipt Configuration */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-5`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>{tr.receiptOptionsTitle}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {/* Show Restaurant Logo */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showLogo}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showLogoDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowLogo(!showLogo)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showLogo ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showLogo ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Tax ID */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showTaxId}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showTaxIdDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowTaxId(!showTaxId)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showTaxId ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showTaxId ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                      
                      {/* Show Server Name */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showServer}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showServerDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowServerName(!showServerName)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showServerName ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showServerName ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Table Number */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showTable}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showTableDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowTableNumber(!showTableNumber)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showTableNumber ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showTableNumber ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Order Timestamp */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showTimestamp}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showTimestampDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowOrderTimestamp(!showOrderTimestamp)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showOrderTimestamp ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showOrderTimestamp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show QR Code */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showFeedbackQr}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showFeedbackQrDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowQrCode(!showQrCode)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showQrCode ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showQrCode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Social Media */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.showSocial}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showSocialDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowSocialMedia(!showSocialMedia)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showSocialMedia ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showSocialMedia ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Service Charge */}
                      <div className={`flex justify-between items-center ${t.inputBg}/30 p-3.5 border ${t.border} rounded-xl`}>
                        <div>
                          <h4 className={`text-xs font-bold ${t.text} leading-none mb-1`}>{tr.includeServiceCharge}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.includeServiceChargeDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowServiceCharge(!showServiceCharge)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showServiceCharge ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showServiceCharge ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-5 mt-3 space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <div>
                          <h4 className={`text-xs font-bold ${t.text}`}>{tr.showCustomFooter}</h4>
                          <p className={`text-[9.5px] ${t.textMutedDark}`}>{tr.showCustomFooterDesc}</p>
                        </div>
                        <button type="button" onClick={() => setShowCustomFooter(!showCustomFooter)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showCustomFooter ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showCustomFooter ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={thankYouMessage}
                        onChange={(e) => setThankYouMessage(e.target.value)}
                        placeholder="e.g. Thank you for dining with us!"
                        disabled={!showCustomFooter}
                        className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-white/20 focus:outline-none transition-colors font-medium ${!showCustomFooter ? 'opacity-40' : 'focus:border-[#ffe2ab]/40'}`}
                      />
                    </div>
                  </div>

                  {/* Dining Modes Configuration */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-5`}>
                    <div className="flex items-center gap-2 mb-5">
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>restaurant_menu</span>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide select-none`}>{tr.diningModes}</h3>
                    </div>
                    <p className={`text-[11px] ${t.textMuted} -mt-2 leading-relaxed`}>
                      {tr.diningModesDesc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Dine-in Toggle */}
                      <div className={`flex flex-col justify-between ${t.inputBg}/30 p-4 border ${t.border} rounded-xl space-y-3`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#ffe2ab] text-sm">restaurant</span>
                          <h4 className={`text-xs font-bold ${t.text} leading-none`}>Dine-In</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] ${t.textMutedDark} font-medium`}>Active</span>
                          <button
                            type="button"
                            onClick={async () => {
                              const newVal = !dineInEnabled;
                              updateDigitalMenuConfig({ dineInEnabled: newVal });
                              localStorage.setItem('dinepos_dine_in_enabled', String(newVal));
                              window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_dine_in_enabled', newValue: String(newVal) }));
                              await recordActivity(
                                'service_modes_changed',
                                `Toggled Dine-In service mode to ${newVal ? 'Enabled' : 'Disabled'}`,
                                'Settings',
                                { mode: 'Dine-In', enabled: newVal }
                              );
                              triggerToast(newVal ? 'Dine-In enabled!' : 'Dine-In disabled.', 'success');
                            }}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${dineInEnabled ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${dineInEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Takeaway Toggle */}
                      <div className={`flex flex-col justify-between ${t.inputBg}/30 p-4 border ${t.border} rounded-xl space-y-3`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#38bdf8] text-sm">takeout_dining</span>
                          <h4 className={`text-xs font-bold ${t.text} leading-none`}>Take Away</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] ${t.textMutedDark} font-medium`}>Active</span>
                          <button
                            type="button"
                            onClick={async () => {
                              const newVal = !takeawayEnabled;
                              updateDigitalMenuConfig({ takeawayEnabled: newVal });
                              localStorage.setItem('dinepos_takeaway_enabled', String(newVal));
                              window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_takeaway_enabled', newValue: String(newVal) }));
                              await recordActivity(
                                'service_modes_changed',
                                `Toggled Takeaway service mode to ${newVal ? 'Enabled' : 'Disabled'}`,
                                'Settings',
                                { mode: 'Takeaway', enabled: newVal }
                              );
                              triggerToast(newVal ? 'Take Away enabled!' : 'Take Away disabled.', 'success');
                            }}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${takeawayEnabled ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${takeawayEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Delivery Toggle */}
                      <div className={`flex flex-col justify-between ${t.inputBg}/30 p-4 border ${t.border} rounded-xl space-y-3`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#fb923c] text-sm">moped</span>
                          <h4 className={`text-xs font-bold ${t.text} leading-none`}>Delivery</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] ${t.textMutedDark} font-medium`}>Active</span>
                          <button
                            type="button"
                            onClick={async () => {
                              const newVal = !deliveryEnabled;
                              updateDigitalMenuConfig({ deliveryEnabled: newVal });
                              localStorage.setItem('dinepos_delivery_enabled', String(newVal));
                              window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_delivery_enabled', newValue: String(newVal) }));
                              await recordActivity(
                                'service_modes_changed',
                                `Toggled Delivery service mode to ${newVal ? 'Enabled' : 'Disabled'}`,
                                'Settings',
                                { mode: 'Delivery', enabled: newVal }
                              );
                              triggerToast(newVal ? 'Delivery enabled!' : 'Delivery disabled.', 'success');
                            }}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${deliveryEnabled ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${deliveryEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regional & Currency Settings */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>language</span>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide select-none`}>{tr.regionalSettings}</h3>
                    </div>
                    <div className="space-y-6">

                      {/* Language Selection */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>{tr.languageSelect}</label>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { code: 'en', flag: '🇺🇸', label: tr.langEn },
                            { code: 'ja', flag: '🇯🇵', label: tr.langJa },
                            { code: 'zh', flag: '🇨🇳', label: tr.langZh },
                            { code: 'ko', flag: '🇰🇷', label: tr.langKo },
                          ] as const).map(lang => (
                            <button type="button"
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                                language === lang.code
                                  ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                  : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                              }`}
                            >
                              <span className="text-base">{lang.flag}</span>
                              <span>{lang.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>{tr.displayCurrency}</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {([
                            { code: 'USD', symbol: '$', name: 'US Dollar' },
                            { code: 'EUR', symbol: '€', name: 'Euro' },
                            { code: 'GBP', symbol: '£', name: 'Pound' },
                            { code: 'JPY', symbol: '¥', name: 'Yen' },
                            { code: 'CNY', symbol: '¥', name: 'Yuan' },
                            { code: 'KRW', symbol: '₩', name: 'Won' },
                          ] as const).map(cur => (
                            <button type="button"
                              key={cur.code}
                              onClick={() => handleCurrencyChange(cur.code)}
                              className={`flex flex-col items-center py-3 px-2 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                                currency === cur.code
                                  ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                  : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                              }`}
                            >
                              <span className="font-serif text-lg leading-none">{cur.symbol}</span>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider mt-1">{cur.code}</span>
                              <span className="text-[8px] font-medium mt-0.5 opacity-70">{cur.name}</span>
                            </button>
                          ))}
                        </div>
                        <div className={`flex items-center gap-3 mt-3 p-3.5 rounded-xl border ${t.border} ${t.inputBg}/30`}>
                          <span className={`material-symbols-outlined text-base ${t.accent}`}>info</span>
                          <p className={`text-[10px] ${t.textMuted} font-semibold leading-relaxed`}>
                            Currency conversions are approximate. Current rate: 1 USD = {currencyRates[currency].toLocaleString()} {currency}.
                          </p>
                        </div>
                      </div>

                      {/* Tax Basis */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>{tr.taxBasisLabel}</label>
                        <div className="flex gap-3">
                          <button type="button"
                            onClick={() => handleTaxTypeChange('pre-tax')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                              taxType === 'pre-tax'
                                ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            <span>{tr.preTaxLabel}</span>
                          </button>
                          <button type="button"
                            onClick={() => handleTaxTypeChange('post-tax')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                              taxType === 'post-tax'
                                ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm font-bold">check_box</span>
                            <span>{tr.postTaxLabel}</span>
                          </button>
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} font-medium mt-2 leading-relaxed`}>
                          {tr.taxBasisDesc}
                        </p>
                      </div>

                      {/* Dynamic Tax Rates by Dining Option */}
                      <div className={`pt-4 border-t ${t.border}`}>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>
                          {tr.taxRatesByDining}
                        </label>
                        <div className="space-y-4">
                          {/* Dine-in */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className={`material-symbols-outlined ${t.textMuted} text-base`}>local_dining</span>
                              <span className={`text-xs font-semibold ${t.text}`}>Dine-in Tax Rate</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateDineIn}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleTaxRateDineInChange(val);
                                }}
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3 py-2 text-xs text-right ${t.text} font-mono font-medium focus:outline-none focus:border-[#ffe2ab]/40`}
                              />
                              <span className={`text-xs ${t.textMuted} font-bold`}>%</span>
                            </div>
                          </div>

                          {/* Takeaway */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className={`material-symbols-outlined ${t.textMuted} text-base`}>shopping_bag</span>
                              <span className={`text-xs font-semibold ${t.text}`}>Takeaway Tax Rate</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateTakeaway}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleTaxRateTakeawayChange(val);
                                }}
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3 py-2 text-xs text-right ${t.text} font-mono font-medium focus:outline-none focus:border-[#ffe2ab]/40`}
                              />
                              <span className={`text-xs ${t.textMuted} font-bold`}>%</span>
                            </div>
                          </div>

                          {/* Delivery */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className={`material-symbols-outlined ${t.textMuted} text-base`}>moped</span>
                              <span className={`text-xs font-semibold ${t.text}`}>Delivery Tax Rate</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateDelivery}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleTaxRateDeliveryChange(val);
                                }}
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3 py-2 text-xs text-right ${t.text} font-mono font-medium focus:outline-none focus:border-[#ffe2ab]/40`}
                              />
                              <span className={`text-xs ${t.textMuted} font-bold`}>%</span>
                            </div>
                          </div>
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} font-medium mt-3 leading-relaxed`}>
                          Adjust the tax rate percentage applied dynamically depending on the selected dining option at checkout.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Digital Menu Preferences & Exclusions */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <div className="flex items-center gap-2 mb-5">
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>restaurant_menu</span>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide select-none`}>{tr.digitalMenuPrefs}</h3>
                    </div>
                    
                    <div className="space-y-6 font-sans">


                      {/* Tag exclusions */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>
                          {tr.excludedFoodTags}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Seafood', 'GF', 'Veg', 'Non-Veg'].map(tag => {
                            const isExcluded = digitalMenuConfig.excludedTags.includes(tag);
                            return (
                              <button type="button"
                                key={tag}
                                onClick={() => {
                                  const newTags = isExcluded
                                    ? digitalMenuConfig.excludedTags.filter(t => t !== tag)
                                    : [...digitalMenuConfig.excludedTags, tag];
                                  updateDigitalMenuConfig({ excludedTags: newTags });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                  isExcluded 
                                    ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                                    : 'bg-white/5 border border-white/10 text-white/55 hover:text-white'
                                }`}
                              >
                                {isExcluded ? '✓ ' : ''}{tag}
                              </button>
                            );
                          })}
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} mt-1.5 leading-relaxed`}>
                          {tr.excludedFoodTagsDesc}
                        </p>
                      </div>

                      {/* Maximum Display Price */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>
                          {tr.maxDisplayPrice}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={200}
                            step={5}
                            value={digitalMenuConfig.maxPrice}
                            onChange={(e) => updateDigitalMenuConfig({ maxPrice: parseInt(e.target.value) })}
                            className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#ffe2ab]"
                          />
                          <span className={`text-xs font-bold ${t.text} min-w-[3rem] text-right`}>
                            {currency === 'JPY' ? '¥' : '$'}{digitalMenuConfig.maxPrice}
                          </span>
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} mt-1.5 leading-relaxed`}>
                          {tr.maxDisplayPriceDesc}
                        </p>
                      </div>

                      {/* Feature Controls */}
                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider select-none`}>
                          {tr.digitalMenuFeatures}
                        </label>

                        {/* Enable AI Concierge */}
                        <div className="flex items-center justify-between">
                          <div className="max-w-[80%] flex flex-col justify-center">
                            <h4 className={`text-xs font-bold ${t.text}`}>{tr.enableAIConcierge}</h4>
                            <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>{tr.enableAIConciergeDesc}</p>
                          </div>
                          <button type="button" 
                            onClick={() => updateDigitalMenuConfig({ showAIConcierge: !digitalMenuConfig.showAIConcierge })} 
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${digitalMenuConfig.showAIConcierge ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digitalMenuConfig.showAIConcierge ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>

                        {/* Enable Customer Self-Checkout */}
                        <div className="flex items-center justify-between">
                          <div className="max-w-[80%] flex flex-col justify-center">
                            <h4 className={`text-xs font-bold ${t.text}`}>{tr.enableSelfCheckout}</h4>
                            <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>{tr.enableSelfCheckoutDesc}</p>
                          </div>
                          <button type="button" 
                            onClick={() => updateDigitalMenuConfig({ enableSelfCheckout: !digitalMenuConfig.enableSelfCheckout })} 
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${digitalMenuConfig.enableSelfCheckout ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digitalMenuConfig.enableSelfCheckout ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>



                        {/* Time-Based Menu System */}
                        <div className="border-t border-white/5 pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="max-w-[80%] flex flex-col justify-center">
                              <h4 className={`text-xs font-bold ${t.text}`}>{tr.timeBasedMenu}</h4>
                              <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>{tr.timeBasedMenuDesc}</p>
                            </div>
                            <button type="button" 
                              onClick={() => updateDigitalMenuConfig({ enableTimeBasedMenu: !digitalMenuConfig.enableTimeBasedMenu })} 
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${digitalMenuConfig.enableTimeBasedMenu ? t.accentBg : 'bg-white/20'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digitalMenuConfig.enableTimeBasedMenu ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                          </div>

                          {!digitalMenuConfig.enableTimeBasedMenu && (
                            <p className={`text-[9.5px] ${t.textMutedDark} mt-1 leading-relaxed italic`}>
                              {tr.timeBasedMenuDisabledNote}
                            </p>
                          )}

                          {digitalMenuConfig.enableTimeBasedMenu && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-3 mt-2">
                              {/* Lunch Hours */}
                              <div className="flex items-center justify-between gap-4">
                                <span className={`text-xs font-semibold ${t.text} shrink-0 flex items-center gap-1.5`}>
                                  <span>🌤️</span> {tr.lunchMenuTime}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="time"
                                    aria-label="Lunch Start Time"
                                    value={digitalMenuConfig.lunchStart || '11:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ lunchStart: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                  <span className={`text-[10px] ${t.textMutedDark}`}>to</span>
                                  <input 
                                    type="time"
                                    aria-label="Lunch End Time"
                                    value={digitalMenuConfig.lunchEnd || '15:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ lunchEnd: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                </div>
                              </div>

                              {/* Dinner Hours */}
                              <div className="flex items-center justify-between gap-4">
                                <span className={`text-xs font-semibold ${t.text} shrink-0 flex items-center gap-1.5`}>
                                  <span>🌙</span> {tr.dinnerMenuTime}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="time"
                                    aria-label="Dinner Start Time"
                                    value={digitalMenuConfig.dinnerStart || '18:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ dinnerStart: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                  <span className={`text-[10px] ${t.textMutedDark}`}>to</span>
                                  <input 
                                    type="time"
                                    aria-label="Dinner End Time"
                                    value={digitalMenuConfig.dinnerEnd || '23:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ dinnerEnd: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                </div>
                              </div>

                              <p className={`text-[9px] ${t.textMutedLight} pt-1 leading-relaxed border-t border-white/5`}>
                                💡 {tr.timeBasedMenuInfoNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right Column (Live Preview Simulator) - Span 5 */}
                <div className="lg:col-span-5 lg:sticky lg:top-[120px] space-y-6 select-none">
                  
                  {/* Live Preview Bar */}
                  <div className="flex justify-between items-center px-1">
                    <h3 className={`font-serif text-base font-bold ${t.accent} uppercase tracking-wider`}>{tr.livePreview}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
                      {tr.realtimeSync}
                    </div>
                  </div>

                  {/* Dark Simulated Receipt card wrapper */}
                  <div className={`${t.cardBg} rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[480px]`}>
                    <div className="w-full max-w-[280px] bg-[#1c1b1a] text-[#A69984] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col justify-between font-mono text-[9.5px] leading-relaxed">
                      
                      {/* Brand & Logo Header */}
                      <div className="text-center space-y-1.5 mb-3">
                        {showLogo && (
                          <div className="flex justify-center select-none mb-1">
                            {restaurantLogo ? (
                              <img
                                src={restaurantLogo}
                                alt="Restaurant logo"
                                className="w-9 h-9 rounded-lg object-contain border border-white/10 bg-black/30 p-0.5"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[#ffe2ab]">
                                <span className="material-symbols-outlined text-[13px] font-black">flatware</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-white font-extrabold uppercase text-[11px] tracking-wider truncate">
                          {establishmentName || 'DinePosAi'}
                        </div>
                        
                        <div className="text-[8px] text-[#A69984]/50 font-semibold max-w-[180px] mx-auto break-words leading-tight">
                          {businessAddress || '72 Culinary Avenue, Gourmet District'}
                        </div>
                      </div>

                      {/* Metadata dotted block */}
                      {(showTableNumber || showServerName || showOrderTimestamp) && (
                        <div className="border-y border-dashed border-white/10 py-2.5 my-2.5 text-[8.5px] text-[#A69984]/65">
                          <div className="flex justify-between">
                            <div>
                              {showTableNumber && <div className="text-white font-bold">TABLE: T-14</div>}
                              {showOrderTimestamp && <div className="text-[8px] mt-0.5">06/04/2026 09:48</div>}
                            </div>
                            <div className="text-right">
                              {showServerName && <div>SERVER: JULIAN B.</div>}
                              <div className="text-[8px] text-white/45 mt-0.5">Order #2345</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items check list */}
                      <div className="space-y-2 py-1 select-none">
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/80">2 Truffle Wagyu Sliders</span>
                          <span className="text-white/95 font-bold font-mono">{formatCurrency(48)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/80">1 Lobster Bisque</span>
                          <span className="text-white/95 font-bold font-mono">{formatCurrency(18)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/80">2 Vintage Cabernet (G)</span>
                          <span className="text-white/95 font-bold font-mono">{formatCurrency(34)}</span>
                        </div>
                      </div>

                      {/* Subtotal breakdowns */}
                      <div className="border-t border-white/5 pt-2.5 mt-2.5 space-y-1 text-[8.5px] text-[#A69984]/60">
                        <div className="flex justify-between">
                          <span>{taxType === 'post-tax' ? tr.subtotalInclusive : tr.subtotal}</span>
                          <span>{formatCurrency(subtotalVal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{taxType === 'post-tax' ? tr.includedTax : `${tr.tax} (8%)`}</span>
                          <span>{formatCurrency(taxVal)}</span>
                        </div>
                        {showServiceCharge && (
                          <div className="flex justify-between">
                            <span>{tr.serviceCharge}</span>
                            <span>{formatCurrency(10)}</span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="border-t border-dashed border-white/10 pt-2.5 mt-2 flex justify-between items-baseline">
                        <span className="text-white font-extrabold text-[9px]">{tr.grandTotal}</span>
                        <span className="text-[#ffe2ab] text-[12px] font-bold font-mono">
                          {formatCurrency(totalVal)}
                        </span>
                      </div>

                      {/* Footer QR/Text message */}
                      <div className="text-center mt-5 space-y-3">
                        {showCustomFooter && thankYouMessage && (
                          <div className="text-[8px] italic text-[#A69984]/50 font-sans max-w-[200px] mx-auto">
                            "{thankYouMessage}"
                          </div>
                        )}

                        {showQrCode && (
                          <div className="flex flex-col items-center gap-1 select-none pt-1">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#A69984]/50">
                              <rect x="1" y="1" width="6" height="6" stroke="currentColor" rx="0.5"/>
                              <rect x="2.5" y="2.5" width="3" height="3" fill="currentColor"/>
                              <rect x="17" y="1" width="6" height="6" stroke="currentColor" rx="0.5"/>
                              <rect x="18.5" y="2.5" width="3" height="3" fill="currentColor"/>
                              <rect x="1" y="17" width="6" height="6" stroke="currentColor" rx="0.5"/>
                              <rect x="2.5" y="18.5" width="3" height="3" fill="currentColor"/>
                              <rect x="9" y="1" width="2" height="2" fill="currentColor"/>
                              <rect x="13" y="2" width="2" height="1" fill="currentColor"/>
                              <rect x="9" y="9" width="3" height="3" fill="currentColor"/>
                              <rect x="17" y="9" width="2" height="2" fill="currentColor"/>
                              <rect x="9" y="17" width="2" height="2" fill="currentColor"/>
                              <rect x="13" y="18" width="2" height="2" fill="currentColor"/>
                              <rect x="18" y="17" width="4" height="4" fill="currentColor"/>
                            </svg>
                            <span className="text-[7px] font-bold text-[#ffe2ab]/60 uppercase tracking-widest font-sans">Scan for Survey</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>


                </div>

              </div>
            </div>

    </>
  );
}
