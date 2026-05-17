'use client';

import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { Input, Textarea, Select, Field, Button } from '@arteytierra/ui';
import { upsertProduct, type ProductInput } from '@/lib/admin/products';
import { AttributesEditor } from './AttributesEditor';

interface Props {
  productId: string;
  initial: ProductInput;
}

const TYPE_OPTIONS = [
  { v: 'course', l: 'Curso' },
  { v: 'ebook', l: 'Ebook' },
  { v: 'physical', l: 'Físico' },
  { v: 'service', l: 'Servicio' },
  { v: 'lodging', l: 'Hospedaje' },
  { v: 'consult', l: 'Asesoría' },
  { v: 'immersion', l: 'Inmersión' },
  { v: 'biocosmetic', l: 'Biocosmética' },
] as const;

export function ProductForm({ productId, initial }: Props) {
  const [state, setState] = useState<ProductInput>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; err?: string } | null>(null);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function save() {
    start(async () => {
      setMsg(null);
      try {
        await upsertProduct(productId, state);
        setMsg({ ok: 'Guardado' });
      } catch (e) {
        setMsg({ err: e instanceof Error ? e.message : 'Error' });
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-bone-200 bg-bone-50 p-6 space-y-4">
        <h2 className="font-display text-xl">Información básica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            {(id) => (
              <Input
                id={id}
                value={state.name}
                onChange={(e) => set('name', e.target.value)}
              />
            )}
          </Field>
          <Field label="Slug" hint="solo a-z, 0-9 y -">
            {(id) => (
              <Input
                id={id}
                value={state.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
            )}
          </Field>
          <Field label="Subtítulo" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                value={state.subtitle ?? ''}
                onChange={(e) => set('subtitle', e.target.value)}
              />
            )}
          </Field>
          <Field label="Descripción (Markdown)" className="sm:col-span-2">
            {(id) => (
              <Textarea
                id={id}
                rows={6}
                value={state.description_mdx ?? ''}
                onChange={(e) => set('description_mdx', e.target.value)}
              />
            )}
          </Field>
          <Field label="Tipo">
            {(id) => (
              <Select id={id} value={state.type} onChange={(e) => set('type', e.target.value as ProductInput['type'])}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Categoría (libre)">
            {(id) => (
              <Input
                id={id}
                value={state.category ?? ''}
                onChange={(e) => set('category', e.target.value)}
              />
            )}
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-bone-200 bg-bone-50 p-6 space-y-4">
        <h2 className="font-display text-xl">Precio e inventario</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio (centavos)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={state.base_price_cents}
                onChange={(e) => set('base_price_cents', Number(e.target.value))}
              />
            )}
          </Field>
          <Field label="Precio comparativo (opcional)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={state.compare_at_cents ?? ''}
                onChange={(e) =>
                  set('compare_at_cents', e.target.value === '' ? null : Number(e.target.value))
                }
              />
            )}
          </Field>
          <Field label="Moneda">
            {(id) => (
              <Select id={id} value={state.currency} onChange={(e) => set('currency', e.target.value as 'ARS' | 'USD')}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            )}
          </Field>
          <Field label="Stock (vacío = ∞)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={state.stock ?? ''}
                onChange={(e) =>
                  set('stock', e.target.value === '' ? null : Number(e.target.value))
                }
              />
            )}
          </Field>
          <label className="flex items-center gap-2 mt-7 sm:col-span-2">
            <input
              type="checkbox"
              checked={state.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-ink-950/25 text-moss-700 focus:ring-moss-700/30"
            />
            <span className="text-sm">Producto activo (visible en el sitio)</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-bone-200 bg-bone-50 p-6 space-y-4">
        <h2 className="font-display text-xl">Atributos específicos</h2>
        <p className="text-sm text-ink-800/70">
          Campos según tipo: imagen de portada, fechas, capacidad, ebook_path, etc.
        </p>
        <AttributesEditor
          type={state.type}
          value={state.attributes}
          onChange={(v) => set('attributes', v)}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-bone-50/95 backdrop-blur border-t border-bone-200 px-4 sm:rounded-2xl sm:border py-3 flex items-center gap-4">
        <Button onClick={save} disabled={pending}>
          <Save size={14} /> {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {msg?.ok && <span className="text-sm text-moss-700">✓ {msg.ok}</span>}
        {msg?.err && <span className="text-sm text-clay-700">✗ {msg.err}</span>}
      </div>
    </div>
  );
}
