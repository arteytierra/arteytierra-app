import Link from 'next/link';
import { Award, ExternalLink } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { getCurrentUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata = { title: 'Mis certificados' };

export default async function CertificadosPage() {
  const user = (await getCurrentUser())!;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('certificates')
    .select(`
      id, code, issued_at, pdf_url,
      enrollments!inner(user_id,
        courses!inner(products(slug, name)))
    `)
    .eq('enrollments.user_id', user.id);

  const certs = (data ?? []) as never as Array<{
    id: string; code: string; issued_at: string; pdf_url: string | null;
    enrollments: { courses: { products: { slug: string; name: string } } };
  }>;

  if (certs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-12 text-center">
        <p className="font-display text-2xl">Aún no tenés certificados</p>
        <p className="mt-3 text-ink-800/65">
          Al completar el 95% de un curso emitimos tu certificado digital con código verificable.
        </p>
        <Link href="/mis-cursos">
          <Button variant="moss" size="lg" className="mt-6">Volver a mis cursos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {certs.map((c) => (
        <article key={c.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700">
            <Award size={18} />
          </div>
          <h2 className="font-display text-xl mt-4">{c.enrollments.courses.products.name}</h2>
          <p className="mt-2 text-xs text-ink-800/65">
            Emitido el {new Date(c.issued_at).toLocaleDateString('es-AR')}
          </p>
          <p className="mt-3 font-mono text-xs text-ink-800/80">{c.code}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/verificar/${c.code}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-xs hover:bg-bone-100"
            >
              <ExternalLink size={11} /> Página pública
            </Link>
            <a
              href={`/api/certificados/${c.code}/pdf?lang=es`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-ink-950 text-bone-50 px-4 py-2 text-xs hover:bg-moss-700"
            >
              PDF · ES
            </a>
            <a
              href={`/api/certificados/${c.code}/pdf?lang=en`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-xs hover:bg-bone-100"
            >
              EN
            </a>
            <a
              href={`/api/certificados/${c.code}/pdf?lang=pt`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-xs hover:bg-bone-100"
            >
              PT
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
