'use client';

import { useState, useEffect } from 'react';
import { Flame, MapPin, ArrowRight } from 'lucide-react';
import type { ResultadoCortafuegos } from '@/lib/cortafuegos';

/** Lo que el usuario ajusta acá; se guarda para no perderlo al cambiar de pestaña. */
export interface CortafuegosInputs { anchoM: number }

interface Props {
  topoLista:   boolean;
  cortafuegos: ResultadoCortafuegos | null;
  onGenerar:   (anchoM: number) => void;
  onColocar:   () => void;
  onIrATopo:   () => void;
  inicial?:    CortafuegosInputs | null;
  onInputs?:   (i: CortafuegosInputs) => void;
}

export function CortafuegosPanel({ topoLista, cortafuegos, onGenerar, onColocar, onIrATopo, inicial, onInputs }: Props) {
  const [anchoM, setAnchoM] = useState(inicial?.anchoM ?? 8);
  useEffect(() => { onInputs?.({ anchoM }); }, [anchoM, onInputs]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[13px] font-bold text-ink-900 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-700" /> Cortafuegos
        </h3>
        <p className="text-[11px] text-ink-700/60 mt-0.5 leading-snug">
          Fajas cortafuego sobre las líneas de cresta (divisorias): cortan la ladera arriba, son de
          fácil acceso y el fuego pierde impulso al llegar al filo.
        </p>
      </div>

      {!topoLista ? (
        <div className="rounded-lg border border-bone-200 bg-bone-50 p-3 text-[11px] text-ink-700/70">
          Primero calculá la topografía para detectar las líneas de cresta.
          <button onClick={onIrATopo} className="mt-2 flex items-center gap-1 text-orange-700 font-semibold hover:underline">
            Ir a Topografía <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <label className="block">
            <span className="flex items-center justify-between text-[11px] text-ink-700/80">
              <span>Ancho de la faja despejada</span>
              <span className="tabular-nums font-semibold text-ink-900">{anchoM} m</span>
            </span>
            <input type="range" min={3} max={30} step={1} value={anchoM}
              onChange={e => setAnchoM(+e.target.value)} className="w-full accent-orange-700 mt-1" />
            <span className="text-[9px] text-ink-700/45 leading-tight block">
              Según combustible y pendiente: 4–8 m en pastizal, 10–20 m en monte.
            </span>
          </label>

          <button
            onClick={() => onGenerar(anchoM)}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-orange-700 text-white text-[12px] font-semibold py-2 hover:bg-orange-800 transition-colors"
          >
            <Flame className="w-3.5 h-3.5" /> Detectar cortafuegos
          </button>

          {cortafuegos && (
            <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat n={cortafuegos.lineas.length} u="fajas" />
                <Stat n={cortafuegos.total_long_m} u="m lineales" />
                <Stat n={cortafuegos.total_area_ha} u="ha despejadas" />
              </div>
              <p className="text-[10px] text-ink-700/60 leading-snug">
                Ancho {cortafuegos.anchoM} m. Orientativo — no reemplaza un plan de manejo del fuego.
              </p>
              <button
                onClick={onColocar}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-orange-700 text-orange-800 text-[12px] font-semibold py-1.5 hover:bg-orange-100 transition-colors"
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

function Stat({ n, u }: { n: number; u: string }) {
  return (
    <div className="rounded-md bg-white/70 py-1.5">
      <div className="text-[15px] font-bold text-orange-800 tabular-nums leading-none">{n.toLocaleString('es-AR')}</div>
      <div className="text-[9px] text-ink-700/60 mt-0.5">{u}</div>
    </div>
  );
}
