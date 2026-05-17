import { cn } from '@arteytierra/ui';

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4 mb-8', className)}>
      <div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-ink-800/70">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
