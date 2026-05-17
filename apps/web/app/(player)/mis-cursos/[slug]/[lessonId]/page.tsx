import { notFound } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { getLessonForLearner } from '@/lib/edu/queries';
import { VideoPlayer } from '@/components/edu/VideoPlayer';
import { MarkCompleteButton } from '@/components/edu/MarkCompleteButton';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const user = await requireUser();
  const { lessonId } = await params;
  const res = await getLessonForLearner(lessonId, user.id);
  if (!res) notFound();

  const { lesson, progress } = res as never as {
    lesson: {
      id: string; title: string; kind: string;
      video_provider: string | null; video_id: string | null;
      resource_url: string | null; body_mdx: string | null;
      duration_sec: number | null;
      modules: { title: string; position: number };
    };
    progress: { completed: boolean; watched_sec: number };
  };

  return (
    <article>
      <p className="text-xs uppercase tracking-[0.16em] text-bone-100/55">
        Módulo {lesson.modules.position} · {lesson.modules.title}
      </p>
      <h1 className="font-display text-3xl md:text-4xl mt-3 tracking-tight">{lesson.title}</h1>

      {lesson.kind === 'video' && (
        <div className="mt-8">
          <VideoPlayer
            lessonId={lesson.id}
            provider={lesson.video_provider}
            videoId={lesson.video_id}
            resourceUrl={lesson.resource_url}
            initialWatchedSec={progress.watched_sec}
            alreadyCompleted={progress.completed}
          />
        </div>
      )}

      {lesson.kind === 'pdf' && lesson.resource_url && (
        <div className="mt-8 rounded-2xl border border-bone-100/15 bg-bone-100/5 p-6 flex items-center gap-4">
          <FileText size={20} className="text-moss-300" />
          <p className="flex-1">Material en PDF</p>
          <a
            href={lesson.resource_url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full bg-moss-700 text-bone-50 px-5 py-2.5 text-sm hover:bg-moss-900"
          >
            <Download size={14} /> Descargar
          </a>
        </div>
      )}

      {lesson.kind === 'live' && (
        <div className="mt-8 rounded-2xl border border-sun-300/30 bg-sun-300/10 p-6">
          <p className="text-sm">
            Esta lección es <strong>en vivo</strong>. El link de la sala se envía 1 hora antes por email.
          </p>
        </div>
      )}

      {lesson.body_mdx && (
        <div className="mt-10 max-w-prose text-bone-100/85 whitespace-pre-wrap leading-relaxed">
          {lesson.body_mdx}
        </div>
      )}

      <div className="mt-10 flex items-center gap-3">
        <MarkCompleteButton lessonId={lesson.id} initiallyCompleted={progress.completed} />
      </div>
    </article>
  );
}
