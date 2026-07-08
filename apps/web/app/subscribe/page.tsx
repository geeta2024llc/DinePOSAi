'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSubscription, getTrialDaysRemaining } from '@/utils/trial';
import type { Subscription } from '@/utils/trial';
import { useAuth } from '../authContext';

// --------------------------------------------------------------------------
// Plan data (mirrors CmsHelper pricing defaults)
// --------------------------------------------------------------------------
const PLANS: {
  id: Subscription['plan'];
  label: string;
  eyebrow: string;
  desc: string;
  monthlyJPY: number;
  annualJPY: number;
  features: string[];
  highlight: boolean;
  icon: string;
  accentColor: string;
}[] = [
  {
    id: 'Starter',
    label: 'Starter',
    eyebrow: 'Starter Package',
    desc: 'Perfect for small restaurants and cafés getting started with digital ordering.',
    monthlyJPY: 3980,
    annualJPY: 3180,
    features: [
      'Digital Menu System',
      'Tablet Ordering',
      'POS Billing System',
      'Kitchen Display System (KDS)',
      'Order Management',
      'Sales Reports',
      '1 Restaurant Location',
      'Up to 5 Staff Accounts',
    ],
    highlight: false,
    icon: 'storefront',
    accentColor: '#A69984',
  },
  {
    id: 'Growth',
    label: 'Growth',
    eyebrow: 'Growth Package',
    desc: 'Designed for restaurants that want to increase sales and automate operations.',
    monthlyJPY: 6980,
    annualJPY: 5580,
    features: [
      'Everything in Starter',
      'AI Upsell Engine',
      'Smart Combo Suggestions',
      'Inventory Management',
      'Stock Alerts',
      'Staff Management',
      'Advanced Analytics',
      'Customer Insights',
    ],
    highlight: true,
    icon: 'rocket_launch',
    accentColor: '#ffe2ab',
  },
  {
    id: 'Business',
    label: 'Business',
    eyebrow: 'Business Package',
    desc: 'Built for high-volume restaurants, chains, and multi-location businesses.',
    monthlyJPY: 12980,
    annualJPY: 10380,
    features: [
      'Everything in Growth',
      'Multi-Branch Management',
      'Central Dashboard',
      'Role-Based Permissions',
      'Priority Support',
      'API Access',
      'Advanced AI Personalization',
      'Unlimited Staff Accounts',
    ],
    highlight: false,
    icon: 'diamond',
    accentColor: '#cc9d31',
  },
];

