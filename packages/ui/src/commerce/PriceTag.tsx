import { cn } from '../utils/cn';
import { formatMoney } from '../utils/format';

type Currency = 'ARS' | 'USD' | 'EUR' | 'BRL';

interface PriceTagProps {
  amountCents: number;
  compareAtCents?: number | null;
  currency?: Currency;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTag({
  amountCents,
  compareAtCents,
  currency = 'ARS',
  size = 'md',
  className,
}: PriceTagProps) {
  const cls = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'font-display text-3xl',
  }[size];

  return (
    <p className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-medium text-ink-950', cls)}>
        {formatMoney(amountCents, currency)}
      </span>
      {compareAtCents && compareAtCents > amountCents && (
        <span className="text-sm text-ink-800/50 line-through">
          {formatMoney(compareAtCents, currency)}
        </span>
      )}
    </p>
  );
}
