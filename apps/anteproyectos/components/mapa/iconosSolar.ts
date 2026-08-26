import L from 'leaflet';
import { horaStr } from '@/lib/sitio/arcoSolar';

/**
 * Fábricas de `L.DivIcon` para `ArcoSolarLayer`. Extraídas de
 * `apps/terreno/components/mapa/iconos.ts` (sólo las 3 usadas por el arco
 * solar — el resto de ese archivo es de capas de terreno que no aplican
 * acá).
 */

export function iconoSunEvent(color: string, hora: number): L.DivIcon {
  const timeLabel = horaStr(hora);
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none;">
      <div style="width:9px;height:9px;border-radius:50%;background:${color};border:1.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></div>
      <span style="font-size:8px;font-weight:700;color:${color};font-family:sans-serif;white-space:nowrap;background:rgba(255,255,255,0.88);padding:0 2px;border-radius:2px;line-height:1.4;box-shadow:0 1px 3px rgba(0,0,0,0.15);">${timeLabel}</span>
    </div>`,
    className: '',
    iconSize: [32, 22],
    iconAnchor: [16, 9],
  });
}

export function iconoNoon(color: string, elevacion: number, labelCorto: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none;">
      <div style="font-size:16px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5));">☀</div>
      <span style="font-size:8px;font-weight:700;color:${color};font-family:sans-serif;white-space:nowrap;background:rgba(255,255,255,0.9);padding:0 3px;border-radius:2px;line-height:1.4;box-shadow:0 1px 3px rgba(0,0,0,0.18);">${labelCorto} · ${elevacion.toFixed(0)}°</span>
    </div>`,
    className: '',
    iconSize: [72, 28],
    iconAnchor: [36, 16],
  });
}

export function iconoCardinal(dir: string): L.DivIcon {
  return L.divIcon({
    html: `<span style="font-size:10px;font-weight:800;color:#555;font-family:sans-serif;pointer-events:none;">${dir}</span>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}
