'use client';

import { useState, useCallback } from 'react';
import { Cloud, Loader2, ExternalLink, Wind, Thermometer, Droplets } from 'lucide-react';
import { obtenerClima, centroide, weatherSparkURL, type DatosClima, type MesDato } from '@/lib/clima';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:  Mojon[];
  datos:    DatosClima | null;
  onDatos:  (d: DatosClima) => void;
}

export function ClimaPanel({ mojones, datos, onDatos }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const centro = centroide(mojones);

  const handleCargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerClima(centro.lat, centro.lng);
      onDatos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo obtener los datos climáticos.');
    } finally {
      setCargando(false);
    }
  }, [centro.lat, centro.lng, onDatos]);

  if (mojones.length < 3) {
    return (
      <div className="text-center py-8 px-4">
        <Cloud className="w-8 h-8 text-moss-700/40 mx-auto mb-2" />
        <p className="text-xs text-ink-700/50 leading-relaxed">
          Trazá al menos 3 mojones para consultar el clima del centroide del terreno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ubicación + botón */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
            Clima del terreno
          </p>
          <p className="text-xs font-mono text-ink-700/60 mt-0.5">
            {centro.lat.toFixed(4)}, {centro.lng.toFixed(4)}
          </p>
        </div>
        <button
          onClick={handleCargar}
          disabled={cargando}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          {cargando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
          {cargando ? 'Cargando…' : datos ? 'Actualizar' : 'Cargar'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-danger-500 bg-danger-500/8 px-3 py-2 rounded-lg">{error}</p>
      )}

      {datos && (
        <>
          {/* Resumen anual */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={<Droplets className="w-3.5 h-3.5" />} label="Precipitación" value={`${datos.precip_anual_mm} mm`}  sub="anual" color="water" />
            <StatCard icon={<Thermometer className="w-3.5 h-3.5" />} label="Temperatura" value={`${datos.tmean_anual_c}°C`}    sub="media anual" color="sun" />
            <StatCard icon={<Droplets className="w-3.5 h-3.5" />} label="ETP"           value={`${datos.etp_anual_mm} mm`}     sub="anual Hargreaves" color="clay" />
            <StatCard icon={<Wind className="w-3.5 h-3.5" />}    label="Viento ppal."   value={datos.viento_dir_ppal}          sub="dirección" color="moss" />
          </div>

          <GraficoMensual meses={datos.meses} />
          <BalanceHidrico meses={datos.meses} />

          {/* Fuente + Weather Spark */}
          <div className="text-xs text-ink-700/50 leading-relaxed pt-1 border-t border-bone-200">
            <p className="mb-1">📡 {datos.fuente}</p>
            <p className="italic mb-2">ETP por Hargreaves — orientativo.</p>
            <a
              href={weatherSparkURL(datos.lat, datos.lng)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-water-500 hover:text-water-700 font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Ver en Weather Spark
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: 'water' | 'sun' | 'clay' | 'moss';
}) {
  const colors = { water: 'text-water-500', sun: 'text-sun-500', clay: 'text-clay-700', moss: 'text-moss-700' };
  return (
    <div className="bg-white rounded-xl p-3 border border-bone-200">
      <div className={`flex items-center gap-1 mb-1 ${colors[color]}`}>{icon}<p className="text-xs">{label}</p></div>
      <p className="font-mono text-sm font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-700/50">{sub}</p>
    </div>
  );
}

// ─── Gráfico mensual ──────────────────────────────────────────────────────────

function GraficoMensual({ meses }: { meses: MesDato[] }) {
  const maxVal = Math.max(...meses.map(m => Math.max(m.precip_mm, m.etp_mm)), 1);
  const H = 72;
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200 flex items-center justify-between">
        <p className="text-xs font-medium text-ink-700">Precipitación vs ETP mensual</p>
        <div className="flex items-center gap-3 text-xs text-ink-700/60">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-water-500 inline-block" />Precip.</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-clay-500 inline-block" />ETP</span>
        </div>
      </div>
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-end gap-0.5" style={{ height: H }}>
          {meses.map((m, i) => (
            <div key={i} className="flex-1 flex items-end gap-px">
              <div className="flex-1 flex flex-col justify-end" title={`${m.mes}: ${m.precip_mm} mm`}>
                <div className="bg-water-500 rounded-t-sm opacity-80" style={{ height: (m.precip_mm / maxVal) * H, minHeight: 1 }} />
              </div>
              <div className="flex-1 flex flex-col justify-end" title={`ETP ${m.mes}: ${m.etp_mm} mm`}>
                <div className="bg-clay-500 rounded-t-sm opacity-80" style={{ height: (m.etp_mm / maxVal) * H, minHeight: 1 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex mt-1">
          {meses.map((m, i) => <div key={i} className="flex-1 text-center"><span className="text-[9px] text-ink-700/50">{m.mes.slice(0,1)}</span></div>)}
        </div>
      </div>
    </div>
  );
}

// ─── Balance hídrico ──────────────────────────────────────────────────────────

function BalanceHidrico({ meses }: { meses: MesDato[] }) {
  const maxAbs = Math.max(...meses.map(m => Math.abs(m.balance_mm)), 1);
  const H = 48;
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200">
        <p className="text-xs font-medium text-ink-700">Balance hídrico mensual (P − ETP)</p>
      </div>
      <div className="px-2 pt-2 pb-1">
        <div className="relative" style={{ height: H * 2 }}>
          <div className="absolute w-full h-px bg-bone-200" style={{ top: H }} />
          <div className="flex items-stretch gap-0.5 h-full">
            {meses.map((m, i) => {
              const pos = m.balance_mm >= 0;
              const h = (Math.abs(m.balance_mm) / maxAbs) * H;
              return (
                <div key={i} className="flex-1 flex flex-col" title={`${m.mes}: ${m.balance_mm > 0 ? '+' : ''}${m.balance_mm} mm`}>
                  <div className="flex-none flex items-end justify-center" style={{ height: H }}>
                    {pos && <div className="w-full bg-moss-500 rounded-t-sm opacity-80" style={{ height: h, minHeight: pos ? 1 : 0 }} />}
                  </div>
                  <div className="flex-none flex items-start justify-center" style={{ height: H }}>
                    {!pos && <div className="w-full bg-clay-500 rounded-b-sm opacity-80" style={{ height: h, minHeight: !pos ? 1 : 0 }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex mt-0.5">
          {meses.map((m, i) => <div key={i} className="flex-1 text-center"><span className="text-[9px] text-ink-700/50">{m.mes.slice(0,1)}</span></div>)}
        </div>
        <div className="flex justify-between text-xs text-ink-700/50 mt-0.5 px-0.5">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-moss-500 inline-block opacity-80" />Superávit</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-clay-500 inline-block opacity-80" />Déficit</span>
        </div>
      </div>
      <div className="border-t border-bone-200 overflow-x-auto">
        <table className="w-full text-xs min-w-[380px]">
          <thead>
            <tr className="bg-bone-50">
              <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Mes</th>
              <th className="text-right px-2 py-1.5 text-water-500 font-medium">Precip.</th>
              <th className="text-right px-2 py-1.5 text-clay-700 font-medium">ETP</th>
              <th className="text-right px-2 py-1.5 text-ink-700/60 font-medium">Balance</th>
              <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">T med.</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m, i) => (
              <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                <td className="px-3 py-1.5 font-medium text-ink-700">{m.mes}</td>
                <td className="px-2 py-1.5 text-right font-mono text-water-500">{m.precip_mm}</td>
                <td className="px-2 py-1.5 text-right font-mono text-clay-700">{m.etp_mm}</td>
                <td className={`px-2 py-1.5 text-right font-mono font-semibold ${m.balance_mm >= 0 ? 'text-moss-700' : 'text-clay-700'}`}>
                  {m.balance_mm > 0 ? '+' : ''}{m.balance_mm}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-ink-700/70">{m.tmean_c}°C</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
