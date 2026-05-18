import { cn } from '@arteytierra/ui';

export function PageHeader({
  title,
  description,
  subtitle,
  actions,
  className,
}: {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const desc = description ?? subtitle;
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4 mb-8', className)}>
      <div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {desc && <p className="mt-2 text-ink-800/70">{desc}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
