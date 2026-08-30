'use client';

import { useState, useEffect } from 'react';
import { Trees, MapPin, ArrowRight } from 'lucide-react';
import type { ResultadoSilvo, OpcionesSilvo } from '@/lib/silvopastura';

/** Lo que el usuario ajusta acá; se guarda para no perderlo al cambiar de pestaña. */
export interface SilvoInputs { intervaloV: number; espaciamiento: number }

interface Props {
  grillaLista:  boolean;
  silvopastura: ResultadoSilvo | null;
  onGenerar:    (opts: OpcionesSilvo) => void;
  onColocar:    () => void;
  onIrATopo:    () => void;
  inicial?:     SilvoInputs | null;
  onInputs?:    (i: SilvoInputs) => void;
}

export function SilvopasturaPanel({ grillaLista, silvopastura, onGenerar, onColocar, onIrATopo, inicial, onInputs }: Props) {
  const [intervaloV, setIntervaloV]       = useState(inicial?.intervaloV ?? 6);
  const [espaciamiento, setEspaciamiento] = useState(inicial?.espaciamiento ?? 6);
  useEffect(() => { onInputs?.({ intervaloV, espaciamiento }); }, [intervaloV, espaciamiento, onInputs]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[13px] font-bold text-ink-900 flex items-center gap-1.5">
          <Trees className="w-4 h-4 text-green-800" /> Silvopastura
        </h3>
        <p className="text-[11px] text-ink-700/60 mt-0.5 leading-snug">
          Hileras de árboles a nivel sobre las curvas, con pasto entre ellas: sombra para el ganado,
          forraje, cortina interna y retención de agua y suelo sin perder superficie de pastoreo.
        </p>
      </div>

      {!grillaLista ? (
        <div className="rounded-lg border border-bone-200 bg-bone-50 p-3 text-[11px] text-ink-700/70">
          Primero calculá la topografía para trazar las hileras sobre las curvas de nivel.
          <button onClick={onIrATopo} className="mt-2 flex items-center gap-1 text-green-800 font-semibold hover:underline">
            Ir a Topografía <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Campo label="Separación entre hileras (vertical)" sufijo="m"
              value={intervaloV} min={1} max={20} step={1} onChange={setIntervaloV}
              ayuda="Desnivel entre una hilera y la siguiente ladera abajo." />
            <Campo label="Distancia entre árboles" sufijo="m"
              value={espaciamiento} min={2} max={20} step={1} onChange={setEspaciamiento}
              ayuda="Espaciamiento de plantación dentro de cada hilera." />
          </div>

          <button
            onClick={() => onGenerar({ intervaloV, espaciamiento })}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-green-800 text-white text-[12px] font-semibold py-2 hover:bg-green-900 transition-colors"
          >
            <Trees className="w-3.5 h-3.5" /> Generar hileras
          </button>

          {silvopastura && (
            <div className="rounded-lg border border-green-200 bg-green-50/60 p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat n={silvopastura.hileras.length} u="hileras" />
                <Stat n={silvopastura.total_long_m} u="m lineales" />
                <Stat n={silvopastura.total_arboles} u="árboles" />
              </div>
              <p className="text-[10px] text-ink-700/60 leading-snug">
                Hileras cada {silvopastura.intervaloV} m de desnivel · árboles cada {silvopastura.espaciamiento} m.
                Orientativo — no elige especie ni valida densidad.
              </p>
              <button
                onClick={onColocar}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-green-800 text-green-900 text-[12px] font-semibold py-1.5 hover:bg-green-100 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" /> Colocar en el plano
              </button>
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
