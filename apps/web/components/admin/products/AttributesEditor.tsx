'use client';

import { Input, Field } from '@arteytierra/ui';

/**
 * Editor de atributos polimórficos por `product.type`.
 *
 * El schema de atributos varía por tipo. Mantenemos los campos comunes
 * (cover_url, gallery) más los específicos del tipo. Todo se persiste en
 * `products.attributes jsonb` y se lee por las páginas públicas según necesiten.
 */

type Attrs = Record<string, unknown>;

interface Props {
  type: string;
  value: Attrs;
  onChange: (v: Attrs) => void;
}

export function AttributesEditor({ type, value, onChange }: Props) {
  const set = (patch: Attrs) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Comunes */}
      <Field label="URL imagen portada" className="sm:col-span-2">
        {(id) => (
          <Input
            id={id}
            value={(value.cover_url as string) ?? ''}
            onChange={(e) => set({ cover_url: e.target.value })}
            placeholder="https://…/portada.jpg"
          />
        )}
      </Field>

      {/* Por tipo */}
      {type === 'ebook' && (
        <Field label="Path del PDF en Storage (bucket ebooks)" className="sm:col-span-2">
          {(id) => (
            <Input
              id={id}
              value={(value.ebook_path as string) ?? ''}
              onChange={(e) => set({ ebook_path: e.target.value })}
              placeholder="agroecologia/manual-2026.pdf"
            />
          )}
        </Field>
      )}

      {type === 'course' && (
        <>
          <Field label="Duración total (horas)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={(value.duration_hours as number | undefined) ?? ''}
                onChange={(e) =>
                  set({
                    duration_hours: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            )}
          </Field>
          <Field label="Nivel">
            {(id) => (
              <Input
                id={id}
                value={(value.level as string) ?? ''}
                placeholder="introductorio, intermedio, avanzado"
                onChange={(e) => set({ level: e.target.value })}
              />
            )}
          </Field>
          <Field label="Próxima cohorte (ISO)" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                value={(value.next_cohort_at as string) ?? ''}
                onChange={(e) => set({ next_cohort_at: e.target.value })}
              />
            )}
          </Field>
        </>
      )}

      {type === 'lodging' && (
        <>
          <Field label="Capacidad (huéspedes)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={1}
                value={(value.capacity as number | undefined) ?? ''}
                onChange={(e) =>
                  set({ capacity: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            )}
          </Field>
          <Field label="Mínimo de noches">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={1}
                value={(value.min_nights as number | undefined) ?? 2}
                onChange={(e) =>
                  set({ min_nights: e.target.value === '' ? 1 : Number(e.target.value) })
                }
              />
            )}
          </Field>
          <Field label="Ubicación (texto libre)" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                value={(value.location as string) ?? ''}
                onChange={(e) => set({ location: e.target.value })}
              />
            )}
          </Field>
        </>
      )}

      {type === 'immersion' && (
        <>
          <Field label="Inicio (ISO)">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                value={(value.startsAt as string) ?? ''}
                onChange={(e) => set({ startsAt: e.target.value })}
              />
            )}
          </Field>
          <Field label="Fin (ISO)">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                value={(value.endsAt as string) ?? ''}
                onChange={(e) => set({ endsAt: e.target.value })}
              />
            )}
          </Field>
          <Field label="Ubicación" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                value={(value.location as string) ?? ''}
                onChange={(e) => set({ location: e.target.value })}
              />
            )}
          </Field>
        </>
      )}

      {type === 'consult' && (
        <Field label="Duración por sesión (minutos)">
          {(id) => (
            <Input
              id={id}
              type="number"
              min={15}
              step={15}
              value={(value.session_minutes as number | undefined) ?? 60}
              onChange={(e) =>
                set({ session_minutes: e.target.value === '' ? 60 : Number(e.target.value) })
              }
            />
          )}
        </Field>
      )}

      {type === 'physical' && (
        <>
          <Field label="Peso (gramos)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={(value.weight_grams as number | undefined) ?? ''}
                onChange={(e) =>
                  set({ weight_grams: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            )}
          </Field>
          <Field label="Dimensiones (cm, AxBxC)">
            {(id) => (
              <Input
                id={id}
                value={(value.dimensions as string) ?? ''}
                placeholder="20x15x5"
                onChange={(e) => set({ dimensions: e.target.value })}
              />
            )}
          </Field>
        </>
      )}

      {type === 'biocosmetic' && (
        <>
          <Field label="Volumen / contenido">
            {(id) => (
              <Input
                id={id}
                value={(value.volume as string) ?? ''}
                placeholder="100 ml"
                onChange={(e) => set({ volume: e.target.value })}
              />
            )}
          </Field>
          <Field label="Ingredientes (separados por coma)" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                value={(value.ingredients as string) ?? ''}
                onChange={(e) => set({ ingredients: e.target.value })}
              />
            )}
          </Field>
        </>
      )}
    </div>
  );
}
