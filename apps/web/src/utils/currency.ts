export function formatCurrency(value: number, currency: string = 'JPY'): string {
  try {
    // Select locale mapping based on standard currencies
    let locale = 'ja-JP';
    if (currency === 'USD') locale = 'en-US';
    else if (currency === 'GBP') locale = 'en-GB';
    else if (currency === 'EUR') locale = 'de-DE';
    else if (currency === 'CNY') locale = 'zh-CN';
    else if (currency === 'KRW') locale = 'ko-KR';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'JPY',
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    }).format(value);
  } catch {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥';
    const isZeroDecimal = currency === 'JPY' || currency === 'KRW';
    return `${symbol}${value.toFixed(isZeroDecimal ? 0 : 2)}`;
  }
}
