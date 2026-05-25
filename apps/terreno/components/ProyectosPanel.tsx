'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Plus, Share2, Copy, Check } from 'lucide-react';
import {
  listarProyectos,
  guardarProyecto,
  actualizarProyecto,
  eliminarProyecto,
  publicarInforme,
  type Proyecto,
} from '@/lib/proyectos';
import { importarKML, importarKMZ, importarCSV, exportarCSV } from '@/lib/importar';
import { urlInforme } from '@/lib/informe';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones: Mojon[];
  proyectoActual: Proyecto | null;
  onCargarProyecto: (p: Proyecto) => void;
  onProyectoActualChange: (p: Proyecto | null) => void;
  metadatos?: Record<string, unknown>;
}

export function ProyectosPanel({
  mojones,
  proyectoActual,
  onCargarProyecto,
  onProyectoActualChange,
  metadatos,
}: Props) {
  const [proyectos, setProyectos]     = useState<Proyecto[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [guardando, setGuardando]     = useState(false);
  const [nombre, setNombre]           = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [importando, setImportando]   = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);
  const [urlCompartida, setUrlCompartida] = useState<string | null>(null);
  const [copiado, setCopiado]         = useState(false);

  const recargar = useCallback(async () => {
    try {
      const data = await listarProyectos();
      setProyectos(data);
    } catch {
      setError('No se pudo cargar la lista de proyectos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  useEffect(() => {
    if (proyectoActual) {
      setNombre(proyectoActual.nombre);
      setDescripcion(proyectoActual.descripcion ?? '');
      // Si ya era público, mostrar la URL
      if (proyectoActual.informe_publico && proyectoActual.informe_token) {
        setUrlCompartida(urlInforme(proyectoActual.informe_token));
      } else {
        setUrlCompartida(null);
      }
    }
  }, [proyectoActual]);

  async function handleGuardar() {
    if (!nombre.trim()) { setError('Escribí un nombre para el proyecto.'); return; }
    if (mojones.length === 0) { setError('No hay mojones para guardar.'); return; }
    setGuardando(true);
    setError(null);
    try {
      if (proyectoActual) {
        await actualizarProyecto(proyectoActual.id, nombre.trim(), descripcion, mojones, metadatos);
        onProyectoActualChange({ ...proyectoActual, nombre: nombre.trim(), descripcion, mojones, metadatos: metadatos ?? null });
      } else {
        const p = await guardarProyecto(nombre.trim(), descripcion, mojones, metadatos);
        onProyectoActualChange(p);
      }
      await recargar();
    } catch {
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleCompartir() {
    if (!proyectoActual?.id) {
      setError('Primero guardá el proyecto para poder compartirlo.');
      return;
    }
    setCompartiendo(true);
    setError(null);
    try {
      // Actualizar con los metadatos más recientes antes de publicar
      await actualizarProyecto(proyectoActual.id, proyectoActual.nombre, proyectoActual.descripcion ?? '', mojones, metadatos);
      const token = await publicarInforme(proyectoActual.id);
      const url = urlInforme(token);
      setUrlCompartida(url);
      onProyectoActualChange({ ...proyectoActual, informe_publico: true, informe_token: token });
    } catch {
      setError('No se pudo generar el link. Intentá de nuevo.');
    } finally {
      setCompartiendo(false);
    }
  }

  async function handleCopiar() {
    if (!urlCompartida) return;
    try {
      await navigator.clipboard.writeText(urlCompartida);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // fallback: seleccionar texto del input
    }
  }

  function handleNuevo() {
    setNombre('');
    setDescripcion('');
    setUrlCompartida(null);
    onProyectoActualChange(null);
  }

  async function handleEliminar(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await eliminarProyecto(id);
      if (proyectoActual?.id === id) {
        onProyectoActualChange(null);
        setNombre('');
        setUrlCompartida(null);
      }
      await recargar();
    } catch {
      setError('No se pudo eliminar el proyecto.');
    }
  }

  async function handleImportar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true);
    setError(null);
    try {
      let mojonesImport: Mojon[] = [];
      if (file.name.endsWith('.kmz')) {
        mojonesImport = await importarKMZ(file);
      } else if (file.name.endsWith('.kml')) {
        mojonesImport = await importarKML(file);
      } else if (file.name.endsWith('.csv')) {
        mojonesImport = await importarCSV(file);
      } else {
        setError('Formato no soportado. Usá .kml, .kmz o .csv');
        return;
      }
      const nom = file.name.replace(/\.(kml|kmz|csv)$/i, '');
      const p: Proyecto = {
        id: '', nombre: nom, descripcion: null,
        mojones: mojonesImport, metadatos: null,
        informe_token: '', informe_publico: false,
        created_at: '', updated_at: '',
      };
      onCargarProyecto(p);
      setNombre(nom);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar el archivo.');
    } finally {
      setImportando(false);
      e.target.value = '';
    }
  }

  function handleExportar() {
    if (mojones.length === 0) return;
    exportarCSV(mojones, nombre || 'terreno');
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-bone-200 bg-white text-ink-950 placeholder:text-ink-700/30 focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors text-xs';

  return (
    <div className="space-y-4">
      {/* Guardar / Nuevo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
            {proyectoActual ? 'Proyecto actual' : 'Guardar proyecto'}
          </h3>
          {proyectoActual && (
            <button
              onClick={handleNuevo}
              className="flex items-center gap-1 text-xs text-moss-700 hover:text-moss-900 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Nuevo
            </button>
          )}
        </div>

        <input
          className={inputClass}
          placeholder="Nombre del terreno"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />

        {error && <p className="text-xs text-danger-500 leading-snug">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleGuardar}
            disabled={guardando || mojones.length === 0}
            title="Guardar proyecto en la nube"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            {guardando ? 'Guardando…' : proyectoActual ? 'Actualizar' : 'Guardar'}
          </button>
          <button
            onClick={handleExportar}
            disabled={mojones.length === 0}
            title="Exportar mojones como CSV"
            className="p-2 border border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Botón compartir informe */}
        {proyectoActual?.id && (
          <button
            onClick={handleCompartir}
            disabled={compartiendo}
            title="Generar link público de sólo lectura"
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-moss-300 hover:bg-moss-50 text-moss-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Share2 className="w-3.5 h-3.5" />
            {compartiendo ? 'Generando link…' : 'Compartir informe'}
          </button>
        )}

        {/* URL compartida */}
        {urlCompartida && (
          <div className="rounded-lg border border-moss-200 bg-moss-50 p-2.5 space-y-1.5">
            <p className="text-xs font-medium text-moss-700">Link de sólo lectura:</p>
            <div className="flex items-center gap-1.5">
              <input
                readOnly
                value={urlCompartida}
                className="flex-1 text-xs font-mono bg-white border border-moss-200 rounded px-2 py-1 text-ink-700 focus:outline-none"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopiar}
                title="Copiar link"
                className="shrink-0 p-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded transition-colors"
              >
                {copiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-xs text-moss-700/70">
              Cualquier persona con este link puede ver el informe.
            </p>
          </div>
        )}
      </div>

      {/* Importar */}
      <div>
        <label className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg text-xs font-medium transition-colors cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          {importando ? 'Importando…' : 'Importar KML / KMZ / CSV'}
          <input
            type="file"
            accept=".kml,.kmz,.csv"
            className="hidden"
            onChange={handleImportar}
            disabled={importando}
          />
        </label>
      </div>

      {/* Lista de proyectos */}
      <div>
        <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">
          Mis proyectos
        </h3>

        {cargando ? (
          <p className="text-xs text-ink-700/50 text-center py-4">Cargando…</p>
        ) : proyectos.length === 0 ? (
          <p className="text-xs text-ink-700/50 text-center py-4">
            Todavía no guardaste ningún proyecto.
          </p>
        ) : (
          <div className="space-y-1.5">
            {proyectos.map(p => (
              <div
                key={p.id}
                onClick={() => onCargarProyecto(p)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  proyectoActual?.id === p.id
                    ? 'bg-moss-100 border-moss-300'
                    : 'bg-white border-bone-200 hover:border-moss-200'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-moss-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-900 truncate">{p.nombre}</p>
                  <p className="text-xs text-ink-700/50 truncate">
                    {p.mojones.length} moj.{p.informe_publico ? ' · compartido' : ''}{' '}
                    · {new Date(p.updated_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={e => handleEliminar(p.id, e)}
                  className="shrink-0 text-ink-700/25 hover:text-danger-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
