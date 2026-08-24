/**
 * Ingesta de la carpeta de un proyecto: clasifica los archivos que subió la
 * familia y, si encuentra el Cuaderno de Diseño Participativo completado,
 * extrae sus secciones y la tabla del programa de necesidades.
 *
 * Corre en Node (no Edge) porque necesita leer del disco local: esta app es
 * una herramienta de escritorio para el estudio, no un servicio público.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import mammoth from 'mammoth';
import { clasificarArchivo, resumirCarpeta, type ArchivoClasificado } from '@/lib/ingesta/carpeta';
import { leerCuaderno } from '@/lib/ingesta/cuaderno';
import { filasAPrograma } from '@/lib/ingesta/mapeo';

export const runtime = 'nodejs';

const HDRS = { 'Content-Type': 'application/json' };

/**
 * Raíz permitida para la lectura. Evita que una ruta arbitraria en el query
 * string convierta este endpoint en un lector de todo el disco.
 * Configurable con ANTEPROYECTOS_RAIZ para otros equipos.
 */
const RAIZ_PERMITIDA = resolve(process.env.ANTEPROYECTOS_RAIZ ?? 'C:/Arte y Tierra');

function dentroDeRaiz(ruta: string): boolean {
  const r = resolve(ruta);
  return r === RAIZ_PERMITIDA || r.startsWith(RAIZ_PERMITIDA + '\\') || r.startsWith(RAIZ_PERMITIDA + '/');
}

export async function GET(req: Request) {
  const ruta = new URL(req.url).searchParams.get('ruta');
  if (!ruta) return Response.json({ error: 'Falta el parámetro "ruta".' }, { status: 400 });

  if (!dentroDeRaiz(ruta)) {
    return Response.json(
      { error: `Por seguridad sólo se leen carpetas dentro de ${RAIZ_PERMITIDA}.` },
      { status: 403, headers: HDRS },
    );
  }

  let entradas: string[];
  try {
    entradas = await readdir(ruta);
  } catch {
    return Response.json({ error: `No se pudo leer la carpeta: ${ruta}` }, { status: 404, headers: HDRS });
  }

  const archivos: ArchivoClasificado[] = [];
  for (const nombre of entradas) {
    const completa = join(ruta, nombre);
    let info;
    try {
      info = await stat(completa);
    } catch {
      continue; // archivo que desapareció o sin permisos: se omite
    }
    if (!info.isFile()) continue;
    const extension = extname(nombre).toLowerCase();
    archivos.push({
      nombre,
      ruta: completa,
      rol: clasificarArchivo(nombre, extension),
      extension,
      bytes: info.size,
    });
  }

  const resumen = resumirCarpeta(ruta, archivos);

  // Si hay cuaderno .docx, se lee y se propone el programa de necesidades.
  let cuaderno = null;
  let programaSugerido = null;
  if (resumen.cuaderno && resumen.cuaderno.toLowerCase().endsWith('.docx')) {
    try {
      const buffer = await readFile(resumen.cuaderno);
      const [texto, html] = await Promise.all([
        mammoth.extractRawText({ buffer }),
        mammoth.convertToHtml({ buffer }),
      ]);
      const leido = leerCuaderno(texto.value, html.value);
      cuaderno = leido;
      programaSugerido = filasAPrograma(leido.programa);
    } catch (e) {
      return Response.json(
        { ...resumen, errorCuaderno: e instanceof Error ? e.message : 'No se pudo leer el cuaderno.' },
        { headers: HDRS },
      );
    }
  }

  return Response.json({ ...resumen, cuaderno, programaSugerido }, { headers: HDRS });
}
