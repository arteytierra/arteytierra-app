'use client';

/**
 * La barra superior de /mapa: marca, nombre del proyecto, herramientas de
 * dibujo, guardado, captura, deshacer/rehacer y navegación del mapa.
 *
 * Primer corte real del JSX de `MapaTerrenoApp`, que venía siendo un solo
 * `return` de unos 1.450 renglones. El corte anterior se había atascado por lo
 * mismo que atasca a todos: el bloque cierra sobre decenas de identificadores
 * del contenedor, y sacarlo tal cual convierte el problema en una firma de
 * treinta y ocho props sueltas. Eso no es partir nada; es mudar el desorden.
 *
 * Así que la firma está agrupada por concepto, no por variable. Son siete
 * props y cada una nombra una cosa que la barra hace. Dos de ellas —`dibujo` y
 * `nav`— se pasan enteras a los componentes que ya existían con esa forma: la
 * barra no reescribe sus contratos, los reenvía, y así el bloque más grande de
 * los dos no aporta una sola prop nueva.
 */

import type { ComponentProps, ReactNode } from 'react';
import { ChevronRight, Camera, Image as ImageIcon, Undo2, Redo2 } from 'lucide-react';
import { DibujoToolbar } from './DibujoToolbar';
import { ControlesNavegacion } from './ControlesMapa';

/** Cómo se muestra el estado de guardado en la nube: texto, ícono y color. */
export interface EstadoGuardado {
  label:  string;
  titulo: string;
  icono:  ReactNode;
  clase:  string;
}

interface Props {
  panelAbierto:   boolean;
  onTogglePanel:  () => void;
  /** Nombre del proyecto abierto; null cuando todavía no se guardó ninguno. */
  nombreProyecto: string | null;

  /** Se reenvía tal cual a `DibujoToolbar`, que ya define esta forma. */
  dibujo: Omit<ComponentProps<typeof DibujoToolbar>, 'inHeader'>;
  /** Ídem con `ControlesNavegacion`. */
  nav:    ComponentProps<typeof ControlesNavegacion>;

  guardado: {
    estado:     EstadoGuardado;
    guardando:  boolean;
    onGuardar:  () => void;
  };
  captura: {
    onEditor:     () => void;
    onPng:        () => void;
    guardandoPng: boolean;
  };
  historial: {
    onUndo:     () => void;
    onRedo:     () => void;
    puedeUndo:  boolean;
    puedeRedo:  boolean;
  };
}

export function BarraSuperior({
  panelAbierto, onTogglePanel, nombreProyecto,
  dibujo, nav, guardado, captura, historial,
}: Props) {
  return (
    <header className="relative flex items-center h-12 px-3 border-b border-bone-200 bg-white shrink-0 z-[1200]">
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <button onClick={onTogglePanel} title="Mostrar/ocultar panel" className="p-1 text-ink-700/50 hover:text-moss-700 transition-colors">
          <ChevronRight className={`w-4 h-4 transition-transform ${panelAbierto ? 'rotate-180' : ''}`} />
        </button>
        {/* El lockup de la marca, no el isotipo solo: acá adentro la app se
            llama acequia y el que firma no viene al caso. Es un PNG y no el
            componente inline porque el wordmark de la marca está en Century
            Gothic, que no está en la mayoría de las máquinas —ver
            public/marca/LEEME.md—; la clase `marca-ui` repone la inversión
            del tema oscuro, que globals.css cancela para todas las <img>.
            Al lado, lo único que cambia entre un proyecto y otro: su nombre. */}
        <img
          src="/marca/firma-negro-ui.png" alt="acequia" width={628} height={159}
          className="marca-ui h-[22px] w-auto shrink-0"
        />
        <span className="w-px h-4 bg-bone-200 shrink-0 hidden lg:block" aria-hidden />
        <p className="text-sm font-medium text-ink-950 truncate max-w-[14rem] font-display hidden lg:block">
          {nombreProyecto || 'Proyecto sin guardar'}
        </p>
      </div>

      {/* ── Herramientas de dibujo, en columna central elástica ──
          (antes iban en `absolute left-1/2`, fuera del flujo, y su extremo
          derecho pisaba el chip "Sin guardar" y el botón Guardar). */}
      <div className="flex-1 flex items-center justify-center min-w-0 h-full px-2">
        <DibujoToolbar inHeader {...dibujo} />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Estado de guardado en la nube (clic = guardar). El resto de "Archivo"
            —guardar como, importar, exportar— vive en el pie del riel. */}
        <button
          onClick={guardado.onGuardar}
          disabled={guardado.guardando}
          title={guardado.estado.titulo}
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${guardado.estado.clase}`}
        >
          {guardado.estado.icono}
          <span className="hidden lg:inline">{guardado.estado.label}</span>
        </button>
        {/* Captura del plano: abrir el editor de plano o guardar PNG directo. */}
        <div className="flex items-stretch rounded-lg border border-bone-200 overflow-hidden">
          <button onClick={captura.onEditor} title="Capturar mapa — editor de plano (rótulo + leyenda)" className="h-8 px-2 flex items-center gap-1 text-ink-700/55 hover:text-moss-700 hover:bg-bone-50 transition-colors border-r border-bone-200"><Camera className="w-4 h-4" /><span className="hidden xl:inline text-[11px] font-medium">Capturar</span></button>
          <button onClick={captura.onPng} disabled={captura.guardandoPng} title="Guardar PNG del mapa" className="h-8 px-2 flex items-center gap-1 text-ink-700/55 hover:text-moss-700 hover:bg-bone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {captura.guardandoPng ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-4 h-4" />}<span className="hidden xl:inline text-[11px] font-medium">PNG</span>
          </button>
        </div>
        {/* Deshacer / rehacer agrupados. */}
        <div className="flex items-stretch rounded-lg border border-bone-200 overflow-hidden">
          <button onClick={historial.onUndo} disabled={!historial.puedeUndo} title="Deshacer (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center text-ink-700/50 hover:text-moss-700 hover:bg-bone-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors border-r border-bone-200"><Undo2 className="w-4 h-4" /></button>
          <button onClick={historial.onRedo} disabled={!historial.puedeRedo} title="Rehacer (Ctrl+Shift+Z)" className="w-8 h-8 flex items-center justify-center text-ink-700/50 hover:text-moss-700 hover:bg-bone-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><Redo2 className="w-4 h-4" /></button>
        </div>
        {/* Navegación del mapa: 3D · zoom · brújula · satélite/topo · histórico. */}
        <ControlesNavegacion {...nav} />
      </div>
    </header>
  );
}
