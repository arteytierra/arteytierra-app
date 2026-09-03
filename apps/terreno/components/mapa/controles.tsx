'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Mountain, X, PenLine, FileDown, FileUp, ImagePlus } from 'lucide-react';
import { decimalAGMS } from '@/lib/coordenadas';
import { ICONOS_PIN, type Pin } from '@/lib/pines';
import type { OverlayImagen } from '../MapLeaflet';
import type { Mojon } from '@/lib/types';

/**
 * Los controles chicos de /mapa: la barra de estado de abajo (estilo CAD), la
 * entrada por coordenadas y las filas de mojón, pin y exportación.
 *
 * Todos son de dibujo —reciben lo que muestran y avisan lo que el usuario
 * hizo—, así que salieron de MapaTerrenoApp sin tocarles una línea.
 */

// ─── Ítem del menú Exportar ───────────────────────────────────────────────────
export function ExportItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink-700 hover:bg-bone-50 transition-colors text-left">
      <span className="text-ink-700/50 shrink-0">{icon}</span>{label}
    </button>
  );
}

// ─── Fila de mojón ────────────────────────────────────────────────────────────

export function MojonItem({ mojon, seleccionado, onSelect, onDelete }: {
  mojon: Mojon; seleccionado: boolean; onSelect: () => void; onDelete: () => void;
}) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${seleccionado ? 'bg-moss-100 border-moss-300' : 'bg-white border-bone-200 hover:border-moss-200'}`}>
      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${seleccionado ? 'bg-sun-500 text-ink-950' : 'bg-moss-700 text-bone-50'}`}>
        {mojon.numero}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-ink-700 leading-none truncate">{decimalAGMS(mojon.lat, true)} {decimalAGMS(mojon.lng, false)}</p>
        <p className="text-xs font-mono text-ink-700/50 leading-none mt-0.5 truncate">{mojon.lat.toFixed(5)}, {mojon.lng.toFixed(5)}</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(); }} className="shrink-0 text-ink-700/25 hover:text-danger-500 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Fila de pin ──────────────────────────────────────────────────────────────

