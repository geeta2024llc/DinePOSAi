'use client';

import React, { useRef, useState, useEffect } from 'react';
import { usePrinter } from '../../../app/printerContext';
import { PrintReceiptData } from '../../../app/printerService';
import { generateReceiptHtml } from '../../utils/receiptTemplate';

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

const escapeHtml = (unsafe: string | null | undefined): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export default function ReceiptPrintModal({ isOpen, onClose, receiptData, formatCurrency }: ReceiptPrintModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [btStep, setBtStep] = useState<BluetoothStep>('idle');
  const [btError, setBtError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);

  const { config: printerConfig, printReceipt: dispatchPrintReceipt, scanAndPair } = usePrinter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLogo = localStorage.getItem('dinepos_restaurant_logo');
      if (savedLogo) setRestaurantLogo(savedLogo);
    }
  }, []);

  const mapToPrintReceiptData = (data: ReceiptData): PrintReceiptData => {
    const tableNum = parseInt(data.tableLabel.replace(/[^0-9]/g, ''), 10) || 0;
    const taxRate = data.subtotal > 0 ? data.tax / data.subtotal : 0.085;

    let kickDrawer = false;
    if (typeof window !== 'undefined') {
      const savedDrawerAutoOpen = localStorage.getItem('dinepos_cashier_drawer_autoopen');
      const drawerAutoOpen = savedDrawerAutoOpen !== 'false';
      if (drawerAutoOpen && data.paymentMethod?.toUpperCase() === 'CASH') {
        kickDrawer = true;
      }
    }

    return {
      tableNumber: tableNum,
      orderId: data.orderId,
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        modifiers: item.modifiers,
      })),
      subtotal: data.subtotal,
      taxRate,
      tax: data.tax,
      taxType: 'pre-tax',
      serviceCharge: data.gratuity,
      total: data.total,
      isPaid: true,
      paymentMethod: data.paymentMethod,
      authCode: data.paymentDetails,
      kickDrawer
    };
  };

  useEffect(() => {
    if (!isOpen) {
      setBtStep('idle');
      setIsPrinting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBluetoothPrint = async () => {
    if (btStep !== 'idle' && btStep !== 'done' && btStep !== 'error') return;
    try {
      setBtError(null);
      setBtStep('scanning');
      if (printerConfig.type !== 'bluetooth') {
        await scanAndPair('bluetooth');
      }
      setBtStep('connecting');
      setBtStep('sending');
      const printData = mapToPrintReceiptData(receiptData);
      await dispatchPrintReceipt(printData);
      setBtStep('done');
    } catch (err: any) {
      console.error('[Receipt] Bluetooth print failed:', err);
      setBtError(err.message || 'Connection failed');
      setBtStep('error');
    }
  };

  const handleDirectPrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      const printData = mapToPrintReceiptData(receiptData);
      await dispatchPrintReceipt(printData);
    } catch (err) {
      console.error('[Receipt] Direct print failed:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSavePdf = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank', 'width=450,height=800');
    if (!printWindow) return;

    printWindow.document.write(generateReceiptHtml(receiptData, restaurantLogo, formatCurrency));
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
    <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-xl flex items-center justify-center z-[60] p-4 select-none receipt-print-modal-wrapper"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @media print {
          /* Hide all page content during print using visibility */
          body {
            visibility: hidden !important;
            background: #fff !important;
          }
          
          /* Force only the printable receipt area and its contents to be visible */
          .printable-receipt-area,
          .printable-receipt-area * {
            visibility: visible !important;
            color: #000 !important;
            border-color: #000000 !important;
            font-weight: 900 !important; /* Force black font weight for maximum print clarity */
            box-sizing: border-box !important;
          }
          
          /* Pull the receipt container to the top-left of the print viewport with a rigid width of 300px */
          .printable-receipt-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
            width: 300px !important;
            max-width: 300px !important;
            padding: 10px 15px 20px 15px !important; /* Left & right padding within the 300px width */
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            display: block !important;
          }

          /* Font size adjustments for printed readability */
          .printable-receipt-area {
            font-size: 13px !important;
          }
          .printable-receipt-area h4 {
            font-size: 18px !important;
          }
          .printable-receipt-area p {
            font-size: 11px !important;
          }
          .printable-receipt-area .text-\[10px\] {
            font-size: 12px !important;
          }
          .printable-receipt-area .text-\[10\.5px\] {
            font-size: 13px !important;
          }
          .printable-receipt-area .text-\[9\.5px\] {
            font-size: 12px !important;
          }
          .printable-receipt-area .text-\[8px\] {
            font-size: 11px !important;
          }
          .printable-receipt-area .text-\[8\.5px\] {
            font-size: 11px !important;
          }
          .printable-receipt-area .text-sm {
            font-size: 15px !important;
          }

          /* Force vector icons to be visible as black shapes */
          .material-symbols-outlined {
            color: #000 !important;
            font-size: 16px !important;
            font-weight: bold !important;
          }

          .gold-text {
            color: #000000 !important;
          }
          
          .muted-text {
            color: #000000 !important;
          }

          @page {
            margin: 0;
          }
        }
      `}</style>

      <div className="bg-[#12110f] border border-[#ffe2ab]/15 rounded-2xl w-full max-w-[440px] overflow-hidden shadow-[0_0_80px_rgba(255,226,171,0.08)] animate-fade-in flex flex-col max-h-[95vh] receipt-print-modal-content">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a09] flex-shrink-0 receipt-print-modal-header no-print">
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
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar printable-receipt-container">
          <div ref={receiptRef} className="printable-receipt-area bg-[#0e0e0d] border border-white/5 rounded-xl p-6 font-sans text-[#e5e2e1]">
            
            {/* Restaurant Header */}
            <div className="text-center pb-5 border-b border-dashed border-white/10 separator">
              <div className="w-11 h-11 mx-auto bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 rounded-xl flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[#ffe2ab] text-[22px] gold-text">restaurant</span>
              </div>
              <h4 className="font-serif text-base font-bold text-white tracking-widest uppercase">{receiptData.restaurantName}</h4>
              <p className="text-[8px] text-[#A69984]/50 font-bold uppercase tracking-[0.3em] mt-1.5 muted-text">Official Transaction Receipt</p>
            </div>

            {/* Order Metadata */}
            <div className="py-4 border-b border-dashed border-white/10 space-y-2 separator">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#A69984]/60 font-bold uppercase tracking-wider muted-text">Order</span>
                <span className="text-white font-bold">{receiptData.orderId}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#A69984]/60 font-bold uppercase tracking-wider muted-text">Table</span>
                <span className="text-white font-bold">{receiptData.tableLabel}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#A69984]/60 font-bold uppercase tracking-wider muted-text">Server</span>
                <span className="text-white font-bold">{receiptData.serverName}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#A69984]/60 font-bold uppercase tracking-wider muted-text">Date/Time</span>
                <span className="text-white font-bold">{receiptData.dateTime}</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="py-4 border-b border-dashed border-white/10 space-y-3 separator">
              <div className="text-[8px] text-[#ffe2ab]/60 font-extrabold uppercase tracking-[0.25em] mb-2 gold-text">Items Ordered</div>
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] text-white font-bold leading-tight">
                      {item.qty > 1 && <span className="text-[#ffe2ab]/80 mr-1.5 gold-text">{item.qty}×</span>}
                      {item.name}
                    </div>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="text-[8.5px] text-[#A69984]/50 mt-1 muted-text italic font-bold">
                        ({item.modifiers.join(', ')})
                      </div>
                    )}
                  </div>
                  <span className="text-[10.5px] text-white font-bold font-mono flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#A69984]/60 font-bold muted-text">Subtotal</span>
                <span className="text-white font-bold font-mono">{formatCurrency(receiptData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#A69984]/60 font-bold muted-text">{receiptData.taxLabel}</span>
                <span className="text-white font-bold font-mono">{formatCurrency(receiptData.tax)}</span>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-400/80 font-bold">{receiptData.discountLabel || 'Discount'}</span>
                  <span className="text-emerald-400 font-bold font-mono">-{formatCurrency(receiptData.discount)}</span>
                </div>
              )}
              {receiptData.gratuity > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#A69984]/60 font-bold muted-text">Gratuity</span>
                  <span className="text-white font-bold font-mono">{formatCurrency(receiptData.gratuity)}</span>
                </div>
              )}
              <div className="border-t border-white/15 pt-3 mt-3 flex justify-between items-center separator">
                <span className="text-[10.5px] text-[#ffe2ab] font-extrabold uppercase tracking-wider gold-text">Total</span>
                <span className="text-sm text-white font-black font-mono">{formatCurrency(receiptData.total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="py-3.5 border-t border-dashed border-white/10 separator">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffe2ab] text-[13px] gold-text">credit_card</span>
                  <span className="text-[9.5px] text-white font-bold">{receiptData.paymentMethod}</span>
                </div>
                {receiptData.paymentDetails && (
                  <span className="text-[9.5px] text-[#A69984]/50 font-mono font-bold muted-text">{receiptData.paymentDetails}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="material-symbols-outlined text-emerald-400 text-[11px]">verified</span>
                <span className="text-[8px] text-emerald-400/70 font-bold uppercase tracking-wider">Payment Verified</span>
              </div>
            </div>

            {/* Thank You Footer */}
            <div className="text-center pt-4 border-t border-dashed border-white/10 separator">
              <p className="text-[9px] text-[#A69984]/40 font-bold leading-relaxed muted-text">
                Thank you for dining with us.<br />
                We look forward to serving you again.
              </p>
              <div className="mt-3 flex justify-center gap-1">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#ffe2ab]/15" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-4 border-t border-white/5 bg-[#0a0a09] flex-shrink-0 space-y-2.5 receipt-print-modal-buttons no-print">
          
          {/* Bluetooth Status Banner */}
          {btStep !== 'idle' && (
            <div className={`flex flex-col gap-2 px-3.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border animate-fade-in ${
              btStep === 'done' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : btStep === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-sm ${btStep !== 'done' && btStep !== 'error' ? 'animate-pulse' : ''}`}>
                  {btStatusIcon[btStep]}
                </span>
                <span>{btStep === 'error' && btError ? `Error: ${btError}` : btStatusText[btStep]}</span>
              </div>
              {btStep === 'error' && (
                <button onClick={() => { setBtStep('idle'); handleBluetoothPrint(); }} className="self-start mt-1 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-[9px] cursor-pointer text-rose-300">
                  Retry Connection
                </button>
              )}
            </div>
          )}

          {/* Button Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDirectPrint}
              disabled={isPrinting}
              className="flex flex-col items-center gap-1.5 py-3 px-1.5 bg-[#ffe2ab]/10 hover:bg-[#ffe2ab]/20 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/35 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group font-sans"
            >
              <span className="material-symbols-outlined text-[#ffe2ab] text-[19px] group-hover:scale-110 transition-transform">
                {isPrinting ? 'progress_activity' : 'print'}
              </span>
              <span className="text-[8px] text-[#ffe2ab]/80 font-extrabold uppercase tracking-wider leading-tight text-center">
                Direct Print
              </span>
            </button>

            <button
              type="button"
              onClick={handleBluetoothPrint}
              disabled={btStep !== 'idle' && btStep !== 'done' && btStep !== 'error'}
              className="flex flex-col items-center gap-1.5 py-3 px-1.5 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-500/35 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group font-sans"
            >
              <span className="material-symbols-outlined text-blue-400 text-[19px] group-hover:scale-110 transition-transform">
                {btStep !== 'idle' && btStep !== 'done' && btStep !== 'error' ? 'progress_activity' : 'bluetooth'}
              </span>
              <span className="text-[8px] text-blue-400/80 font-extrabold uppercase tracking-wider leading-tight text-center">
                Print Bluetooth
              </span>
            </button>

            <button
              type="button"
              onClick={handleSavePdf}
              className="flex flex-col items-center gap-1.5 py-3 px-1.5 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 hover:border-violet-500/35 rounded-xl transition-all duration-200 cursor-pointer group font-sans"
            >
              <span className="material-symbols-outlined text-violet-400 text-[19px] group-hover:scale-110 transition-transform">picture_as_pdf</span>
              <span className="text-[8px] text-violet-400/80 font-extrabold uppercase tracking-wider leading-tight text-center">
                Save PDF
              </span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer mt-1 font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
