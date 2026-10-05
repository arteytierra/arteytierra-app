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
import {
  distribucionPendiente, distribucionAguaCuadrado, noPastoreable, superficieEfectiva,
  modulacion, areaMaxima_ha, rodeoMaximoPorAgua,
  FUENTE_HOLECHEK, FUENTE_B829, FUENTE_GPS, MILLA_M,
  type AguaEn, type SuperficieEfectiva, type Modulacion,
} from '@/lib/modulacion';
import type { GrillaElevacion } from '@/lib/grillaElevacion';
import { RodeoEditor } from './mapa/RodeoEditor';
import { SombraGanadoBloque } from './SombraGanadoBloque';

interface Props {
  datosClima:  DatosClima | null;
  mojones:     Mojon[];
  areaHa:      number;
  onIrAClima:  () => void;
  /** Rodeo compartido con Represa: lo que se cambia acá se ve allá, y al revés. */
  rodeo:       Rodeo;
  onRodeo:     (r: Rodeo) => void;
  /** Relieve del predio: de acá sale el reparto por bandas de pendiente. */
  grilla?:     GrillaElevacion | null;
  /** Cobertura por clase: de acá sale lo que no es tierra de pastoreo. */
  cobertura?:  Array<{ valor: number; nombre: string; pct: number }> | null;
}

