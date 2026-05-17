'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { upsertHelpArticleAction, type HelpArticleInput } from '@/lib/help/actions';
import type { HelpArticle, HelpCategory } from '@/lib/help';

export function HelpArticleEditor({
  article,
  categories,
}: {
  article?: HelpArticle;
  categories: HelpCategory[];
}) {
  const router = useRouter();
  const [state, setState] = useState<HelpArticleInput>({
    slug: article?.slug ?? '',
    title: article?.title ?? '',
    excerpt: article?.excerpt ?? '',
    body_md: article?.body_md ?? '',
    category_id: article?.category_id ?? categories[0]?.id ?? null,
    tags: article?.tags ?? [],
    is_published: article?.is_published ?? false,
  });
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function save() {
    start(async () => {
      try {
        await upsertHelpArticleAction(state, article?.id);
        router.push('/admin/ayuda');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Error');
      }
    });
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <Field label="Título">
        <input
          value={state.title}
          onChange={(e) => setState((s) => ({
            ...s,
            title: e.target.value,
            slug: s.slug || slugify(e.target.value),
          }))}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Slug (URL)">
        <input
          value={state.slug}
          onChange={(e) => setState((s) => ({ ...s, slug: slugify(e.target.value) }))}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm font-mono"
        />
      </Field>
      <Field label="Categoría">
        <select
          value={state.category_id ?? ''}
          onChange={(e) => setState((s) => ({ ...s, category_id: e.target.value || null }))}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
        >
          <option value="">— sin categoría —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </Field>
      <Field label="Resumen (excerpt)">
        <textarea
          value={state.excerpt ?? ''}
          onChange={(e) => setState((s) => ({ ...s, excerpt: e.target.value }))}
          maxLength={300}
          rows={2}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Cuerpo (Markdown)">
        <textarea
          value={state.body_md}
          onChange={(e) => setState((s) => ({ ...s, body_md: e.target.value }))}
          rows={18}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm font-mono"
        />
      </Field>
      <Field label="Tags (separados por coma)">
        <input
          value={(state.tags ?? []).join(', ')}
          onChange={(e) => setState((s) => ({
            ...s,
            tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
          }))}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
      </Field>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.is_published}
          onChange={(e) => setState((s) => ({ ...s, is_published: e.target.checked }))}
        />
        Publicado
      </label>

      {err && <p className="text-xs text-red-700">✗ {err}</p>}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-md bg-leaf text-bone px-5 py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-md border border-ink/15 px-5 py-2 text-sm hover:bg-bone-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-mute mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
