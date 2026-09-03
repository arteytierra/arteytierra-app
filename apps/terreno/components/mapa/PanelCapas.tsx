'use client';

import { useState, useEffect } from 'react';
import { Trash2, ChevronRight, Mountain, Droplets, Layers, Sun, Waves, Eye, EyeOff, X, GripVertical, Trees, TriangleAlert, Flame, Fence, Shapes, Target, Sparkles, ClipboardList } from 'lucide-react';
import { useCapasDnD } from '@/hooks/useCapasDnD';
import { CATEGORIAS_ZONA } from '@/lib/zonificacion';
import { type Pin } from '@/lib/pines';
import { type Camino } from '@/lib/caminos';
import { type DatosArcoSolar } from '@/lib/arco_solar';
import { gradienteCss, PALETAS_ELEV, PALETAS_PEND, type DatosShader, type Paleta, type PaletaElev, type PaletaPend } from '@/lib/shaders';
import { MAX_NIVELES } from '@/lib/curvasNivel';
import type { DEMImportado } from '@/lib/demImport';
import { fmtPaso } from '@/lib/contextoRelieve';
import { CLASES_EROSION, type DatosErosion } from '@/lib/erosion';
import { type Confianza } from '@/lib/hidrologiaPredio';
import { SaludCalculo } from '../SaludCalculo';
import { type CuencaGuardada } from '@/lib/cuencasGuardadas';
import { TOLERANCIA_T_HA, type PerdidaSuelo } from '@/lib/usle';
import { CAPA_DEFAULT_ID, capaDeElemento, carpetaEscalaPara, tieneEscalaCompleta, type CapaUsuario, type TipoElementoCapa } from '@/lib/capasUsuario';
import { TIPOS_ITEM, type ElementoMasterPlan } from '@/lib/masterplan';
import type { ElementoAguada } from '@/lib/aguadas';
import type { Mojon } from '@/lib/types';
import type { Zona } from '@/lib/zonificacion';
import type { Sector } from '@/lib/sectores';
import { TIPOS_SECTOR } from '@/lib/sectores';
import type { CapasVisibles } from '../MapLeaflet';
import type { Tab } from './riel';
/**
 * El panel de capas de /mapa —el árbol tipo Photoshop— y las filas que lo
 * componen.
 *
 * Es el bloque más grande que salió de MapaTerrenoApp. No guarda nada: todo lo
 * que muestra y todo lo que hace le llega por props, así que se mudó tal cual.
 */

