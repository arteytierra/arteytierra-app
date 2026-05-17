import { cn } from '../utils/cn';

/**
 * Skeleton loader — usa el shimmer del DS sobre bone/moss.
 * Sin animación pesada: gradient + animate-pulse + keyframes Tailwind.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-bone-100',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-bone-50/70 before:to-transparent',
        'before:animate-[shimmer_1.6s_infinite]',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3',
            i === lines - 1 ? 'w-2/3' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-ink-950/10 bg-bone-50 p-5', className)}>
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-ink-950/5">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === 0 ? 'w-1/4' : 'flex-1')} />
      ))}
    </div>
  );
}
