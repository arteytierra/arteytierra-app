import { cn } from '../utils/cn';
import { Eyebrow } from '../primitives/Eyebrow';

interface CTABlockProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: 'moss' | 'ink' | 'clay';
  className?: string;
}

export function CTABlock({
  eyebrow,
  title,
  description,
  actions,
  tone = 'moss',
  className,
}: CTABlockProps) {
  const t = {
    moss: 'bg-moss-900 text-bone-50',
    ink:  'bg-ink-950 text-bone-50',
    clay: 'bg-clay-700 text-bone-50',
  }[tone];

  return (
    <section className={cn('rounded-3xl', t, className)}>
      <div className="mx-auto max-w-editorial px-6 md:px-10 py-section text-center">
        {eyebrow && <Eyebrow className="text-bone-50/70">{eyebrow}</Eyebrow>}
        <h2 className="display-2 mt-6 max-w-[22ch] mx-auto">{title}</h2>
        {description && (
          <p className="mt-6 max-w-prose mx-auto text-bone-50/80 text-lg">{description}</p>
        )}
        {actions && <div className="mt-10 flex flex-wrap justify-center gap-3">{actions}</div>}
      </div>
    </section>
  );
}
