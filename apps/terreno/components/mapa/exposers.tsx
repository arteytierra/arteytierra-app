'use client';

import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import type { Mojon } from '@/lib/types';

/**
 * Componentes-puente del mapa. Cada uno vive dentro del `MapContainer`, hace
 * `useMap()` y expone acciones/estado hacia el padre (que vive fuera del mapa),
 * o instala interacción a bajo nivel sobre el contenedor. Todos devuelven `null`.
 *
 * Extraídos de `MapLeaflet` (Fase 1). No cambian comportamiento.
 */

// ─── Auto-fit bounds ──────────────────────────────────────────────────────────
export function AutoFit({ mojones }: { mojones: Mojon[] }) {
  const map = useMap();
  const prevLen = useRef(0);
  useEffect(() => {
    if (mojones.length === 0) { prevLen.current = 0; return; }
    if (mojones.length === prevLen.current) return;
    prevLen.current = mojones.length;
    const first = mojones[0];
    if (mojones.length === 1 && first) {
      map.setView([first.lat, first.lng], Math.max(map.getZoom(), 17));
      return;
    }
    try {
      const bounds = L.latLngBounds(mojones.map(m => [m.lat, m.lng] as LatLngTuple));
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
    } catch { /* bounds degenerados */ }
  }, [mojones, map]);
  return null;
}

// ─── Middle-mouse pan ─────────────────────────────────────────────────────────

/**
 * Botón central del mouse:
 *   · arrastrar          → gira el plano (mueve el norte)
 *   · Shift + arrastrar  → panea (vía de escape mientras se dibuja, donde el
 *                          arrastre con botón izquierdo está tomado por el CAD)
 *
 * El rumbo se imanta a 0° cuando pasa cerca, para poder volver al norte sin
 * pelearse con el mouse.
 */
const GRADOS_POR_PIXEL = 0.4;
const IMAN_NORTE_GRADOS = 3;

export function RotarConBotonCentral() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let modo: 'rotar' | 'panear' | null = null;
    let lx = 0, ly = 0;
    let bearingCrudo = map.getBearing();

    const down = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      // Leaflet arrastra el mapa también con el botón central: su Draggable
      // aborta sólo si `which !== 1 && button !== 1`, y en el central button === 1.
      // Sin esto, el arrastre rotaría y panearía al mismo tiempo.
      map.dragging.disable();
      modo = e.shiftKey ? 'panear' : 'rotar';
      lx = e.clientX; ly = e.clientY;
      bearingCrudo = map.getBearing();
      container.style.cursor = modo === 'rotar' ? 'ew-resize' : 'grabbing';
    };
    const move = (e: MouseEvent) => {
      if (!modo) return;
      if (modo === 'panear') {
        map.panBy([lx - e.clientX, ly - e.clientY], { animate: false });
      } else {
        // Acumulamos el rumbo sin imantar para que el imán no "pegue" el giro.
        bearingCrudo += (e.clientX - lx) * GRADOS_POR_PIXEL;
        const norm = ((bearingCrudo % 360) + 360) % 360;
        const cerca = Math.min(norm, 360 - norm) < IMAN_NORTE_GRADOS;
        map.setBearing(cerca ? 0 : bearingCrudo);
      }
      lx = e.clientX; ly = e.clientY;
    };
    const up = (e: MouseEvent) => {
      if (e.button !== 1 || !modo) return;
      modo = null;
      map.dragging.enable();
      container.style.cursor = '';
    };
    // Sin esto, Chrome abre el scroll automático con el botón central.
    const noAuto = (e: MouseEvent) => { if (e.button === 1) e.preventDefault(); };

    container.addEventListener('mousedown', down);
    container.addEventListener('auxclick', noAuto);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      if (modo) { try { map.dragging.enable(); } catch { /* mapa ya destruido */ } }
      container.removeEventListener('mousedown', down);
      container.removeEventListener('auxclick', noAuto);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [map]);
  return null;
}

/**
 * Acciones del mapa que el panel de navegación (que vive fuera del
 * MapContainer, en MapaTerrenoApp) necesita disparar.
 */
export interface NavegacionMapa {
  zoomIn:  () => void;
  zoomOut: () => void;
  alNorte: () => void;
}

/**
 * Puente hacia el panel de navegación: le pasa las acciones y le informa el
 * rumbo, para que la brújula gire aunque el botón esté fuera del mapa.
 */
export function NavegacionExposer({ onReady, onBearing }: {
  onReady?:   (api: NavegacionMapa) => void;
  onBearing?: (grados: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onReady?.({
      zoomIn:  () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      alNorte: () => map.setBearing(0),
    });
  }, [map, onReady]);

  useEffect(() => {
    if (!onBearing) return;
    const fire = () => onBearing(map.getBearing());
    fire();
    map.on('rotate', fire);
    return () => { map.off('rotate', fire); };
  }, [map, onBearing]);

  return null;
}

// Expone flyTo al padre para centrar el mapa en un mojón recién agregado por
// coords, o en un resultado de búsqueda (con zoom propio: una localidad se ve
// mejor alejada que un mojón).
export function FlyToExposer({ onReady }: { onReady: (fn: (lat: number, lng: number, zoom?: number) => void) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady((lat, lng, zoom) => map.flyTo([lat, lng], zoom ?? Math.max(map.getZoom(), 16), { duration: 0.6 }));
  }, [map, onReady]);
  return null;
}

// Reporta la posición del cursor sobre el mapa (siempre, no solo dibujando).
// Va a un ref del padre que la barra de estado consulta con rAF → cero re-renders.
export function MapMouseTracker({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  const cb = useRef(onMove);
  cb.current = onMove;
  useMapEvents({ mousemove(e) { cb.current(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// Redibuja el mapa cuando cambia el tamaño del contenedor (modo captura o colapso
// de los paneles laterales). Sin esto, Leaflet no re-teja el área nueva y queda
// una franja negra del lado que se ensanchó.
export function InvalidarSize({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 260);
    return () => clearTimeout(t);
  }, [map, trigger]);
  return null;
}

// Notifica zoom + lat del centro al padre (para escala gráfica)
export function MapChangeWatcher({ onMapChange }: { onMapChange: (zoom: number, lat: number) => void }) {
  const map = useMap();
  const cb  = useRef(onMapChange);
  cb.current = onMapChange;
  useEffect(() => {
    const fire = () => cb.current(map.getZoom(), map.getCenter().lat);
    fire();
    map.on('zoomend moveend', fire);
    return () => { map.off('zoomend moveend', fire); };
  }, [map]);
  return null;
}

// Expone una función para que el padre pueda leer los bounds actuales del mapa
export function BoundsExposer({ onReady }: { onReady: (fn: () => { latMin: number; latMax: number; lngMin: number; lngMax: number }) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(() => {
      const b = map.getBounds();
      return { latMin: b.getSouth(), latMax: b.getNorth(), lngMin: b.getWest(), lngMax: b.getEast() };
    });
  }, [map, onReady]);
  return null;
}
