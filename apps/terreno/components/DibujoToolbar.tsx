'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MousePointer2, Minus, Hexagon, Circle, Activity, Type, Check, X, Trash2, Ruler,
  SquareDashed, Scaling, RotateCw, FlipHorizontal2, FlipVertical2, Grid2x2, Spline,
  SlidersHorizontal, ChevronUp, ChevronDown,
  Square, ArrowUpRight, Target, PenLine, Crosshair,
} from 'lucide-react';
import type { TipoDibujo, DibujoEnCurso, MedidaDibujo } from '@/lib/dibujos';
import { COLORES_DIBUJO } from '@/lib/dibujos';
import type { CapaUsuario } from '@/lib/capasUsuario';
import type { TransformarOp } from '@/lib/transformaciones';

type Modo = TipoDibujo | 'seleccion' | 'medir' | 'rectangulo' | 'mano_libre' | 'radio_accion' | null;

interface Props {
  modoDibujo:           Modo;
  colorActivo:          string;
  enCurso:              DibujoEnCurso | null;
  seleccionado:         string | null;
  colorSeleccionado?:   string;
  nombreSeleccionado?:  string;
  notasSeleccionado?:   string;
  medidasSeleccionado?: MedidaDibujo[];
  capasUsuario?:        CapaUsuario[];
  capaSeleccionado?:    string;
  onMoverACapa?:        (capaId: string) => void;
  onTransformar?:       (op: TransformarOp) => void;
  onCambiarColor?:      (color: string) => void;
  onMoverAdelante?:     () => void;
  onMoverAtras?:        () => void;
  onModo:               (modo: Modo) => void;
  onColor:              (color: string) => void;
  onFinalizar:          () => void;
  onCancelar:           () => void;
  onEliminar:           () => void;
  onRenombrar?:         (nombre: string, notas: string) => void;
  inHeader?:            boolean;
}

const HERRAMIENTAS: Array<{ modo: Modo; icon: React.ReactNode; title: string }> = [
  { modo: 'seleccion',   icon: <MousePointer2 className="w-4 h-4" />, title: 'Seleccionar / borrar' },
  { modo: 'linea',       icon: <Minus         className="w-4 h-4" />, title: 'Línea' },
  { modo: 'rectangulo',  icon: <Square        className="w-4 h-4" />, title: 'Rectángulo (2 esquinas)' },
  { modo: 'poligono',    icon: <Hexagon       className="w-4 h-4" />, title: 'Polígono libre' },
  { modo: 'flecha',      icon: <ArrowUpRight  className="w-4 h-4" />, title: 'Flecha' },
  { modo: 'circulo',     icon: <Circle        className="w-4 h-4" />, title: 'Círculo' },
  { modo: 'radio_accion',icon: <Crosshair     className="w-4 h-4" />, title: 'Radio de acción' },
  { modo: 'curva',       icon: <Activity      className="w-4 h-4" />, title: 'Curva suave' },
  { modo: 'mano_libre',  icon: <PenLine       className="w-4 h-4" />, title: 'Mano libre (polilínea orgánica)' },
  { modo: 'punto',       icon: <Target        className="w-4 h-4" />, title: 'Punto / marcador' },
  { modo: 'cota',        icon: <Ruler         className="w-4 h-4" />, title: 'Cota (acotar distancia)' },
  { modo: 'medir',       icon: <SquareDashed  className="w-4 h-4" />, title: 'Medir distancia y área (no crea objeto)' },
  { modo: 'texto',       icon: <Type          className="w-4 h-4" />, title: 'Texto' },
];

