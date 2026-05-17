'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { requireUser, requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { generateRefCode } from './index';

export async function applyAsPartnerAction(input: {
  programSlug: string;
  organization: string;
  website?: string;
  contactEmail: string;
  applicationMd: string;
}) {
  const user = await requireUser();
  if (input.organization.trim().length < 2) throw new Error('Falta organización');
  if (!input.contactEmail.match(/.+@.+\..+/)) throw new Error('Email inválido');
  if (input.applicationMd.trim().length < 80) throw new Error('Contanos más sobre el partnership (mín 80 caracteres)');

  const admin = createSupabaseAdminClient();
  const { data: program } = await admin
    .from('partner_programs')
    .select('id, name, is_active')
    .eq('slug', input.programSlug)
    .maybeSingle();
  if (!program || !(program as { is_active: boolean }).is_active) throw new Error('Programa no disponible');
  const p = program as { id: string; name: string };

  const ref = generateRefCode(input.organization);
  const { data, error } = await admin
    .from('partners')
    .insert({
      program_id: p.id,
      user_id: user.id,
      organization: input.organization.trim(),
      website: input.website?.trim() ?? null,
      contact_email: input.contactEmail.trim(),
      ref_code: ref,
      status: 'pending',
      application_md: input.applicationMd.trim(),
    })
    .select('id, ref_code')
    .single();
  if (error) throw new Error(error.message.includes('unique') ? 'Ya postulaste a este programa' : error.message);

  emitN8nEvent('partner-applied', {
    partner_id: data.id,
    program: p.name,
    organization: input.organization,
    contact_email: input.contactEmail,
    user_id: user.id,
  });

  revalidatePath('/partners/dashboard');
  return { id: data.id as string, ref_code: data.ref_code as string };
}

export async function reviewPartnerAction(input: {
  partnerId: string;
  decision: 'approve' | 'reject' | 'pause' | 'ban';
  notes?: string;
}) {
  const reviewer = await requireStaff();
  const admin = createSupabaseAdminClient();
  const update: Record<string, unknown> = {
    notes: input.notes ?? null,
    approved_by: reviewer.id,
  };
  if (input.decision === 'approve') {
    update.status = 'active';
    update.approved_at = new Date().toISOString();
  } else if (input.decision === 'reject') {
    update.status = 'banned';
  } else if (input.decision === 'pause') {
    update.status = 'paused';
  } else if (input.decision === 'ban') {
    update.status = 'banned';
  }
  const { data } = await admin
    .from('partners')
    .update(update)
    .eq('id', input.partnerId)
    .select('user_id, ref_code, organization')
    .single();
  emitN8nEvent('partner-decision', {
    partner_id: input.partnerId,
    decision: input.decision,
    reviewer_id: reviewer.id,
    user_id: (data as { user_id?: string } | null)?.user_id ?? null,
    ref_code: (data as { ref_code?: string } | null)?.ref_code ?? null,
  });
  revalidatePath('/admin/partners');
}

export async function confirmPartnerCommissionAction(input: { commissionId: string; mark: 'confirm' | 'reverse' }) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  if (input.mark === 'confirm') {
    await admin
      .from('partner_commissions')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', input.commissionId);
  } else {
    await admin
      .from('partner_commissions')
      .update({ status: 'reversed' })
      .eq('id', input.commissionId);
  }
  revalidatePath('/admin/partners');
}

export async function payoutPartnerCommissionAction(input: { commissionId: string; payoutRef: string }) {
  const user = await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin
    .from('partner_commissions')
    .update({ status: 'paid', paid_at: new Date().toISOString(), payout_ref: input.payoutRef })
    .eq('id', input.commissionId);
  const { recordAudit } = await import('@/lib/audit');
  void recordAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: 'partner.payout',
    targetKind: 'partner_commission',
    targetId: input.commissionId,
    payload: { payout_ref: input.payoutRef },
    severity: 'critical',
  });
  revalidatePath('/admin/partners');
}

/**
 * Helper para que el middleware o un client component setee el cookie de partner ref.
 * Se invoca desde server actions de productos/checkout.
 */
export async function setPartnerRefCookieAction(code: string) {
  const c = await cookies();
  c.set('ay_partner_ref', code.toUpperCase(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 90, // 90 días — B2B suele tener ciclos largos
    path: '/',
  });
}
