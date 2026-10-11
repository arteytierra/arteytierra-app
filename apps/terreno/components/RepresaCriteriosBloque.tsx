'use client';

/**
 * Los criterios publicados de la represa, en pantalla.
 *
 * Tres cosas que el panel no decía y que deciden si la obra sirve:
 *
 *  1. La cota a la que hay que construir la corona, con sus cuatro términos
 *     separados. El que faltaba es la carga sobre el vertedero: la revancha se
 *     mide desde el pelo de agua CON la crecida pasando, no desde el nivel
 *     normal, y en el ejemplo de AH-590 esa carga es más grande que la propia
 *     revancha.
 *  2. La profundidad de agua permanente que pide el clima del predio, que es lo
 *     que decide si el agua llega a fin de verano.
 *  3. El factor de evaporación del espejo y qué fila de FAO-56 se aplicó, que es
 *     distinta para un vaso somero y para un embalse hondo en clima templado.
 *
 * Los tres salen de `lib/represaDiseno.ts`. Acá no se calcula nada: se muestra,
 * con la cita al lado.
 */

import { useMemo } from 'react';
import { Info, TriangleAlert } from 'lucide-react';
import {
  cotaCoronamiento, profundidadUtilMinima, factorEvaporacionEspejo,
  compararCotas, revanchaMinima,
  FUENTE_AH590, FUENTE_FAO56, PIE_M,
  type CandidatoCota,
} from '@/lib/represaDiseno';
import { MESES_NOMBRE } from '@/lib/represa';
import type { ResultadoEmbalse, ResultadoMuro } from '@/lib/cutfill';
import type { DatosClima } from '@/lib/clima';
import type { RepresaGuardada } from '@/lib/represasGuardadas';

const n1 = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 1 });
const n2 = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const n0 = (v: number) => Math.round(v).toLocaleString('es-AR');

