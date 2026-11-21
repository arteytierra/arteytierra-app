import IdentificacionProveedor from '@/components/IdentificacionProveedor';
import { MARCA, PROVEEDOR, TITULAR_PI } from '@/lib/titular';

export const metadata = { title: 'Términos de Servicio' };

const ACTUALIZADO = '18 de noviembre de 2026';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-bone-50 px-4 py-12">
      <article className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center">
          <p className="eyebrow mb-2">Arte y Tierra</p>
          <h1 className="font-display text-3xl text-ink-950">Términos de Servicio</h1>
          <p className="mt-2 text-sm text-ink-700/70">
            Última actualización: {ACTUALIZADO}
          </p>
        </header>

        <div className="space-y-8 rounded-2xl border border-bone-200 bg-white p-6 shadow-paper sm:p-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              1. Quién presta el Servicio, y aceptación
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              <strong>acequia</strong> (el «Servicio») es prestado por:
            </p>
            <IdentificacionProveedor />
            <p className="text-sm leading-relaxed text-ink-700">
              «{PROVEEDOR.nombreComercial}» es el nombre comercial con el que se
              conoce al estudio; quien contrata con vos y responde por el Servicio es
              {PROVEEDOR.forma === 'sociedad' ? ' la sociedad' : ' la persona'}{' '}
              identificada arriba. Cuando estos Términos dicen «nosotros», se
              refieren a ella.
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              Al crear una cuenta o usar el Servicio aceptás estos Términos de
              Servicio. Si no estás de acuerdo, no uses el Servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">2. El Servicio</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio es una herramienta web de análisis catastral y de terreno
              que permite trazar mojones, medir superficie y perímetro, calcular
              rumbos y generar análisis de diseño. Se ofrece en distintos planes,
              gratuitos y pagos, según se detalla en la página de planes. Podemos
              modificar, suspender o discontinuar funciones en cualquier momento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              3. Propiedad intelectual
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio, su código, diseño, interfaz, algoritmos, cálculos y bases
              de conocimiento propias son obra de{' '}
              <strong>{TITULAR_PI.nombre}</strong>, su único titular, y están
              protegidos por la Ley 11.723 de Propiedad Intelectual.{' '}
              <strong>«acequia»</strong> es una marca registrada ante el Instituto
              Nacional de la Propiedad Industrial (INPI) bajo los registros N.º{' '}
              {MARCA.registros.join(' y N.º ')}, clase {MARCA.clase}, de la que
              es titular la misma persona.
              {TITULAR_PI.explotaBajoLicencia
                ? ' El Servicio se explota comercialmente bajo licencia exclusiva de su titular.'
                : ''}
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              No se te transfiere ningún derecho de propiedad: sólo recibís una
              licencia limitada de uso según estos Términos. Los datos y contenidos
              que cargás vos no están comprendidos acá: son tuyos, y de eso se ocupa
              el punto 6.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              4. Licencia de uso
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Te otorgamos una licencia personal, limitada, no exclusiva,
              intransferible y revocable para usar el Servicio con fines propios,
              conforme al plan que tengas activo. Esta licencia no incluye ningún
              derecho a copiar, distribuir, sublicenciar ni explotar comercialmente
              el Servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">5. Usos prohibidos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              No está permitido, ni por vos ni por terceros que actúen en tu nombre:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-700">
              <li>
                Realizar ingeniería inversa, descompilar, desensamblar o intentar
                obtener el código fuente, la lógica o los algoritmos del Servicio.
              </li>
              <li>
                Copiar, reproducir, replicar, modificar o crear obras derivadas del
                Servicio, su interfaz, su diseño o cualquiera de sus componentes.
              </li>
              <li>
                Extraer datos de forma automatizada (scraping, crawling, bots,
                scripts) o acceder al Servicio por medios distintos a la interfaz
                provista.
              </li>
              <li>
                Revender, alquilar, sublicenciar, redistribuir o explotar
                comercialmente el Servicio o su contenido sin autorización escrita.
              </li>
              <li>
                Eludir, desactivar o interferir con medidas de seguridad, límites de
                plan, marcas de agua o controles de acceso.
              </li>
              <li>
                Usar el Servicio para desarrollar un producto o servicio competidor.
              </li>
              <li>
                Sobrecargar la infraestructura o intentar acceder a cuentas o datos
                de otros usuarios.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              6. Cuentas y responsabilidad
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Sos responsable de la información que cargás, de mantener la
              confidencialidad de tus credenciales y de toda la actividad de tu
              cuenta. Los datos y análisis que generás son tuyos; nos autorizás a
              procesarlos para prestarte el Servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">7. Planes y pagos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Los planes pagos se facturan de forma recurrente (mensual o anual)
              según el plan elegido, a través de los medios de pago habilitados
              (Mercado Pago para Argentina, PayPal para el resto del mundo). Podés
              cancelar la renovación en cualquier momento; el acceso continúa hasta el
              fin del período ya abonado. Los precios pueden actualizarse con aviso
              previo.
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              <strong>Derecho de revocación.</strong> Si contratás como consumidor,
              tenés derecho a revocar la contratación dentro de los{' '}
              <strong>diez (10) días corridos</strong> contados desde la
              contratación, sin expresar motivo y sin costo alguno (arts. 34 y
              siguientes de la Ley 24.240). Para ejercerlo alcanza con escribir a{' '}
              <a
                href={`mailto:${PROVEEDOR.email}`}
                className="text-moss-700 underline"
              >
                {PROVEEDOR.email}
              </a>{' '}
              desde el correo de tu cuenta, o usar el{' '}
              <a href="/arrepentimiento" className="text-moss-700 underline">
                botón de arrepentimiento
              </a>
              : devolvemos el importe por el mismo medio de pago. La baja de la
              suscripción se puede pedir por la misma vía, sin trámite adicional
              ni necesidad de justificar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              8. Sin garantías y limitación de responsabilidad
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio se provee «tal cual», sin garantías de exactitud. Los
              análisis, mediciones y cálculos son orientativos y no reemplazan un
              relevamiento profesional, una mensura oficial ni asesoramiento técnico o
              legal. En la máxima medida que permita la ley aplicable, no
              responderemos por decisiones tomadas en base a la información del
              Servicio ni por daños indirectos derivados de su uso.
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              Nada de este punto limita los derechos que te reconoce la Ley 24.240 de
              Defensa del Consumidor si contratás como consumidor: las cláusulas que
              desnaturalicen las obligaciones o limiten la responsabilidad por daños
              son inválidas, y acá se tienen por no escritas en lo que a vos respecta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">9. Cambios</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Podemos actualizar estos Términos. Si el cambio es significativo, lo
              avisaremos por la plataforma o por correo. El uso continuado del
              Servicio implica la aceptación de la versión vigente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              10. Ley aplicable y jurisdicción
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Estos Términos se rigen por las leyes de la República Argentina. Si
              contratás como consumidor, es competente el tribunal que corresponda a
              tu domicilio, y podés recurrir además al Servicio de Conciliación
              Previa en las Relaciones de Consumo (COPREC) y a la autoridad de
              defensa del consumidor de tu jurisdicción. En los demás casos, las
              partes se someten a los tribunales ordinarios de la Provincia de
              Córdoba.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">11. Contacto</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Por cualquier consulta sobre estos Términos, escribinos a{' '}
              <a
                href="mailto:info@arteytierra.org"
                className="text-moss-700 underline"
              >
                info@arteytierra.org
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-ink-700/60">
          Arte y Tierra · arteytierra.org ·{' '}
          <a href="/privacidad" className="underline hover:text-moss-700">Política de Privacidad</a> ·{' '}
          <a href="/arrepentimiento" className="underline hover:text-moss-700">Botón de arrepentimiento</a>
        </p>
      </article>
    </div>
  );
}
