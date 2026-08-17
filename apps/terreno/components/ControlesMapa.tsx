'use client';

import { Plus, Minus, Layers, History, Mountain, Satellite, Map as MapIcon, ListChecks } from 'lucide-react';
import type { NavegacionMapa } from './MapLeaflet';

export type CapaFondo = 'satelite' | 'topo';

/**
 * Controles del mapa, repartidos en dos piezas:
 *  - `ControlesNavegacion` vive en la barra superior (cómo se mira el mapa): 3D,
 *    zoom, brújula, satélite/topo e histórico.
 *  - `ControlesPaneles` queda flotando arriba a la derecha del mapa (qué panel se
 *    despliega encima): Escala de permanencia y Capas.
 *
 * El zoom y el rumbo son del mapa de Leaflet (viven dentro del MapContainer) y
 * llegan por el puente `NavegacionExposer`.
 */

// ── Navegación (barra superior) ──────────────────────────────────────────────

interface NavProps {
  navegacion:      NavegacionMapa | null;
  /** Rumbo del plano en grados (0 = norte arriba). */
  bearing:         number;
  capaFondo:       CapaFondo;
  onCapaFondo:     (c: CapaFondo) => void;
  /** Histórico y 3D necesitan el polígono cerrado. */
  habilitarVistas: boolean;
  onHistorico:     () => void;
  on3D:            () => void;
}

const NAV_BTN = 'flex items-center justify-center text-ink-700/70 hover:text-moss-700 hover:bg-bone-50 transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed';

export function ControlesNavegacion({
  navegacion, bearing, capaFondo, onCapaFondo, habilitarVistas, onHistorico, on3D,
}: NavProps) {
  const grados = Math.round(((bearing % 360) + 360) % 360);
  const girado = Math.min(grados, 360 - grados) >= 1;

  return (
    <div className="flex items-center gap-1.5 no-print">
      {habilitarVistas && (
        <button onClick={on3D} title="Vista 3D del relieve"
          className={`${NAV_BTN} w-8 h-8 rounded-lg border border-bone-200`}>
          <Mountain className="w-4 h-4" />
        </button>
      )}

      {/* Zoom + brújula. */}
      <div className="flex items-stretch rounded-lg border border-bone-200 overflow-hidden">
        <button onClick={() => navegacion?.zoomOut()} disabled={!navegacion} title="Alejar"
          className={`${NAV_BTN} w-8 h-8 border-r border-bone-200`}>
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={() => navegacion?.zoomIn()} disabled={!navegacion} title="Acercar"
          className={`${NAV_BTN} w-8 h-8 border-r border-bone-200`}>
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => girado && navegacion?.alNorte()}
          disabled={!girado}
          title={girado ? `Rumbo ${grados}° — clic para volver el norte arriba` : 'Norte arriba'}
          className={`${NAV_BTN} h-8 gap-0.5 ${girado ? 'w-9 cursor-pointer' : 'w-8 cursor-default disabled:opacity-100'}`}
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

      {/* Satélite / Topo. */}
      <div className="flex items-stretch rounded-lg border border-bone-200 overflow-hidden">
        <button onClick={() => onCapaFondo('satelite')} title="Imagen satelital"
          className={`w-8 h-8 flex items-center justify-center transition-colors border-r border-bone-200 ${capaFondo === 'satelite' ? 'bg-moss-700 text-bone-50' : 'text-ink-700/70 hover:text-moss-700 hover:bg-bone-50'}`}>
          <Satellite className="w-4 h-4" />
        </button>
        <button onClick={() => onCapaFondo('topo')} title="Mapa topográfico"
          className={`w-8 h-8 flex items-center justify-center transition-colors ${capaFondo === 'topo' ? 'bg-moss-700 text-bone-50' : 'text-ink-700/70 hover:text-moss-700 hover:bg-bone-50'}`}>
          <MapIcon className="w-4 h-4" />
        </button>
      </div>

      {habilitarVistas && (
        <button onClick={onHistorico} title="Imagen satelital histórica"
          className={`${NAV_BTN} w-8 h-8 rounded-lg border border-bone-200`}>
          <History className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Paneles del mapa (dock arriba a la derecha) ──────────────────────────────

interface PanelesProps {
  capasAbierto:  boolean;
  onCapas:       () => void;
  escalaAbierta: boolean;
  onEscala:      () => void;
}

export function ControlesPaneles({ capasAbierto, onCapas, escalaAbierta, onEscala }: PanelesProps) {
  return (
    <div className="flex items-center gap-1.5 no-print">
      <button
        onClick={onEscala}
        title="Escala de permanencia (bitácora de diseño)"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border ${escalaAbierta ? 'bg-moss-700 text-bone-50 border-moss-700' : 'bg-white text-ink-700 border-bone-200 hover:bg-bone-50'}`}
      >
        <ListChecks className="w-3.5 h-3.5" />
        Escala
      </button>
      <button
        onClick={onCapas}
        title={capasAbierto ? 'Cerrar capas' : 'Mostrar capas'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border ${capasAbierto ? 'bg-moss-700 text-bone-50 border-moss-700' : 'bg-white text-ink-700 border-bone-200 hover:bg-bone-50'}`}
      >
        <Layers className="w-3.5 h-3.5" />
        Capas
      </button>
    </div>
  );
}
