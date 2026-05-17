'use client';

import { useRef, useState, useTransition } from 'react';
import { Button, Field, Input, Textarea } from '@arteytierra/ui';
import { upsertLiveSessionAction } from '@/lib/live/actions';

export function LiveSessionDialog() {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const title = String(formData.get('title') ?? '').trim();
    const scheduledAt = String(formData.get('scheduled_at') ?? '');
    const durationMin = Number(formData.get('duration_min') ?? 60);
    const courseId = String(formData.get('course_id') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const recording = formData.get('recording_enabled') === 'on';

    if (!title || !scheduledAt) {
      setError('Falta título o fecha.');
      return;
    }

    startTransition(async () => {
      try {
        await upsertLiveSessionAction({
          title,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_min: durationMin,
          course_id: courseId || null,
          description: description || null,
          recording_enabled: recording,
        });
        ref.current?.close();
        // Refresh server data
        if (typeof window !== 'undefined') window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <>
      <Button onClick={() => ref.current?.showModal()}>Crear sesión</Button>
      <dialog
        ref={ref}
        className="rounded-2xl backdrop:bg-ink-950/50 backdrop:backdrop-blur-sm p-0 max-w-lg w-full"
      >
        <form action={onSubmit} className="p-6 space-y-4">
          <h3 className="font-display text-xl text-ink-950">Nueva clase en vivo</h3>

          <Field label="Título">
            {(id) => <Input id={id} name="title" required maxLength={160} />}
          </Field>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <Field label="Fecha y hora (local)">
              {(id) => <Input id={id} name="scheduled_at" type="datetime-local" required />}
            </Field>
            <Field label="Duración (min)">
              {(id) => <Input id={id} name="duration_min" type="number" defaultValue={60} min={5} max={600} />}
            </Field>
          </div>

          <Field label="Course ID (opcional)" hint="Si no se completa, la sala es pública para staff/host.">
            {(id) => <Input id={id} name="course_id" placeholder="uuid del curso" />}
          </Field>

          <Field label="Descripción (opcional)">
            {(id) => <Textarea id={id} name="description" rows={3} maxLength={500} />}
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="recording_enabled" className="h-4 w-4 rounded border-ink-950/25 text-moss-700 focus:ring-moss-700/30" />
            Permitir grabación (solo host puede iniciar)
          </label>

          {error ? <p className="text-sm text-clay-700">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => ref.current?.close()}>Cancelar</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Creando…' : 'Crear'}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
