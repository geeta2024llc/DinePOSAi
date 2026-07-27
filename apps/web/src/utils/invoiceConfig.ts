export interface InvoiceConfig {
  establishmentName: string;
  businessAddress: string;
  contactEmail: string;
  restaurantLogo: string;
  showLogo: boolean;
  taxId: string;
  taxRegistrationType: 'VAT' | 'PAN';
  showTaxId: boolean;
  showTableNumber: boolean;
  showServerName: boolean;
  showOrderTimestamp: boolean;
  showServiceCharge: boolean;
  serviceChargeRate: number;
  showDiscount: boolean;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  taxType: 'pre-tax' | 'post-tax';
  taxRate: number;
  currency: string;
  thankYouMessage: string;
  showCustomFooter: boolean;
  customFooterText: string;
  showSocialMedia: boolean;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  showQrCode: boolean;
  qrCodeUrl?: string;
  showBarcode?: boolean;
  paperWidth: '58mm' | '80mm';
}

export const defaultInvoiceConfig: InvoiceConfig = {
  establishmentName: 'DinePosAi',
  businessAddress: '72 Culinary Avenue, Gourmet District',
  contactEmail: 'contact@dineposai.com',
  restaurantLogo: '',
  showLogo: true,
  taxId: '301234567',
  taxRegistrationType: 'VAT',
  showTaxId: true,
  showTableNumber: true,
  showServerName: true,
  showOrderTimestamp: true,
  showServiceCharge: true,
  serviceChargeRate: 10,
  showDiscount: true,
  discountType: 'percent',
  discountValue: 10,
  taxType: 'pre-tax',
  taxRate: 8,
  currency: 'USD',
  thankYouMessage: 'THANK YOU FOR DINING WITH US AT DINEPOSAI! WE HOPE TO SEE YOU AGAIN SOON.',
  showCustomFooter: false,
  customFooterText: '',
  showSocialMedia: false,
  socialLinks: {
    facebook: 'facebook.com/dineposai',
    instagram: 'instagram.com/dineposai',
    tiktok: 'tiktok.com/@dineposai',
    youtube: 'youtube.com/@dineposai'
  },
  showQrCode: true,
  qrCodeUrl: 'https://dineposai.com/menu',
  showBarcode: true,
  paperWidth: '80mm'
};

export function getStoredInvoiceConfig(): InvoiceConfig {
  if (typeof window === 'undefined') return defaultInvoiceConfig;

  try {
    const savedInvoiceStr = localStorage.getItem('dinepos_invoice_config');
    let baseConfig = { ...defaultInvoiceConfig };

    if (savedInvoiceStr) {
      try {
        const parsed = JSON.parse(savedInvoiceStr);
        baseConfig = { ...baseConfig, ...parsed };
      } catch (e) {
        console.error('Error parsing stored invoice config:', e);
      }
    }

    // Sync legacy/individual localStorage keys for backward compatibility
    const estName = localStorage.getItem('dinepos_establishment_name');
    if (estName) baseConfig.establishmentName = estName;

    const busAddress = localStorage.getItem('dinepos_business_address');
    if (busAddress) baseConfig.businessAddress = busAddress;

    const contEmail = localStorage.getItem('dinepos_contact_email');
    if (contEmail) baseConfig.contactEmail = contEmail;

    const logo = localStorage.getItem('dinepos_restaurant_logo');
    if (logo) baseConfig.restaurantLogo = logo;

    const taxIdVal = localStorage.getItem('dinepos_tax_id');
    if (taxIdVal) baseConfig.taxId = taxIdVal;

    const taxReg = localStorage.getItem('dinepos_tax_registration_type');
    if (taxReg === 'VAT' || taxReg === 'PAN') baseConfig.taxRegistrationType = taxReg as 'VAT' | 'PAN';

    const paperWidthVal = localStorage.getItem('dinepos_paper_width');
    if (paperWidthVal === '58mm' || paperWidthVal === '80mm') baseConfig.paperWidth = paperWidthVal as '58mm' | '80mm';

    const printerConfigStr = localStorage.getItem('dinepos_printer_config');
    if (printerConfigStr) {
      try {
        const prCfg = JSON.parse(printerConfigStr);
        if (prCfg.customHeaderText) baseConfig.establishmentName = prCfg.customHeaderText;
        if (prCfg.customVatId) baseConfig.taxId = prCfg.customVatId;
        if (prCfg.customFooterText) baseConfig.thankYouMessage = prCfg.customFooterText;
        if (prCfg.headerLogoUrl && !baseConfig.restaurantLogo) baseConfig.restaurantLogo = prCfg.headerLogoUrl;
        if (prCfg.paperWidth === '58mm' || prCfg.paperWidth === '80mm') baseConfig.paperWidth = prCfg.paperWidth;
      } catch (e) {}
    }

    return baseConfig;
  } catch (err) {
    console.error('Failed to resolve stored invoice config:', err);
    return defaultInvoiceConfig;
  }
}

export function saveStoredInvoiceConfig(partial: Partial<InvoiceConfig>): InvoiceConfig {
  if (typeof window === 'undefined') return defaultInvoiceConfig;

  const current = getStoredInvoiceConfig();
  const updated: InvoiceConfig = { ...current, ...partial };

  try {
    localStorage.setItem('dinepos_invoice_config', JSON.stringify(updated));

    if (updated.establishmentName) localStorage.setItem('dinepos_establishment_name', updated.establishmentName);
    if (updated.businessAddress) localStorage.setItem('dinepos_business_address', updated.businessAddress);
    if (updated.contactEmail) localStorage.setItem('dinepos_contact_email', updated.contactEmail);
    if (updated.restaurantLogo) localStorage.setItem('dinepos_restaurant_logo', updated.restaurantLogo);
    if (updated.taxId) localStorage.setItem('dinepos_tax_id', updated.taxId);
    if (updated.taxRegistrationType) localStorage.setItem('dinepos_tax_registration_type', updated.taxRegistrationType);
    if (updated.paperWidth) localStorage.setItem('dinepos_paper_width', updated.paperWidth);
  } catch (err) {
    console.error('Failed to save stored invoice config:', err);
  }

  return updated;
}
