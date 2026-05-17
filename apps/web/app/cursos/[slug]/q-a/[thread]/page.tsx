import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Check } from 'lucide-react';
import { Container, Section, Badge, Eyebrow } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { MarkdownView } from '@/components/qa/MarkdownView';
import { ReplyComposer } from '@/components/qa/ReplyComposer';
import { AcceptAnswerButton } from '@/components/qa/AcceptAnswerButton';
import { ReportButton } from '@/components/qa/ReportButton';
import { ThreadLiveIndicator } from '@/components/qa/ThreadLiveIndicator';
import { getCourseWithCurriculum } from '@/lib/commerce/products';
import { checkCourseAccess, getThread } from '@/lib/qa';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
}

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ slug: string; thread: string }>;
}) {
  const { slug, thread: threadId } = await params;

  const product = await getCourseWithCurriculum(slug);
  if (!product) notFound();
  const course = (product as never as { courses: Array<{ id: string }> }).courses?.[0];
  if (!course) notFound();

  const { allowed, user } = await checkCourseAccess(course.id);
  if (!user) redirect(`/auth/login?next=/cursos/${slug}/q-a/${threadId}`);
  if (!allowed) redirect(`/cursos/${slug}/q-a`);

  const data = await getThread(threadId);
  if (!data) notFound();
  const { thread, replies } = data;

  const isAuthor = thread.user_id === user.id;
  const isStaff = user.role === 'staff' || user.role === 'admin' || user.role === 'instructor';
  const canAccept = isAuthor || isStaff;
  const canReply = thread.status !== 'closed';

  return (
    <>
      <SiteHeader />

      <Section tone="bone" spacing="sm">
        <Container>
          <div className="flex items-center gap-2 text-sm text-ink-800/60">
            <Link href={`/cursos/${slug}`} className="hover:text-ink-950">{product.name}</Link>
            <span>›</span>
            <Link href={`/cursos/${slug}/q-a`} className="hover:text-ink-950">Q&amp;A</Link>
            <span>›</span>
            <span className="truncate max-w-[40ch]">{thread.title}</span>
          </div>
        </Container>
      </Section>

      <Section tone="bone" spacing="md">
        <Container width="prose">
          <Eyebrow>Pregunta</Eyebrow>
          <div className="mt-3 flex items-start gap-3 flex-wrap">
            <h1 className="display-3 flex-1">{thread.title}</h1>
            <div className="flex items-center gap-2">
              {thread.is_resolved && <Badge tone="moss">Resuelta</Badge>}
              {thread.status === 'closed' && <Badge tone="ink">Cerrada</Badge>}
              <ThreadLiveIndicator threadId={thread.id} />
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-800/60">
            Por {thread.author?.full_name ?? 'Anónimo'} · {formatDate(thread.created_at)}
          </p>
          {thread.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {thread.tags.map((t) => (
                <span key={t} className="rounded-full bg-bone-100 px-2 py-0.5 text-xs">{t}</span>
              ))}
            </div>
          )}
          {thread.body && (
            <div className="mt-6 rounded-2xl bg-bone-50 p-6">
              <MarkdownView source={thread.body} />
            </div>
          )}
          <div className="mt-3 flex items-center justify-end">
            <ReportButton target="thread" threadId={thread.id} />
          </div>

          <hr className="my-10 border-ink-950/10" />

          <h2 className="font-display text-2xl">
            {replies.length} {replies.length === 1 ? 'respuesta' : 'respuestas'}
          </h2>

          <ul className="mt-6 space-y-5">
            {replies.map((r) => (
              <li
                key={r.id}
                className={
                  'rounded-2xl border p-6 ' +
                  (r.is_accepted
                    ? 'border-moss-700/40 bg-moss-700/5'
                    : 'border-ink-950/10 bg-bone-50')
                }
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium">{r.author?.full_name ?? 'Anónimo'}</span>
                  {r.author?.role === 'instructor' && <Badge tone="clay">Instructor</Badge>}
                  {(r.author?.role === 'staff' || r.author?.role === 'admin') && <Badge tone="ink">Equipo</Badge>}
                  <span className="text-xs text-ink-800/55">· {formatDate(r.created_at)}</span>
                  {r.is_accepted && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-moss-700">
                      <Check size={14} /> Respuesta aceptada
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <MarkdownView source={r.body} />
                </div>
                <div className="mt-3 flex items-center justify-end gap-3">
                  <ReportButton target="reply" replyId={r.id} />
                  {canAccept && !r.is_accepted && (
                    <AcceptAnswerButton
                      replyId={r.id}
                      threadId={thread.id}
                      courseSlug={slug}
                      alreadyAccepted={false}
                    />
                  )}
                </div>
              </li>
            ))}
            {replies.length === 0 && (
              <li className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50/40 p-6 text-center text-sm text-ink-800/65">
                Todavía no hay respuestas.
              </li>
            )}
          </ul>

          {canReply ? (
            <div className="mt-10">
              <ReplyComposer threadId={thread.id} courseSlug={slug} />
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-ink-800/60">
              Esta pregunta está cerrada para nuevas respuestas.
            </p>
          )}
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