export function ProduccionPanel({ datosClima, mojones, areaHa, onIrAClima, rodeo, onRodeo, grilla, cobertura }: Props) {
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

  // ── Etapa A: la superficie que el ganado realmente usa ──
  // Lo que el productor declara y la app no puede saber: cuántas aguadas hay,
  // dónde cae el agua dentro del potrero, cuánto entrega la cañería y si él se
  // pone un tope de cabezas por rodeo. Los defaults son los conservadores.
  const [aguadas,        setAguadas]        = useState(1);
  const [aguaEn,         setAguaEn]         = useState<AguaEn>('centro');
  const [caudalAguada,   setCaudalAguada]   = useState(0);
  const [rodeoManejable, setRodeoManejable] = useState(0);

  const distPend = useMemo(() => distribucionPendiente(grilla ?? null, mojones), [grilla, mojones]);
  const noPast   = useMemo(() => noPastoreable(cobertura ?? null), [cobertura]);

  /**
   * La cadena, en este orden y no en otro: se descuenta lo que no es campo, se
   * mira cuánta superficie le toca a cada aguada que HAY HOY, y de ahí sale el
   * ajuste por distancia. La receptividad tiene que reflejar el campo como está,
   * no como quedaría con el diseño puesto.
   */
  const superficie = useMemo(() => {
    const haBrutas = areaHa || areaCult;
    const haPast = haBrutas * (1 - noPast.fraccion);
    const porAguada = haPast / Math.max(1, aguadas);
    return superficieEfectiva({
      ha_brutas: haBrutas,
      noPastoreable: noPast,
      pendiente: distPend,
      agua: porAguada > 0 ? distribucionAguaCuadrado(porAguada, aguaEn) : null,
      aguadas,
    });
  }, [areaHa, areaCult, noPast, distPend, aguadas, aguaEn]);

  const ganaderia = useMemo(
    () => datosClima
      ? calcularReceptividad(areaHa || areaCult, datosClima.precip_anual_mm, perfil, undefined, {
          ha_pastoreables: superficie.ha_pastoreables,
          factor_distribucion: superficie.factor,
        })
      : null,
    [datosClima, areaHa, areaCult, perfil, superficie],
  );

  const modul = useMemo(() => modulacion({
    ha_pastoreables: superficie.ha_pastoreables,
    cabezas: cabezasTotal(rodeo),
    caudal_l_min: caudalAguada > 0 ? caudalAguada : null,
    litros_cabeza_dia: perfil.agua_l_dia > 0 ? perfil.agua_l_dia : null,
    aguaEn,
    rodeoManejable: rodeoManejable > 0 ? rodeoManejable : null,
  }), [superficie, rodeo, caudalAguada, perfil, aguaEn, rodeoManejable]);

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
            eso son <b>{ganaderia.consumo_ev_kg_dia} kg de materia seca por día</b>. De lo
            que crece se le asigna al animal el{' '}
            <b>{Math.round(ganaderia.uso_admisible * 100)} %</b>, que es el uso admisible
            publicado para un {ganaderia.banda_uso.toLowerCase()} de{' '}
            {datosClima.precip_anual_mm} mm de lluvia: el resto
            queda en pie para que la planta rebrote. Si tu pasto es mejor o más grosero, el
            campo aguanta entre {ganaderia.carga_ev_min} y {ganaderia.carga_ev_max} EV: por
            eso el número de arriba es una referencia y no un permiso.
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

          {/* Etapa A — modulación. Va DESPUÉS del rodeo porque los módulos
              dependen de cuántas cabezas hay, y ANTES de los potreros Voisin
              porque un potrero es la subdivisión de adentro de un módulo: el
              módulo es la unidad de manejo completa, con su rodeo y su agua. */}
          <SuperficieYModulos
            superficie={superficie} modul={modul}
            aguadas={aguadas} onAguadas={setAguadas}
            aguaEn={aguaEn} onAguaEn={setAguaEn}
            caudal={caudalAguada} onCaudal={setCaudalAguada}
            rodeoMax={rodeoManejable} onRodeoMax={setRodeoManejable}
            litrosCabeza={perfil.agua_l_dia}
            usoPct={Math.round(ganaderia.uso_admisible * 100)}
            bandaUso={ganaderia.banda_uso}
          />

          {/* Etapa D — sombra. Va acá porque se dimensiona con el rodeo ya
              declarado y porque la decisión de dónde ponerla es del mismo orden
              que la del agua: las dos reparten el pastoreo, y juntarlas en un
              punto concentra el pisoteo y el estiércol en ese punto. */}
          <SombraGanadoBloque rodeo={rodeo} meses={datosClima.meses} lat={datosClima.lat} />

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


// ─── Etapa A: la superficie que el ganado usa, y en cuántos módulos ───────────

/**
 * Dos cosas que la receptividad calculaba mal y ahora salen de tablas publicadas.
 *
 * 1. **Las hectáreas del polígono no son hectáreas de pastoreo.** Una parte no es
 *    campo —el espejo, el humedal, lo construido— y eso se resta. Del resto, el
 *    ganado no usa todo igual: en terreno quebrado se queda en los bajos y lejos
 *    del agua no camina. Eso **no es una resta de superficie**, es un factor sobre
 *    la capacidad, y los dos ajustes **no se multiplican**: manda el peor. La
 *    regla es de la fuente y es contraintuitiva, así que está escrita acá.
 * 2. **El uso admisible no es el 50 % en todas partes.** La regla de dejar la
 *    mitad en pie vale, dice su propia fuente, para pastizales húmedos. En el
 *    semiárido el número publicado es 30 %.
 *
 * Y lo que la etapa agrega como diseño: cuántos módulos de manejo pide el campo,
 * y **cuál es la restricción que obliga a ese número**, que es la única que vale
 * la pena discutir.
 */
function SuperficieYModulos({
  superficie, modul, aguadas, onAguadas, aguaEn, onAguaEn,
  caudal, onCaudal, rodeoMax, onRodeoMax, litrosCabeza, usoPct, bandaUso,
}: {
  superficie:   SuperficieEfectiva;
  modul:        Modulacion;
  aguadas:      number;
  onAguadas:    (n: number) => void;
  aguaEn:       AguaEn;
  onAguaEn:     (a: AguaEn) => void;
  caudal:       number;
  onCaudal:     (n: number) => void;
  rodeoMax:     number;
  onRodeoMax:   (n: number) => void;
  litrosCabeza: number;
  usoPct:       number;
  bandaUso:     string;
}) {
  const perdidoPct = superficie.ha_pastoreables > 0
    ? Math.round((1 - superficie.ha_equivalentes / superficie.ha_pastoreables) * 100)
    : 0;
  const topeHa = areaMaxima_ha(MILLA_M, aguaEn);
  const maxPorAgua = caudal > 0 && litrosCabeza > 0 ? rodeoMaximoPorAgua(caudal, litrosCabeza) : null;

  const TRABA_TEXTO: Record<Modulacion['traba'], string> = {
    agua:      'el caudal de la aguada: no alcanza a abrevar todo el rodeo junto en las dos horas que pide la norma',
    distancia: 'la distancia al agua: una aguada sola no puede servir más superficie sin que el ganado deje de usar lo lejano',
    rodeo:     'el tope de cabezas por rodeo que declaraste',
    ninguna:   'ninguna, con los datos cargados',
  };

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-2">
      <p className="text-[10px] font-semibold text-ink-700">La superficie que el ganado usa</p>

      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        <Mini label="Del plano" valor={`${superficie.ha_brutas.toLocaleString('es-AR')} ha`} />
        <Mini label="De pastoreo" valor={`${superficie.ha_pastoreables.toLocaleString('es-AR')} ha`} />
        <Mini label="Equivalente" valor={`${superficie.ha_equivalentes.toLocaleString('es-AR')} ha`} />
      </div>

      {superficie.exclusiones.length > 0 && (
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          Sale del plano un {Math.round(superficie.exclusiones.reduce((s, e) => s + e.pct, 0))} %
          que no es tierra de pastoreo:{' '}
          {superficie.exclusiones.map(e => `${e.nombre.toLowerCase()} ${e.pct} %`).join(', ')}.
          El suelo desnudo no se descuenta: sigue siendo campo, lo que pasa es que produce poco.
        </p>
      )}

      {superficie.manda !== 'ninguno' && (
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          De lo que queda, el ganado usa el equivalente a un{' '}
          <b>{Math.round(superficie.factor * 100)} %</b>: las hectáreas siguen ahí y siguen
          produciendo pasto, pero el animal no las camina todas igual. Lo que más pesa es{' '}
          <b>{superficie.manda === 'pendiente' ? 'la pendiente' : 'la distancia al agua'}</b>
          {superficie.factor_pendiente !== null && superficie.factor_agua !== null && (
            <> (pendiente {Math.round(superficie.factor_pendiente * 100)} %, agua{' '}
            {Math.round(superficie.factor_agua * 100)} %)</>
          )}
          , y de los dos se toma el peor y <b>no el producto</b>: las dos reducciones
          describen al mismo animal que no camina, así que multiplicarlas lo descontaría dos
          veces. Son {perdidoPct} % menos de carga que calcular sobre el plano.
        </p>
      )}

      {/* ── Lo que el productor declara ── */}
      <div className="border-t border-bone-100 pt-1.5 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <Campo label="Aguadas" valor={aguadas} onValor={onAguadas} min={1} sufijo="" />
          <Campo label="Caudal" valor={caudal} onValor={onCaudal} min={0} sufijo="L/min" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-ink-700/60">El agua cae</span>
          <div className="flex rounded-md overflow-hidden border border-bone-200">
            {([['centro', 'al medio'], ['borde', 'en un lado'], ['esquina', 'en una punta']] as const).map(([v, rotulo]) => (
              <button
                key={v}
                onClick={() => onAguaEn(v)}
                className={`px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                  aguaEn === v ? 'bg-moss-700 text-bone-50' : 'bg-white text-ink-700/60 hover:bg-bone-50'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
        <Campo label="Tope de cabezas por rodeo (opcional)" valor={rodeoMax} onValor={onRodeoMax} min={0} sufijo="cab." />
      </div>

      {/* ── Los módulos ── */}
      <div className="border-t border-bone-100 pt-1.5 space-y-1">
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <Mini label="Módulos" valor={`${modul.modulos}`} />
          <Mini label="Cada uno" valor={`${modul.ha_modulo.toLocaleString('es-AR')} ha`} />
          <Mini label="Camina hasta" valor={`${modul.distancia_maxima_m.toLocaleString('es-AR')} m`} />
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          Es <b>el número más chico que cumple</b>, no el que queda lindo: cada subdivisión es
          alambre, portón y recorrido. Lo que obliga a ese número es <b>{TRABA_TEXTO[modul.traba]}</b>.
          {modul.por_agua !== null && modul.por_distancia !== null && (
            <> Por caudal pide {modul.por_agua}, por distancia {modul.por_distancia}
            {modul.por_rodeo !== null ? <> y por tamaño de rodeo {modul.por_rodeo}</> : null}.</>
          )}
        </p>
        {maxPorAgua !== null && maxPorAgua > 0 && (
          <p className="text-[9px] text-ink-700/50 leading-relaxed">
            Una aguada de {caudal} L/min abreva <b>{maxPorAgua} cabezas</b> de{' '}
            {Math.round(litrosCabeza)} L por día, porque el ganado va dos veces y cada tanda
            tiene que entrar en dos horas. El tamaño del rodeo lo pone el agua, no el pasto.
          </p>
        )}
        <p className="text-[9px] text-ink-700/50 leading-relaxed">
          Con el agua {aguaEn === 'centro' ? 'al medio' : aguaEn === 'borde' ? 'en un lado' : 'en una punta'} del
          potrero, un módulo de hasta <b>{topeHa.toLocaleString('es-AR')} ha</b> no obliga a nadie a
          caminar más de 1,6 km, que es donde la tabla empieza a descontar.
          {aguaEn !== 'centro' && (
            <> Al medio serían {areaMaxima_ha(MILLA_M, 'centro').toLocaleString('es-AR')} ha: mover el
            bebedero es más barato que un alambrado.</>
          )}
        </p>
        {superficie.factor_agua !== null && superficie.factor_agua < 1 && (
          <p className="text-[9px] text-moss-700 leading-relaxed">
            Hoy, con {aguadas === 1 ? 'una sola aguada' : `${aguadas} aguadas`}, la distancia te
            saca {Math.round((1 - superficie.factor_agua) * 100)} % de la carga. Con{' '}
            <b>{Math.max(1, Math.ceil(superficie.ha_pastoreables / topeHa))} aguadas</b> ese
            descuento desaparece: no es un destino del campo, es una consecuencia de cuánta agua hay.
          </p>
        )}
      </div>

      {(superficie.cautelas.length > 0 || modul.avisos.length > 0) && (
        <div className="border-t border-bone-100 pt-1.5 space-y-0.5">
          {[...modul.avisos, ...superficie.cautelas].map((t, i) => (
            <p key={i} className="text-[9px] text-clay-700/80 leading-relaxed flex gap-1">
              <span className="shrink-0">·</span><span>{t}</span>
            </p>
          ))}
        </div>
      )}

      <details className="text-[9px]">
        <summary className="cursor-pointer select-none text-ink-700/45 hover:text-ink-700/70">de dónde salen estos números</summary>
        <div className="pt-1 space-y-1 text-ink-700/55 leading-relaxed">
          <p>
            <b>Uso admisible, pendiente y distancia al agua:</b> {FUENTE_HOLECHEK} Acá el uso es
            del {usoPct} % porque el predio cae en la banda «{bandaUso.toLowerCase()}»; la regla de
            dejar la mitad en pie, dice esa misma fuente, vale sólo para pastizales húmedos y de
            anuales.
          </p>
          <p><b>Cómo se combinan los dos ajustes:</b> {FUENTE_B829} De ahí sale que se toma el peor y no el producto.</p>
          <p>
            <b>Hasta dónde valen:</b> {FUENTE_GPS} Con collares GPS en seis campos encontraron que
            el ajuste por pendiente se sostiene —y que donde falla es por conservador— pero que el
            descuento por distancia <b>no se sostiene donde el agua es escasa</b>: con una sola
            aguada el ganado camina bastante más de la milla. Son guías para una carga inicial, no
            mediciones de este campo.
          </p>
        </div>
      </details>
    </div>
  );
}

function Mini({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-bone-50 rounded-lg px-2 py-1">
      <p className="text-[9px] text-ink-700/55">{label}</p>
      <p className="font-mono text-[11px] font-bold text-ink-900">{valor}</p>
    </div>
  );
}

function Campo({ label, valor, onValor, min, sufijo }: {
  label: string; valor: number; onValor: (n: number) => void; min: number; sufijo: string;
}) {
  return (
    <label className="flex items-center justify-between gap-1 border border-bone-200 rounded px-2 py-1">
      <span className="text-[9px] text-ink-700/60 truncate">{label}</span>
      <span className="flex items-center gap-1 shrink-0">
        <input
          type="number" min={min} step="1" value={valor}
          onChange={e => onValor(Math.max(min, Math.round(parseFloat(e.target.value) || 0)))}
          className="w-14 text-[10px] text-right focus:outline-none bg-transparent"
        />
        {sufijo && <span className="text-[9px] text-ink-700/50">{sufijo}</span>}
      </span>
    </label>
  );
}
