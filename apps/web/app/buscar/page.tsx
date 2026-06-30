import Link from 'next/link';
import { SearchBox } from '@/components/search/SearchBox';
import { globalSearch } from '@/lib/search';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Buscar',
  description: 'Encontrá cursos, ebooks, hospedaje, asesorías y artículos del blog.',
  robots: { index: false },
};

const BADGES: Record<string, string> = {
  course: 'Curso',
  product: 'Producto',
  post: 'Blog',
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const hits = query.length >= 2 ? await globalSearch(query, 20) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-display text-ink-950">Buscar</h1>
        <p className="text-sm text-ink-800/70">
          Cursos, ebooks, hospedaje, biocosmética, asesorías y artículos.
        </p>
      </header>

      <SearchBox initialQuery={query} autoFocus />

      {query.length < 2 ? (
        <p className="text-sm text-ink-800/55">Escribí al menos 2 caracteres para buscar.</p>
      ) : hits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-8 text-center text-sm text-ink-800/65">
          No encontramos resultados para <strong>“{query}”</strong>. Probá con otra palabra.
        </div>
      ) : (
        <section aria-label="Resultados" className="rounded-2xl border border-ink-950/10 bg-bone-50 divide-y divide-ink-950/5">
          {hits.map((hit) => (
            <Link
              key={`${hit.kind}-${hit.id}`}
              href={hit.href}
              className="flex items-start gap-4 px-5 py-4 hover:bg-bone-100/60 transition-colors"
            >
              {hit.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hit.thumb} alt="" className="w-14 h-14 rounded-xl object-cover border border-ink-950/5" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-moss-100/60 border border-ink-950/5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-ink-800/60 bg-bone-100 px-2 py-0.5 rounded-full border border-ink-950/10">
                    {hit.badge ?? BADGES[hit.kind] ?? hit.kind}
                  </span>
                </div>
                <p className="text-base font-medium text-ink-950">{hit.title}</p>
                {hit.subtitle ? (
                  <p className="text-sm text-ink-800/65 mt-0.5 line-clamp-2">{hit.subtitle}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
