'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Rectangle,
  Circle as LeafCircle,
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
import type { Pin } from '@/lib/pines';
import type { Camino } from '@/lib/caminos';
import type { DatosShader } from '@/lib/shaders';
import { colorElevacion, colorPendiente } from '@/lib/shaders';
import type { DatosEscorrentia } from '@/lib/escorrentias';
import type { ResultadoSugerencias } from '@/lib/sugerencias';
import type { ElementoDibujo, DibujoEnCurso, TipoDibujo } from '@/lib/dibujos';
import { distanciaMetros } from '@/lib/dibujos';
import type { ElementoAguada } from '@/lib/aguadas';

type Capa = 'satelite' | 'topo';

export interface CapasVisibles {
  terreno:       boolean;
  zonas:         boolean;
  sectores:      boolean;
  pines:         boolean;
  caminos:       boolean;
  shaderElev:    boolean;
  shaderPend:    boolean;
  terrariumElev: boolean;
  escorrentias:  boolean;
  sugerencias:   boolean;
  aguadas:       boolean;
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

function crearIconoMojon(numero: number, seleccionado: boolean): L.DivIcon {
  const bg = seleccionado ? '#D9A441' : '#3A5A40';
  const fg = seleccionado ? '#0F1410' : '#FBF8F3';
  const size = seleccionado ? 34 : 30;
  const half = size / 2;
  return L.divIcon({
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
}

function crearIconoPin(pin: Pin): L.DivIcon {
  return L.divIcon({
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
}

function crearIconoSugerencia(tipo: 'vivienda' | 'reservorio', rank: number, score: number): L.DivIcon {
  const emoji = tipo === 'vivienda' ? '🏠' : '💧';
  const bg    = score >= 68 ? '#2E7D32' : score >= 45 ? '#E65100' : '#B71C1C';
  const size  = rank === 0 ? 40 : rank === 1 ? 34 : 28;
  const fs    = rank === 0 ? 20 : rank === 1 ? 16 : 13;
  return L.divIcon({
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

function ClickHandler({ onClickMapa, modoDibujo }: {
  onClickMapa:  (lat: number, lng: number) => void;
  modoDibujo?:  string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (modoDibujo && modoDibujo !== 'seleccion') map.doubleClickZoom.disable();
    else map.doubleClickZoom.enable();
  }, [map, modoDibujo]);
  useMapEvents({ click(e) { onClickMapa(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// Chaikin curve smoothing (3 iterations)
function chaikin(pts: LatLngTuple[]): LatLngTuple[] {
  if (pts.length < 2) return pts;
  let cur = pts;
  for (let n = 0; n < 3; n++) {
    const next: LatLngTuple[] = [];
    for (let i = 0; i < cur.length - 1; i++) {
      const [a0, a1] = cur[i]!;
      const [b0, b1] = cur[i + 1]!;
      next.push([0.75 * a0 + 0.25 * b0, 0.75 * a1 + 0.25 * b1]);
      next.push([0.25 * a0 + 0.75 * b0, 0.25 * a1 + 0.75 * b1]);
    }
    next.push(cur[cur.length - 1]!);
    cur = next;
  }
  return cur;
}

function crearIconoAguada(tipo: 'represa' | 'swale' | 'keyline', nombre: string): L.DivIcon {
  const emoji = tipo === 'represa' ? '🏊' : tipo === 'swale' ? '⛏️' : '〰️';
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
      <div style="width:28px;height:28px;border-radius:50%;background:#1E88E5;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">${emoji}</div>
      <div style="background:rgba(30,136,229,0.88);color:#fff;font-size:9px;font-weight:600;font-family:sans-serif;padding:1px 5px;border-radius:3px;white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${nombre}</div>
    </div>`,
    className: '',
    iconSize: [28, 50],
    iconAnchor: [14, 28],
  });
}

function crearIconoTexto(texto: string, color: string, tamano: number, sel: boolean): L.DivIcon {
  return L.divIcon({
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
}

// ─── Terrarium elevation tile layer ──────────────────────────────────────────

function TerrariumLayer({ elevMin, elevMax }: { elevMin: number; elevMax: number }) {
  const map = useMap();
  useEffect(() => {
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
              const [cr, cg, cb] = ramp((elev - elevMin) / range);
              px[i] = cr; px[i + 1] = cg; px[i + 2] = cb; px[i + 3] = 190;
            }
            ctx.putImageData(id, 0, 0);
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

// ─── Props ────────────────────────────────────────────────────────────────────

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
  capas?:             CapasVisibles;
  // ── Dibujo libre ──
  dibujos?:           ElementoDibujo[];
  dibujoEnCurso?:     DibujoEnCurso | null;
  dibujoSelId?:       string | null;
  onClickDibujo?:     (id: string) => void;
  onMoverDibujo?:     (id: string, dLat: number, dLng: number) => void;
  modoDibujo?:        TipoDibujo | 'seleccion' | null;
  colorDibujo?:       string;
  // ── Terrarium ──
  elevMin?:           number;
  elevMax?:           number;
  // ── Aguadas layer ──
  aguadasLayer?:      ElementoAguada[];
  // ── Vertex / pin editing ──
  onMoverVertice?:    (id: string, idx: number, lat: number, lng: number) => void;
  onMoverPin?:        (id: string, lat: number, lng: number) => void;
}

const CENTRO_INICIAL: LatLngExpression = [-30.8, -64.7];
const ZOOM_INICIAL = 7;

const CAPAS_DEFAULT: CapasVisibles = { terreno: true, zonas: true, sectores: true, pines: true, caminos: true, shaderElev: false, shaderPend: false, terrariumElev: false, escorrentias: false, sugerencias: false, aguadas: true };

export default function MapLeaflet({
  mojones, seleccionado, onClickMapa, onSeleccionar,
  zonas = [], zonaEnDibujado = null,
  sectores = [], sectorEnDibujado = null,
  pines = [], onEditarPin,
  caminos = [], caminoEnDibujado = null,
  dibujando = false,
  datosShader = null,
  datosEscorrentia = null,
  datosSugerencias = null,
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
  aguadasLayer = [],
  onMoverVertice,
  onMoverPin,
}: Props) {
  const [capa, setCapa] = useState<Capa>('satelite');
  const positions: LatLngExpression[] = mojones.map(m => [m.lat, m.lng]);

  const cursorClass = modoDibujo && modoDibujo !== 'seleccion'
    ? 'cursor-crosshair'
    : modoDibujo === 'seleccion'
    ? 'cursor-pointer'
    : '';

  return (
    <div className={`relative h-full w-full ${cursorClass}`} id="mapa-captura">
      <MapContainer
        center={CENTRO_INICIAL}
        zoom={ZOOM_INICIAL}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        {/* ── Tiles ── */}
        {capa === 'satelite' ? (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
              maxZoom={20}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
              opacity={0.75}
            />
          </>
        ) : (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
            maxZoom={17}
          />
        )}

        <ClickHandler onClickMapa={onClickMapa} modoDibujo={modoDibujo} />
        <AutoFit mojones={mojones} />
        <MiddleMousePan />
        {capas.terrariumElev && <TerrariumLayer elevMin={elevMin} elevMax={elevMax} />}

        {/* ── Shader topográfico ── */}
        {datosShader && capas.shaderElev && datosShader.celdas.map((c, i) => (
          <Rectangle
            key={`se-${i}`}
            bounds={[[c.latMin, c.lngMin], [c.latMax, c.lngMax]] as [[number,number],[number,number]]}
            pathOptions={{ fillColor: colorElevacion(c.elevation, datosShader.elev_min, datosShader.elev_max), fillOpacity: 0.65, stroke: false, interactive: false }}
          />
        ))}
        {datosShader && capas.shaderPend && datosShader.celdas.map((c, i) => (
          <Rectangle
            key={`sp-${i}`}
            bounds={[[c.latMin, c.lngMin], [c.latMax, c.lngMax]] as [[number,number],[number,number]]}
            pathOptions={{ fillColor: colorPendiente(c.pendiente_pct, datosShader.pend_max), fillOpacity: 0.65, stroke: false, interactive: false }}
          />
        ))}

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
        {dibujos.map(d => {
          const sel  = dibujoSelId === d.id;
          const selW = sel ? 4 : undefined;
          const selD = sel ? '8 4' : undefined;
          const onClick = () => modoDibujo === 'seleccion' && onClickDibujo?.(d.id);

          if (d.tipo === 'linea') return (
            <Polyline key={d.id}
              positions={d.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
              pathOptions={{ color: d.color, weight: selW ?? d.grosor, dashArray: selD, opacity: 1, interactive: true }}
              eventHandlers={{ click: onClick }}
            />
          );
          if (d.tipo === 'curva') {
            const smooth = chaikin(d.vertices.map(v => [v.lat, v.lng] as LatLngTuple));
            return (
              <Polyline key={d.id}
                positions={smooth}
                pathOptions={{ color: d.color, weight: selW ?? d.grosor, dashArray: selD, opacity: 1, interactive: true }}
                eventHandlers={{ click: onClick }}
              />
            );
          }
          if (d.tipo === 'poligono') return (
            <Polygon key={d.id}
              positions={d.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
              pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: d.opacidad, weight: selW ?? 2, dashArray: selD, interactive: true }}
              eventHandlers={{ click: onClick }}
            />
          );
          if (d.tipo === 'circulo') return (
            <LeafCircle key={d.id}
              center={[d.lat, d.lng]}
              radius={d.radio}
              pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: d.opacidad, weight: selW ?? 2, dashArray: selD, interactive: true }}
              eventHandlers={{ click: onClick }}
            />
          );
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
          return null;
        })}

        {/* ── Mango de arrastre para shape seleccionada ── */}
        {modoDibujo === 'seleccion' && dibujoSelId && (() => {
          const el = dibujos.find(d => d.id === dibujoSelId);
          if (!el || el.tipo === 'texto') return null;
          let lat: number, lng: number;
          if (el.tipo === 'circulo') { lat = el.lat; lng = el.lng; }
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

        {/* ── Vertex handles para shape seleccionada ── */}
        {modoDibujo === 'seleccion' && dibujoSelId && (() => {
          const el = dibujos.find(d => d.id === dibujoSelId);
          if (!el || el.tipo === 'texto' || el.tipo === 'circulo') return null;
          return el.vertices.map((v, idx) => {
            const vIcon = L.divIcon({
              html: `<div style="width:12px;height:12px;border-radius:50%;background:white;border:2px solid ${el.color};box-shadow:0 1px 4px rgba(0,0,0,0.45);cursor:move;"></div>`,
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
                }}
              />
            );
          });
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

      {/* Toggle de capa de fondo */}
      <div className="absolute top-3 right-12 z-[1000] flex rounded-lg overflow-hidden shadow-md border border-white/30">
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
