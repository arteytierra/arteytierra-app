'use client';

import { useState, useMemo } from 'react';
import { Cloud, Wheat } from 'lucide-react';
import {
  CULTIVOS_KC, calcularBalanceProductivo,
  TIPOS_ANIMAL, calcularReceptividad,
} from '@/lib/produccion';
import type { DatosClima } from '@/lib/clima';
import { MESES } from '@/lib/clima';
import type { Mojon } from '@/lib/types';
import { animalDe, cambiarAnimal, aguaHacienda_l_dia, demandaMensual_m3, type Rodeo } from '@/lib/rodeo';

interface Props {
  datosClima:  DatosClima | null;
  mojones:     Mojon[];
  areaHa:      number;
  onIrAClima:  () => void;
  /** Rodeo compartido con Represa: lo que se cambia acá se ve allá, y al revés. */
  rodeo:       Rodeo;
  onRodeo:     (r: Rodeo) => void;
}

export function ProduccionPanel({ datosClima, areaHa, onIrAClima, rodeo, onRodeo }: Props) {
  const [tab,       setTab]       = useState<'balance' | 'ganaderia'>('balance');
  const [cultivoId, setCultivoId] = useState('huerta');
  const [areaCult,  setAreaCult]  = useState(areaHa > 0 ? Math.round(areaHa * 10) / 10 : 1);

  const cultivo  = CULTIVOS_KC.find(c => c.id === cultivoId) ?? CULTIVOS_KC[0]!;
  const animal   = animalDe(rodeo);

  const balance = useMemo(
    () => datosClima ? calcularBalanceProductivo(datosClima.meses, cultivo, areaCult) : null,
    [datosClima, cultivo, areaCult],
  );

  const ganaderia = useMemo(
    () => datosClima ? calcularReceptividad(areaHa || areaCult, datosClima.precip_anual_mm, animal) : null,
    [datosClima, areaHa, areaCult, animal],
  );

  if (!datosClima) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Wheat className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Necesitás cargar los datos climáticos para el módulo de producción.
        </p>
        <button onClick={onIrAClima} className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors">
          <Cloud className="w-3.5 h-3.5" />Ir a Clima
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Producción agropecuaria</p>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 bg-bone-100 p-1 rounded-lg text-[10px]">
        {([['balance', 'Balance hídrico'], ['ganaderia', 'Ganadería']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1 rounded font-semibold transition-colors ${tab === id ? 'bg-white text-moss-700 shadow-sm' : 'text-ink-700/60 hover:text-ink-700'}`}
          >{label}</button>
        ))}
      </div>

      {/* ── 7.1 Balance hídrico productivo ── */}
      {tab === 'balance' && balance && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <select
              value={cultivoId}
              onChange={e => setCultivoId(e.target.value)}
              className="flex-1 min-w-0 text-[10px] border border-bone-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
            >
              {CULTIVOS_KC.map(c => <option key={c.id} value={c.id}>{c.nombre} (Kc {c.kc})</option>)}
            </select>
            <div className="flex items-center gap-1 border border-bone-200 rounded px-2 py-1">
              <span className="text-[9px] text-ink-700/60">Área:</span>
              <input
                type="number" min="0.1" step="0.1"
                value={areaCult}
                onChange={e => setAreaCult(parseFloat(e.target.value) || 1)}
                className="w-16 text-[10px] text-right focus:outline-none"
              />
              <span className="text-[9px] text-ink-700/60">ha</span>
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-2 gap-2">
            <Chip label="Déficit anual" value={`${balance.deficit_anual_mm} mm`} sub={`${balance.meses_deficit} meses con déficit`} color={balance.meses_deficit <= 3 ? 'verde' : balance.meses_deficit <= 6 ? 'amarillo' : 'rojo'} />
            <Chip label="Reservorio necesario" value={`${balance.reservorio_m3} m³`} sub={`para ${areaCult} ha de ${cultivo.nombre}`} color={balance.reservorio_m3 > 0 ? 'amarillo' : 'verde'} />
          </div>

          {/* Gráfico de barras mensual */}
          <div className="bg-white rounded-xl border border-bone-200 p-3">
            <p className="text-[10px] font-medium text-ink-700 mb-2">Lluvia vs ETc mensual</p>
            <div className="flex items-end gap-0.5 h-20">
              {balance.meses.map((m, i) => {
                const maxVal = Math.max(...balance.meses.map(x => Math.max(x.precip_mm, x.etc_mm)), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${MESES[i]}: Lluvia ${m.precip_mm}mm ETc ${m.etc_mm}mm`}>
                    <div className="w-full flex gap-px items-end" style={{ height: 60 }}>
                      <div className="flex-1 bg-water-400/60 rounded-t-sm" style={{ height: `${Math.round(m.precip_mm / maxVal * 56)}px` }} />
                      <div className={`flex-1 rounded-t-sm ${m.deficit_mm > 0 ? 'bg-clay-400/80' : 'bg-moss-400/60'}`} style={{ height: `${Math.round(m.etc_mm / maxVal * 56)}px` }} />
                    </div>
                    <span className="text-[7px] text-ink-700/40">{MESES[i]?.[0]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-1 text-[9px] text-ink-700/60">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-water-400/60 rounded-sm inline-block"/>Lluvia</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-moss-400/60 rounded-sm inline-block"/>ETc (sin déficit)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-clay-400/80 rounded-sm inline-block"/>ETc (déficit)</span>
            </div>
          </div>

          {/* Tabla mensual */}
          <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[9px] min-w-[300px]">
                <thead>
                  <tr className="bg-bone-50 border-b border-bone-200">
                    <th className="text-left px-2 py-1.5 text-ink-700/50 font-medium">Mes</th>
                    <th className="text-right px-2 py-1.5 text-water-500 font-medium">Lluvia</th>
                    <th className="text-right px-2 py-1.5 text-moss-600 font-medium">ETc</th>
                    <th className="text-right px-2 py-1.5 text-clay-600 font-medium">Déficit</th>
                    <th className="text-right px-2 py-1.5 text-ink-700/40 font-medium">Vol. m³</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.meses.map((m, i) => (
                    <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/40'}`}>
                      <td className="px-2 py-1 font-medium text-ink-700">{m.mes}</td>
                      <td className="px-2 py-1 text-right font-mono text-water-500">{m.precip_mm}</td>
                      <td className="px-2 py-1 text-right font-mono text-moss-600">{m.etc_mm}</td>
                      <td className={`px-2 py-1 text-right font-mono font-semibold ${m.deficit_mm > 0 ? 'text-clay-600' : 'text-ink-700/30'}`}>{m.deficit_mm > 0 ? m.deficit_mm : '—'}</td>
                      <td className={`px-2 py-1 text-right font-mono ${m.volumen_deficit_m3 > 0 ? 'text-clay-600' : 'text-ink-700/30'}`}>{m.volumen_deficit_m3 > 0 ? m.volumen_deficit_m3 : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-3 py-1.5 text-[8px] text-ink-700/40 italic">ETc = ETP × Kc {cultivo.kc} (FAO-56 simplificado). Valores promedio históricos NASA POWER.</p>
          </div>
        </div>
      )}

      {/* ── 7.3 Receptividad ganadera ── */}
      {tab === 'ganaderia' && ganaderia && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={rodeo.animalId}
              onChange={e => onRodeo(cambiarAnimal(rodeo, e.target.value))}
              className="flex-1 text-[10px] border border-bone-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
            >
              {TIPOS_ANIMAL.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.ev} EV)</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Chip label="Prod. forrajera" value={`${ganaderia.ef_kg_ha.toLocaleString('es-AR')} kg/ha`} sub="kg MS/ha/año estimado" color="neutro" />
            <Chip label="Aguanta el pasto" value={`${ganaderia.carga_animales} animales`} sub={`${ganaderia.carga_ev} EV — receptividad estimada`} color={ganaderia.carga_ev > 0 ? 'verde' : 'rojo'} />
            <Chip label="Rodeo del predio" value={`${rodeo.cabezas} animales`} sub={rodeo.origen === 'receptividad' ? 'tomado de la receptividad' : 'cargado a mano'} color="neutro" />
            <Chip label="Agua necesaria" value={`${aguaHacienda_l_dia(rodeo).toLocaleString('es-AR')} L/día`} sub={`${rodeo.litros_animal_dia} L por cabeza y día`} color="neutro" />
          </div>

          {/* El rodeo es uno solo para toda la app: acá se declara y Represa lo usa. */}
          <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-ink-700/60">Cabezas del rodeo</span>
              <input
                type="number" min={0} step={1} value={rodeo.cabezas}
                onChange={e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) onRodeo({ ...rodeo, cabezas: v, origen: 'manual' }); }}
                className="w-20 text-[10px] font-mono text-right bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
              />
            </div>
            {rodeo.cabezas !== ganaderia.carga_animales && (
              <button
                onClick={() => onRodeo({ ...rodeo, cabezas: ganaderia.carga_animales, origen: 'receptividad' })}
                className="w-full text-[10px] font-medium text-moss-700 border border-moss-300 rounded-lg py-1 hover:bg-moss-50 transition-colors"
              >
                Usar los {ganaderia.carga_animales} que aguanta el pasto
              </button>
            )}
            {rodeo.cabezas > ganaderia.carga_animales && ganaderia.carga_animales > 0 && (
              <p className="text-[9px] text-clay-700 leading-relaxed">
                El rodeo declarado supera la receptividad estimada en {rodeo.cabezas - ganaderia.carga_animales} animales.
                O el campo produce más forraje del que estima el modelo, o hace falta suplementar.
              </p>
            )}
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              Este número también dimensiona el agua de la represa: {demandaMensual_m3(rodeo).toLocaleString('es-AR')} m³ por mes
              entre bebida y riego.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Chip label="Potreros Voisin" value={`${ganaderia.potreros_voisin} potreros`} sub={`~${ganaderia.area_potrero_ha} ha c/u · ${ganaderia.dias_ocupacion} días ocup.`} color="neutro" />
          </div>

          <div className="bg-bone-50 rounded-xl border border-bone-200 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-ink-700">Pastoreo rotativo Voisin</p>
            <p className="text-[9px] text-ink-700/70 leading-relaxed">
              Con {ganaderia.potreros_voisin} potreros de ~{ganaderia.area_potrero_ha} ha, el ganado rota cada {ganaderia.dias_ocupacion} días y el pasto descansa ~{ganaderia.potreros_voisin * ganaderia.dias_ocupacion - ganaderia.dias_ocupacion} días entre pastoreos.
            </p>
          </div>

          <p className="text-[8px] text-ink-700/40 italic px-1">Basado en producción forrajera natural estimada por precipitación anual ({datosClima.precip_anual_mm} mm). No reemplaza análisis de suelo ni asesoramiento.</p>
        </div>
      )}

    </div>
  );
}

// ─── Chip de estadística ──────────────────────────────────────────────────────
function Chip({ label, value, sub, color }: { label: string; value: string; sub: string; color: 'verde' | 'amarillo' | 'rojo' | 'neutro' }) {
  const cls = { verde: 'bg-moss-50 border-moss-200', amarillo: 'bg-sun-300/20 border-sun-300', rojo: 'bg-clay-100 border-clay-200', neutro: 'bg-white border-bone-200' }[color];
  const txt = { verde: 'text-moss-700', amarillo: 'text-clay-700', rojo: 'text-clay-700', neutro: 'text-ink-900' }[color];
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] text-ink-700/60 mb-0.5">{label}</p>
      <p className={`font-mono text-sm font-bold ${txt}`}>{value}</p>
      <p className="text-[9px] text-ink-700/50 mt-0.5">{sub}</p>
    </div>
  );
}
