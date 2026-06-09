'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PrinterService, PrinterConfig, PrintReceiptData } from './printerService';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface PrinterContextType {
  config: PrinterConfig;
  status: ConnectionStatus;
  logs: string[];
  setConfig: (cfg: PrinterConfig) => void;
  scanAndPair: (type: 'bluetooth' | 'usb') => Promise<void>;
  printReceipt: (data: PrintReceiptData) => Promise<void>;
  testPrint: () => Promise<void>;
  clearLogs: () => void;
}

const defaultContext: PrinterContextType = {
  config: { type: 'browser', name: 'Browser Print' },
  status: 'idle',
  logs: [],
  setConfig: () => {},
  scanAndPair: async () => {},
  printReceipt: async () => {},
  testPrint: async () => {},
  clearLogs: () => {}
};

const PrinterContext = createContext<PrinterContextType>(defaultContext);

export function PrinterProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<PrinterConfig>({ type: 'browser', name: 'Browser Print' });
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const service = useMemo(() => new PrinterService(), []);

  // Load configuration from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dinepos_printer_config');
      if (saved) {
        try {
          setConfigState(JSON.parse(saved));
          setStatus('connected'); // Config exists, assume ready
        } catch (e) {
          console.error('Failed to parse printer config:', e);
        }
      }
    }
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`]);
  };

  const clearLogs = () => setLogs([]);

  const setConfig = (newCfg: PrinterConfig) => {
    setConfigState(newCfg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_printer_config', JSON.stringify(newCfg));
    }
    addLog(`Printer config updated: ${newCfg.type.toUpperCase()} - ${newCfg.name}`);
    setStatus('connected');
  };

  const scanAndPair = async (type: 'bluetooth' | 'usb') => {
    setStatus('connecting');
    addLog(`Searching for ${type} printer...`);
    try {
      const name = await service.scanForDevice(type, addLog);
      const newCfg: PrinterConfig = { type, name };
      setConfig(newCfg);
      setStatus('connected');
      addLog(`✓ Paired successfully with device: ${name}`);
    } catch (err: any) {
      setStatus('error');
      addLog(`❌ Scanning failed: ${err.message || err}`);
      throw err;
    }
  };

  const printReceipt = async (data: PrintReceiptData) => {
    try {
      setStatus('connecting');
      await service.print(config, data, addLog);
      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      addLog(`❌ Printing failed: ${err.message || err}`);
      throw err;
    }
  };

  const testPrint = async () => {
    const testData: PrintReceiptData = {
      tableNumber: 99,
      orderId: 'TEST-12345',
      items: [
        { name: 'System Diagnostic Test', quantity: 1, price: 0.00, course: 'system' },
        { name: 'Paper Feed Validation', quantity: 2, price: 0.00, course: 'system' }
      ],
      subtotal: 0.00,
      taxRate: 0.10,
      tax: 0.00,
      taxType: 'pre-tax',
      serviceCharge: 0.00,
      total: 0.00,
      isPaid: true,
      paymentMethod: 'Internal Loopback',
      authCode: 'OK-200'
    };
    addLog('Initiating Self-Test Print...');
    await printReceipt(testData);
  };

  return (
    <PrinterContext.Provider
      value={{
        config,
        status,
        logs,
        setConfig,
        scanAndPair,
        printReceipt,
        testPrint,
        clearLogs
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  return useContext(PrinterContext);
}
