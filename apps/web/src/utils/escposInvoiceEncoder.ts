import { EscposEncoder } from '../../app/escposEncoder';
import { PrintReceiptData } from '../../app/printerService';
import { InvoiceConfig, getStoredInvoiceConfig } from './invoiceConfig';

export function encodeInvoiceToEscPos(
  data: PrintReceiptData,
  overrideConfig?: Partial<InvoiceConfig>
): Uint8Array {
  const config: InvoiceConfig = {
    ...getStoredInvoiceConfig(),
    ...(overrideConfig || {})
  };

  const lineLength = config.paperWidth === '58mm' ? 32 : 48;
  const dividerDash = '-'.repeat(lineLength);
  const dividerEquals = '='.repeat(lineLength);

  const formatCurrency = (val: number): string => {
    const sym = config.currency === 'JPY' ? '¥' : config.currency === 'EUR' ? '€' : config.currency === 'GBP' ? '£' : '$';
    return `${sym}${val.toFixed(config.currency === 'JPY' ? 0 : 2)}`;
  };

  const encoder = new EscposEncoder();
  encoder.init();

  // 1. Header Section
  encoder.align('center');
  encoder.size(true).line(config.establishmentName || 'DinePosAi').size(false);

  if (config.businessAddress) {
    encoder.line(config.businessAddress);
  }

  if (config.showTaxId && config.taxId) {
    const taxLabel = config.taxRegistrationType === 'PAN' ? 'PAN NO' : 'VAT NO';
    encoder.line(`${taxLabel}: ${config.taxId}`);
  }

  encoder.line(dividerDash);

  // 2. Metadata Section (Table, Server, Date/Time, Order ID)
  encoder.align('left');

  const metaLines: string[] = [];
  if (config.showTableNumber) {
    metaLines.push(`TABLE: ${data.tableNumber || '12'}`);
  }
  if (config.showServerName) {
    metaLines.push(`SERVER: JULIAN B.`);
  }

  const dateStr = new Date().toLocaleDateString();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (config.showOrderTimestamp) {
    metaLines.push(`DATE: ${dateStr} ${timeStr}`);
  }

  metaLines.push(`ORDER #${data.orderId || '1001'}`);

  metaLines.forEach(line => encoder.line(line));
  encoder.line(dividerDash);

  // 3. Itemized List
  data.items.forEach(item => {
    const qtyNameStr = `${item.quantity}x ${item.name}`;
    const totalItemPrice = formatCurrency(item.price * item.quantity);

    // Padding math for line length (32 or 48 columns)
    const rightLen = totalItemPrice.length;
    const maxLeftLen = lineLength - rightLen - 1;

    if (qtyNameStr.length <= maxLeftLen) {
      const padLen = lineLength - qtyNameStr.length - rightLen;
      encoder.line(`${qtyNameStr}${' '.repeat(Math.max(1, padLen))}${totalItemPrice}`);
    } else {
      const truncatedLeft = qtyNameStr.substring(0, maxLeftLen);
      encoder.line(`${truncatedLeft} ${totalItemPrice}`);
    }

    if (item.modifiers && item.modifiers.length > 0) {
      encoder.line(`   + ${item.modifiers.join(', ')}`);
    }
    if (item.notes) {
      encoder.line(`   Note: "${item.notes}"`);
    }
  });

  encoder.line(dividerDash);

  // 4. Financial Calculations
  const subtotal = data.subtotal !== undefined
    ? data.subtotal
    : data.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const formatLineRight = (label: string, valueStr: string) => {
    const pad = lineLength - label.length - valueStr.length;
    encoder.line(`${label}${' '.repeat(Math.max(1, pad))}${valueStr}`);
  };

  formatLineRight('Subtotal', formatCurrency(subtotal));

  const taxRatePercent = data.taxRate ? (data.taxRate < 1 ? data.taxRate * 100 : data.taxRate) : (config.taxRate || 8);
  const taxAmount = data.tax !== undefined ? data.tax : subtotal * (taxRatePercent / 100);
  formatLineRight(`Tax (${taxRatePercent}%) [${config.taxType || 'pre-tax'}]`, formatCurrency(taxAmount));

  if (config.showServiceCharge) {
    const scVal = data.serviceCharge !== undefined ? data.serviceCharge : subtotal * ((config.serviceChargeRate || 10) / 100);
    formatLineRight(`Service Charge (${config.serviceChargeRate || 10}%)`, formatCurrency(scVal));
  }

  if (config.showDiscount) {
    const discVal = config.discountType === 'percent' ? subtotal * ((config.discountValue || 10) / 100) : (config.discountValue || 10);
    formatLineRight(`Discount (${config.discountType === 'percent' ? `${config.discountValue || 10}%` : formatCurrency(config.discountValue || 10)})`, `-${formatCurrency(discVal)}`);
  }

  encoder.line(dividerEquals);

  // 5. Grand Total (Bold)
  encoder.size(true);
  formatLineRight('GRAND TOTAL', formatCurrency(data.total));
  encoder.size(false);
  encoder.line(dividerEquals);

  // 6. Payment Status & Footer
  encoder.align('center');
  encoder.feed(1);

  if (data.isPaid) {
    encoder.line('*** PAYMENT CONFIRMED ***');
    encoder.line(`METHOD: ${(data.paymentMethod || 'CREDIT CARD').toUpperCase()}`);
  } else {
    encoder.line('*** BALANCE DUE ***');
  }

  encoder.feed(1);
  if (config.thankYouMessage) {
    encoder.line(config.thankYouMessage);
  }

  if (config.showCustomFooter && config.customFooterText) {
    encoder.line(config.customFooterText);
  }

  if (config.showSocialMedia && config.socialLinks) {
    encoder.feed(1);
    if (config.socialLinks.facebook) encoder.line(`FB: ${config.socialLinks.facebook}`);
    if (config.socialLinks.instagram) encoder.line(`IG: ${config.socialLinks.instagram}`);
    if (config.socialLinks.tiktok) encoder.line(`TT: ${config.socialLinks.tiktok}`);
    if (config.socialLinks.youtube) encoder.line(`YT: ${config.socialLinks.youtube}`);
  }

  // 7. Barcode (If enabled)
  if (config.showBarcode && data.orderId) {
    encoder.feed(1);
    encoder.line(`[*ORD-${data.orderId}*]`);
  }

  // 8. Feed & Paper Cut Command
  encoder.feed(3).cut();

  return encoder.getBytes();
}
