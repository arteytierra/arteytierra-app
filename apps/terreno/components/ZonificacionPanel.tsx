'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, PenLine, Check, X, ChevronDown, RotateCcw } from 'lucide-react';
import {
  CATEGORIAS_ZONA,
  calcularResumenZonificacion,
  type Zona,
  type CategoriaZona,
} from '@/lib/zonificacion';

interface ModoZona {
  categoria: CategoriaZona;
  vertices:  Array<{ lat: number; lng: number }>;
}

interface Props {
  zonas:             Zona[];
  onZonas:           (z: Zona[]) => void;
  modoZona:          ModoZona | null;
  onIniciarDibujo:   (cat: CategoriaZona) => void;
  onFinalizarZona:   (color?: string) => void;
  onCancelarZona:    () => void;
}

export function ZonificacionPanel({
  zonas, onZonas, modoZona,
  onIniciarDibujo, onFinalizarZona, onCancelarZona,
}: Props) {
  const [editandoId,   setEditandoId]   = useState<string | null>(null);
  const [categoriaNew, setCategoriaNew] = useState<CategoriaZona>('huerta');
  const [menuAbierto,  setMenuAbierto]  = useState(false);
  const [colorModo,    setColorModo]    = useState<string>(CATEGORIAS_ZONA.huerta.color);

  // Sincronizar color default cuando cambia la categoría en modo dibujo
  useEffect(() => {
    if (modoZona) setColorModo(CATEGORIAS_ZONA[modoZona.categoria].color);
  }, [modoZona?.categoria]);

  const eliminarZona = useCallback((id: string) => {
    onZonas(zonas.filter(z => z.id !== id));
  }, [zonas, onZonas]);

  const actualizarZona = useCallback((id: string, campo: Partial<Zona>) => {
    onZonas(zonas.map(z => z.id === id ? { ...z, ...campo } : z));
  }, [zonas, onZonas]);

  const resumen = calcularResumenZonificacion(zonas);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Zonificación del predio
      </p>

      {/* ── Modo dibujo activo ───────────────────────────────────────────────── */}
      {modoZona ? (
        <div className="bg-sun-300/20 rounded-xl border border-sun-300 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: colorModo }} />
            <p className="text-xs font-semibold text-ink-900">
              Dibujando: {CATEGORIAS_ZONA[modoZona.categoria].label}
            </p>
          </div>

          {/* Color picker en modo dibujo */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-ink-700/60 shrink-0">Color:</label>
            <input
              type="color"
              value={colorModo}
              onChange={e => setColorModo(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-bone-200 p-0.5 bg-white"
            />
            <button
              onClick={() => setColorModo(CATEGORIAS_ZONA[modoZona.categoria].color)}
              title="Restaurar color por defecto"
              className="text-ink-700/40 hover:text-ink-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-ink-700/40">{colorModo}</span>
          </div>

          <p className="text-[10px] text-ink-700/70">
            Hacé clic en el mapa para agregar vértices.{' '}
            {modoZona.vertices.length < 3
              ? `(${modoZona.vertices.length}/3 mínimo)`
              : `${modoZona.vertices.length} vértices — listo para guardar`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onFinalizarZona(colorModo)}
              disabled={modoZona.vertices.length < 3}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              Guardar zona ({modoZona.vertices.length} vért.)
            </button>
            <button
              onClick={onCancelarZona}
              className="px-3 py-1.5 bg-white border border-bone-200 hover:border-clay-300 text-ink-700 rounded-lg text-xs transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* ── Selector de nueva zona ─────────────────────────────────────────── */
        <div className="relative">
          <button
            onClick={() => setMenuAbierto(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-xl text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Nueva zona
            </span>
            <span className="opacity-70 text-[10px]">{CATEGORIAS_ZONA[categoriaNew].label}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} />
              <div className="absolute left-0 right-0 top-9 z-20 bg-white rounded-xl border border-bone-200 shadow-lg py-1 max-h-72 overflow-y-auto">
                {(Object.entries(CATEGORIAS_ZONA) as [CategoriaZona, typeof CATEGORIAS_ZONA[CategoriaZona]][]).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCategoriaNew(key);
                      setMenuAbierto(false);
                      onIniciarDibujo(key);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-bone-50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: info.color }} />
                    <div>
                      <span className="font-medium text-ink-900">{info.label}</span>
                      <span className="block text-ink-700/50 text-[10px]">{info.descripcion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Lista de zonas ───────────────────────────────────────────────────── */}
      {zonas.length > 0 ? (
        <div className="space-y-2">
          {zonas.map(z => (
            <ZonaRow
              key={z.id}
              zona={z}
              editando={editandoId === z.id}
              onEdit={() => setEditandoId(id => id === z.id ? null : z.id)}
              onUpdate={campo => actualizarZona(z.id, campo)}
              onDelete={() => eliminarZona(z.id)}
            />
          ))}
        </div>
      ) : (
        !modoZona && (
          <p className="text-xs text-ink-700/50 text-center py-4">
            Aún no hay zonas. Creá la primera usando el botón de arriba.
          </p>
        )
      )}

      {/* ── Resumen de usos ──────────────────────────────────────────────────── */}
      {resumen.zonas_por_categoria.length > 0 && (
        <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
          <div className="px-3 py-2 border-b border-bone-200">
            <p className="text-xs font-medium text-ink-700">
              Usos del suelo · {resumen.area_total_zonificada_ha.toFixed(4)} ha total
            </p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-bone-50 border-b border-bone-200">
                <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Uso</th>
                <th className="text-right px-2 py-1.5 text-ink-700/60 font-medium">ha</th>
                <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {resumen.zonas_por_categoria.map(cat => {
                // usar color personalizado si todas las zonas de esa categoría tienen el mismo
                const colorCat = CATEGORIAS_ZONA[cat.categoria].color;
                return (
                  <tr key={cat.categoria} className="border-t border-bone-200/50">
                    <td className="px-3 py-1.5 text-ink-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colorCat }} />
                      {cat.label}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-ink-900">{cat.area_ha.toFixed(4)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-ink-700/60">{cat.porcentaje}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Fila de zona ─────────────────────────────────────────────────────────────

function ZonaRow({
  zona, editando, onEdit, onUpdate, onDelete,
}: {
  zona:     Zona;
  editando: boolean;
  onEdit:   () => void;
  onUpdate: (campo: Partial<Zona>) => void;
  onDelete: () => void;
}) {
  const info        = CATEGORIAS_ZONA[zona.categoria];
  const colorActual = zona.color ?? info.color;
  const inputCls    = 'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <span className="w-3 h-3 rounded-sm shrink-0 border border-black/10" style={{ background: colorActual }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-900 truncate">{zona.nombre}</p>
          <p className="text-[9px] text-ink-700/50">
            {zona.area_ha.toFixed(4)} ha · {zona.vertices.length} vértices
          </p>
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
            <input className={inputCls} value={zona.nombre} onChange={e => onUpdate({ nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Categoría</label>
            <select className={inputCls} value={zona.categoria} onChange={e => onUpdate({ categoria: e.target.value as CategoriaZona })}>
              {(Object.entries(CATEGORIAS_ZONA) as [CategoriaZona, typeof CATEGORIAS_ZONA[CategoriaZona]][]).map(([key, inf]) => (
                <option key={key} value={key}>{inf.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Color personalizado</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorActual}
                onChange={e => onUpdate({ color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-bone-200 p-0.5 bg-white"
              />
              <span className="text-[10px] font-mono text-ink-700/50">{colorActual}</span>
              {zona.color && (
                <button
                  onClick={() => onUpdate({ color: undefined })}
                  className="text-[10px] text-ink-700/40 hover:text-ink-700 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> restaurar
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Notas</label>
            <textarea
              className={inputCls + ' resize-none'}
              rows={2}
              value={zona.notas}
              placeholder="Observaciones, plan de uso..."
              onChange={e => onUpdate({ notas: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
