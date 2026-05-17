'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Textarea } from '@arteytierra/ui';
import { applyAsPartnerAction } from '@/lib/partners/actions';

export function PartnerApplyForm({ programSlug, defaultEmail }: { programSlug: string; defaultEmail?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    const organization = String(formData.get('organization') ?? '').trim();
    const website = String(formData.get('website') ?? '').trim();
    const contactEmail = String(formData.get('email') ?? '').trim();
    const applicationMd = String(formData.get('pitch') ?? '').trim();
    if (organization.length < 2) return setError('Falta organización');
    if (!contactEmail.match(/.+@.+\..+/)) return setError('Email inválido');
    if (applicationMd.length < 80) return setError('Contanos más en el pitch (mín 80 caracteres)');
    startTransition(async () => {
      try {
        await applyAsPartnerAction({ programSlug, organization, website, contactEmail, applicationMd });
        router.push('/partners/dashboard?ok=1');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <form action={submit} className="space-y-5 rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
      <Field label="Organización">
        {(id) => <Input id={id} name="organization" required placeholder="Nombre legal o comercial" />}
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Sitio / IG (opcional)">
          {(id) => <Input id={id} name="website" type="url" placeholder="https://" />}
        </Field>
        <Field label="Email de contacto">
          {(id) => <Input id={id} name="email" type="email" required defaultValue={defaultEmail} />}
        </Field>
      </div>
      <Field
        label="Pitch — ¿cómo planeás difundir Arte y Tierra?"
        hint="Audiencia, canales, tono. Cuanto más concreto, mejor."
      >
        {(id) => <Textarea id={id} name="pitch" rows={8} required minLength={80} maxLength={4000} />}
      </Field>
      {error && <p className="text-sm text-clay-700">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Enviando…' : 'Postular'}
        </Button>
      </div>
    </form>
  );
}
