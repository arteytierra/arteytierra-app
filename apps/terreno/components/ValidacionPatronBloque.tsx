'use client';

import { useState } from 'react';
import { ChevronDown, Info, TriangleAlert, Compass, Droplets, Ruler } from 'lucide-react';
import type { ValidacionPatron, VeredictoFila } from '@/lib/validacionPatron';
import { D8_ERROR_MAX_DEG, D8_SEPARACION_DEG, EL_PROMEDIO_ESCONDE_LA_FILA, leerValidacion } from '@/lib/validacionPatron';
import type { BandaDeriva, ResumenPatron } from '@/lib/keylineGeometria';

/**
 * El patrón, verificado contra el terreno surco por surco.
 *
 * Va debajo del veredicto del conjunto a propósito: lo primero que hace es
 * poner al lado de ese veredicto —que promedia largos— el conteo por fila, que
 * es lo que el estándar limita. Las clases de Tailwind van literales porque el
 * compilador sólo ve strings literales.
 */
interface Props {
  validacion: ValidacionPatron | null;
  banda: BandaDeriva;
  resumen: ResumenPatron;
}

const FILA: Record<VeredictoFila, { rotulo: string; clase: string; corto: string }> = {
  drena:          { rotulo: 'drena',             clase: 'bg-moss-100 text-moss-800',  corto: 'drena' },
  no_medible:     { rotulo: 'no se puede medir', clase: 'bg-bone-200 text-ink-700',   corto: 'sin dato' },
  sin_drenaje:    { rotulo: 'debajo del piso',   clase: 'bg-sun-200 text-clay-800',   corto: 'piso' },
  excede:         { rotulo: 'pasa el techo',     clase: 'bg-clay-100 text-clay-800',  corto: 'techo' },
  a_la_vertiente: { rotulo: 'va a la vertiente', clase: 'bg-clay-100 text-clay-800',  corto: 'vertiente' },
  encharca:       { rotulo: 'encharca',          clase: 'bg-clay-100 text-clay-800',  corto: 'encharca' },
};

const ORDEN: VeredictoFila[] = ['encharca', 'a_la_vertiente', 'excede', 'sin_drenaje', 'no_medible', 'drena'];

