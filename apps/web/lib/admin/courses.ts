'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

const moduleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(160),
  summary: z.string().optional(),
  position: z.number().int().nonnegative(),
});

const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  module_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  kind: z.enum(['video', 'reading', 'quiz', 'live', 'download']),
  duration_sec: z.number().int().nonnegative().nullable().optional(),
  is_free_preview: z.boolean().default(false),
  position: z.number().int().nonnegative(),
  content_url: z.string().optional(),
  body_mdx: z.string().optional(),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;

/**
 * Devuelve curso + currículum completo para edición.
 * Crea el `course` si no existe (1 curso por producto type=course).
 */
export async function getCourseEditorData(productId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('id, name, slug, type')
    .eq('id', productId)
    .single();
  if (!product || product.type !== 'course') return null;

  let { data: course } = await admin
    .from('courses')
    .select('id, product_id, level, duration_hours, is_live, is_recorded, capacity')
    .eq('product_id', productId)
    .maybeSingle();

  if (!course) {
    const ins = await admin
      .from('courses')
      .insert({ product_id: productId, is_recorded: true })
      .select('id, product_id, level, duration_hours, is_live, is_recorded, capacity')
      .single();
    course = ins.data!;
  }

  const { data: modules } = await admin
    .from('modules')
    .select('id, title, summary, position')
    .eq('course_id', course.id)
    .order('position', { ascending: true });

  const { data: lessons } = await admin
    .from('lessons')
    .select(
      'id, module_id, title, kind, duration_sec, is_free_preview, position, content_url, body_mdx',
    )
    .in('module_id', (modules ?? []).map((m) => m.id))
    .order('position', { ascending: true });

  return { product, course, modules: modules ?? [], lessons: lessons ?? [] };
}

export async function saveModule(courseId: string, input: ModuleInput) {
  await requireStaff();
  const parsed = moduleSchema.parse(input);
  const admin = createSupabaseAdminClient();
  if (parsed.id) {
    const { error } = await admin
      .from('modules')
      .update({ title: parsed.title, summary: parsed.summary, position: parsed.position })
      .eq('id', parsed.id);
    if (error) throw new Error(error.message);
    return { id: parsed.id };
  }
  const { data, error } = await admin
    .from('modules')
    .insert({
      course_id: courseId,
      title: parsed.title,
      summary: parsed.summary,
      position: parsed.position,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function deleteModule(moduleId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.from('modules').delete().eq('id', moduleId);
}

export async function saveLesson(input: LessonInput & { module_id: string }) {
  await requireStaff();
  const parsed = lessonSchema.parse(input);
  if (!parsed.module_id) throw new Error('module_id requerido');
  const admin = createSupabaseAdminClient();
  if (parsed.id) {
    const { error } = await admin.from('lessons').update(parsed).eq('id', parsed.id);
    if (error) throw new Error(error.message);
    return { id: parsed.id };
  }
  const { data, error } = await admin.from('lessons').insert(parsed).select('id').single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function deleteLesson(lessonId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.from('lessons').delete().eq('id', lessonId);
}

export async function reorderModules(orderedIds: string[]) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, i) => admin.from('modules').update({ position: i }).eq('id', id)),
  );
}

export async function reorderLessons(moduleId: string, orderedIds: string[]) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, i) =>
      admin.from('lessons').update({ position: i, module_id: moduleId }).eq('id', id),
    ),
  );
}

export async function revalidateCourse(productSlug: string) {
  revalidatePath(`/cursos/${productSlug}`);
}
