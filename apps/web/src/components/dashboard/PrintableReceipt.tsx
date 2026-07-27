'use client';

import React from 'react';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  notes?: string;
}

export interface PrintableReceiptProps {
  // Brand & Business Details
  establishmentName?: string;
  businessAddress?: string;
  contactEmail?: string;
  restaurantLogo?: string;
  showLogo?: boolean;

  // Tax & Registration Details
  taxId?: string;
  taxRegistrationType?: 'VAT' | 'PAN';
  showTaxId?: boolean;

  // Order Details
  tableNumber?: string | number;
  showTableNumber?: boolean;
  serverName?: string;
  showServerName?: boolean;
  orderTimestamp?: string;
  showOrderTimestamp?: boolean;
  orderId?: string;

  // Items & Calculations
  items?: ReceiptItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  taxType?: 'pre-tax' | 'post-tax';
  showServiceCharge?: boolean;
  serviceChargeRate?: number;
  serviceChargeAmount?: number;
  showDiscount?: boolean;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  grandTotal?: number;
  currency?: string;

  // Footer & Marketing
  paymentMethod?: string;
  isPaid?: boolean;
  thankYouMessage?: string;
  showCustomFooter?: boolean;
  customFooterText?: string;
  showSocialMedia?: boolean;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  showQrCode?: boolean;
  qrCodeUrl?: string;

  // Rendering Options
  variant?: 'dark-preview' | 'light-print';
  className?: string;
}

