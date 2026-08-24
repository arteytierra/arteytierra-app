/**
 * Clasificación de los archivos que la familia sube a la carpeta del proyecto.
 *
 * El cuaderno llega junto a fotos del terreno, videos del recorrido, el dibujo
 * a mano de la casa y PDFs complementarios. Cada tipo cumple un rol distinto
 * en el diseño, así que se clasifican por extensión y por nombre: el dibujo a
 * mano alimenta el Perfil 1 (fiel al cliente) y las fotos del sitio son la
 * referencia visual del análisis del terreno.
 */

export type RolArchivo = 'cuaderno' | 'dibujo-cliente' | 'foto-sitio' | 'video-sitio' | 'documento' | 'moodboard' | 'otro';

export interface ArchivoClasificado {
  nombre: string;
  ruta: string;
  rol: RolArchivo;
  extension: string;
  bytes: number;
}

const EXT_IMAGEN = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif', '.bmp']);
const EXT_VIDEO = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm']);
const EXT_DOC = new Set(['.pdf', '.docx', '.doc', '.odt', '.txt', '.md']);

const NORMALIZAR = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function clasificarArchivo(nombre: string, extension: string): RolArchivo {
  const n = NORMALIZAR(nombre);
  const ext = extension.toLowerCase();

  // El cuaderno completado tiene prioridad sobre cualquier otra regla: es el
  // documento que estructura todo el proceso.
  if (/cuaderno/.test(n) && EXT_DOC.has(ext)) {
    // El modelo en blanco no sirve como fuente de respuestas.
    return /modelo|plantilla|template|editable/.test(n) ? 'documento' : 'cuaderno';
  }

  if (EXT_IMAGEN.has(ext)) {
    if (/dibujo|plano|croquis|boceto|distribucion|sketch/.test(n)) return 'dibujo-cliente';
    if (/moodboard|referencia|inspiracion/.test(n)) return 'moodboard';
    return 'foto-sitio';
  }

  if (EXT_VIDEO.has(ext)) return 'video-sitio';

  if (EXT_DOC.has(ext)) {
    if (/dibujo|plano|croquis|casa.*sonada|sonada.*casa/.test(n)) return 'dibujo-cliente';
    return 'documento';
  }

  return 'otro';
}

export interface ResumenCarpeta {
  ruta: string;
  archivos: ArchivoClasificado[];
  /** Ruta del cuaderno completado, si se encontró uno. */
  cuaderno?: string;
  conteoPorRol: Record<RolArchivo, number>;
}

export function resumirCarpeta(ruta: string, archivos: ArchivoClasificado[]): ResumenCarpeta {
  const conteoPorRol = archivos.reduce(
    (acc, a) => {
      acc[a.rol] = (acc[a.rol] ?? 0) + 1;
      return acc;
    },
    {} as Record<RolArchivo, number>,
  );

  return {
    ruta,
    archivos,
    cuaderno: archivos.find(a => a.rol === 'cuaderno')?.ruta,
    conteoPorRol,
  };
}
