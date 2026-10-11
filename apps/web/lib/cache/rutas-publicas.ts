import { revalidatePath } from 'next/cache';

/**
 * De que carpeta publica cuelga cada tipo de producto. Es el mismo mapa que usa
 * el sitemap, importado de aca para que haya uno solo: si las dos copias dicen
 * cosas distintas, una pagina se queda vieja o fuera del indice y no se nota.
 */
export const RUTA_POR_TIPO: Record<string, string> = {
  course: 'cursos',
  ebook: 'ebooks',
  biocosmetic: 'biocosmetica',
  lodging: 'hospedaje',
  consult: 'asesorias',
  immersion: 'inmersion-viva',
};

/** Indices que ademas existen traducidos y tambien leen de la base. */
const INDICES_TRADUCIDOS = new Set(['ebooks', 'biocosmetica', 'blog']);

function conTraducciones(base: string): string[] {
  const rutas = [`/${base}`];
  if (INDICES_TRADUCIDOS.has(base)) rutas.push(`/en/${base}`, `/fr/${base}`);
  return rutas;
}

export function rutasPublicasDeProducto(tipo: string, slug?: string | null): string[] {
  const base = RUTA_POR_TIPO[tipo];
  if (!base) return [];
  const rutas = conTraducciones(base);
  if (slug) rutas.push(`/${base}/${slug}`);
  return rutas;
}

/**
 * Marca vencida la pagina publica de un producto apenas se lo edita desde el
 * panel. Sin esto, el unico modo de que un cambio se vea es esperar a que venza
 * la ventana de revalidacion, y por eso esa ventana tenia que ser corta: cada
 * pagina se re-renderizaba sola todo el dia por las dudas. Avisando al guardar,
 * la ventana puede ser larga sin que nadie vea un precio viejo.
 */
export function revalidarProducto(tipo: string, slug?: string | null): void {
  for (const ruta of rutasPublicasDeProducto(tipo, slug)) revalidatePath(ruta);
}

export function revalidarPost(slug?: string | null): void {
  for (const ruta of conTraducciones('blog')) revalidatePath(ruta);
  if (slug) revalidatePath(`/blog/${slug}`);
}
