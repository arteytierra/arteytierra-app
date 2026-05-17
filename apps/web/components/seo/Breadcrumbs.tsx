import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

export interface Crumb {
  name: string;
  url: string;
}

/**
 * Breadcrumb visual + JSON-LD para SEO.
 * El primer item siempre se asume como Inicio (no se imprime el icono Home).
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-mute">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((c, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${c.url}-${i}`} className="flex items-center gap-1">
                {i === 0 && <Home className="h-3.5 w-3.5" aria-hidden />}
                {isLast ? (
                  <span aria-current="page" className="text-ink font-medium truncate max-w-[40ch]">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.url} className="hover:text-ink underline-offset-2 hover:underline">
                    {c.name}
                  </Link>
                )}
                {!isLast && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