export const defaultReceiptItems: ReceiptItem[] = [
  { name: 'Truffle Wagyu Sliders', quantity: 2, price: 24.00 },
  { name: 'Lobster Bisque', quantity: 1, price: 18.00 },
  { name: 'Vintage Cabernet (G)', quantity: 2, price: 17.00 }
];

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  establishmentName = 'DinePosAi',
  businessAddress = '72 Culinary Avenue, Gourmet District',
  restaurantLogo = '',
  showLogo = true,

  taxId = '301234567',
  taxRegistrationType = 'VAT',
  showTaxId = true,

  tableNumber = 'T-14',
  showTableNumber = true,
  serverName = 'JULIAN B.',
  showServerName = true,
  orderTimestamp = '06/04/2026 09:48',
  showOrderTimestamp = true,
  orderId = '2345',

  items = defaultReceiptItems,
  subtotal,
  taxRate = 8,
  taxAmount,
  taxType = 'pre-tax',
  showServiceCharge = true,
  serviceChargeRate = 10,
  serviceChargeAmount,
  showDiscount = true,
  discountType = 'percent',
  discountValue = 10,
  discountAmount,
  grandTotal,
  currency = 'USD',

  paymentMethod = 'Credit Card',
  isPaid = true,
  thankYouMessage = 'THANK YOU FOR DINING WITH US AT DINEPOSAI! WE HOPE TO SEE YOU AGAIN SOON.',
  showSocialMedia = false,
  socialLinks = {
    facebook: 'facebook.com/dineposai',
    instagram: 'instagram.com/dineposai',
    tiktok: 'tiktok.com/@dineposai',
    youtube: 'youtube.com/@dineposai'
  },

  variant = 'light-print',
  className = ''
}) => {
  // Format currency helper
  const formatVal = (val: number) => {
    const symbol = currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${val.toFixed(currency === 'JPY' ? 0 : 2)}`;
  };

  // Perform dynamic math if values are not directly passed
  const calcSubtotal = subtotal !== undefined ? subtotal : items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calcTax = taxAmount !== undefined ? taxAmount : (taxType === 'pre-tax' ? calcSubtotal * (taxRate / 100) : calcSubtotal - (calcSubtotal / (1 + taxRate / 100)));
  const calcServiceCharge = serviceChargeAmount !== undefined ? serviceChargeAmount : (showServiceCharge ? calcSubtotal * (serviceChargeRate / 100) : 0);
  const calcDiscount = discountAmount !== undefined ? discountAmount : (showDiscount ? (discountType === 'percent' ? calcSubtotal * (discountValue / 100) : discountValue) : 0);
  const calcTotal = grandTotal !== undefined ? grandTotal : (taxType === 'pre-tax' ? calcSubtotal + calcTax : calcSubtotal) + calcServiceCharge - calcDiscount;

  const isLight = variant === 'light-print';
  const bgColor = isLight ? 'bg-white' : 'bg-[#1c1b1a]';
  const textColor = isLight ? 'text-black' : 'text-[#A69984]';
  const primaryText = isLight ? 'text-black' : 'text-white';
  const accentText = isLight ? 'text-black' : 'text-[#ffe2ab]';
  const borderClass = isLight ? 'border-black' : 'border-white/20';

  return (
    <div className={`w-full max-w-[300px] mx-auto p-5 rounded-2xl font-mono text-[10px] leading-snug select-none ${bgColor} ${textColor} ${className}`}>
      
      {/* 1. Header Section */}
      <div className="text-center space-y-1 mb-3">
        {/* Only render logo if showLogo is true AND user has actually uploaded a restaurantLogo (No fallback icon!) */}
        {showLogo && restaurantLogo && (
          <div className="flex justify-center mb-2 select-none">
            <img
              src={restaurantLogo}
              alt="Business Logo"
              className="w-12 h-12 object-contain rounded-lg border border-gray-300 bg-white p-0.5"
            />
          </div>
        )}

        <div className={`font-black uppercase text-[13px] tracking-wider ${primaryText}`}>
          {establishmentName || 'DinePosAi'}
        </div>

        <div className={`text-[9.5px] font-extrabold ${primaryText} max-w-[220px] mx-auto leading-tight`}>
          {businessAddress || '72 Culinary Avenue, Gourmet District'}
        </div>

        {showTaxId && (
          <div className={`text-[10px] font-black uppercase pt-1 tracking-wider ${accentText}`}>
            {taxRegistrationType === 'PAN' ? 'PAN NO:' : 'VAT NO:'} {taxId || (taxRegistrationType === 'PAN' ? '601234567' : '301234567')}
          </div>
        )}
      </div>

      {/* 2. Metadata Block (High Readability for Thermal Paper) */}
      {(showTableNumber || showServerName || showOrderTimestamp) && (
        <div className={`border-y-2 border-dashed ${borderClass} py-2.5 my-2.5 text-[10px] font-black ${primaryText}`}>
          <div className="flex justify-between items-start">
            <div>
              {showTableNumber && <div className="font-black uppercase">TABLE: {tableNumber}</div>}
              {showOrderTimestamp && <div className="font-bold mt-0.5">DATE: {orderTimestamp}</div>}
            </div>
            <div className="text-right">
              {showServerName && <div className="font-black uppercase">CASHIER: {serverName}</div>}
              <div className="font-bold mt-0.5">ORDER #{orderId}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Itemized List */}
      <div className="space-y-2 py-1">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className={`flex justify-between items-baseline font-black ${primaryText}`}>
              <span>{item.quantity}x {item.name}</span>
              <span className="font-mono font-black">{formatVal(item.price * item.quantity)}</span>
            </div>
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="text-[9px] font-bold pl-2">+ {item.modifiers.join(', ')}</div>
            )}
            {item.notes && (
              <div className="text-[9px] font-bold pl-2">Note: {item.notes}</div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Subtotal & Financial Breakdown */}
      <div className={`border-t-2 border-dashed ${borderClass} pt-2.5 mt-2 space-y-1 text-[10px] font-extrabold ${primaryText}`}>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono font-bold">{formatVal(calcSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate}%)</span>
          <span className="font-mono font-bold">{formatVal(calcTax)}</span>
        </div>
        {showServiceCharge && (
          <div className="flex justify-between">
            <span>Service Charge ({serviceChargeRate}%)</span>
            <span className="font-mono font-bold">{formatVal(calcServiceCharge)}</span>
          </div>
        )}
        {showDiscount && (
          <div className={`flex justify-between ${isLight ? 'text-black' : 'text-emerald-400'}`}>
            <span>Discount ({discountType === 'percent' ? `${discountValue}%` : formatVal(discountValue)})</span>
            <span className="font-mono font-bold">-{formatVal(calcDiscount)}</span>
          </div>
        )}

        {/* Grand Total Highlight */}
        <div className={`border-t-2 border-dashed ${borderClass} pt-2 mt-2 flex justify-between items-baseline`}>
          <span className={`font-black text-[12px] uppercase ${primaryText}`}>Grand Total</span>
          <span className={`text-[15px] font-black font-mono tracking-wider ${accentText}`}>{formatVal(calcTotal)}</span>
        </div>
      </div>

      {/* 5. Footer Section */}
      <div className={`border-t-2 border-dashed ${borderClass} pt-2.5 mt-3 text-center space-y-1.5`}>
        <div className={`text-[9.5px] font-black ${primaryText}`}>
          Payment Method: <span className="font-black">{paymentMethod}</span>
        </div>
        
        <div className={`text-[9.5px] font-black uppercase tracking-wider ${accentText} leading-snug`}>
          {thankYouMessage}
        </div>

        {/* Social Media Handles */}
        {showSocialMedia && socialLinks && (
          <div className={`pt-1 text-[9px] font-black space-y-0.5 border-t border-dashed ${borderClass} mt-1.5`}>
            {socialLinks.facebook && <div>FB: {socialLinks.facebook}</div>}
            {socialLinks.instagram && <div>IG: {socialLinks.instagram}</div>}
            {socialLinks.tiktok && <div>TT: {socialLinks.tiktok}</div>}
            {socialLinks.youtube && <div>YT: {socialLinks.youtube}</div>}
          </div>
        )}
      </div>

    </div>
  );
};
