'use client';

import { useState } from 'react';
import type { AmbienteDeseado } from '@/lib/tipos';
import type { CuadernoLeido } from '@/lib/ingesta/cuaderno';
import type { RolArchivo } from '@/lib/ingesta/carpeta';

interface RespuestaIngesta {
  ruta: string;
  archivos: { nombre: string; rol: RolArchivo; bytes: number }[];
  conteoPorRol: Record<RolArchivo, number>;
  cuaderno: CuadernoLeido | null;
  programaSugerido: AmbienteDeseado[] | null;
  error?: string;
  errorCuaderno?: string;
}

const ETIQUETA_ROL: Record<RolArchivo, string> = {
  cuaderno: 'Cuaderno completado',
  'dibujo-cliente': 'Dibujos del cliente',
  'foto-sitio': 'Fotos del sitio',
  'video-sitio': 'Videos del recorrido',
  documento: 'Documentos',
  moodboard: 'Moodboard',
  otro: 'Otros',
};

const RUTA_POR_DEFECTO = 'C:/Arte y Tierra/2. Bioconstruccion/proyectos/Jose P.R/Respuestas';

export function PanelIngesta({
  onPrograma,
  onCuaderno,
  onCarpeta,
  rutaInicial,
}: {
  onPrograma: (ambientes: AmbienteDeseado[]) => void;
  onCuaderno: (c: CuadernoLeido) => void;
  /** Avisa qué carpeta se leyó, para guardarla junto al proyecto. */
  onCarpeta?: (ruta: string) => void;
  rutaInicial?: string;
}) {
  const [ruta, setRuta] = useState(rutaInicial || RUTA_POR_DEFECTO);
  const [datos, setDatos] = useState<RespuestaIngesta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<'subir' | 'carpeta-local'>('subir');

  async function leer() {
    setCargando(true);
    setError(null);
    setDatos(null);
    try {
      const res = await fetch(`/api/ingesta?ruta=${encodeURIComponent(ruta)}`);
      const json = (await res.json()) as RespuestaIngesta;
      if (json.error) {
        setError(json.error);
      } else {
        setDatos(json);
        onCarpeta?.(ruta);
        if (json.cuaderno) onCuaderno(json.cuaderno);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer la carpeta.');
    } finally {
      setCargando(false);
    }
  }

  async function subir(archivos: FileList) {
    setCargando(true);
    setError(null);
    setDatos(null);
    try {
      const form = new FormData();
      form.set('carpetaId', `proyecto-${Date.now().toString(36)}`);
      Array.from(archivos).forEach(f => form.append('archivos', f));
      const res = await fetch('/api/ingesta/subir', { method: 'POST', body: form });
      const json = (await res.json()) as RespuestaIngesta;
      if (json.error) {
        setError(json.error);
      } else {
        setDatos(json);
        onCarpeta?.(json.ruta);
        if (json.cuaderno) onCuaderno(json.cuaderno);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron subir los archivos.');
    } finally {
      setCargando(false);
    }
  }

  const sugerido = datos?.programaSugerido ?? [];

  return (
    <section className="mb-8 rounded-lg border border-bone-200 bg-white/60 p-5">
      <h2 className="mb-3 text-xl">1 · Carpeta del proyecto</h2>
      <p className="mb-3 text-sm text-ink-700">
        Cuaderno de Diseño Participativo completado, fotos y videos del terreno, dibujos a mano y PDFs
        complementarios.
      </p>

      <div className="mb-3 flex gap-3 text-xs">
        <button
          type="button"
          onClick={() => setModo('subir')}
          className={modo === 'subir' ? 'font-semibold text-moss-700 underline' : 'text-ink-600'}
        >
          Subir archivos
        </button>
        <button
          type="button"
          onClick={() => setModo('carpeta-local')}
          className={modo === 'carpeta-local' ? 'font-semibold text-moss-700 underline' : 'text-ink-600'}
        >
          Carpeta en este servidor (modo estudio)
        </button>
      </div>

      {modo === 'subir' ? (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            multiple
            disabled={cargando}
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) void subir(e.target.files);
            }}
            className="text-sm"
          />
          {cargando && <p className="text-xs text-ink-600">Subiendo…</p>}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-bone-200 px-2 py-1 text-sm"
            value={ruta}
            onChange={e => setRuta(e.target.value)}
          />
          <button className="rounded bg-moss-700 px-4 py-1.5 text-sm text-bone-50 disabled:opacity-50" onClick={leer} disabled={cargando}>
            {cargando ? 'Leyendo…' : 'Leer carpeta'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
      {datos?.errorCuaderno && (
        <p className="mt-3 text-sm text-danger-500">No se pudo leer el cuaderno: {datos.errorCuaderno}</p>
      )}

      {datos && (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {(Object.entries(datos.conteoPorRol) as [RolArchivo, number][]).map(([rol, n]) => (
              <span key={rol} className="rounded-full bg-bone-100 px-3 py-1 text-xs">
                {ETIQUETA_ROL[rol]}: <strong>{n}</strong>
              </span>
            ))}
          </div>

          {datos.cuaderno && (
            <p className="text-moss-700">
              Cuaderno leído: {datos.cuaderno.secciones.length} secciones, {datos.cuaderno.programa.length} filas en la
              tabla del programa de necesidades.
            </p>
          )}

          {sugerido.length > 0 ? (
            <div className="rounded border border-bone-200 bg-bone-50 p-3">
              <p className="mb-2">
                Programa detectado en el cuaderno: {sugerido.map(a => a.nombre).join(', ')}.
              </p>
              <button className="rounded bg-clay-500 px-3 py-1.5 text-xs text-white" onClick={() => onPrograma(sugerido)}>
                Usar este programa
              </button>
              <p className="mt-2 text-xs text-ink-700">
                Revisá el resultado abajo: la familia completó sólo {sugerido.length} fila
                {sugerido.length === 1 ? '' : 's'} de la tabla, así que probablemente falten ambientes que sí mencionaron
                en el texto (dormitorios, baños). Agregalos a mano antes de generar.
              </p>
            </div>
          ) : (
            datos.cuaderno && (
              <p className="text-ink-700">
                El cuaderno no trae filas utilizables en la tabla del punto 10. Cargá el programa a mano abajo.
              </p>
            )
          )}
        </div>
      )}
    </section>
  );
}
