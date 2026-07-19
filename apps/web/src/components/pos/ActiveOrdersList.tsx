'use client';

import React from 'react';

interface ActiveOrdersListProps {
  t: any;
  mobileView: 'list' | 'detail';
  setMobileView: (val: 'list' | 'detail') => void;
  quickFilter: 'open' | 'payment' | 'vip';
  setQuickFilter: (val: 'open' | 'payment' | 'vip') => void;
  filteredTickets: any[];
  selectedTicketId: string;
  setSelectedTicketId: (val: string) => void;
  taxType: 'pre-tax' | 'post-tax';
  getTicketCardAmount: (t: any, taxType?: 'pre-tax' | 'post-tax') => number;
  formatMoney: (amount: number) => string;
}

export default function ActiveOrdersList({
  t,
  mobileView,
  setMobileView,
  quickFilter,
  setQuickFilter,
  filteredTickets,
  selectedTicketId,
  setSelectedTicketId,
  taxType,
  getTicketCardAmount,
  formatMoney
}: ActiveOrdersListProps) {
  return (
          <div className={`w-full lg:w-[320px] xl:w-[420px] border-r border-white/5 flex-col h-full bg-[#11100e]/50 flex-shrink-0 select-none ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Quick Filters toolbar */}
            <div className="p-6 pb-4 border-b border-white/5 flex gap-2 flex-shrink-0">
              <button
                onClick={() => setQuickFilter('open')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'open' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                {t("All Open", "すべての未決済")}
              </button>
              <button
                onClick={() => setQuickFilter('payment')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'payment' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                {t("Needs Payment", "要支払い")}
              </button>
              <button
                onClick={() => setQuickFilter('vip')}
                className={`px-4 py-2 rounded-full font-sans text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${quickFilter === 'vip' ? 'bg-[#ffe2ab] text-[#402d00] shadow' : 'text-[#A69984]/80 border border-white/5 hover:text-white'}`}
              >
                {t("VIP", "VIP")}
              </button>
            </div>

            {/* List of active order cards */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => {
                  const isActive = ticket.id === selectedTicketId;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => { setSelectedTicketId(ticket.id); setMobileView('detail'); }}
                      className={`border rounded-2xl p-6 transition-all duration-300 cursor-pointer relative shadow-md ${isActive ? 'border-[#ffe2ab] bg-white/[0.01]' : 'border-white/5 hover:border-white/10 bg-[#161513]/40'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-white text-base">{ticket.tableNumber}</h4>
                          {ticket.isVip && (
                            <span className="bg-[#ffe2ab] text-[#402d00] font-sans font-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded select-none">
                              {t("VIP", "VIP")}
                            </span>
                          )}
                          {ticket.isSplit && (
                            <span className="bg-white/5 text-[#A69984]/60 font-sans font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 select-none">
                              {t("Split Check", "個別会計")}
                            </span>
                          )}
                        </div>
                        <div className="font-sans font-bold text-base text-[#ffe2ab]">{formatMoney(getTicketCardAmount(ticket, taxType))}</div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[#A69984]/65 font-medium mt-4">
                        <span>{t("Server", "接客係")}: {ticket.serverName}</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span>{ticket.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-[#A69984]/40 font-sans text-xs select-none">
                  {t("No open orders matching selection filters.", "選択条件に一致する未決済注文はありません。")}
                </div>
              )}
            </div>

          </div>

  );
}
