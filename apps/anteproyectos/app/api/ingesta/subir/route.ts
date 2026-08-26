/**
 * Ingesta por subida real (Fase A4) — complemento de `app/api/ingesta/route.ts`
 * (que lee una carpeta del disco del servidor, pensado para el uso de
 * estudio de Jonatan). Esta ruta es la que necesita "cualquier persona" del
 * objetivo final del plan: sube los archivos desde el navegador, se
 * clasifican igual (`clasificarArchivo`) y se guardan en Supabase Storage
 * bajo `${userId}/${carpetaId}/`, privados por usuario.
 */
import mammoth from 'mammoth';
import { adminClient } from '@/lib/db/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { clasificarArchivo, resumirCarpeta, type ArchivoClasificado } from '@/lib/ingesta/carpeta';
import { leerCuaderno } from '@/lib/ingesta/cuaderno';
import { filasAPrograma } from '@/lib/ingesta/mapeo';

export const runtime = 'nodejs';

const BUCKET = 'anteproyectos-ingesta';
const HDRS = { 'Content-Type': 'application/json' };

function extensionDe(nombre: string): string {
  const i = nombre.lastIndexOf('.');
  return i === -1 ? '' : nombre.slice(i).toLowerCase();
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Necesitás iniciar sesión para subir archivos.' }, { status: 401, headers: HDRS });

  const form = await req.formData();
  const carpetaId = String(form.get('carpetaId') ?? '').trim();
  if (!/^[a-z0-9-]{1,80}$/.test(carpetaId)) {
    return Response.json({ error: 'Falta o es inválido el identificador de carpeta.' }, { status: 400, headers: HDRS });
  }

  const archivosSubidos = form.getAll('archivos').filter((f): f is File => f instanceof File);
  if (archivosSubidos.length === 0) {
    return Response.json({ error: 'No se recibió ningún archivo.' }, { status: 400, headers: HDRS });
  }

  const admin = adminClient();
  const prefijo = `${user.id}/${carpetaId}`;
  const ruta = `supabase:${prefijo}`;

  const archivos: ArchivoClasificado[] = [];
  let cuadernoBuffer: Buffer | null = null;

  for (const archivo of archivosSubidos) {
    const extension = extensionDe(archivo.name);
    const rol = clasificarArchivo(archivo.name, extension);
    const bytes = Buffer.from(await archivo.arrayBuffer());
    const clave = `${prefijo}/${archivo.name}`;

    const { error } = await admin.storage.from(BUCKET).upload(clave, bytes, {
      contentType: archivo.type || 'application/octet-stream',
      upsert: true,
    });
    if (error) {
      return Response.json({ error: `No se pudo subir "${archivo.name}": ${error.message}` }, { status: 502, headers: HDRS });
    }

    archivos.push({ nombre: archivo.name, ruta: clave, rol, extension, bytes: bytes.byteLength });
    if (rol === 'cuaderno' && extension === '.docx') cuadernoBuffer = bytes;
  }

  const resumen = resumirCarpeta(ruta, archivos);

  let cuaderno = null;
  let programaSugerido = null;
  if (cuadernoBuffer) {
    try {
      const [texto, html] = await Promise.all([
        mammoth.extractRawText({ buffer: cuadernoBuffer }),
        mammoth.convertToHtml({ buffer: cuadernoBuffer }),
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
