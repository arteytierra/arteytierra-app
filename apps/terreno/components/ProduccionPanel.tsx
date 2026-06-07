'use client';

import { useState, useMemo } from 'react';
import { Cloud, Wheat } from 'lucide-react';
import {
  CULTIVOS_KC, calcularBalanceProductivo,
  TIPOS_ANIMAL, calcularReceptividad,
  calcularCortinas,
  type CortinaSugerida,
} from '@/lib/produccion';
import type { DatosClima } from '@/lib/clima';
import { MESES } from '@/lib/clima';
import type { Mojon } from '@/lib/types';

interface Props {
  datosClima:  DatosClima | null;
  mojones:     Mojon[];
  areaHa:      number;
  onIrAClima:  () => void;
  onAgregarCortinas?: (cortinas: CortinaSugerida[]) => void;
}

export function ProduccionPanel({ datosClima, mojones, areaHa, onIrAClima, onAgregarCortinas }: Props) {
  const [tab,       setTab]       = useState<'balance' | 'ganaderia' | 'cortinas'>('balance');
  const [cultivoId, setCultivoId] = useState('huerta');
  const [areaCult,  setAreaCult]  = useState(areaHa > 0 ? Math.round(areaHa * 10) / 10 : 1);
  const [animalId,  setAnimalId]  = useState('bovino');

  const cultivo  = CULTIVOS_KC.find(c => c.id === cultivoId) ?? CULTIVOS_KC[0]!;
  const animal   = TIPOS_ANIMAL.find(a => a.id === animalId) ?? TIPOS_ANIMAL[0]!;

  const balance = useMemo(
    () => datosClima ? calcularBalanceProductivo(datosClima.meses, cultivo, areaCult) : null,
    [datosClima, cultivo, areaCult],
  );

  const ganaderia = useMemo(
    () => datosClima ? calcularReceptividad(areaHa || areaCult, datosClima.precip_anual_mm, animal) : null,
    [datosClima, areaHa, areaCult, animal],
  );

  const cortinas = useMemo(
    () => datosClima ? calcularCortinas(datosClima.viento_dir_ppal, mojones) : [],
    [datosClima, mojones],
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
        {([['balance', 'Balance hídrico'], ['ganaderia', 'Ganadería'], ['cortinas', 'Cortinas']] as const).map(([id, label]) => (
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
              value={animalId}
              onChange={e => setAnimalId(e.target.value)}
              className="flex-1 text-[10px] border border-bone-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
            >
              {TIPOS_ANIMAL.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.ev} EV)</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Chip label="Prod. forrajera" value={`${ganaderia.ef_kg_ha.toLocaleString('es-AR')} kg/ha`} sub="kg MS/ha/año estimado" color="neutro" />
            <Chip label="Carga animal" value={`${ganaderia.carga_animales} animales`} sub={`${ganaderia.carga_ev} EV totales`} color={ganaderia.carga_ev > 0 ? 'verde' : 'rojo'} />
            <Chip label="Agua necesaria" value={`${ganaderia.agua_l_dia.toLocaleString('es-AR')} L/día`} sub="demanda hídrica total" color="neutro" />
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

      {/* ── 7.5 Cortinas rompevientos ── */}
      {tab === 'cortinas' && (
        <div className="space-y-3">
          <div className="bg-bone-50 rounded-xl border border-bone-200 p-3 space-y-1">
            <p className="text-[10px] font-semibold text-ink-700">Viento predominante: {datosClima.viento_dir_ppal}</p>
            <p className="text-[9px] text-ink-700/70">Las cortinas se ubican perpendiculares al viento (az. {(((AZIMUT_MAP[datosClima.viento_dir_ppal] ?? 180) + 90) % 360).toFixed(0)}°). Protegen hasta 10× la altura de los árboles (~100 m).</p>
          </div>

          {cortinas.length > 0 && (
            <>
              <div className="space-y-2">
                {cortinas.map((c, i) => (
                  <div key={i} className="bg-white rounded-xl border border-bone-200 p-3">
                    <p className="text-[10px] font-semibold text-ink-700 mb-1">Cortina {i + 1} — {c.longitud_m} m aprox.</p>
                    <p className="text-[9px] text-ink-700/60">Zona de protección: {c.zona_prot_m} m a cada lado.</p>
                  </div>
                ))}
              </div>

              {onAgregarCortinas && (
                <button
                  onClick={() => onAgregarCortinas(cortinas)}
                  className="w-full py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-xl text-xs font-semibold transition-colors"
                >
                  Agregar cortinas al mapa
                </button>
              )}

              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-ink-700">Especies sugeridas — Espinal/Chaco serrano</p>
                {cortinas[0]?.especies.map((e, i) => (
                  <p key={i} className="text-[9px] text-ink-700/70">• {e}</p>
                ))}
              </div>
            </>
          )}

          {cortinas.length === 0 && (
            <p className="text-[9px] text-ink-700/50 text-center py-4">Agregá al menos 3 mojones para calcular cortinas.</p>
          )}
        </div>
      )}
    </div>
  );
}

const AZIMUT_MAP: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SO: 225, O: 270, NO: 315 };

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
