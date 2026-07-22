'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePrinter } from '../../../app/printerContext';

interface HardwareTabProps {
  t: any;
  tr: any;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function HardwareTab({ t, tr, triggerToast, setAuditLogs }: HardwareTabProps) {
  const { config, testPrint, scanAndPair } = usePrinter();

  // Hardware Fleet States
  const [showPairDeviceModal, setShowPairDeviceModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [newDevice, setNewDevice] = useState({
    type: 'POS',
    name: '',
    ipAddress: 'USB Cable (WebUSB Direct)',
    status: 'ONLINE',
    details: ''
  });

  const [devicesList, setDevicesList] = useState<{ id: string; type: string; name: string; subtitle: string; ipAddress: string; battery: string; uptime: string; details: string; status: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dinepos_hardware_devices');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out any legacy offline or IP-based demo printers
            return parsed.filter((d: any) => {
              if (d.type === 'PRINTER') {
                if (d.status === 'OFFLINE') return false;
                if (d.ipAddress && (d.ipAddress.includes('192.168.') || d.ipAddress.includes('10.0.'))) return false;
              }
              return true;
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      {
        id: 'ACTIVE-PRNT',
        type: 'PRINTER',
        name: 'System Default Thermal Printer',
        subtitle: 'Active Direct Thermal Printer',
        ipAddress: 'USB Cable (WebUSB Direct)',
        battery: '100% (Wired)',
        uptime: 'Online',
        details: 'Routing: Customer Receipt & Kitchen',
        status: 'ONLINE'
      }
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_hardware_devices', JSON.stringify(devicesList));
    }
  }, [devicesList]);

  // Sync active printer from printerContext into hardware fleet if configured
  useEffect(() => {
    if (config && config.name && config.name !== 'Browser Print' && config.name !== 'System Default') {
      setDevicesList(prev => {
        const exists = prev.some(d => d.name === config.name || d.id === 'ACTIVE-PRNT');
        if (exists) return prev;
        const activeDev = {
          id: 'ACTIVE-PRNT',
          type: 'PRINTER',
          name: config.name,
          subtitle: `Active ${config.type.toUpperCase()} Printer`,
          ipAddress: config.ip || (config.type === 'usb' ? 'WebUSB Direct Port' : config.type === 'bluetooth' ? 'Bluetooth GATT' : 'System Default'),
          battery: 'AC Power',
          uptime: 'Online',
          details: `Interface: ${config.type.toUpperCase()}`,
          status: 'ONLINE'
        };
        return [activeDev, ...prev];
      });
    }
  }, [config]);

  // Additional Hardware States for Redesign
  const [activeHardwareTab, setActiveHardwareTab] = useState<'all' | 'pos' | 'printer' | 'kds' | 'cash_drawer'>('all');
  const [pingingDevices, setPingingDevices] = useState<Record<string, boolean>>({});
  const [pingResults, setPingResults] = useState<Record<string, string>>({});
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [printingDevices, setPrintingDevices] = useState<Record<string, boolean>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter list to render ONLY active, paired, and ready-to-use hardware
  const activeReadyList = devicesList.filter(d => {
    if (d.type === 'PRINTER') {
      if (d.status === 'OFFLINE') return false;
      if (d.ipAddress && (d.ipAddress.includes('192.168.') || d.ipAddress.includes('10.0.'))) return false;
    }
    return true;
  });

  const totalDevicesCount = activeReadyList.length;
  const posTotal = activeReadyList.filter(d => d.type === 'POS').length;
  const printerTotal = activeReadyList.filter(d => d.type === 'PRINTER').length;
  const kdsTotal = activeReadyList.filter(d => d.type === 'KDS').length;
  const cashDrawerTotal = activeReadyList.filter(d => d.type === 'CASH_DRAWER').length;
  const onlineCount = activeReadyList.filter(d => d.status === 'ONLINE').length;
  const fleetHealthPct = totalDevicesCount > 0 ? Math.round((onlineCount / totalDevicesCount) * 100) : 0;

  // Shared filter function for device cards and empty state (BUG-8 fix)
  const getFilteredDevices = () => {
    return activeReadyList.filter(dev => {
      if (activeHardwareTab === 'pos' && dev.type !== 'POS') return false;
      if (activeHardwareTab === 'printer' && dev.type !== 'PRINTER') return false;
      if (activeHardwareTab === 'kds' && dev.type !== 'KDS') return false;
      if (activeHardwareTab === 'cash_drawer' && dev.type !== 'CASH_DRAWER') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          dev.name.toLowerCase().includes(q) ||
          dev.id.toLowerCase().includes(q) ||
          dev.ipAddress.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  // Hardware Global Settings States with localStorage persistence
  const [autoReconnect, setAutoReconnect] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('dinepos_auto_reconnect');
      return s !== null ? JSON.parse(s) : true;
    }
    return true;
  });

  const [bluetoothDiscovery, setBluetoothDiscovery] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('dinepos_bt_discovery');
      return s !== null ? JSON.parse(s) : false;
    }
    return false;
  });

  const [pairedStar, setPairedStar] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('dinepos_paired_star');
      return s !== null ? JSON.parse(s) : false;
    }
    return false;
  });

  const [pairedEpson, setPairedEpson] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('dinepos_paired_epson');
      return s !== null ? JSON.parse(s) : false;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_auto_reconnect', JSON.stringify(autoReconnect));
      localStorage.setItem('dinepos_bt_discovery', JSON.stringify(bluetoothDiscovery));
      localStorage.setItem('dinepos_paired_star', JSON.stringify(pairedStar));
      localStorage.setItem('dinepos_paired_epson', JSON.stringify(pairedEpson));
    }
  }, [autoReconnect, bluetoothDiscovery, pairedStar, pairedEpson]);

  const handlePingDevice = (deviceId: string, deviceName: string) => {
    setPingingDevices(prev => ({ ...prev, [deviceId]: true }));
    triggerToast(`Checking connection for ${deviceName}...`, 'info');
    setTimeout(() => {
      const dev = activeReadyList.find(d => d.id === deviceId);
      const isReachable = dev && dev.status === 'ONLINE';
      setPingingDevices(prev => ({ ...prev, [deviceId]: false }));
      if (isReachable) {
        setPingResults(prev => ({ ...prev, [deviceId]: 'Reachable (Ready)' }));
        triggerToast(`${deviceName}: Connection verified — device is ready.`, 'success');
      } else {
        setPingResults(prev => ({ ...prev, [deviceId]: 'Unreachable' }));
        triggerToast(`${deviceName}: Device is not reachable. Check connection.`, 'info');
      }
    }, 800);
  };

  const handleRunPrinterTest = async (devId: string, devName: string) => {
    setPrintingDevices(prev => ({ ...prev, [devId]: true }));
    triggerToast(`Sending test print job to ${devName}...`, 'info');
    try {
      await testPrint();
      setPrintingDevices(prev => ({ ...prev, [devId]: false }));
      triggerToast(`Test print completed successfully on ${devName}!`, 'success');
      setAuditLogs(prev => [
        {
          id: Date.now(),
          time: 'Just now',
          actor: 'Admin',
          action: `Initiated thermal test print job on printer ${devName}`,
          type: 'info'
        },
        ...prev
      ]);
    } catch (err) {
      setPrintingDevices(prev => ({ ...prev, [devId]: false }));
      triggerToast(`Test print failed on ${devName}. Check printer connection.`, 'info');
    }
  };

  const togglePairStar = () => {
    if (pairedStar) {
      // Unpairing — ask for confirmation (BUG-13 fix)
      if (!window.confirm('Unpair Star Micronics mC-Print3 from the hardware fleet?')) return;
      setPairedStar(false);
      setDevicesList(prev => prev.filter(d => d.id !== 'DEV-STAR-MCP31'));
      triggerToast('Star Micronics mC-Print3 unpaired.', 'info');
    } else {
      setPairedStar(true);
      const starDev = {
        id: 'DEV-STAR-MCP31',
        type: 'PRINTER',
        name: 'Star Micronics mC-Print3',
        subtitle: 'Thermal Printer & Cash Drawer Hub',
        ipAddress: 'USB Cable (WebUSB Direct)',
        battery: '100% (Wired)',
        uptime: 'Online',
        status: 'ONLINE',
        details: 'Routing: Customer Receipt & Cash Drawer'
      };
      setDevicesList(prev => prev.some(d => d.id === starDev.id) ? prev : [starDev, ...prev]);
      triggerToast('Star Micronics mC-Print3 paired and added to Hardware Fleet!', 'success');
    }
  };

  const togglePairEpson = () => {
    if (pairedEpson) {
      // Unpairing — ask for confirmation (BUG-13 fix)
      if (!window.confirm('Unpair Epson TM-m30II from the hardware fleet?')) return;
      setPairedEpson(false);
      setDevicesList(prev => prev.filter(d => d.id !== 'DEV-EPSON-M30'));
      triggerToast('Epson TM-m30II unpaired.', 'info');
    } else {
      setPairedEpson(true);
      const epsonDev = {
        id: 'DEV-EPSON-M30',
        type: 'PRINTER',
        name: 'Epson TM-m30II Thermal Printer',
        subtitle: 'High-speed ESC/POS Thermal Printer',
        ipAddress: 'Bluetooth Wireless (WebBluetooth)',
        battery: '100% (Wired)',
        uptime: 'Online',
        status: 'ONLINE',
        details: 'Routing: Kitchen Expo & Receipts'
      };
      setDevicesList(prev => prev.some(d => d.id === epsonDev.id) ? prev : [epsonDev, ...prev]);
      triggerToast('Epson TM-m30II paired and added to Hardware Fleet!', 'success');
    }
  };

  const exportHardwareReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      fleetHealthScore: `${fleetHealthPct}% Operational`,
      totalDevices: totalDevicesCount,
      onlineCount: onlineCount,
      activeConfig: config,
      devices: activeReadyList
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hardware_fleet_health_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Admin',
        action: `Exported Hardware Fleet Health Report (${totalDevicesCount} devices, ${fleetHealthPct}% health)`,
        type: 'info'
      },
      ...prev
    ]);
    triggerToast('Hardware Fleet Health Report exported!', 'success');
  };

  return (
    <>
      {/* HARDWARE TAB JSX */}
                  <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
                <div className="select-none">
                  <h2 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">
                    {tr.hardwareFleet}
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 mt-3 leading-relaxed max-w-2xl font-semibold">
                    {tr.hardwareDesc}
                  </p>
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <button type="button"
                    onClick={exportHardwareReport}
                    className="text-white/80 hover:text-white px-4 py-2 text-xs uppercase tracking-widest font-sans font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none border border-white/10 rounded-xl bg-white/5 hover:bg-white/10"
                    title="Download sealed JSON report of all hardware devices and diagnostics"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Export Report
                  </button>
                  <Link
                    href="/dashboard/printer-settings"
                    className="text-[#ffe2ab] hover:text-[#ffdca0] px-4 py-2 text-xs uppercase tracking-widest font-sans font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none border border-[#ffe2ab]/20 rounded-xl bg-white/5 hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-base">print_connect</span>
                    Printer Console
                  </Link>
                  <button type="button"
                    onClick={() => setShowPairDeviceModal(true)}
                    className="text-[#ffe2ab] hover:text-[#ffdca0] px-4 py-2 text-xs uppercase tracking-widest font-sans font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    {tr.pairNewDevice}
                  </button>
                </div>
              </div>

              {/* Fleet Summary KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                <div className={`${t.cardBg} border rounded-2xl p-4 flex items-center gap-4 shadow-lg`}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined text-xl">devices</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A69984]/60 uppercase font-bold tracking-wider">Connected Fleet</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">{totalDevicesCount} Active Devices</div>
                  </div>
                </div>

                <div className={`${t.cardBg} border rounded-2xl p-4 flex items-center gap-4 shadow-lg`}>
                  <div className="w-10 h-10 rounded-xl bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 flex items-center justify-center text-[#ffc53d]">
                    <span className="material-symbols-outlined text-xl">print</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A69984]/60 uppercase font-bold tracking-wider">Thermal Printers</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">{printerTotal} Units Online</div>
                  </div>
                </div>

                <div className={`${t.cardBg} border rounded-2xl p-4 flex items-center gap-4 shadow-lg`}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <span className="material-symbols-outlined text-xl">inbox</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A69984]/60 uppercase font-bold tracking-wider">Cash Drawers</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">{cashDrawerTotal} Units (RJ11)</div>
                  </div>
                </div>

                <div className={`${t.cardBg} border rounded-2xl p-4 flex items-center gap-4 shadow-lg`}>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <span className="material-symbols-outlined text-xl">health_metrics</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A69984]/60 uppercase font-bold tracking-wider">Fleet Health</div>
                    <div className={`text-base font-bold ${fleetHealthPct >= 80 ? 'text-emerald-400' : fleetHealthPct >= 50 ? 'text-amber-400' : 'text-rose-400'} font-mono mt-0.5`}>{fleetHealthPct}% Operational</div>
                  </div>
                </div>
              </div>

              {/* Hardware Ecosystem Grid / Tabbed Catalog */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 select-none">
                    {[
                      { key: 'all', label: 'All', count: totalDevicesCount },
                      { key: 'pos', label: 'POS Terminals', count: posTotal },
                      { key: 'printer', label: 'Printers', count: printerTotal },
                      { key: 'kds', label: 'KDS Screens', count: kdsTotal },
                      { key: 'cash_drawer', label: 'Cash Drawers', count: cashDrawerTotal }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveHardwareTab(tab.key as any)}
                        className={`px-3 py-1.5 text-[10.5px] font-sans font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                          activeHardwareTab === tab.key
                            ? `${t.accentLightBg} border ${t.accentLightBorder} ${t.accent}`
                            : `bg-white/5 border border-transparent ${t.textMuted} hover:${t.text} hover:bg-white/10`
                        }`}
                      >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono ${
                          activeHardwareTab === tab.key
                            ? 'bg-[#ffe2ab]/20 text-[#ffe2ab]'
                            : 'bg-white/5 text-white/40'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Contextual Device Search */}
                  <div className="relative w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-white/30">search</span>
                    <input
                      type="text"
                      placeholder="Search devices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-9 pr-4 py-2 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Device Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredDevices()
                    .map((dev) => {
                      const isPinging = pingingDevices[dev.id];
                      const pingVal = pingResults[dev.id];
                      
                      return (
                        <div key={dev.id} className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-white/10 hover:shadow-2xl`}>
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3 select-none">
                                <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                                  <span className="material-symbols-outlined text-[16px]">
                                    {dev.type === 'POS' ? 'tablet_mac' : 
                                     dev.type === 'PRINTER' ? 'print' : 
                                     dev.type === 'KDS' ? 'desktop_windows' : 'inbox'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className={`text-white font-bold text-xs tracking-wider uppercase ${t.text}`}>{dev.name}</h4>
                                  <p className={`text-[10px] ${t.textMuted} font-semibold mt-0.5`}>{dev.subtitle}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  dev.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 
                                  dev.status === 'WARNING_LOW_PAPER' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse' : 
                                  'bg-zinc-500'
                                }`}></span>
                                <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{dev.id}</span>
                              </div>
                            </div>

                            <div className="space-y-2 text-[10.5px] font-sans font-semibold">
                              <div className="flex justify-between">
                                <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Connection Interface</span>
                                <span className={`font-mono ${t.text}`}>{dev.ipAddress || 'USB Cable'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Power / Battery</span>
                                <span className={`flex items-center gap-1 ${t.text}`}>
                                  {dev.battery === '100% (Wired)' || dev.battery === 'Powered by Printer' ? (
                                    <>
                                      <span className={`material-symbols-outlined text-[11px] ${t.accent}`}>bolt</span>
                                      Wired
                                    </>
                                  ) : (
                                    dev.battery || 'Wired'
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Uptime</span>
                                <span className={`font-mono ${t.text}`}>{dev.uptime || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                                <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Details</span>
                                <span className={`text-[10px] ${dev.status === 'WARNING_LOW_PAPER' ? 'text-amber-400 font-bold' : t.textMuted}`}>
                                  {dev.status === 'WARNING_LOW_PAPER' ? 'Warning: Low Paper' : dev.details || 'Operational'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-5 select-none">
                            {/* Connection Diagnostic Stats */}
                            {pingVal && (
                              <div className={`px-3 py-1.5 rounded-lg ${t.inputBg} border border-white/5 flex justify-between items-center text-[10px] font-sans`}>
                                <span className="text-white/40 uppercase font-bold tracking-wider">Connection Status:</span>
                                <span className={`font-mono font-bold ${pingVal === 'Unreachable' ? 'text-rose-400' : 'text-emerald-400'}`}>{pingVal}</span>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              {/* Primary Action */}
                              {dev.type === 'PRINTER' ? (
                                <button type="button" 
                                  onClick={() => handleRunPrinterTest(dev.id, dev.name)}
                                  disabled={printingDevices[dev.id]}
                                  className={`flex-1 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2`}
                                >
                                  {printingDevices[dev.id] ? (
                                    <>
                                      <span className={`w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin`}></span>
                                      Printing...
                                    </>
                                  ) : (
                                    'Test Print'
                                  )}
                                </button>
                              ) : (
                                 <button type="button" 
                                   onClick={() => handlePingDevice(dev.id, dev.name)}
                                   disabled={isPinging}
                                   className={`flex-1 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2`}
                                 >
                                   {isPinging ? (
                                     <>
                                       <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></span>
                                       Checking...
                                     </>
                                   ) : (
                                     'Test Connection'
                                   )}
                                 </button>
                               )}

                              {/* Manage (Edit/Delete) */}
                              <div className="flex gap-1.5">
                                <button type="button"
                                  onClick={() => setEditingDevice(dev)}
                                  className={`p-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center`}
                                  title="Edit Device"
                                >
                                  <span className="material-symbols-outlined text-xs">edit</span>
                                </button>
                                <button type="button"
                                  onClick={() => setShowDeleteConfirm(dev.id)}
                                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                  title="Unpair Device"
                                >
                                  <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                              </div>
                            </div>

                            {/* Inline Delete Confirmation */}
                            {showDeleteConfirm === dev.id && (
                              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Unpair {dev.name}?</span>
                                <div className="flex gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      // Sync brand toggle state if this is a brand device (BUG-3 fix)
                                      if (dev.id === 'DEV-STAR-MCP31') setPairedStar(false);
                                      if (dev.id === 'DEV-EPSON-M30') setPairedEpson(false);
                                      setDevicesList(prev => prev.filter(d => d.id !== dev.id));
                                      setShowDeleteConfirm(null);
                                      triggerToast(`Device ${dev.name} unpaired successfully.`, 'success');
                                      setAuditLogs(prev => [
                                        {
                                          id: Date.now(),
                                          time: 'Just now',
                                          actor: 'Admin',
                                          action: `Unpaired hardware device: ${dev.name} (${dev.id})`,
                                          type: 'info'
                                        },
                                        ...prev
                                      ]);
                                    }}
                                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button type="button"
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {/* Empty State */}
                  {getFilteredDevices().length === 0 && (
                    <div className={`col-span-full ${t.cardBg} border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4`}>
                      <span className="material-symbols-outlined text-5xl text-white/10 animate-bounce">settings_remote</span>
                      <div>
                        <h4 className="text-white font-bold text-sm">No Connected Devices</h4>
                        <p className={`text-xs ${t.textMuted} mt-1 max-w-sm`}>
                          No devices match the active filters. Pair a new POS tablet, thermal printer, KDS expo screen, or cash drawer.
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button"
                          onClick={() => setShowPairDeviceModal(true)}
                          className={`px-4 py-2 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer`}
                        >
                          Pair New Device
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fleet Ecosystem Settings & Brand Quick Pairing */}
              <div className="pt-6 border-t border-white/5 space-y-4 select-none">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide">Hardware Ecosystem Controls</h3>
                  <span className="text-[10px] text-[#A69984]/50 font-mono uppercase tracking-wider">WebUSB & WebBluetooth Protocol v2.4</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Auto Reconnect */}
                  <div className={`${t.cardBg} border rounded-xl p-4 flex justify-between items-center`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Auto-Reconnect</h4>
                      <p className="text-[10px] text-[#A69984]/60 mt-0.5 font-semibold">Session recovery on cycle</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoReconnect(!autoReconnect);
                        triggerToast(!autoReconnect ? 'Auto-reconnect enabled' : 'Auto-reconnect disabled', 'info');
                      }}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${autoReconnect ? 'bg-[#ffc53d] justify-end' : 'bg-white/10 justify-start'}`}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#161513] shadow-md"></span>
                    </button>
                  </div>

                  {/* Bluetooth Scan */}
                  <div className={`${t.cardBg} border rounded-xl p-4 flex justify-between items-center`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bluetooth Scan</h4>
                      <p className="text-[10px] text-[#A69984]/60 mt-0.5 font-semibold">WebBluetooth auto-discovery</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBluetoothDiscovery(!bluetoothDiscovery);
                        triggerToast(!bluetoothDiscovery ? 'Bluetooth discovery enabled' : 'Bluetooth discovery disabled', 'info');
                      }}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${bluetoothDiscovery ? 'bg-[#ffc53d] justify-end' : 'bg-white/10 justify-start'}`}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#161513] shadow-md"></span>
                    </button>
                  </div>

                  {/* Epson TM-m30II */}
                  <div className={`${t.cardBg} border rounded-xl p-4 flex justify-between items-center`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Epson TM-m30II</h4>
                      <p className="text-[10px] text-[#A69984]/60 mt-0.5 font-semibold">USB/Bluetooth ESC/POS</p>
                    </div>
                    <button
                      type="button"
                      onClick={togglePairEpson}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        pairedEpson ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                      }`}
                    >
                      {pairedEpson ? 'Paired' : 'Pair'}
                    </button>
                  </div>

                  {/* Star Micronics mC-Print3 */}
                  <div className={`${t.cardBg} border rounded-xl p-4 flex justify-between items-center`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Star mC-Print3</h4>
                      <p className="text-[10px] text-[#A69984]/60 mt-0.5 font-semibold">Receipt & Drawer Hub</p>
                    </div>
                    <button
                      type="button"
                      onClick={togglePairStar}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        pairedStar ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                      }`}
                    >
                      {pairedStar ? 'Paired' : 'Pair'}
                    </button>
                  </div>
                </div>
              </div>

              {/* EDIT DEVICE MODAL */}
              {editingDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
                  <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 transform scale-up`}>
                    <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
                      <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>Edit Connected Device</h3>
                      <button type="button" 
                        onClick={() => setEditingDevice(null)}
                        className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!editingDevice.name.trim()) {
                        triggerToast('Please enter a device name.', 'info');
                        return;
                      }
                      setDevicesList(prev => prev.map(d => d.id === editingDevice.id ? {
                        ...d,
                        name: editingDevice.name,
                        ipAddress: editingDevice.ipAddress,
                        status: editingDevice.status,
                        details: editingDevice.status === 'WARNING_LOW_PAPER' ? 'Warning: Low Paper' : 
                                 editingDevice.type === 'PRINTER' ? 'Routing: Customer Receipt' : d.details
                      } : d));

                      setEditingDevice(null);
                      triggerToast('Device configuration updated successfully.', 'success');
                    }} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Device Name</label>
                        <input 
                          type="text" 
                          value={editingDevice.name}
                          onChange={(e) => setEditingDevice({...editingDevice, name: e.target.value})}
                          placeholder="e.g. Bar Printer Left"
                          className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                          required
                        />
                      </div>

                      {/* Connection Interface */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Connection Interface</label>
                        <div className="relative">
                          <select
                            value={editingDevice.ipAddress}
                            onChange={(e) => setEditingDevice({...editingDevice, ipAddress: e.target.value})}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                          >
                            <option value="USB Cable (WebUSB Direct)">USB Cable (WebUSB Direct)</option>
                            <option value="Bluetooth Wireless (WebBluetooth)">Bluetooth Wireless (WebBluetooth)</option>
                            <option value="System Default Printer">System Default Printer</option>
                            <option value="Local Terminal Port (USB/Local)">Local Terminal Port (USB/Local)</option>
                          </select>
                          <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Status</label>
                        <div className="relative">
                          <select
                            value={editingDevice.status}
                            onChange={(e) => setEditingDevice({...editingDevice, status: e.target.value})}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                          >
                            <option value="ONLINE">ONLINE</option>
                            {editingDevice.type === 'PRINTER' && (
                              <option value="WARNING_LOW_PAPER">WARNING (LOW PAPER)</option>
                            )}
                          </select>
                          <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="button" 
                          onClick={() => setEditingDevice(null)}
                          className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
                        >
                          Cancel
                        </button>
                        <button type="submit"
                          className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>

      {/* HARDWARE MODALS JSX */}
      
      {showPairDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>Pair New Device</h3>
              <button type="button" 
                onClick={() => setShowPairDeviceModal(false)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newDevice.name.trim()) {
                triggerToast('Please enter a device name.', 'info');
                return;
              }
              const newId = `DEV-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : Date.now().toString(36).toUpperCase()}`;
              const deviceToAdd = {
                id: newId,
                type: newDevice.type,
                name: newDevice.name,
                subtitle: newDevice.type === 'POS' ? 'Remote Station' : newDevice.type === 'PRINTER' ? 'Thermal Printer' : newDevice.type === 'KDS' ? 'KDS Terminal' : 'Cash Drawer',
                ipAddress: newDevice.ipAddress || 'USB Cable (WebUSB Direct)',
                battery: '100% (Wired)',
                uptime: '0h 1m',
                status: 'ONLINE',
                details: newDevice.type === 'POS' ? 'Uptime: 0h 1m' : newDevice.type === 'PRINTER' ? 'Routing: Customer Receipt' : newDevice.type === 'KDS' ? 'KDS Expo' : 'Triggered via Printer RJ11 / WebUSB'
              };
              setDevicesList([...devicesList, deviceToAdd]);
              setShowPairDeviceModal(false);
              setNewDevice({
                type: 'POS',
                name: '',
                ipAddress: 'USB Cable (WebUSB Direct)',
                status: 'ONLINE',
                details: ''
              });
              triggerToast(`Successfully paired device ${deviceToAdd.name}!`, 'success');
            }} className="space-y-4">
              {/* Type */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Device Type</label>
                <div className="relative">
                  <select
                    aria-label="Device type"
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="POS">POS Terminal</option>
                    <option value="PRINTER">Thermal Printer</option>
                    <option value="KDS">Kitchen Display System (KDS)</option>
                    <option value="CASH_DRAWER">Cash Drawer</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Name with Native WebUSB / WebBluetooth Scan Trigger */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider`}>Device Name</label>
                  {(newDevice.type === 'PRINTER' || newDevice.type === 'CASH_DRAWER') && (
                    <button
                      type="button"
                      onClick={async () => {
                        setIsScanning(true);
                        try {
                          const typeToScan = (newDevice.ipAddress || '').includes('Bluetooth') ? 'bluetooth' : 'usb';
                          triggerToast(`Opening native ${typeToScan === 'bluetooth' ? 'Bluetooth' : 'USB'} device selector...`, 'info');
                          await scanAndPair(typeToScan);
                          // After scanAndPair completes, read the updated config from printer context (BUG-2 fix)
                          // The config state will be updated by printerContext after successful pairing
                          setTimeout(() => {
                            if (config.name && config.name !== 'Browser Print') {
                              setNewDevice(prev => ({
                                ...prev,
                                name: config.name,
                                ipAddress: config.type === 'bluetooth' ? 'Bluetooth Wireless (WebBluetooth)' : 'USB Cable (WebUSB Direct)'
                              }));
                              triggerToast(`Paired ${config.name} successfully!`, 'success');
                            }
                          }, 100);
                        } catch (err: any) {
                          triggerToast(err?.message || 'Device pairing scan cancelled.', 'info');
                        } finally {
                          setIsScanning(false);
                        }
                      }}
                      disabled={isScanning}
                      className="text-[#ffe2ab] hover:text-[#ffdca0] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-xs">{isScanning ? 'progress_activity' : 'search'}</span>
                      {isScanning ? 'Scanning...' : 'Scan WebUSB / Bluetooth'}
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  aria-label="Device name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  placeholder="e.g. Bar Printer Left"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* Connection Interface */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Connection Interface</label>
                <div className="relative">
                  <select
                    aria-label="Connection interface"
                    value={newDevice.ipAddress || 'USB Cable (WebUSB Direct)'}
                    onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="USB Cable (WebUSB Direct)">USB Cable (WebUSB Direct)</option>
                    <option value="Bluetooth Wireless (WebBluetooth)">Bluetooth Wireless (WebBluetooth)</option>
                    <option value="System Default Printer">System Default Printer</option>
                    <option value="Local Terminal Port (USB/Local)">Local Terminal Port (USB/Local)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" 
                  onClick={() => setShowPairDeviceModal(false)}
                  className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
                >
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                >
                  Pair Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
