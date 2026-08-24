/**
 * Listado y alta de proyectos guardados.
 * Node, no Edge: escribe archivos en el disco del estudio.
 */
import { DIR_PROYECTOS, guardarProyecto, listarProyectos } from '@/lib/proyectos/almacen';
import { idDesdeNombre, normalizarProyecto, resumirProyecto, VERSION_PROYECTO } from '@/lib/proyectos/tipos';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const proyectos = await listarProyectos();
    return Response.json({ carpeta: DIR_PROYECTOS, proyectos: proyectos.map(resumirProyecto) });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'No se pudo listar los proyectos.' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return Response.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  const proyecto = normalizarProyecto(cuerpo);
  if (!proyecto) {
    return Response.json({ error: 'Falta el nombre del proyecto.' }, { status: 400 });
  }

  // Guardar de nuevo con el mismo nombre pisa el proyecto anterior: es el
  // comportamiento esperado al ir ajustando el programa de una misma familia.
  const id = proyecto.id || idDesdeNombre(proyecto.nombre);
  try {
    const guardado = await guardarProyecto({ ...proyecto, id, version: VERSION_PROYECTO });
    return Response.json({ proyecto: resumirProyecto(guardado) });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'No se pudo guardar el proyecto.' },
      { status: 500 },
    );
  }
}
