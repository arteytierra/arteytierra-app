'use client';

/**
 * Imagen histórica (D2) — ESRI World Imagery Wayback.
 * Mapa con la imagen satelital actual de base y una capa histórica encima,
 * con línea de tiempo (una fecha por año) y cortina "antes/después" (swipe):
 * izquierda = imagen de la fecha elegida, derecha = imagen actual.
 * Se monta en un modal a pantalla completa (dynamic import desde MapaTerrenoApp).
 */
import { useEffect, useRef, useState } from 'react';
import { X, Loader2, History } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mojon } from '@/lib/types';
import { obtenerReleasesWayback, type ReleaseWayback } from '@/lib/wayback';

interface Props {
  mojones: Mojon[];
  onClose: () => void;
}

const IMG_ACTUAL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export function VistaHistorica({ mojones, onClose }: Props) {
  const contRef = useRef<HTMLDivElement>(null);
  const mapRef  = useRef<L.Map | null>(null);
  const histRef = useRef<L.TileLayer | null>(null);
  const [releases, setReleases] = useState<ReleaseWayback[]>([]);
  const [idx, setIdx]           = useState(0);
  const [swipe, setSwipe]       = useState(50);   // % de la cortina
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Init: mapa + índice de releases
  useEffect(() => {
    if (!contRef.current || mojones.length < 3) return;
    let cancel = false;

    const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
    const map = L.map(contRef.current, { zoomControl: true, attributionControl: false });
    mapRef.current = map;
    map.fitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { padding: [50, 50] });

    L.tileLayer(IMG_ACTUAL, { maxZoom: 19 }).addTo(map);

    map.createPane('hist');
    const pane = map.getPane('hist');
    if (pane) { pane.style.zIndex = '450'; pane.style.clipPath = 'inset(0 50% 0 0)'; }

    const ring = mojones.map(m => [m.lat, m.lng] as [number, number]);
    L.polygon(ring, { color: '#D9A441', weight: 3, fill: false, pane: 'overlayPane' }).addTo(map);

    setTimeout(() => { if (!cancel) map.invalidateSize(); }, 150);

    (async () => {
      try {
        const rels = await obtenerReleasesWayback();
        if (cancel) return;
        setReleases(rels);
        setIdx(rels.length ? rels.length - 1 : 0);
      } catch {
        if (!cancel) setError('No se pudo cargar el histórico de imágenes.');
      } finally {
        if (!cancel) setCargando(false);
      }
    })();

    return () => { cancel = true; map.remove(); mapRef.current = null; histRef.current = null; };
  }, [mojones]);

  // Cambiar la capa histórica al mover la línea de tiempo
  useEffect(() => {
    const map = mapRef.current;
    const rel = releases[idx];
    if (!map || !rel) return;
    if (histRef.current) map.removeLayer(histRef.current);
    histRef.current = L.tileLayer(rel.tileUrl, { maxZoom: 19, pane: 'hist' }).addTo(map);
  }, [idx, releases]);

  // Cortina (clip-path)
  useEffect(() => {
    const pane = mapRef.current?.getPane('hist');
    if (pane) pane.style.clipPath = `inset(0 ${100 - swipe}% 0 0)`;
  }, [swipe, cargando]);

  // Escape para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const relActual = releases[idx];

  return (
    <div className="fixed inset-0 z-[10000] bg-ink-900">
      {/* zIndex:0 crea un contexto de apilamiento propio: confina los panes de
          Leaflet (que usan z-index 200–700) para que no tapen los controles. */}
      <div ref={contRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} />

      {/* Línea divisoria de la cortina */}
      {!cargando && !error && (
        <div className="absolute top-0 bottom-0 z-[5] pointer-events-none" style={{ left: `${swipe}%` }}>
          <div className="w-0.5 h-full bg-bone-50/80 shadow-[0_0_6px_rgba(0,0,0,0.6)]" />
        </div>
      )}

      {cargando && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/60 pointer-events-none">
          <div className="flex items-center gap-2 text-bone-50 text-sm"><Loader2 className="w-5 h-5 animate-spin" /> Cargando imágenes históricas…</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-bone-50 text-sm bg-clay-700 rounded-xl px-4 py-2">{error}</p>
        </div>
      )}

      {/* Barra superior: título + etiquetas antes/después */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-ink-900/80 backdrop-blur rounded-full px-4 py-2 border border-bone-50/15">
        <span className="text-bone-50 text-xs font-medium flex items-center gap-1.5"><History className="w-3.5 h-3.5" />Imagen histórica</span>
        {relActual && (
          <>
            <span className="text-bone-50/40 text-xs">·</span>
            <span className="text-sun-300 text-xs font-mono">{relActual.fecha}</span>
            <span className="text-bone-50/40 text-xs">↔ actual</span>
          </>
        )}
      </div>

      <button onClick={onClose}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-ink-900/80 hover:bg-ink-900 text-bone-50 text-xs font-medium rounded-full px-3 py-2 border border-bone-50/15 transition-colors">
        <X className="w-4 h-4" /> Cerrar
      </button>

      {/* Controles inferiores */}
      {!cargando && !error && releases.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(680px,92vw)] bg-ink-900/85 backdrop-blur rounded-2xl px-5 py-3.5 border border-bone-50/15 space-y-3">
          {/* Línea de tiempo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-bone-50/60">
              <span>Fecha de la imagen (izquierda)</span>
              <span className="text-sun-300 font-mono text-xs">{relActual?.fecha ?? ''}</span>
            </div>
            <input type="range" min={0} max={releases.length - 1} step={1} value={idx}
              onChange={e => setIdx(Number(e.target.value))}
              className="w-full accent-sun-400" />
            <div className="flex justify-between text-[9px] text-bone-50/45">
              <span>{releases[0]?.label}</span>
              <span>{releases[releases.length - 1]?.label}</span>
            </div>
          </div>
          {/* Cortina */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-bone-50/60 w-12 shrink-0">Cortina</span>
            <input type="range" min={0} max={100} step={1} value={swipe}
              onChange={e => setSwipe(Number(e.target.value))}
              className="flex-1 accent-bone-50" />
            <span className="text-[9px] text-bone-50/45 w-24 shrink-0 text-right">← histórica · actual →</span>
          </div>
        </div>
      )}
    </div>
  );
}
