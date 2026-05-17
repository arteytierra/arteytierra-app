import { Clock, Users, Video } from 'lucide-react';
import { cn } from '../utils/cn';
import { Badge } from '../primitives/Badge';
import { PriceTag } from './PriceTag';

type Currency = 'ARS' | 'USD' | 'EUR' | 'BRL';

export interface CourseCardProps {
  href: string;
  imageUrl?: string;
  name: string;
  level?: 'intro' | 'intermediate' | 'advanced';
  durationHours?: number;
  isLive?: boolean;
  studentsCount?: number;
  priceCents: number;
  currency?: Currency;
  startsAt?: string;
  className?: string;
  LinkComponent?: React.ElementType;
}

const LEVEL_LABEL = {
  intro: 'Introductorio',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function CourseCard({
  href,
  imageUrl,
  name,
  level,
  durationHours,
  isLive,
  studentsCount,
  priceCents,
  currency = 'ARS',
  startsAt,
  className,
  LinkComponent = 'a',
}: CourseCardProps) {
  const L = LinkComponent;
  return (
    <L
      href={href}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-ink-950/10 bg-bone-50 transition-all duration-500 ease-organic hover:shadow-raised hover:-translate-y-1',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bone-100">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 ease-organic group-hover:scale-[1.04]"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {level && <Badge tone="moss">{LEVEL_LABEL[level]}</Badge>}
          {isLive && <Badge tone="sun">En vivo</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl text-ink-950 group-hover:text-moss-700 transition-colors">
          {name}
        </h3>

        <ul className="mt-4 flex flex-wrap gap-4 text-xs text-ink-800/70">
          {durationHours && (
            <li className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {durationHours}h
            </li>
          )}
          {studentsCount !== undefined && (
            <li className="inline-flex items-center gap-1.5">
              <Users size={14} /> {studentsCount} alumnos
            </li>
          )}
          {isLive && (
            <li className="inline-flex items-center gap-1.5">
              <Video size={14} /> Vivo + grabado
            </li>
          )}
        </ul>

        <div className="mt-auto pt-6 flex items-end justify-between">
          <PriceTag amountCents={priceCents} currency={currency} size="md" />
          {startsAt && (
            <p className="text-xs text-moss-700 uppercase tracking-[0.12em]">{startsAt}</p>
          )}
        </div>
      </div>
    </L>
  );
}
