import IdentificacionProveedor from '@/components/IdentificacionProveedor';
import { PROVEEDOR } from '@/lib/titular';

export const metadata = {
  title: 'Botón de arrepentimiento',
  description:
    'Revocá la contratación de acequia dentro de los diez días corridos, sin expresar motivo y sin costo.',
};

/**
 * Botón de arrepentimiento — Resolución 424/2020 de la Secretaría de Comercio
 * Interior, que reglamenta el art. 34 de la Ley 24.240.
 *
 * La norma no pide una cláusula adentro de los Términos: pide un enlace
 * VISIBLE y DESTACADO en la primera pantalla del sitio que lleve a un lugar
 * donde el consumidor pueda revocar sin trámite. Por eso esta página es
 * pública (no exige sesión) y el pedido se puede mandar por correo: alguien
 * que no logra entrar a su cuenta tiene que poder arrepentirse igual.
 */
const ASUNTO = 'Botón de arrepentimiento — revocación de la contratación';

const CUERPO = [
  'Quiero revocar la contratación de acequia dentro del plazo de diez (10) días corridos previsto en el art. 34 de la Ley 24.240.',
  '',
  'Correo de mi cuenta: ',
  'Plan contratado: ',
  'Fecha de contratación: ',
  '',
  'Pido la baja de la suscripción y la devolución del importe abonado por el mismo medio de pago.',
].join('\n');

export default function ArrepentimientoPage() {
  const mailto = `mailto:${PROVEEDOR.email}?subject=${encodeURIComponent(ASUNTO)}&body=${encodeURIComponent(CUERPO)}`;

  return (
    <div className="min-h-screen bg-bone-50 px-4 py-12">
      <article className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center">
          <p className="eyebrow mb-2">Arte y Tierra</p>
          <h1 className="font-display text-3xl text-ink-950">
            Botón de arrepentimiento
          </h1>
          <p className="mt-2 text-sm text-ink-700/70">
            Art. 34 de la Ley 24.240 · Resolución 424/2020
          </p>
        </header>

        <div className="space-y-8 rounded-2xl border border-bone-200 bg-white p-6 shadow-paper sm:p-8">
          <section className="space-y-3">
            <p className="text-sm leading-relaxed text-ink-700">
              Si contrataste un plan pago de <strong>acequia</strong> como
              consumidor, podés <strong>revocar la contratación dentro de los
              diez (10) días corridos</strong> contados desde que la hiciste,{' '}
              <strong>sin expresar motivo y sin costo alguno</strong>. Te
              devolvemos el importe por el mismo medio de pago con el que
              pagaste.
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              Pasados esos diez días también podés dar de baja la suscripción
              cuando quieras: no hay permanencia. En ese caso no hay devolución
              del período ya abonado, el acceso sigue hasta que termine y
              después tu cuenta vuelve al plan Semilla, con tus proyectos
              intactos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl text-ink-950">
              Cómo lo hacés
            </h2>
            <a
              href={mailto}
              className="block rounded-xl bg-moss-700 px-5 py-4 text-center text-base font-medium text-bone-50 transition-colors hover:bg-moss-800"
            >
              Quiero arrepentirme
            </a>
            <p className="text-sm leading-relaxed text-ink-700">
              El botón te abre un correo ya redactado a{' '}
              <a
                href={`mailto:${PROVEEDOR.email}`}
                className="text-moss-700 underline"
              >
                {PROVEEDOR.email}
              </a>
              . Mandalo desde la casilla de tu cuenta y listo: no hace falta
              llamar, ni justificar, ni completar ningún otro trámite. Si
              preferís, escribinos vos mismo a esa dirección diciendo que te
              arrepentís; alcanza con eso.
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              Para <strong>cancelar la renovación</strong> sin pedir devolución,
              lo más rápido es hacerlo vos en{' '}
              <a href="/cuenta" className="text-moss-700 underline">
                tu cuenta
              </a>
              , en un clic.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              Qué pasa después
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-700">
              <li>Te confirmamos la recepción del pedido por correo.</li>
              <li>
                Damos de baja la suscripción y pedimos la devolución a Mercado
                Pago o a PayPal, según cómo hayas pagado. El plazo de
                acreditación lo pone esa plataforma, no nosotros.
              </li>
              <li>
                Tu cuenta vuelve al plan Semilla y tus proyectos siguen ahí. Si
                además querés que borremos tus datos, decínoslo en el mismo
                correo.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              Quién recibe el pedido
            </h2>
            <IdentificacionProveedor />
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-ink-700/60">
          Arte y Tierra · arteytierra.org ·{' '}
          <a href="/terminos" className="underline hover:text-moss-700">
            Términos de Servicio
          </a>{' '}
          ·{' '}
          <a href="/privacidad" className="underline hover:text-moss-700">
            Política de Privacidad
          </a>
        </p>
      </article>
    </div>
  );
}
