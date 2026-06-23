'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'break' | 'off';
  shiftStart: string;
  shiftEnd: string;
  hoursWorked: number;
  tableAssignments: string[];
  phone: string;
}

const staffData: StaffMember[] = [
  {
    id: 's1',
    name: 'J. Smith',
    role: 'General Manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
    status: 'active',
    shiftStart: '09:00',
    shiftEnd: '21:00',
    hoursWorked: 7.5,
    tableAssignments: [],
    phone: '+81 90-1111-2221'
  },
  {
    id: 's2',
    name: 'Michael T.',
    role: 'Head Waiter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
    status: 'active',
    shiftStart: '11:00',
    shiftEnd: '23:00',
    hoursWorked: 5.2,
    tableAssignments: ['Table 12', 'Table 14', 'Table 16'],
    phone: '+81 90-1111-2222'
  },
  {
    id: 's3',
    name: 'Sarah J.',
    role: 'Waitress',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
    status: 'active',
    shiftStart: '12:00',
    shiftEnd: '22:00',
    hoursWorked: 4.8,
    tableAssignments: ['Table 04', 'Table 06'],
    phone: '+81 90-1111-2223'
  },
  {
    id: 's4',
    name: 'Alex D.',
    role: 'Bartender',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop',
    status: 'active',
    shiftStart: '15:00',
    shiftEnd: '01:00',
    hoursWorked: 2.0,
    tableAssignments: ['Bar 01', 'Bar 02'],
    phone: '+81 90-1111-2224'
  },
  {
    id: 's5',
    name: 'Elena R.',
    role: 'Chef de Partie',
    avatar: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=120&auto=format&fit=crop',
    status: 'break',
    shiftStart: '10:00',
    shiftEnd: '22:00',
    hoursWorked: 6.0,
    tableAssignments: [],
    phone: '+81 90-1111-2225'
  },
  {
    id: 's6',
    name: 'Marcus L.',
    role: 'Sous Chef',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120&auto=format&fit=crop',
    status: 'active',
    shiftStart: '10:00',
    shiftEnd: '22:00',
    hoursWorked: 6.1,
    tableAssignments: [],
    phone: '+81 90-1111-2226'
  },
  {
    id: 's7',
    name: 'Priya K.',
    role: 'Host / Hostess',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=120&auto=format&fit=crop',
    status: 'active',
    shiftStart: '11:00',
    shiftEnd: '21:00',
    hoursWorked: 5.5,
    tableAssignments: ['Reception'],
    phone: '+81 90-1111-2227'
  },
  {
    id: 's8',
    name: 'Tom B.',
    role: 'Busboy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
    status: 'off',
    shiftStart: '—',
    shiftEnd: '—',
    hoursWorked: 0,
    tableAssignments: [],
    phone: '+81 90-1111-2228'
  }
];

