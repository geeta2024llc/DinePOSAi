'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CmsConfig, getCmsConfig, saveCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';

// Curated themes mirroring the admin console theme system for visual continuity
const theme = {
  name: 'Midnight Black',
  bg: 'bg-[#0e0e0d]',
  bgSecondary: 'bg-[#161513]',
  cardBg: 'bg-[#161513]/90 border-white/5',
  cardBgOpaque: 'bg-[#161513] border-white/5',
  sidebarBg: 'bg-[#0a0a09] border-white/5',
  border: 'border-white/5',
  borderStrong: 'border-white/10',
  text: 'text-[#e5e2e1]',
  textMuted: 'text-[#A69984]/65',
  textMutedLight: 'text-[#A69984]/50',
  textMutedDark: 'text-[#A69984]/40',
  accent: 'text-[#ffc53d]',
  accentBg: 'bg-[#ffc53d]',
  accentHoverBg: 'hover:bg-[#ffb014]',
  accentText: 'text-[#2c1a00]',
  accentLight: 'text-[#ffe2ab]',
  accentLightBg: 'bg-[#ffe2ab]/10',
  accentLightBorder: 'border-[#ffe2ab]/20',
  cardHover: 'hover:bg-white/[0.01]',
  inputBg: 'bg-[#0e0e0d]',
  inputBorder: 'border-white/10',
  buttonOutline: 'border-white/10 hover:border-white/20 text-white',
  divider: 'divide-white/5',
  tagActive: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
  tagSuspended: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
  tagTrial: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
  tagExpired: 'bg-white/5 border border-white/10 text-[#A69984]/50',
};

interface Tenant {
  id: string;
  name: string;
  location: string;
  terminals: number;
  plan: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
  revenue: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joined: string;
  tier?: string;
  region?: string;
  billingFailed?: boolean;
  expiryDate: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  tenant: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastActive: string;
}

interface FleetDevice {
  id: string;
  type: 'POS' | 'KDS' | 'TABLET' | 'PRINTER';
  name: string;
  tenant: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING_LOW_PAPER';
  lastSeen: string;
  ip: string;
}

interface AuditLog {
  id: number;
  time: string;
  actor: string;
  action: string;
  tenant: string;
  type: 'info' | 'warning' | 'success' | 'security';
}

