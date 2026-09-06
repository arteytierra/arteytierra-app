'use client';

import dynamic from 'next/dynamic';
import { useState, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  TAB_DEFS, TAB_DEF, GRUPOS_RIEL, GRUPO_DE_TAB, SUBS_REPRESA,
  RielAcordeon, type Tab, type SubRepresa,
} from './mapa/riel';
import { PanelCapas } from './mapa/PanelCapas';
import { ExportItem, MojonItem, PinItem, BarraEstado } from './mapa/controles';
import {
  Trash2, LogOut, Map, ChevronRight, MapPin, Cloud, FolderOpen, Mountain,
  FileText, Sun, Eye, Camera, X, FileDown,
  FileUp, ImagePlus, Save, Download, CloudOff, Check, Moon, Palette,
  IdCard, DollarSign, BookOpen, Keyboard, Scale, ShieldCheck, Sparkles, ClipboardList,
  Archive, Settings, Upload, Image as ImageIcon,
} from 'lucide-react';
import { MojonForm } from './MojonForm';
import { PoligonoPanel } from './PoligonoPanel';
import { ProyectosPanel } from './ProyectosPanel';
import { BuscadorLugar, type ResultadoBusqueda } from './BuscadorLugar';
import { ClimaPanel } from './ClimaPanel';
import { ContextoPanel } from './ContextoPanel';
import { TopografiaPanel } from './TopografiaPanel';
import { CaptacionPanel } from './CaptacionPanel';
import { CalendarioPanel, type CalendarioInputs } from './CalendarioPanel';
import { ProduccionPanel } from './ProduccionPanel';
import { AptitudPanel } from './AptitudPanel';
import { SuelosPanel } from './SuelosPanel';
import { SolarPanel } from './SolarPanel';
import { ZonificacionPanel } from './ZonificacionPanel';
import { SectoresPanel, type SectoresInputs } from './SectoresPanel';
import { SitiosRepresaPanel, type SitiosInputs } from './SitiosRepresaPanel';
import { AnalisisRelievePanel, type AnalisisInputs } from './AnalisisRelievePanel';
import { CaminosPanel } from './CaminosPanel';
import { RedServiciosPanel } from './RedServiciosPanel';
import { PastoreoPanel } from './PastoreoPanel';
import { RiegoPanel } from './RiegoPanel';
import { CoberturaPanel } from './CoberturaPanel';
import { EntornoPanel } from './EntornoPanel';
import { SombrasPanel } from './SombrasPanel';
import { Isotipo } from './Isotipo';
import type { ObjetoSombra } from '@/lib/objetosSombra';
import { calcularViewshed, type ResultadoViewshed } from '@/lib/viewshed';
import { calcularMetricas } from '@/lib/geometria';
import * as turf from '@turf/turf';
import { getSupabaseBrowserClient } from '@/lib/db/browser';
import { guardarInformeBorrador } from '@/lib/informe';
import { useAutosave } from '@/hooks/useAutosave';
import { useCapas } from '@/hooks/useCapas';
import { useSombras } from '@/hooks/useSombras';
import { usePerfilElevacion } from '@/hooks/usePerfilElevacion';
import { useCuenca } from '@/hooks/useCuenca';
import { useCadSnap } from '@/hooks/useCadSnap';
import { useVistaShell } from '@/hooks/useVistaShell';
import { usePaletaShader } from '@/hooks/usePaletaShader';
import { useCapaClima } from '@/hooks/useCapaClima';
import { useCapaSuelo } from '@/hooks/useCapaSuelo';
import { useCapaTopografia } from '@/hooks/useCapaTopografia';
import { useCapturaPng } from '@/hooks/useCapturaPng';
import { crearZona, CATEGORIAS_ZONA } from '@/lib/zonificacion';
import { crearPin, type Pin } from '@/lib/pines';
import { crearCamino, type Camino } from '@/lib/caminos';
import { PerfilPanel } from './PerfilPanel';
import { calcularArcoSolar, calcularRadioArco, type DatosArcoSolar } from '@/lib/arco_solar';
import { shaderDesdeDEM, gradienteCss, PALETAS_ELEV, PALETAS_PEND, type DatosShader } from '@/lib/shaders';
import { calcularCurvas, intervaloAutomatico, intervaloConfiablePara, intervaloConfiableRemoto, nivelesEstimados, MAX_NIVELES, type CurvaNivel } from '@/lib/curvasNivel';
import type { DEMImportado } from '@/lib/demImport';
import { obtenerGrillaDensa, grillaDesdeShader, pasoEfectivoM, ETIQUETA_RELIEVE, type GrillaElevacion } from '@/lib/grillaElevacion';
import { obtenerShader } from '@/lib/relieve/obtenerShader';
import { reducerRelieve, datosDe, RELIEVE_VACIO } from '@/lib/relieve/reducerRelieve';
import { ProveedorRelieve } from '@/lib/contextoRelieve';
import { calcularAptitud, type ResultadoAptitud } from '@/lib/aptitud';
import { useFichaBioma } from '@/lib/useFichaBioma';
import { calcularEscorrentias, type DatosEscorrentia } from '@/lib/escorrentias';
import { calcularErosion, type DatosErosion } from '@/lib/erosion';
import { calcularSwalesMulti, analizarAreas, unirBloques, type ResultadoSwales, type ResultadoSwalesMulti, type OpcionesSwales, type AreaSwales, type AnalisisArea, type ContextoSwales } from '@/lib/swales';
import { claseInfiltracionDeKsat, coberturaDeSatelite } from '@/lib/criterios';
import { hidrologiaPredio, T_POR_DEFECTO, type HidrologiaPredio, type Confianza } from '@/lib/hidrologiaPredio';
import { confianzaErosion } from '@/lib/saludCalculo';
import { calcularCortafuegos, type ResultadoCortafuegos } from '@/lib/cortafuegos';
import { construirCortina, sugerirCortina, type CortinaResultado } from '@/lib/cortinas';
import { calcularSilvopastura, type ResultadoSilvo, type OpcionesSilvo } from '@/lib/silvopastura';
import { celdaEnPunto, type Cuenca, type ResultadoCuenca } from '@/lib/cuenca';
import { volumenM3, miles } from '@/lib/unidades';
import { crearCuencaGuardada, type CuencaGuardada, type ParamsCuenca } from '@/lib/cuencasGuardadas';
import { perdidaSuelo, type PerdidaSuelo } from '@/lib/usle';
import { simplificarAnillo, sugerirCaminoRelieve, sugerirCaminosAcceso, analizarRelieve, type AnalisisTopoIntegral, type ZonaVivienda, type SitioRepresa } from '@/lib/cuencaHidro';
import { CuencaPanel, type CuencaInputs } from './CuencaPanel';
import type { RedAguaResumen, RedAguaInputs } from '@/lib/hidraulica';
import { colorServicio, type TipoServicio } from '@/lib/servicios';
import type { RepresaResumen, RepresaInputs } from '@/lib/represa';
import { RODEO_INICIAL, type Rodeo } from '@/lib/rodeo';
import type { RiegoResumen, RiegoInputs } from '@/lib/riego';
import type { PastoreoInputs } from '@/lib/pastoreo';
import type { PotrerosLayout } from '@/lib/potreros';
import type { DatosCobertura, CoberturaResumen } from '@/lib/cobertura';
import type { DatosEntorno, EntornoResumen } from '@/lib/entorno';
import { MasterPlanPanel } from './MasterPlanPanel';
import { PerfilProfesionalModal } from './PerfilProfesionalModal';
import { leerPerfil } from '@/lib/profesional';
import { EconomiaPanel } from './EconomiaPanel';
import { CarbonoPanel } from './CarbonoPanel';
import type { EconomiaResumen } from '@/lib/economia';
import type { CarbonoResumen } from '@/lib/carbono';
import { ComandoPalette, AtajosAyuda, type Comando } from './ComandoPalette';
import { KeylinePanel, type KeylineInputs } from './KeylinePanel';
import { SwalesPanel, type SwalesInputs } from './SwalesPanel';
import { CortafuegosPanel, type CortafuegosInputs } from './CortafuegosPanel';
import { CortinasPanel, type CortinasInputs } from './CortinasPanel';
import { SilvopasturaPanel, type SilvoInputs } from './SilvopasturaPanel';
import { EscalaPermanenciaPanel, type KeylineCheck } from './EscalaPermanenciaPanel';
import { CutFillPanel, type PoligonoCutFill } from './CutFillPanel';
import { EscenariosPanel, type EscenarioMeta } from './EscenariosPanel';
import { BLOQUES, GRUPOS_BLOQUE, type BloqueDef } from '@/lib/bloques';
import { ELEMENTOS, GRUPOS_ELEMENTO, type ElementoPreset } from '@/lib/elementos';
import type { ResultadoKeyline } from '@/lib/keyline';
import { Modal, type ModalState } from './Modal';
import type { ElementoDibujo, DibujoEnCurso } from '@/lib/dibujos';
import { estaDibujando, agregarVertice, quitarUltimoVertice, tieneVertices, etiquetaModo, NOMBRE_HERRAMIENTA, type ModoMapa, type HerramientaDibujo } from '@/lib/mapa/modoMapa';
import { cerrarDibujo, motivoNoCierra, faltanVertices, tipoBaseDe, cierraSola, rectanguloDesdeEsquinas, VERTICES_MINIMOS } from '@/lib/mapa/cerrarDibujo';
import { COLORES_DIBUJO, medidasDibujo } from '@/lib/dibujos';
import { centroideDibujo, aplicarTransformacion, type TransformarOp } from '@/lib/transformaciones';
import { exportarDXF, parsearDXF } from '@/lib/dxf';
import type { OverlayImagen } from './MapLeaflet';
import { CAPA_DEFAULT_ID, CAPAS_USUARIO_INICIAL, crearCapaUsuario, capaDeElemento, crearCapasKeyline, carpetaEscalaPara, type CapaUsuario, type TipoElementoCapa } from '@/lib/capasUsuario';
import { calcularMasterPlan, conectarMasterPlan, TIPOS_ITEM, type ItemPrograma, type ElementoMasterPlan, type CaminoMasterPlan } from '@/lib/masterplan';
import type { ElementoAguada } from '@/lib/aguadas';
import { useRouter } from 'next/navigation';
import type { Mojon } from '@/lib/types';
import { actualizarProyecto } from '@/lib/proyectos';
import type { Proyecto } from '@/lib/proyectos';
import { exportarGeoJSON, exportarKML, exportarGPX } from '@/lib/exportar';
import type { DatosClima, CalibracionPrecip } from '@/lib/clima';
import type { Extremos } from '@/lib/climaExtremos';
import type { DatosTopografia } from '@/lib/topografia';
import type { CaptacionSnapshot } from '@/lib/captacion';
import type { DatosSuelo } from '@/lib/suelos';
import type { Zona, CategoriaZona } from '@/lib/zonificacion';
import type { Sector, TipoSector } from '@/lib/sectores';
import { TIPOS_SECTOR } from '@/lib/sectores';
import type { CapasVisibles, NavegacionMapa } from './MapLeaflet';
import { ControlesPaneles, type CapaFondo } from './ControlesMapa';
import { BarraSuperior } from './BarraSuperior';
import { descargarGeoTIFF, descargarMDE } from '@/lib/demExport';
import { useHistory } from '@/lib/useHistory';
import { FeatureLock } from './FeatureLock';
import { can, featureDeTab, tabBloqueada, planMinimo, NOMBRE_PLAN, BENEFICIO_FEATURE, type Feature, type Plan } from '@/lib/entitlements';
import { registrarCandado } from '@/lib/telemetria';

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

  // ─── Modo del mapa ────────────────────────────────────────────────────────
  // Qué espera el próximo clic. Uno solo a la vez, por construcción: prender un
  // modo apaga los otros once porque son la misma variable. Ver `lib/mapa/modoMapa`.
  const [modo, setModo] = useState<ModoMapa>(null);

  // Lecturas del modo activo. Son proyecciones de `modo`, no estado: leerlas es
  // preguntarle a la única variable, así que dos no pueden ser ciertas a la vez.
  // Conservan los nombres viejos porque media app los usa para pintarse.
  const modoZona          = modo?.k === 'zona'    ? modo : null;
  const modoSector        = modo?.k === 'sector'  ? modo : null;
  const modoCamino        = modo?.k === 'camino'  ? modo : null;
  const modoDibujo        = modo?.k === 'dibujo'  ? modo.tipo : null;
  const modoClick         = modo?.k === 'mojon';
  const modoPinClick      = modo?.k === 'pin';
  const modoElementoClick = modo?.k === 'elemento';
  const modoZona0         = modo?.k === 'zona0';
  const modoAcceso        = modo?.k === 'acceso';
  const modoViewshed      = modo?.k === 'viewshed';
  const modoCuenca        = modo?.k === 'cuenca';
  const modoArbol         = modo?.k === 'arbol';

  const dibujando = estaDibujando(modo);

  // Lo llama el panel de sombras cuando elegís un árbol: deja el mapa esperando
  // el clic que lo planta.
  const pedirClicArbol = useCallback(() => setModo({ k: 'arbol' }), []);

  // ─── Mojones ──────────────────────────────────────────────────────────────
  const [seleccionado,  setSeleccionado]  = useState<string | null>(null);
  const [panelAbierto,  setPanelAbierto]  = useState(true);
  const [tab,           setTab]           = useState<Tab>('mojones');
  // Acordeón del riel: un solo grupo abierto a la vez (por defecto, Terreno).
  const [grupoRiel,     setGrupoRiel]     = useState<string>('terreno');
  const [proyectoActual,setProyectoActual]= useState<Proyecto | null>(null);

  // ─── Análisis ─────────────────────────────────────────────────────────────
  // La capa de clima (crudo + calibración de lluvia + extremos + CHIRPS) vive en
  // useCapaClima; se cablea más abajo, una vez disponible `mojones`.
  // ─── Capa de topografía (hook useCapaTopografia) ───────────────────────────
  // Dato de topografía + carga/error; el fetch vive en TopografiaPanel.
  const {
    datosTopografia, setDatosTopografia,
    topoLoading, setTopoLoading,
    topoError, setTopoError,
  } = useCapaTopografia();
  const [captacionSnap,   setCaptacionSnap]   = useState<CaptacionSnapshot | null>(null);

  // ─── Capa de suelo (hook useCapaSuelo) ─────────────────────────────────────
  // Dato de suelo + carga/error; el fetch vive en SuelosPanel.
  const {
    datosSuelo, setDatosSuelo,
    sueloLoading, setSueloLoading,
    sueloError, setSueloError,
  } = useCapaSuelo();

  // ─── Shader topográfico ───────────────────────────────────────────────────
  // Datos + cálculo en curso + error son UNA sola cosa: nunca hay datos nuevos
  // sin que se haya apagado el spinner, ni un error sobreviviendo a un cálculo
  // que salió bien. Por eso van en un reducer y no en tres useState sueltos.
  const [relieve, dispatchRelieve] = useReducer(reducerRelieve, RELIEVE_VACIO);
  const datosShader   = datosDe(relieve);
  const shaderLoading = relieve.fase === 'calculando';
  const shaderError   = relieve.fase === 'error' ? relieve.mensaje : null;

  // ¿Se corrió el «Análisis del predio»? Recién ahí aparecen las capas de
  // escorrentías + sugerencias. Calcular la topografía sola NO las genera: eso
  // solo prende los shaders y las curvas (info topográfica).
  const [analisisHecho, setAnalisisHecho] = useState(false);

  // ─── Curvas de nivel (grilla densa Terrarium + fallback shader) ──────────
  const [intervaloContorno, setIntervaloContorno] = useState<number | null>(null); // null = auto
  const [grillaCurvas,      setGrillaCurvas]      = useState<GrillaElevacion | null>(null);
  const [curvasLoading,     setCurvasLoading]     = useState(false);
  const grillaKeyRef = useRef<string>('');
  const [colorCurvas, setColorCurvas] = useState({ normal: '#E91E63', maestra: '#AD1457' });

  const [mostrarAptitud, setMostrarAptitud] = useState(false);

  // ─── Rótulo de plano ──────────────────────────────────────────────────────
  interface Rotulo { nombre: string; propietario: string; ubicacion: string; fecha: string; escala: string; autor: string; marca?: string; logo?: string }
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

  // ─── Capa de clima (hook useCapaClima) ────────────────────────────────────
  // Clima crudo (POWER) + calibración de lluvia (manual/CHIRPS) + extremos.
  const {
    datosClima, datosClimaRaw, setDatosClimaRaw,
    calibracionPrecip, setCalibracionPrecip,
    datosExtremos, setDatosExtremos,
    buscandoCHIRPS,
  } = useCapaClima(mojones);

  // Shims drop-in: misma firma que los useState anteriores, ruteado por historial
  const setMojones      = useCallback((v: Mojon[]           | ((p: Mojon[])           => Mojon[]))           => commit(d => ({ ...d, mojones:      typeof v === 'function' ? v(d.mojones)      : v })), [commit]);
  const setZonas        = useCallback((v: Zona[]            | ((p: Zona[])            => Zona[]))            => commit(d => ({ ...d, zonas:        typeof v === 'function' ? v(d.zonas)        : v })), [commit]);
  const setSectores     = useCallback((v: Sector[]          | ((p: Sector[])          => Sector[]))          => commit(d => ({ ...d, sectores:     typeof v === 'function' ? v(d.sectores)     : v })), [commit]);
  const setPines        = useCallback((v: Pin[]             | ((p: Pin[])             => Pin[]))             => commit(d => ({ ...d, pines:        typeof v === 'function' ? v(d.pines)        : v })), [commit]);
  const setCaminos      = useCallback((v: Camino[]          | ((p: Camino[])          => Camino[]))          => commit(d => ({ ...d, caminos:      typeof v === 'function' ? v(d.caminos)      : v })), [commit]);
  const setAguadasLayer = useCallback((v: ElementoAguada[]  | ((p: ElementoAguada[])  => ElementoAguada[]))  => commit(d => ({ ...d, aguadasLayer: typeof v === 'function' ? v(d.aguadasLayer) : v })), [commit]);
  const setDibujos      = useCallback((v: ElementoDibujo[]  | ((p: ElementoDibujo[])  => ElementoDibujo[]))  => commit(d => ({ ...d, dibujos:      typeof v === 'function' ? v(d.dibujos)      : v })), [commit]);
  const setCapasUsuario = useCallback((v: CapaUsuario[]     | ((p: CapaUsuario[])     => CapaUsuario[]))     => commit(d => ({ ...d, capasUsuario: typeof v === 'function' ? v(d.capasUsuario ?? CAPAS_USUARIO_INICIAL) : v })), [commit]);

  const [pinEditId,   setPinEditId]   = useState<string | null>(null);
  // ─── Cuenca de aporte (hook useCuenca) ────────────────────────────────────
  const {
    cuenca, setCuenca,
    cuencaLoading,
    cuencaAviso, setCuencaAviso,
    cuencaExpandida, setCuencaExpandida,
    procesarCuenca,
    handleExtenderCuenca,
    handleUsarPoligonoCuenca,
  } = useCuenca({ mojones });
  // Cuencas archivadas: cada cálculo que el usuario decide conservar, con su
  // ficha completa. Viven fuera de useCuenca —que maneja la cuenca ACTIVA— y se
  // persisten con el proyecto.
  const [cuencasGuardadas, setCuencasGuardadas] = useState<CuencaGuardada[]>([]);
  const [muroLinea, setMuroLinea] = useState<[{ lat: number; lng: number }, { lat: number; lng: number }] | null>(null);
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

  /**
   * ─── Estado de los paneles que se desmontan al cambiar de pestaña ─────────
   *
   * Sólo se monta el panel de la pestaña activa. Todo lo que un panel guardaba
   * en su propio `useState` moría al salir: las curvas keyline detectadas, los
   * sitios de represa calculados, las zonas de vivienda, la cobertura elegida
   * en Cuenca, los anchos de cortina y cortafuego. Se perdía trabajo real sin
   * un solo aviso, y era casi imposible darse cuenta de por qué.
   *
   * Represa, Riego, Red y Pastoreo ya resolvían esto cada uno con su propio par
   * `inicial`/`onInputs` y su propia clave en metadatos. Para el resto —que son
   * muchos y chicos— va un único mapa: cada panel escribe bajo su clave, y todo
   * viaja con el proyecto, así que también sobrevive a recargar la página.
   *
   * `usarInputs` devuelve siempre la *misma* función para una clave dada: si
   * devolviera una nueva en cada render, el efecto del panel que la tiene como
   * dependencia se dispararía sin parar.
   */
  const [panelInputs, setPanelInputs] = useState<Record<string, unknown>>({});
  const cbPanel = useRef<Record<string, (v: unknown) => void>>({});
  const usarInputs = useCallback((clave: string) => {
    const previo = cbPanel.current[clave];
    if (previo) return previo;
    const fn = (v: unknown) => setPanelInputs(prev => ({ ...prev, [clave]: v }));
    cbPanel.current[clave] = fn;
    return fn;
  }, []);

  // ─── Terrarium rango auto-detectado ──────────────────────────────────────
  const [terrariumRango, setTerrariumRango] = useState<{min: number; max: number} | null>(null);

  // ─── Opacidad de los shaders ──────────────────────────────────────────────
  const [opacidadShader, setOpacidadShader] = useState({ elev: 0.65, pend: 0.65 });

  // ─── Paleta de los shaders (hook usePaletaShader) ─────────────────────────
  // La elección de rampa se recuerda por dispositivo: era lo único de la vista
  // que se perdía en cada recarga, y en esta pantalla se recarga seguido.
  const { paletaShader, setPaletaShader } = usePaletaShader();


  // ─── Capas y visibilidad (hook useCapas) ──────────────────────────────────
  const {
    capas, setCapas, ocultosIds, setOcultosIds, capasOcultas, setCapasOcultas, toggleOculto,
    subCapasOcultas, setSubCapasOcultas, toggleSubCapa,
  } = useCapas();
  const [panelDerecho,     setPanelDerecho]      = useState<'capas' | 'sugerencias' | 'bitacora' | null>(null);
  // Cáscara de vista (tema + anchos regulables), persistida por dispositivo.
  const { tema, ciclarTema, anchoPanel, anchoCapas, redimensionando, iniciarResize } = useVistaShell();
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
  // Punto de acceso al terreno (tranquera/portón): raíz de los caminos del plan.
  const [acceso,      setAcceso]      = useState<{ lat: number; lng: number } | null>(null);
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
    () => (masterPlan && masterPlan.length ? conectarMasterPlan(masterPlan, zona0, analisisConectores, mojones, acceso) : []),
    [masterPlan, zona0, analisisConectores, mojones, acceso],
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

  const grillaActiva = useMemo(() => {
    if (demPropio) return demPropio.grilla;
    if (grillaCurvas && grillaKeyRef.current === mojonesKey) return grillaCurvas;
    return datosShader ? grillaDesdeShader(datosShader) : null;
  }, [demPropio, grillaCurvas, mojonesKey, datosShader]);

  /**
   * Hasta qué intervalo de curvas tiene sentido dibujar. Antes salía sólo de un
   * MDE propio importado y, si no había, se asumía SRTM (~30 m) para todo el
   * planeta. Con las fuentes nacionales en producción eso es falso: en Suiza el
   * relieve viene de swissALTI3D (2 m) y en Países Bajos de AHN (50 cm), así que
   * la app se negaba a bajar de 2 m teniendo con qué, y encima avisaba de un
   * ruido de sensor que no existía. Ahora manda el paso efectivo de la grilla
   * que se está usando: el mayor entre lo que da la fuente y lo que da el
   * muestreo (que en predios chicos suele ser el que limita).
   */
  const pasoRelieveM = useMemo(() => {
    if (demPropio) return demPropio.pasoM;
    return grillaActiva ? pasoEfectivoM(grillaActiva) : null;
  }, [demPropio, grillaActiva]);

  const pisoIntervalo = useMemo(
    () => demPropio
      ? intervaloConfiablePara(demPropio.pasoM)
      : intervaloConfiableRemoto(pasoRelieveM),
    [demPropio, pasoRelieveM],
  );

  /** Cómo se llama la fuente del relieve en uso, para decirlo en vez de "SRTM". */
  const fuenteRelieveNombre = useMemo(() => {
    if (demPropio) return demPropio.nombre;
    const f = grillaActiva?.fuente;
    return f ? ETIQUETA_RELIEVE[f] : null;
  }, [demPropio, grillaActiva]);

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
      if (ds) dispatchRelieve({ t: 'poner', datos: ds });
      setCapas(prev => ({ ...prev, curvasNivel: true, shaderElev: ds ? true : prev.shaderElev }));
      setModal({ type: 'alert', message:
        `Modelo de elevación cargado: ${dem.ancho}×${dem.alto} px, paso ≈ ${dem.pasoM < 1 ? `${(dem.pasoM * 100).toFixed(0)} cm` : `${dem.pasoM.toFixed(1)} m`}, cotas ${dem.grilla.elev_min.toFixed(1)}–${dem.grilla.elev_max.toFixed(1)} m${dem.epsg ? ` (EPSG ${dem.epsg})` : ''}. Ahora las curvas de nivel${ds ? ', el sombreado de pendientes y los análisis' : ''} salen de este archivo.` });
    } catch (e) {
      setModal({ type: 'alert', message: e instanceof Error ? e.message : 'No se pudo leer el modelo de elevación.' });
    }
  }, [mojones]);

  // ─── Dibujo libre ─────────────────────────────────────────────────────────
  const [dibujoEnCurso,  setDibujoEnCurso]  = useState<DibujoEnCurso | null>(null);
  // El trazo en curso también en una ref, para que `handleMapClick` lo lea sin
  // tenerlo de dependencia: si lo tuviera se rearmaría en cada vértice y el
  // mapa entero se re-renderizaría clic a clic.
  const enCursoRef = useRef<DibujoEnCurso | null>(null);
  useEffect(() => { enCursoRef.current = dibujoEnCurso; }, [dibujoEnCurso]);
  const [dibujoSelId,    setDibujoSelId]    = useState<string | null>(null);
  const [medicionVertices, setMedicionVertices] = useState<Array<{ lat: number; lng: number }>>([]);
  // Por qué no se pudo cerrar el trazo. Va a la barra de estado y se borra sola:
  // cerrar un polígono de dos puntos antes vaciaba los vértices sin decir nada.
  const [avisoDibujo, setAvisoDibujo] = useState<string | null>(null);
  const [espejoPendiente, setEspejoPendiente] = useState(false); // próximo polígono = espejo de agua
  const [subRepresa, setSubRepresa] = useState<SubRepresa>('sugerencias'); // sub-pestaña del panel de represas
  const [overlay, setOverlay] = useState<OverlayImagen | null>(null);
  const cursorCadRef = useRef<{ lat: number; lng: number } | null>(null);
  const cursorPosRef = useRef<{ lat: number; lng: number } | null>(null); // cursor sobre el mapa (barra de estado)
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [economiaResumen, setEconomiaResumen] = useState<EconomiaResumen | null>(null);
  const [carbonoResumen,  setCarbonoResumen]  = useState<CarbonoResumen | null>(null);
  const [paletaOpen, setPaletaOpen] = useState(false);
  const [ayudaOpen,  setAyudaOpen]  = useState(false);
  const [bloqueActivo,   setBloqueActivo]   = useState<BloqueDef | null>(null);
  const [elementoActivo, setElementoActivo] = useState<ElementoPreset | null>(null);
  const [elementoPoli,   setElementoPoli]   = useState<ElementoPreset | null>(null);
  const [keylineCheck,   setKeylineCheck]   = useState<Record<string, KeylineCheck>>({});
  const [escenarios,     setEscenarios]     = useState<Escenario[]>([]);
  const [escenarioActivoId, setEscenarioActivoId] = useState<string | null>(null);
  const [guardandoNube, setGuardandoNube] = useState(false);
  const [guardadoTick, setGuardadoTick] = useState(false);
  // Flyouts del pie del riel: Archivo (guardar/importar/exportar) y Ajustes.
  const [archivoOpen, setArchivoOpen] = useState(false);
  const [configOpen,  setConfigOpen]  = useState(false);
  // Inputs ocultos para importar desde el flyout Archivo (los mismos handlers que el panel CAD).
  const impDxfRef = useRef<HTMLInputElement>(null);
  const impImgRef = useRef<HTMLInputElement>(null);
  const impTifRef = useRef<HTMLInputElement>(null);
  const impDemRef = useRef<HTMLInputElement>(null);
  // Momento "listo": pastilla efímera de confirmación (descargas, guardado…).
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashListo = useCallback((msg: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashMsg(msg);
    flashTimer.current = setTimeout(() => setFlashMsg(null), 1700);
  }, []);
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

  /**
   * Marca una traza como red de un servicio y la pinta con el color de obra que
   * le corresponde (azul agua, amarillo gas, rojo luz…), para que el plano se
   * lea igual que la zanja.
   */
  const handleMarcarServicio = useCallback((id: string, servicio: TipoServicio) => {
    const color = colorServicio(servicio);
    setCaminos(prev => prev.map(c => c.id === id ? { ...c, servicio, ...(color ? { color } : {}) } : c));
  }, [setCaminos]);

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
  } = useSombras({ datosShader, latCentro, zonas, dibujos, onPedirClicArbol: pedirClicArbol });

  // ─── Visibilidad por item ─────────────────────────────────────────────────
  // Carpeta efectiva de un elemento: su capaId explícito o, si no tiene, la carpeta
  // de la Escala que le corresponde por tipo (auto-archivado sin tocar la creación).
  const folderEfectivo = useCallback(
    (capaId: string | undefined, tipo: TipoElementoCapa) => capaDeElemento(capaId ?? carpetaEscalaPara(tipo), capasUsuario),
    [capasUsuario]);
  const carpetaVisible = useCallback(
    (capaId: string | undefined, tipo: TipoElementoCapa) => !capasOcultas.has(folderEfectivo(capaId, tipo)),
    [capasOcultas, folderEfectivo]);
  const zonasFiltradas    = useMemo(() => capas.zonas    ? zonas.filter(z => !ocultosIds.has(z.id) && carpetaVisible(z.capaId, 'zona'))          : [], [capas.zonas, zonas, ocultosIds, carpetaVisible]);
  const sectoresFiltrados = useMemo(() => capas.sectores ? sectores.filter(s => !ocultosIds.has(s.id) && carpetaVisible(s.capaId, 'sector'))       : [], [capas.sectores, sectores, ocultosIds, carpetaVisible]);
  const pinesFiltrados    = useMemo(() => capas.pines    ? pines.filter(p => !ocultosIds.has(p.id)   && (capas.analisisPredio || p.origen !== 'analisis') && !(p.capa && subCapasOcultas.has('an:' + p.capa)) && (p.origen === 'analisis' || carpetaVisible(p.capaId, 'pin'))) : [], [capas.pines, capas.analisisPredio, pines, ocultosIds, subCapasOcultas, carpetaVisible]);
  const caminosFiltrados  = useMemo(() => capas.caminos  ? caminos.filter(c => !ocultosIds.has(c.id) && (capas.analisisPredio || c.origen !== 'analisis') && !(c.capa && subCapasOcultas.has('an:' + c.capa)) && (c.origen === 'analisis' || carpetaVisible(c.capaId, 'camino'))) : [], [capas.caminos, capas.analisisPredio, caminos, ocultosIds, subCapasOcultas, carpetaVisible]);
  const aguadasFiltradas  = useMemo(() => capas.aguadas  ? aguadasLayer.filter(a => !ocultosIds.has(a.id) && carpetaVisible(a.capaId, 'aguada'))   : [], [capas.aguadas, aguadasLayer, ocultosIds, carpetaVisible]);
  // Las cuencas archivadas cuelgan del mismo maestro que las aguadas (el ojo de
  // "Agua"), más su ojo individual y el de la carpeta donde estén archivadas.
  const cuencasVisibles   = useMemo(() => capas.aguadas
    ? cuencasGuardadas
        .filter(g => !ocultosIds.has(g.id) && carpetaVisible(g.capaId, 'cuenca'))
        .map(g => ({ id: g.id, nombre: g.nombre, color: g.color, poligono: g.cuenca.poligono, outlet: g.cuenca.outlet }))
    : [], [capas.aguadas, cuencasGuardadas, ocultosIds, carpetaVisible]);
  const dibujosFiltrados  = useMemo(() => capas.dibujos
    ? dibujos.filter(d => !ocultosIds.has(d.id) && !capasOcultas.has(capaDeElemento(d.capaId, capasUsuario)))
    : [], [capas.dibujos, dibujos, ocultosIds, capasOcultas, capasUsuario]);

  // ─── Escorrentías y sugerencias (cómputo derivado de shader) ─────────────
  const datosEscorrentia = useMemo<DatosEscorrentia | null>(
    () => datosShader ? calcularEscorrentias(datosShader) : null,
    [datosShader],
  );

  // ─── Hidrología del predio (motor compartido) ─────────────────────────────
  // Un solo lugar donde se responde "¿cuál es el CN, la tormenta y el coeficiente
  // de escorrentía de este predio?". Antes cada herramienta le pedía al usuario
  // que lo adivinara con un slider, teniendo la app el dato a mano.
  const [periodoRetorno, setPeriodoRetorno] = useState<number>(T_POR_DEFECTO);
  const pendienteMedia = useMemo(() => {
    if (!datosShader || datosShader.celdas.length === 0) return null;
    const s = datosShader.celdas.reduce((a, c) => a + c.pendiente_pct, 0);
    return s / datosShader.celdas.length;
  }, [datosShader]);

  const hidroPredio = useMemo<HidrologiaPredio>(() => hidrologiaPredio({
    suelo: datosSuelo?.grupo_hidro
      ? { grupo: datosSuelo.grupo_hidro.grupo, ksat_mm_h: datosSuelo.grupo_hidro.ksat_min, capa_limitante: datosSuelo.grupo_hidro.capa_limitante }
      : null,
    cobertura: datosCobertura?.items.map(it => ({ wc: it.clase.valor, pct: it.pct })) ?? null,
    tormenta: datosExtremos ? { recurrencias: datosExtremos.tormenta.recurrencias, anios: datosExtremos.anios } : null,
    periodoRetorno,
    contexto: {
      fuenteDem:     grillaActiva?.fuente ?? datosShader?.fuente ?? null,
      area_ha:       metricas?.area_ha ?? null,
      pendiente_pct: pendienteMedia,
    },
  }), [datosSuelo, datosCobertura, datosExtremos, periodoRetorno, grillaActiva, datosShader, metricas, pendienteMedia]);

  // ─── Riesgo de erosión (pendiente × flujo acumulado × cobertura) ─────────
  const datosErosion = useMemo<DatosErosion | null>(
    () => datosShader && datosEscorrentia
      ? calcularErosion(datosShader, datosEscorrentia, datosCobertura ? hidroPredio.usleC : null)
      : null,
    [datosShader, datosEscorrentia, datosCobertura, hidroPredio.usleC],
  );

  /**
   * Pérdida de suelo por clase (H4). El mapa de erosión dice DÓNDE; con la
   * lluvia anual de Clima y la textura de Suelo se cierra la USLE y también
   * dice CUÁNTO. Sin esos dos, queda en null y la leyenda muestra sólo el
   * índice relativo, como antes.
   */
  const perdidaErosion = useMemo<Record<number, PerdidaSuelo> | null>(() => {
    const precipAnual = datosClima?.precip_anual_mm;
    if (!datosErosion || datosErosion.usle_c === null || !precipAnual || !datosSuelo) return null;
    const entrada = {
      precipAnual_mm:  precipAnual,
      clase_textura:   datosSuelo.clase_textura,
      carbonoOrg_g_kg: datosSuelo.carbono_org,
      usle_c:          datosErosion.usle_c,
    };
    const out: Record<number, PerdidaSuelo> = {};
    datosErosion.resumen.forEach(r => {
      if (r.pct > 0) out[r.clase] = perdidaSuelo(entrada, r.pendiente_media_pct, r.lambda_m);
    });
    return out;
  }, [datosErosion, datosClima, datosSuelo]);

  const saludErosion = useMemo<Confianza | null>(
    () => datosErosion ? confianzaErosion({
      area_ha:        datosErosion.area_ha,
      usle_c:         datosErosion.usle_c,
      nota_cobertura: datosErosion.nota_cobertura,
      fuenteDem:      grillaActiva?.fuente ?? datosShader?.fuente ?? null,
      textura:        datosSuelo?.clase_textura ?? null,
      hayMagnitud:    perdidaErosion !== null,
      precipAnual_mm: datosClima?.precip_anual_mm ?? null,
    }) : null,
    [datosErosion, grillaActiva, datosShader, datosSuelo, perdidaErosion, datosClima],
  );

  // ─── Swales (zanjas de infiltración a nivel) ─────────────────────────────
  // `swales` es la unión de todas las parcelas trazadas: la consumen el mapa y el
  // informe, que no distinguen de qué parcela salió cada línea. El detalle por
  // parcela vive en `swalesMulti`, que es lo que muestra el panel.
  const [swales, setSwales] = useState<ResultadoSwales | null>(null);
  const [swalesMulti, setSwalesMulti] = useState<ResultadoSwalesMulti | null>(null);

  // ─── Rodeo del predio ─────────────────────────────────────────────────────
  // Vive acá y no en un panel porque lo comparten Producción (que lo sugiere a
  // partir de la receptividad del campo) y Represa (que dimensiona el agua con
  // él). Antes cada pestaña tenía el suyo y nada garantizaba que fueran el mismo.
  const [rodeo, setRodeo] = useState<Rodeo>(RODEO_INICIAL);
  const [represaInputs, setRepresaInputs] = useState<RepresaInputs | null>(null);
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

  // ─── Cortinas rompevientos (franja multiestrato: dibujar o sugerir) ──────
  const [cortina, setCortina] = useState<CortinaResultado | null>(null);
  const cortinaParamsRef = useRef<{ ancho_m: number; alto_m: number }>({ ancho_m: 8, alto_m: 10 });
  const handleSugerirCortina = useCallback((ancho_m: number, alto_m: number) => {
    if (mojones.length < 3) { setModal({ type: 'alert', message: 'Cargá el terreno (al menos 3 mojones) primero.' }); return; }
    const casa = zona0 ?? null;
    const r = sugerirCortina(casa, mojones, { ancho_m, alto_m });
    if (!r) { setModal({ type: 'alert', message: 'No se pudo ubicar la cortina en el predio.' }); return; }
    setCortina(r);
    setCapas(prev => ({ ...prev, cortinas: true }));
  }, [mojones, zona0]);
  const handleDibujarCortina = useCallback((ancho_m: number, alto_m: number) => {
    cortinaParamsRef.current = { ancho_m, alto_m };
    setModo({ k: 'camino', vertices: [], proposito: 'cortina' });
  }, []);
  const handleColocarCortina = useCallback(() => {
    if (!cortina) return;
    // Se persiste la franja de plantación como dibujo (polígono editable).
    setDibujos(d => [...d, {
      id: crypto.randomUUID(), tipo: 'poligono' as const, color: '#2E7D32', opacidad: 0.5,
      simbolo: '🌲', nombre: `Cortina rompevientos (${cortina.ancho_m}×${cortina.alto_m} m · ${cortina.proteccion_m} m protegidos)`,
      capaId: capaActivaId, vertices: cortina.banda,
    }]);
    setModal({ type: 'alert', message: `Cortina colocada en el plano (${cortina.longitud_m} m de largo, protege ${cortina.proteccion_m} m a sotavento). Queda como dibujo editable.` });
  }, [cortina, capaActivaId]);

  // ─── Silvopastura (hileras de árboles a nivel) ───────────────────────────
  const [silvopastura, setSilvopastura] = useState<ResultadoSilvo | null>(null);
  const handleGenerarSilvopastura = useCallback((opts: OpcionesSilvo): ResultadoSilvo | null => {
    if (!grillaActiva) { setModal({ type: 'alert', message: 'Primero calculá la topografía (Topografía → Calcular).' }); return null; }
    const r = calcularSilvopastura(grillaActiva, mojones, opts);
    if (!r) setModal({ type: 'alert', message: 'No se pudieron trazar hileras con esos valores (poco desnivel o separación muy grande).' });
    setSilvopastura(r);
    setCapas(prev => ({ ...prev, silvopastura: true }));
    return r;
  }, [grillaActiva, mojones]);
  const handleColocarSilvopastura = useCallback(() => {
    if (!silvopastura) return;
    const nuevos = silvopastura.hileras.map((h, i) => {
      const cam = crearCamino(h.puntos);
      return { ...cam, nombre: `Hilera silvopastoril ${i + 1} (${h.arboles.length} árb.)`, color: '#2E7D32', longitud_m: h.longitud_m };
    });
    setCaminos(prev => [...prev, ...nuevos]);
    setModal({ type: 'alert', message: `Se colocaron ${nuevos.length} hileras en el plano (pestaña Caminos). Los árboles quedan como referencia en la capa Silvopastura.` });
  }, [silvopastura]);

  // ─── Aptitud de uso del suelo (7.2) ──────────────────────────────────────
  //
  // Los modificadores de la ficha se aplican también acá, y no sólo en el panel:
  // este memo es el que alimenta las zonas que se vuelcan al plano. Si el panel
  // corrigiera los puntajes y esto no, el mapa terminaría pintando un uso
  // distinto del que la pantalla acaba de recomendar.
  const fichaBioma = useFichaBioma(datosClima, datosTopografia?.elev_media);

  const aptitud = useMemo<ResultadoAptitud | null>(
    () => datosShader ? calcularAptitud(datosShader, datosEscorrentia, fichaBioma?.aptitud) : null,
    [datosShader, datosEscorrentia, fichaBioma],
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
    if (cuencasGuardadas.length) m['cuencas_guardadas'] = cuencasGuardadas;
    if (redAguaResumen)  m['red_agua'] = redAguaResumen;
    if (represaResumen)  m['represa']  = represaResumen;
    if (riegoResumen)    m['riego']    = riegoResumen;
    if (riegoInputs)     m['riego_inputs']    = riegoInputs;
    if (redAguaInputs)   m['red_agua_inputs'] = redAguaInputs;
    if (represaInputs)   m['represa_inputs']  = represaInputs;
    if (Object.keys(panelInputs).length) m['panel_inputs'] = panelInputs;
    m['rodeo'] = rodeo;
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
    if (acceso)               m['acceso'] = acceso;
    return m;
  }, [datosClima, datosTopografia, captacionSnap, datosSuelo, datosExtremos, cuenca, cuencasGuardadas, redAguaResumen, represaResumen, riegoResumen, riegoInputs, redAguaInputs, represaInputs, panelInputs, rodeo, economiaResumen, carbonoResumen, potrerosLayer, pastoreoInputs, datosCobertura, datosEntorno, sombrasObjetos, zonas, sectores, pines, caminos, dibujos, aguadasLayer, capasUsuario, programaMP, masterPlan, capas, overlay, ocultosIds, capasOcultas, subCapasOcultas, rotulo, rotuloVisible, capturaTitulo, intervaloContorno, keylineCheck, escenarios, analisisHecho, zona0, acceso]);

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
    setModo({ k: 'dibujo', tipo: 'seleccion' });
    setTab('cuenca');
  }, [cuenca, capaActivaId]);

  // ─── Clic en mapa ─────────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (modo === null) return;
    switch (modo.k) {
      case 'zona0':
        setZona0({ lat, lng });
        setModo(null);
        return;

      case 'acceso':
        setAcceso({ lat, lng });
        setModo(null);
        return;

      case 'arbol': {
        const p = objetoPendienteRef.current;
        setModo(null);
        objetoPendienteRef.current = null;
        if (p) setSombrasObjetos(o => [...o, { ...p, tipo: 'arbol', lat, lng }]);
        return;
      }

      case 'cuenca':
        setModo(null);
        void procesarCuenca(lat, lng);
        return;

      case 'viewshed':
        setModo(null);
        if (datosShader) {
          const celda = celdaEnPunto(datosShader, lat, lng);
          if (celda) setViewshed(calcularViewshed(datosShader, celda.row, celda.col, alturaObs));
        }
        return;

      // Los tres que se dibujan clic a clic: acumulan y esperan el cierre a mano.
      case 'zona':
      case 'sector':
      case 'camino':
        setModo(m => agregarVertice(m, { lat, lng }));
        return;

      case 'pin':
        setPines(prev => [...prev, bloqueActivo
          ? { id: crypto.randomUUID(), lat, lng, nombre: bloqueActivo.nombre, color: bloqueActivo.color, icono: bloqueActivo.icono, notas: '' }
          : crearPin(lat, lng)]);
        setModo(null); setBloqueActivo(null);
        return;

      case 'elemento': {
        if (!elementoActivo) return;
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

      case 'mojon':
        // Los mojones sólo se agregan con clic desde la herramienta Lugar; así no
        // se marcan mojones sueltos trabajando en otra herramienta.
        if (tab === 'mojones') agregarMojon(lat, lng);
        return;

      case 'dibujo': {
        const herr = modo.tipo;
        if (herr === 'seleccion') return;
        if (herr === 'medir') { setMedicionVertices(prev => [...prev, { lat, lng }]); return; }
        // Punto: colocación inmediata, sin dibujoEnCurso
        if (herr === 'punto') {
          setDibujos(d => [...d, { id: crypto.randomUUID(), tipo: 'punto', color: colorDibujo, lat, lng, capaId: capaActivaId }]);
          return;
        }
        if (herr === 'texto') {
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
        const tipoBase = tipoBaseDe(herr);
        if (!tipoBase) return;

        // Un vértice más es la respuesta al aviso de que faltaban: se levanta.
        setAvisoDibujo(null);

        const previo = enCursoRef.current;
        const desde  = previo && previo.tipo === tipoBase ? previo.vertices : [];
        const next   = [...desde, { lat, lng }];

        // Las formas que quedan definidas con su mínimo de vértices se cierran
        // solas: un círculo con centro y borde ya no puede cambiar, pedir Enter
        // sería pedir que confirme algo que no tiene otra opción. Antes cada una
        // de las cuatro (círculo, cota, rectángulo, flecha) armaba su elemento a
        // mano acá adentro, repitiendo lo que `cerrarDibujo` ya sabe hacer.
        if (cierraSola(herr) && next.length >= VERTICES_MINIMOS[tipoBase]) {
          const trazo: DibujoEnCurso = herr === 'rectangulo'
            ? { tipo: 'poligono', vertices: rectanguloDesdeEsquinas(next[0]!, next[1]!) }
            : { tipo: tipoBase, vertices: next };
          const el = cerrarDibujo(trazo, {
            id: crypto.randomUUID(), color: colorDibujo, capaId: capaActivaId, variante: herr,
          });
          if (el) setDibujos(d => [...d, el]);
          setDibujoEnCurso({ tipo: tipoBase, vertices: [] });
          return;
        }

        setDibujoEnCurso({ tipo: tipoBase, vertices: next });
        return;
      }
    }
  }, [modo, procesarCuenca, alturaObs, datosShader, elementoActivo, tab, colorDibujo, capaActivaId, bloqueActivo, agregarMojon, objetoPendienteRef, setSombrasObjetos, setPines, setDibujos]);

  // Si el modo "agregar mojón" quedó prendido y salís de Lugar, se apaga solo.
  useEffect(() => { if (tab !== 'mojones' && modoClick) setModo(null); }, [tab, modoClick]);

  // ─── Zonas ────────────────────────────────────────────────────────────────
  const handleIniciarZona    = useCallback((categoria: CategoriaZona) => { setModo({ k: 'zona', categoria, vertices: [] }); }, []);
  const handleFinalizarZona  = useCallback((color?: string) => {
    if (!modoZona || modoZona.vertices.length < 3) return;
    setZonas(prev => [...prev, crearZona(modoZona.categoria, modoZona.vertices, color)]);
    setModo(null);
  }, [modoZona, setZonas]);
  const handleCancelarZona   = useCallback(() => setModo(null), []);

  // ─── Sectores ─────────────────────────────────────────────────────────────
  const handleIniciarSector   = useCallback((tipo: TipoSector) => { setModo({ k: 'sector', tipo, vertices: [] }); }, []);
  const handleFinalizarSector = useCallback((color?: string) => {
    if (!modoSector || modoSector.vertices.length < 3) return;
    const nuevo: Sector = {
      id: crypto.randomUUID(), tipo: modoSector.tipo,
      nombre: TIPOS_SECTOR[modoSector.tipo].label,
      vertices: modoSector.vertices, notas: '', auto: false, color,
    };
    setSectores(prev => [...prev, nuevo]);
    setModo(null);
  }, [modoSector, setSectores]);
  const handleCancelarSector  = useCallback(() => setModo(null), []);

  const handleAplicarSectorAuto = useCallback((sector: Sector) => {
    setSectores(prev => [...prev, sector]);
  }, []);

  // ─── Pines ────────────────────────────────────────────────────────────────
  const handleEditarPin = useCallback((id: string) => {
    setPinEditId(prev => prev === id ? null : id);
    setTab('mojones');
  }, []);

  // ─── Caminos ──────────────────────────────────────────────────────────────
  const handleIniciarCamino   = useCallback(() => { setModo({ k: 'camino', vertices: [] }); }, []);
  const handleFinalizarCamino = useCallback((color?: string) => {
    if (!modoCamino || modoCamino.vertices.length < 2) return;
    // Reutiliza el modo de trazado para dibujar el eje de una cortina.
    if (modoCamino.proposito === 'cortina') {
      const r = construirCortina(modoCamino.vertices, cortinaParamsRef.current, mojones, 'dibujada');
      setModo(null);
      if (!r) { setModal({ type: 'alert', message: 'No se pudo construir la cortina (trazá el eje dentro del predio).' }); return; }
      setCortina(r);
      setCapas(prev => ({ ...prev, cortinas: true }));
      return;
    }
    const c = crearCamino(modoCamino.vertices);
    setCaminos(prev => [...prev, { ...c, color: color ?? c.color }]);
    setModo(null);
  }, [modoCamino, mojones, setCaminos]);
  const handleCancelarCamino  = useCallback(() => setModo(null), []);

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
  // La última herramienta de trazado que se usó, para que la barra espaciadora
  // la vuelva a activar sin ir a buscarla a la barra —el gesto de AutoCAD—.
  // `seleccion` no cuenta: es la flecha, no una herramienta que se repita.
  const ultimaHerramienta = useRef<HerramientaDibujo | null>(null);

  const handleCambiarModo = useCallback((herr: HerramientaDibujo | null) => {
    // Cambiar de herramienta de dibujo entra al modo dibujo, y con eso apaga
    // cualquier otro modo que estuviera esperando el clic.
    if (herr && herr !== 'seleccion') ultimaHerramienta.current = herr;
    setModo(herr ? { k: 'dibujo', tipo: herr } : null);
    const tipoParaEnCurso = herr ? tipoBaseDe(herr) : null;
    setDibujoEnCurso(tipoParaEnCurso ? { tipo: tipoParaEnCurso, vertices: [] } : null);
    setMedicionVertices([]);
    setDibujoSelId(null);
    setEspejoPendiente(false);
    setElementoPoli(null);
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

  /**
   * Cierra el trazo en curso. Si todavía le faltan vértices NO lo descarta:
   * deja el trazo como está y dice qué falta en la barra de estado. Antes se
   * vaciaba igual, así que cerrar un polígono con dos puntos borraba el trabajo
   * sin crear nada y sin explicar por qué.
   */
  const handleFinalizarDibujo = useCallback(() => {
    if (!dibujoEnCurso) return;

    const motivo = motivoNoCierra(dibujoEnCurso);
    if (motivo) { setAvisoDibujo(motivo); return; }

    const id     = crypto.randomUUID();
    const capaId = capaActivaId;
    // El nombre del espejo se numera contra los que ya hay, así que la
    // construcción entra al updater: es el único lugar con la lista al día.
    setDibujos(prev => {
      const nombreEspejo = espejoPendiente
        ? `Espejo de agua ${prev.filter(d => d.nombre?.startsWith('Espejo de agua')).length + 1}`
        : null;
      const el = cerrarDibujo(dibujoEnCurso, { id, color: colorDibujo, capaId, elementoPoli, nombreEspejo });
      return el ? [...prev, el] : prev;
    });

    setAvisoDibujo(null);
    setDibujoEnCurso({ tipo: dibujoEnCurso.tipo, vertices: [] });
  }, [dibujoEnCurso, colorDibujo, capaActivaId, espejoPendiente, elementoPoli, setDibujos]);

  const handleCancelarDibujo = useCallback(() => {
    setModo(null);
    setDibujoEnCurso(null);
    setAvisoDibujo(null);
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

  /**
   * Candado para las acciones que viven FUERA del riel de herramientas, donde no
   * llega el `FeatureLock` del panel contextual: las descargas del menú Archivo y
   * de la paleta Cmd+K, y los rumbos de la tabla de linderos. Sin esto un plan
   * Semilla se baja el DXF o el GeoJSON completo.
   *
   * Devuelve `true` si hay que cortar la acción (y deja abierto el CTA al plan
   * que falta, registrando el intento en la telemetría de candados).
   */
  const pedirPlan = useCallback((feature: Feature): boolean => {
    if (can(plan, feature)) return false;
    const min = planMinimo(feature);
    registrarCandado(feature, plan, 'intento');
    setArchivoOpen(false);
    setModal({
      type: 'confirm',
      message: `${BENEFICIO_FEATURE[feature]}\n\nEsta descarga está incluida en el plan ${NOMBRE_PLAN[min]}. Tu plan actual es ${NOMBRE_PLAN[plan]}.\n\n¿Querés ver los planes?`,
      onConfirm: () => {
        registrarCandado(feature, plan, 'cta_click');
        window.location.href = `/suscribir?plan=${min}&periodo=anual`;
      },
    });
    return true;
  }, [plan]);

  const handleExportarDXF = useCallback(() => {
    if (pedirPlan('export.dxf')) return;
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
    flashListo('DXF descargado');
  }, [dibujos, mojones, origenGeo, proyectoActual, metricas, zonas, sectores, caminos, flashListo, pedirPlan]);

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
      flashListo('Guardado en la nube');
    } catch (e) {
      setModal({ type: 'alert', message: `No se pudo guardar en la nube: ${errMsgApp(e)}` });
    } finally {
      setGuardandoNube(false);
    }
  }, [mojones, proyectoActual, metadatos, flashListo]);

  const handleExportGeoJSON = useCallback(() => { if (pedirPlan('export.gis')) return; exportarGeoJSON({ mojones, zonas, sectores, pines, caminos, nombre: proyectoActual?.nombre || 'terreno' }); setArchivoOpen(false); flashListo('GeoJSON descargado'); }, [mojones, zonas, sectores, pines, caminos, proyectoActual, flashListo, pedirPlan]);
  const handleExportKML = useCallback(() => { if (pedirPlan('export.gis')) return; exportarKML(mojones, proyectoActual?.nombre || 'terreno'); setArchivoOpen(false); flashListo('KML descargado'); }, [mojones, proyectoActual, flashListo, pedirPlan]);
  const handleExportGPX = useCallback(() => { if (pedirPlan('export.gis')) return; exportarGPX(mojones, proyectoActual?.nombre || 'terreno'); setArchivoOpen(false); flashListo('GPX descargado'); }, [mojones, proyectoActual, flashListo, pedirPlan]);

  // Exportar el modelo de elevación activo (DEM propio si está cargado; si no, el satelital).
  const handleExportGeoTIFF = useCallback(() => {
    if (pedirPlan('export.gis')) return;
    setArchivoOpen(false);
    if (!grillaActiva) { setModal({ type: 'alert', message: 'Todavía no hay relieve. Marcá el terreno (o cargá un MDE propio) para generar el modelo de elevación.' }); return; }
    descargarGeoTIFF(grillaActiva, proyectoActual?.nombre || 'terreno');
    flashListo('GeoTIFF de elevación descargado');
  }, [grillaActiva, proyectoActual, flashListo, pedirPlan]);
  const handleExportMDE = useCallback(() => {
    if (pedirPlan('export.gis')) return;
    setArchivoOpen(false);
    if (!grillaActiva) { setModal({ type: 'alert', message: 'Todavía no hay relieve. Marcá el terreno (o cargá un MDE propio) para generar el modelo de elevación.' }); return; }
    descargarMDE(grillaActiva, proyectoActual?.nombre || 'terreno');
    flashListo('MDE descargado');
  }, [grillaActiva, proyectoActual, flashListo, pedirPlan]);

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

  // El puente al mapa por ref y no por el estado `navegacion`: éste se declara
  // más abajo (con el resto del mapa) y el handler de teclado vive acá arriba.
  // Además, así el listener no se reinstala cuando el mapa termina de montar.
  const navegacionRef = useRef<NavegacionMapa | null>(null);

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

      // Shift + flechas = girar el plano. El giro con el mouse pide un botón
      // central que las notebooks no tienen, así que también tiene que estar en
      // el teclado; 15° por golpe es el paso con el que se encuadra un predio.
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp')) {
        e.preventDefault();
        if (e.key === 'ArrowUp') navegacionRef.current?.alNorte();
        else navegacionRef.current?.girar(e.key === 'ArrowLeft' ? -15 : 15);
        return;
      }

      // ? = hoja de atajos
      if (e.key === '?') { e.preventDefault(); setAyudaOpen(o => !o); return; }

      // \ = ocultar/mostrar los paneles (foco al mapa)
      if (e.key === '\\') {
        e.preventDefault();
        const algunoAbierto = panelAbierto || panelDerecho === 'capas';
        setPanelAbierto(!algunoAbierto);
        if (algunoAbierto) setPanelDerecho(p => (p === 'capas' ? null : p));
        return;
      }

      // Barra espaciadora: repetir la última herramienta usada (gesto de AutoCAD).
      // Dos cuidados. Uno: si el foco está en un control, la barra es su clic, no
      // el nuestro, y robársela rompe el teclado. Dos: si hay un trazo a medio
      // hacer, reactivar la herramienta lo tiraría sin decir nada —justo lo que
      // se arregló en el cierre de dibujos—, así que ahí la barra no hace nada.
      if (e.key === ' ') {
        const enControl = e.target instanceof HTMLElement
          && e.target.closest('button, select, a, [role="button"], [contenteditable]');
        if (enControl) return;
        e.preventDefault();
        const herr = ultimaHerramienta.current;
        if (!herr) { setAvisoDibujo('Todavía no usaste ninguna herramienta.'); return; }
        if (dibujoEnCurso && dibujoEnCurso.vertices.length > 0) {
          setAvisoDibujo('Terminá el trazo (Enter) o cancelalo (Esc) antes de repetir la herramienta.');
          return;
        }
        // Sin cartel de confirmación: la barra de estado ya pasa a decir qué
        // herramienta quedó activa, y un aviso acá se pintaría de alarma.
        handleCambiarModo(herr);
        return;
      }

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
        // Hay un solo modo activo: cancelarlo es volver a reposo. El dibujo libre
        // pasa por su handler porque además tiene que soltar el trazo a medio hacer.
        if (modoDibujo) handleCancelarDibujo();
        else setModo(null);
        if (modoElementoClick) setElementoActivo(null);
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
        } else if (tieneVertices(modo) && modo.vertices.length > 0) {
          e.preventDefault();
          setModo(quitarUltimoVertice);
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
    undo, redo, modal, dibujoEnCurso, modo, modoDibujo, medicionVertices,
    modoZona, modoSector, modoCamino, modoElementoClick, dibujoSelId,
    handleFinalizarDibujo, handleFinalizarZona, handleFinalizarSector, handleFinalizarCamino,
    handleCancelarDibujo, handleEliminarDibujo, handleCambiarModo, panelAbierto, panelDerecho,
  ]);

  // ─── Geometría activa para preview CAD ────────────────────────────────────
  const tipoActivo = useMemo<import('./MapLeaflet').TipoActivo>(() => {
    if (modoDibujo === 'medir') return 'medir';
    if (modoDibujo && modoDibujo !== 'seleccion' && modoDibujo !== 'texto' && modoDibujo !== 'punto') {
      // La vista previa CAD dibuja la forma de fondo, no la herramienta.
      return tipoBaseDe(modoDibujo);
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

  const colorPreview = modoZona ? '#FFD54F' : modoSector ? '#81D4FA' : modoCamino ? (modoCamino.proposito === 'cortina' ? '#2E7D32' : '#8B4513') : colorDibujo;

  // ─── Etiqueta de modo para la barra de estado ─────────────────────────────
  // La barra de estado nombra el modo activo. El dibujo libre se resuelve acá
  // porque la barra dice qué herramienta es; el resto sale de `etiquetaModo`,
  // que cubre los doce modos —antes la barra decía "Listo" mientras el mapa
  // esperaba el clic de la cuenca, del observador o del árbol.
  const modoEstadoLabel = useMemo(() => {
    if (avisoDibujo)                return avisoDibujo;
    if (modoDibujo === 'medir')     return 'Midiendo';
    if (modoDibujo === 'seleccion') return dibujoSelId ? 'Elemento seleccionado' : 'Seleccionar';
    // Con el nombre, no con la clave: la barra decía «Dibujando radio_accion».
    if (modoDibujo)                 return `Dibujando ${NOMBRE_HERRAMIENTA[modoDibujo].toLowerCase()}`;
    return etiquetaModo(modo) ?? 'Listo';
  }, [modo, modoDibujo, dibujoSelId, avisoDibujo]);

  /**
   * Lo que el banner amarillo dice mientras hay un trazo en curso.
   *
   * Antes prometía «Enter finaliza» desde el primer clic, aunque a la forma le
   * faltaran vértices. El usuario apretaba Enter, no pasaba nada visible —el
   * aviso caía en la barra de estado, 11 px, abajo a la izquierda y truncado— y
   * la única lectura posible era que la tecla no andaba. El banner ya está
   * mirando: que cuente él lo que falta.
   */
  const bannerDibujo = useMemo(() => {
    if (!dibujoEnCurso) return null;
    const n     = dibujoEnCurso.vertices.length;
    const faltan = faltanVertices(dibujoEnCurso);
    const cola  = faltan <= 0
      ? 'Enter finaliza · Esc cancela'
      : `falta${faltan !== 1 ? 'n' : ''} ${faltan} punto${faltan !== 1 ? 's' : ''} para cerrar · Esc cancela`;
    return `Dibujando ${dibujoEnCurso.tipo} — ${n} punto${n !== 1 ? 's' : ''} · ${cola}`;
  }, [dibujoEnCurso]);

  // El aviso del trazo se borra solo: es una explicación, no un error que haya
  // que despachar. Un clic más sobre el mapa también lo levanta.
  useEffect(() => {
    if (!avisoDibujo) return;
    const t = setTimeout(() => setAvisoDibujo(null), 5000);
    return () => clearTimeout(t);
  }, [avisoDibujo]);

  // ─── Keyline: checklist + aplicar guías al plano ──────────────────────────
  const handleCheckKeyline = useCallback((id: string, parcial: Partial<KeylineCheck>) => {
    setKeylineCheck(prev => ({ ...prev, [id]: { hecho: false, nota: '', ...prev[id], ...parcial } }));
  }, []);

  /**
   * Las guías keyline van a su propia capa, no a la lista de caminos.
   *
   * Un camino es una entidad con ancho, pendiente máxima y costo de obra; una
   * guía keyline es una línea de referencia para arar y para orientar cultivos.
   * Meterlas como caminos ensuciaba la lista con veinte entradas que nadie va a
   * transitar y les colgaba atributos que no significan nada. El keypoint sí
   * queda como pin: eso sí es un punto del terreno que hay que poder encontrar.
   */
  const CAPA_KEYLINE = 'keyline-guias';
  const handleAplicarKeyline = useCallback((res: ResultadoKeyline) => {
    setCapasUsuario(prev => prev.some(c => c.id === CAPA_KEYLINE) ? prev : [
      ...prev,
      { id: CAPA_KEYLINE, nombre: 'Keyline — guías', orden: prev.length, color: '#5E35B1' },
    ]);
    setDibujos(prev => [
      ...prev,
      ...res.guias.filter(g => g.puntos.length >= 2).map(g => ({
        id: crypto.randomUUID(),
        tipo: 'linea' as const,
        vertices: g.puntos,
        grosor: g.principal ? 3 : 2,
        color: g.principal ? '#5E35B1' : '#9575CD',
        nombre: g.principal ? `Keyline ${g.cota} m (principal)` : `Keyline ${g.cota} m`,
        capaId: CAPA_KEYLINE,
      })),
    ]);
    setPines(prev => [...prev, { id: crypto.randomUUID(), lat: res.keypoint.lat, lng: res.keypoint.lng, nombre: `Keypoint ${res.keypoint.elevation.toFixed(0)} m`, color: '#5E35B1', icono: '📍', notas: res.nota }]);
  }, []);

  /** Salida para el caso puntual en que una guía sí vaya a ser un camino. */
  const handleKeylineComoCaminos = useCallback((res: ResultadoKeyline) => {
    setCaminos(prev => [
      ...prev,
      ...res.guias.filter(g => g.puntos.length >= 2).map(g => {
        const c = crearCamino(g.puntos);
        return { ...c, nombre: g.principal ? `Keyline ${g.cota} m (principal)` : `Keyline ${g.cota} m`, color: g.principal ? '#5E35B1' : '#9575CD' };
      }),
    ]);
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

  // ─── Áreas candidatas para swales, con su pendiente y su criterio ────────
  // Se miden acá y no en el panel porque la grilla vive acá; el panel sólo
  // muestra lo que cada ladera pide y deja jugar dentro de ese margen.
  const areasSwales = useMemo<AreaSwales[]>(() => [
    { id: 'predio', nombre: 'Todo el predio', vertices: null },
    ...poligonosCutFill.map(p => ({ id: p.id, nombre: p.nombre, vertices: p.vertices })),
  ], [poligonosCutFill]);

  const ctxSwales = useMemo<ContextoSwales>(() => ({
    infiltracion: claseInfiltracionDeKsat(hidroPredio.ksat_mm_h),
    cobertura:    coberturaDeSatelite(datosCobertura?.veg_pct, datosCobertura?.suelo_pct),
  }), [hidroPredio.ksat_mm_h, datosCobertura]);

  const analisisSwales = useMemo<AnalisisArea[]>(
    () => grillaActiva ? analizarAreas(grillaActiva, mojones, areasSwales, ctxSwales) : [],
    [grillaActiva, mojones, areasSwales, ctxSwales],
  );

  const handleGenerarSwales = useCallback((
    areas: AreaSwales[],
    intervalos: Record<string, number>,
    opts: Omit<OpcionesSwales, 'intervaloV' | 'pendiente_pct'>,
  ) => {
    if (!grillaActiva) { setModal({ type: 'alert', message: 'Primero calculá la topografía (Topografía → Calcular).' }); return; }
    // El panel manda ids; los vértices los resuelve el contenedor, que es quien
    // tiene los polígonos dibujados.
    const conVertices = areas.map(a => areasSwales.find(x => x.id === a.id) ?? a);
    const multi = calcularSwalesMulti(grillaActiva, mojones, conVertices, intervalos, opts, ctxSwales);
    setSwalesMulti(multi);
    const unido = unirBloques(multi);
    setSwales(unido);
    if (unido) setCapas(prev => ({ ...prev, swales: true }));
  }, [grillaActiva, mojones, areasSwales, ctxSwales]);

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

  // Mover CUALQUIER elemento (dibujo/camino/aguada/zona/sector/pin) a una carpeta
  // de usuario. Fija capaId explícito (persiste, gana al auto-archivado por tipo).
  // ─── Cuencas archivadas ───────────────────────────────────────────────────
  const handleGuardarCuenca = useCallback((params: ParamsCuenca, resultado: ResultadoCuenca) => {
    if (!cuenca) return;
    setCuencasGuardadas(prev => [...prev, crearCuencaGuardada(cuenca, params, resultado, !!cuencaExpandida, prev)]);
  }, [cuenca, cuencaExpandida]);

  const handleAbrirCuencaGuardada = useCallback((g: CuencaGuardada) => {
    setCuenca(g.cuenca);
    setCuencaExpandida(g.expandida);
    setCuencaAviso(null);
    flyToRef.current?.(g.cuenca.outlet.lat, g.cuenca.outlet.lng);
  }, [setCuenca, setCuencaExpandida, setCuencaAviso]);

  const handleEliminarCuencaGuardada = useCallback((id: string) => {
    setCuencasGuardadas(prev => prev.filter(g => g.id !== id));
    setOcultosIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, [setOcultosIds]);

  const handleRenombrarCuencaGuardada = useCallback((id: string, nombre: string) => {
    setCuencasGuardadas(prev => prev.map(g => g.id === id ? { ...g, nombre } : g));
  }, []);

  const handleMoverElementoACapa = useCallback((tipo: TipoElementoCapa, id: string, capaId: string) => {
    switch (tipo) {
      case 'cuenca': setCuencasGuardadas(prev => prev.map(g => g.id === id ? { ...g, capaId } : g)); break;
      case 'dibujo': setDibujos(prev => prev.map(d => d.id === id ? { ...d, capaId } : d)); break;
      case 'camino': setCaminos(prev => prev.map(c => c.id === id ? { ...c, capaId } : c)); break;
      case 'aguada': setAguadasLayer(prev => prev.map(a => a.id === id ? { ...a, capaId } : a)); break;
      case 'zona':   setZonas(prev => prev.map(z => z.id === id ? { ...z, capaId } : z)); break;
      case 'sector': setSectores(prev => prev.map(s => s.id === id ? { ...s, capaId } : s)); break;
      case 'pin':    setPines(prev => prev.map(p => p.id === id ? { ...p, capaId } : p)); break;
    }
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

  // Aislar (solo): mostrar sólo una carpeta —o sólo el análisis del mapa—,
  // ocultando el resto de carpetas. Guarda un snapshot de capasOcultas para
  // poder restaurar al desactivar. Objetivo '__analisis__' = ocultar todas.
  const [aislado, setAislado] = useState<string | null>(null);
  const aisladoSnap = useRef<Set<string> | null>(null);
  const aislarEn = useCallback((objetivo: string, ocultarTodas: boolean) => {
    setCapasOcultas(prev => {
      if (aislado === objetivo) {
        const snap = aisladoSnap.current ?? new Set<string>();
        aisladoSnap.current = null;
        return new Set(snap);
      }
      if (aislado === null) aisladoSnap.current = new Set(prev);
      const ids = capasUsuario.map(c => c.id);
      return new Set(ocultarTodas ? ids : ids.filter(id => id !== objetivo));
    });
    setAislado(prev => (prev === objetivo ? null : objetivo));
  }, [aislado, capasUsuario, setCapasOcultas]);
  const handleAislarCarpeta  = useCallback((id: string) => aislarEn(id, false), [aislarEn]);
  const handleAislarAnalisis = useCallback(() => aislarEn('__analisis__', true), [aislarEn]);

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
  const handleGetNavegacion = useCallback((api: NavegacionMapa) => { navegacionRef.current = api; setNavegacion(api); }, []);
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
    dispatchRelieve({ t: 'calcular' });

    // La cascada de fuentes (DEM propio → grilla densa → muestreo 10×10) vive
    // en `lib/relieve/obtenerShader`, donde se puede probar sin montar el mapa.
    const res = await obtenerShader(mojones, { demPropio, detallado: shaderDetallado });
    dispatchRelieve({ t: 'resuelto', res });

    // Motor único de relieve: encendemos el shader de altimetría + las curvas
    // de nivel (en auto). Escorrentías/sugerencias quedan como toggles aparte.
    if (res.ok) setCapas(prev => ({ ...prev, shaderElev: true, shaderPend: false, curvasNivel: true }));
  }, [mojones, shaderDetallado, demPropio]);

  /**
   * Vuelca un sitio sugerido al mapa: vuela al punto y deja el pin del muro.
   *
   * Durante un tiempo esto además dibujaba el ESPEJO de agua como polígono. La
   * idea era buena —el pin no dice nada de la forma del vaso— pero el contorno
   * salía mal: se calcula sobre el relieve global de ~30 m, y a esa resolución
   * el borde del agua es una escalera de píxeles que no se parece a la curva de
   * nivel real. Un polígono dibujado se lee como una medición, y ése no lo era.
   *
   * El pin sí es honesto: dice DÓNDE mirar, que es para lo que sirve una
   * sugerencia. La forma del vaso se dibuja a mano en el paso 1 del embalse,
   * sobre las curvas de nivel finas.
   */
  const handlePonerSitioEnMapa = useCallback((s: SitioRepresa, i: number) => {
    setPines(prev => [...prev, {
      id: crypto.randomUUID(), lat: s.lat, lng: s.lng,
      nombre: `Represa sugerida #${i + 1} (ef. ${s.eficiencia}:1)`, icono: '💧', color: '#1565C0',
      notas: `Muro sugerido — ${s.ancho_muro_m} m de ancho por ${s.altura_m} m de alto, ${miles(s.volumen_muro_m3)} m³ de terraplén. `
           + `Embalsaría ${volumenM3(s.volumen_agua_m3)} sobre un espejo de ~${s.area_ha} ha.`,
    }]);
    flyToRef.current?.(s.lat, s.lng);
  }, []);

  // Análisis topográfico integral: vuelca al plano represas + viviendas + caminos por cresta + cruces.
  const handleAplicarAnalisisIntegral = useCallback((res: AnalisisTopoIntegral) => {
    // El Análisis del predio solo sugiere REPRESAS (+ el análisis hídrico de
    // escorrentías, que se enciende aparte). Las viviendas y los caminos ahora los
    // propone el Master Plan. Los pines llevan su sub-capa para el panel de Capas.
    const CAPA_REPRESAS = 'Represas';
    const nuevosPines = res.represas.map((s, i) => ({
      id: crypto.randomUUID(), lat: s.lat, lng: s.lng,
      nombre: `Represa ${i + 1} (ef. ${s.eficiencia}:1)`, icono: '💧', color: '#1565C0',
      notas: `Sitio sugerido — agua ${volumenM3(s.volumen_agua_m3)}, muro ${miles(s.volumen_muro_m3)} m³`,
      capa: CAPA_REPRESAS, origen: 'analisis' as const,
    }));
    if (nuevosPines.length === 0) return;
    // Sólo pines: el espejo de agua no se dibuja. El contorno sale del relieve
    // global (~30 m) y a esa resolución es una escalera de píxeles, no la curva
    // de nivel del vaso — ver `handlePonerSitioEnMapa`.
    setPines(prev => [...prev, ...nuevosPines]);
    flyToRef.current?.(nuevosPines[0]!.lat, nuevosPines[0]!.lng);
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
    if (!zona0 || !acceso) {
      setModal({ type: 'alert', message: 'Marcá la zona 0 (casa) y el punto de acceso al terreno para generar el master plan.' });
      return;
    }
    const resultado = calcularMasterPlan(programaMP, datosShader, datosEscorrentia, mojones, zona0, acceso);
    setMasterPlan(resultado);
    setCapas(prev => ({ ...prev, sugerencias: true }));
  }, [datosShader, datosEscorrentia, programaMP, mojones, zona0, acceso]);

  const handleConvertirZonaMP = useCallback((el: ElementoMasterPlan) => {
    const zona = crearZona(TIPOS_ITEM[el.tipo].categoriaZona, el.vertices);
    setZonas(prev => [...prev, { ...zona, nombre: el.nombre }]);
    setMasterPlan(prev => prev ? prev.filter(e => e.id !== el.id) : prev);
  }, []);

  const handleDescartarElementoMP = useCallback((id: string) => {
    setMasterPlan(prev => prev ? prev.filter(e => e.id !== id) : prev);
  }, []);

  // Recalcular el master plan completo cada vez que cambia el programa, se mueve
  // la zona 0 o el acceso — pero solo si ya se generó una vez (si no, se espera al botón).
  useEffect(() => {
    if (!masterPlan || masterPlan.length === 0) return;
    if (!zona0 || !acceso || !datosShader || !datosEscorrentia || programaMP.length === 0) return;
    const t = setTimeout(() => {
      setMasterPlan(calcularMasterPlan(programaMP, datosShader, datosEscorrentia, mojones, zona0, acceso));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaMP, zona0, acceso]);

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
    setAcceso((meta['acceso'] as { lat: number; lng: number }) ?? null);
    setProyectoActual(p.id ? p : null);
    setSeleccionado(null);
    setDatosClimaRaw((meta['clima']  as DatosClima)        ?? null);
    setCalibracionPrecip((meta['calibracion_precip'] as CalibracionPrecip) ?? null);
    setDatosTopografia((meta['topo'] as DatosTopografia)   ?? null);
    setCaptacionSnap((meta['captacion'] as CaptacionSnapshot) ?? null);
    setDatosSuelo((meta['suelo']     as DatosSuelo)        ?? null);
    setDatosExtremos((meta['extremos'] as Extremos)        ?? null);
    setCuenca((meta['cuenca']        as Cuenca)            ?? null);
    setCuencasGuardadas((meta['cuencas_guardadas'] as CuencaGuardada[]) ?? []);
    setRedAguaResumen((meta['red_agua'] as RedAguaResumen)  ?? null);
    setRepresaResumen((meta['represa']  as RepresaResumen)  ?? null);
    setRiegoResumen((meta['riego']      as RiegoResumen)    ?? null);
    setRiegoInputs((meta['riego_inputs'] as RiegoInputs)     ?? null);
    setRedAguaInputs((meta['red_agua_inputs'] as RedAguaInputs) ?? null);
    setRepresaInputs((meta['represa_inputs'] as RepresaInputs) ?? null);
    setPanelInputs((meta['panel_inputs'] as Record<string, unknown>) ?? {});
    setRodeo((meta['rodeo'] as Rodeo) ?? RODEO_INICIAL);
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
    dispatchRelieve({ t: 'poner', datos: shaderGuardado });
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
      sinRumbos: !can(plan, 'catastro.rumbos'),
    });
    window.open('/informe/borrador', '_blank');
  }, [proyectoActual, mojones, metricas, datosClima, datosTopografia, captacionSnap, datosSuelo, datosExtremos, redAguaResumen, represaResumen, riegoResumen, coberturaResumen, entornoResumen, zonas, zoomSatelital, economiaResumen, carbonoResumen, plan]);

  // ─── Captura (hook useCapturaPng) ──────────────────────────────────────────
  // Exporta #print-capture-root a PNG vía html-to-image; el nombre sale del
  // título de captura y los errores se muestran en el modal compartido.
  const { guardandoPng, handleGuardarPng } = useCapturaPng(
    capturaTitulo,
    (mensaje) => setModal({ type: 'alert', message: mensaje }),
  );

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
      items.push({ color: 'linear-gradient(90deg,#1565C0,#66BB6A,#FFEE58,#8D6E63)', label: `Hipsométrico global (${terrariumElevMin}–${terrariumElevMax} m)` });
    if (capas.shaderElev && datosShader)
      // Con el rango explícito: es una escala relativa a ESTE predio, así que sin
      // los números el color no dice nada (y antes, además, compartía gradiente
      // con el hipsométrico y en la leyenda quedaban indistinguibles).
      items.push({ color: gradienteCss(PALETAS_ELEV[paletaShader.elev].ramp), label: `Elevación del predio (${Math.round(datosShader.elev_min)}–${Math.round(datosShader.elev_max)} m)` });
    if (capas.shaderPend && datosShader)
      items.push({ color: gradienteCss(PALETAS_PEND[paletaShader.pend].ramp), label: `Pendiente (0–${Math.round(datosShader.pend_max)} %)` });
    if (capas.curvasNivel && curvasNivel.length > 0)
      items.push({ color: colorCurvas.normal, dash: true, label: `Curvas de nivel${intervaloCurvasEfectivo ? ` (cada ${intervaloCurvasEfectivo} m)` : ''}` });
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
    aguadasFiltradas.forEach(a => {
      if (a.tipo === 'represa') items.push({ icon: '🏊', label: a.nombre });
      else items.push({ color: a.tipo === 'swale' ? '#26A69A' : '#66BB6A', dash: true, label: a.nombre });
    });
    pinesFiltrados.forEach(p => items.push({ icon: p.icono, label: p.nombre }));
    // Dibujos de usuario con nombre propio (los anónimos no ensucian la leyenda)
    dibujosFiltrados.forEach(d => {
      if (!d.nombre) return;
      const esLinea = d.tipo === 'linea' || d.tipo === 'curva' || d.tipo === 'cota';
      items.push({ color: d.color, dash: esLinea, label: d.nombre });
    });
    return items;
  }, [capas, mojones.length, datosShader, paletaShader, zonasFiltradas, sectoresFiltrados, caminosFiltrados, aguadasFiltradas, pinesFiltrados, dibujosFiltrados, terrariumElevMin, terrariumElevMax, curvasNivel, colorCurvas, intervaloCurvasEfectivo]);

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
    // Los nombres salen de `NOMBRE_HERRAMIENTA`: acá vive el orden, no la
    // traducción, que ya la tiene una sola cabeza.
    const herramientas: Comando[] = ([
      'seleccion', 'linea', 'poligono', 'circulo', 'curva', 'cota', 'medir', 'texto',
    ] as HerramientaDibujo[]).map(m => ({
      id: `tool-${m}`, grupo: 'Herramienta', label: NOMBRE_HERRAMIENTA[m], keywords: 'dibujar dibujo',
      accion: () => handleCambiarModo(m),
    }));
    const acciones: Comando[] = [
      { id: 'save',    grupo: 'Acción',   label: 'Guardar en la nube',          keywords: 'supabase proyecto', accion: handleGuardarNube },
      { id: 'undo',    grupo: 'Acción',   label: 'Deshacer',                    keywords: 'ctrl z',            accion: undo },
      { id: 'redo',    grupo: 'Acción',   label: 'Rehacer',                     keywords: 'ctrl y',            accion: redo },
      { id: 'informe', grupo: 'Exportar', label: 'Informe PDF',                 keywords: 'reporte imprimir',  accion: handleVerInforme },
      { id: 'png',     grupo: 'Exportar', label: 'Imagen PNG del plano',        keywords: 'captura foto',      accion: iniciarCaptura },
      { id: 'dxf',     grupo: 'Exportar', label: 'DXF (AutoCAD)',               keywords: 'cad autocad',       accion: handleExportarDXF },
      { id: 'geotiff', grupo: 'Exportar', label: 'GeoTIFF de elevación',        keywords: 'mde dem relieve raster qgis', accion: handleExportGeoTIFF },
      { id: 'mde',     grupo: 'Exportar', label: 'MDE (puntos XYZ)',            keywords: 'dem relieve cotas nube', accion: handleExportMDE },
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
      { id: 'guia',    grupo: 'Vista',    label: 'Abrir la guía de uso',        keywords: 'ayuda manual tutorial cómo funciona', accion: () => window.open('/guia', '_blank', 'noopener') },
    ];
    return [...irA, ...herramientas, ...acciones];
  }, [
    handleCambiarModo, handleGuardarNube, undo, redo,
    handleVerInforme, iniciarCaptura, handleExportarDXF, handleExportGeoTIFF, handleExportMDE, handleExportGeoJSON, handleExportKML, handleExportGPX,
    handleFetchShader, handleCargarPlantillaKeyline,
  ]);

  return (
    <ProveedorRelieve nombre={fuenteRelieveNombre} pasoM={pasoRelieveM}>
    <div className="flex flex-col h-screen overflow-hidden bg-bone-50">

      {/* ─── Barra superior ──────────────────────────────────────────────────── */}
      <BarraSuperior
        panelAbierto={panelAbierto}
        onTogglePanel={() => setPanelAbierto(p => !p)}
        nombreProyecto={proyectoActual?.nombre ?? null}
        dibujo={{
          modoDibujo,
          colorActivo: colorDibujo,
          enCurso: dibujoEnCurso,
          seleccionado: dibujoSelId,
          colorSeleccionado: dibujoSel?.color,
          nombreSeleccionado: dibujoSel?.nombre,
          notasSeleccionado: dibujoSel?.notas,
          medidasSeleccionado: dibujoSel ? medidasDibujo(dibujoSel) : undefined,
          capasUsuario,
          capaSeleccionado: dibujoSel ? capaDeElemento(dibujoSel.capaId, capasUsuario) : undefined,
          onMoverACapa: capaId => { if (dibujoSelId) handleMoverDibujoACapa(dibujoSelId, capaId); },
          onCambiarColor: handleCambiarColorDibujo,
          onMoverAdelante: handleMoverAdelante,
          onMoverAtras: handleMoverAtras,
          onModo: handleCambiarModo,
          onColor: setColorDibujo,
          onTransformar: handleTransformar,
          onFinalizar: handleFinalizarDibujo,
          onCancelar: handleCancelarDibujo,
          onEliminar: handleEliminarDibujo,
          onRenombrar: handleRenombrarDibujo,
        }}
        nav={{
          navegacion,
          bearing,
          capaFondo,
          onCapaFondo: setCapaFondo,
          habilitarVistas: mojones.length >= 3,
          onHistorico: () => { if (tabBloqueada(plan, 'topo')) { setTab('topo'); setPanelAbierto(true); } else setShowHistorico(true); },
          on3D: () => { if (tabBloqueada(plan, 'topo')) { setTab('topo'); setPanelAbierto(true); } else setShow3D(true); },
        }}
        guardado={{ estado: estadoGuardado, guardando: guardandoNube, onGuardar: () => void handleGuardarNube() }}
        captura={{ onEditor: iniciarCaptura, onPng: handleGuardarPng, guardandoPng }}
        historial={{ onUndo: undo, onRedo: redo, puedeUndo: canUndo, puedeRedo: canRedo }}
      />

      {/* ─── Cuerpo: panel + mapa ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
      {/* ─── Panel lateral izquierdo ─────────────────────────────────────────── */}
      <aside className="flex shrink-0 bg-bone-50">

        {/* ── Riel de íconos (acordeón de clústeres) ── */}
        <nav className={`w-[56px] shrink-0 flex flex-col items-center py-2.5 gap-0.5 border-r border-bone-200 overflow-y-auto overflow-x-clip transition-opacity duration-300 ay-ease ${dibujando ? 'opacity-45' : 'opacity-100'}`} title={dibujando ? 'Dibujando… terminá el trazo para volver' : undefined}>
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

          {/* Presupuesto — economía del proyecto, justo debajo de Producción
              (el cierre de la lectura: cuánto cuesta lo diseñado). */}
          <button
            onClick={() => { setTab('economia'); setPanelAbierto(true); }}
            title="Presupuesto — economía del proyecto"
            aria-current={tab === 'economia' || undefined}
            className={`relative w-11 rounded-lg flex flex-col items-center gap-0.5 py-1 transition-colors ${
              tab === 'economia' ? 'bg-moss-700 text-bone-50 shadow-sm' : 'text-ink-700/60 hover:text-ink-900 hover:bg-bone-200/60'
            }`}
          >
            {tab === 'economia' && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sun-400" />}
            <DollarSign className="w-4 h-4" />
            <span className="text-[7px] font-semibold uppercase tracking-tight leading-none">Presup.</span>
          </button>

          {/* ── Pie del riel: Archivo + Ajustes ──
              Los flyouts se posicionan `fixed` porque el riel recorta el eje X
              (overflow-x-clip) y cualquier popover a la derecha quedaría cortado. */}
          <div className="mt-auto w-full flex flex-col items-center gap-0.5 pt-2">
            <span className="w-7 h-px bg-bone-200 my-1" aria-hidden />

            {/* Archivo: guardar · importar · exportar. */}
            <button
              onClick={() => { setArchivoOpen(o => !o); setConfigOpen(false); }}
              title="Archivo — guardar, importar y exportar"
              aria-expanded={archivoOpen}
              className={`w-11 rounded-lg flex flex-col items-center gap-0.5 py-1 transition-colors ${
                archivoOpen ? 'text-moss-700 bg-moss-50' : 'text-ink-700/60 hover:text-ink-900 hover:bg-bone-200/60'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span className="text-[7px] font-semibold uppercase tracking-tight leading-none">Archivo</span>
            </button>

            {/* Ajustes: guía, atajos, tema, perfil, salir. */}
            <button
              onClick={() => { setConfigOpen(o => !o); setArchivoOpen(false); }}
              title="Ajustes"
              aria-expanded={configOpen}
              className={`w-11 rounded-lg flex flex-col items-center gap-0.5 py-1 transition-colors ${
                configOpen ? 'text-moss-700 bg-moss-50' : 'text-ink-700/60 hover:text-ink-900 hover:bg-bone-200/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[7px] font-semibold uppercase tracking-tight leading-none">Ajustes</span>
            </button>

            {/* Inputs ocultos para importar (mismos handlers que el panel CAD). */}
            <input ref={impDxfRef} type="file" accept=".dxf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImportarDXF(f); e.target.value = ''; }} />
            <input ref={impImgRef} type="file" accept="image/png,image/jpeg" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCargarOverlay(f); e.target.value = ''; }} />
            <input ref={impTifRef} type="file" accept=".tif,.tiff" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCargarGeoTIFF(f); e.target.value = ''; }} />
            <input ref={impDemRef} type="file" accept=".tif,.tiff" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCargarDEM(f); e.target.value = ''; }} />

            {/* Flyout Archivo */}
            {archivoOpen && (
              <>
                <div className="fixed inset-0 z-[1250]" onClick={() => setArchivoOpen(false)} />
                <div className="fixed bottom-2 left-[60px] w-60 max-h-[85vh] overflow-y-auto bg-white border border-bone-200 rounded-xl shadow-raised z-[1300] py-1.5">
                  <p className="px-3 pt-0.5 pb-1 text-[10px] uppercase tracking-wider text-ink-700/50">Proyecto</p>
                  <ExportItem icon={<Save className="w-3.5 h-3.5" />} label="Guardar en la nube" onClick={() => { setArchivoOpen(false); void handleGuardarNube(); }} />
                  <ExportItem icon={<FolderOpen className="w-3.5 h-3.5" />} label={proyectoActual ? 'Guardar como…' : 'Mis proyectos'} onClick={() => { setArchivoOpen(false); setTab('proyectos'); setPanelAbierto(true); }} />

                  <div className="h-px bg-bone-100 my-1" />
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-ink-700/50 flex items-center gap-1.5"><Upload className="w-3 h-3" /> Importar</p>
                  <ExportItem icon={<FileUp className="w-3.5 h-3.5" />} label="DXF (AutoCAD)" onClick={() => { setArchivoOpen(false); impDxfRef.current?.click(); }} />
                  <ExportItem icon={<ImagePlus className="w-3.5 h-3.5" />} label="Imagen (PNG/JPG)" onClick={() => { setArchivoOpen(false); impImgRef.current?.click(); }} />
                  <ExportItem icon={<ImageIcon className="w-3.5 h-3.5" />} label="GeoTIFF (dron / IGN)" onClick={() => { setArchivoOpen(false); impTifRef.current?.click(); }} />
                  <ExportItem icon={<Mountain className="w-3.5 h-3.5" />} label="MDE propio (relieve)" onClick={() => { setArchivoOpen(false); impDemRef.current?.click(); }} />

                  <div className="h-px bg-bone-100 my-1" />
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-ink-700/50 flex items-center gap-1.5"><Download className="w-3 h-3" /> Exportar</p>
                  <ExportItem icon={<FileText className="w-3.5 h-3.5" />} label="Informe PDF" onClick={() => { setArchivoOpen(false); handleVerInforme(); }} />
                  <ExportItem icon={<Camera className="w-3.5 h-3.5" />} label="Imagen PNG del plano" onClick={() => { setArchivoOpen(false); iniciarCaptura(); }} />
                  <ExportItem icon={<FileDown className="w-3.5 h-3.5" />} label="DXF (AutoCAD)" onClick={() => { setArchivoOpen(false); handleExportarDXF(); }} />
                  <ExportItem icon={<ImageIcon className="w-3.5 h-3.5" />} label="GeoTIFF de elevación" onClick={handleExportGeoTIFF} />
                  <ExportItem icon={<Mountain className="w-3.5 h-3.5" />} label="MDE (puntos XYZ)" onClick={handleExportMDE} />
                  <ExportItem icon={<Download className="w-3.5 h-3.5" />} label="GeoJSON" onClick={handleExportGeoJSON} />
                  <ExportItem icon={<Download className="w-3.5 h-3.5" />} label="KML (Google Earth)" onClick={handleExportKML} />
                  <ExportItem icon={<Download className="w-3.5 h-3.5" />} label="GPX" onClick={handleExportGPX} />
                </div>
              </>
            )}

            {/* Flyout Ajustes */}
            {configOpen && (
              <>
                <div className="fixed inset-0 z-[1250]" onClick={() => setConfigOpen(false)} />
                <div className="fixed bottom-2 left-[60px] w-56 max-h-[85vh] overflow-y-auto bg-white border border-bone-200 rounded-xl shadow-raised z-[1300] py-1.5">
                  <ExportItem icon={<BookOpen className="w-3.5 h-3.5" />} label="Guía de uso y fuentes" onClick={() => { setConfigOpen(false); window.open('/guia', '_blank', 'noopener'); }} />
                  {process.env.NEXT_PUBLIC_PILOT_MODE_ENABLED === 'true' && <ExportItem icon={<ClipboardList className="w-3.5 h-3.5" />} label="Enviar devolución del piloto" onClick={() => { setConfigOpen(false); window.open(`${process.env.NEXT_PUBLIC_ACEQUIA_SITE_URL ?? 'https://acequia.app'}/devolucion`, '_blank', 'noopener'); }} />}
                  <ExportItem icon={<Keyboard className="w-3.5 h-3.5" />} label="Atajos de teclado" onClick={() => { setConfigOpen(false); setAyudaOpen(true); }} />
                  <div className="h-px bg-bone-100 my-1" />
                  <button
                    onClick={ciclarTema}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink-700 hover:bg-bone-50 transition-colors text-left"
                  >
                    <span className="text-ink-700/50 shrink-0">{tema === 'oscuro' ? <Moon className="w-3.5 h-3.5" /> : tema === 'sepia' ? <Palette className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}</span>
                    Tema: <span className="font-medium capitalize">{tema}</span>
                  </button>
                  <ExportItem icon={<IdCard className="w-3.5 h-3.5" />} label="Datos del profesional…" onClick={() => { setConfigOpen(false); setPerfilOpen(true); }} />
                  <ExportItem icon={<DollarSign className="w-3.5 h-3.5" />} label={`Mi cuenta · ${NOMBRE_PLAN[plan]}`} onClick={() => { setConfigOpen(false); window.location.href = '/cuenta'; }} />
                  <div className="h-px bg-bone-100 my-1" />
                  <ExportItem icon={<Scale className="w-3.5 h-3.5" />} label="Términos de Servicio" onClick={() => { setConfigOpen(false); window.open('/terminos', '_blank', 'noopener'); }} />
                  <ExportItem icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Política de Privacidad" onClick={() => { setConfigOpen(false); window.open('/privacidad', '_blank', 'noopener'); }} />
                  <div className="h-px bg-bone-100 my-1" />
                  <button
                    onClick={() => { setConfigOpen(false); handleLogout(); }}
                    title={userName ? `Sesión: ${userName}` : undefined}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-clay-600 hover:bg-clay-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" /> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* ── Panel contextual ── */}
        <div
          className={`ay-legible relative flex flex-col border-r border-bone-200 bg-white ay-ease ${panelAbierto ? '' : 'overflow-hidden'} ${redimensionando ? '' : 'transition-all duration-300'}`}
          style={{ width: panelAbierto ? anchoPanel : 0 }}
        >
          {panelAbierto && (
            <div
              onMouseDown={iniciarResize('panel')}
              title="Arrastrá para cambiar el ancho"
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-moss-500/40 z-30"
            />
          )}
          <div className="px-4 h-12 flex items-center justify-between border-b border-bone-200 shrink-0">
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-ink-700/40 uppercase tracking-[0.12em] leading-none">
                {GRUPOS_RIEL.find(g => g.tabs.includes(tab))?.label ?? (tab === 'proyectos' ? 'Proyectos' : tab === 'economia' ? 'Presupuesto' : 'Predio')}
              </p>
              <p className="text-[13px] font-semibold text-ink-900 truncate leading-tight mt-0.5 font-display">
                {TAB_DEF.get(tab)?.label ?? ''}
              </p>
            </div>
            <button onClick={() => setPanelAbierto(false)} title="Ocultar panel" className="shrink-0 p-1 -mr-1 rounded-md text-ink-700/40 hover:text-ink-900 hover:bg-bone-100 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Scroll area — key={tab} re-dispara la cascada al cambiar de herramienta;
              cada sección del panel entra escalonada (ver .ay-reveal en globals.css). */}
          <div key={tab} className="flex-1 overflow-y-auto ay-reveal">
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
              {/* Buscar la localidad para ubicar el predio (antes flotaba sobre el mapa).
                  relative z-20: el desplegable de resultados debe quedar por encima de las
                  secciones hermanas (onboarding/mojones). Sin esto, la cascada .ay-reveal les
                  da un transform temporal que crea stacking context y el dropdown queda debajo. */}
              <div className="relative z-20">
                <p className="eyebrow mb-1.5">Ubicar el predio</p>
                <BuscadorLugar onElegir={handleElegirLugar} />
              </div>
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
                        ['1', 'Marcá tu terreno', 'Dibujá los mojones en el mapa, cargá coordenadas o importá un archivo.'],
                        ['2', 'Escuchá lo que dice', 'Subí la Escala de Permanencia desde el riel: 1 Clima, 2 Relieve, 3 Agua. El terreno te cuenta lo esencial antes de dibujar nada.'],
                        ['3', 'Diseñá encima', 'Zonas y sistemas productivos (4 y 5). Al final, el Presupuesto y tu informe, listos para compartir.'],
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
                <MojonForm modoClick={modoClick} onToggleModoClick={() => setModo(m => m?.k === 'mojon' ? null : { k: 'mojon' })} onAgregar={(lat, lng) => agregarMojon(lat, lng, true)} onCargarMojones={setMojones} />
              </div>
              {metricas && (
                <div className="border-t border-bone-200 pt-4">
                  <PoligonoPanel
                    metricas={metricas}
                    rumbosBloqueados={!can(plan, 'catastro.rumbos')}
                    onDesbloquearRumbos={() => pedirPlan('catastro.rumbos')}
                  />
                </div>
              )}
              {/* Pines de referencia */}
              <div className="border-t border-bone-200 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Puntos de referencia</p>
                  <span className="text-xs text-moss-700 bg-moss-100 px-2 py-0.5 rounded-full font-medium">{pines.length}</span>
                </div>
                <button
                  onClick={() => setModo({ k: 'pin' })}
                  disabled={modoPinClick}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    modoPinClick ? 'bg-sun-500 text-ink-950 cursor-default' : 'bg-moss-700 hover:bg-moss-900 text-bone-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {modoPinClick ? 'Hacé clic en el mapa…' : 'Agregar pin'}
                </button>
                {modoPinClick && (
                  <button onClick={() => setModo(null)} className="w-full text-xs text-ink-700/50 hover:text-ink-700 py-1 transition-colors">
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
                  <button onClick={() => { setBloqueActivo(null); setModo(null); }} className="text-ink-700/40 hover:text-ink-700 transition-colors"><X className="w-3 h-3" /></button>
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
                        onClick={() => { setBloqueActivo(b); setModo({ k: 'pin' }); }}
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
                  <button onClick={() => { setElementoActivo(null); setElementoPoli(null); if (modoDibujo) handleCancelarDibujo(); else setModo(null); }} className="text-ink-700/40 hover:text-ink-700 transition-colors"><X className="w-3 h-3" /></button>
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
                          setElementoActivo(e); setBloqueActivo(null);
                          // Los elementos de forma libre se sellan con un clic; los que son
                          // polígono se dibujan, así que entran al modo dibujo.
                          if (e.forma === 'poligono') { handleCambiarModo('poligono'); setElementoPoli(e); }
                          else { setModo({ k: 'elemento' }); setElementoPoli(null); }
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
          {tab === 'topo'  && <div className="px-4 py-4"><TopografiaPanel mojones={mojones} datos={datosTopografia} onDatos={setDatosTopografia} cargando={topoLoading} onCargando={setTopoLoading} error={topoError ?? shaderError} onError={setTopoError} onFetchShader={handleFetchShader} shaderCargando={shaderLoading} /></div>}
          {tab === 'suelo' && <div className="px-4 py-4"><SuelosPanel mojones={mojones} datos={datosSuelo} onDatos={setDatosSuelo} cargando={sueloLoading} onCargando={setSueloLoading} error={sueloError} onError={setSueloError} /></div>}
          {tab === 'cobertura' && <div className="px-4 py-4"><CoberturaPanel mojones={mojones} datos={datosCobertura} onDatos={setDatosCobertura} onResumen={setCoberturaResumen} /></div>}
          {tab === 'entorno' && <div className="px-4 py-4"><EntornoPanel mojones={mojones} datos={datosEntorno} onDatos={setDatosEntorno} onResumen={setEntornoResumen} /></div>}
          {tab === 'cal'   && <div className="px-4 py-4"><CalendarioPanel datosClima={datosClima} onIrAClima={() => setTab('clima')} inicial={panelInputs['calendario'] as CalendarioInputs ?? null} onInputs={usarInputs('calendario')} /></div>}
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
                  <button onClick={() => setModo(m => m?.k === 'viewshed' ? null : { k: 'viewshed' })}
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
                    Verde = superficie visible desde el punto (línea de visión sobre el MDE{fuenteRelieveNombre ? `: ${fuenteRelieveNombre}` : ''}). No considera vegetación ni construcciones. Útil para miradores, torres de agua, cámaras y privacidad.
                  </p>
                </>
              )}
            </div>
          )}
          {tab === 'agua'  && <div className="px-4 py-4"><CaptacionPanel datosClima={datosClima} onIrAClima={() => setTab('clima')} texturaSuelo={datosSuelo ? { arcilla_pct: datosSuelo.arcilla, arena_pct: datosSuelo.arena } : null} onSnapshot={setCaptacionSnap} snapshotInicial={captacionSnap} /></div>}
          {tab === 'prod'  && <div className="px-4 py-4"><ProduccionPanel datosClima={datosClima} mojones={mojones} areaHa={metricas?.area_ha ?? 0} onIrAClima={() => setTab('clima')} rodeo={rodeo} onRodeo={setRodeo} /></div>}
          {tab === 'aptitud' && <div className="px-4 py-4"><AptitudPanel datosShader={datosShader} datosEscorrentia={datosEscorrentia} datosClima={datosClima} onAplicarZonas={handleAplicarZonasAptitud} onIrATopo={() => { setTab('topo'); }} /></div>}
          {tab === 'analisis' && (
            <div className="px-4 py-4">
              <AnalisisRelievePanel
                mojones={mojones}
                onAplicar={handleAplicarAnalisisIntegral}
                topoLista={!!datosShader && !!datosEscorrentia}
                onIrATopo={() => setTab('topo')}
                onAnalizado={handleAnalisisPredioListo}
                inicial={panelInputs['analisis_relieve'] as AnalisisInputs ?? null}
                onInputs={usarInputs('analisis_relieve')}
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
                onMarcarZona0={() => setModo(m => m?.k === 'zona0' ? null : { k: 'zona0' })}
                onQuitarZona0={() => setZona0(null)}
                acceso={acceso}
                modoMarcarAcceso={modoAcceso}
                onMarcarAcceso={() => setModo(m => m?.k === 'acceso' ? null : { k: 'acceso' })}
                onQuitarAcceso={() => setAcceso(null)}
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
                inicial={panelInputs['sectores'] as SectoresInputs ?? null}
                onInputs={usarInputs('sectores')}
              />
            </div>
          )}
          {tab === 'aguadas' && (
            <div className="px-4 py-4 space-y-3">
              {/* Cuatro pasos que antes venían apilados en una sola columna: para
                  llegar a la curva de llenado había que scrollear por los sitios
                  sugeridos, los tres pasos del embalse, el muro y la cuenca.
                  Los paneles NO se desmontan al cambiar de sub-pestaña —se
                  ocultan— porque el embalse calculado alimenta a la simulación. */}
              <div className="flex gap-0.5 bg-bone-100 rounded-lg p-0.5">
                {SUBS_REPRESA.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSubRepresa(s.id)}
                    className={`flex-1 text-[9px] font-medium py-1.5 rounded-md transition-colors ${
                      subRepresa === s.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700/55 hover:text-ink-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className={subRepresa === 'sugerencias' ? '' : 'hidden'}>
                <SitiosRepresaPanel mojones={mojones} onPonerEnMapa={handlePonerSitioEnMapa} inicial={panelInputs['sitios_represa'] as SitiosInputs ?? null} onInputs={usarInputs('sitios_represa')} />
              </div>
              <div className={subRepresa === 'sugerencias' ? 'hidden' : ''}>
                {/* En «Sugerencias» este panel está oculto pero sigue montado:
                    qué sección reciba da igual mientras no se vea. */}
                <CutFillPanel
                  coefAnualPredio={datosCobertura ? hidroPredio.coefAnual : null}
                  composicionPredio={hidroPredio.composicion}
                  seccion={subRepresa === 'sugerencias' ? 'embalse' : subRepresa}
                  mojones={mojones} datosShader={datosShader} poligonos={poligonosCutFill}
                  onDibujarEspejo={handleDibujarEspejo}
                  datosClima={datosClima} cuencaHa={cuenca?.area_ha ?? null}
                  grupoHidro={datosSuelo?.grupo_hidro?.grupo ?? null}
                  texturaSuelo={datosSuelo ? { arcilla_pct: datosSuelo.arcilla, arena_pct: datosSuelo.arena } : null}
                  inicial={represaInputs} onInputs={setRepresaInputs}
                  rodeo={rodeo} onRodeo={setRodeo}
                  onResumenRepresa={setRepresaResumen}
                  onCuencaCalculada={(c) => { setCuenca(c); setCuencaExpandida(false); }}
                  onMuroLinea={setMuroLinea}
                />
              </div>
            </div>
          )}
          {tab === 'keyline' && (
            <div className="px-4 py-4">
              <KeylinePanel mojones={mojones} datosShader={datosShader} parcelas={poligonosCutFill} onAplicarGuias={handleAplicarKeyline} onAplicarComoCaminos={handleKeylineComoCaminos} onAplicarPatron={handleAplicarPatron} inicial={panelInputs['keyline'] as KeylineInputs ?? null} onInputs={usarInputs('keyline')} />
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
              <RedServiciosPanel
                caminos={caminos}
                onCargarPerfil={handleCargarPerfilCamino}
                onIrACaminos={() => setTab('caminos')}
                onMarcarServicio={handleMarcarServicio}
                riego={riegoResumen ? { nombre: riegoResumen.cultivo, caudal_ls: riegoResumen.caudal_continuo_ls } : null}
                onIrARiego={() => setTab('riego')}
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
                multi={swalesMulti}
                analisis={analisisSwales}
                hidro={hidroPredio}
                onPeriodoRetorno={setPeriodoRetorno}
                onIrAClima={() => setTab('clima')}
                onIrASuelo={() => setTab('suelo')}
                onGenerar={handleGenerarSwales}
                onColocar={handleColocarSwales}
                onIrATopo={() => setTab('topo')}
                inicial={panelInputs['swales'] as SwalesInputs ?? null}
                onInputs={usarInputs('swales')}
              />
            </div>
          )}
          {tab === 'cortinas' && (
            <div className="px-4 py-4">
              <CortinasPanel
                terrenoListo={mojones.length >= 3}
                tieneCasa={!!zona0}
                dibujando={modoCamino?.proposito === 'cortina'}
                cortina={cortina}
                onSugerir={handleSugerirCortina}
                onDibujar={handleDibujarCortina}
                onCancelarDibujo={() => setModo(null)}
                onColocar={handleColocarCortina}
                inicial={panelInputs['cortinas'] as CortinasInputs ?? null}
                onInputs={usarInputs('cortinas')}
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
                inicial={panelInputs['cortafuegos'] as CortafuegosInputs ?? null}
                onInputs={usarInputs('cortafuegos')}
              />
            </div>
          )}
          {tab === 'silvopastura' && (
            <div className="px-4 py-4">
              <SilvopasturaPanel
                grillaLista={!!grillaActiva}
                silvopastura={silvopastura}
                onGenerar={handleGenerarSilvopastura}
                onColocar={handleColocarSilvopastura}
                onIrATopo={() => setTab('topo')}
                inicial={panelInputs['silvopastura'] as SilvoInputs ?? null}
                onInputs={usarInputs('silvopastura')}
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
                fuenteDem={grillaActiva?.fuente ?? datosShader?.fuente ?? null}
                hidro={hidroPredio}
                onPeriodoRetorno={setPeriodoRetorno}
                onMarcar={() => setModo(m => m?.k === 'cuenca' ? null : { k: 'cuenca' })}
                onLimpiar={() => { setCuenca(null); setModo(null); setCuencaAviso(null); setCuencaExpandida(false); }}
                onIrATopo={() => setTab('topo')}
                onUsarPoligono={handleUsarPoligonoCuenca}
                onEditarCuenca={handleEditarCuenca}
                onExtender={handleExtenderCuenca}
                guardadas={cuencasGuardadas}
                onGuardar={handleGuardarCuenca}
                onAbrir={handleAbrirCuencaGuardada}
                onEliminar={handleEliminarCuencaGuardada}
                inicial={panelInputs['cuenca_params'] as CuencaInputs ?? null}
                onInputs={usarInputs('cuenca_params')}
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

      {/* Sin chevrons flotantes sobre el mapa: el panel izquierdo se togglea
          desde el chevron del header y su botón de cerrar; el panel de Capas,
          desde el botón "Capas" del dock (arriba-derecha). Menos ruido al centro. */}

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
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-[1000] text-sm px-5 py-2.5 rounded-full shadow-raised font-medium pointer-events-none no-print ${
            avisoDibujo ? 'bg-clay-600 text-bone-50' : 'bg-sun-500 text-ink-950'}`}>
            {/* El aviso desplaza al modo: mientras dura, lo urgente es que
                falta un clic, no cómo se llama la herramienta. */}
            {avisoDibujo ? avisoDibujo :
             modoZona    ? `Dibujando zona — ${modoZona.vertices.length} vértices · Enter finaliza · Esc cancela`   :
             modoSector  ? `Dibujando sector — ${modoSector.vertices.length} vértices · Enter finaliza · Esc cancela` :
             modoCamino  ? `${modoCamino.proposito === 'cortina' ? 'Trazando cortina' : 'Trazando camino'} — ${modoCamino.vertices.length} puntos · Enter finaliza · Esc cancela`  :
             modoPinClick? 'Hacé clic en el mapa para colocar el pin' :
             modoArbol   ? 'Hacé clic en el mapa para plantar el árbol' :
             modoViewshed? 'Hacé clic en el mapa para elegir el punto de observación' :
             modoCuenca  ? 'Hacé clic en el mapa para elegir el punto de cierre de la cuenca' :
             modoDibujo === 'medir'
               ? `Midiendo — ${medicionVertices.length} puntos · distancia · área · ∠ · Backspace borra · Enter/Esc limpia`
               : modoDibujo === 'cota'
               ? (dibujoEnCurso?.vertices.length ? 'Clic en el punto final de la cota' : 'Clic en el punto inicial de la cota')
               : modoDibujo && modoDibujo !== 'seleccion'
               ? (bannerDibujo ?? `Dibujando ${modoDibujo} — hacé clic para el primer punto · Esc cancela`)
               :            'Hacé clic en el mapa para agregar un mojón'}
          </div>
        )}

        {/* Momento "listo" — confirmación efímera de una acción completada
            (descarga, guardado). Se auto-centra y desaparece vía `ay-flash`. */}
        {flashMsg && (
          <div key={flashMsg} className="ay-flash absolute top-3 left-1/2 z-[1100] flex items-center gap-1.5 px-4 py-2 rounded-full shadow-raised text-sm font-medium pointer-events-none bg-moss-700 text-bone-50 no-print">
            <Check className="w-4 h-4" /> {flashMsg}
          </div>
        )}

        {/* ── Paneles del mapa (Escala / Capas) + panel derecho ──
            La navegación (3D, zoom, brújula, satélite/topo, histórico) vive ahora
            en la barra superior; acá quedan sólo los interruptores de panel, así
            el dock respira y no tapa la zona de captura. */}
        <div className="absolute top-3 right-3 z-[1000] no-print flex flex-col items-end gap-1.5">
          {/* Con el panel de Capas abierto, el acceso Escala/Capas vive en su
              cabecera; así el dock no tapa el plano. */}
          {panelDerecho !== 'capas' && (
            <ControlesPaneles
              capasAbierto={false}
              onCapas={() => setPanelDerecho('capas')}
              escalaAbierta={panelDerecho === 'bitacora'}
              onEscala={() => setPanelDerecho(p => (p === 'bitacora' ? null : 'bitacora'))}
            />
          )}

          {/* El panel de Capas ahora es un sidebar full-height (fuera del <main>). */}

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
          cortina={cortina}
          silvopastura={silvopastura}
          cuencaPoligono={cuenca?.poligono ?? null}
          cuencaOutlet={cuenca?.outlet ?? null}
          cuencasGuardadas={cuencasVisibles}
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
          paletaShaderElev={paletaShader.elev}
          paletaShaderPend={paletaShader.pend}
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
          layoutSignal={`${panelAbierto}|${panelDerecho}|${redimensionando ? 'r' : `${anchoPanel}x${anchoCapas}`}`}
          overlay={overlay}
          onOverlayEsquina={handleOverlayEsquina}
          masterPlan={masterPlanVisible}
          masterPlanCaminos={mpCaminosVisible}
          marcadorBusqueda={marcadorBusqueda}
          zona0={zona0}
          acceso={acceso}
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
              <Isotipo className="w-6 h-6 self-center shrink-0 text-[#2E6B8A]" />
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
                      ) : item.color?.startsWith('linear-gradient') ? (
                        <span className="w-3 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                      ) : (
                        <input
                          type="color"
                          value={item.color ?? '#999999'}
                          onChange={e => setLeyendaEditada(prev => prev?.map(x => x.id === item.id ? { ...x, color: e.target.value } : x) ?? null)}
                          className="w-4 h-4 shrink-0 cursor-pointer border border-bone-200 rounded p-0 bg-transparent"
                          title="Color del ítem"
                        />
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
                {/* Banda de marca (cajetín profesional) — white-label en plan Estudio */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-ink-950 text-bone-50">
                  {can(plan, 'informe.white_label') && rotulo.logo
                    ? <img src={rotulo.logo} alt="" className="w-5 h-5 object-contain shrink-0 bg-bone-50 rounded p-0.5" />
                    : <Isotipo className="w-5 h-5 shrink-0" />}
                  <div className="leading-none flex-1 min-w-0">
                    <p className="text-[6px] uppercase tracking-[0.2em] text-bone-50/60">{(can(plan, 'informe.white_label') && rotulo.marca) || 'Arte y Tierra'}</p>
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
                      value={rotulo[field] ?? ''}
                      onChange={e => setRotulo(r => ({ ...r, [field]: e.target.value }))}
                      placeholder={label}
                      className="w-full text-[9px] border border-bone-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
                    />
                  ))}
                  {/* Marca propia (white-label) — plan Estudio */}
                  {can(plan, 'informe.white_label') ? (
                    <div className="pt-1 mt-1 border-t border-bone-200 space-y-1">
                      <p className="text-[8px] uppercase tracking-wider text-water-700 font-semibold">Tu marca</p>
                      <input
                        value={rotulo.marca ?? ''}
                        onChange={e => setRotulo(r => ({ ...r, marca: e.target.value }))}
                        placeholder="Nombre de tu estudio / marca"
                        className="w-full text-[9px] border border-bone-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
                      />
                      <div className="flex items-center gap-1.5">
                        <label className="flex-1 text-[9px] text-center border border-dashed border-water-500/40 text-water-700 rounded px-1.5 py-1 bg-white hover:bg-water-500/5 cursor-pointer transition-colors">
                          {rotulo.logo ? 'Cambiar logo' : 'Subir logo'}
                          <input
                            type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;
                              if (file.size > 400_000) { setModal({ type: 'alert', message: 'El logo es muy pesado (máx. 400 KB). Reducilo antes de subirlo.' }); return; }
                              const reader = new FileReader();
                              reader.onload = () => setRotulo(r => ({ ...r, logo: String(reader.result) }));
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        {rotulo.logo && (
                          <button
                            onClick={() => setRotulo(r => ({ ...r, logo: undefined }))}
                            title="Quitar logo propio"
                            className="shrink-0 p-1 text-ink-700/40 hover:text-clay-600 transition-colors"
                          ><X className="w-3 h-3" /></button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="pt-1 mt-1 border-t border-bone-200 text-[8px] text-ink-700/50 leading-tight">
                      🔒 Logo y marca propios en el rótulo: plan <span className="font-semibold text-water-700">Estudio</span>.
                    </p>
                  )}
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

      {/* ─── Sidebar de Capas (full-height, regulable, a la derecha del mapa) ── */}
      {panelDerecho === 'capas' && (
        <div
          className={`relative flex flex-col border-l border-bone-200 bg-bone-50 shrink-0 no-print ${redimensionando ? '' : 'transition-[width] duration-300 ay-ease'}`}
          style={{ width: anchoCapas }}
        >
          <div
            onMouseDown={iniciarResize('capas')}
            title="Arrastrá para cambiar el ancho"
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-moss-500/40 z-30"
          />
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
            cuencasGuardadas={cuencasGuardadas} onRenombrarCuenca={handleRenombrarCuencaGuardada} onEliminarCuenca={handleEliminarCuencaGuardada}
            capasUsuario={capasUsuario} capasOcultas={capasOcultas} capaActivaId={capaActivaId}
            onSetCapaActiva={setCapaActivaId}
            onToggleCapaOculta={handleToggleCapaOculta}
            onRenombrarCapa={handleRenombrarCapa}
            onEliminarCapa={handleEliminarCapa}
            onColorCapa={handleColorCapa}
            onReordenarCapa={handleReordenarCapa}
            onMoverDibujoACapa={handleMoverDibujoACapa}
            onMoverElemento={handleMoverElementoACapa}
            aislado={aislado}
            onAislarCarpeta={handleAislarCarpeta}
            onAislarAnalisis={handleAislarAnalisis}
            onFlyTo={(lat, lng) => flyToRef.current?.(lat, lng, 17)}
            onCrearCapa={() => setModal({
              type: 'prompt', message: 'Nombre de la nueva carpeta:', placeholder: 'Ej: Propuesta casa…',
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
            saludErosion={saludErosion} perdidaErosion={perdidaErosion}
            haySwales={!!swales}
            hayCortinas={!!cortina}
            hayCortafuegos={!!cortafuegos}
            haySilvopastura={!!silvopastura}
            onCerrar={() => setPanelDerecho(null)}
            escalaAbierta={false}
            onEscala={() => setPanelDerecho('bitacora')}
            terrariumElevMin={terrariumElevMin}
            terrariumElevMax={terrariumElevMax}
            intervaloContorno={intervaloContorno}
            setIntervaloContorno={setIntervaloContorno}
            intervaloCurvas={intervaloCurvasEfectivo}
            demPropio={demPropio}
            pasoRelieveM={pasoRelieveM}
            fuenteRelieveNombre={fuenteRelieveNombre}
            pisoIntervalo={pisoIntervalo}
            curvasDemasiadas={curvasDemasiadas}
            curvasLoading={curvasLoading}
            colorCurvas={colorCurvas}
            onColorCurvas={setColorCurvas}
            opacidadShader={opacidadShader}
            onOpacidadShader={setOpacidadShader}
            paletaShader={paletaShader}
            onPaletaShader={setPaletaShader}
            onResetTerrariumRango={handleResetTerrariumRango}
          />
        </div>
      )}
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
    </ProveedorRelieve>
  );
}

