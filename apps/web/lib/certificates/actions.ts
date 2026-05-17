'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/session';
import { revokeCertificate } from './index';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { recordAudit } from '@/lib/audit';

export async function revokeCertificateAction(input: { code: string; reason: string }) {
  const user = await requireStaff();
  const reason = input.reason.trim();
  if (reason.length < 3) throw new Error('Motivo demasiado corto');
  await revokeCertificate(input.code, user.id, reason);
  void recordAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: 'certificate.revoke',
    targetKind: 'certificate',
    targetId: input.code,
    payload: { reason },
    severity: 'critical',
  });
  emitN8nEvent('certificate-revoked', {
    code: input.code,
    reason,
    revoked_by: user.id,
  });
  revalidatePath(`/verificar/${input.code}`);
  revalidatePath('/admin/certificados');
}
