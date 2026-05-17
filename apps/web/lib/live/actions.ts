'use server';

import 'server-only';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { requireUser } from '@/lib/auth/session';

/**
 * Server actions invocables desde client components.
 * Wrapper sobre admin client; `lib/live/index.ts` mantiene helpers puros.
 */

export async function upsertLiveSessionAction(input: {
  id?: string | null;
  course_id?: string | null;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  scheduled_at: string;
  duration_min: number;
  host_user_id?: string | null;
  recording_enabled?: boolean;
}) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const room = input.id
    ? (await admin.from('live_sessions').select('room').eq('id', input.id).single()).data?.room
    : `ay-${crypto.randomBytes(8).toString('hex')}`;
  if (!room) throw new Error('No se pudo obtener el room');

  const row = {
    course_id: input.course_id ?? null,
    lesson_id: input.lesson_id ?? null,
    title: input.title,
    description: input.description ?? null,
    scheduled_at: input.scheduled_at,
    duration_min: input.duration_min,
    host_user_id: input.host_user_id ?? user.id,
    recording_enabled: !!input.recording_enabled,
    room,
  };

  if (input.id) {
    const { error } = await admin.from('live_sessions').update(row).eq('id', input.id);
    if (error) throw new Error(error.message);
    return { id: input.id };
  }
  const { data, error } = await admin.from('live_sessions').insert(row).select('id').single();
  if (error) throw new Error(error.message);
  return { id: data.id as string };
}

export async function cancelLiveSessionAction(id: string) {
  await requireUser();
  const admin = createSupabaseAdminClient();
  await admin.from('live_sessions').update({ status: 'cancelled' }).eq('id', id);
}
