'use client';

import { useState, useEffect } from 'react';
import { MapPin, Cloud, FolderOpen, Mountain, Droplets, CalendarDays, Layers, Sun, LayoutGrid, Compass, Waves, Route, Eye, Wheat, Leaf, ChevronDown, Waypoints, Boxes, Spline, Sprout, Trees, Bird, SunDim, DollarSign, Wind, Lock, Ruler, Flame, Fence, CloudRain, Shapes, Target, Container, Sparkles, TreeDeciduous, ClipboardList } from 'lucide-react';
import { type SeccionRepresa } from '../CutFillPanel';

/**
 * El riel de navegación de /mapa: qué pestañas existen, cómo se agrupan y cómo
 * se dibujan.
 *
 * Vivía adentro de MapaTerrenoApp, que ya pasaba las 5.600 líneas. Nada de esto
 * toca el estado de la app —son definiciones y dos componentes de dibujo—, así
 * que se lee y se cambia sin abrir el archivo grande.
 */

// ─── Pestañas ───────────────────────────────────────────────────────────────
export type Tab =
  | 'mojones' | 'clima'  | 'contexto' | 'entorno' | 'topo'    | 'suelo'   | 'cobertura'
  | 'agua'    | 'cal'    | 'solar'   | 'sombras' | 'visibilidad' | 'prod'   | 'aptitud' | 'analisis'
  | 'zonas'   | 'sectores' | 'aguadas' | 'caminos' | 'red' | 'cuenca' | 'pastoreo' | 'riego' | 'swales' | 'keyline'
  | 'infra'   | 'elementos' | 'carbono' | 'economia' | 'proyectos' | 'masterplan' | 'cortinas' | 'cortafuegos' | 'silvopastura';

// ─── Riel de navegación: definición de tabs y clústeres ─────────────────────
/** Definición visual de cada tab. El `id` es la clave estable que usan
 *  entitlements, snapshots y la paleta (Ctrl+K): NO cambia aunque se reagrupe
 *  el riel o se renombre el label visible. */
export const TAB_DEFS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
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
  { id: 'red',         label: 'Red de servicios', icon: <Spline       className="w-3.5 h-3.5" /> },
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
  { id: 'cortinas',    label: 'Cortinas',    icon: <Fence        className="w-3.5 h-3.5" /> },
  { id: 'cortafuegos', label: 'Cortafuegos', icon: <Flame        className="w-3.5 h-3.5" /> },
  { id: 'infra',       label: 'Infraestructuras', icon: <Boxes   className="w-3.5 h-3.5" /> },
  { id: 'elementos',   label: 'Elementos',   icon: <TreeDeciduous className="w-3.5 h-3.5" /> },
  { id: 'pastoreo',    label: 'Pastoreo',    icon: <span className="text-[13px] leading-none grayscale opacity-70">🐄</span> },
  { id: 'silvopastura', label: 'Silvopastura', icon: <Trees      className="w-3.5 h-3.5" /> },
  { id: 'keyline',     label: 'Keyline',     icon: <Waypoints    className="w-3.5 h-3.5" /> },
  { id: 'prod',        label: 'Producción',  icon: <Wheat        className="w-3.5 h-3.5" /> },
  { id: 'economia',    label: 'Economía',    icon: <DollarSign   className="w-3.5 h-3.5" /> },
  { id: 'proyectos',   label: 'Proyectos',   icon: <FolderOpen   className="w-3.5 h-3.5" /> },
];
export const TAB_DEF = new globalThis.Map(TAB_DEFS.map(t => [t.id, t] as const));

/** Clústeres del riel, ordenados según la **Escala de Permanencia** de P.A.
 *  Yeomans: de lo más permanente y difícil de cambiar (clima, relieve) a lo más
 *  cambiante (producción). El número que abre cada label ES el peldaño de la
 *  escala. `mojones` es la entrada; `proyectos` vive en el header y `economia`
 *  (Entrega) cierra abajo hasta que la barra superior la aloje.
 *  `esenciales` = las herramientas que se muestran al abrir el grupo; el resto
 *  queda detrás de "Más…" (revelación progresiva). Los `id` de las tabs NO
 *  cambian: entitlements, snapshots y la paleta (Ctrl+K) siguen intactos. */
