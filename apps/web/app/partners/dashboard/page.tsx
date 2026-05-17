import Link from 'next/link';
import { Badge, Container, Section, Eyebrow } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { requireUser } from '@/lib/auth/session';
import { getMyPartner, getPartnerSummary, listPartnerCommissions } from '@/lib/partners';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Partners · Dashboard' };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

const STATUS_TONE: Record<string, 'sun' | 'moss' | 'clay' | 'ink' | 'neutral'> = {
  pending: 'sun',
  active: 'moss',
  paused: 'neutral',
  banned: 'clay',
};

const COMMISSION_STATUS: Record<string, { label: string; tone: 'sun' | 'moss' | 'clay' | 'neutral' }> = {
  pending: { label: 'Pendiente', tone: 'sun' },
  confirmed: { label: 'Confirmada', tone: 'moss' },
  paid: { label: 'Pagada', tone: 'moss' },
  reversed: { label: 'Revertida', tone: 'clay' },
};

export default async function PartnerDashboardPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser('/partners/dashboard');
  const sp = await searchParams;
  const partner = await getMyPartner(user.id);

  if (!partner) {
    return (
      <>
        <SiteHeader />
        <Section tone="bone" spacing="md">
          <Container width="prose">
            <Eyebrow>Partners</Eyebrow>
            <h1 className="display-3 mt-3">Todavía no sos partner</h1>
            <p className="lead mt-4">
              Postulá a uno de nuestros programas y recibí tu código único, dashboard y comisiones.
            </p>
            <Link href="/partners" className="mt-6 inline-block text-moss-700 underline">
              Ver programas disponibles →
            </Link>
          </Container>
        </Section>
        <SiteFooter />
      </>
    );
  }

  const summary = await getPartnerSummary(partner.id);
  const commissions = partner.status === 'active' ? await listPartnerCommissions(partner.id) : [];
  const refUrl = `${SITE}?partner=${partner.ref_code}`;

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container>
          {sp.ok === '1' && (
            <p className="mb-6 rounded-xl bg-moss-100 px-4 py-3 text-sm text-moss-900">
              Postulación recibida. Te avisamos por mail cuando esté aprobada.
            </p>
          )}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <Eyebrow>Partner dashboard</Eyebrow>
              <h1 className="display-3 mt-2">{partner.organization}</h1>
            </div>
            <Badge tone={STATUS_TONE[partner.status]}>
              {partner.status === 'active'
                ? 'Activo'
                : partner.status === 'pending'
                ? 'En revisión'
                : partner.status === 'paused'
                ? 'Pausado'
                : 'Bloqueado'}
            </Badge>
          </div>

          {partner.status === 'active' && (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Stat label="Órdenes atribuidas" value={summary?.total_orders ?? 0} />
                <Stat
                  label="Confirmado"
                  value={`$ ${((summary?.confirmed_cents ?? 0) / 100).toLocaleString('es-AR')}`}
                />
                <Stat
                  label="Pagado"
                  value={`$ ${((summary?.paid_cents ?? 0) / 100).toLocaleString('es-AR')}`}
                />
              </div>

              <div className="mt-8 rounded-2xl bg-ink-950 text-bone-50 p-6">
                <p className="text-xs uppercase tracking-wide text-bone-50/70">Tu código</p>
                <p className="font-mono font-bold text-2xl mt-1">{partner.ref_code}</p>
                <p className="text-xs text-bone-50/70 mt-3">Link de referencia:</p>
                <code className="block mt-1 text-sm break-all">{refUrl}</code>
              </div>

              <h2 className="mt-10 font-display text-2xl">Comisiones</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-950/10 bg-bone-50">
                <table className="w-full text-sm">
                  <thead className="bg-bone-100 text-xs uppercase tracking-wide text-ink-800/65 text-left">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Orden</th>
                      <th className="px-4 py-3">Monto</th>
                      <th className="px-4 py-3">Comisión</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-950/5">
                    {commissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-ink-800/65">
                          Aún no hay comisiones. Compartí tu link para empezar.
                        </td>
                      </tr>
                    )}
                    {commissions.map((c) => {
                      const meta = COMMISSION_STATUS[c.status] ?? COMMISSION_STATUS.pending;
                      return (
                        <tr key={c.id}>
                          <td className="px-4 py-2 text-xs">
                            {c.confirmed_at
                              ? new Date(c.confirmed_at).toLocaleDateString('es-AR')
                              : '—'}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs">{c.order_id.slice(0, 8)}</td>
                          <td className="px-4 py-2">{c.currency} {(c.amount_cents / 100).toLocaleString('es-AR')}</td>
                          <td className="px-4 py-2 text-xs">{c.commission_pct}%</td>
                          <td className="px-4 py-2">
                            <Badge tone={meta.tone}>{meta.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {partner.status === 'pending' && (
            <p className="mt-10 rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-6 text-sm text-ink-800/70">
              Tu postulación está en revisión. Te avisamos por mail apenas se apruebe.
            </p>
          )}
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
      <p className="text-xs uppercase tracking-wide text-ink-800/65">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
