'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { Button, Field, Input, Textarea } from '@arteytierra/ui';
import { submitReview } from '@/lib/reviews';

export function ReviewForm({
  productId,
  initial,
}: {
  productId: string;
  initial?: { rating: number; title: string | null; body: string | null } | null;
}) {
  const [rating, setRating] = useState<number>(initial?.rating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [title, setTitle] = useState<string>(initial?.title ?? '');
  const [body, setBody] = useState<string>(initial?.body ?? '');
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    if (rating < 1) {
      setError('Elegí entre 1 y 5 estrellas.');
      return;
    }
    startTransition(async () => {
      try {
        await submitReview({ product_id: productId, rating, title: title || null, body: body || null });
        setOkMsg('¡Gracias! Tu reseña fue enviada y queda en moderación.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos enviar tu reseña.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5 space-y-4">
      <h3 className="font-display text-lg text-ink-950">
        {initial ? 'Actualizar tu reseña' : 'Escribir una reseña'}
      </h3>

      <div>
        <span className="block text-xs uppercase tracking-[0.12em] text-ink-800/65 mb-1.5">Tu puntaje</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                aria-label={`${n} estrellas`}
                className="p-1 -m-1 hover:scale-110 transition-transform"
              >
                <Star
                  size={26}
                  className={filled ? 'fill-clay-600 text-clay-600' : 'text-ink-800/30'}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Título (opcional)">
        {(id) => (
          <Input
            id={id}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Resumen breve"
          />
        )}
      </Field>

      <Field label="Tu experiencia">
        {(id) => (
          <Textarea
            id={id}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            placeholder="Contanos qué te pareció…"
          />
        )}
      </Field>

      {error ? <p className="text-sm text-clay-700">{error}</p> : null}
      {okMsg ? <p className="text-sm text-moss-700">{okMsg}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Enviando…' : initial ? 'Actualizar reseña' : 'Publicar reseña'}
      </Button>
      <p className="text-xs text-ink-800/55">
        Las reseñas pasan por moderación antes de ser publicadas. Si compraste el producto,
        aparecerá la insignia <strong>Compra verificada</strong>.
      </p>
    </form>
  );
}
