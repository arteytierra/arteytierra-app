'use client';

/**
 * Mapa de sombras (D4) — controles de fecha y hora para proyectar las sombras
 * del relieve sobre la grilla de elevación densa.
 */
import { Sun, Moon, TriangleAlert } from 'lucide-react';
import { horaStr } from '@/lib/arco_solar';
import type { ResultadoSombras } from '@/lib/sombras';

interface Props {
  tieneShader: boolean;
  activo:      boolean;
  doy:         number;
  hora:        number;
  sombras:     ResultadoSombras | null;
  onActivo:    (v: boolean) => void;
  onDoy:       (v: number) => void;
  onHora:      (v: number) => void;
  onIrATopo:   () => void;
}

const PRESETS: Array<{ label: string; doy: number }> = [
  { label: '21 dic (verano)',   doy: 355 },
  { label: '21 mar (otoño)',    doy: 80 },
  { label: '21 jun (invierno)', doy: 172 },
  { label: '23 sep (primavera)', doy: 266 },
];

const RUMBOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
function rumbo(az: number): string { return RUMBOS[Math.round(((az % 360) / 45)) % 8] ?? 'N'; }

export function SombrasPanel({ tieneShader, activo, doy, hora, sombras, onActivo, onDoy, onHora, onIrATopo }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Mapa de sombras (relieve por fecha/hora)
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

              {/* Hora */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink-700/60">Hora solar</span>
                  <span className="font-mono text-xs text-moss-700">{horaStr(hora)}</span>
                </div>
                <input type="range" min={4} max={20} step={0.25} value={hora}
                  onChange={e => onHora(Number(e.target.value))} className="w-full accent-sun-400" />
                <div className="flex justify-between text-[9px] text-ink-700/45"><span>04:00</span><span>12:00</span><span>20:00</span></div>
              </div>

              <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                Sombras proyectadas del terreno (ray-march sobre el MDE SRTM 30 m) + sombreado de pendiente. Hora solar aproximada; orientativo para ubicar cultivos, invernaderos, viviendas y paneles.
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
