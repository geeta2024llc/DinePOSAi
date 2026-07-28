'use client';

import React, { useState, useMemo } from 'react';

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

  // ── Access Manager Search, Filtering, Sorting & Pagination State ─────────
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'>('ALL');
  const [adminRoleFilter, setAdminRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'STAFF'>('ALL');
  const [adminSortField, setAdminSortField] = useState<'name' | 'email' | 'assignedTo' | 'role' | 'status'>('name');
  const [adminSortOrder, setAdminSortOrder] = useState<'asc' | 'desc'>('asc');
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const ADMIN_PAGE_SIZE = 10;

  // ── RBAC Hierarchy Audit System State ─────────────────────────────────────
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const runHierarchyAudit = async () => {
    setAuditLoading(true);
    setShowAuditModal(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dinepos_auth_token') : '';
      const res = await fetch('/api/admin/audit-hierarchy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(r => r.json());

      if (res.success) {
        setAuditResult(res.data);
        triggerToast?.('RBAC Hierarchy Audit completed successfully!', 'success');
      } else {
        triggerToast?.(`Audit failed: ${res.error}`, 'info');
      }
    } catch (err: any) {
      triggerToast?.(`Network error running audit: ${err.message}`, 'info');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'email' | 'assignedTo' | 'role' | 'status') => {
    if (adminSortField === field) {
      setAdminSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAdminSortField(field);
      setAdminSortOrder('asc');
    }
  };

  const processedAdmins = useMemo(() => {
    const rawList = Array.isArray(filteredAdmins) ? filteredAdmins : [];
    
    // 1. Filter
    const filtered = rawList.filter((a: any) => {
      const q = adminSearch.toLowerCase().trim();
      const nameMatch = (a.name || '').toLowerCase().includes(q);
      const emailMatch = (a.email || '').toLowerCase().includes(q);
      const tenantMatch = (a.assignedTo || a.tenant || '').toLowerCase().includes(q);
      const roleMatch = (a.role || '').toLowerCase().includes(q);
      const statusMatch = (a.status || '').toLowerCase().includes(q);
      const matchesSearch = !q || nameMatch || emailMatch || tenantMatch || roleMatch || statusMatch;

      const matchesStatus = adminStatusFilter === 'ALL' || (a.status || 'ACTIVE').toUpperCase() === adminStatusFilter;

      const uRole = (a.role || 'STAFF').toUpperCase();
      const matchesRole = adminRoleFilter === 'ALL' || 
        (adminRoleFilter === 'TENANT_ADMIN' ? (uRole === 'TENANT_ADMIN' || uRole === 'OWNER') : uRole === adminRoleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });

    // 2. Sort
    filtered.sort((a: any, b: any) => {
      let valA = '';
      let valB = '';
      if (adminSortField === 'name') { valA = a.name || ''; valB = b.name || ''; }
      else if (adminSortField === 'email') { valA = a.email || ''; valB = b.email || ''; }
      else if (adminSortField === 'assignedTo') { valA = a.assignedTo || a.tenant || ''; valB = b.assignedTo || b.tenant || ''; }
      else if (adminSortField === 'role') { valA = a.role || ''; valB = b.role || ''; }
      else if (adminSortField === 'status') { valA = a.status || ''; valB = b.status || ''; }

      const comp = valA.localeCompare(valB);
      return adminSortOrder === 'asc' ? comp : -comp;
    });

    return filtered;
  }, [filteredAdmins, adminSearch, adminStatusFilter, adminRoleFilter, adminSortField, adminSortOrder]);

  const totalAdminPages = useMemo(() => {
    return Math.max(1, Math.ceil(processedAdmins.length / ADMIN_PAGE_SIZE));
  }, [processedAdmins]);

  const pagedAdmins = useMemo(() => {
    return processedAdmins.slice((adminCurrentPage - 1) * ADMIN_PAGE_SIZE, adminCurrentPage * ADMIN_PAGE_SIZE);
  }, [processedAdmins, adminCurrentPage]);

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

              {/* Administrative Status Banner */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 border-emerald-500/20`}>
                <div className="flex items-center gap-3 select-none">
                  <span className="material-symbols-outlined text-emerald-400 text-xl font-bold">verified_user</span>
                  <div>
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">System Security & Access Status</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">All admin user credentials and authorization tokens are operating within normal security parameters.</p>
                  </div>
                </div>
              </div>

              {/* Admin Directory Table */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                
                {/* Section Title & Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">Admin Owners Registry</h3>
                    <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-0.5">Real-time system privileges and assigned tenant workspaces</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={runHierarchyAudit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm text-amber-400">account_tree</span>
                      Run RBAC Audit
                    </button>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs text-[#A69984] font-bold rounded-xl">
                      {processedAdmins.length} Admins registered
                    </span>
                  </div>
                </div>

                {/* Filter Toolbar & Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 font-sans text-xs select-none">
                  {/* Search Input */}
                  <div className="relative flex-grow max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/50 text-sm">search</span>
                    <input
                      type="text"
                      placeholder="Search owner name, email, assigned business, role..."
                      value={adminSearch}
                      onChange={(e) => { setAdminSearch(e.target.value); setAdminCurrentPage(1); }}
                      className={`w-full bg-black/20 border ${theme.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        aria-label="Status filter"
                        value={adminStatusFilter}
                        onChange={(e) => { setAdminStatusFilter(e.target.value as any); setAdminCurrentPage(1); }}
                        className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors text-xs"
                      >
                        <option value="ALL">Status: All</option>
                        <option value="ACTIVE">Status: Active</option>
                        <option value="SUSPENDED">Status: Suspended</option>
                        <option value="INACTIVE">Status: Inactive</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>

                    {/* Role Dropdown */}
                    <div className="relative">
                      <select
                        aria-label="Role filter"
                        value={adminRoleFilter}
                        onChange={(e) => { setAdminRoleFilter(e.target.value as any); setAdminCurrentPage(1); }}
                        className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors text-xs"
                      >
                        <option value="ALL">Role: All</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="TENANT_ADMIN">Owner / Tenant Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="STAFF">Staff</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>

                    {/* Clear Filters */}
                    {(adminSearch || adminStatusFilter !== 'ALL' || adminRoleFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => { setAdminSearch(''); setAdminStatusFilter('ALL'); setAdminRoleFilter('ALL'); setAdminCurrentPage(1); }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs text-[#A69984]/60 hover:text-white border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider bg-white/[0.01]">
                        <th className="py-3.5 px-3 text-center w-12">S.N.</th>
                        <th 
                          onClick={() => handleSort('name')}
                          className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Owner Name</span>
                            {adminSortField === 'name' && (
                              <span className="material-symbols-outlined text-xs">{adminSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('email')}
                          className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Work Email</span>
                            {adminSortField === 'email' && (
                              <span className="material-symbols-outlined text-xs">{adminSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('assignedTo')}
                          className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Assigned To (Tenant)</span>
                            {adminSortField === 'assignedTo' && (
                              <span className="material-symbols-outlined text-xs">{adminSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th className="py-3.5 px-4">Hierarchy Breadcrumb (Tenant &gt; Branch &gt; Role)</th>
                        <th 
                          onClick={() => handleSort('role')}
                          className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Role</span>
                            {adminSortField === 'role' && (
                              <span className="material-symbols-outlined text-xs">{adminSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th className="py-3.5 px-4">Last Activity</th>
                        <th 
                          onClick={() => handleSort('status')}
                          className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Account Status</span>
                            {adminSortField === 'status' && (
                              <span className="material-symbols-outlined text-xs">{adminSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                            )}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {pagedAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-xs text-[#A69984]/40 uppercase tracking-wider font-bold">
                            No admin users found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        pagedAdmins.map((a: any, idx: number) => {
                          const snNumber = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE + idx + 1;
                          const assignedText = a.assignedTo || a.tenant || '';
                          const userRole = (a.role || 'STAFF').toUpperCase();

                          return (
                            <tr key={a.id} className="hover:bg-white/[0.015] transition-colors">
                              {/* S.N. */}
                              <td className="py-4 px-3 text-center text-[11.5px] text-[#A69984]/75 font-mono font-bold">
                                {snNumber}
                              </td>

                              {/* Owner Name */}
                              <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-[11px] text-amber-400 font-bold uppercase shrink-0">
                                  {a.name ? a.name.slice(0, 2) : 'AD'}
                                </span>
                                <span className="truncate max-w-[160px]">{a.name}</span>
                              </td>

                              {/* Work Email & Phone */}
                              <td className="py-4 px-4 max-w-[180px]">
                                {a.email ? (
                                  <a
                                    href={`mailto:${a.email}`}
                                    title={a.email}
                                    className="text-xs text-[#A69984] hover:text-[#ffc53d] font-mono truncate block transition-colors underline-offset-2 hover:underline"
                                  >
                                    {a.email}
                                  </a>
                                ) : (
                                  <span className="text-white/30 italic font-mono text-xs">N/A</span>
                                )}
                                {a.phone && (
                                  <div className="text-[10.5px] text-amber-300/90 font-mono mt-0.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[11px] text-amber-400">call</span>
                                    <span>{a.phone}</span>
                                  </div>
                                )}
                              </td>

                              {/* Assigned To */}
                              <td className="py-4 px-4 max-w-[200px]">
                                {assignedText && assignedText !== 'Not Assigned' && assignedText !== 'System Platform' ? (
                                  <div className="flex items-center gap-1.5 text-xs text-white font-medium truncate" title={assignedText}>
                                    <span className="material-symbols-outlined text-xs text-[#ffc53d]">storefront</span>
                                    <span className="truncate">{assignedText}</span>
                                  </div>
                                ) : assignedText === 'System Platform' || userRole === 'SUPER_ADMIN' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[9.5px] font-bold uppercase">
                                    <span className="material-symbols-outlined text-[10px]">dns</span>System Platform
                                  </span>
                                ) : (
                                  <span className="text-xs text-white/30 font-mono italic">Not Assigned</span>
                                )}
                              </td>

                              {/* Hierarchy Breadcrumb */}
                              <td className="py-4 px-4 max-w-[280px]">
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-200/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg truncate" title={a.hierarchyBreadcrumb || `${assignedText || 'System Platform'} > ${a.branchName || 'Main Outlet'} > ${userRole}`}>
                                  <span className="material-symbols-outlined text-xs text-amber-400 shrink-0">account_tree</span>
                                  <span className="truncate">{a.hierarchyBreadcrumb || `${assignedText || 'System Platform'} > ${a.branchName || 'Main Outlet'} > ${userRole}`}</span>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                {userRole === 'SUPER_ADMIN' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-violet-500/35 bg-violet-500/10 text-violet-300 font-bold uppercase">
                                    <span className="material-symbols-outlined text-[11px]">star</span>Super Admin
                                  </span>
                                ) : userRole === 'TENANT_ADMIN' || userRole === 'OWNER' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-300 font-bold uppercase">
                                    <span className="material-symbols-outlined text-[11px]">crown</span>Owner / Admin
                                  </span>
                                ) : userRole === 'MANAGER' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-sky-500/35 bg-sky-500/10 text-sky-300 font-bold uppercase">
                                    <span className="material-symbols-outlined text-[11px]">badge</span>Manager
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] rounded-lg border border-slate-500/35 bg-slate-500/10 text-slate-300 font-bold uppercase">
                                    <span className="material-symbols-outlined text-[11px]">person</span>Staff
                                  </span>
                                )}
                              </td>

                              {/* Last Activity */}
                              <td className="py-4 px-4 text-[#A69984]/70 font-mono text-[11px] whitespace-nowrap">
                                {a.lastActive || 'Recently'}
                              </td>

                              {/* Account Status */}
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-[9.5px] rounded-lg font-bold uppercase tracking-wider border ${
                                  a.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                  a.status === 'SUSPENDED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-white/5 border-white/10 text-white/40'
                                }`}>
                                  {a.status}
                                </span>
                              </td>

                              {/* Access Controls */}
                              <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
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
                                  className="text-[9.5px] border border-white/10 hover:border-white/25 text-[#ffe2ab] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button type="button" 
                                  onClick={() => handleResetPasswordClick(a)}
                                  className="text-[9.5px] border border-white/10 hover:border-white/25 text-[#A69984] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Password
                                </button>
                                <button type="button" 
                                  onClick={() => toggleAdminStatus(a.id, a.name, a.status)}
                                  className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                    a.status === 'ACTIVE' 
                                      ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10' 
                                      : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
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
                                  className="text-[9.5px] border border-red-500/25 hover:border-red-500/40 text-red-400 px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 font-sans select-none">
                  <div className="text-xs text-[#A69984]/50 font-bold">
                    Showing <span className="text-white/70">{processedAdmins.length === 0 ? 0 : (adminCurrentPage - 1) * ADMIN_PAGE_SIZE + 1}</span>
                    {' '}–{' '}
                    <span className="text-white/70">{Math.min(adminCurrentPage * ADMIN_PAGE_SIZE, processedAdmins.length)}</span>
                    {' '}of{' '}
                    <span className="text-white/70">{processedAdmins.length}</span> admins
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={adminCurrentPage === 1}
                      onClick={() => setAdminCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setAdminCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          adminCurrentPage === page
                            ? `${theme.accentBg} ${theme.accentText}`
                            : 'bg-white/5 text-[#A69984] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={adminCurrentPage === totalAdminPages || totalAdminPages === 0}
                      onClick={() => setAdminCurrentPage(prev => Math.min(totalAdminPages, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
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

      {/* ── RBAC System Hierarchy Audit Modal ────────────────────────────────────── */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-500/30 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400 text-2xl">account_tree</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">RBAC Hierarchy & Multi-Tenant Audit</h3>
                  <p className="text-xs text-[#A69984]/70 font-mono">Authoritative automated validation across Supabase users, tenants & branches</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {auditLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-amber-200/80 animate-pulse">Running authoritative RBAC hierarchy verification scan...</p>
              </div>
            ) : auditResult ? (
              <div className="space-y-4 font-sans">
                {/* Health Score Summary Banner */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${auditResult.isHealthy ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">{auditResult.isHealthy ? 'verified' : 'warning'}</span>
                    <div>
                      <h4 className="font-bold text-sm font-serif">{auditResult.isHealthy ? 'RBAC Architecture Fully Synchronized' : 'Hierarchy Discrepancies Flagged'}</h4>
                      <p className="text-xs opacity-80 font-mono">Verified {auditResult.totalUsers} users across {auditResult.totalTenants} tenants & {auditResult.totalBranches} branches</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold">{auditResult.healthScore}%</span>
                    <span className="block text-[10px] uppercase opacity-70">Health Score</span>
                  </div>
                </div>

                {/* Audit Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[#A69984]/60 text-[10px] uppercase block">Total Tenants</span>
                    <span className="text-white font-bold text-base">{auditResult.totalTenants}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[#A69984]/60 text-[10px] uppercase block">Active Users</span>
                    <span className="text-white font-bold text-base">{auditResult.totalActiveUsers}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[#A69984]/60 text-[10px] uppercase block">Orphan Users</span>
                    <span className={`font-bold text-base ${auditResult.orphanedUsersCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{auditResult.orphanedUsersCount}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[#A69984]/60 text-[10px] uppercase block">Unassigned Owners</span>
                    <span className={`font-bold text-base ${auditResult.missingOwnerTenantsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{auditResult.missingOwnerTenantsCount}</span>
                  </div>
                </div>

                {/* Detailed Audit Findings Log */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-white/80 uppercase font-mono tracking-wider">Audit Findings Log</span>
                  {auditResult.auditDetails && auditResult.auditDetails.length > 0 ? (
                    auditResult.auditDetails.map((item: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2.5 text-xs">
                        <span className={`material-symbols-outlined text-sm ${item.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>error</span>
                        <span className="text-white/90 font-sans">{item.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-300 text-xs text-center font-mono">
                      ✓ 100% of user accounts are assigned to valid tenants, branches, and authorized system roles.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