function SelectorPaleta<K extends string>({ paletas, valor, onElegir }: {
  paletas:  Record<K, Paleta>;
  valor:    K;
  onElegir: (k: K) => void;
}) {
  return (
    <div className="mx-3 mb-2 flex items-start gap-2">
      <span className="text-[9px] text-ink-700/60 w-16 shrink-0 pt-0.5">Paleta:</span>
      <div className="flex-1 flex gap-1">
        {(Object.keys(paletas) as K[]).map(k => {
          const p = paletas[k];
          const activa = k === valor;
          return (
            <button
              key={k}
              onClick={() => onElegir(k)}
              title={p.nota}
              aria-pressed={activa}
              className={`flex-1 min-w-0 rounded-sm overflow-hidden transition-opacity ${
                activa ? 'ring-1 ring-moss-700' : 'opacity-55 hover:opacity-100'}`}
            >
              <span className="block h-2.5" style={{ background: gradienteCss(p.ramp) }} />
              <span className="block px-0.5 text-[8px] leading-tight text-ink-700/70 truncate">{p.nombre}</span>
            </button>
          );
        })}
      </div>
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
  /** Paso horizontal efectivo del relieve en uso (m); null si todavía no hay grilla. */
  pasoRelieveM:        number | null;
  /** Nombre de la fuente de relieve en uso ("swissALTI3D", "Copernicus GLO-30"…). */
  fuenteRelieveNombre: string | null;
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
  cuencasGuardadas:    CuencaGuardada[];
  onRenombrarCuenca:   (id: string, nombre: string) => void;
  onEliminarCuenca:    (id: string) => void;
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
  onMoverElemento:     (tipo: TipoElementoCapa, id: string, capaId: string) => void;
  aislado:             string | null;
  onAislarCarpeta:     (id: string) => void;
  onAislarAnalisis:    () => void;
  onFlyTo:             (lat: number, lng: number) => void;
  onCrearCapa:         () => void;
  onCargarPlantillaKeyline: () => void;
  datosShader:         DatosShader | null;
  datosErosion:        DatosErosion | null;
  saludErosion:        Confianza | null;
  perdidaErosion:      Record<number, PerdidaSuelo> | null;
  haySwales:           boolean;
  hayCortinas:         boolean;
  hayCortafuegos:      boolean;
  haySilvopastura:     boolean;
  analisisHecho:       boolean;
  onIrATopo:           () => void;
  mojones:             Mojon[];
  masterPlanHay:       boolean;
  masterPlan:          ElementoMasterPlan[] | null;
  hayConectoresMP:     boolean;
  subCapasOcultas:     Set<string>;
  onToggleSubCapa:     (key: string) => void;
  onCerrar:            () => void;
  escalaAbierta:       boolean;
  onEscala:            () => void;
  terrariumElevMin:    number;
  terrariumElevMax:    number;
  colorCurvas:         { normal: string; maestra: string };
  onColorCurvas:       (c: { normal: string; maestra: string }) => void;
  opacidadShader:      { elev: number; pend: number };
  onOpacidadShader:    (v: { elev: number; pend: number }) => void;
  paletaShader:        { elev: PaletaElev; pend: PaletaPend };
  onPaletaShader:      (v: { elev: PaletaElev; pend: PaletaPend }) => void;
  onResetTerrariumRango: () => void;
}

export function PanelCapas({
  capas, onCapas, datosArcoSolar, zonas, sectores, pines, caminos, dibujos, aguadasLayer,
  ocultosIds, onToggle,
  onRenombrarPin, onEliminarPin,
  onRenombrarZona, onEliminarZona,
  onRenombrarSector, onEliminarSector,
  onRenombrarCamino, onEliminarCamino,
  onRenombrarDibujo, onEliminarDibujo,
  onRenombrarAguada, onEliminarAguada,
  cuencasGuardadas, onRenombrarCuenca, onEliminarCuenca,
  capasUsuario, capasOcultas, capaActivaId, onSetCapaActiva,
  onToggleCapaOculta, onRenombrarCapa, onEliminarCapa, onColorCapa, onReordenarCapa, onMoverDibujoACapa, onMoverElemento, aislado, onAislarCarpeta, onAislarAnalisis, onFlyTo, onCrearCapa, onCargarPlantillaKeyline,
  datosShader, datosErosion, saludErosion, perdidaErosion, haySwales, hayCortinas, hayCortafuegos, haySilvopastura, analisisHecho, onIrATopo, mojones,
  masterPlanHay, masterPlan, hayConectoresMP, subCapasOcultas, onToggleSubCapa,
  onCerrar, escalaAbierta, onEscala,
  terrariumElevMin, terrariumElevMax,
  intervaloContorno, setIntervaloContorno, demPropio, pasoRelieveM, fuenteRelieveNombre, pisoIntervalo, curvasDemasiadas,
  intervaloCurvas, curvasLoading,
  colorCurvas, onColorCurvas,
  opacidadShader, onOpacidadShader,
  paletaShader, onPaletaShader,
  onResetTerrariumRango,
}: PanelCapasProps) {
  const [exp, setExp] = useState({ topo: true, terreno: false, zonas: true, sectores: true, caminos: true, pines: true, hidrico: true, erosion: true, swales: true, cortinas: true, cortafuegos: true, silvopastura: true, sugerencias: true, analisis: true, aguadas: true, dibujos: true, arcSolar: true });
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

  // El drag & drop del panel (reordenar grupos + arrastrar elementos/overlays a
  // carpetas) vive en useCapasDnD; se cablea más abajo, una vez disponible `linkablesKeys`.

  // Carpeta efectiva de un elemento (su capaId o la carpeta de la Escala por tipo).
  const folderEf = (capaId: string | undefined, tipo: TipoElementoCapa) =>
    capaDeElemento(capaId ?? carpetaEscalaPara(tipo), capasUsuario);
  // ¿Está prendida la capa maestra del tipo? (el ojo global por tipo sigue mandando)
  const masterVisible: Record<TipoElementoCapa, boolean> = {
    dibujo: capas.dibujos, camino: capas.caminos, aguada: capas.aguadas,
    zona: capas.zonas, sector: capas.sectores, pin: capas.pines,
    cuenca: capas.aguadas,   // cuelgan del mismo maestro que el resto del agua
  };
  const capasOrdenadas = [...capasUsuario].sort((a, b) => a.orden - b.orden);
  const escalaCompleta = tieneEscalaCompleta(capasUsuario);

  // ── Overlays de análisis vinculables a una carpeta ──
  // Cada overlay de una sola llave puede "archivarse" en una carpeta: aparece
  // como acceso (con su ojo) dentro de la carpeta, sin sacar sus controles de
  // "Análisis del mapa". Se arrastra el grupo a la carpeta o se usa el desplegable.
  type OverlayLink = { key: string; flag: keyof CapasVisibles; label: string; icon: React.ReactNode; disponible: boolean };
  const OVERLAYS_LINKABLES: OverlayLink[] = [
    { key: 'escorrentias', flag: 'escorrentias', label: 'Escorrentías',        icon: <Droplets className="w-3 h-3" style={{ color: '#1E88E5' }} />,     disponible: !!datosShader },
    { key: 'erosion',      flag: 'erosion',      label: 'Erosión (RUSLE)',     icon: <TriangleAlert className="w-3 h-3" style={{ color: '#E65100' }} />, disponible: !!datosErosion },
    { key: 'swales',       flag: 'swales',       label: 'Swales',              icon: <Waves className="w-3 h-3" style={{ color: '#26A69A' }} />,        disponible: haySwales },
    { key: 'cortinas',     flag: 'cortinas',     label: 'Cortinas',            icon: <Fence className="w-3 h-3" style={{ color: '#33691E' }} />,        disponible: hayCortinas },
    { key: 'cortafuegos',  flag: 'cortafuegos',  label: 'Cortafuegos',         icon: <Flame className="w-3 h-3" style={{ color: '#BF360C' }} />,        disponible: hayCortafuegos },
    { key: 'silvopastura', flag: 'silvopastura', label: 'Silvopastura',        icon: <Trees className="w-3 h-3" style={{ color: '#558B2F' }} />,        disponible: haySilvopastura },
    { key: 'sugerencias',  flag: 'sugerencias',  label: 'Master plan',         icon: <Sparkles className="w-3 h-3" style={{ color: '#8E24AA' }} />,     disponible: masterPlanHay },
    { key: 'arcSolar',     flag: 'arcSolar',     label: 'Arco solar',          icon: <Sun className="w-3 h-3" style={{ color: '#F9A825' }} />,          disponible: !!datosArcoSolar },
    { key: 'terreno',      flag: 'terreno',      label: 'Polígono del predio', icon: <Shapes className="w-3 h-3" style={{ color: '#D9A441' }} />,       disponible: true },
  ];
  const linkablesKeys = new Set(OVERLAYS_LINKABLES.map(o => o.key));
  const {
    bloquearDrag, makeDrag, dragFila, dropEnCarpeta,
    overlayFolder, setOverlayFolder, dropCapa,
  } = useCapasDnD(onMoverElemento, linkablesKeys);
  const toggleOverlayLink  = (o: OverlayLink) => onCapas({ ...capas, [o.flag]: !capas[o.flag] });
  const desvincularOverlay = (key: string) => setOverlayFolder(prev => { const n = { ...prev }; delete n[key]; return n; });

  return (
    <div className="ay-legible w-full h-full bg-bone-50 flex flex-col overflow-hidden">
      {/* Header — el acceso a Escala/Capas vive acá (ya no flota sobre el mapa) */}
      <div className="flex items-center justify-between px-3 py-2 bg-ink-950 border-b border-ink-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-bone-300" />
          <span className="text-[10px] font-bold text-bone-100 uppercase tracking-widest">Capas</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEscala}
            title="Escala de permanencia (bitácora de diseño)"
            className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${escalaAbierta ? 'bg-moss-700 text-bone-50' : 'text-bone-300 hover:text-bone-50 hover:bg-ink-800'}`}
          >
            <ClipboardList className="w-3 h-3" />
            Escala
          </button>
          <button onClick={onCerrar} title="Cerrar capas" className="text-bone-400 hover:text-bone-100 transition-colors p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grupos */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* ── Encabezado: Análisis del mapa ──
            Los overlays de análisis (topografía, curvas, hídrico, erosión…) viven
            acá por defecto. El botón "aislar" muestra sólo el análisis y esconde
            las carpetas de trabajo. */}
        <div style={{ order: -1 }} className="px-3 pt-2 pb-1 flex items-center gap-1.5 border-b border-bone-100">
          <Mountain className="w-2.5 h-2.5 text-ink-700/40" />
          <p className="text-[8px] font-bold uppercase tracking-widest text-ink-700/45 flex-1">Análisis del mapa</p>
          <button
            onClick={onAislarAnalisis}
            title={aislado === '__analisis__' ? 'Mostrar todo de nuevo' : 'Aislar: ver sólo el análisis (esconde tus carpetas)'}
            className={`shrink-0 flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-semibold transition-colors ${aislado === '__analisis__' ? 'bg-moss-700 text-bone-50' : 'text-ink-700/40 hover:text-moss-700 hover:bg-bone-100'}`}
          >
            <Target className="w-2.5 h-2.5" />
            {aislado === '__analisis__' ? 'Aislado' : 'Aislar'}
          </button>
        </div>
        <p style={{ order: -1 }} className="px-3 pb-1 text-[8px] text-ink-700/35 italic leading-tight">
          Arrastrá un análisis (escorrentías, erosión, swales…) a una de tus carpetas para archivarlo ahí.
        </p>

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
            label={`Hipsométrico global · altitud absoluta${capas.terrariumElev ? ` (${terrariumElevMin}–${terrariumElevMax} m)` : ''}`}
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
                label={`Elevación del predio (${Math.round(datosShader.elev_min)}–${Math.round(datosShader.elev_max)} m)`}
                swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: gradienteCss(PALETAS_ELEV[paletaShader.elev].ramp) }} />}
              />
              {capas.shaderElev && (
                <>
                  <div className="mx-3 mb-1 flex items-center gap-2">
                    <span className="text-[9px] text-ink-700/60 w-16 shrink-0">Intensidad:</span>
                    <input type="range" min="0.1" max="1" step="0.05" {...bloquearDrag}
                      value={opacidadShader.elev}
                      onChange={e => onOpacidadShader({ ...opacidadShader, elev: parseFloat(e.target.value) })}
                      className="flex-1 h-1.5 accent-moss-700 cursor-pointer" />
                    <span className="text-[9px] font-mono text-ink-700/60 w-8 text-right">{Math.round(opacidadShader.elev * 100)}%</span>
                  </div>
                  <SelectorPaleta
                    paletas={PALETAS_ELEV}
                    valor={paletaShader.elev}
                    onElegir={p => onPaletaShader({ ...paletaShader, elev: p })}
                  />
                </>
              )}
              <CapaItem
                visible={capas.shaderPend}
                onToggle={() => capas.shaderPend
                  ? onCapas({ ...capas, shaderPend: false })
                  : onCapas({ ...capas, shaderPend: true, shaderElev: false })}
                label={`Pendiente (0–${Math.round(datosShader.pend_max)} %)`}
                swatch={<span className="w-5 h-2.5 rounded-sm shrink-0" style={{ background: gradienteCss(PALETAS_PEND[paletaShader.pend].ramp) }} />}
              />
              {capas.shaderPend && (
                <>
                  <div className="mx-3 mb-1 flex items-center gap-2">
                    <span className="text-[9px] text-ink-700/60 w-16 shrink-0">Intensidad:</span>
                    <input type="range" min="0.1" max="1" step="0.05" {...bloquearDrag}
                      value={opacidadShader.pend}
                      onChange={e => onOpacidadShader({ ...opacidadShader, pend: parseFloat(e.target.value) })}
                      className="flex-1 h-1.5 accent-moss-700 cursor-pointer" />
                    <span className="text-[9px] font-mono text-ink-700/60 w-8 text-right">{Math.round(opacidadShader.pend * 100)}%</span>
                  </div>
                  <SelectorPaleta
                    paletas={PALETAS_PEND}
                    valor={paletaShader.pend}
                    onElegir={p => onPaletaShader({ ...paletaShader, pend: p })}
                  />
                </>
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
                  {fuenteRelieveNombre && (
                    <p className="text-[9px] text-moss-900 leading-relaxed">
                      Fuente: <strong>{fuenteRelieveNombre}</strong>
                      {pasoRelieveM != null && <> (paso ≈ {fmtPaso(pasoRelieveM)})</>}.
                      {' '}Confiable hasta {fmtPaso(pisoIntervalo)}.
                    </p>
                  )}
                  {intervaloCurvas !== null && intervaloCurvas < pisoIntervalo && (
                    <p className="text-[9px] text-clay-700 leading-relaxed flex gap-1">
                      <TriangleAlert className="w-3 h-3 shrink-0 mt-px" />
                      <span>
                        Por debajo de {fmtPaso(pisoIntervalo)} estas curvas ya no describen el terreno
                        {!demPropio && fuenteRelieveNombre && pasoRelieveM != null
                          ? `: el relieve es ${fuenteRelieveNombre}, muestreado cada ~${fmtPaso(pasoRelieveM)}, y a esta escala lo que se dibuja es la interpolación`
                          : ''}.
                        {' '}Sirve para intuir la forma, <strong>no para replantear</strong>.
                        {demPropio ? null : <> Cargá un relevamiento propio desde <strong>Exportar → Modelo de elevación</strong>.</>}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-ink-700/60 w-14">Normal:</span>
                    <input type="color" value={colorCurvas.normal} {...bloquearDrag}
                      onChange={e => onColorCurvas({ ...colorCurvas, normal: e.target.value })}
                      className="w-6 h-5 rounded cursor-pointer border border-bone-200 p-0" title="Color curvas normales" />
                    <span className="text-[9px] text-ink-700/60 w-14">Maestra:</span>
                    <input type="color" value={colorCurvas.maestra} {...bloquearDrag}
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
              {/* Con clima + suelo + cobertura la USLE se cierra y cada clase
                  deja de ser "relativo al predio" para tener magnitud: la
                  pregunta que el índice no podía contestar era si hay que
                  actuar o si el suelo aguanta. Va como banda ×÷2 y comparada
                  contra la tolerancia, no como número puntual. */}
              {CLASES_EROSION.map(cl => {
                const r = datosErosion.resumen.find(x => x.clase === cl.clase);
                const p = r && r.pct > 0 ? perdidaErosion?.[cl.clase] : null;
                return (
                  <div key={cl.clase} className="flex items-baseline gap-2">
                    <span className="w-3 h-3 rounded-sm shrink-0 self-center" style={{ background: cl.color }} />
                    <span className="text-[10px] text-ink-700/70 flex-1 min-w-0">
                      {cl.label}
                      {p && <span className="block text-[9px] text-ink-700/45 tabular-nums leading-tight">
                        {p.min_t_ha}–{p.max_t_ha} t/ha/año{p.veces_tolerancia >= 1 ? ` · ${p.veces_tolerancia}× la tolerancia` : ''}
                      </span>}
                    </span>
                    <span className="text-[10px] text-ink-700/50 tabular-nums shrink-0">{r?.pct ?? 0}% · {r?.ha ?? 0} ha</span>
                  </div>
                );
              })}
              <p className="text-[9px] text-ink-700/40 pt-1 leading-snug">
                Pendiente × flujo acumulado (relativo al predio){datosErosion.usle_c !== null ? ' × factor C de cobertura' : ''}.
                {perdidaErosion
                  ? ` La pérdida sale de la USLE completa (R·K·LS·C) con la lluvia anual y tu suelo; tolerancia de referencia ${TOLERANCIA_T_HA} t/ha/año.`
                  : ' Orientativo — señala dónde proteger el suelo con swales y cobertura.'}
              </p>
              {/* El detalle de qué entró y qué falta (incluida la nota de
                  cobertura) vive acá: es el mismo bloque que Swales, Cuenca y
                  Represa, para que la lectura sea siempre la misma. */}
              {saludErosion && <SaludCalculo key={saludErosion.nivel} confianza={saludErosion} />}
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

        {/* ── Cortinas rompevientos ── */}
        <div {...makeDrag('cortinas')}>
        {hayCortinas && (
          <CapaGrupo
            label="Cortinas rompevientos"
            visible={capas.cortinas}
            onToggleVisible={() => onCapas({ ...capas, cortinas: !capas.cortinas })}
            expanded={exp.cortinas} onExpand={() => tog('cortinas')}
          >
            <CapaItem visible={capas.cortinas}
              onToggle={() => onCapas({ ...capas, cortinas: !capas.cortinas })}
              label="Franja + zona protegida"
              swatch={<span className="w-4 h-3 rounded-sm shrink-0" style={{ background: '#2E7D32', opacity: 0.7 }} />}
            />
          </CapaGrupo>
        )}
        </div>{/* /cortinas */}

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

        {/* ── Silvopastura ── */}
        <div {...makeDrag('silvopastura')}>
        {haySilvopastura && (
          <CapaGrupo
            label="Silvopastura"
            visible={capas.silvopastura}
            onToggleVisible={() => onCapas({ ...capas, silvopastura: !capas.silvopastura })}
            expanded={exp.silvopastura} onExpand={() => tog('silvopastura')}
          >
            <CapaItem visible={capas.silvopastura}
              onToggle={() => onCapas({ ...capas, silvopastura: !capas.silvopastura })}
              label="Hileras de árboles"
              swatch={<span className="text-sm leading-none">🌳</span>}
            />
          </CapaGrupo>
        )}
        </div>{/* /silvopastura */}

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

        {/* ── Tus capas: carpetas de la Escala con TODO lo archivado ──
            Cada herramienta deja su salida en la carpeta que le toca (auto-archivado
            por tipo); podés reubicar cualquier capa arrastrándola a otra carpeta o
            con el desplegable. Doble clic en una capa = centrar en el mapa. */}
        <div {...makeDrag('dibujos')}>
        <div className="px-3 pt-2 pb-1 flex items-center gap-1.5">
          <Layers className="w-2.5 h-2.5 text-ink-700/40" />
          <p className="text-[8px] font-bold uppercase tracking-widest text-ink-700/45">Tus capas</p>
        </div>
        {capasOrdenadas.map((capa, idx, arr) => {
          type Fila = { id: string; tipo: TipoElementoCapa; label: string; swatch: React.ReactNode; onRen: (n: string) => void; onDel: () => void; pt: { lat: number; lng: number } | null };
          const filas: Fila[] = [];
          // Dibujos
          dibujos.filter(d => folderEf(d.capaId, 'dibujo') === capa.id).forEach((d, i) => {
            const label = d.nombre || (
              d.tipo === 'linea'    ? `Línea ${i + 1}` :
              d.tipo === 'poligono' ? `Polígono ${i + 1}` :
              d.tipo === 'circulo'  ? `Círculo ${i + 1}` :
              d.tipo === 'curva'    ? `Curva ${i + 1}` :
              d.tipo === 'cota'     ? `Cota ${i + 1}` :
              d.tipo === 'texto'    ? `"${d.texto.slice(0, 12)}"` :
              `Dibujo ${i + 1}`);
            const swatch = d.tipo === 'linea' || d.tipo === 'curva' || d.tipo === 'cota'
              ? <span className="w-5 h-0 border-t-2 shrink-0" style={{ borderColor: d.color }} />
              : d.tipo === 'texto'
              ? <span className="text-[11px] font-bold leading-none px-0.5" style={{ color: d.color }}>T</span>
              : <span className="w-3 h-3 rounded-sm shrink-0 border" style={{ background: d.color + '44', borderColor: d.color }} />;
            const pt = ('lat' in d && d.lat != null) ? { lat: d.lat, lng: d.lng }
              : ('vertices' in d && d.vertices[0]) ? d.vertices[0] : null;
            filas.push({ id: d.id, tipo: 'dibujo', label, swatch, onRen: n => onRenombrarDibujo(d.id, n), onDel: () => onEliminarDibujo(d.id), pt });
          });
          // Caminos (manuales)
          caminosManuales.filter(c => folderEf(c.capaId, 'camino') === capa.id).forEach(c => {
            filas.push({ id: c.id, tipo: 'camino', label: c.nombre, swatch: <span className="w-5 h-0 border-t-2 shrink-0" style={{ borderColor: c.color }} />, onRen: n => onRenombrarCamino(c.id, n), onDel: () => onEliminarCamino(c.id), pt: c.vertices[0] ?? null });
          });
          // Aguadas / represas / swales
          aguadasLayer.filter(a => folderEf(a.capaId, 'aguada') === capa.id).forEach(a => {
            const swatch = a.tipo === 'represa'
              ? <span className="text-sm leading-none">🏊</span>
              : <span className="w-5 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: a.tipo === 'swale' ? '#26A69A' : '#66BB6A' }} />;
            const pt = (a.lat != null && a.lng != null) ? { lat: a.lat, lng: a.lng } : (a.vertices?.[0] ?? null);
            filas.push({ id: a.id, tipo: 'aguada', label: a.nombre, swatch, onRen: n => onRenombrarAguada(a.id, n), onDel: () => onEliminarAguada(a.id), pt });
          });
          // Cuencas archivadas: cada una es una capa con su ficha, no sólo un
          // contorno. El label lleva el área para poder distinguirlas de un vistazo.
          cuencasGuardadas.filter(g => folderEf(g.capaId, 'cuenca') === capa.id).forEach(g => {
            filas.push({
              id: g.id, tipo: 'cuenca',
              label: `${g.nombre} · ${g.cuenca.area_ha} ha`,
              swatch: <span className="w-3 h-3 rounded-sm shrink-0 border" style={{ background: `${g.color}44`, borderColor: g.color }} />,
              onRen: n => onRenombrarCuenca(g.id, n),
              onDel: () => onEliminarCuenca(g.id),
              pt: g.cuenca.outlet,
            });
          });
          // Zonas
          zonas.filter(z => folderEf(z.capaId, 'zona') === capa.id).forEach(z => {
            filas.push({ id: z.id, tipo: 'zona', label: z.nombre, swatch: <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: z.color ?? CATEGORIAS_ZONA[z.categoria].color }} />, onRen: n => onRenombrarZona(z.id, n), onDel: () => onEliminarZona(z.id), pt: z.vertices[0] ?? null });
          });
          // Sectores
          sectores.filter(s => folderEf(s.capaId, 'sector') === capa.id).forEach(s => {
            filas.push({ id: s.id, tipo: 'sector', label: s.nombre, swatch: <span className="w-3 h-3 rounded-sm shrink-0 border border-dashed" style={{ borderColor: s.color ?? TIPOS_SECTOR[s.tipo].color, background: `${s.color ?? TIPOS_SECTOR[s.tipo].color}22` }} />, onRen: n => onRenombrarSector(s.id, n), onDel: () => onEliminarSector(s.id), pt: s.vertices[0] ?? null });
          });
          // Pines (manuales)
          pinesManuales.filter(p => folderEf(p.capaId, 'pin') === capa.id).forEach(p => {
            filas.push({ id: p.id, tipo: 'pin', label: p.nombre, swatch: <span className="text-sm leading-none">{p.icono}</span>, onRen: n => onRenombrarPin(p.id, n), onDel: () => onEliminarPin(p.id), pt: { lat: p.lat, lng: p.lng } });
          });
          // Overlays de análisis vinculados a esta carpeta
          const overlaysDeCarpeta = OVERLAYS_LINKABLES.filter(o => overlayFolder[o.key] === capa.id);

          return (
            <div key={capa.id} {...dropEnCarpeta(capa.id)} className={dropCapa === capa.id ? 'ring-2 ring-inset ring-moss-500/60 bg-moss-500/5' : ''}>
              <CapaUsuarioGrupo
                capa={capa}
                count={filas.length + overlaysDeCarpeta.length}
                visible={!capasOcultas.has(capa.id)}
                activa={capaActivaId === capa.id}
                esDefault={capa.id === CAPA_DEFAULT_ID}
                aislada={aislado === capa.id}
                onAislar={() => onAislarCarpeta(capa.id)}
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
                {filas.map(fila => (
                  <div key={fila.id} {...dragFila(fila.tipo, fila.id)}
                    onDoubleClick={() => { if (fila.pt) onFlyTo(fila.pt.lat, fila.pt.lng); }}
                    title="Doble clic: centrar en el mapa · arrastrar: mover de carpeta"
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <CapaItem
                      visible={!ocultosIds.has(fila.id) && !capasOcultas.has(capa.id) && masterVisible[fila.tipo]}
                      onToggle={() => onToggle(fila.id)}
                      label={fila.label}
                      swatch={fila.swatch}
                      onRenombrar={fila.onRen}
                      onEliminar={fila.onDel}
                      extraSiempre={
                        <select
                          value={capa.id}
                          onChange={e => onMoverElemento(fila.tipo, fila.id, e.target.value)}
                          title="Mover a otra carpeta"
                          className="shrink-0 text-[8px] bg-bone-50 border border-bone-200 rounded px-0.5 py-0 max-w-[56px] text-ink-700/70 focus:outline-none cursor-pointer"
                          onClick={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          {capasOrdenadas.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      }
                    />
                  </div>
                ))}
                {/* Overlays de análisis archivados en esta carpeta (acceso; los
                    controles finos siguen en "Análisis del mapa") */}
                {overlaysDeCarpeta.map(o => (
                  <div key={`ov-${o.key}`} className="flex items-center gap-2 pl-7 pr-2 py-1 hover:bg-bone-100">
                    <button
                      onClick={() => o.disponible && toggleOverlayLink(o)}
                      disabled={!o.disponible}
                      title={o.disponible ? (capas[o.flag] ? 'Ocultar' : 'Mostrar') : 'Calculá esta capa primero'}
                      className={`shrink-0 transition-colors disabled:opacity-30 ${capas[o.flag] ? 'text-moss-700' : 'text-ink-700/25'}`}
                    >
                      {capas[o.flag] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <span className="shrink-0">{o.icon}</span>
                    <span className="flex-1 text-[10px] text-ink-800 truncate min-w-0">
                      {o.label}<span className="text-ink-700/30"> · análisis</span>
                    </span>
                    <select
                      value={capa.id}
                      onChange={e => e.target.value === '__analisis__' ? desvincularOverlay(o.key) : setOverlayFolder(prev => ({ ...prev, [o.key]: e.target.value }))}
                      title="Mover a otra carpeta o devolver al análisis"
                      className="shrink-0 text-[8px] bg-bone-50 border border-bone-200 rounded px-0.5 py-0 max-w-[56px] text-ink-700/70 focus:outline-none cursor-pointer"
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <option value="__analisis__">Análisis</option>
                      {capasOrdenadas.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <button onClick={() => desvincularOverlay(o.key)} title="Sacar de la carpeta (vuelve al análisis)" className="shrink-0 text-ink-700/20 hover:text-clay-500 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {filas.length === 0 && overlaysDeCarpeta.length === 0 && (
                  <p className="pl-7 pr-3 py-1 text-[9px] text-ink-700/30 italic">Carpeta vacía · soltá una capa o un análisis acá</p>
                )}
              </CapaUsuarioGrupo>
            </div>
          );
        })}

        {/* ── Nueva capa + plantilla ── */}
        <div className="px-2 py-1.5 border-b border-bone-100 space-y-1">
          <button
            onClick={onCrearCapa}
            className="w-full flex items-center justify-center gap-1 py-1 rounded text-[9px] text-moss-700 hover:bg-bone-100 transition-colors border border-dashed border-bone-200 font-semibold"
          >
            + Nueva carpeta
          </button>
          {!escalaCompleta && (
            <button
              onClick={onCargarPlantillaKeyline}
              title="Crea las 8 carpetas en orden de permanencia: Clima, Geografía, Agua, Accesos, Sistemas, Estructuras, Subdivisiones, Suelo"
              className="w-full flex items-center justify-center gap-1 py-1 rounded text-[9px] text-water-700 hover:bg-water-500/5 transition-colors border border-dashed border-water-500/30 font-semibold"
            >
              + Restaurar carpetas de la Escala
            </button>
          )}
        </div>
        </div>{/* /dibujos */}

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
    </div>
  );
}


// ─── Filas del panel de capas ───────────────────────────────────────────────
function CapaGrupo({ label, count, visible, onToggleVisible, expanded, onExpand, children }: {
  label: string; count?: number; visible: boolean;
  onToggleVisible: () => void; expanded: boolean; onExpand: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-bone-100">
      <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-bone-100 select-none">
        <button
          onClick={e => { e.stopPropagation(); onToggleVisible(); }}
          className={`shrink-0 transition-colors ${visible ? 'text-moss-700' : 'text-ink-700/45'}`}
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
        <span title="Arrastrar para reordenar" className="shrink-0 cursor-grab"><GripVertical className="w-3 h-3 text-ink-700/35" /></span>
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
    <div className="flex items-center gap-1.5 pl-6 pr-3 py-1 hover:bg-bone-100 group">
      <button onClick={onToggle} className={`shrink-0 transition-colors ${visible ? 'text-moss-600' : 'text-ink-700/45'}`}>
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
          className={`flex-1 text-[10px] truncate leading-tight min-w-0 ${visible ? 'text-ink-800' : 'text-ink-700/60'}`}
          onDoubleClick={() => onRenombrar && setEditando(true)}
          title={onRenombrar ? 'Doble clic para renombrar' : undefined}
        >{label}</span>
      )}
      {extraSiempre && !editando && <span className="shrink-0">{extraSiempre}</span>}
      {extra && !editando && <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{extra}</span>}
      {onEliminar && !editando && (
        <button onClick={onEliminar} className="shrink-0 text-ink-700/35 hover:text-clay-500 transition-colors">
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

// ─── Grupo de capa de usuario (dibujos) ──────────────────────────────────────

function CapaUsuarioGrupo({ capa, count, visible, activa, esDefault, aislada, onAislar, puedeSubir, puedeBajar, onSubir, onBajar, onColor, onToggleVisible, onActivar, onRenombrar, onEliminar, children }: {
  capa: CapaUsuario; count: number; visible: boolean; activa: boolean; esDefault: boolean;
  aislada: boolean; onAislar: () => void;
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
      <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-bone-100 select-none">
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
            {/* Aislar (solo): ver sólo esta carpeta */}
            <button
              onClick={e => { e.stopPropagation(); onAislar(); }}
              title={aislada ? 'Mostrar todas las carpetas' : 'Aislar: ver sólo esta carpeta'}
              className={`shrink-0 transition-colors ${aislada ? 'text-moss-700' : 'text-ink-700/25 hover:text-moss-700'}`}
            >
              <Target className="w-2.5 h-2.5" />
            </button>
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

