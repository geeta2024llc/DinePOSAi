'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    phone: '+1 (555) 001-0001'
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
    phone: '+1 (555) 001-0002'
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
    phone: '+1 (555) 001-0003'
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
    phone: '+1 (555) 001-0004'
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
    phone: '+1 (555) 001-0005'
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
    phone: '+1 (555) 001-0006'
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
    phone: '+1 (555) 001-0007'
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
    phone: '+1 (555) 001-0008'
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

export default function PosStaffPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'break' | 'off'>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const filtered = staffData.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = staffData.filter(s => s.status === 'active').length;
  const breakCount = staffData.filter(s => s.status === 'break').length;
  const offCount = staffData.filter(s => s.status === 'off').length;

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">

      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between p-8 flex-shrink-0 z-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
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

      {/* MAIN CONTENT */}
      <div className="flex-grow flex flex-col min-h-screen bg-[#11100e] overflow-hidden">

        {/* Header */}
        <header className="h-[90px] border-b border-white/5 flex items-center justify-between px-10 flex-shrink-0 bg-[#0e0e0d] sticky top-0 z-40">
          <div>
            <h2 className="font-serif text-[20px] font-bold text-white tracking-wide leading-none">Staff on Shift</h2>
            <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-1">Read-only view · Today's roster</p>
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
          </div>
        </header>

        {/* Stats row */}
        <div className="px-10 py-6 grid grid-cols-3 gap-6 flex-shrink-0">
          {[
            { label: 'On Shift', value: activeCount, icon: 'how_to_reg', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
            { label: 'On Break', value: breakCount, icon: 'coffee', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
            { label: 'Off Duty', value: offCount, icon: 'person_off', color: 'text-white/30', bg: 'bg-white/5', border: 'border-white/10' },
          ].map(card => (
            <div key={card.label} className={`bg-[#161513] border ${card.border} rounded-2xl p-5 flex items-center gap-5`}>
              <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center ${card.color}`}>
                <span className="material-symbols-outlined text-lg">{card.icon}</span>
              </div>
              <div>
                <p className="text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest">{card.label}</p>
                <h3 className={`text-3xl font-bold font-mono ${card.color} mt-0.5`}>{card.value}</h3>
              </div>
            </div>
          ))}
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
                  {/* Top row: avatar + name + status */}
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
                    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${sc.badge} ${sc.text}`}>
                      {sc.label}
                    </span>
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
                  {member.tableAssignments.length > 0 && (
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
                  )}

                  {/* Action row */}
                  <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => triggerToast(`Calling ${member.name}...`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69984] hover:text-white text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">call</span>
                      Call
                    </button>
                    <button
                      onClick={() => triggerToast(`Sending message to ${member.name}...`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69984] hover:text-white text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">chat_bubble</span>
                      Message
                    </button>
                    <button
                      onClick={() => triggerToast(`Requesting ${member.name} for table assistance...`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#ffe2ab]/5 hover:bg-[#ffe2ab]/10 border border-[#ffe2ab]/15 text-[#ffe2ab] text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
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
