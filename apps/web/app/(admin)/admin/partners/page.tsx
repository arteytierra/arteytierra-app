import { Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { listPendingPartners, listPendingCommissions } from '@/lib/partners';
import { PartnerReviewActions } from '@/components/admin/partners/PartnerReviewActions';
import { CommissionActions } from '@/components/admin/partners/CommissionActions';

export const metadata = { title: 'Partners · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPartnersPage() {
  const partners = await listPendingPartners();
  const commissions = await listPendingCommissions();

  return (
    <div className="space-y-10">
      <PageHeader
        title="Partners B2B"
        subtitle="Aprobá postulaciones y confirmá / pagá comisiones acumuladas."
      />

      <section>
        <h2 className="font-display text-xl">Postulaciones</h2>
        <div className="mt-4 space-y-3">
          {partners.length === 0 && (
            <p className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-6 text-sm text-ink-800/65">
              Sin postulaciones pendientes.
            </p>
          )}
          {partners.map((rawP) => {
            const p = rawP as never as {
              id: string; organization: string; contact_email: string; website: string | null;
              application_md: string | null; ref_code: string;
              partner_programs: { name: string; commission_pct: number };
              profiles: { full_name: string | null };
            };
            return (
              <article key={p.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <Badge tone="sun">{p.partner_programs.name}</Badge>
                    <h3 className="font-display text-lg mt-2">{p.organization}</h3>
                    <p className="text-xs text-ink-800/65">
                      {p.profiles?.full_name ?? '—'} · {p.contact_email}
                      {p.website && (
                        <>
                          {' · '}
                          <a className="underline" href={p.website} target="_blank" rel="noopener">
                            {p.website}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <code className="text-xs text-ink-800/55">{p.ref_code}</code>
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-ink-800/70">Ver pitch</summary>
                  <p className="mt-2 whitespace-pre-wrap">{p.application_md}</p>
                </details>
                <PartnerReviewActions partnerId={p.id} />
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl">Comisiones pendientes</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-950/10 bg-bone-50">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-xs uppercase tracking-wide text-ink-800/65 text-left">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-950/5">
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-800/65">
                    No hay comisiones pendientes.
                  </td>
                </tr>
              )}
              {commissions.map((rawC) => {
                const c = rawC as never as {
                  id: string; partner_id: string; order_id: string;
                  amount_cents: number; currency: string; commission_pct: number; status: string;
                };
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2 font-mono text-xs">{c.partner_id.slice(0, 8)}</td>
                    <td className="px-4 py-2 font-mono text-xs">{c.order_id.slice(0, 8)}</td>
                    <td className="px-4 py-2">{c.currency} {(c.amount_cents / 100).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-2">
                      <Badge tone={c.status === 'confirmed' ? 'moss' : 'sun'}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <CommissionActions commissionId={c.id} status={c.status as 'pending' | 'confirmed'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
