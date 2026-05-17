'use client';

import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { Input, Textarea, Field, Button } from '@arteytierra/ui';
import { updatePostMeta } from '@/lib/cms/actions';

interface Props {
  postId: string;
  initial: { title: string; slug: string; excerpt: string; cover_url: string };
}

export function PostMetaForm({ postId, initial }: Props) {
  const [state, setState] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    start(async () => {
      await updatePostMeta(postId, state);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl border border-bone-200 bg-bone-50 p-5 space-y-4 sticky top-6">
      <h3 className="font-display text-lg">Metadata</h3>
      <Field label="Título">
        {(id) => (
          <Input
            id={id}
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
          />
        )}
      </Field>
      <Field label="Slug">
        {(id) => (
          <Input
            id={id}
            value={state.slug}
            onChange={(e) => setState((s) => ({ ...s, slug: e.target.value.toLowerCase() }))}
          />
        )}
      </Field>
      <Field label="Resumen / excerpt">
        {(id) => (
          <Textarea
            id={id}
            rows={3}
            value={state.excerpt}
            onChange={(e) => setState((s) => ({ ...s, excerpt: e.target.value }))}
          />
        )}
      </Field>
      <Field label="URL imagen de portada">
        {(id) => (
          <Input
            id={id}
            value={state.cover_url}
            onChange={(e) => setState((s) => ({ ...s, cover_url: e.target.value }))}
          />
        )}
      </Field>
      <Button size="sm" onClick={save} disabled={pending} className="w-full">
        <Save size={14} /> {pending ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar metadata'}
      </Button>
    </div>
  );
}
