import { cn } from '../utils/cn';
import { Eyebrow } from '../primitives/Eyebrow';

interface StorySplitProps {
  eyebrow?: string;
  title: React.ReactNode;
  body: React.ReactNode;
  actions?: React.ReactNode;
  media: React.ReactNode;
  reverse?: boolean;
  className?: string;
}

export function StorySplit({
  eyebrow,
  title,
  body,
  actions,
  media,
  reverse,
  className,
}: StorySplitProps) {
  return (
    <section className={cn('mx-auto max-w-editorial px-6 md:px-10', className)}>
      <div className={cn('grid gap-12 lg:gap-20 items-center lg:grid-cols-2', reverse && 'lg:[&>*:first-child]:order-2')}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-bone-100">
          {media}
        </div>
        <div>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="display-2 mt-6">{title}</h2>
          <div className="mt-6 text-ink-800/80 text-lg max-w-prose space-y-4">{body}</div>
          {actions && <div className="mt-10 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