export function DibujoToolbar({
  modoDibujo, colorActivo, enCurso, seleccionado,
  colorSeleccionado, nombreSeleccionado, notasSeleccionado, medidasSeleccionado,
  capasUsuario, capaSeleccionado, onMoverACapa, onTransformar,
  onCambiarColor, onMoverAdelante, onMoverAtras,
  onModo, onColor, onFinalizar, onCancelar, onEliminar, onRenombrar,
  inHeader,
}: Props) {
  const dibujando  = enCurso !== null;
  const editando   = modoDibujo === 'seleccion' && !!seleccionado && !dibujando;
  const [panelOpen,       setPanelOpen]       = useState(false);
  const [colapsada,       setColapsada]       = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (seleccionado) setPanelOpen(true); }, [seleccionado]);

  useEffect(() => {
    if (!colorPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node))
        setColorPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [colorPickerOpen]);

  const minVerts = enCurso
    ? (modoDibujo === 'circulo' || modoDibujo === 'radio_accion' || modoDibujo === 'cota' || modoDibujo === 'flecha' || modoDibujo === 'rectangulo' ? 1
       : modoDibujo === 'texto' || modoDibujo === 'punto' ? 0
       : 2)
    : 0;
  const puedeF = !!(enCurso && (
    (modoDibujo === 'linea'      && enCurso.vertices.length >= 2) ||
    (modoDibujo === 'poligono'   && enCurso.vertices.length >= 3) ||
    (modoDibujo === 'curva'      && enCurso.vertices.length >= 2) ||
    (modoDibujo === 'mano_libre' && enCurso.vertices.length >= 2)
  ));

  const hintText = (() => {
    if (!enCurso) return '';
    const n = enCurso.vertices.length;
    if (modoDibujo === 'circulo' || modoDibujo === 'radio_accion')
      return n === 0 ? 'Clic: centro' : 'Clic: radio';
    if (modoDibujo === 'cota')
      return n === 0 ? 'Clic: inicio' : 'Clic: fin';
    if (modoDibujo === 'rectangulo')
      return n === 0 ? 'Clic: esquina 1' : 'Clic: esquina opuesta';
    if (modoDibujo === 'flecha')
      return n === 0 ? 'Clic: inicio' : 'Clic: punta';
    if (modoDibujo === 'punto')
      return 'Clic: colocar punto';
    return `${n} pts${minVerts > 0 ? ` / mín ${minVerts}` : ''}`;
  })();

  // ── Panel de propiedades (shared content) ──────────────────────────────────
  const propPanel = (
    <div className={`bg-white/97 backdrop-blur-sm rounded-xl shadow-raised border border-bone-200 p-2 space-y-2 min-w-[160px] ${inHeader ? 'fixed top-12 left-1/2 -translate-x-1/2 z-[1300] max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden' : 'max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-ink-700 uppercase tracking-wide">
          {editando ? 'Elemento' : 'Transformar'}
        </span>
        <button onClick={() => setPanelOpen(false)} className="text-ink-700/30 hover:text-ink-700 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>

      {!editando && (
        <p className="text-[9px] text-ink-700/50 leading-relaxed px-0.5">
          Seleccioná un dibujo en el mapa para rotar, escalar, desfasar y más.
        </p>
      )}

      {editando && medidasSeleccionado && medidasSeleccionado.length > 0 && (
        <div className="space-y-0.5">
          {medidasSeleccionado.map(m => (
            <div key={m.label} className="flex items-center justify-between gap-1">
              <span className="text-[8px] text-ink-700/50 uppercase">{m.label}</span>
              <span className="text-[10px] font-mono font-bold text-ink-900">{m.valor}</span>
            </div>
          ))}
        </div>
      )}

      {/* Color del elemento seleccionado */}
      {editando && onCambiarColor && (
        <div className="border-t border-bone-200 pt-1.5">
          <label className="block text-[8px] text-ink-700/50 uppercase mb-1">Color del elemento</label>
          <div className="grid grid-cols-8 gap-1">
            {COLORES_DIBUJO.map(c => (
              <button
                key={c}
                onClick={() => onCambiarColor(c)}
                className={`w-5 h-5 rounded border transition-transform hover:scale-110 ${colorSeleccionado === c ? 'border-ink-900 ring-1 ring-ink-900' : 'border-bone-300'}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Orden de capas (adelante / atrás) */}
      {editando && (onMoverAdelante || onMoverAtras) && (
        <div className="border-t border-bone-200 pt-1.5">
          <label className="block text-[8px] text-ink-700/50 uppercase mb-1">Orden</label>
          <div className="flex items-center gap-1">
            {onMoverAtras && (
              <button onClick={onMoverAtras} title="Mover atrás"
                className="flex-1 text-[9px] py-0.5 rounded bg-bone-100 hover:bg-bone-200 text-ink-700 transition-colors">
                ← Atrás
              </button>
            )}
            {onMoverAdelante && (
              <button onClick={onMoverAdelante} title="Mover adelante"
                className="flex-1 text-[9px] py-0.5 rounded bg-bone-100 hover:bg-bone-200 text-ink-700 transition-colors">
                Adelante →
              </button>
            )}
          </div>
        </div>
      )}

      {onTransformar && (
        <div className="border-t border-bone-200 pt-1.5">
          <TransformarControles onTransformar={onTransformar} disabled={!editando} />
        </div>
      )}

      {editando && capasUsuario && capasUsuario.length > 1 && onMoverACapa && (
        <div className="border-t border-bone-200 pt-1.5">
          <label className="block text-[8px] text-ink-700/50 uppercase mb-0.5">Capa</label>
          <select
            value={capaSeleccionado ?? 'default'}
            onChange={e => onMoverACapa(e.target.value)}
            className="w-full text-[10px] bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500 cursor-pointer"
          >
            {[...capasUsuario].sort((a, b) => a.orden - b.orden).map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {editando && onRenombrar && (
        <div className="border-t border-bone-200 pt-1.5 space-y-1">
          <input
            type="text"
            value={nombreSeleccionado ?? ''}
            onChange={e => onRenombrar(e.target.value, notasSeleccionado ?? '')}
            placeholder="Sin nombre…"
            className="w-full px-2 py-1 rounded-md border border-bone-200 bg-white text-ink-900 text-[10px] placeholder-ink-700/30 focus:outline-none focus:border-moss-500 transition-colors"
          />
          <textarea
            value={notasSeleccionado ?? ''}
            onChange={e => onRenombrar(nombreSeleccionado ?? '', e.target.value)}
            placeholder="Notas…"
            rows={2}
            className="w-full px-2 py-1 rounded-md border border-bone-200 bg-white text-ink-900 text-[10px] placeholder-ink-700/30 focus:outline-none focus:border-moss-500 resize-none transition-colors"
          />
        </div>
      )}
    </div>
  );

  // ── Modo header: integrado en la barra superior ─────────────────────────────
  if (inHeader) {
    // Mientras hay un trazo abierto, la fila se reduce a la herramienta que se
    // está usando. Los trece botones más el "n pts", el ✓ y el ✗ no entran en el
    // ancho que le queda a la columna del medio, y los íconos se comprimían unos
    // sobre otros hasta quedar ilegibles justo en el momento en que hay que
    // apretar Finalizar. Dibujando tampoco sirven: no se cambia de herramienta
    // con una figura a medio hacer.
    const visibles = dibujando ? HERRAMIENTAS.filter(h => h.modo === modoDibujo) : HERRAMIENTAS;
    return (
      <div className="relative flex items-center gap-0.5 h-full" style={{ pointerEvents: 'auto' }}>
        {/* Separador izquierdo */}
        <div className="w-px h-5 bg-bone-200 mr-1 shrink-0" />

        {/* Herramientas */}
        {visibles.map(({ modo, icon, title }) => (
          <button
            key={modo}
            title={title}
            onClick={() => onModo(modoDibujo === modo ? null : modo)}
            className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
              modoDibujo === modo ? 'bg-sun-500 text-ink-950' : 'text-ink-700/60 hover:bg-bone-100'
            }`}
          >
            {icon}
          </button>
        ))}

        <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />

        {/* Color activo */}
        <div ref={colorRef} className="relative shrink-0">
          <button
            title="Elegir color de dibujo"
            onClick={() => setColorPickerOpen(o => !o)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bone-100 transition-colors"
          >
            <span className="w-5 h-5 rounded border border-bone-300/50 block" style={{ background: colorActivo }} />
          </button>
          {colorPickerOpen && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1300] bg-white/97 backdrop-blur-sm rounded-xl shadow-raised border border-bone-200 p-2">
              <div className="grid grid-cols-4 gap-1.5">
                {COLORES_DIBUJO.map(c => (
                  <button
                    key={c}
                    onClick={() => { onColor(c); setColorPickerOpen(false); }}
                    className={`w-6 h-6 rounded border transition-transform hover:scale-110 ${
                      colorActivo === c ? 'border-ink-900 scale-110' : 'border-bone-300'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controles de dibujo en curso */}
        {dibujando && (
          <>
            <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />
            <span className="text-[9px] text-ink-700/60 leading-tight px-1 whitespace-nowrap">
              {hintText}
            </span>
            {puedeF && (
              <button title="Finalizar (Enter)" onClick={onFinalizar}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-moss-700 hover:bg-moss-600 text-white transition-colors shrink-0">
                <Check className="w-4 h-4" />
              </button>
            )}
            <button title="Cancelar (Esc)" onClick={onCancelar}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-clay-700 hover:bg-clay-600 text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Transformar / editar — en modo selección */}
        {modoDibujo === 'seleccion' && !dibujando && (
          <>
            <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />
            <button title="Propiedades / transformar elemento" onClick={() => setPanelOpen(o => !o)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                panelOpen ? 'bg-moss-100 text-moss-900 ring-1 ring-moss-400' : 'text-ink-700/60 hover:bg-bone-100'
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {editando && (
              <button title="Eliminar seleccionado (Supr)" onClick={onEliminar}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-clay-700 hover:bg-clay-600 text-white transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {/* Separador derecho */}
        <div className="w-px h-5 bg-bone-200 ml-1 shrink-0" />

        {/* Panel de propiedades — dropdown fijo bajo el header */}
        {modoDibujo === 'seleccion' && !dibujando && panelOpen && propPanel}
      </div>
    );
  }

  // ── Modo flotante (fallback / no se usa si inHeader está activo) ────────────
  if (colapsada) {
    return (
      <div style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => setColapsada(false)}
          title="Mostrar herramientas de dibujo"
          className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-white/97 backdrop-blur-sm shadow-paper border border-bone-200 text-[10px] text-ink-700/70 hover:text-moss-700 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Dibujo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" style={{ pointerEvents: 'auto' }}>

      {/* ── Barra horizontal principal ── */}
      <div className="flex items-center gap-0.5 px-1.5 h-10 bg-white/97 backdrop-blur-sm rounded-xl shadow-paper border border-bone-200">

        {HERRAMIENTAS.map(({ modo, icon, title }) => (
          <button
            key={modo}
            title={title}
            onClick={() => onModo(modoDibujo === modo ? null : modo)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              modoDibujo === modo ? 'bg-sun-500 text-ink-950' : 'text-ink-700/80 hover:bg-bone-100'
            }`}
          >
            {icon}
          </button>
        ))}

        <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />

        <div ref={colorRef} className="relative shrink-0">
          <button
            title="Elegir color de dibujo"
            onClick={() => setColorPickerOpen(o => !o)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bone-100 transition-colors"
          >
            <span className="w-5 h-5 rounded border border-bone-300/50 block" style={{ background: colorActivo }} />
          </button>
          {colorPickerOpen && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 bg-white/97 backdrop-blur-sm rounded-xl shadow-raised border border-bone-200 p-2">
              <div className="grid grid-cols-4 gap-1.5">
                {COLORES_DIBUJO.map(c => (
                  <button
                    key={c}
                    onClick={() => { onColor(c); setColorPickerOpen(false); }}
                    className={`w-6 h-6 rounded border transition-transform hover:scale-110 ${
                      colorActivo === c ? 'border-ink-900 scale-110' : 'border-bone-300'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {dibujando && (
          <>
            <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />
            <span className="text-[9px] text-ink-700/60 leading-tight px-1 whitespace-nowrap">
              {hintText}
            </span>
            {puedeF && (
              <button title="Finalizar (Enter)" onClick={onFinalizar}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-moss-700 hover:bg-moss-600 text-white transition-colors shrink-0">
                <Check className="w-4 h-4" />
              </button>
            )}
            <button title="Cancelar (Esc)" onClick={onCancelar}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-clay-700 hover:bg-clay-600 text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {modoDibujo === 'seleccion' && !dibujando && (
          <>
            <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />
            <button title="Propiedades / transformar elemento" onClick={() => setPanelOpen(o => !o)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                panelOpen ? 'bg-moss-100 text-moss-900 ring-1 ring-moss-400' : 'text-ink-700/80 hover:bg-bone-100'
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {editando && (
              <button title="Eliminar seleccionado (Supr)" onClick={onEliminar}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-clay-700 hover:bg-clay-600 text-white transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        <div className="w-px h-5 bg-bone-200 mx-0.5 shrink-0" />

        <button
          title="Ocultar barra de herramientas"
          onClick={() => setColapsada(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-700/50 hover:bg-bone-100 transition-colors shrink-0"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {modoDibujo === 'seleccion' && !dibujando && panelOpen && propPanel}
    </div>
  );
}

// ─── Controles de transformación ──────────────────────────────────────────────

const num = (s: string) => parseFloat(s.replace(',', '.'));

function TransformarControles({ onTransformar, disabled = false }: { onTransformar: (op: TransformarOp) => void; disabled?: boolean }) {
  const [escala, setEscala] = useState('1.1');
  const [rot,    setRot]    = useState('90');
  const [desf,   setDesf]   = useState('5');
  const [fil,    setFil]    = useState('3');
  const [cha,    setCha]    = useState('3');
  const [matriz, setMatriz] = useState(false);
  const [filas,  setFilas]  = useState('1');
  const [cols,   setCols]   = useState('3');
  const [paso,   setPaso]   = useState('10');
  const [pN,     setPN]     = useState('6');
  const [pAng,   setPAng]   = useState('360');

  const inputCls = 'w-11 text-[10px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500 disabled:opacity-40';
  const btnCls   = `shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${disabled ? 'bg-bone-200 text-ink-700/30 cursor-not-allowed' : 'bg-moss-700 hover:bg-moss-600 text-white'}`;

  return (
    <div className={`w-40 px-1 space-y-1 ${disabled ? 'opacity-60' : ''}`}>
      <p className="text-[8px] text-ink-700/50 uppercase">Transformar</p>

      <div className="flex items-center gap-1">
        <Scaling className="w-3 h-3 text-ink-700/50 shrink-0" />
        <input className={inputCls} value={escala} onChange={e => setEscala(e.target.value)} title="Factor de escala" />
        <span className="text-[8px] text-ink-700/40">×</span>
        <button className={btnCls} title="Escalar" onClick={() => { const f = num(escala); if (f > 0) onTransformar({ op: 'escala', factor: f }); }}>
          <Check className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <RotateCw className="w-3 h-3 text-ink-700/50 shrink-0" />
        <input className={inputCls} value={rot} onChange={e => setRot(e.target.value)} title="Ángulo (° antihorario)" />
        <span className="text-[8px] text-ink-700/40">°</span>
        <button className={btnCls} title="Rotar" onClick={() => { const g = num(rot); if (Number.isFinite(g)) onTransformar({ op: 'rotar', grados: g }); }}>
          <Check className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <Spline className="w-3 h-3 text-ink-700/50 shrink-0" />
        <input className={inputCls} value={desf} onChange={e => setDesf(e.target.value)} title="Distancia de desfase (m). Negativo = lado opuesto" />
        <span className="text-[8px] text-ink-700/40">m</span>
        <button className={btnCls} title="Desfasar / offset" onClick={() => { const d = num(desf); if (Number.isFinite(d)) onTransformar({ op: 'desfase', distM: d }); }}>
          <Check className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[8px] text-ink-700/40 shrink-0 w-9">Redond.</span>
        <input className={inputCls} value={fil} onChange={e => setFil(e.target.value)} title="Radio de redondeo (m)" />
        <span className="text-[8px] text-ink-700/40">m</span>
        <button className={btnCls} title="Redondear esquinas (fillet)" onClick={() => { const r = num(fil); if (r > 0) onTransformar({ op: 'fillet', radio: r }); }}>
          <Check className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[8px] text-ink-700/40 shrink-0 w-9">Chaflán</span>
        <input className={inputCls} value={cha} onChange={e => setCha(e.target.value)} title="Distancia de chaflán (m)" />
        <span className="text-[8px] text-ink-700/40">m</span>
        <button className={btnCls} title="Achaflanar esquinas (chamfer)" onClick={() => { const x = num(cha); if (x > 0) onTransformar({ op: 'chamfer', dist: x }); }}>
          <Check className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[8px] text-ink-700/40 mr-auto">Espejo</span>
        <button className="w-6 h-6 rounded flex items-center justify-center bg-bone-100 hover:bg-bone-200 text-ink-700 transition-colors"
          title="Espejo horizontal" onClick={() => onTransformar({ op: 'espejo', eje: 'vertical' })}>
          <FlipHorizontal2 className="w-3.5 h-3.5" />
        </button>
        <button className="w-6 h-6 rounded flex items-center justify-center bg-bone-100 hover:bg-bone-200 text-ink-700 transition-colors"
          title="Espejo vertical" onClick={() => onTransformar({ op: 'espejo', eje: 'horizontal' })}>
          <FlipVertical2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <button className={`w-full flex items-center gap-1 text-[9px] px-1 py-0.5 rounded transition-colors ${matriz ? 'bg-moss-100 text-moss-900' : 'text-ink-700/60 hover:bg-bone-100'}`}
        onClick={() => setMatriz(m => !m)}>
        <Grid2x2 className="w-3 h-3" /> Copiar / Matriz
      </button>

      {matriz && (
        <div className="space-y-1 pl-1 border-l border-bone-200">
          <p className="text-[8px] text-ink-700/40 uppercase">Rectangular</p>
          <div className="flex items-center gap-1">
            <input className="w-8 text-[10px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:border-moss-500" value={filas} onChange={e => setFilas(e.target.value)} title="Filas" />
            <span className="text-[8px] text-ink-700/40">×</span>
            <input className="w-8 text-[10px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:border-moss-500" value={cols} onChange={e => setCols(e.target.value)} title="Columnas" />
            <input className="w-10 text-[10px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:border-moss-500" value={paso} onChange={e => setPaso(e.target.value)} title="Paso (m)" />
            <button className={btnCls} title="Matriz rectangular"
              onClick={() => { const f = num(filas), c = num(cols), p = num(paso); if (f >= 1 && c >= 1 && p) onTransformar({ op: 'matrizRect', filas: f, cols: c, pasoX: p, pasoY: p }); }}>
              <Check className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[8px] text-ink-700/40 uppercase">Polar</p>
          <div className="flex items-center gap-1">
            <input className="w-8 text-[10px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:border-moss-500" value={pN} onChange={e => setPN(e.target.value)} title="Cantidad" />
            <input className="w-10 text-[10px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:border-moss-500" value={pAng} onChange={e => setPAng(e.target.value)} title="Ángulo total (°)" />
            <span className="text-[8px] text-ink-700/40">°</span>
            <button className={btnCls} title="Matriz polar"
              onClick={() => { const n = num(pN), a = num(pAng); if (n >= 2 && Number.isFinite(a)) onTransformar({ op: 'matrizPolar', cantidad: n, anguloTotal: a }); }}>
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
