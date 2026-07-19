'use client';

import React, { useState } from 'react';

export default function AccessManager(props: any) {
  const {
    t, theme, isLightTheme, activeTab, triggerToast, admins,
    setShowAddAdminModal, handleDeleteAdmin, handleEditAdminClick,
    handleResetPasswordClick, promoCodes, newPromo: newPromoData, setNewPromo: setNewPromoData,
    handleExportPromoCodes,
    showCreatePromoModal, setShowCreatePromoModal,
    saasPlans,
    selectedPromoCode, setSelectedPromoCode, showPromoDetailModal, setShowPromoDetailModal, handleTogglePromoStatus, generatePromoCode,
    handleAddPromoCode, handleDeletePromoCode, promoFilterStatus,
    setPromoFilterStatus, promoSearchQuery, setPromoSearchQuery,
    hBg, hText, activeActionMenuId, setActiveActionMenuId,
    handleAddAdminSubmit, newAdminData, setNewAdminData, showAddAdminModal,
    handleEditAdminSubmit, editAdminData, setEditAdminData, showEditAdminModal,
    setShowEditAdminModal, handleResetPasswordSubmit, newPassword, setNewPassword,
    confirmPassword, setConfirmPassword, showResetPasswordModal, setShowResetPasswordModal,
    selectedAdmin, setSelectedAdmin, selectedAdminToEdit, setSelectedAdminToEdit,
    toggleAdminStatus,
    toggleTenantStatus,
    filteredAdmins
  } = props;

  return (
    <>
          {activeTab === 'access' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Admins & Access Control
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Manage admin owners (restaurant owners/managers), account permissions, and resolve administrative access credentials.
                  </p>
                </div>
                
                <button type="button"
                  onClick={() => setShowAddAdminModal(true)}
                  className={`px-5 py-3 ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">person_add</span>
                  Add Admin
                </button>
              </div>

              {/* Outstanding issues block - e.g., Password change requests */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 border-amber-500/20`}>
                <div className="flex items-center gap-3 select-none">
                  <span className="material-symbols-outlined text-amber-400 text-xl font-bold animate-bounce">warning</span>
                  <div>
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">Action Required: Administrative Issues</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Unresolved password resets and synchronicity claims.</p>
                  </div>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  {/* Issue 1 */}
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#0e0e0d]/80 border border-white/5 rounded-xl gap-4 hover:border-amber-400/20 transition-all`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/10 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Password Reset Request</span>
                        <span className="text-[10px] text-[#A69984]">Requested 10m ago</span>
                      </div>
                      <h4 className="text-white font-serif font-bold text-sm mt-2">Nick Jones — owner of "Soho House"</h4>
                      <p className="text-[11px] text-[#A69984]/70 mt-1 font-medium">Locked out of dashboard terminal. Needs password/passcode replacement immediately to handle night audit operations.</p>
                    </div>
                    
                    <button type="button" 
                      onClick={() => handleResetPasswordClick(admins.find((a: any) => a.id === 'adm-3')!)}
                      className="px-4 py-2.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors flex items-center gap-1 select-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-black">key</span>
                      Reset Passcode
                    </button>
                  </div>

                  {/* Issue 2 */}
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#0e0e0d]/80 border border-white/5 rounded-xl gap-4 hover:border-amber-400/20 transition-all`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/10 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Sync Integrity Block</span>
                        <span className="text-[10px] text-[#A69984]">Requested 1h ago</span>
                      </div>
                      <h4 className="text-white font-serif font-bold text-sm mt-2">Ana Ros — owner of "Hisa Franko"</h4>
                      <p className="text-[11px] text-[#A69984]/70 mt-1 font-medium">Billing node mismatch is preventing terminal synchronizations. System disabled tenant temporarily. Admin demands clearance validation.</p>
                    </div>
                    
                    <button type="button" 
                      onClick={() => {
                        toggleTenantStatus('tenant-5', 'Hisa Franko', 'SUSPENDED');
                        triggerToast('Sync block cleared. Tenant status set to active.', 'success');
                      }}
                      className="px-4 py-2.5 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors flex items-center gap-1 select-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      Clear Sync Block
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Directory Table */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                  <h3 className="font-serif text-base text-white font-bold tracking-wide">Admin Owners Registry</h3>
                  <span className="text-xs text-[#A69984]/50 font-semibold">{filteredAdmins.length} Admins registered</span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Owner Name</th>
                        <th className="py-4 px-4">Work Email</th>
                        <th className="py-4 px-4">Owned Business (Tenant)</th>
                        <th className="py-4 px-4">Last Activity</th>
                        <th className="py-4 px-4 text-center">Account Status</th>
                        <th className="py-4 px-4 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {filteredAdmins.map((a: any) => (
                        <tr key={a.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold uppercase">
                              {a.name.slice(0, 2)}
                            </span>
                            {a.name}
                          </td>
                          <td className="py-4 px-4 text-[#A69984]">{a.email}</td>
                          <td className="py-4 px-4 text-white/80">{a.tenant}</td>
                          <td className="py-4 px-4 text-[#A69984]/70">{a.lastActive}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${
                              a.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                              a.status === 'SUSPENDED' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-[#A69984]/40'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button type="button" 
                              onClick={() => {
                                setSelectedAdminToEdit(a);
                                setEditAdminData({
                                  name: a.name,
                                  email: a.email,
                                  tenant: a.tenant,
                                  status: a.status
                                });
                                setShowEditAdminModal(true);
                              }}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#ffe2ab] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button type="button" 
                              onClick={() => handleResetPasswordClick(a)}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#A69984] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Password
                            </button>
                            <button type="button" 
                              onClick={() => toggleAdminStatus(a.id, a.name, a.status)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                a.status === 'ACTIVE' 
                                  ? 'border-rose-500/10 text-rose-400 hover:bg-rose-500/10' 
                                  : 'border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {a.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                            <button type="button" 
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete admin ${a.name}?`)) {
                                  handleDeleteAdmin(a.id);
                                  triggerToast(`Admin "${a.name}" deleted!`, 'success');
                                }
                              }}
                              className="text-[10px] border border-red-500/25 hover:border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'promocodes' && (() => {
            const filteredPromos = promoCodes.filter((p: any) => {
              const matchesSearch = p.code.toLowerCase().includes(promoSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(promoSearchQuery.toLowerCase());
              const matchesStatus = promoFilterStatus === 'all' || p.status === promoFilterStatus;
              return matchesSearch && matchesStatus;
            });
            const totalRedemptions = promoCodes.reduce((s: any, p: any) => s + p.currentUses, 0);
            const activeCount = promoCodes.filter((p: any) => p.status === 'active').length;
            const totalDiscountGiven = promoCodes.reduce((s: any, p: any) => s + p.usageLog.reduce((ls: any, u: any) => ls + u.discountAmount, 0), 0);
            return (
              <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">Promo Codes</h1>
                    <p className="font-sans text-[12.5px] text-[#A69984]/65 font-semibold mt-2">Create and manage subscription discount codes for your SaaS plans.</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleExportPromoCodes}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold uppercase tracking-wider ${theme.textMuted} hover:text-white transition-all`}>
                      <span className="material-symbols-outlined text-sm">download</span>Export CSV
                    </button>
                    <button type="button" onClick={() => setShowCreatePromoModal(true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider ${theme.accentHoverBg} transition-all shadow-lg`}>
                      <span className="material-symbols-outlined text-sm">add</span>Create Code
                    </button>
                  </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Codes', value: promoCodes.length, icon: 'local_offer', color: 'text-amber-400' },
                    { label: 'Active Codes', value: activeCount, icon: 'check_circle', color: 'text-emerald-400' },
                    { label: 'Total Redemptions', value: totalRedemptions, icon: 'redeem', color: 'text-sky-400' },
                    { label: 'Total Discount Given', value: `$${totalDiscountGiven.toFixed(0)}`, icon: 'savings', color: 'text-violet-400' },
                  ].map(kpi => (
                    <div key={kpi.label} className={`${theme.cardBg} border rounded-2xl p-5 flex items-center gap-4`}>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <span className={`material-symbols-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
                      </div>
                      <div>
                        <div className="font-sans text-[10px] text-[#A69984]/60 uppercase tracking-widest font-bold">{kpi.label}</div>
                        <div className="font-serif text-2xl text-white font-bold mt-0.5">{kpi.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filter / Search Bar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-grow max-w-xs">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#A69984]/40">search</span>
                    <input type="text" placeholder="Search code or description..."
                      value={promoSearchQuery} onChange={e => setPromoSearchQuery(e.target.value)}
                      className={`w-full bg-[#161513]/40 border ${theme.border} rounded-xl pl-9 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`} />
                  </div>
                  <select aria-label="Filter by status"
                    value={promoFilterStatus} onChange={e => setPromoFilterStatus(e.target.value as typeof promoFilterStatus)}
                    className={`bg-[#161513] border ${theme.border} rounded-xl px-4 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-white/20 font-bold uppercase tracking-wider`}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                  <div className="text-xs text-[#A69984]/50 font-bold">{filteredPromos.length} of {promoCodes.length}</div>
                </div>

                {/* Promo Codes Table */}
                <div className={`${theme.cardBg} border rounded-2xl overflow-hidden`}>
                  {/* Table header */}
                  <div className="grid grid-cols-[2fr_3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                    {['Code', 'Description', 'Discount', 'Plan', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                      <div key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50">{h}</div>
                    ))}
                  </div>
                  {filteredPromos.length === 0 ? (
                    <div className="py-16 text-center">
                      <span className="material-symbols-outlined text-4xl text-[#A69984]/20 block mb-3">local_offer</span>
                      <p className="text-[#A69984]/50 text-sm font-bold">No promo codes match your filter.</p>
                    </div>
                  ) : (
                    filteredPromos.map((promo: any) => {
                      const isExpiredByDate = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                      const isMaxedOut = promo.maxUses !== null && promo.currentUses >= promo.maxUses;
                      const displayStatus = (isExpiredByDate || isMaxedOut) ? 'expired' : promo.status;
                      const usagePct = promo.maxUses ? Math.min(100, (promo.currentUses / promo.maxUses) * 100) : 0;
                      return (
                        <div key={promo.id} className={`grid grid-cols-[2fr_3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.015] transition-colors items-center`}>
                          {/* Code */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm tracking-widest">{promo.code}</span>
                          </div>
                          {/* Description */}
                          <div className="text-xs text-[#A69984]/70 font-medium leading-snug line-clamp-2">{promo.description}</div>
                          {/* Discount */}
                          <div>
                            <span className="font-bold text-sm text-white">
                              {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                            </span>
                            <div className="text-[10px] text-[#A69984]/50 font-bold mt-0.5 capitalize">{promo.discountType}</div>
                          </div>
                          {/* Plan */}
                          <div className="text-xs text-[#A69984]/70 font-semibold">
                            {promo.applicablePlan === 'all' ? <span className="text-sky-400">All Plans</span> : (saasPlans.find((s: any) => s.id === promo.applicablePlan)?.name || promo.applicablePlan)}
                          </div>
                          {/* Uses */}
                          <div>
                            <div className="text-xs font-bold text-white">{promo.currentUses}{promo.maxUses ? ` / ${promo.maxUses}` : ' / ∞'}</div>
                            {promo.maxUses && (
                              <div className="w-full bg-white/5 rounded-full h-1 mt-1.5">
                                <div className={`h-1 rounded-full ${isMaxedOut ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${usagePct}%` }} />
                              </div>
                            )}
                          </div>
                          {/* Expires */}
                          <div className="text-xs text-[#A69984]/60 font-medium">
                            {promo.expiresAt ? (
                              <span className={isExpiredByDate ? 'text-rose-400' : 'text-[#A69984]/60'}>{promo.expiresAt}</span>
                            ) : <span className="text-emerald-400/70">No Expiry</span>}
                          </div>
                          {/* Status badge */}
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              displayStatus === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              displayStatus === 'inactive' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              'bg-white/5 border-white/10 text-[#A69984]/50'
                            }`}>{displayStatus}</span>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => { setSelectedPromoCode(promo); setShowPromoDetailModal(true); }}
                              title="View usage details"
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-sm text-[#A69984]/70">visibility</span>
                            </button>
                            {displayStatus !== 'expired' && (
                              <button type="button" onClick={() => handleTogglePromoStatus(promo.id)}
                                title={promo.status === 'active' ? 'Deactivate' : 'Activate'}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${promo.status === 'active' ? 'bg-rose-500/10 hover:bg-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20'}`}>
                                <span className={`material-symbols-outlined text-sm ${promo.status === 'active' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {promo.status === 'active' ? 'pause' : 'play_arrow'}
                                </span>
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeletePromoCode(promo.id, promo.code)}
                              title="Delete permanently"
                              className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-sm text-rose-400">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Empty state CTA */}
                {promoCodes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl text-amber-400">local_offer</span>
                    </div>
                    <h3 className="font-serif text-xl text-white mb-2">No promo codes yet</h3>
                    <p className="text-[#A69984]/60 text-sm mb-6">Create your first discount code to attract new restaurant subscribers.</p>
                    <button type="button" onClick={() => setShowCreatePromoModal(true)}
                      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider ${theme.accentHoverBg} transition-all shadow-lg`}>
                      <span className="material-symbols-outlined text-sm">add</span>Create First Code
                    </button>
                  </div>
                )}

                {/* CREATE PROMO CODE MODAL */}
                {showCreatePromoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className={`${theme.cardBgOpaque} border rounded-2xl w-full max-w-lg shadow-2xl`}>
                      <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div>
                          <h3 className="font-serif text-xl text-white font-bold">Create Promo Code</h3>
                          <p className="text-[11px] text-[#A69984]/60 font-medium mt-0.5">New discount code for subscription plans</p>
                        </div>
                        <button type="button" onClick={() => setShowCreatePromoModal(false)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-sm text-[#A69984]/60">close</span>
                        </button>
                      </div>
                      <form onSubmit={handleAddPromoCode} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                        {/* Code */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Promo Code *</label>
                          <div className="flex gap-2">
                            <input type="text" required aria-label="Promo code" placeholder="e.g. SAVE30, LAUNCH50"
                              value={newPromoData.code}
                              onChange={e => setNewPromoData((p: any) => ({ ...p, code: e.target.value.toUpperCase() }))}
                              className={`flex-grow bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                            <button type="button" onClick={() => setNewPromoData((p: any) => ({ ...p, code: generatePromoCode() }))}
                              className={`px-4 py-3 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold text-[#A69984]/60 hover:text-white transition-all whitespace-nowrap`}>
                              Auto-Generate
                            </button>
                          </div>
                        </div>
                        {/* Description */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Description *</label>
                          <input type="text" required aria-label="Promo code description" placeholder="Brief purpose of this promo code"
                            value={newPromoData.description}
                            onChange={e => setNewPromoData((p: any) => ({ ...p, description: e.target.value }))}
                            className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                        </div>
                        {/* Discount type + value */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Discount Type *</label>
                            <select aria-label="Discount type" value={newPromoData.discountType}
                              onChange={e => setNewPromoData((p: any) => ({ ...p, discountType: e.target.value as 'percentage' | 'flat' }))}
                              className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50`}>
                              <option value="percentage">Percentage (%)</option>
                              <option value="flat">Flat Amount ($)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">
                              {newPromoData.discountType === 'percentage' ? 'Percent Off *' : 'Flat Discount ($) *'}
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-3 text-xs text-[#A69984]/50 font-bold">
                                {newPromoData.discountType === 'percentage' ? '%' : '$'}
                              </span>
                              <input type="number" required min="1" max={newPromoData.discountType === 'percentage' ? '100' : undefined}
                                step="0.01" aria-label="Discount value" placeholder={newPromoData.discountType === 'percentage' ? '0–100' : 'e.g. 100'}
                                value={newPromoData.discountValue}
                                onChange={e => setNewPromoData((p: any) => ({ ...p, discountValue: e.target.value }))}
                                className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl pl-8 pr-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                            </div>
                          </div>
                        </div>
                        {/* Applicable Plan */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Applicable Plan</label>
                          <select aria-label="Applicable plan" value={newPromoData.applicablePlan}
                            onChange={e => setNewPromoData((p: any) => ({ ...p, applicablePlan: e.target.value }))}
                            className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50`}>
                            <option value="all">All Plans</option>
                            {saasPlans.map((plan: any) => (
                              <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Max Uses + Expiry */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Max Uses (blank = unlimited)</label>
                            <input type="number" min="1" aria-label="Maximum number of uses" placeholder="e.g. 100"
                              value={newPromoData.maxUses}
                              onChange={e => setNewPromoData((p: any) => ({ ...p, maxUses: e.target.value }))}
                              className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Expiry Date (blank = no expiry)</label>
                            <input type="date" aria-label="Expiry date"
                              value={newPromoData.expiresAt}
                              onChange={e => setNewPromoData((p: any) => ({ ...p, expiresAt: e.target.value }))}
                              className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50`} />
                          </div>
                        </div>
                        {/* Preview */}
                        {newPromoData.code && newPromoData.discountValue && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2">Preview</div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-black text-amber-400 text-lg tracking-widest">{newPromoData.code || '—'}</span>
                              <span className="text-[#A69984]/60 text-xs">—</span>
                              <span className="text-white text-sm font-bold">
                                {newPromoData.discountType === 'percentage' ? `${newPromoData.discountValue}% off` : `$${newPromoData.discountValue} off`}
                              </span>
                              <span className="text-[#A69984]/40 text-xs">
                                {newPromoData.applicablePlan === 'all' ? 'all plans' : (saasPlans.find((s: any) => s.id === newPromoData.applicablePlan)?.name || '')}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setShowCreatePromoModal(false)}
                            className={`flex-1 px-4 py-3 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold text-[#A69984]/60 hover:text-white transition-all`}>
                            Cancel
                          </button>
                          <button type="submit"
                            className={`flex-1 px-4 py-3 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider ${theme.accentHoverBg} transition-all`}>
                            Create Promo Code
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* PROMO CODE DETAIL / USAGE MODAL */}
                {showPromoDetailModal && selectedPromoCode && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className={`${theme.cardBgOpaque} border rounded-2xl w-full max-w-2xl shadow-2xl`}>
                      <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400 text-xl">local_offer</span>
                          </div>
                          <div>
                            <h3 className="font-mono font-black text-amber-400 text-xl tracking-widest">{selectedPromoCode.code}</h3>
                            <p className="text-xs text-[#A69984]/60 font-medium mt-0.5">{selectedPromoCode.description}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setShowPromoDetailModal(false)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-sm text-[#A69984]/60">close</span>
                        </button>
                      </div>
                      <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                        {/* Code stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Discount', value: selectedPromoCode.discountType === 'percentage' ? `${selectedPromoCode.discountValue}%` : `$${selectedPromoCode.discountValue}`, sub: selectedPromoCode.discountType },
                            { label: 'Uses', value: `${selectedPromoCode.currentUses}${selectedPromoCode.maxUses ? ` / ${selectedPromoCode.maxUses}` : ' / ∞'}`, sub: 'redemptions' },
                            { label: 'Expires', value: selectedPromoCode.expiresAt ?? 'Never', sub: selectedPromoCode.expiresAt ? (new Date(selectedPromoCode.expiresAt) < new Date() ? 'expired' : 'upcoming') : 'no expiry' },
                            { label: 'Status', value: selectedPromoCode.status.charAt(0).toUpperCase() + selectedPromoCode.status.slice(1), sub: `created ${selectedPromoCode.createdAt}` },
                          ].map(s => (
                            <div key={s.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50 mb-1">{s.label}</div>
                              <div className="font-bold text-white text-base">{s.value}</div>
                              <div className="text-[10px] text-[#A69984]/40 mt-0.5 capitalize">{s.sub}</div>
                            </div>
                          ))}
                        </div>
                        {/* Applicable plan */}
                        <div className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                          <span className="material-symbols-outlined text-sky-400 text-lg">inventory_2</span>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50">Applicable Plan</div>
                            <div className="text-sm font-bold text-white mt-0.5">
                              {selectedPromoCode.applicablePlan === 'all' ? 'All Plans' : (saasPlans.find((s: any) => s.id === selectedPromoCode.applicablePlan)?.name || selectedPromoCode.applicablePlan)}
                            </div>
                          </div>
                        </div>
                        {/* Usage log */}
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#A69984]/50 mb-3">Usage Log ({selectedPromoCode.usageLog.length})</h4>
                          {selectedPromoCode.usageLog.length === 0 ? (
                            <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
                              <span className="material-symbols-outlined text-2xl text-[#A69984]/20 block mb-2">history</span>
                              <p className="text-xs text-[#A69984]/40 font-bold">No redemptions recorded yet.</p>
                            </div>
                          ) : (
                            <div className={`${theme.cardBg} border rounded-xl overflow-hidden`}>
                              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5">
                                {['Tenant', 'Plan Used', 'Used On', 'Saved'].map(h => (
                                  <div key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/40">{h}</div>
                                ))}
                              </div>
                              {selectedPromoCode.usageLog.map((u: any, i: number) => (
                                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/5 last:border-0 items-center">
                                  <div className="text-xs font-bold text-white">{u.tenantName}</div>
                                  <div className="text-xs text-[#A69984]/60">{(saasPlans.find((s: any) => s.id === u.planId) as any)?.name || u.planId}</div>
                                  <div className="text-xs text-[#A69984]/60">{u.usedAt}</div>
                                  <div className="text-xs font-bold text-emerald-400">${u.discountAmount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t border-white/5">
                          {selectedPromoCode.status !== 'expired' && (
                            <button type="button"
                              onClick={() => { handleTogglePromoStatus(selectedPromoCode.id); setShowPromoDetailModal(false); }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                                selectedPromoCode.status === 'active'
                                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              }`}>
                              <span className="material-symbols-outlined text-sm">{selectedPromoCode.status === 'active' ? 'pause' : 'play_arrow'}</span>
                              {selectedPromoCode.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          <button type="button"
                            onClick={() => { handleDeletePromoCode(selectedPromoCode.id, selectedPromoCode.code); setShowPromoDetailModal(false); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold uppercase tracking-wider transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>Delete Code
                          </button>
                          <button type="button" onClick={() => setShowPromoDetailModal(false)}
                            className={`ml-auto px-4 py-2.5 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold text-[#A69984]/60 hover:text-white transition-all`}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

    </>
  );
}
