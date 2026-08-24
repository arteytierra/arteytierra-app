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
  useMap,
} from 'react-leaflet';
import type { LatLngExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Parchea L.Map para soportar rotación. Debe importarse después de Leaflet.
import 'leaflet-rotate';
import type { Mojon } from '@/lib/types';
import { CATEGORIAS_ZONA } from '@/lib/zonificacion';
import type { Zona } from '@/lib/zonificacion';
import { TIPOS_SECTOR } from '@/lib/sectores';
import type { Sector } from '@/lib/sectores';
import type { PotrerosLayout } from '@/lib/potreros';
import type { Pin } from '@/lib/pines';
import type { Camino } from '@/lib/caminos';
import type { DatosShader } from '@/lib/shaders';
import type { ResultadoSombras } from '@/lib/sombras';
import type { ResultadoInsolacion } from '@/lib/insolacion';
import type { ObjetoSombra } from '@/lib/objetosSombra';
import type { ResultadoViewshed } from '@/lib/viewshed';
import type { DatosEscorrentia } from '@/lib/escorrentias';
import type { DatosErosion } from '@/lib/erosion';
import type { ResultadoSwales } from '@/lib/swales';
import type { ResultadoCortafuegos } from '@/lib/cortafuegos';
import type { CortinaResultado } from '@/lib/cortinas';
import type { ResultadoSilvo } from '@/lib/silvopastura';
import type { ElementoDibujo, DibujoEnCurso, TipoDibujo } from '@/lib/dibujos';
import { formatearArea } from '@/lib/dibujos';
import type { ElementoAguada } from '@/lib/aguadas';
import type { DatosArcoSolar } from '@/lib/arco_solar';
import type { MetricasPoligono } from '@/lib/geometria';
import type { CurvaNivel } from '@/lib/curvasNivel';
import { TIPOS_ITEM, type ElementoMasterPlan } from '@/lib/masterplan';
import { crearIconoMojon, crearIconoPin } from './mapa/iconos';
import {
  ShaderCanvasLayer, ErosionCanvasLayer, SombrasCanvasLayer,
  InsolacionCanvasLayer, ViewshedCanvasLayer,
} from './mapa/canvasLayers';
import {
  RotarConBotonCentral, NavegacionExposer, FlyToExposer, MapMouseTracker,
  InvalidarSize, MapChangeWatcher, BoundsExposer, AutoFit,
} from './mapa/exposers';
import type { NavegacionMapa } from './mapa/exposers';
export type { NavegacionMapa } from './mapa/exposers';
import {
  MedicionLayer, LinderoLabels, CotasAutoLayer, CurvasNivelLayer, TerrariumLayer,
  ArcoSolarLayer,
} from './mapa/vectorLayers';
import { CadInteractivo } from './mapa/cad';
import { DibujosLayer, DibujoPreview } from './mapa/dibujosLayer';
import { AguadasLayer } from './mapa/aguadasLayer';
import type { PuntoSnap, SnapSegmento, TipoActivo } from './mapa/cad';
export type { PuntoSnap, SnapSegmento, TipoActivo } from './mapa/cad';

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
  erosion:        boolean;
  swales:         boolean;
  cortinas:       boolean;
  cortafuegos:    boolean;
  silvopastura:   boolean;
  sugerencias:    boolean;
  analisisPredio: boolean;
  aguadas:        boolean;
  dibujos:        boolean;
  arcSolar:       boolean;
  linderoLabels:  boolean;
  curvasNivel:    boolean;
  cotas:          boolean;
  cotasAuto:      boolean;
  medidas:        boolean;
}

export interface OverlayImagen {
  url: string;
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
  opacidad: number;
}

// ─── Iconos y cachés → mapa/iconos.ts · AutoFit + exposers → mapa/exposers.tsx (Fase 1) ─

// ─── CAD interactivo (snap/ortho + preview + medidas) → components/mapa/cad.tsx (Fase 1) ─
// CadInteractivo + tipos PuntoSnap · SnapSegmento · TipoActivo (re-exportados arriba)

