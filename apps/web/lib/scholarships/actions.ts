'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireUser, requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendTransactional } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { createEvidenceSignedUploadUrl, materializeScholarshipCoupon } from './index';

export async function createScholarshipUploadUrlAction(input: { filename: string }) {
  const user = await requireUser();
  const safe = input.filename.trim();
  if (!safe) throw new Error('Falta nombre de archivo');
  return await createEvidenceSignedUploadUrl(user.id, safe);
}

export async function applyToScholarshipAction(input: {
  programSlug: string;
  motivation: string;
  evidencePath?: string | null;
  household?: { monthly_income_ars?: number; situation?: string; country?: string };
}) {
  const user = await requireUser();
  const motivation = input.motivation.trim();
  if (motivation.length < 100) throw new Error('La carta de motivación debe tener al menos 100 caracteres');
  if (motivation.length > 5000) throw new Error('Demasiado extenso (máx 5000)');

  const admin = createSupabaseAdminClient();
  const { data: program } = await admin
    .from('scholarship_programs')
    .select('id, name, status, requires_evidence, max_grants, granted_count, application_deadline, max_per_user')
    .eq('slug', input.programSlug)
    .maybeSingle();
  if (!program) throw new Error('Programa no encontrado');
  const p = program as {
    id: string; name: string; status: string; requires_evidence: boolean;
    max_grants: number | null; granted_count: number;
    application_deadline: string | null; max_per_user: number;
  };
  if (p.status !== 'open') throw new Error('Programa cerrado a nuevas solicitudes');
  if (p.application_deadline && new Date(p.application_deadline).getTime() < Date.now()) {
    throw new Error('La convocatoria ha finalizado');
  }
  if (p.max_grants !== null && p.granted_count >= p.max_grants) {
    throw new Error('Se alcanzó el cupo de becas');
  }
  if (p.requires_evidence && !input.evidencePath) {
    throw new Error('Necesitamos un documento de respaldo');
  }

  // Conteo por usuario (max_per_user)
  if (p.max_per_user > 0) {
    const { count } = await admin
      .from('scholarship_applications')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', p.id)
      .eq('user_id', user.id);
    if ((count ?? 0) >= p.max_per_user) {
      throw new Error('Ya alcanzaste el máximo de postulaciones para esta beca');
    }
  }

  const { data, error } = await admin
    .from('scholarship_applications')
    .insert({
      program_id: p.id,
      user_id: user.id,
      motivation,
      evidence_path: input.evidencePath ?? null,
      household_info: input.household ?? {},
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message.includes('unique') ? 'Ya postulaste a esta beca' : error.message);

  emitN8nEvent('scholarship-applied', {
    application_id: data.id,
    program_id: p.id,
    program_name: p.name,
    user_id: user.id,
    user_email: user.email,
    user_name: user.fullName,
  });

  revalidatePath('/mis-becas');
  return { id: data.id as string };
}

export async function reviewScholarshipAction(input: {
  applicationId: string;
  decision: 'approve' | 'reject' | 'in_review';
  notes?: string;
}) {
  const user = await requireStaff();
  const admin = createSupabaseAdminClient();

  if (input.decision === 'approve') {
    const { code } = await materializeScholarshipCoupon(input.applicationId, { issuedByUserId: user.id });
    // Trae datos del beneficiario para el email
    const { data: appData } = await admin
      .from('scholarship_applications')
      .select(`
        user_id, program_id,
        scholarship_programs!inner(name)
      `)
      .eq('id', input.applicationId)
      .maybeSingle();
    const a = appData as never as { user_id: string; scholarship_programs: { name: string } } | null;
    if (input.notes) {
      await admin.from('scholarship_applications').update({ reviewer_notes: input.notes }).eq('id', input.applicationId);
    }
    emitN8nEvent('scholarship-approved', {
      application_id: input.applicationId,
      coupon_code: code,
      user_id: a?.user_id ?? null,
      program: a?.scholarship_programs?.name ?? null,
      reviewer_id: user.id,
    });
    // Notif in-app + push
    if (a?.user_id) {
      void createNotification({
        userId: a.user_id,
        kind: 'scholarship_decision',
        title: 'Beca aprobada',
        body: `Cupón ${code} disponible`,
        url: '/mis-becas',
        data: { application_id: input.applicationId, coupon_code: code, decision: 'approved' },
        push: true,
      });
    }

    // Email transaccional al beneficiario
    if (a?.user_id) {
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('id', a.user_id)
        .maybeSingle();
      const { data: authUser } = await admin.auth.admin.getUserById(a.user_id);
      const beneficiaryEmail = authUser?.user?.email ?? null;
      const beneficiaryName = (profile as { full_name?: string } | null)?.full_name ?? 'Hola';
      if (beneficiaryEmail) {
        void sendTransactional({
          to: beneficiaryEmail,
          userId: a.user_id,
          template: 'scholarship-approved',
          category: 'transactional',
          force: true,
          locale: 'es',
          vars: {
            name: beneficiaryName,
            programTitle: a.scholarship_programs?.name ?? 'Beca',
            couponCode: code,
            applyUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/mis-becas`,
          },
        });
      }
    }
  } else if (input.decision === 'reject') {
    await admin
      .from('scholarship_applications')
      .update({
        status: 'rejected',
        reviewer_id: user.id,
        reviewer_notes: input.notes ?? null,
        decision_at: new Date().toISOString(),
      })
      .eq('id', input.applicationId);
    emitN8nEvent('scholarship-rejected', {
      application_id: input.applicationId,
      reviewer_id: user.id,
      reason: input.notes ?? null,
    });
  } else {
    await admin
      .from('scholarship_applications')
      .update({
        status: 'in_review',
        reviewer_id: user.id,
        reviewer_notes: input.notes ?? null,
      })
      .eq('id', input.applicationId);
  }

  revalidatePath('/admin/becas');
}
