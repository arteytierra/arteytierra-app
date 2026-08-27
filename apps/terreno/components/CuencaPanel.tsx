'use client';

/**
 * Cuenca de aporte (B2). El usuario marca un punto de salida en el mapa; la
 * cuenca aguas-arriba se delinea sobre la grilla densa (D8). Con el grupo
 * hidrológico (A4) y la cobertura se calcula la curva número, el escurrimiento
 * por el método SCS para una tormenta de diseño, el caudal pico y el ancho de
 * vertedero.
 */
import { useMemo, useState, useEffect } from 'react';
import { Waves, MousePointerClick, Trash2, TriangleAlert, PenLine, Pencil, Maximize2 } from 'lucide-react';
import {
  analizarCuenca, COBERTURAS, type Cuenca, type GrupoHidro,
} from '@/lib/cuenca';
import { confianzaCuenca } from '@/lib/saludCalculo';
import { volumenM3, volumenEnLitros, caudalM3s, caudalEnLitros, duracionMin } from '@/lib/unidades';
import type { FuenteRelieve } from '@/lib/grillaElevacion';
import { SaludCalculo } from './SaludCalculo';

interface PoligonoOpcion { id: string; nombre: string; vertices: Array<{ lat: number; lng: number }> }

interface Props {
  tieneShader: boolean;
  cuenca:      Cuenca | null;
  grupoHidro:  GrupoHidro | null;   // de A4 (SuelosPanel), si está
  precipT10:   number | null;       // tormenta de diseño T10 de A3 (extremos), si está
  modoActivo:  boolean;
  cargando?:   boolean;             // delineación adaptativa en curso
  aviso?:      string | null;       // cuenca incompleta / sin resultado
  poligonos?:  PoligonoOpcion[];    // polígonos dibujados, para usar como cuenca manual
  expandida?:  boolean;             // la cuenca actual ya está extendida a la divisoria real
  fuenteDem?:  FuenteRelieve | null;// de qué DEM salió el relieve, para la salud del cálculo
  cnPredio?:   number | null;       // CN compuesto por cobertura satelital (H0), para contrastar
  onMarcar:    () => void;
  onLimpiar:   () => void;
  onIrATopo:   () => void;
  onUsarPoligono?: (vertices: Array<{ lat: number; lng: number }>) => void;
  onEditarCuenca?: () => void;      // materializa la cuenca calculada en un polígono editable
  onExtender?: () => void;          // recalcula hasta la divisoria real
}

