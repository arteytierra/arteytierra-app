'use client';

import { useState, useEffect } from 'react';
import { Fence, MapPin, Sparkles, Pencil, X, AlertTriangle } from 'lucide-react';
import type { CortinaResultado } from '@/lib/cortinas';
import { FACTOR_PROTECCION, LARGO_MINIMO_H } from '@/lib/cortinas';
import { RUMBOS, type RosaFria } from '@/lib/viento';

/** Lo que el usuario ajusta acá; se guarda para no perderlo al cambiar de pestaña. */
export interface CortinasInputs { ancho: number; alto: number }

interface Props {
  terrenoListo: boolean;
  tieneCasa:    boolean;
  dibujando:    boolean;
  cortina:      CortinaResultado | null;
  /** El viento medido del trimestre más frío, o `null` si no hay clima cargado. */
  viento:       RosaFria | null;
  /** El rumbo que eligió el usuario, que pisa al medido. `null` = usar el medido. */
  rumboElegido: string | null;
  onRumbo:      (rumbo: string | null) => void;
  onIrAClima:   () => void;
  onSugerir:    (ancho_m: number, alto_m: number) => void;
  onDibujar:    (ancho_m: number, alto_m: number) => void;
  onCancelarDibujo: () => void;
  onColocar:    () => void;
  inicial?:     CortinasInputs | null;
  onInputs?:    (i: CortinasInputs) => void;
}

