'use client';

/**
 * Pestaña "Carbono": stock actual en el suelo + potencial de captura según las
 * prácticas regenerativas que se activen. Gancho de MRV, orientativo.
 */
import { useMemo, useEffect } from 'react';
import { useState } from 'react';
import { Wind, Info } from 'lucide-react';
import { calcularCarbono, PRACTICAS, type CarbonoResumen } from '@/lib/carbono';
import type { DatosSuelo } from '@/lib/suelos';
import type { DatosCobertura } from '@/lib/cobertura';

interface Props {
  areaHa: number;
  datosSuelo: DatosSuelo | null;
  datosCobertura: DatosCobertura | null;
  onResumen: (r: CarbonoResumen | null) => void;
}

export function CarbonoPanel({ areaHa, datosSuelo, datosCobertura, onResumen }: Props) {
  const [activas, setActivas] = useState<string[]>(['pastoreo', 'cobertura']);

  const resumen = useMemo(() => {
    if (areaHa <= 0) return null;
    return calcularCarbono(
      areaHa,
      datosSuelo?.carbono_org ?? null,
      datosSuelo?.densidad_ap ?? null,
      activas,
    );
  }, [areaHa, datosSuelo, activas]);

  useEffect(() => { onResumen(resumen); }, [resumen, onResumen]);

  const toggle = (id: string) => setActivas(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  if (areaHa <= 0) {
    return <p className="text-sm text-ink-700/50">Dibujá el predio (3+ mojones) para estimar el carbono.</p>;
  }

  const fmt = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 1 });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wind className="w-4 h-4 text-moss-700" />
        <h3 className="text-sm font-semibold text-ink-950">Carbono del predio</h3>
      </div>

      {/* Stock actual del suelo */}
      <div className="rounded-lg border border-bone-200 bg-white p-3">
        <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mb-1">Stock actual en el suelo (0–30 cm)</p>
        {resumen?.stock_suelo_tCO2e != null ? (
          <div className="flex items-end justify-between">
            <p className="text-2xl font-semibold text-moss-900">{fmt(resumen.stock_suelo_tCO2e)} <span className="text-sm font-normal text-ink-700/60">t CO₂e</span></p>
            <p className="text-xs text-ink-700/60">{fmt(resumen.stock_suelo_tCO2e_ha ?? 0)} t CO₂e/ha</p>
          </div>
        ) : (
          <p className="text-xs text-ink-700/50">Cargá el análisis de <span className="font-medium">Suelo</span> para estimar el stock (usa carbono orgánico y densidad aparente).</p>
        )}
      </div>

      {/* Prácticas regenerativas */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mb-1.5">Prácticas a implementar</p>
        <div className="space-y-1">
          {PRACTICAS.map(p => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-ink-800 cursor-pointer">
              <input type="checkbox" checked={activas.includes(p.id)} onChange={() => toggle(p.id)} className="accent-moss-700" />
              <span className="flex-1">{p.nombre}</span>
              <span className="text-[11px] font-mono text-ink-700/50">{p.tasa_tC_ha_anio} tC/ha·a</span>
            </label>
          ))}
        </div>
      </div>

      {/* Captura potencial */}
      <div className="rounded-lg border border-moss-200 bg-moss-50 p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-moss-900/70">Potencial de captura</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xl font-semibold text-moss-900">{fmt(resumen?.captura_anual_tCO2e ?? 0)}</p>
            <p className="text-[10px] text-ink-700/60">t CO₂e / año</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-moss-900">{fmt(resumen?.captura_10anios_tCO2e ?? 0)}</p>
            <p className="text-[10px] text-ink-700/60">t CO₂e en 10 años</p>
          </div>
        </div>
        {resumen && resumen.captura_anual_tCO2e > 0 && (
          <p className="text-[11px] text-ink-700/70">≈ compensar {fmt(resumen.autos_equiv_anio)} autos por año.</p>
        )}
      </div>

      {datosCobertura && (
        <p className="text-[11px] text-ink-700/60">
          Cobertura arbolada actual: <span className="font-medium">{Math.round(datosCobertura.arbolado_pct)} %</span> del predio (contexto para agroforestería).
        </p>
      )}

      <p className="text-[10px] text-ink-700/50 flex gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Estimación orientativa con coeficientes medios de literatura. Para créditos de carbono o reportes formales se requiere muestreo de suelo y una metodología certificada.
      </p>
    </div>
  );
}
