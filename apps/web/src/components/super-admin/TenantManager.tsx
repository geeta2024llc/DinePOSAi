'use client';

import React from 'react';

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
    handleQuickRenew, handleRetryBilling, handleDeleteTenant,
    globalFeatures, setGlobalFeatures, setAuditLogs, filteredLogs
  } = props;

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
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Global Revenue (24h)</span>
                    <span className="material-symbols-outlined text-amber-400 text-lg">payments</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#ffc53d] tracking-wide">¥14,289,045</h3>
                    <p className="text-[10px] text-amber-400 font-bold mt-1">~ 12.5% vs yesterday</p>
                  </div>
                </div>

                {/* Card 2: Active Orders */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Active Orders</span>
                    <span className="material-symbols-outlined text-[#ffc53d] text-lg font-bold">restaurant</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">1,248</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Across 42 locations</p>
                  </div>
                </div>

                {/* Card 3: System Health */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">System Health</span>
                    <span className="material-symbols-outlined text-emerald-400 text-lg font-bold">check_circle</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">99.98%</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">14ms avg latency</p>
                  </div>
                </div>

                {/* Card 4: Active Staff */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Active Staff</span>
                    <span className="material-symbols-outlined text-[#ffc53d] text-lg">badge</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">3,120</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Live now globally</p>
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
                        {tenants.map(t => (
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
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Tenant Management Banner */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Tenant Management
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Monitor and manage all global enterprise tenants across regions.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => handleExportTenants()}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">download</span>
                    Export
                  </button>
                  <button type="button"
                    onClick={() => setShowAddTenantModal(true)}
                    className={`px-5 py-2.5 ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    Onboard Tenant
                  </button>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                
                {/* Card 1: Total Active Tenants */}
                <div 
                  onClick={() => { 
                    setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active'); 
                    setAttentionOnlyFilter(false); 
                  }}
                  className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/20 ${
                    statusFilter === 'Active' ? 'border-[#ffc53d]/50 shadow-[0_0_25px_rgba(255,197,61,0.08)] bg-white/[0.01]' : ''
                  }`}
                >
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">corporate_fare</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Total Active Tenants</span>
                  </div>
                  <div className="z-10 flex items-baseline gap-3">
                    <h3 className="font-serif text-5xl font-bold text-white tracking-wide">
                      {138 + tenants.filter(t => t.status === 'ACTIVE').length}
                    </h3>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5 leading-none">
                      <span className="material-symbols-outlined text-sm font-bold leading-none">arrow_upward</span>
                      12%
                    </span>
                  </div>
                </div>

                {/* Card 2: Regions Deployed */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">public</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Regions Deployed</span>
                  </div>
                  <div className="z-10">
                    <h3 className="font-serif text-5xl font-bold text-white tracking-wide">8</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1 uppercase tracking-wider">Global Zones</p>
                  </div>
                </div>

                {/* Card 3: Attention Required */}
                <div 
                  onClick={() => { 
                    setAttentionOnlyFilter(!attentionOnlyFilter); 
                    setStatusFilter('All'); 
                  }}
                  className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-rose-500/20 ${
                    attentionOnlyFilter ? 'border-rose-500/50 shadow-[0_0_25px_rgba(239,68,68,0.08)] bg-white/[0.01]' : ''
                  }`}
                >
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">warning</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Attention Required</span>
                  </div>
                  <div className="z-10">
                    <h3 className="font-serif text-5xl font-bold text-rose-500 tracking-wide">
                      {tenants.filter(t => t.status === 'SUSPENDED' || checkExpiryStatus(t.expiryDate) === 'expired' || t.billingFailed).length}
                    </h3>
                    <p className="text-[10px] text-rose-400/70 font-semibold mt-1 uppercase tracking-wider">Suspended/Issue</p>
                  </div>
                </div>

              </div>

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
                    <select
                      aria-label="Status filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Status: All</option>
                      <option value="Active">Status: Active</option>
                      <option value="Suspended">Status: Suspended</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Tier Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Tier filter"
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Tier: All</option>
                      <option value="Business">Tier: Business</option>
                      <option value="Growth">Tier: Growth</option>
                      <option value="Starter">Tier: Starter</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Region filter"
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Region: All</option>
                      <option value="North America - East">Region: NA - East</option>
                      <option value="Europe - West">Region: EU - West</option>
                      <option value="Asia Pacific">Region: Asia Pacific</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>
                </div>
              </div>

              {/* Tenants Directory List */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Establishment</th>
                        <th className="py-4 px-4">Subscription Tier</th>
                        <th className="py-4 px-4">Region</th>
                        <th className="py-4 px-4">Expiry Date</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {filteredTenants.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center flex-shrink-0 select-none">
                              {t.name === 'The Obsidian Room' ? (
                                <div className="w-6 h-6 rounded bg-[#ffa133]/10 border border-[#ffa133]/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[#ffa133] text-sm font-bold">layers</span>
                                </div>
                              ) : t.name === 'Lumière Brasserie' ? (
                                <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-emerald-400 text-sm">restaurant</span>
                                </div>
                              ) : t.billingFailed ? (
                                <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-rose-400 text-sm">warning</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-sky-400 text-sm">storefront</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-serif font-bold text-white text-[14.5px] tracking-wide leading-none">{t.name}</div>
                              <div className="text-[10px] text-[#A69984]/50 font-bold tracking-wider mt-1.5 uppercase">
                                ID: {t.id} {t.billingFailed && <span className="text-rose-400 font-semibold leading-none ml-1">(Billing Failed)</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {t.tier === 'Business' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                                <span className="material-symbols-outlined text-xs">star</span>
                                Business
                              </span>
                            ) : t.tier === 'Growth' ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold">
                                Growth
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-semibold">
                                Starter
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-[#e5e2e1]/80 text-[12px]">{t.region || 'North America - East'}</td>
                          <td className="py-4 px-4">
                            {(() => {
                              const expStatus = checkExpiryStatus(t.expiryDate);
                              const countdownText = getExpiryCountdownText(t.expiryDate);
                              if (expStatus === 'expired') {
                                return (
                                  <div className="flex flex-col gap-1 select-none">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-rose-500/35 bg-rose-500/5 text-rose-400 font-bold font-mono w-fit">
                                      <span className="material-symbols-outlined text-[12px] font-bold leading-none">error</span>
                                      {t.expiryDate}
                                    </span>
                                    <span className="text-[10.5px] text-rose-400/60 font-semibold pl-1">{countdownText}</span>
                                  </div>
                                );
                              } else if (expStatus === 'warning') {
                                return (
                                  <div className="flex flex-col gap-1 select-none animate-pulse">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-amber-500/35 bg-amber-500/5 text-amber-400 font-bold font-mono w-fit">
                                      <span className="material-symbols-outlined text-[12px] font-bold leading-none">warning</span>
                                      {t.expiryDate}
                                    </span>
                                    <span className="text-[10.5px] text-amber-400/60 font-semibold pl-1">{countdownText}</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[#e5e2e1]/85 font-mono text-[12px]">{t.expiryDate}</span>
                                    <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider select-none">{countdownText}</span>
                                  </div>
                                );
                              }
                            })()}
                          </td>
                          <td className="py-4 px-4">
                            {t.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right relative">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" 
                                onClick={() => {
                                  setSelectedTenant(t);
                                  setEditingExpiryDate(t.expiryDate);
                                  setShowTenantDetailsModal(true);
                                }}
                                className="text-[10px] border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Details
                              </button>
                              
                              <div className="relative">
                                <button type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionMenuId(activeActionMenuId === t.id ? null : t.id);
                                  }}
                                  className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">more_vert</span>
                                </button>
                                
                                {activeActionMenuId === t.id && (
                                  <div className="absolute right-0 mt-1.5 w-48 bg-[#161513] border border-white/10 rounded-xl shadow-2xl py-2 z-30 text-left font-sans animate-slide-in">
                                    <button type="button"
                                      onClick={() => toggleTenantStatus(t.id, t.name, t.status)}
                                      className="w-full px-4 py-2 hover:bg-white/5 text-xs text-white/80 hover:text-white font-semibold flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm text-[#A69984]">
                                        {t.status === 'ACTIVE' ? 'block' : 'check_circle'}
                                      </span>
                                      {t.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                                    </button>
                                    
                                    <button type="button"
                                      onClick={() => handleQuickRenew(t.id, 30)}
                                      className="w-full px-4 py-2 hover:bg-white/5 text-xs text-white/80 hover:text-white font-semibold flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm text-[#A69984]">snooze</span>
                                      Extend Expiry (+30d)
                                    </button>

                                    {t.billingFailed && (
                                      <button type="button"
                                        onClick={() => handleRetryBilling(t.id)}
                                        className="w-full px-4 py-2 hover:bg-[#ffc53d]/10 text-xs text-[#ffc53d] font-semibold flex items-center gap-2 border-t border-white/5 mt-1 pt-2 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-sm">credit_card</span>
                                        Retry Billing System
                                      </button>
                                    )}

                                    <button type="button"
                                      onClick={() => handleDeleteTenant(t.id, t.name)}
                                      className="w-full px-4 py-2 hover:bg-rose-500/10 text-xs text-rose-400 font-semibold flex items-center gap-2 border-t border-white/5 mt-1 pt-2 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                      Delete Business
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs text-[#A69984]/50 select-none">
                  <div className="font-bold">
                    Showing 1 to {filteredTenants.length} of 142
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ffc53d] text-[#2c1a00] font-bold transition-colors cursor-pointer">
                      1
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      2
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      3
                    </button>
                    <span className="px-2">...</span>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer">
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
                            setGlobalFeatures(prev => ({ ...prev, aiConcierge: !prev.aiConcierge }));
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
                                setGlobalFeatures(prev => ({ ...prev, llmModel: e.target.value }));
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
                              onChange={(e) => setGlobalFeatures(prev => ({ ...prev, llmApiKey: e.target.value }))}
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
                            setGlobalFeatures(prev => ({ ...prev, selfCheckout: !prev.selfCheckout }));
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
                            setGlobalFeatures(prev => ({ ...prev, offlineMode: !prev.offlineMode }));
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
                            setGlobalFeatures(prev => ({ ...prev, backupInterval: e.target.value }));
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
                            setGlobalFeatures(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }));
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
                      {filteredLogs.map(log => (
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

    </>
  );
}
