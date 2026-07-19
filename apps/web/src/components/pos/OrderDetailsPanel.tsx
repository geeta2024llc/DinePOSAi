'use client';

import React from 'react';

const getTicketTaxRate = (t: any, defaultDineIn = 0.085, defaultTakeaway = 0.085, defaultDelivery = 0.085): number => {
  if (t && typeof t.taxRate === 'number' && !isNaN(t.taxRate)) {
    return t.taxRate;
  }
  if (t && t.tableNumber) {
    const tbl = t.tableNumber.toLowerCase();
    if (tbl.includes('takeaway') || tbl.includes('takeout')) return defaultTakeaway;
    if (tbl.includes('delivery')) return defaultDelivery;
  }
  if (t && t.type) {
    if (t.type === 'takeaway') return defaultTakeaway;
    if (t.type === 'delivery') return defaultDelivery;
  }
  return defaultDineIn;
};

const getTicketGratuityRate = (t: any): number => {
  if (t && typeof t.gratuityRate === 'number' && !isNaN(t.gratuityRate)) {
    return t.gratuityRate;
  }
  if (t && t.tableNumber) {
    const tbl = t.tableNumber.toLowerCase();
    if (tbl.includes('takeaway') || tbl.includes('takeout') || tbl.includes('delivery')) return 0.00;
  }
  if (t && t.type) {
    if (t.type === 'takeaway' || t.type === 'delivery') return 0.00;
  }
  return 0.10;
};

interface OrderDetailsPanelProps {
  t: any;
  currency: string;
  selectedTicket: any;
  isProcessing: boolean;
  handleUpdateItemQty: (ticketId: string, name: string, change: number, note?: string) => void;
  handleRemoveItem: (ticketId: string, itemName: string, note?: string) => void;
  handleProcessPayment: () => void;
  mobileView: 'list' | 'detail';
  setMobileView: (val: 'list' | 'detail') => void;
  setActiveCategory: (val: string) => void;
  setMenuSearchQuery: (val: string) => void;
  setItemNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMenuModalOpen: (val: boolean) => void;
  getItemPrice: (item: any) => number;
  
  // calculation props
  taxType: 'pre-tax' | 'post-tax';
  subtotal: number;
  tax: number;
  gratuity: number;
  discountAmount: number;
  appliedDiscount: any;
  grandTotal: number;
  cashierAutoGratuityPct: number;
  handleUpdateGratuityRate: (ticketId: string, rate: number) => void;
}

