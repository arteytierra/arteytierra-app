'use client';

import { useMemo } from 'react';
import { Mountain } from 'lucide-react';
import { calcularAptitud, agruparAptitud, LABELS_APTITUD, COLORES_APTITUD, type TipoAptitud, type ResultadoAptitud } from '@/lib/aptitud';
import { crearZona } from '@/lib/zonificacion';
import type { DatosShader } from '@/lib/shaders';
import type { DatosEscorrentia } from '@/lib/escorrentias';
import type { Zona } from '@/lib/zonificacion';

interface Props {
  datosShader:     DatosShader | null;
  datosEscorrentia: DatosEscorrentia | null;
  onAplicarZonas:  (zonas: Zona[]) => void;
  onIrATopo:       () => void;
}

export function AptitudPanel({ datosShader, datosEscorrentia, onAplicarZonas, onIrATopo }: Props) {
  const resultado = useMemo<ResultadoAptitud | null>(
    () => datosShader ? calcularAptitud(datosShader, datosEscorrentia) : null,
    [datosShader, datosEscorrentia],
  );

  if (!datosShader || !resultado) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Mountain className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Calculá la topografía del predio para obtener la aptitud de uso del suelo.
        </p>
        <button onClick={onIrATopo} className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors">
          <Mountain className="w-3.5 h-3.5" />Calcular topografía
        </button>
      </div>
    );
  }

  const tipos: TipoAptitud[] = ['huerta', 'frutales', 'pasturas', 'forestal', 'reserva'];

  function handleAplicarZonas() {
    if (!resultado) return;
    const categoriaMap: Record<TipoAptitud, import('@/lib/zonificacion').CategoriaZona> = {
      huerta:   'huerta',
      frutales: 'frutales',
      pasturas: 'pasturas',
      forestal: 'monte_nativo',
      reserva:  'monte_nativo',
    };
    const colorMap: Record<TipoAptitud, string> = {
      huerta:   '#2E7D32',
      frutales: '#689F38',
      pasturas: '#F9A825',
      forestal: '#5D4037',
      reserva:  '#78909C',
    };

    // Un polígono por cada mancha contigua de aptitud dominante (no una caja
    // envolvente por tipo, que cubría todo el predio y se superponía).
    const clusters = agruparAptitud(resultado);
    const contadorPorTipo = new Map<TipoAptitud, number>();

    const zonas: Zona[] = clusters.map(cl => {
      const base   = crearZona(categoriaMap[cl.tipo], cl.anillo);
      const nombre = LABELS_APTITUD[cl.tipo].replace(' — ', ': ');
      const nMismo = clusters.filter(c => c.tipo === cl.tipo).length;
      let etiqueta = nombre;
      if (nMismo > 1) {
        const idx = (contadorPorTipo.get(cl.tipo) ?? 0) + 1;
        contadorPorTipo.set(cl.tipo, idx);
        etiqueta = `${nombre} ${idx}`;
      }
      return { ...base, nombre: etiqueta, color: colorMap[cl.tipo] };
    });

    onAplicarZonas(zonas);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Aptitud de uso del suelo</p>

      {/* Resumen visual */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200">
          <p className="text-xs font-medium text-ink-700">Distribución por aptitud ({resultado.celdas.length} celdas)</p>
        </div>
        <div className="p-3 space-y-2">
          {tipos.map(tipo => {
            const r = resultado.resumen[tipo];
            return (
              <div key={tipo} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORES_APTITUD[tipo] }} />
                <span className="text-[9px] text-ink-700 flex-1 leading-tight">{LABELS_APTITUD[tipo]}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-20 h-1.5 bg-bone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: COLORES_APTITUD[tipo] }} />
                  </div>
                  <span className="text-[9px] font-mono text-ink-700/60 w-8 text-right">{r.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Descripción por tipo */}
      <div className="space-y-2">
        {tipos.filter(t => resultado.resumen[t].pct > 0).map(tipo => (
          <div key={tipo} className="bg-white rounded-xl border border-bone-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORES_APTITUD[tipo] }} />
              <p className="text-[10px] font-semibold text-ink-700">{LABELS_APTITUD[tipo]}</p>
              <span className="ml-auto text-[9px] font-mono text-ink-700/60">{resultado.resumen[tipo].celdas} celdas · {resultado.resumen[tipo].pct}%</span>
            </div>
            <p className="text-[9px] text-ink-700/60 leading-relaxed">{DESCRIPCION_APTITUD[tipo]}</p>
          </div>
        ))}
      </div>

      {/* Botón aplicar como zonas */}
      <button
        onClick={handleAplicarZonas}
        className="w-full py-2.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        Aplicar como zonas editables
      </button>
      <p className="text-[8px] text-ink-700/40 italic px-1">
        Crea zonas por aptitud dominante en base a pendiente, orientación y acumulación hídrica.
        No reemplaza relevamiento agronómico/edafológico profesional.
      </p>
    </div>
  );
}

const DESCRIPCION_APTITUD: Record<TipoAptitud, string> = {
  huerta:   'Zonas planas con buena orientación norte y acceso al agua. Aptas para horticultura intensiva, jardines productivos y cultivos de ciclo corto.',
  frutales: 'Laderas suaves con orientación norte-noroeste. Buenas condiciones de temperatura y drenaje para árboles frutales y viña.',
  pasturas: 'Áreas moderadamente planas a inclinadas. Adecuadas para pasturas naturales o implantadas, silvopastoril y cultivos extensivos.',
  forestal: 'Pendientes pronunciadas y laderas con menos insolación. Conservación de monte nativo, forestación productiva o cortafuegos.',
  reserva:  'Zonas con limitaciones severas: pendiente muy alta, fondos de valle inundables o posición expuesta. Reserva ecológica o sin uso.',
};
