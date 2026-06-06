'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'access' | 'health' | 'analytics' | 'payments' | 'settings' | 'support'>('overview');

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown filter states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [tierFilter, setTierFilter] = useState<'All' | 'Premium Plus' | 'Growth' | 'Standard'>('All');
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
    { id: 'TEN-8821', name: 'The Obsidian Room', location: 'New York', terminals: 12, plan: 'ACTIVE', revenue: '$342,500', status: 'ACTIVE', joined: '2024-03-12', tier: 'Premium Plus', region: 'North America - East' },
    { id: 'TEN-7734', name: 'Lumière Brasserie', location: 'London', terminals: 80, plan: 'ACTIVE', revenue: '$2,450,000', status: 'ACTIVE', joined: '2023-11-05', tier: 'Growth', region: 'Europe - West' },
    { id: 'TEN-5512', name: 'Cafe Zenith', location: 'Kobarid', terminals: 6, plan: 'SUSPENDED', revenue: '$28,000', status: 'SUSPENDED', joined: '2025-09-02', tier: 'Standard', region: 'Asia Pacific', billingFailed: true },
    { id: 'TEN-9021', name: 'Aman Resorts', location: 'Tokyo', terminals: 45, plan: 'ACTIVE', revenue: '$1,280,000', status: 'ACTIVE', joined: '2024-01-18', tier: 'Premium Plus', region: 'Asia Pacific' },
    { id: 'TEN-4581', name: 'Bouchon Bakery', location: 'Las Vegas', terminals: 8, plan: 'TRIAL', revenue: '$45,000', status: 'ACTIVE', joined: '2026-05-20', tier: 'Standard', region: 'North America - East' },
    { id: 'TEN-2195', name: 'Gaggan Anand', location: 'Bangkok', terminals: 14, plan: 'SUSPENDED', revenue: '$122,000', status: 'SUSPENDED', joined: '2025-02-15', tier: 'Growth', region: 'Asia Pacific' },
  ]);

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
          name: 'Standard Starter',
          monthlyPrice: 99,
          terminalsLimit: 3,
          storageLimitGB: 10,
          features: { aiConcierge: false, selfCheckout: true, analytics: false, offlineMode: false }
        },
        {
          id: 'plan-growth',
          name: 'Enterprise Growth',
          monthlyPrice: 299,
          terminalsLimit: 12,
          storageLimitGB: 100,
          features: { aiConcierge: true, selfCheckout: true, analytics: true, offlineMode: false }
        },
        {
          id: 'plan-premium',
          name: 'Premium Plus',
          monthlyPrice: 999,
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
    backupRetention: 10
  });

  // Form Fields
  const [newTenantData, setNewTenantData] = useState({ name: '', location: '', plan: 'TRIAL' as Tenant['plan'] });
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
    const created: Tenant = {
      id: `TEN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTenantData.name,
      location: newTenantData.location,
      terminals: 0,
      plan: newTenantData.plan,
      revenue: '$0',
      status: newTenantData.plan === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      joined: new Date().toISOString().split('T')[0],
      tier: 'Standard',
      region: 'North America - East'
    };
    setTenants(prev => [...prev, created]);
    setNewTenantData({ name: '', location: '', plan: 'TRIAL' });
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
    
    return matchesSearch && matchesStatus && matchesTier && matchesRegion;
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
    <div className={`flex w-full min-h-screen ${theme.bg} ${theme.text} font-sans antialiased overflow-x-hidden select-none`}>
            {/* LEFT SIDEBAR PANEL (GLOBAL CONSOLE CONTEXT) */}
      <aside className={`w-[280px] ${theme.sidebarBg} flex flex-col justify-between p-8 flex-shrink-0 z-20 border-r border-white/5`}>
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
            <button
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
            <button
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
            <button
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
            <button
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
            {/* Analytics */}
            <button
              onClick={() => { setActiveTab('analytics'); setSearchQuery(''); }}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'analytics'
                  ? `${theme.accentBg} ${theme.accentText} rounded-xl`
                  : `${theme.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">insights</span>
              <span>Analytics</span>
            </button>
            {/* Payments */}
            <button
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
            {/* Support Desk */}
            <button
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
            <button
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
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 font-sans border-t border-white/5 space-y-4">
          <button 
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
      <div className={`flex-grow flex flex-col min-h-screen relative ${theme.bg}`}>
        
        <header className={`h-[90px] border-b ${theme.border} flex items-center justify-between px-12 flex-shrink-0 bg-transparent sticky top-0 z-10 select-none backdrop-blur-md`}>
          <div className="relative select-none">
            <span className={`material-symbols-outlined absolute left-4 top-3 ${theme.textMutedDark} text-sm`}>search</span>
            <input
              type="text"
              placeholder="Search enterprise-wide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-[320px] bg-[#161513]/40 border ${theme.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${theme.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
            />
          </div>
          
          {/* Header controls and user context */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => triggerToast('System health logs clear. 0 concerns.', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${theme.border} hover:border-white/10 rounded-xl text-white transition-colors cursor-pointer select-none relative`}
            >
              <span className={`material-symbols-outlined text-lg text-amber-400`}>notifications</span>
              <span className="absolute top-3.5 right-3.5 w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
            </button>

            <button 
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
                        <button 
                          onClick={() => triggerToast('Switching to list representation...', 'info')}
                          className="px-3 py-1.5 rounded text-white/50 hover:text-white transition-colors cursor-pointer"
                        >
                          List View
                        </button>
                        <button className="px-3 py-1.5 bg-[#ffc53d] text-[#2c1a00] rounded font-bold transition-all cursor-pointer">
                          Map View
                        </button>
                      </div>
                    </div>

                    {/* Dark map container */}
                    <div className="relative w-full h-[320px] bg-[#0c0c0b] rounded-xl flex items-center justify-center border border-white/5 group shadow-inner">
                      {/* Ambient map dot overlay grid */}
                      <div className="absolute inset-0 bg-[radial-gradient(#ffe2ab/4_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-25"></div>

                      {/* Map Hotspots representing Locations */}
                      {/* Hotspot 1 - New York (Offline Alert) */}
                      <div className="absolute top-[48%] left-[28%] flex flex-col items-center group/dot cursor-pointer">
                        <div className="w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping absolute"></div>
                        <div className="w-3.5 h-3.5 bg-rose-500 rounded-full border border-black z-10"></div>
                        <span className="absolute bottom-5 bg-[#161513] text-[9.5px] text-rose-400 font-bold font-sans uppercase px-2.5 py-1 rounded border border-rose-500/20 shadow-md whitespace-nowrap z-20">New York • Offline</span>
                      </div>

                      {/* Hotspot 2 - Paris (Online Flagship) */}
                      <div className="absolute top-[38%] left-[48%] flex flex-col items-center group/dot cursor-pointer">
                        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse absolute"></div>
                        <div className="w-3 h-3 bg-amber-400 rounded-full border border-black z-10"></div>
                        <span className="absolute bottom-5 bg-[#161513] text-[9.5px] text-amber-400 font-bold font-sans uppercase px-2.5 py-1 rounded border border-amber-400/20 shadow-md whitespace-nowrap z-20">Paris Flagship • Online</span>
                      </div>

                      {/* Hotspot 3 - Tokyo (Online) */}
                      <div className="absolute top-[52%] left-[78%] flex flex-col items-center group/dot cursor-pointer">
                        <div className="w-2 h-2 bg-amber-400 rounded-full border border-black z-10"></div>
                        <span className="absolute bottom-4 bg-[#161513] text-[9px] text-[#A69984] font-bold font-sans uppercase px-2 py-0.5 rounded border border-white/5 shadow-md whitespace-nowrap z-20 scale-0 group-hover/dot:scale-100 transition-all">Tokyo Outpost</span>
                      </div>

                      {/* World Map Symbol Silhouette */}
                      <span className="material-symbols-outlined text-[100px] text-white/[0.03] group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none">public</span>
                    </div>

                    {/* Legend block */}
                    <div className="flex items-center gap-6 text-[10.5px] font-sans font-bold uppercase tracking-wider select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span className="text-white">Online Sites</span>
                        <span className="text-[#A69984]/65 ml-0.5 font-normal">38</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <span className="text-white">Maintenance</span>
                        <span className="text-[#A69984]/65 ml-0.5 font-normal">3</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="text-white">Critical Alert</span>
                        <span className="text-[#A69984]/65 ml-0.5 font-normal">1</span>
                      </div>
                    </div>
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

                    <button 
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
                          <div className="bg-[#ffc53d] h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>

                      {/* Cluster 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white">EU-West-2</span>
                          <span className="text-[#A69984]/65">Operational</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className="bg-[#ffc53d] h-full rounded-full" style={{ width: '100%' }}></div>
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
                      <button 
                        onClick={() => triggerToast('Successfully flushed redis & proxy caches.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Flush Cache
                      </button>
                      <button 
                        onClick={() => triggerToast('Triggered global SSH key rotations.', 'success')}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Rotate Keys
                      </button>
                      <button 
                        onClick={() => setShowTerminalModal(true)}
                        className="p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl transition-all cursor-pointer text-center font-bold"
                      >
                        Remote CMD
                      </button>
                      <button 
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
                <button 
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
                  <button
                    onClick={() => triggerToast('Exporting global tenants list...', 'success')}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">download</span>
                    Export
                  </button>
                  <button
                    onClick={() => setShowAddTenantModal(true)}
                    className={`px-5 py-2.5 ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    Onboard Tenant
                  </button>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Total Active Tenants */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">corporate_fare</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Total Active Tenants</span>
                  </div>
                  <div className="z-10 flex items-baseline gap-3">
                    <h3 className="font-serif text-5xl font-bold text-white tracking-wide">142</h3>
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
                <div className={`${theme.cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="absolute right-4 bottom-2 text-white/[0.02] select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[90px] leading-none">warning</span>
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Attention Required</span>
                  </div>
                  <div className="z-10">
                    <h3 className="font-serif text-5xl font-bold text-rose-500 tracking-wide">3</h3>
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
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value as any)}
                      className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-[#e5e2e1] font-bold py-2 px-4 pr-8 rounded-xl cursor-pointer focus:outline-none transition-colors"
                    >
                      <option value="All">Tier: All</option>
                      <option value="Premium Plus">Tier: Premium Plus</option>
                      <option value="Growth">Tier: Growth</option>
                      <option value="Standard">Tier: Standard</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-xs text-[#A69984]/65">keyboard_arrow_down</span>
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative">
                    <select
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
                            {t.tier === 'Premium Plus' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-[#ffc53d]/30 bg-[#ffc53d]/5 text-[#ffc53d] font-bold">
                                <span className="material-symbols-outlined text-xs">star</span>
                                Premium Plus
                              </span>
                            ) : t.tier === 'Growth' ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold">
                                Growth
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-semibold">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-[#e5e2e1]/80 text-[12px]">{t.region || 'North America - East'}</td>
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
                          <td className="py-4 px-4 text-right space-x-2">
                            <button 
                              onClick={() => toggleTenantStatus(t.id, t.name, t.status)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                t.status === 'ACTIVE' 
                                  ? 'border-rose-500/10 text-rose-400 hover:bg-rose-500/10' 
                                  : 'border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => triggerToast(`Requesting analytics details for ${t.name}...`, 'info')}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#A69984] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Details
                            </button>
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
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ffc53d] text-[#2c1a00] font-bold transition-colors cursor-pointer">
                      1
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      2
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      3
                    </button>
                    <span className="px-2">...</span>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer">
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
                
                <button
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
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse"></span>
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
                            <button 
                              onClick={() => triggerToast(`Sending remote diagnostic ping payload to ${f.name} (${f.ip})...`, 'info')}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer mr-2"
                            >
                              Ping Test
                            </button>
                            <button 
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

          {/* TAB: ANALYTICS (Analytics & Performance Metrics) */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="font-serif text-[42px] font-medium text-white tracking-wide leading-none">
                    Global Analytics
                  </h1>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold mt-2">
                    Platform-wide performance and revenue intelligence.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => triggerToast('Opening time range selector...', 'info')}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">calendar_today</span>
                    Last 30 Days
                    <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                  </button>
                  <button
                    onClick={() => triggerToast('Opening advanced analytics filters...', 'info')}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filters
                  </button>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                {/* Card 1: Total Processed Volume */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Total Processed Vol</span>
                    <span className="material-symbols-outlined text-emerald-400 text-lg">trending_up</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">$2.4B</h3>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">+14.2% vs last month</p>
                  </div>
                </div>

                {/* Card 2: Active Tenants */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">Active Tenants</span>
                    <span className="material-symbols-outlined text-amber-400 text-lg">business</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white tracking-wide">8,420</h3>
                    <p className="text-[10px] text-amber-400 font-bold mt-1">+312 new this month</p>
                  </div>
                </div>

                {/* Card 3: System Latency */}
                <div className={`${theme.cardBg} border rounded-2xl p-6 flex flex-col justify-between h-[135px] shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <span className="font-sans font-bold text-[10px] text-[#A69984]/70 uppercase tracking-widest">System Latency (Avg)</span>
                    <span className="material-symbols-outlined text-emerald-400 text-lg">bolt</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-emerald-400 tracking-wide">42ms</h3>
                    <p className="text-[10px] text-[#A69984]/50 font-medium mt-1">Stable across all regions</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Chart 1: Revenue Trend by Region (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden`}>
                    <div className="flex justify-between items-center select-none">
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Revenue Trend by Region</h3>
                      <span className="text-[10.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Millions (USD)</span>
                    </div>

                    {/* Chart graphics */}
                    <div className="h-[280px] w-full flex flex-col justify-between pt-4 select-none">
                      {/* Grid Lines Overlay */}
                      <div className="relative flex-grow flex flex-col justify-between border-b border-white/10 pb-2">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          <div className="border-t border-white/[0.03] w-full h-0"></div>
                          <div className="border-t border-white/[0.03] w-full h-0"></div>
                          <div className="border-t border-white/[0.03] w-full h-0"></div>
                          <div className="border-t border-white/[0.03] w-full h-0"></div>
                        </div>

                        {/* Bars Container */}
                        <div className="absolute inset-x-8 bottom-0 top-4 flex items-end justify-around">
                          {/* North America */}
                          <div className="flex flex-col items-center gap-3 w-16 group cursor-pointer h-full justify-end">
                            <span className="text-[10px] text-[#ffc53d] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">$1,200M</span>
                            <div className="w-8 bg-gradient-to-t from-[#ffc53d]/40 to-[#ffc53d] rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110" style={{ height: '80%' }}></div>
                            <span className="text-[9.5px] text-[#A69984] font-bold uppercase tracking-widest mt-1">NA</span>
                          </div>

                          {/* Europe */}
                          <div className="flex flex-col items-center gap-3 w-16 group cursor-pointer h-full justify-end">
                            <span className="text-[10px] text-[#ffc53d] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">$680M</span>
                            <div className="w-8 bg-gradient-to-t from-[#ffc53d]/40 to-[#ffc53d] rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110" style={{ height: '45%' }}></div>
                            <span className="text-[9.5px] text-[#A69984] font-bold uppercase tracking-widest mt-1">EU</span>
                          </div>

                          {/* Asia-Pacific */}
                          <div className="flex flex-col items-center gap-3 w-16 group cursor-pointer h-full justify-end">
                            <span className="text-[10px] text-[#ffc53d] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">$420M</span>
                            <div className="w-8 bg-gradient-to-t from-[#ffc53d]/40 to-[#ffc53d] rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110" style={{ height: '28%' }}></div>
                            <span className="text-[9.5px] text-[#A69984] font-bold uppercase tracking-widest mt-1">APAC</span>
                          </div>

                          {/* Latin America */}
                          <div className="flex flex-col items-center gap-3 w-16 group cursor-pointer h-full justify-end">
                            <span className="text-[10px] text-[#ffc53d] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">$100M</span>
                            <div className="w-8 bg-gradient-to-t from-[#ffc53d]/40 to-[#ffc53d] rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110" style={{ height: '8%' }}></div>
                            <span className="text-[9.5px] text-[#A69984] font-bold uppercase tracking-widest mt-1">LATAM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Plan Distribution (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${theme.cardBg} border rounded-2xl p-8 shadow-xl space-y-6 h-[378px] flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-center select-none mb-6">
                        <h3 className="font-serif text-base text-white font-bold tracking-wide">Plan Distribution</h3>
                        <span className="text-[10px] text-[#ffe2ab] font-sans font-bold uppercase tracking-wider">Active</span>
                      </div>

                      {/* Distribution breakdown progress bars */}
                      <div className="space-y-6 font-sans">
                        {/* Enterprise */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-white">Enterprise Tier</span>
                            <span className="text-amber-400">45%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>

                        {/* Growth */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-white">Growth Tier</span>
                            <span className="text-emerald-400">35%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '35%' }}></div>
                          </div>
                        </div>

                        {/* Starter */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-white">Starter Tier</span>
                            <span className="text-sky-400">20%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-sky-400 h-full rounded-full" style={{ width: '20%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-[#A69984]/50 font-bold uppercase tracking-widest pt-4 border-t border-white/5 select-none">
                      Total Tenants Analyzed: 8,420
                    </div>
                  </div>
                </div>

              </div>

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
                <button
                  onClick={() => triggerToast('Compiling platform financial statements download...', 'success')}
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
                      <button 
                        onClick={() => setShowPlanEditorModal(true)}
                        className={`bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md cursor-pointer`}
                      >
                        Manage Plans
                      </button>
                      <button 
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
                        <button 
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

                    <button 
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
                            Enterprise Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>$2,499.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 text-[#A69984]/50 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Upcoming
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button 
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
                            Enterprise Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>$450.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button 
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
                            Standard Starter
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>$1,199.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Failed
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button 
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
                            Enterprise Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>$2,499.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button 
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
                            Enterprise Growth
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold text-white`}>$2,499.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button 
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
                
                <button
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
                    
                    <button 
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
                    
                    <button 
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
                            <button 
                              onClick={() => handleOpenResetModal(a)}
                              className="text-[10px] border border-white/10 hover:border-white/20 text-[#A69984] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Password
                            </button>
                            <button 
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
                        <button 
                          onClick={() => {
                            setGlobalFeatures(prev => ({ ...prev, aiConcierge: !prev.aiConcierge }));
                            triggerToast(`AI Concierge feature status changed.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${globalFeatures.aiConcierge ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-[#1c1200] rounded-full shadow-md transform duration-300 ${globalFeatures.aiConcierge ? 'translate-x-6 bg-white' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Guest Self-Checkout Toggle */}
                      <div className="flex justify-between items-center p-4 bg-[#0e0e0d]/40 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-white font-bold text-xs">Guest Self-Checkout Terminal Authorization</h4>
                          <p className="text-[10px] text-[#A69984]/60 mt-1">Allow guests to check out directly from their mobile device digital receipts without cashier station interactions.</p>
                        </div>
                        <button 
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
                        <button 
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
                      <button 
                        onClick={() => triggerToast('Generating encrypted SQL schema & seed snapshot...', 'info')}
                        className="px-4 py-2.5 bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download SQL Snapshot
                      </button>
                      <button 
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
                      <button 
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
                  <button 
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
                <button 
                  onClick={() => setTicketFilterStatus('ALL')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'ALL' ? 'bg-[#ffc53d]/5 border-[#ffc53d]/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">All Support Inquiries</span>
                  <h4 className="text-2xl font-bold mt-1.5">{tickets.length} Tickets</h4>
                </button>
                {/* Open */}
                <button 
                  onClick={() => setTicketFilterStatus('OPEN')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'OPEN' ? 'bg-rose-500/5 border-rose-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">Open (Unresolved)</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  </div>
                  <h4 className="text-2xl font-bold text-rose-400 mt-1.5">{tickets.filter(t => t.status === 'OPEN').length} Tickets</h4>
                </button>
                {/* In Progress */}
                <button 
                  onClick={() => setTicketFilterStatus('IN_PROGRESS')}
                  className={`border rounded-2xl p-5 text-left transition-all ${
                    ticketFilterStatus === 'IN_PROGRESS' ? 'bg-amber-500/5 border-amber-500/30 text-white' : `${theme.cardBg} ${theme.cardHover}`
                  }`}
                >
                  <span className="text-[9.5px] text-[#A69984]/50 font-bold uppercase tracking-wider">In Investigation</span>
                  <h4 className="text-2xl font-bold text-amber-400 mt-1.5">{tickets.filter(t => t.status === 'IN_PROGRESS').length} Tickets</h4>
                </button>
                {/* Resolved */}
                <button 
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

                                <button 
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
                                <button
                                  type="button"
                                  onClick={() => handleTicketStatusChange(selectedTicket.id, 'IN_PROGRESS')}
                                  className="px-4 py-3 border border-white/10 hover:border-white/20 text-[#A69984] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                >
                                  Investigate
                                </button>
                              )}
                              <button
                                type="submit"
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

        </div>

      </div>

      {/* MODAL 1: ADD NEW BUSINESS TENANT */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[480px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button 
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
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData(prev => ({ ...prev, plan: e.target.value as Tenant['plan'] }))}
                  className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ffc53d]/45"
                >
                  <option value="TRIAL">Trial Package</option>
                  <option value="ACTIVE">Enterprise Growth</option>
                  <option value="SUSPENDED">Suspended / Deactivated</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddTenantModal(false)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                >
                  Create Tenant
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
            
            <button 
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
                <button 
                  type="button" 
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
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
      {showResetPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
          <div className="bg-[#161513] border border-white/10 w-full max-w-[440px] p-8 rounded-2xl shadow-2xl relative font-sans">
            
            <button 
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
                    placeholder="••••••••"
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
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffc53d]/45"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => { setShowResetPasswordModal(false); setSelectedAdmin(null); }}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
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
            
            <button 
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
                  <button 
                    type="button" 
                    onClick={() => setEditingPlan(null)}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-white/15 text-[#A69984] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Back to Plans
                  </button>
                  <button 
                    type="submit" 
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
                            <button 
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
                  <button 
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
              <button 
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
