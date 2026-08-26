'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageOverlay, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { colorElevacionRGB } from '@/lib/sitio/colorElevacion';

interface GrillaElevacionAPI {
  rows: number;
  cols: number;
  bbox: [number, number, number, number]; // w, s, e, n
  elev: number[];
  fuente: string;
}

function celdaACanvas(g: GrillaElevacionAPI): string {
  let min = Infinity;
  let max = -Infinity;
  for (const v of g.elev) {
    if (Number.isNaN(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const canvas = document.createElement('canvas');
  canvas.width = g.cols;
  canvas.height = g.rows;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(g.cols, g.rows);

  for (let row = 0; row < g.rows; row++) {
    // Fila 0 de la grilla = sur; el canvas se pinta de arriba (norte) hacia abajo.
    const filaCanvas = g.rows - 1 - row;
    for (let col = 0; col < g.cols; col++) {
      const v = g.elev[row * g.cols + col]!;
      const i = (filaCanvas * g.cols + col) * 4;
      if (Number.isNaN(v)) {
        img.data[i + 3] = 0;
        continue;
      }
      const [r, gg, b] = colorElevacionRGB(v, min, max);
      img.data[i] = r;
      img.data[i + 1] = gg;
      img.data[i + 2] = b;
      img.data[i + 3] = 200;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/**
 * Capa de elevación del mapa de selección de sitio (Fase A4). Pide una
 * grilla de elevación (`@arteytierra/dem` vía `/api/sitio/elevacion`) para
 * el área visible y la pinta como una imagen coloreada (misma rampa que
 * `apps/terreno`). Se re-pide (con debounce) cada vez que el mapa se mueve
 * o cambia de zoom.
 */
export function CapaElevacion() {
  const map = useMap();
  const [overlay, setOverlay] = useState<{ url: string; bounds: LatLngBoundsExpression } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pedirGrilla() {
    const b = map.getBounds();
    const w = b.getWest();
    const s = b.getSouth();
    const e = b.getEast();
    const n = b.getNorth();

    fetch(`/api/sitio/elevacion?w=${w}&s=${s}&e=${e}&n=${n}`)
      .then(res => (res.ok ? res.json() : null))
      .then((g: GrillaElevacionAPI | null) => {
        if (!g) return;
        setOverlay({
          url: celdaACanvas(g),
          bounds: [
            [g.bbox[1], g.bbox[0]],
            [g.bbox[3], g.bbox[2]],
          ],
        });
      })
      .catch(() => {
        // Sin cobertura DEM en la zona, o COG remoto caído: se deja el mapa base sin overlay.
      });
  }

  useEffect(() => {
    pedirGrilla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(pedirGrilla, 400);
    },
  });

  if (!overlay) return null;
  return <ImageOverlay url={overlay.url} bounds={overlay.bounds} opacity={0.55} />;
}
