'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useMemo } from 'react';
import {
  Trash2, LogOut, Map, ChevronRight, MapPin, Cloud,
  FolderOpen, Mountain, Droplets, FileText, CalendarDays,
  Layers, Sun, LayoutGrid, Compass, Waves, Route,
  Eye, EyeOff, Camera, X, PenLine,
} from 'lucide-react';
import { MojonForm } from './MojonForm';
import { PoligonoPanel } from './PoligonoPanel';
import { ProyectosPanel } from './ProyectosPanel';
import { ClimaPanel } from './ClimaPanel';
import { TopografiaPanel } from './TopografiaPanel';
import { CaptacionPanel } from './CaptacionPanel';
import { CalendarioPanel } from './CalendarioPanel';
import { SuelosPanel } from './SuelosPanel';
import { SolarPanel } from './SolarPanel';
import { ZonificacionPanel } from './ZonificacionPanel';
import { SectoresPanel } from './SectoresPanel';
import { AguadasPanel } from './AguadasPanel';
import { CaminosPanel } from './CaminosPanel';
import { calcularMetricas } from '@/lib/geometria';
import { decimalAGMS } from '@/lib/coordenadas';
import { getSupabaseBrowserClient } from '@/lib/db/browser';
import { guardarInformeBorrador } from '@/lib/informe';
import { crearZona, actualizarAreaZona, CATEGORIAS_ZONA } from '@/lib/zonificacion';
import { crearPin, ICONOS_PIN, type Pin } from '@/lib/pines';
import { crearCamino, type Camino } from '@/lib/caminos';
import { fetchShader, type DatosShader } from '@/lib/shaders';
import { calcularEscorrentias, type DatosEscorrentia } from '@/lib/escorrentias';
import { calcularSugerencias, type ResultadoSugerencias } from '@/lib/sugerencias';
import { SugerenciasPanel } from './SugerenciasPanel';
import { DibujoToolbar } from './DibujoToolbar';
import type { ElementoDibujo, DibujoEnCurso, TipoDibujo } from '@/lib/dibujos';
import { COLORES_DIBUJO, distanciaMetros } from '@/lib/dibujos';
import { useRouter } from 'next/navigation';
import type { Mojon } from '@/lib/types';
import type { Proyecto } from '@/lib/proyectos';
import type { DatosClima } from '@/lib/clima';
import type { DatosTopografia } from '@/lib/topografia';
import type { CaptacionSnapshot } from '@/lib/captacion';
import type { DatosSuelo } from '@/lib/suelos';
import type { Zona, CategoriaZona } from '@/lib/zonificacion';
import type { Sector, TipoSector } from '@/lib/sectores';
import { TIPOS_SECTOR } from '@/lib/sectores';
import type { CapasVisibles } from './MapLeaflet';

const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-moss-900/10">
      <div className="text-center space-y-2">
        <Map className="w-8 h-8 text-moss-700 mx-auto" />
        <p className="text-sm text-moss-700">Cargando mapa…</p>
      </div>
    </div>
  ),
});

type Tab =
  | 'mojones' | 'clima'  | 'topo'   | 'suelo'
  | 'agua'    | 'cal'    | 'solar'
  | 'zonas'   | 'sectores' | 'aguadas' | 'caminos'
  | 'proyectos';

interface ModoZona    { categoria: CategoriaZona; vertices: Array<{ lat: number; lng: number }> }
interface ModoSector  { tipo: TipoSector;          vertices: Array<{ lat: number; lng: number }> }
interface ModoCamino  { vertices: Array<{ lat: number; lng: number }> }

interface Props { userName: string | null }

