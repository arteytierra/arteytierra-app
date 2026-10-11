'use client';

/**
 * Editor del rodeo por lotes, compartido por Producción y Represa.
 *
 * Existe como componente propio porque el rodeo es uno solo para toda la app
 * (ver `lib/rodeo.ts`) y las dos pestañas tienen que editarlo igual: si cada una
 * dibuja su propio formulario, tarde o temprano una deja de ofrecer un campo que
 * la otra sí tiene, y el usuario no entiende por qué el mismo dato se edita
 * distinto según dónde lo mire.
 *
 * Un lote es una categoría con su cantidad de cabezas. El coeficiente EV y el
 * consumo de agua salen de la tabla de `categorias.ts`, con su fuente; el usuario
 * puede pisar el agua pero no el EV, porque el EV es el dato publicado y el agua
 * depende del campo.
 */

import { Plus, X, Info } from 'lucide-react';
import { CATEGORIAS, ESPECIES, categoriaPorId } from '@/lib/categorias';
import {
  nuevoLote, litrosDe, evTotal, cabezasTotal, aguaHacienda_l_dia,
  type Rodeo, type LoteRodeo,
} from '@/lib/rodeo';

interface Props {
  rodeo:   Rodeo;
  onRodeo: (r: Rodeo) => void;
  /** `true` muestra además el riego, que sólo tiene sentido donde se balancea agua. */
  conRiego?: boolean;
}

/** Las categorías agrupadas por especie, para que el select no sea una lista de 18. */
function OpcionesCategoria() {
  return (
    <>
      {ESPECIES.map(e => {
        const filas = CATEGORIAS.filter(c => c.especie === e.id);
        if (filas.length === 0) return null;
        return (
          <optgroup key={e.id} label={e.nombre}>
            {filas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}{c.ev !== null ? ` · ${c.ev.toLocaleString('es-AR')} EV` : ' · no pastorea'}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}

export function RodeoEditor({ rodeo, onRodeo, conRiego = false }: Props) {
  const cambiar = (id: string, cambios: Partial<LoteRodeo>) => {
    onRodeo({
      ...rodeo,
      lotes: rodeo.lotes.map(l => (l.id === id ? { ...l, ...cambios } : l)),
      origen: 'manual',
    });
  };

  const quitar = (id: string) => {
    const lotes = rodeo.lotes.filter(l => l.id !== id);
    onRodeo({ ...rodeo, lotes: lotes.length > 0 ? lotes : [nuevoLote()], origen: 'manual' });
  };

  const agregar = () => {
    onRodeo({ ...rodeo, lotes: [...rodeo.lotes, nuevoLote()], origen: 'manual' });
  };

  const ev      = evTotal(rodeo);
  const cabezas = cabezasTotal(rodeo);
  const agua    = aguaHacienda_l_dia(rodeo);

  // Las cautelas de las categorías que el usuario eligió, sin repetir.
  const notas = Array.from(new Set(
    rodeo.lotes
      .filter(l => l.cabezas > 0)
      .map(l => categoriaPorId(l.categoriaId))
      .filter((c): c is NonNullable<typeof c> => !!c && !!c.nota)
      .map(c => `${c.nombre}: ${c.nota}`),
  ));

  return (
    <div className="space-y-1.5">
      {rodeo.lotes.map(lote => {
        const cat = categoriaPorId(lote.categoriaId);
        return (
          <div key={lote.id} className="bg-white rounded-lg border border-bone-200 p-1.5 space-y-1">
            <div className="flex items-center gap-1">
              <select
                value={lote.categoriaId}
                onChange={e => cambiar(lote.id, { categoriaId: e.target.value, litros_animal_dia: null })}
                className="flex-1 min-w-0 text-[10px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
              >
                <OpcionesCategoria />
              </select>
              {rodeo.lotes.length > 1 && (
                <button
                  onClick={() => quitar(lote.id)}
                  aria-label="Quitar lote"
                  className="shrink-0 p-0.5 rounded text-ink-700/40 hover:text-clay-600 hover:bg-clay-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <label className="flex items-center justify-between gap-1 text-[9px] text-ink-700/60">
                Cabezas
                <input
                  type="number" min={0} step={1} value={lote.cabezas}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    if (Number.isFinite(v)) cambiar(lote.id, { cabezas: Math.max(0, Math.round(v)) });
                  }}
                  className="w-14 text-[10px] font-mono text-right bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
                />
              </label>
              <label className="flex items-center justify-between gap-1 text-[9px] text-ink-700/60">
                L/cab./día
                <input
                  type="number" min={0} step={1} value={litrosDe(lote)}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    if (Number.isFinite(v)) cambiar(lote.id, { litros_animal_dia: Math.max(0, v) });
                  }}
                  className="w-14 text-[10px] font-mono text-right bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
                />
              </label>
            </div>
            {cat && lote.cabezas > 0 && cat.ev !== null && (
              <p className="text-[9px] text-ink-700/45 font-mono">
                {lote.cabezas} × {cat.ev.toLocaleString('es-AR')} EV = {(lote.cabezas * cat.ev).toLocaleString('es-AR', { maximumFractionDigits: 1 })} EV
              </p>
            )}
          </div>
        );
      })}

      <button
        onClick={agregar}
        className="w-full flex items-center justify-center gap-1 text-[10px] font-medium text-moss-700 border border-dashed border-moss-300 rounded-lg py-1 hover:bg-moss-50 transition-colors"
      >
        <Plus className="w-3 h-3" /> Agregar un lote
      </button>

      {conRiego && (
        <label className="flex items-center justify-between gap-1 text-[9px] text-ink-700/60 bg-white rounded-lg border border-bone-200 px-1.5 py-1">
          Riego de la misma fuente (m³/mes)
          <input
            type="number" min={0} step={10} value={rodeo.riego_m3_mes}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onRodeo({ ...rodeo, riego_m3_mes: Math.max(0, v) });
            }}
            className="w-16 text-[10px] font-mono text-right bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
          />
        </label>
      )}

      <div className="flex items-center justify-between gap-2 bg-bone-100 rounded-lg px-2 py-1 text-[9px] text-ink-700/70">
        <span className="font-mono">{cabezas.toLocaleString('es-AR')} cabezas</span>
        <span className="font-mono font-semibold text-moss-700">{ev.toLocaleString('es-AR', { maximumFractionDigits: 1 })} EV</span>
        <span className="font-mono">{agua.toLocaleString('es-AR')} L/día</span>
      </div>

      {notas.length > 0 && (
        <div className="space-y-1">
          {notas.map(n => (
            <p key={n} className="flex gap-1 text-[9px] text-ink-700/50 leading-relaxed">
              <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
              <span>{n}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
