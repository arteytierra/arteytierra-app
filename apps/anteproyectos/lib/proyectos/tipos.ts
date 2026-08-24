/**
 * Formato de proyecto guardado.
 *
 * Se guarda el ENUNCIADO del proyecto (programa, sitio, parámetros), no los
 * anteproyectos generados: el motor evoluciona, y un resultado congelado en
 * disco dejaría de coincidir con lo que la app dibuja hoy. Al abrir un
 * proyecto se regenera todo desde los mismos datos de entrada.
 *
 * Este módulo no toca el disco a propósito: lo importan tanto el cliente
 * (para armar y validar el objeto) como las rutas de API.
 */
import type { CuadernoLeido } from '../ingesta/cuaderno';
import type { AmbienteDeseado, ParametrosTransversales, PerfilId } from '../tipos';
import { PARAMETROS_TRANSVERSALES_DEFAULT } from '../tipos';

export const VERSION_PROYECTO = 1;

export interface ProyectoGuardado {
  version: number;
  id: string;
  nombre: string;
  /** ISO 8601. */
  guardadoEn: string;
  /** Carpeta de la que se leyó el cuaderno, si hubo ingesta. */
  carpeta?: string;
  lat: string;
  lng: string;
  m2Objetivo: number;
  ambientes: AmbienteDeseado[];
  parametros: ParametrosTransversales;
  perfilesActivos: PerfilId[];
  zonaSismica: boolean;
  cuaderno?: CuadernoLeido | null;
}

export interface ResumenProyecto {
  id: string;
  nombre: string;
  guardadoEn: string;
  ambientes: number;
  m2Objetivo: number;
}

/**
 * El id es además el nombre del archivo en disco, así que se restringe a un
 * juego de caracteres seguro: sin puntos, barras ni acentos no hay forma de
 * que un nombre de proyecto escriba fuera de la carpeta de datos.
 */
const RE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function esIdValido(id: string): boolean {
  return RE_ID.test(id);
}

export function idDesdeNombre(nombre: string): string {
  const base = nombre
    .normalize('NFD')
    // Rango U+0300–U+036F: las marcas de acento que el NFD separó de su letra.
    // Se ven vacías en el editor porque son combinantes, pero ahí están.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return esIdValido(base) ? base : `proyecto-${Date.now().toString(36)}`;
}

const PERFILES_VALIDOS: PerfilId[] = ['fiel-cliente', 'organico', 'bioclimatico', 'autoconstruccion'];

/**
 * Normaliza lo que venga del disco o de la red. Los archivos son JSON en una
 * carpeta local que Jonatan puede abrir y editar a mano; conviene que un
 * archivo a medias no rompa la app entera.
 */
export function normalizarProyecto(bruto: unknown): ProyectoGuardado | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const p = bruto as Record<string, unknown>;
  const nombre = typeof p.nombre === 'string' && p.nombre.trim() ? p.nombre.trim() : null;
  if (!nombre) return null;

  const id = typeof p.id === 'string' && esIdValido(p.id) ? p.id : idDesdeNombre(nombre);
  const ambientes = Array.isArray(p.ambientes)
    ? (p.ambientes.filter(a => a && typeof a === 'object' && typeof (a as AmbienteDeseado).id === 'string') as AmbienteDeseado[])
    : [];
  const perfiles = Array.isArray(p.perfilesActivos)
    ? (p.perfilesActivos.filter(x => PERFILES_VALIDOS.includes(x as PerfilId)) as PerfilId[])
    : [];

  return {
    version: typeof p.version === 'number' ? p.version : VERSION_PROYECTO,
    id,
    nombre,
    guardadoEn: typeof p.guardadoEn === 'string' ? p.guardadoEn : new Date().toISOString(),
    carpeta: typeof p.carpeta === 'string' ? p.carpeta : undefined,
    lat: typeof p.lat === 'string' ? p.lat : '',
    lng: typeof p.lng === 'string' ? p.lng : '',
    m2Objetivo: typeof p.m2Objetivo === 'number' && Number.isFinite(p.m2Objetivo) ? p.m2Objetivo : 90,
    ambientes,
    parametros: { ...PARAMETROS_TRANSVERSALES_DEFAULT, ...(typeof p.parametros === 'object' && p.parametros ? p.parametros : {}) },
    perfilesActivos: perfiles.length ? perfiles : ['fiel-cliente', 'organico', 'bioclimatico'],
    zonaSismica: p.zonaSismica === true,
    cuaderno: (p.cuaderno as CuadernoLeido | undefined) ?? null,
  };
}

export function resumirProyecto(p: ProyectoGuardado): ResumenProyecto {
  return {
    id: p.id,
    nombre: p.nombre,
    guardadoEn: p.guardadoEn,
    ambientes: p.ambientes.reduce((s, a) => s + (a.cantidad || 1), 0),
    m2Objetivo: p.m2Objetivo,
  };
}
