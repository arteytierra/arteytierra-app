'use client';

/**
 * Sombra para el ganado: cuánta, en qué meses y dónde.
 *
 * Lo único que esta pantalla decide es el orden en que se leen los números, y
 * ese orden importa: **primero la banda**, porque las tres tablas publicadas no
 * coinciden y mostrar un número solo sería elegir por el usuario sin decírselo.
 * Después con qué se construye, que es el presupuesto. Y al final dónde va, que
 * es la parte donde la regla publicada va al revés de la intuición.
 *
 * Todo el cálculo está en `lib/sombraGanado.ts`.
 */

import { useMemo, useState } from 'react';
import { Sun, TriangleAlert, Trees, MapPin } from 'lucide-react';
import {
  sombraDelRodeo, estructurasPortatiles, arbolesEquivalentes,
  mesesQuePidenSombra, umbralDelRodeo, sombraEnElPiso, ubicacionDeLaSombra,
  OPTIMO_VACA_FT2, FRAC_RODEO, UMBRAL_NOMBRE,
  PORTATIL_AEN99_PIE, PORTATIL_NRCS_PIE, CORTE_LUZ_MIN_PCT, BAJA_CARGA_TERMICA_PCT,
} from '@/lib/sombraGanado';
import type { Rodeo } from '@/lib/rodeo';
import type { MesDato } from '@/lib/clima';

const n0 = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 0 });
const n1 = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 1 });

export interface Props {
  rodeo: Rodeo;
  meses: readonly MesDato[] | null;
  lat: number;
}

