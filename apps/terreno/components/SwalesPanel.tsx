'use client';

import { useState, useEffect } from 'react';
import { Ruler, Droplets, ArrowRight, AlertTriangle, Sparkles, SlidersHorizontal, Timer, Shovel, TriangleAlert, BookOpen } from 'lucide-react';
import type {
  ResultadoSwalesMulti, BloqueSwales, OpcionesSwales, SeccionSwale, InfiltracionSwale,
  AreaSwales, AnalisisArea,
} from '@/lib/swales';
import type { Recomendacion } from '@/lib/criterios';
import type { HidrologiaPredio } from '@/lib/hidrologiaPredio';
import { PERIODOS_RETORNO } from '@/lib/hidrologiaPredio';
import { SaludCalculo } from './SaludCalculo';

type OpcionesGlobales = Omit<OpcionesSwales, 'intervaloV' | 'pendiente_pct'>;

interface Props {
  grillaLista: boolean;
  /** Resultado del último trazado, con el detalle por parcela. */
  multi:       ResultadoSwalesMulti | null;
  /** Motor hidrológico compartido: CN, tormenta y coeficiente del predio. */
  hidro:       HidrologiaPredio;
  /**
   * Pendiente y separación recomendada de cada área candidata (el predio y cada
   * parcela dibujada). Lo calcula el contenedor, que es quien tiene la grilla.
   */
  analisis:    AnalisisArea[];
  onPeriodoRetorno: (T: number) => void;
  onGenerar:   (areas: AreaSwales[], intervalos: Record<string, number>, opts: OpcionesGlobales) => void;
  onColocar:   () => void;
  onIrATopo:   () => void;
  onIrAClima:  () => void;
  onIrASuelo:  () => void;
  inicial?:    SwalesInputs | null;
  onInputs?:   (i: SwalesInputs) => void;
}

/** Qué parcelas se eligieron y con qué separación; se guarda con el proyecto. */
export interface SwalesInputs {
  profMax:    number;
  elegidas:   string[];
  intervalos: Record<string, number>;
  manual:     boolean;
  precipMm:   number;
  coef:       number;
}

