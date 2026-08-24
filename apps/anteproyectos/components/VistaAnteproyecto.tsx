'use client';

import { REFERENTES } from '@/lib/conocimiento/referentes';
import { TECNICAS_MURO } from '@/lib/conocimiento/parametros';
import { exportarPlantaDXF, nombreArchivoDXF } from '@/lib/motor/dxf';
import type { AnteproyectoGenerado } from '@/lib/motor/generador';
import { renderFachada, renderPlanta, renderTechos } from '@/lib/motor/svg';
import { Vistas3D } from './Vistas3D';

function descargar(contenido: string, nombre: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function VistaAnteproyecto({ ap, proyecto }: { ap: AnteproyectoGenerado; proyecto?: string }) {
  const plantaSvg = renderPlanta(ap);
  const techosSvg = renderTechos(ap);
  const ladoOpuesto = { N: 'S', S: 'N', E: 'O', O: 'E' } as const;
  const principal = ap.fachadaPrincipal as 'N' | 'S' | 'E' | 'O';
  const fachadaSvg = renderFachada(ap, principal);
  const fachadaOpuestaSvg = renderFachada(ap, ladoOpuesto[principal]);
  const tecnica = TECNICAS_MURO[ap.tecnicaMuro];

  return (
    <article className="rounded-lg border border-bone-200 bg-white/60 p-4">
      <header className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-display">{ap.titulo}</h3>
          <p className="text-sm text-ink-700">
            {ap.ancho_m.toFixed(1)} × {ap.profundo_m.toFixed(1)} m · {ap.area_total_m2} m² · alero {ap.alero_m.toFixed(2)} m ·
            h. muro {ap.altura_muro_m.toFixed(2)} m · fachada principal {ap.fachadaPrincipal} · muro de {tecnica.nombre.toLowerCase()}{' '}
            {(ap.espesorMuro_m * 100).toFixed(0)} cm
            {ap.envolvente === 'organica' ? ' · envolvente orgánica sobre este esquema' : ''}
          </p>
        </div>
        <button
          className="shrink-0 rounded border border-moss-700 px-3 py-1.5 text-xs text-moss-700 hover:bg-moss-700 hover:text-bone-50"
          onClick={() => descargar(exportarPlantaDXF(ap), nombreArchivoDXF(ap, proyecto), 'application/dxf')}
        >
          Descargar DXF
        </button>
      </header>

      {ap.advertencias.length > 0 && (
        <ul className="mb-3 space-y-1 rounded border border-sun-300 bg-sun-50 p-3 text-sm text-clay-900">
          {ap.advertencias.map((a, i) => (
            <li key={i}>⚠ {a}</li>
          ))}
        </ul>
      )}

      <ul className="mb-3 space-y-1 text-sm text-ink-800">
        {ap.fundamento.map((linea, i) => (
          <li key={i}>· {linea}</li>
        ))}
      </ul>

      {ap.etapas && (
        <p className="mb-3 text-sm text-moss-700">
          {ap.etapas.map(e => `${e.nombre} (${e.ambientesIds.length} ambientes)`).join(' → ')}
        </p>
      )}

      <div className="mb-2">
        <p className="mb-1 text-xs uppercase tracking-wide text-ink-700">Planta con amoblamiento</p>
        <div className="overflow-x-auto rounded border border-bone-200 bg-bone-50 p-2" dangerouslySetInnerHTML={{ __html: plantaSvg }} />
      </div>

      <div className="mb-2 grid gap-2 md:grid-cols-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-700">Planta de techos</p>
          <div className="overflow-x-auto rounded border border-bone-200 bg-bone-50 p-2" dangerouslySetInnerHTML={{ __html: techosSvg }} />
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-700">Fachada {principal}</p>
          <div className="overflow-x-auto rounded border border-bone-200 bg-bone-50 p-2" dangerouslySetInnerHTML={{ __html: fachadaSvg }} />
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-700">Fachada {ladoOpuesto[principal]}</p>
          <div className="overflow-x-auto rounded border border-bone-200 bg-bone-50 p-2" dangerouslySetInnerHTML={{ __html: fachadaOpuestaSvg }} />
        </div>
      </div>

      <Vistas3D ap={ap} proyecto={proyecto} />

      {ap.fuentes.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-ink-700">Fuentes que fundamentan este anteproyecto ({ap.fuentes.length})</summary>
          <ul className="mt-2 space-y-1 text-xs text-ink-700">
            {ap.fuentes.map(id => {
              const r = REFERENTES[id];
              if (!r) return null;
              return (
                <li key={id}>
                  <strong>{r.autor}</strong>, <em>{r.obra}</em>
                  {r.anio ? ` (${r.anio})` : ''}
                  {r.propio ? ' · material propio de Arte y Tierra' : ''} — {r.aporte}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </article>
  );
}
