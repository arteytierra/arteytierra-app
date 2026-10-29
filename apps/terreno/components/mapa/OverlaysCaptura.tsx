'use client';

/**
 * Los overlays del modo captura: el título, el norte con la barra de escala, la
 * leyenda editable, el rótulo de plano y los botones de la esquina.
 *
 * Vivían dentro de `MapaTerrenoApp`, que está en su techo de líneas, y se
 * movieron byte a byte: mismo JSX, mismos `id`, mismo orden.
 *
 * **Dónde se renderiza importa.** El padre lo pone DESPUÉS de `MapLeaflet` en el
 * DOM a propósito: `html-to-image` apila por orden del documento y no por
 * `z-index`, así que un `<OverlaysCaptura/>` mudado más arriba sale en el PNG con
 * el mapa encima de los rótulos.
 *
 * **Y la hoja de impresión vive acá, con los `id` que nombra.** `#captura-titulo`,
 * `#captura-leyenda`, `#captura-norte-escala` y `#captura-rotulo` se escriben en
 * este archivo y en ninguno otro; antes el `@media print` estaba mil líneas más
 * arriba que el JSX al que apunta, y renombrar un `id` acá no avisaba allá.
 */

import type { Dispatch, SetStateAction } from 'react';
import { Camera, X } from 'lucide-react';
import { Isotipo } from '../Isotipo';
import { can, type Plan } from '@/lib/entitlements';
import { ETIQUETA_RELIEVE, type FuenteRelieve } from '@/lib/grillaElevacion';
import type { ModalState } from '../Modal';

/** El cajetín del plano. `marca` y `logo` son el white-label del plan Estudio. */
export interface Rotulo {
  nombre: string; propietario: string; ubicacion: string;
  fecha: string; escala: string; autor: string;
  marca?: string; logo?: string;
}

/**
 * Un renglón de la leyenda. `icon` gana sobre `color`, y `dash` lo dibuja como
 * línea punteada en vez de parche; `color` admite un `linear-gradient(...)`
 * para las rampas de los shaders, y entonces no se puede editar con el
 * selector de color.
 */
export interface LeyItem { id: string; label: string; color?: string; dash?: boolean; icon?: string }

/**
 * Imprime sólo el mapa y sus overlays: esconde el resto del documento, desancla
 * los cuatro rótulos a `position: fixed` y los vuelve a mostrar uno por uno.
 * La hoja se inyecta, se usa y se saca a los 1,5 s, porque `window.print()` no
 * avisa cuándo terminó el diálogo del navegador.
 */
