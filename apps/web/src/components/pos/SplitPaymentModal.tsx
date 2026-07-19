'use client';

import React from 'react';

interface SplitPaymentModalProps {
  t: any;
  currency: string;
  splitModalOpen: boolean;
  setSplitModalOpen: (val: boolean) => void;
  selectedTicket: any;
  splitMethod: 'evenly' | 'by-item';
  setSplitMethod: (val: 'evenly' | 'by-item') => void;
  splitGuestCount: number;
  setSplitGuestCount: (val: number) => void;
  
  // split billing state
  splitPaidGuests: number[];
  setSplitPaidGuests: React.Dispatch<React.SetStateAction<number[]>>;
  splitItemAssignments: Record<number, number>;
  setSplitItemAssignments: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  
  // callbacks & parent scope variables
  updateTicketSplits: (updates: any) => void;
  triggerToast: (msg: string) => void;
  checkoutPaymentMethod: string;
  tipAmount: number;
  getItemPrice: (item: any) => number;
}

export default function SplitPaymentModal({
  t,
  currency,
  splitModalOpen,
  setSplitModalOpen,
  selectedTicket,
  splitMethod,
  setSplitMethod,
  splitGuestCount,
  setSplitGuestCount,
  splitPaidGuests,
  setSplitPaidGuests,
  splitItemAssignments,
  setSplitItemAssignments,
  updateTicketSplits,
  triggerToast,
  checkoutPaymentMethod,
  tipAmount,
  getItemPrice
}: SplitPaymentModalProps) {

  const [guestItemsSelection, setGuestItemsSelection] = React.useState<Record<number, number[]>>({});

  const formatPrice = (val: number) => {
    if (currency === 'JPY' || currency === 'KRW') return `¥${Math.round(val).toLocaleString()}`;
    return `$${val.toFixed(2)}`;
  };
  
  const formatMoney = formatPrice;

  const subtotal = selectedTicket ? selectedTicket.items.reduce((acc: number, item: any) => acc + (getItemPrice(item) * item.qty), 0) : 0;
  const tax = subtotal * (selectedTicket?.taxRate || 0.085);
  const autoGratuity = subtotal * (selectedTicket?.gratuityRate || 0);
  const grandTotal = subtotal + tax + autoGratuity;

  return (
    <>
      {splitModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12110f] border border-[#ffe2ab]/20 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between select-none bg-[#0a0a09]">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">{t('Split Check Calculator', '伝票分割計算')}</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1.5">
                  Table {selectedTicket.tableNumber} • Order {selectedTicket.orderNumber}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSplitModalOpen(false)}
                className="text-[#A69984] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Split Method Toggle Tabs */}
            <div className="bg-black/35 border-b border-white/5 px-8 py-3.5 flex justify-between items-center flex-shrink-0 select-none">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSplitMethod('evenly');
                    updateTicketSplits({ splitMethod: 'evenly' });
                  }}
                  className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all duration-300 cursor-pointer ${
                    splitMethod === 'evenly' 
                      ? 'bg-[#ffe2ab] text-[#402d00] shadow-md' 
                      : 'text-[#A69984]/70 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {t('Split Evenly', '等分に割る')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSplitMethod('by-item');
                    updateTicketSplits({ splitMethod: 'by-item' });
                  }}
                  className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all duration-300 cursor-pointer ${
                    splitMethod === 'by-item' 
                      ? 'bg-[#ffe2ab] text-[#402d00] shadow-md' 
                      : 'text-[#A69984]/70 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {t('Split by Item', '品目ごとに分ける')}
                </button>
              </div>
              <div className="text-[11px] text-[#ffe2ab]/90 font-serif font-bold italic tracking-wide">
                {t('Grand Total', '総合計')}: {formatMoney(grandTotal + tipAmount)}
              </div>
            </div>

            {/* Modal Body content */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0 bg-[#0e0e0d]">
              
              {splitMethod === 'evenly' ? (
                <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-between min-h-0">
                  {/* Guest count slider */}
                  <div className="space-y-4 mb-8 bg-[#161513]/40 border border-white/5 p-6 rounded-2xl select-none">
                    <div className="flex justify-between items-center">
                      <label className="text-[#A69984] text-[10px] font-bold uppercase tracking-widest">{t('Number of Parties', '分割人数')}</label>
                      <span className="font-serif text-2xl font-bold text-white pr-2">{splitGuestCount} {t('Covers', '名')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => {
                          const val = Math.max(2, splitGuestCount - 1);
                          setSplitGuestCount(val);
                          setSplitPaidGuests(prev => prev.filter(g => g < val));
                          updateTicketSplits({ 
                            splitGuestCount: val,
                            splitPaidGuests: splitPaidGuests.filter(g => g < val)
                          });
                        }}
                        disabled={splitGuestCount <= 2}
                        className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer font-bold"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={splitGuestCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setSplitGuestCount(val);
                          setSplitPaidGuests(prev => prev.filter(g => g < val));
                          updateTicketSplits({ 
                            splitGuestCount: val,
                            splitPaidGuests: splitPaidGuests.filter(g => g < val)
                          });
                        }}
                        aria-label="Split Parties"
                        className="flex-grow accent-[#ffe2ab]"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const val = Math.min(10, splitGuestCount + 1);
                          setSplitGuestCount(val);
                          updateTicketSplits({ splitGuestCount: val });
                        }}
                        disabled={splitGuestCount >= 10}
                        className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#ffe2ab] hover:bg-white/5 disabled:opacity-35 cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Even portions display list */}
                  <div className="space-y-3 flex-grow overflow-y-auto">
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block select-none">{t('Portions Breakdown', '分割内訳')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: splitGuestCount }).map((_, idx) => {
                        const guestLetter = String.fromCharCode(65 + idx); // A, B, C...
                        const isPaid = splitPaidGuests.includes(idx);
                        const shareTotal = (grandTotal + tipAmount) / splitGuestCount;
                        return (
                          <div key={idx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#161513]/20 border-white/5 text-white'}`}>
                            <div className="font-sans">
                              <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">{t('Guest', 'ゲスト')} {guestLetter}</div>
                              <div className="font-serif text-lg font-bold mt-1 text-[#ffe2ab]">{formatMoney(shareTotal)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                let newPaid = [];
                                if (isPaid) {
                                  newPaid = splitPaidGuests.filter(g => g !== idx);
                                  setSplitPaidGuests(newPaid);
                                  triggerToast(t(`Guest ${guestLetter}'s payment refunded.`, `ゲスト ${guestLetter} の支払いが払い戻されました。`));
                                } else {
                                  newPaid = [...splitPaidGuests, idx];
                                  setSplitPaidGuests(newPaid);
                                  triggerToast(t(`Guest ${guestLetter}'s portion of ${formatMoney(shareTotal)} paid via ${checkoutPaymentMethod.toUpperCase()}!`, `ゲスト ${guestLetter} の ${formatMoney(shareTotal)} の支払いが ${checkoutPaymentMethod.toUpperCase()} で完了しました！`));
                                }
                                updateTicketSplits({ splitPaidGuests: newPaid });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[9.5px] uppercase tracking-wider font-bold cursor-pointer transition-all border ${
                                isPaid
                                  ? 'bg-[#1e3a1f] hover:bg-[#2c5c2d] border-emerald-500/20 text-emerald-300'
                                  : 'bg-[#ffe2ab] hover:bg-[#ffdca0] border-amber-500/10 text-[#402d00]'
                              }`}
                            >
                              {isPaid ? t('Paid (Refund)', '支払済 (返金)') : t('Pay Now', '今すぐ支払')}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Split by item view
                <div className="flex-grow flex flex-col lg:flex-row min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5 select-none">
                  
                  {/* Left Column: Ticket Items Assignment list */}
                  <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-between min-h-0">
                    <div className="space-y-4">
                      <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block">{t('Assign Items to Guests', '品目をゲストに割り当て')}</span>
                      <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1 divide-y divide-white/5">
                        {selectedTicket.items.map((item: any, itemIdx: number) => {
                          const activeGuestIndex = splitItemAssignments[itemIdx] ?? 0;
                          return (
                            <div key={itemIdx} className="py-4 flex justify-between items-center gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="font-sans font-bold text-xs text-white truncate">
                                  {item.qty > 1 && <span className="text-[#ffe2ab] mr-1.5">{item.qty}x</span>}
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-[#A69984]/50 font-medium font-mono mt-0.5">{formatMoney(getItemPrice(item) * item.qty)}</div>
                              </div>
                              
                              {/* Guest Selector Dropdown */}
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[9.5px] text-[#A69984] font-semibold font-sans uppercase mr-1">{t('Assign to', '割当')}:</span>
                                <div className="grid grid-cols-5 gap-1 select-none">
                                  {Array.from({ length: Math.min(5, splitGuestCount) }).map((_, gIdx) => {
                                    const isActive = activeGuestIndex === gIdx;
                                    return (
                                      <button
                                        key={gIdx}
                                        type="button"
                                        onClick={() => {
                                          const newAssignments = { ...splitItemAssignments, [itemIdx]: gIdx };
                                          setSplitItemAssignments(newAssignments);
                                          updateTicketSplits({ splitItemAssignments: newAssignments });
                                          
                                          // Update selections grouping
                                          setGuestItemsSelection(prev => {
                                            const updated = { ...prev };
                                            // Remove from all other guests
                                            Object.keys(updated).forEach(k => {
                                              const keyNum = parseInt(k, 10);
                                              updated[keyNum] = (updated[keyNum] || []).filter((idxVal: number) => idxVal !== itemIdx);
                                            });
                                            // Add to active
                                            updated[gIdx] = [...(updated[gIdx] || []), itemIdx];
                                            return updated;
                                          });
                                        }}
                                        className={`w-7 h-7 rounded-lg text-[10px] font-sans font-bold flex items-center justify-center transition-all border cursor-pointer ${
                                          isActive 
                                            ? 'bg-[#ffe2ab] border-[#ffe2ab] text-[#402d00] font-black' 
                                            : 'bg-white/5 border-white/5 text-[#A69984]/60 hover:text-white hover:border-white/10'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + gIdx)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Guest Totals display cards */}
                  <div className="w-full lg:w-[380px] p-8 overflow-y-auto bg-black/15 flex flex-col justify-between min-h-0 shrink-0">
                    <div className="space-y-4">
                      <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider block">{t('Guest Totals & Checkout', 'ゲストごとの合計と会計')}</span>
                      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                        {Array.from({ length: splitGuestCount }).map((_, gIdx) => {
                          const guestLetter = String.fromCharCode(65 + gIdx);
                          const isPaid = splitPaidGuests.includes(gIdx);
                          
                          // Calculate guest share based on assigned items
                          const assignedItemIndices = Object.keys(splitItemAssignments)
                            .filter(k => splitItemAssignments[parseInt(k, 10)] === gIdx)
                            .map(k => parseInt(k, 10));
                          
                          const guestSubtotal = assignedItemIndices.reduce((sum, idxVal) => {
                            const item = selectedTicket.items[idxVal];
                            return sum + (getItemPrice(item) * item.qty);
                          }, 0);

                          const guestTax = guestSubtotal * (selectedTicket?.taxRate || 0.085);
                          const guestGratuity = guestSubtotal * (selectedTicket?.gratuityRate || 0);
                          const guestTotal = guestSubtotal + guestTax + guestGratuity;

                          return (
                            <div key={gIdx} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#161513]/25 border-white/5 text-white'}`}>
                              <div className="font-sans min-w-0 flex-1 pr-3">
                                <div className="text-[10px] text-[#A69984] font-bold uppercase tracking-wider">{t('Guest', 'ゲスト')} {guestLetter}</div>
                                <div className="font-serif text-[15px] font-bold mt-1 text-[#ffe2ab] truncate">{formatMoney(guestTotal)}</div>
                                <div className="text-[8.5px] text-[#A69984]/60 font-semibold mt-1">
                                  {assignedItemIndices.length} {t('Items assigned', '品目割り当て')}
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                disabled={guestTotal <= 0}
                                onClick={() => {
                                  let newPaid = [];
                                  if (isPaid) {
                                    newPaid = splitPaidGuests.filter(g => g !== gIdx);
                                    setSplitPaidGuests(newPaid);
                                    triggerToast(t(`Guest ${guestLetter}'s payment refunded.`, `ゲスト ${guestLetter} の支払いが払い戻されました。`));
                                  } else {
                                    newPaid = [...splitPaidGuests, gIdx];
                                    setSplitPaidGuests(newPaid);
                                    triggerToast(t(`Guest ${guestLetter} paid ${formatMoney(guestTotal)} via ${checkoutPaymentMethod.toUpperCase()}!`, `ゲスト ${guestLetter} が ${formatMoney(guestTotal)} を ${checkoutPaymentMethod.toUpperCase()} で支払いました！`));
                                  }
                                  updateTicketSplits({ splitPaidGuests: newPaid });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[9.5px] uppercase tracking-wider font-bold cursor-pointer transition-all border disabled:opacity-20 disabled:cursor-not-allowed ${
                                  isPaid
                                    ? 'bg-[#1e3a1f] hover:bg-[#2c5c2d] border-emerald-500/20 text-emerald-300'
                                    : 'bg-[#ffe2ab] hover:bg-[#ffdca0] border-amber-500/10 text-[#402d00]'
                                }`}
                              >
                                {isPaid ? t('Paid', '支払済') : t('Checkout', '会計')}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Sticky footer actions */}
            <div className="bg-[#0a0a09] border-t border-white/5 px-8 py-5.5 flex justify-between items-center shrink-0 select-none">
              <div className="text-[10px] text-[#A69984] font-semibold uppercase tracking-wider">
                {splitPaidGuests.length} / {splitGuestCount} {t('portions collected', '件の支払いを回収')}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSplitPaidGuests([]);
                    setSplitItemAssignments({});
                    updateTicketSplits({ splitPaidGuests: [], splitItemAssignments: {} });
                    triggerToast(t('Split billing configurations reset.', '分割会計設定がリセットされました。'));
                  }}
                  className="px-5.5 py-3 rounded-xl font-sans text-xs font-bold text-[#A69984] hover:text-white transition-colors cursor-pointer border border-white/5 bg-white/[0.01]"
                >
                  {t('Reset Calculator', '計算初期化')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (splitPaidGuests.length < splitGuestCount) {
                      if (!confirm(t('Not all parties have completed checkout. Close split drawer anyway?', 'すべての支払いが回収されていません。伝票分割を終了しますか？'))) {
                        return;
                      }
                    }
                    setSplitModalOpen(false);
                  }}
                  className="px-6 py-3 rounded-xl font-sans text-xs font-bold bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] transition-colors cursor-pointer"
                >
                  {t('Close Splits', '分割終了')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
