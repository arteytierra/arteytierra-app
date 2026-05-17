import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, MessageCircle, Pin, ShieldAlert } from 'lucide-react';
import { Container, Section, Badge, Eyebrow, Button } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ThreadComposer } from '@/components/qa/ThreadComposer';
import { getCourseWithCurriculum } from '@/lib/commerce/products';
import { checkCourseAccess, listThreads, type ListFilter } from '@/lib/qa';

export const dynamic = 'force-dynamic';

const FILTERS: Array<{ key: ListFilter; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'open', label: 'Abiertas' },
  { key: 'unanswered', label: 'Sin responder' },
  { key: 'mine', label: 'Mías' },
];

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-AR');
}

export default async function CourseQAPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: ListFilter; q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const product = await getCourseWithCurriculum(slug);
  if (!product) notFound();
  const course = (product as never as { courses: Array<{ id: string }> }).courses?.[0];
  if (!course) notFound();

  const { allowed, user } = await checkCourseAccess(course.id);
  if (!user) redirect(`/auth/login?next=/cursos/${slug}/q-a`);
  if (!allowed) {
    return (
      <>
        <SiteHeader />
        <Section tone="bone" spacing="lg">
          <Container width="prose">
            <Eyebrow>Q&amp;A</Eyebrow>
            <h1 className="display-3 mt-3">Inscribite para acceder</h1>
            <p className="mt-4 text-ink-800/80">
              Las preguntas y respuestas son sólo para alumnos inscriptos en <strong>{product.name}</strong>.
            </p>
            <Link href={`/cursos/${slug}`} className="mt-6 inline-block text-moss-700 underline">
              Volver al curso →
            </Link>
          </Container>
        </Section>
        <SiteFooter />
      </>
    );
  }

  const filter = (sp.filter ?? 'all') as ListFilter;
  const page = Math.max(1, Number(sp.page ?? 1));
  const search = sp.q ?? '';
  const { rows, total } = await listThreads({
    courseId: course.id,
    filter,
    search,
    page,
    pageSize: 20,
  });

  return (
    <>
      <SiteHeader />

      <Section tone="bone" spacing="sm">
        <Container>
          <div className="flex items-center gap-2 text-sm text-ink-800/60">
            <Link href={`/cursos/${slug}`} className="hover:text-ink-950">{product.name}</Link>
            <span>›</span>
            <span>Q&amp;A</span>
          </div>
        </Container>
      </Section>

      <Section tone="bone" spacing="md">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Preguntas y respuestas</Eyebrow>
              <h1 className="display-3 mt-3">Foro del curso</h1>
              <p className="mt-2 text-sm text-ink-800/70">
                {total} {total === 1 ? 'pregunta' : 'preguntas'} en total.
              </p>
            </div>
            <ThreadComposer courseId={course.id} courseSlug={slug} />
          </div>

          {/* Filtros + búsqueda */}
          <form className="mt-6 flex flex-wrap items-center gap-3" action="" method="GET">
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <Link
                  key={f.key}
                  href={`/cursos/${slug}/q-a?filter=${f.key}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
                  className={
                    'rounded-full border px-3 py-1 text-sm transition-colors ' +
                    (filter === f.key
                      ? 'border-ink-950 bg-ink-950 text-bone-50'
                      : 'border-ink-950/15 text-ink-800 hover:bg-bone-50')
                  }
                >
                  {f.label}
                </Link>
              ))}
            </div>
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Buscar…"
              className="ml-auto rounded-full border border-ink-950/15 bg-bone-50 px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-moss-700/30"
            />
            <input type="hidden" name="filter" value={filter} />
            <Button type="submit" variant="outline" size="sm">Buscar</Button>
          </form>

          {/* Lista */}
          <div className="mt-8 space-y-2">
            {rows.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50/50 p-8 text-center text-sm text-ink-800/65">
                No hay preguntas {filter !== 'all' ? 'que coincidan' : 'todavía'}. ¡Sé el primero!
              </p>
            )}
            {rows.map((t) => (
              <Link
                key={t.id}
                href={`/cursos/${slug}/q-a/${t.id}`}
                className="block rounded-2xl border border-ink-950/10 bg-bone-50 p-5 transition-colors hover:bg-bone-100"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex flex-col items-center gap-1 text-xs text-ink-800/60 w-16">
                    <span className="font-display text-2xl text-ink-950">{t.reply_count}</span>
                    <span>resp.</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.is_pinned && <Pin size={14} className="text-clay-700" />}
                      <h3 className="font-display text-lg text-ink-950 truncate">{t.title}</h3>
                      {t.is_resolved && <Badge tone="moss">Resuelta</Badge>}
                      {t.status === 'closed' && <Badge tone="ink">Cerrada</Badge>}
                      {t.reports_count > 0 && t.reports_count < 3 && (
                        <span className="inline-flex items-center gap-1 text-xs text-clay-700">
                          <ShieldAlert size={12} /> {t.reports_count}
                        </span>
                      )}
                    </div>
                    {t.body && (
                      <p className="mt-1 text-sm text-ink-800/70 line-clamp-2">{t.body}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-ink-800/55">
                      <span>{t.author?.full_name ?? 'Anónimo'}</span>
                      <span>·</span>
                      <span>{formatRelative(t.last_activity_at)}</span>
                      {t.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex gap-1">
                            {t.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full bg-bone-100 px-2 py-0.5">{tag}</span>
                            ))}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="sm:hidden flex items-center gap-1 text-xs text-ink-800/60">
                    <MessageCircle size={12} /> {t.reply_count}
                  </div>
                  {t.is_resolved && <CheckCircle2 size={18} className="text-moss-700 shrink-0 mt-1" />}
                </div>
              </Link>
            ))}
          </div>

          {/* Paginación */}
          {total > 20 && (
            <div className="mt-8 flex items-center justify-center gap-3 text-sm">
              {page > 1 && (
                <Link
                  href={`/cursos/${slug}/q-a?filter=${filter}&q=${encodeURIComponent(search)}&page=${page - 1}`}
                  className="rounded-full border border-ink-950/15 px-4 py-1.5 hover:bg-bone-50"
                >
                  ← Anterior
                </Link>
              )}
              <span className="text-ink-800/65">Página {page}</span>
              {page * 20 < total && (
                <Link
                  href={`/cursos/${slug}/q-a?filter=${filter}&q=${encodeURIComponent(search)}&page=${page + 1}`}
                  className="rounded-full border border-ink-950/15 px-4 py-1.5 hover:bg-bone-50"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          )}
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
