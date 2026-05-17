import { ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface Crumb { label: string; href?: string }

export function Breadcrumbs({
  items,
  className,
  LinkComponent = 'a',
}: {
  items: Crumb[];
  className?: string;
  LinkComponent?: React.ElementType;
}) {
  const L = LinkComponent;
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm text-ink-800/70', className)}>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {c.href ? (
            <L href={c.href} className="hover:text-moss-700">{c.label}</L>
          ) : (
            <span className="text-ink-950">{c.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={14} className="text-ink-800/40" />}
        </span>
      ))}
    </nav>
  );
}
