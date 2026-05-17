'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Textarea } from '@arteytierra/ui';
import { applyToScholarshipAction, createScholarshipUploadUrlAction } from '@/lib/scholarships/actions';

export function ScholarshipApplyForm({
  programSlug,
  requiresEvidence,
}: {
  programSlug: string;
  requiresEvidence: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [evidencePath, setEvidencePath] = useState<string | null>(null);
  const [evidenceName, setEvidenceName] = useState<string | null>(null);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 15 * 1024 * 1024) {
      setError('El archivo supera los 15 MB.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const { path, signedUrl, token } = await createScholarshipUploadUrlAction({ filename: file.name });
      const res = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });
      if (!res.ok) throw new Error('Falló la subida');
      setEvidencePath(path);
      setEvidenceName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo archivo');
    } finally {
      setUploading(false);
    }
  }

  function submit(formData: FormData) {
    setError(null);
    const motivation = String(formData.get('motivation') ?? '').trim();
    if (motivation.length < 100) {
      setError('La carta debe tener al menos 100 caracteres.');
      return;
    }
    if (requiresEvidence && !evidencePath) {
      setError('Necesitamos un documento de respaldo.');
      return;
    }
    const household = {
      monthly_income_ars: Number(formData.get('income') ?? 0) || undefined,
      situation: String(formData.get('situation') ?? '').trim() || undefined,
      country: String(formData.get('country') ?? '').trim() || undefined,
    };
    startTransition(async () => {
      try {
        await applyToScholarshipAction({
          programSlug,
          motivation,
          evidencePath,
          household,
        });
        router.push('/mis-becas?ok=1');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <form action={submit} className="space-y-6 rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
      <Field
        label="Carta de motivación"
        hint="Contanos por qué querés esta beca y cómo planeás usar lo que aprendas. Entre 100 y 5000 caracteres."
      >
        {(id) => <Textarea id={id} name="motivation" rows={10} required minLength={100} maxLength={5000} />}
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="País / región (opcional)">
          {(id) => <Input id={id} name="country" placeholder="ej: Argentina · NOA" />}
        </Field>
        <Field label="Ingresos mensuales aprox. ARS (opcional)" hint="Confidencial. Sólo para evaluación.">
          {(id) => <Input id={id} name="income" type="number" min={0} />}
        </Field>
      </div>

      <Field label="Situación (opcional)" hint="Breve descripción contextual.">
        {(id) => <Textarea id={id} name="situation" rows={3} maxLength={400} />}
      </Field>

      {requiresEvidence && (
        <div>
          <p className="text-sm font-medium">Documento de respaldo</p>
          <p className="text-xs text-ink-800/65 mt-1">
            PDF, imagen o carta institucional. Hasta 15 MB.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*,.doc,.docx"
              className="text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {uploading && <span className="text-xs text-ink-800/65">Subiendo…</span>}
            {evidencePath && !uploading && (
              <span className="text-xs text-moss-700">✓ {evidenceName}</span>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-clay-700">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? 'Enviando…' : 'Enviar postulación'}
        </Button>
      </div>
    </form>
  );
}
