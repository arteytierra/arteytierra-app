import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { createSupabaseServerClient } from '@/lib/db/server';

export interface EnrollmentSummary {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  expires_at: string | null;
  completed_at: string | null;
  product: {
    slug: string;
    name: string;
    subtitle: string | null;
    gallery: unknown;
  };
  course: {
    level: string | null;
    duration_hours: number | null;
    is_live: boolean;
  };
  lessonsTotal: number;
  lessonsCompleted: number;
  nextLesson: { id: string; title: string; module_title: string } | null;
}

export async function listMyEnrollments(userId: string): Promise<EnrollmentSummary[]> {
  const admin = createSupabaseAdminClient();

  const { data: enrollments } = await admin
    .from('enrollments')
    .select(`
      id, course_id, progress, enrolled_at, expires_at, completed_at,
      courses!inner(
        level, duration_hours, is_live,
        products!inner(slug, name, subtitle, gallery),
        modules(id, position, title,
          lessons(id, position, title))
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (!enrollments) return [];

  // Conteo de progreso por enrollment
  const result: EnrollmentSummary[] = [];
  for (const e of enrollments as never as Array<{
    id: string; course_id: string; progress: number;
    enrolled_at: string; expires_at: string | null; completed_at: string | null;
    courses: {
      level: string | null; duration_hours: number | null; is_live: boolean;
      products: { slug: string; name: string; subtitle: string | null; gallery: unknown };
      modules: Array<{ id: string; position: number; title: string;
        lessons: Array<{ id: string; position: number; title: string }> }>;
    };
  }>) {
    const allLessons = e.courses.modules
      .sort((a, b) => a.position - b.position)
      .flatMap((m) =>
        m.lessons.sort((a, b) => a.position - b.position).map((l) => ({
          ...l, module_title: m.title,
        })),
      );

    const { data: progress } = await admin
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .in('lesson_id', allLessons.map((l) => l.id));

    const doneIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
    const next = allLessons.find((l) => !doneIds.has(l.id)) ?? null;

    result.push({
      id: e.id,
      course_id: e.course_id,
      progress: e.progress,
      enrolled_at: e.enrolled_at,
      expires_at: e.expires_at,
      completed_at: e.completed_at,
      product: e.courses.products,
      course: {
        level: e.courses.level,
        duration_hours: e.courses.duration_hours,
        is_live: e.courses.is_live,
      },
      lessonsTotal: allLessons.length,
      lessonsCompleted: doneIds.size,
      nextLesson: next ? { id: next.id, title: next.title, module_title: next.module_title } : null,
    });
  }

  return result;
}

export interface CourseFullData {
  enrollment: { id: string; progress: number; completed_at: string | null };
  course: {
    id: string;
    product: { slug: string; name: string; subtitle: string | null; gallery: unknown };
    level: string | null;
    duration_hours: number | null;
    is_live: boolean;
    instructor: { full_name: string | null; avatar_url: string | null } | null;
  };
  modules: Array<{
    id: string;
    position: number;
    title: string;
    summary: string | null;
    lessons: Array<{
      id: string;
      position: number;
      title: string;
      kind: 'video' | 'pdf' | 'text' | 'live' | 'quiz';
      video_provider: string | null;
      video_id: string | null;
      resource_url: string | null;
      body_mdx: string | null;
      duration_sec: number | null;
      is_free_preview: boolean;
      completed: boolean;
    }>;
  }>;
}

/** Devuelve el curso completo con progreso del usuario. Sólo si está inscrito. */
export async function getCourseForLearner(slug: string, userId: string): Promise<CourseFullData | null> {
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select(`
      id,
      courses!inner(
        id, level, duration_hours, is_live,
        instructor:profiles(full_name, avatar_url),
        modules(id, position, title, summary,
          lessons(id, position, title, kind, video_provider, video_id, resource_url, body_mdx, duration_sec, is_free_preview))
      )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (!product) return null;
  const course = (product as never as { courses: Array<unknown> }).courses[0] as
    | undefined
    | {
        id: string; level: string | null; duration_hours: number | null; is_live: boolean;
        instructor: { full_name: string | null; avatar_url: string | null } | null;
        modules: Array<{
          id: string; position: number; title: string; summary: string | null;
          lessons: Array<{
            id: string; position: number; title: string;
            kind: 'video' | 'pdf' | 'text' | 'live' | 'quiz';
            video_provider: string | null; video_id: string | null;
            resource_url: string | null; body_mdx: string | null;
            duration_sec: number | null; is_free_preview: boolean;
          }>;
        }>;
      };
  if (!course) return null;

  // Validar inscripción
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, progress, completed_at, expires_at')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .maybeSingle();

  if (!enrollment) return null;
  if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) return null;

  // Progreso por lección
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const { data: lp } = await admin
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);
  const done = new Set((lp ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

  const modules = course.modules
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      ...m,
      lessons: m.lessons
        .sort((a, b) => a.position - b.position)
        .map((l) => ({ ...l, completed: done.has(l.id) })),
    }));

  // Cargar nombre y slug del producto vía RSC normal
  const { data: productMeta } = await admin
    .from('products')
    .select('slug, name, subtitle, gallery')
    .eq('id', (product as never as { id: string }).id)
    .single();

  return {
    enrollment: {
      id: enrollment.id,
      progress: enrollment.progress,
      completed_at: enrollment.completed_at,
    },
    course: {
      id: course.id,
      product: productMeta!,
      level: course.level,
      duration_hours: course.duration_hours,
      is_live: course.is_live,
      instructor: course.instructor,
    },
    modules,
  };
}

export async function getLessonForLearner(lessonId: string, userId: string) {
  const admin = createSupabaseAdminClient();
  const { data: lesson } = await admin
    .from('lessons')
    .select(`
      id, position, title, kind, video_provider, video_id, resource_url, body_mdx, duration_sec, is_free_preview,
      modules!inner(id, title, position, course_id,
        courses!inner(id, products(slug, name)))
    `)
    .eq('id', lessonId)
    .maybeSingle();

  if (!lesson) return null;

  const courseId = (lesson as never as { modules: { courses: { id: string } } }).modules.courses.id;
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!enrollment) return null;
  if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) return null;

  const { data: progress } = await admin
    .from('lesson_progress')
    .select('completed, watched_sec')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  return { lesson, progress: progress ?? { completed: false, watched_sec: 0 } };
}

export async function listEnrolledCourseSlugs(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('enrollments')
    .select('courses(products(slug))')
    .eq('user_id', userId);
  return (data ?? [])
    .map((d) => (d as never as { courses: { products: { slug: string } | null } | null })?.courses?.products?.slug)
    .filter(Boolean) as string[];
}
