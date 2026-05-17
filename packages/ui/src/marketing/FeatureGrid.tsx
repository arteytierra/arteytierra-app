import { cn } from '../utils/cn';

export interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FeatureGridProps {
  items: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGrid({ items, columns = 4, className }: FeatureGridProps) {
  const grid = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-12', grid, className)}>
      {items.map((f) => (
        <article key={f.title} className="border-t border-ink-950/10 pt-6">
          {f.icon && (
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-900">
              {f.icon}
            </div>
          )}
          <h3 className="font-display text-2xl">{f.title}</h3>
          <p className="mt-3 text-ink-800/75">{f.description}</p>
        </article>
      ))}
    </div>
  );
}
