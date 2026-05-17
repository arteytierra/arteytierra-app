import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata = { title: 'Experimentos & Flags' };

export default async function ExperimentsPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();

  const [{ data: exps }, { data: flags }] = await Promise.all([
    admin.schema('app').from('experiment_summary').select('*').limit(100),
    admin.schema('app').from('feature_flags').select('*').order('updated_at', { ascending: false }).limit(100),
  ]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Experimentos & Feature Flags</h1>

      <section className="mb-10">
        <h2 className="font-display text-lg text-ink mb-3">Experimentos</h2>
        <div className="overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-bone-50 text-left">
              <tr>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Rollout</th>
                <th className="px-3 py-2">Exposiciones</th>
                <th className="px-3 py-2">Conversiones</th>
              </tr>
            </thead>
            <tbody>
              {((exps ?? []) as Array<Record<string, unknown>>).map((e) => (
                <tr key={e.key as string} className="border-t border-ink/5 align-top">
                  <td className="px-3 py-2 font-mono text-xs">{e.key as string}</td>
                  <td className="px-3 py-2">{e.name as string}</td>
                  <td className="px-3 py-2 text-mute">{e.status as string}</td>
                  <td className="px-3 py-2 tabular-nums">{Number(e.rollout_pct ?? 0)}%</td>
                  <td className="px-3 py-2 text-mute font-mono text-[11px]">{JSON.stringify(e.exposures_by_variant ?? {})}</td>
                  <td className="px-3 py-2 text-mute font-mono text-[11px]">{JSON.stringify(e.conversions_by_variant ?? {})}</td>
                </tr>
              ))}
              {(!exps || exps.length === 0) && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-mute">Sin experimentos. Insertá manualmente en app.experiments y status=&apos;running&apos;.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-ink mb-3">Feature flags</h2>
        <div className="overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-bone-50 text-left">
              <tr>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Enabled</th>
                <th className="px-3 py-2">Rollout</th>
                <th className="px-3 py-2">Overrides</th>
                <th className="px-3 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {((flags ?? []) as Array<Record<string, unknown>>).map((f) => (
                <tr key={f.key as string} className="border-t border-ink/5">
                  <td className="px-3 py-2 font-mono text-xs">{f.key as string}</td>
                  <td className="px-3 py-2">{f.enabled ? '✓' : '✗'}</td>
                  <td className="px-3 py-2 tabular-nums">{Number(f.rollout_pct ?? 0)}%</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-mute">{JSON.stringify(f.overrides ?? {})}</td>
                  <td className="px-3 py-2 text-mute">{(f.description as string) ?? ''}</td>
                </tr>
              ))}
              {(!flags || flags.length === 0) && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-mute">Sin flags todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-mute mt-3">
          Crear/editar vía SQL: <code>insert into app.feature_flags (key, enabled, rollout_pct) values (&apos;mi.flag&apos;, true, 50);</code>
        </p>
      </section>
    </main>
  );
}
