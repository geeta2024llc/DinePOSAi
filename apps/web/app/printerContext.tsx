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
  kickCashDrawer: () => Promise<void>;
  testPrint: () => Promise<void>;
  clearLogs: () => void;
  disconnect: () => void;
  forgetConfig: () => void;
}

const defaultContext: PrinterContextType = {
  config: { type: 'browser', name: 'Browser Print' },
  status: 'idle',
  logs: [],
  setConfig: () => {},
  scanAndPair: async () => {},
  printReceipt: async () => {},
  kickCashDrawer: async () => {},
  testPrint: async () => {},
  clearLogs: () => {},
  disconnect: () => {},
  forgetConfig: () => {}
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
          const loadedConfig = JSON.parse(saved);
          setConfigState(loadedConfig);
          // Only set to connected if it's a browser or network printer which doesn't need a hardware handshake
          if (loadedConfig.type === 'browser' || loadedConfig.type === 'network') {
            setStatus('connected');
          } else {
            setStatus('idle');
          }
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

  const disconnect = () => {
    service.disconnect(addLog);
    setStatus('idle');
    addLog('Printer disconnected by user.');
  };

  const forgetConfig = () => {
    service.disconnect(addLog);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dinepos_printer_config');
    }
    setConfigState({ type: 'browser', name: 'Browser Print' });
    setStatus('idle');
    addLog('Printer configuration forgotten and reset.');
  };

  const setConfig = (newCfg: PrinterConfig) => {
    setConfigState(newCfg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_printer_config', JSON.stringify(newCfg));
    }
    addLog(`Printer config updated: ${newCfg.type.toUpperCase()} - ${newCfg.name}`);
    if (newCfg.type === 'browser' || newCfg.type === 'network') {
      setStatus('connected');
    } else {
      setStatus('idle');
    }
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

  const kickCashDrawer = async () => {
    try {
      setStatus('connecting');
      await service.kickCashDrawer(config, addLog);
      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      addLog(`❌ Cash drawer kick failed: ${err.message || err}`);
    }
  };

  const testPrint = async () => {
    let subtotal = 100.00;
    let taxRate = 0.08;
    let taxVal = 8.00;
    let serviceChargeVal = 10.00;
    let discountVal = 10.00;
    let totalVal = 108.00;

    if (typeof window !== 'undefined') {
      try {
        const { getStoredInvoiceConfig } = await import('../src/utils/invoiceConfig');
        const invConfig = getStoredInvoiceConfig();
        subtotal = 100.00;
        taxRate = invConfig.taxRate ? (invConfig.taxRate < 1 ? invConfig.taxRate : invConfig.taxRate / 100) : 0.08;
        taxVal = invConfig.taxType === 'pre-tax' ? subtotal * taxRate : subtotal - (subtotal / (1 + taxRate));
        serviceChargeVal = invConfig.showServiceCharge ? subtotal * ((invConfig.serviceChargeRate || 10) / 100) : 0;
        discountVal = invConfig.showDiscount ? (invConfig.discountType === 'percent' ? subtotal * ((invConfig.discountValue || 10) / 100) : (invConfig.discountValue || 10)) : 0;
        totalVal = (invConfig.taxType === 'pre-tax' ? subtotal + taxVal : subtotal) + serviceChargeVal - discountVal;
      } catch (e) {}
    }

    const testData: PrintReceiptData = {
      tableNumber: 'T-14',
      orderId: '2345',
      items: [
        { name: 'Truffle Wagyu Sliders', quantity: 2, price: 24.00 },
        { name: 'Lobster Bisque', quantity: 1, price: 18.00 },
        { name: 'Vintage Cabernet (G)', quantity: 2, price: 17.00 }
      ],
      subtotal: subtotal,
      taxRate: taxRate,
      tax: taxVal,
      taxType: 'pre-tax',
      serviceCharge: serviceChargeVal,
      total: totalVal,
      isPaid: true,
      paymentMethod: 'Credit Card',
      authCode: 'OK-200'
    };
    addLog('Initiating Self-Test Print (using Live Preview settings)...');
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
        kickCashDrawer,
        testPrint,
        clearLogs,
        disconnect,
        forgetConfig
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  return useContext(PrinterContext);
}
