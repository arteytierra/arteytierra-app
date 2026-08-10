'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Trash2, LogOut, Map, ChevronRight, MapPin, Cloud,
  FolderOpen, Mountain, Droplets, FileText, CalendarDays,
  Layers, Sun, LayoutGrid, Compass, Waves, Route,
  Eye, EyeOff, Camera, X, PenLine, Undo2, Redo2, Wheat, Leaf,
  FileDown, FileUp, ImagePlus, Save, Download, Share2, ChevronDown, CloudOff, Check,
  Waypoints, Boxes, Moon, Palette, GripVertical, Spline, Sprout, Trees, Bird, SunDim,
  IdCard, DollarSign, Wind, TriangleAlert, HelpCircle, BookOpen, Keyboard, Lock, Ruler, Flame,
  CloudRain, TreePine, Shapes, Briefcase, Target, Container, Sparkles, TreeDeciduous, ClipboardList,
} from 'lucide-react';
import { MojonForm } from './MojonForm';
import { PoligonoPanel } from './PoligonoPanel';
import { ProyectosPanel } from './ProyectosPanel';
import { BuscadorLugar, type ResultadoBusqueda } from './BuscadorLugar';
import { ClimaPanel } from './ClimaPanel';
import { ContextoPanel } from './ContextoPanel';
import { TopografiaPanel } from './TopografiaPanel';
import { CaptacionPanel } from './CaptacionPanel';
import { CalendarioPanel } from './CalendarioPanel';
import { ProduccionPanel } from './ProduccionPanel';
import { AptitudPanel } from './AptitudPanel';
import { SuelosPanel } from './SuelosPanel';
import { SolarPanel } from './SolarPanel';
import { ZonificacionPanel } from './ZonificacionPanel';
import { SectoresPanel } from './SectoresPanel';
import { SitiosRepresaPanel } from './SitiosRepresaPanel';
import { AnalisisRelievePanel } from './AnalisisRelievePanel';
import { CaminosPanel } from './CaminosPanel';
import { RedAguaPanel } from './RedAguaPanel';
import { PastoreoPanel } from './PastoreoPanel';
import { RiegoPanel } from './RiegoPanel';
import { CoberturaPanel } from './CoberturaPanel';
import { EntornoPanel } from './EntornoPanel';
import { SombrasPanel } from './SombrasPanel';
import type { ObjetoSombra } from '@/lib/objetosSombra';
import { calcularViewshed, type ResultadoViewshed } from '@/lib/viewshed';
import { calcularMetricas } from '@/lib/geometria';
import * as turf from '@turf/turf';
import { decimalAGMS } from '@/lib/coordenadas';
import { getSupabaseBrowserClient } from '@/lib/db/browser';
import { guardarInformeBorrador } from '@/lib/informe';
import { useAutosave } from '@/hooks/useAutosave';
import { useCapas } from '@/hooks/useCapas';
import { useSombras } from '@/hooks/useSombras';
import { usePerfilElevacion } from '@/hooks/usePerfilElevacion';
import { useCuenca } from '@/hooks/useCuenca';
import { useCadSnap } from '@/hooks/useCadSnap';
import { crearZona, actualizarAreaZona, CATEGORIAS_ZONA } from '@/lib/zonificacion';
import { crearPin, ICONOS_PIN, type Pin } from '@/lib/pines';
import { crearCamino, type Camino } from '@/lib/caminos';
import { PerfilPanel } from './PerfilPanel';
import { calcularArcoSolar, calcularRadioArco, type DatosArcoSolar } from '@/lib/arco_solar';
import { fetchShader, shaderDesdeGrilla, shaderDesdeDEM, type DatosShader } from '@/lib/shaders';
import { calcularCurvas, intervaloAutomatico, intervaloConfiablePara, nivelesEstimados, MAX_NIVELES, type CurvaNivel } from '@/lib/curvasNivel';
import type { DEMImportado } from '@/lib/demImport';
import { obtenerGrillaDensa, grillaDesdeShader, ETIQUETA_RELIEVE, type GrillaElevacion } from '@/lib/grillaElevacion';
import { calcularAptitud, COLORES_APTITUD, type ResultadoAptitud } from '@/lib/aptitud';
import type { CortinaSugerida } from '@/lib/produccion';
import { calcularEscorrentias, type DatosEscorrentia } from '@/lib/escorrentias';
import { calcularErosion, CLASES_EROSION, type DatosErosion } from '@/lib/erosion';
import { calcularSwales, type ResultadoSwales, type OpcionesSwales } from '@/lib/swales';
import { calcularCortafuegos, type ResultadoCortafuegos } from '@/lib/cortafuegos';
import { celdaEnPunto, type Cuenca } from '@/lib/cuenca';
import { simplificarAnillo, sugerirCaminoRelieve, sugerirCaminosAcceso, analizarRelieve, type AnalisisTopoIntegral, type ZonaVivienda } from '@/lib/cuencaHidro';
import { CuencaPanel } from './CuencaPanel';
import type { RedAguaResumen, RedAguaInputs } from '@/lib/hidraulica';
import type { RepresaResumen } from '@/lib/represa';
import type { RiegoResumen, RiegoInputs } from '@/lib/riego';
import type { PastoreoInputs } from '@/lib/pastoreo';
import type { PotrerosLayout } from '@/lib/potreros';
import type { DatosCobertura, CoberturaResumen } from '@/lib/cobertura';
import type { DatosEntorno, EntornoResumen } from '@/lib/entorno';
import { MasterPlanPanel } from './MasterPlanPanel';
import { DibujoToolbar } from './DibujoToolbar';
import { PerfilProfesionalModal } from './PerfilProfesionalModal';
import { leerPerfil } from '@/lib/profesional';
import { EconomiaPanel } from './EconomiaPanel';
import { CarbonoPanel } from './CarbonoPanel';
import type { EconomiaResumen } from '@/lib/economia';
import type { CarbonoResumen } from '@/lib/carbono';
import { ComandoPalette, AtajosAyuda, type Comando } from './ComandoPalette';
import { KeylinePanel } from './KeylinePanel';
import { SwalesPanel } from './SwalesPanel';
import { CortafuegosPanel } from './CortafuegosPanel';
import { EscalaPermanenciaPanel, type KeylineCheck } from './EscalaPermanenciaPanel';
import { CutFillPanel, type PoligonoCutFill } from './CutFillPanel';
import { EscenariosPanel, type EscenarioMeta } from './EscenariosPanel';
import { BLOQUES, GRUPOS_BLOQUE, type BloqueDef } from '@/lib/bloques';
import { ELEMENTOS, GRUPOS_ELEMENTO, type ElementoPreset } from '@/lib/elementos';
import type { ResultadoKeyline } from '@/lib/keyline';
import { Modal, type ModalState } from './Modal';
import type { ElementoDibujo, DibujoEnCurso, TipoDibujo } from '@/lib/dibujos';
import { COLORES_DIBUJO, distanciaMetros, medidasDibujo } from '@/lib/dibujos';
import { centroideDibujo, aplicarTransformacion, type TransformarOp } from '@/lib/transformaciones';
import { exportarDXF, parsearDXF } from '@/lib/dxf';
import type { OverlayImagen } from './MapLeaflet';
import { CAPA_DEFAULT_ID, CAPAS_USUARIO_INICIAL, crearCapaUsuario, capaDeElemento, crearCapasKeyline, type CapaUsuario } from '@/lib/capasUsuario';
import { calcularMasterPlan, conectarMasterPlan, TIPOS_ITEM, type ItemPrograma, type ElementoMasterPlan, type CaminoMasterPlan } from '@/lib/masterplan';
import type { ElementoAguada } from '@/lib/aguadas';
import { useRouter } from 'next/navigation';
import type { Mojon } from '@/lib/types';
import { actualizarProyecto, guardarProyecto } from '@/lib/proyectos';
import type { Proyecto } from '@/lib/proyectos';
import { exportarGeoJSON, exportarKML, exportarGPX } from '@/lib/exportar';
import { aplicarCalibracionPrecip, obtenerPrecipCHIRPS, centroide, type DatosClima, type CalibracionPrecip } from '@/lib/clima';
import type { Extremos } from '@/lib/climaExtremos';
import type { DatosTopografia } from '@/lib/topografia';
import type { CaptacionSnapshot } from '@/lib/captacion';
import type { DatosSuelo } from '@/lib/suelos';
import type { Zona, CategoriaZona } from '@/lib/zonificacion';
import type { Sector, TipoSector } from '@/lib/sectores';
import { TIPOS_SECTOR } from '@/lib/sectores';
import type { CapasVisibles, NavegacionMapa } from './MapLeaflet';
import { ControlesMapa, type CapaFondo } from './ControlesMapa';
import { useHistory } from '@/lib/useHistory';
import { FeatureLock } from './FeatureLock';
import { can, featureDeTab, tabBloqueada, BENEFICIO_FEATURE, type Plan } from '@/lib/entitlements';

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

const Vista3D = dynamic(() => import('./Vista3D').then(m => m.Vista3D), { ssr: false });
const VistaHistorica = dynamic(() => import('./VistaHistorica').then(m => m.VistaHistorica), { ssr: false });

type Tab =
  | 'mojones' | 'clima'  | 'contexto' | 'entorno' | 'topo'    | 'suelo'   | 'cobertura'
  | 'agua'    | 'cal'    | 'solar'   | 'sombras' | 'visibilidad' | 'prod'   | 'aptitud' | 'analisis'
  | 'zonas'   | 'sectores' | 'aguadas' | 'caminos' | 'red' | 'cuenca' | 'pastoreo' | 'riego' | 'swales' | 'keyline'
  | 'infra'   | 'elementos' | 'carbono' | 'economia' | 'proyectos' | 'masterplan' | 'cortafuegos' | 'silvopastura';

interface DocDisenoSnapshot {
  mojones:      Mojon[];
  zonas:        Zona[];
  sectores:     Sector[];
  pines:        Pin[];
  caminos:      Camino[];
  aguadasLayer: ElementoAguada[];
  dibujos:      ElementoDibujo[];
  capasUsuario: CapaUsuario[];
}
interface Escenario { id: string; nombre: string; creado: string; doc: DocDisenoSnapshot }

interface ModoZona    { categoria: CategoriaZona; vertices: Array<{ lat: number; lng: number }> }
interface ModoSector  { tipo: TipoSector;          vertices: Array<{ lat: number; lng: number }> }
interface ModoCamino  { vertices: Array<{ lat: number; lng: number }> }

interface Props { userName: string | null; plan: Plan }

function errMsgApp(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    const parts = [o['message'], o['details'], o['hint'], o['code']].filter(Boolean).map(String);
    if (parts.length) return parts.join(' · ');
  }
  return String(err);
}

// ─── Riel de navegación: definición de tabs y clústeres ─────────────────────
/** Definición visual de cada tab. El `id` es la clave estable que usan
 *  entitlements, snapshots y la paleta (Ctrl+K): NO cambia aunque se reagrupe
 *  el riel o se renombre el label visible. */
