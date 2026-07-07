'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Circle as LeafCircle,
  CircleMarker,
  ImageOverlay,
  ZoomControl,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mojon } from '@/lib/types';
import { CATEGORIAS_ZONA } from '@/lib/zonificacion';
import type { Zona } from '@/lib/zonificacion';
import { TIPOS_SECTOR } from '@/lib/sectores';
import type { Sector } from '@/lib/sectores';
import type { PotrerosLayout } from '@/lib/potreros';
import type { Pin } from '@/lib/pines';
import type { Camino } from '@/lib/caminos';
import type { DatosShader } from '@/lib/shaders';
import { colorElevacion, colorPendiente } from '@/lib/shaders';
import type { DatosEscorrentia } from '@/lib/escorrentias';
import type { ResultadoSugerencias } from '@/lib/sugerencias';
import type { ElementoDibujo, DibujoEnCurso, TipoDibujo } from '@/lib/dibujos';
import {
  distanciaMetros, azimutGrados, areaPoligonoM2, longitudLineaM,
  formatearLongitud, formatearArea,
  pieDePerpendicular, puntoMasCercanoEnSegmento, anguloEnVertice,
} from '@/lib/dibujos';
import type { ElementoAguada } from '@/lib/aguadas';
import type { DatosArcoSolar } from '@/lib/arco_solar';
import { horaStr } from '@/lib/arco_solar';
import type { MetricasPoligono } from '@/lib/geometria';
import type { CurvaNivel } from '@/lib/curvasNivel';
import { TIPOS_ITEM, type ElementoMasterPlan } from '@/lib/masterplan';

type Capa = 'satelite' | 'topo';

export interface CapasVisibles {
  terreno:        boolean;
  zonas:          boolean;
  sectores:       boolean;
  pines:          boolean;
  caminos:        boolean;
  shaderElev:     boolean;
  shaderPend:     boolean;
  terrariumElev:  boolean;
  escorrentias:   boolean;
  sugerencias:    boolean;
  aguadas:        boolean;
  dibujos:        boolean;
  arcSolar:       boolean;
  linderoLabels:  boolean;
  curvasNivel:    boolean;
  cotas:          boolean;
  medidas:        boolean;
}

/** Punto candidato de snap (vértices, puntos medios, centros) */
export interface PuntoSnap { lat: number; lng: number }

/** Tipo de geometría que se está dibujando (para preview y medidas en vivo) */
export type TipoActivo = TipoDibujo | 'zona' | 'sector' | 'camino' | 'medir' | null;
export interface SnapSegmento { a: PuntoSnap; b: PuntoSnap }
export interface OverlayImagen {
  url: string;
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
  opacidad: number;
}

// ─── Caché de iconos (evita recrear DivIcon en cada render) ──────────────────

const _cMojon  = new Map<string, L.DivIcon>();
const _cPin    = new Map<string, L.DivIcon>();
const _cAguada = new Map<string, L.DivIcon>();
const _cTexto  = new Map<string, L.DivIcon>();
const _cSuger  = new Map<string, L.DivIcon>();

// ─── Iconos ───────────────────────────────────────────────────────────────────

function crearIconoMojon(numero: number, seleccionado: boolean): L.DivIcon {
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

function crearIconoPin(pin: Pin): L.DivIcon {
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

function crearIconoSugerencia(tipo: 'vivienda' | 'reservorio', rank: number, score: number): L.DivIcon {
  const key = `${tipo}-${rank}-${score}`;
  if (_cSuger.has(key)) return _cSuger.get(key)!;
  const emoji = tipo === 'vivienda' ? '🏠' : '💧';
  const bg    = score >= 68 ? '#2E7D32' : score >= 45 ? '#E65100' : '#B71C1C';
  const size  = rank === 0 ? 40 : rank === 1 ? 34 : 28;
  const fs    = rank === 0 ? 20 : rank === 1 ? 16 : 13;
  const icon = L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};display:flex;align-items:center;justify-content:center;
      font-size:${fs}px;border:3px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,0.45);
    ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  _cSuger.set(key, icon);
  return icon;
}

// ─── Auto-fit bounds ──────────────────────────────────────────────────────────

