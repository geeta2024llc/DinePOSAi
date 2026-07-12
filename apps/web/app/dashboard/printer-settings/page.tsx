'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePrinter } from '../../printerContext';
import { PrinterType, PrinterConfig } from '../../printerService';

function isValidIp(ip: string): boolean {
  if (!ip) return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    if (!/^\d{1,3}$/.test(p)) return false;
    const n = parseInt(p, 10);
    return n >= 0 && n <= 255;
  });
}

export default function PrinterSettingsPage() {
  const { config, status, logs, setConfig, scanAndPair, testPrint, clearLogs, disconnect } = usePrinter();
  
  const [ip, setIp] = useState(config.ip || '192.168.1.100');
  const [port, setPort] = useState(config.port || 9100);
  const [networkName, setNetworkName] = useState(config.name || 'Network Thermal Printer');
  const [isScanning, setIsScanning] = useState(false);
  const [scanErrors, setScanErrors] = useState<Record<string, string | null>>({});
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ipError, setIpError] = useState<string | null>(null);
  const [portError, setPortError] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const consoleContainerRef = useRef<HTMLDivElement>(null);

  // Sync local state when config changes externally (e.g. from another tab)
  useEffect(() => {
    setIp(config.ip || '192.168.1.100');
    setPort(config.port || 9100);
    setNetworkName(config.name || 'Network Thermal Printer');
  }, [config]);

  // Auto-scroll console to bottom when new logs arrive
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const validateIp = (value: string): boolean => {
    if (!isValidIp(value)) {
      setIpError('Invalid IP address format (e.g. 192.168.1.100)');
      return false;
    }
    setIpError(null);
    return true;
  };

  const validatePort = (value: number): boolean => {
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      setPortError('Port must be between 1 and 65535');
      return false;
    }
    setPortError(null);
    return true;
  };

  const handleNetworkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ipValid = validateIp(ip);
    const portValid = validatePort(port);
    if (!ipValid || !portValid) return;

    setIsSaving(true);
    try {
      const newCfg: PrinterConfig = {
        type: 'network',
        name: networkName,
        ip,
        port: Number(port)
      };
      setConfig(newCfg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectBrowser = () => {
    setConfig({
      type: 'browser',
      name: 'System Default Printer (Browser)'
    });
  };

  const handleSelectType = (type: PrinterType) => {
    setScanErrors(prev => ({ ...prev, [type]: null }));
    if (type === 'bluetooth') {
      setConfig({ type: 'bluetooth', name: config.type === 'bluetooth' ? config.name : 'Bluetooth Printer' });
    } else if (type === 'usb') {
      setConfig({ type: 'usb', name: config.type === 'usb' ? config.name : 'USB Printer' });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleScanDevice = async (type: 'bluetooth' | 'usb') => {
    setIsScanning(true);
    setScanErrors(prev => ({ ...prev, [type]: null }));
    try {
      await scanAndPair(type);
    } catch (err: any) {
      setScanErrors(prev => ({ ...prev, [type]: err.message || 'Connection request cancelled or failed.' }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    try {
      await testPrint();
    } catch (_) {
    } finally {
      setIsTestPrinting(false);
    }
  };

  const isActive = (type: string) => config.type === type;

  return (
    <div className="min-h-screen bg-[#0e0e0d] text-[#e5e2e1] font-sans antialiased selection:bg-[#ffe2ab]/30 select-none pb-16">
      
      {/* Header bar */}
      <header className="border-b border-white/5 bg-[#0a0a09] px-8 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-[#A69984] hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wide text-white leading-tight">Printer Connection Console</h1>
            <p className="text-xs text-[#A69984]/60 mt-0.5">Hardware Ecosystem & Dispatch Stations</p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className={`relative flex h-2 w-2`}>
              {status === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                status === 'connected' ? 'bg-emerald-500' :
                status === 'connecting' ? 'bg-amber-500' :
                status === 'error' ? 'bg-rose-500' : 'bg-zinc-600'
              }`}></span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A69984]">
              {status === 'connected' ? 'Online' :
               status === 'connecting' ? 'Connecting...' :
               status === 'error' ? 'Connection Error' : 'Offline / Idle'}
            </span>
          </div>

          {status === 'connected' && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 text-[10px] uppercase font-bold tracking-wider text-[#A69984] hover:text-rose-400 transition-all cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Config */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section title */}
          <div>
            <h2 className="text-lg font-serif text-white font-medium mb-1">Select connection interface</h2>
            <p className="text-xs text-[#A69984]/65">Choose how this terminal communicates with your thermal printer fleet.</p>
          </div>

          {/* Cards for connection types */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Card 1: Browser Print */}
            <button 
              onClick={handleSelectBrowser}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative cursor-pointer ${
                isActive('browser') 
                  ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/40 shadow-lg' 
                  : 'bg-[#161513]/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined text-2xl ${isActive('browser') ? 'text-[#ffc53d]' : 'text-[#A69984]'}`}>print</span>
                {isActive('browser') && (
                  <span className="material-symbols-outlined text-sm text-[#ffc53d]">check_circle</span>
                )}
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Browser Print</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">OS printer spooler dialog. Direct plug-and-play.</p>
            </button>

            {/* Card 2: Bluetooth - selects type only, doesn't scan */}
            <button 
              onClick={() => handleSelectType('bluetooth')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative cursor-pointer ${
                isActive('bluetooth') 
                  ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/40 shadow-lg' 
                  : 'bg-[#161513]/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined text-2xl ${isActive('bluetooth') ? 'text-[#ffc53d]' : 'text-[#A69984]'}`}>bluetooth</span>
                {isActive('bluetooth') && (
                  <span className="material-symbols-outlined text-sm text-[#ffc53d]">check_circle</span>
                )}
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Bluetooth GATT</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">Wireless pairing. Ideal for tablet or mobile POS.</p>
            </button>

            {/* Card 3: USB - selects type only, doesn't scan */}
            <button 
              onClick={() => handleSelectType('usb')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative cursor-pointer ${
                isActive('usb') 
                  ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/40 shadow-lg' 
                  : 'bg-[#161513]/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined text-2xl ${isActive('usb') ? 'text-[#ffc53d]' : 'text-[#A69984]'}`}>usb</span>
                {isActive('usb') && (
                  <span className="material-symbols-outlined text-sm text-[#ffc53d]">check_circle</span>
                )}
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">WebUSB Direct</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">Direct cable connect. Chrome/Edge desktop compatible.</p>
            </button>

            {/* Card 4: Network */}
            <button 
              onClick={() => {
                if (isValidIp(ip) && port >= 1 && port <= 65535) {
                  setConfig({ type: 'network', name: networkName, ip, port });
                }
              }}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative cursor-pointer ${
                isActive('network') 
                  ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/40 shadow-lg' 
                  : 'bg-[#161513]/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined text-2xl ${isActive('network') ? 'text-[#ffc53d]' : 'text-[#A69984]'}`}>lan</span>
                {isActive('network') && (
                  <span className="material-symbols-outlined text-sm text-[#ffc53d]">check_circle</span>
                )}
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Network IP</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">Kitchen / counter LAN dispatch. Raw TCP connection.</p>
            </button>

          </div>

          {/* Dynamic Configuration Form */}
          <div className="bg-[#161513]/90 border border-white/5 p-6 rounded-2xl space-y-6">
            
            {isActive('browser') && (
              <div className="space-y-2.5">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Browser Spooler Mode</h4>
                <p className="text-xs text-[#A69984]/70 leading-relaxed">
                  No pairing required. Receipts render on screen and open the system print dialog. 
                  Compatible with any standard printer configured in your operating system (Windows, macOS, iOS).
                </p>
                {status === 'connected' && (
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-emerald-400/80 font-medium">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Ready to print via system dialog
                  </div>
                )}
              </div>
            )}

            {isActive('bluetooth') && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Bluetooth GATT Config</h4>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <div className="text-xs text-white font-semibold">Active Device</div>
                    <div className="text-[11px] text-[#A69984]/65 font-mono mt-0.5">{config.name}</div>
                  </div>
                  <button 
                    onClick={() => handleScanDevice('bluetooth')}
                    disabled={isScanning}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold text-white transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {isScanning ? 'Scanning...' : 'Pair Printer'}
                  </button>
                </div>
                {scanErrors['bluetooth'] && (
                  <div className="text-[10px] text-rose-400 font-medium font-mono bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                    {scanErrors['bluetooth']}
                  </div>
                )}
              </div>
            )}

            {isActive('usb') && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">WebUSB Direct Config</h4>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <div className="text-xs text-white font-semibold">Active USB Device</div>
                    <div className="text-[11px] text-[#A69984]/65 font-mono mt-0.5">{config.name}</div>
                  </div>
                  <button 
                    onClick={() => handleScanDevice('usb')}
                    disabled={isScanning}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold text-white transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {isScanning ? 'Scanning...' : 'Select USB Device'}
                  </button>
                </div>
                {scanErrors['usb'] && (
                  <div className="text-[10px] text-rose-400 font-medium font-mono bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                    {scanErrors['usb']}
                  </div>
                )}
              </div>
            )}

            {isActive('network') && (
              <form onSubmit={handleNetworkSave} className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Network / LAN Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10.5px] text-[#A69984] font-bold uppercase tracking-wider">Printer Name</label>
                    <input 
                      type="text" 
                      value={networkName}
                      onChange={(e) => setNetworkName(e.target.value)}
                      className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffe2ab]/50"
                      placeholder="Kitchen Dispatch 01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10.5px] text-[#A69984] font-bold uppercase tracking-wider">IP Address</label>
                    <input 
                      type="text" 
                      value={ip}
                      onChange={(e) => {
                        setIp(e.target.value);
                        if (ipError) setIpError(null);
                      }}
                      onBlur={() => validateIp(ip)}
                      className={`w-full bg-[#0e0e0d] border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono ${
                        ipError ? 'border-rose-500/50 focus:border-rose-500/70' : 'border-white/10 focus:border-[#ffe2ab]/50'
                      }`}
                      placeholder="192.168.1.100"
                      required
                    />
                    {ipError && (
                      <p className="text-[10px] text-rose-400 font-medium mt-1">{ipError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-[10.5px] text-[#A69984] font-bold uppercase tracking-wider">TCP Port (Default 9100)</label>
                    <input 
                      type="number" 
                      value={port}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPort(val);
                        if (portError) setPortError(null);
                      }}
                      onBlur={() => validatePort(port)}
                      min={1}
                      max={65535}
                      className={`w-full bg-[#0e0e0d] border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono ${
                        portError ? 'border-rose-500/50 focus:border-rose-500/70' : 'border-white/10 focus:border-[#ffe2ab]/50'
                      }`}
                      placeholder="9100"
                      required
                    />
                    {portError && (
                      <p className="text-[10px] text-rose-400 font-medium mt-1">{portError}</p>
                    )}
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Saving...
                      </>
                    ) : (
                      'Save Network Settings'
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* Right Column: Console & Test */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Test Controls */}
          <div className="bg-[#161513]/90 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Integration Diagnostics</h3>
            <p className="text-[11px] text-[#A69984]/65 leading-relaxed">
              Verify your setup by firing a loopback diagnostic test ticket to the selected printer interface.
            </p>

            {config.type === 'browser' && status === 'connected' && (
              <div className="flex items-center gap-2 text-[10px] text-amber-400/80 font-medium bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                <span className="material-symbols-outlined text-sm">info</span>
                Test print will open your browser's print dialog.
              </div>
            )}
            
            <button 
              onClick={handleTestPrint}
              disabled={isTestPrinting || status === 'connecting'}
              className="w-full py-3.5 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/40 text-[#ffe2ab] hover:bg-[#ffe2ab]/5 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isTestPrinting ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">print_connect</span>
                  Send Test Print Job
                </>
              )}
            </button>
          </div>

          {/* Diagnostic Console Log Terminal */}
          <div className="bg-[#161513]/90 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[320px] shadow-xl">
            
            {/* Console header */}
            <div className="bg-black/40 px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffc53d] animate-pulse"></span>
                <span className="font-mono text-[10px] text-white/50 font-bold uppercase tracking-wider">Diagnostic Terminal</span>
              </div>
              <button 
                onClick={clearLogs}
                className="text-[9.5px] uppercase font-bold text-[#A69984]/50 hover:text-[#ffe2ab] transition-colors cursor-pointer"
              >
                Clear Console
              </button>
            </div>

            {/* Scrollable console messages */}
            <div ref={consoleContainerRef} className="p-5 flex-1 overflow-y-auto font-mono text-[10.5px] text-[#ffe2ab]/90 space-y-2 bg-[#080808] select-text">
              {logs.length === 0 ? (
                <div className="text-white/20 italic text-center pt-20">
                  Terminal idle. Waiting for device print event log...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-relaxed border-b border-white/[0.02] pb-1.5 last:border-0">
                    <span className="text-[#A69984]/40 mr-1.5">$</span>
                    {log}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
