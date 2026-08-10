'use client';

import { useState } from 'react';
import { Ruler, Droplets, ArrowRight } from 'lucide-react';
import type { ResultadoSwales, OpcionesSwales } from '@/lib/swales';

interface Props {
  grillaLista: boolean;
  swales:      ResultadoSwales | null;
  precipDefault?: number;
  onGenerar:   (opts: OpcionesSwales) => void;
  onColocar:   () => void;
  onIrATopo:   () => void;
}

export function SwalesPanel({ grillaLista, swales, precipDefault, onGenerar, onColocar, onIrATopo }: Props) {
  const [intervaloV, setIntervaloV] = useState(1.5);
  const [precipMm,   setPrecipMm]   = useState(Math.round(precipDefault ?? 50));
  const [coef,       setCoef]       = useState(0.45);

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

      <div className="space-y-2">
        <Campo label="Separación vertical entre swales" sufijo="m"
          value={intervaloV} min={0.25} max={10} step={0.25} onChange={setIntervaloV}
          ayuda="Cada cuánto de desnivel se traza un swale. Menos = más swales, más juntos." />
        <Campo label="Lluvia de diseño (evento)" sufijo="mm"
          value={precipMm} min={5} max={300} step={5} onChange={v => setPrecipMm(Math.round(v))}
          ayuda="Tormenta a interceptar. Usá la máxima diaria de tu clima." />
        <Campo label="Coeficiente de escorrentía" sufijo=""
          value={coef} min={0.05} max={0.95} step={0.05} onChange={setCoef}
          ayuda="Fracción de la lluvia que escurre (0,2 monte–0,6 suelo desnudo/duro)." />
      </div>

      <button
        onClick={() => onGenerar({ intervaloV, precipMm, coef })}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 text-white text-[12px] font-semibold py-2 hover:bg-teal-800 transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" /> Generar swales
      </button>

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
            Estimación orientativa (no dimensiona la sección de la zanja).
          </p>
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

function Encabezado() {
  return (
    <div>
      <h3 className="text-[13px] font-bold text-ink-900 flex items-center gap-1.5">
        <Ruler className="w-4 h-4 text-teal-700" /> Zanjas de infiltración (swales)
      </h3>
      <p className="text-[11px] text-ink-700/60 mt-0.5 leading-snug">
        Zanjas a nivel que interceptan la escorrentía y la hacen infiltrar. Se trazan sobre las curvas
        de nivel y se estima el agua que captan por evento de lluvia.
      </p>
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
