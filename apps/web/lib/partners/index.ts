import 'server-only';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Partner programs (B2B referrals). A diferencia de `referral_attributions`
 * (cuentas personales), acá hay un contrato comercial: cada partner pertenece
 * a un programa con su comisión, y las comisiones generadas se acumulan en un
 * ledger separado pagable mensualmente.
 */

export interface PartnerProgram {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  commission_pct: number;
  tier: 'standard' | 'silver' | 'gold' | 'enterprise';
  payout_terms_md: string | null;
  is_active: boolean;
}

export interface PartnerRow {
  id: string;
  program_id: string;
  user_id: string;
  organization: string | null;
  website: string | null;
  contact_email: string | null;
  ref_code: string;
  status: 'pending' | 'active' | 'paused' | 'banned';
  application_md: string | null;
  approved_at: string | null;
}

export interface PartnerCommissionRow {
  id: string;
  partner_id: string;
  order_id: string;
  amount_cents: number;
  currency: string;
  commission_pct: number;
  status: 'pending' | 'confirmed' | 'paid' | 'reversed';
  confirmed_at: string | null;
  paid_at: string | null;
  payout_ref: string | null;
}

export async function listActivePrograms(): Promise<PartnerProgram[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partner_programs')
    .select('id, slug, name, description, commission_pct, tier, payout_terms_md, is_active')
    .eq('is_active', true)
    .order('commission_pct', { ascending: false });
  return (data ?? []) as PartnerProgram[];
}

export async function getProgramBySlug(slug: string): Promise<PartnerProgram | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partner_programs')
    .select('id, slug, name, description, commission_pct, tier, payout_terms_md, is_active')
    .eq('slug', slug)
    .maybeSingle();
  return (data as PartnerProgram | null) ?? null;
}

export async function getMyPartner(userId: string): Promise<PartnerRow | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partners')
    .select('id, program_id, user_id, organization, website, contact_email, ref_code, status, application_md, approved_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as PartnerRow | null) ?? null;
}

export async function getPartnerByRefCode(code: string): Promise<(PartnerRow & { commission_pct: number }) | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partners')
    .select(`
      id, program_id, user_id, organization, website, contact_email, ref_code, status, application_md, approved_at,
      partner_programs!inner(commission_pct)
    `)
    .eq('ref_code', code.toUpperCase())
    .eq('status', 'active')
    .maybeSingle();
  if (!data) return null;
  const r = data as never as PartnerRow & { partner_programs: { commission_pct: number } };
  return { ...r, commission_pct: r.partner_programs.commission_pct };
}

export async function getPartnerSummary(partnerId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partner_summary')
    .select('confirmed_cents, paid_cents, total_orders, program, program_pct')
    .eq('partner_id', partnerId)
    .maybeSingle();
  return data;
}

export async function listPartnerCommissions(partnerId: string, limit = 50): Promise<PartnerCommissionRow[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partner_commissions')
    .select('id, partner_id, order_id, amount_cents, currency, commission_pct, status, confirmed_at, paid_at, payout_ref')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as PartnerCommissionRow[];
}

export function generateRefCode(seedName?: string): string {
  const base = (seedName ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return base ? `${base}-${rand}` : rand;
}

/**
 * Llamado desde `fulfillment.ts` cuando la orden cambia a 'paid'.
 * Si la orden trae `billing.partner_ref_code` o el cookie `ay_partner_ref`
 * coincide con un partner activo, se crea la comisión.
 */
export async function attributePartnerForOrder(opts: {
  orderId: string;
  refCode: string;
  amountCents: number;
  currency: string;
  buyerUserId?: string | null;
}): Promise<PartnerCommissionRow | null> {
  const partner = await getPartnerByRefCode(opts.refCode);
  if (!partner) return null;
  // Bloquear self-referral
  if (opts.buyerUserId && opts.buyerUserId === partner.user_id) return null;

  const admin = createSupabaseAdminClient();
  const commission = Math.round((opts.amountCents * partner.commission_pct) / 100);

  const { data, error } = await admin
    .from('partner_commissions')
    .insert({
      partner_id: partner.id,
      order_id: opts.orderId,
      amount_cents: commission,
      currency: opts.currency,
      commission_pct: partner.commission_pct,
      status: 'pending',
    })
    .select('*')
    .single();
  if (error) {
    if (error.message.toLowerCase().includes('duplicate')) return null;
    throw new Error(error.message);
  }
  return data as PartnerCommissionRow;
}

// ---------- Admin ----------

export async function listPendingPartners() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partners')
    .select(`
      id, program_id, user_id, organization, website, contact_email, ref_code, status, application_md, created_at,
      partner_programs!inner(name, commission_pct),
      profiles!inner(full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function listPendingCommissions() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('partner_commissions')
    .select('id, partner_id, order_id, amount_cents, currency, commission_pct, status, created_at')
    .in('status', ['pending', 'confirmed'])
    .order('created_at', { ascending: true })
    .limit(200);
  return data ?? [];
}
