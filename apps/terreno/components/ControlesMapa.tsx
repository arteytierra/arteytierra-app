'use client';

import { Plus, Minus, Layers, History, Mountain, Satellite, Map as MapIcon, ListChecks } from 'lucide-react';
import type { NavegacionMapa } from './MapLeaflet';

export type CapaFondo = 'satelite' | 'topo';

interface Props {
  navegacion:    NavegacionMapa | null;
  /** Rumbo del plano en grados (0 = norte arriba). */
  bearing:       number;
  capaFondo:     CapaFondo;
  onCapaFondo:   (c: CapaFondo) => void;
  /** Histórico y 3D necesitan el polígono cerrado. */
  habilitarVistas: boolean;
  onHistorico:   () => void;
  on3D:          () => void;
  capasAbierto:  boolean;
  onCapas:       () => void;
  escalaAbierta: boolean;
  onEscala:      () => void;
}

const BOTON = 'flex items-center justify-center text-ink-700 hover:bg-bone-100 transition-colors disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed';

/**
 * Panel único de navegación, arriba a la derecha: zoom, brújula, capa de fondo,
 * histórico, 3D y capas. Antes estaban repartidos entre las cuatro esquinas del
 * mapa, lo que obligaba a barrer la pantalla para una tarea sola.
 *
 * El zoom y el rumbo son del mapa de Leaflet, que vive dentro del MapContainer;
 * llegan acá por el puente `NavegacionExposer`.
 */
export function ControlesMapa({
  navegacion, bearing, capaFondo, onCapaFondo,
  habilitarVistas, onHistorico, on3D, capasAbierto, onCapas, escalaAbierta, onEscala,
}: Props) {
  const grados = Math.round(((bearing % 360) + 360) % 360);
  const girado = Math.min(grados, 360 - grados) >= 1;

  return (
    <div className="flex flex-col items-end gap-1.5 no-print">
      {/* ── 3D + Zoom + brújula ── */}
      <div className="flex items-center gap-1.5">
        {habilitarVistas && (
          <button
            onClick={on3D}
            title="Vista 3D del relieve"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border bg-white/95 text-ink-700 border-white/30 hover:bg-bone-50"
          >
            <Mountain className="w-3.5 h-3.5" />
            3D
          </button>
        )}
        <div className="flex items-stretch rounded-lg overflow-hidden bg-white/95 shadow-md border border-white/30">
        <button
          onClick={() => navegacion?.zoomOut()}
          disabled={!navegacion}
          title="Alejar"
          className={`${BOTON} w-8 h-8 border-r border-bone-200`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => navegacion?.zoomIn()}
          disabled={!navegacion}
          title="Acercar"
          className={`${BOTON} w-8 h-8 border-r border-bone-200`}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => girado && navegacion?.alNorte()}
          disabled={!girado}
          title={girado ? `Rumbo ${grados}° — clic para volver el norte arriba` : 'Norte arriba'}
          className={`${BOTON} w-9 h-8 gap-0.5 ${girado ? 'cursor-pointer' : 'cursor-default opacity-100'}`}
        >
          {/* El norte del terreno queda a -bearing respecto de la pantalla. */}
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${-grados}deg)` }}>
            <polygon points="24,4 17,26 31,26" fill="#c0392b" />
            <polygon points="24,44 17,26 31,26" fill="#9a9a9a" />
            <circle cx="24" cy="26" r="3" fill="white" stroke="#9a9a9a" strokeWidth="2" />
          </svg>
          {girado && <span className="text-[8px] font-mono leading-none text-ink-900/70">{grados}°</span>}
        </button>
        </div>
      </div>

      {/* ── Histórico + Capa de fondo ── */}
      <div className="flex items-center gap-1.5">
        {habilitarVistas && (
          <button
            onClick={onHistorico}
            title="Imagen satelital histórica"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border bg-white/95 text-ink-700 border-white/30 hover:bg-bone-50"
          >
            <History className="w-3.5 h-3.5" />
            Histórico
          </button>
        )}
        <div className="flex rounded-lg overflow-hidden shadow-md border border-white/30">
          <button
            onClick={() => onCapaFondo('satelite')}
            title="Imagen satelital"
            className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${capaFondo === 'satelite' ? 'bg-moss-700 text-bone-50' : 'bg-white/95 text-ink-700 hover:bg-bone-100'}`}
          >
            <Satellite className="w-3.5 h-3.5" />
            Satélite
          </button>
          <button
            onClick={() => onCapaFondo('topo')}
            title="Mapa topográfico"
            className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${capaFondo === 'topo' ? 'bg-moss-700 text-bone-50' : 'bg-white/95 text-ink-700 hover:bg-bone-100'}`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Topo
          </button>
        </div>
      </div>

      {/* ── Escala de permanencia + Capas ── */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onEscala}
          title="Escala de permanencia (bitácora de diseño)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border ${escalaAbierta ? 'bg-moss-700 text-bone-50 border-moss-700' : 'bg-white/95 text-ink-700 border-white/30 hover:bg-bone-50'}`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          Escala
        </button>
        <button
          onClick={onCapas}
          title={capasAbierto ? 'Cerrar capas' : 'Mostrar capas'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border ${capasAbierto ? 'bg-moss-700 text-bone-50 border-moss-700' : 'bg-white/95 text-ink-700 border-white/30 hover:bg-bone-50'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          Capas
        </button>
      </div>
    </div>
  );
}
