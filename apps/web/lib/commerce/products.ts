import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getLocale } from '@/lib/i18n';
import { localizeRow, localizeRows } from '@/lib/i18n/localize';
import { getBuyerCurrency } from './geo';
import { overlayDisplayPrices } from './pricing';

const PRODUCT_I18N_FIELDS = ['name', 'subtitle', 'description_mdx'] as const;

export interface ProductRow {
  id: string;
  type: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description_mdx: string | null;
  gallery: unknown;
  base_price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  attributes: Record<string, unknown> | null;
  seo: Record<string, unknown> | null;
  tags: string[] | null;
  category: string | null;
  stock: number | null;
  is_active: boolean;
}

export async function listProducts(filters: {
  type?: string;
  category?: string;
  search?: string;
  limit?: number;
}): Promise<ProductRow[]> {
  // Catálogo público: leemos con service-role (filtrado a is_active) para evitar
  // que la RLS `products public` evalúe app.is_staff() como anónimo (que no tiene
  // grant sobre app.profiles y rompería el listado). Mismo patrón que getCourseWithCurriculum.
  const supabase = createSupabaseAdminClient();
  let q = supabase.schema('shop').from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.type) q = q.eq('type', filters.type as never);
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.search) q = q.ilike('name', `%${filters.search}%`);

  const { data } = await q;
  const rows = (data ?? []) as ProductRow[];
  const locale = await getLocale();
  const localized = localizeRows(rows as never as Array<Record<string, unknown>>, locale, [...PRODUCT_I18N_FIELDS]) as never as ProductRow[];
  const target = await getBuyerCurrency();
  return overlayDisplayPrices(localized, target);
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .schema('shop').from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) return null;
  const locale = await getLocale();
  const localized = localizeRow(data as never as Record<string, unknown>, locale, [...PRODUCT_I18N_FIELDS]) as never as ProductRow;
  const target = await getBuyerCurrency();
  const [overlaid] = await overlayDisplayPrices([localized], target);
  return overlaid ?? localized;
}

export interface CourseWithCurriculum extends ProductRow {
  courses?: Array<{
    level: string | null;
    duration_hours: number | null;
    is_live: boolean;
    is_recorded: boolean;
    capacity: number | null;
    starts_at: string | null;
    modules?: Array<{
      id: string;
      position: number;
      title: string;
      summary: string | null;
      lessons?: Array<{
        id: string;
        position: number;
        title: string;
        kind: string;
        duration_sec: number | null;
        is_free_preview: boolean;
      }>;
    }>;
  }>;
}

export async function getCourseWithCurriculum(slug: string): Promise<CourseWithCurriculum | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('products')
    .select(`
      *,
      courses(*,
        modules(id, position, title, summary,
          lessons(id, position, title, kind, duration_sec, is_free_preview)))
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) return null;
  const locale = await getLocale();
  return localizeRow(data as never as Record<string, unknown>, locale, [...PRODUCT_I18N_FIELDS]) as never as CourseWithCurriculum;
}

/*
 * Acá vivía `getCoursesForLanding()`, que armaba el listado de `/cursos` con
 * `shop.products` y su columna `landing_meta`. Se borró el 21/11/2026 por dos
 * razones, y la segunda es la que importa:
 *
 *  1. **Nunca funcionó.** Pedía `courses(is_live, is_recorded)` desde el
 *     esquema `shop`, y `courses` vive en `edu`: PostgREST no resuelve un
 *     recurso embebido de otro esquema, así que devolvía PGRST200 en cada
 *     carga de la página y el listado caía siempre en su catálogo estático.
 *     No faltaba ninguna foreign key —`edu.courses.product_id` referencia
 *     `shop.products(id)` desde la 0001— y las vistas pass-through que lo
 *     taparían ya se probaron y se revirtieron (migraciones 0033 y 0034).
 *  2. **Arreglarla habría empeorado la página.** La base tiene diez de los
 *     trece cursos que el sitio publica —le faltan la Formación Integral, el
 *     Intensivo y el Voluntariado— y su copia de los precios quedó atrás. El
 *     «fallback» era el catálogo bueno.
 *
 * El listado lee ahora `lib/courses/data.ts`, igual que las fichas, los
 * formularios de inscripción, el chatbot y los tests. `landing_meta` sigue en
 * la base sin consumidor: si alguna vez la base pasa a ser la fuente del
 * listado, hay que cargar los tres cursos que faltan, refrescar los precios y
 * resolver el embed con dos consultas en vez de una.
 *
 * El resto de las consultas que cruzan de esquema están contadas en
 * `tests/unit/consultas-cruzadas.test.ts`.
 */

export function getProductCover(product: { gallery: unknown }): string | undefined {
  const arr = (Array.isArray(product.gallery) ? product.gallery : []) as Array<{ url?: string } | string>;
  for (const item of arr) {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && 'url' in item) return item.url as string;
  }
  return undefined;
}
