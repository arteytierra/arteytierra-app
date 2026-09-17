'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { revalidarPost } from '@/lib/cache/rutas-publicas';
import { documentSchema, parseDocument, type AnyBlock } from './blocks';

const titleSchema = z.string().min(1).max(200);
const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

export async function savePostBlocks(postId: string, blocks: AnyBlock[]) {
  await requireStaff();
  const parsed = documentSchema.safeParse(blocks);
  if (!parsed.success) throw new Error('Documento inválido');

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .schema('cms').from('posts')
    .update({ blocks: parsed.data as never, updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
  // Guardar el cuerpo no avisaba a la nota publicada: el texto nuevo aparecia
  // recien cuando vencia la ventana de revalidacion.
  const { data: post } = await admin.schema('cms').from('posts').select('slug').eq('id', postId).maybeSingle();
  revalidarPost(post?.slug);
  return { ok: true };
}

export async function updatePostMeta(
  postId: string,
  patch: { title?: string; slug?: string; excerpt?: string; cover_url?: string; published_at?: string | null },
) {
  await requireStaff();
  if (patch.title !== undefined) titleSchema.parse(patch.title);
  if (patch.slug !== undefined) slugSchema.parse(patch.slug);

  const admin = createSupabaseAdminClient();
  const { data: anterior } = await admin.schema('cms').from('posts').select('slug').eq('id', postId).maybeSingle();
  const { error } = await admin.schema('cms').from('posts').update(patch).eq('id', postId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
  revalidarPost(patch.slug ?? anterior?.slug);
  // Si le cambiaron el slug, la direccion vieja tambien tiene que rearmarse:
  // si no, sigue sirviendo la nota como si nada hubiera pasado.
  if (patch.slug && anterior?.slug && anterior.slug !== patch.slug) revalidarPost(anterior.slug);
  return { ok: true };
}

export async function createPost(): Promise<{ id: string }> {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const slug = `borrador-${Date.now().toString(36)}`;
  const { data, error } = await admin
    .schema('cms').from('posts')
    .insert({ title: 'Nuevo post', slug, blocks: [], excerpt: '' })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/blog');
  return { id: data.id };
}

export async function publishPost(postId: string, publish: boolean) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin
    .schema('cms').from('posts')
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq('id', postId);
  revalidatePath('/admin/blog');
  const { data: post } = await admin.schema('cms').from('posts').select('slug').eq('id', postId).maybeSingle();
  revalidarPost(post?.slug);
}

/** Helper para cargar y normalizar el documento al editor. */
export async function loadPostForEditor(postId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('cms').from('posts')
    .select('id, title, slug, excerpt, cover_url, blocks, published_at, updated_at')
    .eq('id', postId)
    .single();
  if (error || !data) return null;
  return { ...data, blocks: parseDocument(data.blocks) };
}
