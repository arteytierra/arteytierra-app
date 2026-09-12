'use client';

import { useState } from 'react';
import { ACEQUIA_TRIAL_DAYS } from '@arteytierra/config/acequia';
import { darDeBajaSuscripcion } from '@/lib/suscribir';
import type { SuscripcionActual } from '@/lib/auth/plan';
import { estadoEfectivo, rotuloEstado, type EstadoEfectivo } from '@/lib/suscripcionEstado';

/**
 * Estado real de la suscripción y baja en un clic.
 *
 * La baja cancela la renovación en Mercado Pago o PayPal, no sólo en nuestra
 * base: por eso hay una confirmación antes, y el resultado dice si se cobró algo.
 */

const FECHA = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

function fecha(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : FECHA.format(d);
}

const PROVEEDOR: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  paypal: 'PayPal',
  stripe: 'Stripe',
};

export default function SuscripcionPanel({ suscripcion }: { suscripcion: SuscripcionActual }) {
  // El estado que se muestra es el efectivo, no el crudo de la fila: una
  // suscripción `activa` con la vigencia pasada ya no da acceso, y decía "Activa".
  const [estado, setEstado] = useState<EstadoEfectivo>(() => estadoEfectivo(suscripcion));
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  const enPrueba = estado === 'prueba';
  const yaDeBaja = estado === 'cancelada' || suscripcion.seDaDeBajaAlFinal;
  // Los accesos otorgados a mano no tienen cobro que dar de baja.
  const esManual = suscripcion.provider === 'manual' || suscripcion.provider === null;

  async function confirmarBaja() {
    setEnviando(true);
    setError(null);
    try {
      const r = await darDeBajaSuscripcion();
      setEstado('cancelada');
      setConfirmando(false);
      setResultado(
        r.enPrueba
          ? 'Listo. Cancelaste durante la prueba, así que no se te cobró nada.'
          : r.accesoHasta
            ? `Listo. No se renueva más, y tenés acceso hasta el ${fecha(r.accesoHasta)}.`
            : 'Listo. La suscripción quedó dada de baja.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos dar de baja la suscripción.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="border-bone-200 mt-5 rounded-2xl border bg-white p-6 md:p-8">
      <p className="eyebrow">Suscripción</p>
      <h2 className="font-display text-ink-950 mt-3 text-2xl">
        {enPrueba ? `Estás en la prueba de ${ACEQUIA_TRIAL_DAYS} días` : 'Tu suscripción'}
      </h2>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-ink-700/50 text-xs uppercase tracking-wider">Estado</dt>
          <dd className="text-ink-950 mt-1 text-sm font-semibold">
            {rotuloEstado(estado, suscripcion.seDaDeBajaAlFinal)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-700/50 text-xs uppercase tracking-wider">
            {enPrueba ? 'Primer cobro' : 'Próximo cobro'}
          </dt>
          <dd className="text-ink-950 mt-1 text-sm font-semibold">
            {estado === 'cancelada'
              ? 'No hay más cobros'
              : estado === 'vencida'
                ? 'Sin cobro programado'
                : fecha(enPrueba ? suscripcion.finDePrueba : suscripcion.vigenteHasta)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-700/50 text-xs uppercase tracking-wider">Medio de pago</dt>
          <dd className="text-ink-950 mt-1 text-sm font-semibold">
            {esManual ? 'Sin cobro' : PROVEEDOR[suscripcion.provider!] ?? suscripcion.provider}
          </dd>
        </div>
      </dl>

      {enPrueba && (
        <p className="text-ink-700/70 mt-4 text-sm leading-relaxed">
          Si das de baja antes del {fecha(suscripcion.finDePrueba)}, no se te cobra nada.
        </p>
      )}

      {resultado && (
        <p className="border-moss-700 text-ink-950 mt-5 rounded-xl border bg-white p-4 text-sm">{resultado}</p>
      )}
      {error && (
        <p className="border-clay-500 text-clay-700 mt-5 rounded-xl border p-4 text-sm">{error}</p>
      )}

      {esManual && !yaDeBaja && (
        <p className="text-ink-700/70 mt-4 text-sm leading-relaxed">
          Este acceso fue otorgado a mano y no tiene ningún cobro asociado, así que no hay nada
          que dar de baja. Si querés cerrarlo, escribinos.
        </p>
      )}

      {!esManual && !yaDeBaja && !resultado && (
        <div className="mt-6">
          {!confirmando ? (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="border-bone-200 text-clay-700 hover:border-clay-500 rounded-lg border px-5 py-3 text-sm font-semibold"
            >
              Dar de baja la suscripción
            </button>
          ) : (
            <div className="border-sun-300 bg-sun-50 rounded-xl border p-4">
              <p className="text-ink-950 text-sm font-semibold">
                {enPrueba
                  ? '¿Damos de baja? No se te va a cobrar nada.'
                  : '¿Damos de baja la renovación?'}
              </p>
              <p className="text-ink-700/70 mt-1 text-sm leading-relaxed">
                {enPrueba
                  ? 'Perdés el acceso al plan y volvés a Semilla.'
                  : 'No se cobra más. Conservás el acceso hasta que termine el período que ya pagaste.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={confirmarBaja}
                  disabled={enviando}
                  className="bg-clay-700 hover:bg-clay-900 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {enviando ? 'Dando de baja…' : 'Sí, dar de baja'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  disabled={enviando}
                  className="text-ink-700/70 px-2 py-2.5 text-sm font-semibold hover:underline"
                >
                  Mejor no
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-ink-700/60 mt-5 text-xs leading-relaxed">
        Podés arrepentirte dentro de los 10 días de contratado y pedir el reintegro, según el
        artículo 34 de la Ley 24.240.
      </p>
    </section>
  );
}
