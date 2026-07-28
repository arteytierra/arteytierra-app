'use client';

/**
 * Cuenca de aporte (B2). El usuario marca un punto de salida en el mapa; la
 * cuenca aguas-arriba se delinea sobre la grilla densa (D8). Con el grupo
 * hidrológico (A4) y la cobertura se calcula la curva número, el escurrimiento
 * por el método SCS para una tormenta de diseño, el caudal pico y el ancho de
 * vertedero.
 */
import { useMemo, useState, useEffect } from 'react';
import { Waves, MousePointerClick, Trash2, TriangleAlert } from 'lucide-react';
import {
  analizarCuenca, COBERTURAS, type Cuenca, type GrupoHidro,
} from '@/lib/cuenca';

interface Props {
  tieneShader: boolean;
  cuenca:      Cuenca | null;
  grupoHidro:  GrupoHidro | null;   // de A4 (SuelosPanel), si está
  precipT10:   number | null;       // tormenta de diseño T10 de A3 (extremos), si está
  modoActivo:  boolean;
  cargando?:   boolean;             // delineación adaptativa en curso
  aviso?:      string | null;       // cuenca incompleta / sin resultado
  onMarcar:    () => void;
  onLimpiar:   () => void;
  onIrATopo:   () => void;
}

export function CuencaPanel({ tieneShader, cuenca, grupoHidro, precipT10, modoActivo, cargando, aviso, onMarcar, onLimpiar, onIrATopo }: Props) {
  const [coberturaId, setCoberturaId] = useState('pastura_regular');
  const [grupo, setGrupo]     = useState<GrupoHidro>(grupoHidro ?? 'B');
  const [precip, setPrecip]   = useState(precipT10 ? String(precipT10) : '75');
  const [head, setHead]       = useState('0.3');

  // Autocompleta la tormenta de diseño con el T10 de A3 cuando llega.
  useEffect(() => { if (precipT10) setPrecip(String(precipT10)); }, [precipT10]);

  const cobertura = COBERTURAS.find(c => c.id === coberturaId)!;
  const cn = cobertura.cn[grupo];

  const resultado = useMemo(() =>
    cuenca ? analizarCuenca(cuenca, cn, parseFloat(precip) || 0, parseFloat(head) || 0.3) : null,
    [cuenca, cn, precip, head],
  );

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Cuenca de aporte
      </p>

      {!tieneShader ? (
        <div className="text-center py-8 px-4 space-y-2">
          <Waves className="w-8 h-8 text-moss-700/40 mx-auto" />
          <p className="text-xs text-ink-700/60">
            Necesitás el relieve cargado. Andá a Topografía y generá la grilla de elevación.
          </p>
          <button onClick={onIrATopo} className="text-xs text-moss-700 hover:text-moss-900 underline">
            Ir a Topografía
          </button>
        </div>
      ) : (
        <>
          {/* Marcar salida */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <button
              onClick={onMarcar}
              disabled={cargando}
              className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 ${
                modoActivo ? 'bg-clay-600 text-bone-50' : 'bg-moss-700 hover:bg-moss-900 text-bone-50'
              }`}
            >
              {cargando
                ? <><span className="w-3.5 h-3.5 border-2 border-bone-50 border-t-transparent rounded-full animate-spin" />Calculando cuenca…</>
                : <><MousePointerClick className="w-3.5 h-3.5" />{modoActivo ? 'Hacé clic en el punto de salida…' : cuenca ? 'Marcar otra salida' : 'Marcar punto de salida'}</>}
            </button>
            <p className="text-[10px] text-ink-700/55 leading-relaxed">
              Marcá dónde cierra la cuenca (donde iría la represa o el cruce de camino). El clic se ajusta al cauce más cercano y sube hasta la divisoria, aunque pase los límites del terreno.
            </p>
            {aviso && (
              <p className="text-[10px] text-clay-800 bg-clay-600/10 border border-clay-600/25 rounded-lg px-2.5 py-1.5 flex gap-1.5 leading-relaxed">
                <TriangleAlert className="w-3.5 h-3.5 shrink-0 text-clay-700 mt-px" />
                {aviso}
              </p>
            )}
            {cuenca && (
              <button onClick={onLimpiar} className="text-[10px] text-clay-700 hover:text-clay-900 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Borrar cuenca
              </button>
            )}
          </div>

          {cuenca && (
            <>
              {/* Geometría */}
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Área de cuenca" value={`${cuenca.area_ha} ha`} />
                <Stat label="Recorrido de flujo" value={`${cuenca.long_flujo_m} m`} />
                <Stat label="Desnivel" value={`${cuenca.elev_max - cuenca.elev_salida} m`} sub={`${cuenca.elev_salida}–${cuenca.elev_max} m`} />
                <Stat label="Pendiente media" value={`${(cuenca.pendiente_m_m * 100).toFixed(1)} %`} />
              </div>

              {/* Parámetros hidrológicos */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 grid grid-cols-2 gap-2.5">
                <Campo label="Cobertura del suelo">
                  <select value={coberturaId} onChange={e => setCoberturaId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white">
                    {COBERTURAS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </Campo>
                <Campo label="Grupo hidrológico">
                  <select value={grupo} onChange={e => setGrupo(e.target.value as GrupoHidro)}
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white">
                    {(['A', 'B', 'C', 'D'] as GrupoHidro[]).map(g => (
                      <option key={g} value={g}>{g}{grupoHidro === g ? ' (suelo)' : ''}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Tormenta diseño (mm)">
                  <input type="number" value={precip} onChange={e => setPrecip(e.target.value)} min="0" step="5"
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                </Campo>
                <Campo label="Carga s/ vertedero (m)">
                  <input type="number" value={head} onChange={e => setHead(e.target.value)} min="0.05" step="0.05"
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                </Campo>
              </div>

              {grupoHidro == null && (
                <p className="text-[10px] text-ink-700/55 flex gap-1.5">
                  <TriangleAlert className="w-3.5 h-3.5 shrink-0 text-sun-500" />
                  Analizá el suelo (pestaña Suelo) para autocompletar el grupo hidrológico. Mientras, elegilo a mano.
                </p>
              )}
              {precipT10 != null && (
                <p className="text-[10px] text-moss-700/80">
                  Tormenta autocompletada con el T10 de Clima → Extremos ({precipT10} mm). Podés poner el T100 para el evento extremo.
                </p>
              )}

              {/* Resultados */}
              {resultado && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat label="Curva número (CN)" value={String(resultado.cn)} color="moss" />
                    <Stat label="Escurrimiento" value={`${resultado.escurrimiento_mm} mm`} sub={`de ${resultado.precip_mm} mm`} />
                    <Stat label="Volumen escurrido" value={`${(resultado.volumen_m3 / 1000).toFixed(1)} dam³`} sub={`${resultado.volumen_m3.toLocaleString()} m³`} />
                    <Stat label="Tiempo concentr." value={`${resultado.tc_min} min`} />
                    <Stat label="Caudal pico" value={`${resultado.caudal_pico_m3s} m³/s`} color="agua" />
                    <Stat label="Ancho vertedero" value={`${resultado.vertedero_m} m`} sub={`carga ${resultado.head_vertedero_m} m`} color="agua" />
                  </div>
                  <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                    SCS-CN (AMC II) · caudal pico por hidrograma unitario triangular SCS · tc Kirpich ·
                    vertedero de cresta ancha (C=1.7). Cotas SRTM ~30 m. Diseño preliminar — verificá con estudio hidrológico local.
                  </p>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Internos ─────────────────────────────────────────────────────────────────

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-ink-700/60 block">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, color }: {
  label: string; value: string; sub?: string;
  color?: 'moss' | 'agua';
}) {
  const cls =
    color === 'moss' ? 'bg-moss-700 border-moss-700 text-bone-50' :
    color === 'agua' ? 'bg-[#1565C0] border-[#1565C0] text-bone-50' :
    'bg-white border-bone-200 text-ink-900';
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
