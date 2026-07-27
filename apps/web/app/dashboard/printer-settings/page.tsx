'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePrinter } from '../../printerContext';
import { PrinterType, PrinterConfig } from '../../printerService';
import { PrintableReceipt } from '@/components/dashboard/PrintableReceipt';
import { getStoredInvoiceConfig, saveStoredInvoiceConfig } from '@/utils/invoiceConfig';

export default function PrinterSettingsPage() {
  const { config, status, logs, setConfig, scanAndPair, testPrint, clearLogs, forgetConfig } = usePrinter();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanErrors, setScanErrors] = useState<Record<string, string | null>>({});
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dismissedDriverLock, setDismissedDriverLock] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });

  const [hasWebUSB, setHasWebUSB] = useState(true);
  const [hasWebBluetooth, setHasWebBluetooth] = useState(true);

  const [customHeader, setCustomHeader] = useState('DinePosAi');
  const [taxRegType, setTaxRegType] = useState<'VAT' | 'PAN'>('VAT');
  const [customVat, setCustomVat] = useState('301234567');
  const [customFooter, setCustomFooter] = useState('THANK YOU FOR DINING WITH US!');
  const [headerLogo, setHeaderLogo] = useState('');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [isSecure, setIsSecure] = useState(true);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWebUSB(!!(navigator as any).usb);
      setHasWebBluetooth(!!(navigator as any).bluetooth);
      setIsSecure(window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');

      try {
        const invConfig = getStoredInvoiceConfig();
        if (invConfig.establishmentName) setCustomHeader(invConfig.establishmentName);
        if (invConfig.taxId) setCustomVat(invConfig.taxId);
        if (invConfig.taxRegistrationType) setTaxRegType(invConfig.taxRegistrationType);
        if (invConfig.thankYouMessage) setCustomFooter(invConfig.thankYouMessage);
        if (invConfig.restaurantLogo) setHeaderLogo(invConfig.restaurantLogo);
        if (invConfig.paperWidth) setPaperWidth(invConfig.paperWidth);
      } catch (e) {}
    }
  }, []);

  // Auto-scroll diagnostic logs terminal to latest log line
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSelectBrowser = () => {
    const defaultType = config.defaultSystemType || 'usb';
    setConfig({
      type: 'browser',
      name: `System Default (${defaultType === 'usb' ? 'USB' : 'Bluetooth'})`,
      defaultSystemType: defaultType
    });
    triggerToast('Switched to System Default (Browser Print)', 'success');
  };

  const handleSelectType = (type: PrinterType) => {
    setScanErrors(prev => ({ ...prev, [type]: null }));
    if (type === 'bluetooth') {
      setConfig({ type: 'bluetooth', name: config.type === 'bluetooth' ? config.name : 'Bluetooth Printer' });
      triggerToast('Selected Bluetooth Wireless mode', 'info');
    } else if (type === 'usb') {
      setConfig({ type: 'usb', name: config.type === 'usb' ? config.name : 'USB Printer' });
      triggerToast('Selected USB Cable mode', 'info');
    }
  };

  const handleForgetConfig = () => {
    forgetConfig();
    setScanErrors({});
    setDismissedDriverLock(false);
    triggerToast('Printer connection reset', 'info');
  };

  const handleSaveCustomization = () => {
    const updated: PrinterConfig = {
      ...config,
      customHeaderText: customHeader,
      customVatId: customVat,
      customFooterText: customFooter,
      headerLogoUrl: headerLogo
    };
    setConfig(updated);
    saveStoredInvoiceConfig({
      establishmentName: customHeader,
      taxId: customVat,
      taxRegistrationType: taxRegType,
      thankYouMessage: customFooter,
      restaurantLogo: headerLogo,
      paperWidth: paperWidth
    });
    triggerToast('Thermal receipt customization saved to shared invoice config!', 'success');
  };

  const handleScanDevice = async (type: 'bluetooth' | 'usb') => {
    if (type === 'usb' && !hasWebUSB) {
      setScanErrors(prev => ({ ...prev, usb: 'WebUSB is not supported in this browser or HTTP environment. Use HTTPS or Browser Print.' }));
      triggerToast('WebUSB unsupported in current environment', 'info');
      return;
    }
    if (type === 'bluetooth' && !hasWebBluetooth) {
      setScanErrors(prev => ({ ...prev, bluetooth: 'WebBluetooth is not supported in this browser or HTTP environment. Use HTTPS or Browser Print.' }));
      triggerToast('WebBluetooth unsupported in current environment', 'info');
      return;
    }

    setIsScanning(true);
    setScanErrors(prev => ({ ...prev, [type]: null }));
    try {
      await scanAndPair(type);
      triggerToast(`Paired successfully with ${type.toUpperCase()} printer!`, 'success');
    } catch (err: any) {
      const msg = err.message || 'Connection request cancelled or failed.';
      setScanErrors(prev => ({ ...prev, [type]: msg }));
      triggerToast(`Pairing failed: ${msg}`, 'info');
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    const isPrinterAvailable = status === 'connected' || config?.type === 'browser';

    if (!isPrinterAvailable) {
      triggerToast('No receipt printer connected. Please connect your printer first.', 'info');
      return;
    }

    setIsTestPrinting(true);
    try {
      await testPrint();
      triggerToast(config.type === 'browser' ? 'Browser print dialog opened!' : 'Test print receipt sent to printer!', 'success');
    } catch (err: any) {
      triggerToast('No receipt printer connected. Please connect your printer first.', 'info');
    } finally {
      setIsTestPrinting(false);
    }
  };

  const isActive = (type: string) => config.type === type;

  const hasDriverLockError = logs.some(log => log.includes('Windows driver lock detected') || log.includes('Access denied - Windows Driver Lock'));

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
          <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#A69984] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 select-none">
            <span className="material-symbols-outlined text-[13px] text-emerald-400">check_circle</span>
            Auto-Saved
          </div>

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
              onClick={handleForgetConfig}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 text-[10px] uppercase font-bold tracking-wider text-[#A69984] hover:text-rose-400 transition-all cursor-pointer"
            >
              Forget Printer
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
            <p className="text-xs text-[#A69984]/65">Choose how this terminal communicates with your thermal printer fleet. DinePOS defaults to 80mm (3-inch) receipt paper layouts for optimal print quality.</p>
          </div>

          {/* Cards for connection types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Browser Print */}
            <button 
              type="button"
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
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">System Default</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">System print dialog. Easiest setup.</p>
            </button>

            {/* Card 2: Bluetooth - selects type only, doesn't scan */}
            <button 
              type="button"
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
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Bluetooth Wireless</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">Wireless pairing. Ideal for tablet or mobile POS.</p>
            </button>

            {/* Card 3: USB - selects type only, doesn't scan */}
            <button 
              type="button"
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
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">USB Cable</h3>
              <p className="text-[10.5px] text-[#A69984]/65 mt-1.5 leading-relaxed">Direct cable connect for fast printing.</p>
            </button>

          </div>

          {/* Dynamic Configuration Form */}
          <div className="bg-[#161513]/90 border border-white/5 p-6 rounded-2xl space-y-6">
            
            {isActive('browser') && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Browser Spooler Mode</h4>
                <p className="text-xs text-[#A69984]/70 leading-relaxed">
                  No pairing required. Choose which interface to make default system for printing:
                </p>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setConfig({
                      type: 'browser',
                      name: 'System Default (USB)',
                      defaultSystemType: 'usb'
                    })}
                    className={`flex-1 py-3 px-4 rounded-xl border text-left transition-all font-sans cursor-pointer ${
                      config.defaultSystemType === 'usb'
                        ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/40 text-[#ffc53d]'
                        : 'bg-[#0e0e0d] border-white/10 text-[#e5e2e1]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">USB Cable</span>
                      <span className="material-symbols-outlined text-sm">{config.defaultSystemType === 'usb' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setConfig({
                      type: 'browser',
                      name: 'System Default (Bluetooth)',
                      defaultSystemType: 'bluetooth'
                    })}
                    className={`flex-1 py-3 px-4 rounded-xl border text-left transition-all font-sans cursor-pointer ${
                      config.defaultSystemType === 'bluetooth'
                        ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/40 text-[#ffc53d]'
                        : 'bg-[#0e0e0d] border-white/10 text-[#e5e2e1]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">Bluetooth Wireless</span>
                      <span className="material-symbols-outlined text-sm">{config.defaultSystemType === 'bluetooth' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                    </div>
                  </button>
                </div>

                <div className="pt-2 text-[10.5px] text-[#A69984]/65 leading-relaxed border-t border-white/5">
                  Compatible with any standard printer configured in your operating system. WebUSB or WebBluetooth direct print will be dispatched.
                </div>
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
                    type="button"
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
                    type="button"
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
                {hasDriverLockError && !dismissedDriverLock && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-rose-400 text-lg">warning</span>
                      <div>
                        <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Driver Conflict Detected</h5>
                        <p className="text-[11px] text-rose-400/80 leading-relaxed">
                          Windows Print Spooler is locking this USB device. We attempted Browser Print fallback automatically. To fix this permanently, remove the printer from Windows Settings.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSelectBrowser} className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer">
                        Use Browser Print
                      </button>
                      <button onClick={() => setDismissedDriverLock(true)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#A69984] rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Console & Test */}
        <div className="lg:col-span-5">
          
          {/* Unified Connection Status & Test Card */}
          <div className="bg-[#161513]/90 border border-white/5 p-6 rounded-2xl space-y-5">
            <div className="select-none">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#ffe2ab]">Connection Status & Diagnostic</h3>
              <p className="text-[11px] text-[#A69984]/65 mt-1 leading-relaxed">
                Check current printer hardware handshake status and dispatch a diagnostic loopback receipt test.
              </p>
            </div>

            {/* Current status display */}
            <div className="pt-2">
              {status === 'connected' ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-sans">
                  <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Printer Ready</h5>
                    <p className="text-[11px] text-emerald-400/80 leading-relaxed font-semibold">
                      Hardware interface is stable and ready to accept print commands.
                    </p>
                  </div>
                </div>
              ) : status === 'connecting' ? (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl font-sans">
                  <span className="material-symbols-outlined text-amber-400 animate-spin">progress_activity</span>
                  <div>
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Connecting...</h5>
                    <p className="text-[11px] text-amber-400/80 leading-relaxed font-semibold">
                      Attempting to establish handshake with the printer...
                    </p>
                  </div>
                </div>
              ) : hasDriverLockError ? (
                <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl font-sans">
                  <span className="material-symbols-outlined text-rose-400 font-bold">warning</span>
                  <div>
                    <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Driver Conflict</h5>
                    <p className="text-[11px] text-rose-400/80 leading-relaxed font-semibold">
                      OS level lock detected. Using Browser Print fallback.
                    </p>
                  </div>
                </div>
              ) : status === 'error' ? (
                <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl font-sans">
                  <span className="material-symbols-outlined text-rose-400">error</span>
                  <div>
                    <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Connection Error</h5>
                    <p className="text-[11px] text-rose-400/80 leading-relaxed font-semibold">
                      Printer is offline or inaccessible. Check cables or pairing.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl font-sans">
                  <span className="material-symbols-outlined text-[#A69984]">sleep</span>
                  <div>
                    <h5 className="text-xs font-bold text-[#A69984] uppercase tracking-wider mb-1">Idle</h5>
                    <p className="text-[11px] text-[#A69984]/80 leading-relaxed font-semibold">
                      No active hardware session. Will connect on next print.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {config.type === 'browser' && status === 'connected' && (
              <div className="flex items-center gap-2 text-[10px] text-amber-400/80 font-medium bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg font-sans">
                <span className="material-symbols-outlined text-sm">info</span>
                Test print will open your browser's print dialog.
              </div>
            )}

            {/* Test Actions */}
            <div className="pt-2 flex flex-col gap-3">
              <button 
                type="button"
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

            {/* HTTPS Security Origin Status Badge */}
            <div className={`p-3.5 border rounded-xl font-sans text-xs flex items-center justify-between ${
              isSecure 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-base">{isSecure ? 'lock' : 'lock_open'}</span>
                <span>Origin Security Context: {isSecure ? 'HTTPS / Secure Context' : 'HTTP / Unsecure'}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-black/30">
                {isSecure ? 'WebUSB & Bluetooth Enabled' : 'Limited Access'}
              </span>
            </div>

            {/* Thermal Receipt Print Customization Card */}
            <div className="bg-[#161513] border border-white/5 rounded-2xl p-5 space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#ffe2ab]">receipt_long</span>
                  Thermal Receipt Layout
                </h4>
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  className="px-3 py-1 bg-[#ffe2ab] text-[#402d00] hover:bg-[#ffdca0] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Save Layout
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider mb-1">
                    Business Name / Header Title
                  </label>
                  <input
                    type="text"
                    value={customHeader}
                    onChange={(e) => setCustomHeader(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#ffe2ab]/40"
                    placeholder="e.g. DinePOS Executive Dining"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider">
                      {taxRegType === 'VAT' ? 'VAT Registration Number' : 'PAN Registration Number'}
                    </label>
                    <div className="inline-flex rounded-lg overflow-hidden border border-white/10 p-0.5 bg-[#0e0e0d]">
                      <button
                        type="button"
                        onClick={() => setTaxRegType('VAT')}
                        className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${taxRegType === 'VAT' ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white/60 hover:text-white'}`}
                      >
                        VAT
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxRegType('PAN')}
                        className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${taxRegType === 'PAN' ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white/60 hover:text-white'}`}
                      >
                        PAN
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={customVat}
                    onChange={(e) => setCustomVat(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#ffe2ab]/40 uppercase"
                    placeholder={taxRegType === 'VAT' ? 'e.g. VAT No: 301234567' : 'e.g. PAN No: 601234567'}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider">
                      Thermal Paper Roll Width
                    </label>
                    <div className="inline-flex rounded-lg overflow-hidden border border-white/10 p-0.5 bg-[#0e0e0d]">
                      <button
                        type="button"
                        onClick={() => setPaperWidth('58mm')}
                        className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${paperWidth === '58mm' ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white/60 hover:text-white'}`}
                      >
                        58mm (Mobile)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaperWidth('80mm')}
                        className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${paperWidth === '80mm' ? 'bg-[#ffe2ab] text-[#402d00]' : 'text-white/60 hover:text-white'}`}
                      >
                        80mm (Standard)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider mb-1">
                    Receipt Footer Message
                  </label>
                  <input
                    type="text"
                    value={customFooter}
                    onChange={(e) => setCustomFooter(e.target.value)}
                    className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#ffe2ab]/40"
                    placeholder="e.g. THANK YOU FOR DINING WITH US!"
                  />
                </div>
              </div>

              {/* Live Receipt Preview */}
              <div className="mt-4 flex justify-center">
                <PrintableReceipt
                  variant="light-print"
                  establishmentName={customHeader}
                  taxId={customVat}
                  taxRegistrationType={taxRegType}
                  thankYouMessage={customFooter}
                  restaurantLogo={headerLogo}
                  paperWidth={paperWidth}
                />
              </div>
            </div>

            {/* Active connection details */}
            <div className="bg-[#0e0e0d] border border-white/5 rounded-xl p-3 space-y-1 font-sans">
              <div className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider select-none">Active Connection</div>
              <div className="text-xs text-white font-semibold">{config.type.toUpperCase()} — {config.name}</div>
            </div>

            {/* Real-time Hardware Diagnostic Logs Terminal */}
            <div className="bg-[#0c0c0b] border border-white/5 rounded-xl p-3.5 space-y-2 font-mono">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 select-none">
                <span className="text-[10px] text-[#ffc53d] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffc53d] animate-pulse"></span>
                  Console Diagnostic Stream
                </span>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="text-[9px] text-[#A69984]/60 hover:text-white transition-colors cursor-pointer uppercase font-bold"
                  >
                    Clear Logs
                  </button>
                )}
              </div>
              <div ref={logContainerRef} className="max-h-36 overflow-y-auto space-y-1 text-[10px] text-[#A69984] leading-relaxed scrollbar-thin">
                {logs.length === 0 ? (
                  <p className="text-[#A69984]/40 italic">No hardware activity recorded yet. Run a test print to verify protocol response.</p>
                ) : (
                  logs.slice(-10).map((log, idx) => (
                    <div key={idx} className="break-all font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* GLOBAL TOAST BANNER */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 ${
          toast.type === 'success'
            ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/25 text-[#ffc53d]'
            : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
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
