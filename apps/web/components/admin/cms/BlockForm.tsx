'use client';

import { Input, Textarea, Select, Field, Checkbox } from '@arteytierra/ui';
import type { AnyBlock } from '@/lib/cms/blocks';

interface Props {
  block: AnyBlock;
  onChange: (data: unknown) => void;
}

export function BlockForm({ block, onChange }: Props) {
  const set = (patch: Record<string, unknown>) => onChange({ ...(block.data as object), ...patch });
  const d = block.data as Record<string, unknown>;

  switch (block.type) {
    case 'heading':
      return (
        <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
          <Field label="Nivel">
            {(id) => (
              <Select id={id} value={String(d.level ?? 2)} onChange={(e) => set({ level: Number(e.target.value) })}>
                <option value="2">H2</option>
                <option value="3">H3</option>
                <option value="4">H4</option>
              </Select>
            )}
          </Field>
          <Field label="Texto">
            {(id) => (
              <Input id={id} value={(d.text as string) ?? ''} onChange={(e) => set({ text: e.target.value })} />
            )}
          </Field>
          <Field label="Eyebrow (opcional)" className="sm:col-span-2">
            {(id) => (
              <Input id={id} value={(d.eyebrow as string) ?? ''} onChange={(e) => set({ eyebrow: e.target.value })} />
            )}
          </Field>
        </div>
      );

    case 'paragraph':
      return (
        <div className="space-y-3">
          <Textarea
            rows={4}
            value={(d.text as string) ?? ''}
            onChange={(e) => set({ text: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <Checkbox
              checked={Boolean(d.lead)}
              onChange={(e) => set({ lead: e.target.checked })}
            />
            Estilo lead (más grande)
          </label>
        </div>
      );

    case 'image':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="URL imagen" className="sm:col-span-2">
            {(id) => (
              <Input id={id} value={(d.src as string) ?? ''} onChange={(e) => set({ src: e.target.value })} />
            )}
          </Field>
          <Field label="Alt">
            {(id) => (
              <Input id={id} value={(d.alt as string) ?? ''} onChange={(e) => set({ alt: e.target.value })} />
            )}
          </Field>
          <Field label="Aspect">
            {(id) => (
              <Select id={id} value={(d.aspect as string) ?? '16/9'} onChange={(e) => set({ aspect: e.target.value })}>
                <option value="16/9">16/9</option>
                <option value="4/3">4/3</option>
                <option value="1/1">1/1</option>
                <option value="3/4">3/4</option>
              </Select>
            )}
          </Field>
          <Field label="Caption (opcional)" className="sm:col-span-2">
            {(id) => (
              <Input id={id} value={(d.caption as string) ?? ''} onChange={(e) => set({ caption: e.target.value })} />
            )}
          </Field>
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-3">
          <Field label="Cita">
            {(id) => (
              <Textarea id={id} rows={3} value={(d.text as string) ?? ''} onChange={(e) => set({ text: e.target.value })} />
            )}
          </Field>
          <Field label="Autor">
            {(id) => (
              <Input id={id} value={(d.author as string) ?? ''} onChange={(e) => set({ author: e.target.value })} />
            )}
          </Field>
        </div>
      );

    case 'cta':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título" className="sm:col-span-2">
            {(id) => (
              <Input id={id} value={(d.title as string) ?? ''} onChange={(e) => set({ title: e.target.value })} />
            )}
          </Field>
          <Field label="Texto (opcional)" className="sm:col-span-2">
            {(id) => (
              <Textarea id={id} rows={2} value={(d.body as string) ?? ''} onChange={(e) => set({ body: e.target.value })} />
            )}
          </Field>
          <Field label="Href">
            {(id) => (
              <Input id={id} value={(d.href as string) ?? ''} onChange={(e) => set({ href: e.target.value })} />
            )}
          </Field>
          <Field label="Label">
            {(id) => (
              <Input id={id} value={(d.label as string) ?? ''} onChange={(e) => set({ label: e.target.value })} />
            )}
          </Field>
          <Field label="Variante">
            {(id) => (
              <Select id={id} value={(d.variant as string) ?? 'clay'} onChange={(e) => set({ variant: e.target.value })}>
                <option value="clay">Clay</option>
                <option value="moss">Moss</option>
                <option value="ink">Ink</option>
              </Select>
            )}
          </Field>
        </div>
      );

    case 'video':
      return (
        <Field label="URL (YouTube, Vimeo, MP4)">
          {(id) => (
            <Input id={id} value={(d.url as string) ?? ''} onChange={(e) => set({ url: e.target.value })} />
          )}
        </Field>
      );

    case 'faq': {
      const items = (d.items as Array<{ q: string; a: string }>) ?? [];
      return (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-bone-200 p-3">
              <Input
                placeholder="Pregunta"
                value={it.q}
                onChange={(e) => {
                  const next = items.slice();
                  next[i] = { ...it, q: e.target.value };
                  set({ items: next });
                }}
              />
              <Textarea
                rows={2}
                placeholder="Respuesta"
                value={it.a}
                onChange={(e) => {
                  const next = items.slice();
                  next[i] = { ...it, a: e.target.value };
                  set({ items: next });
                }}
              />
              <button
                type="button"
                onClick={() => set({ items: items.filter((_, j) => j !== i) })}
                className="self-end text-xs text-clay-700 hover:underline"
              >
                eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ items: [...items, { q: '', a: '' }] })}
            className="text-xs text-moss-700 hover:underline"
          >
            + agregar pregunta
          </button>
        </div>
      );
    }

    case 'product':
      return (
        <Field label="Slug de producto">
          {(id) => (
            <Input id={id} value={(d.slug as string) ?? ''} onChange={(e) => set({ slug: e.target.value })} />
          )}
        </Field>
      );

    case 'embed':
      return (
        <Field label="HTML (será sanitizado)">
          {(id) => (
            <Textarea
              id={id}
              rows={6}
              value={(d.html as string) ?? ''}
              onChange={(e) => set({ html: e.target.value })}
            />
          )}
        </Field>
      );

    case 'gallery': {
      const imgs = (d.images as Array<{ src: string; alt: string }>) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Columnas">
            {(id) => (
              <Select
                id={id}
                value={String(d.columns ?? 3)}
                onChange={(e) => set({ columns: Number(e.target.value) })}
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </Select>
            )}
          </Field>
          {imgs.map((im, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                placeholder="URL"
                value={im.src}
                onChange={(e) => {
                  const next = imgs.slice();
                  next[i] = { ...im, src: e.target.value };
                  set({ images: next });
                }}
              />
              <Input
                placeholder="Alt"
                value={im.alt}
                onChange={(e) => {
                  const next = imgs.slice();
                  next[i] = { ...im, alt: e.target.value };
                  set({ images: next });
                }}
              />
              <button
                type="button"
                onClick={() => set({ images: imgs.filter((_, j) => j !== i) })}
                className="text-xs text-clay-700 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ images: [...imgs, { src: '', alt: '' }] })}
            className="text-xs text-moss-700 hover:underline"
          >
            + agregar imagen
          </button>
        </div>
      );
    }

    case 'divider':
      return <p className="text-xs text-ink-800/55 italic">Divisor visual (sin configuración).</p>;
  }
}
