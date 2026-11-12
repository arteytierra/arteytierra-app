'use client';

import { AlertTriangle } from 'lucide-react';
import type { AvisoCalculo } from '@/lib/hidrologiaPredio';

/**
 * El aviso de suelo expansivo en las herramientas que proyectan una obra.
 *
 * Existe aparte de `SaludCalculo` por una razón de lectura y no de código: ese
 * bloque es plegable y arranca cerrado cuando la confianza es alta, y acá el
 * aviso tiene que verse **antes** de que el usuario trace la zanja o genere el
 * patrón. Un suelo expansivo no baja la confianza del cálculo —los números
 * salen bien de los datos que entraron—: lo que cambia es qué obra corresponde,
 * y eso no se puede esconder detrás de un plegado.
 *
 * El mismo criterio de color que el bloque de suelo expansivo en el panel de
 * Suelo: barro cuando el diagnóstico es medido (SSURGO), sol cuando es inferido
 * de SoilGrids y por lo tanto puede ser una ilita que no se hincha.
 */
export function AvisoSueloObra({ aviso }: { aviso: AvisoCalculo }) {
  const medido = aviso.nivel === 'alerta';
  return (
    <div className={`rounded-xl border p-3 space-y-1.5 ${
      medido ? 'bg-clay-100 border-clay-300' : 'bg-sun-300/20 border-sun-300'
    }`}>
      <p className="text-xs font-semibold text-clay-700 flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-[2px]" />
        <span>{aviso.titulo}</span>
      </p>
      <p className="text-[10px] text-ink-700/75 leading-relaxed">{aviso.detalle}</p>
    </div>
  );
}
