/**
 * «Dónde no va» — las exclusiones del emplazamiento, dentro del panel de Master
 * Plan.
 *
 * Vive acá y no en Topografía porque Topografía describe el terreno y esto
 * decide sobre él. Y va **antes** del botón que genera el master plan, porque la
 * pregunta que contesta es previa: de las hectáreas que tiene el predio,
 * cuántas admiten una construcción.
 *
 * Trabaja sobre la grilla densa —la que la app ya baja para las curvas de
 * nivel— y no sobre la grilla del shader, que son 10 × 10 celdas: con celdas de
 * sesenta metros no se puede aplicar un retiro de diez. Ver `lib/emplazamiento.ts`.
 *
 * ── Qué se muestra y qué no (10/10/2026) ──────────────────────────────────
 *
 * El bloque tenía cinco párrafos de explicación a la vista y Jonatan no podía
 * decir qué función cumplían. Tenía razón en el diagnóstico y la causa es ésta:
 * de las cuatro cajas que había, **dos movían el número de arriba y dos no**, y
 * nada en la pantalla las distinguía. Leídas todas iguales, las cuatro parecían
 * texto informativo.
 *
 * Ahora quedan sólo las que deciden, y se ven como lo que son —dos controles—:
 *
 *   • el **retiro del curso de agua** elige la regla `buffer_cauce`, y entre el
 *     primer escalón y el último hay un factor 4,7 sobre la misma orilla;
 *   • el **límite de pendiente del camino** elige la regla `sin_camino`.
 *
 * Se fueron dos. La **plataforma del edificio** (ancho × largo) no excluía
 * nada: producía un requisito —cuánta tierra hay que mover— y el panel de Zonas
 * ya lo calcula con el tamaño por defecto. El **campo de infiltración** no
 * entraba siquiera al contexto: se calculaba y se imprimía. `campoDeInfiltracion`
 * sigue en `lib/emplazamiento.ts` con sus fuentes, lista para volver el día que
 * el desagüe cloacal tenga su propia herramienta o su capítulo en el manual.
 *
 * El desarrollo de los dos controles está detrás de «por qué», que es donde esta
 * app pone el matiz desde que existe `Cautela`.
 */
'use client';

import { useMemo, useState } from 'react';
import { Ban, Route, Waves } from 'lucide-react';
import {
  BUFFERS_CAUCE,
  FUENTE_CPS391,
  FUENTE_CPS560,
  FUENTE_EPA_OWTS,
  FUENTE_MD92,
  FUENTE_COPDEM,
  LA_NORMA_LOCAL_MANDA,
  PENDIENTE_CAMINO_MAX_PCT,
  PENDIENTE_CAMINO_NORMAL_PCT,
  areaParaCauce,
  bufferCauce,
  factorEscaleraBuffer,
  prepararEmplazamiento,
  resumenEmplazamiento,
  type PropositoBuffer,
} from '@/lib/emplazamiento';
import type { GrillaElevacion } from '@/lib/grillaElevacion';

interface Props {
  grilla: GrillaElevacion | null;
  acceso: { lat: number; lng: number } | null;
}

const n0 = (v: number) => Math.round(v).toLocaleString('es-AR');
const n1 = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 1 });

