import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { colorElevacion, colorPendiente, type DatosShader } from '@/lib/shaders';
import { colorErosion, type DatosErosion } from '@/lib/erosion';
import type { ResultadoSombras } from '@/lib/sombras';
import { colorInsolacion, type ResultadoInsolacion } from '@/lib/insolacion';
import type { ResultadoViewshed } from '@/lib/viewshed';

/**
 * Capas de análisis que se pintan en un `<canvas>` fuera de banda y se agregan
 * al mapa como `L.imageOverlay` (shader de relieve, erosión, sombras, insolación
 * y viewshed). Cada una toma sus celdas por props, dibuja 1 px por celda, escala
 * 8× con suavizado bilineal y limpia su overlay al desmontarse. No renderizan
 * nada en el árbol de React (`return null`).
 *
 * Extraídas de `MapLeaflet` (Fase 1). No cambian comportamiento.
 */

// ─── Shader suavizado (canvas + ImageOverlay) ────────────────────────────────
export function ShaderCanvasLayer({
  celdas, tipo, elevMin, elevMax, pendMax, opacidad = 0.65,
}: {
  celdas: DatosShader['celdas'];
  tipo: 'elev' | 'pend';
  elevMin: number; elevMax: number; pendMax: number;
  opacidad?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!celdas.length) return;

    let latMin = Infinity, latMax = -Infinity;
    let lngMin = Infinity, lngMax = -Infinity;
    let minRow = 99, maxRow = 0, minCol = 99, maxCol = 0;
    const cellMap = new Map<string, DatosShader['celdas'][0]>();

    for (const c of celdas) {
      cellMap.set(`${c.row},${c.col}`, c);
      if (c.latMin < latMin) latMin = c.latMin;
      if (c.latMax > latMax) latMax = c.latMax;
      if (c.lngMin < lngMin) lngMin = c.lngMin;
      if (c.lngMax > lngMax) lngMax = c.lngMax;
      if (c.row < minRow) minRow = c.row;
      if (c.row > maxRow) maxRow = c.row;
      if (c.col < minCol) minCol = c.col;
      if (c.col > maxCol) maxCol = c.col;
    }

    const H = maxRow - minRow + 1;
    const W = maxCol - minCol + 1;

    // Canvas pequeño: 1 px por celda
    const small = document.createElement('canvas');
    small.width = W; small.height = H;
    const sCtx = small.getContext('2d')!;
    const id   = sCtx.createImageData(W, H);
    const d    = id.data;

    function parseRgb(s: string): [number, number, number] {
      const m = s.match(/\d+/g) ?? [];
      return [+(m[0] ?? 0), +(m[1] ?? 0), +(m[2] ?? 0)];
    }

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x  = col - minCol;
        const y  = maxRow - row;          // flip Y: lat↑ = canvas↓
        const px = (y * W + x) * 4;
        if (cell) {
          const colorStr = tipo === 'elev'
            ? colorElevacion(cell.elevation, elevMin, elevMax)
            : colorPendiente(cell.pendiente_pct, pendMax);
          const [r, g, b] = parseRgb(colorStr);
          d[px] = r; d[px + 1] = g; d[px + 2] = b; d[px + 3] = 200;
        }
        // Celdas fuera del polígono: alpha = 0 (transparente)
      }
    }
    sCtx.putImageData(id, 0, 0);

    // Escalar 8× con interpolación bilineal
    const S    = 8;
    const big  = document.createElement('canvas');
    big.width  = W * S; big.height = H * S;
    const bCtx = big.getContext('2d')!;
    bCtx.imageSmoothingEnabled  = true;
    bCtx.imageSmoothingQuality  = 'high';
    bCtx.drawImage(small, 0, 0, W * S, H * S);

    const ov = L.imageOverlay(big.toDataURL(), [[latMin, lngMin], [latMax, lngMax]], {
      opacity: opacidad, interactive: false, zIndex: 200,
    });
    ov.addTo(map);
    return () => { map.removeLayer(ov); };
  }, [map, celdas, tipo, elevMin, elevMax, pendMax, opacidad]);
  return null;
}

