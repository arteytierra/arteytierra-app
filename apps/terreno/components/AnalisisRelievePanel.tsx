'use client';

/**
 * Análisis topográfico integral: en una sola pasada sobre la grilla de relieve
 * calcula y muestra JUNTOS los mejores sitios de represa (por eficiencia), las
 * zonas aptas para vivienda y los caminos de acceso por cresta que las conectan.
 * "Colocar en el plano" vuelca todo (pines + caminos + pins de cruce).
 */
import { useState, useCallback } from 'react';
import { Loader2, Mountain, Home, Droplets, Route, MapPin } from 'lucide-react';
import { analizarTopografiaIntegral, type AnalisisTopoIntegral } from '@/lib/cuencaHidro';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones: Mojon[];
  onAplicar: (res: AnalisisTopoIntegral) => void;
}

export function AnalisisRelievePanel({ mojones, onAplicar }: Props) {
  const [cargando, setCargando] = useState(false);
  const [res, setRes]           = useState<AnalisisTopoIntegral | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [colocado, setColocado] = useState(false);

  const analizar = useCallback(async () => {
    if (mojones.length < 3) { setError('Cargá el terreno (al menos 3 mojones) primero.'); return; }
    setCargando(true); setError(null); setRes(null); setColocado(false);
    try {
      const r = await analizarTopografiaIntegral(mojones);
      if (!r) { setError('No se pudo analizar el relieve (sin datos de elevación).'); return; }
      setRes(r);
      if (r.represas.length === 0 && r.viviendas.length === 0) {
        setError('El relieve es muy plano o uniforme: sin sugerencias claras.');
      }
    } catch {
      setError('Hubo un error al analizar el relieve. Reintentá.');
    } finally {
      setCargando(false);
    }
  }, [mojones]);

  const totalCruces = res?.caminos.reduce((s, c) => s + c.camino.cruces.length, 0) ?? 0;

  return (
    <div className="space-y-2">
      <button
        onClick={analizar}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-ink-950 hover:bg-ink-700 disabled:opacity-50 text-bone-50 rounded-xl text-xs font-medium transition-colors"
      >
        {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mountain className="w-3.5 h-3.5" />}
        {cargando ? 'Analizando el relieve…' : 'Analizar relieve completo'}
      </button>
      <p className="text-[10px] text-ink-700/55 leading-relaxed">
        En una pasada: mejores <span className="text-water-700 font-medium">represas</span>, zonas de <span className="text-moss-700 font-medium">vivienda</span> y <span className="text-orange-700 font-medium">caminos</span> de acceso por cresta que las conectan.
      </p>

      {error && <p className="text-[10px] text-clay-700 leading-relaxed">{error}</p>}

      {res && (res.represas.length > 0 || res.viviendas.length > 0) && (
        <div className="space-y-2">
          {/* Represas */}
          {res.represas.length > 0 && (
            <Grupo icono={<Droplets className="w-3.5 h-3.5 text-water-600" />} titulo={`Represas (${res.represas.length})`}>
              {res.represas.map((s, i) => (
                <Fila key={i} izq={`#${i + 1} · ef. ${s.eficiencia}:1`} der={`${(s.volumen_agua_m3 / 1000).toFixed(1)} dam³ · muro ${s.volumen_muro_m3.toLocaleString('es-AR')} m³`} />
              ))}
            </Grupo>
          )}
          {/* Viviendas */}
          {res.viviendas.length > 0 && (
            <Grupo icono={<Home className="w-3.5 h-3.5 text-moss-700" />} titulo={`Zonas de vivienda (${res.viviendas.length})`}>
              {res.viviendas.map((v, i) => (
                <Fila key={i} izq={`${i === 0 ? 'Mejor' : (i + 1) + '.ª'} · ${v.score}%`} der={`pend. ${v.pendiente_pct}% · ${v.motivos.slice(0, 2).join(', ')}`} />
              ))}
            </Grupo>
          )}
          {/* Caminos */}
          {res.caminos.length > 0 && (
            <Grupo icono={<Route className="w-3.5 h-3.5 text-orange-700" />} titulo={`Caminos por cresta (${res.caminos.length})`}>
              {res.caminos.map((c, i) => (
                <Fila key={i}
                  izq={c.destino}
                  der={`${c.camino.longitud_m >= 1000 ? (c.camino.longitud_m / 1000).toFixed(2) + ' km' : c.camino.longitud_m + ' m'} · pend. ${c.camino.pendiente_media_pct}%${c.camino.cruces.length ? ` · ${c.camino.cruces.length} cruce(s)` : ''}`} />
              ))}
              {totalCruces > 0 && (
                <p className="text-[9px] text-ink-700/50 px-0.5 pt-0.5">
                  Los caminos van por parteaguas y cruzan las vertientes con puente/alcantarilla (marcados con pin).
                </p>
              )}
            </Grupo>
          )}

          <button
            onClick={() => { onAplicar(res); setColocado(true); }}
            disabled={colocado}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-xl text-xs font-semibold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {colocado ? 'Colocado en el plano ✓' : 'Colocar todo en el plano'}
          </button>
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            Sobre SRTM ~30 m — orientativo. Verificá en campo antes de construir.
          </p>
        </div>
      )}
    </div>
  );
}

function Grupo({ icono, titulo, children }: { icono: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-1">
      <p className="text-[11px] font-semibold text-ink-900 flex items-center gap-1.5">{icono}{titulo}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Fila({ izq, der }: { izq: string; der: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[10px]">
      <span className="font-mono font-bold text-ink-900 shrink-0">{izq}</span>
      <span className="text-ink-700/60 text-right leading-tight">{der}</span>
    </div>
  );
}
