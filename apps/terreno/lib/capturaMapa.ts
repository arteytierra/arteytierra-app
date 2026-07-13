/**
 * Compositor de mapa estático para el informe.
 *
 * El informe antes tomaba la imagen del mapa con html-to-image (`toPng`) sobre el
 * nodo de Leaflet, que **se cuelga** con las teselas de Esri (nunca resuelve, ni
 * lanza error) → el informe salía sin plano. Acá armamos la imagen sin tocar el
 * DOM: pedimos las teselas satelitales que cubren el predio, las cosemos en un
 * canvas y dibujamos encima el polígono y los mojones. Determinístico y rápido.
 */
import type { Mojon } from './types';

const TILE = 256;
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';

/** lng → coordenada X de tesela (fraccional) en Web Mercator. */
function lngAX(lng: number, z: number) {
  return ((lng + 180) / 360) * 2 ** z;
}
/** lat → coordenada Y de tesela (fraccional) en Web Mercator. */
function latAY(lat: number, z: number) {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
}

function cargarTesela(z: number, x: number, y: number): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // ArcGIS manda CORS → el canvas no se "tiñe"
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // una tesela caída no arruina la imagen
    img.src = `${ESRI}/${z}/${y}/${x}`;
  });
}

export interface OpcionesCaptura {
  /** Zoom máximo con imagen real en la zona (evita la tesela "Map data not yet available"). */
  zoomSatelital?: number;
  /** Lado máximo del canvas en px. */
  ladoMax?: number;
  /** Margen alrededor del predio, como fracción del bbox. */
  margen?: number;
}

/**
 * Devuelve un data URL (JPEG) con la imagen satelital del predio y su contorno,
 * o `undefined` si no hay suficientes mojones o falla todo.
 */
export async function componerMapaEstatico(
  mojones: Mojon[],
  opts: OpcionesCaptura = {},
): Promise<string | undefined> {
  if (mojones.length < 3) return undefined;
  const { zoomSatelital = 18, ladoMax = 1100, margen = 0.15 } = opts;

  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  let minLat = Math.min(...lats), maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  // Margen para que el predio no quede pegado al borde.
  const dLat = (maxLat - minLat) * margen || 0.0005;
  const dLng = (maxLng - minLng) * margen || 0.0005;
  minLat -= dLat; maxLat += dLat; minLng -= dLng; maxLng += dLng;

  // Zoom más profundo (sin pasar la cobertura real) donde el predio entra en `ladoMax`.
  let z = Math.min(zoomSatelital, 19);
  for (; z >= 3; z--) {
    const w = Math.abs(lngAX(maxLng, z) - lngAX(minLng, z)) * TILE;
    const h = Math.abs(latAY(minLat, z) - latAY(maxLat, z)) * TILE;
    if (Math.max(w, h) <= ladoMax) break;
  }

  // Caja del predio en píxeles-mundo a ese zoom.
  const xMinPx = lngAX(minLng, z) * TILE;
  const xMaxPx = lngAX(maxLng, z) * TILE;
  const yMinPx = latAY(maxLat, z) * TILE; // ojo: lat mayor = Y menor
  const yMaxPx = latAY(minLat, z) * TILE;
  const W = Math.max(1, Math.round(xMaxPx - xMinPx));
  const H = Math.max(1, Math.round(yMaxPx - yMinPx));

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.fillStyle = '#0A0F1E';
  ctx.fillRect(0, 0, W, H);

  // Rango de teselas que cubre la caja.
  const txMin = Math.floor(xMinPx / TILE), txMax = Math.floor(xMaxPx / TILE);
  const tyMin = Math.floor(yMinPx / TILE), tyMax = Math.floor(yMaxPx / TILE);
  const n = 2 ** z;

  const trabajos: Promise<void>[] = [];
  for (let tx = txMin; tx <= txMax; tx++) {
    for (let ty = tyMin; ty <= tyMax; ty++) {
      const xx = ((tx % n) + n) % n; // envolver en X
      trabajos.push(
        cargarTesela(z, xx, ty).then(img => {
          if (img) ctx.drawImage(img, tx * TILE - xMinPx, ty * TILE - yMinPx);
        }),
      );
    }
  }
  await Promise.all(trabajos);

  // Contorno del predio.
  const aPx = (m: Mojon): [number, number] => [
    lngAX(m.lng, z) * TILE - xMinPx,
    latAY(m.lat, z) * TILE - yMinPx,
  ];
  ctx.beginPath();
  mojones.forEach((m, i) => {
    const [x, y] = aPx(m);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(217,164,65,0.14)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#D9A441';
  ctx.stroke();

  // Mojones numerados.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px sans-serif';
  mojones.forEach(m => {
    const [x, y] = aPx(m);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0F1E';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(String(m.numero), x, y + 0.5);
  });

  try {
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    // Si por algún motivo el canvas quedó "teñido" (CORS), no romper el informe.
    return undefined;
  }
}
