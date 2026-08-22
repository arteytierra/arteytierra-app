import L from 'leaflet';
import type { Pin } from '@/lib/pines';
import { horaStr } from '@/lib/arco_solar';

/**
 * Fábricas de `L.DivIcon` del mapa. Funciones puras (sin React) que arman el
 * HTML de cada marcador y lo cachean para no recrear el DivIcon en cada render.
 *
 * Extraídas de `MapLeaflet` (Fase 1). No cambian comportamiento: mismas cachés,
 * mismo HTML, mismos anchors.
 */

// ─── Caché de iconos (evita recrear DivIcon en cada render) ──────────────────

const _cMojon  = new Map<string, L.DivIcon>();
const _cPin    = new Map<string, L.DivIcon>();
const _cAguada = new Map<string, L.DivIcon>();
const _cTexto  = new Map<string, L.DivIcon>();

// ─── Iconos ───────────────────────────────────────────────────────────────────

export function crearIconoMojon(numero: number, seleccionado: boolean): L.DivIcon {
  const key = `${numero}-${seleccionado}`;
  if (_cMojon.has(key)) return _cMojon.get(key)!;
  const bg = seleccionado ? '#D9A441' : '#3A5A40';
  const fg = seleccionado ? '#0F1410' : '#FBF8F3';
  const size = seleccionado ? 34 : 30;
  const half = size / 2;
  const icon = L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};color:${fg};
      display:flex;align-items:center;justify-content:center;
      font-size:${numero > 9 ? 11 : 13}px;font-weight:700;font-family:sans-serif;
      border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);
    ">${numero}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
  _cMojon.set(key, icon);
  return icon;
}

export function crearIconoPin(pin: Pin): L.DivIcon {
  const key = `${pin.color}-${pin.icono}-${pin.nombre}`;
  if (_cPin.has(key)) return _cPin.get(key)!;
  const icon = L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
      <div style="
        width:30px;height:30px;border-radius:50%;
        background:${pin.color};
        display:flex;align-items:center;justify-content:center;
        font-size:15px;border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.45);
      ">${pin.icono}</div>
      <div style="
        background:rgba(0,0,0,0.7);color:#fff;
        font-size:9px;font-weight:600;font-family:sans-serif;
        padding:1px 5px;border-radius:3px;white-space:nowrap;
        max-width:100px;overflow:hidden;text-overflow:ellipsis;
      ">${pin.nombre}</div>
    </div>`,
    className: '',
    iconSize: [30, 50],
    iconAnchor: [15, 30],
  });
  _cPin.set(key, icon);
  return icon;
}

const _cElem = new Map<string, L.DivIcon>();
/** Emoji centrado (sin chapita) para los elementos, dimensionado en px. */
export function crearIconoElemento(simbolo: string, sizePx = 16): L.DivIcon {
  const s = Math.round(sizePx);
  const key = `${simbolo}@${s}`;
  if (_cElem.has(key)) return _cElem.get(key)!;
  const icon = L.divIcon({
    html: `<div style="font-size:${s}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${simbolo}</div>`,
    className: '',
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
  _cElem.set(key, icon);
  return icon;
}

/**
 * Tamaño en px del emoji de un elemento para que acompañe su huella real al zoom
 * (así se ve a escala: un árbol grande manda más que una herbácea). `diamM` es el
 * diámetro/lado real en metros; se clampa para que nunca desaparezca ni sea absurdo.
 */
export function emojiPxElemento(diamM: number, lat: number, zoom: number): number {
  const mpp = 156543.03392804097 * Math.cos((lat * Math.PI) / 180) / Math.pow(2, zoom);
  return Math.max(11, Math.min(80, (diamM / mpp) * 0.9));
}

export function crearIconoAguada(tipo: 'represa' | 'swale' | 'keyline', nombre: string): L.DivIcon {
  const key = `${tipo}-${nombre}`;
  if (_cAguada.has(key)) return _cAguada.get(key)!;
  const emoji = tipo === 'represa' ? '🏊' : tipo === 'swale' ? '⛏️' : '〰️';
  const icon = L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
      <div style="width:28px;height:28px;border-radius:50%;background:#1E88E5;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">${emoji}</div>
      <div style="background:rgba(30,136,229,0.88);color:#fff;font-size:9px;font-weight:600;font-family:sans-serif;padding:1px 5px;border-radius:3px;white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${nombre}</div>
    </div>`,
    className: '',
    iconSize: [28, 50],
    iconAnchor: [14, 28],
  });
  _cAguada.set(key, icon);
  return icon;
}

export function crearIconoTexto(texto: string, color: string, tamano: number, sel: boolean): L.DivIcon {
  const key = `${texto}-${color}-${tamano}-${sel}`;
  if (_cTexto.has(key)) return _cTexto.get(key)!;
  const icon = L.divIcon({
    html: `<div style="
      color:${color};font-size:${tamano}px;font-weight:600;
      font-family:sans-serif;white-space:nowrap;
      text-shadow:0 1px 3px rgba(0,0,0,0.8),0 0 6px rgba(0,0,0,0.5);
      outline:${sel ? '2px dashed #F59E0B' : 'none'};
      cursor:pointer;padding:2px 4px;border-radius:3px;
      background:${sel ? 'rgba(245,158,11,0.15)' : 'transparent'};
    ">${texto}</div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [0, tamano / 2],
  });
  _cTexto.set(key, icon);
  return icon;
}

export function crearIconoLindero(longitud: number, rumbo: string): L.DivIcon {
  const key = `${longitud.toFixed(0)}-${rumbo}`;
  const cached = _cTexto.get(`lind-${key}`);
  if (cached) return cached;
  const icon = L.divIcon({
    html: `<div style="
      background:rgba(255,255,255,0.88);color:#1B3A2D;
      font-size:8px;font-weight:600;font-family:sans-serif;
      padding:1px 4px;border-radius:3px;white-space:nowrap;
      box-shadow:0 1px 3px rgba(0,0,0,0.2);border:1px solid rgba(0,0,0,0.08);
      text-align:center;line-height:1.4;
    ">${longitud.toFixed(0)} m<br/><span style="color:#5D4037;font-size:7px;">${rumbo}</span></div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
  _cTexto.set(`lind-${key}`, icon);
  return icon;
}

// Etiqueta de medida (área / longitud / radio) sobre una figura
export function crearIconoMedida(texto: string, color: string): L.DivIcon {
  const key = `med-${texto}-${color}`;
  const cached = _cTexto.get(key);
  if (cached) return cached;
  const icon = L.divIcon({
    html: `<div style="
      background:rgba(255,255,255,0.88);color:#1B3A2D;
      font-size:9px;font-weight:700;font-family:monospace;
      padding:1px 5px;border-radius:3px;white-space:nowrap;
      box-shadow:0 1px 3px rgba(0,0,0,0.25);border-left:3px solid ${color};
      pointer-events:none;
    ">${texto}</div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [20, 7],
  });
  _cTexto.set(key, icon);
  return icon;
}

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