const statusConfig = {
  active: { label: 'On Shift', dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/20' },
  break:  { label: 'On Break', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', badge: 'bg-amber-400/10 border-amber-400/20' },
  off:    { label: 'Off Duty', dot: 'bg-white/20', text: 'text-white/30', badge: 'bg-white/5 border-white/10' }
};

const roleColors: Record<string, string> = {
  'General Manager': 'text-[#ffe2ab]',
  'Head Waiter': 'text-sky-400',
  'Waitress': 'text-sky-400',
  'Bartender': 'text-purple-400',
  'Chef de Partie': 'text-rose-400',
  'Sous Chef': 'text-rose-400',
  'Host / Hostess': 'text-teal-400',
  'Busboy': 'text-white/40',
};

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
];

const ALL_TABLES = [
  'Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05', 'Table 06',
  'Table 10', 'Table 12', 'Table 14', 'Table 16', 'Bar 01', 'Bar 02', 'Reception'
];

export default function PosStaffPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'break' | 'off'>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);
  const [isAssignTablesOpen, setIsAssignTablesOpen] = useState(false);
  const [memberToAssign, setMemberToAssign] = useState<StaffMember | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  // Add/Edit Form States
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Waitress');
  const [formStatus, setFormStatus] = useState<'active' | 'break' | 'off'>('active');
  const [formPhone, setFormPhone] = useState('');
  const [formShiftStart, setFormShiftStart] = useState('12:00');
  const [formShiftEnd, setFormShiftEnd] = useState('22:00');
  const [formHoursWorked, setFormHoursWorked] = useState(0);
  const [formAvatar, setFormAvatar] = useState(presetAvatars[2]);

  useEffect(() => {
    const stored = localStorage.getItem('dinepos_staff_roster');
    if (stored) {
      try {
        setStaff(JSON.parse(stored));
      } catch {
        setStaff(staffData);
      }
    } else {
      setStaff(staffData);
      localStorage.setItem('dinepos_staff_roster', JSON.stringify(staffData));
    }
  }, []);

  const saveStaff = (updated: StaffMember[]) => {
    setStaff(updated);
    localStorage.setItem('dinepos_staff_roster', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const updateMemberStatus = (id: string, newStatus: 'active' | 'break' | 'off') => {
    const updated = staff.map(s => {
      if (s.id === id) {
        let shiftStart = s.shiftStart;
        let shiftEnd = s.shiftEnd;
        let hoursWorked = s.hoursWorked;

        if (newStatus === 'active' && s.status === 'off') {
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          shiftStart = `${hh}:${mm}`;
          shiftEnd = '22:00';
          triggerToast(`${s.name} clocked in at ${shiftStart}`);
        } else if (newStatus === 'off') {
          shiftStart = '—';
          shiftEnd = '—';
          triggerToast(`${s.name} is now off duty`);
        } else if (newStatus === 'break') {
          triggerToast(`${s.name} is on break`);
        } else if (newStatus === 'active' && s.status === 'break') {
          triggerToast(`${s.name} returned from break`);
        }

        return { ...s, status: newStatus, shiftStart, shiftEnd, hoursWorked };
      }
      return s;
    });
    saveStaff(updated);
  };

  // CRUD helpers
  const openAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormRole('Waitress');
    setFormStatus('active');
    setFormPhone('');
    setFormShiftStart('12:00');
    setFormShiftEnd('22:00');
    setFormHoursWorked(0);
    setFormAvatar(presetAvatars[2]);
    setIsAddEditOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormStatus(member.status);
    setFormPhone(member.phone);
    setFormShiftStart(member.shiftStart);
    setFormShiftEnd(member.shiftEnd);
    setFormHoursWorked(member.hoursWorked);
    setFormAvatar(member.avatar);
    setIsAddEditOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      triggerToast('Please fill in all required fields.');
      return;
    }

    if (editingMember) {
      const updated = staff.map(s => {
        if (s.id === editingMember.id) {
          return {
            ...s,
            name: formName,
            role: formRole,
            status: formStatus,
            phone: formPhone,
            shiftStart: formShiftStart,
            shiftEnd: formShiftEnd,
            hoursWorked: formHoursWorked,
            avatar: formAvatar
          };
        }
        return s;
      });
      saveStaff(updated);
      triggerToast(`Staff profile for ${formName} updated.`);
    } else {
      const newMember: StaffMember = {
        id: `s-${Date.now()}`,
        name: formName,
        role: formRole,
        status: formStatus,
        phone: formPhone,
        shiftStart: formShiftStart,
        shiftEnd: formShiftEnd,
        hoursWorked: formHoursWorked,
        avatar: formAvatar,
        tableAssignments: []
      };
      saveStaff([...staff, newMember]);
      triggerToast(`New staff member ${formName} registered.`);
    }
    setIsAddEditOpen(false);
  };

  const openDeleteConfirm = (member: StaffMember) => {
    setMemberToDelete(member);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteMember = () => {
    if (!memberToDelete) return;
    const updated = staff.filter(s => s.id !== memberToDelete.id);
    saveStaff(updated);
    triggerToast(`${memberToDelete.name} removed from roster.`);
    setIsDeleteConfirmOpen(false);
  };

  const openAssignTablesModal = (member: StaffMember) => {
    setMemberToAssign(member);
    setSelectedTables(member.tableAssignments);
    setIsAssignTablesOpen(true);
  };

  const handleToggleTable = (table: string) => {
    setSelectedTables(prev => 
      prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
    );
  };

  const handleSaveAssignments = () => {
    if (!memberToAssign) return;
    const updated = staff.map(s => {
      if (s.id === memberToAssign.id) {
        return { ...s, tableAssignments: selectedTables };
      }
      return s;
    });
    saveStaff(updated);
    triggerToast(`Table assignments updated for ${memberToAssign.name}`);
    setIsAssignTablesOpen(false);
  };

  const filtered = staff.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = staff.filter(s => s.status === 'active').length;
  const breakCount = staff.filter(s => s.status === 'break').length;
  const offCount = staff.filter(s => s.status === 'off').length;

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">

      {/* SIDEBAR */}
      <aside className={`bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-0 p-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] p-8 opacity-100'
      }`}>
        <div>
          {/* Brand */}
          <div className="mb-10 flex items-center">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 mr-3">
              <span className="material-symbols-outlined text-[19px] font-black leading-none text-[#ffe2ab]">flatware</span>
            </div>
            <div>
              <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-[22px] tracking-wide block hover:opacity-85 transition-opacity leading-none">
                DinePosAi
              </Link>
              <span className="font-sans text-[8.5px] text-[#ffe2ab]/70 uppercase tracking-[0.2em] font-semibold mt-1 block">
                Premium Suite
              </span>
            </div>
          </div>

          {/* Order Action Buttons */}
          <div className="grid grid-cols-1 gap-2 mb-8 select-none">
            <Link
              href="/pos?newOrder=table"
              className="w-full py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-bold">add</span>
              New Table Order
            </Link>
            <Link
              href="/pos?newOrder=walkin"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#ffe2ab] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-bold">shopping_bag</span>
              Walk-in Customer
            </Link>
          </div>

          {/* Nav */}
          <nav className="space-y-1.5 font-sans">
            <Link href="/pos" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">layers</span>
              Floor Map
            </Link>
            <Link href="/pos/history" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">receipt_long</span>
              Orders
            </Link>

            {/* Staff — active */}
            <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-white border border-white/10 relative shadow">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none">groups</span>
                Staff
              </div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ffe2ab] rounded-l"></span>
            </div>
            <Link href="/pos/analytics" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
              Analytics
            </Link>
            <Link href="/pos/discounts" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300">
              <span className="material-symbols-outlined text-lg leading-none">sell</span>
              Discounts
            </Link>
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 font-sans space-y-4">
          <Link href="/pos/settings" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>
          <Link href="/support" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">help</span>
            Support
          </Link>
          <Link href="/login" className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-semibold text-xs w-full uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="J. Smith avatar"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-bold text-xs tracking-wide truncate">J. Smith</div>
              <div className="text-[8px] text-[#ffe2ab]/70 font-bold tracking-wider uppercase mt-0.5">General Manager</div>
            </div>
          </div>
        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* MAIN CONTENT */}
      <div className="flex-grow flex flex-col min-h-screen bg-[#11100e] overflow-hidden">

        {/* Header */}
        <header className="h-[90px] border-b border-white/5 flex items-center justify-between px-10 flex-shrink-0 bg-[#0e0e0d] sticky top-0 z-40">
          <div>
            <h2 className="font-serif text-[20px] font-bold text-white tracking-wide leading-none">Staff Roster</h2>
            <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-1">Manage establishment roster and assignments</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-base">search</span>
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#161513] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-[200px] transition-colors"
              />
            </div>
            {/* Filter pills */}
            <div className="flex items-center bg-[#161513] border border-white/5 rounded-xl p-1 gap-1">
              {(['all', 'active', 'break', 'off'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterStatus === f
                      ? 'bg-[#ffe2ab] text-[#402d00]'
                      : 'text-[#A69984]/70 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'active' ? 'On Shift' : f === 'break' ? 'Break' : 'Off Duty'}
                </button>
              ))}
            </div>
            {/* Add Staff Button */}
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-xs font-bold">person_add</span>
              Add Staff
            </button>
          </div>
        </header>

        {/* Stats row */}
        <div className="px-10 py-6 grid grid-cols-3 gap-6 flex-shrink-0 select-none">
          {[
            { status: 'active', label: 'On Shift', value: activeCount, icon: 'how_to_reg', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
            { status: 'break', label: 'On Break', value: breakCount, icon: 'coffee', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
            { status: 'off', label: 'Off Duty', value: offCount, icon: 'person_off', color: 'text-white/30', bg: 'bg-white/5', border: 'border-white/10' },
          ].map(card => {
            const isSelected = filterStatus === card.status;
            return (
              <div 
                key={card.label} 
                onClick={() => setFilterStatus(prev => prev === card.status ? 'all' : card.status as any)}
                className={`bg-[#161513] border ${
                  isSelected ? 'border-[#ffe2ab]/40 ring-1 ring-[#ffe2ab]/20 shadow-[0_0_15px_rgba(255,226,171,0.05)]' : card.border
                } rounded-2xl p-5 flex items-center gap-5 cursor-pointer hover:border-white/15 hover:scale-[1.01] transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center ${card.color}`}>
                  <span className="material-symbols-outlined text-lg">{card.icon}</span>
                </div>
                <div>
                  <p className="text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest">{card.label}</p>
                  <h3 className={`text-3xl font-bold font-mono ${card.color} mt-0.5`}>{card.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff grid */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(member => {
              const sc = statusConfig[member.status];
              const roleColor = roleColors[member.role] || 'text-[#A69984]';
              return (
                <div
                  key={member.id}
                  className="bg-[#161513] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 hover:border-white/10 transition-all duration-300 group"
                >
                  {/* Top row: avatar + name + status picker */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-[52px] h-[52px] rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Status dot */}
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#161513] ${sc.dot}`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm tracking-wide leading-none truncate">{member.name}</div>
                      <div className={`text-[10px] font-bold tracking-wider mt-1 ${roleColor}`}>{member.role}</div>
                    </div>
                    
                    {/* Status Dropdown Picker */}
                    <div className="relative">
                      <select 
                        value={member.status}
                        onChange={(e) => updateMemberStatus(member.id, e.target.value as any)}
                        className={`px-2 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider bg-[#161513] focus:outline-none hover:bg-white/[0.02] cursor-pointer appearance-none pr-6 ${sc.badge} ${sc.text}`}
                        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 2px center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
                      >
                        <option value="active" className="bg-[#161513] text-emerald-400 font-sans">On Shift</option>
                        <option value="break" className="bg-[#161513] text-amber-400 font-sans">On Break</option>
                        <option value="off" className="bg-[#161513] text-white/40 font-sans">Off Duty</option>
                      </select>
                    </div>
                  </div>

                  {/* Shift info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#12110f] rounded-xl p-3 border border-white/5">
                      <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Shift</p>
                      <p className="text-xs text-white font-bold mt-1">
                        {member.shiftStart === '—' ? '— Off —' : `${member.shiftStart} – ${member.shiftEnd}`}
                      </p>
                    </div>
                    <div className="bg-[#12110f] rounded-xl p-3 border border-white/5">
                      <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Hours Today</p>
                      <p className="text-xs text-white font-bold mt-1">
                        {member.hoursWorked > 0 ? `${member.hoursWorked}h` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Table assignments */}
                  {member.tableAssignments.length > 0 ? (
                    <div>
                      <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider mb-2">Assigned Tables</p>
                      <div className="flex flex-wrap gap-1.5">
                        {member.tableAssignments.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-[#ffe2ab]/5 border border-[#ffe2ab]/15 text-[#ffe2ab]/80 text-[9px] font-bold rounded-lg uppercase tracking-wide">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider mb-1">Assigned Tables</p>
                      <span className="text-[10px] text-[#A69984]/35 font-medium italic">No tables assigned.</span>
                    </div>
                  )}

                  {/* Management row */}
                  <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => openAssignTablesModal(member)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-[#ffe2ab]/10 hover:text-[#ffe2ab] border border-white/5 text-[#A69984] text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">table_restaurant</span>
                      Assign
                    </button>
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69984] hover:text-white text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(member)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      Remove
                    </button>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => triggerToast(`Calling ${member.name}...`)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69984] hover:text-white text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">call</span>
                      Call
                    </button>
                    <button
                      onClick={() => triggerToast(`Sending message to ${member.name}...`)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69984] hover:text-white text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">chat_bubble</span>
                      Message
                    </button>
                    <button
                      onClick={() => triggerToast(`Requesting ${member.name} for table assistance...`)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#ffe2ab]/5 hover:bg-[#ffe2ab]/10 border border-[#ffe2ab]/15 text-[#ffe2ab] text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">notifications</span>
                      Page
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-5xl text-[#A69984]/20 mb-4">group_off</span>
              <p className="text-sm text-[#A69984]/40 font-semibold">No staff members match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-[500px] bg-[#161513] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a09]/55">
              <h3 className="font-serif text-sm text-white font-bold tracking-wide uppercase">
                {editingMember ? 'Edit Staff Profile' : 'Register New Staff'}
              </h3>
              <button 
                onClick={() => setIsAddEditOpen(false)}
                className="text-[#A69984] hover:text-white material-symbols-outlined text-lg cursor-pointer"
              >
                close
              </button>
            </div>
            
            <form onSubmit={handleSaveMember} className="p-6 space-y-5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah J."
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +81 90-1234-5678"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Operational Role</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30 cursor-pointer"
                  >
                    {Object.keys(roleColors).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Roster Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30 cursor-pointer"
                  >
                    <option value="active">On Shift</option>
                    <option value="break">On Break</option>
                    <option value="off">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Shift Start</label>
                  <input
                    type="text"
                    placeholder="12:00"
                    value={formShiftStart}
                    onChange={e => setFormShiftStart(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30 text-center font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Shift End</label>
                  <input
                    type="text"
                    placeholder="22:00"
                    value={formShiftEnd}
                    onChange={e => setFormShiftEnd(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30 text-center font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold">Hours Worked</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formHoursWorked}
                    onChange={e => setFormHoursWorked(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ffe2ab]/30 text-center font-mono"
                  />
                </div>
              </div>

              {/* Avatar Preset Grid */}
              <div className="space-y-2">
                <label className="text-[#A69984] uppercase tracking-wider text-[9px] font-bold block">Select Roster Profile Avatar</label>
                <div className="flex flex-wrap gap-2.5 p-3 bg-[#0a0a09]/45 border border-white/5 rounded-xl">
                  {presetAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer flex-shrink-0 ${
                        formAvatar === av ? 'border-[#ffc53d] scale-105 ring-2 ring-[#ffc53d]/25' : 'border-white/5 opacity-55 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Preset Headshot" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Assignment Modal */}
      {isAssignTablesOpen && memberToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-[460px] bg-[#161513] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a09]/55">
              <div>
                <h3 className="font-serif text-sm text-white font-bold tracking-wide uppercase">Table Assignments</h3>
                <p className="text-[10px] text-[#A69984]/50 font-bold mt-0.5 uppercase tracking-wide">Staff: {memberToAssign.name}</p>
              </div>
              <button 
                onClick={() => setIsAssignTablesOpen(false)}
                className="text-[#A69984] hover:text-white material-symbols-outlined text-lg cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {ALL_TABLES.map(table => {
                  const isChecked = selectedTables.includes(table);
                  return (
                    <div
                      key={table}
                      onClick={() => handleToggleTable(table)}
                      className={`p-3 border rounded-xl flex items-center gap-2 cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'bg-[#ffe2ab]/5 border-[#ffe2ab]/30 text-[#ffe2ab]'
                          : 'bg-[#0e0e0d]/50 border-white/5 text-[#A69984] hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm shrink-0">
                        {isChecked ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className="text-xs font-bold font-mono tracking-wide">{table}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 select-none pt-2">
                <button
                  onClick={() => setIsAssignTablesOpen(false)}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignments}
                  className="flex-1 py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-[400px] bg-[#161513] border border-rose-500/10 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-serif text-sm font-bold tracking-wide uppercase">Remove Staff Member?</h3>
            </div>
            <p className="text-xs text-[#A69984] leading-relaxed font-semibold">
              Are you sure you want to remove <span className="text-white font-bold">{memberToDelete.name}</span> ({memberToDelete.role}) from the active establishment roster? This action cannot be undone.
            </p>
            <div className="flex gap-3 select-none">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e1c19] border border-[#ffe2ab]/20 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-fade-in">
          <span className="material-symbols-outlined text-[#ffe2ab] text-base">check_circle</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
