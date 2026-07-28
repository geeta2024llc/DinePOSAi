'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { apiRequest } from '@/utils/api';

export default function TenantManager(props: any) {
  const {
    t, theme, isLightTheme, activeTab, searchQuery, setSearchQuery,
    statusFilter, setStatusFilter, tierFilter, setTierFilter,
    regionFilter, setRegionFilter, triggerToast, filteredTenants,
    deployProgress, triggerDeployUpdate, handleSuspendTenant,
    handleUnsuspendTenant, setShowAddTenantModal, globalAesthetic,
    setGlobalAesthetic, customBg, setCustomBg, customCardBg,
    setCustomCardBg, customAccent, setCustomAccent, customText,
    setCustomText, customTextMuted, setCustomTextMuted, handleSaveChanges,
    locationsView, setLocationsView, tenants, hText, setActiveTab,
    setShowTerminalModal, handleExportTenants, setAttentionOnlyFilter,
    attentionOnlyFilter, checkExpiryStatus, getExpiryCountdownText,
    setSelectedTenant, setEditingExpiryDate, setShowTenantDetailsModal,
    setActiveActionMenuId, activeActionMenuId, toggleTenantStatus,
    handleQuickRenew, handleRetryBilling, handleDeleteTenant, handleBulkDeleteTenants,
    handleSaveTenantExpiry, editingExpiryDate, selectedTenant, showTenantDetailsModal,
    globalFeatures, setGlobalFeatures, setAuditLogs, filteredLogs,
    showAddTenantModal, newTenantData, setNewTenantData, handleAddTenant,
    isLoadingOverview, overviewError
  } = props;

  // ── Rich Tenant Details Modal State ───────────────────────────────────────
  const [showRichDetailsModal, setShowRichDetailsModal] = useState(false);
  const [richDetailsData, setRichDetailsData] = useState<any>(null);
  const [isLoadingRichDetails, setIsLoadingRichDetails] = useState(false);
  const [richDetailsError, setRichDetailsError] = useState<string | null>(null);

  const handleOpenDetails = async (ten: any) => {
    setRichDetailsData({
      id: ten.id,
      name: ten.name,
      email: ten.email || '',
      ownerName: ten.ownerName || 'Restaurant Owner',
      status: ten.status,
      plan: ten.plan,
      country: ten.location || 'United States',
      createdAt: ten.joined || 'N/A',
      expiryDate: ten.expiryDate || 'N/A',
    });
    setShowRichDetailsModal(true);
    setIsLoadingRichDetails(true);
    setRichDetailsError(null);

    try {
      const res = await apiRequest<any>(`/api/admin/tenants/${ten.id}/details`);
      if (res.success && res.data) {
        setRichDetailsData(res.data);
      } else {
        setRichDetailsError(res.error || 'Failed to fetch detailed records.');
      }
    } catch (err: any) {
      console.error('Error fetching tenant details:', err);
      setRichDetailsError(err.message || 'Network error fetching tenant details.');
    } finally {
      setIsLoadingRichDetails(false);
    }
  };

  // ── Bulk selection state ──────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkExpiryModal, setShowBulkExpiryModal] = useState(false);
  const [bulkExpiryDate, setBulkExpiryDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const activeTenantCount = useMemo(() => {
    return Array.isArray(tenants) ? tenants.filter((t: any) => t.status === 'ACTIVE').length : 0;
  }, [tenants]);

  const dynamicRegions = useMemo(() => {
    if (!Array.isArray(tenants)) return [];
    const set = new Set(tenants.map((t: any) => t.region || t.location || 'North America - East'));
    return Array.from(set);
  }, [tenants]);

  const attentionRequiredCount = useMemo(() => {
    if (!Array.isArray(tenants)) return 0;
    return tenants.filter((t: any) => t.status === 'SUSPENDED' || (checkExpiryStatus && checkExpiryStatus(t.expiryDate) === 'expired') || t.billingFailed).length;
  }, [tenants, checkExpiryStatus]);

  const expiringSoonCount = useMemo(() => {
    if (!Array.isArray(tenants)) return 0;
    return tenants.filter((t: any) => checkExpiryStatus && checkExpiryStatus(t.expiryDate) === 'warning').length;
  }, [tenants, checkExpiryStatus]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((filteredTenants?.length || 0) / PAGE_SIZE));
  }, [filteredTenants]);

  const pagedTenants = useMemo(() => {
    if (!Array.isArray(filteredTenants)) return [];
    return filteredTenants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredTenants, currentPage]);

  const allPageSelected = useMemo(() => {
    return pagedTenants.length > 0 && pagedTenants.every((t: any) => selectedIds.has(t.id));
  }, [pagedTenants, selectedIds]);

  const someSelected = selectedIds.size > 0;

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedIds(prev => { const n = new Set(prev); pagedTenants.forEach((t: any) => n.delete(t.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); pagedTenants.forEach((t: any) => n.add(t.id)); return n; });
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

  const bulkActivate = () => {
    selectedIds.forEach(id => { const t = tenants.find((x: any) => x.id === id); if (t && t.status !== 'ACTIVE') toggleTenantStatus(id, t.name, t.status); });
    triggerToast(`Activated ${selectedIds.size} tenant(s).`, 'success');
    clearSelection();
  };
  const bulkSuspend = () => {
    selectedIds.forEach(id => { const t = tenants.find((x: any) => x.id === id); if (t && t.status === 'ACTIVE') toggleTenantStatus(id, t.name, t.status); });
    triggerToast(`Suspended ${selectedIds.size} tenant(s).`, 'success');
    clearSelection();
  };
  const bulkExtend30 = () => {
    selectedIds.forEach(id => handleQuickRenew(id, 30));
    triggerToast(`Extended expiry (+30d) for ${selectedIds.size} tenant(s).`, 'success');
    clearSelection();
  };
  const bulkExtend365 = () => {
    selectedIds.forEach(id => handleQuickRenew(id, 365));
    triggerToast(`Extended expiry (+1yr) for ${selectedIds.size} tenant(s).`, 'success');
    clearSelection();
  };
  const bulkSetExpiry = () => {
    if (!bulkExpiryDate) { triggerToast('Please pick a date.', 'info'); return; }
    // Update each selected tenant expiry directly via setAuditLogs pattern
    selectedIds.forEach(id => handleQuickRenew(id, 0, bulkExpiryDate));
    triggerToast(`Custom expiry set for ${selectedIds.size} tenant(s).`, 'success');
    setShowBulkExpiryModal(false);
    setBulkExpiryDate('');
    clearSelection();
  };
  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    if (typeof handleBulkDeleteTenants === 'function') {
      handleBulkDeleteTenants(idsArray, clearSelection);
    } else {
      idsArray.forEach(id => {
        const t = tenants.find((x: any) => x.id === id);
        if (t) handleDeleteTenant(id, t.name);
      });
      clearSelection();
    }
  };

  // Initials avatar helper
  const getInitials = (name: string) => name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const avatarColors = ['bg-violet-500/20 text-violet-300 border-violet-500/30', 'bg-sky-500/20 text-sky-300 border-sky-500/30', 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', 'bg-rose-500/20 text-rose-300 border-rose-500/30', 'bg-amber-500/20 text-amber-300 border-amber-500/30'];
  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <>
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header Title */}
              <div>
                <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                  Enterprise Insights
                </h1>
                <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                  Real-time performance metrics across the global restaurant network.
                </p>
              </div>

              {/* KPI Cards Row (4 Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                {/* Card 1: Global Revenue */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Global Revenue</span>
                    <span className="material-symbols-outlined text-amber-400 text-lg">payments</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#ffc53d] tracking-wide">$0.00</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Live synchronized data</p>
                  </div>
                </div>

                {/* Card 2: Managed Tenants */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Active Tenants</span>
                    <span className="material-symbols-outlined text-[#ffc53d] text-lg font-bold">corporate_fare</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">{tenants.length}</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Registered businesses</p>
                  </div>
                </div>

                {/* Card 3: System Health */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">System Health</span>
                    <span className="material-symbols-outlined text-emerald-400 text-lg font-bold">check_circle</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">100.0%</h3>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">Operational & online</p>
                  </div>
                </div>

                {/* Card 4: Active Workspaces */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Workspace Nodes</span>
                    <span className="material-symbols-outlined text-[#ffc53d] text-lg">dns</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">{tenants.length}</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Provisioned clusters</p>
                  </div>
                </div>
              </div>

              {/* Location Performance & Activity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Location Performance Map Card (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden`}>
                    <div className="flex justify-between items-center select-none">
                      <div>
                        <h3 className={`font-serif text-base ${theme.text} font-bold tracking-wide`}>Location Performance</h3>
                        <p className={`text-[11px] ${theme.textMuted} font-semibold mt-0.5`}>Real-time status of managed nodes</p>
                      </div>
                      <div className={`flex items-center gap-1 bg-black/10 border ${theme.border} rounded-lg p-0.5 text-[10px] font-bold font-sans uppercase tracking-wider`}>
                        <button type="button"
                          onClick={() => setLocationsView('list')}
                          className={`px-3 py-1.5 rounded transition-all cursor-pointer ${locationsView === 'list' ? `${theme.accentBg} ${theme.accentText}` : `${theme.textMuted} ${hText}`}`}
                        >
                          List View
                        </button>
                        <button type="button"
                          onClick={() => setLocationsView('card')}
                          className={`px-3 py-1.5 rounded transition-all cursor-pointer ${locationsView === 'card' ? `${theme.accentBg} ${theme.accentText}` : `${theme.textMuted} ${hText}`}`}
                        >
                          Map View
                        </button>
                      </div>
                    </div>

                    {/* Map View */}
                    {locationsView === 'card' && (
                      <>
                        <div className="relative w-full h-[320px] bg-[#0c0c0b] rounded-xl flex items-center justify-center border border-white/5 group shadow-inner">
                          <div className="absolute inset-0 bg-[radial-gradient(#ffe2ab/4_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-25"></div>
                          <div className="absolute top-[48%] left-[28%] flex flex-col items-center group/dot cursor-pointer">
                            <div className="w-3.5 h-3.5 bg-rose-500 rounded-full motion-safe:animate-ping absolute"></div>
                            <div className="w-3.5 h-3.5 bg-rose-500 rounded-full border border-black z-10"></div>
                            <span className="absolute bottom-5 bg-[#161513] text-[9.5px] text-rose-400 font-bold font-sans uppercase px-2.5 py-1 rounded border border-rose-500/20 shadow-md whitespace-nowrap z-20">New York • Offline</span>
                          </div>
                          <div className="absolute top-[38%] left-[48%] flex flex-col items-center group/dot cursor-pointer">
                            <div className="w-3 h-3 bg-amber-400 rounded-full motion-safe:animate-pulse absolute"></div>
                            <div className="w-3 h-3 bg-amber-400 rounded-full border border-black z-10"></div>
                            <span className="absolute bottom-5 bg-[#161513] text-[9.5px] text-amber-400 font-bold font-sans uppercase px-2.5 py-1 rounded border border-amber-400/20 shadow-md whitespace-nowrap z-20">Paris Flagship • Online</span>
                          </div>
                          <div className="absolute top-[52%] left-[78%] flex flex-col items-center group/dot cursor-pointer">
                            <div className="w-2 h-2 bg-amber-400 rounded-full border border-black z-10"></div>
                            <span className="absolute bottom-4 bg-[#161513] text-[9px] text-[#A69984] font-bold font-sans uppercase px-2 py-0.5 rounded border border-white/5 shadow-md whitespace-nowrap z-20 scale-0 group-hover/dot:scale-100 transition-all">Tokyo Outpost</span>
                          </div>
                          <span className="material-symbols-outlined text-[100px] text-white/[0.03] group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none">public</span>
                        </div>
                        <div className="flex items-center gap-6 text-[10.5px] font-sans font-bold uppercase tracking-wider select-none">
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="text-white">Online Sites</span><span className="text-[#A69984]/65 ml-0.5 font-normal">38</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span><span className="text-white">Maintenance</span><span className="text-[#A69984]/65 ml-0.5 font-normal">3</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-white">Critical Alert</span><span className="text-[#A69984]/65 ml-0.5 font-normal">1</span></div>
                        </div>
                      </>
                    )}

                    {/* List View */}
                    {locationsView === 'list' && (
                      <div className="space-y-2 max-h-[370px] overflow-y-auto pr-1">
                        {tenants.map((t: any) => (
                          <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-white/[0.025] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <div className="min-w-0">
                                <div className="text-white font-bold text-xs truncate">{t.name}</div>
                                <div className="text-[#A69984]/50 text-[9.5px] font-semibold mt-0.5">{t.location} · {t.id}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                              <div className="text-right">
                                <div className="text-[#ffc53d] font-bold text-xs">{t.revenue}</div>
                                <div className="text-[#A69984]/45 text-[9px] font-semibold">{t.terminals} terminals</div>
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${t.status === 'ACTIVE' ? theme.tagActive : theme.tagSuspended}`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enterprise Activity Log Card (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 flex flex-col justify-between h-[436px]`}>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Enterprise Activity</h3>
                        <p className="text-[11px] text-[#A69984]/50 font-semibold mt-0.5">Security & Configuration Log</p>
                      </div>

                      {/* Logs Feed list */}
                      <div className="space-y-4 font-sans text-xs select-text">
                        {/* Log Item 1 */}
                        <div className="flex gap-3 items-start border-l border-amber-400/20 pl-3">
                          <div className="w-5 h-5 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px] font-bold">lock_open</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight">Security Policy Updated</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              Admin 'J. Doe' modified RBAC permissions for Singapore cluster.
                            </p>
                            <span className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider block mt-1">14:22:10 UTC</span>
                          </div>
                        </div>

                        {/* Log Item 2 */}
                        <div className="flex gap-3 items-start border-l border-white/5 pl-3">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#e5e2e1]/70 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px]">system_update_alt</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight">POS Firmware v2.4 Push</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              Deployment initiated for EMEA region terminals (2,400 nodes).
                            </p>
                            <span className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider block mt-1">12:05:45 UTC</span>
                          </div>
                        </div>

                        {/* Log Item 3 */}
                        <div className="flex gap-3 items-start border-l border-rose-500/20 pl-3">
                          <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px] font-bold">error</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight text-rose-400">API Latency Spike</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              US-East database nodes experiencing 200ms+ delay. Auto-scaling initiated.
                            </p>
                            <span className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider block mt-1">11:58:12 UTC</span>
                          </div>
                        </div>

                        {/* Log Item 4 */}
                        <div className="flex gap-3 items-start border-l border-white/5 pl-3">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#e5e2e1]/70 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px]">description</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight">Billing Cycle Finalized</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              Monthly statements generated
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => { setActiveTab('access'); }} 
                      className="w-full text-center py-2.5 text-[10px] text-white hover:text-white transition-colors border border-white/10 hover:border-white/20 rounded-xl font-bold uppercase tracking-widest select-none cursor-pointer"
                    >
                      View Full Audit Log
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: DB Clusters + Traffic + Quick Config */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
                
                {/* DB Node Clusters */}
                <div className={`${theme.cardBg} border rounded-2xl p-7 shadow-lg flex flex-col justify-between h-[230px]`}>
                  <div>
                    <div className="flex justify-between items-center select-none mb-4">
                      <h4 className="font-serif text-sm text-white font-bold tracking-wide">DB Node Clusters</h4>
                      <span className="px-2 py-0.5 text-[8.5px] rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider select-none leading-none">
                        Healthy
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Cluster 1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white">US-East-1</span>
                          <span className="text-[#A69984]/65">Operational</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className=" w-full"></div>
                        </div>
                      </div>

                      {/* Cluster 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white">EU-West-2</span>
                          <span className="text-[#A69984]/65">Operational</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className=" w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Gateway Traffic */}
                <div className={`${theme.cardBg} border rounded-2xl p-7 shadow-lg flex flex-col justify-between h-[230px]`}>
                  <div>
                    <div className="flex justify-between items-center select-none mb-4">
                      <h4 className="font-serif text-sm text-white font-bold tracking-wide">API Gateway Traffic</h4>
                      <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                        82K Req/S
                      </span>
                    </div>

                    {/* Bar visualizer mockup */}
                    <div className="h-[75px] flex items-end justify-between gap-1 select-none px-2 mt-4">
                      <div className="w-full bg-white/5 h-[30%] rounded-sm"></div>
                      <div className="w-full bg-white/5 h-[45%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[75%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[95%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[85%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[92%] rounded-sm"></div>
                      <div className="w-full bg-white/5 h-[50%] rounded-sm"></div>
                      <div className="w-full bg-white/5 h-[35%] rounded-sm"></div>
                    </div>
                  </div>

                  <div className="text-center text-[9px] text-[#A69984]/40 font-bold uppercase tracking-widest select-none">
                    Real-time throughput analytics (24h window)
                  </div>
                </div>

                {/* Quick Config */}
                <div className={`${theme.cardBg} border rounded-2xl p-7 shadow-lg flex flex-col justify-between h-[230px]`}>
                  <div>
                    <div className="flex justify-between items-center select-none mb-4">
                      <h4 className="font-serif text-sm text-white font-bold tracking-wide">Quick Config</h4>
                      <span className="material-symbols-outlined text-[#A69984]/50 text-sm">bolt</span>
                    </div>

                    {/* 2x2 grid controls */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold tracking-wider uppercase select-none">
                      <button type="button" 
                        onClick={() => triggerToast('Successfully flushed redis & proxy caches.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Flush Cache
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Triggered global SSH key rotations.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Rotate Keys
                      </button>
                      <button type="button" 
                        onClick={() => setShowTerminalModal(true)}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Remote CMD
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Initiated global system logs export sequence.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Export Logs
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Right Floating Action Button */}
              <div className="fixed bottom-8 right-8 z-30 select-none">
                <button type="button" 
                  onClick={() => setShowAddTenantModal(true)}
                  className="w-12 h-12 rounded-full bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] flex items-center justify-center shadow-2xl transition-all active:scale-95 cursor-pointer animate-bounce"
                >
                  <span className="material-symbols-outlined font-black text-xl">add</span>
                </button>
              </div>

            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-6 animate-fade-in duration-300">

              {/* ── Page Header ─────────────────────────────────────────────── */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">Tenant Management</h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 font-semibold mt-2">Monitor, manage and bulk-operate all enterprise tenants across global regions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleExportTenants()}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                    <span className="material-symbols-outlined text-sm font-bold">download</span>Export
                  </button>
                  <button type="button" onClick={() => setShowAddTenantModal(true)}
                    className={`px-5 py-2.5 ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}>
                    <span className="material-symbols-outlined text-sm font-bold">add_business</span>Onboard Tenant
                  </button>
                </div>
              </div>

              {/* ── KPI Summary Cards (4 Dynamic Live Cards) ─────────────────── */}
              {isLoadingOverview ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`${theme.cardBg} border rounded-2xl p-6 h-[135px] animate-pulse flex flex-col justify-between shadow-lg`}>
                      <div className="h-3 w-28 bg-white/10 rounded"></div>
                      <div className="h-9 w-16 bg-white/15 rounded"></div>
                      <div className="h-2 w-32 bg-white/5 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
                  
                  {/* Card 1: Total Tenants */}
                  <div 
                    onClick={() => { 
                      setStatusFilter('All'); 
                      setAttentionOnlyFilter(false); 
                    }}
                    className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-amber-400/30 ${
                      statusFilter === 'All' && !attentionOnlyFilter ? 'border-[#ffc53d]/50 shadow-[0_0_25px_rgba(255,197,61,0.08)] bg-white/[0.01]' : ''
                    }`}
                  >
                    <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                      <span className="material-symbols-outlined text-[90px] leading-none">corporate_fare</span>
                    </div>
                    <div className="flex justify-between items-start z-10">
                      <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Total Tenants</span>
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg font-bold">storefront</span>
                    </div>
                    <div className="z-10 flex flex-col">
                      <h3 className="font-serif text-4xl font-bold text-white tracking-wide">
                        {tenants.length}
                      </h3>
                      <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-1">
                        <span className="text-emerald-400 font-bold">{activeTenantCount} Active</span> · {tenants.length - activeTenantCount} Suspended
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Regions Deployed (Calculated Dynamically!) */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                    <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                      <span className="material-symbols-outlined text-[90px] leading-none">public</span>
                    </div>
                    <div className="flex justify-between items-start z-10">
                      <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Regions Deployed</span>
                      <span className="material-symbols-outlined text-sky-400 text-lg font-bold">public</span>
                    </div>
                    <div className="z-10 flex flex-col">
                      <h3 className="font-serif text-4xl font-bold text-white tracking-wide">
                        {dynamicRegions.length}
                      </h3>
                      <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-1 uppercase tracking-wider truncate max-w-[200px]" title={dynamicRegions.join(', ')}>
                        {dynamicRegions.length > 0 ? dynamicRegions.join(', ') : 'Global Zones'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Attention Required */}
                  <div 
                    onClick={() => { 
                      setAttentionOnlyFilter(!attentionOnlyFilter); 
                      setStatusFilter('All'); 
                    }}
                    className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-rose-500/30 ${
                      attentionOnlyFilter ? 'border-rose-500/50 shadow-[0_0_25px_rgba(239,68,68,0.08)] bg-white/[0.01]' : ''
                    }`}
                  >
                    <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                      <span className="material-symbols-outlined text-[90px] leading-none">warning</span>
                    </div>
                    <div className="flex justify-between items-start z-10">
                      <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Attention Required</span>
                      <span className="material-symbols-outlined text-rose-500 text-lg font-bold">error</span>
                    </div>
                    <div className="z-10 flex flex-col">
                      <h3 className="font-serif text-4xl font-bold text-rose-500 tracking-wide">
                        {attentionRequiredCount}
                      </h3>
                      <p className="text-[10.5px] text-rose-400/70 font-semibold mt-1 uppercase tracking-wider">
                        {attentionOnlyFilter ? 'Filtering Active Issues' : 'Suspended / Expired / Billing'}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Expiring Soon */}
                  <div 
                    onClick={() => {
                      setAttentionOnlyFilter(false);
                      setStatusFilter('All');
                    }}
                    className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-amber-500/30`}
                  >
                    <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                      <span className="material-symbols-outlined text-[90px] leading-none">hourglass_bottom</span>
                    </div>
                    <div className="flex justify-between items-start z-10">
                      <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Expiring Soon (30d)</span>
                      <span className="material-symbols-outlined text-amber-400 text-lg font-bold">pending_actions</span>
                    </div>
                    <div className="z-10 flex flex-col">
                      <h3 className="font-serif text-4xl font-bold text-amber-400 tracking-wide">
                        {expiringSoonCount}
                      </h3>
                      <p className="text-[10.5px] text-amber-400/70 font-semibold mt-1 uppercase tracking-wider">
                        Renewal Warning Window
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Filters & Search Row */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 font-sans text-xs">
                {/* Search Box */}
                <div className="relative flex-grow max-w-md">
                  <span className={`material-symbols-outlined absolute left-4 top-3 text-[#A69984]/50 text-sm`}>search</span>
                  <input
                    type="text"
                    placeholder="Search establishment name, ID, or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-black/20 border ${theme.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select aria-label="Status filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors text-xs">
                      <option value="All">Status: All</option>
                      <option value="Active">Status: Active</option>
                      <option value="Suspended">Status: Suspended</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Tier Dropdown */}
                  <div className="relative">
                    <select aria-label="Tier filter" value={tierFilter} onChange={(e) => { setTierFilter(e.target.value as any); setCurrentPage(1); }}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors text-xs">
                      <option value="All">Plan: All</option>
                      <option value="Business">Plan: Business</option>
                      <option value="Growth">Plan: Growth</option>
                      <option value="Starter">Plan: Starter</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative">
                    <select aria-label="Region filter" value={regionFilter} onChange={(e) => { setRegionFilter(e.target.value as any); setCurrentPage(1); }}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors text-xs">
                      <option value="All">Region: All</option>
                      <option value="North America - East">NA - East</option>
                      <option value="Europe - West">EU - West</option>
                      <option value="Asia Pacific">Asia Pacific</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Attention Only Toggle */}
                  <button type="button" onClick={() => { setAttentionOnlyFilter(!attentionOnlyFilter); setCurrentPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${attentionOnlyFilter ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-[#A69984] hover:border-white/20'}`}>
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Issues Only
                  </button>

                  {/* Clear filters */}
                  {(statusFilter !== 'All' || tierFilter !== 'All' || regionFilter !== 'All' || attentionOnlyFilter || searchQuery) && (
                    <button type="button" onClick={() => { setStatusFilter('All'); setTierFilter('All'); setRegionFilter('All'); setAttentionOnlyFilter(false); setSearchQuery(''); setCurrentPage(1); }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs text-[#A69984]/60 hover:text-white border border-white/5 hover:border-white/15 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* ── Bulk Action Toolbar (visible when items selected) ─────── */}
              {someSelected && (
                <div className="flex items-center gap-3 px-5 py-3 bg-[#ffc53d]/5 border border-[#ffc53d]/20 rounded-2xl font-sans animate-fade-in">
                  <div className="flex items-center gap-2 mr-1">
                    <div className="w-6 h-6 rounded-md bg-[#ffc53d] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#1a1200] text-sm font-black">checklist</span>
                    </div>
                    <span className="text-[#ffc53d] font-bold text-sm">{selectedIds.size} selected</span>
                    <button type="button" onClick={clearSelection} className="text-[#A69984]/50 hover:text-white ml-1 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  <div className="h-4 w-px bg-white/10" />

                  <div className="flex items-center gap-2 flex-wrap">
                    <button type="button" onClick={bulkActivate}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">check_circle</span>Activate
                    </button>
                    <button type="button" onClick={bulkSuspend}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">block</span>Suspend
                    </button>
                    <button type="button" onClick={bulkExtend30}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] font-bold text-xs rounded-lg transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">event_repeat</span>+30 Days
                    </button>
                    <button type="button" onClick={bulkExtend365}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] font-bold text-xs rounded-lg transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">calendar_add_on</span>+1 Year
                    </button>
                    <button type="button" onClick={() => setShowBulkExpiryModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-lg transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">edit_calendar</span>Set Expiry
                    </button>
                    <button type="button" onClick={bulkDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-700/30 text-rose-500 font-bold text-xs rounded-lg transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-sm">delete_forever</span>Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Authentication / Sync Error Banner */}
              {overviewError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between font-sans animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <span className="material-symbols-outlined text-lg font-bold">shield_lock</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs uppercase tracking-wider">Super Admin Authentication Alert</div>
                      <div className="text-rose-300 text-xs font-medium mt-0.5">{overviewError}</div>
                    </div>
                  </div>
                  <a href="/login" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0">
                    Sign In Again
                  </a>
                </div>
              )}

              {/* ── Main Table Card ────────────────────────────────────────── */}
              <div className={`${theme.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {/* Select-all checkbox */}
                        <th className="py-3.5 pl-5 pr-2 w-10">
                          <button type="button" onClick={toggleAll}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${allPageSelected ? 'bg-[#ffc53d] border-[#ffc53d]' : 'border-white/25 hover:border-white/50 bg-transparent'}`}>
                            {allPageSelected && <span className="material-symbols-outlined text-[10px] text-[#1a1200] font-black">check</span>}
                          </button>
                        </th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap text-center w-12">S.N.</th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap">Establishment</th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap">Email</th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap">Plan</th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap">Region</th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap">Expiry</th>
                        <th className="py-3.5 px-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-3 pr-5 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {isLoadingOverview ? (
                        <tr>
                          <td colSpan={9} className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-xs text-[#A69984]/60 font-bold uppercase tracking-wider">Verifying Super Admin Credentials & Loading Tenants...</p>
                            </div>
                          </td>
                        </tr>
                      ) : pagedTenants.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-16 text-center">
                            <span className="material-symbols-outlined text-4xl text-white/10 block mb-2">search_off</span>
                            <p className="text-xs text-[#A69984]/40 font-bold uppercase tracking-wider">No tenants match your filters</p>
                          </td>
                        </tr>
                      ) : null}
                      {pagedTenants.map((ten: any, idx: number) => {
                        const snNumber = (currentPage - 1) * PAGE_SIZE + idx + 1;
                        const isSelected = selectedIds.has(ten.id);
                        const expStatus = checkExpiryStatus(ten.expiryDate);
                        const countdownText = getExpiryCountdownText(ten.expiryDate);
                        const initials = getInitials(ten.name);
                        const avatarCls = getAvatarColor(ten.name);
                        return (
                          <tr key={ten.id}
                            className={`group transition-colors ${isSelected ? 'bg-[#ffc53d]/[0.04] border-l-2 border-l-[#ffc53d]/50' : 'hover:bg-white/[0.015]'}`}>

                            {/* Checkbox */}
                            <td className="pl-5 pr-2 py-4">
                              <button type="button" onClick={() => toggleOne(ten.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${isSelected ? 'bg-[#ffc53d] border-[#ffc53d]' : 'border-white/20 hover:border-white/50 bg-transparent'}`}>
                                {isSelected && <span className="material-symbols-outlined text-[10px] text-[#1a1200] font-black">check</span>}
                              </button>
                            </td>

                            {/* S.N. Column */}
                            <td className="py-4 px-3 text-center text-[11.5px] text-[#A69984]/75 font-mono font-bold whitespace-nowrap">
                              {snNumber}
                            </td>

                            {/* Establishment */}
                            <td className="py-4 px-3">
                              <div className="flex items-center gap-3">
                                {/* Initials Avatar */}
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 font-bold text-xs select-none ${ten.billingFailed ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : avatarCls}`}>
                                  {ten.billingFailed
                                    ? <span className="material-symbols-outlined text-sm">warning</span>
                                    : initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-serif font-bold text-white text-[13.5px] tracking-wide leading-tight truncate max-w-[180px]">{ten.name}</div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[9.5px] text-[#A69984]/45 font-mono">{ten.id}</span>
                                    {ten.billingFailed && (
                                      <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider bg-rose-500/10 px-1.5 py-0.5 rounded">Billing Failed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Email Column */}
                            <td className="py-4 px-3 max-w-[180px]">
                              {ten.email ? (
                                <a
                                  href={`mailto:${ten.email}`}
                                  title={ten.email}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-[#A69984] hover:text-[#ffc53d] font-medium font-mono truncate block transition-colors underline-offset-2 hover:underline"
                                >
                                  {ten.email}
                                </a>
                              ) : (
                                <span className="text-xs text-white/30 font-mono italic">N/A</span>
                              )}
                            </td>

                            {/* Plan Badge */}
                            <td className="py-4 px-3">
                              {ten.plan === 'BUSINESS' || ten.tier === 'Business' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-[#ffc53d]/35 bg-[#ffc53d]/8 text-[#ffc53d] font-bold whitespace-nowrap">
                                  <span className="material-symbols-outlined text-[11px]">star</span>Business
                                </span>
                              ) : ten.plan === 'ENTERPRISE' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-violet-500/35 bg-violet-500/8 text-violet-400 font-bold whitespace-nowrap">
                                  <span className="material-symbols-outlined text-[11px]">diamond</span>Enterprise
                                </span>
                              ) : ten.plan === 'GROWTH' || ten.tier === 'Growth' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-sky-500/35 bg-sky-500/8 text-sky-400 font-bold whitespace-nowrap">
                                  <span className="material-symbols-outlined text-[11px]">trending_up</span>Growth
                                </span>
                              ) : ten.plan === 'TRIAL' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-emerald-500/35 bg-emerald-500/8 text-emerald-400 font-bold whitespace-nowrap">
                                  <span className="material-symbols-outlined text-[11px]">science</span>Trial
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 text-[9.5px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-bold whitespace-nowrap">
                                  Starter
                                </span>
                              )}
                            </td>

                            {/* Region */}
                            <td className="py-4 px-3">
                              <span className="text-[11.5px] text-[#e5e2e1]/75 font-medium whitespace-nowrap">{ten.location || ten.region || 'N/A'}</span>
                            </td>

                            {/* Expiry */}
                            <td className="py-4 px-3">
                              {expStatus === 'expired' ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] rounded border border-rose-500/40 bg-rose-500/8 text-rose-400 font-bold font-mono w-fit">
                                    <span className="material-symbols-outlined text-[10px] leading-none">error</span>{ten.expiryDate}
                                  </span>
                                  <span className="text-[9.5px] text-rose-400/50 font-semibold pl-0.5">{countdownText}</span>
                                </div>
                              ) : expStatus === 'warning' ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] rounded border border-amber-500/40 bg-amber-500/8 text-amber-400 font-bold font-mono w-fit">
                                    <span className="material-symbols-outlined text-[10px] leading-none">warning</span>{ten.expiryDate}
                                  </span>
                                  <span className="text-[9.5px] text-amber-400/50 font-semibold pl-0.5">{countdownText}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[11px] text-[#e5e2e1]/80 font-mono">{ten.expiryDate || '—'}</span>
                                  <span className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">{countdownText}</span>
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-3">
                              {ten.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Active
                                </span>
                              ) : ten.status === 'SUSPENDED' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] rounded-lg bg-white/5 border border-white/10 text-[#A69984] font-bold whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#A69984]"></span>{ten.status}
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-3 pr-5 text-right relative">
                              <div className="flex items-center justify-end gap-2">
                                <button type="button"
                                  onClick={() => handleOpenDetails(ten)}
                                  className="text-[9.5px] border border-white/10 hover:border-[#ffc53d]/40 hover:text-[#ffc53d] text-[#A69984] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap">
                                  Details
                                </button>

                                <div className="relative">
                                  <button type="button"
                                    aria-label="Open business actions menu"
                                    onClick={(e) => { e.stopPropagation(); setActiveActionMenuId(activeActionMenuId === ten.id ? null : ten.id); }}
                                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white transition-all cursor-pointer select-none">
                                    <span className="material-symbols-outlined text-base">more_vert</span>
                                  </button>

                                  {activeActionMenuId === ten.id && (
                                    <>
                                      {/* Click-away backdrop */}
                                      <div 
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={(e) => { e.stopPropagation(); setActiveActionMenuId(null); }}
                                      />
                                      <div 
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Escape') setActiveActionMenuId(null); }}
                                        className={`absolute right-0 w-52 max-w-[calc(100vw-2.5rem)] bg-[#141311] border border-white/15 rounded-xl shadow-2xl shadow-black/80 py-1.5 z-[70] text-left font-sans animate-fade-in select-none ${
                                          idx >= pagedTenants.length - 3 && pagedTenants.length > 3
                                            ? 'bottom-full mb-2 origin-bottom-right' 
                                            : 'top-full mt-2 origin-top-right'
                                        }`}
                                      >
                                        {/* General info */}
                                        <button type="button" onClick={() => { handleOpenDetails(ten); setActiveActionMenuId(null); }}
                                          className="w-full px-3.5 py-2 hover:bg-white/5 text-xs text-white font-medium flex items-center gap-2.5 cursor-pointer border-b border-white/5">
                                          <span className="material-symbols-outlined text-sm text-[#ffc53d]">info</span>View Full Details
                                        </button>

                                        {/* Expiry group */}
                                        <div className="px-3.5 pt-2 pb-0.5 text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider">Subscription & Expiry</div>
                                        <button type="button" onClick={() => { handleQuickRenew(ten.id, 30); setActiveActionMenuId(null); }}
                                          className="w-full px-3.5 py-2 hover:bg-white/5 text-xs text-white/80 hover:text-white font-medium flex items-center gap-2.5 cursor-pointer">
                                          <span className="material-symbols-outlined text-sm text-[#A69984]">event_repeat</span>Extend +30 Days
                                        </button>
                                        <button type="button" onClick={() => { handleQuickRenew(ten.id, 365); setActiveActionMenuId(null); }}
                                          className="w-full px-3.5 py-2 hover:bg-white/5 text-xs text-white/80 hover:text-white font-medium flex items-center gap-2.5 cursor-pointer">
                                          <span className="material-symbols-outlined text-sm text-[#A69984]">calendar_add_on</span>Extend +1 Year
                                        </button>
                                        <button type="button" onClick={() => { setSelectedTenant(ten); setEditingExpiryDate(ten.expiryDate || new Date().toISOString().split('T')[0]); setShowTenantDetailsModal(true); setActiveActionMenuId(null); }}
                                          className="w-full px-3.5 py-2 hover:bg-amber-500/5 text-xs text-amber-400 font-medium flex items-center gap-2.5 cursor-pointer">
                                          <span className="material-symbols-outlined text-sm">edit_calendar</span>Custom Expiry Date...
                                        </button>

                                        {/* Status group */}
                                        <div className="border-t border-white/5 mt-1 pt-1.5 px-3.5 pb-0.5 text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider">Tenant Access</div>
                                        <button type="button" onClick={() => { toggleTenantStatus(ten.id, ten.name, ten.status); setActiveActionMenuId(null); }}
                                          className={`w-full px-3.5 py-2 hover:bg-white/5 text-xs font-medium flex items-center gap-2.5 cursor-pointer ${ten.status === 'ACTIVE' ? 'text-rose-400 hover:bg-rose-500/5' : 'text-emerald-400 hover:bg-emerald-500/5'}`}>
                                          <span className="material-symbols-outlined text-sm">{ten.status === 'ACTIVE' ? 'block' : 'check_circle'}</span>
                                          {ten.status === 'ACTIVE' ? 'Suspend Business' : 'Activate Business'}
                                        </button>

                                        {/* Billing */}
                                        {ten.billingFailed && (
                                          <>
                                            <div className="border-t border-white/5 mt-1 pt-1.5 px-3.5 pb-0.5 text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider">Billing</div>
                                            <button type="button" onClick={() => { handleRetryBilling(ten.id); setActiveActionMenuId(null); }}
                                              className="w-full px-3.5 py-2 hover:bg-[#ffc53d]/5 text-xs text-[#ffc53d] font-medium flex items-center gap-2.5 cursor-pointer">
                                              <span className="material-symbols-outlined text-sm">credit_card</span>Retry Card Billing
                                            </button>
                                          </>
                                        )}

                                        {/* Danger */}
                                        <div className="border-t border-white/5 mt-1 pt-1">
                                          <button type="button" onClick={() => { handleDeleteTenant(ten.id, ten.name); setActiveActionMenuId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs text-rose-400 font-medium flex items-center gap-2.5 cursor-pointer">
                                            <span className="material-symbols-outlined text-sm">delete</span>Delete Permanently
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination ────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-5 py-4 border-t border-white/5 font-sans">
                  <div className="text-xs text-[#A69984]/50 font-bold">
                    Showing <span className="text-white/70">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredTenants.length)}</span>
                    {' '}–{' '}
                    <span className="text-white/70">{Math.min(currentPage * PAGE_SIZE, filteredTenants.length)}</span>
                    {' '}of{' '}
                    <span className="text-white/70">{filteredTenants.length}</span> tenants
                    {someSelected && <span className="text-[#ffc53d] ml-2">· {selectedIds.size} selected</span>}
                  </div>
                  <div className="flex items-center gap-1 select-none">
                    <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-[#A69984]/30 text-xs">…</span>}
                        <button type="button" onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${p === currentPage ? 'bg-[#ffc53d] text-[#1a1200]' : 'hover:bg-white/5 text-[#A69984] hover:text-white'}`}>
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                    <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Global Console Settings
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Manage system RBAC defaults, toggle active platform feature flags, and view secure audit trails.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
                {/* Feature gates & policies (Span 8) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Feature Flags Card */}
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                      <span className="material-symbols-outlined text-[#ffc53d]">toggle_on</span>
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Global SaaS Feature Toggles</h3>
                    </div>

                    <div className="space-y-4">
                      {/* AI Concierge Toggle */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">AI Sommelier & Concierge Engine</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Enable or disable client-side chat widgets and AI recommended dining suggestions across all tenant checkouts.</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setGlobalFeatures((prev: any) => ({ ...prev, aiConcierge: !prev.aiConcierge }));
                            triggerToast(`AI Concierge feature status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.aiConcierge ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.aiConcierge ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* LLM Model Configuration (Visible when AI Concierge is enabled) */}
                      {globalFeatures.aiConcierge && (
                        <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-4 ml-4 relative">
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#ffc53d]/50 rounded-l-xl"></div>
                          
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">LLM Provider & Model</label>
                            <select
                              value={globalFeatures.llmModel}
                              onChange={(e) => {
                                setGlobalFeatures((prev: any) => ({ ...prev, llmModel: e.target.value }));
                                triggerToast('LLM model provider updated.', 'success');
                              }}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            >
                              <option value="gpt-4o">OpenAI GPT-4o (Recommended)</option>
                              <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                              <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
                              <option value="claude-3-sonnet">Anthropic Claude 3.5 Sonnet</option>
                              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">API Key</label>
                            <input
                              type="password"
                              placeholder="sk-..."
                              value={globalFeatures.llmApiKey}
                              onChange={(e) => setGlobalFeatures((prev: any) => ({ ...prev, llmApiKey: e.target.value }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 transition-colors"
                            />
                            <p className="text-[9.5px] text-[#A69984]/50 mt-1.5">Your API key is stored securely and used to process Concierge requests.</p>
                          </div>
                        </div>
                      )}

                      {/* Guest Self-Checkout Toggle */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">Guest Self-Checkout Terminal Authorization</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Allow guests to check out directly from their mobile device digital receipts without cashier station interactions.</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setGlobalFeatures((prev: any) => ({ ...prev, selfCheckout: !prev.selfCheckout }));
                            triggerToast(`Self-Checkout feature status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.selfCheckout ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.selfCheckout ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Offline Mode Sync */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">Offline Mode Node Synchronizations</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Enable local database replication when network is disconnected. (Beta)</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setGlobalFeatures((prev: any) => ({ ...prev, offlineMode: !prev.offlineMode }));
                            triggerToast(`Offline Mode status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.offlineMode ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.offlineMode ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backup Policy Card */}
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                      <span className="material-symbols-outlined text-[#ffc53d]">backup</span>
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Automated Backup Policies</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Backup Interval</label>
                        <select
                          aria-label="Backup interval"
                          value={globalFeatures.backupInterval}
                          onChange={(e) => {
                            setGlobalFeatures((prev: any) => ({ ...prev, backupInterval: e.target.value }));
                            triggerToast(`Backup policy interval updated to: ${e.target.value}`, 'success');
                          }}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        >
                          <option value="hourly">Hourly Snapshots</option>
                          <option value="daily">Daily Cron Job (Recommended)</option>
                          <option value="weekly">Weekly Rollups</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Max Snapshot Retention</label>
                        <select
                          aria-label="Backup retention"
                          value={globalFeatures.backupRetention}
                          onChange={(e) => {
                            setGlobalFeatures((prev: any) => ({ ...prev, backupRetention: parseInt(e.target.value) }));
                            triggerToast(`Backup retention updated to last ${e.target.value} logs.`, 'success');
                          }}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        >
                          <option value={5}>Keep 5 latest snapshots</option>
                          <option value={10}>Keep 10 latest snapshots</option>
                          <option value={20}>Keep 20 latest snapshots</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-4">
                      <button type="button" 
                        onClick={() => triggerToast('Generating encrypted SQL schema & seed snapshot...', 'info')}
                        className="px-4 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download SQL Snapshot
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Initiating platform restore sequence from latest snapshot...', 'info')}
                        className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-[#A69984] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                        Restore Latest Backup
                      </button>
                    </div>
                  </div>

                </div>

                {/* Audit trail / logs list on the right (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 min-h-[400px]`}>
                    <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Audit Trail</h3>
                      <button type="button" 
                        onClick={() => { setAuditLogs([]); triggerToast('Logs cleared.', 'info'); }}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-4 text-xs select-text overflow-y-auto max-h-[380px] pr-1">
                      {filteredLogs.map((log: any) => (
                        <div key={log.id} className="border-b border-white/5 pb-3 last:border-none">
                          <div className="flex gap-2 items-start">
                            <span className={`material-symbols-outlined text-sm mt-0.5 ${
                              log.type === 'security' ? 'text-amber-400' :
                              log.type === 'warning' ? 'text-rose-400' :
                              log.type === 'success' ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                              {log.type === 'security' ? 'security' : log.type === 'warning' ? 'priority_high' : log.type === 'success' ? 'check_circle' : 'info'}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight">{log.action}</div>
                              <div className="text-[9.5px] text-[#A69984]/65 mt-1 font-semibold">
                                {log.actor} • <span className="italic">{log.tenant}</span>
                              </div>
                              <span className="text-[8px] text-[#A69984]/40 font-bold block mt-1 uppercase tracking-wider">{log.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredLogs.length === 0 && (
                        <div className="text-center py-20 text-[#A69984]/30">
                          Audit logs clear.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

      {/* RICH REAL-TIME TENANT DETAILS MODAL */}
      {showRichDetailsModal && richDetailsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
          <div className="bg-[#141413] border border-white/10 w-full max-w-[740px] rounded-2xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#1b1a18] px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/30 flex items-center justify-center text-[#ffc53d] shrink-0 font-serif font-bold text-sm">
                  {richDetailsData.name ? richDetailsData.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">{richDetailsData.name}</h3>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      richDetailsData.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {richDetailsData.status}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#A69984]/65 font-mono mt-0.5">ID: {richDetailsData.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRichDetailsModal(false)}
                className="text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingRichDetails ? (
                <div className="py-16 text-center space-y-3">
                  <span className="material-symbols-outlined text-3xl text-[#ffc53d] animate-spin">progress_activity</span>
                  <p className="text-xs text-[#A69984]/70 font-bold uppercase tracking-wider">
                    Fetching Real Database Metrics & User Roster from Supabase...
                  </p>
                </div>
              ) : (
                <>
                  {richDetailsError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
                      ⚠️ Notice: {richDetailsError} (Showing cached overview data)
                    </div>
                  )}

                  {/* Top Cards: Contact & Subscription */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business & Owner Info */}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">Business & Contact</span>
                        <span className="material-symbols-outlined text-sm text-[#A69984]">storefront</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#A69984]/60">Owner Name:</span>
                          <span className="text-white font-bold">{richDetailsData.ownerName || 'Restaurant Owner'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#A69984]/60">Contact Email:</span>
                          {richDetailsData.email ? (
                            <a href={`mailto:${richDetailsData.email}`} className="text-[#ffc53d] font-mono hover:underline truncate max-w-[170px]">
                              {richDetailsData.email}
                            </a>
                          ) : (
                            <span className="text-white/40 font-mono italic">N/A</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#A69984]/60">Country / Region:</span>
                          <span className="text-white font-medium">{richDetailsData.country || 'Global'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#A69984]/60">Currency / Timezone:</span>
                          <span className="text-white font-mono">{richDetailsData.currency || 'USD'} ({richDetailsData.timezone || 'UTC'})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#A69984]/60">Registered Date:</span>
                          <span className="text-white/80 font-mono text-[11px]">{richDetailsData.createdAt || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Plan & Subscription Expiry */}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] text-[#A69984]/70 font-bold uppercase tracking-wider">Plan & Subscription</span>
                        <span className="material-symbols-outlined text-sm text-[#ffc53d]">verified</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#A69984]/60">Active Plan:</span>
                          <span className="px-2 py-0.5 rounded bg-[#ffc53d]/10 border border-[#ffc53d]/25 text-[#ffc53d] font-bold uppercase text-[10px]">
                            {richDetailsData.plan || 'BUSINESS'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#A69984]/60">Expiry Date:</span>
                          <span className="text-white font-mono font-bold">{richDetailsData.expiryDate || richDetailsData.trialEndsAt || 'No Expiry'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#A69984]/60">Status Tag:</span>
                          <span className="text-amber-400 font-bold text-[10.5px]">
                            {getExpiryCountdownText ? getExpiryCountdownText(richDetailsData.expiryDate || richDetailsData.trialEndsAt) : 'Active'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleQuickRenew(richDetailsData.id, 30);
                              setShowRichDetailsModal(false);
                            }}
                            className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[10px] uppercase rounded-lg transition-all"
                          >
                            + 30 Days
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleQuickRenew(richDetailsData.id, 365);
                              setShowRichDetailsModal(false);
                            }}
                            className="flex-1 py-1.5 bg-[#ffc53d]/10 hover:bg-[#ffc53d]/20 border border-[#ffc53d]/30 text-[#ffc53d] font-bold text-[10px] uppercase rounded-lg transition-all"
                          >
                            + 1 Year
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Operational Metrics (6 cards) */}
                  <div>
                    <h4 className="text-[10.5px] text-[#A69984]/70 font-bold uppercase tracking-wider mb-2.5">
                      Real-Time Operational Metrics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-center">
                        <span className="material-symbols-outlined text-lg text-sky-400 block mb-0.5">group</span>
                        <span className="font-serif text-lg font-bold text-white block">{richDetailsData.metrics?.totalUsers ?? 0}</span>
                        <span className="text-[9px] text-[#A69984]/50 font-bold uppercase">Users</span>
                      </div>
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-center">
                        <span className="material-symbols-outlined text-lg text-amber-400 block mb-0.5">category</span>
                        <span className="font-serif text-lg font-bold text-white block">{richDetailsData.metrics?.totalCategories ?? 0}</span>
                        <span className="text-[9px] text-[#A69984]/50 font-bold uppercase">Categories</span>
                      </div>
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-center">
                        <span className="material-symbols-outlined text-lg text-emerald-400 block mb-0.5">restaurant_menu</span>
                        <span className="font-serif text-lg font-bold text-white block">{richDetailsData.metrics?.totalMenuItems ?? 0}</span>
                        <span className="text-[9px] text-[#A69984]/50 font-bold uppercase">Menu Items</span>
                      </div>
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-center">
                        <span className="material-symbols-outlined text-lg text-purple-400 block mb-0.5">receipt_long</span>
                        <span className="font-serif text-lg font-bold text-white block">{richDetailsData.metrics?.totalOrders ?? 0}</span>
                        <span className="text-[9px] text-[#A69984]/50 font-bold uppercase">Orders</span>
                      </div>
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-center">
                        <span className="material-symbols-outlined text-lg text-indigo-400 block mb-0.5">table_restaurant</span>
                        <span className="font-serif text-lg font-bold text-white block">{richDetailsData.metrics?.totalTables ?? 0}</span>
                        <span className="text-[9px] text-[#A69984]/50 font-bold uppercase">Tables</span>
                      </div>
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-center">
                        <span className="material-symbols-outlined text-lg text-rose-400 block mb-0.5">devices</span>
                        <span className="font-serif text-lg font-bold text-white block">{richDetailsData.metrics?.totalDevices ?? 0}</span>
                        <span className="text-[9px] text-[#A69984]/50 font-bold uppercase">Devices</span>
                      </div>
                    </div>
                  </div>

                  {/* Registered User Accounts Table */}
                  <div>
                    <h4 className="text-[10.5px] text-[#A69984]/70 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Tenant User Accounts ({richDetailsData.users?.length || 0})</span>
                    </h4>
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      {richDetailsData.users && richDetailsData.users.length > 0 ? (
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] text-[#A69984]/50 uppercase tracking-wider">
                              <th className="py-2.5 px-3">User Name</th>
                              <th className="py-2.5 px-3">Email</th>
                              <th className="py-2.5 px-3">Role</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03]">
                            {richDetailsData.users.map((u: any) => (
                              <tr key={u.id} className="hover:bg-white/[0.015]">
                                <td className="py-2.5 px-3 text-white font-medium">{u.name}</td>
                                <td className="py-2.5 px-3 text-[#A69984] font-mono text-[11px]">{u.email}</td>
                                <td className="py-2.5 px-3 text-[10px] text-amber-300 font-bold uppercase">{u.role}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                    u.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
                                  }`}>
                                    {u.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="py-8 text-center text-xs text-[#A69984]/50 font-bold uppercase tracking-wider">
                          No individual user accounts registered for this tenant yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#1b1a18] px-6 py-3 border-t border-white/5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowRichDetailsModal(false)}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTEND EXPIRY & SUBSCRIPTION MODAL */}
      {showTenantDetailsModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#141413] border border-white/10 w-full max-w-[540px] rounded-2xl shadow-2xl overflow-hidden font-sans">
            <div className="bg-[#1b1a18] px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ffc53d] text-xl">edit_calendar</span>
                <div>
                  <h3 className="font-serif text-base text-white font-bold tracking-wide">Extend Subscription Expiry</h3>
                  <p className="text-[10px] text-[#A69984]/60 font-semibold">{selectedTenant.name} ({selectedTenant.location || 'Global Workspace'})</p>
                </div>
              </div>
              <button type="button" 
                onClick={() => setShowTenantDetailsModal(false)}
                className="text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTenantExpiry} className="p-6 space-y-6">
              {/* Current Expiry Display */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] text-[#A69984]/60 uppercase font-bold tracking-wider block">Current Expiry Date</span>
                  <span className="text-white font-mono font-bold text-sm">{selectedTenant.expiryDate || 'No Expiry Set'}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[10px]">
                  {getExpiryCountdownText ? getExpiryCountdownText(selectedTenant.expiryDate) : 'Active'}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[9.5px] text-[#A69984] font-bold uppercase tracking-widest mb-2.5">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button"
                    onClick={() => {
                      handleQuickRenew(selectedTenant.id, 30);
                      setShowTenantDetailsModal(false);
                    }}
                    className="p-3 bg-white/5 hover:bg-[#ffc53d]/10 border border-white/10 hover:border-[#ffc53d]/40 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-xs group-hover:text-[#ffc53d]">+ 30 Days</span>
                      <span className="material-symbols-outlined text-sm text-[#A69984] group-hover:text-[#ffc53d]">event_repeat</span>
                    </div>
                    <span className="text-[9.5px] text-[#A69984]/60 block mt-1 font-medium">Add 30 calendar days to active plan</span>
                  </button>

                  <button type="button"
                    onClick={() => {
                      handleQuickRenew(selectedTenant.id, 365);
                      setShowTenantDetailsModal(false);
                    }}
                    className="p-3 bg-white/5 hover:bg-[#ffc53d]/10 border border-white/10 hover:border-[#ffc53d]/40 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-xs group-hover:text-[#ffc53d]">+ 1 Year</span>
                      <span className="material-symbols-outlined text-sm text-[#A69984] group-hover:text-[#ffc53d]">calendar_add_on</span>
                    </div>
                    <span className="text-[9.5px] text-[#A69984]/60 block mt-1 font-medium">Add 365 days (Full Year Renewal)</span>
                  </button>
                </div>
              </div>

              {/* Custom Date Input Picker */}
              <div>
                <label className="block text-[9.5px] text-[#A69984] font-bold uppercase tracking-widest mb-2">
                  Or Set Custom Expiry Date
                </label>
                <input
                  type="date"
                  value={editingExpiryDate}
                  onChange={(e) => setEditingExpiryDate(e.target.value)}
                  className="w-full bg-[#0e0e0d] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d] transition-colors font-mono"
                  required
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button"
                  onClick={() => setShowTenantDetailsModal(false)}
                  className="px-4 py-2.5 text-xs text-[#A69984] hover:text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-black">save</span>
                  Save Custom Expiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARD NEW TENANT MODAL */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#141311] border border-[#ffc53d]/20 rounded-2xl shadow-2xl overflow-hidden font-sans">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#1a1814]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ffc53d] text-xl">add_business</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-none">Onboard New Business Tenant</h3>
                  <p className="text-[11px] text-[#A69984]/60 mt-0.5">Register a new restaurant to the DinePOS AI platform.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTenantModal(false)}
                className="text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddTenant} className="p-6 space-y-5">

              {/* Restaurant Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984] mb-2">
                  Restaurant / Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Golden Fork Tokyo"
                  value={newTenantData?.name || ''}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#ffc53d]/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984] mb-2">
                  City / Location <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tokyo, Japan"
                  value={newTenantData?.location || ''}
                  onChange={(e) => setNewTenantData({ ...newTenantData, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#ffc53d]/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-colors"
                />
              </div>

              {/* Plan & Expiry row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984] mb-2">Subscription Plan</label>
                  <select
                    value={newTenantData?.plan || 'TRIAL'}
                    onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value as any })}
                    className="w-full bg-[#1e1c19] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffc53d]/50 transition-colors cursor-pointer"
                  >
                    <option value="TRIAL">Trial (14 days)</option>
                    <option value="STARTER">Starter</option>
                    <option value="GROWTH">Growth</option>
                    <option value="BUSINESS">Business</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984] mb-2">Custom Expiry Date</label>
                  <input
                    type="date"
                    value={newTenantData?.expiryDate || ''}
                    onChange={(e) => setNewTenantData({ ...newTenantData, expiryDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#ffc53d]/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition-colors font-mono"
                  />
                  <p className="text-[9.5px] text-[#A69984]/50 mt-1">Leave blank for plan default</p>
                </div>
              </div>

              {/* Plan badge preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="material-symbols-outlined text-[#ffc53d] text-base">info</span>
                <p className="text-[11px] text-[#A69984]/70 leading-relaxed">
                  {newTenantData?.plan === 'TRIAL'
                    ? 'Trial accounts receive 14-day access with full feature visibility.'
                    : newTenantData?.plan === 'SUSPENDED'
                    ? 'Tenant will be registered in a suspended state — no access granted.'
                    : `${newTenantData?.plan || 'STARTER'} plan — standard 12-month subscription. Custom expiry overrides this.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-[#A69984] hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#1a1200] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#ffc53d]/20 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-black">add_business</span>
                  Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
