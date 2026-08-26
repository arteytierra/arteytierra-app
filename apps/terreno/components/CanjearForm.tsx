'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Loader2, CheckCircle2 } from 'lucide-react';

export function CanjearForm({ codigoInicial }: { codigoInicial: string }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(codigoInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<{ dias: number } | null>(null);

  async function activar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/canjear', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      const data = await res.json() as { ok: boolean; error?: string; dias?: number };
      if (!data.ok) { setError(data.error ?? 'No pudimos activar el código.'); setLoading(false); return; }
      setOk({ dias: data.dias ?? 7 });
      setTimeout(() => { router.push('/mapa'); router.refresh(); }, 2200);
    } catch {
      setError('No pudimos activar el código. Probá de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="eyebrow mb-2">acequia · Invitación</p>
          <h1 className="font-display text-2xl text-ink-950">Activá tu prueba</h1>
          <p className="text-sm text-ink-700/70 mt-2">
            Ingresá tu código y desbloqueá el plan por unos días, sin tarjeta.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-bone-200 p-6 shadow-paper">
          {ok ? (
            <div className="text-center space-y-3 py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-moss-50 border border-moss-200 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-moss-700" />
              </div>
              <p className="text-sm text-ink-900 font-medium">¡Listo! Tu prueba de {ok.dias} días está activa.</p>
              <p className="text-xs text-ink-700/60">Te llevamos al mapa…</p>
            </div>
          ) : (
            <form onSubmit={activar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Código de invitación</label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.toUpperCase())}
                  placeholder="AMIGOS7"
                  className="w-full px-3 py-2.5 rounded-lg border border-bone-200 bg-white text-ink-950 tracking-widest font-mono placeholder:text-ink-700/40 focus:outline-none focus:ring-2 focus:ring-moss-500/40 focus:border-moss-500 transition-colors text-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-danger-500 bg-danger-500/8 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-moss-700 hover:bg-moss-900 text-bone-50 font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                {loading ? 'Activando…' : 'Activar mi prueba'}
              </button>
            </form>
          )}
        </div>

        <a href="/mapa" className="mt-4 block text-center text-xs text-ink-700/60 hover:text-moss-700 transition-colors">
          Ir al mapa
        </a>
      </div>
    </div>
  );
}
