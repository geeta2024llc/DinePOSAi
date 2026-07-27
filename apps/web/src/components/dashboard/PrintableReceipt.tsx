'use client';

import React from 'react';
import { InvoiceConfig, getStoredInvoiceConfig } from '@/utils/invoiceConfig';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  notes?: string;
}

export interface PrintableReceiptProps {
  // Config override or full object
  invoiceConfig?: Partial<InvoiceConfig>;

  // Direct props for override compatibility
  establishmentName?: string;
  businessAddress?: string;
  contactEmail?: string;
  restaurantLogo?: string;
  showLogo?: boolean;

  taxId?: string;
  taxRegistrationType?: 'VAT' | 'PAN';
  showTaxId?: boolean;

  tableNumber?: string | number;
  showTableNumber?: boolean;
  serverName?: string;
  showServerName?: boolean;
  orderTimestamp?: string;
  showOrderTimestamp?: boolean;
  orderId?: string;

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
  showBarcode?: boolean;
  paperWidth?: '58mm' | '80mm';

  variant?: 'dark-preview' | 'light-print';
  className?: string;
}

export const defaultReceiptItems: ReceiptItem[] = [
  { name: 'Truffle Wagyu Sliders', quantity: 2, price: 24.00 },
  { name: 'Lobster Bisque', quantity: 1, price: 18.00 },
  { name: 'Vintage Cabernet (G)', quantity: 2, price: 17.00 }
];