export function CuencaPanel({ tieneShader, cuenca, grupoHidro, precipT10, modoActivo, cargando, aviso, poligonos = [], expandida, fuenteDem = null, cnPredio = null, onMarcar, onLimpiar, onIrATopo, onUsarPoligono, onEditarCuenca, onExtender }: Props) {
  const [coberturaId, setCoberturaId] = useState('pastura_regular');
  const [selManual, setSelManual] = useState('');
  const [grupo, setGrupo]     = useState<GrupoHidro>(grupoHidro ?? 'B');
  const [precip, setPrecip]   = useState(precipT10 ? String(precipT10) : '75');
  const [head, setHead]       = useState('0.3');

  // Autocompleta la tormenta de diseño con el T10 de A3 cuando llega.
  useEffect(() => { if (precipT10) setPrecip(String(precipT10)); }, [precipT10]);
  // Ídem el grupo hidrológico cuando termina el análisis de suelo: sin esto el
  // CN seguía saliendo del grupo B por defecto aunque el perfil dijera otra cosa.
  useEffect(() => { if (grupoHidro) setGrupo(grupoHidro); }, [grupoHidro]);

  const cobertura = COBERTURAS.find(c => c.id === coberturaId)!;
  const cn = cobertura.cn[grupo];

  const resultado = useMemo(() =>
    cuenca ? analizarCuenca(cuenca, cn, parseFloat(precip) || 0, parseFloat(head) || 0.3) : null,
    [cuenca, cn, precip, head],
  );

  // La tormenta cuenta como dato del lugar sólo mientras no la hayas tocado.
  const precipDeClima = precipT10 != null && Math.abs((parseFloat(precip) || 0) - precipT10) < 0.5;

  const salud = useMemo(() =>
    cuenca && resultado
      ? confianzaCuenca({
          area_ha: cuenca.area_ha, long_flujo_m: cuenca.long_flujo_m,
          cn: resultado.cn, precip_mm: resultado.precip_mm,
          escurrimiento_mm: resultado.escurrimiento_mm,
          precipDeClima, grupoDeSuelo: grupoHidro != null && grupo === grupoHidro,
          expandida: !!expandida, fuenteDem, cnPredio,
          duracion_min: resultado.duracion_min, intensidad_mm_h: resultado.intensidad_mm_h,
        })
      : null,
    [cuenca, resultado, precipDeClima, grupoHidro, grupo, expandida, fuenteDem, cnPredio],
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

          {/* Cuenca a mano / editar la calculada (A2) */}
          {(onUsarPoligono || onEditarCuenca) && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
              <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide flex items-center gap-1">
                <PenLine className="w-3 h-3" /> A mano
              </p>
              {onUsarPoligono && (
                poligonos.length === 0 ? (
                  <p className="text-[10px] text-ink-700/55 leading-relaxed">
                    Dibujá un polígono con la herramienta de dibujo (o editá la calculada) y elegilo acá para usarlo como cuenca.
                  </p>
                ) : (
                  <>
                    <select
                      value={selManual}
                      onChange={e => setSelManual(e.target.value)}
                      className="w-full text-xs bg-white border border-bone-200 rounded-lg px-2 py-1.5 text-ink-900 focus:outline-none focus:border-moss-500"
                    >
                      <option value="">Elegí un polígono dibujado…</option>
                      {poligonos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <button
                      onClick={() => { const p = poligonos.find(x => x.id === selManual); if (p) onUsarPoligono(p.vertices); }}
                      disabled={!selManual || cargando}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 transition-colors"
                    >
                      <Waves className="w-3.5 h-3.5" /> Usar como cuenca de aporte
                    </button>
                  </>
                )
              )}
              {cuenca && onEditarCuenca && (
                <button
                  onClick={onEditarCuenca}
                  className="w-full flex items-center justify-center gap-1.5 text-[10px] text-moss-700 hover:text-moss-900 py-1"
                >
                  <Pencil className="w-3 h-3" /> Editar la cuenca calculada (pasa a polígono editable)
                </button>
              )}
            </div>
          )}

          {cuenca && (
            <>
              {/* Geometría */}
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Área de cuenca" value={`${cuenca.area_ha} ha`} />
                <Stat label="Recorrido de flujo" value={`${cuenca.long_flujo_m} m`} />
                <Stat label="Desnivel" value={`${cuenca.elev_max - cuenca.elev_salida} m`} sub={`${cuenca.elev_salida}–${cuenca.elev_max} m`} />
                <Stat label="Pendiente media" value={`${(cuenca.pendiente_m_m * 100).toFixed(1)} %`} />
              </div>

              {/* Acotada al terreno / extender a la divisoria real */}
              {onExtender && !expandida && (
                <button
                  onClick={onExtender}
                  disabled={cargando}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-medium bg-[#1565C0]/10 hover:bg-[#1565C0]/20 text-[#1565C0] border border-[#1565C0]/30 disabled:opacity-50 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" /> Extender hasta la divisoria real
                </button>
              )}
              {expandida && (
                <p className="text-[9px] text-ink-700/50 text-center">Cuenca completa hasta la divisoria. Puede exceder el terreno.</p>
              )}
              {onExtender && !expandida && (
                <p className="text-[9px] text-ink-700/45 leading-relaxed text-center">Acotada al terreno. Extendé si querés el aporte de toda la cuenca aguas-arriba.</p>
              )}

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

              {/* Lo que falta o se asumió sale por la salud del cálculo, más abajo. */}
              {precipT10 != null && (
                <p className="text-[10px] text-moss-700/80">
                  Tormenta autocompletada con el T10 de Clima → Extremos ({precipT10} mm). Podés poner el T100 para el evento extremo.
                </p>
              )}

              {/* Resultados.
                  Cada número dice en qué intervalo de tiempo vive: el volumen
                  es de todo el evento de 24 h, el caudal pico es un instante
                  dentro de una ráfaga de minutos. Mezclarlos es el error de
                  lectura más fácil de cometer, así que va escrito. */}
              {resultado && (
                <>
                  <p className="text-[9px] text-ink-700/50 leading-relaxed">
                    Dos escalas de tiempo distintas: el <b>volumen</b> es todo lo que escurre en el evento de 24 h;
                    el <b>caudal pico</b> es el instante de máximo, dentro de la ráfaga corta.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat label="Curva número (CN)" value={String(resultado.cn)} color="moss" />
                    <Stat label="Escurre" value={`${resultado.escurrimiento_mm} mm`}
                      sub={`de ${resultado.precip_mm} mm de lluvia · ${Math.round(resultado.coef_evento * 100)} %`} />
                    <Stat label="Volumen del evento" value={volumenM3(resultado.volumen_m3)}
                      sub={`${volumenEnLitros(resultado.volumen_m3)} · en 24 h`} />
                    <Stat label="Tiempo de concentración" value={duracionMin(resultado.tc_min)}
                      sub="del punto más lejano hasta la salida" />
                    <Stat label="Ráfaga de diseño" value={duracionMin(resultado.duracion_min)}
                      sub={`${resultado.intensidad_mm_h} mm/h · ${resultado.lamina_rafaga_mm} mm — es la que hace el pico`} />
                    <Stat label="Caudal pico" value={caudalM3s(resultado.caudal_pico_m3s)}
                      sub={caudalEnLitros(resultado.caudal_pico_m3s) || 'máximo instantáneo'} color="agua" />
                    <Stat label="Ancho de vertedero" value={`${resultado.vertedero_m} m`}
                      sub={`para pasar el pico con ${resultado.head_vertedero_m} m de carga`} color="agua" />
                  </div>

                  {/* `key` por nivel: si aparece una alerta nueva —cortaste la
                      cuenca en el límite, o borraste la tormenta— el bloque se
                      remonta abierto en vez de esconderla bajo un plegado. */}
                  {salud && <SaludCalculo key={salud.nivel} confianza={salud} />}

                  <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                    Volumen por SCS-CN (AMC II) · tc de Kirpich · caudal pico por método racional sobre la ráfaga
                    de duración tc, desagregada de la lámina de 24 h · vertedero de cresta ancha (C=1.7).
                    Diseño preliminar — verificá con estudio hidrológico local.
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
