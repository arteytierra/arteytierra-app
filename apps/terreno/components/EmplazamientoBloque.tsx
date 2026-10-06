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
 */
'use client';

import { useMemo, useState } from 'react';
import { Ban, Ruler, Route, Waves, Droplets } from 'lucide-react';
import {
  BUFFERS_CAUCE,
  FACTOR_AREA_RESERVA,
  FUENTE_CPS391,
  FUENTE_CPS560,
  FUENTE_EPA_OWTS,
  FUENTE_MD92,
  FUENTE_NC18A,
  FUENTE_OSHA_P,
  FUENTE_COPDEM,
  LA_NORMA_LOCAL_MANDA,
  PENDIENTE_CAMINO_MAX_PCT,
  PENDIENTE_CAMINO_NORMAL_PCT,
  TALUD_PERMANENTE_HV,
  areaParaCauce,
  bufferCauce,
  campoDeInfiltracion,
  evaluarPunto,
  factorEscaleraBuffer,
  plataforma,
  prepararEmplazamiento,
  resumenEmplazamiento,
  type PropositoBuffer,
} from '@/lib/emplazamiento';
import type { GrillaElevacion } from '@/lib/grillaElevacion';
import type { DatosSuelo } from '@/lib/suelos';

interface Props {
  grilla:     GrillaElevacion | null;
  acceso:     { lat: number; lng: number } | null;
  zona0:      { lat: number; lng: number } | null;
  datosSuelo: DatosSuelo | null;
}

const n0 = (v: number) => Math.round(v).toLocaleString('es-AR');
const n1 = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 1 });

