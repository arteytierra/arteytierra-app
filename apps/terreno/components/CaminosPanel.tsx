'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, PenLine, Check, X, RotateCcw, TrendingUp, Ruler, Maximize2, Loader2, Mountain } from 'lucide-react';
import { crearCamino, fetchPerfilElevacion, type Camino, type PerfilElevacion } from '@/lib/caminos';

interface ModoCamino {
  vertices: Array<{ lat: number; lng: number }>;
}

interface Props {
  caminos:           Camino[];
  onCaminos:         (c: Camino[]) => void;
  modoCamino:        ModoCamino | null;
  onIniciarDibujo:   () => void;
  onFinalizarCamino: (color?: string) => void;
  onCancelarCamino:  () => void;
  onAbrirPerfil?:    (camino: Camino) => void;
  perfilDockId?:     string | null;   // nombre del camino cuyo perfil está en el dock inferior
  perfilCargando?:   boolean;
  perfilError?:      string | null;
  onOptimizarCresta?: (camino: Camino) => Promise<{ ok: boolean; msg: string }>;
}

export function CaminosPanel({
  caminos, onCaminos, modoCamino,
  onIniciarDibujo, onFinalizarCamino, onCancelarCamino,
  onAbrirPerfil, perfilDockId = null, perfilCargando = false, perfilError = null,
  onOptimizarCresta,
}: Props) {
  const [editandoId,    setEditandoId]    = useState<string | null>(null);
  const [colorModo,     setColorModo]     = useState('#8B4513');
  const [perfilId,      setPerfilId]      = useState<string | null>(null);
  const [cargandoId,    setCargandoId]    = useState<string | null>(null);
  const [errorPerfil,   setErrorPerfil]   = useState<Record<string, string>>({});
  const [optimizandoId, setOptimizandoId] = useState<string | null>(null);
  const [optResultado,  setOptResultado]  = useState<Record<string, { ok: boolean; msg: string }>>({});

  const handleOptimizar = useCallback(async (camino: Camino) => {
    if (!onOptimizarCresta || optimizandoId) return;
    setOptimizandoId(camino.id);
    setOptResultado(prev => { const n = { ...prev }; delete n[camino.id]; return n; });
    try {
      const r = await onOptimizarCresta(camino);
      setOptResultado(prev => ({ ...prev, [camino.id]: r }));
    } catch {
      setOptResultado(prev => ({ ...prev, [camino.id]: { ok: false, msg: 'Error al trazar por crestas.' } }));
    } finally {
      setOptimizandoId(null);
    }
  }, [onOptimizarCresta, optimizandoId]);

  const eliminarCamino = useCallback((id: string) => {
    onCaminos(caminos.filter(c => c.id !== id));
    if (perfilId === id) setPerfilId(null);
  }, [caminos, onCaminos, perfilId]);

  const actualizarCamino = useCallback((id: string, campo: Partial<Camino>) => {
    onCaminos(caminos.map(c => c.id === id ? { ...c, ...campo } : c));
  }, [caminos, onCaminos]);

  const handleVerPerfil = useCallback(async (camino: Camino) => {
    if (perfilId === camino.id) { setPerfilId(null); return; }
    setPerfilId(camino.id);
    if (camino.perfil) return;

    setCargandoId(camino.id);
    setErrorPerfil(prev => { const n = { ...prev }; delete n[camino.id]; return n; });

    const resultado = await fetchPerfilElevacion(camino.vertices);
    setCargandoId(null);

    if ('error' in resultado) {
      setErrorPerfil(prev => ({ ...prev, [camino.id]: resultado.error }));
    } else {
      actualizarCamino(camino.id, { perfil: resultado.perfil });
    }
  }, [perfilId, actualizarCamino]);

  const inputCls = 'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Caminos y senderos
      </p>

      {/* ── Modo dibujo activo ───────────────────────────────────────────────── */}
      {modoCamino ? (
        <div className="bg-sun-300/20 rounded-xl border border-sun-300 p-3 space-y-2.5">
          <p className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
            <span style={{ color: colorModo }}>━</span> Trazando camino
          </p>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-ink-700/60 shrink-0">Color:</label>
            <input
              type="color"
              value={colorModo}
              onChange={e => setColorModo(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-bone-200 p-0.5 bg-white"
            />
            <button onClick={() => setColorModo('#8B4513')} className="text-ink-700/40 hover:text-ink-700 transition-colors">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <p className="text-[10px] text-ink-700/70">
            Hacé clic en el mapa para agregar puntos del recorrido.{' '}
            {modoCamino.vertices.length < 2
              ? `(${modoCamino.vertices.length}/2 mínimo)`
              : `${modoCamino.vertices.length} puntos — listo`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onFinalizarCamino(colorModo)}
              disabled={modoCamino.vertices.length < 2}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              Guardar camino ({modoCamino.vertices.length} pts.)
            </button>
            <button onClick={onCancelarCamino} className="px-3 py-1.5 bg-white border border-bone-200 hover:border-clay-300 text-ink-700 rounded-lg text-xs transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onIniciarDibujo}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-xl text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Trazar nuevo camino
        </button>
      )}

      {perfilError && (
        <p className="text-[10px] text-clay-600 bg-clay-50 rounded-lg px-2 py-1.5 leading-tight">Perfil interactivo: {perfilError}</p>
      )}

      {onOptimizarCresta && caminos.length > 0 && (
        <p className="text-[10px] text-ink-700/55 bg-moss-50/60 rounded-lg px-2 py-1.5 leading-tight flex items-start gap-1">
          <Mountain className="w-3 h-3 shrink-0 mt-0.5 text-moss-700" />
          <span>Con <span className="font-medium">⛰</span> optimizás el trazado entre el primer y último punto: va por crestas/parteaguas, con poca pendiente, y cruza las vertientes con puente/alcantarilla.</span>
        </p>
      )}

      {/* ── Lista de caminos ─────────────────────────────────────────────────── */}
      {caminos.length > 0 ? (
        <div className="space-y-2">
          {caminos.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-bone-200 overflow-hidden">
              {/* Cabecera */}
              <div className="flex items-center gap-2 p-2.5">
                <span
                  className="w-5 h-1.5 rounded-full shrink-0"
                  style={{ background: c.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-900 truncate">{c.nombre}</p>
                  <p className="text-[9px] text-ink-700/50">
                    {c.longitud_m != null ? `${c.longitud_m >= 1000 ? (c.longitud_m / 1000).toFixed(2) + ' km' : c.longitud_m + ' m'}` : '—'} · {c.vertices.length} pts.
                  </p>
                </div>
                {onOptimizarCresta && c.vertices.length >= 2 && (
                  <button
                    onClick={() => handleOptimizar(c)}
                    disabled={optimizandoId !== null}
                    className={`shrink-0 transition-colors disabled:opacity-40 ${optimizandoId === c.id ? 'text-moss-700' : 'text-ink-700/30 hover:text-moss-700'}`}
                    title="Optimizar por crestas / parteaguas (evita vertientes, poca pendiente)"
                  >
                    {optimizandoId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mountain className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => handleVerPerfil(c)}
                  className={`shrink-0 transition-colors ${perfilId === c.id ? 'text-water-600' : 'text-ink-700/30 hover:text-water-600'}`}
                  title="Ver perfil de elevación (en el panel)"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
                {onAbrirPerfil && (
                  <button
                    onClick={() => onAbrirPerfil(c)}
                    className={`shrink-0 transition-colors ${perfilDockId === c.nombre ? 'text-water-600' : 'text-ink-700/30 hover:text-water-600'}`}
                    title="Perfil interactivo abajo (cursor sincronizado con el mapa)"
                  >
                    {perfilCargando && perfilDockId !== c.nombre ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button onClick={() => setEditandoId(id => id === c.id ? null : c.id)} className="shrink-0 text-ink-700/30 hover:text-moss-700 transition-colors">
                  <PenLine className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => eliminarCamino(c.id)} className="shrink-0 text-ink-700/30 hover:text-clay-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Resultado de optimización por crestas */}
              {optResultado[c.id] && (
                <div className={`mx-2.5 mb-2.5 -mt-1 rounded-lg px-2 py-1.5 text-[10px] leading-tight ${optResultado[c.id]!.ok ? 'bg-moss-50 text-moss-800 border border-moss-200' : 'bg-clay-50 text-clay-700 border border-clay-200'}`}>
                  <span className="flex items-start gap-1">
                    <Mountain className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{optResultado[c.id]!.msg}</span>
                  </span>
                </div>
              )}

              {/* Perfil de elevación */}
              {perfilId === c.id && (
                <div className="border-t border-bone-200 p-3">
                  {cargandoId === c.id ? (
                    <div className="text-center py-4 space-y-1">
                      <div className="w-4 h-4 border-2 border-moss-700 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-ink-700/50">Consultando SRTM…</p>
                    </div>
                  ) : c.perfil ? (
                    <PerfilChart perfil={c.perfil} color={c.color} />
                  ) : errorPerfil[c.id] ? (
                    <div className="bg-clay-50 rounded-lg p-2.5 space-y-1">
                      <p className="text-xs font-medium text-clay-700">Error al obtener el perfil</p>
                      <p className="text-[10px] text-clay-600 font-mono break-all">{errorPerfil[c.id]}</p>
                      <button
                        onClick={() => handleVerPerfil(c)}
                        className="text-[10px] text-moss-700 hover:underline"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-700/50 text-center py-2">Hacé clic en 📈 para cargar.</p>
                  )}
                </div>
              )}

              {/* Edición */}
              {editandoId === c.id && (
                <div className="border-t border-bone-200 p-2.5 space-y-2">
                  <div>
                    <label className="block text-[10px] text-ink-700/60 mb-1">Nombre</label>
                    <input className={inputCls} value={c.nombre} onChange={e => actualizarCamino(c.id, { nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-700/60 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.color}
                        onChange={e => actualizarCamino(c.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-bone-200 p-0.5 bg-white"
                      />
                      <span className="text-[10px] font-mono text-ink-700/50">{c.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-700/60 mb-1">Notas</label>
                    <textarea className={inputCls + ' resize-none'} rows={2} value={c.notas} onChange={e => actualizarCamino(c.id, { notas: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !modoCamino && (
          <p className="text-xs text-ink-700/50 text-center py-4 leading-relaxed">
            Trazá caminos, senderos o accesos.<br />
            Podés ver el perfil de elevación de cada uno.
          </p>
        )
      )}
    </div>
  );
}

// ─── Gráfico de perfil ────────────────────────────────────────────────────────

function PerfilChart({ perfil, color }: { perfil: PerfilElevacion; color: string }) {
  const { puntos, elev_min, elev_max } = perfil;
  const rango = elev_max - elev_min || 1;
  const CHART_H = 80;

  // Construcción del path SVG
  const W = 280;
  const pts = puntos.map((p, i) => {
    const x = (i / (puntos.length - 1)) * W;
    const y = CHART_H - ((p.elevation - elev_min) / rango) * CHART_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD = `M${pts.join('L')}`;
  const fillD = `${pathD}L${W},${CHART_H}L0,${CHART_H}Z`;

  return (
    <div className="space-y-2">
      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Longitud', value: perfil.longitud_m >= 1000 ? `${(perfil.longitud_m/1000).toFixed(2)}km` : `${perfil.longitud_m}m` },
          { label: '↑ Subida', value: `${perfil.desnivel_pos}m` },
          { label: '↓ Bajada', value: `${perfil.desnivel_neg}m` },
          { label: 'Pendiente', value: `${perfil.pendiente_media_pct}%` },
        ].map(s => (
          <div key={s.label} className="bg-bone-50 rounded-lg p-1.5 text-center">
            <p className="text-[8px] text-ink-700/50">{s.label}</p>
            <p className="text-[10px] font-mono font-bold text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico SVG */}
      <div className="relative bg-bone-50 rounded-lg overflow-hidden" style={{ height: CHART_H + 20 }}>
        {/* Líneas de guía */}
        <svg width="100%" height={CHART_H + 20} viewBox={`0 0 ${W} ${CHART_H + 20}`} preserveAspectRatio="none" className="absolute inset-0">
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t} x1={0} y1={CHART_H * (1 - t)} x2={W} y2={CHART_H * (1 - t)} stroke="#e5e0d8" strokeWidth="0.5" />
          ))}
          <path d={fillD} fill={color} opacity="0.15" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
        {/* Etiquetas elevación */}
        <div className="absolute left-1 top-0.5 text-[8px] font-mono text-ink-700/40">{elev_max.toFixed(0)}m</div>
        <div className="absolute left-1 bottom-4 text-[8px] font-mono text-ink-700/40">{elev_min.toFixed(0)}m</div>
      </div>
      <p className="text-[9px] text-ink-700/40 italic">Perfil SRTM 30m — orientativo.</p>
    </div>
  );
}