// ─── Capas vectoriales → components/mapa/vectorLayers.tsx (Fase 1) ───────────
// MedicionLayer · LinderoLabels · CotasAutoLayer · CurvasNivelLayer · TerrariumLayer
// Dibujo libre (DibujosLayer + DibujoPreview) → mapa/dibujosLayer.tsx · Aguadas → mapa/aguadasLayer.tsx
// El helper chaikin → components/mapa/smoothing.ts (lo usan vectorLayers y dibujosLayer)

// ─── Exposers de mapa → components/mapa/exposers.tsx (Fase 1) ────────────────
// RotarConBotonCentral · NavegacionExposer · FlyToExposer · MapMouseTracker ·
// InvalidarSize · MapChangeWatcher · BoundsExposer · interface NavegacionMapa

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
  /** Zoom máximo con imagen satelital real en esta zona (lo mide /api/zoom-satelital). */
  zoomSatelital?:     number;
  sombras?:           ResultadoSombras | null;
  /** Objetos con altura, para dibujarlos sobre el mapa. */
  sombrasObjetos?:    ObjetoSombra[];
  insolacion?:        ResultadoInsolacion | null;
  viewshed?:          ResultadoViewshed | null;
  datosEscorrentia?:  DatosEscorrentia | null;
  datosErosion?:      DatosErosion | null;
  swales?:            ResultadoSwales | null;
  cortafuegos?:       ResultadoCortafuegos | null;
  cortina?:           CortinaResultado | null;
  silvopastura?:      ResultadoSilvo | null;
  cuencaPoligono?:    Array<{ lat: number; lng: number }> | null;
  cuencaOutlet?:      { lat: number; lng: number } | null;
  muroLinea?:         Array<{ lat: number; lng: number }> | null;
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
  onRedimensionarCirculo?: (id: string, radio: number) => void;
  onMoverPin?:        (id: string, lat: number, lng: number) => void;
  // ── Bounds para topografía del área visible ──
  onGetBounds?:       (fn: () => { latMin: number; latMax: number; lngMin: number; lngMax: number }) => void;
  // ── Zoom/centro para escala gráfica ──
  onMapChange?:       (zoom: number, lat: number) => void;
  // ── Fly-to programático (zoom opcional para búsqueda de localidad) ──
  onGetFlyTo?:        (fn: (lat: number, lng: number, zoom?: number) => void) => void;
  /** Marcador temporal del resultado de búsqueda (no es parte del proyecto). */
  marcadorBusqueda?:  { lat: number; lng: number; label: string } | null;
  zona0?:             { lat: number; lng: number } | null;
  acceso?:            { lat: number; lng: number } | null;
  // ── Navegación unificada (el panel vive en MapaTerrenoApp) ──
  onGetNavegacion?:   (api: NavegacionMapa) => void;
  onBearing?:         (grados: number) => void;
  /** Capa de fondo. La controla el panel de navegación. */
  capaFondo?:         Capa;
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
  /** Cualquier valor que cambie al reajustarse el layout (colapso de paneles) → invalidateSize. */
  layoutSignal?:      string | number;
  // ── Overlay de imagen (plano de referencia) ──
  overlay?:           OverlayImagen | null;
  onOverlayEsquina?:  (esquina: 'sw' | 'ne' | 'centro', lat: number, lng: number) => void;
  // ── Master Plan ──
  masterPlan?:        ElementoMasterPlan[] | null;
  masterPlanCaminos?: Array<{ vertices: Array<{ lat: number; lng: number }> }>;
  // ── Perfil de elevación: punto sincronizado con el cursor del panel de perfil ──
  perfilPunto?:       { lat: number; lng: number } | null;
}

// Vista de arranque: mundo centrado en el Atlántico (Américas ↔ África/Europa).
// Invita a buscar la localidad desde el panel Lugar en vez de aterrizar en un
// país concreto.
const CENTRO_INICIAL: LatLngExpression = [15, -30];
const ZOOM_INICIAL = 3;

const CAPAS_DEFAULT: CapasVisibles = { terreno: true, zonas: true, sectores: true, pines: true, caminos: true, shaderElev: false, shaderPend: false, terrariumElev: false, escorrentias: false, erosion: false, swales: true, cortinas: true, cortafuegos: true, silvopastura: true, sugerencias: false, analisisPredio: true, aguadas: true, dibujos: true, arcSolar: false, linderoLabels: false, curvasNivel: false, cotas: true, cotasAuto: false, medidas: true };

