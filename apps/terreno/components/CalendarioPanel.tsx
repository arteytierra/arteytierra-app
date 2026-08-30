'use client';

import { useMemo, useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';
import {
  calcularCalendario,
  calcularGDD,
  calcularBalanceCultivo,
  FAMILIAS,
  CULTIVOS_KC,
  type AptitudMes,
} from '@/lib/calendario';
import type { DatosClima } from '@/lib/clima';
import { MESES } from '@/lib/clima';

/** Lo que el usuario ajusta acá; se guarda para no perderlo al cambiar de pestaña. */
export interface CalendarioInputs { gdBase: number; cultivoId: string }

interface Props {
  datosClima:  DatosClima | null;
  onIrAClima:  () => void;
  inicial?:    CalendarioInputs | null;
  onInputs?:   (i: CalendarioInputs) => void;
}

export function CalendarioPanel({ datosClima, onIrAClima, inicial, onInputs }: Props) {
  const [gdBase,    setGdBase]    = useState(inicial?.gdBase ?? 10);
  const [cultivoId, setCultivoId] = useState(inicial?.cultivoId ?? 'huerta');
  useEffect(() => { onInputs?.({ gdBase, cultivoId }); }, [gdBase, cultivoId, onInputs]);

  const cal = useMemo(
    () => datosClima ? calcularCalendario(datosClima) : null,
    [datosClima],
  );
  const gdd = useMemo(
    () => datosClima ? calcularGDD(datosClima.meses, gdBase) : null,
    [datosClima, gdBase],
  );
  const balanceCultivo = useMemo(() => {
    if (!datosClima) return null;
    const cultivo = CULTIVOS_KC.find(c => c.id === cultivoId) ?? CULTIVOS_KC[0]!;
    return calcularBalanceCultivo(datosClima.meses, cultivo.kc);
  }, [datosClima, cultivoId]);

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

      {/* ── Grados-día de crecimiento (GDD) ─────────────────────────────────── */}
      {gdd && (() => {
        const maxGdd = Math.max(...gdd.map(m => m.gdd), 1);
        const gddAnual = gdd[gdd.length - 1]?.acumulado ?? 0;
        return (
          <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-bone-200 flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs font-medium text-ink-700">Grados-día de crecimiento</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-ink-700/50">Base:</span>
                {[5, 7, 10, 15].map(b => (
                  <button
                    key={b}
                    onClick={() => setGdBase(b)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
                      gdBase === b ? 'bg-moss-700 text-bone-50' : 'bg-bone-100 text-ink-700 hover:bg-bone-200'
                    }`}
                  >{b}°C</button>
                ))}
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-[10px] text-ink-700/60 mb-2">
                GDD anual: <span className="font-bold text-moss-700 font-mono">{gddAnual.toLocaleString('es-AR')}</span> °C·día
              </p>
              <div className="flex items-end gap-0.5 h-16">
                {gdd.map(m => (
                  <div key={m.index} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-t-sm bg-moss-400/80"
                      style={{ height: `${Math.round((m.gdd / maxGdd) * 52)}px` }}
                      title={`${m.nombre}: ${m.gdd} GDD`}
                    />
                    <span className="text-[7px] text-ink-700/40 font-medium">{m.nombre[0]}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-1.5 text-[9px] text-ink-700/50 flex-wrap">
                {gdd.map(m => m.gdd > 0 && (
                  <span key={m.index} className="font-mono">{m.nombre}: {m.gdd}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Balance hídrico por cultivo ──────────────────────────────────────── */}
      {balanceCultivo && (() => {
        const cultivo = CULTIVOS_KC.find(c => c.id === cultivoId) ?? CULTIVOS_KC[0]!;
        const mesesDeficit = balanceCultivo.filter(m => m.balance < 0).length;
        return (
          <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-bone-200 flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs font-medium text-ink-700">Balance hídrico por cultivo</p>
              <select
                value={cultivoId}
                onChange={e => setCultivoId(e.target.value)}
                className="text-[10px] border border-bone-200 rounded px-1.5 py-0.5 bg-white text-ink-700 focus:outline-none focus:ring-1 focus:ring-moss-500"
              >
                {CULTIVOS_KC.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} (Kc {c.kc})</option>
                ))}
              </select>
            </div>
            <div className="px-3 py-2 space-y-2">
              <p className="text-[10px] text-ink-700/60">
                ETc = ETP × Kc {cultivo.kc} —{' '}
                <span className={mesesDeficit >= 6 ? 'text-clay-600 font-semibold' : mesesDeficit >= 3 ? 'text-sun-600 font-semibold' : 'text-moss-700 font-semibold'}>
                  {mesesDeficit === 0 ? 'Sin déficit hídrico' : `${mesesDeficit} mes${mesesDeficit > 1 ? 'es' : ''} con déficit`}
                </span>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[9px] min-w-[320px]">
                  <thead>
                    <tr className="bg-bone-50 border-b border-bone-200">
                      <th className="text-left px-2 py-1 text-ink-700/50 font-medium">Mes</th>
                      <th className="text-right px-2 py-1 text-water-500 font-medium">Lluvia</th>
                      <th className="text-right px-2 py-1 text-moss-600 font-medium">ETc</th>
                      <th className="text-right px-2 py-1 text-ink-700/50 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceCultivo.map((m, i) => (
                      <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/40'}`}>
                        <td className="px-2 py-1 font-medium text-ink-700">{m.nombre}</td>
                        <td className="px-2 py-1 text-right font-mono text-water-500">{m.precip_mm} mm</td>
                        <td className="px-2 py-1 text-right font-mono text-moss-600">{m.etc_mm} mm</td>
                        <td className={`px-2 py-1 text-right font-mono font-semibold ${m.balance >= 0 ? 'text-moss-700' : 'text-clay-600'}`}>
                          {m.balance > 0 ? '+' : ''}{m.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[8px] text-ink-700/40 italic">
                Kc promedio FAO-56 simplificado. No reemplaza diseño agronómico específico.
              </p>
            </div>
          </div>
        );
      })()}

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
