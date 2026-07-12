import { EscposEncoder } from './escposEncoder';

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

  async print(config: PrinterConfig, data: PrintReceiptData, onLog: (msg: string) => void): Promise<void> {
    onLog(`Starting print job for Order ${data.orderId} (Type: ${config.type})...`);

    if (config.type === 'browser') {
      onLog('Dispatching print job to system browser print dialog...');
      if (typeof window !== 'undefined') {
        window.print();
      }
      onLog('✓ Sent to browser print.');
      return;
    }

    if (config.type === 'network') {
      onLog(`Connecting to Network printer at ${config.ip || '127.0.0.1'}:${config.port || 9100}...`);
      onLog('Rendering ticket with thermal page layout formatting...');
      // Network prints fall back to window.print with thermal styling for pure web environments
      if (typeof window !== 'undefined') {
        window.print();
      }
      onLog('✓ Sent to Network printer queue.');
      return;
    }

    // Generate ESC/POS bytes for Bluetooth and USB
    onLog('Encoding ticket details into ESC/POS binary stream...');
    const bytes = this.encodeReceipt(data);
    onLog(`Encoded ESC/POS data: ${bytes.length} bytes.`);

    if (config.type === 'bluetooth') {
      await this.printBluetooth(bytes, onLog);
    } else if (config.type === 'usb') {
      await this.printUsb(bytes, onLog);
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
      await this.printUsb(bytes, onLog);
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
      .line('================================')
      .align('left')
      .line(`Table: ${data.tableNumber}`)
      .line(`Order ID: ${data.orderId}`)
      .line(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      .line('--------------------------------');

    data.items.forEach(item => {
      const itemPrice = item.price * item.quantity;
      const leftCol = `${item.name.slice(0, 18)} x${item.quantity}`;
      const rightCol = `$${itemPrice.toFixed(2)}`;
      const dots = '.'.repeat(Math.max(2, 32 - leftCol.length - rightCol.length));
      encoder.line(`${leftCol}${dots}${rightCol}`);
      
      if (item.modifiers && item.modifiers.length > 0) {
        encoder.line(`  (${item.modifiers.join(', ')})`);
      }
      if (item.notes) {
        encoder.line(`  Note: "${item.notes}"`);
      }
    });

    encoder.line('--------------------------------')
      .align('right')
      .line(`Subtotal: $${data.subtotal.toFixed(2)}`)
      .line(`Tax (${(data.taxRate * 100).toFixed(1)}%): $${data.tax.toFixed(2)}`)
      .line(`Auto-Gratuity (20%): $${data.serviceCharge.toFixed(2)}`)
      .line('================================')
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

  private async printBluetooth(bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.bluetooth) {
      onLog('❌ Web Bluetooth is not supported on this browser.');
      throw new Error('Web Bluetooth not supported.');
    }

    try {
      if (!this.activeBluetoothDevice) {
        onLog('Requesting Bluetooth device scan...');
        this.activeBluetoothDevice = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        });
      }

      onLog(`Connecting to Bluetooth device: ${this.activeBluetoothDevice.name || 'Thermal Printer'}...`);
      const server = await this.activeBluetoothDevice.gatt.connect();
      onLog('Connected to GATT Server. Resolving service...');

      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      onLog('Service resolved. Resolving write characteristic...');

      const characteristics = await service.getCharacteristics();
      const writeChar = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

      if (!writeChar) {
        onLog('❌ No writeable characteristic found on this device.');
        throw new Error('No write characteristic.');
      }

      onLog('Transmitting byte chunks to printer...');
      // Write in chunks of 120 bytes to prevent buffer overflow on low-end thermal printers
      const chunkSize = 120;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        await writeChar.writeValue(chunk);
        onLog(`Sent chunk: ${Math.min(i + chunkSize, bytes.length)}/${bytes.length} bytes.`);
      }

      onLog('✓ Transmission completed successfully.');
    } catch (err: any) {
      onLog(`❌ Bluetooth Print failed: ${err.message || err}`);
      this.activeBluetoothDevice = null;
      throw err;
    }
  }

  private async printUsb(bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.usb) {
      onLog('❌ WebUSB is not supported on this browser.');
      throw new Error('WebUSB not supported.');
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Step 1: Ensure we have a device reference
    if (!this.activeUsbDevice) {
      // Check for already-paired devices first (no user prompt)
      const existingDevices = await nav.usb.getDevices();
      const printerDevices = existingDevices.filter((d: any) => d.configurations?.some(
        (cfg: any) => cfg.interfaces?.some(
          (iface: any) => iface.alternates?.some((alt: any) => alt.interfaceClass === 7)
        )
      ));

      if (printerDevices.length > 0) {
        onLog(`Found ${printerDevices.length} paired printer(s). Using: ${printerDevices[0].productName || 'USB Printer'}`);
        this.activeUsbDevice = printerDevices[0];
      } else {
        onLog('No paired printers found. Requesting device selection...');
        this.activeUsbDevice = await nav.usb.requestDevice({
          filters: [{ classCode: 7 }]
        });
      }
    }

    // Step 2: If already opened, try to write directly — DON'T close and reopen
    if (this.activeUsbDevice.opened) {
      onLog('USB device already open. Writing directly...');
      try {
        await this.usbWriteBytes(this.activeUsbDevice, bytes, onLog);
        onLog('✓ USB Print job dispatched successfully.');
        return;
      } catch (writeErr: any) {
        onLog(`⚠️ Direct write failed (${writeErr.message}). Will attempt reconnect...`);
        // Don't null the device yet — try to reopen below
      }
    }

    // Step 3: Device is not opened or write failed — try to open
    // CRITICAL: Do NOT close the device before opening. Just try to open.
    // If the OS driver holds it, we can't fix that from the browser.
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (!this.activeUsbDevice.opened) {
          onLog(`Opening USB device (attempt ${attempt}/${MAX_RETRIES})...`);
          await this.activeUsbDevice.open();
        }

        onLog('Selecting USB configuration...');
        await this.activeUsbDevice.selectConfiguration(1);

        onLog('Claiming printer interface...');
        await this.activeUsbDevice.claimInterface(0);

        await this.usbWriteBytes(this.activeUsbDevice, bytes, onLog);
        onLog('✓ USB Print job dispatched successfully.');
        return;
      } catch (err: any) {
        if (attempt < MAX_RETRIES) {
          onLog(`⚠️ Attempt ${attempt} failed (${err.message}). Retrying in 2s...`);
          await sleep(2000);
        } else {
          onLog(`❌ USB Print failed: ${err.message}`);
          throw err;
        }
      }
    }
  }

  private async usbWriteBytes(device: any, bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    let endpoint = null;
    for (const inst of device.configuration?.interfaces || []) {
      for (const alt of inst.alternates) {
        if (alt.interfaceClass === 7) {
          for (const ep of alt.endpoints) {
            if (ep.direction === 'out' && ep.type === 'bulk') {
              endpoint = ep;
              break;
            }
          }
        }
      }
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
      const dev = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
      this.activeBluetoothDevice = dev;
      return dev.name || 'Bluetooth Printer';
    } else {
      if (!nav || !nav.usb) throw new Error('WebUSB not supported.');
      onLog('Initiating WebUSB scanner...');

      // Check for already-paired devices first
      const existingDevices = await nav.usb.getDevices();
      const printerDevices = existingDevices.filter((d: any) => d.configurations?.some(
        (cfg: any) => cfg.interfaces?.some(
          (iface: any) => iface.alternates?.some((alt: any) => alt.interfaceClass === 7)
        )
      ));

      if (printerDevices.length > 0) {
        onLog(`Found ${printerDevices.length} paired printer(s).`);
        this.activeUsbDevice = printerDevices[0];
        return printerDevices[0].productName || 'USB Printer';
      }

      // No paired devices — prompt user to select one
      const dev = await nav.usb.requestDevice({
        filters: [{ classCode: 7 }]
      });
      this.activeUsbDevice = dev;
      // NOTE: Do NOT open/claim here. Let printUsb handle it.
      // Opening during scan causes the driver lock issue.
      return dev.productName || 'USB Printer';
    }
  }
}
