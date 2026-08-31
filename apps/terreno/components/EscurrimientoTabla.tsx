'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TableProperties, ChevronDown } from 'lucide-react';
import {
  escurrimientoAnual, claseSueloSugerida, SUELOS_ESCURRIMIENTO,
  type SueloEscurrimiento, type Confiabilidad,
} from '@/lib/criterios';

/**
 * Segundo método para estimar el agua que junta un área de captación de ladera.
 *
 * Por qué un segundo método. El aporte anual de la app sale de un coeficiente de
 * escorrentía (suelo × cobertura) multiplicado por la lluvia: es el camino
 * corriente y funciona, pero el coeficiente es un número solo y esconde cuánto
 * puede variar la realidad. La tabla 8.3 llega al mismo número por otro lado
 * —clima, evaporación y clase de suelo— y sobre todo devuelve un RANGO. Cuando
 * los dos métodos coinciden, el número está firme; cuando se separan, eso mismo
 * es el dato: hay que salir a mirar el campo antes de dimensionar una obra.
 *
 * No reemplaza al cálculo principal ni lo corrige. Se muestra al lado, con su
 * fuente, y el usuario decide.
 */

interface Props {
  /** Precipitación anual del sitio, en mm. */
  precipAnualMm: number;
  /** Evaporación (o ETP, como proxy) anual en mm. Las filas de menos de 900 mm la necesitan. */
  evapAnualMm: number | null;
  /** Área de captación de ladera, en hectáreas. */
  areaHa: number;
  /** Textura del suelo del predio, si el análisis la trajo: sugiere la clase. */
  texturaSuelo?: { arcilla_pct: number; arena_pct: number } | null;
  /** El resultado del método principal, para poner los dos lado a lado. */
  comparar?: { label: string; m3: number } | null;
  /** Qué se está captando, para que el texto hable del caso. */
  queCapta?: string;
}

