'use client';

import { useCallback } from 'react';
import { Mountain, Loader2, ArrowDown, ArrowRight } from 'lucide-react';
import { obtenerTopografia, type DatosTopografia } from '@/lib/topografia';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:  Mojon[];
  datos:    DatosTopografia | null;
  onDatos:  (d: DatosTopografia) => void;
  cargando: boolean;
  onCargando: (v: boolean) => void;
  error:    string | null;
  onError:  (e: string | null) => void;
  /** Motor único de relieve: computa la grilla densa (shader alt./pend. + hipsométrico)
   *  y enciende en el plano el shader de altimetría con las curvas en auto. */
  onFetchShader: () => void;
  shaderCargando: boolean;
}

export function TopografiaPanel({ mojones, datos, onDatos, cargando, onCargando, error, onError, onFetchShader, shaderCargando }: Props) {
  const handleCargar = useCallback(async () => {
    onCargando(true);
    onError(null);
    // Dispara la grilla densa (shader + curvas) en paralelo: es la misma fuente
    // Terrarium cacheada, y deja el relieve activo en el plano de una.
    onFetchShader();
    try {
      const data = await obtenerTopografia(mojones);
      onDatos(data);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error al obtener elevaciones.');
    } finally {
      onCargando(false);
    }
  }, [mojones, onDatos, onCargando, onError, onFetchShader]);

  const ocupado = cargando || shaderCargando;

  if (mojones.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <Mountain className="w-8 h-8 text-moss-700/40 mx-auto mb-2" />
        <p className="text-xs text-ink-700/50 leading-relaxed">
          Agregá mojones para consultar la elevación y pendiente del terreno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón + fuente */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
            Topografía
          </p>
          <p className="text-xs text-ink-700/50 mt-0.5">SRTM 30m · NASA · enciende relieve + curvas</p>
        </div>
        <button
          onClick={handleCargar}
          disabled={ocupado}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          {ocupado
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Mountain className="w-3 h-3" />}
          {ocupado ? 'Analizando…' : datos ? 'Actualizar' : 'Analizar relieve'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-danger-500 bg-danger-500/8 px-3 py-2 rounded-lg">{error}</p>
      )}

      {datos && (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-2 gap-2">
            <TopoCard label="Elevación mín." value={`${datos.elev_min.toFixed(0)} m`}  sub="s.n.m." />
            <TopoCard label="Elevación máx." value={`${datos.elev_max.toFixed(0)} m`}  sub="s.n.m." />
            <TopoCard label="Desnivel"        value={`${datos.desnivel.toFixed(1)} m`} sub="max − min" />
            <TopoCard label="Elev. media"     value={`${datos.elev_media.toFixed(0)} m`} sub="centroide" />
          </div>

          {/* Pendiente y orientación */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
              Pendiente y escurrimiento
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-ink-700/60">Pendiente media</span>
                <p className="font-mono font-bold text-sm text-ink-900">
                  {datos.pendiente_pct.toFixed(1)}%
                </p>
                <p className="text-ink-700/50">{datos.pendiente_grados.toFixed(1)}°</p>
              </div>
              <div>
                <span className="text-ink-700/60">Dirección escurrimiento</span>
                <p className="font-mono font-bold text-sm text-ink-900 flex items-center gap-1">
                  <ArrowDown className="w-3 h-3 text-water-500" />
                  {datos.orientacion}
                </p>
                <p className="text-ink-700/50">agua fluye hacia {datos.orientacion}</p>
              </div>
            </div>

            {/* De dónde a dónde */}
            <div className="bg-bone-50 rounded-lg p-2 text-xs text-ink-700/70 flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3 text-moss-700 shrink-0" />
              <span>
                Punto más alto:{' '}
                <span className="font-mono font-medium text-ink-900">
                  {datos.escurrimiento.desde.etiqueta}
                </span>
                {' '}({datos.escurrimiento.desde.elevation.toFixed(0)} m) →{' '}
                más bajo:{' '}
                <span className="font-mono font-medium text-ink-900">
                  {datos.escurrimiento.hacia.etiqueta}
                </span>
                {' '}({datos.escurrimiento.hacia.elevation.toFixed(0)} m)
              </span>
            </div>
          </div>

          {/* Perfil de elevación por mojón */}
          <ElevacionChart puntos={datos.puntos} />

          {/* Nota de precisión */}
          <div className="text-xs text-ink-700/50 leading-relaxed pt-1 border-t border-bone-200">
            <p>📡 {datos.fuente}</p>
            <p className="mt-1 italic">
              Resolución {datos.resolucion}. Datos de 2000 — pueden diferir
              de la topografía actual. No apto para diseño de obras sin
              relevamiento GPS profesional.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tarjeta de stat ──────────────────────────────────────────────────────────

function TopoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-bone-200">
      <p className="text-xs text-moss-700 mb-1">{label}</p>
      <p className="font-mono text-sm font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-700/50">{sub}</p>
    </div>
  );
}

// ─── Gráfico de barras: elevación por mojón ───────────────────────────────────

function ElevacionChart({ puntos }: { puntos: DatosTopografia['puntos'] }) {
  if (puntos.length === 0) return null;

  const elevs  = puntos.map(p => p.elevation);
  const minE   = Math.min(...elevs);
  const maxE   = Math.max(...elevs);
  const rango  = maxE - minE || 1;
  const HEIGHT = 64;

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200">
        <p className="text-xs font-medium text-ink-700">Perfil de elevación (mojones)</p>
      </div>
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-end gap-1" style={{ height: HEIGHT }}>
          {puntos.map((p, i) => {
            const h = ((p.elevation - minE) / rango) * (HEIGHT - 10) + 10;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5"
                title={`M${p.etiqueta}: ${p.elevation.toFixed(0)} m`}>
                <span className="text-[9px] font-mono text-ink-700/70 leading-none">
                  {p.elevation.toFixed(0)}
                </span>
                <div
                  className="w-full bg-moss-700 rounded-t-sm"
                  style={{ height: h - 12 }}
                />
              </div>
            );
          })}
        </div>
        {/* Etiquetas */}
        <div className="flex mt-0.5">
          {puntos.map((p, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-ink-700/50">{p.etiqueta}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-ink-700/40 mt-0.5">
          <span>min {minE.toFixed(0)} m</span>
          <span>max {maxE.toFixed(0)} m</span>
        </div>
      </div>
    </div>
  );
}
