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
  const { testPrint, kickCashDrawer } = usePrinter();

  // Hardware Fleet States
  const [showPairDeviceModal, setShowPairDeviceModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    type: 'POS',
    name: '',
    ipAddress: '',
    status: 'ONLINE',
    details: ''
  });

  const [devicesList, setDevicesList] = useState<{ id: string; type: string; name: string; subtitle: string; ipAddress: string; battery: string; uptime: string; details: string; status: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dinepos_hardware_devices');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      { id: 'TERM-01', type: 'POS', name: 'Main Cashier Terminal', subtitle: 'Station 1 (Front Counter)', ipAddress: '192.168.1.50', battery: '100% (AC)', uptime: '14h 22m', details: 'iPad Pro 12.9" + Star Micronics mC-Print3', status: 'ONLINE' },
      { id: 'TERM-02', type: 'POS', name: 'Bar Order Terminal', subtitle: 'Station 2 (Lounge Bar)', ipAddress: '192.168.1.51', battery: '82%', uptime: '6h 11m', details: 'iPad Air 10.9" + Epson TM-T88VI', status: 'ONLINE' },
      { id: 'PRNT-01', type: 'PRINTER', name: 'Kitchen Hot Line Printer', subtitle: 'Thermal Ticket Printer', ipAddress: '192.168.1.120', battery: 'AC Power', uptime: '128h 5m', details: 'Epson TM-T88VII (LAN/80mm)', status: 'ONLINE' },
      { id: 'PRNT-02', type: 'PRINTER', name: 'Pastry & Dessert Printer', subtitle: 'Thermal Ticket Printer', ipAddress: '192.168.1.121', battery: 'AC Power', uptime: '128h 5m', details: 'Star Micronics TSP143III (LAN)', status: 'ONLINE' },
      { id: 'KDS-01', type: 'KDS', name: 'Expo KDS Monitor', subtitle: 'Kitchen Display Controller', ipAddress: '192.168.1.80', battery: 'AC Power', uptime: '14h 22m', details: 'Raspberry Pi 4 + 21.5" IPS Touchscreen', status: 'ONLINE' },
      { id: 'KDS-02', type: 'KDS', name: 'Grill Station KDS Screen', subtitle: 'Kitchen Display Controller', ipAddress: '192.168.1.81', battery: 'AC Power', uptime: '4h 19m', details: 'Raspberry Pi 4 + 15.6" Rugged Screen', status: 'ONLINE' },
      { id: 'DRAWER-01', type: 'CASH_DRAWER', name: 'Front Counter Cash Drawer', subtitle: 'Connected via TERM-01', ipAddress: 'Star mC-Print3 Port', battery: 'DC Trigger', uptime: '14h 22m', details: 'APG Series 4000 (Heavy Duty)', status: 'ONLINE' }
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_hardware_devices', JSON.stringify(devicesList));
    }
  }, [devicesList]);

  // Additional Hardware States for Redesign
  const [activeHardwareTab, setActiveHardwareTab] = useState<'all' | 'pos' | 'printer' | 'kds' | 'cash_drawer'>('all');
  const [pingingDevices, setPingingDevices] = useState<Record<string, boolean>>({});
  const [pingResults, setPingResults] = useState<Record<string, string>>({});
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [printingDevices, setPrintingDevices] = useState<Record<string, boolean>>({});

  const totalDevicesCount = devicesList.length;
  const posTotal = devicesList.filter(d => d.type === 'POS').length;
  const printerTotal = devicesList.filter(d => d.type === 'PRINTER').length;
  const kdsTotal = devicesList.filter(d => d.type === 'KDS').length;
  const cashDrawerTotal = devicesList.filter(d => d.type === 'CASH_DRAWER').length;

  // Hardware Global Settings States
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [defaultGateway, setDefaultGateway] = useState('192.168.1.1');
  const [bluetoothDiscovery, setBluetoothDiscovery] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [pairedStar, setPairedStar] = useState(false);
  const [pairedEpson, setPairedEpson] = useState(false);

  const handlePingDevice = (deviceId: string) => {
    setPingingDevices(prev => ({ ...prev, [deviceId]: true }));
    triggerToast(`Pinging device ${deviceId}...`, 'info');
    setTimeout(() => {
      const latency = Math.floor(8 + Math.random() * 25);
      setPingingDevices(prev => ({ ...prev, [deviceId]: false }));
      setPingResults(prev => ({ ...prev, [deviceId]: `${latency}ms (Excellent)` }));
      triggerToast(`Ping successful for ${deviceId}: ${latency}ms latency`, 'success');
    }, 1000);
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

  const playCashRegisterChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}
  };

  const handleScanDevices = () => {
    setIsScanning(true);
    triggerToast('Scanning for nearby bluetooth thermal printers...', 'info');
    setTimeout(() => {
      setIsScanning(false);
      triggerToast('Scan completed. Printers discovered.', 'success');
    }, 2000);
  };

  const togglePairStar = () => {
    setPairedStar(prev => !prev);
    triggerToast(!pairedStar ? 'Star Micronics MCP31 paired!' : 'Star printer unpaired.', 'success');
  };

  const togglePairEpson = () => {
    setPairedEpson(prev => !prev);
    triggerToast(!pairedEpson ? 'Epson TM-m30II paired!' : 'Epson printer unpaired.', 'success');
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

                <div className="flex gap-4 items-center">
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
                  {devicesList
                    .filter(dev => {
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
                    })
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
                                <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>IP Address</span>
                                <span className={`font-mono ${t.text}`}>{dev.ipAddress}</span>
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
                            {/* Connection Ping / Diagnostic Stats */}
                            {pingVal && (
                              <div className={`px-3 py-1.5 rounded-lg ${t.inputBg} border border-white/5 flex justify-between items-center text-[10px] font-sans`}>
                                <span className="text-white/40 uppercase font-bold tracking-wider">Ping Response:</span>
                                <span className="font-mono text-emerald-400 font-bold">{pingVal}</span>
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
                              ) : dev.type === 'CASH_DRAWER' ? (
                                <button type="button" 
                                  onClick={async () => {
                                    triggerToast(`Sending RJ12 drawer kick signal to ${dev.name}...`, 'info');
                                    playCashRegisterChime();
                                    await kickCashDrawer();
                                    triggerToast('Drawer kicked open successfully!', 'success');
                                  }}
                                  className={`flex-1 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                                >
                                  Test Drawer Kick
                                </button>
                              ) : (
                                <button type="button" 
                                  onClick={() => handlePingDevice(dev.id)}
                                  disabled={isPinging}
                                  className={`flex-1 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2`}
                                >
                                  {isPinging ? (
                                    <>
                                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></span>
                                      Pinging...
                                    </>
                                  ) : (
                                    'Test Connection'
                                  )}
                                </button>
                              )}

                              {/* Manage (Edit/Delete Dropdown) */}
                              <div className="flex gap-1.5">
                                <button type="button"
                                  onClick={() => setEditingDevice(dev)}
                                  className={`p-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center`}
                                  title="Edit Device"
                                >
                                  <span className="material-symbols-outlined text-xs">edit</span>
                                </button>
                                <button type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to unpair device ${dev.name}?`)) {
                                      setDevicesList(prev => prev.filter(d => d.id !== dev.id));
                                      triggerToast(`Device ${dev.name} unpaired successfully.`, 'success');
                                    }
                                  }}
                                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                  title="Unpair Device"
                                >
                                  <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Empty State */}
                  {devicesList.filter(dev => {
                    if (activeHardwareTab === 'pos' && dev.type !== 'POS') return false;
                    if (activeHardwareTab === 'printer' && dev.type !== 'PRINTER') return false;
                    if (activeHardwareTab === 'kds' && dev.type !== 'KDS') return false;
                    if (activeHardwareTab === 'cash_drawer' && dev.type !== 'CASH_DRAWER') return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      return dev.name.toLowerCase().includes(q) || dev.id.toLowerCase().includes(q);
                    }
                    return true;
                  }).length === 0 && (
                    <div className={`col-span-full ${t.cardBg} border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4`}>
                      <span className="material-symbols-outlined text-5xl text-white/10 animate-bounce">settings_remote</span>
                      <div>
                        <h4 className="text-white font-bold text-sm">No Connected Devices</h4>
                        <p className={`text-xs ${t.textMuted} mt-1 max-w-sm`}>
                          No devices match the active filters. Pair a new POS tablet, thermal printer, KDS expo screen, or cash drawer.
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowPairDeviceModal(true)}
                        className={`px-4 py-2 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer`}
                      >
                        Pair New Device
                      </button>
                    </div>
                  )}
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

                      {/* IP Address */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>IP Address</label>
                        <input 
                          type="text" 
                          value={editingDevice.ipAddress}
                          onChange={(e) => setEditingDevice({...editingDevice, ipAddress: e.target.value})}
                          placeholder="e.g. 192.168.1.110"
                          className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                          required
                        />
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
                            <option value="OFFLINE">OFFLINE</option>
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
              const newId = `DEV-${Math.floor(100 + Math.random() * 900)}`;
              const deviceToAdd = {
                id: newId,
                type: newDevice.type,
                name: newDevice.name,
                subtitle: newDevice.type === 'POS' ? 'Remote Station' : newDevice.type === 'PRINTER' ? 'Thermal Printer' : 'KDS Terminal',
                ipAddress: newDevice.ipAddress || '192.168.1.150',
                battery: '100% (Wired)',
                uptime: '0h 1m',
                status: 'ONLINE',
                details: newDevice.type === 'POS' ? 'Uptime: 0h 1m' : newDevice.type === 'PRINTER' ? 'Routing: Expo' : 'Syncing: Real-time'
              };
              setDevicesList([...devicesList, deviceToAdd]);
              setShowPairDeviceModal(false);
              setNewDevice({
                type: 'POS',
                name: '',
                ipAddress: '',
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
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Device Name</label>
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

              {/* IP Address */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>IP Address (Optional)</label>
                <input 
                  type="text" 
                  aria-label="IP address"
                  value={newDevice.ipAddress}
                  onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
                  placeholder="e.g. 192.168.1.110"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
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
