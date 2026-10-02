'use client';

import { useState, useMemo } from 'react';
import { Cloud, Wheat } from 'lucide-react';
import {
  CULTIVOS_KC, calcularBalanceProductivo,
  calcularReceptividad, EV_MCAL_EM_DIA,
} from '@/lib/produccion';
import type { DatosClima } from '@/lib/clima';
import { MESES } from '@/lib/clima';
import type { Mojon } from '@/lib/types';
import {
  perfilRodeo, aguaHacienda_l_dia, demandaMensual_m3, cabezasTotal, evTotal,
  evPorCabeza, nuevoLote, type Rodeo,
} from '@/lib/rodeo';
import { RodeoEditor } from './mapa/RodeoEditor';

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
  // Memoizado porque `perfilRodeo` devuelve un objeto nuevo cada vez y la
  // receptividad no tiene por qué recalcularse en cada render.
  /**
   * El mes de más calor, que es el que manda el agua. Tiene que ser el mismo
   * criterio que usa Represa: si una pestaña muestra el agua con la temperatura
   * y la otra con el valor declarado, el mismo rodeo tiene dos consumos distintos
   * según dónde lo mires, y eso es exactamente lo que esta capa vino a evitar.
   */
  const mesCaluroso = useMemo(() => {
    if (!datosClima) return null;
    let i = 0;
    for (let m = 1; m < 12; m++) if (datosClima.meses[m]!.tmean_c > datosClima.meses[i]!.tmean_c) i = m;
    return { mes: i, t: datosClima.meses[i]!.tmean_c };
  }, [datosClima]);

  const perfil = useMemo(() => perfilRodeo(rodeo, mesCaluroso?.t), [rodeo, mesCaluroso]);

  const balance = useMemo(
    () => datosClima ? calcularBalanceProductivo(datosClima.meses, cultivo, areaCult) : null,
    [datosClima, cultivo, areaCult],
  );

  const ganaderia = useMemo(
    () => datosClima ? calcularReceptividad(areaHa || areaCult, datosClima.precip_anual_mm, perfil) : null,
    [datosClima, areaHa, areaCult, perfil],
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
          <div className="grid grid-cols-2 gap-2">
            <Chip label="Prod. forrajera" value={`${ganaderia.ef_kg_ha.toLocaleString('es-AR')} kg/ha`} sub="kg MS/ha/año estimado" color="neutro" />
            <Chip label="Aguanta el pasto" value={`${ganaderia.carga_ev.toLocaleString('es-AR')} EV`} sub={`${ganaderia.carga_ev_min}–${ganaderia.carga_ev_max} según la calidad del forraje`} color={ganaderia.carga_ev > 0 ? 'verde' : 'rojo'} />
            <Chip label="Rodeo del predio" value={`${evTotal(rodeo).toLocaleString('es-AR')} EV`} sub={`${cabezasTotal(rodeo)} cabezas · ${rodeo.origen === 'receptividad' ? 'de la receptividad' : 'cargado a mano'}`} color="neutro" />
            <Chip label="Agua necesaria" value={`${aguaHacienda_l_dia(rodeo, mesCaluroso?.t).toLocaleString('es-AR')} L/día`}
              sub={mesCaluroso
                ? `en ${MESES[mesCaluroso.mes]}, el mes de más calor · ${perfil.agua_l_dia.toLocaleString('es-AR', { maximumFractionDigits: 0 })} L por cabeza`
                : `${perfil.agua_l_dia.toLocaleString('es-AR', { maximumFractionDigits: 0 })} L por cabeza en promedio`}
              color="neutro" />
          </div>

          {/* De dónde sale la receptividad, dicho de frente.
              Hasta el 01/10/2026 esta pantalla mostraba un solo número —el del
              forraje de mejor calidad— como si fuera EL número, y la cuenta de
              atrás no estaba escrita en ninguna parte. Ahora se dice el
              supuesto, porque es el supuesto el que mueve el resultado: el
              requerimiento del animal está bien medido, lo que no se sabe es
              cuánta energía tiene el pasto de ESTE campo. */}
          <p className="text-[9px] text-ink-700/55 leading-relaxed bg-bone-100 rounded-lg px-2.5 py-1.5">
            Un equivalente vaca pide <b>{EV_MCAL_EM_DIA} Mcal</b> de energía por día
            (vaca de 400 kg criando un ternero hasta el destete; Cocimano, Lange y
            Menvielle, 1975). Con un pastizal natural de {ganaderia.em_mcal_kg} Mcal/kg
            eso son <b>{ganaderia.consumo_ev_kg_dia} kg de materia seca por día</b>, y se
            supone que el animal cosecha la mitad de lo que crece. Si tu pasto es mejor o
            más grosero, el campo aguanta entre {ganaderia.carga_ev_min} y{' '}
            {ganaderia.carga_ev_max} EV: por eso el número de arriba es una
            referencia y no un permiso.
          </p>

          {/* El rodeo es uno solo para toda la app: acá se declara y Represa lo usa.
              Se carga por lotes porque un campo no se carga con «bovinos adultos»:
              se carga con 40 vacas con cría, 12 vaquillonas y 2 toros, y cada
              categoría come distinto (`categorias.ts`, tabla de AACREA). */}
          <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-2">
            <p className="text-[10px] font-semibold text-ink-700">El rodeo del predio</p>
            <RodeoEditor rodeo={rodeo} onRodeo={onRodeo} />

            {ganaderia.carga_animales > 0 && cabezasTotal(rodeo) !== ganaderia.carga_animales && (
              <button
                onClick={() => {
                  // Se respeta la composición cargada: la sugerencia reparte las
                  // cabezas entre los lotes que ya existen, en la misma
                  // proporción. Si no hay ninguno, arranca con un lote de vacas.
                  const total = cabezasTotal(rodeo);
                  const lotes = total > 0
                    ? rodeo.lotes.map(l => ({ ...l, cabezas: Math.round(l.cabezas / total * ganaderia.carga_animales) }))
                    : [{ ...nuevoLote('bovino_vaca_prom', ganaderia.carga_animales) }];
                  onRodeo({ ...rodeo, lotes, origen: 'receptividad' });
                }}
                className="w-full text-[10px] font-medium text-moss-700 border border-moss-300 rounded-lg py-1 hover:bg-moss-50 transition-colors"
              >
                Llevarlo a las {ganaderia.carga_animales} cabezas que aguanta el pasto
              </button>
            )}
            {evTotal(rodeo) > ganaderia.carga_ev && ganaderia.carga_ev > 0 && (
              <p className="text-[9px] text-clay-700 leading-relaxed">
                El rodeo declarado pide {(evTotal(rodeo) - ganaderia.carga_ev).toLocaleString('es-AR', { maximumFractionDigits: 1 })} EV
                más que la receptividad estimada. O el campo produce más forraje del que estima el
                modelo, o hace falta suplementar.
              </p>
            )}
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              Este rodeo también dimensiona el agua de la represa: {demandaMensual_m3(rodeo, mesCaluroso?.t).toLocaleString('es-AR')} m³ en el mes de más calor
              entre bebida y riego. Una cabeza promedio de este rodeo pesa{' '}
              {evPorCabeza(rodeo).toLocaleString('es-AR', { maximumFractionDigits: 2 })} EV.
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
