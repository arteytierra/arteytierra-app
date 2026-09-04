import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Award, CheckCircle2, AlertTriangle, Download, ShieldCheck } from 'lucide-react';
import { Container, Section, Eyebrow, Badge } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import {
  getCertificateByCode,
  ensureCertificateSignature,
  verifyCertificateSignature,
  certStrings,
  formatCertDate,
  type Locale,
} from '@/lib/certificates';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert = await getCertificateByCode(code);
  if (!cert) return { title: `Certificado ${code}` };
  return {
    title: `${cert.studentName} — ${cert.courseName}`,
    description: `Certificado de finalización del curso ${cert.courseName} emitido por Arte y Tierra. Código ${cert.code}.`,
    robots: { index: false, follow: false },
  };
}

const LANGS: Array<{ code: Locale; label: string }> = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

export default async function VerificarPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const cert = await getCertificateByCode(code);
  if (!cert) notFound();

  const locale = ((sp.lang === 'en' || sp.lang === 'pt' || sp.lang === 'es')
    ? sp.lang
    : cert.locale) as Locale;
  const t = certStrings(locale);

  // Asegurar firma + verificar
  await ensureCertificateSignature(cert);
  const verified = verifyCertificateSignature(cert);
  const revoked = !!cert.revoked_at;

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          {/* Language switch */}
          <div className="flex justify-end gap-1 text-xs">
            {LANGS.map((l) => (
              <Link
                key={l.code}
                href={`/verificar/${cert.code}?lang=${l.code}`}
                className={
                  'rounded-full border px-2.5 py-0.5 ' +
                  (locale === l.code
                    ? 'border-ink-950 bg-ink-950 text-bone-50'
                    : 'border-ink-950/15 text-ink-800/70 hover:bg-bone-50')
                }
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Eyebrow>
              {locale === 'en' ? 'Certificate verification' : locale === 'pt' ? 'Verificação de certificado' : 'Verificación de certificado'}
            </Eyebrow>

            <div
              className={
                'mt-6 inline-flex h-16 w-16 items-center justify-center rounded-full ' +
                (revoked
                  ? 'bg-clay-100 text-clay-700'
                  : verified
                  ? 'bg-moss-100 text-moss-700'
                  : 'bg-sun-300/30 text-clay-700')
              }
            >
              {revoked ? <AlertTriangle size={32} /> : <Award size={32} />}
            </div>

            <h1 className="display-3 mt-6">
              {revoked
                ? locale === 'en'
                  ? 'Certificate revoked'
                  : locale === 'pt'
                  ? 'Certificado revogado'
                  : 'Certificado revocado'
                : verified
                ? locale === 'en'
                  ? 'Authentic certificate'
                  : locale === 'pt'
                  ? 'Certificado autêntico'
                  : 'Certificado válido'
                : locale === 'en'
                ? 'Signature mismatch'
                : locale === 'pt'
                ? 'Falha na assinatura'
                : 'Firma no verificada'}
            </h1>

            {revoked && cert.revoked_reason && (
              <p className="mt-3 text-sm text-clay-700">{cert.revoked_reason}</p>
            )}

            <div className="mt-10 rounded-2xl border border-ink-950/10 bg-bone-50 p-8 text-left">
              <dl className="space-y-4">
                <Row label={locale === 'en' ? 'Awarded to' : locale === 'pt' ? 'Concedido a' : 'Nombre'} value={cert.studentName} />
                <Row label={locale === 'en' ? 'Course' : 'Curso'} value={cert.courseName} />
                {cert.durationHours && <Row label={t.duration} value={`${cert.durationHours} h`} />}
                <Row label={t.issuedOn} value={formatCertDate(cert.issued_at, locale)} />
                {cert.completedAt && (
                  <Row
                    label={locale === 'en' ? 'Completed on' : locale === 'pt' ? 'Concluído em' : 'Completado'}
                    value={formatCertDate(cert.completedAt, locale)}
                  />
                )}
                <Row label={t.code} value={<span className="font-mono">{cert.code}</span>} />
                <Row
                  label={t.signature}
                  value={
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      {verified ? (
                        <>
                          <ShieldCheck size={14} className="text-moss-700" />
                          <code className="text-ink-800/70">{cert.signature_hash?.slice(0, 16)}…</code>
                          <Badge tone="moss">OK</Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} className="text-clay-700" />
                          <Badge tone="clay">FAIL</Badge>
                        </>
                      )}
                    </span>
                  }
                />
              </dl>

              {!revoked && verified && (
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-950/10 pt-6">
                  <span className="inline-flex items-center gap-2 text-sm text-moss-700">
                    <CheckCircle2 size={14} /> {t.org}
                  </span>
                  <a
                    href={`/api/certificados/${cert.code}/pdf?lang=${locale}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2 text-xs text-bone-50 hover:bg-moss-700"
                  >
                    <Download size={12} /> {locale === 'en' ? 'Download PDF' : locale === 'pt' ? 'Baixar PDF' : 'Descargar PDF'}
                  </a>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs text-ink-800/55">
              {locale === 'en'
                ? 'Public verification page. The QR code on the PDF leads here.'
                : locale === 'pt'
                ? 'Página pública de verificação. O QR do PDF leva a esta página.'
                : 'Página pública de verificación. El QR del PDF apunta a esta dirección.'}
            </p>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-3 gap-1">
      <dt className="text-xs uppercase tracking-[0.14em] text-ink-800/55">{label}</dt>
      <dd className="sm:col-span-2 text-ink-900">{value}</dd>
    </div>
  );
}
