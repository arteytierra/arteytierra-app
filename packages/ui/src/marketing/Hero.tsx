import { cn } from '../utils/cn';
import { Eyebrow } from '../primitives/Eyebrow';

interface HeroEditorialProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  image?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function HeroEditorial({
  eyebrow,
  title,
  description,
  actions,
  image,
  align = 'left',
  className,
}: HeroEditorialProps) {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      <div className="mx-auto max-w-editorial px-6 md:px-10 pt-16 md:pt-28 pb-24 md:pb-32">
        <div
          className={cn(
            'grid gap-12 items-center',
            image ? 'lg:grid-cols-[1.1fr_1fr]' : 'lg:grid-cols-1',
            align === 'center' && 'text-center mx-auto max-w-3xl',
          )}
        >
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="display-1 mt-6 max-w-[20ch]">{title}</h1>
            {description && (
              <div className="lead mt-8">{description}</div>
            )}
            {actions && <div className="mt-12 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {image && <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">{image}</div>}
        </div>
      </div>
    </section>
  );
}

interface HeroImmersiveProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  backgroundUrl: string;
  className?: string;
}

export function HeroImmersive({
  eyebrow,
  title,
  description,
  actions,
  backgroundUrl,
  className,
}: HeroImmersiveProps) {
  return (
    <section className={cn('relative isolate min-h-[80vh] flex items-end text-bone-50', className)}>
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/85 via-ink-950/45 to-ink-950/0" />
      <div className="mx-auto max-w-editorial w-full px-6 md:px-10 pb-20 md:pb-28">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.18em] text-bone-50/80">{eyebrow}</p>
        )}
        <h1 className="display-1 mt-6 max-w-[22ch]">{title}</h1>
        {description && (
          <div className="mt-6 max-w-prose text-bone-50/85 text-lg">{description}</div>
        )}
        {actions && <div className="mt-10 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
