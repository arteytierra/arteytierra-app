'use client';

import type { MetricasPoligono } from '@/lib/geometria';
import { formatearDistancia } from '@/lib/geometria';

export function PoligonoPanel({ metricas }: { metricas: MetricasPoligono }) {
  const { area_m2, area_ha, perimetro_m, linderos } = metricas;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Polígono
      </h2>

      {/* Superficie y perímetro */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-3 border border-bone-200">
          <p className="text-xs text-moss-700 mb-1">Superficie</p>
          <p className="font-mono text-sm font-bold text-ink-900">
            {area_ha.toFixed(4)} ha
          </p>
          <p className="font-mono text-xs text-ink-700/60">
            {area_m2 >= 10_000
              ? `${(area_m2 / 10_000).toFixed(4)} ha`
              : `${area_m2.toFixed(1)} m²`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-bone-200">
          <p className="text-xs text-moss-700 mb-1">Perímetro</p>
          <p className="font-mono text-sm font-bold text-ink-900">
            {formatearDistancia(perimetro_m)}
          </p>
          <p className="font-mono text-xs text-ink-700/60">
            {perimetro_m.toFixed(1)} m
          </p>
        </div>
      </div>

      {/* Tabla de linderos */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 bg-bone-100 border-b border-bone-200">
          <p className="text-xs font-medium text-moss-700">Linderos</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-bone-200">
                <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Tramo</th>
                <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">Longitud</th>
                <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">Az.</th>
                <th className="text-right px-3 py-1.5 text-ink-700/60 font-medium">Rumbo</th>
              </tr>
            </thead>
            <tbody>
              {linderos.map((l, i) => (
                <tr
                  key={i}
                  className={`border-b border-bone-200/50 last:border-0 ${
                    i % 2 === 0 ? '' : 'bg-bone-50/60'
                  }`}
                >
                  <td className="px-3 py-1.5 font-semibold text-moss-700">
                    {l.desde}→{l.hasta}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-ink-700">
                    {l.longitud.toFixed(1)} m
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-ink-700">
                    {l.azimut.toFixed(1)}°
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-ink-700/80 whitespace-nowrap">
                    {l.rumbo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
