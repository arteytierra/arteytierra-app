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

type Capa = 'satelite' | 'topo';

export interface CapasVisibles {
  terreno:      boolean;
  zonas:        boolean;
  sectores:     boolean;
  pines:        boolean;
  caminos:      boolean;
  shaderElev:   boolean;
  shaderPend:   boolean;
  escorrentias: boolean;
  sugerencias:  boolean;
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
  modoDibujo?:        TipoDibujo | 'seleccion' | null;
  colorDibujo?:       string;
}

const CENTRO_INICIAL: LatLngExpression = [-30.8, -64.7];
const ZOOM_INICIAL = 7;

const CAPAS_DEFAULT: CapasVisibles = { terreno: true, zonas: true, sectores: true, pines: true, caminos: true, shaderElev: false, shaderPend: false, escorrentias: false, sugerencias: false };

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
  modoDibujo = null,
  colorDibujo = '#EF4444',
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
            eventHandlers={{ click: () => !dibujando && onEditarPin?.(p.id) }}
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
              eventHandlers={{ click: onClick }}
            />
          );
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
