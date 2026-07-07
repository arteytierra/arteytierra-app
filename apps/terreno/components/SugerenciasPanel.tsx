'use client';

import { useState } from 'react';
import { X, ChevronLeft, Home, Droplets, Route, CheckCircle2, AlertCircle, ClipboardList, Sparkles, Trash2, Plus } from 'lucide-react';
import type { ResultadoSugerencias, CandidatoUbicacion } from '@/lib/sugerencias';
import {
  TIPOS_ITEM, EQUIV_EV, dimensionarItem,
  type ItemPrograma, type TipoItemPrograma, type ElementoMasterPlan, type EspecieGanado,
} from '@/lib/masterplan';
import { formatearArea } from '@/lib/dibujos';
import type { Pin } from '@/lib/pines';

interface Props {
  datos:               ResultadoSugerencias;
  onAgregarPin:        (lat: number, lng: number, nombre: string, icono: string, color: string) => void;
  onAgregarCamino:     (vertices: Array<{ lat: number; lng: number }>, nombre: string, color: string) => void;
  onVolver:            () => void;
  programa:            ItemPrograma[];
  onPrograma:          (items: ItemPrograma[]) => void;
  masterPlan:          ElementoMasterPlan[] | null;
  onGenerarMasterPlan: () => void;
  onConvertirZona:     (el: ElementoMasterPlan) => void;
  onDescartarElemento: (id: string) => void;
  areaPredioHa:        number | null;
}

