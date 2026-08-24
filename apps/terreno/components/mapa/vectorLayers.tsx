'use client';

import React, { useEffect, useRef } from 'react';
import { Marker, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import {
  distanciaMetros, areaPoligonoM2, longitudLineaM,
  formatearLongitud, formatearArea, anguloEnVertice,
} from '@/lib/dibujos';
import type { Mojon } from '@/lib/types';
import type { MetricasPoligono } from '@/lib/geometria';
import type { CurvaNivel } from '@/lib/curvasNivel';
import { crearIconoLindero } from './iconos';
import { chaikin } from './smoothing';

/**
 * Capas vectoriales del mapa (react-leaflet). Extraídas de `MapLeaflet` (Fase 1);
 * sin cambio de comportamiento.
 */

// ─── Medición efímera (regla / área) ──────────────────────────────────────────
export function MedicionLayer({ puntos }: { puntos: Array<{ lat: number; lng: number }> }) {
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

// Etiquetas de longitud y rumbo sobre el centroide de cada segmento de lindero
export function LinderoLabels({ mojones, metricas }: { mojones: Mojon[]; metricas: MetricasPoligono }) {
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

// Cotas automáticas: línea de cota acotada (tipo CAD) por cada lindero, offset
// hacia afuera, con líneas de extensión, flechas y etiqueta de longitud rotada.
export function CotasAutoLayer({ mojones, metricas }: { mojones: Mojon[]; metricas: MetricasPoligono }) {
  const COLOR = '#0277BD';
  const n = mojones.length;
  const latC = mojones.reduce((s, m) => s + m.lat, 0) / n;
  const cx = mojones.reduce((s, m) => s + m.lng, 0) / n;
  const cy = latC;
  const mLat = 111320;
  const mLng = 111320 * Math.cos(latC * Math.PI / 180);

  // Offset y tamaño de flecha según el tamaño del predio.
  const off = Math.max(8, Math.min(35, metricas.perimetro_m / 45));
  const arrow = Math.max(3, off * 0.28);

  // Helpers en espacio métrico → devuelven {lat,lng}
  const P = (baseLng: number, baseLat: number, ex: number, ey: number) => ({
    lat: baseLat + ey / mLat,
    lng: baseLng + ex / mLng,
  });
  const rot = (ux: number, uy: number, deg: number): [number, number] => {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [ux * c - uy * s, ux * s + uy * c];
  };

  const elems: React.ReactNode[] = [];

  for (let i = 0; i < n; i++) {
    const A = mojones[i]!, B = mojones[(i + 1) % n]!;
    const ex = (B.lng - A.lng) * mLng, ey = (B.lat - A.lat) * mLat;   // vector métrico
    const len = Math.hypot(ex, ey);
    if (len < 1) continue;
    const ux = ex / len, uy = ey / len;
    // Normal candidata y elección hacia afuera (contraria al centroide)
    let nx = -uy, ny = ux;
    const midLng = (A.lng + B.lng) / 2, midLat = (A.lat + B.lat) / 2;
    const toC = [(cx - midLng) * mLng, (cy - midLat) * mLat];
    if (nx * toC[0]! + ny * toC[1]! > 0) { nx = -nx; ny = -ny; }

    // Puntos de la línea de cota (offset) y extensiones
    const Ao = P(A.lng, A.lat, nx * off, ny * off);
    const Bo = P(B.lng, B.lat, nx * off, ny * off);
    const Ae = P(A.lng, A.lat, nx * off * 1.15, ny * off * 1.15);
    const Be = P(B.lng, B.lat, nx * off * 1.15, ny * off * 1.15);

    // Flechas (V) en cada extremo apuntando hacia adentro de la línea
    const [a1x, a1y] = rot(ux, uy, 155), [a2x, a2y] = rot(ux, uy, -155);
    const [b1x, b1y] = rot(-ux, -uy, 155), [b2x, b2y] = rot(-ux, -uy, -155);
    const Aa1 = P(Ao.lng, Ao.lat, a1x * arrow, a1y * arrow);
    const Aa2 = P(Ao.lng, Ao.lat, a2x * arrow, a2y * arrow);
    const Ba1 = P(Bo.lng, Bo.lat, b1x * arrow, b1y * arrow);
    const Ba2 = P(Bo.lng, Bo.lat, b2x * arrow, b2y * arrow);

    const line = { color: COLOR, weight: 1.5, opacity: 0.95, interactive: false } as const;
    const ext  = { color: COLOR, weight: 1, opacity: 0.6, dashArray: '3 3', interactive: false } as const;
    elems.push(
      <Polyline key={`c${i}`}  positions={[[Ao.lat, Ao.lng], [Bo.lat, Bo.lng]]} pathOptions={line} />,
      <Polyline key={`ea${i}`} positions={[[A.lat, A.lng], [Ae.lat, Ae.lng]]} pathOptions={ext} />,
      <Polyline key={`eb${i}`} positions={[[B.lat, B.lng], [Be.lat, Be.lng]]} pathOptions={ext} />,
      <Polyline key={`aa${i}`} positions={[[Aa1.lat, Aa1.lng], [Ao.lat, Ao.lng], [Aa2.lat, Aa2.lng]]} pathOptions={line} />,
      <Polyline key={`ab${i}`} positions={[[Ba1.lat, Ba1.lng], [Bo.lat, Bo.lng], [Ba2.lat, Ba2.lng]]} pathOptions={line} />,
    );

    // Etiqueta de longitud, rotada para alinearse con el lindero
    let ang = Math.atan2(-(B.lat - A.lat) * mLat, (B.lng - A.lng) * mLng) * 180 / Math.PI;
    if (ang > 90) ang -= 180; else if (ang < -90) ang += 180;
    const lbl = L.divIcon({
      className: '',
      html: `<span style="display:inline-block;transform:rotate(${ang}deg);font-size:10px;font-weight:700;color:${COLOR};font-family:sans-serif;background:rgba(255,255,255,0.9);padding:0 3px;border-radius:2px;white-space:nowrap;">${metricas.linderos[i]!.longitud.toFixed(1)} m</span>`,
      iconSize: [0, 0], iconAnchor: [0, 0],
    });
    elems.push(
      <Marker key={`lb${i}`} position={[(Ao.lat + Bo.lat) / 2, (Ao.lng + Bo.lng) / 2]} icon={lbl} interactive={false} />,
    );
  }

  return <>{elems}</>;
}

// Capa de curvas de nivel (polilíneas continuas suavizadas)
export function CurvasNivelLayer({ curvas, colorNormal = '#E91E63', colorMaestra = '#AD1457' }: {
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

    const etiquetar = (lat: number, lng: number, cota: number, color: string) => {
      const icon = L.divIcon({
        html: `<span style="font-size:8px;font-weight:700;color:${color};font-family:sans-serif;background:rgba(255,255,255,0.9);padding:0 2px;border-radius:2px;white-space:nowrap;box-shadow:0 0 0 0.5px rgba(0,0,0,0.15);">${cota} m</span>`,
        className: '', iconSize: undefined, iconAnchor: [10, 5],
      });
      const mk = L.marker([lat, lng], { icon, interactive: false });
      mk.addTo(map);
      layers.push(mk);
    };

    curvas.forEach((curva, idx) => {
      const esMaestra = pasoMaestra > 0 && curva.cota % pasoMaestra === 0;
      const color  = esMaestra ? colorMaestra : colorNormal;
      const weight = esMaestra ? 2 : 1.1;
      const opacity = esMaestra ? 0.9 : 0.6;

      curva.lineas.forEach(linea => {
        const pts = linea.puntos.map(p => [p.lat, p.lng] as LatLngTuple);
        const suave = chaikin(pts, 2, linea.cerrada);
        const anillo = linea.cerrada ? [...suave, suave[0]!] : suave;
        // Casing (halo claro) debajo: la curva se lee sobre cualquier fondo y en
        // los 3 temas (antes el color plano se perdía en claro/sepia sobre el shader).
        const casing = L.polyline(anillo, {
          color: '#ffffff', weight: weight + 2, opacity: 0.5,
          interactive: false, lineCap: 'round', lineJoin: 'round',
        });
        casing.addTo(map);
        layers.push(casing);
        const pl = L.polyline(anillo, {
          color, weight, opacity, interactive: false, lineCap: 'round', lineJoin: 'round',
        });
        pl.addTo(map);
        layers.push(pl);
      });

      // Etiquetas de cota: más referencias que antes. Las maestras se rotulan en
      // dos puntos espaciados; las normales largas, una de cada dos, en su medio.
      const masLarga = curva.lineas.reduce((best, l) => l.puntos.length > best.puntos.length ? l : best, curva.lineas[0]!);
      if (masLarga && masLarga.puntos.length >= 2) {
        const n = masLarga.puntos.length;
        if (esMaestra) {
          [0.33, 0.66].forEach(f => { const p = masLarga.puntos[Math.floor(n * f)]!; etiquetar(p.lat, p.lng, curva.cota, color); });
        } else if (idx % 2 === 0 && n >= 24) {
          const p = masLarga.puntos[Math.floor(n / 2)]!;
          etiquetar(p.lat, p.lng, curva.cota, color);
        }
      }
    });

    return () => { layers.forEach(l => map.removeLayer(l)); };
  }, [map, curvas, colorNormal, colorMaestra]);

  return null;
}

// ─── Terrarium elevation tile layer ──────────────────────────────────────────

export function TerrariumLayer({ elevMin, elevMax, onRangoDetectado }: {
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