// --------------------------------------------------------------------------
// Payment Modal
// --------------------------------------------------------------------------
function PaymentModal({
  plan,
  billingCycle,
  onConfirm,
  onClose,
}: {
  plan: (typeof PLANS)[0];
  billingCycle: 'monthly' | 'annual';
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { updateTenant } = useAuth();
  const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');
  const price = billingCycle === 'monthly' ? plan.monthlyJPY : plan.annualJPY;
  const annualTotal = plan.annualJPY * 12;

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      const days = billingCycle === 'monthly' ? 30 : 365;
      const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      updateTenant({
        plan: plan.id.toUpperCase(),
        billingCycle,
        subscriptionExpiresAt: expiryDate,
      });
      setStep('success');
      setTimeout(onConfirm, 1800);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={step === 'review' ? onClose : undefined} />

      <div className="relative bg-[#111110] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.8)] z-10">

        {step === 'review' && (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 text-[#A69984]/50 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.accentColor}18`, border: `1px solid ${plan.accentColor}30` }}>
                <span className="material-symbols-outlined text-lg" style={{ color: plan.accentColor }}>{plan.icon}</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm">{plan.label} Plan</div>
                <div className="text-[#A69984] text-[10px] capitalize">{billingCycle} billing</div>
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-5 mb-6 border border-white/5">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[#ffe2ab] text-lg font-bold">¥</span>
                <span className="text-white text-4xl font-serif font-bold">{price.toLocaleString()}</span>
                <span className="text-[#A69984] text-xs">/ month</span>
              </div>
              {billingCycle === 'annual' && (
                <div className="text-emerald-400 text-[10px] font-bold mt-1">
                  ✓ Billed annually — ¥{annualTotal.toLocaleString()}/year (Save 20%)
                </div>
              )}
              <div className="text-[#A69984] text-[10px] mt-2 leading-relaxed">
                Your subscription starts today. Cancel anytime.
              </div>
            </div>

            {/* Simulated payment notice */}
            <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-[#ffe2ab]/5 border border-[#ffe2ab]/15">
              <span className="material-symbols-outlined text-[#ffe2ab] text-[14px] mt-0.5 shrink-0">info</span>
              <p className="text-[#A69984] text-[10px] leading-relaxed">
                This is a <strong className="text-[#ffe2ab]">simulated payment</strong> for the demo. No real charge will be made. In production, this would connect to Stripe.
              </p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-[#ffe2ab] hover:bg-[#ffd990] text-[#402d00] font-bold text-xs tracking-widest uppercase py-4 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-[0_4px_20px_rgba(255,226,171,0.2)]"
            >
              Confirm Subscription
            </button>
            <button onClick={onClose} className="w-full text-center text-[#A69984]/60 hover:text-[#A69984] text-[10px] font-medium mt-3 transition-colors">
              Cancel
            </button>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-10 gap-5">
            <div className="w-14 h-14 border-4 border-[#ffe2ab]/20 border-t-[#ffe2ab] rounded-full animate-spin" />
            <div className="text-white font-bold text-sm">Processing…</div>
            <div className="text-[#A69984] text-xs">Setting up your subscription</div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
            </div>
            <div className="text-white font-bold text-lg">Subscription Activated!</div>
            <div className="text-[#A69984] text-xs leading-relaxed max-w-xs">
              Welcome to the <strong className="text-[#ffe2ab]">{plan.label}</strong> plan. You now have full access to all features. Redirecting…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Inner page (uses useSearchParams — must be in Suspense)
// --------------------------------------------------------------------------
function SubscribeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(null);
  const [currentSub, setCurrentSub] = useState(getSubscription());
  const [daysLeft, setDaysLeft] = useState(getTrialDaysRemaining());

  useEffect(() => {
    document.title = 'Subscribe — DinePosAi';
    setCurrentSub(getSubscription());
    setDaysLeft(getTrialDaysRemaining());
  }, []);

  const handleSuccess = () => {
    setSelectedPlan(null);
    setCurrentSub(getSubscription());
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a09] text-white font-sans antialiased overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#ffe2ab]/4 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/4 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a09]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-[#ffe2ab] text-xl font-semibold tracking-wide select-none">
            DinePosAi
          </Link>
          <div className="flex items-center gap-3">
            {currentSub?.status === 'active' ? (
              <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {currentSub.plan} Plan — Active
              </span>
            ) : (
              <Link href="/dashboard" className="text-[#A69984] hover:text-white text-xs font-medium transition-colors">
                ← Back to Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">

        {/* Expired trial alert */}
        {isExpired && !currentSub && (
          <div className="mb-10 max-w-2xl mx-auto flex items-start gap-4 px-6 py-5 rounded-2xl border border-red-500/30 bg-red-500/8">
            <span className="material-symbols-outlined text-red-400 text-2xl shrink-0">timer_off</span>
            <div>
              <div className="text-red-300 font-bold text-sm mb-1">Your 7-day free trial has ended</div>
              <div className="text-[#A69984] text-xs leading-relaxed">
                Choose a plan below to continue using DinePosAi. All your data and settings are saved and will be available immediately after subscribing.
              </div>
            </div>
          </div>
        )}

        {/* Active subscription management */}
        {currentSub?.status === 'active' && (
          <div className="mb-10 max-w-2xl mx-auto flex items-start gap-4 px-6 py-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/8">
            <span className="material-symbols-outlined text-emerald-400 text-2xl shrink-0">verified</span>
            <div>
              <div className="text-emerald-300 font-bold text-sm mb-1">You&apos;re on the {currentSub.plan} plan</div>
              <div className="text-[#A69984] text-xs leading-relaxed">
                Billed {currentSub.billingCycle}. You can upgrade or downgrade your plan at any time from this page.
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-14">
          {!isExpired && !currentSub && daysLeft > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ffe2ab]/25 bg-[#ffe2ab]/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ffe2ab] animate-pulse" />
              <span className="text-[#ffe2ab] text-[10px] font-bold uppercase tracking-[0.2em]">
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in your trial
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffe2ab] to-[#cc9d31] mb-4 leading-tight">
            {currentSub ? 'Manage Your Plan' : 'Choose Your Plan'}
          </h1>
          <p className="text-[#A69984] text-base max-w-xl mx-auto leading-relaxed">
            {currentSub
              ? 'Upgrade, downgrade, or continue with your current plan.'
              : 'Unlock full access to DinePosAi. No hidden fees — cancel anytime.'}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex bg-white/[0.04] border border-white/8 rounded-full p-1 gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-[#ffe2ab] text-[#2c1a00] shadow-lg' : 'text-[#A69984]/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-[#ffe2ab] text-[#2c1a00] shadow-lg' : 'text-[#A69984]/60 hover:text-white'
              }`}
            >
              Annually
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${billingCycle === 'annual' ? 'bg-[#2c1a00]/15 text-[#2c1a00]' : 'bg-[#ffe2ab]/10 text-[#ffe2ab]'}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyJPY : plan.annualJPY;
            const isCurrentPlan = currentSub?.plan === plan.id && currentSub?.status === 'active';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 flex flex-col border transition-all duration-500 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#181613] to-[#0e0e0d] border-[#ffe2ab]/40 shadow-2xl lg:scale-[1.03] z-10'
                    : 'bg-gradient-to-b from-white/[0.03] to-white/[0.01] border-white/[0.06] hover:border-[#ffe2ab]/20 hover:-translate-y-1'
                } ${isCurrentPlan ? 'ring-2 ring-emerald-500/50' : ''}`}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#cc9d31] to-[#ffe2ab] text-[#2c1a00] text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs notranslate">local_fire_department</span>
                    Popular Choice
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3.5 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    Current Plan
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: plan.accentColor }}>
                      {plan.eyebrow}
                    </span>
                    <span className="material-symbols-outlined text-2xl opacity-70" style={{ color: plan.accentColor }}>
                      {plan.icon}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl text-white font-medium italic mb-3">{plan.label}</h2>
                  <p className="text-[#A69984] text-xs leading-relaxed">{plan.desc}</p>

                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-lg font-bold align-super -mt-2" style={{ color: plan.accentColor }}>¥</span>
                    <span className="text-5xl font-serif font-bold text-white">{price.toLocaleString()}</span>
                    <span className="text-xs text-[#A69984]/50 uppercase tracking-widest ml-1">/ mo</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-emerald-400 text-[10px] font-bold mt-1">
                      ¥{(plan.annualJPY * 12).toLocaleString()} billed annually
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/5 mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-xs leading-relaxed ${f.startsWith('Everything') ? 'text-white font-semibold' : 'text-[#A69984]/90'}`}>
                      <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5" style={{ color: plan.accentColor }}>
                        check_circle
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="w-full text-center py-3.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/8">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200 hover:scale-[1.01]"
                    style={
                      plan.highlight
                        ? { background: '#ffe2ab', color: '#2c1a00', boxShadow: '0 4px 20px rgba(255,226,171,0.2)' }
                        : { border: '1px solid rgba(255,255,255,0.1)', color: '#ffe2ab', background: 'transparent' }
                    }
                  >
                    {currentSub ? `Switch to ${plan.label}` : `Choose ${plan.label}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <div className="mt-14 text-center flex flex-wrap items-center justify-center gap-6 text-[#A69984]/60 text-[10px] font-medium">
          {['No credit card required', 'Cancel anytime', 'All data preserved on plan change', '7-day money-back guarantee'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-[#ffe2ab]/50">verified</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          onConfirm={handleSuccess}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Page export (wraps inner in Suspense for useSearchParams)
// --------------------------------------------------------------------------
export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeInner />
    </Suspense>
  );
}
