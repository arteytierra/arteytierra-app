import Link from 'next/link';
import { Badge, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listGiftCardsAdmin } from '@/lib/gift-cards';
import { GiftCardActions } from '@/components/admin/gift-cards/GiftCardActions';

export const metadata = { title: 'Gift cards · Admin' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'active', label: 'Con saldo' },
  { key: 'redeemed', label: 'Canjeadas' },
  { key: 'expired', label: 'Vencidas' },
  { key: 'all', label: 'Todas' },
] as const;

type Filter = (typeof TABS)[number]['key'];

export default async function AdminGiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (TABS.find((t) => t.key === sp.status)?.key ?? 'active') as Filter;
  const cards = await listGiftCardsAdmin(filter);

  const totalBalance = cards.reduce((acc, c) => acc + c.balance_cents, 0);

  return (
    <>
      <PageHeader
        title="Gift cards"
        description="Emisión, saldo y redenciones de tarjetas de regalo."
      />

      <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5 mb-6 max-w-sm">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-800/60">Saldo pendiente</p>
        <p className="font-display text-2xl text-ink-950 mt-1.5">
          {formatMoney(totalBalance, 'ARS')}
        </p>
      </div>

      <nav className="flex gap-2 mb-6 border-b border-ink-950/10">
        {TABS.map((t) => {
          const active = t.key === filter;
          return (
            <Link
              key={t.key}
              href={`/admin/gift-cards?status=${t.key}`}
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

      {cards.length === 0 ? (
        <EmptyState title="Sin tarjetas" description={`No hay gift cards "${filter}".`} />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Código</th>
                <th className="text-left px-5 py-3">Destinatario</th>
                <th className="text-right px-5 py-3">Saldo / Inicial</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Creada</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
                const tone = !c.is_active || expired
                  ? 'clay'
                  : c.balance_cents === 0
                    ? 'neutral'
                    : 'moss';
                const label = !c.is_active
                  ? 'Inactiva'
                  : expired
                    ? 'Vencida'
                    : c.balance_cents === 0
                      ? 'Canjeada'
                      : 'Con saldo';
                return (
                  <tr key={c.id} className="border-t border-ink-950/5">
                    <td className="px-5 py-3 font-mono">{c.code}</td>
                    <td className="px-5 py-3">
                      <p className="text-ink-950">{c.recipient_name ?? '—'}</p>
                      <p className="text-xs text-ink-800/55">{c.recipient_email ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatMoney(c.balance_cents, c.currency as never)}
                      <span className="text-xs text-ink-800/55 ml-2">
                        / {formatMoney(c.initial_cents, c.currency as never)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={tone}>{label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-800/70">
                      {new Date(c.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <GiftCardActions id={c.id} isActive={c.is_active} />
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
