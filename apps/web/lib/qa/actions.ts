'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { requireUser, requireStaff } from '@/lib/auth/session';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendPushToUser } from '@/lib/pwa/push';
import { checkCourseAccess } from './index';

/**
 * Server actions para Q&A. Todas validan auth + enrollment antes de mutar.
 */

function sanitizeBody(s: string): string {
  // Sanity: limitar longitud y normalizar saltos
  return s.replace(/\r\n/g, '\n').trim().slice(0, 8000);
}

export async function createThreadAction(input: {
  courseSlug: string;
  courseId: string;
  title: string;
  body: string;
  tags?: string[];
}) {
  const { user, allowed } = await checkCourseAccess(input.courseId);
  if (!user || !allowed) throw new Error('No autorizado');
  const title = input.title.trim().slice(0, 200);
  const body = sanitizeBody(input.body);
  if (title.length < 6) throw new Error('Título demasiado corto');
  if (body.length < 10) throw new Error('Detalle demasiado corto');

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('edu').from('threads')
    .insert({
      course_id: input.courseId,
      user_id: user.id,
      title,
      body,
      tags: (input.tags ?? []).slice(0, 5),
    })
    .select('id, course_id, title')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear');

  // Notificar instructor del curso
  const { data: course } = await admin
    .schema('edu').from('courses')
    .select('product_id, instructor_user_id')
    .eq('id', input.courseId)
    .maybeSingle();
  emitN8nEvent('qa-question-asked', {
    thread_id: data.id,
    course_id: input.courseId,
    course_slug: input.courseSlug,
    title,
    asked_by: { id: user.id, email: user.email, name: user.fullName },
    instructor_user_id: (course as { instructor_user_id?: string } | null)?.instructor_user_id ?? null,
  });

  revalidatePath(`/cursos/${input.courseSlug}/q-a`);
  return { id: data.id as string };
}

export async function replyToThreadAction(input: {
  threadId: string;
  courseSlug: string;
  body: string;
}) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: t } = await admin
    .schema('edu').from('threads')
    .select('id, course_id, user_id, title, status')
    .eq('id', input.threadId)
    .maybeSingle();
  if (!t) throw new Error('Thread no encontrado');
  const row = t as { id: string; course_id: string; user_id: string | null; title: string; status: string };
  if (row.status === 'closed') throw new Error('Thread cerrado');

  const { allowed } = await checkCourseAccess(row.course_id);
  if (!allowed) throw new Error('No autorizado');

  const body = sanitizeBody(input.body);
  if (body.length < 5) throw new Error('Respuesta vacía');

  const { data, error } = await admin
    .schema('edu').from('thread_replies')
    .insert({ thread_id: input.threadId, user_id: user.id, body })
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'No se pudo responder');

  // Notificar al autor de la pregunta (si no es el mismo)
  if (row.user_id && row.user_id !== user.id) {
    // El trigger SQL `trg_notify_thread_reply` ya insertó la notif in-app.
    // Acá solo disparamos web-push (no se puede desde Postgres).
    void sendPushToUser(row.user_id, {
      title: 'Nueva respuesta en tu pregunta',
      body: row.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/cursos/${input.courseSlug}/q-a/${row.id}`,
      tag: `qa_reply:${row.id}`,
    }).catch(() => {});

    emitN8nEvent('qa-answered', {
      thread_id: row.id,
      reply_id: data.id,
      course_id: row.course_id,
      course_slug: input.courseSlug,
      title: row.title,
      answered_by: { id: user.id, name: user.fullName, role: user.role },
      asked_by_user_id: row.user_id,
    });
  }

  revalidatePath(`/cursos/${input.courseSlug}/q-a/${input.threadId}`);
  revalidatePath(`/cursos/${input.courseSlug}/q-a`);
  return { id: data.id as string };
}

export async function acceptReplyAction(input: { replyId: string; threadId: string; courseSlug: string }) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: t } = await admin
    .schema('edu').from('threads')
    .select('user_id, course_id')
    .eq('id', input.threadId)
    .maybeSingle();
  if (!t) throw new Error('Thread no encontrado');
  const row = t as { user_id: string | null; course_id: string };
  const isStaff = user.role === 'staff' || user.role === 'admin' || user.role === 'instructor';
  // Sólo autor original o staff/instructor puede aceptar
  if (row.user_id !== user.id && !isStaff) throw new Error('Sólo el autor puede aceptar');

  const { data: reply, error } = await admin
    .schema('edu').from('thread_replies')
    .update({ is_accepted: true })
    .eq('id', input.replyId)
    .select('user_id')
    .single();
  if (error) throw new Error(error.message);

  // Push al autor de la respuesta aceptada (notif in-app la inserta el trigger SQL).
  const replyAuthor = (reply as never as { user_id: string | null } | null)?.user_id;
  if (replyAuthor && replyAuthor !== user.id) {
    void sendPushToUser(replyAuthor, {
      title: '¡Aceptaron tu respuesta!',
      body: '+10 puntos de reputación',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/cursos/${input.courseSlug}/q-a/${input.threadId}`,
      tag: `qa_accepted:${input.replyId}`,
    }).catch(() => {});
  }

  revalidatePath(`/cursos/${input.courseSlug}/q-a/${input.threadId}`);
}

