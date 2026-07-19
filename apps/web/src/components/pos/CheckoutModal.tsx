'use client';

import React from 'react';

const VALID_PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  'DINE10': { type: 'percent', value: 10, label: '10% Off' },
  'DINE20': { type: 'percent', value: 20, label: '20% Off' },
  'VIP50':  { type: 'fixed',   value: 50, label: '$50 Off (VIP)' },
  'HAPPY15':{ type: 'percent', value: 15, label: '15% Happy Hour' },
  'CHEF25': { type: 'percent', value: 25, label: "25% Chef's Special" },
};

interface CheckoutModalProps {
  t: any;
  currency: string;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (val: boolean) => void;
  selectedTicket: any;
  checkoutPaymentMethod: 'card' | 'cash' | 'digital';
  setCheckoutPaymentMethod: (val: 'card' | 'cash' | 'digital') => void;
  
  // Forms & accordion settings
  customerDetailsVisible: boolean;
  setCustomerDetailsVisible: (val: boolean) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  
  discountSettingsVisible: boolean;
  setDiscountSettingsVisible: (val: boolean) => void;
  promoCodeInput: string;
  setPromoCodeInput: (val: string) => void;
  appliedPromo: any;
  handleApplyPromoCode: () => void;
  handleRemovePromoCode: () => void;
  discountPercent: number;
  setDiscountPercent: (val: number) => void;
  discountFixed: number;
  setDiscountFixed: (val: number) => void;
  
  tipsVisible: boolean;
  setTipsVisible: (val: boolean) => void;
  tipMode: string;
  setTipMode: (val: string) => void;
  cashierTipPresets: string[];
  customTipAmount: number;
  setCustomTipAmount: (val: number) => void;
  
  notesVisible: boolean;
  setNotesVisible: (val: boolean) => void;
  checkoutNotes: string;
  setCheckoutNotes: (val: string) => void;
  
  isProcessing: boolean;
  handleProcessCheckoutSubmit: () => void;
  handleSplitBill: () => void;
}