export const PrintableReceipt: React.FC<PrintableReceiptProps> = (props) => {
  const baseConfig = getStoredInvoiceConfig();

  const cfg: InvoiceConfig = {
    ...baseConfig,
    ...(props.invoiceConfig || {}),
    ...(props.establishmentName ? { establishmentName: props.establishmentName } : {}),
    ...(props.businessAddress ? { businessAddress: props.businessAddress } : {}),
    ...(props.contactEmail ? { contactEmail: props.contactEmail } : {}),
    ...(props.restaurantLogo ? { restaurantLogo: props.restaurantLogo } : {}),
    ...(props.showLogo !== undefined ? { showLogo: props.showLogo } : {}),
    ...(props.taxId ? { taxId: props.taxId } : {}),
    ...(props.taxRegistrationType ? { taxRegistrationType: props.taxRegistrationType } : {}),
    ...(props.showTaxId !== undefined ? { showTaxId: props.showTaxId } : {}),
    ...(props.showTableNumber !== undefined ? { showTableNumber: props.showTableNumber } : {}),
    ...(props.showServerName !== undefined ? { showServerName: props.showServerName } : {}),
    ...(props.showOrderTimestamp !== undefined ? { showOrderTimestamp: props.showOrderTimestamp } : {}),
    ...(props.showServiceCharge !== undefined ? { showServiceCharge: props.showServiceCharge } : {}),
    ...(props.serviceChargeRate !== undefined ? { serviceChargeRate: props.serviceChargeRate } : {}),
    ...(props.showDiscount !== undefined ? { showDiscount: props.showDiscount } : {}),
    ...(props.discountType ? { discountType: props.discountType } : {}),
    ...(props.discountValue !== undefined ? { discountValue: props.discountValue } : {}),
    ...(props.taxType ? { taxType: props.taxType } : {}),
    ...(props.taxRate !== undefined ? { taxRate: props.taxRate } : {}),
    ...(props.currency ? { currency: props.currency } : {}),
    ...(props.thankYouMessage ? { thankYouMessage: props.thankYouMessage } : {}),
    ...(props.showCustomFooter !== undefined ? { showCustomFooter: props.showCustomFooter } : {}),
    ...(props.customFooterText ? { customFooterText: props.customFooterText } : {}),
    ...(props.showSocialMedia !== undefined ? { showSocialMedia: props.showSocialMedia } : {}),
    ...(props.socialLinks ? { socialLinks: props.socialLinks } : {}),
    ...(props.showQrCode !== undefined ? { showQrCode: props.showQrCode } : {}),
    ...(props.qrCodeUrl ? { qrCodeUrl: props.qrCodeUrl } : {}),
    ...(props.showBarcode !== undefined ? { showBarcode: props.showBarcode } : {}),
    ...(props.paperWidth ? { paperWidth: props.paperWidth } : {})
  };

  const items = props.items || defaultReceiptItems;
  const tableNumber = props.tableNumber || 'T-14';
  const serverName = props.serverName || 'JULIAN B.';
  const orderTimestamp = props.orderTimestamp || `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const orderId = props.orderId || '2345';
  const paymentMethod = props.paymentMethod || 'Credit Card';

  const formatVal = (val: number) => {
    const symbol = cfg.currency === 'JPY' ? '¥' : cfg.currency === 'EUR' ? '€' : cfg.currency === 'GBP' ? '£' : '$';
    return `${symbol}${val.toFixed(cfg.currency === 'JPY' ? 0 : 2)}`;
  };

  const calcSubtotal = props.subtotal !== undefined ? props.subtotal : items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calcTax = props.taxAmount !== undefined ? props.taxAmount : (cfg.taxType === 'pre-tax' ? calcSubtotal * (cfg.taxRate / 100) : calcSubtotal - (calcSubtotal / (1 + cfg.taxRate / 100)));
  const calcServiceCharge = props.serviceChargeAmount !== undefined ? props.serviceChargeAmount : (cfg.showServiceCharge ? calcSubtotal * (cfg.serviceChargeRate / 100) : 0);
  const calcDiscount = props.discountAmount !== undefined ? props.discountAmount : (cfg.showDiscount ? (cfg.discountType === 'percent' ? calcSubtotal * (cfg.discountValue / 100) : cfg.discountValue) : 0);
  const calcTotal = props.grandTotal !== undefined ? props.grandTotal : (cfg.taxType === 'pre-tax' ? calcSubtotal + calcTax : calcSubtotal) + calcServiceCharge - calcDiscount;

  const isLight = props.variant === 'light-print';
  const widthClass = cfg.paperWidth === '58mm' ? 'max-w-[220px]' : 'max-w-[300px]';
  const bgColor = isLight ? 'bg-white' : 'bg-[#1c1b1a]';
  const textColor = isLight ? 'text-black' : 'text-[#A69984]';
  const primaryText = isLight ? 'text-black' : 'text-white';
  const accentText = isLight ? 'text-black' : 'text-[#ffe2ab]';
  const borderClass = isLight ? 'border-black' : 'border-white/20';

  return (
    <div className={`w-full ${widthClass} mx-auto p-5 rounded-2xl font-mono text-[10px] leading-snug select-none shadow-md transition-all ${bgColor} ${textColor} ${props.className || ''}`}>
      
      {/* 1. Header Section */}
      <div className="text-center space-y-1 mb-3">
        {cfg.showLogo && cfg.restaurantLogo && (
          <div className="flex justify-center mb-2 select-none">
            <img
              src={cfg.restaurantLogo}
              alt="Business Logo"
              className="w-12 h-12 object-contain rounded-lg border border-gray-300 bg-white p-0.5"
            />
          </div>
        )}

        <div className={`font-black uppercase text-[13px] tracking-wider ${primaryText}`}>
          {cfg.establishmentName || 'DinePosAi'}
        </div>

        {cfg.businessAddress && (
          <div className={`text-[9.5px] font-extrabold ${primaryText} max-w-[220px] mx-auto leading-tight`}>
            {cfg.businessAddress}
          </div>
        )}

        {cfg.showTaxId && cfg.taxId && (
          <div className={`text-[10px] font-black uppercase pt-1 tracking-wider ${accentText}`}>
            {cfg.taxRegistrationType === 'PAN' ? 'PAN NO:' : 'VAT NO:'} {cfg.taxId}
          </div>
        )}
      </div>

      {/* 2. Metadata Block */}
      {(cfg.showTableNumber || cfg.showServerName || cfg.showOrderTimestamp) && (
        <div className={`border-y-2 border-dashed ${borderClass} py-2.5 my-2.5 text-[10px] font-black ${primaryText}`}>
          <div className="flex justify-between items-start">
            <div>
              {cfg.showTableNumber && <div className="font-black uppercase">TABLE: {tableNumber}</div>}
              {cfg.showOrderTimestamp && <div className="font-bold mt-0.5">DATE: {orderTimestamp}</div>}
            </div>
            <div className="text-right">
              {cfg.showServerName && <div className="font-black uppercase">CASHIER: {serverName}</div>}
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
          <span>Tax ({cfg.taxRate}%) [{cfg.taxType}]</span>
          <span className="font-mono font-bold">{formatVal(calcTax)}</span>
        </div>
        {cfg.showServiceCharge && (
          <div className="flex justify-between">
            <span>Service Charge ({cfg.serviceChargeRate}%)</span>
            <span className="font-mono font-bold">{formatVal(calcServiceCharge)}</span>
          </div>
        )}
        {cfg.showDiscount && (
          <div className={`flex justify-between ${isLight ? 'text-black' : 'text-emerald-400'}`}>
            <span>Discount ({cfg.discountType === 'percent' ? `${cfg.discountValue}%` : formatVal(cfg.discountValue)})</span>
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
        
        {cfg.thankYouMessage && (
          <div className={`text-[9.5px] font-black uppercase tracking-wider ${accentText} leading-snug`}>
            {cfg.thankYouMessage}
          </div>
        )}

        {cfg.showCustomFooter && cfg.customFooterText && (
          <div className={`text-[9px] font-extrabold ${primaryText}`}>
            {cfg.customFooterText}
          </div>
        )}

        {/* Social Media Handles */}
        {cfg.showSocialMedia && cfg.socialLinks && (
          <div className={`pt-1 text-[9px] font-black space-y-0.5 border-t border-dashed ${borderClass} mt-1.5`}>
            {cfg.socialLinks.facebook && <div>FB: {cfg.socialLinks.facebook}</div>}
            {cfg.socialLinks.instagram && <div>IG: {cfg.socialLinks.instagram}</div>}
            {cfg.socialLinks.tiktok && <div>TT: {cfg.socialLinks.tiktok}</div>}
            {cfg.socialLinks.youtube && <div>YT: {cfg.socialLinks.youtube}</div>}
          </div>
        )}

        {/* Barcode Indicator */}
        {cfg.showBarcode && (
          <div className="pt-2 flex flex-col items-center justify-center">
            <div className="font-mono text-[9px] tracking-widest font-black border-y border-black/30 py-0.5 px-2">
              ||| |||| | ||||| || ||| #{orderId}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
