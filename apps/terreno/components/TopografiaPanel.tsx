'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Mountain, Loader2, ArrowDown, ArrowRight, Grid3x3 } from 'lucide-react';
import { obtenerTopografia, topografiaConGrillaDensa, type DatosTopografia } from '@/lib/topografia';
import type { DatosShader } from '@/lib/shaders';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:  Mojon[];
  datos:    DatosTopografia | null;
  onDatos:  (d: DatosTopografia) => void;
  cargando: boolean;
  onCargando: (v: boolean) => void;
  error:    string | null;
  onError:  (e: string | null) => void;
  /** Motor único de relieve: computa la grilla densa y la enciende en el plano. */
  onFetchShader: () => void;
  shaderCargando: boolean;
  /**
   * El relieve denso, cuando ya está calculado.
   *
   * Las estadísticas del panel tienen que salir de acá y no de la muestra de
   * puntos. Mientras el panel no lo recibía, la app calculaba el relieve denso
   * en el mismo clic, dibujaba curvas rotuladas 420 y 440 m, y al lado informaba
   * un máximo de 391 m sacado de otros diecisiete puntos: en ese predio el
   * máximo real eran 442 m y la pendiente general pasaba de 20,2 % a 30,4 %.
   *
   * Entra como prop y no como valor de retorno del cálculo porque así cubre los
   * dos órdenes: el relieve puede estar calculado desde antes —el usuario lo
   * prendió en Capas— y entonces el panel tiene que usarlo sin volver a pedirlo.
   */
  shader:   DatosShader | null;
}

export function TopografiaPanel({ mojones, datos, onDatos, cargando, onCargando, error, onError, onFetchShader, shaderCargando, shader }: Props) {
  const handleCargar = useCallback(async () => {
    onCargando(true);
    onError(null);
    // Dispara la grilla densa (shader + curvas) en paralelo: es la misma fuente
    // cacheada, y deja el relieve activo en el plano de una. Cuando llegue, el
    // efecto de abajo mejora las estadísticas con ella.
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

  /**
   * Cuando el relieve denso está, las estadísticas se recalculan con él.
   *
   * El `ref` no es ceremonia: sin él, mejorar `datos` dispara el efecto de
   * nuevo. Guardar qué shader se usó corta el lazo y además deja que un shader
   * NUEVO —otros mojones, otra resolución— vuelva a mejorar un dato que ya
   * estaba mejorado.
   */
  const shaderUsado = useRef<DatosShader | null>(null);
  useEffect(() => {
    if (!shader || !datos) return;
    if (shaderUsado.current === shader && datos.base === 'grilla_densa') return;
    shaderUsado.current = shader;
    const mejor = topografiaConGrillaDensa(datos, shader);
    if (mejor !== datos) onDatos(mejor);
  }, [shader, datos, onDatos]);

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
          <p className="text-xs text-ink-700/50 mt-0.5">{datos ? datos.resolucion : 'Mejor modelo disponible del lugar'} · enciende relieve + curvas</p>
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
          {/* De dónde salen estos números. Va ARRIBA de las tarjetas porque
              cambia cómo se leen: una muestra de ~90 puntos sobre 400 ha puede
              saltearse el pico, y eso no se puede dejar implícito. */}
          <BaseDelDato datos={datos} />

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-2 gap-2">
            <TopoCard label="Elevación mín." value={`${datos.elev_min.toFixed(0)} m`}  sub="s.n.m." />
            <TopoCard label="Elevación máx." value={`${datos.elev_max.toFixed(0)} m`}  sub="s.n.m." />
            <TopoCard label="Desnivel"        value={`${datos.desnivel.toFixed(1)} m`} sub="max − min" />
            <TopoCard label="Elev. media"     value={`${datos.elev_media.toFixed(0)} m`}
                      sub={datos.base === 'grilla_densa' ? 'del predio' : 'de la muestra'} />
          </div>

          {/* Pendiente y orientación */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
              Pendiente y escurrimiento
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                {/* «General» y no «media»: es el desnivel entre la punta más
                    alta y la más baja sobre la distancia entre ellas. La media
                    de las pendientes celda a celda es otro número —más grande,
                    porque las ondas del terreno no se cancelan— y se usa en el
                    aviso de corrimiento de las curvas. Llamarlas igual hacía que
                    la pantalla mostrara 3,2 % y 6,9 % con el mismo nombre. */}
                <span className="text-ink-700/60">Pendiente general</span>
                <p className="font-mono font-bold text-sm text-ink-900">
                  {datos.pendiente_pct.toFixed(1)}%
                </p>
                <p className="text-ink-700/50">
                  {datos.pendiente_grados.toFixed(1)}° · de la punta más alta a la más baja
                </p>
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
              Resolución {datos.resolucion}. Puede diferir de la topografía
              actual. No apto para diseño de obras sin relevamiento GPS
              profesional.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── De dónde salen las estadísticas ─────────────────────────────────────────

/**
 * Dice si los números de arriba salen del relieve denso o de una muestra.
 *
 * Es la regla del silencio aplicada al revés: no se oculta la ausencia, se
 * nombra el alcance. El caso que lo pide es medido —en un predio de 417,8 ha la
 * muestra daba 391 m de máximo y el relieve denso 441, con el pico adentro del
 * perímetro— y lo peor no era el rótulo sino la pendiente general, que sale de
 * esos mismos dos puntos: 20,2 % contra 30,8 %.
 */
function BaseDelDato({ datos }: { datos: DatosTopografia }) {
  const denso = datos.base === 'grilla_densa';
  return (
    <div className={`rounded-lg px-2.5 py-2 text-[11px] leading-relaxed flex items-start gap-1.5 ${
      denso ? 'bg-moss-700/8 text-ink-700/80' : 'bg-clay-700/8 text-ink-700/80'}`}>
      {denso
        ? <Grid3x3 className="w-3 h-3 text-moss-700 shrink-0 mt-0.5" />
        : <Mountain className="w-3 h-3 text-clay-700 shrink-0 mt-0.5" />}
      <span>
        {denso ? (
          <>
            Medido sobre{' '}
            <span className="font-mono font-medium text-ink-900">
              {(datos.celdas_densas ?? 0).toLocaleString('es-AR')}
            </span>{' '}
            celdas del relieve que caen adentro del perímetro. Es el mismo relieve que dibuja las
            curvas de nivel, así que el máximo de acá y el rótulo de la curva más alta coinciden.
          </>
        ) : (
          <>
            <span className="font-medium text-ink-900">Es una muestra</span> de{' '}
            <span className="font-mono font-medium text-ink-900">{datos.muestra_n ?? '—'}</span>{' '}
            puntos —los mojones, el centro y una grilla interior—, no el relieve completo: un pico o
            una vaguada entre dos puntos no aparece, y la pendiente general sale de los dos extremos
            de esa muestra. Calculá el relieve para que estos números salgan de todas las celdas.
          </>
        )}
      </span>
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
