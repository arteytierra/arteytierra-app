'use client';

/**
 * Cobertura del suelo (C3) — ESA WorldCover 10 m (2021).
 * Muestra la composición de clases de uso/cobertura del predio y deriva el % de
 * vegetación, una sugerencia de forraje y una nota de escorrentía (CN).
 */
import { useState, useEffect } from 'react';
import { Trees, TriangleAlert, Loader2, Sprout } from 'lucide-react';
import { obtenerCobertura, resumirCobertura, type DatosCobertura, type CoberturaResumen } from '@/lib/cobertura';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:    Mojon[];
  datos:      DatosCobertura | null;
  onDatos:    (d: DatosCobertura | null) => void;
  onResumen?: (r: CoberturaResumen | null) => void;
}

export function CoberturaPanel({ mojones, datos, onDatos, onResumen }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { onResumen?.(datos ? resumirCobertura(datos) : null); }, [datos, onResumen]);

  const analizar = async () => {
    if (mojones.length < 3) { setError('Marcá al menos 3 mojones para delimitar el predio.'); return; }
    setCargando(true); setError(null);
    try {
      onDatos(await obtenerCobertura(mojones));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo obtener la cobertura.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Cobertura del suelo (satelital)
      </p>

      {mojones.length < 3 ? (
        <p className="text-[11px] text-ink-700/60 bg-bone-50 border border-bone-200 rounded-xl p-3 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-sun-500" />
          Marcá los mojones del predio para analizar su cobertura vegetal.
        </p>
      ) : (
        <button
          onClick={analizar}
          disabled={cargando}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-moss-700 text-bone-50 rounded-xl px-3 py-2.5 hover:bg-moss-800 disabled:opacity-60 transition-colors">
          {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trees className="w-4 h-4" />}
          {cargando ? 'Analizando cobertura…' : datos ? 'Volver a analizar' : 'Analizar cobertura del predio'}
        </button>
      )}

      {error && (
        <p className="text-[11px] text-clay-700 bg-clay-100 border border-clay-200 rounded-xl p-3 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0" />{error}
        </p>
      )}

      {datos && (
        <>
          {/* Barra apilada de composición */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2.5">
            <div className="flex h-4 rounded-full overflow-hidden border border-bone-200">
              {datos.items.map((it, i) => (
                <div key={i} style={{ width: `${it.pct}%`, background: it.clase.color }} title={`${it.clase.nombre} ${it.pct}%`} />
              ))}
            </div>
            <div className="space-y-1">
              {datos.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="w-3 h-3 rounded-sm shrink-0 border border-black/10" style={{ background: it.clase.color }} />
                  <span className="flex-1 text-ink-700/80">{it.clase.nombre}</span>
                  <span className="font-mono font-semibold text-ink-900">{it.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas derivadas */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Vegetación" value={`${datos.veg_pct}%`} color="moss" />
            <Stat label="Arbolado" value={`${datos.arbolado_pct}%`} />
            <Stat label="Suelo desnudo" value={`${datos.suelo_pct}%`} />
          </div>

          {datos.forraje_sugerido !== null && (
            <div className="bg-moss-50 border border-moss-200 rounded-xl p-3 flex items-start gap-2">
              <Sprout className="w-4 h-4 shrink-0 text-moss-600 mt-0.5" />
              <p className="text-[11px] text-moss-700 leading-relaxed">
                Forraje orientativo por composición: <span className="font-semibold">{datos.forraje_sugerido.toLocaleString('es-AR')} kg MS/ha·año</span>. Usalo en Pastoreo como referencia junto al valor por lluvia.
              </p>
            </div>
          )}

          {/* Interpretación */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
            {datos.interpretacion.map((t, i) => (
              <p key={i} className="text-[11px] text-ink-700/80 flex gap-1.5"><span className="shrink-0 mt-0.5 text-moss-600">→</span>{t}</p>
            ))}
            <p className="text-[11px] text-ink-700/70 flex gap-1.5 pt-1 border-t border-bone-100 mt-1.5"><span className="shrink-0 mt-0.5">💧</span>{datos.cn_hint}</p>
          </div>

          <p className="text-[9px] text-ink-700/45 italic leading-relaxed">{datos.fuente}</p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: 'moss' }) {
  const cls = color === 'moss' ? 'bg-moss-700 border-moss-700 text-bone-50' : 'bg-white border-bone-200 text-ink-900';
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
    </div>
  );
}
