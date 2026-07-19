'use client';

import React, { useState, useEffect } from 'react';
import { getActivityLogs, clearActivityLogs } from '@/utils/activityLogger';

interface ActivityLogTabProps {
  t: any;
  tr: any;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function ActivityLogTab({ t, tr, triggerToast }: ActivityLogTabProps) {
  const [logsList, setLogsList] = useState<any[]>([]);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsFilter, setLogsFilter] = useState('All');
  const [logsPage, setLogsPage] = useState(1);

  // Load activity logs on mount
  useEffect(() => {
    getActivityLogs().then((logs) => {
      setLogsList(logs);
    });
  }, []);

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
      await clearActivityLogs();
      const updated = await getActivityLogs();
      setLogsList(updated);
      triggerToast('Activity logs cleared successfully.', 'success');
    }
  };

  const filtered = logsList.filter(log => {
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
    <div className="space-y-8 animate-fade-in duration-300 font-sans">
      {/* Header Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 select-none">
        <div>
          <h2 className={`font-serif text-[38px] font-bold ${t.accent} tracking-wide leading-none`}>
            Activity Logs
          </h2>
          <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
            Track administrative actions, staff updates, and configuration adjustments on your account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearLogs}
          className={`px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2`}
        >
          <span className="material-symbols-outlined text-sm">delete_sweep</span>
          Clear Logs
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0e0e0d]/30 border border-white/5 p-4 rounded-2xl select-none">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', 'Staff', 'Settings', 'Billing', 'Security'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setLogsFilter(cat); setLogsPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                logsFilter === cat
                  ? `${t.accentBg} ${t.accentText}`
                  : `bg-white/5 text-[#A69984] hover:bg-white/10`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <span className={`material-symbols-outlined absolute left-3.5 top-3 ${t.textMutedDark} text-sm`}>search</span>
          <input
            type="text"
            value={logsSearch}
            onChange={(e) => { setLogsSearch(e.target.value); setLogsPage(1); }}
            placeholder="Search logs..."
            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-10 pr-4 py-2.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
          />
        </div>
      </div>

      {/* LOG ENTRIES TABLE */}
      <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-4">Actor</th>
                <th className="py-4 px-4">Event</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divider}`}>
              {paginated.map((log, idx) => {
                let catBadge = 'bg-white/5 text-white/70';
                if (log.category === 'Staff') catBadge = 'bg-sky-500/10 border border-sky-500/20 text-sky-400';
                else if (log.category === 'Billing') catBadge = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
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
                    <td className={`py-4 px-4 text-xs ${t.textMuted} leading-relaxed min-w-[250px]`}>
                      {log.message}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            alert(JSON.stringify(log.metadata, null, 2));
                          }}
                          className={`px-2.5 py-1 bg-white/5 hover:${t.cardHover} ${t.text} rounded text-[10px] font-sans font-bold transition-all cursor-pointer`}
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
                  <td colSpan={5} className={`py-12 text-center text-xs ${t.textMuted}`}>
                    No activity log entries matched the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={`p-4 border-t ${t.borderStrong} flex justify-between items-center bg-[#0d0d0c] select-none text-[11px]`}>
          <span className={t.textMuted}>
            Showing page <strong className="text-white font-mono">{logsPage}</strong> of <strong className="text-white font-mono">{totalPages}</strong> ({filtered.length} entries)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={logsPage === 1}
              onClick={() => setLogsPage(prev => Math.max(prev - 1, 1))}
              className={`px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 ${t.text} transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={logsPage >= totalPages}
              onClick={() => setLogsPage(prev => Math.min(prev + 1, totalPages))}
              className={`px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 ${t.text} transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