export function CortinasPanel({ terrenoListo, tieneCasa, dibujando, cortina, viento, rumboElegido, onRumbo, onIrAClima, onSugerir, onDibujar, onCancelarDibujo, onColocar, inicial, onInputs }: Props) {
  const [ancho, setAncho] = useState(inicial?.ancho ?? 8);
  const [alto,  setAlto]  = useState(inicial?.alto ?? 10);
  useEffect(() => { onInputs?.({ ancho, alto }); }, [ancho, alto, onInputs]);

  const hayRumbo = rumboElegido !== null || viento !== null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[13px] font-bold text-ink-900 flex items-center gap-1.5">
          <Fence className="w-4 h-4 text-green-800" /> Cortinas rompevientos
        </h3>
        <p className="text-[11px] text-ink-700/60 mt-0.5 leading-snug">
          Franja multiestrato de árboles y arbustos (varias alturas) que frena el viento de forma porosa.
          Diseñá su <b>ancho</b> y <b>altura</b> y el sistema calcula los metros de protección a sotavento.
        </p>
      </div>

      {!terrenoListo ? (
        <div className="rounded-lg border border-bone-200 bg-bone-50 p-3 text-[11px] text-ink-700/70">
          Cargá el terreno (al menos 3 mojones) para diseñar cortinas.
        </div>
      ) : (
        <>
          {/* ── Contra qué viento ── */}
          <ContraQueViento
            viento={viento}
            rumboElegido={rumboElegido}
            onRumbo={onRumbo}
            onIrAClima={onIrAClima}
          />

          {/* ── Diseño de la cortina ── */}
          <div className="space-y-2">
            <Campo label="Ancho de la franja" sufijo="m"
              value={ancho} min={2} max={30} step={1} onChange={setAncho}
              ayuda="Cuántos metros de ancho ocupa la plantación (varias hileras)." />
            <Campo label="Altura a la madurez (estrato más alto)" sufijo="m"
              value={alto} min={3} max={25} step={1} onChange={setAlto}
              ayuda={`Define el alcance del reparo: la protección llega a ~${FACTOR_PROTECCION}× la altura.`} />
            <div className="rounded-md bg-green-50/60 border border-green-200 px-2.5 py-1.5 text-[10px] text-ink-700/70">
              Protección estimada a sotavento: <b className="text-green-900 tabular-nums">{alto * FACTOR_PROTECCION} m</b> (≈{FACTOR_PROTECCION}× la altura).
              {' '}Y para que el aire no dé la vuelta por las puntas, la cortina tendría que medir al menos{' '}
              <b className="text-green-900 tabular-nums">{alto * LARGO_MINIMO_H} m</b> de largo.
            </div>
          </div>

          {/* ── Acciones ── */}
          {dibujando ? (
            <div className="rounded-lg border border-green-300 bg-green-50/60 p-3 space-y-2">
              <p className="text-[11px] text-ink-900 leading-snug">
                Hacé clic en el mapa para marcar el <b>eje</b> de la cortina. <b>Enter</b> finaliza · <b>Esc</b> cancela.
              </p>
              <button onClick={onCancelarDibujo}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-ink-300 text-ink-700 text-[12px] font-semibold py-1.5 hover:bg-bone-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Cancelar dibujo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => onSugerir(ancho, alto)} disabled={!hayRumbo}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-green-800 text-white text-[11px] font-semibold py-2 hover:bg-green-900 transition-colors disabled:opacity-40 disabled:hover:bg-green-800">
                <Sparkles className="w-3.5 h-3.5" /> Sugerir
              </button>
              <button onClick={() => onDibujar(ancho, alto)} disabled={!hayRumbo}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-green-800 text-green-900 text-[11px] font-semibold py-2 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent">
                <Pencil className="w-3.5 h-3.5" /> Dibujar
              </button>
            </div>
          )}
          {!dibujando && (
            <p className="text-[9px] text-ink-700/45 leading-tight">
              «Sugerir» ubica la cortina aguas arriba de {tieneCasa ? 'tu casa (zona 0)' : 'el centro del predio'} para
              protegerla del viento{tieneCasa ? '' : ' (marcá la zona 0 en Master Plan para apuntar a la casa)'}.
            </p>
          )}

          {/* ── Resultado ── */}
          {cortina && (
            <div className="rounded-lg border border-green-200 bg-green-50/60 p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat n={cortina.longitud_m} u="m de cortina" />
                <Stat n={cortina.proteccion_m} u="m protegidos" />
                <Stat n={cortina.area_protegida_ha} u="ha resguardadas" />
              </div>
              <p className="text-[10px] text-ink-700/60 leading-snug">
                Franja de {cortina.ancho_m} m · altura {cortina.alto_m} m · reparo del viento que entra
                del {cortina.dir_viento_frio} ({cortina.viento_az}°).
                {cortina.origen === 'sugerida' ? ' Ubicación sugerida — ajustala o redibujala.' : ''}
              </p>

              {cortina.corta && (
                <p className="flex gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2 py-1.5 text-[10px] text-amber-900 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span>
                    Le faltan <b className="tabular-nums">{cortina.falta_largo_m} m</b> de largo para llegar
                    a {LARGO_MINIMO_H} veces su altura. Por debajo de eso el aire da la vuelta por las puntas,
                    así que las <b>hectáreas resguardadas de arriba están sobreestimadas</b>.
                  </span>
                </p>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-ink-900">Los tres estratos, y para qué sirve cada uno</p>
                {cortina.estratos.map((e, i) => (
                  <div key={i} className="text-[9px] text-ink-700/70 leading-snug">
                    <span className="font-semibold text-ink-800">{e.estrato}</span> <span className="text-ink-700/40">({e.altura})</span>: {e.funcion}
                  </div>
                ))}
              </div>

              {cortina.flora_nativa.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-ink-900">Flora nativa de este ecosistema</p>
                  <p className="text-[9px] text-ink-700/70 leading-snug">
                    {cortina.flora_nativa.map(s => s.split(' (')[0]).join(', ')}.
                  </p>
                  <p className="text-[9px] text-ink-700/45 leading-tight">
                    Sale de la ficha del ecosistema del predio (pestaña Contexto), que no dice la altura
                    de cada una: cuál va en cada estrato lo decide el vivero, no la app.
                  </p>
                </div>
              ) : (
                <p className="text-[9px] text-ink-700/45 leading-tight">
                  Las especies no se sugieren: la ficha del ecosistema de este predio todavía no trae
                  flora nativa, y una lista de otra región no es una lista de nativas.
                </p>
              )}

              <button onClick={onColocar}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-green-800 text-green-900 text-[12px] font-semibold py-1.5 hover:bg-green-100 transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Colocar en el plano
              </button>
              <p className="text-[9px] text-ink-700/45 leading-tight">
                Orientativo — no elige el vivero real ni valida densidades. La protección es una
                estimación (≈{FACTOR_PROTECCION}× la altura, dentro de la banda de 10 a 30 que publica la
                literatura).
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * De dónde entra el viento, y de dónde salió esa respuesta.
 *
 * Esto es nuevo del 30/10/2026 y antes no existía porque no hacía falta: el
 * azimut lo ponía `azimutVientoFrio(lat)`, que devolvía el norte o el sur según
 * el hemisferio sin mirar ningún dato. Ahora sale de la serie medida, así que
 * hay que decir de qué meses y con cuánta concentración —y dejar que lo cambie
 * quien vive ahí, que sabe más que una celda de 50 km—.
 */
function ContraQueViento({ viento, rumboElegido, onRumbo, onIrAClima }: {
  viento: RosaFria | null;
  rumboElegido: string | null;
  onRumbo: (r: string | null) => void;
  onIrAClima: () => void;
}) {
  const usado = rumboElegido ?? viento?.rumbo ?? null;

  return (
    <div className="rounded-lg border border-bone-200 bg-bone-50 p-2.5 space-y-1.5">
      <p className="text-[10px] font-semibold text-ink-900">Contra qué viento se orienta</p>

      {viento ? (
        <p className="text-[10px] text-ink-700/70 leading-snug">
          Medido: el viento entra del <b className="text-ink-900">{viento.rumbo}</b> ({viento.az_deg}°),
          {viento.periodo === 'trimestre_frio'
            ? ` promedio del trimestre más frío (${viento.meses.join(', ')}).`
            : ' promedio del año, porque los meses fríos no traen dirección.'}
          {viento.disperso
            ? ` La rosa de esos meses está partida (concentración ${viento.concentracion} de 1): entra por más de un lado, y una sola cortina no alcanza.`
            : ` Concentración ${viento.concentracion} de 1.`}
        </p>
      ) : (
        <p className="text-[10px] text-ink-700/70 leading-snug">
          No hay viento medido todavía.{' '}
          <button onClick={onIrAClima} className="text-water-600 hover:underline font-semibold">
            Calculá el clima
          </button>
          {' '}o elegí abajo el rumbo del que entra. Sin una de las dos cosas la cortina no se dibuja:
          el default por hemisferio que había acá erraba por más de 130° en dos de los tres predios
          que la app tiene medidos.
        </p>
      )}

      <label className="block">
        <span className="text-[10px] text-ink-700/80">
          {viento ? 'Corregilo si conocés el predio' : 'Rumbo del que entra el viento'}
        </span>
        <select
          value={rumboElegido ?? ''}
          onChange={e => onRumbo(e.target.value === '' ? null : e.target.value)}
          className="mt-1 w-full rounded-md border border-bone-300 bg-white px-2 py-1 text-[11px] text-ink-900"
        >
          <option value="">{viento ? `Usar el medido (${viento.rumbo})` : 'Elegí un rumbo…'}</option>
          {RUMBOS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>

      {rumboElegido !== null && viento !== null && rumboElegido !== viento.rumbo && (
        <p className="text-[9px] text-ink-700/45 leading-tight">
          Se usa el {rumboElegido}, que elegiste vos, y no el {viento.rumbo} que mide la serie.
        </p>
      )}
      {usado === null && (
        <p className="text-[9px] text-ink-700/45 leading-tight">
          Falta esto para poder sugerir o dibujar.
        </p>
      )}
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
        onChange={e => onChange(+e.target.value)} className="w-full accent-green-800 mt-1" />
      <span className="text-[9px] text-ink-700/45 leading-tight block">{ayuda}</span>
    </label>
  );
}

function Stat({ n, u }: { n: number; u: string }) {
  return (
    <div className="rounded-md bg-white/70 py-1.5">
      <div className="text-[15px] font-bold text-green-900 tabular-nums leading-none">{n.toLocaleString('es-AR')}</div>
      <div className="text-[9px] text-ink-700/60 mt-0.5">{u}</div>
    </div>
  );
}
