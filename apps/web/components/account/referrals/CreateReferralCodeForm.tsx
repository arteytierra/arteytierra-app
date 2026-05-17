'use client';

import { useState, useTransition } from 'react';
import { Button, Field, Input } from '@arteytierra/ui';
import { createReferralCode } from '@/lib/referrals';

export function CreateReferralCodeForm() {
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    startTransition(async () => {
      try {
        const res = await createReferralCode({
          code,
          commission_pct: 10,
          discount_pct: Number(discount) || 0,
          is_active: true,
        });
        setOkMsg(`Listo. Tu código ${res.code} está activo.`);
        setCode('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos crear el código.');
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5 space-y-4"
    >
      <h3 className="font-display text-xl text-ink-950">Crear código nuevo</h3>
      <div className="grid sm:grid-cols-[1fr_180px] gap-4">
        <Field label="Tu código" hint="A-Z, 0-9, guiones. Entre 3 y 32 caracteres.">
          {(id) => (
            <Input
              id={id}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MARIA10"
              required
              maxLength={32}
            />
          )}
        </Field>
        <Field label="Descuento al referido (%)">
          {(id) => (
            <Input
              id={id}
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          )}
        </Field>
      </div>
      {error ? <p className="text-sm text-clay-700">{error}</p> : null}
      {okMsg ? <p className="text-sm text-moss-700">{okMsg}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Creando…' : 'Crear código'}
      </Button>
      <p className="text-xs text-ink-800/55">
        Comisión por defecto: 10%. Si necesitás otra, escribinos.
      </p>
    </form>
  );
}
