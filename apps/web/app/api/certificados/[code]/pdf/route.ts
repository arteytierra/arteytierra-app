import { NextResponse } from 'next/server';
import { getCertificateByCode, ensureCertificateSignature, verifyCertificateSignature, type Locale } from '@/lib/certificates';
import { buildCertificatePdf } from '@/lib/certificates/pdf';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const url = new URL(req.url);
  const lang = (url.searchParams.get('lang') ?? '').toLowerCase();
  const locale: Locale | undefined =
    lang === 'en' || lang === 'es' || lang === 'pt' ? lang : undefined;

  const cert = await getCertificateByCode(code);
  if (!cert) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (cert.revoked_at) {
    return NextResponse.json({ error: 'revoked', reason: cert.revoked_reason }, { status: 410 });
  }

  // Back-fill signature on first read; verify integrity
  await ensureCertificateSignature(cert);

  const pdfBytes = await buildCertificatePdf({ cert, baseUrl: SITE, locale });

  // Bump counter (no aguardo respuesta — fire and forget no es seguro acá, pero es liviano)
  try {
    const admin = createSupabaseAdminClient();
    await admin.schema('edu').rpc('bump_certificate_download', { p_code: cert.code });
  } catch {
    /* no-op */
  }

  return new Response(pdfBytes as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="certificado-${cert.code}.pdf"`,
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      // Permitir lectura cross-origin (e.g. embebido en el panel del alumno)
      'X-Content-Type-Options': 'nosniff',
      'X-Cert-Verified': verifyCertificateSignature(cert) ? 'true' : 'false',
    },
  });
}
