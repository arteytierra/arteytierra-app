'use client';

import { useCallback } from 'react';
import { Layers, MapPin } from 'lucide-react';
import { obtenerSuelo, type DatosSuelo, type InterpItem } from '@/lib/suelos';
import { centroide } from '@/lib/clima';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:    Mojon[];
  datos:      DatosSuelo | null;
  onDatos:    (d: DatosSuelo) => void;
  cargando:   boolean;
  onCargando: (v: boolean) => void;
  error:      string | null;
  onError:    (e: string | null) => void;
}

export function SuelosPanel({
  mojones, datos, onDatos, cargando, onCargando, error, onError,
}: Props) {

  const centro = mojones.length > 0 ? centroide(mojones) : null;

  const handleAnalizar = useCallback(async () => {
    if (!centro) return;
    onCargando(true);
    onError(null);
    try {
      const d = await obtenerSuelo(centro.lat, centro.lng);
      onDatos(d);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error al consultar SoilGrids');
    } finally {
      onCargando(false);
    }
  }, [centro, onDatos, onCargando, onError]);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Análisis de suelo
      </p>

      {/* ── Sin mojones ──────────────────────────────────────────────────────── */}
      {!centro ? (
        <div className="text-center py-8 px-4 space-y-2">
          <MapPin className="w-8 h-8 text-moss-700/40 mx-auto" />
          <p className="text-xs text-ink-700/60">
            Agregá mojones al terreno para analizar su suelo.
          </p>
        </div>
      ) : (
        <>
          {/* Encabezado del análisis */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs text-ink-700/60">
              Centroide del predio
            </p>
            <p className="font-mono text-xs text-ink-900">
              {centro.lat.toFixed(5)}, {centro.lng.toFixed(5)}
            </p>
            <p className="text-[10px] text-ink-700/50 leading-relaxed">
              Fuente: ISRIC SoilGrids v2.0 · 0–5 cm · ~250 m resolución.
              Valores orientativos — no reemplazan análisis de laboratorio.
            </p>
            <button
              onClick={handleAnalizar}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              {cargando ? 'Consultando SoilGrids…' : datos ? 'Actualizar datos' : 'Analizar suelo'}
            </button>
            {error && (
              <p className="text-xs text-clay-700 bg-clay-100 rounded-lg p-2">{error}</p>
            )}
          </div>

          {/* ── Resultados ───────────────────────────────────────────────────── */}
          {datos && !cargando && (
            <>
              {/* Propiedades principales */}
              <div className="grid grid-cols-2 gap-2">
                <SueloStat label="pH" value={datos.ph.toFixed(1)} interp={datos.interp.ph} />
                <SueloStat label="Carbono org." value={`${datos.carbono_org.toFixed(1)} g/kg`} interp={datos.interp.carbono} />
                <SueloStat label="Fertilidad" value={datos.interp.fertilidad.clase} interp={datos.interp.fertilidad} />
                <SueloStat label="Densidad ap." value={`${datos.densidad_ap.toFixed(2)} g/cm³`} interp={null} />
              </div>

              {/* Textura */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <p className="text-xs font-medium text-ink-700">Textura del suelo</p>
                <p className="font-mono text-base font-bold text-ink-900">
                  {datos.clase_textura}
                </p>
                <div className="space-y-1">
                  <TexturaBar label="Arcilla" valor={datos.arcilla} color="bg-clay-500" />
                  <TexturaBar label="Limo"    valor={datos.limo}    color="bg-sun-500" />
                  <TexturaBar label="Arena"   valor={datos.arena}   color="bg-bone-400" />
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">
                  {datos.interp.textura.descripcion}
                </p>
              </div>

              {/* Nitrógeno */}
              <div className="bg-white rounded-xl border border-bone-200 p-3">
                <p className="text-xs font-medium text-ink-700 mb-1">Nitrógeno total</p>
                <p className="font-mono text-sm font-bold text-ink-900">
                  {datos.nitrogeno.toFixed(2)} g/kg
                </p>
                <p className="text-[10px] text-ink-700/50 mt-0.5">
                  {datos.nitrogeno >= 1 ? 'Nivel adecuado' : datos.nitrogeno >= 0.5 ? 'Nivel medio — incorporar leguminosas' : 'Nivel bajo — enriquecer con N orgánico'}
                </p>
              </div>

              {/* Recomendaciones */}
              <div className="bg-moss-50 rounded-xl border border-moss-200 p-3 space-y-1.5">
                <p className="text-xs font-medium text-moss-900">Recomendaciones</p>
                {datos.interp.recomendaciones.map((r, i) => (
                  <p key={i} className="text-xs text-moss-700 flex gap-1.5">
                    <span className="shrink-0 mt-0.5">→</span>
                    {r}
                  </p>
                ))}
              </div>

              <p className="text-[9px] text-ink-700/40 italic">{datos.fuente}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Componentes internos ─────────────────────────────────────────────────────

function SueloStat({
  label, value, interp,
}: {
  label: string;
  value: string;
  interp: InterpItem | null;
}) {
  const colorMap = {
    verde:    'bg-moss-50 border-moss-200',
    amarillo: 'bg-sun-300/20 border-sun-300',
    rojo:     'bg-clay-100 border-clay-200',
  };
  const txtMap = {
    verde: 'text-moss-700', amarillo: 'text-clay-700', rojo: 'text-clay-700',
  };
  const cls   = interp ? colorMap[interp.color] : 'bg-white border-bone-200';
  const txtcl = interp ? txtMap[interp.color] : 'text-ink-900';

  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] text-ink-700/60 mb-0.5">{label}</p>
      <p className={`font-mono text-sm font-bold leading-tight ${txtcl}`}>{value}</p>
      {interp && (
        <p className={`text-[9px] mt-0.5 ${txtcl} opacity-80`}>{interp.clase}</p>
      )}
    </div>
  );
}

function TexturaBar({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-ink-700/60 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-bone-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(valor, 100)}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-ink-700/70 w-8 text-right">{valor.toFixed(0)}%</span>
    </div>
  );
}
