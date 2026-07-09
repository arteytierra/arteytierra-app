'use client';

/**
 * Vista 3D (D3) — relieve navegable con MapLibre GL.
 * Imagen satelital Esri drapeada sobre el terreno (raster-dem con los tiles
 * Terrarium de /api/terrarium, codificación 'terrarium') + el polígono del predio.
 * Se monta en un modal a pantalla completa y se carga de forma perezosa
 * (dynamic import desde MapaTerrenoApp) para no pesar en el bundle principal.
 */
import { useEffect, useRef, useState } from 'react';
import { X, Loader2, Mountain } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones: Mojon[];
  onClose: () => void;
}

export function Vista3D({ mojones, onClose }: Props) {
  const contRef = useRef<HTMLDivElement>(null);
  const mapRef  = useRef<maplibregl.Map | null>(null);
  const [exag, setExag]         = useState(1.6);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!contRef.current || mojones.length < 3) return;
    let cancelado = false;

    const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];

    const map = new maplibregl.Map({
      container: contRef.current,
      style: {
        version: 8,
        sources: {
          sat: {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Esri World Imagery',
          },
          dem: {
            type: 'raster-dem',
            tiles: [`${window.location.origin}/api/terrarium?z={z}&x={x}&y={y}`],
            tileSize: 256,
            encoding: 'terrarium',
            maxzoom: 14,
          },
        },
        layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
        terrain: { source: 'dem', exaggeration: 1.6 },
        sky: { 'sky-color': '#7db4e6', 'horizon-color': '#e8dcc0', 'fog-color': '#d8d0c0', 'sky-horizon-blend': 0.6 } as unknown as maplibregl.SkySpecification,
      },
      bounds,
      fitBoundsOptions: { padding: 80 },
      pitch: 62,
      bearing: -15,
      maxPitch: 82,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

    // El modal puede terminar de dimensionarse después de crear el mapa:
    // forzamos resize para que el canvas ocupe toda la pantalla.
    const forzarResize = () => { try { map.resize(); } catch { /* aún no listo */ } };
    const ro = new ResizeObserver(forzarResize);
    if (contRef.current) ro.observe(contRef.current);
    const t1 = setTimeout(forzarResize, 150);
    const t2 = setTimeout(forzarResize, 600);

    map.on('load', () => {
      if (cancelado) return;
      forzarResize();
      const ring = mojones.map(m => [m.lng, m.lat] as [number, number]);
      ring.push(ring[0]!);
      map.addSource('predio', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } } });
      map.addLayer({ id: 'predio-fill', type: 'fill', source: 'predio', paint: { 'fill-color': '#D9A441', 'fill-opacity': 0.22 } });
      map.addLayer({ id: 'predio-line', type: 'line', source: 'predio', paint: { 'line-color': '#D9A441', 'line-width': 3 } });
      // Reencuadrar al predio ya con el canvas a tamaño completo.
      map.fitBounds(bounds, { padding: 80, pitch: 62, bearing: -15, duration: 0 });
      setCargando(false);
    });
    map.on('error', () => { /* errores de tiles no son fatales */ });

    // Si en 12 s no cargó (sin señal, etc.), sacamos el spinner igual.
    const t = setTimeout(() => { if (!cancelado) setCargando(false); }, 12_000);

    return () => { cancelado = true; clearTimeout(t); clearTimeout(t1); clearTimeout(t2); ro.disconnect(); map.remove(); mapRef.current = null; };
  }, [mojones]);

  // Exageración vertical en vivo
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getSource('dem')) {
      try { map.setTerrain({ source: 'dem', exaggeration: exag }); } catch { /* aún no listo */ }
    }
  }, [exag]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[10000] bg-ink-900">
      {/* Estilo inline: MapLibre agrega `.maplibregl-map{position:relative}` al
          contenedor y pisaría un `absolute inset-0` de clase → el div colapsaría
          a altura 0. Con estilo inline forzamos que ocupe toda la pantalla. */}
      <div ref={contRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      {cargando && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/70 pointer-events-none">
          <div className="flex items-center gap-2 text-bone-50 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando relieve 3D…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-bone-50 text-sm bg-clay-700 rounded-xl px-4 py-2">{error}</p>
        </div>
      )}

      {/* Barra superior */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-ink-900/80 backdrop-blur rounded-full px-4 py-2 border border-bone-50/15">
        <span className="text-bone-50 text-xs font-medium flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" />Vista 3D</span>
        <span className="text-bone-50/40 text-xs">·</span>
        <label className="text-bone-50/80 text-[11px] flex items-center gap-2">
          Relieve
          <input type="range" min={1} max={4} step={0.1} value={exag}
            onChange={e => setExag(parseFloat(e.target.value))}
            className="w-24 accent-sun-400" />
          <span className="font-mono w-7">{exag.toFixed(1)}×</span>
        </label>
      </div>

      {/* Cerrar */}
      <button onClick={onClose}
        className="absolute top-3 right-3 flex items-center gap-1.5 bg-ink-900/80 hover:bg-ink-900 text-bone-50 text-xs font-medium rounded-full px-3 py-2 border border-bone-50/15 transition-colors">
        <X className="w-4 h-4" /> Cerrar
      </button>

      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-bone-50/45 text-[10px] text-center">
        Arrastrá para girar · Ctrl/⌘ + arrastrar para inclinar · rueda para zoom · relieve SRTM 30 m, orientativo
      </p>
    </div>
  );
}
