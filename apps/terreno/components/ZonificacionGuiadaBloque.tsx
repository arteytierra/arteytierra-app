'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Compass, Footprints, Info, Layers, Ruler, TriangleAlert } from 'lucide-react';
import type { GrillaElevacion } from '@/lib/grillaElevacion';
import type { Mojon } from '@/lib/types';
import type { Zona } from '@/lib/zonificacion';
import type { EntradaUSLE } from '@/lib/usle';
import { prepararEmplazamiento } from '@/lib/emplazamiento';
import { Cautela } from './Cautela';
import { BUFFERS_CAUCE, type PropositoBuffer } from '@/lib/emplazamiento';
import {
  EL_ANILLO_NO_ES_LA_ZONA, FRECUENCIA_ZONA, FUENTE_IMHOF, FUENTE_NCSU_PERMA,
  FUENTE_TOBLER, LA_CARRETILLA_NO_ES_UN_EXCURSIONISTA, PENDIENTE_MAS_RAPIDA,
  VELOCIDAD_MAXIMA_KMH, numeroDeZona, revisarZonificacion, velocidadTobler,
} from '@/lib/zonificacionGuiada';

interface Props {
  zonas:      Zona[];
  mojones:    Mojon[];
  /** La grilla densa de las curvas de nivel. Sin ella no se mide nada. */
  grilla:     GrillaElevacion | null;
  /** La zona 0 marcada en el mapa, que es el centro desde el que se camina. */
  zona0:      { lat: number; lng: number } | null;
  /** Lo que la USLE necesita, ya armado por el panel de erosión. */
  usle:       EntradaUSLE | null;
}

