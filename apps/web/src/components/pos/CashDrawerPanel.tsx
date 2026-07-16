'use client';

import React, { useState } from 'react';
import { useCashDrawer } from '../../hooks/useCashDrawer';
import { usePrinter } from '../../../app/printerContext';

interface CashDrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CashDrawerPanel({ isOpen, onClose }: CashDrawerPanelProps) {
  const {
    openingBalance,
    movements,
    addCashIn,
    addCashOut,
    recordNoSale,
    resetDrawer,
    expectedBalance,
    cashSalesTotal,
    cashInTotal,
    cashOutTotal,
    refundsTotal,
    hasAccess,
  } = useCashDrawer();

  const { kickCashDrawer } = usePrinter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'summary' | 'cash_in' | 'cash_out' | 'history' | 'reset'>('summary');

  // Input States
  const [cashInAmt, setCashInAmt] = useState('');
  const [cashInReason, setCashInReason] = useState('Float Added');
  const [cashInNote, setCashInNote] = useState('');

  const [cashOutAmt, setCashOutAmt] = useState('');
  const [cashOutReason, setCashOutReason] = useState('Expense');
  const [cashOutNote, setCashOutNote] = useState('');

  const [noSaleReason, setNoSaleReason] = useState('Change for Customer');
  const [noSaleNote, setNoSaleNote] = useState('');

  const [newOpening, setNewOpening] = useState(openingBalance.toString());

