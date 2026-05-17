import Link from 'next/link';
import { Download, Paperclip } from 'lucide-react';
import { Badge, Button, Input, Select, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { PnlChart, PnlLegend } from '@/components/admin/PnlChart';
import { TransactionDialog } from '@/components/admin/TransactionDialog';
import {
  listTransactions,
  getMonthlyPnl,
  getFinanceMeta,
  getExpensesByCategoryThisMonth,
  type TxFilters,
} from '@/lib/admin/finance';

export const metadata = { title: 'Finanzas · Admin' };

function parseFilters(sp: Record<string, string | string[] | undefined>): TxFilters {
  const get = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined);
  return {
    from: get('from'),
    to: get('to'),
    type: (get('type') as TxFilters['type']) ?? 'all',
    categoryId: get('categoryId'),
    q: get('q'),
  };
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [txs, pnl, meta, byCategory] = await Promise.all([
    listTransactions(filters),
    getMonthlyPnl(6),
    getFinanceMeta(),
    getExpensesByCategoryThisMonth(),
  ]);

  const month = pnl.at(-1);
  const prevMonth = pnl.at(-2);
  const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount_cents, 0);
  const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount_cents, 0);

  const csvParams = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && csvParams.set(k, String(v)));

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Ingresos, gastos, flujo de caja y P&L."
        actions={
          <>
            <Link href={`/api/admin/finance/export?${csvParams.toString()}`}>
              <Button variant="outline">
                <Download size={14} /> Exportar CSV
              </Button>
            </Link>
            <TransactionDialog accounts={meta.accounts} categories={meta.categories} />
          </>
        }
      />

      {/* KPIs del mes */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ingresos (mes en curso)"
          value={formatMoney(month?.income_cents ?? 0)}
          trend={pnlDelta(month?.income_cents, prevMonth?.income_cents)}
        />
        <KpiCard
          label="Gastos (mes)"
          value={formatMoney(month?.expense_cents ?? 0)}
          trend={pnlDelta(month?.expense_cents, prevMonth?.expense_cents)}
        />
        <KpiCard
          label="Neto del mes"
          value={formatMoney(month?.net_cents ?? 0)}
          hint="ingresos − gastos"
        />
        <KpiCard
          label="Transacciones (filtro)"
          value={String(txs.length)}
          hint={`${formatMoney(totalIncome - totalExpense)} neto`}
        />
      </section>

      {/* P&L Chart + categorías */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Últimos 6 meses</h2>
            <PnlLegend />
          </div>
          <PnlChart data={pnl} />
        </div>

        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
          <h2 className="font-display text-xl">Gastos por categoría (mes)</h2>
          {byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-ink-800/55">Sin gastos registrados este mes.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byCategory.map((c) => {
                const total = byCategory.reduce((s, x) => s + x.cents, 0);
                const pct = total > 0 ? (c.cents / total) * 100 : 0;
                return (
                  <li key={c.name}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{c.name}</span>
                      <span className="font-medium">{formatMoney(c.cents)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-bone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: c.color ?? '#7A4E2D' }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="mt-10 rounded-2xl border border-ink-950/10 bg-bone-50">
        <form className="grid gap-3 md:grid-cols-5 p-4 border-b border-ink-950/10">
          <Input name="q" placeholder="Buscar descripción…" defaultValue={filters.q ?? ''} />
          <Select name="type" defaultValue={filters.type ?? 'all'}>
            <option value="all">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
            <option value="transfer">Transferencias</option>
          </Select>
          <Select name="categoryId" defaultValue={filters.categoryId ?? ''}>
            <option value="">Todas las categorías</option>
            {meta.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input type="date" name="from" defaultValue={filters.from ?? ''} />
          <div className="flex gap-2">
            <Input type="date" name="to" defaultValue={filters.to ?? ''} className="flex-1" />
            <Button type="submit" variant="primary" size="md">Filtrar</Button>
          </div>
        </form>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-5 py-3">Descripción</th>
                <th className="text-left px-5 py-3">Categoría</th>
                <th className="text-left px-5 py-3">Proyecto</th>
                <th className="text-right px-5 py-3">Monto</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink-800/55">
                    Sin movimientos para estos filtros.
                  </td>
                </tr>
              ) : (
                txs.map((t) => (
                  <tr key={t.id} className="border-t border-ink-950/5">
                    <td className="px-5 py-3 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          t.type === 'income' ? 'moss' :
                          t.type === 'expense' ? 'clay' : 'neutral'
                        }
                      >
                        {t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Transfer'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 max-w-[28ch] truncate">
                      {t.description ?? <span className="text-ink-800/40">—</span>}
                    </td>
                    <td className="px-5 py-3 text-ink-800/75">
                      {meta.categories.find((c) => c.id === t.category_id)?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-ink-800/75">{t.project ?? '—'}</td>
                    <td className={
                      'px-5 py-3 text-right font-medium ' +
                      (t.type === 'income' ? 'text-moss-700' :
                       t.type === 'expense' ? 'text-clay-700' : '')
                    }>
                      {t.type === 'expense' ? '−' : '+'}
                      {formatMoney(t.amount_cents, t.currency as never)}
                    </td>
                    <td className="px-5 py-3">
                      {t.attachment_url && (
                        <Paperclip size={14} className="text-ink-800/50" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function pnlDelta(current?: number, prev?: number): number | undefined {
  if (!current || !prev) return undefined;
  return ((current - prev) / prev) * 100;
}
