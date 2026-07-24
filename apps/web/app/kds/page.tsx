'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';
import { apiRequest } from '@/utils/api';
import { kitchenChime } from '@/utils/kitchenChime';

interface OrderItemOption {
  text: string;
  type?: 'default' | 'allergy' | 'highlight';
}

interface OrderItem {
  name: string;
  qty: number;
  price?: number;
  options?: OrderItemOption[];
  notes?: string;
}

interface KdsTicket {
  id: string;
  tableNumber: string;
  isVip?: boolean;
  onHold?: boolean;
  secondsElapsed: number;
  type: 'dine-in' | 'takeaway' | 'delivery';
  status: 'pending' | 'cooking' | 'complete' | 'rejected';
  items: OrderItem[];
}

const initialTickets: KdsTicket[] = [
  {
    id: 'ticket-1',
    tableNumber: 'Table 14',
    secondsElapsed: 1122, // 18:42
    type: 'dine-in',
    status: 'pending',
    items: [
      {
        name: 'Filet Mignon',
        qty: 2,
        price: 58.00,
        options: [
          { text: 'Medium Rare', type: 'default' },
          { text: 'ALLERGY: NO GARLIC', type: 'allergy' }
        ],
        notes: 'Please prepare medium-rare, closer to rare.'
      },
      {
        name: 'Scallop Risotto',
        qty: 1,
        price: 42.00
      }
    ]
  },
  {
    id: 'ticket-2',
    tableNumber: 'Table 03',
    secondsElapsed: 735, // 12:15
    type: 'dine-in',
    status: 'pending',
    items: [
      {
        name: 'Wagyu Burger',
        qty: 1,
        price: 38.00,
        options: [
          { text: 'Medium', type: 'default' },
          { text: 'NO ONIONS', type: 'highlight' },
          { text: 'Add Truffle Fries', type: 'default' }
        ],
        notes: 'No salt on the burger patty if possible.'
      },
      {
        name: 'Caesar Salad',
        qty: 1,
        price: 18.00,
        options: [
          { text: 'Dressing on side', type: 'default' }
        ]
      }
    ]
  },
  {
    id: 'ticket-3',
    tableNumber: 'Table 22',
    isVip: true,
    secondsElapsed: 270, // 04:30
    type: 'dine-in',
    status: 'pending',
    items: [
      {
        name: 'Tasting Menu A',
        qty: 3,
        price: 120.00,
        options: [
          { text: 'Course 1 Fire', type: 'default' }
        ]
      }
    ]
  },
  {
    id: 'ticket-4',
    tableNumber: 'Table 08',
    onHold: true,
    secondsElapsed: 45, // 00:45
    type: 'dine-in',
    status: 'pending',
    items: [
      {
        name: 'Duck Breast',
        qty: 1,
        price: 45.00
      }
    ]
  },
  // Active prep items to populate KDS counts
  {
    id: 'ticket-5',
    tableNumber: 'Table 01',
    secondsElapsed: 550,
    type: 'dine-in',
    status: 'cooking',
    items: [
      { name: 'Lobster Thermidor', qty: 1, price: 85.00 },
      { name: 'Truffle Burrata Salad', qty: 2, price: 26.00 }
    ]
  },
  {
    id: 'ticket-6',
    tableNumber: 'Table 10',
    secondsElapsed: 300,
    type: 'delivery',
    status: 'cooking',
    items: [
      { name: 'Wagyu Burger', qty: 2, price: 38.00, options: [{ text: 'Well Done', type: 'default' }] }
    ]
  },
  {
    id: 'ticket-7',
    tableNumber: 'Table 02',
    secondsElapsed: 1200,
    type: 'dine-in',
    status: 'complete',
    items: [
      { name: 'Chocolate Soufflé', qty: 2, price: 18.00 }
    ]
  },
  {
    id: 'ticket-8',
    tableNumber: 'Table 11',
    secondsElapsed: 650,
    type: 'takeaway',
    status: 'rejected',
    items: [
      { name: 'Beluga Caviar & Oysters', qty: 1, price: 95.00 }
    ]
  }
];

