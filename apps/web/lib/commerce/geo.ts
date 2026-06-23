import 'server-only';
import { headers, cookies } from 'next/headers';

export type BuyerCurrency = 'ARS' | 'USD';

const OVERRIDE_COOKIE = 'ay_cur';

/**
 * Moneda del comprador según geolocalización.
 * - Argentina (AR) → ARS · resto del mundo → USD.
 * - Cookie `ay_cur` (ARS|USD) la fuerza (selector manual / testing).
 * - Sin señal de geo (ej. dev local) → ARS por defecto.
 *
 * Defensivo: si headers()/cookies() no están disponibles (build/SSG), devuelve ARS.
 */
export async function getBuyerCurrency(): Promise<BuyerCurrency> {
  try {
    const ck = await cookies();
    const override = ck.get(OVERRIDE_COOKIE)?.value;
    if (override === 'ARS' || override === 'USD') return override;

    const h = await headers();
    const country = (
      h.get('x-vercel-ip-country') ||
      h.get('cf-ipcountry') ||
      h.get('x-geo-country') ||
      ''
    ).toUpperCase();

    if (!country) return 'ARS';
    return country === 'AR' ? 'ARS' : 'USD';
  } catch {
    return 'ARS';
  }
}
