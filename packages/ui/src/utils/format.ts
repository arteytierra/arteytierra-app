type Currency = 'ARS' | 'USD' | 'EUR' | 'BRL';

const LOCALES: Record<Currency, string> = {
  ARS: 'es-AR',
  USD: 'en-US',
  EUR: 'de-DE',
  BRL: 'pt-BR',
};

export function formatMoney(amountCents: number, currency: Currency = 'ARS') {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