function Fila({ rotulo, valor, detalle, fuerte }: { rotulo: string; valor: string; detalle?: string; fuerte?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className={`text-[10px] ${fuerte ? 'font-semibold text-ink-900' : 'text-ink-700/65'}`}>
        {rotulo}
        {detalle && <span className="text-ink-700/40"> · {detalle}</span>}
      </span>
      <span className={`shrink-0 font-mono text-[10px] ${fuerte ? 'font-bold text-ink-900' : 'text-ink-700/80'}`}>{valor}</span>
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
      <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export interface Props {
  res:    ResultadoEmbalse;
  muro:   ResultadoMuro;
  /** Cota del pelo de agua normal, que es la cresta del vertedero. */
  nivel:  number;
  datosClima: DatosClima | null;
  cargaVertedero: number;
  onCargaVertedero: (v: number) => void;
  compactadoEnCapas: boolean;
  onCompactado: (v: boolean) => void;
  /** Infiltración del vaso en mm/día, para el control de las 3 pulgadas/mes. */
  infiltracion_mm_dia?: number | null;
}

export function RepresaCriteriosBloque({
  res, muro, nivel, datosClima,
  cargaVertedero, onCargaVertedero, compactadoEnCapas, onCompactado,
  infiltracion_mm_dia = null,
}: Props) {
  const cota = useMemo(() => cotaCoronamiento({
    cotaVertedero_m:  nivel,
    cargaVertedero_m: cargaVertedero,
    largoVaso_m:      res.ancho_max_m,
    revancha_m:       null,
    cotaFundacion_m:  res.elev_min,
    compactadoEnCapas,
  }), [nivel, cargaVertedero, res.ancho_max_m, res.elev_min, compactadoEnCapas]);

  const rMin = useMemo(() => revanchaMinima(res.ancho_max_m), [res.ancho_max_m]);

  const profUtil = useMemo(() => profundidadUtilMinima(
    datosClima?.aridez?.clase ?? null,
    infiltracion_mm_dia != null ? infiltracion_mm_dia * 30 : null,
  ), [datosClima?.aridez?.clase, infiltracion_mm_dia]);

  const espejo = useMemo(() => factorEvaporacionEspejo({
    profMedia_m:    res.prof_media_m,
    lat:            datosClima?.lat ?? null,
    claseAridez:    datosClima?.aridez?.clase ?? null,
    temp_mensual_c: datosClima ? datosClima.meses.map(m => m.tmean_c) : null,
  }), [res.prof_media_m, datosClima]);

  const evap = useMemo(() => {
    if (!datosClima) return null;
    let lamina = 0;
    for (let m = 0; m < 12; m++) {
      lamina += (datosClima.meses[m]?.etp_mm ?? 0) * espejo.factor_mensual[m]!;
    }
    const m3 = res.area_inundada_m2 * (lamina / 1000);
    return { lamina_mm: lamina, m3, frac: res.volumen_m3 > 0 ? m3 / res.volumen_m3 : 0 };
  }, [datosClima, espejo, res.area_inundada_m2, res.volumen_m3]);

  const alcanza = res.prof_max_m >= profUtil.minimo_m;

  return (
    <details className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <summary className="cursor-pointer select-none px-3 py-2 text-[10px] font-semibold text-ink-700 uppercase tracking-wide hover:bg-bone-50">
        Criterios publicados del muro y del vaso
      </summary>

      <div className="px-3 pb-3 space-y-3">

        {/* ── 1 · La cota del coronamiento ── */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-ink-900">A qué cota se construye la corona</p>
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            Entre el pelo de agua normal y la corona hay <b>tres</b> cosas apiladas, no una. AH-590
            define la revancha como la distancia entre el pelo de agua <b>con el vertedero
            descargando a su carga de diseño</b> y la corona <b>después de todo el asentamiento</b>.
            acequia sumaba sólo la revancha.
          </p>

          <div className="border-t border-bone-100 pt-1">
            <Fila rotulo="Cresta del vertedero" detalle="nivel normal" valor={`${n2(nivel)} m`} />
            <Fila rotulo="+ carga de la crecida sobre el vertedero" valor={`${n2(cota.cargaVertedero_m)} m`} />
            <Fila rotulo="= pelo de agua con la crecida pasando" valor={`${n2(cota.cotaCrecida_m)} m`} />
            <Fila rotulo="+ revancha" detalle={`mínimo ${n2(cota.revanchaMinima_m)} m por el largo del vaso`} valor={`${n2(cota.revancha_m)} m`} />
            <Fila rotulo="= corona, ya asentada" valor={`${n2(cota.cotaAsentada_m)} m`} fuerte />
            <Fila rotulo={`+ sobrealto por asentamiento (${cota.asentamiento.pct} %)`} valor={`${n2(cota.sobrealto_m)} m`} />
            <Fila rotulo="= corona como se construye" valor={`${n2(cota.cotaConstruida_m)} m`} fuerte />
          </div>

          <label className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-ink-700/70">Carga sobre el vertedero (m)</span>
            <input
              type="number" step={0.05} min={0} max={3}
              value={cargaVertedero}
              onChange={e => onCargaVertedero(parseFloat(e.target.value) || 0)}
              className="w-20 px-1.5 py-0.5 text-[10px] font-mono text-right rounded border border-bone-200 focus:outline-none focus:border-moss-600"
            />
          </label>
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            Es cuánto deja subir el agua el vertedero cuando pasa la crecida de diseño: una decisión
            de obra, no un dato del predio. La pestaña <b>Cuenca</b> calcula el ancho de vertedero
            que hace falta para esa carga y para el caudal de pico de la cuenca de aporte, así que
            los dos números van juntos: más carga, vertedero más angosto y muro más alto.
          </p>

          <label className="flex items-center gap-1.5 pt-0.5">
            <input type="checkbox" checked={compactadoEnCapas} onChange={e => onCompactado(e.target.checked)} className="accent-moss-700" />
            <span className="text-[10px] text-ink-700/70">Terraplén compactado en capas con rodillo</span>
          </label>
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            {compactadoEnCapas
              ? 'Con rodillo y control de humedad el sobrealto baja al 5 %.'
              : 'Sin rodillo el sobrealto es del 10 %, que es lo que el manual asume para casi toda represa de predio: «Most pond dams less than 20 feet high, however, are not rolled fill».'}
          </p>

          {cota.advertencias.map((a, i) => <Aviso key={i}>{a}</Aviso>)}
          {rMin.fueraDeTabla || (
            <p className="text-[9px] text-ink-700/45 leading-relaxed">{rMin.nota}</p>
          )}
        </div>

        {/* ── 2 · Profundidad útil ── */}
        <div className="space-y-1 border-t border-bone-100 pt-2">
          <p className="text-[10px] font-semibold text-ink-900">Cuánta agua permanente pide este clima</p>
          <div className="grid grid-cols-2 gap-1.5">
            <Fila rotulo="Pide" detalle={profUtil.banda} valor={`${n1(profUtil.minimo_m)} m`} fuerte />
            <Fila rotulo="Tiene" detalle="profundidad máxima" valor={`${n1(res.prof_max_m)} m`} fuerte />
          </div>
          <p className={`text-[9px] leading-relaxed ${alcanza ? 'text-moss-800' : 'text-clay-700'}`}>
            {alcanza
              ? `El vaso llega a los ${n1(profUtil.minimo_m)} m que la tabla pide para un clima ${profUtil.banda.toLowerCase()}. No es la profundidad media: es que haya un sector hondo que no se seque.`
              : `El vaso se queda en ${n1(res.prof_max_m)} m y la tabla pide ${n1(profUtil.minimo_m)} m de agua permanente para este clima. Un vaso más chato no es sólo menos agua: la lámina que queda se calienta, se evapora más rápido y se termina antes de la punta seca. Subir la cota o profundizar el sector del muro es lo que lo arregla.`}
          </p>
          <p className="text-[9px] text-ink-700/45 leading-relaxed">{profUtil.nota}</p>
          {profUtil.advertencias.map((a, i) => <Aviso key={i}>{a}</Aviso>)}
        </div>

        {/* ── 3 · Evaporación del espejo ── */}
        <div className="space-y-1 border-t border-bone-100 pt-2">
          <p className="text-[10px] font-semibold text-ink-900">La evaporación del espejo no es la ETP</p>
          <div className="grid grid-cols-2 gap-1.5">
            <Fila rotulo="Profundidad media" valor={`${n1(res.prof_media_m)} m`} />
            <Fila
              rotulo="Factor sobre la ETP"
              valor={espejo.regimen === 'profundo_templado'
                ? `${n2(Math.min(...espejo.factor_mensual))}–${n2(Math.max(...espejo.factor_mensual))}`
                : n2(espejo.factor_mensual[0]!)}
              fuerte
            />
          </div>
          <p className="text-[9px] text-ink-700/55 leading-relaxed">{espejo.nota}</p>

          {espejo.regimen === 'profundo_templado' && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
              {espejo.factor_mensual.map((f, m) => (
                <span key={m} className="text-[9px] font-mono text-ink-700/55">
                  {MESES_NOMBRE[m]} <b className={f > 1 ? 'text-clay-700' : 'text-moss-700'}>{n2(f)}</b>
                </span>
              ))}
            </div>
          )}

          {evap && (
            <>
              <div className="grid grid-cols-2 gap-1.5 border-t border-bone-100 pt-1">
                <Fila rotulo="Lámina evaporada al año" valor={`${n0(evap.lamina_mm)} mm`} />
                <Fila rotulo="Sobre el espejo lleno" valor={`${n0(evap.m3)} m³`} />
              </div>
              <p className={`text-[9px] leading-relaxed ${evap.frac > 0.5 ? 'text-clay-700' : 'text-ink-700/55'}`}>
                Es el <b>{(evap.frac * 100).toFixed(0)} %</b> de lo embalsado, en un año, si el espejo
                se mantuviera lleno. {evap.frac > 0.5
                  ? 'Con una fracción así la evaporación deja de ser una corrección y pasa a ser el problema de diseño: el mismo volumen en un vaso más angosto y más hondo pierde bastante menos.'
                  : 'La simulación anual lo reparte mes a mes y lo descuenta sobre el espejo que haya en cada momento, no sobre el lleno.'}
              </p>
            </>
          )}
          {!datosClima && (
            <p className="text-[9px] text-ink-700/45 leading-relaxed">
              Sin clima cargado no hay ETP mensual: el factor se informa igual, pero la lámina
              evaporada sale de la pestaña Clima.
            </p>
          )}
          {espejo.advertencias.map((a, i) => <Aviso key={i}>{a}</Aviso>)}
        </div>

        {/* ── El terraplén, con el sobrealto a la vista ── */}
        <div className="space-y-1 border-t border-bone-100 pt-2">
          <p className="text-[10px] font-semibold text-ink-900">El terraplén que se construye</p>
          <Fila rotulo="De proyecto" valor={`${n0(muro.volumenTierraDisenado_m3)} m³`} />
          <Fila rotulo={`+ sobrealto por asentamiento (${muro.asentamiento_pct} %)`} valor={`${n0(muro.volumenTierra_m3 - muro.volumenTierraDisenado_m3)} m³`} />
          <Fila rotulo="Total compactado en obra" valor={`${n0(muro.volumenTierra_m3)} m³`} fuerte />
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            El sobrealto no es lo mismo que el factor de contracción, que ya estaba: ése dice cuánta
            tierra en banco hay que mover para dejar un metro cúbico compactado. Éste dice que el
            muro terminado es más grande que el dibujado, porque la fundación cede. El ejemplo de
            cómputo del manual cierra así: 7.029 yd³ + 10 % = 7.732 yd³.
          </p>
          <Fila rotulo="Zanja de anclaje" detalle={`fondo ${n2(muro.zanja.anchoFondo_m)} m · boca ${n2(muro.zanja.anchoBoca_m)} m · ${muro.zanja.talud}:1`} valor={`${muro.zanja.capas} capas`} />
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            El fondo no baja de {n2(8 * PIE_M)} m —8 pies, ancho de hoja de topadora— porque más
            angosto no se puede compactar, y una zanja sin compactar es un camino para el agua:
            exactamente lo que vino a cortar. El relleno va en capas de 23 cm, que es lo que una
            pasada de compactador densifica de verdad.
          </p>
          {muro.advertencias.map((a, i) => <Aviso key={i}>{a}</Aviso>)}
        </div>

        <details className="text-[9px]">
          <summary className="cursor-pointer select-none text-ink-700/45 hover:text-ink-700/70">de dónde salen estos números</summary>
          <div className="pt-1 space-y-1 text-ink-700/55 leading-relaxed">
            <p><b>Muro, revancha, asentamiento, zanja y profundidad útil:</b> {FUENTE_AH590}. Los mínimos de corona salen de «Top width and alignment», los taludes del cuadro 16, la revancha y el asentamiento de «Freeboard» y «Settlement allowance», la zanja de «Cutoffs» y la profundidad de agua de la figura 12.</p>
            <p><b>Evaporación del espejo:</b> {FUENTE_FAO56}.</p>
            <p>La correspondencia entre las bandas de humedad de la figura 12 y las clases de aridez que calcula acequia es nuestra: los nombres coinciden pero las dos clasificaciones no se definen igual, así que donde hay duda se toma el extremo profundo.</p>
          </div>
        </details>
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export interface PropsComparacion {
  guardadas:  RepresaGuardada[];
  datosClima: DatosClima | null;
  /** Precio del m³ de tierra movida; sale del catálogo de `economia.ts`. */
  precio_m3_tierra: number;
  onPrecio: (v: number) => void;
}

/**
 * Comparar los candidatos archivados por cota.
 *
 * El archivo ya los ordenaba por agua sobre tierra movida, que es el costo en
 * unidades de obra. Lo que agrega esto es la otra mitad de la decisión: cuánta
 * de esa agua se va por evaporación en el año, que depende del espejo y no del
 * volumen. Los dos mejores casi nunca son el mismo candidato, y cuál pesa
 * depende de si en el predio lo escaso es el agua o la plata.
 */
export function ComparacionCandidatos({ guardadas, datosClima, precio_m3_tierra, onPrecio }: PropsComparacion) {
  const comp = useMemo(() => {
    if (!datosClima || guardadas.length < 2) return null;
    const candidatos: CandidatoCota[] = guardadas.map(g => ({
      etiqueta:       g.nombre,
      nivel_m:        g.ficha.nivel_m,
      volumen_m3:     g.ficha.capacidad_m3,
      area_espejo_m2: g.ficha.area_espejo_m2,
      banco_m3:       g.ficha.banco_m3,
    }));
    return compararCotas({
      candidatos,
      etp_mensual_mm: datosClima.meses.map(m => m.etp_mm),
      lat: datosClima.lat,
      claseAridez: datosClima.aridez?.clase ?? null,
      temp_mensual_c: datosClima.meses.map(m => m.tmean_c),
      precio_m3_tierra,
    });
  }, [guardadas, datosClima, precio_m3_tierra]);

  if (!comp) return null;

  const ordenados = [...comp.candidatos].sort((a, b) => a.perdida_anual_frac - b.perdida_anual_frac);

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
      <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">
        Comparar candidatos por cota
      </p>
      <p className="text-[9px] text-ink-700/55 leading-relaxed">
        El archivo los ordena por agua sobre tierra movida. Acá se agrega la otra mitad: cuánta de
        esa agua se evapora en el año, que depende del <b>espejo</b> y no del volumen. Para el mismo
        volumen conviene el vaso concentrado, porque la evaporación se cobra por metro cuadrado y el
        almacenamiento se paga por metro cúbico.
      </p>

      <div className="space-y-1 border-t border-bone-100 pt-1.5">
        {ordenados.map(c => (
          <div key={c.etiqueta} className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-ink-900 truncate">{c.etiqueta}</span>
            <span className="shrink-0 font-mono text-[9px] text-ink-700/70">
              {n0(c.evaporacion_anual_m3)} m³/año · {(c.perdida_anual_frac * 100).toFixed(0)} %
              {c.tierra_por_agua !== null && ` · ${n2(c.tierra_por_agua)} m³ tierra/m³ agua`}
              {c.costo_por_m3_agua !== null && ` · ${n2(c.costo_por_m3_agua)}/m³`}
            </span>
          </div>
        ))}
      </div>

      <label className="flex items-center justify-between gap-2 border-t border-bone-100 pt-1.5">
        <span className="text-[10px] text-ink-700/70">Movimiento de suelo (por m³)</span>
        <input
          type="number" step={0.5} min={0}
          value={precio_m3_tierra}
          onChange={e => onPrecio(parseFloat(e.target.value) || 0)}
          className="w-20 px-1.5 py-0.5 text-[10px] font-mono text-right rounded border border-bone-200 focus:outline-none focus:border-moss-600"
        />
      </label>
      <p className="text-[9px] text-ink-700/45 leading-relaxed flex gap-1">
        <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
        <span>
          El precio es el del presupuesto y lo pone el usuario: cuánto cuesta mover un metro cúbico
          depende de la máquina, la distancia y el país, y eso no hay fuente que lo publique. Lo que
          sí es transferible es el número de al lado, <b>metros cúbicos de tierra por metro cúbico de
          agua</b>, que compara dos emplazamientos sin pasar por la moneda.
        </span>
      </p>

      {comp.nota && <p className="text-[9px] text-ink-700/60 leading-relaxed">{comp.nota}</p>}
    </div>
  );
}
