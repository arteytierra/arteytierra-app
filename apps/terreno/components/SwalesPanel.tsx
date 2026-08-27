'use client';

import { useState } from 'react';
import { Ruler, Droplets, ArrowRight, AlertTriangle, Sparkles, SlidersHorizontal, Timer, Shovel } from 'lucide-react';
import type { ResultadoSwales, OpcionesSwales, DiagnosticoSwales, SeccionSwale, InfiltracionSwale } from '@/lib/swales';
import type { HidrologiaPredio } from '@/lib/hidrologiaPredio';
import { PERIODOS_RETORNO } from '@/lib/hidrologiaPredio';
import { SaludCalculo } from './SaludCalculo';
import type { PoligonoCutFill } from './CutFillPanel';

interface Props {
  grillaLista: boolean;
  swales:      ResultadoSwales | null;
  /** Motor hidrológico compartido: CN, tormenta y coeficiente del predio. */
  hidro:       HidrologiaPredio;
  /** Polígonos ya dibujados (parcelas/zonas/sectores) para acotar el trazado. */
  parcelas?:   PoligonoCutFill[];
  /** Por qué falló el último intento, para explicarlo y ofrecer una salida. */
  diagnostico?: DiagnosticoSwales | null;
  onPeriodoRetorno: (T: number) => void;
  /** `area` = vértices de la parcela elegida, o null para todo el predio. */
  onGenerar:   (opts: OpcionesSwales, area: Array<{ lat: number; lng: number }> | null) => void;
  onColocar:   () => void;
  onIrATopo:   () => void;
  onIrAClima:  () => void;
  onIrASuelo:  () => void;
}

