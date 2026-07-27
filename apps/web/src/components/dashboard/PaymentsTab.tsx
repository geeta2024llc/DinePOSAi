'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';

interface PaymentsTabProps {
  t: any;
  tr: any;
  currency: string;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  userAccount: any;
  setUserAccount: React.Dispatch<React.SetStateAction<any>>;
  cmsConfig: any;
}

export default function PaymentsTab({ t, tr, currency, triggerToast, userAccount, setUserAccount, cmsConfig }: PaymentsTabProps) {
  const router = useRouter();

  // Payments Configuration States
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(true);

  // Stripe Account Linking States
  const [linkedStripeAccount, setLinkedStripeAccount] = useState<string | null>(null);
  const [stripeAccountIdInput, setStripeAccountIdInput] = useState('');
  const [isLinkingStripe, setIsLinkingStripe] = useState(false);
  const [activeAdminEmail, setActiveAdminEmail] = useState('admin@dinepos.ai');

  // Tenant Billing / Subscription States
  const [tenantBilling, setTenantBilling] = useState<any>({
    plan: 'TRIAL',
    trialEndsAt: null,
    billing: null,
    activeTerminals: 1
  });
  
  const [subscriptionInvoices, setSubscriptionInvoices] = useState<any[]>([]);

  // Upgrade Modal states
  const [showPlanUpgradeModal, setShowPlanUpgradeModal] = useState(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'Starter' | 'Growth' | 'Business'>('Growth');
  const [upgradeBillingCycle, setUpgradeBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeEmail = localStorage.getItem('dinepos_logged_in_email') || 'admin@dinepos.ai';
      setActiveAdminEmail(activeEmail);
    }
    // Fetch Stripe config and billing data from API
    (async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dinepos_jwt_token') : null;
      if (!token) return;
      try {
        const stripeRes = await apiRequest<{ isLinked: boolean }>('/api/billing/config');
        if (stripeRes.success && stripeRes.data?.isLinked) {
          setLinkedStripeAccount('Connected');
          setStripeAccountIdInput('');
        } else {
          setLinkedStripeAccount(null);
          setStripeAccountIdInput('');
        }
      } catch { /* backend offline */ }

      try {
        const billingRes = await apiRequest<any>('/api/billing/tenant');
        if (billingRes.success && billingRes.data) {
          setTenantBilling(billingRes.data);
        }
      } catch { /* backend offline */ }

      try {
        const invoicesRes = await apiRequest<any[]>('/api/billing/invoices');
        if (invoicesRes.success && Array.isArray(invoicesRes.data)) {
          setSubscriptionInvoices(invoicesRes.data);
        }
      } catch { /* backend offline */ }
    })();
  }, []);

  const handleLinkStripeAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeAccountIdInput.trim()) {
      triggerToast('Please enter a Stripe Account ID.', 'info');
      return;
    }
    setIsLinkingStripe(true);
    const res = await apiRequest('/api/billing/config', {
      method: 'POST',
      body: JSON.stringify({ stripeAccountId: stripeAccountIdInput })
    });
    setIsLinkingStripe(false);
    if (res.success) {
      setLinkedStripeAccount('Connected');
      setStripeAccountIdInput('');
      triggerToast('Stripe merchant account linked successfully!', 'success');
    } else {
      triggerToast(res.error || 'Failed to link Stripe account.', 'info');
    }
  };

  const handleUnlinkStripeAccount = async () => {
    if (!confirm('Are you sure you want to disconnect Stripe? This will disable card payments.')) return;
    const res = await apiRequest('/api/billing/config/unlink', { method: 'POST' });
    if (res.success) {
      setLinkedStripeAccount(null);
      setStripeAccountIdInput('');
      triggerToast('Stripe account disconnected.', 'info');
    } else {
      triggerToast('Failed to disconnect Stripe.', 'info');
    }
  };

  const currencySymbols: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' };
  const currencyRates: Record<string, number> = { USD: 1, JPY: 150, EUR: 0.92, GBP: 0.79, CNY: 7.24, KRW: 1340 };
  
  const formatCurrency = (val: number) => {
    const rate = currencyRates[currency] || 1;
    const sym = currencySymbols[currency] || '$';
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(converted).toLocaleString()}`;
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (priceStr: string) => {
    try {
      const parsed = parseFloat(priceStr);
      if (isNaN(parsed)) return priceStr;
      return parsed.toLocaleString();
    } catch {
      return priceStr;
    }
  };

  const getTrialDaysLeft = () => {
    if (!userAccount || userAccount.plan !== 'TRIAL') return 0;
    const expiry = new Date(userAccount.expiryDate);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDisplayPlanPrice = () => {
    if (!userAccount) return '¥0';
    if (userAccount.plan === 'TRIAL') return '¥0';
    
    const cycle = userAccount.billingCycle || 'monthly';
    const tier = userAccount.tier || 'Growth';
    
    let rawPrice = '0';
    if (tier === 'Starter') {
      rawPrice = cycle === 'monthly' ? cmsConfig.pricing.starterMonthly : cmsConfig.pricing.starterAnnual;
    } else if (tier === 'Growth') {
      rawPrice = cycle === 'monthly' ? cmsConfig.pricing.growthMonthly : cmsConfig.pricing.growthAnnual;
    } else if (tier === 'Business') {
      rawPrice = cycle === 'monthly' ? cmsConfig.pricing.premiumMonthly : cmsConfig.pricing.premiumAnnual;
    }
    
    return `¥${formatPrice(rawPrice)}`;
  };

  return (
    <>
      {/* PAYMENTS TAB JSX */}
                  <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${t.border} pb-6 gap-4`}>
                <div className="select-none">
                  <h2 className={`font-serif text-[38px] font-bold ${t.text} tracking-wide leading-none`}>
                    {tr.subAndBilling}
                  </h2>
                  <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 leading-relaxed max-w-2xl font-semibold`}>
                    {tr.subDesc}
                  </p>
                </div>

                {/* Download Statements trigger */}
                <button type="button"
                  onClick={() => triggerToast('Compiling financial statements download...', 'success')}
                  className={`bg-transparent border ${t.buttonOutline} px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none`}
                >
                  {tr.downloadStatements}
                </button>
              </div>

              {/* Plan Details and Payment Method Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Plan Card (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[250px]`}>
                    {/* Checkmark Watermark Background */}
                    <div className="absolute right-6 bottom-4 text-white/[0.02] pointer-events-none select-none">
                      <span className="material-symbols-outlined text-[140px] leading-none">verified</span>
                    </div>

                    <div className="space-y-6 z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                            {tr.currentPlan}
                          </span>
                          <h3 className={`font-serif text-3xl font-bold ${t.text} mt-2.5`}>
                            {userAccount ? `${userAccount.tier === 'Starter' ? cmsConfig.pricing.starterName : userAccount.tier === 'Growth' ? cmsConfig.pricing.growthName : userAccount.tier === 'Business' ? cmsConfig.pricing.premiumName : userAccount.tier} ${userAccount.plan === 'TRIAL' ? '(7-Day Trial)' : ''}` : tr.planName}
                          </h3>
                           <p className={`text-[11px] ${t.textMutedLight} font-semibold mt-1`}>
                            {tenantBilling?.billing?.nextBillingDate
                              ? `Next billing: ${new Date(tenantBilling.billing.nextBillingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`
                              : userAccount && userAccount.plan === 'TRIAL' 
                                ? `Trial expires on ${userAccount.expiryDate} (${Math.max(0, getTrialDaysLeft())} days remaining)` 
                                : `Active subscription (Billed ${userAccount?.billingCycle === 'annual' ? 'annually' : 'monthly'})`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-serif text-3xl font-bold ${t.text}`}>
                            {tenantBilling?.billing?.amount ? `$${tenantBilling.billing.amount.toFixed(0)}` : getDisplayPlanPrice()}
                          </span>
                          <span className={`text-xs ${t.textMuted} font-semibold`}>
                            {userAccount && userAccount.plan === 'TRIAL' ? ' / 7 days' : ' / month'}
                          </span>
                        </div>
                      </div>

                      {/* Stat meters */}
                      <div className="grid grid-cols-2 gap-8 pt-2">
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${t.textMuted} font-bold uppercase tracking-wider block`}>{tr.activeTerminals}</span>
                          <div className={`text-sm font-bold ${t.text}`}>
                            {tenantBilling ? `${tenantBilling.activeTerminals} active` : '—'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${t.textMuted} font-bold uppercase tracking-wider block`}>{tr.cloudStorage}</span>
                          <div className={`text-sm font-bold ${t.text}`}>—</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 z-10 select-none">
                      <button type="button" 
                        onClick={() => setShowPlanUpgradeModal(true)}
                        className={`bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md cursor-pointer`}
                      >
                        {tr.changePlan}
                      </button>
                      <button type="button" 
                        onClick={() => router.push('/subscribe')}
                        className={`bg-transparent border ${t.buttonOutline} font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 cursor-pointer`}
                      >
                        {tr.manageAddons}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method Card (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl min-h-[250px] flex flex-col justify-between`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <h3 className={`font-serif text-sm ${t.text} font-bold tracking-wide`}>{tr.paymentMethod}</h3>
                        <button type="button" 
                          onClick={() => triggerToast('Navigate to Settings > Billing to update payment details.', 'info')}
                          className="text-[9.5px] text-[#ffe2ab] font-bold tracking-widest hover:text-white uppercase transition-colors cursor-pointer"
                        >
                          {tr.editBtn}
                        </button>
                      </div>

                      {/* Mock Credit Card */}
                      <div className={`${t.inputBg}/50 border ${t.border} rounded-xl p-5 flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-8 rounded border ${t.borderStrong} bg-black/40 flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-[#e5e2e1]/70 text-lg">credit_card</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-sans text-xs font-bold text-white tracking-widest">
                              •••• •••• •••• <span className="text-sm font-mono font-bold text-white tracking-normal">4242</span>
                            </div>
                            <div className={`text-[9.5px] ${t.textMuted} font-bold mt-1`}>Expires 12/25</div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded border border-white/10 text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider select-none leading-none">
                          {tr.defaultMethod}
                        </span>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => triggerToast('Navigate to Settings > Billing to add a backup payment method.', 'info')}
                      className={`w-full py-3 bg-transparent border border-dashed ${t.borderStrong} hover:border-white/20 text-[#A69984] font-sans font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-4`}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                      {tr.addBackupMethod}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stripe Merchant Integration Card (Span 12) */}
              <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl relative overflow-hidden font-sans`}>
                <div className="absolute right-6 top-6 text-white/[0.02] pointer-events-none select-none">
                  <span className="material-symbols-outlined text-[100px] leading-none">account_balance</span>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 select-none">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#635bff] animate-pulse"></span>
                        <h3 className={`font-serif text-lg ${t.text} font-bold tracking-wide`}>Stripe Merchant Integration</h3>
                      </div>
                      <p className={`text-xs ${t.textMuted} mt-1.5 leading-relaxed max-w-3xl`}>
                        Connect your restaurant's Stripe merchant account to process customer self-checkout payments. All transactions completed at customer tables will be automatically processed and routed to your linked Stripe account.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 select-none shrink-0">
                      <span className={`text-[10px] font-bold ${t.textMuted} uppercase tracking-wider`}>Owner Account:</span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                        <span className="material-symbols-outlined text-xs text-[#ffe2ab]">person</span>
                        <span className="text-[11px] font-mono font-bold text-white/90">{activeAdminEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`border-t ${t.border} pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`}>
                    
                    {/* Status Display Area */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Integration Status</span>
                        {linkedStripeAccount ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[9px] uppercase tracking-wider rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold text-[9px] uppercase tracking-wider rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                            Not Configured
                          </span>
                        )}
                      </div>

                      {linkedStripeAccount ? (
                        <div className={`${t.inputBg}/45 border border-emerald-500/10 rounded-xl p-4 space-y-2.5`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className={`${t.textMuted}`}>Stripe Status:</span>
                            <span className="font-mono font-bold text-white text-[12.5px] select-text">Connected</span>
                          </div>
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className={`${t.textMuted}`}>Owner Account:</span>
                            <span className="text-white/70 font-semibold">{activeAdminEmail}</span>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-[11px] ${t.textMutedLight} leading-relaxed font-medium`}>
                          No Stripe account is connected for this Owner Admin. Customers will be unable to use self-checkout at their tables until an account is connected.
                        </p>
                      )}
                    </div>

                    {/* Linking Form Action Area */}
                    <div className="lg:col-span-7">
                      {linkedStripeAccount ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-end">
                          <p className={`text-[11px] ${t.textMuted} text-left sm:text-right max-w-sm font-semibold`}>
                            Need to update your connection? Disconnect your current Stripe configuration to connect a new merchant account.
                          </p>
                          <button
                            type="button"
                            onClick={handleUnlinkStripeAccount}
                            className="px-6 py-3.5 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/60 text-rose-300 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer text-center whitespace-nowrap shrink-0"
                          >
                            Disconnect Stripe
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                          <div className="flex-1 w-full space-y-2">
                            <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider`}>Enter Stripe Secret Key</label>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-lg leading-none">key</span>
                              <input
                                type="password"
                                value={stripeAccountIdInput}
                                onChange={(e) => setStripeAccountIdInput(e.target.value)}
                                placeholder="sk_live_..."
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-11 pr-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono`}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleLinkStripeAccount}
                            className="w-full sm:w-auto px-6 py-3.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer text-center whitespace-nowrap shrink-0"
                          >
                            Link Stripe
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Invoices segment */}
              <div className={`${t.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                <div className={`p-6 border-b ${t.border} flex justify-between items-center select-none`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${t.accent} text-lg`}>receipt_long</span>
                    <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>{tr.invoiceLedger}</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${t.border} ${t.inputBg}/50 text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest`}>
                        <th className="px-6 py-4">{tr.dateCol}</th>
                        <th className="px-6 py-4">{tr.descCol}</th>
                        <th className="px-6 py-4 text-right">{tr.amountCol}</th>
                        <th className="px-6 py-4">{tr.statusCol}</th>
                        <th className="px-6 py-4 text-center">{tr.actionCol}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.divider} font-sans text-xs`}>
                      
                      {subscriptionInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={`px-6 py-8 text-center ${t.textMuted} text-[11px] font-semibold`}>
                            No invoices yet. Invoices will appear here after your first billing cycle.
                          </td>
                        </tr>
                      ) : (
                        subscriptionInvoices.map((inv) => (
                          <tr key={inv.id} className={`hover:${t.cardHover} transition-colors font-semibold`}>
                            <td className={`px-6 py-4.5 ${t.textMuted}`}>
                              {new Date(inv.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>{inv.description}</td>
                            <td className={`px-6 py-4.5 text-right font-mono font-bold ${t.text}`}>${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-bold text-[8.5px] uppercase tracking-wider rounded-md ${
                                inv.status === 'PAID'
                                  ? 'bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d]'
                                  : inv.status === 'UPCOMING'
                                    ? 'bg-white/5 border border-white/10 text-[#A69984]/50'
                                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-center">
                              <button type="button" 
                                onClick={() => triggerToast('Downloading invoice...', 'success')}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Copy footer */}
              <footer className={`mt-16 pt-6 border-t ${t.border} flex flex-col sm:flex-row justify-between items-center text-[10px] ${t.textMutedLight} font-semibold tracking-wider uppercase select-none gap-4`}>
                <div>© 2026 DinePosAi. All rights reserved.</div>
                <div className="flex gap-6">
                  <Link href="/privacy" className={`hover:${t.text} transition-colors`}>Privacy Policy</Link>
                  <Link href="/terms" className={`hover:${t.text} transition-colors`}>Terms of Service</Link>
                </div>
              </footer>

            </div>


      {/* PAYMENTS MODALS JSX */}
            {/* SUBSCRIPTION PLAN UPGRADE / SWITCHER MODAL */}
      {showPlanUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
          <div className={`${t.cardBgOpaque} border w-[900px] max-w-full rounded-2xl p-7 md:p-8 shadow-2xl space-y-6 animate-scale-up font-sans my-8`}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <div>
                <h3 className={`font-serif text-xl ${t.accent} font-bold tracking-wide`}>
                  Manage Subscription Plan
                </h3>
                <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>
                  Upgrade or switch your active DinePOS AI service package
                </p>
              </div>
              <button type="button" 
                onClick={() => setShowPlanUpgradeModal(false)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Toggle switch for Billing Cycle */}
            <div className="flex justify-center select-none">
              <div className="bg-[#0e0e0d] border border-white/5 p-1 rounded-full flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUpgradeBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    upgradeBillingCycle === 'monthly'
                      ? 'bg-[#ffe2ab] text-[#2c1a00] shadow-md'
                      : `${t.textMuted} hover:${t.text}`
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradeBillingCycle('annual')}
                  className={`px-6 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    upgradeBillingCycle === 'annual'
                      ? 'bg-[#ffe2ab] text-[#2c1a00] shadow-md'
                      : `${t.textMuted} hover:${t.text}`
                  }`}
                >
                  Annually <span className="bg-[#ffc53d]/20 border border-[#ffc53d]/30 text-[#ffc53d] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Save 20%</span>
                </button>
              </div>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Tier */}
              <div 
                onClick={() => setSelectedUpgradeTier('Starter')}
                className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative group ${
                  selectedUpgradeTier === 'Starter'
                    ? 'border-[#ffc53d] bg-gradient-to-b from-[#181613] to-[#0e0e0d] shadow-lg shadow-[#ffc53d]/5 scale-[1.02]'
                    : 'border-white/5 bg-[#161513]/40 hover:border-white/10 hover:bg-[#161513]/60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest block ${selectedUpgradeTier === 'Starter' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>{cmsConfig.pricing.starterLabel}</span>
                      <h4 className={`font-serif text-xl font-bold mt-1 ${t.text}`}>{cmsConfig.pricing.starterName}</h4>
                    </div>
                    <span className={`material-symbols-outlined text-2xl ${selectedUpgradeTier === 'Starter' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>storefront</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
                    {cmsConfig.pricing.starterDesc}
                  </p>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className={`text-sm font-bold ${selectedUpgradeTier === 'Starter' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>¥</span>
                    <span className={`text-3xl font-serif font-bold tracking-tight ${selectedUpgradeTier === 'Starter' ? 'text-[#ffc53d]' : 'text-white'}`}>
                      {formatPrice(upgradeBillingCycle === 'monthly' ? cmsConfig.pricing.starterMonthly : cmsConfig.pricing.starterAnnual)}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ml-1 ${t.textMuted}`}>/ mo</span>
                  </div>
                  <div className={`text-[9px] font-bold ${t.textMuted}`}>
                    {upgradeBillingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  </div>
                  <div className="h-px bg-white/5 my-2"></div>
                  <ul className="space-y-2.5 text-[10px] select-none">
                    {cmsConfig.pricing.starterFeatures.split(',').map((feature: string) => (
                      <li key={feature.trim()} className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-xs text-[#ffe2ab]">check_circle</span>
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Growth Tier */}
              <div 
                onClick={() => setSelectedUpgradeTier('Growth')}
                className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative group ${
                  selectedUpgradeTier === 'Growth'
                    ? 'border-[#ffc53d] bg-gradient-to-b from-[#181613] to-[#0e0e0d] shadow-lg shadow-[#ffc53d]/5 scale-[1.02]'
                    : 'border-white/5 bg-[#161513]/40 hover:border-white/10 hover:bg-[#161513]/60'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#cc9d31] to-[#ffe2ab] text-[#2c1a00] font-sans text-[7.5px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">local_fire_department</span> {cmsConfig.pricing.popularBadgeText}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest block ${selectedUpgradeTier === 'Growth' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>{cmsConfig.pricing.growthLabel}</span>
                      <h4 className={`font-serif text-xl font-bold mt-1 ${t.text}`}>{cmsConfig.pricing.growthName}</h4>
                    </div>
                    <span className={`material-symbols-outlined text-2xl ${selectedUpgradeTier === 'Growth' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>rocket_launch</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
                    {cmsConfig.pricing.growthDesc}
                  </p>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className={`text-sm font-bold ${selectedUpgradeTier === 'Growth' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>¥</span>
                    <span className={`text-3xl font-serif font-bold tracking-tight ${selectedUpgradeTier === 'Growth' ? 'text-[#ffc53d]' : 'text-white'}`}>
                      {formatPrice(upgradeBillingCycle === 'monthly' ? cmsConfig.pricing.growthMonthly : cmsConfig.pricing.growthAnnual)}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ml-1 ${t.textMuted}`}>/ mo</span>
                  </div>
                  <div className={`text-[9px] font-bold ${t.textMuted}`}>
                    {upgradeBillingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  </div>
                  <div className="h-px bg-white/5 my-2"></div>
                  <ul className="space-y-2.5 text-[10px] select-none">
                    {cmsConfig.pricing.growthFeatures.split(',').map((feature: string) => {
                      const trimmed = feature.trim();
                      const isBold = trimmed.startsWith('Everything in');
                      return (
                        <li key={trimmed} className="flex items-center gap-2 text-white">
                          <span className="material-symbols-outlined text-xs text-[#ffe2ab]">check_circle</span>
                          <span className={isBold ? 'font-bold' : ''}>{trimmed}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Business Tier */}
              <div 
                onClick={() => setSelectedUpgradeTier('Business')}
                className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative group ${
                  selectedUpgradeTier === 'Business'
                    ? 'border-[#ffc53d] bg-gradient-to-b from-[#181613] to-[#0e0e0d] shadow-lg shadow-[#ffc53d]/5 scale-[1.02]'
                    : 'border-white/5 bg-[#161513]/40 hover:border-white/10 hover:bg-[#161513]/60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest block ${selectedUpgradeTier === 'Business' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>{cmsConfig.pricing.premiumLabel}</span>
                      <h4 className={`font-serif text-xl font-bold mt-1 ${t.text}`}>{cmsConfig.pricing.premiumName}</h4>
                    </div>
                    <span className={`material-symbols-outlined text-2xl ${selectedUpgradeTier === 'Business' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>diamond</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
                    {cmsConfig.pricing.premiumDesc}
                  </p>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className={`text-sm font-bold ${selectedUpgradeTier === 'Business' ? 'text-[#ffc53d]' : `${t.textMuted}`}`}>¥</span>
                    <span className={`text-3xl font-serif font-bold tracking-tight ${selectedUpgradeTier === 'Business' ? 'text-[#ffc53d]' : 'text-white'}`}>
                      {formatPrice(upgradeBillingCycle === 'monthly' ? cmsConfig.pricing.premiumMonthly : cmsConfig.pricing.premiumAnnual)}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ml-1 ${t.textMuted}`}>/ mo</span>
                  </div>
                  <div className={`text-[9px] font-bold ${t.textMuted}`}>
                    {upgradeBillingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  </div>
                  <div className="h-px bg-white/5 my-2"></div>
                  <ul className="space-y-2.5 text-[10px] select-none">
                    {cmsConfig.pricing.premiumFeatures.split(',').map((feature: string) => {
                      const trimmed = feature.trim();
                      const isBold = trimmed.startsWith('Everything in');
                      return (
                        <li key={trimmed} className="flex items-center gap-2 text-white">
                          <span className="material-symbols-outlined text-xs text-[#ffe2ab]">check_circle</span>
                          <span className={isBold ? 'font-bold' : ''}>{trimmed}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Summary alert */}
            <div className="bg-[#ffc53d]/5 border border-[#ffc53d]/15 rounded-xl p-4 flex items-start gap-3 text-xs leading-relaxed select-none">
              <span className="material-symbols-outlined text-[#ffc53d] text-base mt-0.5">info</span>
              <div>
                <span className="text-[#ffe2ab] font-bold">Selected Billing Summary:</span>
                <p className={`${t.textMuted} mt-0.5`}>
                  You are upgrading to the <strong className="text-white">{selectedUpgradeTier === 'Starter' ? cmsConfig.pricing.starterName : selectedUpgradeTier === 'Growth' ? cmsConfig.pricing.growthName : cmsConfig.pricing.premiumName}</strong> package billed <strong className="text-white">{upgradeBillingCycle === 'annual' ? 'annually' : 'monthly'}</strong>. 
                  Your credit card on file will be charged <strong className="text-[#ffc53d]">¥{
                    formatPrice(
                      selectedUpgradeTier === 'Starter'
                        ? (upgradeBillingCycle === 'monthly' ? cmsConfig.pricing.starterMonthly : cmsConfig.pricing.starterAnnual)
                        : selectedUpgradeTier === 'Growth'
                        ? (upgradeBillingCycle === 'monthly' ? cmsConfig.pricing.growthMonthly : cmsConfig.pricing.growthAnnual)
                        : (upgradeBillingCycle === 'monthly' ? cmsConfig.pricing.premiumMonthly : cmsConfig.pricing.premiumAnnual)
                    )
                  } / month</strong>. 
                  This will transition your tenant status to <strong className="text-emerald-400">ACTIVE</strong>, extending your billing expiration immediately.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button type="button"
                onClick={() => setShowPlanUpgradeModal(false)}
                className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
              >
                Cancel
              </button>
              <button type="button"
                onClick={async () => {
                  try {
                    const upgradeRes = await apiRequest('/api/billing/checkout', {
                      method: 'POST',
                      body: JSON.stringify({
                        tier: selectedUpgradeTier,
                        billingCycle: upgradeBillingCycle
                      })
                    });

                    if (upgradeRes.success && upgradeRes.data?.url) {
                      window.location.href = upgradeRes.data.url;
                    } else {
                      triggerToast(upgradeRes.error || 'Failed to start billing upgrade.', 'info');
                    }
                  } catch (err: any) {
                    triggerToast(err.message || 'Billing service is currently unavailable.', 'info');
                  }
                }}
                className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
