'use client';

import React, { useState, useEffect } from 'react';
import { isDemoTenant } from '@/utils/api';
import { PrintableReceipt } from './PrintableReceipt';
import { usePrinter } from '../../../app/printerContext';

interface ReceiptsTabProps {
  t: any;
  tr: any;
  currency: string;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  establishmentName: string;
  setEstablishmentName: (val: string) => void;
  businessAddress: string;
  setBusinessAddress: (val: string) => void;
  contactEmail: string;
  taxId: string;
  setTaxId: (val: string) => void;
  restaurantLogo: string;
  showTableNumber: boolean;
  setShowTableNumber: (val: boolean) => void;
  showServerName: boolean;
  setShowServerName: (val: boolean) => void;
  showOrderTimestamp?: boolean;
  setShowOrderTimestamp?: (val: boolean) => void;
  showServiceCharge?: boolean;
  setShowServiceCharge?: (val: boolean) => void;
  serviceChargeRate?: number;
  setServiceChargeRate?: (val: number) => void;
  showDiscount?: boolean;
  setShowDiscount?: (val: boolean) => void;
  discountType?: 'percent' | 'fixed';
  setDiscountType?: (val: 'percent' | 'fixed') => void;
  discountValue?: number;
  setDiscountValue?: (val: number) => void;
  showSocialMedia?: boolean;
  setShowSocialMedia?: (val: boolean) => void;
  socialLinks?: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
  setSocialLinks?: (links: { facebook: string; instagram: string; tiktok: string; youtube: string; }) => void;
  taxRegistrationType?: 'VAT' | 'PAN';
  setTaxRegistrationType?: (val: 'VAT' | 'PAN') => void;
}

