export const COMMON_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard/Generic/ZJiang
  '00001101-0000-1000-8000-00805f9b34fb', // SPP
  'e6a1e204-aa27-11e6-b924-0002a5d5c51b', // Star Micronics
  '00004953-0000-1000-8000-00805f9b34fb', // ZJiang Alternative
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Generic/Demo
];

export const WRITE_CHARACTERISTIC_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb', // Standard
  'e6a1e205-aa27-11e6-b924-0002a5d5c51b', // Star Micronics
  '00004952-0000-1000-8000-00805f9b34fb', // ZJiang
  '0000ffe1-0000-1000-8000-00805f9b34fb', // Generic
];

export class BluetoothPrinter {
  private activeDevice: any = null;

  async requestDevice(onLog?: (msg: string) => void): Promise<any> {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.bluetooth) {
      throw new Error('Web Bluetooth not supported.');
    }
    this.activeDevice = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: COMMON_PRINTER_SERVICES
    });
    this.attachDisconnectHandler(onLog);
    return this.activeDevice;
  }

  getDevice() {
    return this.activeDevice;
  }

  setDevice(device: any, onLog?: (msg: string) => void) {
    this.activeDevice = device;
    this.attachDisconnectHandler(onLog);
  }

  private attachDisconnectHandler(onLog?: (msg: string) => void) {
    if (!this.activeDevice) return;
    this.activeDevice.addEventListener('gattserverdisconnected', () => {
      if (onLog) onLog('⚠️ Bluetooth GATT disconnected unexpectedly.');
      this.activeDevice = null;
    });
  }

  disconnect() {
    if (this.activeDevice && this.activeDevice.gatt?.connected) {
      this.activeDevice.gatt.disconnect();
    }
    this.activeDevice = null;
  }

  async print(bytes: Uint8Array, onLog: (msg: string) => void): Promise<void> {
    if (!this.activeDevice) {
      throw new Error('No Bluetooth device connected.');
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const MAX_RETRIES = 3;
    let server = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        onLog(`Connecting to Bluetooth device: ${this.activeDevice.name || 'Thermal Printer'} (attempt ${attempt}/${MAX_RETRIES})...`);
        server = await this.activeDevice.gatt.connect();
        break;
      } catch (err: any) {
        if (attempt === MAX_RETRIES) throw err;
        onLog(`⚠️ Connection failed (${err.message}). Retrying in ${attempt * 500}ms...`);
        await sleep(attempt * 500);
      }
    }

    if (!server) {
      throw new Error('Failed to connect to GATT server.');
    }

    onLog('Connected to GATT Server. Resolving service...');
    let service = null;

    // Try known services first
    for (const uuid of COMMON_PRINTER_SERVICES) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) break;
      } catch (e) {
        // Service not found, try next
      }
    }

    if (!service) {
      onLog('Trying all available services...');
      const services = await server.getPrimaryServices();
      if (services.length > 0) {
        service = services[0];
      } else {
        throw new Error('No services found on device.');
      }
    }

    onLog('Service resolved. Resolving write characteristic...');
    const characteristics = await service.getCharacteristics();
    let writeChar = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

    // If generic write characteristic is not found, attempt to match known write UUIDs
    if (!writeChar) {
       for (const uuid of WRITE_CHARACTERISTIC_UUIDS) {
           writeChar = characteristics.find((c: any) => c.uuid === uuid);
           if (writeChar) break;
       }
    }

    if (!writeChar) {
      onLog('❌ No writeable characteristic found on this device.');
      throw new Error('No write characteristic.');
    }

    const useWithoutResponse = writeChar.properties.writeWithoutResponse;
    onLog(`Transmitting byte chunks to printer (using ${useWithoutResponse ? 'writeWithoutResponse' : 'writeValue'})...`);
    
    // Split into 182-byte chunks and wait 30 ms between chunks to prevent buffer overflow
    const chunkSize = 182;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      if (useWithoutResponse) {
        await writeChar.writeValueWithoutResponse(chunk);
      } else {
        await writeChar.writeValue(chunk);
      }
      onLog(`Sent chunk: ${Math.min(i + chunkSize, bytes.length)}/${bytes.length} bytes.`);
      await sleep(30);
    }

    onLog('✓ Transmission completed successfully.');
  }
}
