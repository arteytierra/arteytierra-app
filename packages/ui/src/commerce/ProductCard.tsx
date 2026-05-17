import { cn } from '../utils/cn';
import { Badge } from '../primitives/Badge';
import { PriceTag } from './PriceTag';

type Currency = 'ARS' | 'USD' | 'EUR' | 'BRL';

export interface ProductCardProps {
  href: string;
  imageUrl?: string;
  name: string;
  subtitle?: string;
  category?: string;
  priceCents: number;
  compareAtCents?: number | null;
  currency?: Currency;
  badge?: string;
  className?: string;
  LinkComponent?: React.ElementType;
}

export function ProductCard({
  href,
  imageUrl,
  name,
  subtitle,
  category,
  priceCents,
  compareAtCents,
  currency = 'ARS',
  badge,
  className,
  LinkComponent = 'a',
}: ProductCardProps) {
  const L = LinkComponent;
  return (
    <L
      href={href}
      className={cn(
        'group flex flex-col transition-transform duration-300 ease-organic hover:-translate-y-1',
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-bone-100">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 ease-organic group-hover:scale-[1.04]"
            loading="lazy"
          />
        )}
        {badge && <Badge tone="ink" className="absolute top-3 left-3">{badge}</Badge>}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          {category && (
            <p className="text-xs uppercase tracking-[0.16em] text-moss-700">{category}</p>
          )}
          <h3 className="mt-1 font-display text-xl text-ink-950 group-hover:text-moss-700 transition-colors">
            {name}
          </h3>
          {subtitle && <p className="mt-1 text-sm text-ink-800/65 line-clamp-2">{subtitle}</p>}
        </div>
      </div>

      <PriceTag
        amountCents={priceCents}
        compareAtCents={compareAtCents}
        currency={currency}
        size="md"
        className="mt-3"
      />
    </L>
  );
}
