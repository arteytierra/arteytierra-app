'use client';

import { useState, useEffect } from 'react';
import { Fence, MapPin, Sparkles, Pencil, X } from 'lucide-react';
import type { CortinaResultado } from '@/lib/cortinas';

/** Lo que el usuario ajusta acá; se guarda para no perderlo al cambiar de pestaña. */
export interface CortinasInputs { ancho: number; alto: number }

interface Props {
  terrenoListo: boolean;
  tieneCasa:    boolean;
  dibujando:    boolean;
  cortina:      CortinaResultado | null;
  onSugerir:    (ancho_m: number, alto_m: number) => void;
  onDibujar:    (ancho_m: number, alto_m: number) => void;
  onCancelarDibujo: () => void;
  onColocar:    () => void;
  inicial?:     CortinasInputs | null;
  onInputs?:    (i: CortinasInputs) => void;
}

export function CortinasPanel({ terrenoListo, tieneCasa, dibujando, cortina, onSugerir, onDibujar, onCancelarDibujo, onColocar, inicial, onInputs }: Props) {
  const [ancho, setAncho] = useState(inicial?.ancho ?? 8);
  const [alto,  setAlto]  = useState(inicial?.alto ?? 10);
  useEffect(() => { onInputs?.({ ancho, alto }); }, [ancho, alto, onInputs]);

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
          {/* ── Diseño de la cortina ── */}
          <div className="space-y-2">
            <Campo label="Ancho de la franja" sufijo="m"
              value={ancho} min={2} max={30} step={1} onChange={setAncho}
              ayuda="Cuántos metros de ancho ocupa la plantación (varias hileras)." />
            <Campo label="Altura a la madurez (estrato más alto)" sufijo="m"
              value={alto} min={3} max={25} step={1} onChange={setAlto}
              ayuda="Define el alcance del reparo: la protección llega a ~15× la altura." />
            <div className="rounded-md bg-green-50/60 border border-green-200 px-2.5 py-1.5 text-[10px] text-ink-700/70">
              Protección estimada a sotavento: <b className="text-green-900 tabular-nums">{alto * 15} m</b> (≈15× la altura).
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
              <button onClick={() => onSugerir(ancho, alto)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-green-800 text-white text-[11px] font-semibold py-2 hover:bg-green-900 transition-colors">
                <Sparkles className="w-3.5 h-3.5" /> Sugerir
              </button>
              <button onClick={() => onDibujar(ancho, alto)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-green-800 text-green-900 text-[11px] font-semibold py-2 hover:bg-green-100 transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Dibujar
              </button>
            </div>
          )}
          {!dibujando && (
            <p className="text-[9px] text-ink-700/45 leading-tight">
              «Sugerir» ubica la cortina aguas arriba de {tieneCasa ? 'tu casa (zona 0)' : 'el centro del predio'} para
              protegerla del viento frío{tieneCasa ? '' : ' (marcá la zona 0 en Master Plan para apuntar a la casa)'}.
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
                Franja de {cortina.ancho_m} m · altura {cortina.alto_m} m · reparo del viento frío del {cortina.dir_viento_frio}.
                {cortina.origen === 'sugerida' ? ' Ubicación sugerida — ajustala o redibujala.' : ''}
              </p>

              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-ink-900">Estratos sugeridos (nativas)</p>
                {cortina.estratos.map((e, i) => (
                  <div key={i} className="text-[9px] text-ink-700/70 leading-snug">
                    <span className="font-semibold text-ink-800">{e.estrato}</span> <span className="text-ink-700/40">({e.altura})</span>: {e.especies.map(s => s.split(' (')[0]).join(', ')}
                  </div>
                ))}
              </div>

              <button onClick={onColocar}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-green-800 text-green-900 text-[12px] font-semibold py-1.5 hover:bg-green-100 transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Colocar en el plano
              </button>
              <p className="text-[9px] text-ink-700/45 leading-tight">
                Orientativo — no elige el vivero real ni valida densidades. La protección es una estimación (≈15× la altura).
              </p>
            </div>
          )}
        </>
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
