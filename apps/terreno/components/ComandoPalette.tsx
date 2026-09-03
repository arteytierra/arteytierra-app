'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, CornerDownLeft, BookOpen } from 'lucide-react';

export interface Comando {
  id:        string;
  label:     string;
  grupo:     string;
  keywords?: string;
  accion:    () => void;
}

// ─── Paleta de comandos (Ctrl+K) ───────────────────────────────────────────────
export function ComandoPalette({ comandos, onClose }: { comandos: Comando[]; onClose: () => void }) {
  const [q, setQ]     = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return comandos;
    const terms = t.split(/\s+/);
    return comandos.filter(c => {
      const hay = `${c.label} ${c.grupo} ${c.keywords ?? ''}`.toLowerCase();
      return terms.every(term => hay.includes(term));
    });
  }, [q, comandos]);

  useEffect(() => { setIdx(0); }, [q]);

  const ejecutar = (c?: Comando) => { if (c) { onClose(); c.accion(); } };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, filtrados.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); ejecutar(filtrados[idx]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  // Mantener el ítem activo a la vista
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[12vh] bg-ink-950/40 backdrop-blur-sm no-print" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-raised border border-bone-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={onKey}
      >
        {/* Buscador */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-bone-200">
          <Search className="w-4 h-4 text-ink-700/40 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar acción… (ir a, herramienta, exportar…)"
            className="flex-1 text-sm bg-transparent text-ink-950 placeholder-ink-700/35 focus:outline-none"
          />
          <kbd className="text-[9px] font-mono text-ink-700/40 border border-bone-200 rounded px-1 py-0.5">ESC</kbd>
        </div>

        {/* Resultados */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {filtrados.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-ink-700/40">Sin resultados para “{q}”.</p>
          ) : (
            filtrados.map((c, i) => (
              <button
                key={c.id}
                data-idx={i}
                onMouseEnter={() => setIdx(i)}
                onClick={() => ejecutar(c)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  i === idx ? 'bg-moss-100' : 'hover:bg-bone-50'
                }`}
              >
                <span className="text-[9px] font-semibold uppercase tracking-wide text-moss-700/70 w-20 shrink-0 truncate">{c.grupo}</span>
                <span className="flex-1 text-sm text-ink-900 truncate">{c.label}</span>
                {i === idx && <CornerDownLeft className="w-3.5 h-3.5 text-ink-700/30 shrink-0" />}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 px-4 h-8 border-t border-bone-200 bg-bone-50 text-[10px] text-ink-700/45 font-mono">
          <span>↑↓ navegar</span><span>⏎ ejecutar</span><span className="ml-auto">{filtrados.length} acciones</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hoja de atajos (tecla ?) ──────────────────────────────────────────────────
const ATAJOS: Array<{ grupo: string; items: Array<[string, string]> }> = [
  { grupo: 'General', items: [
    ['Ctrl + K', 'Paleta de comandos'],
    ['?', 'Mostrar / ocultar esta ayuda'],
    ['Ctrl + Z', 'Deshacer'],
    ['Ctrl + Shift + Z', 'Rehacer'],
  ]},
  { grupo: 'Dibujo', items: [
    ['Enter', 'Finalizar figura en curso'],
    ['Espacio', 'Repetir la última herramienta usada'],
    ['Backspace', 'Quitar último vértice'],
    ['Esc', 'Cancelar / deseleccionar'],
    ['Supr', 'Eliminar elemento seleccionado'],
  ]},
  { grupo: 'CAD', items: [
    ['F3', 'Snap a puntos'],
    ['F8', 'Modo ortogonal 90°'],
    ['20  ·  20<90', 'Entrada por teclado: largo (· largo<ángulo)'],
  ]},
  { grupo: 'Mapa', items: [
    ['Rueda', 'Zoom'],
    ['Botón central', 'Desplazar (pan)'],
    ['Shift + ← →', 'Girar el plano 15°'],
    ['Shift + ↑', 'Volver el norte arriba'],
    ['Arrastrar la brújula', 'Girar el plano'],
    ['Shift + central', 'Girar el plano'],
    ['Arrastre izquierdo', 'Desplazar, salvo con una herramienta activa'],
    ['Doble clic en vértice', 'Borrar vértice del dibujo'],
  ]},
];

export function AtajosAyuda({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink-950/40 backdrop-blur-sm no-print" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-raised border border-bone-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-12 border-b border-bone-200">
          <span className="text-sm font-semibold text-ink-950">Atajos de teclado</span>
          <button onClick={onClose} className="text-ink-700/40 hover:text-ink-700 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4 max-h-[70vh] overflow-y-auto">
          {ATAJOS.map(sec => (
            <div key={sec.grupo}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-moss-700/70 mb-1.5">{sec.grupo}</p>
              <div className="space-y-1">
                {sec.items.map(([k, d]) => (
                  <div key={k} className="flex items-baseline justify-between gap-2">
                    <kbd className="text-[10px] font-mono text-ink-800 bg-bone-100 border border-bone-200 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0">{k}</kbd>
                    <span className="text-[11px] text-ink-700/70 text-right leading-tight">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <a
          href="/guia.html" target="_blank" rel="noopener"
          className="flex items-center gap-2.5 px-5 h-12 border-t border-bone-200 text-sm font-medium text-moss-700 hover:bg-bone-50 transition-colors"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          Guía de uso — qué hace cada análisis y cómo se conectan
        </a>
      </div>
    </div>
  );
}
