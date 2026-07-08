import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#131313] font-sans">
      <div className="flex flex-col items-center gap-4">
        {/* Premium elegant double-ring spinner */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[#ffe2ab]/10 border-t-[#ffe2ab] rounded-full animate-spin" />
          <div className="w-8 h-8 border-2 border-secondary-fixed-dim/5 border-t-secondary-fixed-dim rounded-full animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
        </div>
        <span className="text-[#a69984] text-xs font-semibold uppercase tracking-widest animate-pulse select-none">
          Loading DinePOS...
        </span>
      </div>
    </div>
  );
}
