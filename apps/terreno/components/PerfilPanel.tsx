'use client';

/**
 * Panel de perfil de elevación interactivo, acoplado en la banda inferior del mapa
 * (estilo Google Earth Pro). Al pasar el cursor por el perfil, un punto se mueve
 * sobre el camino en el mapa (sincronización perfil → mapa) y se muestra la
 * progresiva, la cota y la pendiente local. Los tramos se colorean por pendiente
 * (verde <8 %, amarillo 8–15 %, rojo >15 %) — criterio de caminos rurales.
 */
import { useMemo, useRef, useState, useCallback } from 'react';
import * as turf from '@turf/turf';
import { X, Route as RouteIcon } from 'lucide-react';
import type { PerfilElevacion } from '@/lib/caminos';

interface Props {
  perfil:   PerfilElevacion;
  vertices: Array<{ lat: number; lng: number }>;
  nombre:   string;
  color:    string;
  onHover:  (p: { lat: number; lng: number } | null) => void;
  onClose:  () => void;
}

const W = 1000, H = 152, PAD_L = 46, PAD_R = 14, PAD_T = 12, PAD_B = 24;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

function colorPendiente(pct: number): string {
  return pct < 8 ? '#2E7D32' : pct < 15 ? '#F9A825' : '#C62828';
}