export function EmplazamientoBloque({ grilla, acceso, zona0, datosSuelo }: Props) {
  const [proposito, setProposito] = useState<PropositoBuffer>('sedimento');
  const [ancho, setAncho] = useState('10');
  const [largo, setLargo] = useState('12');
  const [dorm, setDorm] = useState('3');
  const [limite, setLimite] = useState(PENDIENTE_CAMINO_NORMAL_PCT);
  const [porQue, setPorQue] = useState(false);

  const anchoM = Math.max(2, Number(ancho) || 10);
  const largoM = Math.max(2, Number(largo) || 12);

  const ctx = useMemo(
    () => (grilla
      ? prepararEmplazamiento(grilla, acceso, {
          buffer: proposito, ancho_m: anchoM, largo_m: largoM, camino_limite_pct: limite,
        })
      : null),
    [grilla, acceso, proposito, anchoM, largoM, limite],
  );

  const resumen = useMemo(() => (ctx ? resumenEmplazamiento(ctx) : null), [ctx]);
  const enZona0 = useMemo(
    () => (ctx && zona0 ? evaluarPunto(ctx, zona0.lat, zona0.lng) : null),
    [ctx, zona0],
  );

  const campo = useMemo(() => {
    const sup = datosSuelo?.perfil?.[0];
    if (!sup) return null;
    return campoDeInfiltracion(Math.max(1, Number(dorm) || 3), {
      arcilla_pct: sup.arcilla, arena_pct: sup.arena, limo_pct: sup.limo,
    });
  }, [datosSuelo, dorm]);

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
  const plat = plataforma(anchoM, largoM, enZona0?.pendiente_pct ?? resumen.paso_m * 0);
  const pctLibre = resumen.celdas_total > 0
    ? (resumen.celdas_libres / resumen.celdas_total) * 100
    : 0;

  return (
    <div className="bg-white rounded-xl border border-bone-200 px-3 py-2.5 space-y-2.5">
      <p className="text-[11px] font-medium text-ink-700 flex items-center gap-1.5">
        <Ban className="w-3 h-3 text-clay-700" /> Dónde no va
      </p>
      <p className="text-[10px] text-ink-700/70 leading-relaxed">
        Un retiro de un curso de agua no es una penalización: es una prohibición. El puntaje del
        master plan sumaba y restaba y nunca descartaba nada, así que un lugar con buenos bonos se
        quedaba con la casa aunque estuviera adentro del retiro. Acá están las reglas de sí o no,
        separadas de lo que sólo cuesta plata.
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
          El {n0(pctLibre)} % del predio. Medido sobre la grilla densa, con un paso de{' '}
          <b>{n1(resumen.paso_m)} m</b>: en una celda del shader del master plan caben{' '}
          {n1(resumen.huellas_por_celda)} huellas de este edificio.
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

      {/* ── El retiro elegido ── */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-ink-700/70 flex items-center gap-1">
          <Waves className="w-3 h-3 text-[#1565C0]" /> El retiro del curso de agua, y para qué
        </span>
        <div className="grid grid-cols-1 gap-1">
          {BUFFERS_CAUCE.map(b => (
            <button key={b.id} onClick={() => setProposito(b.id)}
              className={`text-left px-2 py-1 rounded-lg border text-[9px] leading-snug transition-colors ${
                proposito === b.id
                  ? 'bg-ink-950 text-bone-50 border-ink-950'
                  : 'bg-white text-ink-800 border-bone-200 hover:bg-bone-50'
              }`}>
              <span className="font-mono font-bold">{n1(b.m)} m</span>
              <span className="opacity-60"> ({b.pies} pies{b.exigido ? ', exigido' : ', recomendado'})</span>
              {' · '}{b.para}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          El retiro no es un número: entre el primer escalón y el último hay un factor{' '}
          <b>{n1(factorEscaleraBuffer())}</b> en el mismo arroyo. Y es <b>por orilla</b>: el corredor
          completo mide el doble. Ahora mismo se está aplicando{' '}
          <b>{n1(ancho_buffer.m)} m</b>.
        </p>
      </div>

      {/* ── Si no hay cauces, decirlo ── */}
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

      {/* ── La plataforma ── */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-ink-700/70 flex items-center gap-1">
          <Ruler className="w-3 h-3 text-clay-700" /> La plataforma del edificio
        </span>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="block text-[9px] text-ink-700/60 mb-0.5">Ancho, cruzando la pendiente (m)</span>
            <input type="number" min={2} step={1} value={ancho} onChange={e => setAncho(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-bone-200 bg-white" />
          </label>
          <label className="block">
            <span className="block text-[9px] text-ink-700/60 mb-0.5">Largo, sobre la curva (m)</span>
            <input type="number" min={2} step={1} value={largo} onChange={e => setLargo(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-bone-200 bg-white" />
          </label>
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          El corte más profundo es <b>ancho × pendiente ÷ 2</b> y el volumen va con el{' '}
          <b>cuadrado del ancho</b>. Por eso la misma casa girada noventa grados mueve el triple de
          tierra, y por eso «no construyas arriba del 15 %» depende del tamaño del edificio y no sólo
          del terreno.
        </p>
        {enZona0 && plat && (
          <div className="bg-bone-50 border border-bone-200 rounded-lg px-2 py-1.5 space-y-0.5">
            <p className="text-[9px] text-ink-700/70">
              En la <b>zona 0</b> que marcaste: pendiente {n1(enZona0.pendiente_pct)} %, posición{' '}
              {enZona0.posicion}.
            </p>
            <p className="text-[9px] text-ink-800">
              Corte de <b>{n1(plat.corte_m)} m</b>, <b>{n0(plat.vol_corte_m3)} m³</b> de movimiento
              de suelo y otro tanto de relleno.{' '}
              {Number.isFinite(plat.huella_tocada_m2)
                ? <>Se toca <b>{n0(plat.huella_tocada_m2)} m²</b> para un edificio de{' '}
                    {n0(plat.huella_edificio_m2)} m²: {n1(plat.factor_huella)} veces la huella.</>
                : <>Con el talud de {TALUD_PERMANENTE_HV}H:1V que pide la norma el corte no cierra.</>}
            </p>
            {plat.pide_muro && (
              <p className="text-[9px] text-clay-700">
                A esta pendiente hace falta <b>muro de contención</b>: es la frontera entre mover
                tierra y construir una obra.
              </p>
            )}
            {enZona0.excluido && (
              <p className="text-[9px] text-clay-700">
                Y además la zona 0 está <b>excluida</b>: {enZona0.exclusiones[0]!.titulo.toLowerCase()}.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── El camino ── */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-ink-700/70 flex items-center gap-1">
          <Route className="w-3 h-3 text-clay-700" /> El camino
        </span>
        <div className="flex gap-1">
          {[PENDIENTE_CAMINO_NORMAL_PCT, PENDIENTE_CAMINO_MAX_PCT].map(p => (
            <button key={p} onClick={() => setLimite(p)}
              className={`flex-1 px-2 py-1 rounded-lg border text-[10px] transition-colors ${
                limite === p
                  ? 'bg-ink-950 text-bone-50 border-ink-950'
                  : 'bg-white text-ink-800 border-bone-200 hover:bg-bone-50'
              }`}>
              {p} % {p === PENDIENTE_CAMINO_NORMAL_PCT ? '(uso normal)' : '(tramos cortos)'}
            </button>
          ))}
        </div>
        {!acceso ? (
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            Marcá el <b>punto de acceso</b> al predio y esta regla se prende: busca si hay algún
            recorrido —zigzagueando incluido— que llegue sin pasarse de esa pendiente. Una casa a la
            que no se puede llegar con un acoplado no está emplazada.
          </p>
        ) : (
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            Con el acceso marcado, un lugar «sin camino posible» no es uno al que no se llega
            derecho: es uno al que no se llega <b>ni dando vueltas</b> dentro del predio. Y sobre un
            plano uniforme se puede subir en diagonal al 71 % de la pendiente del terreno, que es por
            qué un predio del 14 % es totalmente accesible con el límite del 10 %.
            {enZona0?.camino && (
              <> En la zona 0: <b>{n0(enZona0.camino.largo_m)} m</b> de camino, con un máximo de{' '}
                {n1(enZona0.camino.pend_max_pct)} %.</>
            )}
          </p>
        )}
      </div>

      {/* ── El campo de infiltración ── */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-ink-700/70 flex items-center gap-1">
          <Droplets className="w-3 h-3 text-[#1565C0]" /> La superficie que la casa no declara
        </span>
        {!campo ? (
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            Calculá el <b>suelo</b> del predio: el campo de infiltración se dimensiona con la textura,
            y entre una arena y un franco fino hay un factor cuatro de superficie para la misma casa.
          </p>
        ) : (
          <>
            <label className="block">
              <span className="block text-[9px] text-ink-700/60 mb-0.5">Dormitorios de la vivienda</span>
              <input type="number" min={1} step={1} value={dorm} onChange={e => setDorm(e.target.value)}
                className="w-full px-2 py-1 text-xs rounded-lg border border-bone-200 bg-white" />
            </label>
            <div className="bg-bone-50 border border-bone-200 rounded-lg px-2 py-1.5 space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[9px] text-ink-700/70">
                  Terreno para el desagüe, con reserva
                </span>
                <span className="font-mono text-[11px] font-bold text-ink-900">
                  {n0(campo.con_reserva_m2[0])}–{n0(campo.con_reserva_m2[1])} m²
                </span>
              </div>
              <p className="text-[9px] text-ink-700/55 leading-relaxed">
                Suelo {campo.clase} → grupo {campo.grupo} ({campo.nombre_grupo.toLowerCase()}), de{' '}
                {n1(campo.ltar_l_dia_m2[0])} a {n1(campo.ltar_l_dia_m2[1])} L/día·m². El caudal de
                diseño son <b>{n0(campo.caudal_l_dia)} L/día</b>.
              </p>
              <p className="text-[9px] text-ink-700/55 leading-relaxed">
                Es un <b>rango y no un número</b> porque la regla condiciona su tabla a la estructura
                y la mineralogía de arcilla del suelo, que se ven en un pozo y no en un mapa. El fondo
                de zanja son {n0(campo.area_zanja_m2[0])}–{n0(campo.area_zanja_m2[1])} m²; el terreno
                es el triple por la separación entre zanjas y el doble de eso por el área de reserva.
              </p>
            </div>
            <p className="text-[9px] text-ink-700/55 leading-relaxed">
              El caudal sale de los <b>dormitorios</b>, no de la gente, y trae un factor de seguridad
              implícito de 2,3 a 3,6. Las tasas publicadas se calibraron con ese caudal inflado, así
              que los dos errores se cancelan en una vivienda. <b>En un salón, una escuela o un
              conjunto de cabañas no se cancelan</b>, y la fuente le atribuye a eso fallas de
              sistemas grandes.
            </p>
          </>
        )}
      </div>

      {/* ── Por qué ── */}
      <button onClick={() => setPorQue(v => !v)}
        className="text-[10px] text-clay-700 hover:text-clay-800 underline underline-offset-2">
        {porQue ? 'Ocultar el por qué' : '¿Por qué estos números y no otros?'}
      </button>

      {porQue && (
        <div className="space-y-2 bg-bone-50 border border-bone-200 rounded-lg px-2.5 py-2">
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
            estabilidad de ladera, servidumbres, líneas de alta tensión y límites catastrales. El
            corte y el relleno se calculan compensados sobre un plano, sin roca, sin napa y sin
            esponjamiento: un corte no rinde en relleno todo el volumen que saca.
          </p>
          <p className="text-[9px] text-clay-700 leading-relaxed">{LA_NORMA_LOCAL_MANDA}</p>
          <div className="space-y-0.5 pt-1 border-t border-bone-200">
            {[FUENTE_CPS391, FUENTE_CPS560, FUENTE_EPA_OWTS, FUENTE_NC18A, FUENTE_OSHA_P,
              FUENTE_MD92, FUENTE_COPDEM].map(f => (
              <p key={f} className="text-[8px] text-ink-700/45 leading-snug">{f}</p>
            ))}
          </div>
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            El área de reserva del desagüe es el 200 % que pide la EPA ({FACTOR_AREA_RESERVA}×), y la
            tasa se toma del horizonte más limitante de los primeros 90 cm, no del de superficie:
            donde haya un horizonte B arcilloso, la textura superficial sobreestima la tasa y el campo
            sale chico.
          </p>
        </div>
      )}
    </div>
  );
}
