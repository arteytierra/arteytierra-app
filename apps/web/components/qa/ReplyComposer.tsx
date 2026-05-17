'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Textarea } from '@arteytierra/ui';
import { replyToThreadAction } from '@/lib/qa/actions';

export function ReplyComposer({ threadId, courseSlug }: { threadId: string; courseSlug: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    const body = String(formData.get('body') ?? '').trim();
    if (body.length < 5) {
      setError('Respuesta demasiado corta.');
      return;
    }
    startTransition(async () => {
      try {
        await replyToThreadAction({ threadId, courseSlug, body });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Escribir respuesta
      </Button>
    );
  }

  return (
    <form action={submit} className="space-y-3 rounded-2xl border border-ink-950/10 bg-bone-50 p-4">
      <Field label="Tu respuesta" hint="Markdown básico soportado.">
        {(id) => <Textarea id={id} name="body" rows={6} required minLength={5} maxLength={8000} autoFocus />}
      </Field>
      {error ? <p className="text-sm text-clay-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Publicar respuesta'}</Button>
      </div>
    </form>
  );
}
