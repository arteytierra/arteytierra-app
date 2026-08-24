/** Lectura y borrado de un proyecto guardado. */
import { borrarProyecto, leerProyecto } from '@/lib/proyectos/almacen';

export const runtime = 'nodejs';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Contexto) {
  const { id } = await params;
  const proyecto = await leerProyecto(id);
  if (!proyecto) return Response.json({ error: `No se encontró el proyecto "${id}".` }, { status: 404 });
  return Response.json({ proyecto });
}

export async function DELETE(_req: Request, { params }: Contexto) {
  const { id } = await params;
  const borrado = await borrarProyecto(id);
  if (!borrado) return Response.json({ error: `No se pudo borrar "${id}".` }, { status: 404 });
  return Response.json({ ok: true });
}
