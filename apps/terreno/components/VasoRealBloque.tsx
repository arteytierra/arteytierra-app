'use client';

/**
 * El vaso real, al lado del vaso dibujado.
 *
 * Mientras los dos cálculos convivan —el paso 2 del plan
 * `PLAN-embalse-vaso-real.md`— este bloque es el que permite validarlos con
 * predios de verdad: muestra el mismo nivel de agua medido de las dos formas y
 * **escribe la diferencia**. Si discrepan mucho, eso mismo es información, y
 * hay dos lecturas posibles según el signo: o el usuario dibujó de menos y el
 * muro inunda una hoya que él no vio, o dibujó de más y parte de lo que trazó
 * no se moja.
 *
 * Y trae un número que la pestaña no tenía: **la cota de derrame**, que es la
 * respuesta a «¿hasta dónde puedo llenar esto?». El tope del slider de nivel
 * dice hoy «borde» y es la celda más alta del polígono, o sea una ladera; el
 * límite físico es la silla de montar más baja del contorno que no sea el muro.
 * Mientras el principal siga siendo el cálculo por polígono, acá al menos el
 * número está, con el punto marcado.
 *
 * Acá no se calcula nada: todo sale de `lib/vaso.ts`.
 */

import { Info, TriangleAlert, ArrowDownToLine } from 'lucide-react';
import { compararConPoligono, type Vaso, type NivelVaso } from '@/lib/vaso';
import type { ResultadoEmbalse } from '@/lib/cutfill';

const n0 = (v: number) => Math.round(v).toLocaleString('es-AR');
const ha = (m2: number) => (m2 / 10_000).toLocaleString('es-AR', { maximumFractionDigits: 2 });

export interface Props {
  vaso:  Vaso;
  /** El vaso real al nivel de agua que el usuario está mirando. */
  nivelVaso: NivelVaso;
  /** El mismo nivel, calculado como se calculaba hasta ahora. */
  res:   ResultadoEmbalse;
  nivel: number;
}

export function VasoRealBloque({ vaso, nivelVaso: nv, res, nivel }: Props) {
  const cmp = compararConPoligono({
    nivelMuro: nv,
    volumenPoligono_m3: res.volumen_m3,
    areaPoligono_m2: res.area_inundada_m2,
  });

  const derrama = nv.derrama;
  const margen = vaso.cotaDerrame_m - nivel;

  return (
    <details className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <summary className="cursor-pointer select-none px-3 py-2 flex items-baseline justify-between gap-2 hover:bg-bone-50">
        <span className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">
          El vaso que encuentra el terreno
        </span>
        <span className="shrink-0 font-mono text-[10px] font-bold text-ink-900">
          {n0(nv.volumen_m3)} m³
          <span className="ml-1 font-normal text-ink-700/45">
            ({cmp.razonVolumen.toLocaleString('es-AR', { maximumFractionDigits: 2 })}× el dibujado)
          </span>
        </span>
      </summary>

      <div className="px-3 pb-3 space-y-2.5 border-t border-bone-200 pt-2">
        {/* ── Los dos cálculos, al mismo nivel ── */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="bg-bone-50 rounded px-2 py-1">
            <span className="text-ink-700/50">Vaso real · agua</span><br />
            <span className="font-mono font-bold text-ink-900">{n0(nv.volumen_m3)} m³</span>
          </div>
          <div className="bg-bone-50 rounded px-2 py-1">
            <span className="text-ink-700/50">Polígono · agua</span><br />
            <span className="font-mono font-bold text-ink-900">{n0(res.volumen_m3)} m³</span>
          </div>
          <div className="bg-bone-50 rounded px-2 py-1">
            <span className="text-ink-700/50">Vaso real · espejo</span><br />
            <span className="font-mono font-bold text-ink-900">{ha(nv.area_inundada_m2)} ha</span>
          </div>
          <div className="bg-bone-50 rounded px-2 py-1">
            <span className="text-ink-700/50">Polígono · espejo</span><br />
            <span className="font-mono font-bold text-ink-900">{ha(res.area_inundada_m2)} ha</span>
          </div>
        </div>

        <p className="text-[10px] text-ink-700/70 leading-relaxed">{cmp.lectura}</p>

        {/* ── Hasta dónde se puede llenar ── */}
        <div className="border-t border-bone-200 pt-2 space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold text-ink-900 flex items-center gap-1">
              <ArrowDownToLine className="w-3 h-3 text-water-500" />
              {vaso.tipoTope === 'derrame' ? 'Cota de derrame' : 'Límite del relieve disponible'}
            </span>
            <span className="shrink-0 font-mono text-[10px] font-bold text-ink-900">
              {vaso.cotaDerrame_m.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m
            </span>
          </div>
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            {vaso.tipoTope === 'derrame'
              ? <>Por encima de esa cota el agua se va por la silla de montar más baja del contorno y el embalse
                  no existe. Ahí va el vertedero: el punto está marcado en el mapa.
                  {!derrama && margen >= 0 && <> Al nivel actual quedan {margen.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m de margen.</>}</>
              : <>El vaso llega al límite de la ventana de relieve antes de encontrar por dónde derramar, así que esa
                  cota es lo que el modelo alcanza a ver y no la cota de derrame del terreno.</>}
          </p>
          {derrama && (
            <p className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
              <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
              <span>
                El nivel de agua que estás mirando está por encima de ese tope: el agua se iría antes de llegar ahí.
                El volumen del vaso real que figura arriba es el de un embalse que no se puede llenar tanto.
              </span>
            </p>
          )}
        </div>

        {/* ── La profundidad que manda la altura del muro ── */}
        <div className="border-t border-bone-200 pt-2 grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="bg-bone-50 rounded px-2 py-1">
            <span className="text-ink-700/50">Prof. contra el muro</span><br />
            <span className="font-mono font-bold text-ink-900">{nv.profEnMuro_m} m</span>
          </div>
          <div className="bg-bone-50 rounded px-2 py-1">
            <span className="text-ink-700/50">Prof. máxima del vaso</span><br />
            <span className="font-mono font-bold text-ink-900">{nv.prof_max_m} m</span>
          </div>
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          No son el mismo número y el que decide la altura del muro es el primero. En un cuello de botella con hoya,
          el punto más hondo del vaso está lejos del muro; el muro sólo tiene que llegar al pelo de agua que toca su
          cara interna. El dimensionamiento de abajo todavía usa la profundidad máxima, que lo engorda.
        </p>

        {vaso.advertencias.map((a, i) => (
          <p key={i} className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
            <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
            <span>{a}</span>
          </p>
        ))}

        <p className="text-[9px] text-ink-700/45 leading-relaxed flex gap-1 border-t border-bone-200 pt-2">
          <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
          <span>
            El vaso real se inunda desde el muro con el método Priority-Flood (Barnes, Lehman y Mulla, 2014:
            <i> Computers &amp; Geosciences</i> 62: 117–127) sobre {n0(vaso.celdas.length)} celdas de{' '}
            {vaso.paso_m.toLocaleString('es-AR', { maximumFractionDigits: 0 })} m. El polígono dibujado no define el
            volumen: define de qué lado del muro está el agua. <b>Los dos números se muestran juntos a propósito</b>,
            hasta validar el nuevo con predios medidos; el que sigue alimentando el movimiento de tierra y la
            simulación anual es el del polígono.
          </span>
        </p>
      </div>
    </details>
  );
}
