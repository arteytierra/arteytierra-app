'use client';

/**
 * Sugerencias Master Plan (grupo Diseño): el usuario marca la ZONA 0 (casa /
 * edificio principal), declara el programa del predio con su superficie, y el
 * motor ubica todo DENTRO del predio en relación a la zona 0 (zonas de
 * permacultura) y traza los caminos que conectan. Vive en el panel izquierdo,
 * separado del análisis de topografía.
 */
import { useState } from 'react';
import { Sparkles, Trash2, Plus, Target, DoorOpen, Mountain, ClipboardList, Compass, Droplets, LayoutGrid } from 'lucide-react';
import {
  TIPOS_ITEM, EQUIV_EV, dimensionarItem,
  type ItemPrograma, type TipoItemPrograma, type ElementoMasterPlan, type EspecieGanado,
} from '@/lib/masterplan';
import { formatearArea } from '@/lib/dibujos';

interface Props {
  programa:            ItemPrograma[];
  onPrograma:          (items: ItemPrograma[]) => void;
  masterPlan:          ElementoMasterPlan[] | null;
  onGenerarMasterPlan: () => void;
  onConvertirZona:     (el: ElementoMasterPlan) => void;
  onDescartarElemento: (id: string) => void;
  areaPredioHa:        number | null;
  zona0:               { lat: number; lng: number } | null;
  modoMarcarZona0:     boolean;
  onMarcarZona0:       () => void;
  onQuitarZona0:       () => void;
  acceso:              { lat: number; lng: number } | null;
  modoMarcarAcceso:    boolean;
  onMarcarAcceso:      () => void;
  onQuitarAcceso:      () => void;
  topoLista:           boolean;
  onIrATopo:           () => void;
  onIrAHerramienta:    (tab: string) => void;
}

export function MasterPlanPanel({
  programa, onPrograma, masterPlan, onGenerarMasterPlan,
  onConvertirZona, onDescartarElemento, areaPredioHa,
  zona0, modoMarcarZona0, onMarcarZona0, onQuitarZona0,
  acceso, modoMarcarAcceso, onMarcarAcceso, onQuitarAcceso,
  topoLista, onIrATopo, onIrAHerramienta,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-ink-900">
        <ClipboardList className="w-4 h-4 text-clay-700" />
        <h3 className="font-serif text-sm">Sugerencias Master Plan</h3>
      </div>
      <p className="text-[11px] text-ink-700/70 leading-relaxed">
        Marcá tu <b>zona 0</b> (casa / edificio principal) y el <b>punto de acceso</b> al terreno, declará el programa del predio con su superficie y el motor ubica las <b>viviendas y demás elementos</b> dentro del predio —en relación a la casa (zonas de permacultura)— y traza los <b>caminos</b> desde el acceso. Son sugerencias: creá zona, modificá o descartá.
      </p>

      {!topoLista ? (
        <div className="bg-sun-300/15 border border-sun-300 rounded-xl px-3 py-2.5 space-y-1.5">
          <p className="text-[11px] text-ink-900 leading-relaxed">
            Primero calculá la <b>topografía</b> del predio: el motor la usa para ubicar todo.
          </p>
          <button onClick={onIrATopo}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-ink-950 hover:bg-ink-700 text-bone-50 rounded-lg text-[11px] font-medium transition-colors">
            <Mountain className="w-3.5 h-3.5" /> Ir a Topografía
          </button>
        </div>
      ) : (
        <MasterPlanWizard
          programa={programa}
          onPrograma={onPrograma}
          masterPlan={masterPlan}
          onGenerar={onGenerarMasterPlan}
          onConvertirZona={onConvertirZona}
          onDescartar={onDescartarElemento}
          areaPredioHa={areaPredioHa}
          zona0={zona0}
          modoMarcarZona0={modoMarcarZona0}
          onMarcarZona0={onMarcarZona0}
          onQuitarZona0={onQuitarZona0}
          acceso={acceso}
          modoMarcarAcceso={modoMarcarAcceso}
          onMarcarAcceso={onMarcarAcceso}
          onQuitarAcceso={onQuitarAcceso}
        />
      )}

      {/* ── Herramientas relacionadas (viven en sus propias pestañas) ── */}
      <div className="pt-2 mt-1 border-t border-bone-200 space-y-1.5">
        <p className="text-[9px] font-bold text-ink-800/70 uppercase tracking-wider">Herramientas relacionadas</p>
        <div className="grid grid-cols-2 gap-1.5">
          <AccesoHerramienta icon={<Compass className="w-3.5 h-3.5" />}    label="Sectores"   detalle="sol · viento · fuego" onClick={() => onIrAHerramienta('sectores')} />
          <AccesoHerramienta icon={<Droplets className="w-3.5 h-3.5" />}   label="Balance hídrico" detalle="captación · riego" onClick={() => onIrAHerramienta('agua')} />
          <AccesoHerramienta icon={<LayoutGrid className="w-3.5 h-3.5" />} label="Potreros"   detalle="pastoreo rotativo" onClick={() => onIrAHerramienta('pastoreo')} />
        </div>
        <p className="text-[8px] text-ink-700/40 italic leading-tight">
          El master plan ubica los elementos; estas herramientas complementan el diseño con sus propios análisis.
        </p>
      </div>
    </div>
  );
}

