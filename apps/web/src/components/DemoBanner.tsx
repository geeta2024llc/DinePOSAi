'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getTrialDaysRemaining,
  isTrialActive,
  isSubscribed,
  getSubscription,
} from '@/utils/trial';

/**
 * TrialBanner
 * Floating bottom bar that shows trial countdown, subscription status, or is hidden.
 * Renders on admin pages via root layout.
 */
export default function TrialBanner() {
  const pathname = usePathname();
  const [daysLeft, setDaysLeft] = useState<number>(-1);
  const [subscribed, setSubscribed] = useState(false);
  const [planName, setPlanName] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    const sub = getSubscription();
    if (sub?.status === 'active') {
      setSubscribed(true);
      setPlanName(sub.plan);
      setDaysLeft(-1);
    } else {
      setSubscribed(false);
      setPlanName('');
      setDaysLeft(getTrialDaysRemaining());
    }
  };

  useEffect(() => {
    setMounted(true);
    refresh();

    // Re-check whenever localStorage changes (e.g. user subscribes in another tab)
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Do not render on customer menu, checkout, order-status, concierge, or public landing routes
  if (
    pathname?.startsWith('/menu') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/subscribe') ||
    pathname?.startsWith('/partners') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/terms')
  ) {
    return null;
  }

  // Don't render until hydrated to avoid SSR mismatch
  if (!mounted) return null;
  // Hide if no trial was ever started and not subscribed
  if (!subscribed && daysLeft === -1) return null;
  // Hide if dismissed
  if (dismissed) return null;

  const isExpiringSoon = !subscribed && daysLeft <= 2 && daysLeft > 0;
  const isExpired = !subscribed && daysLeft === 0;

  // Border + glow color
  const borderColor = subscribed
    ? 'border-emerald-500/30'
    : isExpiringSoon || isExpired
    ? 'border-red-500/40'
    : 'border-[#ffe2ab]/25';

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl border ${borderColor} bg-[#0a0a09]/92 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.65)] max-w-[96vw] transition-all duration-500`}
      role="status"
    >
      {/* Status dot */}
      {subscribed ? (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399] shrink-0" />
      ) : isExpiringSoon || isExpired ? (
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_6px_#f87171] shrink-0" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-[#ffe2ab] animate-pulse shadow-[0_0_6px_#ffe2ab] shrink-0" />
      )}

      {/* Label */}
      {subscribed ? (
        <span className="text-emerald-300 text-[11px] font-bold tracking-wide whitespace-nowrap">
          Active — {planName} Plan
        </span>
      ) : isExpired ? (
        <span className="text-red-300 text-[11px] font-bold tracking-wide whitespace-nowrap">
          Trial Expired
        </span>
      ) : (
        <span
          className={`text-[11px] font-bold tracking-wide whitespace-nowrap ${
            isExpiringSoon ? 'text-red-300' : 'text-[#ffe2ab]'
          }`}
        >
          {daysLeft === 1 ? '1 day' : `${daysLeft} days`} left in your free trial
        </span>
      )}

      {/* Separator */}
      <span className="w-px h-4 bg-white/10 shrink-0 hidden sm:block" />

      {/* CTA */}
      {!subscribed && (
        <Link
          href={isExpired ? '/subscribe?expired=true' : '/subscribe'}
          className="flex items-center gap-1.5 font-bold text-[10px] tracking-wide whitespace-nowrap px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.03]"
          style={
            isExpiringSoon || isExpired
              ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }
              : { background: 'rgba(255,226,171,0.12)', color: '#ffe2ab', border: '1px solid rgba(255,226,171,0.25)' }
          }
        >
          <span className="material-symbols-outlined text-[13px]">rocket_launch</span>
          {isExpired ? 'Subscribe Now' : 'Upgrade Now'}
        </Link>
      )}

      {subscribed && (
        <Link
          href="/subscribe"
          className="text-[#A69984] hover:text-white text-[10px] font-medium transition-colors whitespace-nowrap"
        >
          Manage Plan
        </Link>
      )}

      {/* Dismiss (only for non-expired active trials) */}
      {!isExpired && !isExpiringSoon && (
        <button
          onClick={() => setDismissed(true)}
          className="text-[#A69984]/50 hover:text-[#A69984] transition-colors ml-1"
          aria-label="Dismiss banner"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      )}
    </div>
  );
}
