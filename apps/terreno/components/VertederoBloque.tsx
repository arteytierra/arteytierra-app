'use client';

/**
 * De qué lado va el vertedero.
 *
 * Es el paso 3 del método de diseño de la clase 9 y la app no lo tenía: ponía
 * 0,3 m de carga sobre el vertedero por defecto y seguía de largo. Elegir el
 * lado no es un detalle de dibujo —decide si hay que excavar un canal o no, si
 * el vertido vuelve al cauce o se encharca al pie del muro, y la pendiente del
 * terreno natural con la que AH-590 entra a su cuadro 10 para dar la carga, que
 * es uno de los tres términos de la cota de coronamiento—.
 *
 * Acá no se calcula nada: todo sale de `lib/ladoDeObra.ts`.
 */

import { Info, TriangleAlert, Check, ArrowRightFromLine } from 'lucide-react';
import type { LadoVertedero, CandidatoVertedero } from '@/lib/ladoDeObra';

const APTITUD: Record<CandidatoVertedero['pendiente']['aptitud'], { rotulo: string; clase: string }> = {
  natural:        { rotulo: 'sirve sin excavar',  clase: 'text-moss-700' },
  excavado:       { rotulo: 'hay que excavarlo',  clase: 'text-water-700' },
  fuera_de_tabla: { rotulo: 'muy empinado',       clase: 'text-clay-700' },
  sin_drenaje:    { rotulo: 'no drena',           clase: 'text-clay-700' },
};

const CORTE: Record<CandidatoVertedero['camino']['motivoCorte'], string> = {
  cauce:          'vuelve al cauce',
  hoya:           'se encharca antes',
  borde_del_dem:  'sin dato más allá',
};

export interface Props {
  vertedero: LadoVertedero;
  /** Rótulos de las dos puntas del muro, tal como las ve el usuario. */
  rotuloA?: string;
  rotuloB?: string;
}

export function VertederoBloque({ vertedero: v, rotuloA = 'Punta A', rotuloB = 'Punta B' }: Props) {
  const rotulo = (e: 'a' | 'b') => (e === 'a' ? rotuloA : rotuloB);
  const elegido = v.recomendado
    ? rotulo(v.recomendado)
    : v.empate ? 'empatan' : 'ninguna';

  return (
    <details className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <summary className="cursor-pointer select-none px-3 py-2 flex items-baseline justify-between gap-2 hover:bg-bone-50">
        <span className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">
          De qué lado va el vertedero
        </span>
        <span className="shrink-0 font-mono text-[10px] font-bold text-ink-900">{elegido}</span>
      </summary>

      <div className="px-3 pb-3 space-y-2.5 border-t border-bone-200 pt-2">
        {/* ── Las dos puntas, con sus dos números ── */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {v.candidatos.map(c => {
            const ap = APTITUD[c.pendiente.aptitud];
            const esta = v.recomendado === c.extremo;
            return (
              <div
                key={c.extremo}
                className={`rounded px-2 py-1.5 border ${
                  esta ? 'border-moss-700 bg-moss-50' : c.descartado ? 'border-clay-200 bg-clay-50/40' : 'border-bone-200 bg-bone-50'
                }`}
              >
                <span className="text-ink-700/60 flex items-center gap-1">
                  {esta && <Check className="w-2.5 h-2.5 text-moss-700" />}
                  {rotulo(c.extremo)}
                </span>
                <span className="font-mono font-bold text-ink-900">
                  {c.camino.pendiente_media_pct.toLocaleString('es-AR', { maximumFractionDigits: 2 })} %
                </span>
                <span className="text-ink-700/45"> · {c.camino.largo_m} m</span>
                <br />
                <span className={`${ap.clase} font-medium`}>{ap.rotulo}</span>
                <span className="text-ink-700/40"> · {CORTE[c.camino.motivoCorte]}</span>
              </div>
            );
          })}
        </div>

        {v.lectura && <p className="text-[10px] text-ink-700/70 leading-relaxed">{v.lectura}</p>}

        {/* ── Por qué estos dos números y no otros ── */}
        <p className="text-[9px] text-ink-700/55 leading-relaxed flex gap-1 border-t border-bone-200 pt-2">
          <ArrowRightFromLine className="w-2.5 h-2.5 mt-[2px] shrink-0 text-water-500" />
          <span>
            Los dos criterios son los de la fuente y en ese orden: primero la <b>pendiente</b>, porque es la que
            decide si el vertido encárcava, y después el <b>recorrido hasta el cauce</b>, que es costo. El recorrido
            se mide siguiendo el agua sobre el relieve desde cada punta hasta el curso que la represa interrumpe, y
            el camino del lado elegido se dibuja en el mapa: lo que hay que mirar es si el agua va para donde dice.
          </span>
        </p>

        {v.candidatos.some(c => c.pendiente.advertencias.length > 0) && (
          <div className="space-y-1">
            {v.candidatos.flatMap(c =>
              c.pendiente.advertencias.map((a, i) => (
                <p key={`${c.extremo}-${i}`} className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
                  <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                  <span><b>{rotulo(c.extremo)}:</b> {a}</span>
                </p>
              )))}
          </div>
        )}

        {v.advertencias.map((a, i) => (
          <p key={i} className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
            <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
            <span>{a}</span>
          </p>
        ))}

        <p className="text-[9px] text-ink-700/45 leading-relaxed flex gap-1 border-t border-bone-200 pt-2">
          <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
          <span>
            Lo que se mide es la pendiente del <b>terreno alrededor</b> de cada punta, no la del canal: con celdas de
            relieve de decenas de metros un canal de vertedero no existe en el modelo. Sirve para comparar las dos
            puntas entre sí, que es la pregunta de este paso; el vertedero se dimensiona aparte y el ancho se
            releva a campo. Fuentes: {v.fuentes.join(' · ')}.
          </span>
        </p>
      </div>
    </details>
  );
}
