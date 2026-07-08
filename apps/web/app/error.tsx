'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console and Sentry
    console.error('Unhandled UI Error Boundary caught:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#1c1b1b] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-red-950/45 border border-red-500/20 text-[#ffb4ab] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>
        <h2 className="text-[#ffe2ab] font-serif text-2xl font-semibold mb-3">Application Error</h2>
        <p className="text-[#a69984] text-sm mb-6 leading-relaxed">
          An unexpected error occurred in the user interface. Our team has been notified.
        </p>
        {error.message && (
          <div className="bg-[#12110f] border border-white/5 p-4 rounded-lg mb-6 text-left max-h-40 overflow-y-auto">
            <code className="text-red-400 text-xs font-mono break-all">{error.message}</code>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 font-semibold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer"
          >
            Go Home
          </button>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-[#ffe2ab] text-[#402d00] hover:bg-[#ffdca0] font-semibold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
