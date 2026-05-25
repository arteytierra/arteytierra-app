'use client';

import { useMemo } from 'react';
import { Waves, Mountain, MapPin } from 'lucide-react';
import { calcularAguadas, type DatosAguadas } from '@/lib/aguadas';
import type { DatosTopografia } from '@/lib/topografia';
import type { DatosClima } from '@/lib/clima';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:         Mojon[];
  datosTopografia: DatosTopografia | null;
  datosClima:      DatosClima | null;
  onIrATopo:       () => void;
}

export function AguadasPanel({ mojones, datosTopografia, datosClima, onIrATopo }: Props) {
  const datos: DatosAguadas | null = useMemo(() => {
    if (!datosTopografia) return null;
    return calcularAguadas(mojones, datosTopografia, datosClima?.precip_anual_mm);
  }, [mojones, datosTopografia, datosClima]);

  if (!datosTopografia) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Mountain className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Para el diseño de aguadas necesitás cargar los datos topográficos del terreno.
        </p>
        <button
          onClick={onIrATopo}
          className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
        >
          <Mountain className="w-3.5 h-3.5" />
          Ir a Topografía
        </button>
      </div>
    );
  }

  if (!datos) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Diseño de aguadas
      </p>

      {/* ── Escurrimiento principal ──────────────────────────────────────────── */}
      <div className="bg-water-500/10 rounded-xl border border-water-500/30 p-3 space-y-2">
        <p className="text-xs font-medium text-water-700 flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5" />
          Escurrimiento principal
        </p>
        {datos.lineas_escurrimiento.slice(0, 1).map((l, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[9px] text-ink-700/50">Desnivel</p>
              <p className="font-mono text-xs font-bold text-ink-900">{l.desnivel_m} m</p>
            </div>
            <div>
              <p className="text-[9px] text-ink-700/50">Longitud</p>
              <p className="font-mono text-xs font-bold text-ink-900">{l.longitud_m} m</p>
            </div>
            <div>
              <p className="text-[9px] text-ink-700/50">Pendiente</p>
              <p className="font-mono text-xs font-bold text-ink-900">{l.pendiente_pct}%</p>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-water-700/70">
          Fluye desde{' '}
          <span className="font-semibold">{datosTopografia.escurrimiento.desde.etiqueta ?? 'punto alto'}</span>
          {' '}({datosTopografia.escurrimiento.desde.elevation.toFixed(0)} m) →{' '}
          <span className="font-semibold">{datosTopografia.escurrimiento.hacia.etiqueta ?? 'punto bajo'}</span>
          {' '}({datosTopografia.escurrimiento.hacia.elevation.toFixed(0)} m)
        </p>
      </div>

      {/* ── Caudal estimado ──────────────────────────────────────────────────── */}
      {datos.caudal_estimado && (
        <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
          <p className="text-xs font-medium text-ink-700">Caudal de escurrimiento estimado</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[9px] text-ink-700/50">Precipitación</p>
              <p className="font-mono text-xs font-bold text-ink-900">{datos.caudal_estimado.precip_mm} mm/año</p>
            </div>
            <div>
              <p className="text-[9px] text-ink-700/50">Área</p>
              <p className="font-mono text-xs font-bold text-ink-900">{datos.caudal_estimado.area_ha} ha</p>
            </div>
            <div>
              <p className="text-[9px] text-ink-700/50">Vol. anual (C=0.25)</p>
              <p className="font-mono text-xs font-bold text-ink-900">{datos.caudal_estimado.volumen_m3_anual.toLocaleString('es-AR')} m³</p>
            </div>
          </div>
          <p className="text-[9px] text-ink-700/50">
            Coeficiente de escorrentía 0.25 para suelo natural con pastizal. Ajustar según cobertura.
          </p>
        </div>
      )}

      {/* ── Sitios sugeridos ─────────────────────────────────────────────────── */}
      {datos.puntos_aguada.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-700">Sitios sugeridos para cosecha de agua</p>
          {datos.puntos_aguada.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-bone-200 p-3 space-y-1">
              <div className="flex items-start gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  p.tipo === 'represa' ? 'bg-blue-100 text-blue-700' :
                  p.tipo === 'zanja'   ? 'bg-moss-100 text-moss-700' :
                                         'bg-sun-200 text-clay-700'
                }`}>
                  {p.tipo === 'represa' ? '🏊 Represa' : p.tipo === 'zanja' ? '⛏️ Zanjas' : '〰️ Keyline'}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-ink-700">{p.descripcion}</p>
                  <p className="text-[9px] text-ink-700/50 font-mono mt-0.5">
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)} · {p.elevation.toFixed(0)} m s.n.m.
                  </p>
                </div>
              </div>
              {p.volumen_est_m3 && p.volumen_est_m3 > 0 && (
                <p className="text-[10px] text-water-700">
                  Volumen estimado con represa de 1.5m de profundidad:{' '}
                  <span className="font-semibold">{p.volumen_est_m3.toLocaleString('es-AR')} m³</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Keyline ──────────────────────────────────────────────────────────── */}
      {datos.keyline && datos.keyline.length >= 2 && (
        <div className="bg-moss-50 rounded-xl border border-moss-200 p-3 space-y-1">
          <p className="text-xs font-medium text-moss-900">〰️ Keyline</p>
          <p className="text-[10px] text-moss-700 leading-relaxed">
            Línea de contorno aproximada al 25% de la elevación del predio —
            referencia para trazar zanjas de infiltración paralelas al keyline.
            {datos.keyline.length} puntos identificados.
          </p>
        </div>
      )}

      {/* ── Recomendaciones ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
        <p className="text-xs font-medium text-ink-700">Recomendaciones</p>
        {datos.recomendaciones.map((r, i) => (
          <p key={i} className="text-xs text-ink-700/80 flex gap-1.5">
            <span className="shrink-0 text-water-500 mt-0.5">→</span>{r}
          </p>
        ))}
      </div>

      <p className="text-[9px] text-ink-700/40 italic">
        Análisis basado en SRTM 30m. Precisión orientativa.
        Para obras de infraestructura hídrica, contratar relevamiento topográfico profesional.
      </p>
    </div>
  );
}
