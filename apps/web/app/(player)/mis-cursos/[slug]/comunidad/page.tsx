import { notFound } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { getCourseForLearner } from '@/lib/edu/queries';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { NewThreadForm } from '@/components/edu/NewThreadForm';
import { ThreadCard } from '@/components/edu/ThreadCard';

export default async function ComunidadPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const data = await getCourseForLearner(slug, user.id);
  if (!data) notFound();

  const admin = createSupabaseAdminClient();
  const { data: threads } = await admin
    .schema('edu').from('threads')
    .select(`
      id, title, body, created_at,
      user_id, profiles(full_name, avatar_url),
      thread_replies(count)
    `)
    .eq('course_id', data.course.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <article>
      <p className="text-xs uppercase tracking-[0.16em] text-moss-300">Comunidad</p>
      <h1 className="font-display text-3xl md:text-4xl mt-3 tracking-tight">Conversaciones del curso</h1>
      <p className="mt-3 text-bone-100/65 max-w-prose">
        Compartí dudas, hallazgos y prácticas con el resto de alumnos.
      </p>

      <div className="mt-10">
        <NewThreadForm courseId={data.course.id} />
      </div>

      <ul className="mt-10 space-y-3">
        {(!threads || threads.length === 0) ? (
          <li className="text-sm text-bone-100/55 flex items-center gap-2">
            <MessageSquare size={14} /> Aún no hay conversaciones. Empezá la primera.
          </li>
        ) : threads.map((t) => (
          <ThreadCard
            key={t.id}
            slug={slug}
            id={t.id}
            title={t.title}
            body={t.body}
            createdAt={t.created_at ?? new Date().toISOString()}
            authorName={(t as never as { profiles: { full_name: string | null } }).profiles?.full_name ?? 'Anónimo'}
            replyCount={(t as never as { thread_replies: Array<{ count: number }> }).thread_replies?.[0]?.count ?? 0}
          />
        ))}
      </ul>
    </article>
  );
}
