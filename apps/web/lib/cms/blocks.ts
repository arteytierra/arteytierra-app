import { z } from 'zod';

/**
 * CMS Headless por bloques · Arte y Tierra
 *
 * Cada documento (página, post, landing) es un array de bloques tipados.
 * Persistencia: tabla `cms.posts` / `cms.pages` con columna jsonb `blocks`.
 *
 * Reglas:
 *   - Cada bloque tiene `id` estable (para drag&drop) y `type`.
 *   - El editor sólo conoce el schema declarado acá.
 *   - El renderer público mapea type → componente; cualquier type desconocido se silencia.
 */

export const blockTypes = [
  'heading',
  'paragraph',
  'image',
  'quote',
  'gallery',
  'cta',
  'video',
  'faq',
  'product',
  'embed',
  'divider',
] as const;
export type BlockType = (typeof blockTypes)[number];

export const blockSchemas = {
  heading: z.object({
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(2),
    text: z.string().default(''),
    eyebrow: z.string().optional(),
  }),
  paragraph: z.object({
    text: z.string().default(''),
    lead: z.boolean().optional(),
  }),
  image: z.object({
    src: z.string().url(),
    alt: z.string().default(''),
    caption: z.string().optional(),
    aspect: z.enum(['16/9', '4/3', '1/1', '3/4']).default('16/9'),
  }),
  quote: z.object({
    text: z.string(),
    author: z.string().optional(),
  }),
  gallery: z.object({
    images: z.array(z.object({ src: z.string().url(), alt: z.string().default('') })).min(2).max(12),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  }),
  cta: z.object({
    title: z.string(),
    body: z.string().optional(),
    href: z.string(),
    label: z.string().default('Saber más'),
    variant: z.enum(['clay', 'moss', 'ink']).default('clay'),
  }),
  video: z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  }),
  faq: z.object({
    items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
  }),
  product: z.object({
    slug: z.string(),
  }),
  embed: z.object({
    html: z.string(), // sanitizado server-side antes de render
  }),
  divider: z.object({}).default({}),
} as const;

export type BlockOf<T extends BlockType> = {
  id: string;
  type: T;
  data: z.infer<(typeof blockSchemas)[T]>;
};
export type AnyBlock = { [K in BlockType]: BlockOf<K> }[BlockType];

/** Schema del documento entero (lo que se guarda en jsonb). */
export const documentSchema = z.array(
  z.object({
    id: z.string().min(1),
    type: z.enum(blockTypes),
    data: z.record(z.unknown()),
  }),
);
export type CmsDocument = z.infer<typeof documentSchema>;

/** Valida y normaliza cada bloque contra su schema. Descarta los inválidos. */
export function parseDocument(raw: unknown): AnyBlock[] {
  const arr = documentSchema.safeParse(raw);
  if (!arr.success) return [];
  const out: AnyBlock[] = [];
  for (const b of arr.data) {
    const schema = blockSchemas[b.type as BlockType];
    if (!schema) continue;
    const parsed = schema.safeParse(b.data);
    if (!parsed.success) continue;
    out.push({ id: b.id, type: b.type, data: parsed.data } as AnyBlock);
  }
  return out;
}

/** Plantilla vacía con los defaults para un bloque nuevo. */
export function emptyBlock<T extends BlockType>(type: T): BlockOf<T> {
  const defaults: Record<BlockType, unknown> = {
    heading: { level: 2, text: 'Nuevo título' },
    paragraph: { text: 'Escribí algo acá…' },
    image: { src: 'https://placehold.co/1200x675', alt: '', aspect: '16/9' },
    quote: { text: 'Una cita memorable.', author: '' },
    gallery: { images: [{ src: 'https://placehold.co/600', alt: '' }, { src: 'https://placehold.co/600', alt: '' }], columns: 3 },
    cta: { title: 'Llamado a la acción', href: '#', label: 'Ver más', variant: 'clay' },
    video: { url: 'https://www.youtube.com/watch?v=...' },
    faq: { items: [{ q: '¿Pregunta?', a: 'Respuesta.' }] },
    product: { slug: '' },
    embed: { html: '<!-- embed -->' },
    divider: {},
  };
  const id = `b_${Math.random().toString(36).slice(2, 10)}`;
  return { id, type, data: defaults[type] } as BlockOf<T>;
}

export const blockLabels: Record<BlockType, string> = {
  heading: 'Título',
  paragraph: 'Párrafo',
  image: 'Imagen',
  quote: 'Cita',
  gallery: 'Galería',
  cta: 'Llamado a acción',
  video: 'Video',
  faq: 'FAQ',
  product: 'Producto',
  embed: 'Embed HTML',
  divider: 'Divisor',
};
