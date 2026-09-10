import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description:
    'Cómo Arte y Tierra recopila, usa, comparte y protege tus datos personales, incluidos los mensajes que nos enviás por WhatsApp, Instagram y Messenger.',
  alternates: { canonical: '/privacidad' },
};

const UPDATED = '17 de agosto de 2026';

export default function PrivacidadPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-bone-50">
        {/* Encabezado */}
        <section className="bg-ink-950 px-6 pt-28 pb-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
              Política de <em>Privacidad</em>
            </h1>
            <p className="mt-5 font-sans text-sm text-bone-200/80">Última actualización: {UPDATED}</p>
          </div>
        </section>

        {/* Cuerpo */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto prose prose-stone max-w-none prose-headings:font-display prose-a:text-moss-700">
            <p>
              En <strong>Arte y Tierra</strong> —colectivo de bioconstrucción y hábitat regenerativo con sede en Tay
              Pichín, San Marcos Sierras, Córdoba, Argentina— cuidamos tu información con el mismo respeto con el que
              cuidamos la tierra. Esta política explica qué datos recopilamos, para qué los usamos, con quién los
              compartimos y qué derechos tenés sobre ellos.
            </p>

            <h2>Quiénes somos</h2>
            <p>
              El responsable del tratamiento de tus datos es Arte y Tierra. Podés contactarnos por cualquier tema de
              privacidad escribiendo a <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a> o por
              WhatsApp al <a href="https://wa.me/5493549431594">+54 9 3549 431594</a>.
            </p>

            <h2>Qué datos recopilamos</h2>
            <ul>
              <li>
                <strong>Datos de contacto:</strong> nombre, correo electrónico, número de teléfono y usuario de
                Instagram o Facebook, según cómo nos escribas.
              </li>
              <li>
                <strong>Mensajes:</strong> el contenido de las conversaciones que mantenés con nosotros por WhatsApp,
                Instagram, Messenger, correo o los formularios del sitio.
              </li>
              <li>
                <strong>Datos de cuenta:</strong> si te registrás, tu correo y las preferencias de tu perfil.
              </li>
              <li>
                <strong>Datos de compras e inscripciones:</strong> cursos, reservas, pedidos y comprobantes de pago
                (los pagos los procesan plataformas externas; ver más abajo).
              </li>
              <li>
                <strong>Datos técnicos:</strong> información del dispositivo, páginas visitadas y cookies, para que el
                sitio funcione y para medir nuestras campañas.
              </li>
            </ul>

            <h2>Cómo los recopilamos</h2>
            <p>
              Recibimos tus datos cuando completás un formulario, te registrás, hacés una compra, te suscribís al
              newsletter o nos escribís por alguno de nuestros canales de mensajería (WhatsApp, Instagram o Messenger),
              que funcionan sobre las plataformas de Meta.
            </p>

            <h2>Atención por WhatsApp, Instagram y Messenger</h2>
            <p>
              Usamos WhatsApp Business, Instagram y Messenger para responder tus consultas. Cuando nos escribís por esos
              canales, recibimos tu mensaje y los datos básicos que la plataforma nos comparte (por ejemplo, tu nombre de
              perfil y tu identificador). Para agilizar la primera respuesta puede atenderte un{' '}
              <strong>asistente automatizado</strong>; en cualquier momento podés pedir hablar con una persona del
              equipo. Guardamos el historial de la conversación para darte seguimiento y mejorar la atención. El uso de
              esas plataformas también se rige por las políticas de privacidad de Meta.
            </p>

            <h2>Para qué usamos tus datos</h2>
            <ul>
              <li>Responder tus consultas y darte seguimiento.</li>
              <li>Gestionar tus inscripciones, compras, reservas y el acceso a los materiales.</li>
              <li>Enviarte información que pediste o a la que te suscribiste (podés darte de baja cuando quieras).</li>
              <li>Cumplir obligaciones legales y contables.</li>
              <li>Entender y mejorar nuestras propuestas y campañas.</li>
            </ul>

            <h2>Con quién los compartimos</h2>
            <p>
              No vendemos tus datos. Los compartimos únicamente con proveedores que nos ayudan a prestar el servicio, y
              solo con lo necesario:
            </p>
            <ul>
              <li><strong>Meta</strong> (WhatsApp, Instagram, Messenger) — canales de mensajería y medición de campañas.</li>
              <li><strong>Procesadores de pago</strong> (Mercado Pago, Stripe, PayPal) — para cobrar de forma segura.</li>
              <li><strong>Proveedores de envío de correo</strong> — para enviarte confirmaciones y novedades.</li>
              <li><strong>Infraestructura y base de datos</strong> — el hosting del sitio y el almacenamiento seguro de la información.</li>
            </ul>
            <p>También podemos compartir datos si nos lo exige la ley o una autoridad competente.</p>

            <h2>Cuánto tiempo los conservamos</h2>
            <p>
              Conservamos tus datos mientras exista una relación con vos o mientras sea necesario para las finalidades de
              arriba. Algunos registros (por ejemplo, los contables) se guardan por el plazo que exige la ley, y luego se
              eliminan o se anonimizan.
            </p>

            <h2>Tus derechos</h2>
            <p>
              Podés acceder a tus datos, corregirlos, pedir una copia o solicitar que los eliminemos. Para hacerlo:
            </p>
            <ul>
              <li>
                Si tenés cuenta, entrá a{' '}
                <Link href="/mi-cuenta/privacidad">Mi cuenta → Privacidad</Link> para exportar o eliminar tus datos.
              </li>
              <li>
                Si nos escribiste solo por WhatsApp, Instagram, Messenger o correo, seguí los pasos de{' '}
                <Link href="/eliminar-datos">Cómo eliminar tus datos</Link>.
              </li>
              <li>
                O escribinos a <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a> y te ayudamos.
              </li>
            </ul>

            <h2>Cookies y medición</h2>
            <p>
              Usamos cookies para que el sitio funcione y, con tu consentimiento, para medir el rendimiento de nuestras
              campañas (incluidas herramientas de medición de Meta). Podés ajustar tus preferencias desde el aviso de
              cookies del sitio.
            </p>

            <h2>Menores de edad</h2>
            <p>
              Nuestros servicios están dirigidos a personas mayores de edad. No recopilamos de forma intencional datos de
              menores sin el consentimiento de quienes ejercen su cuidado.
            </p>

            <h2>Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política cuando cambien nuestras prácticas o la normativa. Publicaremos la nueva
              versión en esta misma página con su fecha de actualización.
            </p>

            <h2>Contacto</h2>
            <p>
              Ante cualquier duda sobre tu privacidad, escribinos a{' '}
              <a href="mailto:info.arteytierra@gmail.com">info.arteytierra@gmail.com</a>. Estamos para ayudarte. 🌱
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
