'use client';

import { MousePointer2, Minus, Hexagon, Circle, Activity, Type, Check, X, Trash2 } from 'lucide-react';
import type { TipoDibujo, DibujoEnCurso } from '@/lib/dibujos';
import { COLORES_DIBUJO } from '@/lib/dibujos';

type Modo = TipoDibujo | 'seleccion' | null;

interface Props {
  modoDibujo:    Modo;
  colorActivo:   string;
  enCurso:       DibujoEnCurso | null;
  seleccionado:  string | null;
  onModo:        (modo: Modo) => void;
  onColor:       (color: string) => void;
  onFinalizar:   () => void;
  onCancelar:    () => void;
  onEliminar:    () => void;
}

const HERRAMIENTAS: Array<{ modo: Modo; icon: React.ReactNode; title: string }> = [
  { modo: 'seleccion', icon: <MousePointer2 className="w-4 h-4" />, title: 'Seleccionar / borrar' },
  { modo: 'linea',     icon: <Minus         className="w-4 h-4" />, title: 'Línea' },
  { modo: 'poligono',  icon: <Hexagon       className="w-4 h-4" />, title: 'Polígono' },
  { modo: 'circulo',   icon: <Circle        className="w-4 h-4" />, title: 'Círculo' },
  { modo: 'curva',     icon: <Activity      className="w-4 h-4" />, title: 'Curva' },
  { modo: 'texto',     icon: <Type          className="w-4 h-4" />, title: 'Texto' },
];

export function DibujoToolbar({
  modoDibujo, colorActivo, enCurso, seleccionado,
  onModo, onColor, onFinalizar, onCancelar, onEliminar,
}: Props) {
  const dibujando = enCurso !== null;
  const minVerts  = enCurso
    ? (enCurso.tipo === 'circulo' ? 1 : enCurso.tipo === 'texto' ? 0 : 2)
    : 0;
  const puedeF = enCurso
    ? (enCurso.tipo === 'linea'    && enCurso.vertices.length >= 2) ||
      (enCurso.tipo === 'poligono' && enCurso.vertices.length >= 3) ||
      (enCurso.tipo === 'curva'    && enCurso.vertices.length >= 2) ||
      (enCurso.tipo === 'circulo'  && enCurso.vertices.length >= 2)
    : false;

  return (
    <div
      className="flex flex-col gap-1 p-1.5 bg-white/97 backdrop-blur-sm rounded-xl shadow-paper border border-bone-200"
      style={{ pointerEvents: 'auto' }}
    >
      {/* ── Herramientas ── */}
      {HERRAMIENTAS.map(({ modo, icon, title }) => (
        <button
          key={modo}
          title={title}
          onClick={() => onModo(modoDibujo === modo ? null : modo)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            modoDibujo === modo
              ? 'bg-sun-500 text-ink-950'
              : 'text-ink-700/60 hover:bg-bone-100'
          }`}
        >
          {icon}
        </button>
      ))}

      {/* ── Separador ── */}
      <div className="h-px bg-bone-200 mx-0.5" />

      {/* ── Color activo ── */}
      <div
        className="w-8 h-4 rounded border border-white/30 mx-auto"
        style={{ background: colorActivo }}
      />

      {/* ── Paleta ── */}
      <div className="grid grid-cols-2 gap-0.5">
        {COLORES_DIBUJO.map(c => (
          <button
            key={c}
            title={c}
            onClick={() => onColor(c)}
            className={`w-3.5 h-3.5 rounded-sm border transition-transform hover:scale-110 ${
              colorActivo === c ? 'border-ink-900 scale-110' : 'border-bone-300'
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      {/* ── Controles de dibujo ── */}
      {dibujando && (
        <>
          <div className="h-px bg-bone-200 mx-0.5" />

          <div className="text-[9px] text-bone-400 text-center leading-tight px-0.5">
            {enCurso!.tipo === 'circulo'
              ? enCurso!.vertices.length === 0
                ? 'Clic: centro'
                : 'Clic: radio'
              : `${enCurso!.vertices.length} pts${minVerts > 0 ? ` / mín ${minVerts}` : ''}`
            }
          </div>

          {puedeF && (
            <button
              title="Finalizar"
              onClick={onFinalizar}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-moss-700 hover:bg-moss-600 text-white transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          <button
            title="Cancelar"
            onClick={onCancelar}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-clay-700 hover:bg-clay-600 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}

      {/* ── Eliminar elemento seleccionado ── */}
      {modoDibujo === 'seleccion' && seleccionado && !dibujando && (
        <>
          <div className="h-px bg-bone-200 mx-0.5" />
          <button
            title="Eliminar seleccionado"
            onClick={onEliminar}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-clay-700 hover:bg-clay-600 text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
