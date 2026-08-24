'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProyectoGuardado, ResumenProyecto } from '@/lib/proyectos/tipos';

function fechaLegible(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Guardado y apertura de proyectos.
 *
 * Guarda el enunciado (sitio, programa, parámetros, cuaderno leído), no los
 * anteproyectos dibujados: al abrir se regenera todo con el motor actual, así
 * un proyecto viejo nunca queda mostrando geometría que el motor ya no produce.
 */
export function PanelProyectos({
  construirProyecto,
  onCargar,
  nombreActual,
}: {
  construirProyecto: () => ProyectoGuardado | null;
  onCargar: (p: ProyectoGuardado) => void;
  nombreActual: string;
}) {
  const [lista, setLista] = useState<ResumenProyecto[]>([]);
  const [carpeta, setCarpeta] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const refrescar = useCallback(async () => {
    try {
      const res = await fetch('/api/proyectos');
      const json = await res.json();
      if (json.error) setError(json.error);
      else {
        setLista(json.proyectos ?? []);
        setCarpeta(json.carpeta ?? '');
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo listar los proyectos guardados.');
    }
  }, []);

  useEffect(() => {
    void refrescar();
  }, [refrescar]);

  async function guardar() {
    const proyecto = construirProyecto();
    if (!proyecto) {
      setError('Poné un nombre de proyecto antes de guardar: es el nombre del archivo.');
      return;
    }
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proyecto),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else {
        setAviso(`Guardado como ${json.proyecto.id}.json`);
        setTimeout(() => setAviso(null), 2500);
        await refrescar();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setOcupado(false);
    }
  }

  async function abrir(id: string) {
    setOcupado(true);
    try {
      const res = await fetch(`/api/proyectos/${encodeURIComponent(id)}`);
      const json = await res.json();
      if (json.error) setError(json.error);
      else onCargar(json.proyecto as ProyectoGuardado);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir el proyecto.');
    } finally {
      setOcupado(false);
    }
  }

  async function borrar(p: ResumenProyecto) {
    // Borra un archivo del disco: se pregunta siempre, con el nombre a la vista.
    if (!window.confirm(`¿Borrar el proyecto "${p.nombre}"? Se elimina el archivo ${p.id}.json.`)) return;
    setOcupado(true);
    try {
      const res = await fetch(`/api/proyectos/${encodeURIComponent(p.id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) setError(json.error);
      else await refrescar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="mb-8 rounded-lg border border-bone-200 bg-white/60 p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl">0 · Proyectos guardados</h2>
        <button
          className="rounded bg-clay-500 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          onClick={guardar}
          disabled={ocupado}
        >
          Guardar «{nombreActual || 'sin nombre'}»
        </button>
      </div>

      {carpeta && (
        <p className="mb-2 text-xs text-ink-700">
          Un archivo JSON por proyecto en <code>{carpeta}</code>. Se pueden copiar, versionar y abrir con cualquier editor.
        </p>
      )}
      {error && <p className="mb-2 text-sm text-danger-500">{error}</p>}
      {aviso && <p className="mb-2 text-sm text-moss-700">{aviso}</p>}

      {lista.length === 0 ? (
        <p className="text-sm text-ink-700">Todavía no hay proyectos guardados.</p>
      ) : (
        <ul className="divide-y divide-bone-200 text-sm">
          {lista.map(p => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <strong>{p.nombre}</strong>
                <span className="text-ink-700">
                  {' '}
                  · {p.ambientes} ambiente{p.ambientes === 1 ? '' : 's'} · {p.m2Objetivo} m² · {fechaLegible(p.guardadoEn)}
                </span>
              </span>
              <span className="flex gap-2">
                <button
                  className="rounded border border-moss-700 px-3 py-1 text-xs text-moss-700 hover:bg-moss-700 hover:text-bone-50 disabled:opacity-50"
                  onClick={() => abrir(p.id)}
                  disabled={ocupado}
                >
                  Abrir
                </button>
                <button
                  className="rounded border border-bone-200 px-3 py-1 text-xs text-danger-500 hover:bg-bone-100 disabled:opacity-50"
                  onClick={() => borrar(p)}
                  disabled={ocupado}
                >
                  Borrar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