export function EmplazamientoBloque({ grilla, acceso }: Props) {
  const [proposito, setProposito] = useState<PropositoBuffer>('sedimento');
  const [limite, setLimite] = useState(PENDIENTE_CAMINO_NORMAL_PCT);
  const [porQue, setPorQue] = useState(false);

  const ctx = useMemo(
    () => (grilla
      ? prepararEmplazamiento(grilla, acceso, { buffer: proposito, camino_limite_pct: limite })
      : null),
    [grilla, acceso, proposito, limite],
  );

  const resumen = useMemo(() => (ctx ? resumenEmplazamiento(ctx) : null), [ctx]);

  if (!grilla) {
    return (
      <div className="bg-white rounded-xl border border-bone-200 px-3 py-2.5 space-y-1">
        <p className="text-[11px] font-medium text-ink-700 flex items-center gap-1.5">
          <Ban className="w-3 h-3 text-clay-700" /> Dónde no va
        </p>
        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          Hace falta el relieve fino del predio. Se baja solo al prender las curvas de nivel o al
          calcular la topografía: la grilla del master plan son 10 × 10 celdas y con eso no se puede
          medir un retiro de diez metros.
        </p>
      </div>
    );
  }

  if (!ctx || !resumen) {
    return (
      <div className="bg-white rounded-xl border border-bone-200 px-3 py-2.5">
        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          El relieve de este predio tiene menos de veinte nodos con dato: por debajo de eso la
          acumulación no describe un terreno, describe el recorte.
        </p>
      </div>
    );
  }

  const ancho_buffer = bufferCauce(proposito);
  const pctLibre = resumen.celdas_total > 0
    ? (resumen.celdas_libres / resumen.celdas_total) * 100
    : 0;

  return (
    <div className="bg-white rounded-xl border border-bone-200 px-3 py-2.5 space-y-2.5">
      <p className="text-[11px] font-medium text-ink-700 flex items-center gap-1.5">
        <Ban className="w-3 h-3 text-clay-700" /> Dónde no va
      </p>

      {/* ── Cuánto predio queda ── */}
      <div className="bg-sun-300/15 border border-sun-300/60 rounded-lg px-2.5 py-2 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] text-ink-700/70">Superficie que admite construir</span>
          <span className="font-mono text-sm font-bold text-ink-900">
            {n1(resumen.superficie_libre_ha)} de {n1(resumen.superficie_total_ha)} ha
          </span>
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          El {n0(pctLibre)} % del predio, medido sobre la grilla densa con un paso de{' '}
          <b>{n1(resumen.paso_m)} m</b>. Son reglas de sí o no, no un puntaje.
        </p>
      </div>

      {resumen.paso_m > 15 && (
        <p className="text-[9px] text-clay-700 leading-relaxed bg-clay-700/5 border border-clay-700/20 rounded-lg px-2 py-1.5">
          Este cálculo está corriendo sobre la grilla gruesa, con celdas de{' '}
          <b>{n1(resumen.paso_m)} m</b>, y el retiro más chico que pide la norma mide{' '}
          {n1(bufferCauce('sedimento').m)} m: no se puede medir un retiro de diez metros con una
          regla de {n0(resumen.paso_m)}. Prendé las <b>curvas de nivel</b> en el mapa y la app baja
          el relieve fino; el bloque se recalcula solo.
        </p>
      )}

      {/* ── Qué regla saca qué ── */}
      {resumen.por_regla.length > 0 ? (
        <div className="space-y-1">
          <span className="text-[10px] text-ink-700/70">Qué saca cada regla</span>
          {resumen.por_regla.map(r => (
            <div key={r.regla} className="flex items-center gap-2">
              <span className="text-[10px] text-ink-800 flex-1 truncate">{r.titulo}</span>
              <div className="h-1.5 w-20 bg-bone-200 rounded-full overflow-hidden">
                <div className="h-full bg-clay-700/70 rounded-full"
                  style={{ width: `${Math.min(100, r.pct)}%` }} />
              </div>
              <span className="font-mono text-[10px] text-ink-900 w-10 text-right">{n1(r.pct)} %</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          Ninguna regla descarta nada en este predio.
        </p>
      )}

      {/* ── Los dos controles ──
          Van juntos y debajo del número que mueven, no como dos capítulos
          separados: lo que se ve arriba cambia al tocarlos, y ése es todo el
          sentido de que estén. */}
      <div className="space-y-1.5 border-t border-bone-200 pt-2">
        <span className="text-[10px] text-ink-700/70">Las dos reglas se pueden cambiar</span>

        <label className="flex items-center gap-2">
          <span className="text-[10px] text-ink-700/80 flex items-center gap-1 w-24 shrink-0">
            <Waves className="w-3 h-3 text-[#1565C0]" /> Retiro del cauce
          </span>
          <select
            value={proposito}
            onChange={e => setProposito(e.target.value as PropositoBuffer)}
            className="flex-1 min-w-0 px-2 py-1 text-[10px] rounded-lg border border-bone-200 bg-white"
          >
            {BUFFERS_CAUCE.map(b => (
              <option key={b.id} value={b.id}>
                {n1(b.m)} m — {b.para}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-[10px] text-ink-700/80 flex items-center gap-1 w-24 shrink-0">
            <Route className="w-3 h-3 text-clay-700" /> Camino hasta
          </span>
          <div className="flex-1 flex gap-1">
            {[PENDIENTE_CAMINO_NORMAL_PCT, PENDIENTE_CAMINO_MAX_PCT].map(p => (
              <button key={p} onClick={() => setLimite(p)}
                className={`flex-1 px-2 py-1 rounded-lg border text-[10px] transition-colors ${
                  limite === p
                    ? 'bg-ink-950 text-bone-50 border-ink-950'
                    : 'bg-white text-ink-800 border-bone-200 hover:bg-bone-50'
                }`}>
                {p} % {p === PENDIENTE_CAMINO_NORMAL_PCT ? '(normal)' : '(tramos cortos)'}
              </button>
            ))}
          </div>
        </label>

        {!acceso && (
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            Marcá el <b>punto de acceso</b> al predio y la regla del camino se prende.
          </p>
        )}
      </div>

      {/* ── Si no hay cauces, decirlo ──
          Queda a la vista aunque sea texto: explica por qué una de las dos
          reglas aparece en cero, y un cero sin explicación se lee como «acá no
          hay problema». */}
      {ctx.celdas_cauce === 0 && (
        <p className="text-[9px] text-clay-700 leading-relaxed bg-clay-700/5 border border-clay-700/20 rounded-lg px-2 py-1.5">
          El criterio no encontró <b>ningún cauce</b> acá, así que no hay retiro aplicado. Con la
          pendiente mediana del predio ({n1(ctx.pend_mediana_pct)} %) harían falta{' '}
          <b>{n0(areaParaCauce(ctx.paso_m, Math.max(0.001, ctx.pend_mediana_pct / 100)) / 10_000)} ha</b>{' '}
          de cuenca para que se abra uno. Si hay una zanja o un arroyo a la vista, hay que marcarlo a
          mano: el umbral describe dónde el flujo concentra lo suficiente para incidir, no dónde hay
          agua.
        </p>
      )}

      {/* ── Por qué ── */}
      <button onClick={() => setPorQue(v => !v)}
        className="text-[10px] text-clay-700 hover:text-clay-800 underline underline-offset-2">
        {porQue ? 'Ocultar el por qué' : '¿Por qué estos números y no otros?'}
      </button>

      {porQue && (
        <div className="space-y-2 bg-bone-50 border border-bone-200 rounded-lg px-2.5 py-2">
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>Por qué hay un bloque de sí o no.</b> Un retiro de un curso de agua no es una
            penalización: es una prohibición. El puntaje del master plan sumaba y restaba y nunca
            descartaba nada, así que un lugar con buenos bonos se quedaba con la casa aunque
            estuviera adentro del retiro.
          </p>
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>El retiro no es un número.</b> Entre el primer escalón y el último hay un factor{' '}
            <b>{n1(factorEscaleraBuffer())}</b> sobre el mismo arroyo, según para qué se lo ponga:
            frenar sedimento pide {n1(bufferCauce('sedimento').m)} m y dar hábitat a mamíferos
            grandes pide {n1(bufferCauce('fauna_grande').m)} m. Y es <b>por orilla</b>: el corredor
            completo mide el doble. Ahora mismo se está aplicando <b>{n1(ancho_buffer.m)} m</b>, que
            es el de {ancho_buffer.para}.
          </p>
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>El camino, con el acceso marcado.</b> Un lugar «sin camino posible» no es uno al que
            no se llega derecho: es uno al que no se llega <b>ni dando vueltas</b> dentro del predio.
            Sobre un plano uniforme se puede subir en diagonal al 71 % de la pendiente del terreno, y
            por eso un predio del 14 % es totalmente accesible con el límite del 10 %. Una casa a la
            que no se puede llegar con un acoplado no está emplazada.
          </p>
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>Dónde empieza un cauce.</b> No por un umbral fijo de acumulación —el que la app usaba
            es relativo a la celda más cargada de la ventana, así que el mismo arroyo deja de ser
            arroyo cuando se agranda el recorte— sino por el criterio publicado: el área de aporte por
            unidad de curva de nivel, por la pendiente al cuadrado, pasando los 200 m. El área que
            abre un cauce baja con el <b>cuadrado</b> de la pendiente.
          </p>
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>La posición en el paisaje.</b> La fuente pide evitar vaguadas y depresiones y preferir
            laderas convexas. Dos laderas con <b>la misma pendiente</b> se comportan al revés según
            sean cóncavas o convexas, y una tabla que sólo mira pendiente no puede ver eso. El umbral
            de clase es la desviación típica del propio índice en este predio, no un número fijo.
          </p>
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>Lo que este bloque no puede resolver.</b> El retiro necesita metros y la fuente global
            de relieve da treinta: el borde de la banda tiene una incertidumbre de ±
            {n1(resumen.incertidumbre_borde_m)} m, que con un modelo global es más que el propio
            retiro mínimo. Y la pendiente de camino se juzga con el paso <b>efectivo</b>{' '}
            ({n1(ctx.paso_efectivo_m)} m), porque el error publicado está en metros y muestrear más
            fino la misma fuente la empeora en vez de mejorarla. Las dos reglas piden resoluciones
            opuestas y el mismo modelo no puede dar las dos; donde hay DEM nacional el problema
            desaparece.
          </p>
          <p className="text-[9px] text-ink-700/70 leading-relaxed">
            <b>Lo que no mira.</b> Napa freática, mancha de inundación de un río, amenaza sísmica,
            estabilidad de ladera, servidumbres, líneas de alta tensión y límites catastrales.
          </p>
          <p className="text-[9px] text-clay-700 leading-relaxed">{LA_NORMA_LOCAL_MANDA}</p>
          <div className="space-y-0.5 pt-1 border-t border-bone-200">
            {[FUENTE_CPS391, FUENTE_CPS560, FUENTE_EPA_OWTS, FUENTE_MD92, FUENTE_COPDEM].map(f => (
              <p key={f} className="text-[8px] text-ink-700/45 leading-snug">{f}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