// Helper to map DB orders to KdsTicket format
const mapDbOrderToKdsTicket = (o: any): KdsTicket => {
  const createdTime = new Date(o.createdAt).getTime();
  const nowTime = new Date().getTime();
  const secondsElapsed = Math.max(0, Math.floor((nowTime - createdTime) / 1000));
  
  let resolvedDiningType: 'dine-in' | 'takeaway' | 'delivery' = 'dine-in';
  if (o.customerType === 'TAKE_OUT') resolvedDiningType = 'takeaway';
  else if (o.customerType === 'DELIVERY') resolvedDiningType = 'delivery';

  let resolvedStatus: 'pending' | 'cooking' | 'complete' | 'rejected' = 'pending';
  if (o.status === 'COOKING') resolvedStatus = 'cooking';
  else if (o.status === 'READY' || o.status === 'SERVED') resolvedStatus = 'complete';
  else if (o.status === 'CANCELLED') resolvedStatus = 'rejected';

  const mappedItems = o.items.map((i: any) => ({
    name: i.name,
    qty: i.quantity,
    price: i.price,
    notes: i.notes || undefined,
    options: []
  }));

  return {
    id: o.id,
    tableNumber: o.tableName || (o.customerType === 'TAKE_OUT' ? 'Walk-in Takeaway' : o.customerType === 'DELIVERY' ? 'Delivery' : `Table ${o.orderNumber}`),
    isVip: o.total >= 80,
    secondsElapsed,
    type: resolvedDiningType,
    status: resolvedStatus,
    items: mappedItems
  };
};

