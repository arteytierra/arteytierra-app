'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { recordAudit } from '@/lib/audit';
import { anonymizeUser } from './index';

const COOLING_OFF_DAYS = 30;

export async function requestDataExportAction() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data } = await admin.schema('app').from('privacy_requests').insert({
    user_id: user.id,
    kind: 'export',
    status: 'pending',
  }).select('id').single();
  void recordAudit({
    actorUserId: user.id,
    action: 'privacy.export-requested',
    targetKind: 'privacy_request',
    targetId: (data as { id?: string } | null)?.id ?? null,
    severity: 'info',
  });
  revalidatePath('/mi-cuenta/privacidad');
  return { ok: true };
}

export async function requestAccountDeletionAction(formData: FormData) {
  const user = await requireUser();
  const confirm = String(formData.get('confirm') ?? '');
  if (confirm !== user.email) {
    return { ok: false, error: 'confirm-mismatch' };
  }
  const scheduled = new Date(Date.now() + COOLING_OFF_DAYS * 86400_000).toISOString();
  const admin = createSupabaseAdminClient();
  const { data } = await admin.schema('app').from('privacy_requests').insert({
    user_id: user.id,
    kind: 'delete',
    status: 'pending',
    scheduled_for: scheduled,
    notes: `Cooling-off ${COOLING_OFF_DAYS}d. Confirmed with email.`,
  }).select('id').single();
  void recordAudit({
    actorUserId: user.id,
    action: 'privacy.deletion-requested',
    targetKind: 'privacy_request',
    targetId: (data as { id?: string } | null)?.id ?? null,
    severity: 'warning',
    payload: { scheduled_for: scheduled },
  });
  revalidatePath('/mi-cuenta/privacidad');
  return { ok: true, scheduled_for: scheduled };
}

export async function cancelPrivacyRequestAction(requestId: string) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  await admin
    .schema('app')
    .from('privacy_requests')
    .update({ status: 'rejected', notes: 'Cancelled by user', completed_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('user_id', user.id)
    .eq('status', 'pending');
  revalidatePath('/mi-cuenta/privacidad');
  return { ok: true };
}

export async function adminAnonymizeUserAction(targetUserId: string, requestId: string) {
  const staff = await requireStaff();
  await anonymizeUser(targetUserId);
  const admin = createSupabaseAdminClient();
  await admin
    .schema('app')
    .from('privacy_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
      notes: 'User anonymized (orders preservados por integridad fiscal)',
    })
    .eq('id', requestId);
  void recordAudit({
    actorUserId: staff.id,
    actorRole: staff.role,
    action: 'privacy.anonymize',
    targetKind: 'user',
    targetId: targetUserId,
    severity: 'critical',
  });
  revalidatePath('/admin/privacidad');
}
