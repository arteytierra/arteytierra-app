'use client';

import { useEffect, useState } from 'react';
import { Marker, Polyline, Circle as LeafCircle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  distanciaMetros, azimutGrados, areaPoligonoM2, longitudLineaM,
  formatearLongitud, formatearArea,
  pieDePerpendicular, puntoMasCercanoEnSegmento, anguloEnVertice,
} from '@/lib/dibujos';
import type { TipoDibujo } from '@/lib/dibujos';

/** Punto candidato de snap (vértices, puntos medios, centros) */
export interface PuntoSnap { lat: number; lng: number }

/** Tipo de geometría que se está dibujando (para preview y medidas en vivo) */
export type TipoActivo = TipoDibujo | 'zona' | 'sector' | 'camino' | 'medir' | null;
export interface SnapSegmento { a: PuntoSnap; b: PuntoSnap }

// ─── CAD interactivo: clicks con snap/ortho + línea elástica + medidas en vivo ─

const SNAP_TOLERANCIA_PX = 12;

export function CadInteractivo({
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
