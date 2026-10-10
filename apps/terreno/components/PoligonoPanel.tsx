'use client';

import { Lock } from 'lucide-react';
import type { MetricasPoligono } from '@/lib/geometria';
import { formatearDistancia, formatearMetros, formatearHa } from '@/lib/geometria';

interface Props {
  metricas: MetricasPoligono;
  /**
   * Azimut y rumbo cuadrantal son datos de replanteo de campo (`catastro.rumbos`),
   * no parte de la medición libre. Superficie, perímetro y longitudes siguen
   * abiertos en Semilla; estas dos columnas se tapan.
   */
  rumbosBloqueados?: boolean;
  onDesbloquearRumbos?: () => void;
}

export function PoligonoPanel({ metricas, rumbosBloqueados = false, onDesbloquearRumbos }: Props) {
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
            {formatearHa(area_ha)}
          </p>
          {/* La segunda línea es la unidad chica, como en el perímetro: antes
              repetía hectáreas con cuatro decimales y ahora eso es el renglón
              de arriba, así que repetirlo no diría nada. */}
          <p className="font-mono text-xs text-ink-700/60">
            {`${Math.round(area_m2).toLocaleString('es-AR')} m²`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-bone-200">
          <p className="text-xs text-moss-700 mb-1">Perímetro</p>
          <p className="font-mono text-sm font-bold text-ink-900">
            {formatearDistancia(perimetro_m)}
          </p>
          <p className="font-mono text-xs text-ink-700/60">
            {formatearMetros(perimetro_m)}
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
                    {formatearMetros(l.longitud)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-ink-700">
                    {rumbosBloqueados
                      ? <span className="text-ink-700/25 select-none">···</span>
                      : `${l.azimut.toFixed(1)}°`}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-ink-700/80 whitespace-nowrap">
                    {rumbosBloqueados
                      ? <span className="text-ink-700/25 select-none">···</span>
                      : l.rumbo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rumbosBloqueados && (
          <button
            onClick={onDesbloquearRumbos}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border-t border-bone-200 bg-bone-50 text-[11px] text-ink-700/70 hover:bg-bone-100 transition-colors"
          >
            <Lock className="w-3 h-3 shrink-0" />
            Azimut y rumbo para replanteo — ver planes
          </button>
        )}
      </div>
    </div>
  );
}
