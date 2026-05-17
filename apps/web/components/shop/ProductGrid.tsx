import Link from 'next/link';
import { ProductCard, CourseCard } from '@arteytierra/ui';
import { getProductCover, type ProductRow } from '@/lib/commerce/products';

export function ProductGrid({ products }: { products: ProductRow[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-16 text-center">
        <p className="font-display text-2xl">Próximamente</p>
        <p className="mt-2 text-ink-800/65">Estamos curando los productos de esta sección.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const cover = getProductCover(p);
        const href = `/${pluralizePath(p.type)}/${p.slug}`;

        if (p.type === 'course') {
          const attrs = (p.attributes ?? {}) as Record<string, unknown>;
          return (
            <CourseCard
              key={p.id}
              href={href}
              imageUrl={cover}
              name={p.name}
              level={(attrs.level as 'intro' | 'intermediate' | 'advanced' | undefined) ?? 'intro'}
              durationHours={attrs.durationHours as number | undefined}
              isLive={!!attrs.isLive}
              priceCents={p.base_price_cents}
              currency={p.currency as never}
              startsAt={attrs.startsAt as string | undefined}
              LinkComponent={Link}
            />
          );
        }

        return (
          <ProductCard
            key={p.id}
            href={href}
            imageUrl={cover}
            name={p.name}
            subtitle={p.subtitle ?? undefined}
            category={p.category ?? undefined}
            priceCents={p.base_price_cents}
            compareAtCents={p.compare_at_cents}
            currency={p.currency as never}
            LinkComponent={Link}
          />
        );
      })}
    </div>
  );
}

function pluralizePath(type: string): string {
  const map: Record<string, string> = {
    course: 'cursos',
    ebook: 'ebooks',
    physical: 'biocosmetica',
    service: 'asesorias',
    lodging: 'hospedaje',
    immersion: 'inmersion-viva',
  };
  return map[type] ?? 'productos';
}
