'use client';

import { getSupabaseBrowserClient } from './db/browser';
import type { Mojon } from './types';
import { LIMITE_PROYECTOS, type Plan } from './entitlements';

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  mojones: Mojon[];
  metadatos: Record<string, unknown> | null;
  informe_token: string;
  informe_publico: boolean;
  created_at: string;
  updated_at: string;
}

// Acceso al schema 'terreno' sin tipo generado — cast a any necesario ya que
// apps/terreno no genera tipos DB propios (schema nuevo, no incluido en @arteytierra/types).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tabla = (): any =>
  (getSupabaseBrowserClient() as any).schema('terreno').from('proyectos');

function toProyecto(r: Record<string, unknown>): Proyecto {
  return {
    id:              String(r['id']              ?? ''),
    nombre:          String(r['nombre']          ?? ''),
    descripcion:     r['descripcion'] != null ? String(r['descripcion']) : null,
    mojones:         Array.isArray(r['mojones']) ? (r['mojones'] as Mojon[]) : [],
    metadatos:       r['metadatos'] != null ? (r['metadatos'] as Record<string, unknown>) : null,
    informe_token:   String(r['informe_token']   ?? ''),
    informe_publico: Boolean(r['informe_publico'] ?? false),
    created_at:      String(r['created_at']  ?? ''),
    updated_at:      String(r['updated_at']  ?? ''),
  };
}

export async function listarProyectos(): Promise<Proyecto[]> {
  const { data, error } = await tabla()
    .select('id, nombre, descripcion, mojones, metadatos, informe_token, informe_publico, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(toProyecto);
}

export async function guardarProyecto(
  nombre: string,
  descripcion: string,
  mojones: Mojon[],
  metadatos?: Record<string, unknown>,
  plan: Plan = 'estudio',
): Promise<Proyecto> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');

  // Tope de proyectos por plan (feedback inmediato; el trigger en DB es el que
  // enforcea de verdad). Semilla = 1 proyecto.
  const limite = LIMITE_PROYECTOS[plan];
  if (Number.isFinite(limite)) {
    const { count } = await tabla()
      .select('id', { count: 'exact', head: true });
    if ((count ?? 0) >= limite) {
      throw new Error(
        `El plan Semilla incluye ${limite} proyecto. Eliminá el actual o pasá a Diseñador para crear más.`,
      );
    }
  }

  const { data, error } = await tabla()
    .insert({ user_id: user.id, nombre, descripcion: descripcion || null, mojones, metadatos: metadatos ?? null })
    .select()
    .single();
  if (error) throw error;
  return toProyecto(data as Record<string, unknown>);
}

export async function actualizarProyecto(
  id: string,
  nombre: string,
  descripcion: string,
  mojones: Mojon[],
  metadatos?: Record<string, unknown>,
): Promise<void> {
  const { error } = await tabla()
    .update({ nombre, descripcion: descripcion || null, mojones, metadatos: metadatos ?? null })
    .eq('id', id);
  if (error) throw error;
}

export async function eliminarProyecto(id: string): Promise<void> {
  const { error } = await tabla().delete().eq('id', id);
  if (error) throw error;
}

/** Marca el proyecto como público y devuelve su informe_token para compartir. */
export async function publicarInforme(id: string): Promise<string> {
  const { data, error } = await tabla()
    .update({ informe_publico: true })
    .eq('id', id)
    .select('informe_token')
    .single();
  if (error) throw error;
  return String((data as Record<string, unknown>)['informe_token'] ?? '');
}
