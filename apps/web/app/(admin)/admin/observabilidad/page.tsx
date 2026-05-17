import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata = { title: 'Observabilidad' };

// Thresholds Core Web Vitals (good)
const THRESHOLDS: Record<string, { good: number; needs: number; unit: string }> = {
  LCP:  { good: 2500, needs: 4000, unit: 'ms' },
  INP:  { good: 200,  needs: 500,  unit: 'ms' },
  CLS:  { good: 0.1,  needs: 0.25, unit: '' },
  FCP:  { good: 1800, needs: 3000, unit: 'ms' },
  TTFB: { good: 800,  needs: 1800, unit: 'ms' },
  FID:  { good: 100,  needs: 300,  unit: 'ms' },
};

function fmtMs(v: number, unit: string) {
  if (unit === 'ms') return `${Math.round(v)} ms`;
  return v.toFixed(3);
}

function rate(p75: number, metric: string): 'good' | 'needs' | 'poor' {
  const th = THRESHOLDS[metric];
  if (!th) return 'good';
  if (p75 <= th.good) return 'good';
  if (p75 <= th.needs) return 'needs';
  return 'poor';
}

const COLOR: Record<string, string> = {
  good: 'bg-leaf/10 text-leaf',
  needs: 'bg-amber-100 text-amber-800',
  poor: 'bg-red-100 text-red-800',
};

export default async function ObservabilityPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();

  const [{ data: vitals }, { data: errors }, { data: pathCounts }] = await Promise.all([
    admin.schema('app').from('web_vitals_p75').select('*').limit(200),
    admin.schema('app').from('server_errors').select('id, source, route, job_name, message, created_at').order('created_at', { ascending: false }).limit(50),
    admin.schema('app').from('web_vitals').select('path, metric, value').gte('created_at', new Date(Date.now() - 7 * 86400_000).toISOString()).limit(5000),
  ]);

  // Latest day per metric
  const latestByMetric = new Map<string, { p50: number; p75: number; p95: number; samples: number; day: string }>();
  for (const v of ((vitals ?? []) as Array<Record<string, unknown>>)) {
    if (!latestByMetric.has(v.metric as string)) {
      latestByMetric.set(v.metric as string, {
        p50: Number(v.p50 ?? 0),
        p75: Number(v.p75 ?? 0),
        p95: Number(v.p95 ?? 0),
        samples: Number(v.samples ?? 0),
        day: v.day as string,
      });
    }
  }

  // Top slow paths LCP
  const lcpByPath = new Map<string, { values: number[]; count: number }>();
  for (const r of ((pathCounts ?? []) as Array<{ path: string | null; metric: string; value: number }>)) {
    if (r.metric !== 'LCP' || !r.path) continue;
    const entry = lcpByPath.get(r.path) ?? { values: [], count: 0 };
    entry.values.push(r.value);
    entry.count++;
    lcpByPath.set(r.path, entry);
  }
  const slowPaths = Array.from(lcpByPath.entries())
    .filter(([, e]) => e.count >= 5)
    .map(([path, e]) => {
      const sorted = [...e.values].sort((a, b) => a - b);
      const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
      return { path, p75, samples: e.count };
    })
    .sort((a, b) => b.p75 - a.p75)
    .slice(0, 10);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Observabilidad</h1>

      <section className="mb-10">
        <h2 className="font-display text-lg text-ink mb-3">Core Web Vitals · P75 (último día)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.keys(THRESHOLDS).map((m) => {
            const data = latestByMetric.get(m);
            const th = THRESHOLDS[m]!;
            const r = data ? rate(data.p75, m) : 'good';
            return (
              <div key={m} className="rounded-lg border border-ink/10 bg-bone p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-mute">{m}</div>
                  <span className={`text-[10px] uppercase rounded px-1.5 py-0.5 ${COLOR[r]}`}>{r}</span>
                </div>
                <div className="font-display text-xl text-ink mt-1">
                  {data ? fmtMs(data.p75, th.unit) : '—'}
                </div>
                <div className="text-xs text-mute mt-1">
                  {data ? `${data.samples} muestras` : 'sin datos'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-lg text-ink mb-3">Páginas más lentas (LCP P75, 7 días)</h2>
        <div className="overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-bone-50 text-left">
              <tr>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2 text-right">LCP P75</th>
                <th className="px-3 py-2 text-right">Muestras</th>
              </tr>
            </thead>
            <tbody>
              {slowPaths.map((p) => (
                <tr key={p.path} className="border-t border-ink/5">
                  <td className="px-3 py-2 font-mono text-xs">{p.path}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{Math.round(p.p75)} ms</td>
                  <td className="px-3 py-2 text-right text-mute">{p.samples}</td>
                </tr>
              ))}
              {slowPaths.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-8 text-center text-mute">Sin datos suficientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-ink mb-3">Últimos errores capturados</h2>
        <div className="overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-bone-50 text-left">
              <tr>
                <th className="px-3 py-2">Cuándo</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Donde</th>
                <th className="px-3 py-2">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {((errors ?? []) as Array<Record<string, unknown>>).map((e) => (
                <tr key={e.id as number} className="border-t border-ink/5">
                  <td className="px-3 py-2 text-mute whitespace-nowrap">{new Date(e.created_at as string).toLocaleString('es-AR')}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.source as string}</td>
                  <td className="px-3 py-2 text-mute">{(e.route ?? e.job_name ?? '—') as string}</td>
                  <td className="px-3 py-2 max-w-[420px] truncate">{e.message as string}</td>
                </tr>
              ))}
              {(!errors || errors.length === 0) && (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-mute">Sin errores recientes 🌱</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
