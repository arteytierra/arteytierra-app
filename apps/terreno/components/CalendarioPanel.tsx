'use client';

import { useMemo } from 'react';
import { Cloud } from 'lucide-react';
import {
  calcularCalendario,
  FAMILIAS,
  type AptitudMes,
} from '@/lib/calendario';
import type { DatosClima } from '@/lib/clima';
import { MESES } from '@/lib/clima';

interface Props {
  datosClima:  DatosClima | null;
  onIrAClima:  () => void;
}

export function CalendarioPanel({ datosClima, onIrAClima }: Props) {
  const cal = useMemo(
    () => datosClima ? calcularCalendario(datosClima) : null,
    [datosClima],
  );

  if (!datosClima || !cal) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Cloud className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Necesitás cargar los datos climáticos para ver el calendario.
        </p>
        <button
          onClick={onIrAClima}
          className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
        >
          <Cloud className="w-3.5 h-3.5" />
          Ir a Clima
        </button>
      </div>
    );
  }

  const plh = cal.periodo_libre_heladas;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Calendario agroclimático
      </p>

      {/* ── Resumen del año ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <StatChip
          label="Sin heladas"
          value={plh ? `${plh.duracion} meses` : '—'}
          sub={plh ? `${MESES[plh.inicio]} → ${MESES[plh.fin]}` : 'heladas todo el año'}
          color={plh && plh.duracion >= 8 ? 'verde' : plh ? 'amarillo' : 'rojo'}
        />
        <StatChip
          label="Meses secos"
          value={`${cal.meses_secos_count}`}
          sub={`${12 - cal.meses_secos_count} meses con superávit`}
          color={cal.meses_secos_count <= 3 ? 'verde' : cal.meses_secos_count <= 6 ? 'amarillo' : 'rojo'}
        />
        <StatChip
          label="Mes más cálido"
          value={MESES[cal.mes_mas_calido] ?? '—'}
          sub={`${datosClima.meses[cal.mes_mas_calido]?.tmean_c}°C media`}
          color="neutro"
        />
        <StatChip
          label="Mes más frío"
          value={MESES[cal.mes_mas_frio] ?? '—'}
          sub={`${datosClima.meses[cal.mes_mas_frio]?.tmean_c}°C media`}
          color="neutro"
        />
      </div>

      {/* ── Timeline mensual ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200">
          <p className="text-xs font-medium text-ink-700">Condiciones mensuales</p>
        </div>
        <div className="p-2 overflow-x-auto">
          <div className="flex gap-0.5 min-w-[280px]">
            {cal.meses.map(m => (
              <div key={m.index} className="flex-1 space-y-0.5">
                {/* Nombre */}
                <p className="text-[9px] text-center text-ink-700/50 font-medium">{m.nombre}</p>

                {/* Barra de temperatura */}
                <div
                  title={`T: ${m.tmin}–${m.tmax}°C (media ${m.tmean}°C)`}
                  className={`h-6 rounded-sm flex items-center justify-center text-[8px] font-bold
                    ${m.helada     ? 'bg-blue-200 text-blue-800'
                    : m.helada_p  ? 'bg-blue-100 text-blue-700'
                    : m.tmean > 25 ? 'bg-orange-200 text-orange-800'
                    : 'bg-moss-100 text-moss-700'}`}
                >
                  {m.tmean}°
                </div>

                {/* Barra de lluvia */}
                <div
                  title={`Precip: ${m.precip}mm | Balance: ${m.balance}mm`}
                  className={`h-4 rounded-sm flex items-center justify-center text-[7px] font-medium
                    ${m.lluvioso  ? 'bg-water-500/30 text-water-700'
                    : m.seco      ? 'bg-clay-200/60 text-clay-700'
                    : 'bg-bone-200 text-ink-700/40'}`}
                >
                  {m.precip}
                </div>

                {/* Ícono helada */}
                {m.helada && (
                  <p className="text-center text-[8px]">❄</p>
                )}
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-2 mt-2 px-1">
            {[
              { cls: 'bg-blue-200',       label: 'Helada' },
              { cls: 'bg-orange-200',     label: 'Calor' },
              { cls: 'bg-moss-100',       label: 'Óptimo' },
              { cls: 'bg-water-500/30',   label: 'Lluv.' },
              { cls: 'bg-clay-200/60',    label: 'Seco' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1 text-[9px] text-ink-700/60">
                <span className={`w-2.5 h-2.5 rounded-sm ${l.cls} inline-block`} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calendario de cultivos ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200 flex items-center justify-between">
          <p className="text-xs font-medium text-ink-700">Ventanas de siembra</p>
          <div className="flex items-center gap-2 text-[9px] text-ink-700/60">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-moss-400 inline-block" />Óptimo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-sun-400 inline-block" />Posible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-bone-300 inline-block" />No apto
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full text-[9px]">
            <thead>
              <tr className="bg-bone-50 border-b border-bone-200">
                <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium w-28">Familia</th>
                {MESES.map(m => (
                  <th key={m} className="text-center px-0.5 py-1.5 text-ink-700/50 font-medium w-7">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FAMILIAS.map((f, fi) => (
                <tr key={f.id} className={`border-t border-bone-200/50 ${fi % 2 === 0 ? '' : 'bg-bone-50/40'}`}>
                  <td className="px-3 py-1 text-ink-700 font-medium whitespace-nowrap" title={f.ejemplos}>
                    {f.nombre}
                  </td>
                  {cal.meses.map(m => {
                    const apt = m.aptitud[f.id] as AptitudMes;
                    return (
                      <td key={m.index} className="px-0.5 py-1 text-center">
                        <div
                          title={`${f.nombre} en ${m.nombre}: ${apt === 'optimo' ? 'Óptimo' : apt === 'posible' ? 'Posible' : 'No apto'}`}
                          className={`w-5 h-5 mx-auto rounded-sm ${
                            apt === 'optimo'  ? 'bg-moss-400'
                            : apt === 'posible' ? 'bg-sun-400'
                            : 'bg-bone-200'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ejemplos de cada familia */}
        <div className="px-3 py-2 border-t border-bone-200 space-y-1">
          {FAMILIAS.map(f => (
            <p key={f.id} className="text-[9px] text-ink-700/50">
              <span className="font-medium text-ink-700/70">{f.nombre}:</span>{' '}
              {f.ejemplos}
            </p>
          ))}
        </div>
      </div>

      {/* ── Temperaturas mensuales ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200">
          <p className="text-xs font-medium text-ink-700">Detalle mensual</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[360px]">
            <thead>
              <tr className="bg-bone-50 border-b border-bone-200">
                <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Mes</th>
                <th className="text-right px-2 py-1.5 text-blue-600 font-medium">Tmin</th>
                <th className="text-right px-2 py-1.5 text-ink-700/60 font-medium">Tmed</th>
                <th className="text-right px-2 py-1.5 text-orange-500 font-medium">Tmax</th>
                <th className="text-right px-2 py-1.5 text-water-500 font-medium">Precip</th>
                <th className="text-right px-3 py-1.5 text-ink-700/50 font-medium">Bal.</th>
              </tr>
            </thead>
            <tbody>
              {cal.meses.map((m, i) => (
                <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                  <td className="px-3 py-1.5 font-medium text-ink-700 flex items-center gap-1">
                    {m.nombre}
                    {m.helada && <span className="text-blue-500 text-[10px]">❄</span>}
                  </td>
                  <td className={`px-2 py-1.5 text-right font-mono ${m.tmin <= 0 ? 'text-blue-600 font-bold' : 'text-blue-500'}`}>{m.tmin}°</td>
                  <td className="px-2 py-1.5 text-right font-mono text-ink-700">{m.tmean}°</td>
                  <td className={`px-2 py-1.5 text-right font-mono ${m.tmax >= 35 ? 'text-orange-600 font-bold' : 'text-orange-500'}`}>{m.tmax}°</td>
                  <td className="px-2 py-1.5 text-right font-mono text-water-500">{m.precip} mm</td>
                  <td className={`px-3 py-1.5 text-right font-mono font-semibold ${m.balance >= 0 ? 'text-moss-700' : 'text-clay-700'}`}>
                    {m.balance > 0 ? '+' : ''}{m.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 pb-2 text-[9px] text-ink-700/40 italic">
          Fuente: {datosClima.fuente}. Temperaturas promedio históricas — orientativas.
        </p>
      </div>
    </div>
  );
}

// ─── StatChip ─────────────────────────────────────────────────────────────────

function StatChip({
  label, value, sub, color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'verde' | 'amarillo' | 'rojo' | 'neutro';
}) {
  const cls = {
    verde:    'bg-moss-50 border-moss-200',
    amarillo: 'bg-sun-300/20 border-sun-300',
    rojo:     'bg-clay-100 border-clay-200',
    neutro:   'bg-white border-bone-200',
  }[color];
  const txt = {
    verde: 'text-moss-700', amarillo: 'text-clay-700',
    rojo: 'text-clay-700', neutro: 'text-ink-900',
  }[color];

  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] text-ink-700/60 mb-0.5">{label}</p>
      <p className={`font-mono text-sm font-bold ${txt}`}>{value}</p>
      <p className="text-[9px] text-ink-700/50 mt-0.5">{sub}</p>
    </div>
  );
}
