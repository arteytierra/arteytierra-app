'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Textarea } from '@arteytierra/ui';
import { createThreadAction } from '@/lib/qa/actions';

export function ThreadComposer({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const tagsStr = String(formData.get('tags') ?? '').trim();
    const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 5) : [];
    if (title.length < 6 || body.length < 10) {
      setError('Completá un título (≥6) y un detalle (≥10 caracteres).');
      return;
    }
    startTransition(async () => {
      try {
        const { id } = await createThreadAction({ courseId, courseSlug, title, body, tags });
        ref.current?.close();
        router.push(`/cursos/${courseSlug}/q-a/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <>
      <Button onClick={() => ref.current?.showModal()}>Hacer una pregunta</Button>
      <dialog
        ref={ref}
        className="rounded-2xl backdrop:bg-ink-950/50 backdrop:backdrop-blur-sm p-0 max-w-xl w-full"
      >
        <form action={submit} className="p-6 space-y-4">
          <h3 className="font-display text-xl text-ink-950">Nueva pregunta</h3>
          <p className="text-sm text-ink-800/70">
            Sé específico/a. El instructor y otros alumnos pueden responder. Soporta Markdown.
          </p>

          <Field label="Título">
            {(id) => <Input id={id} name="title" required minLength={6} maxLength={200} />}
          </Field>

          <Field label="Detalle" hint="Aceptamos markdown básico: **negrita**, *itálica*, `código`, listas, > citas.">
            {(id) => <Textarea id={id} name="body" rows={8} required minLength={10} maxLength={8000} />}
          </Field>

          <Field label="Etiquetas (opcional)" hint="Separadas por coma, máx 5.">
            {(id) => <Input id={id} name="tags" placeholder="ej: módulo-2, plantas, suelo" />}
          </Field>

          {error ? <p className="text-sm text-clay-700">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => ref.current?.close()}>Cancelar</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Publicando…' : 'Publicar'}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
