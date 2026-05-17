import Link from 'next/link';
import { Badge, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listAllReferrals } from '@/lib/referrals';
import { AttributionActions } from '@/components/admin/referidos/AttributionActions';

export const metadata = { title: 'Referidos · Admin' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'confirmed', label: 'Por liquidar' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'paid', label: 'Pagadas' },
  { key: 'all', label: 'Todas' },
] as const;

type Filter = (typeof TABS)[number]['key'];

const STATUS_TONE: Record<string, 'moss' | 'clay' | 'neutral' | 'sun'> = {
  confirmed: 'sun',
  paid: 'moss',
  pending: 'neutral',
  reversed: 'clay',
};

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (TABS.find((t) => t.key === sp.status)?.key ?? 'confirmed') as Filter;
  const rows = (await listAllReferrals(filter)) as Array<{
    id: string;
    code: string;
    order_id: string | null;
    referred_user_id: string | null;
    subtotal_cents: number;
    commission_cents: number;
    currency: string;
    status: string;
    created_at: string;
    paid_at: string | null;
  }>;

  const totals = rows.reduce(
    (acc, r) => {
      if (r.status === 'confirmed') acc.confirmed += r.commission_cents;
      if (r.status === 'paid') acc.paid += r.commission_cents;
      return acc;
    },
    { confirmed: 0, paid: 0 },
  );

  return (
    <>
      <PageHeader
        title="Referidos"
        description="Atribuciones por código. Liquidá comisiones aprobadas."
      />

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-800/60">Por liquidar</p>
          <p className="font-display text-2xl text-ink-950 mt-1.5">
            {formatMoney(totals.confirmed, 'ARS')}
          </p>
        </div>
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-800/60">Liquidado total</p>
          <p className="font-display text-2xl text-ink-950 mt-1.5">
            {formatMoney(totals.paid, 'ARS')}
          </p>
        </div>
      </div>

      <nav className="flex gap-2 mb-6 border-b border-ink-950/10">
        {TABS.map((t) => {
          const active = t.key === filter;
          return (
            <Link
              key={t.key}
              href={`/admin/referidos?status=${t.key}`}
              className={
                'px-4 py-2 text-sm border-b-2 -mb-px transition-colors ' +
                (active
                  ? 'border-moss-700 text-ink-950 font-medium'
                  : 'border-transparent text-ink-800/65 hover:text-ink-950')
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="Sin atribuciones" description={`No hay atribuciones "${filter}".`} />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Código</th>
                <th className="text-left px-5 py-3">Orden</th>
                <th className="text-right px-5 py-3">Subtotal</th>
                <th className="text-right px-5 py-3">Comisión</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-ink-950/5">
                  <td className="px-5 py-3 font-mono">{r.code}</td>
                  <td className="px-5 py-3">
                    {r.order_id ? (
                      <Link
                        href={`/admin/ventas/${r.order_id}`}
                        className="text-moss-700 hover:underline"
                      >
                        {r.order_id.slice(0, 8)}…
                      </Link>
                    ) : (
                      <span className="text-ink-800/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {formatMoney(r.subtotal_cents, r.currency as never)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatMoney(r.commission_cents, r.currency as never)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-800/70">
                    {new Date(r.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <AttributionActions id={r.id} status={r.status as 'pending' | 'confirmed' | 'paid' | 'reversed'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