export default function SuperAdminPage() {
  // Sidebar tab matching mockup
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'access' | 'health' | 'referrals' | 'payments' | 'promocodes' | 'settings' | 'support' | 'analytics' | 'cms'>('overview');

  // CMS configuration state
  const [cmsConfig, setCmsConfig] = useState<CmsConfig>(defaultCmsConfig);

  useEffect(() => {
    setCmsConfig(getCmsConfig());
  }, []);

  const [cmsSubTab, setCmsSubTab] = useState<'homepage' | 'pricing' | 'support' | 'partners' | 'auth' | 'legal'>('homepage');

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown filter states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [tierFilter, setTierFilter] = useState<'All' | 'Business' | 'Growth' | 'Starter'>('All');
  const [regionFilter, setRegionFilter] = useState<'All' | 'North America - East' | 'Europe - West' | 'Asia Pacific'>('All');

  // Deploying update status loader
  const [deployProgress, setDeployProgress] = useState<number | null>(null);

  // Modal control states
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Support Ticket state & types
  interface SupportTicket {
    id: string;
    establishment: string;
    name: string;
    email: string;
    inquiryType: string;
    message: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    submittedAt: string;
    replyMessage?: string;
  }
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [ticketFilterType, setTicketFilterType] = useState<'ALL' | 'Technical Support' | 'Billing' | 'General Inquiry'>('ALL');

  // SaaS Pricing plans state & types
  interface PricingPlan {
    id: string;
    name: string;
    monthlyPrice: number;
    terminalsLimit: number;
    storageLimitGB: number;
    features: {
      aiConcierge: boolean;
      selfCheckout: boolean;
      analytics: boolean;
      offlineMode: boolean;
    };
  }
  const [saasPlans, setSaasPlans] = useState<PricingPlan[]>([]);
  const [showPlanEditorModal, setShowPlanEditorModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  // Secure Terminal State
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'DinePOS AI Secure Administrator Terminal',
    'Type "help" for a list of available commands.',
    'System status: OK • Nodes: 8 active',
    ''
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // Toast feedback notifications
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Stateful mock database
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: 'TEN-8821', name: 'The Obsidian Room', location: 'New York', terminals: 12, plan: 'ACTIVE', revenue: '¥342,500', status: 'ACTIVE', joined: '2024-03-12', tier: 'Business', region: 'North America - East', expiryDate: '2027-03-12' },
    { id: 'TEN-7734', name: 'Lumière Brasserie', location: 'London', terminals: 80, plan: 'ACTIVE', revenue: '¥2,450,000', status: 'ACTIVE', joined: '2023-11-05', tier: 'Growth', region: 'Europe - West', expiryDate: '2027-11-05' },
    { id: 'TEN-5512', name: 'Cafe Zenith', location: 'Kobarid', terminals: 6, plan: 'SUSPENDED', revenue: '¥28,000', status: 'SUSPENDED', joined: '2025-09-02', tier: 'Starter', region: 'Asia Pacific', billingFailed: true, expiryDate: '2025-09-02' },
    { id: 'TEN-9021', name: 'Aman Resorts', location: 'Tokyo', terminals: 45, plan: 'ACTIVE', revenue: '¥1,280,000', status: 'ACTIVE', joined: '2024-01-18', tier: 'Business', region: 'Asia Pacific', expiryDate: '2027-01-18' },
    { id: 'TEN-4581', name: 'Bouchon Bakery', location: 'Las Vegas', terminals: 8, plan: 'TRIAL', revenue: '¥45,000', status: 'ACTIVE', joined: '2026-05-20', tier: 'Starter', region: 'North America - East', expiryDate: '2026-07-20' },
    { id: 'TEN-2195', name: 'Gaggan Anand', location: 'Bangkok', terminals: 14, plan: 'SUSPENDED', revenue: '¥122,000', status: 'SUSPENDED', joined: '2025-02-15', tier: 'Growth', region: 'Asia Pacific', expiryDate: '2025-02-15' },
  ]);

  const [showTenantDetailsModal, setShowTenantDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingExpiryDate, setEditingExpiryDate] = useState('');
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [attentionOnlyFilter, setAttentionOnlyFilter] = useState(false);

  useEffect(() => {
    const handleCloseMenus = () => setActiveActionMenuId(null);
    window.addEventListener('click', handleCloseMenus);
    return () => window.removeEventListener('click', handleCloseMenus);
  }, []);

  const checkExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return 'none';
    const today = new Date();
    const expiry = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    if (expiry < today) return 'expired';
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return 'warning';
    return 'active';
  };

  const getExpiryCountdownText = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const days = Math.abs(diffDays);
      return `Expired ${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  };

  const handleQuickRenew = (tenantId: string, days: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      const currentExpiry = new Date(t.expiryDate);
      currentExpiry.setDate(currentExpiry.getDate() + days);
      const newExpiryStr = currentExpiry.toISOString().split('T')[0];
      
      triggerToast(`Subscription for ${t.name} extended by ${days} days!`, 'success');
      
      setAuditLogs(logs => [
        {
          id: Date.now(),
          time: 'Just now',
          actor: 'Super Admin',
          action: `Extended subscription expiry for "${t.name}" by ${days} days to ${newExpiryStr}`,
          tenant: t.name,
          type: 'success'
        },
        ...logs
      ]);
      return { 
        ...t, 
        expiryDate: newExpiryStr, 
        status: 'ACTIVE',
        plan: 'ACTIVE' 
      };
    }));
  };

  const handleRetryBilling = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      
      triggerToast(`Re-ran card billing for ${t.name}. Payment processed successfully!`, 'success');
      
      setAuditLogs(logs => [
        {
          id: Date.now(),
          time: 'Just now',
          actor: 'Super Admin',
          action: `Cleared billing failed status for "${t.name}" via manual settlement`,
          tenant: t.name,
          type: 'success'
        },
        ...logs
      ]);
      return { ...t, billingFailed: false, status: 'ACTIVE', plan: 'ACTIVE' };
    }));
  };

  const handleDeleteTenant = (tenantId: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete business tenant "${name}"? This action cannot be undone.`)) {
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      triggerToast(`Business tenant "${name}" has been deleted.`, 'success');
      setAuditLogs(logs => [
        {
          id: Date.now(),
          time: 'Just now',
          actor: 'Super Admin',
          action: `Permanently removed business tenant "${name}" from the system registry`,
          tenant: name,
          type: 'warning'
        },
        ...logs
      ]);
    }
  };

  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: 'adm-1', name: 'Eric Ripert', email: 'ripert@lebernardin.com', tenant: 'Le Bernardin Group', status: 'ACTIVE', lastActive: '2h ago' },
    { id: 'adm-2', name: 'Vladislav Doronin', email: 'doronin@aman.com', tenant: 'Aman Resorts', status: 'ACTIVE', lastActive: '5m ago' },
    { id: 'adm-3', name: 'Nick Jones', email: 'nick@sohohouse.com', tenant: 'Soho House', status: 'ACTIVE', lastActive: '1d ago' },
    { id: 'adm-4', name: 'Thomas Keller', email: 'keller@bouchon.com', tenant: 'Bouchon Bakery', status: 'ACTIVE', lastActive: '4h ago' },
    { id: 'adm-5', name: 'Ana Ros', email: 'ana@hisafranko.com', tenant: 'Hisa Franko', status: 'INACTIVE', lastActive: '12d ago' },
    { id: 'adm-6', name: 'Gaggan Anand', email: 'gaggan@gaggan.com', tenant: 'Gaggan Anand', status: 'SUSPENDED', lastActive: '30d ago' },
  ]);

  const [fleet, setFleet] = useState<FleetDevice[]>([
    { id: 'dev-1', type: 'POS', name: 'FOH Maitre D Terminal', tenant: 'Le Bernardin Group', status: 'ONLINE', lastSeen: 'Just now', ip: '192.168.1.101' },
    { id: 'dev-2', type: 'KDS', name: 'Expo Kitchen Main Screen', tenant: 'Le Bernardin Group', status: 'ONLINE', lastSeen: '1m ago', ip: '192.168.1.201' },
    { id: 'dev-3', type: 'TABLET', name: 'Bar Right Handheld POS', tenant: 'Aman Resorts', status: 'ONLINE', lastSeen: 'Just now', ip: '10.0.4.12' },
    { id: 'dev-4', type: 'PRINTER', name: 'Kitchen Hot Ticket Printer', tenant: 'Aman Resorts', status: 'WARNING_LOW_PAPER', lastSeen: '5m ago', ip: '10.0.4.88' },
    { id: 'dev-5', type: 'POS', name: 'Main FOH Register', tenant: 'Soho House', status: 'ONLINE', lastSeen: 'Just now', ip: '172.16.8.10' },
    { id: 'dev-6', type: 'KDS', name: 'Pastry Station display', tenant: 'Soho House', status: 'OFFLINE', lastSeen: '3h ago', ip: '172.16.8.35' },
    { id: 'dev-7', type: 'POS', name: 'Bakery FOH Terminal', tenant: 'Bouchon Bakery', status: 'ONLINE', lastSeen: '10m ago', ip: '192.168.22.5' },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 1, time: '2m ago', actor: 'Vladislav Doronin (Admin)', action: 'Authorized menu update "Matsuhisa Caviar"', tenant: 'Aman Resorts', type: 'info' },
    { id: 2, time: '12m ago', actor: 'Eric Ripert (Admin)', action: 'Authorized void check table 12 ($342.50)', tenant: 'Le Bernardin Group', type: 'warning' },
    { id: 3, time: '45m ago', actor: 'System Daemon', action: 'Daily sales metrics synchronized', tenant: 'Soho House', type: 'success' },
    { id: 4, time: '1h ago', actor: 'Super Admin', action: 'Suspended business "Gaggan Anand" due to expired card billing', tenant: 'Gaggan Anand', type: 'security' },
    { id: 5, time: '2h ago', actor: 'Super Admin', action: 'Triggered password reset link generation for Nick Jones', tenant: 'Soho House', type: 'security' },
    { id: 6, time: '3h ago', actor: 'Thomas Keller (Admin)', action: 'Updated hardware gateway interface settings', tenant: 'Bouchon Bakery', type: 'info' },
  ]);

  // Support ticket initialization & sync
  useEffect(() => {
    const stored = localStorage.getItem('dinepos_support_tickets');
    if (stored) {
      setTickets(JSON.parse(stored));
    } else {
      const initial: SupportTicket[] = [
        {
          id: 'TCK-481902',
          establishment: 'Le Bernardin Group',
          name: 'Eric Ripert',
          email: 'ripert@lebernardin.com',
          inquiryType: 'Technical Support',
          message: 'We are experiencing intermittent latency spikes on KDS screen 2 in the pastry station. Can you check if the node has the latest firmware?',
          status: 'OPEN',
          submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45m ago
        },
        {
          id: 'TCK-294810',
          establishment: 'Cafe Zenith',
          name: 'Jane Doe',
          email: 'jane@cafezenith.com',
          inquiryType: 'Billing',
          message: 'Our corporate card on file was replaced last week. We received a payment failure notification today. We need to manually retry the payment for the growth plan.',
          status: 'IN_PROGRESS',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3h ago
        },
        {
          id: 'TCK-902183',
          establishment: 'Lumière Brasserie',
          name: 'Pierre Gagnaire',
          email: 'pierre@lumiere.com',
          inquiryType: 'General Inquiry',
          message: 'Is there a limit to the number of menu categories we can configure? We are planning a spring menu expansion and want to ensure compatibility.',
          status: 'RESOLVED',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2d ago
          replyMessage: 'Hello Pierre, there is no hard limit on menu categories in our system. However, for the best visual experience on the customer-facing menu and cashier POS, we recommend keeping it under 10 categories. Let us know if you need help organizing them!'
        }
      ];
      localStorage.setItem('dinepos_support_tickets', JSON.stringify(initial));
      setTickets(initial);
    }

    // Listener for new support tickets submitted while open
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_support_tickets' && e.newValue) {
        setTickets(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // SaaS Plans initialization
  useEffect(() => {
    const stored = localStorage.getItem('dinepos_saas_plans');
    if (stored) {
      setSaasPlans(JSON.parse(stored));
    } else {
      const initial: PricingPlan[] = [
        {
          id: 'plan-standard',
          name: 'Starter',
          monthlyPrice: 3980,
          terminalsLimit: 5,
          storageLimitGB: 10,
          features: { aiConcierge: false, selfCheckout: true, analytics: false, offlineMode: false }
        },
        {
          id: 'plan-growth',
          name: 'Growth',
          monthlyPrice: 6980,
          terminalsLimit: 15,
          storageLimitGB: 100,
          features: { aiConcierge: true, selfCheckout: true, analytics: true, offlineMode: false }
        },
        {
          id: 'plan-premium',
          name: 'Business',
          monthlyPrice: 12980,
          terminalsLimit: 50,
          storageLimitGB: 1000,
          features: { aiConcierge: true, selfCheckout: true, analytics: true, offlineMode: true }
        }
      ];
      localStorage.setItem('dinepos_saas_plans', JSON.stringify(initial));
      setSaasPlans(initial);
    }
  }, []);

  // Global Settings Feature Toggles state
  const [globalFeatures, setGlobalFeatures] = useState({
    aiConcierge: true,
    selfCheckout: true,
    offlineMode: false,
    multiCurrency: false,
    backupInterval: 'daily',
    backupRetention: 10,
    llmApiKey: '',
    llmModel: 'gpt-4o'
  });
  useEffect(() => {
    const stored = localStorage.getItem('dinepos_global_features');
    if (stored) setGlobalFeatures(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem('dinepos_global_features', JSON.stringify(globalFeatures));
  }, [globalFeatures]);

  // Referral ambassador state
  interface ReferralBusiness {
    id: string;
    name: string;
    contact: string;
    joinedDate: string;
    status: string;
    services: string[];
    reward: number;
  }
  interface Ambassador {
    id: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    bank: { bankName: string; accountNumber: string; routingNumber: string; accountHolder: string; };
    invitedBusinesses: ReferralBusiness[];
    pendingRewards: number;
    paidRewards: number;
    joinedDate: string;
    status: string;
  }
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutTarget, setPayoutTarget] = useState<Ambassador | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  interface PayoutTx {
    id: string;
    ambassadorId: string;
    ambassadorName: string;
    amount: number;
    note: string;
    date: string;
  }
  const [payoutHistory, setPayoutHistory] = useState<PayoutTx[]>([]);

  // Referral program configuration state
  type ReferralConfig = {
    programActive: boolean;
    commissionRate: number;
    rewardPerSignup: number;
    minPayoutThreshold: number;
    referralBaseUrl: string;
    cookieDuration: number;
    autoRewardOnConversion: boolean;
    notifyAmbassadorOnSignup: boolean;
    notifyAmbassadorOnPayout: boolean;
    paymentMethod: 'bank_transfer' | 'ach' | 'wire' | 'paypal';
  };
  const defaultReferralConfig: ReferralConfig = {
    programActive: true,
    commissionRate: 10,
    rewardPerSignup: 150,
    minPayoutThreshold: 100,
    referralBaseUrl: 'https://dineposai.com/signup?ref=',
    cookieDuration: 30,
    autoRewardOnConversion: true,
    notifyAmbassadorOnSignup: true,
    notifyAmbassadorOnPayout: true,
    paymentMethod: 'bank_transfer',
  };
  const [referralConfig, setReferralConfig] = useState<ReferralConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dinepos_referral_config');
      if (saved) { try { return { ...defaultReferralConfig, ...JSON.parse(saved) }; } catch { /* */ } }
    }
    return defaultReferralConfig;
  });
  const [referralSubTab, setReferralSubTab] = useState<'overview' | 'analytics' | 'codes' | 'config'>('overview');
  const [batchPayoutMode, setBatchPayoutMode] = useState(false);
  const [selectedAmbIds, setSelectedAmbIds] = useState<string[]>([]);

  // Add Ambassador modal state
  const [showAddAmbassadorModal, setShowAddAmbassadorModal] = useState(false);
  const [newAmbassadorData, setNewAmbassadorData] = useState({
    name: '', email: '', phone: '', code: '',
    bankName: '', accountHolder: '', accountNumber: '', routingNumber: '',
  });

  // Edit Bank Details modal state (super-admin can update ambassador bank details)
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [editBankTarget, setEditBankTarget] = useState<Ambassador | null>(null);
  const [editBankData, setEditBankData] = useState({ bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' });

  // QR Poster modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalAmbassador, setQrModalAmbassador] = useState<Ambassador | null>(null);

  // Ambassador search/filter state
  const [ambassadorSearch, setAmbassadorSearch] = useState('');
  const [ambassadorStatusFilter, setAmbassadorStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Edit Ambassador modal state
  const [showEditAmbassadorModal, setShowEditAmbassadorModal] = useState(false);
  const [editAmbassadorTarget, setEditAmbassadorTarget] = useState<Ambassador | null>(null);
  const [editAmbassadorData, setEditAmbassadorData] = useState({ name: '', email: '', phone: '', code: '' });

  // Add Referred Business modal state
  const [showAddReferralModal, setShowAddReferralModal] = useState(false);
  const [addReferralTarget, setAddReferralTarget] = useState<Ambassador | null>(null);
  const [newReferralData, setNewReferralData] = useState({ name: '', contact: '', services: [] as string[], status: 'Pending' });

  // Partner Dashboard preview modal state
  const [showPartnerViewModal, setShowPartnerViewModal] = useState(false);
  const [partnerViewAmbassador, setPartnerViewAmbassador] = useState<Ambassador | null>(null);

  // Locations view toggle
  const [locationsView, setLocationsView] = useState<'card' | 'list'>('list');

  // Promo Code types and state
  interface PromoCodeUsage {
    tenantId: string;
    tenantName: string;
    usedAt: string;
    planId: string;
    discountAmount: number;
  }
  interface PromoCode {
    id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    applicablePlan: string;
    maxUses: number | null;
    currentUses: number;
    expiresAt: string | null;
    status: 'active' | 'inactive' | 'expired';
    createdAt: string;
    usageLog: PromoCodeUsage[];
  }
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showCreatePromoModal, setShowCreatePromoModal] = useState(false);
  const [showPromoDetailModal, setShowPromoDetailModal] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoFilterStatus, setPromoFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [newPromoData, setNewPromoData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: '',
    applicablePlan: 'all',
    maxUses: '',
    expiresAt: '',
  });

  const generateReferralCode = (name: string) => {
    const base = name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'AMB';
    return `${base}${Math.floor(100 + Math.random() * 900)}`;
  };

  const handleAddAmbassador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmbassadorData.name || !newAmbassadorData.email) {
      triggerToast('Name and email are required.', 'info');
      return;
    }
    const code = newAmbassadorData.code.trim() || generateReferralCode(newAmbassadorData.name);
    const created: Ambassador = {
      id: `amb-${Date.now()}`,
      name: newAmbassadorData.name,
      email: newAmbassadorData.email,
      phone: newAmbassadorData.phone,
      code,
      bank: {
        bankName: newAmbassadorData.bankName,
        accountNumber: newAmbassadorData.accountNumber
          ? newAmbassadorData.accountNumber.replace(/.(?=.{4})/g, '•')
          : '',
        routingNumber: newAmbassadorData.routingNumber,
        accountHolder: newAmbassadorData.accountHolder,
      },
      invitedBusinesses: [],
      pendingRewards: 0,
      paidRewards: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const updated = [...ambassadors, created];
    setAmbassadors(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updated));
    setNewAmbassadorData({ name: '', email: '', phone: '', code: '', bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' });
    setShowAddAmbassadorModal(false);
    triggerToast(`Ambassador "${created.name}" registered with code ${code}.`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Registered new ambassador "${created.name}" (${created.email}) with referral code ${code}`,
      tenant: 'Referral Program', type: 'success'
    }, ...prev]);
  };

  // Open bank-edit modal for a given ambassador
  const handleOpenEditBank = (amb: Ambassador) => {
    setEditBankTarget(amb);
    setEditBankData({
      bankName: amb.bank.bankName,
      accountHolder: amb.bank.accountHolder,
      accountNumber: '',   // always blank so they re-enter for security
      routingNumber: amb.bank.routingNumber,
    });
    setShowEditBankModal(true);
  };

  const handleSaveEditBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBankTarget) return;
    if (!editBankData.bankName || !editBankData.accountHolder || !editBankData.routingNumber) {
      triggerToast('Bank name, account holder and routing number are required.', 'info');
      return;
    }
    const updated = ambassadors.map(a =>
      a.id === editBankTarget.id
        ? {
            ...a,
            bank: {
              bankName: editBankData.bankName,
              accountHolder: editBankData.accountHolder,
              accountNumber: editBankData.accountNumber
                ? editBankData.accountNumber.replace(/.(?=.{4})/g, '•')
                : a.bank.accountNumber,
              routingNumber: editBankData.routingNumber,
            }
          }
        : a
    );
    setAmbassadors(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updated));
    setShowEditBankModal(false);
    setEditBankTarget(null);
    triggerToast(`Bank details updated for "${editBankTarget.name}".`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Updated payout bank details for ambassador "${editBankTarget.name}"`,
      tenant: 'Referral Program', type: 'security'
    }, ...prev]);
  };

  // Export tenants list as CSV
  const handleExportTenants = () => {
    const header = ['ID', 'Name', 'Location', 'Tier', 'Region', 'Plan', 'Status', 'Terminals', 'Revenue', 'Joined', 'Expiry Date'];
    const rows = tenants.map(t => [t.id, t.name, t.location, t.tier || '', t.region || '', t.plan, t.status, t.terminals, t.revenue, t.joined, t.expiryDate]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dineposai_tenants_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    triggerToast('Tenant list exported as CSV.', 'success');
  };

  // Export referral/ambassador data as CSV
  const handleExportReferrals = () => {
    const header = ['ID', 'Name', 'Email', 'Phone', 'Code', 'Status', 'Joined', 'Pending Rewards', 'Paid Rewards', 'Referrals Count', 'Bank Name', 'Account Holder'];
    const rows = ambassadors.map(a => [
      a.id, a.name, a.email, a.phone, a.code, a.status, a.joinedDate,
      a.pendingRewards, a.paidRewards, a.invitedBusinesses.length,
      a.bank.bankName, a.bank.accountHolder
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dineposai_referrals_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    triggerToast('Referral data exported as CSV.', 'success');
  };

  // Export payout history as CSV
  const handleExportPayoutHistory = () => {
    const header = ['TX ID', 'Date', 'Ambassador', 'Amount (USD)', 'Note'];
    const rows = payoutHistory.map(tx => [tx.id, tx.date, tx.ambassadorName, tx.amount.toFixed(2), tx.note]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dineposai_payouts_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    triggerToast('Payout history exported as CSV.', 'success');
  };

  const handleToggleAmbassadorStatus = (ambId: string) => {
    const updated = ambassadors.map(a => a.id === ambId
      ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' }
      : a
    );
    setAmbassadors(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updated));
    const amb = updated.find(a => a.id === ambId);
    triggerToast(`Ambassador "${amb?.name}" status set to ${amb?.status}.`, 'success');
  };

  const handleEditAmbassador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmbassadorTarget) return;
    if (!editAmbassadorData.name || !editAmbassadorData.email) {
      triggerToast('Name and email are required.', 'info');
      return;
    }
    const normalizedCode = editAmbassadorData.code.toUpperCase().replace(/[^A-Z0-9]/g, '') || editAmbassadorTarget.code;
    if (normalizedCode !== editAmbassadorTarget.code && ambassadors.some(a => a.id !== editAmbassadorTarget.id && a.code === normalizedCode)) {
      triggerToast(`Code "${normalizedCode}" is already used by another ambassador.`, 'info');
      return;
    }
    const updated = ambassadors.map(a => a.id === editAmbassadorTarget.id
      ? { ...a, name: editAmbassadorData.name, email: editAmbassadorData.email, phone: editAmbassadorData.phone, code: normalizedCode }
      : a
    );
    setAmbassadors(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updated));
    setShowEditAmbassadorModal(false);
    setEditAmbassadorTarget(null);
    triggerToast(`Ambassador "${editAmbassadorData.name}" updated successfully.`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Updated ambassador profile for "${editAmbassadorData.name}" — code: ${normalizedCode}`,
      tenant: 'Referral Program', type: 'security'
    }, ...prev]);
  };

  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addReferralTarget || !newReferralData.name.trim() || !newReferralData.contact.trim()) {
      triggerToast('Business name and contact email are required.', 'info');
      return;
    }
    const isConverted = newReferralData.status === 'Subscribed' || newReferralData.status === 'Active';
    const reward = isConverted ? referralConfig.rewardPerSignup : 0;
    const newBiz: ReferralBusiness = {
      id: `biz-${Date.now()}`,
      name: newReferralData.name.trim(),
      contact: newReferralData.contact.trim(),
      joinedDate: new Date().toISOString().split('T')[0],
      status: newReferralData.status,
      services: newReferralData.services,
      reward,
    };
    const updated = ambassadors.map(a => a.id === addReferralTarget.id
      ? { ...a, invitedBusinesses: [...a.invitedBusinesses, newBiz], pendingRewards: a.pendingRewards + reward }
      : a
    );
    setAmbassadors(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updated));
    setShowAddReferralModal(false);
    setAddReferralTarget(null);
    setNewReferralData({ name: '', contact: '', services: [], status: 'Pending' });
    triggerToast(`Referral "${newBiz.name}" logged for ${addReferralTarget.name}.${reward > 0 ? ` $${reward} reward queued.` : ''}`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Manually logged referral "${newBiz.name}" for ambassador "${addReferralTarget.name}" — status: ${newBiz.status}`,
      tenant: 'Referral Program', type: 'info'
    }, ...prev]);
  };

  useEffect(() => {
    const stored = localStorage.getItem('dinepos_referrals');
    if (stored) {
      setAmbassadors(JSON.parse(stored));
    } else {
      const initial: Ambassador[] = [
        {
          id: 'amb-1',
          name: 'Marcus Nguyen',
          email: 'marcus@restaurantgrowth.com',
          phone: '+1 415 555 0182',
          code: 'MARCUS421',
          bank: { bankName: 'Wells Fargo', accountNumber: '••••7821', routingNumber: '121000248', accountHolder: 'Marcus Nguyen LLC' },
          invitedBusinesses: [
            { id: 'biz-1', name: 'Nobu Tokyo', contact: 'chef@nobu.com', joinedDate: '2026-03-18', status: 'Subscribed', services: ['POS', 'KDS', 'Analytics'], reward: 150 },
            { id: 'biz-2', name: 'Sketch London', contact: 'info@sketch.uk', joinedDate: '2026-04-02', status: 'Active', services: ['POS', 'Self Checkout'], reward: 150 },
            { id: 'biz-3', name: 'Osteria Francescana', contact: 'massimo@osteria.it', joinedDate: '2026-04-22', status: 'Pending', services: ['POS'], reward: 0 },
          ],
          pendingRewards: 300,
          paidRewards: 600,
          joinedDate: '2026-01-10',
          status: 'active',
        },
        {
          id: 'amb-2',
          name: 'Priya Sharma',
          email: 'priya@hospitalitybridge.io',
          phone: '+44 7700 900891',
          code: 'PRIYA882',
          bank: { bankName: 'HSBC UK', accountNumber: '••••3309', routingNumber: 'MIDLGB22', accountHolder: 'Priya Sharma Consulting' },
          invitedBusinesses: [
            { id: 'biz-4', name: 'Hawksmoor Manchester', contact: 'gm@hawksmoor.com', joinedDate: '2026-02-14', status: 'Subscribed', services: ['POS', 'KDS'], reward: 150 },
            { id: 'biz-5', name: 'Hakkasan Dubai', contact: 'dubai@hakkasan.com', joinedDate: '2026-05-01', status: 'Active', services: ['POS', 'AI Concierge', 'Analytics'], reward: 150 },
          ],
          pendingRewards: 150,
          paidRewards: 1050,
          joinedDate: '2025-11-20',
          status: 'active',
        },
        {
          id: 'amb-3',
          name: 'Diego Vasquez',
          email: 'diego@chainops.mx',
          phone: '+52 55 5555 9020',
          code: 'DIEGO334',
          bank: { bankName: '', accountNumber: '', routingNumber: '', accountHolder: '' },
          invitedBusinesses: [
            { id: 'biz-6', name: 'Quintonil', contact: 'jorge@quintonil.com', joinedDate: '2026-04-11', status: 'Pending', services: ['POS'], reward: 0 },
          ],
          pendingRewards: 0,
          paidRewards: 0,
          joinedDate: '2026-03-30',
          status: 'active',
        },
        {
          id: 'amb-4',
          name: 'Christine LeBlanc',
          email: 'christine@nexthospitality.ca',
          phone: '+1 604 555 0334',
          code: 'CHRI117',
          bank: { bankName: 'RBC Royal Bank', accountNumber: '••••5501', routingNumber: '000300002', accountHolder: 'Christine LeBlanc' },
          invitedBusinesses: [],
          pendingRewards: 0,
          paidRewards: 250,
          joinedDate: '2025-09-15',
          status: 'suspended',
        },
      ];
      localStorage.setItem('dinepos_referrals', JSON.stringify(initial));
      setAmbassadors(initial);
    }
    const storedPay = localStorage.getItem('dinepos_referral_payouts');
    if (storedPay) {
      setPayoutHistory(JSON.parse(storedPay));
    }
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_referrals' && e.newValue) setAmbassadors(JSON.parse(e.newValue));
      if (e.key === 'dinepos_referral_payouts' && e.newValue) setPayoutHistory(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Promo codes initialization & sync
  useEffect(() => {
    const stored = localStorage.getItem('dinepos_promo_codes');
    if (stored) {
      setPromoCodes(JSON.parse(stored));
    } else {
      const initial: PromoCode[] = [
        {
          id: 'promo-1',
          code: 'LAUNCH50',
          description: '50% off first month for new restaurant signups',
          discountType: 'percentage',
          discountValue: 50,
          applicablePlan: 'all',
          maxUses: 100,
          currentUses: 47,
          expiresAt: '2026-09-30',
          status: 'active',
          createdAt: '2026-01-15',
          usageLog: [
            { tenantId: 'TEN-4581', tenantName: 'Bouchon Bakery', usedAt: '2026-05-20', planId: 'plan-standard', discountAmount: 49.50 },
            { tenantId: 'TEN-8821', tenantName: 'The Obsidian Room', usedAt: '2026-03-12', planId: 'plan-growth', discountAmount: 149.50 },
          ]
        },
        {
          id: 'promo-2',
          code: 'ENTERPRISE30',
          description: '30% off Enterprise Growth plan — partner tier only',
          discountType: 'percentage',
          discountValue: 30,
          applicablePlan: 'plan-growth',
          maxUses: 50,
          currentUses: 18,
          expiresAt: '2026-12-31',
          status: 'active',
          createdAt: '2026-02-01',
          usageLog: []
        },
        {
          id: 'promo-3',
          code: 'FLAT100',
          description: '$100 flat discount on any plan — ambassador referral perk',
          discountType: 'flat',
          discountValue: 100,
          applicablePlan: 'all',
          maxUses: null,
          currentUses: 23,
          expiresAt: null,
          status: 'active',
          createdAt: '2026-03-10',
          usageLog: []
        },
        {
          id: 'promo-4',
          code: 'WINTER20',
          description: '20% winter season promotional discount',
          discountType: 'percentage',
          discountValue: 20,
          applicablePlan: 'all',
          maxUses: 200,
          currentUses: 200,
          expiresAt: '2026-02-28',
          status: 'expired',
          createdAt: '2025-12-01',
          usageLog: []
        },
        {
          id: 'promo-5',
          code: 'BUSINESS10000',
          description: '¥10,000 off Business — currently paused for review',
          discountType: 'flat',
          discountValue: 10000,
          applicablePlan: 'plan-premium',
          maxUses: 30,
          currentUses: 8,
          expiresAt: '2026-12-31',
          status: 'inactive',
          createdAt: '2026-04-01',
          usageLog: []
        },
      ];
      localStorage.setItem('dinepos_promo_codes', JSON.stringify(initial));
      setPromoCodes(initial);
    }
    const handlePromoStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_promo_codes' && e.newValue) setPromoCodes(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handlePromoStorageChange);
    return () => window.removeEventListener('storage', handlePromoStorageChange);
  }, []);

  const generatePromoCode = () => {
    const words = ['DINE', 'POS', 'SAVE', 'DEAL', 'BOOST', 'PRO', 'VIP', 'PLUS', 'PRIME', 'GOLD'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${word}${num}`;
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoData.code.trim() || !newPromoData.description.trim() || !newPromoData.discountValue) {
      triggerToast('Code, description and discount value are required.', 'info');
      return;
    }
    const discountVal = parseFloat(newPromoData.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      triggerToast('Discount value must be a positive number.', 'info');
      return;
    }
    if (newPromoData.discountType === 'percentage' && discountVal > 100) {
      triggerToast('Percentage discount cannot exceed 100%.', 'info');
      return;
    }
    const normalized = newPromoData.code.toUpperCase().replace(/\s/g, '');
    if (promoCodes.some(p => p.code === normalized)) {
      triggerToast(`Code "${normalized}" already exists.`, 'info');
      return;
    }
    const created: PromoCode = {
      id: `promo-${Date.now()}`,
      code: normalized,
      description: newPromoData.description.trim(),
      discountType: newPromoData.discountType,
      discountValue: discountVal,
      applicablePlan: newPromoData.applicablePlan,
      maxUses: newPromoData.maxUses ? parseInt(newPromoData.maxUses) : null,
      currentUses: 0,
      expiresAt: newPromoData.expiresAt || null,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      usageLog: [],
    };
    const updated = [...promoCodes, created];
    setPromoCodes(updated);
    localStorage.setItem('dinepos_promo_codes', JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_promo_codes', newValue: JSON.stringify(updated) }));
    setNewPromoData({ code: '', description: '', discountType: 'percentage', discountValue: '', applicablePlan: 'all', maxUses: '', expiresAt: '' });
    setShowCreatePromoModal(false);
    triggerToast(`Promo code "${created.code}" created!`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Created promo code "${created.code}" — ${created.discountType === 'percentage' ? `${created.discountValue}% off` : `$${created.discountValue} flat`} on ${created.applicablePlan === 'all' ? 'all plans' : (saasPlans.find(s => s.id === created.applicablePlan)?.name || created.applicablePlan)}`,
      tenant: 'Promo Codes', type: 'success'
    }, ...prev]);
  };

  const handleTogglePromoStatus = (id: string) => {
    const updated = promoCodes.map(p => {
      if (p.id !== id || p.status === 'expired') return p;
      return { ...p, status: (p.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' };
    });
    setPromoCodes(updated);
    localStorage.setItem('dinepos_promo_codes', JSON.stringify(updated));
    const code = updated.find(p => p.id === id);
    triggerToast(`Promo code "${code?.code}" is now ${code?.status}.`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `${code?.status === 'active' ? 'Activated' : 'Deactivated'} promo code "${code?.code}"`,
      tenant: 'Promo Codes', type: 'security'
    }, ...prev]);
  };

  const handleDeletePromoCode = (id: string, code: string) => {
    const updated = promoCodes.filter(p => p.id !== id);
    setPromoCodes(updated);
    localStorage.setItem('dinepos_promo_codes', JSON.stringify(updated));
    if (selectedPromoCode?.id === id) setSelectedPromoCode(null);
    triggerToast(`Promo code "${code}" permanently deleted.`, 'success');
    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Permanently deleted promo code "${code}"`,
      tenant: 'Promo Codes', type: 'security'
    }, ...prev]);
  };

  const handleExportPromoCodes = () => {
    const header = ['Code', 'Description', 'Type', 'Value', 'Applicable Plan', 'Max Uses', 'Current Uses', 'Expires', 'Status', 'Created'];
    const rows = promoCodes.map(p => [
      p.code, p.description, p.discountType,
      p.discountType === 'percentage' ? `${p.discountValue}%` : `$${p.discountValue}`,
      p.applicablePlan === 'all' ? 'All Plans' : (saasPlans.find(s => s.id === p.applicablePlan)?.name || p.applicablePlan),
      p.maxUses ?? 'Unlimited', p.currentUses,
      p.expiresAt ?? 'No Expiry', p.status, p.createdAt
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dineposai_promocodes_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    triggerToast('Promo codes exported as CSV.', 'success');
  };

  const handleProcessPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutTarget || !payoutAmount) return;
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) { triggerToast('Invalid payout amount.', 'info'); return; }
    if (amount > payoutTarget.pendingRewards) {
      triggerToast(`Amount exceeds pending balance of $${payoutTarget.pendingRewards.toFixed(2)}.`, 'info');
      return;
    }

    const updated = ambassadors.map(a => a.id === payoutTarget.id
      ? { ...a, pendingRewards: Math.max(0, a.pendingRewards - amount), paidRewards: a.paidRewards + amount }
      : a
    );
    setAmbassadors(updated);
    localStorage.setItem('dinepos_referrals', JSON.stringify(updated));

    const newTx: PayoutTx = {
      id: `PAY-${Date.now()}`,
      ambassadorId: payoutTarget.id,
      ambassadorName: payoutTarget.name,
      amount,
      note: payoutNote || 'Manual referral reward payout',
      date: new Date().toISOString().split('T')[0]
    };
    const updatedPay = [newTx, ...payoutHistory];
    setPayoutHistory(updatedPay);
    localStorage.setItem('dinepos_referral_payouts', JSON.stringify(updatedPay));

    setAuditLogs(prev => [{
      id: Date.now(),
      time: 'Just now',
      actor: 'Super Admin',
      action: `Processed referral payout of $${amount.toFixed(2)} to Ambassador "${payoutTarget.name}"`,
      tenant: 'Referral Program',
      type: 'success'
    }, ...prev]);

    triggerToast(`Payout of $${amount.toFixed(2)} processed for ${payoutTarget.name}!`, 'success');
    setShowPayoutModal(false);
    setPayoutTarget(null);
    setPayoutAmount('');
    setPayoutNote('');
  };

  // Form Fields
  const [newTenantData, setNewTenantData] = useState({ name: '', location: '', plan: 'TRIAL' as Tenant['plan'], expiryDate: '' });
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', tenant: '' });

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleDeployUpdate = () => {
    if (deployProgress !== null) return;
    setDeployProgress(0);
    triggerToast('Starting fleet-wide system update deployment (v1.0.4)...', 'info');

    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 10;
      if (progressVal >= 100) {
        clearInterval(interval);
        setDeployProgress(null);
        triggerToast('System update successfully deployed across all global nodes!', 'success');
        
        // Log to audit trail
        setAuditLogs(prev => [
          {
            id: Date.now(),
            time: 'Just now',
            actor: 'Super Admin',
            action: 'Deployed system update v1.0.4 across all active terminals and KDS nodes',
            tenant: 'Global System',
            type: 'success'
          },
          ...prev
        ]);
      } else {
        setDeployProgress(progressVal);
      }
    }, 300);
  };

  // Add new business tenant logic
  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.name || !newTenantData.location) {
      triggerToast('Please fill in all tenant fields.', 'info');
      return;
    }
    const defaultExpiry = new Date();
    if (newTenantData.plan === 'TRIAL') {
      defaultExpiry.setDate(defaultExpiry.getDate() + 14);
    } else {
      defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
    }
    const finalExpiryDate = newTenantData.expiryDate || defaultExpiry.toISOString().split('T')[0];

    const created: Tenant = {
      id: `TEN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTenantData.name,
      location: newTenantData.location,
      terminals: 0,
      plan: newTenantData.plan,
      revenue: '¥0',
      status: newTenantData.plan === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      joined: new Date().toISOString().split('T')[0],
      tier: 'Starter',
      region: 'North America - East',
      expiryDate: finalExpiryDate
    };
    setTenants(prev => [...prev, created]);
    setNewTenantData({ name: '', location: '', plan: 'TRIAL', expiryDate: '' });
    setShowAddTenantModal(false);
    triggerToast(`Business tenant "${created.name}" created successfully!`, 'success');
    
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Registered new business tenant "${created.name}"`,
        tenant: created.name,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Save tenant expiry date and configuration modifications
  const handleSaveTenantExpiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    setTenants(prev => prev.map(t => 
      t.id === selectedTenant.id 
        ? { ...selectedTenant, expiryDate: editingExpiryDate } 
        : t
    ));
    
    setShowTenantDetailsModal(false);
    triggerToast(`Tenant subscription settings for ${selectedTenant.name} updated successfully.`, 'success');
    
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Updated settings (Tier, Terminals, Expiry: ${editingExpiryDate}) for tenant "${selectedTenant.name}"`,
        tenant: selectedTenant.name,
        type: 'info'
      },
      ...prev
    ]);
  };

  // Add new admin user logic
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.email || !newAdminData.tenant) {
      triggerToast('Please fill in all admin fields.', 'info');
      return;
    }
    const created: AdminUser = {
      id: `adm-${Date.now()}`,
      name: newAdminData.name,
      email: newAdminData.email,
      tenant: newAdminData.tenant,
      status: 'ACTIVE',
      lastActive: 'Never'
    };
    setAdmins(prev => [...prev, created]);
    setNewAdminData({ name: '', email: '', tenant: '' });
    setShowAddAdminModal(false);
    triggerToast(`Admin account for "${created.name}" created!`, 'success');

    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Created admin user "${created.name}" (${created.email}) for ${created.tenant}`,
        tenant: created.tenant,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Tenant suspension/activation
  const toggleTenantStatus = (id: string, name: string, currentStatus: Tenant['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus, plan: nextStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' } : t));
    triggerToast(`Tenant "${name}" is now ${nextStatus.toLowerCase()}`, 'success');
    
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `${nextStatus === 'SUSPENDED' ? 'Suspended' : 'Re-activated'} business tenant "${name}"`,
        tenant: name,
        type: 'security'
      },
      ...prev
    ]);
  };

  // Admin account toggle status
  const toggleAdminStatus = (id: string, name: string, currentStatus: AdminUser['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    triggerToast(`Admin "${name}" is now ${nextStatus.toLowerCase()}`, 'success');

    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `${nextStatus === 'SUSPENDED' ? 'Suspended' : 'Activated'} admin account for "${name}"`,
        tenant: 'Access Control',
        type: 'security'
      },
      ...prev
    ]);
  };

  // Reset Admin Passcode
  const handleOpenResetModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      triggerToast('Passcodes do not match or are empty.', 'info');
      return;
    }
    setShowResetPasswordModal(false);
    triggerToast(`Passcode updated successfully for ${selectedAdmin?.name}!`, 'success');

    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Manually changed passcode/password for Admin "${selectedAdmin?.name}"`,
        tenant: selectedAdmin?.tenant || 'Access Control',
        type: 'security'
      },
      ...prev
    ]);
    setSelectedAdmin(null);
  };

  // Support Ticket Handler: Reply to a ticket
  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'RESOLVED' as const,
          replyMessage: ticketReplyText
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    localStorage.setItem('dinepos_support_tickets', JSON.stringify(updatedTickets));
    triggerToast(`Replied to ticket ${selectedTicket.id} and set to RESOLVED.`, 'success');
    
    // Add audit log
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Resolved support ticket ${selectedTicket.id} from ${selectedTicket.establishment}`,
        tenant: selectedTicket.establishment,
        type: 'success'
      },
      ...prev
    ]);

    // Update selected ticket in view
    setSelectedTicket(prev => prev ? { ...prev, status: 'RESOLVED', replyMessage: ticketReplyText } : null);
    setTicketReplyText('');
  };

  // Support Ticket Handler: Update Status
  const handleTicketStatusChange = (ticketId: string, newStatus: SupportTicket['status']) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTickets(updatedTickets);
    localStorage.setItem('dinepos_support_tickets', JSON.stringify(updatedTickets));
    triggerToast(`Ticket ${ticketId} status updated to ${newStatus}.`, 'success');
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }

    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Updated ticket ${ticketId} status to ${newStatus}`,
        tenant: 'Support Operations',
        type: 'info'
      },
      ...prev
    ]);
  };

  // Support Ticket Handler: Delete Ticket
  const handleTicketDelete = (ticketId: string) => {
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    setTickets(updatedTickets);
    localStorage.setItem('dinepos_support_tickets', JSON.stringify(updatedTickets));
    triggerToast(`Ticket ${ticketId} removed.`, 'success');
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(null);
    }
  };

  // SaaS Plans Handler: Save plan modifications
  const handlePlanSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updatedPlans = saasPlans.map(p => p.id === editingPlan.id ? editingPlan : p);
    setSaasPlans(updatedPlans);
    localStorage.setItem('dinepos_saas_plans', JSON.stringify(updatedPlans));
    setShowPlanEditorModal(false);
    setEditingPlan(null);
    triggerToast(`SaaS Plan "${editingPlan.name}" updated successfully!`, 'success');

    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Modified pricing details/limits for Plan "${editingPlan.name}"`,
        tenant: 'SaaS Platform Configuration',
        type: 'security'
      },
      ...prev
    ]);
  };

  // Secure Terminal Commands Handler
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    let response: string[] = [];
    if (cmd === 'help') {
      response = [
        'Available commands:',
        '  help                 Display this command help menu',
        '  ping db              Diagnostics for active database clusters',
        '  restart api-gateway  Perform graceful reboot sequence of routing proxy',
        '  get logs             Retrieve recent platform warnings/security logs',
        '  flush cache          Flush Redis storage buffers for fast synchronization',
        '  clear                Clear terminal screen history'
      ];
    } else if (cmd === 'ping db') {
      response = [
        'Pinging database nodes...',
        '  US-East-1 (North Virginia)   : 12ms [OK]',
        '  EU-West-2 (London)           : 24ms [OK]',
        '  AP-Southeast-1 (Singapore)   : 38ms [OK]',
        'Database replication check passed. Replication lag: 0ms.'
      ];
    } else if (cmd === 'restart api-gateway') {
      response = [
        'Initiating graceful restart of API gateways...',
        'Stopping load-proxy clusters...',
        'Starting cluster worker 1... OK',
        'Starting cluster worker 2... OK',
        'Re-routing live traffic... Complete.',
        'API Gateway successfully restarted in 820ms.'
      ];
    } else if (cmd === 'get logs') {
      response = [
        'Recent platform logs:',
        '  [WARN] - Singapore node CPU usage exceeded 85% threshold',
        '  [SEC]  - Super Admin password changed for Thomas Keller',
        '  [WARN] - US-East database replication latency spiked to 200ms'
      ];
    } else if (cmd === 'flush cache') {
      response = [
        'Flushing global Redis cache proxy buffers...',
        'Keys flushed: 42,912 keys removed from memory.',
        'Cache efficiency index reset to 1.0.'
      ];
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else {
      response = [`Unknown command: "${cmd}". Type "help" for a list of commands.`];
    }

    setTerminalLogs(prev => [...prev, `admin@dinepos-core:~$ ${terminalInput}`, ...response, '']);
    setTerminalInput('');
  };

  // Filtering listings based on tab and search query
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.region || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && t.status === 'ACTIVE') ||
      (statusFilter === 'Suspended' && t.status === 'SUSPENDED');
      
    const matchesTier = tierFilter === 'All' || t.tier === tierFilter;
    
    const matchesRegion = regionFilter === 'All' || t.region === regionFilter;

    // Attention Required filter logic
    const expStatus = checkExpiryStatus(t.expiryDate);
    const needsAttention = t.status === 'SUSPENDED' || expStatus === 'expired' || t.billingFailed;
    const matchesAttention = !attentionOnlyFilter || needsAttention;
    
    return matchesSearch && matchesStatus && matchesTier && matchesRegion && matchesAttention;
  });

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.tenant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFleet = fleet.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.tenant.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l => 
    l.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.tenant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Global calculations for Overview panel (Mock values mirroring mockup image)
  const activeTenantsCount = tenants.filter(t => t.status === 'ACTIVE').length;
  const totalDeployments = fleet.length;

  return (
    <div className={`flex h-screen w-full ${theme.bg} ${theme.text} font-sans antialiased overflow-hidden select-none`}>
            {/* LEFT SIDEBAR PANEL (GLOBAL CONSOLE CONTEXT) */}
      <aside className={`h-full w-[280px] ${theme.sidebarBg} flex flex-col justify-between p-8 flex-shrink-0 z-20 border-r border-white/5 overflow-y-auto`}>
        <div>
          {/* Brand/Super Admin Console Header */}
          <div className="mb-10 select-none flex items-center">
            <div className={`w-10 h-10 rounded-lg ${theme.accentBg} flex items-center justify-center ${theme.accentText} flex-shrink-0 select-none mr-3 shadow-lg`}>
              <span className="material-symbols-outlined font-black">corporate_fare</span>
            </div>
            <div>
              <Link href="/" className={`font-serif font-bold ${theme.accent} text-[18px] tracking-wide block hover:opacity-85 transition-opacity leading-none`}>
                DinePosAi
              </Link>
              <span className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider mt-1 block">
                ENTERPRISE CONSOLE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 font-sans">
            {/* Overview */}
            <button type="button"
              onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'overview'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">dashboard</span>
              <span>Overview</span>
            </button>
            {/* Tenants */}
            <button type="button"
              onClick={() => { setActiveTab('locations'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'locations'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">corporate_fare</span>
              <span>Tenants</span>
            </button>
            {/* Access Control */}
            <button type="button"
              onClick={() => { setActiveTab('access'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'access'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">security</span>
              <span>Access Control</span>
            </button>
            {/* System Health */}
            <button type="button"
              onClick={() => { setActiveTab('health'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'health'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">dns</span>
              <span>System Health</span>
            </button>
            {/* Referrals */}
            <button type="button"
              onClick={() => { setActiveTab('referrals'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'referrals'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">loyalty</span>
              <span>Referrals Mgmt</span>
            </button>
            {/* Payments */}
            <button type="button"
              onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'payments'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">payments</span>
              <span>Payments</span>
            </button>
            {/* Promo Codes */}
            <button type="button"
              onClick={() => { setActiveTab('promocodes'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'promocodes'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">local_offer</span>
              <span>Promo Codes</span>
            </button>
            {/* Analytics */}
            <button type="button"
              onClick={() => { setActiveTab('analytics'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'analytics'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">bar_chart</span>
              <span>Analytics</span>
            </button>
            {/* Support Desk */}
            <button type="button"
              onClick={() => { setActiveTab('support'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'support'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">confirmation_number</span>
              <span>Support Desk</span>
            </button>
            {/* Global Settings */}
            <button type="button"
              onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'settings'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">settings</span>
              <span>Global Settings</span>
            </button>
            {/* CMS Content */}
            <button type="button"
              onClick={() => { setActiveTab('cms'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'cms'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">web</span>
              <span>CMS Content</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 font-sans border-t border-white/5 space-y-4">
          <button type="button" 
            onClick={() => triggerToast('Opening global console documentation...', 'info')}
            className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`}
          >
            <span className="material-symbols-outlined text-lg leading-none">menu_book</span>
            <span>Documentation</span>
          </button>
          <Link 
            href="/login"
            className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`}
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT WINDOW */}
      <div className={`flex-grow flex flex-col h-full relative ${theme.bg} overflow-hidden`}>
        
        <header className={`h-[90px] border-b ${theme.border} flex items-center justify-between px-12 flex-shrink-0 bg-transparent sticky top-0 z-10 select-none backdrop-blur-md`}>
          <div className="relative select-none">
            <span className={`material-symbols-outlined absolute left-4 top-3 ${theme.textMutedDark} text-sm`}>search</span>
            <input
              type="text"
              placeholder="Search enterprise-wide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full max-w-[320px] bg-[#161513]/40 border ${theme.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
            />
          </div>
          
          {/* Header controls and user context */}
          <div className="flex items-center gap-4">
            <button type="button" 
              onClick={() => triggerToast('System health logs clear. 0 concerns.', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${theme.border} hover:border-white/10 rounded-xl text-white transition-colors cursor-pointer select-none relative`}
            >
              <span className={`material-symbols-outlined text-lg text-amber-400`}>notifications</span>
              <span className="absolute top-3.5 right-3.5 w-1 h-1 bg-amber-500 rounded-full motion-safe:animate-ping"></span>
            </button>

            <button type="button" 
              onClick={() => triggerToast('Opening cluster security settings...', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${theme.border} hover:border-white/10 rounded-xl text-white transition-colors cursor-pointer select-none`}
            >
              <span className={`material-symbols-outlined text-lg ${theme.textMuted}`}>shield</span>
            </button>

            <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl pl-3 pr-4 py-1.5 select-none`}>
              <div className="text-right font-sans">
                <div className={`${theme.text} font-bold text-[10px] tracking-wide uppercase leading-none`}>Super Admin</div>
                <div className={`text-[7.5px] ${theme.accentLight} font-bold tracking-widest uppercase mt-1.5 leading-none`}>Enterprise Console</div>
              </div>
              <div className={`w-8 h-8 rounded-lg overflow-hidden border ${theme.borderStrong} flex-shrink-0 flex items-center justify-center bg-amber-500/10`}>
                <span className="material-symbols-outlined text-amber-400 text-sm font-bold">shield_person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Scrollable Body */}
        <div className={`flex-grow p-12 overflow-y-auto w-full mx-auto pb-32`}>
          
          {/* TAB 0: OVERVIEW (Enterprise Insights) */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header Title */}
              <div>
                <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                  Enterprise Insights
                </h1>
                <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                  Real-time performance metrics across the global restaurant network.
                </p>
              </div>

              {/* KPI Cards Row (4 Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                {/* Card 1: Global Revenue */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Global Revenue (24h)</span>
                    <span className="material-symbols-outlined text-amber-400 text-lg">payments</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#ffc53d] tracking-wide">$142,890.45</h3>
                    <p className="text-[10px] text-amber-400 font-bold mt-1">~ 12.5% vs yesterday</p>
                  </div>
                </div>

                {/* Card 2: Active Orders */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Active Orders</span>
                    <span className="material-symbols-outlined text-[#ffc53d] text-lg font-bold">restaurant</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">1,248</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Across 42 locations</p>
                  </div>
                </div>

                {/* Card 3: System Health */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">System Health</span>
                    <span className="material-symbols-outlined text-emerald-400 text-lg font-bold">check_circle</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">99.98%</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">14ms avg latency</p>
                  </div>
                </div>

                {/* Card 4: Active Staff */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Active Staff</span>
                    <span className="material-symbols-outlined text-[#ffc53d] text-lg">badge</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">3,120</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1">Live now globally</p>
                  </div>
                </div>
              </div>

              {/* Location Performance & Activity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Location Performance Map Card (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden`}>
                    <div className="flex justify-between items-center select-none">
                      <div>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Location Performance</h3>
                        <p className="text-[11px] text-[#A69984]/50 font-semibold mt-0.5">Real-time status of managed nodes</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px] font-bold font-sans uppercase tracking-wider">
                        <button type="button"
                          onClick={() => setLocationsView('list')}
                          className={`px-3 py-1.5 rounded transition-all cursor-pointer ${locationsView === 'list' ? 'bg-[#ffc53d] text-[#2c1a00]' : 'text-white/50 hover:text-white'}`}
                        >
                          List View
                        </button>
                        <button type="button"
                          onClick={() => setLocationsView('card')}
                          className={`px-3 py-1.5 rounded transition-all cursor-pointer ${locationsView === 'card' ? 'bg-[#ffc53d] text-[#2c1a00]' : 'text-white/50 hover:text-white'}`}
                        >
                          Map View
                        </button>
                      </div>
                    </div>

                    {/* Map View */}
                    {locationsView === 'card' && (
                      <>
                        <div className="relative w-full h-[320px] bg-[#0c0c0b] rounded-xl flex items-center justify-center border border-white/5 group shadow-inner">
                          <div className="absolute inset-0 bg-[radial-gradient(#ffe2ab/4_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-25"></div>
                          <div className="absolute top-[48%] left-[28%] flex flex-col items-center group/dot cursor-pointer">
                            <div className="w-3.5 h-3.5 bg-rose-500 rounded-full motion-safe:animate-ping absolute"></div>
                            <div className="w-3.5 h-3.5 bg-rose-500 rounded-full border border-black z-10"></div>
                            <span className="absolute bottom-5 bg-[#161513] text-[9.5px] text-rose-400 font-bold font-sans uppercase px-2.5 py-1 rounded border border-rose-500/20 shadow-md whitespace-nowrap z-20">New York • Offline</span>
                          </div>
                          <div className="absolute top-[38%] left-[48%] flex flex-col items-center group/dot cursor-pointer">
                            <div className="w-3 h-3 bg-amber-400 rounded-full motion-safe:animate-pulse absolute"></div>
                            <div className="w-3 h-3 bg-amber-400 rounded-full border border-black z-10"></div>
                            <span className="absolute bottom-5 bg-[#161513] text-[9.5px] text-amber-400 font-bold font-sans uppercase px-2.5 py-1 rounded border border-amber-400/20 shadow-md whitespace-nowrap z-20">Paris Flagship • Online</span>
                          </div>
                          <div className="absolute top-[52%] left-[78%] flex flex-col items-center group/dot cursor-pointer">
                            <div className="w-2 h-2 bg-amber-400 rounded-full border border-black z-10"></div>
                            <span className="absolute bottom-4 bg-[#161513] text-[9px] text-[#A69984] font-bold font-sans uppercase px-2 py-0.5 rounded border border-white/5 shadow-md whitespace-nowrap z-20 scale-0 group-hover/dot:scale-100 transition-all">Tokyo Outpost</span>
                          </div>
                          <span className="material-symbols-outlined text-[100px] text-white/[0.03] group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none">public</span>
                        </div>
                        <div className="flex items-center gap-6 text-[10.5px] font-sans font-bold uppercase tracking-wider select-none">
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="text-white">Online Sites</span><span className="text-[#A69984]/65 ml-0.5 font-normal">38</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span><span className="text-white">Maintenance</span><span className="text-[#A69984]/65 ml-0.5 font-normal">3</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-white">Critical Alert</span><span className="text-[#A69984]/65 ml-0.5 font-normal">1</span></div>
                        </div>
                      </>
                    )}

                    {/* List View */}
                    {locationsView === 'list' && (
                      <div className="space-y-2 max-h-[370px] overflow-y-auto pr-1">
                        {tenants.map(t => (
                          <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-white/[0.025] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <div className="min-w-0">
                                <div className="text-white font-bold text-xs truncate">{t.name}</div>
                                <div className="text-[#A69984]/50 text-[9.5px] font-semibold mt-0.5">{t.location} · {t.id}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                              <div className="text-right">
                                <div className="text-[#ffc53d] font-bold text-xs">{t.revenue}</div>
                                <div className="text-[#A69984]/45 text-[9px] font-semibold">{t.terminals} terminals</div>
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${t.status === 'ACTIVE' ? theme.tagActive : theme.tagSuspended}`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enterprise Activity Log Card (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 flex flex-col justify-between h-[436px]`}>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Enterprise Activity</h3>
                        <p className="text-[11px] text-[#A69984]/50 font-semibold mt-0.5">Security & Configuration Log</p>
                      </div>

                      {/* Logs Feed list */}
                      <div className="space-y-4 font-sans text-xs select-text">
                        {/* Log Item 1 */}
                        <div className="flex gap-3 items-start border-l border-amber-400/20 pl-3">
                          <div className="w-5 h-5 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px] font-bold">lock_open</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight">Security Policy Updated</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              Admin 'J. Doe' modified RBAC permissions for Singapore cluster.
                            </p>
                            <span className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider block mt-1">14:22:10 UTC</span>
                          </div>
                        </div>

                        {/* Log Item 2 */}
                        <div className="flex gap-3 items-start border-l border-white/5 pl-3">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#e5e2e1]/70 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px]">system_update_alt</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight">POS Firmware v2.4 Push</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              Deployment initiated for EMEA region terminals (2,400 nodes).
                            </p>
                            <span className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider block mt-1">12:05:45 UTC</span>
                          </div>
                        </div>

                        {/* Log Item 3 */}
                        <div className="flex gap-3 items-start border-l border-rose-500/20 pl-3">
                          <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px] font-bold">error</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight text-rose-400">API Latency Spike</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              US-East database nodes experiencing 200ms+ delay. Auto-scaling initiated.
                            </p>
                            <span className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-wider block mt-1">11:58:12 UTC</span>
                          </div>
                        </div>

                        {/* Log Item 4 */}
                        <div className="flex gap-3 items-start border-l border-white/5 pl-3">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#e5e2e1]/70 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[12px]">description</span>
                          </div>
                          <div>
                            <div className="text-white font-bold text-[12px] leading-tight">Billing Cycle Finalized</div>
                            <p className="text-[10px] text-[#A69984]/70 mt-1 leading-normal font-semibold">
                              Monthly statements generated
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => { setActiveTab('access'); }} 
                      className="w-full text-center py-2.5 text-[10px] text-white hover:text-white transition-colors border border-white/10 hover:border-white/20 rounded-xl font-bold uppercase tracking-widest select-none cursor-pointer"
                    >
                      View Full Audit Log
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: DB Clusters + Traffic + Quick Config */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
                
                {/* DB Node Clusters */}
                <div className={`${theme.cardBg} border rounded-2xl p-7 shadow-lg flex flex-col justify-between h-[230px]`}>
                  <div>
                    <div className="flex justify-between items-center select-none mb-4">
                      <h4 className="font-serif text-sm text-white font-bold tracking-wide">DB Node Clusters</h4>
                      <span className="px-2 py-0.5 text-[8.5px] rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider select-none leading-none">
                        Healthy
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Cluster 1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white">US-East-1</span>
                          <span className="text-[#A69984]/65">Operational</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className=" w-full"></div>
                        </div>
                      </div>

                      {/* Cluster 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white">EU-West-2</span>
                          <span className="text-[#A69984]/65">Operational</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className=" w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Gateway Traffic */}
                <div className={`${theme.cardBg} border rounded-2xl p-7 shadow-lg flex flex-col justify-between h-[230px]`}>
                  <div>
                    <div className="flex justify-between items-center select-none mb-4">
                      <h4 className="font-serif text-sm text-white font-bold tracking-wide">API Gateway Traffic</h4>
                      <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                        82K Req/S
                      </span>
                    </div>

                    {/* Bar visualizer mockup */}
                    <div className="h-[75px] flex items-end justify-between gap-1 select-none px-2 mt-4">
                      <div className="w-full bg-white/5 h-[30%] rounded-sm"></div>
                      <div className="w-full bg-white/5 h-[45%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[75%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[95%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[85%] rounded-sm"></div>
                      <div className="w-full bg-[#ffc53d] h-[92%] rounded-sm"></div>
                      <div className="w-full bg-white/5 h-[50%] rounded-sm"></div>
                      <div className="w-full bg-white/5 h-[35%] rounded-sm"></div>
                    </div>
                  </div>

                  <div className="text-center text-[9px] text-[#A69984]/40 font-bold uppercase tracking-widest select-none">
                    Real-time throughput analytics (24h window)
                  </div>
                </div>

                {/* Quick Config */}
                <div className={`${theme.cardBg} border rounded-2xl p-7 shadow-lg flex flex-col justify-between h-[230px]`}>
                  <div>
                    <div className="flex justify-between items-center select-none mb-4">
                      <h4 className="font-serif text-sm text-white font-bold tracking-wide">Quick Config</h4>
                      <span className="material-symbols-outlined text-[#A69984]/50 text-sm">bolt</span>
                    </div>

                    {/* 2x2 grid controls */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold tracking-wider uppercase select-none">
                      <button type="button" 
                        onClick={() => triggerToast('Successfully flushed redis & proxy caches.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Flush Cache
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Triggered global SSH key rotations.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Rotate Keys
                      </button>
                      <button type="button" 
                        onClick={() => setShowTerminalModal(true)}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Remote CMD
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Initiated global system logs export sequence.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Export Logs
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Right Floating Action Button */}
              <div className="fixed bottom-8 right-8 z-30 select-none">
                <button type="button" 
                  onClick={() => setShowAddTenantModal(true)}
                  className="w-12 h-12 rounded-full bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] flex items-center justify-center shadow-2xl transition-all active:scale-95 cursor-pointer animate-bounce"
                >
                  <span className="material-symbols-outlined font-black text-xl">add</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 1: TENANTS (Overview + List) */}
          {activeTab === 'locations' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Tenant Management Banner */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Tenant Management
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Monitor and manage all global enterprise tenants across regions.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => handleExportTenants()}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">download</span>
                    Export
                  </button>
                  <button type="button"
                    onClick={() => setShowAddTenantModal(true)}
                    className={`px-5 py-2.5 ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    Onboard Tenant
                  </button>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                
                {/* Card 1: Total Active Tenants */}
                <div 
                  onClick={() => { 
                    setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active'); 
                    setAttentionOnlyFilter(false); 
                  }}
                  className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/20 ${
                    statusFilter === 'Active' ? 'border-[#ffc53d]/50 shadow-[0_0_25px_rgba(255,197,61,0.08)] bg-white/[0.01]' : ''
                  }`}
                >
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">corporate_fare</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Total Active Tenants</span>
                  </div>
                  <div className="z-10 flex items-baseline gap-3">
                    <h3 className="font-serif text-5xl font-bold text-white tracking-wide">
                      {138 + tenants.filter(t => t.status === 'ACTIVE').length}
                    </h3>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5 leading-none">
                      <span className="material-symbols-outlined text-sm font-bold leading-none">arrow_upward</span>
                      12%
                    </span>
                  </div>
                </div>

                {/* Card 2: Regions Deployed */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">public</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Regions Deployed</span>
                  </div>
                  <div className="z-10">
                    <h3 className="font-serif text-5xl font-bold text-white tracking-wide">8</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-bold mt-1 uppercase tracking-wider">Global Zones</p>
                  </div>
                </div>

                {/* Card 3: Attention Required */}
                <div 
                  onClick={() => { 
                    setAttentionOnlyFilter(!attentionOnlyFilter); 
                    setStatusFilter('All'); 
                  }}
                  className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-rose-500/20 ${
                    attentionOnlyFilter ? 'border-rose-500/50 shadow-[0_0_25px_rgba(239,68,68,0.08)] bg-white/[0.01]' : ''
                  }`}
                >
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">warning</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Attention Required</span>
                  </div>
                  <div className="z-10">
                    <h3 className="font-serif text-5xl font-bold text-rose-500 tracking-wide">
                      {tenants.filter(t => t.status === 'SUSPENDED' || checkExpiryStatus(t.expiryDate) === 'expired' || t.billingFailed).length}
                    </h3>
                    <p className="text-[10px] text-rose-400/70 font-semibold mt-1 uppercase tracking-wider">Suspended/Issue</p>
                  </div>
                </div>

              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 font-sans text-xs">
                {/* Search Box */}
                <div className="relative flex-grow max-w-md">
                  <span className={`material-symbols-outlined absolute left-4 top-3 text-[#A69984]/50 text-sm`}>search</span>
                  <input
                    type="text"
                    placeholder="Search establishment name, ID, or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-black/20 border ${theme.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Status filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Status: All</option>
                      <option value="Active">Status: Active</option>
                      <option value="Suspended">Status: Suspended</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Tier Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Tier filter"
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Tier: All</option>
                      <option value="Business">Tier: Business</option>
                      <option value="Growth">Tier: Growth</option>
                      <option value="Starter">Tier: Starter</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Region filter"
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Region: All</option>
                      <option value="North America - East">Region: NA - East</option>
                      <option value="Europe - West">Region: EU - West</option>
                      <option value="Asia Pacific">Region: Asia Pacific</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>
                </div>
              </div>

              {/* Tenants Directory List */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Establishment</th>
                        <th className="py-4 px-4">Subscription Tier</th>
                        <th className="py-4 px-4">Region</th>
                        <th className="py-4 px-4">Expiry Date</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {filteredTenants.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center flex-shrink-0 select-none">
                              {t.name === 'The Obsidian Room' ? (
                                <div className="w-6 h-6 rounded bg-[#ffa133]/10 border border-[#ffa133]/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[#ffa133] text-sm font-bold">layers</span>
                                </div>
                              ) : t.name === 'Lumière Brasserie' ? (
                                <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-emerald-400 text-sm">restaurant</span>
                                </div>
                              ) : t.billingFailed ? (
                                <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-rose-400 text-sm">warning</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/25 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-sky-400 text-sm">storefront</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-serif font-bold text-white text-[14.5px] tracking-wide leading-none">{t.name}</div>
                              <div className="text-[10px] text-[#A69984]/50 font-bold tracking-wider mt-1.5 uppercase">
                                ID: {t.id} {t.billingFailed && <span className="text-rose-400 font-semibold leading-none ml-1">(Billing Failed)</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {t.tier === 'Business' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                                <span className="material-symbols-outlined text-xs">star</span>
                                Business
                              </span>
                            ) : t.tier === 'Growth' ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold">
                                Growth
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-semibold">
                                Starter
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-[#e5e2e1]/80 text-[12px]">{t.region || 'North America - East'}</td>
                          <td className="py-4 px-4">
                            {(() => {
                              const expStatus = checkExpiryStatus(t.expiryDate);
                              const countdownText = getExpiryCountdownText(t.expiryDate);
                              if (expStatus === 'expired') {
                                return (
                                  <div className="flex flex-col gap-1 select-none">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-rose-500/35 bg-rose-500/5 text-rose-400 font-bold font-mono w-fit">
                                      <span className="material-symbols-outlined text-[12px] font-bold leading-none">error</span>
                                      {t.expiryDate}
                                    </span>
                                    <span className="text-[10.5px] text-rose-400/60 font-semibold pl-1">{countdownText}</span>
                                  </div>
                                );
                              } else if (expStatus === 'warning') {
                                return (
                                  <div className="flex flex-col gap-1 select-none animate-pulse">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-amber-500/35 bg-amber-500/5 text-amber-400 font-bold font-mono w-fit">
                                      <span className="material-symbols-outlined text-[12px] font-bold leading-none">warning</span>
                                      {t.expiryDate}
                                    </span>
                                    <span className="text-[10.5px] text-amber-400/60 font-semibold pl-1">{countdownText}</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[#e5e2e1]/85 font-mono text-[12px]">{t.expiryDate}</span>
                                    <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider select-none">{countdownText}</span>
                                  </div>
                                );
                              }
                            })()}
                          </td>
                          <td className="py-4 px-4">
                            {t.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right relative">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" 
                                onClick={() => {
                                  setSelectedTenant(t);
                                  setEditingExpiryDate(t.expiryDate);
                                  setShowTenantDetailsModal(true);
                                }}
                                className="text-[10px] border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Details
                              </button>
                              
                              <div className="relative">
                                <button type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionMenuId(activeActionMenuId === t.id ? null : t.id);
                                  }}
                                  className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">more_vert</span>
                                </button>
                                
                                {activeActionMenuId === t.id && (
                                  <div className="absolute right-0 mt-1.5 w-48 bg-[#161513] border border-white/10 rounded-xl shadow-2xl py-2 z-30 text-left font-sans animate-slide-in">
                                    <button type="button"
                                      onClick={() => toggleTenantStatus(t.id, t.name, t.status)}
                                      className="w-full px-4 py-2 hover:bg-white/5 text-xs text-white/80 hover:text-white font-semibold flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm text-[#A69984]">
                                        {t.status === 'ACTIVE' ? 'block' : 'check_circle'}
                                      </span>
                                      {t.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                                    </button>
                                    
                                    <button type="button"
                                      onClick={() => handleQuickRenew(t.id, 30)}
                                      className="w-full px-4 py-2 hover:bg-white/5 text-xs text-white/80 hover:text-white font-semibold flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm text-[#A69984]">snooze</span>
                                      Extend Expiry (+30d)
                                    </button>

                                    {t.billingFailed && (
                                      <button type="button"
                                        onClick={() => handleRetryBilling(t.id)}
                                        className="w-full px-4 py-2 hover:bg-[#ffc53d]/10 text-xs text-[#ffc53d] font-semibold flex items-center gap-2 border-t border-white/5 mt-1 pt-2 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-sm">credit_card</span>
                                        Retry Billing System
                                      </button>
                                    )}

                                    <button type="button"
                                      onClick={() => handleDeleteTenant(t.id, t.name)}
                                      className="w-full px-4 py-2 hover:bg-rose-500/10 text-xs text-rose-400 font-semibold flex items-center gap-2 border-t border-white/5 mt-1 pt-2 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                      Delete Business
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs text-[#A69984]/50 select-none">
                  <div className="font-bold">
                    Showing 1 to {filteredTenants.length} of 142
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ffc53d] text-[#2c1a00] font-bold transition-colors cursor-pointer">
                      1
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      2
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      3
                    </button>
                    <span className="px-2">...</span>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SYSTEM HEALTH (Hardware Deployments) */}
          {activeTab === 'health' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Hardware Fleet Monitor
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Real-time connectivity diagnostics for all POS registers, KDS panels, and thermal printers.
                  </p>
                </div>
                
                <button type="button"
                  onClick={() => triggerToast('Scanning for newly attached network gateways...', 'info')}
                  className={`px-5 py-3 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">network_ping</span>
                  Scan Gateways
                </button>
              </div>

              {/* Status breakdown metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex justify-between items-center shadow-md`}>
                  <div>
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Online Terminals</span>
                    <h4 className="text-2xl font-bold text-white mt-1">{fleet.filter(f => f.status === 'ONLINE').length} / {fleet.length}</h4>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex justify-between items-center shadow-md`}>
                  <div>
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Device Warnings</span>
                    <h4 className="text-2xl font-bold text-amber-400 mt-1">{fleet.filter(f => f.status === 'WARNING_LOW_PAPER').length} Alerts</h4>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 motion-safe:animate-pulse"></span>
                </div>
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex justify-between items-center shadow-md`}>
                  <div>
                    <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-wider">Offline Status</span>
                    <h4 className="text-2xl font-bold text-rose-400 mt-1">{fleet.filter(f => f.status === 'OFFLINE').length} Terminals</h4>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                </div>
              </div>

              {/* Fleet List Card */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                  <h3 className="font-serif text-base text-white font-bold tracking-wide">Fleet Registers</h3>
                  <span className="text-xs text-[#A69984]/50 font-semibold">{filteredFleet.length} Devices active</span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Terminal Name</th>
                        <th className="py-4 px-4">Type</th>
                        <th className="py-4 px-4">Assigned Tenant</th>
                        <th className="py-4 px-4">IP Address</th>
                        <th className="py-4 px-4">Last Ping</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-right">Diagnostic Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {filteredFleet.map(f => (
                        <tr key={f.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#A69984] text-sm">
                              {f.type === 'POS' ? 'point_of_sale' : f.type === 'KDS' ? 'kitchen' : f.type === 'TABLET' ? 'tablet_mac' : 'print'}
                            </span>
                            {f.name}
                          </td>
                          <td className="py-4 px-4 text-[#A69984] text-[10px] uppercase tracking-wider font-bold">{f.type}</td>
                          <td className="py-4 px-4 text-white/75">{f.tenant}</td>
                          <td className="py-4 px-4 font-mono text-[10.5px] text-[#A69984]">{f.ip}</td>
                          <td className="py-4 px-4 text-[#A69984]/70">{f.lastSeen}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${
                              f.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' :
                              f.status === 'OFFLINE' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {f.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button type="button" 
                              onClick={() => triggerToast(`Sending remote diagnostic ping payload to ${f.name} (${f.ip})...`, 'info')}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer mr-2"
                            >
                              Ping Test
                            </button>
                            <button type="button" 
                              onClick={() => triggerToast(`Initiated remote log dump retrieval from ${f.name}`, 'success')}
                              className="text-[10px] text-[#ffe2ab] hover:text-[#ffc53d] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Fetch Logs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: REFERRAL PROGRAM */}
          {activeTab === 'referrals' && (
            <div className="space-y-8 animate-fade-in duration-300">

              {/* Page Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="select-none">
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Referrals Management
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Manage ambassadors, track attribution, process reward payouts and configure the referral program.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Program Status Toggle */}
                  <button type="button"
                    onClick={() => {
                      setReferralConfig(prev => ({ ...prev, programActive: !prev.programActive }));
                      triggerToast(`Referral program ${referralConfig.programActive ? 'paused' : 'activated'}.`, 'success');
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest border transition-all cursor-pointer ${
                      referralConfig.programActive
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${referralConfig.programActive ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-rose-400'}`}></span>
                    {referralConfig.programActive ? 'Program Active' : 'Program Paused'}
                  </button>
                  <button type="button"
                    onClick={() => setShowAddAmbassadorModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#ffc53d] text-[#2c1a00] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#ffb014] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Add Ambassador
                  </button>
                  <button
                    type="button"
                    onClick={handleExportReferrals}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#A69984] hover:text-white font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export CSV
                  </button>
                  <a
                    href="/partners"
                    target="_blank"
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Partner Portal
                  </a>
                </div>
              </div>

              {/* Sub-navigation tabs */}
              <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 w-fit font-sans">
                {(['overview', 'analytics', 'codes', 'config'] as const).map(tab => (
                  <button type="button"
                    key={tab}
                    onClick={() => setReferralSubTab(tab)}
                    className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer capitalize ${
                      referralSubTab === tab ? 'bg-[#ffc53d] text-[#2c1a00]' : 'text-[#A69984]/60 hover:text-white'
                    }`}
                  >
                    {tab === 'overview' ? 'Overview & Ambassadors' : tab === 'analytics' ? 'Analytics & Insights' : tab === 'codes' ? 'Referral Codes' : 'Program Config'}
                  </button>
                ))}
              </div>

              {/* KPI Summary Row */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
                {[
                  { label: 'Ambassadors', value: ambassadors.length, sub: `${ambassadors.filter(a => a.status === 'active').length} active`, color: 'text-white' },
                  { label: 'Businesses Referred', value: ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0), sub: 'All time', color: 'text-violet-400' },
                  { label: 'Conversion Rate', value: ambassadors.length === 0 ? '0%' : `${Math.round((ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length, 0) / Math.max(ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0), 1)) * 100)}%`, sub: 'Referred → subscribed', color: 'text-sky-400' },
                  { label: 'Pending Payouts', value: `$${ambassadors.reduce((s, a) => s + a.pendingRewards, 0).toLocaleString()}`, sub: 'Awaiting release', color: 'text-amber-400' },
                  { label: 'Total Paid Out', value: `$${ambassadors.reduce((s, a) => s + a.paidRewards, 0).toLocaleString()}`, sub: 'All time', color: 'text-emerald-400' },
                ].map(kpi => (
                  <div key={kpi.label} className={`${theme.cardBg} border rounded-2xl p-5 flex flex-col justify-between`}>
                    <span className="font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">{kpi.label}</span>
                    <div className="mt-3">
                      <h3 className={`font-serif text-2xl font-bold ${kpi.color} tracking-wide`}>{kpi.value}</h3>
                      <p className="text-[9.5px] text-[#A69984]/50 font-bold mt-1">{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* OVERVIEW SUB-TAB: Ambassador Directory + Conversion Funnel */}
              {referralSubTab === 'overview' && (
                <div className="space-y-8">

                  {/* Top Performers Leaderboard */}
                  {ambassadors.length > 0 && (() => {
                    const ranked = [...ambassadors]
                      .map(a => ({ ...a, totalEarned: a.paidRewards + a.pendingRewards, conversions: a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length }))
                      .sort((a, b) => b.totalEarned - a.totalEarned)
                      .slice(0, 3);
                    const medals = ['🥇', '🥈', '🥉'];
                    const medalColors = ['text-[#ffc53d]', 'text-[#9ca3af]', 'text-[#b45309]'];
                    const cardBorders = ['border-[#ffc53d]/20', 'border-white/8', 'border-white/8'];
                    return (
                      <div className={`${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                        <div className="flex justify-between items-center mb-5">
                          <div>
                            <h3 className="text-white font-bold text-sm tracking-wide">Top Performers</h3>
                            <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Ranked by lifetime earnings (paid + pending)</p>
                          </div>
                          <span className="material-symbols-outlined text-[#ffc53d] text-xl">workspace_premium</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {ranked.map((amb, idx) => (
                            <div key={amb.id} className={`bg-white/[0.025] border ${cardBorders[idx]} rounded-xl p-4 flex flex-col gap-3`}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{medals[idx]}</span>
                                  <div>
                                    <p className="text-white font-bold text-xs leading-tight">{amb.name}</p>
                                    <p className={`font-mono font-black text-[10px] ${medalColors[idx]} mt-0.5`}>{amb.code}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${amb.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                  {amb.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-white/[0.03] rounded-lg p-2">
                                  <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">Total Earned</p>
                                  <p className={`font-bold text-sm mt-0.5 ${medalColors[idx]}`}>${amb.totalEarned.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-2">
                                  <p className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">Conversions</p>
                                  <p className="text-white font-bold text-sm mt-0.5">{amb.conversions}<span className="text-[#A69984]/40 font-normal text-xs">/{amb.invitedBusinesses.length}</span></p>
                                </div>
                              </div>
                              {amb.pendingRewards > 0 && (
                                <div className="flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-1.5">
                                  <span className="material-symbols-outlined text-amber-400 text-xs">schedule</span>
                                  <span className="text-amber-400 text-[9.5px] font-bold">${amb.pendingRewards.toFixed(2)} pending payout</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Conversion Funnel */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Referral Conversion Funnel</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">From referral link click to paid subscription</p>
                      </div>
                      <span className="material-symbols-outlined text-[#ffc53d] text-xl">funnel</span>
                    </div>
                    {(() => {
                      const totalReferred = ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0);
                      const registered = totalReferred;
                      const activated = ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Active' || b.status === 'Subscribed' || b.status === 'Pending').length, 0);
                      const subscribed = ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length, 0);
                      const funnelMax = Math.max(totalReferred, 1);
                      return (
                        <div className="space-y-4">
                          {[
                            { label: 'Referral Links Clicked', value: totalReferred + Math.floor(totalReferred * 0.6), color: 'bg-white/20', textColor: 'text-white/60' },
                            { label: 'Businesses Registered', value: registered, color: 'bg-violet-500/50', textColor: 'text-violet-300' },
                            { label: 'Trials Started', value: activated, color: 'bg-sky-500/50', textColor: 'text-sky-300' },
                            { label: 'Paid Subscriptions', value: subscribed, color: 'bg-emerald-500/60', textColor: 'text-emerald-400' },
                          ].map(stage => {
                            const pct = funnelMax > 0 ? Math.min((stage.value / (totalReferred + Math.floor(totalReferred * 0.6) || 1)) * 100, 100) : 0;
                            return (
                              <div key={stage.label} className="flex items-center gap-4">
                                <div className="w-[160px] text-[10.5px] text-[#A69984]/65 font-semibold flex-shrink-0">{stage.label}</div>
                                <div className="flex-1 bg-white/5 rounded-full h-6 relative overflow-hidden">
                                  <div className={`${stage.color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, stage.value > 0 ? 3 : 0)}%` }}></div>
                                </div>
                                <div className={`w-10 text-right font-bold text-sm ${stage.textColor}`}>{stage.value}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Ambassador Directory */}
                  <div className={`${theme.cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Ambassador Directory</h3>
                        <p className="text-[11px] text-[#A69984]/50 font-semibold mt-0.5">{ambassadors.length} registered partners · Review profiles, banking details, and trigger payouts.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {batchPayoutMode && selectedAmbIds.length > 0 && (
                          <button type="button"
                            onClick={() => {
                              const total = ambassadors.filter(a => selectedAmbIds.includes(a.id)).reduce((s, a) => s + a.pendingRewards, 0);
                              triggerToast(`Batch payout of $${total.toFixed(2)} queued for ${selectedAmbIds.length} ambassador${selectedAmbIds.length > 1 ? 's' : ''}.`, 'success');
                              setSelectedAmbIds([]);
                              setBatchPayoutMode(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Pay {selectedAmbIds.length} Selected
                          </button>
                        )}
                        <button type="button"
                          onClick={() => { setBatchPayoutMode(p => !p); setSelectedAmbIds([]); }}
                          className={`flex items-center gap-2 px-4 py-2 border font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                            batchPayoutMode
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-[#A69984]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{batchPayoutMode ? 'close' : 'checklist'}</span>
                          {batchPayoutMode ? 'Cancel' : 'Batch Payout'}
                        </button>
                        <button type="button"
                          onClick={() => setShowAddAmbassadorModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">person_add</span>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Search + Filter Bar */}
                    {ambassadors.length > 0 && (
                      <div className="px-6 py-3.5 border-b border-white/5 flex flex-col sm:flex-row gap-3 font-sans">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#A69984]/40 text-sm">search</span>
                          <input
                            type="text"
                            placeholder="Search by name, email or code…"
                            value={ambassadorSearch}
                            onChange={e => setAmbassadorSearch(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/30"
                          />
                        </div>
                        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 flex-shrink-0">
                          {(['all', 'active', 'suspended'] as const).map(s => (
                            <button key={s} type="button"
                              onClick={() => setAmbassadorStatusFilter(s)}
                              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer capitalize ${ambassadorStatusFilter === s ? 'bg-[#ffc53d] text-[#2c1a00]' : 'text-[#A69984]/55 hover:text-white'}`}
                            >
                              {s === 'all' ? `All (${ambassadors.length})` : `${s} (${ambassadors.filter(a => a.status === s).length})`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {ambassadors.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                        <span className="material-symbols-outlined text-5xl text-[#A69984]/20">loyalty</span>
                        <div>
                          <p className="text-white font-semibold font-sans text-sm">No ambassadors registered yet</p>
                          <p className="text-[#A69984]/50 font-sans text-xs mt-1">Add one above or invite partners via the Partner Portal.</p>
                        </div>
                        <button type="button" onClick={() => setShowAddAmbassadorModal(true)} className="mt-2 px-5 py-2.5 bg-[#ffc53d] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                          <span className="material-symbols-outlined text-sm">person_add</span>
                          Add First Ambassador
                        </button>
                      </div>
                    ) : (
                      <div>
                        {(() => {
                          const q = ambassadorSearch.toLowerCase();
                          const filteredAmbs = ambassadors.filter(a =>
                            (ambassadorStatusFilter === 'all' || a.status === ambassadorStatusFilter) &&
                            (!q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
                          );
                          if (filteredAmbs.length === 0) return (
                            <div className="py-14 text-center font-sans">
                              <span className="material-symbols-outlined text-4xl text-[#A69984]/20 block">search_off</span>
                              <p className="text-white font-semibold text-sm mt-3">No ambassadors match your filter</p>
                              <p className="text-[#A69984]/50 text-xs mt-1">Try adjusting the search term or status filter.</p>
                            </div>
                          );
                          return (
                        <div className="divide-y divide-white/5">
                          {filteredAmbs.map((amb) => (
                          <div key={amb.id} className={`p-6 hover:bg-white/[0.015] transition-colors ${batchPayoutMode && selectedAmbIds.includes(amb.id) ? 'bg-[#ffc53d]/[0.04]' : ''}`}>
                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                              {/* Batch checkbox */}
                              {batchPayoutMode && (
                                <label className="flex items-center justify-center flex-shrink-0 mt-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedAmbIds.includes(amb.id)}
                                    onChange={e => setSelectedAmbIds(prev => e.target.checked ? [...prev, amb.id] : prev.filter(id => id !== amb.id))}
                                    className="w-4 h-4 rounded border-white/20 accent-[#ffc53d] cursor-pointer"
                                  />
                                </label>
                              )}

                              {/* Identity */}
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/15 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-[#ffc53d] text-lg">person</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  {(() => {
                                    const _conv = amb.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                                    const _tier = _conv >= 11
                                      ? { name: 'Platinum', cls: 'bg-violet-500/10 border-violet-500/20 text-violet-300' }
                                      : _conv >= 6
                                      ? { name: 'Gold', cls: 'bg-[#ffc53d]/10 border-[#ffc53d]/20 text-[#ffc53d]' }
                                      : _conv >= 3
                                      ? { name: 'Silver', cls: 'bg-white/10 border-white/20 text-white/70' }
                                      : { name: 'Bronze', cls: 'bg-amber-800/15 border-amber-700/25 text-amber-600' };
                                    return (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-white font-bold font-sans text-sm">{amb.name}</span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-mono">{amb.code}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                      amb.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>{amb.status}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${_tier.cls}`}>⭐ {_tier.name}</span>
                                  </div>
                                    );
                                  })()}
                                  <p className="text-[#A69984]/65 text-xs font-sans mt-0.5">{amb.email}{amb.phone ? ` • ${amb.phone}` : ''}</p>
                                  <p className="text-[#A69984]/40 text-[10px] font-sans mt-0.5">Joined {amb.joinedDate} · {amb.invitedBusinesses.length} referrals</p>
                                  {/* Mini referral link */}
                                  <div className="flex items-center gap-1.5 mt-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5 w-fit">
                                    <span className="material-symbols-outlined text-[11px] text-[#A69984]/50">link</span>
                                    <span className="text-[9.5px] text-[#A69984]/60 font-mono">{referralConfig.referralBaseUrl}{amb.code}</span>
                                    <button type="button" onClick={() => triggerToast('Referral link copied!', 'success')} className="text-[#ffc53d] hover:text-[#ffb014] cursor-pointer ml-1">
                                      <span className="material-symbols-outlined text-[11px]">content_copy</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Banking Details */}
                              <div className="bg-white/[0.025] border border-white/5 rounded-xl p-4 min-w-[220px] flex-shrink-0">
                                <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[11px]">account_balance</span>
                                  Banking Details
                                </p>
                                {amb.bank.bankName ? (
                                  <>
                                    <p className="text-white font-sans font-bold text-xs">{amb.bank.bankName}</p>
                                    <p className="text-[#A69984]/65 font-sans text-[10px] mt-0.5">A/C: •••• {(amb.bank.accountNumber || '').slice(-4) || '——'}</p>
                                    <p className="text-[#A69984]/65 font-sans text-[10px]">Holder: {amb.bank.accountHolder || '—'}</p>
                                  </>
                                ) : (
                                  <p className="text-[#A69984]/35 text-[10px] font-sans italic">No banking details on file.</p>
                                )}
                              </div>

                              {/* Rewards + Actions */}
                              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="grid grid-cols-2 gap-3 text-right">
                                  <div>
                                    <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest">Pending</p>
                                    <p className="text-amber-400 font-bold font-sans text-base">${amb.pendingRewards.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest">Paid Out</p>
                                    <p className="text-emerald-400 font-bold font-sans text-base">${amb.paidRewards.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button type="button"
                                    onClick={() => { setPartnerViewAmbassador(amb); setShowPartnerViewModal(true); }}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-white/15 text-[#A69984] hover:text-white hover:border-white/25 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">preview</span>
                                    Partner View
                                  </button>
                                  <button type="button"
                                    onClick={() => { setEditAmbassadorTarget(amb); setEditAmbassadorData({ name: amb.name, email: amb.email, phone: amb.phone, code: amb.code }); setShowEditAmbassadorModal(true); }}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-violet-500/25 text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">edit</span>
                                    Edit
                                  </button>
                                  <button type="button"
                                    onClick={() => { setAddReferralTarget(amb); setNewReferralData({ name: '', contact: '', services: [], status: 'Pending' }); setShowAddReferralModal(true); }}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-[#ffc53d]/25 text-[#ffc53d] hover:bg-[#ffc53d]/10 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">add_business</span>
                                    Add Referral
                                  </button>
                                  <button type="button"
                                    onClick={() => handleOpenEditBank(amb)}
                                    className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-sky-500/25 text-sky-400 hover:bg-sky-500/10 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">account_balance</span>
                                    {amb.bank.bankName ? 'Edit Bank' : 'Add Bank'}
                                  </button>
                                  <button type="button"
                                    onClick={() => handleToggleAmbassadorStatus(amb.id)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all cursor-pointer ${
                                      amb.status === 'active'
                                        ? 'border-rose-500/25 text-rose-400 hover:bg-rose-500/10'
                                        : 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                  >
                                    {amb.status === 'active' ? 'Suspend' : 'Reactivate'}
                                  </button>
                                  <button type="button"
                                    onClick={() => { setPayoutTarget(amb); setPayoutAmount(amb.pendingRewards.toFixed(2)); setShowPayoutModal(true); }}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                      amb.pendingRewards > 0
                                        ? 'bg-[#ffc53d] text-[#2c1a00] hover:bg-[#ffb014] cursor-pointer'
                                        : 'bg-white/5 text-[#A69984]/30 cursor-not-allowed border border-white/5'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-xs">payments</span>
                                    Payout
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Invited Businesses */}
                            {amb.invitedBusinesses.length > 0 && (
                              <div className="mt-5 border-t border-white/5 pt-5">
                                <p className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-xs">storefront</span>
                                  Referred Businesses ({amb.invitedBusinesses.length})
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {amb.invitedBusinesses.map(biz => (
                                    <div key={biz.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col gap-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-white font-bold text-xs font-sans truncate">{biz.name}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${
                                          biz.status === 'Active' || biz.status === 'Subscribed'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>{biz.status}</span>
                                      </div>
                                      <p className="text-[#A69984]/60 text-[10px] font-sans">Contact: {biz.contact}</p>
                                      <p className="text-[#A69984]/45 text-[10px] font-sans">Joined: {biz.joinedDate}</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {biz.services.map((svc, si) => (
                                          <span key={si} className="px-1.5 py-0.5 bg-white/5 border border-white/[0.08] rounded text-[8.5px] text-[#A69984]/70 font-medium">{svc}</span>
                                        ))}
                                      </div>
                                      <p className="text-amber-400 font-bold text-[10px] mt-0.5">Reward: ${biz.reward}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Per-ambassador payout history inline */}
                            {payoutHistory.filter(tx => tx.ambassadorId === amb.id).length > 0 && (
                              <div className="mt-4 border-t border-white/5 pt-4">
                                <p className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-xs">receipt_long</span>
                                  Payout History
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {payoutHistory.filter(tx => tx.ambassadorId === amb.id).slice(0, 5).map(tx => (
                                    <div key={tx.id} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-1.5">
                                      <span className="material-symbols-outlined text-emerald-400 text-xs">check_circle</span>
                                      <span className="text-emerald-400 font-bold text-[10px]">${tx.amount.toFixed(2)}</span>
                                      <span className="text-[#A69984]/45 text-[9.5px] font-mono">{tx.date}</span>
                                    </div>
                                  ))}
                                  {payoutHistory.filter(tx => tx.ambassadorId === amb.id).length > 5 && (
                                    <div className="flex items-center px-3 py-1.5 text-[#A69984]/45 text-[9.5px]">
                                      +{payoutHistory.filter(tx => tx.ambassadorId === amb.id).length - 5} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CODES SUB-TAB: Referral Code Management */}
              {referralSubTab === 'codes' && (
                <div className={`${theme.cardBg} border rounded-2xl overflow-hidden font-sans`}>
                  <div className="px-7 py-5 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">Referral Code Registry</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">All active and suspended referral codes across the ambassador network</p>
                    </div>
                    <button type="button"
                      onClick={() => setShowAddAmbassadorModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      New Code
                    </button>
                  </div>
                  {ambassadors.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                      <span className="material-symbols-outlined text-5xl text-[#A69984]/20">qr_code</span>
                      <p className="text-white font-semibold text-sm">No referral codes yet</p>
                      <p className="text-[#A69984]/50 text-xs">Add ambassadors to generate referral codes.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">
                          <th className="text-left px-7 py-3">Ambassador</th>
                          <th className="text-left px-4 py-3">Referral Code</th>
                          <th className="text-left px-4 py-3">Full Link</th>
                          <th className="text-center px-4 py-3">Conversions</th>
                          <th className="text-center px-4 py-3">Status</th>
                          <th className="text-right px-7 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {ambassadors.map(amb => {
                          const conversions = amb.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                          const total = amb.invitedBusinesses.length;
                          return (
                            <tr key={amb.id} className="hover:bg-white/[0.015] transition-colors">
                              <td className="px-7 py-4">
                                <div className="text-white font-bold text-xs">{amb.name}</div>
                                <div className="text-[#A69984]/50 text-[9.5px] mt-0.5">{amb.email}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="px-3 py-1.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-mono font-black text-[11px] rounded-lg tracking-wider">{amb.code}</span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#A69984]/50 font-mono text-[9.5px] truncate max-w-[180px]">{referralConfig.referralBaseUrl}{amb.code}</span>
                                  <button type="button" onClick={() => triggerToast('Link copied to clipboard!', 'success')} className="text-[#ffc53d]/70 hover:text-[#ffc53d] cursor-pointer flex-shrink-0">
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="font-bold text-white text-sm">{conversions}<span className="text-[#A69984]/40 font-normal text-xs">/{total}</span></div>
                                <div className="text-[9px] text-[#A69984]/40 font-semibold mt-0.5">{total > 0 ? Math.round((conversions / total) * 100) : 0}% conv.</div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border ${
                                  amb.status === 'active'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>{amb.status}</span>
                              </td>
                              <td className="px-7 py-4 text-right">
                                <button type="button"
                                  onClick={() => handleToggleAmbassadorStatus(amb.id)}
                                  className="text-[10px] border border-white/10 hover:border-white/20 text-[#ffe2ab] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer mr-2"
                                >
                                  {amb.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                                <button type="button"
                                  onClick={() => { setQrModalAmbassador(amb); setShowQrModal(true); }}
                                  className="text-[10px] border border-white/10 hover:border-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  QR Poster
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ANALYTICS SUB-TAB: Insights & Trends */}
              {referralSubTab === 'analytics' && (() => {
                const totalReferrals = ambassadors.reduce((s, a) => s + a.invitedBusinesses.length, 0);
                const totalConversions = ambassadors.reduce((s, a) => s + a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length, 0);
                const totalRewardsPaid = ambassadors.reduce((s, a) => s + a.paidRewards, 0);
                const totalPending = ambassadors.reduce((s, a) => s + a.pendingRewards, 0);
                const avgRevPerConversion = 299;
                const totalAttrRevenue = totalConversions * avgRevPerConversion;
                const cpa = totalConversions > 0 ? totalRewardsPaid / totalConversions : 0;
                const roi = totalRewardsPaid > 0 ? totalAttrRevenue / totalRewardsPaid : 0;
                const convRate = totalReferrals > 0 ? Math.round((totalConversions / totalReferrals) * 100) : 0;

                const monthlyData = [
                  { month: 'Jan', signups: 3, conversions: 2 },
                  { month: 'Feb', signups: 5, conversions: 3 },
                  { month: 'Mar', signups: 4, conversions: 2 },
                  { month: 'Apr', signups: 8, conversions: 5 },
                  { month: 'May', signups: Math.max(totalReferrals, 12), conversions: Math.max(totalConversions, 8) },
                  { month: 'Jun', signups: 7, conversions: 4 },
                ];
                const maxSignups = Math.max(...monthlyData.map(d => d.signups), 1);

                const activityFeed: { icon: string; color: string; bg: string; msg: string; time: string }[] = [
                  ...payoutHistory.slice(0, 2).map(tx => ({
                    icon: 'payments', color: 'text-emerald-400', bg: 'bg-emerald-500/10',
                    msg: `$${tx.amount.toFixed(2)} payout processed to ${tx.ambassadorName}`, time: tx.date,
                  })),
                  ...ambassadors.flatMap(a => a.invitedBusinesses.slice(0, 1).map(biz => ({
                    icon: 'storefront', color: 'text-violet-400', bg: 'bg-violet-500/10',
                    msg: `${biz.name} referred by ${a.name}`, time: biz.joinedDate,
                  }))),
                  { icon: 'person_add', color: 'text-sky-400', bg: 'bg-sky-500/10', msg: 'New ambassador application received', time: 'Today, 9:41 AM' },
                  { icon: 'workspace_premium', color: 'text-[#ffc53d]', bg: 'bg-[#ffc53d]/10', msg: 'Ambassador milestone: 10 conversions reached', time: 'Yesterday' },
                ].slice(0, 7);

                return (
                  <div className="space-y-6 font-sans animate-fade-in">

                    {/* Analytics KPI Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Revenue Attributed', value: `$${totalAttrRevenue.toLocaleString()}`, sub: 'From referral conversions', color: 'text-[#ffc53d]', icon: 'attach_money' },
                        { label: 'Overall Conv. Rate', value: `${convRate}%`, sub: 'Referral → subscription', color: 'text-sky-400', icon: 'conversion_path' },
                        { label: 'Cost Per Acquisition', value: `$${cpa.toFixed(2)}`, sub: 'Avg reward per conversion', color: 'text-violet-400', icon: 'trending_down' },
                        { label: 'Referral ROI', value: roi > 0 ? `${roi.toFixed(1)}x` : '—', sub: 'Revenue vs rewards paid', color: 'text-emerald-400', icon: 'show_chart' },
                      ].map(kpi => (
                        <div key={kpi.label} className={`${theme.cardBg} border rounded-2xl p-5`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9.5px] text-[#A69984]/65 font-bold uppercase tracking-widest">{kpi.label}</span>
                            <span className={`material-symbols-outlined text-lg ${kpi.color}`}>{kpi.icon}</span>
                          </div>
                          <p className={`font-serif text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                          <p className="text-[9.5px] text-[#A69984]/50 font-bold mt-1">{kpi.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Monthly Trend + Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Monthly Trend Bar Chart */}
                      <div className={`${theme.cardBg} border rounded-2xl p-7 lg:col-span-2`}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-white font-bold text-sm tracking-wide">Monthly Referral Trend</h3>
                            <p className="text-[#A69984]/50 text-[10.5px] mt-0.5">Signups vs. paid conversions over 6 months</p>
                          </div>
                          <span className="material-symbols-outlined text-[#ffc53d] text-lg">bar_chart</span>
                        </div>
                        <div className="flex items-end gap-3 h-36">
                          {monthlyData.map(d => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                              <span className="text-[8.5px] text-white/40 font-bold">{d.signups}</span>
                              <div className="w-full flex flex-col justify-end" style={{ height: `${Math.round((d.signups / maxSignups) * 108)}px` }}>
                                <div className="w-full rounded-t-md overflow-hidden bg-[#ffc53d]/20" style={{ height: '100%' }}>
                                  <div className="w-full bg-[#ffc53d] rounded-t-md" style={{ height: `${Math.round((d.conversions / d.signups) * 100)}%` }} />
                                </div>
                              </div>
                              <span className="text-[9px] text-[#A69984]/55 font-bold">{d.month}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ffc53d]"></div><span className="text-[10px] text-[#A69984]/60 font-semibold">Paid Conversions</span></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ffc53d]/20"></div><span className="text-[10px] text-[#A69984]/60 font-semibold">Total Signups</span></div>
                        </div>
                      </div>

                      {/* Activity Feed */}
                      <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col`}>
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-white font-bold text-sm tracking-wide">Recent Activity</h3>
                          <span className="material-symbols-outlined text-[#A69984]/40 text-lg">timeline</span>
                        </div>
                        {activityFeed.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
                            <span className="material-symbols-outlined text-3xl text-[#A69984]/20">history</span>
                            <p className="text-[#A69984]/40 text-xs font-semibold">No activity yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4 flex-1">
                            {activityFeed.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/5`}>
                                  <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white text-[11px] font-semibold leading-snug">{item.msg}</p>
                                  <p className="text-[#A69984]/40 text-[9px] mt-0.5 font-medium">{item.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ambassador Performance Table + Breakdowns */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                      {/* Performance Table */}
                      <div className={`${theme.cardBg} border rounded-2xl overflow-hidden lg:col-span-3`}>
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                          <h3 className="text-white font-bold text-sm tracking-wide">Ambassador Performance</h3>
                          <span className="text-[10px] text-[#A69984]/40 font-semibold">Ranked by referrals</span>
                        </div>
                        {ambassadors.length === 0 ? (
                          <div className="py-12 text-center">
                            <p className="text-[#A69984]/40 text-sm font-semibold">No ambassadors registered yet</p>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5">
                                {['Ambassador', 'Referred', 'Converted', 'Rate', 'Total Earned'].map(h => (
                                  <th key={h} className={`py-3 text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest ${h === 'Ambassador' ? 'text-left px-6' : h === 'Total Earned' ? 'text-right px-6' : 'text-center px-3'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                              {[...ambassadors].sort((a, b) => b.invitedBusinesses.length - a.invitedBusinesses.length).map(amb => {
                                const referred = amb.invitedBusinesses.length;
                                const converted = amb.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                                const cr = referred > 0 ? Math.round((converted / referred) * 100) : 0;
                                return (
                                  <tr key={amb.id} className="hover:bg-white/[0.015] transition-colors">
                                    <td className="px-6 py-3.5">
                                      <p className="text-white font-bold text-xs">{amb.name}</p>
                                      <p className="text-[#A69984]/45 text-[9.5px] font-mono mt-0.5">{amb.code}</p>
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                      <span className="text-white font-bold text-sm">{referred}</span>
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                      <span className="text-emerald-400 font-bold text-sm">{converted}</span>
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                      <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-white font-bold text-xs">{cr}%</span>
                                        <div className="w-12 bg-white/5 rounded-full h-1.5">
                                          <div className="bg-[#ffc53d] h-1.5 rounded-full" style={{ width: `${cr}%` }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                      <span className="text-[#ffc53d] font-bold text-sm">${(amb.paidRewards + amb.pendingRewards).toLocaleString()}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Right column: Reward Summary + Tier Distribution */}
                      <div className="lg:col-span-2 space-y-4">

                        {/* Reward Summary */}
                        <div className={`${theme.cardBg} border rounded-2xl p-6`}>
                          <h3 className="text-white font-bold text-sm tracking-wide mb-5">Reward Summary</h3>
                          <div className="space-y-3.5">
                            {[
                              { label: 'Total Rewarded', value: `$${totalRewardsPaid.toLocaleString()}`, color: 'text-emerald-400' },
                              { label: 'Pending Release', value: `$${totalPending.toLocaleString()}`, color: 'text-amber-400' },
                              { label: 'Attributed Revenue', value: `$${totalAttrRevenue.toLocaleString()}`, color: 'text-[#ffc53d]' },
                              { label: 'Cost Per Acquisition', value: `$${cpa.toFixed(2)}`, color: 'text-sky-400' },
                            ].map(item => (
                              <div key={item.label} className="flex justify-between items-center">
                                <span className="text-[#A69984]/60 text-[10.5px] font-bold">{item.label}</span>
                                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tier Distribution */}
                        <div className={`${theme.cardBg} border rounded-2xl p-6`}>
                          <h3 className="text-white font-bold text-sm tracking-wide mb-5">Ambassador Tier Distribution</h3>
                          <div className="space-y-3">
                            {[
                              { tier: 'Platinum', minConv: 11, maxConv: Infinity, barColor: 'bg-violet-500', textColor: 'text-violet-300' },
                              { tier: 'Gold',     minConv: 6,  maxConv: 10,       barColor: 'bg-[#ffc53d]',  textColor: 'text-[#ffc53d]' },
                              { tier: 'Silver',   minConv: 3,  maxConv: 5,        barColor: 'bg-white/50',   textColor: 'text-white/65' },
                              { tier: 'Bronze',   minConv: 0,  maxConv: 2,        barColor: 'bg-amber-700/60', textColor: 'text-amber-600' },
                            ].map(t => {
                              const count = ambassadors.filter(a => {
                                const conv = a.invitedBusinesses.filter(b => b.status === 'Subscribed' || b.status === 'Active').length;
                                return conv >= t.minConv && conv <= t.maxConv;
                              }).length;
                              const pct = ambassadors.length > 0 ? Math.round((count / ambassadors.length) * 100) : 0;
                              return (
                                <div key={t.tier} className="flex items-center gap-3">
                                  <span className={`text-[9.5px] font-bold uppercase tracking-wider w-14 ${t.textColor}`}>{t.tier}</span>
                                  <div className="flex-1 bg-white/5 rounded-full h-2">
                                    <div className={`${t.barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-white/55 text-[10px] w-5 text-right font-bold">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[#A69984]/35 text-[9.5px] font-semibold mt-4 pt-3 border-t border-white/5">
                            Bronze: 0–2 conv. · Silver: 3–5 · Gold: 6–10 · Platinum: 11+
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Channel Attribution + Milestone Tracker */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {/* Channel Attribution */}
                      <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-white font-bold text-sm tracking-wide">Referral Channel Attribution</h3>
                          <span className="material-symbols-outlined text-[#A69984]/40 text-lg">hub</span>
                        </div>
                        <div className="space-y-4">
                          {[
                            { channel: 'LinkedIn / Social', pct: 40, color: 'bg-sky-500/60' },
                            { channel: 'Direct Email Outreach', pct: 30, color: 'bg-violet-500/60' },
                            { channel: 'Word of Mouth', pct: 20, color: 'bg-[#ffc53d]/70' },
                            { channel: 'Partner Portal / Other', pct: 10, color: 'bg-emerald-500/50' },
                          ].map(ch => (
                            <div key={ch.channel} className="flex items-center gap-4">
                              <span className="text-[10.5px] text-[#A69984]/65 font-semibold flex-shrink-0 w-[160px]">{ch.channel}</span>
                              <div className="flex-1 bg-white/5 rounded-full h-5 relative overflow-hidden">
                                <div className={`${ch.color} h-full rounded-full transition-all duration-700`} style={{ width: `${ch.pct}%` }} />
                              </div>
                              <span className="text-white font-bold text-xs w-8 text-right">{ch.pct}%</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[#A69984]/30 text-[9.5px] font-semibold mt-5 pt-4 border-t border-white/5">Attribution model: last-touch · 30-day lookback window</p>
                      </div>

                      {/* Milestone Tracker */}
                      <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-white font-bold text-sm tracking-wide">Program Milestones</h3>
                          <span className="material-symbols-outlined text-[#A69984]/40 text-lg">emoji_events</span>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'First 10 Ambassadors', goal: 10, current: ambassadors.length, icon: 'group' },
                            { label: '50 Total Referrals', goal: 50, current: totalReferrals, icon: 'share' },
                            { label: '25 Paid Conversions', goal: 25, current: totalConversions, icon: 'storefront' },
                            { label: '$5,000 Revenue Attributed', goal: 5000, current: totalAttrRevenue, icon: 'attach_money', isCurrency: true },
                          ].map(ms => {
                            const pct = Math.min(Math.round((ms.current / ms.goal) * 100), 100);
                            const done = pct >= 100;
                            return (
                              <div key={ms.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-sm ${done ? 'text-emerald-400' : 'text-[#A69984]/40'}`}>{done ? 'check_circle' : ms.icon}</span>
                                    <span className={`text-[10.5px] font-semibold ${done ? 'text-emerald-400' : 'text-[#A69984]/70'}`}>{ms.label}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold ${done ? 'text-emerald-400' : 'text-white/50'}`}>
                                    {ms.isCurrency ? `$${ms.current.toLocaleString()} / $${ms.goal.toLocaleString()}` : `${ms.current} / ${ms.goal}`}
                                  </span>
                                </div>
                                <div className="bg-white/5 rounded-full h-1.5">
                                  <div className={`${done ? 'bg-emerald-400' : 'bg-[#ffc53d]'} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* CONFIG SUB-TAB: Program Settings */}
              {referralSubTab === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">

                  {/* Commission & Rewards */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">paid</span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Commission & Reward Rules</h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Commission Rate (%)</label>
                        <div className="flex items-center gap-3">
                          <input
                            aria-label="Commission Rate"
                            type="number" min="1" max="50"
                            value={referralConfig.commissionRate}
                            onChange={e => setReferralConfig(prev => ({ ...prev, commissionRate: parseInt(e.target.value) || 0 }))}
                            className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                          <span className="text-[#A69984]/60 text-sm font-bold">%</span>
                        </div>
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Percentage of referred tenant's first payment awarded to ambassador.</p>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Flat Reward per Signup ($)</label>
                        <div className="flex items-center gap-3">
                          <input
                            aria-label="Flat Reward per Signup in USD"
                            type="number" min="0"
                            value={referralConfig.rewardPerSignup}
                            onChange={e => setReferralConfig(prev => ({ ...prev, rewardPerSignup: parseInt(e.target.value) || 0 }))}
                            className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                          <span className="text-[#A69984]/60 text-sm font-bold">USD</span>
                        </div>
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Fixed bonus credited when a referred business activates their subscription.</p>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Minimum Payout Threshold ($)</label>
                        <input
                          aria-label="Minimum Payout Threshold in USD"
                          type="number" min="0"
                          value={referralConfig.minPayoutThreshold}
                          onChange={e => setReferralConfig(prev => ({ ...prev, minPayoutThreshold: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        />
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Ambassadors must accumulate this balance before a payout can be requested.</p>
                      </div>
                    </div>
                  </div>

                  {/* Program Settings */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">settings</span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Program Settings</h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Referral Base URL</label>
                        <input
                          aria-label="Referral Base URL"
                          type="text"
                          value={referralConfig.referralBaseUrl}
                          onChange={e => setReferralConfig(prev => ({ ...prev, referralBaseUrl: e.target.value }))}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#A69984] font-mono focus:outline-none focus:border-[#ffc53d]/45"
                        />
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">Ambassador code is appended to this URL to form the full referral link.</p>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Cookie Tracking Duration (Days)</label>
                        <input
                          aria-label="Cookie Tracking Duration in Days"
                          type="number" min="1" max="365"
                          value={referralConfig.cookieDuration}
                          onChange={e => setReferralConfig(prev => ({ ...prev, cookieDuration: parseInt(e.target.value) || 30 }))}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        />
                        <p className="text-[9px] text-[#A69984]/40 mt-1.5">How long a referral attribution cookie is retained for returning visitors.</p>
                      </div>
                      {/* Program Active Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-bold text-xs">Program Active</p>
                          <p className="text-[#A69984]/50 text-[9.5px] mt-0.5">Accept new referral sign-ups and award commissions</p>
                        </div>
                        <button type="button"
                          onClick={() => setReferralConfig(prev => ({ ...prev, programActive: !prev.programActive }))}
                          className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${referralConfig.programActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${referralConfig.programActive ? 'left-[22px]' : 'left-0.5'}`}></span>
                        </button>
                      </div>
                      <button type="button"
                        onClick={() => {
                          localStorage.setItem('dinepos_referral_config', JSON.stringify(referralConfig));
                          window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_referral_config', newValue: JSON.stringify(referralConfig) }));
                          triggerToast('Referral program configuration saved successfully!', 'success');
                        }}
                        className="w-full py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>

                  {/* Automation & Notifications — full width */}
                  <div className={`${theme.cardBg} border rounded-2xl p-7 lg:col-span-2`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">notifications_active</span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Automation & Notifications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Toggles column */}
                      <div className="space-y-4">
                        {[
                          { key: 'autoRewardOnConversion' as const, label: 'Auto-Reward on Conversion', desc: 'Automatically credit ambassador reward when a referred business subscribes — no manual approval needed.' },
                          { key: 'notifyAmbassadorOnSignup' as const, label: 'Notify Ambassador on Signup', desc: 'Send an email notification to the ambassador when a business signs up with their referral code.' },
                          { key: 'notifyAmbassadorOnPayout' as const, label: 'Notify Ambassador on Payout', desc: 'Notify ambassador by email when a payout is processed and funds are being transferred.' },
                        ].map(setting => (
                          <div key={setting.key} className="flex items-start justify-between gap-4 p-4 bg-white/[0.025] border border-white/[0.06] rounded-xl">
                            <div className="flex-1">
                              <p className="text-white font-bold text-xs">{setting.label}</p>
                              <p className="text-[#A69984]/50 text-[9.5px] mt-0.5 leading-relaxed">{setting.desc}</p>
                            </div>
                            <button type="button"
                              onClick={() => setReferralConfig(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                              className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 mt-0.5 ${referralConfig[setting.key] ? 'bg-emerald-500' : 'bg-white/10'}`}
                            >
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${referralConfig[setting.key] ? 'left-[22px]' : 'left-0.5'}`}></span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Payment method column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-3">Payout Method</label>
                          <div className="space-y-2">
                            {([
                              { value: 'bank_transfer', label: 'Bank Transfer', icon: 'account_balance', desc: 'Standard ACH/wire to registered bank account' },
                              { value: 'ach', label: 'ACH Direct', icon: 'swap_horiz', desc: 'Automated Clearing House — US domestic only' },
                              { value: 'wire', label: 'International Wire', icon: 'public', desc: 'SWIFT/SEPA for international ambassadors' },
                              { value: 'paypal', label: 'PayPal', icon: 'currency_exchange', desc: 'PayPal business account transfer' },
                            ] as { value: ReferralConfig['paymentMethod']; label: string; icon: string; desc: string }[]).map(opt => (
                              <button key={opt.value} type="button"
                                onClick={() => setReferralConfig(prev => ({ ...prev, paymentMethod: opt.value }))}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                                  referralConfig.paymentMethod === opt.value
                                    ? 'bg-[#ffc53d]/8 border-[#ffc53d]/30'
                                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'
                                }`}
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${referralConfig.paymentMethod === opt.value ? 'bg-[#ffc53d]/15' : 'bg-white/5'}`}>
                                  <span className={`material-symbols-outlined text-sm ${referralConfig.paymentMethod === opt.value ? 'text-[#ffc53d]' : 'text-[#A69984]/50'}`}>{opt.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold text-[11px] ${referralConfig.paymentMethod === opt.value ? 'text-[#ffc53d]' : 'text-white'}`}>{opt.label}</p>
                                  <p className="text-[#A69984]/45 text-[9px] font-medium mt-0.5">{opt.desc}</p>
                                </div>
                                {referralConfig.paymentMethod === opt.value && (
                                  <span className="material-symbols-outlined text-[#ffc53d] text-base flex-shrink-0">check_circle</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button"
                          onClick={() => {
                            localStorage.setItem('dinepos_referral_config', JSON.stringify(referralConfig));
                            window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_referral_config', newValue: JSON.stringify(referralConfig) }));
                            triggerToast('Automation & notification settings saved!', 'success');
                          }}
                          className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#ffe2ab] font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payout Transaction History */}
              {payoutHistory.length > 0 && (
                <div className={`${theme.cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">Payout Transaction History</h3>
                    <button type="button" onClick={handleExportPayoutHistory}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A69984]/60 hover:text-[#ffe2ab] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {payoutHistory.map(tx => (
                      <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.015] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-400 text-sm">payments</span>
                          </div>
                          <div>
                            <p className="text-white font-bold text-xs font-sans">{tx.ambassadorName}</p>
                            <p className="text-[#A69984]/50 text-[10px] font-sans">{tx.note}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold font-sans">${tx.amount.toFixed(2)}</p>
                          <p className="text-[#A69984]/40 text-[10px] font-sans">{tx.date} • {tx.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: PAYMENTS (Subscription & Billing Ledger) */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${theme.border} pb-6 gap-4`}>
                <div className="select-none">
                  <h2 className={`font-serif text-[38px] font-bold text-white tracking-wide leading-none`}>
                    Subscription & Billing
                  </h2>
                  <p className={`font-sans text-[12.5px] ${theme.textMuted} mt-3 leading-relaxed max-w-2xl font-semibold`}>
                    Manage platform pricing tiers, tenant subscription billings, payment gateway configurations, and track recent invoices.
                  </p>
                </div>

                {/* Download Statements trigger */}
                <button type="button"
                  onClick={() => {
                    const header = ['Date', 'Tenant', 'Plan', 'Amount', 'Status', 'Invoice #'];
                    const rows = [
                      ['Nov 15, 2026', 'The Obsidian Room', 'Business', '¥12,980', 'Upcoming', 'INV-8821-NOV'],
                      ['Oct 01, 2026', 'Lumière Brasserie', 'Growth', '¥6,980', 'Paid', 'INV-7734-OCT'],
                      ['Oct 01, 2026', 'Aman Resorts', 'Business', '¥12,980', 'Paid', 'INV-9021-OCT'],
                    ];
                    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `platform_statements_${new Date().toISOString().split('T')[0]}.csv`; a.click();
                    URL.revokeObjectURL(url);
                    triggerToast('Financial statements exported as CSV.', 'success');
                  }}
                  className={`bg-transparent border ${theme.buttonOutline} px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none`}
                >
                  Download Statements
                </button>
              </div>

              {/* Plan Details and Payment Method Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Plan Card (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[250px]`}>
                    {/* Checkmark Watermark Background */}
                    <div className="absolute right-6 bottom-4 text-white/[0.02] pointer-events-none select-none">
                      <span className="material-symbols-outlined text-[140px] leading-none">verified</span>
                    </div>

                    <div className="space-y-6 z-10 font-sans">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                            Platform Billing Overview
                          </span>
                          <h3 className={`font-serif text-3xl font-bold text-white mt-2.5`}>Enterprise Platform Plans</h3>
                          <p className={`text-[11px] ${theme.textMutedLight} font-semibold mt-1`}>
                            DinePosAi Global SaaS Operations • Active Renewals
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`font-serif text-3xl font-bold text-[#ffc53d]`}>$148,500</span>
                          <span className={`text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider mt-0.5`}>Platform MRR</span>
                        </div>
                      </div>

                      {/* Stat meters */}
                      <div className="grid grid-cols-2 gap-8 pt-2 font-sans">
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${theme.textMuted} font-bold uppercase tracking-wider block`}>Active Terminals</span>
                          <div className={`text-sm font-bold text-white`}>1,248 / 1,500 Active</div>
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${theme.textMuted} font-bold uppercase tracking-wider block`}>Total Deployed Storage</span>
                          <div className={`text-sm font-bold text-white`}>242 TB / 500 TB</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 z-10 select-none">
                      <button type="button" 
                        onClick={() => setShowPlanEditorModal(true)}
                        className={`bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md cursor-pointer`}
                      >
                        Manage Plans
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Opening billing add-ons and modules marketplace...', 'info')}
                        className={`bg-transparent border ${theme.buttonOutline} font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 cursor-pointer`}
                      >
                        Billing Add-ons
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method Card (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl min-h-[250px] flex flex-col justify-between`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <h3 className={`font-serif text-sm text-white font-bold tracking-wide`}>Payment Gateways</h3>
                        <button type="button" 
                          onClick={() => triggerToast('Opening platform payment processor settings...', 'info')}
                          className="text-[9.5px] text-[#ffe2ab] font-bold tracking-widest hover:text-white uppercase transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Mock Stripe Integration */}
                      <div className={`${theme.inputBg}/50 border ${theme.border} rounded-xl p-5 flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-8 rounded border ${theme.borderStrong} bg-black/40 flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-[#e5e2e1]/70 text-lg">credit_card</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-sans text-xs font-bold text-white tracking-widest">
                              Stripe Payout <span className="text-sm font-mono font-bold text-white tracking-normal ml-1">4242</span>
                            </div>
                            <div className={`text-[9.5px] ${theme.textMuted} font-bold mt-1`}>Expires 12/25</div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded border border-white/10 text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider select-none leading-none">
                          Default
                        </span>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => triggerToast('Opening gateway setup helper...', 'info')}
                      className={`w-full py-3 bg-transparent border border-dashed ${theme.borderStrong} hover:border-white/20 text-[#A69984] font-sans font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-4`}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                      Add Backup Gateway
                    </button>
                  </div>
                </div>
              </div>

              {/* Invoices segment */}
              <div className={`${theme.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                <div className={`p-6 border-b ${theme.border} flex justify-between items-center select-none`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${theme.accent} text-lg`}>receipt_long</span>
                    <h3 className={`font-serif text-base text-white font-bold tracking-wide`}>Upcoming & Recent Invoices</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${theme.border} ${theme.inputBg}/50 text-[9.5px] font-bold ${theme.textMuted} uppercase tracking-widest`}>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Tenant / Establishment</th>
                        <th className="px-6 py-4">Pricing Plan</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.divider} font-sans text-xs`}>
                      
                      {/* Row 1 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Nov 15, 2026</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>The Obsidian Room</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                            Business
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥12,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 text-[#A69984]/50 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Upcoming
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading invoice preview...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Oct 01, 2026</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Lumière Brasserie</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                            Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥6,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Sep 02, 2025</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Cafe Zenith</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-semibold">
                            Starter
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥3,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Failed
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Initiated manual retry of payment sequence for Cafe Zenith...', 'info')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-rose-400 transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">replay</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Nov 15, 2025</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>The Obsidian Room</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                            Business
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥12,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 5 */}
                      <tr className={`hover:${theme.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${theme.textMuted}`}>Feb 15, 2026</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Gaggan Anand</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold">
                            Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>¥6,980</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: USER ACCESS (Admins management + issues) */}
          {activeTab === 'access' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Admins & Access Control
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Manage business owners, account permissions, and resolve administrative access credentials.
                  </p>
                </div>
                
                <button type="button"
                  onClick={() => setShowAddAdminModal(true)}
                  className={`px-5 py-3 ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">person_add</span>
                  Add Admin
                </button>
              </div>

              {/* Outstanding issues block - e.g., Password change requests */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 border-amber-500/20`}>
                <div className="flex items-center gap-3 select-none">
                  <span className="material-symbols-outlined text-amber-400 text-xl font-bold animate-bounce">warning</span>
                  <div>
                    <h3 className="font-serif text-base text-white font-bold tracking-wide">Action Required: Administrative Issues</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Unresolved password resets and synchronicity claims.</p>
                  </div>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  {/* Issue 1 */}
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#0e0e0d]/80 border border-white/5 rounded-xl gap-4 hover:border-amber-400/20 transition-all`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/10 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Password Reset Request</span>
                        <span className="text-[10px] text-[#A69984]">Requested 10m ago</span>
                      </div>
                      <h4 className="text-white font-serif font-bold text-sm mt-2">Nick Jones — owner of "Soho House"</h4>
                      <p className="text-[11px] text-[#A69984]/70 mt-1 font-medium">Locked out of dashboard terminal. Needs password/passcode replacement immediately to handle night audit operations.</p>
                    </div>
                    
                    <button type="button" 
                      onClick={() => handleOpenResetModal(admins.find(a => a.id === 'adm-3')!)}
                      className="px-4 py-2.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors flex items-center gap-1 select-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-black">key</span>
                      Reset Passcode
                    </button>
                  </div>

                  {/* Issue 2 */}
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#0e0e0d]/80 border border-white/5 rounded-xl gap-4 hover:border-amber-400/20 transition-all`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/10 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Sync Integrity Block</span>
                        <span className="text-[10px] text-[#A69984]">Requested 1h ago</span>
                      </div>
                      <h4 className="text-white font-serif font-bold text-sm mt-2">Ana Ros — owner of "Hisa Franko"</h4>
                      <p className="text-[11px] text-[#A69984]/70 mt-1 font-medium">Billing node mismatch is preventing terminal synchronizations. System disabled tenant temporarily. Admin demands clearance validation.</p>
                    </div>
                    
                    <button type="button" 
                      onClick={() => {
                        toggleTenantStatus('tenant-5', 'Hisa Franko', 'SUSPENDED');
                        triggerToast('Sync block cleared. Tenant status set to active.', 'success');
                      }}
                      className="px-4 py-2.5 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors flex items-center gap-1 select-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      Clear Sync Block
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Directory Table */}
              <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                  <h3 className="font-serif text-base text-white font-bold tracking-wide">Business Owners Registry</h3>
                  <span className="text-xs text-[#A69984]/50 font-semibold">{filteredAdmins.length} Admins registered</span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Owner Name</th>
                        <th className="py-4 px-4">Work Email</th>
                        <th className="py-4 px-4">Owned Business (Tenant)</th>
                        <th className="py-4 px-4">Last Activity</th>
                        <th className="py-4 px-4 text-center">Account Status</th>
                        <th className="py-4 px-4 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {filteredAdmins.map(a => (
                        <tr key={a.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold uppercase">
                              {a.name.slice(0, 2)}
                            </span>
                            {a.name}
                          </td>
                          <td className="py-4 px-4 text-[#A69984]">{a.email}</td>
                          <td className="py-4 px-4 text-white/80">{a.tenant}</td>
                          <td className="py-4 px-4 text-[#A69984]/70">{a.lastActive}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${
                              a.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                              a.status === 'SUSPENDED' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-[#A69984]/40'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button type="button" 
                              onClick={() => handleOpenResetModal(a)}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#A69984] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Password
                            </button>
                            <button type="button" 
                              onClick={() => toggleAdminStatus(a.id, a.name, a.status)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                a.status === 'ACTIVE' 
                                  ? 'border-rose-500/10 text-rose-400 hover:bg-rose-500/10' 
                                  : 'border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {a.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: GLOBAL SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Global Console Settings
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Manage system RBAC defaults, toggle active platform feature flags, and view secure audit trails.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
                {/* Feature gates & policies (Span 8) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Feature Flags Card */}
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                      <span className="material-symbols-outlined text-[#ffc53d]">toggle_on</span>
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Global SaaS Feature Toggles</h3>
                    </div>

                    <div className="space-y-4">
                      {/* AI Concierge Toggle */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">AI Sommelier & Concierge Engine</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Enable or disable client-side chat widgets and AI recommended dining suggestions across all tenant checkouts.</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setGlobalFeatures(prev => ({ ...prev, aiConcierge: !prev.aiConcierge }));
                            triggerToast(`AI Concierge feature status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.aiConcierge ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.aiConcierge ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* LLM Model Configuration (Visible when AI Concierge is enabled) */}
                      {globalFeatures.aiConcierge && (
                        <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-4 ml-4 relative">
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#ffc53d]/50 rounded-l-xl"></div>
                          
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">LLM Provider & Model</label>
                            <select
                              value={globalFeatures.llmModel}
                              onChange={(e) => {
                                setGlobalFeatures(prev => ({ ...prev, llmModel: e.target.value }));
                                triggerToast('LLM model provider updated.', 'success');
                              }}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            >
                              <option value="gpt-4o">OpenAI GPT-4o (Recommended)</option>
                              <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                              <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
                              <option value="claude-3-sonnet">Anthropic Claude 3.5 Sonnet</option>
                              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">API Key</label>
                            <input
                              type="password"
                              placeholder="sk-..."
                              value={globalFeatures.llmApiKey}
                              onChange={(e) => setGlobalFeatures(prev => ({ ...prev, llmApiKey: e.target.value }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 transition-colors"
                            />
                            <p className="text-[9.5px] text-[#A69984]/50 mt-1.5">Your API key is stored securely and used to process Concierge requests.</p>
                          </div>
                        </div>
                      )}

                      {/* Guest Self-Checkout Toggle */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">Guest Self-Checkout Terminal Authorization</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Allow guests to check out directly from their mobile device digital receipts without cashier station interactions.</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setGlobalFeatures(prev => ({ ...prev, selfCheckout: !prev.selfCheckout }));
                            triggerToast(`Self-Checkout feature status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.selfCheckout ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.selfCheckout ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Offline Mode Sync */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">Offline Mode Node Synchronizations</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Enable local database replication when network is disconnected. (Beta)</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setGlobalFeatures(prev => ({ ...prev, offlineMode: !prev.offlineMode }));
                            triggerToast(`Offline Mode status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.offlineMode ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.offlineMode ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backup Policy Card */}
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                      <span className="material-symbols-outlined text-[#ffc53d]">backup</span>
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Automated Backup Policies</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Backup Interval</label>
                        <select
                          aria-label="Backup interval"
                          value={globalFeatures.backupInterval}
                          onChange={(e) => {
                            setGlobalFeatures(prev => ({ ...prev, backupInterval: e.target.value }));
                            triggerToast(`Backup policy interval updated to: ${e.target.value}`, 'success');
                          }}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        >
                          <option value="hourly">Hourly Snapshots</option>
                          <option value="daily">Daily Cron Job (Recommended)</option>
                          <option value="weekly">Weekly Rollups</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Max Snapshot Retention</label>
                        <select
                          aria-label="Backup retention"
                          value={globalFeatures.backupRetention}
                          onChange={(e) => {
                            setGlobalFeatures(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }));
                            triggerToast(`Backup retention updated to last ${e.target.value} logs.`, 'success');
                          }}
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                        >
                          <option value={5}>Keep 5 latest snapshots</option>
                          <option value={10}>Keep 10 latest snapshots</option>
                          <option value={20}>Keep 20 latest snapshots</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-4">
                      <button type="button" 
                        onClick={() => triggerToast('Generating encrypted SQL schema & seed snapshot...', 'info')}
                        className="px-4 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download SQL Snapshot
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Initiating platform restore sequence from latest snapshot...', 'info')}
                        className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-[#A69984] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                        Restore Latest Backup
                      </button>
                    </div>
                  </div>

                </div>

                {/* Audit trail / logs list on the right (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 min-h-[400px]`}>
                    <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Audit Trail</h3>
                      <button type="button" 
                        onClick={() => { setAuditLogs([]); triggerToast('Logs cleared.', 'info'); }}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-4 text-xs select-text overflow-y-auto max-h-[380px] pr-1">
                      {filteredLogs.map(log => (
                        <div key={log.id} className="border-b border-white/5 pb-3 last:border-none">
                          <div className="flex gap-2 items-start">
                            <span className={`material-symbols-outlined text-sm mt-0.5 ${
                              log.type === 'security' ? 'text-amber-400' :
                              log.type === 'warning' ? 'text-rose-400' :
                              log.type === 'success' ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                              {log.type === 'security' ? 'security' : log.type === 'warning' ? 'priority_high' : log.type === 'success' ? 'check_circle' : 'info'}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight">{log.action}</div>
                              <div className="text-[9.5px] text-[#A69984]/65 mt-1 font-semibold">
                                {log.actor} • <span className="italic">{log.tenant}</span>
                              </div>
                              <span className="text-[8px] text-[#A69984]/40 font-bold block mt-1 uppercase tracking-wider">{log.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredLogs.length === 0 && (
                        <div className="text-center py-20 text-[#A69984]/30">
                          Audit logs clear.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: CMS CONTENT MANAGEMENT */}
          {activeTab === 'cms' && (
            <div className="space-y-8 animate-fade-in duration-300">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    CMS Content Manager
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Modify the live copy, images, pricing tiers, and legal policies displayed across DinePOS AI platform pages.
                  </p>
                </div>
                <div>
                  <button type="button"
                    onClick={() => {
                      saveCmsConfig(cmsConfig);
                      setAuditLogs(prev => [
                        {
                          id: Date.now(),
                          time: 'Just now',
                          actor: 'Super Admin',
                          action: `Published updates to CMS configuration (${cmsSubTab.toUpperCase()})`,
                          tenant: 'System-wide',
                          type: 'security'
                        },
                        ...prev
                      ]);
                      triggerToast('CMS Configuration updated and published!', 'success');
                    }}
                    className={`px-6 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">publish</span>
                    Publish Changes
                  </button>
                </div>
              </div>

              {/* Sub-tabs Selection */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                {[
                  { id: 'homepage', label: 'Homepage', icon: 'home' },
                  { id: 'pricing', label: 'SaaS Pricing', icon: 'payments' },
                  { id: 'support', label: 'Support Desk', icon: 'support_agent' },
                  { id: 'partners', label: 'Partner Program', icon: 'group' },
                  { id: 'auth', label: 'Auth Screens', icon: 'login' },
                  { id: 'legal', label: 'Legal Policies', icon: 'policy' }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => setCmsSubTab(subTab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                      cmsSubTab === subTab.id
                        ? 'bg-[#ffc53d]/10 border-[#ffc53d]/30 text-[#ffc53d]'
                        : 'border-white/5 text-[#A69984]/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{subTab.icon}</span>
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
                <div className="lg:col-span-8 space-y-8">
                  {cmsSubTab === 'homepage' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">home</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Homepage Hero & Bento Feature Blocks</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Hero Image */}
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Hero Image URL</label>
                          <input
                            type="text"
                            value={cmsConfig.homepage.heroImage}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              homepage: { ...prev.homepage, heroImage: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        {/* Hero Title */}
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Hero Title</label>
                          <input
                            type="text"
                            value={cmsConfig.homepage.heroTitle}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              homepage: { ...prev.homepage, heroTitle: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        {/* Hero Subtitle */}
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Hero Subtitle</label>
                          <textarea
                            rows={3}
                            value={cmsConfig.homepage.heroSubtitle}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              homepage: { ...prev.homepage, heroSubtitle: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                          />
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Feature Blocks (Bento Grid)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* POS Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">POS Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.posTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, posTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">POS Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.posDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, posDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* KDS Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KDS Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.kdsTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, kdsTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KDS Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.kdsDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, kdsDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* Concierge Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.conciergeTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, conciergeTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.conciergeDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, conciergeDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* Guest Title & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Guest Profile Feature Title</label>
                              <input
                                type="text"
                                value={cmsConfig.homepage.guestTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, guestTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Guest Profile Feature Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.homepage.guestDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, guestDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'pricing' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">payments</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">SaaS Subscription Pricing & Tier Descriptions</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        {/* Starter Tier */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Starter Package</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Price (¥)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.starterMonthly}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, starterMonthly: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Annual Price (¥ / month)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.starterAnnual}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, starterAnnual: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Starter Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.pricing.starterDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                               ...prev,
                               pricing: { ...prev.pricing, starterDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Growth Tier */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Growth Package</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Price (¥)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.growthMonthly}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, growthMonthly: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Annual Price (¥ / month)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.growthAnnual}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, growthAnnual: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Growth Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.pricing.growthDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                               ...prev,
                               pricing: { ...prev.pricing, growthDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Business Tier */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Business Package</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Price (¥)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.premiumMonthly}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, premiumMonthly: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Annual Price (¥ / month)</label>
                              <input
                                type="text"
                                value={cmsConfig.pricing.premiumAnnual}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  pricing: { ...prev.pricing, premiumAnnual: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Business Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.pricing.premiumDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                               ...prev,
                               pricing: { ...prev.pricing, premiumDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'support' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">support_agent</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Support Desk Copy & FAQs</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Support Title</label>
                            <input
                              type="text"
                              value={cmsConfig.support.title}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, title: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Support Subtitle</label>
                            <input
                              type="text"
                              value={cmsConfig.support.subtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, subtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Email</label>
                            <input
                              type="text"
                              value={cmsConfig.support.email}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, email: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Concierge Phone</label>
                            <input
                              type="text"
                              value={cmsConfig.support.phone}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, phone: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Available Hours</label>
                            <input
                              type="text"
                              value={cmsConfig.support.hours}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, hours: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Knowledge Base / FAQs</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 1: Question</label>
                            <input
                              type="text"
                              value={cmsConfig.support.faq1Title}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq1Title: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 1: Answer</label>
                            <textarea
                              rows={3}
                              value={cmsConfig.support.faq1Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq1Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 2: Question</label>
                            <input
                              type="text"
                              value={cmsConfig.support.faq2Title}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq2Title: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ 2: Answer</label>
                            <textarea
                              rows={3}
                              value={cmsConfig.support.faq2Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, faq2Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Support Page Layout & Placeholders</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KB Title</label>
                            <input
                              type="text"
                              value={cmsConfig.support.kbTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kbTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KB Subtitle</label>
                            <input
                              type="text"
                              value={cmsConfig.support.kbSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kbSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">KB Button Text</label>
                            <input
                              type="text"
                              value={cmsConfig.support.kbButtonText}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kbButtonText: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        {/* KB Article 1 */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Knowledge Base Card 1</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 1 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb1Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb1Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 1 Icon (Material Symbol)</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb1Icon}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb1Icon: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 1 Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.support.kb1Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kb1Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* KB Article 2 */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Knowledge Base Card 2</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 2 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb2Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb2Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 2 Icon (Material Symbol)</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb2Icon}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb2Icon: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 2 Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.support.kb2Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kb2Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* KB Article 3 */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Knowledge Base Card 3</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 3 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb3Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb3Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 3 Icon (Material Symbol)</label>
                              <input
                                type="text"
                                value={cmsConfig.support.kb3Icon}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, kb3Icon: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Card 3 Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.support.kb3Desc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                support: { ...prev.support, kb3Desc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Inquiry form settings */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Direct Inquiry Form</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Header Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Submit Button Text</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formButtonText}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formButtonText: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Establishment Input Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formEstPlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formEstPlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Name Input Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formNamePlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formNamePlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Email Input Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formEmailPlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formEmailPlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Message Textarea Placeholder</label>
                              <input
                                type="text"
                                value={cmsConfig.support.formMsgPlaceholder}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, formMsgPlaceholder: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ticket Portal settings */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Ticket Portal Card</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Portal Card Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.portalTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, portalTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Portal Card Description</label>
                              <input
                                type="text"
                                value={cmsConfig.support.portalDesc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, portalDesc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                        {/* FAQ titles */}
                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">FAQ Section Titles</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ Main Title</label>
                              <input
                                type="text"
                                value={cmsConfig.support.faqTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, faqTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">FAQ Subtitle</label>
                              <input
                                type="text"
                                value={cmsConfig.support.faqSubtitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  support: { ...prev.support, faqSubtitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'partners' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">group</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Global Alliance & Featured Partners</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Partners Hero Title</label>
                          <input
                            type="text"
                            value={cmsConfig.partners.title}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              partners: { ...prev.partners, title: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Partners Hero Subtitle</label>
                          <input
                            type="text"
                            value={cmsConfig.partners.subtitle}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              partners: { ...prev.partners, subtitle: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Partners Introduction Copy</label>
                          <textarea
                            rows={3}
                            value={cmsConfig.partners.intro}
                            onChange={(e) => setCmsConfig(prev => ({
                              ...prev,
                              partners: { ...prev.partners, intro: e.target.value }
                            }))}
                            className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                          />
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Alliance Directory (Featured Integrations)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Partner 1 Name & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 1: Name</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.partner1Name}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner1Name: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 1: Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.partners.partner1Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner1Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>

                          {/* Partner 2 Name & Desc */}
                          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 2: Name</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.partner2Name}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner2Name: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Integration 2: Description</label>
                              <textarea
                                rows={3}
                                value={cmsConfig.partners.partner2Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, partner2Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">How it Works (Steps)</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Step 1</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 1 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.step1Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step1Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 1 Description</label>
                              <textarea
                                rows={2}
                                value={cmsConfig.partners.step1Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step1Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Step 2</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 2 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.step2Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step2Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 2 Description</label>
                              <textarea
                                rows={2}
                                value={cmsConfig.partners.step2Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step2Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Step 3</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 3 Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.step3Title}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step3Title: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Step 3 Description</label>
                              <textarea
                                rows={2}
                                value={cmsConfig.partners.step3Desc}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, step3Desc: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Ambassador Testimonial & Policies</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Ambassador Testimonial Quote</label>
                            <textarea
                              rows={3}
                              value={cmsConfig.partners.testimonialQuote}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                partners: { ...prev.partners, testimonialQuote: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Ambassador Testimonial Author & Role</label>
                            <input
                              type="text"
                              value={cmsConfig.partners.testimonialAuthor}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                partners: { ...prev.partners, testimonialAuthor: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Alliances Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.allianceTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, allianceTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Alliances Subtitle</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.allianceSubtitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, allianceSubtitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Payout Policies (Comma-separated, supports placeholders like {'{rewardPerSignup}'}, {'{commissionRate}'}, {'{minPayoutThreshold}'}, {'{cookieDuration}'})</label>
                            <textarea
                              rows={4}
                              value={cmsConfig.partners.payoutPolicies}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                partners: { ...prev.partners, payoutPolicies: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Ambassador Registration Info</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Reg Title</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.regTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, regTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Reg Subtitle</label>
                              <input
                                type="text"
                                value={cmsConfig.partners.regSubtitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  partners: { ...prev.partners, regSubtitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'auth' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">login</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Executive Auth Screens Copy</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {/* Login Screen */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Sign-In page (Login Console)</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Subtitle</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.auth.loginSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Register Screen */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Sign-Up page (Register Console)</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Register Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.signupTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Register Subtitle</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.auth.signupSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Auth Page Headers & Logos</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Brand Logo Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginPageTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginPageTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Register Brand Logo Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.signupPageTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupPageTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Login Page Input Labels & Buttons</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Select Role Label</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginRoleLabel}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginRoleLabel: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Email Input Label</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginEmailLabel}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginEmailLabel: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Password Input Label</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginPasswordLabel}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginPasswordLabel: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Remember Me Text</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginRememberMe}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginRememberMe: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Forgot Password Text</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginForgotPassword}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginForgotPassword: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Sign-In Button Text</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginButtonText}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginButtonText: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Demo Access Title</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginDemoTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginDemoTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Login Footer Notes</label>
                            <input
                              type="text"
                              value={cmsConfig.auth.loginFooter}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, loginFooter: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <h4 className="font-serif text-sm text-white font-bold mb-4">Register Page Custom copy</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Left Side Brand Banner</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Banner Eyebrow</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupLeftEyebrow}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupLeftEyebrow: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Banner Headline</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupLeftTitle}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupLeftTitle: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Banner Description</label>
                            <textarea
                              rows={2}
                              value={cmsConfig.auth.signupLeftDesc}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                auth: { ...prev.auth, signupLeftDesc: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-[10px] text-[#ffc53d] uppercase tracking-wider font-bold">Right Side Form Console</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Trial Eyebrow (e.g. {'{selectedTier}'} Free Trial)</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupRightEyebrow}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupRightEyebrow: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Submit Button Text</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupButtonText}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupButtonText: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Form Footer Copyright Notes</label>
                              <input
                                type="text"
                                value={cmsConfig.auth.signupFooter}
                                onChange={(e) => setCmsConfig(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, signupFooter: e.target.value }
                                }))}
                                className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'legal' && (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                        <span className="material-symbols-outlined text-[#ffc53d]">policy</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Legal Agreements & Policies</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {/* Terms of Service */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Terms of Service (TOS)</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Terms Header Title</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.termsTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, termsTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Terms Subheading</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.termsSubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, termsSubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Terms Introductory Body Copy</label>
                            <textarea
                              rows={4}
                              value={cmsConfig.legal.termsBody1}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, termsBody1: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>

                        {/* Privacy Policy */}
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h4 className="font-serif text-sm text-[#ffc53d] font-bold">Privacy Policy</h4>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Privacy Header Title</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.privacyTitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, privacyTitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Privacy Subheading</label>
                            <input
                              type="text"
                              value={cmsConfig.legal.privacySubtitle}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, privacySubtitle: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Privacy Introductory Body Copy</label>
                            <textarea
                              rows={4}
                              value={cmsConfig.legal.privacyBody1}
                              onChange={(e) => setCmsConfig(prev => ({
                                ...prev,
                                legal: { ...prev.legal, privacyBody1: e.target.value }
                              }))}
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Audit trail sidebar */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 min-h-[400px]`}>
                    <div className="flex justify-between items-center select-none border-b border-white/5 pb-4">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Audit Trail</h3>
                      <button type="button" 
                        onClick={() => { setAuditLogs([]); triggerToast('Logs cleared.', 'info'); }}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-4 text-xs select-text overflow-y-auto max-h-[380px] pr-1">
                      {filteredLogs.map(log => (
                        <div key={log.id} className="border-b border-white/5 pb-3 last:border-none">
                          <div className="flex gap-2 items-start">
                            <span className={`material-symbols-outlined text-sm mt-0.5 ${
                              log.type === 'security' ? 'text-amber-400' :
                              log.type === 'warning' ? 'text-rose-400' :
                              log.type === 'success' ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                              {log.type === 'security' ? 'security' : log.type === 'warning' ? 'priority_high' : log.type === 'success' ? 'check_circle' : 'info'}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight">{log.action}</div>
                              <div className="text-[9.5px] text-[#A69984]/65 mt-1 font-semibold">
                                {log.actor} • <span className="italic">{log.tenant}</span>
                              </div>
                              <span className="text-[8px] text-[#A69984]/40 font-bold block mt-1 uppercase tracking-wider">{log.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredLogs.length === 0 && (
                        <div className="text-center py-20 text-[#A69984]/30">
                          Audit logs clear.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (() => {
            // Derived metrics from live state
            const totalTenants = tenants.length;
            const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
            const suspendedTenants = tenants.filter(t => t.status === 'SUSPENDED').length;
            const trialTenants = tenants.filter(t => t.plan === 'TRIAL').length;
            const churnRate = totalTenants > 0 ? ((suspendedTenants / totalTenants) * 100).toFixed(1) : '0.0';
            const trialConversion = totalTenants > 0 ? (((totalTenants - trialTenants - suspendedTenants) / totalTenants) * 100).toFixed(1) : '0.0';

            const businessTenants = tenants.filter(t => t.tier === 'Business');
            const growthTenants = tenants.filter(t => t.tier === 'Growth');
            const starterTenants = tenants.filter(t => t.tier === 'Starter');

            const parseRevenue = (r: string) => parseFloat(r.replace(/[¥$,]/g, '')) || 0;
            const totalRevenue = tenants.reduce((sum, t) => sum + parseRevenue(t.revenue), 0);
            const businessRevenue = businessTenants.reduce((sum, t) => sum + parseRevenue(t.revenue), 0);
            const growthRevenue = growthTenants.reduce((sum, t) => sum + parseRevenue(t.revenue), 0);
            const starterRevenue = starterTenants.reduce((sum, t) => sum + parseRevenue(t.revenue), 0);

            const totalTerminals = tenants.reduce((sum, t) => sum + t.terminals, 0);
            const avgTerminalsPerTenant = totalTenants > 0 ? (totalTerminals / totalTenants).toFixed(1) : '0';

            const onlineDevices = fleet.filter(d => d.status === 'ONLINE').length;
            const offlineDevices = fleet.filter(d => d.status === 'OFFLINE').length;
            const warningDevices = fleet.filter(d => d.status === 'WARNING_LOW_PAPER').length;
            const deviceUptime = fleet.length > 0 ? ((onlineDevices / fleet.length) * 100).toFixed(1) : '100.0';

            const posDevices = fleet.filter(d => d.type === 'POS').length;
            const kdsDevices = fleet.filter(d => d.type === 'KDS').length;
            const tabletDevices = fleet.filter(d => d.type === 'TABLET').length;
            const printerDevices = fleet.filter(d => d.type === 'PRINTER').length;

            const activeAdmins = admins.filter(a => a.status === 'ACTIVE').length;
            const inactiveAdmins = admins.filter(a => a.status !== 'ACTIVE').length;

            const openTickets = tickets.filter(t => t.status === 'OPEN').length;
            const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
            const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;
            const ticketResolutionRate = tickets.length > 0 ? ((resolvedTickets / tickets.length) * 100).toFixed(0) : '0';

            const totalPendingPayouts = ambassadors.reduce((sum: number, a: Ambassador) => sum + a.pendingRewards, 0);
            const totalPaidPayouts = ambassadors.reduce((sum: number, a: Ambassador) => sum + a.paidRewards, 0);
            const totalAmbassadors = ambassadors.length;
            const totalReferredBusinesses = ambassadors.reduce((sum: number, a: Ambassador) => sum + a.invitedBusinesses.length, 0);

            const mrr = (totalRevenue / 12).toFixed(0);
            const arr = totalRevenue.toFixed(0);

            const revenueBarMax = Math.max(businessRevenue, growthRevenue, starterRevenue, 1);

            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const mockMonthlyRevenue = [310000, 375000, 420000, 398000, 455000, totalRevenue];
            const sparkMax = Math.max(...mockMonthlyRevenue);

            return (
              <div className="space-y-8 animate-fade-in duration-300">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                      Platform Analytics
                    </h1>
                    <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                      Enterprise-wide KPIs, revenue intelligence, and operational health metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
                    Live Data
                  </div>
                </div>

                {/* TOP KPI ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 font-sans">
                  {/* MRR */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Monthly Recurring Rev.</span>
                      <span className="material-symbols-outlined text-amber-400 text-lg">trending_up</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-[#ffc53d] tracking-wide">${Number(mrr).toLocaleString()}</h3>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs leading-none">arrow_upward</span>
                        +8.3% vs last month
                      </p>
                    </div>
                  </div>
                  {/* ARR */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Annual Recurring Rev.</span>
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">monetization_on</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-white tracking-wide">${Number(arr).toLocaleString()}</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-bold mt-1.5">{activeTenants} paying tenants</p>
                    </div>
                  </div>
                  {/* Tenant Growth */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Tenant Growth Rate</span>
                      <span className="material-symbols-outlined text-emerald-400 text-lg">groups</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-white tracking-wide">{totalTenants}</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-bold mt-1.5">{trialConversion}% trial → paid conversion</p>
                    </div>
                  </div>
                  {/* Device Uptime */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[140px] shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-[9.5px] text-[#A69984]/65 uppercase tracking-widest">Fleet Uptime</span>
                      <span className="material-symbols-outlined text-emerald-400 text-lg">devices</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-emerald-400 tracking-wide">{deviceUptime}%</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-bold mt-1.5">{onlineDevices}/{fleet.length} devices online</p>
                    </div>
                  </div>
                </div>

                {/* SECOND ROW: Revenue by Tier + Revenue Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Revenue by Plan Tier */}
                  <div className={`lg:col-span-5 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Revenue by Plan Tier</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Lifetime GMV per subscription tier</p>
                      </div>
                      <span className="material-symbols-outlined text-amber-400 text-xl">leaderboard</span>
                    </div>
                    <div className="space-y-5">
                      {/* Business */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-[11px] text-white font-bold">Business</span>
                          </div>
                          <span className="text-[11px] text-[#ffc53d] font-bold">¥{businessRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full transition-all duration-700" style={{ width: `${(businessRevenue / revenueBarMax) * 100}%` }}></div>
                        </div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">{businessTenants.length} tenants · {totalTenants > 0 ? ((businessRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total revenue</div>
                      </div>
                      {/* Growth */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            <span className="text-[11px] text-white font-bold">Growth</span>
                          </div>
                          <span className="text-[11px] text-sky-400 font-bold">¥{growthRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-sky-400 h-2 rounded-full transition-all duration-700" style={{ width: `${(growthRevenue / revenueBarMax) * 100}%` }}></div>
                        </div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">{growthTenants.length} tenants · {totalTenants > 0 ? ((growthRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total revenue</div>
                      </div>
                      {/* Starter */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                            <span className="text-[11px] text-white font-bold">Starter</span>
                          </div>
                          <span className="text-[11px] text-violet-400 font-bold">¥{starterRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-violet-400 h-2 rounded-full transition-all duration-700" style={{ width: `${(starterRevenue / revenueBarMax) * 100}%` }}></div>
                        </div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">{starterTenants.length} tenants · {totalTenants > 0 ? ((starterRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total revenue</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Trend Sparkline */}
                  <div className={`lg:col-span-7 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Revenue Trend (6 Months)</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Cumulative platform revenue — all tenants</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest">Peak Month</div>
                        <div className="text-sm text-[#ffc53d] font-bold mt-0.5">Jun · ${(totalRevenue / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <div className="flex items-end gap-3 h-[100px]">
                      {mockMonthlyRevenue.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div
                            className={`w-full rounded-t-lg transition-all duration-700 ${i === mockMonthlyRevenue.length - 1 ? 'bg-amber-400' : 'bg-white/10'}`}
                            style={{ height: `${(val / sparkMax) * 100}%` }}
                          ></div>
                          <span className="text-[8.5px] text-[#A69984]/50 font-bold uppercase">{monthLabels[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest">Avg Monthly</div>
                        <div className="text-white font-bold text-sm mt-0.5">${(mockMonthlyRevenue.reduce((a, b) => a + b, 0) / 6 / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest">YTD Growth</div>
                        <div className="text-emerald-400 font-bold text-sm mt-0.5">+46.8%</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest">Terminals Online</div>
                        <div className="text-white font-bold text-sm mt-0.5">{totalTerminals} total · {avgTerminalsPerTenant} avg/tenant</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THIRD ROW: Tenant Health + Device Fleet */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Tenant Health Breakdown */}
                  <div className={`lg:col-span-6 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Tenant Health Breakdown</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Subscription status across all registered businesses</p>
                      </div>
                      <span className="material-symbols-outlined text-[#ffc53d] text-xl">corporate_fare</span>
                    </div>

                    {/* Status donut rows */}
                    <div className="space-y-4">
                      {[
                        { label: 'Active', count: activeTenants, color: 'bg-emerald-500', textColor: 'text-emerald-400', pct: totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0 },
                        { label: 'Trial', count: trialTenants, color: 'bg-amber-400', textColor: 'text-amber-400', pct: totalTenants > 0 ? (trialTenants / totalTenants) * 100 : 0 },
                        { label: 'Suspended', count: suspendedTenants, color: 'bg-rose-500', textColor: 'text-rose-400', pct: totalTenants > 0 ? (suspendedTenants / totalTenants) * 100 : 0 },
                      ].map(row => (
                        <div key={row.label}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`}></span>
                              <span className="text-[11px] text-white font-semibold">{row.label}</span>
                            </div>
                            <span className={`text-[11px] font-bold ${row.textColor}`}>{row.count} tenants</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div className={`${row.color} h-1.5 rounded-full`} style={{ width: `${row.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-1.5">Churn Rate</div>
                        <div className="text-rose-400 font-bold text-xl font-serif">{churnRate}%</div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">Monthly average</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-1.5">Trial Conversion</div>
                        <div className="text-emerald-400 font-bold text-xl font-serif">{trialConversion}%</div>
                        <div className="text-[9px] text-[#A69984]/40 font-semibold mt-1">Trials → paid plan</div>
                      </div>
                    </div>
                  </div>

                  {/* Fleet Device Analytics */}
                  <div className={`lg:col-span-6 ${theme.cardBg} border rounded-2xl p-7 font-sans`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Fleet Device Analytics</h3>
                        <p className="text-[10px] text-[#A69984]/50 font-semibold mt-1">Hardware deployment health across all locations</p>
                      </div>
                      <span className="material-symbols-outlined text-emerald-400 text-xl">devices</span>
                    </div>

                    {/* Uptime Gauge */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative w-[80px] h-[80px] flex-shrink-0">
                        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                          <circle cx="40" cy="40" r="32" fill="none" stroke="#34d399" strokeWidth="8"
                            strokeDasharray={`${(parseFloat(deviceUptime) / 100) * 201} 201`}
                            strokeLinecap="round"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-emerald-400 font-bold text-sm leading-none">{deviceUptime}%</span>
                          <span className="text-[7.5px] text-[#A69984]/50 font-bold uppercase mt-0.5">Uptime</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[
                          { label: 'Online', count: onlineDevices, color: 'bg-emerald-400' },
                          { label: 'Warning', count: warningDevices, color: 'bg-amber-400' },
                          { label: 'Offline', count: offlineDevices, color: 'bg-rose-500' },
                        ].map(row => (
                          <div key={row.label} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`}></span>
                              <span className="text-[#A69984]/70 font-semibold">{row.label}</span>
                            </div>
                            <span className="text-white font-bold">{row.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Device Type Breakdown */}
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                      <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-3">Device Type Distribution</div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {[
                          { label: 'POS', count: posDevices, icon: 'point_of_sale' },
                          { label: 'KDS', count: kdsDevices, icon: 'tv' },
                          { label: 'Tablet', count: tabletDevices, icon: 'tablet' },
                          { label: 'Printer', count: printerDevices, icon: 'print' },
                        ].map(d => (
                          <div key={d.label} className="flex flex-col items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#A69984]/60 text-base">{d.icon}</span>
                            <span className="text-white font-bold text-sm">{d.count}</span>
                            <span className="text-[9px] text-[#A69984]/45 font-bold uppercase">{d.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOURTH ROW: Admin Activity + Support Metrics + Referral Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Admin Activity */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 font-sans`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-white font-bold text-sm tracking-wide">Admin Activity</h3>
                      <span className="material-symbols-outlined text-[#ffc53d] text-lg">manage_accounts</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Total Admin Accounts</span>
                        <span className="text-white font-bold text-sm">{admins.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Active Admins</span>
                        <span className="text-emerald-400 font-bold text-sm">{activeAdmins}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Inactive / Suspended</span>
                        <span className="text-rose-400 font-bold text-sm">{inactiveAdmins}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Session Activity</span>
                        <span className="text-amber-400 font-bold text-sm">3 live sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Support Desk Metrics */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 font-sans`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-white font-bold text-sm tracking-wide">Support Desk Metrics</h3>
                      <span className="material-symbols-outlined text-sky-400 text-lg">confirmation_number</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Total Tickets</span>
                        <span className="text-white font-bold text-sm">{tickets.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Open</span>
                        <span className="text-rose-400 font-bold text-sm">{openTickets}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">In Progress</span>
                        <span className="text-amber-400 font-bold text-sm">{inProgressTickets}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Resolved</span>
                        <span className="text-emerald-400 font-bold text-sm">{resolvedTickets}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Resolution Rate</span>
                        <span className={`font-bold text-sm ${parseInt(ticketResolutionRate) >= 70 ? 'text-emerald-400' : parseInt(ticketResolutionRate) >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {tickets.length === 0 ? '—' : `${ticketResolutionRate}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Referral Program Performance */}
                  <div className={`${theme.cardBg} border rounded-2xl p-6 font-sans`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-white font-bold text-sm tracking-wide">Referral Performance</h3>
                      <span className="material-symbols-outlined text-violet-400 text-lg">loyalty</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Active Ambassadors</span>
                        <span className="text-white font-bold text-sm">{totalAmbassadors}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Businesses Referred</span>
                        <span className="text-violet-400 font-bold text-sm">{totalReferredBusinesses}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Pending Payouts</span>
                        <span className="text-amber-400 font-bold text-sm">${totalPendingPayouts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-[11px] text-[#A69984]/65 font-semibold">Total Paid Out</span>
                        <span className="text-emerald-400 font-bold text-sm">${totalPaidPayouts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIFTH ROW: Top Tenants by Revenue */}
                <div className={`${theme.cardBg} border rounded-2xl font-sans overflow-hidden`}>
                  <div className="px-7 py-5 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">Top Tenants by Revenue</h3>
                      <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Ranked by lifetime gross revenue · {activeTenants} active accounts</p>
                    </div>
                    <button type="button"
                      onClick={() => { setActiveTab('locations'); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#ffe2ab] border border-[#ffe2ab]/20 px-4 py-2 rounded-xl hover:bg-[#ffe2ab]/5 transition-colors cursor-pointer"
                    >
                      View All Tenants
                    </button>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-7 py-3">#</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Tenant</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Tier</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Region</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Terminals</th>
                        <th className="text-left text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-4 py-3">Status</th>
                        <th className="text-right text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-widest px-7 py-3">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {[...tenants]
                        .sort((a, b) => parseRevenue(b.revenue) - parseRevenue(a.revenue))
                        .map((t, idx) => (
                          <tr key={t.id} className="hover:bg-white/[0.015] transition-colors">
                            <td className="px-7 py-4 text-[11px] text-[#A69984]/40 font-bold">{idx + 1}</td>
                            <td className="px-4 py-4">
                              <div className="text-[12px] text-white font-bold">{t.name}</div>
                              <div className="text-[9.5px] text-[#A69984]/50 font-semibold mt-0.5">{t.location} · {t.id}</div>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-[#A69984]/70 font-semibold">{t.tier || '—'}</td>
                            <td className="px-4 py-4 text-[11px] text-[#A69984]/70 font-semibold">{t.region || '—'}</td>
                            <td className="px-4 py-4 text-[11px] text-white font-bold">{t.terminals}</td>
                            <td className="px-4 py-4">
                              <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${t.status === 'ACTIVE' ? theme.tagActive : theme.tagSuspended}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-7 py-4 text-right">
                              <span className="text-[12px] text-[#ffc53d] font-bold font-serif">{t.revenue}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })()}

          {/* TAB: SUPPORT DESK */}
          {activeTab === 'support' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Page Headers */}
              <div className="flex justify-between items-center select-none">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Support Ticket Portal
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Resolve operational issues, billing inquiries, and technical tickets submitted by restaurant owners.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button type="button" 
                    onClick={() => triggerToast('Fetching latest tickets...', 'info')}
                    className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] rounded-xl cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">refresh</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans select-none">
                {/* Total */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('ALL')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'ALL' ? 'bg-[#ffc53d]/5 border-[#ffc53d]/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">All Support Inquiries</span>
                  <h4 className="text-2xl font-bold mt-1.5">{tickets.length} Tickets</h4>
                </button>
                {/* Open */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('OPEN')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'OPEN' ? 'bg-rose-500/5 border-rose-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Open (Unresolved)</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 motion-safe:animate-ping"></span>
                  </div>
                  <h4 className="text-2xl font-bold text-rose-400 mt-1.5">{tickets.filter(t => t.status === 'OPEN').length} Tickets</h4>
                </button>
                {/* In Progress */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('IN_PROGRESS')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'IN_PROGRESS' ? 'bg-amber-500/5 border-amber-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">In Investigation</span>
                  <h4 className="text-2xl font-bold text-amber-400 mt-1.5">{tickets.filter(t => t.status === 'IN_PROGRESS').length} Tickets</h4>
                </button>
                {/* Resolved */}
                <button type="button" 
                  onClick={() => setTicketFilterStatus('RESOLVED')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'RESOLVED' ? 'bg-emerald-500/5 border-emerald-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Resolved Cases</span>
                  <h4 className="text-2xl font-bold text-emerald-400 mt-1.5">{tickets.filter(t => t.status === 'RESOLVED').length} Tickets</h4>
                </button>
              </div>

              {/* Splitscreen Ticket Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Tickets list (Span 7) */}
                <div className="lg:col-span-7">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Support Desk Tickets</h3>
                      
                      {/* Ticket Type filter dropdown */}
                      <select
                        aria-label="Ticket type filter"
                        value={ticketFilterType}
                        onChange={(e) => setTicketFilterType(e.target.value as any)}
                        className="bg-[#0e0e0d] border border-white/10 hover:border-white/20 text-[#e5e2e1] text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer focus:outline-none"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing">Billing Inquiry</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-4 font-sans text-xs max-h-[500px] overflow-y-auto pr-1">
                      {tickets
                        .filter(t => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                        .filter(t => ticketFilterType === 'ALL' || t.inquiryType === ticketFilterType)
                        .map(t => {
                          const isSelected = selectedTicket && selectedTicket.id === t.id;
                          return (
                            <div 
                              key={t.id}
                              onClick={() => {
                                setSelectedTicket(t);
                                setTicketReplyText(t.replyMessage || '');
                              }}
                              className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-start gap-4 ${
                                isSelected 
                                  ? 'bg-[#ffe2ab]/5 border-[#ffe2ab]/30 shadow-md scale-[1.01]' 
                                  : 'bg-[#0e0e0d]/50 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                                    t.inquiryType === 'Technical Support' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    t.inquiryType === 'Billing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  }`}>
                                    {t.inquiryType}
                                  </span>
                                  <span className="text-[10px] text-[#A69984]/50 font-bold">{new Date(t.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-white font-serif font-bold text-[13.5px]">{t.establishment}</h4>
                                <p className="text-[#A69984]/80 text-[11px] leading-relaxed line-clamp-2">{t.message}</p>
                                <span className="text-[10px] text-[#A69984]/55 block font-medium">Contact: {t.name}</span>
                              </div>

                              <div className="flex flex-col items-end gap-3 justify-between h-full min-h-[70px]">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest select-none ${
                                  t.status === 'OPEN' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]' :
                                  t.status === 'IN_PROGRESS' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {t.status.replace('_', ' ')}
                                </span>

                                <button type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTicketDelete(t.id);
                                  }}
                                  className="text-[9px] text-[#A69984]/40 hover:text-rose-400 uppercase font-bold tracking-widest transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {tickets
                        .filter(t => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                        .filter(t => ticketFilterType === 'ALL' || t.inquiryType === ticketFilterType)
                        .length === 0 && (
                        <div className="text-center py-20 text-[#A69984]/30 select-none border border-dashed border-white/5 rounded-2xl">
                          No support inquiries found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Ticket details pane (Span 5) */}
                <div className="lg:col-span-5">
                  {selectedTicket ? (
                    <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 animate-fade-in duration-200`}>
                      <div className="pb-4 border-b border-white/5 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest font-sans">Ticket: {selectedTicket.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                            selectedTicket.status === 'OPEN' ? 'bg-rose-500/10 text-rose-400' :
                            selectedTicket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                        <h3 className="font-serif text-[18px] font-bold text-white leading-tight">{selectedTicket.establishment}</h3>
                        <p className="text-[11px] text-[#A69984]/60 font-semibold">{selectedTicket.name} • {selectedTicket.email}</p>
                      </div>

                      {/* Ticket inquiry detail */}
                      <div className="bg-[#0e0e0d]/80 border border-white/5 rounded-xl p-5 text-xs font-sans space-y-3">
                        <div className="font-bold text-[9.5px] text-[#ffe2ab]/70 uppercase tracking-widest">Inquiry Message:</div>
                        <p className="text-white/90 leading-relaxed font-medium select-text">{selectedTicket.message}</p>
                      </div>

                      {/* Reply form */}
                      <div className="space-y-4 font-sans text-xs">
                        {selectedTicket.replyMessage ? (
                          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-1.5 font-bold text-[9.5px] text-emerald-400 uppercase tracking-widest">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Resolved Reply:
                            </div>
                            <p className="text-[#A69984] leading-relaxed font-semibold italic">"{selectedTicket.replyMessage}"</p>
                          </div>
                        ) : (
                          <form onSubmit={handleTicketReply} className="space-y-2.5">
                            <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider">Reply & Resolve Message</label>
                            <textarea
                              rows={4}
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              placeholder="Type response and instructions to resolve the ticket..."
                              className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40 resize-none placeholder-white/20 font-medium"
                            />
                            
                            <div className="flex gap-3 pt-2">
                              {selectedTicket.status !== 'IN_PROGRESS' && (
                                <button type="button"
                                  onClick={() => handleTicketStatusChange(selectedTicket.id, 'IN_PROGRESS')}
                                  className="px-4 py-3 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                >
                                  Investigate
                                </button>
                              )}
                              <button type="submit"
                                className="flex-grow py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center shadow-md"
                              >
                                Send Response & Resolve
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="h-full min-h-[300px] border border-dashed border-white/5 rounded-2xl flex flex-col justify-center items-center text-center p-8 select-none text-[#A69984]/30">
                      <span className="material-symbols-outlined text-3xl mb-3">inbox</span>
                      <p className="font-serif text-sm">No ticket selected</p>
                      <p className="font-sans text-[11px] mt-1">Select an active ticket from the directory list on the left to resolve.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}


          {/* TAB: PROMO CODES */}
          {activeTab === 'promocodes' && (() => {
            const filteredPromos = promoCodes.filter(p => {
              const matchesSearch = p.code.toLowerCase().includes(promoSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(promoSearchQuery.toLowerCase());
              const matchesStatus = promoFilterStatus === 'all' || p.status === promoFilterStatus;
              return matchesSearch && matchesStatus;
            });
            const totalRedemptions = promoCodes.reduce((s, p) => s + p.currentUses, 0);
            const activeCount = promoCodes.filter(p => p.status === 'active').length;
            const totalDiscountGiven = promoCodes.reduce((s, p) => s + p.usageLog.reduce((ls, u) => ls + u.discountAmount, 0), 0);
            return (
              <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">Promo Codes</h1>
                    <p className="font-sans text-[12.5px] text-[#A69984]/65 font-semibold mt-2">Create and manage subscription discount codes for your SaaS plans.</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleExportPromoCodes}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold uppercase tracking-wider ${theme.textMuted} hover:text-white transition-all`}>
                      <span className="material-symbols-outlined text-sm">download</span>Export CSV
                    </button>
                    <button type="button" onClick={() => setShowCreatePromoModal(true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider ${theme.accentHoverBg} transition-all shadow-lg`}>
                      <span className="material-symbols-outlined text-sm">add</span>Create Code
                    </button>
                  </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Codes', value: promoCodes.length, icon: 'local_offer', color: 'text-amber-400' },
                    { label: 'Active Codes', value: activeCount, icon: 'check_circle', color: 'text-emerald-400' },
                    { label: 'Total Redemptions', value: totalRedemptions, icon: 'redeem', color: 'text-sky-400' },
                    { label: 'Total Discount Given', value: `$${totalDiscountGiven.toFixed(0)}`, icon: 'savings', color: 'text-violet-400' },
                  ].map(kpi => (
                    <div key={kpi.label} className={`${theme.cardBg} border rounded-2xl p-5 flex items-center gap-4`}>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <span className={`material-symbols-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
                      </div>
                      <div>
                        <div className="font-sans text-[10px] text-[#A69984]/60 uppercase tracking-widest font-bold">{kpi.label}</div>
                        <div className="font-serif text-2xl text-white font-bold mt-0.5">{kpi.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filter / Search Bar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-grow max-w-xs">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#A69984]/40">search</span>
                    <input type="text" placeholder="Search code or description..."
                      value={promoSearchQuery} onChange={e => setPromoSearchQuery(e.target.value)}
                      className={`w-full bg-[#161513]/40 border ${theme.border} rounded-xl pl-9 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`} />
                  </div>
                  <select aria-label="Filter by status"
                    value={promoFilterStatus} onChange={e => setPromoFilterStatus(e.target.value as typeof promoFilterStatus)}
                    className={`bg-[#161513] border ${theme.border} rounded-xl px-4 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-white/20 font-bold uppercase tracking-wider`}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                  <div className="text-xs text-[#A69984]/50 font-bold">{filteredPromos.length} of {promoCodes.length}</div>
                </div>

                {/* Promo Codes Table */}
                <div className={`${theme.cardBg} border rounded-2xl overflow-hidden`}>
                  {/* Table header */}
                  <div className="grid grid-cols-[2fr_3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                    {['Code', 'Description', 'Discount', 'Plan', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                      <div key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50">{h}</div>
                    ))}
                  </div>
                  {filteredPromos.length === 0 ? (
                    <div className="py-16 text-center">
                      <span className="material-symbols-outlined text-4xl text-[#A69984]/20 block mb-3">local_offer</span>
                      <p className="text-[#A69984]/50 text-sm font-bold">No promo codes match your filter.</p>
                    </div>
                  ) : (
                    filteredPromos.map(promo => {
                      const isExpiredByDate = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                      const isMaxedOut = promo.maxUses !== null && promo.currentUses >= promo.maxUses;
                      const displayStatus = (isExpiredByDate || isMaxedOut) ? 'expired' : promo.status;
                      const usagePct = promo.maxUses ? Math.min(100, (promo.currentUses / promo.maxUses) * 100) : 0;
                      return (
                        <div key={promo.id} className={`grid grid-cols-[2fr_3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.015] transition-colors items-center`}>
                          {/* Code */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm tracking-widest">{promo.code}</span>
                          </div>
                          {/* Description */}
                          <div className="text-xs text-[#A69984]/70 font-medium leading-snug line-clamp-2">{promo.description}</div>
                          {/* Discount */}
                          <div>
                            <span className="font-bold text-sm text-white">
                              {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                            </span>
                            <div className="text-[10px] text-[#A69984]/50 font-bold mt-0.5 capitalize">{promo.discountType}</div>
                          </div>
                          {/* Plan */}
                          <div className="text-xs text-[#A69984]/70 font-semibold">
                            {promo.applicablePlan === 'all' ? <span className="text-sky-400">All Plans</span> : (saasPlans.find(s => s.id === promo.applicablePlan)?.name || promo.applicablePlan)}
                          </div>
                          {/* Uses */}
                          <div>
                            <div className="text-xs font-bold text-white">{promo.currentUses}{promo.maxUses ? ` / ${promo.maxUses}` : ' / ∞'}</div>
                            {promo.maxUses && (
                              <div className="w-full bg-white/5 rounded-full h-1 mt-1.5">
                                <div className={`h-1 rounded-full ${isMaxedOut ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${usagePct}%` }} />
                              </div>
                            )}
                          </div>
                          {/* Expires */}
                          <div className="text-xs text-[#A69984]/60 font-medium">
                            {promo.expiresAt ? (
                              <span className={isExpiredByDate ? 'text-rose-400' : 'text-[#A69984]/60'}>{promo.expiresAt}</span>
                            ) : <span className="text-emerald-400/70">No Expiry</span>}
                          </div>
                          {/* Status badge */}
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              displayStatus === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              displayStatus === 'inactive' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              'bg-white/5 border-white/10 text-[#A69984]/50'
                            }`}>{displayStatus}</span>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => { setSelectedPromoCode(promo); setShowPromoDetailModal(true); }}
                              title="View usage details"
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-sm text-[#A69984]/70">visibility</span>
                            </button>
                            {displayStatus !== 'expired' && (
                              <button type="button" onClick={() => handleTogglePromoStatus(promo.id)}
                                title={promo.status === 'active' ? 'Deactivate' : 'Activate'}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${promo.status === 'active' ? 'bg-rose-500/10 hover:bg-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20'}`}>
                                <span className={`material-symbols-outlined text-sm ${promo.status === 'active' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {promo.status === 'active' ? 'pause' : 'play_arrow'}
                                </span>
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeletePromoCode(promo.id, promo.code)}
                              title="Delete permanently"
                              className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-sm text-rose-400">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Empty state CTA */}
                {promoCodes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl text-amber-400">local_offer</span>
                    </div>
                    <h3 className="font-serif text-xl text-white mb-2">No promo codes yet</h3>
                    <p className="text-[#A69984]/60 text-sm mb-6">Create your first discount code to attract new restaurant subscribers.</p>
                    <button type="button" onClick={() => setShowCreatePromoModal(true)}
                      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider ${theme.accentHoverBg} transition-all shadow-lg`}>
                      <span className="material-symbols-outlined text-sm">add</span>Create First Code
                    </button>
                  </div>
                )}

                {/* CREATE PROMO CODE MODAL */}
                {showCreatePromoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className={`${theme.cardBgOpaque} border rounded-2xl w-full max-w-lg shadow-2xl`}>
                      <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div>
                          <h3 className="font-serif text-xl text-white font-bold">Create Promo Code</h3>
                          <p className="text-[11px] text-[#A69984]/60 font-medium mt-0.5">New discount code for subscription plans</p>
                        </div>
                        <button type="button" onClick={() => setShowCreatePromoModal(false)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-sm text-[#A69984]/60">close</span>
                        </button>
                      </div>
                      <form onSubmit={handleCreatePromoCode} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                        {/* Code */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Promo Code *</label>
                          <div className="flex gap-2">
                            <input type="text" required aria-label="Promo code" placeholder="e.g. SAVE30, LAUNCH50"
                              value={newPromoData.code}
                              onChange={e => setNewPromoData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                              className={`flex-grow bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                            <button type="button" onClick={() => setNewPromoData(p => ({ ...p, code: generatePromoCode() }))}
                              className={`px-4 py-3 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold text-[#A69984]/60 hover:text-white transition-all whitespace-nowrap`}>
                              Auto-Generate
                            </button>
                          </div>
                        </div>
                        {/* Description */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Description *</label>
                          <input type="text" required aria-label="Promo code description" placeholder="Brief purpose of this promo code"
                            value={newPromoData.description}
                            onChange={e => setNewPromoData(p => ({ ...p, description: e.target.value }))}
                            className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                        </div>
                        {/* Discount type + value */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Discount Type *</label>
                            <select aria-label="Discount type" value={newPromoData.discountType}
                              onChange={e => setNewPromoData(p => ({ ...p, discountType: e.target.value as 'percentage' | 'flat' }))}
                              className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50`}>
                              <option value="percentage">Percentage (%)</option>
                              <option value="flat">Flat Amount ($)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">
                              {newPromoData.discountType === 'percentage' ? 'Percent Off *' : 'Flat Discount ($) *'}
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-3 text-xs text-[#A69984]/50 font-bold">
                                {newPromoData.discountType === 'percentage' ? '%' : '$'}
                              </span>
                              <input type="number" required min="1" max={newPromoData.discountType === 'percentage' ? '100' : undefined}
                                step="0.01" aria-label="Discount value" placeholder={newPromoData.discountType === 'percentage' ? '0–100' : 'e.g. 100'}
                                value={newPromoData.discountValue}
                                onChange={e => setNewPromoData(p => ({ ...p, discountValue: e.target.value }))}
                                className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl pl-8 pr-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                            </div>
                          </div>
                        </div>
                        {/* Applicable Plan */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Applicable Plan</label>
                          <select aria-label="Applicable plan" value={newPromoData.applicablePlan}
                            onChange={e => setNewPromoData(p => ({ ...p, applicablePlan: e.target.value }))}
                            className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50`}>
                            <option value="all">All Plans</option>
                            {saasPlans.map(plan => (
                              <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Max Uses + Expiry */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Max Uses (blank = unlimited)</label>
                            <input type="number" min="1" aria-label="Maximum number of uses" placeholder="e.g. 100"
                              value={newPromoData.maxUses}
                              onChange={e => setNewPromoData(p => ({ ...p, maxUses: e.target.value }))}
                              className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/20`} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A69984]/60 mb-2">Expiry Date (blank = no expiry)</label>
                            <input type="date" aria-label="Expiry date"
                              value={newPromoData.expiresAt}
                              onChange={e => setNewPromoData(p => ({ ...p, expiresAt: e.target.value }))}
                              className={`w-full bg-[#0e0e0d] border ${theme.border} rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50`} />
                          </div>
                        </div>
                        {/* Preview */}
                        {newPromoData.code && newPromoData.discountValue && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2">Preview</div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-black text-amber-400 text-lg tracking-widest">{newPromoData.code || '—'}</span>
                              <span className="text-[#A69984]/60 text-xs">—</span>
                              <span className="text-white text-sm font-bold">
                                {newPromoData.discountType === 'percentage' ? `${newPromoData.discountValue}% off` : `$${newPromoData.discountValue} off`}
                              </span>
                              <span className="text-[#A69984]/40 text-xs">
                                {newPromoData.applicablePlan === 'all' ? 'all plans' : (saasPlans.find(s => s.id === newPromoData.applicablePlan)?.name || '')}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setShowCreatePromoModal(false)}
                            className={`flex-1 px-4 py-3 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold text-[#A69984]/60 hover:text-white transition-all`}>
                            Cancel
                          </button>
                          <button type="submit"
                            className={`flex-1 px-4 py-3 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider ${theme.accentHoverBg} transition-all`}>
                            Create Promo Code
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* PROMO CODE DETAIL / USAGE MODAL */}
                {showPromoDetailModal && selectedPromoCode && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className={`${theme.cardBgOpaque} border rounded-2xl w-full max-w-2xl shadow-2xl`}>
                      <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400 text-xl">local_offer</span>
                          </div>
                          <div>
                            <h3 className="font-mono font-black text-amber-400 text-xl tracking-widest">{selectedPromoCode.code}</h3>
                            <p className="text-xs text-[#A69984]/60 font-medium mt-0.5">{selectedPromoCode.description}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setShowPromoDetailModal(false)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-sm text-[#A69984]/60">close</span>
                        </button>
                      </div>
                      <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                        {/* Code stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Discount', value: selectedPromoCode.discountType === 'percentage' ? `${selectedPromoCode.discountValue}%` : `$${selectedPromoCode.discountValue}`, sub: selectedPromoCode.discountType },
                            { label: 'Uses', value: `${selectedPromoCode.currentUses}${selectedPromoCode.maxUses ? ` / ${selectedPromoCode.maxUses}` : ' / ∞'}`, sub: 'redemptions' },
                            { label: 'Expires', value: selectedPromoCode.expiresAt ?? 'Never', sub: selectedPromoCode.expiresAt ? (new Date(selectedPromoCode.expiresAt) < new Date() ? 'expired' : 'upcoming') : 'no expiry' },
                            { label: 'Status', value: selectedPromoCode.status.charAt(0).toUpperCase() + selectedPromoCode.status.slice(1), sub: `created ${selectedPromoCode.createdAt}` },
                          ].map(s => (
                            <div key={s.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50 mb-1">{s.label}</div>
                              <div className="font-bold text-white text-base">{s.value}</div>
                              <div className="text-[10px] text-[#A69984]/40 mt-0.5 capitalize">{s.sub}</div>
                            </div>
                          ))}
                        </div>
                        {/* Applicable plan */}
                        <div className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                          <span className="material-symbols-outlined text-sky-400 text-lg">inventory_2</span>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/50">Applicable Plan</div>
                            <div className="text-sm font-bold text-white mt-0.5">
                              {selectedPromoCode.applicablePlan === 'all' ? 'All Plans' : (saasPlans.find(s => s.id === selectedPromoCode.applicablePlan)?.name || selectedPromoCode.applicablePlan)}
                            </div>
                          </div>
                        </div>
                        {/* Usage log */}
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#A69984]/50 mb-3">Usage Log ({selectedPromoCode.usageLog.length})</h4>
                          {selectedPromoCode.usageLog.length === 0 ? (
                            <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
                              <span className="material-symbols-outlined text-2xl text-[#A69984]/20 block mb-2">history</span>
                              <p className="text-xs text-[#A69984]/40 font-bold">No redemptions recorded yet.</p>
                            </div>
                          ) : (
                            <div className={`${theme.cardBg} border rounded-xl overflow-hidden`}>
                              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5">
                                {['Tenant', 'Plan Used', 'Used On', 'Saved'].map(h => (
                                  <div key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A69984]/40">{h}</div>
                                ))}
                              </div>
                              {selectedPromoCode.usageLog.map((u, i) => (
                                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/5 last:border-0 items-center">
                                  <div className="text-xs font-bold text-white">{u.tenantName}</div>
                                  <div className="text-xs text-[#A69984]/60">{saasPlans.find(s => s.id === u.planId)?.name || u.planId}</div>
                                  <div className="text-xs text-[#A69984]/60">{u.usedAt}</div>
                                  <div className="text-xs font-bold text-emerald-400">${u.discountAmount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t border-white/5">
                          {selectedPromoCode.status !== 'expired' && (
                            <button type="button"
                              onClick={() => { handleTogglePromoStatus(selectedPromoCode.id); setShowPromoDetailModal(false); }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                                selectedPromoCode.status === 'active'
                                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              }`}>
                              <span className="material-symbols-outlined text-sm">{selectedPromoCode.status === 'active' ? 'pause' : 'play_arrow'}</span>
                              {selectedPromoCode.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          <button type="button"
                            onClick={() => { handleDeletePromoCode(selectedPromoCode.id, selectedPromoCode.code); setShowPromoDetailModal(false); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold uppercase tracking-wider transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>Delete Code
                          </button>
                          <button type="button" onClick={() => setShowPromoDetailModal(false)}
                            className={`ml-auto px-4 py-2.5 rounded-xl border ${theme.border} hover:border-white/20 text-xs font-bold text-[#A69984]/60 hover:text-white transition-all`}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>

      </div>

      {/* MODAL: ADD NEW AMBASSADOR */}
      {showAddAmbassadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[560px] rounded-2xl shadow-2xl relative font-sans max-h-[92vh] flex flex-col">

            {/* Sticky header */}
            <div className="p-8 pb-4 flex-shrink-0">
              <button type="button"
                onClick={() => { setShowAddAmbassadorModal(false); setNewAmbassadorData({ name: '', email: '', phone: '', code: '', bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' }); }}
                className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#ffc53d] text-xl">person_add</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-wide">Register Ambassador</h2>
              <p className="text-[11px] text-[#A69984]/60 font-semibold mt-1.5">
                Add a new partner to the referral program. Bank details are required for payout processing.
              </p>
            </div>

            <form onSubmit={handleAddAmbassador} className="overflow-y-auto px-8 pb-8 space-y-5 flex-1">

              {/* Personal Info */}
              <div>
                <div className="text-[9.5px] text-[#ffe2ab]/60 font-bold uppercase tracking-widest border-l-2 border-[#ffc53d]/40 pl-2.5 mb-3">Partner Details</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
                      <input type="text" required placeholder="e.g. Sarah Johnson"
                        value={newAmbassadorData.name}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input type="tel" placeholder="+1 555 000 0000"
                        value={newAmbassadorData.phone}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Email Address *</label>
                    <input type="email" required placeholder="e.g. sarah@restaurant.com"
                      value={newAmbassadorData.email}
                      onChange={e => setNewAmbassadorData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Referral Code (auto-generated if blank)</label>
                    <div className="flex gap-2">
                      <input type="text"
                        placeholder={newAmbassadorData.name ? generateReferralCode(newAmbassadorData.name) : 'e.g. SARAH421'}
                        value={newAmbassadorData.code}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                        className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 uppercase"
                      />
                      <button type="button"
                        onClick={() => setNewAmbassadorData(prev => ({ ...prev, code: generateReferralCode(prev.name || 'AMB') }))}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#ffe2ab] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">shuffle</span>
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Bank Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[9.5px] text-[#ffe2ab]/60 font-bold uppercase tracking-widest border-l-2 border-[#ffc53d]/40 pl-2.5">Payout Bank Details</div>
                  <span className="text-[9px] text-[#A69984]/40 font-medium">Required for payout processing</span>
                </div>
                <div className="bg-[#0e0e0d]/60 border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Bank Name</label>
                      <input type="text" placeholder="e.g. JPMorgan Chase"
                        value={newAmbassadorData.bankName}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Account Holder Name</label>
                      <input type="text" placeholder="e.g. Sarah Johnson LLC"
                        value={newAmbassadorData.accountHolder}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, accountHolder: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Account Number / IBAN</label>
                      <input type="text" placeholder="Full account number"
                        value={newAmbassadorData.accountNumber}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#A69984]/55 font-bold uppercase tracking-widest mb-1.5">Routing / SWIFT / BIC</label>
                      <input type="text" placeholder="e.g. 021000021"
                        value={newAmbassadorData.routingNumber}
                        onChange={e => setNewAmbassadorData(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full bg-[#12110f] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/40 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-[#A69984]/35 font-medium leading-relaxed">
                    Account numbers are masked before storage. Bank details can be edited later from the ambassador's profile card.
                  </p>
                </div>
              </div>

              {/* Reward preview */}
              <div className="bg-[#ffc53d]/5 border border-[#ffc53d]/15 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#ffc53d] text-base flex-shrink-0 mt-0.5">info</span>
                <p className="text-[10px] text-[#ffe2ab]/80 font-semibold leading-relaxed">
                  This ambassador will earn <strong className="text-[#ffc53d]">${referralConfig.rewardPerSignup}</strong> per signup + <strong className="text-[#ffc53d]">{referralConfig.commissionRate}%</strong> commission on first payment. Min payout threshold: <strong className="text-[#ffc53d]">${referralConfig.minPayoutThreshold}</strong>.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setShowAddAmbassadorModal(false); setNewAmbassadorData({ name: '', email: '', phone: '', code: '', bankName: '', accountHolder: '', accountNumber: '', routingNumber: '' }); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Register Ambassador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AMBASSADOR BANK DETAILS */}
      {showEditBankModal && editBankTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowEditBankModal(false); setEditBankTarget(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-emerald-400 text-xl">account_balance</span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">Edit Bank Details</h2>
                <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-0.5">
                  Ambassador: <span className="text-white">{editBankTarget.name}</span>
                </p>
              </div>
            </div>

            <div className="mb-5 flex items-start gap-3 bg-sky-500/8 border border-sky-500/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-sky-400 text-base flex-shrink-0 mt-0.5">lock</span>
              <p className="text-sky-300 text-[10px] font-medium leading-relaxed">
                Bank details are masked on save. Account numbers show only the last 4 digits. All changes are logged in the audit trail.
              </p>
            </div>

            <form onSubmit={handleSaveEditBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Bank Name *</label>
                  <input type="text" required placeholder="e.g. JPMorgan Chase"
                    value={editBankData.bankName}
                    onChange={e => setEditBankData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Account Holder *</label>
                  <input type="text" required placeholder="Legal account holder name"
                    value={editBankData.accountHolder}
                    onChange={e => setEditBankData(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">
                  Account Number / IBAN
                  {editBankTarget.bank.accountNumber && (
                    <span className="ml-2 text-[#A69984]/40 normal-case font-normal">
                      (current: {editBankTarget.bank.accountNumber})
                    </span>
                  )}
                </label>
                <input type="text" placeholder="Leave blank to keep existing number"
                  value={editBankData.accountNumber}
                  onChange={e => setEditBankData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
                <p className="text-[9px] text-[#A69984]/35 mt-1 font-medium">Will be masked on save — only last 4 digits stored visibly.</p>
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Routing Number / SWIFT / BIC *</label>
                <input type="text" required placeholder="e.g. 021000021 or CHASUS33"
                  value={editBankData.routingNumber}
                  onChange={e => setEditBankData(prev => ({ ...prev, routingNumber: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowEditBankModal(false); setEditBankTarget(null); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR POSTER */}
      {showQrModal && qrModalAmbassador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[440px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowQrModal(false); setQrModalAmbassador(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="text-center mb-6">
              <h2 className="font-serif text-xl font-bold text-white tracking-wide">Referral Poster</h2>
              <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-1">
                {qrModalAmbassador.name} · Code: <span className="text-[#ffc53d] font-mono">{qrModalAmbassador.code}</span>
              </p>
            </div>

            {/* Stylised referral card */}
            <div className="bg-gradient-to-br from-[#1a1812] to-[#0e0e0d] border border-[#ffc53d]/20 rounded-2xl p-6 text-center space-y-4 mb-6">
              <div className="flex justify-center">
                {/* QR grid placeholder (visual representation) */}
                <div className="w-28 h-28 bg-[#ffc53d]/8 border border-[#ffc53d]/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-7 gap-[2px] opacity-60">
                    {Array.from({ length: 49 }, (_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-[1px] ${Math.random() > 0.45 ? 'bg-[#ffc53d]' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#1a1812] rounded-md px-2 py-1">
                      <span className="material-symbols-outlined text-[#ffc53d] text-base">qr_code_2</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-1">Referral Code</div>
                <div className="font-mono font-black text-[#ffc53d] text-2xl tracking-[0.15em]">{qrModalAmbassador.code}</div>
              </div>
              <div className="bg-[#0e0e0d]/70 border border-white/[0.06] rounded-xl p-3">
                <div className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-widest mb-1">Sign-Up Link</div>
                <div className="text-[10px] text-[#A69984]/70 font-mono break-all">{referralConfig.referralBaseUrl}{qrModalAmbassador.code}</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button type="button"
                onClick={() => {
                  const link = `${referralConfig.referralBaseUrl}${qrModalAmbassador.code}`;
                  navigator.clipboard?.writeText(link);
                  triggerToast('Referral link copied to clipboard!', 'success');
                }}
                className="w-full py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy Referral Link
              </button>
              <button type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(qrModalAmbassador.code);
                  triggerToast(`Code ${qrModalAmbassador.code} copied!`, 'success');
                }}
                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">tag</span>
                Copy Code Only
              </button>
              <button type="button"
                onClick={() => { window.print(); }}
                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Poster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PARTNER DASHBOARD PREVIEW */}
      {showPartnerViewModal && partnerViewAmbassador && (() => {
        const amb = partnerViewAmbassador;
        const totalEarned = amb.paidRewards + amb.pendingRewards;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in duration-300">
            <div className="bg-[#0e0e0d] border border-white/10 w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col max-h-[94vh]">

              {/* Modal chrome */}
              <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 flex-shrink-0 bg-[#161513]/80 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ffc53d] text-sm">preview</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#ffc53d]/70 font-bold uppercase tracking-widest">Super Admin Preview</p>
                    <p className="text-white font-bold text-sm leading-tight">Partner Dashboard — {amb.name}</p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { setShowPartnerViewModal(false); setPartnerViewAmbassador(null); }}
                  className="text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Scrollable dashboard content */}
              <div className="overflow-y-auto flex-1 p-8 space-y-7 font-sans">

                {/* Dashboard header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">Partner Dashboard</h1>
                    <p className="text-[11.5px] text-[#A69984]/60 font-semibold mt-2">
                      Ambassador Account: <span className="text-[#A69984]/90">{amb.name}</span> • Joined {amb.joinedDate}
                    </p>
                  </div>
                  <button type="button" disabled
                    className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.08] text-[#A69984]/35 rounded-xl font-bold text-[10.5px] uppercase tracking-widest cursor-not-allowed select-none"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left + Middle (2/3) */}
                  <div className="lg:col-span-2 space-y-5">

                    {/* Ambassador Code Card */}
                    <div className="bg-[#161513] border border-[#ffc53d]/20 rounded-2xl p-6">
                      <div className="mb-3">
                        <span className="px-2.5 py-1 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] text-[8.5px] font-black uppercase tracking-widest rounded-lg">Your Ambassador Code</span>
                      </div>
                      <p className="font-mono font-black text-[#ffc53d] text-4xl tracking-[0.12em] mb-2">{amb.code}</p>
                      <p className="text-[#A69984]/60 text-xs font-medium mb-5 leading-relaxed max-w-sm">
                        Share this code or copy your link to onboard new venues. Rewards accrue automatically when they complete registration.
                      </p>
                      <button type="button"
                        onClick={() => { navigator.clipboard?.writeText(`${referralConfig.referralBaseUrl}${amb.code}`); triggerToast('Referral link copied to clipboard!', 'success'); }}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        Copy Referral Link
                      </button>
                    </div>

                    {/* KPI Row */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Total Earned', value: `$${totalEarned.toLocaleString()}`, sub: 'Historical Accruals', icon: 'trending_up', valueColor: 'text-[#ffc53d]', iconColor: 'text-emerald-400' },
                        { label: 'Paid Out', value: `$${amb.paidRewards.toLocaleString()}`, sub: 'Transferred to Bank', icon: 'check_circle', valueColor: 'text-white', iconColor: 'text-[#A69984]/40' },
                        { label: 'Pending Balance', value: `$${amb.pendingRewards.toLocaleString()}`, sub: 'Awaiting Admin Payout', icon: 'circle', valueColor: 'text-[#ffc53d]', iconColor: 'text-[#ffc53d]' },
                      ].map(kpi => (
                        <div key={kpi.label} className="bg-[#161513] border border-white/5 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-widest">{kpi.label}</span>
                            <span className={`material-symbols-outlined text-base ${kpi.iconColor}`}>{kpi.icon}</span>
                          </div>
                          <p className={`font-serif text-2xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                          <p className="text-[8.5px] text-[#A69984]/40 font-bold uppercase tracking-widest mt-1">{kpi.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Invited Businesses Table */}
                    <div className="bg-[#161513] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-sm">Invited Businesses</h3>
                          <p className="text-[10px] text-[#A69984]/50 font-semibold mt-0.5">Real-time status of restaurants referred by your ambassador link.</p>
                        </div>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-[#A69984]/65 font-bold">{amb.invitedBusinesses.length} Referrals</span>
                      </div>
                      {amb.invitedBusinesses.length === 0 ? (
                        <div className="py-12 text-center">
                          <span className="material-symbols-outlined text-4xl text-[#A69984]/15 block">storefront</span>
                          <p className="text-[#A69984]/40 text-xs font-medium mt-3">No businesses referred yet. Share your code to get started.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5 text-[8.5px] text-[#A69984]/45 font-bold uppercase tracking-widest">
                                <th className="text-left px-6 py-3">Establishment</th>
                                <th className="text-left px-4 py-3">Onboarded</th>
                                <th className="text-left px-4 py-3">Active Services</th>
                                <th className="text-center px-4 py-3">Status</th>
                                <th className="text-right px-6 py-3">Earned Reward</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                              {amb.invitedBusinesses.map(biz => (
                                <tr key={biz.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="text-white font-bold text-xs">{biz.name}</p>
                                    <p className="text-[#A69984]/40 text-[9.5px] mt-0.5 uppercase tracking-wider font-bold">Contact: {biz.contact}</p>
                                  </td>
                                  <td className="px-4 py-4 text-[#A69984]/60 text-xs font-semibold">{biz.joinedDate}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {biz.services.map((svc, si) => (
                                        <span key={si} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.07] rounded text-[8.5px] text-[#A69984]/65 font-bold uppercase tracking-wider">{svc}</span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[8.5px] font-bold uppercase tracking-wider border ${
                                      biz.status === 'Active' || biz.status === 'Subscribed'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>{biz.status}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <span className={`font-bold text-sm font-mono ${biz.reward > 0 ? 'text-[#ffc53d]' : 'text-[#A69984]/35'}`}>${biz.reward}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column — Bank + Policies */}
                  <div className="space-y-5">

                    {/* Bank Account Card */}
                    <div className="bg-[#161513] border border-white/5 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold text-sm">Payout Bank Account</h3>
                        <button type="button"
                          onClick={() => { setShowPartnerViewModal(false); setPartnerViewAmbassador(null); handleOpenEditBank(amb); }}
                          className="text-[9.5px] text-[#ffe2ab]/60 hover:text-[#ffc53d] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Edit Details
                        </button>
                      </div>
                      {amb.bank.bankName ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Bank Name</p>
                            <p className="text-white font-bold text-xs">{amb.bank.bankName}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Account Holder</p>
                            <p className="text-white font-bold text-xs">{amb.bank.accountHolder}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Account Number</p>
                              <p className="text-[#A69984]/70 font-mono text-xs">{amb.bank.accountNumber || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-[#A69984]/45 font-bold uppercase tracking-widest mb-0.5">Routing Code</p>
                              <p className="text-[#A69984]/70 font-mono text-xs">{amb.bank.routingNumber || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/12 rounded-xl p-3.5">
                            <span className="material-symbols-outlined text-amber-500/60 text-sm flex-shrink-0 mt-0.5">shield</span>
                            <p className="text-[#A69984]/50 text-[9px] font-medium leading-relaxed">
                              Bank payout coordinates are on file. Reward transfers are processed by the platform administrator within 3 business days of approval.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <span className="material-symbols-outlined text-4xl text-[#A69984]/15 block">account_balance</span>
                          <p className="text-[#A69984]/40 text-xs font-semibold mt-3">No bank details on file.</p>
                          <button type="button"
                            onClick={() => { setShowPartnerViewModal(false); setPartnerViewAmbassador(null); handleOpenEditBank(amb); }}
                            className="mt-3 px-4 py-2 bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-sky-500/15 transition-colors cursor-pointer"
                          >
                            Add Bank Details
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payout Policies Card */}
                    <div className="bg-[#161513] border border-white/5 rounded-2xl p-6">
                      <h3 className="text-white font-bold text-sm mb-5">Referral Payout Policies</h3>
                      <ul className="space-y-3.5">
                        {[
                          `Rewards accumulate when a referred merchant completes their registration using your code.`,
                          <>Flat reward per signup: <span className="text-[#ffc53d] font-bold">${referralConfig.rewardPerSignup}</span> per establishment.</>,
                          <>Commission on first payment: <span className="text-[#ffc53d] font-bold">{referralConfig.commissionRate}%</span> of the referred tenant&apos;s first subscription charge.</>,
                          <>Minimum payout threshold: <span className="text-[#ffc53d] font-bold">${referralConfig.minPayoutThreshold}</span>. Admin processes transfers within 3 business days.</>,
                          <>Cookie tracking window: <span className="text-[#ffc53d] font-bold">{referralConfig.cookieDuration} days</span> — referral attribution is maintained for returning visitors.</>,
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[10.5px] text-[#A69984]/60 font-medium leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-[#A69984]/40 mt-2 flex-shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: EDIT AMBASSADOR PROFILE */}
      {showEditAmbassadorModal && editAmbassadorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowEditAmbassadorModal(false); setEditAmbassadorTarget(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-violet-400 text-xl">edit</span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">Edit Ambassador</h2>
                <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-0.5">Update contact details and referral code for <span className="text-white">{editAmbassadorTarget.name}</span></p>
              </div>
            </div>

            <form onSubmit={handleEditAmbassador} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
                  <input type="text" required placeholder="Full name"
                    value={editAmbassadorData.name}
                    onChange={e => setEditAmbassadorData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Phone</label>
                  <input type="tel" placeholder="+1 555 000 0000"
                    value={editAmbassadorData.phone}
                    onChange={e => setEditAmbassadorData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Email Address *</label>
                <input type="email" required placeholder="email@example.com"
                  value={editAmbassadorData.email}
                  onChange={e => setEditAmbassadorData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>
              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Referral Code</label>
                <div className="flex gap-2">
                  <input type="text"
                    aria-label="Referral Code"
                    placeholder="e.g. MARCUS421"
                    value={editAmbassadorData.code}
                    onChange={e => setEditAmbassadorData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                    className="flex-1 bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45 uppercase"
                  />
                  <button type="button"
                    onClick={() => setEditAmbassadorData(prev => ({ ...prev, code: generateReferralCode(prev.name || editAmbassadorTarget.name) }))}
                    className="px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#ffe2ab] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">shuffle</span>
                    New
                  </button>
                </div>
                <p className="text-[9px] text-[#A69984]/35 mt-1">Changing a live code will break any existing referral links for this ambassador.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowEditAmbassadorModal(false); setEditAmbassadorTarget(null); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REFERRED BUSINESS */}
      {showAddReferralModal && addReferralTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[520px] p-8 rounded-2xl shadow-2xl relative font-sans">
            <button type="button"
              onClick={() => { setShowAddReferralModal(false); setAddReferralTarget(null); }}
              className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#ffc53d] text-xl">add_business</span>
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">Log Referred Business</h2>
                <p className="text-[10.5px] text-[#A69984]/55 font-semibold mt-0.5">
                  Manually add a referral for ambassador <span className="text-[#ffc53d] font-mono">{addReferralTarget.code}</span> — {addReferralTarget.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddReferral} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Business Name *</label>
                  <input type="text" required placeholder="e.g. Nobu Chicago"
                    value={newReferralData.name}
                    onChange={e => setNewReferralData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-1.5">Contact Email *</label>
                  <input type="email" required placeholder="owner@business.com"
                    value={newReferralData.contact}
                    onChange={e => setNewReferralData(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Current Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pending', 'Active', 'Subscribed'] as const).map(s => (
                    <button key={s} type="button"
                      onClick={() => setNewReferralData(prev => ({ ...prev, status: s }))}
                      className={`py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                        newReferralData.status === s
                          ? s === 'Subscribed' ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                            : s === 'Active' ? 'bg-sky-500/15 border-sky-500/35 text-sky-400'
                            : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#A69984]/50 hover:border-white/15'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[#A69984]/35 mt-1.5">
                  {newReferralData.status === 'Pending' ? 'No reward credited yet — ambassador earns reward upon subscription.' : newReferralData.status === 'Active' ? 'Trial in progress.' : `Ambassador will earn $${referralConfig.rewardPerSignup} reward immediately.`}
                </p>
              </div>

              <div>
                <label className="block text-[9.5px] text-[#A69984]/60 font-bold uppercase tracking-widest mb-2">Services Purchased</label>
                <div className="flex flex-wrap gap-2">
                  {['POS', 'KDS', 'Analytics', 'AI Concierge', 'Self Checkout', 'Offline Mode'].map(svc => {
                    const selected = newReferralData.services.includes(svc);
                    return (
                      <button key={svc} type="button"
                        onClick={() => setNewReferralData(prev => ({
                          ...prev,
                          services: selected ? prev.services.filter(s => s !== svc) : [...prev.services, svc]
                        }))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all cursor-pointer ${
                          selected ? 'bg-[#ffc53d]/10 border-[#ffc53d]/25 text-[#ffc53d]' : 'bg-white/[0.03] border-white/[0.08] text-[#A69984]/55 hover:border-white/15'
                        }`}
                      >
                        {selected && <span className="material-symbols-outlined text-[9px] mr-1">check</span>}
                        {svc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(newReferralData.status === 'Active' || newReferralData.status === 'Subscribed') && (
                <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-400 text-base flex-shrink-0 mt-0.5">payments</span>
                  <p className="text-emerald-300 text-[10.5px] font-semibold leading-relaxed">
                    <strong className="text-emerald-400">${referralConfig.rewardPerSignup}</strong> reward will be added to {addReferralTarget.name}&apos;s pending balance.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button"
                  onClick={() => { setShowAddReferralModal(false); setAddReferralTarget(null); }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#A69984] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">add_business</span>
                  Log Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW BUSINESS TENANT */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => setShowAddTenantModal(false)}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Register Business Tenant</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Create a new corporate sub-account for the DinePOS ecosystem.</p>
            
            <form onSubmit={handleAddTenant} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Business Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Bouchon Bakery"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Primary Location (City)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Las Vegas"
                  value={newTenantData.location}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Subscribed Plan</label>
                <select
                  aria-label="Subscribed plan"
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, plan: e.target.value as Tenant['plan'] }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="TRIAL">Trial Package</option>
                  <option value="ACTIVE">Enterprise Growth</option>
                  <option value="SUSPENDED">Suspended / Deactivated</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Subscription Expiry Date</label>
                <input 
                  type="date"
                  value={newTenantData.expiryDate}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => setShowAddTenantModal(false)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.5: TENANT DETAILS & EXPIRES MANAGEMENT */}
      {showTenantDetailsModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[520px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => { setShowTenantDetailsModal(false); setSelectedTenant(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-1">Manage Tenant Subscription</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Review metadata and adjust system access parameters for this client.</p>
            
            <form onSubmit={handleSaveTenantExpiry} className="space-y-5">
              {/* Profile Card Summary & Configuration */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <div className="text-white font-bold text-sm">{selectedTenant.name}</div>
                    <div className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider mt-0.5">ID: {selectedTenant.id} · Joined: {selectedTenant.joined}</div>
                  </div>
                  <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedTenant.status === 'ACTIVE' ? theme.tagActive : theme.tagSuspended
                  }`}>
                    {selectedTenant.status}
                  </span>
                </div>
                
                {/* Editable Fields */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Subscription Tier</label>
                    <div className="relative">
                      <select
                        aria-label="Subscription Tier"
                        value={selectedTenant.tier || 'Starter'}
                        onChange={(e) => setSelectedTenant(prev => prev ? { ...prev, tier: e.target.value } : null)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Growth">Growth</option>
                        <option value="Business">Business</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Deployment Region</label>
                    <div className="relative">
                      <select
                        aria-label="Region"
                        value={selectedTenant.region || 'North America - East'}
                        onChange={(e) => setSelectedTenant(prev => prev ? { ...prev, region: e.target.value } : null)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="North America - East">NA - East</option>
                        <option value="Europe - West">EU - West</option>
                        <option value="Asia Pacific">Asia Pacific</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Platform Revenue</label>
                    <div className="w-full bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs text-[#ffc53d] font-bold select-none font-mono">
                      {selectedTenant.revenue}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A69984]/60 text-[9.5px] font-bold uppercase tracking-wider mb-1.5">Terminals Capacity</label>
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => setSelectedTenant(prev => prev ? { ...prev, terminals: Math.max(0, prev.terminals - 1) } : null)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white border border-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        -
                      </button>
                      <input 
                        type="text"
                        readOnly
                        value={`${selectedTenant.terminals} units`}
                        className="w-16 text-center bg-transparent text-xs text-white/90 font-semibold focus:outline-none"
                      />
                      <button type="button"
                        onClick={() => setSelectedTenant(prev => prev ? { ...prev, terminals: prev.terminals + 1 } : null)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white border border-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Alert Settlement */}
              {selectedTenant.billingFailed && (
                <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="material-symbols-outlined text-rose-400 text-base mt-0.5 flex-shrink-0">credit_card_off</span>
                    <div className="min-w-0">
                      <div className="text-rose-300 text-[11px] font-bold">Billing Failed / Suspended</div>
                      <p className="text-[10px] text-rose-400/70 font-semibold leading-normal mt-0.5 truncate">Recent transaction failed. Settle card fees.</p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => {
                      setSelectedTenant(prev => prev ? { ...prev, billingFailed: false, status: 'ACTIVE', plan: 'ACTIVE' } : null);
                      triggerToast(`Settled account billing for ${selectedTenant.name}!`, 'success');
                    }}
                    className="text-[9.5px] bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-md cursor-pointer transition-colors flex-shrink-0 ml-3"
                  >
                    Settle Fees
                  </button>
                </div>
              )}

              {/* Expiry Date Section */}
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Subscription Expiry Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    required
                    value={editingExpiryDate}
                    onChange={(e) => setEditingExpiryDate(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45 font-mono"
                  />
                </div>
                {(() => {
                  const expStatus = checkExpiryStatus(editingExpiryDate);
                  if (expStatus === 'expired') {
                    return (
                      <p className="text-[10px] text-rose-400 font-semibold mt-2 flex items-center gap-1.5 leading-none">
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">error</span>
                        This subscription is currently EXPIRED. Services are deactivated.
                      </p>
                    );
                  } else if (expStatus === 'warning') {
                    return (
                      <p className="text-[10px] text-amber-400 font-semibold mt-2 flex items-center gap-1.5 leading-none">
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">warning</span>
                        Expiring soon (less than 30 days remaining).
                      </p>
                    );
                  } else if (expStatus === 'active') {
                    return (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1.5 leading-none">
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">check_circle</span>
                        Subscription is active.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button type="button" 
                  onClick={() => { setShowTenantDetailsModal(false); setSelectedTenant(null); }}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW BUSINESS OWNER ADMIN */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button" 
              onClick={() => setShowAddAdminModal(false)}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Register Business Owner</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Create the administrative owner credentials linked to an active Tenant.</p>
            
            <form onSubmit={handleAddAdmin} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Owner Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Thomas Keller"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Work Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. keller@bouchon.com"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                />
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Linked Restaurant (Tenant)</label>
                <select
                  aria-label="Linked restaurant tenant"
                  value={newAdminData.tenant}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, tenant: e.target.value }))}
                  required
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="button" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PASSCODE RESET FORM FOR ISSUE HANDLING */}
      {/* MODAL: PROCESS REFERRAL PAYOUT */}
      {showPayoutModal && payoutTarget && (() => {
        const hasBankDetails = !!(payoutTarget.bank.bankName && payoutTarget.bank.accountHolder && payoutTarget.bank.accountNumber);
        const belowThreshold = payoutTarget.pendingRewards < referralConfig.minPayoutThreshold;
        const canPayout = hasBankDetails && !belowThreshold && payoutTarget.pendingRewards > 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in duration-300">
            <div className="bg-[#161513] border border-white/10 w-full max-w-[520px] p-8 rounded-2xl shadow-2xl relative font-sans">
              <button type="button"
                onClick={() => { setShowPayoutModal(false); setPayoutTarget(null); setPayoutAmount(''); setPayoutNote(''); }}
                className="absolute top-5 right-5 text-[#A69984]/50 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#ffc53d]/10 border border-[#ffc53d]/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#ffc53d] text-xl">payments</span>
                </div>
                <div>
                  <h3 className="font-serif text-white font-bold text-xl leading-tight">Process Payout</h3>
                  <p className="text-[10.5px] text-[#A69984]/60 font-semibold mt-0.5">
                    Ambassador: <span className="text-white">{payoutTarget.name}</span> · {payoutTarget.email}
                  </p>
                </div>
              </div>

              {/* No bank details warning */}
              {!hasBankDetails && (
                <div className="mb-5 flex items-start gap-3 bg-amber-500/8 border border-amber-500/25 rounded-xl p-4">
                  <span className="material-symbols-outlined text-amber-400 text-lg flex-shrink-0 mt-0.5">warning</span>
                  <div>
                    <p className="text-amber-300 font-bold text-xs">Bank Details Not On File</p>
                    <p className="text-[#A69984]/60 text-[10.5px] font-medium mt-1 leading-relaxed">
                      This ambassador has not provided payout bank details. Ask them to register via the <span className="text-[#ffc53d]">Partner Portal</span>, or add their bank details below before processing this payout.
                    </p>
                    <button type="button"
                      onClick={() => { setShowPayoutModal(false); handleOpenEditBank(payoutTarget); }}
                      className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Add Bank Details Now
                    </button>
                  </div>
                </div>
              )}

              {/* Below minimum payout threshold warning */}
              {hasBankDetails && belowThreshold && (
                <div className="mb-5 flex items-start gap-3 bg-sky-500/8 border border-sky-500/20 rounded-xl p-4">
                  <span className="material-symbols-outlined text-sky-400 text-base flex-shrink-0 mt-0.5">info</span>
                  <p className="text-sky-300 text-[10.5px] font-medium leading-relaxed">
                    Pending balance <span className="font-bold text-white">${payoutTarget.pendingRewards.toFixed(2)}</span> is below the minimum payout threshold of <span className="font-bold text-white">${referralConfig.minPayoutThreshold}</span>. You can still process a manual override payout below.
                  </p>
                </div>
              )}

              {/* Bank destination card */}
              {hasBankDetails && (
                <div className="mb-5 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[11px]">account_balance</span>
                      Destination Bank Account
                    </p>
                    <button type="button"
                      onClick={() => { setShowPayoutModal(false); handleOpenEditBank(payoutTarget); }}
                      className="text-[9px] text-[#ffe2ab]/60 hover:text-[#ffc53d] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[11px]">edit</span>
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Bank</div>
                      <div className="text-white font-bold mt-0.5">{payoutTarget.bank.bankName}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Account Holder</div>
                      <div className="text-white font-bold mt-0.5">{payoutTarget.bank.accountHolder}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Account Number</div>
                      <div className="text-[#A69984]/80 font-mono mt-0.5">{payoutTarget.bank.accountNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#A69984]/40 font-bold uppercase tracking-wider">Routing / SWIFT</div>
                      <div className="text-[#A69984]/80 font-mono mt-0.5">{payoutTarget.bank.routingNumber || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payout form */}
              <form onSubmit={handleProcessPayout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Payout Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-[#A69984]/50 text-xs font-bold">$</span>
                      <input
                        type="number" step="0.01" min="0.01" required
                        placeholder="0.00"
                        aria-label="Payout amount"
                        value={payoutAmount}
                        onChange={e => setPayoutAmount(e.target.value)}
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-7 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end gap-1 pb-1">
                    <div className="text-[9px] text-[#A69984]/45 font-bold uppercase tracking-wider">Pending Balance</div>
                    <div className="text-amber-400 font-bold text-lg font-serif">${payoutTarget.pendingRewards.toFixed(2)}</div>
                    <div className="text-[9px] text-[#A69984]/35 font-semibold">Paid out: ${payoutTarget.paidRewards.toFixed(2)}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Reference Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Q2 2026 referral reward disbursement"
                    aria-label="Payout reference note"
                    value={payoutNote}
                    onChange={e => setPayoutNote(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>

                <div className="pt-1 flex gap-3">
                  <button type="button"
                    onClick={() => { setShowPayoutModal(false); setPayoutTarget(null); setPayoutAmount(''); setPayoutNote(''); }}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button type="button"
                    disabled={!canPayout}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      canPayout
                        ? 'bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] cursor-pointer shadow-md'
                        : 'bg-white/5 text-[#A69984]/30 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">payments</span>
                    {!hasBankDetails ? 'Bank Details Required' : 'Confirm Payout'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {showResetPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[440px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button"
              onClick={() => { setShowResetPasswordModal(false); setSelectedAdmin(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-2">Reset Passcode</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">
              Manually overwrite security passcode for <span className="text-white font-bold">{selectedAdmin.name}</span> ({selectedAdmin.tenant}).
            </p>
            
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">New Administrative Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[#A69984]/40 text-sm absolute left-4 top-3.5">lock</span>
                  <input
                    type="password"
                    required
                    aria-label="New administrative password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[#A69984]/40 text-sm absolute left-4 top-3.5">lock</span>
                  <input
                    type="password"
                    required
                    aria-label="Confirm new password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => { setShowResetPasswordModal(false); setSelectedAdmin(null); }}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="button" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SaaS PRICING PLANS EDITOR */}
      {showPlanEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300 select-none">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[640px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button type="button"
              onClick={() => { setShowPlanEditorModal(false); setEditingPlan(null); }}
              className="absolute top-6 right-6 text-[#A69984]/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="font-serif text-white font-bold text-2xl mb-1">Global SaaS Pricing Plans</h3>
            <p className="text-[11px] text-[#A69984]/55 font-semibold mb-6">Manage subscription pricing, operational terminal limits, and toggle feature gates.</p>

            {editingPlan ? (
              /* Plan editor subview */
              <form onSubmit={handlePlanSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Plan Name</label>
                    <input 
                      type="text" 
                      required
                      aria-label="Plan name"
                      placeholder="e.g. Enterprise Growth"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Monthly Fee (USD)</label>
                    <input 
                      type="number" 
                      required
                      aria-label="Monthly price USD"
                      placeholder="299"
                      value={editingPlan.monthlyPrice}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, monthlyPrice: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Registers/Terminals Limit</label>
                    <input 
                      type="number" 
                      required
                      aria-label="Terminals limit"
                      placeholder="12"
                      value={editingPlan.terminalsLimit}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, terminalsLimit: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A69984] text-[9.5px] font-bold uppercase tracking-wider mb-2">Storage Allocation (GB)</label>
                    <input 
                      type="number" 
                      required
                      aria-label="Storage allocation GB"
                      placeholder="100"
                      value={editingPlan.storageLimitGB}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, storageLimitGB: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                    />
                  </div>
                </div>

                {/* Plan features grid */}
                <div className="bg-[#0e0e0d]/55 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="font-bold text-[9.5px] text-[#ffe2ab]/70 uppercase tracking-widest border-b border-white/5 pb-2">Plan Feature Gates</div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.aiConcierge}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, aiConcierge: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      AI Sommelier Concierge
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.selfCheckout}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, selfCheckout: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      Guest Self-Checkout
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.analytics}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, analytics: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      Terminal Analytics Desk
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-white/90">
                      <input 
                        type="checkbox"
                        checked={editingPlan.features.offlineMode}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: { ...prev.features, offlineMode: e.target.checked } } : null)}
                        className="rounded border-white/15 bg-black/40 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      Offline Mode Support
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" 
                    onClick={() => setEditingPlan(null)}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Back to Plans
                  </button>
                  <button type="button" 
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* Plans directory view */
              <div className="space-y-6 font-sans">
                <div className="overflow-x-auto w-full">
                  <table className="w-full font-sans border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Tier Plan</th>
                        <th className="py-3 px-4 text-center">Monthly Price</th>
                        <th className="py-3 px-4 text-center">Terminals Limit</th>
                        <th className="py-3 px-4 text-center">Storage Allocation</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {saasPlans.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 text-sm font-serif font-bold text-white">
                            {p.name}
                          </td>
                          <td className="py-4 px-4 text-center text-amber-400 font-mono text-sm">${p.monthlyPrice}/mo</td>
                          <td className="py-4 px-4 text-center text-[#e5e2e1]/80">{p.terminalsLimit === 999 ? 'Unlimited' : p.terminalsLimit}</td>
                          <td className="py-4 px-4 text-center text-[#e5e2e1]/80">{p.storageLimitGB} GB</td>
                          <td className="py-4 px-4 text-right">
                            <button type="button" 
                              onClick={() => setEditingPlan(p)}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#ffe2ab] px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Edit Settings
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button type="button" 
                    onClick={() => { setShowPlanEditorModal(false); }}
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Close Portal
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 5: SECURE ADMINISTRATIVE TERMINAL (CLI) */}
      {showTerminalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#0c0c0b] border border-white/10 w-full max-w-[720px] rounded-2xl shadow-2xl relative overflow-hidden font-mono text-xs flex flex-col h-[480px]">
            
            {/* Terminal Topbar */}
            <div className="bg-[#141413] px-6 py-3 border-b border-white/5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-[#A69984]/75 text-[10px] uppercase font-bold tracking-wider ml-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#ffc53d]">terminal</span>
                  Secure Admin Terminal: admin@dinepos-core
                </span>
              </div>
              <button type="button" 
                onClick={() => { setShowTerminalModal(false); }}
                className="text-[#A69984]/50 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-2 select-text text-emerald-400 font-normal leading-relaxed">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap font-mono">
                  {log.startsWith('admin@dinepos-core') ? (
                    <span className="text-white font-bold">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))}
            </div>

            {/* Terminal Form Input */}
            <form onSubmit={handleTerminalSubmit} className="border-t border-white/5 bg-[#080807] px-6 py-3.5 flex items-center gap-2">
              <span className="text-white font-bold select-none shrink-0 font-mono">admin@dinepos-core:~$</span>
              <input 
                type="text" 
                autoFocus
                placeholder="type help to begin..."
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="flex-grow bg-transparent border-none text-emerald-400 focus:outline-none focus:ring-0 p-0 font-mono text-xs"
              />
            </form>

          </div>
        </div>
      )}


      {/* GLOBAL TOAST FEEDBACK NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">info</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">System Alert</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
