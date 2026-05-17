'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { recordAudit } from '@/lib/audit';
import { generateWebhookSecret } from './index';

const VALID_EVENTS = new Set([
  '*',
  'order.paid', 'order.refunded', 'order.cancelled',
  'enrollment.created', 'lesson.completed', 'course.completed',
  'certificate.issued', 'certificate.revoked',
  'reservation.confirmed', 'reservation.cancelled',
  'scholarship.approved',
  'partner.commission.confirmed', 'partner.commission.paid',
]);

function parseEvents(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s && VALID_EVENTS.has(s))
    .slice(0, 30);
}

export async function createWebhookEndpointAction(formData: FormData) {
  const user = await requireUser();
  const label = String(formData.get('label') ?? '').trim().slice(0, 80);
  const url = String(formData.get('url') ?? '').trim();
  const eventsRaw = String(formData.get('events') ?? '*');
  const isAdmin = formData.get('admin') === 'on' && (user.role === 'admin' || user.role === 'staff');

  if (!label || !/^https?:\/\//.test(url)) {
    return { ok: false, error: 'invalid-input' as const };
  }
  const events = parseEvents(eventsRaw);
  if (events.length === 0) return { ok: false, error: 'no-events' as const };

  const secret = generateWebhookSecret();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.schema('app').from('webhook_endpoints').insert({
    owner_user_id: isAdmin ? null : user.id,
    label,
    url,
    secret,
    events,
    enabled: true,
  }).select('id').single();

  if (error || !data) return { ok: false, error: 'db' as const };

  void recordAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: 'webhook.create',
    targetKind: 'webhook_endpoint',
    targetId: (data as { id: string }).id,
    payload: { label, url, events, admin: isAdmin },
    severity: 'info',
  });

  revalidatePath(isAdmin ? '/admin/webhooks' : '/partners/webhooks');
  return { ok: true as const, id: (data as { id: string }).id, secret };
}

export async function toggleWebhookEndpointAction(id: string) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .schema('app')
    .from('webhook_endpoints')
    .select('owner_user_id, enabled')
    .eq('id', id)
    .maybeSingle();
  const row = existing as { owner_user_id: string | null; enabled: boolean } | null;
  if (!row) return { ok: false };
  const canEdit = row.owner_user_id === user.id || user.role === 'admin' || user.role === 'staff';
  if (!canEdit) return { ok: false };
  await admin.schema('app').from('webhook_endpoints').update({ enabled: !row.enabled, consecutive_failures: 0 }).eq('id', id);
  revalidatePath('/partners/webhooks');
  revalidatePath('/admin/webhooks');
  return { ok: true };
}

export async function deleteWebhookEndpointAction(id: string) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .schema('app')
    .from('webhook_endpoints')
    .select('owner_user_id')
    .eq('id', id)
    .maybeSingle();
  const row = existing as { owner_user_id: string | null } | null;
  if (!row) return { ok: false };
  if (row.owner_user_id !== user.id && user.role !== 'admin' && user.role !== 'staff') {
    return { ok: false };
  }
  await admin.schema('app').from('webhook_endpoints').delete().eq('id', id);
  void recordAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: 'webhook.delete',
    targetKind: 'webhook_endpoint',
    targetId: id,
    severity: 'warning',
  });
  revalidatePath('/partners/webhooks');
  revalidatePath('/admin/webhooks');
  return { ok: true };
}

export async function rotateWebhookSecretAction(id: string) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .schema('app')
    .from('webhook_endpoints')
    .select('owner_user_id')
    .eq('id', id)
    .maybeSingle();
  const row = existing as { owner_user_id: string | null } | null;
  if (!row) return { ok: false };
  if (row.owner_user_id !== user.id && user.role !== 'admin' && user.role !== 'staff') {
    return { ok: false };
  }
  const newSecret = generateWebhookSecret();
  await admin.schema('app').from('webhook_endpoints').update({ secret: newSecret }).eq('id', id);
  void recordAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: 'webhook.rotate',
    targetKind: 'webhook_endpoint',
    targetId: id,
    severity: 'warning',
  });
  revalidatePath('/partners/webhooks');
  revalidatePath('/admin/webhooks');
  return { ok: true, secret: newSecret };
}

export async function redeliverWebhookAction(deliveryId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('app').from('webhook_deliveries').update({
    status: 'pending',
    next_attempt_at: new Date().toISOString(),
  }).eq('id', deliveryId);
  revalidatePath('/admin/webhooks');
  return { ok: true };
}
