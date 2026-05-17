import { cn } from '@arteytierra/ui';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-12 text-center', className)}>
      <p className="font-display text-2xl">{title}</p>
      {description && <p className="mt-2 text-ink-800/65 max-w-prose mx-auto">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
