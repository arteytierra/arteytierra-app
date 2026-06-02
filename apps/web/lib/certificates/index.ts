import 'server-only';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Firmas HMAC-SHA256 sobre `{code}:{enrollment_id}:{issued_at}` con
 * `CERT_SIGNING_SECRET`. Permite detectar modificaciones aún si alguien
 * obtiene un código válido — la firma sólo coincide si los datos del row
 * no cambiaron.
 */

export type Locale = 'es' | 'en' | 'pt';

const DEFAULT_LOCALE: Locale = 'es';

export interface CertificateRecord {
  id: string;
  enrollment_id: string;
  code: string;
  pdf_url: string | null;
  locale: Locale;
  issued_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
  signature_hash: string | null;
}

export interface CertificateView extends CertificateRecord {
  studentName: string;
  courseName: string;
  courseSlug: string;
  completedAt: string | null;
  durationHours: number | null;
}

export function buildCertificateSignature(code: string, enrollmentId: string, issuedAt: string): string {
  const secret = process.env.CERT_SIGNING_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return crypto
    .createHmac('sha256', secret)
    .update(`${code}:${enrollmentId}:${issuedAt}`)
    .digest('hex');
}

export function verifyCertificateSignature(rec: Pick<CertificateRecord, 'code' | 'enrollment_id' | 'issued_at' | 'signature_hash'>): boolean {
  if (!rec.signature_hash) return false;
  const expected = buildCertificateSignature(rec.code, rec.enrollment_id, rec.issued_at);
  if (expected.length !== rec.signature_hash.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ rec.signature_hash.charCodeAt(i);
  return diff === 0;
}

/**
 * Asegura que un certificado tenga firma (back-fill / first read).
 */
export async function ensureCertificateSignature(rec: CertificateRecord): Promise<string> {
  if (rec.signature_hash) return rec.signature_hash;
  const sig = buildCertificateSignature(rec.code, rec.enrollment_id, rec.issued_at);
  const admin = createSupabaseAdminClient();
  await admin.schema('edu').from('certificates').update({ signature_hash: sig }).eq('id', rec.id);
  return sig;
}

export async function getCertificateByCode(code: string): Promise<CertificateView | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('edu').from('certificates')
    .select(`
      id, enrollment_id, code, pdf_url, locale, issued_at,
      revoked_at, revoked_reason, signature_hash,
      enrollments!inner(
        completed_at,
        profiles(full_name),
        courses!inner(duration_hours, products(slug, name))
      )
    `)
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (!data) return null;

  const c = data as never as CertificateRecord & {
    enrollments: {
      completed_at: string | null;
      profiles: { full_name: string | null } | null;
      courses: { duration_hours: number | null; products: { slug: string; name: string } };
    };
  };
  return {
    id: c.id,
    enrollment_id: c.enrollment_id,
    code: c.code,
    pdf_url: c.pdf_url,
    locale: (c.locale ?? DEFAULT_LOCALE) as Locale,
    issued_at: c.issued_at,
    revoked_at: c.revoked_at,
    revoked_reason: c.revoked_reason,
    signature_hash: c.signature_hash,
    studentName: c.enrollments.profiles?.full_name ?? 'Estudiante',
    courseName: c.enrollments.courses.products.name,
    courseSlug: c.enrollments.courses.products.slug,
    completedAt: c.enrollments.completed_at,
    durationHours: c.enrollments.courses.duration_hours,
  };
}

export async function revokeCertificate(code: string, byUserId: string, reason: string) {
  const admin = createSupabaseAdminClient();
  await admin
    .schema('edu').from('certificates')
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: byUserId,
      revoked_reason: reason.slice(0, 500),
    })
    .eq('code', code.toUpperCase());
}

// ---------- i18n del certificado ----------

const STRINGS: Record<Locale, {
  title: string;
  awarded: string;
  forCompleting: string;
  duration: string;
  issuedOn: string;
  code: string;
  verify: string;
  signature: string;
  director: string;
  org: string;
  tagline: string;
}> = {
  es: {
    title: 'Certificado de finalización',
    awarded: 'Se otorga el presente certificado a',
    forCompleting: 'por haber completado satisfactoriamente el curso',
    duration: 'Duración',
    issuedOn: 'Emitido el',
    code: 'Código de verificación',
    verify: 'Verificar autenticidad en',
    signature: 'Firma digital',
    director: 'Dirección académica',
    org: 'Arte y Tierra · Escuela',
    tagline: 'Educación regenerativa',
  },
  en: {
    title: 'Certificate of Completion',
    awarded: 'This certificate is awarded to',
    forCompleting: 'for having successfully completed the course',
    duration: 'Duration',
    issuedOn: 'Issued on',
    code: 'Verification code',
    verify: 'Verify authenticity at',
    signature: 'Digital signature',
    director: 'Academic Director',
    org: 'Arte y Tierra · School',
    tagline: 'Regenerative education',
  },
  pt: {
    title: 'Certificado de Conclusão',
    awarded: 'Este certificado é concedido a',
    forCompleting: 'por ter concluído com sucesso o curso',
    duration: 'Duração',
    issuedOn: 'Emitido em',
    code: 'Código de verificação',
    verify: 'Verifique a autenticidade em',
    signature: 'Assinatura digital',
    director: 'Direção acadêmica',
    org: 'Arte y Tierra · Escola',
    tagline: 'Educação regenerativa',
  },
  fr: {
    title: 'Certificat d\'achèvement',
    awarded: 'Ce certificat est décerné à',
    forCompleting: 'pour avoir complété avec succès le cours',
    duration: 'Durée',
    issuedOn: 'Émis le',
    code: 'Code de vérification',
    verify: 'Vérifier l\'authenticité sur',
    signature: 'Signature numérique',
    director: 'Direction académique',
    org: 'Arte y Tierra · École',
    tagline: 'Éducation régénérative',
  },
};

export function certStrings(locale: Locale) {
  return STRINGS[locale] ?? STRINGS[DEFAULT_LOCALE];
}

export function formatCertDate(iso: string, locale: Locale): string {
  const tag = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR';
  return new Date(iso).toLocaleDateString(tag, { year: 'numeric', month: 'long', day: 'numeric' });
}
