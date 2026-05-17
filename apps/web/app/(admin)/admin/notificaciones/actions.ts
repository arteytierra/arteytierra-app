'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { broadcastPush } from '@/lib/pwa/push';

const SEGMENTS = ['all', 'students', 'partners'] as const;

export async function broadcastNotificationAction(formData: FormData) {
  const staff = await requireStaff();
  const title = String(formData.get('title') ?? '').trim().slice(0, 120);
  const body = String(formData.get('body') ?? '').trim().slice(0, 500) || null;
  const url = String(formData.get('url') ?? '').trim() || null;
  const push = formData.get('push') === 'on';
  const segRaw = String(formData.get('segment') ?? 'all');
  const segment = (SEGMENTS as readonly string[]).includes(segRaw) ? segRaw : 'all';

  if (!title) return { ok: false, error: 'title-required' };

  const admin = createSupabaseAdminClient();

  // Resolver lista de user_ids según segment
  let userIds: string[] = [];
  if (segment === 'all') {
    const { data } = await admin.from('profiles').select('id').limit(10000);
    userIds = ((data ?? []) as Array<{ id: string }>).map((r) => r.id);
  } else if (segment === 'students') {
    const { data } = await admin
      .from('enrollments')
      .select('user_id')
      .limit(10000);
    userIds = Array.from(new Set(((data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id)));
  } else if (segment === 'partners') {
    const { data } = await admin
      .schema('app')
      .from('partners')
      .select('user_id')
      .eq('status', 'active');
    userIds = ((data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id);
  }

  if (userIds.length === 0) return { ok: false, error: 'empty-segment' };

  // Bulk insert por chunks
  const CHUNK = 500;
  for (let i = 0; i < userIds.length; i += CHUNK) {
    const slice = userIds.slice(i, i + CHUNK).map((uid) => ({
      user_id: uid,
      kind: 'broadcast' as const,
      title,
      body,
      url,
      data: { segment },
    }));
    await admin.schema('app').from('notifications').insert(slice);
  }

  if (push) {
    void broadcastPush({
      title,
      body: body ?? '',
      url: url ?? '/',
      tag: 'broadcast',
    }).catch((err) => console.error('[broadcast] push failed', err));
  }

  const { recordAudit } = await import('@/lib/audit');
  void recordAudit({
    actorUserId: staff.id,
    actorRole: staff.role,
    action: 'broadcast.send',
    targetKind: 'segment',
    targetId: segment,
    payload: { title, recipient_count: userIds.length, push },
    severity: 'warning',
  });

  revalidatePath('/admin/notificaciones');
  return { ok: true, count: userIds.length };
}
