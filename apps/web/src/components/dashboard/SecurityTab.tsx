'use client';

import React, { useState } from 'react';
import { isDemoTenant } from '@/utils/api';

interface SecurityTabProps {
  t: any;
  tr: any;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function SecurityTab({ t, tr, triggerToast }: SecurityTabProps) {
  const [editingRolePermissions, setEditingRolePermissions] = useState<string | null>(null);
  const [editingGlobalPermission, setEditingGlobalPermission] = useState<string | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [passcodeLength, setPasscodeLength] = useState('4');

  const [securityPermissions, setSecurityPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    if (typeof window !== 'undefined' && !isDemoTenant()) {
      return {} as Record<string, Record<string, boolean>>;
    }
    return {
      'Manager': { 'refundOrders': true, 'compDishes': true, 'reopenDays': true, 'editMenu': true, 'voidItems': true },
      'Server': { 'refundOrders': false, 'compDishes': false, 'reopenDays': false, 'editMenu': false, 'voidItems': true },
      'Bartender': { 'refundOrders': false, 'compDishes': true, 'reopenDays': false, 'editMenu': false, 'voidItems': true },
      'Line Cook': { 'refundOrders': false, 'compDishes': false, 'reopenDays': false, 'editMenu': false, 'voidItems': false },
    };
  });

  const [globalPermissions, setGlobalPermissions] = useState<Record<string, string>>({
    editReceiptConfig: 'Admin Only',
    voidTransactions: 'Manager+',
    accessAdminDashboard: 'Full Staff'
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    if (typeof window !== 'undefined' && !isDemoTenant()) {
      return [];
    }
    return [
      { id: 1, time: '10m ago', actor: 'Sarah Jenkins (Manager)', action: 'Authorized $42.00 check void', type: 'warning' },
      { id: 2, time: '42m ago', actor: 'Elena Rodriguez (Bartender)', action: 'Re-routed drink queue to Service Bar Printer', type: 'info' },
      { id: 3, time: '1h 15m ago', actor: 'System Auto-Daemon', action: 'Created night audit backup (db_dump_0603.sql)', type: 'success' },
      { id: 4, time: '3h ago', actor: 'Admin', action: 'Modified Stripe API keys', type: 'security' },
    ];
  });

