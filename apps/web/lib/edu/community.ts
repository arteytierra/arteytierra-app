'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

const threadSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(3).max(140),
  body: z.string().max(2000).optional(),
});

export async function createThread(_: { ok?: boolean; error?: string }, formData: FormData) {
  const user = await requireUser();
  const parsed = threadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: 'Revisá los campos.' };

  const admin = createSupabaseAdminClient();
  const { data: enrollment } = await admin
    .schema('edu').from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', parsed.data.courseId)
    .maybeSingle();
  if (!enrollment) return { error: 'No estás inscripto.' };

  await admin.schema('edu').from('threads').insert({
    course_id: parsed.data.courseId,
    user_id: user.id,
    title: parsed.data.title,
    body: parsed.data.body ?? null,
  });

  revalidatePath('/mis-cursos', 'layout');
  return { ok: true };
}

const replySchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().min(1).max(2000),
});

export async function createReply(_: { ok?: boolean; error?: string }, formData: FormData) {
  const user = await requireUser();
  const parsed = replySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: 'Mensaje vacío.' };

  const admin = createSupabaseAdminClient();
  await admin.schema('edu').from('thread_replies').insert({
    thread_id: parsed.data.threadId,
    user_id: user.id,
    body: parsed.data.body,
  });

  revalidatePath('/mis-cursos', 'layout');
  return { ok: true };
}