export function PinItem({ pin, editando, onEdit, onUpdate, onDelete }: {
  pin: Pin; editando: boolean; onEdit: () => void;
  onUpdate: (campo: Partial<Pin>) => void; onDelete: () => void;
}) {
  const inputCls = 'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <span className="text-base leading-none">{pin.icono}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-900 truncate">{pin.nombre}</p>
          <p className="text-[9px] font-mono text-ink-700/40">{pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}</p>
        </div>
        <button onClick={onEdit} className="shrink-0 text-ink-700/30 hover:text-moss-700 transition-colors">
          <PenLine className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="shrink-0 text-ink-700/30 hover:text-clay-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {editando && (
        <div className="border-t border-bone-200 p-2.5 space-y-2">
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Nombre</label>
            <input className={inputCls} value={pin.nombre} onChange={e => onUpdate({ nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Ícono</label>
            <div className="flex flex-wrap gap-1">
              {ICONOS_PIN.map(ic => (
                <button key={ic} onClick={() => onUpdate({ icono: ic })}
                  className={`text-base px-1.5 py-0.5 rounded transition-colors ${pin.icono === ic ? 'bg-moss-100 ring-1 ring-moss-400' : 'hover:bg-bone-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Color del marcador</label>
            <div className="flex items-center gap-2">
              <input type="color" value={pin.color} onChange={e => onUpdate({ color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-bone-200 p-0.5" />
              <span className="text-[10px] font-mono text-ink-700/50">{pin.color}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Notas</label>
            <textarea className={inputCls + ' resize-none'} rows={2} value={pin.notas} onChange={e => onUpdate({ notas: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] text-ink-700/60 mb-1">Coordenadas</label>
            <div className="flex gap-1">
              <input type="number" step="0.00001"
                value={pin.lat}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onUpdate({ lat: v }); }}
                className={inputCls + ' w-1/2'}
                title="Latitud"
              />
              <input type="number" step="0.00001"
                value={pin.lng}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onUpdate({ lng: v }); }}
                className={inputCls + ' w-1/2'}
                title="Longitud"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Elegir la rampa de color de un shader.
 *
 * Muestra el degradé de cada opción en vez de sólo su nombre: la pregunta que se
 * está contestando es «¿cómo se va a ver?», y un nombre no la contesta. La nota
 * de cada paleta va como `title`, para el caso en que dos se parezcan de lejos.
 */

// ─── Entrada por coordenadas relativas (distancia<azimut) ──────────────────────
function EntradaCoordenada({ onEnviar }: { onEnviar: (distM: number, azDeg: number | null) => boolean }) {
  const [valor, setValor] = useState('');
  const [error, setError] = useState(false);

  const enviar = () => {
    const txt = valor.trim();
    // Con ángulo: "20<90", "20 90", "20@90"  ·  Solo largo: "20" (usa dirección del cursor)
    const conAng = txt.match(/^(-?\d+(?:[.,]\d+)?)\s*[<@ ]\s*(-?\d+(?:[.,]\d+)?)$/);
    const soloLargo = txt.match(/^(\d+(?:[.,]\d+)?)$/);
    let dist: number, az: number | null;
    if (conAng) { dist = parseFloat(conAng[1]!.replace(',', '.')); az = parseFloat(conAng[2]!.replace(',', '.')); }
    else if (soloLargo) { dist = parseFloat(soloLargo[1]!.replace(',', '.')); az = null; }
    else { setError(true); return; }
    if (!Number.isFinite(dist) || dist <= 0) { setError(true); return; }
    const ok = onEnviar(dist, az);
    if (ok) { setValor(''); setError(false); } else { setError(true); }
  };

  return (
    <div className="flex items-center gap-1.5" style={{ pointerEvents: 'auto' }}>
      <span className="text-[10px] text-bone-50/50 font-mono" title="Escribí el largo en metros (usa la dirección del cursor) o largo<ángulo">m / m&lt;°</span>
      <input
        value={valor}
        onChange={e => { setValor(e.target.value); setError(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); enviar(); } e.stopPropagation(); }}
        placeholder="20 · 20<90"
        className={`w-24 text-[11px] font-mono bg-white/95 rounded px-2 py-0.5 text-ink-900 focus:outline-none ${error ? 'ring-1 ring-clay-500' : ''}`}
      />
      <button onClick={enviar} className="text-[10px] font-semibold text-bone-50 bg-moss-700 hover:bg-moss-600 rounded px-2 py-0.5 transition-colors">
        +punto
      </button>
    </div>
  );
}

// ─── Coordenadas del cursor (lee un ref por rAF → aísla los re-renders) ─────────
function CursorCoords({ cursorRef }: { cursorRef: React.RefObject<{ lat: number; lng: number } | null> }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = cursorRef.current;
      setPos(prev => {
        if (!c) return prev;
        if (prev && Math.abs(prev.lat - c.lat) < 1e-7 && Math.abs(prev.lng - c.lng) < 1e-7) return prev;
        return { lat: c.lat, lng: c.lng };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cursorRef]);
  return (
    <span className="tabular-nums whitespace-nowrap" title="Coordenadas del cursor">
      {pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : '—, —'}
    </span>
  );
}

// ─── Barra de estado inferior (estilo CAD) ──────────────────────────────────────
export function BarraEstado({
  cursorRef, escala, snapActivo, orthoActivo, onToggleSnap, onToggleOrtho,
  modoLabel, entradaActiva, onEntradaCoord, areaHa, nMojones,
  onExportarDXF, onImportarDXF, overlay, onCargarImagen, onCargarGeoTIFF, onOpacidadOverlay, onQuitarOverlay,
  onCargarDEM, onQuitarDEM, demCargado,
  onAbrirPaleta, onAbrirAyuda,
}: {
  cursorRef:        React.RefObject<{ lat: number; lng: number } | null>;
  escala:           { metros: number; pixeles: number; label: string };
  snapActivo:       boolean;
  orthoActivo:      boolean;
  onToggleSnap:     () => void;
  onToggleOrtho:    () => void;
  modoLabel:        string;
  entradaActiva:    boolean;
  onEntradaCoord:   (distM: number, azDeg: number | null) => boolean;
  areaHa:           number | null;
  nMojones:         number;
  onExportarDXF:    () => void;
  onImportarDXF:    (file: File) => void;
  overlay:          OverlayImagen | null;
  onCargarImagen:   (file: File) => void;
  onCargarGeoTIFF:  (file: File) => void;
  onOpacidadOverlay:(op: number) => void;
  onQuitarOverlay:  () => void;
  onCargarDEM:      (file: File) => void;
  onQuitarDEM:      () => void;
  demCargado:       boolean;
  onAbrirPaleta:    () => void;
  onAbrirAyuda:     () => void;
}) {
  const [cadOpen, setCadOpen] = useState(false);
  const tog = 'flex items-center gap-1 px-2 h-5 rounded text-[10px] font-bold tracking-wide transition-colors';

  return (
    <footer className="relative flex items-center gap-2.5 h-7 px-3 bg-ink-950 text-bone-50/75 text-[11px] font-mono shrink-0 border-t border-ink-800 z-[1200] no-print">
      {/* Modo activo */}
      <span className="flex items-center gap-1.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${modoLabel === 'Listo' ? 'bg-bone-50/30' : 'bg-moss-400 animate-pulse'}`} />
        <span className="truncate text-bone-50/90">{modoLabel}</span>
      </span>

      <span className="w-px h-3.5 bg-ink-700" />

      {/* SNAP / ORTO */}
      <button onClick={onToggleSnap} title="Snap a puntos (F3)"
        className={`${tog} ${snapActivo ? 'bg-moss-700 text-bone-50' : 'text-bone-50/40 hover:bg-ink-800'}`}>
        SNAP
      </button>
      <button onClick={onToggleOrtho} title="Modo ortogonal 90° (F8)"
        className={`${tog} ${orthoActivo ? 'bg-moss-700 text-bone-50' : 'text-bone-50/40 hover:bg-ink-800'}`}>
        ORTO
      </button>

      {/* Entrada dinámica de medidas (solo dibujando/midiendo) */}
      {entradaActiva && (
        <>
          <span className="w-px h-3.5 bg-ink-700" />
          <EntradaCoordenada onEnviar={onEntradaCoord} />
        </>
      )}

      <div className="flex-1" />

      {/* Resumen del predio */}
      {nMojones > 0 && (
        <span className="hidden sm:inline text-bone-50/55 whitespace-nowrap">
          {nMojones} mojón{nMojones !== 1 ? 'es' : ''}{areaHa ? ` · ${areaHa.toFixed(2)} ha` : ''}
        </span>
      )}
      <span className="w-px h-3.5 bg-ink-700 hidden sm:inline-block" />

      {/* Coordenadas del cursor */}
      <CursorCoords cursorRef={cursorRef} />

      <span className="w-px h-3.5 bg-ink-700" />

      {/* Escala */}
      <span className="flex items-center gap-1.5 whitespace-nowrap" title="Escala gráfica aproximada">
        <span className="inline-block border-l-2 border-r-2 border-b-2 border-bone-50/60 h-1.5" style={{ width: Math.min(escala.pixeles, 60) }} />
        {escala.label}
      </span>

      <span className="w-px h-3.5 bg-ink-700" />

      {/* Paleta de comandos + ayuda */}
      <button onClick={onAbrirPaleta} title="Paleta de comandos (Ctrl+K)"
        className={`${tog} text-bone-50/55 hover:bg-ink-800`}>
        ⌘K
      </button>
      <button onClick={onAbrirAyuda} title="Atajos de teclado (?)"
        className={`${tog} text-bone-50/55 hover:bg-ink-800`}>
        ?
      </button>

      <span className="w-px h-3.5 bg-ink-700" />

      {/* Archivo CAD / plano (popover) */}
      <div className="relative">
        <button onClick={() => setCadOpen(o => !o)} title="Archivo CAD / plano de referencia"
          className={`${tog} ${cadOpen || overlay ? 'bg-ink-700 text-bone-50' : 'text-bone-50/55 hover:bg-ink-800'}`}>
          <FileDown className="w-3 h-3" /> CAD
        </button>
        {cadOpen && (
          <>
            <div className="fixed inset-0 z-[1250]" onClick={() => setCadOpen(false)} />
            <div className="absolute bottom-7 right-0 z-[1300]">
              <PanelArchivoCAD
                onExportarDXF={() => { onExportarDXF(); setCadOpen(false); }}
                onImportarDXF={onImportarDXF}
                overlay={overlay}
                onCargarImagen={onCargarImagen}
                onCargarGeoTIFF={onCargarGeoTIFF}
                onOpacidad={onOpacidadOverlay}
                onQuitarImagen={onQuitarOverlay}
                onCargarDEM={onCargarDEM}
                onQuitarDEM={onQuitarDEM}
                demCargado={demCargado}
              />
            </div>
          </>
        )}
      </div>
    </footer>
  );
}

// ─── Panel de archivo CAD / plano de referencia ────────────────────────────────
function PanelArchivoCAD({
  onExportarDXF, onImportarDXF, overlay, onCargarImagen, onCargarGeoTIFF, onOpacidad, onQuitarImagen,
  onCargarDEM, onQuitarDEM, demCargado,
}: {
  onExportarDXF:  () => void;
  onImportarDXF:  (file: File) => void;
  overlay:        OverlayImagen | null;
  onCargarImagen: (file: File) => void;
  onCargarGeoTIFF: (file: File) => void;
  onOpacidad:     (op: number) => void;
  onQuitarImagen: () => void;
  onCargarDEM:    (file: File) => void;
  onQuitarDEM:    () => void;
  demCargado:     boolean;
}) {
  const dxfRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const tifRef = useRef<HTMLInputElement>(null);
  const demRef = useRef<HTMLInputElement>(null);
  const btn = 'flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors';

  return (
    <div className="flex flex-col gap-1 p-1.5 bg-white/97 backdrop-blur-sm rounded-xl shadow-paper border border-bone-200 w-44">
      <p className="text-[8px] uppercase tracking-wide text-ink-700/50 px-0.5">Archivo CAD / plano</p>
      <div className="flex gap-1">
        <button onClick={onExportarDXF} title="Exportar dibujos a DXF (AutoCAD)" className={`${btn} bg-moss-700 hover:bg-moss-600 text-white`}>
          <FileDown className="w-3 h-3" /> DXF
        </button>
        <button onClick={() => dxfRef.current?.click()} title="Importar un archivo DXF" className={`${btn} bg-bone-100 hover:bg-bone-200 text-ink-700`}>
          <FileUp className="w-3 h-3" /> DXF
        </button>
      </div>
      <input ref={dxfRef} type="file" accept=".dxf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onImportarDXF(f); e.target.value = ''; }} />

      {!overlay ? (
        <button onClick={() => imgRef.current?.click()} title="Pegar una imagen de plano para calcar encima"
          className={`${btn} bg-bone-100 hover:bg-bone-200 text-ink-700`}>
          <ImagePlus className="w-3 h-3" /> Pegar plano
        </button>
      ) : (
        <div className="space-y-1 px-0.5 pt-0.5 border-t border-bone-200">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-ink-700/60">Opacidad plano</span>
            <button onClick={onQuitarImagen} title="Quitar plano" className="text-ink-700/40 hover:text-clay-500">
              <X className="w-3 h-3" />
            </button>
          </div>
          <input type="range" min={0} max={1} step={0.05} value={overlay.opacidad}
            onChange={e => onOpacidad(parseFloat(e.target.value))} className="w-full accent-moss-700" />
          <p className="text-[8px] text-ink-700/40 leading-tight">Arrastrá ↙ ↗ para escalar y ✥ para mover.</p>
        </div>
      )}
      <input ref={imgRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onCargarImagen(f); e.target.value = ''; }} />

      <button onClick={() => tifRef.current?.click()} title="Importar un GeoTIFF de dron o IGN (se georreferencia solo)"
        className={`${btn} bg-bone-100 hover:bg-bone-200 text-ink-700`}>
        <ImagePlus className="w-3 h-3" /> GeoTIFF
      </button>
      <input ref={tifRef} type="file" accept=".tif,.tiff,image/tiff" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onCargarGeoTIFF(f); e.target.value = ''; }} />

      <button onClick={() => demRef.current?.click()}
        title="Importar un modelo de elevación propio (dron RTK, estación total, MDE oficial). Reemplaza al satelital para las curvas de nivel."
        className={`${btn} ${demCargado ? 'bg-moss-100 text-moss-900 hover:bg-moss-200' : 'bg-bone-100 hover:bg-bone-200 text-ink-700'}`}>
        <Mountain className="w-3 h-3" /> {demCargado ? 'MDE propio ✓' : 'MDE propio'}
      </button>
      {demCargado && (
        <button onClick={onQuitarDEM} className="text-[9px] text-clay-700 hover:underline px-0.5 text-left">
          Volver al modelo satelital
        </button>
      )}
      <input ref={demRef} type="file" accept=".tif,.tiff,image/tiff" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onCargarDEM(f); e.target.value = ''; }} />
    </div>
  );
}
