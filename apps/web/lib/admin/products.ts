'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

const productType = z.enum(['course', 'ebook', 'physical', 'service', 'lodging', 'immersion', 'consult', 'biocosmetic']);

const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido (solo a-z 0-9 -)'),
  name: z.string().min(2).max(160),
  subtitle: z.string().max(300).optional(),
  description_mdx: z.string().optional(),
  type: productType,
  base_price_cents: z.coerce.number().int().nonnegative(),
  compare_at_cents: z.coerce.number().int().nonnegative().optional().nullable(),
  currency: z.enum(['ARS', 'USD']),
  stock: z.coerce.number().int().nonnegative().optional().nullable(),
  is_active: z.boolean().default(true),
  category: z.string().optional().nullable(),
  attributes: z.record(z.unknown()).default({}),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function listProductsAdmin(opts?: { type?: string; q?: string }) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  let q = admin
    .schema('shop').from('products')
    .select('id, slug, name, type, base_price_cents, currency, stock, is_active, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200);
  if (opts?.type) q = q.eq('type', opts.type as never);
  if (opts?.q) q = q.ilike('name', `%${opts.q}%`);
  const { data } = await q;
  return data ?? [];
}

export async function getProductAdmin(id: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data } = await admin.schema('shop').from('products').select('*').eq('id', id).single();
  return data;
}

export async function upsertProduct(id: string | null, input: ProductInput) {
  await requireStaff();
  const parsed = productSchema.parse(input);
  const admin = createSupabaseAdminClient();

  // Slug único
  const { data: clash } = await admin
    .schema('shop').from('products')
    .select('id')
    .eq('slug', parsed.slug)
    .maybeSingle();
  if (clash && clash.id !== id) {
    throw new Error('Ese slug ya existe.');
  }

  if (id) {
    const { error } = await admin.schema('shop').from('products').update(parsed as never).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/productos/${id}`);
  } else {
    const { data, error } = await admin.schema('shop').from('products').insert(parsed as never).select('id').single();
    if (error) throw new Error(error.message);
    revalidatePath('/admin/productos');
    return { id: data.id };
  }

  revalidatePath('/admin/productos');
  return { id };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('products').update({ is_active: isActive }).eq('id', id);
  revalidatePath('/admin/productos');
}

export async function deleteProduct(id: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  // Soft-delete: marcar inactivo. Hard-delete sólo si nunca se vendió.
  const { count } = await admin
    .schema('shop').from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);
  if ((count ?? 0) > 0) {
    await admin.schema('shop').from('products').update({ is_active: false }).eq('id', id);
    return { soft: true };
  }
  await admin.schema('shop').from('products').delete().eq('id', id);
  revalidatePath('/admin/productos');
  return { soft: false };
}
