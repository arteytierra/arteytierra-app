import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ArrepentimientoForm } from '@/components/legal/ArrepentimientoForm';

export const metadata: Metadata = {
  title: 'Botón de arrepentimiento',
  description:
    'Cancelá una compra hecha a distancia dentro de los 10 días corridos, sin expresar motivo y sin costo, como establece el artículo 34 de la Ley 24.240.',
  alternates: { canonical: '/arrepentimiento' },
};

export default function ArrepentimientoPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-bone-50">
        <section className="bg-ink-950 px-6 pt-28 pb-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
              Botón de <em>arrepentimiento</em>
            </h1>
            <p className="mt-5 font-sans text-sm text-bone-200/80">
              Cancelar una compra hecha a distancia, sin dar explicaciones y sin costo.
            </p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-stone max-w-none prose-headings:font-display prose-a:text-moss-700">
              <p>
                Si compraste por internet, por teléfono o por mensaje, tenés <strong>10 días corridos</strong> para
                arrepentirte. El plazo corre desde que recibís el producto o desde que se cierra el contrato, lo que
                pase después. No hace falta que expliques por qué y no tiene ningún costo para vos. Es el artículo 34
                de la Ley 24.240 de Defensa del Consumidor.
              </p>
              <p>
                Completá el formulario y te confirmamos por correo. Si ya recibiste un producto físico, te decimos
                cómo devolverlo; tiene que estar en el mismo estado en que llegó. La devolución del dinero se hace por
                el mismo medio con el que pagaste.
              </p>
              <p className="text-sm">
                También podés escribirnos a{' '}
                <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a> o por WhatsApp al{' '}
                <a href="https://wa.me/5493549431594">+54 9 3549 431594</a>. Las condiciones completas están en los{' '}
                <Link href="/terminos">términos de venta</Link>.
              </p>
            </div>

            <div className="mt-10">
              <ArrepentimientoForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
