export const escapeHtml = (unsafe: string | null | undefined): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export function generateReceiptHtml(receiptData: any, restaurantLogo: string | null, formatCurrency: (val: number) => string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${escapeHtml(receiptData.orderId)}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&family=Playfair+Display:wght@700;800&family=Roboto+Mono:wght@700&family=Material+Symbols+Outlined" />
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
            font-weight: 700 !important; 
            color: #000000 !important; 
          }
          body {
            background: #fff;
            color: #000;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            line-height: 1.4;
            padding: 10px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .receipt-container {
            max-width: 300px;
            width: 300px;
            margin: 0;
            border: 1px solid #000000;
            padding: 15px 15px;
            border-radius: 0px;
          }
          @media print {
            body { padding: 0; background: #fff; color: #000; }
            .receipt-container { border: none; padding: 10px 15px; max-width: 300px; width: 300px; }
            @page { margin: 0; }
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo-img {
            max-height: 48px;
            max-width: 100px;
            object-fit: contain;
            margin-bottom: 6px;
          }
          .restaurant-name {
            font-family: 'Playfair Display', serif;
            font-size: 19px;
            font-weight: 800;
            letter-spacing: 0.5px;
            color: #000;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #000;
          }
          .info-table {
            width: 100%;
            margin-bottom: 16px;
            border-bottom: 2px solid #000000;
            padding-bottom: 12px;
          }
          .info-table td {
            padding: 5px 0;
            font-size: 11.5px;
          }
          .info-label {
            color: #000;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .info-value {
            text-align: right;
            font-weight: 800;
            color: #000;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .items-table th {
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #000;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            text-align: left;
          }
          .items-table th.price-col {
            text-align: right;
          }
          .items-table td {
            padding: 8px 0;
            vertical-align: top;
            font-size: 12.5px;
            border-bottom: 1px solid #e0e0e0;
          }
          .item-name {
            font-weight: 700;
            color: #000;
          }
          .item-qty {
            color: #000;
            font-weight: 800;
            margin-right: 4px;
          }
          .item-mods {
            font-size: 10.5px;
            color: #000;
            margin-top: 3px;
            font-style: italic;
          }
          .item-price {
            font-family: 'Roboto Mono', monospace;
            text-align: right;
            font-weight: 700;
            color: #000;
          }
          .totals-table {
            width: 100%;
            margin-bottom: 18px;
            border-top: 2px solid #000000;
            padding-top: 10px;
          }
          .totals-table td {
            padding: 5px 0;
            font-size: 12px;
          }
          .totals-label {
            color: #000;
          }
          .totals-val {
            font-family: 'Roboto Mono', monospace;
            text-align: right;
            font-weight: 700;
            color: #000;
          }
          .grand-total-row td {
            border-top: 2px solid #000000;
            padding-top: 10px;
            margin-top: 6px;
          }
          .grand-total-label {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #000;
          }
          .grand-total-val {
            font-family: 'Roboto Mono', monospace;
            font-size: 16px;
            font-weight: 800;
            text-align: right;
            color: #000;
          }
          .payment-footer {
            background: #fff;
            border: 2px solid #000000;
            border-radius: 0px;
            padding: 10px 14px;
            margin-bottom: 20px;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11.5px;
          }
          .payment-method {
            display: flex;
            align-items: center;
            font-weight: 800;
            color: #000;
          }
          .payment-icon {
            font-family: 'Material Symbols Outlined';
            font-size: 16px;
            margin-right: 5px;
            color: #000;
          }
          .verified-badge {
            display: flex;
            align-items: center;
            color: #000;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            margin-top: 6px;
          }
          .verified-icon {
            font-family: 'Material Symbols Outlined';
            font-size: 14px;
            margin-right: 4px;
          }
          .footer-msg {
            text-align: center;
            font-size: 11px;
            color: #000;
            line-height: 1.6;
            border-top: 2px solid #000000;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            ${restaurantLogo ? `<img src="${restaurantLogo}" alt="Restaurant logo" class="logo-img" />` : ''}
            <h4 class="restaurant-name">${escapeHtml(receiptData.restaurantName)}</h4>
            <p class="subtitle">Official Transaction Receipt</p>
          </div>

          <table class="info-table">
            <tr>
              <td class="info-label">Order</td>
              <td class="info-value">${escapeHtml(receiptData.orderId)}</td>
            </tr>
            <tr>
              <td class="info-label">Table</td>
              <td class="info-value">${escapeHtml(receiptData.tableLabel)}</td>
            </tr>
            <tr>
              <td class="info-label">Server</td>
              <td class="info-value">${escapeHtml(receiptData.serverName)}</td>
            </tr>
            <tr>
              <td class="info-label">Date/Time</td>
              <td class="info-value">${escapeHtml(receiptData.dateTime)}</td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th class="price-col" style="text-align: right; width: 60px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.items.map((item: any) => `
                <tr>
                  <td>
                    <span class="item-name">
                      ${item.qty > 1 ? `<span class="item-qty">${item.qty}x</span>` : ''}
                      ${escapeHtml(item.name)}
                    </span>
                    ${item.modifiers && item.modifiers.length > 0 ? `
                      <div class="item-mods">(${item.modifiers.map((m: any) => escapeHtml(m)).join(', ')})</div>
                    ` : ''}
                  </td>
                  <td class="item-price">${formatCurrency(item.price * item.qty)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td class="totals-label">Subtotal</td>
              <td class="totals-val">${formatCurrency(receiptData.subtotal)}</td>
            </tr>
            <tr>
              <td class="totals-label">${escapeHtml(receiptData.taxLabel)}</td>
              <td class="totals-val">${formatCurrency(receiptData.tax)}</td>
            </tr>
            ${receiptData.discount > 0 ? `
              <tr>
                <td class="totals-label" style="font-weight: 700;">${escapeHtml(receiptData.discountLabel || 'Discount')}</td>
                <td class="totals-val" style="font-weight: 800;">-${formatCurrency(receiptData.discount)}</td>
              </tr>
            ` : ''}
            ${receiptData.gratuity > 0 ? `
              <tr>
                <td class="totals-label">Gratuity</td>
                <td class="totals-val">${formatCurrency(receiptData.gratuity)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total-row">
              <td class="grand-total-label">Total</td>
              <td class="grand-total-val">${formatCurrency(receiptData.total)}</td>
            </tr>
          </table>

          <div class="payment-footer">
            <div class="payment-row">
              <div class="payment-method">
                <span class="payment-icon">credit_card</span>
                <span>${escapeHtml(receiptData.paymentMethod)}</span>
              </div>
              <span style="font-family: 'Roboto Mono', monospace; font-weight: 700; color: #000;">${escapeHtml(receiptData.paymentDetails)}</span>
            </div>
            <div class="verified-badge">
              <span class="verified-icon">verified</span>
              <span>Payment Verified</span>
            </div>
          </div>

          <div class="footer-msg">
            <p>Thank you for dining with us.</p>
            <p>We look forward to serving you again.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
