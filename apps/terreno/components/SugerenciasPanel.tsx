'use client';

import { useState } from 'react';
import { X, ChevronLeft, Home, Droplets, Route, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ResultadoSugerencias, CandidatoUbicacion } from '@/lib/sugerencias';
import type { Pin } from '@/lib/pines';

interface Props {
  datos:            ResultadoSugerencias;
  onAgregarPin:     (lat: number, lng: number, nombre: string, icono: string, color: string) => void;
  onAgregarCamino:  (vertices: Array<{ lat: number; lng: number }>, nombre: string, color: string) => void;
  onVolver:         () => void;
}

export function SugerenciasPanel({ datos, onAgregarPin, onAgregarCamino, onVolver }: Props) {
  const [agregados, setAgregados] = useState<Set<string>>(new Set());

  const marcarAgregado = (key: string) =>
    setAgregados(prev => new Set([...prev, key]));

  const caminoAgregado = agregados.has('camino');

  return (
    <div className="w-64 bg-white/97 backdrop-blur-sm rounded-xl shadow-xl border border-bone-200 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-ink-950 border-b border-ink-800 shrink-0">
        <button onClick={onVolver} className="flex items-center gap-1 text-bone-300 hover:text-bone-100 transition-colors">
          <ChevronLeft className="w-3 h-3" />
          <span className="text-[10px]">Capas</span>
        </button>
        <span className="text-[10px] font-bold text-bone-100 uppercase tracking-widest">Sugerencias</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-bone-100">

        {/* ── Vivienda ── */}
        <SeccionSugerencia
          titulo="Vivienda"
          icono={<Home className="w-3.5 h-3.5" />}
          descripcion="Ladera norte, pendiente suave, lejos de escorrentías"
          color="#2E7D32"
        >
          {datos.viviendas.length === 0
            ? <p className="text-[10px] text-ink-700/40 px-3 py-3 text-center">Sin candidatos válidos</p>
            : datos.viviendas.map((v, i) => {
              const key = `viv-${i}`;
              return (
                <CandidatoRow
                  key={key}
                  candidato={v}
                  rank={i}
                  tipo="vivienda"
                  agregado={agregados.has(key)}
                  onAgregar={() => {
                    onAgregarPin(v.lat, v.lng, `Vivienda ${i === 0 ? '' : i + 1}`.trim(), '🏠', '#2E7D32');
                    marcarAgregado(key);
                  }}
                />
              );
            })
          }
        </SeccionSugerencia>

        {/* ── Reservorio ── */}
        <SeccionSugerencia
          titulo="Reservorio de agua"
          icono={<Droplets className="w-3.5 h-3.5" />}
          descripcion="Alta acumulación de flujos, posición baja, vaguada natural"
          color="#1565C0"
        >
          {datos.reservorios.length === 0
            ? <p className="text-[10px] text-ink-700/40 px-3 py-3 text-center">Sin candidatos válidos</p>
            : datos.reservorios.map((r, i) => {
              const key = `res-${i}`;
              return (
                <CandidatoRow
                  key={key}
                  candidato={r}
                  rank={i}
                  tipo="reservorio"
                  agregado={agregados.has(key)}
                  onAgregar={() => {
                    onAgregarPin(r.lat, r.lng, `Reservorio ${i === 0 ? '' : i + 1}`.trim(), '💧', '#1565C0');
                    marcarAgregado(key);
                  }}
                />
              );
            })
          }
        </SeccionSugerencia>

        {/* ── Camino de acceso ── */}
        <SeccionSugerencia
          titulo="Camino de acceso"
          icono={<Route className="w-3.5 h-3.5" />}
          descripcion="Sigue la divisoria de aguas (ridgeline) para minimizar erosión"
          color="#E65100"
        >
          {datos.camino.length < 2
            ? <p className="text-[10px] text-ink-700/40 px-3 py-3 text-center">Se necesitan candidatos de vivienda o reservorio</p>
            : (
              <div className="px-3 pb-3 pt-1 space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <Stat label="Longitud" value={
                    datos.caminoInfo.longitud_m >= 1000
                      ? `${(datos.caminoInfo.longitud_m / 1000).toFixed(2)} km`
                      : `${datos.caminoInfo.longitud_m} m`
                  } />
                  <Stat label="Pendiente media" value={`${datos.caminoInfo.pendiente_media_pct}%`} />
                </div>
                <p className="text-[9px] text-ink-700/50 italic leading-tight">
                  Trazado por divisoria de aguas — sigue crestas para evitar barro y erosión.
                </p>
                {caminoAgregado
                  ? (
                    <div className="flex items-center gap-1.5 py-1.5 justify-center text-moss-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">Guardado en Caminos</span>
                    </div>
                  )
                  : (
                    <button
                      onClick={() => {
                        onAgregarCamino(datos.camino, 'Acceso sugerido', '#E65100');
                        marcarAgregado('camino');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-orange-700 hover:bg-orange-900 text-white rounded-lg text-[10px] font-semibold transition-colors"
                    >
                      <Route className="w-3 h-3" />
                      Guardar como camino
                    </button>
                  )
                }
              </div>
            )
          }
        </SeccionSugerencia>

        {/* Nota metodológica */}
        <div className="px-3 py-3">
          <div className="flex items-start gap-2 bg-bone-50 rounded-lg p-2">
            <AlertCircle className="w-3 h-3 text-ink-700/30 shrink-0 mt-0.5" />
            <p className="text-[9px] text-ink-700/50 leading-tight italic">
              Sugerencias basadas en topografía SRTM 30m y criterios permaculturales.
              Verificar en campo antes de construir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SeccionSugerencia({ titulo, icono, descripcion, color, children }: {
  titulo: string; icono: React.ReactNode; descripcion: string; color: string;
  children: React.ReactNode;
}) {
  const [expandido, setExpandido] = useState(true);
  return (
    <div>
      <button
        onClick={() => setExpandido(v => !v)}
        className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-bone-50 text-left"
      >
        <span style={{ color }} className="shrink-0 mt-0.5">{icono}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-ink-900">{titulo}</p>
          <p className="text-[9px] text-ink-700/50 leading-tight mt-0.5">{descripcion}</p>
        </div>
        <span className={`text-ink-700/30 text-xs transition-transform shrink-0 ${expandido ? '' : '-rotate-90'}`}>▾</span>
      </button>
      {expandido && <div>{children}</div>}
    </div>
  );
}

function CandidatoRow({ candidato, rank, tipo, agregado, onAgregar }: {
  candidato: CandidatoUbicacion; rank: number; tipo: 'vivienda' | 'reservorio';
  agregado: boolean; onAgregar: () => void;
}) {
  const [expandido, setExpandido] = useState(rank === 0);
  const scoreColor = candidato.score >= 68 ? '#2E7D32' : candidato.score >= 45 ? '#E65100' : '#B71C1C';
  const bgColor    = candidato.score >= 68 ? 'bg-moss-50 border-moss-200' :
                     candidato.score >= 45 ? 'bg-sun-50 border-sun-200' : 'bg-clay-50 border-clay-200';
  const icono = tipo === 'vivienda' ? '🏠' : '💧';
  const label = rank === 0 ? 'Mejor opción' : rank === 1 ? '2.ª opción' : '3.ª opción';

  return (
    <div className={`mx-3 mb-2 rounded-lg border ${bgColor} overflow-hidden`}>
      <button onClick={() => setExpandido(v => !v)} className="w-full flex items-center gap-2 px-2.5 py-2 text-left">
        <span className="text-base leading-none shrink-0">{icono}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-ink-900">{label}</p>
          <p className="text-[9px] font-mono text-ink-700/40">{candidato.lat.toFixed(5)}, {candidato.lng.toFixed(5)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold tabular-nums" style={{ color: scoreColor }}>{candidato.score}%</span>
          <ScoreBar score={candidato.score} />
        </div>
      </button>

      {expandido && (
        <div className="px-2.5 pb-2 space-y-1.5">
          {/* Motivos */}
          <div className="flex flex-wrap gap-1">
            {candidato.motivos.map((m, i) => (
              <span key={i} className="text-[8px] bg-white/70 text-ink-700/70 px-1.5 py-0.5 rounded-full border border-bone-200">
                {m}
              </span>
            ))}
          </div>

          {agregado
            ? (
              <div className="flex items-center gap-1.5 py-1 justify-center text-moss-700">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-medium">Agregado como pin</span>
              </div>
            )
            : (
              <button
                onClick={onAgregar}
                className="w-full flex items-center justify-center gap-1 py-1.5 bg-ink-900 hover:bg-ink-700 text-white rounded-md text-[10px] font-semibold transition-colors"
              >
                {icono} Agregar como pin
              </button>
            )
          }
        </div>
      )}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 68 ? '#4CAF50' : score >= 45 ? '#FF9800' : '#f44336';
  return (
    <div className="w-10 h-1.5 bg-bone-200 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/70 rounded-md p-1.5 text-center">
      <p className="text-[8px] text-ink-700/50">{label}</p>
      <p className="text-[10px] font-mono font-bold text-ink-900">{value}</p>
    </div>
  );
}