export function EscurrimientoTabla({
  precipAnualMm, evapAnualMm, areaHa, texturaSuelo = null, comparar = null,
  queCapta = 'la cuenca de aporte',
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [clase, setClase] = useState<SueloEscurrimiento>('areno_arcilloso');
  const [conf, setConf]   = useState<Confiabilidad>(8);

  // La textura llega después que el panel (el análisis de suelo es asincrónico),
  // así que la clase se autocompleta cuando aparece — pero sólo mientras el
  // usuario no la haya elegido a mano. Las dependencias son los dos números y no
  // el objeto: `texturaSuelo` se arma en el render del contenedor, así que
  // cambia de identidad en cada pasada aunque los valores sean los mismos.
  const elegidaAMano = useRef(false);
  const arcilla = texturaSuelo?.arcilla_pct ?? null;
  const arena   = texturaSuelo?.arena_pct ?? null;
  useEffect(() => {
    if (elegidaAMano.current || arcilla === null || arena === null) return;
    setClase(claseSueloSugerida(arcilla, arena).clase);
  }, [arcilla, arena]);

  const sugerida = useMemo(
    () => (arcilla !== null && arena !== null ? claseSueloSugerida(arcilla, arena) : null),
    [arcilla, arena],
  );

  const r = useMemo(() => escurrimientoAnual({
    precip_anual_mm: precipAnualMm,
    evap_anual_mm:   evapAnualMm,
    suelo:           clase,
    confiabilidad:   conf,
  }), [precipAnualMm, evapAnualMm, clase, conf]);

  // 1 mm de lámina sobre 1 ha son 10 m³. El rango se calcula de los extremos de
  // la celda y no del punto medio: mostrar sólo el promedio le daría al número
  // una precisión que la tabla no tiene.
  const m3 = (pct: number) => Math.round((pct / 100) * precipAnualMm * 10 * areaHa);
  const m3Min = m3(r.pct_min);
  const m3Max = m3(r.pct_max);

  // La comparación entre métodos es lo que hace útil a este bloque: si el
  // principal cae dentro del rango de la tabla, los dos caminos se dan la razón.
  const dentro = comparar ? comparar.m3 >= m3Min && comparar.m3 <= m3Max : null;

  return (
    <div className="border border-bone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center gap-1.5 px-2.5 py-2 bg-bone-50 hover:bg-bone-100 transition-colors text-left"
      >
        <TableProperties className="w-3 h-3 text-moss-700 shrink-0" />
        <span className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Segundo método · tabla 8.3</span>
        {!abierto && r.aplica && (
          <span className="ml-auto font-mono text-[10px] text-moss-700">
            {m3Min.toLocaleString('es-AR')}–{m3Max.toLocaleString('es-AR')} m³
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-ink-700/40 transition-transform ${abierto ? 'rotate-180' : ''} ${!abierto && r.aplica ? '' : 'ml-auto'}`} />
      </button>

      {abierto && (
        <div className="p-2.5 space-y-2">
          <p className="text-[10px] text-ink-700/65 leading-relaxed">
            Otra manera de estimar lo mismo: en vez de un coeficiente de escorrentía, la tabla entra por la
            lluvia, la evaporación y la clase de suelo, y devuelve un rango.
          </p>

          <div className="flex items-center justify-between gap-2 bg-bone-50 rounded-lg px-2 py-1.5">
            <span className="text-[10px] text-ink-700/60 shrink-0">Suelo</span>
            <select
              value={clase}
              onChange={e => { elegidaAMano.current = true; setClase(e.target.value as SueloEscurrimiento); }}
              className="text-[10px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500 max-w-[62%]"
            >
              {SUELOS_ESCURRIMIENTO.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 bg-bone-50 rounded-lg px-2 py-1.5">
            <span className="text-[10px] text-ink-700/60 shrink-0">Confiabilidad</span>
            <div className="flex gap-1">
              {([8, 9] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setConf(c)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    conf === c ? 'bg-moss-700 border-moss-700 text-bone-50' : 'bg-white border-bone-200 text-ink-700/70 hover:border-moss-500'
                  }`}
                >
                  {c} de 10 años
                </button>
              ))}
            </div>
          </div>

          {!r.aplica ? (
            <p className="text-[10px] text-clay-700 leading-relaxed bg-clay-100 rounded-lg px-2 py-1.5">{r.motivo}</p>
          ) : (
            <>
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-ink-700/50">Escurrimiento anual de {queCapta}</p>
                <p className="font-mono text-base font-bold text-moss-700 leading-tight">
                  {m3Min.toLocaleString('es-AR')} – {m3Max.toLocaleString('es-AR')} <span className="text-xs font-sans font-normal text-ink-700/60">m³/año</span>
                </p>
                <p className="text-[9px] text-ink-700/55 mt-0.5">
                  {r.pct_min}–{r.pct_max}% de la lluvia · {Math.round(r.lamina_mm)} mm de lámina en el punto medio · {areaHa.toLocaleString('es-AR')} ha
                </p>
              </div>

              {comparar && (
                <div className={`rounded-lg px-2 py-1.5 text-[10px] leading-relaxed border ${
                  dentro ? 'bg-moss-50 border-moss-200 text-ink-700/75' : 'bg-clay-100 border-clay-200 text-clay-700'
                }`}>
                  {dentro
                    ? <>El {comparar.label} da {comparar.m3.toLocaleString('es-AR')} m³ y cae dentro de este rango: los dos métodos se dan la razón.</>
                    : <>El {comparar.label} da {comparar.m3.toLocaleString('es-AR')} m³, {comparar.m3 > m3Max ? 'por encima' : 'por debajo'} de lo que da la tabla. No quiere decir que uno esté mal: quiere decir que el número todavía no está firme y conviene mirar el campo antes de dimensionar la obra.</>}
                </div>
              )}

              {sugerida && !elegidaAMano.current && (
                <p className="text-[9px] text-ink-700/50 leading-relaxed">{sugerida.nota}</p>
              )}
              {r.nota && <p className="text-[9px] text-ink-700/50 leading-relaxed whitespace-pre-line">{r.nota}</p>}
            </>
          )}

          <p className="text-[9px] text-ink-700/45 italic leading-relaxed">{r.fuente}</p>
        </div>
      )}
    </div>
  );
}
