import Link from 'next/link';
import { Badge, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { requireStaff } from '@/lib/auth/session';

export const metadata = { title: 'Ventas · Admin' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'moss' | 'sun' | 'clay' | 'neutral'> = {
  paid: 'moss', pending: 'sun', failed: 'clay', refunded: 'clay', cancelled: 'neutral',
};

export default async function VentasPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: orders } = await admin
    .schema('shop').from('orders')
    .select('id, total_cents, currency, status, provider, created_at, paid_at, billing')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <>
      <PageHeader title="Ventas" description="Todos los pedidos, pagos y reembolsos." />

      {!orders || orders.length === 0 ? (
        <EmptyState
          title="Sin ventas todavía"
          description="Acá vas a ver el detalle de pedidos, sus pagos y estados de envío."
        />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Pedido</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Provider</th>
                <th className="text-left px-5 py-3">Creado</th>
                <th className="text-left px-5 py-3">Pagado</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const billing = o.billing as { name?: string; email?: string } | null;
                return (
                  <tr key={o.id} className="border-t border-ink-950/5 hover:bg-bone-100/50">
                    <td className="px-5 py-3 font-mono text-xs">
                      <Link href={`/admin/ventas/${o.id}`} className="hover:text-moss-700">
                        {o.id.slice(0, 8)}…
                      </Link>
                      {billing?.email && (
                        <p className="text-[10px] text-ink-800/55 font-sans mt-0.5">
                          {billing.email}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[o.status] ?? 'neutral'}>{o.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-800/70">{o.provider ?? '—'}</td>
                    <td className="px-5 py-3">{o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : ''}</td>
                    <td className="px-5 py-3">
                      {o.paid_at ? new Date(o.paid_at).toLocaleString('es-AR') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatMoney(o.total_cents, o.currency as never)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
