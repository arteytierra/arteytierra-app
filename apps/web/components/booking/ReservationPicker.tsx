'use client';

import { useState, useTransition } from 'react';
import { Button, useToast, formatMoney } from '@arteytierra/ui';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { addToCart } from '@/lib/commerce/actions';
import { useCartUI } from '@/components/shop/CartProvider';

interface Props {
  productSlug: string;
  pricePerNightCents: number;
  currency: string;
  blockedDates: string[];
  kind: 'lodging' | 'consult' | 'immersion';
  capacity?: number | null;
}

export function ReservationPicker({
  productSlug,
  pricePerNightCents,
  currency,
  blockedDates,
  kind,
  capacity,
}: Props) {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [pending, startTrans] = useTransition();
  const { toast } = useToast();
  const { show } = useCartUI();

  const nights = start && end
    ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000))
    : 0;
  const totalCents = kind === 'lodging' ? pricePerNightCents * nights : pricePerNightCents;

  function submit() {
    if (!start || !end) {
      toast('error', 'Elegí las fechas.');
      return;
    }
    const fd = new FormData();
    fd.set('productSlug', productSlug);
    fd.set('qty', '1');
    fd.set('startsAt', start.toISOString());
    fd.set('endsAt', end.toISOString());
    fd.set('guests', String(guests));

    startTrans(async () => {
      const res = await addToCart({}, fd);
      if (res.error) {
        toast('error', res.error);
      } else {
        show();
      }
    });
  }

  return (
    <div className="space-y-5">
      <AvailabilityCalendar
        blockedDates={blockedDates}
        mode={kind === 'lodging' ? 'range' : 'single'}
        onChange={({ start, end }) => { setStart(start); setEnd(end); }}
        minNights={kind === 'lodging' ? 2 : 1}
      />

      {capacity && (
        <div>
          <label className="block text-sm font-medium mb-2">Huéspedes</label>
          <div className="inline-flex items-center gap-1 rounded-full border border-ink-950/15">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="px-3 py-2 hover:bg-bone-100 rounded-l-full"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(Math.min(capacity, guests + 1))}
              className="px-3 py-2 hover:bg-bone-100 rounded-r-full"
            >
              +
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-800/55">Capacidad máxima: {capacity}</p>
        </div>
      )}

      {start && end && (
        <div className="rounded-xl bg-bone-100 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-800/75">
              {start.toLocaleDateString('es-AR')} → {end.toLocaleDateString('es-AR')}
            </span>
            {kind === 'lodging' && (
              <span className="text-ink-800/55">{nights} noches</span>
            )}
          </div>
          <div className="flex justify-between font-display text-xl">
            <span>Total</span>
            <span>{formatMoney(totalCents, currency as never)}</span>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="moss"
        size="lg"
        disabled={pending || !start || !end}
        onClick={submit}
        className="w-full"
      >
        {pending ? 'Reservando…' : 'Reservar'}
      </Button>
    </div>
  );
}
