'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';
import { apiRequest, isDemoTenant } from '@/utils/api';
import { useAuth } from '../authContext';
import { usePrinter } from '../printerContext';
import { recordActivity } from '@/utils/activityLogger';
import { themes, translations } from '@/components/dashboard/DashboardConstants';

// Lazily imported tab components for optimal load performance
const AnalyticsTab = dynamic(() => import('@/components/dashboard/AnalyticsTab'), { ssr: false });
const ActivityLogTab = dynamic(() => import('@/components/dashboard/ActivityLogTab'), { ssr: false });
const SecurityTab = dynamic(() => import('@/components/dashboard/SecurityTab'), { ssr: false });
const MenuTab = dynamic(() => import('@/components/dashboard/MenuTab'), { ssr: false });
const InventoryTab = dynamic(() => import('@/components/dashboard/InventoryTab'), { ssr: false });
const StaffTab = dynamic(() => import('@/components/dashboard/StaffTab'), { ssr: false });
const HardwareTab = dynamic(() => import('@/components/dashboard/HardwareTab'), { ssr: false });
const PaymentsTab = dynamic(() => import('@/components/dashboard/PaymentsTab'), { ssr: false });
const ReceiptsTab = dynamic(() => import('@/components/dashboard/ReceiptsTab'), { ssr: false });
const GeneralTab = dynamic(() => import('@/components/dashboard/GeneralTab'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const { logout: ctxLogout } = useAuth();
  const searchParams = useSearchParams();

  // CMS Configuration State
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);

  useEffect(() => {
    setCmsConfig(getCmsConfig());
    const handleUpdate = () => setCmsConfig(getCmsConfig());
    window.addEventListener('dinepos_cms_update', handleUpdate);
    return () => window.removeEventListener('dinepos_cms_update', handleUpdate);
  }, []);

  // Shared UI & Theme States
  const [globalAesthetic, setGlobalAesthetic] = useState('Midnight Black');
  const [language, setLanguage] = useState<'en' | 'ja' | 'zh' | 'ko'>('en');
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW'>('USD');
  const [activeTab, setActiveTab] = useState<'general' | 'receipts' | 'payments' | 'hardware' | 'staff' | 'security' | 'menu' | 'analytics' | 'inventory' | 'activity-log'>('general');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Notification banner state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });

  // Custom Theme Override States
  const [customBg, setCustomBg] = useState('#0e0e0d');
  const [customCardBg, setCustomCardBg] = useState('#161513');
  const [customAccent, setCustomAccent] = useState('#ffe2ab');
  const [customText, setCustomText] = useState('#ffffff');
  const [customTextMuted, setCustomTextMuted] = useState('#a69984');

  // Establishment Settings States
  const [establishmentName, setEstablishmentName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState('');

  // Receipts / Layout Config States
  const [showLogo, setShowLogo] = useState(true);
  const [showTableNumber, setShowTableNumber] = useState(true);
  const [showServerName, setShowServerName] = useState(true);
  const [showOrderTimestamp, setShowOrderTimestamp] = useState(true);
  const [showTaxId, setShowTaxId] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [showServiceCharge, setShowServiceCharge] = useState(true);
  const [showCustomFooter, setShowCustomFooter] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState('Thank you for dining with us at DinePosAi! We hope to see you again soon.');

  // Taxes config states
  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');
  const [taxRateDineIn, setTaxRateDineIn] = useState(10);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(8);
  const [taxRateDelivery, setTaxRateDelivery] = useState(8);

  // Digital menu config settings
  const [digitalMenuConfig, setDigitalMenuConfig] = useState({
    dineInEnabled: true,
    takeawayEnabled: true,
    deliveryEnabled: false,
    excludeAlcoholic: false,
    excludeDesserts: false,
    requirePhone: true,
    requireTable: true,
    maxPrice: 40,
    excludedTags: ['Seafood'] as string[],
    showAIConcierge: true,
    enableSelfCheckout: true,
    enableTimeBasedMenu: false,
    lunchStart: '11:00',
    lunchEnd: '15:00',
    dinnerStart: '18:00',
    dinnerEnd: '23:00'
  });

  // User details / Session State
  const [userAccount, setUserAccount] = useState<any>(null);
  const { user: authUser } = useAuth();

  // Audit Logs (Shared for printing test logs and sweep notifications)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Menu items list (Loaded parent-level so InventoryTab can read it for recipes mapping)
  const [menuItemsList, setMenuItemsList] = useState<any[]>([]);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Sync theme overrides and preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBg = localStorage.getItem('dinepos_custom_bg');
      const savedCardBg = localStorage.getItem('dinepos_custom_card_bg');
      const savedAccent = localStorage.getItem('dinepos_custom_accent');
      const savedText = localStorage.getItem('dinepos_custom_text');
      const savedTextMuted = localStorage.getItem('dinepos_custom_text_muted');
      const savedAesthetic = localStorage.getItem('dinepos_global_aesthetic');
      const savedLang = localStorage.getItem('dinepos_language');
      const savedTaxType = localStorage.getItem('dinepos_tax_type');
      const savedExclusions = localStorage.getItem('dinepos_exclusions_config');
      const savedTaxRateDineIn = localStorage.getItem('dinepos_tax_rate_dine_in');
      const savedTaxRateTakeaway = localStorage.getItem('dinepos_tax_rate_takeaway');
      const savedTaxRateDelivery = localStorage.getItem('dinepos_tax_rate_delivery');
      const dineInOk = localStorage.getItem('dinepos_dine_in_enabled') !== 'false';
      const takeawayOk = localStorage.getItem('dinepos_takeaway_enabled') !== 'false';
      const deliveryOk = localStorage.getItem('dinepos_delivery_enabled') !== 'false';

      if (savedBg) setCustomBg(savedBg);
      if (savedCardBg) setCustomCardBg(savedCardBg);
      if (savedAccent) setCustomAccent(savedAccent);
      if (savedText) setCustomText(savedText);
      if (savedTextMuted) setCustomTextMuted(savedTextMuted);
      if (savedAesthetic) setGlobalAesthetic(savedAesthetic);
      if (['en', 'ja', 'zh', 'ko'].includes(savedLang || '')) setLanguage(savedLang as 'en' | 'ja' | 'zh' | 'ko');
      
      const savedCurrency = localStorage.getItem('dinepos_currency');
      if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW'].includes(savedCurrency || '')) setCurrency(savedCurrency as any);
      if (savedTaxType === 'pre-tax' || savedTaxType === 'post-tax') setTaxType(savedTaxType);

      if (savedTaxRateDineIn) setTaxRateDineIn(parseFloat(savedTaxRateDineIn));
      if (savedTaxRateTakeaway) setTaxRateTakeaway(parseFloat(savedTaxRateTakeaway));
      if (savedTaxRateDelivery) setTaxRateDelivery(parseFloat(savedTaxRateDelivery));

      setDigitalMenuConfig(prev => ({
        ...prev,
        dineInEnabled: dineInOk,
        takeawayEnabled: takeawayOk,
        deliveryEnabled: deliveryOk
      }));

      if (savedExclusions) {
        try {
          const parsed = JSON.parse(savedExclusions);
          setDigitalMenuConfig(prev => ({ ...prev, ...parsed }));
        } catch {}
      }

      const savedLogo = localStorage.getItem('dinepos_restaurant_logo');
      if (savedLogo) setRestaurantLogo(savedLogo);
      
      const savedShowLogo = localStorage.getItem('dinepos_receipt_show_logo');
      if (savedShowLogo === 'false') setShowLogo(false);

      const savedEstName = localStorage.getItem('dinepos_establishment_name');
      if (savedEstName) setEstablishmentName(savedEstName);
      
      const savedAddress = localStorage.getItem('dinepos_business_address');
      if (savedAddress) setBusinessAddress(savedAddress);
      
      const savedEmail = localStorage.getItem('dinepos_contact_email');
      if (savedEmail) setContactEmail(savedEmail);
      
      const savedTaxIdVal = localStorage.getItem('dinepos_tax_id');
      if (savedTaxIdVal) setTaxId(savedTaxIdVal);
    }
  }, []);

  // Sync user profile
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dinepos_user_account');
      if (stored) {
        let parsed = JSON.parse(stored);
        if (parsed && parsed.user && parsed.tenant) {
          parsed = {
            ...parsed,
            fullName: parsed.user.name,
            email: parsed.user.email,
            restaurantName: parsed.tenant.name,
            role: parsed.user.role,
            tenantId: parsed.tenant.id,
            currency: parsed.tenant.currency,
            onboarded: parsed.tenant.onboarded,
            plan: parsed.tenant.plan || parsed.plan || 'TRIAL',
            tier: parsed.tier || parsed.tenant.tier || 'Growth',
            trialEndsAt: parsed.tenant.trialEndsAt || parsed.trialEndsAt,
            subscriptionExpiresAt: parsed.tenant.subscriptionExpiresAt || parsed.subscriptionExpiresAt,
            billingCycle: parsed.billingCycle || parsed.tenant.billingCycle,
            expiryDate: parsed.tenant.subscriptionExpiresAt || parsed.tenant.trialEndsAt || parsed.subscriptionExpiresAt || parsed.trialEndsAt || ''
          };
        } else if (parsed && !parsed.expiryDate) {
          parsed.expiryDate = parsed.subscriptionExpiresAt || parsed.trialEndsAt || '';
        }
        
        const upgradeStatus = searchParams.get('upgrade');
        const queryTier = searchParams.get('tier');
        const queryCycle = searchParams.get('cycle');

        if (upgradeStatus === 'success') {
          const newExpiry = new Date();
          if (queryCycle === 'annual') {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
          } else {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
          }
          const expiryStr = newExpiry.toISOString().split('T')[0];

          parsed = {
            ...parsed,
            plan: 'ACTIVE',
            tier: queryTier || 'Starter',
            billingCycle: queryCycle || 'monthly',
            expiryDate: expiryStr
          };
          localStorage.setItem('dinepos_user_account', JSON.stringify(parsed));
          
          window.history.replaceState({}, '', window.location.pathname);
          triggerToast('Your billing subscription was upgraded successfully!', 'success');
        }

        setUserAccount(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, [searchParams]);

  // Load menu items for recipe mapper
  useEffect(() => {
    const fetchItems = async () => {
      if (isDemoTenant()) return;
      try {
        const itemRes = await apiRequest<any[]>('/api/menu/items');
        if (itemRes.success && itemRes.data) {
          setMenuItemsList(itemRes.data);
        }
      } catch {}
    };
    fetchItems();
  }, []);

  const handleGlobalAestheticChange = (aesthetic: string) => {
    setGlobalAesthetic(aesthetic);
    localStorage.setItem('dinepos_global_aesthetic', aesthetic);
  };

  const updateCustomBg = (val: string) => {
    setCustomBg(val);
    localStorage.setItem('dinepos_custom_bg', val);
  };
  const updateCustomCardBg = (val: string) => {
    setCustomCardBg(val);
    localStorage.setItem('dinepos_custom_card_bg', val);
  };
  const updateCustomAccent = (val: string) => {
    setCustomAccent(val);
    localStorage.setItem('dinepos_custom_accent', val);
  };
  const updateCustomText = (val: string) => {
    setCustomText(val);
    localStorage.setItem('dinepos_custom_text', val);
  };
  const updateCustomTextMuted = (val: string) => {
    setCustomTextMuted(val);
    localStorage.setItem('dinepos_custom_text_muted', val);
  };

  const handleLanguageChange = (newLang: 'en' | 'ja' | 'zh' | 'ko') => {
    setLanguage(newLang);
    localStorage.setItem('dinepos_language', newLang);
    const names = { en: 'English', ja: 'Japanese', zh: 'Chinese', ko: 'Korean' };
    triggerToast(`Dashboard language set to ${names[newLang]}.`, 'success');
  };

  const handleCurrencyChange = (newCurrency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW') => {
    setCurrency(newCurrency);
    localStorage.setItem('dinepos_currency', newCurrency);
    triggerToast(`Display currency changed to ${newCurrency}.`, 'success');
  };

  const handleTaxRateDineInChange = (val: number) => {
    setTaxRateDineIn(val);
    localStorage.setItem('dinepos_tax_rate_dine_in', val.toString());
  };

  const handleTaxRateTakeawayChange = (val: number) => {
    setTaxRateTakeaway(val);
    localStorage.setItem('dinepos_tax_rate_takeaway', val.toString());
  };

  const handleTaxRateDeliveryChange = (val: number) => {
    setTaxRateDelivery(val);
    localStorage.setItem('dinepos_tax_rate_delivery', val.toString());
  };

  const handleTaxTypeChange = (newTaxType: 'pre-tax' | 'post-tax') => {
    setTaxType(newTaxType);
    localStorage.setItem('dinepos_tax_type', newTaxType);
    triggerToast(newTaxType === 'pre-tax' ? 'Tax mode changed to Pre-tax.' : 'Tax mode changed to Post-tax.', 'success');
  };

  const updateDigitalMenuConfig = (newConfig: Partial<typeof digitalMenuConfig>) => {
    const updated = { ...digitalMenuConfig, ...newConfig };
    setDigitalMenuConfig(updated);
    localStorage.setItem('dinepos_exclusions_config', JSON.stringify(updated));
  };

  const handleSaveChanges = () => {
    localStorage.setItem('dinepos_establishment_name', establishmentName);
    localStorage.setItem('dinepos_business_address', businessAddress);
    localStorage.setItem('dinepos_contact_email', contactEmail);
    localStorage.setItem('dinepos_tax_id', taxId);
    triggerToast('Configuration changes saved successfully!', 'success');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setRestaurantLogo(dataUrl);
      localStorage.setItem('dinepos_restaurant_logo', dataUrl);
      triggerToast('Logo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setRestaurantLogo('');
    localStorage.removeItem('dinepos_restaurant_logo');
    triggerToast('Logo removed successfully!', 'success');
  };

  const handleLogout = async () => {
    await ctxLogout();
    router.push('/login');
  };

  const t = themes[globalAesthetic as keyof typeof themes] || themes['Midnight Black'];
  const isLightTheme = globalAesthetic === 'Pristine White' || globalAesthetic === 'Delicious Red';
  const hText = isLightTheme ? 'hover:text-[#1a1917]' : 'hover:text-white';
  const hBg = isLightTheme ? 'hover:bg-black/5' : 'hover:bg-white/5';
  const tr = translations[language] || translations['en'];

  return (
    <div className={`flex w-full min-h-screen ${t.bg} ${t.text} font-sans antialiased overflow-x-hidden select-none`}>
      <style dangerouslySetInnerHTML={{ __html: `:root {
        --custom-bg: ${customBg};
        --custom-card-bg: ${customCardBg};
        --custom-accent: ${customAccent};
        --custom-text: ${customText};
        --custom-text-muted: ${customTextMuted};
      }` }} />

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`w-[280px] ${t.sidebarBg} flex flex-col justify-between p-8 flex-shrink-0 z-20 h-screen fixed left-0 top-0 overflow-y-auto`}>
        <div>
          <div className="mb-10 flex items-center">
            <div className={`w-10 h-10 rounded-lg ${t.accentBg} flex items-center justify-center ${t.accentText} flex-shrink-0 mr-3 shadow-lg`}>
              <span className="material-symbols-outlined font-black">restaurant</span>
            </div>
            <div>
              <Link href="/" className={`font-serif font-bold ${t.accent} text-[18px] tracking-wide block hover:opacity-85 transition-opacity leading-none`}>
                DinePosAi
              </Link>
              <span className="font-sans text-[10px] text-white/50 font-medium mt-1 block">
                {tr.adminConsole}
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'general', icon: 'settings', label: tr.general },
              { id: 'payments', icon: 'payments', label: tr.payments },
              { id: 'hardware', icon: 'devices', label: tr.hardware },
              { id: 'staff', icon: 'badge', label: tr.staff },
              { id: 'security', icon: 'security', label: tr.security },
              { id: 'menu', icon: 'restaurant_menu', label: tr.menu },
              { id: 'analytics', icon: 'monitoring', label: tr.analytics },
              { id: 'inventory', icon: 'inventory_2', label: tr.inventory },
              { id: 'activity-log', icon: 'history', label: tr.activityLog }
            ].map(tab => (
              <button key={tab.id} type="button"
                onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
                className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? `${t.accentBg} ${t.accentText} rounded-xl`
                    : `${t.textMuted} ${hText} ${hBg} rounded-xl`
                }`}
              >
                <span className="material-symbols-outlined text-lg leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button type="button" onClick={handleLogout}
          className={`flex items-center gap-4 w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 font-bold text-[12.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
        >
          <span className="material-symbols-outlined text-lg leading-none">logout</span>
          <span>{tr.signOut}</span>
        </button>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex flex-col flex-grow min-h-screen pl-[280px]">
        {/* Top Header Bar */}
        <header className={`h-[90px] border-b ${t.border} flex items-center justify-between px-12 flex-shrink-0 bg-transparent sticky top-0 z-10 select-none backdrop-blur-md`}>
          <div className="relative">
            <span className={`material-symbols-outlined absolute left-4 top-3 ${t.textMutedDark} text-sm`}>search</span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full max-w-[240px] bg-black/20 border ${t.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
            />
          </div>
          
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => triggerToast('No new notifications.', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${t.border} hover:border-[#ffe2ab]/20 rounded-xl text-white transition-colors cursor-pointer select-none relative`}
            >
              <span className={`material-symbols-outlined text-lg ${t.textMuted}`}>notifications</span>
              <span className="absolute top-3.5 right-3.5 w-1 h-1 bg-rose-500 rounded-full"></span>
            </button>

            <button type="button" onClick={() => triggerToast('Loading help documentation...', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${t.border} hover:border-white/10 rounded-xl text-white transition-colors cursor-pointer select-none`}
            >
              <span className={`material-symbols-outlined text-lg ${t.textMuted}`}>help</span>
            </button>

            <div className={`flex items-center gap-3 ${t.cardBgOpaque} rounded-xl pl-3 pr-4 py-1.5`}>
              <div className={`w-7 h-7 rounded-lg overflow-hidden border ${t.borderStrong} flex-shrink-0`}>
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop"
                  alt="Admin user avatar"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="text-left font-sans">
                <div className={`${t.text} font-bold text-[10px] tracking-wide uppercase leading-none`}>Admin</div>
                <div className={`text-[7.5px] ${t.accentLight} font-bold tracking-widest uppercase mt-0.5 leading-none`}>{tr.administrator}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Panels Scrollable Body */}
        <div className={`flex-grow p-12 overflow-y-auto w-full mx-auto pb-32`}>
          {activeTab === 'general' && (
            <GeneralTab
              t={t}
              tr={tr}
              currency={currency}
              language={language}
              triggerToast={triggerToast}
              establishmentName={establishmentName}
              setEstablishmentName={setEstablishmentName}
              businessAddress={businessAddress}
              setBusinessAddress={setBusinessAddress}
              contactEmail={contactEmail}
              setContactEmail={setContactEmail}
              taxId={taxId}
              setTaxId={setTaxId}
              restaurantLogo={restaurantLogo}
              handleLogoUpload={handleLogoUpload}
              handleLogoRemove={handleLogoRemove}
              handleSaveChanges={handleSaveChanges}
              globalAesthetic={globalAesthetic}
              handleGlobalAestheticChange={handleGlobalAestheticChange}
              handleLanguageChange={handleLanguageChange}
              handleCurrencyChange={handleCurrencyChange}
              showLogo={showLogo}
              setShowLogo={setShowLogo}
              showTableNumber={showTableNumber}
              setShowTableNumber={setShowTableNumber}
              showServerName={showServerName}
              setShowServerName={setShowServerName}
              showOrderTimestamp={showOrderTimestamp}
              setShowOrderTimestamp={setShowOrderTimestamp}
              showTaxId={showTaxId}
              setShowTaxId={setShowTaxId}
              showQrCode={showQrCode}
              setShowQrCode={setShowQrCode}
              showSocialMedia={showSocialMedia}
              setShowSocialMedia={setShowSocialMedia}
              showServiceCharge={showServiceCharge}
              setShowServiceCharge={setShowServiceCharge}
              showCustomFooter={showCustomFooter}
              setShowCustomFooter={setShowCustomFooter}
              thankYouMessage={thankYouMessage}
              setThankYouMessage={setThankYouMessage}
              taxType={taxType}
              handleTaxTypeChange={handleTaxTypeChange}
              taxRateDineIn={taxRateDineIn}
              handleTaxRateDineInChange={handleTaxRateDineInChange}
              taxRateTakeaway={taxRateTakeaway}
              handleTaxRateTakeawayChange={handleTaxRateTakeawayChange}
              taxRateDelivery={taxRateDelivery}
              handleTaxRateDeliveryChange={handleTaxRateDeliveryChange}
              digitalMenuConfig={digitalMenuConfig}
              updateDigitalMenuConfig={updateDigitalMenuConfig}
              customBg={customBg}
              customCardBg={customCardBg}
              customAccent={customAccent}
              customText={customText}
              customTextMuted={customTextMuted}
              updateCustomBg={updateCustomBg}
              updateCustomCardBg={updateCustomCardBg}
              updateCustomAccent={updateCustomAccent}
              updateCustomText={updateCustomText}
              updateCustomTextMuted={updateCustomTextMuted}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsTab
              t={t}
              tr={tr}
              currency={currency}
              triggerToast={triggerToast}
              establishmentName={establishmentName}
              setEstablishmentName={setEstablishmentName}
              businessAddress={businessAddress}
              setBusinessAddress={setBusinessAddress}
              contactEmail={contactEmail}
              taxId={taxId}
              setTaxId={setTaxId}
              restaurantLogo={restaurantLogo}
              showTableNumber={showTableNumber}
              setShowTableNumber={setShowTableNumber}
              showServerName={showServerName}
              setShowServerName={setShowServerName}
              showOrderTimestamp={showOrderTimestamp}
              setShowOrderTimestamp={setShowOrderTimestamp}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              t={t}
              tr={tr}
              currency={currency}
              triggerToast={triggerToast}
              userAccount={userAccount}
              setUserAccount={setUserAccount}
              cmsConfig={cmsConfig}
            />
          )}

          {activeTab === 'hardware' && (
            <HardwareTab
              t={t}
              tr={tr}
              triggerToast={triggerToast}
              setAuditLogs={setAuditLogs}
            />
          )}

          {activeTab === 'staff' && (
            <StaffTab
              t={t}
              tr={tr}
              triggerToast={triggerToast}
              setAuditLogs={setAuditLogs}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              t={t}
              tr={tr}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'menu' && (
            <MenuTab
              t={t}
              tr={tr}
              currency={currency}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              t={t}
              tr={tr}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              t={t}
              tr={tr}
              currency={currency}
              triggerToast={triggerToast}
              menuItemsList={menuItemsList}
            />
          )}

          {activeTab === 'activity-log' && (
            <ActivityLogTab
              t={t}
              tr={tr}
              triggerToast={triggerToast}
            />
          )}
        </div>
      </div>

      {/* GLOBAL TOAST BANNER */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
        }`}>
          <span className="material-symbols-outlined text-base">
            {toast.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span className="text-xs font-bold font-sans tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