const n0 = (x: number) => Math.round(x).toLocaleString('es-AR');
const n1 = (x: number) => (Math.round(x * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const n2 = (x: number) => (Math.round(x * 100) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** El rumbo en palabras, para no hacer leer grados. */
function rumboEnPalabras(deg: number | null): string {
  if (deg === null) return 'sin dirección resoluble';
  const rosa = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
  return rosa[Math.round(deg / 45) % 8] ?? 'norte';
}

export function ZonificacionGuiadaBloque({ zonas, mojones, grilla, zona0, usle }: Props) {
  const [buffer, setBuffer]   = useState<PropositoBuffer>('nutrientes');
  const [sinSenda, setSinSenda] = useState(true);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [porQue, setPorQue]   = useState(false);

  const ctx = useMemo(() => (grilla ? prepararEmplazamiento(grilla) : null), [grilla]);

  const centro = useMemo(() => {
    if (zona0) return zona0;
    const z = zonas.find(x => x.categoria === 'zona_0');
    if (!z || z.vertices.length === 0) return null;
    const lat = z.vertices.reduce((s, v) => s + v.lat, 0) / z.vertices.length;
    const lng = z.vertices.reduce((s, v) => s + v.lng, 0) / z.vertices.length;
    return { lat, lng };
  }, [zona0, zonas]);

  const rev = useMemo(
    () => revisarZonificacion(zonas, mojones, ctx, {
      usle, buffer, centro, fuera_de_sendero: sinSenda,
    }),
    [zonas, mojones, ctx, usle, buffer, centro, sinSenda],
  );

  if (zonas.length === 0) {
    return (
      <div className="bg-moss-500/5 rounded-xl border border-moss-500/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Layers className="w-3.5 h-3.5 text-moss-700" />
          <p className="text-xs font-semibold text-ink-700">Lo que el terreno dice de estas zonas</p>
        </div>
        <p className="text-[11px] text-ink-700/60 leading-snug">
          Dibujá una zona y acá aparece lo que el relieve, el suelo y la lluvia tienen que decir sobre
          ella: su pendiente, su longitud de ladera, si cae dentro del retiro de un curso de agua, y
          —si es una zona de permacultura— cuántos kilómetros por año cuesta llegar.
        </p>
      </div>
    );
  }

  const { balance } = rev;
  const hayDiferencia = balance.doble_conteo_ha > 0 || balance.afuera_ha > 0;

  // El conteo que abre el bloque. Una exclusión gana sobre un requisito: si la
  // zona no va ahí, lo que cuesta ponerla ahí es una pregunta posterior.
  const cuenta = {
    noVan:        rev.zonas.filter(v => v.exclusiones.length > 0).length,
    conRequisito: rev.zonas.filter(v => v.exclusiones.length === 0 && v.requisitos.length > 0).length,
    sinObjecion:  rev.zonas.filter(v => v.exclusiones.length === 0 && v.requisitos.length === 0).length,
  };

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 bg-moss-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-bone-200" />
          <p className="text-[11px] font-bold text-bone-50 uppercase tracking-wide">Lo que el terreno dice de estas zonas</p>
        </div>
        <p className="text-[9px] font-mono text-bone-300">
          {rev.zonas.length} medidas{rev.con_exclusion > 0 && ` · ${rev.con_exclusion} con exclusión`}
        </p>
      </div>

      <div className="p-3 space-y-3">
        {/* ── El veredicto, primero ── */}
        {/* Hasta el 07/10/2026 este bloque abría con «Tres superficies que no son
            la misma», que es una auditoría del dibujo —¿se pisan tus polígonos?—
            y no una lectura del terreno. El veredicto de cada zona quedaba
            tercero y plegado. Ahora abre el conteo, la auditoría baja a una
            cautela y cada zona dice en palabras si va o no va. */}
        <div>
          <p className="text-[11px] font-semibold text-ink-700 mb-1.5">
            {rev.zonas.length === 1 ? 'La zona que dibujaste' : `Las ${rev.zonas.length} zonas que dibujaste`}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2 bg-clay-500/8 border border-clay-500/20">
              <p className="font-mono text-base font-bold text-clay-800">{cuenta.noVan}</p>
              <p className="text-[9px] text-ink-700/60 leading-tight">no van donde están</p>
            </div>
            <div className="rounded-lg p-2 bg-sun-500/8 border border-sun-500/20">
              <p className="font-mono text-base font-bold text-sun-700">{cuenta.conRequisito}</p>
              <p className="text-[9px] text-ink-700/60 leading-tight">van, pero cuestan algo</p>
            </div>
            <div className="rounded-lg p-2 bg-moss-500/8 border border-moss-500/20">
              <p className="font-mono text-base font-bold text-moss-800">{cuenta.sinObjecion}</p>
              <p className="text-[9px] text-ink-700/60 leading-tight">sin objeción</p>
            </div>
          </div>
          <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
            «Sin objeción» es lo que el relieve, el suelo y la lluvia tienen para decir, que no es
            todo: no se mira napa, servidumbres, catastro ni la norma local.
          </p>
        </div>

        {/* ── Los dos controles ── */}
        <div className="border-t border-bone-200 pt-2 space-y-1.5">
          <div>
            <p className="text-[10px] font-semibold text-ink-700 mb-1">¿Para qué es el retiro del curso de agua?</p>
            <div className="flex flex-wrap gap-1">
              {BUFFERS_CAUCE.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBuffer(b.id)}
                  className={buffer === b.id
                    ? 'text-[9px] px-1.5 py-0.5 rounded border font-medium bg-water-500/15 text-water-800 border-water-500/40'
                    : 'text-[9px] px-1.5 py-0.5 rounded border font-medium bg-white text-ink-700/60 border-bone-300 hover:border-bone-400'}
                >
                  {b.para} · {n1(b.m)} m
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] text-ink-700/80">
            <input
              type="checkbox"
              checked={sinSenda}
              onChange={e => setSinSenda(e.target.checked)}
              className="w-3 h-3 accent-moss-600"
            />
            Todavía no hay camino hecho hasta las zonas (la fuente multiplica la velocidad por 3/5)
          </label>
        </div>

        {/* ── Zona por zona ── */}
        <div className="border-t border-bone-200 pt-2">
          <p className="text-[11px] font-semibold text-ink-700 mb-1.5">Una por una</p>
          <div className="space-y-1">
            {rev.zonas.map(v => {
              const open = abierta === v.id;
              return (
                <div key={v.id} className="rounded-lg border border-bone-200 overflow-hidden">
                  <button
                    onClick={() => setAbierta(open ? null : v.id)}
                    className="w-full px-2 py-1.5 flex items-center justify-between gap-2 hover:bg-bone-50 text-left"
                  >
                    <span className="min-w-0">
                      <span className="text-[10px] font-semibold text-ink-700 block truncate">{v.nombre}</span>
                      {/* La fila plegada decía «12,4 % · λ 180 m · 4,2 t/ha/año»,
                          que es exacto y no se lee: λ no significa nada para quien
                          dibujó un polígono. Acá va el veredicto en una frase y los
                          números quedan al abrir. */}
                      <span className="text-[9px] leading-snug block">
                        {v.exclusiones.length > 0
                          ? <span className="text-clay-800">No va ahí: {v.exclusiones[0]?.titulo.toLocaleLowerCase('es-AR')}{v.exclusiones.length > 1 && <> y {v.exclusiones.length - 1} más</>}.</span>
                          : v.requisitos.length > 0
                            ? <span className="text-sun-700">Va, pero pide {v.requisitos[0]?.titulo.toLocaleLowerCase('es-AR')}{v.requisitos.length > 1 && <> y {v.requisitos.length - 1} cosa{v.requisitos.length > 2 ? 's' : ''} más</>}.</span>
                            : <span className="text-moss-800">Nada la objeta.</span>}
                        <span className="text-ink-700/50">
                          {' '}Pendiente {n1(v.geometria.pend_mediana_pct)} %, {n0(v.geometria.lambda_m)} m de
                          ladera{v.erosion && <>, pierde {n1(v.erosion.t_ha_anio)} t de suelo por ha al año</>}
                          {v.caminata && <>, {n0(v.caminata.km_anio[0])}–{n0(v.caminata.km_anio[1])} km de caminata al año</>}.
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <ChevronDown className={`w-3 h-3 text-ink-700/40 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {open && (
                    <div className="px-2 pb-2 space-y-1.5 text-[9px] leading-relaxed">
                      {/* La geometría medida */}
                      <div className="flex items-center gap-1 text-ink-700/80">
                        <Ruler className="w-3 h-3 shrink-0" />
                        <span>
                          Pendiente mediana <b className="font-mono">{n1(v.geometria.pend_mediana_pct)} %</b>{' '}
                          (máxima {n1(v.geometria.pend_max_pct)} %) · baja al{' '}
                          <b>{rumboEnPalabras(v.geometria.rumbo_bajada_deg)}</b> · mide{' '}
                          <b className="font-mono">{n0(v.geometria.lambda_m)} m</b> pendiente abajo y{' '}
                          <b className="font-mono">{n0(v.geometria.ancho_m)} m</b> sobre la curva ·{' '}
                          {n0(v.geometria.elev_min_m)}–{n0(v.geometria.elev_max_m)} m
                        </span>
                      </div>

                      {v.exclusiones.length > 0 && (
                        <div>
                          <p className="font-semibold text-clay-800">No va ahí</p>
                          {v.exclusiones.map((e, i) => (
                            <p key={i} className="text-ink-700/75">· <b>{e.titulo}:</b> {e.motivo}</p>
                          ))}
                        </div>
                      )}

                      {v.requisitos.length > 0 && (
                        <div>
                          <p className="font-semibold text-sun-700">Lo que cuesta ponerla ahí</p>
                          {v.requisitos.map((r, i) => (
                            <p key={i} className="text-ink-700/75">· <b>{r.titulo}.</b> {r.detalle}</p>
                          ))}
                        </div>
                      )}

                      {v.caminata && (
                        <div>
                          <div className="flex items-center gap-1 text-moss-700">
                            <Footprints className="w-3 h-3" />
                            <p className="font-semibold">El presupuesto de viajes que su número declara</p>
                          </div>
                          <p className="text-ink-700/80">
                            Una zona {v.caminata.zona} se visita «{v.caminata.frecuencia.textual}»:{' '}
                            <b className="font-mono">{n0(v.caminata.frecuencia.viajes_anio![0])}–{n0(v.caminata.frecuencia.viajes_anio![1])}</b>{' '}
                            viajes por año. A {n0(v.caminata.viaje.dist_ida_m)} m del centro
                            {Math.abs(v.caminata.viaje.desnivel_m) >= 1 && <> y {v.caminata.viaje.desnivel_m > 0 ? 'subiendo' : 'bajando'} {n0(Math.abs(v.caminata.viaje.desnivel_m))} m</>},
                            eso son <b className="font-mono">{n0(v.caminata.km_anio[0])}–{n0(v.caminata.km_anio[1])} km</b> y{' '}
                            <b className="font-mono">{n0(v.caminata.horas_anio[0])}–{n0(v.caminata.horas_anio[1])} horas</b> al año.
                          </p>
                          <p className="text-ink-700/60">
                            La ida tarda {n2(v.caminata.viaje.horas_ida * 60)} min a{' '}
                            {n1(v.caminata.viaje.kmh_ida)} km/h y la vuelta {n2(v.caminata.viaje.horas_vuelta * 60)} min
                            a {n1(v.caminata.viaje.kmh_vuelta)} km/h: el viaje redondo{' '}
                            {Math.abs(v.caminata.viaje.asimetria_pct) < 1
                              ? 'es simétrico porque el terreno es llano'
                              : `no es el doble de la ida, se desvía un ${n1(Math.abs(v.caminata.viaje.asimetria_pct))} %`}.
                          </p>
                        </div>
                      )}

                      {v.giro && v.giro.mejor !== 'da_lo_mismo' && (
                        <div className="flex items-start gap-1 text-ink-700/80">
                          <Compass className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>
                            {v.giro.mejor === 'girada'
                              ? <>Tendida sobre la curva de nivel, esta misma superficie perdería <b className="font-mono">{n2(v.giro.factor)} veces</b> menos suelo: el factor topográfico baja de {n2(v.giro.ls_actual)} a {n2(v.giro.ls_girada)}.</>
                              : <>Está bien orientada: girarla la pondría a perder <b className="font-mono">{n2(1 / Math.max(0.01, v.giro.factor))} veces</b> más suelo.</>}
                          </span>
                        </div>
                      )}

                      {v.recorte && v.recorte.frac_afuera > 0.01 && (
                        <p className="text-clay-800">
                          El {Math.round(v.recorte.frac_afuera * 100)} % de esta zona cae afuera del
                          perímetro: {n0(v.recorte.area_afuera_m2)} m² de los {n0(v.recorte.area_dibujada_m2)} dibujados.
                        </p>
                      )}

                      {v.advertencias.length > 0 && (
                        <div>
                          <p className="font-semibold text-ink-700/70">Lo que el método no resuelve</p>
                          {v.advertencias.map((a, i) => (
                            <p key={i} className="text-ink-700/60">· {a}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {rev.sin_medir.length > 0 && (
            <p className="text-[9px] text-ink-700/55 mt-1.5 leading-tight">
              Sin medir: {rev.sin_medir.map(z => `«${z.nombre}»`).join(', ')}. No pisan ninguna celda
              de la grilla de relieve, probablemente porque están dibujadas fuera del recorte.
            </p>
          )}
        </div>

        {/* ── El centro ── */}
        {!centro && rev.zonas.some(v => numeroDeZona(v.categoria) !== null) && (
          <div className="border-t border-bone-200 pt-2">
            <div className="flex items-center gap-1 mb-0.5 text-sun-700">
              <Footprints className="w-3 h-3" />
              <p className="text-[10px] font-semibold">Falta el centro</p>
            </div>
            <p className="text-[9px] text-ink-700/75 leading-snug">
              Las zonas de permacultura se miden desde la zona 0, que es la casa. Dibujala —o marcá
              el punto de la vivienda en el Master Plan— y acá aparece lo que cuesta llegar a cada
              zona todos los años. Sin centro, el número de zona es una etiqueta y nada más.
            </p>
          </div>
        )}

        {/* ── La auditoría del dibujo, al final y plegada ── */}
        <div className="border-t border-bone-200 pt-2">
          <Cautela claim={hayDiferencia
            ? 'El resumen por categoría de arriba suma superficies, y la suma no es la superficie.'
            : 'Las zonas no se pisan ni caen afuera, así que los porcentajes por categoría están bien.'}>
            <div className="space-y-1.5">
        {/* ── Suma, unión y recorte ── */}
        <div>
          <p className="text-[11px] font-semibold text-ink-700 mb-1.5">
            Tres superficies que no son la misma
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* Las clases van escritas enteras: Tailwind lee el código fuente y
                una clase interpolada no genera CSS. */}
            <div className="rounded-lg p-2 bg-bone-100 border border-bone-300">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Suma</p>
              <p className="font-mono text-sm font-bold text-ink-700">{n2(balance.suma_ha)}</p>
              <p className="text-[9px] text-ink-700/50">ha, una por una</p>
            </div>
            <div className="rounded-lg p-2 bg-moss-500/8 border border-moss-500/20">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Unión</p>
              <p className="font-mono text-sm font-bold text-moss-800">{n2(balance.union_ha)}</p>
              <p className="text-[9px] text-ink-700/50">ha ocupadas</p>
            </div>
            <div className="rounded-lg p-2 bg-water-500/8 border border-water-500/20">
              <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">En el predio</p>
              <p className="font-mono text-sm font-bold text-water-800">{n2(balance.dentro_ha)}</p>
              <p className="text-[9px] text-ink-700/50">
                {balance.predio_ha > 0 ? `${Math.round(balance.frac_zonificada * 100)} % de ${n1(balance.predio_ha)} ha` : 'sin perímetro'}
              </p>
            </div>
          </div>
          {hayDiferencia ? (
            <div className="mt-1.5 rounded-lg p-2 bg-clay-500/8 border border-clay-500/20">
              <div className="flex items-center gap-1 mb-0.5 text-clay-800">
                <TriangleAlert className="w-3 h-3" />
                <p className="text-[10px] font-semibold">El resumen de arriba suma, y la suma no es la superficie</p>
              </div>
              <p className="text-[9px] text-ink-700/75 leading-snug">
                {balance.doble_conteo_ha > 0 && (
                  <>Hay <b className="font-mono">{n2(balance.doble_conteo_ha)} ha</b> contadas dos veces
                  porque {balance.solapes.length} {balance.solapes.length === 1 ? 'par de zonas se pisa' : 'pares de zonas se pisan'},
                  y los porcentajes por categoría se dividen por ese total inflado. </>
                )}
                {balance.afuera_ha > 0 && (
                  <>Y <b className="font-mono">{n2(balance.afuera_ha)} ha</b> de lo dibujado caen afuera
                  del perímetro de los mojones.</>
                )}
              </p>
            </div>
          ) : (
            <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
              Las tres coinciden: no hay zonas que se pisen ni nada dibujado afuera del predio, así
              que el resumen por categoría de arriba está bien calculado.
            </p>
          )}
          {balance.solapes.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {balance.solapes.slice(0, 4).map(s => (
                <li key={`${s.id_a}-${s.id_b}`} className="text-[9px] text-ink-700/65">
                  · «{s.nombre_a}» y «{s.nombre_b}» comparten{' '}
                  <span className="font-mono">{n0(s.area_m2)} m²</span>
                  {' '}({Math.round(s.frac_de_la_menor * 100)} % de la más chica)
                </li>
              ))}
              {balance.solapes.length > 4 && (
                <li className="text-[9px] text-ink-700/45">· y {balance.solapes.length - 4} más</li>
              )}
            </ul>
          )}
        </div>

            </div>
          </Cautela>
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
              <b>La zona de Mollison es una frecuencia, no un radio.</b> {EL_ANILLO_NO_ES_LA_ZONA} Y
              de ahí sale algo que los anillos dicen al revés: con las bandas de la fuente, una zona 1
              a 150 m del centro camina más kilómetros por año que una zona 3 a 500 m. A igual
              distancia, el factor entre la zona 1 y la zona 4 va de <b>61 a 365 veces</b>.
            </p>
            <div className="rounded-lg p-1.5 bg-bone-100 border border-bone-300">
              <p className="font-semibold text-ink-700/80 mb-0.5">Las frecuencias, textuales</p>
              {[1, 2, 3, 4].map(z => {
                const f = FRECUENCIA_ZONA[z]!;
                return (
                  <p key={z} className="text-ink-700/70">
                    · Zona {z}: «{f.textual}» → <span className="font-mono">{n0(f.viajes_anio![0])}–{n0(f.viajes_anio![1])}</span> viajes/año. {f.nota}
                  </p>
                );
              })}
              <p className="text-ink-700/70">· Zona 0: {FRECUENCIA_ZONA[0]!.nota}</p>
              <p className="text-ink-700/70">· Zona 5: {FRECUENCIA_ZONA[5]!.nota}</p>
            </div>
            <p>
              <b>La ida y vuelta no es el doble de la ida.</b> La función de caminata publicada tiene
              su máximo en una <b>bajada del {Math.abs(PENDIENTE_MAS_RAPIDA) * 100} %</b> —{VELOCIDAD_MAXIMA_KMH} km/h
              exactos, no en el llano, donde da {n2(velocidadTobler(0))}—, así que subir y bajar la
              misma ladera cuestan distinto. En una pendiente del 20 % son{' '}
              {n2(velocidadTobler(0.2))} km/h contra {n2(velocidadTobler(-0.2))}: un 42 % de
              diferencia en el mismo metro de terreno.
            </p>
            <p>
              <b>La longitud de ladera es una propiedad de la zona, no del predio.</b> El factor
              topográfico de la USLE va con λ<sup>m</sup>, y λ es la dimensión medida{' '}
              <b>pendiente abajo</b>. Así que la misma hectárea de cultivo girada 90° cambia su
              pérdida de suelo por la raíz de la relación de lados: una franja de 200 × 50 m pierde el{' '}
              <b>doble</b> cruzada que tendida sobre la curva. El mapa de erosión de la app nunca lo
              supo, porque nunca miró la zona.
            </p>
            <p>
              <b>Lo que este bloque no inventa.</b> No hay una pendiente máxima publicada para una
              huerta ni una superficie mínima publicada para un bosque de alimento. Esas cifras
              circulan sin fuente primaria y acá no están: las categorías sin chequeo lo dicen en su
              propia fila. Lo que sí hay es lo que los motores de la app ya saben, apuntado a cada
              polígono.
            </p>
            <p>{LA_CARRETILLA_NO_ES_UN_EXCURSIONISTA}</p>
            {rev.advertencias.map((a, i) => (
              <p key={i}>{a}</p>
            ))}
            <p>
              Las operaciones de polígono se hacen en lat/lng y se tratan como planas: a escala de
              predio el error es despreciable frente al del propio dibujo a mano alzada. Y no mira
              napa, servidumbres, catastro, caminos existentes ni la norma local.
            </p>
            <div className="pt-1 border-t border-bone-200 space-y-0.5">
              <p className="font-semibold text-ink-700/80">Fuentes</p>
              {[FUENTE_NCSU_PERMA, FUENTE_TOBLER, FUENTE_IMHOF].map(f => (
                <p key={f} className="text-ink-700/55">· {f}</p>
              ))}
              <p className="text-ink-700/55">
                · La pérdida de suelo, el retiro ribereño y las exclusiones se delegan a{' '}
                <span className="font-mono">usle.ts</span> y{' '}
                <span className="font-mono">emplazamiento.ts</span>, con sus propias fuentes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
