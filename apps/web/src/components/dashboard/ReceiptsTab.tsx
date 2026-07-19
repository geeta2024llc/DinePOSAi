'use client';

import React, { useState, useEffect } from 'react';
import { isDemoTenant } from '@/utils/api';

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
  showOrderTimestamp: boolean;
  setShowOrderTimestamp: (val: boolean) => void;
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
  setShowOrderTimestamp
}: ReceiptsTabProps) {
  const [showLogo, setShowLogo] = useState(true);
  const [showTaxId, setShowTaxId] = useState(true);
  const [receiptFooterText, setReceiptFooterText] = useState('Thank you for dining with us!');
  const [receiptHeaderMessage, setReceiptHeaderMessage] = useState('Welcome to our establishment');
  const [customReceiptWidth, setCustomReceiptWidth] = useState('80mm');
  const [showServiceCharge, setShowServiceCharge] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);

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
    setShowOrderTimestamp(val);
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
  const totalVal = subtotalVal + taxVal + (showServiceCharge ? 10.00 : 0.00);

  return (
    <>
      {/* RECEIPTS TAB JSX */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Preview Receipt simulation (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center select-none pl-1">
                  <h3 className="font-serif text-base font-bold text-[#ffe2ab] uppercase tracking-wider">Live Preview</h3>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#ffe2ab] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffe2ab] motion-safe:animate-pulse"></span>
                    Sync Active
                  </div>
                </div>

                {/* Dark Simulated Receipt card wrapper */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-6 shadow-xl flex justify-center items-center min-h-[500px]">
                  <div className="w-full max-w-[280px] bg-[#1c1b1a] text-[#A69984] border border-white/5 rounded-xl p-6 shadow-lg flex flex-col justify-between font-mono text-[10px] leading-relaxed">
                    
                    {/* Brand & Logo Header */}
                    <div className="text-center space-y-2 mb-4">
                      {showLogo && (
                        <div className="flex justify-center select-none">
                          {restaurantLogo ? (
                            <img
                              src={restaurantLogo}
                              alt="Restaurant logo"
                              className="w-10 h-10 rounded-lg object-contain border border-white/10 bg-black/30 p-0.5"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[#ffe2ab]">
                              <span className="material-symbols-outlined text-sm font-black">flatware</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-white font-extrabold uppercase text-xs tracking-wider select-none">
                        {establishmentName || 'DinePosAi'}
                      </div>
                      
                      <div className="text-[8.5px] text-[#A69984]/60 font-semibold max-w-[180px] mx-auto break-words leading-tight">
                        {businessAddress || '72 Culinary Avenue, Gourmet District, Metropolis'}
                      </div>
                    </div>

                    {/* Metadata dotted block */}
                    {(showTableNumber || showServerName || showOrderTimestamp) && (
                      <div className="border-y border-dashed border-white/10 py-2.5 my-3 text-[9px] text-[#A69984]/70 select-none">
                        <div className="flex justify-between">
                          <div>
                            {showTableNumber && <div className="text-white font-bold">TABLE: T-14</div>}
                            {showOrderTimestamp && <div className="text-[8.5px] mt-0.5">06/03/2026 15:32</div>}
                          </div>
                          <div className="text-right">
                            {showServerName && <div>SERVER: JULIAN B.</div>}
                            <div className="text-[8.5px] text-white/55 mt-0.5">Order #2345</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items check list */}
                    <div className="space-y-2.5 py-1 select-none">
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/90">2 Truffle Wagyu Sliders</span>
                        <span className="text-white/95 font-bold">$48.00</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/90">1 Lobster Bisque</span>
                        <span className="text-white/95 font-bold">$18.00</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/90">2 Vintage Cabernet (G)</span>
                        <span className="text-white/95 font-bold">$34.00</span>
                      </div>
                    </div>

                    {/* Subtotal breakdowns */}
                    <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5 text-[9px] text-[#A69984]/65 select-none">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>$100.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%)</span>
                        <span>$8.00</span>
                      </div>
                      {showServiceCharge && (
                        <div className="flex justify-between">
                          <span>Service Charge (10%)</span>
                          <span>$10.00</span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-dashed border-white/10 pt-3 mt-2 flex justify-between items-baseline select-none">
                      <span className="text-white font-extrabold">TOTAL</span>
                      <span className="text-[#ffe2ab] text-[13px] font-bold font-mono">
                        ${totalVal.toFixed(2)}
                      </span>
                    </div>

                    {/* Footer barcode/QR/Text block */}
                    <div className="text-center mt-6 space-y-4">
                      {receiptFooterText && (
                        <div className="text-[8.5px] italic text-[#A69984]/60 break-words font-sans max-w-[200px] mx-auto">
                          "{receiptFooterText}"
                        </div>
                      )}

                      {showQrCode && (
                        <div className="flex flex-col items-center gap-1.5 select-none pt-1">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#A69984]/60">
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
                          <span className="text-[7.5px] font-bold text-[#ffe2ab]/70 uppercase tracking-widest font-sans">Scan for Feedback</span>
                        </div>
                      )}
                    </div>

                  </div>
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
                        onClick={() => setShowOrderTimestamp(!showOrderTimestamp)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showOrderTimestamp ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showOrderTimestamp ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Configuration 3: Billing & Tax */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Billing & Tax</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Tax ID / VAT Number</label>
                      <input 
                        type="text" 
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="GB123456789"
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono uppercase"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl mt-2">
                      <div className="max-w-[70%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Show Service Charge</h4>
                        <p className="text-[10.5px] text-[#A69984]/50 font-semibold leading-relaxed">
                          Include gratuity line automatically
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowServiceCharge(!showServiceCharge)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showServiceCharge ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showServiceCharge ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
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
