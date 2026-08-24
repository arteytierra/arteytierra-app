/**
 * Almacén de proyectos en disco. Sólo servidor: importa `node:fs`.
 *
 * Un archivo JSON por proyecto en una carpeta local, no una base de datos.
 * La app es una herramienta de escritorio para el estudio: así los proyectos
 * se copian, se versionan con git, se mandan por mail y se abren con cualquier
 * editor sin depender de que un servicio esté levantado.
 */
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { esIdValido, normalizarProyecto, type ProyectoGuardado } from './tipos';

/** Carpeta de datos. Configurable para no atarla a la máquina de Jonatan. */
export const DIR_PROYECTOS = resolve(
  process.env.ANTEPROYECTOS_DATOS ?? join(process.env.ANTEPROYECTOS_RAIZ ?? 'C:/Arte y Tierra', '_anteproyectos'),
);

/**
 * Ruta del archivo de un proyecto. Devuelve null si el id no es válido: el id
 * viaja en la URL y sin esta comprobación un `../` escribiría fuera de la
 * carpeta de datos.
 */
export function rutaDe(id: string): string | null {
  if (!esIdValido(id)) return null;
  return join(DIR_PROYECTOS, `${id}.json`);
}

async function asegurarDir(): Promise<void> {
  await mkdir(DIR_PROYECTOS, { recursive: true });
}

export async function listarProyectos(): Promise<ProyectoGuardado[]> {
  await asegurarDir();
  const entradas = await readdir(DIR_PROYECTOS);
  const proyectos: ProyectoGuardado[] = [];
  for (const nombre of entradas) {
    if (!nombre.endsWith('.json')) continue;
    try {
      const bruto = JSON.parse(await readFile(join(DIR_PROYECTOS, nombre), 'utf8'));
      const p = normalizarProyecto(bruto);
      if (p) proyectos.push(p);
    } catch {
      // Un archivo corrupto o a medio escribir no puede tumbar el listado
      // entero: se omite y los demás proyectos siguen abriéndose.
    }
  }
  return proyectos.sort((a, b) => b.guardadoEn.localeCompare(a.guardadoEn));
}

export async function leerProyecto(id: string): Promise<ProyectoGuardado | null> {
  const ruta = rutaDe(id);
  if (!ruta) return null;
  try {
    return normalizarProyecto(JSON.parse(await readFile(ruta, 'utf8')));
  } catch {
    return null;
  }
}

export async function guardarProyecto(p: ProyectoGuardado): Promise<ProyectoGuardado> {
  const ruta = rutaDe(p.id);
  if (!ruta) throw new Error(`Id de proyecto inválido: ${p.id}`);
  await asegurarDir();
  const aGuardar = { ...p, guardadoEn: new Date().toISOString() };
  await writeFile(ruta, JSON.stringify(aGuardar, null, 2), 'utf8');
  return aGuardar;
}

export async function borrarProyecto(id: string): Promise<boolean> {
  const ruta = rutaDe(id);
  if (!ruta) return false;
  try {
    await unlink(ruta);
    return true;
  } catch {
    return false;
  }
}
