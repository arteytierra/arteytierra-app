'use client';

import { useState } from 'react';
import { Ruler, Droplets, ArrowRight, AlertTriangle } from 'lucide-react';
import type { ResultadoSwales, OpcionesSwales, DiagnosticoSwales } from '@/lib/swales';
import type { PoligonoCutFill } from './CutFillPanel';

interface Props {
  grillaLista: boolean;
  swales:      ResultadoSwales | null;
  precipDefault?: number;
  /** Polígonos ya dibujados (parcelas/zonas/sectores) para acotar el trazado. */
  parcelas?:   PoligonoCutFill[];
  /** Por qué falló el último intento, para explicarlo y ofrecer una salida. */
  diagnostico?: DiagnosticoSwales | null;
  /** `area` = vértices de la parcela elegida, o null para todo el predio. */
  onGenerar:   (opts: OpcionesSwales, area: Array<{ lat: number; lng: number }> | null) => void;
  onColocar:   () => void;
  onIrATopo:   () => void;
}

export function SwalesPanel({
  grillaLista, swales, precipDefault, parcelas = [], diagnostico,
  onGenerar, onColocar, onIrATopo,
}: Props) {
  const [intervaloV, setIntervaloV] = useState(1.5);
  const [precipMm,   setPrecipMm]   = useState(Math.round(precipDefault ?? 50));
  const [coef,       setCoef]       = useState(0.45);
  const [areaSel,    setAreaSel]    = useState('predio');

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

      <div className="space-y-2">
        <Campo label="Separación vertical entre swales" sufijo="m"
          value={intervaloV} min={0.25} max={10} step={0.25} onChange={setIntervaloV}
          ayuda="Cada cuánto de desnivel se traza un swale. Menos = más swales, más juntos." />
        <Campo label="Lluvia de diseño (evento)" sufijo="mm"
          value={precipMm} min={5} max={300} step={5} onChange={v => setPrecipMm(Math.round(v))}
          ayuda={precipDefault
            ? `Tormenta a interceptar. Autocompletada con la de tu clima (${Math.round(precipDefault)} mm).`
            : 'Tormenta a interceptar. Cargá Clima → Extremos para autocompletarla.'} />
        <Campo label="Coeficiente de escorrentía" sufijo=""
          value={coef} min={0.05} max={0.95} step={0.05} onChange={setCoef}
          ayuda="Fracción de la lluvia que escurre (0,2 monte–0,6 suelo desnudo/duro)." />
      </div>

      <button
        onClick={() => onGenerar(
          { intervaloV, precipMm, coef },
          parcelas.find(p => p.id === areaSel)?.vertices ?? null,
        )}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 text-white text-[12px] font-semibold py-2 hover:bg-teal-800 transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" /> Generar swales
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
