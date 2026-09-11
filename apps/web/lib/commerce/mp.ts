import 'server-only';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

let _config: MercadoPagoConfig | null = null;

function client() {
  if (!_config) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error('MP_ACCESS_TOKEN no configurada');
    // Sin `idempotencyKey` acá: el SDK mete `config.options` en TODAS las
    // requests, así que una clave fija en el singleton hacía que cada preferencia
    // nueva reusara la respuesta de la primera del proceso. El SDK genera una
    // clave por request cuando no se la pasamos.
    _config = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 8000 },
    });
  }
  return _config;
}

/**
 * Reparte el descuento entre los ítems, en centavos y proporcional al peso de
 * cada uno, para que el total que cobra Mercado Pago sea el mismo que guardamos
 * en `orders.total_cents`. MP no acepta ítems con precio negativo ni tiene un
 * campo de descuento a nivel preferencia, así que el descuento tiene que vivir
 * dentro de los precios unitarios.
 */
export function repartirDescuento(
  lineas: Array<{ unitAmountCents: number; qty: number }>,
  discountCents: number,
): number[] {
  const totales = lineas.map((l) => l.unitAmountCents * l.qty);
  const bruto = totales.reduce((a, b) => a + b, 0);
  const descuento = Math.min(Math.max(discountCents, 0), bruto);
  if (descuento === 0 || bruto === 0) return totales;

  const conDescuento = totales.map((t) => t - Math.floor((t * descuento) / bruto));
  // El redondeo hacia abajo deja un resto: se lo sacamos a la línea más cara.
  let resto = conDescuento.reduce((a, b) => a + b, 0) - (bruto - descuento);
  while (resto > 0) {
    let i = 0;
    for (let j = 1; j < conDescuento.length; j++) {
      if ((conDescuento[j] ?? 0) > (conDescuento[i] ?? 0)) i = j;
    }
    if ((conDescuento[i] ?? 0) <= 0) break;
    conDescuento[i] = (conDescuento[i] ?? 0) - 1;
    resto -= 1;
  }
  return conDescuento;
}

interface CreatePreferenceParams {
  orderId: string;
  items: Array<{
    title: string;
    description?: string;
    unitAmountCents: number;
    qty: number;
    currency: string;
  }>;
  payerEmail?: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  notificationUrl: string;
  discountCents?: number;
}

export async function createMpPreference(p: CreatePreferenceParams) {
  const pref = new Preference(client());
  const totales = repartirDescuento(p.items, p.discountCents ?? 0);
  const items = p.items.map((it, idx) => ({
    id: `${p.orderId}-${idx}`,
    title: it.title,
    description: it.description,
    quantity: it.qty,
    currency_id: it.currency.toUpperCase(),
    // Redondeamos a centavos: MP no acepta más de 2 decimales.
    unit_price: Math.round((totales[idx] ?? it.unitAmountCents * it.qty) / it.qty) / 100,
  }));

  const res = await pref.create({
    body: {
      items,
      external_reference: p.orderId,
      payer: p.payerEmail ? { email: p.payerEmail } : undefined,
      back_urls: {
        success: p.successUrl,
        failure: p.failureUrl,
        pending: p.pendingUrl,
      },
      auto_return: 'approved',
      notification_url: p.notificationUrl,
      statement_descriptor: 'ARTE Y TIERRA',
      metadata: { order_id: p.orderId },
    },
  });
  return res;
}

export async function fetchMpPayment(paymentId: string) {
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}
