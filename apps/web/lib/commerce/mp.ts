import 'server-only';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

let _config: MercadoPagoConfig | null = null;

function client() {
  if (!_config) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error('MP_ACCESS_TOKEN no configurada');
    _config = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 8000, idempotencyKey: crypto.randomUUID() },
    });
  }
  return _config;
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
  const items = p.items.map((it, idx) => ({
    id: `${p.orderId}-${idx}`,
    title: it.title,
    description: it.description,
    quantity: it.qty,
    currency_id: it.currency.toUpperCase(),
    unit_price: it.unitAmountCents / 100,
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
