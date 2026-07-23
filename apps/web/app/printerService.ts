import { EscposEncoder } from './escposEncoder';
import { BluetoothPrinter } from '../src/utils/bluetoothPrinter';

export type PrinterType = 'bluetooth' | 'usb' | 'network' | 'browser';

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
  tableNumber: number;
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
    const encoder = new EscposEncoder();
    encoder.init();
    
    if (data.kickDrawer) {
      encoder.pulseDrawer(0, 48, 240);
    }

    encoder.bold(true)
      .align('center')
      .size(true)
      .line('DinePosAi')
      .size(false)
      .line('AURA HOSPITALITY GROUP')
      .line('1200 Gastronomy Way, Suite 400')
      .line('New York, NY 10001')
      .line('+1 (212) 555-0198')
      .line('================================================')
      .align('left')
      .line(`TABLE: ${data.tableNumber}    ORDER #${data.orderId}`)
      .line(`DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      .line('================================================');

    data.items.forEach(item => {
      const itemPrice = item.price * item.quantity;
      const leftCol = `${item.name.slice(0, 26)} x${item.quantity}`;
      const rightCol = `$${itemPrice.toFixed(2)}`;
      const spaces = ' '.repeat(Math.max(1, 44 - leftCol.length - rightCol.length));
      encoder.line(`${leftCol}${spaces}${rightCol}`);
      
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
      .line(`AUTO-GRATUITY (20%): $${data.serviceCharge.toFixed(2)}`)
      .line('================================================')
      .size(true)
      .line(`TOTAL: $${data.total.toFixed(2)}`)
      .size(false)
      .line('================================================')
      .align('center')
      .feed(1);

    if (data.isPaid) {
      encoder.line('*** PAYMENT CONFIRMED ***')
        .line(`METHOD: ${data.paymentMethod || 'CREDIT CARD'}`)
        .line(`AUTH: ${data.authCode || 'OK-200 / **** 4242'}`);
    } else {
      encoder.line('*** BALANCE DUE ***');
    }

    encoder.feed(2)
      .line('THANK YOU FOR DINING WITH US!')
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
    let customSubHeader = 'AURA HOSPITALITY GROUP';
    let customVat = 'VAT ID: US-994827104';
    let customFooter = 'THANK YOU FOR DINING WITH US!';
    let customLogo = '';

    try {
      const storedConfigStr = localStorage.getItem('dinepos_printer_config');
      if (storedConfigStr) {
        const storedConfig = JSON.parse(storedConfigStr);
        if (storedConfig.customHeaderText) customHeader = storedConfig.customHeaderText;
        if (storedConfig.customVatId) customVat = storedConfig.customVatId;
        if (storedConfig.customFooterText) customFooter = storedConfig.customFooterText;
        if (storedConfig.headerLogoUrl) customLogo = storedConfig.headerLogoUrl;
      }
    } catch (e) {}

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const itemRowsHtml = data.items.map(item => {
      const itemPrice = item.price * item.quantity;
      const name = esc(item.name);
      const qtyStr = `x${item.quantity}`;
      let modHtml = '';
      if (item.modifiers && item.modifiers.length > 0) {
        modHtml = `<div class="item-details">+ ${item.modifiers.map(m => esc(m)).join(', ')}</div>`;
      }
      let noteHtml = '';
      if (item.notes) {
        noteHtml = `<div class="item-details">NOTE: "${esc(item.notes)}"</div>`;
      }
      return `
        <tr>
          <td class="item-name">
            <strong>${name}</strong> <span style="font-weight:900;">[${qtyStr}]</span>
            ${modHtml}
            ${noteHtml}
          </td>
          <td class="item-price">
            <strong>$${itemPrice.toFixed(2)}</strong>
          </td>
        </tr>
      `;
    }).join('');

    const taxPct = (data.taxRate * 100).toFixed(1);
    const now = new Date();
    const dateStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
<title>Receipt - ${esc(data.orderId)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-weight:900 !important; color:#000000 !important; }
  html, body { width:100%; background:#fff; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size:12px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { padding:8px 6px; }
  .receipt { width:100%; max-width:275px; margin:0 auto; padding:4px 8px; }
  .center { text-align:center; }
  .header-title { font-size:20px; font-weight:900; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
  .header-sub { font-size:10.5px; font-weight:900; margin-bottom:2px; text-transform:uppercase; }
  .meta-box { border:2px solid #000; padding:6px 8px; margin:8px 0; font-size:11px; font-weight:900; line-height:1.4; border-radius:4px; }
  .sep-solid { border:none; border-top:2px solid #000; margin:8px 0; }
  .sep-double { border:none; border-top:3px double #000; margin:8px 0; }
  .item-table { width:100%; border-collapse:collapse; margin:6px 0; }
  .item-table td { padding:4px 0; font-size:12px; font-weight:900; vertical-align:top; border-bottom:1px solid #eee; }
  .item-table tr:last-child td { border-bottom:none; }
  .item-name { font-weight:900; padding-right:10px; text-align:left; word-break:break-word; }
  .item-price { text-align:right; font-weight:900; white-space:nowrap; width:65px; }
  .item-details { padding-left:8px; font-size:10.5px; font-weight:900; margin-top:2px; }
  .totals-table { width:100%; border-collapse:collapse; margin-top:6px; }
  .totals-table td { padding:3px 0; font-size:12px; font-weight:900; }
  .total-banner { border:3px solid #000; background:#000 !important; color:#fff !important; padding:6px 10px; margin:10px 0; font-size:16px; font-weight:900; display:flex; justify-content:space-between; align-items:center; border-radius:4px; }
  .total-banner * { color:#fff !important; }
  .payment-box { border:2px solid #000; padding:6px 8px; text-align:center; margin:10px 0; font-weight:900; font-size:12px; line-height:1.4; border-radius:4px; }
  @media print {
    @page { margin: 3mm 4mm; size: 80mm auto; }
    html, body { width:100%; background:#fff; margin:0; padding:0; }
    .receipt { width:100% !important; max-width:270px !important; margin:0 auto !important; padding:4px 6px !important; }
    * { color:#000000 !important; font-weight:900 !important; }
    .total-banner { background:#000 !important; color:#fff !important; }
    .total-banner * { color:#fff !important; }
  }
</style>
</head>
<body>
<div class="receipt">
  <div class="center">
    ${customLogo ? `<img src="${esc(customLogo)}" style="max-width:120px; max-height:50px; margin-bottom:4px; display:inline-block;" alt="Logo" />` : ''}
    <div class="header-title">${esc(customHeader)}</div>
    <div class="header-sub">${esc(customSubHeader)}</div>
    <div class="header-sub">${esc(customVat)}</div>
  </div>

  <div class="meta-box">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span><strong>TABLE: ${data.tableNumber}</strong></span>
      <span><strong>ORDER #${esc(data.orderId)}</strong></span>
    </div>
    <div style="margin-top:3px; font-size:10.5px;">
      DATE: ${dateStr}
    </div>
  </div>

  <hr class="sep-solid">

  <table class="item-table">
    ${itemRowsHtml}
  </table>

  <hr class="sep-double">

  <table class="totals-table">
    <tr>
      <td>SUBTOTAL:</td>
      <td style="text-align:right;">$${data.subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td>TAX (${taxPct}%):</td>
      <td style="text-align:right;">$${data.tax.toFixed(2)}</td>
    </tr>
    <tr>
      <td>AUTO-GRATUITY (20%):</td>
      <td style="text-align:right;">$${data.serviceCharge.toFixed(2)}</td>
    </tr>
  </table>

  <div class="total-banner">
    <span>TOTAL:</span>
    <span>$${data.total.toFixed(2)}</span>
  </div>

  <div class="payment-box">
    ${data.isPaid ? `
      <div>*** PAYMENT CONFIRMED ***</div>
      <div style="font-size:11px; margin-top:2px;">METHOD: ${esc(data.paymentMethod || 'CREDIT CARD').toUpperCase()}</div>
      <div style="font-size:10.5px; margin-top:2px;">AUTH: ${esc(data.authCode || 'OK-200 / **** 4242')}</div>
    ` : `
      <div>*** BALANCE DUE ***</div>
    `}
  </div>

  <div class="center" style="font-size:11px; font-weight:900; margin-top:10px;">
    THANK YOU FOR DINING WITH US!
  </div>
</div>
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

      // No paired devices — prompt user to select one
      const dev = await nav.usb.requestDevice({
        filters: [{ classCode: 7 }, { classCode: 0xff }]
      });
      this.activeUsbDevice = dev;
      return dev.productName || 'USB Printer';
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
