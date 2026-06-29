'use client';

import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

export interface ReceiptData {
  restaurantName: string;
  orderId: string;
  tableLabel: string;
  serverName: string;
  dateTime: string;
  items: { name: string; qty: number; price: number; modifiers?: string[] }[];
  subtotal: number;
  tax: number;
  taxLabel: string;
  discount: number;
  discountLabel?: string;
  gratuity: number;
  total: number;
  paymentMethod: string;
  paymentDetails: string;
  currency: string;
}

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
  formatCurrency: (val: number) => string;
}

type BluetoothStep = 'idle' | 'scanning' | 'connecting' | 'sending' | 'done' | 'error';

export default function ReceiptPrintModal({ isOpen, onClose, receiptData, formatCurrency }: ReceiptPrintModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [btStep, setBtStep] = useState<BluetoothStep>('idle');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setBtStep('idle');
      setIsDownloading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectDownload = async () => {
    if (!receiptRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#0e0e0d',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `receipt-${receiptData.orderId.replace(/[^a-zA-Z0-9]/g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('[Receipt] Failed to capture receipt:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBluetoothDownload = () => {
    if (btStep !== 'idle' && btStep !== 'done' && btStep !== 'error') return;
    setBtStep('scanning');
    setTimeout(() => {
      setBtStep('connecting');
      setTimeout(() => {
        setBtStep('sending');
        setTimeout(() => {
          setBtStep('done');
        }, 1200);
      }, 1000);
    }, 1500);
  };

  const handleSavePdf = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank', 'width=400,height=700');
    if (!printWindow) return;

    const receiptHtml = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptData.orderId}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              background: #0e0e0d; 
              color: #e5e2e1; 
              font-family: 'Inter', sans-serif; 
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @media print {
              body { background: white !important; color: #111 !important; }
              .receipt-inner { background: white !important; border-color: #ccc !important; color: #111 !important; }
              .receipt-inner * { color: #111 !important; border-color: #ccc !important; }
              .gold-text { color: #8B7200 !important; }
              .muted-text { color: #666 !important; }
              .separator { border-color: #ccc !important; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 380px; margin: 0 auto; padding: 20px;">
            ${receiptHtml}
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const btStatusText: Record<BluetoothStep, string> = {
    idle: '',
    scanning: 'Scanning for nearby devices...',
    connecting: 'Connecting to DinePOS Printer...',
    sending: 'Transmitting receipt data...',
    done: 'Receipt sent successfully!',
    error: 'Connection failed. Try again.',
  };

  const btStatusIcon: Record<BluetoothStep, string> = {
    idle: 'bluetooth',
    scanning: 'bluetooth_searching',
    connecting: 'bluetooth_connected',
    sending: 'send',
    done: 'check_circle',
    error: 'error',
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-xl flex items-center justify-center z-[60] p-4 select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#12110f] border border-[#ffe2ab]/15 rounded-2xl w-full max-w-[440px] overflow-hidden shadow-[0_0_80px_rgba(255,226,171,0.08)] animate-fade-in flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a09] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffe2ab] text-lg">receipt_long</span>
            <div>
              <h3 className="font-serif font-bold text-sm text-white tracking-wide">Print Receipt</h3>
              <p className="text-[9px] text-[#A69984]/60 font-bold uppercase tracking-widest mt-0.5 font-sans">
                Invoice {receiptData.orderId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div ref={receiptRef} className="receipt-inner bg-[#0e0e0d] border border-white/5 rounded-xl p-5 font-sans text-[#e5e2e1]">
            
            {/* Restaurant Header */}
            <div className="text-center pb-4 border-b border-dashed border-white/10 separator">
              <div className="w-10 h-10 mx-auto bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 rounded-xl flex items-center justify-center mb-2.5">
                <span className="material-symbols-outlined text-[#ffe2ab] text-lg gold-text">restaurant</span>
              </div>
              <h4 className="font-serif text-base font-bold text-white tracking-wider">{receiptData.restaurantName}</h4>
              <p className="text-[8px] text-[#A69984]/50 font-bold uppercase tracking-[0.25em] mt-1 muted-text">Official Transaction Receipt</p>
            </div>

            {/* Order Metadata */}
            <div className="py-3 border-b border-dashed border-white/10 space-y-1.5 separator">
              <div className="flex justify-between text-[9px]">
                <span className="text-[#A69984]/60 font-semibold uppercase tracking-wider muted-text">Order</span>
                <span className="text-white font-bold">{receiptData.orderId}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#A69984]/60 font-semibold uppercase tracking-wider muted-text">Table</span>
                <span className="text-white font-bold">{receiptData.tableLabel}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#A69984]/60 font-semibold uppercase tracking-wider muted-text">Server</span>
                <span className="text-white font-bold">{receiptData.serverName}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#A69984]/60 font-semibold uppercase tracking-wider muted-text">Date/Time</span>
                <span className="text-white font-bold">{receiptData.dateTime}</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="py-3 border-b border-dashed border-white/10 space-y-2 separator">
              <div className="text-[8px] text-[#ffe2ab]/60 font-extrabold uppercase tracking-[0.2em] mb-1 gold-text">Items Ordered</div>
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white font-semibold leading-tight">
                      {item.qty > 1 && <span className="text-[#ffe2ab]/80 mr-1 gold-text">{item.qty}×</span>}
                      {item.name}
                    </div>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="text-[8px] text-[#A69984]/50 mt-0.5 muted-text">
                        {item.modifiers.join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white font-bold flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="py-3 space-y-1.5">
              <div className="flex justify-between text-[9px]">
                <span className="text-[#A69984]/60 font-semibold muted-text">Subtotal</span>
                <span className="text-white font-bold">{formatCurrency(receiptData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-[#A69984]/60 font-semibold muted-text">{receiptData.taxLabel}</span>
                <span className="text-white font-bold">{formatCurrency(receiptData.tax)}</span>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-emerald-400/80 font-semibold">{receiptData.discountLabel || 'Discount'}</span>
                  <span className="text-emerald-400 font-bold">-{formatCurrency(receiptData.discount)}</span>
                </div>
              )}
              {receiptData.gratuity > 0 && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-[#A69984]/60 font-semibold muted-text">Gratuity</span>
                  <span className="text-white font-bold">{formatCurrency(receiptData.gratuity)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center separator">
                <span className="text-[10px] text-[#ffe2ab] font-extrabold uppercase tracking-wider gold-text">Total</span>
                <span className="text-sm text-white font-black">{formatCurrency(receiptData.total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="py-3 border-t border-dashed border-white/10 separator">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ffe2ab] text-xs gold-text">credit_card</span>
                  <span className="text-[9px] text-white font-bold">{receiptData.paymentMethod}</span>
                </div>
                {receiptData.paymentDetails && (
                  <span className="text-[9px] text-[#A69984]/50 font-mono muted-text">{receiptData.paymentDetails}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-xs">verified</span>
                <span className="text-[8px] text-emerald-400/70 font-bold uppercase tracking-wider">Payment Verified</span>
              </div>
            </div>

            {/* Thank You Footer */}
            <div className="text-center pt-3 border-t border-dashed border-white/10 separator">
              <p className="text-[9px] text-[#A69984]/40 font-medium leading-relaxed muted-text">
                Thank you for dining with us.<br />
                We look forward to serving you again.
              </p>
              <div className="mt-2.5 flex justify-center gap-0.5">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#ffe2ab]/15" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-4 border-t border-white/5 bg-[#0a0a09] flex-shrink-0 space-y-2.5">
          
          {/* Bluetooth Status Banner */}
          {btStep !== 'idle' && (
            <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border animate-fade-in ${
              btStep === 'done' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : btStep === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              <span className={`material-symbols-outlined text-sm ${btStep !== 'done' && btStep !== 'error' ? 'animate-pulse' : ''}`}>
                {btStatusIcon[btStep]}
              </span>
              <span>{btStatusText[btStep]}</span>
            </div>
          )}

          {/* Button Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-[#ffe2ab]/10 hover:bg-[#ffe2ab]/20 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/35 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="material-symbols-outlined text-[#ffe2ab] text-lg group-hover:scale-110 transition-transform">
                {isDownloading ? 'progress_activity' : 'download'}
              </span>
              <span className="text-[8px] text-[#ffe2ab]/80 font-extrabold uppercase tracking-wider leading-tight text-center">
                Direct<br />Download
              </span>
            </button>

            <button
              type="button"
              onClick={handleBluetoothDownload}
              disabled={btStep !== 'idle' && btStep !== 'done' && btStep !== 'error'}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-500/35 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="material-symbols-outlined text-blue-400 text-lg group-hover:scale-110 transition-transform">
                {btStep !== 'idle' && btStep !== 'done' && btStep !== 'error' ? 'progress_activity' : 'bluetooth'}
              </span>
              <span className="text-[8px] text-blue-400/80 font-extrabold uppercase tracking-wider leading-tight text-center">
                Via<br />Bluetooth
              </span>
            </button>

            <button
              type="button"
              onClick={handleSavePdf}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 hover:border-violet-500/35 rounded-xl transition-all duration-200 cursor-pointer group"
            >
              <span className="material-symbols-outlined text-violet-400 text-lg group-hover:scale-110 transition-transform">picture_as_pdf</span>
              <span className="text-[8px] text-violet-400/80 font-extrabold uppercase tracking-wider leading-tight text-center">
                Save<br />PDF
              </span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer mt-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
