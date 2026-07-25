import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EscposEncoder } from './escposEncoder';
import { BluetoothPrinter } from '../src/utils/bluetoothPrinter';
import { PrintableReceipt } from '../src/components/dashboard/PrintableReceipt';

export type PrinterType = 'bluetooth' | 'usb' | 'serial' | 'network' | 'browser';

export interface PrinterConfig {
  type: PrinterType;
  name: string;
  ip?: string;
  port?: number;
  defaultSystemType?: 'usb' | 'bluetooth';
  customHeaderText?: string;
  customVatId?: string;
  customFooterText?: string;
  headerLogoUrl?: string;
}

export interface PrintReceiptData {
  tableNumber: number | string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    modifiers?: string[];
    notes?: string;
    course?: string;
  }>;
  subtotal: number;
  taxRate: number;
  tax: number;
  taxType: 'pre-tax' | 'post-tax';
  serviceCharge: number;
  total: number;
  isPaid: boolean;
  paymentMethod?: string;
  authCode?: string;
  kickDrawer?: boolean;
}

export class PrinterService {
  private activeBluetoothDevice: any = null;
  private activeUsbDevice: any = null;
  private btPrinter = new BluetoothPrinter();

  async print(config: PrinterConfig, data: PrintReceiptData, onLog: (msg: string) => void): Promise<void> {
    onLog(`Starting print job for Order ${data.orderId} (Type: ${config.type})...`);

    if (config.type === 'browser') {
      if (config.defaultSystemType === 'bluetooth') {
        onLog('Routing default system print to Bluetooth...');
        const bytes = this.encodeReceipt(data);
        await this.printBluetooth(bytes, onLog);
        return;
      } else if (config.defaultSystemType === 'usb') {
        onLog('Routing default system print to USB...');
        const bytes = this.encodeReceipt(data);
        await this.printUsb(bytes, data, onLog);
        return;
      }
      onLog('Dispatching print job to system browser print dialog...');
      this.printBrowserReceipt(data, onLog);
      return;
    }

    if (config.type === 'network') {
      onLog(`Connecting to Network printer at ${config.ip || '127.0.0.1'}:${config.port || 9100}...`);
      onLog('Rendering ticket with thermal page layout formatting...');
      this.printBrowserReceipt(data, onLog);
      return;
    }

    // Generate ESC/POS bytes for Bluetooth and USB
    onLog('Encoding ticket details into ESC/POS binary stream...');
    const bytes = this.encodeReceipt(data);
    onLog(`Encoded ESC/POS data: ${bytes.length} bytes.`);

    if (config.type === 'bluetooth') {
      await this.printBluetooth(bytes, onLog);
    } else if (config.type === 'usb') {
      await this.printUsb(bytes, data, onLog);
    } else if (config.type === 'serial') {
      await this.printSerial(bytes, onLog);
    }
  }

  async kickCashDrawer(config: PrinterConfig, onLog: (msg: string) => void): Promise<void> {
    onLog(`Triggering Cash Drawer Solenoid Pulse (Printer Type: ${config.type})...`);

    let targetType = config.type;
    if (config.type === 'browser' && config.defaultSystemType) {
      targetType = config.defaultSystemType;
    }

    if (targetType === 'browser' || targetType === 'network') {
      onLog('Pulse trigger bypassed for browser/network configurations.');
      return;
    }

    const encoder = new EscposEncoder();
    encoder.init().pulseDrawer(0, 48, 240);
    const bytes = encoder.getBytes();

    if (targetType === 'bluetooth') {
      await this.printBluetooth(bytes, onLog);
    } else if (targetType === 'usb') {
      await this.printUsb(bytes, null, onLog);
    }
    onLog('✓ Drawer kick pulse transmitted.');
  }

