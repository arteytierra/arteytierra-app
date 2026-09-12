import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Términos y condiciones de venta',
  description:
    'Condiciones de compra en Arte y Tierra: productos, precios, medios de pago, entrega, envíos, cambios, devoluciones y derecho de arrepentimiento.',
  alternates: { canonical: '/terminos' },
};

const UPDATED = '12 de septiembre de 2026';

export default function TerminosPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-bone-50">
        <section className="bg-ink-950 px-6 pt-28 pb-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
              Términos y condiciones de <em>venta</em>
            </h1>
            <p className="mt-5 font-sans text-sm text-bone-200/80">Última actualización: {UPDATED}</p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto prose prose-stone max-w-none prose-headings:font-display prose-a:text-moss-700">
            <div className="not-prose mb-10 rounded-lg border border-clay-300 bg-clay-100 p-5">
              <p className="font-sans text-sm text-ink-800">
                <strong>Borrador de preproducción.</strong> Este texto describe cómo funciona hoy la tienda, pero
                todavía no fue revisado por una persona con responsabilidad legal. Debe adecuarse a la razón social,
                el domicilio fiscal, la jurisdicción y la normativa aplicable antes de tomarse como definitivo.
              </p>
            </div>

            <p>
              Estas condiciones rigen las compras realizadas en <strong>arteytierra.org</strong>. Al confirmar un
              pedido, aceptás lo que sigue. Para el tratamiento de datos personales, ver la{' '}
              <Link href="/privacidad">Política de Privacidad</Link>.
            </p>

            <h2>1. Quién vende</h2>
            <p>
              Arte y Tierra, colectivo de bioconstrucción y hábitat regenerativo con sede en Tay Pichín, San Marcos
              Sierras, Córdoba, Argentina. Contacto:{' '}
              <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a> y WhatsApp{' '}
              <a href="https://wa.me/5493549431594">+54 9 3549 431594</a>.
            </p>

            <h2>2. Qué se vende</h2>
            <ul>
              <li><strong>Biocosmética</strong>: productos físicos de elaboración artesanal, que se envían.</li>
              <li><strong>Manuales y ebooks</strong>: bienes digitales, que se descargan.</li>
              <li><strong>Cursos</strong>: presenciales u online, según lo que indique cada ficha.</li>
              <li><strong>Estadías e inmersiones</strong>: cupos con fecha, sujetos a disponibilidad.</li>
            </ul>
            <p>
              Las fotografías son ilustrativas. Al ser productos artesanales, puede haber variaciones de color, aroma
              y textura entre lotes.
            </p>

            <h2>3. Precios y moneda</h2>
            <p>
              Los precios se muestran en pesos argentinos (ARS), salvo los productos indicados en dólares (USD). El
              precio vigente es el que figura al momento de confirmar el pedido. Los importes en ARS incluyen
              impuestos cuando corresponde.
            </p>

            <h2>4. Medios de pago</h2>
            <p>
              Se acepta <strong>Mercado Pago</strong> y <strong>Stripe</strong>. Mercado Pago opera únicamente en
              pesos: las compras en dólares se pagan con Stripe. Arte y Tierra no almacena números completos de
              tarjeta ni códigos de seguridad: esos datos los procesa el proveedor de pago que elijas, bajo sus
              propias condiciones.
            </p>
            <p>
              Un pedido se considera confirmado cuando el proveedor informa el pago como aprobado. Hasta entonces no
              hay reserva de stock ni de cupo.
            </p>

            <h2>5. Entrega</h2>
            <p>
              Los <strong>bienes digitales</strong> quedan disponibles en tu cuenta apenas se acredita el pago.
            </p>
            <p>
              Los <strong>productos físicos</strong> se despachan dentro de los días hábiles informados en la ficha o
              en el correo de confirmación. Los plazos del correo no dependen de nosotros. Es responsabilidad de quien
              compra que la dirección de entrega sea correcta y esté completa.
            </p>
            <p>
              Los <strong>cursos, estadías e inmersiones</strong> se prestan en la fecha publicada. Si una fecha se
              reprograma o se cancela por nuestra parte, se ofrece el cambio a otra fecha o la devolución total.
            </p>

            <h2>6. Derecho de arrepentimiento</h2>
            <p>
              Si comprás a distancia, tenés <strong>10 días corridos</strong> desde la entrega del producto o desde la
              celebración del contrato —lo que ocurra después— para arrepentirte sin expresar motivo y sin costo,
              conforme al artículo 34 de la Ley 24.240 de Defensa del Consumidor.
            </p>
            <p>
              Podés ejercerlo desde el <Link href="/arrepentimiento">botón de arrepentimiento</Link>, que está
              disponible en todo el sitio. El producto debe devolverse en el mismo estado en que se recibió.
            </p>
            <p>
              En los bienes digitales el derecho se ejerce mientras no hayas comenzado la descarga o el acceso al
              contenido. Se te avisa de esto antes de confirmar la compra.
            </p>

            <h2>7. Cambios y devoluciones</h2>
            <p>
              Si un producto llega dañado, incompleto o distinto al comprado, escribinos dentro de los 10 días de
              recibido con el número de pedido y fotos. Resolvemos con reposición o devolución del importe, a tu
              elección. La devolución se acredita por el mismo medio de pago.
            </p>

            <h2>8. Naturaleza de los productos de biocosmética</h2>
            <p>
              Son productos de cosmética natural de elaboración artesanal. No son medicamentos y no reemplazan
              tratamiento médico. Ante piel sensible o alergias conocidas, revisá los ingredientes de la ficha y probá
              primero en una zona pequeña.
            </p>

            <h2>9. Contenidos y propiedad intelectual</h2>
            <p>
              Los manuales, ebooks y materiales de curso son para uso personal de quien los compró. No se pueden
              redistribuir, revender ni publicar, en todo o en parte, sin autorización escrita.
            </p>

            <h2>10. Cuenta</h2>
            <p>
              Sos responsable de la información de tu cuenta y de mantener tu contraseña en reserva. Podés pedir la
              eliminación de tus datos desde <Link href="/eliminar-datos">Eliminar datos</Link>.
            </p>

            <h2>11. Cambios en estas condiciones</h2>
            <p>
              Podemos actualizar estos términos. La versión aplicable a tu compra es la vigente el día en que la
              hiciste. La fecha de la última actualización figura arriba.
            </p>

            <h2>12. Reclamos y jurisdicción</h2>
            <p>
              Antes que nada, escribinos: la mayoría de las cosas se resuelven hablando. También podés recurrir a la
              autoridad de aplicación de Defensa del Consumidor de tu jurisdicción, y al{' '}
              <a href="https://autogestion.produccion.gob.ar/consumidores" rel="noopener noreferrer" target="_blank">
                portal de Ventanilla Única Federal
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
