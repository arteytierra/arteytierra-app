import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const revalidate = 1800; // 30 min

/**
 * Catalog feed para Facebook/Instagram Shop · formato CSV (RFC 4180).
 * Configurar en Commerce Manager → Catalog → Data feeds → URL programada.
 *
 * Doc: https://www.facebook.com/business/help/120325381656392
 */

function csvEscape(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data: products } = await admin
    .from('products')
    .select('id, slug, name, subtitle, description, base_price_cents, currency, type, stock, attributes')
    .eq('is_active', true)
    .in('type', ['ebook', 'physical', 'course', 'biocosmetic']);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
  ];

  const rows = (products ?? []).map((p) => {
    const price = `${(p.base_price_cents / 100).toFixed(2)} ${p.currency}`;
    const availability = p.type === 'physical' && p.stock !== null && p.stock <= 0 ? 'out of stock' : 'in stock';
    const slugPath =
      p.type === 'ebook' ? 'ebooks' :
      p.type === 'course' ? 'cursos' :
      p.type === 'biocosmetic' ? 'biocosmetica' : 'tienda';
    const attrs = (p.attributes as Record<string, unknown> | null) ?? {};
    const image = (attrs.cover_url as string) ?? `${site}/og/${p.slug}.png`;
    return [
      p.id,
      p.name,
      p.subtitle ?? p.description?.slice(0, 200) ?? p.name,
      availability,
      'new',
      price,
      `${site}/${slugPath}/${p.slug}`,
      image,
      'Arte y Tierra',
      '5605', // libros / educación
    ].map(csvEscape).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=900',
    },
  });
}
