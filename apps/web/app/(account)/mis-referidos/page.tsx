import { formatMoney } from '@arteytierra/ui';
import { getMyReferralCodes } from '@/lib/referrals';
import { CreateReferralCodeForm } from '@/components/account/referrals/CreateReferralCodeForm';
import { ReferralCard } from '@/components/account/referrals/ReferralCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mis referidos' };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export default async function ReferidosPage() {
  const codes = await getMyReferralCodes();

  const totals = codes.reduce(
    (acc, c) => ({
      pending: acc.pending + c.pending_cents,
      paid: acc.paid + c.paid_cents,
      conversions: acc.conversions + c.conversions,
    }),
    { pending: 0, paid: 0, conversions: 0 },
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Programa de referidos</p>
        <h2 className="display-4 mt-3">Compartí Arte y Tierra, ganá comisiones</h2>
        <p className="mt-3 text-ink-800/70 max-w-prose">
          Generá tu código personalizado y compartilo. Cuando alguien compra usando tu link,
          recibís una comisión sobre el total. Las liquidaciones se hacen al mes siguiente.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatBox label="Conversiones" value={String(totals.conversions)} />
        <StatBox label="Comisión pendiente" value={formatMoney(totals.pending, 'ARS')} />
        <StatBox label="Pagado" value={formatMoney(totals.paid, 'ARS')} />
      </section>

      <CreateReferralCodeForm />

      <section className="space-y-3">
        <h3 className="font-display text-xl text-ink-950">Tus códigos</h3>
        {codes.length === 0 ? (
          <p className="text-sm text-ink-800/65">
            Aún no creaste ningún código. Empezá con el formulario de arriba.
          </p>
        ) : (
          <ul className="space-y-3">
            {codes.map((c) => (
              <ReferralCard key={c.id} code={c} siteUrl={SITE} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-800/60">{label}</p>
      <p className="font-display text-2xl text-ink-950 mt-1.5">{value}</p>
    </div>
  );
}
