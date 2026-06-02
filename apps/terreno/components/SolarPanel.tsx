'use client';

import { useMemo } from 'react';
import { Sun, MapPin, Map } from 'lucide-react';
import { calcularSolar, type DatosSolar } from '@/lib/solar';
import { centroide } from '@/lib/clima';
import { MESES } from '@/lib/clima';
import type { Mojon } from '@/lib/types';
import type { DatosClima } from '@/lib/clima';

interface Props {
  mojones:           Mojon[];
  datosClima:        DatosClima | null;
  arcSolarVisible?:  boolean;
  onMostrarEnMapa?:  () => void;
}

export function SolarPanel({ mojones, datosClima, arcSolarVisible, onMostrarEnMapa }: Props) {
  const centro = mojones.length > 0 ? centroide(mojones) : null;

  const solar: DatosSolar | null = useMemo(() => {
    if (!centro) return null;
    return calcularSolar(centro.lat, centro.lng, datosClima ?? undefined);
  }, [centro, datosClima]);

  if (!centro) {
    return (
      <div className="text-center py-8 px-4 space-y-2">
        <MapPin className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60">
          Agregá mojones al terreno para calcular el recurso solar.
        </p>
      </div>
    );
  }

  if (!solar) return null;

  const { interpretacion: interp } = solar;
  const colorCls = {
    verde:    'bg-moss-50 border-moss-200 text-moss-700',
    amarillo: 'bg-sun-300/20 border-sun-300 text-clay-700',
    rojo:     'bg-clay-100 border-clay-200 text-clay-700',
  }[interp.color];

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Análisis solar
      </p>

      {/* ── Potencial y recomendaciones de diseño ──────────────────────────── */}
      <div className={`rounded-xl border p-3 space-y-1 ${colorCls}`}>
        <p className="text-xs font-bold flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5" />
          Potencial solar: {interp.potencial}
        </p>
        <p className="text-[10px] leading-relaxed opacity-90">{interp.descripcion}</p>
      </div>

      {/* ── Parámetros clave ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl border border-bone-200 p-2.5">
          <p className="text-[10px] text-ink-700/60 mb-0.5">Ángulo óptimo de panel</p>
          <p className="font-mono text-base font-bold text-ink-900">{solar.angulo_optimo_panel}°</p>
          <p className="text-[9px] text-ink-700/50">desde la horizontal</p>
        </div>
        <div className="bg-white rounded-xl border border-bone-200 p-2.5">
          <p className="text-[10px] text-ink-700/60 mb-0.5">Orientación óptima</p>
          <p className="font-mono text-base font-bold text-ink-900">{solar.orientacion_optima}</p>
          <p className="text-[9px] text-ink-700/50">paneles, ventanas, invernáculos</p>
        </div>
        <div className="bg-white rounded-xl border border-bone-200 p-2.5">
          <p className="text-[10px] text-ink-700/60 mb-0.5">Horas de luz máx.</p>
          <p className="font-mono text-base font-bold text-ink-900">{solar.horas_luz_max} h</p>
          <p className="text-[9px] text-ink-700/50">{MESES[solar.mes_max_radiacion]} (solsticio de verano)</p>
        </div>
        <div className="bg-white rounded-xl border border-bone-200 p-2.5">
          <p className="text-[10px] text-ink-700/60 mb-0.5">Horas de luz mín.</p>
          <p className="font-mono text-base font-bold text-ink-900">{solar.horas_luz_min} h</p>
          <p className="text-[9px] text-ink-700/50">{MESES[solar.mes_min_radiacion]} (solsticio de invierno)</p>
        </div>
      </div>

      {/* ── Gráfico de horas de luz ──────────────────────────────────────────── */}
      <GraficoSolar meses={solar.meses} />

      {/* ── Tabla mensual ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200">
          <p className="text-xs font-medium text-ink-700">Datos solares mensuales</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[360px]">
            <thead>
              <tr className="bg-bone-50 border-b border-bone-200">
                <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Mes</th>
                <th className="text-right px-2 py-1.5 text-sun-600 font-medium">Hs luz</th>
                <th className="text-right px-2 py-1.5 text-sun-600 font-medium">Ra (MJ)</th>
                <th className="text-right px-2 py-1.5 text-ink-700/60 font-medium">El. mediodia</th>
                <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">Amanecer</th>
              </tr>
            </thead>
            <tbody>
              {solar.meses.map((m, i) => (
                <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                  <td className="px-3 py-1.5 font-medium text-ink-700">
                    {m.mes}
                    <span className="text-[9px] text-ink-700/40 ml-1">({m.estacion.slice(0, 3)})</span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-sun-600">{m.horas_luz}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-sun-600">{m.radiacion_mj}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-ink-700/70">{m.elev_solar_noon}°</td>
                  <td className="px-3 py-1.5 text-right font-mono text-ink-700/50">
                    {m.amanecer_hh} – {m.atardecer_hh}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Usos recomendados ─────────────────────────────────────────────────── */}
      <div className="bg-sun-300/10 rounded-xl border border-sun-300/40 p-3 space-y-1.5">
        <p className="text-xs font-medium text-clay-700">
          <Sun className="w-3 h-3 inline mr-1" />
          Usos óptimos del recurso solar
        </p>
        {interp.usos_optimos.map((u, i) => (
          <p key={i} className="text-xs text-ink-700 flex gap-1.5">
            <span className="shrink-0 text-sun-600">→</span>{u}
          </p>
        ))}
      </div>

      {/* ── Arco solar en mapa ──────────────────────────────────────────────── */}
      <div className="bg-sun-300/10 rounded-xl border border-sun-300/40 p-3 space-y-2">
        <p className="text-xs font-medium text-clay-700 flex items-center gap-1.5">
          <Map className="w-3.5 h-3.5" />
          Arco solar en el mapa
        </p>
        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          Trayectoria del sol para solsticios y equinoccios, proyectada sobre el terreno.
          Mostrá cuándo y dónde entra luz a cada punto del predio en distintas épocas del año.
        </p>
        {/* Leyenda de colores */}
        <div className="flex flex-col gap-1">
          {[
            { color: '#FF5722', label: 'Solsticio de verano (21 dic)' },
            { color: '#43A047', label: 'Equinoccios (21 mar / 23 sep)' },
            { color: '#1E88E5', label: 'Solsticio de invierno (21 jun)' },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center gap-2">
              <span className="w-6 h-0 border-t-2 shrink-0" style={{ borderColor: color }} />
              <span className="text-[10px] text-ink-700/80">{label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onMostrarEnMapa}
          disabled={!onMostrarEnMapa}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            arcSolarVisible
              ? 'bg-sun-500 text-ink-950 hover:bg-sun-400'
              : 'bg-ink-950 hover:bg-ink-700 text-bone-50'
          } disabled:opacity-40`}
        >
          <Map className="w-3.5 h-3.5" />
          {arcSolarVisible ? 'Visible en el mapa ✓' : 'Ver en el mapa'}
        </button>
      </div>

      <p className="text-[9px] text-ink-700/40 italic">
        Cálculo astronómico puro basado en latitud ({centro.lat.toFixed(3)}°).
        Radiación extraterrestre — no incluye nubosidad local.
      </p>
    </div>
  );
}

// ─── Gráfico horas de luz ─────────────────────────────────────────────────────

function GraficoSolar({ meses }: { meses: DatosSolar['meses'] }) {
  const maxHl = Math.max(...meses.map(m => m.horas_luz));
  const HEIGHT = 60;

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200">
        <p className="text-xs font-medium text-ink-700">Horas de luz diaria por mes</p>
      </div>
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-end gap-0.5" style={{ height: HEIGHT }}>
          {meses.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end" title={`${m.mes}: ${m.horas_luz} h`}>
              <div
                className="bg-sun-400 rounded-t-sm opacity-80 relative"
                style={{ height: (m.horas_luz / maxHl) * HEIGHT, minHeight: 2 }}
              />
            </div>
          ))}
        </div>
        <div className="flex mt-1">
          {MESES.map((m, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-ink-700/50">{m.slice(0, 1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
