import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata = { title: 'Atribución' };

function money(cents: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format((cents ?? 0) / 100);
}

export default async function AttributionPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const days = Math.min(Math.max(Number(sp.days ?? 30), 1), 365);
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const admin = createSupabaseAdminClient();
  const { data: byCampaign } = await admin
    .schema('app')
    .from('attribution_conversions')
    .select('source, medium, campaign, amount_cents, partner_ref')
    .gte('created_at', since)
    .limit(5000);

  type Row = {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    amount_cents: number;
    partner_ref: string | null;
  };

  const rows = (byCampaign ?? []) as Row[];
  const totalCents = rows.reduce((a, r) => a + (r.amount_cents ?? 0), 0);
  const totalConv = rows.length;
  const partnerCents = rows.filter((r) => r.partner_ref).reduce((a, r) => a + r.amount_cents, 0);

  // Agrupar por (source, medium, campaign)
  const agg = new Map<string, { source: string; medium: string; campaign: string; cents: number; count: number }>();
  for (const r of rows) {
    const key = `${r.source ?? '(direct)'}|${r.medium ?? '(none)'}|${r.campaign ?? '(none)'}`;
    const prev = agg.get(key) ?? {
      source: r.source ?? '(direct)',
      medium: r.medium ?? '(none)',
      campaign: r.campaign ?? '(none)',
      cents: 0,
      count: 0,
    };
    prev.cents += r.amount_cents ?? 0;
    prev.count += 1;
    agg.set(key, prev);
  }
  const grouped = Array.from(agg.values()).sort((a, b) => b.cents - a.cents);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Atribución de ventas</h1>
        <form className="flex items-center gap-2 text-sm">
          <label className="text-mute">Últimos</label>
          <select name="days" defaultValue={String(days)} className="rounded border border-ink/15 px-2 py-1">
            <option value="7">7 días</option>
            <option value="30">30 días</option>
            <option value="90">90 días</option>
            <option value="180">180 días</option>
          </select>
          <button className="rounded bg-leaf px-3 py-1 text-bone">Aplicar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card label="Conversiones" value={String(totalConv)} />
        <Card label="Revenue atribuido" value={money(totalCents)} />
        <Card
          label="% vía partners"
          value={totalCents > 0 ? `${Math.round((partnerCents / totalCents) * 100)}%` : '—'}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-bone/50 text-left">
            <tr>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Medium</th>
              <th className="px-3 py-2">Campaign</th>
              <th className="px-3 py-2 text-right">Conv.</th>
              <th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2 text-right">AOV</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g) => (
              <tr key={`${g.source}-${g.medium}-${g.campaign}`} className="border-t border-ink/5">
                <td className="px-3 py-2 font-medium">{g.source}</td>
                <td className="px-3 py-2 text-mute">{g.medium}</td>
                <td className="px-3 py-2 text-mute">{g.campaign}</td>
                <td className="px-3 py-2 text-right tabular-nums">{g.count}</td>
                <td className="px-3 py-2 text-right tabular-nums">{money(g.cents)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-mute">
                  {money(g.count > 0 ? g.cents / g.count : 0)}
                </td>
              </tr>
            ))}
            {grouped.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-mute">Sin datos en el período.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-bone p-4">
      <div className="text-xs uppercase tracking-wider text-mute">{label}</div>
      <div className="font-display text-2xl text-ink mt-1">{value}</div>
    </div>
  );
}
