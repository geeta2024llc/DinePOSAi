'use client';

import React from 'react';

export default function SupportManager(props: any) {
  const {
    t, theme, isLightTheme, activeTab, triggerToast, tickets,
    supportFilter, setSupportFilter, selectedTicket, setSelectedTicket,
    supportReply, setSupportReply, handleSendTicketReply,
    handleUpdateTicketStatus, stripeLinked, stripeSecretKeyInput,
    setStripeSecretKeyInput, stripeWebhookSecretInput, setStripeWebhookSecretInput,
    stripeLoading, showStripeModal, setShowStripeModal, handleLinkStripe,
    handleUnlinkStripe, activeActionMenuId, setActiveActionMenuId, hBg, hText,
    ticketFilterStatus,
    setTicketFilterStatus, ticketFilterType, setTicketFilterType,
    setShowPlanEditorModal
  } = props;

  return (
    <>
          {activeTab === 'support' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Page Headers */}
              <div className="flex justify-between items-center select-none">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Support Ticket Portal
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Resolve operational issues, billing inquiries, and technical tickets submitted by restaurant owners.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button type="button" 
                    onClick={() => triggerToast('Fetching latest tickets...', 'info')}
                    className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] rounded-xl cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">refresh</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans select-none">
                {/* Total */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('ALL')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'ALL' ? 'bg-[#ffc53d]/5 border-[#ffc53d]/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">All Support Inquiries</span>
                  <h4 className="text-2xl font-bold mt-1.5">{tickets.length} Tickets</h4>
                </button>
                {/* Open */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('OPEN')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'OPEN' ? 'bg-rose-500/5 border-rose-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Open (Unresolved)</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 motion-safe:animate-ping"></span>
                  </div>
                  <h4 className="text-2xl font-bold text-rose-400 mt-1.5">{tickets.filter((t: any) => t.status === 'OPEN').length} Tickets</h4>
                </button>
                {/* In Progress */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('IN_PROGRESS')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'IN_PROGRESS' ? 'bg-amber-500/5 border-amber-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">In Investigation</span>
                  <h4 className="text-2xl font-bold text-amber-400 mt-1.5">{tickets.filter((t: any) => t.status === 'IN_PROGRESS').length} Tickets</h4>
                </button>
                {/* Resolved */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('RESOLVED')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'RESOLVED' ? 'bg-emerald-500/5 border-emerald-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Resolved Cases</span>
                  <h4 className="text-2xl font-bold text-emerald-400 mt-1.5">{tickets.filter((t: any) => t.status === 'RESOLVED').length} Tickets</h4>
                </button>
              </div>

              {/* Splitscreen Ticket Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Tickets list (Span 7) */}
                <div className="lg:col-span-7">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Support Desk Tickets</h3>
                      
                      {/* Ticket Type filter dropdown */}
                      <select
                        aria-label="Ticket type filter"
                        value={ticketFilterType}
                        onChange={(e) => setTicketFilterType(e.target.value as any)}
                        className="bg-[#0e0e0d] border border-white/10 hover:border-white/20 text-[#e5e2e1] text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer focus:outline-none"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing">Billing Inquiry</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-4 font-sans text-xs max-h-[500px] overflow-y-auto pr-1">
                      {tickets
                        .filter((t: any) => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                        .filter((t: any) => ticketFilterType === 'ALL' || t.inquiryType === ticketFilterType)
                        .map((t: any) => {
                          const isSelected = selectedTicket && selectedTicket.id === t.id;
                          return (
                            <div 
                              key={t.id}
                              onClick={() => {
                                setSelectedTicket(t);
                                setSupportReply(t.replyMessage || '');
                              }}
                              className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-start gap-4 ${
                                isSelected 
                                  ? 'bg-[#ffe2ab]/5 border-[#ffe2ab]/30 shadow-md scale-[1.01]' 
                                  : 'bg-[#0e0e0d]/50 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                                    t.inquiryType === 'Technical Support' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    t.inquiryType === 'Billing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  }`}>
                                    {t.inquiryType}
                                  </span>
                                  <span className="text-[10px] text-[#A69984]/50 font-bold">{new Date(t.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-white font-serif font-bold text-[13.5px]">{t.establishment}</h4>
                                <p className="text-[#A69984]/80 text-[11px] leading-relaxed line-clamp-2">{t.message}</p>
                                <span className="text-[10px] text-[#A69984]/55 block font-medium">Contact: {t.name}</span>
                              </div>

                              <div className="flex flex-col items-end gap-3 justify-between h-full min-h-[70px]">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest select-none ${
                                  t.status === 'OPEN' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]' :
                                  t.status === 'IN_PROGRESS' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {t.status.replace('_', ' ')}
                                </span>

                                <button type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerToast('Ticket deletion is not allowed.', 'info');
                                  }}
                                  className="text-[9px] text-[#A69984]/40 hover:text-rose-400 uppercase font-bold tracking-widest transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {tickets
                        .filter((t: any) => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                        .filter((t: any) => ticketFilterType === 'ALL' || t.inquiryType === ticketFilterType)
                        .length === 0 && (
                        <div className="text-center py-20 text-[#A69984]/30 select-none border border-dashed border-white/5 rounded-2xl">
                          No support inquiries found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Ticket details pane (Span 5) */}
                <div className="lg:col-span-5">
                  {selectedTicket ? (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 animate-fade-in duration-200`}>
                      <div className="pb-4 border-b border-white/5 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest font-sans">Ticket: {selectedTicket.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                            selectedTicket.status === 'OPEN' ? 'bg-rose-500/10 text-rose-400' :
                            selectedTicket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                        <h3 className="font-serif text-[18px] font-bold text-white leading-tight">{selectedTicket.establishment}</h3>
                        <p className="text-[11px] text-[#A69984]/60 font-semibold">{selectedTicket.name} • {selectedTicket.email}</p>
                      </div>

                      {/* Ticket inquiry detail */}
                      <div className="bg-[#0e0e0d]/80 border border-white/5 rounded-xl p-5 text-xs font-sans space-y-3">
                        <div className="font-bold text-[9.5px] text-[#ffe2ab]/70 uppercase tracking-widest">Inquiry Message:</div>
                        <p className="text-white/90 leading-relaxed font-medium select-text">{selectedTicket.message}</p>
                      </div>

                      {/* Reply form */}
                      <div className="space-y-4 font-sans text-xs">
                        {selectedTicket.replyMessage ? (
                          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-1.5 font-bold text-[9.5px] text-emerald-400 uppercase tracking-widest">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Resolved Reply:
                            </div>
                            <p className="text-[#A69984] leading-relaxed font-semibold italic">"{selectedTicket.replyMessage}"</p>
                          </div>
                        ) : (
                          <form onSubmit={handleSendTicketReply} className="space-y-2.5">
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider">Reply & Resolve Message</label>
                            <textarea
                              rows={4}
                              value={supportReply}
                              onChange={(e) => setSupportReply(e.target.value)}
                              placeholder="Type response and instructions to resolve the ticket..."
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40 resize-none placeholder-white/20 font-medium"
                            />
                            
                            <div className="flex gap-3 pt-2">
                              {selectedTicket.status !== 'IN_PROGRESS' && (
                                <button type="button"
                                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                                  className="px-4 py-3 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                >
                                  Investigate
                                </button>
                              )}
                              <button type="submit"
                                className="flex-grow py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center shadow-md"
                              >
                                Send Response & Resolve
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="h-full min-h-[300px] border border-dashed border-white/5 rounded-2xl flex flex-col justify-center items-center text-center p-8 select-none text-[#A69984]/30">
                      <span className="material-symbols-outlined text-3xl mb-3">inbox</span>
                      <p className="font-serif text-sm">No ticket selected</p>
                      <p className="font-sans text-[11px] mt-1">Select an active ticket from the directory list on the left to resolve.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${theme.border} pb-6 gap-4`}>
                <div className="select-none">
                  <h2 className={`font-serif text-[38px] font-bold text-white tracking-wide leading-none`}>
                    Subscription & Billing
                  </h2>
                  <p className={`font-sans text-[12.5px] ${theme.textMuted} mt-3 leading-relaxed max-w-2xl font-semibold`}>
                    Manage platform pricing tiers, tenant subscription billings, payment gateway configurations, and track recent invoices.
                  </p>
                </div>

                {/* Download Statements trigger */}
                <button type="button"
                  onClick={() => {
                    const header = ['Date', 'Tenant', 'Plan', 'Amount', 'Status', 'Invoice #'];
                    const rows = [
                      ['Nov 15, 2026', 'The Obsidian Room', 'Business', '¥12,980', 'Upcoming', 'INV-8821-NOV'],
                      ['Oct 01, 2026', 'Lumière Brasserie', 'Growth', '¥6,980', 'Paid', 'INV-7734-OCT'],
                      ['Oct 01, 2026', 'Aman Resorts', 'Business', '¥12,980', 'Paid', 'INV-9021-OCT'],
                    ];
                    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `platform_statements_${new Date().toISOString().split('T')[0]}.csv`; a.click();
                    URL.revokeObjectURL(url);
                    triggerToast('Financial statements exported as CSV.', 'success');
                  }}
                  className={`bg-transparent border ${theme.buttonOutline} px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none`}
                >
                  Download Statements
                </button>
              </div>

              {/* Plan Details and Payment Method Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Plan Card (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[250px]`}>
                    {/* Checkmark Watermark Background */}
                    <div className="absolute right-6 bottom-4 text-white/[0.02] pointer-events-none select-none">
                      <span className="material-symbols-outlined text-[140px] leading-none">verified</span>
                    </div>

                    <div className="space-y-6 z-10 font-sans">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                            Platform Billing Overview
                          </span>
                          <h3 className={`font-serif text-3xl font-bold text-white mt-2.5`}>Enterprise Platform Plans</h3>
                          <p className={`text-[11px] ${theme.textMutedLight} font-semibold mt-1`}>
                            DinePosAi Global SaaS Operations • Active Renewals
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`font-serif text-3xl font-bold text-[#ffc53d]`}>¥14,850,000</span>
                          <span className={`text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider mt-0.5`}>Platform MRR</span>
                        </div>
                      </div>

                      {/* Stat meters */}
                      <div className="grid grid-cols-2 gap-8 pt-2 font-sans">
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${theme.textMuted} font-bold uppercase tracking-wider block`}>Active Terminals</span>
                          <div className={`text-sm font-bold text-white`}>1,248 / 1,500 Active</div>
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${theme.textMuted} font-bold uppercase tracking-wider block`}>Total Deployed Storage</span>
                          <div className={`text-sm font-bold text-white`}>242 TB / 500 TB</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 z-10 select-none">
                      <button type="button" 
                        onClick={() => setShowPlanEditorModal(true)}
                        className={`bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md cursor-pointer`}
                      >
                        Manage Plans
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Add-ons: AI Concierge (¥2,000/mo), Self-Checkout (¥1,500/mo), Advanced Analytics (¥3,000/mo). Contact sales for custom modules.', 'info')}
                        className={`bg-transparent border ${theme.buttonOutline} font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 cursor-pointer`}
                      >
                        Billing Add-ons
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method Card (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl min-h-[250px] flex flex-col justify-between`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <h3 className={`font-serif text-sm text-white font-bold tracking-wide`}>Stripe Platform Integration</h3>
                        {stripeLinked && (
                          <button type="button" 
                            onClick={handleUnlinkStripe}
                            className="text-[9.5px] text-rose-400 font-bold tracking-widest hover:text-rose-300 uppercase transition-colors cursor-pointer"
                          >
                            Unlink
                          </button>
                        )}
                      </div>

                      {stripeLoading ? (
                        <div className="flex items-center justify-center py-6 text-white/40">
                          <span className="animate-spin material-symbols-outlined text-lg">sync</span>
                        </div>
                      ) : stripeLinked ? (
                        <div className={`${theme.inputBg}/50 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl p-5 flex items-center justify-between`}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-8 rounded border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-emerald-400 text-lg">account_balance_wallet</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-white">
                                Stripe Connected
                              </div>
                              <div className={`text-[9.5px] text-emerald-400/80 font-bold mt-1`}>Status: Active (Receiving Payments)</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-[8.5px] text-emerald-400 font-bold uppercase tracking-wider select-none leading-none">
                            Live
                          </span>
                        </div>
                      ) : (
                        <div className={`${theme.inputBg}/50 border border-amber-500/20 bg-amber-500/[0.02] rounded-xl p-5 flex items-center justify-between`}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-8 rounded border border-amber-500/30 bg-amber-500/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-amber-400 text-lg">link_off</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-white">
                                Stripe Unlinked
                              </div>
                              <div className={`text-[9.5px] text-amber-400/80 font-bold mt-1`}>Reverting to environmental credentials</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!stripeLinked && (
                      <button type="button" 
                        onClick={() => setShowStripeModal(true)}
                        className={`w-full py-3 bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 hover:bg-[#ffe2ab]/20 text-[#ffe2ab] font-sans font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-4`}
                      >
                        <span className="material-symbols-outlined text-sm font-bold">add_card</span>
                        Link Stripe Credentials
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoices segment */}
              <div className={`${theme.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                <div className={`p-6 border-b ${theme.border} flex justify-between items-center select-none`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${theme.accent} text-lg`}>receipt_long</span>
                    <h3 className={`font-serif text-base text-white font-bold tracking-wide`}>Upcoming & Recent Invoices</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${theme.border} ${theme.inputBg}/50 text-[9.5px] font-bold ${theme.textMuted} uppercase tracking-widest`}>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Tenant / Establishment</th>
                        <th className="px-6 py-4">Pricing Plan</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.divider} font-sans text-xs`}>
                      
                      {/* Row 1 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Nov 15, 2026</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>The Obsidian Room</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                            Business
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥12,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 text-[#A69984]/50 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Upcoming
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading invoice preview...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Oct 01, 2026</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Lumière Brasserie</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                            Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥6,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Sep 02, 2025</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Cafe Zenith</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-semibold">
                            Starter
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥3,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Failed
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Initiated manual retry of payment sequence for Cafe Zenith...', 'info')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-rose-400 transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">replay</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Nov 15, 2025</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>The Obsidian Room</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                            Business
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥12,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 5 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Feb 15, 2026</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Gaggan Anand</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold">
                            Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥6,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

    </>
  );
}
