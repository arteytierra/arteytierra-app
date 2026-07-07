'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Plus, Share2, Copy, Check, HardDrive } from 'lucide-react';
import {
  listarProyectos,
  guardarProyecto,
  actualizarProyecto,
  eliminarProyecto,
  publicarInforme,
  type Proyecto,
} from '@/lib/proyectos';
import { importarKML, importarKMZ, importarCSV, exportarCSV } from '@/lib/importar';
import { exportarGeoJSON, exportarKML, exportarGPX, importarGeoJSON, importarGPX } from '@/lib/exportar';
import { urlInforme } from '@/lib/informe';
import type { Mojon } from '@/lib/types';
import type { Zona } from '@/lib/zonificacion';
import type { Pin } from '@/lib/pines';
import type { Camino } from '@/lib/caminos';
import type { Sector } from '@/lib/sectores';

/** Extrae un mensaje legible de cualquier error (incluye PostgrestError de Supabase). */
function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    const parts = [o['message'], o['details'], o['hint'], o['code']].filter(Boolean).map(String);
    if (parts.length) return parts.join(' · ');
    try { return JSON.stringify(o); } catch { return String(err); }
  }
  return String(err);
}

interface Props {
  mojones:  Mojon[];
  zonas?:   Zona[];
  sectores?: Sector[];
  pines?:   Pin[];
  caminos?: Camino[];
  proyectoActual: Proyecto | null;
  onCargarProyecto: (p: Proyecto) => void;
  onProyectoActualChange: (p: Proyecto | null) => void;
  metadatos?: Record<string, unknown>;
  onConfirm?: (message: string, onConfirm: () => void) => void;
}

export function ProyectosPanel({
  mojones, zonas = [], sectores = [], pines = [], caminos = [],
  proyectoActual,
  onCargarProyecto,
  onProyectoActualChange,
  metadatos,
  onConfirm,
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`No se pudo cargar proyectos: ${msg}`);
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
    } catch (err) {
      setError(`Error al guardar: ${errMsg(err)}`);
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`No se pudo generar el link: ${msg}`);
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
    const doEliminar = async () => {
      try {
        await eliminarProyecto(id);
        if (proyectoActual?.id === id) {
          onProyectoActualChange(null);
          setNombre('');
          setUrlCompartida(null);
        }
        await recargar();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`No se pudo eliminar el proyecto: ${msg}`);
      }
    };
    if (onConfirm) {
      onConfirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.', doEliminar);
    } else {
      if (!confirm('¿Eliminar este proyecto?')) return;
      await doEliminar();
    }
  }

  async function handleImportar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true);
    setError(null);
    try {
      let coords: Array<{ lat: number; lng: number }> = [];
      if (file.name.endsWith('.kmz')) {
        const mojs = await importarKMZ(file); coords = mojs;
      } else if (file.name.endsWith('.kml')) {
        const mojs = await importarKML(file); coords = mojs;
      } else if (file.name.endsWith('.csv')) {
        const mojs = await importarCSV(file); coords = mojs;
      } else if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
        coords = importarGeoJSON(await file.text());
      } else if (file.name.endsWith('.gpx')) {
        coords = importarGPX(await file.text());
      } else {
        setError('Formato no soportado. Usá .kml, .kmz, .csv, .geojson o .gpx');
        return;
      }
      const mojonesImport: Mojon[] = coords.map((c, i) => ({ id: crypto.randomUUID(), numero: i + 1, lat: c.lat, lng: c.lng }));
      const nom = file.name.replace(/\.(kml|kmz|csv|geojson|gpx|json)$/i, '');
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

  function handleExportarGeoJSON() {
    if (mojones.length === 0) return;
    exportarGeoJSON({ mojones, zonas, sectores, pines, caminos, nombre: nombre || 'terreno' });
  }

  function handleExportarKML() {
    if (mojones.length === 0) return;
    exportarKML(mojones, nombre || 'terreno');
  }

  function handleExportarGPX() {
    if (mojones.length === 0) return;
    exportarGPX(mojones, nombre || 'terreno');
  }

  function handleExportarJSON() {
    if (mojones.length === 0) return;
    const data = { nombre: nombre || 'terreno', descripcion, mojones, metadatos: metadatos ?? null };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(nombre || 'terreno').replace(/[^a-zA-Z0-9_-]/g, '_')}.terreno.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportarJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as { nombre?: string; descripcion?: string; mojones?: Mojon[]; metadatos?: Record<string, unknown> | null };
      if (!Array.isArray(data.mojones)) { setError('Archivo JSON inválido: falta "mojones".'); return; }
      const p: Proyecto = {
        id: '', nombre: data.nombre ?? file.name.replace('.terreno.json', ''),
        descripcion: data.descripcion ?? null,
        mojones: data.mojones, metadatos: data.metadatos ?? null,
        informe_token: '', informe_publico: false,
        created_at: '', updated_at: '',
      };
      onCargarProyecto(p);
      setNombre(p.nombre);
      setDescripcion(p.descripcion ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al leer el archivo JSON.');
    } finally {
      e.target.value = '';
    }
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
            onClick={handleExportarJSON}
            disabled={mojones.length === 0}
            title="Guardar proyecto completo como archivo JSON local"
            className="p-2 border border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <HardDrive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportar}
            disabled={mojones.length === 0}
            title="Exportar mojones como CSV"
            className="p-2 border border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportarGeoJSON}
            disabled={mojones.length === 0}
            title="Exportar como GeoJSON (predio + capas)"
            className="p-2 border border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg transition-colors disabled:opacity-40 text-[9px] font-bold"
          >
            GJ
          </button>
          <button
            onClick={handleExportarKML}
            disabled={mojones.length === 0}
            title="Exportar mojones como KML (Google Earth)"
            className="p-2 border border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg transition-colors disabled:opacity-40 text-[9px] font-bold"
          >
            KML
          </button>
          <button
            onClick={handleExportarGPX}
            disabled={mojones.length === 0}
            title="Exportar mojones como GPX (GPS)"
            className="p-2 border border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg transition-colors disabled:opacity-40 text-[9px] font-bold"
          >
            GPX
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
      <div className="space-y-1.5">
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
        <label className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-bone-200 hover:border-moss-300 text-moss-700 rounded-lg text-xs font-medium transition-colors cursor-pointer">
          <HardDrive className="w-3.5 h-3.5" />
          Cargar proyecto JSON local
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportarJSON}
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