export function SwalesPanel({
  grillaLista, swales, hidro, parcelas = [], diagnostico,
  onPeriodoRetorno, onGenerar, onColocar, onIrATopo, onIrAClima, onIrASuelo,
}: Props) {
  const [intervaloV, setIntervaloV] = useState(1.5);
  const [profMax,    setProfMax]    = useState(0.8);
  const [areaSel,    setAreaSel]    = useState('predio');

  // Override manual: los valores automáticos son el default, pero el usuario que
  // tiene un dato mejor (un ensayo de infiltración, una serie de estación) puede
  // pisarlos. Arrancan cargados con lo que dice el motor, no en cero.
  const [manual,   setManual]   = useState(false);
  const [precipMm, setPrecipMm] = useState(Math.round(hidro.precip_mm));
  const [coef,     setCoef]     = useState(hidro.coef);

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

  return (
    <div className="space-y-3">
      <Encabezado />

      <SaludCalculo confianza={hidro.confianza} />

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

      {parcelas.length > 0 && (
        <label className="block">
          <span className="text-[10px] text-ink-700/60 block mb-0.5">Área a analizar</span>
          <select
            value={areaSel}
            onChange={e => setAreaSel(e.target.value)}
            className="w-full rounded-md border border-bone-300 bg-white px-2 py-1.5 text-[11px] text-ink-900"
          >
            <option value="predio">Todo el predio</option>
            {parcelas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <span className="text-[9px] text-ink-700/45 leading-tight block mt-0.5">
            En predios grandes conviene trabajar por parcela: el desnivel es menor y los swales salen más finos.
          </span>
        </label>
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

      {/* ── Parámetros de trazado ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <Campo label="Separación vertical entre swales" sufijo="m"
          value={intervaloV} min={0.25} max={10} step={0.25} onChange={setIntervaloV}
          ayuda="Cada cuánto de desnivel se traza un swale. Menos = más swales, más juntos y cada uno con menos agua." />
        <Campo label="Profundidad máxima de zanja" sufijo="m"
          value={profMax} min={0.3} max={1.2} step={0.1} onChange={setProfMax}
          ayuda="Tope constructivo. Más de 1 m pide entibado y se vuelve peligroso de mantener." />

        {manual && (
          <>
            <Campo label="Lluvia de diseño (evento)" sufijo="mm"
              value={precipMm} min={5} max={300} step={5} onChange={v => setPrecipMm(Math.round(v))}
              ayuda={`Automático sería ${Math.round(hidro.precip_mm)} mm (T${hidro.periodoRetorno} de tu clima).`} />
            <Campo label="Coeficiente de escorrentía" sufijo=""
              value={coef} min={0.05} max={0.95} step={0.05} onChange={setCoef}
              ayuda={`Automático sería ${hidro.coef.toFixed(2)} (SCS-CN ${hidro.cn.toFixed(0)} sobre ${Math.round(hidro.precip_mm)} mm).`} />
          </>
        )}
      </div>

      <button
        onClick={() => onGenerar(
          {
            intervaloV,
            precipMm:  precipEfectiva,
            coef:      coefEfectivo,
            profMax_m: profMax,
            ksat_mm_h: hidro.ksat_mm_h,
          },
          parcelas.find(p => p.id === areaSel)?.vertices ?? null,
        )}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 text-white text-[12px] font-semibold py-2 hover:bg-teal-800 transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" /> Generar y dimensionar swales
      </button>

      {diagnostico && !diagnostico.puede && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
          <p className="text-[11px] text-ink-900 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            No se trazaron swales
          </p>
          {diagnostico.motivo === 'demasiados_swales' && (
            <p className="text-[10px] text-ink-700/75 leading-snug">
              {areaSel === 'predio' ? 'El predio' : 'La parcela'} tiene {diagnostico.desnivel_m} m de desnivel.
              Con {intervaloV} m de separación saldrían <strong>{diagnostico.niveles} swales</strong>, más de
              los {diagnostico.max_niveles} que se pueden trazar de una vez.
            </p>
          )}
          {diagnostico.motivo === 'sin_relieve' && (
            <p className="text-[10px] text-ink-700/75 leading-snug">
              {areaSel === 'predio' ? 'El predio' : 'La parcela'} tiene apenas {diagnostico.desnivel_m} m de
              desnivel, menos que la separación de {intervaloV} m que elegiste. Bajá la separación.
            </p>
          )}
          {diagnostico.motivo === 'sin_tramos' && (
            <p className="text-[10px] text-ink-700/75 leading-snug">
              Las curvas a {intervaloV} m no dejan ningún tramo suficientemente largo dentro
              de {areaSel === 'predio' ? 'el predio' : 'la parcela'}. Probá con una separación menor
              o con un área más grande.
            </p>
          )}
          {diagnostico.intervalo_sugerido !== null && diagnostico.motivo === 'demasiados_swales' && (
            <button
              onClick={() => setIntervaloV(diagnostico.intervalo_sugerido!)}
              className="w-full rounded-md border border-amber-500 text-amber-800 text-[11px] font-semibold py-1.5 hover:bg-amber-100 transition-colors"
            >
              Usar {diagnostico.intervalo_sugerido} m de separación
            </button>
          )}
          {parcelas.length > 0 && areaSel === 'predio' && (
            <p className="text-[9px] text-ink-700/55 leading-tight">
              O elegí arriba una parcela dibujada para trazarlos con más detalle en un sector.
            </p>
          )}
          {parcelas.length === 0 && (
            <p className="text-[9px] text-ink-700/55 leading-tight">
              Otra salida: dibujá un polígono sobre el sector que te interesa y elegilo como área a analizar.
            </p>
          )}
        </div>
      )}

      {swales && (
        <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat n={swales.swales.length} u="swales" />
            <Stat n={swales.total_long_m} u="m lineales" />
            <Stat n={swales.total_vol_m3} u="m³ interceptados" />
            <Stat n={swales.total_capt_ha} u="ha de captación" />
          </div>
          <p className="text-[10px] text-ink-700/60 leading-snug">
            Franja de captación ≈ {swales.ancho_franja_m} m entre swales · intervalo {swales.intervaloV} m.
          </p>

          {swales.seccion    && <Seccion s={swales.seccion} onUsarIntervalo={setIntervaloV} />}
          {swales.infiltracion && <Infiltracion i={swales.infiltracion} />}

          <button
            onClick={onColocar}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-teal-700 text-teal-800 text-[12px] font-semibold py-1.5 hover:bg-teal-100 transition-colors"
          >
            <Droplets className="w-3.5 h-3.5" /> Colocar en el plano
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sección dimensionada ────────────────────────────────────────────────────

function Seccion({ s, onUsarIntervalo }: { s: SeccionSwale; onUsarIntervalo: (v: number) => void }) {
  return (
    <div className="rounded-md bg-white/70 p-2.5 space-y-1.5">
      <p className="text-[10px] font-semibold text-ink-900 flex items-center gap-1.5">
        <Shovel className="w-3 h-3 text-teal-700" /> Sección de la zanja
      </p>
      <p className="text-[11px] text-ink-900 tabular-nums">
        <strong>{s.base_m} m</strong> de fondo × <strong>{s.prof_m} m</strong> de profundidad,
        taludes 1:{s.talud_z} → boca de {s.ancho_sup_m} m.
      </p>
      <p className="text-[9px] text-ink-700/60 leading-snug">
        Sección {s.area_m2} m² · se excavan {s.capacidad_m3.toLocaleString('es-AR')} m³ de suelo, que es
        justamente lo que la zanja almacena.
      </p>
      {!s.suficiente && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 space-y-1.5">
          <p className="text-[10px] text-amber-900 leading-snug">
            Con el tope de profundidad elegido la zanja entra <strong>{s.cobertura_pct} %</strong> del
            agua interceptada (haría falta una sección de {s.area_req_m2} m²). El excedente rebalsa
            hacia el swale de abajo.
          </p>
          {s.intervalo_sugerido !== null && (
            <button
              onClick={() => onUsarIntervalo(s.intervalo_sugerido!)}
              className="w-full rounded border border-amber-500 text-amber-800 text-[10px] font-semibold py-1 hover:bg-amber-100 transition-colors"
            >
              Bajar a {s.intervalo_sugerido} m de separación (más swales, cada uno con menos agua)
            </button>
          )}
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
    <div className="rounded-md bg-white/70 p-2.5 space-y-1">
      <p className="text-[10px] font-semibold text-ink-900 flex items-center gap-1.5">
        <Timer className="w-3 h-3 text-teal-700" /> Tiempo de vaciado
      </p>
      <p className={`text-[11px] font-semibold tabular-nums ${d.cls}`}>
        {i.horas_vaciado} h para infiltrar la zanja llena
      </p>
      <p className={`text-[9px] leading-snug ${d.cls}`}>{d.txt}</p>
      <p className="text-[9px] text-ink-700/50 leading-tight">
        Ksat del perfil {i.ksat_suelo_mm_h} mm/h, de diseño {i.ksat_diseno_mm_h} mm/h (factor de
        seguridad 2: en campo siempre infiltra menos que en la estimación).
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
        Zanjas a nivel que interceptan la escorrentía y la hacen infiltrar. Se trazan sobre las curvas
        de nivel, se dimensiona la sección para el agua que captan y se verifica que el suelo alcance
        a vaciarlas.
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