function AccesoHerramienta({ icon, label, detalle, onClick }: {
  icon: React.ReactNode; label: string; detalle: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 bg-bone-50 hover:bg-bone-100 border border-bone-200 rounded-lg text-left transition-colors">
      <span className="text-clay-700 shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold text-ink-900 truncate">{label}</span>
        <span className="block text-[8px] text-ink-700/50 truncate">{detalle}</span>
      </span>
    </button>
  );
}

// ─── Master Plan Wizard ───────────────────────────────────────────────────────

const inputMini = 'w-full text-[10px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500';

function MasterPlanWizard({ programa, onPrograma, masterPlan, onGenerar, onConvertirZona, onDescartar, areaPredioHa, zona0, modoMarcarZona0, onMarcarZona0, onQuitarZona0, acceso, modoMarcarAcceso, onMarcarAcceso, onQuitarAcceso }: {
  programa:        ItemPrograma[];
  onPrograma:      (items: ItemPrograma[]) => void;
  masterPlan:      ElementoMasterPlan[] | null;
  onGenerar:       () => void;
  onConvertirZona: (el: ElementoMasterPlan) => void;
  onDescartar:     (id: string) => void;
  areaPredioHa:    number | null;
  zona0:           { lat: number; lng: number } | null;
  modoMarcarZona0: boolean;
  onMarcarZona0:   () => void;
  onQuitarZona0:   () => void;
  acceso:          { lat: number; lng: number } | null;
  modoMarcarAcceso: boolean;
  onMarcarAcceso:  () => void;
  onQuitarAcceso:  () => void;
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
    <div className="space-y-2">

      {/* ── Zona 0: casa / edificio principal (referencia del plan) ── */}
      <div className={`rounded-lg border p-2 space-y-1.5 ${zona0 ? 'border-moss-300 bg-moss-50/60' : 'border-sun-300 bg-sun-50/50'}`}>
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-moss-700 shrink-0" />
          <span className="flex-1 text-[10px] font-semibold text-ink-900">Zona 0 — casa / edificio principal</span>
          {zona0 && (
            <button onClick={onQuitarZona0} className="shrink-0 text-ink-700/25 hover:text-clay-500 transition-colors" title="Quitar zona 0">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {zona0
          ? <p className="text-[9px] font-mono text-ink-700/50">{zona0.lat.toFixed(5)}, {zona0.lng.toFixed(5)}</p>
          : <p className="text-[9px] text-ink-700/60 leading-tight">Marcá el punto central de tu casa: el motor ubica todo lo demás en relación a esta referencia (zonas de permacultura).</p>}
        <button onClick={onMarcarZona0}
          className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${modoMarcarZona0 ? 'bg-sun-400 text-ink-950' : 'bg-ink-900 hover:bg-ink-700 text-bone-50'}`}>
          <Target className="w-3 h-3" />
          {modoMarcarZona0 ? 'Hacé clic en el mapa…' : zona0 ? 'Reubicar zona 0' : 'Marcar zona 0 en el mapa'}
        </button>
      </div>

      {/* ── Punto de acceso al terreno (arranque de los caminos) ── */}
      <div className={`rounded-lg border p-2 space-y-1.5 ${acceso ? 'border-moss-300 bg-moss-50/60' : 'border-sun-300 bg-sun-50/50'}`}>
        <div className="flex items-center gap-1.5">
          <DoorOpen className="w-3.5 h-3.5 text-clay-700 shrink-0" />
          <span className="flex-1 text-[10px] font-semibold text-ink-900">Punto de acceso al terreno</span>
          {acceso && (
            <button onClick={onQuitarAcceso} className="shrink-0 text-ink-700/25 hover:text-clay-500 transition-colors" title="Quitar acceso">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {acceso
          ? <p className="text-[9px] font-mono text-ink-700/50">{acceso.lat.toFixed(5)}, {acceso.lng.toFixed(5)}</p>
          : <p className="text-[9px] text-ink-700/60 leading-tight">Marcá por dónde se entra al predio (tranquera / portón): los caminos del plan arrancan desde ahí.</p>}
        <button onClick={onMarcarAcceso}
          className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${modoMarcarAcceso ? 'bg-sun-400 text-ink-950' : 'bg-ink-900 hover:bg-ink-700 text-bone-50'}`}>
          <DoorOpen className="w-3 h-3" />
          {modoMarcarAcceso ? 'Hacé clic en el mapa…' : acceso ? 'Reubicar acceso' : 'Marcar acceso en el mapa'}
        </button>
      </div>

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

      {/* ── Generar (requiere zona 0 + acceso) ── */}
      {programa.length > 0 && (
        !zona0 || !acceso
          ? <p className="text-[10px] text-clay-700 leading-tight bg-clay-50 border border-clay-200 rounded-lg px-2 py-1.5">Marcá {!zona0 && !acceso ? <>la <b>zona 0</b> y el <b>punto de acceso</b></> : !zona0 ? <>la <b>zona 0</b></> : <>el <b>punto de acceso</b></>} arriba para poder generar el master plan.</p>
          : <button onClick={onGenerar}
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
