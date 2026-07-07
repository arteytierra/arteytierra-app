'use client';

import { useCallback } from 'react';
import { Layers, MapPin, Droplets, Waves } from 'lucide-react';
import { obtenerSuelo, type DatosSuelo, type InterpItem, type CapaSuelo } from '@/lib/suelos';
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

              {/* Perfil vertical 0–200 cm */}
              {datos.perfil?.length > 0 && <PerfilSueloChart perfil={datos.perfil} />}

              {/* Agua útil */}
              {datos.agua_util && (
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-moss-700" /> Agua útil disponible
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    datos.agua_util.color === 'verde' ? 'bg-moss-50 text-moss-700' :
                    datos.agua_util.color === 'amarillo' ? 'bg-sun-300/30 text-clay-700' : 'bg-clay-100 text-clay-700'
                  }`}>
                    {datos.agua_util.clase}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-bone-50 rounded-lg p-2">
                    <p className="text-[9px] text-ink-700/60">0–100 cm · zona radicular</p>
                    <p className="font-mono text-sm font-bold text-moss-700">{datos.agua_util.total_mm_100} mm</p>
                  </div>
                  <div className="bg-bone-50 rounded-lg p-2">
                    <p className="text-[9px] text-ink-700/60">0–200 cm · perfil total</p>
                    <p className="font-mono text-sm font-bold text-ink-900">{datos.agua_util.total_mm_200} mm</p>
                  </div>
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">{datos.agua_util.descripcion}</p>
              </div>
              )}

              {/* Grupo hidrológico SCS */}
              {datos.grupo_hidro && (
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
                <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-moss-700" /> Grupo hidrológico (SCS)
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold font-mono leading-none ${
                    datos.grupo_hidro.grupo === 'A' ? 'text-moss-700' :
                    datos.grupo_hidro.grupo === 'B' ? 'text-moss-900' :
                    datos.grupo_hidro.grupo === 'C' ? 'text-clay-700' : 'text-clay-700'
                  }`}>
                    {datos.grupo_hidro.grupo}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-800">Infiltración {datos.grupo_hidro.infiltracion.toLowerCase()}</p>
                    <p className="font-mono text-[10px] text-ink-700/60">
                      Ksat mín {datos.grupo_hidro.ksat_min} mm/h · capa {datos.grupo_hidro.capa_limitante}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">{datos.grupo_hidro.descripcion}</p>
                <p className="text-[10px] text-ink-700/50 bg-bone-50 rounded-lg p-1.5">
                  CN referencia (pastura en buen estado): <span className="font-mono font-semibold text-ink-800">{datos.grupo_hidro.cn_pastura}</span> — base para cálculo de escorrentía y diseño hidrológico.
                </p>
              </div>
              )}

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

// Color de banda según composición textural (perfil vertical).
function colorTextura(c: CapaSuelo): string {
  if (c.arena >= 65)   return '#e0cfa0';  // arenoso
  if (c.arcilla >= 40) return '#b5765a';  // arcilloso
  if (c.arcilla >= 27) return '#c39070';  // franco-arcilloso
  if (c.limo >= 50)    return '#cbb489';  // franco-limoso
  return '#a8ad7a';                         // franco
}

function PerfilSueloChart({ perfil }: { perfil: CapaSuelo[] }) {
  const H = 232, top = 6;
  const cmToPx = (H - top * 2) / 200;
  const yTop = (cm: number) => top + cm * cmToPx;

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
      <p className="text-xs font-medium text-ink-700">Perfil del suelo · 0–200 cm</p>
      <div className="flex gap-3">
        {/* Columna a escala de profundidad */}
        <svg viewBox={`0 0 60 ${H}`} width={56} height={H} className="shrink-0">
          {perfil.map((c, i) => {
            const y = yTop(c.prof_top);
            const h = (c.prof_bot - c.prof_top) * cmToPx;
            return (
              <rect key={i} x={16} y={y} width={40} height={h}
                fill={colorTextura(c)} stroke="#fff" strokeWidth={0.75} />
            );
          })}
          {[0, 30, 60, 100, 200].map(d => (
            <g key={d}>
              <line x1={12} x2={16} y1={yTop(d)} y2={yTop(d)} stroke="#9a958c" strokeWidth={0.75} />
              <text x={10} y={yTop(d) + 3} textAnchor="end" fontSize={7.5} fill="#9a958c" fontFamily="monospace">{d}</text>
            </g>
          ))}
        </svg>

        {/* Detalle por capa */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {perfil.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colorTextura(c) }} />
              <span className="font-mono text-ink-700/70 w-[52px] shrink-0">{c.label}</span>
              <span className="flex-1 truncate text-ink-800" title={c.clase_textura}>{c.clase_textura}</span>
              <span className="font-mono text-moss-700 shrink-0 w-12 text-right">{c.awc_mm} mm</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[9px] text-ink-700/50 leading-relaxed">
        Franja izquierda a escala de profundidad (cm). Color por textura; mm = agua útil de cada capa.
      </p>
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