export function ValidacionPatronBloque({ validacion, banda, resumen }: Props) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const [porQue, setPorQue] = useState(false);

  if (!validacion) {
    return (
      <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1 border-t border-bone-200 pt-2">
        <Info className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />
        No se pudo medir ninguna fila contra el terreno: sin eso acequia no inventa un veredicto por surco.
      </p>
    );
  }

  const v = validacion;
  const esconde = v.filasFuera > 0 && resumen.veredicto === 'keyline';

  return (
    <div className="border-t border-bone-200 pt-2 space-y-2">
      <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Lo que el terreno dice, fila por fila</p>
      <p className="text-[10px] text-ink-700/55 leading-relaxed">
        Arriba está lo que el patrón <b>dice</b> que hace, promediado sobre todas las líneas. Acá se fue a
        <b> verificar</b> surco por surco: por dónde baja cada uno, dónde entrega el agua y adónde va esa agua
        después, con la dirección resuelta por facetas triangulares —que no redondea a ocho rumbos—.
      </p>

      <div className="flex flex-wrap gap-1">
        {ORDEN.filter(k => v.conteo[k] > 0).map(k => (
          <span key={k} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${FILA[k].clase}`}>
            {v.conteo[k]} {FILA[k].rotulo}
          </span>
        ))}
      </div>

      {esconde && (
        <p className="text-[10px] text-clay-700/90 leading-relaxed flex gap-1 bg-clay-50 rounded-lg px-2 py-1.5">
          <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5" />
          <span>
            El veredicto de arriba dice que el patrón está bien y <b>{v.filasFuera} fila(s) no lo están</b>. No es una
            contradicción: ese veredicto suma largos y éste cuenta surcos. {EL_PROMEDIO_ESCONDE_LA_FILA}
          </span>
        </p>
      )}

      <p className="text-[10px] text-ink-700/70 leading-relaxed">{leerValidacion(v)}</p>

      <div className="rounded-lg border border-bone-200 overflow-hidden">
        {v.filas.map(f => (
          <div key={f.i} className="border-b border-bone-100 last:border-b-0">
            <button
              onClick={() => setAbierta(abierta === f.i ? null : f.i)}
              className="w-full flex items-center gap-2 px-2 py-1 text-[10px] hover:bg-bone-50 transition-colors text-left"
            >
              <span className="font-mono text-ink-700/45 w-8 shrink-0">#{f.i + 1}</span>
              <span className="font-mono text-ink-900 w-14 shrink-0">{f.largo_m.toFixed(0)} m</span>
              <span className="font-mono text-ink-900 w-14 shrink-0">
                {f.medible ? `${f.deriva_max_pct.toFixed(2)} %` : '—'}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full font-semibold ${FILA[f.veredicto].clase}`}>
                {FILA[f.veredicto].corto}
              </span>
              <ChevronDown className={`w-3 h-3 ml-auto shrink-0 text-ink-700/40 transition-transform ${abierta === f.i ? 'rotate-180' : ''}`} />
            </button>
            {abierta === f.i && (
              <div className="px-2 pb-2 space-y-1.5 bg-bone-50">
                <p className="text-[10px] text-ink-700/75 leading-relaxed">{f.motivo}</p>
                <div className="grid grid-cols-3 gap-1 text-[9px]">
                  <div className="bg-white rounded px-1.5 py-1">
                    <span className="text-ink-700/45">Desnivel</span><br />
                    <span className="font-mono font-bold text-ink-900">{f.desnivel_m.toFixed(2)} m</span>
                  </div>
                  <div className="bg-white rounded px-1.5 py-1">
                    <span className="text-ink-700/45">Tramos</span><br />
                    <span className="font-mono font-bold text-ink-900">{f.ramas}</span>
                  </div>
                  <div className="bg-white rounded px-1.5 py-1">
                    <span className="text-ink-700/45">Mínimo medible</span><br />
                    <span className="font-mono font-bold text-ink-900">{f.resolucion_pct.toFixed(2)} %</span>
                  </div>
                </div>
                {f.sumideros.length > 0 && (
                  <p className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
                    <Droplets className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                    <span>
                      {f.sumideros.length} punto(s) bajo(s) adentro del surco. El más hondo pide{' '}
                      {Math.max(...f.sumideros.map(s => s.prominencia_m)).toFixed(2)} m de agua para rebalsar.
                    </span>
                  </p>
                )}
                {f.destinos.map((d, k) => (
                  <p key={k} className="text-[9px] text-ink-700/60 leading-relaxed flex gap-1">
                    <Compass className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                    <span>
                      {d.final === 'eje_de_valle'
                        ? `El agua que sale por acá baja ${d.largo_m} m y se mete en el eje de un valle (${d.caida_m.toFixed(1)} m de caída).`
                        : d.final === 'borde'
                          ? `El agua que sale por acá recorre ${d.largo_m} m y se va del terreno relevado.`
                          : d.final === 'sin_pendiente'
                            ? `El agua que sale por acá se queda sin pendiente a los ${d.largo_m} m: un llano o un hoyo del modelo.`
                            : `El agua que sale por acá sigue bajando más allá de los ${d.largo_m} m que se miraron.`}
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[9px] text-ink-700/50">
        <Ruler className="w-2.5 h-2.5 shrink-0" />
        <span>
          Banda {banda.min_pct.toFixed(1)}–{banda.max_pct.toFixed(2)} % · el modelo resuelve{' '}
          {v.resolucion_m.toFixed(1)} m de desnivel
          {v.largoParaElPiso_m !== null && <> · el piso necesita {v.largoParaElPiso_m} m de surco</>}
          {v.sesgoD8 && <> · D8 se desvía {v.sesgoD8.desvio_medio_deg.toFixed(1)}° de media acá</>}
        </span>
      </div>

      {v.advertencias.map((a, i) => (
        <p key={i} className="text-[9px] text-ink-700/60 leading-relaxed flex gap-1">
          <Info className="w-2.5 h-2.5 mt-[2px] shrink-0 text-water-500" />
          <span>{a}</span>
        </p>
      ))}

      <button
        onClick={() => setPorQue(!porQue)}
        className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-ink-700/50 hover:text-moss-700 transition-colors"
      >
        Por qué se mide así
        <ChevronDown className={`w-3 h-3 transition-transform ${porQue ? 'rotate-180' : ''}`} />
      </button>
      {porQue && (
        <div className="space-y-1.5 text-[9px] text-ink-700/65 leading-relaxed bg-bone-50 rounded-lg p-2">
          <p>
            <b>Por facetas triangulares y no por ocho rumbos.</b> El «hacia qué lado» del veredicto de arriba sale de
            una acumulación de flujo que manda toda el agua de cada celda a uno de sus ocho vecinos, separados por{' '}
            {D8_SEPARACION_DEG}°: una ladera que mira al {D8_ERROR_MAX_DEG}° se resuelve como si mirara al 0 o al 45.
            El método de las ocho facetas arma planos exactos por tres puntos y devuelve un ángulo continuo.
          </p>
          <p>
            <b>Fila por fila y no un promedio.</b> El estándar limita el grado de <i>cada</i> surco. Un surco entero
            fuera de grado pesa 1/N del largo del patrón, así que con 40 líneas diez pueden estar enteras fuera y el
            conjunto sigue leyéndose bien.
          </p>
          <p>
            <b>Un surco puede tener toda su deriva en la banda y no desaguar.</b> Si baja hacia un punto de su propio
            recorrido, el agua se junta ahí. Por eso se mira el perfil entero y no el valor absoluto de cada tramo.
          </p>
          <p>
            <b>Y hay un piso que no es del método, es del dato.</b> Con {v.resolucion_m.toFixed(1)} m de resolución
            vertical, una deriva chica no se distingue de cero hasta que el surco es largo. Cuando no se distingue,
            acequia no imprime el número: dice que no lo puede medir.
          </p>
          {v.fuentes.map((f, i) => <p key={i} className="text-ink-700/50">{f}</p>)}
        </div>
      )}
    </div>
  );
}
