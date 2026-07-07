'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, PenLine, Copy, RefreshCw } from 'lucide-react';

export interface EscenarioMeta { id: string; nombre: string; creado: string }

interface Props {
  escenarios:   EscenarioMeta[];
  activoId:     string | null;
  onGuardarNuevo: (nombre: string) => void;
  onCargar:     (id: string) => void;
  onActualizar: (id: string) => void;
  onRenombrar:  (id: string, nombre: string) => void;
  onEliminar:   (id: string) => void;
}

export function EscenariosPanel({ escenarios, activoId, onGuardarNuevo, onCargar, onActualizar, onRenombrar, onEliminar }: Props) {
  const [nuevo, setNuevo]       = useState('');
  const [editId, setEditId]     = useState<string | null>(null);
  const [editNom, setEditNom]   = useState('');

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Escenarios</p>
        <p className="text-[10px] text-ink-700/55 leading-relaxed mt-0.5">
          Guardá variantes del diseño (Opción A, B…) y alterná entre ellas sin perder ninguna.
        </p>
      </div>

      {/* Guardar nuevo */}
      <div className="flex gap-1.5">
        <input
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && nuevo.trim()) { onGuardarNuevo(nuevo.trim()); setNuevo(''); } }}
          placeholder="Nombre del escenario…"
          className="flex-1 min-w-0 text-xs bg-white border border-bone-200 rounded-lg px-2 py-1.5 text-ink-900 placeholder-ink-700/30 focus:outline-none focus:border-moss-500"
        />
        <button
          onClick={() => { if (nuevo.trim()) { onGuardarNuevo(nuevo.trim()); setNuevo(''); } }}
          disabled={!nuevo.trim()}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Guardar
        </button>
      </div>

      {escenarios.length === 0 ? (
        <p className="text-[11px] text-ink-700/45 text-center py-2">Todavía no guardaste escenarios.</p>
      ) : (
        <div className="space-y-1.5">
          {escenarios.map(esc => {
            const activo = esc.id === activoId;
            return (
              <div key={esc.id} className={`rounded-xl border p-2.5 transition-colors ${activo ? 'bg-moss-100/60 border-moss-300' : 'bg-white border-bone-200'}`}>
                {editId === esc.id ? (
                  <div className="flex gap-1.5">
                    <input
                      autoFocus value={editNom} onChange={e => setEditNom(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { onRenombrar(esc.id, editNom || esc.nombre); setEditId(null); } if (e.key === 'Escape') setEditId(null); }}
                      className="flex-1 min-w-0 text-xs bg-white border border-moss-300 rounded px-2 py-1 focus:outline-none"
                    />
                    <button onClick={() => { onRenombrar(esc.id, editNom || esc.nombre); setEditId(null); }} className="text-moss-700"><Check className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-900 truncate flex items-center gap-1.5">
                        {activo && <span className="w-1.5 h-1.5 rounded-full bg-moss-600 shrink-0" />}
                        {esc.nombre}
                      </p>
                      <p className="text-[9px] text-ink-700/45 font-mono">{new Date(esc.creado).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button onClick={() => { setEditId(esc.id); setEditNom(esc.nombre); }} title="Renombrar" className="shrink-0 text-ink-700/30 hover:text-moss-700 transition-colors"><PenLine className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onEliminar(esc.id)} title="Eliminar" className="shrink-0 text-ink-700/30 hover:text-clay-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                {editId !== esc.id && (
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => onCargar(esc.id)}
                      disabled={activo}
                      className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-semibold bg-bone-100 hover:bg-moss-100 disabled:opacity-40 text-ink-700 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> {activo ? 'En uso' : 'Cargar'}
                    </button>
                    <button
                      onClick={() => onActualizar(esc.id)}
                      title="Reemplazar con el diseño actual"
                      className="flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-bone-100 hover:bg-bone-200 text-ink-700 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Actualizar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