function MapLeaflet({
  mojones, seleccionado, onClickMapa, onSeleccionar,
  zonas = [], zonaEnDibujado = null,
  sectores = [], sectorEnDibujado = null,
  pines = [], onEditarPin,
  caminos = [], caminoEnDibujado = null, perfilPunto = null,
  dibujando = false,
  datosShader = null,
  // 18 es lo que hay en zona rural; se ajusta apenas responde /api/zoom-satelital.
  zoomSatelital = 18,
  sombras = null,
  sombrasObjetos = [],
  insolacion = null,
  viewshed = null,
  datosEscorrentia = null,
  datosErosion = null,
  swales = null,
  cortafuegos = null,
  cortina = null,
  silvopastura = null,
  cuencaPoligono = null,
  cuencaOutlet = null,
  muroLinea = null,
  potrerosLayer = null,
  capas = CAPAS_DEFAULT,
  onGetNavegacion,
  onBearing,
  capaFondo = 'satelite',
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
  onRedimensionarCirculo,
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
  layoutSignal,
  overlay = null,
  onOverlayEsquina,
  masterPlan = null,
  masterPlanCaminos = [],
  marcadorBusqueda = null,
  zona0 = null,
  acceso = null,
}: Props) {
  const positions: LatLngExpression[] = mojones.map(m => [m.lat, m.lng]);
  // Zoom local (solo para dimensionar los emojis de elementos a escala). El paneo
  // no rerenderiza: MapChangeWatcher reporta el mismo zoom y React descarta el set.
  const [zoomElem, setZoomElem] = useState(ZOOM_INICIAL);

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
        // Rotación (leaflet-rotate). El giro lo maneja RotarConBotonCentral;
        // apagamos shiftKeyRotate porque Shift + central es nuestro paneo.
        rotate
        rotateControl={false}
        shiftKeyRotate={false}
        touchRotate
      >
        {/* Zoom, brújula y capa de fondo viven en ControlesMapa (arriba a la
            derecha, junto a Histórico/3D/Capas). Acá sólo va el puente. */}
        <NavegacionExposer onReady={onGetNavegacion} onBearing={onBearing} />
        {/* ── Tiles ── */}
        {capaFondo === 'satelite' ? (
          <>
            {/* Más allá de `maxNativeZoom` Esri no devuelve 404 sino una tesela que
                dice "Map data not yet available". La cobertura varía por zona (18 en
                el campo, 20 en una ciudad), así que la mide /api/zoom-satelital y
                Leaflet escala la última tesela real en vez de pedir el cartel. */}
            <TileLayer
              key={`sat-${zoomSatelital}`}
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
              maxNativeZoom={zoomSatelital}
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
        <RotarConBotonCentral />
        {onCursorMove && <MapMouseTracker onMove={onCursorMove} />}
        <InvalidarSize trigger={`${capturaMode}|${layoutSignal ?? ''}`} />
        {onGetBounds  && <BoundsExposer  onReady={onGetBounds} />}
        {onMapChange  && <MapChangeWatcher onMapChange={onMapChange} />}
        <MapChangeWatcher onMapChange={(z) => setZoomElem(z)} />
        {onGetFlyTo   && <FlyToExposer    onReady={onGetFlyTo} />}
        {capas.terrariumElev && <TerrariumLayer elevMin={elevMin} elevMax={elevMax} onRangoDetectado={onRangoTerrarium} />}
        {capas.linderoLabels && metricas && mojones.length >= 3 && <LinderoLabels mojones={mojones} metricas={metricas} />}
        {capas.cotasAuto && metricas && mojones.length >= 3 && <CotasAutoLayer mojones={mojones} metricas={metricas} />}
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
        {capas.erosion && datosErosion && datosErosion.celdas.length > 0 && (
          <ErosionCanvasLayer celdas={datosErosion.celdas} />
        )}
        {/* ── Swales (zanjas de infiltración a nivel) ── */}
        {capas.swales && swales?.swales.map((sw, i) => (
          <Polyline key={`sw-${i}`}
            positions={sw.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#00838F', weight: 3, opacity: 0.9, lineCap: 'round', lineJoin: 'round', interactive: false }}
          />
        ))}
        {/* ── Cortafuegos (fajas sobre crestas) ── */}
        {capas.cortafuegos && cortafuegos?.lineas.map((cf, i) => (
          <Polyline key={`cf-${i}`}
            positions={cf.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#E65100', weight: 6, opacity: 0.55, lineCap: 'round', lineJoin: 'round', interactive: false }}
          />
        ))}
        {/* ── Cortina rompevientos: zona protegida (tenue) + banda de plantación ── */}
        {capas.cortinas && cortina && (
          <React.Fragment>
            {cortina.zonaProtegida.length >= 3 && (
              <Polygon positions={cortina.zonaProtegida.map(p => [p.lat, p.lng] as LatLngTuple)}
                pathOptions={{ color: '#66BB6A', weight: 1, dashArray: '4 4', fillColor: '#66BB6A', fillOpacity: 0.12, interactive: false }} />
            )}
            {cortina.banda.length >= 3 && (
              <Polygon positions={cortina.banda.map(p => [p.lat, p.lng] as LatLngTuple)}
                pathOptions={{ color: '#1B5E20', weight: 1.5, fillColor: '#2E7D32', fillOpacity: 0.55, interactive: false }} />
            )}
          </React.Fragment>
        )}
        {/* ── Silvopastura (hileras a nivel + árboles) ── */}
        {capas.silvopastura && silvopastura?.hileras.map((h, i) => (
          <React.Fragment key={`sv-${i}`}>
            <Polyline
              positions={h.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
              pathOptions={{ color: '#2E7D32', weight: 1.5, opacity: 0.7, dashArray: '2 4', interactive: false }}
            />
            {h.arboles.map((a, j) => (
              <CircleMarker key={`sv-${i}-${j}`} center={[a.lat, a.lng]} radius={3}
                pathOptions={{ color: '#1B5E20', weight: 1, fillColor: '#43A047', fillOpacity: 0.9, interactive: false }} />
            ))}
          </React.Fragment>
        ))}
        {insolacion && insolacion.celdas.length > 0 && (
          <InsolacionCanvasLayer celdas={insolacion.celdas} max={insolacion.max} />
        )}
        {sombras && sombras.celdas.length > 0 && (
          <SombrasCanvasLayer celdas={sombras.celdas} />
        )}
        {/* Sombras de árboles y construcciones: polígonos, no raster (ver lib/objetosSombra) */}
        {sombras?.sombras_objetos.map(s => (
          <Polygon key={`so-${s.id}`} positions={s.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
            pathOptions={{ color: '#0A0F1E', weight: 0, fillColor: '#0A0F1E', fillOpacity: 0.42, interactive: false }} />
        ))}
        {/* Los objetos en sí: copa del árbol / planta del volumen */}
        {sombrasObjetos?.map(o => (o.tipo === 'arbol'
          ? <LeafCircle key={`ob-${o.id}`} center={[o.lat, o.lng]} radius={o.radio_m}
              pathOptions={{ color: '#2E7D32', weight: 1.5, fillColor: '#43A047', fillOpacity: 0.55, interactive: false }} />
          : <Polygon key={`ob-${o.id}`} positions={o.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
              pathOptions={{ color: '#8D6E63', weight: 1.5, fillColor: '#A1887F', fillOpacity: 0.35, interactive: false }} />
        ))}
        {viewshed && viewshed.celdas.length > 0 && (
          <ViewshedCanvasLayer celdas={viewshed.celdas} />
        )}
        {viewshed && (
          <CircleMarker center={[viewshed.origen.lat, viewshed.origen.lng]} radius={6}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#1B5E20', fillOpacity: 1 }} />
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
        {muroLinea && muroLinea.length === 2 && (
          <Polyline
            positions={muroLinea.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#6D4C41', weight: 5, opacity: 0.9, interactive: false }}
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

        {/* ── Terreno (polígono de mojones) ── */}
        {capas.terreno && mojones.length >= 3 && (
          <Polygon
            positions={positions}
            pathOptions={{
              fillColor: '#3A5A40', fillOpacity: capaFondo === 'topo' ? 0.10 : 0.18,
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

        {/* ── Marcador temporal de búsqueda de localidad ── */}
        {marcadorBusqueda && (
          <Marker
            position={[marcadorBusqueda.lat, marcadorBusqueda.lng]}
            interactive={false}
            zIndexOffset={1200}
            icon={L.divIcon({
              className: '',
              iconAnchor: [11, 28],
              html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
                <div style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#D9A441;color:#3a2e12;font:600 10px/1.2 system-ui;padding:2px 7px;border-radius:9px;box-shadow:0 1px 4px rgba(0,0,0,.3);margin-bottom:3px">${marcadorBusqueda.label.replace(/</g, '&lt;')}</div>
                <svg width="22" height="28" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg"><path d="M11 0C5 0 0 4.7 0 10.6 0 18 11 28 11 28s11-10 11-17.4C22 4.7 17 0 11 0z" fill="#D9A441" stroke="#fff" stroke-width="1.5"/><circle cx="11" cy="10.5" r="3.6" fill="#fff"/></svg>
              </div>`,
            })}
          />
        )}

        {/* ── Zona 0: casa / edificio principal (referencia del master plan) ── */}
        {zona0 && (
          <Marker
            position={[zona0.lat, zona0.lng]}
            interactive={false}
            zIndexOffset={1100}
            icon={L.divIcon({
              className: '',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:rgba(46,125,50,.9);border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.5);color:#fff;font:700 13px/1 system-ui">🏠</div>
                <div style="position:absolute;top:-8px;left:22px;background:#2E7D32;color:#fff;font:700 8px/1 system-ui;padding:2px 4px;border-radius:5px;box-shadow:0 1px 3px rgba(0,0,0,.4)">0</div>`,
            })}
          />
        )}

        {/* ── Punto de acceso al terreno (arranque de los caminos del plan) ── */}
        {acceso && (
          <Marker
            position={[acceso.lat, acceso.lng]}
            interactive={false}
            zIndexOffset={1090}
            icon={L.divIcon({
              className: '',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:rgba(109,76,65,.9);border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.5);color:#fff;font:700 13px/1 system-ui">🚪</div>`,
            })}
          />
        )}

        {/* ── Master Plan: caminos conectores (red que interconecta todo) ── */}
        {capas.sugerencias && masterPlanCaminos.map((c, i) => c.vertices.length >= 2 && (
          <Polyline key={`mpc-${i}`}
            positions={c.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
            pathOptions={{ color: '#6D4C41', weight: 2.5, dashArray: '6 5', opacity: 0.8, interactive: false }}
          />
        ))}

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

        {/* ── Dibujos guardados + mangos de edición → components/mapa/dibujosLayer.tsx (Fase 1) ── */}
        <DibujosLayer
          capas={capas} dibujos={dibujos} dibujoSelId={dibujoSelId} modoDibujo={modoDibujo} zoomElem={zoomElem}
          onClickDibujo={onClickDibujo} onMoverDibujo={onMoverDibujo} onMoverVertice={onMoverVertice}
          onEliminarVertice={onEliminarVertice} onInsertarVertice={onInsertarVertice}
          onRedimensionarCirculo={onRedimensionarCirculo}
        />

        {/* ── Aguadas layer → components/mapa/aguadasLayer.tsx (Fase 1) ── */}
        <AguadasLayer capas={capas} aguadasLayer={aguadasLayer} />

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

        {/* ── Dibujo en construcción (preview) → components/mapa/dibujosLayer.tsx (Fase 1) ── */}
        <DibujoPreview dibujoEnCurso={dibujoEnCurso} colorDibujo={colorDibujo} />
      </MapContainer>
    </div>
  );
}

export default React.memo(MapLeaflet);

// ─── Capas movidas a components/mapa/ (Fase 1) ───────────────────────────────
// ArcoSolarLayer → vectorLayers.tsx · Shader/Erosion/Sombras/Insolacion/Viewshed
// → canvasLayers.tsx
