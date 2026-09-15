'use client';

/**
 * Contexto vivo del predio (D1) — biodiversidad (GBIF), ubicación y entorno (OSM).
 */
import { useState, useEffect } from 'react';
import { Bird, TriangleAlert, Loader2, MapPin, ShieldAlert, Waves, Leaf, Factory, Pickaxe, Flame, Zap, Trash2, Cable } from 'lucide-react';
import {
  obtenerEntorno, resumirEntorno, etiquetaIUCN,
  type DatosEntorno, type EntornoResumen,
} from '@/lib/entorno';
import {
  ROTULO_CLASE, titulo, ubicacionTexto, cantidadTexto, RADIO_LINEAL_KM,
  type ClaseContexto, type ContextoActual, type Presencia,
} from '@/lib/contextoActual';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:    Mojon[];
  datos:      DatosEntorno | null;
  onDatos:    (d: DatosEntorno | null) => void;
  onResumen?: (r: EntornoResumen | null) => void;
}

const IUCN_COLOR: Record<string, string> = {
  CR: '#b71c1c', EN: '#e65100', VU: '#f9a825', NT: '#9e9d24', LC: '#2e7d32', DD: '#9e9e9e',
};

export function EntornoPanel({ mojones, datos, onDatos, onResumen }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { onResumen?.(datos ? resumirEntorno(datos) : null); }, [datos, onResumen]);

  const analizar = async () => {
    if (mojones.length < 3) { setError('Marcá al menos 3 mojones.'); return; }
    setCargando(true); setError(null);
    try { onDatos(await obtenerEntorno(mojones)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo obtener el contexto.'); }
    finally { setCargando(false); }
  };

  const bio = datos?.biodiversidad;
  const iucnOrden = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD'];

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Contexto vivo (biodiversidad y entorno)
      </p>

      {mojones.length < 3 ? (
        <p className="text-[11px] text-ink-700/60 bg-bone-50 border border-bone-200 rounded-xl p-3 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-sun-500" />
          Marcá los mojones del predio para consultar su entorno.
        </p>
      ) : (
        <button onClick={analizar} disabled={cargando}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-moss-700 text-bone-50 rounded-xl px-3 py-2.5 hover:bg-moss-800 disabled:opacity-60 transition-colors">
          {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bird className="w-4 h-4" />}
          {cargando ? 'Consultando datos abiertos…' : datos ? 'Volver a consultar' : 'Consultar el entorno del predio'}
        </button>
      )}

      {error && (
        <p className="text-[11px] text-clay-700 bg-clay-100 border border-clay-200 rounded-xl p-3 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0" />{error}
        </p>
      )}

      {datos && (
        <>
          {/* Ubicación */}
          {datos.ubicacion && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-moss-600 mt-0.5" />
              <p className="text-[11px] text-ink-700/85 leading-relaxed">
                {[datos.ubicacion.localidad, datos.ubicacion.departamento, datos.ubicacion.provincia, datos.ubicacion.pais].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}

          {/* Biodiversidad */}
          {bio && bio.total > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Registros" value={bio.total.toLocaleString('es-AR')} sub={`en ${datos.radio_km} km`} color="moss" />
                <Stat label="Fauna" value={datos.fauna.toLocaleString('es-AR')} icon="bird" />
                <Stat label="Flora" value={datos.flora.toLocaleString('es-AR')} icon="leaf" />
              </div>

              {datos.amenazadas > 0 && (
                <div className="bg-clay-100 border border-clay-200 rounded-xl p-3 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-clay-700 mt-0.5" />
                  <p className="text-[11px] text-clay-700 leading-relaxed">
                    <span className="font-semibold">{datos.amenazadas}</span> registros de especies con algún grado de amenaza (IUCN) en la zona. Verificá presencia de especies protegidas antes de intervenir.
                  </p>
                </div>
              )}

              {/* Barra IUCN */}
              {bio.iucn && Object.keys(bio.iucn).length > 0 && (
                <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                  <p className="text-xs font-medium text-ink-700">Estado de conservación (IUCN)</p>
                  <div className="flex h-3 rounded-full overflow-hidden border border-bone-200">
                    {iucnOrden.filter(k => bio.iucn[k]).map(k => (
                      <div key={k} style={{ width: `${(bio.iucn[k]! / bio.total) * 100}%`, background: IUCN_COLOR[k] }} title={`${etiquetaIUCN(k)}: ${bio.iucn[k]}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {iucnOrden.filter(k => bio.iucn[k]).map(k => (
                      <span key={k} className="text-[9px] text-ink-700/70 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm" style={{ background: IUCN_COLOR[k] }} />{etiquetaIUCN(k)} ({bio.iucn[k]})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top especies */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
                <p className="text-xs font-medium text-ink-700">Especies más observadas</p>
                {datos.especies_top.slice(0, 8).map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="flex-1 italic text-ink-700/85">{e.nombre}</span>
                    <span className="font-mono text-ink-700/60">{e.obs.toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Entorno OSM */}
          {datos.osm && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
              <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5"><Waves className="w-3.5 h-3.5 text-moss-600" />Entorno (OpenStreetMap)</p>
              {datos.osm.poblados.length > 0 && (
                <Fila label="Poblados" items={datos.osm.poblados.map(p => `${p.nombre} (${p.dist_km} km)`)} />
              )}
              {datos.osm.areas_protegidas.length > 0 && <Fila label="Áreas protegidas" items={datos.osm.areas_protegidas} />}
              {datos.osm.cursos_agua.length > 0 && <Fila label="Cursos de agua" items={datos.osm.cursos_agua} />}
              {datos.osm.cuerpos_agua.length > 0 && <Fila label="Cuerpos de agua" items={datos.osm.cuerpos_agua} />}
            </div>
          )}

          {datos.contexto_actual && <ContextoActualBloque ctx={datos.contexto_actual} />}

          <p className="text-[9px] text-ink-700/45 italic leading-relaxed">{datos.fuente}</p>
        </>
      )}
    </div>
  );
}

const ICONO_CLASE: Record<ClaseContexto, typeof Factory> = {
  mineria: Pickaxe, hidrocarburos: Flame, energia: Zap, residuos: Trash2, industria: Factory,
  infraestructura: Cable,
};

/**
 * Qué actividad industrial e infraestructura de paso hay alrededor del predio.
 *
 * Se nombra la actividad y nunca a quien la hace: ver `lib/contextoActual.ts`.
 * Los tres estados posibles se dicen distinto a propósito —hay algo, no hay nada
 * mapeado, no se pudo preguntar—, porque los últimos dos se parecen en la
 * pantalla y no significan lo mismo en el territorio.
 */
function ContextoActualBloque({ ctx }: { ctx: ContextoActual }) {
  const porClase = new Map<ClaseContexto, Presencia[]>();
  for (const p of ctx.presencias) {
    const lista = porClase.get(p.clase);
    if (lista) lista.push(p); else porClase.set(p.clase, [p]);
  }

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2.5">
      <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
        <Factory className="w-3.5 h-3.5 text-clay-700" />
        Contexto actual — qué hay alrededor
      </p>

      {!ctx.consultado ? (
        <p className="text-[11px] text-ink-700/70 leading-relaxed">
          No se pudo consultar el servicio de mapas en este momento. No es que no haya nada:
          es que no se pudo preguntar. Volvé a intentar en un rato.
        </p>
      ) : ctx.presencias.length === 0 ? (
        <p className="text-[11px] text-ink-700/70 leading-relaxed">
          No hay actividad industrial ni infraestructura de paso <span className="font-medium">mapeada</span> en {ctx.radio_km} km
          a la redonda. OpenStreetMap se releva a mano y su cobertura es despareja: en buena parte
          del continente la minería chica y los pozos todavía no están cargados. Que no aparezca
          no quiere decir que no exista.
        </p>
      ) : (
        <>
          {[...porClase.entries()].map(([clase, lista]) => {
            const Ico = ICONO_CLASE[clase];
            return (
              <div key={clase} className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-ink-700/55 flex items-center gap-1">
                  <Ico className="w-3 h-3" />{ROTULO_CLASE[clase]}
                </p>
                {lista.map((p, i) => (
                  <div key={i} className="text-[11px] text-ink-700/85 flex gap-1.5 pl-4">
                    <span className="flex-1">
                      {titulo(p)}
                      {p.cantidad > 1 && <span className="text-ink-700/55"> · {cantidadTexto(p)}</span>}
                    </span>
                    <span className="shrink-0 font-mono text-ink-700/70">{ubicacionTexto(p)}</span>
                  </div>
                ))}
              </div>
            );
          })}
          {ctx.truncado && (
            <p className="text-[10px] text-ink-700/60 leading-relaxed">
              Hay más de los que entran en una consulta: las cantidades son un piso, no un total.
            </p>
          )}
        </>
      )}

      <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
        OpenStreetMap (ODbL), radio de {ctx.radio_km} km. La distancia es al borde del rasgo mapeado
        y el rumbo, hacia su centro; en ductos y líneas, al punto más cercano de la traza, que se
        buscan en {RADIO_LINEAL_KM} km. Se nombra la actividad, no a quien la realiza.
      </p>
    </div>
  );
}

function Fila({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="text-[11px] flex gap-1.5">
      <span className="text-ink-700/55 shrink-0">{label}:</span>
      <span className="text-ink-700/85">{items.slice(0, 6).join(' · ')}</span>
    </div>
  );
}

function Stat({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color?: 'moss'; icon?: 'bird' | 'leaf';
}) {
  const cls = color === 'moss' ? 'bg-moss-700 border-moss-700 text-bone-50' : 'bg-white border-bone-200 text-ink-900';
  const Ico = icon === 'leaf' ? Leaf : Bird;
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5 flex items-center gap-1">{icon && <Ico className="w-2.5 h-2.5" />}{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
