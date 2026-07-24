'use client';

import React, { useState, useEffect } from 'react';
import { recordActivity } from '@/utils/activityLogger';
import { isDemoTenant, apiRequest } from '@/utils/api';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, UserRole } from '@dineposai/shared-types';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';

const FEATURE_GROUPS = [
  {
    title: 'Orders & Payments',
    permissions: [
      { key: 'orders.create', label: 'Create Orders' },
      { key: 'orders.edit', label: 'Edit/Modify Orders' },
      { key: 'orders.refund', label: 'Issue Refunds' },
      { key: 'orders.cancel', label: 'Cancel Orders' },
      { key: 'invoice.print', label: 'Print Invoices/Receipts' },
    ]
  },
  {
    title: 'Tables & Layouts',
    permissions: [
      { key: 'tables.view', label: 'View Floor Plan & Tables' },
      { key: 'tables.manage', label: 'Manage Tables & Floor Plan' },
    ]
  },
  {
    title: 'Menu & Catalog',
    permissions: [
      { key: 'menu.view', label: 'View Menu Items' },
      { key: 'menu.manage', label: 'Edit & Manage Menu Catalog' },
    ]
  },
  {
    title: 'Kitchen Display System (KDS)',
    permissions: [
      { key: 'kds.view', label: 'View KDS Board' },
      { key: 'kds.update', label: 'Complete/Update Cooking States' },
    ]
  },
  {
    title: 'Inventory Management',
    permissions: [
      { key: 'inventory.view', label: 'View Stock & Ingredients' },
      { key: 'inventory.manage', label: 'Manage Stock Levels & Ordering' },
    ]
  },
  {
    title: 'Cash Drawer Control',
    permissions: [
      { key: 'cash_drawer.open', label: 'Open Cash Drawer' },
      { key: 'cash_drawer.no_sale', label: 'No Sale / Open without Transaction' },
      { key: 'cash_drawer.cash_in', label: 'Perform Cash In / Pay Ins' },
      { key: 'cash_drawer.cash_out', label: 'Perform Cash Out / Safe Drops' },
    ]
  },
  {
    title: 'Office & Security',
    permissions: [
      { key: 'staff.view', label: 'View Employees & Rosters' },
      { key: 'staff.manage', label: 'Manage Roster & Permissions' },
      { key: 'billing.view', label: 'View Platform Subscription' },
      { key: 'reports.view', label: 'View Business Analytics & Reports' },
      { key: 'audit.view', label: 'View System Audit Logs' },
    ]
  }
];