export function SombraGanadoBloque({ rodeo, meses, lat }: Props) {
  const [copa, setCopa]     = useState(8);
  const [altura, setAltura] = useState(3);
  const [porQue, setPorQue] = useState(false);

  const sombra = useMemo(() => sombraDelRodeo(rodeo), [rodeo]);
  const umbral = useMemo(() => umbralDelRodeo(rodeo), [rodeo]);
  const clima  = useMemo(
    () => (meses && meses.length > 0 ? mesesQuePidenSombra(meses, umbral?.tipo ?? 'bovino_carne') : null),
    [meses, umbral],
  );
  const estruct = useMemo(() => estructurasPortatiles(sombra.aen99_m2), [sombra]);
  const arboles = useMemo(() => arbolesEquivalentes(sombra.aen99_m2, copa), [sombra, copa]);
  // El mes del pico es el que vale para la geometría: es el que manda la sombra.
  const piso = useMemo(
    () => (clima?.pico ? sombraEnElPiso(lat, clima.pico.mesIndex, altura) : null),
    [clima, lat, altura],
  );
  const ubic = useMemo(() => ubicacionDeLaSombra(), []);

  if (sombra.cabezasConFila === 0 && sombra.cabezasSinFila === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-2">
      <p className="text-[10px] font-semibold text-ink-700 flex items-center gap-1.5">
        <Sun className="w-3 h-3 text-sun-400" /> Sombra para el ganado
      </p>

      {sombra.cabezasConFila === 0 ? (
        <p className="text-[9px] text-clay-700 leading-relaxed">
          Ninguna de las categorías cargadas tiene superficie de sombra publicada en las tres tablas
          leídas, así que acá no hay número. {sombra.advertencias[0]}
        </p>
      ) : (
        <>
          {/* ── La banda, que es el número de diseño ── */}
          <div className="bg-sun-300/15 border border-sun-300/60 rounded-lg px-2.5 py-2 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] text-ink-700/70">
                Sombra que pide el rodeo <span className="text-ink-700/45">({sombra.cabezasConFila} cabezas)</span>
              </span>
              <span className="font-mono text-sm font-bold text-ink-900">
                {n1(sombra.aen99_m2[0])}–{n1(sombra.aen99_m2[1])} m²
              </span>
            </div>
            <p className="text-[9px] text-ink-700/55 leading-relaxed">
              La banda es de la fuente que las otras dos citan y la única que explica de dónde sale su
              tabla. Las otras dos publican <b>{n1(sombra.arizona_m2)} m²</b> y{' '}
              <b>{n1(sombra.nrcs_m2)} m²</b> para el mismo rodeo, y las dos se presentan como mínimo.
            </p>
            {sombra.optimo_m2 && (
              <p className="text-[9px] text-ink-700/55 leading-relaxed">
                Y lo que la misma publicación llama <b>óptimo</b> —{OPTIMO_VACA_FT2[0]}–{OPTIMO_VACA_FT2[1]} pies²
                por cabeza para vaca adulta a campo— son{' '}
                <b>{n1(sombra.optimo_m2[0])}–{n1(sombra.optimo_m2[1])} m²</b> para las{' '}
                {sombra.cabezasConOptimo} adultas. El número más alto de la banda de arriba es el más
                bajo de este óptimo: no es un techo, es donde el óptimo empieza.
              </p>
            )}
            <p className="text-[9px] text-ink-700/45 leading-relaxed">
              Si se le da sombra al {Math.round(FRAC_RODEO * 100)} % del rodeo y no a todo —que es lo que la
              fuente pide como mínimo para animales de alta producción— son{' '}
              {n1(sombra.parcial_m2[0])}–{n1(sombra.parcial_m2[1])} m².
            </p>
          </div>

          {/* ── Los meses ── */}
          {clima && (
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] text-ink-700/70">
                  Meses que la piden <span className="text-ink-700/45">(umbral {clima.umbral}, {UMBRAL_NOMBRE[clima.tipo].toLowerCase()})</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-ink-900">
                  {clima.piden.length} de {clima.meses.length}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-px">
                {clima.meses.map(m => {
                  const pide = m.thi > clima.umbral;
                  return (
                    <div key={m.mesIndex}
                      title={`${m.mes}: índice ${n1(m.thi)} · máxima ${n1(m.tmax_c)} °C · humedad a esa hora ${m.rh_pico_pct} %`}
                      className={`text-center py-0.5 rounded-sm ${pide ? 'bg-clay-200' : 'bg-bone-100'}`}>
                      <p className="text-[8px] text-ink-700/60 leading-none">{m.mes[0]}</p>
                      <p className={`text-[9px] font-mono leading-tight ${pide ? 'font-bold text-clay-800' : 'text-ink-700/45'}`}>
                        {Math.round(m.thi)}
                      </p>
                    </div>
                  );
                })}
              </div>
              {clima.pico && (
                <p className="text-[9px] text-ink-700/55 leading-relaxed">
                  El peor es {clima.pico.mes}, con índice {n1(clima.pico.thi)} —{n1(clima.margen_pico ?? 0)} puntos
                  arriba del umbral— con {n1(clima.pico.tmax_c)} °C de máxima media y{' '}
                  {clima.pico.rh_pico_pct} % de humedad <b>a esa hora</b>.
                  {clima.pico.thi_humedad_media !== null && (
                    <> Con la humedad media del día ({clima.pico.rh_media_pct} %) el índice daría{' '}
                      {n1(clima.pico.thi_humedad_media)}: ésa es la cuenta que sobreestima, porque la humedad
                      baja justo cuando sube la temperatura.</>
                  )}
                </p>
              )}
            </div>
          )}
          {!clima && (
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              Para decir en qué meses hace falta hay que cargar el clima del predio.
            </p>
          )}

          {/* ── Con qué se hace ── */}
          <div className="bg-bone-50 rounded-lg border border-bone-200 px-2.5 py-2 space-y-1.5">
            <p className="text-[10px] font-semibold text-ink-700/80">Con qué se hace esa sombra</p>
            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
              <div>
                <p className="text-ink-700/55">Sombras de {PORTATIL_AEN99_PIE[0]} × {PORTATIL_AEN99_PIE[1]} pies</p>
                <p className="font-mono text-[11px] font-bold text-ink-900">
                  {estruct.n_aen99[0]}–{estruct.n_aen99[1]}
                  <span className="ml-1 font-normal text-ink-700/45">de {n1(estruct.unidad_aen99_m2)} m²</span>
                </p>
              </div>
              <div>
                <p className="text-ink-700/55">O de {PORTATIL_NRCS_PIE[0]} × {PORTATIL_NRCS_PIE[1]} pies</p>
                <p className="font-mono text-[11px] font-bold text-ink-900">
                  {estruct.n_nrcs[0]}–{estruct.n_nrcs[1]}
                  <span className="ml-1 font-normal text-ink-700/45">de {n1(estruct.unidad_nrcs_m2)} m²</span>
                </p>
              </div>
            </div>
            <p className="text-[9px] text-ink-700/45 leading-relaxed">
              Los dos topes son publicados y miden cosas distintas: uno es lo que resiste el marco de
              caño y el otro lo que una persona puede mover entre potreros. La tela tiene que cortar al
              menos el {CORTE_LUZ_MIN_PCT} % de la luz; bien hecha, la sombra portátil baja la carga térmica
              del animal entre {BAJA_CARGA_TERMICA_PCT[0]} y {BAJA_CARGA_TERMICA_PCT[1]} %.
            </p>

            {arboles && (
              <div className="flex items-center gap-2 pt-1 border-t border-bone-200">
                <Trees className="w-3 h-3 text-moss-600 shrink-0" />
                <span className="text-[9px] text-ink-700/70 mr-auto">
                  O <b>{arboles.n[0]}–{arboles.n[1]} árboles</b> de copa madura de{' '}
                  <span className="font-mono">{n0(arboles.copa_m)}</span> m
                  <span className="text-ink-700/45"> ({n1(arboles.area_copa_m2)} m² cada uno)</span>
                </span>
                <input type="number" min={1} max={40} step={1} value={copa}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setCopa(Number.isFinite(v) && v > 0 ? v : 8);
                  }}
                  className="w-12 text-[10px] font-mono text-right bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
              </div>
            )}
            {arboles && (
              <p className="text-[9px] text-clay-700/90 leading-relaxed">{arboles.advertencias[0]}</p>
            )}
          </div>

          {/* ── Dónde cae ── */}
          {piso && (
            <div className="bg-bone-50 rounded-lg border border-bone-200 px-2.5 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-ink-700/80 mr-auto">
                  Dónde cae la sombra en {piso.mes}
                </span>
                <span className="text-[9px] text-ink-700/55">altura del techo</span>
                <input type="number" min={1} max={12} step={0.1} value={altura}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setAltura(Number.isFinite(v) && v > 0 ? v : 3);
                  }}
                  className="w-12 text-[10px] font-mono text-right bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
                <span className="text-[9px] text-ink-700/55">m</span>
              </div>
              <p className="text-[9px] text-ink-700/70 leading-relaxed">
                Al mediodía solar el sol está a {n0(piso.elevacion_mediodia)}° y la sombra queda{' '}
                <b>{piso.corrimiento_mediodia_m === null ? '—' : `${n1(piso.corrimiento_mediodia_m)} m`}</b> corrida.
                Tres horas después el sol está a {n0(piso.elevacion_tarde)}° y la sombra está a{' '}
                <b>{piso.corrimiento_tarde_m === null ? '—' : `${n1(piso.corrimiento_tarde_m)} m`}</b>, hacia el
                este. La máxima de temperatura del aire llega después del mediodía, así que la sombra que el
                animal usa es la segunda: si el techo es angosto, a esa hora no está debajo de la estructura.
              </p>
              {sombra.alturaMin_m !== null && (
                <p className="text-[9px] text-ink-700/45 leading-relaxed">
                  La altura mínima libre que publica la fuente para esta hacienda es{' '}
                  {n1(sombra.alturaMin_m)} m, y no es por la cabeza del animal: es para que el aire corra.
                </p>
              )}
            </div>
          )}

          {/* ── Dónde va ── */}
          <div className="bg-bone-50 rounded-lg border border-bone-200 px-2.5 py-2 space-y-1">
            <p className="text-[10px] font-semibold text-ink-700/80 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-water-600" /> Dónde va
            </p>
            {ubic.reglas.map((r, i) => (
              <p key={i} className="text-[9px] text-ink-700/70 leading-relaxed">· {r}</p>
            ))}
            {ubic.advertencias.map((a, i) => (
              <p key={i} className="text-[9px] text-clay-700/90 leading-relaxed">{a}</p>
            ))}
          </div>

          {/* ── Las cautelas y las fuentes ── */}
          <button onClick={() => setPorQue(v => !v)} className="text-[10px] text-moss-700 underline">
            {porQue ? 'ocultar' : 'qué hay que mirar con cuidado acá'}
          </button>
          {porQue && (
            <div className="text-[9px] text-ink-700/70 leading-relaxed space-y-1 pt-1 border-t border-bone-200">
              {sombra.advertencias.map((a, i) => (
                <p key={i} className="flex gap-1.5">
                  <TriangleAlert className="w-3 h-3 text-clay-600 shrink-0 mt-px" /><span>{a}</span>
                </p>
              ))}
              {clima?.advertencias.map((a, i) => (
                <p key={`c${i}`} className="flex gap-1.5">
                  <TriangleAlert className="w-3 h-3 text-clay-600 shrink-0 mt-px" /><span>{a}</span>
                </p>
              ))}
              <p className="text-ink-700/45 pt-1">
                Fuentes: {[...sombra.fuentes, ...(clima?.fuentes ?? [])].join(' · ')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