  const togglePermission = (role: string, perm: string) => {
    setSecurityPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm]
      }
    }));
    triggerToast(`Updated ${perm} privilege for ${role}s.`, 'success');
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Admin',
        action: `Toggled ${perm} permission for ${role} role`,
        type: 'info'
      },
      ...prev
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-sans">
      {/* Header Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 select-none">
        <div>
          <h2 className={`font-serif text-[38px] font-bold ${t.accent} tracking-wide leading-none`}>
            {tr.security}
          </h2>
          <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
            {tr.securityDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Rules Matrix & Config (Span 7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Role Privileges */}
          <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-6 select-none`}>
            <div className="border-b border-white/5 pb-3 flex items-center gap-2">
              <span className={`material-symbols-outlined ${t.accent} text-lg`}>supervised_user_circle</span>
              <h3 className={`${t.text} font-serif text-sm font-bold tracking-wide`}>{tr.roleAccess}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted}`}>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-2 text-center">Refund</th>
                    <th className="py-3 px-2 text-center">Comp</th>
                    <th className="py-3 px-2 text-center">Void</th>
                    <th className="py-3 px-2 text-center">Reopen</th>
                    <th className="py-3 px-2 text-center">Menu</th>
                    <th className="py-3 px-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.divider} ${t.text} font-semibold`}>
                  {['Manager', 'Server', 'Bartender', 'Line Cook'].map((role) => (
                    <tr key={role} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-3 font-bold">{role}</td>
                      
                      {/* Refund */}
                      <td className="py-3.5 px-2 text-center">
                        <button type="button"
                          onClick={() => togglePermission(role, 'refundOrders')}
                          className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['refundOrders'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                        >
                          {securityPermissions[role]?.['refundOrders'] && (
                            <span className="material-symbols-outlined text-[10px] font-black text-black">check</span>
                          )}
                        </button>
                      </td>

                      {/* Comp */}
                      <td className="py-3.5 px-2 text-center">
                        <button type="button"
                          onClick={() => togglePermission(role, 'compDishes')}
                          className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['compDishes'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                        >
                          {securityPermissions[role]?.['compDishes'] && (
                            <span className="material-symbols-outlined text-[10px] font-black text-black">check</span>
                          )}
                        </button>
                      </td>

                      {/* Void */}
                      <td className="py-3.5 px-2 text-center">
                        <button type="button"
                          onClick={() => togglePermission(role, 'voidItems')}
                          className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['voidItems'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                        >
                          {securityPermissions[role]?.['voidItems'] && (
                            <span className="material-symbols-outlined text-[10px] font-black text-black">check</span>
                          )}
                        </button>
                      </td>

                      {/* Reopen */}
                      <td className="py-3.5 px-2 text-center">
                        <button type="button"
                          onClick={() => togglePermission(role, 'reopenDays')}
                          className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['reopenDays'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                        >
                          {securityPermissions[role]?.['reopenDays'] && (
                            <span className="material-symbols-outlined text-[10px] font-black text-black">check</span>
                          )}
                        </button>
                      </td>

                      {/* Menu */}
                      <td className="py-3.5 px-2 text-center">
                        <button type="button"
                          onClick={() => togglePermission(role, 'editMenu')}
                          className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['editMenu'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                        >
                          {securityPermissions[role]?.['editMenu'] && (
                            <span className="material-symbols-outlined text-[10px] font-black text-black">check</span>
                          )}
                        </button>
                      </td>

                      {/* Edit button */}
                      <td className="py-3.5 px-3 text-right">
                        <button type="button"
                          onClick={() => setEditingRolePermissions(role)}
                          className={`text-[#ffe2ab] hover:text-[#ffd685] transition-colors font-bold text-[10.5px] uppercase tracking-wider cursor-pointer`}
                        >
                          Configure
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Global Configuration Rules */}
          <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-6 select-none`}>
            <div className="border-b border-white/5 pb-3 flex items-center gap-2">
              <span className={`material-symbols-outlined ${t.accent} text-lg`}>gavel</span>
              <h3 className={`${t.text} font-serif text-sm font-bold tracking-wide`}>Global Rule Protocols</h3>
            </div>

            <div className="space-y-4 font-sans text-xs">
              
              <div className="flex justify-between items-center py-2">
                <div className="max-w-[70%]">
                  <h4 className={`font-bold ${t.text}`}>Edit Receipt Layout Config</h4>
                  <p className={`text-[10px] ${t.textMuted} mt-0.5 leading-relaxed`}>Required access level to customize footer messages and logo headers.</p>
                </div>
                <button type="button"
                  onClick={() => setEditingGlobalPermission('editReceiptConfig')}
                  className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 ${t.text} rounded-lg border border-white/5 transition-colors cursor-pointer text-[10px] font-bold`}
                >
                  {globalPermissions.editReceiptConfig}
                </button>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="max-w-[70%]">
                  <h4 className={`font-bold ${t.text}`}>Void Settled Credit Cards</h4>
                  <p className={`text-[10px] ${t.textMuted} mt-0.5 leading-relaxed`}>Required authority level to void finalized card transactions.</p>
                </div>
                <button type="button"
                  onClick={() => setEditingGlobalPermission('voidTransactions')}
                  className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 ${t.text} rounded-lg border border-white/5 transition-colors cursor-pointer text-[10px] font-bold`}
                >
                  {globalPermissions.voidTransactions}
                </button>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="max-w-[70%]">
                  <h4 className={`font-bold ${t.text}`}>Access Admin Dashboard console</h4>
                  <p className={`text-[10px] ${t.textMuted} mt-0.5 leading-relaxed`}>Required operational level to load dashboard metrics and config.</p>
                </div>
                <button type="button"
                  onClick={() => setEditingGlobalPermission('accessAdminDashboard')}
                  className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 ${t.text} rounded-lg border border-white/5 transition-colors cursor-pointer text-[10px] font-bold`}
                >
                  {globalPermissions.accessAdminDashboard}
                </button>
              </div>

            </div>
          </div>

          {/* Section 3: Passcode Settings & Session Timeout */}
          <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-6 select-none`}>
            <div className="border-b border-white/5 pb-3 flex items-center gap-2">
              <span className={`material-symbols-outlined ${t.accent} text-lg`}>settings_security</span>
              <h3 className={`${t.text} font-serif text-sm font-bold tracking-wide`}>System Security Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Passcode Length */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>{tr.passcodeLabel}</label>
                <div className="relative">
                  <select
                    aria-label="Passcode length"
                    value={passcodeLength}
                    onChange={(e) => {
                      setPasscodeLength(e.target.value);
                      triggerToast(`Default passcode length set to ${e.target.value} digits.`, 'success');
                      setAuditLogs(prev => [
                        { id: Date.now(), time: 'Just now', actor: 'Admin', action: `Set passcode length requirement to ${e.target.value} digits`, type: 'security' },
                        ...prev
                      ]);
                    }}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="4">4-Digit PIN</option>
                    <option value="6">6-Digit PIN</option>
                    <option value="8">8-Digit PIN</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
                </div>
              </div>

              {/* Session Timeout */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>{tr.timeoutLabel}</label>
                <div className="relative">
                  <select
                    aria-label="Session timeout"
                    value={sessionTimeout}
                    onChange={(e) => {
                      setSessionTimeout(e.target.value);
                      triggerToast(`Session auto-logout timer set to ${e.target.value} mins.`, 'success');
                      setAuditLogs(prev => [
                        { id: Date.now(), time: 'Just now', actor: 'Admin', action: `Set terminal auto-logout session timer to ${e.target.value} minutes`, type: 'security' },
                        ...prev
                      ]);
                    }}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="1">1 Minute</option>
                    <option value="5">5 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="0">Never Lock</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: Security Audit Log (Span 5) */}
        <div className="lg:col-span-5 space-y-6 select-none">
          
          {/* Audit Logs card */}
          <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-5 flex flex-col justify-between min-h-[420px]`}>
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${t.accent} text-lg`}>lock_open</span>
                  <h3 className={`${t.text} font-serif text-sm font-bold tracking-wide`}>{tr.auditTrail}</h3>
                </div>
                <button type="button"
                  onClick={() => {
                    setAuditLogs([]);
                    triggerToast('Administrative logs cleared.', 'info');
                  }}
                  className="text-[9px] font-bold uppercase tracking-wider text-[#A69984] hover:text-white transition-colors cursor-pointer"
                >
                  Clear Trails
                </button>
              </div>

              {/* Log entries */}
              <div className="space-y-4 mt-5 max-h-[300px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className={`text-center py-12 text-xs ${t.textMutedDark} font-bold uppercase tracking-wider`}>
                    No log trails recorded.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-[11px] leading-relaxed">
                      <span className={`material-symbols-outlined text-sm font-semibold mt-0.5 ${
                        log.type === 'warning' ? 'text-amber-400' :
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'security' ? 'text-purple-400' : t.accent
                      }`}>
                        {log.type === 'warning' ? 'warning' :
                         log.type === 'error' ? 'error' :
                         log.type === 'success' ? 'check_circle' :
                         log.type === 'security' ? 'vpn_key' : 'info'}
                      </span>
                      <div className="flex-grow font-sans">
                        <span className={`font-bold ${t.text} block`}>{log.actor}</span>
                        <span className={`${t.textMuted} block text-[10px] mt-0.5`}>{log.action}</span>
                      </div>
                      <span className={`text-[8.5px] ${t.textMutedDark} font-mono font-medium flex-shrink-0 mt-0.5`}>{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button type="button"
              onClick={() => triggerToast('Exporting secure system audit logs cryptographically...', 'success')}
              className={`w-full py-3 ${t.buttonOutline} border rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer mt-5`}
            >
              Export Sealed Audit PDF
            </button>
          </div>

        </div>

      </div>

      {/* EDIT ROLE PERMISSIONS MODAL */}
      {editingRolePermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[380px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Role Authority Configurations</h3>
              <button type="button"
                onClick={() => setEditingRolePermissions(null)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className={`text-[11.5px] ${t.textMuted} leading-relaxed font-semibold`}>
                Configure accessibility privileges for all staff members assigned the {editingRolePermissions} role.
              </p>

              <div className={`divide-y ${t.divider} max-h-[300px] overflow-y-auto pr-1`}>
                {Object.keys(securityPermissions[editingRolePermissions] || {}).map((permKey) => {
                  const permLabels: Record<string, { title: string; desc: string }> = {
                    refundOrders: { title: 'Refund Completed Orders', desc: 'Allow refunds on settled checks.' },
                    compDishes: { title: 'Comp Dishes / Drinks', desc: 'Permit checking off items as complimentary.' },
                    reopenDays: { title: 'Reopen Finished Days', desc: 'Ability to edit reports of closed registers.' },
                    editMenu: { title: 'Modify Menu Options', desc: 'Alter prices or item descriptions directly.' },
                    voidItems: { title: 'Void Placed Items', desc: 'Cancel sent tickets without billing.' }
                  };
                  const label = permLabels[permKey] || { title: permKey, desc: '' };
                  const isChecked = securityPermissions[editingRolePermissions]?.[permKey] || false;

                  return (
                    <div key={permKey} className="py-3.5 flex justify-between items-center select-none">
                      <div className="max-w-[75%]">
                        <h4 className={`text-xs font-bold ${t.text} tracking-wide`}>{label.title}</h4>
                        <p className={`text-[10px] ${t.textMutedDark} mt-0.5 font-semibold`}>{label.desc}</p>
                      </div>
                      <button type="button"
                        onClick={() => togglePermission(editingRolePermissions, permKey)}
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${isChecked ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${isChecked ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button type="button"
                  onClick={() => {
                    setEditingRolePermissions(null);
                    triggerToast('Role configuration saved successfully!', 'success');
                  }}
                  className={`w-full py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GLOBAL PERMISSIONS MATRIX MODAL */}
      {editingGlobalPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[380px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Global Rule Configuration</h3>
              <button type="button"
                onClick={() => setEditingGlobalPermission(null)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Setting Parameter</p>
                <p className={`${t.text} font-bold mt-1 text-xs`}>
                  {editingGlobalPermission === 'editReceiptConfig' ? 'Edit Receipt Configuration' : editingGlobalPermission === 'voidTransactions' ? 'Void Transactions' : 'Access Admin Dashboard'}
                </p>
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Required Access Level</label>
                <div className="relative">
                  <select
                    aria-label="Required access level"
                    value={globalPermissions[editingGlobalPermission] || ''}
                    onChange={(e) => {
                      const newLevel = e.target.value;
                      setGlobalPermissions(prev => ({
                        ...prev,
                        [editingGlobalPermission]: newLevel
                      }));
                      setEditingGlobalPermission(null);
                      triggerToast(`Updated required level to ${newLevel}`, 'success');
                    }}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="Admin Only">Admin Only</option>
                    <option value="Manager+">Manager+</option>
                    <option value="Full Staff">Full Staff</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="button"
                onClick={() => setEditingGlobalPermission(null)}
                className={`w-full py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
