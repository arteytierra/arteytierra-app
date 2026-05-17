import { Star } from 'lucide-react';

export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className={'inline-flex items-center gap-0.5 text-clay-600 ' + (className ?? '')} aria-label={`${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'fill-current' : 'opacity-30'}
            strokeWidth={1.5}
          />
        );
      })}
    </span>
  );
}
