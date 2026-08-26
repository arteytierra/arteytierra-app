'use client';

import { useState } from 'react';
import { MapaSitio } from '@/components/mapa/MapaSitio';
import { PanelIngesta } from '@/components/PanelIngesta';
import { PanelProyectos } from '@/components/PanelProyectos';
import { VistaAnteproyecto } from '@/components/VistaAnteproyecto';
import { obtenerClima, type DatosClima } from '@/lib/clima';
import type { CuadernoLeido } from '@/lib/ingesta/cuaderno';
import { generarAnteproyecto, type AnteproyectoGenerado } from '@/lib/motor/generador';
import { NOMBRE_TIPO } from '@/lib/motor/areas';
import { PERFILES } from '@/lib/perfiles';
import { idDesdeNombre, VERSION_PROYECTO, type ProyectoGuardado } from '@/lib/proyectos/tipos';
import {
  PARAMETROS_TRANSVERSALES_DEFAULT,
  TAMANOS,
  type AmbienteDeseado,
  type NivelCualitativo,
  type ParametrosTransversales,
  type PerfilId,
  type Tamano,
  type TipoAmbiente,
} from '@/lib/tipos';

const TIPOS_AMBIENTE = Object.keys(NOMBRE_TIPO) as TipoAmbiente[];

function nuevoId(): string {
  return `amb-${Math.random().toString(36).slice(2, 8)}`;
}

function ambienteVacio(): AmbienteDeseado {
  return { id: nuevoId(), tipo: 'dormitorio', cantidad: 1, tamano: 'mediano', adyacenciasDeseadas: [] };
}

