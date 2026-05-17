import 'server-only';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Programas de becas y solicitudes. Aprobar una solicitud genera un cupón
 * único (en `shop.coupons`) con `max_uses=1` y `applies_to` heredado del
 * programa. La cápsula de auditoría queda en `granted_coupon`.
 */

export interface ScholarshipProgram {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md: string | null;
  status: 'open' | 'paused' | 'closed';
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  currency: 'ARS' | 'USD' | null;
  applies_to: { product_slugs?: string[]; category?: string[] };
  max_grants: number | null;
  granted_count: number;
  max_per_user: number;
  requires_evidence: boolean;
  application_deadline: string | null;
  valid_until: string | null;
}

export interface ScholarshipApplication {
  id: string;
  program_id: string;
  user_id: string;
  motivation: string;
  evidence_path: string | null;
  household_info: Record<string, unknown>;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  reviewer_notes: string | null;
  decision_at: string | null;
  granted_coupon: string | null;
  created_at: string;
}

const SCHOLARSHIPS_BUCKET = 'scholarships';

export async function listOpenPrograms(): Promise<ScholarshipProgram[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('scholarship_programs')
    .select('id, slug, name, summary, body_md, status, discount_type, discount_value, currency, applies_to, max_grants, granted_count, max_per_user, requires_evidence, application_deadline, valid_until')
    .neq('status', 'closed')
    .order('created_at', { ascending: false });
  return (data ?? []) as ScholarshipProgram[];
}

export async function getProgramBySlug(slug: string): Promise<ScholarshipProgram | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('scholarship_programs')
    .select('id, slug, name, summary, body_md, status, discount_type, discount_value, currency, applies_to, max_grants, granted_count, max_per_user, requires_evidence, application_deadline, valid_until')
    .eq('slug', slug)
    .maybeSingle();
  return (data as ScholarshipProgram | null) ?? null;
}

export async function listUserApplications(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('scholarship_applications')
    .select(`
      id, program_id, motivation, status, reviewer_notes, decision_at, granted_coupon, created_at,
      scholarship_programs!inner(name, slug)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function listPendingApplicationsAdmin() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('scholarship_applications')
    .select(`
      id, program_id, user_id, motivation, evidence_path, household_info, status, reviewer_notes, created_at,
      scholarship_programs!inner(name, slug, discount_type, discount_value, currency, applies_to),
      profiles!inner(full_name)
    `)
    .in('status', ['pending', 'in_review'])
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function createEvidenceSignedUploadUrl(userId: string, filename: string) {
  const admin = createSupabaseAdminClient();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const path = `${userId}/${Date.now()}-${safe}`;
  const { data, error } = await admin.storage
    .from(SCHOLARSHIPS_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear upload URL');
  return { path, token: data.token, signedUrl: data.signedUrl };
}

export async function getEvidenceDownloadUrl(path: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage
    .from(SCHOLARSHIPS_BUCKET)
    .createSignedUrl(path, 60 * 60); // 1h
  return data?.signedUrl ?? null;
}

export function generateCouponCode(prefix = 'BECA'): string {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
}

/**
 * Materializa el cupón al aprobar una solicitud. Idempotente por
 * `applications.granted_coupon`.
 */
export async function materializeScholarshipCoupon(applicationId: string, options: { issuedByUserId: string }) {
  const admin = createSupabaseAdminClient();
  const { data: app } = await admin
    .from('scholarship_applications')
    .select(`
      id, user_id, status, granted_coupon, program_id,
      scholarship_programs!inner(name, discount_type, discount_value, currency, applies_to, valid_until)
    `)
    .eq('id', applicationId)
    .maybeSingle();
  if (!app) throw new Error('Solicitud no encontrada');
  const a = app as never as {
    id: string; user_id: string; status: string; granted_coupon: string | null; program_id: string;
    scholarship_programs: {
      name: string;
      discount_type: 'percent' | 'fixed';
      discount_value: number;
      currency: 'ARS' | 'USD' | null;
      applies_to: Record<string, unknown>;
      valid_until: string | null;
    };
  };

  if (a.granted_coupon) return { code: a.granted_coupon, idempotent: true };

  const code = generateCouponCode();
  const { error } = await admin.from('coupons').insert({
    code,
    type: a.scholarship_programs.discount_type,
    value: a.scholarship_programs.discount_value,
    currency: a.scholarship_programs.currency,
    max_uses: 1,
    used: 0,
    valid_from: new Date().toISOString(),
    valid_to: a.scholarship_programs.valid_until,
    applies_to: { ...a.scholarship_programs.applies_to, scholarship_user_id: a.user_id },
    is_active: true,
    description: `Beca · ${a.scholarship_programs.name}`,
  });
  if (error) throw new Error(error.message);

  await admin
    .from('scholarship_applications')
    .update({
      granted_coupon: code,
      status: 'approved',
      decision_at: new Date().toISOString(),
      reviewer_id: options.issuedByUserId,
    })
    .eq('id', applicationId);

  return { code, idempotent: false };
}