export function MapaTerrenoApp({ userName }: Props) {
  const router = useRouter();

  // ─── Mojones ──────────────────────────────────────────────────────────────
  const [mojones,       setMojones]       = useState<Mojon[]>([]);
  const [modoClick,     setModoClick]     = useState(false);
  const [seleccionado,  setSeleccionado]  = useState<string | null>(null);
  const [panelAbierto,  setPanelAbierto]  = useState(true);
  const [tab,           setTab]           = useState<Tab>('mojones');
  const [proyectoActual,setProyectoActual]= useState<Proyecto | null>(null);

  // ─── Análisis ─────────────────────────────────────────────────────────────
  const [datosClima,      setDatosClima]      = useState<DatosClima | null>(null);
  const [datosTopografia, setDatosTopografia] = useState<DatosTopografia | null>(null);
  const [topoLoading,     setTopoLoading]     = useState(false);
  const [topoError,       setTopoError]       = useState<string | null>(null);
  const [captacionSnap,   setCaptacionSnap]   = useState<CaptacionSnapshot | null>(null);
  const [datosSuelo,      setDatosSuelo]      = useState<DatosSuelo | null>(null);
  const [sueloLoading,    setSueloLoading]    = useState(false);
  const [sueloError,      setSueloError]      = useState<string | null>(null);

  // ─── Shader topográfico ───────────────────────────────────────────────────
  const [datosShader,   setDatosShader]   = useState<DatosShader | null>(null);
  const [shaderLoading, setShaderLoading] = useState(false);
  const [shaderError,   setShaderError]   = useState<string | null>(null);

  // ─── Objetos de diseño ────────────────────────────────────────────────────
  const [zonas,       setZonas]       = useState<Zona[]>([]);
  const [modoZona,    setModoZona]    = useState<ModoZona | null>(null);
  const [sectores,    setSectores]    = useState<Sector[]>([]);
  const [modoSector,  setModoSector]  = useState<ModoSector | null>(null);
  const [pines,       setPines]       = useState<Pin[]>([]);
  const [modoPinClick,setModoPinClick]= useState(false);
  const [pinEditId,   setPinEditId]   = useState<string | null>(null);
  const [caminos,     setCaminos]     = useState<Camino[]>([]);
  const [modoCamino,  setModoCamino]  = useState<ModoCamino | null>(null);

  // ─── Capas y visibilidad ──────────────────────────────────────────────────
  const [capas, setCapas] = useState<CapasVisibles>({
    terreno: true, zonas: true, sectores: true, pines: true, caminos: true,
    shaderElev: false, shaderPend: false, terrariumElev: false, escorrentias: false, sugerencias: false,
  });
  const [ocultosIds,       setOcultosIds]       = useState<Set<string>>(new Set());
  const [panelDerecho,     setPanelDerecho]      = useState<'capas' | 'sugerencias' | null>(null);

  // ─── Dibujo libre ─────────────────────────────────────────────────────────
  const [dibujos,        setDibujos]        = useState<ElementoDibujo[]>([]);
  const [modoDibujo,     setModoDibujo]     = useState<TipoDibujo | 'seleccion' | null>(null);
  const [dibujoEnCurso,  setDibujoEnCurso]  = useState<DibujoEnCurso | null>(null);
  const [dibujoSelId,    setDibujoSelId]    = useState<string | null>(null);
  const [colorDibujo,    setColorDibujo]    = useState<string>(COLORES_DIBUJO[0]);

  // ─── Captura ──────────────────────────────────────────────────────────────
  const [capturaActiva,  setCapturaActiva]  = useState(false);
  const [capturaTitulo,  setCapturaTitulo]  = useState('');

  const metricas  = useMemo(() => calcularMetricas(mojones), [mojones]);
  const dibujando = modoZona || modoSector || modoCamino || modoPinClick || (modoDibujo && modoDibujo !== 'seleccion');

  // ─── Visibilidad por item ─────────────────────────────────────────────────
  const zonasFiltradas    = useMemo(() => capas.zonas    ? zonas.filter(z => !ocultosIds.has(z.id))    : [], [capas.zonas, zonas, ocultosIds]);
  const sectoresFiltrados = useMemo(() => capas.sectores ? sectores.filter(s => !ocultosIds.has(s.id)) : [], [capas.sectores, sectores, ocultosIds]);
  const pinesFiltrados    = useMemo(() => capas.pines    ? pines.filter(p => !ocultosIds.has(p.id))    : [], [capas.pines, pines, ocultosIds]);
  const caminosFiltrados  = useMemo(() => capas.caminos  ? caminos.filter(c => !ocultosIds.has(c.id))  : [], [capas.caminos, caminos, ocultosIds]);

  // ─── Escorrentías y sugerencias (cómputo derivado de shader) ─────────────
  const datosEscorrentia = useMemo<DatosEscorrentia | null>(
    () => datosShader ? calcularEscorrentias(datosShader) : null,
    [datosShader],
  );
  const datosSugerencias = useMemo<ResultadoSugerencias | null>(
    () => datosShader && datosEscorrentia ? calcularSugerencias(datosShader, datosEscorrentia) : null,
    [datosShader, datosEscorrentia],
  );

  const metadatos = useMemo<Record<string, unknown>>(() => {
    const m: Record<string, unknown> = {};
    if (datosClima)      m['clima']    = datosClima;
    if (datosTopografia) m['topo']     = datosTopografia;
    if (captacionSnap)   m['captacion']= captacionSnap;
    if (datosSuelo)      m['suelo']    = datosSuelo;
    if (zonas.length)    m['zonas']    = zonas;
    if (sectores.length) m['sectores'] = sectores;
    if (pines.length)    m['pines']    = pines;
    if (caminos.length)  m['caminos']  = caminos;
    if (datosShader)     m['shader']   = datosShader;
    if (dibujos.length)  m['dibujos']  = dibujos;
    return m;
  }, [datosClima, datosTopografia, captacionSnap, datosSuelo, zonas, sectores, pines, caminos, dibujos]);

  // ─── Mojones ──────────────────────────────────────────────────────────────
  const agregarMojon = useCallback((lat: number, lng: number) => {
    setMojones(prev => [...prev, { id: crypto.randomUUID(), numero: prev.length + 1, lat, lng }]);
  }, []);

  const eliminarMojon = useCallback((id: string) => {
    setMojones(prev => prev.filter(m => m.id !== id).map((m, i) => ({ ...m, numero: i + 1 })));
    setSeleccionado(s => s === id ? null : s);
  }, []);

  const limpiarTodo = useCallback(() => {
    if (mojones.length === 0) return;
    if (!confirm(`¿Eliminar los ${mojones.length} mojones?`)) return;
    setMojones([]); setSeleccionado(null);
  }, [mojones.length]);

  // ─── Clic en mapa ─────────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (modoZona)    { setModoZona(prev => prev ? { ...prev, vertices: [...prev.vertices, { lat, lng }] } : null); return; }
    if (modoSector)  { setModoSector(prev => prev ? { ...prev, vertices: [...prev.vertices, { lat, lng }] } : null); return; }
    if (modoCamino)  { setModoCamino(prev => prev ? { ...prev, vertices: [...prev.vertices, { lat, lng }] } : null); return; }
    if (modoPinClick){ setPines(prev => [...prev, crearPin(lat, lng)]); setModoPinClick(false); return; }

    if (modoDibujo && modoDibujo !== 'seleccion') {
      if (modoDibujo === 'texto') {
        const texto = window.prompt('Escribí el texto:');
        if (!texto?.trim()) return;
        setDibujos(prev => [...prev, {
          id: crypto.randomUUID(), tipo: 'texto', color: colorDibujo,
          lat, lng, texto: texto.trim(), tamano: 14,
        }]);
        return;
      }
      setDibujoEnCurso(prev => {
        if (!prev) return { tipo: modoDibujo, vertices: [{ lat, lng }] };
        const next = [...prev.vertices, { lat, lng }];
        // Auto-finalizar círculo al tener 2 puntos
        if (modoDibujo === 'circulo' && next.length === 2) {
          const id    = crypto.randomUUID();
          const radio = distanciaMetros(next[0]!.lat, next[0]!.lng, next[1]!.lat, next[1]!.lng);
          setDibujos(d => [...d, { id, tipo: 'circulo', color: colorDibujo, lat: next[0]!.lat, lng: next[0]!.lng, radio, opacidad: 0.18 }]);
          return { tipo: modoDibujo, vertices: [] };
        }
        return { ...prev, vertices: next };
      });
      return;
    }

    if (modoClick) agregarMojon(lat, lng);
  }, [modoZona, modoSector, modoCamino, modoPinClick, modoClick, modoDibujo, colorDibujo, agregarMojon]);

  // ─── Zonas ────────────────────────────────────────────────────────────────
  const handleIniciarZona    = useCallback((categoria: CategoriaZona) => { setModoZona({ categoria, vertices: [] }); setModoClick(false); }, []);
  const handleFinalizarZona  = useCallback((color?: string) => {
    if (!modoZona || modoZona.vertices.length < 3) return;
    setZonas(prev => [...prev, crearZona(modoZona.categoria, modoZona.vertices, color)]);
    setModoZona(null);
  }, [modoZona]);
  const handleCancelarZona   = useCallback(() => setModoZona(null), []);

  // ─── Sectores ─────────────────────────────────────────────────────────────
  const handleIniciarSector   = useCallback((tipo: TipoSector) => { setModoSector({ tipo, vertices: [] }); setModoClick(false); }, []);
  const handleFinalizarSector = useCallback((color?: string) => {
    if (!modoSector || modoSector.vertices.length < 3) return;
    const nuevo: Sector = {
      id: crypto.randomUUID(), tipo: modoSector.tipo,
      nombre: TIPOS_SECTOR[modoSector.tipo].label,
      vertices: modoSector.vertices, notas: '', auto: false, color,
    };
    setSectores(prev => [...prev, nuevo]);
    setModoSector(null);
  }, [modoSector]);
  const handleCancelarSector  = useCallback(() => setModoSector(null), []);

  // ─── Pines ────────────────────────────────────────────────────────────────
  const handleEditarPin = useCallback((id: string) => {
    setPinEditId(prev => prev === id ? null : id);
    setTab('mojones');
  }, []);

  // ─── Caminos ──────────────────────────────────────────────────────────────
  const handleIniciarCamino   = useCallback(() => { setModoCamino({ vertices: [] }); setModoClick(false); }, []);
  const handleFinalizarCamino = useCallback((color?: string) => {
    if (!modoCamino || modoCamino.vertices.length < 2) return;
    const c = crearCamino(modoCamino.vertices);
    setCaminos(prev => [...prev, { ...c, color: color ?? c.color }]);
    setModoCamino(null);
  }, [modoCamino]);
  const handleCancelarCamino  = useCallback(() => setModoCamino(null), []);

  // ─── Dibujo libre ─────────────────────────────────────────────────────────
  const handleCambiarModo = useCallback((modo: TipoDibujo | 'seleccion' | null) => {
    setModoDibujo(modo);
    setDibujoEnCurso(modo && modo !== 'seleccion' ? { tipo: modo, vertices: [] } : null);
    setDibujoSelId(null);
    if (modo) { setModoClick(false); }
  }, []);

  const handleClickDibujo = useCallback((id: string) => {
    setDibujoSelId(prev => prev === id ? null : id);
  }, []);

  const handleEliminarDibujo = useCallback(() => {
    if (!dibujoSelId) return;
    setDibujos(prev => prev.filter(d => d.id !== dibujoSelId));
    setDibujoSelId(null);
  }, [dibujoSelId]);

  const handleFinalizarDibujo = useCallback(() => {
    if (!dibujoEnCurso) return;
    const id    = crypto.randomUUID();
    const color = colorDibujo;
    const verts = dibujoEnCurso.vertices;

    if (dibujoEnCurso.tipo === 'linea' && verts.length >= 2)
      setDibujos(prev => [...prev, { id, tipo: 'linea',    color, vertices: verts, grosor: 3 }]);
    else if (dibujoEnCurso.tipo === 'curva' && verts.length >= 2)
      setDibujos(prev => [...prev, { id, tipo: 'curva',    color, vertices: verts, grosor: 3 }]);
    else if (dibujoEnCurso.tipo === 'poligono' && verts.length >= 3)
      setDibujos(prev => [...prev, { id, tipo: 'poligono', color, vertices: verts, opacidad: 0.22 }]);
    else if (dibujoEnCurso.tipo === 'circulo' && verts.length === 2) {
      const radio = distanciaMetros(verts[0]!.lat, verts[0]!.lng, verts[1]!.lat, verts[1]!.lng);
      setDibujos(prev => [...prev, { id, tipo: 'circulo', color, lat: verts[0]!.lat, lng: verts[0]!.lng, radio, opacidad: 0.18 }]);
    }

    setDibujoEnCurso({ tipo: dibujoEnCurso.tipo, vertices: [] });
  }, [dibujoEnCurso, colorDibujo]);

  const handleCancelarDibujo = useCallback(() => {
    setModoDibujo(null);
    setDibujoEnCurso(null);
    setDibujoSelId(null);
  }, []);

  const handleMoverDibujo = useCallback((id: string, dLat: number, dLng: number) => {
    setDibujos(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.tipo === 'texto' || d.tipo === 'circulo')
        return { ...d, lat: d.lat + dLat, lng: d.lng + dLng };
      return { ...d, vertices: d.vertices.map(v => ({ lat: v.lat + dLat, lng: v.lng + dLng })) };
    }));
  }, []);

  // ─── Shader ───────────────────────────────────────────────────────────────
  const handleFetchShader = useCallback(async () => {
    if (mojones.length < 3) return;
    setShaderLoading(true);
    setShaderError(null);
    const result = await fetchShader(mojones);
    setShaderLoading(false);
    if ('error' in result) {
      setShaderError(result.error);
    } else {
      setDatosShader(result);
      setCapas(prev => ({ ...prev, shaderElev: true, shaderPend: false, escorrentias: true, sugerencias: true }));
    }
  }, [mojones]);

  // ─── Agregar desde sugerencias ────────────────────────────────────────────
  const handleAgregarPinSugerencia = useCallback((lat: number, lng: number, nombre: string, icono: string, color: string) => {
    const pin = { id: crypto.randomUUID(), lat, lng, nombre, icono, color, notas: '' };
    setPines(prev => [...prev, pin]);
    setTab('mojones');
    setPinEditId(null);
  }, []);

  const handleAgregarCaminoSugerencia = useCallback((vertices: Array<{lat: number; lng: number}>, nombre: string, color: string) => {
    const c = crearCamino(vertices);
    setCaminos(prev => [...prev, { ...c, nombre, color }]);
    setTab('caminos');
  }, []);

  const toggleOculto = useCallback((id: string) => {
    setOcultosIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // ─── Proyectos ────────────────────────────────────────────────────────────
  const handleCargarProyecto = useCallback((p: Proyecto) => {
    setMojones(p.mojones);
    setProyectoActual(p.id ? p : null);
    setSeleccionado(null);
    const meta = (p.metadatos ?? {}) as Record<string, unknown>;
    setDatosClima((meta['clima'] as DatosClima) ?? null);
    setDatosTopografia((meta['topo'] as DatosTopografia) ?? null);
    setCaptacionSnap((meta['captacion'] as CaptacionSnapshot) ?? null);
    setDatosSuelo((meta['suelo'] as DatosSuelo) ?? null);
    setZonas((meta['zonas'] as Zona[]) ?? []);
    setSectores((meta['sectores'] as Sector[]) ?? []);
    setPines((meta['pines'] as Pin[]) ?? []);
    setCaminos((meta['caminos'] as Camino[]) ?? []);
    const shaderGuardado = (meta['shader'] as DatosShader) ?? null;
    setDatosShader(shaderGuardado);
    if (shaderGuardado) setCapas(prev => ({ ...prev, shaderElev: true, escorrentias: true, sugerencias: true }));
    setDibujos((meta['dibujos'] as ElementoDibujo[]) ?? []);
    setTab('mojones');
  }, []);

  // ─── Informe ──────────────────────────────────────────────────────────────
  const handleVerInforme = useCallback(() => {
    guardarInformeBorrador({
      nombre: proyectoActual?.nombre ?? 'Terreno sin nombre',
      fecha:  new Date().toISOString(),
      mojones, metricas: metricas ?? undefined,
      clima:  datosClima ?? undefined, topo: datosTopografia ?? undefined,
      captacion: captacionSnap ?? undefined, suelo: datosSuelo ?? undefined,
      zonas: zonas.length ? zonas : undefined,
    });
    window.open('/informe/borrador', '_blank');
  }, [proyectoActual, mojones, metricas, datosClima, datosTopografia, captacionSnap, datosSuelo, zonas]);

  // ─── Captura ──────────────────────────────────────────────────────────────
  const handleCapturaMap = useCallback(() => {
    const style = document.createElement('style');
    style.id = '__print_map_style';
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #print-capture-root { display: block !important; visibility: visible !important; position: fixed !important; inset: 0 !important; }
        #print-capture-root > * { display: none !important; }
        #mapa-captura { display: block !important; visibility: visible !important; position: absolute !important; inset: 0 !important; }
        #mapa-captura * { display: block !important; visibility: visible !important; }
        #captura-titulo { display: block !important; visibility: visible !important; position: fixed !important; top: 16px !important; left: 16px !important; z-index: 99999 !important; background: white !important; border-radius: 8px !important; padding: 10px 14px !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; }
        #captura-leyenda { display: block !important; visibility: visible !important; position: fixed !important; bottom: 16px !important; right: 16px !important; z-index: 99999 !important; background: white !important; border-radius: 8px !important; padding: 12px !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; min-width: 160px !important; }
        .no-print { display: none !important; }
        .leaflet-control-container { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById('__print_map_style')?.remove(), 1500);
  }, []);

  async function handleLogout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.push('/login'); router.refresh();
  }

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  const TABS_ANALISIS = [
    { id: 'mojones'  as Tab, label: 'Mojones', icon: <MapPin       className="w-3.5 h-3.5" /> },
    { id: 'clima'    as Tab, label: 'Clima',   icon: <Cloud        className="w-3.5 h-3.5" /> },
    { id: 'topo'     as Tab, label: 'Topo',    icon: <Mountain     className="w-3.5 h-3.5" /> },
    { id: 'suelo'    as Tab, label: 'Suelo',   icon: <Layers       className="w-3.5 h-3.5" /> },
    { id: 'cal'      as Tab, label: 'Cal.',    icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: 'solar'    as Tab, label: 'Solar',   icon: <Sun          className="w-3.5 h-3.5" /> },
  ];
  const TABS_DISENO = [
    { id: 'agua'      as Tab, label: 'Agua',     icon: <Droplets   className="w-3.5 h-3.5" /> },
    { id: 'zonas'     as Tab, label: 'Zonas',    icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'sectores'  as Tab, label: 'Sectores', icon: <Compass    className="w-3.5 h-3.5" /> },
    { id: 'aguadas'   as Tab, label: 'Aguadas',  icon: <Waves      className="w-3.5 h-3.5" /> },
    { id: 'caminos'   as Tab, label: 'Caminos',  icon: <Route      className="w-3.5 h-3.5" /> },
    { id: 'proyectos' as Tab, label: 'Proyect.', icon: <FolderOpen className="w-3.5 h-3.5" /> },
  ];

  const tabBtnClass = (t: Tab) =>
    `flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 text-[9px] font-medium rounded-md transition-colors ${
      tab === t ? 'bg-white text-moss-900 shadow-paper' : 'text-ink-700/60 hover:text-ink-700'
    }`;

  // ─── Leyenda para captura ─────────────────────────────────────────────────
  const leyendaItems = useMemo(() => {
    const items: Array<{ color?: string; dash?: boolean; icon?: string; label: string }> = [];
    if (capas.terreno && mojones.length >= 3)
      items.push({ color: '#D9A441', label: 'Predio' });
    if (capas.terrariumElev)
      items.push({ color: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)', label: 'Elevación SRTM' });
    if (capas.shaderElev && datosShader)
      items.push({ color: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)', label: 'Elevación' });
    if (capas.shaderPend && datosShader)
      items.push({ color: 'linear-gradient(90deg,#4CAF50,#FFEB3B,#F44336)', label: 'Pendiente' });
    const catVistas = new Set<string>();
    zonasFiltradas.forEach(z => {
      const key = z.categoria;
      if (!catVistas.has(key)) {
        catVistas.add(key);
        items.push({ color: z.color ?? CATEGORIAS_ZONA[z.categoria].color, label: CATEGORIAS_ZONA[z.categoria].label });
      }
    });
    const tiposVistos = new Set<string>();
    sectoresFiltrados.forEach(s => {
      const key = s.tipo;
      if (!tiposVistos.has(key)) {
        tiposVistos.add(key);
        items.push({ color: s.color ?? TIPOS_SECTOR[s.tipo].color, dash: true, label: TIPOS_SECTOR[s.tipo].label });
      }
    });
    caminosFiltrados.forEach(c => items.push({ color: c.color, label: c.nombre }));
    pinesFiltrados.forEach(p => items.push({ icon: p.icono, label: p.nombre }));
    return items;
  }, [capas, mojones.length, datosShader, zonasFiltradas, sectoresFiltrados, caminosFiltrados, pinesFiltrados]);

  return (
    <div className="flex h-screen overflow-hidden bg-bone-50">
      {/* ─── Panel lateral izquierdo ─────────────────────────────────────────── */}
      <aside className={`flex flex-col border-r border-bone-200 bg-bone-50 shrink-0 transition-all duration-200 ${panelAbierto ? 'w-80' : 'w-0 overflow-hidden'}`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-bone-200 flex items-start justify-between shrink-0">
          <div className="min-w-0">
            <p className="eyebrow">Arte y Tierra</p>
            <h1 className="font-display text-xl text-ink-950 mt-0.5">Análisis de Terreno</h1>
            {(proyectoActual?.nombre || userName) && (
              <p className="text-xs text-moss-700 mt-1 truncate max-w-[13rem]">
                {proyectoActual ? proyectoActual.nombre : userName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            {mojones.length > 0 && (
              <button onClick={handleVerInforme} title="Ver informe PDF" className="text-ink-700/40 hover:text-moss-700 transition-colors">
                <FileText className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleLogout} title="Cerrar sesión" className="text-ink-700/40 hover:text-ink-700 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs — 2 filas */}
        <div className="px-3 py-2 border-b border-bone-200 shrink-0 space-y-1">
          <div className="flex gap-0.5 bg-bone-100 p-1 rounded-lg">
            {TABS_ANALISIS.map(t => (
              <button key={t.id} className={tabBtnClass(t.id)} onClick={() => setTab(t.id)}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-0.5 bg-bone-100 p-1 rounded-lg">
            {TABS_DISENO.map(t => (
              <button key={t.id} className={tabBtnClass(t.id)} onClick={() => setTab(t.id)}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'mojones' && (
            <div className="px-4 py-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Mojones</h2>
                    <span className="text-xs text-moss-700 bg-moss-100 px-2 py-0.5 rounded-full font-medium">{mojones.length}</span>
                  </div>
                  {mojones.length > 0 && (
                    <button onClick={limpiarTodo} className="text-xs text-ink-700/40 hover:text-danger-500 flex items-center gap-1 transition-colors">
                      <Trash2 className="w-3 h-3" />Limpiar
                    </button>
                  )}
                </div>
                {mojones.length === 0 ? (
                  <p className="text-xs text-ink-700/50 text-center py-4 leading-relaxed">
                    Agregá mojones con el formulario<br />o haciendo clic en el mapa.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {mojones.map(m => (
                      <MojonItem key={m.id} mojon={m}
                        seleccionado={seleccionado === m.id}
                        onSelect={() => setSeleccionado(s => s === m.id ? null : m.id)}
                        onDelete={() => eliminarMojon(m.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-bone-200 pt-4">
                <MojonForm modoClick={modoClick} onToggleModoClick={() => setModoClick(p => !p)} onAgregar={agregarMojon} />
              </div>
              {metricas && (
                <div className="border-t border-bone-200 pt-4">
                  <PoligonoPanel metricas={metricas} />
                </div>
              )}
              {/* Pines de referencia */}
              <div className="border-t border-bone-200 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Puntos de referencia</p>
                  <span className="text-xs text-moss-700 bg-moss-100 px-2 py-0.5 rounded-full font-medium">{pines.length}</span>
                </div>
                <button
                  onClick={() => { setModoPinClick(true); setModoClick(false); }}
                  disabled={modoPinClick}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    modoPinClick ? 'bg-sun-500 text-ink-950 cursor-default' : 'bg-moss-700 hover:bg-moss-900 text-bone-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {modoPinClick ? 'Hacé clic en el mapa…' : 'Agregar pin'}
                </button>
                {modoPinClick && (
                  <button onClick={() => setModoPinClick(false)} className="w-full text-xs text-ink-700/50 hover:text-ink-700 py-1 transition-colors">
                    Cancelar
                  </button>
                )}
                {pines.length > 0 && (
                  <div className="space-y-1.5">
                    {pines.map(p => (
                      <PinItem key={p.id} pin={p}
                        editando={pinEditId === p.id}
                        onEdit={() => setPinEditId(id => id === p.id ? null : p.id)}
                        onUpdate={campo => setPines(prev => prev.map(x => x.id === p.id ? { ...x, ...campo } : x))}
                        onDelete={() => { setPines(prev => prev.filter(x => x.id !== p.id)); if (pinEditId === p.id) setPinEditId(null); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'clima' && <div className="px-4 py-4"><ClimaPanel mojones={mojones} datos={datosClima} onDatos={setDatosClima} /></div>}
          {tab === 'topo'  && <div className="px-4 py-4"><TopografiaPanel mojones={mojones} datos={datosTopografia} onDatos={setDatosTopografia} cargando={topoLoading} onCargando={setTopoLoading} error={topoError} onError={setTopoError} /></div>}
          {tab === 'suelo' && <div className="px-4 py-4"><SuelosPanel mojones={mojones} datos={datosSuelo} onDatos={setDatosSuelo} cargando={sueloLoading} onCargando={setSueloLoading} error={sueloError} onError={setSueloError} /></div>}
          {tab === 'cal'   && <div className="px-4 py-4"><CalendarioPanel datosClima={datosClima} onIrAClima={() => setTab('clima')} /></div>}
          {tab === 'solar' && <div className="px-4 py-4"><SolarPanel mojones={mojones} datosClima={datosClima} /></div>}
          {tab === 'agua'  && <div className="px-4 py-4"><CaptacionPanel datosClima={datosClima} onIrAClima={() => setTab('clima')} onSnapshot={setCaptacionSnap} /></div>}

          {tab === 'zonas' && (
            <div className="px-4 py-4">
              <ZonificacionPanel
                zonas={zonas} onZonas={setZonas} modoZona={modoZona}
                onIniciarDibujo={handleIniciarZona} onFinalizarZona={handleFinalizarZona} onCancelarZona={handleCancelarZona}
              />
            </div>
          )}
          {tab === 'sectores' && (
            <div className="px-4 py-4">
              <SectoresPanel
                mojones={mojones} datosClima={datosClima} datosTopografia={datosTopografia}
                sectores={sectores} onSectores={setSectores} modoSector={modoSector}
                onIniciarDibujo={handleIniciarSector} onFinalizarSector={handleFinalizarSector} onCancelarSector={handleCancelarSector}
              />
            </div>
          )}
          {tab === 'aguadas' && (
            <div className="px-4 py-4">
              <AguadasPanel mojones={mojones} datosTopografia={datosTopografia} datosClima={datosClima} onIrATopo={() => setTab('topo')} />
            </div>
          )}
          {tab === 'caminos' && (
            <div className="px-4 py-4">
              <CaminosPanel
                caminos={caminos} onCaminos={setCaminos} modoCamino={modoCamino}
                onIniciarDibujo={handleIniciarCamino} onFinalizarCamino={handleFinalizarCamino} onCancelarCamino={handleCancelarCamino}
              />
            </div>
          )}
          {tab === 'proyectos' && (
            <div className="px-4 py-4">
              <ProyectosPanel
                mojones={mojones} proyectoActual={proyectoActual}
                onCargarProyecto={handleCargarProyecto} onProyectoActualChange={setProyectoActual}
                metadatos={metadatos}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Toggle panel izquierdo */}
      <button
        onClick={() => setPanelAbierto(p => !p)}
        className="absolute top-1/2 -translate-y-1/2 z-[1100] bg-white border border-bone-200 rounded-r-lg px-1 py-3 text-moss-700 hover:bg-bone-50 shadow-paper transition-all duration-200 no-print"
        style={{ left: panelAbierto ? '320px' : '0' }}
        title={panelAbierto ? 'Ocultar panel' : 'Mostrar panel'}
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${panelAbierto ? 'rotate-180' : ''}`} />
      </button>

      {/* ─── Mapa ─────────────────────────────────────────────────────────────── */}
      <main id="print-capture-root" className="flex-1 relative overflow-hidden">
        {/* Banner de modo dibujo */}
        {(modoClick || dibujando) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] text-sm px-5 py-2.5 rounded-full shadow-raised font-medium pointer-events-none bg-sun-500 text-ink-950 no-print">
            {modoZona    ? `Dibujando zona — clic en mapa (${modoZona.vertices.length} vértices)`   :
             modoSector  ? `Dibujando sector — clic en mapa (${modoSector.vertices.length} vértices)` :
             modoCamino  ? `Trazando camino — clic en mapa (${modoCamino.vertices.length} puntos)`  :
             modoPinClick? 'Hacé clic en el mapa para colocar el pin' :
             modoDibujo && modoDibujo !== 'seleccion'
               ? `Dibujando ${modoDibujo} — ${dibujoEnCurso?.vertices.length ?? 0} puntos`
               :            'Hacé clic en el mapa para agregar un mojón'}
          </div>
        )}

        {/* ── Barra de herramientas de dibujo (flotante izquierda) ── */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[1000] no-print" style={{ pointerEvents: 'none' }}>
          <DibujoToolbar
            modoDibujo={modoDibujo}
            colorActivo={colorDibujo}
            enCurso={dibujoEnCurso}
            seleccionado={dibujoSelId}
            onModo={handleCambiarModo}
            onColor={setColorDibujo}
            onFinalizar={handleFinalizarDibujo}
            onCancelar={handleCancelarDibujo}
            onEliminar={handleEliminarDibujo}
          />
        </div>

        {/* ── Panel derecho: Capas / Sugerencias ── */}
        <div className="absolute top-14 right-3 z-[1000] no-print">
          {/* Botón toggle */}
          {panelDerecho === null && (
            <button
              onClick={() => setPanelDerecho('capas')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md text-[11px] font-semibold transition-colors border bg-white/95 text-ink-700 border-white/30 hover:bg-bone-50"
            >
              <Layers className="w-3.5 h-3.5" />
              Capas
            </button>
          )}

          {/* Panel de Capas */}
          {panelDerecho === 'capas' && (
            <PanelCapas
              capas={capas} onCapas={setCapas}
              zonas={zonas} sectores={sectores} pines={pines} caminos={caminos}
              ocultosIds={ocultosIds} onToggle={toggleOculto}
              datosShader={datosShader} shaderLoading={shaderLoading} shaderError={shaderError}
              onFetchShader={handleFetchShader} mojones={mojones}
              datosSugerencias={datosSugerencias}
              onVerSugerencias={() => setPanelDerecho('sugerencias')}
              onCapturar={() => { setPanelDerecho(null); setCapturaActiva(true); if (!capturaTitulo) setCapturaTitulo(proyectoActual?.nombre ?? 'Mapa del terreno'); }}
              onCerrar={() => setPanelDerecho(null)}
            />
          )}

          {/* Panel de Sugerencias */}
          {panelDerecho === 'sugerencias' && datosSugerencias && (
            <SugerenciasPanel
              datos={datosSugerencias}
              onAgregarPin={handleAgregarPinSugerencia}
              onAgregarCamino={handleAgregarCaminoSugerencia}
              onVolver={() => setPanelDerecho('capas')}
            />
          )}
        </div>

        {/* ── Overlay de captura ── */}
        {capturaActiva && (
          <>
            {/* Título editable (top-left) */}
            <div id="captura-titulo" className="absolute top-4 left-4 z-[999] pointer-events-auto bg-white/92 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 max-w-xs">
              <p className="text-[9px] text-ink-700/40 uppercase tracking-wider mb-1 font-semibold no-print">Título del mapa</p>
              <input
                value={capturaTitulo}
                onChange={e => setCapturaTitulo(e.target.value)}
                placeholder="Nombre del terreno…"
                className="text-base font-display text-ink-900 bg-transparent border-b border-ink-700/20 focus:outline-none focus:border-moss-700 w-full no-print"
              />
              <p className="font-display text-base text-ink-900 hidden print:block">{capturaTitulo}</p>
              <p className="text-[9px] text-ink-700/40 mt-0.5 font-mono no-print">{new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-[9px] text-ink-700/40 mt-0.5 font-mono">{new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Leyenda (bottom-right) */}
            {leyendaItems.length > 0 && (
              <div id="captura-leyenda" className="absolute bottom-4 right-4 z-[999] bg-white/92 backdrop-blur-sm rounded-xl shadow-lg px-3 py-3 min-w-[160px] max-w-[200px]">
                <p className="text-[9px] font-bold text-ink-800 uppercase tracking-wider mb-2">Leyenda</p>
                <div className="space-y-1">
                  {leyendaItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.icon ? (
                        <span className="text-sm leading-none w-4 text-center">{item.icon}</span>
                      ) : item.dash ? (
                        <span className="w-4 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: item.color }} />
                      ) : (
                        <span className="w-4 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
                      )}
                      <span className="text-[10px] text-ink-800 leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-ink-700/30 mt-2 font-mono italic">Arte y Tierra</p>
              </div>
            )}

            {/* Controles de captura (top-right, ocultos al imprimir) */}
            <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 no-print">
              <button
                onClick={handleCapturaMap}
                className="flex items-center gap-1.5 px-3 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Imprimir / Guardar
              </button>
              <button
                onClick={() => setCapturaActiva(false)}
                className="p-2 bg-white border border-bone-200 hover:bg-bone-50 text-ink-700 rounded-lg shadow-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        <MapLeaflet
          mojones={mojones}
          seleccionado={seleccionado}
          onClickMapa={handleMapClick}
          onSeleccionar={setSeleccionado}
          zonas={zonasFiltradas}
          zonaEnDibujado={modoZona?.vertices ?? null}
          sectores={sectoresFiltrados}
          sectorEnDibujado={modoSector?.vertices ?? null}
          pines={pinesFiltrados}
          onEditarPin={handleEditarPin}
          caminos={caminosFiltrados}
          caminoEnDibujado={modoCamino?.vertices ?? null}
          dibujando={!!dibujando}
          datosShader={datosShader}
          datosEscorrentia={datosEscorrentia}
          datosSugerencias={datosSugerencias}
          capas={capas}
          dibujos={dibujos}
          dibujoEnCurso={dibujoEnCurso}
          dibujoSelId={dibujoSelId}
          onClickDibujo={handleClickDibujo}
          onMoverDibujo={handleMoverDibujo}
          modoDibujo={modoDibujo}
          colorDibujo={colorDibujo}
          elevMin={datosShader?.elev_min ?? 0}
          elevMax={datosShader?.elev_max ?? 500}
        />
      </main>
    </div>
  );
}

// ─── Fila de mojón ────────────────────────────────────────────────────────────

function MojonItem({ mojon, seleccionado, onSelect, onDelete }: {
  mojon: Mojon; seleccionado: boolean; onSelect: () => void; onDelete: () => void;
}) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${seleccionado ? 'bg-moss-100 border-moss-300' : 'bg-white border-bone-200 hover:border-moss-200'}`}>
      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${seleccionado ? 'bg-sun-500 text-ink-950' : 'bg-moss-700 text-bone-50'}`}>
        {mojon.numero}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-ink-700 leading-none truncate">{decimalAGMS(mojon.lat, true)} {decimalAGMS(mojon.lng, false)}</p>
        <p className="text-xs font-mono text-ink-700/50 leading-none mt-0.5 truncate">{mojon.lat.toFixed(5)}, {mojon.lng.toFixed(5)}</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(); }} className="shrink-0 text-ink-700/25 hover:text-danger-500 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Fila de pin ──────────────────────────────────────────────────────────────

function PinItem({ pin, editando, onEdit, onUpdate, onDelete }: {
  pin: Pin; editando: boolean; onEdit: () => void;
  onUpdate: (campo: Partial<Pin>) => void; onDelete: () => void;
}) {
  const inputCls = 'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <span className="text-base leading-none">{pin.icono}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-900 truncate">{pin.nombre}</p>
          <p className="text-[9px] font-mono text-ink-700/40">{pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}</p>
        </div>
        <button onClick={onEdit} className="shrink-0 text-ink-700/30 hover:text-moss-700 transition-colors">
          <PenLine className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="shrink-0 text-ink-700/30 hover:text-clay-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {editando && (
        <div className="border-t border-bone-200 p-2.5 space-y-2">
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Nombre</label>
            <input className={inputCls} value={pin.nombre} onChange={e => onUpdate({ nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Ícono</label>
            <div className="flex flex-wrap gap-1">
              {ICONOS_PIN.map(ic => (
                <button key={ic} onClick={() => onUpdate({ icono: ic })}
                  className={`text-base px-1.5 py-0.5 rounded transition-colors ${pin.icono === ic ? 'bg-moss-100 ring-1 ring-moss-400' : 'hover:bg-bone-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Color del marcador</label>
            <div className="flex items-center gap-2">
              <input type="color" value={pin.color} onChange={e => onUpdate({ color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-bone-200 p-0.5" />
              <span className="text-[10px] font-mono text-ink-700/50">{pin.color}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Notas</label>
            <textarea className={inputCls + ' resize-none'} rows={2} value={pin.notas} onChange={e => onUpdate({ notas: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel de capas estilo Photoshop ─────────────────────────────────────────

interface PanelCapasProps {
  capas:             CapasVisibles;
  onCapas:           (c: CapasVisibles) => void;
  zonas:             Zona[];
  sectores:          Sector[];
  pines:             Pin[];
  caminos:           Camino[];
  ocultosIds:        Set<string>;
  onToggle:          (id: string) => void;
  datosShader:       DatosShader | null;
  shaderLoading:     boolean;
  shaderError:       string | null;
  onFetchShader:     () => void;
  mojones:           Mojon[];
  datosSugerencias:  ResultadoSugerencias | null;
  onVerSugerencias:  () => void;
  onCapturar:        () => void;
  onCerrar:          () => void;
}

function PanelCapas({
  capas, onCapas, zonas, sectores, pines, caminos,
  ocultosIds, onToggle,
  datosShader, shaderLoading, shaderError, onFetchShader, mojones,
  datosSugerencias, onVerSugerencias,
  onCapturar, onCerrar,
}: PanelCapasProps) {
  const [exp, setExp] = useState({ topo: true, terreno: false, zonas: true, sectores: true, caminos: true, pines: true, hidrico: true, sugerencias: true });
  const tog = (k: keyof typeof exp) => setExp(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="w-56 bg-white/97 backdrop-blur-sm rounded-xl shadow-xl border border-bone-200 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-ink-950 border-b border-ink-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-bone-300" />
          <span className="text-[10px] font-bold text-bone-100 uppercase tracking-widest">Capas</span>
        </div>
        <button onClick={onCerrar} className="text-bone-400 hover:text-bone-100 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Grupos */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Topografía ── */}
        <CapaGrupo
          label="Topografía"
          visible={capas.shaderElev || capas.shaderPend || capas.terrariumElev}
          onToggleVisible={() => onCapas({ ...capas, shaderElev: false, shaderPend: false, terrariumElev: false })}
          expanded={exp.topo} onExpand={() => tog('topo')}
        >
          {/* Terrarium: siempre disponible, no requiere cálculo */}
          <CapaItem
            visible={capas.terrariumElev}
            onToggle={() => onCapas({ ...capas, terrariumElev: !capas.terrariumElev })}
            label="Hipsométrico SRTM"
            swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)' }} />}
          />
          {datosShader ? (
            <>
              <CapaItem
                visible={capas.shaderElev}
                onToggle={() => capas.shaderElev
                  ? onCapas({ ...capas, shaderElev: false })
                  : onCapas({ ...capas, shaderElev: true, shaderPend: false })}
                label="Elevación"
                swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: 'linear-gradient(90deg,#1565C0 0%,#66BB6A 40%,#FFEE58 70%,#8D6E63 100%)' }} />}
              />
              <CapaItem
                visible={capas.shaderPend}
                onToggle={() => capas.shaderPend
                  ? onCapas({ ...capas, shaderPend: false })
                  : onCapas({ ...capas, shaderPend: true, shaderElev: false })}
                label="Pendiente"
                swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: 'linear-gradient(90deg,#4CAF50 0%,#FFEB3B 50%,#F44336 100%)' }} />}
              />
              <button
                onClick={() => { onFetchShader(); }}
                disabled={shaderLoading || mojones.length < 3}
                className="mx-3 mb-2 mt-1 w-[calc(100%-24px)] flex items-center justify-center gap-1 py-1 bg-bone-100 hover:bg-bone-200 disabled:opacity-40 text-ink-700 rounded text-[9px] font-medium transition-colors"
              >
                {shaderLoading
                  ? <><span className="w-2.5 h-2.5 border border-ink-700 border-t-transparent rounded-full animate-spin" />Calculando…</>
                  : <><Mountain className="w-2.5 h-2.5" />Recalcular</>}
              </button>
            </>
          ) : (
            <div className="px-3 pt-1 pb-2.5 space-y-1.5">
              {shaderError && <p className="text-[9px] text-clay-600 leading-tight">{shaderError}</p>}
              <button
                onClick={onFetchShader}
                disabled={shaderLoading || mojones.length < 3}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-[10px] font-medium transition-colors"
              >
                {shaderLoading
                  ? <><span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />Calculando…</>
                  : <><Mountain className="w-2.5 h-2.5" />Calcular topografía</>}
              </button>
              {mojones.length < 3 && (
                <p className="text-[9px] text-ink-700/40 text-center">Necesitás al menos 3 mojones.</p>
              )}
            </div>
          )}
        </CapaGrupo>

        {/* ── Análisis Hídrico ── */}
        {datosShader && (
          <CapaGrupo
            label="Análisis Hídrico"
            visible={capas.escorrentias}
            onToggleVisible={() => onCapas({ ...capas, escorrentias: !capas.escorrentias })}
            expanded={exp.hidrico} onExpand={() => tog('hidrico')}
          >
            <CapaItem
              visible={capas.escorrentias}
              onToggle={() => onCapas({ ...capas, escorrentias: !capas.escorrentias })}
              label="Escorrentías de agua"
              swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: 'linear-gradient(90deg,#64B5F6,#0D47A1)' }} />}
            />
          </CapaGrupo>
        )}

        {/* ── Sugerencias ── */}
        {datosShader && (
          <CapaGrupo
            label="Sugerencias"
            visible={capas.sugerencias}
            onToggleVisible={() => onCapas({ ...capas, sugerencias: !capas.sugerencias })}
            expanded={exp.sugerencias} onExpand={() => tog('sugerencias')}
          >
            <CapaItem visible={capas.sugerencias}
              onToggle={() => onCapas({ ...capas, sugerencias: !capas.sugerencias })}
              label="Vivienda, Reservorio, Acceso"
              swatch={<span className="text-sm leading-none">🏠💧</span>}
            />
            {datosSugerencias && (
              <button
                onClick={onVerSugerencias}
                className="mx-3 mb-2 mt-1 w-[calc(100%-24px)] flex items-center justify-center gap-1 py-1.5 bg-ink-900 hover:bg-ink-700 text-bone-50 rounded-lg text-[10px] font-semibold transition-colors"
              >
                Ver análisis completo →
              </button>
            )}
          </CapaGrupo>
        )}

        {/* ── Terreno ── */}
        <CapaGrupo
          label="Terreno"
          visible={capas.terreno}
          onToggleVisible={() => onCapas({ ...capas, terreno: !capas.terreno })}
          expanded={exp.terreno} onExpand={() => tog('terreno')}
        >
          <div className="flex items-center gap-2 pl-7 pr-3 py-1 pb-2">
            <span className="w-5 h-3 rounded-sm shrink-0 border-2" style={{ borderColor: '#D9A441', background: 'rgba(58,90,64,0.15)' }} />
            <span className="text-[10px] text-ink-700/60">Polígono del predio</span>
          </div>
        </CapaGrupo>

        {/* ── Zonas ── */}
        {zonas.length > 0 && (
          <CapaGrupo
            label={`Zonas`} count={zonas.length}
            visible={capas.zonas}
            onToggleVisible={() => onCapas({ ...capas, zonas: !capas.zonas })}
            expanded={exp.zonas} onExpand={() => tog('zonas')}
          >
            {zonas.map(z => (
              <CapaItem key={z.id}
                visible={!ocultosIds.has(z.id) && capas.zonas}
                onToggle={() => onToggle(z.id)}
                label={z.nombre}
                swatch={<span className="w-3 h-3 rounded-sm shrink-0" style={{ background: z.color ?? CATEGORIAS_ZONA[z.categoria].color }} />}
              />
            ))}
          </CapaGrupo>
        )}

        {/* ── Sectores ── */}
        {sectores.length > 0 && (
          <CapaGrupo
            label="Sectores" count={sectores.length}
            visible={capas.sectores}
            onToggleVisible={() => onCapas({ ...capas, sectores: !capas.sectores })}
            expanded={exp.sectores} onExpand={() => tog('sectores')}
          >
            {sectores.map(s => (
              <CapaItem key={s.id}
                visible={!ocultosIds.has(s.id) && capas.sectores}
                onToggle={() => onToggle(s.id)}
                label={s.nombre}
                swatch={<span className="w-3 h-3 rounded-sm shrink-0 border border-dashed" style={{ borderColor: s.color ?? TIPOS_SECTOR[s.tipo].color, background: `${s.color ?? TIPOS_SECTOR[s.tipo].color}22` }} />}
              />
            ))}
          </CapaGrupo>
        )}

        {/* ── Caminos ── */}
        {caminos.length > 0 && (
          <CapaGrupo
            label="Caminos" count={caminos.length}
            visible={capas.caminos}
            onToggleVisible={() => onCapas({ ...capas, caminos: !capas.caminos })}
            expanded={exp.caminos} onExpand={() => tog('caminos')}
          >
            {caminos.map(c => (
              <CapaItem key={c.id}
                visible={!ocultosIds.has(c.id) && capas.caminos}
                onToggle={() => onToggle(c.id)}
                label={c.nombre}
                swatch={<span className="w-5 h-0 border-t-2 shrink-0" style={{ borderColor: c.color }} />}
              />
            ))}
          </CapaGrupo>
        )}

        {/* ── Pines ── */}
        {pines.length > 0 && (
          <CapaGrupo
            label="Pines" count={pines.length}
            visible={capas.pines}
            onToggleVisible={() => onCapas({ ...capas, pines: !capas.pines })}
            expanded={exp.pines} onExpand={() => tog('pines')}
          >
            {pines.map(p => (
              <CapaItem key={p.id}
                visible={!ocultosIds.has(p.id) && capas.pines}
                onToggle={() => onToggle(p.id)}
                label={p.nombre}
                swatch={<span className="text-sm leading-none">{p.icono}</span>}
              />
            ))}
          </CapaGrupo>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-2.5 border-t border-bone-200 bg-bone-50">
        <button
          onClick={onCapturar}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-ink-950 hover:bg-ink-800 text-bone-50 rounded-lg text-[10px] font-semibold transition-colors"
        >
          <Camera className="w-3 h-3" />
          Capturar mapa
        </button>
      </div>
    </div>
  );
}

// ─── Subcomponentes del panel de capas ────────────────────────────────────────

function CapaGrupo({ label, count, visible, onToggleVisible, expanded, onExpand, children }: {
  label: string; count?: number; visible: boolean;
  onToggleVisible: () => void; expanded: boolean; onExpand: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-bone-100">
      <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-bone-50 select-none">
        <button
          onClick={e => { e.stopPropagation(); onToggleVisible(); }}
          className={`shrink-0 transition-colors ${visible ? 'text-moss-700' : 'text-ink-700/20'}`}
          title={visible ? 'Ocultar grupo' : 'Mostrar grupo'}
        >
          {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button onClick={onExpand} className="flex-1 flex items-center gap-1 min-w-0">
          <ChevronRight className={`w-2.5 h-2.5 text-ink-700/30 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <span className="text-[10px] font-semibold text-ink-800 uppercase tracking-wider truncate">{label}</span>
          {count != null && count > 0 && (
            <span className="text-[8px] bg-bone-200 text-ink-700/50 px-1 py-0.5 rounded-full shrink-0">{count}</span>
          )}
        </button>
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
}

function CapaItem({ visible, onToggle, label, swatch }: {
  visible: boolean; onToggle: () => void; label: string; swatch?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 pl-6 pr-3 py-1 hover:bg-bone-50">
      <button onClick={onToggle} className={`shrink-0 transition-colors ${visible ? 'text-moss-600' : 'text-ink-700/15'}`}>
        {visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
      </button>
      {swatch && <span className="shrink-0 flex items-center">{swatch}</span>}
      <span className={`text-[10px] truncate leading-tight ${visible ? 'text-ink-800' : 'text-ink-700/30'}`}>{label}</span>
    </div>
  );
}
