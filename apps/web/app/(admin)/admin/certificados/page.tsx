import Link from 'next/link';
import { Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { RevokeCertButton } from '@/components/admin/certificados/RevokeCertButton';

export const metadata = { title: 'Certificados · Admin' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'active', label: 'Activos' },
  { key: 'revoked', label: 'Revocados' },
] as const;

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (TABS.find((t) => t.key === sp.status)?.key ?? 'active') as 'active' | 'revoked';

  const admin = createSupabaseAdminClient();
  let q = admin
    .from('certificates')
    .select(`
      id, code, issued_at, revoked_at, revoked_reason, locale, download_count,
      enrollments!inner(
        profiles(full_name),
        courses!inner(products(name, slug))
      )
    `)
    .order('issued_at', { ascending: false })
    .limit(200);
  q = filter === 'revoked' ? q.not('revoked_at', 'is', null) : q.is('revoked_at', null);
  const { data } = await q;
  const rows = (data ?? []) as never as Array<{
    id: string; code: string; issued_at: string;
    revoked_at: string | null; revoked_reason: string | null;
    locale: string; download_count: number;
    enrollments: {
      profiles: { full_name: string | null } | null;
      courses: { products: { name: string; slug: string } };
    };
  }>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificados emitidos"
        subtitle="Verificación pública, descarga PDF y revocación."
      />

      <nav className="flex gap-2 border-b border-ink-950/10">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/certificados?status=${t.key}`}
            className={
              'px-4 py-2 text-sm transition-colors -mb-px border-b-2 ' +
              (filter === t.key
                ? 'border-ink-950 text-ink-950'
                : 'border-transparent text-ink-800/65 hover:text-ink-950')
            }
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="Sin certificados" description="Todavía no hay emisiones que coincidan." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-950/10 bg-bone-50">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-left text-xs uppercase tracking-wide text-ink-800/65">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Emitido</th>
                <th className="px-4 py-3">Descargas</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-950/5">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-bone-100/50">
                  <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3">{r.enrollments.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3">{r.enrollments.courses.products.name}</td>
                  <td className="px-4 py-3 text-xs">{new Date(r.issued_at).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-xs">{r.download_count}</td>
                  <td className="px-4 py-3">
                    {r.revoked_at ? <Badge tone="clay">Revocado</Badge> : <Badge tone="moss">Válido</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={`/verificar/${r.code}`}
                        target="_blank"
                        rel="noopener"
                        className="text-xs underline"
                      >
                        Verificar
                      </a>
                      <a
                        href={`/api/certificados/${r.code}/pdf`}
                        target="_blank"
                        rel="noopener"
                        className="text-xs underline"
                      >
                        PDF
                      </a>
                      {!r.revoked_at && <RevokeCertButton code={r.code} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
