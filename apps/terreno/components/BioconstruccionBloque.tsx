'use client';

import { useMemo, useState } from 'react';
import { BrickWall, ChevronDown, Info, Ruler, Snowflake, Umbrella } from 'lucide-react';
import type { DatosClima } from '@/lib/clima';
import type { Extremos } from '@/lib/climaExtremos';
import {
  ESPESORES_TABLA1_PULG, FUENTE_IECC, FUENTE_IRC_AS, FUENTE_IRC_AU, FUENTE_LACY,
  FUENTE_NM1474, FUENTE_PEEL, LA_NORMA_LOCAL_PROHIBE, SDS_TABLA1,
  ZONAS_MARINAS_TABULADAS, alturaMaximaMuroTierra, evaluarBioconstruccion,
  perdidaPorSismo, type IdTecnica, type Veredicto,
} from '@/lib/bioconstruccion';

interface Props {
  /** La serie climática mensual del panel. Sin ella no hay nada que evaluar. */
  datos:    DatosClima | null;
  /**
   * La serie diaria, sólo para los días de helada: son la **cota superior** de
   * los ciclos de hielo-deshielo, no los ciclos. Si no está, el bloque igual
   * corre: las medias mensuales alcanzan para el gate del adobe quemado.
   */
  extremos: Extremos | null;
}

