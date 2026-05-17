import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const revalidate = 1800;

/**
 * Google Merchant Center feed · RSS 2.0 con namespace `g:`.
 * Configurar en Merchant Center → Feeds → Scheduled fetches.
 */

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data: products } = await admin
    .from('products')
    .select('id, slug, name, subtitle, description, base_price_cents, currency, type, stock, attributes')
    .eq('is_active', true);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';
  const now = new Date().toUTCString();

  const items = (products ?? []).map((p) => {
    const price = `${(p.base_price_cents / 100).toFixed(2)} ${p.currency}`;
    const availability = p.type === 'physical' && p.stock !== null && p.stock <= 0 ? 'out_of_stock' : 'in_stock';
    const slugPath =
      p.type === 'ebook' ? 'ebooks' :
      p.type === 'course' ? 'cursos' :
      p.type === 'biocosmetic' ? 'biocosmetica' :
      p.type === 'lodging' ? 'hospedaje' :
      p.type === 'immersion' ? 'inmersion-viva' :
      p.type === 'consult' ? 'asesorias' : 'tienda';
    const attrs = (p.attributes as Record<string, unknown> | null) ?? {};
    const image = (attrs.cover_url as string) ?? `${site}/og/${p.slug}.png`;

    return `
    <item>
      <g:id>${xmlEscape(p.id)}</g:id>
      <g:title>${xmlEscape(p.name)}</g:title>
      <g:description>${xmlEscape(p.description ?? p.subtitle ?? p.name)}</g:description>
      <g:link>${site}/${slugPath}/${xmlEscape(p.slug)}</g:link>
      <g:image_link>${xmlEscape(image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>Arte y Tierra</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Arte y Tierra · Catálogo</title>
    <link>${site}</link>
    <description>Cursos, ebooks, hospedaje, biocosmética y asesorías regenerativas.</description>
    <lastBuildDate>${now}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=900',
    },
  });
}