// ─── Mapa de riesgo de erosión (canvas con color por clase) ──────────────────
export function ErosionCanvasLayer({ celdas }: { celdas: DatosErosion['celdas'] }) {
  const map = useMap();
  useEffect(() => {
    if (!celdas.length) return;
    let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    const cellMap = new Map<string, DatosErosion['celdas'][0]>();
    for (const c of celdas) {
      cellMap.set(`${c.row},${c.col}`, c);
      if (c.latMin < latMin) latMin = c.latMin;
      if (c.latMax > latMax) latMax = c.latMax;
      if (c.lngMin < lngMin) lngMin = c.lngMin;
      if (c.lngMax > lngMax) lngMax = c.lngMax;
      if (c.row < minRow) minRow = c.row;
      if (c.row > maxRow) maxRow = c.row;
      if (c.col < minCol) minCol = c.col;
      if (c.col > maxCol) maxCol = c.col;
    }
    const H = maxRow - minRow + 1, W = maxCol - minCol + 1;
    const small = document.createElement('canvas');
    small.width = W; small.height = H;
    const sCtx = small.getContext('2d')!;
    const idd = sCtx.createImageData(W, H);
    const d = idd.data;
    const parseRgb = (s: string): [number, number, number] => {
      // acepta '#rrggbb'
      const h = s.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x = col - minCol, y = maxRow - row;
        const px = (y * W + x) * 4;
        if (cell) {
          const [r, g, b] = parseRgb(colorErosion(cell.clase));
          d[px] = r; d[px + 1] = g; d[px + 2] = b;
          d[px + 3] = cell.clase === 0 ? 70 : 190;  // el "bajo" apenas se insinúa
        }
      }
    }
    sCtx.putImageData(idd, 0, 0);
    const S = 8;
    const big = document.createElement('canvas');
    big.width = W * S; big.height = H * S;
    const bCtx = big.getContext('2d')!;
    bCtx.imageSmoothingEnabled = true;
    bCtx.imageSmoothingQuality = 'high';
    bCtx.drawImage(small, 0, 0, W * S, H * S);
    const ov = L.imageOverlay(big.toDataURL(), [[latMin, lngMin], [latMax, lngMax]], {
      opacity: 0.6, interactive: false, zIndex: 210,
    });
    ov.addTo(map);
    return () => { map.removeLayer(ov); };
  }, [map, celdas]);
  return null;
}

// ─── Mapa de sombras (canvas negro con alpha por celda) ──────────────────────
export function SombrasCanvasLayer({ celdas }: { celdas: ResultadoSombras['celdas'] }) {
  const map = useMap();
  useEffect(() => {
    if (!celdas.length) return;
    let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    const cellMap = new Map<string, ResultadoSombras['celdas'][0]>();
    for (const c of celdas) {
      cellMap.set(`${c.row},${c.col}`, c);
      if (c.latMin < latMin) latMin = c.latMin;
      if (c.latMax > latMax) latMax = c.latMax;
      if (c.lngMin < lngMin) lngMin = c.lngMin;
      if (c.lngMax > lngMax) lngMax = c.lngMax;
      if (c.row < minRow) minRow = c.row;
      if (c.row > maxRow) maxRow = c.row;
      if (c.col < minCol) minCol = c.col;
      if (c.col > maxCol) maxCol = c.col;
    }
    const H = maxRow - minRow + 1, W = maxCol - minCol + 1;
    const small = document.createElement('canvas');
    small.width = W; small.height = H;
    const sCtx = small.getContext('2d')!;
    const img = sCtx.createImageData(W, H);
    const d = img.data;
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x = col - minCol, y = maxRow - row;
        const px = (y * W + x) * 4;
        if (cell) {
          d[px] = 10; d[px + 1] = 15; d[px + 2] = 30;                 // azul-negro nocturno
          d[px + 3] = Math.round(Math.max(0, Math.min(0.85, cell.sombra)) * 255);
        }
      }
    }
    sCtx.putImageData(img, 0, 0);
    const S = 8;
    const big = document.createElement('canvas');
    big.width = W * S; big.height = H * S;
    const bCtx = big.getContext('2d')!;
    bCtx.imageSmoothingEnabled = true; bCtx.imageSmoothingQuality = 'high';
    bCtx.drawImage(small, 0, 0, W * S, H * S);
    const ov = L.imageOverlay(big.toDataURL(), [[latMin, lngMin], [latMax, lngMax]], {
      opacity: 1, interactive: false, zIndex: 210,
    });
    ov.addTo(map);
    return () => { map.removeLayer(ov); };
  }, [map, celdas]);
  return null;
}

