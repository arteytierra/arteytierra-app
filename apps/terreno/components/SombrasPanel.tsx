'use client';

/**
 * Mapa de sombras — fecha, hora, animación del día, horas de sol acumuladas y
 * objetos con altura propia (árboles y construcciones) que proyectan su sombra.
 */
import { Sun, Moon, TriangleAlert, Play, Pause, Timer, TreePine, Building2, Trash2, Loader2 } from 'lucide-react';
import { horaStr } from '@/lib/arco_solar';
import type { ResultadoSombras } from '@/lib/sombras';
import type { ResultadoInsolacion } from '@/lib/insolacion';
import { PRESETS_OBJETO, type ObjetoSombra } from '@/lib/objetosSombra';

interface Zonita { id: string; nombre: string; vertices: Array<{ lat: number; lng: number }> }

interface Props {
  tieneShader:   boolean;
  activo:        boolean;
  doy:           number;
  hora:          number;
  sombras:       ResultadoSombras | null;
  animando:      boolean;
  insolacion:    ResultadoInsolacion | null;
  calculandoIns: boolean;
  objetos:       ObjetoSombra[];
  modoArbol:     boolean;
  /** Polígonos ya dibujados en el plano, para levantarlos como volumen. */
  poligonos:     Zonita[];
  onActivo:      (v: boolean) => void;
  onDoy:         (v: number) => void;
  onHora:        (v: number) => void;
  onAnimar:      () => void;
  onInsolacion:  () => void;
  onLimpiarInsolacion: () => void;
  onAgregarObjeto: (preset: typeof PRESETS_OBJETO[number], vertices?: Array<{ lat: number; lng: number }>) => void;
  onAlturaObjeto:  (id: string, altura: number) => void;
  onEliminarObjeto: (id: string) => void;
  onIrATopo:     () => void;
}

const PRESETS: Array<{ label: string; doy: number }> = [
  { label: '21 dic (verano)',   doy: 355 },
  { label: '21 mar (otoño)',    doy: 80 },
  { label: '21 jun (invierno)', doy: 172 },
  { label: '23 sep (primavera)', doy: 266 },
];

const RUMBOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
function rumbo(az: number): string { return RUMBOS[Math.round(((az % 360) / 45)) % 8] ?? 'N'; }