function imprimirMapa() {
  const style = document.createElement('style');
  style.id = '__print_map_style';
  style.textContent = `
    @media print {
      body > * { display: none !important; }
      #print-capture-root { display: block !important; visibility: visible !important; position: fixed !important; inset: 0 !important; }
      #print-capture-root > * { display: none !important; }
      #mapa-captura { display: block !important; visibility: visible !important; position: absolute !important; inset: 0 !important; }
      #mapa-captura * { display: block !important; visibility: visible !important; }
      #captura-titulo { display: block !important; visibility: visible !important; position: fixed !important; top: 16px !important; left: 16px !important; z-index: 99999 !important; background: white !important; border-radius: 8px !important; padding: 10px 14px !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; }
      #captura-leyenda { display: block !important; visibility: visible !important; position: fixed !important; bottom: 16px !important; right: 16px !important; z-index: 99999 !important; background: white !important; border-radius: 8px !important; padding: 12px !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; min-width: 160px !important; }
      #captura-norte-escala { display: flex !important; visibility: visible !important; position: fixed !important; bottom: 16px !important; left: 16px !important; z-index: 99999 !important; }
      #captura-rotulo { display: block !important; visibility: visible !important; position: fixed !important; bottom: 16px !important; right: 16px !important; z-index: 99999 !important; background: white !important; border-radius: 8px !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; }
      .no-print { display: none !important; }
      .leaflet-control-container { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => document.getElementById('__print_map_style')?.remove(), 1500);
}

interface Props {
  titulo: string;
  onTitulo: (v: string) => void;
  /** La barra de escala que ya calculó el mapa: su largo en píxeles y su rótulo. */
  escala: { pixeles: number; label: string };
  /** La fuente del relieve que se está viendo, para que el PNG la acredite. */
  fuenteShader: FuenteRelieve | null;
  leyenda: LeyItem[] | null;
  onLeyenda: Dispatch<SetStateAction<LeyItem[] | null>>;
  rotulo: Rotulo;
  onRotulo: Dispatch<SetStateAction<Rotulo>>;
  rotuloVisible: boolean;
  onRotuloVisible: () => void;
  /** La superficie del predio, que el rótulo imprime como un dato más. */
  areaHa: number | null;
  plan: Plan;
  guardandoPng: boolean;
  onGuardarPng: () => void;
  onCerrar: () => void;
  onModal: (m: ModalState) => void;
}

export function OverlaysCaptura({
  titulo, onTitulo, escala, fuenteShader,
  leyenda, onLeyenda, rotulo, onRotulo, rotuloVisible, onRotuloVisible,
  areaHa, plan, guardandoPng, onGuardarPng, onCerrar, onModal,
}: Props) {
  return (
    <>
      {/* ── Título (banda superior) — compacto, no tapa el mapa ─────────── */}
      <div id="captura-titulo" className="absolute top-1.5 left-3 z-[1001] pointer-events-auto flex items-baseline gap-2 max-w-[calc(100%-224px)]">
        <Isotipo className="w-6 h-6 self-center shrink-0 text-[#2E6B8A]" />
        <p className="font-display text-base font-bold text-ink-950 leading-tight truncate">
          {titulo || 'Mapa del terreno'}
        </p>
        <p className="text-[10px] text-ink-700/55 font-mono shrink-0">
          {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
        {/* Campo de edición — filtrado en PNG */}
        <input
          value={titulo}
          onChange={e => onTitulo(e.target.value)}
          placeholder="Título…"
          className="no-print w-40 text-xs bg-white border border-bone-200 rounded px-2 py-1 text-ink-950 focus:outline-none focus:ring-1 focus:ring-moss-500"
        />
      </div>

      {/* ── Norte + Escala (banda inferior) — fila ──────────────────────── */}
      <div id="captura-norte-escala" className="absolute bottom-1.5 left-3 z-[1001] flex flex-row items-center gap-2">
        {/* Flecha de norte */}
        <div className="flex items-center gap-1 bg-white border border-bone-200 rounded-lg px-2 py-1.5 shadow">
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <polygon points="9,1 14,14 9,11 4,14" fill="#1B3A2D" />
            <polygon points="9,21 4,8 9,11 14,8" fill="#9CA3AF" />
            <text x="9" y="10.5" textAnchor="middle" fontSize="5" fontWeight="700" fontFamily="sans-serif" fill="#FBF8F3">N</text>
          </svg>
        </div>
        {/* Barra de escala */}
        <div className="bg-white border border-bone-200 rounded-lg px-2 py-1.5 shadow flex flex-col items-start gap-0.5">
          <div className="flex items-end gap-0" style={{ width: `${escala.pixeles}px` }}>
            <div className="flex-1 h-1.5 border-l-2 border-r-2 border-b-2 border-ink-800" />
          </div>
          <span className="text-[9px] font-mono font-semibold text-ink-800">{escala.label}</span>
        </div>
        {/* Crédito de relieve (atribución en el PNG) */}
        {fuenteShader && (
          <div className="bg-white border border-bone-200 rounded-lg px-2 py-1.5 shadow">
            <span className="text-[8px] text-ink-700/70 font-mono">{ETIQUETA_RELIEVE[fuenteShader]}</span>
          </div>
        )}
      </div>

      {/* ── Leyenda (banda derecha, arriba) ────────────────────────────── */}
      {(leyenda ?? []).length > 0 && (
        <div id="captura-leyenda" className="absolute top-[60px] right-3 z-[1001] bg-white border border-bone-200 rounded-xl shadow-lg px-3 py-2.5 w-[196px]">
          <p className="text-[9px] font-bold text-ink-800 uppercase tracking-wider mb-1.5">Leyenda</p>

          {/* ─ Ítems estáticos (visibles en PNG) ─ */}
          <div className="space-y-1">
            {(leyenda ?? []).map(item => (
              <div key={item.id} className="flex items-center gap-1.5">
                {item.icon ? (
                  <span className="text-sm leading-none w-4 shrink-0 text-center">{item.icon}</span>
                ) : item.dash ? (
                  <span className="w-4 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: item.color }} />
                ) : (
                  <span className="w-4 h-3 rounded-sm shrink-0" style={{ background: item.color ?? '#999' }} />
                )}
                <span className="text-[10px] text-ink-800 leading-tight flex-1 truncate">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-ink-700/30 mt-1.5 font-mono italic">Arte y Tierra</p>

          {/* ─ Panel edición (no-print) — scrollable ─ */}
          <div className="no-print mt-2.5 pt-2.5 border-t border-bone-200 space-y-1 max-h-48 overflow-y-auto">
            <p className="text-[9px] text-moss-700 font-semibold mb-1 sticky top-0 bg-white pb-0.5">✏ Editar leyenda</p>
            {(leyenda ?? []).map(item => (
              <div key={`ed-${item.id}`} className="flex items-center gap-1">
                {item.icon ? (
                  <span className="text-xs w-4 shrink-0 text-center">{item.icon}</span>
                ) : item.color?.startsWith('linear-gradient') ? (
                  <span className="w-3 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                ) : (
                  <input
                    type="color"
                    value={item.color ?? '#999999'}
                    onChange={e => onLeyenda(prev => prev?.map(x => x.id === item.id ? { ...x, color: e.target.value } : x) ?? null)}
                    className="w-4 h-4 shrink-0 cursor-pointer border border-bone-200 rounded p-0 bg-transparent"
                    title="Color del ítem"
                  />
                )}
                <input
                  type="text"
                  defaultValue={item.label}
                  onBlur={e => {
                    const v = e.target.value.trim();
                    if (v) onLeyenda(prev => prev?.map(x => x.id === item.id ? { ...x, label: v } : x) ?? null);
                    else e.target.value = item.label;
                  }}
                  className="flex-1 min-w-0 text-[9px] text-ink-800 bg-bone-50 border border-bone-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-moss-500"
                />
                <button
                  onClick={() => onLeyenda(prev => prev?.filter(x => x.id !== item.id) ?? null)}
                  className="shrink-0 text-ink-700/25 hover:text-clay-500 transition-colors"
                  title="Quitar de leyenda"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              className="w-full flex items-center justify-center gap-1 mt-1 py-1 rounded text-[9px] text-moss-700 hover:bg-bone-50 transition-colors border border-dashed border-bone-200"
              onClick={() => onModal({
                type: 'prompt', message: 'Texto para el ítem de leyenda:', placeholder: 'Etiqueta…',
                onConfirm: label => onLeyenda(prev => [...(prev ?? []), { id: crypto.randomUUID(), label }]),
              })}
            >
              + Agregar ítem
            </button>
          </div>
        </div>
      )}

      {/* ── Rótulo de plano (bottom-right, sobre la leyenda) ─────────── */}
      {rotuloVisible && (
        <div id="captura-rotulo" className="absolute bottom-[56px] right-3 z-[1002] bg-white border border-bone-300 rounded-xl shadow-lg overflow-hidden w-[196px]">
          {/* Banda de marca (cajetín profesional) — white-label en plan Estudio */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-ink-950 text-bone-50">
            {can(plan, 'informe.white_label') && rotulo.logo
              ? <img src={rotulo.logo} alt="" className="w-5 h-5 object-contain shrink-0 bg-bone-50 rounded p-0.5" />
              : <Isotipo className="w-5 h-5 shrink-0" />}
            <div className="leading-none flex-1 min-w-0">
              <p className="text-[6px] uppercase tracking-[0.2em] text-bone-50/60">{(can(plan, 'informe.white_label') && rotulo.marca) || 'Arte y Tierra'}</p>
              <p className="text-[9px] font-bold truncate">{rotulo.nombre || 'Plano del terreno'}</p>
            </div>
            {/* Norte */}
            <svg width="14" height="18" viewBox="0 0 18 22" fill="none" className="shrink-0">
              <polygon points="9,1 14,14 9,11 4,14" fill="#FBF8F3" />
              <polygon points="9,21 4,8 9,11 14,8" fill="#FBF8F3" opacity="0.4" />
              <text x="9" y="10.5" textAnchor="middle" fontSize="5" fontWeight="700" fontFamily="sans-serif" fill="#1B3A2D">N</text>
            </svg>
          </div>
          {/* Contenido visible en PNG */}
          <table className="text-[8px] text-ink-800 w-full border-collapse">
            <tbody>
              {([
                ['Propietario',  rotulo.propietario],
                ['Ubicación',    rotulo.ubicacion],
                ['Superficie',   areaHa != null ? `${areaHa.toFixed(2)} ha` : ''],
                ['Fecha',        rotulo.fecha],
                ['Escala',       rotulo.escala || `barra ${escala.label}`],
                ['Autor',        rotulo.autor],
              ] as [string, string][]).filter(([,v]) => v).map(([k, v]) => (
                <tr key={k} className="border-t border-bone-200/60">
                  <td className="px-2 py-0.5 font-semibold text-ink-700/60 whitespace-nowrap border-r border-bone-200/60 bg-bone-50">{k}</td>
                  <td className="px-2 py-0.5 font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Formulario de edición — filtrado en PNG */}
          <div className="no-print border-t border-bone-200 p-2 space-y-1 bg-bone-50/50">
            <p className="text-[9px] text-moss-700 font-semibold">✏ Editar rótulo</p>
            {([
              ['nombre',      'Predio'],
              ['propietario', 'Propietario'],
              ['ubicacion',   'Ubicación'],
              ['fecha',       'Fecha'],
              ['escala',      'Escala (ej: 1:2000)'],
              ['autor',       'Autor'],
            ] as [keyof Rotulo, string][]).map(([field, label]) => (
              <input
                key={field}
                value={rotulo[field] ?? ''}
                onChange={e => onRotulo(r => ({ ...r, [field]: e.target.value }))}
                placeholder={label}
                className="w-full text-[9px] border border-bone-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
              />
            ))}
            {/* Marca propia (white-label) — plan Estudio */}
            {can(plan, 'informe.white_label') ? (
              <div className="pt-1 mt-1 border-t border-bone-200 space-y-1">
                <p className="text-[8px] uppercase tracking-wider text-water-700 font-semibold">Tu marca</p>
                <input
                  value={rotulo.marca ?? ''}
                  onChange={e => onRotulo(r => ({ ...r, marca: e.target.value }))}
                  placeholder="Nombre de tu estudio / marca"
                  className="w-full text-[9px] border border-bone-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-moss-500"
                />
                <div className="flex items-center gap-1.5">
                  <label className="flex-1 text-[9px] text-center border border-dashed border-water-500/40 text-water-700 rounded px-1.5 py-1 bg-white hover:bg-water-500/5 cursor-pointer transition-colors">
                    {rotulo.logo ? 'Cambiar logo' : 'Subir logo'}
                    <input
                      type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        if (file.size > 400_000) { onModal({ type: 'alert', message: 'El logo es muy pesado (máx. 400 KB). Reducilo antes de subirlo.' }); return; }
                        const reader = new FileReader();
                        reader.onload = () => onRotulo(r => ({ ...r, logo: String(reader.result) }));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {rotulo.logo && (
                    <button
                      onClick={() => onRotulo(r => ({ ...r, logo: undefined }))}
                      title="Quitar logo propio"
                      className="shrink-0 p-1 text-ink-700/40 hover:text-clay-600 transition-colors"
                    ><X className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            ) : (
              <p className="pt-1 mt-1 border-t border-bone-200 text-[8px] text-ink-700/50 leading-tight">
                🔒 Logo y marca propios todavía no forman parte de los planes públicos.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Controles de captura (no-print) ──────────────────────────── */}
      <div className="absolute top-4 right-4 z-[1002] flex items-center gap-2 no-print">
        <button
          onClick={onGuardarPng}
          disabled={guardandoPng}
          className="flex items-center gap-1.5 px-3 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          {guardandoPng
            ? <><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />Guardando…</>
            : <><Camera className="w-3.5 h-3.5" />Guardar PNG</>}
        </button>
        <button
          onClick={imprimirMapa}
          className="flex items-center gap-1.5 px-3 py-2 bg-ink-950 hover:bg-ink-700 text-bone-50 rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Imprimir / PDF
        </button>
        <button
          onClick={onRotuloVisible}
          title="Mostrar/ocultar rótulo de plano"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors ${rotuloVisible ? 'bg-moss-100 text-moss-900 border border-moss-300' : 'bg-white border border-bone-200 text-ink-700 hover:bg-bone-50'}`}
        >
          Rótulo
        </button>
        <button
          onClick={onCerrar}
          className="p-2 bg-white border border-bone-200 hover:bg-bone-50 text-ink-700 rounded-lg shadow-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
