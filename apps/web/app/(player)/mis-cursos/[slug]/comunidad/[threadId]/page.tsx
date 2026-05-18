import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { getCourseForLearner } from '@/lib/edu/queries';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { ReplyForm } from '@/components/edu/ReplyForm';

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}) {
  const user = await requireUser();
  const { slug, threadId } = await params;
  const data = await getCourseForLearner(slug, user.id);
  if (!data) notFound();

  const admin = createSupabaseAdminClient();
  const { data: thread } = await admin
    .schema('edu').from('threads')
    .select(`
      id, title, body, created_at, course_id,
      profiles(full_name, avatar_url),
      thread_replies(id, body, created_at, profiles(full_name, avatar_url))
    `)
    .eq('id', threadId)
    .single();

  if (!thread || thread.course_id !== data.course.id) notFound();

  const t = thread as never as {
    title: string; body: string | null; created_at: string;
    profiles: { full_name: string | null };
    thread_replies: Array<{ id: string; body: string; created_at: string; profiles: { full_name: string | null } }>;
  };

  return (
    <article>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">{t.title}</h1>
      <div className="mt-2 text-xs text-bone-100/55">
        {t.profiles?.full_name ?? 'Anónimo'} · {new Date(t.created_at).toLocaleString('es-AR')}
      </div>
      {t.body && (
        <p className="mt-6 max-w-prose text-bone-100/85 whitespace-pre-wrap leading-relaxed">{t.body}</p>
      )}

      <hr className="my-10 border-bone-100/10" />

      <ul className="space-y-4">
        {t.thread_replies
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((r) => (
            <li key={r.id} className="rounded-2xl border border-bone-100/15 bg-bone-100/5 p-5">
              <div className="text-xs text-bone-100/55">
                {r.profiles?.full_name ?? 'Anónimo'} · {new Date(r.created_at).toLocaleString('es-AR')}
              </div>
              <p className="mt-2 text-bone-100/90 whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
      </ul>

      <div className="mt-8">
        <ReplyForm threadId={threadId} />
      </div>
    </article>
  );
}
