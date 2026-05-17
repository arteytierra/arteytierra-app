import { ShieldCheck } from 'lucide-react';
import { Badge } from '@arteytierra/ui';
import { Stars } from './Stars';
import { ReviewForm } from './ReviewForm';
import {
  getReviewAggregate,
  listReviewsForProduct,
  getMyReviewForProduct,
} from '@/lib/reviews';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Sección pública de reviews para una página de producto.
 * Server component. Trae aggregate + lista + review propia (si user logueado).
 */
export async function ReviewsSection({ productId }: { productId: string }) {
  const [agg, items, me, user] = await Promise.all([
    getReviewAggregate(productId),
    listReviewsForProduct(productId, 20),
    getMyReviewForProduct(productId),
    getCurrentUser(),
  ]);

  const total = agg?.review_count ?? 0;
  const avg = agg?.rating_avg ?? 0;
  const dist = agg?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <section id="reviews" className="space-y-8" aria-labelledby="reviews-title">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 id="reviews-title" className="font-display text-2xl text-ink-950">
            Opiniones de la comunidad
          </h2>
          {total > 0 ? (
            <div className="flex items-center gap-3 mt-2">
              <Stars value={avg} size={18} />
              <span className="text-sm text-ink-800/70">
                <strong>{avg.toFixed(1)}</strong> / 5 · {total} {total === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-ink-800/65 mt-1">Aún no hay reseñas. ¡Sé el primero!</p>
          )}
        </div>

        {total > 0 ? (
          <ul className="text-xs space-y-1 min-w-[200px]">
            {([5, 4, 3, 2, 1] as const).map((n) => {
              const c = dist[n];
              const pct = total > 0 ? Math.round((c / total) * 100) : 0;
              return (
                <li key={n} className="flex items-center gap-2">
                  <span className="w-6 text-right text-ink-800/65">{n}★</span>
                  <span className="flex-1 h-1.5 bg-bone-100 rounded-full overflow-hidden">
                    <span
                      className="block h-full bg-clay-500"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-ink-800/55">{c}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </header>

      {user ? (
        <ReviewForm productId={productId} initial={me ? { rating: me.rating, title: me.title, body: me.body } : null} />
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 px-5 py-6 text-sm text-ink-800/65">
          Iniciá sesión para dejar tu reseña.
        </div>
      )}

      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} size={14} />
                  {r.verified_purchase ? (
                    <Badge tone="moss" className="inline-flex items-center gap-1">
                      <ShieldCheck size={12} /> Compra verificada
                    </Badge>
                  ) : null}
                </div>
                <span className="text-xs text-ink-800/55">
                  {new Date(r.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
              {r.title ? <p className="font-medium text-ink-950">{r.title}</p> : null}
              {r.body ? <p className="text-sm text-ink-800/80 mt-1 whitespace-pre-line">{r.body}</p> : null}
              {r.author_name ? (
                <p className="text-xs text-ink-800/55 mt-3">— {r.author_name}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
