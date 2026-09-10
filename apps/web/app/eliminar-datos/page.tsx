import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Cómo eliminar tus datos',
  description:
    'Pasos para solicitar la eliminación de tus datos personales de Arte y Tierra, tengas o no una cuenta, incluidos los mensajes de WhatsApp, Instagram y Messenger.',
  alternates: { canonical: '/eliminar-datos' },
};

const UPDATED = '17 de agosto de 2026';

export default function EliminarDatosPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-bone-50">
        {/* Encabezado */}
        <section className="bg-ink-950 px-6 pt-28 pb-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
              Cómo eliminar <em>tus datos</em>
            </h1>
            <p className="mt-5 font-sans text-sm text-bone-200/80">Última actualización: {UPDATED}</p>
          </div>
        </section>

        {/* Cuerpo */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto prose prose-stone max-w-none prose-headings:font-display prose-a:text-moss-700">
            <p>
              Tus datos son tuyos. Podés pedir que los eliminemos en cualquier momento. Elegí la opción según cómo te
              hayas relacionado con nosotros.
            </p>

            <h2>Si tenés una cuenta en el sitio</h2>
            <ol>
              <li>
                Iniciá sesión y entrá a{' '}
                <Link href="/mi-cuenta/privacidad">Mi cuenta → Privacidad</Link>.
              </li>
              <li>
                Elegí <strong>Eliminar mi cuenta</strong> y confirmá con tu correo electrónico.
              </li>
              <li>
                La solicitud queda registrada con un período de gracia de 30 días (por si cambiás de idea). Pasado ese
                plazo, tu cuenta y tus datos personales se eliminan o se anonimizan.
              </li>
            </ol>
            <p>Desde esa misma página también podés descargar una copia de tus datos antes de borrarlos.</p>

            <h2>Si nos escribiste por WhatsApp, Instagram, Messenger o correo</h2>
            <p>Si no tenés cuenta y solo nos contactaste por mensajería, hacé lo siguiente:</p>
            <ol>
              <li>
                Escribinos a <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a> desde el mismo
                correo, o por el mismo número o usuario con el que nos hablaste.
              </li>
              <li>
                Pedinos que eliminemos tus datos e indicanos el canal (por ejemplo: <em>WhatsApp +54 9 …</em> o{' '}
                <em>Instagram @tuusuario</em>) para poder identificarte.
              </li>
              <li>Procesamos tu pedido y te confirmamos por el mismo canal en un plazo máximo de 30 días.</li>
            </ol>

            <h2>Qué eliminamos</h2>
            <p>
              Eliminamos tus datos de contacto y el historial de tus conversaciones en nuestro sistema. Solo podemos
              conservar la información mínima que exige la ley (por ejemplo, registros contables de una compra), y en ese
              caso la guardamos de forma anonimizada.
            </p>

            <h2>¿Dudas?</h2>
            <p>
              Si necesitás ayuda con tu solicitud, escribinos a{' '}
              <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a> y lo resolvemos juntos. 🌱
            </p>
            <p>
              Podés leer también nuestra <Link href="/privacidad">Política de Privacidad</Link>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
