import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#1c1b1b] border border-white/5 rounded-2xl p-10 shadow-2xl">
        <h1 className="text-8xl font-serif font-black text-[#ffe2ab] mb-4 tracking-wider leading-none select-none">404</h1>
        <h2 className="text-white font-bold text-lg tracking-wide mb-3 select-none">Page Not Found</h2>
        <p className="text-[#a69984] text-xs leading-relaxed mb-8 select-none font-medium">
          The page you are looking for does not exist or has been moved to a new address.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,226,171,0.1)] hover:shadow-[0_4px_24px_rgba(255,226,171,0.2)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