  if (!isOpen) return null;

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
        <div className="w-full max-w-md bg-[#161513] border-l border-white/5 p-6 flex flex-col justify-between text-[#e5e2e1] font-sans">
          <div className="space-y-6 pt-10 text-center">
            <span className="material-symbols-outlined text-5xl text-rose-500">lock</span>
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Access Denied</h3>
            <p className="text-xs text-[#A69984]/70">
              Only authorized Owner, Manager, or Cashier roles are permitted to operate the cash drawer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    );
  }

  const handleCashInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cashInAmt);
    if (isNaN(amt) || amt <= 0) return;
    addCashIn(amt, cashInReason, cashInNote || undefined);
    setCashInAmt('');
    setCashInNote('');
    setActiveTab('summary');
  };

  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cashOutAmt);
    if (isNaN(amt) || amt <= 0) return;
    addCashOut(amt, cashOutReason, cashOutNote || undefined);
    setCashOutAmt('');
    setCashOutNote('');
    setActiveTab('summary');
  };

  const handleNoSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noSaleReason) return;
    recordNoSale(noSaleReason, noSaleNote || undefined);
    kickCashDrawer().catch(err => console.error('Cash drawer kick failed:', err));
    setNoSaleNote('');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newOpening);
    if (isNaN(amt) || amt < 0) return;
    resetDrawer(amt);
    setActiveTab('summary');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-[#161513] border-l border-white/5 p-6 flex flex-col justify-between text-[#e5e2e1] font-sans shadow-2xl">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffe2ab]">point_of_sale</span>
            <div>
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-white">Cash Drawer Console</h3>
              <p className="text-[10px] text-[#A69984]/60">Expected Balance: {formatCurrency(expectedBalance)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-[#A69984] hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-white/5 text-center mt-4">
          {(['summary', 'cash_in', 'cash_out', 'history', 'reset'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'border-[#ffe2ab] text-[#ffe2ab]' 
                  : 'border-transparent text-[#A69984]/70 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              
              {/* Balance Summary Card */}
              <div className="bg-[#0e0e0d] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="text-center pb-2 border-b border-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-[#A69984]">Expected Drawer Cash</div>
                  <div className="text-2xl font-serif font-bold text-white mt-1">{formatCurrency(expectedBalance)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[#A69984]/75">Opening Balance:</span>
                    <p className="font-semibold font-mono text-white">{formatCurrency(openingBalance)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#A69984]/75">Cash Sales:</span>
                    <p className="font-semibold font-mono text-emerald-400">+{formatCurrency(cashSalesTotal)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#A69984]/75">Cash In (Float/Inflows):</span>
                    <p className="font-semibold font-mono text-emerald-400">+{formatCurrency(cashInTotal)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#A69984]/75">Cash Out (Outflows):</span>
                    <p className="font-semibold font-mono text-rose-400">-{formatCurrency(cashOutTotal)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#A69984]/75">Refunds:</span>
                    <p className="font-semibold font-mono text-rose-400">-{formatCurrency(refundsTotal)}</p>
                  </div>
                </div>
              </div>

              {/* No Sale Quick open Form */}
              <form onSubmit={handleNoSaleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">No Sale / Open Drawer</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Reason for opening</label>
                    <select
                      value={noSaleReason}
                      onChange={e => setNoSaleReason(e.target.value)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option>Change for Customer</option>
                      <option>Float Audit</option>
                      <option>Supplier Direct Pay</option>
                      <option>Correction / Error</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Optional Note</label>
                    <input
                      type="text"
                      value={noSaleNote}
                      onChange={e => setNoSaleNote(e.target.value)}
                      placeholder="e.g. Broken lock check"
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    Open Drawer (No Sale)
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: CASH IN */}
          {activeTab === 'cash_in' && (
            <form onSubmit={handleCashInSubmit} className="space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Record Cash In (Inflow)</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cashInAmt}
                    onChange={e => setCashInAmt(e.target.value)}
                    placeholder="50.00"
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Reason</label>
                  <select
                    value={cashInReason}
                    onChange={e => setCashInReason(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option>Float Added</option>
                    <option>Extra Change</option>
                    <option>Owner Deposit</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={cashInNote}
                    onChange={e => setCashInNote(e.target.value)}
                    placeholder="e.g. Added $10 bills from safe"
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Confirm Cash In
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CASH OUT */}
          {activeTab === 'cash_out' && (
            <form onSubmit={handleCashOutSubmit} className="space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Record Cash Out (Outflow)</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cashOutAmt}
                    onChange={e => setCashOutAmt(e.target.value)}
                    placeholder="25.00"
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Reason</label>
                  <select
                    value={cashOutReason}
                    onChange={e => setCashOutReason(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option>Expense</option>
                    <option>Bank Deposit</option>
                    <option>Supplier Payment</option>
                    <option>Staff Advance</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={cashOutNote}
                    onChange={e => setCashOutNote(e.target.value)}
                    placeholder="e.g. Bought receipt rolls / supplier payout"
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Confirm Cash Out
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Recent Movements</h4>
              <div className="space-y-3">
                {movements.length === 0 ? (
                  <p className="text-xs text-[#A69984]/50 text-center py-4">No recent cash movements recorded.</p>
                ) : (
                  movements.slice(0, 15).map(m => (
                    <div key={m.id} className="bg-[#0e0e0d] border border-white/5 p-3.5 rounded-xl flex justify-between items-start gap-4 font-sans">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            m.type === 'CASH_IN' || m.type === 'CASH_SALE' ? 'bg-emerald-500/10 text-emerald-400' :
                            m.type === 'NO_SALE' ? 'bg-zinc-500/10 text-zinc-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {m.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-[#A69984]/65 font-mono">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-white/95 mt-1.5 font-medium">{m.reason}</p>
                        {m.note && <p className="text-[10px] text-[#A69984]/60 mt-0.5 font-serif italic">"{m.note}"</p>}
                        <p className="text-[9px] text-[#A69984]/50 mt-1">Logged by: {m.userName}</p>
                      </div>
                      <span className={`text-xs font-mono font-bold ${
                        m.type === 'CASH_IN' || m.type === 'CASH_SALE' ? 'text-emerald-400' :
                        m.type === 'NO_SALE' ? 'text-zinc-400' : 'text-rose-400'
                      }`}>
                        {m.type === 'CASH_IN' || m.type === 'CASH_SALE' ? '+' :
                         m.type === 'NO_SALE' ? '' : '-'}{formatCurrency(m.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: RESET / RECONCILE */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed font-sans">
                <span className="font-bold block mb-1">⚠️ Reset Warning</span>
                This will clear all logged cash drawer transactions for this terminal session and update the base opening float balance.
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#A69984] block mb-1">New Float / Opening Cash ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newOpening}
                    onChange={e => setNewOpening(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-sans font-bold text-xs uppercase tracking-widest rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                >
                  Reset Drawer Float
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/5 pt-4 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}
