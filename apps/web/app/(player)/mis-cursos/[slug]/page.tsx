import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, BookOpen, PlayCircle, MessageCircle } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { requireUser } from '@/lib/auth/session';
import { getCourseForLearner } from '@/lib/edu/queries';

export default async function CourseHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const data = await getCourseForLearner(slug, user.id);
  if (!data) notFound();

  const flat = data.modules.flatMap((m) => m.lessons);
  const next = flat.find((l) => !l.completed) ?? flat[0];

  return (
    <article>
      <p className="text-xs uppercase tracking-[0.16em] text-moss-300">Curso</p>
      <h1 className="font-display text-4xl md:text-5xl mt-3 tracking-tight">
        {data.course.product.name}
      </h1>
      {data.course.product.subtitle && (
        <p className="mt-4 max-w-prose text-bone-100/75">{data.course.product.subtitle}</p>
      )}

      {/* Continue card */}
      {next && (
        <div className="mt-10 rounded-2xl border border-bone-100/15 bg-bone-100/5 p-6 flex items-center gap-5 flex-wrap">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-moss-700 text-bone-50">
            <PlayCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-bone-100/55">
              {data.enrollment.completed_at ? 'Repasar' : 'Continuar donde quedaste'}
            </p>
            <p className="mt-1 font-medium text-bone-50">{next.title}</p>
          </div>
          <Link href={`/mis-cursos/${slug}/${next.id}`}>
            <Button variant="moss" size="lg">
              {data.enrollment.completed_at ? 'Repasar' : 'Continuar'}
            </Button>
          </Link>
        </div>
      )}

      {/* Acciones secundarias */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/mis-cursos/${slug}/comunidad`}>
          <Button variant="outline" size="md" className="!bg-transparent !text-bone-50 !border-bone-100/20 hover:!bg-bone-100/10">
            <MessageCircle size={14} /> Comunidad
          </Button>
        </Link>
        {data.enrollment.completed_at && (
          <Link href="/certificados">
            <Button variant="outline" size="md" className="!bg-transparent !text-bone-50 !border-bone-100/20 hover:!bg-bone-100/10">
              <Award size={14} /> Mi certificado
            </Button>
          </Link>
        )}
      </div>

      {/* Listado de módulos */}
      <section className="mt-14">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <BookOpen size={18} /> Programa
        </h2>
        <ol className="mt-6 space-y-4">
          {data.modules.map((m) => (
            <li key={m.id} className="rounded-2xl border border-bone-100/15 bg-bone-100/5 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-bone-100/55">Módulo {m.position}</p>
              <h3 className="mt-1 font-display text-xl">{m.title}</h3>
              {m.summary && <p className="mt-2 text-sm text-bone-100/70">{m.summary}</p>}
              <ul className="mt-4 space-y-1 text-sm">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/mis-cursos/${slug}/${l.id}`}
                      className="flex items-center gap-2 py-1.5 hover:text-bone-50"
                    >
                      <span className={l.completed ? 'text-moss-300' : 'text-bone-100/40'}>
                        {l.completed ? '✓' : '○'}
                      </span>
                      <span className={l.completed ? 'text-bone-100/65' : 'text-bone-100/90'}>
                        {l.title}
                      </span>
                      {l.duration_sec && (
                        <span className="ml-auto text-[10px] text-bone-100/45">
                          {Math.round(l.duration_sec / 60)} min
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
