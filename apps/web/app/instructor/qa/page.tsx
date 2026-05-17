import Link from 'next/link';
import { requireInstructor, listInstructorQAQueue, listInstructorCourses } from '@/lib/instructor';

export default async function InstructorQAPage() {
  const ctx = await requireInstructor('/instructor/qa');
  const [queue, courses] = await Promise.all([listInstructorQAQueue(ctx, 200), listInstructorCourses(ctx)]);
  const courseSlugById = new Map(courses.map((c) => [c.id, c.products.slug]));

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Cola de Q&amp;A</h1>
      <ul className="space-y-2">
        {queue.map((t) => {
          const slug = courseSlugById.get(t.course_id);
          return (
            <li key={t.id} className="rounded-md border border-ink/10 p-4 hover:bg-ink/[0.02]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-ink">{t.title}</div>
                  {t.body && <div className="text-sm text-mute line-clamp-2 mt-1">{t.body}</div>}
                  <div className="text-xs text-mute mt-2">
                    {t.reply_count} respuesta(s) · {new Date(t.last_activity_at).toLocaleString('es-AR')}
                  </div>
                </div>
                {slug && (
                  <Link
                    href={`/cursos/${slug}/q-a/${t.id}`}
                    className="flex-none rounded-md bg-leaf px-3 py-1.5 text-xs text-bone"
                  >
                    Responder
                  </Link>
                )}
              </div>
            </li>
          );
        })}
        {queue.length === 0 && <li className="text-mute text-sm">Sin preguntas abiertas.</li>}
      </ul>
    </main>
  );
}