function AutoFit({ mojones }: { mojones: Mojon[] }) {
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

// ─── CAD interactivo: clicks con snap/ortho + línea elástica + medidas en vivo ─

const SNAP_TOLERANCIA_PX = 12;

function CadInteractivo({
  onClickMapa, modoDibujo, tipoActivo, verticesActivos,
  snapActivo, orthoActivo, snapPuntos, snapSegmentos, colorPreview, onCursor,
}: {
  onClickMapa:     (lat: number, lng: number) => void;
  modoDibujo?:     string | null;
  tipoActivo:      TipoActivo;
  verticesActivos: Array<{ lat: number; lng: number }> | null;
  snapActivo:      boolean;
  orthoActivo:     boolean;
  snapPuntos:      PuntoSnap[];
  snapSegmentos:   SnapSegmento[];
  colorPreview:    string;
  onCursor?:       (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [cursor, setCursor] = useState<{ lat: number; lng: number; snap: boolean } | null>(null);

  const dibujando = tipoActivo !== null;

  useEffect(() => {
    if (dibujando || (modoDibujo && modoDibujo !== 'seleccion')) map.doubleClickZoom.disable();
    else map.doubleClickZoom.enable();
  }, [map, modoDibujo, dibujando]);

  useEffect(() => { if (!dibujando) setCursor(null); }, [dibujando]);

  const base = verticesActivos && verticesActivos.length > 0
    ? verticesActivos[verticesActivos.length - 1]!
    : null;

  function ajustar(latlng: L.LatLng): { lat: number; lng: number; snap: boolean } {
    // 1) Snap a puntos existentes (prioridad sobre ortho, como en AutoCAD)
    if (snapActivo) {
      const cp = map.latLngToContainerPoint(latlng);
      const sel: { p: PuntoSnap | null; d: number } = { p: null, d: SNAP_TOLERANCIA_PX };
      const evaluar = (p: PuntoSnap, prioridad: number) => {
        if (Math.abs(p.lat - latlng.lat) > 0.05 || Math.abs(p.lng - latlng.lng) > 0.05) return;
        const pp = map.latLngToContainerPoint([p.lat, p.lng]);
        const d  = cp.distanceTo(pp) - prioridad; // bonus a vértices/intersecciones
        if (d < sel.d) { sel.d = d; sel.p = p; }
      };
      // vértices, puntos medios, intersecciones (prioridad alta)
      for (const p of snapPuntos) evaluar(p, 2);
      // candidatos geométricos sobre segmentos (perpendicular y punto más cercano)
      if (snapSegmentos.length > 0) {
        for (const s of snapSegmentos) {
          if (base) { const pie = pieDePerpendicular(base, s.a, s.b); if (pie) evaluar(pie, 0); }
          const cer = puntoMasCercanoEnSegmento({ lat: latlng.lat, lng: latlng.lng }, s.a, s.b);
          evaluar(cer, -1); // menor prioridad que vértices
        }
      }
      if (sel.p) return { lat: sel.p.lat, lng: sel.p.lng, snap: true };
    }
    // 2) Ortho: restringir a 0°/90° respecto del último vértice (en metros locales)
    if (orthoActivo && base) {
      const dLatM = (latlng.lat - base.lat) * 111_320;
      const dLngM = (latlng.lng - base.lng) * 111_320 * Math.cos(base.lat * Math.PI / 180);
      if (Math.abs(dLatM) >= Math.abs(dLngM)) return { lat: latlng.lat, lng: base.lng, snap: false };
      return { lat: base.lat, lng: latlng.lng, snap: false };
    }
    return { lat: latlng.lat, lng: latlng.lng, snap: false };
  }

  useMapEvents({
    mousemove(e) { if (dibujando) { const c = ajustar(e.latlng); setCursor(c); onCursor?.(c.lat, c.lng); } },
    mouseout()   { setCursor(null); },
    click(e) {
      if (dibujando) {
        const p = ajustar(e.latlng);
        onClickMapa(p.lat, p.lng);
      } else {
        onClickMapa(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  if (!dibujando || !cursor) return null;

  // ── Medidas en vivo ──
  const lineasInfo: string[] = [];
  let radioPreview = 0;
  if (base) {
    const d  = distanciaMetros(base.lat, base.lng, cursor.lat, cursor.lng);
    const az = azimutGrados(base.lat, base.lng, cursor.lat, cursor.lng);
    if (tipoActivo === 'circulo') {
      radioPreview = d;
      lineasInfo.push(`r = ${formatearLongitud(d)}`);
      lineasInfo.push(`área ${formatearArea(Math.PI * d * d)}`);
    } else {
      lineasInfo.push(`${formatearLongitud(d)} · ${az.toFixed(0)}°`);
      const va = verticesActivos;
      const conArea = tipoActivo === 'poligono' || tipoActivo === 'zona' || tipoActivo === 'sector' || tipoActivo === 'medir';
      if (conArea && va && va.length >= 2) {
        lineasInfo.push(`área ${formatearArea(areaPoligonoM2([...va, cursor]))}`);
      }
      if ((tipoActivo === 'linea' || tipoActivo === 'curva' || tipoActivo === 'camino' || tipoActivo === 'medir') && va && va.length >= 1) {
        lineasInfo.push(`total ${formatearLongitud(longitudLineaM([...va, cursor]))}`);
      }
      // Ángulo en el vértice actual (acotación angular en vivo)
      if (va && va.length >= 2) {
        lineasInfo.push(`∠ ${anguloEnVertice(va[va.length - 2]!, base, cursor).toFixed(0)}°`);
      }
    }
  }

  const esPoligonal = tipoActivo === 'poligono' || tipoActivo === 'zona' || tipoActivo === 'sector' || tipoActivo === 'medir';
  const primero = verticesActivos && verticesActivos.length >= 2 ? verticesActivos[0]! : null;

  const infoIcon = L.divIcon({
    html: `<div style="
      background:rgba(15,20,16,0.85);color:#FBF8F3;font-family:monospace;
      font-size:10px;font-weight:600;padding:3px 7px;border-radius:5px;
      white-space:nowrap;pointer-events:none;line-height:1.5;
    ">${lineasInfo.join('<br/>')}</div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [-14, -14],
  });

  const snapIcon = L.divIcon({
    html: `<div style="width:11px;height:11px;border:2.5px solid #22C55E;background:rgba(34,197,94,0.25);pointer-events:none;"></div>`,
    className: '',
    iconSize: [11, 11],
    iconAnchor: [5.5, 5.5],
  });

  return (
    <>
      {/* Línea elástica desde el último vértice */}
      {base && tipoActivo !== 'circulo' && (
        <Polyline
          positions={[[base.lat, base.lng], [cursor.lat, cursor.lng]]}
          pathOptions={{ color: colorPreview, weight: 2, dashArray: '5 5', opacity: 0.9, interactive: false }}
        />
      )}
      {/* Cierre del polígono: cursor → primer vértice */}
      {esPoligonal && primero && (
        <Polyline
          positions={[[cursor.lat, cursor.lng], [primero.lat, primero.lng]]}
          pathOptions={{ color: colorPreview, weight: 1.2, dashArray: '3 6', opacity: 0.55, interactive: false }}
        />
      )}
      {/* Preview de círculo */}
      {tipoActivo === 'circulo' && base && radioPreview > 0 && (
        <LeafCircle
          center={[base.lat, base.lng]}
          radius={radioPreview}
          pathOptions={{ color: colorPreview, fillColor: colorPreview, fillOpacity: 0.1, weight: 2, dashArray: '5 5', interactive: false }}
        />
      )}
      {/* Indicador de snap */}
      {cursor.snap && <Marker position={[cursor.lat, cursor.lng]} icon={snapIcon} interactive={false} zIndexOffset={1000} />}
      {/* Medidas junto al cursor */}
      {lineasInfo.length > 0 && <Marker position={[cursor.lat, cursor.lng]} icon={infoIcon} interactive={false} zIndexOffset={1000} />}
    </>
  );
}

// Chaikin curve smoothing (3 iterations); cerrada = true suaviza el cierre del loop
function chaikin(pts: LatLngTuple[], iteraciones = 3, cerrada = false): LatLngTuple[] {
  if (pts.length < 3) return pts;
  let cur = pts;
  for (let n = 0; n < iteraciones; n++) {
    const next: LatLngTuple[] = [];
    const m = cerrada ? cur.length : cur.length - 1;
    for (let i = 0; i < m; i++) {
      const [a0, a1] = cur[i]!;
      const [b0, b1] = cur[(i + 1) % cur.length]!;
      next.push([0.75 * a0 + 0.25 * b0, 0.75 * a1 + 0.25 * b1]);
      next.push([0.25 * a0 + 0.75 * b0, 0.25 * a1 + 0.75 * b1]);
    }
    if (!cerrada) next.push(cur[cur.length - 1]!);
    cur = next;
  }
  return cur;
}

// ─── Medición efímera (regla / área) ──────────────────────────────────────────
function MedicionLayer({ puntos }: { puntos: Array<{ lat: number; lng: number }> }) {
  if (puntos.length === 0) return null;
  const COLOR = '#0EA5E9';
  const tuplas = puntos.map(p => [p.lat, p.lng] as LatLngTuple);
  const total = longitudLineaM(puntos);
  const area  = puntos.length >= 3 ? areaPoligonoM2(puntos) : 0;
  const resumen = `Σ ${formatearLongitud(total)}${area > 0 ? ` · ${formatearArea(area)}` : ''}`;
  const last = puntos[puntos.length - 1]!;

  const segLabels = puntos.slice(0, -1).map((a, i) => {
    const b = puntos[i + 1]!;
    const d = distanciaMetros(a.lat, a.lng, b.lat, b.lng);
    return (
      <Marker key={`s${i}`} position={[(a.lat + b.lat) / 2, (a.lng + b.lng) / 2]} interactive={false}
        icon={L.divIcon({ className: '', iconAnchor: [0, 0],
          html: `<div style="background:rgba(14,165,233,0.92);color:#fff;font:600 9px monospace;padding:1px 4px;border-radius:3px;white-space:nowrap;">${formatearLongitud(d)}</div>` })} />
    );
  });
  const angLabels = puntos.slice(1, -1).map((p, i) => {
    const ang = anguloEnVertice(puntos[i]!, p, puntos[i + 2]!);
    return (
      <Marker key={`a${i}`} position={[p.lat, p.lng]} interactive={false}
        icon={L.divIcon({ className: '', iconAnchor: [-5, -5],
          html: `<div style="background:rgba(15,20,16,0.8);color:#FFD166;font:600 8px monospace;padding:0 3px;border-radius:3px;">∠${ang.toFixed(0)}°</div>` })} />
    );
  });

  return (
    <>
      {area > 0 && <Polygon positions={tuplas} pathOptions={{ color: COLOR, fillColor: COLOR, fillOpacity: 0.08, weight: 0, interactive: false }} />}
      <Polyline positions={tuplas} pathOptions={{ color: COLOR, weight: 2, dashArray: '6 4', interactive: false }} />
      {puntos.map((p, i) => (
        <CircleMarker key={`v${i}`} center={[p.lat, p.lng]} radius={3}
          pathOptions={{ color: '#fff', fillColor: COLOR, fillOpacity: 1, weight: 1.5, interactive: false }} />
      ))}
      {segLabels}
      {angLabels}
      <Marker position={[last.lat, last.lng]} interactive={false} zIndexOffset={1100}
        icon={L.divIcon({ className: '', iconAnchor: [-10, 20],
          html: `<div style="background:#0EA5E9;color:#fff;font:700 10px monospace;padding:2px 6px;border-radius:5px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${resumen}</div>` })} />
    </>
  );
}

function crearIconoAguada(tipo: 'represa' | 'swale' | 'keyline', nombre: string): L.DivIcon {
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

function crearIconoTexto(texto: string, color: string, tamano: number, sel: boolean): L.DivIcon {
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

function crearIconoLindero(longitud: number, rumbo: string): L.DivIcon {
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
function crearIconoMedida(texto: string, color: string): L.DivIcon {
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

// Etiquetas de longitud y rumbo sobre el centroide de cada segmento de lindero
function LinderoLabels({ mojones, metricas }: { mojones: Mojon[]; metricas: MetricasPoligono }) {
  return (
    <>
      {metricas.linderos.map((lindero, i) => {
        const mFrom = mojones[i];
        const mTo   = mojones[(i + 1) % mojones.length];
        if (!mFrom || !mTo) return null;
        const lat = (mFrom.lat + mTo.lat) / 2;
        const lng = (mFrom.lng + mTo.lng) / 2;
        return (
          <Marker
            key={`lind-${i}`}
            position={[lat, lng]}
            icon={crearIconoLindero(lindero.longitud, lindero.rumbo)}
            interactive={false}
          />
        );
      })}
    </>
  );
}

// Capa de curvas de nivel (polilíneas continuas suavizadas)
function CurvasNivelLayer({ curvas, colorNormal = '#7B1FA2', colorMaestra = '#4527A0' }: {
  curvas: CurvaNivel[];
  colorNormal?: string;
  colorMaestra?: string;
}) {
  const map = useMap();

  useEffect(() => {
    const layers: L.Layer[] = [];

    // Intervalo entre cotas para detectar curvas maestras (cada 5 intervalos)
    const intervalo = curvas.length >= 2 ? curvas[1]!.cota - curvas[0]!.cota : 0;
    const pasoMaestra = intervalo * 5;

    curvas.forEach(curva => {
      const esMaestra = pasoMaestra > 0 && curva.cota % pasoMaestra === 0;
      const color  = esMaestra ? colorMaestra : colorNormal;
      const weight = esMaestra ? 2 : 1.1;
      const opacity = esMaestra ? 0.85 : 0.55;

      curva.lineas.forEach(linea => {
        const pts = linea.puntos.map(p => [p.lat, p.lng] as LatLngTuple);
        const suave = chaikin(pts, 2, linea.cerrada);
        const pl = L.polyline(linea.cerrada ? [...suave, suave[0]!] : suave, {
          color, weight, opacity, interactive: false, lineCap: 'round', lineJoin: 'round',
        });
        pl.addTo(map);
        layers.push(pl);
      });

      // Etiqueta de cota en el punto medio de la línea más larga
      const masLarga = curva.lineas.reduce((best, l) => l.puntos.length > best.puntos.length ? l : best, curva.lineas[0]!);
      if (masLarga && masLarga.puntos.length >= 2 && (esMaestra || curvas.length <= 12)) {
        const medio = masLarga.puntos[Math.floor(masLarga.puntos.length / 2)]!;
        const icon = L.divIcon({
          html: `<span style="font-size:8px;font-weight:700;color:${color};font-family:sans-serif;background:rgba(255,255,255,0.82);padding:0 2px;border-radius:2px;white-space:nowrap;">${curva.cota} m</span>`,
          className: '',
          iconSize: undefined,
          iconAnchor: [10, 5],
        });
        const mk = L.marker([medio.lat, medio.lng], { icon, interactive: false });
        mk.addTo(map);
        layers.push(mk);
      }
    });

    return () => { layers.forEach(l => map.removeLayer(l)); };
  }, [map, curvas, colorNormal, colorMaestra]);

  return null;
}

// ─── Terrarium elevation tile layer ──────────────────────────────────────────

function TerrariumLayer({ elevMin, elevMax, onRangoDetectado }: {
  elevMin: number;
  elevMax: number;
  onRangoDetectado?: (min: number, max: number) => void;
}) {
  const map = useMap();
  const samplesRef    = useRef<number[]>([]);
  const reportedRef   = useRef(false);
  const callbackRef   = useRef(onRangoDetectado);
  callbackRef.current = onRangoDetectado;

  useEffect(() => {
    samplesRef.current  = [];
    reportedRef.current = false;
    const range = Math.max(1, elevMax - elevMin);
    const STOPS: [number, number, number, number][] = [
      [0.00,  21, 101, 192],
      [0.12,  66, 165, 245],
      [0.28, 102, 187, 106],
      [0.48, 255, 238,  88],
      [0.65, 255, 167,  38],
      [0.82, 141, 110,  99],
      [1.00, 236, 239, 241],
    ];
    function ramp(t: number): [number, number, number] {
      const tc = Math.max(0, Math.min(1, t));
      for (let i = 0; i < STOPS.length - 1; i++) {
        const [ta, ra, ga, ba] = STOPS[i]!;
        const [tb, rb, gb, bb] = STOPS[i + 1]!;
        if (tc >= ta && tc <= tb) {
          const f = (tc - ta) / (tb - ta);
          return [Math.round(ra + (rb - ra) * f), Math.round(ga + (gb - ga) * f), Math.round(ba + (bb - ba) * f)];
        }
      }
      const last = STOPS[STOPS.length - 1]!;
      return [last[1], last[2], last[3]];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GridClass = (L.GridLayer as any).extend({
      createTile(coords: L.Coords, done: L.DoneCallback) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) { (done as unknown as (e: null, t: HTMLElement) => void)(null, canvas); return canvas; }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          try {
            const id = ctx.getImageData(0, 0, 256, 256);
            const px = id.data;
            for (let i = 0; i < px.length; i += 4) {
              const elev = px[i]! * 256 + px[i + 1]! + px[i + 2]! / 256 - 32768;
              if (elev < -100) { px[i + 3] = 0; continue; }
              // muestrear 1 de cada 16 píxeles para auto-detectar rango
              if (i % 64 === 0) samplesRef.current.push(elev);
              const [cr, cg, cb] = ramp((elev - elevMin) / range);
              px[i] = cr; px[i + 1] = cg; px[i + 2] = cb; px[i + 3] = 190;
            }
            ctx.putImageData(id, 0, 0);
            // Tras ≥500 muestras (≈8 tiles), reportar p2/p98 al padre
            if (!reportedRef.current && samplesRef.current.length >= 500 && callbackRef.current) {
              reportedRef.current = true;
              const sorted = [...samplesRef.current].sort((a, b) => a - b);
              const p2  = sorted[Math.floor(sorted.length * 0.02)] ?? sorted[0]!;
              const p98 = sorted[Math.floor(sorted.length * 0.98)] ?? sorted[sorted.length - 1]!;
              callbackRef.current(Math.max(0, p2), Math.max(p2 + 1, p98));
            }
          } catch { ctx.clearRect(0, 0, 256, 256); }
          (done as unknown as (e: null, t: HTMLElement) => void)(null, canvas);
        };
        img.onerror = () => { (done as unknown as (e: null, t: HTMLElement) => void)(null, canvas); };
        img.src = `/api/terrarium?z=${coords.z}&x=${coords.x}&y=${coords.y}`;
        return canvas;
      },
    });

    const layer = new GridClass({ opacity: 1, zIndex: 200 }) as L.GridLayer;
    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map, elevMin, elevMax]);
  return null;
}

// ─── Middle-mouse pan ─────────────────────────────────────────────────────────

function MiddleMousePan() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let active = false;
    let lx = 0, ly = 0;
    const down = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      active = true; lx = e.clientX; ly = e.clientY;
      container.style.cursor = 'grabbing';
    };
    const move = (e: MouseEvent) => {
      if (!active) return;
      map.panBy([lx - e.clientX, ly - e.clientY], { animate: false });
      lx = e.clientX; ly = e.clientY;
    };
    const up = (e: MouseEvent) => {
      if (e.button !== 1) return;
      active = false;
      container.style.cursor = '';
    };
    container.addEventListener('mousedown', down);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      container.removeEventListener('mousedown', down);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [map]);
  return null;
}

// Expone flyTo al padre para centrar el mapa en un mojón recién agregado por coords
function FlyToExposer({ onReady }: { onReady: (fn: (lat: number, lng: number) => void) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady((lat, lng) => map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.6 }));
  }, [map, onReady]);
  return null;
}

// Reporta la posición del cursor sobre el mapa (siempre, no solo dibujando).
// Va a un ref del padre que la barra de estado consulta con rAF → cero re-renders.
function MapMouseTracker({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  const cb = useRef(onMove);
  cb.current = onMove;
  useMapEvents({ mousemove(e) { cb.current(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// Redibuja el mapa cuando cambia el modo captura (el contenedor cambia de tamaño)
function InvalidarSize({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 260);
    return () => clearTimeout(t);
  }, [map, trigger]);
  return null;
}

// Notifica zoom + lat del centro al padre (para escala gráfica)
function MapChangeWatcher({ onMapChange }: { onMapChange: (zoom: number, lat: number) => void }) {
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

// ─── Props ────────────────────────────────────────────────────────────────────

// Expone una función para que el padre pueda leer los bounds actuales del mapa
function BoundsExposer({ onReady }: { onReady: (fn: () => { latMin: number; latMax: number; lngMin: number; lngMax: number }) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(() => {
      const b = map.getBounds();
      return { latMin: b.getSouth(), latMax: b.getNorth(), lngMin: b.getWest(), lngMax: b.getEast() };
    });
  }, [map, onReady]);
  return null;
}

interface Props {
  mojones:       Mojon[];
  seleccionado:  string | null;
  onClickMapa:   (lat: number, lng: number) => void;
  onSeleccionar: (id: string | null) => void;
  zonas?:        Zona[];
  zonaEnDibujado?: Array<{ lat: number; lng: number }> | null;
  sectores?:     Sector[];
  sectorEnDibujado?: Array<{ lat: number; lng: number }> | null;
  pines?:        Pin[];
  onEditarPin?:  (id: string) => void;
  caminos?:      Camino[];
  caminoEnDibujado?: Array<{ lat: number; lng: number }> | null;
  dibujando?:         boolean;
  datosShader?:       DatosShader | null;
  datosEscorrentia?:  DatosEscorrentia | null;
  datosSugerencias?:  ResultadoSugerencias | null;
  cuencaPoligono?:    Array<{ lat: number; lng: number }> | null;
  cuencaOutlet?:      { lat: number; lng: number } | null;
  potrerosLayer?:     PotrerosLayout | null;
  capas?:             CapasVisibles;
  // ── Dibujo libre ──
  dibujos?:           ElementoDibujo[];
  dibujoEnCurso?:     DibujoEnCurso | null;
  dibujoSelId?:       string | null;
  onClickDibujo?:     (id: string) => void;
  onMoverDibujo?:     (id: string, dLat: number, dLng: number) => void;
  modoDibujo?:        TipoDibujo | 'seleccion' | 'medir' | 'rectangulo' | 'mano_libre' | 'radio_accion' | null;
  colorDibujo?:       string;
  // ── Terrarium ──
  elevMin?:           number;
  elevMax?:           number;
  onRangoTerrarium?:  (min: number, max: number) => void;
  // ── Shader opacity ──
  opacidadShaderElev?: number;
  opacidadShaderPend?: number;
  // ── Aguadas layer ──
  aguadasLayer?:      ElementoAguada[];
  // ── Arco solar ──
  datosArcoSolar?:    DatosArcoSolar | null;
  onMoverArcoSolar?:  (lat: number, lng: number) => void;
  // ── Vertex / pin editing ──
  onMoverVertice?:    (id: string, idx: number, lat: number, lng: number) => void;
  onInsertarVertice?: (id: string, idxAfter: number, lat: number, lng: number) => void;
  onEliminarVertice?: (id: string, idx: number) => void;
  onMoverPin?:        (id: string, lat: number, lng: number) => void;
  // ── Bounds para topografía del área visible ──
  onGetBounds?:       (fn: () => { latMin: number; latMax: number; lngMin: number; lngMax: number }) => void;
  // ── Zoom/centro para escala gráfica ──
  onMapChange?:       (zoom: number, lat: number) => void;
  // ── Fly-to programático ──
  onGetFlyTo?:        (fn: (lat: number, lng: number) => void) => void;
  // ── Plano profesional ──
  metricas?:          MetricasPoligono | null;
  curvasNivel?:       CurvaNivel[];
  colorCurvasNivel?:  { normal: string; maestra: string };
  // ── CAD: snap / ortho / preview ──
  snapActivo?:        boolean;
  orthoActivo?:       boolean;
  snapPuntos?:        PuntoSnap[];
  snapSegmentos?:     SnapSegmento[];
  tipoActivo?:        TipoActivo;
  verticesActivos?:   Array<{ lat: number; lng: number }> | null;
  colorPreview?:      string;
  // ── Medición efímera ──
  medicion?:          Array<{ lat: number; lng: number }> | null;
  onCursorCad?:       (lat: number, lng: number) => void;
  onCursorMove?:      (lat: number, lng: number) => void;
  capturaMode?:       boolean;
  // ── Overlay de imagen (plano de referencia) ──
  overlay?:           OverlayImagen | null;
  onOverlayEsquina?:  (esquina: 'sw' | 'ne' | 'centro', lat: number, lng: number) => void;
  // ── Master Plan ──
  masterPlan?:        ElementoMasterPlan[] | null;
  // ── Perfil de elevación: punto sincronizado con el cursor del panel de perfil ──
  perfilPunto?:       { lat: number; lng: number } | null;
}

const CENTRO_INICIAL: LatLngExpression = [-30.8, -64.7];
const ZOOM_INICIAL = 7;

const CAPAS_DEFAULT: CapasVisibles = { terreno: true, zonas: true, sectores: true, pines: true, caminos: true, shaderElev: false, shaderPend: false, terrariumElev: false, escorrentias: false, sugerencias: false, aguadas: true, dibujos: true, arcSolar: false, linderoLabels: false, curvasNivel: false, cotas: true, medidas: true };

function MapLeaflet({
  mojones, seleccionado, onClickMapa, onSeleccionar,
  zonas = [], zonaEnDibujado = null,
  sectores = [], sectorEnDibujado = null,
  pines = [], onEditarPin,
  caminos = [], caminoEnDibujado = null, perfilPunto = null,
  dibujando = false,
  datosShader = null,
  datosEscorrentia = null,
  datosSugerencias = null,
  cuencaPoligono = null,
  cuencaOutlet = null,
  potrerosLayer = null,
  capas = CAPAS_DEFAULT,
  dibujos = [],
  dibujoEnCurso = null,
  dibujoSelId = null,
  onClickDibujo,
  onMoverDibujo,
  modoDibujo = null,
  colorDibujo = '#EF4444',
  elevMin = 0,
  elevMax = 500,
  onRangoTerrarium,
  opacidadShaderElev = 0.65,
  opacidadShaderPend = 0.65,
  aguadasLayer = [],
  datosArcoSolar = null,
  onMoverArcoSolar,
  onMoverVertice,
  onInsertarVertice,
  onEliminarVertice,
  onMoverPin,
  onGetBounds,
  onMapChange,
  onGetFlyTo,
  metricas = null,
  curvasNivel = [],
  colorCurvasNivel,
  snapActivo = false,
  orthoActivo = false,
  snapPuntos = [],
  snapSegmentos = [],
  tipoActivo = null,
  verticesActivos = null,
  colorPreview = '#EF4444',
  medicion = null,
  onCursorCad,
  onCursorMove,
  capturaMode = false,
  overlay = null,
  onOverlayEsquina,
  masterPlan = null,
}: Props) {
  const [capa, setCapa] = useState<Capa>('satelite');
  const positions: LatLngExpression[] = mojones.map(m => [m.lat, m.lng]);

  const cursorClass = (modoDibujo && modoDibujo !== 'seleccion') || tipoActivo
    ? 'cursor-crosshair'
    : modoDibujo === 'seleccion'
    ? 'cursor-pointer'
    : '';

  return (
    <div className={`relative h-full w-full ${cursorClass}`} id="mapa-captura">
      <MapContainer
        center={CENTRO_INICIAL}
        zoom={ZOOM_INICIAL}
        maxZoom={22}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        {/* ── Tiles ── */}
        {capa === 'satelite' ? (
          <>
            {/* maxNativeZoom 19: si la tile no existe en zoom > 19, Leaflet escala la de zoom 19 */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
              maxNativeZoom={19}
              maxZoom={22}
              crossOrigin="anonymous"
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={22}
              opacity={0.75}
              crossOrigin="anonymous"
            />
          </>
        ) : (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
            maxNativeZoom={17}
            maxZoom={22}
            crossOrigin="anonymous"
          />
        )}

        {/* ── Overlay de imagen (plano de referencia para calcar) ── */}
        {overlay && (
          <>
            <ImageOverlay
              url={overlay.url}
              bounds={[[overlay.sw.lat, overlay.sw.lng], [overlay.ne.lat, overlay.ne.lng]]}
              opacity={overlay.opacidad}
              zIndex={250}
            />
            {onOverlayEsquina && (() => {
              const handle = (txt: string, color: string) => L.divIcon({
                html: `<div style="width:16px;height:16px;border-radius:3px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:9px;color:white;cursor:move;">${txt}</div>`,
                className: '', iconSize: [16, 16], iconAnchor: [8, 8],
              });
              const cen = { lat: (overlay.sw.lat + overlay.ne.lat) / 2, lng: (overlay.sw.lng + overlay.ne.lng) / 2 };
              return (
                <>
                  <Marker position={[overlay.sw.lat, overlay.sw.lng]} draggable icon={handle('↙', '#0EA5E9')} zIndexOffset={600}
                    eventHandlers={{ moveend(e) { const p = (e.target as L.Marker).getLatLng(); onOverlayEsquina('sw', p.lat, p.lng); } }} />
                  <Marker position={[overlay.ne.lat, overlay.ne.lng]} draggable icon={handle('↗', '#0EA5E9')} zIndexOffset={600}
                    eventHandlers={{ moveend(e) { const p = (e.target as L.Marker).getLatLng(); onOverlayEsquina('ne', p.lat, p.lng); } }} />
                  <Marker position={[cen.lat, cen.lng]} draggable icon={handle('✥', '#D9A441')} zIndexOffset={600}
                    eventHandlers={{ moveend(e) { const p = (e.target as L.Marker).getLatLng(); onOverlayEsquina('centro', p.lat, p.lng); } }} />
                </>
              );
            })()}
          </>
        )}

        <CadInteractivo
          onClickMapa={onClickMapa}
          modoDibujo={modoDibujo}
          tipoActivo={tipoActivo}
          verticesActivos={verticesActivos}
          snapActivo={snapActivo}
          orthoActivo={orthoActivo}
          snapPuntos={snapPuntos}
          snapSegmentos={snapSegmentos}
          colorPreview={colorPreview}
          onCursor={onCursorCad}
        />
        {medicion && medicion.length > 0 && <MedicionLayer puntos={medicion} />}
        <AutoFit mojones={mojones} />
        <MiddleMousePan />
        {onCursorMove && <MapMouseTracker onMove={onCursorMove} />}
        <InvalidarSize trigger={capturaMode} />
        {onGetBounds  && <BoundsExposer  onReady={onGetBounds} />}
        {onMapChange  && <MapChangeWatcher onMapChange={onMapChange} />}
        {onGetFlyTo   && <FlyToExposer    onReady={onGetFlyTo} />}
        {capas.terrariumElev && <TerrariumLayer elevMin={elevMin} elevMax={elevMax} onRangoDetectado={onRangoTerrarium} />}
        {capas.linderoLabels && metricas && mojones.length >= 3 && <LinderoLabels mojones={mojones} metricas={metricas} />}
        {capas.curvasNivel   && curvasNivel.length > 0 && <CurvasNivelLayer curvas={curvasNivel} colorNormal={colorCurvasNivel?.normal} colorMaestra={colorCurvasNivel?.maestra} />}

        {/* ── Shader topográfico (canvas con interpolación bilineal) ── */}
        {datosShader && capas.shaderElev && (
          <ShaderCanvasLayer
            celdas={datosShader.celdas} tipo="elev"
            elevMin={datosShader.elev_min} elevMax={datosShader.elev_max}
            pendMax={datosShader.pend_max} opacidad={opacidadShaderElev}
          />
        )}
        {datosShader && capas.shaderPend && (
          <ShaderCanvasLayer
            celdas={datosShader.celdas} tipo="pend"
            elevMin={datosShader.elev_min} elevMax={datosShader.elev_max}
            pendMax={datosShader.pend_max} opacidad={opacidadShaderPend}
          />
        )}

        {/* ── Escorrentías ── */}
        {capas.escorrentias && datosEscorrentia && datosEscorrentia.cadenas.map((cadena, i) => {
          const t = cadena.acum_max / datosEscorrentia.acum_max;
          const weight = 1 + Math.round(t * 4);
          const color  = t > 0.6 ? '#0D47A1' : t > 0.3 ? '#1976D2' : '#64B5F6';
          return (
            <Polyline
              key={`esc-${i}`}
              positions={cadena.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
              pathOptions={{ color, weight, opacity: 0.75, interactive: false, lineCap: 'round', lineJoin: 'round' }}
            />
          );
        })}

        {/* ── Cuenca de aporte ── */}
        {cuencaPoligono && cuencaPoligono.length >= 3 && (
          <Polygon
            positions={cuencaPoligono.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#1565C0', weight: 2, fillColor: '#1565C0', fillOpacity: 0.15, interactive: false, dashArray: '4 3' }}
          />
        )}
        {cuencaOutlet && (
          <CircleMarker
            center={[cuencaOutlet.lat, cuencaOutlet.lng]}
            radius={6}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#0D47A1', fillOpacity: 1 }}
          />
        )}

        {/* ── Potreros (subdivisión de pastoreo) + bebederos ── */}
        {potrerosLayer && (
          <>
            {potrerosLayer.potreros.map(p => (
              <Polygon
                key={`pot-${p.id}`}
                positions={p.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                pathOptions={{ color: '#2E7D32', weight: 1.5, fillColor: '#66BB6A', fillOpacity: 0.10, interactive: false }}
              />
            ))}
            {potrerosLayer.bebederos.map((b, i) => (
              <LeafCircle
                key={`beb-r-${i}`}
                center={[b.lat, b.lng]}
                radius={potrerosLayer.radio_m}
                pathOptions={{ color: '#1565C0', weight: 1, fillColor: '#42A5F5', fillOpacity: 0.10, dashArray: '4 4', interactive: false }}
              />
            ))}
            {potrerosLayer.bebederos.map((b, i) => (
              <CircleMarker
                key={`beb-c-${i}`}
                center={[b.lat, b.lng]}
                radius={5}
                pathOptions={{ color: '#fff', weight: 2, fillColor: '#1565C0', fillOpacity: 1 }}
              />
            ))}
          </>
        )}

        {/* ── Camino sugerido ── */}
        {capas.sugerencias && datosSugerencias && datosSugerencias.camino.length >= 2 && (
          <Polyline
            positions={datosSugerencias.camino.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#E65100', weight: 3, dashArray: '12 6', opacity: 0.85, interactive: false }}
          />
        )}

        {/* ── Terreno (polígono de mojones) ── */}
        {capas.terreno && mojones.length >= 3 && (
          <Polygon
            positions={positions}
            pathOptions={{
              fillColor: '#3A5A40', fillOpacity: capa === 'topo' ? 0.10 : 0.18,
              color: '#D9A441', weight: 2.5, interactive: !dibujando,
            }}
          />
        )}
        {capas.terreno && mojones.length === 2 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#D9A441', weight: 2, dashArray: '8 5', opacity: 0.8, interactive: false }}
          />
        )}

        {/* ── Caminos ── */}
        {capas.caminos && caminos.map(c => (
          <Polyline
            key={c.id}
            positions={c.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
            pathOptions={{ color: c.color, weight: 3, opacity: 0.85, interactive: !dibujando }}
          />
        ))}

        {/* Camino en construcción */}
        {caminoEnDibujado && caminoEnDibujado.length >= 2 && (
          <Polyline
            positions={caminoEnDibujado.map(v => [v.lat, v.lng] as LatLngTuple)}
            pathOptions={{ color: '#8B4513', weight: 3, dashArray: '8 4', opacity: 0.8, interactive: false }}
          />
        )}

        {/* Punto sincronizado con el cursor del perfil de elevación */}
        {perfilPunto && (
          <>
            <CircleMarker center={[perfilPunto.lat, perfilPunto.lng]} radius={9}
              pathOptions={{ color: '#1a1a1a', weight: 2, opacity: 0.35, fillColor: '#1a1a1a', fillOpacity: 0.08, interactive: false }} />
            <CircleMarker center={[perfilPunto.lat, perfilPunto.lng]} radius={5}
              pathOptions={{ color: '#1a1a1a', weight: 2.5, opacity: 1, fillColor: '#ffffff', fillOpacity: 1, interactive: false }} />
          </>
        )}

        {/* ── Zonas ── */}
        {capas.zonas && zonas.filter(z => z.vertices.length >= 3).map(z => {
          const color = z.color ?? CATEGORIAS_ZONA[z.categoria].color;
          return (
            <Polygon
              key={z.id}
              positions={[z.vertices.map(v => [v.lat, v.lng] as LatLngTuple)]}
              pathOptions={{ fillColor: color, fillOpacity: 0.22, color, weight: 2.5, opacity: 1, interactive: !dibujando }}
            />
          );
        })}

        {/* Zona en construcción */}
        {zonaEnDibujado && zonaEnDibujado.length >= 1 && (
          <>
            {zonaEnDibujado.length >= 3 && (
              <Polygon
                positions={[zonaEnDibujado.map(v => [v.lat, v.lng] as LatLngTuple)]}
                pathOptions={{ fillColor: '#FFD54F', fillOpacity: 0.15, color: '#FFD54F', weight: 2, dashArray: '6 4', interactive: false }}
              />
            )}
            {zonaEnDibujado.length >= 2 && (
              <Polyline
                positions={zonaEnDibujado.map(v => [v.lat, v.lng] as LatLngTuple)}
                pathOptions={{ color: '#FFD54F', weight: 2.5, dashArray: '6 4', interactive: false }}
              />
            )}
          </>
        )}

        {/* ── Sectores ── */}
        {capas.sectores && sectores.filter(s => s.vertices.length >= 3).map(s => {
          const color = s.color ?? TIPOS_SECTOR[s.tipo].color;
          return (
            <Polygon
              key={s.id}
              positions={[s.vertices.map(v => [v.lat, v.lng] as LatLngTuple)]}
              pathOptions={{ fillColor: color, fillOpacity: 0.18, color, weight: 2.5, opacity: 1, dashArray: '10 5', interactive: !dibujando }}
            />
          );
        })}

        {/* Sector en construcción */}
        {sectorEnDibujado && sectorEnDibujado.length >= 1 && (
          <>
            {sectorEnDibujado.length >= 3 && (
              <Polygon
                positions={[sectorEnDibujado.map(v => [v.lat, v.lng] as LatLngTuple)]}
                pathOptions={{ fillColor: '#81D4FA', fillOpacity: 0.15, color: '#81D4FA', weight: 2, dashArray: '6 4', interactive: false }}
              />
            )}
            {sectorEnDibujado.length >= 2 && (
              <Polyline
                positions={sectorEnDibujado.map(v => [v.lat, v.lng] as LatLngTuple)}
                pathOptions={{ color: '#81D4FA', weight: 2.5, dashArray: '6 4', interactive: false }}
              />
            )}
          </>
        )}

        {/* ── Pines ── */}
        {capas.pines && pines.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={crearIconoPin(p)}
            draggable
            eventHandlers={{
              click: () => !dibujando && onEditarPin?.(p.id),
              moveend(e) {
                const pos = (e.target as L.Marker).getLatLng();
                onMoverPin?.(p.id, pos.lat, pos.lng);
              },
            }}
          />
        ))}

        {/* ── Sugerencias: vivienda y reservorio ── */}
        {capas.sugerencias && datosSugerencias && (
          <>
            {datosSugerencias.viviendas.map((v, i) => (
              <Marker key={`viv-${i}`} position={[v.lat, v.lng]}
                icon={crearIconoSugerencia('vivienda', i, v.score)} />
            ))}
            {datosSugerencias.reservorios.map((r, i) => (
              <Marker key={`res-${i}`} position={[r.lat, r.lng]}
                icon={crearIconoSugerencia('reservorio', i, r.score)} />
            ))}
          </>
        )}

        {/* ── Master Plan: elementos del programa con ubicación y área sugerida ── */}
        {capas.sugerencias && masterPlan && masterPlan.map(el => {
          const def = TIPOS_ITEM[el.tipo];
          const cLat = el.vertices.reduce((s, v) => s + v.lat, 0) / el.vertices.length;
          const cLng = el.vertices.reduce((s, v) => s + v.lng, 0) / el.vertices.length;
          const icon = L.divIcon({
            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none;">
              <div style="font-size:16px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5));">${def.emoji}</div>
              <span style="background:rgba(255,255,255,0.9);color:#1B3A2D;font-size:8px;font-weight:700;font-family:sans-serif;padding:0 3px;border-radius:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${el.nombre} · ${formatearArea(el.area_m2)}</span>
            </div>`,
            className: '', iconSize: undefined, iconAnchor: [8, 10],
          });
          return (
            <React.Fragment key={el.id}>
              <Polygon
                positions={el.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                pathOptions={{ color: def.color, fillColor: def.color, fillOpacity: 0.18, weight: 2, dashArray: '8 5', interactive: false }}
              />
              <Marker position={[cLat, cLng]} icon={icon} interactive={false} />
            </React.Fragment>
          );
        })}

        {/* ── Marcadores de mojones (siempre encima de todo) ── */}
        {capas.terreno && mojones.map(m => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={crearIconoMojon(m.numero, seleccionado === m.id)}
            eventHandlers={{ click: () => !dibujando && onSeleccionar(seleccionado === m.id ? null : m.id) }}
          />
        ))}

        {/* ── Dibujos guardados ── */}
        {(capas.dibujos !== false) && dibujos.map(d => {
          const sel  = dibujoSelId === d.id;
          const selW = sel ? 4 : undefined;
          const selD = sel ? '8 4' : undefined;
          const onClick = () => modoDibujo === 'seleccion' && onClickDibujo?.(d.id);

          if (d.tipo === 'linea') {
            const medio = d.vertices[Math.floor(d.vertices.length / 2)];
            return (
              <React.Fragment key={d.id}>
                <Polyline
                  positions={d.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                  pathOptions={{ color: d.color, weight: selW ?? d.grosor, dashArray: selD, opacity: 1, interactive: true }}
                  eventHandlers={{ click: onClick }}
                />
                {capas.medidas && medio && (
                  <Marker position={[medio.lat, medio.lng]} interactive={false}
                    icon={crearIconoMedida(formatearLongitud(longitudLineaM(d.vertices)), d.color)} />
                )}
              </React.Fragment>
            );
          }
          if (d.tipo === 'curva') {
            const smooth = chaikin(d.vertices.map(v => [v.lat, v.lng] as LatLngTuple));
            const medio = d.vertices[Math.floor(d.vertices.length / 2)];
            return (
              <React.Fragment key={d.id}>
                <Polyline
                  positions={smooth}
                  pathOptions={{ color: d.color, weight: selW ?? d.grosor, dashArray: selD, opacity: 1, interactive: true }}
                  eventHandlers={{ click: onClick }}
                />
                {capas.medidas && medio && (
                  <Marker position={[medio.lat, medio.lng]} interactive={false}
                    icon={crearIconoMedida(formatearLongitud(longitudLineaM(d.vertices)), d.color)} />
                )}
              </React.Fragment>
            );
          }
          if (d.tipo === 'poligono') {
            const cLat = d.vertices.reduce((s, v) => s + v.lat, 0) / d.vertices.length;
            const cLng = d.vertices.reduce((s, v) => s + v.lng, 0) / d.vertices.length;
            return (
              <React.Fragment key={d.id}>
                <Polygon
                  positions={d.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                  pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: d.opacidad, weight: selW ?? 2, dashArray: selD, interactive: true }}
                  eventHandlers={{ click: onClick }}
                />
                {capas.medidas && d.vertices.length >= 3 && (
                  <Marker position={[cLat, cLng]} interactive={false}
                    icon={crearIconoMedida(formatearArea(areaPoligonoM2(d.vertices)), d.color)} />
                )}
              </React.Fragment>
            );
          }
          if (d.tipo === 'circulo') return (
            <React.Fragment key={d.id}>
              <LeafCircle
                center={[d.lat, d.lng]}
                radius={d.radio}
                pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: d.opacidad, weight: selW ?? 2, dashArray: selD, interactive: true }}
                eventHandlers={{ click: onClick }}
              />
              {capas.medidas && (
                <Marker position={[d.lat, d.lng]} interactive={false}
                  icon={crearIconoMedida(`r ${formatearLongitud(d.radio)} · ${formatearArea(Math.PI * d.radio * d.radio)}`, d.color)} />
              )}
            </React.Fragment>
          );
          if (d.tipo === 'cota') {
            if (!capas.cotas) return null;
            const a = d.vertices[0], b = d.vertices[1];
            if (!a || !b) return null;
            const dist  = distanciaMetros(a.lat, a.lng, b.lat, b.lng);
            // Ticks perpendiculares en los extremos (4% del largo del segmento)
            const dLat = b.lat - a.lat, dLng = b.lng - a.lng;
            const len  = Math.hypot(dLat, dLng) || 1e-9;
            const pLat = (-dLng / len) * len * 0.04;
            const pLng = ( dLat / len) * len * 0.04;
            return (
              <React.Fragment key={d.id}>
                <Polyline
                  positions={[[a.lat, a.lng], [b.lat, b.lng]]}
                  pathOptions={{ color: d.color, weight: selW ?? 1.5, dashArray: selD, opacity: 0.95, interactive: true }}
                  eventHandlers={{ click: onClick }}
                />
                <Polyline positions={[[a.lat - pLat, a.lng - pLng], [a.lat + pLat, a.lng + pLng]]}
                  pathOptions={{ color: d.color, weight: 1.5, opacity: 0.95, interactive: false }} />
                <Polyline positions={[[b.lat - pLat, b.lng - pLng], [b.lat + pLat, b.lng + pLng]]}
                  pathOptions={{ color: d.color, weight: 1.5, opacity: 0.95, interactive: false }} />
                <Marker position={[(a.lat + b.lat) / 2, (a.lng + b.lng) / 2]} interactive={false}
                  icon={crearIconoMedida(formatearLongitud(dist), d.color)} />
              </React.Fragment>
            );
          }
          if (d.tipo === 'texto') return (
            <Marker key={d.id}
              position={[d.lat, d.lng]}
              icon={crearIconoTexto(d.texto, d.color, d.tamano, sel)}
              draggable={modoDibujo === 'seleccion'}
              eventHandlers={{
                click: onClick,
                moveend(e) {
                  if (modoDibujo !== 'seleccion') return;
                  const p = (e.target as L.Marker).getLatLng();
                  onMoverDibujo?.(d.id, p.lat - d.lat, p.lng - d.lng);
                },
              }}
            />
          );
          if (d.tipo === 'flecha') {
            const [p1, p2] = d.vertices;
            if (!p1 || !p2) return null;
            const az = azimutGrados(p1.lat, p1.lng, p2.lat, p2.lng);
            const arrowIcon = L.divIcon({
              html: `<svg width="20" height="20" viewBox="-10 -10 20 20" style="transform:rotate(${az}deg);display:block;overflow:visible"><polygon points="0,-9 -5,5 0,2 5,5" fill="${d.color}" opacity="0.95"/></svg>`,
              className: '',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            return (
              <React.Fragment key={d.id}>
                <Polyline
                  positions={d.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                  pathOptions={{ color: d.color, weight: selW ?? d.grosor, dashArray: selD, opacity: 1, interactive: true }}
                  eventHandlers={{ click: onClick }}
                />
                <Marker position={[p2.lat, p2.lng]} icon={arrowIcon} interactive={false} zIndexOffset={100} />
              </React.Fragment>
            );
          }
          if (d.tipo === 'punto') {
            return (
              <React.Fragment key={d.id}>
                <CircleMarker
                  center={[d.lat, d.lng]}
                  radius={sel ? 10 : 7}
                  pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: 0.85, weight: sel ? 3 : 2, dashArray: selD, interactive: true }}
                  eventHandlers={{ click: onClick }}
                />
              </React.Fragment>
            );
          }
          return null;
        })}

        {/* ── Mango de arrastre para shape seleccionada ── */}
        {modoDibujo === 'seleccion' && dibujoSelId && (() => {
          const el = dibujos.find(d => d.id === dibujoSelId);
          if (!el || el.tipo === 'texto') return null;
          let lat: number, lng: number;
          if (el.tipo === 'circulo' || el.tipo === 'punto') { lat = el.lat; lng = el.lng; }
          else {
            lat = el.vertices.reduce((s, v) => s + v.lat, 0) / el.vertices.length;
            lng = el.vertices.reduce((s, v) => s + v.lng, 0) / el.vertices.length;
          }
          const icon = L.divIcon({
            html: `<div style="width:22px;height:22px;border-radius:50%;background:#D9A441;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;cursor:move;font-size:12px;color:#0F1410;user-select:none;">✥</div>`,
            className: '', iconSize: [22, 22], iconAnchor: [11, 11],
          });
          return (
            <Marker key={`handle-${dibujoSelId}`} position={[lat, lng]} icon={icon} draggable
              eventHandlers={{
                moveend(e) {
                  const p = (e.target as L.Marker).getLatLng();
                  onMoverDibujo?.(dibujoSelId, p.lat - lat, p.lng - lng);
                },
              }}
            />
          );
        })()}

        {/* ── Vertex handles para shape seleccionada (arrastrar · doble clic borra) ── */}
        {modoDibujo === 'seleccion' && dibujoSelId && (() => {
          const el = dibujos.find(d => d.id === dibujoSelId);
          if (!el || el.tipo === 'texto' || el.tipo === 'circulo' || el.tipo === 'punto') return null;
          return el.vertices.map((v, idx) => {
            const vIcon = L.divIcon({
              html: `<div title="Arrastrar para mover · doble clic para borrar" style="width:12px;height:12px;border-radius:50%;background:white;border:2px solid ${el.color};box-shadow:0 1px 4px rgba(0,0,0,0.45);cursor:move;"></div>`,
              className: '', iconSize: [12, 12], iconAnchor: [6, 6],
            });
            return (
              <Marker key={`vx-${dibujoSelId}-${idx}`}
                position={[v.lat, v.lng]}
                icon={vIcon}
                draggable
                zIndexOffset={500}
                eventHandlers={{
                  moveend(e) {
                    const p = (e.target as L.Marker).getLatLng();
                    onMoverVertice?.(dibujoSelId, idx, p.lat, p.lng);
                  },
                  dblclick() { onEliminarVertice?.(dibujoSelId, idx); },
                }}
              />
            );
          });
        })()}

        {/* ── Handles "+" en puntos medios para insertar vértices ── */}
        {modoDibujo === 'seleccion' && dibujoSelId && onInsertarVertice && (() => {
          const el = dibujos.find(d => d.id === dibujoSelId);
          if (!el || el.tipo === 'texto' || el.tipo === 'circulo' || el.tipo === 'punto') return null;
          const vs = el.vertices;
          const cerrado = el.tipo === 'poligono';
          const pares: Array<{ idx: number; lat: number; lng: number }> = [];
          const lim = cerrado ? vs.length : vs.length - 1;
          for (let i = 0; i < lim; i++) {
            const a = vs[i]!, b = vs[(i + 1) % vs.length]!;
            pares.push({ idx: i, lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 });
          }
          const addIcon = L.divIcon({
            html: `<div title="Insertar vértice" style="width:11px;height:11px;border-radius:50%;background:#22C55E;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;line-height:1;color:white;font-weight:700;cursor:cell;">+</div>`,
            className: '', iconSize: [11, 11], iconAnchor: [5.5, 5.5],
          });
          return pares.map(p => (
            <Marker key={`add-${dibujoSelId}-${p.idx}`} position={[p.lat, p.lng]} icon={addIcon} zIndexOffset={450}
              eventHandlers={{ click() { onInsertarVertice(dibujoSelId, p.idx, p.lat, p.lng); } }}
            />
          ));
        })()}

        {/* ── Aguadas layer ── */}
        {capas.aguadas && aguadasLayer.map(a => {
          if (a.tipo === 'represa' && a.lat !== undefined && a.lng !== undefined) {
            return (
              <Marker key={a.id}
                position={[a.lat, a.lng]}
                icon={crearIconoAguada(a.tipo, a.nombre)}
              />
            );
          }
          if ((a.tipo === 'swale' || a.tipo === 'keyline') && a.vertices && a.vertices.length >= 2) {
            const color = a.tipo === 'swale' ? '#26A69A' : '#66BB6A';
            const dash  = a.tipo === 'swale' ? '8 5' : '16 6';
            return (
              <Polyline key={a.id}
                positions={a.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                pathOptions={{ color, weight: 3, dashArray: dash, opacity: 0.9, interactive: false }}
              />
            );
          }
          return null;
        })}

        {/* ── Arco solar ── */}
        {capas.arcSolar && datosArcoSolar && <ArcoSolarLayer datos={datosArcoSolar} />}
        {/* Mango para mover el arco solar */}
        {capas.arcSolar && datosArcoSolar && onMoverArcoSolar && (() => {
          const c = datosArcoSolar.centro;
          const icon = L.divIcon({
            html: `<div title="Arrastrar para mover el arco solar" style="width:20px;height:20px;border-radius:50%;background:#FFD54F;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;cursor:move;font-size:11px;color:#0F1410;">☀</div>`,
            className: '', iconSize: [20, 20], iconAnchor: [10, 10],
          });
          return (
            <Marker key="arco-solar-handle" position={[c.lat, c.lng]} icon={icon} draggable
              eventHandlers={{
                moveend(e) {
                  const p = (e.target as L.Marker).getLatLng();
                  onMoverArcoSolar(p.lat, p.lng);
                },
              }}
            />
          );
        })()}

        {/* ── Dibujo en construcción (preview) ── */}
        {dibujoEnCurso && dibujoEnCurso.vertices.length >= 2 && (() => {
          const pts = dibujoEnCurso.vertices.map(v => [v.lat, v.lng] as LatLngTuple);
          if (dibujoEnCurso.tipo === 'poligono') return (
            <Polygon positions={pts}
              pathOptions={{ color: colorDibujo, fillColor: colorDibujo, fillOpacity: 0.12, weight: 2, dashArray: '6 4', interactive: false }} />
          );
          if (dibujoEnCurso.tipo === 'curva') return (
            <Polyline positions={chaikin(pts)}
              pathOptions={{ color: colorDibujo, weight: 2.5, dashArray: '6 4', opacity: 0.8, interactive: false }} />
          );
          if (dibujoEnCurso.tipo === 'circulo' && dibujoEnCurso.vertices.length === 2) {
            const c = dibujoEnCurso.vertices[0]!;
            const e = dibujoEnCurso.vertices[1]!;
            const r = distanciaMetros(c.lat, c.lng, e.lat, e.lng);
            return (
              <LeafCircle center={[c.lat, c.lng]} radius={r}
                pathOptions={{ color: colorDibujo, fillColor: colorDibujo, fillOpacity: 0.12, weight: 2, dashArray: '6 4', interactive: false }} />
            );
          }
          return (
            <Polyline positions={pts}
              pathOptions={{ color: colorDibujo, weight: 2.5, dashArray: '6 4', opacity: 0.8, interactive: false }} />
          );
        })()}
      </MapContainer>

      {/* Toggle de capa de fondo — oculto en PNG */}
      <div className="absolute bottom-20 left-3 z-[1000] flex rounded-lg overflow-hidden shadow-md border border-white/30 no-print">
        <button
          onClick={() => setCapa('satelite')}
          className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${capa === 'satelite' ? 'bg-moss-700 text-bone-50' : 'bg-white/90 text-ink-700 hover:bg-bone-100'}`}
        >
          Satélite
        </button>
        <button
          onClick={() => setCapa('topo')}
          className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${capa === 'topo' ? 'bg-moss-700 text-bone-50' : 'bg-white/90 text-ink-700 hover:bg-bone-100'}`}
        >
          Topográfico
        </button>
      </div>
    </div>
  );
}

export default React.memo(MapLeaflet);

// ─── Arco Solar Layer ─────────────────────────────────────────────────────────

function iconoSunEvent(color: string, hora: number): L.DivIcon {
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

function iconoNoon(color: string, elevacion: number, labelCorto: string): L.DivIcon {
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

// ─── Shader suavizado (canvas + ImageOverlay) ────────────────────────────────

function ShaderCanvasLayer({
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

function iconoCardinal(dir: string): L.DivIcon {
  return L.divIcon({
    html: `<span style="font-size:10px;font-weight:800;color:#555;font-family:sans-serif;pointer-events:none;">${dir}</span>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function ArcoSolarLayer({ datos }: { datos: DatosArcoSolar }) {
  const { centro, radio_m, arcos, brujula } = datos;

  return (
    <>
      {/* ── Círculo del horizonte ── */}
      <LeafCircle
        center={[centro.lat, centro.lng]}
        radius={radio_m}
        pathOptions={{ color: '#666', weight: 1, opacity: 0.28, fill: false, dashArray: '5 7', interactive: false }}
      />

      {/* ── Líneas cardinales ── */}
      <Polyline
        positions={[[brujula.N.lat, brujula.N.lng], [brujula.S.lat, brujula.S.lng]]}
        pathOptions={{ color: '#777', weight: 0.8, opacity: 0.22, dashArray: '3 7', interactive: false }}
      />
      <Polyline
        positions={[[brujula.E.lat, brujula.E.lng], [brujula.O.lat, brujula.O.lng]]}
        pathOptions={{ color: '#777', weight: 0.8, opacity: 0.22, dashArray: '3 7', interactive: false }}
      />

      {/* ── Labels cardinales ── */}
      {(Object.entries(brujula) as [string, { lat: number; lng: number }][]).map(([dir, pos]) => (
        <Marker
          key={`arc-dir-${dir}`}
          position={[pos.lat, pos.lng]}
          icon={iconoCardinal(dir === 'O' ? 'O' : dir)}
          interactive={false}
        />
      ))}

      {/* ── Arcos por fecha ── */}
      {arcos.map(arco => (
        <React.Fragment key={arco.fecha}>
          {/* Sombra para contraste sobre satélite */}
          <Polyline
            positions={arco.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#000', weight: 5, opacity: 0.18, interactive: false, lineCap: 'round', lineJoin: 'round' }}
          />
          {/* Arco principal */}
          <Polyline
            positions={arco.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: arco.color, weight: 2.5, opacity: 0.92, interactive: false, lineCap: 'round', lineJoin: 'round' }}
          />

          {/* Amanecer */}
          <Marker
            position={[arco.amanecer.lat, arco.amanecer.lng]}
            icon={iconoSunEvent(arco.color, arco.amanecer.hora)}
            interactive={false}
          />
          {/* Atardecer */}
          <Marker
            position={[arco.atardecer.lat, arco.atardecer.lng]}
            icon={iconoSunEvent(arco.color, arco.atardecer.hora)}
            interactive={false}
          />
          {/* Mediodía solar */}
          <Marker
            position={[arco.mediodia.lat, arco.mediodia.lng]}
            icon={iconoNoon(arco.color, arco.mediodia.elevacion, arco.labelCorto)}
            interactive={false}
          />
        </React.Fragment>
      ))}
    </>
  );
}