interface StaffTabProps {
  t: any;
  tr: any;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function StaffTab({ t, tr, triggerToast, setAuditLogs }: StaffTabProps) {
  const [staffMembers, setStaffMembers] = useState<Array<{id: string; name: string; email?: string; role: string; status: string; performance: number; avatar: string; custom_permissions?: string[]}>>([]);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<any | null>(null);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Waiter',
    status: 'OFF_DUTY',
    performance: 5.0
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  
  const [staffPageSize, setStaffPageSize] = useState(10);
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [shiftPlannerOffset, setShiftPlannerOffset] = useState(0);
  const [timelineTab, setTimelineTab] = useState<'timeline' | 'month'>('timeline');

  const [editingShift, setEditingShift] = useState<{ employee: string; day: string } | null>(null);
  const [rosterShifts, setRosterShifts] = useState<Record<string, Record<string, string>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dinepos_roster_shifts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      'Elena Rodriguez': { 'MON 13': '09:00 - 17:00', 'TUE 14': '09:00 - 17:00', 'WED 15': '09:00 - 22:00', 'THU 16': 'OFF', 'FRI 17': '10:00 - 18:00', 'SAT 18': '10:00 - 18:00', 'SUN 19': '10:00 - 18:00' },
      'Marcus Chen': { 'MON 13': 'OFF', 'TUE 14': '14:00 - 22:00', 'WED 15': '14:00 - 22:00', 'THU 16': '14:00 - 22:00', 'FRI 17': '14:00 - 22:00', 'SAT 18': '14:00 - 22:00', 'SUN 19': 'OFF' },
      'Sarah Jenkins': { 'MON 13': '16:00 - 00:00', 'TUE 14': '16:00 - 00:00', 'WED 15': 'OFF', 'THU 16': '16:00 - 00:00', 'FRI 17': '16:00 - 00:00', 'SAT 18': 'OFF', 'SUN 19': '16:00 - 00:00' },
      'David Vance': { 'MON 13': '14:00 - 22:00', 'TUE 14': 'OFF', 'WED 15': '14:00 - 22:00', 'THU 16': '14:00 - 22:00', 'FRI 17': 'OFF', 'SAT 18': '14:00 - 22:00', 'SUN 19': '14:00 - 22:00' },
      'Lisa Kim': { 'MON 13': '09:00 - 17:00', 'TUE 14': '09:00 - 17:00', 'WED 15': 'OFF', 'THU 16': '09:00 - 17:00', 'FRI 17': '09:00 - 17:00', 'SAT 18': 'OFF', 'SUN 19': '09:00 - 17:00' },
      'Robert Taylor': { 'MON 13': 'OFF', 'TUE 14': '09:00 - 17:00', 'WED 15': '09:00 - 17:00', 'THU 16': 'OFF', 'FRI 17': '09:00 - 17:00', 'SAT 18': '09:00 - 17:00', 'SUN 19': 'OFF' },
      'Emily Davis': { 'MON 13': '10:00 - 18:00', 'TUE 14': '10:00 - 18:00', 'WED 15': 'OFF', 'THU 16': '10:00 - 18:00', 'FRI 17': '10:00 - 18:00', 'SAT 18': '10:00 - 18:00', 'SUN 19': 'OFF' },
      'John Watson': { 'MON 13': '09:00 - 22:00', 'TUE 14': '09:00 - 22:00', 'WED 15': 'OFF', 'THU 16': 'OFF', 'FRI 17': '09:00 - 22:00', 'SAT 18': '09:00 - 22:00', 'SUN 19': 'OFF' }
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_roster_shifts', JSON.stringify(rosterShifts));
    }
  }, [rosterShifts]);

  const dbToUiRole = (dbRole: string): string => {
    switch (dbRole) {
      case 'WAITER': return 'Waiter';
      case 'CASHIER': return 'Cashier';
      case 'KITCHEN': return 'KDS';
      case 'MANAGER': return 'Manager';
      case 'CUSTOMER': return 'Customer';
      case 'OWNER': return 'Owner';
      default: return dbRole;
    }
  };

  const uiToDbRole = (uiRole: string): string => {
    switch (uiRole) {
      case 'Waiter': return 'WAITER';
      case 'Cashier': return 'CASHIER';
      case 'KDS': return 'KITCHEN';
      case 'Manager': return 'MANAGER';
      case 'Customer': return 'CUSTOMER';
      case 'Owner': return 'OWNER';
      default: return uiRole;
    }
  };

  const defaultMockMembers = [
    { id: 'EMP-101', name: 'Elena Rodriguez', email: 'elena@dinepos.ai', role: 'Waiter', status: 'ON_SHIFT', performance: 5.0, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop', custom_permissions: ['orders.create', 'orders.edit', 'tables.view', 'menu.view'] },
    { id: 'EMP-102', name: 'Marcus Chen', email: 'marcus@dinepos.ai', role: 'Cashier', status: 'OFF_DUTY', performance: 4.8, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop', custom_permissions: ['orders.create', 'orders.edit', 'orders.refund', 'orders.cancel', 'invoice.print', 'tables.view', 'menu.view', 'cash_drawer.open', 'cash_drawer.cash_in', 'cash_drawer.cash_out', 'cash_drawer.no_sale'] },
    { id: 'EMP-103', name: 'Sarah Jenkins', email: 'sarah@dinepos.ai', role: 'KDS', status: 'ON_SHIFT', performance: 4.5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop', custom_permissions: ['menu.view', 'kds.view', 'kds.update'] },
    { id: 'EMP-104', name: 'David Vance', email: 'david@dinepos.ai', role: 'Waiter', status: 'OFF_DUTY', performance: 4.0, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop', custom_permissions: ['orders.create', 'orders.edit', 'tables.view', 'menu.view'] },
    { id: 'EMP-105', name: 'Lisa Kim', email: 'lisa@dinepos.ai', role: 'Manager', status: 'ON_SHIFT', performance: 5.0, avatar: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=120&auto=format&fit=crop', custom_permissions: ['orders.create', 'orders.edit', 'orders.refund', 'orders.cancel', 'invoice.print', 'tables.view', 'tables.manage', 'menu.view', 'menu.manage', 'kds.view', 'kds.update', 'inventory.view', 'inventory.manage', 'staff.view', 'billing.view', 'reports.view', 'audit.view', 'cash_drawer.open', 'cash_drawer.cash_in', 'cash_drawer.cash_out', 'cash_drawer.no_sale'] },
    { id: 'EMP-106', name: 'Robert Taylor', email: 'robert@dinepos.ai', role: 'KDS', status: 'OFF_DUTY', performance: 4.8, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120&auto=format&fit=crop', custom_permissions: ['menu.view', 'kds.view', 'kds.update'] },
    { id: 'EMP-107', name: 'Emily Davis', email: 'emily@dinepos.ai', role: 'Waiter', status: 'OVERTIME', performance: 4.5, avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=120&auto=format&fit=crop', custom_permissions: ['orders.create', 'orders.edit', 'tables.view', 'menu.view'] },
    { id: 'EMP-108', name: 'John Watson', email: 'john@dinepos.ai', role: 'Cashier', status: 'OFF_DUTY', performance: 5.0, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop', custom_permissions: ['orders.create', 'orders.edit', 'orders.refund', 'orders.cancel', 'invoice.print', 'tables.view', 'menu.view', 'cash_drawer.open', 'cash_drawer.cash_in', 'cash_drawer.cash_out', 'cash_drawer.no_sale'] }
  ];

  const loadStaffMembers = async () => {
    if (isDemoTenant()) {
      const stored = localStorage.getItem('dinepos_staff_admin');
      if (stored) {
        try {
          setStaffMembers(JSON.parse(stored));
        } catch {
          setStaffMembers(defaultMockMembers);
          localStorage.setItem('dinepos_staff_admin', JSON.stringify(defaultMockMembers));
        }
      } else {
        setStaffMembers(defaultMockMembers);
        localStorage.setItem('dinepos_staff_admin', JSON.stringify(defaultMockMembers));
      }
    } else {
      try {
        const response = await apiRequest<any[]>('/api/tenant/users');
        if (response.success && Array.isArray(response.data)) {
          const mapped = response.data.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: dbToUiRole(user.role),
            status: user.is_active ? 'ON_SHIFT' : 'OFF_DUTY',
            performance: 5.0,
            avatar: '',
            custom_permissions: user.custom_permissions || []
          }));
          setStaffMembers(mapped);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch staff members:', error);
      }
      // If network fails in production, load local storage or empty list
      const stored = typeof window !== 'undefined' ? localStorage.getItem('dinepos_staff_admin') : null;
      if (stored) {
        try {
          setStaffMembers(JSON.parse(stored));
        } catch {
          setStaffMembers([]);
        }
      } else {
        setStaffMembers([]);
      }
    }
  };

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const exportRosterSchedule = () => {
    const days = ['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'];
    let csv = 'Employee ID,Employee Name,Role,Status,' + days.join(',') + '\n';
    
    staffMembers.forEach(m => {
      const shifts = days.map(d => `"${rosterShifts[m.name]?.[d] || 'OFF'}"`).join(',');
      csv += `"${m.id}","${m.name}","${m.role}","${m.status}",${shifts}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_roster_schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Weekly Staff Shift Roster schedule exported!', 'success');
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
                <div className="select-none">
                  <h2 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">
                    {tr.staffDirectory}
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 mt-3 leading-relaxed max-w-2xl font-semibold">
                    {tr.staffDesc}
                  </p>
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <button type="button"
                    onClick={exportRosterSchedule}
                    className="text-white/80 hover:text-white px-4 py-3 text-xs uppercase tracking-widest font-sans font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none border border-white/10 rounded-xl bg-white/5 hover:bg-white/10"
                    title="Export weekly shift roster to CSV"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Export Roster
                  </button>
                  <button type="button"
                    onClick={() => {
                      setNewEmployee({
                        name: '',
                        email: '',
                        password: '',
                        role: 'Waiter',
                        status: 'OFF_DUTY',
                        performance: 5.0
                      });
                      setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS['WAITER']);
                      setEditingEmployee(null);
                      setShowAddEmployeeModal(true);
                    }}
                    className="bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_16px_rgba(255,226,171,0.15)] hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    Add employee
                  </button>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Active Staff */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>TOTAL ACTIVE STAFF</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>{staffMembers.length}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">work</span>
                    </div>
                  </div>
                </div>

                {/* On Shift Now */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>ON SHIFT NOW</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>{staffMembers.filter(m => m.status === 'ON_SHIFT').length}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">schedule</span>
                    </div>
                  </div>
                </div>

                {/* Open Shifts */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>APPROACHING OVERTIME</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>{staffMembers.filter(m => m.status === 'OVERTIME').length}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">warning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Employee Table + Shift Planner & Role Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Employee List Table (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className={`${t.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                    {/* Table Filters & Search */}
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center select-none">
                      <div className="relative w-full md:w-[260px]">
                        <span className={`material-symbols-outlined absolute left-3 top-2.5 ${t.textMutedDark} text-sm`}>search</span>
                        <input
                          type="text"
                          placeholder="Search by name, role, or ID..."
                          value={staffSearchQuery}
                          onChange={(e) => {
                            setStaffSearchQuery(e.target.value);
                            setStaffCurrentPage(1);
                          }}
                          className={`bg-transparent border ${t.inputBorder} rounded-xl pl-9 pr-4 py-2 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-full transition-colors font-medium`}
                        />
                      </div>
                      
                      {/* Filter Tabs */}
                      <div className={`flex items-center gap-1.5 ${t.inputBg} p-1 rounded-xl border ${t.border}`}>
                        <button type="button"
                          onClick={() => {
                            setStaffRoleFilter('all');
                            setStaffCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            staffRoleFilter === 'all'
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:${t.text}`
                          }`}
                        >
                          All Roles
                        </button>
                        <button type="button"
                          onClick={() => {
                            setStaffRoleFilter('foh');
                            setStaffCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            staffRoleFilter === 'foh'
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:${t.text}`
                          }`}
                        >
                          Front of House
                        </button>
                        <button type="button"
                          onClick={() => {
                            setStaffRoleFilter('kitchen');
                            setStaffCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            staffRoleFilter === 'kitchen'
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:${t.text}`
                          }`}
                        >
                          Kitchen
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b ${t.border} ${t.inputBg}/50 text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest`}>
                            <th className="px-6 py-4">EMPLOYEE</th>
                            <th className="px-6 py-4">ROLE</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4">PERFORMANCE</th>
                            <th className="px-6 py-4 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${t.divider} font-sans text-xs`}>
                          {(() => {
                            const filtered = staffMembers.filter(member => {
                              // Filter by search query
                              const matchesSearch = member.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                member.role.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                member.id.toLowerCase().includes(staffSearchQuery.toLowerCase());
                              
                              // Filter by role category
                              if (staffRoleFilter === 'foh') {
                                  return matchesSearch && (member.role === 'Waiter' || member.role === 'Cashier' || member.role === 'Customer');
                              } else if (staffRoleFilter === 'kitchen') {
                                return matchesSearch && (member.role === 'KDS');
                              }
                              return matchesSearch;
                            });

                            const totalPages = Math.ceil(filtered.length / staffPageSize) || 1;
                            const activePage = staffCurrentPage > totalPages ? totalPages : staffCurrentPage;
                            const start = (activePage - 1) * staffPageSize;
                            const paginated = filtered.slice(start, start + staffPageSize);

                            return paginated.map((member) => (
                              <tr key={member.id} className={`hover:${t.cardHover} transition-colors`}>
                              <td className="px-4 sm:px-6 py-4 flex items-center gap-3">
                                  {member.avatar ? (
                                    <div className={`w-[36px] h-[36px] rounded-lg overflow-hidden border ${t.borderStrong} flex-shrink-0`}>
                                      <img 
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className={`w-[36px] h-[36px] rounded-lg ${t.accentLightBg} border ${t.accentLightBorder} ${t.accentLight} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  )}
                                  <div>
                                    <div className={`font-bold ${t.text} tracking-wide`}>{member.name}</div>
                                    <div className={`text-[10px] ${t.textMutedLight} font-semibold mt-0.5`}>ID: {member.id}</div>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 ${t.text} opacity-80 align-middle`}>
                                  {member.role}
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const nextStatus = member.status === 'ON_SHIFT' ? 'OFF_DUTY' : member.status === 'OFF_DUTY' ? 'OVERTIME' : 'ON_SHIFT';
                                      const updated = staffMembers.map(m => m.id === member.id ? { ...m, status: nextStatus } : m);
                                      setStaffMembers(updated);
                                      localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
                                      const statusLabel = nextStatus === 'ON_SHIFT' ? 'Clocked IN' : nextStatus === 'OFF_DUTY' ? 'Clocked OUT' : 'Set to Overtime';
                                      triggerToast(`${member.name} ${statusLabel}`, 'success');
                                      await recordActivity(
                                        'staff_clock_toggle',
                                        `${member.name} changed status to ${nextStatus}`,
                                        'Staff',
                                        { id: member.id, status: nextStatus }
                                      );
                                    }}
                                    className="cursor-pointer hover:scale-105 transition-transform text-left"
                                    title="Click to toggle Clock In / Clock Out status"
                                  >
                                    {member.status === 'ON_SHIFT' && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider rounded-full hover:bg-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
                                        On Shift (Clocked In)
                                      </span>
                                    )}
                                    {member.status === 'OFF_DUTY' && (
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border ${t.borderStrong} ${t.textMuted} font-bold text-[9px] uppercase tracking-wider rounded-full hover:bg-white/10`}>
                                        Off Duty (Clocked Out)
                                      </span>
                                    )}
                                    {member.status === 'OVERTIME' && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px] uppercase tracking-wider rounded-full hover:bg-amber-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 motion-safe:animate-pulse"></span>
                                        Approaching (Overtime)
                                      </span>
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex text-amber-400 select-none">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-[14px]">
                                          {i < Math.floor(member.performance) ? 'star' : 'star_border'}
                                        </span>
                                      ))}
                                    </div>
                                    <span className={`font-bold ${t.text} font-mono text-[10.5px]`}>{member.performance.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-middle text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingEmployee(member);
                                        setNewEmployee({
                                          name: member.name,
                                          email: member.email || '',
                                          password: '',
                                          role: member.role,
                                          status: member.status,
                                          performance: member.performance
                                        });
                                        const dbRole = uiToDbRole(member.role);
                                        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[dbRole as UserRole] || [];
                                        setSelectedPermissions(member.custom_permissions || defaultPerms);
                                        setShowAddEmployeeModal(true);
                                      }}
                                      className={`p-1.5 rounded-lg hover:${t.cardHover} ${t.textMuted} hover:${t.accent} transition-colors cursor-pointer flex items-center justify-center`}
                                      title="Edit Employee"
                                    >
                                      <span className="material-symbols-outlined text-base">edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteMemberTarget(member)}
                                      className={`p-1.5 rounded-lg hover:${t.cardHover} ${t.textMuted} hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center`}
                                      title="Delete Employee"
                                    >
                                      <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className={`p-4 border-t ${t.border} ${t.inputBg}/30 flex flex-col sm:flex-row gap-4 justify-between items-center select-none text-xs text-[#A69984]/80 font-sans`}>
                      <div className="flex items-center gap-2">
                        <span>Show</span>
                        <div className="relative">
                          <select
                            aria-label="Staff list page size"
                            value={staffPageSize}
                            onChange={(e) => {
                              setStaffPageSize(parseInt(e.target.value));
                              setStaffCurrentPage(1);
                            }}
                            className={`${t.inputBg} border ${t.border} rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none appearance-none pr-7`}
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1.5 text-xs text-[#A69984]/50 pointer-events-none">keyboard_arrow_down</span>
                        </div>
                        <span>rows per page</span>
                      </div>

                      {(() => {
                        const filtered = staffMembers.filter(member => {
                          const matchesSearch = member.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                            member.role.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                            member.id.toLowerCase().includes(staffSearchQuery.toLowerCase());
                          
                          if (staffRoleFilter === 'foh') {
                              return matchesSearch && (member.role === 'Waiter' || member.role === 'Cashier' || member.role === 'Customer');
                          } else if (staffRoleFilter === 'kitchen') {
                            return matchesSearch && (member.role === 'KDS');
                          }
                          return matchesSearch;
                        });

                        const totalItems = filtered.length;
                        const totalPages = Math.ceil(totalItems / staffPageSize) || 1;
                        const activePage = staffCurrentPage > totalPages ? totalPages : staffCurrentPage;
                        const startItem = totalItems === 0 ? 0 : (activePage - 1) * staffPageSize + 1;
                        const endItem = Math.min(activePage * staffPageSize, totalItems);

                        return (
                          <div className="flex items-center gap-4">
                            <span>Showing {startItem}-{endItem} of {totalItems}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={activePage === 1}
                                onClick={() => setStaffCurrentPage(p => Math.max(p - 1, 1))}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${t.border} transition-colors ${activePage === 1 ? 'opacity-30 cursor-not-allowed' : `hover:${t.cardHover} cursor-pointer`}`}
                              >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                              </button>
                              <span className="px-3 py-1 font-mono font-bold text-white bg-white/5 border border-white/5 rounded-lg">
                                {activePage} / {totalPages}
                              </span>
                              <button
                                type="button"
                                disabled={activePage === totalPages}
                                onClick={() => setStaffCurrentPage(p => Math.min(p + 1, totalPages))}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${t.border} transition-colors ${activePage === totalPages ? 'opacity-30 cursor-not-allowed' : `hover:${t.cardHover} cursor-pointer`}`}
                              >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right Side: Shift Planner & Role Distribution (Span 4) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Shift Planner Card */}
                  <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-5`}>
                    <div className={`flex justify-between items-center border-b ${t.border} pb-3 select-none`}>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${t.accent} text-lg font-light`}>calendar_today</span>
                        <h3 className={`font-serif text-sm ${t.text} font-bold tracking-wide`}>Shift Planner</h3>
                      </div>
                      <span className={`material-symbols-outlined ${t.textMutedDark} text-sm`}>edit_calendar</span>
                    </div>

                    <div className={`flex justify-between items-center ${t.inputBg}/50 py-2.5 px-4 border ${t.border} rounded-xl text-xs select-none`}>
                      <button type="button" onClick={() => setShiftPlannerOffset(prev => prev - 1)} className={`${t.textMuted} hover:${t.text} font-bold px-2 cursor-pointer`}>{"<"}</button>
                      <span className={`${t.text} font-bold tracking-wider font-mono`}>
                        {(() => {
                          const dates = ['Today, Oct 24', 'Fri, Oct 25', 'Sat, Oct 26', 'Sun, Oct 27', 'Mon, Oct 28', 'Tue, Oct 29', 'Wed, Oct 30'];
                          const idx = (shiftPlannerOffset % 7 + 7) % 7;
                          return dates[idx];
                        })()}
                      </span>
                      <button type="button" onClick={() => setShiftPlannerOffset(prev => prev + 1)} className={`${t.textMuted} hover:${t.text} font-bold px-2 cursor-pointer`}>{">"}</button>
                    </div>

                    <div className="space-y-4">
                      {/* Dinner Service Card */}
                      <div className={`${t.inputBg}/30 border ${t.border} rounded-xl p-4 space-y-3`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-[11px] ${t.text} font-bold uppercase tracking-wider`}>Dinner Service</h4>
                            <div className={`flex items-center gap-1.5 text-[9.5px] font-mono ${t.textMuted} mt-1`}>
                              <span className="material-symbols-outlined text-[10px]">schedule</span>
                              16:00 - 00:00
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[8px] uppercase tracking-wider rounded">
                            {(() => {
                              const currentDayKey = ['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'][(shiftPlannerOffset % 7 + 7) % 7];
                              const count = staffMembers.filter(m => {
                                const shift = rosterShifts[m.name]?.[currentDayKey];
                                return shift && (shift.includes('16:00') || shift.includes('14:00') || shift.includes('22:00'));
                              }).length;
                              return count < 3 ? 'Short Staffed' : 'Fully Staffed';
                            })()}
                          </span>
                        </div>
                        {/* Avatar stack */}
                        <div className="flex -space-x-2.5 overflow-hidden select-none items-center">
                          {(() => {
                            const currentDayKey = ['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'][(shiftPlannerOffset % 7 + 7) % 7];
                            const activeMembers = staffMembers.filter(m => {
                              const shift = rosterShifts[m.name]?.[currentDayKey];
                              return shift && (shift.includes('16:00') || shift.includes('14:00') || shift.includes('22:00'));
                            });

                            if (activeMembers.length === 0) {
                              return <span className={`text-[10px] ${t.textMuted} italic`}>No staff scheduled</span>;
                            }

                            return (
                              <>
                                {activeMembers.slice(0, 3).map((m) => (
                                  m.avatar ? (
                                    <img
                                      key={m.id}
                                      className="inline-block h-6 w-6 rounded-full ring-2 ring-[#161513] object-cover"
                                      src={m.avatar}
                                      alt={m.name}
                                    />
                                  ) : (
                                    <div key={m.id} className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${t.accentBg} ${t.accentText} text-[8px] font-bold ring-2 ring-[#161513]`}>
                                      {m.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  )
                                ))}
                                {activeMembers.length > 3 && (
                                  <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${t.tagAdmin} text-[8px] font-bold ring-2 ring-[#161513]`}>
                                    +{activeMembers.length - 3}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Closing Prep Card */}
                      <div className={`${t.inputBg}/30 border ${t.border} rounded-xl p-4 space-y-3`}>
                        <div>
                          <h4 className={`text-[11px] ${t.text} font-bold uppercase tracking-wider`}>Closing Prep</h4>
                          <div className={`flex items-center gap-1.5 text-[9.5px] font-mono ${t.textMuted} mt-1`}>
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                            22:00 - 02:00
                          </div>
                        </div>
                        {/* Avatar stack */}
                        <div className="flex -space-x-2.5 overflow-hidden select-none items-center">
                          {(() => {
                            const currentDayKey = ['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'][(shiftPlannerOffset % 7 + 7) % 7];
                            const activeMembers = staffMembers.filter(m => {
                              const shift = rosterShifts[m.name]?.[currentDayKey];
                              return shift && (shift.includes('22:00') || shift.includes('09:00 - 22:00'));
                            });

                            if (activeMembers.length === 0) {
                              return <span className={`text-[10px] ${t.textMuted} italic`}>No staff scheduled</span>;
                            }

                            return (
                              <>
                                {activeMembers.slice(0, 3).map((m) => (
                                  m.avatar ? (
                                    <img
                                      key={m.id}
                                      className="inline-block h-6 w-6 rounded-full ring-2 ring-[#161513] object-cover"
                                      src={m.avatar}
                                      alt={m.name}
                                    />
                                  ) : (
                                    <div key={m.id} className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${t.accentBg} ${t.accentText} text-[8px] font-bold ring-2 ring-[#161513]`}>
                                      {m.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  )
                                ))}
                                {activeMembers.length > 3 && (
                                  <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${t.tagAdmin} text-[8px] font-bold ring-2 ring-[#161513]`}>
                                    +{activeMembers.length - 3}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => {
                        const el = document.getElementById('roster-timeline');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          triggerToast('Weekly shift timeline is below.', 'info');
                        }
                      }}
                      className={`w-full py-3 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none`}
                    >
                      Manage Schedule
                    </button>
                  </div>

                  {/* Role Distribution Card */}
                  <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-5`}>
                    <div className={`border-b ${t.border} pb-3 select-none`}>
                      <h3 className={`font-serif text-sm ${t.text} font-bold tracking-wide`}>Role Distribution</h3>
                      <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Current active personnel breakdown.</p>
                    </div>

                    <div className="space-y-4 font-sans select-none">
                      {(() => {
                        const total = staffMembers.length || 1;
                        const fohCount = staffMembers.filter(m => ['Cashier', 'Waiter'].includes(m.role)).length;
                        const kitchenCount = staffMembers.filter(m => ['KDS'].includes(m.role)).length;
                        const mgmtCount = staffMembers.filter(m => ['Manager'].includes(m.role)).length;
                        const customerCount = staffMembers.filter(m => ['Customer'].includes(m.role)).length;
                        const supportCount = total - fohCount - kitchenCount - mgmtCount - customerCount;

                        const fohPct = Math.round((fohCount / total) * 100);
                        const kitchenPct = Math.round((kitchenCount / total) * 100);
                        const mgmtPct = Math.round((mgmtCount / total) * 100);
                        const customerPct = Math.round((customerCount / total) * 100);
                        const supportPct = Math.round((supportCount / total) * 100);

                        return (
                          <>
                            {/* FOH */}
                            <div className="space-y-1.5">
                              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                                <span>Front of House</span>
                                <span className={t.accent}>{fohPct}%</span>
                              </div>
                              <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                                <div className={`${t.accentBg} h-full rounded-full`} style={{ width: `${fohPct}%` }}></div>
                              </div>
                            </div>

                            {/* Kitchen */}
                            <div className="space-y-1.5">
                              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                                <span>Kitchen Staff (KDS)</span>
                                <span className={t.accent}>{kitchenPct}%</span>
                              </div>
                              <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                                <div className={`${t.accentBg} h-full rounded-full`} style={{ width: `${kitchenPct}%` }}></div>
                              </div>
                            </div>

                            {/* Management */}
                            <div className="space-y-1.5">
                              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                                <span>Management</span>
                                <span className={t.accent}>{mgmtPct}%</span>
                              </div>
                              <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                                <div className={`${t.accentBg} h-full rounded-full`} style={{ width: `${mgmtPct}%` }}></div>
                              </div>
                            </div>

                            {/* Customer */}
                            <div className="space-y-1.5">
                              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                                <span>Customer Accounts</span>
                                <span className={t.accent}>{customerPct}%</span>
                              </div>
                              <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                                <div className={`${t.accentBg} h-full rounded-full`} style={{ width: `${customerPct}%` }}></div>
                              </div>
                            </div>

                            {/* Support / Cleaning */}
                            <div className="space-y-1.5">
                              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                                <span>Support / Other</span>
                                <span className={t.accent}>{supportPct}%</span>
                              </div>
                              <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                                <div className={`${t.accentBg} h-full rounded-full`} style={{ width: `${supportPct}%` }}></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

              </div>

              {/* Roster & Weekly Timeline Section */}
              <div id="roster-timeline" className={`${t.cardBg} border rounded-2xl p-7 shadow-xl space-y-6`}>
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center border-b ${t.border} pb-4 gap-4 select-none`}>
                  <div>
                    <h3 className={`font-serif text-lg ${t.text} font-medium tracking-wide`}>Roster & Weekly Timeline</h3>
                    <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>November 13 - November 19, 2025</p>
                  </div>
                  
                  {/* Timeline selector */}
                  <div className={`flex items-center gap-1 ${t.inputBg} p-1 rounded-xl border ${t.border}`}>
                    <button type="button"
                      onClick={() => setTimelineTab('timeline')}
                      className={`px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        timelineTab === 'timeline'
                          ? `${t.accentBg} ${t.accentText}`
                          : `${t.textMuted} hover:${t.text}`
                      }`}
                    >
                      Timeline
                    </button>
                    <button type="button"
                      onClick={() => setTimelineTab('month')}
                      className={`px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        timelineTab === 'month'
                          ? `${t.accentBg} ${t.accentText}`
                          : `${t.textMuted} hover:${t.text}`
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto select-none">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className={`border-b ${t.border} text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest ${t.inputBg}/20`}>
                        <th className="px-6 py-4">STAFF</th>
                        <th className="px-4 py-4 text-center">MON 13</th>
                        <th className="px-4 py-4 text-center">TUE 14</th>
                        <th className="px-4 py-4 text-center">WED 15</th>
                        <th className="px-4 py-4 text-center">THU 16</th>
                        <th className="px-4 py-4 text-center">FRI 17</th>
                        <th className="px-4 py-4 text-center">SAT 18</th>
                        <th className="px-4 py-4 text-center">SUN 19</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.divider} font-sans text-xs text-[#A69984]/80`}>
                      
                      {staffMembers.map((member) => (
                        <tr key={member.id} className={`hover:${t.cardHover} transition-colors`}>
                          <td className={`px-6 py-4 font-bold ${t.text}`}>
                            <div>{member.name}</div>
                            <div className={`text-[9px] ${t.accentLight} uppercase tracking-wider font-semibold mt-0.5`}>{member.role}</div>
                          </td>
                          {['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'].map(day => {
                            const shift = rosterShifts[member.name]?.[day] || 'OFF';
                            const isSpecial = shift === '09:00 - 22:00';
                            const isOff = shift === 'OFF';
                            return (
                              <td key={day} className={`px-4 py-4 text-center cursor-pointer hover:${t.cardHover} transition-colors`} onClick={() => setEditingShift({ employee: member.name, day })}>
                                {isOff ? (
                                  <span className={`text-[10px] font-bold ${t.textMutedDark} uppercase tracking-wider`}>OFF</span>
                                ) : isSpecial ? (
                                  <span className={`px-3 py-1.5 ${t.accentLightBg} border ${t.accentLightBorder} ${t.accent} font-bold font-mono text-[10px] rounded-lg shadow-sm`}>
                                    {shift}
                                  </span>
                                ) : (
                                  <span className={`text-[10px] font-medium font-mono ${t.textMuted}`}>{shift}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>

      {/* STAFF MODALS JSX */}
            {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[380px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Edit Shift</h3>
              <button type="button" 
                onClick={() => setEditingShift(null)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Employee</p>
                <p className={`${t.text} font-bold mt-1 text-sm`}>{editingShift.employee}</p>
              </div>
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Day</p>
                <p className={`${t.text} font-semibold mt-1 text-xs`}>{editingShift.day}</p>
              </div>
              
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Shift Time</label>
                <div className="relative">
                  <select
                    aria-label="Shift time"
                    value={rosterShifts[editingShift.employee]?.[editingShift.day] || 'OFF'}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setRosterShifts(prev => ({
                        ...prev,
                        [editingShift.employee]: {
                          ...prev[editingShift.employee],
                          [editingShift.day]: newTime
                        }
                      }));
                      setEditingShift(null);
                      triggerToast(`Updated shift for ${editingShift.employee} on ${editingShift.day} to ${newTime}`, 'success');
                      setAuditLogs(prev => [
                        {
                          id: Date.now(),
                          time: 'Just now',
                          actor: 'Admin',
                          action: `Assigned ${editingShift.employee} shift on ${editingShift.day} to ${newTime}`,
                          type: 'info'
                        },
                        ...prev
                      ]);
                    }}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="OFF">OFF (Rest Day)</option>
                    <option value="09:00 - 17:00">09:00 - 17:00 (Morning)</option>
                    <option value="10:00 - 18:00">10:00 - 18:00 (Day)</option>
                    <option value="14:00 - 22:00">14:00 - 22:00 (Mid/Swing)</option>
                    <option value="16:00 - 00:00">16:00 - 00:00 (Dinner)</option>
                    <option value="22:00 - 02:00">22:00 - 02:00 (Late Night)</option>
                    <option value="09:00 - 22:00">09:00 - 22:00 (Double)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button type="button" 
                onClick={() => setEditingShift(null)}
                className={`w-full py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD/EDIT EMPLOYEE MODAL */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up font-sans`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <button type="button" 
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setEditingEmployee(null);
                  setNewEmployee({
                    name: '',
                    email: '',
                    password: '',
                    role: 'Waiter',
                    status: 'OFF_DUTY',
                    performance: 5.0
                  });
                  setSelectedPermissions([]);
                }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newEmployee.name.trim()) {
                triggerToast('Please enter an employee name.', 'info');
                return;
              }
              if (!newEmployee.email.trim()) {
                triggerToast('Please enter an email address.', 'info');
                return;
              }
              if (!editingEmployee && (!newEmployee.password || newEmployee.password.length < 8)) {
                triggerToast('Password must be at least 8 characters.', 'info');
                return;
              }
              if (newEmployee.password && newEmployee.password.length < 8) {
                triggerToast('Password must be at least 8 characters.', 'info');
                return;
              }

              if (isDemoTenant()) {
                if (editingEmployee) {
                  const updatedMembers = staffMembers.map(member => 
                    member.id === editingEmployee.id 
                      ? { ...member, name: newEmployee.name, email: newEmployee.email, role: newEmployee.role, status: newEmployee.status, performance: newEmployee.performance, custom_permissions: selectedPermissions }
                      : member
                  );
                  setStaffMembers(updatedMembers);
                  localStorage.setItem('dinepos_staff_admin', JSON.stringify(updatedMembers));
                  await recordActivity(
                    'staff_updated',
                    `Updated details for employee ${newEmployee.name}`,
                    'Staff',
                    { id: editingEmployee.id, role: newEmployee.role }
                  );
                  triggerToast(`Successfully updated employee ${newEmployee.name}!`, 'success');
                } else {
                  const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
                  const addedMember = {
                    id: newId,
                    name: newEmployee.name,
                    email: newEmployee.email,
                    role: newEmployee.role,
                    status: newEmployee.status,
                    performance: newEmployee.performance,
                    avatar: '',
                    custom_permissions: selectedPermissions
                  };
                  const updated = [...staffMembers, addedMember];
                  setStaffMembers(updated);
                  localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
                  await recordActivity(
                    'staff_created',
                    `Created employee ${newEmployee.name} with role ${newEmployee.role}`,
                    'Staff',
                    { id: newId, role: newEmployee.role }
                  );
                  triggerToast(`Successfully added employee ${addedMember.name}!`, 'success');
                }
              } else {
                try {
                  if (editingEmployee) {
                    const updatePayload: any = {
                      name: newEmployee.name,
                      email: newEmployee.email,
                      role: uiToDbRole(newEmployee.role),
                      custom_permissions: selectedPermissions
                    };
                    if (newEmployee.password) {
                      updatePayload.password = newEmployee.password;
                    }
                    const res = await apiRequest(`/api/tenant/users/${editingEmployee.id}`, {
                      method: 'PUT',
                      body: JSON.stringify(updatePayload)
                    });
                    if (res.success) {
                      triggerToast(`Successfully updated employee ${newEmployee.name}!`, 'success');
                      await recordActivity(
                        'staff_updated',
                        `Updated details for employee ${newEmployee.name}`,
                        'Staff',
                        { id: editingEmployee.id, role: newEmployee.role }
                      );
                      await loadStaffMembers();
                    } else if (res.isOfflineFallback) {
                      const updatedMembers = staffMembers.map(member => 
                        member.id === editingEmployee.id 
                          ? { ...member, name: newEmployee.name, email: newEmployee.email, role: newEmployee.role, status: newEmployee.status, performance: newEmployee.performance, custom_permissions: selectedPermissions }
                          : member
                      );
                      setStaffMembers(updatedMembers);
                      localStorage.setItem('dinepos_staff_admin', JSON.stringify(updatedMembers));
                      triggerToast(`Successfully updated employee ${newEmployee.name} (Offline Mode)!`, 'success');
                    } else {
                      triggerToast(res.error || 'Failed to update employee.', 'info');
                      return;
                    }
                  } else {
                    const createPayload = {
                      name: newEmployee.name,
                      email: newEmployee.email,
                      password: newEmployee.password,
                      role: uiToDbRole(newEmployee.role),
                      custom_permissions: selectedPermissions
                    };
                    const res = await apiRequest('/api/tenant/users', {
                      method: 'POST',
                      body: JSON.stringify(createPayload)
                    });
                    if (res.success && res.data) {
                      triggerToast(`Successfully added employee ${newEmployee.name}!`, 'success');
                      await recordActivity(
                        'staff_created',
                        `Created employee ${newEmployee.name} with role ${newEmployee.role}`,
                        'Staff',
                        { id: res.data.id, role: newEmployee.role }
                      );
                      await loadStaffMembers();
                    } else if (res.isOfflineFallback) {
                      const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
                      const addedMember = {
                        id: newId,
                        name: newEmployee.name,
                        email: newEmployee.email,
                        role: newEmployee.role,
                        status: newEmployee.status || 'OFF_DUTY',
                        performance: newEmployee.performance || 5.0,
                        avatar: '',
                        custom_permissions: selectedPermissions
                      };
                      const updated = [...staffMembers, addedMember];
                      setStaffMembers(updated);
                      localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
                      triggerToast(`Successfully added employee ${addedMember.name} (Offline Mode)!`, 'success');
                    } else {
                      triggerToast(res.error || 'Failed to create employee.', 'info');
                      return;
                    }
                  }
                } catch (err: any) {
                  console.error('Save staff error:', err);
                  // Offline fallback on exception
                  const newId = editingEmployee?.id || `EMP-${Math.floor(100 + Math.random() * 900)}`;
                  const memberObj = {
                    id: newId,
                    name: newEmployee.name,
                    email: newEmployee.email,
                    role: newEmployee.role,
                    status: newEmployee.status || 'OFF_DUTY',
                    performance: newEmployee.performance || 5.0,
                    avatar: '',
                    custom_permissions: selectedPermissions
                  };
                  let updated;
                  if (editingEmployee) {
                    updated = staffMembers.map(m => m.id === editingEmployee.id ? memberObj : m);
                  } else {
                    updated = [...staffMembers, memberObj];
                  }
                  setStaffMembers(updated);
                  localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
                  triggerToast(`Successfully ${editingEmployee ? 'updated' : 'added'} employee ${newEmployee.name}!`, 'success');
                }
              }

              setShowAddEmployeeModal(false);
              setEditingEmployee(null);
              setNewEmployee({
                name: '',
                email: '',
                password: '',
                role: 'Waiter',
                status: 'OFF_DUTY',
                performance: 5.0
              });
              setSelectedPermissions([]);
            }} className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Full Name</label>
                <input 
                  type="text" 
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Email Address</label>
                <input 
                  type="email" 
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="e.g. john@example.com"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>
                  Password {editingEmployee && <span className="opacity-50">(Leave blank to keep current)</span>}
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={showPasswordInModal ? "text" : "password"} 
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    placeholder={editingEmployee ? "••••••••" : "At least 8 characters"}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-4 pr-11 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                    required={!editingEmployee}
                    minLength={editingEmployee ? undefined : 8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-3.5 text-[#A69984]/60 hover:text-[#ffe2ab] transition-colors cursor-pointer flex items-center justify-center p-1"
                    title={showPasswordInModal ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-base select-none">
                      {showPasswordInModal ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Role</label>
                <div className="relative">
                  <select
                    aria-label="Employee role"
                    value={newEmployee.role}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      setNewEmployee({...newEmployee, role: selectedRole});
                      const dbRole = uiToDbRole(selectedRole);
                      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[dbRole as UserRole] || [];
                      setSelectedPermissions(defaultPerms);
                    }}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Waiter">Waiter</option>
                    <option value="KDS">KDS</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Custom Access Features selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider`}>
                    User Access Features ({selectedPermissions.length} selected)
                  </label>
                  <div className="flex gap-2 text-[9px] font-bold uppercase tracking-wider select-none">
                    <button 
                      type="button"
                      onClick={() => {
                        const allPerms = FEATURE_GROUPS.flatMap(g => g.permissions.map(p => p.key));
                        setSelectedPermissions(allPerms);
                      }}
                      className={`${t.accent} hover:underline cursor-pointer`}
                    >
                      Select All
                    </button>
                    <span className="text-white/20">|</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-white/40 hover:text-white hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className={`w-full max-h-[200px] overflow-y-auto ${t.inputBg} border ${t.inputBorder} rounded-xl p-4 space-y-4 font-sans`}>
                  {FEATURE_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <div className={`text-[9.5px] font-bold uppercase tracking-wider text-[#ffe2ab]/70 border-b border-white/5 pb-1`}>
                        {group.title}
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-1">
                        {group.permissions.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          return (
                            <label key={perm.key} className={`flex items-start gap-2.5 text-[11px] font-semibold text-white/90 cursor-pointer select-none`}>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedPermissions(selectedPermissions.filter(p => p !== perm.key));
                                  } else {
                                    setSelectedPermissions([...selectedPermissions, perm.key]);
                                  }
                                }}
                                className="rounded border-white/10 bg-black/40 text-amber-500 focus:ring-amber-500/50 w-4 h-4 cursor-pointer mt-0.5"
                              />
                              <span className="leading-tight">{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Status</label>
                <div className="relative">
                  <select
                    aria-label="Employee status"
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="ON_SHIFT">On Shift</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="OVERTIME">Approaching (Overtime)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Performance */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>
                  {editingEmployee ? 'Rating' : 'Initial Rating'}
                </label>
                <div className="relative">
                  <select
                    aria-label="Initial rating"
                    value={newEmployee.performance}
                    onChange={(e) => setNewEmployee({...newEmployee, performance: parseFloat(e.target.value)})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="5.0">5.0 Star (Excellent)</option>
                    <option value="4.8">4.8 Star (Very Good)</option>
                    <option value="4.5">4.5 Star (Good)</option>
                    <option value="4.0">4.0 Star (Satisfactory)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button"
                  onClick={() => {
                    setShowAddEmployeeModal(false);
                    setEditingEmployee(null);
                    setNewEmployee({
                      name: '',
                      email: '',
                      password: '',
                      role: 'Waiter',
                      status: 'OFF_DUTY',
                      performance: 5.0
                    });
                    setSelectedPermissions([]);
                  }}
                  className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
                >
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                >
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Delete Confirmation Popup */}
      <ConfirmDeleteModal
        isOpen={!!deleteMemberTarget}
        onClose={() => setDeleteMemberTarget(null)}
        onConfirm={async () => {
          if (!deleteMemberTarget) return;
          const member = deleteMemberTarget;
          if (isDemoTenant()) {
            const updated = staffMembers.filter(m => m.id !== member.id);
            setStaffMembers(updated);
            localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
            triggerToast(`Successfully deleted employee ${member.name}!`, 'success');
          } else {
            try {
              const res = await apiRequest(`/api/tenant/users/${member.id}`, { method: 'DELETE' });
              if (res.success) {
                triggerToast(`Successfully deleted employee ${member.name}!`, 'success');
                await loadStaffMembers();
              } else if (res.isOfflineFallback) {
                const updated = staffMembers.filter(m => m.id !== member.id);
                setStaffMembers(updated);
                localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
                triggerToast(`Successfully deleted employee ${member.name}!`, 'success');
              } else {
                triggerToast(res.error || 'Failed to delete staff user.', 'info');
              }
            } catch (err) {
              console.error('Delete error:', err);
              const updated = staffMembers.filter(m => m.id !== member.id);
              setStaffMembers(updated);
              localStorage.setItem('dinepos_staff_admin', JSON.stringify(updated));
              triggerToast(`Successfully deleted employee ${member.name}!`, 'success');
            }
          }
          await recordActivity('staff_deleted', `Deleted employee ${member.name}`, 'Staff', { id: member.id, role: member.role });
          setDeleteMemberTarget(null);
        }}
        title="Delete Employee"
        description={`Do you want to delete employee "${deleteMemberTarget?.name}"?`}
      />
    </>
  );
}
