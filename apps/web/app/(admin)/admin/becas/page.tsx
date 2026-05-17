import { Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listPendingApplicationsAdmin } from '@/lib/scholarships';
import { ScholarshipReviewActions } from '@/components/admin/becas/ScholarshipReviewActions';
import { EvidenceLink } from '@/components/admin/becas/EvidenceLink';

export const metadata = { title: 'Becas · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminBecasPage() {
  const items = await listPendingApplicationsAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cola de becas"
        subtitle="Postulaciones pendientes de revisión. Aprobar emite un cupón automáticamente."
      />

      {items.length === 0 ? (
        <EmptyState title="Sin postulaciones" description="No hay solicitudes pendientes." />
      ) : (
        <ul className="space-y-4">
          {items.map((it) => {
            const a = it as never as {
              id: string; motivation: string; evidence_path: string | null;
              household_info: Record<string, unknown>; status: string;
              scholarship_programs: { name: string; discount_type: string; discount_value: number; currency: string | null };
              profiles: { full_name: string | null };
            };
            return (
              <li key={a.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <Badge tone="sun">{a.scholarship_programs.name}</Badge>
                    <h3 className="font-display text-lg mt-2">{a.profiles?.full_name ?? 'Anónimo'}</h3>
                    <p className="text-xs text-ink-800/60">
                      Descuento:{' '}
                      {a.scholarship_programs.discount_type === 'percent'
                        ? `${a.scholarship_programs.discount_value}%`
                        : `${a.scholarship_programs.currency ?? ''} ${a.scholarship_programs.discount_value / 100}`}
                    </p>
                  </div>
                  {a.evidence_path && <EvidenceLink path={a.evidence_path} />}
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-ink-800/70 hover:text-ink-950">Ver carta de motivación</summary>
                  <p className="mt-2 whitespace-pre-wrap text-ink-900">{a.motivation}</p>
                </details>
                {a.household_info && Object.keys(a.household_info).length > 0 && (
                  <pre className="mt-3 rounded-xl bg-bone-100 px-3 py-2 text-xs whitespace-pre-wrap">
                    {JSON.stringify(a.household_info, null, 2)}
                  </pre>
                )}
                <ScholarshipReviewActions applicationId={a.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
