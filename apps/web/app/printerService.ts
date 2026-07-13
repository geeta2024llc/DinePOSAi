import { EscposEncoder } from './escposEncoder';
import { BluetoothPrinter } from '../src/utils/bluetoothPrinter';

export type PrinterType = 'bluetooth' | 'usb' | 'network' | 'browser';

export interface PrinterConfig {
  type: PrinterType;
  name: string;
  ip?: string;
  port?: number;
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
}

export class PrinterService {
  private activeBluetoothDevice: any = null;
  private activeUsbDevice: any = null;
  private btPrinter = new BluetoothPrinter();

  async print(config: PrinterConfig, data: PrintReceiptData, onLog: (msg: string) => void): Promise<void> {
    onLog(`Starting print job for Order ${data.orderId} (Type: ${config.type})...`);

    if (config.type === 'browser') {
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

    if (config.type === 'browser' || config.type === 'network') {
      onLog('Pulse trigger bypassed for browser/network configurations.');
      return;
    }

    const encoder = new EscposEncoder();
    encoder.init().pulseDrawer(0, 48, 240);
    const bytes = encoder.getBytes();

    if (config.type === 'bluetooth') {
      await this.printBluetooth(bytes, onLog);
    } else if (config.type === 'usb') {
      await this.printUsb(bytes, null, onLog);
    }
    onLog('✓ Drawer kick pulse transmitted.');
  }

  private encodeReceipt(data: PrintReceiptData): Uint8Array {
    const encoder = new EscposEncoder();
    encoder.init()
      .align('center')
      .size(true)
      .bold(true)
      .line('DinePosAi')
      .size(false)
      .bold(false)
      .line('Aura Hospitality Group')
      .line('1200 Gastronomy Way, Suite 400')
      .line('New York, NY 10001')
      .line('+1 (212) 555-0198')
      .line('================================================')
      .align('left')
      .line(`Table: ${data.tableNumber}`)
      .line(`Order ID: ${data.orderId}`)
      .line(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      .line('------------------------------------------------');

    data.items.forEach(item => {
      const itemPrice = item.price * item.quantity;
      const leftCol = `${item.name.slice(0, 30)} x${item.quantity}`;
      const rightCol = `$${itemPrice.toFixed(2)}`;
      const dots = '.'.repeat(Math.max(2, 48 - leftCol.length - rightCol.length));
      encoder.line(`${leftCol}${dots}${rightCol}`);
      
      if (item.modifiers && item.modifiers.length > 0) {
        encoder.line(`  (${item.modifiers.join(', ')})`);
      }
      if (item.notes) {
        encoder.line(`  Note: "${item.notes}"`);
      }
    });

    encoder.line('------------------------------------------------')
      .align('right')
      .line(`Subtotal: $${data.subtotal.toFixed(2)}`)
      .line(`Tax (${(data.taxRate * 100).toFixed(1)}%): $${data.tax.toFixed(2)}`)
      .line(`Auto-Gratuity (20%): $${data.serviceCharge.toFixed(2)}`)
      .line('================================================')
      .bold(true)
      .line(`TOTAL: $${data.total.toFixed(2)}`)
      .bold(false)
      .align('center')
      .feed(2);

    if (data.isPaid) {
      encoder.line('*** PAYMENT CONFIRMED ***')
        .line(`Method: ${data.paymentMethod || 'Credit Card'}`)
        .line(`Auth: ${data.authCode || '**** 4242'}`);
    } else {
      encoder.line('*** BALANCE DUE ***');
    }

    encoder.feed(3)
      .line('Thank you for dining with us!')
      .feed(2)
      .cut();

    return encoder.getBytes();
  }

  private printBrowserReceipt(data: PrintReceiptData, onLog: (msg: string) => void): void {
    if (typeof window === 'undefined') {
      onLog('⚠️ Browser print not available in this environment.');
      return;
    }

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const itemRows = data.items.map(item => {
      const itemPrice = item.price * item.quantity;
      const name = item.name.length > 30 ? item.name.slice(0, 30) : item.name;
      const leftCol = `${esc(name)} x${item.quantity}`;
      const rightCol = `$${itemPrice.toFixed(2)}`;
      const dots = '.'.repeat(Math.max(2, 48 - leftCol.length - rightCol.length));
      let modHtml = '';
      if (item.modifiers && item.modifiers.length > 0) {
        modHtml = `<div style="padding-left:12px;font-size:11px;color:#555;font-weight:900;">(${item.modifiers.map(m => esc(m)).join(', ')})</div>`;
      }
      let noteHtml = '';
      if (item.notes) {
        noteHtml = `<div style="padding-left:12px;font-size:11px;color:#555;font-weight:900;">Note: "${esc(item.notes)}"</div>`;
      }
      return `<div style="font-family:'Courier New',monospace;font-size:13px;white-space:pre;font-weight:900;">${leftCol}${dots}${rightCol}</div>${modHtml}${noteHtml}`;
    }).join('');

    const taxPct = (data.taxRate * 100).toFixed(1);
    const now = new Date();
    const dateStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
<title>Receipt - ${esc(data.orderId)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-weight:900; }
  body { background:#fff; padding:10px; font-family:'Courier New',monospace; }
  .receipt { max-width:300px; width:300px; margin:0 auto; }
  .center { text-align:center; }
  .sep { border:none; border-top:2px dashed #000; margin:10px 0; }
  .sep2 { border:none; border-top:1px dashed #999; margin:8px 0; }
  .totals td { padding:3px 0; font-size:13px; font-weight:900; }
  .total-row td { border-top:2px solid #000; padding-top:6px; font-size:15px; font-weight:900; }
  @media print { @page { margin:0; } body { padding:8px; } * { font-weight:900 !important; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="center">
    <div style="font-size:22px;font-weight:900;">DinePosAi</div>
    <div style="font-size:11px;">Aura Hospitality Group</div>
    <div style="font-size:11px;">1200 Gastronomy Way, Suite 400</div>
    <div style="font-size:11px;">New York, NY 10001</div>
    <div style="font-size:11px;">+1 (212) 555-0198</div>
  </div>
  <hr class="sep">
  <div style="font-size:12px;">
    <div>Table: ${data.tableNumber}</div>
    <div>Order ID: ${esc(data.orderId)}</div>
    <div>Date: ${dateStr}</div>
  </div>
  <hr class="sep2">
  ${itemRows}
  <hr class="sep2">
  <table class="totals" style="width:100%;">
    <tr><td>Subtotal:</td><td style="text-align:right;">$${data.subtotal.toFixed(2)}</td></tr>
    <tr><td>Tax (${taxPct}%):</td><td style="text-align:right;">$${data.tax.toFixed(2)}</td></tr>
    <tr><td>Auto-Gratuity (20%):</td><td style="text-align:right;">$${data.serviceCharge.toFixed(2)}</td></tr>
    <tr class="total-row"><td>TOTAL:</td><td style="text-align:right;">$${data.total.toFixed(2)}</td></tr>
  </table>
  <hr class="sep">
  ${data.isPaid ? `<div class="center" style="font-weight:900;margin:6px 0;">*** PAYMENT CONFIRMED ***</div>
  <div class="center" style="font-size:12px;">Method: ${esc(data.paymentMethod || 'Credit Card')}</div>
  <div class="center" style="font-size:12px;">Auth: ${esc(data.authCode || '**** 4242')}</div>` :
  `<div class="center" style="font-weight:900;margin:6px 0;">*** BALANCE DUE ***</div>`}
  <br>
  <div class="center" style="font-size:11px;">Thank you for dining with us!</div>
  <br><br>
</div>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=400,height=700');
    if (printWin) {
      printWin.document.write(receiptHtml);
      printWin.document.close();
      printWin.focus();
      printWin.print();
      onLog('✓ Print dialog dispatched.');
    } else {
      onLog('❌ Could not open print window. Check popup blocker.');
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
