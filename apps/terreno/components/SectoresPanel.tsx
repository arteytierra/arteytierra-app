'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Trash2, PenLine, Check, X, ChevronDown, Info, RotateCcw, MapPin } from 'lucide-react';
import {
  TIPOS_SECTOR,
  calcularSectoresAuto,
  generarVerticesSector,
  type Sector,
  type TipoSector,
} from '@/lib/sectores';
import type { DatosClima } from '@/lib/clima';
import type { DatosTopografia } from '@/lib/topografia';
import type { Mojon } from '@/lib/types';
import { centroide } from '@/lib/clima';
import { calcularRadioArco } from '@/lib/arco_solar';

interface ModoSector {
  tipo:     TipoSector;
  vertices: Array<{ lat: number; lng: number }>;
}

interface Props {
  mojones:       Mojon[];
  datosClima:    DatosClima | null;
  datosTopografia: DatosTopografia | null;
  sectores:      Sector[];
  onSectores:    (s: Sector[]) => void;
  modoSector:    ModoSector | null;
  onIniciarDibujo:   (tipo: TipoSector) => void;
  onFinalizarSector: (color?: string) => void;
  onCancelarSector:  () => void;
  onAplicarSector?:  (sector: Sector) => void;
}

export function SectoresPanel({
  mojones, datosClima, datosTopografia,
  sectores, onSectores, modoSector,
  onIniciarDibujo, onFinalizarSector, onCancelarSector, onAplicarSector,
}: Props) {
  const [menuAbierto,  setMenuAbierto]  = useState(false);
  const [editandoId,   setEditandoId]   = useState<string | null>(null);
  const [mostrarAuto,  setMostrarAuto]  = useState(true);
  const [colorModo,    setColorModo]    = useState<string>(TIPOS_SECTOR.personalizado.color);
  const [aplicadosIds, setAplicadosIds] = useState<Set<string>>(new Set());

  // Sincronizar color default cuando cambia el tipo en modo dibujo
  useEffect(() => {
    if (modoSector) setColorModo(TIPOS_SECTOR[modoSector.tipo].color);
  }, [modoSector?.tipo]);

  const centro = mojones.length > 0 ? centroide(mojones) : null;

  const handleAplicar = useCallback((s: Sector) => {
    if (!centro || !onAplicarSector) return;
    const radio  = calcularRadioArco(mojones, centro.lat);
    const verts  = generarVerticesSector(s.tipo, centro.lat, centro.lng, radio, datosClima, datosTopografia);
    if (verts.length < 3) return;
    const nuevo: Sector = { ...s, id: crypto.randomUUID(), vertices: verts, auto: false };
    onAplicarSector(nuevo);
    setAplicadosIds(prev => new Set([...prev, s.id]));
  }, [centro, mojones, datosClima, datosTopografia, onAplicarSector]);

  const sectoresAuto = useMemo(() => {
    if (!centro) return [];
    return calcularSectoresAuto(centro.lat, datosClima, datosTopografia);
  }, [centro, datosClima, datosTopografia]);

  const eliminarSector = useCallback((id: string) => {
    onSectores(sectores.filter(s => s.id !== id));
  }, [sectores, onSectores]);

  const actualizarSector = useCallback((id: string, campo: Partial<Sector>) => {
    onSectores(sectores.map(s => s.id === id ? { ...s, ...campo } : s));
  }, [sectores, onSectores]);

  const inputCls = 'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Análisis de sectores
      </p>

      {/* ── Modo dibujo activo ───────────────────────────────────────────────── */}
      {modoSector ? (
        <div className="bg-sun-300/20 rounded-xl border border-sun-300 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: colorModo }} />
            <p className="text-xs font-semibold text-ink-900">
              {TIPOS_SECTOR[modoSector.tipo].icono} Dibujando: {TIPOS_SECTOR[modoSector.tipo].label}
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
              onClick={() => setColorModo(TIPOS_SECTOR[modoSector.tipo].color)}
              title="Restaurar color por defecto"
              className="text-ink-700/40 hover:text-ink-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-ink-700/40">{colorModo}</span>
          </div>

          <p className="text-[10px] text-ink-700/70">
            Hacé clic en el mapa para delimitar el sector.{' '}
            {modoSector.vertices.length < 3
              ? `(${modoSector.vertices.length}/3 mínimo)`
              : `${modoSector.vertices.length} vértices — listo`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onFinalizarSector(colorModo)}
              disabled={modoSector.vertices.length < 3}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              Guardar sector ({modoSector.vertices.length} vért.)
            </button>
            <button onClick={onCancelarSector} className="px-3 py-1.5 bg-white border border-bone-200 hover:border-clay-300 text-ink-700 rounded-lg text-xs transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* ── Agregar sector dibujado ────────────────────────────────────────── */
        <div className="relative">
          <button
            onClick={() => setMenuAbierto(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-xl text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Marcar sector en mapa
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} />
              <div className="absolute left-0 right-0 top-9 z-20 bg-white rounded-xl border border-bone-200 shadow-lg py-1 max-h-64 overflow-y-auto">
                {(Object.entries(TIPOS_SECTOR) as [TipoSector, typeof TIPOS_SECTOR[TipoSector]][]).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => { setMenuAbierto(false); onIniciarDibujo(key); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-bone-50 flex items-center gap-2 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: info.color }} />
                    <div>
                      <span className="font-medium text-ink-900">{info.icono} {info.label}</span>
                      <span className="block text-ink-700/50 text-[10px]">{info.descripcion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Sectores automáticos ─────────────────────────────────────────────── */}
      {sectoresAuto.length > 0 && (
        <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
          <button
            onClick={() => setMostrarAuto(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-ink-700 hover:bg-bone-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3 h-3 text-water-500" />
              Sectores detectados automáticamente ({sectoresAuto.length})
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-ink-700/50 transition-transform ${mostrarAuto ? 'rotate-180' : ''}`} />
          </button>
          {mostrarAuto && (
            <div className="border-t border-bone-200 divide-y divide-bone-200">
              {sectoresAuto.map(s => {
                const info      = TIPOS_SECTOR[s.tipo];
                const aplicado  = aplicadosIds.has(s.id);
                const soportaGeom = ['sol_verano','sol_invierno','viento_ppal','viento_frio','fuego','inundacion'].includes(s.tipo);
                return (
                  <div key={s.id} className="px-3 py-2.5 space-y-1">
                    <p className="text-xs font-medium text-ink-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: info.color }} />
                      {info.icono} {s.nombre}
                    </p>
                    <p className="text-[10px] text-ink-700/60 leading-relaxed ml-4">{s.notas}</p>
                    {soportaGeom && onAplicarSector && (
                      <button
                        onClick={() => handleAplicar(s)}
                        disabled={!centro}
                        className={`ml-4 flex items-center gap-1 text-[10px] font-semibold py-0.5 px-2 rounded transition-colors ${
                          aplicado
                            ? 'bg-moss-100 text-moss-700'
                            : 'bg-bone-100 hover:bg-moss-100 text-ink-700 hover:text-moss-700'
                        } disabled:opacity-40`}
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {aplicado ? 'Aplicado al plano ✓' : '+ Aplicar al plano'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Sectores dibujados manualmente ──────────────────────────────────── */}
      {sectores.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-700">Sectores marcados</p>
          {sectores.map(s => {
            const info = TIPOS_SECTOR[s.tipo];
            return (
              <div key={s.id} className="bg-white rounded-xl border border-bone-200 overflow-hidden">
                <div className="flex items-center gap-2 p-2.5">
                  <span className="w-3 h-3 rounded-sm shrink-0 border border-black/10" style={{ background: s.color ?? info.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink-900 truncate">{s.nombre}</p>
                    <p className="text-[9px] text-ink-700/50">{s.vertices.length} vértices</p>
                  </div>
                  <button onClick={() => setEditandoId(id => id === s.id ? null : s.id)} className="shrink-0 text-ink-700/30 hover:text-moss-700 transition-colors">
                    <PenLine className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => eliminarSector(s.id)} className="shrink-0 text-ink-700/30 hover:text-clay-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {editandoId === s.id && (
                  <div className="border-t border-bone-200 p-2.5 space-y-2">
                    <div>
                      <label className="block text-[10px] text-ink-700/60 mb-1">Nombre</label>
                      <input className={inputCls} value={s.nombre} onChange={e => actualizarSector(s.id, { nombre: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] text-ink-700/60 mb-1">Tipo</label>
                      <select className={inputCls} value={s.tipo} onChange={e => actualizarSector(s.id, { tipo: e.target.value as TipoSector })}>
                        {(Object.entries(TIPOS_SECTOR) as [TipoSector, typeof TIPOS_SECTOR[TipoSector]][]).map(([key, inf]) => (
                          <option key={key} value={key}>{inf.icono} {inf.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-ink-700/60 mb-1">Color personalizado</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={s.color ?? TIPOS_SECTOR[s.tipo].color}
                          onChange={e => actualizarSector(s.id, { color: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border border-bone-200 p-0.5 bg-white"
                        />
                        <span className="text-[10px] font-mono text-ink-700/50">{s.color ?? TIPOS_SECTOR[s.tipo].color}</span>
                        {s.color && (
                          <button
                            onClick={() => actualizarSector(s.id, { color: undefined })}
                            className="text-[10px] text-ink-700/40 hover:text-ink-700 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> restaurar
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-ink-700/60 mb-1">Notas</label>
                      <textarea className={inputCls + ' resize-none'} rows={2} value={s.notas} onChange={e => actualizarSector(s.id, { notas: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sectores.length === 0 && !modoSector && (
        <p className="text-xs text-ink-700/50 text-center py-2">
          Usá el botón de arriba para marcar sectores en el mapa.
        </p>
      )}
    </div>
  );
}
