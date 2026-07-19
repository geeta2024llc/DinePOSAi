'use client';

import React, { useState } from 'react';

export default function ReferralsManager(props: any) {
  const {
    t, theme, isLightTheme, activeTab, triggerToast, ambassadorsList: ambassadors,
    showAddAmbassadorModal,
    setShowAddAmbassadorModal, newAmbassadorData, setNewAmbassadorData,
    handleAddAmbassador, showEditAmbassadorBankModal, setShowEditAmbassadorBankModal,
    editingAmbassadorForBank, setEditingAmbassadorForBank, bankDetailsForm,
    setBankDetailsForm, handleUpdateBankDetails, showQrPosterModal,
    setShowQrPosterModal, selectedAmbassadorForQr, setSelectedAmbassadorForQr,
    showPartnerDashboardPreviewModal, setShowPartnerDashboardPreviewModal,
    selectedAmbassadorForDashboard, setSelectedAmbassadorForDashboard,
    showEditAmbassadorProfileModal,
    setShowEditAmbassadorProfileModal, editingAmbassadorForProfile,
    setEditingAmbassadorForProfile, ambassadorProfileForm, setAmbassadorProfileForm,
    handleUpdateAmbassadorProfile, showAddReferredBusinessModal,
    setShowAddReferredBusinessModal, newReferredBusinessData,
    setNewReferredBusinessData, handleAddReferredBusiness, showPayoutProcessModal,
    setShowPayoutProcessModal, selectedPayoutTransaction, setSelectedPayoutTransaction,
    handleProcessPayoutSubmit, referralsSubTab: referralSubTab,
    setReferralsSubTab: setReferralSubTab, activeActionMenuId, setActiveActionMenuId, hBg, hText,
    ambassadorSearchQuery, setAmbassadorSearchQuery, ambassadorFilterStatus,
    setAmbassadorFilterStatus, showAddAmbassadorModalLocal,
    showEditAmbassadorBankModalLocal, showQrPosterModalLocal,
    showPartnerDashboardPreviewModalLocal, showEditAmbassadorProfileModalLocal,
    showAddReferredBusinessModalLocal, showPayoutProcessModalLocal,
    referralConfig, setReferralConfig, handleExportReferrals
  } = props;

  return (
    <>
          {activeTab === 'referrals' && (
            <div className="space-y-8 animate-fade-in duration-300">

              {/* Page Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="select-none">
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Referrals Management
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Manage ambassadors, track attribution, process reward payouts and configure the referral program.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Program Status Toggle */}
                  <button type="button"
                    onClick={() => {
                      setReferralConfig((prev: any) => ({ ...prev, programActive: !prev.programActive }));
                      triggerToast(`Referral program ${referralConfig.programActive ? 'paused' : 'activated'}.`, 'success');
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest border transition-all cursor-pointer ${
                      referralConfig.programActive
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${referralConfig.programActive ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-rose-400'}`}></span>
                    {referralConfig.programActive ? 'Program Active' : 'Program Paused'}
                  </button>
                  <button type="button"
                    onClick={() => setShowAddAmbassadorModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#ffc53d] text-[#2c1a00] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#ffb014] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Add Ambassador
                  </button>
                  <button
                    type="button"
                    onClick={handleExportReferrals}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export CSV
                  </button>
                  <a
                    href="/partners"
                    target="_blank"
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Partner Portal
                  </a>
                </div>
              </div>

              {/* Sub-navigation tabs */}
              <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 w-fit font-sans">
                {(['overview', 'analytics', 'codes', 'config'] as const).map(tab => (
                  <button type="button"
                    key={tab}
                    onClick={() => setReferralSubTab(tab)}
                    className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer capitalize ${
                      referralSubTab === tab ? 'bg-[#ffc53d] text-[#2c1a00]' : 'text-[#A69984]/60 hover:text-white'
                    }`}
                  >
                    {tab === 'overview' ? 'Overview & Ambassadors' : tab === 'analytics' ? 'Analytics & Insights' : tab === 'codes' ? 'Referral Codes' : 'Program Config'}
                  </button>
                ))}
              </div>

              {/* KPI Summary Row */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
                {[
                  { label: 'Ambassadors', value: ambassadors.length, sub: `${ambassadors.filter(a => a.status === 'active').length} active`, color: 'text-white' },
                  { label: 'Businesses Referred', value: ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0), sub: 'All time', color: 'text-violet-400' },
                  { label: 'Conversion Rate', value: ambassadors.length === 0 ? '0%' : `${Math.round((ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length, 0) / Math.max(ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0), 1)) * 100)}%`, sub: 'Referred → subscribed', color: 'text-sky-400' },
                  { label: 'Pending Payouts', value: `¥${ambassadors.reduce((s, a) => s + a.pendingRewards, 0).toLocaleString()}`, sub: 'Awaiting release', color: 'text-amber-400' },
                  { label: 'Total Paid Out', value: `¥${ambassadors.reduce((s, a) => s + a.paidRewards, 0).toLocaleString()}`, sub: 'All time', color: 'text-emerald-400' },
                ].map(kpi => (
                  <div key={kpi.label} className={`${theme.cardBg} border rounded-2xl p-5 flex flex-col justify-between`}>
                    <span className="font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">{kpi.label}</span>
                    <div className="mt-3">
                      <h3 className={`font-serif text-2xl font-bold ${kpi.color} tracking-wide`}>{kpi.value}</h3>
                      <p className="text-[9.5px] text-[#A69984]/50 font-bold mt-1">{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* OVERVIEW SUB-TAB: Ambassador Directory + Conversion Funnel */}
              {referralSubTab === 'overview' && (
                <div className="space-y-8">

                  {/* Top Performers Leaderboard */}
                  {ambassadors.length > 0 && (() => {
                    const ranked = [...ambassadors]
                      .map(a => ({ ...a, totalEarned: a.paidRewards + a.pendingRewards, conversions: a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length }))
                      .sort((a, b) => b.totalEarned - a.totalEarned)
                      .slice(0, 3);
                    const medals = ['🥇', '🥈', '🥉'];
                    const medalColors = ['text-[#ffc53d]', 'text-[#9ca3af]', 'text-[#b45309]'];
                    const cardBorders = ['border-[#ffc53d]/20', 'border-white/8', 'border-white/8'];
                    return (
                      <div className={`${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                        <div className="flex justify-between items-center mb-5">
                          <div>
                            <h3 className="text-white font-bold text-sm tracking-wide">Top Performers</h3>
                            <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Ranked by lifetime earnings (paid + pending)</p>
                          </div>
                          <span className="material-symbols-outlined text-[#ffc53d] text-xl">workspace_premium</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {ranked.map((amb, idx) => (
                            <div key={amb.id} className={`bg-white/[0.025] border ${cardBorders[idx]} rounded-xl p-4 flex flex-col gap-3`}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{medals[idx]}</span>
                                  <div>
                                    <p className="text-white font-bold text-xs leading-tight">{amb.name}</p>
                                    <p className={`font-mono font-black text-[10px] ${medalColors[idx]} mt-0.5`}>{amb.code}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${amb.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                  {amb.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-white/[0.03] rounded-lg p-2">
                                  <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">Total Earned</p>
                                  <p className={`font-bold text-sm mt-0.5 ${medalColors[idx]}`}>¥{amb.totalEarned.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-2">
                                  <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">Conversions</p>
                                  <p className="text-white font-bold text-sm mt-0.5">{amb.conversions}<span className="text-[#A69984]/40 font-normal text-xs">/{amb.invitedBusinesses.length}</span></p>
                                </div>
                              </div>
                              {amb.pendingRewards > 0 && (
                                <div className="flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-1.5">
                                  <span className="material-symbols-outlined text-amber-400 text-xs">schedule</span>
                                  <span className="text-amber-400 text-[9.5px] font-bold">¥{amb.pendingRewards.toLocaleString()} pending payout</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Conversion Funnel */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Referral Conversion Funnel</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">From referral link click to paid subscription</p>
                      </div>
                      <span className="material-symbols-outlined text-[#ffc53d] text-xl">funnel</span>
                    </div>
                    {(() => {
                      const totalReferred = ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0);
                      const registered = totalReferred;
                      const activated = ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Active' || b.status === 'Subscribed' || b.status === 'Pending').length, 0);
                      const subscribed = ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length, 0);
                      const funnelMax = Math.max(totalReferred, 1);
                      return (
                        <div className="space-y-4">
                          {[
                            { label: 'Referral Links Clicked', value: totalReferred + Math.floor(totalReferred * 0.6), color: 'bg-white/20', textColor: 'text-white/60' },
                            { label: 'Businesses Registered', value: registered, color: 'bg-violet-500/50', textColor: 'text-violet-300' },
                            { label: 'Trials Started', value: activated, color: 'bg-sky-500/50', textColor: 'text-sky-300' },
                            { label: 'Paid Subscriptions', value: subscribed, color: 'bg-emerald-500/60', textColor: 'text-emerald-400' },
                          ].map(stage => {
                            const pct = funnelMax > 0 ? Math.min((stage.value / (totalReferred + Math.floor(totalReferred * 0.6) || 1)) * 100, 100) : 0;
                            return (
                              <div key={stage.label} className="flex items-center gap-4">
                                <div className="w-[160px] text-[10.5px] text-[#A69984]/65 font-semibold flex-shrink-0">{stage.label}</div>
                                <div className="flex-1 bg-white/5 rounded-full h-6 relative overflow-hidden">
                                  <div className={`${stage.color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, stage.value > 0 ? 3 : 0)}%` }}></div>
                                </div>
                                <div className={`w-10 text-right font-bold text-sm ${stage.textColor}`}>{stage.value}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Ambassador Directory */}
                  <div className={`${theme.cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Ambassador Directory</h3>
                        <p className="text-[11px] text-[#A69984]/50 font-semibold mt-0.5">{ambassadors.length} registered partners · Review profiles, banking details, and trigger payouts.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {batchPayoutMode && selectedAmbIds.length > 0 && (
                          <button type="button"
                            onClick={() => {
                              const total = ambassadors.filter(a => selectedAmbIds.includes(a.id)).reduce((s, a) => s + a.pendingRewards, 0);
                              triggerToast(`Batch payout of $${total.toFixed(2)} queued for ${selectedAmbIds.length} ambassador${selectedAmbIds.length > 1 ? 's' : ''}.`, 'success');
                              setSelectedAmbIds([]);
                              setBatchPayoutMode(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Pay {selectedAmbIds.length} Selected
                          </button>
                        )}
                        <button type="button"
                          onClick={() => { setBatchPayoutMode(p => !p); setSelectedAmbIds([]); }}
                          className={`flex items-center gap-2 px-4 py-2 border font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                            batchPayoutMode
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-[#A69984]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{batchPayoutMode ? 'close' : 'checklist'}</span>
                          {batchPayoutMode ? 'Cancel' : 'Batch Payout'}
                        </button>
                        <button type="button"
                          onClick={() => setShowAddAmbassadorModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">person_add</span>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Search + Filter Bar */}
                    {ambassadors.length > 0 && (
                      <div className="px-6 py-3.5 border-b border-white/5 flex flex-col sm:flex-row gap-3 font-sans">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#A69984]/40 text-sm">search</span>
                          <input
                            type="text"
                            placeholder="Search by name, email or code…"
                            value={ambassadorSearch}
                            onChange={e => setAmbassadorSearch(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/30"
                          />
                        </div>
                        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 flex-shrink-0">
                          {(['all', 'active', 'suspended'] as const).map(s => (
                            <button key={s} type="button"
                              onClick={() => setAmbassadorStatusFilter(s)}
                              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer capitalize ${ambassadorStatusFilter === s ? 'bg-[#ffc53d] text-[#2c1a00]' : 'text-[#A69984]/55 hover:text-white'}`}
                            >
                              {s === 'all' ? `All (${ambassadors.length})` : `${s} (${ambassadors.filter(a => a.status === s).length})`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {ambassadors.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                        <span className="material-symbols-outlined text-5xl text-[#A69984]/20">loyalty</span>
                        <div>
                          <p className="text-white font-semibold font-sans text-sm">No ambassadors registered yet</p>
                          <p className="text-[#A69984]/50 font-sans text-xs mt-1">Add one above or invite partners via the Partner Portal.</p>
                        </div>
                        <button type="button" onClick={() => setShowAddAmbassadorModal(true)} className="mt-2 px-5 py-2.5 bg-[#ffc53d] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                          <span className="material-symbols-outlined text-sm">person_add</span>
                          Add First Ambassador
                        </button>
                      </div>
                    ) : (
                      <div>
                        {(() => {
                          const q = ambassadorSearch.toLowerCase();
                          const filteredAmbs = ambassadors.filter(a =>
                            (ambassadorStatusFilter === 'all' || a.status === ambassadorStatusFilter) &&
                            (!q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
                          );
                          if (filteredAmbs.length === 0) return (
                            <div className="py-14 text-center font-sans">
                              <span className="material-symbols-outlined text-4xl text-[#A69984]/20 block">search_off</span>
                              <p className="text-white font-semibold text-sm mt-3">No ambassadors match your filter</p>
                              <p className="text-[#A69984]/50 text-xs mt-1">Try adjusting the search term or status filter.</p>
                            </div>
                          );
                          return (
                        <div className="divide-y divide-white/5">
                          {filteredAmbs.map((amb) => (
                          <div key={amb.id} className={`p-6 hover:bg-white/[0.015] transition-colors ${batchPayoutMode && selectedAmbIds.includes(amb.id) ? 'bg-[#ffc53d]/[0.04]' : ''}`}>
                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                              {/* Batch checkbox */}
                              {batchPayoutMode && (
                                <label className="flex items-center justify-center flex-shrink-0 mt-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedAmbIds.includes(amb.id)}
                                    onChange={e => setSelectedAmbIds(prev => e.target.checked ? [...prev, amb.id] : prev.filter(id => id !== amb.id))}
                                    className="w-4 h-4 rounded border-white/20 accent-[#ffc53d] cursor-pointer"
                                  />
                                </label>
                              )}

                              {/* Identity */}
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/15 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-[#ffc53d] text-lg">person</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  {(() => {
                                    const _conv = amb.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                                    const _tier = _conv >= 11
                                      ? { name: 'Platinum', cls: 'bg-violet-500/10 border-violet-500/20 text-violet-300' }
                                      : _conv >= 6
                                      ? { name: 'Gold', cls: 'bg-[#ffc53d]/10 border-[#ffc53d]/20 text-[#ffc53d]' }
                                      : _conv >= 3
                                      ? { name: 'Silver', cls: 'bg-white/10 border-white/20 text-white/70' }
                                      : { name: 'Bronze', cls: 'bg-amber-800/15 border-amber-700/25 text-amber-600' };
                                    return (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-white font-bold font-sans text-sm">{amb.name}</span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-mono">{amb.code}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                      amb.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>{amb.status}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${_tier.cls}`}>⭐ {_tier.name}</span>
                                  </div>
                                    );
                                  })()}
                                  <p className="text-[#A69984]/65 text-xs font-sans mt-0.5">{amb.email}{amb.phone ? ` • ${amb.phone}` : ''}</p>
                                  <p className="text-[#A69984]/40 text-[10px] font-sans mt-0.5">Joined {amb.joinedDate} · {amb.invitedBusinesses.length} referrals</p>
                                  {/* Mini referral link */}
                                  <div className="flex items-center gap-1.5 mt-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5 w-fit">
                                    <span className="material-symbols-outlined text-[11px] text-[#A69984]/50">link</span>
                                    <span className="text-[9.5px] text-[#A69984]/60 font-mono">{referralConfig.referralBaseUrl}{amb.code}</span>
                                    <button type="button" onClick={() => triggerToast('Referral link copied!', 'success')} className="text-[#ffc53d] hover:text-[#ffb014] cursor-pointer ml-1">
                                      <span className="material-symbols-outlined text-[11px]">content_copy</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Banking Details */}
                              <div className="bg-white/[0.025] border border-white/5 rounded-xl p-4 min-w-[220px] flex-shrink-0">
                                <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[11px]">account_balance</span>
                                  Banking Details
                                </p>
                                {amb.bank.bankName ? (
                                  <>
                                    <p className="text-white font-sans font-bold text-xs">{amb.bank.bankName}</p>
                                    <p className="text-[#A69984]/65 font-sans text-[10px] mt-0.5">A/C: •••• {(amb.bank.accountNumber || '').slice(-4) || '——'}</p>
                                    <p className="text-[#A69984]/65 font-sans text-[10px]">Holder: {amb.bank.accountHolder || '—'}</p>
                                  </>
                                ) : (
                                  <p className="text-[#A69984]/35 text-[10px] font-sans italic">No banking details on file.</p>
                                )}
                              </div>

                              {/* Rewards + Actions */}
                              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="grid grid-cols-2 gap-3 text-right">
                                  <div>
                                    <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest">Pending</p>
                                    <p className="text-amber-400 font-bold font-sans text-base">¥{amb.pendingRewards.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest">Paid Out</p>
                                    <p className="text-emerald-400 font-bold font-sans text-base">¥{amb.paidRewards.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button type="button"
                                    onClick={() => { setPartnerViewAmbassador(amb); setShowPartnerViewModal(true); }}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-white/15 text-[#A69984] hover:text-white hover:border-white/25 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">preview</span>
                                    Partner View
                                  </button>
                                  <button type="button"
                                    onClick={() => { setEditAmbassadorTarget(amb); setEditAmbassadorData({ name: amb.name, email: amb.email, phone: amb.phone, code: amb.code }); setShowEditAmbassadorModal(true); }}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-violet-500/25 text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">edit</span>
                                    Edit
                                  </button>
                                  <button type="button"
                                    onClick={() => { setAddReferralTarget(amb); setNewReferralData({ name: '', contact: '', services: [], status: 'Pending' }); setShowAddReferralModal(true); }}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-[#ffc53d]/25 text-[#ffc53d] hover:bg-[#ffc53d]/10 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">add_business</span>
                                    Add Referral
                                  </button>
                                  <button type="button"
                                    onClick={() => handleOpenEditBank(amb)}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-sky-500/25 text-sky-400 hover:bg-sky-500/10 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">account_balance</span>
                                    {amb.bank.bankName ? 'Edit Bank' : 'Add Bank'}
                                  </button>
                                  <button type="button"
                                    onClick={() => handleToggleAmbassadorStatus(amb.id)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all cursor-pointer ${
                                      amb.status === 'active'
                                        ? 'border-rose-500/25 text-rose-400 hover:bg-rose-500/10'
                                        : 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                  >
                                    {amb.status === 'active' ? 'Suspend' : 'Reactivate'}
                                  </button>
                                  <button type="button"
                                    onClick={() => { setPayoutTarget(amb); setPayoutAmount(amb.pendingRewards.toString()); setShowPayoutModal(true); }}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                      amb.pendingRewards > 0
                                        ? 'bg-[#ffc53d] text-[#2c1a00] hover:bg-[#ffb014] cursor-pointer'
                                        : 'bg-white/5 text-[#A69984]/30 cursor-not-allowed border border-white/5'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-xs">payments</span>
                                    Payout
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Invited Businesses */}
                            {amb.invitedBusinesses.length > 0 && (
                              <div className="mt-5 border-t border-white/5 pt-5">
                                <p className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-xs">storefront</span>
                                  Referred Businesses ({amb.invitedBusinesses.length})
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {amb.invitedBusinesses.map(biz => (
                                    <div key={biz.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col gap-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-white font-bold text-xs font-sans truncate">{biz.name}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${
                                          biz.status === 'Active' || biz.status === 'Subscribed'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>{biz.status}</span>
                                      </div>
                                      <p className="text-[#A69984]/60 text-[10px] font-sans">Contact: {biz.contact}</p>
                                      <p className="text-[#A69984]/45 text-[10px] font-sans">Joined: {biz.joinedDate}</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {biz.services.map((svc, si) => (
                                          <span key={si} className="px-1.5 py-0.5 bg-white/5 border border-white/[0.08] rounded text-[8.5px] text-[#A69984]/70 font-medium">{svc}</span>
                                        ))}
                                      </div>
                                      <p className="text-amber-400 font-bold text-[10px] mt-0.5">Reward: ${biz.reward}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Per-ambassador payout history inline */}
                            {payoutHistory.filter(tx => tx.ambassadorId === amb.id).length > 0 && (
                              <div className="mt-4 border-t border-white/5 pt-4">
                                <p className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-xs">receipt_long</span>
                                  Payout History
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {payoutHistory.filter(tx => tx.ambassadorId === amb.id).slice(0, 5).map(tx => (
                                    <div key={tx.id} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-1.5">
                                      <span className="material-symbols-outlined text-emerald-400 text-xs">check_circle</span>
                                      <span className="text-emerald-400 font-bold text-[10px]">${tx.amount.toFixed(2)}</span>
                                      <span className="text-[#A69984]/45 text-[9.5px] font-mono">{tx.date}</span>
                                    </div>
                                  ))}
                                  {payoutHistory.filter(tx => tx.ambassadorId === amb.id).length > 5 && (
                                    <div className="flex items-center px-3 py-1.5 text-[#A69984]/45 text-[9.5px]">
                                      +{payoutHistory.filter(tx => tx.ambassadorId === amb.id).length - 5} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CODES SUB-TAB: Referral Code Management */}
              {referralSubTab === 'codes' && (
                <div className={`${theme.cardBg} border rounded-2xl overflow-hidden font-sans`}>
                  <div className="px-7 py-5 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">Referral Code Registry</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">All active and suspended referral codes across the ambassador network</p>
                    </div>
                    <button type="button"
                      onClick={() => setShowAddAmbassadorModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      New Code
                    </button>
                  </div>
                  {ambassadors.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                      <span className="material-symbols-outlined text-5xl text-[#A69984]/20">qr_code</span>
                      <p className="text-white font-semibold text-sm">No referral codes yet</p>
                      <p className="text-[#A69984]/50 text-xs">Add ambassadors to generate referral codes.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">
                          <th className="text-left px-7 py-3">Ambassador</th>
                          <th className="text-left px-4 py-3">Referral Code</th>
                          <th className="text-left px-4 py-3">Full Link</th>
                          <th className="text-center px-4 py-3">Conversions</th>
                          <th className="text-center px-4 py-3">Status</th>
                          <th className="text-right px-7 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {ambassadors.map(amb => {
                          const conversions = amb.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                          const total = amb.invitedBusinesses.length;
                          return (
                            <tr key={amb.id} className="hover:bg-white/[0.015] transition-colors">
                              <td className="px-7 py-4">
                                <div className="text-white font-bold text-xs">{amb.name}</div>
                                <div className="text-[#A69984]/50 text-[9.5px] mt-0.5">{amb.email}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="px-3 py-1.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-mono font-black text-[11px] rounded-lg tracking-wider">{amb.code}</span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#A69984]/50 font-mono text-[9.5px] truncate max-w-[180px]">{referralConfig.referralBaseUrl}{amb.code}</span>
                                  <button type="button" onClick={() => triggerToast('Link copied to clipboard!', 'success')} className="text-[#ffc53d]/70 hover:text-[#ffc53d] cursor-pointer flex-shrink-0">
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="font-bold text-white text-sm">{conversions}<span className="text-[#A69984]/40 font-normal text-xs">/{total}</span></div>
                                <div className="text-[9px] text-[#A69984]/40 font-semibold mt-0.5">{total > 0 ? Math.round((conversions / total) * 100) : 0}% conv.</div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border ${
                                  amb.status === 'active'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>{amb.status}</span>
                              </td>
                              <td className="px-7 py-4 text-right">
                                <button type="button"
                                  onClick={() => handleToggleAmbassadorStatus(amb.id)}
                                  className="text-[10px] border border-white/10 hover:border-white/20 text-[#ffe2ab] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer mr-2"
                                >
                                  {amb.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                                <button type="button"
                                  onClick={() => { setQrModalAmbassador(amb); setShowQrModal(true); }}
                                  className="text-[10px] border border-white/10 hover:border-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  QR Poster
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ANALYTICS SUB-TAB: Insights & Trends */}
              {referralSubTab === 'analytics' && (() => {
                const totalReferrals = ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0);
                const totalConversions = ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length, 0);
                const totalRewardsPaid = ambassadors.reduce((s, a) => s + a.paidRewards, 0);
                const totalPending = ambassadors.reduce((s, a) => s + a.pendingRewards, 0);
                const avgRevPerConversion = 299;
                const totalAttrRevenue = totalConversions * avgRevPerConversion;
                const cpa = totalConversions > 0 ? totalRewardsPaid / totalConversions : 0;
                const roi = totalRewardsPaid > 0 ? totalAttrRevenue / totalRewardsPaid : 0;
                const convRate = totalReferrals > 0 ? Math.round((totalConversions / totalReferrals) * 100) : 0;

                const monthlyData = [
                  { month: 'Jan', signups: 3, conversions: 2 },
                  { month: 'Feb', signups: 5, conversions: 3 },
                  { month: 'Mar', signups: 4, conversions: 2 },
                  { month: 'Apr', signups: 8, conversions: 5 },
                  { month: 'May', signups: Math.max(totalReferrals, 12), conversions: Math.max(totalConversions, 8) },
                  { month: 'Jun', signups: 7, conversions: 4 },
                ];
                const maxSignups = Math.max(...monthlyData.map(d => d.signups), 1);

                const activityFeed: { icon: string; color: string; bg: string; msg: string; time: string }[] = [
                  ...payoutHistory.slice(0, 2).map(tx => ({
                    icon: 'payments', color: 'text-emerald-400', bg: 'bg-emerald-500/10',
                    msg: `$${tx.amount.toFixed(2)} payout processed to ${tx.ambassadorName}`, time: tx.date,
                  })),
                  ...ambassadors.flatMap(a => a.invitedBusinesses.slice(0, 1).map(biz => ({
                    icon: 'storefront', color: 'text-violet-400', bg: 'bg-violet-500/10',
                    msg: `${biz.name} referred by ${a.name}`, time: biz.joinedDate,
                  }))),
                  { icon: 'person_add', color: 'text-sky-400', bg: 'bg-sky-500/10', msg: 'New ambassador application received', time: 'Today, 9:41 AM' },
                  { icon: 'workspace_premium', color: 'text-[#ffc53d]', bg: 'bg-[#ffc53d]/10', msg: 'Ambassador milestone: 10 conversions reached', time: 'Yesterday' },
                ].slice(0, 7);

                return (
                  <div className="space-y-6 font-sans animate-fade-in">

                    {/* Analytics KPI Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Revenue Attributed', value: `$${totalAttrRevenue.toLocaleString()}`, sub: 'From referral conversions', color: 'text-[#ffc53d]', icon: 'attach_money' },
                        { label: 'Overall Conv. Rate', value: `${convRate}%`, sub: 'Referral → subscription', color: 'text-sky-400', icon: 'conversion_path' },
                        { label: 'Cost Per Acquisition', value: `$${cpa.toFixed(2)}`, sub: 'Avg reward per conversion', color: 'text-violet-400', icon: 'trending_down' },
                        { label: 'Referral ROI', value: roi > 0 ? `${roi.toFixed(1)}x` : '—', sub: 'Revenue vs rewards paid', color: 'text-emerald-400', icon: 'show_chart' },
                      ].map(kpi => (
                        <div key={kpi.label} className={`${theme.cardBg} border rounded-2xl p-5`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9.5px] text-[#A69984]/65 font-bold uppercase tracking-widest">{kpi.label}</span>
                            <span className={`material-symbols-outlined text-lg ${kpi.color}`}>{kpi.icon}</span>
                          </div>
                          <p className={`font-serif text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                          <p className="text-[9.5px] text-[#A69984]/50 font-bold mt-1">{kpi.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Monthly Trend + Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Monthly Trend Bar Chart */}
                      <div className={`${theme.cardBg} border rounded-2xl p-7 lg:col-span-2`}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-white font-bold text-sm tracking-wide">Monthly Referral Trend</h3>
                            <p className="text-[#A69984]/50 text-[10.5px] mt-0.5">Signups vs. paid conversions over 6 months</p>
                          </div>
                          <span className="material-symbols-outlined text-[#ffc53d] text-lg">bar_chart</span>
                        </div>
                        <div className="flex items-end gap-3 h-36">
                          {monthlyData.map(d => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                              <span className="text-[8.5px] text-white/40 font-bold">{d.signups}</span>
                              <div className="w-full flex flex-col justify-end" style={{ height: `${Math.round((d.signups / maxSignups) * 108)}px` }}>
                                <div className="w-full rounded-t-md overflow-hidden bg-[#ffc53d]/20" style={{ height: '100%' }}>
                                  <div className="w-full bg-[#ffc53d] rounded-t-md" style={{ height: `${Math.round((d.conversions / d.signups) * 100)}%` }} />
                                </div>
                              </div>
                              <span className="text-[9px] text-[#A69984]/55 font-bold">{d.month}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ffc53d]"></div><span className="text-[10px] text-[#A69984]/60 font-semibold">Paid Conversions</span></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ffc53d]/20"></div><span className="text-[10px] text-[#A69984]/60 font-semibold">Total Signups</span></div>
                        </div>
                      </div>

                      {/* Activity Feed */}
                      <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col`}>
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-white font-bold text-sm tracking-wide">Recent Activity</h3>
                          <span className="material-symbols-outlined text-[#A69984]/40 text-lg">timeline</span>
                        </div>
                        {activityFeed.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
                            <span className="material-symbols-outlined text-3xl text-[#A69984]/20">history</span>
                            <p className="text-[#A69984]/40 text-xs font-semibold">No activity yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4 flex-1">
                            {activityFeed.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/5`}>
                                  <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white text-[11px] font-semibold leading-snug">{item.msg}</p>
                                  <p className="text-[#A69984]/40 text-[9px] mt-0.5 font-medium">{item.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ambassador Performance Table + Breakdowns */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                      {/* Performance Table */}
                      <div className={`${theme.cardBg} border rounded-2xl overflow-hidden lg:col-span-3`}>
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                          <h3 className="text-white font-bold text-sm tracking-wide">Ambassador Performance</h3>
                          <span className="text-[10px] text-[#A69984]/40 font-semibold">Ranked by referrals</span>
                        </div>
                        {ambassadors.length === 0 ? (
                          <div className="py-12 text-center">
                            <p className="text-[#A69984]/40 text-sm font-semibold">No ambassadors registered yet</p>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5">
                                {['Ambassador', 'Referred', 'Converted', 'Rate', 'Total Earned'].map(h => (
                                  <th key={h} className={`py-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest ${h === 'Ambassador' ? 'text-left px-6' : h === 'Total Earned' ? 'text-right px-6' : 'text-center px-3'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                              {[...ambassadors].sort((a, b) => b.invitedBusinesses.length - a.invitedBusinesses.length).map(amb => {
                                const referred = amb.invitedBusinesses.length;
                                const converted = amb.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                                const cr = referred > 0 ? Math.round((converted / referred) * 100) : 0;
                                return (
                                  <tr key={amb.id} className="hover:bg-white/[0.015] transition-colors">
                                    <td className="px-6 py-3.5">
                                      <p className="text-white font-bold text-xs">{amb.name}</p>
                                      <p className="text-[#A69984]/45 text-[9.5px] font-mono mt-0.5">{amb.code}</p>
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                      <span className="text-white font-bold text-sm">{referred}</span>
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                      <span className="text-emerald-400 font-bold text-sm">{converted}</span>
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                      <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-white font-bold text-xs">{cr}%</span>
                                        <div className="w-12 bg-white/5 rounded-full h-1.5">
                                          <div className="bg-[#ffc53d] h-1.5 rounded-full" style={{ width: `${cr}%` }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                      <span className="text-[#ffc53d] font-bold text-sm">¥{(amb.paidRewards + amb.pendingRewards).toLocaleString()}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Right column: Reward Summary + Tier Distribution */}
                      <div className="lg:col-span-2 space-y-4">

                        {/* Reward Summary */}
                        <div className={`${theme.cardBg} border rounded-2xl p-6`}>
                          <h3 className="text-white font-bold text-sm tracking-wide mb-5">Reward Summary</h3>
                          <div className="space-y-3.5">
                            {[
                              { label: 'Total Rewarded', value: `$${totalRewardsPaid.toLocaleString()}`, color: 'text-emerald-400' },
                              { label: 'Pending Release', value: `$${totalPending.toLocaleString()}`, color: 'text-amber-400' },
                              { label: 'Attributed Revenue', value: `$${totalAttrRevenue.toLocaleString()}`, color: 'text-[#ffc53d]' },
                              { label: 'Cost Per Acquisition', value: `$${cpa.toFixed(2)}`, color: 'text-sky-400' },
                            ].map(item => (
                              <div key={item.label} className="flex justify-between items-center">
                                <span className="text-[#A69984]/60 text-[10.5px] font-bold">{item.label}</span>
                                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tier Distribution */}
                        <div className={`${theme.cardBg} border rounded-2xl p-6`}>
                          <h3 className="text-white font-bold text-sm tracking-wide mb-5">Ambassador Tier Distribution</h3>
                          <div className="space-y-3">
                            {[
                              { tier: 'Platinum', minConv: 11, maxConv: Infinity, barColor: 'bg-violet-500', textColor: 'text-violet-300' },
                              { tier: 'Gold',     minConv: 6,  maxConv: 10,       barColor: 'bg-[#ffc53d]',  textColor: 'text-[#ffc53d]' },
                              { tier: 'Silver',   minConv: 3,  maxConv: 5,        barColor: 'bg-white/50',   textColor: 'text-white/65' },
                              { tier: 'Bronze',   minConv: 0,  maxConv: 2,        barColor: 'bg-amber-700/60', textColor: 'text-amber-600' },
                            ].map(t => {
                              const count = ambassadors.filter(a => {
                                const conv = a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                                return conv >= t.minConv && conv <= t.maxConv;
                              }).length;
                              const pct = ambassadors.length > 0 ? Math.round((count / ambassadors.length) * 100) : 0;
                              return (
                                <div key={t.tier} className="flex items-center gap-3">
                                  <span className={`text-[9.5px] font-bold uppercase tracking-wider w-14 ${t.textColor}`}>{t.tier}</span>
                                  <div className="flex-1 bg-white/5 rounded-full h-2">
                                    <div className={`${t.barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-white/55 text-[10px] w-5 text-right font-bold">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[#A69984]/35 text-[9.5px] font-semibold mt-4 pt-3 border-t border-white/5">
                            Bronze: 0–2 conv. · Silver: 3–5 · Gold: 6–10 · Platinum: 11+
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Channel Attribution + Milestone Tracker */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {/* Channel Attribution */}
                      <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-white font-bold text-sm tracking-wide">Referral Channel Attribution</h3>
                          <span className="material-symbols-outlined text-[#A69984]/40 text-lg">hub</span>
                        </div>
                        <div className="space-y-4">
                          {[
                            { channel: 'LinkedIn / Social', pct: 40, color: 'bg-sky-500/60' },
                            { channel: 'Direct Email Outreach', pct: 30, color: 'bg-violet-500/60' },
                            { channel: 'Word of Mouth', pct: 20, color: 'bg-[#ffc53d]/70' },
                            { channel: 'Partner Portal / Other', pct: 10, color: 'bg-emerald-500/50' },
                          ].map(ch => (
                            <div key={ch.channel} className="flex items-center gap-4">
                              <span className="text-[10.5px] text-[#A69984]/65 font-semibold flex-shrink-0 w-[160px]">{ch.channel}</span>
                              <div className="flex-1 bg-white/5 rounded-full h-5 relative overflow-hidden">
                                <div className={`${ch.color} h-full rounded-full transition-all duration-700`} style={{ width: `${ch.pct}%` }} />
                              </div>
                              <span className="text-white font-bold text-xs w-8 text-right">{ch.pct}%</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[#A69984]/30 text-[9.5px] font-semibold mt-5 pt-4 border-t border-white/5">Attribution model: last-touch · 30-day lookback window</p>
                      </div>

                      {/* Milestone Tracker */}
                      <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-white font-bold text-sm tracking-wide">Program Milestones</h3>
                          <span className="material-symbols-outlined text-[#A69984]/40 text-lg">emoji_events</span>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'First 10 Ambassadors', goal: 10, current: ambassadors.length, icon: 'group' },
                            { label: '50 Total Referrals', goal: 50, current: totalReferrals, icon: 'share' },
                            { label: '25 Paid Conversions', goal: 25, current: totalConversions, icon: 'storefront' },
                            { label: '¥500,000 Revenue Attributed', goal: 500000, current: totalAttrRevenue, icon: 'payments', isCurrency: true },
                          ].map(ms => {
                            const pct = Math.min(Math.round((ms.current / ms.goal) * 100), 100);
                            const done = pct >= 100;
                            return (
                              <div key={ms.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-sm ${done ? 'text-emerald-400' : 'text-[#A69984]/40'}`}>{done ? 'check_circle' : ms.icon}</span>
                                    <span className={`text-[10.5px] font-semibold ${done ? 'text-emerald-400' : 'text-[#A69984]/70'}`}>{ms.label}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold ${done ? 'text-emerald-400' : 'text-white/50'}`}>
                                    {ms.isCurrency ? `¥${ms.current.toLocaleString()} / ¥${ms.goal.toLocaleString()}` : `${ms.current} / ${ms.goal}`}
                                  </span>
                                </div>
                                <div className="bg-white/5 rounded-full h-1.5">
                                  <div className={`${done ? 'bg-emerald-400' : 'bg-[#ffc53d]'} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* CONFIG SUB-TAB: Program Settings */}
              {referralSubTab === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">

                  {/* Commission & Rewards */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">paid</span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Commission & Reward Rules</h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Commission Rate (%)</label>
                        <div className="flex items-center gap-3">
                          <input
                            aria-label="Commission Rate"
                            type="number" min="1" max="50"
                            value={referralConfig.commissionRate}
                            onChange={e => setReferralConfig(prev => ({ ...prev, commissionRate: parseInt(e.target.value) || 0 }))}
                            className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                          <span className="text-[#A69984]/60 text-sm font-bold">%</span>
                        </div>
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Percentage of referred tenant's first payment awarded to ambassador.</p>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Flat Reward per Signup (¥)</label>
                        <div className="flex items-center gap-3">
                          <input
                            aria-label="Flat Reward per Signup in JPY"
                            type="number" min="0"
                            value={referralConfig.rewardPerSignup}
                            onChange={e => setReferralConfig(prev => ({ ...prev, rewardPerSignup: parseInt(e.target.value) || 0 }))}
                            className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                          <span className="text-[#A69984]/60 text-sm font-bold">JPY</span>
                        </div>
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Fixed bonus credited when a referred business activates their subscription.</p>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Minimum Payout Threshold (¥)</label>
                        <input
                          aria-label="Minimum Payout Threshold in JPY"
                          type="number" min="0"
                          value={referralConfig.minPayoutThreshold}
                          onChange={e => setReferralConfig(prev => ({ ...prev, minPayoutThreshold: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        />
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Ambassadors must accumulate this balance before a payout can be requested.</p>
                      </div>
                    </div>
                  </div>

                  {/* Program Settings */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">settings</span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Program Settings</h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Referral Base URL</label>
                        <input
                          aria-label="Referral Base URL"
                          type="text"
                          value={referralConfig.referralBaseUrl}
                          onChange={e => setReferralConfig(prev => ({ ...prev, referralBaseUrl: e.target.value }))}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#A69984] font-mono focus:outline-none focus:border-[#ffc53d]/45"
                        />
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Ambassador code is appended to this URL to form the full referral link.</p>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Cookie Tracking Duration (Days)</label>
                        <input
                          aria-label="Cookie Tracking Duration in Days"
                          type="number" min="1" max="365"
                          value={referralConfig.cookieDuration}
                          onChange={e => setReferralConfig(prev => ({ ...prev, cookieDuration: parseInt(e.target.value) || 30 }))}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        />
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">How long a referral attribution cookie is retained for returning visitors.</p>
                      </div>
                      {/* Program Active Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-bold text-xs">Program Active</p>
                          <p className="text-[#A69984]/50 text-[9.5px] mt-0.5">Accept new referral sign-ups and award commissions</p>
                        </div>
                        <button type="button"
                          onClick={() => setReferralConfig(prev => ({ ...prev, programActive: !prev.programActive }))}
                          className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${referralConfig.programActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${referralConfig.programActive ? 'left-[22px]' : 'left-0.5'}`}></span>
                        </button>
                      </div>
                      <button type="button"
                        onClick={() => {
                          localStorage.setItem('dinepos_referral_config', JSON.stringify(referralConfig));
                          window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_referral_config', newValue: JSON.stringify(referralConfig) }));
                          triggerToast('Referral program configuration saved successfully!', 'success');
                        }}
                        className="w-full py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>

                  {/* Automation & Notifications — full width */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7 lg:col-span-2`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">notifications_active</span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Automation & Notifications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Toggles column */}
                      <div className="space-y-4">
                        {[
                          { key: 'autoRewardOnConversion' as const, label: 'Auto-Reward on Conversion', desc: 'Automatically credit ambassador reward when a referred business subscribes — no manual approval needed.' },
                          { key: 'notifyAmbassadorOnSignup' as const, label: 'Notify Ambassador on Signup', desc: 'Send an email notification to the ambassador when a business signs up with their referral code.' },
                          { key: 'notifyAmbassadorOnPayout' as const, label: 'Notify Ambassador on Payout', desc: 'Notify ambassador by email when a payout is processed and funds are being transferred.' },
                        ].map(setting => (
                          <div key={setting.key} className="flex items-start justify-between gap-4 p-4 bg-white/[0.025] border border-white/[0.06] rounded-xl">
                            <div className="flex-1">
                              <p className="text-white font-bold text-xs">{setting.label}</p>
                              <p className="text-[#A69984]/50 text-[9.5px] mt-0.5 leading-relaxed">{setting.desc}</p>
                            </div>
                            <button type="button"
                              onClick={() => setReferralConfig(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                              className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 mt-0.5 ${referralConfig[setting.key] ? 'bg-emerald-500' : 'bg-white/10'}`}
                            >
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${referralConfig[setting.key] ? 'left-[22px]' : 'left-0.5'}`}></span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Payment method column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-3">Payout Method</label>
                          <div className="space-y-2">
                            {([
                              { value: 'bank_transfer', label: 'Bank Transfer', icon: 'account_balance', desc: 'Standard ACH/wire to registered bank account' },
                              { value: 'ach', label: 'ACH Direct', icon: 'swap_horiz', desc: 'Automated Clearing House — US domestic only' },
                              { value: 'wire', label: 'International Wire', icon: 'public', desc: 'SWIFT/SEPA for international ambassadors' },
                              { value: 'paypal', label: 'PayPal', icon: 'currency_exchange', desc: 'PayPal business account transfer' },
                            ] as { value: ReferralConfig['paymentMethod']; label: string; icon: string; desc: string }[]).map(opt => (
                              <button key={opt.value} type="button"
                                onClick={() => setReferralConfig(prev => ({ ...prev, paymentMethod: opt.value }))}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                                  referralConfig.paymentMethod === opt.value
                                    ? 'bg-[#ffc53d]/8 border-[#ffc53d]/30'
                                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'
                                }`}
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${referralConfig.paymentMethod === opt.value ? 'bg-[#ffc53d]/15' : 'bg-white/5'}`}>
                                  <span className={`material-symbols-outlined text-sm ${referralConfig.paymentMethod === opt.value ? 'text-[#ffc53d]' : 'text-[#A69984]/50'}`}>{opt.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold text-[11px] ${referralConfig.paymentMethod === opt.value ? 'text-[#ffc53d]' : 'text-white'}`}>{opt.label}</p>
                                  <p className="text-[#A69984]/45 text-[9px] font-medium mt-0.5">{opt.desc}</p>
                                </div>
                                {referralConfig.paymentMethod === opt.value && (
                                  <span className="material-symbols-outlined text-[#ffc53d] text-base flex-shrink-0">check_circle</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button"
                          onClick={() => {
                            localStorage.setItem('dinepos_referral_config', JSON.stringify(referralConfig));
                            window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_referral_config', newValue: JSON.stringify(referralConfig) }));
                            triggerToast('Automation & notification settings saved!', 'success');
                          }}
                          className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#ffe2ab] font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payout Transaction History */}
              {payoutHistory.length > 0 && (
                <div className={`${theme.cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">Payout Transaction History</h3>
                    <button type="button" onClick={handleExportPayoutHistory}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A69984]/60 hover:text-[#ffe2ab] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {payoutHistory.map(tx => (
                      <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.015] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-400 text-sm">payments</span>
                          </div>
                          <div>
                            <p className="text-white font-bold text-xs font-sans">{tx.ambassadorName}</p>
                            <p className="text-[#A69984]/50 text-[10px] font-sans">{tx.note}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold font-sans">${tx.amount.toFixed(2)}</p>
                          <p className="text-[#A69984]/40 text-[10px] font-sans">{tx.date} • {tx.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

      {/* MODAL: ADD NEW AMBASSADOR */}
      {showAddAmbassadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[560px] rounded-2xl shadow-2xl relative font-sans max-h-[92vh] flex flex-col">

            {/* Sticky header */}
            <div className="p-8 pb-4 flex-shrink-0">
              <button type="button"
                onClick={() => { setShowAddAmbassadorModal(false); setNewAmbassadorData({ name: '', email: '', phone: '', code: '', bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' }); }}
                className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#ffc53d] text-xl">person_add</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-wide">Register Ambassador</h2>
              <p className="text-[11px] text-[#A69984]/60 font-semibold mt-1.5">
                Add a new partner to the referral program. Bank details are required for payout processing.
              </p>
            </div>

            <form onSubmit={handleAddAmbassador} className="overflow-y-auto px-8 pb-8 space-y-5 flex-1">

              {/* Personal Info */}
              <div>
                <div className="text-[9.5px] text-[#ffe2ab]/60 font-bold uppercase tracking-widest border-l-2 border-[#ffc53d]/40 pl-2.5 mb-3">Partner Details</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
                      <input type="text" required placeholder="e.g. Sarah Johnson"
                        value={newAmbassadorData.name}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input type="tel" placeholder="+1 555 000 0000"
                        value={newAmbassadorData.phone}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Email Address *</label>
                    <input type="email" required placeholder="e.g. sarah@restaurant.com"
                      value={newAmbassadorData.email}
                      onChange={e => setNewAmbassadorData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Referral Code (auto-generated if blank)</label>
                    <div className="flex gap-2">
                      <input type="text"
                        placeholder={newAmbassadorData.name ? generateReferralCode(newAmbassadorData.name) : 'e.g. SARAH421'}
                        value={newAmbassadorData.code}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                        className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 uppercase"
                      />
                      <button type="button"
                        onClick={() => setNewAmbassadorData(prev => ({ ...prev, code: generateReferralCode(prev.name || 'AMB') }))}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#ffe2ab] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">shuffle</span>
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Bank Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[9.5px] text-[#ffe2ab]/60 font-bold uppercase tracking-widest border-l-2 border-[#ffc53d]/40 pl-2.5">Payout Bank Details</div>
                  <span className="text-[9px] text-[#A69984]/40 font-medium">Required for payout processing</span>
                </div>
                <div className="bg-[#0e0e0d]/60 border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Bank Name</label>
                      <input type="text" placeholder="e.g. JPMorgan Chase"
                        value={newAmbassadorData.bankName}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Account Holder Name</label>
                      <input type="text" placeholder="e.g. Sarah Johnson LLC"
                        value={newAmbassadorData.accountHolder}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, accountHolder: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Account Number / IBAN</label>
                      <input type="text" placeholder="Full account number"
                        value={newAmbassadorData.accountNumber}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Routing / SWIFT / BIC</label>
                      <input type="text" placeholder="e.g. 021000021"
                        value={newAmbassadorData.routingNumber}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-[#A69984]/35 font-medium leading-relaxed">
                    Account numbers are masked before storage. Bank details can be edited later from the ambassador's profile card.
                  </p>
                </div>
              </div>

              {/* Reward preview */}
              <div className="bg-[#ffc53d]/5 border border-[#ffc53d]/15 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#ffc53d] text-base flex-shrink-0 mt-0.5">info</span>
                <p className="text-[10px] text-[#ffe2ab]/80 font-semibold leading-relaxed">
                  This ambassador will earn <strong className="text-[#ffc53d]">¥{referralConfig.rewardPerSignup.toLocaleString()}</strong> per signup + <strong className="text-[#ffc53d]">{referralConfig.commissionRate}%</strong> commission on first payment. Min payout threshold: <strong className="text-[#ffc53d]">¥{referralConfig.minPayoutThreshold.toLocaleString()}</strong>.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setShowAddAmbassadorModal(false); setNewAmbassadorData({ name: '', email: '', phone: '', code: '', bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' }); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Register Ambassador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AMBASSADOR BANK DETAILS */}
      {showEditBankModal && editBankTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowEditBankModal(false); setEditBankTarget(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-emerald-400 text-xl">account_balance</span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">Edit Bank Details</h2>
                <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-0.5">
                  Ambassador: <span className="text-white">{editBankTarget.name}</span>
                </p>
              </div>
            </div>

            <div className="mb-5 flex items-start gap-3 bg-sky-500/8 border border-sky-500/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-sky-400 text-base flex-shrink-0 mt-0.5">lock</span>
              <p className="text-sky-300 text-[10px] font-medium leading-relaxed">
                Bank details are masked on save. Account numbers show only the last 4 digits. All changes are logged in the audit trail.
              </p>
            </div>

            <form onSubmit={handleSaveEditBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Bank Name *</label>
                  <input type="text" required placeholder="e.g. JPMorgan Chase"
                    value={editBankData.bankName}
                    onChange={e => setEditBankData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Account Holder *</label>
                  <input type="text" required placeholder="Legal account holder name"
                    value={editBankData.accountHolder}
                    onChange={e => setEditBankData(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">
                  Account Number / IBAN
                  {editBankTarget.bank.accountNumber && (
                    <span className="ml-2 text-[#A69984]/40 normal-case font-normal">
                      (current: {editBankTarget.bank.accountNumber})
                    </span>
                  )}
                </label>
                <input type="text" placeholder="Leave blank to keep existing number"
                  value={editBankData.accountNumber}
                  onChange={e => setEditBankData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
                <p className="text-[9px] text-[#A69984]/35 mt-1 font-medium">Will be masked on save — only last 4 digits stored visibly.</p>
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Routing Number / SWIFT / BIC *</label>
                <input type="text" required placeholder="e.g. 021000021 or CHASUS33"
                  value={editBankData.routingNumber}
                  onChange={e => setEditBankData(prev => ({ ...prev, routingNumber: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowEditBankModal(false); setEditBankTarget(null); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR POSTER */}
      {showQrModal && qrModalAmbassador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[440px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowQrModal(false); setQrModalAmbassador(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="text-center mb-6">
              <h2 className="font-serif text-xl font-bold text-white tracking-wide">Referral Poster</h2>
              <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-1">
                {qrModalAmbassador.name} · Code: <span className="text-[#ffc53d] font-mono">{qrModalAmbassador.code}</span>
              </p>
            </div>

            {/* Stylised referral card */}
            <div className="bg-gradient-to-br from-[#1a1812] to-[#0e0e0d] border border-[#ffc53d]/20 rounded-2xl p-6 text-center space-y-4 mb-6">
              <div className="flex justify-center">
                {/* QR grid placeholder (visual representation) */}
                <div className="w-28 h-28 bg-[#ffc53d]/8 border border-[#ffc53d]/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-7 gap-[2px] opacity-60">
                    {Array.from({ length: 49 }, (_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-[1px] ${Math.random() > 0.45 ? 'bg-[#ffc53d]' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#1a1812] rounded-md px-2 py-1">
                      <span className="material-symbols-outlined text-[#ffc53d] text-base">qr_code_2</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-1">Referral Code</div>
                <div className="font-mono font-black text-[#ffc53d] text-2xl tracking-[0.15em]">{qrModalAmbassador.code}</div>
              </div>
              <div className="bg-[#0e0e0d]/70 border border-white/[0.06] rounded-xl p-3">
                <div className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-widest mb-1">Sign-Up Link</div>
                <div className="text-[10px] text-[#A69984]/70 font-mono break-all">{referralConfig.referralBaseUrl}{qrModalAmbassador.code}</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button type="button"
                onClick={() => {
                  const link = `${referralConfig.referralBaseUrl}${qrModalAmbassador.code}`;
                  navigator.clipboard?.writeText(link);
                  triggerToast('Referral link copied to clipboard!', 'success');
                }}
                className="w-full py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy Referral Link
              </button>
              <button type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(qrModalAmbassador.code);
                  triggerToast(`Code ${qrModalAmbassador.code} copied!`, 'success');
                }}
                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">tag</span>
                Copy Code Only
              </button>
              <button type="button"
                onClick={() => { window.print(); }}
                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Poster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PARTNER DASHBOARD PREVIEW */}
      {showPartnerViewModal && partnerViewAmbassador && (() => {
        const amb = partnerViewAmbassador;
        const totalEarned = amb.paidRewards + amb.pendingRewards;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in duration-300">
            <div className="bg-[#0e0e0d] border border-white/10 w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col max-h-[94vh]">

              {/* Modal chrome */}
              <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 flex-shrink-0 bg-[#161513]/80 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ffc53d] text-sm">preview</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#ffc53d]/70 font-bold uppercase tracking-widest">Super Admin Preview</p>
                    <p className="text-white font-bold text-sm leading-tight">Partner Dashboard — {amb.name}</p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { setShowPartnerViewModal(false); setPartnerViewAmbassador(null); }}
                  className="text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Scrollable dashboard content */}
              <div className="overflow-y-auto flex-1 p-8 space-y-7 font-sans">

                {/* Dashboard header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">Partner Dashboard</h1>
                    <p className="text-[11.5px] text-[#A69984]/60 font-semibold mt-2">
                      Ambassador Account: <span className="text-[#A69984]/90">{amb.name}</span> • Joined {amb.joinedDate}
                    </p>
                  </div>
                  <button type="button" disabled
                    className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.08] text-[#A69984]/35 rounded-xl font-bold text-[10.5px] uppercase tracking-widest cursor-not-allowed select-none"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left + Middle (2/3) */}
                  <div className="lg:col-span-2 space-y-5">

                    {/* Ambassador Code Card */}
                    <div className="bg-[#161513] border border-[#ffc53d]/20 rounded-2xl p-6">
                      <div className="mb-3">
                        <span className="px-2.5 py-1 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] text-[8.5px] font-black uppercase tracking-widest rounded-lg">Your Ambassador Code</span>
                      </div>
                      <p className="font-mono font-black text-[#ffc53d] text-4xl tracking-[0.12em] mb-2">{amb.code}</p>
                      <p className="text-[#A69984]/60 text-xs font-medium mb-5 leading-relaxed max-w-sm">
                        Share this code or copy your link to onboard new venues. Rewards accrue automatically when they complete registration.
                      </p>
                      <button type="button"
                        onClick={() => { navigator.clipboard?.writeText(`${referralConfig.referralBaseUrl}${amb.code}`); triggerToast('Referral link copied to clipboard!', 'success'); }}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        Copy Referral Link
                      </button>
                    </div>

                    {/* KPI Row */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Total Earned', value: `$${totalEarned.toLocaleString()}`, sub: 'Historical Accruals', icon: 'trending_up', valueColor: 'text-[#ffc53d]', iconColor: 'text-emerald-400' },
                        { label: 'Paid Out', value: `$${amb.paidRewards.toLocaleString()}`, sub: 'Transferred to Bank', icon: 'check_circle', valueColor: 'text-white', iconColor: 'text-[#A69984]/40' },
                        { label: 'Pending Balance', value: `$${amb.pendingRewards.toLocaleString()}`, sub: 'Awaiting Admin Payout', icon: 'circle', valueColor: 'text-[#ffc53d]', iconColor: 'text-[#ffc53d]' },
                      ].map(kpi => (
                        <div key={kpi.label} className="bg-[#161513] border border-white/5 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">{kpi.label}</span>
                            <span className={`material-symbols-outlined text-base ${kpi.iconColor}`}>{kpi.icon}</span>
                          </div>
                          <p className={`font-serif text-2xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                          <p className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-widest mt-1">{kpi.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Invited Businesses Table */}
                    <div className="bg-[#161513] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-sm">Invited Businesses</h3>
                          <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Real-time status of restaurants referred by your ambassador link.</p>
                        </div>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-[#A69984]/65 font-bold">{amb.invitedBusinesses.length} Referrals</span>
                      </div>
                      {amb.invitedBusinesses.length === 0 ? (
                        <div className="py-12 text-center">
                          <span className="material-symbols-outlined text-4xl text-[#A69984]/15 block">storefront</span>
                          <p className="text-[#A69984]/40 text-xs font-medium mt-3">No businesses referred yet. Share your code to get started.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5 text-[8.5px] text-[#A69984]/45 font-bold uppercase tracking-widest">
                                <th className="text-left px-6 py-3">Establishment</th>
                                <th className="text-left px-4 py-3">Onboarded</th>
                                <th className="text-left px-4 py-3">Active Services</th>
                                <th className="text-center px-4 py-3">Status</th>
                                <th className="text-right px-6 py-3">Earned Reward</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                              {amb.invitedBusinesses.map(biz => (
                                <tr key={biz.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="text-white font-bold text-xs">{biz.name}</p>
                                    <p className="text-[#A69984]/40 text-[9.5px] mt-0.5 uppercase tracking-wider font-bold">Contact: {biz.contact}</p>
                                  </td>
                                  <td className="px-4 py-4 text-[#A69984]/60 text-xs font-semibold">{biz.joinedDate}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {biz.services.map((svc, si) => (
                                        <span key={si} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.07] rounded text-[8.5px] text-[#A69984]/65 font-bold uppercase tracking-wider">{svc}</span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[8.5px] font-bold uppercase tracking-wider border ${
                                      biz.status === 'Active' || biz.status === 'Subscribed'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>{biz.status}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <span className={`font-bold text-sm font-mono ${biz.reward > 0 ? 'text-[#ffc53d]' : 'text-[#A69984]/35'}`}>${biz.reward}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column — Bank + Policies */}
                  <div className="space-y-5">

                    {/* Bank Account Card */}
                    <div className="bg-[#161513] border border-white/5 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold text-sm">Payout Bank Account</h3>
                        <button type="button"
                          onClick={() => { setShowPartnerViewModal(false); setPartnerViewAmbassador(null); handleOpenEditBank(amb); }}
                          className="text-[9.5px] text-[#ffe2ab]/60 hover:text-[#ffc53d] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Edit Details
                        </button>
                      </div>
                      {amb.bank.bankName ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Bank Name</p>
                            <p className="text-white font-bold text-xs">{amb.bank.bankName}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Account Holder</p>
                            <p className="text-white font-bold text-xs">{amb.bank.accountHolder}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Account Number</p>
                              <p className="text-[#A69984]/70 font-mono text-xs">{amb.bank.accountNumber || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Routing Code</p>
                              <p className="text-[#A69984]/70 font-mono text-xs">{amb.bank.routingNumber || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/12 rounded-xl p-3.5">
                            <span className="material-symbols-outlined text-amber-500/60 text-sm flex-shrink-0 mt-0.5">shield</span>
                            <p className="text-[#A69984]/50 text-[9px] font-medium leading-relaxed">
                              Bank payout coordinates are on file. Reward transfers are processed by the platform administrator within 3 business days of approval.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <span className="material-symbols-outlined text-4xl text-[#A69984]/15 block">account_balance</span>
                          <p className="text-[#A69984]/40 text-xs font-semibold mt-3">No bank details on file.</p>
                          <button type="button"
                            onClick={() => { setShowPartnerViewModal(false); setPartnerViewAmbassador(null); handleOpenEditBank(amb); }}
                            className="mt-3 px-4 py-2 bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-sky-500/15 transition-colors cursor-pointer"
                          >
                            Add Bank Details
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payout Policies Card */}
                    <div className="bg-[#161513] border border-white/5 rounded-2xl p-6">
                      <h3 className="text-white font-bold text-sm mb-5">Referral Payout Policies</h3>
                      <ul className="space-y-3.5">
                        {[
                          `Rewards accumulate when a referred merchant completes their registration using your code.`,
                          <>Flat reward per signup: <span className="text-[#ffc53d] font-bold">¥{referralConfig.rewardPerSignup.toLocaleString()}</span> per establishment.</>,
                          <>Commission on first payment: <span className="text-[#ffc53d] font-bold">{referralConfig.commissionRate}%</span> of the referred tenant&apos;s first subscription charge.</>,
                          <>Minimum payout threshold: <span className="text-[#ffc53d] font-bold">¥{referralConfig.minPayoutThreshold.toLocaleString()}</span>. Admin processes transfers within 3 business days.</>,
                          <>Cookie tracking window: <span className="text-[#ffc53d] font-bold">{referralConfig.cookieDuration} days</span> — referral attribution is maintained for returning visitors.</>,
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[10.5px] text-[#A69984]/60 font-medium leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-[#A69984]/40 mt-2 flex-shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: EDIT AMBASSADOR PROFILE */}
      {showEditAmbassadorModal && editAmbassadorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowEditAmbassadorModal(false); setEditAmbassadorTarget(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-violet-400 text-xl">edit</span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">Edit Ambassador</h2>
                <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-0.5">Update contact details and referral code for <span className="text-white">{editAmbassadorTarget.name}</span></p>
              </div>
            </div>

            <form onSubmit={handleEditAmbassador} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
                  <input type="text" required placeholder="Full name"
                    value={editAmbassadorData.name}
                    onChange={e => setEditAmbassadorData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Phone</label>
                  <input type="tel" placeholder="+1 555 000 0000"
                    value={editAmbassadorData.phone}
                    onChange={e => setEditAmbassadorData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Email Address *</label>
                <input type="email" required placeholder="email@example.com"
                  value={editAmbassadorData.email}
                  onChange={e => setEditAmbassadorData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Referral Code</label>
                <div className="flex gap-2">
                  <input type="text"
                    aria-label="Referral Code"
                    placeholder="e.g. MARCUS421"
                    value={editAmbassadorData.code}
                    onChange={e => setEditAmbassadorData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                    className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 uppercase"
                  />
                  <button type="button"
                    onClick={() => setEditAmbassadorData(prev => ({ ...prev, code: generateReferralCode(prev.name || editAmbassadorTarget.name) }))}
                    className="px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#ffe2ab] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">shuffle</span>
                    New
                  </button>
                </div>
                <p className="text-[9px] text-[#A69984]/35 mt-1">Changing a live code will break any existing referral links for this ambassador.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowEditAmbassadorModal(false); setEditAmbassadorTarget(null); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REFERRED BUSINESS */}
      {showAddReferralModal && addReferralTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[520px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowAddReferralModal(false); setAddReferralTarget(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#ffc53d] text-xl">add_business</span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">Log Referred Business</h2>
                <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-0.5">
                  Manually add a referral for ambassador <span className="text-[#ffc53d] font-mono">{addReferralTarget.code}</span> — {addReferralTarget.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddReferral} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Business Name *</label>
                  <input type="text" required placeholder="e.g. Nobu Chicago"
                    value={newReferralData.name}
                    onChange={e => setNewReferralData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Contact Email *</label>
                  <input type="email" required placeholder="owner@business.com"
                    value={newReferralData.contact}
                    onChange={e => setNewReferralData(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Current Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pending', 'Active', 'Subscribed'] as const).map(s => (
                    <button key={s} type="button"
                      onClick={() => setNewReferralData(prev => ({ ...prev, status: s }))}
                      className={`py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                        newReferralData.status === s
                          ? s === 'Subscribed' ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                            : s === 'Active' ? 'bg-sky-500/15 border-sky-500/35 text-sky-400'
                            : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#A69984]/50 hover:border-white/15'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[#A69984]/35 mt-1.5">
                  {newReferralData.status === 'Pending' ? 'No reward credited yet — ambassador earns reward upon subscription.' : newReferralData.status === 'Active' ? 'Trial in progress.' : `Ambassador will earn $${referralConfig.rewardPerSignup} reward immediately.`}
                </p>
              </div>

              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Services Purchased</label>
                <div className="flex flex-wrap gap-2">
                  {['POS', 'KDS', 'Analytics', 'AI Concierge', 'Self Checkout', 'Offline Mode'].map(svc => {
                    const selected = newReferralData.services.includes(svc);
                    return (
                      <button key={svc} type="button"
                        onClick={() => setNewReferralData(prev => ({
                          ...prev,
                          services: selected ? prev.services.filter(s => s !== svc) : [...prev.services, svc]
                        }))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all cursor-pointer ${
                          selected ? 'bg-[#ffc53d]/10 border-[#ffc53d]/25 text-[#ffc53d]' : 'bg-white/[0.03] border-white/[0.08] text-[#A69984]/55 hover:border-white/15'
                        }`}
                      >
                        {selected && <span className="material-symbols-outlined text-[9px] mr-1">check</span>}
                        {svc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(newReferralData.status === 'Active' || newReferralData.status === 'Subscribed') && (
                <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-400 text-base flex-shrink-0 mt-0.5">payments</span>
                  <p className="text-emerald-300 text-[10.5px] font-semibold leading-relaxed">
                    <strong className="text-emerald-400">${referralConfig.rewardPerSignup}</strong> reward will be added to {addReferralTarget.name}&apos;s pending balance.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button"
                  onClick={() => { setShowAddReferralModal(false); setAddReferralTarget(null); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">add_business</span>
                  Log Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 0: LINK STRIPE Platform credentials */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => setShowStripeModal(false)}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Link Stripe Platform Account</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Enter your Stripe API credentials to charge restaurant subscribers.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Stripe Secret Key (sk_live_... / sk_test_...)</label>
                <input 
                  type="password" 
                  required
                  placeholder="sk_test_..."
                  value={stripeSecretKeyInput}
                  onChange={(e) => setStripeSecretKeyInput(e.target.value)}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Stripe Webhook Secret (whsec_...) - Optional</label>
                <input 
                  type="password" 
                  placeholder="whsec_..."
                  value={stripeWebhookSecretInput}
                  onChange={(e) => setStripeWebhookSecretInput(e.target.value)}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
              </div>

              <div className="bg-[#ffc53d]/5 border border-[#ffc53d]/15 p-3 rounded-lg flex gap-2.5 items-start">
                <span className="material-symbols-outlined text-[#ffc53d] text-sm mt-0.5">info</span>
                <p className="text-[10px] text-[#A69984] leading-relaxed">
                  Stripe key details will be stored securely in the platform registry. Leave Webhook Secret blank to fall back to environment configurations.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLinkStripe}
                className="w-full py-4 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer shadow-lg"
              >
                Link Stripe Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW BUSINESS TENANT */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => setShowAddTenantModal(false)}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Register Business Tenant</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Create a new corporate sub-account for the DinePOS ecosystem.</p>
            
            <form onSubmit={handleAddTenant} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Business Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Bouchon Bakery"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Primary Location (City)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Las Vegas"
                  value={newTenantData.location}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Subscribed Plan</label>
                <select
                  aria-label="Subscribed plan"
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, plan: e.target.value as Tenant['plan'] }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="TRIAL">Trial Package</option>
                  <option value="ACTIVE">Enterprise Growth</option>
                  <option value="SUSPENDED">Suspended / Deactivated</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Subscription Expiry Date</label>
                <input 
                  type="date"
                  value={newTenantData.expiryDate}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => setShowAddTenantModal(false)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.5: TENANT DETAILS & EXPIRES MANAGEMENT */}
      {showTenantDetailsModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[520px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => { setShowTenantDetailsModal(false); setSelectedTenant(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-1">Manage Tenant Subscription</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Review metadata and adjust system access parameters for this client.</p>
            
            <form onSubmit={handleSaveTenantExpiry} className="space-y-5">
              {/* Profile Card Summary & Configuration */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <div className="text-white font-bold text-sm">{selectedTenant.name}</div>
                    <div className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider mt-0.5">ID: {selectedTenant.id} · Joined: {selectedTenant.joined}</div>
                  </div>
                  <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedTenant.status === 'ACTIVE' ? theme.tagActive : theme.tagSuspended
                  }`}>
                    {selectedTenant.status}
                  </span>
                </div>
                
                 {/* Editable Fields */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Subscription Tier</label>
                    <div className="relative">
                      <select
                        aria-label="Subscription Tier"
                        value={selectedTenant.tier || 'Starter'}
                        onChange={(e) => setSelectedTenant(prev => prev ? { ...prev, tier: e.target.value } : null)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Growth">Growth</option>
                        <option value="Business">Business</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Access Plan</label>
                    <div className="relative">
                      <select
                        aria-label="Access Plan"
                        value={selectedTenant.plan || 'TRIAL'}
                        onChange={(e) => setSelectedTenant(prev => prev ? { ...prev, plan: e.target.value as any } : null)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="TRIAL">TRIAL</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXPIRED">EXPIRED</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Account Status</label>
                    <div className="relative">
                      <select
                        aria-label="Account Status"
                        value={selectedTenant.status || 'ACTIVE'}
                        onChange={(e) => setSelectedTenant(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Deployment Region</label>
                    <div className="relative">
                      <select
                        aria-label="Region"
                        value={selectedTenant.region || 'North America - East'}
                        onChange={(e) => setSelectedTenant(prev => prev ? { ...prev, region: e.target.value } : null)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="North America - East">NA - East</option>
                        <option value="Europe - West">EU - West</option>
                        <option value="Asia Pacific">Asia Pacific</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Platform Revenue</label>
                    <div className="w-full bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs text-[#ffc53d] font-bold select-none font-mono">
                      {selectedTenant.revenue}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Terminals Capacity</label>
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => setSelectedTenant(prev => prev ? { ...prev, terminals: Math.max(0, prev.terminals - 1) } : null)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white border border-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        -
                      </button>
                      <input 
                        type="text"
                        readOnly
                        value={`${selectedTenant.terminals} units`}
                        className="w-16 text-center bg-transparent text-xs text-white/90 font-semibold focus:outline-none"
                      />
                      <button type="button"
                        onClick={() => setSelectedTenant(prev => prev ? { ...prev, terminals: prev.terminals + 1 } : null)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white border border-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Alert Settlement */}
              {selectedTenant.billingFailed && (
                <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="material-symbols-outlined text-rose-400 text-base mt-0.5 flex-shrink-0">credit_card_off</span>
                    <div className="min-w-0">
                      <div className="text-rose-300 text-[11px] font-bold">Billing Failed / Suspended</div>
                      <p className="text-[10px] text-rose-400/70 font-semibold leading-normal mt-0.5 truncate">Recent transaction failed. Settle card fees.</p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => {
                      setSelectedTenant(prev => prev ? { ...prev, billingFailed: false, status: 'ACTIVE', plan: 'ACTIVE' } : null);
                      triggerToast(`Settled account billing for ${selectedTenant.name}!`, 'success');
                    }}
                    className="text-[9.5px] bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-md cursor-pointer transition-colors flex-shrink-0 ml-3"
                  >
                    Settle Fees
                  </button>
                </div>
              )}

              {/* Expiry Date Section */}
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Subscription Expiry Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    required
                    value={editingExpiryDate}
                    onChange={(e) => setEditingExpiryDate(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                  />
                </div>
                {(() => {
                  const expStatus = checkExpiryStatus(editingExpiryDate);
                  if (expStatus === 'expired') {
                    return (
                      <p className="text-[10px] text-rose-400 font-semibold mt-2 flex items-center gap-1.5 leading-none">
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">error</span>
                        This subscription is currently EXPIRED. Services are deactivated.
                      </p>
                    );
                  } else if (expStatus === 'warning') {
                    return (
                      <p className="text-[10px] text-amber-400 font-semibold mt-2 flex items-center gap-1.5 leading-none">
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">warning</span>
                        Expiring soon (less than 30 days remaining).
                      </p>
                    );
                  } else if (expStatus === 'active') {
                    return (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1.5 leading-none">
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">check_circle</span>
                        Subscription is active.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button type="button" 
                  onClick={() => { setShowTenantDetailsModal(false); setSelectedTenant(null); }}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW ADMIN OWNER */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => setShowAddAdminModal(false)}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Register Admin Owner</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Create the admin owner credentials linked to an active Tenant.</p>
            
            <form onSubmit={handleAddAdmin} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Owner Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Thomas Keller"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Work Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. keller@bouchon.com"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Linked Restaurant (Tenant)</label>
                <select
                  aria-label="Linked restaurant tenant"
                  value={newAdminData.tenant}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, tenant: e.target.value }))}
                  required
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                 <button type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.5: EDIT ADMIN OWNER */}
      {showEditAdminModal && selectedAdminToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => { setShowEditAdminModal(false); setSelectedAdminToEdit(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Edit Admin Owner</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Modify the admin owner credentials and details.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAdmins(prev => prev.map(a => 
                a.id === selectedAdminToEdit.id 
                  ? { ...a, name: editAdminData.name, email: editAdminData.email, tenant: editAdminData.tenant, status: editAdminData.status } 
                  : a
              ));
              setShowEditAdminModal(false);
              setSelectedAdminToEdit(null);
              triggerToast(`Admin "${editAdminData.name}" updated successfully.`, 'success');
              
              await recordActivity(
                'Edit Admin Details',
                `Edited details of admin "${editAdminData.name}" (${editAdminData.email})`,
                'Security',
                { adminId: selectedAdminToEdit.id, name: editAdminData.name, email: editAdminData.email, tenant: editAdminData.tenant, status: editAdminData.status }
              );

              setAuditLogs(logs => [
                {
                  id: Date.now(),
                  time: 'Just now',
                  actor: 'Super Admin',
                  action: `Edited details of admin "${editAdminData.name}"`,
                  tenant: 'Access Control',
                  type: 'info'
                },
                ...logs
              ]);
            }} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Owner Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Thomas Keller"
                  value={editAdminData.name}
                  onChange={(e) => setEditAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Work Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. keller@bouchon.com"
                  value={editAdminData.email}
                  onChange={(e) => setEditAdminData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Linked Restaurant (Tenant)</label>
                <select
                  aria-label="Linked restaurant tenant"
                  value={editAdminData.tenant}
                  onChange={(e) => setEditAdminData(prev => ({ ...prev, tenant: e.target.value }))}
                  required
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Account Status</label>
                <select
                  aria-label="Account status"
                  value={editAdminData.status}
                  onChange={(e) => setEditAdminData(prev => ({ ...prev, status: e.target.value as any }))}
                  required
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => { setShowEditAdminModal(false); setSelectedAdminToEdit(null); }}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PASSCODE RESET FORM FOR ISSUE HANDLING */}
      {/* MODAL: PROCESS REFERRAL PAYOUT */}
      {showPayoutModal && payoutTarget && (() => {
        const hasBankDetails = !!(payoutTarget.bank.bankName && payoutTarget.bank.accountHolder && payoutTarget.bank.accountNumber);
        const belowThreshold = payoutTarget.pendingRewards < referralConfig.minPayoutThreshold;
        const canPayout = hasBankDetails && !belowThreshold && payoutTarget.pendingRewards > 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
            <div className="bg-[#161513] border border-white/10 w-full max-w-[520px] p-8 rounded-2xl shadow-2xl relative font-sans">
              <button type="button"
                onClick={() => { setShowPayoutModal(false); setPayoutTarget(null); setPayoutAmount(''); setPayoutNote(''); }}
                className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#ffc53d] text-xl">payments</span>
                </div>
                <div>
                  <h3 className="font-serif text-white font-bold text-xl leading-tight">Process Payout</h3>
                  <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-0.5">
                    Ambassador: <span className="text-white">{payoutTarget.name}</span> · {payoutTarget.email}
                  </p>
                </div>
              </div>

              {/* No bank details warning */}
              {!hasBankDetails && (
                <div className="mb-5 flex items-start gap-3 bg-amber-500/8 border border-amber-500/25 rounded-xl p-4">
                  <span className="material-symbols-outlined text-amber-400 text-lg flex-shrink-0 mt-0.5">warning</span>
                  <div>
                    <p className="text-amber-300 font-bold text-xs">Bank Details Not On File</p>
                    <p className="text-[#A69984]/60 text-[10.5px] font-medium mt-1 leading-relaxed">
                      This ambassador has not provided payout bank details. Ask them to register via the <span className="text-[#ffc53d]">Partner Portal</span>, or add their bank details below before processing this payout.
                    </p>
                    <button type="button"
                      onClick={() => { setShowPayoutModal(false); handleOpenEditBank(payoutTarget); }}
                      className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Add Bank Details Now
                    </button>
                  </div>
                </div>
              )}

              {/* Below minimum payout threshold warning */}
              {hasBankDetails && belowThreshold && (
                <div className="mb-5 flex items-start gap-3 bg-sky-500/8 border border-sky-500/20 rounded-xl p-4">
                  <span className="material-symbols-outlined text-sky-400 text-base flex-shrink-0 mt-0.5">info</span>
                  <p className="text-sky-300 text-[10.5px] font-medium leading-relaxed">
                    Pending balance <span className="font-bold text-white">¥{payoutTarget.pendingRewards.toLocaleString()}</span> is below the minimum payout threshold of <span className="font-bold text-white">¥{referralConfig.minPayoutThreshold.toLocaleString()}</span>. You can still process a manual override payout below.
                  </p>
                </div>
              )}

              {/* Bank destination card */}
              {hasBankDetails && (
                <div className="mb-5 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[11px]">account_balance</span>
                      Destination Bank Account
                    </p>
                    <button type="button"
                      onClick={() => { setShowPayoutModal(false); handleOpenEditBank(payoutTarget); }}
                      className="text-[9px] text-[#ffe2ab]/60 hover:text-[#ffc53d] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[11px]">edit</span>
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Bank</div>
                      <div className="text-white font-bold mt-0.5">{payoutTarget.bank.bankName}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Account Holder</div>
                      <div className="text-white font-bold mt-0.5">{payoutTarget.bank.accountHolder}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Account Number</div>
                      <div className="text-[#A69984]/80 font-mono mt-0.5">{payoutTarget.bank.accountNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Routing / SWIFT</div>
                      <div className="text-[#A69984]/80 font-mono mt-0.5">{payoutTarget.bank.routingNumber || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payout form */}
              <form onSubmit={handleProcessPayout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Payout Amount (JPY)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-[#A69984]/50 text-xs font-bold">¥</span>
                      <input
                        type="number" step="1" min="1" required
                        placeholder="0"
                        aria-label="Payout amount"
                        value={payoutAmount}
                        onChange={e => setPayoutAmount(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-7 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end gap-1 pb-1">
                    <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-wider">Pending Balance</div>
                    <div className="text-amber-400 font-bold text-lg font-serif">¥{payoutTarget.pendingRewards.toLocaleString()}</div>
                    <div className="text-[9px] text-[#A69984]/35 font-semibold">Paid out: ¥{payoutTarget.paidRewards.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Reference Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Q2 2026 referral reward disbursement"
                    aria-label="Payout reference note"
                    value={payoutNote}
                    onChange={e => setPayoutNote(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>

                <div className="pt-1 flex gap-3">
                  <button type="button"
                    onClick={() => { setShowPayoutModal(false); setPayoutTarget(null); setPayoutAmount(''); setPayoutNote(''); }}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button type="button"
                    disabled={!canPayout}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      canPayout
                        ? 'bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] cursor-pointer shadow-md'
                        : 'bg-white/5 text-[#A69984]/30 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">payments</span>
                    {!hasBankDetails ? 'Bank Details Required' : 'Confirm Payout'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {showResetPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[440px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button"
              onClick={() => { setShowResetPasswordModal(false); setSelectedAdmin(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Reset Passcode</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">
              Manually overwrite security passcode for <span className="text-white font-bold">{selectedAdmin.name}</span> ({selectedAdmin.tenant}).
            </p>
            
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">New Administrative Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[#A69984]/40 text-sm absolute left-4 top-3.5">lock</span>
                  <input
                    type="password"
                    required
                    aria-label="New administrative password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[#A69984]/40 text-sm absolute left-4 top-3.5">lock</span>
                  <input
                    type="password"
                    required
                    aria-label="Confirm new password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => { setShowResetPasswordModal(false); setSelectedAdmin(null); }}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="button" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SaaS PRICING PLANS EDITOR */}
      {showPlanEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300 select-none">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[640px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button"
              onClick={() => { setShowPlanEditorModal(false); setEditingPlan(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-1">Global SaaS Pricing Plans</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Manage subscription pricing, operational terminal limits, and toggle feature gates.</p>

            {editingPlan ? (
              /* Plan editor subview */
              <form onSubmit={handlePlanSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Plan Name</label>
                    <input 
                      type="text" 
                      required
                      aria-label="Plan name"
                      placeholder="e.g. Enterprise Growth"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Fee (JPY)</label>
                    <input 
                      type="number" 
                      required
                      aria-label="Monthly price JPY"
                      placeholder="29900"
                      value={editingPlan.monthlyPrice}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, monthlyPrice: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Registers/Terminals Limit</label>
                    <input 
                      type="number" 
                      required
                      aria-label="Terminals limit"
                      placeholder="12"
                      value={editingPlan.terminalsLimit}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, terminalsLimit: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Storage Allocation (GB)</label>
                    <input 
                      type="number" 
                      required
                      aria-label="Storage allocation GB"
                      placeholder="100"
                      value={editingPlan.storageLimitGB}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, storageLimitGB: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                </div>

                {/* Plan features grid */}
                <div className="bg-[#0e0e0d]/55 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="font-bold text-[9.5px] text-[#ffe2ab]/70 uppercase tracking-widest border-b border-white/5 pb-2">Plan Feature Gates</div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.aiConcierge}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, aiConcierge: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      AI Sommelier Concierge
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.selfCheckout}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, selfCheckout: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      Guest Self-Checkout
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.analytics}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, analytics: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      Terminal Analytics Desk
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.offlineMode}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, offlineMode: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      Offline Mode Support
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" 
                    onClick={() => setEditingPlan(null)}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Back to Plans
                  </button>
                  <button type="button" 
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* Plans directory view */
              <div className="space-y-6 font-sans">
                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Tier Plan</th>
                        <th className="py-3 px-4 text-center">Monthly Price</th>
                        <th className="py-3 px-4 text-center">Terminals Limit</th>
                        <th className="py-3 px-4 text-center">Storage Allocation</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {saasPlans.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white">
                            {p.name}
                          </td>
                          <td className="py-4 px-4 text-center text-amber-400 font-mono text-sm">¥{p.monthlyPrice}/mo</td>
                          <td className="py-4 px-4 text-center text-[#e5e2e1]/80">{p.terminalsLimit === 999 ? 'Unlimited' : p.terminalsLimit}</td>
                          <td className="py-4 px-4 text-center text-[#e5e2e1]/80">{p.storageLimitGB} GB</td>
                          <td className="py-4 px-4 text-right">
                            <button type="button" 
                              onClick={() => setEditingPlan(p)}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#ffe2ab] px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Edit Settings
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button type="button" 
                    onClick={() => { setShowPlanEditorModal(false); }}
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Close Portal
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}


    </>
  );
}
