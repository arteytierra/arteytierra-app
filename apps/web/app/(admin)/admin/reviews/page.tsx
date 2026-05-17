import Link from 'next/link';
import { Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listReviewsAdmin } from '@/lib/reviews';
import { Stars } from '@/components/reviews/Stars';
import { ReviewActions } from '@/components/admin/reviews/ReviewActions';

export const metadata = { title: 'Reseñas · Admin' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'rejected', label: 'Rechazadas' },
  { key: 'all', label: 'Todas' },
] as const;

type Filter = (typeof TABS)[number]['key'];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (TABS.find((t) => t.key === sp.status)?.key ?? 'pending') as Filter;
  const items = await listReviewsAdmin(filter);

  return (
    <>
      <PageHeader
        title="Reseñas"
        description="Moderá reseñas de clientes antes de publicarlas."
      />

      <nav className="flex gap-2 mb-6 border-b border-ink-950/10">
        {TABS.map((t) => {
          const active = t.key === filter;
          return (
            <Link
              key={t.key}
              href={`/admin/reviews?status=${t.key}`}
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

      {items.length === 0 ? (
        <EmptyState
          title="Sin reseñas"
          description={`No hay reseñas con estado "${filter}".`}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Stars value={r.rating} size={14} />
                    <Badge tone={r.status === 'approved' ? 'moss' : r.status === 'rejected' ? 'clay' : 'neutral'}>
                      {r.status}
                    </Badge>
                    {r.verified_purchase ? <Badge tone="moss">Verificada</Badge> : null}
                    <span className="text-xs text-ink-800/55">
                      {new Date(r.created_at).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-sm text-ink-800/70">
                    Producto: <strong className="text-ink-950">{r.product_name ?? r.product_id}</strong>
                  </p>
                  {r.title ? <p className="font-medium text-ink-950 mt-2">{r.title}</p> : null}
                  {r.body ? <p className="text-sm text-ink-800/80 mt-1 whitespace-pre-line">{r.body}</p> : null}
                </div>

                <ReviewActions id={r.id} status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