export const GRUPOS_RIEL: Array<{ id: string; label: string; corto: string; icon: React.ReactNode; tabs: Tab[]; esenciales?: Tab[] }> = [
  { id: 'ubicacion', label: 'Tu terreno',                            corto: 'Lugar',     icon: <MapPin    className="w-4 h-4" />, tabs: ['mojones'] },
  { id: 'clima',     label: '1 · Clima y contexto',                  corto: '1 Clima',   icon: <CloudRain className="w-4 h-4" />, tabs: ['clima', 'contexto', 'entorno', 'cal', 'solar', 'sombras'],           esenciales: ['clima', 'contexto'] },
  { id: 'relieve',   label: '2 · Relieve y suelo',                   corto: '2 Relieve', icon: <Mountain  className="w-4 h-4" />, tabs: ['topo', 'analisis', 'suelo', 'cobertura', 'aptitud', 'visibilidad'], esenciales: ['topo', 'analisis'] },
  { id: 'agua',      label: '3 · Agua',                              corto: '3 Agua',    icon: <Droplets  className="w-4 h-4" />, tabs: ['cuenca', 'aguadas', 'caminos', 'keyline', 'swales', 'red', 'riego', 'agua'], esenciales: ['cuenca', 'aguadas'] },
  { id: 'zonas',     label: '4 · Zonas, sectores e infraestructuras', corto: '4 Zonas',  icon: <Shapes    className="w-4 h-4" />, tabs: ['masterplan', 'zonas', 'sectores', 'elementos', 'infra'],             esenciales: ['masterplan', 'zonas'] },
  { id: 'prod',      label: '5 · Sistemas productivos',              corto: '5 Prod.',   icon: <Wheat     className="w-4 h-4" />, tabs: ['pastoreo', 'prod', 'silvopastura', 'cortinas', 'cortafuegos', 'carbono'], esenciales: ['pastoreo', 'prod'] },
];
// `economia` (Entrega) y `proyectos` no están en el riel: se alcanzan desde la
// barra superior. El riel es, exactamente, la Escala de Permanencia.
export const GRUPO_DE_TAB: Record<string, string> = Object.fromEntries(
  GRUPOS_RIEL.flatMap(g => g.tabs.map(t => [t, g.id] as const)),
);


/**
 * Sub-pestañas del panel de represas. Es el panel más largo de la app: sitios
 * sugeridos, tres pasos de embalse, muro, cuenca de aporte, balance mensual y
 * notas de método, todo apilado. Partirlo en cuatro no cambia ningún cálculo,
 * sólo el orden en que se muestran — y ese orden es el del trabajo real:
 * primero dónde, después cuánto, después si aguanta el año, y al final de dónde
 * salen los números.
 */
export type SubRepresa = 'sugerencias' | SeccionRepresa;

export const SUBS_REPRESA: Array<{ id: SubRepresa; label: string }> = [
  { id: 'sugerencias',    label: 'Sugerencias' },
  { id: 'embalse',        label: 'Embalse' },
  { id: 'simulacion',     label: 'Año' },
  { id: 'observaciones',  label: 'Notas' },
];

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
export function RielAcordeon({ grupo, abierto, tabActivo, onToggle, onElegir, bloqueada }: {
  grupo: { id: string; label: string; corto: string; icon: React.ReactNode; tabs: Tab[]; esenciales?: Tab[] };
  abierto: boolean;
  tabActivo: Tab;
  onToggle: () => void;
  onElegir: (id: Tab) => void;
  bloqueada: (id: Tab) => boolean;
}) {
  const contieneActivo = grupo.tabs.includes(tabActivo);

  // Revelación progresiva: al abrir mostramos sólo las `esenciales`; el resto
  // queda detrás de "Más…". Si el tab activo cae en el resto, lo revelamos para
  // que quede visible. Al cerrar el grupo, el "Más" vuelve a plegarse.
  const esenciales = grupo.esenciales ?? grupo.tabs;
  const resto = grupo.tabs.filter(t => !esenciales.includes(t));
  const [masAbierto, setMasAbierto] = useState(false);
  useEffect(() => { if (!abierto) setMasAbierto(false); }, [abierto]);
  const activoEnResto = resto.includes(tabActivo);
  const mostrarResto = masAbierto || activoEnResto;

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
        <div className="w-full flex flex-col items-center gap-0.5 pb-1.5 pt-1 ay-stagger">
          {(mostrarResto ? [...esenciales, ...resto] : esenciales).map(id => {
            const def = TAB_DEF.get(id);
            if (!def) return null;
            return (
              <RielTab key={id} def={def} activo={tabActivo === id} lock={bloqueada(id)} onElegir={onElegir} />
            );
          })}
          {resto.length > 0 && !activoEnResto && (
            <button
              onClick={() => setMasAbierto(v => !v)}
              title={mostrarResto ? 'Mostrar menos' : `Más herramientas (${resto.length})`}
              aria-expanded={mostrarResto}
              className="w-10 rounded-lg flex flex-col items-center gap-0.5 py-0.5 text-ink-700/50 hover:text-ink-900 hover:bg-bone-200/60 transition-colors">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mostrarResto ? 'rotate-180' : ''}`} />
              <span className="text-[7px] font-semibold uppercase tracking-tight leading-none">
                {mostrarResto ? 'Menos' : 'Más'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