// ─── Horas de sol acumuladas (mapa de calor) ─────────────────────────────────
export function InsolacionCanvasLayer({ celdas, max }: { celdas: ResultadoInsolacion['celdas']; max: number }) {
  const map = useMap();
  useEffect(() => {
    if (!celdas.length) return;
    let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    const cellMap = new Map<string, ResultadoInsolacion['celdas'][0]>();
    for (const c of celdas) {
      cellMap.set(`${c.row},${c.col}`, c);
      if (c.latMin < latMin) latMin = c.latMin;
      if (c.latMax > latMax) latMax = c.latMax;
      if (c.lngMin < lngMin) lngMin = c.lngMin;
      if (c.lngMax > lngMax) lngMax = c.lngMax;
      if (c.row < minRow) minRow = c.row;
      if (c.row > maxRow) maxRow = c.row;
      if (c.col < minCol) minCol = c.col;
      if (c.col > maxCol) maxCol = c.col;
    }
    const H = maxRow - minRow + 1, W = maxCol - minCol + 1;
    const small = document.createElement('canvas');
    small.width = W; small.height = H;
    const sCtx = small.getContext('2d')!;
    const img = sCtx.createImageData(W, H);
    const d = img.data;
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x = col - minCol, y = maxRow - row;
        const px = (y * W + x) * 4;
        if (cell) {
          const [r, g, b] = colorInsolacion(cell.horas, max);
          d[px] = r; d[px + 1] = g; d[px + 2] = b; d[px + 3] = 190;
        }
      }
    }
    sCtx.putImageData(img, 0, 0);
    const S = 8;
    const big = document.createElement('canvas');
    big.width = W * S; big.height = H * S;
    const bCtx = big.getContext('2d')!;
    bCtx.imageSmoothingEnabled = true; bCtx.imageSmoothingQuality = 'high';
    bCtx.drawImage(small, 0, 0, W * S, H * S);
    const ov = L.imageOverlay(big.toDataURL(), [[latMin, lngMin], [latMax, lngMax]], {
      opacity: 1, interactive: false, zIndex: 205,
    });
    ov.addTo(map);
    return () => { map.removeLayer(ov); };
  }, [map, celdas, max]);
  return null;
}

// ─── Viewshed (verde translúcido donde es visible) ────────────────────────────
export function ViewshedCanvasLayer({ celdas }: { celdas: ResultadoViewshed['celdas'] }) {
  const map = useMap();
  useEffect(() => {
    if (!celdas.length) return;
    let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    const cellMap = new Map<string, ResultadoViewshed['celdas'][0]>();
    for (const c of celdas) {
      cellMap.set(`${c.row},${c.col}`, c);
      if (c.latMin < latMin) latMin = c.latMin;
      if (c.latMax > latMax) latMax = c.latMax;
      if (c.lngMin < lngMin) lngMin = c.lngMin;
      if (c.lngMax > lngMax) lngMax = c.lngMax;
      if (c.row < minRow) minRow = c.row;
      if (c.row > maxRow) maxRow = c.row;
      if (c.col < minCol) minCol = c.col;
      if (c.col > maxCol) maxCol = c.col;
    }
    const H = maxRow - minRow + 1, W = maxCol - minCol + 1;
    const small = document.createElement('canvas');
    small.width = W; small.height = H;
    const sCtx = small.getContext('2d')!;
    const im = sCtx.createImageData(W, H);
    const dd = im.data;
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x = col - minCol, y = maxRow - row;
        const px = (y * W + x) * 4;
        if (cell && cell.visible) { dd[px] = 46; dd[px + 1] = 160; dd[px + 2] = 67; dd[px + 3] = 150; }
      }
    }
    sCtx.putImageData(im, 0, 0);
    const S = 8;
    const big = document.createElement('canvas');
    big.width = W * S; big.height = H * S;
    const bCtx = big.getContext('2d')!;
    bCtx.imageSmoothingEnabled = true; bCtx.imageSmoothingQuality = 'high';
    bCtx.drawImage(small, 0, 0, W * S, H * S);
    const ov = L.imageOverlay(big.toDataURL(), [[latMin, lngMin], [latMax, lngMax]], {
      opacity: 1, interactive: false, zIndex: 215,
    });
    ov.addTo(map);
    return () => { map.removeLayer(ov); };
  }, [map, celdas]);
  return null;
}
