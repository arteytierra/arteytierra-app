/**
 * Almacén de proyectos en Postgres (Supabase, schema `anteproyectos`).
 * Sólo servidor: lee la sesión de las cookies de la request.
 *
 * Hasta la Fase A3 esto era un archivo JSON por proyecto en una carpeta
 * local — ver PLAN-DOS-PISTAS.md. Ahora cada proyecto es una fila de
 * `anteproyectos.proyectos`, con RLS filtrando por `user_id = auth.uid()`:
 * un usuario nunca ve ni puede tocar los proyectos de otro.
 */
import { createSupabaseServerClient } from '@/lib/db/server';
import { getCurrentUser } from '@/lib/auth/session';
import { esIdValido, normalizarProyecto, type ProyectoGuardado } from './tipos';

interface FilaProyecto {
  datos: unknown;
}

async function usuarioActual() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Necesitás iniciar sesión para guardar o abrir proyectos.');
  return user;
}

export async function listarProyectos(): Promise<ProyectoGuardado[]> {
  const user = await usuarioActual();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .schema('anteproyectos')
    .from('proyectos')
    .select('datos')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);

  const proyectos: ProyectoGuardado[] = [];
  for (const fila of (data ?? []) as FilaProyecto[]) {
    const p = normalizarProyecto(fila.datos);
    if (p) proyectos.push(p);
  }
  return proyectos;
}

export async function leerProyecto(id: string): Promise<ProyectoGuardado | null> {
  if (!esIdValido(id)) return null;
  const user = await usuarioActual();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .schema('anteproyectos')
    .from('proyectos')
    .select('datos')
    .eq('user_id', user.id)
    .eq('id', id)
    .maybeSingle<FilaProyecto>();
  if (!data) return null;
  return normalizarProyecto(data.datos);
}

export async function guardarProyecto(p: ProyectoGuardado): Promise<ProyectoGuardado> {
  if (!esIdValido(p.id)) throw new Error(`Id de proyecto inválido: ${p.id}`);
  const user = await usuarioActual();
  const supabase = await createSupabaseServerClient();

  const aGuardar: ProyectoGuardado = { ...p, guardadoEn: new Date().toISOString() };
  const { error } = await supabase
    .schema('anteproyectos')
    .from('proyectos')
    .upsert(
      { id: p.id, user_id: user.id, nombre: p.nombre, datos: aGuardar },
      { onConflict: 'user_id,id' },
    );
  if (error) throw new Error(error.message);
  return aGuardar;
}

export async function borrarProyecto(id: string): Promise<boolean> {
  if (!esIdValido(id)) return false;
  const user = await usuarioActual();
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase
    .schema('anteproyectos')
    .from('proyectos')
    .delete({ count: 'exact' })
    .eq('user_id', user.id)
    .eq('id', id);
  if (error) return false;
  return (count ?? 0) > 0;
}