export function SugerenciasPanel({
  datos, onAgregarPin, onAgregarCamino, onVolver,
  programa, onPrograma, masterPlan, onGenerarMasterPlan,
  onConvertirZona, onDescartarElemento, areaPredioHa,
}: Props) {
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

        {/* ── Master Plan ── */}
        <SeccionSugerencia
          titulo="Master Plan"
          icono={<ClipboardList className="w-3.5 h-3.5" />}
          descripcion="Declarás qué querés en el predio y el motor sugiere ubicación y superficie"
          color="#6D4C41"
        >
          <MasterPlanWizard
            programa={programa}
            onPrograma={onPrograma}
            masterPlan={masterPlan}
            onGenerar={onGenerarMasterPlan}
            onConvertirZona={onConvertirZona}
            onDescartar={onDescartarElemento}
            areaPredioHa={areaPredioHa}
          />
        </SeccionSugerencia>

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

// ─── Master Plan Wizard ───────────────────────────────────────────────────────

const inputMini = 'w-full text-[10px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500';

function MasterPlanWizard({ programa, onPrograma, masterPlan, onGenerar, onConvertirZona, onDescartar, areaPredioHa }: {
  programa:        ItemPrograma[];
  onPrograma:      (items: ItemPrograma[]) => void;
  masterPlan:      ElementoMasterPlan[] | null;
  onGenerar:       () => void;
  onConvertirZona: (el: ElementoMasterPlan) => void;
  onDescartar:     (id: string) => void;
  areaPredioHa:    number | null;
}) {
  const [tipoNuevo, setTipoNuevo] = useState<TipoItemPrograma>('casa');

  const agregar = () => {
    const item: ItemPrograma = {
      id: crypto.randomUUID(),
      tipo: tipoNuevo,
      cantidad: 1,
      ...(tipoNuevo === 'pastoreo' ? { cabezas: 20, especie: 'bovino' as EspecieGanado, receptividad: 0.7 } : {}),
      ...(tipoNuevo === 'cultivo' || tipoNuevo === 'frutales' || tipoNuevo === 'reservorio' ? { hectareas: 1 } : {}),
    };
    onPrograma([...programa, item]);
  };

  const actualizar = (id: string, campos: Partial<ItemPrograma>) =>
    onPrograma(programa.map(i => i.id === id ? { ...i, ...campos } : i));

  const quitar = (id: string) => onPrograma(programa.filter(i => i.id !== id));

  const totalM2 = programa.reduce((s, i) => s + dimensionarItem(i).area_m2, 0);
  const totalHa = totalM2 / 10_000;
  const excede  = areaPredioHa !== null && totalHa > areaPredioHa;

  return (
    <div className="px-3 pb-3 pt-1 space-y-2">

      {/* ── Ítems del programa ── */}
      {programa.map(item => {
        const def = TIPOS_ITEM[item.tipo];
        const dim = dimensionarItem(item);
        return (
          <div key={item.id} className="rounded-lg border border-bone-200 bg-bone-50/60 p-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm leading-none shrink-0">{def.emoji}</span>
              <span className="flex-1 text-[10px] font-semibold text-ink-900 truncate">{def.label}</span>
              <span className="text-[9px] font-mono font-bold text-moss-700 shrink-0">{formatearArea(dim.area_m2)}</span>
              <button onClick={() => quitar(item.id)} className="shrink-0 text-ink-700/25 hover:text-clay-500 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Parámetros según tipo */}
            {!TIPOS_ITEM[item.tipo].esArea && item.tipo !== 'reservorio' && (
              <div className="flex items-center gap-1.5">
                <label className="text-[9px] text-ink-700/60 shrink-0">Cantidad</label>
                <input type="number" min={1} max={20} value={item.cantidad}
                  onChange={e => actualizar(item.id, { cantidad: Math.max(1, parseInt(e.target.value) || 1) })}
                  className={inputMini + ' w-12'} />
                {item.tipo === 'personalizado' && (
                  <input type="text" placeholder="¿Qué es?" value={item.nombre ?? ''}
                    onChange={e => actualizar(item.id, { nombre: e.target.value })}
                    className={inputMini} />
                )}
              </div>
            )}
            {item.tipo === 'pastoreo' && (
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="block text-[8px] text-ink-700/50">Cabezas</label>
                  <input type="number" min={1} value={item.cabezas ?? 20}
                    onChange={e => actualizar(item.id, { cabezas: Math.max(1, parseInt(e.target.value) || 1) })}
                    className={inputMini} />
                </div>
                <div>
                  <label className="block text-[8px] text-ink-700/50">Especie</label>
                  <select value={item.especie ?? 'bovino'}
                    onChange={e => actualizar(item.id, { especie: e.target.value as EspecieGanado })}
                    className={inputMini + ' cursor-pointer'}>
                    {(Object.entries(EQUIV_EV) as [EspecieGanado, { label: string }][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] text-ink-700/50">EV/ha</label>
                  <input type="number" min={0.1} step={0.1} value={item.receptividad ?? 0.7}
                    onChange={e => actualizar(item.id, { receptividad: Math.max(0.1, parseFloat(e.target.value) || 0.7) })}
                    className={inputMini} />
                </div>
              </div>
            )}
            {(item.tipo === 'cultivo' || item.tipo === 'frutales') && (
              <div className="flex items-center gap-1.5">
                <label className="text-[9px] text-ink-700/60 shrink-0">Hectáreas</label>
                <input type="number" min={0.1} step={0.5} value={item.hectareas ?? 1}
                  onChange={e => actualizar(item.id, { hectareas: Math.max(0.1, parseFloat(e.target.value) || 1) })}
                  className={inputMini + ' w-16'} />
              </div>
            )}
            {item.tipo === 'reservorio' && (
              <div className="flex items-center gap-1.5">
                <label className="text-[9px] text-ink-700/60 shrink-0">Ha a regar</label>
                <input type="number" min={0.1} step={0.5} value={item.hectareas ?? 1}
                  onChange={e => actualizar(item.id, { hectareas: Math.max(0.1, parseFloat(e.target.value) || 1) })}
                  className={inputMini + ' w-16'} />
              </div>
            )}

            <p className="text-[8px] text-ink-700/45 italic leading-tight">{dim.detalle}</p>
          </div>
        );
      })}

      {/* ── Agregar ítem ── */}
      <div className="flex items-center gap-1">
        <select value={tipoNuevo} onChange={e => setTipoNuevo(e.target.value as TipoItemPrograma)}
          className={inputMini + ' flex-1 cursor-pointer'}>
          {(Object.entries(TIPOS_ITEM) as [TipoItemPrograma, typeof TIPOS_ITEM[TipoItemPrograma]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>
        <button onClick={agregar}
          className="shrink-0 flex items-center gap-0.5 px-2 py-1 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded text-[9px] font-semibold transition-colors">
          <Plus className="w-3 h-3" />Agregar
        </button>
      </div>

      {/* ── Total y validación ── */}
      {programa.length > 0 && (
        <div className={`rounded-lg px-2 py-1.5 text-[9px] leading-tight ${excede ? 'bg-clay-50 text-clay-700 border border-clay-200' : 'bg-bone-50 text-ink-700/60'}`}>
          Superficie requerida: <strong className="font-mono">{totalHa.toFixed(1)} ha</strong>
          {areaPredioHa !== null && <> · Predio: <strong className="font-mono">{areaPredioHa.toFixed(1)} ha</strong></>}
          {excede && <> — ⚠ el programa no entra completo en el predio</>}
        </div>
      )}

      {/* ── Generar ── */}
      {programa.length > 0 && (
        <button onClick={onGenerar}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-ink-950 hover:bg-ink-700 text-bone-50 rounded-lg text-[10px] font-bold transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          {masterPlan?.length ? 'Regenerar master plan' : 'Generar master plan'}
        </button>
      )}

      {/* ── Resultados ── */}
      {masterPlan && masterPlan.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[9px] font-bold text-ink-800 uppercase tracking-wider">Ubicaciones sugeridas</p>
          {masterPlan.map(el => {
            const def = TIPOS_ITEM[el.tipo];
            const scoreColor = el.score >= 68 ? '#2E7D32' : el.score >= 45 ? '#E65100' : '#B71C1C';
            return (
              <ResultadoMPRow key={el.id} el={el} def={def} scoreColor={scoreColor}
                onConvertir={() => onConvertirZona(el)} onDescartar={() => onDescartar(el.id)} />
            );
          })}
          <p className="text-[8px] text-ink-700/40 italic leading-tight">
            Línea punteada en el mapa = sugerencia. «Crear zona» la convierte en zona editable.
          </p>
        </div>
      )}
    </div>
  );
}

function ResultadoMPRow({ el, def, scoreColor, onConvertir, onDescartar }: {
  el: ElementoMasterPlan;
  def: typeof TIPOS_ITEM[TipoItemPrograma];
  scoreColor: string;
  onConvertir: () => void;
  onDescartar: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  return (
    <div className="rounded-lg border border-bone-200 overflow-hidden bg-white">
      <button onClick={() => setExpandido(v => !v)} className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left hover:bg-bone-50">
        <span className="text-sm leading-none shrink-0">{def.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-ink-900 truncate">{el.nombre}</p>
          <p className="text-[8px] font-mono text-ink-700/40">{formatearArea(el.area_m2)}</p>
        </div>
        <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: scoreColor }}>{el.score}%</span>
      </button>
      {expandido && (
        <div className="px-2 pb-2 space-y-1.5 border-t border-bone-100 pt-1.5">
          <div className="flex flex-wrap gap-1">
            {el.motivos.map((m, i) => (
              <span key={i} className="text-[8px] bg-bone-50 text-ink-700/70 px-1.5 py-0.5 rounded-full border border-bone-200">{m}</span>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={onConvertir}
              className="flex-1 py-1 bg-moss-700 hover:bg-moss-900 text-white rounded text-[9px] font-semibold transition-colors">
              ✓ Crear zona
            </button>
            <button onClick={onDescartar}
              className="px-2 py-1 bg-bone-100 hover:bg-bone-200 text-ink-700 rounded text-[9px] font-semibold transition-colors">
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
