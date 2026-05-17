'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { buildCertificateSignature } from '@/lib/certificates';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendTransactional } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

const trackSchema = z.object({
  lessonId: z.string().uuid(),
  watchedSec: z.coerce.number().int().nonnegative().default(0),
  completed: z.coerce.boolean().default(false),
});

/**
 * Trackea progreso de una lección. Idempotente.
 * Si watchedSec o completed cambia, actualiza.
 * Recalcula progreso del enrollment.
 */
export async function trackLessonProgress(input: z.infer<typeof trackSchema>) {
  const user = await requireUser();
  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const { lessonId, watchedSec, completed } = parsed.data;

  const admin = createSupabaseAdminClient();

  // Verificar enrollment
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, modules!inner(course_id)')
    .eq('id', lessonId)
    .maybeSingle();

  if (!lesson) return { ok: false };
  const courseId = (lesson as never as { modules: { course_id: string } }).modules.course_id;

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, expires_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!enrollment) return { ok: false };

  // Upsert progreso
  const { data: existing } = await admin
    .from('lesson_progress')
    .select('watched_sec, completed')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  await admin.from('lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    completed: completed || existing?.completed || false,
    watched_sec: Math.max(watchedSec, existing?.watched_sec ?? 0),
  }, { onConflict: 'user_id,lesson_id' });

  // Recalcular progreso del enrollment
  const { data: lessons } = await admin
    .from('lessons')
    .select('id, modules!inner(course_id)')
    .eq('modules.course_id', courseId);

  const ids = (lessons ?? []).map((l) => l.id);
  const { count: doneCount } = await admin
    .from('lesson_progress')
    .select('lesson_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('lesson_id', ids)
    .eq('completed', true);

  const progress = ids.length > 0 ? (doneCount ?? 0) / ids.length : 0;
  const shouldComplete = progress >= 0.95;

  await admin
    .from('enrollments')
    .update({
      progress,
      ...(shouldComplete ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', enrollment.id);

  // Si recién completa, emitir certificado
  if (shouldComplete) {
    const { data: existingCert } = await admin
      .from('certificates')
      .select('id')
      .eq('enrollment_id', enrollment.id)
      .maybeSingle();
    if (!existingCert) {
      const code = generateCertCode();
      const issuedAt = new Date().toISOString();
      const signature = buildCertificateSignature(code, enrollment.id, issuedAt);
      const { data: inserted } = await admin
        .from('certificates')
        .insert({
          enrollment_id: enrollment.id,
          code,
          issued_at: issuedAt,
          signature_hash: signature,
          locale: 'es',
        })
        .select('id, code')
        .single();
      // Notif in-app + push
      void createNotification({
        userId: user.id,
        kind: 'certificate_issued',
        title: '¡Tu certificado está listo!',
        body: `Código ${code}`,
        url: `/verificar/${code}`,
        data: { code, enrollment_id: enrollment.id },
        push: true,
      });

      // Email transaccional con código + link a PDF
      if (user.email) {
        const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
        // Obtener título del curso para el email
        const { data: courseRow } = await admin
          .from('products')
          .select('name')
          .eq('id', courseId)
          .maybeSingle();
        void sendTransactional({
          to: user.email,
          userId: user.id,
          template: 'certificate-issued',
          category: 'transactional',
          force: true,
          locale: 'es',
          vars: {
            name: user.fullName ?? 'Hola',
            courseTitle: (courseRow as { name?: string } | null)?.name ?? 'curso',
            code,
            verifyUrl: `${site}/verificar/${code}`,
            pdfUrl: `${site}/api/certificados/${code}/pdf`,
          },
        });
      }

      // Outbound webhooks
      {
        const { dispatchWebhook } = await import('@/lib/webhooks-out');
        void dispatchWebhook('certificate.issued', {
          code,
          enrollment_id: enrollment.id,
          course_id: courseId,
          user_id: user.id,
        });
      }

      // Notificar n8n para flujos adicionales
      emitN8nEvent('certificate-issued', {
        certificate_id: (inserted as { id?: string } | null)?.id ?? null,
        code,
        user_id: user.id,
        user_email: user.email,
        user_name: user.fullName,
        enrollment_id: enrollment.id,
        course_id: courseId,
        pdf_url: `/api/certificados/${code}/pdf`,
        verify_url: `/verificar/${code}`,
      });
    }
  }

  return { ok: true, progress };
}

function generateCertCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3 || i === 7) out += '-';
  }
  return out;
}

/**
 * Marca lección como completa explícitamente (botón "marcar como vista").
 */
export async function markLessonComplete(lessonId: string) {
  const res = await trackLessonProgress({ lessonId, watchedSec: 0, completed: true });
  revalidatePath('/mis-cursos', 'layout');
  return res;
}