export default function KdsPage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [tickets, setTickets] = useState<KdsTicket[]>([]);
  const [diningFilter, setDiningFilter] = useState<'all' | 'dine-in' | 'takeaway' | 'delivery'>('all');
  const [statusTab, setStatusTab] = useState<'pending' | 'cooking' | 'complete' | 'rejected'>('pending');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const prevTicketCountRef = React.useRef(0);

  const unlockAudio = () => {
    const success = kitchenChime.initAudio();
    setAudioUnlocked(success);
    return success;
  };

  const handleTestChime = () => {
    unlockAudio();
    kitchenChime.playNewOrderChime();
    triggerToast('🔔 Kitchen Bell Chime (Ding-Dong!) Sound Test');
  };

  // Sync active orders from backend with offline fallback
  const syncActiveOrders = async () => {
    try {
      const res = await apiRequest<any[]>('/api/orders');
      if (res.success && res.data) {
        const dbTickets = res.data.map(mapDbOrderToKdsTicket);
        
        // Check if new tickets arrived
        if (dbTickets.length > prevTicketCountRef.current && prevTicketCountRef.current > 0) {
          kitchenChime.playNewOrderChime();
          const newest = dbTickets[0];
          triggerToast(`🔔 NEW ORDER: ${newest.tableNumber}`);
        }
        prevTicketCountRef.current = dbTickets.length;
        setTickets(dbTickets);
        localStorage.setItem('dinepos_shared_tickets', JSON.stringify(dbTickets));
      } else {
        const sharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
        if (sharedTicketsStr) {
          try {
            setTickets(JSON.parse(sharedTicketsStr));
          } catch (e) {}
        } else if (isDemoTenant()) {
          setTickets(initialTickets);
        } else {
          setTickets([]);
        }
      }
    } catch (err) {
      console.error('[KDS] Failed syncing active orders:', err);
      const sharedTicketsStr = localStorage.getItem('dinepos_shared_tickets');
      if (sharedTicketsStr) {
        try {
          setTickets(JSON.parse(sharedTicketsStr));
        } catch (e) {}
      } else if (isDemoTenant()) {
        setTickets(initialTickets);
      } else {
        setTickets([]);
      }
    }
  };

  // Load tickets on mount and set up accelerated polling interval (3 seconds) + BroadcastChannel
  useEffect(() => {
    syncActiveOrders();
    const pollInterval = setInterval(syncActiveOrders, 3000);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('dinepos_kds_realtime');
        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_ORDER_DISPATCH') {
            console.log('[KDS] Real-time order dispatch received:', event.data);
            syncActiveOrders();
            kitchenChime.playNewOrderChime();
            triggerToast(`🔔 NEW ORDER DISPATCH: ${event.data.tableNumber || 'New Ticket'}`);
          }
        };
      }
    } catch (e) {
      console.warn('[KDS] BroadcastChannel init error:', e);
    }

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
    };
  }, []);

  // Listen to StorageEvent updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_shared_tickets' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.length > tickets.length && tickets.length > 0) {
            kitchenChime.playNewOrderChime();
            triggerToast('🔔 NEW ORDER RECEIVED!');
          }
          setTickets(parsed);
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tickets.length]);

  // Real-time elapsed clock timers (kept in-memory to reduce localStorage write churn)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prev =>
        prev.map(t => {
          if ((t.status === 'pending' || t.status === 'cooking') && !t.onHold) {
            return { ...t, secondsElapsed: t.secondsElapsed + 1 };
          }
          return t;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleStartCooking = async (id: string, tableNumber: string) => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: 'cooking' as const } : t));
      localStorage.setItem('dinepos_shared_tickets', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`${tableNumber} order moved to Cooking!`);

    try {
      await apiRequest(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COOKING' })
      });
    } catch (err) {
      console.error('[KDS] Failed updating status on server:', err);
    }
  };

  const handleCompleteOrder = async (id: string, tableNumber: string) => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: 'complete' as const } : t));
      localStorage.setItem('dinepos_shared_tickets', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`${tableNumber} order marked Ready!`);

    try {
      await apiRequest(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'READY' })
      });
    } catch (err) {
      console.error('[KDS] Failed updating status on server:', err);
    }
  };

  const handleRejectOrder = async (id: string, tableNumber: string) => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: 'rejected' as const } : t));
      localStorage.setItem('dinepos_shared_tickets', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`${tableNumber} order rejected.`);

    try {
      await apiRequest(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' })
      });
    } catch (err) {
      console.error('[KDS] Failed updating status on server:', err);
    }
  };

  const handleRestoreOrder = async (id: string, tableNumber: string) => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: 'pending' as const } : t));
      localStorage.setItem('dinepos_shared_tickets', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`${tableNumber} order restored.`);

    try {
      await apiRequest(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PENDING' })
      });
    } catch (err) {
      console.error('[KDS] Failed updating status on server:', err);
    }
  };

  const handleBumpOrder = async (id: string, tableNumber: string) => {
    setTickets(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('dinepos_shared_tickets', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`${tableNumber} ticket archived.`);

    try {
      await apiRequest(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SERVED' })
      });
    } catch (err) {
      console.error('[KDS] Failed updating status on server:', err);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (totalSeconds: number) => {
    if (totalSeconds < 600) return 'text-[#10b981]'; // <10m
    if (totalSeconds < 900) return 'text-[#fb923c]'; // 10-15m
    return 'text-[#ef4444]'; // 15m+
  };

  // Pre-calculate tab counts in a single pass to avoid multiple filter passes
  const tabCounts = useMemo(() => {
    const counts = { pending: 0, cooking: 0, complete: 0, rejected: 0 };
    tickets.forEach(t => {
      if (t.status in counts) {
        counts[t.status]++;
      }
    });
    return counts;
  }, [tickets]);

  // Memoize filtered active tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesStatus = t.status === statusTab;
      const matchesDining = diningFilter === 'all' || t.type === diningFilter;
      return matchesStatus && matchesDining;
    });
  }, [tickets, statusTab, diningFilter]);

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans overflow-hidden antialiased select-none relative">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0a0a09] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-30 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0 h-full ${
        sidebarCollapsed 
          ? 'w-0 lg:w-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px] opacity-100'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-8 pb-4">
            <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-2xl tracking-wide select-none block hover:opacity-85 transition-opacity mb-1.5">
              DinePosAi
            </Link>
            <div className="font-sans font-bold text-[9px] text-[#A69984]/50 uppercase tracking-[0.2em] select-none">
              Main Dining Room
            </div>
          </div>
          
          {/* Navigation Options - Kitchen KDS Outline Capsule selection box */}
          <nav className="px-5 space-y-2.5 mt-8">
            <button 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white transition-all duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab]">flatware</span>
              Kitchen KDS
            </button>

            <Link 
              href="/menu" 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/85 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">menu_book</span>
              Digital Menu
            </Link>
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="px-5 pb-8 space-y-2">
          <Link
            href="/kds/settings"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all font-sans font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">settings</span>
            Settings
          </Link>
          <Link
            href="/login?logout=true"
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all font-sans font-semibold text-xs w-full text-left uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </Link>
        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* MAIN KITCHEN CONSOLE */}
      <main className="flex-1 flex flex-col h-full bg-[#11100e] relative overflow-hidden">
                {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-10 py-5 sm:py-7 flex-shrink-0 bg-[#0e0e0d] border-b border-white/5 sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <div>
              <h1 className="font-serif text-xl sm:text-[28px] font-bold text-[#ffe2ab] tracking-wide leading-none">
                Active Kitchen Feed
              </h1>
              <p className="font-sans text-[9px] text-[#A69984]/50 font-bold uppercase tracking-[0.15em] mt-1.5 sm:mt-2.5">
                • STATION: GRILL & SAUTÉ
              </p>
            </div>
          </div>
          
          {/* Audio Chime Controls & Legend Badges Capsule Container */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestChime}
              className="px-3.5 py-1.5 rounded-full bg-[#ffe2ab]/10 border border-[#ffe2ab]/30 text-[#ffe2ab] hover:bg-[#ffe2ab]/20 font-sans text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Test Kitchen Bell Chime Sound"
            >
              <span className="material-symbols-outlined text-[13px] text-[#ffe2ab]">notifications_active</span>
              <span>{audioUnlocked ? 'Test Chime' : 'Enable Sound'}</span>
            </button>

            <div className="hidden md:flex bg-[#161513] border border-white/5 rounded-full px-4 py-2 gap-3.5 items-center text-[10px] font-sans font-bold text-[#A69984]/75 tracking-wider shadow-inner">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                &lt;10m
              </span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c]"></span>
                10-15m
              </span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                15m+
              </span>
            </div>
          </div>
        </header>

        {/* Filter Toolbar Area */}
        <div className="px-4 sm:px-10 pt-6 sm:pt-8 pb-3 flex flex-col gap-4 sm:gap-6 select-none flex-shrink-0">
          
          {/* Row 1: Segmented controls for Dining filters (premium capsule design) */}
          <div className="flex bg-[#161513]/90 border border-white/5 rounded-full p-1 gap-1 self-start shadow-lg">
            <button 
              onClick={() => setDiningFilter('all')}
              className={`px-5 py-2 rounded-full font-sans text-[10.5px] uppercase tracking-widest font-black transition-all duration-300 cursor-pointer whitespace-nowrap ${
                diningFilter === 'all' 
                  ? 'bg-[#ffe2ab] text-[#402d00] shadow-[0_2px_8px_rgba(255,226,171,0.15)]' 
                  : 'text-[#A69984]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              All Orders
            </button>
            <button 
              onClick={() => setDiningFilter('dine-in')}
              className={`px-5 py-2 rounded-full font-sans text-[10.5px] uppercase tracking-widest font-black transition-all duration-300 cursor-pointer whitespace-nowrap ${
                diningFilter === 'dine-in' 
                  ? 'bg-[#ffe2ab] text-[#402d00] shadow-[0_2px_8px_rgba(255,226,171,0.15)]' 
                  : 'text-[#A69984]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Dine-in
            </button>
            <button 
              onClick={() => setDiningFilter('takeaway')}
              className={`px-5 py-2 rounded-full font-sans text-[10.5px] uppercase tracking-widest font-black transition-all duration-300 cursor-pointer whitespace-nowrap ${
                diningFilter === 'takeaway' 
                  ? 'bg-[#ffe2ab] text-[#402d00] shadow-[0_2px_8px_rgba(255,226,171,0.15)]' 
                  : 'text-[#A69984]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Takeaway
            </button>
            <button 
              onClick={() => setDiningFilter('delivery')}
              className={`px-5 py-2 rounded-full font-sans text-[10.5px] uppercase tracking-widest font-black transition-all duration-300 cursor-pointer whitespace-nowrap ${
                diningFilter === 'delivery' 
                  ? 'bg-[#ffe2ab] text-[#402d00] shadow-[0_2px_8px_rgba(255,226,171,0.15)]' 
                  : 'text-[#A69984]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Delivery
            </button>
          </div>

          {/* Row 2: Status tabs selection list with gold highlight line and dynamic count pills */}
          <div className="flex gap-10 border-b border-white/5 text-xs font-sans font-bold uppercase tracking-wider select-none">
            {(['pending', 'cooking', 'complete', 'rejected'] as const).map(tab => {
              const isActive = statusTab === tab;
              const count = tabCounts[tab];
              
              // Define colored badges based on state
              const badgeColors = {
                pending: isActive 
                  ? 'bg-[#f59e0b]/15 text-[#fba81f] border border-[#f59e0b]/35 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[#f59e0b]/5 text-[#f59e0b]/50 border border-[#f59e0b]/10',
                cooking: isActive 
                  ? 'bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/35 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                  : 'bg-[#3b82f6]/5 text-[#3b82f6]/50 border border-[#3b82f6]/10',
                complete: isActive 
                  ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-[#10b981]/5 text-[#10b981]/50 border border-[#10b981]/10',
                rejected: isActive 
                  ? 'bg-[#f43f5e]/15 text-[#f87171] border border-[#f43f5e]/35 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'bg-[#f43f5e]/5 text-[#f43f5e]/50 border border-[#f43f5e]/10',
              };

              return (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`pb-4 transition-all duration-300 relative flex items-center gap-3 cursor-pointer group ${
                    isActive ? 'text-[#ffe2ab]' : 'text-[#A69984]/70 hover:text-white'
                  }`}
                >
                  <span className={`tracking-widest ${isActive ? 'translate-y-[-1px]' : 'group-hover:translate-y-[-1px]'} transition-transform duration-300`}>
                    {tab}
                  </span>
                  
                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-normal transition-all duration-300 ${badgeColors[tab]}`}>
                    {count}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ffe2ab] to-[#e6c792] shadow-[0_-2px_10px_rgba(255,226,171,0.6)] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Order Card Grid */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-12 pb-32 pt-6">
          {filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {filteredTickets.map(ticket => {
                const isOver15m = ticket.secondsElapsed >= 900;
                
                // Card header titles and timer coloring
                let tableHeaderColor = 'text-[#ffe2ab]';
                if (ticket.status === 'pending') {
                  if (ticket.id === 'ticket-1') tableHeaderColor = 'text-[#f87171]'; // Red title for Table 14
                  else if (ticket.id === 'ticket-2') tableHeaderColor = 'text-[#fb923c]'; // Orange title for Table 03
                  else if (ticket.id === 'ticket-3') tableHeaderColor = 'text-white'; // White title for Table 22
                  else if (ticket.id === 'ticket-4') tableHeaderColor = 'text-[#A69984]/80'; // Muted title for hold
                }

                return (
                  <div
                    key={ticket.id}
                    className={`bg-gradient-to-b from-[#181716] to-[#0e0e0d] border rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                      ticket.onHold && ticket.status === 'pending'
                        ? 'border-white/5 opacity-40 bg-[#12110f]/80'
                        : isOver15m && ticket.status === 'pending'
                          ? 'border-l-4 border-l-[#ef4444] border-t-white/[0.05] border-r-white/[0.05] border-b-white/[0.05] shadow-[0_4px_24px_rgba(239,68,68,0.08)]'
                          : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    
                    {/* Header Details */}
                    <div>
                      <div className="flex justify-between items-center mb-6 select-none">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-serif text-lg font-bold tracking-wide ${tableHeaderColor}`}>
                            {ticket.tableNumber}
                          </h3>
                          {ticket.isVip && (
                            <span className="bg-[#ffe2ab] text-[#402d00] font-sans font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                              VIP
                            </span>
                          )}
                          {ticket.onHold && ticket.status === 'pending' && (
                            <span className="bg-[#A69984]/15 border border-[#A69984]/20 text-[#A69984]/70 font-sans font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                              ON HOLD
                            </span>
                          )}
                          {ticket.type === 'dine-in' && (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px] font-bold">restaurant</span>
                              Dine-in
                            </span>
                          )}
                          {ticket.type === 'takeaway' && (
                            <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 font-sans font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px] font-bold">local_mall</span>
                              Takeaway
                            </span>
                          )}
                          {ticket.type === 'delivery' && (
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-sans font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px] font-bold">moped</span>
                              Delivery
                            </span>
                          )}
                        </div>
                        
                        {/* Clock icon and legible timer */}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans font-bold font-mono border ${
                          ticket.secondsElapsed >= 900
                            ? 'text-[#f87171] bg-[#f87171]/5 border-[#f87171]/20'
                            : ticket.secondsElapsed >= 600
                              ? 'text-[#fb923c] bg-[#fb923c]/5 border-[#fb923c]/20'
                              : 'text-[#34d399] bg-[#34d399]/5 border-[#34d399]/20'
                        }`}>
                          <span className="material-symbols-outlined text-[13px] leading-none">
                            schedule
                          </span>
                          <span>
                            {formatTime(ticket.secondsElapsed)}
                          </span>
                        </div>
                      </div>

                      {/* Items lists (Large, clearly visible typography) */}
                      <ul className="space-y-5">
                        {ticket.items.map((item, idx) => (
                          <li key={idx} className="font-sans">
                            <div className="text-[14px] font-bold text-white tracking-wide flex items-center">
                              <span className="text-[#ffe2ab] font-mono font-bold mr-2 text-[14px]">{item.qty}x</span>
                              <span>{item.name}</span>
                            </div>
                            
                            {/* Option Details */}
                            {item.options && item.options.length > 0 && (
                              <ul className="mt-2 space-y-1.5 pl-3 border-l border-white/5">
                                {item.options.map((opt, optIdx) => {
                                  if (opt.type === 'allergy') {
                                    return (
                                      <li key={optIdx} className="text-[10.5px] text-[#f87171] font-sans font-bold uppercase tracking-wider bg-[#f87171]/10 border border-[#f87171]/20 px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                                        {opt.text}
                                      </li>
                                    );
                                  }
                                  if (opt.type === 'highlight') {
                                    return (
                                      <li key={optIdx} className="text-[10.5px] text-[#fb923c] font-sans font-bold uppercase tracking-wider bg-[#fb923c]/10 border border-[#fb923c]/20 px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c]"></span>
                                        {opt.text}
                                      </li>
                                    );
                                  }
                                  return (
                                    <li key={optIdx} className="text-[11.5px] text-[#A69984] font-sans font-medium flex items-center gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-[#A69984]/30"></span>
                                      {opt.text}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            {/* Item Chef Notes */}
                            {item.notes && (
                              <div className="mt-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-3">
                                <p className="text-[9.5px] text-[#ffe2ab]/90 font-sans font-bold uppercase tracking-wider flex items-center gap-1 select-none">
                                  <span className="material-symbols-outlined text-[13px] leading-none">sticky_note_2</span>
                                  Chef Note
                                </p>
                                <p className="text-[11.5px] text-[#d4c5ab]/90 italic mt-1 leading-normal font-sans">
                                  "{item.notes}"
                                </p>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Actions buttons styled matching mockup */}
                    <div className="mt-8 border-t border-white/5 pt-5">
                      {ticket.status === 'pending' && (
                        <div className="flex gap-3">
                          {ticket.id === 'ticket-1' ? (
                            <button 
                              onClick={() => handleStartCooking(ticket.id, ticket.tableNumber)}
                              className="flex-1 py-3 bg-gradient-to-r from-[#ef4444]/10 to-[#ef4444]/5 hover:from-[#ef4444]/15 hover:to-[#ef4444]/10 border border-[#ef4444]/25 hover:border-[#ef4444]/40 text-[#f87171] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                            >
                              Initialize Cooking
                            </button>
                          ) : ticket.onHold ? (
                            <button 
                              disabled 
                              className="flex-1 py-3 bg-white/[0.02] border border-white/[0.05] text-white/10 font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl cursor-not-allowed text-center"
                            >
                              Hold
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStartCooking(ticket.id, ticket.tableNumber)}
                              className="flex-1 py-3 bg-gradient-to-r from-[#ffe2ab]/10 to-[#ffd380]/5 hover:from-[#ffe2ab]/15 hover:to-[#ffd380]/10 border border-[#ffe2ab]/25 hover:border-[#ffe2ab]/55 text-[#ffe2ab] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center animate-glow-pulse"
                            >
                              Start Cooking
                            </button>
                          )}
                          <button 
                            onClick={() => handleRejectOrder(ticket.id, ticket.tableNumber)}
                            className="py-3 px-5 bg-white/5 border border-white/10 hover:bg-[#ef4444]/10 hover:border-red-500/30 hover:text-[#f87171] text-[#A69984] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {ticket.status === 'cooking' && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleCompleteOrder(ticket.id, ticket.tableNumber)}
                            className="flex-1 py-3 bg-gradient-to-r from-[#10b981]/15 to-[#059669]/10 hover:from-[#10b981]/25 hover:to-[#059669]/15 border border-[#10b981]/30 hover:border-[#10b981]/50 text-[#34d399] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                          >
                            Mark Ready
                          </button>
                          <button 
                            onClick={() => handleRejectOrder(ticket.id, ticket.tableNumber)}
                            className="py-3 px-5 bg-white/5 border border-white/10 hover:bg-[#ef4444]/10 hover:border-red-500/30 hover:text-[#f87171] text-[#A69984] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {ticket.status === 'complete' && (
                        <button 
                          onClick={() => handleBumpOrder(ticket.id, ticket.tableNumber)}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                        >
                          Bump / Archive
                        </button>
                      )}

                      {ticket.status === 'rejected' && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleRestoreOrder(ticket.id, ticket.tableNumber)}
                            className="flex-1 py-3 bg-gradient-to-r from-[#ffe2ab]/10 to-[#ffd380]/5 hover:from-[#ffe2ab]/15 hover:to-[#ffd380]/10 border border-[#ffe2ab]/25 hover:border-[#ffe2ab]/55 text-[#ffe2ab] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                          >
                            Restore Order
                          </button>
                          <button 
                            onClick={() => handleBumpOrder(ticket.id, ticket.tableNumber)}
                            className="py-3 px-5 bg-white/5 border border-[#ef4444]/20 text-[#ef4444] font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#ef4444]/10 transition-all cursor-pointer text-center"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 text-[#A69984]/40 font-sans text-sm select-none border border-dashed border-white/5 rounded-2xl">
              No tickets active in the current station filter.
            </div>
          )}
        </div>

      </main>

      {/* FEEDBACK TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">info</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Station Alert</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
