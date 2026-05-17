'use client';

import { useState } from 'react';
import { Button, Field, Input, useToast } from '@arteytierra/ui';

interface Props {
  defaultEmail?: string;
  defaultName?: string;
  currency: string;
  recommendedProvider: 'stripe' | 'mercadopago';
}

export function CheckoutForm({ defaultEmail, defaultName, currency, recommendedProvider }: Props) {
  const [provider, setProvider] = useState<'stripe' | 'mercadopago'>(recommendedProvider);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          billing: {
            fullName: form.get('fullName'),
            email: form.get('email'),
            phone: form.get('phone'),
            country: form.get('country'),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) throw new Error(data.error ?? 'Error');
      window.location.href = data.redirectUrl;
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'No pudimos iniciar el pago');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section>
        <h2 className="font-display text-2xl mb-6">Datos de facturación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" required>
            {(id) => (
              <Input id={id} name="fullName" defaultValue={defaultName} autoComplete="name" required />
            )}
          </Field>
          <Field label="Email" required>
            {(id) => (
              <Input id={id} name="email" type="email" defaultValue={defaultEmail} autoComplete="email" required />
            )}
          </Field>
          <Field label="Teléfono" hint="Opcional">
            {(id) => <Input id={id} name="phone" autoComplete="tel" />}
          </Field>
          <Field label="País" hint="Opcional">
            {(id) => <Input id={id} name="country" defaultValue="Argentina" autoComplete="country-name" />}
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-6">Método de pago</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProviderOption
            id="mp"
            checked={provider === 'mercadopago'}
            onChange={() => setProvider('mercadopago')}
            title="Mercado Pago"
            subtitle="Tarjeta, transferencia, Rapipago. Ideal para Argentina."
            recommended={recommendedProvider === 'mercadopago'}
          />
          <ProviderOption
            id="stripe"
            checked={provider === 'stripe'}
            onChange={() => setProvider('stripe')}
            title="Stripe"
            subtitle="Tarjeta internacional, USD/EUR. Ideal para fuera de LATAM."
            recommended={recommendedProvider === 'stripe'}
          />
        </div>
        <p className="mt-3 text-xs text-ink-800/55">
          La moneda del carrito es {currency}. Tu pago se procesa en esa moneda.
        </p>
      </section>

      <Button type="submit" variant="moss" size="xl" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Redirigiendo…' : 'Pagar ahora'}
      </Button>
    </form>
  );
}

function ProviderOption({
  id, checked, onChange, title, subtitle, recommended,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
  recommended?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={
        'flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ' +
        (checked ? 'border-moss-700 bg-moss-100/30' : 'border-ink-950/15 hover:bg-bone-100')
      }
    >
      <input
        id={id}
        type="radio"
        name="provider"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 text-moss-700 focus:ring-moss-700/30"
      />
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {recommended && (
            <span className="text-[10px] uppercase tracking-wider rounded-full bg-moss-700 text-bone-50 px-2 py-0.5">
              Recomendado
            </span>
          )}
        </div>
        <p className="text-xs text-ink-800/65 mt-1">{subtitle}</p>
      </div>
    </label>
  );
}