export default function ReceiptsTab({
  t,
  tr,
  currency,
  triggerToast,
  establishmentName,
  setEstablishmentName,
  businessAddress,
  setBusinessAddress,
  contactEmail,
  taxId,
  setTaxId,
  restaurantLogo,
  showTableNumber,
  setShowTableNumber,
  showServerName,
  setShowServerName,
  showOrderTimestamp,
  setShowOrderTimestamp,
  showServiceCharge: propShowServiceCharge,
  setShowServiceCharge: propSetShowServiceCharge,
  serviceChargeRate: propServiceChargeRate,
  setServiceChargeRate: propSetServiceChargeRate,
  showDiscount: propShowDiscount,
  setShowDiscount: propSetShowDiscount,
  discountType: propDiscountType,
  setDiscountType: propSetDiscountType,
  discountValue: propDiscountValue,
  setDiscountValue: propSetDiscountValue,
  showSocialMedia: propShowSocialMedia,
  setShowSocialMedia: propSetShowSocialMedia,
  socialLinks: propSocialLinks,
  setSocialLinks: propSetSocialLinks,
  taxRegistrationType: propTaxRegistrationType,
  setTaxRegistrationType: propSetTaxRegistrationType
}: ReceiptsTabProps) {
  const [showLogo, setShowLogo] = useState(true);
  const [showTaxId, setShowTaxId] = useState(true);
  const [receiptFooterText, setReceiptFooterText] = useState('Thank you for dining with us!');
  const [receiptHeaderMessage, setReceiptHeaderMessage] = useState('Welcome to our establishment');
  const [customReceiptWidth, setCustomReceiptWidth] = useState('80mm');
  const [internalShowServiceCharge, setInternalShowServiceCharge] = useState(true);
  const [internalServiceChargeRate, setInternalServiceChargeRate] = useState(10);
  const [internalShowDiscount, setInternalShowDiscount] = useState(true);
  const [internalDiscountType, setInternalDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [internalDiscountValue, setInternalDiscountValue] = useState(10);
  const [showQrCode, setShowQrCode] = useState(true);

  const showServiceCharge = propShowServiceCharge !== undefined ? propShowServiceCharge : internalShowServiceCharge;
  const setShowServiceCharge = propSetShowServiceCharge || setInternalShowServiceCharge;
  const serviceChargeRate = propServiceChargeRate !== undefined ? propServiceChargeRate : internalServiceChargeRate;
  const setServiceChargeRate = propSetServiceChargeRate || setInternalServiceChargeRate;

  const showDiscount = propShowDiscount !== undefined ? propShowDiscount : internalShowDiscount;
  const setShowDiscount = propSetShowDiscount || setInternalShowDiscount;
  const discountType = propDiscountType !== undefined ? propDiscountType : internalDiscountType;
  const setDiscountType = propSetDiscountType || setInternalDiscountType;
  const discountValue = propDiscountValue !== undefined ? propDiscountValue : internalDiscountValue;
  const setDiscountValue = propSetDiscountValue || setInternalDiscountValue;

  const [internalShowSocialMedia, setInternalShowSocialMedia] = useState(false);
  const [internalSocialLinks, setInternalSocialLinks] = useState({
    facebook: 'facebook.com/dineposai',
    instagram: 'instagram.com/dineposai',
    tiktok: 'tiktok.com/@dineposai',
    youtube: 'youtube.com/@dineposai'
  });
  const showSocialMedia = propShowSocialMedia !== undefined ? propShowSocialMedia : internalShowSocialMedia;
  const setShowSocialMedia = propSetShowSocialMedia || setInternalShowSocialMedia;
  const socialLinks = propSocialLinks !== undefined ? propSocialLinks : internalSocialLinks;
  const setSocialLinks = propSetSocialLinks || setInternalSocialLinks;

  const [internalTaxRegType, setInternalTaxRegType] = useState<'VAT' | 'PAN'>('VAT');
  const taxRegistrationType = propTaxRegistrationType !== undefined ? propTaxRegistrationType : internalTaxRegType;
  const setTaxRegistrationType = propSetTaxRegistrationType || setInternalTaxRegType;

  const { config: printerConfig, status: printerStatus, printReceipt } = usePrinter();

  const handleTestPrintFromPreview = async () => {
    // Check printer connection status per printing architecture
    const isPrinterAvailable = printerStatus === 'connected' || printerConfig?.type === 'browser';

    if (!isPrinterAvailable) {
      triggerToast('No receipt printer connected. Please connect your printer first.', 'info');
      return;
    }

    try {
      await printReceipt({
        tableNumber: 'T-14',
        orderId: '2345',
        items: [
          { name: 'Truffle Wagyu Sliders', quantity: 2, price: 24.00 },
          { name: 'Lobster Bisque', quantity: 1, price: 18.00 },
          { name: 'Vintage Cabernet (G)', quantity: 2, price: 17.00 }
        ],
        subtotal: 100.00,
        taxRate: 0.08,
        tax: 8.00,
        taxType: 'pre-tax',
        serviceCharge: showServiceCharge ? (100.00 * (serviceChargeRate / 100)) : 0,
        total: totalVal,
        isPaid: true,
        paymentMethod: 'Credit Card'
      });
      triggerToast('Test receipt sent to printer!', 'success');
    } catch (err: any) {
      triggerToast('No receipt printer connected. Please connect your printer first.', 'info');
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedShowLogo = localStorage.getItem('dinepos_receipt_show_logo');
      if (savedShowLogo === 'false') setShowLogo(false);
      
      const savedShowTaxId = localStorage.getItem('dinepos_receipt_show_tax_id');
      if (savedShowTaxId === 'false') setShowTaxId(false);
      
      const savedFooter = localStorage.getItem('dinepos_receipt_footer');
      if (savedFooter) setReceiptFooterText(savedFooter);
      
      const savedHeader = localStorage.getItem('dinepos_receipt_header');
      if (savedHeader) setReceiptHeaderMessage(savedHeader);
      
      const savedWidth = localStorage.getItem('dinepos_receipt_width');
      if (savedWidth) setCustomReceiptWidth(savedWidth);
    }
  }, []);

  // Save on state change and dispatch StorageEvent
  const updateShowLogo = (val: boolean) => {
    setShowLogo(val);
    localStorage.setItem('dinepos_receipt_show_logo', String(val));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dinepos_receipt_show_logo',
        newValue: String(val)
      }));
    }
  };

  const updateShowTaxId = (val: boolean) => {
    setShowTaxId(val);
    localStorage.setItem('dinepos_receipt_show_tax_id', String(val));
  };

  const updateShowTimestamp = (val: boolean) => {
    setShowOrderTimestamp?.(val);
    localStorage.setItem('dinepos_receipt_show_timestamp', String(val));
  };

  const updateFooter = (val: string) => {
    setReceiptFooterText(val);
    localStorage.setItem('dinepos_receipt_footer', val);
  };

  const updateHeader = (val: string) => {
    setReceiptHeaderMessage(val);
    localStorage.setItem('dinepos_receipt_header', val);
  };

  const updateWidth = (val: string) => {
    setCustomReceiptWidth(val);
    localStorage.setItem('dinepos_receipt_width', val);
  };

  const currencySymbols: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' };
  const currencyRates: Record<string, number> = { USD: 1, JPY: 150, EUR: 0.92, GBP: 0.79, CNY: 7.24, KRW: 1340 };
  
  const formatCurrency = (val: number) => {
    const rate = currencyRates[currency] || 1;
    const sym = currencySymbols[currency] || '$';
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(converted).toLocaleString()}`;
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Mock values for receipt preview
  const subtotalVal = 100.00;
  const taxVal = 8.00;
  const serviceChargeVal = showServiceCharge ? (subtotalVal * (serviceChargeRate / 100)) : 0;
  const discountVal = showDiscount ? (discountType === 'percent' ? (subtotalVal * (discountValue / 100)) : discountValue) : 0;
  const totalVal = subtotalVal + taxVal + serviceChargeVal - discountVal;

  return (
    <>
      {/* RECEIPTS TAB JSX */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Preview Receipt simulation (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center select-none pl-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-[#ffe2ab] uppercase tracking-wider">Live Preview</h3>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-[#ffe2ab] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffe2ab] motion-safe:animate-pulse"></span>
                      Sync Active
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestPrintFromPreview}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab]/20 text-[#ffe2ab] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    Test Print
                  </button>
                </div>

                {/* Dark Simulated Receipt card wrapper */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-6 shadow-xl flex justify-center items-center min-h-[500px]">
                  <PrintableReceipt
                    variant="dark-preview"
                    establishmentName={establishmentName}
                    businessAddress={businessAddress}
                    contactEmail={contactEmail}
                    restaurantLogo={restaurantLogo}
                    showLogo={showLogo}
                    taxId={taxId}
                    taxRegistrationType={taxRegistrationType}
                    showTaxId={showTaxId}
                    showTableNumber={showTableNumber}
                    showServerName={showServerName}
                    showOrderTimestamp={showOrderTimestamp}
                    showServiceCharge={showServiceCharge}
                    serviceChargeRate={serviceChargeRate}
                    showDiscount={showDiscount}
                    discountType={discountType}
                    discountValue={discountValue}
                    currency={currency}
                    thankYouMessage={receiptFooterText}
                    showQrCode={showQrCode}
                    showSocialMedia={showSocialMedia}
                    socialLinks={socialLinks}
                  />
                </div>
              </div>

              {/* Right Column: Configuration Cards (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Configuration 1: Brand & Header */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Brand & Header</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Establishment Name</label>
                        <input 
                          type="text" 
                          aria-label="Establishment name"
                          value={establishmentName}
                          onChange={(e) => setEstablishmentName(e.target.value)}
                          placeholder="DinePosAi"
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Business Address</label>
                        <input 
                          type="text" 
                          aria-label="Business address"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="Address..."
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl mt-2">
                      <div className="max-w-[70%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Show Logo</h4>
                        <p className="text-[10.5px] text-[#A69984]/50 font-semibold leading-relaxed">
                          Include restaurant logo at the top
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowLogo(!showLogo)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showLogo ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showLogo ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Configuration 2: Operational Details */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Operational Details</h3>
                  <div className="space-y-4 font-sans select-none">
                    
                    {/* Table Number Toggle */}
                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl">
                      <div className="max-w-[75%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Table Number</h4>
                      </div>
                      <button type="button"
                        onClick={() => setShowTableNumber(!showTableNumber)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showTableNumber ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showTableNumber ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Server Name Toggle */}
                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl">
                      <div className="max-w-[75%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Server Name</h4>
                      </div>
                      <button type="button"
                        onClick={() => setShowServerName(!showServerName)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showServerName ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showServerName ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Timestamp Toggle */}
                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl">
                      <div className="max-w-[75%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Order Timestamp</h4>
                      </div>
                      <button type="button"
                        onClick={() => updateShowTimestamp(!showOrderTimestamp)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showOrderTimestamp ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showOrderTimestamp ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Social Media Handles & Links Configuration Card */}
                    <div className={`p-5 border border-white/10 rounded-2xl space-y-4 transition-all duration-300 ${showSocialMedia ? 'bg-[#0e0e0d]/50 shadow-lg' : 'bg-black/30 border-white/5 opacity-50'}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#ffe2ab]">share</span>
                            Social Media Handles & Links
                          </h4>
                          <p className="text-[10.5px] text-[#A69984]/70 font-medium mt-1 leading-snug">
                            Display digital social links on receipts and online storefronts
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowSocialMedia(!showSocialMedia)} 
                          className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center shrink-0 mt-0.5 ${showSocialMedia ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 ${showSocialMedia ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Active / Dead-place Inputs Container */}
                      <div className={`pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all ${!showSocialMedia ? 'opacity-40 pointer-events-none' : ''}`}>
                        {/* Facebook */}
                        <div className="space-y-1">
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                            Facebook Link / Handle
                          </label>
                          <input 
                            type="text"
                            value={socialLinks.facebook}
                            onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                            disabled={!showSocialMedia}
                            placeholder="facebook.com/yourpage"
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-medium text-white focus:outline-none focus:border-[#ffe2ab]/40 disabled:cursor-not-allowed placeholder-white/20"
                          />
                        </div>

                        {/* Instagram */}
                        <div className="space-y-1">
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                            Instagram Link / Handle
                          </label>
                          <input 
                            type="text"
                            value={socialLinks.instagram}
                            onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                            disabled={!showSocialMedia}
                            placeholder="instagram.com/yourhandle"
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-medium text-white focus:outline-none focus:border-[#ffe2ab]/40 disabled:cursor-not-allowed placeholder-white/20"
                          />
                        </div>

                        {/* TikTok */}
                        <div className="space-y-1">
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                            TikTok Link / Handle
                          </label>
                          <input 
                            type="text"
                            value={socialLinks.tiktok}
                            onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                            disabled={!showSocialMedia}
                            placeholder="tiktok.com/@yourhandle"
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-medium text-white focus:outline-none focus:border-[#ffe2ab]/40 disabled:cursor-not-allowed placeholder-white/20"
                          />
                        </div>

                        {/* YouTube */}
                        <div className="space-y-1">
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                            YouTube Link / Handle
                          </label>
                          <input 
                            type="text"
                            value={socialLinks.youtube}
                            onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                            disabled={!showSocialMedia}
                            placeholder="youtube.com/@yourchannel"
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-medium text-white focus:outline-none focus:border-[#ffe2ab]/40 disabled:cursor-not-allowed placeholder-white/20"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Configuration 3: Billing & Tax */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Billing & Tax</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider">
                          {taxRegistrationType === 'VAT' ? 'VAT Registration Number' : 'PAN Registration Number'}
                        </label>
                        <div className="inline-flex rounded-lg overflow-hidden border border-white/10 p-0.5 bg-[#0e0e0d]">
                          <button
                            type="button"
                            onClick={() => setTaxRegistrationType && setTaxRegistrationType('VAT')}
                            className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${taxRegistrationType === 'VAT' ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white/60 hover:text-white'}`}
                          >
                            VAT
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaxRegistrationType && setTaxRegistrationType('PAN')}
                            className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${taxRegistrationType === 'PAN' ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white/60 hover:text-white'}`}
                          >
                            PAN
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder={taxRegistrationType === 'VAT' ? 'e.g. VAT No: 301234567' : 'e.g. PAN No: 601234567'}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono uppercase"
                      />
                    </div>
                    
                    {/* Service Charge Configuration Card */}
                    <div className={`p-5 border border-white/10 rounded-2xl space-y-4 transition-all duration-300 ${showServiceCharge ? 'bg-[#0e0e0d]/50 shadow-lg' : 'bg-black/30 border-white/5 opacity-50'}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#ffe2ab]">percent</span>
                            Service Charge (Gratuity)
                          </h4>
                          <p className="text-[10.5px] text-[#A69984]/70 font-medium mt-1 leading-snug">
                            Automatically calculate & print service charge on receipts
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowServiceCharge(!showServiceCharge)} 
                          className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center shrink-0 mt-0.5 ${showServiceCharge ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 ${showServiceCharge ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Service Charge Input Field (Disabled / Dead Place when OFF) */}
                      <div className={`pt-3 border-t border-white/5 space-y-2 transition-all ${!showServiceCharge ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="flex justify-between items-baseline">
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                            Service Charge Rate
                          </label>
                          <span className="text-[10px] text-white/40 font-medium">Applied to subtotal</span>
                        </div>
                        <div className="relative flex items-center w-full">
                          <span className="absolute left-3.5 text-xs font-bold text-[#ffe2ab] select-none pointer-events-none">%</span>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={serviceChargeRate}
                            onChange={(e) => setServiceChargeRate(parseFloat(e.target.value) || 0)}
                            disabled={!showServiceCharge}
                            placeholder="10"
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-[#ffe2ab]/40 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Promotional Discount Configuration Card */}
                    <div className={`p-5 border border-white/10 rounded-2xl space-y-4 transition-all duration-300 ${showDiscount ? 'bg-[#0e0e0d]/50 shadow-lg' : 'bg-black/30 border-white/5 opacity-50'}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-emerald-400">local_offer</span>
                            Promotional Discount
                          </h4>
                          <p className="text-[10.5px] text-[#A69984]/70 font-medium mt-1 leading-snug">
                            Enable promotional discount line on checkout & receipts
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowDiscount(!showDiscount)} 
                          className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center shrink-0 mt-0.5 ${showDiscount ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 ${showDiscount ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Active / Dead-place Controls Container */}
                      <div className={`pt-3 border-t border-white/5 space-y-4 transition-all ${!showDiscount ? 'opacity-40 pointer-events-none' : ''}`}>
                        
                        {/* Mode Segmented Control Grid */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                              Calculation Mode
                            </label>
                            <span className="text-[10px] text-white/40 font-medium">Type</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0e0e0d] border border-white/10 rounded-xl w-full">
                            <button
                              type="button"
                              onClick={() => setDiscountType('percent')}
                              disabled={!showDiscount}
                              className={`py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all text-center cursor-pointer ${discountType === 'percent' && showDiscount ? 'bg-[#ffe2ab] text-[#402d00] shadow-sm' : 'text-white/60 hover:text-white disabled:cursor-not-allowed'}`}
                            >
                              % Percentage
                            </button>
                            <button
                              type="button"
                              onClick={() => setDiscountType('fixed')}
                              disabled={!showDiscount}
                              className={`py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all text-center cursor-pointer ${discountType === 'fixed' && showDiscount ? 'bg-[#ffe2ab] text-[#402d00] shadow-sm' : 'text-white/60 hover:text-white disabled:cursor-not-allowed'}`}
                            >
                              $ Fixed Amount
                            </button>
                          </div>
                        </div>

                        {/* Discount Value Input Block */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                              Discount Value
                            </label>
                            <span className="text-[10px] text-white/40 font-medium">
                              {discountType === 'percent' ? 'Deduct % from subtotal' : 'Fixed $ amount'}
                            </span>
                          </div>

                          <div className="relative flex items-center w-full">
                            <span className="absolute left-3.5 text-xs font-bold text-[#ffe2ab] select-none pointer-events-none">
                              {discountType === 'percent' ? '%' : '$'}
                            </span>
                            <input 
                              type="number"
                              min="0"
                              max={discountType === 'percent' ? "100" : "10000"}
                              value={discountValue}
                              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                              disabled={!showDiscount}
                              placeholder="10"
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-[#ffe2ab]/40 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration 4: Footer Customization */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Footer Customization</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Custom Thank You Message</label>
                      <textarea 
                        rows={3}
                        value={receiptFooterText}
                        onChange={(e) => updateFooter(e.target.value)}
                        placeholder="Type message..."
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl mt-2">
                      <div className="max-w-[70%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Feedback QR Code</h4>
                        <p className="text-[10.5px] text-[#A69984]/50 font-semibold leading-relaxed">
                          Link customers to digital survey
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showQrCode ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showQrCode ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

    </>
  );
}
