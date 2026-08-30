'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Trash2, Droplets, Cloud } from 'lucide-react';
import {
  calcularCaptacion,
  nuevaSuperficieDefault,
  nuevaConsumoDefault,
  TIPOS_SUPERFICIE,
  CONSUMO_REFS,
  type Superficie,
  type TipoSuperficie,
  type ConsumoCategoria,
  type TipoConsumo,
  type CaptacionSnapshot,
} from '@/lib/captacion';
import type { DatosClima } from '@/lib/clima';
import { MESES } from '@/lib/clima';

interface Props {
  datosClima:  DatosClima | null;
  onIrAClima:  () => void;
  onSnapshot?: (snap: CaptacionSnapshot | null) => void;
  /** Datos cargados antes: al cambiar de pestaña el panel se desmonta, así
   *  vuelve con lo que había en vez de reiniciarse a los valores por defecto. */
  snapshotInicial?: CaptacionSnapshot | null;
}

export function CaptacionPanel({ datosClima, onIrAClima, onSnapshot, snapshotInicial }: Props) {
  const [superficies, setSuperficies] = useState<Superficie[]>(
    snapshotInicial?.superficies?.length ? snapshotInicial.superficies : [nuevaSuperficieDefault()]);
  const [consumos,    setConsumos]    = useState<ConsumoCategoria[]>(
    snapshotInicial?.consumoCategorias?.length ? snapshotInicial.consumoCategorias : [nuevaConsumoDefault()]);

  // ── Superficies ─────────────────────────────────────────────────────────────
  const agregarSuperficie = useCallback(() => {
    setSuperficies(prev => [...prev, {
      ...nuevaSuperficieDefault(),
      id: crypto.randomUUID(),
      nombre: `Superficie ${prev.length + 1}`,
    }]);
  }, []);

  const eliminarSuperficie = useCallback((id: string) => {
    setSuperficies(prev => prev.filter(s => s.id !== id));
  }, []);

  const actualizarSuperficie = useCallback((id: string, campo: Partial<Superficie>) => {
    setSuperficies(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = { ...s, ...campo };
      if (campo.tipo && campo.tipo !== 'personalizado') {
        next.coef = TIPOS_SUPERFICIE[campo.tipo].coef;
      }
      return next;
    }));
  }, []);

  // ── Consumos ────────────────────────────────────────────────────────────────
  const agregarConsumo = useCallback((tipo: TipoConsumo) => {
    const ref = CONSUMO_REFS[tipo];
    setConsumos(prev => [...prev, {
      id:                    crypto.randomUUID(),
      tipo,
      nombre:                ref.label,
      cantidad:              tipo === 'domestico' ? 4 : tipo === 'huerta' ? 50 : tipo === 'cultivo_extensivo' ? 1 : 10,
      litros_dia_por_unidad: ref.litros_dia_por_unidad,
    }]);
  }, []);

  const eliminarConsumo = useCallback((id: string) => {
    setConsumos(prev => prev.filter(c => c.id !== id));
  }, []);

  const actualizarConsumo = useCallback((id: string, campo: Partial<ConsumoCategoria>) => {
    setConsumos(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next = { ...c, ...campo };
      if (campo.tipo) {
        next.litros_dia_por_unidad = CONSUMO_REFS[campo.tipo].litros_dia_por_unidad;
        next.nombre = CONSUMO_REFS[campo.tipo].label;
      }
      return next;
    }));
  }, []);

  // ── Cálculo ─────────────────────────────────────────────────────────────────
  const precipMensual = useMemo(
    () => datosClima?.meses.map(m => m.precip_mm) ?? Array(12).fill(0),
    [datosClima],
  );

  const resultado = useMemo(() => {
    if (!datosClima || superficies.length === 0) return null;
    return calcularCaptacion(superficies, precipMensual, consumos);
  }, [superficies, precipMensual, consumos, datosClima]);

  /**
   * Emite el snapshot aunque todavía no haya cálculo. Antes salía `null` sin
   * clima cargado, y como el panel se desmonta al cambiar de pestaña, quien
   * tipeaba primero las superficies y los consumos —que se cargan uno por uno,
   * a mano— los perdía enteros sin ningún aviso.
   */
  useEffect(() => {
    if (!onSnapshot) return;
    const hayCarga = superficies.length > 0 || consumos.length > 0;
    onSnapshot(resultado || hayCarga ? { superficies, consumoCategorias: consumos, resultado } : null);
  }, [resultado, superficies, consumos, onSnapshot]);

  const inputCls =
    'w-full px-2.5 py-1.5 rounded-lg border border-bone-200 bg-white text-ink-950 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';

  // ── Sin datos climáticos ─────────────────────────────────────────────────────
  if (!datosClima) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Cloud className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Para calcular la captación necesitás cargar los datos climáticos del terreno.
        </p>
        <button
          onClick={onIrAClima}
          className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
        >
          <Cloud className="w-3.5 h-3.5" />
          Ir a Clima y cargar datos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Captación de agua de lluvia
      </p>

      {/* ── Superficies de captación ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-ink-700">Superficies de captación</p>
          <button
            onClick={agregarSuperficie}
            className="flex items-center gap-1 text-xs text-moss-700 hover:text-moss-900 transition-colors"
          >
            <Plus className="w-3 h-3" />Agregar
          </button>
        </div>
        {superficies.map(s => (
          <SuperficieRow
            key={s.id}
            superficie={s}
            onUpdate={campo => actualizarSuperficie(s.id, campo)}
            onDelete={() => eliminarSuperficie(s.id)}
            soloUna={superficies.length === 1}
          />
        ))}
      </div>

      {/* ── Categorías de consumo ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-ink-700">Consumo por categoría</p>
          <AgregarConsumoMenu onAgregar={agregarConsumo} />
        </div>
        {consumos.map(c => (
          <ConsumoRow
            key={c.id}
            consumo={c}
            onUpdate={campo => actualizarConsumo(c.id, campo)}
            onDelete={() => eliminarConsumo(c.id)}
            soloUna={consumos.length === 1}
          />
        ))}
        {resultado && (
          <p className="text-xs text-ink-700/50 text-right">
            Total consumo:{' '}
            <span className="font-mono font-medium text-ink-900">
              {resultado.consumo_total_litros_dia.toFixed(0)} L/día ·{' '}
              {resultado.consumo_anual_m3.toFixed(1)} m³/año
            </span>
          </p>
        )}
      </div>

      {/* ── Resultados ──────────────────────────────────────────────────────── */}
      {resultado && (
        <>
          {/* Resumen anual */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl p-3 border border-bone-200">
              <p className="text-xs text-water-500 flex items-center gap-1 mb-1">
                <Droplets className="w-3 h-3" />Captación anual
              </p>
              <p className="font-mono text-sm font-bold text-ink-900">
                {resultado.captacion_anual_m3.toFixed(1)} m³
              </p>
              <p className="text-xs text-ink-700/50">
                {resultado.captacion_anual_litros.toLocaleString('es-AR')} L
              </p>
            </div>
            <div className={`rounded-xl p-3 border ${resultado.balance_anual_m3 >= 0 ? 'bg-moss-50 border-moss-200' : 'bg-clay-100 border-clay-200'}`}>
              <p className="text-xs text-ink-700/60 mb-1">Balance anual</p>
              <p className={`font-mono text-sm font-bold ${resultado.balance_anual_m3 >= 0 ? 'text-moss-700' : 'text-clay-700'}`}>
                {resultado.balance_anual_m3 > 0 ? '+' : ''}{resultado.balance_anual_m3.toFixed(1)} m³
              </p>
              <p className="text-xs text-ink-700/50">
                {resultado.meses_deficit} mes{resultado.meses_deficit !== 1 ? 'es' : ''} c/ déficit
              </p>
            </div>
          </div>

          {/* Desglose por superficie */}
          {resultado.captacion_por_superficie.length > 1 && (
            <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-bone-200">
                <p className="text-xs font-medium text-ink-700">Captación por superficie</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bone-50 border-b border-bone-200">
                    <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Superficie</th>
                    <th className="text-right px-2 py-1.5 text-water-500 font-medium">Anual (m³)</th>
                    <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.captacion_por_superficie.map((s, i) => (
                    <tr key={s.id} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                      <td className="px-3 py-1.5 text-ink-700 truncate max-w-[120px]">{s.nombre}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-water-500">{s.anual_m3.toFixed(1)}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-ink-700/60">{s.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Desglose por categoría de consumo */}
          {resultado.consumo_por_categoria.length > 1 && (
            <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-bone-200">
                <p className="text-xs font-medium text-ink-700">Consumo por categoría</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bone-50 border-b border-bone-200">
                    <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Categoría</th>
                    <th className="text-right px-2 py-1.5 text-clay-700 font-medium">L/día</th>
                    <th className="text-right px-2 py-1.5 text-clay-700 font-medium">Anual (m³)</th>
                    <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.consumo_por_categoria.map((c, i) => (
                    <tr key={c.id} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                      <td className="px-3 py-1.5 text-ink-700 truncate max-w-[100px]">{c.nombre}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-clay-600">{c.litros_dia.toFixed(0)}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-clay-700">{c.anual_m3.toFixed(1)}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-ink-700/60">{c.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Balance estacional */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-ink-700">Balance estacional</p>
            <div className="grid grid-cols-2 gap-2">
              {resultado.balance_trimestral.map(t => {
                const ok = t.balance_m3 >= 0;
                return (
                  <div
                    key={t.nombre}
                    className={`rounded-xl p-2.5 border ${ok ? 'bg-moss-50 border-moss-200' : 'bg-clay-100 border-clay-200'}`}
                  >
                    <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">{t.nombre}</p>
                    <p className="text-[9px] text-ink-700/50 mb-1">{t.meses_label}</p>
                    <p className={`font-mono text-xs font-bold ${ok ? 'text-moss-700' : 'text-clay-700'}`}>
                      {t.balance_m3 > 0 ? '+' : ''}{t.balance_m3.toFixed(1)} m³
                    </p>
                    <div className="text-[9px] text-ink-700/50 mt-0.5 space-y-0.5">
                      <div>↓ {t.captacion_m3.toFixed(1)} m³ capt.</div>
                      <div>↑ {t.consumo_m3.toFixed(1)} m³ cons.</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tanque */}
          <TanqueCard
            volumen={resultado.tanque_recomendado_m3}
            diasCobertura={resultado.cobertura_minima_dias}
            mesesDeficit={resultado.meses_deficit}
          />

          {/* Gráfico mensual */}
          <GraficoCaptacion
            captacion={resultado.captacion_mensual_m3}
            consumo={resultado.consumo_mensual_m3}
          />

          {/* Tabla mensual */}
          <TablaMensual
            captacion={resultado.captacion_mensual_m3}
            consumo={resultado.consumo_mensual_m3}
            balance={resultado.balance_mensual_m3}
          />
        </>
      )}
    </div>
  );
}

// ─── Menú para agregar categoría de consumo ───────────────────────────────────

function AgregarConsumoMenu({ onAgregar }: { onAgregar: (t: TipoConsumo) => void }) {
  const [abierto, setAbierto] = useState(false);
  const tipos = Object.entries(CONSUMO_REFS) as [TipoConsumo, typeof CONSUMO_REFS[TipoConsumo]][];

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(v => !v)}
        className="flex items-center gap-1 text-xs text-moss-700 hover:text-moss-900 transition-colors"
      >
        <Plus className="w-3 h-3" />Agregar
      </button>
      {abierto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)} />
          <div className="absolute right-0 top-6 z-20 bg-white rounded-xl border border-bone-200 shadow-lg py-1 min-w-[200px]">
            {tipos.map(([key, info]) => (
              <button
                key={key}
                onClick={() => { onAgregar(key); setAbierto(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-bone-50 transition-colors"
              >
                <span className="font-medium text-ink-900">{info.label}</span>
                <span className="block text-ink-700/50 text-[10px]">{info.descripcion}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Fila de superficie ───────────────────────────────────────────────────────

function SuperficieRow({
  superficie, onUpdate, onDelete, soloUna,
}: {
  superficie: Superficie;
  onUpdate: (campo: Partial<Superficie>) => void;
  onDelete: () => void;
  soloUna: boolean;
}) {
  const inputCls =
    'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors font-medium"
          placeholder="Nombre"
          value={superficie.nombre}
          onChange={e => onUpdate({ nombre: e.target.value })}
        />
        {!soloUna && (
          <button
            onClick={onDelete}
            className="shrink-0 text-ink-700/30 hover:text-danger-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <select
        value={superficie.tipo}
        onChange={e => onUpdate({ tipo: e.target.value as TipoSuperficie })}
        className={inputCls}
      >
        {(Object.entries(TIPOS_SUPERFICIE) as [TipoSuperficie, typeof TIPOS_SUPERFICIE[TipoSuperficie]][]).map(
          ([key, info]) => (
            <option key={key} value={key}>{info.label} (C={info.coef})</option>
          ),
        )}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-ink-700/60 mb-1">Área (m²)</label>
          <input
            type="number" min={0.1} step={0.5} value={superficie.area_m2}
            onChange={e => onUpdate({ area_m2: parseFloat(e.target.value) || 0 })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-ink-700/60 mb-1">Coef. escorrentía</label>
          <input
            type="number" min={0} max={1} step={0.05} value={superficie.coef}
            onChange={e => onUpdate({ coef: parseFloat(e.target.value) || 0, tipo: 'personalizado' })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Fila de categoría de consumo ─────────────────────────────────────────────

function ConsumoRow({
  consumo, onUpdate, onDelete, soloUna,
}: {
  consumo: ConsumoCategoria;
  onUpdate: (campo: Partial<ConsumoCategoria>) => void;
  onDelete: () => void;
  soloUna: boolean;
}) {
  const inputCls =
    'w-full px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors';

  const ref = CONSUMO_REFS[consumo.tipo];
  const totalLitros = consumo.cantidad * consumo.litros_dia_por_unidad;

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-2 py-1.5 rounded-md border border-bone-200 bg-white text-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors font-medium"
          placeholder="Nombre"
          value={consumo.nombre}
          onChange={e => onUpdate({ nombre: e.target.value })}
        />
        {!soloUna && (
          <button onClick={onDelete} className="shrink-0 text-ink-700/30 hover:text-danger-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <select
        value={consumo.tipo}
        onChange={e => onUpdate({ tipo: e.target.value as TipoConsumo })}
        className={inputCls}
      >
        {(Object.entries(CONSUMO_REFS) as [TipoConsumo, typeof CONSUMO_REFS[TipoConsumo]][]).map(
          ([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ),
        )}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-ink-700/60 mb-1">
            Cantidad ({ref.unidad})
          </label>
          <input
            type="number" min={0.1} step={consumo.tipo === 'huerta' || consumo.tipo === 'cultivo_extensivo' ? 0.5 : 1}
            value={consumo.cantidad}
            onChange={e => onUpdate({ cantidad: parseFloat(e.target.value) || 0 })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-ink-700/60 mb-1">L/día por unidad</label>
          <input
            type="number" min={0.01} step={0.1}
            value={consumo.litros_dia_por_unidad}
            onChange={e => onUpdate({ litros_dia_por_unidad: parseFloat(e.target.value) || 0 })}
            className={inputCls}
          />
        </div>
      </div>
      <p className="text-xs text-ink-700/50">
        Total:{' '}
        <span className="font-mono font-medium text-clay-700">{totalLitros.toFixed(1)} L/día</span>
        {' · '}
        <span className="font-mono text-ink-700/40">{(totalLitros * 365 / 1000).toFixed(1)} m³/año</span>
      </p>
    </div>
  );
}

// ─── Recomendación de tanque ──────────────────────────────────────────────────

function TanqueCard({
  volumen, diasCobertura, mesesDeficit,
}: {
  volumen: number;
  diasCobertura: number;
  mesesDeficit: number;
}) {
  const color = mesesDeficit === 0 ? 'moss' : mesesDeficit <= 3 ? 'sun' : 'clay';
  const bgMap  = { moss: 'bg-moss-50 border-moss-200', sun: 'bg-sun-300/20 border-sun-300', clay: 'bg-clay-100 border-clay-200' };
  const txtMap = { moss: 'text-moss-700', sun: 'text-clay-700', clay: 'text-clay-700' };

  return (
    <div className={`rounded-xl border p-3 ${bgMap[color]}`}>
      <p className="text-xs font-semibold text-ink-700 mb-2">🪣 Tanque / cisterna recomendado</p>
      <p className={`font-mono text-xl font-bold ${txtMap[color]}`}>{volumen.toFixed(1)} m³</p>
      <p className="text-xs text-ink-700/60 mt-0.5">= {Math.round(volumen * 1000).toLocaleString('es-AR')} litros</p>
      {diasCobertura > 0 && (
        <p className="text-xs text-ink-700/70 mt-2">
          En el mes más seco, la captación cubre aprox.{' '}
          <span className="font-semibold">{diasCobertura} días</span> de consumo.
        </p>
      )}
      {mesesDeficit === 0 && (
        <p className="text-xs text-moss-700 mt-1">✓ La captación supera el consumo todos los meses.</p>
      )}
    </div>
  );
}

// ─── Gráfico captación vs consumo ────────────────────────────────────────────

function GraficoCaptacion({ captacion, consumo }: { captacion: number[]; consumo: number[] }) {
  const maxVal = Math.max(...captacion, ...consumo, 0.1);
  const HEIGHT = 72;

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200 flex items-center justify-between">
        <p className="text-xs font-medium text-ink-700">Captación vs Consumo mensual (m³)</p>
        <div className="flex items-center gap-3 text-xs text-ink-700/60">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-water-500 inline-block" />Capt.
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-clay-500 inline-block" />Cons.
          </span>
        </div>
      </div>
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-end gap-0.5" style={{ height: HEIGHT }}>
          {captacion.map((c, i) => {
            const cons = consumo[i] ?? 0;
            return (
              <div key={i} className="flex-1 flex items-end gap-px">
                <div className="flex-1 flex flex-col justify-end" title={`${MESES[i]}: ${c} m³`}>
                  <div className="bg-water-500 rounded-t-sm opacity-80" style={{ height: (c / maxVal) * HEIGHT, minHeight: 1 }} />
                </div>
                <div className="flex-1 flex flex-col justify-end" title={`Consumo ${MESES[i]}: ${cons} m³`}>
                  <div className="bg-clay-500 rounded-t-sm opacity-80" style={{ height: (cons / maxVal) * HEIGHT, minHeight: 1 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex mt-1">
          {MESES.map((m, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-ink-700/50">{m.slice(0, 1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tabla mensual ────────────────────────────────────────────────────────────

function TablaMensual({
  captacion, consumo, balance,
}: {
  captacion: number[];
  consumo: number[];
  balance: number[];
}) {
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200">
        <p className="text-xs font-medium text-ink-700">Detalle mensual (m³)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[280px]">
          <thead>
            <tr className="bg-bone-50 border-b border-bone-200">
              <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Mes</th>
              <th className="text-right px-2 py-1.5 text-water-500 font-medium">Capt.</th>
              <th className="text-right px-2 py-1.5 text-clay-700 font-medium">Cons.</th>
              <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">Bal.</th>
            </tr>
          </thead>
          <tbody>
            {MESES.map((mes, i) => {
              const b = balance[i] ?? 0;
              return (
                <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                  <td className="px-3 py-1.5 font-medium text-ink-700">{mes}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-water-500">{(captacion[i] ?? 0).toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-clay-700">{(consumo[i] ?? 0).toFixed(1)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono font-semibold ${b >= 0 ? 'text-moss-700' : 'text-clay-700'}`}>
                    {b > 0 ? '+' : ''}{b.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
