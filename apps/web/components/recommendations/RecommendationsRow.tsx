import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { RecommendationItem } from '@/lib/recommendations';

function money(cents: number, currency: string) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(cents / 100);
}

export function RecommendationsRow({
  title = 'Te puede interesar',
  items,
}: {
  title?: string;
  items: RecommendationItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-leaf" />
        <h2 className="font-display text-xl text-ink">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <Link key={it.id} href={it.href} className="group">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-ink/5">
              {it.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="mt-2">
              <div className="text-xs text-mute capitalize">{it.reason}</div>
              <div className="font-medium text-ink line-clamp-2">{it.name}</div>
              <div className="text-sm text-mute mt-0.5">{money(it.base_price_cents, it.currency)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
