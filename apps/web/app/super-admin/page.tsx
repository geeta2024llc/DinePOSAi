'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';
import { CmsConfig, getCmsConfig, saveCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';
import { recordActivity, getActivityLogs, clearActivityLogs } from '@/utils/activityLogger';
import { apiRequest } from '@/utils/api';

const TenantManager = dynamic(() => import('@/components/super-admin/TenantManager'), { ssr: false });
const AccessManager = dynamic(() => import('@/components/super-admin/AccessManager'), { ssr: false });
const SystemAnalytics = dynamic(() => import('@/components/super-admin/SystemAnalytics'), { ssr: false });
const ReferralsManager = dynamic(() => import('@/components/super-admin/ReferralsManager'), { ssr: false });
const SupportManager = dynamic(() => import('@/components/super-admin/SupportManager'), { ssr: false });
const CmsManager = dynamic(() => import('@/components/super-admin/CmsManager'), { ssr: false });

// Curated themes mirroring the admin console theme system for visual continuity
const themes = {
  'Midnight Black': {
    name: 'Midnight Black',
    bg: 'bg-[#0e0e0d]',
    bgSecondary: 'bg-[#161513]',
    cardBg: 'bg-[#161513]/90 border-white/5',
    cardBgOpaque: 'bg-[#161513] border-white/5',
    sidebarBg: 'bg-[#0a0a09] border-white/5',
    border: 'border-white/5',
    borderStrong: 'border-white/10',
    text: 'text-[#e5e2e1]',
    textMuted: 'text-[#c5b9a5]',
    textMutedLight: 'text-[#a69984]',
    textMutedDark: 'text-[#887e6d]',
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
    tagAdmin: 'bg-white/5 border border-white/10 text-[#a69984]/50',
    tagManager: 'bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 text-[#ffe2ab]',
    tagStaff: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
    tagActive: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    tagSuspended: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
    tagTrial: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
    tagExpired: 'bg-white/5 border border-white/10 text-[#a69984]/50'
  },
  'Pristine White': {
    name: 'Pristine White',
    bg: 'bg-[#f4f3f0]',
    bgSecondary: 'bg-[#ffffff]',
    cardBg: 'bg-white/95 border-[#ede6da] shadow-[0_4px_16px_rgba(142,130,111,0.04)]',
    cardBgOpaque: 'bg-white border-[#ede6da] shadow-[0_4px_16px_rgba(142,130,111,0.04)]',
    sidebarBg: 'bg-[#edeae5] border-[#dfdad0]',
    border: 'border-[#ede6da]',
    borderStrong: 'border-[#cdc7bc]',
    text: 'text-[#1a1917]',
    textMuted: 'text-[#4c4a45]',
    textMutedLight: 'text-[#68655e]',
    textMutedDark: 'text-[#7e7a72]',
    accent: 'text-[#cfa426]',
    accentBg: 'bg-[#cfa426]',
    accentHoverBg: 'hover:bg-[#b08b1f]',
    accentText: 'text-white',
    accentLight: 'text-[#8c6f17]',
    accentLightBg: 'bg-[#cfa426]/10',
    accentLightBorder: 'border-[#cfa426]/20',
    cardHover: 'hover:bg-black/[0.01]',
    inputBg: 'bg-[#fafaf9]',
    inputBorder: 'border-[#e2ddd5]',
    buttonOutline: 'border-[#cdc7bc] hover:border-[#b0a99c] text-[#1a1917]',
    divider: 'divide-[#e2ddd5]',
    tagAdmin: 'bg-[#6e6b63]/5 border border-[#6e6b63]/15 text-[#6e6b63]',
    tagManager: 'bg-[#cfa426]/10 border border-[#cfa426]/20 text-[#8c6f17]',
    tagStaff: 'bg-sky-600/10 border border-sky-600/20 text-sky-700',
    tagActive: 'bg-emerald-600/10 border border-emerald-600/20 text-emerald-700',
    tagSuspended: 'bg-rose-600/10 border border-rose-600/20 text-rose-700',
    tagTrial: 'bg-amber-600/10 border border-amber-600/20 text-amber-700',
    tagExpired: 'bg-[#6e6b63]/5 border border-[#6e6b63]/15 text-[#6e6b63]'
  },
  'Delicious Red': {
    name: 'Delicious Red',
    bg: 'bg-[#faf9f6]',
    bgSecondary: 'bg-[#ffffff]',
    cardBg: 'bg-white/95 border-[#ede6da] shadow-[0_4px_20px_rgba(200,16,46,0.03)]',
    cardBgOpaque: 'bg-white border-[#ede6da] shadow-[0_4px_20px_rgba(200,16,46,0.03)]',
    sidebarBg: 'bg-[#f5f2eb] border-[#e8e2d5]',
    border: 'border-[#ede6da]',
    borderStrong: 'border-[#d4c3b3]',
    text: 'text-[#1a1917]',
    textMuted: 'text-[#5c564c]',
    textMutedLight: 'text-[#787165]',
    textMutedDark: 'text-[#928b7e]',
    accent: 'text-[#c8102e]',
    accentBg: 'bg-[#c8102e]',
    accentHoverBg: 'hover:bg-[#a00c22]',
    accentText: 'text-white',
    accentLight: 'text-[#900c1e]',
    accentLightBg: 'bg-[#c8102e]/8',
    accentLightBorder: 'border-[#c8102e]/15',
    cardHover: 'hover:bg-black/[0.005]',
    inputBg: 'bg-[#fcfbfa]',
    inputBorder: 'border-[#e1dad0]',
    buttonOutline: 'border-[#dcd4c8] hover:border-[#bdae9c] text-[#1a1917]',
    divider: 'divide-[#ede6da]',
    tagAdmin: 'bg-[#5c564c]/8 border border-[#5c564c]/15 text-[#5c564c]',
    tagManager: 'bg-[#c8102e]/10 border border-[#c8102e]/20 text-[#c8102e]',
    tagStaff: 'bg-sky-600/10 border border-sky-600/20 text-sky-700',
    tagActive: 'bg-emerald-600/10 border border-emerald-600/20 text-emerald-700',
    tagSuspended: 'bg-rose-600/10 border border-rose-600/20 text-rose-700',
    tagTrial: 'bg-amber-600/10 border border-amber-600/20 text-amber-700',
    tagExpired: 'bg-[#5c564c]/8 border border-[#5c564c]/15 text-[#5c564c]'
  },
  'Bordeaux Reserve': {
    name: 'Bordeaux Reserve',
    bg: 'bg-[#180a0c]',
    bgSecondary: 'bg-[#221013]',
    cardBg: 'bg-[#221013]/90 border-[#4a1c24]',
    cardBgOpaque: 'bg-[#221013] border-[#4a1c24]',
    sidebarBg: 'bg-[#100305] border-[#4a1c24]',
    border: 'border-[#4a1c24]',
    borderStrong: 'border-[#6b2c37]',
    text: 'text-[#f5ecea]',
    textMuted: 'text-[#d8b8b5]',
    textMutedLight: 'text-[#c29c98]',
    textMutedDark: 'text-[#a87e79]',
    accent: 'text-[#f5aca4]',
    accentBg: 'bg-[#f5aca4]',
    accentHoverBg: 'hover:bg-[#e0928b]',
    accentText: 'text-[#380d12]',
    accentLight: 'text-[#fad2ce]',
    accentLightBg: 'bg-[#f5aca4]/15',
    accentLightBorder: 'border-[#f5aca4]/30',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[#160608]',
    inputBorder: 'border-[#4a1c24]',
    buttonOutline: 'border-[#6b2c37] hover:border-[#8c3d4b] text-[#f5ecea]',
    divider: 'divide-[#4a1c24]',
    tagAdmin: 'bg-white/5 border border-white/10 text-[#d8b8b5]/50',
    tagManager: 'bg-[#f5aca4]/10 border border-[#f5aca4]/20 text-[#f5aca4]',
    tagStaff: 'bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffe2ab]',
    tagActive: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    tagSuspended: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
    tagTrial: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
    tagExpired: 'bg-white/5 border border-white/10 text-[#d8b8b5]/50'
  },
  'Deep Teal': {
    name: 'Deep Teal',
    bg: 'bg-[#051112]',
    bgSecondary: 'bg-[#0c1c1e]',
    cardBg: 'bg-[#0c1c1e]/90 border-[#1a383b]',
    cardBgOpaque: 'bg-[#0c1c1e] border-[#1a383b]',
    sidebarBg: 'bg-[#02090a] border-[#1a383b]',
    border: 'border-[#1a383b]',
    borderStrong: 'border-[#285357]',
    text: 'text-[#dcf0f2]',
    textMuted: 'text-[#b0cdcf]',
    textMutedLight: 'text-[#95b4b7]',
    textMutedDark: 'text-[#7ca1a3]',
    accent: 'text-[#48e5ec]',
    accentBg: 'bg-[#48e5ec]',
    accentHoverBg: 'hover:bg-[#34c9cf]',
    accentText: 'text-[#032426]',
    accentLight: 'text-[#9ef7fa]',
    accentLightBg: 'bg-[#48e5ec]/15',
    accentLightBorder: 'border-[#48e5ec]/30',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[#030d0e]',
    inputBorder: 'border-[#1a383b]',
    buttonOutline: 'border-[#285357] hover:border-[#387277] text-[#dcf0f2]',
    divider: 'divide-[#1a383b]',
    tagAdmin: 'bg-white/5 border border-white/10 text-[#b0cdcf]/50',
    tagManager: 'bg-[#48e5ec]/10 border border-[#48e5ec]/20 text-[#48e5ec]',
    tagStaff: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    tagActive: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    tagSuspended: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
    tagTrial: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
    tagExpired: 'bg-white/5 border border-white/10 text-[#b0cdcf]/50'
  },
  'Custom Palette': {
    name: 'Custom Palette',
    bg: 'bg-[var(--custom-bg)]',
    bgSecondary: 'bg-[var(--custom-card-bg)]',
    cardBg: 'bg-[var(--custom-card-bg)]/90 border-[var(--custom-accent)]/10',
    cardBgOpaque: 'bg-[var(--custom-card-bg)] border-[var(--custom-accent)]/10',
    sidebarBg: 'bg-[var(--custom-bg)] border-[var(--custom-accent)]/10',
    border: 'border-[var(--custom-accent)]/5',
    borderStrong: 'border-[var(--custom-accent)]/15',
    text: 'text-[var(--custom-text)]',
    textMuted: 'text-[var(--custom-text-muted)]',
    textMutedLight: 'text-[var(--custom-text-muted)]/80',
    textMutedDark: 'text-[var(--custom-text-muted)]/60',
    accent: 'text-[var(--custom-accent)]',
    accentBg: 'bg-[var(--custom-accent)]',
    accentHoverBg: 'hover:opacity-90',
    accentText: 'text-black',
    accentLight: 'text-[var(--custom-accent)]',
    accentLightBg: 'bg-[var(--custom-accent)]/15',
    accentLightBorder: 'border-[var(--custom-accent)]/20',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[var(--custom-bg)]',
    inputBorder: 'border-[var(--custom-accent)]/20',
    buttonOutline: 'border-[var(--custom-accent)]/20 text-[var(--custom-text)]',
    divider: 'divide-[var(--custom-accent)]/10',
    tagAdmin: 'bg-white/5 border border-white/10 text-[var(--custom-text-muted)]/60',
    tagManager: 'bg-[var(--custom-accent)]/10 border border-[var(--custom-accent)]/20 text-[var(--custom-accent)]',
    tagStaff: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
    tagActive: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    tagSuspended: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
    tagTrial: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
    tagExpired: 'bg-white/5 border border-white/10 text-[var(--custom-text-muted)]/60'
  }
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
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  // Dynamic aesthetic state loading
  const [globalAesthetic, setGlobalAesthetic] = useState('Midnight Black');
  const [customBg, setCustomBg] = useState('#0e0e0d');
  const [customCardBg, setCustomCardBg] = useState('#161513');
  const [customAccent, setCustomAccent] = useState('#ffc53d');
  const [customText, setCustomText] = useState('#e5e2e1');
  const [customTextMuted, setCustomTextMuted] = useState('#a69984');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAesthetic = localStorage.getItem('dinepos_global_aesthetic');
      if (savedAesthetic) setGlobalAesthetic(savedAesthetic);
      
      const savedBg = localStorage.getItem('dinepos_custom_bg');
      const savedCardBg = localStorage.getItem('dinepos_custom_card_bg');
      const savedAccent = localStorage.getItem('dinepos_custom_accent');
      const savedText = localStorage.getItem('dinepos_custom_text');
      const savedTextMuted = localStorage.getItem('dinepos_custom_text_muted');
      
      if (savedBg) setCustomBg(savedBg);
      if (savedCardBg) setCustomCardBg(savedCardBg);
      if (savedAccent) setCustomAccent(savedAccent);
      if (savedText) setCustomText(savedText);
      if (savedTextMuted) setCustomTextMuted(savedTextMuted);
    }
  }, []);

  const theme = themes[globalAesthetic as keyof typeof themes] || themes['Midnight Black'];
  const isLightTheme = globalAesthetic === 'Pristine White' || globalAesthetic === 'Delicious Red';
  const hText = isLightTheme ? 'hover:text-[#1a1917]' : 'hover:text-white';
  const hBg = isLightTheme ? 'hover:bg-black/5' : 'hover:bg-white/5';
  const hBgStrong = isLightTheme ? 'hover:bg-black/10' : 'hover:bg-white/10';
  const hBorder = isLightTheme ? 'hover:border-black/20' : 'hover:border-white/20';
  const t = (en: string, jp?: string) => en;
  const handleSaveChanges = () => {
    localStorage.setItem('dinepos_global_aesthetic', globalAesthetic);
    localStorage.setItem('dinepos_custom_bg', customBg);
    localStorage.setItem('dinepos_custom_card_bg', customCardBg);
    localStorage.setItem('dinepos_custom_accent', customAccent);
    localStorage.setItem('dinepos_custom_text', customText);
    localStorage.setItem('dinepos_custom_text_muted', customTextMuted);
    triggerToast('Aesthetic settings saved successfully.', 'success');
  };
  const handleSuspendTenant = (id: string) => {};
  const handleUnsuspendTenant = (id: string) => {};
  const handleDeleteAdmin = (id: string) => {
    setAdmins(prev => prev.filter(adm => adm.id !== id));
  };
  const handleEditAdminClick = (admin: any) => {};
  const handleResetPasswordClick = (admin: any) => {};
  const handleAddAdminSubmit = (e: any) => {};
  const handleEditAdminSubmit = (e: any) => {};
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: any) => {
    const updatedTickets = tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
    setTickets(updatedTickets);
    localStorage.setItem('dinepos_support_tickets', JSON.stringify(updatedTickets));
    triggerToast(`Ticket status updated to ${newStatus}.`, 'success');
  };

  // Sidebar tab matching mockup
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'access' | 'health' | 'referrals' | 'payments' | 'promocodes' | 'settings' | 'support' | 'analytics' | 'cms' | 'activity-log'>('overview');

  const [cmsConfig, setCmsConfig] = useState<CmsConfig>(defaultCmsConfig);

  useEffect(() => {
    setCmsConfig(getCmsConfig());
  }, []);

  // Activity Log Tab States
  const [logsList, setLogsList] = useState<any[]>([]);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsFilter, setLogsFilter] = useState('All');
  const [logsPage, setLogsPage] = useState(1);

  // Load activity logs
  useEffect(() => {
    if (activeTab === 'activity-log') {
      getActivityLogs().then((logs) => {
        setLogsList(logs);
      });
    }
  }, [activeTab]);

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
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdminToEdit, setSelectedAdminToEdit] = useState<AdminUser | null>(null);
  const [editAdminData, setEditAdminData] = useState({ name: '', email: '', tenant: '', status: 'ACTIVE' as AdminUser['status'] });

  // Stripe Linking State
  const [stripeLinked, setStripeLinked] = useState(false);
  const [stripeSecretKeyInput, setStripeSecretKeyInput] = useState('');
  const [stripeWebhookSecretInput, setStripeWebhookSecretInput] = useState('');
  const [stripeLoading, setStripeLoading] = useState(true);
  const [showStripeModal, setShowStripeModal] = useState(false);

  // Fetch Stripe connection configuration
  const fetchStripeConfig = async () => {
    setStripeLoading(true);
    try {
      const res = await apiRequest('/api/billing/config');
      if (res.success && res.data) {
        setStripeLinked(res.data.isLinked);
      }
    } catch (err) {
      console.error('Failed to load Stripe configuration:', err);
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    fetchStripeConfig();
  }, []);

  const handleLinkStripe = async () => {
    if (!stripeSecretKeyInput.trim()) {
      triggerToast('Stripe Secret Key is required.', 'info');
      return;
    }

    try {
      const res = await apiRequest('/api/billing/config', {
        method: 'POST',
        body: JSON.stringify({
          stripeSecretKey: stripeSecretKeyInput.trim(),
          stripeWebhookSecret: stripeWebhookSecretInput.trim()
        })
      });

      if (res.success) {
        triggerToast('Stripe account linked successfully!', 'success');
        setStripeLinked(true);
        setShowStripeModal(false);
        setStripeSecretKeyInput('');
        setStripeWebhookSecretInput('');
      } else {
        triggerToast(res.error || 'Failed to link Stripe.', 'info');
      }
    } catch (err: any) {
      triggerToast('Error: ' + err.message, 'info');
    }
  };

  const handleUnlinkStripe = async () => {
    if (!confirm('Are you sure you want to unlink your Stripe account? System subscriptions will fall back to default environmental configuration.')) {
      return;
    }

    try {
      const res = await apiRequest('/api/billing/config/unlink', {
        method: 'POST'
      });

      if (res.success) {
        triggerToast('Stripe account unlinked successfully.', 'success');
        setStripeLinked(false);
      } else {
        triggerToast(res.error || 'Failed to unlink Stripe.', 'info');
      }
    } catch (err: any) {
      triggerToast('Error: ' + err.message, 'info');
    }
  };


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
    { id: 'dev-1', type: 'POS', name: 'FOH Host Terminal', tenant: 'Le Bernardin Group', status: 'ONLINE', lastSeen: 'Just now', ip: '192.168.1.101' },
    { id: 'dev-2', type: 'KDS', name: 'Expo Kitchen Main Screen', tenant: 'Le Bernardin Group', status: 'ONLINE', lastSeen: '1m ago', ip: '192.168.1.201' },
    { id: 'dev-3', type: 'TABLET', name: 'Bar Right Handheld POS', tenant: 'Aman Resorts', status: 'ONLINE', lastSeen: 'Just now', ip: '10.0.4.12' },
    { id: 'dev-4', type: 'PRINTER', name: 'Kitchen Hot Ticket Printer', tenant: 'Aman Resorts', status: 'WARNING_LOW_PAPER', lastSeen: '5m ago', ip: '10.0.4.88' },
    { id: 'dev-5', type: 'POS', name: 'Main FOH Register', tenant: 'Soho House', status: 'ONLINE', lastSeen: 'Just now', ip: '172.16.8.10' },
    { id: 'dev-6', type: 'KDS', name: 'Pastry Station display', tenant: 'Soho House', status: 'OFFLINE', lastSeen: '3h ago', ip: '172.16.8.35' },
    { id: 'dev-7', type: 'POS', name: 'Bakery FOH Terminal', tenant: 'Bouchon Bakery', status: 'ONLINE', lastSeen: '10m ago', ip: '192.168.22.5' },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 1, time: '2m ago', actor: 'Vladislav Doronin (Admin)', action: 'Authorized menu update "Matsuhisa Caviar"', tenant: 'Aman Resorts', type: 'info' },
    { id: 2, time: '12m ago', actor: 'Eric Ripert (Admin)', action: 'Authorized void check table 12 (¥34,250)', tenant: 'Le Bernardin Group', type: 'warning' },
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
    rewardPerSignup: 15000,
    minPayoutThreshold: 10000,
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
    const header = ['TX ID', 'Date', 'Ambassador', 'Amount (JPY)', 'Note'];
    const rows = payoutHistory.map(tx => [tx.id, tx.date, tx.ambassadorName, Math.round(tx.amount).toString(), tx.note]);
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
    triggerToast(`Referral "${newBiz.name}" logged for ${addReferralTarget.name}.${reward > 0 ? ` ¥${reward.toLocaleString()} reward queued.` : ''}`, 'success');
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
            { id: 'biz-1', name: 'Nobu Tokyo', contact: 'chef@nobu.com', joinedDate: '2026-03-18', status: 'Subscribed', services: ['POS', 'KDS', 'Analytics'], reward: 15000 },
            { id: 'biz-2', name: 'Sketch London', contact: 'info@sketch.uk', joinedDate: '2026-04-02', status: 'Active', services: ['POS', 'Self Checkout'], reward: 15000 },
            { id: 'biz-3', name: 'Osteria Francescana', contact: 'massimo@osteria.it', joinedDate: '2026-04-22', status: 'Pending', services: ['POS'], reward: 0 },
          ],
          pendingRewards: 30000,
          paidRewards: 60000,
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
            { id: 'biz-4', name: 'Hawksmoor Manchester', contact: 'gm@hawksmoor.com', joinedDate: '2026-02-14', status: 'Subscribed', services: ['POS', 'KDS'], reward: 15000 },
            { id: 'biz-5', name: 'Hakkasan Dubai', contact: 'dubai@hakkasan.com', joinedDate: '2026-05-01', status: 'Active', services: ['POS', 'AI Concierge', 'Analytics'], reward: 15000 },
          ],
          pendingRewards: 15000,
          paidRewards: 105000,
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
          paidRewards: 25000,
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
    
    recordActivity(
      'Create Promo Code',
      `Created promo code "${created.code}" — ${created.discountType === 'percentage' ? `${created.discountValue}% off` : `$${created.discountValue} flat`}`,
      'Settings',
      { promoId: created.id, code: created.code }
    );

    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `Created promo code "${created.code}" — ${created.discountType === 'percentage' ? `${created.discountValue}% off` : `$${created.discountValue} flat`} on ${created.applicablePlan === 'all' ? 'all plans' : (saasPlans.find(s => s.id === created.applicablePlan)?.name || created.applicablePlan)}`,
      tenant: 'Promo Codes', type: 'success'
    }, ...prev]);
  };

  const handleTogglePromoStatus = async (id: string) => {
    const updated = promoCodes.map(p => {
      if (p.id !== id || p.status === 'expired') return p;
      return { ...p, status: (p.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' };
    });
    setPromoCodes(updated);
    localStorage.setItem('dinepos_promo_codes', JSON.stringify(updated));
    const code = updated.find(p => p.id === id);
    triggerToast(`Promo code "${code?.code}" is now ${code?.status}.`, 'success');
    
    if (code) {
      await recordActivity(
        'Toggle Promo Code Status',
        `${code.status === 'active' ? 'Activated' : 'Deactivated'} promo code "${code.code}"`,
        'Settings',
        { promoId: code.id, code: code.code, status: code.status }
      );
    }

    setAuditLogs(prev => [{
      id: Date.now(), time: 'Just now', actor: 'Super Admin',
      action: `${code?.status === 'active' ? 'Activated' : 'Deactivated'} promo code "${code?.code}"`,
      tenant: 'Promo Codes', type: 'security'
    }, ...prev]);
  };

  const handleDeletePromoCode = async (id: string, code: string) => {
    const updated = promoCodes.filter(p => p.id !== id);
    setPromoCodes(updated);
    localStorage.setItem('dinepos_promo_codes', JSON.stringify(updated));
    if (selectedPromoCode?.id === id) setSelectedPromoCode(null);
    triggerToast(`Promo code "${code}" permanently deleted.`, 'success');
    
    await recordActivity(
      'Delete Promo Code',
      `Permanently deleted promo code "${code}"`,
      'Settings',
      { promoId: id, code }
    );

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
      triggerToast(`Amount exceeds pending balance of ¥${payoutTarget.pendingRewards.toLocaleString()}.`, 'info');
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
    
    // Auto status alignment based on selected plan
    let alignedStatus = selectedTenant.status;
    if (selectedTenant.plan === 'EXPIRED') alignedStatus = 'EXPIRED' as any;
    else if (selectedTenant.plan === 'SUSPENDED') alignedStatus = 'SUSPENDED';
    else alignedStatus = 'ACTIVE';

    const updatedTenant = { 
      ...selectedTenant, 
      status: alignedStatus, 
      expiryDate: editingExpiryDate 
    };

    setTenants(prev => prev.map(t => 
      t.id === selectedTenant.id 
        ? updatedTenant
        : t
    ));
    
    // Sync with currently logged-in user if it is the same tenant
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('dinepos_user_account');
      if (loggedIn) {
        try {
          const parsed = JSON.parse(loggedIn);
          const currentTenantId = parsed.tenant?.id || parsed.tenantId;
          
          if (currentTenantId === selectedTenant.id) {
            if (parsed.tenant) {
              parsed.tenant.plan = selectedTenant.plan;
              parsed.tenant.name = selectedTenant.name;
              parsed.tenant.trialEndsAt = selectedTenant.plan === 'TRIAL' ? editingExpiryDate : undefined;
              parsed.tenant.subscriptionExpiresAt = selectedTenant.plan !== 'TRIAL' ? editingExpiryDate : undefined;
            }
            parsed.plan = selectedTenant.plan;
            parsed.restaurantName = selectedTenant.name;
            parsed.trialEndsAt = selectedTenant.plan === 'TRIAL' ? editingExpiryDate : undefined;
            parsed.subscriptionExpiresAt = selectedTenant.plan !== 'TRIAL' ? editingExpiryDate : undefined;
            parsed.tier = selectedTenant.tier;
            
            localStorage.setItem('dinepos_user_account', JSON.stringify(parsed));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    setShowTenantDetailsModal(false);
    triggerToast(`Tenant subscription settings for ${selectedTenant.name} updated successfully.`, 'success');
    
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Super Admin',
        action: `Updated settings (Tier: ${selectedTenant.tier}, Plan: ${selectedTenant.plan}, Terminals: ${selectedTenant.terminals}, Expiry: ${editingExpiryDate}) for tenant "${selectedTenant.name}"`,
        tenant: selectedTenant.name,
        type: 'info'
      },
      ...prev
    ]);
  };

  // Add new admin user logic
  const handleAddAdmin = async (e: React.FormEvent) => {
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

    await recordActivity(
      'Create Admin Account',
      `Created admin user "${created.name}" (${created.email}) for ${created.tenant}`,
      'Security',
      { adminId: created.id, name: created.name, email: created.email, tenant: created.tenant }
    );

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
  const toggleTenantStatus = async (id: string, name: string, currentStatus: Tenant['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus, plan: nextStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' } : t));
    triggerToast(`Tenant "${name}" is now ${nextStatus.toLowerCase()}`, 'success');
    
    await recordActivity(
      'Toggle Tenant Status',
      `${nextStatus === 'SUSPENDED' ? 'Suspended' : 'Re-activated'} business tenant "${name}"`,
      'System',
      { tenantId: id, tenantName: name, newStatus: nextStatus }
    );

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
  const toggleAdminStatus = async (id: string, name: string, currentStatus: AdminUser['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    triggerToast(`Admin "${name}" is now ${nextStatus.toLowerCase()}`, 'success');

    await recordActivity(
      'Toggle Admin Account Status',
      `${nextStatus === 'SUSPENDED' ? 'Suspended' : 'Activated'} admin account for "${name}"`,
      'Security',
      { adminId: id, adminName: name, newStatus: nextStatus }
    );

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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      triggerToast('Passcodes do not match or are empty.', 'info');
      return;
    }
    setShowResetPasswordModal(false);
    triggerToast(`Passcode updated successfully for ${selectedAdmin?.name}!`, 'success');

    await recordActivity(
      'Security',
      `Manually changed passcode/password for Admin "${selectedAdmin?.name}"`,
      'Security',
      { adminId: selectedAdmin?.id, adminName: selectedAdmin?.name }
    );

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
  const handleTicketReply = async (e: React.FormEvent) => {
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
    
    await recordActivity(
      'Reply to Support Ticket',
      `Resolved support ticket ${selectedTicket.id} from ${selectedTicket.establishment}`,
      'System',
      { ticketId: selectedTicket.id, establishment: selectedTicket.establishment }
    );

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
  const handleTicketStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
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

    await recordActivity(
      'Update Ticket Status',
      `Updated ticket ${ticketId} status to ${newStatus}`,
      'System',
      { ticketId, status: newStatus }
    );

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
  const handleTicketDelete = async (ticketId: string) => {
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    setTickets(updatedTickets);
    localStorage.setItem('dinepos_support_tickets', JSON.stringify(updatedTickets));
    triggerToast(`Ticket ${ticketId} removed.`, 'success');
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(null);
    }

    await recordActivity(
      'Delete Support Ticket',
      `Deleted support ticket ${ticketId}`,
      'System',
      { ticketId }
    );
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
      {/* Inject custom theme CSS variables dynamically — values are sanitized to hex only */}
      <style dangerouslySetInnerHTML={{ __html: (() => {
        const safeHex = (v: string) => /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : '#000000';
        return `:root {
          --custom-bg: ${safeHex(customBg)};
          --custom-card-bg: ${safeHex(customCardBg)};
          --custom-accent: ${safeHex(customAccent)};
          --custom-text: ${safeHex(customText)};
          --custom-text-muted: ${safeHex(customTextMuted)};
        }`;
      })() }} />
      {/* LEFT SIDEBAR PANEL (GLOBAL CONSOLE CONTEXT) */}
      <aside className={`h-full flex-shrink-0 z-20 border-r ${theme.border} overflow-y-auto transition-all duration-300 ${theme.sidebarBg} ${
        sidebarCollapsed 
          ? 'w-0 p-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] p-8'
      }`}>
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
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
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">web</span>
              <span>CMS Content</span>
            </button>
            {/* Activity Log */}
            <button type="button"
              onClick={() => { setActiveTab('activity-log'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'activity-log'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} ${hText} ${hBg} rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">history</span>
              <span>Activity Log</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className={`pt-6 font-sans border-t ${theme.border} space-y-4`}>
          <button type="button" 
            onClick={() => window.open('https://dineposai.com/docs', '_blank')}
            className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${theme.textMuted} ${hText} ${hBg} rounded-xl`}
          >
            <span className="material-symbols-outlined text-lg leading-none">menu_book</span>
            <span>Documentation</span>
          </button>
          <Link 
            href="/login?logout=true"
            className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${theme.textMuted} ${hText} ${hBg} rounded-xl`}
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

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
              onClick={() => triggerToast('Security: TLS 1.3 enforced, 2FA enabled for all admin accounts, audit logging active.', 'success')}
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
          {['overview', 'locations', 'settings'].includes(activeTab) && (
            <TenantManager
              {...{
                t, theme, isLightTheme, activeTab, searchQuery, setSearchQuery,
                statusFilter, setStatusFilter, tierFilter, setTierFilter,
                regionFilter, setRegionFilter, triggerToast, filteredTenants,
                deployProgress, triggerDeployUpdate: handleDeployUpdate, handleSuspendTenant,
                handleUnsuspendTenant, setShowAddTenantModal, globalAesthetic,
                setGlobalAesthetic, customBg, setCustomBg, customCardBg,
                setCustomCardBg, customAccent, setCustomAccent, customText,
                setCustomText, customTextMuted, setCustomTextMuted, handleSaveChanges,
                locationsView, setLocationsView, tenants, hText, setActiveTab,
                setShowTerminalModal, handleExportTenants, setAttentionOnlyFilter,
                attentionOnlyFilter, checkExpiryStatus, getExpiryCountdownText,
                setSelectedTenant, setEditingExpiryDate, setShowTenantDetailsModal,
                setActiveActionMenuId, activeActionMenuId, toggleTenantStatus,
                handleQuickRenew, handleRetryBilling, handleDeleteTenant,
                globalFeatures, setGlobalFeatures, setAuditLogs, filteredLogs
              }}
            />
          )}

          {['access', 'promocodes'].includes(activeTab) && (
            <AccessManager
              {...{
                t, theme, isLightTheme, activeTab, triggerToast, admins,
                setShowAddAdminModal, handleDeleteAdmin, handleEditAdminClick,
                handleResetPasswordClick, promoCodes, newPromo: newPromoData, setNewPromo: setNewPromoData,
                handleExportPromoCodes, showCreatePromoModal, setShowCreatePromoModal, saasPlans,
                selectedPromoCode, setSelectedPromoCode, showPromoDetailModal, setShowPromoDetailModal, handleTogglePromoStatus, generatePromoCode,
                handleAddPromoCode: handleCreatePromoCode, handleDeletePromoCode: (id: string) => { const promo = promoCodes.find(p => p.id === id); if (promo) handleDeletePromoCode(id, promo.code); }, promoFilterStatus,
                setPromoFilterStatus, promoSearchQuery, setPromoSearchQuery,
                hBg, hText, activeActionMenuId, setActiveActionMenuId,
                handleAddAdminSubmit, newAdminData, setNewAdminData, showAddAdminModal,
                handleEditAdminSubmit, editAdminData, setEditAdminData, showEditAdminModal,
                setShowEditAdminModal, handleResetPasswordSubmit, newPassword, setNewPassword,
                confirmPassword, setConfirmPassword, showResetPasswordModal, setShowResetPasswordModal,
                selectedAdmin, setSelectedAdmin, selectedAdminToEdit, setSelectedAdminToEdit,
                toggleAdminStatus, toggleTenantStatus, filteredAdmins
              }}
            />
          )}

          {['health', 'analytics', 'activity-log'].includes(activeTab) && (
            <SystemAnalytics
              {...{
                t, theme, isLightTheme, activeTab, triggerToast, logsList,
                logsSearch, setLogsSearch, logsFilter, setLogsFilter, logsPage,
                setLogsPage, handleClearLogs: async () => { await clearActivityLogs(); const logs = await getActivityLogs(); setLogsList(logs); }, tenants, fleet, admins,
                tickets, setActiveTab, clearActivityLogs, getActivityLogs, setLogsList
              }}
            />
          )}

          {activeTab === 'referrals' && (
            <ReferralsManager
              {...{
                t, theme, isLightTheme, activeTab, triggerToast, ambassadorsList: ambassadors,
                showAddAmbassadorModal,
                setShowAddAmbassadorModal, newAmbassadorData, setNewAmbassadorData,
                handleAddAmbassador, showEditAmbassadorBankModal: showEditBankModal, setShowEditAmbassadorBankModal: setShowEditBankModal,
                editingAmbassadorForBank: editBankTarget, setEditingAmbassadorForBank: setEditBankTarget, bankDetailsForm: editBankData,
                setBankDetailsForm: setEditBankData, handleUpdateBankDetails: handleSaveEditBank, showQrPosterModal: showQrModal,
                setShowQrPosterModal: setShowQrModal, selectedAmbassadorForQr: qrModalAmbassador, setSelectedAmbassadorForQr: setQrModalAmbassador,
                showPartnerDashboardPreviewModal: showPartnerViewModal, setShowPartnerDashboardPreviewModal: setShowPartnerViewModal,
                selectedAmbassadorForDashboard: partnerViewAmbassador, setSelectedAmbassadorForDashboard: setPartnerViewAmbassador,
                showEditAmbassadorProfileModal: showEditAmbassadorModal,
                setShowEditAmbassadorProfileModal: setShowEditAmbassadorModal, editingAmbassadorForProfile: editAmbassadorTarget,
                setEditingAmbassadorForProfile: setEditAmbassadorTarget, ambassadorProfileForm: editAmbassadorData, setAmbassadorProfileForm: setEditAmbassadorData,
                handleUpdateAmbassadorProfile: handleEditAmbassador, showAddReferredBusinessModal: showAddReferralModal,
                setShowAddReferredBusinessModal: setShowAddReferralModal, newReferredBusinessData: newReferralData,
                setNewReferredBusinessData: setNewReferralData, handleAddReferredBusiness: handleAddReferral, showPayoutProcessModal: showPayoutModal,
                setShowPayoutProcessModal: setShowPayoutModal, selectedPayoutTransaction: payoutTarget, setSelectedPayoutTransaction: setPayoutTarget,
                handleProcessPayoutSubmit: handleProcessPayout, referralsSubTab: referralSubTab,
                setReferralsSubTab: setReferralSubTab, activeActionMenuId, setActiveActionMenuId, hBg, hText,
                payoutAmount, setPayoutAmount, payoutNote, setPayoutNote, payoutHistory, handleExportPayoutHistory,
                ambassadorSearchQuery: ambassadorSearch, setAmbassadorSearchQuery: setAmbassadorSearch, ambassadorFilterStatus: ambassadorStatusFilter,
                setAmbassadorFilterStatus: setAmbassadorStatusFilter, referralConfig, setReferralConfig, handleExportReferrals,
                batchPayoutMode, setBatchPayoutMode, selectedAmbIds, setSelectedAmbIds,
                addReferralTarget, setAddReferralTarget, handleOpenEditBank, handleToggleAmbassadorStatus,
                generateReferralCode
              }}
            />
          )}

          {['support', 'payments'].includes(activeTab) && (
            <SupportManager
              {...{
                t, theme, isLightTheme, activeTab, triggerToast, tickets,
                selectedTicket, setSelectedTicket,
                supportReply: ticketReplyText, setSupportReply: setTicketReplyText, handleSendTicketReply: handleTicketReply,
                handleUpdateTicketStatus, stripeLinked, stripeSecretKeyInput,
                setStripeSecretKeyInput, stripeWebhookSecretInput, setStripeWebhookSecretInput,
                stripeLoading, showStripeModal, setShowStripeModal, handleLinkStripe,
                handleUnlinkStripe, activeActionMenuId, setActiveActionMenuId, hBg, hText,
                ticketFilterStatus, setTicketFilterStatus, ticketFilterType, setTicketFilterType
              }}
            />
          )}

          {activeTab === 'cms' && (
            <CmsManager
              {...{
                t, theme, isLightTheme, activeTab, cmsConfig, setCmsConfig,
                cmsSubTab, setCmsSubTab, triggerToast,
                hBg, hText, setAuditLogs, filteredLogs
              }}
            />
          )}
        </div>
      </div>
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
