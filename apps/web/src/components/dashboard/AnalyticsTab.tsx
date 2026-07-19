'use client';

import React from 'react';

interface AnalyticsTabProps {
  t: any;
  tr: any;
}

export default function AnalyticsTab({ t, tr }: AnalyticsTabProps) {
  return (
    <div className="space-y-8 font-sans animate-fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`font-serif text-[38px] font-bold ${t.text} tracking-wide leading-none`}>
            {tr.analyticsTitle}
          </h1>
          <p className={`${t.textMuted} text-[12.5px] font-semibold mt-2 leading-relaxed`}>
            {tr.analyticsDesc}
          </p>
        </div>
      </div>
      <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-16 text-center`}>
        <span className={`material-symbols-outlined text-5xl ${t.textMuted} opacity-30 mb-4`}>analytics</span>
        <h3 className={`${t.text} font-bold text-lg mb-2`}>No Analytics Data Yet</h3>
        <p className={`${t.textMuted} text-sm max-w-md mx-auto`}>
          Analytics will appear here as your restaurant processes orders and generates revenue data.
        </p>
      </div>
    </div>
  );
}
