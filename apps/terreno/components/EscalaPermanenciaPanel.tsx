'use client';

/**
 * Bitácora de la Escala de Permanencia (Yeomans) — checklist de diseño de TODO el
 * predio, de lo más permanente a lo más cambiable. Vive como panel propio (no
 * dentro de Keyline) porque es transversal a todas las herramientas. Se guarda con
 * el proyecto (keyline_check).
 */
import { Check, ChevronLeft, ListChecks } from 'lucide-react';

export interface KeylineCheck { hecho: boolean; nota: string }

export const FACTORES: Array<{ id: string; nombre: string; desc: string }> = [
  { id: 'clima',         nombre: '1 · Clima',         desc: 'Lluvias, vientos, heladas, Köppen, asoleamiento.' },
  { id: 'geografia',     nombre: '2 · Geografía',     desc: 'Relieve, pendientes, orientación, curvas de nivel.' },
  { id: 'agua',          nombre: '3 · Agua',          desc: 'Keyline, represas, swales, cosecha y distribución.' },
  { id: 'accesos',       nombre: '4 · Accesos',       desc: 'Caminos principales por lomas y divisorias.' },
  { id: 'sistemas',      nombre: '5 · Sistemas',      desc: 'Vegetación, cultivos, animales, zonas de uso.' },
  { id: 'estructuras',   nombre: '6 · Estructuras',   desc: 'Casa, galpones, infraestructura productiva.' },
  { id: 'subdivisiones', nombre: '7 · Subdivisiones', desc: 'Potreros, cercos, parcelas de manejo.' },
  { id: 'suelo',         nombre: '8 · Suelo',         desc: 'Fertilidad, materia orgánica, manejo regenerativo.' },
];

interface Props {
  check:   Record<string, KeylineCheck>;
  onCheck: (id: string, parcial: Partial<KeylineCheck>) => void;
  onVolver: () => void;
}

export function EscalaPermanenciaPanel({ check, onCheck, onVolver }: Props) {
  const hechos = FACTORES.filter(f => check[f.id]?.hecho).length;

  return (
    <div className="w-64 bg-white/97 backdrop-blur-sm rounded-xl shadow-xl border border-bone-200 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-ink-950 border-b border-ink-800 shrink-0">
        <button onClick={onVolver} className="flex items-center gap-1 text-bone-300 hover:text-bone-100 transition-colors">
          <ChevronLeft className="w-3 h-3" />
          <span className="text-[10px]">Capas</span>
        </button>
        <span className="text-[10px] font-bold text-bone-100 uppercase tracking-widest">Escala de permanencia</span>
        <span className="text-[10px] font-mono text-moss-300">{hechos}/{FACTORES.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1.5">
          <ListChecks className="w-3.5 h-3.5 shrink-0 mt-0.5 text-moss-700" />
          Los 8 factores de Yeomans para diseñar el predio, de lo más permanente a lo más cambiable. Marcá lo que ya analizaste o decidiste y anotá la decisión. Se guarda con el proyecto.
        </p>
        <div className="space-y-1.5">
          {FACTORES.map(f => {
            const st = check[f.id] ?? { hecho: false, nota: '' };
            return (
              <div key={f.id} className={`rounded-xl border p-2.5 transition-colors ${st.hecho ? 'bg-moss-100/60 border-moss-300' : 'bg-white border-bone-200'}`}>
                <button onClick={() => onCheck(f.id, { hecho: !st.hecho })} className="w-full flex items-start gap-2 text-left">
                  <span className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors ${st.hecho ? 'bg-moss-700 border-moss-700 text-bone-50' : 'border-bone-300 bg-white'}`}>
                    {st.hecho && <Check className="w-3 h-3" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${st.hecho ? 'text-moss-900' : 'text-ink-900'}`}>{f.nombre}</p>
                    <p className="text-[10px] text-ink-700/55 leading-tight">{f.desc}</p>
                  </div>
                </button>
                {st.hecho && (
                  <input
                    value={st.nota}
                    onChange={e => onCheck(f.id, { nota: e.target.value })}
                    placeholder="Nota / decisión…"
                    className="mt-1.5 w-full text-[10px] bg-white border border-bone-200 rounded px-2 py-1 text-ink-900 placeholder-ink-700/30 focus:outline-none focus:border-moss-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