export default function OrderDetailsPanel({
  t,
  currency,
  selectedTicket,
  isProcessing,
  handleUpdateItemQty,
  handleRemoveItem,
  handleProcessPayment,
  mobileView,
  setMobileView,
  setActiveCategory,
  setMenuSearchQuery,
  setItemNotes,
  setMenuModalOpen,
  getItemPrice,
  taxType,
  subtotal,
  tax,
  gratuity,
  discountAmount,
  appliedDiscount,
  grandTotal,
  cashierAutoGratuityPct,
  handleUpdateGratuityRate
}: OrderDetailsPanelProps) {
  
  const formatPrice = (val: number) => {
    if (currency === 'JPY' || currency === 'KRW') return `¥${Math.round(val).toLocaleString()}`;
    return `$${val.toFixed(2)}`;
  };
  const formatMoney = formatPrice;

  return (
            <div className={`flex-1 flex-col h-full bg-[#11100e] overflow-hidden min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>

              {/* Mobile back-to-orders bar */}
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="lg:hidden flex items-center gap-2 px-5 py-3.5 border-b border-white/5 w-full text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-[#ffe2ab]">arrow_back_ios</span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#ffe2ab]">{t("All Orders", "すべての注文")}</span>
              </button>

              {/* Ticket details header */}
              <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-start flex-shrink-0 select-none">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.2em] mb-1.5 block">{t("Current Ticket", "現在の伝票")}</span>
                    <h3 className="font-serif text-[32px] text-white font-bold leading-none select-text">{selectedTicket.tableNumber}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveCategory('all');
                      setMenuSearchQuery('');
                      setItemNotes({});
                      setMenuModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ml-4 mt-1.5 select-none"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">restaurant_menu</span>
                    {t("Add Menu Item", "メニュー追加")}
                  </button>
                </div>
                
                <div className="text-right text-xs text-[#A69984]/70 font-semibold font-sans space-y-1">
                  <div>{t("Guests: ", "人数: ")}{selectedTicket.guests}</div>
                  <div className="select-text">{t("Order ", "注文 ")}{selectedTicket.orderNumber}</div>
                </div>
              </div>

              {/* Order items lists with headers */}
              <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-12 text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest pb-3 border-b border-white/5 select-none">
                  <div className="col-span-2 text-left">{t("Qty", "数量")}</div>
                  <div className="col-span-6 text-left">{t("Item", "品名")}</div>
                  <div className="col-span-3 text-right">{t("Price", "単価")}</div>
                  <div className="col-span-1 text-right"></div>
                </div>

                {/* Items rows */}
                <div className="divide-y divide-white/5 flex-grow">
                  {selectedTicket.items.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-12 py-5 items-center">
                      {/* Quantity & Adjusters */}
                      <div className="col-span-2 flex items-center gap-1.5 font-sans text-sm font-bold text-[#ffe2ab]/90 select-none">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(selectedTicket.id, item.name, -1, item.note)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-4 text-center select-all">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(selectedTicket.id, item.name, 1, item.note)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Name & Note */}
                      <div className="col-span-6 text-left min-w-0 pr-2">
                        <div className="font-sans font-bold text-sm text-white truncate">{item.name}</div>
                        {item.note && (
                          <div className="font-sans text-[11px] text-[#ffe2ab]/70 font-medium mt-0.5 break-words">
                            Note: {item.note}
                          </div>
                        )}
                        {item.options && item.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 font-sans">
                            {item.options.map((opt: any, oIdx: number) => (
                              <span
                                key={oIdx}
                                className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                                  opt.type === 'allergy'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : opt.type === 'highlight'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-white/5 text-[#A69984] border-white/5'
                                }`}
                              >
                                {opt.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-3 text-right font-sans text-sm pr-2">
                        <div className="font-bold text-white/95">{formatMoney(getItemPrice(item))}</div>
                        {item.qty > 1 && (
                          <div className="text-[10px] text-[#A69984]/60 font-semibold mt-0.5">
                            {t("Total: ", "小計: ")}{formatMoney(getItemPrice(item) * item.qty)}
                          </div>
                        )}
                      </div>

                      {/* Remove item */}
                      <div className="col-span-1 text-right select-none">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(selectedTicket.id, item.name, item.note)}
                          className="text-[#A69984]/40 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Calculations Card Panel */}
              <div className="p-8 border-t border-white/5 bg-[#161513]/40 flex-shrink-0 space-y-6">
                
                {/* Summary breakdowns */}
                <div className="space-y-2.5 font-sans select-none text-xs font-semibold uppercase tracking-wider text-[#A69984]/75 border-b border-white/5 pb-4">
                  <div className="flex justify-between">
                    <span>{taxType === 'post-tax' ? t('Subtotal (Tax Incl.)', '小計 (税込)') : t('Subtotal', '小計')}</span>
                    <span className="text-white">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{taxType === 'post-tax' ? t('Included Tax', '内消費税') : t('Tax', '消費税')} ({(getTicketTaxRate(selectedTicket) * 100).toFixed(1)}%)</span>
                    <span className="text-white">{formatMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{t('Gratuity', 'サービス料')} (Suggested {selectedTicket ? (getTicketGratuityRate(selectedTicket) * 100).toFixed(0) : cashierAutoGratuityPct}%)</span>
                      {selectedTicket && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentRate = getTicketGratuityRate(selectedTicket);
                            const nextRate = currentRate > 0 ? 0.00 : (cashierAutoGratuityPct / 100);
                            handleUpdateGratuityRate(selectedTicket.id, nextRate);
                          }}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[#ffe2ab] border border-white/10 rounded font-sans text-[9px] uppercase tracking-wider transition-colors cursor-pointer select-none"
                        >
                          {getTicketGratuityRate(selectedTicket) > 0 ? t('Waive', '免除') : t('Apply', '適用')}
                        </button>
                      )}
                    </span>
                    <span className="text-white">{formatMoney(gratuity)}</span>
                  </div>
                  {discountAmount > 0 && appliedDiscount && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[11px]">sell</span>
                        {appliedDiscount.label}
                      </span>
                      <span>−{formatMoney(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Grand total */}
                <div className="flex justify-between items-baseline select-none">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]">{t('Grand Total', '総合計')}</span>
                  <span className="font-serif text-[38px] lg:text-[42px] font-bold text-[#ffe2ab] tracking-wide leading-none select-none">
                    {formatMoney(grandTotal)}
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 disabled:text-[#402d00]/45 text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    <span className="material-symbols-outlined text-base">credit_card</span>
                    {isProcessing ? t('Processing...', '処理中...') : t('Process Payment', '会計処理へ進む')}
                  </button>
                </div>

              </div>

            </div>

  );
}
