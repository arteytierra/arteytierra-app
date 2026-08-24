'use client';

import { useState } from 'react';
import type { AnteproyectoGenerado } from '@/lib/motor/generador';
import { renderVista3D, VISTAS_3D } from '@/lib/motor/volumen';
import { ADVERTENCIA_RENDER, promptsDeRender } from '@/lib/render/prompt';

function descargar(contenido: string, nombre: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function nombreArchivo(proyecto: string | undefined, perfil: string, sufijo: string): string {
  const base = (proyecto || 'anteproyecto')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base}-${perfil}-${sufijo}`;
}

/**
 * Las 5 vistas 3D de un anteproyecto.
 *
 * Van detrás de un botón a propósito: el encargo pide los renders como paso
 * posterior a la aprobación de plantas y fachadas. Mostrarlos de entrada
 * invierte la conversación con la familia —se discute la imagen y no la
 * planta— que es exactamente lo que el método participativo evita.
 */
export function Vistas3D({ ap, proyecto }: { ap: AnteproyectoGenerado; proyecto?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  if (!abierto) {
    return (
      <div className="mt-3 rounded border border-dashed border-bone-200 p-3">
        <button
          className="rounded bg-moss-700 px-3 py-1.5 text-sm text-bone-50"
          onClick={() => setAbierto(true)}
        >
          Plantas aprobadas → generar las 5 vistas 3D
        </button>
        <p className="mt-2 text-xs text-ink-700">
          Paso posterior a la aprobación de plantas y fachadas: cinco vistas volumétricas del mismo modelo acotado,
          más el prompt de render fotorrealista de cada una.
        </p>
      </div>
    );
  }

  const prompts = promptsDeRender(ap, proyecto);
  const todos = prompts.map(p => `## ${p.titulo}\n${p.descripcion}\n\nPROMPT:\n${p.prompt}\n\nNEGATIVO:\n${p.negativo}\n`).join('\n---\n\n');

  return (
    <section className="mt-3 rounded border border-bone-200 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-base font-display">Vistas 3D · 5 puntos de vista</h4>
        <button
          className="rounded border border-moss-700 px-3 py-1 text-xs text-moss-700 hover:bg-moss-700 hover:text-bone-50"
          onClick={() =>
            descargar(
              `${ap.titulo}\n${ADVERTENCIA_RENDER}\n\n${todos}`,
              nombreArchivo(proyecto, ap.perfil, 'prompts-render.txt'),
              'text/plain;charset=utf-8',
            )
          }
        >
          Descargar los 5 prompts (.txt)
        </button>
      </div>

      <p className="mb-3 rounded border border-sun-300 bg-sun-50 p-2 text-xs text-clay-900">{ADVERTENCIA_RENDER}</p>

      <div className="grid gap-3 md:grid-cols-2">
        {VISTAS_3D.map(v => {
          const svg = renderVista3D(ap, v);
          const p = prompts.find(x => x.vistaId === v.id)!;
          return (
            <figure key={v.id} className="rounded border border-bone-200 bg-bone-50 p-2">
              <div className="overflow-hidden rounded" dangerouslySetInnerHTML={{ __html: svg }} />
              <figcaption className="mt-1 text-xs text-ink-700">
                <strong className="text-ink-950">{v.nombre}</strong> — {v.descripcion}
              </figcaption>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded border border-bone-200 px-2 py-1 text-[11px] text-ink-700 hover:bg-bone-100"
                  onClick={() => descargar(svg, nombreArchivo(proyecto, ap.perfil, `${v.id}.svg`), 'image/svg+xml')}
                >
                  Descargar SVG
                </button>
                <button
                  className="rounded border border-bone-200 px-2 py-1 text-[11px] text-ink-700 hover:bg-bone-100"
                  onClick={async () => {
                    await navigator.clipboard.writeText(p.prompt);
                    setCopiado(v.id);
                    setTimeout(() => setCopiado(null), 1800);
                  }}
                >
                  {copiado === v.id ? '✓ copiado' : 'Copiar prompt de render'}
                </button>
              </div>
              <details className="mt-2 text-[11px] text-ink-700">
                <summary className="cursor-pointer">Ver el prompt</summary>
                <p className="mt-1 whitespace-pre-wrap font-mono leading-relaxed">{p.prompt}</p>
                <p className="mt-2 whitespace-pre-wrap font-mono leading-relaxed text-ink-700">
                  <strong>Negativo:</strong> {p.negativo}
                </p>
              </details>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