export default function CheckoutModal({
  t,
  currency,
  checkoutModalOpen,
  setCheckoutModalOpen,
  selectedTicket,
  checkoutPaymentMethod,
  setCheckoutPaymentMethod,
  customerDetailsVisible,
  setCustomerDetailsVisible,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  discountSettingsVisible,
  setDiscountSettingsVisible,
  promoCodeInput,
  setPromoCodeInput,
  appliedPromo,
  handleApplyPromoCode,
  handleRemovePromoCode,
  discountPercent,
  setDiscountPercent,
  discountFixed,
  setDiscountFixed,
  tipsVisible,
  setTipsVisible,
  tipMode,
  setTipMode,
  cashierTipPresets,
  customTipAmount,
  setCustomTipAmount,
  notesVisible,
  setNotesVisible,
  checkoutNotes,
  setCheckoutNotes,
  isProcessing,
  handleProcessCheckoutSubmit,
  handleSplitBill
}: CheckoutModalProps) {

  const formatPrice = (val: number) => {
    if (currency === 'JPY' || currency === 'KRW') return `¥${Math.round(val).toLocaleString()}`;
    return `$${val.toFixed(2)}`;
  };

  const formatMoney = formatPrice;
  const [discountMode, setDiscountMode] = React.useState<'percent' | 'fixed' | 'promo'>('percent');

  const subtotal = selectedTicket ? selectedTicket.items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0) : 0;
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = subtotal * (appliedPromo.value / 100);
    } else {
      discountAmount = Math.min(appliedPromo.value, subtotal);
    }
  }

  const appliedDiscount = appliedPromo ? {
    label: appliedPromo.code || (appliedPromo.type === 'percent' ? `${appliedPromo.value}% Off` : `¥${appliedPromo.value} Off`),
    amount: discountAmount
  } : null;

  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * (selectedTicket?.taxRate || 0.085);
  const autoGratuity = subtotal * (selectedTicket?.gratuityRate || 0);

  let tipAmount = 0;
  if (tipMode === 'pct15') tipAmount = discountedSubtotal * 0.15;
  else if (tipMode === 'pct18') tipAmount = discountedSubtotal * 0.18;
  else if (tipMode === 'pct20') tipAmount = discountedSubtotal * 0.20;
  else if (tipMode === 'custom') tipAmount = customTipAmount;

  const gratuity = autoGratuity;
  const grandTotal = discountedSubtotal + tax + autoGratuity;
  const total = grandTotal + tipAmount;

  return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12110f] border border-[#ffe2ab]/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between select-none bg-[#0a0a09]">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Process Checkout</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  Table {selectedTicket.tableNumber} • Order {selectedTicket.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-[#A69984] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Payment Methods */}
              <div className="space-y-2.5">
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider select-none">{t("Payment Method", "支払い方法")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['card', 'cash', 'digital'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setCheckoutPaymentMethod(method)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        checkoutPaymentMethod === method
                          ? 'border-[#ffe2ab] bg-[#ffe2ab]/5 text-[#ffe2ab]'
                          : 'border-white/5 bg-[#161513]/40 text-[#A69984]/60 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl mb-1.5">
                        {method === 'card' ? 'credit_card' : method === 'cash' ? 'payments' : 'devices'}
                      </span>
                      <span className="font-sans font-bold text-[9px] uppercase tracking-wider">
                        {method === 'card' ? t('Credit / Stripe', 'クレジットカード') : method === 'cash' ? t('Cash', '現金') : t('Digital Wallet', 'モバイル決済')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Details Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setCustomerDetailsVisible(!customerDetailsVisible)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    customerDetailsVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">person</span>
                    <span className="font-sans font-bold text-xs text-white">{t("Customer Details", "顧客情報")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{customerName ? customerName : t('Not Set', '未設定')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {customerDetailsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {customerDetailsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider select-none">{t("Customer Name", "お名前")}</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider select-none">{t("Phone Number", "電話番号")}</label>
                        <input
                          type="tel"
                          placeholder="e.g. (555) 000-0000"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Discount Settings Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setDiscountSettingsVisible(!discountSettingsVisible)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    discountSettingsVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">sell</span>
                    <span className="font-sans font-bold text-xs text-white">{t("Discount Settings", "割引設定")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{appliedDiscount ? appliedDiscount.label : t('No Discount', '割引なし')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {discountSettingsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {discountSettingsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="flex justify-between items-center select-none font-sans">
                      <span className="font-sans font-bold text-[9.5px] uppercase tracking-wider text-[#A69984]">{t("Discount Settings", "割引設定")}</span>
                      {appliedDiscount && (
                        <button
                          type="button"
                          onClick={handleRemovePromoCode}
                          className="text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span> {t("Remove Discount", "割引解除")}
                        </button>
                      )}
                    </div>

                    {/* Sub-tabs for Discount Types inside modal */}
                    <div className="flex gap-1 bg-black/40 rounded-lg p-1 select-none">
                      {(['percent', 'fixed', 'promo'] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDiscountMode(mode)}
                          className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            discountMode === mode ? 'bg-white/10 text-white' : 'text-[#A69984]/50 hover:text-white'
                          }`}
                        >
                          {mode === 'percent' ? t('% Rate', '％率') : mode === 'fixed' ? t('Fixed $', '定額') : t('Promo Code', 'プロモコード')}
                        </button>
                      ))}
                    </div>

                    {/* Discount input fields inside checkout modal */}
                    <div className="flex gap-2">
                      {discountMode === 'percent' && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent || ''}
                          onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                          placeholder={t("Enter Percentage (e.g. 15)", "割合を入力 (例: 15)")}
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      )}
                      {discountMode === 'fixed' && (
                        <input
                          type="number"
                          min="0"
                          value={discountFixed || ''}
                          onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)}
                          placeholder={t("Enter Amount (e.g. 10.00)", "金額を入力 (例: 1000)")}
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      )}
                      {discountMode === 'promo' && (
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder={t("ENTER PROMO CODE", "プロモコードを入力")}
                          className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors tracking-widest font-mono"
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleApplyPromoCode}
                        className="px-5 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all shrink-0"
                      >
                        {t("Apply", "適用")}
                      </button>
                    </div>

                    {/* Helper Promo Quick Buttons inside modal */}
                    {discountMode === 'promo' && (
                      <div className="flex flex-wrap gap-1.5 select-none">
                        {Object.keys(VALID_PROMO_CODES).slice(0, 4).map(code => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setPromoCodeInput(code)}
                            className="px-2.5 py-1 bg-white/5 border border-white/5 hover:border-[#ffe2ab]/25 rounded-lg text-[9px] font-bold tracking-wider text-[#A69984] hover:text-[#ffe2ab] cursor-pointer transition-all font-mono"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Display currently applied discount in modal */}
                    {appliedDiscount && (
                      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 animate-fade-in select-none">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-emerald-400">sell</span>
                          <span className="text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            {appliedDiscount.label}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold text-xs">
                          −{formatMoney(appliedDiscount.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tip Selection Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setTipsVisible(!tipsVisible)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    tipsVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">payments</span>
                    <span className="font-sans font-bold text-xs text-white">{t("Add Tip / Gratuity", "チップ／サービス料追加")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{tipAmount > 0 ? formatMoney(tipAmount) : t('No Tip', 'チップなし')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {tipsVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {tipsVisible && (
                  <div className="p-5 space-y-4 animate-fade-in bg-[#12110f]/20">
                    <div className="grid grid-cols-5 gap-2 select-none">
                      {['none', ...cashierTipPresets, 'custom'].map(mode => {
                        const label = mode === 'none' ? t('No Tip', 'チップなし') : mode === 'custom' ? t('Custom', 'カスタム') : `${mode}%`;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setTipMode(mode)}
                            className={`py-2 rounded-xl border font-sans font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                              tipMode === mode
                                ? 'border-[#ffe2ab] bg-[#ffe2ab]/5 text-[#ffe2ab]'
                                : 'border-white/5 bg-[#0e0e0d] text-[#A69984]/60 hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
 
                    {tipMode === 'custom' && (
                      <div className="space-y-1.5 animate-fade-in font-sans">
                        <label className="text-[10px] text-[#A69984]/70 font-semibold uppercase tracking-wider block select-none">
                          {t("Custom Tip Amount", "カスタムチップ額")} ({currency === 'JPY' ? '¥' : '$'})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={currency === 'JPY' ? '1' : '0.01'}
                          placeholder={currency === 'JPY' ? 'e.g. 500' : 'e.g. 5.00'}
                          value={customTipAmount || ''}
                          onChange={(e) => setCustomTipAmount(parseFloat(e.target.value) || 0)}
                          className="w-full sm:w-1/2 bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
 
              {/* Receipt / Checkout Notes Accordion Card */}
              <div className="border border-white/5 bg-[#161513]/20 rounded-xl overflow-hidden">
                <div 
                  onClick={() => setNotesVisible(!notesVisible)}
                  className={`flex items-center justify-between px-5 py-3.5 bg-[#161513]/40 cursor-pointer hover:bg-white/[0.02] transition-all select-none ${
                    notesVisible ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-sans">
                    <span className="material-symbols-outlined text-sm text-[#ffe2ab]">sticky_note_2</span>
                    <span className="font-sans font-bold text-xs text-white">{t("Checkout Notes / Instructions", "会計メモ・指示")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-[10px] text-[#A69984]/60">
                    <span>{checkoutNotes ? t('Note Added', 'メモあり') : t('No Notes', 'メモなし')}</span>
                    <span className="material-symbols-outlined text-base leading-none">
                      {notesVisible ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {notesVisible && (
                  <div className="p-5 space-y-3 animate-fade-in bg-[#12110f]/20">
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider select-none font-sans">{t("Checkout Notes / Special Requests", "会計メモ・特別リクエスト")}</label>
                    <textarea
                      rows={2}
                      placeholder={t("Add notes for the receipt, billing split details, or payment exceptions...", "領収書メモ、請求書分割の詳細、または支払いの例外を追加します...")}
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 transition-colors resize-none"
                    />
                  </div>
                )}
              </div>
 
              {/* Order Calculations Summary */}
              <div className="bg-[#0a0a09] border border-white/5 rounded-xl p-5 space-y-3 font-sans select-none">
                <div className="flex justify-between text-xs text-[#A69984]/70">
                  <span>{t("Subtotal", "小計")}</span>
                  <span className="text-white font-mono">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#A69984]/70">
                  <span>{t("Tax", "消費税")} ({((selectedTicket?.taxRate || 0.085) * 100).toFixed(1)}%)</span>
                  <span className="text-white font-mono">{formatMoney(tax)}</span>
                </div>
                {gratuity > 0 && (
                  <div className="flex justify-between text-xs text-[#A69984]/70">
                    <span>{t("Gratuity", "サービス料")}</span>
                    <span className="text-white font-mono">{formatMoney(gratuity)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#ffe2ab]/90">
                    <span>{t("Tip", "チップ")}</span>
                    <span className="text-[#ffe2ab] font-mono">{formatMoney(tipAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>{t("Discount", "割引")}</span>
                    <span className="font-mono">−{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#A69984] uppercase tracking-wider">{t("Grand Total Due", "お支払い総計")}</span>
                  <span className="text-2xl font-bold text-[#ffe2ab] font-serif tracking-wider">
                    {formatMoney(grandTotal + tipAmount)}
                  </span>
                </div>
              </div>
            </div>
 
            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-[#0a0a09] border-t border-white/5 flex flex-wrap sm:flex-nowrap gap-3 select-none">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                {t("Cancel", "キャンセル")}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleSplitBill();
                  setCheckoutModalOpen(false);
                }}
                className="flex-1 py-3 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm font-bold">call_split</span>
                <span>{t("Split Check", "個別会計")}</span>
              </button>
 
              <button
                type="button"
                onClick={handleProcessCheckoutSubmit}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] disabled:bg-[#ffe2ab]/30 text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>{t("Processing...", "処理中...")}</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>{t("Complete Payment", "支払い完了")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
  );
}