const n0 = (x: number) => Math.round(x).toLocaleString('es-AR');
const n1 = (x: number) => (Math.round(x * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Las clases van escritas enteras y no armadas con una variable: Tailwind lee
 * el código fuente, así que una clase interpolada no genera CSS y el chip sale
 * sin color.
 */
const CHIP_VEREDICTO: Readonly<Record<Veredicto, { clase: string; rotulo: string }>> = {
  apta:            { clase: 'bg-moss-500/12 text-moss-800 border-moss-500/30',  rotulo: 'Admitida' },
  con_condiciones: { clase: 'bg-sun-500/12 text-sun-700 border-sun-500/30',     rotulo: 'Con condiciones' },
  desaconsejada:   { clase: 'bg-clay-500/12 text-clay-800 border-clay-500/30',  rotulo: 'Desaconsejada' },
  no_evaluable:    { clase: 'bg-bone-200 text-ink-700/70 border-bone-300',      rotulo: 'No evaluable acá' },
};

const CLASE_EXPOSICION: Readonly<Record<string, string>> = {
  resguardado: 'font-mono text-sm font-bold text-moss-800',
  moderado:    'font-mono text-sm font-bold text-moss-700',
  alto:        'font-mono text-sm font-bold text-sun-700',
  severo:      'font-mono text-sm font-bold text-clay-800',
};

/** Las cinco variables a las que estos códigos atan sus cláusulas. */
const LAS_CINCO: readonly { que: string; puede: boolean; porque: string }[] = [
  { que: 'Zona climática del IECC', puede: true,
    porque: 'sale de los grados-día de la serie mensual' },
  { que: 'Ciclos de hielo y deshielo', puede: true,
    porque: 'salen de las mínimas y máximas medias de cada mes' },
  { que: 'Exposición a la lluvia batiente', puede: true,
    porque: 'es lluvia anual por viento medio, y los dos están' },
  { que: 'Categoría de diseño sísmico', puede: false,
    porque: 'sale de un mapa nacional de amenaza sísmica que acequia no tiene' },
  { que: 'Zona inundable de diseño', puede: false,
    porque: 'el modelo de elevación no trae la mancha de inundación' },
];

export function BioconstruccionBloque({ datos, extremos }: Props) {
  const [abierta,  setAbierta]  = useState<IdTecnica | null>(null);
  const [espesor,  setEspesor]  = useState<number>(10);
  const [sds,      setSds]      = useState<number>(0.5);
  const [porQue,   setPorQue]   = useState(false);

  const bio = useMemo(() => {
    if (!datos) return null;
    return evaluarBioconstruccion({
      meses:            datos.meses,
      lat:              datos.lat,
      precip_anual_mm:  datos.precip_anual_mm,
      tmean_anual_c:    datos.tmean_anual_c,
      viento_medio_ms:  datos.viento_medio_ms ?? null,
      dias_helada_anio: extremos?.heladas.dias_helada_anio ?? null,
    });
  }, [datos, extremos]);

  const altura  = useMemo(() => alturaMaximaMuroTierra(espesor, sds), [espesor, sds]);
  const perdida = useMemo(() => perdidaPorSismo(espesor), [espesor]);

  if (!datos) return null;

  if (!bio) {
    return (
      <div className="bg-clay-500/5 rounded-xl border border-clay-500/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <BrickWall className="w-3.5 h-3.5 text-clay-700" />
          <p className="text-xs font-semibold text-ink-700">Bioconstrucción: tierra y paja</p>
        </div>
        <p className="text-[11px] text-ink-700/70 leading-snug">
          La serie de este punto no trae los doce meses completos, y la zona climática del código no
          se arma con lo que haya: los grados-día son una suma anual y faltarían meses enteros.
        </p>
      </div>
    );
  }

  const { zona, aridez, hielo, lluvia, tecnicas } = bio;
  const marinaSinTabla = zona.humedad === 'C' && !ZONAS_MARINAS_TABULADAS.includes(zona.zona);

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 bg-clay-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BrickWall className="w-3.5 h-3.5 text-bone-200" />
          <p className="text-[11px] font-bold text-bone-50 uppercase tracking-wide">Bioconstrucción: tierra y paja</p>
        </div>
        <p className="text-[9px] font-mono text-bone-300">zona {zona.codigo}</p>
      </div>

      <div className="p-3 space-y-3">
        {/* ── La premisa corrida: Köppen no es la variable ── */}
        <div>
          <p className="text-[11px] font-semibold text-ink-700 mb-1">
            La técnica no se decide por el clima de Köppen
          </p>
          <p className="text-[10px] text-ink-700/75 leading-snug mb-1.5">
            Se leyeron los códigos que de verdad regulan estas técnicas y ninguno condiciona nada a
            una clase de Köppen{datos.koppen && <> —la de este predio es <b className="font-mono">{datos.koppen.codigo}</b></>}.
            Condicionan a estas cinco cosas, y acequia puede calcular tres:
          </p>
          <ul className="space-y-0.5">
            {LAS_CINCO.map(v => (
              <li key={v.que} className="flex items-start gap-1.5 text-[10px] leading-snug">
                <span className={v.puede ? 'text-moss-700 font-bold' : 'text-clay-700 font-bold'}>
                  {v.puede ? '✓' : '✗'}
                </span>
                <span className="text-ink-700/85">
                  <b className="font-semibold">{v.que}</b>
                  <span className="text-ink-700/55"> — {v.porque}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── La zona del IECC ── */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold text-ink-700">Zona climática del código</p>
            <p className="font-mono text-base font-bold text-water-700">{zona.codigo}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="rounded-lg p-1.5 bg-clay-500/8 border border-clay-500/20">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Calefacción</p>
              <p className="font-mono text-xs font-bold text-clay-800">{n0(zona.hdd18)}</p>
              <p className="text-[9px] text-ink-700/50">K·día, base 18,3 °C</p>
            </div>
            <div className="rounded-lg p-1.5 bg-water-500/8 border border-water-500/20">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Refrigeración</p>
              <p className="font-mono text-xs font-bold text-water-800">{n0(zona.cdd10)}</p>
              <p className="text-[9px] text-ink-700/50">K·día, base 10 °C</p>
            </div>
            <div className="rounded-lg p-1.5 bg-bone-100 border border-bone-300">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Al corte</p>
              <p className="font-mono text-xs font-bold text-ink-700">{n0(zona.margen_al_limite)}</p>
              <p className="text-[9px] text-ink-700/50">K·día de margen</p>
            </div>
          </div>
          <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
            Régimen {zona.regimen}. El número es puramente térmico y la letra se le agrega: la
            definición de seca dice literalmente «not marine», así que es un orden y no tres pruebas
            en paralelo.
            {marinaSinTabla && (
              <> Y acá sale <b className="font-mono">{zona.codigo}</b>, que el clima admite y la tabla
              del código no lista.</>
            )}
          </p>
        </div>

        {/* ── Las dos líneas de aridez ── */}
        <div className="border-t border-bone-200 pt-2">
          <p className="text-[11px] font-semibold text-ink-700 mb-1">
            Köppen y el código no trazan la misma línea de aridez
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2 bg-bone-100 border border-bone-300">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Línea del código</p>
              <p className="font-mono text-sm font-bold text-ink-700">{n0(aridez.linea_codigo_mm)} mm</p>
              <p className="text-[9px] text-ink-700/55">P &lt; 20·(T + 7)</p>
            </div>
            <div className="rounded-lg p-2 bg-bone-100 border border-bone-300">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Línea de Köppen</p>
              <p className="font-mono text-sm font-bold text-ink-700">{n0(aridez.linea_koppen_mm)} mm</p>
              <p className="text-[9px] text-ink-700/55">
                {aridez.brecha_mm === 0 ? 'la misma línea, exactamente' : `${n0(aridez.brecha_mm)} mm de diferencia`}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-ink-700/75 mt-1 leading-snug">
            Con {n0(datos.precip_anual_mm)} mm al año y {n1(datos.tmean_anual_c)} °C de media:{' '}
            {aridez.explicacion}
          </p>
        </div>

        {/* ── Hielo y deshielo ── */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-center gap-1 mb-1 text-water-700">
            <Snowflake className="w-3 h-3" />
            <p className="text-[11px] font-semibold">Ciclos de hielo y deshielo</p>
          </div>
          {hielo.hay_ciclo_diario ? (
            <p className="text-[10px] text-ink-700/80 leading-snug">
              <b className="font-mono">{hielo.meses_con_ciclo.length}</b>{' '}
              {hielo.meses_con_ciclo.length === 1 ? 'mes cruza' : 'meses cruzan'} el cero en los dos
              sentidos: <span className="font-mono">{hielo.meses_con_ciclo.join(' · ')}</span>. Es el
              único gate explícitamente climático de estos códigos, y el que desaconseja el adobe
              quemado al aire libre.
            </p>
          ) : (
            <p className="text-[10px] text-ink-700/80 leading-snug">
              Ningún mes cruza el cero en los dos sentidos con las medias mensuales. Eso levanta el
              gate del adobe quemado, con la reserva de que las medias de un mes esconden los días:
              un mes de media 2 °C tiene noches bajo cero.
            </p>
          )}
          {hielo.meses_congelados.length > 0 && (
            <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
              Y en <span className="font-mono">{hielo.meses_congelados.join(' · ')}</span> la máxima
              media tampoco pasa de cero: ahí el muro queda congelado y no cicla, que es menos
              destructivo que alternar.
            </p>
          )}
          {hielo.dias_cota_sup !== null && hielo.dias_cota_sup > 0 && (
            <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
              La serie diaria da <b className="font-mono">{n1(hielo.dias_cota_sup)}</b> días de helada
              al año: es una cota superior de los ciclos, porque un día de helada es un ciclo sólo si
              además deshiela.
            </p>
          )}
        </div>

        {/* ── Lluvia batiente ── */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-center gap-1 mb-1 text-water-700">
            <Umbrella className="w-3 h-3" />
            <p className="text-[11px] font-semibold">Lluvia batiente (índice de Lacy)</p>
          </div>
          {lluvia ? (
            <>
              <div className="flex items-baseline gap-2">
                <p className={CLASE_EXPOSICION[lluvia.clase] ?? 'font-mono text-sm font-bold text-ink-700'}>
                  {n1(lluvia.dri_m2s)} m²/s
                </p>
                <p className="text-[10px] text-ink-700/70">exposición {lluvia.clase}</p>
              </div>
              <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
                Es un <b>producto</b> de lluvia por viento: {n0(datos.precip_anual_mm)} mm con{' '}
                {n1(datos.viento_medio_ms ?? 0)} m/s. Poca lluvia con mucho viento da lo mismo que
                mucha lluvia con aire quieto, así que «acá llueve poco» no alcanza como argumento.
                Cortes en 3 · 7 · 11.
              </p>
            </>
          ) : (
            <p className="text-[10px] text-ink-700/70 leading-snug">
              Esta serie no trae viento medio anual, y el índice es el producto de la lluvia por el
              viento: sin uno de los dos factores no hay índice. No se rellena con un viento típico.
            </p>
          )}
        </div>

        {/* ── Las ocho técnicas ── */}
        <div className="border-t border-bone-200 pt-2">
          <p className="text-[11px] font-semibold text-ink-700 mb-1.5">
            Las ocho técnicas publicadas, contra este clima
          </p>
          <div className="space-y-1">
            {tecnicas.map(ev => {
              const chip = CHIP_VEREDICTO[ev.veredicto];
              const open = abierta === ev.tecnica.id;
              return (
                <div key={ev.tecnica.id} className="rounded-lg border border-bone-200 overflow-hidden">
                  <button
                    onClick={() => setAbierta(open ? null : ev.tecnica.id)}
                    className="w-full px-2 py-1.5 flex items-center justify-between gap-2 hover:bg-bone-50 text-left"
                  >
                    <span className="text-[10px] font-semibold text-ink-700">{ev.tecnica.nombre}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${chip.clase}`}>
                        {chip.rotulo}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-ink-700/40 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {open && (
                    <div className="px-2 pb-2 space-y-1.5 text-[9px] leading-relaxed">
                      {ev.decide && (
                        <p className="text-ink-700/85">
                          <b className="font-semibold">Lo que decide:</b> {ev.decide}
                        </p>
                      )}
                      {ev.condiciones.length > 0 && (
                        <div>
                          <p className="font-semibold text-ink-700/80">Condiciones que se activan acá</p>
                          {ev.condiciones.map((c, i) => (
                            <p key={i} className="text-ink-700/70">· {c}</p>
                          ))}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-ink-700/80">Lo que el código fija, llueva o no</p>
                        {ev.tecnica.limites.map((l, i) => (
                          <p key={i} className="text-ink-700/70">· {l}</p>
                        ))}
                      </div>
                      {ev.pendientes.length > 0 && (
                        <div>
                          <p className="font-semibold text-clay-800">Lo que acequia no puede verificar</p>
                          {ev.pendientes.map((p, i) => (
                            <p key={i} className="text-ink-700/70">· {p}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-ink-700/45 pt-0.5">{ev.tecnica.fuente}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── El espesor contra el sismo ── */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-center gap-1 mb-1 text-clay-700">
            <Ruler className="w-3 h-3" />
            <p className="text-[11px] font-semibold">El espesor compra tolerancia sísmica</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase text-ink-700/55 tracking-wide">Espesor</span>
              <select
                value={espesor}
                onChange={e => setEspesor(Number(e.target.value))}
                className="px-1.5 py-0.5 font-mono text-[11px] border border-bone-300 rounded bg-white"
              >
                {ESPESORES_TABLA1_PULG.map(p => (
                  <option key={p} value={p}>{p}″ · {n0(p * 2.54)} cm</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase text-ink-700/55 tracking-wide">Sds</span>
              <select
                value={sds}
                onChange={e => setSds(Number(e.target.value))}
                className="px-1.5 py-0.5 font-mono text-[11px] border border-bone-300 rounded bg-white"
              >
                {SDS_TABLA1.map(s => (
                  <option key={s} value={s}>{s.toLocaleString('es-AR')}</option>
                ))}
              </select>
            </label>
            <div className="rounded-lg p-1.5 bg-clay-500/8 border border-clay-500/20">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Altura admisible</p>
              <p className="font-mono text-sm font-bold text-clay-800">
                {altura ? `${n1(altura.altura_m)} m` : '—'}
              </p>
            </div>
          </div>
          <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
            Tabla 1 de 14.7.4 NMAC, para hasta dos pisos, vivienda uni o bifamiliar y sitio sísmico
            clase D1. No se extrapola: fuera de los seis espesores y los seis valores de Sds
            publicados devuelve vacío.
            {perdida !== null && (
              <> Del Sds más bajo al más alto, un muro de {espesor}″ pierde{' '}
              <b className="font-mono">{n1(perdida)} %</b> de altura admisible
              {perdida === 0 && <> —o sea, nada: el muro grueso no es prolijidad, es lo que mantiene
              la altura cuando el sismo aprieta—</>}.</>
            )}
          </p>
          <p className="text-[9px] text-clay-800 mt-1 leading-tight">
            El Sds es un dato del mapa sísmico nacional y acequia no lo tiene: el selector sirve para
            leer la tabla, no para decir en qué fila cae este predio.
          </p>
        </div>

        {/* ── Por qué ── */}
        <button
          onClick={() => setPorQue(v => !v)}
          className="w-full flex items-center justify-center gap-1 pt-1 text-[10px] text-ink-700/60 hover:text-ink-700"
        >
          <Info className="w-3 h-3" />
          Por qué estos números
          <ChevronDown className={`w-3 h-3 transition-transform ${porQue ? 'rotate-180' : ''}`} />
        </button>

        {porQue && (
          <div className="space-y-2 text-[9px] text-ink-700/70 leading-relaxed border-t border-bone-200 pt-2">
            <p>
              <b>Los cortes están en SI y son exactos.</b> Las zonas del IECC se publican en °F·día y
              acá se usan en K·día: son exactamente cinco novenos de los valores imperiales
              (5.400 °F·d = 3.000 K·d). No hay redondeo de por medio.
            </p>
            <p>
              <b>Las dos líneas de aridez, con aritmética y no con ejemplos.</b> El código define seca
              como P &lt; 20·T + 140 mm. Köppen define árido como P &lt; 20·T + 280 si llueve en
              verano, 20·T si llueve en invierno y 20·T + 140 si está repartida. Así que son{' '}
              <b>la misma línea</b> con lluvia repartida y se separan <b>exactamente 140 mm</b> cuando
              es estacional, con el signo dado por la estación en que llueve.
            </p>
            <p>
              <b>Las medias mensuales subestiman los grados-día,</b> y más donde la amplitud térmica es
              grande, que es justamente el desierto, que es justamente donde se construye con tierra.
              Por eso el bloque publica el margen al corte: cerca del límite, la zona es una conjetura.
            </p>
            {marinaSinTabla && (
              <p>
                <b>Una zona que el clima admite y la tabla no lista.</b> La definición de clima marino
                son cuatro condiciones climáticas y no trae tope de zona, así que puede salir{' '}
                <b className="font-mono">{zona.codigo}</b>. El código sólo tabula 3C, 4C y 5C: para
                esta combinación no hay prescripciones escritas.
              </p>
            )}
            {[...zona.advertencias, ...hielo.advertencias, ...(lluvia?.advertencias ?? [])].map((a, i) => (
              <p key={i}>{a}</p>
            ))}
            <p className="text-clay-800">{LA_NORMA_LOCAL_PROHIBE}</p>
            <div className="pt-1 border-t border-bone-200 space-y-0.5">
              <p className="font-semibold text-ink-700/80">Fuentes</p>
              {[FUENTE_NM1474, FUENTE_IRC_AS, FUENTE_IRC_AU, FUENTE_IECC, FUENTE_LACY, FUENTE_PEEL].map(f => (
                <p key={f} className="text-ink-700/55">· {f}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
