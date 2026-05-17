import Link from 'next/link';
import { Award, PlayCircle } from 'lucide-react';
import { Badge, Button } from '@arteytierra/ui';
import { getCurrentUser } from '@/lib/auth/session';
import { listMyEnrollments } from '@/lib/edu/queries';
import { getProductCover } from '@/lib/commerce/products';

export const metadata = { title: 'Mis cursos' };

export default async function MisCursosPage() {
  const user = (await getCurrentUser())!;
  const enrollments = await listMyEnrollments(user.id);

  if (enrollments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-16 text-center">
        <p className="font-display text-2xl">Todavía no estás inscrito en ningún curso</p>
        <p className="mt-3 text-ink-800/65">Empezá a explorar la oferta.</p>
        <Link href="/cursos">
          <Button variant="moss" size="lg" className="mt-6">Ver cursos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {enrollments.map((e) => {
        const cover = getProductCover(e.product as never);
        const pct = Math.round(e.progress * 100);
        const isComplete = !!e.completed_at;
        return (
          <article
            key={e.id}
            className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden flex flex-col"
          >
            {cover && (
              <div className="aspect-[16/10] overflow-hidden bg-bone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={e.product.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                {isComplete ? (
                  <Badge tone="moss">
                    <Award size={11} /> Completado
                  </Badge>
                ) : (
                  <Badge tone="outline">{pct}% completado</Badge>
                )}
                {e.course.is_live && <Badge tone="sun">En vivo</Badge>}
              </div>
              <h3 className="font-display text-xl">{e.product.name}</h3>
              <p className="mt-1 text-xs text-ink-800/65">
                {e.lessonsCompleted} de {e.lessonsTotal} lecciones · {e.course.duration_hours ?? '—'}h
              </p>

              <div className="mt-4 h-1.5 rounded-full bg-bone-100 overflow-hidden">
                <div
                  className="h-full bg-moss-700 transition-all duration-700 ease-organic"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-5 mt-auto pt-5">
                {e.nextLesson ? (
                  <Link
                    href={`/mis-cursos/${e.product.slug}/${e.nextLesson.id}`}
                    className="inline-flex items-center gap-2 text-sm text-moss-700 hover:underline"
                  >
                    <PlayCircle size={14} /> Continuar: {e.nextLesson.title}
                  </Link>
                ) : (
                  <Link
                    href={`/mis-cursos/${e.product.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-moss-700 hover:underline"
                  >
                    Volver al curso
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