export function PerfilPanel({ perfil, vertices, nombre, color, onHover, onClose }: Props) {
  const { puntos, elev_min, elev_max, longitud_m } = perfil;
  const [hover, setHover] = useState<{ x: number; dist: number; elev: number; pend: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const line = useMemo(() => {
    try { return turf.lineString(vertices.map(v => [v.lng, v.lat])); } catch { return null; }
  }, [vertices]);

  const rango = Math.max(1, elev_max - elev_min);
  const xAt = useCallback((d: number) => PAD_L + (longitud_m > 0 ? d / longitud_m : 0) * plotW, [longitud_m]);
  const yAt = useCallback((e: number) => PAD_T + (1 - (e - elev_min) / rango) * plotH, [elev_min, rango]);

  // Relleno del área bajo el perfil
  const areaPath = useMemo(() => {
    if (puntos.length < 2) return '';
    const p0 = puntos[0]!, pN = puntos[puntos.length - 1]!;
    let d = `M ${xAt(p0.distancia_m)} ${H - PAD_B}`;
    for (const p of puntos) d += ` L ${xAt(p.distancia_m).toFixed(1)} ${yAt(p.elevation).toFixed(1)}`;
    d += ` L ${xAt(pN.distancia_m)} ${H - PAD_B} Z`;
    return d;
  }, [puntos, xAt, yAt]);

  // Tramos coloreados por pendiente
  const segmentos = useMemo(() => puntos.slice(1).map((p, i) => {
    const prev = puntos[i]!;
    const dx = p.distancia_m - prev.distancia_m;
    const pend = dx > 0 ? Math.abs(p.elevation - prev.elevation) / dx * 100 : 0;
    return {
      x1: xAt(prev.distancia_m), y1: yAt(prev.elevation),
      x2: xAt(p.distancia_m),    y2: yAt(p.elevation),
      col: colorPendiente(pend),
    };
  }), [puntos, xAt, yAt]);

  // Interpola cota + pendiente local a una distancia dada
  const muestrear = useCallback((dist: number) => {
    let i = 1;
    while (i < puntos.length && puntos[i]!.distancia_m < dist) i++;
    const a = puntos[Math.max(0, i - 1)]!;
    const b = puntos[Math.min(puntos.length - 1, i)]!;
    const span = b.distancia_m - a.distancia_m;
    const f = span > 0 ? (dist - a.distancia_m) / span : 0;
    const elev = a.elevation + (b.elevation - a.elevation) * f;
    const pend = span > 0 ? Math.abs(b.elevation - a.elevation) / span * 100 : 0;
    return { elev, pend };
  }, [puntos]);

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || !line) return;
    const rect = svg.getBoundingClientRect();
    const xSvg = (e.clientX - rect.left) / rect.width * W;
    const t = Math.max(0, Math.min(1, (xSvg - PAD_L) / plotW));
    const dist = t * longitud_m;
    const { elev, pend } = muestrear(dist);
    setHover({ x: xAt(dist), dist, elev, pend });
    try {
      const pt = turf.along(line, dist / 1000, { units: 'kilometers' });
      const c = pt.geometry.coordinates;
      onHover({ lat: c[1]!, lng: c[0]! });
    } catch { /* ignora puntos fuera de rango */ }
  }, [line, longitud_m, muestrear, xAt, onHover]);

  const handleLeave = useCallback(() => { setHover(null); onHover(null); }, [onHover]);

  // Ticks de cota (3 niveles)
  const ticks = [elev_min, (elev_min + elev_max) / 2, elev_max];

  return (
    <div className="absolute left-0 right-0 bottom-0 z-[1150] no-print bg-white/96 backdrop-blur-sm border-t-2 border-ink-200 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-bone-200">
        <div className="flex items-center gap-2 min-w-0">
          <RouteIcon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
          <span className="text-xs font-semibold text-ink-800 truncate">{nombre}</span>
          <span className="text-[10px] font-mono text-ink-700/55 shrink-0">
            {longitud_m >= 1000 ? `${(longitud_m / 1000).toFixed(2)} km` : `${longitud_m} m`} ·
            ↑{perfil.desnivel_pos} ↓{perfil.desnivel_neg} m ·
            {perfil.pendiente_media_pct}% medio
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[9px] text-ink-700/60">
            <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm inline-block" style={{ background: '#2E7D32' }} />&lt;8%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm inline-block" style={{ background: '#F9A825' }} />8–15%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm inline-block" style={{ background: '#C62828' }} />&gt;15%</span>
          </div>
          <button onClick={onClose} className="text-ink-700/40 hover:text-ink-800 transition-colors" title="Cerrar perfil">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative px-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full block cursor-crosshair"
          style={{ height: 132 }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          {/* Grilla + ticks de cota */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={yAt(t)} x2={W - PAD_R} y2={yAt(t)} stroke="#e7e3db" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <text x={PAD_L - 5} y={yAt(t) + 3} textAnchor="end" fontSize={11} fill="#9a958c" fontFamily="monospace">{Math.round(t)}</text>
            </g>
          ))}

          {/* Área */}
          <path d={areaPath} fill={color} fillOpacity={0.1} />

          {/* Tramos coloreados por pendiente */}
          {segmentos.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.col} strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          ))}

          {/* Cursor */}
          {hover && (
            <g>
              <line x1={hover.x} y1={PAD_T} x2={hover.x} y2={H - PAD_B} stroke="#1a1a1a" strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              <circle cx={hover.x} cy={yAt(hover.elev)} r={4} fill="#fff" stroke="#1a1a1a" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </g>
          )}

          {/* Eje X: 0 y longitud */}
          <text x={PAD_L} y={H - 7} textAnchor="start" fontSize={11} fill="#9a958c" fontFamily="monospace">0</text>
          <text x={W - PAD_R} y={H - 7} textAnchor="end" fontSize={11} fill="#9a958c" fontFamily="monospace">
            {longitud_m >= 1000 ? `${(longitud_m / 1000).toFixed(1)} km` : `${longitud_m} m`}
          </text>
        </svg>

        {/* Tooltip flotante */}
        {hover && (
          <div
            className="absolute top-1 pointer-events-none bg-ink-950 text-bone-50 rounded-md px-2 py-1 text-[10px] font-mono leading-tight shadow-lg"
            style={{ left: `calc(${(hover.x / W) * 100}% + 6px)`, transform: hover.x > W * 0.7 ? 'translateX(-100%)' : undefined }}
          >
            <div>{hover.dist >= 1000 ? `${(hover.dist / 1000).toFixed(2)} km` : `${Math.round(hover.dist)} m`}</div>
            <div className="text-sun-300">{Math.round(hover.elev)} m s.n.m.</div>
            <div style={{ color: colorPendiente(hover.pend) }}>{hover.pend.toFixed(1)}% local</div>
          </div>
        )}
      </div>
    </div>
  );
}
