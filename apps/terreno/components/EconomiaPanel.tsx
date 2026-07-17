'use client';

/**
 * Pestaña "Economía": presupuesto de obras (con cantidades traídas del proyecto)
 * y retorno simple (payback). Los precios son editables y orientativos.
 */
import { useMemo, useEffect, useState } from 'react';
import { DollarSign, Plus, Trash2, Wand2 } from 'lucide-react';
import {
  calcularEconomia, rubrosDesdeProyecto, nuevoRubro, formatearMoneda,
  CONCEPTOS_SUGERIDOS, type RubroPresupuesto, type Moneda, type EconomiaResumen,
} from '@/lib/economia';
import type { MetricasPoligono } from '@/lib/geometria';
import type { RedAguaResumen } from '@/lib/hidraulica';
import type { RepresaResumen } from '@/lib/represa';
import type { RiegoResumen } from '@/lib/riego';

interface Props {
  metricas: MetricasPoligono | null;
  redAgua:  RedAguaResumen | null;
  represa:  RepresaResumen | null;
  riego:    RiegoResumen | null;
  resumenInicial: EconomiaResumen | null;
  onResumen: (r: EconomiaResumen | null) => void;
}

export function EconomiaPanel({ metricas, redAgua, represa, riego, resumenInicial, onResumen }: Props) {
  const [rubros, setRubros] = useState<RubroPresupuesto[]>(() =>
    resumenInicial?.rubros.map(({ subtotal: _s, ...r }) => r) ?? []);
  const [moneda, setMoneda] = useState<Moneda>(resumenInicial?.moneda ?? 'USD');
  const [ingreso, setIngreso] = useState(String(resumenInicial?.ingresoAnual ?? 0));
  const [costoOp, setCostoOp] = useState(String(resumenInicial?.costoOperativoAnual ?? 0));

  const resumen = useMemo(
    () => calcularEconomia(rubros, moneda, parseFloat(ingreso) || 0, parseFloat(costoOp) || 0),
    [rubros, moneda, ingreso, costoOp],
  );
  useEffect(() => { onResumen(rubros.length ? resumen : null); }, [resumen, rubros.length, onResumen]);

  const editar = (id: string, campo: keyof RubroPresupuesto, valor: string) =>
    setRubros(rs => rs.map(r => r.id === id ? { ...r, [campo]: campo === 'cantidad' || campo === 'precioUnit' ? (parseFloat(valor) || 0) : valor } : r));
  const borrar = (id: string) => setRubros(rs => rs.filter(r => r.id !== id));
  const traer = () => setRubros(rs => [...rs, ...rubrosDesdeProyecto({ metricas, redAgua, represa, riego })]);

  const numCls = 'w-16 text-[11px] font-mono bg-white border border-bone-200 rounded px-1 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500 text-right';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-moss-700" />
          <h3 className="text-sm font-semibold text-ink-950">Presupuesto</h3>
        </div>
        <div className="flex rounded-lg border border-bone-200 overflow-hidden text-[11px]">
          {(['USD', 'ARS'] as Moneda[]).map(m => (
            <button key={m} onClick={() => setMoneda(m)}
              className={`px-2 py-1 transition-colors ${moneda === m ? 'bg-moss-700 text-bone-50' : 'text-ink-700/60 hover:bg-bone-50'}`}>{m}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={traer} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-moss-100 hover:bg-moss-200 text-moss-900 transition-colors">
          <Wand2 className="w-3.5 h-3.5" /> Traer cantidades del proyecto
        </button>
        <button onClick={() => setRubros(rs => [...rs, nuevoRubro()])} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-bone-200 hover:bg-bone-50 text-ink-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Fila
        </button>
      </div>

      {rubros.length === 0 ? (
        <p className="text-xs text-ink-700/50">Traé las cantidades del proyecto (perímetro, cañerías, represa, riego) o agregá filas manualmente. Los precios son editables.</p>
      ) : (
        <div className="space-y-1">
          {/* Cabecera */}
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-ink-700/40 px-1">
            <span className="flex-1">Concepto</span>
            <span className="w-16 text-right">Cant.</span>
            <span className="w-16 text-right">Precio</span>
            <span className="w-16 text-right">Subtotal</span>
            <span className="w-4" />
          </div>
          {rubros.map(r => (
            <div key={r.id} className="flex items-center gap-1">
              <input value={r.concepto} onChange={e => editar(r.id, 'concepto', e.target.value)} placeholder="Concepto"
                className="flex-1 min-w-0 text-[11px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
              <input value={r.cantidad} onChange={e => editar(r.id, 'cantidad', e.target.value)} className={numCls} title={r.unidad} />
              <input value={r.precioUnit} onChange={e => editar(r.id, 'precioUnit', e.target.value)} className={numCls} />
              <span className="w-16 text-right text-[11px] font-mono text-ink-900">{formatearMoneda(r.cantidad * r.precioUnit, moneda)}</span>
              <button onClick={() => borrar(r.id)} className="w-4 text-ink-700/30 hover:text-clay-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      {rubros.length > 0 && (
        <>
          {/* Por categoría */}
          <div className="rounded-lg border border-bone-200 bg-bone-50/50 p-2.5 space-y-1">
            {resumen.porCategoria.map(c => (
              <div key={c.categoria} className="flex items-center justify-between text-[11px]">
                <span className="text-ink-700/60">{c.categoria}</span>
                <span className="font-mono text-ink-800">{formatearMoneda(c.subtotal, moneda)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-bone-200">
              <span className="text-sm font-semibold text-ink-950">Total</span>
              <span className="text-sm font-semibold text-moss-900">{formatearMoneda(resumen.total, moneda)}</span>
            </div>
          </div>

          {/* Retorno */}
          <div className="rounded-lg border border-bone-200 bg-white p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-ink-700/50">Retorno estimado</p>
            <label className="flex items-center justify-between text-[11px] text-ink-700/70">
              Ingreso anual esperado
              <input value={ingreso} onChange={e => setIngreso(e.target.value)} className={numCls} />
            </label>
            <label className="flex items-center justify-between text-[11px] text-ink-700/70">
              Costo operativo anual
              <input value={costoOp} onChange={e => setCostoOp(e.target.value)} className={numCls} />
            </label>
            <div className="flex items-center justify-between pt-1 border-t border-bone-100">
              <span className="text-[11px] text-ink-700/60">Recuperación de la inversión</span>
              <span className="text-sm font-semibold text-moss-900">
                {resumen.payback_anios != null ? `${resumen.payback_anios.toFixed(1)} años` : '—'}
              </span>
            </div>
            {resumen.payback_anios == null && resumen.total > 0 && (
              <p className="text-[10px] text-ink-700/40">Cargá un margen anual positivo (ingreso &gt; costo) para calcular el repago.</p>
            )}
          </div>
        </>
      )}

      <p className="text-[10px] text-ink-700/50 leading-relaxed">
        Precios orientativos y editables. Las cantidades se toman de lo ya calculado en el proyecto; ajustá valores a tu zona y proveedores.
      </p>
    </div>
  );
}
