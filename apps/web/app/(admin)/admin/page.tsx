import Link from 'next/link';
import { formatMoney, Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { getDashboardMetrics, getRecentOrders } from '@/lib/admin/queries';

export const metadata = { title: 'Resumen · Admin' };

const STATUS_TONE: Record<string, 'moss' | 'sun' | 'clay' | 'neutral'> = {
  paid: 'moss',
  pending: 'sun',
  failed: 'clay',
  refunded: 'clay',
  cancelled: 'neutral',
};

export default async function AdminHomePage() {
  const m = await getDashboardMetrics();
  const orders = await getRecentOrders(8);

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Visión general del negocio en tiempo real."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ingresos del mes"
          value={formatMoney(m.monthCents)}
          trend={m.growth ?? undefined}
          hint={m.growth !== null ? 'vs mes anterior' : 'sin histórico'}
        />
        <KpiCard
          label="Pedidos pagados (mes)"
          value={String(m.monthOrdersCount)}
          hint={`${m.todayOrdersCount} hoy`}
        />
        <KpiCard
          label="Alumnos activos"
          value={String(m.activeEnrollmentsCount)}
          hint="inscripciones vigentes"
        />
        <KpiCard
          label="Reservas próximas"
          value={String(m.upcomingReservationsCount)}
          hint="confirmadas + pendientes"
        />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Pedidos recientes */}
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-ink-950/10">
            <h2 className="font-display text-xl">Pedidos recientes</h2>
            <Link href="/admin/ventas" className="text-sm text-moss-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Pedido</th>
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-800/55">Aún no hay pedidos.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-t border-ink-950/5">
                  <td className="px-5 py-3 font-mono text-xs">{o.id.slice(0, 8)}…</td>
                  <td className="px-5 py-3">{o.created_at ? new Date(o.created_at).toLocaleDateString('es-AR') : ''}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[o.status] ?? 'neutral'}>{o.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">{formatMoney(o.total_cents, o.currency as never)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top productos */}
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
          <h2 className="font-display text-xl">Top productos</h2>
          <ul className="mt-4 space-y-3">
            {m.topProducts.length === 0 ? (
              <li className="text-sm text-ink-800/55">Sin datos aún.</li>
            ) : m.topProducts.map((p, i) => (
              <li key={`${p.product_id}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate flex-1">{p.name_snapshot}</span>
                <span className="text-ink-800/55 text-xs">×{p.qty}</span>
                <span className="font-medium">{formatMoney(p.total_cents)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