const TAB_DEFS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'mojones',     label: 'Mojones',     icon: <MapPin       className="w-3.5 h-3.5" /> },
  { id: 'topo',        label: 'Topografía',  icon: <Mountain     className="w-3.5 h-3.5" /> },
  { id: 'suelo',       label: 'Suelo',       icon: <Layers       className="w-3.5 h-3.5" /> },
  { id: 'cobertura',   label: 'Cobertura',   icon: <Trees        className="w-3.5 h-3.5" /> },
  { id: 'aptitud',     label: 'Aptitud',     icon: <Target       className="w-3.5 h-3.5" /> },
  { id: 'analisis',    label: 'Análisis',    icon: <Sparkles     className="w-3.5 h-3.5" /> },
  { id: 'clima',       label: 'Clima',       icon: <Cloud        className="w-3.5 h-3.5" /> },
  { id: 'cal',         label: 'Calendario',  icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { id: 'cuenca',      label: 'Cuenca',      icon: <Waves        className="w-3.5 h-3.5" /> },
  { id: 'aguadas',     label: 'Represas',    icon: <Container    className="w-3.5 h-3.5" /> },
  { id: 'red',         label: 'Red de agua', icon: <Spline       className="w-3.5 h-3.5" /> },
  { id: 'riego',       label: 'Riego',       icon: <Sprout       className="w-3.5 h-3.5" /> },
  { id: 'swales',      label: 'Swales',      icon: <Ruler        className="w-3.5 h-3.5" /> },
  { id: 'agua',        label: 'Captación',   icon: <Droplets     className="w-3.5 h-3.5" /> },
  { id: 'solar',       label: 'Solar',       icon: <Sun          className="w-3.5 h-3.5" /> },
  { id: 'sombras',     label: 'Sombras',     icon: <SunDim       className="w-3.5 h-3.5" /> },
  { id: 'visibilidad', label: 'Visibilidad', icon: <Eye          className="w-3.5 h-3.5" /> },
  { id: 'contexto',    label: 'Contexto',    icon: <Leaf         className="w-3.5 h-3.5" /> },
  { id: 'entorno',     label: 'Entorno',     icon: <Bird         className="w-3.5 h-3.5" /> },
  { id: 'carbono',     label: 'Carbono',     icon: <Wind         className="w-3.5 h-3.5" /> },
  { id: 'zonas',       label: 'Zonas',       icon: <LayoutGrid   className="w-3.5 h-3.5" /> },
  { id: 'masterplan',  label: 'Master plan', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { id: 'sectores',    label: 'Sectores',    icon: <Compass      className="w-3.5 h-3.5" /> },
  { id: 'caminos',     label: 'Caminos',     icon: <Route        className="w-3.5 h-3.5" /> },
  { id: 'cortafuegos', label: 'Cortafuegos', icon: <Flame        className="w-3.5 h-3.5" /> },
  { id: 'infra',       label: 'Infraestructuras', icon: <Boxes   className="w-3.5 h-3.5" /> },
  { id: 'elementos',   label: 'Elementos',   icon: <TreeDeciduous className="w-3.5 h-3.5" /> },
  { id: 'pastoreo',    label: 'Pastoreo',    icon: <span className="text-[13px] leading-none grayscale opacity-70">🐄</span> },
  { id: 'keyline',     label: 'Keyline',     icon: <Waypoints    className="w-3.5 h-3.5" /> },
  { id: 'prod',        label: 'Producción',  icon: <Wheat        className="w-3.5 h-3.5" /> },
  { id: 'economia',    label: 'Economía',    icon: <DollarSign   className="w-3.5 h-3.5" /> },
  { id: 'proyectos',   label: 'Proyectos',   icon: <FolderOpen   className="w-3.5 h-3.5" /> },
];
const TAB_DEF = new globalThis.Map(TAB_DEFS.map(t => [t.id, t] as const));

/** Clústeres colapsables del riel (acordeón). Reagrupan las 26 pestañas en 6
 *  familias; `mojones` es la entrada base y `proyectos` vive en el header. */
const GRUPOS_RIEL: Array<{ id: string; label: string; corto: string; icon: React.ReactNode; tabs: Tab[] }> = [
  { id: 'ubicacion', label: 'Ubicación',            corto: 'Lugar', icon: <MapPin    className="w-4 h-4" />, tabs: ['mojones'] },
  { id: 'clima',     label: 'Clima',                corto: 'Clima', icon: <CloudRain className="w-4 h-4" />, tabs: ['clima', 'solar'] },
  { id: 'contexto',  label: 'Contexto',             corto: 'Ctxt.', icon: <TreePine  className="w-4 h-4" />, tabs: ['contexto', 'entorno'] },
  { id: 'terreno',   label: 'Terreno',              corto: 'Terr.', icon: <Mountain  className="w-4 h-4" />, tabs: ['topo', 'suelo', 'cobertura', 'aptitud', 'analisis'] },
  { id: 'agua',      label: 'Agua',                 corto: 'Agua',  icon: <Droplets  className="w-4 h-4" />, tabs: ['cuenca', 'aguadas', 'agua', 'red', 'riego', 'swales'] },
  { id: 'diseno',    label: 'Diseño',               corto: 'Dis.',  icon: <Shapes    className="w-4 h-4" />, tabs: ['sectores', 'zonas', 'masterplan', 'caminos', 'cortafuegos', 'visibilidad', 'sombras', 'infra', 'elementos'] },
  { id: 'prod',      label: 'Sistemas productivos', corto: 'Prod.', icon: <Wheat     className="w-4 h-4" />, tabs: ['cal', 'prod', 'pastoreo', 'carbono'] },
  { id: 'keyline',   label: 'Keyline',              corto: 'Keyl.', icon: <Waypoints className="w-4 h-4" />, tabs: ['keyline'] },
  { id: 'presup',    label: 'Presupuesto',          corto: 'Pres.', icon: <Briefcase className="w-4 h-4" />, tabs: ['economia'] },
];
const GRUPO_DE_TAB: Record<string, string> = Object.fromEntries(
  GRUPOS_RIEL.flatMap(g => g.tabs.map(t => [t, g.id] as const)),
);

/** Predio de ejemplo (~4 ha cerca de San Marcos Sierra, Córdoba) para que el
 *  usuario nuevo vea las herramientas funcionando sin tener que dibujar antes. */
const EJEMPLO_MOJONES: Array<{ lat: number; lng: number }> = [
  { lat: -30.78210, lng: -64.63520 },
  { lat: -30.78150, lng: -64.63180 },
  { lat: -30.78380, lng: -64.63110 },
  { lat: -30.78480, lng: -64.63410 },
  { lat: -30.78340, lng: -64.63560 },
];

/** Zoom razonable para encuadrar un resultado de búsqueda según su bbox
 *  [sur, norte, oeste, este]: una provincia se ve alejada; una calle, de cerca. */
function zoomParaBbox(bbox?: [number, number, number, number]): number {
  if (!bbox) return 13;
  const [s, n, w, e] = bbox;
  const span = Math.max(Math.abs(n - s), Math.abs(e - w));
  if (span > 2)    return 8;
  if (span > 0.5)  return 10;
  if (span > 0.15) return 12;
  if (span > 0.03) return 14;
  return 16;
}

export function MapaTerrenoApp({ userName, plan }: Props) {
  const router = useRouter();

  // ─── Mojones ──────────────────────────────────────────────────────────────
  const [modoClick,     setModoClick]     = useState(false);
  const [seleccionado,  setSeleccionado]  = useState<string | null>(null);
  const [panelAbierto,  setPanelAbierto]  = useState(true);
  const [tab,           setTab]           = useState<Tab>('mojones');
  // Acordeón del riel: un solo grupo abierto a la vez (por defecto, Terreno).
  const [grupoRiel,     setGrupoRiel]     = useState<string>('terreno');
  const [proyectoActual,setProyectoActual]= useState<Proyecto | null>(null);

  // ─── Análisis ─────────────────────────────────────────────────────────────
  // El clima crudo de la API y la calibración manual de lluvia se guardan por
  // separado; `datosClima` (lo que consume toda la app) es el derivado. Así la
  // calibración es reversible y nunca se acumula sobre sí misma.
  const [datosClimaRaw,   setDatosClimaRaw]   = useState<DatosClima | null>(null);
  const [calibracionPrecip, setCalibracionPrecip] = useState<CalibracionPrecip | null>(null);
  const datosClima = useMemo(
    () => (datosClimaRaw ? aplicarCalibracionPrecip(datosClimaRaw, calibracionPrecip) : null),
    [datosClimaRaw, calibracionPrecip],
  );
  const [buscandoCHIRPS, setBuscandoCHIRPS] = useState(false);
  const [datosTopografia, setDatosTopografia] = useState<DatosTopografia | null>(null);
  const [topoLoading,     setTopoLoading]     = useState(false);
  const [topoError,       setTopoError]       = useState<string | null>(null);
  const [captacionSnap,   setCaptacionSnap]   = useState<CaptacionSnapshot | null>(null);
  const [datosSuelo,      setDatosSuelo]      = useState<DatosSuelo | null>(null);
  const [sueloLoading,    setSueloLoading]    = useState(false);
  const [sueloError,      setSueloError]      = useState<string | null>(null);
  const [datosExtremos,   setDatosExtremos]   = useState<Extremos | null>(null);

  // ─── Shader topográfico ───────────────────────────────────────────────────
  const [datosShader,   setDatosShader]   = useState<DatosShader | null>(null);
  const [shaderLoading, setShaderLoading] = useState(false);
  // ¿Se corrió el «Análisis del predio»? Recién ahí aparecen las capas de
  // escorrentías + sugerencias. Calcular la topografía sola NO las genera: eso
  // solo prende los shaders y las curvas (info topográfica).
  const [analisisHecho, setAnalisisHecho] = useState(false);
  const [shaderError,   setShaderError]   = useState<string | null>(null);

  // ─── Curvas de nivel (grilla densa Terrarium + fallback shader) ──────────
  const [intervaloContorno, setIntervaloContorno] = useState<number | null>(null); // null = auto
  const [grillaCurvas,      setGrillaCurvas]      = useState<GrillaElevacion | null>(null);
  const [curvasLoading,     setCurvasLoading]     = useState(false);
  const grillaKeyRef = useRef<string>('');
  const [colorCurvas, setColorCurvas] = useState({ normal: '#7B1FA2', maestra: '#4527A0' });

  const [mostrarAptitud, setMostrarAptitud] = useState(false);

  // ─── Rótulo de plano ──────────────────────────────────────────────────────
  interface Rotulo { nombre: string; propietario: string; ubicacion: string; fecha: string; escala: string; autor: string }
  const [rotulo,        setRotulo]        = useState<Rotulo>({ nombre: '', propietario: '', ubicacion: '', fecha: new Date().toLocaleDateString('es-AR'), escala: '', autor: '' });
  const [rotuloVisible, setRotuloVisible] = useState(false);

  // ─── Documento de diseño con historial (undo/redo) ───────────────────────
  interface DocDiseno {
    mojones:      Mojon[];
    zonas:        Zona[];
    sectores:     Sector[];
    pines:        Pin[];
    caminos:      Camino[];
    aguadasLayer: ElementoAguada[];
    dibujos:      ElementoDibujo[];
    capasUsuario: CapaUsuario[];
  }
  const DOC_INICIAL: DocDiseno = { mojones: [], zonas: [], sectores: [], pines: [], caminos: [], aguadasLayer: [], dibujos: [], capasUsuario: CAPAS_USUARIO_INICIAL };
  const { present: doc, commit, replace: replaceDoc, undo, redo, canUndo, canRedo } = useHistory<DocDiseno>(DOC_INICIAL);
  const { mojones, zonas, sectores, pines, caminos, aguadasLayer, dibujos } = doc;
  const capasUsuario = doc.capasUsuario ?? CAPAS_USUARIO_INICIAL;

  // Shims drop-in: misma firma que los useState anteriores, ruteado por historial
  const setMojones      = useCallback((v: Mojon[]           | ((p: Mojon[])           => Mojon[]))           => commit(d => ({ ...d, mojones:      typeof v === 'function' ? v(d.mojones)      : v })), [commit]);
  const setZonas        = useCallback((v: Zona[]            | ((p: Zona[])            => Zona[]))            => commit(d => ({ ...d, zonas:        typeof v === 'function' ? v(d.zonas)        : v })), [commit]);
  const setSectores     = useCallback((v: Sector[]          | ((p: Sector[])          => Sector[]))          => commit(d => ({ ...d, sectores:     typeof v === 'function' ? v(d.sectores)     : v })), [commit]);
  const setPines        = useCallback((v: Pin[]             | ((p: Pin[])             => Pin[]))             => commit(d => ({ ...d, pines:        typeof v === 'function' ? v(d.pines)        : v })), [commit]);
  const setCaminos      = useCallback((v: Camino[]          | ((p: Camino[])          => Camino[]))          => commit(d => ({ ...d, caminos:      typeof v === 'function' ? v(d.caminos)      : v })), [commit]);
  const setAguadasLayer = useCallback((v: ElementoAguada[]  | ((p: ElementoAguada[])  => ElementoAguada[]))  => commit(d => ({ ...d, aguadasLayer: typeof v === 'function' ? v(d.aguadasLayer) : v })), [commit]);
  const setDibujos      = useCallback((v: ElementoDibujo[]  | ((p: ElementoDibujo[])  => ElementoDibujo[]))  => commit(d => ({ ...d, dibujos:      typeof v === 'function' ? v(d.dibujos)      : v })), [commit]);
  const setCapasUsuario = useCallback((v: CapaUsuario[]     | ((p: CapaUsuario[])     => CapaUsuario[]))     => commit(d => ({ ...d, capasUsuario: typeof v === 'function' ? v(d.capasUsuario ?? CAPAS_USUARIO_INICIAL) : v })), [commit]);

  const [modoZona,    setModoZona]    = useState<ModoZona | null>(null);
  const [modoSector,  setModoSector]  = useState<ModoSector | null>(null);
  const [modoPinClick,setModoPinClick]= useState(false);
  const [pinEditId,   setPinEditId]   = useState<string | null>(null);
  const [modoCamino,  setModoCamino]  = useState<ModoCamino | null>(null);
  // ─── Cuenca de aporte (hook useCuenca) ────────────────────────────────────
  const {
    modoCuenca, setModoCuenca,
    cuenca, setCuenca,
    cuencaLoading,
    cuencaAviso, setCuencaAviso,
    cuencaExpandida, setCuencaExpandida,
    procesarCuenca,
    handleExtenderCuenca,
    handleUsarPoligonoCuenca,
  } = useCuenca({ mojones });
  const [muroLinea, setMuroLinea] = useState<[{ lat: number; lng: number }, { lat: number; lng: number }] | null>(null);
  const [modoViewshed, setModoViewshed] = useState(false);
  const [viewshed,    setViewshed]    = useState<ResultadoViewshed | null>(null);
  const [alturaObs,   setAlturaObs]   = useState(1.7);
  const [redAguaResumen, setRedAguaResumen] = useState<RedAguaResumen | null>(null);
  const [represaResumen, setRepresaResumen] = useState<RepresaResumen | null>(null);
  const [riegoResumen,   setRiegoResumen]   = useState<RiegoResumen | null>(null);
  const [riegoInputs,    setRiegoInputs]    = useState<RiegoInputs | null>(null);
  const [redAguaInputs,  setRedAguaInputs]  = useState<RedAguaInputs | null>(null);
  const [potrerosLayer,  setPotrerosLayer]  = useState<PotrerosLayout | null>(null);
  const [pastoreoInputs, setPastoreoInputs] = useState<PastoreoInputs | null>(null);
  const [datosCobertura, setDatosCobertura] = useState<DatosCobertura | null>(null);
  const [coberturaResumen, setCoberturaResumen] = useState<CoberturaResumen | null>(null);
  const [datosEntorno,   setDatosEntorno]   = useState<DatosEntorno | null>(null);
  const [entornoResumen, setEntornoResumen] = useState<EntornoResumen | null>(null);

  // ─── Terrarium rango auto-detectado ──────────────────────────────────────
  const [terrariumRango, setTerrariumRango] = useState<{min: number; max: number} | null>(null);

  // ─── Opacidad de los shaders ──────────────────────────────────────────────
  const [opacidadShader, setOpacidadShader] = useState({ elev: 0.65, pend: 0.65 });


  // ─── Capas y visibilidad (hook useCapas) ──────────────────────────────────
  const {
    capas, setCapas, ocultosIds, setOcultosIds, capasOcultas, setCapasOcultas, toggleOculto,
    subCapasOcultas, setSubCapasOcultas, toggleSubCapa,
  } = useCapas();
  const [panelDerecho,     setPanelDerecho]      = useState<'capas' | 'sugerencias' | 'bitacora' | null>(null);
  const [show3D,           setShow3D]            = useState(false);
  const [showHistorico,    setShowHistorico]     = useState(false);
  // ─── Sombras + insolación (hook useSombras) ───────────────────────────────
  // Se cablea más abajo, una vez definidos latCentro/zonas/dibujos.

  // ─── Capas de usuario: capa activa (capasOcultas vive en useCapas) ────────
  const [capaActivaId, setCapaActivaId] = useState<string>(CAPA_DEFAULT_ID);

  // ─── Master Plan ──────────────────────────────────────────────────────────
  const [programaMP,  setProgramaMP]  = useState<ItemPrograma[]>([]);
  const [masterPlan,  setMasterPlan]  = useState<ElementoMasterPlan[] | null>(null);
  // Zona 0 (casa / edificio principal): punto de referencia del master plan.
  const [zona0,       setZona0]       = useState<{ lat: number; lng: number } | null>(null);
  const [modoZona0,   setModoZona0]   = useState(false);
  // Caminos conectores del master plan (MST zona 0 ↔ elementos), derivados.
  // Análisis de relieve (bounded, ≤120² desde el shader) para rutear los tramos
  // por el terreno en vez de líneas rectas. Se memoiza solo sobre el shader (no
  // sobre el master plan) para no rehacer el pit-fill en cada re-cálculo del plan.
  const hayMasterPlan = !!(masterPlan && masterPlan.length);
  const analisisConectores = useMemo(() => {
    if (!hayMasterPlan || !datosShader) return null;
    const g = grillaDesdeShader(datosShader);
    return g ? analizarRelieve(g) : null;
  }, [datosShader, hayMasterPlan]);
  const mpCaminos = useMemo<CaminoMasterPlan[]>(
    () => (masterPlan && masterPlan.length ? conectarMasterPlan(masterPlan, zona0, analisisConectores, mojones) : []),
    [masterPlan, zona0, analisisConectores, mojones],
  );
  // Vistas filtradas por sub-capa (cada tipo de elemento del master plan y sus
  // conectores se prenden/apagan por separado desde el panel de Capas).
  const masterPlanVisible = useMemo(
    () => (masterPlan ? masterPlan.filter(el => !subCapasOcultas.has('mp:' + el.tipo)) : null),
    [masterPlan, subCapasOcultas],
  );
  const mpCaminosVisible = useMemo(
    () => (subCapasOcultas.has('mp:__caminos') ? [] : mpCaminos),
    [mpCaminos, subCapasOcultas],
  );

  // ─── Curvas de nivel: fetch de grilla densa al activar la capa ────────────
  const mojonesKey = useMemo(
    () => mojones.map(m => `${m.lat.toFixed(5)},${m.lng.toFixed(5)}`).join('|'),
    [mojones],
  );

  useEffect(() => {
    if (!capas.curvasNivel || mojones.length < 3) return;
    if (grillaCurvas && grillaKeyRef.current === mojonesKey) return;
    let cancelado = false;
    setCurvasLoading(true);
    obtenerGrillaDensa(mojones)
      .then(g => {
        if (cancelado) return;
        if (g) { setGrillaCurvas(g); grillaKeyRef.current = mojonesKey; }
      })
      .finally(() => { if (!cancelado) setCurvasLoading(false); });
    return () => { cancelado = true; };
  }, [capas.curvasNivel, mojonesKey, mojones, grillaCurvas]);

  const metricas = useMemo(() => calcularMetricas(mojones), [mojones]);

  // MDE propio (dron/estación total). Si está cargado, manda sobre el satelital:
  // es la única forma de tener curvas por debajo del par de metros.
  const [demPropio, setDemPropio] = useState<DEMImportado | null>(null);
  const pisoIntervalo = useMemo(
    () => intervaloConfiablePara(demPropio?.pasoM ?? null),
    [demPropio],
  );

  const grillaActiva = useMemo(() => {
    if (demPropio) return demPropio.grilla;
    if (grillaCurvas && grillaKeyRef.current === mojonesKey) return grillaCurvas;
    return datosShader ? grillaDesdeShader(datosShader) : null;
  }, [demPropio, grillaCurvas, mojonesKey, datosShader]);

  const curvasNivel = useMemo<CurvaNivel[]>(() => {
    if (!grillaActiva) return [];
    const intervalo = intervaloContorno
      ?? intervaloAutomatico(grillaActiva.elev_max - grillaActiva.elev_min, metricas?.area_ha, pisoIntervalo);
    return calcularCurvas(grillaActiva, intervalo);
  }, [grillaActiva, intervaloContorno, metricas, pisoIntervalo]);

  const intervaloCurvasEfectivo = useMemo(() => {
    if (intervaloContorno !== null) return intervaloContorno;
    return grillaActiva
      ? intervaloAutomatico(grillaActiva.elev_max - grillaActiva.elev_min, metricas?.area_ha, pisoIntervalo)
      : null;
  }, [intervaloContorno, grillaActiva, metricas, pisoIntervalo]);

  /** Cuántas curvas pidió el intervalo elegido: si se pasa del tope no se dibuja ninguna. */
  const curvasDemasiadas = useMemo(() => {
    if (!grillaActiva || intervaloCurvasEfectivo == null) return null;
    const n = nivelesEstimados(grillaActiva.elev_max - grillaActiva.elev_min, intervaloCurvasEfectivo);
    return n > MAX_NIVELES ? n : null;
  }, [grillaActiva, intervaloCurvasEfectivo]);

  const handleCargarDEM = useCallback(async (file: File) => {
    try {
      const { cargarDEM } = await import('@/lib/demImport');
      const dem = await cargarDEM(file);
      setDemPropio(dem);
      setIntervaloContorno(null); // que el automático aproveche la resolución nueva
      // El DEM propio alimenta también el sombreado de pendientes y todo lo que
      // deriva de él (escorrentías, aptitud, master plan, cut&fill, keyline,
      // viewshed, sombras), no solo las curvas de nivel.
      const ds = shaderDesdeDEM(dem.grilla, mojones);
      if (ds) setDatosShader(ds);
      setCapas(prev => ({ ...prev, curvasNivel: true, shaderElev: ds ? true : prev.shaderElev }));
      setModal({ type: 'alert', message:
        `Modelo de elevación cargado: ${dem.ancho}×${dem.alto} px, paso ≈ ${dem.pasoM < 1 ? `${(dem.pasoM * 100).toFixed(0)} cm` : `${dem.pasoM.toFixed(1)} m`}, cotas ${dem.grilla.elev_min.toFixed(1)}–${dem.grilla.elev_max.toFixed(1)} m${dem.epsg ? ` (EPSG ${dem.epsg})` : ''}. Ahora las curvas de nivel${ds ? ', el sombreado de pendientes y los análisis' : ''} salen de este archivo.` });
    } catch (e) {
      setModal({ type: 'alert', message: e instanceof Error ? e.message : 'No se pudo leer el modelo de elevación.' });
    }
  }, [mojones]);

  // ─── Dibujo libre ─────────────────────────────────────────────────────────
  const [modoDibujo,     setModoDibujo]     = useState<TipoDibujo | 'seleccion' | 'medir' | 'rectangulo' | 'mano_libre' | 'radio_accion' | null>(null);
  const [dibujoEnCurso,  setDibujoEnCurso]  = useState<DibujoEnCurso | null>(null);
  const [dibujoSelId,    setDibujoSelId]    = useState<string | null>(null);
  const [medicionVertices, setMedicionVertices] = useState<Array<{ lat: number; lng: number }>>([]);
  const [espejoPendiente, setEspejoPendiente] = useState(false); // próximo polígono = espejo de agua
  const [overlay, setOverlay] = useState<OverlayImagen | null>(null);
  const cursorCadRef = useRef<{ lat: number; lng: number } | null>(null);
  const cursorPosRef = useRef<{ lat: number; lng: number } | null>(null); // cursor sobre el mapa (barra de estado)
  const [exportOpen, setExportOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [economiaResumen, setEconomiaResumen] = useState<EconomiaResumen | null>(null);
  const [carbonoResumen,  setCarbonoResumen]  = useState<CarbonoResumen | null>(null);
  const [paletaOpen, setPaletaOpen] = useState(false);
  const [ayudaOpen,  setAyudaOpen]  = useState(false);
  const [tema, setTema] = useState<'claro' | 'sepia' | 'oscuro'>('claro');
  const [bloqueActivo,   setBloqueActivo]   = useState<BloqueDef | null>(null);
  const [elementoActivo, setElementoActivo] = useState<ElementoPreset | null>(null);
  const [modoElementoClick, setModoElementoClick] = useState(false);
  const [elementoPoli,   setElementoPoli]   = useState<ElementoPreset | null>(null);
  const [keylineCheck,   setKeylineCheck]   = useState<Record<string, KeylineCheck>>({});
  const [escenarios,     setEscenarios]     = useState<Escenario[]>([]);
  const [escenarioActivoId, setEscenarioActivoId] = useState<string | null>(null);
  const [guardandoNube, setGuardandoNube] = useState(false);
  const [guardadoTick, setGuardadoTick] = useState(false);
  const [guardarOpen,  setGuardarOpen]  = useState(false);
  const [ayudaMenuOpen, setAyudaMenuOpen] = useState(false);
  const [colorDibujo,    setColorDibujo]    = useState<string>(COLORES_DIBUJO[0]);

  // ─── Perfil de elevación interactivo — dock inferior (hook usePerfilElevacion) ──
  const {
    perfilDock, setPerfilDock,
    perfilPunto, setPerfilPunto,
    perfilCargando,
    perfilError,
    handleCargarPerfilCamino,
    handleAbrirPerfilDock,
  } = usePerfilElevacion({ caminos, setCaminos });

  // ─── CAD: snap (F3) y ortho (F8) + candidatos de enganche (hook useCadSnap) ──
  const {
    snapActivo, setSnapActivo, orthoActivo, setOrthoActivo, snapSegmentos, snapPuntos,
  } = useCadSnap({
    mojones, zonas, sectores, caminos, pines, aguadasLayer, dibujos,
    dibujoEnCurso, modoZona, modoSector, modoCamino,
  });

  const dibujoSel = useMemo(() => dibujos.find(d => d.id === dibujoSelId) ?? null, [dibujos, dibujoSelId]);

  // ─── Modales propios ──────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState | null>(null);

  // ─── Captura ──────────────────────────────────────────────────────────────
  const [capturaActiva,  setCapturaActiva]  = useState(false);
  const [capturaTitulo,  setCapturaTitulo]  = useState('');

  interface LeyItem { id: string; label: string; color?: string; dash?: boolean; icon?: string }
  const [leyendaEditada, setLeyendaEditada] = useState<LeyItem[] | null>(null);

  // Centro del terreno (lo usan el zoom satelital, el hook de sombras y el mapa).
  const latCentro = useMemo(() => mojones.length ? mojones.reduce((s, m) => s + m.lat, 0) / mojones.length : null, [mojones]);
  const lngCentro = useMemo(() => mojones.length ? mojones.reduce((s, m) => s + m.lng, 0) / mojones.length : null, [mojones]);

  /**
   * Hasta qué zoom hay imagen satelital real acá. Esri no da 404 cuando no tiene:
   * devuelve una tesela que dice "Map data not yet available". Se consulta una vez
   * por terreno; redondeamos las coordenadas para que el CDN reutilice la respuesta.
   */
  const [zoomSatelital, setZoomSatelital] = useState(18);
  useEffect(() => {
    if (latCentro == null || lngCentro == null) return;
    const lat = latCentro.toFixed(2), lng = lngCentro.toFixed(2);
    let vivo = true;
    fetch(`/api/zoom-satelital?lat=${lat}&lng=${lng}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (vivo && j?.zoom) setZoomSatelital(j.zoom); })
      .catch(() => { /* nos quedamos con 18 */ });
    return () => { vivo = false; };
  }, [latCentro, lngCentro]);
  // ─── Sombras + insolación (hook useSombras) ───────────────────────────────
  const {
    sombrasActivo, setSombrasActivo,
    sombrasDoy, setSombrasDoy,
    sombrasHora, setSombrasHora,
    sombrasObjetos, setSombrasObjetos,
    modoArbol, setModoArbol,
    animando,
    insolacion, setInsolacion,
    calculandoIns,
    objetoPendienteRef,
    sombras,
    handleAnimar,
    handleInsolacion,
    poligonosLevantables,
    handleAlturaObjeto,
    handleEliminarObjeto,
    handleAgregarObjeto,
  } = useSombras({ datosShader, latCentro, zonas, dibujos });

  const dibujando = modoZona || modoSector || modoCamino || modoPinClick || modoElementoClick || modoCuenca || modoViewshed || modoArbol || modoZona0 || (modoDibujo && modoDibujo !== 'seleccion');

  // ─── Visibilidad por item ─────────────────────────────────────────────────
  const zonasFiltradas    = useMemo(() => capas.zonas    ? zonas.filter(z => !ocultosIds.has(z.id))          : [], [capas.zonas, zonas, ocultosIds]);
  const sectoresFiltrados = useMemo(() => capas.sectores ? sectores.filter(s => !ocultosIds.has(s.id))       : [], [capas.sectores, sectores, ocultosIds]);
  const pinesFiltrados    = useMemo(() => capas.pines    ? pines.filter(p => !ocultosIds.has(p.id)   && (capas.analisisPredio || p.origen !== 'analisis') && !(p.capa && subCapasOcultas.has('an:' + p.capa))) : [], [capas.pines, capas.analisisPredio, pines, ocultosIds, subCapasOcultas]);
  const caminosFiltrados  = useMemo(() => capas.caminos  ? caminos.filter(c => !ocultosIds.has(c.id) && (capas.analisisPredio || c.origen !== 'analisis') && !(c.capa && subCapasOcultas.has('an:' + c.capa))) : [], [capas.caminos, capas.analisisPredio, caminos, ocultosIds, subCapasOcultas]);
  const aguadasFiltradas  = useMemo(() => capas.aguadas  ? aguadasLayer.filter(a => !ocultosIds.has(a.id))   : [], [capas.aguadas, aguadasLayer, ocultosIds]);
  const dibujosFiltrados  = useMemo(() => capas.dibujos
    ? dibujos.filter(d => !ocultosIds.has(d.id) && !capasOcultas.has(capaDeElemento(d.capaId, capasUsuario)))
    : [], [capas.dibujos, dibujos, ocultosIds, capasOcultas, capasUsuario]);

  // ─── Escorrentías y sugerencias (cómputo derivado de shader) ─────────────
  const datosEscorrentia = useMemo<DatosEscorrentia | null>(
    () => datosShader ? calcularEscorrentias(datosShader) : null,
    [datosShader],
  );

  // ─── Riesgo de erosión (pendiente × flujo acumulado) ─────────────────────
  const datosErosion = useMemo<DatosErosion | null>(
    () => datosShader && datosEscorrentia ? calcularErosion(datosShader, datosEscorrentia) : null,
    [datosShader, datosEscorrentia],
  );

  // ─── Swales (zanjas de infiltración a nivel) ─────────────────────────────
  const [swales, setSwales] = useState<ResultadoSwales | null>(null);
  const handleGenerarSwales = useCallback((opts: OpcionesSwales): ResultadoSwales | null => {
    if (!grillaActiva) { setModal({ type: 'alert', message: 'Primero calculá la topografía (Topografía → Calcular).' }); return null; }
    const r = calcularSwales(grillaActiva, mojones, opts);
    if (!r) setModal({ type: 'alert', message: 'No se pudieron trazar swales con ese intervalo (poco desnivel o intervalo muy grande).' });
    setSwales(r);
    setCapas(prev => ({ ...prev, swales: true }));
    return r;
  }, [grillaActiva, mojones]);
  const handleColocarSwales = useCallback(() => {
    if (!swales) return;
    const nuevos = swales.swales.map((sw, i) => {
      const cam = crearCamino(sw.puntos);
      return { ...cam, nombre: `Swale ${i + 1} (${sw.cota.toFixed(0)} m · ${sw.volumen_m3} m³)`, color: '#00838F', longitud_m: sw.longitud_m };
    });
    setCaminos(prev => [...prev, ...nuevos]);
    setModal({ type: 'alert', message: `Se colocaron ${nuevos.length} swales en el plano (pestaña Caminos). Podés editarlos o exportarlos.` });
  }, [swales]);

  // ─── Cortafuegos (fajas sobre líneas de cresta) ──────────────────────────
  const [cortafuegos, setCortafuegos] = useState<ResultadoCortafuegos | null>(null);
  const handleGenerarCortafuegos = useCallback((anchoM: number): ResultadoCortafuegos | null => {
    if (!datosShader) { setModal({ type: 'alert', message: 'Primero calculá la topografía (Topografía → Calcular).' }); return null; }
    const r = calcularCortafuegos(datosShader, mojones, anchoM);
    if (!r) setModal({ type: 'alert', message: 'No se detectaron líneas de cresta claras en el predio.' });
    setCortafuegos(r);
    setCapas(prev => ({ ...prev, cortafuegos: true }));
    return r;
  }, [datosShader, mojones]);
  const handleColocarCortafuegos = useCallback(() => {
    if (!cortafuegos) return;
    const nuevos = cortafuegos.lineas.map((cf, i) => {
      const cam = crearCamino(cf.puntos);
      return { ...cam, nombre: `Cortafuego ${i + 1} (${cf.longitud_m} m)`, color: '#E65100', longitud_m: cf.longitud_m };
    });
    setCaminos(prev => [...prev, ...nuevos]);
    setModal({ type: 'alert', message: `Se colocaron ${nuevos.length} cortafuegos en el plano (pestaña Caminos).` });
  }, [cortafuegos]);

  // ─── Aptitud de uso del suelo (7.2) ──────────────────────────────────────
  const aptitud = useMemo<ResultadoAptitud | null>(
    () => datosShader ? calcularAptitud(datosShader, datosEscorrentia) : null,
    [datosShader, datosEscorrentia],
  );

  const [arcoSolarOffset, setArcoSolarOffset] = useState<{ lat: number; lng: number } | null>(null);

  const datosArcoSolar = useMemo<DatosArcoSolar | null>(() => {
    if (mojones.length === 0) return null;
    const { lat, lng } = mojones.reduce((acc, m) => ({ lat: acc.lat + m.lat, lng: acc.lng + m.lng }), { lat: 0, lng: 0 });
    const latC = arcoSolarOffset?.lat ?? (lat / mojones.length);
    const lngC = arcoSolarOffset?.lng ?? (lng / mojones.length);
    const radio = calcularRadioArco(mojones, latC);
    return calcularArcoSolar(latC, lngC, radio);
  }, [mojones, arcoSolarOffset]);

  const metadatos = useMemo<Record<string, unknown>>(() => {
    const m: Record<string, unknown> = {};
    // Se guarda el clima CRUDO; la calibración viaja aparte y se reaplica al cargar.
    if (datosClimaRaw)   m['clima']    = datosClimaRaw;
    if (calibracionPrecip) m['calibracion_precip'] = calibracionPrecip;
    if (datosTopografia) m['topo']     = datosTopografia;
    if (captacionSnap)   m['captacion']= captacionSnap;
    if (datosSuelo)      m['suelo']    = datosSuelo;
    if (datosExtremos)   m['extremos'] = datosExtremos;
    if (cuenca)          m['cuenca']   = cuenca;
    if (redAguaResumen)  m['red_agua'] = redAguaResumen;
    if (represaResumen)  m['represa']  = represaResumen;
    if (riegoResumen)    m['riego']    = riegoResumen;
    if (riegoInputs)     m['riego_inputs']    = riegoInputs;
    if (redAguaInputs)   m['red_agua_inputs'] = redAguaInputs;
    if (economiaResumen) m['economia'] = economiaResumen;
    if (carbonoResumen)  m['carbono']  = carbonoResumen;
    if (potrerosLayer)   m['potreros'] = potrerosLayer;
    if (pastoreoInputs)  m['pastoreo_inputs'] = pastoreoInputs;
    if (datosCobertura)  m['cobertura'] = datosCobertura;
    if (datosEntorno)    m['entorno']  = datosEntorno;
    if (sombrasObjetos.length) m['sombras_objetos'] = sombrasObjetos;
    if (zonas.length)    m['zonas']    = zonas;
    if (sectores.length) m['sectores'] = sectores;
    if (pines.length)    m['pines']    = pines;
    if (caminos.length)  m['caminos']  = caminos;
    if (datosShader)     m['shader']   = datosShader;
    if (dibujos.length)       m['dibujos']       = dibujos;
    if (aguadasLayer.length)  m['aguadas_layer'] = aguadasLayer;
    if (capasUsuario.length > 1 || capasUsuario[0]?.nombre !== 'Dibujos') m['capas_usuario'] = capasUsuario;
    if (programaMP.length)    m['programa_mp']   = programaMP;
    if (masterPlan?.length)   m['master_plan']   = masterPlan;
    // Preferencias de vista y elementos solo-sesión → ahora se persisten con el proyecto
    m['capas'] = capas;
    if (overlay)              m['overlay']       = overlay;
    if (ocultosIds.size)      m['ocultos_ids']   = [...ocultosIds];
    if (capasOcultas.size)    m['capas_ocultas'] = [...capasOcultas];
    if (subCapasOcultas.size) m['subcapas_ocultas'] = [...subCapasOcultas];
    if (rotuloVisible || Object.values(rotulo).some(Boolean)) { m['rotulo'] = rotulo; m['rotulo_visible'] = rotuloVisible; }
    if (capturaTitulo)        m['captura_titulo'] = capturaTitulo;
    if (intervaloContorno !== null) m['intervalo_contorno'] = intervaloContorno;
    if (Object.keys(keylineCheck).length) m['keyline_check'] = keylineCheck;
    if (escenarios.length)    m['escenarios'] = escenarios;
    if (analisisHecho)        m['analisis_hecho'] = true;
    if (zona0)                m['zona0'] = zona0;
    return m;
  }, [datosClima, datosTopografia, captacionSnap, datosSuelo, datosExtremos, cuenca, redAguaResumen, represaResumen, riegoResumen, riegoInputs, redAguaInputs, economiaResumen, carbonoResumen, potrerosLayer, pastoreoInputs, datosCobertura, datosEntorno, sombrasObjetos, zonas, sectores, pines, caminos, dibujos, aguadasLayer, capasUsuario, programaMP, masterPlan, capas, overlay, ocultosIds, capasOcultas, subCapasOcultas, rotulo, rotuloVisible, capturaTitulo, intervaloContorno, keylineCheck, escenarios, analisisHecho, zona0]);

  // ─── Rango hipsométrico para TerrariumLayer ───────────────────────────────
  // Prioridad: shader (mejor fuente) → topografía → autodetectado → fallback
  const terrariumElevMin = useMemo(() => {
    if (datosShader)     return Math.max(0, Math.floor(datosShader.elev_min     * 0.95));
    if (datosTopografia) return Math.max(0, Math.floor(datosTopografia.elev_min - datosTopografia.desnivel * 0.1));
    return terrariumRango?.min ?? 0;
  }, [datosShader, datosTopografia, terrariumRango]);

  const terrariumElevMax = useMemo(() => {
    if (datosShader)     return Math.ceil(datosShader.elev_max     * 1.05);
    if (datosTopografia) return Math.ceil(datosTopografia.elev_max + datosTopografia.desnivel * 0.1 + 1);
    return terrariumRango?.max ?? 500;
  }, [datosShader, datosTopografia, terrariumRango]);

  // ─── Tema de vista (persistido por dispositivo) ───────────────────────────
  useEffect(() => {
    const t = (typeof localStorage !== 'undefined' && localStorage.getItem('terreno_tema')) as typeof tema | null;
    if (t === 'sepia' || t === 'oscuro' || t === 'claro') setTema(t);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (tema === 'claro') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', tema);
    try { localStorage.setItem('terreno_tema', tema); } catch { /* ignore */ }
  }, [tema]);

  // ─── Autosave (hook useAutosave) ──────────────────────────────────────────
  // Solo autoguardar si hay contenido real (no basta con preferencias de vista
  // como `capas`, que ahora viajan siempre en metadatos).
  const hayContenidoAutosave =
    mojones.length > 0 || dibujos.length > 0 || zonas.length > 0 ||
    sectores.length > 0 || pines.length > 0 || caminos.length > 0 || aguadasLayer.length > 0 ||
    !!datosClima || !!datosTopografia || !!datosShader || !!datosSuelo;
  const {
    banner: autosaveBanner, min: autosaveMin, setMin: setAutosaveMin,
    limpiar: limpiarBorrador, dirtyRef,
  } = useAutosave({ mojones, metadatos, proyectoActual, capturaTitulo, hayContenido: hayContenidoAutosave });


  // ─── Mojones ──────────────────────────────────────────────────────────────
  const agregarMojon = useCallback((lat: number, lng: number, centrarMapa = false) => {
    setMojones(prev => [...prev, { id: crypto.randomUUID(), numero: prev.length + 1, lat, lng }]);
    if (centrarMapa) flyToRef.current?.(lat, lng);
  }, []);

  const eliminarMojon = useCallback((id: string) => {
    setMojones(prev => prev.filter(m => m.id !== id).map((m, i) => ({ ...m, numero: i + 1 })));
    setSeleccionado(s => s === id ? null : s);
  }, []);

  /** Onboarding: carga el predio de ejemplo y vuela hasta él. */
  const handleCargarEjemplo = useCallback(() => {
    const ms = EJEMPLO_MOJONES.map((p, i) => ({ id: crypto.randomUUID(), numero: i + 1, lat: p.lat, lng: p.lng }));
    setMojones(ms);
    const cLat = EJEMPLO_MOJONES.reduce((s, p) => s + p.lat, 0) / EJEMPLO_MOJONES.length;
    const cLng = EJEMPLO_MOJONES.reduce((s, p) => s + p.lng, 0) / EJEMPLO_MOJONES.length;
    flyToRef.current?.(cLat, cLng, 16);
  }, []);

  const limpiarTodo = useCallback(() => {
    if (mojones.length === 0) return;
    setModal({
      type: 'confirm',
      message: `¿Eliminar los ${mojones.length} mojones y reiniciar el mapa?`,
      onConfirm: () => { setMojones([]); setSeleccionado(null); },
    });
  }, [mojones.length]);

  // ─── Validación de orden de mojones ──────────────────────────────────────
  const tieneInterseccion = useMemo(() => {
    if (mojones.length < 4) return false;
    try {
      const coords: [number, number][] = mojones.map(m => [m.lng, m.lat]);
      coords.push(coords[0]!);
      const poly = turf.polygon([coords]);
      const k    = turf.kinks(poly);
      return k.features.length > 0;
    } catch { return false; }
  }, [mojones]);

  const ordenarHorario = useCallback(() => {
    if (mojones.length < 3) return;
    const cx = mojones.reduce((s, m) => s + m.lng, 0) / mojones.length;
    const cy = mojones.reduce((s, m) => s + m.lat, 0) / mojones.length;
    const sorted = [...mojones].sort((a, b) => {
      const angA = Math.atan2(a.lat - cy, a.lng - cx);
      const angB = Math.atan2(b.lat - cy, b.lng - cx);
      return angA - angB; // sentido antihorario matemático = horario geográfico (lat invertida)
    });
    setMojones(sorted.map((m, i) => ({ ...m, numero: i + 1 })));
  }, [mojones]);

  // Drag-and-drop de mojones
  const dragIndexRef = useRef<number | null>(null);
  const handleDragStart = useCallback((i: number) => { dragIndexRef.current = i; }, []);
  const handleDrop      = useCallback((i: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === i) return;
    setMojones(prev => {
      const arr  = [...prev];
      const [el] = arr.splice(from, 1);
      if (!el) return prev;
      arr.splice(i, 0, el);
      return arr.map((m, idx) => ({ ...m, numero: idx + 1 }));
    });
    dragIndexRef.current = null;
  }, []);

  // Editar la cuenca calculada: la vuelca a un polígono editable (simplificado)
  // y lo selecciona, para mover/agregar/borrar vértices y luego reusarlo.
  const handleEditarCuenca = useCallback(() => {
    if (!cuenca || cuenca.poligono.length < 3) return;
    const id = crypto.randomUUID();
    setDibujos(d => [...d, {
      id, tipo: 'poligono', color: '#1565C0',
      vertices: simplificarAnillo(cuenca.poligono, 30),
      opacidad: 0.12, capaId: capaActivaId, nombre: 'Cuenca (editable)',
    }]);
    setDibujoSelId(id);
    setModoDibujo('seleccion');
    setTab('cuenca');
  }, [cuenca, capaActivaId]);

  // ─── Clic en mapa ─────────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (modoZona0) {
      setZona0({ lat, lng });
      setModoZona0(false);
      return;
    }
    if (modoArbol) {
      const p = objetoPendienteRef.current;
      setModoArbol(false);
      objetoPendienteRef.current = null;
      if (p) setSombrasObjetos(o => [...o, { ...p, tipo: 'arbol', lat, lng }]);
      return;
    }
    if (modoCuenca) {
      setModoCuenca(false);
      void procesarCuenca(lat, lng);
      return;
    }
    if (modoViewshed) {
      setModoViewshed(false);
      if (datosShader) {
        const celda = celdaEnPunto(datosShader, lat, lng);
        if (celda) setViewshed(calcularViewshed(datosShader, celda.row, celda.col, alturaObs));
      }
      return;
    }
    if (modoZona)    { setModoZona(prev => prev ? { ...prev, vertices: [...prev.vertices, { lat, lng }] } : null); return; }
    if (modoSector)  { setModoSector(prev => prev ? { ...prev, vertices: [...prev.vertices, { lat, lng }] } : null); return; }
    if (modoCamino)  { setModoCamino(prev => prev ? { ...prev, vertices: [...prev.vertices, { lat, lng }] } : null); return; }
    if (modoPinClick){
      setPines(prev => [...prev, bloqueActivo
        ? { id: crypto.randomUUID(), lat, lng, nombre: bloqueActivo.nombre, color: bloqueActivo.color, icono: bloqueActivo.icono, notas: '' }
        : crearPin(lat, lng)]);
      setModoPinClick(false); setBloqueActivo(null); return;
    }
    if (modoElementoClick && elementoActivo) {
      const e = elementoActivo;
      const id = crypto.randomUUID();
      if (e.forma === 'rect') {
        const dLat = (e.largo_m ?? 2) / 2 / 111_320;
        const dLng = (e.ancho_m ?? 2) / 2 / (111_320 * Math.cos(lat * Math.PI / 180));
        setDibujos(d => [...d, {
          id, tipo: 'poligono', color: e.color, opacidad: e.opacidad,
          simbolo: e.emoji, nombre: e.nombre, capaId: capaActivaId,
          vertices: [
            { lat: lat + dLat, lng: lng - dLng },
            { lat: lat + dLat, lng: lng + dLng },
            { lat: lat - dLat, lng: lng + dLng },
            { lat: lat - dLat, lng: lng - dLng },
          ],
        }]);
      } else {
        setDibujos(d => [...d, {
          id, tipo: 'circulo', color: e.color,
          lat, lng, radio: e.radio_m ?? 1, opacidad: e.opacidad,
          simbolo: e.emoji, nombre: e.nombre, capaId: capaActivaId,
        }]);
      }
      return; // se mantiene el sello activo para colocar varios
    }
    if (modoDibujo === 'medir') { setMedicionVertices(prev => [...prev, { lat, lng }]); return; }

    if (modoDibujo && modoDibujo !== 'seleccion') {
      // Punto: colocación inmediata, sin dibujoEnCurso
      if (modoDibujo === 'punto') {
        setDibujos(d => [...d, { id: crypto.randomUUID(), tipo: 'punto', color: colorDibujo, lat, lng, capaId: capaActivaId }]);
        return;
      }
      if (modoDibujo === 'texto') {
        const pendLat = lat, pendLng = lng;
        setModal({
          type: 'prompt', message: 'Escribí el texto a mostrar en el mapa:', placeholder: 'Texto…',
          onConfirm: texto => {
            setDibujos(prev => [...prev, {
              id: crypto.randomUUID(), tipo: 'texto', color: colorDibujo,
              lat: pendLat, lng: pendLng, texto, tamano: 14, capaId: capaActivaId,
            }]);
          },
        });
        return;
      }
      setDibujoEnCurso(prev => {
        if (!prev) {
          const tipoBase: TipoDibujo =
            modoDibujo === 'rectangulo' ? 'poligono' :
            modoDibujo === 'mano_libre' ? 'linea' :
            modoDibujo === 'radio_accion' ? 'circulo' :
            modoDibujo as TipoDibujo;
          return { tipo: tipoBase, vertices: [{ lat, lng }] };
        }
        const next = [...prev.vertices, { lat, lng }];
        // Auto-finalizar círculo o radio de acción al tener 2 puntos
        if ((modoDibujo === 'circulo' || modoDibujo === 'radio_accion') && next.length === 2) {
          const id    = crypto.randomUUID();
          const radio = distanciaMetros(next[0]!.lat, next[0]!.lng, next[1]!.lat, next[1]!.lng);
          setDibujos(d => [...d, { id, tipo: 'circulo', color: colorDibujo, lat: next[0]!.lat, lng: next[0]!.lng, radio, opacidad: modoDibujo === 'radio_accion' ? 0.08 : 0.18, capaId: capaActivaId }]);
          return { tipo: prev.tipo, vertices: [] };
        }
        // Auto-finalizar cota al tener 2 puntos
        if (modoDibujo === 'cota' && next.length === 2) {
          const id = crypto.randomUUID();
          setDibujos(d => [...d, { id, tipo: 'cota', color: colorDibujo, vertices: next, capaId: capaActivaId }]);
          return { tipo: prev.tipo, vertices: [] };
        }
        // Auto-finalizar rectángulo al tener 2 puntos
        if (modoDibujo === 'rectangulo' && next.length === 2) {
          const [p1, p2] = next;
          const id = crypto.randomUUID();
          const vertices = [
            { lat: p1!.lat, lng: p1!.lng },
            { lat: p1!.lat, lng: p2!.lng },
            { lat: p2!.lat, lng: p2!.lng },
            { lat: p2!.lat, lng: p1!.lng },
          ];
          setDibujos(d => [...d, { id, tipo: 'poligono', color: colorDibujo, vertices, opacidad: 0.22, capaId: capaActivaId }]);
          return { tipo: prev.tipo, vertices: [] };
        }
        // Auto-finalizar flecha al tener 2 puntos
        if (modoDibujo === 'flecha' && next.length === 2) {
          const id = crypto.randomUUID();
          setDibujos(d => [...d, { id, tipo: 'flecha', color: colorDibujo, vertices: next, grosor: 3, capaId: capaActivaId }]);
          return { tipo: prev.tipo, vertices: [] };
        }
        return { ...prev, vertices: next };
      });
      return;
    }

    if (modoClick) agregarMojon(lat, lng);
  }, [modoZona0, modoArbol, modoCuenca, procesarCuenca, modoViewshed, alturaObs, datosShader, modoZona, modoSector, modoCamino, modoPinClick, modoElementoClick, elementoActivo, modoClick, modoDibujo, colorDibujo, capaActivaId, bloqueActivo, agregarMojon]);

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

  const handleAplicarSectorAuto = useCallback((sector: Sector) => {
    setSectores(prev => [...prev, sector]);
  }, []);

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

  // Optimiza un camino: lo reruta entre sus extremos siguiendo crestas/parteaguas,
  // con poca pendiente y evitando vertientes (las cruza en un punto: puente/alcantarilla).
  const handleOptimizarCamino = useCallback(async (camino: Camino): Promise<{ ok: boolean; msg: string }> => {
    const vs = camino.vertices;
    if (vs.length < 2) return { ok: false, msg: 'El camino necesita al menos 2 puntos (inicio y destino).' };
    const res = await sugerirCaminoRelieve(vs[0]!, vs[vs.length - 1]!, undefined, mojones.length >= 3 ? mojones : undefined);
    if (!res || res.vertices.length < 2) return { ok: false, msg: 'No se pudo trazar por crestas (relieve insuficiente o sin datos).' };
    setCaminos(prev => prev.map(c => c.id === camino.id
      ? { ...c, vertices: res.vertices, longitud_m: res.longitud_m, perfil: undefined }
      : c));
    if (res.cruces.length) {
      setPines(prev => [...prev, ...res.cruces.map(cr => ({
        id: crypto.randomUUID(), lat: cr.lat, lng: cr.lng,
        nombre: cr.tipo === 'puente' ? 'Puente' : 'Alcantarilla / tubo',
        icono: cr.tipo === 'puente' ? '🌉' : '🚧', color: '#6D4C41',
        notas: `Cruce de vertiente (${cr.tipo}) sobre el camino "${camino.nombre}"`,
      }))]);
    }
    const cruceTxt = res.cruces.length
      ? ` · ${res.cruces.length} cruce(s) de vertiente: ${res.cruces.map(c => c.tipo).join(', ')} (marcados con pin)`
      : ' · sin cruces de vertiente';
    return {
      ok: true,
      msg: `Trazado por crestas: ${res.longitud_m >= 1000 ? (res.longitud_m / 1000).toFixed(2) + ' km' : res.longitud_m + ' m'} · pend. media ${res.pendiente_media_pct}% (máx ${res.pendiente_max_pct}%) · ${Math.round(res.frac_cresta * 100)}% por cresta${cruceTxt}`,
    };
  }, [mojones]);


  // ─── Dibujo libre ─────────────────────────────────────────────────────────
  const handleCambiarModo = useCallback((modo: TipoDibujo | 'seleccion' | 'medir' | 'rectangulo' | 'mano_libre' | 'radio_accion' | null) => {
    setModoDibujo(modo);
    const tipoParaEnCurso: TipoDibujo | null =
      !modo || modo === 'seleccion' || modo === 'medir' ? null :
      modo === 'rectangulo' ? 'poligono' :
      modo === 'mano_libre'  ? 'linea' :
      modo === 'radio_accion' ? 'circulo' :
      modo as TipoDibujo;
    setDibujoEnCurso(tipoParaEnCurso ? { tipo: tipoParaEnCurso, vertices: [] } : null);
    setMedicionVertices([]);
    setDibujoSelId(null);
    setEspejoPendiente(false);
    setElementoPoli(null);
    if (modo) { setModoClick(false); }
  }, []);

  // Dibujar el espejo de agua de una aguada (polígono azul que el cut&fill puede usar)
  const handleDibujarEspejo = useCallback(() => {
    setColorDibujo('#1E88E5');
    handleCambiarModo('poligono');
    setEspejoPendiente(true);
  }, [handleCambiarModo]);

  const handleClickDibujo = useCallback((id: string) => {
    setDibujoSelId(prev => prev === id ? null : id);
  }, []);

  const handleEliminarDibujo = useCallback(() => {
    if (!dibujoSelId) return;
    setDibujos(prev => prev.filter(d => d.id !== dibujoSelId));
    setDibujoSelId(null);
  }, [dibujoSelId]);

  const handleCambiarColorDibujo = useCallback((color: string) => {
    if (!dibujoSelId) return;
    setDibujos(prev => prev.map(d => d.id === dibujoSelId ? { ...d, color } : d));
  }, [dibujoSelId]);

  const handleMoverAdelante = useCallback(() => {
    if (!dibujoSelId) return;
    setDibujos(prev => {
      const idx = prev.findIndex(d => d.id === dibujoSelId);
      if (idx < 0 || idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!];
      return arr;
    });
  }, [dibujoSelId]);

  const handleMoverAtras = useCallback(() => {
    if (!dibujoSelId) return;
    setDibujos(prev => {
      const idx = prev.findIndex(d => d.id === dibujoSelId);
      if (idx <= 0) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx - 1]] = [arr[idx - 1]!, arr[idx]!];
      return arr;
    });
  }, [dibujoSelId]);

  const handleFinalizarDibujo = useCallback(() => {
    if (!dibujoEnCurso) return;
    const id     = crypto.randomUUID();
    const color  = colorDibujo;
    const verts  = dibujoEnCurso.vertices;
    const capaId = capaActivaId;

    if (dibujoEnCurso.tipo === 'linea' && verts.length >= 2)
      setDibujos(prev => [...prev, { id, tipo: 'linea',    color, vertices: verts, grosor: 3, capaId }]);
    else if (dibujoEnCurso.tipo === 'curva' && verts.length >= 2)
      setDibujos(prev => [...prev, { id, tipo: 'curva',    color, vertices: verts, grosor: 3, capaId }]);
    else if (dibujoEnCurso.tipo === 'poligono' && verts.length >= 3)
      setDibujos(prev => [...prev, elementoPoli
        ? { id, tipo: 'poligono', color: elementoPoli.color, vertices: verts, opacidad: elementoPoli.opacidad, capaId, simbolo: elementoPoli.emoji, nombre: elementoPoli.nombre }
        : espejoPendiente
        ? { id, tipo: 'poligono', color: '#1E88E5', vertices: verts, opacidad: 0.42, capaId, nombre: `Espejo de agua ${prev.filter(d => d.nombre?.startsWith('Espejo de agua')).length + 1}` }
        : { id, tipo: 'poligono', color, vertices: verts, opacidad: 0.22, capaId }]);
    else if (dibujoEnCurso.tipo === 'circulo' && verts.length === 2) {
      const radio = distanciaMetros(verts[0]!.lat, verts[0]!.lng, verts[1]!.lat, verts[1]!.lng);
      setDibujos(prev => [...prev, { id, tipo: 'circulo', color, lat: verts[0]!.lat, lng: verts[0]!.lng, radio, opacidad: 0.18, capaId }]);
    }
    else if (dibujoEnCurso.tipo === 'cota' && verts.length === 2)
      setDibujos(prev => [...prev, { id, tipo: 'cota', color, vertices: verts, capaId }]);
    else if (dibujoEnCurso.tipo === 'flecha' && verts.length >= 2)
      setDibujos(prev => [...prev, { id, tipo: 'flecha', color, vertices: verts, grosor: 3, capaId }]);

    setDibujoEnCurso({ tipo: dibujoEnCurso.tipo, vertices: [] });
  }, [dibujoEnCurso, colorDibujo, capaActivaId, espejoPendiente, elementoPoli]);

  const handleCancelarDibujo = useCallback(() => {
    setModoDibujo(null);
    setDibujoEnCurso(null);
    setMedicionVertices([]);
    setDibujoSelId(null);
    setEspejoPendiente(false);
    setElementoPoli(null);
    setElementoActivo(null);
  }, []);

  const handleMoverDibujo = useCallback((id: string, dLat: number, dLng: number) => {
    setDibujos(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.tipo === 'texto' || d.tipo === 'circulo' || d.tipo === 'punto')
        return { ...d, lat: d.lat + dLat, lng: d.lng + dLng };
      return { ...d, vertices: d.vertices.map(v => ({ lat: v.lat + dLat, lng: v.lng + dLng })) };
    }));
  }, []);

  const handleMoverVertice = useCallback((id: string, idx: number, lat: number, lng: number) => {
    setDibujos(prev => prev.map(d => {
      if (d.id !== id || d.tipo === 'texto' || d.tipo === 'circulo' || d.tipo === 'punto') return d;
      const vertices = [...d.vertices];
      vertices[idx] = { lat, lng };
      return { ...d, vertices };
    }));
  }, []);

  const handleInsertarVertice = useCallback((id: string, idxAfter: number, lat: number, lng: number) => {
    setDibujos(prev => prev.map(d => {
      if (d.id !== id || d.tipo === 'texto' || d.tipo === 'circulo' || d.tipo === 'punto') return d;
      const vertices = [...d.vertices];
      vertices.splice(idxAfter + 1, 0, { lat, lng });
      return { ...d, vertices };
    }));
  }, []);

  const handleEliminarVertice = useCallback((id: string, idx: number) => {
    setDibujos(prev => prev.map(d => {
      if (d.id !== id || d.tipo === 'texto' || d.tipo === 'circulo' || d.tipo === 'punto') return d;
      const min = d.tipo === 'poligono' ? 3 : 2;
      if (d.vertices.length <= min) return d;
      return { ...d, vertices: d.vertices.filter((_, i) => i !== idx) };
    }));
  }, []);

  const handleRedimensionarCirculo = useCallback((id: string, radio: number) => {
    setDibujos(prev => prev.map(d => d.id === id && d.tipo === 'circulo' ? { ...d, radio } : d));
  }, []);

  const handleRenombrarDibujo = useCallback((nombre: string, notas: string) => {
    if (!dibujoSelId) return;
    setDibujos(prev => prev.map(d => d.id === dibujoSelId ? { ...d, nombre, notas } : d));
  }, [dibujoSelId]);

  // ─── Transformaciones CAD sobre el elemento seleccionado ──────────────────
  const handleTransformar = useCallback((op: TransformarOp) => {
    if (!dibujoSel) return;
    const centro = mojones.length >= 3
      ? { lat: mojones.reduce((s, m) => s + m.lat, 0) / mojones.length, lng: mojones.reduce((s, m) => s + m.lng, 0) / mojones.length }
      : centroideDibujo(dibujoSel);
    const { reemplazo, nuevos } = aplicarTransformacion(dibujoSel, op, centro);
    setDibujos(prev => {
      let arr = reemplazo ? prev.map(d => d.id === reemplazo.id ? reemplazo : d) : prev;
      if (nuevos && nuevos.length) arr = [...arr, ...nuevos];
      return arr;
    });
  }, [dibujoSel, mojones]);

  // ─── Medición efímera ─────────────────────────────────────────────────────
  const handleLimpiarMedicion = useCallback(() => setMedicionVertices([]), []);

  // ─── Interop DXF ──────────────────────────────────────────────────────────
  const origenGeo = useCallback((): { lat: number; lng: number } => (
    mojones.length >= 1
      ? { lat: mojones.reduce((s, m) => s + m.lat, 0) / mojones.length, lng: mojones.reduce((s, m) => s + m.lng, 0) / mojones.length }
      : { lat: -30.8, lng: -64.7 }
  ), [mojones]);

  const handleExportarDXF = useCallback(() => {
    const linderos = (metricas && mojones.length >= 3)
      ? metricas.linderos.map((l, i) => ({ a: mojones[i]!, b: mojones[(i + 1) % mojones.length]!, longitud: l.longitud }))
      : [];
    const dxf = exportarDXF(dibujos, mojones, origenGeo(), {
      zonas: zonas.map(z => ({ vertices: z.vertices, nombre: z.nombre })),
      sectores: sectores.map(s => ({ vertices: s.vertices, nombre: s.nombre })),
      caminos: caminos.map(c => ({ vertices: c.vertices, nombre: c.nombre })),
      linderos,
    });
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(proyectoActual?.nombre ?? 'terreno').replace(/[^\w-]/g, '_')}.dxf`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }, [dibujos, mojones, origenGeo, proyectoActual, metricas, zonas, sectores, caminos]);

  const handleImportarDXF = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const nuevos = parsearDXF(String(reader.result ?? ''), origenGeo(), colorDibujo, capaActivaId);
        if (nuevos.length) setDibujos(prev => [...prev, ...nuevos]);
        setModal({ type: 'alert', message: nuevos.length ? `Se importaron ${nuevos.length} elemento(s) del DXF.` : 'No se encontraron entidades compatibles en el DXF.' });
      } catch {
        setModal({ type: 'alert', message: 'No se pudo leer el archivo DXF.' });
      }
    };
    reader.readAsText(file);
  }, [origenGeo, colorDibujo, capaActivaId]);

  // ─── Guardado rápido en la nube (barra superior) ──────────────────────────
  const handleGuardarNube = useCallback(async () => {
    if (mojones.length === 0) { setModal({ type: 'alert', message: 'Trazá al menos un mojón antes de guardar.' }); return; }
    if (!proyectoActual) { setTab('proyectos'); setPanelAbierto(true); return; } // proyecto nuevo: necesita nombre
    setGuardandoNube(true);
    try {
      await actualizarProyecto(proyectoActual.id, proyectoActual.nombre, proyectoActual.descripcion ?? '', mojones, metadatos);
      setGuardadoTick(true);
      setTimeout(() => setGuardadoTick(false), 2200);
    } catch (e) {
      setModal({ type: 'alert', message: `No se pudo guardar en la nube: ${errMsgApp(e)}` });
    } finally {
      setGuardandoNube(false);
    }
  }, [mojones, proyectoActual, metadatos]);

  const handleExportGeoJSON = useCallback(() => { exportarGeoJSON({ mojones, zonas, sectores, pines, caminos, nombre: proyectoActual?.nombre || 'terreno' }); setExportOpen(false); }, [mojones, zonas, sectores, pines, caminos, proyectoActual]);
  const handleExportKML = useCallback(() => { exportarKML(mojones, proyectoActual?.nombre || 'terreno'); setExportOpen(false); }, [mojones, proyectoActual]);
  const handleExportGPX = useCallback(() => { exportarGPX(mojones, proyectoActual?.nombre || 'terreno'); setExportOpen(false); }, [mojones, proyectoActual]);

  // ─── Overlay de imagen (plano de referencia) ──────────────────────────────
  const handleCargarOverlay = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      let sw: { lat: number; lng: number }, ne: { lat: number; lng: number };
      if (mojones.length >= 2) {
        const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
        sw = { lat: Math.min(...lats), lng: Math.min(...lngs) };
        ne = { lat: Math.max(...lats), lng: Math.max(...lngs) };
      } else {
        const c = origenGeo();
        sw = { lat: c.lat - 0.002, lng: c.lng - 0.002 };
        ne = { lat: c.lat + 0.002, lng: c.lng + 0.002 };
      }
      setOverlay({ url, sw, ne, opacidad: 0.6 });
    };
    reader.readAsDataURL(file);
  }, [mojones, origenGeo]);

  // Importar GeoTIFF (dron / IGN) — georreferencia automática (D6)
  const handleCargarGeoTIFF = useCallback(async (file: File) => {
    try {
      const { cargarGeoTIFF } = await import('@/lib/geotiffImport');
      const g = await cargarGeoTIFF(file);
      setOverlay({ url: g.url, sw: g.sw, ne: g.ne, opacidad: 0.85 });
      setModal({ type: 'alert', message: `GeoTIFF cargado y georreferenciado (${g.ancho}×${g.alto} px, ${g.bandas} banda${g.bandas !== 1 ? 's' : ''}${g.epsg ? `, EPSG ${g.epsg}` : ''}). Ajustá la opacidad desde el panel CAD.` });
    } catch (e) {
      setModal({ type: 'alert', message: e instanceof Error ? e.message : 'No se pudo leer el GeoTIFF.' });
    }
  }, []);

  const handleOverlayEsquina = useCallback((esq: 'sw' | 'ne' | 'centro', lat: number, lng: number) => {
    setOverlay(prev => {
      if (!prev) return prev;
      if (esq === 'sw') return { ...prev, sw: { lat, lng } };
      if (esq === 'ne') return { ...prev, ne: { lat, lng } };
      const cen = { lat: (prev.sw.lat + prev.ne.lat) / 2, lng: (prev.sw.lng + prev.ne.lng) / 2 };
      const dLat = lat - cen.lat, dLng = lng - cen.lng;
      return { ...prev, sw: { lat: prev.sw.lat + dLat, lng: prev.sw.lng + dLng }, ne: { lat: prev.ne.lat + dLat, lng: prev.ne.lng + dLng } };
    });
  }, []);

  // ─── Entrada por teclado: largo (y opcionalmente azimut) desde el último vértice ──
  // azDeg null → usa la dirección hacia el cursor (estilo CAD dinámico).
  const handleEntradaCoord = useCallback((distM: number, azDeg: number | null) => {
    const base =
      modoDibujo === 'medir' ? medicionVertices[medicionVertices.length - 1] :
      dibujoEnCurso && dibujoEnCurso.vertices.length ? dibujoEnCurso.vertices[dibujoEnCurso.vertices.length - 1] :
      modoZona && modoZona.vertices.length ? modoZona.vertices[modoZona.vertices.length - 1] :
      modoSector && modoSector.vertices.length ? modoSector.vertices[modoSector.vertices.length - 1] :
      modoCamino && modoCamino.vertices.length ? modoCamino.vertices[modoCamino.vertices.length - 1] :
      null;
    if (!base) return false;
    let azDegFinal = azDeg;
    if (azDegFinal === null) {
      const cur = cursorCadRef.current;
      if (!cur) return false; // sin dirección: mové el mouse o ingresá el ángulo
      const φ1 = base.lat * Math.PI / 180, φ2 = cur.lat * Math.PI / 180;
      const dλ = (cur.lng - base.lng) * Math.PI / 180;
      const y = Math.sin(dλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
      azDegFinal = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }
    const az = (azDegFinal * Math.PI) / 180;
    const lat = base.lat + (distM * Math.cos(az)) / 111_320;
    const lng = base.lng + (distM * Math.sin(az)) / (111_320 * Math.cos(base.lat * Math.PI / 180));
    handleMapClick(lat, lng);
    return true;
  }, [modoDibujo, medicionVertices, dibujoEnCurso, modoZona, modoSector, modoCamino, handleMapClick]);

  const handleMoverPin = useCallback((id: string, lat: number, lng: number) => {
    setPines(prev => prev.map(p => p.id === id ? { ...p, lat, lng } : p));
  }, []);

  // ─── Atajos de teclado (estilo CAD) ───────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const enInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Ctrl/⌘+K = paleta de comandos (disponible en todos lados)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletaOpen(o => !o); return; }

      // F3 = snap · F8 = ortho (siempre disponibles fuera de inputs)
      if (e.key === 'F3' && !enInput) { e.preventDefault(); setSnapActivo(p => !p); return; }
      if (e.key === 'F8' && !enInput) { e.preventDefault(); setOrthoActivo(p => !p); return; }

      if (enInput || modal) return;

      // ? = hoja de atajos
      if (e.key === '?') { e.preventDefault(); setAyudaOpen(o => !o); return; }

      // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); }
        return;
      }

      // Enter: finalizar el dibujo en curso (o reiniciar la medición)
      if (e.key === 'Enter') {
        if (modoDibujo === 'medir') { e.preventDefault(); setMedicionVertices([]); return; }
        if (dibujoEnCurso && dibujoEnCurso.vertices.length > 0) { e.preventDefault(); handleFinalizarDibujo(); }
        else if (modoZona)   { e.preventDefault(); handleFinalizarZona(); }
        else if (modoSector) { e.preventDefault(); handleFinalizarSector(); }
        else if (modoCamino) { e.preventDefault(); handleFinalizarCamino(); }
        return;
      }

      // Escape: cancelar todo modo de dibujo activo y deseleccionar
      if (e.key === 'Escape') {
        if (modoDibujo) handleCancelarDibujo();
        if (modoZona)     setModoZona(null);
        if (modoSector)   setModoSector(null);
        if (modoCamino)   setModoCamino(null);
        if (modoPinClick) setModoPinClick(false);
        if (modoElementoClick) { setModoElementoClick(false); setElementoActivo(null); }
        if (modoZona0)    setModoZona0(false);
        if (modoClick)    setModoClick(false);
        setDibujoSelId(null);
        return;
      }

      // Backspace: quitar el último vértice del dibujo en curso
      if (e.key === 'Backspace') {
        if (modoDibujo === 'medir' && medicionVertices.length > 0) {
          e.preventDefault();
          setMedicionVertices(prev => prev.slice(0, -1));
        } else if (dibujoEnCurso && dibujoEnCurso.vertices.length > 0) {
          e.preventDefault();
          setDibujoEnCurso(prev => prev ? { ...prev, vertices: prev.vertices.slice(0, -1) } : prev);
        } else if (modoZona && modoZona.vertices.length > 0) {
          e.preventDefault();
          setModoZona(prev => prev ? { ...prev, vertices: prev.vertices.slice(0, -1) } : prev);
        } else if (modoSector && modoSector.vertices.length > 0) {
          e.preventDefault();
          setModoSector(prev => prev ? { ...prev, vertices: prev.vertices.slice(0, -1) } : prev);
        } else if (modoCamino && modoCamino.vertices.length > 0) {
          e.preventDefault();
          setModoCamino(prev => prev ? { ...prev, vertices: prev.vertices.slice(0, -1) } : prev);
        }
        return;
      }

      // Supr: eliminar el elemento seleccionado
      if (e.key === 'Delete' && dibujoSelId && modoDibujo === 'seleccion') {
        handleEliminarDibujo();
        return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    undo, redo, modal, dibujoEnCurso, modoDibujo, medicionVertices, modoZona, modoSector, modoCamino,
    modoPinClick, modoElementoClick, modoZona0, modoClick, dibujoSelId,
    handleFinalizarDibujo, handleFinalizarZona, handleFinalizarSector, handleFinalizarCamino,
    handleCancelarDibujo, handleEliminarDibujo,
  ]);

  // ─── Geometría activa para preview CAD ────────────────────────────────────
  const tipoActivo = useMemo<import('./MapLeaflet').TipoActivo>(() => {
    if (modoDibujo === 'medir') return 'medir';
    if (modoDibujo && modoDibujo !== 'seleccion' && modoDibujo !== 'texto' && modoDibujo !== 'punto') {
      // Map virtual modes to their underlying TipoDibujo for the CAD preview
      if (modoDibujo === 'rectangulo')   return 'poligono';
      if (modoDibujo === 'mano_libre')   return 'linea';
      if (modoDibujo === 'radio_accion') return 'circulo';
      return modoDibujo;
    }
    if (modoZona)   return 'zona';
    if (modoSector) return 'sector';
    if (modoCamino) return 'camino';
    return null;
  }, [modoDibujo, modoZona, modoSector, modoCamino]);

  const verticesActivos = useMemo(() => {
    if (modoDibujo === 'medir') return medicionVertices;
    if (modoDibujo && modoDibujo !== 'seleccion' && dibujoEnCurso) return dibujoEnCurso.vertices;
    if (modoZona)   return modoZona.vertices;
    if (modoSector) return modoSector.vertices;
    if (modoCamino) return modoCamino.vertices;
    return null;
  }, [modoDibujo, dibujoEnCurso, medicionVertices, modoZona, modoSector, modoCamino]);

  const colorPreview = modoZona ? '#FFD54F' : modoSector ? '#81D4FA' : modoCamino ? '#8B4513' : colorDibujo;

  // ─── Etiqueta de modo para la barra de estado ─────────────────────────────
  const modoEstadoLabel = useMemo(() => {
    if (modoZona)        return 'Dibujando zona';
    if (modoSector)      return 'Dibujando sector';
    if (modoCamino)      return 'Trazando camino';
    if (modoPinClick)    return 'Colocando pin';
    if (modoDibujo === 'medir')     return 'Midiendo';
    if (modoDibujo === 'seleccion') return dibujoSelId ? 'Elemento seleccionado' : 'Seleccionar';
    if (modoDibujo)      return `Dibujando ${modoDibujo}`;
    if (modoClick)       return 'Agregando mojón';
    return 'Listo';
  }, [modoZona, modoSector, modoCamino, modoPinClick, modoDibujo, dibujoSelId, modoClick]);

  // ─── Keyline: checklist + aplicar guías al plano ──────────────────────────
  const handleCheckKeyline = useCallback((id: string, parcial: Partial<KeylineCheck>) => {
    setKeylineCheck(prev => ({ ...prev, [id]: { hecho: false, nota: '', ...prev[id], ...parcial } }));
  }, []);

  const handleAplicarKeyline = useCallback((res: ResultadoKeyline) => {
    setCaminos(prev => [
      ...prev,
      ...res.guias.filter(g => g.puntos.length >= 2).map(g => {
        const c = crearCamino(g.puntos);
        return { ...c, nombre: g.principal ? `Keyline ${g.cota} m (principal)` : `Keyline ${g.cota} m`, color: g.principal ? '#5E35B1' : '#9575CD' };
      }),
    ]);
    setPines(prev => [...prev, { id: crypto.randomUUID(), lat: res.keypoint.lat, lng: res.keypoint.lng, nombre: `Keypoint ${res.keypoint.elevation.toFixed(0)} m`, color: '#5E35B1', icono: '📍', notas: res.nota }]);
    setTab('caminos');
  }, []);

  const handleAplicarPatron = useCallback((res: import('@/lib/keyline').ResultadoPatron) => {
    const nuevos: Camino[] = [];
    if (res.master.length >= 2) { const c = crearCamino(res.master); nuevos.push({ ...c, nombre: 'Línea clave (maestra)', color: '#3949AB' }); }
    res.lineas.forEach((ln, i) => { if (ln.length >= 2) { const c = crearCamino(ln); nuevos.push({ ...c, nombre: `Línea ${i + 1}`, color: '#26A69A' }); } });
    if (nuevos.length) setCaminos(prev => [...prev, ...nuevos]);
    setTab('caminos');
  }, []);

  // ─── Escenarios (snapshots del diseño) ────────────────────────────────────
  const snapshotActual = useCallback((): DocDisenoSnapshot => ({
    mojones, zonas, sectores, pines, caminos, aguadasLayer, dibujos, capasUsuario,
  }), [mojones, zonas, sectores, pines, caminos, aguadasLayer, dibujos, capasUsuario]);

  const handleGuardarEscenario = useCallback((nombre: string) => {
    const id = crypto.randomUUID();
    setEscenarios(prev => [...prev, { id, nombre, creado: new Date().toISOString(), doc: snapshotActual() }]);
    setEscenarioActivoId(id);
  }, [snapshotActual]);

  const handleCargarEscenario = useCallback((id: string) => {
    setEscenarios(prevEsc => {
      const esc = prevEsc.find(e => e.id === id);
      if (esc) { replaceDoc({ ...esc.doc }); setEscenarioActivoId(id); setSeleccionado(null); setDibujoSelId(null); }
      return prevEsc;
    });
  }, [replaceDoc]);

  const handleActualizarEscenario = useCallback((id: string) => {
    setEscenarios(prev => prev.map(e => e.id === id ? { ...e, creado: new Date().toISOString(), doc: snapshotActual() } : e));
    setEscenarioActivoId(id);
  }, [snapshotActual]);

  const handleRenombrarEscenario = useCallback((id: string, nombre: string) => setEscenarios(prev => prev.map(e => e.id === id ? { ...e, nombre } : e)), []);
  const handleEliminarEscenario  = useCallback((id: string) => { setEscenarios(prev => prev.filter(e => e.id !== id)); setEscenarioActivoId(a => a === id ? null : a); }, []);

  const escenariosMeta = useMemo<EscenarioMeta[]>(() => escenarios.map(({ id, nombre, creado }) => ({ id, nombre, creado })), [escenarios]);

  // Polígonos cerrados candidatos para cut&fill de represas
  const poligonosCutFill = useMemo<PoligonoCutFill[]>(() => {
    const out: PoligonoCutFill[] = [];
    dibujos.forEach((d, i) => { if (d.tipo === 'poligono' && d.vertices.length >= 3) out.push({ id: d.id, nombre: d.nombre || `Polígono ${i + 1}`, vertices: d.vertices }); });
    zonas.forEach(z => { if (z.vertices.length >= 3) out.push({ id: z.id, nombre: `Zona: ${z.nombre}`, vertices: z.vertices }); });
    sectores.forEach(s => { if (s.vertices.length >= 3) out.push({ id: s.id, nombre: `Sector: ${s.nombre}`, vertices: s.vertices }); });
    return out;
  }, [dibujos, zonas, sectores]);

  // ─── Rename / delete desde panel de capas ────────────────────────────────
  const handleRenombrarPin     = useCallback((id: string, nombre: string) => setPines(prev => prev.map(p => p.id === id ? { ...p, nombre } : p)), []);
  const handleEliminarPin      = useCallback((id: string) => {
    setPines(prev => prev.filter(p => p.id !== id));
    setOcultosIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);
  const handleRenombrarZona    = useCallback((id: string, nombre: string) => setZonas(prev => prev.map(z => z.id === id ? { ...z, nombre } : z)), []);
  const handleEliminarZona     = useCallback((id: string) => {
    setZonas(prev => prev.filter(z => z.id !== id));
    setOcultosIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);
  const handleRenombrarSector  = useCallback((id: string, nombre: string) => setSectores(prev => prev.map(s => s.id === id ? { ...s, nombre } : s)), []);
  const handleEliminarSector   = useCallback((id: string) => {
    setSectores(prev => prev.filter(s => s.id !== id));
    setOcultosIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);
  const handleRenombrarCamino  = useCallback((id: string, nombre: string) => setCaminos(prev => prev.map(c => c.id === id ? { ...c, nombre } : c)), []);
  const handleEliminarCamino   = useCallback((id: string) => {
    setCaminos(prev => prev.filter(c => c.id !== id));
    setOcultosIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);
  const handleRenombrarDibujoCapas = useCallback((id: string, nombre: string) => setDibujos(prev => prev.map(d => d.id === id ? { ...d, nombre } : d)), []);
  const handleEliminarDibujoCapas  = useCallback((id: string) => {
    setDibujos(prev => prev.filter(d => d.id !== id));
    setDibujoSelId(prev => prev === id ? null : prev);
    setOcultosIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  // ─── Capas de usuario: gestión ────────────────────────────────────────────
  const handleCrearCapa = useCallback((nombre: string) => {
    const nueva = crearCapaUsuario(nombre, capasUsuario);
    setCapasUsuario(prev => [...prev, nueva]);
    setCapaActivaId(nueva.id);
  }, [capasUsuario, setCapasUsuario]);

  const handleCargarPlantillaKeyline = useCallback(() => {
    setCapasUsuario(prev => {
      const nuevas = crearCapasKeyline(prev);
      if (nuevas.length) setCapaActivaId(nuevas[0]!.id);
      return [...prev, ...nuevas];
    });
  }, [setCapasUsuario]);

  const handleRenombrarCapa = useCallback((id: string, nombre: string) => {
    setCapasUsuario(prev => prev.map(c => c.id === id ? { ...c, nombre } : c));
  }, [setCapasUsuario]);

  const handleEliminarCapa = useCallback((id: string) => {
    if (id === CAPA_DEFAULT_ID) return; // la capa default no se elimina
    // Los dibujos de la capa pasan a la capa default
    commit(d => ({
      ...d,
      capasUsuario: (d.capasUsuario ?? CAPAS_USUARIO_INICIAL).filter(c => c.id !== id),
      dibujos: d.dibujos.map(el => capaDeElemento(el.capaId, d.capasUsuario ?? CAPAS_USUARIO_INICIAL) === id ? { ...el, capaId: CAPA_DEFAULT_ID } : el),
    }));
    setCapasOcultas(prev => { const n = new Set(prev); n.delete(id); return n; });
    setCapaActivaId(prev => prev === id ? CAPA_DEFAULT_ID : prev);
  }, [commit]);

  const handleToggleCapaOculta = useCallback((id: string) => {
    setCapasOcultas(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const handleMoverDibujoACapa = useCallback((dibujoId: string, capaId: string) => {
    setDibujos(prev => prev.map(d => d.id === dibujoId ? { ...d, capaId } : d));
  }, []);

  // Color de capa: tiñe la capa y recolorea todos sus dibujos
  const handleColorCapa = useCallback((id: string, color: string) => {
    commit(d => ({
      ...d,
      capasUsuario: (d.capasUsuario ?? CAPAS_USUARIO_INICIAL).map(c => c.id === id ? { ...c, color } : c),
      dibujos: d.dibujos.map(el => capaDeElemento(el.capaId, d.capasUsuario ?? CAPAS_USUARIO_INICIAL) === id ? { ...el, color } : el),
    }));
  }, [commit]);

  // Reordenar capa (subir/bajar en la lista)
  const handleReordenarCapa = useCallback((id: string, dir: -1 | 1) => {
    setCapasUsuario(prev => {
      const orden = [...prev].sort((a, b) => a.orden - b.orden);
      const i = orden.findIndex(c => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= orden.length) return prev;
      const a = orden[i]!, b = orden[j]!;
      return prev.map(c => c.id === a.id ? { ...c, orden: b.orden } : c.id === b.id ? { ...c, orden: a.orden } : c);
    });
  }, [setCapasUsuario]);

  // ─── Aguadas ──────────────────────────────────────────────────────────────
  const handleRenombrarAguada = useCallback((id: string, nombre: string) => {
    setAguadasLayer(prev => prev.map(a => a.id === id ? { ...a, nombre } : a));
  }, []);

  const handleEliminarAguada = useCallback((id: string) => {
    setAguadasLayer(prev => prev.filter(a => a.id !== id));
    setOcultosIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  // ─── Shader ───────────────────────────────────────────────────────────────
  // Referencia para leer los bounds actuales del mapa desde fuera de Leaflet
  const getBoundsRef = useRef<null | (() => { latMin: number; latMax: number; lngMin: number; lngMax: number })>(null);
  const flyToRef     = useRef<null | ((lat: number, lng: number, zoom?: number) => void)>(null);
  const handleGetBounds      = useCallback((fn: () => { latMin: number; latMax: number; lngMin: number; lngMax: number }) => { getBoundsRef.current = fn; }, []);
  const handleGetFlyTo       = useCallback((fn: (lat: number, lng: number, zoom?: number) => void) => { flyToRef.current = fn; }, []);

  // ─── Búsqueda de localidad (geocoder) ─────────────────────────────────────
  const [marcadorBusqueda, setMarcadorBusqueda] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const handleElegirLugar = useCallback((r: ResultadoBusqueda) => {
    flyToRef.current?.(r.lat, r.lng, zoomParaBbox(r.bbox));
    setMarcadorBusqueda({ lat: r.lat, lng: r.lng, label: r.nombre.split(',')[0] ?? r.nombre });
  }, []);

  // ─── Precipitación de alta resolución (CHIRPS ~5 km) ──────────────────────
  // POWER trae la lluvia de una grilla de ~50 km y la subestima donde hay
  // relieve. Apenas tenemos clima, buscamos CHIRPS y entra como calibración
  // automática — sin pisar nunca una que haya cargado el usuario a mano.
  // La celda redondeada evita reintentar con cada mojón que se mueve.
  const celdaClima = useMemo(() => {
    if (mojones.length === 0) return null;
    const c = centroide(mojones);
    return { lat: Math.round(c.lat / 0.05) * 0.05, lng: Math.round(c.lng / 0.05) * 0.05 };
  }, [mojones]);

  const hayClimaCrudo = !!datosClimaRaw;
  const hayCalibracionManual = calibracionPrecip?.origen === 'manual';
  // Se intenta una sola vez por celda: si el usuario quita la calibración de
  // CHIRPS, no queremos que vuelva sola en el próximo render.
  const [chirpsIntentado, setChirpsIntentado] = useState(false);
  useEffect(() => { setChirpsIntentado(false); }, [celdaClima]);

  useEffect(() => {
    if (!hayClimaCrudo || !celdaClima || chirpsIntentado || hayCalibracionManual) return;

    const ctrl = new AbortController();
    setBuscandoCHIRPS(true);
    obtenerPrecipCHIRPS(celdaClima.lat, celdaClima.lng, { señal: ctrl.signal })
      .then(cal => {
        if (ctrl.signal.aborted) return;
        if (cal) setCalibracionPrecip(cal);
        setChirpsIntentado(true);
      })
      .finally(() => { if (!ctrl.signal.aborted) setBuscandoCHIRPS(false); });

    return () => ctrl.abort();
  }, [hayClimaCrudo, celdaClima, chirpsIntentado, hayCalibracionManual]);

  // ─── Estado de guardado, para el menú de la barra superior ────────────────
  const estadoGuardado = useMemo(() => {
    if (guardandoNube) return { label: 'Guardando…', titulo: 'Guardando en la nube',      icono: <Save    className="w-3.5 h-3.5 animate-pulse" />, clase: 'bg-moss-700 text-bone-50' };
    if (guardadoTick)  return { label: 'Guardado',   titulo: 'Guardado en la nube',       icono: <Check   className="w-3.5 h-3.5" />,               clase: 'bg-moss-700 text-bone-50' };
    if (proyectoActual) return { label: 'En la nube', titulo: `Proyecto: ${proyectoActual.nombre}`, icono: <Cloud className="w-3.5 h-3.5" />,       clase: 'bg-moss-100 text-moss-900 hover:bg-moss-200' };
    return { label: 'Sin guardar', titulo: 'El trabajo todavía no está en la nube', icono: <CloudOff className="w-3.5 h-3.5" />, clase: 'bg-sun-500/20 text-clay-700 hover:bg-sun-500/30' };
  }, [guardandoNube, guardadoTick, proyectoActual]);

  // ─── Navegación unificada (panel arriba a la derecha) ─────────────────────
  // `navegacion` es estado y no ref: el panel se dibuja antes que el mapa y
  // tiene que re-renderizarse para dejar de estar deshabilitado.
  const [navegacion, setNavegacion] = useState<NavegacionMapa | null>(null);
  const [bearing,    setBearing]    = useState(0);
  const [capaFondo,  setCapaFondo]  = useState<CapaFondo>('satelite');
  const handleGetNavegacion = useCallback((api: NavegacionMapa) => { setNavegacion(api); }, []);
  // Props estables para MapLeaflet (React.memo): sin useCallback, estas arrow
  // functions se recreaban en cada render y anulaban el memo del mapa.
  const handleMoverArcoSolar = useCallback((lat: number, lng: number) => { setArcoSolarOffset({ lat, lng }); }, []);
  const handleCursorCad = useCallback((lat: number, lng: number) => { cursorCadRef.current = { lat, lng }; }, []);
  const handleCursorMove = useCallback((lat: number, lng: number) => { cursorPosRef.current = { lat, lng }; }, []);
  const handleRangoTerrarium = useCallback((min: number, max: number) => { setTerrariumRango({ min, max }); }, []);
  const handleResetTerrariumRango = useCallback(() => setTerrariumRango(null), []);

  // ─── Escala gráfica ───────────────────────────────────────────────────────
  const [mapZoom,      setMapZoom]      = useState(7);
  const [mapCenterLat, setMapCenterLat] = useState(-30.8);
  const handleMapChange = useCallback((zoom: number, lat: number) => {
    setMapZoom(zoom); setMapCenterLat(lat);
  }, []);

  // metros por píxel estándar OpenStreetMap → escala de barra en 80 px
  const escalaGrafica = useMemo(() => {
    const mpp = (156543.03392 * Math.cos(mapCenterLat * Math.PI / 180)) / Math.pow(2, mapZoom);
    const metros80px = mpp * 80;
    const unidades: number[] = [1,2,5,10,20,50,100,200,500,1000,2000,5000,10000,20000,50000];
    const nice = unidades.reduce((best, u) => Math.abs(u - metros80px) < Math.abs(best - metros80px) ? u : best, unidades[0]!);
    const pixeles = Math.round(nice / mpp);
    return { metros: nice, pixeles, label: nice >= 1000 ? `${nice / 1000} km` : `${nice} m` };
  }, [mapZoom, mapCenterLat]);
  const [shaderDetallado, setShaderDetallado] = useState(true); // grilla densa (tiles Terrarium) vs muestreo 10×10

  const handleFetchShader = useCallback(async () => {
    if (mojones.length < 3) return;
    setShaderLoading(true);
    setShaderError(null);
    // Motor único de relieve: encendemos el shader de altimetría + las curvas
    // de nivel (en auto). Escorrentías/sugerencias quedan como toggles aparte.
    const activarCapas = () =>
      setCapas(prev => ({ ...prev, shaderElev: true, shaderPend: false, curvasNivel: true }));

    // Si el usuario cargó su propio DEM, el relieve sale de ese archivo (no del
    // satélite): más resolución y coherente con las curvas.
    if (demPropio) {
      const ds = shaderDesdeDEM(demPropio.grilla, mojones);
      if (ds) { setDatosShader(ds); setShaderLoading(false); activarCapas(); return; }
    }

    // Modo detallado: grilla densa desde tiles Terrarium (cientos de celdas, sin API externa).
    if (shaderDetallado) {
      try {
        const grilla = await obtenerGrillaDensa(mojones, 100);
        const ds = grilla ? shaderDesdeGrilla(grilla) : null;
        if (ds) {
          setDatosShader(ds);
          setShaderLoading(false);
          activarCapas();
          return;
        }
      } catch { /* cae al muestreo 10×10 */ }
    }

    // Fallback / modo rápido: muestreo 10×10 vía OpenTopoData.
    const result = await fetchShader(mojones);
    setShaderLoading(false);
    if ('error' in result) {
      setShaderError(result.error);
    } else {
      setDatosShader(result);
      activarCapas();
    }
  }, [mojones, shaderDetallado, demPropio]);

  // Ubicar un sitio de represa sugerido: vuela al punto y deja un pin (sin salir del tab).
  const handleUbicarSitio = useCallback((lat: number, lng: number, nombre: string) => {
    flyToRef.current?.(lat, lng);
    setPines(prev => [...prev, { id: crypto.randomUUID(), lat, lng, nombre, icono: '💧', color: '#1565C0', notas: 'Sitio sugerido de represa' }]);
  }, []);

  // Análisis topográfico integral: vuelca al plano represas + viviendas + caminos por cresta + cruces.
  const handleAplicarAnalisisIntegral = useCallback((res: AnalisisTopoIntegral) => {
    // Cada grupo lleva su sub-capa (`capa`) para poder prender/apagar por separado
    // dentro de la carpeta "Análisis del predio".
    const CAPA_ACCESOS = 'Caminos y accesos', CAPA_REPRESAS = 'Represas', CAPA_VIVIENDAS = 'Viviendas';
    const nuevosPines = [
      { id: crypto.randomUUID(), lat: res.entrada.lat, lng: res.entrada.lng, nombre: 'Acceso', icono: '🚪', color: '#6D4C41', notas: 'Punto de entrada sugerido (cota más baja del contorno)', capa: CAPA_ACCESOS },
      ...res.represas.map((s, i) => ({ id: crypto.randomUUID(), lat: s.lat, lng: s.lng, nombre: `Represa ${i + 1} (ef. ${s.eficiencia}:1)`, icono: '💧', color: '#1565C0', notas: `Sitio sugerido — agua ${(s.volumen_agua_m3 / 1000).toFixed(1)} dam³, muro ${s.volumen_muro_m3.toLocaleString('es-AR')} m³`, capa: CAPA_REPRESAS })),
      ...res.viviendas.map((v, i) => ({ id: crypto.randomUUID(), lat: v.lat, lng: v.lng, nombre: `Vivienda ${i + 1} (${v.score}%)`, icono: '🏠', color: '#2E7D32', notas: v.motivos.join(', '), capa: CAPA_VIVIENDAS })),
      ...res.caminos.flatMap(c => c.camino.cruces.map(cr => ({ id: crypto.randomUUID(), lat: cr.lat, lng: cr.lng, nombre: cr.tipo === 'puente' ? 'Puente' : 'Alcantarilla / tubo', icono: cr.tipo === 'puente' ? '🌉' : '🚧', color: '#6D4C41', notas: `Cruce de vertiente (${cr.tipo}) — ${c.nombre}`, capa: CAPA_ACCESOS }))),
    ];
    setPines(prev => [...prev, ...nuevosPines.map(p => ({ ...p, origen: 'analisis' as const }))]);
    const nuevosCaminos = res.caminos.map(c => { const cam = crearCamino(c.camino.vertices); return { ...cam, nombre: c.nombre, color: '#E65100', longitud_m: c.camino.longitud_m, origen: 'analisis' as const, capa: CAPA_ACCESOS }; });
    setCaminos(prev => [...prev, ...nuevosCaminos]);
    flyToRef.current?.(res.entrada.lat, res.entrada.lng);
  }, []);

  // Al correr el Análisis del predio: encender la capa de escorrentías (antes se
  // creaba pero quedaba apagada). Las sugerencias de programa las hace el master plan.
  const handleAnalisisPredioListo = useCallback(() => {
    setAnalisisHecho(true);
    setCapas(prev => ({ ...prev, escorrentias: true }));
  }, []);

  // Zonas de vivienda sugeridas (desde Sectores): vuelca pines 🏠 al plano.
  const handleAplicarViviendas = useCallback((viviendas: ZonaVivienda[]) => {
    if (viviendas.length === 0) return;
    const nuevosPines = viviendas.map((v, i) => ({ id: crypto.randomUUID(), lat: v.lat, lng: v.lng, nombre: `Vivienda ${i + 1} (${v.score}%)`, icono: '🏠', color: '#2E7D32', notas: v.motivos.join(', ') }));
    setPines(prev => [...prev, ...nuevosPines]);
    flyToRef.current?.(viviendas[0]!.lat, viviendas[0]!.lng);
  }, []);

  // Caminos de acceso/servicio a los bebederos de los potreros, por lomas.
  const handleCaminosAccesoPotreros = useCallback(async (layout: PotrerosLayout): Promise<{ ok: boolean; msg: string }> => {
    if (mojones.length < 3) return { ok: false, msg: 'Cargá el terreno primero.' };
    const destinos = layout.bebederos.map(b => ({ lat: b.lat, lng: b.lng }));
    if (destinos.length === 0) return { ok: false, msg: 'No hay bebederos que conectar.' };
    const r = await sugerirCaminosAcceso(mojones, destinos);
    if (!r || r.caminos.length === 0) return { ok: false, msg: 'No se pudieron trazar los caminos (relieve insuficiente).' };
    const nuevosCaminos = r.caminos.map((c, i) => { const cam = crearCamino(c.vertices); return { ...cam, nombre: `Acceso bebedero ${i + 1}`, color: '#8B4513', longitud_m: c.longitud_m }; });
    setCaminos(prev => [...prev, ...nuevosCaminos]);
    const cruces = r.caminos.flatMap((c, i) => c.cruces.map(cr => ({ id: crypto.randomUUID(), lat: cr.lat, lng: cr.lng, nombre: cr.tipo === 'puente' ? 'Puente' : 'Alcantarilla / tubo', icono: cr.tipo === 'puente' ? '🌉' : '🚧', color: '#6D4C41', notas: `Cruce de vertiente (${cr.tipo}) — acceso bebedero ${i + 1}` })));
    if (cruces.length) setPines(prev => [...prev, ...cruces]);
    const totalKm = r.caminos.reduce((s, c) => s + c.longitud_m, 0);
    return { ok: true, msg: `${r.caminos.length} camino(s) por lomas · ${(totalKm / 1000).toFixed(2)} km en total${cruces.length ? ` · ${cruces.length} cruce(s) marcados` : ''}. Se guardaron en Caminos.` };
  }, [mojones]);

  // ─── Master Plan: generar y convertir ─────────────────────────────────────
  const handleGenerarMasterPlan = useCallback(() => {
    if (!datosShader || !datosEscorrentia) {
      setModal({ type: 'alert', message: 'Primero calculá la topografía (panel Capas → Calcular topografía) para poder ubicar los elementos.' });
      return;
    }
    if (programaMP.length === 0) return;
    const resultado = calcularMasterPlan(programaMP, datosShader, datosEscorrentia, mojones, zona0);
    setMasterPlan(resultado);
    setCapas(prev => ({ ...prev, sugerencias: true }));
  }, [datosShader, datosEscorrentia, programaMP, mojones, zona0]);

  const handleConvertirZonaMP = useCallback((el: ElementoMasterPlan) => {
    const zona = crearZona(TIPOS_ITEM[el.tipo].categoriaZona, el.vertices);
    setZonas(prev => [...prev, { ...zona, nombre: el.nombre }]);
    setMasterPlan(prev => prev ? prev.filter(e => e.id !== el.id) : prev);
  }, []);

  const handleDescartarElementoMP = useCallback((id: string) => {
    setMasterPlan(prev => prev ? prev.filter(e => e.id !== id) : prev);
  }, []);

  // Recalcular el master plan completo cada vez que cambia el programa o se mueve
  // la zona 0 — pero solo si ya se generó una vez (si no, se espera al botón).
  useEffect(() => {
    if (!masterPlan || masterPlan.length === 0) return;
    if (!zona0 || !datosShader || !datosEscorrentia || programaMP.length === 0) return;
    const t = setTimeout(() => {
      setMasterPlan(calcularMasterPlan(programaMP, datosShader, datosEscorrentia, mojones, zona0));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaMP, zona0]);

  const handleAgregarCortinas = useCallback((cortinas: CortinaSugerida[]) => {
    cortinas.forEach(c => {
      const camino = crearCamino([c.a, c.b]);
      setCaminos(prev => [...prev, { ...camino, nombre: `Cortina ${datosClima?.viento_dir_ppal ?? ''}`, color: '#2E7D32' }]);
    });
    setTab('caminos');
  }, [datosClima?.viento_dir_ppal]);

  const handleAplicarZonasAptitud = useCallback((zonasNuevas: import('@/lib/zonificacion').Zona[]) => {
    setZonas(prev => [...prev, ...zonasNuevas]);
    setTab('zonas');
  }, []);

  // ─── Proyectos ────────────────────────────────────────────────────────────
  const handleCargarProyecto = useCallback((p: Proyecto) => {
    const meta = (p.metadatos ?? {}) as Record<string, unknown>;
    // Usar replaceDoc para NO registrar historial al cargar (Ctrl+Z no vuelve a estado vacío)
    replaceDoc({
      mojones:      p.mojones,
      zonas:        (meta['zonas']        as Zona[])          ?? [],
      sectores:     (meta['sectores']     as Sector[])        ?? [],
      pines:        (meta['pines']        as Pin[])           ?? [],
      caminos:      (meta['caminos']      as Camino[])        ?? [],
      aguadasLayer: (meta['aguadas_layer'] as ElementoAguada[]) ?? [],
      dibujos:      (meta['dibujos']      as ElementoDibujo[]) ?? [],
      capasUsuario: (meta['capas_usuario'] as CapaUsuario[])   ?? CAPAS_USUARIO_INICIAL,
    });
    // Visibilidad de elementos y capas (Sets serializados como arrays)
    setOcultosIds(new Set((meta['ocultos_ids'] as string[]) ?? []));
    setCapasOcultas(new Set((meta['capas_ocultas'] as string[]) ?? []));
    setSubCapasOcultas(new Set((meta['subcapas_ocultas'] as string[]) ?? []));
    setCapaActivaId(CAPA_DEFAULT_ID);
    setProgramaMP((meta['programa_mp'] as ItemPrograma[]) ?? []);
    setMasterPlan((meta['master_plan'] as ElementoMasterPlan[]) ?? null);
    setZona0((meta['zona0'] as { lat: number; lng: number }) ?? null);
    setProyectoActual(p.id ? p : null);
    setSeleccionado(null);
    setDatosClimaRaw((meta['clima']  as DatosClima)        ?? null);
    setCalibracionPrecip((meta['calibracion_precip'] as CalibracionPrecip) ?? null);
    setDatosTopografia((meta['topo'] as DatosTopografia)   ?? null);
    setCaptacionSnap((meta['captacion'] as CaptacionSnapshot) ?? null);
    setDatosSuelo((meta['suelo']     as DatosSuelo)        ?? null);
    setDatosExtremos((meta['extremos'] as Extremos)        ?? null);
    setCuenca((meta['cuenca']        as Cuenca)            ?? null);
    setRedAguaResumen((meta['red_agua'] as RedAguaResumen)  ?? null);
    setRepresaResumen((meta['represa']  as RepresaResumen)  ?? null);
    setRiegoResumen((meta['riego']      as RiegoResumen)    ?? null);
    setRiegoInputs((meta['riego_inputs'] as RiegoInputs)     ?? null);
    setRedAguaInputs((meta['red_agua_inputs'] as RedAguaInputs) ?? null);
    setPastoreoInputs((meta['pastoreo_inputs'] as PastoreoInputs) ?? null);
    setEconomiaResumen((meta['economia'] as EconomiaResumen) ?? null);
    setCarbonoResumen((meta['carbono']  as CarbonoResumen)  ?? null);
    setPotrerosLayer((meta['potreros']  as PotrerosLayout)  ?? null);
    setSombrasObjetos((meta['sombras_objetos'] as ObjetoSombra[]) ?? []);
    setDatosCobertura((meta['cobertura'] as DatosCobertura) ?? null);
    setDatosEntorno((meta['entorno']    as DatosEntorno)    ?? null);
    // Overlay de plano, rótulo, título de captura e intervalo de curvas
    setOverlay((meta['overlay'] as OverlayImagen) ?? null);
    if (meta['rotulo']) setRotulo(meta['rotulo'] as Rotulo);
    setRotuloVisible(Boolean(meta['rotulo_visible']));
    if (typeof meta['captura_titulo'] === 'string') setCapturaTitulo(meta['captura_titulo'] as string);
    setIntervaloContorno(typeof meta['intervalo_contorno'] === 'number' ? meta['intervalo_contorno'] as number : null);
    setKeylineCheck((meta['keyline_check'] as Record<string, KeylineCheck>) ?? {});
    setEscenarios((meta['escenarios'] as Escenario[]) ?? []);
    setEscenarioActivoId(null);
    // Preferencias de capas guardadas; el shader, si existe, fuerza sus capas visibles
    const capasGuardadas = meta['capas'] as CapasVisibles | undefined;
    const shaderGuardado = (meta['shader'] as DatosShader) ?? null;
    setDatosShader(shaderGuardado);
    setAnalisisHecho(Boolean(meta['analisis_hecho']));
    setCapas(prev => {
      const base = capasGuardadas ? { ...prev, ...capasGuardadas } : prev;
      // El shader solo prende la info topográfica; escorrentías/sugerencias vienen
      // de lo guardado (se prendieron al correr el Análisis del predio).
      return shaderGuardado ? { ...base, shaderElev: true } : base;
    });
    setTab('mojones');
    setTerrariumRango(null);
    limpiarBorrador();
    dirtyRef.current = false;
  }, [replaceDoc, limpiarBorrador, dirtyRef]);

  // ─── Autosave: restaurar borrador ─────────────────────────────────────────
  const handleRestaurarAutosave = useCallback(() => {
    if (!autosaveBanner) return;
    handleCargarProyecto({
      id:              autosaveBanner.proyectoActualId ?? '',
      nombre:          autosaveBanner.nombre || 'Borrador',
      descripcion:     null,
      mojones:         autosaveBanner.mojones,
      metadatos:       autosaveBanner.metadatos,
      informe_token:   '',
      informe_publico: false,
      created_at:      '',
      updated_at:      '',
    });
    setCapturaTitulo(autosaveBanner.capturaTitulo);
    // Restaurar = seguimos en estado "sucio" (el usuario puede querer guardar a Supabase)
    dirtyRef.current = true;
  }, [autosaveBanner, handleCargarProyecto]);

  const handleDescartarAutosave = useCallback(() => {
    limpiarBorrador();
  }, [limpiarBorrador]);

  // Cuando ProyectosPanel confirma que guardó/actualizó/eliminó → estado limpio
  const handleProyectoActualChange = useCallback((p: Proyecto | null) => {
    setProyectoActual(p);
    limpiarBorrador();
    dirtyRef.current = false;
  }, [limpiarBorrador, dirtyRef]);

  // ─── Informe ──────────────────────────────────────────────────────────────
  const handleVerInforme = useCallback(async () => {
    // Imagen del mapa para el informe: compuesta desde las teselas satelitales
    // (no con html-to-image, que se cuelga con las teselas de Esri y dejaba el
    // informe sin plano). Igual la limitamos con un timeout por las dudas.
    let mapaDataUrl: string | undefined;
    try {
      const { componerMapaEstatico } = await import('@/lib/capturaMapa');
      const captura = componerMapaEstatico(mojones, { zoomSatelital });
      const timeout = new Promise<undefined>(res => setTimeout(() => res(undefined), 10000));
      mapaDataUrl = await Promise.race([captura, timeout]);
    } catch { /* ignorar si falla la captura */ }

    guardarInformeBorrador({
      nombre: proyectoActual?.nombre ?? 'Terreno sin nombre',
      fecha:  new Date().toISOString(),
      mojones, metricas: metricas ?? undefined,
      clima:  datosClima ?? undefined, topo: datosTopografia ?? undefined,
      extremos: datosExtremos ?? undefined,
      captacion: captacionSnap ?? undefined, suelo: datosSuelo ?? undefined,
      redAgua: redAguaResumen ?? undefined, represa: represaResumen ?? undefined,
      riego: riegoResumen ?? undefined,
      cobertura: coberturaResumen ?? undefined,
      entorno: entornoResumen ?? undefined,
      zonas: zonas.length ? zonas : undefined,
      economia: economiaResumen ?? undefined,
      carbono: carbonoResumen ?? undefined,
      mapaDataUrl,
      profesional: leerPerfil() ?? undefined,
      conMarca: plan === 'semilla',
    });
    window.open('/informe/borrador', '_blank');
  }, [proyectoActual, mojones, metricas, datosClima, datosTopografia, captacionSnap, datosSuelo, datosExtremos, redAguaResumen, represaResumen, riegoResumen, coberturaResumen, entornoResumen, zonas, zoomSatelital, economiaResumen, carbonoResumen, plan]);

  // ─── Captura ──────────────────────────────────────────────────────────────
  const [guardandoPng, setGuardandoPng] = useState(false);

  const handleGuardarPng = useCallback(async () => {
    // Capturamos el contenedor principal para incluir título y leyenda
    const el = document.getElementById('print-capture-root');
    if (!el || guardandoPng) return;
    setGuardandoPng(true);
    try {
      const { toPng } = await import('html-to-image');
      // Pequeño delay para asegurar que el DOM esté completamente pintado
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: false,
        filter: (node) => {
          if (!(node instanceof Element)) return true;
          if (node.classList.contains('no-print')) return false;
          if (node.classList.contains('leaflet-control-container')) return false;
          return true;
        },
        // Asegurar que los overlays con posición absoluta se rendericen correctamente
        style: {
          overflow: 'visible',
        },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${capturaTitulo || 'mapa'}-${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.png`;
      a.click();
    } catch (e) {
      setModal({ type: 'alert', message: 'No se pudo guardar la imagen. Usá el botón "Imprimir" y guardá como PDF.' });
      console.error(e);
    } finally {
      setGuardandoPng(false);
    }
  }, [capturaTitulo, guardandoPng]);

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
        #captura-norte-escala { display: flex !important; visibility: visible !important; position: fixed !important; bottom: 16px !important; left: 16px !important; z-index: 99999 !important; }
        #captura-rotulo { display: block !important; visibility: visible !important; position: fixed !important; bottom: 16px !important; right: 16px !important; z-index: 99999 !important; background: white !important; border-radius: 8px !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; }
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
  /** Clic en un ícono del riel: abre su panel, o lo cierra si ya estaba abierto. */
  const handleElegirTab = useCallback((id: Tab) => {
    if (tab === id && panelAbierto) { setPanelAbierto(false); return; }
    setTab(id);
    setPanelAbierto(true);
  }, [tab, panelAbierto]);

  // Cuando el tab activo cambia (clic en el riel, Ctrl+K, flujo interno),
  // abrimos su clúster para que quede visible en el acordeón.
  useEffect(() => {
    const g = GRUPO_DE_TAB[tab];
    if (g) setGrupoRiel(g);
  }, [tab]);

  // ─── Leyenda para captura ─────────────────────────────────────────────────
  const leyendaItems = useMemo(() => {
    const items: Array<{ color?: string; dash?: boolean; icon?: string; label: string }> = [];
    if (capas.terreno && mojones.length >= 3)
      items.push({ color: '#D9A441', label: 'Predio' });
    if (capas.terrariumElev)
      items.push({ color: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)', label: `Elevación SRTM (${terrariumElevMin}–${terrariumElevMax} m)` });
    if (capas.shaderElev && datosShader)
      items.push({ color: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)', label: 'Elevación' });
    if (capas.shaderPend && datosShader)
      items.push({ color: 'linear-gradient(90deg,#4CAF50,#FFEB3B,#F44336)', label: 'Pendiente' });
    // Arco solar
    if (capas.arcSolar) {
      items.push({ color: '#FF5722', dash: true, label: 'Solsticio de verano (21 dic)' });
      items.push({ color: '#43A047', dash: true, label: 'Equinoccios (21 mar / 23 sep)' });
      items.push({ color: '#1E88E5', dash: true, label: 'Solsticio de invierno (21 jun)' });
    }
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
  }, [capas, mojones.length, datosShader, zonasFiltradas, sectoresFiltrados, caminosFiltrados, pinesFiltrados, terrariumElevMin, terrariumElevMax]);

  // ─── Iniciar captura de PNG (reutilizado por menú Exportar y paleta) ──────────
  const iniciarCaptura = useCallback(() => {
    setPanelDerecho(null);
    setCapturaActiva(true);
    if (!capturaTitulo) setCapturaTitulo(proyectoActual?.nombre ?? 'Mapa del terreno');
    setLeyendaEditada(leyendaItems.map((it, i) => ({ ...it, id: String(i) })));
  }, [capturaTitulo, proyectoActual, leyendaItems]);

  // ─── Comandos para la paleta (Ctrl+K) ─────────────────────────────────────────
  const comandos = useMemo<Comando[]>(() => {
    const irA: Comando[] = TAB_DEFS.map(t => ({
      id: `tab-${t.id}`, grupo: 'Ir a', label: t.label, keywords: 'pestaña panel',
      accion: () => { setTab(t.id); setPanelAbierto(true); },
    }));
    const herramientas: Comando[] = ([
      ['seleccion', 'Seleccionar'], ['linea', 'Línea'], ['poligono', 'Polígono'], ['circulo', 'Círculo'],
      ['curva', 'Curva'], ['cota', 'Cota'], ['medir', 'Medir distancia / área'], ['texto', 'Texto'],
    ] as Array<[TipoDibujo | 'seleccion' | 'medir', string]>).map(([m, l]) => ({
      id: `tool-${m}`, grupo: 'Herramienta', label: l, keywords: 'dibujar dibujo',
      accion: () => handleCambiarModo(m),
    }));
    const acciones: Comando[] = [
      { id: 'save',    grupo: 'Acción',   label: 'Guardar en la nube',          keywords: 'supabase proyecto', accion: handleGuardarNube },
      { id: 'undo',    grupo: 'Acción',   label: 'Deshacer',                    keywords: 'ctrl z',            accion: undo },
      { id: 'redo',    grupo: 'Acción',   label: 'Rehacer',                     keywords: 'ctrl y',            accion: redo },
      { id: 'informe', grupo: 'Exportar', label: 'Informe PDF',                 keywords: 'reporte imprimir',  accion: handleVerInforme },
      { id: 'png',     grupo: 'Exportar', label: 'Imagen PNG del plano',        keywords: 'captura foto',      accion: iniciarCaptura },
      { id: 'dxf',     grupo: 'Exportar', label: 'DXF (AutoCAD)',               keywords: 'cad autocad',       accion: handleExportarDXF },
      { id: 'geojson', grupo: 'Exportar', label: 'GeoJSON',                     keywords: 'gis',               accion: handleExportGeoJSON },
      { id: 'kml',     grupo: 'Exportar', label: 'KML (Google Earth)',          keywords: 'google earth',      accion: handleExportKML },
      { id: 'gpx',     grupo: 'Exportar', label: 'GPX',                         keywords: 'gps',               accion: handleExportGPX },
      { id: 'topo',    grupo: 'Análisis', label: 'Calcular topografía',         keywords: 'elevación shader',  accion: handleFetchShader },
      { id: 'keyline', grupo: 'Capas',    label: 'Plantilla: Escala de permanencia (Keyline)', keywords: 'yeomans capas', accion: handleCargarPlantillaKeyline },
      { id: 'snap',    grupo: 'CAD',      label: 'Activar / desactivar SNAP',   keywords: 'f3 imán',           accion: () => setSnapActivo(p => !p) },
      { id: 'ortho',   grupo: 'CAD',      label: 'Activar / desactivar ORTO',   keywords: 'f8 ortogonal',      accion: () => setOrthoActivo(p => !p) },
      { id: 'capas',   grupo: 'Vista',    label: 'Mostrar panel de Capas',      keywords: 'layers',            accion: () => setPanelDerecho('capas') },
      { id: 'panel',   grupo: 'Vista',    label: 'Mostrar / ocultar panel lateral', keywords: 'sidebar',       accion: () => setPanelAbierto(p => !p) },
      { id: 'ayuda',   grupo: 'Vista',    label: 'Ver atajos de teclado',       keywords: 'help shortcuts',    accion: () => setAyudaOpen(true) },
      { id: 'guia',    grupo: 'Vista',    label: 'Abrir la guía de uso',        keywords: 'ayuda manual tutorial cómo funciona', accion: () => window.open('/guia.html', '_blank', 'noopener') },
    ];
    return [...irA, ...herramientas, ...acciones];
  }, [
    handleCambiarModo, handleGuardarNube, undo, redo,
    handleVerInforme, iniciarCaptura, handleExportarDXF, handleExportGeoJSON, handleExportKML, handleExportGPX,
    handleFetchShader, handleCargarPlantillaKeyline,
  ]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bone-50">

      {/* ─── Barra superior ──────────────────────────────────────────────────── */}
      <header className="relative flex items-center h-12 px-3 border-b border-bone-200 bg-white shrink-0 z-[1200]">
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <button onClick={() => setPanelAbierto(p => !p)} title="Mostrar/ocultar panel" className="p-1 text-ink-700/50 hover:text-moss-700 transition-colors">
            <ChevronRight className={`w-4 h-4 transition-transform ${panelAbierto ? 'rotate-180' : ''}`} />
          </button>
          <img src="/logo-ayt.png" alt="Arte y Tierra" className="w-7 h-7 object-contain shrink-0" />
          <div className="min-w-0 leading-tight hidden lg:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-moss-700/70">Arte y Tierra · Terreno</p>
            <p className="text-sm font-medium text-ink-950 truncate max-w-[14rem] font-display">{proyectoActual?.nombre || 'Proyecto sin guardar'}</p>
          </div>
        </div>

        {/* ── Herramientas de dibujo, en columna central elástica ──
            (antes iban en `absolute left-1/2`, fuera del flujo, y su extremo
            derecho pisaba el chip "Sin guardar" y el botón Guardar). */}
        <div className="flex-1 flex items-center justify-center min-w-0 h-full px-2">
          <DibujoToolbar
            inHeader
            modoDibujo={modoDibujo}
            colorActivo={colorDibujo}
            enCurso={dibujoEnCurso}
            seleccionado={dibujoSelId}
            colorSeleccionado={dibujoSel?.color}
            nombreSeleccionado={dibujoSel?.nombre}
            notasSeleccionado={dibujoSel?.notas}
            medidasSeleccionado={dibujoSel ? medidasDibujo(dibujoSel) : undefined}
            capasUsuario={capasUsuario}
            capaSeleccionado={dibujoSel ? capaDeElemento(dibujoSel.capaId, capasUsuario) : undefined}
            onMoverACapa={capaId => { if (dibujoSelId) handleMoverDibujoACapa(dibujoSelId, capaId); }}
            onCambiarColor={handleCambiarColorDibujo}
            onMoverAdelante={handleMoverAdelante}
            onMoverAtras={handleMoverAtras}
            onModo={handleCambiarModo}
            onColor={setColorDibujo}
            onTransformar={handleTransformar}
            onFinalizar={handleFinalizarDibujo}
            onCancelar={handleCancelarDibujo}
            onEliminar={handleEliminarDibujo}
            onRenombrar={handleRenombrarDibujo}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tema (claro → sepia → oscuro), agrupado con el estado de la app. */}
          <button
            onClick={() => setTema(t => t === 'claro' ? 'sepia' : t === 'sepia' ? 'oscuro' : 'claro')}
            title={`Tema: ${tema} — clic para cambiar (claro → sepia → oscuro)`}
            className="p-1.5 text-ink-700/40 hover:text-moss-700 transition-colors"
          >
            {tema === 'oscuro' ? <Moon className="w-4 h-4" /> : tema === 'sepia' ? <Palette className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          {/* Estado de guardado y acciones en un solo control: el chip y el
              botón por separado comían el ancho que necesita el toolbar. */}
          <div className="relative">
            <button
              onClick={() => setGuardarOpen(o => !o)}
              disabled={guardandoNube}
              title={estadoGuardado.titulo}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${estadoGuardado.clase}`}
            >
              {estadoGuardado.icono}
              <span className="hidden lg:inline">{estadoGuardado.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {guardarOpen && (
              <>
                <div className="fixed inset-0 z-[1250]" onClick={() => setGuardarOpen(false)} />
                <div className="absolute right-0 mt-1 w-52 bg-white border border-bone-200 rounded-lg shadow-raised z-[1300] py-1">
                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-700/50">{estadoGuardado.titulo}</p>
                  <ExportItem
                    icon={<Save className="w-3.5 h-3.5" />}
                    label="Guardar en la nube"
                    onClick={() => { setGuardarOpen(false); void handleGuardarNube(); }}
                  />
                  <ExportItem
                    icon={<FolderOpen className="w-3.5 h-3.5" />}
                    label={proyectoActual ? 'Guardar como…' : 'Mis proyectos'}
                    onClick={() => { setGuardarOpen(false); setTab('proyectos'); setPanelAbierto(true); }}
                  />
                </div>
              </>
            )}
          </div>
          <button onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" className="p-1.5 text-ink-700/40 hover:text-moss-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Shift+Z)" className="p-1.5 text-ink-700/40 hover:text-moss-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><Redo2 className="w-4 h-4" /></button>
          <div className="relative">
            <button onClick={() => setExportOpen(o => !o)} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-bone-200 hover:bg-bone-50 text-ink-700 transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar <ChevronDown className="w-3 h-3" />
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-[1250]" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-bone-200 rounded-lg shadow-raised z-[1300] py-1">
                  <ExportItem icon={<FileText className="w-3.5 h-3.5" />} label="Informe PDF" onClick={() => { setExportOpen(false); handleVerInforme(); }} />
                  <ExportItem icon={<IdCard className="w-3.5 h-3.5" />} label="Datos del profesional…" onClick={() => { setExportOpen(false); setPerfilOpen(true); }} />
                  <ExportItem icon={<Camera className="w-3.5 h-3.5" />} label="Imagen PNG del plano" onClick={() => { setExportOpen(false); iniciarCaptura(); }} />
                  <ExportItem icon={<FileDown className="w-3.5 h-3.5" />} label="DXF (AutoCAD)" onClick={() => { setExportOpen(false); handleExportarDXF(); }} />
                  <div className="h-px bg-bone-100 my-1" />
                  <ExportItem icon={<Download className="w-3.5 h-3.5" />} label="GeoJSON" onClick={handleExportGeoJSON} />
                  <ExportItem icon={<Download className="w-3.5 h-3.5" />} label="KML (Google Earth)" onClick={handleExportKML} />
                  <ExportItem icon={<Download className="w-3.5 h-3.5" />} label="GPX" onClick={handleExportGPX} />
                </div>
              </>
            )}
          </div>
          {/* Ayuda: guía de uso + atajos de teclado, en un solo menú visible. */}
          <div className="relative">
            <button
              onClick={() => setAyudaMenuOpen(o => !o)}
              title="Ayuda"
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${ayudaMenuOpen ? 'bg-moss-700 text-bone-50 border-moss-700' : 'border-bone-200 hover:bg-bone-50 text-ink-700'}`}
            >
              <HelpCircle className="w-3.5 h-3.5" /><span className="hidden lg:inline">Ayuda</span> <ChevronDown className="w-3 h-3" />
            </button>
            {ayudaMenuOpen && (
              <>
                <div className="fixed inset-0 z-[1250]" onClick={() => setAyudaMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-52 bg-white border border-bone-200 rounded-lg shadow-raised z-[1300] py-1">
                  <ExportItem
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label="Guía de uso"
                    onClick={() => { setAyudaMenuOpen(false); window.open('/guia.html', '_blank', 'noopener'); }}
                  />
                  <ExportItem
                    icon={<Keyboard className="w-3.5 h-3.5" />}
                    label="Atajos de teclado"
                    onClick={() => { setAyudaMenuOpen(false); setAyudaOpen(true); }}
                  />
                </div>
              </>
            )}
          </div>
          <span className="w-px h-5 bg-bone-200 mx-0.5" />
          <button onClick={handleLogout} title={`Cerrar sesión${userName ? ` (${userName})` : ''}`} className="p-1.5 text-ink-700/40 hover:text-clay-600 transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* ─── Cuerpo: panel + mapa ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
      {/* ─── Panel lateral izquierdo ─────────────────────────────────────────── */}
      <aside className="flex shrink-0 bg-bone-50">

        {/* ── Riel de íconos (acordeón de clústeres) ── */}
        <nav className="w-[56px] shrink-0 flex flex-col items-center py-2.5 gap-0.5 border-r border-bone-200 overflow-y-auto overflow-x-clip">
          {GRUPOS_RIEL.map(g => (
            <RielAcordeon
              key={g.id}
              grupo={g}
              abierto={grupoRiel === g.id}
              tabActivo={tab}
              onToggle={() => setGrupoRiel(prev => (prev === g.id ? '' : g.id))}
              onElegir={handleElegirTab}
              bloqueada={(id) => tabBloqueada(plan, id)}
            />
          ))}
        </nav>

        {/* ── Panel contextual ── */}
        <div className={`flex flex-col border-r border-bone-200 bg-white transition-all duration-200 ${panelAbierto ? 'w-[19rem]' : 'w-0 overflow-hidden'}`}>
          <div className="px-4 h-12 flex items-center justify-between border-b border-bone-200 shrink-0">
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-ink-700/40 uppercase tracking-[0.12em] leading-none">
                {GRUPOS_RIEL.find(g => g.tabs.includes(tab))?.label ?? (tab === 'proyectos' ? 'Proyectos' : 'Predio')}
              </p>
              <p className="text-[13px] font-semibold text-ink-900 truncate leading-tight mt-0.5 font-display">
                {TAB_DEF.get(tab)?.label ?? ''}
              </p>
            </div>
            <button onClick={() => setPanelAbierto(false)} title="Ocultar panel" className="shrink-0 p-1 -mr-1 rounded-md text-ink-700/40 hover:text-ink-900 hover:bg-bone-100 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Scroll area */}
          <div className="flex-1 overflow-y-auto">
          {(() => {
            // Si el tab está bloqueado para el plan, mostramos el candado en vez
            // del panel — así no se monta (ni dispara sus APIs) una feature paga.
            const fLock = featureDeTab(tab);
            if (fLock && !can(plan, fLock)) {
              const label = TAB_DEF.get(tab)?.label ?? '';
              return <FeatureLock feature={fLock} plan={plan} titulo={label} beneficio={BENEFICIO_FEATURE[fLock]} />;
            }
            return (<>
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
                {tieneInterseccion && (
                  <div className="mb-2 flex items-center gap-2 bg-clay-50 border border-clay-200 rounded-xl px-3 py-2">
                    <span className="text-[10px] text-clay-700 flex-1 leading-tight">⚠ El polígono tiene lados que se cruzan.</span>
                    <button onClick={ordenarHorario} className="text-[10px] font-semibold text-clay-700 hover:text-clay-900 underline underline-offset-2 whitespace-nowrap">Ordenar auto</button>
                  </div>
                )}
                {mojones.length === 0 ? (
                  <div className="space-y-3 py-1">
                    <p className="text-[13px] text-ink-800 leading-snug font-display">
                      Empecemos por tu tierra 🌱
                    </p>
                    <ol className="space-y-2">
                      {([
                        ['1', 'Dibujá o importá tu predio', 'Marcá los mojones en el mapa, cargá coordenadas o importá un archivo.'],
                        ['2', 'Corré el análisis', 'Topografía, agua, sol y suelo desde el riel de la izquierda.'],
                        ['3', 'Generá el informe', 'Un PDF de marca con todo el diagnóstico, listo para compartir.'],
                      ] as Array<[string, string, string]>).map(([n, t, d]) => (
                        <li key={n} className="flex gap-2.5">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-moss-100 text-moss-700 text-[10px] font-bold flex items-center justify-center mt-0.5">{n}</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-ink-800 leading-tight">{t}</p>
                            <p className="text-[10px] text-ink-700/55 leading-snug">{d}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button onClick={handleCargarEjemplo}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sun-500 text-ink-900 hover:brightness-95 transition-all shadow-paper">
                      <Sparkles className="w-3.5 h-3.5" /> Cargar terreno de ejemplo
                    </button>
                    <p className="text-[10px] text-ink-700/45 text-center leading-relaxed">
                      …o agregá tus mojones abajo o haciendo clic en el mapa.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {mojones.map((m, i) => (
                      <div
                        key={m.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(i)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <MojonItem
                          mojon={m}
                          seleccionado={seleccionado === m.id}
                          onSelect={() => setSeleccionado(s => s === m.id ? null : m.id)}
                          onDelete={() => eliminarMojon(m.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-bone-200 pt-4">
                <MojonForm modoClick={modoClick} onToggleModoClick={() => setModoClick(p => !p)} onAgregar={(lat, lng) => agregarMojon(lat, lng, true)} onCargarMojones={setMojones} />
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

          {tab === 'infra' && (
            <div className="px-4 py-4 space-y-2">
              <p className="text-[11px] text-ink-700/60 leading-relaxed">
                Elegí un símbolo y hacé clic en el mapa para colocar infraestructuras y elementos. Aparecen como pines editables (en Mojones · Puntos de referencia).
              </p>
              {bloqueActivo ? (
                <div className="flex items-center gap-2 bg-sun-300/20 border border-sun-300 rounded-lg px-2.5 py-1.5">
                  <span className="text-base leading-none">{bloqueActivo.icono}</span>
                  <span className="text-[11px] text-ink-900 flex-1 leading-tight">Hacé clic en el mapa: <b>{bloqueActivo.nombre}</b></span>
                  <button onClick={() => { setBloqueActivo(null); setModoPinClick(false); }} className="text-ink-700/40 hover:text-ink-700 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <p className="text-[10px] text-ink-700/50 leading-tight">Ningún símbolo seleccionado.</p>
              )}
              {GRUPOS_BLOQUE.map(grupo => (
                <div key={grupo}>
                  <p className="text-[9px] uppercase tracking-wide text-ink-700/45 mb-1">{grupo}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {BLOQUES.filter(b => b.grupo === grupo).map(b => (
                      <button key={b.id} title={b.nombre}
                        onClick={() => { setBloqueActivo(b); setModoPinClick(true); setModoClick(false); }}
                        className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-center transition-colors ${bloqueActivo?.id === b.id ? 'border-moss-400 bg-moss-100' : 'border-bone-200 hover:bg-bone-50'}`}>
                        <span className="text-base leading-none">{b.icono}</span>
                        <span className="text-[7px] text-ink-700/60 leading-none truncate w-full px-0.5">{b.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'elementos' && (
            <div className="px-4 py-4 space-y-2">
              <p className="text-[11px] text-ink-700/60 leading-relaxed">
                Elegí un elemento y colocalo <b>a escala real</b> sobre el mapa. Los redondos y los vehículos se estampan con un clic (el sello queda activo para poner varios); los <b>canteros y masas</b> se dibujan a mano (clic en cada vértice, Enter para cerrar). Se ven también en la vista 3D.
              </p>
              {elementoActivo ? (
                <div className="flex items-center gap-2 bg-moss-100 border border-moss-300 rounded-lg px-2.5 py-1.5">
                  <span className="text-base leading-none">{elementoActivo.emoji}</span>
                  <span className="text-[11px] text-ink-900 flex-1 leading-tight">
                    {elementoActivo.forma === 'poligono'
                      ? <>Dibujá el contorno de <b>{elementoActivo.nombre}</b> <span className="text-ink-700/50">· Enter para cerrar</span></>
                      : <>Colocá en el mapa: <b>{elementoActivo.nombre}</b> <span className="text-ink-700/50">· {elementoActivo.forma === 'rect' ? `${elementoActivo.largo_m}×${elementoActivo.ancho_m} m` : `r ${elementoActivo.radio_m} m`}</span></>}
                  </span>
                  <button onClick={() => { setElementoActivo(null); setModoElementoClick(false); setElementoPoli(null); if (modoDibujo) handleCancelarDibujo(); }} className="text-ink-700/40 hover:text-ink-700 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <p className="text-[10px] text-ink-700/50 leading-tight">Ningún elemento seleccionado.</p>
              )}
              {GRUPOS_ELEMENTO.map(grupo => (
                <div key={grupo}>
                  <p className="text-[9px] uppercase tracking-wide text-ink-700/45 mb-1">{grupo}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {ELEMENTOS.filter(e => e.grupo === grupo).map(e => (
                      <button key={e.id} title={e.nombre}
                        onClick={() => {
                          setElementoActivo(e); setModoPinClick(false); setBloqueActivo(null); setModoClick(false);
                          if (e.forma === 'poligono') { setModoElementoClick(false); handleCambiarModo('poligono'); setElementoPoli(e); }
                          else { setModoElementoClick(true); setElementoPoli(null); }
                        }}
                        className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-center transition-colors ${elementoActivo?.id === e.id ? 'border-moss-400 bg-moss-100' : 'border-bone-200 hover:bg-bone-50'}`}>
                        <span className="text-base leading-none">{e.emoji}</span>
                        <span className="text-[7px] text-ink-700/60 leading-none truncate w-full px-0.5">{e.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'clima' && <div className="px-4 py-4"><ClimaPanel
            mojones={mojones} datos={datosClima} onDatos={setDatosClimaRaw}
            extremos={datosExtremos} onExtremos={setDatosExtremos}
            calibracion={calibracionPrecip} onCalibracion={setCalibracionPrecip}
            precipCruda={datosClimaRaw?.precip_anual_mm ?? null}
            pendientePct={datosTopografia?.pendiente_pct ?? null}
            buscandoCHIRPS={buscandoCHIRPS}
          /></div>}
          {tab === 'contexto' && <div className="px-4 py-4"><ContextoPanel mojones={mojones} datosClima={datosClima} datosTopo={datosTopografia} onIrAClima={() => setTab('clima')} /></div>}
          {tab === 'topo'  && <div className="px-4 py-4"><TopografiaPanel mojones={mojones} datos={datosTopografia} onDatos={setDatosTopografia} cargando={topoLoading} onCargando={setTopoLoading} error={topoError} onError={setTopoError} onFetchShader={handleFetchShader} shaderCargando={shaderLoading} /></div>}
          {tab === 'suelo' && <div className="px-4 py-4"><SuelosPanel mojones={mojones} datos={datosSuelo} onDatos={setDatosSuelo} cargando={sueloLoading} onCargando={setSueloLoading} error={sueloError} onError={setSueloError} /></div>}
          {tab === 'cobertura' && <div className="px-4 py-4"><CoberturaPanel mojones={mojones} datos={datosCobertura} onDatos={setDatosCobertura} onResumen={setCoberturaResumen} /></div>}
          {tab === 'entorno' && <div className="px-4 py-4"><EntornoPanel mojones={mojones} datos={datosEntorno} onDatos={setDatosEntorno} onResumen={setEntornoResumen} /></div>}
          {tab === 'cal'   && <div className="px-4 py-4"><CalendarioPanel datosClima={datosClima} onIrAClima={() => setTab('clima')} /></div>}
          {tab === 'solar' && (
            <div className="px-4 py-4">
              <SolarPanel
                mojones={mojones}
                datosClima={datosClima}
                arcSolarVisible={capas.arcSolar}
                onMostrarEnMapa={() => setCapas(prev => ({ ...prev, arcSolar: !prev.arcSolar }))}
              />
            </div>
          )}
          {tab === 'sombras' && (
            <div className="px-4 py-4">
              <SombrasPanel
                tieneShader={!!datosShader}
                activo={sombrasActivo} doy={sombrasDoy} hora={sombrasHora}
                sombras={sombras}
                animando={animando}
                insolacion={insolacion} calculandoIns={calculandoIns}
                objetos={sombrasObjetos} modoArbol={modoArbol}
                poligonos={poligonosLevantables}
                onActivo={setSombrasActivo} onDoy={setSombrasDoy} onHora={setSombrasHora}
                onAnimar={handleAnimar}
                onInsolacion={handleInsolacion}
                onLimpiarInsolacion={() => setInsolacion(null)}
                onAgregarObjeto={handleAgregarObjeto}
                onAlturaObjeto={handleAlturaObjeto}
                onEliminarObjeto={handleEliminarObjeto}
                onIrATopo={() => setTab('topo')}
              />
            </div>
          )}
          {tab === 'visibilidad' && (
            <div className="px-4 py-4 space-y-4">
              <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Visibilidad (viewshed)</p>
              {!datosShader ? (
                <p className="text-[11px] text-ink-700/60 bg-bone-50 border border-bone-200 rounded-xl p-3 flex gap-2">
                  <span className="text-sun-500">⚠</span>
                  <span>Calculá primero la <button onClick={() => setTab('topo')} className="underline text-moss-700">topografía</button> (grilla densa) para analizar la visibilidad del terreno.</span>
                </p>
              ) : (
                <>
                  <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-ink-700/60">Altura del observador (m)</span>
                      <span className="font-mono text-xs text-moss-700">{alturaObs} m</span>
                    </div>
                    <input type="range" min={1} max={30} step={0.5} value={alturaObs}
                      onChange={e => setAlturaObs(Number(e.target.value))} className="w-full accent-moss-700" />
                    <p className="text-[9px] text-ink-700/45">Persona ≈ 1,7 m · vivienda ≈ 3–6 m · torre/molino ≈ 10–20 m.</p>
                  </div>
                  <button onClick={() => setModoViewshed(v => !v)}
                    className={`w-full flex items-center justify-center gap-2 text-xs font-medium rounded-xl px-3 py-2.5 transition-colors border ${modoViewshed ? 'bg-clay-100 text-clay-700 border-clay-300' : 'bg-moss-700 text-bone-50 border-moss-700 hover:bg-moss-800'}`}>
                    <Eye className="w-4 h-4" />
                    {modoViewshed ? 'Hacé clic en el mapa…' : viewshed ? 'Elegir otro punto' : 'Elegir punto de observación'}
                  </button>
                  {viewshed && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-moss-200 bg-moss-50 p-2.5">
                          <p className="text-[10px] text-moss-700/70 mb-0.5">Área visible</p>
                          <p className="font-mono text-sm font-bold text-moss-700">{viewshed.visibles_pct}%</p>
                        </div>
                        <div className="rounded-xl border border-bone-200 bg-white p-2.5">
                          <p className="text-[10px] text-ink-700/60 mb-0.5">Cota del punto</p>
                          <p className="font-mono text-sm font-bold text-ink-900">{Math.round(viewshed.origen.elev)} m</p>
                        </div>
                      </div>
                      <button onClick={() => setViewshed(null)} className="w-full text-[11px] text-clay-700 bg-clay-100 border border-clay-200 rounded-lg px-3 py-1.5 hover:bg-clay-200 transition-colors">Limpiar</button>
                    </>
                  )}
                  <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                    Verde = superficie visible desde el punto (línea de visión sobre el MDE SRTM 30 m). No considera vegetación ni construcciones. Útil para miradores, torres de agua, cámaras y privacidad.
                  </p>
                </>
              )}
            </div>
          )}
          {tab === 'agua'  && <div className="px-4 py-4"><CaptacionPanel datosClima={datosClima} onIrAClima={() => setTab('clima')} onSnapshot={setCaptacionSnap} snapshotInicial={captacionSnap} /></div>}
          {tab === 'prod'  && <div className="px-4 py-4"><ProduccionPanel datosClima={datosClima} mojones={mojones} areaHa={metricas?.area_ha ?? 0} onIrAClima={() => setTab('clima')} onAgregarCortinas={handleAgregarCortinas} /></div>}
          {tab === 'aptitud' && <div className="px-4 py-4"><AptitudPanel datosShader={datosShader} datosEscorrentia={datosEscorrentia} onAplicarZonas={handleAplicarZonasAptitud} onIrATopo={() => { setTab('topo'); }} /></div>}
          {tab === 'analisis' && (
            <div className="px-4 py-4">
              <AnalisisRelievePanel
                mojones={mojones}
                onAplicar={handleAplicarAnalisisIntegral}
                topoLista={!!datosShader && !!datosEscorrentia}
                onIrATopo={() => setTab('topo')}
                onAnalizado={handleAnalisisPredioListo}
              />
            </div>
          )}

          {tab === 'zonas' && (
            <div className="px-4 py-4">
              <ZonificacionPanel
                zonas={zonas} onZonas={setZonas} modoZona={modoZona}
                onIniciarDibujo={handleIniciarZona} onFinalizarZona={handleFinalizarZona} onCancelarZona={handleCancelarZona}
              />
            </div>
          )}
          {tab === 'masterplan' && (
            <div className="px-4 py-4">
              <MasterPlanPanel
                programa={programaMP}
                onPrograma={setProgramaMP}
                masterPlan={masterPlan}
                onGenerarMasterPlan={handleGenerarMasterPlan}
                onConvertirZona={handleConvertirZonaMP}
                onDescartarElemento={handleDescartarElementoMP}
                areaPredioHa={metricas?.area_ha ?? null}
                zona0={zona0}
                modoMarcarZona0={modoZona0}
                onMarcarZona0={() => setModoZona0(v => !v)}
                onQuitarZona0={() => setZona0(null)}
                topoLista={!!datosShader && !!datosEscorrentia}
                onIrATopo={() => setTab('topo')}
                onIrAHerramienta={(t) => setTab(t as Tab)}
              />
            </div>
          )}
          {tab === 'sectores' && (
            <div className="px-4 py-4">
              <SectoresPanel
                mojones={mojones} datosClima={datosClima} datosTopografia={datosTopografia}
                sectores={sectores} onSectores={setSectores} modoSector={modoSector}
                onIniciarDibujo={handleIniciarSector} onFinalizarSector={handleFinalizarSector} onCancelarSector={handleCancelarSector}
                onAplicarSector={handleAplicarSectorAuto}
                onAplicarViviendas={handleAplicarViviendas}
              />
            </div>
          )}
          {tab === 'aguadas' && (
            <div className="px-4 py-4 space-y-4">
              <SitiosRepresaPanel mojones={mojones} onUbicar={handleUbicarSitio} />
              <div className="border-t border-bone-200 pt-4">
                <CutFillPanel mojones={mojones} datosShader={datosShader} poligonos={poligonosCutFill} onDibujarEspejo={handleDibujarEspejo} datosClima={datosClima} cuencaHa={cuenca?.area_ha ?? null} grupoHidro={datosSuelo?.grupo_hidro?.grupo ?? null} onResumenRepresa={setRepresaResumen} onCuencaCalculada={(c) => { setCuenca(c); setCuencaExpandida(false); }} onMuroLinea={setMuroLinea} />
              </div>
            </div>
          )}
          {tab === 'keyline' && (
            <div className="px-4 py-4">
              <KeylinePanel mojones={mojones} datosShader={datosShader} parcelas={poligonosCutFill} onAplicarGuias={handleAplicarKeyline} onAplicarPatron={handleAplicarPatron} />
            </div>
          )}
          {tab === 'caminos' && (
            <div className="px-4 py-4">
              <CaminosPanel
                caminos={caminos} onCaminos={setCaminos} modoCamino={modoCamino}
                onIniciarDibujo={handleIniciarCamino} onFinalizarCamino={handleFinalizarCamino} onCancelarCamino={handleCancelarCamino}
                onAbrirPerfil={handleAbrirPerfilDock} perfilDockId={perfilDock?.nombre ?? null}
                perfilCargando={perfilCargando} perfilError={perfilError}
                onOptimizarCresta={handleOptimizarCamino}
              />
            </div>
          )}
          {tab === 'red' && (
            <div className="px-4 py-4">
              <RedAguaPanel
                caminos={caminos}
                onCargarPerfil={handleCargarPerfilCamino}
                onIrACaminos={() => setTab('caminos')}
                onResumen={setRedAguaResumen}
                inicial={redAguaInputs}
                onInputs={setRedAguaInputs}
              />
            </div>
          )}
          {tab === 'pastoreo' && (
            <div className="px-4 py-4">
              <PastoreoPanel areaHa={metricas?.area_ha ?? 0} datosClima={datosClima} mojones={mojones} tieneDibujo={!!potrerosLayer} onDibujar={setPotrerosLayer} onIrAClima={() => setTab('clima')} parcelas={poligonosCutFill} onCaminosAcceso={handleCaminosAccesoPotreros} inicial={pastoreoInputs} onInputs={setPastoreoInputs} />
            </div>
          )}
          {tab === 'riego' && (
            <div className="px-4 py-4">
              <RiegoPanel areaHa={metricas?.area_ha ?? 0} datosClima={datosClima} datosSuelo={datosSuelo} onIrAClima={() => setTab('clima')} onResumen={setRiegoResumen} parcelas={poligonosCutFill} inicial={riegoInputs} onInputs={setRiegoInputs} />
            </div>
          )}
          {tab === 'swales' && (
            <div className="px-4 py-4">
              <SwalesPanel
                grillaLista={!!grillaActiva}
                swales={swales}
                onGenerar={handleGenerarSwales}
                onColocar={handleColocarSwales}
                onIrATopo={() => setTab('topo')}
              />
            </div>
          )}
          {tab === 'cortafuegos' && (
            <div className="px-4 py-4">
              <CortafuegosPanel
                topoLista={!!datosShader}
                cortafuegos={cortafuegos}
                onGenerar={handleGenerarCortafuegos}
                onColocar={handleColocarCortafuegos}
                onIrATopo={() => setTab('topo')}
              />
            </div>
          )}
          {tab === 'carbono' && (
            <div className="px-4 py-4">
              <CarbonoPanel
                areaHa={metricas?.area_ha ?? 0}
                datosSuelo={datosSuelo} datosCobertura={datosCobertura}
                onResumen={setCarbonoResumen}
              />
            </div>
          )}
          {tab === 'economia' && (
            <div className="px-4 py-4">
              <EconomiaPanel
                metricas={metricas} redAgua={redAguaResumen} represa={represaResumen} riego={riegoResumen}
                resumenInicial={economiaResumen}
                onResumen={setEconomiaResumen}
              />
            </div>
          )}
          {tab === 'cuenca' && (
            <div className="px-4 py-4">
              <CuencaPanel
                tieneShader={!!datosShader}
                cuenca={cuenca}
                grupoHidro={datosSuelo?.grupo_hidro?.grupo ?? null}
                precipT10={datosExtremos?.tormenta.recurrencias.find(r => r.periodo_retorno === 10)?.mm ?? null}
                modoActivo={modoCuenca}
                cargando={cuencaLoading}
                aviso={cuencaAviso}
                poligonos={poligonosCutFill}
                expandida={cuencaExpandida}
                onMarcar={() => setModoCuenca(m => !m)}
                onLimpiar={() => { setCuenca(null); setModoCuenca(false); setCuencaAviso(null); setCuencaExpandida(false); }}
                onIrATopo={() => setTab('topo')}
                onUsarPoligono={handleUsarPoligonoCuenca}
                onEditarCuenca={handleEditarCuenca}
                onExtender={handleExtenderCuenca}
              />
            </div>
          )}
          {tab === 'proyectos' && (
            <div className="px-4 py-4 space-y-4">
              <ProyectosPanel
                mojones={mojones} zonas={zonas} sectores={sectores} pines={pines} caminos={caminos}
                proyectoActual={proyectoActual}
                onCargarProyecto={handleCargarProyecto} onProyectoActualChange={handleProyectoActualChange}
                metadatos={metadatos}
                onConfirm={(msg, fn) => setModal({ type: 'confirm', message: msg, onConfirm: fn })}
                plan={plan}
              />
              <div className="border-t border-bone-200 pt-4">
                <EscenariosPanel
                  escenarios={escenariosMeta}
                  activoId={escenarioActivoId}
                  onGuardarNuevo={handleGuardarEscenario}
                  onCargar={handleCargarEscenario}
                  onActualizar={handleActualizarEscenario}
                  onRenombrar={handleRenombrarEscenario}
                  onEliminar={handleEliminarEscenario}
                />
              </div>
            </div>
          )}
          </>);
          })()}
          </div>
        </div>
      </aside>

      {/* Toggle panel izquierdo */}
      <button
        onClick={() => setPanelAbierto(p => !p)}
        className="absolute top-1/2 -translate-y-1/2 z-[1100] bg-white border border-bone-200 rounded-r-lg px-1 py-3 text-moss-700 hover:bg-bone-50 shadow-paper transition-all duration-200 no-print"
        style={{ left: panelAbierto ? '340px' : '52px' }}
        title={panelAbierto ? 'Ocultar panel' : 'Mostrar panel'}
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${panelAbierto ? 'rotate-180' : ''}`} />
      </button>

      {/* Toggle panel derecho (capas) */}
      <button
        onClick={() => setPanelDerecho(p => (p === null ? 'capas' : null))}
        className="absolute top-1/2 -translate-y-1/2 z-[1001] bg-white border border-bone-200 rounded-l-lg px-1 py-3 text-moss-700 hover:bg-bone-50 shadow-paper transition-all duration-200 no-print"
        style={{ right: panelDerecho === 'capas' ? `${12 + 224}px` : panelDerecho === 'sugerencias' || panelDerecho === 'bitacora' ? `${12 + 256}px` : '12px' }}
        title={panelDerecho !== null ? 'Cerrar panel' : 'Mostrar capas'}
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${panelDerecho === null ? 'rotate-180' : ''}`} />
      </button>

      {/* ─── Mapa ─────────────────────────────────────────────────────────────── */}
      <main id="print-capture-root" className={`flex-1 relative overflow-hidden ${capturaActiva ? 'bg-bone-50 pt-[58px] pr-[212px] pb-[50px] pl-3' : ''}`}>
        {/* Banner de autosave (se colapsa a un chip a los 9 s) */}
        {autosaveBanner && (autosaveMin ? (
          <button
            onClick={() => setAutosaveMin(false)}
            title="Tenés trabajo sin guardar de una sesión anterior"
            className="absolute top-3 left-3 z-[1001] no-print flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full shadow-raised text-[11px] font-medium bg-white border border-bone-200 text-ink-700 hover:bg-bone-50 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-moss-500" />
            Borrador sin guardar
          </button>
        ) : (
          <div className="absolute top-3 left-3 z-[1001] no-print flex items-center gap-2 px-4 py-2 rounded-full shadow-raised text-xs font-medium bg-white border border-bone-200 text-ink-800 whitespace-nowrap">
            <span className="text-moss-700">
              Trabajo sin guardar del {new Date(autosaveBanner.savedAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleRestaurarAutosave}
              className="px-2.5 py-1 rounded-md bg-moss-700 text-bone-50 hover:bg-moss-900 transition-colors text-[10px] font-semibold"
            >
              Restaurar
            </button>
            <button
              onClick={handleDescartarAutosave}
              className="px-2.5 py-1 rounded-md bg-bone-100 text-ink-700 hover:bg-bone-200 transition-colors text-[10px] font-semibold"
            >
              Descartar
            </button>
          </div>
        ))}

        {/* Banner de modo dibujo */}
        {(modoClick || dibujando) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] text-sm px-5 py-2.5 rounded-full shadow-raised font-medium pointer-events-none bg-sun-500 text-ink-950 no-print">
            {modoZona    ? `Dibujando zona — ${modoZona.vertices.length} vértices · Enter finaliza · Esc cancela`   :
             modoSector  ? `Dibujando sector — ${modoSector.vertices.length} vértices · Enter finaliza · Esc cancela` :
             modoCamino  ? `Trazando camino — ${modoCamino.vertices.length} puntos · Enter finaliza · Esc cancela`  :
             modoPinClick? 'Hacé clic en el mapa para colocar el pin' :
             modoArbol   ? 'Hacé clic en el mapa para plantar el árbol' :
             modoViewshed? 'Hacé clic en el mapa para elegir el punto de observación' :
             modoCuenca  ? 'Hacé clic en el mapa para elegir el punto de cierre de la cuenca' :
             modoDibujo === 'medir'
               ? `Midiendo — ${medicionVertices.length} puntos · distancia · área · ∠ · Backspace borra · Enter/Esc limpia`
               : modoDibujo === 'cota'
               ? (dibujoEnCurso?.vertices.length ? 'Clic en el punto final de la cota' : 'Clic en el punto inicial de la cota')
               : modoDibujo && modoDibujo !== 'seleccion'
               ? `Dibujando ${modoDibujo} — ${dibujoEnCurso?.vertices.length ?? 0} puntos · Enter finaliza · Esc cancela`
               :            'Hacé clic en el mapa para agregar un mojón'}
          </div>
        )}

        {/* ── Navegación + panel derecho (Capas / Sugerencias) ──
            Todo en una columna arriba a la derecha: los controles quedan fijos
            y el panel se despliega debajo. */}
        <div className="absolute top-3 right-3 z-[1000] no-print flex flex-col items-end gap-1.5">
          <BuscadorLugar onElegir={handleElegirLugar} />
          <ControlesMapa
            navegacion={navegacion}
            bearing={bearing}
            capaFondo={capaFondo}
            onCapaFondo={setCapaFondo}
            habilitarVistas={mojones.length >= 3}
            onHistorico={() => { if (tabBloqueada(plan, 'topo')) { setTab('topo'); setPanelAbierto(true); } else setShowHistorico(true); }}
            on3D={() => { if (tabBloqueada(plan, 'topo')) { setTab('topo'); setPanelAbierto(true); } else setShow3D(true); }}
            capasAbierto={panelDerecho === 'capas'}
            onCapas={() => setPanelDerecho(p => (p === 'capas' ? null : 'capas'))}
            escalaAbierta={panelDerecho === 'bitacora'}
            onEscala={() => setPanelDerecho(p => (p === 'bitacora' ? null : 'bitacora'))}
          />

          {/* Panel de Capas */}
          {panelDerecho === 'capas' && (
            <PanelCapas
              capas={capas} onCapas={setCapas}
              datosArcoSolar={datosArcoSolar}
              zonas={zonas} sectores={sectores} pines={pines} caminos={caminos}
              dibujos={dibujos}
              aguadasLayer={aguadasLayer}
              ocultosIds={ocultosIds} onToggle={toggleOculto}
              onRenombrarPin={handleRenombrarPin}     onEliminarPin={handleEliminarPin}
              onRenombrarZona={handleRenombrarZona}   onEliminarZona={handleEliminarZona}
              onRenombrarSector={handleRenombrarSector} onEliminarSector={handleEliminarSector}
              onRenombrarCamino={handleRenombrarCamino} onEliminarCamino={handleEliminarCamino}
              onRenombrarDibujo={handleRenombrarDibujoCapas} onEliminarDibujo={handleEliminarDibujoCapas}
              onRenombrarAguada={handleRenombrarAguada} onEliminarAguada={handleEliminarAguada}
              capasUsuario={capasUsuario} capasOcultas={capasOcultas} capaActivaId={capaActivaId}
              onSetCapaActiva={setCapaActivaId}
              onToggleCapaOculta={handleToggleCapaOculta}
              onRenombrarCapa={handleRenombrarCapa}
              onEliminarCapa={handleEliminarCapa}
              onColorCapa={handleColorCapa}
              onReordenarCapa={handleReordenarCapa}
              onMoverDibujoACapa={handleMoverDibujoACapa}
              onCrearCapa={() => setModal({
                type: 'prompt', message: 'Nombre de la nueva capa:', placeholder: 'Ej: Propuesta casa…',
                onConfirm: nombre => handleCrearCapa(nombre),
              })}
              onCargarPlantillaKeyline={handleCargarPlantillaKeyline}
              datosShader={datosShader} analisisHecho={analisisHecho} onIrATopo={() => setTab('topo')} mojones={mojones}
              masterPlanHay={!!masterPlan && masterPlan.length > 0}
              masterPlan={masterPlan}
              hayConectoresMP={mpCaminos.length > 0}
              subCapasOcultas={subCapasOcultas}
              onToggleSubCapa={toggleSubCapa}
              datosErosion={datosErosion}
              haySwales={!!swales}
              hayCortafuegos={!!cortafuegos}
              onCapturar={() => {
                setPanelDerecho(null);
                setCapturaActiva(true);
                if (!capturaTitulo) setCapturaTitulo(proyectoActual?.nombre ?? 'Mapa del terreno');
                // Inicializar leyenda editable con los ítems actuales
                setLeyendaEditada(leyendaItems.map((it, i) => ({ ...it, id: String(i) })));
              }}
              onGuardarPng={handleGuardarPng}
              guardandoPng={guardandoPng}
              onCerrar={() => setPanelDerecho(null)}
              terrariumElevMin={terrariumElevMin}
              terrariumElevMax={terrariumElevMax}
              intervaloContorno={intervaloContorno}
              setIntervaloContorno={setIntervaloContorno}
              intervaloCurvas={intervaloCurvasEfectivo}
              demPropio={demPropio}
              pisoIntervalo={pisoIntervalo}
              curvasDemasiadas={curvasDemasiadas}
              curvasLoading={curvasLoading}
              colorCurvas={colorCurvas}
              onColorCurvas={setColorCurvas}
              opacidadShader={opacidadShader}
              onOpacidadShader={setOpacidadShader}
              onResetTerrariumRango={handleResetTerrariumRango}
            />
          )}

          {/* Panel de Escala de permanencia (bitácora) */}
          {panelDerecho === 'bitacora' && (
            <EscalaPermanenciaPanel
              check={keylineCheck}
              onCheck={handleCheckKeyline}
              onVolver={() => setPanelDerecho('capas')}
            />
          )}
        </div>

        {/* ── Perfil de elevación interactivo (dock inferior) ── */}
        {perfilDock && (
          <PerfilPanel
            perfil={perfilDock.perfil}
            vertices={perfilDock.vertices}
            nombre={perfilDock.nombre}
            color={perfilDock.color}
            onHover={setPerfilPunto}
            onClose={() => { setPerfilDock(null); setPerfilPunto(null); }}
          />
        )}

        {/* La brújula vive dentro de MapLeaflet: tiene que girar con el rumbo. */}

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
          perfilPunto={perfilPunto}
          dibujando={!!dibujando}
          datosShader={datosShader}
          zoomSatelital={zoomSatelital}
          sombras={sombras}
          sombrasObjetos={sombrasObjetos}
          insolacion={insolacion}
          viewshed={viewshed}
          datosEscorrentia={datosEscorrentia}
          datosErosion={datosErosion}
          swales={swales}
          cortafuegos={cortafuegos}
          cuencaPoligono={cuenca?.poligono ?? null}
          cuencaOutlet={cuenca?.outlet ?? null}
          muroLinea={muroLinea}
          potrerosLayer={potrerosLayer}
          capas={capas}
          dibujos={dibujosFiltrados}
          dibujoEnCurso={dibujoEnCurso}
          dibujoSelId={dibujoSelId}
          onClickDibujo={handleClickDibujo}
          onMoverDibujo={handleMoverDibujo}
          onMoverVertice={handleMoverVertice}
          onInsertarVertice={handleInsertarVertice}
          onEliminarVertice={handleEliminarVertice}
          onRedimensionarCirculo={handleRedimensionarCirculo}
          modoDibujo={modoDibujo}
          colorDibujo={colorDibujo}
          elevMin={terrariumElevMin}
          elevMax={terrariumElevMax}
          onRangoTerrarium={handleRangoTerrarium}
          opacidadShaderElev={opacidadShader.elev}
          opacidadShaderPend={opacidadShader.pend}
          aguadasLayer={aguadasFiltradas}
          datosArcoSolar={datosArcoSolar}
          onMoverArcoSolar={handleMoverArcoSolar}
          onMoverPin={handleMoverPin}
          onGetBounds={handleGetBounds}
          onGetFlyTo={handleGetFlyTo}
          onMapChange={handleMapChange}
          onGetNavegacion={handleGetNavegacion}
          onBearing={setBearing}
          capaFondo={capaFondo}
          metricas={metricas}
          curvasNivel={curvasNivel}
          colorCurvasNivel={colorCurvas}
          snapActivo={snapActivo}
          orthoActivo={orthoActivo}
          snapPuntos={snapPuntos}
          snapSegmentos={snapSegmentos}
          tipoActivo={tipoActivo}
          verticesActivos={verticesActivos}
          colorPreview={colorPreview}
          medicion={modoDibujo === 'medir' ? medicionVertices : null}
          onCursorCad={handleCursorCad}
          onCursorMove={handleCursorMove}
          capturaMode={capturaActiva}
          layoutSignal={`${panelAbierto}|${panelDerecho}`}
          overlay={overlay}
          onOverlayEsquina={handleOverlayEsquina}
          masterPlan={masterPlanVisible}
          masterPlanCaminos={mpCaminosVisible}
          marcadorBusqueda={marcadorBusqueda}
          zona0={zona0}
        />

        {/* Crédito de la fuente de relieve (atribución dinámica DEM) */}
        {!capturaActiva && datosShader?.fuente && (
          <div className="no-print absolute bottom-1.5 left-3 z-[900] pointer-events-none">
            <span className="text-[9px] text-ink-700/70 bg-white/85 backdrop-blur-sm rounded px-1.5 py-0.5 border border-bone-200/70 shadow-sm">
              {ETIQUETA_RELIEVE[datosShader.fuente]}
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            OVERLAYS DE CAPTURA — van DESPUÉS de MapLeaflet en el DOM para que
            html-to-image los renderice encima del mapa (orden DOM > z-index).
            ───────────────────────────────────────────────────────────────────── */}
        {capturaActiva && (
          <>
            {/* ── Título (banda superior) — compacto, no tapa el mapa ─────────── */}
            <div id="captura-titulo" className="absolute top-1.5 left-3 z-[1001] pointer-events-auto flex items-baseline gap-2 max-w-[calc(100%-224px)]">
              <img src="/logo-ayt.png" alt="" className="w-6 h-6 object-contain self-center shrink-0" />
              <p className="font-display text-base font-bold text-ink-950 leading-tight truncate">
                {capturaTitulo || 'Mapa del terreno'}
              </p>
              <p className="text-[10px] text-ink-700/55 font-mono shrink-0">
                {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              {/* Campo de edición — filtrado en PNG */}
              <input
                value={capturaTitulo}
                onChange={e => setCapturaTitulo(e.target.value)}
                placeholder="Título…"
                className="no-print w-40 text-xs bg-white border border-bone-200 rounded px-2 py-1 text-ink-950 focus:outline-none focus:ring-1 focus:ring-moss-500"
              />
            </div>

            {/* ── Norte + Escala (banda inferior) — fila ──────────────────────── */}
            <div id="captura-norte-escala" className="absolute bottom-1.5 left-3 z-[1001] flex flex-row items-center gap-2">
              {/* Flecha de norte */}
              <div className="flex items-center gap-1 bg-white border border-bone-200 rounded-lg px-2 py-1.5 shadow">
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                  <polygon points="9,1 14,14 9,11 4,14" fill="#1B3A2D" />
                  <polygon points="9,21 4,8 9,11 14,8" fill="#9CA3AF" />
                  <text x="9" y="10.5" textAnchor="middle" fontSize="5" fontWeight="700" fontFamily="sans-serif" fill="#FBF8F3">N</text>
                </svg>
              </div>
              {/* Barra de escala */}
              <div className="bg-white border border-bone-200 rounded-lg px-2 py-1.5 shadow flex flex-col items-start gap-0.5">
                <div className="flex items-end gap-0" style={{ width: `${escalaGrafica.pixeles}px` }}>
                  <div className="flex-1 h-1.5 border-l-2 border-r-2 border-b-2 border-ink-800" />
                </div>
                <span className="text-[9px] font-mono font-semibold text-ink-800">{escalaGrafica.label}</span>
              </div>
              {/* Crédito de relieve (atribución en el PNG) */}
              {datosShader?.fuente && (
                <div className="bg-white border border-bone-200 rounded-lg px-2 py-1.5 shadow">
                  <span className="text-[8px] text-ink-700/70 font-mono">{ETIQUETA_RELIEVE[datosShader.fuente]}</span>
                </div>
              )}
            </div>

            {/* ── Leyenda (banda derecha, arriba) ────────────────────────────── */}
            {(leyendaEditada ?? []).length > 0 && (
              <div id="captura-leyenda" className="absolute top-[60px] right-3 z-[1001] bg-white border border-bone-200 rounded-xl shadow-lg px-3 py-2.5 w-[196px]">
                <p className="text-[9px] font-bold text-ink-800 uppercase tracking-wider mb-1.5">Leyenda</p>

                {/* ─ Ítems estáticos (visibles en PNG) ─ */}
                <div className="space-y-1">
                  {(leyendaEditada ?? []).map(item => (
                    <div key={item.id} className="flex items-center gap-1.5">
                      {item.icon ? (
                        <span className="text-sm leading-none w-4 shrink-0 text-center">{item.icon}</span>
                      ) : item.dash ? (
                        <span className="w-4 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: item.color }} />
                      ) : (
                        <span className="w-4 h-3 rounded-sm shrink-0" style={{ background: item.color ?? '#999' }} />
                      )}
                      <span className="text-[10px] text-ink-800 leading-tight flex-1 truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-ink-700/30 mt-1.5 font-mono italic">Arte y Tierra</p>

                {/* ─ Panel edición (no-print) — scrollable ─ */}
                <div className="no-print mt-2.5 pt-2.5 border-t border-bone-200 space-y-1 max-h-48 overflow-y-auto">
                  <p className="text-[9px] text-moss-700 font-semibold mb-1 sticky top-0 bg-white pb-0.5">✏ Editar leyenda</p>
                  {(leyendaEditada ?? []).map(item => (
                    <div key={`ed-${item.id}`} className="flex items-center gap-1">
                      {item.icon ? (
                        <span className="text-xs w-4 shrink-0 text-center">{item.icon}</span>
                      ) : item.dash ? (
                        <span className="w-3 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: item.color }} />
                      ) : (
                        <span className="w-3 h-2.5 rounded-sm shrink-0" style={{ background: item.color ?? '#999' }} />
                      )}
                      <input
                        type="text"
                        defaultValue={item.label}
                        onBlur={e => {
                          const v = e.target.value.trim();
                          if (v) setLeyendaEditada(prev => prev?.map(x => x.id === item.id ? { ...x, label: v } : x) ?? null);
                          else e.target.value = item.label;
                        }}
                        className="flex-1 min-w-0 text-[9px] text-ink-800 bg-bone-50 border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-moss-500"
                      />
                      <button
                        onClick={() => setLeyendaEditada(prev => prev?.filter(x => x.id !== item.id) ?? null)}
                        className="shrink-0 text-ink-700/25 hover:text-clay-500 transition-colors"
                        title="Quitar de leyenda"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="w-full flex items-center justify-center gap-1 mt-1 py-1 rounded text-[9px] text-moss-700 hover:bg-bone-50 transition-colors border border-dashed border-bone-200"
                    onClick={() => setModal({
                      type: 'prompt', message: 'Texto para el ítem de leyenda:', placeholder: 'Etiqueta…',
                      onConfirm: label => setLeyendaEditada(prev => [...(prev ?? []), { id: crypto.randomUUID(), label }]),
                    })}
                  >
                    + Agregar ítem
                  </button>
                </div>
              </div>
            )}

            {/* ── Rótulo de plano (bottom-right, sobre la leyenda) ─────────── */}
            {rotuloVisible && (
              <div id="captura-rotulo" className="absolute bottom-[56px] right-3 z-[1002] bg-white border border-bone-300 rounded-xl shadow-lg overflow-hidden w-[196px]">
                {/* Banda de marca (cajetín profesional) */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-ink-950 text-bone-50">
                  <img src="/logo-ayt.png" alt="" className="w-5 h-5 object-contain shrink-0 invert brightness-200" />
                  <div className="leading-none flex-1 min-w-0">
                    <p className="text-[6px] uppercase tracking-[0.2em] text-bone-50/60">Arte y Tierra</p>
                    <p className="text-[9px] font-bold truncate">{rotulo.nombre || 'Plano del terreno'}</p>
                  </div>
                  {/* Norte */}
                  <svg width="14" height="18" viewBox="0 0 18 22" fill="none" className="shrink-0">
                    <polygon points="9,1 14,14 9,11 4,14" fill="#FBF8F3" />
                    <polygon points="9,21 4,8 9,11 14,8" fill="#FBF8F3" opacity="0.4" />
                    <text x="9" y="10.5" textAnchor="middle" fontSize="5" fontWeight="700" fontFamily="sans-serif" fill="#1B3A2D">N</text>
                  </svg>
                </div>
                {/* Contenido visible en PNG */}
                <table className="text-[8px] text-ink-800 w-full border-collapse">
                  <tbody>
                    {([
                      ['Propietario',  rotulo.propietario],
                      ['Ubicación',    rotulo.ubicacion],
                      ['Superficie',   metricas?.area_ha ? `${metricas.area_ha.toFixed(2)} ha` : ''],
                      ['Fecha',        rotulo.fecha],
                      ['Escala',       rotulo.escala || `barra ${escalaGrafica.label}`],
                      ['Autor',        rotulo.autor],
                    ] as [string, string][]).filter(([,v]) => v).map(([k, v]) => (
                      <tr key={k} className="border-t border-bone-200/60">
                        <td className="px-2 py-0.5 font-semibold text-ink-700/60 whitespace-nowrap border-r border-bone-200/60 bg-bone-50">{k}</td>
                        <td className="px-2 py-0.5 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Formulario de edición — filtrado en PNG */}
                <div className="no-print border-t border-bone-200 p-2 space-y-1 bg-bone-50/50">
                  <p className="text-[9px] text-moss-700 font-semibold">✏ Editar rótulo</p>
                  {([
                    ['nombre',      'Predio'],
                    ['propietario', 'Propietario'],
                    ['ubicacion',   'Ubicación'],
                    ['fecha',       'Fecha'],
                    ['escala',      'Escala (ej: 1:2000)'],
                    ['autor',       'Autor'],
                  ] as [keyof Rotulo, string][]).map(([field, label]) => (
                    <input
                      key={field}
                      value={rotulo[field]}
                      onChange={e => setRotulo(r => ({ ...r, [field]: e.target.value }))}
                      placeholder={label}
                      className="w-full text-[9px] border border-bone-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Controles de captura (no-print) ──────────────────────────── */}
            <div className="absolute top-4 right-4 z-[1002] flex items-center gap-2 no-print">
              <button
                onClick={handleGuardarPng}
                disabled={guardandoPng}
                className="flex items-center gap-1.5 px-3 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                {guardandoPng
                  ? <><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />Guardando…</>
                  : <><Camera className="w-3.5 h-3.5" />Guardar PNG</>}
              </button>
              <button
                onClick={handleCapturaMap}
                className="flex items-center gap-1.5 px-3 py-2 bg-ink-950 hover:bg-ink-700 text-bone-50 rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
              <button
                onClick={() => setRotuloVisible(r => !r)}
                title="Mostrar/ocultar rótulo de plano"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors ${rotuloVisible ? 'bg-moss-100 text-moss-900 border border-moss-300' : 'bg-white border border-bone-200 text-ink-700 hover:bg-bone-50'}`}
              >
                Rótulo
              </button>
              <button
                onClick={() => { setCapturaActiva(false); setLeyendaEditada(null); }}
                className="p-2 bg-white border border-bone-200 hover:bg-bone-50 text-ink-700 rounded-lg shadow-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </main>
      </div>

      {/* ─── Barra de estado inferior (estilo CAD) ───────────────────────────── */}
      <BarraEstado
        cursorRef={cursorPosRef}
        escala={escalaGrafica}
        snapActivo={snapActivo}
        orthoActivo={orthoActivo}
        onToggleSnap={() => setSnapActivo(p => !p)}
        onToggleOrtho={() => setOrthoActivo(p => !p)}
        modoLabel={modoEstadoLabel}
        entradaActiva={!!tipoActivo}
        onEntradaCoord={handleEntradaCoord}
        areaHa={metricas?.area_ha ?? null}
        nMojones={mojones.length}
        onExportarDXF={handleExportarDXF}
        onImportarDXF={handleImportarDXF}
        overlay={overlay}
        onCargarImagen={handleCargarOverlay}
        onCargarGeoTIFF={handleCargarGeoTIFF}
        onCargarDEM={handleCargarDEM}
        onQuitarDEM={() => setDemPropio(null)}
        demCargado={!!demPropio}
        onOpacidadOverlay={op => setOverlay(prev => prev ? { ...prev, opacidad: op } : prev)}
        onQuitarOverlay={() => setOverlay(null)}
        onAbrirPaleta={() => setPaletaOpen(true)}
        onAbrirAyuda={() => setAyudaOpen(true)}
      />

      {/* ─── Paleta de comandos (Ctrl+K) y atajos (?) ───────────────────────── */}
      {paletaOpen && <ComandoPalette comandos={comandos} onClose={() => setPaletaOpen(false)} />}
      {perfilOpen && <PerfilProfesionalModal onClose={() => setPerfilOpen(false)} />}
      {ayudaOpen  && <AtajosAyuda onClose={() => setAyudaOpen(false)} />}

      {/* ─── Vista 3D (MapLibre) ────────────────────────────────────────────── */}
      {show3D && mojones.length >= 3 && (
        <Vista3D
          mojones={mojones}
          zonas={zonasFiltradas}
          sectores={sectoresFiltrados}
          caminos={caminosFiltrados}
          pines={pinesFiltrados}
          aguadas={aguadasFiltradas}
          dibujos={dibujosFiltrados}
          curvas={curvasNivel}
          colorCurvas={colorCurvas}
          capas={capas}
          zoomSatelital={zoomSatelital}
          onClose={() => setShow3D(false)}
        />
      )}

      {/* ─── Imagen histórica (Wayback) ─────────────────────────────────────── */}
      {showHistorico && mojones.length >= 3 && <VistaHistorica mojones={mojones} onClose={() => setShowHistorico(false)} />}

      {/* ─── Modal global ──────────────────────────────────────────────────── */}
      <Modal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}

// ─── Ítem del menú Exportar ───────────────────────────────────────────────────
function ExportItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink-700 hover:bg-bone-50 transition-colors text-left">
      <span className="text-ink-700/50 shrink-0">{icon}</span>{label}
    </button>
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
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Coordenadas</label>
            <div className="flex gap-1">
              <input type="number" step="0.00001"
                value={pin.lat}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onUpdate({ lat: v }); }}
                className={inputCls + ' w-1/2'}
                title="Latitud"
              />
              <input type="number" step="0.00001"
                value={pin.lng}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onUpdate({ lng: v }); }}
                className={inputCls + ' w-1/2'}
                title="Longitud"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel de capas estilo Photoshop ─────────────────────────────────────────

interface PanelCapasProps {
  capas:               CapasVisibles;
  onCapas:             (c: CapasVisibles) => void;
  intervaloContorno:   number | null;
  setIntervaloContorno:(v: number | null) => void;
  intervaloCurvas:     number | null;
  demPropio:           DEMImportado | null;
  pisoIntervalo:       number;
  curvasDemasiadas:    number | null;
  curvasLoading:       boolean;
  datosArcoSolar:      DatosArcoSolar | null;
  zonas:               Zona[];
  sectores:            Sector[];
  pines:               Pin[];
  caminos:             Camino[];
  dibujos:             import('@/lib/dibujos').ElementoDibujo[];
  aguadasLayer:        ElementoAguada[];
  ocultosIds:          Set<string>;
  onToggle:            (id: string) => void;
  onRenombrarPin:      (id: string, nombre: string) => void;
  onEliminarPin:       (id: string) => void;
  onRenombrarZona:     (id: string, nombre: string) => void;
  onEliminarZona:      (id: string) => void;
  onRenombrarSector:   (id: string, nombre: string) => void;
  onEliminarSector:    (id: string) => void;
  onRenombrarCamino:   (id: string, nombre: string) => void;
  onEliminarCamino:    (id: string) => void;
  onRenombrarDibujo:   (id: string, nombre: string) => void;
  onEliminarDibujo:    (id: string) => void;
  onRenombrarAguada:   (id: string, nombre: string) => void;
  onEliminarAguada:    (id: string) => void;
  capasUsuario:        CapaUsuario[];
  capasOcultas:        Set<string>;
  capaActivaId:        string;
  onSetCapaActiva:     (id: string) => void;
  onToggleCapaOculta:  (id: string) => void;
  onRenombrarCapa:     (id: string, nombre: string) => void;
  onEliminarCapa:      (id: string) => void;
  onColorCapa:         (id: string, color: string) => void;
  onReordenarCapa:     (id: string, dir: -1 | 1) => void;
  onMoverDibujoACapa:  (dibujoId: string, capaId: string) => void;
  onCrearCapa:         () => void;
  onCargarPlantillaKeyline: () => void;
  datosShader:         DatosShader | null;
  datosErosion:        DatosErosion | null;
  haySwales:           boolean;
  hayCortafuegos:      boolean;
  analisisHecho:       boolean;
  onIrATopo:           () => void;
  mojones:             Mojon[];
  masterPlanHay:       boolean;
  masterPlan:          ElementoMasterPlan[] | null;
  hayConectoresMP:     boolean;
  subCapasOcultas:     Set<string>;
  onToggleSubCapa:     (key: string) => void;
  onCapturar:          () => void;
  onGuardarPng:        () => void;
  guardandoPng:        boolean;
  onCerrar:            () => void;
  terrariumElevMin:    number;
  terrariumElevMax:    number;
  colorCurvas:         { normal: string; maestra: string };
  onColorCurvas:       (c: { normal: string; maestra: string }) => void;
  opacidadShader:      { elev: number; pend: number };
  onOpacidadShader:    (v: { elev: number; pend: number }) => void;
  onResetTerrariumRango: () => void;
}

function PanelCapas({
  capas, onCapas, datosArcoSolar, zonas, sectores, pines, caminos, dibujos, aguadasLayer,
  ocultosIds, onToggle,
  onRenombrarPin, onEliminarPin,
  onRenombrarZona, onEliminarZona,
  onRenombrarSector, onEliminarSector,
  onRenombrarCamino, onEliminarCamino,
  onRenombrarDibujo, onEliminarDibujo,
  onRenombrarAguada, onEliminarAguada,
  capasUsuario, capasOcultas, capaActivaId, onSetCapaActiva,
  onToggleCapaOculta, onRenombrarCapa, onEliminarCapa, onColorCapa, onReordenarCapa, onMoverDibujoACapa, onCrearCapa, onCargarPlantillaKeyline,
  datosShader, datosErosion, haySwales, hayCortafuegos, analisisHecho, onIrATopo, mojones,
  masterPlanHay, masterPlan, hayConectoresMP, subCapasOcultas, onToggleSubCapa,
  onCapturar, onGuardarPng, guardandoPng, onCerrar,
  terrariumElevMin, terrariumElevMax,
  intervaloContorno, setIntervaloContorno, demPropio, pisoIntervalo, curvasDemasiadas,
  intervaloCurvas, curvasLoading,
  colorCurvas, onColorCurvas,
  opacidadShader, onOpacidadShader,
  onResetTerrariumRango,
}: PanelCapasProps) {
  const [exp, setExp] = useState({ topo: true, terreno: false, zonas: true, sectores: true, caminos: true, pines: true, hidrico: true, erosion: true, swales: true, cortafuegos: true, sugerencias: true, analisis: true, aguadas: true, dibujos: true, arcSolar: true });
  const tog = (k: keyof typeof exp) => setExp(p => ({ ...p, [k]: !p[k] }));

  // ¿Hay sugerencias volcadas por el Análisis del predio? (para ofrecer ocultarlas en bloque)
  const hayAnalisisPredio = pines.some(p => p.origen === 'analisis') || caminos.some(c => c.origen === 'analisis');

  // Pines/caminos manuales (los del Análisis viven en su propia carpeta por categoría).
  const pinesManuales   = pines.filter(p => p.origen !== 'analisis');
  const caminosManuales = caminos.filter(c => c.origen !== 'analisis');

  // Sub-capas del Análisis del predio: categorías presentes entre las sugerencias.
  const ORDEN_ANALISIS = ['Viviendas', 'Represas', 'Caminos y accesos'];
  const EMOJI_ANALISIS: Record<string, string> = { Viviendas: '🏠', Represas: '💧', 'Caminos y accesos': '🚪' };
  const categoriasAnalisis = ORDEN_ANALISIS.filter(cat =>
    pines.some(p => p.origen === 'analisis' && p.capa === cat) ||
    caminos.some(c => c.origen === 'analisis' && c.capa === cat));

  // Sub-capas del Master plan: tipos de elemento presentes (orden de aparición).
  const tiposMasterPlan = masterPlan ? [...new Set(masterPlan.map(el => el.tipo))] : [];

  const [ordenGrupos, setOrdenGrupos] = useState([
    'topo', 'plano', 'hidrico', 'erosion', 'swales', 'cortafuegos', 'sugerencias', 'analisis', 'terreno',
    'zonas', 'sectores', 'caminos', 'pines', 'dibujos', 'aguadas', 'arcSolar',
  ]);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const makeDrag = (key: string) => ({
    draggable: true as const,
    style: { order: ordenGrupos.indexOf(key), opacity: dragKey === key ? 0.4 : 1 },
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; setDragKey(key); },
    onDragOver:  (e: React.DragEvent) => e.preventDefault(),
    onDrop: () => {
      if (!dragKey || dragKey === key) { setDragKey(null); return; }
      setOrdenGrupos(prev => {
        const arr = [...prev];
        const from = arr.indexOf(dragKey), to = arr.indexOf(key);
        if (from < 0 || to < 0) return prev;
        arr.splice(from, 1);
        arr.splice(to, 0, dragKey);
        return arr;
      });
      setDragKey(null);
    },
    onDragEnd: () => setDragKey(null),
  });

  return (
    <div className="w-56 bg-white/97 backdrop-blur-sm rounded-xl shadow-xl border border-bone-200 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 170px)' }}>
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
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* ── Topografía ── */}
        <div {...makeDrag('topo')}>
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
            label={`Hipsométrico SRTM${capas.terrariumElev ? ` (${terrariumElevMin}–${terrariumElevMax} m)` : ''}`}
            swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)' }} />}
          />
          {capas.terrariumElev && (
            <div className="mx-3 mb-2 space-y-1">
              <button
                onClick={onResetTerrariumRango}
                className="text-[9px] text-moss-700 hover:underline"
              >
                ↺ Recalcular rango desde vista actual
              </button>
              {terrariumElevMin === 0 && terrariumElevMax === 500 && (
                <p className="text-[9px] text-ink-700/50 leading-tight">Sin topografía calculada, el rango es 0–500 m. Acercate al terreno y recalculá, o calculá la topografía primero.</p>
              )}
            </div>
          )}
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
              {capas.shaderElev && (
                <div className="mx-3 mb-1 flex items-center gap-2">
                  <span className="text-[9px] text-ink-700/60 w-16 shrink-0">Intensidad:</span>
                  <input type="range" min="0.1" max="1" step="0.05"
                    value={opacidadShader.elev}
                    onChange={e => onOpacidadShader({ ...opacidadShader, elev: parseFloat(e.target.value) })}
                    className="flex-1 h-1.5 accent-moss-700 cursor-pointer" />
                  <span className="text-[9px] font-mono text-ink-700/60 w-8 text-right">{Math.round(opacidadShader.elev * 100)}%</span>
                </div>
              )}
              <CapaItem
                visible={capas.shaderPend}
                onToggle={() => capas.shaderPend
                  ? onCapas({ ...capas, shaderPend: false })
                  : onCapas({ ...capas, shaderPend: true, shaderElev: false })}
                label="Pendiente"
                swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: 'linear-gradient(90deg,#4CAF50 0%,#FFEB3B 50%,#F44336 100%)' }} />}
              />
              {capas.shaderPend && (
                <div className="mx-3 mb-1 flex items-center gap-2">
                  <span className="text-[9px] text-ink-700/60 w-16 shrink-0">Intensidad:</span>
                  <input type="range" min="0.1" max="1" step="0.05"
                    value={opacidadShader.pend}
                    onChange={e => onOpacidadShader({ ...opacidadShader, pend: parseFloat(e.target.value) })}
                    className="flex-1 h-1.5 accent-moss-700 cursor-pointer" />
                  <span className="text-[9px] font-mono text-ink-700/60 w-8 text-right">{Math.round(opacidadShader.pend * 100)}%</span>
                </div>
              )}
              {/* El relieve se computa desde Topo (motor único); acá solo se muestra/oculta. */}
              <button
                onClick={onIrATopo}
                className="mx-3 mb-2 mt-0.5 w-[calc(100%-24px)] flex items-center justify-center gap-1 py-1 bg-bone-100 hover:bg-bone-200 text-ink-700 rounded text-[9px] font-medium transition-colors"
              >
                <Mountain className="w-2.5 h-2.5" />Recalcular en Topo →
              </button>
            </>
          ) : (
            <div className="px-3 pt-1 pb-2.5 space-y-1.5">
              <p className="text-[9px] text-ink-700/50 leading-tight">
                El relieve (shader de altura, pendiente y curvas) se calcula desde la herramienta <span className="font-semibold text-moss-700">Topo</span>.
              </p>
              <button
                onClick={onIrATopo}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-[10px] font-medium transition-colors"
              >
                <Mountain className="w-2.5 h-2.5" />Ir a Topo
              </button>
            </div>
          )}
        </CapaGrupo>
        </div>{/* /topo */}

        {/* ── Plano Profesional ── */}
        <div {...makeDrag('plano')}>
        <CapaGrupo
          label="Plano Profesional"
          visible={capas.linderoLabels || capas.curvasNivel || capas.cotas || capas.medidas}
          onToggleVisible={() => onCapas({ ...capas, linderoLabels: false, curvasNivel: false, cotas: false, medidas: false })}
          expanded={exp.topo} onExpand={() => tog('topo')}
        >
          <CapaItem
            visible={capas.linderoLabels}
            onToggle={() => onCapas({ ...capas, linderoLabels: !capas.linderoLabels })}
            label="Etiquetas de lindero"
            swatch={<span className="w-5 h-2 rounded-sm shrink-0 border border-moss-500 bg-white flex items-center justify-center text-[7px] font-bold text-moss-700">m</span>}
          />
          <CapaItem
            visible={capas.cotas}
            onToggle={() => onCapas({ ...capas, cotas: !capas.cotas })}
            label="Cotas (dimensiones)"
            swatch={<span className="w-5 h-2 shrink-0 flex items-center justify-center text-[8px] font-bold text-ink-700">⊢⊣</span>}
          />
          <CapaItem
            visible={capas.cotasAuto}
            onToggle={() => onCapas({ ...capas, cotasAuto: !capas.cotasAuto })}
            label="Cotas automáticas (linderos)"
            swatch={<span className="w-5 h-2 shrink-0 flex items-center justify-center text-[8px] font-bold" style={{ color: '#0277BD' }}>↦⊣</span>}
          />
          <CapaItem
            visible={capas.medidas}
            onToggle={() => onCapas({ ...capas, medidas: !capas.medidas })}
            label="Medidas de figuras"
            swatch={<span className="w-5 h-2 rounded-sm shrink-0 border border-bone-300 bg-white flex items-center justify-center text-[6px] font-bold text-ink-700">ha</span>}
          />
          {mojones.length >= 3 ? (
            <>
              <CapaItem
                visible={capas.curvasNivel}
                onToggle={() => onCapas({ ...capas, curvasNivel: !capas.curvasNivel })}
                label={`Curvas de nivel${curvasLoading ? ' (calculando…)' : intervaloCurvas !== null && capas.curvasNivel ? ` (cada ${intervaloCurvas} m)` : ''}`}
                swatch={<span className="w-5 h-2 shrink-0 border-t-2 border-dashed" style={{ borderColor: colorCurvas.normal }} />}
              />
              {capas.curvasNivel && (
                <div className="mx-3 mb-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-ink-700/60">Cada:</span>
                    {[0.25, 0.5, 1, 2, 5, 10, 20, 50].map(v => (
                      <button key={v}
                        onClick={() => setIntervaloContorno(v)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${intervaloContorno === v ? 'bg-moss-700 text-bone-50' : 'bg-bone-100 text-ink-700 hover:bg-bone-200'}`}
                      >{v < 1 ? `${v * 100}cm` : `${v}m`}</button>
                    ))}
                    <button onClick={() => setIntervaloContorno(null)} className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-colors ${intervaloContorno === null ? 'bg-moss-700 text-bone-50' : 'bg-bone-100 text-ink-700 hover:bg-bone-200'}`}>Auto</button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-ink-700/60 shrink-0">Otro:</span>
                    <input
                      type="number" min="0.05" step="0.05"
                      value={intervaloContorno ?? ''}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        setIntervaloContorno(Number.isFinite(v) && v > 0 ? v : null);
                      }}
                      placeholder="m"
                      className="w-16 px-1.5 py-0.5 rounded border border-bone-200 bg-white text-ink-900 text-[9px] font-mono focus:outline-none focus:border-moss-500"
                    />
                  </div>
                  {curvasDemasiadas && (
                    <p className="text-[9px] text-clay-700 leading-relaxed flex gap-1">
                      <TriangleAlert className="w-3 h-3 shrink-0 mt-px" />
                      <span>
                        Ese intervalo pide <strong>{curvasDemasiadas} curvas</strong> y el máximo es {MAX_NIVELES},
                        así que no se dibuja ninguna. Es mucho desnivel para un intervalo tan chico:
                        subilo, o recortá el predio.
                      </span>
                    </p>
                  )}
                  {demPropio ? (
                    <p className="text-[9px] text-moss-900 leading-relaxed">
                      Fuente: <strong>{demPropio.nombre}</strong> (paso ≈{' '}
                      {demPropio.pasoM < 1 ? `${(demPropio.pasoM * 100).toFixed(0)} cm` : `${demPropio.pasoM.toFixed(1)} m`}).
                      Confiable hasta {pisoIntervalo < 1 ? `${(pisoIntervalo * 100).toFixed(0)} cm` : `${pisoIntervalo} m`}.
                    </p>
                  ) : null}
                  {intervaloCurvas !== null && intervaloCurvas < pisoIntervalo && (
                    <p className="text-[9px] text-clay-700 leading-relaxed flex gap-1">
                      <TriangleAlert className="w-3 h-3 shrink-0 mt-px" />
                      <span>
                        Por debajo de {pisoIntervalo < 1 ? `${(pisoIntervalo * 100).toFixed(0)} cm` : `${pisoIntervalo} m`}{' '}
                        estas curvas ya no describen el terreno
                        {demPropio ? '' : ': el modelo es SRTM (~30 m de paso) y a esta escala dibuja el ruido del sensor'}.
                        Sirve para intuir la forma, <strong>no para replantear</strong>.
                        {demPropio ? null : <> Cargá un relevamiento propio desde <strong>Exportar → Modelo de elevación</strong>.</>}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-ink-700/60 w-14">Normal:</span>
                    <input type="color" value={colorCurvas.normal}
                      onChange={e => onColorCurvas({ ...colorCurvas, normal: e.target.value })}
                      className="w-6 h-5 rounded cursor-pointer border border-bone-200 p-0" title="Color curvas normales" />
                    <span className="text-[9px] text-ink-700/60 w-14">Maestra:</span>
                    <input type="color" value={colorCurvas.maestra}
                      onChange={e => onColorCurvas({ ...colorCurvas, maestra: e.target.value })}
                      className="w-6 h-5 rounded cursor-pointer border border-bone-200 p-0" title="Color curvas maestras (cada 5)" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="px-3 pb-2 text-[9px] text-ink-700/40">Agregá al menos 3 mojones para ver curvas de nivel.</p>
          )}
        </CapaGrupo>
        </div>{/* /plano */}

        {/* ── Análisis Hídrico ── */}
        <div {...makeDrag('hidrico')}>
        {datosShader && analisisHecho && (
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
        </div>{/* /hidrico */}

        {/* ── Riesgo de erosión ── */}
        <div {...makeDrag('erosion')}>
        {datosErosion && (
          <CapaGrupo
            label="Riesgo de erosión"
            visible={capas.erosion}
            onToggleVisible={() => onCapas({ ...capas, erosion: !capas.erosion })}
            expanded={exp.erosion} onExpand={() => tog('erosion')}
          >
            <div className="pl-7 pr-3 pb-2 pt-1 space-y-1">
              {CLASES_EROSION.map(cl => {
                const r = datosErosion.resumen.find(x => x.clase === cl.clase);
                return (
                  <div key={cl.clase} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: cl.color }} />
                    <span className="text-[10px] text-ink-700/70 flex-1">{cl.label}</span>
                    <span className="text-[10px] text-ink-700/50 tabular-nums">{r?.pct ?? 0}% · {r?.ha ?? 0} ha</span>
                  </div>
                );
              })}
              <p className="text-[9px] text-ink-700/40 pt-1 leading-snug">Pendiente × flujo acumulado (relativo al predio). Orientativo — señala dónde proteger el suelo con swales y cobertura.</p>
            </div>
          </CapaGrupo>
        )}
        </div>{/* /erosión */}

        {/* ── Swales ── */}
        <div {...makeDrag('swales')}>
        {haySwales && (
          <CapaGrupo
            label="Swales"
            visible={capas.swales}
            onToggleVisible={() => onCapas({ ...capas, swales: !capas.swales })}
            expanded={exp.swales} onExpand={() => tog('swales')}
          >
            <CapaItem visible={capas.swales}
              onToggle={() => onCapas({ ...capas, swales: !capas.swales })}
              label="Zanjas de infiltración"
              swatch={<span className="w-5 h-0 border-t-[3px] shrink-0" style={{ borderColor: '#00838F' }} />}
            />
          </CapaGrupo>
        )}
        </div>{/* /swales */}

        {/* ── Cortafuegos ── */}
        <div {...makeDrag('cortafuegos')}>
        {hayCortafuegos && (
          <CapaGrupo
            label="Cortafuegos"
            visible={capas.cortafuegos}
            onToggleVisible={() => onCapas({ ...capas, cortafuegos: !capas.cortafuegos })}
            expanded={exp.cortafuegos} onExpand={() => tog('cortafuegos')}
          >
            <CapaItem visible={capas.cortafuegos}
              onToggle={() => onCapas({ ...capas, cortafuegos: !capas.cortafuegos })}
              label="Fajas sobre crestas"
              swatch={<span className="w-5 h-0 border-t-[5px] shrink-0" style={{ borderColor: '#E65100', opacity: 0.6 }} />}
            />
          </CapaGrupo>
        )}
        </div>{/* /cortafuegos */}

        {/* ── Master plan ── */}
        <div {...makeDrag('sugerencias')}>
        {masterPlanHay && (
          <CapaGrupo
            label="Master plan"
            visible={capas.sugerencias}
            onToggleVisible={() => onCapas({ ...capas, sugerencias: !capas.sugerencias })}
            expanded={exp.sugerencias} onExpand={() => tog('sugerencias')}
          >
            {tiposMasterPlan.map(tipo => {
              const def = TIPOS_ITEM[tipo];
              const key = `mp:${tipo}`;
              return (
                <CapaItem key={key}
                  visible={capas.sugerencias && !subCapasOcultas.has(key)}
                  onToggle={() => onToggleSubCapa(key)}
                  label={def.label}
                  swatch={<span className="text-sm leading-none">{def.emoji}</span>}
                />
              );
            })}
            {hayConectoresMP && (
              <CapaItem key="mp:__caminos"
                visible={capas.sugerencias && !subCapasOcultas.has('mp:__caminos')}
                onToggle={() => onToggleSubCapa('mp:__caminos')}
                label="Caminos conectores"
                swatch={<span className="w-5 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: '#6D4C41' }} />}
              />
            )}
          </CapaGrupo>
        )}
        </div>{/* /master plan */}

        {/* ── Análisis del predio (sugerencias automáticas) ── */}
        <div {...makeDrag('analisis')}>
        {hayAnalisisPredio && (
          <CapaGrupo
            label="Análisis del predio"
            visible={capas.analisisPredio}
            onToggleVisible={() => onCapas({ ...capas, analisisPredio: !capas.analisisPredio })}
            expanded={exp.analisis} onExpand={() => tog('analisis')}
          >
            {categoriasAnalisis.map(cat => {
              const key = `an:${cat}`;
              return (
                <CapaItem key={key}
                  visible={capas.analisisPredio && !subCapasOcultas.has(key)}
                  onToggle={() => onToggleSubCapa(key)}
                  label={cat}
                  swatch={<span className="text-sm leading-none">{EMOJI_ANALISIS[cat] ?? '📍'}</span>}
                />
              );
            })}
          </CapaGrupo>
        )}
        </div>{/* /análisis del predio */}

        {/* ── Terreno ── */}
        <div {...makeDrag('terreno')}>
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
        </div>{/* /terreno */}

        {/* ── Zonas ── */}
        <div {...makeDrag('zonas')}>
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
                onRenombrar={nombre => onRenombrarZona(z.id, nombre)}
                onEliminar={() => onEliminarZona(z.id)}
              />
            ))}
          </CapaGrupo>
        )}
        </div>{/* /zonas */}

        {/* ── Sectores ── */}
        <div {...makeDrag('sectores')}>
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
                onRenombrar={nombre => onRenombrarSector(s.id, nombre)}
                onEliminar={() => onEliminarSector(s.id)}
              />
            ))}
          </CapaGrupo>
        )}
        </div>{/* /sectores */}

        {/* ── Caminos ── */}
        <div {...makeDrag('caminos')}>
        {caminosManuales.length > 0 && (
          <CapaGrupo
            label="Caminos" count={caminosManuales.length}
            visible={capas.caminos}
            onToggleVisible={() => onCapas({ ...capas, caminos: !capas.caminos })}
            expanded={exp.caminos} onExpand={() => tog('caminos')}
          >
            {caminosManuales.map(c => (
              <CapaItem key={c.id}
                visible={!ocultosIds.has(c.id) && capas.caminos}
                onToggle={() => onToggle(c.id)}
                label={c.nombre}
                swatch={<span className="w-5 h-0 border-t-2 shrink-0" style={{ borderColor: c.color }} />}
                onRenombrar={nombre => onRenombrarCamino(c.id, nombre)}
                onEliminar={() => onEliminarCamino(c.id)}
              />
            ))}
          </CapaGrupo>
        )}
        </div>{/* /caminos */}

        {/* ── Pines ── */}
        <div {...makeDrag('pines')}>
        {pinesManuales.length > 0 && (
          <CapaGrupo
            label="Pines" count={pinesManuales.length}
            visible={capas.pines}
            onToggleVisible={() => onCapas({ ...capas, pines: !capas.pines })}
            expanded={exp.pines} onExpand={() => tog('pines')}
          >
            {pinesManuales.map(p => (
              <CapaItem key={p.id}
                visible={!ocultosIds.has(p.id) && capas.pines}
                onToggle={() => onToggle(p.id)}
                label={p.nombre}
                swatch={<span className="text-sm leading-none">{p.icono}</span>}
                onRenombrar={nombre => onRenombrarPin(p.id, nombre)}
                onEliminar={() => onEliminarPin(p.id)}
              />
            ))}
          </CapaGrupo>
        )}
        </div>{/* /pines */}

        {/* ── Capas de dibujo (usuario) ── */}
        <div {...makeDrag('dibujos')}>
        {[...capasUsuario].sort((a, b) => a.orden - b.orden).map((capa, idx, arr) => {
          const items = dibujos.filter(d => capaDeElemento(d.capaId, capasUsuario) === capa.id);
          return (
            <CapaUsuarioGrupo
              key={capa.id}
              capa={capa}
              count={items.length}
              visible={!capasOcultas.has(capa.id) && capas.dibujos}
              activa={capaActivaId === capa.id}
              esDefault={capa.id === CAPA_DEFAULT_ID}
              puedeSubir={idx > 0}
              puedeBajar={idx < arr.length - 1}
              onSubir={() => onReordenarCapa(capa.id, -1)}
              onBajar={() => onReordenarCapa(capa.id, 1)}
              onColor={color => onColorCapa(capa.id, color)}
              onToggleVisible={() => onToggleCapaOculta(capa.id)}
              onActivar={() => onSetCapaActiva(capa.id)}
              onRenombrar={nombre => onRenombrarCapa(capa.id, nombre)}
              onEliminar={() => onEliminarCapa(capa.id)}
            >
              {items.map((d, i) => {
                const label = d.nombre || (
                  d.tipo === 'linea'    ? `Línea ${i + 1}` :
                  d.tipo === 'poligono'? `Polígono ${i + 1}` :
                  d.tipo === 'circulo' ? `Círculo ${i + 1}` :
                  d.tipo === 'curva'   ? `Curva ${i + 1}` :
                  d.tipo === 'cota'    ? `Cota ${i + 1}` :
                  d.tipo === 'texto'   ? `"${d.texto.slice(0, 12)}"` :
                  `Dibujo ${i + 1}`
                );
                const swatch = d.tipo === 'linea' || d.tipo === 'curva' || d.tipo === 'cota'
                  ? <span className="w-5 h-0 border-t-2 shrink-0" style={{ borderColor: d.color }} />
                  : d.tipo === 'texto'
                  ? <span className="text-[11px] font-bold leading-none px-0.5" style={{ color: d.color }}>T</span>
                  : <span className="w-3 h-3 rounded-sm shrink-0 border" style={{ background: d.color + '44', borderColor: d.color }} />;
                return (
                  <CapaItem key={d.id}
                    visible={!ocultosIds.has(d.id) && !capasOcultas.has(capa.id) && capas.dibujos}
                    onToggle={() => onToggle(d.id)}
                    label={label}
                    swatch={swatch}
                    onRenombrar={nombre => onRenombrarDibujo(d.id, nombre)}
                    onEliminar={() => onEliminarDibujo(d.id)}
                    extraSiempre={capasUsuario.length > 1 ? (
                      <select
                        value={capa.id}
                        onChange={e => onMoverDibujoACapa(d.id, e.target.value)}
                        title="Mover a otra capa"
                        className="shrink-0 text-[8px] bg-bone-50 border border-bone-200 rounded px-0.5 py-0 max-w-[56px] text-ink-700/70 focus:outline-none cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      >
                        {[...capasUsuario].sort((a, b) => a.orden - b.orden).map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    ) : undefined}
                  />
                );
              })}
              {items.length === 0 && (
                <p className="pl-7 pr-3 py-1 text-[9px] text-ink-700/30 italic">Capa vacía</p>
              )}
            </CapaUsuarioGrupo>
          );
        })}

        {/* ── Nueva capa + plantilla ── */}
        <div className="px-2 py-1.5 border-b border-bone-100 space-y-1">
          <button
            onClick={onCrearCapa}
            className="w-full flex items-center justify-center gap-1 py-1 rounded text-[9px] text-moss-700 hover:bg-bone-50 transition-colors border border-dashed border-bone-200 font-semibold"
          >
            + Nueva capa de dibujo
          </button>
          <button
            onClick={onCargarPlantillaKeyline}
            title="Crea 8 capas en orden de permanencia: Clima, Geografía, Agua, Accesos, Sistemas, Estructuras, Subdivisiones, Suelo"
            className="w-full flex items-center justify-center gap-1 py-1 rounded text-[9px] text-water-700 hover:bg-water-500/5 transition-colors border border-dashed border-water-500/30 font-semibold"
          >
            + Plantilla: Escala de permanencia (Keyline)
          </button>
        </div>
        </div>{/* /dibujos */}

        {/* ── Aguadas ── */}
        <div {...makeDrag('aguadas')}>
        {aguadasLayer.length > 0 && (
          <CapaGrupo
            label="Aguadas" count={aguadasLayer.length}
            visible={capas.aguadas}
            onToggleVisible={() => onCapas({ ...capas, aguadas: !capas.aguadas })}
            expanded={exp.aguadas} onExpand={() => tog('aguadas')}
          >
            {aguadasLayer.map(a => (
              <CapaItem key={a.id}
                visible={!ocultosIds.has(a.id) && capas.aguadas}
                onToggle={() => onToggle(a.id)}
                label={a.nombre}
                swatch={
                  a.tipo === 'represa'
                    ? <span className="text-sm leading-none">🏊</span>
                    : a.tipo === 'swale'
                    ? <span className="w-5 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: '#26A69A' }} />
                    : <span className="w-5 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: '#66BB6A' }} />
                }
                onRenombrar={nombre => onRenombrarAguada(a.id, nombre)}
                onEliminar={() => onEliminarAguada(a.id)}
              />
            ))}
          </CapaGrupo>
        )}
        </div>{/* /aguadas */}

        {/* ── Arco Solar ── */}
        <div {...makeDrag('arcSolar')}>
        {datosArcoSolar && (
          <CapaGrupo
            label="Arco Solar"
            visible={capas.arcSolar}
            onToggleVisible={() => onCapas({ ...capas, arcSolar: !capas.arcSolar })}
            expanded={exp.arcSolar} onExpand={() => tog('arcSolar')}
          >
            {datosArcoSolar.arcos.map(arco => (
              <div key={arco.fecha} className="flex items-center gap-2 pl-6 pr-3 py-1">
                <span className="w-5 h-0 border-t-2 shrink-0" style={{ borderColor: arco.color }} />
                <span className="text-[10px] text-ink-700/70 leading-tight">{arco.label}</span>
              </div>
            ))}
            <div className="px-3 pb-2 pt-1">
              <p className="text-[9px] text-ink-700/40 leading-tight">
                Radio: {datosArcoSolar.radio_m} m · Centro: {datosArcoSolar.centro.lat.toFixed(4)}°
              </p>
            </div>
          </CapaGrupo>
        )}
        </div>{/* /arcSolar */}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-2.5 border-t border-bone-200 bg-bone-50 space-y-1.5">
        <button
          onClick={onCapturar}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-ink-950 hover:bg-ink-800 text-bone-50 rounded-lg text-[10px] font-semibold transition-colors"
        >
          <Camera className="w-3 h-3" />
          Capturar mapa
        </button>
        <button
          onClick={onGuardarPng}
          disabled={guardandoPng}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-lg text-[10px] font-semibold transition-colors"
        >
          {guardandoPng
            ? <><span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />Guardando…</>
            : <><Camera className="w-3 h-3" />Guardar PNG</>}
        </button>
      </div>
    </div>
  );
}

// ─── Riel de navegación ───────────────────────────────────────────────────────

/**
 * Un grupo de íconos del riel lateral.
 *
 * El indicador de pestaña activa va *dentro* del botón: el `<nav>` scrollea en
 * vertical, y en CSS basta con que un eje no sea `visible` para que el otro pase
 * a `auto`, así que cualquier cosa que asome por la izquierda queda recortada.
 */
/** Un botón de tab en el riel (ícono cuadrado con candado si está bloqueado). */
function RielTab({ def, activo, lock, onElegir }: {
  def: { id: Tab; label: string; icon: React.ReactNode };
  activo: boolean;
  lock: boolean;
  onElegir: (id: Tab) => void;
}) {
  return (
    <button title={lock ? `${def.label} · plan pago` : def.label} aria-label={def.label} aria-current={activo || undefined}
      onClick={() => onElegir(def.id)}
      className={`relative w-10 h-9 rounded-lg flex items-center justify-center transition-colors ${
        activo
          ? 'bg-moss-700 text-bone-50 shadow-sm'
          : `text-ink-700/70 hover:bg-bone-200/70 hover:text-ink-900 ${lock ? 'opacity-60' : ''}`
      }`}>
      {activo && <span className="absolute left-0.5 top-2 bottom-2 w-[3px] rounded-full bg-sun-400" />}
      {def.icon}
      {lock && (
        <span className="absolute -right-0.5 -top-0.5 w-3 h-3 rounded-full bg-bone-50 border border-bone-200 flex items-center justify-center">
          <Lock className="w-2 h-2 text-ink-700/70" />
        </span>
      )}
    </button>
  );
}

/** Un clúster colapsable del riel: encabezado con ícono + label corto, y —si
 *  está abierto— la lista de tabs del grupo. Acordeón: sólo un grupo abierto. */
function RielAcordeon({ grupo, abierto, tabActivo, onToggle, onElegir, bloqueada }: {
  grupo: { id: string; label: string; corto: string; icon: React.ReactNode; tabs: Tab[] };
  abierto: boolean;
  tabActivo: Tab;
  onToggle: () => void;
  onElegir: (id: Tab) => void;
  bloqueada: (id: Tab) => boolean;
}) {
  const contieneActivo = grupo.tabs.includes(tabActivo);

  // Grupo de una sola pestaña: el encabezado abre el panel directo (sin
  // sub-desplegar), comportándose como un tab con la identidad del grupo.
  if (grupo.tabs.length === 1) {
    const unico = grupo.tabs[0]!;
    const activo = tabActivo === unico;
    const lock = bloqueada(unico);
    return (
      <div className="w-full flex flex-col items-center">
        <button onClick={() => onElegir(unico)} title={lock ? `${grupo.label} · plan pago` : grupo.label} aria-current={activo || undefined}
          className={`relative w-11 rounded-lg flex flex-col items-center gap-0.5 py-1 transition-colors ${
            activo
              ? 'bg-moss-700 text-bone-50 shadow-sm'
              : `text-ink-700/60 hover:text-ink-900 hover:bg-bone-200/60 ${lock ? 'opacity-60' : ''}`
          }`}>
          {activo && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sun-400" />}
          {grupo.icon}
          <span className="text-[7px] font-semibold uppercase tracking-tight leading-none">{grupo.corto}</span>
          {lock && (
            <span className="absolute -right-0.5 -top-0.5 w-3 h-3 rounded-full bg-bone-50 border border-bone-200 flex items-center justify-center">
              <Lock className="w-2 h-2 text-ink-700/70" />
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <button onClick={onToggle} title={grupo.label} aria-expanded={abierto}
        className={`relative w-11 rounded-lg flex flex-col items-center gap-0.5 py-1 transition-colors ${
          contieneActivo && !abierto
            ? 'text-moss-700 bg-moss-50'
            : 'text-ink-700/60 hover:text-ink-900 hover:bg-bone-200/60'
        }`}>
        {contieneActivo && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sun-400" />}
        {grupo.icon}
        <span className="text-[7px] font-semibold uppercase tracking-tight leading-none">{grupo.corto}</span>
      </button>
      {abierto && (
        <div className="w-full flex flex-col items-center gap-0.5 pb-1.5 pt-1">
          {grupo.tabs.map(id => {
            const def = TAB_DEF.get(id);
            if (!def) return null;
            return (
              <RielTab key={id} def={def} activo={tabActivo === id} lock={bloqueada(id)} onElegir={onElegir} />
            );
          })}
        </div>
      )}
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
        <span title="Arrastrar para reordenar" className="shrink-0 cursor-grab"><GripVertical className="w-3 h-3 text-ink-700/20" /></span>
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
}

function CapaItem({ visible, onToggle, label, swatch, onRenombrar, onEliminar, extra, extraSiempre }: {
  visible: boolean; onToggle: () => void; label: string; swatch?: React.ReactNode;
  onRenombrar?: (nombre: string) => void;
  onEliminar?: () => void;
  extra?: React.ReactNode;
  extraSiempre?: React.ReactNode;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(label);
  useEffect(() => setNombre(label), [label]);

  return (
    <div className="flex items-center gap-1.5 pl-6 pr-3 py-1 hover:bg-bone-50 group">
      <button onClick={onToggle} className={`shrink-0 transition-colors ${visible ? 'text-moss-600' : 'text-ink-700/15'}`}>
        {visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
      </button>
      {swatch && <span className="shrink-0 flex items-center">{swatch}</span>}
      {editando ? (
        <input
          autoFocus
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onBlur={() => { setEditando(false); if (nombre !== label) onRenombrar?.(nombre); }}
          onKeyDown={e => {
            if (e.key === 'Enter') { setEditando(false); onRenombrar?.(nombre); }
            if (e.key === 'Escape') { setEditando(false); setNombre(label); }
          }}
          className="flex-1 text-[10px] bg-white border border-moss-300 rounded px-1 py-0.5 focus:outline-none min-w-0"
        />
      ) : (
        <span
          className={`flex-1 text-[10px] truncate leading-tight min-w-0 ${visible ? 'text-ink-800' : 'text-ink-700/30'}`}
          onDoubleClick={() => onRenombrar && setEditando(true)}
          title={onRenombrar ? 'Doble clic para renombrar' : undefined}
        >{label}</span>
      )}
      {extraSiempre && !editando && <span className="shrink-0">{extraSiempre}</span>}
      {extra && !editando && <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{extra}</span>}
      {onEliminar && !editando && (
        <button onClick={onEliminar} className="shrink-0 text-ink-700/15 hover:text-clay-500 transition-colors">
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

// ─── Grupo de capa de usuario (dibujos) ──────────────────────────────────────

function CapaUsuarioGrupo({ capa, count, visible, activa, esDefault, puedeSubir, puedeBajar, onSubir, onBajar, onColor, onToggleVisible, onActivar, onRenombrar, onEliminar, children }: {
  capa: CapaUsuario; count: number; visible: boolean; activa: boolean; esDefault: boolean;
  puedeSubir: boolean; puedeBajar: boolean;
  onSubir: () => void; onBajar: () => void; onColor: (color: string) => void;
  onToggleVisible: () => void; onActivar: () => void;
  onRenombrar: (nombre: string) => void; onEliminar: () => void;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre]     = useState(capa.nombre);
  useEffect(() => setNombre(capa.nombre), [capa.nombre]);

  return (
    <div className="border-b border-bone-100">
      <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-bone-50 select-none">
        <button
          onClick={e => { e.stopPropagation(); onToggleVisible(); }}
          className={`shrink-0 transition-colors ${visible ? 'text-moss-700' : 'text-ink-700/20'}`}
          title={visible ? 'Ocultar capa' : 'Mostrar capa'}
        >
          {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onActivar(); }}
          title={activa ? 'Capa activa (los nuevos dibujos van acá)' : 'Hacer capa activa'}
          className="shrink-0 w-3 h-3 flex items-center justify-center"
        >
          <span className={`w-2 h-2 rounded-full transition-colors ${activa ? 'bg-sun-500 ring-1 ring-sun-600' : 'border border-bone-300 bg-white hover:border-sun-500'}`} />
        </button>
        {editando ? (
          <input
            autoFocus
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onBlur={() => { setEditando(false); if (nombre !== capa.nombre) onRenombrar(nombre); }}
            onKeyDown={e => {
              if (e.key === 'Enter') { setEditando(false); onRenombrar(nombre); }
              if (e.key === 'Escape') { setEditando(false); setNombre(capa.nombre); }
            }}
            className="flex-1 text-[10px] bg-white border border-moss-300 rounded px-1 py-0.5 focus:outline-none min-w-0 font-semibold uppercase tracking-wider"
          />
        ) : (
          <button onClick={() => setExpanded(p => !p)} className="flex-1 flex items-center gap-1 min-w-0">
            <ChevronRight className={`w-2.5 h-2.5 text-ink-700/30 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            <span
              className="text-[10px] font-semibold text-ink-800 uppercase tracking-wider truncate"
              onDoubleClick={e => { e.stopPropagation(); setEditando(true); }}
              title="Doble clic para renombrar"
            >{capa.nombre}</span>
            {count > 0 && (
              <span className="text-[8px] bg-bone-200 text-ink-700/50 px-1 py-0.5 rounded-full shrink-0">{count}</span>
            )}
          </button>
        )}
        {!editando && (
          <>
            {/* Color de la capa */}
            <label className="shrink-0 w-3.5 h-3.5 rounded-sm border border-bone-300 cursor-pointer relative overflow-hidden" title="Color de la capa (recolorea sus dibujos)" style={{ background: capa.color ?? 'repeating-linear-gradient(45deg,#ddd,#ddd 2px,#fff 2px,#fff 4px)' }}>
              <input type="color" value={capa.color ?? '#3A5A40'} onChange={e => onColor(e.target.value)} onClick={e => e.stopPropagation()} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            {/* Reordenar */}
            <button onClick={e => { e.stopPropagation(); onSubir(); }} disabled={!puedeSubir} title="Subir capa" className="shrink-0 text-ink-700/25 hover:text-ink-700 disabled:opacity-20 leading-none text-[9px]">▲</button>
            <button onClick={e => { e.stopPropagation(); onBajar(); }} disabled={!puedeBajar} title="Bajar capa" className="shrink-0 text-ink-700/25 hover:text-ink-700 disabled:opacity-20 leading-none text-[9px]">▼</button>
          </>
        )}
        {!esDefault && !editando && (
          <button onClick={onEliminar} title="Eliminar capa (los dibujos pasan a la capa principal)"
            className="shrink-0 text-ink-700/15 hover:text-clay-500 transition-colors">
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
}

// ─── Entrada por coordenadas relativas (distancia<azimut) ──────────────────────
function EntradaCoordenada({ onEnviar }: { onEnviar: (distM: number, azDeg: number | null) => boolean }) {
  const [valor, setValor] = useState('');
  const [error, setError] = useState(false);

  const enviar = () => {
    const txt = valor.trim();
    // Con ángulo: "20<90", "20 90", "20@90"  ·  Solo largo: "20" (usa dirección del cursor)
    const conAng = txt.match(/^(-?\d+(?:[.,]\d+)?)\s*[<@ ]\s*(-?\d+(?:[.,]\d+)?)$/);
    const soloLargo = txt.match(/^(\d+(?:[.,]\d+)?)$/);
    let dist: number, az: number | null;
    if (conAng) { dist = parseFloat(conAng[1]!.replace(',', '.')); az = parseFloat(conAng[2]!.replace(',', '.')); }
    else if (soloLargo) { dist = parseFloat(soloLargo[1]!.replace(',', '.')); az = null; }
    else { setError(true); return; }
    if (!Number.isFinite(dist) || dist <= 0) { setError(true); return; }
    const ok = onEnviar(dist, az);
    if (ok) { setValor(''); setError(false); } else { setError(true); }
  };

  return (
    <div className="flex items-center gap-1.5" style={{ pointerEvents: 'auto' }}>
      <span className="text-[10px] text-bone-50/50 font-mono" title="Escribí el largo en metros (usa la dirección del cursor) o largo<ángulo">m / m&lt;°</span>
      <input
        value={valor}
        onChange={e => { setValor(e.target.value); setError(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); enviar(); } e.stopPropagation(); }}
        placeholder="20 · 20<90"
        className={`w-24 text-[11px] font-mono bg-white/95 rounded px-2 py-0.5 text-ink-900 focus:outline-none ${error ? 'ring-1 ring-clay-500' : ''}`}
      />
      <button onClick={enviar} className="text-[10px] font-semibold text-bone-50 bg-moss-700 hover:bg-moss-600 rounded px-2 py-0.5 transition-colors">
        +punto
      </button>
    </div>
  );
}

// ─── Coordenadas del cursor (lee un ref por rAF → aísla los re-renders) ─────────
function CursorCoords({ cursorRef }: { cursorRef: React.RefObject<{ lat: number; lng: number } | null> }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = cursorRef.current;
      setPos(prev => {
        if (!c) return prev;
        if (prev && Math.abs(prev.lat - c.lat) < 1e-7 && Math.abs(prev.lng - c.lng) < 1e-7) return prev;
        return { lat: c.lat, lng: c.lng };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cursorRef]);
  return (
    <span className="tabular-nums whitespace-nowrap" title="Coordenadas del cursor">
      {pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : '—, —'}
    </span>
  );
}

// ─── Barra de estado inferior (estilo CAD) ──────────────────────────────────────
function BarraEstado({
  cursorRef, escala, snapActivo, orthoActivo, onToggleSnap, onToggleOrtho,
  modoLabel, entradaActiva, onEntradaCoord, areaHa, nMojones,
  onExportarDXF, onImportarDXF, overlay, onCargarImagen, onCargarGeoTIFF, onOpacidadOverlay, onQuitarOverlay,
  onCargarDEM, onQuitarDEM, demCargado,
  onAbrirPaleta, onAbrirAyuda,
}: {
  cursorRef:        React.RefObject<{ lat: number; lng: number } | null>;
  escala:           { metros: number; pixeles: number; label: string };
  snapActivo:       boolean;
  orthoActivo:      boolean;
  onToggleSnap:     () => void;
  onToggleOrtho:    () => void;
  modoLabel:        string;
  entradaActiva:    boolean;
  onEntradaCoord:   (distM: number, azDeg: number | null) => boolean;
  areaHa:           number | null;
  nMojones:         number;
  onExportarDXF:    () => void;
  onImportarDXF:    (file: File) => void;
  overlay:          OverlayImagen | null;
  onCargarImagen:   (file: File) => void;
  onCargarGeoTIFF:  (file: File) => void;
  onOpacidadOverlay:(op: number) => void;
  onQuitarOverlay:  () => void;
  onCargarDEM:      (file: File) => void;
  onQuitarDEM:      () => void;
  demCargado:       boolean;
  onAbrirPaleta:    () => void;
  onAbrirAyuda:     () => void;
}) {
  const [cadOpen, setCadOpen] = useState(false);
  const tog = 'flex items-center gap-1 px-2 h-5 rounded text-[10px] font-bold tracking-wide transition-colors';

  return (
    <footer className="relative flex items-center gap-2.5 h-7 px-3 bg-ink-950 text-bone-50/75 text-[11px] font-mono shrink-0 border-t border-ink-800 z-[1200] no-print">
      {/* Modo activo */}
      <span className="flex items-center gap-1.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${modoLabel === 'Listo' ? 'bg-bone-50/30' : 'bg-moss-400 animate-pulse'}`} />
        <span className="truncate text-bone-50/90">{modoLabel}</span>
      </span>

      <span className="w-px h-3.5 bg-ink-700" />

      {/* SNAP / ORTO */}
      <button onClick={onToggleSnap} title="Snap a puntos (F3)"
        className={`${tog} ${snapActivo ? 'bg-moss-700 text-bone-50' : 'text-bone-50/40 hover:bg-ink-800'}`}>
        SNAP
      </button>
      <button onClick={onToggleOrtho} title="Modo ortogonal 90° (F8)"
        className={`${tog} ${orthoActivo ? 'bg-moss-700 text-bone-50' : 'text-bone-50/40 hover:bg-ink-800'}`}>
        ORTO
      </button>

      {/* Entrada dinámica de medidas (solo dibujando/midiendo) */}
      {entradaActiva && (
        <>
          <span className="w-px h-3.5 bg-ink-700" />
          <EntradaCoordenada onEnviar={onEntradaCoord} />
        </>
      )}

      <div className="flex-1" />

      {/* Resumen del predio */}
      {nMojones > 0 && (
        <span className="hidden sm:inline text-bone-50/55 whitespace-nowrap">
          {nMojones} mojón{nMojones !== 1 ? 'es' : ''}{areaHa ? ` · ${areaHa.toFixed(2)} ha` : ''}
        </span>
      )}
      <span className="w-px h-3.5 bg-ink-700 hidden sm:inline-block" />

      {/* Coordenadas del cursor */}
      <CursorCoords cursorRef={cursorRef} />

      <span className="w-px h-3.5 bg-ink-700" />

      {/* Escala */}
      <span className="flex items-center gap-1.5 whitespace-nowrap" title="Escala gráfica aproximada">
        <span className="inline-block border-l-2 border-r-2 border-b-2 border-bone-50/60 h-1.5" style={{ width: Math.min(escala.pixeles, 60) }} />
        {escala.label}
      </span>

      <span className="w-px h-3.5 bg-ink-700" />

      {/* Paleta de comandos + ayuda */}
      <button onClick={onAbrirPaleta} title="Paleta de comandos (Ctrl+K)"
        className={`${tog} text-bone-50/55 hover:bg-ink-800`}>
        ⌘K
      </button>
      <button onClick={onAbrirAyuda} title="Atajos de teclado (?)"
        className={`${tog} text-bone-50/55 hover:bg-ink-800`}>
        ?
      </button>

      <span className="w-px h-3.5 bg-ink-700" />

      {/* Archivo CAD / plano (popover) */}
      <div className="relative">
        <button onClick={() => setCadOpen(o => !o)} title="Archivo CAD / plano de referencia"
          className={`${tog} ${cadOpen || overlay ? 'bg-ink-700 text-bone-50' : 'text-bone-50/55 hover:bg-ink-800'}`}>
          <FileDown className="w-3 h-3" /> CAD
        </button>
        {cadOpen && (
          <>
            <div className="fixed inset-0 z-[1250]" onClick={() => setCadOpen(false)} />
            <div className="absolute bottom-7 right-0 z-[1300]">
              <PanelArchivoCAD
                onExportarDXF={() => { onExportarDXF(); setCadOpen(false); }}
                onImportarDXF={onImportarDXF}
                overlay={overlay}
                onCargarImagen={onCargarImagen}
                onCargarGeoTIFF={onCargarGeoTIFF}
                onOpacidad={onOpacidadOverlay}
                onQuitarImagen={onQuitarOverlay}
                onCargarDEM={onCargarDEM}
                onQuitarDEM={onQuitarDEM}
                demCargado={demCargado}
              />
            </div>
          </>
        )}
      </div>
    </footer>
  );
}

// ─── Panel de archivo CAD / plano de referencia ────────────────────────────────
function PanelArchivoCAD({
  onExportarDXF, onImportarDXF, overlay, onCargarImagen, onCargarGeoTIFF, onOpacidad, onQuitarImagen,
  onCargarDEM, onQuitarDEM, demCargado,
}: {
  onExportarDXF:  () => void;
  onImportarDXF:  (file: File) => void;
  overlay:        OverlayImagen | null;
  onCargarImagen: (file: File) => void;
  onCargarGeoTIFF: (file: File) => void;
  onOpacidad:     (op: number) => void;
  onQuitarImagen: () => void;
  onCargarDEM:    (file: File) => void;
  onQuitarDEM:    () => void;
  demCargado:     boolean;
}) {
  const dxfRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const tifRef = useRef<HTMLInputElement>(null);
  const demRef = useRef<HTMLInputElement>(null);
  const btn = 'flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors';

  return (
    <div className="flex flex-col gap-1 p-1.5 bg-white/97 backdrop-blur-sm rounded-xl shadow-paper border border-bone-200 w-44">
      <p className="text-[8px] uppercase tracking-wide text-ink-700/50 px-0.5">Archivo CAD / plano</p>
      <div className="flex gap-1">
        <button onClick={onExportarDXF} title="Exportar dibujos a DXF (AutoCAD)" className={`${btn} bg-moss-700 hover:bg-moss-600 text-white`}>
          <FileDown className="w-3 h-3" /> DXF
        </button>
        <button onClick={() => dxfRef.current?.click()} title="Importar un archivo DXF" className={`${btn} bg-bone-100 hover:bg-bone-200 text-ink-700`}>
          <FileUp className="w-3 h-3" /> DXF
        </button>
      </div>
      <input ref={dxfRef} type="file" accept=".dxf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onImportarDXF(f); e.target.value = ''; }} />

      {!overlay ? (
        <button onClick={() => imgRef.current?.click()} title="Pegar una imagen de plano para calcar encima"
          className={`${btn} bg-bone-100 hover:bg-bone-200 text-ink-700`}>
          <ImagePlus className="w-3 h-3" /> Pegar plano
        </button>
      ) : (
        <div className="space-y-1 px-0.5 pt-0.5 border-t border-bone-200">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-ink-700/60">Opacidad plano</span>
            <button onClick={onQuitarImagen} title="Quitar plano" className="text-ink-700/40 hover:text-clay-500">
              <X className="w-3 h-3" />
            </button>
          </div>
          <input type="range" min={0} max={1} step={0.05} value={overlay.opacidad}
            onChange={e => onOpacidad(parseFloat(e.target.value))} className="w-full accent-moss-700" />
          <p className="text-[8px] text-ink-700/40 leading-tight">Arrastrá ↙ ↗ para escalar y ✥ para mover.</p>
        </div>
      )}
      <input ref={imgRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onCargarImagen(f); e.target.value = ''; }} />

      <button onClick={() => tifRef.current?.click()} title="Importar un GeoTIFF de dron o IGN (se georreferencia solo)"
        className={`${btn} bg-bone-100 hover:bg-bone-200 text-ink-700`}>
        <ImagePlus className="w-3 h-3" /> GeoTIFF
      </button>
      <input ref={tifRef} type="file" accept=".tif,.tiff,image/tiff" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onCargarGeoTIFF(f); e.target.value = ''; }} />

      <button onClick={() => demRef.current?.click()}
        title="Importar un modelo de elevación propio (dron RTK, estación total, MDE oficial). Reemplaza al satelital para las curvas de nivel."
        className={`${btn} ${demCargado ? 'bg-moss-100 text-moss-900 hover:bg-moss-200' : 'bg-bone-100 hover:bg-bone-200 text-ink-700'}`}>
        <Mountain className="w-3 h-3" /> {demCargado ? 'MDE propio ✓' : 'MDE propio'}
      </button>
      {demCargado && (
        <button onClick={onQuitarDEM} className="text-[9px] text-clay-700 hover:underline px-0.5 text-left">
          Volver al modelo satelital
        </button>
      )}
      <input ref={demRef} type="file" accept=".tif,.tiff,image/tiff" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onCargarDEM(f); e.target.value = ''; }} />
    </div>
  );
}
