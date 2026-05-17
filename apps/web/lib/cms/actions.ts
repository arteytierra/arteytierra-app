'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { documentSchema, parseDocument, type AnyBlock } from './blocks';

const titleSchema = z.string().min(1).max(200);
const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

export async function savePostBlocks(postId: string, blocks: AnyBlock[]) {
  await requireStaff();
  const parsed = documentSchema.safeParse(blocks);
  if (!parsed.success) throw new Error('Documento inválido');

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('posts')
    .update({ blocks: parsed.data, updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
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
  const { error } = await admin.from('posts').update(patch).eq('id', postId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  if (patch.slug) revalidatePath(`/blog/${patch.slug}`);
  return { ok: true };
}

export async function createPost(): Promise<{ id: string }> {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const slug = `borrador-${Date.now().toString(36)}`;
  const { data, error } = await admin
    .from('posts')
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
    .from('posts')
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq('id', postId);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

/** Helper para cargar y normalizar el documento al editor. */
export async function loadPostForEditor(postId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('posts')
    .select('id, title, slug, excerpt, cover_url, blocks, published_at, updated_at')
    .eq('id', postId)
    .single();
  if (error || !data) return null;
  return { ...data, blocks: parseDocument(data.blocks) };
}
