'use client';

import React from 'react';
import { Marker, Polygon, Polyline, CircleMarker, Circle as LeafCircle } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import {
  distanciaMetros, azimutGrados, areaPoligonoM2, longitudLineaM,
  formatearLongitud, formatearArea,
} from '@/lib/dibujos';
import type { ElementoDibujo, DibujoEnCurso } from '@/lib/dibujos';
import { crearIconoElemento, emojiPxElemento, crearIconoTexto, crearIconoMedida } from './iconos';
import { chaikin } from './smoothing';
import type { CapasVisibles } from '../MapLeaflet';

/**
 * Capa de dibujo libre + sus mangos de edición, extraída del render de MapLeaflet
 * (Fase 1). Reúne los dibujos guardados (switch por tipo) y los cuatro grupos de
 * handles de la shape seleccionada: mover, redimensionar círculo, mover/borrar
 * vértices e insertar vértices. Todo prop-driven; sin cambio de comportamiento.
 */
export function DibujosLayer({
  capas, dibujos, dibujoSelId, modoDibujo, zoomElem,
  onClickDibujo, onMoverDibujo, onMoverVertice, onEliminarVertice,
  onInsertarVertice, onRedimensionarCirculo,
}: {
  capas:        CapasVisibles;
  dibujos:      ElementoDibujo[];
  dibujoSelId?: string | null;
  modoDibujo?:  string | null;
  zoomElem:     number;
  onClickDibujo?:          (id: string) => void;
  onMoverDibujo?:          (id: string, dLat: number, dLng: number) => void;
  onMoverVertice?:         (id: string, idx: number, lat: number, lng: number) => void;
  onEliminarVertice?:      (id: string, idx: number) => void;
  onInsertarVertice?:      (id: string, idxAfter: number, lat: number, lng: number) => void;
  onRedimensionarCirculo?: (id: string, radio: number) => void;
}) {
  return (
    <>
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
          // Lado menor del bbox en metros → tamaño del emoji (un vehículo chico da
          // emoji chico; un cantero grande topa el clamp y queda como rótulo centrado).
          let ladoM = 4;
          if (d.simbolo && d.vertices.length >= 2) {
            const lats = d.vertices.map(v => v.lat), lngs = d.vertices.map(v => v.lng);
            const altoM  = (Math.max(...lats) - Math.min(...lats)) * 111_320;
            const anchoM = (Math.max(...lngs) - Math.min(...lngs)) * 111_320 * Math.cos((cLat * Math.PI) / 180);
            ladoM = Math.max(1, Math.min(altoM, anchoM));
          }
          return (
            <React.Fragment key={d.id}>
              <Polygon
                positions={d.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
                pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: d.opacidad, weight: selW ?? 2, dashArray: selD, interactive: true }}
                eventHandlers={{ click: onClick }}
              />
              {d.simbolo ? (
                <Marker position={[cLat, cLng]} interactive={false}
                  icon={crearIconoElemento(d.simbolo, emojiPxElemento(ladoM, cLat, zoomElem))} />
              ) : capas.medidas && d.vertices.length >= 3 && (
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
            {d.simbolo ? (
              <Marker position={[d.lat, d.lng]} interactive={false}
                icon={crearIconoElemento(d.simbolo, emojiPxElemento(d.radio * 2, d.lat, zoomElem))} />
            ) : capas.medidas && (
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

      {/* ── Mango de redimensión para círculos (arrastrar el borde este) ── */}
      {modoDibujo === 'seleccion' && dibujoSelId && onRedimensionarCirculo && (() => {
        const el = dibujos.find(d => d.id === dibujoSelId);
        if (!el || el.tipo !== 'circulo') return null;
        const dLng = el.radio / (111_320 * Math.cos(el.lat * Math.PI / 180));
        const icon = L.divIcon({
          html: `<div title="Arrastrar para cambiar el tamaño" style="width:14px;height:14px;border-radius:50%;background:white;border:2.5px solid ${el.color};box-shadow:0 1px 4px rgba(0,0,0,0.45);cursor:ew-resize;"></div>`,
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        });
        return (
          <Marker key={`radio-${dibujoSelId}`} position={[el.lat, el.lng + dLng]} icon={icon} draggable zIndexOffset={600}
            eventHandlers={{
              moveend(e) {
                const p = (e.target as L.Marker).getLatLng();
                const r = distanciaMetros(el.lat, el.lng, p.lat, p.lng);
                onRedimensionarCirculo(dibujoSelId, Math.max(0.2, r));
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
    </>
  );
}

/**
 * Preview de la shape que se está dibujando en este momento (línea elástica ya la
 * dibuja CadInteractivo; esto es el trazo acumulado). Se renderiza último en el
 * MapContainer para quedar por encima del resto. Extraído del render (Fase 1).
 */
export function DibujoPreview({ dibujoEnCurso, colorDibujo }: {
  dibujoEnCurso?: DibujoEnCurso | null;
  colorDibujo:    string;
}) {
  if (!dibujoEnCurso || dibujoEnCurso.vertices.length < 2) return null;
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
}
