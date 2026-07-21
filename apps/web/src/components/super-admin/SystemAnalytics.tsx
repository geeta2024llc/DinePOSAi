'use client';

import React from 'react';

export default function SystemAnalytics(props: any) {
  const {
    t, theme, isLightTheme, activeTab, triggerToast, logsList,
    logsSearch, setLogsSearch, logsFilter, setLogsFilter, logsPage,
    setLogsPage, handleClearLogs, tenants, fleet, admins,
    tickets, setActiveTab, clearActivityLogs, getActivityLogs, setLogsList,
    filteredFleet, ambassadors
  } = props;

  const [analyticsMetricTimeframe, setAnalyticsMetricTimeframe] = React.useState('30d');

  return (
    <>
          {activeTab === 'health' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Hardware Fleet Monitor
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Real-time connectivity diagnostics for all POS registers, KDS panels, and thermal printers.
                  </p>
                </div>
                
                <button type="button"
                  onClick={() => triggerToast('Scanning for newly attached network gateways...', 'info')}
                  className={`px-5 py-3 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">network_ping</span>
                  Scan Gateways
                </button>
              </div>

              {/* Status breakdown metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex justify-between items-center shadow-md`}>
                  <div>
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Online Terminals</span>
                    <h4 className="text-2xl font-bold text-white mt-1">{fleet.filter((f: any) => f.status === 'ONLINE').length} / {fleet.length}</h4>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex justify-between items-center shadow-md`}>
                  <div>
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Device Warnings</span>
                    <h4 className="text-2xl font-bold text-amber-400 mt-1">{fleet.filter((f: any) => f.status === 'WARNING_LOW_PAPER').length} Alerts</h4>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 motion-safe:animate-pulse"></span>
                </div>
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex justify-between items-center shadow-md`}>
                  <div>
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Offline Status</span>
                    <h4 className="text-2xl font-bold text-rose-400 mt-1">{fleet.filter((f: any) => f.status === 'OFFLINE').length} Terminals</h4>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                </div>
              </div>

              {/* Fleet List Card */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                  <h3 className="font-serif text-base text-white font-bold tracking-wide">Fleet Registers</h3>
                  <span className="text-xs text-[#A69984]/50 font-semibold">{filteredFleet.length} Devices active</span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Terminal Name</th>
                        <th className="py-4 px-4">Type</th>
                        <th className="py-4 px-4">Assigned Tenant</th>
                        <th className="py-4 px-4">IP Address</th>
                        <th className="py-4 px-4">Last Ping</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-right">Diagnostic Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {filteredFleet.map((f: any) => (
                        <tr key={f.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#A69984] text-sm">
                              {f.type === 'POS' ? 'point_of_sale' : f.type === 'KDS' ? 'kitchen' : f.type === 'TABLET' ? 'tablet_mac' : 'print'}
                            </span>
                            {f.name}
                          </td>
                          <td className="py-4 px-4 text-[#A69984] text-[10px] uppercase tracking-wider font-bold">{f.type}</td>
                          <td className="py-4 px-4 text-white/75">{f.tenant}</td>
                          <td className="py-4 px-4 font-mono text-[10.5px] text-[#A69984]">{f.ip}</td>
                          <td className="py-4 px-4 text-[#A69984]/70">{f.lastSeen}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${
                              f.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' :
                              f.status === 'OFFLINE' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {f.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button type="button" 
                              onClick={() => triggerToast(`Sending remote diagnostic ping payload to ${f.name} (${f.ip})...`, 'info')}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer mr-2"
                            >
                              Ping Test
                            </button>
                            <button type="button" 
                              onClick={() => triggerToast(`Initiated remote log dump retrieval from ${f.name}`, 'success')}
                              className="text-[10px] text-[#ffe2ab] hover:text-[#ffc53d] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Fetch Logs
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

          {activeTab === 'analytics' && (() => {
            // Derived metrics from live state
            const totalTenants = tenants.length;
            const activeTenants = tenants.filter((t: any) => t.status === 'ACTIVE').length;
            const suspendedTenants = tenants.filter((t: any) => t.status === 'SUSPENDED').length;
            const trialTenants = tenants.filter((t: any) => t.plan === 'TRIAL').length;
            const churnRate = totalTenants > 0 ? ((suspendedTenants / totalTenants) * 100).toFixed(1) : '0.0';
            const trialConversion = totalTenants > 0 ? (((totalTenants - trialTenants - suspendedTenants) / totalTenants) * 100).toFixed(1) : '0.0';

            const businessTenants = tenants.filter((t: any) => t.tier === 'Business');
            const growthTenants = tenants.filter((t: any) => t.tier === 'Growth');
            const starterTenants = tenants.filter((t: any) => t.tier === 'Starter');

            const parseRevenue = (r: string) => parseFloat(r.replace(/[¥$,]/g, '')) || 0;
            const totalRevenue = tenants.reduce((sum: any, t: any) => sum + parseRevenue(t.revenue), 0);
            const businessRevenue = businessTenants.reduce((sum: any, t: any) => sum + parseRevenue(t.revenue), 0);
            const growthRevenue = growthTenants.reduce((sum: any, t: any) => sum + parseRevenue(t.revenue), 0);
            const starterRevenue = starterTenants.reduce((sum: any, t: any) => sum + parseRevenue(t.revenue), 0);

            const totalTerminals = tenants.reduce((sum: any, t: any) => sum + t.terminals, 0);
            const avgTerminalsPerTenant = totalTenants > 0 ? (totalTerminals / totalTenants).toFixed(1) : '0';

            const onlineDevices = fleet.filter((d: any) => d.status === 'ONLINE').length;
            const offlineDevices = fleet.filter((d: any) => d.status === 'OFFLINE').length;
            const warningDevices = fleet.filter((d: any) => d.status === 'WARNING_LOW_PAPER').length;
            const deviceUptime = fleet.length > 0 ? ((onlineDevices / fleet.length) * 100).toFixed(1) : '100.0';

            const posDevices = fleet.filter((d: any) => d.type === 'POS').length;
            const kdsDevices = fleet.filter((d: any) => d.type === 'KDS').length;
            const tabletDevices = fleet.filter((d: any) => d.type === 'TABLET').length;
            const printerDevices = fleet.filter((d: any) => d.type === 'PRINTER').length;

            const activeAdmins = admins.filter((a: any) => a.status === 'ACTIVE').length;
            const inactiveAdmins = admins.filter((a: any) => a.status !== 'ACTIVE').length;

            const openTickets = tickets.filter((t: any) => t.status === 'OPEN').length;
            const inProgressTickets = tickets.filter((t: any) => t.status === 'IN_PROGRESS').length;
            const resolvedTickets = tickets.filter((t: any) => t.status === 'RESOLVED').length;
            const ticketResolutionRate = tickets.length > 0 ? ((resolvedTickets / tickets.length) * 100).toFixed(0) : '0';

            const totalPendingPayouts = ambassadors.reduce((sum: number, a: any) => sum + a.pendingRewards, 0);
            const totalPaidPayouts = ambassadors.reduce((sum: number, a: any) => sum + a.paidRewards, 0);
            const totalAmbassadors = ambassadors.length;
            const totalReferredBusinesses = ambassadors.reduce((sum: number, a: any) => sum + a.invitedBusinesses.length, 0);

            const mrr = (totalRevenue / 12).toFixed(0);
            const arr = totalRevenue.toFixed(0);

            const revenueBarMax = Math.max(businessRevenue, growthRevenue, starterRevenue, 1);

            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const mockMonthlyRevenue = [310000, 375000, 420000, 398000, 455000, totalRevenue];
            const sparkMax = Math.max(...mockMonthlyRevenue);

            return (
              <div className="space-y-8 animate-fade-in duration-300">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                      Platform Analytics
                    </h1>
                    <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                      Enterprise-wide KPIs, revenue intelligence, and operational health metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
                    Live Data
                  </div>
                </div>

                {/* TOP KPI ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 font-sans">
                  {/* MRR */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Monthly Recurring Rev.</span>
                      <span className="material-symbols-outlined text-amber-400 text-lg">trending_up</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-[#ffc53d] tracking-wide">${Number(mrr).toLocaleString()}</h3>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs leading-none">arrow_upward</span>
                        +8.3% vs last month
                      </p>
                    </div>
                  </div>
                  {/* ARR */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Annual Recurring Rev.</span>
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">monetization_on</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-white tracking-wide">${Number(arr).toLocaleString()}</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-bold mt-1.5">{activeTenants} paying tenants</p>
                    </div>
                  </div>
                  {/* Tenant Growth */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Tenant Growth Rate</span>
                      <span className="material-symbols-outlined text-emerald-400 text-lg">groups</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-white tracking-wide">{totalTenants}</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-bold mt-1.5">{trialConversion}% trial → paid conversion</p>
                    </div>
                  </div>
                  {/* Device Uptime */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Fleet Uptime</span>
                      <span className="material-symbols-outlined text-emerald-400 text-lg">devices</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-emerald-400 tracking-wide">{deviceUptime}%</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-bold mt-1.5">{onlineDevices}/{fleet.length} devices online</p>
                    </div>
                  </div>
                </div>

                {/* SECOND ROW: Revenue by Tier + Revenue Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Revenue by Plan Tier */}
                  <div className={`lg:col-span-5 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Revenue by Plan Tier</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Lifetime GMV per subscription tier</p>
                      </div>
                      <span className="material-symbols-outlined text-amber-400 text-xl">leaderboard</span>
                    </div>
                    <div className="space-y-5">
                      {/* Business */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-[11px] text-white font-bold">Business</span>
                          </div>
                          <span className="text-[11px] text-[#ffc53d] font-bold">¥{businessRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full transition-all duration-700" style={{ width: `${(businessRevenue / revenueBarMax) * 100}%` }}></div>
                        </div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">{businessTenants.length} tenants · {totalTenants > 0 ? ((businessRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total revenue</div>
                      </div>
                      {/* Growth */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            <span className="text-[11px] text-white font-bold">Growth</span>
                          </div>
                          <span className="text-[11px] text-sky-400 font-bold">¥{growthRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-sky-400 h-2 rounded-full transition-all duration-700" style={{ width: `${(growthRevenue / revenueBarMax) * 100}%` }}></div>
                        </div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">{growthTenants.length} tenants · {totalTenants > 0 ? ((growthRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total revenue</div>
                      </div>
                      {/* Starter */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                            <span className="text-[11px] text-white font-bold">Starter</span>
                          </div>
                          <span className="text-[11px] text-violet-400 font-bold">¥{starterRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-violet-400 h-2 rounded-full transition-all duration-700" style={{ width: `${(starterRevenue / revenueBarMax) * 100}%` }}></div>
                        </div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">{starterTenants.length} tenants · {totalTenants > 0 ? ((starterRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total revenue</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Trend Sparkline */}
                  <div className={`lg:col-span-7 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Revenue Trend (6 Months)</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Cumulative platform revenue — all tenants</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest">Peak Month</div>
                        <div className="text-sm text-[#ffc53d] font-bold mt-0.5">Jun · ${(totalRevenue / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <div className="flex items-end gap-3 h-[100px]">
                      {mockMonthlyRevenue.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div
                            className={`w-full rounded-t-lg transition-all duration-700 ${i === mockMonthlyRevenue.length - 1 ? 'bg-amber-400' : 'bg-white/10'}`}
                            style={{ height: `${(val / sparkMax) * 100}%` }}
                          ></div>
                          <span className="text-[8.5px] text-[#A69984]/50 font-bold uppercase">{monthLabels[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest">Avg Monthly</div>
                        <div className="text-white font-bold text-sm mt-0.5">${(mockMonthlyRevenue.reduce((a: any, b: any) => a + b, 0) / 6 / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest">YTD Growth</div>
                        <div className="text-emerald-400 font-bold text-sm mt-0.5">+46.8%</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest">Terminals Online</div>
                        <div className="text-white font-bold text-sm mt-0.5">{totalTerminals} total · {avgTerminalsPerTenant} avg/tenant</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THIRD ROW: Tenant Health + Device Fleet */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Tenant Health Breakdown */}
                  <div className={`lg:col-span-6 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Tenant Health Breakdown</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Subscription status across all registered businesses</p>
                      </div>
                      <span className="material-symbols-outlined text-[#ffc53d] text-xl">corporate_fare</span>
                    </div>

                    {/* Status donut rows */}
                    <div className="space-y-4">
                      {[
                        { label: 'Active', count: activeTenants, color: 'bg-emerald-500', textColor: 'text-emerald-400', pct: totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0 },
                        { label: 'Trial', count: trialTenants, color: 'bg-amber-400', textColor: 'text-amber-400', pct: totalTenants > 0 ? (trialTenants / totalTenants) * 100 : 0 },
                        { label: 'Suspended', count: suspendedTenants, color: 'bg-rose-500', textColor: 'text-rose-400', pct: totalTenants > 0 ? (suspendedTenants / totalTenants) * 100 : 0 },
                      ].map(row => (
                        <div key={row.label}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`}></span>
                              <span className="text-[11px] text-white font-semibold">{row.label}</span>
                            </div>
                            <span className={`text-[11px] font-bold ${row.textColor}`}>{row.count} tenants</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div className={`${row.color} h-1.5 rounded-full`} style={{ width: `${row.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-1.5">Churn Rate</div>
                        <div className="text-rose-400 font-bold text-xl font-serif">{churnRate}%</div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">Monthly average</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-1.5">Trial Conversion</div>
                        <div className="text-emerald-400 font-bold text-xl font-serif">{trialConversion}%</div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">Trials → paid plan</div>
                      </div>
                    </div>
                  </div>

                  {/* Fleet Device Analytics */}
                  <div className={`lg:col-span-6 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Fleet Device Analytics</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Hardware deployment health across all locations</p>
                      </div>
                      <span className="material-symbols-outlined text-emerald-400 text-xl">devices</span>
                    </div>

                    {/* Uptime Gauge */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative w-[80px] h-[80px] flex-shrink-0">
                        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                          <circle cx="40" cy="40" r="32" fill="none" stroke="#34d399" strokeWidth="8"
                            strokeDasharray={`${(parseFloat(deviceUptime) / 100) * 201} 201`}
                            strokeLinecap="round"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-emerald-400 font-bold text-sm leading-none">{deviceUptime}%</span>
                          <span className="text-[7.5px] text-[#A69984]/50 font-bold uppercase mt-0.5">Uptime</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[
                          { label: 'Online', count: onlineDevices, color: 'bg-emerald-400' },
                          { label: 'Warning', count: warningDevices, color: 'bg-amber-400' },
                          { label: 'Offline', count: offlineDevices, color: 'bg-rose-500' },
                        ].map(row => (
                          <div key={row.label} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`}></span>
                              <span className="text-[#A69984]/70 font-semibold">{row.label}</span>
                            </div>
                            <span className="text-white font-bold">{row.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Device Type Breakdown */}
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                      <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-3">Device Type Distribution</div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {[
                          { label: 'POS', count: posDevices, icon: 'point_of_sale' },
                          { label: 'KDS', count: kdsDevices, icon: 'tv' },
                          { label: 'Tablet', count: tabletDevices, icon: 'tablet' },
                          { label: 'Printer', count: printerDevices, icon: 'print' },
                        ].map(d => (
                          <div key={d.label} className="flex flex-col items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#A69984]/60 text-base">{d.icon}</span>
                            <span className="text-white font-bold text-sm">{d.count}</span>
                            <span className="text-[9px] text-[#A69984]/45 font-bold uppercase">{d.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOURTH ROW: Admin Activity + Support Metrics + Referral Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Admin Activity */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 font-sans`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-white font-bold text-sm tracking-wide">Admin Activity</h3>
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">manage_accounts</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Total Admin Accounts</span>
                        <span className="text-white font-bold text-sm">{admins.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Active Admins</span>
                        <span className="text-emerald-400 font-bold text-sm">{activeAdmins}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Inactive / Suspended</span>
                        <span className="text-rose-400 font-bold text-sm">{inactiveAdmins}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Session Activity</span>
                        <span className="text-amber-400 font-bold text-sm">3 live sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Support Desk Metrics */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 font-sans`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-white font-bold text-sm tracking-wide">Support Desk Metrics</h3>
                      <span className="material-symbols-outlined text-sky-400 text-lg">confirmation_number</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Total Tickets</span>
                        <span className="text-white font-bold text-sm">{tickets.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Open</span>
                        <span className="text-rose-400 font-bold text-sm">{openTickets}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">In Progress</span>
                        <span className="text-amber-400 font-bold text-sm">{inProgressTickets}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Resolved</span>
                        <span className="text-emerald-400 font-bold text-sm">{resolvedTickets}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Resolution Rate</span>
                        <span className={`font-bold text-sm ${parseInt(ticketResolutionRate) >= 70 ? 'text-emerald-400' : parseInt(ticketResolutionRate) >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {tickets.length === 0 ? '—' : `${ticketResolutionRate}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Referral Program Performance */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 font-sans`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-white font-bold text-sm tracking-wide">Referral Performance</h3>
                      <span className="material-symbols-outlined text-violet-400 text-lg">loyalty</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Active Ambassadors</span>
                        <span className="text-white font-bold text-sm">{totalAmbassadors}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Businesses Referred</span>
                        <span className="text-violet-400 font-bold text-sm">{totalReferredBusinesses}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Pending Payouts</span>
                        <span className="text-amber-400 font-bold text-sm">${totalPendingPayouts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Total Paid Out</span>
                        <span className="text-emerald-400 font-bold text-sm">${totalPaidPayouts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIFTH ROW: Top Tenants by Revenue */}
                <div className={`${theme.cardBg} border rounded-2xl font-sans overflow-hidden`}>
                  <div className="px-7 py-5 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">Top Tenants by Revenue</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Ranked by lifetime gross revenue · {activeTenants} active accounts</p>
                    </div>
                    <button type="button"
                      onClick={() => { setActiveTab('locations'); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#ffe2ab] border border-[#ffe2ab]/20 px-4 py-2 rounded-xl hover:bg-[#ffe2ab]/5 transition-colors cursor-pointer"
                    >
                      View All Tenants
                    </button>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-7 py-3">#</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Tenant</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Tier</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Region</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Terminals</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Status</th>
                        <th className="text-right text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-7 py-3">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {[...tenants]
                        .sort((a, b) => parseRevenue(b.revenue) - parseRevenue(a.revenue))
                        .map((t, idx) => (
                          <tr key={t.id} className="hover:bg-white/[0.015] transition-colors">
                            <td className="px-7 py-4 text-[11px] text-[#A69984]/40 font-bold">{idx + 1}</td>
                            <td className="px-4 py-4">
                              <div className="text-[12px] text-white font-bold">{t.name}</div>
                              <div className="text-[9.5px] text-[#A69984]/50 font-semibold mt-0.5">{t.location} · {t.id}</div>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-[#A69984]/70 font-semibold">{t.tier || '—'}</td>
                            <td className="px-4 py-4 text-[11px] text-[#A69984]/70 font-semibold">{t.region || '—'}</td>
                            <td className="px-4 py-4 text-[11px] text-white font-bold">{t.terminals}</td>
                            <td className="px-4 py-4">
                              <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${t.status === 'ACTIVE' ? theme.tagActive : theme.tagSuspended}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-7 py-4 text-right">
                              <span className="text-[12px] text-[#ffc53d] font-bold font-serif">{t.revenue}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })()}

          {activeTab === 'activity-log' && (
            <div className="space-y-8 animate-fade-in duration-300 font-sans">
              {/* Header Title Block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 select-none">
                <div>
                  <h2 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">
                    System Activity Logs
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984] mt-3 font-semibold">
                    Global audit log trail for Super Admins tracking multi-tenant updates, system configuration changes, and registration events.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Are you sure you want to clear all system activity logs? This action cannot be undone.')) {
                      await clearActivityLogs();
                      const updated = await getActivityLogs();
                      setLogsList(updated);
                      triggerToast('System activity logs cleared successfully.', 'success');
                    }
                  }}
                  className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  Clear System Logs
                </button>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0e0e0d]/30 border border-white/5 p-4 rounded-2xl select-none">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {['All', 'Tenants', 'Settings', 'Support', 'Security'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setLogsFilter(cat); setLogsPage(1); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        logsFilter === cat
                          ? `bg-[#ffc53d] text-black`
                          : `bg-white/5 text-[#A69984] hover:bg-white/10`
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#A69984]/50 text-sm">search</span>
                  <input
                    type="text"
                    value={logsSearch}
                    onChange={(e) => { setLogsSearch(e.target.value); setLogsPage(1); }}
                    placeholder="Search system logs..."
                    className="w-full bg-[#161513] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors font-medium"
                  />
                </div>
              </div>

              {/* LOG ENTRIES TABLE */}
              <div className="bg-[#161513]/90 border border-white/5 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[9.5px] uppercase tracking-wider font-bold text-[#A69984]/50 select-none">
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-4">Actor</th>
                        <th className="py-4 px-4">Event</th>
                        <th className="py-4 px-4">Description</th>
                        <th className="py-4 px-6 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(() => {
                        const filtered = logsList.filter((log: any) => {
                          const matchesCat = logsFilter === 'All' || log.category?.toLowerCase() === logsFilter.toLowerCase();
                          const matchesSearch = !logsSearch || 
                            log.message?.toLowerCase().includes(logsSearch.toLowerCase()) ||
                            log.actor?.toLowerCase().includes(logsSearch.toLowerCase()) ||
                            log.action?.toLowerCase().includes(logsSearch.toLowerCase());
                          return matchesCat && matchesSearch;
                        });

                        const perPage = 10;
                        const totalPages = Math.ceil(filtered.length / perPage) || 1;
                        const startIdx = (logsPage - 1) * perPage;
                        const paginated = filtered.slice(startIdx, startIdx + perPage);

                        return (
                          <>
                            {paginated.map((log: any, idx: number) => {
                              let catBadge = 'bg-white/5 text-white/70';
                              if (log.category === 'Tenants') catBadge = 'bg-sky-500/10 border border-sky-500/20 text-sky-400';
                              else if (log.category === 'Support') catBadge = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
                              else if (log.category === 'Settings') catBadge = 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
                              else if (log.category === 'Security') catBadge = 'bg-purple-500/10 border border-purple-500/20 text-purple-400';

                              return (
                                <tr key={log.id || idx} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="py-4 px-6 font-mono text-[10px] whitespace-nowrap text-[#A69984]">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </td>
                                  <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                                    {log.actor || 'System'}
                                  </td>
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-black ${catBadge}`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-xs text-[#c5b9a5] leading-relaxed min-w-[250px]">
                                    {log.message}
                                  </td>
                                  <td className="py-4 px-6 text-right whitespace-nowrap">
                                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          alert(JSON.stringify(log.metadata, null, 2));
                                        }}
                                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-sans font-bold transition-all cursor-pointer"
                                      >
                                        View Data
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-white/20">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                            
                            {filtered.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-xs text-[#A69984]/50">
                                  No system activity log entries matched the filters.
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                {(() => {
                  const filtered = logsList.filter((log: any) => {
                    const matchesCat = logsFilter === 'All' || log.category?.toLowerCase() === logsFilter.toLowerCase();
                    const matchesSearch = !logsSearch || 
                      log.message?.toLowerCase().includes(logsSearch.toLowerCase()) ||
                      log.actor?.toLowerCase().includes(logsSearch.toLowerCase()) ||
                      log.action?.toLowerCase().includes(logsSearch.toLowerCase());
                    return matchesCat && matchesSearch;
                  });
                  const perPage = 10;
                  const totalPages = Math.ceil(filtered.length / perPage) || 1;

                  return (
                    <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center select-none text-xs text-[#A69984]/80 font-sans">
                      <div>
                        Showing <span className="font-bold text-white">{filtered.length > 0 ? (logsPage - 1) * perPage + 1 : 0}</span> to{' '}
                        <span className="font-bold text-white">{Math.min(logsPage * perPage, filtered.length)}</span> of{' '}
                        <span className="font-bold text-white">{filtered.length}</span> log entries
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={logsPage === 1}
                          onClick={() => setLogsPage((prev: any) => Math.max(prev - 1, 1))}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            logsPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        
                        <span className="font-mono text-xs font-bold px-2">
                          {logsPage} / {totalPages}
                        </span>
                        
                        <button
                          type="button"
                          disabled={logsPage === totalPages}
                          onClick={() => setLogsPage((prev: any) => Math.min(prev + 1, totalPages))}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            logsPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

    </>
  );
}