  private encodeReceipt(data: PrintReceiptData): Uint8Array {
    let customHeader = 'DinePosAi';
    let customVat = 'VAT ID: US-994827104';
    let customFooter = 'THANK YOU FOR DINING WITH US!';

    if (typeof window !== 'undefined') {
      const storedConfigStr = localStorage.getItem('dinepos_printer_config');
      if (storedConfigStr) {
        try {
          const storedConfig = JSON.parse(storedConfigStr);
          if (storedConfig.customHeaderText) customHeader = storedConfig.customHeaderText;
          if (storedConfig.customVatId) customVat = storedConfig.customVatId;
          if (storedConfig.customFooterText) customFooter = storedConfig.customFooterText;
        } catch (e) {}
      }
    }

    const encoder = new EscposEncoder();

    encoder.init()
      .align('center')
      .size(true)
      .line(customHeader)
      .size(false)
      .line(customVat)
      .line('------------------------------------------------')
      .align('left')
      .line(`TABLE: ${data.tableNumber}     ORDER #${data.orderId}`)
      .line(`DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      .line('------------------------------------------------');

    data.items.forEach((item) => {
      const priceStr = `$${(item.price * item.quantity).toFixed(2)}`;
      const nameStr = `${item.quantity}x ${item.name}`;
      encoder.line(`${nameStr.padEnd(36)}${priceStr.padStart(12)}`);
      if (item.modifiers && item.modifiers.length > 0) {
        encoder.line(`   + ${item.modifiers.join(', ')}`);
      }
      if (item.notes) {
        encoder.line(`   NOTE: "${item.notes}"`);
      }
    });

    encoder.line('------------------------------------------------')
      .align('right')
      .line(`SUBTOTAL: $${data.subtotal.toFixed(2)}`)
      .line(`TAX (${(data.taxRate * 100).toFixed(1)}%): $${data.tax.toFixed(2)}`)
      .line(`SERVICE CHARGE: $${data.serviceCharge.toFixed(2)}`)
      .line('================================================')
      .size(true)
      .line(`GRAND TOTAL: $${data.total.toFixed(2)}`)
      .size(false)
      .line('================================================')
      .align('center')
      .feed(1);

    if (data.isPaid) {
      encoder.line('*** PAYMENT CONFIRMED ***')
        .line(`METHOD: ${data.paymentMethod || 'CREDIT CARD'}`);
    } else {
      encoder.line('*** BALANCE DUE ***');
    }

    encoder.feed(2)
      .line(customFooter)
      .feed(2)
      .cut();

    return encoder.getBytes();
  }

  private printBrowserReceipt(data: PrintReceiptData, onLog: (msg: string) => void): void {
    if (typeof window === 'undefined') {
      onLog('⚠️ Browser print not available in this environment.');
      return;
    }

    let customHeader = 'DinePosAi';
    let customVat = '301234567';
    let customFooter = 'THANK YOU FOR DINING WITH US AT DINEPOSAI! WE HOPE TO SEE YOU AGAIN SOON.';
    let customLogo = '';
    let taxRegType: 'VAT' | 'PAN' = 'VAT';
    let socialEnabled = false;
    let socialLinksObj: any = null;

    try {
      const savedLogo = localStorage.getItem('dinepos_restaurant_logo');
      if (savedLogo) customLogo = savedLogo;

      const storedConfigStr = localStorage.getItem('dinepos_printer_config');
      if (storedConfigStr) {
        const storedConfig = JSON.parse(storedConfigStr);
        if (storedConfig.customHeaderText) customHeader = storedConfig.customHeaderText;
        if (storedConfig.customVatId) customVat = storedConfig.customVatId;
        if (storedConfig.customFooterText) customFooter = storedConfig.customFooterText;
        if (storedConfig.headerLogoUrl && !customLogo) customLogo = storedConfig.headerLogoUrl;
      }
      
      const savedEstName = localStorage.getItem('dinepos_establishment_name');
      if (savedEstName) customHeader = savedEstName;

      const savedTaxId = localStorage.getItem('dinepos_tax_id');
      if (savedTaxId) customVat = savedTaxId;

      const savedRegType = localStorage.getItem('dinepos_tax_registration_type');
      if (savedRegType === 'VAT' || savedRegType === 'PAN') taxRegType = savedRegType as 'VAT' | 'PAN';

      const savedSocial = localStorage.getItem('dinepos_social_media_enabled');
      if (savedSocial === 'true') socialEnabled = true;

      const savedLinks = localStorage.getItem('dinepos_social_links');
      if (savedLinks) {
        try { socialLinksObj = JSON.parse(savedLinks); } catch(e){}
      }
    } catch (e) {}

    // Render single-source PrintableReceipt component to static HTML markup
    const componentMarkup = renderToStaticMarkup(
      React.createElement(PrintableReceipt, {
        variant: 'light-print',
        establishmentName: customHeader,
        taxId: customVat,
        taxRegistrationType: taxRegType,
        tableNumber: data.tableNumber,
        orderId: data.orderId,
        items: data.items,
        subtotal: data.subtotal,
        taxRate: data.taxRate ? (data.taxRate < 1 ? data.taxRate * 100 : data.taxRate) : 8,
        taxAmount: data.tax,
        taxType: data.taxType,
        serviceChargeAmount: data.serviceCharge,
        grandTotal: data.total,
        paymentMethod: data.paymentMethod || 'Credit Card',
        thankYouMessage: customFooter,
        restaurantLogo: customLogo,
        showSocialMedia: socialEnabled,
        socialLinks: socialLinksObj,
        showQrCode: false
      })
    );

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
<title>Receipt - ${data.orderId}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @media print {
    @page { margin: 2mm 3mm; size: 80mm auto; }
    html, body { width: 100%; background: #ffffff !important; margin: 0; padding: 0; }
    * { color: #000000 !important; }
  }
</style>
</head>
<body class="bg-white text-black p-2 flex justify-center items-start">
  ${componentMarkup}
</body>
</html>`;

    let iframe = document.getElementById('dinepos_silent_printer_iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'dinepos_silent_printer_iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(receiptHtml);
      doc.close();
      
      // Delay slightly to ensure browser has rendered and loaded styles
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          onLog('✓ Print job spooled silently through hidden iframe.');
        } else {
          onLog('❌ contentWindow not available on printing iframe.');
        }
      }, 250);
    } else {
      onLog('❌ Could not write to printing iframe.');
    }
  }

  private async printBluetooth(bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    if (!this.activeBluetoothDevice) {
      throw new Error('No Bluetooth device connected.');
    }
    this.btPrinter.setDevice(this.activeBluetoothDevice, onLog);
    await this.btPrinter.print(bytes, onLog);
  }

  private async printUsb(bytes: Uint8Array, data: PrintReceiptData | null, onLog: (msg: string) => void): Promise<void> {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.usb) {
      onLog('❌ WebUSB is not supported on this browser.');
      throw new Error('WebUSB not supported.');
    }

    if (!this.activeUsbDevice) {
      const existingDevices = await nav.usb.getDevices();
      const printerDevices = existingDevices.filter((d: any) => d.configurations?.some(
        (cfg: any) => cfg.interfaces?.some(
          (iface: any) => iface.alternates?.some((alt: any) => alt.interfaceClass === 7 || alt.interfaceClass === 0xff)
        )
      ));

      if (printerDevices.length > 0) {
        onLog(`Found ${printerDevices.length} paired printer(s). Using: ${printerDevices[0].productName || 'USB Printer'}`);
        this.activeUsbDevice = printerDevices[0];
      } else {
        onLog('No paired printers found. Requesting device selection...');
        this.activeUsbDevice = await nav.usb.requestDevice({
          filters: [{ classCode: 7 }, { classCode: 0xff }]
        });
      }
    }

    if (this.activeUsbDevice.opened) {
      onLog('USB device already open. Writing directly...');
      try {
        await this.usbWriteBytes(this.activeUsbDevice, bytes, onLog);
        onLog('✓ USB Print job dispatched successfully.');
        return;
      } catch (writeErr: any) {
        onLog(`⚠️ Direct write failed (${writeErr.message}). Will attempt reconnect...`);
        try { await this.activeUsbDevice.close(); } catch(e){}
      }
    }

    let accessDenied = false;
    try {
      if (!this.activeUsbDevice.opened) {
        onLog(`Opening USB device...`);
        await this.activeUsbDevice.open();
      }
    } catch (err: any) {
      if (err.message?.includes('Access denied')) {
        accessDenied = true;
      } else {
        throw err;
      }
    }

    if (accessDenied) {
        onLog('⚠️ Access denied — Windows driver lock detected. Attempting Browser Print Fallback...');
        if (data) {
          try {
            this.printBrowserReceipt(data, onLog);
            return;
          } catch(fallbackErr) {
              onLog('❌ Browser Print fallback failed.');
          }
        } else {
          onLog('⚠️ No receipt data available for browser fallback.');
        }
        
        const deviceName = this.activeUsbDevice?.productName || 'USB Printer';
        onLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        onLog('❌ USB ACCESS DENIED — Windows driver lock detected');
        onLog('');
        onLog('TO FIX THIS (If Browser Print isn\'t sufficient):');
        onLog('');
        onLog('OPTION A (Recommended): Remove the Windows printer');
        onLog('  1. Open Windows Settings → Bluetooth & devices → Printers & scanners');
        onLog(`  2. Find "${deviceName}" and click Remove`);
        onLog('  3. Unplug and replug the USB cable');
        onLog('  4. Try printing again');
        onLog('');
        onLog('OPTION B: Use Bluetooth instead of USB');
        onLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error('Access denied - Windows Driver Lock');
    }

    try {
      onLog('Selecting USB configuration...');
      await this.activeUsbDevice.selectConfiguration(1);

      onLog('Scanning for usable interface...');
      let claimed = false;
      
      // Try to claim any printer (7) or vendor (0xff) interface
      for (const iface of this.activeUsbDevice.configuration.interfaces) {
          const isPrinterOrVendor = iface.alternates.some((alt: any) => alt.interfaceClass === 7 || alt.interfaceClass === 0xff);
          if (isPrinterOrVendor) {
              try {
                  onLog(`Attempting to claim interface ${iface.interfaceNumber}...`);
                  await this.activeUsbDevice.claimInterface(iface.interfaceNumber);
                  claimed = true;
                  break;
              } catch(e) {
                  onLog(`Could not claim interface ${iface.interfaceNumber}.`);
              }
          }
      }

      if (!claimed) {
          throw new Error("Could not claim any usable USB interface.");
      }

      await this.usbWriteBytes(this.activeUsbDevice, bytes, onLog);
      onLog('✓ USB Print job dispatched successfully.');
    } catch (err: any) {
      onLog(`❌ USB Print failed: ${err.message || err}`);
      try { await this.activeUsbDevice.close(); } catch(e) {}
      throw err;
    }
  }

  private async usbWriteBytes(device: any, bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    let endpoint = null;
    for (const inst of device.configuration?.interfaces || []) {
      if (!inst.claimed) continue; // Only check claimed interfaces
      for (const alt of inst.alternates) {
        if (alt.interfaceClass === 7 || alt.interfaceClass === 0xff) {
          for (const ep of alt.endpoints) {
            if (ep.direction === 'out' && ep.type === 'bulk') {
              endpoint = ep;
              break;
            }
          }
        }
      }
      if (endpoint) break;
    }

    if (!endpoint) {
      throw new Error('No Bulk Out endpoint found on USB printer.');
    }

    onLog(`Transmitting to bulk endpoint ${endpoint.endpointNumber}...`);
    await device.transferOut(endpoint.endpointNumber, bytes);
  }

  // Helper to trigger device scan for dashboard settings page
  async scanForDevice(type: 'bluetooth' | 'usb', onLog: (msg: string) => void): Promise<string> {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (type === 'bluetooth') {
      if (!nav || !nav.bluetooth) throw new Error('Web Bluetooth not supported.');
      onLog('Initiating Web Bluetooth scanner...');
      
      const dev = await this.btPrinter.requestDevice(onLog);
      this.activeBluetoothDevice = dev;
      return dev.name || 'Bluetooth Printer';
    } else {
      if (!nav || !nav.usb) throw new Error('WebUSB not supported.');
      onLog('Initiating WebUSB scanner...');

      // Check for already-paired devices first
      const existingDevices = await nav.usb.getDevices();
      const printerDevices = existingDevices.filter((d: any) => d.configurations?.some(
        (cfg: any) => cfg.interfaces?.some(
          (iface: any) => iface.alternates?.some((alt: any) => alt.interfaceClass === 7 || alt.interfaceClass === 0xff)
        )
      ));

      if (printerDevices.length > 0) {
        onLog(`Found ${printerDevices.length} paired printer(s).`);
        this.activeUsbDevice = printerDevices[0];
        return printerDevices[0].productName || 'USB Printer';
      }

      // Prompt user with POS-8360-L & thermal printer vendor filters + fallback
      let dev: any = null;
      try {
        dev = await nav.usb.requestDevice({
          filters: [
            { classCode: 7 }, // USB Printer Class
            { classCode: 0xff }, // Vendor Specific Class (POS-8360-L / Xprinter)
            { vendorId: 0x0483 }, // STMicroelectronics / POS-8360-L
            { vendorId: 0x0fe6 }, // ZJiang / POS-8360
            { vendorId: 0x04b8 }, // Epson ESC-POS Emulation
            { vendorId: 0x1a86 }, // CH340 USB-Serial Bridge
            { vendorId: 0x0403 }  // FTDI Serial Bridge
          ]
        });
      } catch (err: any) {
        if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) throw err;
        // Fallback to open filter selection if browser rejects classCode filter
        dev = await nav.usb.requestDevice({ filters: [] });
      }

      this.activeUsbDevice = dev;
      const vId = dev.vendorId ? `0x${dev.vendorId.toString(16).padStart(4, '0')}` : 'Unknown';
      const pId = dev.productId ? `0x${dev.productId.toString(16).padStart(4, '0')}` : 'Unknown';
      onLog(`✓ Selected USB Printer: ${dev.productName || 'POS-8360-L'} (Vendor ID: ${vId}, Product ID: ${pId})`);
      return dev.productName || `POS-8360-L (${vId}:${pId})`;
    }
  }

  async disconnect(onLog: (msg: string) => void): Promise<void> {
    if (this.activeBluetoothDevice && this.activeBluetoothDevice.gatt?.connected) {
      onLog('Disconnecting Bluetooth GATT...');
      this.btPrinter.disconnect();
      this.activeBluetoothDevice = null;
    }
    
    if (this.activeUsbDevice && this.activeUsbDevice.opened) {
      onLog('Closing USB device...');
      try {
        await this.activeUsbDevice.close();
      } catch (e) {
        onLog('Warning: Could not close USB device cleanly.');
      }
      this.activeUsbDevice = null;
    }
  }

  async printSerial(bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.serial) {
      onLog('❌ WebSerial API is not supported in this browser.');
      throw new Error('WebSerial is not supported in this browser environment. Use Chrome or Edge.');
    }

    onLog('Opening WebSerial COM Port interface...');
    try {
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      const writer = port.writable.getWriter();
      onLog('Transmitting binary ESC/POS payload to Serial COM port...');
      await writer.write(bytes);
      writer.releaseLock();
      await port.close();
      onLog('✓ WebSerial ESC/POS print job transmitted successfully.');
    } catch (err: any) {
      onLog(`❌ WebSerial print failed: ${err.message || err}`);
      throw err;
    }
  }

  async verifyConnection(config: PrinterConfig): Promise<boolean> {
    if (config.type === 'browser' || config.type === 'network') return true;
    
    if (config.type === 'bluetooth') {
      return !!(this.activeBluetoothDevice && this.activeBluetoothDevice.gatt?.connected);
    }
    
    if (config.type === 'usb') {
       return !!(this.activeUsbDevice && this.activeUsbDevice.opened);
    }
    
    return false;
  }
}
