import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { OrderActions } from '@/components/admin/orders/OrderActions';

export const metadata = { title: 'Detalle pedido · Admin' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'moss' | 'sun' | 'clay' | 'neutral'> = {
  paid: 'moss',
  pending: 'sun',
  failed: 'clay',
  refunded: 'clay',
  cancelled: 'neutral',
};

interface OrderItem {
  id: string;
  product_id: string;
  product_type: string;
  name_snapshot: string;
  qty: number;
  unit_price_cents: number;
  metadata: Record<string, unknown> | null;
}

interface Payment {
  id: string;
  provider: string;
  provider_payment_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

interface OrderRow {
  id: string;
  status: string;
  provider: string | null;
  provider_order_id: string | null;
  total_cents: number;
  subtotal_cents: number | null;
  discount_cents: number | null;
  currency: string;
  coupon_code: string | null;
  billing: { name?: string; email?: string; phone?: string; address?: string } | null;
  created_at: string;
  paid_at: string | null;
  user_id: string | null;
  contact_id: string | null;
  order_items: OrderItem[];
  payments: Payment[];
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('orders')
    .select(
      `
      id, status, provider, provider_order_id, total_cents, subtotal_cents, discount_cents,
      currency, coupon_code, billing, created_at, paid_at, user_id, contact_id,
      order_items(id, product_id, product_type, name_snapshot, qty, unit_price_cents, metadata),
      payments(id, provider, provider_payment_id, amount_cents, currency, status, created_at)
    `,
    )
    .eq('id', id)
    .single();

  if (!data) notFound();
  const order = data as unknown as OrderRow;

  return (
    <>
      <PageHeader
        title={`Pedido ${order.id.slice(0, 8)}…`}
        description={`${order.billing?.name ?? 'Sin nombre'} · ${order.billing?.email ?? '—'}`}
        actions={<OrderActions orderId={order.id} status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-2xl border border-bone-200 bg-bone-50 overflow-hidden">
            <header className="px-5 py-3 border-b border-bone-200 text-xs uppercase tracking-[0.14em] text-ink-800/55">
              Ítems
            </header>
            <table className="w-full text-sm">
              <tbody>
                {order.order_items.map((it) => {
                  const meta = it.metadata ?? {};
                  return (
                    <tr key={it.id} className="border-t border-bone-200 first:border-0">
                      <td className="px-5 py-4">
                        <p className="font-medium">{it.name_snapshot}</p>
                        <p className="text-xs text-ink-800/55 mt-0.5">
                          {it.product_type} · qty {it.qty}
                          {meta.startsAt ? ` · ${new Date(String(meta.startsAt)).toLocaleDateString('es-AR')}` : ''}
                          {meta.endsAt ? ` → ${new Date(String(meta.endsAt)).toLocaleDateString('es-AR')}` : ''}
                          {meta.guests ? ` · ${meta.guests} huéspedes` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium whitespace-nowrap">
                        {formatMoney(it.unit_price_cents * it.qty, order.currency as never)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-bone-100 text-sm">
                {order.subtotal_cents != null && (
                  <tr>
                    <td className="px-5 py-2 text-ink-800/70">Subtotal</td>
                    <td className="px-5 py-2 text-right">
                      {formatMoney(order.subtotal_cents, order.currency as never)}
                    </td>
                  </tr>
                )}
                {order.discount_cents && order.discount_cents > 0 ? (
                  <tr>
                    <td className="px-5 py-2 text-ink-800/70">
                      Descuento {order.coupon_code ? `(${order.coupon_code})` : ''}
                    </td>
                    <td className="px-5 py-2 text-right text-clay-700">
                      − {formatMoney(order.discount_cents, order.currency as never)}
                    </td>
                  </tr>
                ) : null}
                <tr className="border-t border-bone-200">
                  <td className="px-5 py-3 font-medium">Total</td>
                  <td className="px-5 py-3 text-right font-bold">
                    {formatMoney(order.total_cents, order.currency as never)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Payments */}
          <section className="rounded-2xl border border-bone-200 bg-bone-50 p-5">
            <h2 className="font-display text-xl mb-4">Pagos</h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-ink-800/55">Sin pagos registrados todavía.</p>
            ) : (
              <ul className="divide-y divide-bone-200">
                {order.payments.map((p) => (
                  <li key={p.id} className="py-3 flex items-center gap-4 text-sm">
                    <Badge tone={p.status === 'succeeded' ? 'moss' : 'neutral'}>{p.status}</Badge>
                    <span className="flex-1">
                      <span className="font-medium">{p.provider}</span>
                      <span className="font-mono text-xs text-ink-800/55 ml-2">
                        {p.provider_payment_id}
                      </span>
                    </span>
                    <span>{formatMoney(p.amount_cents, p.currency as never)}</span>
                    <span className="text-xs text-ink-800/55">
                      {new Date(p.created_at).toLocaleString('es-AR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-bone-200 bg-bone-50 p-5 space-y-3">
            <h3 className="font-display text-lg">Estado</h3>
            <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>{order.status}</Badge>
            <dl className="text-xs space-y-1 mt-2">
              <div>
                <dt className="text-ink-800/55">Creado</dt>
                <dd>{new Date(order.created_at).toLocaleString('es-AR')}</dd>
              </div>
              {order.paid_at && (
                <div>
                  <dt className="text-ink-800/55">Pagado</dt>
                  <dd>{new Date(order.paid_at).toLocaleString('es-AR')}</dd>
                </div>
              )}
              {order.provider && (
                <div>
                  <dt className="text-ink-800/55">Provider</dt>
                  <dd>{order.provider}</dd>
                </div>
              )}
              {order.provider_order_id && (
                <div>
                  <dt className="text-ink-800/55">Provider order</dt>
                  <dd className="font-mono break-all">{order.provider_order_id}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-bone-200 bg-bone-50 p-5">
            <h3 className="font-display text-lg mb-2">Cliente</h3>
            <p className="text-sm font-medium">{order.billing?.name ?? '—'}</p>
            <p className="text-xs text-ink-800/70 mt-1">{order.billing?.email ?? '—'}</p>
            {order.billing?.phone && (
              <p className="text-xs text-ink-800/70">{order.billing.phone}</p>
            )}
            {order.billing?.address && (
              <p className="text-xs text-ink-800/70 mt-2 whitespace-pre-line">
                {order.billing.address}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {order.user_id && (
                <Link
                  href={`/admin/crm/usuarios/${order.user_id}`}
                  className="text-xs text-moss-700 hover:underline"
                >
                  Ver usuario
                </Link>
              )}
              {order.contact_id && (
                <Link
                  href={`/admin/crm/${order.contact_id}`}
                  className="text-xs text-moss-700 hover:underline"
                >
                  Ver contacto
                </Link>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