export function SwalesPanel({
  grillaLista, multi, hidro, analisis,
  onPeriodoRetorno, onGenerar, onColocar, onIrATopo, onIrAClima, onIrASuelo,
  inicial, onInputs,
}: Props) {
  const [profMax, setProfMax] = useState(inicial?.profMax ?? 0.8);

  // Qué áreas se trazan y con qué separación cada una. La separación arranca en
  // la recomendada de su propia pendiente: es la diferencia con el panel viejo,
  // donde un único deslizador global arrancaba en 1,5 m porque sí.
  const [elegidas,   setElegidas]   = useState<string[]>(inicial?.elegidas ?? []);
  const [intervalos, setIntervalos] = useState<Record<string, number>>(inicial?.intervalos ?? {});

  // Cuando cambia la topografía o se dibuja una parcela nueva, las áreas que
  // todavía no tocó el usuario se recargan con su valor recomendado.
  useEffect(() => {
    setIntervalos(prev => {
      const next = { ...prev };
      for (const a of analisis) {
        if (next[a.id] === undefined && a.recomendacion.aplica) next[a.id] = a.recomendacion.valor;
      }
      return next;
    });
    setElegidas(prev => {
      const vivos = prev.filter(id => analisis.some(a => a.id === id));
      if (vivos.length > 0) return vivos;
      const primera = analisis.find(a => a.recomendacion.aplica);
      return primera ? [primera.id] : [];
    });
  }, [analisis]);

  // Override manual de la hidrología: los valores automáticos son el default,
  // pero quien tiene un dato mejor (un ensayo, una serie de estación) los pisa.
  const [manual,   setManual]   = useState(inicial?.manual ?? false);
  const [precipMm, setPrecipMm] = useState(inicial?.precipMm ?? Math.round(hidro.precip_mm));
  const [coef,     setCoef]     = useState(inicial?.coef ?? hidro.coef);

  useEffect(() => {
    onInputs?.({ profMax, elegidas, intervalos, manual, precipMm, coef });
  }, [profMax, elegidas, intervalos, manual, precipMm, coef, onInputs]);

  const precipEfectiva = manual ? precipMm : Math.round(hidro.precip_mm);
  const coefEfectivo   = manual ? coef     : hidro.coef;

  function activarManual() {
    setPrecipMm(Math.round(hidro.precip_mm));
    setCoef(hidro.coef);
    setManual(true);
  }

  if (!grillaLista) {
    return (
      <div className="space-y-3">
        <Encabezado />
        <div className="rounded-lg border border-bone-200 bg-bone-50 p-3 text-[11px] text-ink-700/70">
          Primero calculá la topografía del predio para trazar los swales sobre las curvas de nivel.
          <button onClick={onIrATopo} className="mt-2 flex items-center gap-1 text-teal-700 font-semibold hover:underline">
            Ir a Topografía <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  const trazables = analisis.filter(a => a.recomendacion.aplica);
  const activas   = elegidas.filter(id => trazables.some(a => a.id === id));

  function alternar(id: string) {
    setElegidas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function generar() {
    const areas: AreaSwales[] = activas.map(id => {
      const a = analisis.find(x => x.id === id)!;
      return { id: a.id, nombre: a.nombre, vertices: null };   // el contenedor resuelve los vértices
    });
    onGenerar(areas, intervalos, {
      precipMm:  precipEfectiva,
      coef:      coefEfectivo,
      profMax_m: profMax,
      ksat_mm_h: hidro.ksat_mm_h,
    });
  }

  return (
    <div className="space-y-3">
      <Encabezado />

      {/* `key` por nivel: si aparece una alerta nueva (subir a T100 con serie
          corta, por ejemplo) el bloque se remonta abierto en vez de esconderla
          debajo de un plegado que el usuario había cerrado. */}
      <SaludCalculo key={hidro.confianza.nivel} confianza={hidro.confianza} />

      {(!hidro.confianza.fuentes.clima || !hidro.confianza.fuentes.suelo) && (
        <div className="flex gap-1.5">
          {!hidro.confianza.fuentes.clima && (
            <button onClick={onIrAClima} className="flex-1 flex items-center justify-center gap-1 rounded-md border border-bone-300 text-[10px] font-semibold text-ink-700/80 py-1.5 hover:border-teal-600 hover:text-teal-700 transition-colors">
              Cargar Clima <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {!hidro.confianza.fuentes.suelo && (
            <button onClick={onIrASuelo} className="flex-1 flex items-center justify-center gap-1 rounded-md border border-bone-300 text-[10px] font-semibold text-ink-700/80 py-1.5 hover:border-teal-600 hover:text-teal-700 transition-colors">
              Cargar Suelo <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* ── Tormenta de diseño ─────────────────────────────────────────────── */}
      <label className="block">
        <span className="text-[10px] text-ink-700/60 block mb-0.5">Tormenta de diseño</span>
        <select
          value={hidro.periodoRetorno}
          onChange={e => onPeriodoRetorno(+e.target.value)}
          className="w-full rounded-md border border-bone-300 bg-white px-2 py-1.5 text-[11px] text-ink-900"
        >
          {PERIODOS_RETORNO.map(T => (
            <option key={T} value={T}>Recurrencia {T} años (T{T})</option>
          ))}
        </select>
        <span className="text-[9px] text-ink-700/45 leading-tight block mt-0.5">
          Cada cuánto se espera una lluvia así. T10 es el estándar para obras rurales de conservación.
        </span>
      </label>

      {/* ── Lo que el motor dedujo ─────────────────────────────────────────── */}
      <div className="rounded-lg border border-bone-200 bg-bone-50/70 p-2.5 space-y-2">
        <p className="text-[10px] font-semibold text-ink-900 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-teal-700" />
          {manual ? 'Calculado del predio (referencia)' : 'Calculado de tu predio'}
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <Auto n={hidro.cn.toFixed(0)} u="CN compuesto" nota={`grupo ${hidro.grupo}${hidro.grupoAsumido ? ' (asumido)' : ''}`} />
          <Auto n={Math.round(hidro.precip_mm).toString()} u="mm de lluvia" nota={`T${hidro.periodoRetorno} en 24 h`} />
          <Auto n={hidro.coef.toFixed(2)} u="coef. escorrentía" nota={`escurren ${hidro.escurrimiento_mm} mm`} />
        </div>
        {hidro.composicion.length > 0 && (
          <p className="text-[9px] text-ink-700/55 leading-tight">
            CN ponderado por cobertura: {hidro.composicion.slice(0, 3).map(c => `${c.nombre} ${c.pct}% (CN ${c.cn})`).join(' · ')}
            {hidro.composicion.length > 3 && ' …'}
          </p>
        )}
        {!manual ? (
          <button onClick={activarManual} className="flex items-center gap-1 text-[10px] text-teal-700 font-semibold hover:underline">
            <SlidersHorizontal className="w-3 h-3" /> Ajustar a mano
          </button>
        ) : (
          <button onClick={() => setManual(false)} className="flex items-center gap-1 text-[10px] text-teal-700 font-semibold hover:underline">
            <Sparkles className="w-3 h-3" /> Volver a los valores calculados
          </button>
        )}
      </div>

      {/* ── Áreas, cada una con su pendiente y su separación ───────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink-900">Dónde trazar</p>
        <p className="text-[9px] text-ink-700/55 leading-tight -mt-1">
          Cada ladera pide su propia separación: cuanto más empinada, más rápido y más agua escurre, así
          que las zanjas van más juntas. Podés marcar varias parcelas y se trazan todas de una vez, cada
          una con su criterio.
        </p>
        {analisis.map(a => (
          <AreaFila
            key={a.id}
            a={a}
            elegida={elegidas.includes(a.id)}
            valor={intervalos[a.id] ?? (a.recomendacion.aplica ? a.recomendacion.valor : 0)}
            onAlternar={() => alternar(a.id)}
            onValor={v => setIntervalos(prev => ({ ...prev, [a.id]: v }))}
          />
        ))}
      </div>

      {/* ── Parámetro constructivo global ──────────────────────────────────── */}
      <Campo label="Profundidad máxima de zanja" sufijo="m"
        value={profMax} min={0.3} max={1.2} step={0.1} onChange={setProfMax}
        ayuda="Tope constructivo, igual para todas las parcelas. Más de 1 m pide entibado y se vuelve peligroso de mantener." />

      {manual && (
        <div className="space-y-2">
          <Campo label="Lluvia de diseño (evento)" sufijo="mm"
            value={precipMm} min={5} max={300} step={5} onChange={v => setPrecipMm(Math.round(v))}
            ayuda={`Automático sería ${Math.round(hidro.precip_mm)} mm (T${hidro.periodoRetorno} de tu clima).`} />
          <Campo label="Coeficiente de escorrentía" sufijo=""
            value={coef} min={0.05} max={0.95} step={0.05} onChange={setCoef}
            ayuda={`Automático sería ${hidro.coef.toFixed(2)} (SCS-CN ${hidro.cn.toFixed(0)} sobre ${Math.round(hidro.precip_mm)} mm).`} />
        </div>
      )}

      <button
        onClick={generar}
        disabled={activas.length === 0}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 text-white text-[12px] font-semibold py-2 hover:bg-teal-800 transition-colors disabled:bg-bone-300 disabled:text-ink-700/40"
      >
        <Ruler className="w-3.5 h-3.5" />
        {activas.length > 1
          ? `Generar y dimensionar (${activas.length} parcelas)`
          : 'Generar y dimensionar swales'}
      </button>

      {activas.length === 0 && (
        <p className="text-[10px] text-amber-800 leading-snug">
          {trazables.length === 0
            ? 'Ninguna de las áreas tiene una pendiente que admita zanjas de infiltración. Mirá el motivo en cada una.'
            : 'Marcá al menos un área para trazar.'}
        </p>
      )}

      {multi && <Resultados multi={multi} onColocar={onColocar} />}
    </div>
  );
}

// ─── Un área con su pendiente y su separación ────────────────────────────────

function AreaFila({ a, elegida, valor, onAlternar, onValor }: {
  a: AnalisisArea;
  elegida: boolean;
  valor: number;
  onAlternar: () => void;
  onValor: (v: number) => void;
}) {
  const [verCriterio, setVerCriterio] = useState(false);
  const rec = a.recomendacion;

  if (!rec.aplica) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 space-y-1">
        <p className="text-[11px] font-semibold text-ink-900 flex items-center gap-1.5">
          <TriangleAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          {a.nombre} — no corresponden swales acá
        </p>
        <p className="text-[10px] text-amber-900 leading-snug">{rec.motivo}</p>
        <p className="text-[9px] text-ink-700/55">
          Pendiente media medida: {a.pendiente_pct}% · desnivel {a.desnivel_m} m.
        </p>
      </div>
    );
  }

  const enSugerido = Math.abs(valor - rec.valor) < 0.01;
  const distancia_m = a.pendiente_pct > 0 ? Math.round((valor / (a.pendiente_pct / 100))) : 0;

  return (
    <div className={`rounded-lg border p-2.5 space-y-1.5 transition-colors ${elegida ? 'border-teal-300 bg-teal-50/50' : 'border-bone-200 bg-white'}`}>
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" checked={elegida} onChange={onAlternar} className="mt-0.5 accent-teal-700" />
        <span className="flex-1">
          <span className="text-[11px] font-semibold text-ink-900 block leading-tight">{a.nombre}</span>
          <span className="text-[9px] text-ink-700/55">
            pendiente media {a.pendiente_pct}% · desnivel {a.desnivel_m} m
          </span>
        </span>
      </label>

      {elegida && (
        <>
          <div>
            <span className="flex items-center justify-between text-[10px] text-ink-700/80">
              <span>Separación entre zanjas</span>
              <span className="tabular-nums font-semibold text-ink-900">
                {valor} m de desnivel ≈ {distancia_m} m en el terreno
              </span>
            </span>
            <input
              type="range" min={rec.min} max={rec.max} step={0.25} value={valor}
              onChange={e => onValor(+e.target.value)}
              className="w-full accent-teal-700 mt-1"
            />
            <span className="flex items-center justify-between text-[8px] text-ink-700/45 tabular-nums">
              <span>{rec.min} m</span>
              <span className={enSugerido ? 'text-teal-700 font-semibold' : ''}>
                {enSugerido ? 'valor recomendado' : `recomendado ${rec.valor} m`}
              </span>
              <span>{rec.max} m</span>
            </span>
          </div>

          {!enSugerido && (
            <button
              onClick={() => onValor(rec.valor)}
              className="w-full rounded border border-teal-600 text-teal-800 text-[10px] font-semibold py-1 hover:bg-teal-100 transition-colors"
            >
              Volver a los {rec.valor} m que pide la tabla
            </button>
          )}

          <button onClick={() => setVerCriterio(v => !v)} className="flex items-center gap-1 text-[9px] text-teal-700 font-semibold hover:underline">
            <BookOpen className="w-3 h-3" /> {verCriterio ? 'Ocultar el criterio' : 'Por qué esta separación'}
          </button>
          {verCriterio && (
            <div className="rounded bg-white/80 p-2 space-y-1">
              <p className="text-[9px] text-ink-700/75 leading-snug">{rec.criterio}</p>
              {rec.ajustes.map((t, i) => (
                <p key={i} className="text-[9px] text-ink-700/65 leading-snug">· {t}</p>
              ))}
              <p className="text-[8px] text-ink-700/45 leading-tight">
                El deslizador se mueve entre {rec.min} y {rec.max} m: es el margen que admite el criterio.
                Fuente: {rec.fuente}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Resultados ──────────────────────────────────────────────────────────────

function Resultados({ multi, onColocar }: { multi: ResultadoSwalesMulti; onColocar: () => void }) {
  const salieron = multi.bloques.filter(b => b.resultado);
  if (salieron.length === 0) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
        <p className="text-[11px] text-ink-900 font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> No se trazaron swales
        </p>
        {multi.bloques.map(b => <Fallo key={b.id} b={b} />)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 text-center">
        <Stat n={multi.total_swales} u="swales" />
        <Stat n={multi.total_long_m} u="m lineales" />
        <Stat n={multi.total_vol_m3} u="m³ interceptados" />
        <Stat n={multi.total_excavacion_m3} u="m³ a excavar" />
      </div>
      <p className="text-[10px] text-ink-700/60 leading-snug">
        {multi.total_capt_ha} ha de captación en {salieron.length} {salieron.length === 1 ? 'área' : 'áreas'}.
        Lo que se excava es exactamente lo que la zanja almacena.
      </p>

      {multi.bloques.map(b => b.resultado
        ? <BloqueDetalle key={b.id} b={b} solo={multi.bloques.length === 1} />
        : <Fallo key={b.id} b={b} />)}

      <button
        onClick={onColocar}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-teal-700 text-teal-800 text-[12px] font-semibold py-1.5 hover:bg-teal-100 transition-colors"
      >
        <Droplets className="w-3.5 h-3.5" /> Colocar en el plano
      </button>
    </div>
  );
}

function BloqueDetalle({ b, solo }: { b: BloqueSwales; solo: boolean }) {
  const r = b.resultado!;
  return (
    <div className="rounded-md bg-white/70 p-2.5 space-y-1.5">
      {!solo && (
        <p className="text-[10px] font-semibold text-ink-900">
          {b.nombre} <span className="font-normal text-ink-700/55">· pendiente {b.pendiente_pct}%</span>
        </p>
      )}
      <p className="text-[10px] text-ink-700/70 tabular-nums leading-snug">
        {r.swales.length} swales · {r.total_long_m.toLocaleString('es-AR')} m lineales ·
        separación {r.intervaloV} m de desnivel ({r.ancho_franja_m} m de franja) ·
        {' '}{r.total_vol_m3.toLocaleString('es-AR')} m³ interceptados
      </p>
      {r.seccion && <Seccion s={r.seccion} rec={b.recomendacion} />}
      {r.infiltracion && <Infiltracion i={r.infiltracion} />}
    </div>
  );
}

function Fallo({ b }: { b: BloqueSwales }) {
  const d = b.diagnostico;
  if (!d) return null;
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-2 space-y-1">
      <p className="text-[10px] font-semibold text-ink-900">{b.nombre}: sin trazado</p>
      {d.motivo === 'demasiados_swales' && (
        <p className="text-[9px] text-ink-700/75 leading-snug">
          Tiene {d.desnivel_m} m de desnivel. Con {b.intervaloV} m de separación saldrían {d.niveles} swales,
          más de los {d.max_niveles} que se pueden trazar de una vez. Dibujá parcelas más chicas y trazá por partes.
        </p>
      )}
      {d.motivo === 'sin_relieve' && (
        <p className="text-[9px] text-ink-700/75 leading-snug">
          Tiene apenas {d.desnivel_m} m de desnivel, menos que la separación de {b.intervaloV} m.
        </p>
      )}
      {d.motivo === 'sin_tramos' && (
        <p className="text-[9px] text-ink-700/75 leading-snug">
          Las curvas a {b.intervaloV} m no dejan ningún tramo largo adentro del área. Probá con un área más grande.
        </p>
      )}
    </div>
  );
}

// ─── Sección dimensionada ────────────────────────────────────────────────────

function Seccion({ s, rec }: { s: SeccionSwale; rec: Recomendacion }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold text-ink-900 flex items-center gap-1.5">
        <Shovel className="w-3 h-3 text-teal-700" /> Sección de la zanja
      </p>
      <p className="text-[11px] text-ink-900 tabular-nums">
        <strong>{s.base_m} m</strong> de fondo × <strong>{s.prof_m} m</strong> de profundidad,
        taludes 1:{s.talud_z} → boca de {s.ancho_sup_m} m.
      </p>
      <p className="text-[9px] text-ink-700/60 leading-snug">
        Sección {s.area_m2} m² · {s.capacidad_m3.toLocaleString('es-AR')} m³ de movimiento de suelo.
      </p>
      {!s.suficiente && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 space-y-1">
          <p className="text-[10px] text-amber-900 leading-snug">
            Con el tope de profundidad elegido la zanja entra <strong>{s.cobertura_pct} %</strong> del
            agua interceptada (haría falta una sección de {s.area_req_m2} m²). El excedente rebalsa
            hacia el swale de abajo.
          </p>
          <p className="text-[9px] text-amber-900/85 leading-snug">
            {s.intervalo_sugerido !== null && s.intervalo_sugerido >= rec.min
              ? `Bajá la separación de esta parcela a ${s.intervalo_sugerido} m: entra en el rango del criterio y cada zanja recibe menos agua.`
              : `Achicar la separación no alcanza sin salirse del criterio (mínimo ${rec.min} m). Subí la profundidad máxima o aceptá el rebalse controlado hacia el swale de abajo.`}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Verificación de infiltración ────────────────────────────────────────────

const INFIL: Record<InfiltracionSwale['clase'], { txt: string; cls: string }> = {
  rapida:    { txt: 'Se vacía muy rápido: el suelo infiltra tanto que la zanja casi no llega a llenarse. Funciona más como esparcidor que como almacenamiento.', cls: 'text-teal-800' },
  ok:        { txt: 'Se vacía dentro de las 24 h. Es el rango de diseño buscado.', cls: 'text-teal-800' },
  lenta:     { txt: 'Entre 24 y 48 h. Aceptable, pero dos lluvias seguidas la encuentran llena. Considerá menos profundidad o más swales.', cls: 'text-amber-800' },
  muy_lenta: { txt: 'Más de 48 h de agua estancada: mosquitos, anaerobiosis y muerte de la vegetación de la zanja. Este suelo no es apto para infiltrar así — replanteá con más swales chicos, o llevá el agua a una represa.', cls: 'text-orange-800' },
};

function Infiltracion({ i }: { i: InfiltracionSwale }) {
  const d = INFIL[i.clase];
  return (
    <div className="space-y-1 pt-1 border-t border-bone-200">
      <p className="text-[10px] font-semibold text-ink-900 flex items-center gap-1.5">
        <Timer className="w-3 h-3 text-teal-700" /> Tiempo de vaciado
      </p>
      <p className={`text-[11px] font-semibold tabular-nums ${d.cls}`}>
        {i.horas_vaciado} h para infiltrar la zanja llena
      </p>
      <p className={`text-[9px] leading-snug ${d.cls}`}>{d.txt}</p>
      <p className="text-[9px] text-ink-700/50 leading-tight">
        Ksat del perfil {i.ksat_suelo_mm_h} mm/h, de diseño {i.ksat_diseno_mm_h} mm/h (factor de
        seguridad 2: en campo siempre infiltra menos que en la estimación). El agua se va por
        el fondo y por los taludes —éstos contados al 50 %—, así que el tiempo baja a medida
        que el pelo de agua desciende y la zanja se angosta.
      </p>
    </div>
  );
}

// ─── Piezas ──────────────────────────────────────────────────────────────────

function Encabezado() {
  return (
    <div>
      <h3 className="text-[13px] font-bold text-ink-900 flex items-center gap-1.5">
        <Ruler className="w-4 h-4 text-teal-700" /> Zanjas de infiltración (swales)
      </h3>
      <p className="text-[11px] text-ink-700/60 mt-0.5 leading-snug">
        Zanjas a nivel que interceptan la escorrentía y la hacen infiltrar. La separación sale de la
        pendiente de cada ladera, la sección se dimensiona para el agua que capta y se verifica que el
        suelo alcance a vaciarla.
      </p>
    </div>
  );
}

function Auto({ n, u, nota }: { n: string; u: string; nota: string }) {
  return (
    <div className="rounded bg-white/80 py-1.5 px-1">
      <div className="text-[14px] font-bold text-teal-800 tabular-nums leading-none">{n}</div>
      <div className="text-[9px] text-ink-700/65 mt-0.5 leading-tight">{u}</div>
      <div className="text-[8px] text-ink-700/45 leading-tight">{nota}</div>
    </div>
  );
}

function Campo({ label, sufijo, value, min, max, step, onChange, ayuda }: {
  label: string; sufijo: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; ayuda: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[11px] text-ink-700/80">
        <span>{label}</span>
        <span className="tabular-nums font-semibold text-ink-900">{value}{sufijo && ` ${sufijo}`}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full accent-teal-700 mt-1" />
      <span className="text-[9px] text-ink-700/45 leading-tight block">{ayuda}</span>
    </label>
  );
}

function Stat({ n, u }: { n: number; u: string }) {
  return (
    <div className="rounded-md bg-white/70 py-1.5">
      <div className="text-[15px] font-bold text-teal-800 tabular-nums leading-none">{n.toLocaleString('es-AR')}</div>
      <div className="text-[9px] text-ink-700/60 mt-0.5">{u}</div>
    </div>
  );
}
