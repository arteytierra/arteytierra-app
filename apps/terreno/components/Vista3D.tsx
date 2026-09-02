'use client';

/**
 * Vista 3D (D3) — relieve navegable con MapLibre GL.
 * Imagen satelital Esri drapeada sobre el terreno (raster-dem con los tiles
 * Terrarium de /api/terrarium, codificación 'terrarium') + el polígono del predio.
 * Se monta en un modal a pantalla completa y se carga de forma perezosa
 * (dynamic import desde MapaTerrenoApp) para no pesar en el bundle principal.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, Mountain, Layers, Compass, RotateCw, Pause } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Mojon } from '@/lib/types';
import { construirVectores3D, type DatosVectores } from '@/lib/vectores3d';
import { useTextoRelieve } from '@/lib/contextoRelieve';

interface Props extends DatosVectores {
  mojones: Mojon[];
  /** Zoom máximo con imagen satelital real en esta zona. */
  zoomSatelital?: number;
  onClose: () => void;
}

export function Vista3D({ onClose, zoomSatelital = 18, ...datos }: Props) {
  const relieve = useTextoRelieve();
  const { mojones } = datos;
  const contRef = useRef<HTMLDivElement>(null);
  const mapRef  = useRef<maplibregl.Map | null>(null);
  const marcadoresRef = useRef<maplibregl.Marker[]>([]);
  const [exag, setExag]         = useState(1.6);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [verVectores, setVerVectores] = useState(true);
  /** Rumbo de la cámara (grados). Se sincroniza si el usuario rota con el mouse. */
  const [bearing, setBearing]   = useState(-15);
  /** Giro automático tipo plato giratorio. */
  const [orbita, setOrbita]     = useState(false);
  /**
   * Las fuentes y capas ya existen. No alcanza con `!cargando`: el watchdog de
   * 12 s apaga el spinner aunque `load` no haya corrido, y entonces el efecto de
   * datos encontraba las fuentes inexistentes y no volvía a intentarlo.
   */
  const [estiloListo, setEstiloListo] = useState(false);
  /** El MDE ya llegó y el relieve está aplicado. */
  const [relieveListo, setRelieveListo] = useState(false);
  /** La exageración vigente, para leerla desde el callback de `sourcedata`. */
  const exagRef = useRef(1.6);
  exagRef.current = exag;

  // `datos` es un objeto nuevo en cada render (viene de un rest spread), así que
  // memorizamos contra sus campos y no contra su identidad.
  const { zonas, sectores, caminos, pines, aguadas, curvas, dibujos, capas, colorCurvas } = datos;
  const vectores = useMemo(
    () => construirVectores3D({ mojones, zonas, sectores, caminos, pines, aguadas, curvas, dibujos, capas, colorCurvas }),
    [mojones, zonas, sectores, caminos, pines, aguadas, curvas, dibujos, capas, colorCurvas],
  );

  useEffect(() => {
    if (!contRef.current || mojones.length < 3) return;
    let cancelado = false;
    setEstiloListo(false);   // el mapa se recrea: las capas todavía no existen
    setRelieveListo(false);

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
            // Pasado este nivel Esri devuelve la tesela "Map data not yet available";
            // con `maxzoom` MapLibre reescala la última real.
            maxzoom: zoomSatelital,
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
        // Sin `terrain` acá a propósito: con el relieve en el estilo, MapLibre no
        // dibuja *nada* —ni la imagen satelital— hasta tener las teselas del MDE,
        // que tardan segundos. Lo activamos abajo, cuando la fuente `dem` cargó.
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
    // Mantiene el slider "Girar" en sincronía cuando la rotación viene del mouse
    // (botón derecho + arrastrar) o de la órbita automática.
    map.on('rotate', () => { if (!cancelado) setBearing(map.getBearing()); });
    // Con ?debug3d en la URL, el mapa queda accesible desde la consola.
    if (new URLSearchParams(window.location.search).has('debug3d')) {
      (window as unknown as { __map3d?: maplibregl.Map }).__map3d = map;
    }

    // ── Rotar + inclinar con el botón central (rueda) del mouse ──
    // Arrastrar horizontal → rumbo (bearing); vertical → inclinación (pitch).
    // Complementa al botón derecho / Ctrl+arrastrar de MapLibre.
    const canvas3d = map.getCanvas();
    let girandoMedio = false, ultimoX = 0, ultimoY = 0;
    const onMedioDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();                 // corta el autoscroll del navegador
      girandoMedio = true; ultimoX = e.clientX; ultimoY = e.clientY;
      canvas3d.style.cursor = 'grabbing';
    };
    const onMedioMove = (e: MouseEvent) => {
      if (!girandoMedio) return;
      const dx = e.clientX - ultimoX, dy = e.clientY - ultimoY;
      ultimoX = e.clientX; ultimoY = e.clientY;
      map.setBearing(map.getBearing() - dx * 0.4);
      map.setPitch(Math.max(0, Math.min(map.getMaxPitch(), map.getPitch() + dy * 0.35)));
    };
    const onMedioUp = () => {
      if (!girandoMedio) return;
      girandoMedio = false; canvas3d.style.cursor = '';
    };
    const onAuxClick = (e: MouseEvent) => { if (e.button === 1) e.preventDefault(); };
    canvas3d.addEventListener('mousedown', onMedioDown);
    canvas3d.addEventListener('auxclick', onAuxClick);
    window.addEventListener('mousemove', onMedioMove);
    window.addEventListener('mouseup', onMedioUp);

    // El modal puede terminar de dimensionarse después de crear el mapa:
    // forzamos resize para que el canvas ocupe toda la pantalla.
    const forzarResize = () => { try { map.resize(); } catch { /* aún no listo */ } };
    const ro = new ResizeObserver(forzarResize);
    if (contRef.current) ro.observe(contRef.current);
    const t1 = setTimeout(forzarResize, 150);
    const t2 = setTimeout(forzarResize, 600);

    /**
     * Usamos `style.load` y no `load`: con `terrain` activo, `load` espera a que
     * las teselas del MDE estén todas cargadas, y algunas de /api/terrarium nunca
     * lo están, así que nunca disparaba. `style.load` sólo espera al estilo, que
     * es todo lo que hace falta para agregar fuentes y capas.
     */
    const alEstiloListo = () => {
      if (cancelado) return;
      forzarResize();

      // Fuentes vacías: las llena (y actualiza) el efecto de vectores de abajo.
      const vacio: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
      map.addSource('v-poly',  { type: 'geojson', data: vacio });
      map.addSource('v-line',  { type: 'geojson', data: vacio });

      // El estilo sale de las propiedades de cada feature: una capa por geometría
      // alcanza para zonas, sectores, caminos, aguadas, curvas, pines y dibujos.
      map.addLayer({
        id: 'v-poly-fill', type: 'fill', source: 'v-poly',
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacidad'] },
      });
      // `line-dasharray` no admite expresiones data-driven, así que cada estilo
      // de trazo va en su propia capa con un filtro que las hace excluyentes.
      const pintaLinea: maplibregl.LineLayerSpecification['paint'] = {
        'line-color': ['get', 'color'], 'line-width': ['get', 'grosor'], 'line-opacity': ['get', 'opacidad'],
      };
      map.addLayer({
        id: 'v-line-continua', type: 'line', source: 'v-line',
        filter: ['!', ['has', 'dash']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { ...pintaLinea },
      });
      map.addLayer({
        id: 'v-line-punteada', type: 'line', source: 'v-line',
        filter: ['==', ['get', 'dash'], 'punteada'],
        paint: { ...pintaLinea, 'line-dasharray': [2, 2] },
      });
      map.addLayer({
        id: 'v-line-rayada', type: 'line', source: 'v-line',
        filter: ['==', ['get', 'dash'], 'rayada'],
        paint: { ...pintaLinea, 'line-dasharray': [6, 2] },
      });
      // Los puntos (mojones, pines, represas, textos) van como Marker de HTML y no
      // como capa `symbol`: esta última exigiría un servidor de glyphs, y los
      // emojis de los pines no existen como glyph SDF. MapLibre eleva los Marker
      // sobre el relieve por su cuenta.

      encuadrar();
      setEstiloListo(true);
      setCargando(false);
    };
    if (map.isStyleLoaded()) alEstiloListo();
    else map.once('style.load', alEstiloListo);

    // `fitBounds` no tiene en cuenta la inclinación, así que encuadramos en planta
    // y recién después inclinamos; si no, el predio queda arrinconado arriba.
    function encuadrar() {
      map.fitBounds(bounds, { padding: 90, pitch: 0, bearing: 0, duration: 0 });
      map.easeTo({ pitch: 62, bearing: -15, duration: 0 });
    }

    /**
     * `fitBounds` tampoco tiene en cuenta la elevación: con el relieve puesto el
     * suelo sube cientos de metros hacia la cámara y el predio se sale de cuadro.
     * `project()` sí proyecta sobre el terreno, así que alejamos hasta que los
     * mojones entren, comprobándolo en pantalla.
     */
    function encajarPredio() {
      const margen = 60;
      for (let i = 0; i < 8; i++) {
        const pts = mojones.map(m => map.project([m.lng, m.lat]));
        const { innerWidth: W, innerHeight: H } = window;
        const entra = pts.every(p => p.x > margen && p.x < W - margen && p.y > margen && p.y < H - margen);
        if (entra) return;
        map.setZoom(map.getZoom() - 0.3);
      }
    }

    /**
     * El relieve se activa recién después del primer render, con la imagen
     * satelital ya en pantalla. Si `terrain` va en el estilo inicial, MapLibre no
     * dibuja nada hasta tener las teselas del MDE (segundos, en blanco).
     *
     * Tiene que ser acá y no antes: una fuente `raster-dem` sin nadie que la use
     * no pide una sola tesela, así que esperar a que "cargue" sin activar el
     * relieve espera para siempre.
     */
    map.once('idle', () => {
      if (cancelado || !map.getSource('dem')) return;
      try { map.setTerrain({ source: 'dem', exaggeration: exagRef.current }); }
      catch { /* el mapa se destruyó mientras tanto */ }
    });

    /** Cuando llega la primera tesela del MDE, el relieve ya se ve: reencuadramos. */
    const alCargarFuente = (e: maplibregl.MapSourceDataEvent) => {
      if (cancelado || e.sourceId !== 'dem' || !e.tile || !map.isSourceLoaded('dem')) return;
      map.off('sourcedata', alCargarFuente);
      setRelieveListo(true);
      // El relieve levanta el suelo hacia la cámara y `fitBounds` no lo tiene en
      // cuenta: reencuadramos recién cuando el terreno terminó de asentarse.
      map.once('idle', () => { if (!cancelado) { encuadrar(); encajarPredio(); } });
    };
    map.on('sourcedata', alCargarFuente);

    // Los errores de tiles no son fatales, pero silenciar todo escondería también
    // los errores de estilo (expresiones, capas), que sí importan.
    map.on('error', e => { console.warn('[Vista3D] MapLibre:', e.error?.message ?? e); });

    // Red de seguridad: si el estilo tampoco carga, sacamos el spinner igual.
    const t = setTimeout(() => { if (!cancelado) setCargando(false); }, 12_000);

    return () => {
      cancelado = true; clearTimeout(t); clearTimeout(t1); clearTimeout(t2); ro.disconnect();
      canvas3d.removeEventListener('mousedown', onMedioDown);
      canvas3d.removeEventListener('auxclick', onAuxClick);
      window.removeEventListener('mousemove', onMedioMove);
      window.removeEventListener('mouseup', onMedioUp);
      map.remove(); mapRef.current = null;
    };
    // `zoomSatelital` viaja en el estilo: si cambia hay que rehacer el mapa.
  }, [mojones, zoomSatelital]);

  // Exageración vertical en vivo (sólo una vez que el relieve está activo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !relieveListo) return;
    try { map.setTerrain({ source: 'dem', exaggeration: exag }); } catch { /* aún no listo */ }
  }, [exag, relieveListo]);

  // Giro automático (plato giratorio). El listener `rotate` de arriba mantiene el
  // slider en sincronía, así que acá sólo empujamos el rumbo cuadro a cuadro.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !orbita) return;
    let raf = 0;
    let previo = performance.now();
    const paso = (ahora: number) => {
      const dt = ahora - previo; previo = ahora;
      map.setBearing(map.getBearing() + dt * 0.012); // ~7°/s → vuelta en ~50 s
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [orbita]);

  const girar = (grados: number) => {
    setBearing(grados);
    try { mapRef.current?.setBearing(grados); } catch { /* aún no listo */ }
  };
  const alNorte = () => {
    setOrbita(false);
    try { mapRef.current?.easeTo({ bearing: 0, duration: 400 }); } catch { /* aún no listo */ }
  };

  // Vuelca los vectores del plano 2D. Corre también cuando el usuario prende o
  // apaga capas en el 2D con la Vista 3D abierta.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !estiloListo) return;
    const s = (id: string) => map.getSource(id) as maplibregl.GeoJSONSource | undefined;
    s('v-poly')?.setData(vectores.poligonos);
    s('v-line')?.setData(vectores.lineas);

    const marcadores = vectores.puntos.features.map(f => {
      const { color, simbolo, nombre } = f.properties;
      const el = document.createElement('div');
      el.textContent = simbolo;
      el.title = nombre;
      // Los textos largos (dibujos de tipo `texto`) van como etiqueta, no como chapita.
      const etiqueta = simbolo.length > 2;
      el.style.cssText = etiqueta
        ? `padding:2px 6px;border-radius:6px;font-size:12px;line-height:1.3;white-space:nowrap;
           background:rgba(0,0,0,.6);color:${color};border:1px solid rgba(255,255,255,.25);
           box-shadow:0 1px 4px rgba(0,0,0,.45);cursor:default;`
        : `display:flex;align-items:center;justify-content:center;
           width:26px;height:26px;border-radius:9999px;font-size:14px;line-height:1;
           background:${color};color:#fff;border:2px solid rgba(255,255,255,.85);
           box-shadow:0 1px 4px rgba(0,0,0,.45);cursor:default;`;
      const [lng, lat] = f.geometry.coordinates as [number, number];
      return new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    });
    marcadoresRef.current = marcadores;
    return () => { marcadores.forEach(m => m.remove()); marcadoresRef.current = []; };
  }, [vectores, estiloListo]);

  // Mostrar / ocultar todos los vectores
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !estiloListo) return;
    const vis = verVectores ? 'visible' : 'none';
    for (const id of ['v-poly-fill', 'v-line-continua', 'v-line-punteada', 'v-line-rayada']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
    }
    for (const m of marcadoresRef.current) {
      m.getElement().style.display = verVectores ? '' : 'none';
    }
  }, [verVectores, estiloListo, vectores]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    // `vista-3d` cancela el invert del tema oscuro: sin eso el fondo se vuelve
    // casi blanco y la espera parece una pantalla en blanco rota.
    <div className="vista-3d fixed inset-0 z-[10000] bg-ink-900">
      {/* Estilo inline: MapLibre agrega `.maplibregl-map{position:relative}` al
          contenedor y pisaría un `absolute inset-0` de clase → el div colapsaría
          a altura 0. Con estilo inline forzamos que ocupe toda la pantalla. */}
      <div ref={contRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      {cargando && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/70 pointer-events-none">
          <div className="flex items-center gap-2 text-bone-50 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando la imagen satelital…
          </div>
        </div>
      )}
      {/* La imagen ya se ve; el relieve llega después (el MDE tarda unos segundos). */}
      {!cargando && !relieveListo && (
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-ink-900/80 backdrop-blur rounded-full px-3 py-1.5 border border-bone-50/15 pointer-events-none">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-bone-50/70" />
          <span className="text-bone-50/80 text-[11px]">Levantando el relieve…</span>
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
            className="w-20 accent-sun-400" />
          <span className="font-mono w-7">{exag.toFixed(1)}×</span>
        </label>
        <span className="text-bone-50/40 text-xs">·</span>
        {/* Girar la escena (rumbo de la cámara). */}
        <label className="text-bone-50/80 text-[11px] flex items-center gap-2">
          Girar
          <input type="range" min={-180} max={180} step={1} value={bearing}
            onChange={e => girar(parseFloat(e.target.value))}
            className="w-20 accent-sun-400" />
          <span className="font-mono w-9">{Math.round(bearing)}°</span>
        </label>
        <button
          onClick={alNorte}
          title="Volver al norte"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-bone-50/10 hover:bg-bone-50/20 border border-bone-50/20 text-bone-50/80 transition-colors">
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setOrbita(o => !o)}
          title={orbita ? 'Detener el giro' : 'Giro automático'}
          className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${
            orbita
              ? 'bg-sun-400/90 border-sun-400 text-ink-900'
              : 'bg-bone-50/10 hover:bg-bone-50/20 border-bone-50/20 text-bone-50/80'
          }`}>
          {orbita ? <Pause className="w-3.5 h-3.5" /> : <RotateCw className="w-3.5 h-3.5" />}
        </button>
        {vectores.total > 0 && (
          <>
            <span className="text-bone-50/40 text-xs">·</span>
            <button
              onClick={() => setVerVectores(v => !v)}
              title="Mostrar u ocultar lo dibujado en el plano"
              className={`flex items-center gap-1.5 text-[11px] rounded-full px-2 py-1 border transition-colors ${
                verVectores
                  ? 'bg-bone-50/15 border-bone-50/25 text-bone-50'
                  : 'bg-transparent border-bone-50/15 text-bone-50/45'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Plano
              <span className="font-mono opacity-60">{vectores.total}</span>
            </button>
          </>
        )}
      </div>

      {/* Cerrar */}
      <button onClick={onClose}
        className="absolute top-3 right-3 flex items-center gap-1.5 bg-ink-900/80 hover:bg-ink-900 text-bone-50 text-xs font-medium rounded-full px-3 py-2 border border-bone-50/15 transition-colors">
        <X className="w-4 h-4" /> Cerrar
      </button>

      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-bone-50/45 text-[10px] text-center">
        Girá e incliná con la ruedita del mouse apretada + arrastrar (o botón derecho) · arrastrá para desplazar · rueda para zoom · relieve: {relieve}, orientativo
      </p>
    </div>
  );
}
