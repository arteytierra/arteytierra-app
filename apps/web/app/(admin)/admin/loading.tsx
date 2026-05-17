import { Skeleton, SkeletonRow } from '@arteytierra/ui';

export default function LoadingAdmin() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-1/3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-ink-950/10 bg-bone-50 p-5">
            <Skeleton className="mb-2 h-3 w-1/2" />
            <Skeleton className="h-7 w-2/3" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-ink-950/10 bg-bone-50 p-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} cols={5} />
        ))}
      </div>
    </div>
  );
}