export function SombrasPanel({
  tieneShader, activo, doy, hora, sombras, animando, insolacion, calculandoIns,
  objetos, modoArbol, poligonos,
  onActivo, onDoy, onHora, onAnimar, onInsolacion, onLimpiarInsolacion,
  onAgregarObjeto, onAlturaObjeto, onEliminarObjeto, onIrATopo,
}: Props) {
  const arboles  = PRESETS_OBJETO.filter(p => p.tipo === 'arbol');
  const volumenes = PRESETS_OBJETO.filter(p => p.tipo === 'volumen');

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Sol y sombras
      </p>

      {!tieneShader ? (
        <p className="text-[11px] text-ink-700/60 bg-bone-50 border border-bone-200 rounded-xl p-3 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-sun-500" />
          <span>Calculá primero la <button onClick={onIrATopo} className="underline text-moss-700">topografía</button> (grilla de elevación densa) para proyectar las sombras del terreno.</span>
        </p>
      ) : (
        <>
          <button onClick={() => onActivo(!activo)}
            className={`w-full flex items-center justify-center gap-2 text-xs font-medium rounded-xl px-3 py-2.5 transition-colors border ${activo ? 'bg-moss-700 text-bone-50 border-moss-700 hover:bg-moss-800' : 'bg-white text-ink-700 border-bone-200 hover:bg-bone-50'}`}>
            <Sun className="w-4 h-4" />
            {activo ? 'Sombras activas — ocultar' : 'Mostrar mapa de sombras'}
          </button>

          {activo && (
            <>
              {/* Info del sol */}
              <div className="grid grid-cols-2 gap-2">
                {sombras?.hay_sol ? (
                  <>
                    <Stat label="Altura del sol" value={`${Math.round(sombras.sol.elevacion)}°`} sub="sobre el horizonte" icon="sun" />
                    <Stat label="Azimut" value={`${Math.round(sombras.sol.azimut)}° ${rumbo(sombras.sol.azimut)}`} sub="dirección del sol" icon="sun" />
                  </>
                ) : (
                  <div className="col-span-2 bg-ink-900/90 text-bone-50 rounded-xl p-3 flex items-center gap-2 text-[11px]">
                    <Moon className="w-4 h-4 shrink-0 text-bone-50/70" /> El sol está bajo el horizonte a esta hora — todo el predio queda en penumbra.
                  </div>
                )}
              </div>

              {/* Fecha */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink-700/60">Fecha (día del año)</span>
                  <span className="font-mono text-xs text-moss-700">día {doy}</span>
                </div>
                <input type="range" min={1} max={365} step={1} value={doy}
                  onChange={e => onDoy(Number(e.target.value))} className="w-full accent-sun-400" />
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map(p => (
                    <button key={p.doy} onClick={() => onDoy(p.doy)}
                      className={`text-[10px] rounded-lg px-2 py-1 border transition-colors ${Math.abs(doy - p.doy) < 3 ? 'bg-moss-50 border-moss-300 text-moss-700' : 'bg-bone-50 border-bone-200 text-ink-700/70 hover:bg-bone-100'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora + animación */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink-700/60">Hora solar</span>
                  <span className="font-mono text-xs text-moss-700">{horaStr(hora)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={onAnimar}
                    title={animando ? 'Pausar' : 'Ver pasar el día'}
                    className={`shrink-0 w-8 h-8 grid place-items-center rounded-lg border transition-colors ${animando ? 'bg-moss-700 text-bone-50 border-moss-700' : 'bg-bone-50 text-ink-700 border-bone-200 hover:bg-bone-100'}`}>
                    {animando ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <input type="range" min={4} max={20} step={0.25} value={hora}
                    onChange={e => onHora(Number(e.target.value))} className="flex-1 accent-sun-400" />
                </div>
                <div className="flex justify-between text-[9px] text-ink-700/45"><span>04:00</span><span>12:00</span><span>20:00</span></div>
              </div>

              {/* Horas de sol acumuladas */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <p className="text-[10px] text-ink-700/60 flex items-center gap-1.5">
                  <Timer className="w-3 h-3 text-sun-500" /> Horas de sol del día
                </p>
                {insolacion ? (
                  <>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Mini label="mín" value={`${insolacion.min.toFixed(1)} h`} />
                      <Mini label="prom" value={`${insolacion.promedio.toFixed(1)} h`} />
                      <Mini label="máx" value={`${insolacion.max.toFixed(1)} h`} />
                    </div>
                    <p className="text-[9px] text-ink-700/50">
                      Luz astronómica del día: {insolacion.horas_luz.toFixed(1)} h ({horaStr(insolacion.salida)}–{horaStr(insolacion.puesta)}).
                      {insolacion.con_objetos && ' Incluye la sombra de los objetos.'}
                    </p>
                    <button onClick={onLimpiarInsolacion}
                      className="w-full text-[10px] rounded-lg px-2 py-1.5 border border-bone-200 bg-bone-50 text-ink-700/70 hover:bg-bone-100">
                      Ocultar mapa de horas de sol
                    </button>
                  </>
                ) : (
                  <button onClick={onInsolacion} disabled={calculandoIns}
                    className="w-full flex items-center justify-center gap-2 text-[11px] font-medium rounded-lg px-2 py-2 bg-sun-400/20 border border-sun-400/40 text-ink-900 hover:bg-sun-400/30 disabled:opacity-60">
                    {calculandoIns ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculando…</> : 'Calcular horas de sol'}
                  </button>
                )}
              </div>

              {/* Objetos con altura */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2.5">
                <p className="text-[10px] text-ink-700/60">Objetos que dan sombra</p>

                {modoArbol && (
                  <p className="text-[10px] bg-clay-100 border border-clay-300 text-clay-700 rounded-lg px-2 py-1.5">
                    Hacé clic en el mapa para plantar el árbol.
                  </p>
                )}

                <div className="grid grid-cols-3 gap-1.5">
                  {arboles.map(p => (
                    <button key={p.clave} onClick={() => onAgregarObjeto(p)}
                      className="flex flex-col items-center gap-0.5 text-[9px] rounded-lg px-1 py-1.5 border border-bone-200 bg-bone-50 text-ink-700/80 hover:bg-moss-50 hover:border-moss-300">
                      <TreePine className="w-3.5 h-3.5 text-moss-700" />
                      <span className="leading-tight text-center">{p.etiqueta}</span>
                      <span className="font-mono text-ink-700/45">{p.altura_m} m</span>
                    </button>
                  ))}
                </div>

                {poligonos.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-ink-700/45">Levantar un polígono del plano como volumen:</p>
                    {volumenes.map(p => (
                      <details key={p.clave} className="group">
                        <summary className="flex items-center gap-1.5 text-[10px] cursor-pointer rounded-lg px-2 py-1.5 border border-bone-200 bg-bone-50 text-ink-700/80 hover:bg-bone-100 list-none">
                          <Building2 className="w-3.5 h-3.5 text-clay-700" />
                          {p.etiqueta} <span className="font-mono text-ink-700/45">{p.altura_m} m</span>
                        </summary>
                        <div className="pl-2 pt-1 space-y-1">
                          {poligonos.map(z => (
                            <button key={z.id} onClick={() => onAgregarObjeto(p, z.vertices)}
                              className="w-full text-left text-[10px] rounded px-2 py-1 hover:bg-moss-50 text-ink-700/70">
                              → {z.nombre}
                            </button>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-ink-700/45 italic">
                    Dibujá una zona o un polígono (la casa, el galpón, una tapia) y vas a poder levantarlo acá con su altura.
                  </p>
                )}

                {objetos.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-bone-200">
                    {objetos.map(o => (
                      <li key={o.id} className="flex items-center gap-1.5">
                        {o.tipo === 'arbol'
                          ? <TreePine className="w-3 h-3 shrink-0 text-moss-700" />
                          : <Building2 className="w-3 h-3 shrink-0 text-clay-700" />}
                        <span className="flex-1 text-[10px] text-ink-700/80 truncate">{o.nombre}</span>
                        <input type="number" min={0.5} max={60} step={0.5} value={o.altura_m}
                          onChange={e => onAlturaObjeto(o.id, Number(e.target.value))}
                          className="w-14 text-[10px] font-mono text-right rounded border border-bone-200 px-1 py-0.5" />
                        <span className="text-[9px] text-ink-700/45">m</span>
                        <button onClick={() => onEliminarObjeto(o.id)} className="text-ink-700/40 hover:text-clay-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                Sombras del terreno por ray-march sobre el MDE SRTM 30 m. Las sombras de árboles y construcciones se
                proyectan geométricamente (mucho más finas que la celda del MDE) y suponen suelo plano bajo el objeto.
                Hora solar, sin nubes. Orientativo para ubicar cultivos, invernaderos, viviendas y paneles.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: 'sun' }) {
  return (
    <div className="rounded-xl border border-bone-200 bg-white p-2.5">
      <p className="text-[10px] text-ink-700/60 mb-0.5 flex items-center gap-1">{icon === 'sun' && <Sun className="w-2.5 h-2.5 text-sun-500" />}{label}</p>
      <p className="font-mono text-sm font-bold text-ink-900 leading-tight">{value}</p>
      {sub && <p className="text-[9px] text-ink-700/50 mt-0.5">{sub}</p>}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bone-50 border border-bone-200 px-1.5 py-1 text-center">
      <p className="text-[8px] text-ink-700/50 uppercase">{label}</p>
      <p className="font-mono text-[11px] font-bold text-ink-900">{value}</p>
    </div>
  );
}