export async function reportAction(input: {
  target: 'thread' | 'reply';
  threadId?: string;
  replyId?: string;
  reason: string;
}) {
  const user = await requireUser();
  const reason = input.reason.trim().slice(0, 500);
  if (reason.length < 3) throw new Error('Motivo demasiado corto');

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .schema('edu').from('thread_reports')
    .insert({
      target: input.target,
      thread_id: input.threadId ?? null,
      reply_id: input.replyId ?? null,
      reporter_id: user.id,
      reason,
    });
  if (error && !error.message.toLowerCase().includes('duplicate')) {
    throw new Error(error.message);
  }
}

export async function moderateReportAction(input: {
  reportId: string;
  decision: 'dismiss' | 'hide' | 'delete';
}) {
  const user = await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: r } = await admin
    .schema('edu').from('thread_reports')
    .select('id, target, thread_id, reply_id')
    .eq('id', input.reportId)
    .maybeSingle();
  if (!r) throw new Error('Reporte no encontrado');
  const rep = r as { id: string; target: 'thread' | 'reply'; thread_id: string | null; reply_id: string | null };

  if (input.decision === 'hide') {
    if (rep.target === 'thread' && rep.thread_id) {
      await admin.schema('edu').from('threads').update({ hidden: true }).eq('id', rep.thread_id);
    } else if (rep.target === 'reply' && rep.reply_id) {
      await admin.schema('edu').from('thread_replies').update({ hidden: true }).eq('id', rep.reply_id);
    }
  } else if (input.decision === 'delete') {
    if (rep.target === 'thread' && rep.thread_id) {
      await admin.schema('edu').from('threads').delete().eq('id', rep.thread_id);
    } else if (rep.target === 'reply' && rep.reply_id) {
      await admin.schema('edu').from('thread_replies').delete().eq('id', rep.reply_id);
    }
  }

  await admin
    .schema('edu').from('thread_reports')
    .update({
      status: input.decision === 'dismiss' ? 'dismissed' : 'actioned',
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', rep.id);

  revalidatePath('/admin/reportes');
}

export async function closeThreadAction(input: { threadId: string; courseSlug: string }) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('edu').from('threads').update({ status: 'closed' }).eq('id', input.threadId);
  revalidatePath(`/cursos/${input.courseSlug}/q-a/${input.threadId}`);
}

export async function pinThreadAction(input: { threadId: string; pinned: boolean; courseSlug: string }) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('edu').from('threads').update({ is_pinned: input.pinned }).eq('id', input.threadId);
  revalidatePath(`/cursos/${input.courseSlug}/q-a`);
}