export default function Home() {
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [m2Objetivo, setM2Objetivo] = useState(90);
  const [ambientes, setAmbientes] = useState<AmbienteDeseado[]>([
    { id: 'estar', tipo: 'estar-cocina-comedor', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: [] },
    { id: 'd1', tipo: 'dormitorio', nombre: 'Dormitorio principal', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: ['bano1'] },
    { id: 'd2', tipo: 'dormitorio', cantidad: 2, tamano: 'mediano', adyacenciasDeseadas: [] },
    { id: 'bano1', tipo: 'bano', cantidad: 1, tamano: 'mediano', adyacenciasDeseadas: ['estar'] },
    { id: 'hall', tipo: 'hall', cantidad: 1, tamano: 'chico', adyacenciasDeseadas: ['estar'] },
  ]);
  const [parametros, setParametros] = useState<ParametrosTransversales>(PARAMETROS_TRANSVERSALES_DEFAULT);
  const [perfilesActivos, setPerfilesActivos] = useState<PerfilId[]>(['fiel-cliente', 'organico', 'bioclimatico']);

  const [clima, setClima] = useState<DatosClima | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<AnteproyectoGenerado[] | null>(null);
  const [cuaderno, setCuaderno] = useState<CuadernoLeido | null>(null);
  const [zonaSismica, setZonaSismica] = useState(false);
  const [carpeta, setCarpeta] = useState<string | undefined>(undefined);
  // Remonta el panel de ingesta al abrir un proyecto, para que su campo de
  // ruta muestre la carpeta guardada y no la de la sesión anterior.
  const [sesion, setSesion] = useState(0);

  /**
   * Enunciado del proyecto tal como se guarda: sitio, programa y parámetros.
   * No incluye los anteproyectos generados a propósito — se regeneran al abrir.
   */
  function construirProyecto(): ProyectoGuardado | null {
    const nombre = nombreProyecto.trim();
    if (!nombre) return null;
    return {
      version: VERSION_PROYECTO,
      id: idDesdeNombre(nombre),
      nombre,
      guardadoEn: new Date().toISOString(),
      carpeta,
      lat,
      lng,
      m2Objetivo,
      ambientes,
      parametros,
      perfilesActivos,
      zonaSismica,
      cuaderno,
    };
  }

  function cargarProyecto(p: ProyectoGuardado) {
    setNombreProyecto(p.nombre);
    setLat(p.lat);
    setLng(p.lng);
    setM2Objetivo(p.m2Objetivo);
    setAmbientes(p.ambientes);
    setParametros(p.parametros);
    setPerfilesActivos(p.perfilesActivos);
    setZonaSismica(p.zonaSismica);
    setCuaderno(p.cuaderno ?? null);
    setCarpeta(p.carpeta);
    // Los resultados en pantalla son del proyecto anterior: se limpian para no
    // dejar planos de una casa junto al programa de otra.
    setResultados(null);
    setClima(null);
    setError(null);
    setSesion(s => s + 1);
  }

  function actualizarAmbiente(id: string, patch: Partial<AmbienteDeseado>) {
    setAmbientes(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
  }

  function eliminarAmbiente(id: string) {
    setAmbientes(prev => prev.filter(a => a.id !== id));
  }

  function togglePerfil(id: PerfilId) {
    setPerfilesActivos(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  }

  async function generar() {
    setError(null);
    setResultados(null);

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);

    let climaActual: DatosClima | null = null;
    if (!Number.isNaN(latN) && !Number.isNaN(lngN)) {
      setCargando(true);
      try {
        climaActual = await obtenerClima(latN, lngN);
        setClima(climaActual);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo obtener el clima del sitio.');
      } finally {
        setCargando(false);
      }
    }

    const programa = { m2CubiertosObjetivo: m2Objetivo, ambientes };
    const activos = perfilesActivos.length ? perfilesActivos : (['fiel-cliente'] as PerfilId[]);
    const generados = activos.map(p => generarAnteproyecto(p, programa, parametros, climaActual, { zonaSismica }));
    setResultados(generados);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-1 text-3xl">Anteproyectos · Arte y Tierra</h1>
      <p className="mb-8 text-ink-700">
        Cargá el programa de necesidades y el sitio, elegí los perfiles y generá 3 anteproyectos con planta, techos y
        fachada acotados. Las cotas salen del motor paramétrico, no de un generador de imágenes — por eso siempre
        cierran.
      </p>

      <PanelProyectos construirProyecto={construirProyecto} onCargar={cargarProyecto} nombreActual={nombreProyecto} />

      <PanelIngesta
        key={sesion}
        rutaInicial={carpeta}
        onCarpeta={setCarpeta}
        onPrograma={nuevos => setAmbientes(nuevos)}
        onCuaderno={c => {
          setCuaderno(c);
          if (!nombreProyecto) {
            const s1 = c.secciones.find(s => s.numero === 1);
            if (s1?.preguntas[0]) setNombreProyecto(s1.preguntas[0].respuesta.slice(0, 60));
          }
        }}
      />

      {cuaderno && (
        <details className="mb-8 rounded-lg border border-bone-200 bg-white/60 p-5">
          <summary className="cursor-pointer text-xl">Contexto del cuaderno ({cuaderno.secciones.length} secciones)</summary>
          <div className="mt-3 max-h-96 space-y-4 overflow-y-auto text-sm">
            {cuaderno.secciones.map(s => (
              <div key={s.numero}>
                <h3 className="font-display text-base">
                  {s.numero} · {s.titulo}
                </h3>
                {s.preguntas.map((p, i) => (
                  <p key={i} className="mt-1">
                    <span className="text-ink-700">{p.pregunta}</span>
                    <br />
                    <span className="text-ink-950">{p.respuesta}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </details>
      )}

      <section className="mb-8 grid gap-6 rounded-lg border border-bone-200 bg-white/60 p-5 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl">2 · Proyecto y sitio</h2>
          <label className="mb-2 block text-sm">
            Nombre del proyecto
            <input
              className="mt-1 w-full rounded border border-bone-200 px-2 py-1"
              value={nombreProyecto}
              onChange={e => setNombreProyecto(e.target.value)}
              placeholder="ej. José R. y Mdelmar — Aguas Buenas, PR"
            />
          </label>
          <div className="mt-2">
            <MapaSitio
              lat={lat}
              lng={lng}
              onCambiar={(nuevaLat, nuevaLng) => {
                setLat(nuevaLat);
                setLng(nuevaLng);
              }}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-sm">
              Latitud
              <input
                className="mt-1 w-full rounded border border-bone-200 px-2 py-1"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="18.2537"
              />
            </label>
            <label className="text-sm">
              Longitud
              <input
                className="mt-1 w-full rounded border border-bone-200 px-2 py-1"
                value={lng}
                onChange={e => setLng(e.target.value)}
                placeholder="-66.1057"
              />
            </label>
          </div>
          {clima?.koppen && (
            <p className="mt-2 text-sm text-moss-700">
              Köppen {clima.koppen.codigo} — {clima.koppen.descripcion} · viento dominante {clima.viento_dir_ppal}
            </p>
          )}
          <label className="mt-3 block text-sm">
            m² cubiertos objetivo
            <input
              type="number"
              className="mt-1 w-full rounded border border-bone-200 px-2 py-1"
              value={m2Objetivo}
              onChange={e => setM2Objetivo(Number(e.target.value))}
            />
          </label>
        </div>

        <div>
          <h2 className="mb-3 text-xl">Parámetros transversales</h2>
          <SelectCualitativo
            label="Nivel de autoconstrucción"
            value={parametros.nivelAutoconstruccion}
            onChange={v => setParametros(p => ({ ...p, nivelAutoconstruccion: v }))}
          />
          <SelectCualitativo
            label="Integración productiva (huerta, invernadero…)"
            value={parametros.pesoIntegracionProductiva}
            onChange={v => setParametros(p => ({ ...p, pesoIntegracionProductiva: v }))}
          />
          <label className="mb-2 mt-2 block text-sm">
            Grado de geometría sagrada
            <select
              className="mt-1 w-full rounded border border-bone-200 px-2 py-1"
              value={parametros.gradoGeometriaSagrada}
              onChange={e =>
                setParametros(p => ({ ...p, gradoGeometriaSagrada: e.target.value as ParametrosTransversales['gradoGeometriaSagrada'] }))
              }
            >
              <option value="sutil">Sutil</option>
              <option value="medio">Medio</option>
              <option value="marcado">Marcado</option>
            </select>
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={parametros.modularidadEtapas}
              onChange={e => setParametros(p => ({ ...p, modularidadEtapas: e.target.checked }))}
            />
            Modularidad / crecimiento por etapas
          </label>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={zonaSismica} onChange={e => setZonaSismica(e.target.checked)} />
            Zona sísmica (cambia la técnica de muro recomendada)
          </label>

          <h3 className="mb-2 mt-4 text-sm uppercase tracking-wide text-ink-700">Perfiles a generar</h3>
          <div className="space-y-1">
            {(Object.values(PERFILES)).map(p => (
              <label key={p.id} className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={perfilesActivos.includes(p.id)} onChange={() => togglePerfil(p.id)} className="mt-1" />
                <span>
                  <strong>{p.nombre}</strong> — <span className="text-ink-700">{p.resumen}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-bone-200 bg-white/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl">3 · Programa de necesidades</h2>
          <button
            className="rounded bg-moss-700 px-3 py-1.5 text-sm text-bone-50"
            onClick={() => setAmbientes(prev => [...prev, ambienteVacio()])}
          >
            + Agregar ambiente
          </button>
        </div>
        <div className="space-y-2">
          {ambientes.map(a => (
            <div key={a.id} className="grid grid-cols-12 items-center gap-2 rounded border border-bone-200 p-2 text-sm">
              <span className="col-span-1 font-mono text-xs text-ink-700">{a.id}</span>
              <select
                className="col-span-2 rounded border border-bone-200 px-1 py-1"
                value={a.tipo}
                onChange={e => actualizarAmbiente(a.id, { tipo: e.target.value as TipoAmbiente })}
              >
                {TIPOS_AMBIENTE.map(t => (
                  <option key={t} value={t}>
                    {NOMBRE_TIPO[t]}
                  </option>
                ))}
              </select>
              <input
                className="col-span-2 rounded border border-bone-200 px-1 py-1"
                placeholder="nombre (opcional)"
                value={a.nombre ?? ''}
                onChange={e => actualizarAmbiente(a.id, { nombre: e.target.value })}
              />
              <input
                type="number"
                min={1}
                className="col-span-1 rounded border border-bone-200 px-1 py-1"
                value={a.cantidad}
                onChange={e => actualizarAmbiente(a.id, { cantidad: Number(e.target.value) })}
              />
              <select
                className="col-span-2 rounded border border-bone-200 px-1 py-1"
                value={a.tamano ?? 'mediano'}
                onChange={e => actualizarAmbiente(a.id, { tamano: e.target.value as Tamano })}
              >
                {TAMANOS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="col-span-1 rounded border border-bone-200 px-1 py-1"
                placeholder="m² (opc.)"
                value={a.m2Aprox ?? ''}
                onChange={e => actualizarAmbiente(a.id, { m2Aprox: e.target.value ? Number(e.target.value) : undefined })}
              />
              <input
                className="col-span-2 rounded border border-bone-200 px-1 py-1"
                placeholder="cerca de (ids, coma)"
                value={(a.adyacenciasDeseadas ?? []).join(',')}
                onChange={e =>
                  actualizarAmbiente(a.id, {
                    adyacenciasDeseadas: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })
                }
              />
              <button className="col-span-1 text-danger-500" onClick={() => eliminarAmbiente(a.id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        className="mb-8 rounded bg-clay-500 px-5 py-2.5 text-white disabled:opacity-50"
        onClick={generar}
        disabled={cargando}
      >
        {cargando ? 'Consultando clima…' : 'Generar anteproyectos'}
      </button>

      {error && <p className="mb-4 text-danger-500">{error}</p>}

      {resultados && (
        <section className="space-y-6">
          {resultados.map(ap => (
            <VistaAnteproyecto key={ap.perfil} ap={ap} proyecto={nombreProyecto} />
          ))}
        </section>
      )}
    </main>
  );
}

function SelectCualitativo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: NivelCualitativo;
  onChange: (v: NivelCualitativo) => void;
}) {
  return (
    <label className="mb-2 block text-sm">
      {label}
      <select className="mt-1 w-full rounded border border-bone-200 px-2 py-1" value={value} onChange={e => onChange(e.target.value as NivelCualitativo)}>
        <option value="bajo">Bajo</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
      </select>
    </label>
  );
}
